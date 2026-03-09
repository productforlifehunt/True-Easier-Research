import React, { useState, useMemo } from 'react';
import { Calculator, BarChart3, Target, Info, TrendingUp, Zap } from 'lucide-react';

// Statistical power analysis calculator for research sample size planning
// 研究样本量规划的统计功效分析计算器

interface Props {
  projectId: string;
}

type TestType = 't_test_two' | 't_test_paired' | 'anova' | 'chi_square' | 'correlation' | 'regression' | 'proportion';

const TEST_CONFIGS: Record<TestType, { label: string; labelCn: string; description: string }> = {
  t_test_two: { label: 'Two-Sample T-Test', labelCn: '双样本T检验', description: 'Compare means between two independent groups' },
  t_test_paired: { label: 'Paired T-Test', labelCn: '配对T检验', description: 'Compare means within same subjects' },
  anova: { label: 'One-Way ANOVA', labelCn: '单因素方差分析', description: 'Compare means across 3+ groups' },
  chi_square: { label: 'Chi-Square Test', labelCn: '卡方检验', description: 'Test association between categorical variables' },
  correlation: { label: 'Correlation', labelCn: '相关分析', description: 'Test significance of correlation coefficient' },
  regression: { label: 'Multiple Regression', labelCn: '多元回归', description: 'Predict outcome from multiple predictors' },
  proportion: { label: 'Two Proportions', labelCn: '双比例检验', description: 'Compare proportions between two groups' },
};

const EFFECT_SIZES = [
  { label: 'Small / 小', value: 0.2, cohen: "Cohen's d = 0.2" },
  { label: 'Medium / 中', value: 0.5, cohen: "Cohen's d = 0.5" },
  { label: 'Large / 大', value: 0.8, cohen: "Cohen's d = 0.8" },
  { label: 'Custom / 自定义', value: -1, cohen: 'Custom' },
];

// Normal distribution inverse CDF approximation (Abramowitz & Stegun)
// 正态分布逆CDF近似
const normInv = (p: number): number => {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0,
    -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
};

// Calculate required sample size per group
// 计算每组所需样本量
const calculateSampleSize = (
  testType: TestType,
  effectSize: number,
  alpha: number,
  power: number,
  groups: number = 2,
  predictors: number = 2,
): number => {
  const zAlpha = normInv(1 - alpha / 2);
  const zBeta = normInv(power);

  switch (testType) {
    case 't_test_two':
      return Math.ceil(2 * ((zAlpha + zBeta) / effectSize) ** 2);
    case 't_test_paired':
      return Math.ceil(((zAlpha + zBeta) / effectSize) ** 2);
    case 'anova': {
      const f = effectSize / Math.sqrt(groups);
      const n = Math.ceil(((zAlpha + zBeta) / f) ** 2);
      return n;
    }
    case 'chi_square': {
      const w = effectSize;
      return Math.ceil(((zAlpha + zBeta) / w) ** 2);
    }
    case 'correlation': {
      const z = 0.5 * Math.log((1 + effectSize) / (1 - Math.min(effectSize, 0.99)));
      return Math.ceil(((zAlpha + zBeta) / z) ** 2 + 3);
    }
    case 'regression':
      return Math.ceil((((zAlpha + zBeta) ** 2) * (1 - effectSize ** 2)) / (effectSize ** 2) + predictors);
    case 'proportion': {
      const p1 = 0.5 + effectSize / 2;
      const p2 = 0.5 - effectSize / 2;
      const pBar = (p1 + p2) / 2;
      return Math.ceil(((zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) / (p1 - p2)) ** 2);
    }
    default:
      return Math.ceil(2 * ((zAlpha + zBeta) / effectSize) ** 2);
  }
};

