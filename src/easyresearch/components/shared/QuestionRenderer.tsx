import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
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
      let lmin: number, lmax: number;
      if (/^\d+-\d+$/.test(ls)) {
        [lmin, lmax] = ls.split('-').map(Number);
      } else {
        lmin = lc.min_value ?? 1;
        lmax = lc.max_value ?? 5;
      }
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
    case 'yes_no': {
      const ynYes = question.question_config?.yes_label || 'Yes';
      const ynNo = question.question_config?.no_label || 'No';
      return (
        <div className="flex gap-3">
          {[{ val: 'yes', label: ynYes }, { val: 'no', label: ynNo }].map(opt => (
            <button key={opt.val} onClick={() => onResponse(question.id, opt.val)}
              className={`flex-1 py-3 rounded-xl border-2 ${txt} font-medium transition-all ${value === opt.val ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      );
    }
    case 'date':
      return <input type="date" value={value || ''} onChange={(e) => onResponse(question.id, e.target.value)} className={`w-full px-4 py-3 rounded-xl border border-stone-200 ${txt} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />;
    case 'constant_sum': {
      const csOpts = question.options || [];
      const csTot = (question as any).question_config?.total ?? 100;
      const csVal: Record<string, number> = (typeof value === 'object' && value && !Array.isArray(value)) ? value : {};
      const csSum = Object.values(csVal).reduce((s: number, v: number) => s + (Number(v) || 0), 0);
      return (
        <div className="space-y-2">
          <div className={`flex justify-between ${txtSm}`}><span className="text-stone-500">Total: {csTot}</span><span className={csSum === csTot ? 'text-emerald-600' : csSum > csTot ? 'text-red-500' : 'text-stone-400'}>Remaining: {csTot - csSum}</span></div>
          {csOpts.map((o: any) => (<div key={o.id} className="flex items-center gap-2"><span className={`flex-1 ${txt} text-stone-600`}>{o.option_text}</span><input type="number" min={0} max={csTot} value={csVal[o.id] ?? ''} onChange={(e) => onResponse(question.id, { ...csVal, [o.id]: Number(e.target.value) || 0 })} className={`w-16 px-2 py-1.5 rounded-lg border border-stone-200 text-center ${txtSm}`} placeholder="0" /></div>))}
        </div>
      );
    }
    case 'signature': {
      const sigVal = typeof value === 'string' ? value : '';
      return (
        <div className="space-y-2">
          <div className="h-28 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50 relative overflow-hidden">
            {sigVal ? <img src={sigVal} alt="Signature" className="w-full h-full object-contain" /> : (
              <canvas className="w-full h-full cursor-crosshair"
                onMouseDown={(e) => { const c = e.currentTarget; const ctx = c.getContext('2d'); if (!ctx) return; const r = c.getBoundingClientRect(); c.width = r.width; c.height = r.height; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#1a1a1a'; ctx.beginPath(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top); const draw = (ev: MouseEvent) => { ctx.lineTo(ev.clientX - r.left, ev.clientY - r.top); ctx.stroke(); }; const stop = () => { c.removeEventListener('mousemove', draw); c.removeEventListener('mouseup', stop); c.removeEventListener('mouseleave', stop); onResponse(question.id, c.toDataURL('image/png')); }; c.addEventListener('mousemove', draw); c.addEventListener('mouseup', stop); c.addEventListener('mouseleave', stop); }}
              />
            )}
            {!sigVal && <p className={`absolute inset-0 flex items-center justify-center ${txtSm} text-stone-400 pointer-events-none`}>Draw signature</p>}
          </div>
          {sigVal && <button onClick={() => onResponse(question.id, '')} className={`${txtSm} text-red-500 hover:underline`}>Clear</button>}
        </div>
      );
    }
    case 'address': {
      const aVal: Record<string, string> = (typeof value === 'object' && value && !Array.isArray(value)) ? value : {};
      const aFields = ['street', 'city', 'state', 'postal_code', 'country'];
      return (
        <div className="space-y-2">
          {aFields.map(k => (<input key={k} type="text" value={aVal[k] || ''} onChange={(e) => onResponse(question.id, { ...aVal, [k]: e.target.value })} placeholder={k.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} className={`w-full px-3 py-2 rounded-xl border border-stone-200 ${txtSm} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />))}
        </div>
      );
    }
    case 'slider_range': {
      const srCfg = (question as any).question_config || {};
      const srMin = srCfg.min_value ?? 0; const srMax = srCfg.max_value ?? 100; const srStep = srCfg.step ?? 1;
      const srVal = (typeof value === 'object' && value && !Array.isArray(value)) ? value : { low: srMin, high: srMax };
      return (
        <div className="space-y-2">
          <div className={`flex justify-between ${txtSm} font-semibold text-emerald-600`}><span>Min: {srVal.low ?? srMin}</span><span>Max: {srVal.high ?? srMax}</span></div>
          <input type="range" min={srMin} max={srMax} step={srStep} value={srVal.low ?? srMin} onChange={(e) => { const low = Number(e.target.value); onResponse(question.id, { low, high: Math.max(low, srVal.high ?? srMax) }); }} className="w-full" style={{ accentColor: '#10b981' }} />
          <input type="range" min={srMin} max={srMax} step={srStep} value={srVal.high ?? srMax} onChange={(e) => { const high = Number(e.target.value); onResponse(question.id, { low: Math.min(high, srVal.low ?? srMin), high }); }} className="w-full" style={{ accentColor: '#10b981' }} />
          <div className={`flex justify-between ${txtSm} text-stone-400`}><span>{srCfg.min_label || srMin}</span><span>{srCfg.max_label || srMax}</span></div>
        </div>
      );
    }
    case 'slider': {
      const slMin = question.question_config?.min_value ?? question.question_config?.min ?? 0;
      const slMax = question.question_config?.max_value ?? question.question_config?.max ?? 10;
      const slStep = question.question_config?.step ?? 1;
      return (
        <div className="space-y-2">
          <input type="range" min={slMin} max={slMax} step={slStep} value={value ?? slMin}
            onChange={(e) => onResponse(question.id, Number(e.target.value))} className="w-full" style={{ accentColor: primaryColor }} />
          <div className={`flex justify-between ${txtSm} text-stone-400`}>
            <span>{question.question_config?.min_label || slMin}</span>
            <span className="font-semibold" style={{ color: primaryColor }}>{value ?? slMin}</span>
            <span>{question.question_config?.max_label || slMax}</span>
          </div>
        </div>
      );
    }
    case 'dropdown': {
      const ddOpts = question.options || [];
      return (
        <select value={value || ''} onChange={(e) => onResponse(question.id, e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border border-stone-200 ${txt} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
          <option value="">Select an option...</option>
          {ddOpts.map((o: any, i: number) => {
            const oVal = typeof o === 'string' ? o : o.id || o.option_value || o.option_text;
            const oText = typeof o === 'string' ? o : o.option_text || o.text;
            return <option key={i} value={oVal}>{oText}</option>;
          })}
        </select>
      );
    }
    case 'instruction': {
      return (
        <div className={`rounded-xl ${pad} border border-blue-200 bg-blue-50`}>
          <p className={`${txt} text-blue-800 font-medium`}>{question.question_text}</p>
          {question.question_description && <p className={`${txtSm} text-blue-600 mt-1`}>{question.question_description}</p>}
        </div>
      );
    }
    case 'section_header':
      return null;
    case 'video_block': {
      const videoUrl = question.question_config?.video_url || '';
      const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
      if (ytMatch) {
        return <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=${question.question_config?.autoplay ? 1 : 0}&mute=${question.question_config?.muted ? 1 : 0}&loop=${question.question_config?.loop ? 1 : 0}`} className="w-full rounded-xl" style={{ height: '240px' }} allowFullScreen allow="autoplay" />;
      }
      if (vimeoMatch) {
        return <iframe src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${question.question_config?.autoplay ? 1 : 0}&muted=${question.question_config?.muted ? 1 : 0}&loop=${question.question_config?.loop ? 1 : 0}`} className="w-full rounded-xl" style={{ height: '240px' }} allowFullScreen allow="autoplay" />;
      }
      return videoUrl ? (
        <video src={videoUrl} controls autoPlay={question.question_config?.autoplay} loop={question.question_config?.loop} muted={question.question_config?.muted} poster={question.question_config?.poster_url} className="w-full rounded-xl" />
      ) : <div className={`${pad} rounded-xl bg-stone-100 text-center ${txtSm} text-stone-400`}>No video configured</div>;
    }
    case 'audio_block': {
      const audioUrl = question.question_config?.audio_url || '';
      return audioUrl ? (
        <audio src={audioUrl} controls autoPlay={question.question_config?.autoplay} loop={question.question_config?.loop} className="w-full" />
      ) : <div className={`${pad} rounded-xl bg-stone-100 text-center ${txtSm} text-stone-400`}>🔊 No audio configured</div>;
    }
    case 'embed_block': {
      const embedUrl = question.question_config?.embed_url || '';
      const embedH = question.question_config?.embed_height || '400px';
      return embedUrl ? (
        <iframe src={embedUrl} className="w-full rounded-xl border border-stone-200" style={{ height: embedH }} allowFullScreen={question.question_config?.allow_fullscreen !== false} sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
      ) : <div className={`${pad} rounded-xl bg-stone-100 text-center ${txtSm} text-stone-400`}>🌐 No embed configured</div>;
    }
    case 'card_sort': {
      const cards = question.question_config?.cards || [];
      const cats = question.question_config?.categories || [];
      const sortType = question.question_config?.sort_type || 'open';
      const csVal: Record<string, string[]> = (typeof value === 'object' && value && !Array.isArray(value)) ? value : {};
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {cards.filter((c: string) => !Object.values(csVal).flat().includes(c)).map((card: string, i: number) => (
              <div key={i} className={`${pad} rounded-lg border-2 border-dashed border-stone-300 bg-white ${txtSm} text-stone-700 cursor-grab`}>{card}</div>
            ))}
          </div>
          {sortType !== 'open' && (
            <div className="grid grid-cols-2 gap-2">
              {cats.map((cat: string, i: number) => (
                <div key={i} className="border border-stone-200 rounded-xl p-2 min-h-[60px]">
                  <p className={`${txtXs} font-semibold text-stone-500 mb-1`}>{cat}</p>
                  <div className="space-y-1">
                    {(csVal[cat] || []).map((c: string, j: number) => (
                      <div key={j} className={`${txtXs} px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700`}>{c}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {sortType === 'open' && <p className={`${txtXs} text-stone-400 italic`}>Drag cards to create and organize into your own categories</p>}
        </div>
      );
    }
    case 'tree_test': {
      const tree = question.question_config?.tree_data || [];
      const taskDesc = question.question_config?.task_description || '';
      const renderNode = (node: any, depth: number = 0): any => (
        <div key={node.label} style={{ paddingLeft: depth * 16 }}>
          <button onClick={() => onResponse(question.id, { path: node.label, timestamp: Date.now() })}
            className={`w-full text-left px-3 py-2 rounded-lg ${txt} hover:bg-emerald-50 transition-colors ${value?.path === node.label ? 'bg-emerald-100 text-emerald-700 font-medium' : 'text-stone-700'}`}>
            {node.children?.length > 0 ? '> ' : '- '}{node.label}
          </button>
          {node.children?.map((child: any) => renderNode(child, depth + 1))}
        </div>
      );
      return (
        <div className="space-y-2">
          {taskDesc && <div className={`${pad} rounded-xl bg-blue-50 border border-blue-200 ${txtSm} text-blue-700`}>{taskDesc}</div>}
          <div className="border border-stone-200 rounded-xl p-2 max-h-[300px] overflow-y-auto">
            {tree.map((node: any) => renderNode(node))}
          </div>
        </div>
      );
    }
    case 'first_click': {
      const imgUrl = question.question_config?.test_image_url || '';
      const task = question.question_config?.task_description || '';
      return (
        <div className="space-y-2">
          {task && <div className={`${pad} rounded-xl bg-blue-50 border border-blue-200 ${txtSm} text-blue-700`}>{task}</div>}
          {imgUrl ? (
            <div className="relative cursor-crosshair" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
              const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
              onResponse(question.id, { x: Number(x), y: Number(y), timestamp: Date.now() });
            }}>
              <img src={imgUrl} alt="Test" className="w-full rounded-xl border border-stone-200" />
              {value?.x != null && (
                <div className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-3 border-red-500 bg-red-500/30"
                  style={{ left: `${value.x}%`, top: `${value.y}%` }} />
              )}
            </div>
          ) : <div className={`h-32 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center ${txtSm} text-stone-400`}>Upload test image</div>}
        </div>
      );
    }
    case 'five_second_test': {
      const imgUrl5 = question.question_config?.test_image_url || '';
      const dur = question.question_config?.test_duration ?? 5;
      const followup = question.question_config?.followup_question || 'What do you remember?';
      // Simple implementation: show image, then show follow-up
      const hasStarted = value?.started;
      const hasFinished = value?.finished;
      if (!hasStarted) {
        return (
          <div className="text-center space-y-3">
            <p className={`${txt} text-stone-600`}>You'll see an image for {dur} seconds. Pay attention!</p>
            <button onClick={() => {
              onResponse(question.id, { started: true, startTime: Date.now() });
              setTimeout(() => onResponse(question.id, { started: true, finished: true, startTime: Date.now() - dur * 1000 }), dur * 1000);
            }} className={`px-6 py-2 rounded-xl bg-emerald-500 text-white ${txt} font-medium hover:bg-emerald-600`}>Start Test</button>
          </div>
        );
      }
      if (!hasFinished && imgUrl5) {
        return <img src={imgUrl5} alt="Test" className="w-full rounded-xl" />;
      }
      return (
        <div className="space-y-2">
          <p className={`${txt} text-stone-700 font-medium`}>{followup}</p>
          <textarea value={value?.answer || ''} onChange={(e) => onResponse(question.id, { ...value, answer: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border border-stone-200 ${txt} resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} rows={3} placeholder="Your answer..." />
        </div>
      );
    }
    case 'preference_test': {
      const aUrl = question.question_config?.variant_a_url || '';
      const bUrl = question.question_config?.variant_b_url || '';
      const aLabel = question.question_config?.variant_a_label || 'Design A';
      const bLabel = question.question_config?.variant_b_label || 'Design B';
      const followup = question.question_config?.followup_question || '';
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[{ url: aUrl, label: aLabel, val: 'A' }, { url: bUrl, label: bLabel, val: 'B' }].map(v => (
              <div key={v.val} onClick={() => onResponse(question.id, { choice: v.val, reason: value?.reason })}
                className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${value?.choice === v.val ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-stone-200 hover:border-stone-300'}`}>
                {v.url ? <img src={v.url} alt={v.label} className="w-full aspect-video object-cover" /> : <div className="w-full aspect-video bg-stone-100 flex items-center justify-center text-stone-400">{v.label}</div>}
                <p className={`text-center py-2 ${txtSm} font-medium ${value?.choice === v.val ? 'text-emerald-600' : 'text-stone-600'}`}>{v.label}</p>
              </div>
            ))}
          </div>
          {followup && value?.choice && (
            <div>
              <p className={`${txtSm} text-stone-500 mb-1`}>{followup}</p>
              <textarea value={value?.reason || ''} onChange={(e) => onResponse(question.id, { ...value, reason: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border border-stone-200 ${txtSm} resize-none`} rows={2} placeholder="Your reason..." />
            </div>
          )}
        </div>
      );
    }
    case 'prototype_test': {
      const protoUrl = question.question_config?.prototype_url || '';
      const protoH = question.question_config?.embed_height || '600px';
      const tasks = question.question_config?.task_list || [];
      return (
        <div className="space-y-2">
          {tasks.length > 0 && (
            <div className={`${pad} rounded-xl bg-blue-50 border border-blue-200`}>
              <p className={`${txtSm} text-blue-700 font-medium mb-1`}>Tasks:</p>
              {tasks.map((t: any, i: number) => (
                <p key={i} className={`${txtXs} text-blue-600`}>{i + 1}. {t.task}</p>
              ))}
            </div>
          )}
          {protoUrl ? (
            <iframe src={protoUrl} className="w-full rounded-xl border border-stone-200" style={{ height: protoH }} allowFullScreen sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
          ) : <div className={`h-32 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center ${txtSm} text-stone-400`}>Configure prototype URL</div>}
        </div>
      );
    }
    case 'max_diff': {
      const items = question.options || [];
      const setSize = question.question_config?.items_per_set || 4;
      const bestLabel = question.question_config?.best_label || 'Most Important';
      const worstLabel = question.question_config?.worst_label || 'Least Important';
      // Show one set at a time (simplified: first N items)
      const currentSet = items.slice(0, Math.min(setSize, items.length));
      const mdVal: { best?: string; worst?: string } = (typeof value === 'object' && value && !Array.isArray(value)) ? value : {};
      return (
        <div className="space-y-2">
          <div className={`grid grid-cols-[80px_1fr_80px] gap-1 text-center`}>
            <p className={`${txtXs} font-semibold text-emerald-600`}>{bestLabel}</p>
            <p className={`${txtXs} text-stone-400`}>Item</p>
            <p className={`${txtXs} font-semibold text-red-500`}>{worstLabel}</p>
          </div>
          {currentSet.map((item: any) => {
            const itemId = typeof item === 'string' ? item : item.id || item.option_text;
            const itemText = typeof item === 'string' ? item : item.option_text;
            return (
              <div key={itemId} className={`grid grid-cols-[80px_1fr_80px] gap-1 items-center border rounded-xl ${pad}`}>
                <div className="flex justify-center">
                  <button onClick={() => onResponse(question.id, { ...mdVal, best: itemId, worst: mdVal.worst === itemId ? undefined : mdVal.worst })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${mdVal.best === itemId ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 hover:border-emerald-400'}`}>
                    {mdVal.best === itemId && <span className="text-white text-[10px]">✓</span>}
                  </button>
                </div>
                <p className={`${txt} text-stone-700 text-center`}>{itemText}</p>
                <div className="flex justify-center">
                  <button onClick={() => onResponse(question.id, { ...mdVal, worst: itemId, best: mdVal.best === itemId ? undefined : mdVal.best })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${mdVal.worst === itemId ? 'bg-red-500 border-red-500' : 'border-stone-300 hover:border-red-400'}`}>
                    {mdVal.worst === itemId && <span className="text-white text-[10px]">✗</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    case 'design_survey': {
      const variants = question.options || [];
      const showLabels = question.question_config?.show_labels !== false;
      const followup = question.question_config?.followup_question || '';
      const dsVal: { choice?: string; ranking?: string[]; reason?: string } = (typeof value === 'object' && value && !Array.isArray(value)) ? value : {};
      return (
        <div className="space-y-3">
          <div className={`grid gap-3 ${variants.length <= 3 ? `grid-cols-${Math.min(variants.length, 3)}` : 'grid-cols-2'}`} style={{ gridTemplateColumns: `repeat(${Math.min(variants.length, 3)}, 1fr)` }}>
            {variants.map((v: any) => {
              const vId = typeof v === 'string' ? v : v.id || v.option_text;
              const vText = typeof v === 'string' ? v : v.option_text;
              const vUrl = typeof v === 'string' ? '' : v.option_value || '';
              return (
                <div key={vId} onClick={() => onResponse(question.id, { ...dsVal, choice: vId })}
                  className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${dsVal.choice === vId ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-stone-200 hover:border-stone-300'}`}>
                  {vUrl ? <img src={vUrl} alt={vText} className="w-full aspect-video object-cover" /> : <div className="w-full aspect-video bg-stone-100 flex items-center justify-center text-stone-400"><ImageIcon size={24} /></div>}
                  {showLabels && <p className={`text-center py-2 ${txtSm} font-medium ${dsVal.choice === vId ? 'text-emerald-600' : 'text-stone-600'}`}>{vText}</p>}
                </div>
              );
            })}
          </div>
          {followup && dsVal.choice && (
            <div>
              <p className={`${txtSm} text-stone-500 mb-1`}>{followup}</p>
              <textarea value={dsVal.reason || ''} onChange={(e) => onResponse(question.id, { ...dsVal, reason: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border border-stone-200 ${txtSm} resize-none`} rows={2} placeholder="Your reason..." />
            </div>
          )}
        </div>
      );
    }
    case 'heatmap': {
      const hmImgUrl = question.question_config?.test_image_url || '';
      const hmTask = question.question_config?.task_description || '';
      const hmMax = question.question_config?.max_clicks || 10;
      const hmFollowup = question.question_config?.followup_question || '';
      const hmVal: { clicks?: Array<{ x: number; y: number; t: number }>; answer?: string } = (typeof value === 'object' && value && !Array.isArray(value)) ? value : {};
      const clicks = hmVal.clicks || [];
      return (
        <div className="space-y-2">
          {hmTask && <div className={`${pad} rounded-xl bg-blue-50 border border-blue-200 ${txtSm} text-blue-700`}>🔥 {hmTask}</div>}
          <p className={`${txtXs} text-stone-400`}>{clicks.length}/{hmMax} clicks</p>
          {hmImgUrl ? (
            <div className="relative cursor-crosshair" onClick={(e) => {
              if (clicks.length >= hmMax) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Number(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
              const y = Number(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
              onResponse(question.id, { ...hmVal, clicks: [...clicks, { x, y, t: Date.now() }] });
            }}>
              <img src={hmImgUrl} alt="Test" className="w-full rounded-xl border border-stone-200" />
              {clicks.map((c, i) => (
                <div key={i} className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-red-500 bg-red-500/30 flex items-center justify-center"
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}>
                  <span className="text-[8px] text-red-700 font-bold">{i + 1}</span>
                </div>
              ))}
            </div>
          ) : <div className={`h-32 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center ${txtSm} text-stone-400`}>Upload test image</div>}
          {clicks.length > 0 && (
            <button onClick={() => onResponse(question.id, { ...hmVal, clicks: clicks.slice(0, -1) })} className={`${txtXs} text-red-500 hover:underline`}>Undo last click</button>
          )}
          {hmFollowup && clicks.length > 0 && (
            <div>
              <p className={`${txtSm} text-stone-500 mb-1`}>{hmFollowup}</p>
              <textarea value={hmVal.answer || ''} onChange={(e) => onResponse(question.id, { ...hmVal, answer: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border border-stone-200 ${txtSm} resize-none`} rows={2} placeholder="Your answer..." />
            </div>
          )}
        </div>
      );
    }
    case 'conjoint': {
      const attrs = question.question_config?.conjoint_attributes || [];
      const profilesPerTask = question.question_config?.profiles_per_task || 3;
      const numTasks = question.question_config?.num_choice_tasks || 6;
      const includeNone = question.question_config?.include_none_option ?? true;
      const cjVal: { task?: number; choice?: number } = (typeof value === 'object' && value && !Array.isArray(value)) ? value : { task: 0 };
      const currentTask = cjVal.task || 0;

      // Generate deterministic profiles from attributes (simple round-robin for demo) / 从属性生成确定性配置文件
      const generateProfiles = (taskIdx: number) => {
        return Array.from({ length: profilesPerTask }, (_, pi) => {
          const profile: Record<string, string> = {};
          attrs.forEach((attr: any, ai: number) => {
            const levels = attr.levels || [];
            if (levels.length > 0) {
              profile[attr.name] = levels[(taskIdx * profilesPerTask + pi + ai) % levels.length];
            }
          });
          return profile;
        });
      };

      const profiles = generateProfiles(currentTask);

      return (
        <div className="space-y-3">
          <div className={`${pad} rounded-xl bg-indigo-50 border border-indigo-200 ${txtSm} text-indigo-700`}>
            Task {currentTask + 1} of {numTasks} — Choose your preferred option
          </div>
          <div className={`grid gap-2 ${profilesPerTask <= 3 ? `grid-cols-${profilesPerTask}` : 'grid-cols-2'}`}>
            {profiles.map((profile, pi) => (
              <div key={pi} onClick={() => onResponse(question.id, { ...cjVal, choice: pi, [`task_${currentTask}`]: pi })}
                className={`${pad} rounded-xl border-2 cursor-pointer transition-all ${cjVal.choice === pi ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200' : 'border-stone-200 hover:border-indigo-200'}`}>
                <p className={`${txtSm} font-bold text-center text-indigo-600 mb-2`}>Option {String.fromCharCode(65 + pi)}</p>
                {Object.entries(profile).map(([attrName, level]) => (
                  <div key={attrName} className="flex justify-between py-1 border-b border-stone-100 last:border-0">
                    <span className={`${txtXs} text-stone-500`}>{attrName}</span>
                    <span className={`${txtXs} font-medium text-stone-700`}>{level}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {includeNone && (
            <div onClick={() => onResponse(question.id, { ...cjVal, choice: -1, [`task_${currentTask}`]: -1 })}
              className={`${pad} rounded-xl border-2 cursor-pointer text-center transition-all ${cjVal.choice === -1 ? 'border-stone-400 bg-stone-100' : 'border-stone-200 hover:border-stone-300'}`}>
              <span className={`${txtSm} text-stone-500`}>None of these</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2">
            <button disabled={currentTask === 0} onClick={() => onResponse(question.id, { ...cjVal, task: currentTask - 1, choice: cjVal[`task_${currentTask - 1}` as any] })}
              className={`${txtXs} px-3 py-1 rounded-lg ${currentTask === 0 ? 'text-stone-300' : 'text-indigo-500 hover:bg-indigo-50'}`}>← Previous</button>
            <span className={`${txtXs} text-stone-400`}>{currentTask + 1}/{numTasks}</span>
            {currentTask < numTasks - 1 && (
              <button onClick={() => onResponse(question.id, { ...cjVal, task: currentTask + 1, choice: cjVal[`task_${currentTask + 1}` as any] })}
                className={`${txtXs} px-3 py-1 rounded-lg text-indigo-500 hover:bg-indigo-50`}>Next →</button>
            )}
          </div>
        </div>
      );
    }
    case 'kano': {
      const kanoCats = question.question_config?.kano_categories || ['I like it', 'I expect it', 'I am neutral', 'I can tolerate it', 'I dislike it'];
      const funcQ = question.question_config?.kano_functional || 'How would you feel if this feature were present?';
      const dysfuncQ = question.question_config?.kano_dysfunctional || 'How would you feel if this feature were absent?';
      const kanoVal: { functional?: string; dysfunctional?: string } = (typeof value === 'object' && value && !Array.isArray(value)) ? value : {};

      // Each option = a feature; render paired questions for the feature described in question_text
      return (
        <div className="space-y-4">
          {/* Functional question */}
          <div className={`${pad} rounded-xl bg-emerald-50 border border-emerald-200`}>
            <p className={`${txtSm} font-medium text-emerald-700 mb-2`}>{funcQ}</p>
            <div className="space-y-1.5">
              {kanoCats.map((cat: string, ci: number) => (
                <label key={ci} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${kanoVal.functional === cat ? 'border-emerald-400 bg-emerald-100' : 'border-stone-100 hover:border-emerald-200'}`}>
                  <input type="radio" checked={kanoVal.functional === cat} onChange={() => onResponse(question.id, { ...kanoVal, functional: cat })}
                    className="accent-emerald-500" />
                  <span className={`${txtSm} text-stone-700`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Dysfunctional question */}
          <div className={`${pad} rounded-xl bg-red-50 border border-red-200`}>
            <p className={`${txtSm} font-medium text-red-700 mb-2`}>{dysfuncQ}</p>
            <div className="space-y-1.5">
              {kanoCats.map((cat: string, ci: number) => (
                <label key={ci} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${kanoVal.dysfunctional === cat ? 'border-red-400 bg-red-100' : 'border-stone-100 hover:border-red-200'}`}>
                  <input type="radio" checked={kanoVal.dysfunctional === cat} onChange={() => onResponse(question.id, { ...kanoVal, dysfunctional: cat })}
                    className="accent-red-500" />
                  <span className={`${txtSm} text-stone-700`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>
          {kanoVal.functional && kanoVal.dysfunctional && (
            <div className={`${pad} rounded-xl bg-blue-50 border border-blue-200 ${txtXs} text-blue-600`}>
              Classification will be calculated after submission
            </div>
          )}
        </div>
      );
    }
    case 'sus': {
      // System Usability Scale — 10 standard items, each rated 1-5
      const SUS_ITEMS = [
        'I think that I would like to use this system frequently.',
        'I found the system unnecessarily complex.',
        'I thought the system was easy to use.',
        'I think that I would need the support of a technical person to use this system.',
        'I found the various functions in this system were well integrated.',
        'I thought there was too much inconsistency in this system.',
        'I would imagine that most people would learn to use this system very quickly.',
        'I found the system very cumbersome to use.',
        'I felt very confident using the system.',
        'I needed to learn a lot of things before I could get going with this system.',
      ];
      const SCALE_LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
      const susVal: Record<string, number> = (typeof value === 'object' && value && !Array.isArray(value)) ? value : {};
      const answered = Object.keys(susVal).length;

      return (
        <div className="space-y-3">
          <div className={`${pad} rounded-xl bg-indigo-50 border border-indigo-200 ${txtXs} text-indigo-700`}>
            SUS — Rate each statement (1 = Strongly Disagree, 5 = Strongly Agree). {answered}/10 answered.
          </div>
          {SUS_ITEMS.map((item, idx) => (
            <div key={idx} className={`${pad} rounded-xl border ${susVal[`q${idx}`] ? 'border-indigo-200 bg-indigo-50/30' : 'border-stone-100'}`}>
              <p className={`${txtSm} text-stone-700 mb-2`}>{idx + 1}. {item}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => onResponse(question.id, { ...susVal, [`q${idx}`]: n })}
                    className={`flex-1 py-1.5 rounded-lg text-center ${txtXs} font-medium transition-all ${susVal[`q${idx}`] === n ? 'bg-indigo-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-indigo-100'}`}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className={`${txtXs} text-stone-300`}>{SCALE_LABELS[0]}</span>
                <span className={`${txtXs} text-stone-300`}>{SCALE_LABELS[4]}</span>
              </div>
            </div>
          ))}
          {answered === 10 && (() => {
            // Calculate SUS score: odd items (idx 0,2,4,6,8) = val-1, even items (1,3,5,7,9) = 5-val, sum * 2.5
            let total = 0;
            for (let i = 0; i < 10; i++) {
              const v = susVal[`q${i}`] || 3;
              total += i % 2 === 0 ? (v - 1) : (5 - v);
            }
            const score = Math.round(total * 2.5);
            const grade = score >= 80 ? 'A' : score >= 68 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';
            return (
              <div className={`${pad} rounded-xl bg-emerald-50 border border-emerald-200 text-center`}>
                <p className={`${txtLg} font-bold text-emerald-700`}>SUS Score: {score}/100 (Grade {grade})</p>
                <p className={`${txtXs} text-emerald-500 mt-1`}>{score >= 68 ? 'Above average usability' : 'Below average usability'}</p>
              </div>
            );
          })()}
        </div>
      );
    }
    case 'csat': {
      const csatLabels = ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'];
      const csatEmojis = ['1', '2', '3', '4', '5'];
      return (
        <div className="space-y-2">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => onResponse(question.id, n)}
                className={`flex flex-col items-center gap-1 ${pad} rounded-xl border-2 transition-all cursor-pointer ${value === n ? 'border-emerald-400 bg-emerald-50 scale-105' : 'border-stone-100 hover:border-emerald-200'}`}
                style={{ minWidth: compact ? '48px' : '56px' }}>
                <span className={compact ? 'text-xl' : 'text-2xl'}>{csatEmojis[n - 1]}</span>
                <span className={`${txtXs} text-stone-500 text-center`}>{csatLabels[n - 1]}</span>
              </button>
            ))}
          </div>
          {value && (
            <p className={`${txtXs} text-center text-stone-400`}>CSAT: {value}/5 — {csatLabels[(value as number) - 1]}</p>
          )}
        </div>
      );
    }
    case 'ces': {
      const cesLabels = ['Very Difficult', 'Difficult', 'Somewhat Difficult', 'Neutral', 'Somewhat Easy', 'Easy', 'Very Easy'];
      return (
        <div className="space-y-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <button key={n} onClick={() => onResponse(question.id, n)}
                className={`flex-1 py-2.5 rounded-xl text-center ${txtXs} font-medium transition-all cursor-pointer ${value === n ? 'text-white shadow-sm' : 'bg-stone-100 text-stone-500 hover:bg-blue-50'}`}
                style={value === n ? { backgroundColor: `hsl(${(n - 1) * 20 + 0}, 70%, 50%)` } : {}}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <span className={`${txtXs} text-red-400`}>Very Difficult</span>
            <span className={`${txtXs} text-emerald-400`}>Very Easy</span>
          </div>
          {value && (
            <p className={`${txtXs} text-center text-stone-400`}>CES: {value}/7 — {cesLabels[(value as number) - 1]}</p>
          )}
        </div>
      );
    }
    default:
      return <p className={`${txtSm} text-stone-400 italic`}>Unsupported: {question.question_type}</p>;
  }
};

export default QuestionRenderer;
