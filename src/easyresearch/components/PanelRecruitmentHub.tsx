import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Globe, ExternalLink, Settings, AlertCircle, CheckCircle2, Copy, Link2, Mail, Zap, DollarSign, Filter, Microscope, Factory, Briefcase, Target, Building } from 'lucide-react';
import toast from 'react-hot-toast';

// Panel Recruitment Hub – Multi-platform participant recruitment management
// 面板招募中心 – 多平台参与者招募管理

interface Props {
  projectId: string;
  surveyCode?: string;
}

interface PanelConfig {
  id: string;
  platform: 'prolific' | 'mturk' | 'respondent' | 'userinterviews' | 'custom' | 'internal';
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  target_count: number;
  recruited_count: number;
  completion_rate: number;
  cost_per_response: number;
  total_budget: number;
  spent: number;
  redirect_url: string;
  completion_url: string;
  screening_url: string;
  config: Record<string, any>;
  created_at: string;
}

const PLATFORMS = [
  { id: 'prolific', name: 'Prolific', icon: 'microscope', color: 'bg-purple-50 border-purple-200 text-purple-700', description: 'Academic research panel with quality participants / 拥有高质量参与者的学术研究面板' },
  { id: 'mturk', name: 'Amazon MTurk', icon: 'factory', color: 'bg-amber-50 border-amber-200 text-amber-700', description: 'Large-scale crowdsourcing marketplace / 大规模众包市场' },
  { id: 'respondent', name: 'Respondent.io', icon: 'briefcase', color: 'bg-blue-50 border-blue-200 text-blue-700', description: 'B2B & professional participant recruitment / B2B与专业参与者招募' },
  { id: 'userinterviews', name: 'User Interviews', icon: 'target', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', description: 'UX research participant recruitment / UX研究参与者招募' },
  { id: 'internal', name: 'Internal Panel', icon: 'building', color: 'bg-stone-50 border-stone-200 text-stone-700', description: 'Your own participant database / 您自己的参与者数据库' },
  { id: 'custom', name: 'Custom Source', icon: 'link', color: 'bg-teal-50 border-teal-200 text-teal-700', description: 'Any custom recruitment source / 任何自定义招募来源' },
];

const PanelRecruitmentHub: React.FC<Props> = ({ projectId, surveyCode }) => {
  const [panels, setPanels] = useState<PanelConfig[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [editingPanel, setEditingPanel] = useState<string | null>(null);

  // Form
  const [form, setForm] = useState({
    target_count: 100,
    cost_per_response: 5,
    total_budget: 500,
    completion_url: '',
    screening_url: '',
  });

  // Load from localStorage (would be DB in production)
  useEffect(() => {
    const stored = localStorage.getItem(`panel_configs_${projectId}`);
    if (stored) try { setPanels(JSON.parse(stored)); } catch {}
  }, [projectId]);

  const savePanels = (updated: PanelConfig[]) => {
    setPanels(updated);
    localStorage.setItem(`panel_configs_${projectId}`, JSON.stringify(updated));
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const surveyUrl = `${baseUrl}/easyresearch/s/${surveyCode || projectId}`;

  const createPanel = () => {
    if (!selectedPlatform) return;
    const platform = PLATFORMS.find(p => p.id === selectedPlatform);
    const newPanel: PanelConfig = {
      id: crypto.randomUUID(),
      platform: selectedPlatform as any,
      name: platform?.name || 'Custom',
      status: 'draft',
      target_count: form.target_count,
      recruited_count: 0,
      completion_rate: 0,
      cost_per_response: form.cost_per_response,
      total_budget: form.total_budget,
      spent: 0,
      redirect_url: `${surveyUrl}?source=${selectedPlatform}&panel_id={{PANEL_ID}}`,
      completion_url: form.completion_url || `https://${selectedPlatform === 'prolific' ? 'app.prolific.com/submissions/complete' : selectedPlatform === 'mturk' ? 'www.mturk.com/mturk/externalSubmit' : 'example.com/complete'}?code={{COMPLETION_CODE}}`,
      screening_url: form.screening_url,
      config: {},
      created_at: new Date().toISOString(),
    };
    savePanels([...panels, newPanel]);
    setShowCreate(false);
    setSelectedPlatform('');
    toast.success(`${platform?.name} panel created / ${platform?.name}面板已创建`);
  };

  const updatePanelStatus = (id: string, status: PanelConfig['status']) => {
    savePanels(panels.map(p => p.id === id ? { ...p, status } : p));
  };

  const deletePanel = (id: string) => {
    savePanels(panels.filter(p => p.id !== id));
    toast.success('Panel deleted / 面板已删除');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied / 已复制');
  };

  // Stats
  const totalTarget = panels.reduce((a, p) => a + p.target_count, 0);
  const totalRecruited = panels.reduce((a, p) => a + p.recruited_count, 0);
  const totalBudget = panels.reduce((a, p) => a + p.total_budget, 0);
  const totalSpent = panels.reduce((a, p) => a + p.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Users size={22} className="text-emerald-600" />
            Panel Recruitment Hub / 面板招募中心
          </h2>
          <p className="text-sm text-stone-500 mt-1">Manage multi-platform participant recruitment / 管理多平台参与者招募</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
          <Zap size={14} /> Add Source / 添加来源
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-stone-700">{panels.length}</div>
          <div className="text-xs text-stone-500">Sources / 来源</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{totalRecruited}/{totalTarget}</div>
          <div className="text-xs text-stone-500">Recruited / 已招募</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</div>
          <div className="text-xs text-stone-500">Total Budget / 总预算</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">${totalSpent.toLocaleString()}</div>
          <div className="text-xs text-stone-500">Spent / 已花费</div>
        </div>
      </div>

      {/* Create Panel */}
      {showCreate && (
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-stone-700">Select Platform / 选择平台</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`text-left p-3 rounded-lg border-2 transition-all ${
                  selectedPlatform === p.id ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-lg mb-1">{p.icon}</div>
                <div className="text-sm font-medium text-stone-800">{p.name}</div>
                <div className="text-[10px] text-stone-500 mt-0.5">{p.description}</div>
              </button>
            ))}
          </div>

          {selectedPlatform && (
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-stone-600 mb-1 block">Target Count / 目标数</label>
                  <input type="number" value={form.target_count} onChange={e => setForm({ ...form, target_count: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-stone-600 mb-1 block">Cost/Response / 每次费用</label>
                  <input type="number" value={form.cost_per_response} onChange={e => setForm({ ...form, cost_per_response: parseFloat(e.target.value) || 0 })} step={0.5} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-stone-600 mb-1 block">Budget / 预算</label>
                  <input type="number" value={form.total_budget} onChange={e => setForm({ ...form, total_budget: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-stone-600 mb-1 block">Completion Redirect URL / 完成重定向URL</label>
                <input type="url" value={form.completion_url} onChange={e => setForm({ ...form, completion_url: e.target.value })} placeholder="https://app.prolific.com/submissions/complete?code={{CODE}}" className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={createPanel} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">Create / 创建</button>
                <button onClick={() => { setShowCreate(false); setSelectedPlatform(''); }} className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600">Cancel / 取消</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Panel Cards */}
      <div className="space-y-3">
        {panels.length === 0 && !showCreate && (
          <div className="text-center py-12 text-stone-400">
            <Globe size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No recruitment sources configured / 未配置招募来源</p>
          </div>
        )}
        {panels.map(panel => {
          const platform = PLATFORMS.find(p => p.id === panel.platform);
          const progress = panel.target_count > 0 ? Math.round(panel.recruited_count / panel.target_count * 100) : 0;
          return (
            <div key={panel.id} className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platform?.icon || '🔗'}</span>
                  <div>
                    <div className="text-sm font-semibold text-stone-800">{panel.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        panel.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        panel.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        panel.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                        'bg-stone-100 text-stone-600'
                      }`}>{panel.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {panel.status === 'draft' && (
                    <button onClick={() => updatePanelStatus(panel.id, 'active')} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600">Activate</button>
                  )}
                  {panel.status === 'active' && (
                    <button onClick={() => updatePanelStatus(panel.id, 'paused')} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600">Pause</button>
                  )}
                  {panel.status === 'paused' && (
                    <button onClick={() => updatePanelStatus(panel.id, 'active')} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600">Resume</button>
                  )}
                  <button onClick={() => deletePanel(panel.id)} className="px-2 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-400 hover:text-red-500 hover:border-red-200">×</button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-stone-500">{panel.recruited_count} / {panel.target_count} recruited</span>
                  <span className="text-xs font-medium text-stone-700">{progress}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* URLs */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-2">
                  <Link2 size={12} className="text-stone-400" />
                  <span className="text-xs text-stone-600 truncate flex-1">{panel.redirect_url}</span>
                  <button onClick={() => copyToClipboard(panel.redirect_url)} className="shrink-0"><Copy size={12} className="text-stone-400 hover:text-emerald-600" /></button>
                </div>
                <div className="flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-2">
                  <ExternalLink size={12} className="text-stone-400" />
                  <span className="text-xs text-stone-600 truncate flex-1">{panel.completion_url}</span>
                  <button onClick={() => copyToClipboard(panel.completion_url)} className="shrink-0"><Copy size={12} className="text-stone-400 hover:text-emerald-600" /></button>
                </div>
              </div>

              {/* Budget */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
                <span><DollarSign size={12} className="inline" /> ${panel.cost_per_response}/response</span>
                <span>Budget: ${panel.spent}/${panel.total_budget}</span>
                <span>Completion: {panel.completion_rate}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PanelRecruitmentHub;
