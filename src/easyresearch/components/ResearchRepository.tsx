import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, Plus, Search, Tag, Star, Link2, Lightbulb, MessageSquare, TrendingUp, Trash2, Edit2, Check, X } from 'lucide-react';
import { bToast } from '../utils/bilingualToast';

// Research Repository – Insights Library for aggregating findings across projects
// 研究仓库 – 洞察库，用于跨项目汇总研究发现

interface Insight {
  id: string;
  title: string;
  description: string;
  insight_type: 'finding' | 'recommendation' | 'hypothesis' | 'pain_point' | 'opportunity' | 'quote';
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  source_project_id?: string;
  source_project_title?: string;
  evidence_count: number;
  status: 'draft' | 'validated' | 'actioned' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Props {
  projectId?: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  finding: <Lightbulb size={14} />,
  recommendation: <TrendingUp size={14} />,
  hypothesis: <MessageSquare size={14} />,
  pain_point: <Star size={14} />,
  opportunity: <Tag size={14} />,
  quote: <BookOpen size={14} />,
};

const TYPE_COLORS: Record<string, string> = {
  finding: 'bg-blue-50 text-blue-700 border-blue-200',
  recommendation: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  hypothesis: 'bg-purple-50 text-purple-700 border-purple-200',
  pain_point: 'bg-red-50 text-red-700 border-red-200',
  opportunity: 'bg-amber-50 text-amber-700 border-amber-200',
  quote: 'bg-stone-50 text-stone-700 border-stone-200',
};

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-stone-100 text-stone-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-stone-100 text-stone-600',
  validated: 'bg-emerald-100 text-emerald-700',
  actioned: 'bg-blue-100 text-blue-700',
  archived: 'bg-stone-100 text-stone-400',
};

