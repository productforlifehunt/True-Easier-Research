import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, CheckCircle2, Pencil } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { QuestionnaireConfig } from './QuestionnaireList';

interface AIEditChatbotProps {
  questionnaires: QuestionnaireConfig[];
  projectTitle: string;
  projectId?: string;
  onUpdate: (questionnaires: QuestionnaireConfig[]) => void;
}

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-survey-support`;

const AIEditChatbot: React.FC<AIEditChatbotProps> = ({ questionnaires, projectTitle, projectId, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; edits?: any[] }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      else headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;

      // Build questionnaire structure for context
      const structure = questionnaires.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description || '',
        type: q.questionnaire_type,
        questions: (q.questions || []).map((qu: any) => ({
          id: qu.id,
          question_text: qu.question_text,
          question_type: qu.question_type,
          required: qu.required,
          options: qu.options?.map((o: any) => typeof o === 'string' ? o : o.option_text || o.text),
          question_config: qu.question_config,
        })),
      }));

      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'ai_edit_project',
          messages: updated,
          projectStructure: { title: projectTitle, questionnaires: structure },
        }),
      });

      if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
      const result = await res.json();

      // Process edit commands
      const edits = result.editCommands || [];
      if (edits.length > 0) {
        let updatedQs = [...questionnaires];

        edits.forEach((edit: any) => {
          const { action: editAction, questionnaire_id, question_id, data } = edit;

          if (editAction === 'add_question' && questionnaire_id && data) {
            updatedQs = updatedQs.map(q => {
              if (q.id === questionnaire_id) {
                const newQ = {
                  id: crypto.randomUUID(),
                  question_text: data.question_text || 'New Question',
                  question_type: data.question_type || 'text_short',
                  required: data.required ?? false,
                  order_index: (q.questions?.length || 0),
                  question_config: data.question_config || {},
                  options: (data.options || []).map((opt: any, i: number) => ({
                    id: crypto.randomUUID(),
                    option_text: typeof opt === 'string' ? opt : opt?.text || opt?.option_text || String(opt),
                    option_value: typeof opt === 'string' ? opt : opt?.value || opt?.option_value || String(opt),
                    order_index: i,
                    is_other: false,
                  })),
                };
                return { ...q, questions: [...(q.questions || []), newQ] };
              }
              return q;
            });
          } else if (editAction === 'edit_question' && question_id && data) {
            updatedQs = updatedQs.map(q => ({
              ...q,
              questions: (q.questions || []).map((qu: any) => {
                if (qu.id === question_id) {
                  const updated = { ...qu };
                  if (data.question_text) updated.question_text = data.question_text;
                  if (data.question_type) updated.question_type = data.question_type;
                  if (data.required !== undefined) updated.required = data.required;
                  if (data.question_config) updated.question_config = { ...updated.question_config, ...data.question_config };
                  if (data.options) {
                    updated.options = data.options.map((opt: string, i: number) => ({
                      id: crypto.randomUUID(),
                      option_text: opt,
                      option_value: opt,
                      order_index: i,
                      is_other: false,
                    }));
                  }
                  return updated;
                }
                return qu;
              }),
            }));
          } else if (editAction === 'delete_question' && question_id) {
            updatedQs = updatedQs.map(q => ({
              ...q,
              questions: (q.questions || []).filter((qu: any) => qu.id !== question_id),
            }));
          } else if (editAction === 'add_questionnaire' && data) {
            const newQId = crypto.randomUUID();
            updatedQs.push({
              id: newQId,
              questionnaire_type: data.type || 'survey',
              title: data.title || 'New Questionnaire',
              description: data.description || '',
              questions: (data.questions || []).map((q: any, i: number) => ({
                id: crypto.randomUUID(),
                question_text: q.question_text || 'Question',
                question_type: q.question_type || 'text_short',
                required: q.required ?? false,
                order_index: i,
                question_config: q.question_config || {},
                options: (q.options || []).map((opt: any, oi: number) => ({
                  id: crypto.randomUUID(),
                  option_text: typeof opt === 'string' ? opt : opt?.text || opt?.option_text || String(opt),
                  option_value: typeof opt === 'string' ? opt : opt?.value || opt?.option_value || String(opt),
                  order_index: oi,
                  is_other: false,
                })),
              })),
              estimated_duration: data.estimated_duration || 5,
              frequency: data.frequency || 'once',
              time_windows: [{ start: '09:00', end: '21:00' }],
              assigned_participant_types: [],
              order_index: updatedQs.length,
              display_mode: 'all_at_once',
              questions_per_page: null,
              tab_sections: [],
              ai_chatbot_enabled: true,
              notifications: [],
            } as any);
          } else if (editAction === 'edit_questionnaire' && questionnaire_id && data) {
            updatedQs = updatedQs.map(q => {
              if (q.id === questionnaire_id) {
                const updated = { ...q };
                if (data.title) updated.title = data.title;
                if (data.description !== undefined) updated.description = data.description;
                return updated;
              }
              return q;
            });
          }
        });

        onUpdate(updatedQs);
        toast.success(`AI applied ${edits.length} edit${edits.length > 1 ? 's' : ''} — review in Questionnaires tab`);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response || 'Done! Check your questionnaires.',
        edits: edits.length > 0 ? edits : undefined,
      }]);
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, questionnaires, projectTitle, onUpdate]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-[13px] font-medium hover:scale-105 transition-all bg-gradient-to-r from-violet-500 to-purple-600"
      >
        <Pencil size={16} />
        AI Editor
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col" style={{ maxHeight: '75vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-2xl">
        <div className="flex items-center gap-2 text-white">
          <Pencil size={16} />
          <div>
            <p className="text-[13px] font-semibold">AI Editor</p>
            <p className="text-[10px] opacity-80">{questionnaires.length} questionnaire(s) · {questionnaires.reduce((s, q) => s + (q.questions?.length || 0), 0)} questions</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin', minHeight: '220px' }}>
        {messages.length === 0 && (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-violet-50 flex items-center justify-center">
              <Sparkles size={24} className="text-violet-500" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-stone-700">Edit your research with AI</p>
              <p className="text-[11px] text-stone-400 mt-1">Tell me what to change — add questions, modify options, rename questionnaires, or restructure your entire project.</p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[
                'Add 5 demographic questions',
                'Make all questions required',
                'Add a satisfaction questionnaire',
                'Change the first question to a Likert scale',
              ].map(s => (
                <button key={s} onClick={() => setInput(s)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-stone-200 text-stone-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-violet-100 text-violet-800 rounded-br-sm'
                : 'border border-stone-200 text-stone-700 rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.edits && msg.edits.length > 0 && (
                <div className="mt-2 pt-2 border-t border-stone-100 space-y-1">
                  {msg.edits.map((edit: any, ei: number) => (
                    <div key={ei} className="flex items-start gap-1.5 text-[10px]">
                      <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-emerald-700">
                        {edit.action === 'add_question' && `Added: "${edit.data?.question_text?.substring(0, 40)}..."`}
                        {edit.action === 'edit_question' && `Edited question`}
                        {edit.action === 'delete_question' && `Deleted question`}
                        {edit.action === 'add_questionnaire' && `Added questionnaire: "${edit.data?.title}"`}
                        {edit.action === 'edit_questionnaire' && `Updated questionnaire`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 text-stone-400 text-[12px]">
              <Loader2 size={14} className="animate-spin" /> Editing...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-stone-100 bg-stone-50/50">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Tell AI what to edit..."
          className="flex-1 text-[12px] px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl text-white bg-gradient-to-r from-violet-500 to-purple-600 disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default AIEditChatbot;
