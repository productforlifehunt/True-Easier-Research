import React, { useEffect, useState } from 'react';
import EasierResearchLayout from './EasierResearchLayout';
import { BarChart3, Users, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeParticipants: 0,
    totalResponses: 0,
    completionRate: 0,
    recentResponses: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      // Get researcher's projects
      const { data: projects } = await supabase
        .from('research_projects')
        .select('*')
        .eq('researcher_id', user.id);

      // Get all enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*');

      // Get all responses with question details
      const { data: responses } = await supabase
        .from('survey_responses')
        .select(`
          *,
          survey_questions!inner(
            question_text,
            question_type
          ),
          enrollments!inner(
            profiles!inner(
              email,
              first_name,
              last_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate stats
      const totalSurveys = projects?.length || 0;
      const activeParticipants = new Set(enrollments?.map(e => e.participant_id)).size;
      const totalResponses = responses?.length || 0;
      const completedSurveys = enrollments?.filter(e => e.status === 'completed').length || 0;
      const completionRate = enrollments?.length ? Math.round((completedSurveys / enrollments.length) * 100) : 0;

      setStats({
        totalSurveys,
        activeParticipants,
        totalResponses,
        completionRate,
        recentResponses: responses || []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <EasierResearchLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
                          {response.survey_questions?.question_text || 'Question'}
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {response.enrollments?.profiles?.email || 'Anonymous'}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded" style={{ 
                        backgroundColor: 'var(--color-green)', 
                        color: 'white' 
                      }}>
                        {response.survey_questions?.question_type || 'response'}
                      </span>
                    </div>
                    <p className="mt-2" style={{ color: 'var(--text-primary)' }}>
                      {response.response_text || `Score: ${response.response_value}`}
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
    </EasierResearchLayout>
  );
};

export default AnalyticsPage;
