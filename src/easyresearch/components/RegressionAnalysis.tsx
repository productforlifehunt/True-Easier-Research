import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart3, Sigma, Table, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface Variable { id: string; name: string; type: 'continuous' | 'categorical' | 'ordinal'; }
interface RegressionResult { coefficient: number; stdError: number; tStat: number; pValue: number; ci95: [number, number]; }

interface Props { projectId: string; }

const RegressionAnalysis: React.FC<Props> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'regression' | 'correlation' | 'anova'>('regression');
  const [dependentVar, setDependentVar] = useState('satisfaction');
  const [independentVars, setIndependentVars] = useState<Set<string>>(new Set(['age', 'usage_frequency']));
  const [regressionType, setRegressionType] = useState<'ols' | 'logistic' | 'ordinal'>('ols');
  const [correlationMethod, setCorrelationMethod] = useState<'pearson' | 'spearman' | 'kendall'>('pearson');

  const variables: Variable[] = [
    { id: 'satisfaction', name: 'Satisfaction Score', type: 'continuous' },
    { id: 'age', name: 'Age', type: 'continuous' },
    { id: 'usage_frequency', name: 'Usage Frequency', type: 'ordinal' },
    { id: 'task_time', name: 'Task Completion Time', type: 'continuous' },
    { id: 'error_count', name: 'Error Count', type: 'continuous' },
    { id: 'sus_score', name: 'SUS Score', type: 'continuous' },
    { id: 'nps', name: 'NPS Rating', type: 'ordinal' },
    { id: 'experience_level', name: 'Experience Level', type: 'categorical' },
  ];

  // Generate mock regression results / 生成模拟回归结果
  const regressionResults = useMemo(() => {
    const results: Record<string, RegressionResult> = {};
    const intercept = 2.5 + Math.random() * 2;
    results['(Intercept)'] = { coefficient: intercept, stdError: 0.45, tStat: intercept / 0.45, pValue: 0.001, ci95: [intercept - 0.88, intercept + 0.88] };
    independentVars.forEach(v => {
      const coef = (Math.random() - 0.3) * 2;
      const se = 0.1 + Math.random() * 0.3;
      const t = coef / se;
      const p = Math.abs(t) > 2.58 ? 0.01 : Math.abs(t) > 1.96 ? 0.05 : Math.abs(t) > 1.65 ? 0.1 : 0.3 + Math.random() * 0.5;
      results[v] = { coefficient: coef, stdError: se, tStat: t, pValue: p, ci95: [coef - 1.96 * se, coef + 1.96 * se] };
    });
    return results;
  }, [independentVars]);

  const rSquared = 0.45 + Math.random() * 0.3;
  const adjRSquared = rSquared - 0.02;
  const fStat = 12.5 + Math.random() * 10;

  // Correlation matrix / 相关矩阵
  const corrVars = variables.filter(v => v.type === 'continuous' || v.type === 'ordinal').slice(0, 6);
  const correlationMatrix = useMemo(() => {
    return corrVars.map((_, i) => corrVars.map((_, j) => i === j ? 1.0 : parseFloat(((Math.random() - 0.3) * 1.4).toFixed(2))));
  }, [corrVars.length]);

  const getSignificanceStars = (p: number) => p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : p < 0.1 ? '†' : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-teal-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Regression & Correlation / 回归与相关分析</h2>
            <p className="text-sm text-stone-500">Advanced statistical analysis / 高级统计分析</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['regression', 'correlation', 'anova'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'regression' ? 'Regression' : v === 'correlation' ? 'Correlation' : 'ANOVA'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'regression' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Model Config / 模型配置 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-stone-800">Model Configuration / 模型配置</h3>
              <div>
                <label className="text-xs text-stone-600 mb-1 block">Regression Type / 回归类型</label>
                <select value={regressionType} onChange={e => setRegressionType(e.target.value as any)}
                  className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2">
                  <option value="ols">OLS Linear Regression / 普通最小二乘线性回归</option>
                  <option value="logistic">Logistic Regression / 逻辑回归</option>
                  <option value="ordinal">Ordinal Regression / 有序回归</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-600 mb-1 block">Dependent Variable (Y) / 因变量</label>
                <select value={dependentVar} onChange={e => setDependentVar(e.target.value)}
                  className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2">
                  {variables.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-600 mb-1 block">Independent Variables (X) / 自变量</label>
                <div className="space-y-1">
                  {variables.filter(v => v.id !== dependentVar).map(v => (
                    <label key={v.id} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                      <input type="checkbox" checked={independentVars.has(v.id)} onChange={() => { const next = new Set(independentVars); next.has(v.id) ? next.delete(v.id) : next.add(v.id); setIndependentVars(next); }}
                        className="rounded text-teal-600" />
                      {v.name} <span className="text-[10px] text-stone-400">({v.type})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Table / 结果表 */}
            <div className="col-span-2 space-y-3">
              <h3 className="font-semibold text-stone-800">Regression Results / 回归结果</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-3 bg-teal-50 rounded-xl"><div className="text-xs text-stone-500">R²</div><div className="text-lg font-bold text-teal-700">{rSquared.toFixed(3)}</div></div>
                <div className="p-3 bg-teal-50 rounded-xl"><div className="text-xs text-stone-500">Adj. R²</div><div className="text-lg font-bold text-teal-700">{adjRSquared.toFixed(3)}</div></div>
                <div className="p-3 bg-teal-50 rounded-xl"><div className="text-xs text-stone-500">F-statistic</div><div className="text-lg font-bold text-teal-700">{fStat.toFixed(2)}***</div></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-stone-200">
                    <th className="text-left py-2 px-3 text-stone-600 text-xs">Variable</th>
                    <th className="text-right py-2 px-3 text-stone-600 text-xs">Coef (β)</th>
                    <th className="text-right py-2 px-3 text-stone-600 text-xs">Std Err</th>
                    <th className="text-right py-2 px-3 text-stone-600 text-xs">t-stat</th>
                    <th className="text-right py-2 px-3 text-stone-600 text-xs">p-value</th>
                    <th className="text-right py-2 px-3 text-stone-600 text-xs">95% CI</th>
                    <th className="text-center py-2 px-3 text-stone-600 text-xs">Sig</th>
                  </tr></thead>
                  <tbody>
                    {Object.entries(regressionResults).map(([name, r]) => (
                      <tr key={name} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-2 px-3 font-medium text-stone-800">{variables.find(v => v.id === name)?.name || name}</td>
                        <td className="py-2 px-3 text-right font-mono">
                          <span className={`flex items-center justify-end gap-1 ${r.coefficient > 0 ? 'text-emerald-600' : r.coefficient < 0 ? 'text-red-600' : 'text-stone-500'}`}>
                            {r.coefficient > 0 ? <ArrowUpRight className="w-3 h-3" /> : r.coefficient < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            {r.coefficient.toFixed(4)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-stone-600">{r.stdError.toFixed(4)}</td>
                        <td className="py-2 px-3 text-right font-mono text-stone-600">{r.tStat.toFixed(3)}</td>
                        <td className={`py-2 px-3 text-right font-mono ${r.pValue < 0.05 ? 'text-teal-700 font-bold' : 'text-stone-500'}`}>{r.pValue < 0.001 ? '<.001' : r.pValue.toFixed(3)}</td>
                        <td className="py-2 px-3 text-right font-mono text-xs text-stone-500">[{r.ci95[0].toFixed(3)}, {r.ci95[1].toFixed(3)}]</td>
                        <td className="py-2 px-3 text-center font-bold text-amber-600">{getSignificanceStars(r.pValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[10px] text-stone-400">Significance: *** p{'<'}0.001, ** p{'<'}0.01, * p{'<'}0.05, † p{'<'}0.1 / 显著性水平</div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'correlation' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-stone-800">Correlation Matrix / 相关矩阵</h3>
            <select value={correlationMethod} onChange={e => setCorrelationMethod(e.target.value as any)}
              className="text-xs border border-stone-200 rounded-lg px-2 py-1">
              <option value="pearson">Pearson (linear)</option>
              <option value="spearman">Spearman (rank)</option>
              <option value="kendall">Kendall (concordance)</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="text-xs">
              <thead><tr><th className="p-2" />{corrVars.map(v => <th key={v.id} className="p-2 text-stone-500 max-w-[80px]"><div className="truncate -rotate-45 origin-bottom-left w-20">{v.name}</div></th>)}</tr></thead>
              <tbody>
                {corrVars.map((v, i) => (
                  <tr key={v.id}>
                    <td className="p-2 font-medium text-stone-700 whitespace-nowrap">{v.name}</td>
                    {correlationMatrix[i].map((corr, j) => {
                      const abs = Math.abs(corr);
                      const bg = i === j ? 'bg-stone-100' : abs > 0.7 ? (corr > 0 ? 'bg-teal-500 text-white' : 'bg-red-500 text-white') : abs > 0.4 ? (corr > 0 ? 'bg-teal-200 text-teal-900' : 'bg-red-200 text-red-900') : 'bg-stone-50 text-stone-500';
                      return <td key={j} className="p-1"><div className={`w-14 h-10 rounded flex items-center justify-center font-mono text-[11px] font-bold ${bg}`}>{i === j ? '1.00' : corr.toFixed(2)}</div></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-500">
            <span>Color scale / 颜色标度:</span>
            <div className="flex items-center gap-1"><div className="w-4 h-4 bg-red-500 rounded" /> Strong negative</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 bg-red-200 rounded" /> Moderate negative</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 bg-stone-50 rounded border" /> Weak/None</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 bg-teal-200 rounded" /> Moderate positive</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 bg-teal-500 rounded" /> Strong positive</div>
          </div>
        </div>
      )}

      {activeView === 'anova' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-stone-800">ANOVA Results / 方差分析结果</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-stone-200">
                <th className="text-left py-2 px-3 text-stone-600 text-xs">Source</th>
                <th className="text-right py-2 px-3 text-stone-600 text-xs">df</th>
                <th className="text-right py-2 px-3 text-stone-600 text-xs">Sum Sq</th>
                <th className="text-right py-2 px-3 text-stone-600 text-xs">Mean Sq</th>
                <th className="text-right py-2 px-3 text-stone-600 text-xs">F-value</th>
                <th className="text-right py-2 px-3 text-stone-600 text-xs">p-value</th>
                <th className="text-right py-2 px-3 text-stone-600 text-xs">η²</th>
              </tr></thead>
              <tbody>
                {[
                  { source: 'Age Group', df: 3, ss: 45.2, ms: 15.07, f: 8.92, p: 0.001, eta: 0.18 },
                  { source: 'Experience Level', df: 2, ss: 32.8, ms: 16.40, f: 9.71, p: 0.001, eta: 0.13 },
                  { source: 'Interaction', df: 6, ss: 12.4, ms: 2.07, f: 1.22, p: 0.301, eta: 0.05 },
                  { source: 'Residual', df: 88, ss: 148.6, ms: 1.69, f: NaN, p: NaN, eta: NaN },
                ].map(row => (
                  <tr key={row.source} className="border-b border-stone-100">
                    <td className="py-2 px-3 font-medium text-stone-800">{row.source}</td>
                    <td className="py-2 px-3 text-right font-mono">{row.df}</td>
                    <td className="py-2 px-3 text-right font-mono">{row.ss.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono">{row.ms.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono">{isNaN(row.f) ? '-' : row.f.toFixed(2)}</td>
                    <td className={`py-2 px-3 text-right font-mono ${!isNaN(row.p) && row.p < 0.05 ? 'text-teal-700 font-bold' : 'text-stone-500'}`}>{isNaN(row.p) ? '-' : row.p < 0.001 ? '<.001' : row.p.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right font-mono">{isNaN(row.eta) ? '-' : row.eta.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-teal-50 rounded-xl">
            <h4 className="text-xs font-semibold text-teal-800 mb-2">Post-hoc Tests (Tukey HSD) / 事后检验</h4>
            <div className="space-y-1 text-xs">
              {[
                { comparison: '18-25 vs 26-35', diff: 1.24, p: 0.042, sig: true },
                { comparison: '18-25 vs 36-45', diff: 2.15, p: 0.003, sig: true },
                { comparison: '18-25 vs 46+', diff: 0.89, p: 0.215, sig: false },
                { comparison: '26-35 vs 36-45', diff: 0.91, p: 0.187, sig: false },
              ].map(test => (
                <div key={test.comparison} className="flex items-center gap-3">
                  <span className="text-stone-700 w-36">{test.comparison}</span>
                  <span className="font-mono">Δ={test.diff.toFixed(2)}</span>
                  <span className={`font-mono ${test.sig ? 'text-teal-700 font-bold' : 'text-stone-500'}`}>p={test.p.toFixed(3)}</span>
                  <span>{test.sig ? '✓ Significant' : '✗ NS'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegressionAnalysis;
