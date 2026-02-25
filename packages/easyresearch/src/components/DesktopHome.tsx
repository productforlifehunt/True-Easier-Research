import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Clock, Trophy, TrendingUp, Plus, ArrowRight } from 'lucide-react';

interface Survey {
  id: string;
  title: string;
  description: string;
  study_duration: number;
  survey_frequency: string;
  project_type: string;
  status?: string;
  survey_code?: string;
}

interface Enrollment {
  id: string;
  project_id: string;
  created_at: string;
  status: string;
  research_projects: Survey;
}

const DesktopHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolledSurveys, setEnrolledSurveys] = useState<Enrollment[]>([]);
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Load enrolled surveys
      if (user) {
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select(`
            id,
            project_id,
            created_at,
            status,
            research_projects (
              id,
              title,
              description,
              project_type,
              study_duration,
              survey_frequency,
              status,
              survey_code
            )
          `)
          .eq('participant_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3);

        if (enrollmentsData) {
          setEnrolledSurveys(enrollmentsData as any);
        }
      }

      // Load available surveys
      const { data: surveys } = await supabase
        .from('research_projects')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);

      if (surveys) {
        setAvailableSurveys(surveys);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrolledSurveyClick = (enrollment: Enrollment) => {
    const project = enrollment.research_projects;
    if (project.project_type === 'longitudinal') {
      navigate(`/easyresearch/participant/${enrollment.project_id}/timeline`);
    } else {
      navigate(`/easyresearch/participant/${enrollment.project_id}/dashboard`);
    }
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
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Welcome to Easier-research
          </h1>
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
            Participate in research studies or manage your own research projects
          </p>
        </div>

        {/* Stats Cards */}
        {user && (
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-2">
                <FileText size={24} style={{ color: 'var(--color-green)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Active Studies
                </h3>
              </div>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
                {enrolledSurveys.length}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-2">
                <Clock size={24} style={{ color: 'var(--color-green)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Total Hours
                </h3>
              </div>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
                {enrolledSurveys.reduce((acc, e) => acc + (e.research_projects.study_duration || 0), 0)}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-2">
                <Trophy size={24} style={{ color: 'var(--color-green)' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Completed
                </h3>
              </div>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
                0
              </p>
            </div>
          </div>
        )}

        {/* My Active Studies */}
        {user && enrolledSurveys.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                My Active Studies
              </h2>
              <button
                onClick={() => navigate('/easyresearch')}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--color-green)' }}
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {enrolledSurveys.map(enrollment => (
                <div
                  key={enrollment.id}
                  onClick={() => handleEnrolledSurveyClick(enrollment)}
                  className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ border: '2px solid var(--color-green)' }}
                >
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {enrollment.research_projects.title}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {enrollment.research_projects.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {enrollment.research_projects.project_type === 'longitudinal' ? 'Longitudinal' : 'One-time'}
                    </span>
                    <span className="font-medium" style={{ color: 'var(--color-green)' }}>
                      Continue →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Studies */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Available Research Studies
            </h2>
            <button
              onClick={() => navigate('/easyresearch')}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-green)' }}
            >
              Browse All
              <ArrowRight size={16} />
            </button>
          </div>

          {availableSurveys.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                No Studies Available
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Check back later for new research opportunities
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {availableSurveys.map(survey => (
                <div
                  key={survey.id}
                  onClick={() => navigate(`/easyresearch/participant/${survey.id}`)}
                  className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ border: '1px solid var(--border-light)' }}
                >
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {survey.title}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {survey.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {survey.study_duration} days
                    </span>
                    <span className="font-medium" style={{ color: 'var(--color-green)' }}>
                      Learn More →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopHome;
