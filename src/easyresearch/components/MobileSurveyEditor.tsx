import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ChevronRight, ChevronLeft, Save, Plus, Trash2, GripVertical, Settings, Copy, ArrowLeft, Eye, EyeOff, List } from 'lucide-react';
import { QUESTION_TYPE_DEFINITIONS, normalizeLegacyQuestionType } from '../constants/questionTypes';
import QuestionnaireScheduler from './QuestionnaireScheduler';
import { hydrateQuestionRows, questionConfigToDbCols } from '../utils/questionConfigSync';
import { useI18n } from '../hooks/useI18n';

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  question_description?: string;
  question_config: any;
  validation_rule: any;
  ai_config: any;
  order_index: number;
  required: boolean;
  allow_voice: boolean;
  allow_ai_assist: boolean;
  options?: QuestionOption[];
  allow_other?: boolean;
  allow_none?: boolean;
  response_required?: string;
}

interface QuestionOption {
  id: string;
  option_text: string;
  order_index: number;
  is_other: boolean;
}

interface SurveyProject {
  id?: string;
  title: string;
  description: string;
  methodology_type: string;
  status: string;
  study_duration: number | null;
  survey_frequency: string | null;
  starts_at: string | null;
  ends_at: string | null;
  max_participants: number | null;
  compensation_amount: number | null;
  compensation_type: string | null;
  ai_enabled: boolean;
  voice_enabled: boolean;
  notification_enabled: boolean;
  allow_participant_dnd: boolean;
  onboarding_required: boolean;
  onboarding_instructions: string | null;
  show_progress_bar?: boolean;
  disable_backtracking?: boolean;
  randomize_questions?: boolean;
  auto_advance?: boolean;
}

