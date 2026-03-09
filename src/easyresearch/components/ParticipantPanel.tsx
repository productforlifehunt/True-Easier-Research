import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Filter, Tag, Download, Search, UserPlus, BarChart3, Mail, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Participant Panel & Segmentation Manager
// 参与者面板与分组管理器
interface Props {
  projectId: string;
}

interface Segment {
  id: string;
  name: string;
  color: string;
  filters: SegmentFilter[];
}

interface SegmentFilter {
  field: string; // 'status' | 'participant_type' | 'completion_rate' | 'response_quality' | 'signup_date' | custom question id
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: any;
}

interface ParticipantRow {
  id: string;
  email: string;
  participant_id?: string;
  status: string;
  created_at: string;
  participant_type?: string;
  responses_count: number;
  completion_rate: number;
  quality_flags: string[];
  last_active?: string;
  tags: string[];
}

const SEGMENT_COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const ParticipantPanel: React.FC<Props> = ({ projectId }) => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);
  const [newSegment, setNewSegment] = useState<Partial<Segment>>({ name: '', color: SEGMENT_COLORS[0], filters: [] });
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: enrollData }, { data: respData }] = await Promise.all([
        supabase.from('enrollment').select('*').eq('project_id', projectId),
        supabase.from('survey_response').select('id, enrollment_id, question_id, response_text, response_value, created_at').eq('project_id', projectId),
      ]);
      setEnrollments(enrollData || []);
      setResponses(respData || []);
    } catch (e) {
      console.error('Error loading panel data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Build participant rows with computed metrics / 构建带有计算指标的参与者行
  const participants: ParticipantRow[] = useMemo(() => {
    return enrollments.map(e => {
      const pResponses = responses.filter(r => r.enrollment_id === e.id);
      const qualityFlags: string[] = [];
      pResponses.forEach(r => {
        if (r.question_id === '__quality_flags__' && Array.isArray(r.response_value)) {
          qualityFlags.push(...r.response_value);
        }
      });
      const actualResponses = pResponses.filter(r => !r.question_id?.startsWith('__'));
      const lastResp = actualResponses.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      return {
        id: e.id,
        email: e.participant_email || e.participant_id || 'Anonymous',
        participant_id: e.participant_id,
        status: e.status || 'enrolled',
        created_at: e.created_at,
        participant_type: e.participant_type,
        responses_count: actualResponses.length,
        completion_rate: 0, // Would need total questions to compute
        quality_flags: [...new Set(qualityFlags)],
        last_active: lastResp?.created_at,
        tags: e.tags || [],
      };
    });
  }, [enrollments, responses]);

  // Apply segment filters / 应用分组过滤器
  const filteredParticipants = useMemo(() => {
    let list = participants;

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p => 
        p.email.toLowerCase().includes(term) || 
        p.participant_id?.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term)
      );
    }

    // Active segment
    if (activeSegment) {
      const seg = segments.find(s => s.id === activeSegment);
      if (seg) {
        list = list.filter(p => {
          return seg.filters.every(f => {
            const val = (p as any)[f.field];
            switch (f.operator) {
              case 'equals': return val === f.value;
              case 'not_equals': return val !== f.value;
              case 'contains': return String(val).toLowerCase().includes(String(f.value).toLowerCase());
              case 'gt': return Number(val) > Number(f.value);
              case 'lt': return Number(val) < Number(f.value);
              case 'in': return Array.isArray(f.value) && f.value.includes(val);
              default: return true;
            }
          });
        });
      }
    }

    // Sort
    list = [...list].sort((a, b) => {
      const aVal = (a as any)[sortField] || '';
      const bVal = (b as any)[sortField] || '';
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [participants, searchTerm, activeSegment, segments, sortField, sortDir]);

  // Stats / 统计
  const stats = useMemo(() => ({
    total: participants.length,
    active: participants.filter(p => p.status === 'enrolled' || p.status === 'active').length,
    completed: participants.filter(p => p.status === 'completed').length,
    flagged: participants.filter(p => p.quality_flags.length > 0).length,
    avgResponses: participants.length > 0 ? Math.round(participants.reduce((s, p) => s + p.responses_count, 0) / participants.length) : 0,
  }), [participants]);

  const addSegment = () => {
    if (!newSegment.name) return;
    const seg: Segment = {
      id: crypto.randomUUID(),
      name: newSegment.name!,
      color: newSegment.color || SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length],
      filters: newSegment.filters || [],
    };
    setSegments(prev => [...prev, seg]);
    setNewSegment({ name: '', color: SEGMENT_COLORS[(segments.length + 1) % SEGMENT_COLORS.length], filters: [] });
    setShowSegmentBuilder(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedParticipants(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedParticipants.size === filteredParticipants.length) {
      setSelectedParticipants(new Set());
    } else {
      setSelectedParticipants(new Set(filteredParticipants.map(p => p.id)));
    }
  };

  const executeBulkAction = async () => {
    if (!bulkAction || selectedParticipants.size === 0) return;
    const ids = Array.from(selectedParticipants);
    
    if (bulkAction === 'remove') {
      await supabase.from('enrollment').update({ status: 'removed' }).in('id', ids);
    } else if (bulkAction === 'flag') {
      // Mark as flagged in local state
    } else if (bulkAction === 'export') {
      exportSelected(ids);
    }
    
    await loadData();
    setSelectedParticipants(new Set());
    setBulkAction('');
  };

  const exportSelected = (ids: string[]) => {
    const selected = participants.filter(p => ids.includes(p.id));
    const csv = [
      ['ID', 'Email', 'Status', 'Type', 'Responses', 'Quality Flags', 'Enrolled', 'Last Active'].join(','),
      ...selected.map(p => [
        p.id, p.email, p.status, p.participant_type || '', p.responses_count,
        p.quality_flags.join(';'), p.created_at, p.last_active || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${projectId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAll = () => exportSelected(filteredParticipants.map(p => p.id));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'removed': case 'dropped': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading panel... / 加载面板中...</div>;

  return (
    <div className="space-y-4">
      {/* Stats bar / 统计栏 */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total / 总计', value: stats.total, icon: Users, color: 'text-blue-600' },
          { label: 'Active / 活跃', value: stats.active, icon: UserPlus, color: 'text-green-600' },
          { label: 'Completed / 已完成', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Flagged / 标记', value: stats.flagged, icon: AlertTriangle, color: 'text-amber-600' },
          { label: 'Avg Responses / 平均回复', value: stats.avgResponses, icon: BarChart3, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-3 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Segments / 分组 */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveSegment(null)}
          className={`px-3 py-1.5 text-xs rounded-full border transition ${!activeSegment ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border-border hover:bg-accent'}`}
        >
          All / 全部 ({participants.length})
        </button>
        {segments.map(seg => {
          const count = participants.filter(p => seg.filters.every(f => {
            const val = (p as any)[f.field];
            return f.operator === 'equals' ? val === f.value : true;
          })).length;
          return (
            <button
              key={seg.id}
              onClick={() => setActiveSegment(activeSegment === seg.id ? null : seg.id)}
              className={`px-3 py-1.5 text-xs rounded-full border transition flex items-center gap-1 ${activeSegment === seg.id ? 'ring-2 ring-primary' : ''}`}
              style={{ borderColor: seg.color, color: activeSegment === seg.id ? seg.color : undefined }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
              {seg.name} ({count})
            </button>
          );
        })}
        <button
          onClick={() => setShowSegmentBuilder(!showSegmentBuilder)}
          className="px-3 py-1.5 text-xs rounded-full border border-dashed border-border text-muted-foreground hover:bg-accent"
        >
          + Segment / + 分组
        </button>
      </div>

      {/* Segment builder / 分组构建器 */}
      {showSegmentBuilder && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium text-foreground">Create Segment / 创建分组</div>
          <div className="flex gap-2">
            <input
              value={newSegment.name || ''}
              onChange={e => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Segment name / 分组名称"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
            />
            <div className="flex gap-1">
              {SEGMENT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewSegment(prev => ({ ...prev, color: c }))}
                  className={`w-6 h-6 rounded-full border-2 ${newSegment.color === c ? 'border-foreground' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {(newSegment.filters || []).map((f, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <select
                  value={f.field}
                  onChange={e => {
                    const filters = [...(newSegment.filters || [])];
                    filters[i] = { ...f, field: e.target.value };
                    setNewSegment(prev => ({ ...prev, filters }));
                  }}
                  className="px-2 py-1 border border-border rounded bg-background text-foreground"
                >
                  <option value="status">Status / 状态</option>
                  <option value="participant_type">Type / 类型</option>
                  <option value="responses_count">Responses / 回复数</option>
                  <option value="quality_flags">Quality / 质量</option>
                </select>
                <select
                  value={f.operator}
                  onChange={e => {
                    const filters = [...(newSegment.filters || [])];
                    filters[i] = { ...f, operator: e.target.value as any };
                    setNewSegment(prev => ({ ...prev, filters }));
                  }}
                  className="px-2 py-1 border border-border rounded bg-background text-foreground"
                >
                  <option value="equals">= Equals / 等于</option>
                  <option value="not_equals">≠ Not / 不等于</option>
                  <option value="gt">&gt; Greater / 大于</option>
                  <option value="lt">&lt; Less / 小于</option>
                  <option value="contains">Contains / 包含</option>
                </select>
                <input
                  value={f.value || ''}
                  onChange={e => {
                    const filters = [...(newSegment.filters || [])];
                    filters[i] = { ...f, value: e.target.value };
                    setNewSegment(prev => ({ ...prev, filters }));
                  }}
                  placeholder="Value / 值"
                  className="flex-1 px-2 py-1 border border-border rounded bg-background text-foreground"
                />
                <button
                  onClick={() => {
                    const filters = (newSegment.filters || []).filter((_, j) => j !== i);
                    setNewSegment(prev => ({ ...prev, filters }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >×</button>
              </div>
            ))}
            <button
              onClick={() => setNewSegment(prev => ({ ...prev, filters: [...(prev.filters || []), { field: 'status', operator: 'equals', value: '' }] }))}
              className="text-xs text-primary hover:underline"
            >+ Add filter / + 添加过滤</button>
          </div>
          <div className="flex gap-2">
            <button onClick={addSegment} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90">
              Create / 创建
            </button>
            <button onClick={() => setShowSegmentBuilder(false)} className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg">
              Cancel / 取消
            </button>
          </div>
        </div>
      )}

      {/* Toolbar / 工具栏 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search participants... / 搜索参与者..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
          />
        </div>
        {selectedParticipants.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{selectedParticipants.size} selected / 已选</span>
            <select
              value={bulkAction}
              onChange={e => setBulkAction(e.target.value)}
              className="px-2 py-1.5 text-xs border border-border rounded bg-background text-foreground"
            >
              <option value="">Bulk action / 批量操作</option>
              <option value="export">Export / 导出</option>
              <option value="remove">Remove / 移除</option>
              <option value="flag">Flag / 标记</option>
            </select>
            <button onClick={executeBulkAction} className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded">Go</button>
          </div>
        )}
        <button onClick={exportAll} className="flex items-center gap-1 px-3 py-2 text-xs border border-border rounded-lg hover:bg-accent text-foreground">
          <Download className="w-3.5 h-3.5" /> Export / 导出
        </button>
      </div>

      {/* Table / 表格 */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left w-8">
                <input type="checkbox" onChange={selectAll} checked={selectedParticipants.size === filteredParticipants.length && filteredParticipants.length > 0} className="rounded" />
              </th>
              {[
                { key: 'email', label: 'Participant / 参与者' },
                { key: 'status', label: 'Status / 状态' },
                { key: 'participant_type', label: 'Type / 类型' },
                { key: 'responses_count', label: 'Responses / 回复' },
                { key: 'quality_flags', label: 'Quality / 质量' },
                { key: 'created_at', label: 'Enrolled / 入组' },
                { key: 'last_active', label: 'Last Active / 最近活跃' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => { setSortField(col.key); setSortDir(prev => prev === 'asc' ? 'desc' : 'asc'); }}
                  className="p-3 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                >
                  {col.label} {sortField === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-3">
                  <input type="checkbox" checked={selectedParticipants.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" />
                </td>
                <td className="p-3 font-medium text-foreground">{p.email}</td>
                <td className="p-3">
                  <span className="flex items-center gap-1">
                    {getStatusIcon(p.status)}
                    <span className="capitalize text-xs">{p.status}</span>
                  </span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{p.participant_type || '—'}</td>
                <td className="p-3 text-center font-mono">{p.responses_count}</td>
                <td className="p-3">
                  {p.quality_flags.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {p.quality_flags.map(f => (
                        <span key={f} className="px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{f}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-green-600 text-xs">✓ Clean</span>
                  )}
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {p.last_active ? new Date(p.last_active).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {filteredParticipants.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No participants found / 未找到参与者
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParticipantPanel;
