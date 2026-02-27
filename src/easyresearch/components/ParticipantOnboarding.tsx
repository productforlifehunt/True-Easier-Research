import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ChevronRight, Calendar, Clock, ChevronLeft } from 'lucide-react';

interface ProfileQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'scale' | 'section';
  options?: string[];
  required: boolean;
  config?: {
    min?: number;
    max?: number;
    min_label?: string;
    max_label?: string;
    placeholder?: string;
  };
}

interface ParticipantOnboardingProps {
  projectId: string;
  onComplete: () => void;
}

const ParticipantOnboarding: React.FC<ParticipantOnboardingProps> = ({ projectId, onComplete }) => {
  const [project, setProject] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'info' | 'profile'>('info');
  const [profileResponses, setProfileResponses] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { loadProject(); }, [projectId]);

  const loadProject = async () => {
    try {
      const enrollmentId = localStorage.getItem(`enrollment_${projectId}`);
      if (enrollmentId) { navigate(`/easyresearch/participant/${projectId}?skip_consent=true`); return; }
      const { data: projectData } = await supabase.from('research_project').select('*').eq('id', projectId).maybeSingle();
      if (projectData) {
        const settings = (projectData as any).setting || {};
        setProject({ ...projectData, profile_questions: (projectData as any).profile_question || settings.profile_questions });
      }
    } catch (error) { console.error('Error loading project:', error); }
    finally { setLoading(false); }
  };

  const profileQuestions: ProfileQuestion[] = project?.profile_questions || [];
  const hasProfileQuestions = profileQuestions.filter(q => q.type !== 'section').length > 0;

  const handleInfoNext = () => {
    if (!email) return;
    if (hasProfileQuestions) {
      setStep('profile');
    } else {
      handleEnroll();
    }
  };

  const handleEnroll = async () => {
    if (!email) return;
    try {
      const { data: enrollment, error: enrollError } = await supabase.from('enrollment').insert({
        project_id: projectId, participant_id: user?.id || null, participant_email: email,
        status: 'active', consent_signed_at: new Date().toISOString(), study_start_date: new Date().toISOString().split('T')[0],
        profile_data: Object.keys(profileResponses).length > 0 ? profileResponses : null
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

  const validateProfile = () => {
    for (const q of profileQuestions) {
      if (q.type === 'section') continue;
      if (q.required && (!profileResponses[q.id] || String(profileResponses[q.id]).trim() === '')) return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const renderProfileField = (q: ProfileQuestion) => {
    const val = profileResponses[q.id];
    const update = (v: any) => setProfileResponses(prev => ({ ...prev, [q.id]: v }));

    if (q.type === 'section') {
      return (
        <div key={q.id} className="pt-4 pb-1">
          <h3 className="text-[14px] font-semibold text-stone-800">{q.question}</h3>
          <div className="h-px bg-stone-200 mt-2" />
        </div>
      );
    }

    return (
      <div key={q.id}>
        <label className="block text-[12px] font-medium text-stone-500 mb-1.5">
          {q.question} {q.required && <span className="text-red-500">*</span>}
        </label>
        {q.type === 'text' && (
          <input type="text" value={val || ''} onChange={(e) => update(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-stone-50/50"
            placeholder={q.config?.placeholder || ''} />
        )}
        {q.type === 'number' && (
          <input type="number" value={val || ''} onChange={(e) => update(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-stone-50/50"
            placeholder={q.config?.placeholder || ''} />
        )}
        {q.type === 'date' && (
          <input type="date" value={val || ''} onChange={(e) => update(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-stone-50/50" />
        )}
        {q.type === 'select' && (
          <select value={val || ''} onChange={(e) => update(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-white">
            <option value="">Select...</option>
            {(q.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
        {q.type === 'multiselect' && (
          <div className="space-y-1.5">
            {(q.options || []).map(opt => {
              const selected = Array.isArray(val) && val.includes(opt);
              return (
                <label key={opt} className="flex items-center p-3 rounded-xl border cursor-pointer hover:bg-emerald-50/50 transition-all"
                  style={{ borderColor: selected ? '#10b981' : '#e7e5e4', backgroundColor: selected ? '#f0fdf4' : 'white' }}>
                  <input type="checkbox" checked={selected} onChange={(e) => {
                    const cur = Array.isArray(val) ? val : [];
                    update(e.target.checked ? [...cur, opt] : cur.filter((v: string) => v !== opt));
                  }} className="mr-3" />
                  <span className="text-[13px] text-stone-700">{opt}</span>
                </label>
              );
            })}
          </div>
        )}
        {q.type === 'scale' && (() => {
          const min = q.config?.min ?? 1;
          const max = q.config?.max ?? 5;
          const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);
          return (
            <div className="space-y-2">
              <div className="flex gap-1.5 justify-center flex-wrap">
                {points.map(v => (
                  <button key={v} onClick={() => update(v)}
                    className="w-10 h-10 rounded-xl border-2 text-[13px] font-semibold transition-all"
                    style={{
                      borderColor: val === v ? '#10b981' : '#e7e5e4',
                      backgroundColor: val === v ? '#f0fdf4' : 'white',
                      color: val === v ? '#10b981' : '#78716c'
                    }}>
                    {v}
                  </button>
                ))}
              </div>
              {(q.config?.min_label || q.config?.max_label) && (
                <div className="flex justify-between text-[11px] text-stone-400 px-1">
                  <span>{q.config?.min_label}</span>
                  <span>{q.config?.max_label}</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-7">
          {step === 'info' && (
            <>
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

              {project?.onboarding_instructions && (
                <div className="mb-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <p className="text-[13px] text-stone-600 whitespace-pre-wrap">{project.onboarding_instructions}</p>
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
                <button onClick={handleInfoNext} disabled={!email}
                  className="w-full py-3 rounded-xl text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all disabled:opacity-40">
                  {hasProfileQuestions ? 'Continue to Profile' : (project?.project_type === 'longitudinal' ? 'Start Study' : 'Begin Survey')}
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}

          {step === 'profile' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep('info')} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                  <ChevronLeft size={16} className="text-stone-500" />
                </button>
                <h2 className="text-lg font-bold text-stone-800">Your Profile</h2>
              </div>
              <p className="text-[12px] text-stone-400 font-light mb-5">Please fill out the following information before starting.</p>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {profileQuestions.map(q => renderProfileField(q))}
              </div>

              <button onClick={handleEnroll} disabled={!validateProfile()}
                className="w-full mt-6 py-3 rounded-xl text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all disabled:opacity-40">
                {project?.project_type === 'longitudinal' ? 'Start Study' : 'Begin Survey'}
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantOnboarding;
