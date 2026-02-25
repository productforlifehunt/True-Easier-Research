import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ChevronRight, Calendar, Clock } from 'lucide-react';

interface ParticipantOnboardingProps {
  projectId: string;
  onComplete: () => void;
}

const ParticipantOnboarding: React.FC<ParticipantOnboardingProps> = ({ projectId, onComplete }) => {
  const [project, setProject] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { loadProject(); }, [projectId]);

  const loadProject = async () => {
    try {
      const enrollmentId = localStorage.getItem(`enrollment_${projectId}`);
      if (enrollmentId) { navigate(`/easyresearch/participant/${projectId}?skip_consent=true`); return; }
      const { data: projectData } = await supabase.from('research_project').select('*').eq('id', projectId).maybeSingle();
      setProject(projectData);
    } catch (error) { console.error('Error loading project:', error); }
    finally { setLoading(false); }
  };

  const handleEnroll = async () => {
    if (!email) return;
    try {
      const { data: enrollment, error: enrollError } = await supabase.from('enrollment').insert({
        project_id: projectId, participant_id: user?.id || null, participant_email: email,
        status: 'active', consent_signed_at: new Date().toISOString(), study_start_date: new Date().toISOString().split('T')[0]
      }).select().single();
      if (enrollError) { console.error('Enrollment error:', enrollError); return; }
      if (enrollment) {
        localStorage.setItem(`enrollment_${projectId}`, enrollment.id);
        if (project?.project_type === 'longitudinal') {
          window.location.href = `/easyresearch/participant/${projectId}?skip_consent=true`;
        } else { onComplete(); }
      }
    } catch (error) { console.error('Error enrolling:', error); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-7">
          <h1 className="text-xl font-bold text-stone-800 mb-2">{project?.title}</h1>
          <p className="text-[13px] text-stone-400 font-light mb-6">{project?.description}</p>

          {project?.project_type === 'longitudinal' && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <h3 className="text-[13px] font-semibold text-stone-700 mb-2 flex items-center gap-2">
                <Calendar size={14} className="text-emerald-500" /> Study Information
              </h3>
              <div className="space-y-1.5 text-[12px] text-stone-500 font-light">
                <p>This longitudinal study tracks your experiences over time.</p>
                <p className="flex items-center gap-1.5">
                  <Clock size={11} className="text-stone-400" />
                  Duration: {project?.study_duration || 7} days
                </p>
                <p>Each survey takes only 2-3 minutes.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Your Email Address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-stone-50/50"
                placeholder="Enter your email" required
              />
            </div>
            <button onClick={handleEnroll} disabled={!email}
              className="w-full py-3 rounded-xl text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all disabled:opacity-40">
              {project?.project_type === 'longitudinal' ? 'Start Study' : 'Begin Survey'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantOnboarding;
