import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart } from 'recharts';
import { TrendingDown, Users, AlertTriangle, Clock, ArrowDown } from 'lucide-react';
import type { QuestionnaireConfig } from './QuestionnaireList';

// Funnel / Drop-off Analysis — visualize where participants abandon surveys
// 漏斗 / 流失分析 — 可视化参与者在哪里放弃调查
interface Props {
  projectId: string;
  questionnaires: QuestionnaireConfig[];
}

interface FunnelStep {
  name: string;
  shortName: string;
  questionId: string;
  total: number;
  dropoff: number;
  dropoffRate: number;
  avgTimeSeconds: number;
}

const FunnelAnalysis: React.FC<Props> = ({ projectId, questionnaires }) => {
  const [responses, setResponses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: respData }, { data: enrollData }] = await Promise.all([
        supabase.from('survey_response').select('*').eq('project_id', projectId),
        supabase.from('enrollment').select('id, status, created_at').eq('project_id', projectId),
      ]);
      setResponses(respData || []);
      setEnrollments(enrollData || []);
    } catch (e) {
      console.error('Error loading funnel data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Build funnel data per questionnaire / 按问卷构建漏斗数据
  const funnelData = useMemo(() => {
    const targetQuestionnaires = selectedQuestionnaire === 'all' 
      ? questionnaires 
      : questionnaires.filter(q => q.id === selectedQuestionnaire);

    const allSteps: FunnelStep[] = [];
    const totalParticipants = enrollments.length;

    targetQuestionnaires.forEach(qc => {
      const questions = (qc.questions || [])
        .filter((q: any) => !['section_header', 'divider', 'text_block', 'image_block', 'instruction'].includes(q.question_type))
        .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

      questions.forEach((q: any, idx: number) => {
        const respondents = new Set(
          responses.filter(r => r.question_id === q.id).map(r => r.enrollment_id)
        );
        
        const prevRespondents = idx > 0 
          ? new Set(responses.filter(r => r.question_id === questions[idx - 1].id).map(r => r.enrollment_id))
          : new Set(enrollments.map(e => e.id));
        
        const prevCount = prevRespondents.size;
        const currentCount = respondents.size;
        const dropoff = Math.max(0, prevCount - currentCount);
        const dropoffRate = prevCount > 0 ? (dropoff / prevCount) * 100 : 0;

        // Average time from response timings
        const timingResponses = responses.filter(r => r.question_id === '__question_timings__');
        let totalTime = 0;
        let timeCount = 0;
        timingResponses.forEach(r => {
          try {
            const timings = typeof r.response_value === 'string' ? JSON.parse(r.response_value) : r.response_value;
            if (timings && timings[q.id]) {
              totalTime += timings[q.id];
              timeCount++;
            }
          } catch { /* ignore */ }
        });

        allSteps.push({
          name: q.question_text || `Q${idx + 1}`,
          shortName: `Q${idx + 1}`,
          questionId: q.id,
          total: currentCount,
          dropoff,
          dropoffRate: Math.round(dropoffRate * 10) / 10,
          avgTimeSeconds: timeCount > 0 ? Math.round(totalTime / timeCount) : 0,
        });
      });
    });

    return allSteps;
  }, [questionnaires, responses, enrollments, selectedQuestionnaire]);

  // Summary stats / 摘要统计
  const summaryStats = useMemo(() => {
    if (funnelData.length === 0) return { completionRate: 0, worstDropoff: null as FunnelStep | null, avgTime: 0 };
    const startCount = enrollments.length;
    const endCount = funnelData[funnelData.length - 1]?.total || 0;
    const completionRate = startCount > 0 ? Math.round((endCount / startCount) * 100) : 0;
    const worstDropoff = funnelData.reduce((worst, step) => 
      step.dropoffRate > (worst?.dropoffRate || 0) ? step : worst, funnelData[0]);
    const avgTime = funnelData.length > 0 
      ? Math.round(funnelData.reduce((s, d) => s + d.avgTimeSeconds, 0) / funnelData.length) : 0;
    return { completionRate, worstDropoff, avgTime };
  }, [funnelData, enrollments]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading funnel... / 加载漏斗分析...</div>;

  return (
    <div className="space-y-4">
      {/* Header / 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Funnel & Drop-off Analysis / 漏斗与流失分析
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Identify where participants abandon your survey / 识别参与者在哪里放弃调查
          </p>
        </div>
        <select
          value={selectedQuestionnaire}
          onChange={e => setSelectedQuestionnaire(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
        >
          <option value="all">All Questionnaires / 所有问卷</option>
          {questionnaires.map(q => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </select>
      </div>

      {/* Summary cards / 摘要卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <div className="text-2xl font-bold text-foreground">{summaryStats.completionRate}%</div>
          <div className="text-xs text-muted-foreground">Completion Rate / 完成率</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-amber-500" />
          <div className="text-2xl font-bold text-foreground">{summaryStats.worstDropoff?.dropoffRate || 0}%</div>
          <div className="text-xs text-muted-foreground">Worst Drop-off / 最高流失</div>
          {summaryStats.worstDropoff && (
            <div className="text-[10px] text-amber-600 mt-1 truncate">{summaryStats.worstDropoff.shortName}: {summaryStats.worstDropoff.name.slice(0, 30)}</div>
          )}
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-purple-500" />
          <div className="text-2xl font-bold text-foreground">{summaryStats.avgTime}s</div>
          <div className="text-xs text-muted-foreground">Avg Time/Question / 平均用时</div>
        </div>
      </div>

      {/* Funnel visualization / 漏斗可视化 */}
      {funnelData.length > 0 ? (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium text-foreground mb-3">Response Funnel / 回复漏斗</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="shortName" width={40} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload as FunnelStep;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 text-sm shadow-lg">
                      <div className="font-medium text-foreground">{data.name}</div>
                      <div className="text-muted-foreground">Responded: {data.total}</div>
                      <div className="text-red-500">Drop-off: {data.dropoff} ({data.dropoffRate}%)</div>
                      {data.avgTimeSeconds > 0 && <div className="text-muted-foreground">Avg time: {data.avgTimeSeconds}s</div>}
                    </div>
                  );
                }}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
          No response data yet / 暂无回复数据
        </div>
      )}

      {/* Drop-off table / 流失表格 */}
      {funnelData.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Step / 步骤</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Question / 问题</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Responded / 回复</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Drop-off / 流失</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Rate / 比率</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Avg Time / 平均用时</th>
              </tr>
            </thead>
            <tbody>
              {funnelData.map((step, i) => (
                <tr key={step.questionId} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{step.shortName}</td>
                  <td className="p-3 text-foreground truncate max-w-[200px]">{step.name}</td>
                  <td className="p-3 text-center font-mono">{step.total}</td>
                  <td className="p-3 text-center">
                    {step.dropoff > 0 ? (
                      <span className="text-red-500 flex items-center justify-center gap-1">
                        <ArrowDown className="w-3 h-3" /> {step.dropoff}
                      </span>
                    ) : <span className="text-green-500">0</span>}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      step.dropoffRate > 20 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      step.dropoffRate > 10 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {step.dropoffRate}%
                    </span>
                  </td>
                  <td className="p-3 text-center text-xs text-muted-foreground">
                    {step.avgTimeSeconds > 0 ? `${step.avgTimeSeconds}s` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FunnelAnalysis;
