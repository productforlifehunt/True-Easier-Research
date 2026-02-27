import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, Pencil } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import SurveySettings from './SurveySettings';
import SurveyLogic from './SurveyLogic';
import SurveyPreview from './SurveyPreview';
import ProjectResponsesTab from './ProjectResponsesTab';
import QuestionnaireList, { type QuestionnaireConfig } from './QuestionnaireList';
import ParticipantTypeManager, { type ParticipantType } from './ParticipantTypeManager';
import LayoutBuilder, { type AppLayout, getDefaultLayout } from './LayoutBuilder';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  question_description?: string;
  question_config: any;
  validation_rule: any;
  logic_rule: any;
  ai_config: any;
  order_index: number;
  section_name?: string;
  required: boolean;
  allow_voice: boolean;
  allow_ai_assist: boolean;
  options?: QuestionOption[];
}

interface QuestionOption {
  id: string;
  option_text: string;
  option_value?: string;
  order_index: number;
  is_other: boolean;
}

export interface SurveyProject {
  id?: string;
  organization_id?: string;
  researcher_id?: string;
  title: string;
  description: string;
  status?: string;
  project_type: string;
  ai_enabled: boolean;
  voice_enabled: boolean;
  notification_enabled: boolean;
  consent_required?: boolean;
  consent_form_url?: string;
  consent_form_text?: string;
  consent_form: any;
  recruitment_criteria: any;
  notification_settings: any;
  compensation_amount?: number;
  compensation_type?: string;
  max_participants?: number;
  starts_at?: string;
  ends_at?: string;
  survey_code?: string;
  published_at?: string | null;
  study_duration?: number;
  survey_frequency?: string;
  allow_participant_dnd?: boolean;
  participant_numbering?: boolean;
  onboarding_required?: boolean;
  onboarding_instructions?: string;
  profile_questions?: Array<{
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
      scale_type?: string;
      placeholder?: string;
    };
  }>;
  allow_start_date_selection?: boolean;
  show_progress_bar?: boolean;
  disable_backtracking?: boolean;
  randomize_questions?: boolean;
  auto_advance?: boolean;
}

type TabId = 'questionnaires' | 'logic' | 'layout' | 'settings' | 'preview' | 'responses';

