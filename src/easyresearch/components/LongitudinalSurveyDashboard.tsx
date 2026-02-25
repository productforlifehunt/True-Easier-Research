import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, CheckCircle, TrendingUp, Moon, Bell, BarChart3, History } from 'lucide-react';

interface SurveySession {
  id: string;
  completed_at: string;
  response_count: number;
}

interface StudyProgress {
  totalSurveys: number;
  completedSurveys: number;
  nextSurveyTime: Date | null;
  canTakeSurvey: boolean;
  studyDay: number;
  totalDays: number;
}

const LongitudinalSurveyDashboard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [sessions, setSessions] = useState<SurveySession[]>([]);
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [projectId]);

  const loadDashboardData = async () => {
    try {
      const enrollmentId = localStorage.getItem(`enrollment_${projectId}`);
      
      if (enrollmentId) {
        const { data: enrollmentData } = await supabase
          .from('enrollment')
          .select('*')
          .eq('id', enrollmentId)
          .maybeSingle();

        if (enrollmentData) {
          setEnrollment(enrollmentData);

          const { data: projectData } = await supabase
            .from('research_project')
            .select('*')
            .eq('id', projectId)
            .maybeSingle();

          if (projectData) {
            setProject(projectData);

            const { data: responsesData } = await supabase
              .from('survey_respons')
              .select('id, created_at')
              .eq('enrollment_id', enrollmentId)
              .order('created_at', { ascending: false });

            if (responsesData) {
              const groupedSessions = groupResponsesIntoSessions(responsesData);
              setSessions(groupedSessions);

              const studyProgress = calculateProgress(
                enrollmentData,
                projectData,
                groupedSessions
              );
              setProgress(studyProgress);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupResponsesIntoSessions = (responses: any[]): SurveySession[] => {
    const sessions: SurveySession[] = [];
    const sessionThreshold = 5 * 60 * 1000;

    responses.forEach(response => {
      const responseTime = new Date(response.created_at).getTime();
      
      let foundSession = false;
      for (const session of sessions) {
        const sessionTime = new Date(session.completed_at).getTime();
        if (Math.abs(responseTime - sessionTime) < sessionThreshold) {
          session.response_count++;
          foundSession = true;
          break;
        }
      }

      if (!foundSession) {
        sessions.push({
          id: response.id,
          completed_at: response.created_at,
          response_count: 1
        });
      }
    });

    return sessions;
  };

  const calculateProgress = (
    enrollment: any, 
    project: any, 
    sessions: SurveySession[]
  ): StudyProgress => {
    const enrollmentDate = new Date(enrollment.created_at);
    const now = new Date();
    const studyDurationMs = (project.study_duration || 7) * 24 * 60 * 60 * 1000;
    const studyEndDate = new Date(enrollmentDate.getTime() + studyDurationMs);
    
    const daysSinceStart = Math.floor((now.getTime() - enrollmentDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    
    let totalExpectedSurveys = 0;
    const frequency = project.survey_frequency || 'daily';
    
    switch (frequency) {
      case 'hourly':
        totalExpectedSurveys = project.study_duration * 12;
        break;
      case '2hours':
        totalExpectedSurveys = project.study_duration * 6;
        break;
      case '4hours':
        totalExpectedSurveys = project.study_duration * 3;
        break;
      case 'daily':
        totalExpectedSurveys = project.study_duration;
        break;
      case 'twice_daily':
        totalExpectedSurveys = project.study_duration * 2;
        break;
      default:
        totalExpectedSurveys = project.study_duration;
    }

    let nextSurveyTime: Date | null = null;
    let canTakeSurvey = false;

    if (sessions.length > 0) {
      const lastSession = sessions[0];
      const lastSessionTime = new Date(lastSession.completed_at);
      
      let intervalMs = 60 * 60 * 1000;
      switch (frequency) {
        case '2hours':
          intervalMs = 2 * 60 * 60 * 1000;
          break;
        case '4hours':
          intervalMs = 4 * 60 * 60 * 1000;
          break;
        case 'daily':
          intervalMs = 24 * 60 * 60 * 1000;
          break;
        case 'twice_daily':
          intervalMs = 12 * 60 * 60 * 1000;
          break;
      }

      nextSurveyTime = new Date(lastSessionTime.getTime() + intervalMs);
      canTakeSurvey = now >= nextSurveyTime && now <= studyEndDate;

      if (canTakeSurvey && enrollment.dnd_setting) {
        const currentHour = now.getHours();
        const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
        
        for (const period of enrollment.dnd_setting) {
          if (period.days.includes(currentDay)) {
            const [startHour, startMin] = period.start_time.split(':').map(Number);
            const [endHour, endMin] = period.end_time.split(':').map(Number);
            
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            const currentMinutes = currentHour * 60 + now.getMinutes();
            
            if (startMinutes > endMinutes) {
              if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
                canTakeSurvey = false;
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(endHour, endMin, 0, 0);
                if (!nextSurveyTime || tomorrow < nextSurveyTime) {
                  nextSurveyTime = tomorrow;
                }
              }
            } else {
              if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                canTakeSurvey = false;
                const endTime = new Date(now);
                endTime.setHours(endHour, endMin, 0, 0);
                if (!nextSurveyTime || endTime < nextSurveyTime) {
                  nextSurveyTime = endTime;
                }
              }
            }
          }
        }
      }
    } else {
      canTakeSurvey = true;
      nextSurveyTime = now;
    }

    return {
      totalSurveys: totalExpectedSurveys,
      completedSurveys: sessions.length,
      nextSurveyTime,
      canTakeSurvey,
      studyDay: Math.min(daysSinceStart, project.study_duration || 7),
      totalDays: project.study_duration || 7
    };
  };

  const formatTimeUntilNext = (nextTime: Date): string => {
    const now = new Date();
    const diff = nextTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Now';
    
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading your study dashboard...</p>
        </div>
      </div>
    );
  }

  if (!enrollment || !project || !progress) {
    return (
      <>
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: '100px' }}>
        <div className="text-center px-4">
          <History size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Survey History</h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>You haven't taken any surveys yet.</p>
          <button
            onClick={() => navigate(`/easyresearch/participant/${projectId}?skip_consent=true`)}
            className="px-6 py-3 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600"
          >
            Take Survey
          </button>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: '100px' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {project.title}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {enrollment.participant_email || 'Participant'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Study Progress</p>
              <p className="text-xl font-semibold" style={{ color: 'var(--color-green)' }}>
                Day {progress.studyDay} of {progress.totalDays}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl shadow-sm p-6 mb-6 ${progress.canTakeSurvey ? 'border-2 border-green-500' : 'bg-white'}`}
          style={{ backgroundColor: progress.canTakeSurvey ? '#f0fdf4' : 'white' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${progress.canTakeSurvey ? 'bg-green-500 text-white' : ''}`}
                style={{ backgroundColor: progress.canTakeSurvey ? undefined : 'var(--border-light)', color: progress.canTakeSurvey ? undefined : 'var(--text-secondary)' }}
              >
                {progress.canTakeSurvey ? <Bell size={24} /> : <Clock size={24} />}
              </div>
              <div>
                <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                  {progress.canTakeSurvey ? 'Survey Available!' : 'Next Survey'}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {progress.canTakeSurvey 
                    ? 'Your hourly survey is ready to complete'
                    : `Available in ${progress.nextSurveyTime ? formatTimeUntilNext(progress.nextSurveyTime) : 'calculating...'}`
                  }
                </p>
              </div>
            </div>
            {progress.canTakeSurvey && (
              <button
                onClick={() => navigate(`/easyresearch/participant/${projectId}?skip_consent=true`)}
                className="px-6 py-3 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600"
              >
                Take Survey →
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={20} style={{ color: 'var(--color-green)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Completion Rate
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {progress.totalSurveys > 0 ? Math.round((progress.completedSurveys / progress.totalSurveys) * 100) : 0}%
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {progress.completedSurveys} of {progress.totalSurveys} surveys
            </p>
          </div>

          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={20} style={{ color: 'var(--color-green)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Today's Surveys
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {sessions.filter(s => {
                const sessionDate = new Date(s.completed_at).toDateString();
                return sessionDate === new Date().toDateString();
              }).length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {project.survey_frequency === 'hourly' ? 'Out of 12 expected' : 'Completed today'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} style={{ color: 'var(--color-green)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Study Duration
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {progress.totalDays - progress.studyDay + 1}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Days remaining
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={20} style={{ color: 'var(--color-green)' }} />
            Recent Survey Sessions
          </h3>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session, index) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Survey Session #{sessions.length - index}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(session.completed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>

        {enrollment.dnd_setting && enrollment.dnd_setting.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Your Quiet Hours:
            </p>
            <div className="space-y-1">
              {enrollment.dnd_setting.map((period: any, index: number) => (
                <p key={index} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  • {period.start_time} - {period.end_time} on {period.days.join(', ')}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default LongitudinalSurveyDashboard;
