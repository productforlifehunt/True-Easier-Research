import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Zap, Mic, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import EasyResearchBottomNav from './EasyResearchBottomNav';

interface SurveyProject {
  id: string;
  title: string;
  description: string;
  consent_form: any;
  settings: any;
  project_type?: string;
  study_duration?: number;
  survey_frequency?: string;
}

interface SurveyQuestion {
  id: string;
  question_type: string;
  question_text: string;
  question_description?: string;
  required: boolean;
  allow_voice: boolean;
  allow_ai_assist: boolean;
  options?: any[];
  order_index: number;
}

interface SurveyResponse {
  [questionId: string]: any;
}

const OneTimeSurveyView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [project, setProject] = useState<SurveyProject | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [showConsent, setShowConsent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'survey'>('survey');
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadSurvey();
    }
  }, [projectId]);

  const loadSurvey = async () => {
    try {
      const { data: project } = await supabase
        .from('research_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (project) {
        setProject(project);

        const { data: questions } = await supabase
          .from('survey_questions')
          .select('*, options:question_options(*)')
          .eq('project_id', projectId)
          .order('order_index');

        if (questions) {
          setQuestions(questions);
        }

        const existingEnrollmentId = localStorage.getItem(`enrollment_${projectId}`);
        const skipConsent = searchParams.get('skip_consent') === 'true';
        
        if (existingEnrollmentId && skipConsent) {
          setShowConsent(false);
          setEnrollmentId(existingEnrollmentId);
        } else if (!project.consent_form?.required) {
          setShowConsent(false);
        }
      }
    } catch (error) {
      console.error('Error loading survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentAccept = async () => {
    setShowConsent(false);
  };

  const handleVoiceInput = async (questionId: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome or Safari.');
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
      alert('Voice input failed. Please try again.');
    };

    recognition.onend = () => {
      setIsRecording(null);
    };

    recognition.start();
  };

  const handleAIEnhancement = async (questionId: string) => {
    const currentText = responses[questionId];
    if (!currentText || typeof currentText !== 'string' || currentText.trim().length === 0) {
      alert('Please enter some text first before using AI enhancement.');
      return;
    }

    setIsEnhancing(questionId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to use AI features');
      }

      const response = await fetch('https://yekarqanirdkdckimpna.supabase.co/functions/v1/process-voice-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'enhance_text',
          text: currentText,
          language: 'en',
          user_id: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('AI enhancement failed');
      }

      const data = await response.json();
      if (data.success && data.enhanced_text) {
        handleResponseChange(questionId, data.enhanced_text);
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
      alert('AI enhancement failed. Please try again.');
    } finally {
      setIsEnhancing(null);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let currentEnrollmentId = enrollmentId || localStorage.getItem(`enrollment_${projectId}`);
      
      if (!currentEnrollmentId && user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .insert({
            project_id: projectId,
            participant_id: user.id,
            status: 'enrolled'
          })
          .select()
          .single();
        
        if (enrollment) {
          currentEnrollmentId = enrollment.id;
          localStorage.setItem(`enrollment_${projectId}`, enrollment.id);
        }
      }

      const responseInserts = [];
      for (const [questionId, response] of Object.entries(responses)) {
        responseInserts.push({
          project_id: projectId,
          enrollment_id: currentEnrollmentId,
          question_id: questionId,
          response_type: 'text',
          response_text: typeof response === 'string' ? response : JSON.stringify(response),
          response_value: typeof response === 'object' ? JSON.stringify(response) : response
        });
      }
      
      if (responseInserts.length > 0) {
        await supabase
          .from('survey_responses')
          .insert(responseInserts);
      }
      
      navigate(`/easyresearch/survey/${projectId}/complete`);
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const value = responses[question.id];

    switch (question.question_type) {
      case 'single_choice':
        const singleChoiceOptions = question.options || [];
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
                />
                <span style={{ color: 'var(--text-primary)' }}>{option.text || option.option_text}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice':
        const multipleChoiceOptions = question.options || [];
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
                  />
                  <span style={{ color: 'var(--text-primary)' }}>{option.text || option.option_text}</span>
                </label>
              );
            })}
          </div>
        );

      case 'likert_scale':
        const config = question.options || (question as any).question_config;
        const labels = config?.labels || {};
        const scaleType = config?.scale_type || '1-5';
        const [min, max] = scaleType.split('-').map(Number);
        const scaleOptions = [];
        for (let i = min; i <= max; i++) {
          scaleOptions.push(i);
        }
        
        return (
          <div className="space-y-4">
            <div className="flex justify-between gap-2">
              {scaleOptions.map((optionValue) => (
                <div
                  key={optionValue}
                  onClick={() => handleResponseChange(question.id, optionValue)}
                  className="flex-1 text-center cursor-pointer transition-all"
                >
                  <div
                    className="w-full aspect-square flex items-center justify-center rounded-lg border-2 font-semibold text-lg mb-2 hover:scale-105"
                    style={{
                      borderColor: value === optionValue ? 'var(--color-green)' : 'var(--border-light)',
                      backgroundColor: value === optionValue ? 'var(--color-green)' : 'white',
                      color: value === optionValue ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    {optionValue}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {labels[optionValue] || ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'short_text':
      case 'text_short':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2"
              style={{ borderColor: 'var(--border-light)' }}
              placeholder="Type your answer here..."
            />
            {(question.allow_voice || question.allow_ai_assist) && (
              <div className="flex gap-2">
                {question.allow_voice && (
                  <button
                    onClick={() => handleVoiceInput(question.id)}
                    disabled={isRecording === question.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-green-50 disabled:opacity-50"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    <Mic size={16} style={{ color: 'var(--color-green)' }} />
                    {isRecording === question.id ? 'Recording...' : 'Voice Input'}
                  </button>
                )}
                {question.allow_ai_assist && value && (
                  <button
                    onClick={() => handleAIEnhancement(question.id)}
                    disabled={isEnhancing === question.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-green-50 disabled:opacity-50"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    <Zap size={16} style={{ color: 'var(--color-green)' }} />
                    {isEnhancing === question.id ? 'Enhancing...' : 'AI Enhance'}
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'long_text':
      case 'text_long':
        return (
          <div className="space-y-2">
            <textarea
              value={value || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 resize-none"
              style={{ borderColor: 'var(--border-light)' }}
              rows={6}
              placeholder="Type your answer here..."
            />
            <div className="flex gap-2">
              {question.allow_voice && (
                <button
                  onClick={() => handleVoiceInput(question.id)}
                  disabled={isRecording === question.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-green-50 disabled:opacity-50"
                  style={{ borderColor: 'var(--border-light)' }}
                >
                  <Mic size={16} style={{ color: 'var(--color-green)' }} />
                  {isRecording === question.id ? 'Recording...' : 'Voice Input'}
                </button>
              )}
              {question.allow_ai_assist && value && (
                <button
                  onClick={() => handleAIEnhancement(question.id)}
                  disabled={isEnhancing === question.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-green-50 disabled:opacity-50"
                  style={{ borderColor: 'var(--border-light)' }}
                >
                  <Zap size={16} style={{ color: 'var(--color-green)' }} />
                  {isEnhancing === question.id ? 'Enhancing...' : 'AI Enhance'}
                </button>
              )}
            </div>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2"
            style={{ borderColor: 'var(--border-light)' }}
            placeholder="Enter a number..."
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2"
            style={{ borderColor: 'var(--border-light)' }}
          />
        );

      default:
        return <div>Question type not supported</div>;
    }
  };

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Survey Information
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duration</p>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {project?.study_duration || 7} days
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Frequency</p>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {project?.survey_frequency || 'One-time'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
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

  if (showConsent && project.consent_form?.required) {
    return (
      <>
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border-light)' }}>
            <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {project.consent_form.title || 'Research Consent Form'}
            </h1>
            <div className="prose max-w-none mb-8" style={{ color: 'var(--text-secondary)' }}>
              <p className="whitespace-pre-wrap">
                {project.consent_form.text || 'Please read and accept the consent form to continue.'}
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
                className="px-6 py-3 rounded-lg border font-semibold hover:bg-gray-50"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
      <EasyResearchBottomNav />
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <>
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {project.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        </div>


        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--text-secondary)' }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: 'var(--color-green)' }}
            />
          </div>
        </div>

        {currentQuestion && (
          <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: '1px solid var(--border-light)' }}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {currentQuestion.question_text}
                {currentQuestion.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h2>
              {currentQuestion.question_description && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  {currentQuestion.question_description}
                </p>
              )}
            </div>

            {renderQuestion(currentQuestion)}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border font-semibold hover:bg-gray-50 disabled:opacity-50"
            style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              {submitting ? 'Submitting...' : 'Submit Survey'}
              <Check size={20} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
    <EasyResearchBottomNav />
    </>
  );
};

export default OneTimeSurveyView;
