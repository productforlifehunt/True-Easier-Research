import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, ChevronUp, ChevronDown, Copy, FileText, Mic, Settings, Save, Eye, ArrowLeft, Pencil, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { QUESTION_TYPE_DEFINITIONS } from '../constants/questionTypes';
import QuestionEditor from './QuestionEditor';
import SurveySettings from './SurveySettings';
import SurveyLogic from './SurveyLogic';
import SurveyPreview from './SurveyPreview';
import CustomDropdown from './CustomDropdown';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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
  // Longitudinal study settings
  study_duration?: number;
  survey_frequency?: string;
  allow_participant_dnd?: boolean;
  participant_numbering?: boolean;
  onboarding_required?: boolean;
  onboarding_instructions?: string;
  profile_questions?: Array<{
    id: string;
    question: string;
    type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
    options?: string[];
    required: boolean;
  }>;
  allow_start_date_selection?: boolean;
  show_progress_bar?: boolean;
  disable_backtracking?: boolean;
  randomize_questions?: boolean;
  auto_advance?: boolean;
}

const SurveyBuilder: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const templateData = (location.state as any)?.template;
  
  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!authLoading && !user) {
      const redirectTo = `/easyresearch/${projectId ? `project/${projectId}` : 'create-survey'}`;
      navigate(`/easyresearch/auth?redirectTo=${encodeURIComponent(redirectTo)}&redirect=researcher`, { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Restore template if it was selected while logged out
  React.useEffect(() => {
    if (templateData || projectId) return;
    try {
      const raw = sessionStorage.getItem('easyresearch_pending_template');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.id) return;

      // Remove so refreshes don't re-apply
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'settings' | 'logic' | 'preview'>('design');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logicRules, setLogicRules] = useState<any[]>([]);

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
      // Restore display/behavior settings from setting jsonb
      show_progress_bar: p.show_progress_bar ?? s.show_progress_bar,
      disable_backtracking: p.disable_backtracking ?? s.disable_backtracking,
      randomize_questions: p.randomize_questions ?? s.randomize_questions,
      auto_advance: p.auto_advance ?? s.auto_advance,
      consent_required: p.consent_required ?? s.consent_required,
      consent_form_url: p.consent_form_url ?? s.consent_form_url,
      consent_form_text: p.consent_form_text ?? s.consent_form_text,
    };
  };

  const toDbProjectUpdate = (p: any) => {
    const baseSettings = p?.settings ?? p?.setting ?? {};
    const notification_settings = p?.notification_settings ?? p?.notification_setting;

    // Merge display/behavior settings into the setting jsonb column
    const mergedSettings = {
      ...baseSettings,
      show_progress_bar: p?.show_progress_bar,
      disable_backtracking: p?.disable_backtracking,
      randomize_questions: p?.randomize_questions,
      auto_advance: p?.auto_advance,
      consent_required: p?.consent_required,
      consent_form_url: p?.consent_form_url,
      consent_form_text: p?.consent_form_text,
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

    // Validate before publishing
    if (nextStatus === 'published') {
      if (questions.length === 0) {
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

      if (error) {
        throw error;
      }

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

  // Load project data
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

          // Load logic rules from project settings
          if (normalized.settings?.logic_rules) {
            setLogicRules(normalized.settings.logic_rules);
          }

          const { data: questionsData } = await supabase
            .from('survey_question')
            .select('*, options:question_option(*)')
            .eq('project_id', projectId)
            .order('order_index');

          if (questionsData && mounted) {
            setQuestions(questionsData);
          }
        }
        if (mounted) setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  // Load template data from navigation state
  React.useEffect(() => {
    if (templateData && !projectId) {
      setProject(prev => ({
        ...prev,
        title: templateData.name || 'Untitled Project',
        description: templateData.description || ''
      }));
      
      // Load template questions from template service
      import('../services/templateService').then(({ getTemplateQuestions }) => {
        const templateQuestions = getTemplateQuestions(templateData.id);
        if (templateQuestions && templateQuestions.length > 0) {
          setQuestions(templateQuestions.map((q: any, index: number) => ({
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
          })));
        }
      });
      setLoading(false);
    }
  }, [templateData, projectId]);

  const addQuestion = (type: string) => {
    const questionTypeDef = QUESTION_TYPE_DEFINITIONS.find(def => def.type === type);
    if (!questionTypeDef) {
      console.warn(`Unknown question type: ${type}`);
      return;
    }
    
    let questionConfig = { ...questionTypeDef.defaultConfig };
    let options: QuestionOption[] = [];
    
    // Set up default options for choice-type questions
    if (questionTypeDef.requiresOptions) {
      options = [
        { id: crypto.randomUUID(), option_text: 'Option 1', option_value: '', order_index: 0, is_other: false },
        { id: crypto.randomUUID(), option_text: 'Option 2', option_value: '', order_index: 1, is_other: false }
      ];
    }
    
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question_type: type,
      question_text: 'Enter your question',
      question_description: '',
      question_config: questionConfig,
      validation_rule: {},
      ai_config: {},
      order_index: questions.length,
      required: false,
      allow_voice: false,
      allow_ai_assist: false,
      logic_rule: {},
      options: options
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion({ ...selectedQuestion, ...updates });
    }
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null);
    }
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === questionId);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < questions.length - 1)) {
      const newQuestions = [...questions];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      newQuestions.forEach((q, i) => q.order_index = i);
      setQuestions(newQuestions);
    }
  };

  const handleQuestionDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const reorderedQuestions = items.map((q, index) => ({
      ...q,
      order_index: index
    }));
    
    setQuestions(reorderedQuestions);
    toast.success('Question order updated');
  };

  const duplicateQuestion = (question: Question) => {
    const duplicate = {
      ...question,
      id: crypto.randomUUID(),
      order_index: questions.length,
      question_text: question.question_text + ' (Copy)',
      options: question.options ? question.options.map(opt => ({
        ...opt,
        id: crypto.randomUUID()
      })) : []
    };
    setQuestions([...questions, duplicate]);
    setSelectedQuestion(duplicate);
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      // If not logged in, show message and work in local mode
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
        const { data: existingQuestions } = await supabase
          .from('survey_question')
          .select('id')
          .eq('project_id', targetProjectId);

        const existingIds = new Set((existingQuestions || []).map((q: any) => q.id));
        const currentIds = new Set(questions.map(q => q.id));
        const removedIds = [...existingIds].filter(id => !currentIds.has(id));

        const questionPayload = questions.map((question) => {
          const { options, ...questionData } = question;
          const dbQuestionData: any = {
            ...questionData,
            validation_rule: (questionData as any).validation_rule ?? (questionData as any).validation_rules ?? {},
            logic_rule: (questionData as any).logic_rule ?? (questionData as any).logic_rules ?? {},
            project_id: targetProjectId,
            id: question.id
          };
          delete dbQuestionData.validation_rules;
          delete dbQuestionData.logic_rules;
          return dbQuestionData;
        });

        if (questionPayload.length > 0) {
          const { error: upsertError } = await supabase
            .from('survey_question')
            .upsert(questionPayload, { onConflict: 'id' });

          if (upsertError) {
            throw upsertError;
          }
        }

        if (removedIds.length > 0) {
          await supabase
            .from('question_option')
            .delete()
            .in('question_id', removedIds);

          await supabase
            .from('survey_question')
            .delete()
            .in('id', removedIds);
        }

        for (const question of questions) {
          const options = question.options || [];

          if (options.length > 0) {
            const { error: optionUpsertError } = await supabase
              .from('question_option')
              .upsert(
                options.map(opt => ({
                  ...opt,
                  question_id: question.id,
                  id: opt.id
                })),
                { onConflict: 'id' }
              );

            if (optionUpsertError) {
              throw optionUpsertError;
            }
          }

          const { data: existingOptions } = await supabase
            .from('question_option')
            .select('id')
            .eq('question_id', question.id);

          const existingOptionIds = new Set((existingOptions || []).map((opt: any) => opt.id));
          const currentOptionIds = new Set(options.map(opt => opt.id));
          const removedOptionIds = [...existingOptionIds].filter(id => !currentOptionIds.has(id));

          if (removedOptionIds.length > 0) {
            await supabase
              .from('question_option')
              .delete()
              .in('id', removedOptionIds);
          }
        }
      };

      if (projectId) {
        // Include logic rules in project settings
        const projectWithLogic = {
          ...project,
          settings: {
            ...(project as any).settings,
            logic_rules: logicRules
          }
        };
        const { error: projectUpdateError } = await supabase
          .from('research_project')
          .update(toDbProjectUpdate(projectWithLogic))
          .eq('id', projectId);

        if (projectUpdateError) {
          throw projectUpdateError;
        }

        await syncQuestions(projectId);
      } else {
        // Include logic rules in project settings for new project
        const surveyCode = project.survey_code || await generateSurveyCode();
        const projectWithLogic = {
          ...project,
          settings: {
            ...(project as any).settings,
            logic_rules: logicRules
          },
          organization_id: researcherData.organization_id,
          researcher_id: researcherData.id,
          survey_code: surveyCode,
          status: (project as any)?.status || 'draft'
        };
        const { data: newProject } = await supabase
          .from('research_project')
          .insert(toDbProjectUpdate(projectWithLogic) as any)
          .select()
          .single();

        if (newProject) {
          await syncQuestions(newProject.id);
          toast.success('Project created successfully!');
          navigate(`/easyresearch/project/${newProject.id}`);
        }
      }
      
      if (projectId) {
        toast.success('Project saved successfully!');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border-light)', backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/easyresearch/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={project.title || ''}
                    onChange={(e) => setProject({ ...project, title: e.target.value })}
                    placeholder="Untitled Project"
                    className="text-xl md:text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    style={{ color: 'var(--text-primary)', minWidth: '200px' }}
                  />
                  <Pencil size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Status: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{projectStatus}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {projectId && (
                <button
                  onClick={() => updatePublishStatus(projectStatus === 'published' ? 'draft' : 'published')}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg font-medium border hover:opacity-90 transition-opacity"
                  style={{
                    borderColor: 'var(--color-green)',
                    color: projectStatus === 'published' ? 'var(--text-primary)' : 'white',
                    backgroundColor: projectStatus === 'published' ? 'white' : 'var(--color-green)'
                  }}
                >
                  {projectStatus === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              )}

              <button
                onClick={saveProject}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

            <div className="flex gap-2 overflow-x-auto -mb-px">
              {(['design', 'logic', 'settings', 'preview'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="pb-3 px-4 font-medium capitalize border-b-2 transition-all whitespace-nowrap"
                  style={{
                    color: activeTab === tab ? 'var(--color-green)' : 'var(--text-secondary)',
                    borderColor: activeTab === tab ? 'var(--color-green)' : 'transparent'
                  }}
                >
                  {tab === 'design' ? 'Questions' : tab === 'logic' ? 'Logic' : tab === 'preview' ? 'Preview' : 'Settings'}
                </button>
              ))}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'design' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-white rounded-2xl p-4 md:p-6" style={{ border: '1px solid var(--border-light)' }}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <h2 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Questions
                    </h2>
                    <CustomDropdown
                      options={[
                        { value: '', label: '+ Add Question' },
                        ...QUESTION_TYPE_DEFINITIONS.map(def => ({
                          value: def.type,
                          label: def.label
                        }))
                      ]}
                      value=""
                      onChange={(value) => value && addQuestion(value)}
                      placeholder="+ Add Question"
                      buttonStyle={{ backgroundColor: 'var(--color-green)', color: 'white' }}
                      className="w-full md:w-48"
                    />
                  </div>

                  {questions.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} size={48} />
                      <p style={{ color: 'var(--text-secondary)' }}>
                        No questions yet. Add your first question to get started.
                      </p>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleQuestionDragEnd}>
                      <Droppable droppableId="questions">
                        {(provided) => (
                          <div 
                            className="space-y-4"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {questions.map((question, index) => (
                              <Draggable key={question.id} draggableId={question.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                                      selectedQuestion?.id === question.id ? 'bg-green-50' : ''
                                    } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                    style={{ 
                                      borderColor: selectedQuestion?.id === question.id ? 'var(--color-green)' : 'var(--border-light)',
                                      ...provided.draggableProps.style
                                    }}
                                    onClick={() => setSelectedQuestion(question)}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-2">
                                        <div 
                                          {...provided.dragHandleProps}
                                          className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-gray-100"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <GripVertical size={16} style={{ color: 'var(--text-secondary)' }} />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                              Q{index + 1}
                                            </span>
                                {question.required && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600">
                                    Required
                                  </span>
                                )}
                                {question.allow_voice && (
                                  <Mic size={12} className="text-blue-600" />
                                )}
                              </div>
                              <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                {question.question_text}
                              </h3>
                              {/* Slider preview */}
                              {question.question_type === 'slider' && (
                                <div className="space-y-1">
                                  <input
                                    type="range"
                                    min={question.question_config?.min_value ?? 0}
                                    max={question.question_config?.max_value ?? 10}
                                    defaultValue={Math.round(((question.question_config?.min_value ?? 0) + (question.question_config?.max_value ?? 10)) / 2)}
                                    className="w-full cursor-pointer"
                                    style={{ accentColor: 'var(--color-green)' }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    <span>{question.question_config?.min_value ?? 0}</span>
                                    <span>{question.question_config?.max_value ?? 10}</span>
                                  </div>
                                </div>
                              )}
                              {/* Likert scale preview */}
                              {question.question_type === 'likert_scale' && (
                                <div className="flex gap-1 mt-2">
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className="w-8 h-8 rounded border flex items-center justify-center text-xs" style={{ borderColor: 'var(--border-light)' }}>
                                      {n}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* Rating preview */}
                              {question.question_type === 'rating' && (
                                <div className="flex gap-1 mt-2 text-yellow-400">
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <span key={n}>★</span>
                                  ))}
                                </div>
                              )}
                              {/* NPS preview */}
                              {question.question_type === 'nps' && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <div key={n} className="w-6 h-6 rounded border flex items-center justify-center text-xs" style={{ borderColor: 'var(--border-light)' }}>
                                      {n}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* Options preview */}
                              {question.options && question.options.length > 0 && (
                                <div className="space-y-1">
                                  {question.options.slice(0, 2).map(option => (
                                    <div key={option.id} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                      • {option.option_text}
                                    </div>
                                  ))}
                                  {question.options.length > 2 && (
                                    <div className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                                      +{question.options.length - 2} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveQuestion(question.id, 'up');
                                }}
                                disabled={index === 0}
                                className="p-1 rounded transition-colors disabled:opacity-50"
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveQuestion(question.id, 'down');
                                }}
                                disabled={index === questions.length - 1}
                                className="p-1 rounded transition-colors disabled:opacity-50"
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <ChevronDown size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateQuestion(question);
                                }}
                                className="p-1 rounded transition-colors"
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteQuestion(question.id);
                                }}
                                className="p-1 rounded transition-colors text-red-500"
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              </div>

              <div className="md:col-span-1">
                {selectedQuestion ? (
                  <QuestionEditor
                    question={selectedQuestion}
                    project={project}
                    onUpdateQuestion={updateQuestion}
                  />
                ) : (
                  <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
                    <div className="text-center">
                      <Settings className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} size={48} />
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Select a question to edit its settings
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <SurveySettings
              project={project}
              onUpdateProject={setProject}
            />
          )}

          {activeTab === 'logic' && (
            <SurveyLogic
              questions={questions}
              projectId={projectId}
              existingRules={logicRules}
              onUpdateLogic={async (rules) => {
                setLogicRules(rules);

                if (!projectId) return;

                const nextSettings = {
                  ...(((project as any).settings || {}) as Record<string, any>),
                  logic_rules: rules,
                };

                const { error } = await supabase
                  .from('research_project')
                  .update({ setting: nextSettings })
                  .eq('id', projectId);

                if (error) {
                  throw error;
                }

                setProject((prev) => ({
                  ...(prev as any),
                  settings: nextSettings,
                }));
              }}
            />
          )}

          {activeTab === 'preview' && (
            <SurveyPreview
              questions={questions}
              projectTitle={project.title}
              projectDescription={project.description}
            />
          )}
      </div>
    </div>
  );
};

export default SurveyBuilder;
