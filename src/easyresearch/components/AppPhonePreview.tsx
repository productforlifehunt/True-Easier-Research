import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Home, FileText, Settings, BarChart3, HelpCircle, Layout } from 'lucide-react';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';
import type { AppLayout, LayoutElement } from './LayoutBuilder';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';

interface AppPhonePreviewProps {
  layout: AppLayout;
  questionnaires: QuestionnaireConfig[];
  participantTypes?: ParticipantType[];
  studyDuration?: number;
  /** Which tab is active (controlled from outside for Layout builder sync) */
  activeTabId?: string;
  onActiveTabChange?: (tabId: string) => void;
  /** Highlight element on click (for Layout builder) */
  highlightedElementId?: string | null;
  onElementClick?: (elementId: string) => void;
  /** Visual scale factor — phone is always rendered at full size then CSS-scaled */
  scale?: number;
  /** Height of the phone frame */
  frameHeight?: number;
}

const ICON_MAP: Record<string, React.FC<any>> = {
  Home, FileText, BarChart3, HelpCircle, Settings, Layout,
};

const AppPhonePreview: React.FC<AppPhonePreviewProps> = ({
  layout, questionnaires, participantTypes, studyDuration = 7,
  activeTabId: controlledTabId, onActiveTabChange,
  highlightedElementId, onElementClick,
  scale = 1, frameHeight = 680,
}) => {
  const [internalTabId, setInternalTabId] = useState(layout.tabs[0]?.id || '');
  const [activeQuestionnaireId, setActiveQuestionnaireId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [selectedTimelineDay, setSelectedTimelineDay] = useState(2);

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

  // ── Question input renderer ──
  const renderQuestionInput = (question: any) => {
    const value = responses[question.id];
    const normalizedType = normalizeLegacyQuestionType(question.question_type);

    switch (normalizedType) {
      case 'single_choice':
        return (<div className="space-y-2">{question.options?.map((option: any, index: number) => { const optText = typeof option === 'string' ? option : option.option_text; const optVal = typeof option === 'string' ? option : option.id || option.option_text; return (<label key={index} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${value === optVal ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}><input type="radio" checked={value === optVal || false} onChange={() => handleResponse(question.id, optVal)} className="mr-3 accent-emerald-500" /><span className="text-[13px] text-stone-700">{optText}</span></label>);})}</div>);
      case 'multiple_choice':
      case 'checkbox_group':
        return (<div className="space-y-2">{question.options?.map((option: any, index: number) => { const optText = typeof option === 'string' ? option : option.option_text; const optVal = typeof option === 'string' ? option : option.id || option.option_text; const selected = Array.isArray(value) ? value.includes(optVal) : false; return (<label key={index} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}><input type="checkbox" checked={selected} onChange={(e) => { const cur = value || []; handleResponse(question.id, e.target.checked ? [...cur, optVal] : cur.filter((v: string) => v !== optVal)); }} className="mr-3 accent-emerald-500" /><span className="text-[13px] text-stone-700">{optText}</span></label>);})}</div>);
      case 'text_short': return <input type="text" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Your answer..." />;
      case 'text_long': return <textarea value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20" rows={4} placeholder="Your answer..." />;
      case 'number': return <input type="number" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Enter number..." />;
      case 'likert_scale':
        const lc = question.question_config || {}; const ls = lc.scale_type || '1-5'; const [lmin, lmax] = ls.split('-').map(Number); const lo: number[] = []; for (let i = lmin; i <= lmax; i++) lo.push(i);
        return (<div className="flex justify-between gap-1">{lo.map(v => (<div key={v} onClick={() => handleResponse(question.id, v)} className="flex-1 text-center cursor-pointer"><div className={`aspect-square flex items-center justify-center rounded-xl border-2 font-semibold text-[14px] mb-1 transition-all hover:scale-105 ${value === v ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-200 text-stone-600'}`}>{v}</div><p className="text-[9px] text-stone-400">{lc.labels?.[v] || lc.custom_labels?.[v - lmin] || ''}</p></div>))}</div>);
      case 'bipolar_scale':
        const bMin = question.question_config?.min_value ?? -3; const bMax = question.question_config?.max_value ?? 3;
        const bPoints: number[] = []; for (let i = bMin; i <= bMax; i++) bPoints.push(i);
        return (<div className="space-y-2"><div className="flex justify-center gap-1 flex-wrap">{bPoints.map(v => (<button key={v} onClick={() => handleResponse(question.id, v)} className="w-10 h-10 rounded-xl border-2 font-semibold text-[12px] transition-all hover:scale-105" style={{ borderColor: value === v ? (v < 0 ? '#ef4444' : v > 0 ? '#10b981' : '#6b7280') : '#e7e5e4', backgroundColor: value === v ? (v < 0 ? '#fef2f2' : v > 0 ? '#f0fdf4' : '#f9fafb') : 'white', color: v < 0 ? '#ef4444' : v > 0 ? '#10b981' : '#6b7280' }}>{v > 0 ? `+${v}` : v}</button>))}</div><div className="flex justify-between text-[11px] text-stone-400"><span>{question.question_config?.min_label || ''}</span><span>{question.question_config?.max_label || ''}</span></div></div>);
      case 'rating':
        const maxR = question.question_config?.max_value ?? 5;
        return (<div className="flex gap-2 justify-center">{Array.from({length: maxR}, (_, i) => i + 1).map(s => (<button key={s} type="button" onClick={() => handleResponse(question.id, s)} className="text-2xl hover:scale-110 transition-transform" style={{color: (value || 0) >= s ? '#fbbf24' : '#d1d5db'}}>★</button>))}</div>);
      case 'nps':
        return (<div className="flex flex-wrap gap-1 justify-center">{[0,1,2,3,4,5,6,7,8,9,10].map(n => (<button key={n} onClick={() => handleResponse(question.id, n)} className={`w-9 h-9 rounded-lg font-medium text-[12px] transition-all ${value === n ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{n}</button>))}</div>);
      case 'yes_no':
        return (<div className="flex gap-3">{['Yes', 'No'].map(opt => (<button key={opt} onClick={() => handleResponse(question.id, opt)} className={`flex-1 py-3 rounded-xl border-2 text-[13px] font-medium transition-all ${value === opt ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>{opt}</button>))}</div>);
      default: return <p className="text-[12px] text-stone-400 italic">Preview not available for: {question.question_type}</p>;
    }
  };

  // ── Questionnaire card/expanded view ──
  const renderQuestionnaireCard = (qId: string, qTitle: string) => {
    const qs = getQuestionsForQuestionnaire(qId);
    const qConfig = questionnaires?.find(q => q.id === qId);

    if (activeQuestionnaireId === qId) {
      const currentQ = qs[currentQuestionIndex];
      const progress = qs.length > 0 ? ((currentQuestionIndex + 1) / qs.length) * 100 : 0;
      return (
        <div className="space-y-3">
          <button onClick={() => { setActiveQuestionnaireId(null); setCurrentQuestionIndex(0); }}
            className="flex items-center gap-1 text-[12px] text-stone-500 hover:text-stone-700">
            <ChevronLeft size={14} /> Back to {activeTab?.label || 'Home'}
          </button>
          <div>
            <div className="flex justify-between text-[11px] text-stone-400 mb-1">
              <span>{qTitle} — Q{currentQuestionIndex + 1}/{qs.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: primaryColor }} />
            </div>
          </div>
          {currentQ && (
            <div className="space-y-3">
              <h3 className="text-[14px] font-semibold text-stone-800">
                {currentQ.question_text}{currentQ.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {currentQ.question_description && <p className="text-[12px] text-stone-400">{currentQ.question_description}</p>}
              {renderQuestionInput(currentQ)}
            </div>
          )}
          {qs.length === 0 && (
            <p className="text-[12px] text-stone-400 italic py-4 text-center">No questions added to this questionnaire yet.</p>
          )}
          {qs.length > 0 && (
            <div className="flex justify-between pt-3 border-t border-stone-100">
              <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium border border-stone-200 text-stone-500 disabled:opacity-40">
                <ChevronLeft size={12} /> Back
              </button>
              {currentQuestionIndex === qs.length - 1 ? (
                <button onClick={() => { setActiveQuestionnaireId(null); setCurrentQuestionIndex(0); }}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-full text-[12px] font-medium text-white" style={{ backgroundColor: primaryColor }}>
                  Submit <Check size={12} />
                </button>
              ) : (
                <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-full text-[12px] font-medium text-white" style={{ backgroundColor: primaryColor }}>
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
      <button
        onClick={() => { setActiveQuestionnaireId(qId); setCurrentQuestionIndex(0); }}
        className="w-full p-3.5 rounded-xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all text-left"
      >
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

    switch (el.type) {
      case 'progress':
        return (
          <div className="p-4 rounded-xl" style={{ backgroundColor: primaryColor + '12' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold" style={{ color: primaryColor }}>{el.config.title || 'Study Progress'}</span>
              <span className="text-[11px] text-stone-400">Day 3 of {studyDuration}</span>
            </div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '43%', backgroundColor: primaryColor }} />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-stone-400">
              <span>3 entries today</span>
              <span>7 total</span>
            </div>
          </div>
        );

      case 'questionnaire':
        if (el.config.questionnaire_id) {
          const q = questionnaires?.find(qc => qc.id === el.config.questionnaire_id);
          return renderQuestionnaireCard(el.config.questionnaire_id, q?.title || el.config.title || 'Questionnaire');
        }
        return null;

      case 'consent':
        return (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🛡️</span>
              <h4 className="text-[13px] font-semibold text-amber-800">{el.config.title || 'Consent Form'}</h4>
            </div>
            <p className="text-[11px] text-amber-600">{el.config.consent_text || 'Tap to review and sign the consent form'}</p>
            <button className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[11px] font-medium">Review & Sign</button>
          </div>
        );

      case 'screening':
        return (
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
            <h4 className="text-[13px] font-semibold text-orange-800">📝 {el.config.title || 'Screening'}</h4>
            <p className="text-[11px] text-orange-600 mt-1">{el.config.screening_criteria || 'Answer screening questions to check eligibility'}</p>
          </div>
        );

      case 'profile':
        return (
          <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm">
            <h4 className="text-[13px] font-semibold text-stone-800">👤 {el.config.title || 'Profile'}</h4>
            <div className="mt-2 space-y-2">
              <div className="h-2.5 bg-stone-100 rounded-full w-3/4" />
              <div className="h-2.5 bg-stone-100 rounded-full w-1/2" />
            </div>
          </div>
        );

      case 'ecogram':
        return (
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
            <h4 className="text-[13px] font-semibold text-violet-800">🔗 {el.config.title || 'Ecogram'}</h4>
            <div className="flex justify-center mt-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-violet-300 border-3 border-violet-400 flex items-center justify-center text-[10px] text-white font-bold">You</div>
                {[45, 135, 225, 315].map((angle, i) => (
                  <div key={i} className="absolute w-6 h-6 rounded-full bg-violet-200 border border-violet-300"
                    style={{ top: `${24 - 28 * Math.cos(angle * Math.PI / 180)}px`, left: `${24 + 28 * Math.sin(angle * Math.PI / 180)}px` }} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'timeline': {
        const timelineDays = Math.min(studyDuration, 30);
        const sampleHours = [8, 10, 12, 14, 16, 18, 20];
        return (
          <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm space-y-3">
            <h4 className="text-[13px] font-semibold text-stone-800">📅 {el.config.title || 'Study Timeline'}</h4>
            {/* Day selector */}
            <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {Array.from({ length: Math.min(timelineDays, 14) }, (_, i) => i + 1).map(d => (
                <button key={d}
                   onClick={() => setSelectedTimelineDay(d)}
                   className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0"
                   style={{
                     backgroundColor: d === selectedTimelineDay ? primaryColor : 'transparent',
                     color: d === selectedTimelineDay ? 'white' : '#a8a29e',
                  }}>
                  D{d}
                </button>
              ))}
              {timelineDays > 14 && <span className="text-[10px] text-stone-400 self-center ml-1">+{timelineDays - 14}</span>}
            </div>
            {/* Hourly grid */}
            <div className="space-y-1">
              {sampleHours.map(h => {
                const hasQ = h === 10 || h === 14 || h === 20;
                const isCompleted = h === 10 && selectedTimelineDay <= 2;
                const isMissed = h === 20 && selectedTimelineDay < 2;
                const isScheduled = hasQ && !isCompleted && !isMissed;
                return (
                  <div key={h} className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-300 w-8 text-right shrink-0">{h}:00</span>
                    <div className={`flex-1 rounded-lg transition-all ${hasQ ? 'p-2' : 'h-1'}`}
                      style={{
                        backgroundColor: isCompleted ? '#dcfce7' : isMissed ? '#fee2e2' : isScheduled ? '#f0fdf4' : 'transparent',
                      }}>
                      {hasQ && (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium" style={{
                            color: isCompleted ? '#16a34a' : isMissed ? '#dc2626' : '#a8a29e'
                          }}>
                            {questionnaires[0]?.title || 'Survey'}
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
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-[10px] text-stone-400"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Done</span>
              <span className="flex items-center gap-1 text-[10px] text-stone-400"><span className="w-2 h-2 rounded-full bg-stone-200 inline-block" /> Scheduled</span>
              <span className="flex items-center gap-1 text-[10px] text-stone-400"><span className="w-2 h-2 rounded-full bg-red-300 inline-block" /> Missed</span>
            </div>
          </div>
        );
      }

      case 'help':
        return (
          <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm">
            <h4 className="text-[13px] font-semibold text-stone-800">❓ {el.config.title || 'Help & FAQ'}</h4>
            <p className="text-[11px] text-stone-400 mt-1">Common questions and support contact</p>
          </div>
        );

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

      default:
        return (
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[11px] text-stone-400">{el.type}</span>
          </div>
        );
    }
  };

  // ── The phone frame ──
  const phoneContent = (
    <div className="rounded-[2rem] overflow-hidden" style={{ backgroundColor: bgColor, height: `${frameHeight}px` }}>
      {/* Notch */}
      <div className="h-7 flex items-center justify-center relative">
        <div className="w-20 h-4 bg-stone-900 rounded-b-2xl absolute top-0" />
      </div>
      {/* Header */}
      {layout.show_header && (
        <div className="px-5 py-3 bg-white/80 backdrop-blur-sm border-b border-stone-100">
          <h1 className="text-[15px] font-bold text-stone-800">
            {layout.header_title || activeTab?.label || 'Home'}
          </h1>
        </div>
      )}
      {/* Content */}
      <div className="px-4 overflow-y-auto" style={{ height: `${frameHeight - 95}px` }}>
        <div className="space-y-3 py-4">
          {activeQuestionnaireId ? (
            renderQuestionnaireCard(activeQuestionnaireId,
              questionnaires?.find(q => q.id === activeQuestionnaireId)?.title || '',
            )
          ) : (
            activeTab?.elements.map(el => (
              <div
                key={el.id}
                className={`transition-all ${onElementClick ? 'cursor-pointer' : ''} ${highlightedElementId === el.id ? 'ring-2 ring-emerald-400 rounded-xl' : ''}`}
                onClick={() => onElementClick?.(el.id)}
              >
                {renderElement(el)}
              </div>
            ))
          )}
          {!activeQuestionnaireId && (!activeTab || activeTab.elements.length === 0) && (
            <div className="py-16 text-center">
              <p className="text-[12px] text-stone-400">No elements on this tab</p>
              <p className="text-[11px] text-stone-300 mt-1">Add elements in the Layout tab</p>
            </div>
          )}
        </div>
      </div>
      {/* Bottom Nav */}
      <div className="h-16 border-t border-stone-200/50 flex items-center justify-around px-4 bg-white">
        {layout.bottom_nav.map(nav => {
          const IconComp = ICON_MAP[nav.icon] || Home;
          const isActive = currentTabId === nav.tab_id;
          return (
            <button key={nav.tab_id} onClick={() => { setCurrentTabId(nav.tab_id); setActiveQuestionnaireId(null); setCurrentQuestionIndex(0); }}
              className="flex flex-col items-center gap-0.5">
              <IconComp size={18} style={{ color: isActive ? primaryColor : '#a8a29e' }} />
              <span className="text-[9px] font-medium" style={{ color: isActive ? primaryColor : '#a8a29e' }}>{nav.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (scale !== 1) {
    const scaledWidth = 375;
    const scaledHeight = frameHeight;
    return (
      <div style={{ width: `${scaledWidth * scale}px`, height: `${scaledHeight * scale}px`, overflow: 'hidden' }}>
        <div style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <div className="bg-stone-900 rounded-[2.5rem] p-2.5 shadow-2xl" style={{ width: `${scaledWidth}px` }}>
            {phoneContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 rounded-[2.5rem] p-2.5 shadow-2xl" style={{ maxWidth: '375px' }}>
      {phoneContent}
    </div>
  );
};

export default AppPhonePreview;
