import React, { useState, useRef, useCallback, useEffect } from 'react';

export interface EcogramMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  gender?: string;
  distance: 'same_home' | 'same_community' | 'same_district' | 'same_city' | 'different_city' | 'abroad';
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasionally';
  importance: number;
  x: number;
  y: number;
  circle: 1 | 2 | 3;
  lineStyle: 'solid' | 'dashed' | 'jagged';
  arrowDirection: 'to' | 'from' | 'both';
  supportTypes: string[];
  customSupport?: string;
  color: string;
}

interface EcogramBuilderProps {
  initialData?: { members: EcogramMember[]; lastUpdated: string | null };
  onSave?: (data: { members: EcogramMember[]; lastUpdated: string }) => void;
  readOnly?: boolean;
  centerLabel?: string;
  relationshipOptions?: { value: string; label: string; color: string }[];
  supportCategories?: { value: string; label: string }[];
}

const DEFAULT_RELATIONSHIPS = [
  { value: 'spouse', label: 'Spouse/Partner', color: '#EC4899' },
  { value: 'child', label: 'Child', color: '#8B5CF6' },
  { value: 'parent', label: 'Parent', color: '#3B82F6' },
  { value: 'sibling', label: 'Sibling', color: '#06B6D4' },
  { value: 'friend', label: 'Friend', color: '#10B981' },
  { value: 'neighbor', label: 'Neighbor', color: '#84CC16' },
  { value: 'doctor', label: 'Doctor', color: '#EF4444' },
  { value: 'nurse', label: 'Nurse', color: '#F97316' },
  { value: 'professional', label: 'Professional', color: '#A855F7' },
  { value: 'other', label: 'Other', color: '#6B7280' },
];

const DEFAULT_SUPPORT_CATEGORIES = [
  { value: 'adl', label: 'Activities of Daily Living (ADL)' },
  { value: 'iadl', label: 'Instrumental ADL (IADL)' },
  { value: 'emotional', label: 'Emotional Support' },
  { value: 'companionship', label: 'Companionship' },
  { value: 'financial', label: 'Financial Support' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'medical', label: 'Medical/Clinical' },
  { value: 'other', label: 'Other' },
];

