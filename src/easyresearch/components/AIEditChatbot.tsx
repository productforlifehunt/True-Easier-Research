import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Send, Loader2, CheckCircle2, Pencil } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { bToast } from '../utils/bilingualToast';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { SurveyProject } from './SurveyBuilder';
import type { LogicRule } from '../utils/logicEngine';

// Tab-specific context descriptions for the AI
const TAB_CONTEXT: Record<string, { label: string; description: string; suggestions: string[] }> = {
  settings: {
    label: 'Settings',
    description: 'Project settings: title, description, project_type (survey/esm/ema/daily_diary/longitudinal), methodology_type, study_duration, survey_frequency, max_participant, compensation, onboarding, incentives, AI/voice/notification toggles.',
    suggestions: [
      'Set study type to daily diary',
      'Set max participants to 50',
      'Enable AI and voice',
      'Set compensation to $20 USD',
    ],
  },
  questionnaires: {
    label: 'Questionnaires',
    description: 'Questionnaire management: add/edit/delete questionnaires and questions, change question types, add options, set required fields, reorder questions.',
    suggestions: [
      'Add 5 demographic questions',
      'Add a satisfaction questionnaire',
      'Make all questions required',
      'Change first question to Likert scale',
    ],
  },
  components: {
    label: 'Forms & Components',
    description: 'Form components: similar to questionnaires tab but for reusable components. Add/edit questions and forms.',
    suggestions: [
      'Add a consent form',
      'Create a screening questionnaire',
      'Add a demographic section',
    ],
  },
  logic: {
    label: 'Logic',
    description: 'Logic rules: skip logic, show/hide, calculate, validate, pipe, A/B test, quota, loop. Each rule has sourceQuestionId, condition, value, action, targetQuestionId, questionnaireId.',
    suggestions: [
      'Skip to Q5 if Q1 equals "yes"',
      'Hide Q3 when Q2 is empty',
      'Add branch: if age < 18, end survey',
      'Show Q10 only when Q8 contains "other"',
    ],
  },
  notifications: {
    label: 'Notifications',
    description: 'Notification configuration: timing, channels, reminders for the study.',
    suggestions: [
      'Set daily reminder at 9am',
      'Add completion notification',
    ],
  },
  translations: {
    label: 'Translations',
    description: 'Translation management: add/edit translations for questions and options in different languages.',
    suggestions: [
      'Translate all questions to Chinese',
      'Add Spanish translations',
    ],
  },
  layout: {
    label: 'Layout',
    description: 'App layout configuration: tabs, elements, questionnaire assignments, theme colors.',
    suggestions: [
      'Add a new tab for daily logs',
      'Set primary color to blue',
    ],
  },
  preview: {
    label: 'Preview',
    description: 'Preview mode — no editable forms here.',
    suggestions: [],
  },
};

