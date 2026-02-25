import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, CheckCircle, TrendingUp, Bell, BarChart3, History } from 'lucide-react';

interface SurveySession { id: string; completed_at: string; response_count: number; }
interface StudyProgress { totalSurveys: number; completedSurveys: number; nextSurveyTime: Date | null; canTakeSurvey: boolean; studyDay: number; totalDays: number; }

const LongitudinalSurveyDashboard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [sessions, setSessions] = useState<SurveySession[]>([]);
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, [projectId]);

  const loadDashboardData = async () => {
    try {
      const enrollmentId = localStorage.getItem(`enrollment_${projectId}`);
      if (enrollmentId) {
        const { data: enrollmentData } = await supabase.from('enrollment').select('*').eq('id', enrollmentId).maybeSingle();
        if (enrollmentData) {
          setEnrollment(enrollmentData);
          const { data: projectData } = await supabase.from('research_project').select('*').eq('id', projectId).maybeSingle();
          if (projectData) {
            setProject(projectData);
            const { data: responsesData } = await supabase.from('survey_respons').select('id, created_at').eq('enrollment_id', enrollmentId).order('created_at', { ascending: false });
            if (responsesData) {
              const groupedSessions = groupResponsesIntoSessions(responsesData);
              setSessions(groupedSessions);
              setProgress(calculateProgress(enrollmentData, projectData, groupedSessions));
            }
          }
        }
      }
    } catch (error) { console.error('Error loading dashboard:', error); }
    finally { setLoading(false); }
  };

  const groupResponsesIntoSessions = (responses: any[]): SurveySession[] => {
    const sessions: SurveySession[] = [];
    const sessionThreshold = 5 * 60 * 1000;
    responses.forEach(response => {
      const responseTime = new Date(response.created_at).getTime();
      let foundSession = false;
      for (const session of sessions) {
        if (Math.abs(responseTime - new Date(session.completed_at).getTime()) < sessionThreshold) { session.response_count++; foundSession = true; break; }
      }
      if (!foundSession) sessions.push({ id: response.id, completed_at: response.created_at, response_count: 1 });
    });
    return sessions;
  };

  const calculateProgress = (enrollment: any, project: any, sessions: SurveySession[]): StudyProgress => {
    const enrollmentDate = new Date(enrollment.created_at);
    const now = new Date();
    const daysSinceStart = Math.floor((now.getTime() - enrollmentDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    let totalExpectedSurveys = 0;
    const frequency = project.survey_frequency || 'daily';
    switch (frequency) {
      case 'hourly': totalExpectedSurveys = project.study_duration * 12; break;
      case '2hours': totalExpectedSurveys = project.study_duration * 6; break;
      case '4hours': totalExpectedSurveys = project.study_duration * 3; break;
      case 'twice_daily': totalExpectedSurveys = project.study_duration * 2; break;
      default: totalExpectedSurveys = project.study_duration; break;
    }
    let nextSurveyTime: Date | null = null;
    let canTakeSurvey = false;
    const studyEndDate = new Date(enrollmentDate.getTime() + (project.study_duration || 7) * 24 * 60 * 60 * 1000);
    if (sessions.length > 0) {
      const lastSession = sessions[0];
      let intervalMs = 60 * 60 * 1000;
      switch (frequency) { case '2hours': intervalMs *= 2; break; case '4hours': intervalMs *= 4; break; case 'daily': intervalMs *= 24; break; case 'twice_daily': intervalMs *= 12; break; }
      nextSurveyTime = new Date(new Date(lastSession.completed_at).getTime() + intervalMs);
      canTakeSurvey = now >= nextSurveyTime && now <= studyEndDate;
    } else { canTakeSurvey = true; nextSurveyTime = now; }
    return { totalSurveys: totalExpectedSurveys, completedSurveys: sessions.length, nextSurveyTime, canTakeSurvey, studyDay: Math.min(daysSinceStart, project.study_duration || 7), totalDays: project.study_duration || 7 };
  };

  const formatTimeUntilNext = (nextTime: Date): string => {
    const diff = nextTime.getTime() - new Date().getTime();
    if (diff <= 0) return 'Now';
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto mb-3" />
          <p className="text-[13px] text-stone-400 font-light">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!enrollment || !project || !progress) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center pb-24">
        <div className="text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
            <History size={24} className="text-stone-300" />
          </div>
          <h2 className="text-[15px] font-semibold text-stone-700 mb-1">No Survey History</h2>
          <p className="text-[13px] text-stone-400 font-light mb-4">You haven't taken any surveys yet.</p>
          <button onClick={() => navigate(`/easyresearch/participant/${projectId}?skip_consent=true`)}
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all">
            Take Survey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-6 pb-24">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold text-stone-800">{project.title}</h1>
              <p className="text-[12px] text-stone-400 font-light mt-0.5">{enrollment.participant_email || 'Participant'}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-stone-400 font-light">Progress</p>
              <p className="text-lg font-bold text-emerald-500">Day {progress.studyDay}/{progress.totalDays}</p>
            </div>
          </div>
        </div>

        {/* Survey Available Card */}
        <div className={`rounded-2xl border shadow-sm p-5 mb-4 ${progress.canTakeSurvey ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-stone-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${progress.canTakeSurvey ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                {progress.canTakeSurvey ? <Bell size={18} /> : <Clock size={18} />}
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-stone-800">{progress.canTakeSurvey ? 'Survey Available!' : 'Next Survey'}</h2>
                <p className="text-[12px] text-stone-400 font-light">
                  {progress.canTakeSurvey ? 'Ready to complete' : `Available in ${progress.nextSurveyTime ? formatTimeUntilNext(progress.nextSurveyTime) : '...'}`}
                </p>
              </div>
            </div>
            {progress.canTakeSurvey && (
              <button onClick={() => navigate(`/easyresearch/participant/${projectId}?skip_consent=true`)}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all">
                Take Survey →
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: BarChart3, label: 'Completion', value: `${progress.totalSurveys > 0 ? Math.round((progress.completedSurveys / progress.totalSurveys) * 100) : 0}%`, sub: `${progress.completedSurveys}/${progress.totalSurveys}` },
            { icon: TrendingUp, label: "Today's", value: sessions.filter(s => new Date(s.completed_at).toDateString() === new Date().toDateString()).length.toString(), sub: 'Completed' },
            { icon: Calendar, label: 'Remaining', value: (progress.totalDays - progress.studyDay + 1).toString(), sub: 'Days left' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <stat.icon size={14} className="text-emerald-500" />
                <span className="text-[11px] text-stone-400 font-light">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-stone-800">{stat.value}</p>
              <p className="text-[10px] text-stone-400 font-light">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" /> Recent Sessions
          </h3>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session, index) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle size={12} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-stone-700">Session #{sessions.length - index}</p>
                    <p className="text-[10px] text-stone-400 font-light">{new Date(session.completed_at).toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-500">Done</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LongitudinalSurveyDashboard;
