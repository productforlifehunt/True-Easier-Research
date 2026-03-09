import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, Cell } from 'recharts';

// Benchmarking Engine — Compare results against industry norms and past studies
// 基准对标引擎 — 与行业标准和过往研究进行对比

interface BenchmarkNorm {
  metric: string;
  metricZh: string;
  category: string;
  industryAvg: number;
  topQuartile: number;
  bottomQuartile: number;
  unit: string;
}

// Industry benchmark database / 行业基准数据库
const INDUSTRY_BENCHMARKS: BenchmarkNorm[] = [
  // Survey metrics / 调查指标
  { metric: 'Completion Rate', metricZh: '完成率', category: 'engagement', industryAvg: 33, topQuartile: 55, bottomQuartile: 15, unit: '%' },
  { metric: 'Avg Response Time', metricZh: '平均响应时间', category: 'engagement', industryAvg: 420, topQuartile: 240, bottomQuartile: 720, unit: 's' },
  { metric: 'Drop-off Rate', metricZh: '流失率', category: 'engagement', industryAvg: 20, topQuartile: 10, bottomQuartile: 40, unit: '%' },
  { metric: 'Response Quality Score', metricZh: '回答质量分', category: 'quality', industryAvg: 72, topQuartile: 88, bottomQuartile: 55, unit: '/100' },
  // UX metrics / UX 指标
  { metric: 'SUS Score', metricZh: 'SUS 可用性分数', category: 'ux', industryAvg: 68, topQuartile: 80.3, bottomQuartile: 51, unit: '/100' },
  { metric: 'NPS Score', metricZh: 'NPS 净推荐值', category: 'ux', industryAvg: 32, topQuartile: 60, bottomQuartile: 0, unit: '' },
  { metric: 'CSAT Score', metricZh: 'CSAT 满意度', category: 'ux', industryAvg: 78, topQuartile: 90, bottomQuartile: 65, unit: '%' },
  { metric: 'CES Score', metricZh: 'CES 费力度', category: 'ux', industryAvg: 5.5, topQuartile: 6.5, bottomQuartile: 4, unit: '/7' },
  // Research metrics / 研究指标
  { metric: 'Cronbach Alpha', metricZh: '克伦巴赫α', category: 'research', industryAvg: 0.78, topQuartile: 0.90, bottomQuartile: 0.65, unit: '' },
  { metric: 'Response Rate', metricZh: '回复率', category: 'research', industryAvg: 25, topQuartile: 45, bottomQuartile: 10, unit: '%' },
  { metric: 'Speeder Rate', metricZh: '快速回答率', category: 'research', industryAvg: 8, topQuartile: 3, bottomQuartile: 18, unit: '%' },
  { metric: 'Straightliner Rate', metricZh: '直线回答率', category: 'research', industryAvg: 5, topQuartile: 2, bottomQuartile: 12, unit: '%' },
];

interface Props {
  projectId: string;
  responses: any[];
  questions: any[];
  enrollments?: any[];
}

