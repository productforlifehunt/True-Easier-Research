import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Smartphone, Monitor, Home, FileText, Settings, BarChart3, HelpCircle, Layout } from 'lucide-react';
import { normalizeLegacyQuestionType, groupQuestionsBySections, type QuestionSection } from '../constants/questionTypes';
import type { AppLayout, LayoutElement } from './LayoutBuilder';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';
import AppPhonePreview from './AppPhonePreview';
import { DEVICE_PRESETS, DEFAULT_DEVICE, type DevicePreset } from '../constants/devicePresets';

interface SurveyPreviewProps {
  questions: any[];
  projectTitle: string;
  projectDescription: string;
  appLayout?: AppLayout;
  questionnaires?: QuestionnaireConfig[];
  participantTypes?: ParticipantType[];
  studyDuration?: number;
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({
  questions, projectTitle, projectDescription,
  appLayout, questionnaires, participantTypes, studyDuration = 7,
}) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEFAULT_DEVICE);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [filterParticipantTypeId, setFilterParticipantTypeId] = useState<string | null>(null);
  // Legacy hooks
  const sections = groupQuestionsBySections(questions);
  const hasSections = sections.length > 1 || (sections.length === 1 && sections[0].id !== 'default');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [legacyQIndex, setLegacyQIndex] = useState(0);

  const isLayoutDriven = !!appLayout && appLayout.tabs.length > 0;

  const handleResponse = (questionId: string, value: any) => setResponses({ ...responses, [questionId]: value });

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
      case 'section_header':
        return null;
      case 'date':
        return <input type="date" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />;
      default: return <p className="text-[12px] text-stone-400 italic">Preview not available for: {question.question_type}</p>;
    }
  };

  // ── Layout-driven preview — uses shared AppPhonePreview ──
  if (isLayoutDriven && appLayout && questionnaires) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-[17px] font-semibold tracking-tight text-stone-800">App Preview</h2>
          <div className="flex gap-1 bg-stone-100 rounded-full p-0.5 flex-wrap">
            {DEVICE_PRESETS.map(d => (
              <button key={d.id} onClick={() => setSelectedDevice(d)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${selectedDevice.id === d.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-500'}`}>
                {d.brand === 'apple' ? '🍎' : '🤖'} {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Participant type filter */}
        {participantTypes && participantTypes.length > 0 && (
          <div className="flex gap-1 bg-stone-100 rounded-full p-0.5 justify-center flex-wrap">
            <button onClick={() => setFilterParticipantTypeId(null)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${!filterParticipantTypeId ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-500'}`}>
              All Roles
            </button>
            {participantTypes.map(pt => (
              <button key={pt.id} onClick={() => setFilterParticipantTypeId(pt.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${filterParticipantTypeId === pt.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-500'}`}>
                {pt.name}
              </button>
            ))}
          </div>
        )}

        <p className="text-[11px] text-stone-400 text-center">{selectedDevice.label} — {selectedDevice.width}×{selectedDevice.height}</p>

        <div className="bg-stone-100 rounded-2xl p-6 lg:p-10 flex justify-center">
          <AppPhonePreview
            layout={appLayout}
            questionnaires={questionnaires}
            participantTypes={participantTypes}
            studyDuration={studyDuration}
            frameWidth={selectedDevice.width}
            frameHeight={selectedDevice.height}
            filterParticipantTypeId={filterParticipantTypeId}
          />
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-stone-800 mb-1">Live Preview</h3>
          <p className="text-[13px] text-stone-400 font-light">
            This preview renders exactly what participants will see. Use the role filter to see what each participant type sees. Responses are not saved.
          </p>
        </div>
      </div>
    );
  }

  // ── Fallback: legacy simple preview ──
  const activeSection = sections[activeSectionIndex];
  const sectionQuestions = activeSection?.questions || [];
  const currentQuestion = sectionQuestions[legacyQIndex];
  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const completedBefore = sections.slice(0, activeSectionIndex).reduce((acc, s) => acc + s.questions.length, 0);
  const progress = totalQuestions > 0 ? ((completedBefore + legacyQIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold tracking-tight text-stone-800">Preview</h2>
        <div className="flex gap-1 bg-stone-100 rounded-full p-0.5">
          {[{mode: 'desktop' as const, icon: Monitor, label: 'Desktop'}, {mode: 'mobile' as const, icon: Smartphone, label: 'Mobile'}].map(m => (
            <button key={m.mode} onClick={() => setPreviewMode(m.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${previewMode === m.mode ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'}`}>
              <m.icon size={13} /> {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-stone-50 rounded-2xl p-6 lg:p-10">
        <div style={{ maxWidth: previewMode === 'mobile' ? '375px' : '640px', margin: '0 auto' }}>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <h1 className="text-[18px] font-semibold text-stone-800 mb-1">{projectTitle || 'Untitled'}</h1>
              <p className="text-[13px] text-stone-400 font-light">{projectDescription || ''}</p>
            </div>
            {hasSections && (
              <div className="px-6 pb-3">
                <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {sections.map((section, idx) => (
                    <button key={section.id} onClick={() => { setActiveSectionIndex(idx); setLegacyQIndex(0); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all ${activeSectionIndex === idx ? 'text-white shadow-sm' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                      style={activeSectionIndex === idx ? { backgroundColor: section.color || '#10b981' } : {}}>
                      {section.icon && <span>{section.icon}</span>}{section.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="px-6 pb-4">
              <div className="flex justify-between text-[12px] text-stone-400 mb-1.5">
                <span>Q{completedBefore + legacyQIndex + 1}/{totalQuestions}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="px-6 pb-6">
              {currentQuestion && (
                <div className="mb-6">
                  <h2 className="text-[16px] font-semibold text-stone-800 mb-1">{currentQuestion.question_text}{currentQuestion.required && <span className="text-red-500 ml-1">*</span>}</h2>
                  {currentQuestion.question_description && <p className="text-[13px] text-stone-400 mb-3">{currentQuestion.question_description}</p>}
                  {renderQuestionInput(currentQuestion)}
                </div>
              )}
              <div className="flex justify-between pt-4 border-t border-stone-100">
                <button onClick={() => { if (legacyQIndex > 0) setLegacyQIndex(legacyQIndex - 1); else if (activeSectionIndex > 0) { setActiveSectionIndex(activeSectionIndex - 1); setLegacyQIndex(sections[activeSectionIndex - 1].questions.length - 1); }}} disabled={activeSectionIndex === 0 && legacyQIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-stone-200 text-stone-500 disabled:opacity-40"><ChevronLeft size={14} /> Back</button>
                {activeSectionIndex === sections.length - 1 && legacyQIndex === sectionQuestions.length - 1 ? (
                  <button className="flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500">Submit <Check size={14} /></button>
                ) : (
                  <button onClick={() => { if (legacyQIndex < sectionQuestions.length - 1) setLegacyQIndex(legacyQIndex + 1); else if (activeSectionIndex < sections.length - 1) { setActiveSectionIndex(activeSectionIndex + 1); setLegacyQIndex(0); }}}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500">Next <ChevronRight size={14} /></button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview;