const MobileSurveyEditor: React.FC = () => {
  const { t } = useI18n();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<SurveyProject>({
    title: '',
    description: '',
    methodology_type: 'one_time',
    status: 'draft',
    study_duration: 7,
    survey_frequency: 'daily',
    starts_at: null,
    ends_at: null,
    max_participants: null,
    compensation_amount: null,
    compensation_type: null,
    ai_enabled: false,
    voice_enabled: false,
    notification_enabled: true,
    allow_participant_dnd: true,
    onboarding_required: false,
    onboarding_instructions: null
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [questionnaireTab, setQuestionnaireTab] = useState<'library' | 'schedule'>('library');
  
  const isLongitudinal = project.methodology_type === 'multi_time';

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    const { data: projectData } = await supabase
      .from('research_project')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (projectData) {
      setProject(projectData);

      const { data: questionsData } = await supabase
        .from('question')
        .select('*, options:question_option(*)')
        .eq('project_id', projectId)
        .order('order_index');

      if (questionsData) {
        setQuestions(hydrateQuestionRows(questionsData).map(q => ({ ...q, question_type: normalizeLegacyQuestionType(q.question_type) })));
      }
    }
  };

  const addQuestion = async (type: string) => {
    const questionTypeDef = QUESTION_TYPE_DEFINITIONS.find(def => def.type === type);
    if (!questionTypeDef) {
      console.warn(`Unknown question type: ${type}`);
      return;
    }

    const options = questionTypeDef.requiresOptions
      ? [
          { id: crypto.randomUUID(), option_text: 'Option 1', order_index: 0, is_other: false },
          { id: crypto.randomUUID(), option_text: 'Option 2', order_index: 1, is_other: false }
        ]
      : [];

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question_type: type,
      question_text: 'New Question',
      question_config: { ...questionTypeDef.defaultConfig },
      validation_rule: {},
      ai_config: {},
      order_index: questions.length,
      required: false,
      allow_voice: false,
      allow_ai_assist: false,
      options
    };

    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
    setShowQuestionTypes(false);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
    }
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      // Update project with all fields
      await supabase
        .from('research_project')
        .update({
          title: project.title,
          description: project.description,
          methodology_type: project.methodology_type,
          study_duration: project.study_duration,
          survey_frequency: project.survey_frequency,
          start_at: project.starts_at,
          end_at: project.ends_at,
          max_participant: project.max_participants,
          compensation_amount: project.compensation_amount,
          compensation_type: project.compensation_type,
          ai_enabled: project.ai_enabled,
          voice_enabled: project.voice_enabled,
          notification_enabled: project.notification_enabled,
          allow_participant_dnd: project.allow_participant_dnd,
          onboarding_required: project.onboarding_required,
          onboarding_instructions: project.onboarding_instructions,
          show_progress_bar: project.show_progress_bar,
          disable_backtracking: project.disable_backtracking,
          randomize_questions: project.randomize_questions,
          auto_advance: project.auto_advance
        })
        .eq('id', projectId);

      // Delete existing questions
      await supabase
        .from('question')
        .delete()
        .eq('project_id', projectId);

      // Insert new questions
      for (const question of questions) {
        const { data: insertedQuestion } = await supabase
          .from('question')
          .insert({
            project_id: projectId,
            question_type: question.question_type,
            question_text: question.question_text,
            question_description: question.question_description,
            question_config: question.question_config || {},
            ...questionConfigToDbCols(question.question_config || {}),
            validation_rule: question.validation_rule || {},
            ai_config: {},
            order_index: question.order_index,
            required: question.required,
            allow_voice: question.allow_voice,
            allow_ai_assist: question.allow_ai_assist
          })
          .select()
          .single();

        // Insert options if any
        if (question.options && insertedQuestion) {
          for (const option of question.options) {
            await supabase
              .from('question_option')
              .insert({
                question_id: insertedQuestion.id,
                option_text: option.option_text,
                order_index: option.order_index,
                is_other: option.is_other
              });
          }
        }
      }

      navigate('/easyresearch');
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  return (
      <div className="min-h-screen pb-32 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 border-b" style={{ borderColor: 'var(--border-light)', backgroundColor: 'white' }}>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/easyresearch')}
                className="p-2 rounded-lg"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ArrowLeft size={20} style={{ color: 'var(--text-primary)' }} />
              </button>
              <div className="flex items-center gap-2">
                <select
                  value={project.status}
                  onChange={(e) => setProject({ ...project, status: e.target.value })}
                  className="px-3 py-2 rounded-lg border text-sm font-medium"
                  style={{ borderColor: project.status === 'published' ? 'var(--color-green)' : 'var(--border-light)', color: project.status === 'published' ? 'var(--color-green)' : 'var(--text-secondary)' }}
                >
                  <option value="draft">{t('me.draft')}</option>
                  <option value="published">{t('me.published')}</option>
                </select>
                <button
                  onClick={saveProject}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: 'var(--color-green)' }}
                >
                  <Save size={16} className="inline mr-2" />
                  {saving ? t('me.saving') : t('me.save')}
                </button>
              </div>
            </div>

          {/* Project Info */}
          <div className="space-y-3">
            <input
              type="text"
              value={project.title}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
              placeholder={t('me.surveyTitle')}
              className="w-full px-3 py-2 rounded-lg border text-lg font-semibold"
              style={{ borderColor: 'var(--border-light)' }}
            />
            <textarea
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              placeholder={t('me.surveyDescription')}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--border-light)' }}
            />
            
            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full px-3 py-2 rounded-lg border text-sm font-medium flex items-center justify-between"
              style={{ borderColor: 'var(--border-light)', color: 'var(--color-green)' }}
            >
              <span>{showSettings ? t('me.hideSettings') : t('me.showSettings')}</span>
              <span>{showSettings ? '▼' : '▶'}</span>
            </button>
            
            {/* Settings Panel */}
            {showSettings && (
              <div className="space-y-3 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid var(--border-light)' }}>
                {/* Duration */}
                {(project.methodology_type === 'multi_time') && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.studyDuration')}</label>
                    <input
                      type="number"
                      value={project.study_duration || ''}
                      onChange={(e) => setProject({ ...project, study_duration: parseInt(e.target.value) || null })}
                      placeholder="e.g., 7"
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                )}

                {/* Frequency */}
                {(project.methodology_type === 'multi_time') && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.surveyFrequency')}</label>
                    <select
                      value={project.survey_frequency || 'daily'}
                      onChange={(e) => setProject({ ...project, survey_frequency: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      <option value="hourly">{t('me.everyHour')}</option>
                      <option value="twice_daily">{t('me.twiceDaily')}</option>
                      <option value="daily">{t('me.daily')}</option>
                      <option value="twice_weekly">{t('me.twiceWeekly')}</option>
                      <option value="weekly">{t('me.weekly')}</option>
                      <option value="custom">{t('me.customSchedule')}</option>
                    </select>
                  </div>
                )}

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.startDate')}</label>
                  <input
                    type="date"
                    value={project.starts_at ? project.starts_at.split('T')[0] : ''}
                    onChange={(e) => setProject({ ...project, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border-light)' }}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.endDate')}</label>
                  <input
                    type="date"
                    value={project.ends_at ? project.ends_at.split('T')[0] : ''}
                    onChange={(e) => setProject({ ...project, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border-light)' }}
                  />
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.maxParticipants')}</label>
                  <input
                    type="number"
                    value={project.max_participants || ''}
                    onChange={(e) => setProject({ ...project, max_participants: parseInt(e.target.value) || null })}
                    placeholder="e.g., 100"
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border-light)' }}
                  />
                </div>

                {/* Compensation */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.compensation')}</label>
                    <input
                      type="number"
                      value={project.compensation_amount || ''}
                      onChange={(e) => setProject({ ...project, compensation_amount: parseFloat(e.target.value) || null })}
                      placeholder={t('me.amount')}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.type')}</label>
                    <select
                      value={project.compensation_type || 'cash'}
                      onChange={(e) => setProject({ ...project, compensation_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      <option value="cash">{t('me.cash')}</option>
                      <option value="gift_card">{t('me.giftCard')}</option>
                      <option value="credit">{t('me.courseCredit')}</option>
                      <option value="none">{t('me.none')}</option>
                    </select>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={project.voice_enabled}
                      onChange={(e) => setProject({ ...project, voice_enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('me.enableVoice')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={project.notification_enabled}
                      onChange={(e) => setProject({ ...project, notification_enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('me.enableNotifications')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={project.allow_participant_dnd}
                      onChange={(e) => setProject({ ...project, allow_participant_dnd: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('me.allowDnd')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={project.onboarding_required}
                      onChange={(e) => setProject({ ...project, onboarding_required: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('me.requireOnboarding')}</span>
                  </label>
                </div>

                {/* Survey Display & Behavior */}
                <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'var(--border-light)' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('me.surveyDisplayBehavior')}</h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={project.show_progress_bar !== false}
                      onChange={(e) => setProject({ ...project, show_progress_bar: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('me.showProgressBar')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={project.disable_backtracking || false}
                      onChange={(e) => setProject({ ...project, disable_backtracking: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('me.disableBacktracking')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={project.randomize_questions || false}
                      onChange={(e) => setProject({ ...project, randomize_questions: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('me.randomizeOrder')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={project.auto_advance || false}
                      onChange={(e) => setProject({ ...project, auto_advance: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('me.autoAdvance')}</span>
                  </label>
                </div>

                {/* Onboarding Instructions */}
                {project.onboarding_required && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.onboardingInstructions')}</label>
                    <textarea
                      value={project.onboarding_instructions || ''}
                      onChange={(e) => setProject({ ...project, onboarding_instructions: e.target.value })}
                      placeholder={t('me.onboardingPlaceholder')}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Questionnaire Management - Two-tab system for Longitudinal/ESM */}
            {isLongitudinal && projectId && (
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'white', border: '2px solid var(--color-green)' }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <List size={18} style={{ color: 'var(--color-green)' }} />
                   {t('me.questionnaireManagement')}
                </h3>
                
                {/* Tab Navigation */}
                <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <button
                    onClick={() => setQuestionnaireTab('library')}
                    className="flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all"
                    style={{
                      backgroundColor: questionnaireTab === 'library' ? 'var(--color-green)' : 'transparent',
                      color: questionnaireTab === 'library' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                     {t('me.library')}
                  </button>
                  <button
                    onClick={() => setQuestionnaireTab('schedule')}
                    className="flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all"
                    style={{
                      backgroundColor: questionnaireTab === 'schedule' ? 'var(--color-green)' : 'transparent',
                      color: questionnaireTab === 'schedule' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                     {t('me.schedule')}
                  </button>
                </div>

                {/* Tab Content */}
                {questionnaireTab === 'library' && (
                  <div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {t('me.createMultipleQuestionnaires')}
                    </p>
                    <QuestionnaireScheduler 
                      projectId={projectId} 
                      studyDuration={project.study_duration || 7}
                      showLibraryOnly={true}
                    />
                  </div>
                )}

                {questionnaireTab === 'schedule' && (
                  <div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {t('me.dragToSchedule')}
                    </p>
                    <QuestionnaireScheduler 
                      projectId={projectId} 
                      studyDuration={project.study_duration || 7}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Questions List - Only show for one-time surveys */}
      {!isLongitudinal && (
      <div className="px-4 py-6 space-y-4">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="bg-white rounded-xl p-4 border"
            style={{ borderColor: selectedQuestionId === question.id ? 'var(--color-green)' : 'var(--border-light)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#f0fdf4', color: 'var(--color-green)' }}>
                Q{index + 1}
              </span>
              <div className="flex gap-1">
                {index > 0 && (
                  <button
                    onClick={() => {
                      const newQuestions = [...questions];
                      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
                      newQuestions.forEach((q, i) => q.order_index = i);
                      setQuestions(newQuestions);
                    }}
                    className="p-1 rounded"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Move Up"
                  >
                    ▲
                  </button>
                )}
                {index < questions.length - 1 && (
                  <button
                    onClick={() => {
                      const newQuestions = [...questions];
                      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
                      newQuestions.forEach((q, i) => q.order_index = i);
                      setQuestions(newQuestions);
                    }}
                    className="p-1 rounded"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Move Down"
                  >
                    ▼
                  </button>
                )}
                <button
                  onClick={() => {
                    const duplicate = {
                      ...question,
                      id: crypto.randomUUID(),
                      question_text: question.question_text + ' (Copy)',
                      order_index: questions.length
                    };
                    setQuestions([...questions, duplicate]);
                  }}
                  className="p-1 rounded"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Duplicate"
                >
                   Copy
                </button>
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="p-1 rounded"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={question.question_text}
              onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
              placeholder={t('me.questionText')}
              className="w-full px-3 py-2 rounded-lg border mb-3"
              style={{ borderColor: 'var(--border-light)' }}
            />

            <textarea
              value={question.question_description || ''}
              onChange={(e) => updateQuestion(question.id, { question_description: e.target.value })}
              placeholder={t('me.descriptionOptional')}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border mb-3 text-sm"
              style={{ borderColor: 'var(--border-light)' }}
            />

            {/* Question Type Selector */}
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.questionType')}</label>
              <select
                value={question.question_type}
                onChange={(e) => {
                  const newType = e.target.value;
                  const needsOptions = ['single_choice', 'multiple_choice', 'dropdown'];
                  const updates: any = { question_type: newType };
                  
                  // Clear previous config when switching types
                  if (newType === 'slider') {
                    updates.question_config = { min: 0, max: 10, step: 1 };
                    updates.options = undefined;
                  } else if (needsOptions.includes(newType) && !question.options) {
                    updates.options = [
                      { id: crypto.randomUUID(), option_text: 'Option 1', order_index: 0, is_other: false },
                      { id: crypto.randomUUID(), option_text: 'Option 2', order_index: 1, is_other: false }
                    ];
                  } else if (!needsOptions.includes(newType)) {
                    updates.options = undefined;
                  }
                  updateQuestion(question.id, updates);
                }}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <option value="text_short">{t('me.shortText')}</option>
                <option value="text_long">{t('me.longText')}</option>
                <option value="single_choice">{t('me.singleChoice')}</option>
                <option value="multiple_choice">{t('me.multipleChoice')}</option>
                <option value="dropdown">{t('me.dropdown')}</option>
                <option value="slider">{t('me.slider')}</option>
                <option value="number">{t('me.number')}</option>
                <option value="date">{t('me.date')}</option>
                <option value="time">{t('me.time')}</option>
                <option value="likert">{t('me.likertScale')}</option>
                <option value="scale">{t('me.ratingScale')}</option>
                <option value="ranking">{t('me.ranking')}</option>
                <option value="matrix">{t('me.matrixGrid')}</option>
                <option value="email">{t('me.email')}</option>
                <option value="phone">{t('me.phone')}</option>
                <option value="file_upload">{t('me.fileUpload')}</option>
              </select>
            </div>

            {/* Slider Configuration */}
            {question.question_type === 'slider' && (
              <div className="space-y-2 mb-3 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t('me.sliderConfig')}</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.min')}</label>
                    <input
                      type="number"
                      value={question.question_config?.min || 0}
                      onChange={(e) => updateQuestion(question.id, {
                        question_config: { ...question.question_config, min: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.max')}</label>
                    <input
                      type="number"
                      value={question.question_config?.max || 10}
                      onChange={(e) => updateQuestion(question.id, {
                        question_config: { ...question.question_config, max: parseInt(e.target.value) || 10 }
                      })}
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.step')}</label>
                    <input
                      type="number"
                      value={question.question_config?.step || 1}
                      onChange={(e) => updateQuestion(question.id, {
                        question_config: { ...question.question_config, step: parseInt(e.target.value) || 1 }
                      })}
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.minLabel')}</label>
                    <input
                      type="text"
                      value={question.question_config?.min_label || ''}
                      onChange={(e) => updateQuestion(question.id, {
                        question_config: { ...question.question_config, min_label: e.target.value }
                      })}
                      placeholder="e.g., Not at all"
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.maxLabel')}</label>
                    <input
                      type="text"
                      value={question.question_config?.max_label || ''}
                      onChange={(e) => updateQuestion(question.id, {
                        question_config: { ...question.question_config, max_label: e.target.value }
                      })}
                      placeholder="e.g., Extremely"
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Number Validation */}
            {question.question_type === 'number' && (
              <div className="space-y-2 mb-3 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t('me.numberValidation')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.minValue')}</label>
                    <input
                      type="number"
                      value={question.validation_rule?.min || ''}
                      onChange={(e) => updateQuestion(question.id, {
                        validation_rule: { ...question.validation_rule, min: e.target.value }
                      })}
                      placeholder={t('me.optional')}
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.maxValue')}</label>
                    <input
                      type="number"
                      value={question.validation_rule?.max || ''}
                      onChange={(e) => updateQuestion(question.id, {
                        validation_rule: { ...question.validation_rule, max: e.target.value }
                      })}
                      placeholder="Optional"
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Text Validation */}
            {(question.question_type === 'text_short' || question.question_type === 'text_long') && (
              <div className="space-y-2 mb-3 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t('me.textValidation')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.minLength')}</label>
                    <input
                      type="number"
                      value={question.validation_rule?.min_length || ''}
                      onChange={(e) => updateQuestion(question.id, {
                        validation_rule: { ...question.validation_rule, min_length: e.target.value }
                      })}
                      placeholder="Optional"
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('me.maxLength')}</label>
                    <input
                      type="number"
                      value={question.validation_rule?.max_length || ''}
                      onChange={(e) => updateQuestion(question.id, {
                        validation_rule: { ...question.validation_rule, max_length: e.target.value }
                      })}
                      placeholder="Optional"
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Only show options for choice-based questions */}
            {['single_choice', 'multiple_choice', 'dropdown', 'likert_scale'].includes(normalizeLegacyQuestionType(question.question_type)) && (
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t('me.options')}</label>
                  <select
                    onChange={(e) => {
                      const templates = [
                        { name: 'Yes - No', options: ['Yes', 'No'] },
                        { name: 'Agree - Disagree', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
                        { name: '1-5 Scale', options: ['1', '2', '3', '4', '5'] },
                      ];
                      const template = templates.find(t => t.name === e.target.value);
                      if (template) {
                        const newOptions = template.options.map((text, idx) => ({
                          id: crypto.randomUUID(),
                          option_text: text,
                          order_index: idx,
                          is_other: false
                        }));
                        updateQuestion(question.id, { options: newOptions });
                      }
                      e.target.value = '';
                    }}
                    className="text-xs px-2 py-1 rounded border"
                    style={{ borderColor: 'var(--border-light)', color: 'var(--color-green)' }}
                  >
                    <option value="">{t('me.template')}</option>
                    <option value="Yes - No">Yes - No</option>
                    <option value="Agree - Disagree">Agree - Disagree</option>
                    <option value="1-5 Scale">1-5 Scale</option>
                  </select>
                </div>
                {question.options.map((option, optIndex) => (
                  <input
                    key={option.id}
                    type="text"
                    value={option.option_text}
                    onChange={(e) => {
                      const newOptions = [...question.options!];
                      newOptions[optIndex] = { ...option, option_text: e.target.value };
                      updateQuestion(question.id, { options: newOptions });
                    }}
                    placeholder={`Option ${optIndex + 1}`}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border-light)' }}
                  />
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...question.options!, {
                      id: crypto.randomUUID(),
                      option_text: `Option ${question.options!.length + 1}`,
                      order_index: question.options!.length,
                      is_other: false
                    }];
                    updateQuestion(question.id, { options: newOptions });
                  }}
                  className="w-full py-2 rounded-lg border-2 border-dashed text-sm"
                  style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                >
                  {t('me.addOption')}
                </button>
                
                <div className="mt-2 space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={question.allow_other || false}
                      onChange={(e) => updateQuestion(question.id, { allow_other: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{t('me.allowOther')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={question.allow_none || false}
                      onChange={(e) => updateQuestion(question.id, { allow_none: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>Allow "None of the above"</span>
                  </label>
                </div>
              </div>
            )}

            {/* Question Settings */}
            <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Response Type</label>
                <select
                  value={question.response_required || 'optional'}
                  onChange={(e) => updateQuestion(question.id, { response_required: e.target.value, required: e.target.value === 'force' })}
                  className="w-full px-2 py-1 rounded border text-sm"
                  style={{ borderColor: 'var(--border-light)' }}
                >
                  <option value="optional">Optional (Allow Skip)</option>
                  <option value="request">Request Response (Soft Prompt)</option>
                  <option value="force">Required (Cannot Skip)</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>Mark as Required (*)</span>
              </label>
              
              {project.voice_enabled && ['text_short', 'text_long'].includes(question.question_type) && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={question.allow_voice !== false}
                    onChange={(e) => updateQuestion(question.id, { allow_voice: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>Allow Voice Input</span>
                </label>
              )}
              
            </div>

            {/* Question Preview */}
            <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Preview</label>
              <div className="mt-2">
                <p className="text-sm font-medium mb-2">
                  {question.question_text || 'Enter your question'}
                  {question.required && <span className="text-red-500">*</span>}
                </p>
                {question.question_description && (
                  <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {question.question_description}
                  </p>
                )}
                {question.question_type === 'slider' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={question.question_config?.min || 0}
                      max={question.question_config?.max || 10}
                      step={question.question_config?.step || 1}
                      defaultValue={(question.question_config?.min || 0) + ((question.question_config?.max || 10) - (question.question_config?.min || 0)) / 2}
                      className="w-full"
                      disabled
                    />
                    <div className="flex justify-between text-xs">
                      <span>{question.question_config?.min_label || question.question_config?.min || 0}</span>
                      <span>{question.question_config?.max_label || question.question_config?.max || 10}</span>
                    </div>
                  </div>
                )}
                {['single_choice', 'multiple_choice', 'dropdown'].includes(question.question_type) && question.options && (
                  <div className="space-y-1">
                    {question.options.slice(0, 3).map((opt, i) => (
                      <div key={opt.id} className="text-xs">
                        {question.question_type === 'single_choice' && '○ '}
                        {question.question_type === 'multiple_choice' && '☐ '}
                        {opt.option_text}
                      </div>
                    ))}
                    {question.options.length > 3 && (
                      <div className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>...and {question.options.length - 3} more</div>
                    )}
                  </div>
                )}
                {['text_short', 'text_long', 'number', 'date', 'time', 'email'].includes(normalizeLegacyQuestionType(question.question_type)) && (
                  <input
                    type={question.question_type === 'number' ? 'number' : question.question_type === 'date' ? 'date' : question.question_type === 'time' ? 'time' : 'text'}
                    placeholder={question.question_type === 'text_long' ? 'Long answer text...' : 'Your answer'}
                    className="w-full px-2 py-1 rounded border text-xs"
                    style={{ borderColor: 'var(--border-light)' }}
                    disabled
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <button
          onClick={() => setShowQuestionTypes(!showQuestionTypes)}
          className="w-full py-4 rounded-xl border-2 border-dashed font-medium"
          style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)', backgroundColor: 'white' }}
        >
          <Plus size={20} className="inline mr-2" />
          Add Question
        </button>

        {/* Question Types Dropdown */}
        {showQuestionTypes && (
          <div className="bg-white rounded-xl p-2 border" style={{ borderColor: 'var(--border-light)' }}>
            {QUESTION_TYPE_DEFINITIONS.map(type => (
              <button
                key={type.type}
                onClick={() => addQuestion(type.type)}
                className="w-full text-left px-4 py-3 rounded-lg"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}
      </div>
      )}

      </div>
  );
};

export default MobileSurveyEditor;
