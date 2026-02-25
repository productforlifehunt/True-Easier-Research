import React from 'react';
import { Settings, Zap, Mic, GripVertical, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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
  response_required?: string;
  allow_other?: boolean;
  allow_none?: boolean;
  scoring_config?: any;
  options?: QuestionOption[];
}

interface QuestionOption {
  id: string;
  option_text: string;
  option_value?: string;
  order_index: number;
  is_other: boolean;
}

interface SurveyProject {
  ai_enabled: boolean;
  voice_enabled: boolean;
}

interface QuestionEditorProps {
  question: Question | null;
  project: SurveyProject;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, project, onUpdateQuestion }) => {
  if (!question) {
    return (
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
        <div className="text-center">
          <Settings className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} size={48} />
          <p style={{ color: 'var(--text-secondary)' }}>
            Select a question to edit its settings
          </p>
        </div>
      </div>
    );
  }

  // Helper to render question preview
  const renderPreview = () => {
    switch (question.question_type) {
      case 'slider':
        return (
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
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>{question.question_config?.min_label || question.question_config?.min || 0}</span>
              <span className="font-semibold" style={{ color: 'var(--color-green)' }}>
                {((question.question_config?.min || 0) + ((question.question_config?.max || 10) - (question.question_config?.min || 0)) / 2).toFixed(0)}
              </span>
              <span>{question.question_config?.max_label || question.question_config?.max || 10}</span>
            </div>
          </div>
        );

      case 'single_choice':
      case 'multiple_choice':
      case 'dropdown':
        if (!question.options || question.options.length === 0) return null;
        return (
          <div className="space-y-2">
            {question.options.slice(0, 3).map((opt, i) => (
              <div key={opt.id} className="flex items-center gap-2">
                {question.question_type === 'single_choice' && (
                  <span className="w-4 h-4 border-2 rounded-full" style={{ borderColor: 'var(--border-light)' }} />
                )}
                {question.question_type === 'multiple_choice' && (
                  <span className="w-4 h-4 border-2 rounded" style={{ borderColor: 'var(--border-light)' }} />
                )}
                {question.question_type === 'dropdown' && i === 0 && (
                  <select className="text-sm px-2 py-1 rounded border" style={{ borderColor: 'var(--border-light)' }} disabled>
                    <option>Select an option...</option>
                  </select>
                )}
                {question.question_type !== 'dropdown' && <span className="text-sm">{opt.option_text}</span>}
              </div>
            ))}
            {question.options.length > 3 && (
              <div className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>...and {question.options.length - 3} more</div>
            )}
          </div>
        );

      case 'scale':
      case 'likert':
        const scaleType = question.question_config?.scale_type || '1-5';
        const range = scaleType.split('-').map(Number);
        const scaleOptions = [];
        for (let i = range[0]; i <= range[1]; i++) {
          scaleOptions.push(i);
        }
        return (
          <div className="flex justify-between gap-2">
            {scaleOptions.slice(0, 7).map(val => (
              <div key={val} className="text-center">
                <div className="w-10 h-10 rounded border-2 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                  style={{ borderColor: 'var(--border-light)' }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
        );

      case 'text_short':
      case 'text_long':
      case 'number':
      case 'email':
      case 'phone':
      case 'date':
      case 'time':
        return (
          <input
            type={question.question_type === 'number' ? 'number' : 
                  question.question_type === 'date' ? 'date' : 
                  question.question_type === 'time' ? 'time' : 
                  question.question_type === 'email' ? 'email' : 
                  question.question_type === 'phone' ? 'tel' : 'text'}
            placeholder={question.question_type === 'text_long' ? 'Long answer text...' : 'Your answer'}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border-light)' }}
            disabled
          />
        );

      default:
        return null;
    }
  };

  const addOption = () => {
    if (!question.options) return;
    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      option_text: `Option ${question.options.length + 1}`,
      option_value: '',
      order_index: question.options.length,
      is_other: false
    };
    onUpdateQuestion(question.id, {
      options: [...question.options, newOption]
    });
  };

  const removeOption = (optionId: string) => {
    if (!question.options) return;
    const updatedOptions = question.options
      .filter(opt => opt.id !== optionId)
      .map((opt, index) => ({ ...opt, order_index: index }));
    onUpdateQuestion(question.id, { options: updatedOptions });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !question.options) return;
    
    const items = Array.from(question.options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const reorderedOptions = items.map((opt, index) => ({
      ...opt,
      order_index: index
    }));
    
    onUpdateQuestion(question.id, { options: reorderedOptions });
  };

  const updateOption = (optionId: string, text: string) => {
    if (!question.options) return;
    onUpdateQuestion(question.id, {
      options: question.options.map(opt =>
        opt.id === optionId ? { ...opt, option_text: text } : opt
      )
    });
  };

  const deleteOption = (optionId: string) => {
    if (!question.options || question.options.length <= 2) return;
    onUpdateQuestion(question.id, {
      options: question.options.filter(opt => opt.id !== optionId)
    });
  };

  const preFillTemplates = [
    { name: 'Yes - No', options: ['Yes', 'No'] },
    { name: 'True - False', options: ['True', 'False'] },
    { name: 'Agree - Disagree', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { name: '1-5 Scale', options: ['1', '2', '3', '4', '5'] },
    { name: '1-7 Scale', options: ['1', '2', '3', '4', '5', '6', '7'] },
    { name: '1-10 Scale', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  ];

  const applyTemplate = (template: typeof preFillTemplates[0]) => {
    const newOptions: QuestionOption[] = template.options.map((text, index) => ({
      id: crypto.randomUUID(),
      option_text: text,
      option_value: text,
      order_index: index,
      is_other: false
    }));
    onUpdateQuestion(question.id, { options: newOptions });
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6" style={{ border: '1px solid var(--border-light)' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Question Settings
      </h3>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Question Text
          </label>
          <textarea
            value={question.question_text}
            onChange={(e) => onUpdateQuestion(question.id, { question_text: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border resize-none"
            style={{ borderColor: 'var(--border-light)' }}
            rows={3}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Description (Optional)
          </label>
          <textarea
            value={question.question_description || ''}
            onChange={(e) => onUpdateQuestion(question.id, { question_description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border resize-none"
            style={{ borderColor: 'var(--border-light)' }}
            rows={2}
            placeholder="Add helper text"
          />
        </div>

        {/* Add Question Type Selector at the top */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Question Type
          </label>
          <select
            value={question.question_type}
            onChange={(e) => {
              const newType = e.target.value;
              const needsOptions = ['single_choice', 'multiple_choice', 'likert', 'dropdown', 'scale', 'ranking'];
              const updates: any = { question_type: newType };
              
              if (newType === 'slider') {
                updates.question_config = { min: 0, max: 10, step: 1 };
                updates.options = [];
              } else if (newType === 'scale' || newType === 'likert') {
                updates.question_config = { scale_type: '1-5' };
                updates.options = [];
              } else if (needsOptions.includes(newType) && (!question.options || question.options.length === 0)) {
                updates.options = [
                  { id: crypto.randomUUID(), option_text: 'Option 1', option_value: '', order_index: 0, is_other: false },
                  { id: crypto.randomUUID(), option_text: 'Option 2', option_value: '', order_index: 1, is_other: false }
                ];
              } else if (!needsOptions.includes(newType) && newType !== 'slider') {
                updates.options = [];
                updates.question_config = {};
              }
              
              onUpdateQuestion(question.id, updates);
            }}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <option value="text_short">Short Text</option>
            <option value="text_long">Long Text</option>
            <option value="single_choice">Single Choice (Radio)</option>
            <option value="multiple_choice">Multiple Choice (Checkbox)</option>
            <option value="dropdown">Dropdown</option>
            <option value="slider">Slider</option>
            <option value="scale">Rating Scale</option>
            <option value="likert">Likert Scale</option>
            <option value="ranking">Ranking</option>
            <option value="matrix">Matrix/Grid</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="file_upload">File Upload</option>
          </select>
        </div>

        {/* Options for choice questions */}
        {['single_choice', 'multiple_choice', 'dropdown', 'ranking'].includes(question.question_type) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Answer Options
              </label>
              <select
                onChange={(e) => {
                  const template = preFillTemplates.find(t => t.name === e.target.value);
                  if (template) applyTemplate(template);
                  e.target.value = '';
                }}
                className="text-sm px-2 py-1 rounded border"
                style={{ borderColor: 'var(--border-light)' }}
                defaultValue=""
              >
                <option value="">Pre-fill...</option>
                {preFillTemplates.map(t => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="options">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {question.options.map((option, index) => (
                      <Draggable key={option.id} draggableId={option.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center gap-2"
                          >
                            <GripVertical size={16} className="text-gray-400" />
                            <input
                              type="text"
                              value={option.option_text}
                              onChange={(e) => updateOption(option.id, e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border"
                              style={{ borderColor: 'var(--border-light)' }}
                              placeholder={`Option ${index + 1}`}
                            />
                            <button
                              onClick={() => removeOption(option.id)}
                              className="p-2 rounded hover:bg-gray-100"
                            >
                              <X size={16} className="text-red-500" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button
              onClick={addOption}
              className="w-full mt-2 py-2 rounded-lg border-2 border-dashed text-sm"
              style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
            >
              + Add Option
            </button>
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={question.allow_other || false}
                  onChange={(e) => onUpdateQuestion(question.id, { allow_other: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Add "Other" option with text field
                </span>
              </label>
              {question.question_type === 'multiple_choice' && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={question.allow_none || false}
                    onChange={(e) => onUpdateQuestion(question.id, { allow_none: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    Add "None of the above" option
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Date/Time Configuration */}
        {(question.question_type === 'date' || question.question_type === 'time') && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Date/Time Settings
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={question.validation_rules?.allow_future_dates !== false}
                  onChange={(e) => onUpdateQuestion(question.id, {
                    validation_rules: { ...question.validation_rules, allow_future_dates: e.target.checked }
                  })}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Allow future dates/times
                </span>
              </label>
              <label className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  checked={question.validation_rules?.allow_past_dates !== false}
                  onChange={(e) => onUpdateQuestion(question.id, {
                    validation_rules: { ...question.validation_rules, allow_past_dates: e.target.checked }
                  })}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Allow past dates/times
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Slider Configuration */}
        {(question.question_type === 'slider' || question.question_type === 'likert') && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Scale Type
              </label>
              <select
                value={question.question_config?.scale_type || '1-5'}
                onChange={(e) => onUpdateQuestion(question.id, {
                  question_config: { ...question.question_config, scale_type: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <option value="1-5">1-5</option>
                <option value="1-7">1-7</option>
                <option value="1-10">1-10</option>
                <option value="0-10">0-10</option>
                <option value="agree">Strongly Disagree to Strongly Agree</option>
                <option value="satisfaction">Very Dissatisfied to Very Satisfied</option>
                <option value="frequency">Never to Always</option>
              </select>
            </div>
            {question.question_type === 'likert' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Labels (comma-separated)
                </label>
                <input
                  type="text"
                  value={question.question_config?.labels || 'Strongly Disagree,Disagree,Neutral,Agree,Strongly Agree'}
                  onChange={(e) => onUpdateQuestion(question.id, {
                    question_config: { ...question.question_config, labels: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)' }}
                  placeholder="Enter labels separated by commas"
                />
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Response Type
            </label>
            <select
              value={question.response_required || 'optional'}
              onChange={(e) => onUpdateQuestion(question.id, { response_required: e.target.value })}
              className="px-3 py-2 rounded-lg border"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <option value="optional">Optional (Allow Skipping)</option>
              <option value="request">Request (Prompt if Skipped)</option>
              <option value="force">Required (Cannot Skip)</option>
            </select>
          </div>

          {/* Question Preview */}
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Preview
            </h4>
            <div className="bg-white p-4 rounded-lg" style={{ border: '1px solid var(--border-light)' }}>
              <p className="font-medium mb-2">
                {question.question_text || 'Enter your question'}
                {question.response_required === 'force' && <span className="text-red-500 ml-1">*</span>}
              </p>
              {question.question_description && (
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {question.question_description}
                </p>
              )}
              {renderPreview()}
            </div>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdateQuestion(question.id, { required: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Required question (legacy flag)
            </span>
          </label>

          {project.ai_enabled && (
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={question.allow_ai_assist}
                onChange={(e) => onUpdateQuestion(question.id, { allow_ai_assist: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Zap size={14} style={{ color: 'var(--color-green)' }} />
                Enable AI assistance
              </span>
            </label>
          )}

          {project.voice_enabled && ['text_short', 'text_long'].includes(question.question_type) && (
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={question.allow_voice}
                onChange={(e) => onUpdateQuestion(question.id, { allow_voice: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Mic size={14} style={{ color: 'var(--color-green)' }} />
                Allow voice input
              </span>
            </label>
          )}
        </div>

        {/* Section Name */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Section Name (Optional)
          </label>
          <input
            type="text"
            value={question.section_name || ''}
            onChange={(e) => onUpdateQuestion(question.id, { section_name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border-light)' }}
            placeholder="e.g., Demographics, Medical History"
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
