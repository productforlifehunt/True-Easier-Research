import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Zap, Mic, ChevronRight, ChevronLeft, Check, Clock, Sparkles, X, Edit2, Trash2 } from 'lucide-react';
import ParticipantOnboarding from './ParticipantOnboarding';
import EasyResearchBottomNav from './EasyResearchBottomNav';

interface SurveyProject {
  id: string;
  title: string;
  description: string;
  consent_form: any;
  settings: any;
  project_type?: string;
  onboarding_required?: boolean;
  onboarding_instructions?: string;
  participant_numbering?: boolean;
  allow_participant_dnd?: boolean;
  study_duration?: number;
  survey_frequency?: string;
  show_progress_bar?: boolean;
  disable_backtracking?: boolean;
  auto_advance?: boolean;
}

interface SurveyQuestion {
  id: string;
  question_type: string;
  question_text: string;
  question_description?: string;
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
  const [showConsent, setShowConsent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(propEnrollmentId || null);
  const [activeTab, setActiveTab] = useState<'survey' | 'summary' | 'settings'>('survey');
  const [isCompleted, setIsCompleted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [activeChatQuestion, setActiveChatQuestion] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{[questionId: string]: Array<{role: 'user' | 'assistant', content: string}>}>({});
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isChatRecording, setIsChatRecording] = useState(false);

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
      console.log('Loading existing responses for instance:', propInstanceId);
      loadExistingResponses();
    }
  }, [propInstanceId, projectId]);

  const loadExistingResponses = async () => {
    if (!propInstanceId || !projectId) {
      console.log('loadExistingResponses: Missing instanceId or projectId', { propInstanceId, projectId });
      return;
    }
    
    console.log('loadExistingResponses: Starting to load for instance', propInstanceId);
    
    try {
      // Check if instance is completed
      const { data: instance } = await supabase
        .from('survey_instances')
        .select('status')
        .eq('id', propInstanceId)
        .single();
      
      if (instance?.status === 'completed') {
        setIsCompleted(true);
      }
      
      // Load existing responses for this specific instance
      const { data: existingResponses, error } = await supabase
        .from('survey_responses')
        .select('question_id, response_text, response_value')
        .eq('instance_id', propInstanceId);
      
      console.log('loadExistingResponses: Query result', { existingResponses, error, count: existingResponses?.length });
      
      if (existingResponses && existingResponses.length > 0) {
        // Pre-fill responses state with existing data
        const loadedResponses: SurveyResponse = {};
        existingResponses.forEach(r => {
          // Use response_value for arrays (multiple choice) and numbers (sliders)
          // Use response_text for text fields
          if (r.response_value !== null && r.response_value !== undefined) {
            loadedResponses[r.question_id] = r.response_value;
          } else {
            loadedResponses[r.question_id] = r.response_text || '';
          }
        });
        console.log('loadExistingResponses: Setting responses state', loadedResponses);
        setResponses(loadedResponses);
      } else {
        console.log('loadExistingResponses: No responses found to load');
      }
    } catch (error) {
      console.error('Error loading existing responses:', error);
    }
  };

  const loadSurvey = async () => {
    try {
      // Load project details
      const { data: project } = await supabase
        .from('research_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (project) {
        setProject(project);

        // Load questions
        const { data: questions, error: questionsError } = await supabase
          .from('survey_questions')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index');
        
        if (questionsError) {
          console.error('Error loading questions:', questionsError);
        }

        if (questions) {
          setQuestions(questions);
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
            .from('enrollments')
            .select('*')
            .eq('id', existingEnrollmentId)
            .single();

          if (enrollment) {
            setEnrollmentId(enrollment.id);
            setShowConsent(false);
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
            } else if (project.consent_form && Object.keys(project.consent_form).length > 0) {
              // Show consent if it exists
              setShowConsent(true);
            } else if (project.project_type === 'longitudinal' && !existingEnrollmentId) {
              setShowOnboarding(true);
              setShowConsent(false);
            }
          }
        } else {
          // New participant - check if onboarding is required
          if (project.project_type === 'longitudinal' && project.onboarding_required) {
            setShowOnboarding(true);
            setShowConsent(false);
          } else if (project.consent_form && Object.keys(project.consent_form).length > 0) {
            // Show consent if it exists
            setShowConsent(true);
          } else if (project.project_type === 'longitudinal' && !existingEnrollmentId) {
            setShowOnboarding(true);
            setShowConsent(false);
          } else if (!project.consent_form?.required) {
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
    console.log('handleResponseChange called - questionId:', questionId, 'value:', value);
    setResponses(prev => {
      const updated = {
        ...prev,
        [questionId]: value
      };
      console.log('Updated responses state:', updated);
      return updated;
    });
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

  const toggleAIChat = (questionId: string) => {
    if (activeChatQuestion === questionId) {
      setActiveChatQuestion(null);
    } else {
      setActiveChatQuestion(questionId);
      // Initialize chat with greeting if first time
      if (!chatMessages[questionId] || chatMessages[questionId].length === 0) {
        const question = questions.find(q => q.id === questionId);
        const greeting = {
          role: 'assistant' as const,
          content: `Hello! I can help you with explaining the question "${question?.question_text}" and perfecting or elaborating your answer. What would you like help with?`
        };
        setChatMessages(prev => ({
          ...prev,
          [questionId]: [greeting]
        }));
      }
    }
  };

  const handleChatVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsChatRecording(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentValue = chatInput || '';
      const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;
      setChatInput(newValue);
      setIsChatRecording(false);
    };

    recognition.onerror = () => {
      setIsChatRecording(false);
      alert('Voice input failed. Please try again.');
    };

    recognition.onend = () => {
      setIsChatRecording(false);
    };

    recognition.start();
  };

  const handleQuickAction = async (questionId: string, action: string) => {
    const currentAnswer = responses[questionId];
    if (!currentAnswer || typeof currentAnswer !== 'string' || !currentAnswer.trim()) {
      alert('Please enter an answer first before using AI enhancement.');
      return;
    }

    let prompt = '';
    if (action === 'correct') {
      prompt = `Please correct any typos and grammar issues in my answer: "${currentAnswer}". Return ONLY the corrected text, nothing else.`;
    } else if (action === 'improve') {
      prompt = `Please improve and elaborate my answer: "${currentAnswer}". Make it more detailed and thoughtful. Return ONLY the improved answer, nothing else.`;
    }

    // Add user message to chat
    const displayMessage = action === 'correct' ? 'Correct my answer' : 'Improve my answer';
    setChatMessages(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), { role: 'user', content: displayMessage }]
    }));

    setIsSendingMessage(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to use AI features');
      }

      const question = questions.find(q => q.id === questionId);

      const response = await fetch('https://yekarqanirdkdckimpna.supabase.co/functions/v1/ai-survey-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          question_text: question?.question_text,
          user_message: prompt,
          current_answer: currentAnswer,
          conversation_history: chatMessages[questionId] || [],
          user_id: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('AI support failed');
      }

      const data = await response.json();
      if (data.success && data.ai_response) {
        setChatMessages(prev => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), { role: 'assistant', content: data.ai_response }]
        }));
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setChatMessages(prev => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]
      }));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendChatMessage = async (questionId: string) => {
    if (!chatInput.trim() || isSendingMessage) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsSendingMessage(true);

    // Add user message to chat
    setChatMessages(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), { role: 'user', content: userMessage }]
    }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to use AI features');
      }

      const question = questions.find(q => q.id === questionId);
      const currentAnswer = responses[questionId] || '';

      const response = await fetch('https://yekarqanirdkdckimpna.supabase.co/functions/v1/ai-survey-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          question_text: question?.question_text,
          user_message: userMessage,
          current_answer: currentAnswer,
          conversation_history: chatMessages[questionId] || [],
          user_id: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('AI support failed');
      }

      const data = await response.json();
      if (data.success && data.ai_response) {
        setChatMessages(prev => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), { role: 'assistant', content: data.ai_response }]
        }));
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setChatMessages(prev => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]
      }));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          alert('✓ Copied to clipboard! You can now paste it into your answer.');
          return;
        } catch (clipboardError) {
          // If clipboard API fails (e.g., document not focused), fall through to execCommand
          console.log('Clipboard API failed, trying fallback method');
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
          alert('✓ Copied to clipboard! You can now paste it into your answer.');
        } else {
          alert('❌ Copy failed. Please manually select and copy the text.');
        }
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      alert('❌ Failed to copy. Please manually select and copy the text.');
    }
  };

  const handleSubmit = async () => {
    // Guard against multiple submissions
    if (submitting) {
      console.log('Already submitting, ignoring duplicate call');
      return;
    }
    
    setSubmitting(true);
    console.log('=== STARTING SURVEY SUBMISSION ===');
    console.log('Submitting responses:', responses);
    console.log('Number of responses:', Object.keys(responses).length);
    console.log('Response values:', JSON.stringify(responses, null, 2));
    console.log('Project ID:', projectId);
    console.log('Instance ID:', propInstanceId);
    console.log('Enrollment ID:', enrollmentId);
    
    try {
      // Get enrollment ID from localStorage or state
      let currentEnrollmentId = enrollmentId || localStorage.getItem(`enrollment_${projectId}`);
      console.log('Current enrollment ID:', currentEnrollmentId);
      
      if (!currentEnrollmentId) {
        console.log('No enrollment ID found, creating new enrollment');
        // Create enrollment if it doesn't exist
        const { data: newEnrollment, error: enrollError } = await supabase
          .from('enrollments')
          .insert({
            project_id: projectId,
            participant_email: 'anonymous@participant.com',
            status: 'active'
          })
          .select()
          .single();
        
        if (enrollError) {
          console.error('Error creating enrollment:', enrollError);
          alert('Error enrolling in study. Please try again.');
          setSubmitting(false);
          return;
        }
        
        currentEnrollmentId = newEnrollment.id;
        localStorage.setItem(`enrollment_${projectId}`, currentEnrollmentId);
        console.log('Created new enrollment:', currentEnrollmentId);
      } else {
        console.log('Using existing enrollment:', currentEnrollmentId);
      }

      // Save responses with instance_id for proper linking
      if (propInstanceId) {
        // Delete existing responses for this specific instance
        console.log('Deleting existing responses for instance:', propInstanceId);
        const { error: deleteError } = await supabase
          .from('survey_responses')
          .delete()
          .eq('instance_id', propInstanceId);
        
        if (deleteError) {
          console.error('Error deleting existing responses:', deleteError);
        } else {
          console.log('Existing responses deleted successfully');
        }
      } else {
        console.warn('No instance ID provided, responses will not be linked to instance');
      }
      
      // Insert new/updated responses with instance_id
      const responseInserts = [];
      for (const [questionId, response] of Object.entries(responses)) {
        // Find the question to get its options
        const question = questions.find(q => q.id === questionId);
        let responseText = '';
        
        if (question && question.options) {
          // Convert response values to readable text
          if (Array.isArray(response)) {
            // Multiple choice
            const labels = response.map(val => {
              const opt = question.options?.find(o => o.id === val || o.value === val);
              return opt?.text || opt?.option_text || opt?.label || val;
            });
            responseText = labels.join(', ');
          } else {
            // Single choice
            const opt = question.options?.find(o => o.id === response || o.value === response);
            responseText = opt?.text || opt?.option_text || opt?.label || String(response);
          }
        } else {
          // Text or other types
          responseText = String(response);
        }
        
        // Ensure response_value is in proper array format
        let responseValue = response;
        if (!Array.isArray(response)) {
          if (typeof response === 'string') {
            // Check if it's a comma-separated string (e.g., "1,2,3")
            if (response.includes(',')) {
              responseValue = response.split(',').map(v => v.trim());
            } else {
              responseValue = [response];
            }
          } else {
            responseValue = [String(response)];
          }
        }
        
        responseInserts.push({
          project_id: projectId,
          enrollment_id: currentEnrollmentId,
          instance_id: propInstanceId || null,
          question_id: questionId,
          response_type: question?.question_type || 'text',
          response_text: responseText,
          response_value: responseValue
        });
      }
      
      console.log('=== INSERTING RESPONSES ===');
      console.log('Total responses to insert:', responseInserts.length);
      console.log('Response inserts:', JSON.stringify(responseInserts, null, 2));

      const { data: insertedData, error: responseError } = await supabase
        .from('survey_responses')
        .insert(responseInserts)
        .select();
      
      console.log('Insert result - data:', insertedData);
      console.log('Insert result - error:', responseError);

      if (responseError) {
        console.error('Error saving responses:', responseError);
        alert(`Error saving responses: ${responseError.message}`);
        setSubmitting(false);
        return;
      }
      
      console.log('=== RESPONSES SAVED SUCCESSFULLY ===');
      console.log('Inserted count:', insertedData?.length);
      
      // Update instance status if provided
      if (propInstanceId) {
        console.log('=== UPDATING INSTANCE STATUS ===');
        console.log('Instance ID:', propInstanceId);
        
        const { data: instance } = await supabase
          .from('survey_instances')
          .select('status, actual_start_time')
          .eq('id', propInstanceId)
          .single();
        
        console.log('Current instance data:', instance);
        
        // Update status and timestamps
        const { data: updateData, error: updateError } = await supabase
          .from('survey_instances')
          .update({ 
            status: 'completed',
            actual_start_time: instance?.actual_start_time || new Date().toISOString(),
            actual_end_time: new Date().toISOString()
          })
          .eq('id', propInstanceId)
          .select();
        
        console.log('Update result - data:', updateData);
        console.log('Update result - error:', updateError);
        
        if (updateError) {
          console.error('Error updating instance status:', updateError);
        } else {
          console.log('=== INSTANCE STATUS UPDATED TO COMPLETED ===');
        }
      } else {
        console.warn('No instance ID, skipping status update');
      }
      
      // For longitudinal studies, go back to timeline; otherwise thank you page
      console.log('=== REDIRECTING AFTER SUBMISSION ===');
      console.log('Project type:', project?.project_type);
      console.log('Redirect URL:', `/easyresearch/participant/${currentEnrollmentId}/timeline`);
      
      if (project?.project_type === 'longitudinal') {
        window.location.href = `/easyresearch/participant/${currentEnrollmentId}/timeline`;
      } else {
        navigate(`/easyresearch/survey/${projectId}/complete`);
      }
    } catch (error) {
      console.error('=== ERROR SUBMITTING SURVEY ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      alert('Error submitting survey. Please try again.');
    } finally {
      console.log('=== SUBMISSION COMPLETE ===');
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const value = responses[question.id];

    switch (question.question_type) {
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
      case 'scale':
        const sliderMin = (question as any).min_value || 0;
        const sliderMax = (question as any).max_value || 10;
        const sliderStep = (question as any).step || 1;
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

      case 'short_text':
      case 'text':
      case 'long_text':
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
            {(question.allow_voice || question.allow_ai_assist) && !isCompleted && (
              <div className="space-y-2">
                {/* Action buttons row */}
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
                  {question.allow_ai_assist && (
                    <button
                      onClick={() => toggleAIChat(question.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-green-50 transition-all"
                      style={{ 
                        borderColor: activeChatQuestion === question.id ? 'var(--color-green)' : 'var(--border-light)',
                        backgroundColor: activeChatQuestion === question.id ? '#f0fdf4' : 'white'
                      }}
                    >
                      <Sparkles size={16} style={{ color: 'var(--color-green)' }} />
                      AI Support & Enhance
                    </button>
                  )}
                </div>
                
                {/* Chat window below buttons */}
                {question.allow_ai_assist && activeChatQuestion === question.id && (
                      <div className="mt-2 border-2 rounded-lg p-4 bg-white shadow-lg" style={{ borderColor: 'var(--color-green)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Sparkles size={18} style={{ color: 'var(--color-green)' }} />
                            AI Assistant
                          </h4>
                          <button
                            onClick={() => setActiveChatQuestion(null)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X size={18} style={{ color: 'var(--text-secondary)' }} />
                          </button>
                        </div>
                        
                        {/* Chat messages */}
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                          {(chatMessages[question.id] || []).map((msg, idx) => (
                            <React.Fragment key={idx}>
                              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div 
                                  className={`rounded-lg px-4 py-2 max-w-[85%] ${msg.role === 'user' ? 'bg-green-100' : 'bg-gray-100'}`}
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  {msg.role === 'assistant' && msg.content.length > 50 && idx > 0 && (
                                    <div className="mt-2 space-y-2">
                                      <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
                                        💡 You can copy this improved answer and paste it into the answer field above
                                      </p>
                                      <button
                                        onClick={() => copyToClipboard(msg.content)}
                                        className="text-xs px-3 py-1 rounded border hover:bg-white transition-all flex items-center gap-1"
                                        style={{ borderColor: 'var(--border-light)', color: 'var(--color-green)' }}
                                      >
                                        <Edit2 size={12} />
                                        Copy to Answer Field
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Quick actions after first greeting message */}
                              {idx === 0 && msg.role === 'assistant' && chatMessages[question.id].length === 1 && responses[question.id] && typeof responses[question.id] === 'string' && responses[question.id].trim() && (
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleQuickAction(question.id, 'correct')}
                                    disabled={isSendingMessage}
                                    className="px-3 py-2 text-sm rounded-lg border hover:bg-green-50 transition-all disabled:opacity-50"
                                    style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                                  >
                                    ✓ Correct typo
                                  </button>
                                  <button
                                    onClick={() => handleQuickAction(question.id, 'improve')}
                                    disabled={isSendingMessage}
                                    className="px-3 py-2 text-sm rounded-lg border hover:bg-green-50 transition-all disabled:opacity-50"
                                    style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                                  >
                                    ✨ Improve my answer
                                  </button>
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        
                        {/* Chat input */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleChatVoiceInput}
                            disabled={isChatRecording || isSendingMessage}
                            className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
                            style={{ borderColor: 'var(--border-light)' }}
                            title="Voice input"
                          >
                            <Mic size={20} style={{ color: isChatRecording ? 'var(--color-green)' : 'var(--text-secondary)' }} />
                          </button>
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage(question.id)}
                            placeholder="Ask me anything about this question..."
                            className="flex-1 px-3 py-2 rounded-lg border"
                            style={{ borderColor: 'var(--border-light)' }}
                            disabled={isSendingMessage}
                          />
                          <button
                            onClick={() => handleSendChatMessage(question.id)}
                            disabled={!chatInput.trim() || isSendingMessage}
                            className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 hover:opacity-90 transition-all"
                            style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
                          >
                            {isSendingMessage ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                  </div>
                )}
              </div>
            )}
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
        <EasyResearchBottomNav />
      </>
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

  // If no questions loaded, show error
  if (questions.length === 0 && !loading) {
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
                        await supabase.from('survey_responses').delete().eq('instance_id', propInstanceId);
                        await supabase.from('survey_instances').update({ status: 'scheduled' }).eq('id', propInstanceId);
                        window.location.reload();
                      } catch (error) {
                        console.error('Error deleting:', error);
                        alert('Failed to delete survey response');
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
        {/* All Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border-light)' }}>
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>{index + 1}. </span>
                    {question.question_text}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h2>
                </div>
                {question.question_description && (
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {question.question_description}
                  </p>
                )}
              </div>

              {renderQuestion(question)}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {(!isCompleted || editMode) && (
          <div className="flex justify-center">
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
        )}
        
        {!isModal && activeTab === 'summary' && renderSummaryTab()}
        {!isModal && activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
    {!isModal && <EasyResearchBottomNav />}
    </>
  );
};

export default ParticipantSurveyView;
