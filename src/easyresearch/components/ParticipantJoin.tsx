import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Users, KeyRound, ArrowRight, Loader2, AlertCircle, CheckCircle, Clock, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Survey {
  id: string;
  title: string;
  description: string;
  project_type: string;
  study_duration: number;
  survey_code?: string;
  status?: string;
}

const ParticipantJoin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [surveyCode, setSurveyCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([]);
  const [browsing, setBrowsing] = useState(false);
  const token = searchParams.get('token');
  const projectId = searchParams.get('project');

  useEffect(() => {
    if (token && projectId) { setLoading(true); validateInvite(); }
  }, [token, projectId]);

  useEffect(() => { loadAvailable(); }, []);

  const loadAvailable = async () => {
    setBrowsing(true);
    try {
      const { data } = await supabase
        .from('research_project')
        .select('id, title, description, project_type, study_duration, survey_code, status')
        .in('status', ['published', 'active'])
        .order('created_at', { ascending: false });
      if (data) setAvailableSurveys(data);
    } catch (err) { console.error(err); }
    finally { setBrowsing(false); }
  };

  const validateInvite = async () => {
    try {
      const { data: enrollment } = await supabase.from('enrollment').select('id, status').eq('enrollment_token', token).eq('project_id', projectId).maybeSingle();
      if (!enrollment) throw new Error('Invalid invitation');
      const { data: projectData } = await supabase.from('research_project').select('id, title, description').eq('id', projectId).maybeSingle();
      if (!projectData) throw new Error('Project not found');
      setProject({ ...projectData, enrollmentId: enrollment.id });
    } catch (err) { setError('This invitation link is invalid or has expired.'); }
    finally { setLoading(false); }
  };

  const acceptInvitation = async () => {
    setJoining(true);
    try {
      await supabase.from('enrollment').update({ status: 'active' }).eq('id', project.enrollmentId);
      toast.success('Successfully joined the study!');
      navigate(`/easyresearch/participant/${project.id}`);
    } catch (err) { toast.error('Failed to join study'); }
    finally { setJoining(false); }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyCode.trim()) { toast.error('Please enter a survey code'); return; }
    setJoining(true); setError(null);
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('research_project').select('*')
        .eq('survey_code', surveyCode.toUpperCase().trim())
        .in('status', ['published', 'active']).maybeSingle();
      if (projectError || !projectData) { setError('No study found with this code.'); setJoining(false); return; }
      if (user) {
        const { data: existing } = await supabase.from('enrollment').select('id').eq('project_id', projectData.id).eq('participant_id', user.id).maybeSingle();
        if (existing) { toast.success('You are already enrolled!'); navigate(`/easyresearch/participant/${projectData.id}`); return; }
        const { data: newEnrollment, error: enrollError } = await supabase.from('enrollment').insert({
          project_id: projectData.id, participant_id: user.id, participant_email: user.email,
          status: 'active', enrollment_token: crypto.randomUUID()
        }).select('id').single();
        if (enrollError) throw enrollError;
        toast.success('Successfully joined the study!');
        navigate(`/easyresearch/participant/${projectData.id}`);
      } else {
        sessionStorage.setItem('pending_survey_code', surveyCode.toUpperCase().trim());
        toast.success('Please sign in to join');
        navigate(`/easyresearch/auth?redirectTo=/easyresearch/participant/join&redirect=participant`);
      }
    } catch (err: any) { console.error('Join error:', err); setError(err.message || 'Failed to join study.'); }
    finally { setJoining(false); }
  };

  useEffect(() => {
    const pendingCode = sessionStorage.getItem('pending_survey_code');
    if (pendingCode && user && !token && !projectId) {
      sessionStorage.removeItem('pending_survey_code');
      setSurveyCode(pendingCode);
      setTimeout(() => { const form = document.getElementById('join-form') as HTMLFormElement; if (form) form.requestSubmit(); }, 500);
    }
  }, [user, token, projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-500" size={28} />
      </div>
    );
  }

  // Invitation flow
  if (project) {
    return (
      <div className="bg-stone-50/50">
        <div className="max-w-lg mx-auto p-4 pt-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold text-stone-800 mb-1">Study Invitation</h1>
              <p className="text-[13px] text-stone-400 font-light">You've been invited to participate</p>
            </div>
            <div className="p-5 rounded-xl bg-stone-50 mb-6">
              <h2 className="text-[15px] font-semibold text-stone-800 mb-1">{project.title}</h2>
              <p className="text-[13px] text-stone-400 font-light">{project.description || 'No description'}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={acceptInvitation} disabled={joining}
                className="flex-1 px-5 py-3 rounded-xl text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all">
                {joining ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle size={16} /> Accept & Join</>}
              </button>
              <button onClick={() => navigate('/easyresearch/dashboard')}
                className="px-5 py-3 rounded-xl text-[13px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main join/discover page
  return (
    <div className="bg-stone-50/50">
      <div className="max-w-2xl px-0 py-4">
        {/* Join by Code */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight">Join a Study</h1>
          <p className="text-[13px] text-stone-400 font-light mt-0.5">Enter a code or browse open studies</p>
        </div>

        <form id="join-form" onSubmit={handleJoinByCode} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={surveyCode}
              onChange={(e) => setSurveyCode(e.target.value.toUpperCase())}
              placeholder="Enter study code"
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-[14px] font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-white transition-all"
              maxLength={10}
            />
            <button type="submit" disabled={joining || !surveyCode.trim()}
              className="px-5 py-3 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-40 transition-all shrink-0">
              {joining ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-2 p-2.5 rounded-xl bg-red-50 text-red-500 text-[12px]">
              <AlertCircle size={13} /> <span>{error}</span>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-[11px] text-stone-400 font-medium">or browse open studies</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Available Studies */}
        {browsing ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-emerald-400" size={22} />
          </div>
        ) : availableSurveys.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-stone-300" />
            </div>
            <h2 className="text-[14px] font-semibold text-stone-700 mb-1">No open studies right now</h2>
            <p className="text-[12px] text-stone-400 font-light">Ask your researcher for a study code</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {availableSurveys.map(survey => (
              <button
                key={survey.id}
                onClick={() => navigate(`/easyresearch/participant/${survey.id}`)}
                className="w-full bg-white rounded-2xl border border-stone-100 p-4 text-left hover:shadow-md hover:shadow-stone-100/80 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-stone-800 truncate">{survey.title}</h3>
                    <p className="text-[12px] text-stone-400 font-light mt-0.5 line-clamp-2">{survey.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-stone-300 group-hover:text-emerald-400 transition-colors ml-2 shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-50 text-stone-500">
                    {survey.project_type}
                  </span>
                  {survey.study_duration && (
                    <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                      <Clock size={9} /> {survey.study_duration}d
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantJoin;
