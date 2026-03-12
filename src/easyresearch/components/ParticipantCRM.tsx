import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Mail, Tag, Search, Filter, Download, Clock, Star, MessageSquare, ChevronDown, Phone, Globe, BarChart3, Plus, X, Edit2, Save } from 'lucide-react';
import { bToast } from '../utils/bilingualToast';

// Participant CRM – Full participant relationship management system
// 参与者CRM – 完整参与者关系管理系统

interface Props {
  projectId: string;
}

interface ParticipantProfile {
  id: string;
  enrollment_id: string;
  email: string;
  participant_id?: string;
  status: string;
  enrolled_at: string;
  completed_at?: string;
  responses_count: number;
  completion_rate: number;
  avg_response_time: number;
  last_active: string;
  tags: string[];
  notes: string;
  satisfaction_score?: number;
  engagement_score: number;
}

const ENGAGEMENT_LEVELS = [
  { min: 80, label: 'High / 高', color: 'bg-emerald-100 text-emerald-700' },
  { min: 50, label: 'Medium / 中', color: 'bg-amber-100 text-amber-700' },
  { min: 0, label: 'Low / 低', color: 'bg-red-100 text-red-700' },
];

const ParticipantCRM: React.FC<Props> = ({ projectId }) => {
  const [profiles, setProfiles] = useState<ParticipantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEngagement, setFilterEngagement] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadProfiles();
  }, [projectId]);

  const loadProfiles = async () => {
    try {
      const [{ data: enrollments }, { data: responses }] = await Promise.all([
        supabase.from('enrollment').select('*').eq('project_id', projectId),
        supabase.from('survey_response').select('id, enrollment_id, created_at, response_value').eq('project_id', projectId),
      ]);

      const { data: questions } = await supabase.from('question').select('id').eq('project_id', projectId);
      const totalQuestions = (questions || []).length || 1;

      // Load saved tags/notes from localStorage / 从localStorage加载保存的标签/备注
      const savedMeta: Record<string, { tags: string[]; notes: string }> = JSON.parse(localStorage.getItem(`crm_meta_${projectId}`) || '{}');

      // Build profiles from enrollments + responses / 从注册和响应构建档案
      const byEnrollment = new Map<string, any[]>();
      (responses || []).forEach(r => {
        const key = r.enrollment_id || 'anon';
        if (!byEnrollment.has(key)) byEnrollment.set(key, []);
        byEnrollment.get(key)!.push(r);
      });

      const builtProfiles: ParticipantProfile[] = (enrollments || []).map(e => {
        const resps = byEnrollment.get(e.id) || [];
        const answeredIds = new Set(resps.map(r => r.id));
        const times = resps.map(r => new Date(r.created_at).getTime()).sort();
        const duration = times.length >= 2 ? (times[times.length - 1] - times[0]) / 1000 : 0;
        const numericVals = resps.filter(r => r.response_value != null && !isNaN(Number(r.response_value))).map(r => Number(r.response_value));
        const satScore = numericVals.length > 0 ? numericVals.reduce((a, b) => a + b, 0) / numericVals.length : undefined;
        const completionRate = Math.min(100, Math.round(answeredIds.size / totalQuestions * 100));
        const meta = savedMeta[e.id] || { tags: [], notes: '' };

        return {
          id: e.id,
          enrollment_id: e.id,
          email: e.participant_email || 'Anonymous',
          participant_id: e.participant_id,
          status: e.status || 'active',
          enrolled_at: e.created_at,
          responses_count: resps.length,
          completion_rate: completionRate,
          avg_response_time: resps.length > 0 ? Math.round(duration / resps.length) : 0,
          last_active: resps.length > 0 ? resps[resps.length - 1].created_at : e.created_at,
          tags: meta.tags,
          notes: meta.notes,
          satisfaction_score: satScore,
          engagement_score: Math.min(100, completionRate + (resps.length > 5 ? 20 : 0) + (duration > 60 ? 10 : 0)),
        };
      });

      setProfiles(builtProfiles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveMeta = (enrollmentId: string, tags: string[], notes: string) => {
    const stored = JSON.parse(localStorage.getItem(`crm_meta_${projectId}`) || '{}');
    stored[enrollmentId] = { tags, notes };
    localStorage.setItem(`crm_meta_${projectId}`, JSON.stringify(stored));
    setProfiles(prev => prev.map(p => p.enrollment_id === enrollmentId ? { ...p, tags, notes } : p));
  };

  const addTag = (enrollmentId: string) => {
    if (!tagInput.trim()) return;
    const profile = profiles.find(p => p.enrollment_id === enrollmentId);
    if (!profile) return;
    const newTags = [...new Set([...profile.tags, tagInput.trim()])];
    saveMeta(enrollmentId, newTags, profile.notes);
    setTagInput('');
    toast.success('Tag added / 标签已添加');
  };

  const removeTag = (enrollmentId: string, tag: string) => {
    const profile = profiles.find(p => p.enrollment_id === enrollmentId);
    if (!profile) return;
    saveMeta(enrollmentId, profile.tags.filter(t => t !== tag), profile.notes);
  };

  const saveNotes = (enrollmentId: string) => {
    const profile = profiles.find(p => p.enrollment_id === enrollmentId);
    if (!profile) return;
    saveMeta(enrollmentId, profile.tags, notesText);
    setEditingNotes(null);
    toast.success('Notes saved / 备注已保存');
  };

  const getEngagementLevel = (score: number) => ENGAGEMENT_LEVELS.find(l => score >= l.min) || ENGAGEMENT_LEVELS[2];

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (search && !p.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterEngagement === 'high' && p.engagement_score < 80) return false;
      if (filterEngagement === 'medium' && (p.engagement_score < 50 || p.engagement_score >= 80)) return false;
      if (filterEngagement === 'low' && p.engagement_score >= 50) return false;
      return true;
    });
  }, [profiles, search, filterStatus, filterEngagement]);

  // Stats
  const avgEngagement = profiles.length > 0 ? Math.round(profiles.reduce((a, p) => a + p.engagement_score, 0) / profiles.length) : 0;
  const avgCompletion = profiles.length > 0 ? Math.round(profiles.reduce((a, p) => a + p.completion_rate, 0) / profiles.length) : 0;

  const exportCSV = () => {
    const csv = [
      ['Email', 'Status', 'Responses', 'Completion%', 'Engagement', 'Tags', 'Notes', 'Enrolled'].join(','),
      ...filteredProfiles.map(p => [p.email, p.status, p.responses_count, p.completion_rate, p.engagement_score, `"${p.tags.join(';')}"`, `"${p.notes.replace(/"/g, '""')}"`, p.enrolled_at].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `participants_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const detail = selectedProfile ? profiles.find(p => p.id === selectedProfile) : null;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Users size={22} className="text-emerald-600" />
            Participant CRM / 参与者关系管理
          </h2>
          <p className="text-sm text-stone-500 mt-1">Manage participant relationships, tags, and engagement / 管理参与者关系、标签和互动</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50">
          <Download size={14} /> Export / 导出
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-stone-700">{profiles.length}</div>
          <div className="text-xs text-stone-500">Total / 总计</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{avgEngagement}%</div>
          <div className="text-xs text-stone-500">Avg Engagement / 平均互动</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{avgCompletion}%</div>
          <div className="text-xs text-stone-500">Avg Completion / 平均完成率</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{profiles.filter(p => p.tags.length > 0).length}</div>
          <div className="text-xs text-stone-500">Tagged / 已标签</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email / 按邮箱搜索..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 text-sm">
          <option value="all">All Status / 所有状态</option>
          <option value="active">Active / 活跃</option>
          <option value="completed">Completed / 已完成</option>
          <option value="dropped">Dropped / 已退出</option>
        </select>
        <select value={filterEngagement} onChange={e => setFilterEngagement(e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 text-sm">
          <option value="all">All Engagement / 所有互动</option>
          <option value="high">High / 高</option>
          <option value="medium">Medium / 中</option>
          <option value="low">Low / 低</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile List */}
        <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredProfiles.length === 0 && <div className="text-center py-12 text-stone-400"><Users size={24} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No participants / 暂无参与者</p></div>}
          {filteredProfiles.map(p => {
            const engagement = getEngagementLevel(p.engagement_score);
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProfile(selectedProfile === p.id ? null : p.id)}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-all ${selectedProfile === p.id ? 'border-emerald-500 shadow-md' : 'border-stone-200 hover:border-stone-300'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-sm font-medium">
                      {p.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-800">{p.email}</div>
                      <div className="text-[10px] text-stone-400">Enrolled {new Date(p.enrolled_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${engagement.color}`}>{engagement.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span>{p.responses_count} responses</span>
                  <span>{p.completion_rate}%</span>
                  <span>{p.engagement_score}%</span>
                </div>
                {p.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">{p.tags.map(t => <span key={t} className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px]">{t}</span>)}</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div>
          {detail ? (
            <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 sticky top-20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg font-bold">
                  {detail.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">{detail.email}</h3>
                  <p className="text-xs text-stone-500">{detail.status} • {detail.participant_id || 'No ID'}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Responses / 响应', value: detail.responses_count },
                  { label: 'Completion / 完成', value: `${detail.completion_rate}%` },
                  { label: 'Engagement / 互动', value: `${detail.engagement_score}%` },
                  { label: 'Avg Time / 平均时间', value: `${detail.avg_response_time}s` },
                ].map(m => (
                  <div key={m.label} className="bg-stone-50 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-stone-700">{m.value}</div>
                    <div className="text-[10px] text-stone-500">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1.5 block flex items-center gap-1"><Tag size={12} /> Tags / 标签</label>
                <div className="flex gap-1 flex-wrap mb-2">
                  {detail.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] flex items-center gap-1">
                      {t} <button onClick={() => removeTag(detail.enrollment_id, t)}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag(detail.enrollment_id)} placeholder="Add tag / 添加标签" className="flex-1 px-2 py-1 border rounded text-xs" />
                  <button onClick={() => addTag(detail.enrollment_id)} className="px-2 py-1 bg-emerald-500 text-white rounded text-xs"><Plus size={12} /></button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-600 flex items-center gap-1"><MessageSquare size={12} /> Notes / 备注</label>
                  {editingNotes !== detail.id && (
                    <button onClick={() => { setEditingNotes(detail.id); setNotesText(detail.notes); }} className="text-xs text-emerald-600"><Edit2 size={12} /></button>
                  )}
                </div>
                {editingNotes === detail.id ? (
                  <div className="space-y-1">
                    <textarea value={notesText} onChange={e => setNotesText(e.target.value)} rows={3} className="w-full px-2 py-1.5 border rounded text-xs" />
                    <div className="flex gap-1">
                      <button onClick={() => saveNotes(detail.enrollment_id)} className="px-2 py-1 bg-emerald-500 text-white rounded text-xs"><Save size={10} className="inline mr-1" />Save</button>
                      <button onClick={() => setEditingNotes(null)} className="px-2 py-1 border rounded text-xs text-stone-500">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-600">{detail.notes || 'No notes / 暂无备注'}</p>
                )}
              </div>

              {/* Timeline */}
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1.5 block flex items-center gap-1"><Clock size={12} /> Timeline / 时间线</label>
                <div className="space-y-1 text-xs text-stone-500">
                  <div>Enrolled: {new Date(detail.enrolled_at).toLocaleDateString()}</div>
                  <div>Last active: {new Date(detail.last_active).toLocaleDateString()}</div>
                  {detail.satisfaction_score && <div>Satisfaction: {detail.satisfaction_score.toFixed(1)}</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-400">
              <Users size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Select a participant / 选择一个参与者</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantCRM;
