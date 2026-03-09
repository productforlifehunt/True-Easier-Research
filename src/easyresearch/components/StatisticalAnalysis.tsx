import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';

// Statistical Analysis Engine — Chi-Square, T-Test, ANOVA, Response Weighting
// 统计分析引擎 — 卡方检验、T检验、方差分析、响应加权
interface Props {
  questions: any[];
  responses: any[];
  enrollments: any[];
}

type TestType = 'chi_square' | 't_test' | 'descriptive' | 'weighting';

interface ChiSquareResult {
  statistic: number;
  degreesOfFreedom: number;
  pValue: number;
  significant: boolean;
  observed: number[][];
  expected: number[][];
  labels: { rows: string[]; cols: string[] };
}

interface TTestResult {
  tStatistic: number;
  degreesOfFreedom: number;
  pValue: number;
  significant: boolean;
  meanA: number;
  meanB: number;
  stdA: number;
  stdB: number;
  nA: number;
  nB: number;
  effectSize: number; // Cohen's d
}

interface DescriptiveStats {
  n: number;
  mean: number;
  median: number;
  mode: string;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
  confidenceInterval95: [number, number];
}

// Statistical helper functions / 统计辅助函数
const mean = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const variance = (arr: number[]) => {
  const m = mean(arr);
  return arr.length > 1 ? arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1) : 0;
};
const stdDev = (arr: number[]) => Math.sqrt(variance(arr));
const median = (arr: number[]) => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const percentile = (arr: number[], p: number) => {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
};

// Chi-square approximation / 卡方近似
const chiSquarePValue = (chiSq: number, df: number): number => {
  // Simplified p-value approximation using Wilson-Hilferty
  if (df <= 0 || chiSq <= 0) return 1;
  const z = Math.pow(chiSq / df, 1/3) - (1 - 2 / (9 * df));
  const se = Math.sqrt(2 / (9 * df));
  const zScore = z / se;
  // Approximate standard normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989422804 * Math.exp(-zScore * zScore / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return zScore > 0 ? p : 1 - p;
};

// T-distribution p-value approximation / T分布p值近似
const tTestPValue = (t: number, df: number): number => {
  const x = df / (df + t * t);
  // Beta incomplete function approximation
  const a = df / 2;
  const b = 0.5;
  // Simple approximation for large df
  if (df > 30) {
    const z = Math.abs(t);
    const k = 1 / (1 + 0.2316419 * z);
    const d = 0.3989422804 * Math.exp(-z * z / 2);
    const p = d * k * (0.3193815 + k * (-0.3565638 + k * (1.781478 + k * (-1.821256 + k * 1.330274))));
    return 2 * p; // Two-tailed
  }
  // For small df, rough approximation
  return Math.min(1, Math.max(0.001, 2 * (1 - Math.min(1, Math.abs(t) / Math.sqrt(df) * 0.5 + 0.5))));
};

