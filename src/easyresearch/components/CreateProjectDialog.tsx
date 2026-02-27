import React, { useState, useEffect } from 'react';
import { X, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import SurveyMethodologySelector from './SurveyMethodologySelector';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    methodology: 'single_survey',
    duration_days: 7,
    prompts_per_day: 5,
    sampling_strategy: 'fixed_schedule',
    time_window_minutes: 60,
    start_hour: 8,
    end_hour: 21,
    ai_enabled: false,
    voice_enabled: true,
    max_participants: 100,
    requires_consent: true,
    consent_text: ''
  });

  useEffect(() => {
    if (isOpen) { setCurrentStep(1); setLoading(false); }
  }, [isOpen]);

  const steps = [
    { id: 1, name: 'Type' },
    { id: 2, name: 'Info' },
    { id: 3, name: 'Schedule' },
    { id: 4, name: 'Settings' }
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    else handleCreate();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const generateNotificationTimes = (count: number, startHour: number, endHour: number, strategy: string) => {
    const times = [];
    if (strategy === 'random_sampling') {
      const availableHours = endHour - startHour;
      for (let i = 0; i < count; i++) {
        const h = startHour + Math.floor(Math.random() * availableHours);
        const m = Math.floor(Math.random() * 60);
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    } else {
      const interval = (endHour - startHour) / count;
      for (let i = 0; i < count; i++) {
        const hour = Math.floor(startHour + (interval * i));
        const minutes = Math.floor(((startHour + (interval * i)) % 1) * 60);
        times.push(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    }
    return times.sort();
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      let { data: researcher, error: researcherError } = await supabase
        .from('researcher').select('id, organization_id').eq('user_id', user?.id).maybeSingle();

      if (researcherError) {
        const { data: defaultOrg } = await supabase.from('organization').select('id').limit(1).maybeSingle();
        if (defaultOrg) {
          const { data: newResearcher } = await supabase
            .from('researcher').insert({ user_id: user?.id, organization_id: defaultOrg.id, role: 'researcher' }).select().single();
          if (newResearcher) researcher = newResearcher;
        }
      }

      if (!researcher) { toast.error('Failed to find researcher profile'); return; }

      const notificationSettings = projectData.methodology === 'esm' || projectData.methodology === 'ema' ? {
        frequency: 'multiple_daily', times_per_day: projectData.prompts_per_day,
        notification_times: generateNotificationTimes(projectData.prompts_per_day, projectData.start_hour, projectData.end_hour, projectData.sampling_strategy),
        send_reminders: true, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      } : projectData.methodology === 'daily_diary' ? {
        frequency: 'daily', times_per_day: 1,
        notification_times: [`${projectData.start_hour.toString().padStart(2, '0')}:00`],
        send_reminders: true, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      } : projectData.methodology === 'longitudinal' ? {
        frequency: 'periodic', interval_days: projectData.prompts_per_day,
        notification_times: ['09:00'], send_reminders: true, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      } : { frequency: 'once', send_reminders: false };

      const { data: project, error: projectError } = await supabase
        .from('research_project')
        .insert({
          organization_id: researcher.organization_id,
          researcher_id: (researcher as any).id,
          title: projectData.title || 'Untitled Project',
          description: projectData.description || 'Survey description',
          methodology_type: projectData.methodology,
          project_type: projectData.methodology === 'single_survey' ? 'survey' : 'longitudinal',
          ai_enabled: projectData.ai_enabled,
          voice_enabled: projectData.voice_enabled,
          notification_enabled: true,
          max_participant: projectData.max_participants,
          study_duration: projectData.duration_days,
          setting: {
            study_duration_days: projectData.duration_days,
            enable_timeline_view: projectData.methodology !== 'single_survey',
            show_progress_tracker: true
          },
          notification_setting: notificationSettings,
          consent_form: projectData.requires_consent ? {
            required: true, title: 'Research Consent Form',
            form_text: projectData.consent_text || 'By participating in this study, you agree to provide honest responses. Your data will be kept confidential.'
          } : null,
          sampling_strategy: projectData.methodology === 'esm' || projectData.methodology === 'ema' ? {
            type: projectData.sampling_strategy, prompts_per_day: projectData.prompts_per_day,
            duration_days: projectData.duration_days, start_hour: projectData.start_hour, end_hour: projectData.end_hour,
            allow_late_responses: true, late_window_minutes: projectData.time_window_minutes
          } : projectData.methodology === 'daily_diary' ? {
            type: 'fixed_schedule', prompts_per_day: 1, duration_days: projectData.duration_days,
            reminder_hour: projectData.start_hour, allow_late_responses: true, late_window_minutes: 720
          } : projectData.methodology === 'longitudinal' ? {
            type: 'periodic', interval_days: projectData.prompts_per_day,
            total_waves: Math.ceil(projectData.duration_days / projectData.prompts_per_day)
          } : null,
          status: 'draft'
        }).select().single();

      if (projectError) { toast.error('Failed to create project'); return; }

      if (project) {
        const defaultQuestions = [
          { project_id: project.id, question_text: 'How satisfied are you with our product?', question_type: 'likert_scale', required: true, order_index: 1, question_config: { scale_type: '1-5', labels: { 1: 'Very Unsatisfied', 5: 'Very Satisfied' } } },
          { project_id: project.id, question_text: 'What features do you use most often?', question_type: 'multiple_choice', required: true, order_index: 2, question_config: {} },
          { project_id: project.id, question_text: 'Any additional feedback?', question_type: 'long_text', required: false, order_index: 3 }
        ];

        const { data: questions } = await supabase.from('survey_question').insert(defaultQuestions).select();

        if (questions) {
          const mcQuestion = questions.find(q => q.question_type === 'multiple_choice');
          if (mcQuestion) {
            await supabase.from('question_option').insert([
              { question_id: mcQuestion.id, option_text: 'Dashboard', option_value: 'dashboard', order_index: 0, is_other: false },
              { question_id: mcQuestion.id, option_text: 'Analytics', option_value: 'analytics', order_index: 1, is_other: false },
              { question_id: mcQuestion.id, option_text: 'Reports', option_value: 'reports', order_index: 2, is_other: false },
              { question_id: mcQuestion.id, option_text: 'Settings', option_value: 'settings', order_index: 3, is_other: false },
            ]);
          }
        }

        onSuccess();
        onClose();
      }
    } catch (error) { console.error('Error creating project:', error); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-xl border border-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-[17px] font-semibold text-stone-800">New Research Study</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-50 transition-colors">
            <X size={18} className="text-stone-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 border-b border-stone-100" style={{ backgroundColor: 'rgba(16,185,129,0.02)' }}>
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                    currentStep > step.id ? 'bg-emerald-500 text-white' :
                    currentStep === step.id ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200' : 'bg-stone-200 text-stone-500'
                  }`}>
                    {currentStep > step.id ? <Check size={12} /> : step.id}
                  </div>
                  <span className={`text-[12px] font-medium ${currentStep >= step.id ? 'text-stone-800' : 'text-stone-400'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px ${currentStep > step.id ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {currentStep === 1 && (
            <div>
              <h3 className="text-[15px] font-semibold text-stone-800 mb-1.5">Research Methodology</h3>
              <p className="text-[13px] text-stone-400 mb-5">Choose the type of study that fits your needs.</p>
              <SurveyMethodologySelector
                selected={projectData.methodology}
                onSelect={(methodology) => setProjectData(prev => ({ ...prev, methodology }))}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Study Title</label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  placeholder="e.g., Daily Mood Tracking Study"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Description</label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                  rows={3}
                  placeholder="Describe your study objectives..."
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Duration (Days)</label>
                <input
                  type="number" min="1" max="365"
                  value={projectData.duration_days}
                  onChange={(e) => setProjectData({ ...projectData, duration_days: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
              {(projectData.methodology === 'esm' || projectData.methodology === 'ema') && (
                <>
                  <div>
                    <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Sampling Strategy</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'fixed_schedule', label: 'Fixed Schedule', desc: 'Notifications at set times' },
                        { value: 'random_sampling', label: 'Random', desc: 'Random times in window' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setProjectData({ ...projectData, sampling_strategy: opt.value })}
                          className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                            projectData.sampling_strategy === opt.value
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-stone-100 hover:border-stone-200'
                          }`}
                        >
                          <p className="text-[13px] font-medium text-stone-800">{opt.label}</p>
                          <p className="text-[11px] text-stone-400">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Prompts/Day</label>
                      <input type="number" min="1" max="20" value={projectData.prompts_per_day}
                        onChange={(e) => setProjectData({ ...projectData, prompts_per_day: parseInt(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Response Window (min)</label>
                      <input type="number" min="15" max="360" value={projectData.time_window_minutes}
                        onChange={(e) => setProjectData({ ...projectData, time_window_minutes: parseInt(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Start Hour</label>
                      <input type="number" min="0" max="23" value={projectData.start_hour}
                        onChange={(e) => setProjectData({ ...projectData, start_hour: parseInt(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-stone-400 mb-1.5">End Hour</label>
                      <input type="number" min="0" max="23" value={projectData.end_hour}
                        onChange={(e) => setProjectData({ ...projectData, end_hour: parseInt(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </>
              )}
              {projectData.methodology === 'longitudinal' && (
                <div>
                  <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Days Between Surveys</label>
                  <input type="number" min="1" max="90" value={projectData.prompts_per_day}
                    onChange={(e) => setProjectData({ ...projectData, prompts_per_day: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  />
                </div>
              )}
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Max Participants</label>
                <input type="number" min="1" value={projectData.max_participants}
                  onChange={(e) => setProjectData({ ...projectData, max_participants: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-stone-100">
                <div>
                  <p className="text-[14px] font-medium text-stone-800">Voice Input</p>
                  <p className="text-[12px] text-stone-400 font-light">Allow participants to record voice answers</p>
                </div>
                <button
                  onClick={() => setProjectData({ ...projectData, voice_enabled: !projectData.voice_enabled })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${projectData.voice_enabled ? 'bg-emerald-500' : 'bg-stone-200'}`}
                >
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                    style={{ left: projectData.voice_enabled ? '22px' : '2px' }} />
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-stone-100">
                <div>
                  <p className="text-[14px] font-medium text-stone-800">Consent Form</p>
                  <p className="text-[12px] text-stone-400 font-light">Require consent before participation</p>
                </div>
                <button
                  onClick={() => setProjectData({ ...projectData, requires_consent: !projectData.requires_consent })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${projectData.requires_consent ? 'bg-emerald-500' : 'bg-stone-200'}`}
                >
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                    style={{ left: projectData.requires_consent ? '22px' : '2px' }} />
                </button>
              </div>
              {projectData.requires_consent && (
                <div>
                  <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Consent Text</label>
                  <textarea
                    value={projectData.consent_text}
                    onChange={(e) => setProjectData({ ...projectData, consent_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                    rows={3}
                    placeholder="By participating in this study, you agree to..."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100" style={{ backgroundColor: 'rgba(16,185,129,0.02)' }}>
          <button
            onClick={currentStep === 1 ? onClose : handleBack}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-[13px] font-medium text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <ChevronLeft size={14} /> {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center gap-1 px-5 py-2 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all shadow-sm shadow-emerald-200"
          >
            {loading ? 'Creating...' : currentStep === 4 ? 'Create Study' : 'Continue'}
            {!loading && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectDialog;
