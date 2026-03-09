import React, { useState } from 'react';
import { Map, Plus, Trash2, Edit2, Save, X, MoveHorizontal, Smile, Frown, Meh } from 'lucide-react';
import toast from 'react-hot-toast';

// Journey Map Designer – Visual customer/user journey mapping tool
// 旅程地图设计器 – 可视化客户/用户旅程映射工具

interface Props {
  projectId: string;
}

interface TouchPoint {
  id: string;
  action: string;
  channel: string;
  emotion: 'positive' | 'neutral' | 'negative';
  pain_point?: string;
  opportunity?: string;
  quote?: string;
}

interface JourneyStage {
  id: string;
  name: string;
  description: string;
  touchpoints: TouchPoint[];
  duration: string;
}

interface JourneyMap {
  id: string;
  title: string;
  persona_name: string;
  scenario: string;
  stages: JourneyStage[];
  created_at: string;
}

const EMOTION_ICONS: Record<string, React.ReactNode> = {
  positive: <Smile size={16} className="text-emerald-500" />,
  neutral: <Meh size={16} className="text-amber-500" />,
  negative: <Frown size={16} className="text-red-500" />,
};

const EMOTION_SCORES: Record<string, number> = { positive: 2, neutral: 0, negative: -2 };

const JourneyMapDesigner: React.FC<Props> = ({ projectId }) => {
  const [maps, setMaps] = useState<JourneyMap[]>(() => {
    const stored = localStorage.getItem(`journey_maps_${projectId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [editing, setEditing] = useState<JourneyMap | null>(null);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  const save = (updated: JourneyMap[]) => {
    setMaps(updated);
    localStorage.setItem(`journey_maps_${projectId}`, JSON.stringify(updated));
  };

  const createMap = () => {
    const m: JourneyMap = {
      id: crypto.randomUUID(),
      title: 'New Journey Map',
      persona_name: '',
      scenario: '',
      stages: [
        { id: crypto.randomUUID(), name: 'Awareness / 认知', description: '', touchpoints: [], duration: '' },
        { id: crypto.randomUUID(), name: 'Consideration / 考虑', description: '', touchpoints: [], duration: '' },
        { id: crypto.randomUUID(), name: 'Decision / 决策', description: '', touchpoints: [], duration: '' },
        { id: crypto.randomUUID(), name: 'Onboarding / 上手', description: '', touchpoints: [], duration: '' },
        { id: crypto.randomUUID(), name: 'Retention / 留存', description: '', touchpoints: [], duration: '' },
      ],
      created_at: new Date().toISOString(),
    };
    setEditing(m);
  };

  const saveMap = () => {
    if (!editing) return;
    const exists = maps.find(m => m.id === editing.id);
    save(exists ? maps.map(m => m.id === editing.id ? editing : m) : [...maps, editing]);
    setEditing(null);
    toast.success('Journey map saved / 旅程地图已保存');
  };

  const deleteMap = (id: string) => {
    save(maps.filter(m => m.id !== id));
    if (selectedMap === id) setSelectedMap(null);
  };

  const addStage = () => {
    if (!editing) return;
    setEditing({ ...editing, stages: [...editing.stages, { id: crypto.randomUUID(), name: 'New Stage', description: '', touchpoints: [], duration: '' }] });
  };

  const addTouchpoint = (stageId: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      stages: editing.stages.map(s => s.id === stageId ? {
        ...s,
        touchpoints: [...s.touchpoints, { id: crypto.randomUUID(), action: '', channel: '', emotion: 'neutral' }],
      } : s),
    });
  };

  const updateTouchpoint = (stageId: string, tpId: string, updates: Partial<TouchPoint>) => {
    if (!editing) return;
    setEditing({
      ...editing,
      stages: editing.stages.map(s => s.id === stageId ? {
        ...s,
        touchpoints: s.touchpoints.map(tp => tp.id === tpId ? { ...tp, ...updates } : tp),
      } : s),
    });
  };

  const removeTouchpoint = (stageId: string, tpId: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      stages: editing.stages.map(s => s.id === stageId ? {
        ...s,
        touchpoints: s.touchpoints.filter(tp => tp.id !== tpId),
      } : s),
    });
  };

  const removeStage = (stageId: string) => {
    if (!editing) return;
    setEditing({ ...editing, stages: editing.stages.filter(s => s.id !== stageId) });
  };

  const viewMap = selectedMap ? maps.find(m => m.id === selectedMap) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Map size={22} className="text-emerald-600" />
            Journey Map Designer / 旅程地图设计器
          </h2>
          <p className="text-sm text-stone-500 mt-1">Visualize user experiences across touchpoints / 可视化用户在各触点的体验</p>
        </div>
        <button onClick={createMap} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
          <Plus size={14} /> New Map / 新建地图
        </button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="text-lg font-semibold bg-transparent border-none focus:outline-none text-stone-800" placeholder="Journey Map Title / 旅程地图标题" />
            <button onClick={() => setEditing(null)} className="p-1 text-stone-400"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={editing.persona_name} onChange={e => setEditing({ ...editing, persona_name: e.target.value })} placeholder="Persona / 画像名称" className="px-3 py-2 rounded-lg border border-stone-200 text-sm" />
            <input value={editing.scenario} onChange={e => setEditing({ ...editing, scenario: e.target.value })} placeholder="Scenario / 场景描述" className="px-3 py-2 rounded-lg border border-stone-200 text-sm" />
          </div>

          {/* Stages Editor */}
          <div className="overflow-x-auto">
            <div className="flex gap-3 min-w-max">
              {editing.stages.map(stage => (
                <div key={stage.id} className="w-64 bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <input value={stage.name} onChange={e => setEditing({ ...editing, stages: editing.stages.map(s => s.id === stage.id ? { ...s, name: e.target.value } : s) })} className="font-medium text-sm bg-transparent border-none focus:outline-none text-stone-800 w-full" />
                    <button onClick={() => removeStage(stage.id)} className="text-stone-300 hover:text-red-400 shrink-0"><Trash2 size={13} /></button>
                  </div>
                  <input value={stage.duration} onChange={e => setEditing({ ...editing, stages: editing.stages.map(s => s.id === stage.id ? { ...s, duration: e.target.value } : s) })} placeholder="Duration / 时长" className="w-full px-2 py-1 rounded border border-stone-200 text-xs" />

                  {/* Touchpoints */}
                  {stage.touchpoints.map(tp => (
                    <div key={tp.id} className="bg-white rounded-lg border border-stone-200 p-2 space-y-1.5">
                      <div className="flex items-center gap-1">
                        <select value={tp.emotion} onChange={e => updateTouchpoint(stage.id, tp.id, { emotion: e.target.value as any })} className="text-xs border rounded px-1 py-0.5">
                          <option value="positive">😊</option><option value="neutral">😐</option><option value="negative">😞</option>
                        </select>
                        <input value={tp.action} onChange={e => updateTouchpoint(stage.id, tp.id, { action: e.target.value })} placeholder="Action / 行为" className="flex-1 px-1.5 py-0.5 border rounded text-[11px]" />
                        <button onClick={() => removeTouchpoint(stage.id, tp.id)} className="text-stone-300 hover:text-red-400"><X size={12} /></button>
                      </div>
                      <input value={tp.channel || ''} onChange={e => updateTouchpoint(stage.id, tp.id, { channel: e.target.value })} placeholder="Channel / 渠道" className="w-full px-1.5 py-0.5 border rounded text-[11px]" />
                      <input value={tp.pain_point || ''} onChange={e => updateTouchpoint(stage.id, tp.id, { pain_point: e.target.value })} placeholder="Pain point / 痛点" className="w-full px-1.5 py-0.5 border rounded text-[11px] text-red-600" />
                      <input value={tp.opportunity || ''} onChange={e => updateTouchpoint(stage.id, tp.id, { opportunity: e.target.value })} placeholder="Opportunity / 机会" className="w-full px-1.5 py-0.5 border rounded text-[11px] text-emerald-600" />
                    </div>
                  ))}
                  <button onClick={() => addTouchpoint(stage.id)} className="w-full py-1.5 rounded-lg border border-dashed border-stone-300 text-xs text-stone-400 hover:border-emerald-400 hover:text-emerald-600">+ Touchpoint</button>
                </div>
              ))}
              <button onClick={addStage} className="w-48 h-32 flex items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-400 hover:border-emerald-400 hover:text-emerald-600 shrink-0">
                <Plus size={20} />
              </button>
            </div>
          </div>

          <button onClick={saveMap} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
            <Save size={14} /> Save Map / 保存地图
          </button>
        </div>
      )}

      {/* Map List */}
      {!editing && maps.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {maps.map(m => (
            <div key={m.id} onClick={() => setSelectedMap(selectedMap === m.id ? null : m.id)} className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${selectedMap === m.id ? 'border-emerald-500' : 'border-stone-200 hover:border-stone-300'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-stone-800 text-sm">{m.title}</h4>
                  <p className="text-xs text-stone-500">{m.persona_name && `Persona: ${m.persona_name} • `}{m.stages.length} stages • {m.stages.reduce((a, s) => a + s.touchpoints.length, 0)} touchpoints</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); setEditing(m); }} className="p-1 rounded hover:bg-stone-100 text-stone-400"><Edit2 size={13} /></button>
                  <button onClick={e => { e.stopPropagation(); deleteMap(m.id); }} className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
              {/* Mini emotion curve */}
              <div className="flex items-end gap-1 h-8">
                {m.stages.map(s => {
                  const avg = s.touchpoints.length > 0 ? s.touchpoints.reduce((a, tp) => a + EMOTION_SCORES[tp.emotion], 0) / s.touchpoints.length : 0;
                  const h = Math.max(4, (avg + 2) / 4 * 100);
                  return <div key={s.id} className={`flex-1 rounded-t-sm ${avg > 0 ? 'bg-emerald-300' : avg < 0 ? 'bg-red-300' : 'bg-amber-300'}`} style={{ height: `${h}%` }} title={`${s.name}: ${avg.toFixed(1)}`} />;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Journey View */}
      {viewMap && !editing && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-stone-700 mb-1">{viewMap.title}</h3>
          <p className="text-xs text-stone-500 mb-4">{viewMap.scenario}</p>

          {/* Emotion Curve */}
          <div className="mb-4">
            <h4 className="text-[10px] font-semibold text-stone-500 uppercase mb-2">Emotion Curve / 情绪曲线</h4>
            <div className="flex items-center gap-0 h-16">
              {viewMap.stages.map((s, i) => {
                const avg = s.touchpoints.length > 0 ? s.touchpoints.reduce((a, tp) => a + EMOTION_SCORES[tp.emotion], 0) / s.touchpoints.length : 0;
                const yPct = 50 - (avg / 2 * 50);
                return (
                  <div key={s.id} className="flex-1 relative h-full">
                    <div className="absolute inset-0 border-l border-stone-100" />
                    <div className={`absolute w-3 h-3 rounded-full ${avg > 0 ? 'bg-emerald-500' : avg < 0 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ top: `${yPct}%`, left: '50%', transform: 'translate(-50%, -50%)' }} />
                    <div className="absolute bottom-0 w-full text-center text-[9px] text-stone-400 truncate px-1">{s.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stages Detail */}
          <div className="flex gap-3 min-w-max">
            {viewMap.stages.map(stage => (
              <div key={stage.id} className="w-56 shrink-0">
                <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
                  <h5 className="font-medium text-xs text-stone-800 mb-1">{stage.name}</h5>
                  {stage.duration && <p className="text-[10px] text-stone-400 mb-2">⏱ {stage.duration}</p>}
                  {stage.touchpoints.map(tp => (
                    <div key={tp.id} className="bg-white rounded p-2 border border-stone-100 mb-1.5">
                      <div className="flex items-center gap-1 mb-0.5">
                        {EMOTION_ICONS[tp.emotion]}
                        <span className="text-xs font-medium text-stone-700">{tp.action}</span>
                      </div>
                      {tp.channel && <p className="text-[10px] text-stone-400">📱 {tp.channel}</p>}
                      {tp.pain_point && <p className="text-[10px] text-red-500">😩 {tp.pain_point}</p>}
                      {tp.opportunity && <p className="text-[10px] text-emerald-600">💡 {tp.opportunity}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {maps.length === 0 && !editing && (
        <div className="text-center py-12 text-stone-400">
          <Map size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No journey maps yet / 暂无旅程地图</p>
        </div>
      )}
    </div>
  );
};

export default JourneyMapDesigner;
