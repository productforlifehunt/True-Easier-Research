import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Check, RotateCcw, Mic } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { normalizeLegacyQuestionType } from '../../constants/questionTypes';
import toast from 'react-hot-toast';
import { useI18n } from '../../hooks/useI18n';

type AiMode = 'all' | 'explain' | 'improve' | 'chat' | 'fill';

interface AIQuestionWrapperProps {
  question: any;
  value: any;
  onResponse: (questionId: string, value: any) => void;
  children: React.ReactNode;
  aiConfig?: {
    allow_ai_assist?: boolean;
    allow_ai_auto_answer?: boolean;
    allow_voice?: boolean;
  };
  compact?: boolean;
}

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-survey-support`;

const AIQuestionWrapper: React.FC<AIQuestionWrapperProps> = ({
  question, value, onResponse, children, aiConfig, compact = false,
}) => {
  const { t, lang } = useI18n();

  const MODE_LABELS: { key: AiMode; label: string }[] = [
    { key: 'all', label: t('ai.mode.all') },
    { key: 'explain', label: t('ai.mode.explain') },
    { key: 'improve', label: t('ai.mode.improve') },
    { key: 'chat', label: t('ai.mode.chat') },
    { key: 'fill', label: t('ai.mode.fill') },
  ];
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showAiSupport, setShowAiSupport] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [aiMode, setAiMode] = useState<AiMode>('all');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages, chatLoading]);

  const normalizedType = normalizeLegacyQuestionType(question.question_type);
  const isTextType = ['text_short', 'text_long'].includes(normalizedType);
  const isNonResponse = ['section_header', 'text_block', 'instruction', 'divider', 'image_block', 'video_block', 'audio_block', 'embed_block'].includes(normalizedType);
  const hasAnyAI = aiConfig?.allow_ai_assist || aiConfig?.allow_ai_auto_answer || aiConfig?.allow_voice;

  // Build mode instruction for the system prompt
  const getModeInstruction = useCallback((mode: AiMode): string => {
    const base = `IMPORTANT: You are flexible. Every mode can do everything — explain, improve, fill, or chat. The selected mode is just a HINT about the user's likely intent (~50% probability). If the user asks something different from the mode, DO IT. Never refuse. Never be rigid.\n\nIf you detect the user wants to FILL an answer, output ONLY the raw answer value (no explanation) prefixed with <<<FILL>>> and suffixed with <<<END_FILL>>>. For example: <<<FILL>>>5<<<END_FILL>>>. Only use this when actually filling, not when explaining or chatting.\n\nNEVER fill/set an answer unless the user clearly asks you to fill, select, set, or choose something. Greetings like "hello" or general questions are NEVER fill requests.`;
    switch (mode) {
      case 'all':
        return `${base}\n\nMode: ALL MY HELP — No specific bias. Understand user intent from their message and act accordingly. You can explain, improve, fill, or chat freely.`;
      case 'explain':
        return `${base}\n\nMode: EXPLAIN — The user likely wants you to explain this question or help them understand it (~50%). But if they ask you to fill, improve, or just chat, do that instead.`;
      case 'improve':
        return `${base}\n\nMode: IMPROVE — The user likely wants you to improve/enhance their current answer (~50%). But if they ask you to explain, fill, or chat, do that instead.`;
      case 'chat':
        return `${base}\n\nMode: CHAT — The user likely just wants to have a conversation (~50%). Be friendly and helpful. But if they ask you to fill, explain, or improve, do that instead.`;
      case 'fill':
        return `${base}\n\nMode: FILL — The user likely wants you to fill/set the answer for this question (~50%). If the user sends a short value or instruction like "5", "yes", "select B", treat it as a fill request. But if they ask a question or want explanation, respond conversationally instead. NEVER blindly fill greetings or questions as answers.`;
    }
  }, []);


  const callAI = useCallback(async (action: string, extra: any = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
    else headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;

    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action,
        question: question.question_text,
        questionType: normalizedType,
        options: question.options,
        currentAnswer: value,
        questionConfig: question.question_config,
        language: lang,
        ...extra,
      }),
    });
    if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
    return await res.json();
  }, [question, value, normalizedType, lang]);

  // Parse AI response and fill the form field
  const parseAndFill = useCallback((aiAnswer: string) => {
    let parsedValue: any = aiAnswer;
    try {
      if (['multiple_choice', 'checkbox_group', 'ranking'].includes(normalizedType)) {
        parsedValue = JSON.parse(aiAnswer);
      } else if (['likert_scale', 'bipolar_scale', 'nps', 'rating', 'slider', 'number'].includes(normalizedType)) {
        parsedValue = Number(aiAnswer.replace(/[^0-9.-]/g, ''));
        if (isNaN(parsedValue)) parsedValue = aiAnswer;
      } else if (normalizedType === 'single_choice' || normalizedType === 'dropdown') {
        const match = question.options?.find((o: any) => {
          const optText = typeof o === 'string' ? o : o.option_text || o.text;
          const optVal = typeof o === 'string' ? o : o.id || o.option_text;
          return optText?.toLowerCase().trim() === aiAnswer.toLowerCase().trim() || optVal?.toLowerCase().trim() === aiAnswer.toLowerCase().trim();
        });
        if (match) parsedValue = typeof match === 'string' ? match : match.id || match.option_text;
      } else if (normalizedType === 'yes_no') {
        parsedValue = aiAnswer.toLowerCase().includes('yes') ? 'Yes' : 'No';
      }
    } catch { /* keep raw */ }
    return parsedValue;
  }, [normalizedType, question.options]);

  const handleChat = useCallback(async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);
    try {
      const modeInstruction = getModeInstruction(aiMode);
      const result = await callAI('chat', {
        messages: updatedMessages,
        modeInstruction,
      });
      const aiText: string = result.response || '';
      // Check if AI wants to fill
      const fillMatch = aiText.match(/<<<FILL>>>([\s\S]*?)<<<END_FILL>>>/);
      if (fillMatch) {
        const rawFill = fillMatch[1].trim();
        const parsedValue = parseAndFill(rawFill);
        onResponse(question.id, parsedValue);
        setAiSuggestion(typeof parsedValue === 'object' ? JSON.stringify(parsedValue) : String(parsedValue));
        const cleanText = aiText.replace(/<<<FILL>>>[\s\S]*?<<<END_FILL>>>/g, '').trim();
        const displayMsg = cleanText
          ? `${cleanText}\n\n✅ Filled: ${typeof parsedValue === 'object' ? JSON.stringify(parsedValue) : String(parsedValue)}`
          : `✅ Filled: ${typeof parsedValue === 'object' ? JSON.stringify(parsedValue) : String(parsedValue)}`;
        setChatMessages(prev => [...prev, { role: 'assistant', content: displayMsg }]);
        toast.success(lang === 'zh' ? 'AI 已填写答案 — 请检查并修改' : 'AI filled the answer — review and correct if needed');
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
      }
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatMessages, callAI, aiMode, question, parseAndFill, onResponse, getModeInstruction]);

  // Voice input in AI Support input area
  const toggleVoice = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Speech recognition not supported'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onerror = () => { toast.error('Voice input failed'); setIsRecording(false); };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  // Early returns AFTER all hooks
  if (!hasAnyAI || isNonResponse) return <>{children}</>;

  const getModePlaceholder = (mode: AiMode): string => {
    switch (mode) {
      case 'all': return t('ai.hint.all');
      case 'explain': return t('ai.hint.explain');
      case 'improve': return t('ai.hint.improve');
      case 'chat': return t('ai.hint.chat');
      case 'fill': return t('ai.hint.fill');
    }
  };

  return (
    <div className="space-y-1.5">
      {children}

      {aiSuggestion && (
        <div className="p-2.5 rounded-lg bg-violet-50 border border-violet-200 text-[12px] text-violet-700 flex items-start gap-2">
          <Check size={14} className="mt-0.5 shrink-0 text-violet-500" />
          <div className="flex-1">
            <p className="font-medium mb-0.5">{t('ai.suggestionApplied')}</p>
            <p className="text-violet-600 line-clamp-2">{aiSuggestion}</p>
          </div>
          <button onClick={() => { setAiSuggestion(null); onResponse(question.id, undefined); }} className="text-violet-400 hover:text-violet-600">
            <RotateCcw size={12} />
          </button>
        </div>
      )}

      {/* AI Support - Full-width button + 5 mode buttons */}
      {aiConfig?.allow_ai_assist && (
        <div className="rounded-xl border border-emerald-200 bg-white overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowAiSupport(!showAiSupport)}
            className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-medium text-[13px] flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            {t('builder.aiSupport')}
          </button>

          {showAiSupport && (
            <div className="bg-white">
              {/* 5 Mode Buttons */}
              <div className="flex gap-1.5 p-2.5 border-b border-stone-100 bg-stone-50 overflow-x-auto">
                {MODE_LABELS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAiMode(key)}
                    className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap shrink-0 ${
                      aiMode === key
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300 hover:text-emerald-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Hint text */}
              <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-100">
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  {getModePlaceholder(aiMode)}
                </p>
              </div>

              {/* Chat messages */}
              <div ref={scrollRef} className="max-h-48 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-[12px] p-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-emerald-50 text-emerald-700 ml-6'
                        : msg.content.includes('✅')
                          ? 'bg-green-50 text-green-700 mr-6 border border-green-200'
                          : 'bg-stone-50 text-stone-700 mr-6'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-1 text-stone-400 text-[11px]">
                    <Loader2 size={12} className="animate-spin" />
                    {t('ai.thinking')}
                  </div>
                )}
              </div>

              {/* Input area with voice */}
              <div className="flex items-center gap-2 px-3 py-2 border-t border-stone-100 bg-stone-50">
                {aiConfig?.allow_voice && (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isRecording
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-stone-400 hover:text-emerald-600 border border-stone-200'
                    }`}
                  >
                    <Mic size={14} />
                  </button>
                )}
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
                  placeholder={getModePlaceholder(aiMode)}
                  className="flex-1 text-[12px] px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                />
                <button
                  onClick={handleChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIQuestionWrapper;