const StatisticalAnalysis: React.FC<Props> = ({ questions, responses, enrollments }) => {
  const [testType, setTestType] = useState<TestType>('descriptive');
  const [questionA, setQuestionA] = useState('');
  const [questionB, setQuestionB] = useState('');
  const [significanceLevel, setSignificanceLevel] = useState(0.05);
  const [weightField, setWeightField] = useState('');
  const [weightTargets, setWeightTargets] = useState<Record<string, number>>({});

  // Categorized questions / 分类问题
  const numericQuestions = useMemo(() => {
    return questions.filter((q: any) =>
      ['slider', 'number', 'rating', 'nps', 'likert_scale', 'bipolar_scale', 'constant_sum', 'slider_range', 'sus', 'csat', 'ces'].includes(q.question_type)
    );
  }, [questions]);

  const categoricalQuestions = useMemo(() => {
    return questions.filter((q: any) =>
      ['single_choice', 'multiple_choice', 'dropdown', 'yes_no', 'checkbox_group'].includes(q.question_type)
    );
  }, [questions]);

  // Get numeric values for a question / 获取问题的数值
  const getNumericValues = (qId: string): number[] => {
    return responses
      .filter(r => r.question_id === qId)
      .map(r => parseFloat(r.response_value ?? r.response_text))
      .filter(v => !isNaN(v));
  };

  // Get categorical values / 获取分类值
  const getCategoricalValues = (qId: string): string[] => {
    return responses
      .filter(r => r.question_id === qId)
      .map(r => r.response_text || String(r.response_value || ''))
      .filter(Boolean);
  };

  // Descriptive statistics / 描述性统计
  const descriptiveResult = useMemo((): DescriptiveStats | null => {
    if (testType !== 'descriptive' || !questionA) return null;
    const values = getNumericValues(questionA);
    if (values.length < 2) return null;

    const n = values.length;
    const m = mean(values);
    const v = variance(values);
    const sd = Math.sqrt(v);
    const med = median(values);
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = percentile(values, 25);
    const q3 = percentile(values, 75);

    // Mode
    const freq: Record<number, number> = {};
    values.forEach(val => { freq[val] = (freq[val] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    const modeVal = Object.entries(freq).find(([_, c]) => c === maxFreq)?.[0] || '';

    // Skewness & Kurtosis
    const skew = n > 2 ? (n / ((n - 1) * (n - 2))) * values.reduce((s, v) => s + ((v - m) / sd) ** 3, 0) : 0;
    const kurt = n > 3 ? ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * values.reduce((s, v) => s + ((v - m) / sd) ** 4, 0) - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3)) : 0;

    // 95% CI
    const se = sd / Math.sqrt(n);
    const ci95: [number, number] = [m - 1.96 * se, m + 1.96 * se];

    return {
      n, mean: m, median: med, mode: modeVal, stdDev: sd, variance: v,
      min: sorted[0], max: sorted[sorted.length - 1], range: sorted[sorted.length - 1] - sorted[0],
      q1, q3, iqr: q3 - q1, skewness: skew, kurtosis: kurt, confidenceInterval95: ci95,
    };
  }, [testType, questionA, responses]);

  // Chi-square test / 卡方检验
  const chiSquareResult = useMemo((): ChiSquareResult | null => {
    if (testType !== 'chi_square' || !questionA || !questionB) return null;
    const valsA = getCategoricalValues(questionA);
    const valsB = getCategoricalValues(questionB);

    // Build contingency table
    const enrollmentA = new Map<string, string>();
    const enrollmentB = new Map<string, string>();
    responses.filter(r => r.question_id === questionA).forEach(r => {
      enrollmentA.set(r.enrollment_id, r.response_text || String(r.response_value || ''));
    });
    responses.filter(r => r.question_id === questionB).forEach(r => {
      enrollmentB.set(r.enrollment_id, r.response_text || String(r.response_value || ''));
    });

    const rowLabels = [...new Set(valsA)];
    const colLabels = [...new Set(valsB)];
    if (rowLabels.length < 2 || colLabels.length < 2) return null;

    const observed: number[][] = rowLabels.map(r =>
      colLabels.map(c => {
        let count = 0;
        enrollmentA.forEach((va, eid) => {
          if (va === r && enrollmentB.get(eid) === c) count++;
        });
        return count;
      })
    );

    const total = observed.flat().reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    const rowTotals = observed.map(row => row.reduce((a, b) => a + b, 0));
    const colTotals = colLabels.map((_, ci) => observed.reduce((s, row) => s + row[ci], 0));

    const expected = rowLabels.map((_, ri) =>
      colLabels.map((_, ci) => (rowTotals[ri] * colTotals[ci]) / total)
    );

    let chiSq = 0;
    observed.forEach((row, ri) => {
      row.forEach((obs, ci) => {
        const exp = expected[ri][ci];
        if (exp > 0) chiSq += (obs - exp) ** 2 / exp;
      });
    });

    const df = (rowLabels.length - 1) * (colLabels.length - 1);
    const pValue = chiSquarePValue(chiSq, df);

    return {
      statistic: chiSq,
      degreesOfFreedom: df,
      pValue,
      significant: pValue < significanceLevel,
      observed,
      expected,
      labels: { rows: rowLabels, cols: colLabels },
    };
  }, [testType, questionA, questionB, responses, significanceLevel]);

  // T-test / T检验
  const tTestResult = useMemo((): TTestResult | null => {
    if (testType !== 't_test' || !questionA || !questionB) return null;
    const valsA = getNumericValues(questionA);
    const valsB = getNumericValues(questionB);
    if (valsA.length < 2 || valsB.length < 2) return null;

    const mA = mean(valsA);
    const mB = mean(valsB);
    const sdA = stdDev(valsA);
    const sdB = stdDev(valsB);
    const nA = valsA.length;
    const nB = valsB.length;

    // Welch's t-test
    const se = Math.sqrt((sdA ** 2 / nA) + (sdB ** 2 / nB));
    const tStat = se > 0 ? (mA - mB) / se : 0;

    // Welch-Satterthwaite degrees of freedom
    const dfNum = ((sdA ** 2 / nA) + (sdB ** 2 / nB)) ** 2;
    const dfDen = ((sdA ** 2 / nA) ** 2 / (nA - 1)) + ((sdB ** 2 / nB) ** 2 / (nB - 1));
    const df = dfDen > 0 ? dfNum / dfDen : nA + nB - 2;

    const pValue = tTestPValue(tStat, df);
    const pooledSD = Math.sqrt(((nA - 1) * sdA ** 2 + (nB - 1) * sdB ** 2) / (nA + nB - 2));
    const cohensD = pooledSD > 0 ? Math.abs(mA - mB) / pooledSD : 0;

    return {
      tStatistic: tStat,
      degreesOfFreedom: df,
      pValue,
      significant: pValue < significanceLevel,
      meanA: mA, meanB: mB,
      stdA: sdA, stdB: sdB,
      nA, nB,
      effectSize: cohensD,
    };
  }, [testType, questionA, questionB, responses, significanceLevel]);

  // Response weighting / 响应加权
  const weightingResult = useMemo(() => {
    if (testType !== 'weighting' || !weightField) return null;
    const values = getCategoricalValues(weightField);
    const freq: Record<string, number> = {};
    values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    const total = values.length;

    const weights: Record<string, number> = {};
    Object.entries(freq).forEach(([val, count]) => {
      const target = weightTargets[val] || (100 / Object.keys(freq).length);
      const actual = (count / total) * 100;
      weights[val] = actual > 0 ? target / actual : 1;
    });

    return { freq, total, weights };
  }, [testType, weightField, responses, weightTargets]);

  const fmt = (n: number, decimals = 4) => Number(n).toFixed(decimals);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Statistical Analysis / 统计分析
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">α =</label>
          <select
            value={significanceLevel}
            onChange={e => setSignificanceLevel(parseFloat(e.target.value))}
            className="px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
          >
            <option value={0.01}>0.01</option>
            <option value={0.05}>0.05</option>
            <option value={0.10}>0.10</option>
          </select>
        </div>
      </div>

      {/* Test type selector / 测试类型选择 */}
      <div className="flex gap-2">
        {[
          { id: 'descriptive' as TestType, label: 'Descriptive / 描述性', icon: BarChart3 },
          { id: 'chi_square' as TestType, label: 'Chi-Square / 卡方', icon: Calculator },
          { id: 't_test' as TestType, label: 'T-Test / T检验', icon: TrendingUp },
          { id: 'weighting' as TestType, label: 'Weighting / 加权', icon: AlertTriangle },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTestType(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition ${
              testType === t.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted/30'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Variable selectors / 变量选择 */}
      <div className="grid grid-cols-2 gap-3">
        {testType === 'descriptive' && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Numeric Variable / 数值变量</label>
            <select value={questionA} onChange={e => setQuestionA(e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
              <option value="">Select... / 选择...</option>
              {numericQuestions.map((q: any) => <option key={q.id} value={q.id}>{q.question_text?.slice(0, 50)}</option>)}
            </select>
          </div>
        )}
        {testType === 'chi_square' && (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Variable A (Categorical) / 变量A</label>
              <select value={questionA} onChange={e => setQuestionA(e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                <option value="">Select... / 选择...</option>
                {categoricalQuestions.map((q: any) => <option key={q.id} value={q.id}>{q.question_text?.slice(0, 50)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Variable B (Categorical) / 变量B</label>
              <select value={questionB} onChange={e => setQuestionB(e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                <option value="">Select... / 选择...</option>
                {categoricalQuestions.map((q: any) => <option key={q.id} value={q.id}>{q.question_text?.slice(0, 50)}</option>)}
              </select>
            </div>
          </>
        )}
        {testType === 't_test' && (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Variable A (Numeric) / 变量A</label>
              <select value={questionA} onChange={e => setQuestionA(e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                <option value="">Select... / 选择...</option>
                {numericQuestions.map((q: any) => <option key={q.id} value={q.id}>{q.question_text?.slice(0, 50)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Variable B (Numeric) / 变量B</label>
              <select value={questionB} onChange={e => setQuestionB(e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                <option value="">Select... / 选择...</option>
                {numericQuestions.map((q: any) => <option key={q.id} value={q.id}>{q.question_text?.slice(0, 50)}</option>)}
              </select>
            </div>
          </>
        )}
        {testType === 'weighting' && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Weight by / 按此加权</label>
            <select value={weightField} onChange={e => setWeightField(e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
              <option value="">Select... / 选择...</option>
              {categoricalQuestions.map((q: any) => <option key={q.id} value={q.id}>{q.question_text?.slice(0, 50)}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* DESCRIPTIVE RESULTS / 描述性统计结果 */}
      {descriptiveResult && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium text-foreground">Descriptive Statistics / 描述性统计</div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'N', value: descriptiveResult.n },
              { label: 'Mean / 均值', value: fmt(descriptiveResult.mean, 2) },
              { label: 'Median / 中位数', value: fmt(descriptiveResult.median, 2) },
              { label: 'Mode / 众数', value: descriptiveResult.mode },
              { label: 'Std Dev / 标准差', value: fmt(descriptiveResult.stdDev, 3) },
              { label: 'Variance / 方差', value: fmt(descriptiveResult.variance, 3) },
              { label: 'Min / 最小', value: fmt(descriptiveResult.min, 2) },
              { label: 'Max / 最大', value: fmt(descriptiveResult.max, 2) },
              { label: 'Range / 范围', value: fmt(descriptiveResult.range, 2) },
              { label: 'Q1 (25%)', value: fmt(descriptiveResult.q1, 2) },
              { label: 'Q3 (75%)', value: fmt(descriptiveResult.q3, 2) },
              { label: 'IQR', value: fmt(descriptiveResult.iqr, 2) },
              { label: 'Skewness / 偏度', value: fmt(descriptiveResult.skewness, 3) },
              { label: 'Kurtosis / 峰度', value: fmt(descriptiveResult.kurtosis, 3) },
              { label: '95% CI Low', value: fmt(descriptiveResult.confidenceInterval95[0], 2) },
              { label: '95% CI High', value: fmt(descriptiveResult.confidenceInterval95[1], 2) },
            ].map(s => (
              <div key={s.label} className="bg-muted/30 rounded p-2">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-sm font-mono font-medium text-foreground">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHI-SQUARE RESULTS / 卡方检验结果 */}
      {chiSquareResult && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium text-foreground">Chi-Square Test / 卡方检验</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded p-3 text-center">
              <div className="text-xs text-muted-foreground">χ² Statistic</div>
              <div className="text-xl font-bold font-mono text-foreground">{fmt(chiSquareResult.statistic, 3)}</div>
            </div>
            <div className="bg-muted/30 rounded p-3 text-center">
              <div className="text-xs text-muted-foreground">df</div>
              <div className="text-xl font-bold font-mono text-foreground">{chiSquareResult.degreesOfFreedom}</div>
            </div>
            <div className={`rounded p-3 text-center ${chiSquareResult.significant ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted/30'}`}>
              <div className="text-xs text-muted-foreground">p-value</div>
              <div className={`text-xl font-bold font-mono ${chiSquareResult.significant ? 'text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                {fmt(chiSquareResult.pValue)}
              </div>
              <div className={`text-xs mt-1 ${chiSquareResult.significant ? 'text-green-600' : 'text-muted-foreground'}`}>
                {chiSquareResult.significant ? '✓ Significant / 显著' : '✗ Not significant / 不显著'}
              </div>
            </div>
          </div>

          {/* Contingency table / 列联表 */}
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2"></th>
                  {chiSquareResult.labels.cols.map(c => <th key={c} className="p-2 text-center font-medium text-muted-foreground">{c.slice(0, 15)}</th>)}
                </tr>
              </thead>
              <tbody>
                {chiSquareResult.labels.rows.map((r, ri) => (
                  <tr key={r} className="border-t border-border">
                    <td className="p-2 font-medium text-foreground">{r.slice(0, 20)}</td>
                    {chiSquareResult.observed[ri].map((obs, ci) => (
                      <td key={ci} className="p-2 text-center">
                        <span className="font-mono">{obs}</span>
                        <span className="text-muted-foreground ml-1">({fmt(chiSquareResult.expected[ri][ci], 1)})</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* T-TEST RESULTS / T检验结果 */}
      {tTestResult && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium text-foreground">Independent Samples T-Test (Welch's) / 独立样本T检验</div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-muted/30 rounded p-3 text-center">
              <div className="text-xs text-muted-foreground">t Statistic</div>
              <div className="text-xl font-bold font-mono text-foreground">{fmt(tTestResult.tStatistic, 3)}</div>
            </div>
            <div className="bg-muted/30 rounded p-3 text-center">
              <div className="text-xs text-muted-foreground">df</div>
              <div className="text-xl font-bold font-mono text-foreground">{fmt(tTestResult.degreesOfFreedom, 1)}</div>
            </div>
            <div className={`rounded p-3 text-center ${tTestResult.significant ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted/30'}`}>
              <div className="text-xs text-muted-foreground">p-value</div>
              <div className={`text-xl font-bold font-mono ${tTestResult.significant ? 'text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                {fmt(tTestResult.pValue)}
              </div>
            </div>
            <div className="bg-muted/30 rounded p-3 text-center">
              <div className="text-xs text-muted-foreground">Cohen's d</div>
              <div className="text-xl font-bold font-mono text-foreground">{fmt(tTestResult.effectSize, 3)}</div>
              <div className="text-xs text-muted-foreground">
                {tTestResult.effectSize < 0.2 ? 'Negligible' : tTestResult.effectSize < 0.5 ? 'Small' : tTestResult.effectSize < 0.8 ? 'Medium' : 'Large'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded p-3">
              <div className="text-xs text-muted-foreground mb-1">Group A / 组A</div>
              <div className="text-sm">M = {fmt(tTestResult.meanA, 2)}, SD = {fmt(tTestResult.stdA, 3)}, n = {tTestResult.nA}</div>
            </div>
            <div className="bg-muted/30 rounded p-3">
              <div className="text-xs text-muted-foreground mb-1">Group B / 组B</div>
              <div className="text-sm">M = {fmt(tTestResult.meanB, 2)}, SD = {fmt(tTestResult.stdB, 3)}, n = {tTestResult.nB}</div>
            </div>
          </div>
        </div>
      )}

      {/* WEIGHTING RESULTS / 加权结果 */}
      {weightingResult && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium text-foreground">Response Weights / 响应加权</div>
          <div className="text-xs text-muted-foreground mb-2">Set target percentages for each category / 为每个类别设置目标百分比</div>
          <div className="space-y-2">
            {Object.entries(weightingResult.freq).map(([val, count]) => {
              const actualPct = (count / weightingResult.total) * 100;
              const targetPct = weightTargets[val] ?? Math.round(100 / Object.keys(weightingResult.freq).length);
              const weight = weightingResult.weights[val] || 1;
              return (
                <div key={val} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                  <span className="text-sm font-medium text-foreground flex-1">{val}</span>
                  <span className="text-xs text-muted-foreground">n={count}</span>
                  <span className="text-xs text-muted-foreground">Actual: {actualPct.toFixed(1)}%</span>
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-muted-foreground">Target:</label>
                    <input
                      type="number"
                      value={targetPct}
                      onChange={e => setWeightTargets(prev => ({ ...prev, [val]: parseFloat(e.target.value) || 0 }))}
                      className="w-16 px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
                      min={0} max={100} step={1}
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    Math.abs(weight - 1) < 0.1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    weight > 1.5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    w={weight.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!descriptiveResult && !chiSquareResult && !tTestResult && !weightingResult && (
        <div className="p-8 text-center text-muted-foreground">
          Select variables above to run analysis / 选择上方变量以运行分析
        </div>
      )}
    </div>
  );
};

export default StatisticalAnalysis;
