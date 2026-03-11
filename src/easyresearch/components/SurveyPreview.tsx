import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Smartphone, Monitor, Home, FileText, Settings, BarChart3, HelpCircle, Layout } from 'lucide-react';
import { normalizeLegacyQuestionType, groupQuestionsBySections, type QuestionSection } from '../constants/questionTypes';
import type { AppLayout, LayoutElement } from './LayoutBuilder';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';
import AppPhonePreview from './AppPhonePreview';
import { DEVICE_PRESETS, DEFAULT_DEVICE, type DevicePreset } from '../constants/devicePresets';
import BrandIcon from './BrandIcon';

interface SurveyPreviewProps {
  questions: any[];
  projectTitle: string;
  projectDescription: string;
  appLayout?: AppLayout;
  questionnaires?: QuestionnaireConfig[];
  participantTypes?: ParticipantType[];
  studyDuration?: number;
  onUpdateQuestionnaire?: (id: string, updates: Partial<QuestionnaireConfig>) => void;
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({
  questions, projectTitle, projectDescription,
  appLayout, questionnaires, participantTypes, studyDuration = 7, onUpdateQuestionnaire,
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
      case 'email': return <input type="email" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="your@email.com" />;
      case 'phone': return <input type="tel" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="+1 (555) 123-4567" />;
      case 'time': return <input type="time" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />;
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
      case 'slider':
        const sMin = question.question_config?.min_value ?? 0; const sMax = question.question_config?.max_value ?? 10; const sStep = question.question_config?.step ?? 1;
        return (<div className="space-y-2"><input type="range" min={sMin} max={sMax} step={sStep} value={value ?? sMin} onChange={(e) => handleResponse(question.id, Number(e.target.value))} className="w-full accent-emerald-500" /><div className="flex justify-between text-[11px] text-stone-400"><span>{question.question_config?.min_label || sMin}</span><span className="font-semibold text-emerald-600">{value ?? sMin}</span><span>{question.question_config?.max_label || sMax}</span></div></div>);
      case 'matrix':
        const mCols = question.question_config?.columns || []; const mRows = question.options || []; const mVal = (typeof value === 'object' && value && !Array.isArray(value)) ? value : {};
        return (<div className="overflow-x-auto"><table className="w-full text-[12px]"><thead><tr><th className="text-left p-1.5 text-stone-400"></th>{mCols.map((c: string, i: number) => <th key={i} className="text-center p-1.5 text-stone-500 text-[11px]">{c}</th>)}</tr></thead><tbody>{mRows.map((r: any) => (<tr key={r.id} className="border-t border-stone-100"><td className="p-1.5 text-stone-700">{r.option_text}</td>{mCols.map((c: string, ci: number) => (<td key={ci} className="text-center p-1.5"><button onClick={() => handleResponse(question.id, { ...mVal, [r.id]: c })} className="w-5 h-5 rounded-full border-2 mx-auto" style={{ borderColor: mVal[r.id] === c ? '#10b981' : '#e7e5e4', backgroundColor: mVal[r.id] === c ? '#10b981' : 'white' }} /></td>))}</tr>))}</tbody></table></div>);
      case 'ranking':
        const rOpts = question.options || []; const rVal: string[] = Array.isArray(value) ? value : rOpts.map((o: any) => o.id);
        const rItems = rVal.map(id => rOpts.find((o: any) => o.id === id)).filter(Boolean);
        return (<div className="space-y-1.5">{rItems.map((item: any, idx: number) => (<div key={item.id} className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 bg-white"><span className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold bg-emerald-50 text-emerald-600">{idx + 1}</span><span className="flex-1 text-[13px] text-stone-700">{item.option_text}</span><div className="flex flex-col gap-0.5"><button onClick={() => { if (idx > 0) { const n = [...rVal]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; handleResponse(question.id, n); }}} disabled={idx === 0} className="p-0.5 rounded hover:bg-stone-100 disabled:opacity-30 text-stone-400">▲</button><button onClick={() => { if (idx < rItems.length - 1) { const n = [...rVal]; [n[idx], n[idx+1]] = [n[idx+1], n[idx]]; handleResponse(question.id, n); }}} disabled={idx === rItems.length - 1} className="p-0.5 rounded hover:bg-stone-100 disabled:opacity-30 text-stone-400">▼</button></div></div>))}</div>);
      case 'file_upload':
        return (<div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center"><p className="text-stone-400 text-[12px]">Click or drag to upload</p><p className="text-stone-300 text-[10px] mt-1">Max {question.question_config?.max_size_mb || 10}MB</p></div>);
      case 'image_choice':
        const icOpts = question.options || []; const icMulti = question.question_config?.allow_multiple || false;
        return (<div className="grid grid-cols-3 gap-2">{icOpts.map((opt: any) => { const sel = icMulti ? (Array.isArray(value) && value.includes(opt.id)) : value === opt.id; return (<button key={opt.id} onClick={() => { if (icMulti) { const a = Array.isArray(value) ? value : []; handleResponse(question.id, sel ? a.filter((v: string) => v !== opt.id) : [...a, opt.id]); } else { handleResponse(question.id, opt.id); }}} className={`p-3 rounded-xl border-2 text-center transition-all ${sel ? 'border-emerald-400 bg-emerald-50' : 'border-stone-200'}`}><div className="text-2xl mb-1">{opt.option_text}</div></button>);})}</div>);
      case 'instruction':
        const cType = question.question_config?.content_type || 'text';
        const bgMap: Record<string, string> = { text: '#f9fafb', info: '#eff6ff', warning: '#fffbeb', tip: '#f0fdf4' };
        return (<div className="rounded-xl p-3 border" style={{ backgroundColor: bgMap[cType] || '#f9fafb', borderColor: '#e5e7eb' }}><p className="text-[13px] text-stone-600">{question.question_text}</p>{question.question_description && <p className="text-[12px] text-stone-400 mt-1">{question.question_description}</p>}</div>);
      case 'section_header':
        return null;
      case 'text_block':
        return <div className="p-3 rounded-xl bg-stone-50 text-[13px] text-stone-600" style={{ fontSize: question.question_config?.font_size ? `${question.question_config.font_size}px` : undefined }}>{question.question_config?.content || question.question_text}</div>;
      case 'divider':
        return <hr style={{ borderStyle: question.question_config?.style || 'solid', borderColor: question.question_config?.color || '#e5e7eb', borderWidth: `${question.question_config?.thickness || 1}px 0 0 0` }} />;
      case 'image_block':
        return (
          <div className="text-center">
            {question.question_config?.image_url ? (
              <img src={question.question_config.image_url} alt={question.question_config?.alt_text || ''} className="mx-auto rounded-lg" style={{ maxWidth: question.question_config?.max_width || '100%' }} />
            ) : (
              <div className="h-20 rounded-lg border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-stone-400">Image</div>
            )}
            {question.question_config?.caption && <p className="text-[11px] text-stone-400 mt-1">{question.question_config.caption}</p>}
          </div>
        );
      case 'date':
        return <input type="date" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />;
      case 'dropdown':
        const ddOpts = question.options || [];
        return (<select value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"><option value="">Select an option...</option>{ddOpts.map((o: any) => <option key={o.id} value={o.id}>{o.option_text}</option>)}</select>);
      case 'constant_sum':
        const csPreOpts = question.options || [];
        return (<div className="space-y-2">{csPreOpts.map((o: any) => (<div key={o.id} className="flex items-center gap-2"><span className="flex-1 text-[13px] text-stone-600">{o.option_text}</span><input type="number" className="w-16 px-2 py-1.5 rounded-lg border border-stone-200 text-center text-[12px]" placeholder="0" readOnly /></div>))}<div className="text-[11px] text-stone-400 text-right">Total: {question.question_config?.total ?? 100}</div></div>);
      case 'signature':
        return (<div className="h-28 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 text-[12px]">✍ Signature pad</div>);
      case 'address':
        return (<div className="space-y-2">{['Street','City','State','Postal Code','Country'].map(l=>(<input key={l} type="text" placeholder={l} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-[12px]" readOnly />))}</div>);
      case 'slider_range':
        const srPCfg = question.question_config || {} as any;
        return (<div className="space-y-2"><input type="range" className="w-full" disabled /><input type="range" className="w-full" disabled /><div className="flex justify-between text-[11px] text-stone-400"><span>{srPCfg.min_label || srPCfg.min_value || 0}</span><span>{srPCfg.max_label || srPCfg.max_value || 100}</span></div></div>);
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
                <BrandIcon brand={d.brand} size={12} />
                {d.label}
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
            projectTitle={projectTitle}
          />
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
          <h3 className="text-[14px] font-semibold text-stone-800 mb-1">Display Settings</h3>
          {onUpdateQuestionnaire && questionnaires && questionnaires.filter(q => q.questionnaire_type === 'survey').length > 0 ? (
            <div className="space-y-3">
              {questionnaires.filter(q => q.questionnaire_type === 'survey').map(q => (
                <div key={q.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-stone-700">{q.title}</span>
                    <span className="text-[10px] text-stone-400">{q.questions?.length || 0} questions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">Questions/Page</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number" min={1} max={50}
                          value={q.questions_per_page ?? ''}
                          placeholder="∞"
                          onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value) : null;
                            onUpdateQuestionnaire(q.id, { questions_per_page: val });
                          }}
                          className="w-16 px-2 py-1 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <span className="text-[10px] text-stone-400">{q.questions_per_page ? 'paginated' : 'all at once'}</span>
                      </div>
                    </div>
                  </div>
                  {/* Per-tab overrides */}
                  {q.tab_sections && q.tab_sections.length > 0 && (
                    <div className="pt-2 border-t border-stone-200 space-y-1">
                      <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Tab Overrides</label>
                      {q.tab_sections.map(section => (
                        <div key={section.id} className="flex items-center gap-2 text-[11px]">
                          <span className="text-stone-600 flex-1 truncate">{section.label}</span>
                          <input
                            type="number" min={1} max={50}
                            value={section.questions_per_page ?? ''}
                            placeholder={q.questions_per_page ? String(q.questions_per_page) : '∞'}
                            onChange={(e) => {
                              const val = e.target.value ? parseInt(e.target.value) : null;
                              const updatedSections = q.tab_sections!.map(s =>
                                s.id === section.id ? { ...s, questions_per_page: val } : s
                              );
                              onUpdateQuestionnaire(q.id, { tab_sections: updatedSections });
                            }}
                            className="w-14 px-2 py-1 rounded-lg text-[11px] border border-stone-200"
                          />
                          <span className="text-[9px] text-stone-400">/pg</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-stone-400 font-light">
              This preview renders exactly what participants will see. Use the role filter to see what each participant type sees.
            </p>
          )}
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
