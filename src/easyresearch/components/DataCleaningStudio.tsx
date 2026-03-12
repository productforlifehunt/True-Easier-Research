import React, { useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Eraser, Filter, AlertTriangle, CheckCircle2, Trash2, RotateCcw, Download, Zap, Eye, EyeOff } from 'lucide-react';
import { bToast } from '../utils/bilingualToast';

// Data Cleaning Studio – Pre-analysis data preparation and transformation tool
// 数据清洗工作室 – 分析前数据准备和转换工具

interface Props {
  projectId: string;
  questionnaires: any[];
}

type CleaningRule = {
  id: string;
  name: string;
  description: string;
  type: 'remove_incomplete' | 'remove_speeders' | 'remove_straightliners' | 'remove_duplicates' | 'remove_outliers' | 'recode_values' | 'merge_categories' | 'fill_missing' | 'trim_text' | 'standardize_case';
  config: Record<string, any>;
  enabled: boolean;
  affected_count: number;
};

const RULE_TEMPLATES: Omit<CleaningRule, 'id' | 'affected_count'>[] = [
  { name: 'Remove Incomplete / 删除不完整', description: 'Remove responses below completion threshold / 删除低于完成阈值的响应', type: 'remove_incomplete', config: { threshold: 80 }, enabled: true },
  { name: 'Remove Speeders / 删除快速答题', description: 'Flag responses completed too quickly / 标记完成过快的响应', type: 'remove_speeders', config: { min_seconds: 30 }, enabled: true },
  { name: 'Remove Straightliners / 删除直线答题', description: 'Detect identical scale patterns / 检测相同量表模式', type: 'remove_straightliners', config: { min_questions: 5, variance_threshold: 0.1 }, enabled: true },
  { name: 'Remove Duplicates / 删除重复', description: 'Remove duplicate submissions by IP/email / 按IP/邮箱删除重复提交', type: 'remove_duplicates', config: { match_by: 'email' }, enabled: false },
  { name: 'Remove Outliers / 删除离群值', description: 'Remove numeric outliers beyond Z-score threshold / 删除超出Z分数阈值的数值离群值', type: 'remove_outliers', config: { z_threshold: 3.0 }, enabled: false },
  { name: 'Recode Values / 重新编码', description: 'Map response values to new codes / 将响应值映射为新代码', type: 'recode_values', config: { mappings: {} }, enabled: false },
  { name: 'Merge Categories / 合并类别', description: 'Combine low-frequency categories / 合并低频类别', type: 'merge_categories', config: { min_frequency: 5 }, enabled: false },
  { name: 'Fill Missing / 填充缺失', description: 'Impute missing values with mean/median/mode / 使用均值/中位数/众数填充缺失值', type: 'fill_missing', config: { method: 'median' }, enabled: false },
  { name: 'Trim Text / 修剪文本', description: 'Remove leading/trailing whitespace / 删除前后空格', type: 'trim_text', config: {}, enabled: false },
  { name: 'Standardize Case / 统一大小写', description: 'Convert text to consistent case / 将文本转换为统一大小写', type: 'standardize_case', config: { case: 'lower' }, enabled: false },
];

