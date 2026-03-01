import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Home, FileText, Settings, BarChart3, HelpCircle, Layout, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';
import QuestionRenderer from './shared/QuestionRenderer';
import QuestionnaireView from './shared/QuestionnaireView';
import ElementRenderer from './shared/ElementRenderer';
import type { AppLayout, LayoutElement } from './LayoutBuilder';
import type { QuestionnaireConfig } from './QuestionnaireList';

const ICON_MAP: Record<string, React.FC<any>> = {
  Home, FileText, BarChart3, HelpCircle, Settings, Layout,
};

const ParticipantAppView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<AppLayout | null>(null);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireConfig[]>([]);
  const [project, setProject] = useState<any>(null);

  // UI state
  const [currentTabId, setCurrentTabId] = useState('');
  const [activeQuestionnaireId, setActiveQuestionnaireId] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedTimelineDay, setSelectedTimelineDay] = useState(2);
  const [completedTodoIds, setCompletedTodoIds] = useState<Set<string>>(new Set());
  const [submittedQuestionnaireIds, setSubmittedQuestionnaireIds] = useState<Set<string>>(new Set());

  // Load persisted todo completions
  useEffect(() => {
    if (!projectId) return;
    const stored = localStorage.getItem(`todo_completed_${projectId}`);
    if (stored) {
      try { setCompletedTodoIds(new Set(JSON.parse(stored))); } catch {}
    }
  }, [projectId]);

  // Persist todo completions
  const persistTodos = useCallback((ids: Set<string>) => {
    setCompletedTodoIds(ids);
    if (projectId) localStorage.setItem(`todo_completed_${projectId}`, JSON.stringify([...ids]));
  }, [projectId]);

  const handleToggleTodo = useCallback((cardId: string) => {
    setCompletedTodoIds(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId); else next.add(cardId);
      if (projectId) localStorage.setItem(`todo_completed_${projectId}`, JSON.stringify([...next]));
      return next;
    });
  }, [projectId]);

  // Auto-complete todos linked to submitted questionnaires
  useEffect(() => {
    if (!layout || submittedQuestionnaireIds.size === 0) return;
    const allElements = layout.tabs.flatMap(t => t.elements);
    const todoElements = allElements.filter(e => e.type === 'todo_list');
    let changed = false;
    const next = new Set(completedTodoIds);
    for (const el of todoElements) {
      for (const card of (el.config.todo_cards || [])) {
        if (card.completion_trigger === 'questionnaire_complete' && card.questionnaire_id && submittedQuestionnaireIds.has(card.questionnaire_id) && !next.has(card.id)) {
          next.add(card.id);
          changed = true;
        }
      }
    }
    if (changed) persistTodos(next);
  }, [submittedQuestionnaireIds, layout]);

  useEffect(() => {
    if (projectId) loadProjectData();
  }, [projectId]);

  // Sync tab selection from URL search params if provided
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && layout?.tabs?.length) {
      setCurrentTabId(tabParam);
      setActiveQuestionnaireId(null);
      setCurrentPageIndex(0);
    }
  }, [searchParams]);

  const loadProjectData = async () => {
    try {
      // Load project with layout
      const { data: proj } = await supabase
        .from('research_project')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (!proj) { setLoading(false); return; }
      setProject(proj);

      const appLayout = proj.app_layout as AppLayout | null;
      if (appLayout?.tabs?.length) {
        setLayout(appLayout);
        setCurrentTabId(appLayout.tabs[0].id);
      }

      // Load questionnaires
      const { data: qData } = await supabase
        .from('questionnaire')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index');

      if (qData) {
        // Load questions for each questionnaire
        const { data: allQuestions } = await supabase
          .from('survey_question')
          .select('*, options:question_option(*)')
          .eq('project_id', projectId)
          .order('order_index');

        const qConfigs: QuestionnaireConfig[] = qData.map((q: any) => ({
          ...q,
          questions: (allQuestions || []).filter((sq: any) => sq.questionnaire_id === q.id),
        }));
        setQuestionnaires(qConfigs);
      }
    } catch (err) {
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitQuestionnaire = async (questionnaireId: string) => {
    const qConfig = questionnaires.find(q => q.id === questionnaireId);
    if (!qConfig) return;

    // Validate required questions
    const unanswered = qConfig.questions.filter((q: any) => {
      if (!q.required) return false;
      const v = responses[q.id];
      return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    });
    if (unanswered.length > 0) {
      toast.error(`Please answer: "${unanswered[0].question_text}"`);
      return;
    }

    setSubmitting(true);
    try {
      let enrollmentId = localStorage.getItem(`enrollment_${projectId}`);

      if (!enrollmentId) {
        const fallbackEmail = user?.email || `anonymous+${crypto.randomUUID()}@participant.local`;
        const { data: enrollment, error } = await supabase
          .from('enrollment')
          .insert({
            project_id: projectId,
            participant_id: user?.id || null,
            participant_email: fallbackEmail,
            status: 'active',
          })
          .select('id')
          .single();
        if (error) throw error;
        if (enrollment) {
          enrollmentId = enrollment.id;
          localStorage.setItem(`enrollment_${projectId}`, enrollment.id);
        }
      }

      if (!enrollmentId) {
        toast.error('Unable to create enrollment.');
        return;
      }

      // Build response inserts for this questionnaire's questions only
      const responseInserts: any[] = [];
      for (const question of qConfig.questions) {
        const response = responses[question.id];
        if (response === undefined || response === null) continue;

        let answerText: string | null = null;
        let responseValue: any = response;

        if (Array.isArray(response)) {
          answerText = response.join(', ');
        } else if (typeof response === 'object') {
          answerText = JSON.stringify(response);
        } else {
          answerText = String(response);
        }

        responseInserts.push({
          project_id: projectId,
          enrollment_id: enrollmentId,
          question_id: question.id,
          response_text: answerText,
          response_value: responseValue,
        });
      }

      if (responseInserts.length > 0) {
        const { error: insertError } = await supabase.from('survey_respons').insert(responseInserts);
        if (insertError) throw insertError;
      }

      toast.success('Response submitted!');
      setSubmittedQuestionnaireIds(prev => new Set([...prev, questionnaireId]));
      setActiveQuestionnaireId(null);
      setCurrentPageIndex(0);

      // If it's a one-time survey with only one questionnaire, navigate to complete
      if (project?.project_type === 'survey' && questionnaires.filter(q => q.questionnaire_type === 'survey').length <= 1) {
        navigate(`/easyresearch/survey/${projectId}/complete`);
      }
    } catch (err) {
      console.error('Error submitting:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Question Input Renderer (shared) ──
  const renderQuestionInput = (question: any) => (
    <QuestionRenderer
      question={question}
      value={responses[question.id]}
      onResponse={handleResponse}
      primaryColor={layout?.theme?.primary_color || '#10b981'}
      compact={false}
    />
  );

  // ── Shared questionnaire helpers ──
  const activeTabObj = layout?.tabs.find(t => t.id === currentTabId);
  const pColor = layout?.theme?.primary_color || '#10b981';

  const renderQuestionnaireExpanded = (qId: string) => {
    const qConfig = questionnaires.find(q => q.id === qId);
    if (!qConfig) return null;
    return (
      <QuestionnaireView
        qConfig={qConfig}
        activeQuestionnaireId={activeQuestionnaireId}
        activeSectionId={activeSectionId}
        currentPageIndex={currentPageIndex}
        responses={responses}
        primaryColor={pColor}
        backLabel={activeTabObj?.label || 'Home'}
        compact={false}
        onOpenQuestionnaire={(id) => { setActiveQuestionnaireId(id); setCurrentPageIndex(0); setActiveSectionId(null); }}
        onCloseQuestionnaire={() => { setActiveQuestionnaireId(null); setCurrentPageIndex(0); setActiveSectionId(null); }}
        onSetSection={setActiveSectionId}
        onSetPage={setCurrentPageIndex}
        onResponse={handleResponse}
        onSubmit={handleSubmitQuestionnaire}
        submitting={submitting}
      />
    );
  };

  const renderQuestionnaireCard = (qId: string) => {
    const qConfig = questionnaires.find(q => q.id === qId);
    if (!qConfig) return null;
    return (
      <QuestionnaireView
        qConfig={qConfig}
        activeQuestionnaireId={null}
        activeSectionId={null}
        currentPageIndex={0}
        responses={responses}
        primaryColor={pColor}
        compact={false}
        onOpenQuestionnaire={(id) => { setActiveQuestionnaireId(id); setCurrentPageIndex(0); setActiveSectionId(null); }}
        onCloseQuestionnaire={() => {}}
        onSetSection={() => {}}
        onSetPage={() => {}}
        onResponse={handleResponse}
      />
    );
  };

  // ── Render layout element (shared) ──
  const renderElement = (el: LayoutElement) => {
    if (el.config.visible === false) return null;
    return (
      <ElementRenderer
        el={el}
        questionnaires={questionnaires}
        primaryColor={pColor}
        studyDuration={project?.study_duration || 7}
        selectedTimelineDay={selectedTimelineDay}
        activeQuestionnaireId={activeQuestionnaireId}
        compact={false}
        onOpenQuestionnaire={(id) => { setActiveQuestionnaireId(id); setCurrentPageIndex(0); }}
        onSelectTimelineDay={setSelectedTimelineDay}
        renderQuestionnaireCard={(qId, title) => {
          const qConfig = questionnaires.find(q => q.id === qId);
          if (!qConfig) return null;
          return renderQuestionnaireCard(qId);
        }}
        completedTodoIds={completedTodoIds}
        onToggleTodo={handleToggleTodo}
      />
    );
  };

  // Memoize tab content to prevent unnecessary re-renders during tab switches
  const tabContentMap = useMemo(() => {
    if (!layout) return {};
    const map: Record<string, React.ReactNode> = {};
    for (const tab of layout.tabs) {
      if (tab.elements.length === 0) {
        map[tab.id] = <div className="py-16 text-center"><p className="text-[13px] text-stone-400">No content on this tab</p></div>;
        continue;
      }
      const hasWidths = tab.elements.some(e => e.config.width && e.config.width !== '100%');
      const containerClass = hasWidths ? 'flex flex-wrap gap-3 py-4' : 'space-y-3 py-4';
      map[tab.id] = (
        <div className={containerClass}>
          {tab.elements.map(el => {
            const w = el.config.width || '100%';
            const content = renderElement(el);
            if (!content) return null;
            return <div key={el.id} style={{ width: w === '100%' ? '100%' : `calc(${w} - 8px)` }}>{content}</div>;
          })}
        </div>
      );
    }
    return map;
  }, [layout, questionnaires, responses, selectedTimelineDay, completedTodoIds, activeQuestionnaireId]);

  const renderTabContent = () => {
    if (!layout) return null;
    return tabContentMap[currentTabId] || <div className="py-16 text-center"><p className="text-[13px] text-stone-400">No content on this tab</p></div>;
  };

  // ── Inline loading skeleton (no full-screen spinner — shell stays visible) ──
  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 animate-pulse">
        <div className="h-20 bg-stone-100 rounded-xl" />
        <div className="h-14 bg-stone-100 rounded-xl" />
        <div className="h-14 bg-stone-100 rounded-xl" />
        <div className="h-32 bg-stone-100 rounded-xl" />
      </div>
    );
  }

  // ── No layout fallback: show a simple questionnaire list ──
  if (!layout) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        {activeQuestionnaireId ? (
          renderQuestionnaireExpanded(activeQuestionnaireId)
        ) : (
          <div className="space-y-3">
            {questionnaires.filter(q => q.questionnaire_type === 'survey').length === 0 ? (
              <p className="text-stone-400 text-center py-8">No surveys available yet.</p>
            ) : (
              questionnaires.filter(q => q.questionnaire_type === 'survey').map(q => renderQuestionnaireCard(q.id))
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Full layout-based view (no header/nav — ParticipantLayout provides those) ──
  const primaryColor = layout.theme?.primary_color || '#10b981';

  return (
    <div className="flex-1 flex flex-col">
      {/* Inline horizontal tab bar — always visible for project tabs */}
      {layout.bottom_nav.length > 1 && (
        <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-100">
          <div className="max-w-lg mx-auto flex gap-0.5 px-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {layout.bottom_nav.map(nav => {
              const IconComp = ICON_MAP[nav.icon] || Home;
              const isActive = currentTabId === nav.tab_id;
              return (
                <button key={nav.tab_id} type="button"
                  onClick={() => { setCurrentTabId(nav.tab_id); setActiveQuestionnaireId(null); setCurrentPageIndex(0); }}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium transition-all shrink-0 border-b-2"
                  style={{
                    borderColor: isActive ? primaryColor : 'transparent',
                    color: isActive ? primaryColor : '#a8a29e',
                  }}>
                  <IconComp size={15} />
                  {nav.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        {activeQuestionnaireId ? (
          <div className="max-w-lg mx-auto py-3">
            {renderQuestionnaireExpanded(activeQuestionnaireId)}
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            {renderTabContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantAppView;