const ResearchRepository: React.FC<Props> = ({ projectId }) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state for creating/editing insights
  const [form, setForm] = useState({
    title: '',
    description: '',
    insight_type: 'finding' as Insight['insight_type'],
    severity: 'medium' as Insight['severity'],
    tags: '' as string,
    status: 'draft' as Insight['status'],
  });

  // Load insights from local state (simulated - in production would use DB table)
  // 从本地状态加载洞察（模拟 - 生产环境会使用数据库表）
  useEffect(() => {
    const stored = localStorage.getItem(`research_insights_${projectId || 'global'}`);
    if (stored) {
      try { setInsights(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, [projectId]);

  const saveInsights = (updated: Insight[]) => {
    setInsights(updated);
    localStorage.setItem(`research_insights_${projectId || 'global'}`, JSON.stringify(updated));
  };

  const handleCreate = () => {
    const newInsight: Insight = {
      id: crypto.randomUUID(),
      title: form.title,
      description: form.description,
      insight_type: form.insight_type,
      severity: form.severity,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      source_project_id: projectId,
      source_project_title: '',
      evidence_count: 0,
      status: form.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveInsights([newInsight, ...insights]);
    setForm({ title: '', description: '', insight_type: 'finding', severity: 'medium', tags: '', status: 'draft' });
    setShowCreate(false);
    toast.success('Insight created / 洞察已创建');
  };

  const handleUpdate = (id: string) => {
    const updated = insights.map(i => i.id === id ? {
      ...i,
      title: form.title,
      description: form.description,
      insight_type: form.insight_type,
      severity: form.severity,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: form.status,
      updated_at: new Date().toISOString(),
    } : i);
    saveInsights(updated);
    setEditingId(null);
    toast.success('Insight updated / 洞察已更新');
  };

  const handleDelete = (id: string) => {
    saveInsights(insights.filter(i => i.id !== id));
    toast.success('Insight deleted / 洞察已删除');
  };

  const startEdit = (insight: Insight) => {
    setForm({
      title: insight.title,
      description: insight.description,
      insight_type: insight.insight_type,
      severity: insight.severity,
      tags: insight.tags.join(', '),
      status: insight.status,
    });
    setEditingId(insight.id);
  };

  const filteredInsights = insights.filter(i => {
    if (filterType !== 'all' && i.insight_type !== filterType) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Stats
  const stats = {
    total: insights.length,
    validated: insights.filter(i => i.status === 'validated').length,
    actioned: insights.filter(i => i.status === 'actioned').length,
    critical: insights.filter(i => i.severity === 'critical').length,
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <BookOpen size={22} className="text-emerald-600" />
            Research Repository / 研究仓库
          </h2>
          <p className="text-sm text-stone-500 mt-1">Organize findings, recommendations, and insights / 整理发现、建议和洞察</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); setForm({ title: '', description: '', insight_type: 'finding', severity: 'medium', tags: '', status: 'draft' }); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          <Plus size={15} /> Add Insight / 添加洞察
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total / 总计', value: stats.total, color: 'text-stone-700' },
          { label: 'Validated / 已验证', value: stats.validated, color: 'text-emerald-600' },
          { label: 'Actioned / 已行动', value: stats.actioned, color: 'text-blue-600' },
          { label: 'Critical / 关键', value: stats.critical, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-stone-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search insights / 搜索洞察..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 text-sm"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 text-sm">
          <option value="all">All Types / 所有类型</option>
          {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 text-sm">
          <option value="all">All Status / 所有状态</option>
          <option value="draft">Draft / 草稿</option>
          <option value="validated">Validated / 已验证</option>
          <option value="actioned">Actioned / 已行动</option>
          <option value="archived">Archived / 已归档</option>
        </select>
      </div>

      {/* Create/Edit Form */}
      {(showCreate || editingId) && (
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-stone-700">{editingId ? 'Edit Insight / 编辑洞察' : 'New Insight / 新洞察'}</h3>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title / 标题" className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description / 描述" rows={3} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select value={form.insight_type} onChange={e => setForm({ ...form, insight_type: e.target.value as any })} className="px-3 py-2 rounded-lg border border-stone-200 text-sm">
              <option value="finding">Finding / 发现</option>
              <option value="recommendation">Recommendation / 建议</option>
              <option value="hypothesis">Hypothesis / 假设</option>
              <option value="pain_point">Pain Point / 痛点</option>
              <option value="opportunity">Opportunity / 机会</option>
              <option value="quote">Quote / 引用</option>
            </select>
            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value as any })} className="px-3 py-2 rounded-lg border border-stone-200 text-sm">
              <option value="low">Low / 低</option>
              <option value="medium">Medium / 中</option>
              <option value="high">High / 高</option>
              <option value="critical">Critical / 关键</option>
            </select>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="px-3 py-2 rounded-lg border border-stone-200 text-sm">
              <option value="draft">Draft / 草稿</option>
              <option value="validated">Validated / 已验证</option>
              <option value="actioned">Actioned / 已行动</option>
              <option value="archived">Archived / 已归档</option>
            </select>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma-sep) / 标签" className="px-3 py-2 rounded-lg border border-stone-200 text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => editingId ? handleUpdate(editingId) : handleCreate()} disabled={!form.title} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
              <Check size={14} className="inline mr-1" />{editingId ? 'Update' : 'Create'}
            </button>
            <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50">
              <X size={14} className="inline mr-1" />Cancel
            </button>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-3">
        {filteredInsights.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No insights yet / 暂无洞察</p>
          </div>
        )}
        {filteredInsights.map(insight => (
          <div key={insight.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${TYPE_COLORS[insight.insight_type]}`}>
                    {TYPE_ICONS[insight.insight_type]} {insight.insight_type}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[insight.severity]}`}>
                    {insight.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[insight.status]}`}>
                    {insight.status}
                  </span>
                </div>
                <h4 className="font-semibold text-stone-800 text-sm">{insight.title}</h4>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{insight.description}</p>
                {insight.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {insight.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px]">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(insight)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(insight.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchRepository;