const DataCleaningStudio: React.FC<Props> = ({ projectId, questionnaires }) => {
  const [rules, setRules] = useState<CleaningRule[]>(
    RULE_TEMPLATES.map((t, i) => ({ ...t, id: `rule_${i}`, affected_count: 0 }))
  );
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [showExcluded, setShowExcluded] = useState(false);

  const loadAndAnalyze = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('survey_response').select('*').eq('project_id', projectId);
      const allResponses = data || [];
      setResponses(allResponses);

      // Group by enrollment / 按登记分组
      const byEnrollment = new Map<string, any[]>();
      allResponses.forEach(r => {
        const key = r.enrollment_id || r.id;
        if (!byEnrollment.has(key)) byEnrollment.set(key, []);
        byEnrollment.get(key)!.push(r);
      });

      const newExcluded = new Set<string>();

      // Analyze each rule / 分析每条规则
      const updatedRules = rules.map(rule => {
        let count = 0;
        if (!rule.enabled) return { ...rule, affected_count: 0 };

        switch (rule.type) {
          case 'remove_incomplete': {
            const totalQuestions = questionnaires.flatMap(q => q.questions || []).length || 1;
            const threshold = (rule.config.threshold || 80) / 100;
            byEnrollment.forEach((resps, enrollId) => {
              const answered = new Set(resps.map(r => r.question_id)).size;
              if (answered / totalQuestions < threshold) {
                count++;
                resps.forEach(r => newExcluded.add(r.id));
              }
            });
            break;
          }
          case 'remove_speeders': {
            const minSeconds = rule.config.min_seconds || 30;
            byEnrollment.forEach((resps, enrollId) => {
              const times = resps.map(r => new Date(r.created_at).getTime()).sort();
              if (times.length >= 2) {
                const totalSeconds = (times[times.length - 1] - times[0]) / 1000;
                if (totalSeconds < minSeconds) {
                  count++;
                  resps.forEach(r => newExcluded.add(r.id));
                }
              }
            });
            break;
          }
          case 'remove_straightliners': {
            byEnrollment.forEach((resps, enrollId) => {
              const numericValues = resps
                .filter(r => r.response_value != null && !isNaN(Number(r.response_value)))
                .map(r => Number(r.response_value));
              if (numericValues.length >= (rule.config.min_questions || 5)) {
                const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
                const variance = numericValues.reduce((a, v) => a + (v - mean) ** 2, 0) / numericValues.length;
                if (variance < (rule.config.variance_threshold || 0.1)) {
                  count++;
                  resps.forEach(r => newExcluded.add(r.id));
                }
              }
            });
            break;
          }
          case 'remove_duplicates': {
            const seen = new Set<string>();
            byEnrollment.forEach((resps, enrollId) => {
              const key = resps[0]?.enrollment_id || '';
              if (seen.has(key) && key) {
                count++;
                resps.forEach(r => newExcluded.add(r.id));
              } else {
                seen.add(key);
              }
            });
            break;
          }
          case 'remove_outliers': {
            const allNumeric = allResponses
              .filter(r => r.response_value != null && !isNaN(Number(r.response_value)))
              .map(r => ({ id: r.id, val: Number(r.response_value) }));
            if (allNumeric.length > 2) {
              const mean = allNumeric.reduce((a, v) => a + v.val, 0) / allNumeric.length;
              const std = Math.sqrt(allNumeric.reduce((a, v) => a + (v.val - mean) ** 2, 0) / allNumeric.length);
              const z = rule.config.z_threshold || 3.0;
              allNumeric.forEach(v => {
                if (std > 0 && Math.abs(v.val - mean) / std > z) {
                  count++;
                  newExcluded.add(v.id);
                }
              });
            }
            break;
          }
          default:
            break;
        }
        return { ...rule, affected_count: count };
      });

      setRules(updatedRules);
      setExcluded(newExcluded);
      setAnalyzed(true);
      bToast.success(`Analysis complete: ${newExcluded.size} responses flagged`, `分析完成：${newExcluded.size}条响应被标记`);
    } catch (e) {
      console.error(e);
      bToast.error('Analysis failed', '分析失败');
    } finally {
      setLoading(false);
    }
  };

  const exportClean = () => {
    const clean = responses.filter(r => !excluded.has(r.id));
    const csv = [
      ['id', 'enrollment_id', 'question_id', 'response_text', 'response_value', 'created_at'].join(','),
      ...clean.map(r => [r.id, r.enrollment_id, r.question_id, `"${(r.response_text || '').replace(/"/g, '""')}"`, r.response_value, r.created_at].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clean_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    bToast.success('Clean data exported', '清洁数据已导出');
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    setAnalyzed(false);
  };

  const updateRuleConfig = (id: string, key: string, value: any) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, config: { ...r.config, [key]: value } } : r));
    setAnalyzed(false);
  };

  const cleanCount = responses.length - excluded.size;
  const dirtyPercent = responses.length > 0 ? Math.round(excluded.size / responses.length * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Eraser size={22} className="text-emerald-600" />
            Data Cleaning Studio / 数据清洗工作室
          </h2>
          <p className="text-sm text-stone-500 mt-1">Prepare and validate data before analysis / 分析前准备和验证数据</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAndAnalyze} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
            <Zap size={14} /> {loading ? 'Analyzing...' : 'Run Analysis / 运行分析'}
          </button>
          {analyzed && (
            <button onClick={exportClean} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50">
              <Download size={14} /> Export Clean / 导出清洁数据
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      {analyzed && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className="text-2xl font-bold text-stone-700">{responses.length}</div>
            <div className="text-xs text-stone-500">Total / 总计</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{cleanCount}</div>
            <div className="text-xs text-stone-500">Clean / 清洁</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{excluded.size}</div>
            <div className="text-xs text-stone-500">Flagged / 已标记</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className={`text-2xl font-bold ${dirtyPercent > 20 ? 'text-red-500' : dirtyPercent > 10 ? 'text-amber-500' : 'text-emerald-600'}`}>
              {dirtyPercent}%
            </div>
            <div className="text-xs text-stone-500">Removal Rate / 清除率</div>
          </div>
        </div>
      )}

      {/* Data quality health bar */}
      {analyzed && (
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-700">Data Quality / 数据质量</span>
            <span className="text-sm font-bold text-emerald-600">{100 - dirtyPercent}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                dirtyPercent > 20 ? 'bg-red-400' : dirtyPercent > 10 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${100 - dirtyPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Rules */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-700">Cleaning Rules / 清洗规则</h3>
        {rules.map(rule => (
          <div key={rule.id} className={`bg-white rounded-xl border p-4 transition-all ${rule.enabled ? 'border-emerald-200' : 'border-stone-200 opacity-60'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <button onClick={() => toggleRule(rule.id)} className={`p-1 rounded ${rule.enabled ? 'text-emerald-600' : 'text-stone-400'}`}>
                  {rule.enabled ? <CheckCircle2 size={18} /> : <EyeOff size={18} />}
                </button>
                <div>
                  <div className="text-sm font-medium text-stone-800">{rule.name}</div>
                  <div className="text-xs text-stone-500">{rule.description}</div>
                </div>
              </div>
              {analyzed && rule.enabled && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  rule.affected_count > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {rule.affected_count > 0 ? <AlertTriangle size={12} className="inline mr-1" /> : <CheckCircle2 size={12} className="inline mr-1" />}
                  {rule.affected_count} affected
                </span>
              )}
            </div>
            {/* Rule-specific config */}
            {rule.enabled && (
              <div className="mt-3 pl-9 flex gap-3 flex-wrap">
                {rule.type === 'remove_incomplete' && (
                  <label className="text-xs text-stone-500 flex items-center gap-1">
                    Threshold / 阈值:
                    <input type="number" value={rule.config.threshold} onChange={e => updateRuleConfig(rule.id, 'threshold', parseInt(e.target.value))} min={10} max={100} className="w-16 px-2 py-1 border rounded text-xs" />%
                  </label>
                )}
                {rule.type === 'remove_speeders' && (
                  <label className="text-xs text-stone-500 flex items-center gap-1">
                    Min seconds / 最小秒数:
                    <input type="number" value={rule.config.min_seconds} onChange={e => updateRuleConfig(rule.id, 'min_seconds', parseInt(e.target.value))} min={5} className="w-16 px-2 py-1 border rounded text-xs" />
                  </label>
                )}
                {rule.type === 'remove_outliers' && (
                  <label className="text-xs text-stone-500 flex items-center gap-1">
                    Z-score / Z分数:
                    <input type="number" value={rule.config.z_threshold} onChange={e => updateRuleConfig(rule.id, 'z_threshold', parseFloat(e.target.value))} step={0.5} min={1} max={5} className="w-16 px-2 py-1 border rounded text-xs" />
                  </label>
                )}
                {rule.type === 'fill_missing' && (
                  <select value={rule.config.method} onChange={e => updateRuleConfig(rule.id, 'method', e.target.value)} className="px-2 py-1 border rounded text-xs">
                    <option value="mean">Mean / 均值</option>
                    <option value="median">Median / 中位数</option>
                    <option value="mode">Mode / 众数</option>
                  </select>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataCleaningStudio;
