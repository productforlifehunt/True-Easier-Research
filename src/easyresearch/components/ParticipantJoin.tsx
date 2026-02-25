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
    if (token && projectId) {
      setLoading(true);
      validateInvite();
    }
  }, [token, projectId]);

  const validateInvite = async () => {
    try {
      const { data: enrollment } = await supabase
        .from('enrollment')
        .select('id, status')
        .eq('enrollment_token', token)
        .eq('project_id', projectId)
        .maybeSingle();

      if (!enrollment) throw new Error('Invalid invitation');

      const { data: projectData } = await supabase
        .from('research_project')
        .select('id, title, description')
        .eq('id', projectId)
        .maybeSingle();

      if (!projectData) throw new Error('Project not found');
      setProject({ ...projectData, enrollmentId: enrollment.id });
    } catch (err) {
      setError('This invitation link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    setJoining(true);
    try {
      await supabase
        .from('enrollment')
        .update({ status: 'active' })
        .eq('id', project.enrollmentId);
      
      toast.success('Successfully joined the study!');
      navigate(`/easyresearch/participant/${project.id}`);
    } catch (err) {
      toast.error('Failed to join study');
    } finally {
      setJoining(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyCode.trim()) {
      toast.error('Please enter a survey code');
      return;
    }

    setJoining(true);
    setError(null);

    try {
      // Find the project by survey code
      const { data: projectData, error: projectError } = await supabase
        .from('research_project')
        .select('*')
        .eq('survey_code', surveyCode.toUpperCase().trim())
        .in('status', ['published', 'active'])
        .maybeSingle();

      if (projectError || !projectData) {
        setError('No study found with this code. Please check and try again.');
        setJoining(false);
        return;
      }

      // Check if already enrolled
      if (user) {
        // Use profile ID as participant_id (enrollment FK references profile table)
        const profileId = user.id;

        const { data: existingEnrollment } = await supabase
          .from('enrollment')
          .select('id')
          .eq('project_id', projectData.id)
          .eq('participant_id', profileId)
          .maybeSingle();

        if (existingEnrollment) {
          localStorage.setItem(`enrollment_${projectData.id}`, existingEnrollment.id);
          toast.success('You are already enrolled in this study!');
          navigate(`/easyresearch/participant/${projectData.id}`);
          return;
        }

        // Create enrollment
        const { data: newEnrollment, error: enrollError } = await supabase
          .from('enrollment')
          .insert({
            project_id: projectData.id,
            participant_id: profileId,
            participant_email: user.email,
            status: 'active',
            enrollment_token: crypto.randomUUID()
          })
          .select('id')
          .single();

        if (enrollError) {
          throw enrollError;
        }

        // Store enrollment ID so downstream views can find it
        if (newEnrollment?.id) {
          localStorage.setItem(`enrollment_${projectData.id}`, newEnrollment.id);
        }

        toast.success('Successfully joined the study!');
        navigate(`/easyresearch/participant/${projectData.id}`);
      } else {
        // Not logged in - redirect to auth then back
        sessionStorage.setItem('pending_survey_code', surveyCode.toUpperCase().trim());
        toast.success('Please sign in to join this study');
        navigate(`/easyresearch/auth?redirectTo=/easyresearch/participant/join&redirect=participant`);
      }
    } catch (err: any) {
      console.error('Join error:', err);
      setError(err.message || 'Failed to join study. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  // Check for pending survey code after login
  useEffect(() => {
    const pendingCode = sessionStorage.getItem('pending_survey_code');
    if (pendingCode && user && !token && !projectId) {
      sessionStorage.removeItem('pending_survey_code');
      setSurveyCode(pendingCode);
      // Auto-submit after a brief delay
      setTimeout(() => {
        const form = document.getElementById('join-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }, 500);
    }
  }, [user, token, projectId]);

  // Loading state for invite link validation
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--color-green)' }} />
      </div>
    );
  }

  // Show invitation details if valid token
  if (project) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-2xl mx-auto p-8 pt-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#dcfce7' }}>
                <Users size={32} style={{ color: 'var(--color-green)' }} />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Research Invitation
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                You've been invited to participate in a research study
              </p>
            </div>

            <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {project.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {project.description || 'No description provided'}
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={acceptInvitation}
                disabled={joining}
                className="flex-1 px-6 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                {joining ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Accept & Start
                  </>
                )}
              </button>
              <button 
                onClick={() => navigate('/easyresearch')}
                className="px-6 py-3 rounded-xl font-medium"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Join by code form
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto p-8 pt-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#dcfce7' }}>
              <KeyRound size={32} style={{ color: 'var(--color-green)' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Join a Study
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Enter the survey code provided by your researcher
            </p>
          </div>

          <form id="join-form" onSubmit={handleJoinByCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Survey Code
              </label>
              <input
                type="text"
                value={surveyCode}
                onChange={(e) => setSurveyCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                className="w-full px-4 py-3 rounded-xl text-lg font-mono tracking-wider text-center"
                style={{ 
                  border: '2px solid var(--border-light)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                maxLength={10}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={joining || !surveyCode.trim()}
              className="w-full px-6 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              {joining ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Join Study
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-light)' }}>
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              Don't have a code?{' '}
              <button 
                onClick={() => navigate('/easyresearch/home')}
                className="font-medium"
                style={{ color: 'var(--color-green)' }}
              >
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
