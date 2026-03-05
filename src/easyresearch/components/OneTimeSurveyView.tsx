import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';
import { useAuth } from '../../hooks/useAuth';
import { Mic, ChevronRight, ChevronLeft, Check, X, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { hydrateQuestionRows } from '../utils/questionConfigSync';
import { type LogicRule, dbRowToLogicRule, getVisibleQuestions as getVisibleQs, findSkipTarget, checkTerminalActions, checkRequiredBeforeNext, checkValidation, getPipedText, getCalculatedValues, checkQuotaReached, expandLoopQuestions } from '../utils/logicEngine';
import { filterQuestionsByParticipantType } from '../utils/participantTypeFilter';

interface SurveyProject {
  id: string;
  organization_id?: string;
  title: string;
  description: string;
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'survey'>('survey');
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [logicRules, setLogicRules] = useState<LogicRule[]>([]);
  const [isDisqualified, setIsDisqualified] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadSurvey();
    }
  }, [projectId]);

  const loadSurvey = async () => {
    try {
      const { data: project } = await supabase
        .from('research_project')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (project) {
        setProject(project as any);

        // Load logic rules from research_logic table
        const { data: logicRows } = await supabase
          .from('research_logic')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index');
        if (logicRows) {
          setLogicRules(logicRows.map(dbRowToLogicRule));
        }

        const { data: questions } = await supabase
          .from('question')
          .select('*, options:question_option(*)')
          .eq('project_id', projectId)
          .order('order_index');

        if (questions) {
          setQuestions(hydrateQuestionRows(questions));
        }

        const existingEnrollmentId = localStorage.getItem(`enrollment_${projectId}`);

        if (existingEnrollmentId) {
          const { data: enrollment } = await supabase
            .from('enrollment')
            .select('id')
            .eq('id', existingEnrollmentId)
            .maybeSingle();

          if (enrollment) {
            setEnrollmentId(enrollment.id);
          } else {
            localStorage.removeItem(`enrollment_${projectId}`);
            setEnrollmentId(null);
          }
        }
      }
    } catch (error) {
      console.error('Error loading survey:', error);
    } finally {
      setLoading(false);
    }
  };


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


  const handleResponseChange = (questionId: string, value: any) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };

  // Use shared logic engine for visibility, piping, calculations, loops, and quota
  const expandedQuestions = expandLoopQuestions(questions, logicRules, responses);
  const logicVisibleQuestions = getVisibleQs(expandedQuestions, logicRules, responses);
  // Apply participant type filtering (OneTimeSurveyView doesn't have enrollment, so pass null)
  const visibleQuestions = filterQuestionsByParticipantType(logicVisibleQuestions, null);
  const calculatedValues = getCalculatedValues(logicRules, responses);
  const isQuotaFull = checkQuotaReached(logicRules, questions.map(q => q.id), responses);

  // Apply calculated values into responses so downstream logic sees them
  React.useEffect(() => {
    if (Object.keys(calculatedValues).length === 0) return;
    let changed = false;
    const next = { ...responses };
    for (const [qId, val] of Object.entries(calculatedValues)) {
      if (next[qId] !== val) { next[qId] = val; changed = true; }
    }
    if (changed) setResponses(next);
  }, [JSON.stringify(calculatedValues)]);

  const handleNext = () => {
    const currentQ = visibleQuestions[currentQuestionIndex];

    // Check require_before_next rules
    if (currentQ) {
      const requiredError = checkRequiredBeforeNext(currentQ.id, logicRules, responses);
      if (requiredError) {
        toast.error(requiredError);
        return;
      }
      // Check validate_format rules
      const validationError = checkValidation(currentQ.id, logicRules, responses);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    // Check quota
    if (isQuotaFull) {
      toast.error('This survey has reached its quota. Thank you for your interest. / 此调查已达到配额上限，感谢您的关注。');
      return;
    }

    // Check terminal actions (disqualify / end_survey)
    const terminal = checkTerminalActions(logicRules, questions.map(q => q.id), responses);
    if (terminal.disqualified) {
      setIsDisqualified(true);
      return;
    }
    if (terminal.endSurvey) {
      handleSubmit();
      return;
    }
    // Check skip logic
    const skipIdx = currentQ ? findSkipTarget(currentQ.id, visibleQuestions, logicRules, responses) : null;
    if (skipIdx !== null) {
      setCurrentQuestionIndex(skipIdx);
      return;
    }
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const unanswered = visibleQuestions.filter(q => {
      if (!q.required) return false;
      const v = responses[q.id];
      return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    });
    if (unanswered.length > 0) {
      setCurrentQuestionIndex(visibleQuestions.findIndex(q => q.id === unanswered[0].id));
      toast.error(`Please answer: "${unanswered[0].question_text}"`);
      return;
    }
    setSubmitting(true);
    try {
      let currentEnrollmentId = enrollmentId || localStorage.getItem(`enrollment_${projectId}`);
      
      if (!currentEnrollmentId) {
        const now = new Date().toISOString();
        const fallbackEmail = user?.email || `anonymous+${crypto.randomUUID()}@participant.local`;
        const { data: enrollment, error: enrollError } = await supabase
          .from('enrollment')
          .insert({
            project_id: projectId,
            participant_id: user?.id || null,
            participant_email: fallbackEmail,
            status: 'active',
          })
          .select()
          .single();

        if (enrollError) {
          throw enrollError;
        }
        
        if (enrollment) {
          currentEnrollmentId = enrollment.id;
          localStorage.setItem(`enrollment_${projectId}`, enrollment.id);
          setEnrollmentId(enrollment.id);
        }
      }

      if (!currentEnrollmentId) {
        toast.error('Unable to create enrollment. Please try again.');
        return;
      }

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
          question_id: questionId,
          response_text: answerText,
          response_value: responseValue
        });
      }
      
      if (responseInserts.length > 0) {
        await supabase
          .from('survey_response')
          .insert(responseInserts);
      }
      
      navigate(`/easyresearch/survey/${projectId}/complete`);
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const value = responses[question.id];
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
                />
                <span style={{ color: 'var(--text-primary)' }}>{option.text || option.option_text}</span>
              </label>
            ))}
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
                  />
                  <span style={{ color: 'var(--text-primary)' }}>{option.text || option.option_text}</span>
                </label>
              );
            })}
          </div>
        );

      case 'likert_scale':
        const config = (question as any).question_config || {};
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
            {question.allow_voice && (
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
            {question.allow_voice && (
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

      case 'time':
        return (<input type="time" value={value||''} onChange={(e)=>handleResponseChange(question.id,e.target.value)} className="w-full px-4 py-3 rounded-lg border-2" style={{borderColor:'var(--border-light)'}}/>);

      case 'email':
        return (<input type="email" value={value||''} onChange={(e)=>handleResponseChange(question.id,e.target.value)} className="w-full px-4 py-3 rounded-lg border-2" style={{borderColor:'var(--border-light)'}} placeholder="Enter your email..."/>);

      case 'dropdown':
        return (<select value={value||''} onChange={(e)=>handleResponseChange(question.id,e.target.value)} className="w-full px-4 py-3 rounded-lg border-2 bg-white" style={{borderColor:'var(--border-light)'}}><option value="">Select an option...</option>{question.options?.map((o:any,i:number)=>{const optVal = o.id || o.option_value || o.option_text || (typeof o === 'string' ? o : String(o)); const optLabel = o.option_text || o.text || o.label || (typeof o === 'string' ? o : String(o)); return (<option key={i} value={optVal}>{optLabel}</option>);})}</select>);

      case 'slider':
        const sliderCfg = (question as any).question_config || {};
        return (<div className="space-y-4"><input type="range" min={sliderCfg.min_value??0} max={sliderCfg.max_value??10} value={value??0} onChange={(e)=>handleResponseChange(question.id,Number(e.target.value))} className="w-full h-3 rounded-lg cursor-pointer" style={{accentColor:'var(--color-green)'}}/><div className="flex justify-between"><span style={{color:'var(--text-secondary)'}}>{sliderCfg.min_value??0}</span><span className="text-xl font-bold" style={{color:'var(--color-green)'}}>{value??0}</span><span style={{color:'var(--text-secondary)'}}>{sliderCfg.max_value??10}</span></div></div>);

      case 'rating':
        return (<div className="flex gap-3 justify-center py-4">{[1,2,3,4,5].map(s=>(<button key={s} type="button" onClick={()=>handleResponseChange(question.id,s)} className="text-4xl transition-transform hover:scale-110" style={{color:(value||0)>=s?'#fbbf24':'#d1d5db'}}>★</button>))}</div>);

      case 'nps':
        return (<div className="space-y-3"><div className="flex flex-wrap gap-2 justify-center">{[0,1,2,3,4,5,6,7,8,9,10].map(n=>(<button key={n} type="button" onClick={()=>handleResponseChange(question.id,n)} className="w-11 h-11 rounded-lg font-semibold transition-all" style={{backgroundColor:value===n?'var(--color-green)':'var(--bg-secondary)',color:value===n?'white':'var(--text-primary)'}}>{n}</button>))}</div><div className="flex justify-between text-xs px-2" style={{color:'var(--text-secondary)'}}><span>Not at all likely</span><span>Extremely likely</span></div></div>);

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


  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const progress = visibleQuestions.length > 0 ? ((currentQuestionIndex + 1) / visibleQuestions.length) * 100 : 0;

  if (isDisqualified) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <X size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Not Eligible</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Based on your responses, you are not eligible for this study. Thank you for your interest.</p>
        </div>
      </div>
    );
  }

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
              Question {currentQuestionIndex + 1} of {visibleQuestions.length}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-light)' }}>
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
                {getPipedText(currentQuestion.id, logicRules, responses) || currentQuestion.question_text}
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
            className="flex items-center gap-2 px-6 py-3 rounded-lg border font-semibold disabled:opacity-50"
            style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentQuestionIndex === visibleQuestions.length - 1 ? (
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
    </>
  );
};

export default OneTimeSurveyView;
