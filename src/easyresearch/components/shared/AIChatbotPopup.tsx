import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, Minimize2, CheckCircle2, Mic, MicOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { normalizeLegacyQuestionType } from '../../constants/questionTypes';
import { bToast } from '../../utils/bilingualToast';
import { useI18n } from '../../hooks/useI18n';

interface AIChatbotPopupProps {
  questionnaireTitle: string;
  questions: any[];
  responses: Record<string, any>;
  onResponse: (questionId: string, value: any) => void;
  primaryColor?: string;
  compact?: boolean;
  /** If true, chatbot opens immediately when rendered */
  initialOpen?: boolean;
}

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-survey-support`;

// Voice input button using browser Web Speech API / 使用浏览器语音识别的语音输入按钮
const VoiceInputButton: React.FC<{ onTranscript: (text: string) => void; primaryColor: string }> = ({ onTranscript, primaryColor }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      bToast.error('Speech recognition not supported in this browser', '此浏览器不支持语音识别');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) onTranscript(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, onTranscript]);

  return (
    <button onClick={toggleRecording} className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-100 text-red-500 animate-pulse' : 'text-stone-400 hover:text-stone-600'}`} title="Voice input">
      {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
    </button>
  );
};

const AIChatbotPopup: React.FC<AIChatbotPopupProps> = ({
  questionnaireTitle, questions, responses, onResponse, primaryColor = '#10b981', compact = false, initialOpen = false,
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; fills?: any[] }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter to response-collecting questions only
  const responseQuestions = questions.filter(q => {
    const t = normalizeLegacyQuestionType(q.question_type);
    return !['section_header', 'text_block', 'instruction', 'divider', 'image_block', 'video_block', 'audio_block', 'embed_block'].includes(t);
  });

  const unansweredRequired = responseQuestions.filter(q => {
    const isReq = q.required || q.response_required === 'force' || q.question_config?.response_required === 'force';
    const hasAns = responses[q.id] !== undefined && responses[q.id] !== null && responses[q.id] !== '';
    return isReq && !hasAns;
  });

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      else headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;

      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'questionnaire_chatbot',
          messages: updatedMessages,
          questionnaire: {
            title: questionnaireTitle,
            questions: responseQuestions.map(q => ({
              id: q.id,
              question_type: normalizeLegacyQuestionType(q.question_type),
              question_text: q.question_text,
              required: q.required || q.response_required === 'force',
              options: q.options?.map((o: any) => typeof o === 'string' ? { option_text: o } : o),
              question_config: q.question_config,
            })),
            responses,
          },
        }),
      });

      if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
      const result = await res.json();

      // Process fill commands
      const fills = result.fillCommands || [];
      if (fills.length > 0) {
        fills.forEach((fill: any) => {
          if (fill.question_id && fill.value !== undefined) {
            // Parse value for specific question types
            const q = responseQuestions.find(rq => rq.id === fill.question_id);
            if (q) {
              const qType = normalizeLegacyQuestionType(q.question_type);
              let parsedValue = fill.value;
              
              if (['likert_scale', 'bipolar_scale', 'nps', 'rating', 'slider', 'number'].includes(qType)) {
                const num = Number(parsedValue);
                if (!isNaN(num)) parsedValue = num;
              } else if (['multiple_choice', 'checkbox_group'].includes(qType) && typeof parsedValue === 'string') {
                try { parsedValue = JSON.parse(parsedValue); } catch { /* keep as-is */ }
              } else if (qType === 'single_choice' || qType === 'dropdown') {
                // Match exact option
                const match = q.options?.find((o: any) => {
                  const optText = typeof o === 'string' ? o : o.option_text || o.text;
                  return optText?.toLowerCase().trim() === String(parsedValue).toLowerCase().trim();
                });
                if (match) {
                  parsedValue = typeof match === 'string' ? match : match.id || match.option_text;
                }
              }
              
              onResponse(fill.question_id, parsedValue);
            }
          }
        });
        bToast.success(t('ai.filledAnswers').replace('{n}', String(fills.length)), t('ai.filledAnswers').replace('{n}', String(fills.length)));
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response || t('ai.couldntProcess'),
        fills: fills.length > 0 ? fills : undefined,
      }]);
    } catch (err: any) {
      bToast.error(err.message || t('ai.requestFailed'), err.message || t('ai.requestFailed'));
      setMessages(prev => [...prev, { role: 'assistant', content: t('ai.errorTryAgain') }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, questionnaireTitle, responseQuestions, responses, onResponse]);

  const answeredCount = responseQuestions.filter(q => {
    const v = responses[q.id];
    return v !== undefined && v !== null && v !== '';
  }).length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-[13px] font-medium hover:scale-105 transition-all"
        style={{ backgroundColor: primaryColor }}
      >
        <Bot size={18} />
        <span className={compact ? 'sr-only' : ''}>{t('ai.assistant')}</span>
        {unansweredRequired.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unansweredRequired.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
      style={{ maxHeight: compact ? '50vh' : '60vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100" style={{ backgroundColor: primaryColor }}>
        <div className="flex items-center gap-2 text-white">
          <Bot size={18} />
          <div>
            <p className="text-[13px] font-semibold">{t('ai.assistant')}</p>
            <p className="text-[10px] opacity-80">{answeredCount}/{responseQuestions.length} {t('ai.answered')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin', minHeight: '200px' }}>
        {messages.length === 0 && (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
              <Bot size={24} style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-stone-700">{t('ai.greeting')}</p>
              <p className="text-[11px] text-stone-400 mt-1">{t('ai.helpComplete').replace('{title}', questionnaireTitle)}</p>
            </div>
            {unansweredRequired.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-left">
                <p className="text-[11px] font-medium text-amber-700">{t('ai.requiredUnanswered').replace('{n}', String(unansweredRequired.length))}</p>
                <ul className="mt-1 space-y-0.5">
                  {unansweredRequired.slice(0, 5).map(q => (
                    <li key={q.id} className="text-[10px] text-amber-600 truncate">• {q.question_text}</li>
                  ))}
                  {unansweredRequired.length > 5 && (
                    <li className="text-[10px] text-amber-500">...{t('ai.andMore').replace('{n}', String(unansweredRequired.length - 5))}</li>
                  )}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[t('ai.suggestAnswerAll'), t('ai.suggestWhatsLeft'), t('ai.suggestTellMe')].map(suggestion => (
                <button key={suggestion} onClick={() => { setInput(suggestion); }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-stone-100 text-stone-700 rounded-br-sm'
                : 'border border-stone-200 text-stone-700 rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.fills && msg.fills.length > 0 && (
                <div className="mt-2 pt-2 border-t border-stone-100 space-y-1">
                  {msg.fills.map((fill: any, fi: number) => {
                    const q = responseQuestions.find(rq => rq.id === fill.question_id);
                    return q ? (
                      <div key={fi} className="flex items-start gap-1.5 text-[10px]">
                        <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-emerald-700">
                          {t('ai.filled')}: <strong>{q.question_text?.substring(0, 40)}{q.question_text?.length > 40 ? '...' : ''}</strong>
                          {' → '}{typeof fill.value === 'object' ? JSON.stringify(fill.value) : String(fill.value).substring(0, 30)}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 text-stone-400 text-[12px]">
              <Loader2 size={14} className="animate-spin" /> {t('ai.thinking')}
            </div>
          </div>
        )}
      </div>

      {/* Input with voice */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-stone-100 bg-stone-50/50">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={t('ai.chatPlaceholder')}
          className="flex-1 text-[12px] px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
        />
        {/* Voice input button — browser speech recognition */}
        <VoiceInputButton onTranscript={(text) => setInput(prev => prev ? prev + ' ' + text : text)} primaryColor={primaryColor} />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: primaryColor }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default AIChatbotPopup;
