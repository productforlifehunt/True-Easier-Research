import React, { useState, useMemo } from 'react';
import { UserCircle, Plus, Trash2, Edit2, Save, X, Target, Quote, Heart, Frown, Star, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

// Persona Builder – Create research personas from survey data
// 用户画像构建器 – 从调查数据创建研究用户画像

interface Props {
  projectId: string;
  questionnaires: any[];
}

interface PersonaGoal {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
}

interface PersonaPainPoint {
  id: string;
  text: string;
  severity: 'critical' | 'major' | 'minor';
}

interface Persona {
  id: string;
  name: string;
  age: string;
  occupation: string;
  location: string;
  bio: string;
  avatar_emoji: string;
  segment_tags: string[];
  goals: PersonaGoal[];
  pain_points: PersonaPainPoint[];
  behaviors: string[];
  quotes: string[];
  tech_comfort: number; // 1-5
  motivation_level: number; // 1-5
  frequency_of_use: string;
  preferred_channels: string[];
  key_metrics: { label: string; value: string }[];
  color: string;
  created_at: string;
}

const AVATAR_EMOJIS = ['👩‍💼', '👨‍💻', '👩‍🔬', '👨‍🏫', '👩‍⚕️', '👨‍🎨', '👩‍🍳', '👨‍🔧', '🧑‍💼', '👵', '👴', '🧑‍🎓', '👩‍🌾', '👨‍✈️', '🧑‍🚀', '👷'];
const PERSONA_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6'];

const PersonaBuilder: React.FC<Props> = ({ projectId, questionnaires }) => {
  const [personas, setPersonas] = useState<Persona[]>(() => {
    const stored = localStorage.getItem(`personas_${projectId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [editing, setEditing] = useState<Persona | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const save = (updated: Persona[]) => {
    setPersonas(updated);
    localStorage.setItem(`personas_${projectId}`, JSON.stringify(updated));
  };

  const createPersona = () => {
    const p: Persona = {
      id: crypto.randomUUID(),
      name: 'New Persona',
      age: '25-34',
      occupation: '',
      location: '',
      bio: '',
      avatar_emoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
      segment_tags: [],
      goals: [],
      pain_points: [],
      behaviors: [],
      quotes: [],
      tech_comfort: 3,
      motivation_level: 3,
      frequency_of_use: 'Weekly',
      preferred_channels: [],
      key_metrics: [],
      color: PERSONA_COLORS[personas.length % PERSONA_COLORS.length],
      created_at: new Date().toISOString(),
    };
    setEditing(p);
  };

  const savePersona = () => {
    if (!editing) return;
    const exists = personas.find(p => p.id === editing.id);
    if (exists) {
      save(personas.map(p => p.id === editing.id ? editing : p));
    } else {
      save([...personas, editing]);
    }
    setEditing(null);
    toast.success('Persona saved / 画像已保存');
  };

  const deletePersona = (id: string) => {
    save(personas.filter(p => p.id !== id));
    if (selectedPersona === id) setSelectedPersona(null);
    toast.success('Persona deleted / 画像已删除');
  };

  const addGoal = () => {
    if (!editing) return;
    setEditing({ ...editing, goals: [...editing.goals, { id: crypto.randomUUID(), text: '', priority: 'medium' }] });
  };

  const addPainPoint = () => {
    if (!editing) return;
    setEditing({ ...editing, pain_points: [...editing.pain_points, { id: crypto.randomUUID(), text: '', severity: 'major' }] });
  };

  const addQuote = () => {
    if (!editing) return;
    setEditing({ ...editing, quotes: [...editing.quotes, ''] });
  };

  const detail = selectedPersona ? personas.find(p => p.id === selectedPersona) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <UserCircle size={22} className="text-emerald-600" />
            Persona Builder / 用户画像构建器
          </h2>
          <p className="text-sm text-stone-500 mt-1">Create research-driven personas from your data / 从数据创建研究驱动的用户画像</p>
        </div>
        <button onClick={createPersona} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
          <Plus size={14} /> New Persona / 新建画像
        </button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-700">{editing.id && personas.find(p => p.id === editing.id) ? 'Edit' : 'Create'} Persona</h3>
            <button onClick={() => setEditing(null)} className="p-1 text-stone-400 hover:text-stone-600"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setEditing({ ...editing, avatar_emoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)] })} className="text-4xl cursor-pointer hover:scale-110 transition-transform">{editing.avatar_emoji}</button>
                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Name / 名称" className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm font-semibold" />
              </div>
              <input value={editing.age} onChange={e => setEditing({ ...editing, age: e.target.value })} placeholder="Age range / 年龄段" className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
              <input value={editing.occupation} onChange={e => setEditing({ ...editing, occupation: e.target.value })} placeholder="Occupation / 职业" className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
              <input value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} placeholder="Location / 地点" className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
              <textarea value={editing.bio} onChange={e => setEditing({ ...editing, bio: e.target.value })} placeholder="Bio / 简介" rows={3} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Tech Comfort / 技术熟悉度: {editing.tech_comfort}/5</label>
                <input type="range" min={1} max={5} value={editing.tech_comfort} onChange={e => setEditing({ ...editing, tech_comfort: parseInt(e.target.value) })} className="w-full" />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Motivation / 动机: {editing.motivation_level}/5</label>
                <input type="range" min={1} max={5} value={editing.motivation_level} onChange={e => setEditing({ ...editing, motivation_level: parseInt(e.target.value) })} className="w-full" />
              </div>
            </div>

            {/* Goals & Pain Points */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-600 flex items-center gap-1"><Target size={12} /> Goals / 目标</label>
                  <button onClick={addGoal} className="text-xs text-emerald-600 hover:text-emerald-700">+ Add</button>
                </div>
                {editing.goals.map((g, i) => (
                  <div key={g.id} className="flex items-center gap-1 mb-1">
                    <select value={g.priority} onChange={e => setEditing({ ...editing, goals: editing.goals.map(gg => gg.id === g.id ? { ...gg, priority: e.target.value as any } : gg) })} className="px-1 py-1 border rounded text-[10px] w-14">
                      <option value="high">🔴</option><option value="medium">🟡</option><option value="low">🟢</option>
                    </select>
                    <input value={g.text} onChange={e => setEditing({ ...editing, goals: editing.goals.map(gg => gg.id === g.id ? { ...gg, text: e.target.value } : gg) })} placeholder="Goal..." className="flex-1 px-2 py-1 border rounded text-xs" />
                    <button onClick={() => setEditing({ ...editing, goals: editing.goals.filter(gg => gg.id !== g.id) })} className="text-stone-300 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-600 flex items-center gap-1"><Frown size={12} /> Pain Points / 痛点</label>
                  <button onClick={addPainPoint} className="text-xs text-emerald-600 hover:text-emerald-700">+ Add</button>
                </div>
                {editing.pain_points.map(pp => (
                  <div key={pp.id} className="flex items-center gap-1 mb-1">
                    <select value={pp.severity} onChange={e => setEditing({ ...editing, pain_points: editing.pain_points.map(p => p.id === pp.id ? { ...p, severity: e.target.value as any } : p) })} className="px-1 py-1 border rounded text-[10px] w-16">
                      <option value="critical">Critical</option><option value="major">Major</option><option value="minor">Minor</option>
                    </select>
                    <input value={pp.text} onChange={e => setEditing({ ...editing, pain_points: editing.pain_points.map(p => p.id === pp.id ? { ...p, text: e.target.value } : p) })} placeholder="Pain point..." className="flex-1 px-2 py-1 border rounded text-xs" />
                    <button onClick={() => setEditing({ ...editing, pain_points: editing.pain_points.filter(p => p.id !== pp.id) })} className="text-stone-300 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quotes & Tags */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-600 flex items-center gap-1"><Quote size={12} /> Quotes / 引用</label>
                  <button onClick={addQuote} className="text-xs text-emerald-600 hover:text-emerald-700">+ Add</button>
                </div>
                {editing.quotes.map((q, i) => (
                  <div key={i} className="flex items-center gap-1 mb-1">
                    <input value={q} onChange={e => setEditing({ ...editing, quotes: editing.quotes.map((qq, ii) => ii === i ? e.target.value : qq) })} placeholder='"User quote..."' className="flex-1 px-2 py-1 border rounded text-xs italic" />
                    <button onClick={() => setEditing({ ...editing, quotes: editing.quotes.filter((_, ii) => ii !== i) })} className="text-stone-300 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">Segment Tags / 分群标签</label>
                <input
                  value={editing.segment_tags.join(', ')}
                  onChange={e => setEditing({ ...editing, segment_tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="tag1, tag2, tag3..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">Usage Frequency / 使用频率</label>
                <select value={editing.frequency_of_use} onChange={e => setEditing({ ...editing, frequency_of_use: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm">
                  <option>Daily / 每天</option><option>Weekly / 每周</option><option>Monthly / 每月</option><option>Rarely / 很少</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-stone-100">
            <button onClick={savePersona} disabled={!editing.name} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
              <Save size={14} /> Save Persona / 保存画像
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600">Cancel / 取消</button>
          </div>
        </div>
      )}

      {/* Persona Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map(p => (
          <div
            key={p.id}
            onClick={() => setSelectedPersona(selectedPersona === p.id ? null : p.id)}
            className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${selectedPersona === p.id ? 'border-emerald-500 shadow-lg' : 'border-stone-200'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{p.avatar_emoji}</div>
                <div>
                  <h4 className="font-semibold text-stone-800">{p.name}</h4>
                  <p className="text-xs text-stone-500">{p.age} • {p.occupation}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={e => { e.stopPropagation(); setEditing(p); }} className="p-1 rounded hover:bg-stone-100 text-stone-400"><Edit2 size={13} /></button>
                <button onClick={e => { e.stopPropagation(); deletePersona(p.id); }} className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="text-xs text-stone-600 line-clamp-2 mb-3">{p.bio || 'No bio yet / 暂无简介'}</p>
            <div className="flex gap-3 text-xs text-stone-500 mb-2">
              <span>🎯 {p.goals.length} goals</span>
              <span>😩 {p.pain_points.length} pains</span>
              <span>💬 {p.quotes.length} quotes</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {p.segment_tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px]">{tag}</span>
              ))}
            </div>
            {/* Mini gauges */}
            <div className="flex gap-4 mt-3 pt-3 border-t border-stone-100">
              <div className="text-center">
                <div className="text-xs text-stone-400">Tech</div>
                <div className="flex gap-0.5 mt-0.5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < p.tech_comfort ? 'bg-emerald-400' : 'bg-stone-200'}`} />)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-stone-400">Motivation</div>
                <div className="flex gap-0.5 mt-0.5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < p.motivation_level ? 'bg-blue-400' : 'bg-stone-200'}`} />)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Panel */}
      {detail && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{detail.avatar_emoji}</div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">{detail.name}</h3>
              <p className="text-sm text-stone-500">{detail.age} • {detail.occupation} • {detail.location}</p>
              <p className="text-sm text-stone-600 mt-1">{detail.bio}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-stone-600 mb-2 flex items-center gap-1"><Target size={12} /> Goals / 目标</h4>
              {detail.goals.map(g => (
                <div key={g.id} className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{g.priority === 'high' ? '🔴' : g.priority === 'medium' ? '🟡' : '🟢'}</span>
                  <span className="text-sm text-stone-700">{g.text}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-stone-600 mb-2 flex items-center gap-1"><Frown size={12} /> Pain Points / 痛点</h4>
              {detail.pain_points.map(pp => (
                <div key={pp.id} className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${pp.severity === 'critical' ? 'bg-red-100 text-red-700' : pp.severity === 'major' ? 'bg-orange-100 text-orange-700' : 'bg-stone-100 text-stone-600'}`}>{pp.severity}</span>
                  <span className="text-sm text-stone-700">{pp.text}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-stone-600 mb-2 flex items-center gap-1"><Quote size={12} /> Quotes / 引用</h4>
              {detail.quotes.map((q, i) => (
                <p key={i} className="text-sm text-stone-600 italic border-l-2 border-stone-200 pl-2 mb-2">"{q}"</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {personas.length === 0 && !editing && (
        <div className="text-center py-12 text-stone-400">
          <UserCircle size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No personas yet / 暂无画像</p>
          <p className="text-xs mt-1">Create personas to represent your research participants / 创建画像以代表您的研究参与者</p>
        </div>
      )}
    </div>
  );
};

export default PersonaBuilder;
