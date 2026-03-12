import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Layers, Plus, Trash2, Filter, Users, BarChart3, Save, Play, X, ChevronDown } from 'lucide-react';
import { bToast } from '../utils/bilingualToast';

// Advanced Segmentation Engine – Build complex participant segments for analysis
// 高级分群引擎 – 构建复杂的参与者分群用于分析

interface Props {
  projectId: string;
  questionnaires: any[];
}

type Operator = 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'between' | 'is_empty' | 'is_not_empty';

interface SegmentCondition {
  id: string;
  field_type: 'question' | 'enrollment' | 'behavior' | 'metadata';
  field_id: string;
  field_label: string;
  operator: Operator;
  value: string;
  value2?: string; // For 'between' operator
}

interface Segment {
  id: string;
  name: string;
  description: string;
  conditions: SegmentCondition[];
  logic: 'AND' | 'OR';
  color: string;
  matched_count: number;
  created_at: string;
}

const OPERATORS: { value: Operator; label: string }[] = [
  { value: 'equals', label: '= equals / 等于' },
  { value: 'not_equals', label: '≠ not equals / 不等于' },
  { value: 'contains', label: '∋ contains / 包含' },
  { value: 'gt', label: '> greater than / 大于' },
  { value: 'lt', label: '< less than / 小于' },
  { value: 'gte', label: '≥ greater or equal / 大于等于' },
  { value: 'lte', label: '≤ less or equal / 小于等于' },
  { value: 'in', label: '∈ in list / 在列表中' },
  { value: 'is_empty', label: '∅ is empty / 为空' },
  { value: 'is_not_empty', label: '≠∅ is not empty / 不为空' },
  { value: 'between', label: 'between / 介于' },
];

const SEGMENT_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6'];

const BEHAVIOR_FIELDS = [
  { id: 'completion_rate', label: 'Completion Rate / 完成率' },
  { id: 'total_time', label: 'Total Time (seconds) / 总时间(秒)' },
  { id: 'responses_count', label: 'Responses Count / 响应数' },
  { id: 'first_response_date', label: 'First Response Date / 首次响应日期' },
  { id: 'last_response_date', label: 'Last Response Date / 最后响应日期' },
];

