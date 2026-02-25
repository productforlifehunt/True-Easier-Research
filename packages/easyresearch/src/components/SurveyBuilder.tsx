import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Trash2, ChevronUp, ChevronDown, Copy, FileText, Zap, Mic, Settings, Save, Eye } from 'lucide-react';
import QuestionEditor from './QuestionEditor';
import SurveySettings from './SurveySettings';
import SurveyLogic from './SurveyLogic';
import SurveyPreview from './SurveyPreview';
import CustomDropdown from './CustomDropdown';
import EasierResearchLayout from './EasierResearchLayout';

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  question_description?: string;
  question_config: any;
  validation_rules: any;
  logic_rules: any;
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
  title: string;
  description: string;
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
  console.log('🔵 SurveyBuilder component mounting');
  const { user } = useAuth();
  const { projectId } = useParams();
  console.log('🔵 SurveyBuilder projectId from params:', projectId);
  const navigate = useNavigate();
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

  // Load project data
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      console.log('🟢 === SURVEY BUILDER EFFECT RUNNING ===');
      console.log('🟢 projectId:', projectId);
      
      if (!projectId) {
        console.log('🔴 No projectId');
        setLoading(false);
        return;
      }

      console.log('🟢 Loading project...');
      try {
        const { data: projectData, error } = await supabase
          .from('research_projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) {
          console.error('🔴 Error loading project:', error);
          setLoading(false);
          return;
        }

        if (projectData && mounted) {
          console.log('✅ Project loaded:', projectData.title);
          console.log('✅ Type:', projectData.project_type);
          console.log('✅ Duration:', projectData.study_duration);
          
          setProject(projectData);

          const { data: questionsData } = await supabase
            .from('survey_questions')
            .select('*, options:question_options(*)')
            .eq('project_id', projectId)
            .order('order_index');

          if (questionsData && mounted) {
            setQuestions(questionsData);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('🔴 Error:', error);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [projectId]);


  const addQuestion = (type: string) => {
    const needsOptions = ['single_choice', 'multiple_choice', 'dropdown', 'ranking'];
    
    let questionConfig = {};
    let options: QuestionOption[] = [];
    
    // Set up default config based on question type
    if (type === 'slider') {
      questionConfig = { min: 0, max: 10, step: 1 };
    } else if (type === 'scale' || type === 'likert') {
      questionConfig = { scale_type: '1-5' };
    } else if (needsOptions.includes(type)) {
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
      validation_rules: {},
      ai_config: {},
      order_index: questions.length,
      required: false,
      allow_voice: false,
      allow_ai_assist: false,
      logic_rules: [],
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
      const { data: researcherData } = await supabase
        .from('researchers')
        .select('organization_id, id')
        .eq('user_id', user?.id)
        .single();

      if (!researcherData) throw new Error('Researcher not found');

      if (projectId) {
        await supabase
          .from('research_projects')
          .update(project)
          .eq('id', projectId);

        await supabase.from('survey_questions').delete().eq('project_id', projectId);
        
        for (const question of questions) {
          const { options, ...questionData } = question;
          const { data: insertedQuestion } = await supabase
            .from('survey_questions')
            .insert({ ...questionData, project_id: projectId, id: undefined })
            .select()
            .single();

          if (options && options.length > 0 && insertedQuestion) {
            await supabase
              .from('question_options')
              .insert(options.map(opt => ({
                ...opt,
                question_id: insertedQuestion.id,
                id: undefined
              })));
          }
        }
      } else {
        const { data: newProject } = await supabase
          .from('research_projects')
          .insert({
            ...project,
            organization_id: researcherData.organization_id,
            researcher_id: researcherData.id
          })
          .select()
          .single();

        if (newProject) {
          for (const question of questions) {
            const { options, ...questionData } = question;
            const { data: insertedQuestion } = await supabase
              .from('survey_questions')
              .insert({ ...questionData, project_id: newProject.id, id: undefined })
              .select()
              .single();

            if (options && options.length > 0 && insertedQuestion) {
              await supabase
                .from('question_options')
                .insert(options.map(opt => ({
                  ...opt,
                  question_id: insertedQuestion.id,
                  id: undefined
                })));
            }
          }
          navigate(`/easyresearch/project/${newProject.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EasierResearchLayout>
      <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="border-b" style={{ borderColor: 'var(--border-light)', backgroundColor: 'white' }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {projectId ? 'Edit Survey' : 'Create Survey'}
              </h1>
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

            <div className="flex gap-2 overflow-x-auto -mb-px">
              {(['design', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="pb-3 px-4 font-medium capitalize border-b-2 transition-all whitespace-nowrap"
                  style={{
                    color: activeTab === tab ? 'var(--color-green)' : 'var(--text-secondary)',
                    borderColor: activeTab === tab ? 'var(--color-green)' : 'transparent'
                  }}
                >
                  {tab === 'design' ? 'Questions' : 'Settings'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {activeTab === 'design' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-white rounded-2xl p-4 md:p-6" style={{ border: '1px solid var(--border-light)' }}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <h2 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Survey Questions
                    </h2>
                    <CustomDropdown
                      options={[
                        { value: '', label: '+ Add Question' },
                        { value: 'text_short', label: 'Short Text' },
                        { value: 'text_long', label: 'Long Text' },
                        { value: 'single_choice', label: 'Single Choice' },
                        { value: 'multiple_choice', label: 'Multiple Choice' },
                        { value: 'dropdown', label: 'Dropdown' },
                        { value: 'slider', label: 'Slider (Range)' },
                        { value: 'scale', label: 'Rating Scale' },
                        { value: 'likert', label: 'Likert Scale' },
                        { value: 'ranking', label: 'Ranking' },
                        { value: 'matrix', label: 'Matrix/Grid' },
                        { value: 'number', label: 'Number' },
                        { value: 'date', label: 'Date' },
                        { value: 'time', label: 'Time' },
                        { value: 'email', label: 'Email' },
                        { value: 'phone', label: 'Phone Number' },
                        { value: 'file_upload', label: 'File Upload' }
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
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <div
                          key={question.id}
                          className={`p-4 rounded-lg border cursor-pointer ${
                            selectedQuestion?.id === question.id ? 'bg-green-50' : 'hover:bg-gray-50'
                          }`}
                          style={{ 
                            borderColor: selectedQuestion?.id === question.id ? 'var(--color-green)' : 'var(--border-light)' 
                          }}
                          onClick={() => setSelectedQuestion(question)}
                        >
                          <div className="flex items-start justify-between">
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
                                {question.allow_ai_assist && (
                                  <Zap size={12} className="text-purple-600" />
                                )}
                                {question.allow_voice && (
                                  <Mic size={12} className="text-blue-600" />
                                )}
                              </div>
                              <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                {question.question_text}
                              </h3>
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
                                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveQuestion(question.id, 'down');
                                }}
                                disabled={index === questions.length - 1}
                                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                              >
                                <ChevronDown size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateQuestion(question);
                                }}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteQuestion(question.id);
                                }}
                                className="p-1 rounded hover:bg-gray-100 text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
              onUpdateLogic={(rules) => {
                console.log('Logic rules updated:', rules);
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
    </EasierResearchLayout>
  );
};

export default SurveyBuilder;
