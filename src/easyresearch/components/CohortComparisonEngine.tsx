/**
 * Cohort Comparison Engine — Compare response patterns across participant segments
 * 队列比较引擎 — 跨参与者群组比较响应模式
 */
import React, { useState, useMemo } from 'react';
import { Users, ArrowLeftRight, BarChart3, TrendingUp, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  projectId: string;
  responses: any[];
  questions: any[];
  enrollments?: any[];
}

const COHORT_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

const CohortComparisonEngine: React.FC<Props> = ({ projectId, responses, questions, enrollments = [] }) => {
  const [segmentBy, setSegmentBy] = useState<string>('');
  const [compareQuestion, setCompareQuestion] = useState<string>('');
  const [view, setView] = useState<'chart' | 'table' | 'significance'>('chart');

  // Questions that can be used for segmentation (categorical) / 可用于分群的问题（分类型）
  const segmentQuestions = useMemo(() =>
    questions.filter(q => ['single_choice', 'dropdown', 'yes_no', 'likert', 'rating'].includes(q.question_type)),
  [questions]);

  // Questions to compare across cohorts / 跨队列比较的问题
  const comparableQuestions = useMemo(() =>
    questions.filter(q => ['single_choice', 'multiple_choice', 'likert', 'rating', 'scale', 'slider', 'nps', 'number'].includes(q.question_type)),
  [questions]);

  // Build cohorts based on segmentation question / 基于分群问题构建队列
  const cohorts = useMemo(() => {
    if (!segmentBy) return new Map<string, any[]>();
    const map = new Map<string, any[]>();
    for (const r of responses) {
      const answers = r.answers || {};
      let segVal = answers[segmentBy] || r.response_value;
      if (segVal === undefined || segVal === null) continue;
      if (typeof segVal === 'object' && segVal.option_id) segVal = segVal.option_id;
      const key = String(segVal);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [responses, segmentBy]);

  // Resolve option label / 解析选项标签
  const getOptionLabel = (questionId: string, value: string) => {
    const q = questions.find((q: any) => q.id === questionId);
    if (!q?.options) return value;
    const opt = q.options.find((o: any) => o.id === value || o.option_value === value || o.value === value);
    return opt?.text || opt?.option_text || opt?.label || value;
  };

  // Compare data for selected question across cohorts / 跨队列比较所选问题的数据
  const comparisonData = useMemo(() => {
    if (!compareQuestion || cohorts.size === 0) return [];
    const q = questions.find((q: any) => q.id === compareQuestion);
    if (!q) return [];

    const isNumeric = ['rating', 'scale', 'slider', 'nps', 'number', 'likert'].includes(q.question_type);

    if (isNumeric) {
      // Numeric comparison: mean, median, std dev per cohort / 数值比较：每个队列的均值、中位数、标准差
      return [...cohorts.entries()].map(([cohortName, cohortResponses]) => {
        const values = cohortResponses
          .map(r => {
            const v = (r.answers || {})[compareQuestion] ?? r.response_value;
            return typeof v === 'number' ? v : parseFloat(v);
          })
          .filter(v => !isNaN(v));

        const mean = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
        const sorted = [...values].sort((a, b) => a - b);
        const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
        const stdDev = values.length > 1
          ? Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1))
          : 0;

        return {
          cohort: getOptionLabel(segmentBy, cohortName),
          mean: Math.round(mean * 100) / 100,
          median,
          stdDev: Math.round(stdDev * 100) / 100,
          n: values.length,
        };
      });
    } else {
      // Categorical comparison: count per option per cohort / 分类比较：每个队列每个选项的计数
      const allOptions = new Set<string>();
      const cohortCounts = new Map<string, Map<string, number>>();

      for (const [cohortName, cohortResponses] of cohorts) {
        const counts = new Map<string, number>();
        for (const r of cohortResponses) {
          let v = (r.answers || {})[compareQuestion] ?? r.response_value;
          if (Array.isArray(v)) v.forEach((item: string) => { allOptions.add(item); counts.set(item, (counts.get(item) || 0) + 1); });
          else if (v !== undefined && v !== null) { const s = String(v); allOptions.add(s); counts.set(s, (counts.get(s) || 0) + 1); }
        }
        cohortCounts.set(cohortName, counts);
      }

      return [...allOptions].map(option => {
        const row: any = { option: getOptionLabel(compareQuestion, option) };
        for (const [cohortName] of cohorts) {
          const label = getOptionLabel(segmentBy, cohortName);
          row[label] = cohortCounts.get(cohortName)?.get(option) || 0;
        }
        return row;
      });
    }
  }, [compareQuestion, cohorts, questions, segmentBy]);

  // Chi-Square test for independence / 独立性卡方检验
  const chiSquareResult = useMemo(() => {
    if (!compareQuestion || cohorts.size < 2 || comparisonData.length === 0) return null;
    const q = questions.find((q: any) => q.id === compareQuestion);
    if (['rating', 'scale', 'slider', 'nps', 'number', 'likert'].includes(q?.question_type)) {
      // T-test approximation for numeric / 数值型的 T 检验近似
      if (comparisonData.length === 2) {
        const [a, b] = comparisonData;
        const pooledSE = Math.sqrt((a.stdDev ** 2 / a.n) + (b.stdDev ** 2 / b.n));
        const tStat = pooledSE > 0 ? Math.abs(a.mean - b.mean) / pooledSE : 0;
        const df = a.n + b.n - 2;
        // Approximate p-value / 近似 p 值
        const pApprox = tStat > 2.58 ? 0.01 : tStat > 1.96 ? 0.05 : tStat > 1.64 ? 0.1 : 0.5;
        return { test: "Welch's t-test", statistic: Math.round(tStat * 100) / 100, df, pValue: pApprox, significant: pApprox < 0.05 };
      }
      return null;
    }

    // Chi-Square for categorical / 分类变量的卡方检验
    const cohortNames = [...cohorts.keys()].map(k => getOptionLabel(segmentBy, k));
    const observed: number[][] = comparisonData.map(row => cohortNames.map(c => row[c] || 0));
    const rowTotals = observed.map(r => r.reduce((s, v) => s + v, 0));
    const colTotals = cohortNames.map((_, ci) => observed.reduce((s, r) => s + r[ci], 0));
    const grandTotal = rowTotals.reduce((s, v) => s + v, 0);
    if (grandTotal === 0) return null;

    let chiSq = 0;
    for (let i = 0; i < observed.length; i++) {
      for (let j = 0; j < cohortNames.length; j++) {
        const expected = (rowTotals[i] * colTotals[j]) / grandTotal;
        if (expected > 0) chiSq += (observed[i][j] - expected) ** 2 / expected;
      }
    }
    const df = (observed.length - 1) * (cohortNames.length - 1);
    const pApprox = chiSq > 13.82 ? 0.001 : chiSq > 9.21 ? 0.01 : chiSq > 5.99 ? 0.05 : chiSq > 3.84 ? 0.1 : 0.5;

    return { test: 'Chi-Square', statistic: Math.round(chiSq * 100) / 100, df, pValue: pApprox, significant: pApprox < 0.05 };
  }, [comparisonData, cohorts, compareQuestion, questions, segmentBy]);

  const cohortNames = [...cohorts.keys()].map(k => getOptionLabel(segmentBy, k));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cohort Comparison / 队列比较</h2>
          <p className="text-sm text-muted-foreground">Compare response patterns across segments / 跨群组比较响应模式</p>
        </div>
      </div>

      {/* Config / 配置 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Segment By (grouping question) / 分群依据</label>
          <select value={segmentBy} onChange={e => setSegmentBy(e.target.value)} className="w-full mt-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground">
            <option value="">Select question... / 选择问题...</option>
            {segmentQuestions.map(q => (
              <option key={q.id} value={q.id}>{(q.question_text || q.text || '').substring(0, 50)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Compare Question / 比较问题</label>
          <select value={compareQuestion} onChange={e => setCompareQuestion(e.target.value)} className="w-full mt-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground">
            <option value="">Select question... / 选择问题...</option>
            {comparableQuestions.filter(q => q.id !== segmentBy).map(q => (
              <option key={q.id} value={q.id}>{(q.question_text || q.text || '').substring(0, 50)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cohort Summary / 队列摘要 */}
      {cohorts.size > 0 && (
        <div className="flex gap-3 flex-wrap">
          {[...cohorts.entries()].map(([name, members], i) => (
            <div key={name} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COHORT_COLORS[i % COHORT_COLORS.length] }} />
              <span className="text-foreground font-medium">{getOptionLabel(segmentBy, name)}</span>
              <span className="text-xs text-muted-foreground">n={members.length}</span>
            </div>
          ))}
        </div>
      )}

      {/* View Tabs / 视图切换 */}
      {comparisonData.length > 0 && (
        <>
          <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
            {(['chart', 'table', 'significance'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-sm rounded-md transition-colors ${view === v ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                {v === 'chart' && 'Chart / 图表'}
                {v === 'table' && 'Table / 表格'}
                {v === 'significance' && 'Significance / 显著性'}
              </button>
            ))}
          </div>

          {/* Chart View / 图表视图 */}
          {view === 'chart' && (
            <div className="border border-border rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={comparisonData[0]?.cohort !== undefined ? 'cohort' : 'option'} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {comparisonData[0]?.mean !== undefined ? (
                    <>
                      <Bar dataKey="mean" fill={COHORT_COLORS[0]} name="Mean / 均值" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="median" fill={COHORT_COLORS[1]} name="Median / 中位数" radius={[4, 4, 0, 0]} />
                    </>
                  ) : (
                    cohortNames.map((name, i) => (
                      <Bar key={name} dataKey={name} fill={COHORT_COLORS[i % COHORT_COLORS.length]} radius={[4, 4, 0, 0]} />
                    ))
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table View / 表格视图 */}
          {view === 'table' && (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {Object.keys(comparisonData[0] || {}).map(key => (
                      <th key={key} className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-4 py-2 text-foreground">{typeof val === 'number' ? val.toFixed(2) : String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Significance / 显著性 */}
          {view === 'significance' && (
            <div className="border border-border rounded-lg p-6">
              {chiSquareResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${chiSquareResult.significant ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      <span className="text-lg font-bold">{chiSquareResult.significant ? '✓' : '!'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {chiSquareResult.significant ? 'Statistically Significant / 统计显著' : 'Not Significant / 不显著'}
                      </p>
                      <p className="text-xs text-muted-foreground">{chiSquareResult.test} test</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-border rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{chiSquareResult.statistic}</p>
                      <p className="text-xs text-muted-foreground">Test Statistic / 检验统计量</p>
                    </div>
                    <div className="border border-border rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{chiSquareResult.df}</p>
                      <p className="text-xs text-muted-foreground">df</p>
                    </div>
                    <div className="border border-border rounded-lg p-3 text-center">
                      <p className={`text-lg font-bold ${chiSquareResult.pValue < 0.05 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        p {'<'} {chiSquareResult.pValue}
                      </p>
                      <p className="text-xs text-muted-foreground">p-value</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Select two cohorts and a comparison question to run significance tests / 选择两个队列和一个比较问题来运行显著性检验</p>
              )}
            </div>
          )}
        </>
      )}

      {!segmentBy && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Select a segmentation question to create cohorts / 选择一个分群问题来创建队列</p>
        </div>
      )}
    </div>
  );
};

export default CohortComparisonEngine;