const SurveyBuilder: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const templateData = (location.state as any)?.template;

  React.useEffect(() => {
    if (!authLoading && !user) {
      const redirectTo = `/easyresearch/${projectId ? `project/${projectId}` : 'create-survey'}`;
      navigate(`/easyresearch/auth?redirectTo=${encodeURIComponent(redirectTo)}&redirect=researcher`, { replace: true });
    }
  }, [user, authLoading, navigate]);

  React.useEffect(() => {
    if (templateData || projectId) return;
    try {
      const raw = sessionStorage.getItem('easyresearch_pending_template');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.id) return;
      sessionStorage.removeItem('easyresearch_pending_template');
      navigate(location.pathname + location.search, {
        replace: true,
        state: { template: parsed },
      });
    } catch {
      // ignore
    }
  }, [templateData, projectId, navigate, location.pathname, location.search]);

  const [project, setProject] = useState<SurveyProject>({
    title: '',
    description: '',
    project_type: 'survey',
    ai_enabled: false,
    voice_enabled: false,
    notification_enabled: true,
    consent_form: {},
    recruitment_criteria: {},
    notification_settings: {}
  });
  // Legacy global questions state - only used for loading/migration, all questions now live inside questionnaire configs
  const [questions, setQuestions] = useState<Question[]>([]);
  const initialTab = (location.state as any)?.activeTab as TabId | undefined;
  const [activeTab, setActiveTab] = useState<TabId>(initialTab || 'settings');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logicRules, setLogicRules] = useState<any[]>([]);

  // New state for multi-questionnaire architecture
  const [questionnaireConfigs, setQuestionnaireConfigs] = useState<QuestionnaireConfig[]>([]);
  const [participantTypes, setParticipantTypes] = useState<ParticipantType[]>([]);
  const [appLayout, setAppLayout] = useState<AppLayout>(getDefaultLayout([]));

  const projectStatus = (project as any)?.status || 'draft';

  const normalizeProject = (p: any) => {
    if (!p) return p;
    const s = p.setting ?? p.settings ?? {};
    return {
      ...p,
      settings: s,
      notification_settings: p.notification_settings ?? p.notification_setting,
      max_participants: p.max_participants ?? p.max_participant,
      starts_at: p.starts_at ?? p.start_at,
      ends_at: p.ends_at ?? p.end_at,
      onboarding_instructions: p.onboarding_instructions ?? p.onboarding_instruction,
      profile_questions: p.profile_questions ?? p.profile_question,
      show_progress_bar: p.show_progress_bar ?? s.show_progress_bar,
      disable_backtracking: p.disable_backtracking ?? s.disable_backtracking,
      randomize_questions: p.randomize_questions ?? s.randomize_questions,
      auto_advance: p.auto_advance ?? s.auto_advance,
      consent_required: p.consent_required ?? s.consent_required,
      consent_form_url: p.consent_form_url ?? s.consent_form_url,
      consent_form_text: p.consent_form_text ?? s.consent_form_text,
      screening_enabled: p.screening_enabled ?? s.screening_enabled,
      screening_questions: p.screening_questions ?? s.screening_questions,
      participant_numbering: p.participant_numbering ?? s.participant_numbering,
      participant_number_prefix: p.participant_number_prefix ?? s.participant_number_prefix ?? 'PP',
      participant_relation_enabled: p.participant_relation_enabled ?? s.participant_relation_enabled,
      participant_relation_options: p.participant_relation_options ?? s.participant_relation_options,
      ecogram_enabled: p.ecogram_enabled ?? s.ecogram_enabled,
      ecogram_config: p.ecogram_config ?? s.ecogram_config,
    };
  };

  const toDbProjectUpdate = (p: any) => {
    const baseSettings = p?.settings ?? p?.setting ?? {};
    const notification_settings = p?.notification_settings ?? p?.notification_setting;
    const mergedSettings = {
      ...baseSettings,
      show_progress_bar: p?.show_progress_bar,
      disable_backtracking: p?.disable_backtracking,
      randomize_questions: p?.randomize_questions,
      auto_advance: p?.auto_advance,
      consent_required: p?.consent_required,
      consent_form_url: p?.consent_form_url,
      consent_form_text: p?.consent_form_text,
      screening_enabled: p?.screening_enabled,
      screening_questions: p?.screening_questions,
      participant_numbering: p?.participant_numbering,
      participant_number_prefix: p?.participant_number_prefix,
      participant_relation_enabled: p?.participant_relation_enabled,
      participant_relation_options: p?.participant_relation_options,
      ecogram_enabled: p?.ecogram_enabled,
      ecogram_config: p?.ecogram_config,
      // New multi-questionnaire data stored in settings JSON
      questionnaire_configs: questionnaireConfigs,
      participant_types: participantTypes,
      app_layout: appLayout,
    };
    return {
      organization_id: p?.organization_id,
      researcher_id: p?.researcher_id,
      title: p?.title,
      description: p?.description,
      status: p?.status,
      published_at: p?.published_at,
      project_type: p?.project_type,
      setting: mergedSettings,
      ai_enabled: p?.ai_enabled,
      voice_enabled: p?.voice_enabled,
      notification_enabled: p?.notification_enabled,
      consent_form: p?.consent_form,
      recruitment_criteria: p?.recruitment_criteria,
      notification_setting: notification_settings,
      compensation_amount: p?.compensation_amount,
      compensation_type: p?.compensation_type,
      max_participant: p?.max_participants ?? p?.max_participant,
      start_at: p?.starts_at ?? p?.start_at,
      end_at: p?.ends_at ?? p?.end_at,
      study_duration: p?.study_duration,
      survey_frequency: p?.survey_frequency,
      allow_participant_dnd: p?.allow_participant_dnd,
      participant_numbering: p?.participant_numbering,
      onboarding_required: p?.onboarding_required,
      onboarding_instruction: p?.onboarding_instructions ?? p?.onboarding_instruction,
      profile_question: p?.profile_questions ?? p?.profile_question,
      allow_start_date_selection: p?.allow_start_date_selection,
      survey_code: p?.survey_code,
    };
  };

  const generateSurveyCode = async () => {
    for (let i = 0; i < 5; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase
        .from('research_project')
        .select('id')
        .eq('survey_code', code)
        .limit(1);
      if (!error && (!data || data.length === 0)) {
        return code;
      }
    }
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const updatePublishStatus = async (nextStatus: 'draft' | 'published') => {
    if (!projectId) return;
    if (nextStatus === 'published') {
      if (questionnaireConfigs.length === 0 || questionnaireConfigs.every(q => q.questions.length === 0)) {
        toast.error('Cannot publish: Please add at least one question first.');
        return;
      }
      if (!project.title || project.title.trim() === '' || project.title === 'Untitled Project') {
        toast.error('Cannot publish: Please add a project title first.');
        return;
      }
    }
    setSaving(true);
    try {
      const updates: any = { status: nextStatus };
      if (nextStatus === 'published') {
        if (!project.survey_code) {
          updates.survey_code = await generateSurveyCode();
        }
        updates.published_at = new Date().toISOString();
      } else {
        updates.published_at = null;
      }
      const { error } = await supabase
        .from('research_project')
        .update(updates)
        .eq('id', projectId);
      if (error) throw error;
      setProject(prev => ({ ...(prev as any), ...updates }));
      if (nextStatus === 'published') {
        toast.success('Project published! Share the survey code with participants.');
      } else {
        toast.success('Project unpublished.');
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error('Failed to update publish status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      try {
        const { data: projectData, error } = await supabase
          .from('research_project')
          .select('*')
          .eq('id', projectId)
          .maybeSingle();
        if (error) {
          setLoading(false);
          return;
        }
        if (projectData && mounted) {
          const normalized = normalizeProject(projectData);
          setProject(normalized);
          if (normalized.settings?.logic_rules) {
            setLogicRules(normalized.settings.logic_rules);
          }
          // Load multi-questionnaire configs from settings
          let qConfigs: QuestionnaireConfig[] = normalized.settings?.questionnaire_configs || [];
          if (normalized.settings?.participant_types) {
            setParticipantTypes(normalized.settings.participant_types);
          }
          if (normalized.settings?.app_layout) {
            setAppLayout(normalized.settings.app_layout);
          }
          // Load questions from DB and distribute into questionnaire configs
          const { data: questionsData } = await supabase
            .from('survey_question')
            .select('*, options:question_option(*)')
            .eq('project_id', projectId)
            .order('order_index');
          if (questionsData && mounted) {
            // Distribute questions into their questionnaires based on questionnaire_id in config
            if (qConfigs.length > 0) {
              const qMap = new Map<string, any[]>();
              qConfigs.forEach(qc => qMap.set(qc.id, []));
              for (const q of questionsData) {
                const qId = q.question_config?.questionnaire_id;
                if (qId && qMap.has(qId)) {
                  qMap.get(qId)!.push(q);
                } else if (qConfigs.length > 0) {
                  // Default to first questionnaire if no match
                  qMap.get(qConfigs[0].id)!.push(q);
                }
              }
              qConfigs = qConfigs.map(qc => ({ ...qc, questions: qMap.get(qc.id) || [] }));
            }
            setQuestionnaireConfigs(qConfigs);
          } else {
            setQuestionnaireConfigs(qConfigs);
          }
        }
        if (mounted) setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [projectId]);

  React.useEffect(() => {
    if (templateData && !projectId) {
      setProject(prev => ({
        ...prev,
        title: templateData.name || 'Untitled Project',
        description: templateData.description || ''
      }));
      import('../services/templateService').then(({ getTemplateQuestions, getTemplateSettings }) => {
        const templateQuestions = getTemplateQuestions(templateData.id);
        const settings = getTemplateSettings(templateData.id);
        
        // Build question objects from template
        const builtQuestions = (templateQuestions || []).map((q: any, index: number) => ({
          id: crypto.randomUUID(),
          question_type: q.type || 'text_short',
          question_text: q.text || 'Enter your question',
          question_description: '',
          question_config: q.config || {},
          validation_rule: {},
          logic_rule: {},
          ai_config: {},
          order_index: index,
          required: q.required || false,
          allow_voice: false,
          allow_ai_assist: false,
          options: q.options?.map((opt: any, i: number) => ({
            id: crypto.randomUUID(),
            option_text: opt.text || opt,
            option_value: '',
            order_index: i,
            is_other: false
          })) || []
        }));

        // Load questionnaire configs and distribute questions into them
        let qConfigs: QuestionnaireConfig[] = settings?.setting?.questionnaire_configs || [];
        if (qConfigs.length > 0 && builtQuestions.length > 0) {
          // Distribute questions by questionnaire_id tag in their config
          const qMap = new Map<string, any[]>();
          qConfigs.forEach(qc => qMap.set(qc.id, []));
          for (const q of builtQuestions) {
            const qId = q.question_config?.questionnaire_id;
            if (qId && qMap.has(qId)) {
              qMap.get(qId)!.push(q);
            } else {
              // Default to first questionnaire
              qMap.get(qConfigs[0].id)!.push(q);
            }
          }
          // Re-index within each questionnaire
          qConfigs = qConfigs.map(qc => {
            const qs = qMap.get(qc.id) || [];
            qs.forEach((q, i) => q.order_index = i);
            return { ...qc, questions: qs };
          });
          setQuestionnaireConfigs(qConfigs);
        } else if (builtQuestions.length > 0) {
          // No questionnaire configs from template - create a default one
          const defaultQ: QuestionnaireConfig = {
            id: crypto.randomUUID(),
            title: 'Main Questionnaire',
            description: '',
            questions: builtQuestions,
            estimated_duration: 5,
            frequency: 'once',
            time_windows: [{ start: '09:00', end: '21:00' }],
            notification_enabled: false,
            notification_minutes_before: 5,
            dnd_allowed: false,
            dnd_default_start: '22:00',
            dnd_default_end: '08:00',
            assigned_participant_types: [],
            order_index: 0,
          };
          setQuestionnaireConfigs([defaultQ]);
        }

        if (settings?.setting?.participant_types) {
          setParticipantTypes(settings.setting.participant_types);
        }
        if (settings?.setting?.app_layout) {
          setAppLayout(settings.setting.app_layout);
        }
      });
      setLoading(false);
    }
  }, [templateData, projectId]);

  // All question management is now handled inside QuestionnaireList component

  const saveProject = async () => {
    setSaving(true);
    try {
      if (!user) {
        alert('Survey saved locally! Sign in to save to cloud and share with participants.');
        setSaving(false);
        return;
      }
      const { data: researcherData } = await supabase
        .from('researcher')
        .select('organization_id, id')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (!researcherData) throw new Error('Researcher not found');

      const syncQuestions = async (targetProjectId: string) => {
        // All questions now live inside questionnaire configs
        const allQuestions: Question[] = [];
        for (const qConfig of questionnaireConfigs) {
          for (const q of qConfig.questions) {
            allQuestions.push({
              ...q,
              question_config: { ...q.question_config, questionnaire_id: qConfig.id },
            });
          }
        }

        const { data: existingQuestions } = await supabase
          .from('survey_question').select('id').eq('project_id', targetProjectId);
        const existingIds = new Set((existingQuestions || []).map((q: any) => q.id));
        const currentIds = new Set(allQuestions.map(q => q.id));
        const removedIds = [...existingIds].filter(id => !currentIds.has(id));
        const questionPayload = allQuestions.map((question) => {
          const { options, ...questionData } = question;
          const dbQuestionData: any = {
            ...questionData,
            validation_rule: (questionData as any).validation_rule ?? (questionData as any).validation_rules ?? {},
            logic_rule: (questionData as any).logic_rule ?? (questionData as any).logic_rules ?? {},
            project_id: targetProjectId, id: question.id
          };
          delete dbQuestionData.validation_rules;
          delete dbQuestionData.logic_rules;
          return dbQuestionData;
        });
        if (questionPayload.length > 0) {
          const { error: upsertError } = await supabase.from('survey_question').upsert(questionPayload, { onConflict: 'id' });
          if (upsertError) throw upsertError;
        }
        if (removedIds.length > 0) {
          await supabase.from('question_option').delete().in('question_id', removedIds);
          await supabase.from('survey_question').delete().in('id', removedIds);
        }
        for (const question of allQuestions) {
          const options = question.options || [];
          if (options.length > 0) {
            const { error: optionUpsertError } = await supabase.from('question_option').upsert(
              options.map(opt => ({ ...opt, question_id: question.id, id: opt.id })),
              { onConflict: 'id' }
            );
            if (optionUpsertError) throw optionUpsertError;
          }
          const { data: existingOptions } = await supabase.from('question_option').select('id').eq('question_id', question.id);
          const existingOptionIds = new Set((existingOptions || []).map((opt: any) => opt.id));
          const currentOptionIds = new Set(options.map(opt => opt.id));
          const removedOptionIds = [...existingOptionIds].filter(id => !currentOptionIds.has(id));
          if (removedOptionIds.length > 0) {
            await supabase.from('question_option').delete().in('id', removedOptionIds);
          }
        }
      };

      if (projectId) {
        const projectWithLogic = { ...project, settings: { ...(project as any).settings, logic_rules: logicRules } };
        const { error: projectUpdateError } = await supabase.from('research_project').update(toDbProjectUpdate(projectWithLogic)).eq('id', projectId);
        if (projectUpdateError) throw projectUpdateError;
        await syncQuestions(projectId);
      } else {
        const surveyCode = project.survey_code || await generateSurveyCode();
        const projectWithLogic = {
          ...project,
          settings: { ...(project as any).settings, logic_rules: logicRules },
          organization_id: researcherData.organization_id,
          researcher_id: researcherData.id,
          survey_code: surveyCode,
          status: (project as any)?.status || 'draft'
        };
        const { data: newProject } = await supabase.from('research_project').insert(toDbProjectUpdate(projectWithLogic) as any).select().single();
        if (newProject) {
          await syncQuestions(newProject.id);
          toast.success('Project created successfully!');
          navigate(`/easyresearch/project/${newProject.id}`);
        }
      }
      if (projectId) toast.success('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'settings', label: 'Settings' },
    { id: 'questionnaires', label: 'Questionnaires' },
    { id: 'logic', label: 'Logic' },
    { id: 'layout', label: 'Layout' },
    { id: 'preview', label: 'Preview' },
    ...(projectId ? [{ id: 'responses' as TabId, label: 'Responses' }] : []),
  ];


  return (
    <div className="min-h-screen bg-stone-50/50">
      {/* Header */}
      <div className="border-b border-stone-200/60 bg-white/80 backdrop-blur-sm sticky top-14 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/easyresearch/dashboard')}
                className="p-2 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <ArrowLeft size={18} className="text-stone-500" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={project.title || ''}
                    onChange={(e) => setProject({ ...project, title: e.target.value })}
                    placeholder="Untitled Project"
                    className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-stone-800 placeholder:text-stone-300"
                    style={{ minWidth: '200px' }}
                  />
                  <Pencil size={13} className="text-stone-400" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    projectStatus === 'published' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-stone-100 text-stone-500'
                  }`}>
                    {projectStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {projectId && (
                <button
                  onClick={() => updatePublishStatus(projectStatus === 'published' ? 'draft' : 'published')}
                  disabled={saving}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all ${
                    projectStatus === 'published'
                      ? 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      : 'border-emerald-400 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {projectStatus === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              )}
              <button
                onClick={saveProject}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[13px] font-medium hover:shadow-lg hover:shadow-emerald-200/50 transition-all"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`pb-2.5 px-3 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Questionnaires Tab */}
        {activeTab === 'questionnaires' && (
          <QuestionnaireList
            questionnaires={questionnaireConfigs}
            participantTypes={participantTypes.map(pt => ({ id: pt.id, name: pt.name }))}
            onUpdate={setQuestionnaireConfigs}
            project={project}
            logicRules={logicRules}
            onUpdateLogic={setLogicRules}
          />
        )}

        {/* Participants tab removed - now in Settings */}

        {/* Logic Tab */}
        {activeTab === 'logic' && (
          <SurveyLogic questions={questionnaireConfigs.flatMap(q => q.questions)} projectId={projectId} onUpdateLogic={(rules) => setLogicRules(rules)} />
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <LayoutBuilder
            layout={appLayout}
            questionnaires={questionnaireConfigs}
            participantTypes={participantTypes}
            onUpdate={setAppLayout}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && project && (
          <SurveySettings
            project={project}
            onUpdateProject={(updates) => setProject(updates)}
            participantTypes={participantTypes}
            onUpdateParticipantTypes={setParticipantTypes}
          />
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <SurveyPreview
            questions={questionnaireConfigs.flatMap(q => q.questions)}
            projectTitle={project.title || ''}
            projectDescription={project.description || ''}
            appLayout={appLayout}
            questionnaires={questionnaireConfigs}
            participantTypes={participantTypes}
            studyDuration={project.study_duration || 7}
          />
        )}
        {/* Responses Tab */}
        {activeTab === 'responses' && projectId && (
          <ProjectResponsesTab
            projectId={projectId}
            questionnaires={questionnaireConfigs}
          />
        )}
      </div>
    </div>
  );
};

export default SurveyBuilder;