const EcogramBuilder: React.FC<EcogramBuilderProps> = ({
  initialData,
  onSave,
  readOnly = false,
  centerLabel = 'You',
  relationshipOptions = DEFAULT_RELATIONSHIPS,
  supportCategories = DEFAULT_SUPPORT_CATEGORIES,
}) => {
  const normalizeMember = (m: EcogramMember, i: number): EcogramMember => ({
    ...m,
    supportTypes: m.supportTypes || [],
    x: m.x ?? (50 + 26 * Math.cos(i * 45 * Math.PI / 180)),
    y: m.y ?? (50 + 26 * Math.sin(i * 45 * Math.PI / 180)),
    circle: m.circle ?? 2,
    importance: m.importance ?? 50,
    lineStyle: m.lineStyle || 'solid',
    arrowDirection: m.arrowDirection || 'both',
    color: m.color || '#6B7280',
  });

  const [members, setMembers] = useState<EcogramMember[]>(
    (initialData?.members || []).map(normalizeMember)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', rel: '', age: '', gender: '',
    distance: 'same_city' as EcogramMember['distance'],
    frequency: 'weekly' as EcogramMember['frequency'],
    importance: 50, circle: 2 as 1 | 2 | 3,
    line: 'solid' as EcogramMember['lineStyle'],
    arrow: 'both' as EcogramMember['arrowDirection'],
    support: [] as string[], customSupport: ''
  });
  const svgRef = useRef<SVGSVGElement>(null);

  const drag = useCallback((e: MouseEvent | TouchEvent, id: string) => {
    if (readOnly || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = Math.max(8, Math.min(92, ((cx - r.left) / r.width) * 100));
    const y = Math.max(8, Math.min(92, ((cy - r.top) / r.height) * 100));
    const d = Math.sqrt((x - 50) ** 2 + (y - 50) ** 2);
    const circle: 1 | 2 | 3 = d < 18 ? 1 : d < 32 ? 2 : 3;
    setMembers(p => p.map(m => m.id === id ? { ...m, x, y, circle } : m));
  }, [readOnly]);

  const handleSave = () => {
    onSave?.({ members, lastUpdated: new Date().toISOString() });
  };

  const addMember = () => {
    if (!form.name || !form.rel) return;
    const rel = relationshipOptions.find(r => r.value === form.rel);
    const angle = members.length * 45 * Math.PI / 180;
    const rad = form.circle === 1 ? 14 : form.circle === 2 ? 26 : 38;
    setMembers([...members, {
      id: Date.now().toString(), name: form.name, relationship: form.rel,
      age: form.age ? parseInt(form.age) : undefined,
      gender: form.gender || undefined,
      distance: form.distance, frequency: form.frequency, importance: form.importance,
      x: 50 + rad * Math.cos(angle), y: 50 + rad * Math.sin(angle),
      circle: form.circle, lineStyle: form.line, arrowDirection: form.arrow,
      supportTypes: form.support, customSupport: form.customSupport || undefined,
      color: rel?.color || '#6B7280',
    }]);
    setForm({ name: '', rel: '', age: '', gender: '', distance: 'same_city', frequency: 'weekly', importance: 50, circle: 2, line: 'solid', arrow: 'both', support: [], customSupport: '' });
    setShowAdd(false);
  };

  const removeMember = (id: string) => {
    setMembers(p => p.filter(m => m.id !== id));
    if (selected === id) setSelected(null);
  };

  const renderLine = (m: EcogramMember) => {
    const sw = Math.max(2, m.importance / 25);
    const dash = m.lineStyle === 'dashed' ? '6,3' : undefined;
    const [mx, my] = [m.x * 4, m.y * 4];
    if (m.lineStyle === 'jagged') {
      const dx = mx - 200, dy = my - 200;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(dist / 12);
      const px = -dy / dist * 4, py = dx / dist * 4;
      let d = 'M200,200';
      for (let i = 1; i <= steps; i++) {
        const t = i / steps, bx = 200 + dx * t, by = 200 + dy * t;
        d += i < steps ? ` L${bx + px * (i % 2 ? 1 : -1)},${by + py * (i % 2 ? 1 : -1)}` : ` L${mx},${my}`;
      }
      return <path key={`l-${m.id}`} d={d} stroke={m.color} strokeWidth={sw} fill="none" opacity={0.5} />;
    }
    return <line key={`l-${m.id}`} x1="200" y1="200" x2={mx} y2={my} stroke={m.color} strokeWidth={sw} strokeDasharray={dash} opacity={0.5} />;
  };

  const renderArrow = (m: EcogramMember) => {
    const [mx, my] = [m.x * 4, m.y * 4];
    const ang = Math.atan2(my - 200, mx - 200) * 180 / Math.PI;
    const arrows = [];
    if (m.arrowDirection === 'to' || m.arrowDirection === 'both') {
      arrows.push(<polygon key={`a1-${m.id}`} points="0,-4 8,0 0,4" fill={m.color}
        transform={`translate(${200 + (mx - 200) * 0.35},${200 + (my - 200) * 0.35}) rotate(${ang})`} />);
    }
    if (m.arrowDirection === 'from' || m.arrowDirection === 'both') {
      arrows.push(<polygon key={`a2-${m.id}`} points="0,-4 8,0 0,4" fill={m.color}
        transform={`translate(${200 + (mx - 200) * 0.65},${200 + (my - 200) * 0.65}) rotate(${ang + 180})`} />);
    }
    return arrows;
  };

  const exportAsPng = () => {
    if (!svgRef.current) return;
    const svg = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 800;
    const img = new Image();
    img.onload = () => {
      canvas.getContext('2d')?.drawImage(img, 0, 0, 800, 800);
      const a = document.createElement('a');
      a.download = `ecogram-${new Date().toISOString().split('T')[0]}.png`;
      a.href = canvas.toDataURL();
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  };

  const sel = members.find(m => m.id === selected);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-emerald-600">Care Network</h3>
        <p className="text-xs text-stone-400">Drag to adjust position, click to edit details</p>
      </div>

      {/* SVG Ecogram */}
      <div className="relative mx-auto" style={{ maxWidth: '420px' }}>
        <svg ref={svgRef} viewBox="0 0 400 400" className="w-full" style={{ background: '#fafaf9', borderRadius: '50%' }}>
          <circle cx="200" cy="200" r="176" fill="rgba(16,185,129,0.05)" stroke="#e7e5e4" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx="200" cy="200" r="124" fill="rgba(16,185,129,0.1)" stroke="#e7e5e4" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx="200" cy="200" r="68" fill="rgba(16,185,129,0.15)" stroke="#e7e5e4" strokeWidth="2" strokeDasharray="5,5" />
          <text x="200" y="28" textAnchor="middle" fontSize="9" fill="#a8a29e">Distant: sporadic support</text>
          <text x="200" y="82" textAnchor="middle" fontSize="9" fill="#a8a29e">Medium: regular support</text>
          <text x="200" y="138" textAnchor="middle" fontSize="9" fill="#a8a29e">Close: essential support</text>
          {members.map(renderLine)}
          {members.map(renderArrow)}
          <circle cx="200" cy="200" r="22" fill="#10b981" />
          <text x="200" y="205" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">{centerLabel.slice(0, 4)}</text>
          {members.map(m => {
            const [mx, my] = [m.x * 4, m.y * 4];
            const isSel = selected === m.id;
            return (
              <g key={m.id} style={{ cursor: readOnly ? 'default' : 'grab' }}
                onMouseDown={e => {
                  e.preventDefault();
                  setSelected(m.id);
                  if (readOnly) return;
                  const mv = (ev: MouseEvent) => drag(ev, m.id);
                  const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
                  document.addEventListener('mousemove', mv);
                  document.addEventListener('mouseup', up);
                }}
                onTouchStart={() => {
                  setSelected(m.id);
                  if (readOnly) return;
                  const mv = (ev: TouchEvent) => drag(ev, m.id);
                  const up = () => { document.removeEventListener('touchmove', mv); document.removeEventListener('touchend', up); };
                  document.addEventListener('touchmove', mv);
                  document.addEventListener('touchend', up);
                }}>
                <circle cx={mx} cy={my} r={isSel ? 26 : 22} fill={m.color} stroke={isSel ? '#10b981' : 'white'} strokeWidth={isSel ? 3 : 2} />
                <text x={mx} y={my - 3} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">{m.name.slice(0, 5)}</text>
                <text x={mx} y={my + 8} textAnchor="middle" fontSize="7" fill="white" opacity={0.9}>
                  {relationshipOptions.find(r => r.value === m.relationship)?.label.slice(0, 6) || m.relationship.slice(0, 6)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Action buttons */}
      {!readOnly && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">
            + Add Member
          </button>
          <button onClick={handleSave}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">
            Save
          </button>
          <button onClick={exportAsPng}
            className="px-4 py-2 rounded-xl text-[13px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
            Export PNG
          </button>
        </div>
      )}

      {/* Selected Member Panel */}
      {sel && (
        <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[14px] font-semibold text-stone-800">{sel.name}</h4>
            <div className="flex gap-2">
              {!readOnly && (
                <button onClick={() => removeMember(sel.id)}
                  className="text-[12px] text-red-500 hover:text-red-600">Remove</button>
              )}
              <button onClick={() => setSelected(null)}
                className="text-[12px] text-stone-400 hover:text-stone-600">Close</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="p-2 rounded-lg bg-stone-50">
              <span className="text-stone-400">Relationship</span>
              <p className="font-medium text-stone-700">{relationshipOptions.find(r => r.value === sel.relationship)?.label || sel.relationship}</p>
            </div>
            <div className="p-2 rounded-lg bg-stone-50">
              <span className="text-stone-400">Closeness</span>
              <p className="font-medium text-stone-700">Circle {sel.circle}</p>
            </div>
            <div className="p-2 rounded-lg bg-stone-50">
              <span className="text-stone-400">Frequency</span>
              <p className="font-medium text-stone-700 capitalize">{sel.frequency}</p>
            </div>
            <div className="p-2 rounded-lg bg-stone-50">
              <span className="text-stone-400">Importance</span>
              <p className="font-medium text-stone-700">{sel.importance}%</p>
            </div>
          </div>
          {sel.supportTypes.length > 0 && (
            <div>
              <p className="text-[11px] text-stone-400 mb-1">Support Types</p>
              <div className="flex flex-wrap gap-1">
                {sel.supportTypes.map(st => (
                  <span key={st} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {supportCategories.find(c => c.value === st)?.label || st}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!readOnly && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-stone-400">Line Style</label>
                  <select value={sel.lineStyle} onChange={e => setMembers(p => p.map(m => m.id === sel.id ? { ...m, lineStyle: e.target.value as any } : m))}
                    className="w-full px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                    <option value="solid">Solid (Strong)</option>
                    <option value="dashed">Dashed (Moderate)</option>
                    <option value="jagged">Jagged (Strained)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-stone-400">Arrow Direction</label>
                  <select value={sel.arrowDirection} onChange={e => setMembers(p => p.map(m => m.id === sel.id ? { ...m, arrowDirection: e.target.value as any } : m))}
                    className="w-full px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                    <option value="to">To (you support them)</option>
                    <option value="from">From (they support you)</option>
                    <option value="both">Both (mutual)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-stone-400">Importance ({sel.importance}%)</label>
                <input type="range" min="0" max="100" value={sel.importance}
                  onChange={e => setMembers(p => p.map(m => m.id === sel.id ? { ...m, importance: parseInt(e.target.value) } : m))}
                  className="w-full" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-xl border border-stone-100 p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold text-stone-800 mb-4">Add Network Member</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-stone-500">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[12px] font-medium text-stone-500">Relationship *</label>
                  <select value={form.rel} onChange={e => setForm({ ...form, rel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] bg-white focus:ring-2 focus:ring-emerald-200">
                    <option value="">Select...</option>
                    {relationshipOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-stone-500">Age</label>
                  <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] focus:ring-2 focus:ring-emerald-200 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[12px] font-medium text-stone-500">Distance</label>
                  <select value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] bg-white">
                    <option value="same_home">Same Home</option>
                    <option value="same_community">Same Community</option>
                    <option value="same_city">Same City</option>
                    <option value="different_city">Different City</option>
                    <option value="abroad">Abroad</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-stone-500">Contact Frequency</label>
                  <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] bg-white">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="occasionally">Occasionally</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-stone-500">Closeness Circle</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3].map(c => (
                    <button key={c} onClick={() => setForm({ ...form, circle: c as 1 | 2 | 3 })}
                      className={`flex-1 py-2 rounded-xl text-[12px] font-medium border-2 transition-all ${form.circle === c ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'}`}>
                      {c === 1 ? 'Close' : c === 2 ? 'Medium' : 'Distant'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-stone-500">Importance ({form.importance}%)</label>
                <input type="range" min="0" max="100" value={form.importance}
                  onChange={e => setForm({ ...form, importance: parseInt(e.target.value) })} className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[12px] font-medium text-stone-500">Line Style</label>
                  <select value={form.line} onChange={e => setForm({ ...form, line: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] bg-white">
                    <option value="solid">Solid (Strong)</option>
                    <option value="dashed">Dashed (Moderate)</option>
                    <option value="jagged">Jagged (Strained)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-stone-500">Arrow</label>
                  <select value={form.arrow} onChange={e => setForm({ ...form, arrow: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] bg-white">
                    <option value="to">To</option>
                    <option value="from">From</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-stone-500">Support Types</label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {supportCategories.map(cat => {
                    const checked = form.support.includes(cat.value);
                    return (
                      <label key={cat.value} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-[12px] transition-all ${checked ? 'border-emerald-300 bg-emerald-50/50' : 'border-stone-200'}`}>
                        <input type="checkbox" checked={checked}
                          onChange={e => setForm({ ...form, support: e.target.checked ? [...form.support, cat.value] : form.support.filter(s => s !== cat.value) })}
                          className="rounded border-stone-300 text-emerald-500" />
                        {cat.label}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50">Cancel</button>
                <button onClick={addMember} disabled={!form.name || !form.rel}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 transition-all">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcogramBuilder;
