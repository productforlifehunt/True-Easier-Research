import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface AIProjectBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-survey-support`;

const AIProjectBuilder: React.FC<AIProjectBuilderProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; projectData?: any }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<any>(null);
  const [creating, setCreating] = useState(false);
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

      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'ai_build_project',
          messages: updated,
          currentProject: generatedProject,
        }),
      });

      if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
      const result = await res.json();

      if (result.projectData) {
        setGeneratedProject(result.projectData);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response || 'Here\'s what I created based on your description.',
        projectData: result.projectData,
      }]);
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, generatedProject]);

  const handleCreateProject = async () => {
    if (!generatedProject || creating) return;
    setCreating(true);
    try {
      let { data: researcher } = await supabase
        .from('researcher').select('id, organization_id').eq('user_id', user?.id).maybeSingle();

      if (!researcher) {
        const { data: defaultOrg } = await supabase.from('organization').select('id').limit(1).maybeSingle();
        if (defaultOrg) {
          const { data: newR } = await supabase
            .from('researcher').insert({ user_id: user?.id, organization_id: defaultOrg.id, role: 'researcher' }).select().single();
          researcher = newR;
        }
      }
      if (!researcher) { toast.error('Researcher profile not found'); return; }

      const p = generatedProject;
      const { data: project, error } = await supabase
        .from('research_project')
        .insert({
          organization_id: researcher.organization_id,
          researcher_id: (researcher as any).id,
          title: p.title || 'AI Generated Project',
          description: p.description || '',
          methodology_type: p.methodology || 'one_time',
          ai_enabled: true,
          voice_enabled: true,
          notification_enabled: true,
          max_participant: p.max_participants || 100,
          study_duration: p.duration_days || 7,
          show_progress_bar: true,
          consent_required: p.consent_required ?? false,
          consent_form_title: p.consent_required ? 'Research Consent Form' : null,
          consent_form_text: p.consent_text || null,
          status: 'draft',
        }).select().single();

      if (error || !project) { toast.error('Failed to create project'); return; }

      // Create questionnaires
      const questionnaires = p.questionnaires || [{ title: p.title || 'Survey', questions: p.questions || [] }];
      for (const qc of questionnaires) {
        const qId = crypto.randomUUID();
        await supabase.from('questionnaire').upsert({
          id: qId,
          project_id: project.id,
          questionnaire_type: qc.type || 'survey',
          title: qc.title || 'Survey',
          description: qc.description || '',
          estimated_duration: qc.estimated_duration || 5,
          frequency: qc.frequency || 'once',
          order_index: 0,
          ai_chatbot_enabled: true,
        }, { onConflict: 'id' });

        // Create questions
        const questions = qc.questions || [];
        for (let qi = 0; qi < questions.length; qi++) {
          const q = questions[qi];
          const questionId = crypto.randomUUID();
          await supabase.from('question').insert({
            id: questionId,
            project_id: project.id,
            questionnaire_id: qId,
            question_text: q.question_text,
            question_type: q.question_type || 'text_short',
            required: q.required ?? false,
            order_index: qi,
            question_config: {
              ...q.question_config,
              allow_ai_assist: true,
              allow_ai_auto_answer: true,
              allow_voice: ['text_short', 'text_long'].includes(q.question_type),
            },
          });

          // Create options for choice questions
          if (q.options?.length) {
            const optionRows = q.options.map((opt: any, oi: number) => ({
              question_id: questionId,
              option_text: typeof opt === 'string' ? opt : opt.text || opt.option_text,
              option_value: typeof opt === 'string' ? opt : opt.value || opt.option_text,
              order_index: oi,
              is_other: false,
            }));
            await supabase.from('question_option').insert(optionRows);
          }
        }
      }

      toast.success('Project created successfully!');
      onProjectCreated(project.id);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-stone-100 flex flex-col" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-2xl">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-[14px] font-semibold">AI Project Builder</p>
              <p className="text-[10px] opacity-80">Describe your research and I'll build it</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', minHeight: '250px' }}>
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
                <Bot size={28} className="text-violet-500" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-stone-800">Tell me about your research</p>
                <p className="text-[12px] text-stone-400 mt-1.5 max-w-sm mx-auto">
                  Describe your study goals, target audience, and what you want to measure. I'll create the project, questionnaires, and questions for you.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'I want to study employee satisfaction with a 20-question survey',
                  'Create a daily mood tracking study for depression research',
                  'Build a UX usability survey for a mobile app',
                  'Design a patient outcome study for post-surgery recovery',
                ].map(s => (
                  <button key={s} onClick={() => setInput(s)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium border border-stone-200 text-stone-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors text-left">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-violet-100 text-violet-800 rounded-br-sm'
                  : 'border border-stone-200 text-stone-700 rounded-bl-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.projectData && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
                      <CheckCircle2 size={14} /> Project Ready
                    </div>
                    <p className="text-[11px] text-emerald-600 font-medium">{msg.projectData.title}</p>
                    <p className="text-[10px] text-emerald-500">
                      {(msg.projectData.questionnaires || [{ questions: msg.projectData.questions || [] }]).reduce((sum: number, q: any) => sum + (q.questions?.length || 0), 0)} questions across {(msg.projectData.questionnaires || [msg.projectData]).length} questionnaire(s)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-400 text-[13px]">
                <Loader2 size={14} className="animate-spin" /> Building your project...
              </div>
            </div>
          )}
        </div>

        {/* Create Button */}
        {generatedProject && (
          <div className="px-4 py-2 border-t border-stone-100 bg-emerald-50/50">
            <button onClick={handleCreateProject} disabled={creating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 transition-all shadow-sm">
              {creating ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><ArrowRight size={14} /> Create This Project</>}
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-stone-100">
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Describe your research study..."
            className="flex-1 text-[13px] px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl text-white bg-gradient-to-r from-violet-500 to-purple-600 disabled:opacity-40 hover:opacity-90 transition-opacity">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIProjectBuilder;
