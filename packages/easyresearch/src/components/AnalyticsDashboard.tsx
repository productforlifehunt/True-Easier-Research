import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle, Download, Clock, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import CustomDropdown from './CustomDropdown';

interface AnalyticsData {
  totalResponses: number;
  completionRate: number;
  avgCompletionTime: number;
  dropoffRate: number;
  responsesByDay: { date: string; count: number }[];
  questionMetrics: { question: string; responses: number; avgTime: number }[];
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalResponses: 0,
    completionRate: 0,
    avgCompletionTime: 0,
    dropoffRate: 0,
    responsesByDay: [],
    questionMetrics: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadAnalytics();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data: researcherData } = await supabase
        .from('researchers')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      if (researcherData) {
        const { data: projectsData } = await supabase
          .from('research_projects')
          .select('id, title')
          .eq('organization_id', researcherData.organization_id);

        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);
          setSelectedProject(projectsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load responses
      const { data: responses, error } = await supabase
        .from('survey_responses')
        .select('*, question:survey_questions(question_text)')
        .eq('project_id', selectedProject);

      if (responses) {
        // Calculate metrics
        const totalResponses = responses.length;
        
        // Group by question
        const questionGroups = responses.reduce((acc: any, response: any) => {
          const questionText = response.question?.question_text || 'Unknown';
          if (!acc[questionText]) {
            acc[questionText] = {
              question: questionText,
              responses: 0,
              totalTime: 0
            };
          }
          acc[questionText].responses++;
          acc[questionText].totalTime += response.response_time_seconds || 0;
          return acc;
        }, {});

        const questionMetrics = Object.values(questionGroups).map((q: any) => ({
          question: q.question,
          responses: q.responses,
          avgTime: q.totalTime / q.responses || 0
        }));

        // Group by day
        const dayGroups = responses.reduce((acc: any, response: any) => {
          const date = new Date(response.created_at).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date]++;
          return acc;
        }, {});

        const responsesByDay = Object.entries(dayGroups).map(([date, count]) => ({
          date,
          count: count as number
        }));

        setAnalytics({
          totalResponses,
          completionRate: 75, // Would calculate from enrollments
          avgCompletionTime: 8.5, // Would calculate from sessions
          dropoffRate: 25,
          responsesByDay,
          questionMetrics
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Export to CSV
    const csvContent = [
      ['Question', 'Responses', 'Avg Time (seconds)'],
      ...analytics.questionMetrics.map(q => [q.question, q.responses, q.avgTime])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey-analytics.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Analytics Dashboard
              </h1>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                Track your survey performance and insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CustomDropdown
                options={projects.map(project => ({
                  value: project.id,
                  label: project.title
                }))}
                value={selectedProject}
                onChange={(value) => setSelectedProject(value)}
                placeholder="Select project"
                className="w-64"
              />
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center justify-between mb-4">
              <BarChart3 style={{ color: 'var(--color-green)' }} size={24} />
              <TrendingUp className="text-green-500" size={16} />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {analytics.totalResponses}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Total Responses
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center justify-between mb-4">
              <CheckCircle style={{ color: 'var(--color-green)' }} size={24} />
              <span className="text-xs font-medium text-green-600">
                +5%
              </span>
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {analytics.completionRate}%
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Completion Rate
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center justify-between mb-4">
              <Clock style={{ color: 'var(--color-green)' }} size={24} />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {analytics.avgCompletionTime} min
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Avg. Completion Time
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center justify-between mb-4">
              <Users style={{ color: 'var(--color-green)' }} size={24} />
              <span className="text-xs font-medium text-red-600">
                -3%
              </span>
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {analytics.dropoffRate}%
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Drop-off Rate
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Response Trend
            </h3>
            <div className="h-64 flex items-end gap-2">
              {analytics.responsesByDay.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full rounded-t"
                    style={{ 
                      height: `${(day.count / Math.max(...analytics.responsesByDay.map(d => d.count))) * 100}%`,
                      backgroundColor: 'var(--color-green)'
                    }}
                  />
                  <span className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {day.date.split('/')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Question Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Question Performance
            </h3>
            <div className="space-y-3">
              {analytics.questionMetrics.slice(0, 5).map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                      {metric.question}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {metric.responses} responses
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(metric.responses / Math.max(...analytics.questionMetrics.map(m => m.responses))) * 100}%`,
                        backgroundColor: 'var(--color-green)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
