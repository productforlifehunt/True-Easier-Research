import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, Activity, Download, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeParticipants: 0,
    totalResponses: 0,
    completionRate: 0,
    recentResponses: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/easyresearch/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: researcher } = await supabase
        .from('researcher')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get researcher's projects
      const { data: projects } = await supabase
        .from('research_project')
        .select('id')
        .eq('researcher_id', researcher?.id);

      const projectIds = (projects || []).map((p: any) => p.id).filter(Boolean);

      if (projectIds.length === 0) {
        setStats({
          totalSurveys: 0,
          activeParticipants: 0,
          totalResponses: 0,
          completionRate: 0,
          recentResponses: []
        });
        return;
      }

      // Get all enrollments
      const { data: enrollments } = await supabase
        .from('enrollment')
        .select('id, participant_id, participant_email, status, project_id')
        .in('project_id', projectIds);

      // Get total response count (separate from limited recent query)
      const { count: totalResponseCount } = await supabase
        .from('survey_respons')
        .select('id', { count: 'exact', head: true })
        .in('project_id', projectIds);

      // Get recent responses for display
      const { data: responses } = await supabase
        .from('survey_respons')
        .select('id, created_at, question_id, enrollment_id, response_text, response_value')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        .limit(10);

      const recent = (responses || []) as any[];

      const questionIds = Array.from(new Set(recent.map((r: any) => r.question_id).filter(Boolean)));
      const enrollmentIds = Array.from(new Set(recent.map((r: any) => r.enrollment_id).filter(Boolean)));

      const [{ data: questionsData }, { data: enrollmentsForRecent }] = await Promise.all([
        questionIds.length
          ? supabase
              .from('survey_question')
              .select('id, question_text, question_type')
              .in('id', questionIds)
          : Promise.resolve({ data: [] as any[] } as any),
        enrollmentIds.length
          ? supabase
              .from('enrollment')
              .select('id, participant_email')
              .in('id', enrollmentIds)
          : Promise.resolve({ data: [] as any[] } as any)
      ]);

      const questionById = new Map((questionsData || []).map((q: any) => [q.id, q]));
      const enrollmentById = new Map((enrollmentsForRecent || []).map((e: any) => [e.id, e]));

      const enrichedRecent = recent.map((r: any) => ({
        ...r,
        survey_question: questionById.get(r.question_id),
        enrollment: enrollmentById.get(r.enrollment_id)
      }));

      // Calculate stats
      const totalSurveys = projects?.length || 0;
      const activeParticipants = new Set(
        (enrollments || []).map((e: any) => e.participant_id || e.participant_email).filter(Boolean)
      ).size;
      const totalResponses = totalResponseCount || 0;
      const completedSurveys = enrollments?.filter(e => e.status === 'completed').length || 0;
      const completionRate = enrollments?.length ? Math.round((completedSurveys / enrollments.length) * 100) : 0;

      setStats({
        totalSurveys,
        activeParticipants,
        totalResponses,
        completionRate,
        recentResponses: enrichedRecent
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
            Analytics Dashboard
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between mb-4">
                <BarChart3 style={{ color: 'var(--color-green)' }} size={24} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.totalSurveys}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Total Surveys
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between mb-4">
                <Users style={{ color: 'var(--color-green)' }} size={24} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.activeParticipants}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Active Participants
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between mb-4">
                <TrendingUp style={{ color: 'var(--color-green)' }} size={24} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.totalResponses}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Total Responses
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between mb-4">
                <Activity style={{ color: 'var(--color-green)' }} size={24} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.completionRate}%
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Completion Rate
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border-light)' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Recent Survey Responses
            </h3>
            {loading ? (
              <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            ) : stats.recentResponses.length > 0 ? (
              <div className="space-y-4">
                {stats.recentResponses.map((response: any) => (
                  <div key={response.id} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-light)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {response.survey_question?.question_text || 'Question'}
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {response.enrollment?.participant_email || 'Anonymous'}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded" style={{ 
                        backgroundColor: 'var(--color-green)', 
                        color: 'white' 
                      }}>
                        {response.survey_question?.question_type || 'response'}
                      </span>
                    </div>
                    <p className="mt-2" style={{ color: 'var(--text-primary)' }}>
                      {(response.response_text && String(response.response_text).trim().length > 0)
                        ? response.response_text
                        : (response.response_value !== null && response.response_value !== undefined)
                          ? (typeof response.response_value === 'string'
                            ? response.response_value
                            : Array.isArray(response.response_value)
                              ? response.response_value.join(', ')
                              : JSON.stringify(response.response_value))
                          : ''}
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(response.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} size={48} />
                <p style={{ color: 'var(--text-secondary)' }}>
                  No responses yet. Share your surveys to start collecting data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default AnalyticsPage;
