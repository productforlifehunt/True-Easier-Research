import React, { useState, useEffect } from 'react';
import { X, FileText, Clock, Calendar, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import SurveyMethodologySelector from './SurveyMethodologySelector';
import CustomDropdown from './CustomDropdown';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    methodology: 'single_survey',
    duration_days: 7,
    prompts_per_day: 5,
    sampling_strategy: 'fixed_schedule', // fixed_schedule or random_sampling
    notification_times: [] as string[],
    time_window_minutes: 60,
    escape_window_minutes: 120, // Late response window
    start_hour: 8,
    end_hour: 21,
    dnd_periods: [{ start: '22:00', end: '07:00' }] as Array<{start: string, end: string}>,
    ai_enabled: false,
    voice_enabled: true,
    max_participants: 100,
    requires_consent: true,
    consent_text: ''
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setLoading(false);
    }
  }, [isOpen]);

  const steps = [
    { id: 1, name: 'Study Type', description: 'Choose your research methodology' },
    { id: 2, name: 'Basic Info', description: 'Name and describe your study' },
    { id: 3, name: 'Schedule', description: 'Configure timing and notifications' },
    { id: 4, name: 'Settings', description: 'Voice input and consent options' }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Get researcher organization
      let { data: researcher, error: researcherError } = await supabase
        .from('researcher')
        .select('id, organization_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (researcherError) {
        console.error('Error fetching researcher:', researcherError);
        // Create default researcher if not exists
        const { data: defaultOrg } = await supabase
          .from('organization')
          .select('id')
          .limit(1)
          .maybeSingle();
          
        if (defaultOrg) {
          const { data: newResearcher } = await supabase
            .from('researcher')
            .insert({
              user_id: user?.id,
              organization_id: defaultOrg.id,
              role: 'researcher'
            })
            .select()
            .single();
            
          if (newResearcher) {
            researcher = newResearcher;
          }
        }
      }

      if (researcher) {
        // Create project based on methodology
        const notificationSettings = projectData.methodology === 'esm' || projectData.methodology === 'ema' ? {
          frequency: 'multiple_daily',
          times_per_day: projectData.prompts_per_day,
          notification_times: generateNotificationTimes(
            projectData.prompts_per_day, 
            projectData.start_hour, 
            projectData.end_hour,
            projectData.sampling_strategy
          ),
          send_reminders: true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        } : projectData.methodology === 'daily_diary' ? {
          frequency: 'daily',
          times_per_day: 1,
          notification_times: [`${projectData.start_hour.toString().padStart(2, '0')}:00`],
          send_reminders: true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        } : projectData.methodology === 'longitudinal' ? {
          frequency: 'periodic',
          interval_days: projectData.prompts_per_day,
          notification_times: ['09:00'],
          send_reminders: true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        } : {
          frequency: 'once',
          send_reminders: false
        };

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
              enable_elaboration_questions: false,
              show_progress_tracker: true
            },
            notification_setting: notificationSettings,
            consent_form: projectData.requires_consent ? {
              required: true,
              title: 'Research Consent Form',
              form_text: projectData.consent_text || 'By participating in this study, you agree to provide honest responses. Your data will be kept confidential.'
            } : null,
            sampling_strategy: projectData.methodology === 'esm' || projectData.methodology === 'ema' ? {
              type: projectData.sampling_strategy,
              prompts_per_day: projectData.prompts_per_day,
              duration_days: projectData.duration_days,
              start_hour: projectData.start_hour,
              end_hour: projectData.end_hour,
              allow_late_responses: true,
              late_window_minutes: projectData.time_window_minutes
            } : projectData.methodology === 'daily_diary' ? {
              type: 'fixed_schedule',
              prompts_per_day: 1,
              duration_days: projectData.duration_days,
              reminder_hour: projectData.start_hour,
              allow_late_responses: true,
              late_window_minutes: 720
            } : projectData.methodology === 'longitudinal' ? {
              type: 'periodic',
              interval_days: projectData.prompts_per_day,
              total_waves: Math.ceil(projectData.duration_days / projectData.prompts_per_day)
            } : null,
            status: 'draft'
          })
          .select()
          .single();

        if (projectError) {
          console.error('Error creating project:', projectError);
          toast.error('Failed to create project. Please try again.');
        } else if (project) {
          // Create default questions for the survey
          const defaultQuestions = [
            {
              project_id: project.id,
              question_text: 'How satisfied are you with our product?',
              question_type: 'likert_scale',
              required: true,
              order_index: 1,
              question_config: { scale_type: '1-5', labels: { 1: 'Very Unsatisfied', 5: 'Very Satisfied' } }
            },
            {
              project_id: project.id,
              question_text: 'What features do you use most often?',
              question_type: 'multiple_choice',
              required: true,
              order_index: 2,
              question_config: {}
            },
            {
              project_id: project.id,
              question_text: 'Any additional feedback?',
              question_type: 'long_text',
              required: false,
              order_index: 3
            }
          ];

          const { data: questions } = await supabase
            .from('survey_question')
            .insert(defaultQuestions)
            .select();

          // Add options for multiple choice question
          if (questions) {
            const mcQuestion = questions.find(q => q.question_type === 'multiple_choice');
            if (mcQuestion) {
              const options = [
                { question_id: mcQuestion.id, option_text: 'Dashboard', option_value: 'dashboard', order_index: 0, is_other: false },
                { question_id: mcQuestion.id, option_text: 'Analytics', option_value: 'analytics', order_index: 1, is_other: false },
                { question_id: mcQuestion.id, option_text: 'Reports', option_value: 'reports', order_index: 2, is_other: false },
                { question_id: mcQuestion.id, option_text: 'Settings', option_value: 'settings', order_index: 3, is_other: false },
                { question_id: mcQuestion.id, option_text: 'Collaboration', option_value: 'collaboration', order_index: 4, is_other: false }
              ];
              
              await supabase
                .from('question_option')
                .insert(options);
            }
          }

          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotificationTimes = (count: number, startHour: number, endHour: number, strategy: string) => {
    const times = [];
    
    if (strategy === 'random_sampling') {
      // Generate random times within the window
      const availableHours = endHour - startHour;
      for (let i = 0; i < count; i++) {
        const randomHour = startHour + Math.floor(Math.random() * availableHours);
        const randomMinute = Math.floor(Math.random() * 60);
        times.push(`${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}`);
      }
    } else {
      // Fixed schedule - evenly distributed
      const interval = (endHour - startHour) / count;
      for (let i = 0; i < count; i++) {
        const hour = Math.floor(startHour + (interval * i));
        const minutes = Math.floor(((startHour + (interval * i)) % 1) * 60);
        times.push(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    }
    
    return times.sort();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Create New Research Study
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ 
                    backgroundColor: currentStep > step.id ? '#22c55e' : 
                      currentStep === step.id ? '#16a34a' : 'var(--border-light)' 
                  }}
                >
                  {currentStep > step.id ? <Check size={20} /> : step.id}
                </div>
                <span className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className="h-1 w-24 mx-2"
                  style={{ backgroundColor: currentStep > step.id ? '#22c55e' : 'var(--border-light)' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Select Your Research Methodology
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Choose the type of study that best fits your research needs
              </p>
              <SurveyMethodologySelector
                selected={projectData.methodology}
                onSelect={(methodology) => {
                  setProjectData(prev => ({ ...prev, methodology }));
                }}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Study Title
                </label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--border-light)' }}
                  placeholder="e.g., Daily Mood and Activity Tracking Study"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Description
                </label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--border-light)' }}
                  rows={4}
                  placeholder="Describe your study objectives and what participants will be asked to do..."
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Duration Configuration */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Study Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={projectData.duration_days}
                  onChange={(e) => setProjectData({ ...projectData, duration_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--border-light)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {projectData.methodology === 'esm' ? '3-14 days recommended' : 
                   projectData.methodology === 'ema' ? '7-28 days recommended' :
                   projectData.methodology === 'daily_diary' ? '7-30 days recommended' :
                   projectData.methodology === 'longitudinal' ? '30-365 days recommended' : '1-365 days'}
                </p>
              </div>
              
              {/* Sampling Configuration for ESM/EMA */}
              {(projectData.methodology === 'esm' || projectData.methodology === 'ema') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Sampling Strategy
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setProjectData({ ...projectData, sampling_strategy: 'fixed_schedule' })}
                        className="p-4 rounded-lg border-2 text-left hover:shadow-md transition-all"
                        style={{
                          borderColor: projectData.sampling_strategy === 'fixed_schedule' ? 'var(--color-green)' : 'var(--border-light)',
                          backgroundColor: projectData.sampling_strategy === 'fixed_schedule' ? '#f0fdf4' : 'white'
                        }}
                      >
                        <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Fixed Schedule</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Notifications at specific times</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectData({ ...projectData, sampling_strategy: 'random_sampling' })}
                        className="p-4 rounded-lg border-2 text-left hover:shadow-md transition-all"
                        style={{
                          borderColor: projectData.sampling_strategy === 'random_sampling' ? 'var(--color-green)' : 'var(--border-light)',
                          backgroundColor: projectData.sampling_strategy === 'random_sampling' ? '#f0fdf4' : 'white'
                        }}
                      >
                        <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Random Sampling</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Randomized notification times</div>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Prompts Per Day
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={projectData.prompts_per_day}
                      onChange={(e) => setProjectData({ ...projectData, prompts_per_day: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-lg border-2"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Start Hour (24h)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={projectData.start_hour}
                        onChange={(e) => setProjectData({ ...projectData, start_hour: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-lg border-2"
                        style={{ borderColor: 'var(--border-light)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        End Hour (24h)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={projectData.end_hour}
                        onChange={(e) => setProjectData({ ...projectData, end_hour: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-lg border-2"
                        style={{ borderColor: 'var(--border-light)' }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Response Window (min)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="480"
                        value={projectData.time_window_minutes}
                        onChange={(e) => setProjectData({ ...projectData, time_window_minutes: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-lg border-2"
                        style={{ borderColor: 'var(--border-light)' }}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Time to respond
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Escape Window (min)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="720"
                        value={projectData.escape_window_minutes}
                        onChange={(e) => setProjectData({ ...projectData, escape_window_minutes: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-lg border-2"
                        style={{ borderColor: 'var(--border-light)' }}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Late response allowed
                      </p>
                    </div>
                  </div>
                  
                  {/* DND Periods Configuration */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Do Not Disturb Periods
                    </label>
                    <div className="space-y-3">
                      {projectData.dnd_periods.map((period, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="time"
                            value={period.start}
                            onChange={(e) => {
                              const newPeriods = [...projectData.dnd_periods];
                              newPeriods[index].start = e.target.value;
                              setProjectData({ ...projectData, dnd_periods: newPeriods });
                            }}
                            className="flex-1 px-4 py-2 rounded-lg border-2"
                            style={{ borderColor: 'var(--border-light)' }}
                          />
                          <span style={{ color: 'var(--text-secondary)' }}>to</span>
                          <input
                            type="time"
                            value={period.end}
                            onChange={(e) => {
                              const newPeriods = [...projectData.dnd_periods];
                              newPeriods[index].end = e.target.value;
                              setProjectData({ ...projectData, dnd_periods: newPeriods });
                            }}
                            className="flex-1 px-4 py-2 rounded-lg border-2"
                            style={{ borderColor: 'var(--border-light)' }}
                          />
                          {projectData.dnd_periods.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newPeriods = projectData.dnd_periods.filter((_, i) => i !== index);
                                setProjectData({ ...projectData, dnd_periods: newPeriods });
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setProjectData({
                            ...projectData,
                            dnd_periods: [...projectData.dnd_periods, { start: '12:00', end: '13:00' }]
                          });
                        }}
                        className="text-sm px-4 py-2 rounded-lg border-2"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        style={{ borderColor: 'var(--border-light)', color: 'var(--color-green)' }}
                      >
                        + Add DND Period
                      </button>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                      No notifications will be sent during these times
                    </p>
                  </div>
                </>
              )}
              
              {/* Daily Diary Configuration */}
              {projectData.methodology === 'daily_diary' && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Daily Reminder Time (24h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={projectData.start_hour}
                    onChange={(e) => setProjectData({ ...projectData, start_hour: parseInt(e.target.value), prompts_per_day: 1 })}
                    className="w-full px-4 py-3 rounded-lg border-2"
                    style={{ borderColor: 'var(--border-light)' }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Time of day for daily diary reminder (e.g., 20 for 8:00 PM)
                  </p>
                </div>
              )}
              
              {/* Longitudinal Configuration */}
              {projectData.methodology === 'longitudinal' && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Survey Frequency
                  </label>
                  <CustomDropdown
                    options={[
                      { value: '7', label: 'Weekly' },
                      { value: '14', label: 'Bi-weekly' },
                      { value: '30', label: 'Monthly' },
                      { value: '90', label: 'Quarterly' }
                    ]}
                    value={String(projectData.prompts_per_day)}
                    onChange={(value) => setProjectData({ ...projectData, prompts_per_day: parseInt(value) })}
                    placeholder="Select frequency"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Maximum Participants
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={projectData.max_participants}
                  onChange={(e) => setProjectData({ ...projectData, max_participants: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: 'var(--border-light)' }}
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={projectData.voice_enabled}
                    onChange={(e) => setProjectData({ ...projectData, voice_enabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      Enable Voice Input
                    </span>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Allow participants to respond using voice recordings
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={projectData.requires_consent}
                    onChange={(e) => setProjectData({ ...projectData, requires_consent: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      Require Consent Form
                    </span>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Participants must accept consent before starting
                    </p>
                  </div>
                </label>
              </div>
              
              {projectData.requires_consent && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Consent Text
                  </label>
                  <textarea
                    value={projectData.consent_text}
                    onChange={(e) => setProjectData({ ...projectData, consent_text: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2"
                    style={{ borderColor: 'var(--border-light)' }}
                    rows={4}
                    placeholder="Enter your consent form text..."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-lg font-semibold border-2 disabled:opacity-50 inline-flex items-center gap-2"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={20} />
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={loading || (currentStep === 2 && !projectData.title)}
            className="px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            {currentStep === 4 ? (
              loading ? 'Creating...' : 'Create Study'
            ) : (
              <>
                Next
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectDialog;
