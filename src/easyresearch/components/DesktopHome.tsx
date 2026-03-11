import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { FileText, Clock, Trophy, TrendingUp, Plus, ArrowRight } from 'lucide-react';

interface Survey {
  id: string;
  title: string;
  description: string;
  study_duration: number;
  survey_frequency: string;
  methodology_type: string;
  status?: string;
  survey_code?: string;
}

interface Enrollment {
  id: string;
  project_id: string;
  created_at: string;
  status: string;
  research_project: Survey;
}

const DesktopHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [enrolledSurveys, setEnrolledSurveys] = useState<Enrollment[]>([]);
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user) {
        const { data: enrollmentsData } = await supabase
          .from('enrollment')
          .select('id, project_id, created_at, status')
          .eq('participant_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3);

        if (enrollmentsData && enrollmentsData.length > 0) {
          const projectIds = Array.from(new Set(enrollmentsData.map((e: any) => e.project_id).filter(Boolean)));
          const { data: projectsData } = projectIds.length
            ? await supabase
                .from('research_project')
                .select('id, title, description, project_type, study_duration, survey_frequency, status, survey_code')
                .in('id', projectIds)
            : { data: [] as any[] };

          const projectById = new Map((projectsData || []).map((p: any) => [p.id, p]));

          setEnrolledSurveys(
            (enrollmentsData as any[]).map((e: any) => ({
              ...e,
              research_project: projectById.get(e.project_id)
            })) as any
          );
        } else {
          setEnrolledSurveys([]);
        }
      }

      const { data: surveys } = await supabase
        .from('research_project')
        .select('*')
        .in('status', ['published', 'active'])
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
    navigate(`/easyresearch/participant/${enrollment.project_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-stone-800">
            {t('home.welcome')}
          </h1>
          <p className="text-xl text-stone-500">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Stats Cards */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border border-stone-100">
              <div className="flex items-center gap-3 mb-2">
                <FileText size={24} className="text-emerald-500" />
                <h3 className="text-lg font-semibold text-stone-800">
                  {t('home.activeStudies')}
                </h3>
              </div>
              <p className="text-3xl font-bold text-emerald-500">
                {enrolledSurveys.length}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-100">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={24} className="text-emerald-500" />
                <h3 className="text-lg font-semibold text-stone-800">
                  {t('home.totalHours')}
                </h3>
              </div>
              <p className="text-3xl font-bold text-emerald-500">
                {enrolledSurveys.reduce((acc, e) => acc + (e.research_project.study_duration || 0), 0)}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-100">
              <div className="flex items-center gap-3 mb-2">
                <Trophy size={24} className="text-emerald-500" />
                <h3 className="text-lg font-semibold text-stone-800">
                  {t('common.completed')}
                </h3>
              </div>
              <p className="text-3xl font-bold text-emerald-500">
                0
              </p>
            </div>
          </div>
        )}

        {/* My Active Studies */}
        {user && enrolledSurveys.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-stone-800">
                {t('home.myActiveStudies')}
              </h2>
              <button
                onClick={() => navigate('/easyresearch')}
                className="flex items-center gap-2 text-sm font-medium text-emerald-500"
              >
                {t('home.viewAll')}
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledSurveys.map(enrollment => (
                <div
                  key={enrollment.id}
                  onClick={() => handleEnrolledSurveyClick(enrollment)}
                  className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-emerald-500"
                >
                  <h3 className="text-lg font-semibold mb-2 text-stone-800">
                    {enrollment.research_project.title}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-2 text-stone-500">
                    {enrollment.research_project.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">
                      {enrollment.research_project.methodology_type === 'multi_time' ? t('home.longitudinal') : t('home.oneTime')}
                    </span>
                    <span className="font-medium text-emerald-500">
                      {t('home.continue')}
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
            <h2 className="text-2xl font-bold text-stone-800">
              {t('home.availableStudies')}
            </h2>
            <button
              onClick={() => navigate('/easyresearch')}
              className="flex items-center gap-2 text-sm font-medium text-emerald-500"
            >
              {t('home.browseAll')}
              <ArrowRight size={16} />
            </button>
          </div>

          {availableSurveys.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText size={48} className="mx-auto mb-4 text-stone-400" />
              <h3 className="text-xl font-semibold mb-2 text-stone-800">
                {t('home.noStudies')}
              </h3>
              <p className="text-stone-500">
                {t('home.checkBackLater')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableSurveys.map(survey => (
                <div
                  key={survey.id}
                  onClick={() => navigate(`/easyresearch/participant/${survey.id}`)}
                  className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow border border-stone-100"
                >
                  <h3 className="text-lg font-semibold mb-2 text-stone-800">
                    {survey.title}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-2 text-stone-500">
                    {survey.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">
                      {survey.study_duration} {t('home.days')}
                    </span>
                    <span className="font-medium text-emerald-500">
                      {t('home.learnMore')}
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
