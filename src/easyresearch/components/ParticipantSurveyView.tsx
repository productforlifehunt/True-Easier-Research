import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mic, X, ChevronRight, ChevronLeft, Check, Clock, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { validateSurveyResponse } from '../services/validationService';
import { normalizeLegacyQuestionType, groupQuestionsBySections } from '../constants/questionTypes';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import ParticipantOnboarding from './ParticipantOnboarding';

interface SurveyProject {
  id: string;
  organization_id?: string;
  title: string;
  description: string;
  consent_required?: boolean;
  consent_form_title?: string;
  consent_form_text?: string;
  consent_form_url?: string;
  project_type?: string;
  onboarding_required?: boolean;
  onboarding_instruction?: string;
  participant_numbering?: boolean;
  allow_participant_dnd?: boolean;
  study_duration?: number;
  survey_frequency?: string;
  show_progress_bar?: boolean;
  disable_backtracking?: boolean;
  auto_advance?: boolean;
  randomize_questions?: boolean;
}

interface SurveyQuestion {
  id: string;
  question_type: string;
  question_text: string;
  question_description?: string;
  question_config?: any;
  required: boolean;
  allow_voice: boolean;
  allow_ai_assist: boolean;
  response_required?: string;
  allow_other?: boolean;
  allow_none?: boolean;
  options?: any[];
  order_index: number;
}

interface SurveyResponse {
  [questionId: string]: any;
}

interface ParticipantSurveyViewProps {
  projectId?: string;
  enrollmentId?: string;
  instanceId?: string;
}

