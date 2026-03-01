import React from 'react';
import { normalizeLegacyQuestionType } from '../../constants/questionTypes';

interface QuestionRendererProps {
  question: any;
  value: any;
  onResponse: (questionId: string, value: any) => void;
  primaryColor?: string;
  /** When true, uses smaller font sizes for phone mockup preview */
  compact?: boolean;
}

/**
 * Shared question input renderer used by both AppPhonePreview and ParticipantAppView
 * to guarantee 100% visual parity.
 */
const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question, value, onResponse, primaryColor = '#10b981', compact = false,
}) => {
  const normalizedType = normalizeLegacyQuestionType(question.question_type);
  // Font sizes: compact (phone preview) vs full (participant view)
  const txt = compact ? 'text-[13px]' : 'text-[14px]';
  const txtSm = compact ? 'text-[11px]' : 'text-[12px]';
  const txtXs = compact ? 'text-[9px]' : 'text-[10px]';
  const txtLg = compact ? 'text-[14px]' : 'text-[16px]';
  const pad = compact ? 'p-3' : 'p-3.5';
  const btnH = compact ? 'w-10 h-10' : 'w-11 h-11';
  const starSize = compact ? 'text-2xl' : 'text-3xl';
  const npsBtn = compact ? 'w-9 h-9' : 'w-10 h-10';

  switch (normalizedType) {
    case 'single_choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option: any, index: number) => {
            const optText = typeof option === 'string' ? option : option.option_text || option.text;
            const optVal = typeof option === 'string' ? option : option.id || option.option_text;
            return (
              <label key={index} className={`flex items-center ${pad} rounded-xl border-2 cursor-pointer transition-all ${value === optVal ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}>
                <input type="radio" checked={value === optVal || false} onChange={() => onResponse(question.id, optVal)} className="mr-3 accent-emerald-500" />
                <span className={`${txt} text-stone-700`}>{optText}</span>
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
              <label key={index} className={`flex items-center ${pad} rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}>
                <input type="checkbox" checked={selected} onChange={(e) => {
                  const cur = value || [];
                  onResponse(question.id, e.target.checked ? [...cur, optVal] : cur.filter((v: string) => v !== optVal));
                }} className="mr-3 accent-emerald-500" />
                <span className={`${txt} text-stone-700`}>{optText}</span>
              </label>
            );
          })}
        </div>
      );
    case 'text_short':
      return <input type="text" value={value || ''} onChange={(e) => onResponse(question.id, e.target.value)} className={`w-full px-4 py-3 rounded-xl border border-stone-200 ${txt} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} placeholder="Your answer..." />;
    case 'text_long':
      return <textarea value={value || ''} onChange={(e) => onResponse(question.id, e.target.value)} className={`w-full px-4 py-3 rounded-xl border border-stone-200 ${txt} resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} rows={4} placeholder="Your answer..." />;
    case 'number':
      return <input type="number" value={value || ''} onChange={(e) => onResponse(question.id, e.target.value)} className={`w-full px-4 py-3 rounded-xl border border-stone-200 ${txt} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} placeholder="Enter number..." />;
    case 'likert_scale': {
      const lc = question.question_config || {};
      const ls = lc.scale_type || '1-5';
      const [lmin, lmax] = ls.split('-').map(Number);
      const lo: number[] = [];
      for (let i = lmin; i <= lmax; i++) lo.push(i);
      return (
        <div className="flex justify-between gap-1">
          {lo.map(v => (
            <div key={v} onClick={() => onResponse(question.id, v)} className="flex-1 text-center cursor-pointer">
              <div className={`aspect-square flex items-center justify-center rounded-xl border-2 font-semibold ${txtLg} mb-1 transition-all hover:scale-105 ${value === v ? 'text-white' : 'border-stone-200 text-stone-600'}`}
                style={value === v ? { borderColor: primaryColor, backgroundColor: primaryColor } : {}}>
                {v}
              </div>
              <p className={`${txtXs} text-stone-400`}>{lc.labels?.[v] || lc.custom_labels?.[v - lmin] || ''}</p>
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
              <button key={v} onClick={() => onResponse(question.id, v)}
                className={`${btnH} rounded-xl border-2 font-semibold ${compact ? 'text-[12px]' : 'text-[13px]'} transition-all hover:scale-105`}
                style={{
                  borderColor: value === v ? (v < 0 ? '#ef4444' : v > 0 ? '#10b981' : '#6b7280') : '#e7e5e4',
                  backgroundColor: value === v ? (v < 0 ? '#fef2f2' : v > 0 ? '#f0fdf4' : '#f9fafb') : 'white',
                  color: v < 0 ? '#ef4444' : v > 0 ? '#10b981' : '#6b7280',
                }}>
                {v > 0 ? `+${v}` : v}
              </button>
            ))}
          </div>
          <div className={`flex justify-between ${txtSm} text-stone-400`}>
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
            <button key={s} type="button" onClick={() => onResponse(question.id, s)}
              className={`${starSize} hover:scale-110 transition-transform`}
              style={{ color: (value || 0) >= s ? '#fbbf24' : '#d1d5db' }}>★</button>
          ))}
        </div>
      );
    }
    case 'nps':
      return (
        <div className="flex flex-wrap gap-1 justify-center">
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => onResponse(question.id, n)}
              className={`${npsBtn} rounded-lg font-medium ${compact ? 'text-[12px]' : 'text-[13px]'} transition-all ${value === n ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {n}
            </button>
          ))}
        </div>
      );
    case 'yes_no':
      return (
        <div className="flex gap-3">
          {['Yes', 'No'].map(opt => (
            <button key={opt} onClick={() => onResponse(question.id, opt)}
              className={`flex-1 py-3 rounded-xl border-2 ${txt} font-medium transition-all ${value === opt ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>
              {opt}
            </button>
          ))}
        </div>
      );
    case 'date':
      return <input type="date" value={value || ''} onChange={(e) => onResponse(question.id, e.target.value)} className={`w-full px-4 py-3 rounded-xl border border-stone-200 ${txt} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />;
    case 'section_header':
      return null;
    default:
      return <p className={`${txtSm} text-stone-400 italic`}>Unsupported: {question.question_type}</p>;
  }
};

export default QuestionRenderer;