const AdvancedSegmentation: React.FC<Props> = ({ projectId, questionnaires }) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get all questions across questionnaires / 获取所有问卷中的问题
  const allQuestions = useMemo(() => {
    return questionnaires.flatMap(q => (q.questions || []).map((qq: any) => ({
      id: qq.id,
      label: qq.question_text?.substring(0, 40) || qq.id,
      type: qq.question_type,
    })));
  }, [questionnaires]);

  useEffect(() => {
    loadData();
    const stored = localStorage.getItem(`segments_${projectId}`);
    if (stored) try { setSegments(JSON.parse(stored)); } catch {}
  }, [projectId]);

  const loadData = async () => {
    try {
      const [{ data: respData }, { data: enrollData }] = await Promise.all([
        supabase.from('survey_response').select('*').eq('project_id', projectId),
        supabase.from('enrollment').select('*').eq('project_id', projectId),
      ]);
      setResponses(respData || []);
      setEnrollments(enrollData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveSegments = (updated: Segment[]) => {
    setSegments(updated);
    localStorage.setItem(`segments_${projectId}`, JSON.stringify(updated));
  };

  const createSegment = () => {
    const newSegment: Segment = {
      id: crypto.randomUUID(),
      name: `Segment ${segments.length + 1}`,
      description: '',
      conditions: [],
      logic: 'AND',
      color: SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length],
      matched_count: 0,
      created_at: new Date().toISOString(),
    };
    setEditingSegment(newSegment);
  };

  const addCondition = () => {
    if (!editingSegment) return;
    const newCondition: SegmentCondition = {
      id: crypto.randomUUID(),
      field_type: 'question',
      field_id: allQuestions[0]?.id || '',
      field_label: allQuestions[0]?.label || '',
      operator: 'equals',
      value: '',
    };
    setEditingSegment({
      ...editingSegment,
      conditions: [...editingSegment.conditions, newCondition],
    });
  };

  const updateCondition = (condId: string, updates: Partial<SegmentCondition>) => {
    if (!editingSegment) return;
    setEditingSegment({
      ...editingSegment,
      conditions: editingSegment.conditions.map(c => c.id === condId ? { ...c, ...updates } : c),
    });
  };

  const removeCondition = (condId: string) => {
    if (!editingSegment) return;
    setEditingSegment({
      ...editingSegment,
      conditions: editingSegment.conditions.filter(c => c.id !== condId),
    });
  };

  // Evaluate segment against data / 评估分群匹配数据
  const evaluateSegment = (segment: Segment): number => {
    if (segment.conditions.length === 0) return enrollments.length;

    const byEnrollment = new Map<string, any[]>();
    responses.forEach(r => {
      const key = r.enrollment_id || 'anon';
      if (!byEnrollment.has(key)) byEnrollment.set(key, []);
      byEnrollment.get(key)!.push(r);
    });

    let matchCount = 0;
    byEnrollment.forEach((resps, enrollId) => {
      const matches = segment.conditions.map(cond => {
        if (cond.field_type === 'question') {
          const resp = resps.find(r => r.question_id === cond.field_id);
          const val = resp?.response_text || String(resp?.response_value || '');
          return evaluateCondition(val, cond.operator, cond.value, cond.value2);
        }
        if (cond.field_type === 'behavior') {
          if (cond.field_id === 'responses_count') {
            return evaluateCondition(String(resps.length), cond.operator, cond.value, cond.value2);
          }
          if (cond.field_id === 'completion_rate') {
            const totalQ = allQuestions.length || 1;
            const answered = new Set(resps.map(r => r.question_id)).size;
            return evaluateCondition(String(Math.round(answered / totalQ * 100)), cond.operator, cond.value, cond.value2);
          }
        }
        return true;
      });

      const isMatch = segment.logic === 'AND' ? matches.every(Boolean) : matches.some(Boolean);
      if (isMatch) matchCount++;
    });

    return matchCount;
  };

  const evaluateCondition = (actual: string, op: Operator, expected: string, expected2?: string): boolean => {
    const numActual = parseFloat(actual);
    const numExpected = parseFloat(expected);
    switch (op) {
      case 'equals': return actual === expected;
      case 'not_equals': return actual !== expected;
      case 'contains': return actual.toLowerCase().includes(expected.toLowerCase());
      case 'gt': return numActual > numExpected;
      case 'lt': return numActual < numExpected;
      case 'gte': return numActual >= numExpected;
      case 'lte': return numActual <= numExpected;
      case 'in': return expected.split(',').map(s => s.trim()).includes(actual);
      case 'is_empty': return !actual || actual.trim() === '';
      case 'is_not_empty': return !!actual && actual.trim() !== '';
      case 'between': return numActual >= numExpected && numActual <= parseFloat(expected2 || '0');
      default: return true;
    }
  };

  const saveSegment = () => {
    if (!editingSegment) return;
    const matched = evaluateSegment(editingSegment);
    const updated = { ...editingSegment, matched_count: matched };
    const existing = segments.find(s => s.id === updated.id);
    if (existing) {
      saveSegments(segments.map(s => s.id === updated.id ? updated : s));
    } else {
      saveSegments([...segments, updated]);
    }
    setEditingSegment(null);
    bToast.success(`Segment saved: ${matched} matches`, `分群已保存：${matched}个匹配`);
  };

  const deleteSegment = (id: string) => {
    saveSegments(segments.filter(s => s.id !== id));
    bToast.success('Segment deleted', '分群已删除');
  };

  const runAllSegments = () => {
    const updated = segments.map(s => ({ ...s, matched_count: evaluateSegment(s) }));
    saveSegments(updated);
    bToast.success('All segments evaluated', '所有分群已评估');
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Layers size={22} className="text-emerald-600" />
            Advanced Segmentation / 高级分群
          </h2>
          <p className="text-sm text-stone-500 mt-1">Build complex participant segments for targeted analysis / 构建复杂的参与者分群进行定向分析</p>
        </div>
        <div className="flex gap-2">
          {segments.length > 0 && (
            <button onClick={runAllSegments} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50">
              <Play size={14} /> Run All / 全部运行
            </button>
          )}
          <button onClick={createSegment} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
            <Plus size={14} /> New Segment / 新建分群
          </button>
        </div>
      </div>

      {/* Segment Editor / 分群编辑器 */}
      {editingSegment && (
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <input
              value={editingSegment.name}
              onChange={e => setEditingSegment({ ...editingSegment, name: e.target.value })}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none text-stone-800 placeholder:text-stone-300"
              placeholder="Segment Name / 分群名称"
            />
            <button onClick={() => setEditingSegment(null)} className="p-1 text-stone-400 hover:text-stone-600"><X size={18} /></button>
          </div>

          <input
            value={editingSegment.description}
            onChange={e => setEditingSegment({ ...editingSegment, description: e.target.value })}
            placeholder="Description (optional) / 描述（可选）"
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
          />

          {/* Logic Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Match:</span>
            {(['AND', 'OR'] as const).map(logic => (
              <button
                key={logic}
                onClick={() => setEditingSegment({ ...editingSegment, logic })}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  editingSegment.logic === logic ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {logic === 'AND' ? 'ALL conditions / 所有条件' : 'ANY condition / 任一条件'}
              </button>
            ))}
          </div>

          {/* Conditions / 条件 */}
          <div className="space-y-2">
            {editingSegment.conditions.map((cond, i) => (
              <div key={cond.id} className="flex items-center gap-2 bg-stone-50 rounded-lg p-3">
                {i > 0 && <span className="text-xs font-medium text-emerald-600">{editingSegment.logic}</span>}
                <select
                  value={cond.field_type}
                  onChange={e => updateCondition(cond.id, { field_type: e.target.value as any })}
                  className="px-2 py-1.5 rounded border border-stone-200 text-xs"
                >
                  <option value="question">Question / 问题</option>
                  <option value="behavior">Behavior / 行为</option>
                </select>
                {cond.field_type === 'question' ? (
                  <select
                    value={cond.field_id}
                    onChange={e => {
                      const q = allQuestions.find(qq => qq.id === e.target.value);
                      updateCondition(cond.id, { field_id: e.target.value, field_label: q?.label || '' });
                    }}
                    className="px-2 py-1.5 rounded border border-stone-200 text-xs flex-1 min-w-0"
                  >
                    {allQuestions.map(q => <option key={q.id} value={q.id}>{q.label}</option>)}
                  </select>
                ) : (
                  <select
                    value={cond.field_id}
                    onChange={e => updateCondition(cond.id, { field_id: e.target.value, field_label: BEHAVIOR_FIELDS.find(f => f.id === e.target.value)?.label || '' })}
                    className="px-2 py-1.5 rounded border border-stone-200 text-xs flex-1 min-w-0"
                  >
                    {BEHAVIOR_FIELDS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                )}
                <select
                  value={cond.operator}
                  onChange={e => updateCondition(cond.id, { operator: e.target.value as Operator })}
                  className="px-2 py-1.5 rounded border border-stone-200 text-xs"
                >
                  {OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                </select>
                {!['is_empty', 'is_not_empty'].includes(cond.operator) && (
                  <input
                    value={cond.value}
                    onChange={e => updateCondition(cond.id, { value: e.target.value })}
                    placeholder="Value / 值"
                    className="px-2 py-1.5 rounded border border-stone-200 text-xs w-24"
                  />
                )}
                {cond.operator === 'between' && (
                  <input
                    value={cond.value2 || ''}
                    onChange={e => updateCondition(cond.id, { value2: e.target.value })}
                    placeholder="Max / 最大"
                    className="px-2 py-1.5 rounded border border-stone-200 text-xs w-20"
                  />
                )}
                <button onClick={() => removeCondition(cond.id)} className="p-1 text-stone-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={addCondition} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-stone-300 text-xs text-stone-500 hover:border-emerald-400 hover:text-emerald-600">
              <Plus size={12} /> Add Condition / 添加条件
            </button>
            <div className="flex-1" />
            <button onClick={saveSegment} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
              <Save size={14} /> Save & Run / 保存运行
            </button>
          </div>
        </div>
      )}

      {/* Segments List / 分群列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {segments.map(segment => (
          <div key={segment.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                <h4 className="text-sm font-semibold text-stone-800">{segment.name}</h4>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditingSegment(segment)} className="p-1 rounded text-stone-400 hover:text-stone-600"><Filter size={13} /></button>
                <button onClick={() => deleteSegment(segment.id)} className="p-1 rounded text-stone-400 hover:text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
            {segment.description && <p className="text-xs text-stone-500 mb-2">{segment.description}</p>}
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-emerald-600" />
              <span className="text-lg font-bold text-stone-800">{segment.matched_count}</span>
              <span className="text-xs text-stone-500">matched / 匹配</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px]">{segment.conditions.length} conditions</span>
              <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px]">{segment.logic}</span>
            </div>
          </div>
        ))}
      </div>

      {segments.length === 0 && !editingSegment && (
        <div className="text-center py-12 text-stone-400">
          <Layers size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No segments created / 暂无分群</p>
          <p className="text-xs mt-1">Create segments to analyze specific participant groups / 创建分群以分析特定参与者群体</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedSegmentation;