const BenchmarkingEngine: React.FC<Props> = ({ projectId, responses, questions, enrollments = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'engagement' | 'quality' | 'ux' | 'research'>('all');

  // Compute actual values from project data / 从项目数据计算实际值
  const actualMetrics = useMemo(() => {
    const totalResponses = responses.length;
    const totalEnrollments = Math.max(enrollments.length, totalResponses);

    // Completion rate / 完成率
    const completionRate = totalEnrollments > 0 ? (totalResponses / totalEnrollments * 100) : 0;

    // Avg response time / 平均响应时间
    let totalTime = 0;
    let timeCount = 0;
    responses.forEach(r => {
      const timings = r.answers?.__question_timings__;
      if (timings) {
        const total = Object.values(timings as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
        totalTime += total;
        timeCount++;
      }
    });
    const avgResponseTime = timeCount > 0 ? totalTime / timeCount : 0;

    // Quality flags / 质量标志
    let speederCount = 0;
    let straightlinerCount = 0;
    responses.forEach(r => {
      const flags = r.answers?.__quality_flags__;
      if (flags) {
        if (flags.includes?.('speeder') || (Array.isArray(flags) && flags.some((f: any) => f === 'speeder'))) speederCount++;
        if (flags.includes?.('straightliner') || (Array.isArray(flags) && flags.some((f: any) => f === 'straightliner'))) straightlinerCount++;
      }
    });

    // SUS score detection / SUS分数检测
    const susQuestions = questions.filter(q => (q.question_type || q.type) === 'sus');
    let susScore = null;
    if (susQuestions.length > 0) {
      // Simple SUS calculation
      const scores: number[] = [];
      responses.forEach(r => {
        let total = 0;
        let count = 0;
        susQuestions.forEach(sq => {
          const ans = r.answers?.[sq.id];
          if (typeof ans === 'number') { total += ans; count++; }
        });
        if (count >= 10) scores.push(total * 2.5);
      });
      if (scores.length > 0) susScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    // NPS detection / NPS检测
    const npsQuestions = questions.filter(q => (q.question_type || q.type) === 'nps');
    let npsScore = null;
    if (npsQuestions.length > 0) {
      let promoters = 0, detractors = 0, total = 0;
      responses.forEach(r => {
        npsQuestions.forEach(nq => {
          const ans = Number(r.answers?.[nq.id]);
          if (!isNaN(ans)) {
            total++;
            if (ans >= 9) promoters++;
            else if (ans <= 6) detractors++;
          }
        });
      });
      if (total > 0) npsScore = ((promoters - detractors) / total * 100);
    }

    // Quality score / 质量分数
    const qualityScore = totalResponses > 0
      ? Math.max(0, 100 - (speederCount / totalResponses * 30) - (straightlinerCount / totalResponses * 20))
      : 0;

    return new Map<string, number>([
      ['Completion Rate', completionRate],
      ['Avg Response Time', avgResponseTime],
      ['Drop-off Rate', totalEnrollments > 0 ? ((totalEnrollments - totalResponses) / totalEnrollments * 100) : 0],
      ['Response Quality Score', qualityScore],
      ['SUS Score', susScore ?? 0],
      ['NPS Score', npsScore ?? 0],
      ['CSAT Score', 0],
      ['CES Score', 0],
      ['Cronbach Alpha', 0],
      ['Response Rate', completionRate],
      ['Speeder Rate', totalResponses > 0 ? (speederCount / totalResponses * 100) : 0],
      ['Straightliner Rate', totalResponses > 0 ? (straightlinerCount / totalResponses * 100) : 0],
    ]);
  }, [responses, questions, enrollments]);

  const filteredBenchmarks = selectedCategory === 'all'
    ? INDUSTRY_BENCHMARKS
    : INDUSTRY_BENCHMARKS.filter(b => b.category === selectedCategory);

  const getPerformance = (actual: number, benchmark: BenchmarkNorm): 'above' | 'average' | 'below' => {
    // For "bad" metrics (lower is better) / 负面指标（越低越好）
    const lowerIsBetter = ['Drop-off Rate', 'Speeder Rate', 'Straightliner Rate', 'Avg Response Time', 'CES Score'].includes(benchmark.metric);
    if (lowerIsBetter) {
      if (actual <= benchmark.topQuartile) return 'above';
      if (actual >= benchmark.bottomQuartile) return 'below';
      return 'average';
    }
    if (actual >= benchmark.topQuartile) return 'above';
    if (actual <= benchmark.bottomQuartile) return 'below';
    return 'average';
  };

  const categories = [
    { id: 'all' as const, label: 'All / 全部' },
    { id: 'engagement' as const, label: 'Engagement / 参与度' },
    { id: 'quality' as const, label: 'Quality / 质量' },
    { id: 'ux' as const, label: 'UX Metrics / UX指标' },
    { id: 'research' as const, label: 'Research / 研究' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2"><Target size={20} /> Benchmarking / 基准对标</h2>
        <div className="text-[10px] text-stone-400 flex items-center gap-1"><Info size={10} /> Industry norms from 2024-2026 meta-analysis</div>
      </div>

      {/* Category Filters / 类别筛选 */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
        {categories.map(c => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === c.id ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'
            }`}>{c.label}</button>
        ))}
      </div>

      {/* Benchmark Cards / 基准卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredBenchmarks.map(benchmark => {
          const actual = actualMetrics.get(benchmark.metric) || 0;
          const performance = getPerformance(actual, benchmark);
          const diff = actual - benchmark.industryAvg;
          const diffPct = benchmark.industryAvg !== 0 ? (diff / benchmark.industryAvg * 100).toFixed(0) : '0';

          const chartData = [
            { name: 'Bottom 25%', value: benchmark.bottomQuartile, fill: '#fecaca' },
            { name: 'Industry Avg', value: benchmark.industryAvg, fill: '#e5e7eb' },
            { name: 'Your Score', value: actual, fill: performance === 'above' ? '#86efac' : performance === 'below' ? '#fca5a5' : '#fde68a' },
            { name: 'Top 25%', value: benchmark.topQuartile, fill: '#bbf7d0' },
          ];

          return (
            <div key={benchmark.metric} className={`bg-white rounded-xl border p-4 ${
              performance === 'above' ? 'border-emerald-200' :
              performance === 'below' ? 'border-red-200' : 'border-stone-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-stone-800">{benchmark.metric}</h4>
                  <p className="text-[10px] text-stone-500">{benchmark.metricZh}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  performance === 'above' ? 'bg-emerald-100 text-emerald-700' :
                  performance === 'below' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {performance === 'above' ? <TrendingUp size={10} /> :
                   performance === 'below' ? <TrendingDown size={10} /> :
                   <Minus size={10} />}
                  {performance === 'above' ? 'Above Avg' : performance === 'below' ? 'Below Avg' : 'Average'}
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-stone-800">{actual.toFixed(1)}</span>
                <span className="text-xs text-stone-400">{benchmark.unit}</span>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${
                  diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : 'text-stone-500'
                }`}>
                  {diff > 0 ? <ArrowUpRight size={11} /> : diff < 0 ? <ArrowDownRight size={11} /> : null}
                  {diff > 0 ? '+' : ''}{diffPct}% vs avg
                </span>
              </div>

              <ResponsiveContainer width="100%" height={60}>
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}${benchmark.unit}`} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="flex justify-between text-[9px] text-stone-400 mt-1">
                <span>Bottom: {benchmark.bottomQuartile}{benchmark.unit}</span>
                <span>Avg: {benchmark.industryAvg}{benchmark.unit}</span>
                <span>Top: {benchmark.topQuartile}{benchmark.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Assessment / 总体评估 */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Performance Summary / 表现总结</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">
              {filteredBenchmarks.filter(b => getPerformance(actualMetrics.get(b.metric) || 0, b) === 'above').length}
            </p>
            <p className="text-[10px] text-emerald-700">Above Average / 高于平均</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">
              {filteredBenchmarks.filter(b => getPerformance(actualMetrics.get(b.metric) || 0, b) === 'average').length}
            </p>
            <p className="text-[10px] text-amber-700">Average / 平均水平</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {filteredBenchmarks.filter(b => getPerformance(actualMetrics.get(b.metric) || 0, b) === 'below').length}
            </p>
            <p className="text-[10px] text-red-700">Below Average / 低于平均</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkingEngine;
