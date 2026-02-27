import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Smartphone, Monitor } from 'lucide-react';

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
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleResponse = (questionId: string, value: any) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const renderQuestion = (question: any) => {
    const value = responses[question.id];

    switch (question.question_type) {
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
                    checked={value === optionValue}
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
              const selected = value?.includes(optionValue);
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
                    checked={selected}
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

      case 'likert':
        const scale = question.question_config?.scale || 5;
        const labels = question.question_config?.labels || ['1', '2', '3', '4', '5'];
        return (
          <div className="space-y-4">
            <div className="flex justify-between gap-2">
              {Array.from({ length: scale }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleResponse(question.id, i + 1)}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
                    value === i + 1 ? 'border-green-500' : ''
                  }`}
                  style={{
                    borderColor: value === i + 1 ? 'var(--color-green)' : 'var(--border-light)',
                    backgroundColor: value === i + 1 ? '#f0fdf4' : 'white',
                    color: value === i + 1 ? 'var(--color-green)' : 'var(--text-primary)'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>{labels[0]}</span>
              <span>{labels[labels.length - 1]}</span>
            </div>
          </div>
        );

      case 'section_header':
        return null;
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
                {projectTitle || 'Untitled Survey'}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {projectDescription || 'Survey description'}
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
            {currentQuestion && (
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
