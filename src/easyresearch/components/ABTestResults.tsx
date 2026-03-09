import React, { useState, useMemo } from 'react';
import { FlaskConical, TrendingUp, TrendingDown, Minus, Trophy, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  responses: number;
  completionRate: number;
  avgTime: number;
  dropoffRate: number;
  satisfaction: number;
  conversionRate: number;
}

interface Props {
  projectId: string;
}

// A/B Test results dashboard with statistical significance testing
// A/B测试结果仪表板，含统计显著性检验
const ABTestResults: React.FC<Props> = ({ projectId }) => {
  const [selectedMetric, setSelectedMetric] = useState<'completionRate' | 'avgTime' | 'dropoffRate' | 'satisfaction' | 'conversionRate'>('completionRate');
  const [confidenceLevel, setConfidenceLevel] = useState(95);

  // Mock A/B test data / 模拟A/B测试数据
  const variants: Variant[] = useMemo(() => [
    { id: 'a', name: 'Control (A)', responses: 523, completionRate: 72.4, avgTime: 285, dropoffRate: 27.6, satisfaction: 3.8, conversionRate: 12.3 },
    { id: 'b', name: 'Variant B', responses: 498, completionRate: 78.9, avgTime: 245, dropoffRate: 21.1, satisfaction: 4.1, conversionRate: 15.7 },
    { id: 'c', name: 'Variant C', responses: 511, completionRate: 75.2, avgTime: 262, dropoffRate: 24.8, satisfaction: 3.9, conversionRate: 13.8 },
  ], []);

  const metrics = [
    { key: 'completionRate', label: 'Completion Rate / 完成率', unit: '%', higherBetter: true },
    { key: 'avgTime', label: 'Avg Time / 平均时间', unit: 's', higherBetter: false },
    { key: 'dropoffRate', label: 'Drop-off Rate / 流失率', unit: '%', higherBetter: false },
    { key: 'satisfaction', label: 'Satisfaction / 满意度', unit: '/5', higherBetter: true },
    { key: 'conversionRate', label: 'Conversion / 转化率', unit: '%', higherBetter: true },
  ];

  // Statistical significance calculation / 统计显著性计算
  const calcSignificance = (controlVal: number, variantVal: number, controlN: number, variantN: number) => {
    const p1 = controlVal / 100;
    const p2 = variantVal / 100;
    const pooledP = (p1 * controlN + p2 * variantN) / (controlN + variantN);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / controlN + 1 / variantN));
    if (se === 0) return { zScore: 0, pValue: 1, significant: false };
    const z = Math.abs(p2 - p1) / se;
    // Approximate p-value / 近似p值
    const pValue = z > 2.576 ? 0.01 : z > 1.96 ? 0.05 : z > 1.645 ? 0.1 : 0.5;
    const threshold = confidenceLevel === 99 ? 0.01 : confidenceLevel === 95 ? 0.05 : 0.1;
    return { zScore: Math.round(z * 100) / 100, pValue, significant: pValue <= threshold };
  };

  const control = variants[0];
  const currentMetric = metrics.find(m => m.key === selectedMetric)!;

  // Winner determination / 确定胜者
  const winner = useMemo(() => {
    const sorted = [...variants].sort((a, b) => {
      const aVal = (a as any)[selectedMetric];
      const bVal = (b as any)[selectedMetric];
      return currentMetric.higherBetter ? bVal - aVal : aVal - bVal;
    });
    return sorted[0];
  }, [variants, selectedMetric, currentMetric]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FlaskConical size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">A/B Test Results / A/B测试结果</h2>
            <p className="text-xs text-stone-500">Statistical comparison of test variants / 测试变体的统计比较</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Confidence / 置信度:</span>
          {[90, 95, 99].map(cl => (
            <button key={cl} onClick={() => setConfidenceLevel(cl)}
              className={`px-2 py-1 text-xs rounded ${confidenceLevel === cl ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
              {cl}%
            </button>
          ))}
        </div>
      </div>

      {/* Winner banner / 胜者横幅 */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <Trophy size={20} className="text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Current Leader: {winner.name} / 当前领先: {winner.name}
          </p>
          <p className="text-xs text-emerald-600">
            {currentMetric.label}: {(winner as any)[selectedMetric]}{currentMetric.unit}
          </p>
        </div>
      </div>

      {/* Metric selector / 指标选择器 */}
      <div className="flex flex-wrap gap-2">
        {metrics.map(m => (
          <button key={m.key} onClick={() => setSelectedMetric(m.key as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedMetric === m.key ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Variant comparison cards / 变体比较卡片 */}
      <div className="grid gap-4 sm:grid-cols-3">
        {variants.map((v, i) => {
          const val = (v as any)[selectedMetric] as number;
          const controlVal = (control as any)[selectedMetric] as number;
          const diff = val - controlVal;
          const diffPct = controlVal !== 0 ? ((diff / controlVal) * 100) : 0;
          const sig = i > 0 ? calcSignificance(controlVal, val, control.responses, v.responses) : null;
          const isWinner = v.id === winner.id;
          const improved = currentMetric.higherBetter ? diff > 0 : diff < 0;

          return (
            <div key={v.id} className={`bg-white rounded-xl border p-5 ${isWinner ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-stone-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  <h4 className="text-sm font-bold text-stone-700">{v.name}</h4>
                </div>
                {isWinner && <Trophy size={14} className="text-amber-500" />}
              </div>

              <div className="text-3xl font-bold text-stone-800 mb-1">
                {val}{currentMetric.unit}
              </div>

              {i > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  {improved ? <TrendingUp size={14} className="text-emerald-500" /> : diff === 0 ? <Minus size={14} className="text-stone-400" /> : <TrendingDown size={14} className="text-red-500" />}
                  <span className={`text-xs font-semibold ${improved ? 'text-emerald-600' : diff === 0 ? 'text-stone-400' : 'text-red-500'}`}>
                    {diff > 0 ? '+' : ''}{Math.round(diffPct * 10) / 10}% vs Control
                  </span>
                </div>
              )}

              <div className="text-xs text-stone-500 mb-2">{v.responses} responses / 回复</div>

              {sig && (
                <div className={`px-2 py-1 rounded text-[10px] font-semibold inline-flex items-center gap-1 ${sig.significant ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {sig.significant ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                  {sig.significant ? `Significant (p<${sig.pValue})` : 'Not significant'}
                </div>
              )}

              {/* All metrics mini table / 所有指标迷你表 */}
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5">
                {metrics.map(m => (
                  <div key={m.key} className="flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">{m.label.split('/')[0].trim()}</span>
                    <span className={`text-[10px] font-semibold ${m.key === selectedMetric ? 'text-emerald-600' : 'text-stone-600'}`}>
                      {(v as any)[m.key]}{m.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual comparison bar chart / 可视化比较柱状图 */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h4 className="text-sm font-semibold text-stone-700 mb-4">{currentMetric.label} Comparison / 比较</h4>
        <div className="space-y-3">
          {variants.map((v, i) => {
            const val = (v as any)[selectedMetric] as number;
            const maxVal = Math.max(...variants.map(vv => (vv as any)[selectedMetric] as number));
            const width = (val / maxVal) * 100;
            const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500'];
            return (
              <div key={v.id} className="flex items-center gap-3">
                <span className="text-xs text-stone-500 w-24 shrink-0">{v.name}</span>
                <div className="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colors[i]} transition-all`} style={{ width: `${width}%` }} />
                </div>
                <span className="text-xs font-semibold text-stone-700 w-16 text-right">{val}{currentMetric.unit}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Need the import
import { CheckCircle2 } from 'lucide-react';

export default ABTestResults;
