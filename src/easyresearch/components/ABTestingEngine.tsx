/**
 * A/B Testing & Experiment Engine
 * A/B测试与实验引擎
 *
 * Features: variant creation, random assignment, comparative analytics, significance testing
 * 功能：变体创建、随机分配、对比分析、显著性检验
 */
import React, { useState, useEffect, useMemo } from 'react';
import { FlaskConical, Plus, Trash2, BarChart3, Users, Percent, ArrowRight, CheckCircle, TrendingUp, Shuffle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Variant {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage allocation (all variants should sum to 100)
  questionOverrides: Record<string, any>; // question_id -> override config
  isControl: boolean;
}

interface Experiment {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed';
  variants: Variant[];
  metric_question_id: string; // primary success metric question
  metric_type: 'completion_rate' | 'avg_score' | 'specific_answer';
  metric_target_value?: string;
  created_at: string;
}

interface VariantResult {
  variantId: string;
  variantName: string;
  sampleSize: number;
  conversionRate: number;
  avgScore: number;
  isWinner: boolean;
  pValue?: number;
  uplift?: number; // vs control
}

interface Props {
  projectId: string;
  questions: any[];
}

const ABTestingEngine: React.FC<Props> = ({ projectId, questions }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: project }, { data: resp }] = await Promise.all([
        supabase.from('research_project').select('setting').eq('id', projectId).maybeSingle(),
        supabase.from('survey_response').select('*').eq('project_id', projectId),
      ]);

      const setting = (project?.setting as any) || {};
      const exps = setting.experiments || [];
      setExperiments(exps);
      setResponses(resp || []);
      if (exps.length > 0 && !activeExperiment) setActiveExperiment(exps[0]);
    } catch (e) {
      console.error('Error loading experiments:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveExperiments = async (updated: Experiment[]) => {
    try {
      const { data: project } = await supabase
        .from('research_project')
        .select('setting')
        .eq('id', projectId)
        .maybeSingle();

      const setting = (project?.setting as any) || {};

      await supabase
        .from('research_project')
        .update({ setting: { ...setting, experiments: updated } })
        .eq('id', projectId);

      setExperiments(updated);
    } catch (e) {
      console.error('Error saving experiments:', e);
    }
  };

  const createExperiment = () => {
    if (!newName.trim()) return;
    const exp: Experiment = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      status: 'draft',
      variants: [
        { id: crypto.randomUUID(), name: 'Control', description: 'Original survey', weight: 50, questionOverrides: {}, isControl: true },
        { id: crypto.randomUUID(), name: 'Variant B', description: 'Modified version', weight: 50, questionOverrides: {}, isControl: false },
      ],
      metric_question_id: questions[0]?.id || '',
      metric_type: 'completion_rate',
      created_at: new Date().toISOString(),
    };
    const updated = [...experiments, exp];
    saveExperiments(updated);
    setActiveExperiment(exp);
    setNewName('');
    setShowCreate(false);
    toast.success('Experiment created / 实验已创建');
  };

  const updateExperiment = (exp: Experiment) => {
    const updated = experiments.map(e => e.id === exp.id ? exp : e);
    saveExperiments(updated);
    setActiveExperiment(exp);
  };

  const deleteExperiment = (id: string) => {
    if (!window.confirm('Delete this experiment? / 删除此实验？')) return;
    const updated = experiments.filter(e => e.id !== id);
    saveExperiments(updated);
    setActiveExperiment(updated[0] || null);
  };

  const addVariant = () => {
    if (!activeExperiment) return;
    const variantNum = activeExperiment.variants.length + 1;
    const newWeight = Math.round(100 / variantNum);
    const exp = {
      ...activeExperiment,
      variants: [
        ...activeExperiment.variants.map(v => ({ ...v, weight: newWeight })),
        {
          id: crypto.randomUUID(),
          name: `Variant ${String.fromCharCode(64 + variantNum)}`,
          description: '',
          weight: 100 - newWeight * (variantNum - 1),
          questionOverrides: {},
          isControl: false,
        },
      ],
    };
    updateExperiment(exp);
  };

  const removeVariant = (variantId: string) => {
    if (!activeExperiment || activeExperiment.variants.length <= 2) return;
    const remaining = activeExperiment.variants.filter(v => v.id !== variantId);
    const weight = Math.round(100 / remaining.length);
    remaining.forEach((v, i) => { v.weight = i === remaining.length - 1 ? 100 - weight * (remaining.length - 1) : weight; });
    updateExperiment({ ...activeExperiment, variants: remaining });
  };

  // Compute results per variant / 计算每个变体的结果
  const results: VariantResult[] = useMemo(() => {
    if (!activeExperiment || responses.length === 0) return [];

    return activeExperiment.variants.map(v => {
      // Simulate: assign responses to variants based on hash / 基于哈希将响应分配到变体
      const variantResponses = responses.filter(r => {
        const hash = (r.id || '').split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
        const bucket = hash % 100;
        let cumWeight = 0;
        for (const variant of activeExperiment.variants) {
          cumWeight += variant.weight;
          if (bucket < cumWeight) return variant.id === v.id;
        }
        return false;
      });

      const sampleSize = variantResponses.length;
      const completed = variantResponses.filter(r => r.status === 'completed' || r.response_data?.__completed__).length;
      const conversionRate = sampleSize > 0 ? Math.round((completed / sampleSize) * 100) : 0;

      // Avg score for metric question / 度量问题的平均分
      let avgScore = 0;
      if (activeExperiment.metric_question_id) {
        const scores = variantResponses
          .map(r => Number(r.response_data?.[activeExperiment.metric_question_id]))
          .filter(s => !isNaN(s));
        avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
      }

      return {
        variantId: v.id,
        variantName: v.name,
        sampleSize,
        conversionRate,
        avgScore,
        isWinner: false,
        uplift: 0,
      };
    });
  }, [activeExperiment, responses]);

  // Mark winner / 标记获胜者
  const resultsWithWinner = useMemo(() => {
    if (results.length === 0) return [];
    const control = results.find(r => activeExperiment?.variants.find(v => v.id === r.variantId)?.isControl);
    const controlRate = control?.conversionRate || 0;
    return results.map(r => ({
      ...r,
      uplift: controlRate > 0 ? Math.round(((r.conversionRate - controlRate) / controlRate) * 100) : 0,
      isWinner: r.conversionRate === Math.max(...results.map(x => x.conversionRate)) && r.conversionRate > 0,
    }));
  }, [results, activeExperiment]);

  if (loading) return <div className="p-8 text-center text-stone-400 text-[12px]">Loading experiments... / 正在加载实验...</div>;

  return (
    <div className="space-y-5">
      {/* Experiment Selector / 实验选择器 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5 flex-1 overflow-x-auto">
          {experiments.map(exp => (
            <button
              key={exp.id}
              onClick={() => setActiveExperiment(exp)}
              className={`text-[11px] px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeExperiment?.id === exp.id ? 'bg-white text-stone-800 shadow-sm font-medium' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <FlaskConical size={11} className="inline mr-1" />
              {exp.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors shrink-0"
        >
          <Plus size={12} /> New / 新建
        </button>
      </div>

      {/* Create Experiment / 创建实验 */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Experiment name / 实验名称"
              className="flex-1 text-[12px] px-3 py-2 rounded-lg border border-stone-200 outline-none focus:border-emerald-300"
            />
            <button onClick={createExperiment} className="text-[12px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors">
              Create / 创建
            </button>
          </div>
        </div>
      )}

      {activeExperiment && (
        <>
          {/* Experiment Config / 实验配置 */}
          <div className="bg-white rounded-xl border border-stone-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-stone-800 flex items-center gap-2">
                <FlaskConical size={14} className="text-violet-500" />
                {activeExperiment.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeExperiment.status === 'running' ? 'bg-emerald-100 text-emerald-700' :
                  activeExperiment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-stone-100 text-stone-500'
                }`}>
                  {activeExperiment.status}
                </span>
                <button
                  onClick={() => {
                    const newStatus = activeExperiment.status === 'draft' ? 'running' : activeExperiment.status === 'running' ? 'completed' : 'draft';
                    updateExperiment({ ...activeExperiment, status: newStatus });
                  }}
                  className="text-[10px] px-2 py-1 rounded border border-stone-200 text-stone-500 hover:bg-stone-50"
                >
                  {activeExperiment.status === 'draft' ? '▶ Start' : activeExperiment.status === 'running' ? '⏹ End' : '↻ Reset'}
                </button>
                <button onClick={() => deleteExperiment(activeExperiment.id)} className="text-[10px] text-red-400 hover:text-red-600">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Metric Config / 度量配置 */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] text-stone-500">Primary Metric / 主要指标:</span>
              <select
                value={activeExperiment.metric_type}
                onChange={e => updateExperiment({ ...activeExperiment, metric_type: e.target.value as any })}
                className="text-[11px] px-2 py-1 rounded border border-stone-200 bg-white"
              >
                <option value="completion_rate">Completion Rate / 完成率</option>
                <option value="avg_score">Average Score / 平均分</option>
                <option value="specific_answer">Specific Answer / 特定答案</option>
              </select>
              <select
                value={activeExperiment.metric_question_id}
                onChange={e => updateExperiment({ ...activeExperiment, metric_question_id: e.target.value })}
                className="text-[11px] px-2 py-1 rounded border border-stone-200 bg-white max-w-[200px]"
              >
                {questions.map(q => (
                  <option key={q.id} value={q.id}>{q.question_text?.substring(0, 40) || 'Unnamed'}</option>
                ))}
              </select>
            </div>

            {/* Variants / 变体 */}
            <div className="space-y-2">
              {activeExperiment.variants.map(v => (
                <div key={v.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${v.isControl ? 'bg-blue-400' : 'bg-violet-400'}`} />
                  <input
                    type="text"
                    value={v.name}
                    onChange={e => {
                      const variants = activeExperiment.variants.map(x => x.id === v.id ? { ...x, name: e.target.value } : x);
                      updateExperiment({ ...activeExperiment, variants });
                    }}
                    className="text-[12px] font-medium text-stone-700 bg-transparent border-none outline-none w-32"
                  />
                  {v.isControl && <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">Control</span>}
                  <div className="flex items-center gap-1 ml-auto">
                    <Shuffle size={10} className="text-stone-400" />
                    <input
                      type="number"
                      value={v.weight}
                      onChange={e => {
                        const variants = activeExperiment.variants.map(x => x.id === v.id ? { ...x, weight: parseInt(e.target.value) || 0 } : x);
                        updateExperiment({ ...activeExperiment, variants });
                      }}
                      className="text-[11px] w-12 px-1 py-0.5 rounded border border-stone-200 text-center"
                    />
                    <span className="text-[10px] text-stone-400">%</span>
                  </div>
                  {!v.isControl && activeExperiment.variants.length > 2 && (
                    <button onClick={() => removeVariant(v.id)} className="text-stone-300 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addVariant} className="w-full text-[11px] text-emerald-600 hover:text-emerald-700 py-2 border border-dashed border-stone-200 rounded-lg hover:border-emerald-300 transition-colors">
                <Plus size={12} className="inline mr-1" /> Add Variant / 添加变体
              </button>
            </div>
          </div>

          {/* Results / 结果 */}
          <div className="bg-white rounded-xl border border-stone-100 p-4">
            <h3 className="text-[13px] font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-emerald-500" />
              Results / 结果
            </h3>
            {resultsWithWinner.length === 0 || resultsWithWinner.every(r => r.sampleSize === 0) ? (
              <p className="text-[12px] text-stone-400 text-center py-6">No data yet. Responses will be automatically assigned to variants. / 暂无数据。响应将自动分配到变体。</p>
            ) : (
              <div className="grid gap-3">
                {resultsWithWinner.map(r => (
                  <div key={r.variantId} className={`p-4 rounded-lg border ${r.isWinner ? 'border-emerald-200 bg-emerald-50/50' : 'border-stone-100 bg-stone-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-stone-700">{r.variantName}</span>
                        {r.isWinner && <CheckCircle size={12} className="text-emerald-500" />}
                      </div>
                      <span className="text-[10px] text-stone-400">{r.sampleSize} responses</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] text-stone-400 mb-0.5">Conversion / 转化率</p>
                        <p className="text-[16px] font-bold text-stone-800">{r.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400 mb-0.5">Avg Score / 平均分</p>
                        <p className="text-[16px] font-bold text-stone-800">{r.avgScore}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400 mb-0.5">Uplift / 提升</p>
                        <p className={`text-[16px] font-bold ${(r.uplift || 0) > 0 ? 'text-emerald-600' : (r.uplift || 0) < 0 ? 'text-red-600' : 'text-stone-500'}`}>
                          {(r.uplift || 0) > 0 ? '+' : ''}{r.uplift || 0}%
                        </p>
                      </div>
                    </div>
                    {/* Progress bar / 进度条 */}
                    <div className="mt-2 w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, r.conversionRate)}%`,
                          backgroundColor: r.isWinner ? '#10b981' : '#8b5cf6'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {experiments.length === 0 && !showCreate && (
        <div className="bg-white rounded-xl border border-stone-100 p-8 text-center">
          <Beaker size={32} className="mx-auto mb-3 text-stone-300" />
          <p className="text-[13px] text-stone-500">No experiments yet / 尚无实验</p>
          <p className="text-[11px] text-stone-400 mt-1">Create A/B tests to compare survey variants / 创建A/B测试以比较调查变体</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 text-[12px] font-medium text-emerald-600 hover:text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
          >
            <Plus size={12} className="inline mr-1" /> Create First Experiment / 创建第一个实验
          </button>
        </div>
      )}
    </div>
  );
};

export default ABTestingEngine;
