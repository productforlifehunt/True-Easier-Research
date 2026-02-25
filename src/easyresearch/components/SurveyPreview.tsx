import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Smartphone, Monitor } from 'lucide-react';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';

interface SurveyPreviewProps {
  questions: any[];
  projectTitle: string;
  projectDescription: string;
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({ questions, projectTitle, projectDescription }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [responses, setResponses] = useState<{ [key: string]: any }>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleResponse = (questionId: string, value: any) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const renderQuestion = (question: any) => {
    const value = responses[question.id];
    const normalizedType = normalizeLegacyQuestionType(question.question_type);

    switch (normalizedType) {
      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option: any, index: number) => {
              const optionText = typeof option === 'string' ? option : option.option_text || option;
              const optionValue = typeof option === 'string' ? option : option.id || option.option_text;
              return (
                <label
                  key={index}
                  className="flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                  style={{
                    borderColor: value === optionValue ? 'var(--color-green)' : 'var(--border-light)',
                    backgroundColor: value === optionValue ? '#f0fdf4' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    checked={value === optionValue || false}
                    onChange={() => handleResponse(question.id, optionValue)}
                    className="mr-3"
                  />
                  <span style={{ color: 'var(--text-primary)' }}>{optionText}</span>
                </label>
              );
            })}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option: any, index: number) => {
              const optionText = typeof option === 'string' ? option : option.option_text || option;
              const optionValue = typeof option === 'string' ? option : option.id || option.option_text;
              const selected = Array.isArray(value) ? value.includes(optionValue) : false;
              return (
                <label
                  key={index}
                  className="flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-green-50 transition-all"
                  style={{
                    borderColor: selected ? 'var(--color-green)' : 'var(--border-light)',
                    backgroundColor: selected ? '#f0fdf4' : 'white'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected || false}
                    onChange={(e) => {
                      const currentValues = value || [];
                      if (e.target.checked) {
                        handleResponse(question.id, [...currentValues, optionValue]);
                      } else {
                        handleResponse(question.id, currentValues.filter((v: string) => v !== optionValue));
                      }
                    }}
                    className="mr-3"
                  />
                  <span style={{ color: 'var(--text-primary)' }}>{optionText}</span>
                </label>
              );
            })}
          </div>
        );

      case 'text_short':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2"
            style={{ borderColor: 'var(--border-light)' }}
            placeholder="Type your answer..."
          />
        );

      case 'text_long':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 resize-none"
            style={{ borderColor: 'var(--border-light)' }}
            rows={6}
            placeholder="Type your answer..."
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
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
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2"
            style={{ borderColor: 'var(--border-light)' }}
          />
        );

      case 'likert_scale':
        const likertOptions = [
          { value: 1, label: 'Strongly Disagree' },
          { value: 2, label: 'Disagree' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'Agree' },
          { value: 5, label: 'Strongly Agree' }
        ];
        return (
          <div className="space-y-2">
            {likertOptions.map((option) => (
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
                  checked={value === option.value || false}
                  onChange={() => handleResponse(question.id, option.value)}
                  className="mr-3"
                />
                <span style={{ color: 'var(--text-primary)' }}>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (<select value={value||''} onChange={(e)=>handleResponse(question.id,e.target.value)} className="w-full px-4 py-3 rounded-lg border-2 bg-white" style={{borderColor:'var(--border-light)'}}><option value="">Select...</option>{question.options?.map((o:any,i:number)=>(<option key={i} value={o.id||o.option_text||o}>{o.option_text||o}</option>))}</select>);
      case 'slider':
        const sliderMin = question.question_config?.min_value ?? 0;
        const sliderMax = question.question_config?.max_value ?? 10;
        const sliderStep = question.question_config?.step ?? 1;
        return (<div className="space-y-4"><input type="range" min={sliderMin} max={sliderMax} step={sliderStep} value={value ?? sliderMin} onChange={(e)=>handleResponse(question.id,Number(e.target.value))} className="w-full cursor-pointer" style={{accentColor:'var(--color-green)'}}/><div className="flex justify-between text-sm" style={{color:'var(--text-secondary)'}}><span>{sliderMin}</span><span className="text-xl font-bold" style={{color:'var(--color-green)'}}>{value ?? sliderMin}</span><span>{sliderMax}</span></div></div>);
      case 'rating':
        const maxRating = question.question_config?.max_value ?? 5;
        return (<div className="flex gap-2 justify-center">{Array.from({length: maxRating}, (_, i) => i + 1).map(s=>(<button key={s} type="button" onClick={()=>handleResponse(question.id,s)} className="text-3xl hover:scale-110 transition-transform" style={{color:(value||0)>=s?'#fbbf24':'#d1d5db'}}>★</button>))}</div>);
      case 'nps':
        return (<div className="flex flex-wrap gap-2 justify-center">{[0,1,2,3,4,5,6,7,8,9,10].map(n=>(<button key={n} type="button" onClick={()=>handleResponse(question.id,n)} className="w-10 h-10 rounded-lg font-medium" style={{backgroundColor:value===n?'var(--color-green)':'var(--bg-secondary)',color:value===n?'white':'var(--text-primary)'}}>{n}</button>))}</div>);
      case 'time':
        return (<input type="time" value={value||''} onChange={(e)=>handleResponse(question.id,e.target.value)} className="w-full px-4 py-3 rounded-lg border-2" style={{borderColor:'var(--border-light)'}}/>);
      case 'email':
        return (<input type="email" value={value||''} onChange={(e)=>handleResponse(question.id,e.target.value)} className="w-full px-4 py-3 rounded-lg border-2" style={{borderColor:'var(--border-light)'}} placeholder="Enter email..."/>);
      default:
        return <div style={{ color: 'var(--text-secondary)' }}>Question type: {question.question_type}</div>;
    }
  };

  const containerStyle = previewMode === 'mobile' 
    ? { maxWidth: '375px', margin: '0 auto' }
    : { maxWidth: '800px', margin: '0 auto' };

  return (
    <div className="space-y-6">
      {/* Preview Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Survey Preview
        </h2>
        <div className="flex gap-2 bg-white rounded-lg p-1" style={{ border: '1px solid var(--border-light)' }}>
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              previewMode === 'desktop' ? 'bg-green-50' : ''
            }`}
            style={{
              color: previewMode === 'desktop' ? 'var(--color-green)' : 'var(--text-secondary)'
            }}
          >
            <Monitor size={16} />
            Desktop
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              previewMode === 'mobile' ? 'bg-green-50' : ''
            }`}
            style={{
              color: previewMode === 'mobile' ? 'var(--color-green)' : 'var(--text-secondary)'
            }}
          >
            <Smartphone size={16} />
            Mobile
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-gray-50 rounded-2xl p-8" style={{ backgroundColor: '#f9fafb' }}>
        <div style={containerStyle}>
          <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {projectTitle || 'Untitled Project'}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {projectDescription || 'Project description'}
              </p>
            </div>

            {/* Progress Bar */}
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

            {/* Question */}
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: 'var(--text-secondary)' }}>No questions to preview. Add questions first.</p>
              </div>
            ) : currentQuestion && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {currentQuestion.question_text || 'New Question'}
                  {currentQuestion.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h2>
                {currentQuestion.question_description && (
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {currentQuestion.question_description}
                  </p>
                )}
                {renderQuestion(currentQuestion)}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border font-semibold hover:bg-gray-50 disabled:opacity-50 transition-all"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
                  style={{ backgroundColor: 'var(--color-green)' }}
                >
                  Submit Survey
                  <Check size={20} />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
                  style={{ backgroundColor: 'var(--color-green)' }}
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Preview Mode
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          This is how participants will see your survey. Responses in preview mode are not saved. 
          Switch between desktop and mobile views to test responsiveness.
        </p>
      </div>
    </div>
  );
};

export default SurveyPreview;
