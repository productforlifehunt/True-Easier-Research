import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Users, KeyRound, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ParticipantJoin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [surveyCode, setSurveyCode] = useState('');
  const [joining, setJoining] = useState(false);
  const token = searchParams.get('token');
  const projectId = searchParams.get('project');

  useEffect(() => {
    if (token && projectId) { setLoading(true); validateInvite(); }
  }, [token, projectId]);

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
      const { data: projectData, error: projectError } = await supabase.from('research_project').select('*').eq('survey_code', surveyCode.toUpperCase().trim()).in('status', ['published', 'active']).maybeSingle();
      if (projectError || !projectData) { setError('No study found with this code.'); setJoining(false); return; }
      if (user) {
        const profileId = user.id;
        const { data: existingEnrollment } = await supabase.from('enrollment').select('id').eq('project_id', projectData.id).eq('participant_id', profileId).maybeSingle();
        if (existingEnrollment) { localStorage.setItem(`enrollment_${projectData.id}`, existingEnrollment.id); toast.success('You are already enrolled!'); navigate(`/easyresearch/participant/${projectData.id}`); return; }
        const { data: newEnrollment, error: enrollError } = await supabase.from('enrollment').insert({ project_id: projectData.id, participant_id: profileId, participant_email: user.email, status: 'active', enrollment_token: crypto.randomUUID() }).select('id').single();
        if (enrollError) throw enrollError;
        if (newEnrollment?.id) localStorage.setItem(`enrollment_${projectData.id}`, newEnrollment.id);
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
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (project) {
    return (
      <div className="min-h-screen bg-stone-50/50">
        <div className="max-w-lg mx-auto p-6 pt-16">
          <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold text-stone-800 mb-1">Research Invitation</h1>
              <p className="text-[13px] text-stone-400 font-light">You've been invited to participate</p>
            </div>
            <div className="p-5 rounded-xl bg-stone-50 mb-6">
              <h2 className="text-[15px] font-semibold text-stone-800 mb-1">{project.title}</h2>
              <p className="text-[13px] text-stone-400 font-light">{project.description || 'No description'}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={acceptInvitation} disabled={joining}
                className="flex-1 px-5 py-3 rounded-xl text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all">
                {joining ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle size={16} /> Accept & Start</>}
              </button>
              <button onClick={() => navigate('/easyresearch')}
                className="px-5 py-3 rounded-xl text-[13px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="max-w-sm mx-auto p-6 pt-16">
        <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <KeyRound size={24} className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold text-stone-800 mb-1">Join a Study</h1>
            <p className="text-[13px] text-stone-400 font-light">Enter the code from your researcher</p>
          </div>

          <form id="join-form" onSubmit={handleJoinByCode} className="space-y-4">
            <input
              type="text"
              value={surveyCode}
              onChange={(e) => setSurveyCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              className="w-full px-4 py-3.5 rounded-xl border border-stone-200 text-lg font-mono tracking-wider text-center focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-stone-50/50 transition-all"
              maxLength={10}
              autoFocus
            />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-500 text-[12px]">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={joining || !surveyCode.trim()}
              className="w-full px-5 py-3 rounded-xl text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all disabled:opacity-50">
              {joining ? <Loader2 className="animate-spin" size={16} /> : <>Join Study <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100">
            <p className="text-[12px] text-center text-stone-400">
              Don't have a code?{' '}
              <button onClick={() => navigate('/easyresearch/home')} className="font-medium text-emerald-500 hover:text-emerald-600">
                Browse available studies
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantJoin;
