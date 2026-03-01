import React, { useState, useCallback, useRef } from 'react';
import { Sparkles, Wand2, Mic, MicOff, MessageCircle, X, Send, Loader2, Check, RotateCcw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { normalizeLegacyQuestionType } from '../../constants/questionTypes';
import toast from 'react-hot-toast';

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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiHelpText, setAiHelpText] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const normalizedType = normalizeLegacyQuestionType(question.question_type);
  const isTextType = ['text_short', 'text_long'].includes(normalizedType);
  const isNonResponse = ['section_header', 'text_block', 'instruction', 'divider', 'image_block'].includes(normalizedType);
  const hasAnyAI = aiConfig?.allow_ai_assist || aiConfig?.allow_ai_auto_answer || aiConfig?.allow_voice;

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
        ...extra,
      }),
    });
    if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
    return await res.json();
  }, [question, value, normalizedType]);

  const handleAutoAnswer = useCallback(async () => {
    setAiLoading(true);
    try {
      const result = await callAI('ai_auto_answer');
      const answer = result.response;
      let parsedValue: any = answer;
      try {
        if (['multiple_choice', 'checkbox_group', 'ranking'].includes(normalizedType)) {
          parsedValue = JSON.parse(answer);
        } else if (normalizedType === 'matrix') {
          parsedValue = JSON.parse(answer);
        } else if (['likert_scale', 'bipolar_scale', 'nps', 'rating', 'slider', 'number'].includes(normalizedType)) {
          parsedValue = Number(answer.replace(/[^0-9.-]/g, ''));
          if (isNaN(parsedValue)) parsedValue = answer;
        } else if (normalizedType === 'single_choice' || normalizedType === 'dropdown') {
          const match = question.options?.find((o: any) => {
            const optText = typeof o === 'string' ? o : o.option_text || o.text;
            const optVal = typeof o === 'string' ? o : o.id || o.option_text;
            return optText.toLowerCase().trim() === answer.toLowerCase().trim() || optVal.toLowerCase().trim() === answer.toLowerCase().trim();
          });
          if (match) parsedValue = typeof match === 'string' ? match : match.id || match.option_text;
        } else if (normalizedType === 'yes_no') {
          parsedValue = answer.toLowerCase().includes('yes') ? 'Yes' : 'No';
        }
      } catch { /* keep raw */ }

      setAiSuggestion(typeof parsedValue === 'object' ? JSON.stringify(parsedValue) : String(parsedValue));
      onResponse(question.id, parsedValue);
      toast.success('AI suggested an answer — review and correct if needed');
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  }, [callAI, question, normalizedType, onResponse]);

  const handleAiAssist = useCallback(async () => {
    setAiLoading(true);
    try {
      const result = await callAI('ai_assist');
      setAiHelpText(result.response);
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  }, [callAI]);

  const handleEnhance = useCallback(async () => {
    if (!value) { toast.error('Write something first'); return; }
    setAiLoading(true);
    try {
      const result = await callAI('ai_enhance');
      setAiSuggestion(result.response);
      onResponse(question.id, result.response);
      toast.success('Text enhanced — review and edit as needed');
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  }, [callAI, value, question.id, onResponse]);

  const handleChat = useCallback(async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);
    try {
      const result = await callAI('chat', { messages: updatedMessages });
      setChatMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatMessages, callAI]);

  const toggleVoice = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Speech recognition not supported'); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentVal = value || '';
      onResponse(question.id, currentVal ? `${currentVal} ${transcript}` : transcript);
      toast.success('Voice input captured');
    };
    recognition.onerror = () => { toast.error('Voice input failed'); setIsRecording(false); };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, value, question.id, onResponse]);

  // Early returns AFTER all hooks
  if (!hasAnyAI || isNonResponse) return <>{children}</>;

  const btnSize = compact ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-1';
  const iconSize = compact ? 10 : 12;

  return (
    <div className="space-y-1.5">
      {children}

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {aiConfig?.allow_ai_auto_answer && (
          <button type="button" onClick={handleAutoAnswer} disabled={aiLoading}
            className={`${btnSize} rounded-full font-medium flex items-center gap-1 bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200 disabled:opacity-50 transition-all`}>
            {aiLoading ? <Loader2 size={iconSize} className="animate-spin" /> : <Wand2 size={iconSize} />}
            AI Answer
          </button>
        )}
        {aiConfig?.allow_ai_assist && (
          <button type="button" onClick={handleAiAssist} disabled={aiLoading}
            className={`${btnSize} rounded-full font-medium flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 disabled:opacity-50 transition-all`}>
            {aiLoading ? <Loader2 size={iconSize} className="animate-spin" /> : <Sparkles size={iconSize} />}
            AI Help
          </button>
        )}
        {isTextType && aiConfig?.allow_ai_assist && value && (
          <button type="button" onClick={handleEnhance} disabled={aiLoading}
            className={`${btnSize} rounded-full font-medium flex items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50 transition-all`}>
            <Sparkles size={iconSize} /> Enhance
          </button>
        )}
        {aiConfig?.allow_voice && isTextType && (
          <button type="button" onClick={toggleVoice}
            className={`${btnSize} rounded-full font-medium flex items-center gap-1 ${isRecording ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200'} transition-all`}>
            {isRecording ? <MicOff size={iconSize} /> : <Mic size={iconSize} />}
            {isRecording ? 'Stop' : 'Voice'}
          </button>
        )}
        {aiConfig?.allow_ai_assist && (
          <button type="button" onClick={() => setShowChat(!showChat)}
            className={`${btnSize} rounded-full font-medium flex items-center gap-1 bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200 transition-all`}>
            <MessageCircle size={iconSize} /> Chat
          </button>
        )}
      </div>

      {aiSuggestion && (
        <div className="p-2.5 rounded-lg bg-violet-50 border border-violet-200 text-[12px] text-violet-700 flex items-start gap-2">
          <Check size={14} className="mt-0.5 shrink-0 text-violet-500" />
          <div className="flex-1">
            <p className="font-medium mb-0.5">AI Suggestion Applied</p>
            <p className="text-violet-600 line-clamp-2">{aiSuggestion}</p>
          </div>
          <button onClick={() => { setAiSuggestion(null); onResponse(question.id, undefined); }} className="text-violet-400 hover:text-violet-600">
            <RotateCcw size={12} />
          </button>
        </div>
      )}

      {aiHelpText && (
        <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[12px] text-blue-700">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium mb-0.5">💡 AI Help</p>
              <p className="text-blue-600">{aiHelpText}</p>
            </div>
            <button onClick={() => setAiHelpText(null)} className="text-blue-400 hover:text-blue-600 shrink-0"><X size={12} /></button>
          </div>
        </div>
      )}

      {showChat && (
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-stone-50 border-b border-stone-100">
            <span className="text-[12px] font-medium text-stone-600">AI Chat Assistant</span>
            <button onClick={() => setShowChat(false)} className="text-stone-400 hover:text-stone-600"><X size={14} /></button>
          </div>
          <div className="max-h-48 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
            {chatMessages.length === 0 && (
              <p className="text-[11px] text-stone-400 italic text-center py-3">Ask anything about this question...</p>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`text-[12px] p-2 rounded-lg ${msg.role === 'user' ? 'bg-emerald-50 text-emerald-700 ml-6' : 'bg-stone-50 text-stone-700 mr-6'}`}>
                {msg.content}
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-1 text-stone-400 text-[11px]">
                <Loader2 size={12} className="animate-spin" /> Thinking...
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border-t border-stone-100">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Ask AI..." className="flex-1 text-[12px] px-2 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
            <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()}
              className="p-1.5 rounded-lg bg-emerald-500 text-white disabled:opacity-40 hover:bg-emerald-600">
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuestionWrapper;