const ParticipantSurveyView: React.FC<ParticipantSurveyViewProps> = ({ 
  projectId: propProjectId,
  enrollmentId: propEnrollmentId,
  instanceId: propInstanceId
}) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const projectId = propProjectId || paramProjectId;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [project, setProject] = useState<SurveyProject | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [logicRules, setLogicRules] = useState<any[]>([]);
  const [showConsent, setShowConsent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(propEnrollmentId || null);
  const [activeTab, setActiveTab] = useState<'survey' | 'summary' | 'settings'>('survey');
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [lastAnsweredId, setLastAnsweredId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [questionsPerPage, setQuestionsPerPage] = useState<number | null>(1); // null = unlimited

  useEffect(() => {
    if (projectId) {
      loadSurvey();
    }
  }, [projectId]);

  // If opened with instanceId (from timeline modal), skip all onboarding/consent
  useEffect(() => {
    if (propInstanceId && propEnrollmentId) {
      setShowConsent(false);
      setShowOnboarding(false);
      setEnrollmentId(propEnrollmentId);
    }
  }, [propInstanceId, propEnrollmentId]);
  
  // Load existing responses when instanceId is available (doesn't need questions loaded)
  useEffect(() => {
    if (propInstanceId && projectId) {
      loadExistingResponses();
    }
  }, [propInstanceId, projectId]);

  const loadExistingResponses = async () => {
    if (!propInstanceId || !projectId) return;
    
    try {
      // Check if instance is completed
      const { data: instance } = await supabase
        .from('survey_instance')
        .select('status')
        .eq('id', propInstanceId)
        .maybeSingle();
      
      if (instance?.status === 'completed') {
        setIsCompleted(true);
      }
      
      // Load existing responses for this specific instance
      const { data: existingResponses, error } = await supabase
        .from('survey_respons')
        .select('question_id, response_text, response_value, created_at')
        .eq('instance_id', propInstanceId)
        .order('created_at', { ascending: false });
      
      if (existingResponses && existingResponses.length > 0) {
        // Pre-fill responses state with existing data
        const loadedResponses: SurveyResponse = {};
        existingResponses.forEach(r => {
          if (loadedResponses[r.question_id] !== undefined) return;

          if (Array.isArray((r as any).response_value)) {
            loadedResponses[r.question_id] = (r as any).response_value;
            return;
          }
          if ((r as any).response_value && typeof (r as any).response_value === 'object' && 'option_id' in (r as any).response_value) {
            loadedResponses[r.question_id] = ((r as any).response_value as any).option_id;
            return;
          }
          if ((r as any).response_value !== null && (r as any).response_value !== undefined) {
            loadedResponses[r.question_id] = (r as any).response_value;
            return;
          }
          loadedResponses[r.question_id] = (r as any).response_text || '';
        });
        setResponses(loadedResponses);
      }
    } catch (error) {
      console.error('Error loading existing responses:', error);
    }
  };

  const loadSurvey = async () => {
    try {
      // Load project details
      const { data: project } = await supabase
        .from('research_project')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (project) {
        // All display/behavior settings are proper columns now — no JSONB normalization needed
        setProject(project);
        
        // Load logic rules from logic_rule table
        const { data: logicRows } = await supabase
          .from('logic_rule')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index');
        if (logicRows) {
          setLogicRules(logicRows.map((r: any) => ({
            id: r.id,
            questionId: r.question_id,
            condition: r.condition,
            value: r.value,
            action: r.action,
            targetQuestionId: r.target_question_id,
          })));
        }

        // Load questions
        const { data: questions, error: questionsError } = await supabase
          .from('survey_question')
          .select('*, options:question_option(*)')
          .eq('project_id', projectId)
          .order('order_index');
        
        if (questionsError) {
          console.error('Error loading questions:', questionsError);
        }

        if (questions) {
          // Hydrate allow_other/allow_none/response_required from question_config (stored there, not as DB columns)
          const hydrated = questions.map((q: any) => {
            if (q.question_config) {
              if (q.question_config.allow_other !== undefined) q.allow_other = q.question_config.allow_other;
              if (q.question_config.allow_none !== undefined) q.allow_none = q.question_config.allow_none;
              if (q.question_config.response_required !== undefined) q.response_required = q.question_config.response_required;
            }
            return q;
          });
          setQuestions(hydrated);

          // Load questionnaire display_mode
          let questionnaireId: string | null = null;
          if (propInstanceId) {
            const { data: inst } = await supabase
              .from('survey_instance')
              .select('questionnaire_id')
              .eq('id', propInstanceId)
              .maybeSingle();
            questionnaireId = inst?.questionnaire_id || null;
          }
          if (!questionnaireId && hydrated.length > 0) {
            questionnaireId = hydrated[0].questionnaire_id || null;
          }
          if (questionnaireId) {
            const { data: qRow } = await supabase
              .from('questionnaire')
              .select('questions_per_page')
              .eq('id', questionnaireId)
              .maybeSingle();
            if (qRow) {
              setQuestionsPerPage(qRow.questions_per_page ?? null);
            }
          }
        }

        // Check for existing enrollment
        const existingEnrollmentId = localStorage.getItem(`enrollment_${projectId}`);
        
        // Skip consent if parameter is set (for enrolled users)
        const skipConsent = searchParams.get('skip_consent') === 'true';
        if (existingEnrollmentId && skipConsent) {
          setShowConsent(false);
          setEnrollmentId(existingEnrollmentId);
        }
        
        if (existingEnrollmentId) {
          // Check if enrollment exists in database
          const { data: enrollment } = await supabase
            .from('enrollment')
            .select('*')
            .eq('id', existingEnrollmentId)
            .maybeSingle();

          if (enrollment) {
            setEnrollmentId(enrollment.id);
            const consentRequired = !!project.consent_required;
            const hasConsent = !!(enrollment as any).consent_signed_at;
            setShowConsent(consentRequired && !hasConsent);
            setShowOnboarding(false);
            
            // If longitudinal survey and enrolled, redirect to timeline ONLY if no instance specified
            const instanceParam = searchParams.get('instance') || propInstanceId;
            if (project.project_type === 'longitudinal' && !instanceParam) {
              window.location.href = `/easyresearch/participant/${projectId}/timeline`;
              return;
            }
          } else {
            // If onboarding is required for longitudinal studies
            if (project.project_type === 'longitudinal' && project.onboarding_required) {
              setShowOnboarding(true);
              setShowConsent(false);
            } else if (project.consent_required) {
              setShowConsent(true);
            } else if (project.project_type === 'longitudinal' && !existingEnrollmentId) {
              setShowOnboarding(true);
              setShowConsent(false);
            } else if (!project.consent_required) {
              setShowConsent(false);
            }
          }
        } else {
          // New participant - check if onboarding is required
          if (project.project_type === 'longitudinal' && project.onboarding_required) {
            setShowOnboarding(true);
            setShowConsent(false);
          } else if (project.consent_required) {
            setShowConsent(true);
          } else if (project.project_type === 'longitudinal' && !existingEnrollmentId) {
            setShowOnboarding(true);
            setShowConsent(false);
          } else if (!project.consent_required) {
            setShowConsent(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentAccept = async () => {
    try {
      const consentRequired = !!project?.consent_required;
      if (consentRequired) {
        const now = new Date().toISOString();
        let currentEnrollmentId = enrollmentId || localStorage.getItem(`enrollment_${projectId}`);

        // For longitudinal onboarding flow, enrollment/consent is captured in onboarding.
        if (!(project?.project_type === 'longitudinal' && project?.onboarding_required)) {
          if (!currentEnrollmentId) {
            const fallbackEmail = user?.email || `anonymous+${crypto.randomUUID()}@participant.local`;
            const { data: enrollment, error } = await supabase
              .from('enrollment')
              .insert({
                project_id: projectId,
                participant_id: user?.id || null,
                participant_email: fallbackEmail,
                status: 'active',
                consent_signed_at: now
              })
              .select()
              .single();

            if (error) throw error;
            if (enrollment) {
              currentEnrollmentId = enrollment.id;
              setEnrollmentId(enrollment.id);
              localStorage.setItem(`enrollment_${projectId}`, enrollment.id);
            }
          } else {
            await supabase
              .from('enrollment')
              .update({ consent_signed_at: now })
              .eq('id', currentEnrollmentId);
          }
        }
      }
    } catch (error) {
      console.error('Error saving consent:', error);
      toast.error('Failed to record consent. Please try again.');
      return;
    }

    setShowConsent(false);
    // For longitudinal studies with onboarding, show onboarding after consent
    if (project?.project_type === 'longitudinal' && project?.onboarding_required) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Enrollment is created in onboarding component
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    setLastAnsweredId(questionId);
    if (fieldErrors[questionId]?.length) {
      setFieldErrors(prev => ({ ...prev, [questionId]: [] }));
    }
  };

  // Evaluate logic rules to determine which questions should be visible
  const evaluateLogicRule = (rule: any): boolean => {
    const sourceValue = responses[rule.questionId];
    if (sourceValue === undefined || sourceValue === null) return false;
    
    const valueStr = String(sourceValue).toLowerCase();
    const ruleValue = String(rule.value).toLowerCase();
    
    switch (rule.condition) {
      case 'equals':
        return valueStr === ruleValue;
      case 'not_equals':
        return valueStr !== ruleValue;
      case 'contains':
        return valueStr.includes(ruleValue);
      case 'greater_than':
        return Number(sourceValue) > Number(rule.value);
      case 'less_than':
        return Number(sourceValue) < Number(rule.value);
      case 'is_empty':
        return !sourceValue || valueStr === '';
      case 'is_not_empty':
        return !!sourceValue && valueStr !== '';
      default:
        return false;
    }
  };

  // Get visible questions based on logic rules
  const getVisibleQuestions = (): SurveyQuestion[] => {
    if (logicRules.length === 0) return questions;
    
    const hiddenQuestionIds = new Set<string>();
    
    for (const rule of logicRules) {
      const ruleMatches = evaluateLogicRule(rule);
      
      if (rule.action === 'hide' && ruleMatches) {
        hiddenQuestionIds.add(rule.targetQuestionId);
      } else if (rule.action === 'show' && !ruleMatches) {
        // If show rule doesn't match, hide the target
        hiddenQuestionIds.add(rule.targetQuestionId);
      }
      // Skip logic is handled during navigation, not filtering
    }
    
    return questions.filter(q => !hiddenQuestionIds.has(q.id));
  };

  const visibleQuestions = getVisibleQuestions();
  const orderedVisibleQuestions = questionOrder.length
    ? visibleQuestions.sort((a, b) => questionOrder.indexOf(a.id) - questionOrder.indexOf(b.id))
    : visibleQuestions;
  const currentQuestion = orderedVisibleQuestions[currentQuestionIndex];
  const progressPercent = orderedVisibleQuestions.length > 0
    ? ((currentQuestionIndex + 1) / orderedVisibleQuestions.length) * 100
    : 0;

  useEffect(() => {
    if (!project || questions.length === 0) return;
    const ids = questions.map(q => q.id);
    if (project.randomize_questions) {
      const shuffled = [...ids];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setQuestionOrder(shuffled);
    } else {
      setQuestionOrder(ids);
    }
  }, [project, questions]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [questionOrder.length]);

  const getQuestionIndex = (questionId: string) => {
    const list = orderedVisibleQuestions;
    return list.findIndex(q => q.id === questionId);
  };

  const findSkipTargetIndex = (questionId: string) => {
    const rule = logicRules.find(r => r.action === 'skip' && r.questionId === questionId && evaluateLogicRule(r));
    if (!rule?.targetQuestionId) return null;
    const targetIndex = getQuestionIndex(rule.targetQuestionId);
    return targetIndex >= 0 ? targetIndex : null;
  };

  const validateCurrentQuestion = () => {
    if (!currentQuestion) return true;
    const { errors } = validateSurveyResponse([currentQuestion], responses);
    if (errors[currentQuestion.id]?.length) {
      setFieldErrors(prev => ({ ...prev, [currentQuestion.id]: errors[currentQuestion.id] }));
      toast.error(errors[currentQuestion.id][0]);
      return false;
    }
    return true;
  };

  const handleNextQuestion = () => {
    if (!validateCurrentQuestion()) return;
    const skipIndex = currentQuestion ? findSkipTargetIndex(currentQuestion.id) : null;
    if (skipIndex !== null) {
      setCurrentQuestionIndex(skipIndex);
      return;
    }
    setCurrentQuestionIndex(prev => Math.min(prev + 1, orderedVisibleQuestions.length - 1));
  };

  const handlePreviousQuestion = () => {
    if (project?.disable_backtracking) return;
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (!project?.auto_advance || !currentQuestion || lastAnsweredId !== currentQuestion.id) return;
    const normalized = normalizeLegacyQuestionType(currentQuestion.question_type);
    const autoAdvanceTypes = ['single_choice', 'dropdown', 'rating', 'nps', 'likert_scale', 'slider', 'date', 'time'];
    if (autoAdvanceTypes.includes(normalized) && currentQuestionIndex < orderedVisibleQuestions.length - 1) {
      handleNextQuestion();
    }
  }, [lastAnsweredId, project?.auto_advance, currentQuestion?.id, currentQuestionIndex, orderedVisibleQuestions.length]);

  const handleVoiceInput = async (questionId: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsRecording(questionId);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentValue = responses[questionId] || '';
      const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;
      handleResponseChange(questionId, newValue);
      setIsRecording(null);
    };

    recognition.onerror = () => {
      setIsRecording(null);
      toast.error('Voice input failed. Please try again.');
    };

    recognition.onend = () => {
      setIsRecording(null);
    };

    recognition.start();
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          toast.success('Copied to clipboard!');
          return;
        } catch (clipboardError) {
          // Fall through to execCommand fallback
        }
      }
      
      // Fallback to older method (works in Puppeteer and when document not focused)
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          toast.success('Copied to clipboard!');
        } else {
          toast.error('Copy failed. Please manually select and copy the text.');
        }
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy. Please manually select and copy the text.');
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // When showing multiple questions per page, validate all visible before submitting
    if (questionsPerPage === null || questionsPerPage > 1) {
      const { errors } = validateSurveyResponse(orderedVisibleQuestions, responses);
      const hasErrors = Object.values(errors).some(e => e.length > 0);
      if (hasErrors) {
        setFieldErrors(errors);
        const firstErrorQ = orderedVisibleQuestions.find(q => errors[q.id]?.length > 0);
        if (firstErrorQ) {
          const el = document.getElementById(`question-${firstErrorQ.id}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        toast.error('Please complete all required questions.');
        return;
      }
    }
    
    setSubmitting(true);
    
    try {
      if (!projectId) {
        toast.error('Missing survey id');
        return;
      }

      let currentEnrollmentId = enrollmentId || localStorage.getItem(`enrollment_${projectId}`);

      if (!currentEnrollmentId) {
        const now = new Date().toISOString();
        const fallbackEmail = user?.email || `anonymous+${crypto.randomUUID()}@participant.local`;

        const { data: newEnrollment, error: enrollError } = await supabase
          .from('enrollment')
          .insert({
            project_id: projectId,
            participant_id: user?.id || null,
            participant_email: fallbackEmail,
            status: 'active',
            ...(project?.consent_required ? { consent_signed_at: now } : {})
          })
          .select('id')
          .single();

        if (enrollError || !newEnrollment?.id) {
          console.error('Error creating enrollment:', enrollError);
          toast.error('Error enrolling in study. Please try again.');
          return;
        }

        currentEnrollmentId = newEnrollment.id;
        localStorage.setItem(`enrollment_${projectId}`, currentEnrollmentId);
        setEnrollmentId(currentEnrollmentId);
      }

      // Delete existing responses for this instance if updating
      if (propInstanceId) {
        await supabase
          .from('survey_respons')
          .delete()
          .eq('instance_id', propInstanceId);
      }
      
      // Insert new/updated responses with instance_id
      // Using DB column names: response_text, response_value
      const responseInserts = [];
      for (const [questionId, response] of Object.entries(responses)) {
        if (questionId.endsWith('_other_text')) continue;
        const question = questions.find(q => q.id === questionId);
        if (!question) continue;

        const otherTextKey = `${questionId}_other_text`;
        const otherTextRaw = (responses as any)[otherTextKey];
        const otherText = typeof otherTextRaw === 'string' ? otherTextRaw.trim() : '';
        
        let answerText: string | null = null;
        let answerNumber: number | null = null;
        let answerArray: string[] | null = null;
        let answerJson: any = null;
        let responseValue: any = null;
        
        if (Array.isArray(response)) {
          answerArray = response.map(String);
          responseValue = answerArray;
          if (question?.options) {
            const labels = answerArray.map(val => {
              const opt = question.options?.find((o: any) => o.id === val || o.option_value === val || o.value === val);
              return opt?.text || opt?.option_text || opt?.label || val;
            });
            answerText = labels.join(', ');
          } else {
            answerText = answerArray.join(', ');
          }

          if (answerArray.includes('other') && otherText.length > 0) {
            responseValue = { selected: answerArray, other_text: otherText };
            answerText = answerText ? `${answerText} (Other: ${otherText})` : otherText;
          }
        } else if (typeof response === 'number' || (!isNaN(Number(response)) && response !== '')) {
          answerNumber = Number(response);
          responseValue = answerNumber;
          answerText = String(response);
        } else if (typeof response === 'object' && response !== null) {
          answerJson = response;
          responseValue = answerJson;
          answerText = JSON.stringify(response);
        } else {
          const responseStr = String(response);
          responseValue = responseStr;
          if (question?.options) {
            const opt = question.options.find((o: any) => o.id === responseStr || o.option_value === responseStr || o.value === responseStr);
            if (opt) {
              answerText = opt.text || opt.option_text || opt.label || responseStr;
              if (responseStr === 'other') {
                responseValue = { option_id: 'other', other_text: otherText || null };
                answerText = otherText || answerText;
              } else {
                answerJson = { option_id: responseStr };
                responseValue = answerJson;
              }
            } else {
              answerText = responseStr;
            }
          } else {
            answerText = responseStr;
          }
        }
        
        responseInserts.push({
          project_id: projectId,
          enrollment_id: currentEnrollmentId,
          instance_id: propInstanceId || null,
          question_id: questionId,
          response_type: question?.question_type || null,
          response_text: answerText,
          response_value: responseValue
        });
      }
      
      const { error: responseError } = await supabase
        .from('survey_respons')
        .insert(responseInserts);

      if (responseError) {
        toast.error(`Error saving responses: ${responseError.message}`);
        setSubmitting(false);
        return;
      }
      
      // Update instance status if provided
      if (propInstanceId) {
        const { data: instance } = await supabase
          .from('survey_instance')
          .select('actual_start_time')
          .eq('id', propInstanceId)
          .maybeSingle();
        
        await supabase
          .from('survey_instance')
          .update({ 
            status: 'completed',
            actual_start_time: instance?.actual_start_time || new Date().toISOString(),
            actual_end_time: new Date().toISOString()
          })
          .eq('id', propInstanceId);
      }
      
      if (project?.project_type === 'longitudinal') {
        window.location.href = `/easyresearch/participant/${projectId}/timeline`;
      } else {
        navigate(`/easyresearch/survey/${projectId}/complete`);
      }
    } catch (error) {
      toast.error('Error submitting survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion, value: any) => {
    const normalizedType = normalizeLegacyQuestionType(question.question_type);
    switch (normalizedType) {
      case 'single_choice':
        const singleChoiceOptions = question.options || (question as any).question_config?.options || [];
        return (
          <div className="space-y-3">
            {singleChoiceOptions.map((option: any) => (
              <label
                key={option.id}
                className="flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                style={{
                  borderColor: value === option.id ? 'var(--color-green)' : 'var(--border-light)',
                  backgroundColor: value === option.id ? '#f0fdf4' : 'white'
                }}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={value === option.id}
                  onChange={() => handleResponseChange(question.id, option.id)}
                  className="mr-3"
                  disabled={isCompleted && !editMode}
                />
                <span style={{ color: 'var(--text-primary)' }}>{option.text || option.option_text}</span>
              </label>
            ))}
            {question.allow_other && (
              <div className="space-y-2">
                <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                  style={{
                    borderColor: value === 'other' ? 'var(--color-green)' : 'var(--border-light)',
                    backgroundColor: value === 'other' ? '#f0fdf4' : 'white'
                  }}>
                  <input
                    type="radio"
                    name={question.id}
                    value="other"
                    checked={value === 'other'}
                    onChange={() => handleResponseChange(question.id, 'other')}
                    className="mr-3"
                    disabled={isCompleted && !editMode}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>Other</span>
                </label>
                {value === 'other' && (
                  <input
                    type="text"
                    placeholder="Please specify..."
                    className="w-full px-4 py-2 rounded-lg border-2 ml-8"
                    style={{ borderColor: 'var(--border-light)' }}
                    onChange={(e) => handleResponseChange(question.id + '_other_text', e.target.value)}
                    disabled={isCompleted && !editMode}
                  />
                )}
              </div>
            )}
            {question.allow_none && (
              <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                style={{
                  borderColor: value === 'none' ? 'var(--color-green)' : 'var(--border-light)',
                  backgroundColor: value === 'none' ? '#f0fdf4' : 'white'
                }}>
                <input
                  type="radio"
                  name={question.id}
                  value="none"
                  checked={value === 'none'}
                  onChange={() => handleResponseChange(question.id, 'none')}
                  className="mr-3"
                  disabled={isCompleted && !editMode}
                />
                <span style={{ color: 'var(--text-primary)' }}>None of the above</span>
              </label>
            )}
          </div>
        );

      case 'multiple_choice':
        const multipleChoiceOptions = question.options || (question as any).question_config?.options || [];
        const multipleChoiceValue = value || [];
        return (
          <div className="space-y-3">
            {multipleChoiceOptions.map((option: any) => {
              const selected = Array.isArray(multipleChoiceValue) && multipleChoiceValue.includes(option.id);
              return (
                <label
                  key={option.id}
                  className="flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                  style={{
                    borderColor: selected ? 'var(--color-green)' : 'var(--border-light)',
                    backgroundColor: selected ? '#f0fdf4' : 'white'
                  }}
                >
                  <input
                    type="checkbox"
                    value={option.id}
                    checked={selected || false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(multipleChoiceValue) ? multipleChoiceValue : [];
                      if (e.target.checked) {
                        handleResponseChange(question.id, [...currentValues, option.id]);
                      } else {
                        handleResponseChange(question.id, currentValues.filter((v: string) => v !== option.id));
                      }
                    }}
                    className="mr-3"
                    disabled={isCompleted && !editMode}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>{option.text || option.option_text}</span>
                </label>
              );
            })}
            {question.allow_other && (
              <div className="space-y-2">
                <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                  style={{
                    borderColor: Array.isArray(multipleChoiceValue) && multipleChoiceValue.includes('other') ? 'var(--color-green)' : 'var(--border-light)',
                    backgroundColor: Array.isArray(multipleChoiceValue) && multipleChoiceValue.includes('other') ? '#f0fdf4' : 'white'
                  }}>
                  <input
                    type="checkbox"
                    value="other"
                    checked={Array.isArray(multipleChoiceValue) && multipleChoiceValue.includes('other')}
                    onChange={(e) => {
                      const currentValues = Array.isArray(multipleChoiceValue) ? multipleChoiceValue : [];
                      if (e.target.checked) {
                        handleResponseChange(question.id, [...currentValues, 'other']);
                      } else {
                        handleResponseChange(question.id, currentValues.filter((v: string) => v !== 'other'));
                      }
                    }}
                    className="mr-3"
                    disabled={isCompleted && !editMode}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>Other</span>
                </label>
                {Array.isArray(multipleChoiceValue) && multipleChoiceValue.includes('other') && (
                  <input
                    type="text"
                    placeholder="Please specify..."
                    className="w-full px-4 py-2 rounded-lg border-2 ml-8"
                    style={{ borderColor: 'var(--border-light)' }}
                    onChange={(e) => handleResponseChange(question.id + '_other_text', e.target.value)}
                    disabled={isCompleted && !editMode}
                  />
                )}
              </div>
            )}
            {question.allow_none && (
              <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                style={{
                  borderColor: Array.isArray(multipleChoiceValue) && multipleChoiceValue.includes('none') ? 'var(--color-green)' : 'var(--border-light)',
                  backgroundColor: Array.isArray(multipleChoiceValue) && multipleChoiceValue.includes('none') ? '#f0fdf4' : 'white'
                }}>
                <input
                  type="checkbox"
                  value="none"
                  checked={Array.isArray(multipleChoiceValue) && multipleChoiceValue.includes('none')}
                  onChange={(e) => {
                    const currentValues = Array.isArray(multipleChoiceValue) ? multipleChoiceValue : [];
                    if (e.target.checked) {
                      handleResponseChange(question.id, [...currentValues, 'none']);
                    } else {
                      handleResponseChange(question.id, currentValues.filter((v: string) => v !== 'none'));
                    }
                  }}
                  className="mr-3"
                  disabled={isCompleted && !editMode}
                />
                <span style={{ color: 'var(--text-primary)' }}>None of the above</span>
              </label>
            )}
          </div>
        );

      case 'slider':
        const sliderMin = (question as any).question_config?.min_value ?? (question as any).question_config?.min ?? 0;
        const sliderMax = (question as any).question_config?.max_value ?? (question as any).question_config?.max ?? 10;
        const sliderStep = (question as any).question_config?.step ?? 1;
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={sliderStep}
              value={value || sliderMin}
              onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
              className="w-full"
              disabled={isCompleted && !editMode}
            />
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>{sliderMin}</span>
              <span className="font-semibold" style={{ color: 'var(--color-green)' }}>{value || sliderMin}</span>
              <span>{sliderMax}</span>
            </div>
          </div>
        );

      case 'rating':
        const ratingMax = (question as any).question_config?.max_value ?? (question as any).max_value ?? 5;
        return (
          <div className="flex gap-2 justify-center">
            {Array.from({ length: ratingMax }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => handleResponseChange(question.id, num)}
                disabled={isCompleted && !editMode}
                className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                  value === num ? 'bg-emerald-500 text-white border-emerald-500' : 'hover:bg-emerald-50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        );

      case 'nps':
        return (
          <div className="space-y-4">
            <div className="flex gap-1 justify-center flex-wrap">
              {Array.from({ length: 11 }, (_, i) => i).map((num) => (
                <button
                  key={num}
                  onClick={() => handleResponseChange(question.id, num)}
                  disabled={isCompleted && !editMode}
                  className={`w-10 h-10 rounded-lg border-2 text-sm font-semibold transition-all ${
                    value === num 
                      ? num <= 6 ? 'bg-red-500 text-white border-red-500' 
                        : num <= 8 ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-emerald-500 text-white border-emerald-500'
                      : 'hover:bg-emerald-50'
                  }`}
                  style={{ borderColor: value === num ? undefined : 'var(--border-light)' }}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>Not at all likely</span>
              <span>Extremely likely</span>
            </div>
          </div>
        );

      case 'likert_scale':
        const likertScaleType = (question as any).question_config?.scale_type || '1-5';
        const likertRange = likertScaleType.split('-').map(Number);
        const likertMin = likertRange[0];
        const likertMax = likertRange[1];
        const likertCustomLabels: string[] | undefined = (question as any).question_config?.custom_labels;
        const likertMinLabel = (question as any).question_config?.min_label || '';
        const likertMaxLabel = (question as any).question_config?.max_label || '';
        
        // Build options: use custom labels if provided, else default numbered
        const likertOptionsList: { value: number; label: string }[] = [];
        for (let i = likertMin; i <= likertMax; i++) {
          const idx = i - likertMin;
          const label = likertCustomLabels?.[idx] || String(i);
          likertOptionsList.push({ value: i, label });
        }
        
        return (
          <div className="space-y-2">
            {likertOptionsList.map((option) => (
              <label
                key={option.value}
                className="flex items-center p-3 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                style={{
                  borderColor: value === option.value ? 'var(--color-green)' : 'var(--border-light)',
                  backgroundColor: value === option.value ? '#f0fdf4' : 'white'
                }}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleResponseChange(question.id, option.value)}
                  className="mr-3"
                  disabled={isCompleted && !editMode}
                />
                <span className="flex-1" style={{ color: 'var(--text-primary)' }}>{option.label}</span>
                {!likertCustomLabels && <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>({option.value})</span>}
              </label>
            ))}
            {(likertMinLabel || likertMaxLabel) && (
              <div className="flex justify-between text-[11px] px-1" style={{ color: 'var(--text-secondary)' }}>
                <span>{likertMinLabel}</span>
                <span>{likertMaxLabel}</span>
              </div>
            )}
          </div>
        );

      case 'dropdown':
        const dropdownOptions = question.options || (question as any).question_config?.options || [];
        return (
          <select
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full p-3 rounded-lg border-2"
            style={{ borderColor: 'var(--border-light)' }}
            disabled={isCompleted && !editMode}
          >
            <option value="">Select an option...</option>
            {dropdownOptions.map((option: any) => (
              <option key={option.id} value={option.id}>
                {option.text || option.option_text}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value ? parseFloat(e.target.value) : '')}
            placeholder="Enter a number..."
            className="w-full p-3 rounded-lg border-2"
            style={{ borderColor: 'var(--border-light)' }}
            disabled={isCompleted && !editMode}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full p-3 rounded-lg border-2"
            style={{ borderColor: 'var(--border-light)' }}
            disabled={isCompleted && !editMode}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full p-3 rounded-lg border-2"
            style={{ borderColor: 'var(--border-light)' }}
            disabled={isCompleted && !editMode}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="your@email.com"
            className="w-full p-3 rounded-lg border-2"
            style={{ borderColor: 'var(--border-light)' }}
            disabled={isCompleted && !editMode}
          />
        );

      case 'text_short':
      case 'text_long':
        return (
          <div className="space-y-2">
            <textarea
              value={value || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder="Type your response here..."
              className="w-full p-4 rounded-lg border-2 min-h-[120px] resize-y"
              style={{ borderColor: 'var(--border-light)' }}
              disabled={isCompleted && !editMode}
            />
            {question.allow_voice && !isCompleted && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleVoiceInput(question.id)}
                  disabled={isRecording === question.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-green-50 disabled:opacity-50"
                  style={{ borderColor: 'var(--border-light)' }}
                >
                  <Mic size={16} style={{ color: 'var(--color-green)' }} />
                  {isRecording === question.id ? 'Recording...' : 'Voice Input'}
                </button>
              </div>
            )}
          </div>
        );

      case 'bipolar_scale':
        const bipolarMin = (question as any).question_config?.min_value ?? -3;
        const bipolarMax = (question as any).question_config?.max_value ?? 3;
        const bipolarStep = (question as any).question_config?.step ?? 1;
        const bipolarMinLabel = (question as any).question_config?.min_label || '';
        const bipolarMaxLabel = (question as any).question_config?.max_label || '';
        const bipolarShowLabels = (question as any).question_config?.show_value_labels !== false;
        const bipolarPoints: number[] = [];
        for (let i = bipolarMin; i <= bipolarMax; i += bipolarStep) bipolarPoints.push(i);
        return (
          <div className="space-y-4">
            <div className="flex justify-center gap-1.5 flex-wrap">
              {bipolarPoints.map(v => (
                <button
                  key={v}
                  onClick={() => handleResponseChange(question.id, v)}
                  disabled={isCompleted && !editMode}
                  className="w-12 h-12 rounded-xl border-2 font-semibold text-[14px] transition-all hover:scale-105"
                  style={{
                    borderColor: value === v ? (v < 0 ? '#ef4444' : v > 0 ? '#10b981' : '#6b7280') : 'var(--border-light)',
                    backgroundColor: value === v ? (v < 0 ? '#fef2f2' : v > 0 ? '#f0fdf4' : '#f9fafb') : 'white',
                    color: v < 0 ? '#ef4444' : v > 0 ? '#10b981' : '#6b7280',
                  }}
                >
                  {v > 0 ? `+${v}` : v}
                </button>
              ))}
            </div>
            {(bipolarMinLabel || bipolarMaxLabel) && (
              <div className="flex justify-between text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                <span>{bipolarMinLabel}</span>
                <span>{bipolarMaxLabel}</span>
              </div>
            )}
          </div>
        );

      case 'checkbox_group':
        const checkboxOptions = question.options || (question as any).question_config?.options || [];
        const checkboxValue = Array.isArray(value) ? value : [];
        const cbColumns = (question as any).question_config?.columns || 1;
        return (
          <div className="space-y-3">
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cbColumns}, 1fr)`, gap: '8px' }}>
              {checkboxOptions.map((option: any) => {
                const selected = checkboxValue.includes(option.id || option.option_text);
                return (
                  <label
                    key={option.id}
                    className="flex items-center p-3 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                    style={{
                      borderColor: selected ? 'var(--color-green)' : 'var(--border-light)',
                      backgroundColor: selected ? '#f0fdf4' : 'white'
                    }}
                  >
                    <input
                      type="checkbox"
                      value={option.id || option.option_text}
                      checked={selected}
                      onChange={(e) => {
                        const val = option.id || option.option_text;
                        if (e.target.checked) {
                          handleResponseChange(question.id, [...checkboxValue, val]);
                        } else {
                          handleResponseChange(question.id, checkboxValue.filter((v: string) => v !== val));
                        }
                      }}
                      className="mr-3"
                      disabled={isCompleted && !editMode}
                    />
                    <span style={{ color: 'var(--text-primary)' }} className="text-[13px]">{option.text || option.option_text}</span>
                  </label>
                );
              })}
            </div>
            {question.allow_other && (
              <div className="space-y-2">
                <label className="flex items-center p-3 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                  style={{
                    borderColor: checkboxValue.includes('other') ? 'var(--color-green)' : 'var(--border-light)',
                    backgroundColor: checkboxValue.includes('other') ? '#f0fdf4' : 'white'
                  }}>
                  <input type="checkbox" value="other" checked={checkboxValue.includes('other')}
                    onChange={(e) => {
                      if (e.target.checked) handleResponseChange(question.id, [...checkboxValue, 'other']);
                      else handleResponseChange(question.id, checkboxValue.filter((v: string) => v !== 'other'));
                    }} className="mr-3" disabled={isCompleted && !editMode} />
                  <span style={{ color: 'var(--text-primary)' }} className="text-[13px]">Other</span>
                </label>
                {checkboxValue.includes('other') && (
                  <input type="text" placeholder="Please specify..." className="w-full px-4 py-2 rounded-lg border-2 ml-8 text-[13px]"
                    style={{ borderColor: 'var(--border-light)' }}
                    onChange={(e) => handleResponseChange(question.id + '_other_text', e.target.value)}
                    disabled={isCompleted && !editMode} />
                )}
              </div>
            )}
          </div>
        );

      case 'section_header':
        return null;

      case 'yes_no':
        const yesLabel = (question as any).question_config?.yes_label || 'Yes';
        const noLabel = (question as any).question_config?.no_label || 'No';
        return (
          <div className="flex gap-3">
            {[{ val: 'yes', label: yesLabel }, { val: 'no', label: noLabel }].map(opt => (
              <button
                key={opt.val}
                onClick={() => handleResponseChange(question.id, opt.val)}
                disabled={isCompleted && !editMode}
                className="flex-1 py-4 rounded-xl border-2 text-lg font-semibold transition-all hover:scale-[1.02]"
                style={{
                  borderColor: value === opt.val ? 'var(--color-green)' : 'var(--border-light)',
                  backgroundColor: value === opt.val ? '#f0fdf4' : 'white',
                  color: value === opt.val ? 'var(--color-green)' : 'var(--text-primary)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );

      case 'matrix':
        const mxColumns = (question as any).question_config?.columns || [];
        const mxRows = question.options || [];
        const matrixValue = (typeof value === 'object' && value !== null && !Array.isArray(value)) ? value : {};
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th className="text-left p-2 text-stone-400 font-medium" style={{ minWidth: 120 }}></th>
                  {mxColumns.map((col: string, i: number) => (
                    <th key={i} className="text-center p-2 text-stone-500 font-medium text-[12px]" style={{ minWidth: 60 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mxRows.map((row: any) => (
                  <tr key={row.id} className="border-t border-stone-100">
                    <td className="p-2 font-medium" style={{ color: 'var(--text-primary)' }}>{row.option_text || row.text}</td>
                    {mxColumns.map((col: string, ci: number) => (
                      <td key={ci} className="text-center p-2">
                        <button
                          onClick={() => handleResponseChange(question.id, { ...matrixValue, [row.id]: col })}
                          disabled={isCompleted && !editMode}
                          className="w-6 h-6 rounded-full border-2 transition-all mx-auto"
                          style={{
                            borderColor: matrixValue[row.id] === col ? 'var(--color-green)' : 'var(--border-light)',
                            backgroundColor: matrixValue[row.id] === col ? 'var(--color-green)' : 'white',
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'ranking':
        const rankingOptions = question.options || [];
        const rankingValue: string[] = Array.isArray(value) ? value : rankingOptions.map((o: any) => o.id);
        const rankedItems = rankingValue.map(id => rankingOptions.find((o: any) => o.id === id)).filter(Boolean);
        const moveRankItem = (fromIdx: number, toIdx: number) => {
          const newRank = [...rankingValue];
          const [moved] = newRank.splice(fromIdx, 1);
          newRank.splice(toIdx, 0, moved);
          handleResponseChange(question.id, newRank);
        };
        return (
          <div className="space-y-2">
            <p className="text-[12px] text-stone-400 mb-2">Drag or use arrows to rank in order of preference</p>
            {rankedItems.map((item: any, idx: number) => (
              <div key={item.id} className="flex items-center gap-2 p-3 rounded-lg border-2 bg-white" style={{ borderColor: 'var(--border-light)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold" style={{ backgroundColor: '#f0fdf4', color: 'var(--color-green)' }}>{idx + 1}</span>
                <span className="flex-1" style={{ color: 'var(--text-primary)' }}>{item.option_text || item.text}</span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => idx > 0 && moveRankItem(idx, idx - 1)} disabled={(isCompleted && !editMode) || idx === 0}
                    className="p-0.5 rounded hover:bg-stone-100 disabled:opacity-30"><ChevronLeft size={14} className="rotate-90" /></button>
                  <button onClick={() => idx < rankedItems.length - 1 && moveRankItem(idx, idx + 1)} disabled={(isCompleted && !editMode) || idx === rankedItems.length - 1}
                    className="p-0.5 rounded hover:bg-stone-100 disabled:opacity-30"><ChevronRight size={14} className="rotate-90" /></button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full p-3 rounded-lg border-2"
            style={{ borderColor: 'var(--border-light)' }}
            disabled={isCompleted && !editMode}
          />
        );

      case 'file_upload':
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: 'var(--border-light)' }}>
              <p className="text-stone-400 text-[13px] mb-2">📎 Click or drag to upload</p>
              <p className="text-stone-300 text-[11px]">Max {(question as any).question_config?.max_size_mb || 10}MB • {(question as any).question_config?.accepted_types || 'All files'}</p>
              <input
                type="file"
                accept={(question as any).question_config?.accepted_types || '*'}
                multiple={((question as any).question_config?.max_files || 1) > 1}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) handleResponseChange(question.id, Array.from(files).map(f => f.name).join(', '));
                }}
                className="mt-3"
                disabled={isCompleted && !editMode}
              />
            </div>
            {value && <p className="text-[12px] text-stone-500">Uploaded: {value}</p>}
          </div>
        );

      case 'image_choice':
        const imgOptions = question.options || [];
        const imgAllowMultiple = (question as any).question_config?.allow_multiple || false;
        const imgValue = imgAllowMultiple ? (Array.isArray(value) ? value : []) : value;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imgOptions.map((opt: any) => {
              const isSelected = imgAllowMultiple ? imgValue.includes(opt.id) : imgValue === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (imgAllowMultiple) {
                      const arr = Array.isArray(imgValue) ? imgValue : [];
                      handleResponseChange(question.id, isSelected ? arr.filter((v: string) => v !== opt.id) : [...arr, opt.id]);
                    } else {
                      handleResponseChange(question.id, opt.id);
                    }
                  }}
                  disabled={isCompleted && !editMode}
                  className="p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: isSelected ? 'var(--color-green)' : 'var(--border-light)',
                    backgroundColor: isSelected ? '#f0fdf4' : 'white',
                  }}
                >
                  {opt.option_value && opt.option_value.startsWith('http') ? (
                    <img src={opt.option_value} alt={opt.option_text} className="w-full h-20 object-cover rounded-lg mb-2" />
                  ) : (
                    <div className="text-3xl mb-2">{opt.option_text}</div>
                  )}
                  <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>
                    {opt.option_value && opt.option_value.startsWith('http') ? opt.option_text : ''}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'instruction':
        const contentType = (question as any).question_config?.content_type || 'text';
        const bgColors: Record<string, string> = { text: '#f9fafb', info: '#eff6ff', warning: '#fffbeb', tip: '#f0fdf4' };
        const borderColors: Record<string, string> = { text: '#e5e7eb', info: '#bfdbfe', warning: '#fcd34d', tip: '#86efac' };
        const icons: Record<string, string> = { text: '📋', info: 'ℹ️', warning: '⚠️', tip: '💡' };
        return (
          <div className="rounded-xl p-4 border" style={{ backgroundColor: bgColors[contentType], borderColor: borderColors[contentType] }}>
            <div className="flex items-start gap-2">
              <span className="text-lg">{icons[contentType]}</span>
              <div>
                <p className="font-medium text-[14px] mb-1" style={{ color: 'var(--text-primary)' }}>{question.question_text}</p>
                {question.question_description && <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{question.question_description}</p>}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-yellow-50 rounded-lg" style={{ border: '1px solid var(--border-light)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Unsupported question type: {question.question_type}</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-green)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Survey Not Found
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            This survey may have ended or been removed.
          </p>
        </div>
      </div>
    );
  }

  // Show onboarding for longitudinal studies
  if (showOnboarding && project) {
    return (
      <>
        <ParticipantOnboarding projectId={projectId!} onComplete={handleOnboardingComplete} />
      </>
    );
  }

  if (showConsent && project.consent_required) {
    return (
      <>
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border-light)' }}>
            <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {project.consent_form_title || 'Research Consent Form'}
            </h1>
            <div className="prose max-w-none mb-8" style={{ color: 'var(--text-secondary)' }}>
              <p className="whitespace-pre-wrap">
                {project.consent_form_text || 'Please read and accept the consent form to continue.'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleConsentAccept}
                className="px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                I Agree & Continue
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-lg border font-semibold transition-colors"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // If no questions loaded, show error
  if (visibleQuestions.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--text-secondary)' }}>No questions found for this survey.</p>
      </div>
    );
  }

  const renderTabs = () => (
    <div className="flex gap-4 mb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
      <button
        onClick={() => setActiveTab('survey')}
        className="px-6 py-3 font-semibold transition-all"
        style={{
          color: activeTab === 'survey' ? 'var(--color-green)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'survey' ? '2px solid var(--color-green)' : '2px solid transparent'
        }}
      >
        Survey
      </button>
      <button
        onClick={() => setActiveTab('summary')}
        className="px-6 py-3 font-semibold transition-all"
        style={{
          color: activeTab === 'summary' ? 'var(--color-green)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'summary' ? '2px solid var(--color-green)' : '2px solid transparent'
        }}
      >
        Summary
      </button>
      <button
        onClick={() => setActiveTab('settings')}
        className="px-6 py-3 font-semibold transition-all"
        style={{
          color: activeTab === 'settings' ? 'var(--color-green)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'settings' ? '2px solid var(--color-green)' : '2px solid transparent'
        }}
      >
        Settings
      </button>
    </div>
  );

  const renderSummaryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Survey Completed
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>Thank you for completing this survey!</p>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Survey Settings
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>Settings for this survey</p>
      </div>
    </div>
  );

  // If opened in modal (has instanceId), skip tabs and show only survey
  const isModal = !!propInstanceId;

  return (
    <>
    <div className={isModal ? "" : "min-h-screen pb-24"} style={{ backgroundColor: isModal ? 'transparent' : 'var(--bg-primary)' }}>
      <div className={isModal ? "" : "max-w-3xl mx-auto px-4 py-8"}>
        {!isModal && (
          <>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {project.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        </div>

        {/* Tabs */}
        {renderTabs()}
          </>
        )}

        {/* Edit/Delete buttons for completed surveys in modal */}
        {isModal && isCompleted && (
          <div className="flex justify-end gap-2 mb-4">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                  style={{ backgroundColor: 'white', color: 'var(--color-green)', border: '1px solid var(--color-green)' }}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this survey response? This cannot be undone.')) {
                      try {
                        await supabase.from('survey_respons').delete().eq('instance_id', propInstanceId);
                        await supabase.from('survey_instance').update({ status: 'scheduled' }).eq('id', propInstanceId);
                        window.location.reload();
                      } catch (error) {
                        console.error('Error deleting:', error);
                        toast.error('Failed to delete survey response');
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                  style={{ backgroundColor: 'white', color: '#ef4444', border: '1px solid #ef4444' }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditMode(false);
                  loadExistingResponses();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>
        )}

        {/* Survey Content */}
        {(isModal || activeTab === 'survey') && (
          <>
        {project?.show_progress_bar !== false && orderedVisibleQuestions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-green)' }}
              />
            </div>
          </div>
        )}

        {/* Questions rendering based on questionsPerPage */}
        {(() => {
          const isUnlimited = questionsPerPage === null;
          const perPage = questionsPerPage || orderedVisibleQuestions.length;
          const totalPages = Math.ceil(orderedVisibleQuestions.length / perPage);
          const currentPage = Math.floor(currentQuestionIndex / perPage);
          const pageStart = currentPage * perPage;
          const pageQuestions = isUnlimited
            ? orderedVisibleQuestions
            : orderedVisibleQuestions.slice(pageStart, pageStart + perPage);
          const isLastPage = isUnlimited || currentPage >= totalPages - 1;

          return (
            <>
              <div className="space-y-6 mb-8">
                {pageQuestions.map((q, idx) => {
                  const globalIdx = isUnlimited ? idx : pageStart + idx;
                  return (
                    <div key={q.id} id={`question-${q.id}`} className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border-light)' }}>
                      <div className="mb-6">
                        <div className="flex items-start justify-between mb-2">
                          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>{globalIdx + 1}. </span>
                            {q.question_text}
                            {q.required && <span className="text-red-500 ml-1">*</span>}
                          </h2>
                        </div>
                        {q.question_description && (
                          <p style={{ color: 'var(--text-secondary)' }}>{q.question_description}</p>
                        )}
                      </div>
                      {renderQuestion(q, responses[q.id])}
                      {fieldErrors[q.id]?.length > 0 && (
                        <div className="mt-4 text-sm text-red-600">
                          {fieldErrors[q.id].map((err, eIdx) => <div key={eIdx}>{err}</div>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigation — only show when paginated */}
              {!isUnlimited && totalPages > 1 && (
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={() => {
                      if (project?.disable_backtracking) return;
                      setCurrentQuestionIndex(Math.max(0, pageStart - perPage));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 0 || project?.disable_backtracking}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border disabled:opacity-50"
                    style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  {!isLastPage && (
                    <button
                      onClick={() => {
                        setCurrentQuestionIndex(pageStart + perPage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white"
                      style={{ backgroundColor: 'var(--color-green)' }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              )}

              {/* Submit Button — show on last page */}
              {(!isCompleted || editMode) && isLastPage && (
                <div className="flex justify-center mb-8">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-green)' }}
                  >
                    {submitting ? (isCompleted ? 'Saving...' : 'Submitting...') : (isCompleted ? 'Save' : 'Submit Survey')}
                    <Check size={20} />
                  </button>
                </div>
              )}
            </>
          );
        })()}
          </>
        )}
        
        {!isModal && activeTab === 'summary' && renderSummaryTab()}
        {!isModal && activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
    </>
  );
};

export default ParticipantSurveyView;
