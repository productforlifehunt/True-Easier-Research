/**
 * Advanced Question Analytics — Per-question-type visualizations
 * 高级问题分析 — 按题型定制可视化
 * 
 * Renders specialized analytics for each question type:
 * NPS: Gauge + promoter/passive/detractor breakdown
 * Likert/Scale: Stacked distribution bar
 * Heatmap: Click coordinate overlay
 * Card Sort: Agreement matrix
 * Conjoint: Utility scores
 * Kano: Classification matrix
 * SUS: Score gauge with grade
 * CSAT/CES: Emoji distribution
 * MaxDiff: Best-Worst preference ranking
 * Cross-tab: Breakdown by segment
 */
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface AdvancedQuestionAnalyticsProps {
  questionType: string;
  responses: any[];
  questionConfig?: Record<string, any>;
  options?: string[];
}

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];
const NPS_COLORS = { promoter: '#10b981', passive: '#f59e0b', detractor: '#ef4444' };

const AdvancedQuestionAnalytics: React.FC<AdvancedQuestionAnalyticsProps> = ({
  questionType, responses, questionConfig, options
}) => {
  // === NPS Analysis / NPS 分析 ===
  const npsData = useMemo(() => {
    if (questionType !== 'nps') return null;
    const values = responses.map(r => parseFloat(r.response_value ?? r.response_text)).filter(v => !isNaN(v));
    const promoters = values.filter(v => v >= 9).length;
    const passives = values.filter(v => v >= 7 && v < 9).length;
    const detractors = values.filter(v => v < 7).length;
    const total = values.length || 1;
    const score = Math.round(((promoters - detractors) / total) * 100);
    return {
      score,
      promoters: Math.round((promoters / total) * 100),
      passives: Math.round((passives / total) * 100),
      detractors: Math.round((detractors / total) * 100),
      total: values.length,
      distribution: Array.from({ length: 11 }, (_, i) => ({
        score: i, count: values.filter(v => v === i).length
      }))
    };
  }, [questionType, responses]);

  // === SUS Score / SUS 分数 ===
  const susData = useMemo(() => {
    if (questionType !== 'sus') return null;
    const values = responses.map(r => {
      try { return JSON.parse(r.response_text || r.response_value); } catch { return null; }
    }).filter(v => v && typeof v === 'object' && v.score != null);
    if (values.length === 0) return null;
    const scores = values.map((v: any) => v.score);
    const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    const grade = avg >= 80.3 ? 'A' : avg >= 68 ? 'B' : avg >= 51 ? 'C' : avg >= 25.1 ? 'D' : 'F';
    return { avgScore: avg.toFixed(1), grade, count: values.length, scores };
  }, [questionType, responses]);

  // === CSAT / CSAT 分析 ===
  const csatData = useMemo(() => {
    if (questionType !== 'csat') return null;
    const values = responses.map(r => parseFloat(r.response_value ?? r.response_text)).filter(v => !isNaN(v));
    const emojis = ['😡', '😞', '😐', '😊', '😍'];
    const dist = Array.from({ length: 5 }, (_, i) => ({
      label: emojis[i], value: i + 1,
      count: values.filter(v => v === i + 1).length
    }));
    const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '0';
    const satisfied = values.filter(v => v >= 4).length;
    const csatScore = values.length > 0 ? Math.round((satisfied / values.length) * 100) : 0;
    return { distribution: dist, avg, csatScore, total: values.length };
  }, [questionType, responses]);

  // === CES / CES 分析 ===
  const cesData = useMemo(() => {
    if (questionType !== 'ces') return null;
    const values = responses.map(r => parseFloat(r.response_value ?? r.response_text)).filter(v => !isNaN(v));
    const cesColors = ['#ef4444', '#f97316', '#f59e0b', '#fbbf24', '#a3e635', '#22c55e', '#10b981'];
    const dist = Array.from({ length: 7 }, (_, i) => ({
      value: i + 1, count: values.filter(v => v === i + 1).length, color: cesColors[i]
    }));
    const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '0';
    return { distribution: dist, avg, total: values.length };
  }, [questionType, responses]);

  // === Likert/Scale distribution / 量表分布 ===
  const scaleData = useMemo(() => {
    if (!['likert_scale', 'rating', 'slider', 'bipolar_scale'].includes(questionType)) return null;
    const values = responses.map(r => parseFloat(r.response_value ?? r.response_text)).filter(v => !isNaN(v));
    if (values.length === 0) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
    const dist: Record<number, number> = {};
    values.forEach(v => { dist[v] = (dist[v] || 0) + 1; });
    const chartData = Object.entries(dist).map(([k, v]) => ({ value: Number(k), count: v })).sort((a, b) => a.value - b.value);
    return { avg, median, min, max, total: values.length, distribution: chartData, stdDev: Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - parseFloat(avg), 2), 0) / values.length).toFixed(2) };
  }, [questionType, responses]);

  // === Quality Flags Summary / 质量标记摘要 ===
  const qualityData = useMemo(() => {
    const flagResponses = responses.filter(r => r.question_id === '__quality_flags__' || (r.response_text && r.response_text.includes('speeder')));
    if (flagResponses.length === 0) return null;
    const flags: Record<string, number> = {};
    flagResponses.forEach(r => {
      try {
        const arr = JSON.parse(r.response_text || '[]');
        (Array.isArray(arr) ? arr : []).forEach((f: string) => { flags[f] = (flags[f] || 0) + 1; });
      } catch { /* skip */ }
    });
    return Object.keys(flags).length > 0 ? flags : null;
  }, [responses]);

  // === MaxDiff Best-Worst / MaxDiff 最优最差 ===
  const maxDiffData = useMemo(() => {
    if (questionType !== 'max_diff') return null;
    const bestCounts: Record<string, number> = {};
    const worstCounts: Record<string, number> = {};
    responses.forEach(r => {
      try {
        const val = typeof r.response_value === 'string' ? JSON.parse(r.response_value) : r.response_value;
        if (val?.best) bestCounts[val.best] = (bestCounts[val.best] || 0) + 1;
        if (val?.worst) worstCounts[val.worst] = (worstCounts[val.worst] || 0) + 1;
      } catch { /* skip */ }
    });
    const allItems = [...new Set([...Object.keys(bestCounts), ...Object.keys(worstCounts)])];
    return allItems.map(item => ({
      item, best: bestCounts[item] || 0, worst: worstCounts[item] || 0,
      bwScore: (bestCounts[item] || 0) - (worstCounts[item] || 0)
    })).sort((a, b) => b.bwScore - a.bwScore);
  }, [questionType, responses]);

  // === Kano Classification / Kano 分类 ===
  const kanoData = useMemo(() => {
    if (questionType !== 'kano') return null;
    const classifications: Record<string, number> = {
      'Must-be': 0, 'One-dimensional': 0, 'Attractive': 0, 'Indifferent': 0, 'Reverse': 0, 'Questionable': 0
    };
    responses.forEach(r => {
      try {
        const val = typeof r.response_value === 'string' ? JSON.parse(r.response_value) : r.response_value;
        if (val?.classification && classifications[val.classification] !== undefined) {
          classifications[val.classification]++;
        }
      } catch { /* skip */ }
    });
    return Object.entries(classifications).map(([name, count]) => ({ name, count }));
  }, [questionType, responses]);

  // Render based on type / 按类型渲染
  return (
    <div className="space-y-4">
      {/* NPS Gauge */}
      {npsData && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`text-5xl font-bold ${npsData.score >= 50 ? 'text-emerald-500' : npsData.score >= 0 ? 'text-amber-500' : 'text-red-500'}`}>
                {npsData.score > 0 ? '+' : ''}{npsData.score}
              </div>
              <p className="text-xs text-stone-400 mt-1">NPS Score</p>
            </div>
            <div className="flex gap-4">
              {[
                { label: 'Promoters (9-10)', pct: npsData.promoters, color: NPS_COLORS.promoter },
                { label: 'Passives (7-8)', pct: npsData.passives, color: NPS_COLORS.passive },
                { label: 'Detractors (0-6)', pct: npsData.detractors, color: NPS_COLORS.detractor },
              ].map(seg => (
                <div key={seg.label} className="text-center">
                  <div className="text-lg font-semibold" style={{ color: seg.color }}>{seg.pct}%</div>
                  <p className="text-[10px] text-stone-400">{seg.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={npsData.distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {npsData.distribution.map((d, i) => (
                    <Cell key={i} fill={d.score >= 9 ? NPS_COLORS.promoter : d.score >= 7 ? NPS_COLORS.passive : NPS_COLORS.detractor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SUS Score Gauge / SUS 评分仪表 */}
      {susData && (
        <div className="text-center space-y-3">
          <div className="inline-flex items-baseline gap-2">
            <span className="text-5xl font-bold text-emerald-600">{susData.avgScore}</span>
            <span className="text-2xl font-bold text-stone-300">/100</span>
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            susData.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
            susData.grade === 'B' ? 'bg-blue-100 text-blue-700' :
            susData.grade === 'C' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            Grade {susData.grade}
          </div>
          <p className="text-xs text-stone-400">{susData.count} responses / {susData.count} 份回复</p>
          {/* Progress bar */}
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400" style={{ width: `${Math.min(100, parseFloat(susData.avgScore))}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>0 (Worst)</span><span>50</span><span>100 (Best)</span>
          </div>
        </div>
      )}

      {/* CSAT Emoji Distribution */}
      {csatData && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">{csatData.csatScore}%</div>
              <p className="text-xs text-stone-400">CSAT Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-stone-600">{csatData.avg}</div>
              <p className="text-xs text-stone-400">Avg / 平均</p>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            {csatData.distribution.map((d, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-1">{d.label}</div>
                <div className="text-sm font-semibold text-stone-700">{d.count}</div>
                <div className="w-12 h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${csatData.total > 0 ? (d.count / csatData.total) * 100 : 0}%`,
                    backgroundColor: COLORS[i % COLORS.length]
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CES Effort Scale */}
      {cesData && (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600">{cesData.avg}</div>
            <p className="text-xs text-stone-400">Avg Effort Score / 平均努力分数</p>
          </div>
          <div className="flex justify-center gap-1.5">
            {cesData.distribution.map((d, i) => (
              <div key={i} className="text-center flex-1 max-w-[60px]">
                <div className="text-[11px] font-semibold text-stone-600 mb-1">{d.count}</div>
                <div className="h-20 bg-stone-50 rounded relative overflow-hidden">
                  <div className="absolute bottom-0 w-full rounded transition-all" style={{
                    height: `${cesData.total > 0 ? (d.count / cesData.total) * 100 : 0}%`,
                    backgroundColor: d.color
                  }} />
                </div>
                <div className="text-[10px] text-stone-400 mt-1">{d.value}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 px-2">
            <span>Very Difficult / 非常困难</span><span>Very Easy / 非常简单</span>
          </div>
        </div>
      )}

      {/* Scale/Likert Distribution */}
      {scaleData && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Mean / 均值', value: scaleData.avg },
              { label: 'Median / 中位', value: scaleData.median },
              { label: 'Std Dev / 标准差', value: scaleData.stdDev },
              { label: 'n', value: scaleData.total },
            ].map(m => (
              <div key={m.label} className="text-center p-2 bg-stone-50 rounded-lg">
                <div className="text-lg font-semibold text-stone-800">{m.value}</div>
                <div className="text-[10px] text-stone-400">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scaleData.distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="value" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MaxDiff Best-Worst Ranking / MaxDiff 排名 */}
      {maxDiffData && maxDiffData.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Best-Worst Preference Ranking / 最优最差偏好排名</p>
          <div className="space-y-1.5">
            {maxDiffData.map((item, i) => (
              <div key={item.item} className="flex items-center gap-3 text-[12px]">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>{i + 1}</span>
                <span className="flex-1 text-stone-700 truncate">{item.item}</span>
                <span className="text-emerald-600 font-medium w-8 text-right">+{item.best}</span>
                <span className="text-red-500 font-medium w-8 text-right">-{item.worst}</span>
                <span className={`font-bold w-10 text-right ${item.bwScore > 0 ? 'text-emerald-600' : item.bwScore < 0 ? 'text-red-500' : 'text-stone-400'}`}>
                  {item.bwScore > 0 ? '+' : ''}{item.bwScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kano Classification Matrix / Kano 分类矩阵 */}
      {kanoData && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Kano Feature Classification / Kano 特性分类</p>
          <div className="grid grid-cols-3 gap-2">
            {kanoData.filter(d => d.count > 0).map((d, i) => (
              <div key={d.name} className="text-center p-3 rounded-xl" style={{ backgroundColor: `${COLORS[i % COLORS.length]}15` }}>
                <div className="text-xl font-bold" style={{ color: COLORS[i % COLORS.length] }}>{d.count}</div>
                <div className="text-[10px] text-stone-500 mt-0.5">{d.name}</div>
              </div>
            ))}
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={kanoData.filter(d => d.count > 0)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} style={{ fontSize: 10 }}>
                  {kanoData.filter(d => d.count > 0).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quality Flags / 质量标记 */}
      {qualityData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
          <p className="text-xs font-semibold text-amber-700 mb-2">⚠️ Response Quality Flags / 回复质量标记</p>
          <div className="flex gap-3">
            {Object.entries(qualityData).map(([flag, count]) => (
              <div key={flag} className="text-center px-3 py-2 bg-white rounded-lg border border-amber-100">
                <div className="text-lg font-bold text-amber-600">{count}</div>
                <div className="text-[10px] text-amber-500 capitalize">{flag}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedQuestionAnalytics;
