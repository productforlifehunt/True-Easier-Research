import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Home, FileText, Settings, BarChart3, HelpCircle, Layout, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';
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

  useEffect(() => {
    if (projectId) loadProjectData();
  }, [projectId]);

  // Sync tab selection from URL search params (set by ParticipantLayout's bottom nav)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && layout?.tabs?.length) {
      setCurrentTabId(tabParam);
      setActiveQuestionnaireId(null);
      setCurrentPageIndex(0);
    }
  }, [searchParams, layout]);

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

  // ── Question Input Renderer (same as AppPhonePreview) ──
  const renderQuestionInput = (question: any) => {
    const value = responses[question.id];
    const normalizedType = normalizeLegacyQuestionType(question.question_type);
    const primaryColor = layout?.theme?.primary_color || '#10b981';

    switch (normalizedType) {
      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option: any, index: number) => {
              const optText = typeof option === 'string' ? option : option.option_text || option.text;
              const optVal = typeof option === 'string' ? option : option.id || option.option_text;
              return (
                <label key={index} className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${value === optVal ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}>
                  <input type="radio" checked={value === optVal || false} onChange={() => handleResponse(question.id, optVal)} className="mr-3 accent-emerald-500" />
                  <span className="text-[14px] text-stone-700">{optText}</span>
                </label>
              );
            })}
          </div>
        );
      case 'multiple_choice':
      case 'checkbox_group':
        return (
          <div className="space-y-2">
            {question.options?.map((option: any, index: number) => {
              const optText = typeof option === 'string' ? option : option.option_text || option.text;
              const optVal = typeof option === 'string' ? option : option.id || option.option_text;
              const selected = Array.isArray(value) ? value.includes(optVal) : false;
              return (
                <label key={index} className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}>
                  <input type="checkbox" checked={selected} onChange={(e) => {
                    const cur = value || [];
                    handleResponse(question.id, e.target.checked ? [...cur, optVal] : cur.filter((v: string) => v !== optVal));
                  }} className="mr-3 accent-emerald-500" />
                  <span className="text-[14px] text-stone-700">{optText}</span>
                </label>
              );
            })}
          </div>
        );
      case 'text_short':
        return <input type="text" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Your answer..." />;
      case 'text_long':
        return <textarea value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20" rows={4} placeholder="Your answer..." />;
      case 'number':
        return <input type="number" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Enter number..." />;
      case 'likert_scale': {
        const lc = question.question_config || {};
        const ls = lc.scale_type || '1-5';
        const [lmin, lmax] = ls.split('-').map(Number);
        const lo: number[] = [];
        for (let i = lmin; i <= lmax; i++) lo.push(i);
        return (
          <div className="flex justify-between gap-1">
            {lo.map(v => (
              <div key={v} onClick={() => handleResponse(question.id, v)} className="flex-1 text-center cursor-pointer">
                <div className={`aspect-square flex items-center justify-center rounded-xl border-2 font-semibold text-[16px] mb-1 transition-all hover:scale-105 ${value === v ? 'text-white' : 'border-stone-200 text-stone-600'}`}
                  style={value === v ? { borderColor: primaryColor, backgroundColor: primaryColor } : {}}>
                  {v}
                </div>
                <p className="text-[10px] text-stone-400">{lc.labels?.[v] || lc.custom_labels?.[v - lmin] || ''}</p>
              </div>
            ))}
          </div>
        );
      }
      case 'bipolar_scale': {
        const bMin = question.question_config?.min_value ?? -3;
        const bMax = question.question_config?.max_value ?? 3;
        const bPoints: number[] = [];
        for (let i = bMin; i <= bMax; i++) bPoints.push(i);
        return (
          <div className="space-y-2">
            <div className="flex justify-center gap-1 flex-wrap">
              {bPoints.map(v => (
                <button key={v} onClick={() => handleResponse(question.id, v)}
                  className="w-11 h-11 rounded-xl border-2 font-semibold text-[13px] transition-all hover:scale-105"
                  style={{
                    borderColor: value === v ? (v < 0 ? '#ef4444' : v > 0 ? '#10b981' : '#6b7280') : '#e7e5e4',
                    backgroundColor: value === v ? (v < 0 ? '#fef2f2' : v > 0 ? '#f0fdf4' : '#f9fafb') : 'white',
                    color: v < 0 ? '#ef4444' : v > 0 ? '#10b981' : '#6b7280',
                  }}>
                  {v > 0 ? `+${v}` : v}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[12px] text-stone-400">
              <span>{question.question_config?.min_label || ''}</span>
              <span>{question.question_config?.max_label || ''}</span>
            </div>
          </div>
        );
      }
      case 'rating': {
        const maxR = question.question_config?.max_value ?? 5;
        return (
          <div className="flex gap-2 justify-center">
            {Array.from({ length: maxR }, (_, i) => i + 1).map(s => (
              <button key={s} type="button" onClick={() => handleResponse(question.id, s)}
                className="text-3xl hover:scale-110 transition-transform"
                style={{ color: (value || 0) >= s ? '#fbbf24' : '#d1d5db' }}>★</button>
            ))}
          </div>
        );
      }
      case 'nps':
        return (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button key={n} onClick={() => handleResponse(question.id, n)}
                className={`w-10 h-10 rounded-lg font-medium text-[13px] transition-all ${value === n ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                {n}
              </button>
            ))}
          </div>
        );
      case 'yes_no':
        return (
          <div className="flex gap-3">
            {['Yes', 'No'].map(opt => (
              <button key={opt} onClick={() => handleResponse(question.id, opt)}
                className={`flex-1 py-3 rounded-xl border-2 text-[14px] font-medium transition-all ${value === opt ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                {opt}
              </button>
            ))}
          </div>
        );
      case 'date':
        return <input type="date" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />;
      case 'section_header':
        return null;
      default:
        return <p className="text-[13px] text-stone-400 italic">Unsupported: {question.question_type}</p>;
    }
  };

  // ── Questionnaire view (expanded with pagination) ──
  const renderQuestionnaireExpanded = (qId: string) => {
    const qConfig = questionnaires.find(q => q.id === qId);
    if (!qConfig) return null;
    const qs = qConfig.questions || [];
    const primaryColor = layout?.theme?.primary_color || '#10b981';

    const tabSections = qConfig.tab_sections;
    const hasTabSections = tabSections && tabSections.length > 0;

    const filteredQs = hasTabSections && activeSectionId
      ? qs.filter((q: any) => tabSections.find(s => s.id === activeSectionId)?.question_ids?.includes(q.id))
      : hasTabSections
        ? qs.filter((q: any) => !tabSections.some(s => s.question_ids?.includes(q.id)))
        : qs;

    const displayQs = filteredQs.length > 0 ? filteredQs : qs;

    const activeSection = activeSectionId ? tabSections?.find(s => s.id === activeSectionId) : null;
    const perPage = (activeSection as any)?.questions_per_page ?? qConfig.questions_per_page ?? null;
    const isUnlimited = perPage === null;
    const totalPages = isUnlimited ? 1 : Math.ceil(displayQs.length / perPage);
    const pageIndex = isUnlimited ? 0 : Math.min(currentPageIndex, totalPages - 1);
    const pageQs = isUnlimited ? displayQs : displayQs.slice(pageIndex * perPage, (pageIndex + 1) * perPage);
    const progress = displayQs.length > 0
      ? (isUnlimited ? 100 : (((pageIndex + 1) * perPage >= displayQs.length ? displayQs.length : (pageIndex + 1) * perPage) / displayQs.length) * 100)
      : 0;
    const progressLabel = isUnlimited
      ? `${displayQs.length} questions`
      : `Page ${pageIndex + 1}/${totalPages} · Q${pageIndex * perPage + 1}-${Math.min((pageIndex + 1) * perPage, displayQs.length)}/${displayQs.length}`;

    const activeTab = layout?.tabs.find(t => t.id === currentTabId);

    return (
      <div className="space-y-4 pb-6">
        <button type="button" onClick={() => { setActiveQuestionnaireId(null); setCurrentPageIndex(0); setActiveSectionId(null); }}
          className="flex items-center gap-1 text-[13px] text-stone-500 hover:text-stone-700">
          <ChevronLeft size={16} /> Back to {activeTab?.label || 'Home'}
        </button>

        {/* Tab sections */}
        {hasTabSections && (
          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => { setActiveSectionId(null); setCurrentPageIndex(0); }}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all shrink-0"
              style={{ backgroundColor: !activeSectionId ? primaryColor : '#f5f5f4', color: !activeSectionId ? 'white' : '#a8a29e' }}>
              General
            </button>
            {tabSections!.map(s => (
              <button key={s.id} onClick={() => { setActiveSectionId(s.id); setCurrentPageIndex(0); }}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all shrink-0"
                style={{ backgroundColor: activeSectionId === s.id ? primaryColor : '#f5f5f4', color: activeSectionId === s.id ? 'white' : '#a8a29e' }}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[12px] text-stone-400 mb-1.5">
            <span>{qConfig.title} — {progressLabel}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: primaryColor }} />
          </div>
        </div>

        {/* Questions */}
        <div className={`space-y-5 ${isUnlimited ? 'overflow-y-auto' : ''}`}>
          {pageQs.map((currentQ: any) => (
            <div key={currentQ.id} className="space-y-2">
              {normalizeLegacyQuestionType(currentQ.question_type) === 'section_header' ? (
                <div className="py-2 border-b border-stone-200 mb-2">
                  <h3 className="text-[16px] font-bold text-stone-800">{currentQ.question_text}</h3>
                  {currentQ.question_description && <p className="text-[13px] text-stone-400 mt-1">{currentQ.question_description}</p>}
                </div>
              ) : (
                <>
                  <h3 className="text-[15px] font-semibold text-stone-800">
                    {currentQ.question_text}{currentQ.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {currentQ.question_description && <p className="text-[13px] text-stone-400">{currentQ.question_description}</p>}
                  {renderQuestionInput(currentQ)}
                </>
              )}
            </div>
          ))}
        </div>

        {displayQs.length === 0 && (
          <p className="text-[13px] text-stone-400 italic py-8 text-center">No questions yet.</p>
        )}

        {/* Navigation */}
        {displayQs.length > 0 && (
          <div className="flex justify-between pt-4 border-t border-stone-100">
            <button type="button"
              onClick={() => setCurrentPageIndex(Math.max(0, pageIndex - 1))}
              disabled={pageIndex === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-medium border border-stone-200 text-stone-500 disabled:opacity-40 hover:bg-stone-50">
              <ChevronLeft size={14} /> Back
            </button>
            {pageIndex >= totalPages - 1 ? (
              <button type="button"
                onClick={() => handleSubmitQuestionnaire(qId)}
                disabled={submitting}
                className="flex items-center gap-1 px-5 py-2 rounded-full text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: primaryColor }}>
                {submitting ? 'Submitting...' : 'Submit'} <Check size={14} />
              </button>
            ) : (
              <button type="button"
                onClick={() => setCurrentPageIndex(pageIndex + 1)}
                className="flex items-center gap-1 px-5 py-2 rounded-full text-[13px] font-medium text-white hover:opacity-90"
                style={{ backgroundColor: primaryColor }}>
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Questionnaire card ──
  const renderQuestionnaireCard = (qId: string) => {
    const qConfig = questionnaires.find(q => q.id === qId);
    if (!qConfig) return null;
    const primaryColor = layout?.theme?.primary_color || '#10b981';

    return (
      <button type="button"
        onClick={() => { setActiveQuestionnaireId(qId); setCurrentPageIndex(0); setActiveSectionId(null); }}
        className="w-full p-4 rounded-xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all text-left">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[14px] font-semibold text-stone-800">{qConfig.title}</h4>
            <p className="text-[12px] text-stone-400 mt-0.5">
              {qConfig.questions?.length || 0} questions · {qConfig.estimated_duration || 5} min
            </p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <ChevronRight size={16} className="text-white" />
          </div>
        </div>
      </button>
    );
  };

  // ── Render layout element ──
  const renderElement = (el: LayoutElement) => {
    if (el.config.visible === false) return null;
    const primaryColor = layout?.theme?.primary_color || '#10b981';
    const studyDuration = project?.study_duration || 7;

    switch (el.type) {
      case 'questionnaire':
        if (el.config.questionnaire_id) return renderQuestionnaireCard(el.config.questionnaire_id);
        return null;
      case 'progress': {
        const progressStyle = el.config.progress_style || 'bar';
        const totalQ = questionnaires.filter(q => q.questionnaire_type === 'survey').length || 1;
        const dayNum = Math.min(Math.ceil(studyDuration * 0.4), studyDuration);
        const completed = Math.floor(dayNum * totalQ * 0.7);
        const total = totalQ * studyDuration;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const todayEntries = Math.min(totalQ, Math.ceil(totalQ * 0.6));

        if (progressStyle === 'ring') {
          const r = 32; const c = 2 * Math.PI * r; const d = c * (1 - pct / 100);
          return (
            <div className="p-5 rounded-xl" style={{ backgroundColor: primaryColor + '12' }}>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r={r} fill="none" stroke="#e7e5e4" strokeWidth="5" />
                    <circle cx="40" cy="40" r={r} fill="none" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={d} transform="rotate(-90 40 40)" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[14px] font-bold" style={{ color: primaryColor }}>{pct}%</span>
                </div>
                <div>
                  <span className="text-[13px] font-semibold" style={{ color: primaryColor }}>{el.config.title || 'Study Progress'}</span>
                  <p className="text-[11px] text-stone-400 mt-0.5">Day {dayNum} of {studyDuration}</p>
                  <p className="text-[11px] text-stone-400">{todayEntries} entries today · {completed} total</p>
                </div>
              </div>
            </div>
          );
        }
        if (progressStyle === 'steps') {
          return (
            <div className="p-5 rounded-xl" style={{ backgroundColor: primaryColor + '12' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold" style={{ color: primaryColor }}>{el.config.title || 'Study Progress'}</span>
                <span className="text-[12px] text-stone-400">Day {dayNum} of {studyDuration}</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: studyDuration }, (_, i) => (
                  <div key={i} className="flex-1 h-2.5 rounded-full transition-all" style={{ backgroundColor: i < dayNum ? primaryColor : '#e7e5e4' }} />
                ))}
              </div>
            </div>
          );
        }
        // bar
        return (
          <div className="p-5 rounded-xl" style={{ backgroundColor: primaryColor + '12' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-semibold" style={{ color: primaryColor }}>{el.config.title || 'Study Progress'}</span>
              <span className="text-[12px] text-stone-400">Day {dayNum} of {studyDuration}</span>
            </div>
            <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: primaryColor }} />
            </div>
          </div>
        );
      }
      case 'consent': {
        const linkedQ = el.config.questionnaire_id ? questionnaires.find(q => q.id === el.config.questionnaire_id) : null;
        return (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <h4 className="text-[14px] font-semibold text-amber-800">🛡️ {el.config.title || 'Consent Form'}</h4>
            {linkedQ ? (
              <button onClick={() => { setActiveQuestionnaireId(linkedQ.id); setCurrentPageIndex(0); }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[12px] font-medium hover:bg-amber-600 transition-colors">
                Review & Sign
              </button>
            ) : <p className="text-[12px] text-amber-600 mt-1 italic">No consent form linked</p>}
          </div>
        );
      }
      case 'screening': {
        const linkedQ = el.config.questionnaire_id ? questionnaires.find(q => q.id === el.config.questionnaire_id) : null;
        return (
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
            <h4 className="text-[14px] font-semibold text-orange-800">📝 {el.config.title || 'Screening'}</h4>
            {linkedQ ? (
              <button onClick={() => { setActiveQuestionnaireId(linkedQ.id); setCurrentPageIndex(0); }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[12px] font-medium hover:bg-orange-600 transition-colors">
                Start Screening
              </button>
            ) : <p className="text-[12px] text-orange-600 mt-1 italic">No screening linked</p>}
          </div>
        );
      }
      case 'profile': {
        const linkedQ = el.config.questionnaire_id ? questionnaires.find(q => q.id === el.config.questionnaire_id) : null;
        return (
          <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm">
            <h4 className="text-[14px] font-semibold text-stone-800">👤 {el.config.title || 'Profile'}</h4>
            {linkedQ ? (
              <button onClick={() => { setActiveQuestionnaireId(linkedQ.id); setCurrentPageIndex(0); }}
                className="mt-2 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50">
                Edit Profile
              </button>
            ) : <p className="text-[12px] text-stone-400 mt-1 italic">No profile linked</p>}
          </div>
        );
      }
      case 'text_block':
        return <div className="p-4 rounded-xl bg-stone-50"><p className="text-[13px] text-stone-600">{el.config.content || el.config.title || ''}</p></div>;
      case 'spacer':
        return <div style={{ height: el.config.style?.height || '16px' }} />;
      case 'divider':
        return <div className="border-t border-stone-200 my-2" />;
      case 'button':
        return (
          <button className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white" style={{ backgroundColor: primaryColor }}>
            {el.config.button_label || el.config.title || 'Button'}
          </button>
        );
      case 'image':
        return el.config.image_url ? <img src={el.config.image_url} alt="" className="w-full rounded-xl" /> : null;
      case 'timeline': {
        const days = el.config.timeline_days || studyDuration || 7;
        const startH = el.config.timeline_start_hour ?? 0;
        const endH = el.config.timeline_end_hour ?? 23;
        const allHours: number[] = [];
        for (let h = startH; h <= endH; h++) allHours.push(h);
        const targetQ = questionnaires?.find(q => q.questionnaire_type === 'survey') || questionnaires?.[0];
        return (
          <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm space-y-3">
            <h4 className="text-[14px] font-semibold text-stone-800">📅 {el.config.title || 'Study Timeline'}</h4>
            <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {Array.from({ length: Math.min(days, 30) }, (_, i) => i + 1).map(d => (
                <button key={d} onClick={() => setSelectedTimelineDay(d)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0"
                  style={{ backgroundColor: d === selectedTimelineDay ? primaryColor : 'transparent', color: d === selectedTimelineDay ? 'white' : '#a8a29e' }}>
                  D{d}
                </button>
              ))}
            </div>
            <div className="space-y-0.5 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {allHours.map(h => {
                const hasQ = h % 2 === 0 && h >= 8 && h <= 20;
                const isCompleted = hasQ && h <= 10 && selectedTimelineDay <= 2;
                const isMissed = hasQ && h >= 18 && selectedTimelineDay < 2;
                return (
                  <div key={h} className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-300 w-8 text-right shrink-0 font-mono">{String(h).padStart(2, '0')}:00</span>
                    <div className={`flex-1 rounded-md transition-all ${hasQ ? 'py-2 px-2.5 cursor-pointer hover:opacity-80' : 'h-px bg-stone-50'}`}
                      onClick={hasQ && targetQ ? () => { setActiveQuestionnaireId(targetQ.id); setCurrentPageIndex(0); } : undefined}
                      style={{ backgroundColor: isCompleted ? '#dcfce7' : isMissed ? '#fee2e2' : hasQ ? '#f0fdf4' : undefined }}>
                      {hasQ && (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium" style={{ color: isCompleted ? '#16a34a' : isMissed ? '#dc2626' : '#a8a29e' }}>
                            {targetQ?.title || 'Survey'}
                          </span>
                          <span className="text-[10px]" style={{ color: isCompleted ? '#16a34a' : isMissed ? '#dc2626' : '#a8a29e' }}>
                            {isCompleted ? '✓' : isMissed ? '✗' : '○'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case 'todo_list': {
        const cards = el.config.todo_cards || [];
        return (
          <div className="space-y-2">
            <h4 className="text-[14px] font-semibold text-stone-800">✅ {el.config.title || 'To-Do'}</h4>
            {cards.length === 0 ? <p className="text-[12px] text-stone-400 italic">No tasks</p> : (
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {cards.map((card, ci) => {
                  const isFirst = ci === 0;
                  const qTitle = card.type === 'questionnaire' ? (questionnaires.find(q => q.id === card.questionnaire_id)?.title || 'Survey') : card.title;
                  return (
                    <div key={card.id} className="shrink-0 w-[85%] p-4 rounded-xl border shadow-sm transition-all"
                      style={{ backgroundColor: isFirst ? '#f0fdf4' : 'white', borderColor: isFirst ? '#86efac' : '#e7e5e4' }}
                      onClick={card.type === 'questionnaire' && card.questionnaire_id ? () => { setActiveQuestionnaireId(card.questionnaire_id!); setCurrentPageIndex(0); } : undefined}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-semibold text-stone-800">{qTitle || 'Task'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: isFirst ? '#dcfce7' : '#f5f5f4', color: isFirst ? '#16a34a' : '#a8a29e' }}>
                          {isFirst ? 'Current' : 'Upcoming'}
                        </span>
                      </div>
                      {card.description && <p className="text-[11px] text-stone-400">{card.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
      case 'help': {
        const linkedQ = el.config.questionnaire_id ? questionnaires.find(q => q.id === el.config.questionnaire_id) : null;
        return (
          <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm">
            <h4 className="text-[14px] font-semibold text-stone-800">❓ {el.config.title || 'Help & FAQ'}</h4>
            {linkedQ ? (
              <button onClick={() => { setActiveQuestionnaireId(linkedQ.id); setCurrentPageIndex(0); }}
                className="mt-2 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50">
                View Help
              </button>
            ) : <p className="text-[12px] text-stone-400 mt-1">Common questions and support</p>}
          </div>
        );
      }
      case 'custom': {
        const linkedQ = el.config.questionnaire_id ? questionnaires.find(q => q.id === el.config.questionnaire_id) : null;
        return (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <h4 className="text-[14px] font-semibold text-emerald-800">🧩 {el.config.title || 'Custom Component'}</h4>
            {linkedQ ? (
              <button onClick={() => { setActiveQuestionnaireId(linkedQ.id); setCurrentPageIndex(0); }}
                className="mt-2 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                Open
              </button>
            ) : <p className="text-[12px] text-emerald-600 mt-1 italic">No component linked</p>}
          </div>
        );
      }
      case 'ecogram':
        return (
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
            <h4 className="text-[14px] font-semibold text-violet-800">🔗 {el.config.title || 'Ecogram'}</h4>
            <p className="text-[11px] text-violet-500 mt-1">Interactive care network diagram</p>
          </div>
        );
      default:
        return <div className="p-3 rounded-xl bg-stone-50 border border-stone-100"><span className="text-[12px] text-stone-400">{el.type}</span></div>;
    }
  };

  // ── Render elements for current tab ──
  const renderTabContent = () => {
    if (!layout) return null;
    const activeTab = layout.tabs.find(t => t.id === currentTabId);
    if (!activeTab || activeTab.elements.length === 0) {
      return <div className="py-16 text-center"><p className="text-[13px] text-stone-400">No content on this tab</p></div>;
    }

    const hasWidths = activeTab.elements.some(e => e.config.width && e.config.width !== '100%');
    const containerClass = hasWidths ? 'flex flex-wrap gap-3 py-4' : 'space-y-3 py-4';

    return (
      <div className={containerClass}>
        {activeTab.elements.map(el => {
          const w = el.config.width || '100%';
          const content = renderElement(el);
          if (!content) return null;
          return <div key={el.id} style={{ width: w === '100%' ? '100%' : `calc(${w} - 8px)` }}>{content}</div>;
        })}
      </div>
    );
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
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
      {/* Desktop horizontal tab bar */}
      <div className="hidden md:flex gap-1 px-4 pt-3 bg-transparent">
        {layout.bottom_nav.map(nav => {
          const IconComp = ICON_MAP[nav.icon] || Home;
          const isActive = currentTabId === nav.tab_id;
          return (
            <button key={nav.tab_id} type="button"
              onClick={() => navigate(`/easyresearch/participant/${projectId}?tab=${nav.tab_id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={{
                backgroundColor: isActive ? primaryColor + '15' : 'transparent',
                color: isActive ? primaryColor : '#a8a29e',
              }}>
              <IconComp size={16} />
              {nav.label}
            </button>
          );
        })}
      </div>

      <div className="px-4">
        {activeQuestionnaireId ? (
          <div className="max-w-lg mx-auto py-4">
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
