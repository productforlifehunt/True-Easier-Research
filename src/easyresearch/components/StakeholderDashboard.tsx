import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { PieChart, BarChart3, TrendingUp, Users, Clock, Target, Download, Share2, Eye, FileText } from 'lucide-react';

// Stakeholder Dashboard – Executive summary view for sharing with non-researchers
// 利益相关者仪表板 – 面向非研究人员的执行摘要视图

interface Props {
  projectId: string;
  questionnaires: any[];
}

const StakeholderDashboard: React.FC<Props> = ({ projectId, questionnaires }) => {
  const [responses, setResponses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareMode, setShareMode] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [{ data: respData }, { data: enrollData }] = await Promise.all([
        supabase.from('survey_response').select('*').eq('project_id', projectId),
        supabase.from('enrollment').select('*').eq('project_id', projectId),
      ]);
      setResponses(respData || []);
      setEnrollments(enrollData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Compute executive metrics / 计算执行指标
  const metrics = useMemo(() => {
    const totalParticipants = enrollments.length;
    const activeParticipants = enrollments.filter(e => e.status === 'active').length;
    const completedParticipants = enrollments.filter(e => e.status === 'completed').length;
    const totalResponses = responses.length;
    const totalQuestions = questionnaires.flatMap(q => q.questions || []).length;

    // Completion rate / 完成率
    const byEnrollment = new Map<string, number>();
    responses.forEach(r => {
      const key = r.enrollment_id || 'anon';
      byEnrollment.set(key, (byEnrollment.get(key) || 0) + 1);
    });
    const completionRates = Array.from(byEnrollment.values()).map(count => Math.min(100, Math.round(count / Math.max(1, totalQuestions) * 100)));
    const avgCompletion = completionRates.length > 0 ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length) : 0;

    // Response timeline / 响应时间线
    const dailyCounts: Record<string, number> = {};
    responses.forEach(r => {
      const day = r.created_at?.split('T')[0];
      if (day) dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });
    const timeline = Object.entries(dailyCounts).sort(([a], [b]) => a.localeCompare(b)).slice(-14);

    // NPS-like satisfaction estimate from numeric responses / 从数值响应估算类NPS满意度
    const numericValues = responses.filter(r => r.response_value != null && !isNaN(Number(r.response_value))).map(r => Number(r.response_value));
    const avgScore = numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : 0;

    // Top questionnaires by response count / 按响应数排名的问卷
    const qCounts: Record<string, number> = {};
    responses.forEach(r => {
      const qc = questionnaires.find(q => (q.questions || []).some((qq: any) => qq.id === r.question_id));
      if (qc) qCounts[qc.title] = (qCounts[qc.title] || 0) + 1;
    });
    const topQuestionnaires = Object.entries(qCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

    return {
      totalParticipants,
      activeParticipants,
      completedParticipants,
      totalResponses,
      avgCompletion,
      avgScore: avgScore.toFixed(1),
      timeline,
      topQuestionnaires,
      enrollmentRate: totalParticipants > 0 ? Math.round(completedParticipants / totalParticipants * 100) : 0,
    };
  }, [responses, enrollments, questionnaires]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <PieChart size={22} className="text-emerald-600" />
            Stakeholder Dashboard / 利益相关者仪表板
          </h2>
          <p className="text-sm text-stone-500 mt-1">Executive summary for sharing with stakeholders / 面向利益相关者的执行摘要</p>
        </div>
        <button onClick={() => setShareMode(!shareMode)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${shareMode ? 'bg-emerald-500 text-white' : 'border border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
          <Share2 size={14} /> {shareMode ? 'Exit Share Mode' : 'Share View / 分享视图'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <Users size={20} className="opacity-60 mb-2" />
          <div className="text-3xl font-bold">{metrics.totalParticipants}</div>
          <div className="text-xs opacity-70 mt-1">Total Participants / 总参与者</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
          <BarChart3 size={20} className="opacity-60 mb-2" />
          <div className="text-3xl font-bold">{metrics.totalResponses.toLocaleString()}</div>
          <div className="text-xs opacity-70 mt-1">Total Responses / 总响应</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl p-5 text-white">
          <Target size={20} className="opacity-60 mb-2" />
          <div className="text-3xl font-bold">{metrics.avgCompletion}%</div>
          <div className="text-xs opacity-70 mt-1">Avg Completion / 平均完成率</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
          <TrendingUp size={20} className="opacity-60 mb-2" />
          <div className="text-3xl font-bold">{metrics.avgScore}</div>
          <div className="text-xs opacity-70 mt-1">Avg Score / 平均分数</div>
        </div>
      </div>

      {/* Response Trend / 响应趋势 */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> Response Trend (Last 14 Days) / 响应趋势（最近14天）
        </h3>
        <div className="flex items-end gap-1 h-32">
          {metrics.timeline.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-sm text-stone-400">No data / 暂无数据</div>
          )}
          {metrics.timeline.map(([date, count]) => {
            const maxCount = Math.max(1, ...metrics.timeline.map(([, c]) => c as number));
            return (
              <div key={date} className="flex-1 flex flex-col items-center" title={`${date}: ${count}`}>
                <div className="w-full bg-gradient-to-t from-emerald-400 to-teal-300 rounded-t-sm transition-all" style={{ height: `${((count as number) / maxCount) * 100}%`, minHeight: '4px' }} />
                <div className="text-[8px] text-stone-400 mt-1 transform -rotate-45">{(date as string).slice(5)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participant Pipeline / 参与者管道 */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <Users size={16} /> Participant Pipeline / 参与者管道
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Enrolled / 已注册', count: metrics.totalParticipants, color: 'bg-blue-400', pct: 100 },
              { label: 'Active / 活跃', count: metrics.activeParticipants, color: 'bg-emerald-400', pct: metrics.totalParticipants > 0 ? Math.round(metrics.activeParticipants / metrics.totalParticipants * 100) : 0 },
              { label: 'Completed / 已完成', count: metrics.completedParticipants, color: 'bg-purple-400', pct: metrics.enrollmentRate },
            ].map(step => (
              <div key={step.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">{step.label}</span>
                  <span className="text-stone-800 font-semibold">{step.count} ({step.pct}%)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-3">
                  <div className={`${step.color} h-3 rounded-full transition-all`} style={{ width: `${step.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Questionnaires / 热门问卷 */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <FileText size={16} /> Top Questionnaires / 热门问卷
          </h3>
          {metrics.topQuestionnaires.length === 0 && <p className="text-sm text-stone-400">No data / 暂无数据</p>}
          <div className="space-y-2">
            {metrics.topQuestionnaires.map(([title, count], i) => {
              const maxCount = metrics.topQuestionnaires[0]?.[1] as number || 1;
              const COLORS = ['bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-pink-400'];
              return (
                <div key={title}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-stone-600 truncate">{title as string}</span>
                    <span className="text-stone-800 font-medium">{count as number}</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div className={`${COLORS[i % COLORS.length]} h-2 rounded-full`} style={{ width: `${((count as number) / (maxCount as number)) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Insights Summary / 关键洞察摘要 */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Quick Insights / 快速洞察</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <div className="text-xs text-emerald-700 font-medium">Collection Status / 收集状态</div>
            <div className="text-sm text-emerald-800 mt-1">
              {metrics.totalParticipants > 0
                ? `${metrics.avgCompletion}% average completion rate across ${metrics.totalParticipants} participants`
                : 'No participants yet / 暂无参与者'}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-xs text-blue-700 font-medium">Data Volume / 数据量</div>
            <div className="text-sm text-blue-800 mt-1">
              {metrics.totalResponses.toLocaleString()} responses across {questionnaires.length} questionnaires
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-xs text-purple-700 font-medium">📈 Trend / 趋势</div>
            <div className="text-sm text-purple-800 mt-1">
              {metrics.timeline.length > 1
                ? `${(metrics.timeline[metrics.timeline.length - 1][1] as number)} responses on latest day`
                : 'Building trend data / 正在积累趋势数据'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderDashboard;
