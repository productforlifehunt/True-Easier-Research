import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ChevronRight, Calendar, Clock, ChevronLeft, AlertCircle, ShieldCheck, Users } from 'lucide-react';
import { saveProfileData } from '../utils/enrollmentSync';

interface ParticipantTypeInfo {
  id: string;
  name: string;
  description: string;
  color: string;
  numbering_enabled: boolean;
  number_prefix: string;
}

interface ProfileQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'scale' | 'section';
  options?: string[];
  required: boolean;
  config?: { min?: number; max?: number; min_label?: string; max_label?: string; placeholder?: string; };
}

interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'yes_no' | 'text' | 'select';
  options?: string[];
  required: boolean;
  disqualify_value?: string;
}

interface ParticipantOnboardingProps {
  projectId: string;
  onComplete: () => void;
}

const ParticipantOnboarding: React.FC<ParticipantOnboardingProps> = ({ projectId, onComplete }) => {
  const [project, setProject] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [participantNumber, setParticipantNumber] = useState('');
  const [participantRelation, setParticipantRelation] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'screening' | 'info' | 'profile'>('info');
  const [screeningResponses, setScreeningResponses] = useState<Record<string, any>>({});
  const [profileResponses, setProfileResponses] = useState<Record<string, any>>({});
  const [disqualified, setDisqualified] = useState(false);
  const [participantTypes, setParticipantTypes] = useState<ParticipantTypeInfo[]>([]);
  const [selectedParticipantTypeId, setSelectedParticipantTypeId] = useState<string>('');
  const selectedType = participantTypes.find(pt => pt.id === selectedParticipantTypeId);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { loadProject(); }, [projectId]);

  const loadProject = async () => {
    try {
      const enrollmentId = localStorage.getItem(`enrollment_${projectId}`);
      if (enrollmentId) { navigate(`/easyresearch/participant/${projectId}`); return; }
      const { data: projectData } = await supabase.from('research_project').select('*').eq('id', projectId).maybeSingle();
      if (projectData) {
        // Load screening questions from questionnaire table (type = 'screening')
        let loadedScreeningQuestions: ScreeningQuestion[] = [];
        const { data: screeningQuestionnaires } = await supabase
          .from('questionnaire')
          .select('id')
          .eq('project_id', projectId)
          .eq('questionnaire_type', 'screening');
        if (screeningQuestionnaires && screeningQuestionnaires.length > 0) {
          const sqIds = screeningQuestionnaires.map((q: any) => q.id);
          const { data: sqRows } = await supabase
            .from('question')
            .select('*')
            .in('questionnaire_id', sqIds)
            .order('order_index');
          if (sqRows) {
            loadedScreeningQuestions = sqRows.map((q: any) => ({
              id: q.id,
              question: q.question_text,
              type: q.question_type === 'yes_no' ? 'yes_no' as const : q.question_type === 'single_choice' ? 'select' as const : 'text' as const,
              required: q.required ?? true,
              disqualify_value: q.question_config?.disqualify_value || undefined,
            }));
          }
        }

        // Load profile questions from profile_question table
        const { data: profileRows } = await supabase
          .from('profile_question')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index');

        // Load participant types
        const { data: ptRows } = await supabase
          .from('participant_type')
          .select('id, name, description, color, numbering_enabled, number_prefix')
          .eq('project_id', projectId)
          .order('order_index');
        if (ptRows && ptRows.length > 0) {
          setParticipantTypes(ptRows.map((pt: any) => ({
            id: pt.id,
            name: pt.name,
            description: pt.description || '',
            color: pt.color || '#10b981',
            numbering_enabled: pt.numbering_enabled ?? true,
            number_prefix: pt.number_prefix || '',
          })));
          // Auto-select if only one type
          if (ptRows.length === 1) setSelectedParticipantTypeId(ptRows[0].id);
        }

        const screeningEnabled = loadedScreeningQuestions.length > 0;

        setProject({
          ...projectData,
          profile_questions: (profileRows || []).map((pq: any) => ({
            id: pq.id,
            question: pq.question_text,
            type: pq.question_type || 'text',
            options: pq.options || [],
            required: pq.required ?? false,
          })),
          screening_questions: loadedScreeningQuestions,
          screening_enabled: screeningEnabled,
        });
        if (screeningEnabled && loadedScreeningQuestions.length > 0) {
          setStep('screening');
        }
      }
    } catch (error) { console.error('Error loading project:', error); }
    finally { setLoading(false); }
  };

  const screeningQuestions: ScreeningQuestion[] = project?.screening_questions || [];
  const profileQuestions: ProfileQuestion[] = project?.profile_questions || [];
  const hasProfileQuestions = profileQuestions.filter(q => q.type !== 'section').length > 0;
  const hasScreening = project?.screening_enabled && screeningQuestions.length > 0;

  const checkScreeningEligibility = (): boolean => {
    for (const sq of screeningQuestions) {
      if (sq.disqualify_value && screeningResponses[sq.id] === sq.disqualify_value) {
        return false;
      }
    }
    return true;
  };

  const handleScreeningNext = () => {
    // Check all required screening questions answered
    for (const sq of screeningQuestions) {
      if (sq.required && !screeningResponses[sq.id]) return;
    }
    if (!checkScreeningEligibility()) {
      setDisqualified(true);
      return;
    }
    setStep('info');
  };

  const handleInfoNext = () => {
    if (!email) return;
    // Require participant type selection when multiple types exist
    if (participantTypes.length > 1 && !selectedParticipantTypeId) return;
    if (hasProfileQuestions) {
      setStep('profile');
    } else {
      handleEnroll();
    }
  };

  const handleEnroll = async () => {
    if (!email) return;
    try {
      // Generate participant number per participant type if numbering enabled
      let assignedNumber = participantNumber;
      if (selectedType?.numbering_enabled && !assignedNumber) {
        const prefix = selectedType.number_prefix || 'P';
        // Count existing enrollments of the same participant type for this project
        const { count } = await supabase
          .from('enrollment')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .eq('participant_type_id', selectedParticipantTypeId);
        assignedNumber = `${prefix}${String((count || 0) + 1).padStart(3, '0')}`;
      }

      const { data: enrollment, error: enrollError } = await supabase.from('enrollment').insert({
        project_id: projectId,
        participant_id: user?.id || null,
        participant_email: email,
        participant_number: assignedNumber || null,
        participant_type_id: selectedParticipantTypeId || null,
        status: 'active',
        study_start_date: new Date().toISOString().split('T')[0],
      }).select().single();

      if (enrollError) { console.error('Enrollment error:', enrollError); return; }
      if (enrollment) {
        // Save profile responses to flat table instead of JSONB
        if (Object.keys(profileResponses).length > 0) {
          await saveProfileData(enrollment.id, profileResponses);
        }
        localStorage.setItem(`enrollment_${projectId}`, enrollment.id);
        if (project?.project_type === 'longitudinal') {
          window.location.href = `/easyresearch/participant/${projectId}`;
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

  if (disqualified) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-7 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-50 flex items-center justify-center">
              <AlertCircle className="text-orange-500" size={24} />
            </div>
            <h2 className="text-lg font-bold text-stone-800 mb-2">Not Eligible</h2>
            <p className="text-[13px] text-stone-500 font-light mb-4">
              Based on your screening responses, you do not meet the eligibility criteria for this study.
              Thank you for your interest.
            </p>
            <button onClick={() => navigate('/easyresearch')}
              className="px-6 py-2.5 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500">
              Return Home
            </button>
          </div>
        </div>
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
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-stone-50/50" />
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
                    style={{ borderColor: val === v ? '#10b981' : '#e7e5e4', backgroundColor: val === v ? '#f0fdf4' : 'white', color: val === v ? '#10b981' : '#78716c' }}>
                    {v}
                  </button>
                ))}
              </div>
              {(q.config?.min_label || q.config?.max_label) && (
                <div className="flex justify-between text-[11px] text-stone-400 px-1">
                  <span>{q.config?.min_label}</span><span>{q.config?.max_label}</span>
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
          
          {/* Step indicator */}
          {(hasScreening || hasProfileQuestions) && (
            <div className="flex items-center gap-2 mb-6">
              {hasScreening && (
                <div className={`flex-1 h-1 rounded-full ${step === 'screening' ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
              )}
              <div className={`flex-1 h-1 rounded-full ${step === 'info' ? 'bg-emerald-500' : step === 'profile' ? 'bg-emerald-200' : 'bg-stone-200'}`} />
              {hasProfileQuestions && (
                <div className={`flex-1 h-1 rounded-full ${step === 'profile' ? 'bg-emerald-500' : 'bg-stone-200'}`} />
              )}
            </div>
          )}

          {/* Screening Step */}
          {step === 'screening' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                  <ShieldCheck size={16} className="text-orange-500" />
                </div>
                <h2 className="text-lg font-bold text-stone-800">Eligibility Screening</h2>
              </div>
              <p className="text-[12px] text-stone-400 font-light mb-5">Please answer the following questions to check your eligibility.</p>
              <div className="space-y-4">
                {screeningQuestions.map(sq => (
                  <div key={sq.id}>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      {sq.question} {sq.required && <span className="text-red-500">*</span>}
                    </label>
                    {sq.type === 'yes_no' && (
                      <div className="flex gap-2">
                        {['yes', 'no'].map(v => (
                          <button key={v} onClick={() => setScreeningResponses(prev => ({ ...prev, [sq.id]: v }))}
                            className={`flex-1 py-3 rounded-xl text-[13px] font-medium border-2 transition-all capitalize ${
                              screeningResponses[sq.id] === v ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'}`}>
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                    {sq.type === 'text' && (
                      <input type="text" value={screeningResponses[sq.id] || ''}
                        onChange={e => setScreeningResponses(prev => ({ ...prev, [sq.id]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                    )}
                    {sq.type === 'select' && (
                      <select value={screeningResponses[sq.id] || ''}
                        onChange={e => setScreeningResponses(prev => ({ ...prev, [sq.id]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] bg-white">
                        <option value="">Select...</option>
                        {(sq.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleScreeningNext}
                className="w-full mt-6 py-3 rounded-xl text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all disabled:opacity-40"
                disabled={screeningQuestions.some(sq => sq.required && !screeningResponses[sq.id])}>
                Continue <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Info Step */}
          {step === 'info' && (
            <>
              {hasScreening && (
                <button onClick={() => setStep('screening')} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors mb-2">
                  <ChevronLeft size={16} className="text-stone-500" />
                </button>
              )}
              <h1 className="text-xl font-bold text-stone-800 mb-2">{project?.title}</h1>
              <p className="text-[13px] text-stone-400 font-light mb-6">{project?.description}</p>

              {project?.project_type === 'longitudinal' && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <h3 className="text-[13px] font-semibold text-stone-700 mb-2 flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-500" /> Study Information
                  </h3>
                  <div className="space-y-1.5 text-[12px] text-stone-500 font-light">
                    <p>This longitudinal study tracks your experiences over time.</p>
                    <p className="flex items-center gap-1.5"><Clock size={11} className="text-stone-400" /> Duration: {project?.study_duration || 7} days</p>
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
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-stone-50/50"
                    placeholder="Enter your email" required />
                </div>

                {/* Participant Type Selection */}
                {participantTypes.length > 1 && (
                  <div>
                    <label className="block text-[12px] font-medium text-stone-500 mb-1.5 flex items-center gap-1">
                      <Users size={12} /> Select Your Participant Type <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {participantTypes.map(pt => (
                        <button key={pt.id} onClick={() => setSelectedParticipantTypeId(pt.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            selectedParticipantTypeId === pt.id
                              ? 'border-emerald-400 bg-emerald-50/50'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}>
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pt.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-stone-800">{pt.name}</p>
                            {pt.description && <p className="text-[11px] text-stone-400 truncate">{pt.description}</p>}
                          </div>
                          {selectedParticipantTypeId === pt.id && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Participant Number — auto from participant type */}
                {selectedType?.numbering_enabled && (
                  <div>
                    <label className="block text-[12px] font-medium text-stone-500 mb-1.5">
                      Participant Number <span className="text-stone-400">(e.g., {selectedType?.number_prefix || 'P'}001)</span>
                    </label>
                    <input type="text" value={participantNumber} onChange={(e) => setParticipantNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-stone-50/50"
                      placeholder={`${selectedType?.number_prefix || 'P'}### (leave blank for auto-assign)`} />
                  </div>
                )}

                <button onClick={handleInfoNext} disabled={!email || (participantTypes.length > 1 && !selectedParticipantTypeId)}
                  className="w-full py-3 rounded-xl text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transition-all disabled:opacity-40">
                  {hasProfileQuestions ? 'Continue to Profile' : (project?.project_type === 'longitudinal' ? 'Start Study' : 'Begin Survey')}
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* Profile Step */}
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
