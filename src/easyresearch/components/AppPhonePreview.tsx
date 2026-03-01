import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, Home, FileText, Settings, BarChart3, HelpCircle, Layout, GripVertical, Trash2, Edit3, Move } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';
import QuestionRenderer from './shared/QuestionRenderer';
import type { AppLayout, LayoutElement } from './LayoutBuilder';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';

interface AppPhonePreviewProps {
  layout: AppLayout;
  questionnaires: QuestionnaireConfig[];
  participantTypes?: ParticipantType[];
  studyDuration?: number;
  activeTabId?: string;
  onActiveTabChange?: (tabId: string) => void;
  highlightedElementId?: string | null;
  onElementClick?: (elementId: string) => void;
  /** If true, shows drag handles and edit/delete on phone elements (Layout builder mode) */
  editable?: boolean;
  onRemoveElement?: (elementId: string) => void;
  onUpdateElement?: (elementId: string, config: Partial<LayoutElement['config']>) => void;
  scale?: number;
  frameWidth?: number;
  frameHeight?: number;
  /** Filter elements by participant type ID */
  filterParticipantTypeId?: string | null;
}

const ICON_MAP: Record<string, React.FC<any>> = {
  Home, FileText, BarChart3, HelpCircle, Settings, Layout,
};

const AppPhonePreview: React.FC<AppPhonePreviewProps> = ({
  layout, questionnaires, participantTypes, studyDuration = 7,
  activeTabId: controlledTabId, onActiveTabChange,
  highlightedElementId, onElementClick,
  editable = false, onRemoveElement, onUpdateElement,
  scale = 1, frameWidth = 375, frameHeight = 680,
  filterParticipantTypeId,
}) => {
  const [internalTabId, setInternalTabId] = useState(layout.tabs[0]?.id || '');
  const [activeQuestionnaireId, setActiveQuestionnaireId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [selectedTimelineDay, setSelectedTimelineDay] = useState(2);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const currentTabId = controlledTabId ?? internalTabId;
  const setCurrentTabId = (id: string) => {
    if (onActiveTabChange) onActiveTabChange(id);
    else setInternalTabId(id);
  };

  const activeTab = layout.tabs.find(t => t.id === currentTabId);
  const primaryColor = layout.theme?.primary_color || '#10b981';
  const bgColor = layout.theme?.background_color || '#f5f5f4';

  const handleResponse = (questionId: string, value: any) => setResponses({ ...responses, [questionId]: value });

  const getQuestionsForQuestionnaire = (qId: string): any[] => {
    return questionnaires?.find(q => q.id === qId)?.questions || [];
  };

  // ── Question input renderer (shared) ──
  const renderQuestionInput = (question: any) => (
    <QuestionRenderer
      question={question}
      value={responses[question.id]}
      onResponse={handleResponse}
      primaryColor={primaryColor}
      compact={true}
    />
  );

  // ── Questionnaire card/expanded view ──
  const renderQuestionnaireCard = (qId: string, qTitle: string) => {
    const qs = getQuestionsForQuestionnaire(qId);
    const qConfig = questionnaires?.find(q => q.id === qId);

    if (activeQuestionnaireId === qId) {
      const tabSections = qConfig?.tab_sections;
      const hasTabSections = tabSections && tabSections.length > 0;
      
      const filteredQs = hasTabSections && activeSectionId
        ? qs.filter(q => tabSections.find(s => s.id === activeSectionId)?.question_ids.includes(q.id))
        : hasTabSections
          ? qs.filter(q => !tabSections.some(s => s.question_ids.includes(q.id)))
          : qs;
      
      const displayQs = filteredQs.length > 0 ? filteredQs : qs;

      // Determine questions_per_page: per-tab override > questionnaire default > null (unlimited)
      const activeSection = activeSectionId ? tabSections?.find(s => s.id === activeSectionId) : null;
      const perPage = activeSection?.questions_per_page ?? qConfig?.questions_per_page ?? null;
      const isUnlimited = perPage === null;

      // currentQuestionIndex is now a PAGE index when paginated
      const totalPages = isUnlimited ? 1 : Math.ceil(displayQs.length / perPage);
      const pageIndex = isUnlimited ? 0 : Math.min(currentQuestionIndex, totalPages - 1);
      const pageQs = isUnlimited
        ? displayQs
        : displayQs.slice(pageIndex * perPage, (pageIndex + 1) * perPage);
      const progress = displayQs.length > 0
        ? (isUnlimited ? 100 : (((pageIndex + 1) * perPage >= displayQs.length ? displayQs.length : (pageIndex + 1) * perPage) / displayQs.length) * 100)
        : 0;
      const progressLabel = isUnlimited
        ? `${displayQs.length} questions`
        : `Page ${pageIndex + 1}/${totalPages} · Q${pageIndex * perPage + 1}-${Math.min((pageIndex + 1) * perPage, displayQs.length)}/${displayQs.length}`;

      return (
        <div className="space-y-3">
          <button type="button" onClick={(e) => { e.stopPropagation(); setActiveQuestionnaireId(null); setCurrentQuestionIndex(0); }}
            className="flex items-center gap-1 text-[12px] text-stone-500 hover:text-stone-700 cursor-pointer">
            <ChevronLeft size={14} /> Back to {activeTab?.label || 'Home'}
          </button>
          {/* Tab section navigation */}
          {hasTabSections && (
            <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button onClick={(e) => { e.stopPropagation(); setActiveSectionId(null); setCurrentQuestionIndex(0); }}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all shrink-0"
                style={{ backgroundColor: !activeSectionId ? primaryColor : '#f5f5f4', color: !activeSectionId ? 'white' : '#a8a29e' }}>
                General
              </button>
              {tabSections.map(s => (
                <button key={s.id} onClick={(e) => { e.stopPropagation(); setActiveSectionId(s.id); setCurrentQuestionIndex(0); }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all shrink-0"
                  style={{ backgroundColor: activeSectionId === s.id ? primaryColor : '#f5f5f4', color: activeSectionId === s.id ? 'white' : '#a8a29e' }}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
          <div>
            <div className="flex justify-between text-[11px] text-stone-400 mb-1">
              <span>{qTitle} — {progressLabel}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: primaryColor }} />
            </div>
          </div>
          {/* Render page of questions */}
          <div className={`space-y-4 ${isUnlimited ? 'max-h-[50vh] overflow-y-auto pr-1' : ''}`} style={isUnlimited ? { scrollbarWidth: 'thin' } : undefined}>
            {pageQs.map((currentQ, idx) => (
              <div key={currentQ.id} className="space-y-2">
                {normalizeLegacyQuestionType(currentQ.question_type) === 'section_header' ? (
                  <div className="py-2 border-b border-stone-200 mb-2">
                    <h3 className="text-[15px] font-bold text-stone-800">{currentQ.question_text}</h3>
                    {currentQ.question_description && <p className="text-[12px] text-stone-400 mt-1">{currentQ.question_description}</p>}
                  </div>
                ) : (
                  <>
                    <h3 className="text-[14px] font-semibold text-stone-800">
                      {currentQ.question_text}{currentQ.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {currentQ.question_description && <p className="text-[12px] text-stone-400">{currentQ.question_description}</p>}
                    {renderQuestionInput(currentQ)}
                  </>
                )}
              </div>
            ))}
          </div>
          {displayQs.length === 0 && (
            <p className="text-[12px] text-stone-400 italic py-4 text-center">No questions added yet.</p>
          )}
          {displayQs.length > 0 && (
            <div className="flex justify-between pt-3 border-t border-stone-100">
              <button type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentQuestionIndex(Math.max(0, pageIndex - 1)); }}
                disabled={pageIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium border border-stone-200 text-stone-500 disabled:opacity-40 hover:bg-stone-50 cursor-pointer">
                <ChevronLeft size={12} /> Back
              </button>
              {pageIndex >= totalPages - 1 ? (
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveQuestionnaireId(null); setCurrentQuestionIndex(0); }}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-full text-[12px] font-medium text-white cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}>
                  Submit <Check size={12} />
                </button>
              ) : (
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); setCurrentQuestionIndex(pageIndex + 1); }}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-full text-[12px] font-medium text-white cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}>
                  Next <ChevronRight size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    // Card view
    return (
      <button type="button"
        onClick={(e) => { e.stopPropagation(); setActiveQuestionnaireId(qId); setCurrentQuestionIndex(0); }}
        className="w-full p-3.5 rounded-xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all text-left cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[13px] font-semibold text-stone-800">{qTitle}</h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {qs.length} questions · {qConfig?.estimated_duration || 5} min{qConfig?.frequency ? ` · ${qConfig.frequency}` : ''}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <ChevronRight size={14} className="text-white" />
          </div>
        </div>
      </button>
    );
  };

  // ── Render any layout element ──
  const renderElement = (el: LayoutElement) => {
    if (el.config.visible === false) return null;
    // Filter by participant type if a filter is active
    if (filterParticipantTypeId && el.config.participant_types && el.config.participant_types.length > 0) {
      if (!el.config.participant_types.includes(filterParticipantTypeId)) return null;
    }

    switch (el.type) {
      case 'progress': {
        const progressStyle = el.config.progress_style || 'bar';
        // Calculate real progress from study duration and questionnaire counts
        const totalQuestionnaires = questionnaires?.filter(q => q.questionnaire_type === 'survey').length || 1;
        const totalSurveySlots = totalQuestionnaires * studyDuration;
        const dayNum = Math.min(Math.ceil(studyDuration * 0.4), studyDuration); // Simulated current day based on study config
        const completedSlots = Math.floor(dayNum * totalQuestionnaires * 0.7); // ~70% completion rate simulation
        const progressPercent = totalSurveySlots > 0 ? Math.round((completedSlots / totalSurveySlots) * 100) : 0;
        const todayEntries = Math.min(totalQuestionnaires, Math.ceil(totalQuestionnaires * 0.6));
        
        if (progressStyle === 'ring') {
          const radius = 28;
          const circumference = 2 * Math.PI * radius;
          const dashoffset = circumference * (1 - progressPercent / 100);
          return (
            <div className="p-4 rounded-xl" style={{ backgroundColor: primaryColor + '12' }}>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r={radius} fill="none" stroke="#e7e5e4" strokeWidth="5" />
                    <circle cx="36" cy="36" r={radius} fill="none" stroke={primaryColor} strokeWidth="5"
                      strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashoffset}
                      transform="rotate(-90 36 36)" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold" style={{ color: primaryColor }}>
                    {progressPercent}%
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-[12px] font-semibold" style={{ color: primaryColor }}>{el.config.title || 'Study Progress'}</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Day {dayNum} of {studyDuration}</p>
                  <p className="text-[10px] text-stone-400">{todayEntries} entries today · {completedSlots} total</p>
                </div>
              </div>
            </div>
          );
        }
        
        if (progressStyle === 'steps') {
          return (
            <div className="p-4 rounded-xl" style={{ backgroundColor: primaryColor + '12' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold" style={{ color: primaryColor }}>{el.config.title || 'Study Progress'}</span>
                <span className="text-[11px] text-stone-400">Day {dayNum} of {studyDuration}</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: studyDuration }, (_, i) => (
                  <div key={i} className="flex-1 h-2 rounded-full transition-all"
                    style={{ backgroundColor: i < dayNum ? primaryColor : '#e7e5e4' }} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-stone-400">
                <span>{todayEntries} entries today</span><span>{completedSlots} total</span>
              </div>
            </div>
          );
        }
        
        // Default: bar
        return (
          <div className="p-4 rounded-xl" style={{ backgroundColor: primaryColor + '12' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold" style={{ color: primaryColor }}>{el.config.title || 'Study Progress'}</span>
              <span className="text-[11px] text-stone-400">Day {dayNum} of {studyDuration}</span>
            </div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${progressPercent}%`, backgroundColor: primaryColor }} />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-stone-400">
              <span>{todayEntries} entries today</span><span>{completedSlots} total</span>
            </div>
          </div>
        );
      }
      case 'questionnaire':
        if (el.config.questionnaire_id) {
          const q = questionnaires?.find(qc => qc.id === el.config.questionnaire_id);
          return renderQuestionnaireCard(el.config.questionnaire_id, q?.title || el.config.title || 'Questionnaire');
        }
        return null;
      case 'consent': {
        const linkedQ = el.config.questionnaire_id ? questionnaires?.find(q => q.id === el.config.questionnaire_id) : null;
        if (linkedQ && activeQuestionnaireId === linkedQ.id) {
          return renderQuestionnaireCard(linkedQ.id, linkedQ.title);
        }
        return (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🛡️</span>
              <h4 className="text-[13px] font-semibold text-amber-800">{el.config.title || 'Consent Form'}</h4>
            </div>
            {linkedQ ? (
              <>
                <p className="text-[11px] text-amber-600">{linkedQ.description || `${linkedQ.questions?.length || 0} fields to complete`}</p>
                <button onClick={(e) => { e.stopPropagation(); setActiveQuestionnaireId(linkedQ.id); setCurrentQuestionIndex(0); }}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[11px] font-medium hover:bg-amber-600 transition-colors">
                  Review & Sign
                </button>
              </>
            ) : (
              <p className="text-[11px] text-amber-600 italic">No consent form linked</p>
            )}
          </div>
        );
      }
      case 'screening': {
        const linkedQ = el.config.questionnaire_id ? questionnaires?.find(q => q.id === el.config.questionnaire_id) : null;
        if (linkedQ && activeQuestionnaireId === linkedQ.id) {
          return renderQuestionnaireCard(linkedQ.id, linkedQ.title);
        }
        return (
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
            <h4 className="text-[13px] font-semibold text-orange-800">📝 {el.config.title || 'Screening'}</h4>
            {linkedQ ? (
              <>
                <p className="text-[11px] text-orange-600 mt-1">{linkedQ.questions?.length || 0} screening questions</p>
                <button onClick={(e) => { e.stopPropagation(); setActiveQuestionnaireId(linkedQ.id); setCurrentQuestionIndex(0); }}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[11px] font-medium hover:bg-orange-600 transition-colors">
                  Start Screening
                </button>
              </>
            ) : (
              <p className="text-[11px] text-orange-600 mt-1 italic">No screening linked</p>
            )}
          </div>
        );
      }
      case 'profile': {
        const linkedQ = el.config.questionnaire_id ? questionnaires?.find(q => q.id === el.config.questionnaire_id) : null;
        if (linkedQ && activeQuestionnaireId === linkedQ.id) {
          return renderQuestionnaireCard(linkedQ.id, linkedQ.title);
        }
        return (
          <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm">
            <h4 className="text-[13px] font-semibold text-stone-800">👤 {el.config.title || 'Profile'}</h4>
            {linkedQ ? (
              <>
                <p className="text-[11px] text-stone-400 mt-1">{linkedQ.questions?.length || 0} profile fields</p>
                <button onClick={(e) => { e.stopPropagation(); setActiveQuestionnaireId(linkedQ.id); setCurrentQuestionIndex(0); }}
                  className="mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
                  Edit Profile
                </button>
              </>
            ) : (
              <div className="mt-2 space-y-2">
                <div className="h-2.5 bg-stone-100 rounded-full w-3/4" />
                <div className="h-2.5 bg-stone-100 rounded-full w-1/2" />
                <p className="text-[10px] text-stone-400 italic">No profile linked</p>
              </div>
            )}
          </div>
        );
      }
      case 'ecogram': {
        const ecogramEnabled = true; // Rendered if placed in layout
        return (
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
            <h4 className="text-[13px] font-semibold text-violet-800">🔗 {el.config.title || 'Ecogram'}</h4>
            <p className="text-[10px] text-violet-500 mt-1">Interactive care network diagram</p>
            <div className="flex justify-center mt-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-violet-300 border-3 border-violet-400 flex items-center justify-center text-[10px] text-white font-bold">You</div>
                {[45, 135, 225, 315].map((angle, i) => (
                  <div key={i} className="absolute w-6 h-6 rounded-full bg-violet-200 border border-violet-300"
                    style={{ top: `${24 - 28 * Math.cos(angle * Math.PI / 180)}px`, left: `${24 + 28 * Math.sin(angle * Math.PI / 180)}px` }} />
                ))}
              </div>
            </div>
            <p className="text-[9px] text-center text-violet-400 mt-2">Tap to edit your network</p>
          </div>
        );
      }
      case 'timeline': {
        const days = el.config.timeline_days || studyDuration || 7;
        const startH = el.config.timeline_start_hour ?? 0;
        const endH = el.config.timeline_end_hour ?? 23;
        const allHours: number[] = [];
        for (let h = startH; h <= endH; h++) allHours.push(h);
        return (
          <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm space-y-3">
            <h4 className="text-[13px] font-semibold text-stone-800">📅 {el.config.title || 'Study Timeline'}</h4>
            <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {Array.from({ length: Math.min(days, 30) }, (_, i) => i + 1).map(d => (
                <button key={d} onClick={(e) => { e.stopPropagation(); setSelectedTimelineDay(d); }}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all shrink-0"
                  style={{ backgroundColor: d === selectedTimelineDay ? primaryColor : 'transparent', color: d === selectedTimelineDay ? 'white' : '#a8a29e' }}>
                  D{d}
                </button>
              ))}
              {days > 30 && <span className="text-[9px] text-stone-400 self-center ml-1">+{days - 30}</span>}
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {allHours.map(h => {
                const hasQ = h % 2 === 0 && h >= 8 && h <= 20;
                const isCompleted = hasQ && h <= 10 && selectedTimelineDay <= 2;
                const isMissed = hasQ && h >= 18 && selectedTimelineDay < 2;
                const isScheduled = hasQ && !isCompleted && !isMissed;
                const targetQ = questionnaires?.find(q => q.questionnaire_type === 'survey') || questionnaires?.[0];
                return (
                  <div key={h} className="flex items-center gap-2">
                    <span className="text-[9px] text-stone-300 w-7 text-right shrink-0 font-mono">{String(h).padStart(2, '0')}:00</span>
                    <div className={`flex-1 rounded-md transition-all ${hasQ ? 'py-1.5 px-2 cursor-pointer hover:opacity-80' : 'h-px bg-stone-50'}`}
                      onClick={hasQ && targetQ ? (e) => { e.stopPropagation(); setActiveQuestionnaireId(targetQ.id); setCurrentQuestionIndex(0); } : undefined}
                      style={{ backgroundColor: isCompleted ? '#dcfce7' : isMissed ? '#fee2e2' : isScheduled ? '#f0fdf4' : undefined }}>
                      {hasQ && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium" style={{ color: isCompleted ? '#16a34a' : isMissed ? '#dc2626' : '#a8a29e' }}>
                            {targetQ?.title || 'Survey'}
                          </span>
                          <span className="text-[9px]" style={{ color: isCompleted ? '#16a34a' : isMissed ? '#dc2626' : '#a8a29e' }}>
                            {isCompleted ? '✓' : isMissed ? '✗' : '○'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-[10px] text-stone-400"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Done</span>
              <span className="flex items-center gap-1 text-[10px] text-stone-400"><span className="w-2 h-2 rounded-full bg-stone-200 inline-block" /> Scheduled</span>
              <span className="flex items-center gap-1 text-[10px] text-stone-400"><span className="w-2 h-2 rounded-full bg-red-300 inline-block" /> Missed</span>
            </div>
          </div>
        );
      }
      case 'help': {
        const linkedQ = el.config.questionnaire_id ? questionnaires?.find(q => q.id === el.config.questionnaire_id) : null;
        if (linkedQ && activeQuestionnaireId === linkedQ.id) {
          return renderQuestionnaireCard(linkedQ.id, linkedQ.title);
        }
        return (
          <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm">
            <h4 className="text-[13px] font-semibold text-stone-800">❓ {el.config.title || 'Help & FAQ'}</h4>
            {linkedQ ? (
              <>
                <p className="text-[11px] text-stone-400 mt-1">{linkedQ.questions?.length || 0} help items</p>
                <button onClick={(e) => { e.stopPropagation(); setActiveQuestionnaireId(linkedQ.id); setCurrentQuestionIndex(0); }}
                  className="mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
                  View Help
                </button>
              </>
            ) : (
              <p className="text-[11px] text-stone-400 mt-1">Common questions and support contact</p>
            )}
          </div>
        );
      }
      case 'custom': {
        const linkedQ = el.config.questionnaire_id ? questionnaires?.find(q => q.id === el.config.questionnaire_id) : null;
        if (linkedQ && activeQuestionnaireId === linkedQ.id) {
          return renderQuestionnaireCard(linkedQ.id, linkedQ.title);
        }
        return (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <h4 className="text-[13px] font-semibold text-emerald-800">🧩 {el.config.title || 'Custom Component'}</h4>
            {linkedQ ? (
              <>
                <p className="text-[11px] text-emerald-600 mt-1">{linkedQ.questions?.length || 0} fields</p>
                <button onClick={(e) => { e.stopPropagation(); setActiveQuestionnaireId(linkedQ.id); setCurrentQuestionIndex(0); }}
                  className="mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-colors">
                  Open
                </button>
              </>
            ) : (
              <p className="text-[11px] text-emerald-600 mt-1 italic">No component linked</p>
            )}
          </div>
        );
      }
      case 'text_block':
        return (
          <div className="p-3 rounded-xl bg-stone-50">
            <p className="text-[12px] text-stone-600">{el.config.content || el.config.title || 'Text content...'}</p>
          </div>
        );
      case 'spacer':
        return <div style={{ height: el.config.style?.height || '16px' }} />;
      case 'divider':
        return <div className="border-t border-stone-200 my-2" />;
      case 'button':
        return (
          <button className="w-full py-3 rounded-xl text-[13px] font-semibold text-white" style={{ backgroundColor: primaryColor }}>
            {el.config.button_label || el.config.title || 'Button'}
          </button>
        );
      case 'image':
        return el.config.image_url ? (
          <img src={el.config.image_url} alt="" className="w-full rounded-xl" />
        ) : (
          <div className="rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center h-24">
            <span className="text-[11px] text-stone-400">🖼️ No image set</span>
          </div>
        );
      case 'todo_list': {
        const cards = el.config.todo_cards || [];
        return (
          <div className="space-y-2">
            <h4 className="text-[13px] font-semibold text-stone-800">✅ {el.config.title || 'To-Do'}</h4>
            {cards.length === 0 ? (
              <p className="text-[11px] text-stone-400 italic">No tasks configured</p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
                {cards.map((card, ci) => {
                  const isFirst = ci === 0;
                  const qTitle = card.type === 'questionnaire' ? (questionnaires?.find(q => q.id === card.questionnaire_id)?.title || 'Survey') : card.title;
                  return (
                    <div key={card.id} className="shrink-0 w-[85%] p-3.5 rounded-xl border shadow-sm transition-all"
                      style={{ scrollSnapAlign: 'start', backgroundColor: isFirst ? '#f0fdf4' : 'white', borderColor: isFirst ? '#86efac' : '#e7e5e4' }}
                      onClick={card.type === 'questionnaire' && card.questionnaire_id ? (e) => { e.stopPropagation(); setActiveQuestionnaireId(card.questionnaire_id!); setCurrentQuestionIndex(0); } : undefined}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-stone-800">{qTitle || 'Task'}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: isFirst ? '#dcfce7' : '#f5f5f4', color: isFirst ? '#16a34a' : '#a8a29e' }}>
                          {isFirst ? 'Current' : card.completion_trigger === 'time' ? 'Timed' : 'Upcoming'}
                        </span>
                      </div>
                      {card.description && <p className="text-[10px] text-stone-400">{card.description}</p>}
                      {card.type === 'questionnaire' && (
                        <div className="mt-2 flex items-center gap-1">
                          <ChevronRight size={10} className="text-emerald-500" />
                          <span className="text-[10px] text-emerald-600 font-medium">Start</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
      default:
        return (
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[11px] text-stone-400">{el.type}</span>
          </div>
        );
    }
  };

  // ── Resize logic ──
  const resizeRef = useRef<{ elementId: string; dir: 'height' | 'width'; startY: number; startX: number; startVal: number } | null>(null);
  const deltaRef = useRef<{ dw: number; dh: number }>({ dw: 0, dh: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeDelta, setResizeDelta] = useState<{ dw: number; dh: number }>({ dw: 0, dh: 0 });
  const [selectedElId, setSelectedElId] = useState<string | null>(null);

  const startResize = useCallback((e: React.MouseEvent | React.TouchEvent, elementId: string, dir: 'height' | 'width', currentVal: number) => {
    e.stopPropagation();
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    resizeRef.current = { elementId, dir, startY: clientY, startX: clientX, startVal: currentVal };
    deltaRef.current = { dw: 0, dh: 0 };
    setResizingId(elementId);
    setResizeDelta({ dw: 0, dh: 0 });

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!resizeRef.current) return;
      const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      const dx = cx - resizeRef.current.startX;
      const dy = cy - resizeRef.current.startY;
      deltaRef.current = { dw: dx, dh: dy };
      setResizeDelta({ dw: dx, dh: dy });
    };

    const onEnd = () => {
      if (resizeRef.current && onUpdateElement) {
        const { elementId: eid, dir: d, startVal: sv } = resizeRef.current;
        const el = activeTab?.elements.find(e => e.id === eid);
        if (d === 'height') {
          const newH = Math.max(40, sv + deltaRef.current.dh);
          onUpdateElement(eid, { style: { ...el?.config.style, height: `${Math.round(newH)}px` } });
        } else {
          const containerW = frameWidth - 32;
          const currentPct = parseInt(el?.config.width || '100') || 100;
          const currentPx = (currentPct / 100) * containerW;
          const newPx = currentPx + deltaRef.current.dw;
          const pct = Math.round((newPx / containerW) * 100);
          const snapped = pct >= 90 ? '100%' : pct >= 62 ? '75%' : pct >= 40 ? '50%' : pct >= 28 ? '33%' : '25%';
          onUpdateElement(eid, { width: snapped });
        }
      }
      resizeRef.current = null;
      deltaRef.current = { dw: 0, dh: 0 };
      setResizingId(null);
      setResizeDelta({ dw: 0, dh: 0 });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }, [onUpdateElement, activeTab, frameWidth]);

  // Measure actual rendered height for resize start value
  const elRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Wrap element with editable controls ──
  const renderElementWrapper = (el: LayoutElement, index: number) => {
    const isHighlighted = highlightedElementId === el.id;
    const isSelected = selectedElId === el.id;
    const isResizing = resizingId === el.id;
    const showControls = isHighlighted || isSelected || isResizing;
    const content = renderElement(el);
    if (content === null) return null;

    if (editable) {
      const explicitHeight = el.config.style?.height ? parseInt(el.config.style.height) : 0;
      const savedHeight = el.config.style?.height || '';

      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedElId(isSelected ? null : el.id);
        onElementClick?.(el.id);
      };

      const getResizeStartHeight = () => {
        if (explicitHeight > 0) return explicitHeight;
        const domEl = elRefs.current[el.id];
        return domEl ? domEl.getBoundingClientRect().height : 100;
      };

      // Compute live height during resize
      const liveHeight = isResizing && resizeRef.current?.dir === 'height'
        ? Math.max(40, (explicitHeight || (elRefs.current[el.id]?.getBoundingClientRect().height ?? 100)) + resizeDelta.dh)
        : explicitHeight;

      return (
        <Draggable key={el.id} draggableId={`phone-el-${el.id}`} index={index}>
          {(provided, snapshot) => (
            <div
              ref={(node) => { provided.innerRef(node); elRefs.current[el.id] = node; }}
              {...provided.draggableProps}
              data-resize-id={el.id}
              className={`relative group/el transition-all rounded-xl cursor-pointer ${showControls ? 'ring-2 ring-emerald-400 shadow-emerald-100 shadow-md' : 'hover:ring-1 hover:ring-stone-300'} ${snapshot.isDragging ? 'ring-2 ring-blue-400 shadow-lg z-50' : ''} ${isResizing ? 'ring-2 ring-blue-400' : ''}`}
              style={{
                ...(savedHeight && !isResizing ? { height: savedHeight, overflow: 'hidden' } : {}),
                ...(isResizing && resizeRef.current?.dir === 'height' ? { height: `${liveHeight}px`, overflow: 'hidden' } : {}),
                ...(provided.draggableProps.style || {}),
              }}
              onClick={handleClick}
            >
              {/* Floating toolbar — visible on click/select */}
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 bg-white rounded-full shadow-lg border border-stone-200 px-1.5 py-0.5 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0 group-hover/el:opacity-100'}`}>
                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 hover:bg-stone-100 rounded-full" title="Drag to reorder">
                  <Move size={11} className="text-stone-500" />
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); onElementClick?.(el.id); }}
                  className="p-1 hover:bg-emerald-50 rounded-full" title="Edit settings">
                  <Edit3 size={11} className="text-emerald-500" />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveElement?.(el.id); }}
                  className="p-1 hover:bg-red-50 rounded-full" title="Delete">
                  <Trash2 size={11} className="text-red-400" />
                </button>
              </div>

              {/* Dimension badge */}
              {showControls && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 bg-stone-800 text-white text-[9px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap">
                  {el.config.width || '100%'} × {isResizing && resizeRef.current?.dir === 'height' 
                    ? `${liveHeight}px` 
                    : (savedHeight || 'auto')}
                </div>
              )}

              {content}

              {/* Bottom resize handle (height) — shows on click */}
              {showControls && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-3 cursor-row-resize z-10 flex items-center justify-center group/resize"
                  onMouseDown={(e) => startResize(e, el.id, 'height', getResizeStartHeight())}
                  onTouchStart={(e) => startResize(e, el.id, 'height', getResizeStartHeight())}
                >
                  <div className="w-12 h-1.5 bg-emerald-400 rounded-full opacity-70 group-hover/resize:opacity-100 transition-opacity" />
                </div>
              )}

              {/* Right resize handle (width) — shows on click */}
              {showControls && (
                <div
                  className="absolute top-0 right-0 bottom-0 w-3 cursor-col-resize z-10 flex items-center justify-center group/resize"
                  onMouseDown={(e) => startResize(e, el.id, 'width', 0)}
                  onTouchStart={(e) => startResize(e, el.id, 'width', 0)}
                >
                  <div className="h-12 w-1.5 bg-emerald-400 rounded-full opacity-70 group-hover/resize:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          )}
        </Draggable>
      );
    }

    // Non-editable (Preview tab)
    return (
      <div
        key={el.id}
        className={`transition-all ${onElementClick ? 'cursor-pointer' : ''} ${isHighlighted ? 'ring-2 ring-emerald-400 rounded-xl' : ''}`}
        onClick={() => onElementClick?.(el.id)}
      >
        {content}
      </div>
    );
  };

  // ── Elements list (with or without DnD) ──
  const renderElements = () => {
    if (!activeTab || activeTab.elements.length === 0) {
      return (
        <div className="py-16 text-center">
          <p className="text-[12px] text-stone-400">No elements on this tab</p>
          <p className="text-[11px] text-stone-300 mt-1">Add elements in the editor</p>
        </div>
      );
    }

    const hasWidths = activeTab.elements.some(e => e.config.width && e.config.width !== '100%');
    const containerClass = hasWidths ? 'flex flex-wrap gap-3 py-4' : 'space-y-3 py-4';

    if (editable) {
      return (
        <Droppable droppableId={`phone-elements-${activeTab.id}`} type="ELEMENT">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`${containerClass} min-h-[100px] transition-colors ${snapshot.isDraggingOver ? 'bg-emerald-50/30 rounded-xl' : ''}`}
            >
              {activeTab.elements.map((el, idx) => {
                const w = el.config.width || '100%';
                const wrapped = renderElementWrapper(el, idx);
                if (!wrapped) return null;
                return (
                  <div key={el.id} style={{ width: w === '100%' ? '100%' : `calc(${w} - 8px)` }}>
                    {wrapped}
                  </div>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    }

    return (
      <div className={containerClass}>
        {activeTab.elements.map((el, idx) => {
          const w = el.config.width || '100%';
          const wrapped = renderElementWrapper(el, idx);
          if (!wrapped) return null;
          return (
            <div key={el.id} style={{ width: w === '100%' ? '100%' : `calc(${w} - 8px)` }}>
              {wrapped}
            </div>
          );
        })}
      </div>
    );
  };

  // ── The phone frame ──
  const bottomNavHeight = 56;
  const headerHeight = layout.show_header ? 44 : 0;
  const notchHeight = 28;
  const contentHeight = frameHeight - bottomNavHeight - headerHeight - notchHeight;

  const phoneContent = (
    <div className="rounded-[2rem] overflow-hidden flex flex-col" style={{ backgroundColor: bgColor, height: `${frameHeight}px` }}>
      {/* Notch */}
      <div className="flex-shrink-0 flex items-center justify-center relative" style={{ height: `${notchHeight}px` }}>
        <div className="w-20 h-4 bg-stone-900 rounded-b-2xl absolute top-0" />
      </div>
      {/* Header */}
      {layout.show_header && (
        <div className="flex-shrink-0 px-5 py-3 bg-white/80 backdrop-blur-sm border-b border-stone-100">
          <h1 className="text-[15px] font-bold text-stone-800">
            {layout.header_title || activeTab?.label || 'Home'}
          </h1>
        </div>
      )}
      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto" style={{ minHeight: 0 }}>
        {activeQuestionnaireId ? (
          <div className="py-4">
            {renderQuestionnaireCard(activeQuestionnaireId, questionnaires?.find(q => q.id === activeQuestionnaireId)?.title || '')}
          </div>
        ) : (
          renderElements()
        )}
      </div>
      {/* Bottom Nav */}
      <div className="flex-shrink-0 border-t border-stone-200/50 flex items-center justify-around px-4 bg-white" style={{ height: `${bottomNavHeight}px` }}>
        {layout.bottom_nav.map(nav => {
          const IconComp = ICON_MAP[nav.icon] || Home;
          const isActive = currentTabId === nav.tab_id;
          return (
            <button key={nav.tab_id} type="button" onClick={() => { setCurrentTabId(nav.tab_id); setActiveQuestionnaireId(null); setCurrentQuestionIndex(0); }}
              className="flex flex-col items-center gap-0.5 cursor-pointer">
              <IconComp size={18} style={{ color: isActive ? primaryColor : '#a8a29e' }} />
              <span className="text-[9px] font-medium" style={{ color: isActive ? primaryColor : '#a8a29e' }}>{nav.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (scale !== 1) {
    return (
      <div style={{ width: `${frameWidth * scale}px`, height: `${frameHeight * scale}px`, overflow: 'hidden' }}>
        <div style={{ width: `${frameWidth}px`, height: `${frameHeight}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <div className="bg-stone-900 rounded-[2.5rem] p-2.5 shadow-2xl" style={{ width: `${frameWidth}px` }}>
            {phoneContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 rounded-[2.5rem] p-2.5 shadow-2xl" style={{ maxWidth: `${frameWidth}px`, margin: '0 auto' }}>
      {phoneContent}
    </div>
  );
};

export default AppPhonePreview;
