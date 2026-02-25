import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Smartphone, Monitor } from 'lucide-react';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';

interface SurveyPreviewProps {
  questions: any[];
  projectTitle: string;
  projectDescription: string;
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({ questions, projectTitle, projectDescription }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [responses, setResponses] = useState<{ [key: string]: any }>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const handleResponse = (questionId: string, value: any) => setResponses({ ...responses, [questionId]: value });

  const renderQuestion = (question: any) => {
    const value = responses[question.id];
    const normalizedType = normalizeLegacyQuestionType(question.question_type);

    switch (normalizedType) {
      case 'single_choice':
        return (<div className="space-y-2">{question.options?.map((option: any, index: number) => { const optText = typeof option === 'string' ? option : option.option_text; const optVal = typeof option === 'string' ? option : option.id || option.option_text; return (<label key={index} className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${value === optVal ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}><input type="radio" checked={value === optVal || false} onChange={() => handleResponse(question.id, optVal)} className="mr-3 accent-emerald-500" /><span className="text-[14px] text-stone-700">{optText}</span></label>);})}</div>);
      case 'multiple_choice':
        return (<div className="space-y-2">{question.options?.map((option: any, index: number) => { const optText = typeof option === 'string' ? option : option.option_text; const optVal = typeof option === 'string' ? option : option.id || option.option_text; const selected = Array.isArray(value) ? value.includes(optVal) : false; return (<label key={index} className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}><input type="checkbox" checked={selected} onChange={(e) => { const cur = value || []; handleResponse(question.id, e.target.checked ? [...cur, optVal] : cur.filter((v: string) => v !== optVal)); }} className="mr-3 accent-emerald-500" /><span className="text-[14px] text-stone-700">{optText}</span></label>);})}</div>);
      case 'text_short':
        return <input type="text" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" placeholder="Your answer..." />;
      case 'text_long':
        return <textarea value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" rows={5} placeholder="Your answer..." />;
      case 'number': return <input type="number" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" placeholder="Enter number..." />;
      case 'date': return <input type="date" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />;
      case 'time': return <input type="time" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />;
      case 'email': return <input type="email" value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" placeholder="email@example.com" />;
      case 'likert_scale':
        const lc = question.question_config || {}; const ll = lc.labels || {}; const ls = lc.scale_type || '1-5'; const [lmin, lmax] = ls.split('-').map(Number); const lo: number[] = []; for (let i = lmin; i <= lmax; i++) lo.push(i);
        return (<div className="flex justify-between gap-1.5">{lo.map(v => (<div key={v} onClick={() => handleResponse(question.id, v)} className={`flex-1 text-center cursor-pointer`}><div className={`aspect-square flex items-center justify-center rounded-xl border-2 font-semibold text-[15px] mb-1 transition-all hover:scale-105 ${value === v ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-200 text-stone-600'}`}>{v}</div><p className="text-[10px] text-stone-400">{ll[v] || ''}</p></div>))}</div>);
      case 'dropdown':
        return <select value={value || ''} onChange={(e) => handleResponse(question.id, e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"><option value="">Select...</option>{question.options?.map((o: any, i: number) => <option key={i} value={o.id || o.option_text || o}>{o.option_text || o}</option>)}</select>;
      case 'slider':
        const sMin = question.question_config?.min_value ?? 0; const sMax = question.question_config?.max_value ?? 10; const sStep = question.question_config?.step ?? 1;
        return (<div className="space-y-3"><input type="range" min={sMin} max={sMax} step={sStep} value={value ?? sMin} onChange={(e) => handleResponse(question.id, Number(e.target.value))} className="w-full cursor-pointer accent-emerald-500" /><div className="flex justify-between text-[13px] text-stone-400"><span>{sMin}</span><span className="text-xl font-bold text-emerald-600">{value ?? sMin}</span><span>{sMax}</span></div></div>);
      case 'rating':
        const maxR = question.question_config?.max_value ?? 5;
        return (<div className="flex gap-2 justify-center">{Array.from({length: maxR}, (_, i) => i + 1).map(s => (<button key={s} type="button" onClick={() => handleResponse(question.id, s)} className="text-3xl hover:scale-110 transition-transform" style={{color: (value || 0) >= s ? '#fbbf24' : '#d1d5db'}}>★</button>))}</div>);
      case 'nps':
        return (<div className="flex flex-wrap gap-1.5 justify-center">{[0,1,2,3,4,5,6,7,8,9,10].map(n => (<button key={n} type="button" onClick={() => handleResponse(question.id, n)} className={`w-10 h-10 rounded-xl font-medium text-[13px] transition-all ${value === n ? 'bg-emerald-500 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{n}</button>))}</div>);
      default: return <p className="text-[13px] text-stone-400">Type: {question.question_type}</p>;
    }
  };

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
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <h1 className="text-[18px] font-semibold text-stone-800 mb-1">{projectTitle || 'Untitled'}</h1>
              <p className="text-[13px] text-stone-400 font-light">{projectDescription || 'Description'}</p>
            </div>
            {/* Progress */}
            <div className="px-6 pb-4">
              <div className="flex justify-between text-[12px] text-stone-400 mb-1.5">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
            {/* Question */}
            <div className="px-6 pb-6">
              {questions.length === 0 ? (
                <p className="text-center py-12 text-[13px] text-stone-400">No questions to preview.</p>
              ) : currentQuestion && (
                <div className="mb-6">
                  <h2 className="text-[16px] font-semibold text-stone-800 mb-1">
                    {currentQuestion.question_text || 'New Question'}
                    {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                  </h2>
                  {currentQuestion.question_description && <p className="text-[13px] text-stone-400 mb-3">{currentQuestion.question_description}</p>}
                  {renderQuestion(currentQuestion)}
                </div>
              )}
              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-stone-100">
                <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-40 transition-all">
                  <ChevronLeft size={14} /> Back
                </button>
                {currentQuestionIndex === questions.length - 1 ? (
                  <button className="flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-200">
                    Submit <Check size={14} />
                  </button>
                ) : (
                  <button onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-200">
                    Next <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h3 className="text-[14px] font-semibold text-stone-800 mb-1">Preview Mode</h3>
        <p className="text-[13px] text-stone-400 font-light">This is how participants see your survey. Responses are not saved.</p>
      </div>
    </div>
  );
};

export default SurveyPreview;