export interface AIEditChatbotProps {
  activeTab: string;
  projectTitle: string;
  projectId?: string;
  // Form state
  project: SurveyProject;
  onUpdateProject: (updates: SurveyProject) => void;
  questionnaires: QuestionnaireConfig[];
  onUpdateQuestionnaires: (questionnaires: QuestionnaireConfig[]) => void;
  logicRules: LogicRule[];
  onUpdateLogic: (rules: LogicRule[]) => void;
}

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-survey-support`;

// Apply form-fill commands from AI to React state (frontend only, no DB)
function applyFormFills(
  fills: any[],
  activeTab: string,
  props: AIEditChatbotProps,
): number {
  let appliedCount = 0;

  for (const fill of fills) {
    const { target, action: fillAction, data } = fill;

    // ── Settings fills ──
    if (target === 'project' || activeTab === 'settings') {
      if (fillAction === 'update_project' && data) {
        const updates = { ...props.project };
        for (const [key, value] of Object.entries(data)) {
          (updates as any)[key] = value;
        }
        props.onUpdateProject(updates);
        appliedCount++;
      }
    }

    // ── Questionnaire fills ──
    if (target === 'questionnaire' || target === 'question' || activeTab === 'questionnaires' || activeTab === 'components') {
      if (fillAction === 'add_questionnaire' && data) {
        const newQId = crypto.randomUUID();
        const newQ: any = {
          id: newQId,
          questionnaire_type: data.type || data.questionnaire_type || 'survey',
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
          order_index: props.questionnaires.length,
          display_mode: 'all_at_once',
          questions_per_page: null,
          tab_sections: [],
          ai_chatbot_enabled: true,
          notifications: [],
        };
        props.onUpdateQuestionnaires([...props.questionnaires, newQ]);
        appliedCount++;
      } else if (fillAction === 'edit_questionnaire' && data) {
        const qId = fill.questionnaire_id || data.id;
        props.onUpdateQuestionnaires(props.questionnaires.map(q => {
          if (q.id === qId) {
            const updated = { ...q };
            if (data.title) updated.title = data.title;
            if (data.description !== undefined) updated.description = data.description;
            if (data.questionnaire_type) updated.questionnaire_type = data.questionnaire_type;
            return updated;
          }
          return q;
        }));
        appliedCount++;
      } else if (fillAction === 'add_question' && data) {
        const qId = fill.questionnaire_id || props.questionnaires[0]?.id;
        if (qId) {
          props.onUpdateQuestionnaires(props.questionnaires.map(q => {
            if (q.id === qId) {
              const newQuestion = {
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
              return { ...q, questions: [...(q.questions || []), newQuestion] };
            }
            return q;
          }));
          appliedCount++;
        }
      } else if (fillAction === 'edit_question' && data) {
        const questionId = fill.question_id || data.id;
        props.onUpdateQuestionnaires(props.questionnaires.map(q => ({
          ...q,
          questions: (q.questions || []).map((qu: any) => {
            if (qu.id === questionId) {
              const updated = { ...qu };
              if (data.question_text) updated.question_text = data.question_text;
              if (data.question_type) updated.question_type = data.question_type;
              if (data.required !== undefined) updated.required = data.required;
              if (data.question_config) updated.question_config = { ...updated.question_config, ...data.question_config };
              if (data.options) {
                updated.options = data.options.map((opt: any, i: number) => ({
                  id: crypto.randomUUID(),
                  option_text: typeof opt === 'string' ? opt : opt?.text || opt?.option_text || String(opt),
                  option_value: typeof opt === 'string' ? opt : opt?.value || opt?.option_value || String(opt),
                  order_index: i,
                  is_other: false,
                }));
              }
              return updated;
            }
            return qu;
          }),
        })));
        appliedCount++;
      } else if (fillAction === 'delete_question') {
        const questionId = fill.question_id;
        if (questionId) {
          props.onUpdateQuestionnaires(props.questionnaires.map(q => ({
            ...q,
            questions: (q.questions || []).filter((qu: any) => qu.id !== questionId),
          })));
          appliedCount++;
        }
      }
    }

    // ── Logic fills ──
    if (target === 'logic' || activeTab === 'logic') {
      if (fillAction === 'add_rule' && data) {
        const newRule: LogicRule = {
          id: crypto.randomUUID(),
          projectId: props.projectId || '',
          questionnaireId: data.questionnaire_id || fill.questionnaire_id || props.questionnaires[0]?.id || '',
          sourceQuestionId: data.source_question_id || '',
          condition: data.condition || 'equals',
          value: data.value ?? '',
          action: data.action || 'skip',
          targetQuestionId: data.target_question_id || '',
          targetQuestionnaireId: data.target_questionnaire_id,
          conditionGroup: data.condition_group || '',
          groupOperator: data.condition_group_operator === 'OR' ? 'or' : 'and',
          description: data.description || '',
          orderIndex: props.logicRules.length,
          enabled: true,
        };
        props.onUpdateLogic([...props.logicRules, newRule]);
        appliedCount++;
      } else if (fillAction === 'edit_rule' && data) {
        const ruleId = fill.rule_id || data.id;
        props.onUpdateLogic(props.logicRules.map(r => {
          if (r.id === ruleId) {
            const updated = { ...r };
            if (data.condition) updated.condition = data.condition;
            if (data.value !== undefined) updated.value = data.value;
            if (data.action) updated.action = data.action as any;
            if (data.source_question_id) updated.sourceQuestionId = data.source_question_id;
            if (data.target_question_id) updated.targetQuestionId = data.target_question_id;
            if (data.description) updated.description = data.description;
            return updated;
          }
          return r;
        }));
        appliedCount++;
      } else if (fillAction === 'delete_rule') {
        const ruleId = fill.rule_id;
        if (ruleId) {
          props.onUpdateLogic(props.logicRules.filter(r => r.id !== ruleId));
          appliedCount++;
        }
      }
    }
  }

  return appliedCount;
}

// Build context snapshot for the AI based on active tab
function buildPageContext(props: AIEditChatbotProps): string {
  const { activeTab, project, questionnaires, logicRules } = props;

  const parts: string[] = [];
  parts.push(`Project: "${project.title}" (${project.project_type || 'survey'})`);

  if (activeTab === 'settings') {
    parts.push(`\nSETTINGS FORM STATE:`);
    parts.push(`title: "${project.title}"`);
    parts.push(`description: "${project.description || ''}"`);
    parts.push(`project_type: "${project.project_type}"`);
    parts.push(`methodology_type: "${project.methodology_type || 'not set'}"`);
    parts.push(`study_duration: ${project.study_duration || 'not set'}`);
    parts.push(`survey_frequency: "${project.survey_frequency || 'not set'}"`);
    parts.push(`max_participant: ${project.max_participant || 'not set'}`);
    parts.push(`ai_enabled: ${project.ai_enabled}`);
    parts.push(`voice_enabled: ${project.voice_enabled}`);
    parts.push(`notification_enabled: ${project.notification_enabled}`);
    parts.push(`compensation_type: "${project.compensation_type || 'not set'}"`);
    parts.push(`compensation_amount: ${project.compensation_amount || 'not set'}`);
    parts.push(`onboarding_required: ${project.onboarding_required || false}`);
    parts.push(`incentive_enabled: ${project.incentive_enabled || false}`);
    parts.push(`incentive_type: "${project.incentive_type || 'fixed'}"`);
    parts.push(`incentive_amount: ${project.incentive_amount || 0}`);
    parts.push(`incentive_currency: "${project.incentive_currency || 'USD'}"`);
  }

  if (activeTab === 'questionnaires' || activeTab === 'components') {
    parts.push(`\nQUESTIONNAIRES (${questionnaires.length}):`);
    for (const q of questionnaires) {
      parts.push(`\nQuestionnaire "${q.title}" [id:${q.id}] (${q.questionnaire_type}):`);
      for (const qu of (q.questions || [])) {
        const opts = qu.options?.map((o: any) => typeof o === 'string' ? o : o.option_text || o.text).join(', ');
        parts.push(`  Q [id:${qu.id}] (${qu.question_type}${qu.required ? ', required' : ''}): "${qu.question_text}"${opts ? ` | Options: [${opts}]` : ''}`);
      }
      if (!q.questions?.length) parts.push(`  (no questions)`);
    }
  }

  if (activeTab === 'logic') {
    parts.push(`\nLOGIC RULES (${logicRules.length}):`);
    // Include questionnaire/question reference for context
    const allQuestions = questionnaires.flatMap(q => (q.questions || []).map(qu => ({ ...qu, questionnaire_title: q.title, questionnaire_id: q.id })));
    for (const r of logicRules) {
      const srcQ = allQuestions.find(q => q.id === r.sourceQuestionId);
      const tgtQ = allQuestions.find(q => q.id === r.targetQuestionId);
      parts.push(`  Rule [id:${r.id}]: IF "${srcQ?.question_text || r.sourceQuestionId}" ${r.condition} "${r.value}" THEN ${r.action} → "${tgtQ?.question_text || r.targetQuestionId}"${r.description ? ` (${r.description})` : ''}`);
    }
    // Also include question list for reference
    parts.push(`\nAVAILABLE QUESTIONS:`);
    for (const q of questionnaires) {
      for (const qu of (q.questions || [])) {
        parts.push(`  [id:${qu.id}] in "${q.title}" [qid:${q.id}]: "${qu.question_text}" (${qu.question_type})`);
      }
    }
  }

  return parts.join('\n');
}

const AIEditChatbot: React.FC<AIEditChatbotProps> = (props) => {
  const { activeTab, projectTitle } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; fills?: any[] }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tabCtx = TAB_CONTEXT[activeTab] || { label: activeTab, description: 'General editing', suggestions: [] };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // Reset messages when tab changes
  useEffect(() => {
    setMessages([]);
  }, [activeTab]);

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

      const pageContext = buildPageContext(props);

      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'ai_editor_form_fill',
          messages: updated,
          activeTab,
          pageContext,
          projectTitle,
        }),
      });

      if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
      const result = await res.json();

      // Process form-fill commands (frontend only, no DB)
      const fills = result.formFills || [];
      if (fills.length > 0) {
        const count = applyFormFills(fills, activeTab, props);
        if (count > 0) {
          bToast.success(`AI filled ${count} field${count > 1 ? 's' : ''} — review and click Save`, `AI 已填充 ${count} 个字段 — 请检查后点击保存`);
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response || 'Done! Check the form fields.',
        fills: fills.length > 0 ? fills : undefined,
      }]);
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, activeTab, props, projectTitle]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-[13px] font-medium hover:scale-105 transition-all bg-gradient-to-r from-emerald-500 to-teal-500"
        style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))', right: '1rem' }}
      >
        <Pencil size={16} />
        AI Editor
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col" style={{ maxHeight: '75vh' }}>
      {/* Header — green theme */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-2xl">
        <div className="flex items-center gap-2 text-white">
          <Pencil size={16} />
          <div>
            <p className="text-[13px] font-semibold">AI Editor — {tabCtx.label}</p>
            <p className="text-[10px] opacity-80">Fills forms on this page · no direct DB writes</p>
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
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
              <Pencil size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-stone-700">AI Editor — {tabCtx.label}</p>
              <p className="text-[11px] text-stone-400 mt-1">
                Tell me what to fill on this page. I'll update the form fields directly — click Save when you're happy.
              </p>
            </div>
            {tabCtx.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {tabCtx.suggestions.map(s => (
                  <button key={s} onClick={() => setInput(s)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-stone-200 text-stone-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-emerald-100 text-emerald-800 rounded-br-sm'
                : 'border border-stone-200 text-stone-700 rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.fills && msg.fills.length > 0 && (
                <div className="mt-2 pt-2 border-t border-stone-100 space-y-1">
                  {msg.fills.map((fill: any, fi: number) => (
                    <div key={fi} className="flex items-start gap-1.5 text-[10px]">
                      <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-emerald-700">
                        {fill.action === 'update_project' && `Updated project settings`}
                        {fill.action === 'add_questionnaire' && `Added questionnaire: "${fill.data?.title}"`}
                        {fill.action === 'edit_questionnaire' && `Updated questionnaire`}
                        {fill.action === 'add_question' && `Added: "${fill.data?.question_text?.substring(0, 40)}..."`}
                        {fill.action === 'edit_question' && `Edited question`}
                        {fill.action === 'delete_question' && `Deleted question`}
                        {fill.action === 'add_rule' && `Added logic rule`}
                        {fill.action === 'edit_rule' && `Updated logic rule`}
                        {fill.action === 'delete_rule' && `Deleted logic rule`}
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

      {/* Input — green themed */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-stone-100 bg-stone-50/50">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={`Tell AI what to fill on ${tabCtx.label}...`}
          className="flex-1 text-[12px] px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default AIEditChatbot;
