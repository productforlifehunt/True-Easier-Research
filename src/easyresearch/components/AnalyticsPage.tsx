import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalSurveys: 0, activeParticipants: 0, totalResponses: 0, completionRate: 0, recentResponses: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/easyresearch/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data: researcher } = await supabase.from('researcher').select('id').eq('user_id', user.id).maybeSingle();
      const { data: projects } = await supabase.from('research_project').select('id').eq('researcher_id', researcher?.id);
      const projectIds = (projects || []).map((p: any) => p.id).filter(Boolean);

      if (projectIds.length === 0) {
        setStats({ totalSurveys: 0, activeParticipants: 0, totalResponses: 0, completionRate: 0, recentResponses: [] });
        return;
      }

      const { data: enrollments } = await supabase.from('enrollment').select('id, participant_id, participant_email, status, project_id').in('project_id', projectIds);
      const { count: totalResponseCount } = await supabase.from('survey_respons').select('id', { count: 'exact', head: true }).in('project_id', projectIds);
      const { data: responses } = await supabase.from('survey_respons').select('id, created_at, question_id, enrollment_id, response_text, response_value')
        .in('project_id', projectIds).order('created_at', { ascending: false }).limit(10);

      const recent = (responses || []) as any[];
      const questionIds = Array.from(new Set(recent.map((r: any) => r.question_id).filter(Boolean)));
      const enrollmentIds = Array.from(new Set(recent.map((r: any) => r.enrollment_id).filter(Boolean)));

      const [{ data: questionsData }, { data: enrollmentsForRecent }] = await Promise.all([
        questionIds.length ? supabase.from('survey_question').select('id, question_text, question_type').in('id', questionIds) : Promise.resolve({ data: [] as any[] } as any),
        enrollmentIds.length ? supabase.from('enrollment').select('id, participant_email').in('id', enrollmentIds) : Promise.resolve({ data: [] as any[] } as any)
      ]);

      const questionById = new Map((questionsData || []).map((q: any) => [q.id, q]));
      const enrollmentById = new Map((enrollmentsForRecent || []).map((e: any) => [e.id, e]));
      const enrichedRecent = recent.map((r: any) => ({
        ...r, survey_question: questionById.get(r.question_id), enrollment: enrollmentById.get(r.enrollment_id)
      }));

      const activeParticipants = new Set((enrollments || []).map((e: any) => e.participant_id || e.participant_email).filter(Boolean)).size;
      const completedSurveys = enrollments?.filter(e => e.status === 'completed').length || 0;
      const completionRate = enrollments?.length ? Math.round((completedSurveys / enrollments.length) * 100) : 0;

      setStats({ totalSurveys: projects?.length || 0, activeParticipants, totalResponses: totalResponseCount || 0, completionRate, recentResponses: enrichedRecent });
    } catch (error) { console.error('Error loading analytics:', error); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-6">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Surveys', value: stats.totalSurveys, icon: BarChart3 },
          { label: 'Participants', value: stats.activeParticipants, icon: Users },
          { label: 'Responses', value: stats.totalResponses, icon: TrendingUp },
          { label: 'Completion', value: `${stats.completionRate}%`, icon: Activity },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100">
            <s.icon size={16} className="text-indigo-500 mb-3" strokeWidth={1.5} />
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{s.value}</p>
            <p className="text-[12px] text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-[15px] font-semibold text-slate-900">Recent Responses</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent mx-auto"></div>
          </div>
        ) : stats.recentResponses.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {stats.recentResponses.map((response: any) => (
              <div key={response.id} className="px-5 py-3.5">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[13px] font-medium text-slate-900">
                    {response.survey_question?.question_text || 'Question'}
                  </p>
                  <span className="shrink-0 ml-3 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-600">
                    {response.survey_question?.question_type || 'response'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 mb-1 font-light">
                  {(response.response_text && String(response.response_text).trim().length > 0)
                    ? response.response_text
                    : (response.response_value !== null && response.response_value !== undefined)
                      ? (typeof response.response_value === 'string' ? response.response_value
                        : Array.isArray(response.response_value) ? response.response_value.join(', ')
                        : JSON.stringify(response.response_value))
                      : ''}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-300">
                  <span>{response.enrollment?.participant_email || 'Anonymous'}</span>
                  <span>·</span>
                  <span>{new Date(response.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <BarChart3 className="mx-auto mb-3 text-slate-200" size={32} />
            <p className="text-[13px] text-slate-400 font-light">No responses yet. Share your surveys to start collecting data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