// Generate power curve data for chart visualization
// 生成功效曲线数据用于图表可视化
const generatePowerCurve = (
  testType: TestType,
  effectSize: number,
  alpha: number,
  groups: number,
  predictors: number,
): { n: number; power: number }[] => {
  const points: { n: number; power: number }[] = [];
  for (let n = 5; n <= 500; n += 5) {
    const zAlpha = normInv(1 - alpha / 2);
    let noncentrality: number;
    switch (testType) {
      case 't_test_two':
        noncentrality = effectSize * Math.sqrt(n / 2);
        break;
      case 't_test_paired':
        noncentrality = effectSize * Math.sqrt(n);
        break;
      default:
        noncentrality = effectSize * Math.sqrt(n / 2);
    }
    // Approximate power using normal approximation
    const power = Math.min(0.999, Math.max(0.01,
      1 - 0.5 * (1 + erf((zAlpha - noncentrality) / Math.sqrt(2)))
    ));
    points.push({ n, power: Math.round(power * 1000) / 10 });
  }
  return points;
};

// Error function approximation
const erf = (x: number): number => {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
};

const PowerAnalysisCalculator: React.FC<Props> = ({ projectId }) => {
  const [testType, setTestType] = useState<TestType>('t_test_two');
  const [effectSizePreset, setEffectSizePreset] = useState(0.5);
  const [customEffectSize, setCustomEffectSize] = useState(0.5);
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.8);
  const [groups, setGroups] = useState(3);
  const [predictors, setPredictors] = useState(3);
  const [attritionRate, setAttritionRate] = useState(15);
  const [showCurve, setShowCurve] = useState(false);

  const effectSize = effectSizePreset === -1 ? customEffectSize : effectSizePreset;

  const result = useMemo(() => {
    const perGroup = calculateSampleSize(testType, effectSize, alpha, power, groups, predictors);
    const totalGroups = ['t_test_two', 'proportion'].includes(testType) ? 2 : testType === 'anova' ? groups : 1;
    const total = perGroup * totalGroups;
    const withAttrition = Math.ceil(total / (1 - attritionRate / 100));
    return { perGroup, totalGroups, total, withAttrition };
  }, [testType, effectSize, alpha, power, groups, predictors, attritionRate]);

  const powerCurveData = useMemo(() => {
    if (!showCurve) return [];
    return generatePowerCurve(testType, effectSize, alpha, groups, predictors);
  }, [showCurve, testType, effectSize, alpha, groups, predictors]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Calculator size={22} className="text-emerald-600" />
            Power Analysis Calculator / 功效分析计算器
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Determine optimal sample size for statistical significance / 确定统计显著性的最佳样本量
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Test Type / 检验类型 */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-3">Statistical Test / 统计检验</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.entries(TEST_CONFIGS) as [TestType, typeof TEST_CONFIGS[TestType]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setTestType(key)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    testType === key
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-sm font-medium text-stone-800">{cfg.label}</div>
                  <div className="text-xs text-stone-400">{cfg.labelCn}</div>
                  <div className="text-xs text-stone-500 mt-1">{cfg.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters / 参数设置 */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">Parameters / 参数</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Effect Size / 效应量 */}
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1.5 block">
                  Effect Size / 效应量
                </label>
                <div className="space-y-2">
                  {EFFECT_SIZES.map(es => (
                    <label key={es.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={effectSizePreset === es.value}
                        onChange={() => setEffectSizePreset(es.value)}
                        className="text-emerald-600"
                      />
                      <span className="text-sm text-stone-700">{es.label}</span>
                      <span className="text-xs text-stone-400">{es.cohen}</span>
                    </label>
                  ))}
                  {effectSizePreset === -1 && (
                    <input
                      type="number"
                      value={customEffectSize}
                      onChange={e => setCustomEffectSize(parseFloat(e.target.value) || 0.1)}
                      step={0.05}
                      min={0.01}
                      max={2}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Alpha & Power / 显著性水平与功效 */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1.5 block">
                    Significance Level (α) / 显著性水平
                  </label>
                  <select
                    value={alpha}
                    onChange={e => setAlpha(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  >
                    <option value={0.01}>α = 0.01 (99% confidence)</option>
                    <option value={0.05}>α = 0.05 (95% confidence)</option>
                    <option value={0.10}>α = 0.10 (90% confidence)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1.5 block">
                    Statistical Power (1−β) / 统计功效
                  </label>
                  <select
                    value={power}
                    onChange={e => setPower(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  >
                    <option value={0.70}>70%</option>
                    <option value={0.80}>80% (standard)</option>
                    <option value={0.90}>90%</option>
                    <option value={0.95}>95%</option>
                    <option value={0.99}>99%</option>
                  </select>
                </div>
                {testType === 'anova' && (
                  <div>
                    <label className="text-xs font-medium text-stone-600 mb-1.5 block">
                      Number of Groups / 组数
                    </label>
                    <input
                      type="number"
                      value={groups}
                      onChange={e => setGroups(parseInt(e.target.value) || 3)}
                      min={3}
                      max={10}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    />
                  </div>
                )}
                {testType === 'regression' && (
                  <div>
                    <label className="text-xs font-medium text-stone-600 mb-1.5 block">
                      Number of Predictors / 预测变量数
                    </label>
                    <input
                      type="number"
                      value={predictors}
                      onChange={e => setPredictors(parseInt(e.target.value) || 2)}
                      min={1}
                      max={20}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1.5 block">
                    Expected Attrition Rate / 预期流失率
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      value={attritionRate}
                      onChange={e => setAttritionRate(parseInt(e.target.value))}
                      min={0}
                      max={60}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono text-stone-700 w-12 text-right">{attritionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Power Curve / 功效曲线 */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-stone-700">Power Curve / 功效曲线</h3>
              <button
                onClick={() => setShowCurve(!showCurve)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {showCurve ? 'Hide / 隐藏' : 'Show / 显示'}
              </button>
            </div>
            {showCurve && (
              <div className="h-48 flex items-end gap-px">
                {powerCurveData.filter((_, i) => i % 2 === 0).map((pt, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center" title={`n=${pt.n}, power=${pt.power}%`}>
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        pt.power >= power * 100 ? 'bg-emerald-400' : 'bg-stone-300'
                      }`}
                      style={{ height: `${pt.power / 100 * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
            {showCurve && (
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-stone-400">n=5</span>
                <span className="text-[10px] text-stone-400">n=250</span>
                <span className="text-[10px] text-stone-400">n=500</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Panel / 结果面板 */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="text-sm font-medium opacity-80 mb-1">Required Sample Size / 所需样本量</div>
            <div className="text-4xl font-bold">{result.withAttrition.toLocaleString()}</div>
            <div className="text-xs opacity-70 mt-1">
              including {attritionRate}% attrition buffer / 含{attritionRate}%流失缓冲
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-stone-700">Breakdown / 明细</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Per group / 每组</span>
                <span className="font-semibold text-stone-800">{result.perGroup}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Groups / 组数</span>
                <span className="font-semibold text-stone-800">{result.totalGroups}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-stone-100 pt-2">
                <span className="text-stone-500">Minimum total / 最小总数</span>
                <span className="font-semibold text-stone-800">{result.total}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-stone-100 pt-2">
                <span className="text-stone-500">With attrition / 含流失</span>
                <span className="font-bold text-emerald-600">{result.withAttrition}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-2">
            <h3 className="text-sm font-semibold text-stone-700">Configuration / 配置</h3>
            <div className="text-xs text-stone-500 space-y-1">
              <div>Test: {TEST_CONFIGS[testType].label}</div>
              <div>Effect size: d = {effectSize}</div>
              <div>α = {alpha}, Power = {(power * 100).toFixed(0)}%</div>
              <div>Attrition: {attritionRate}%</div>
            </div>
          </div>

          {/* Interpretation / 解释 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800 space-y-1">
                <p><strong>Interpretation / 解释:</strong></p>
                <p>
                  With {result.withAttrition} participants, your study has a {(power * 100).toFixed(0)}% chance of
                  detecting a {effectSize >= 0.8 ? 'large' : effectSize >= 0.5 ? 'medium' : 'small'} effect
                  at the {alpha} significance level.
                </p>
                <p>
                  在{result.withAttrition}名参与者的情况下，您的研究有{(power * 100).toFixed(0)}%的概率
                  在{alpha}显著性水平下检测到{effectSize >= 0.8 ? '大' : effectSize >= 0.5 ? '中等' : '小'}效应。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerAnalysisCalculator;
