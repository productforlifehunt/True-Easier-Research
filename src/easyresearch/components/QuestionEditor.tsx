import React, { useState, useEffect } from 'react';
import { Settings, Mic, GripVertical, X, Save, Check } from 'lucide-react';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';

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
  // Local state for staged edits
  const [localQuestion, setLocalQuestion] = useState<Question | null>(question);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state when question prop changes
  useEffect(() => {
    setLocalQuestion(question);
    setHasChanges(false);
  }, [question?.id]);

  // Update local state and propagate to parent immediately
  const updateLocal = (updates: Partial<Question>) => {
    if (!localQuestion || !question) return;
    const updated = { ...localQuestion, ...updates };
    setLocalQuestion(updated);
    setHasChanges(true);
    // Auto-propagate to parent so main Save always has latest data
    onUpdateQuestion(question.id, updated);
  };

  // Explicit save (kept for the Save Question button UX feedback)
  const saveChanges = () => {
    if (!localQuestion || !question) return;
    onUpdateQuestion(question.id, localQuestion);
    setHasChanges(false);
    toast.success('Question saved!');
  };

  if (!question || !localQuestion) {
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
    const normalizedType = normalizeLegacyQuestionType(question.question_type);
    switch (normalizedType) {
      case 'slider':
        const minVal = question.question_config?.min_value ?? question.question_config?.min ?? 0;
        const maxVal = question.question_config?.max_value ?? question.question_config?.max ?? 10;
        const stepVal = question.question_config?.step ?? 1;
        const midVal = Math.round((minVal + maxVal) / 2);
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={minVal}
              max={maxVal}
              step={stepVal}
              defaultValue={midVal}
              className="w-full cursor-pointer"
              style={{ accentColor: 'var(--color-green)' }}
            />
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>{question.question_config?.min_label || minVal}</span>
              <span className="font-semibold" style={{ color: 'var(--color-green)' }}>
                {midVal}
              </span>
              <span>{question.question_config?.max_label || maxVal}</span>
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
                {localQuestion.question_type === 'single_choice' && (
                  <span className="w-4 h-4 border-2 rounded-full" style={{ borderColor: 'var(--border-light)' }} />
                )}
                {localQuestion.question_type === 'multiple_choice' && (
                  <span className="w-4 h-4 border-2 rounded" style={{ borderColor: 'var(--border-light)' }} />
                )}
                {localQuestion.question_type === 'dropdown' && i === 0 && (
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

      case 'likert_scale':
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
                <div className="w-10 h-10 rounded border-2 flex items-center justify-center cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--border-light)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
      case 'date':
      case 'time':
        return (
          <input
            type={localQuestion.question_type === 'number' ? 'number' : 
                  question.question_type === 'date' ? 'date' : 
                  question.question_type === 'time' ? 'time' : 
                  question.question_type === 'email' ? 'email' : 
                  'text'}
            placeholder={localQuestion.question_type === 'text_long' ? 'Long answer text...' : 'Your answer'}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border-light)' }}
            disabled
          />
        );

      case 'rating':
        return (
          <div className="flex gap-2">
            {Array.from({ length: question.question_config?.max_value || 5 }, (_, i) => i + 1).map((num) => (
              <div key={num} className="w-10 h-10 rounded border-2 flex items-center justify-center" style={{ borderColor: 'var(--border-light)' }}>
                {num}
              </div>
            ))}
          </div>
        );

      case 'nps':
        return (
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 11 }, (_, i) => i).map((num) => (
              <div key={num} className="w-9 h-9 rounded border-2 flex items-center justify-center text-xs" style={{ borderColor: 'var(--border-light)' }}>
                {num}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const addOption = () => {
    if (!localQuestion.options) return;
    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      option_text: `Option ${localQuestion.options.length + 1}`,
      option_value: '',
      order_index: localQuestion.options.length,
      is_other: false
    };
    updateLocal({
      options: [...localQuestion.options, newOption]
    });
  };

  const removeOption = (optionId: string) => {
    if (!localQuestion.options) return;
    const updatedOptions = localQuestion.options
      .filter(opt => opt.id !== optionId)
      .map((opt, index) => ({ ...opt, order_index: index }));
    updateLocal({ options: updatedOptions });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !localQuestion.options) return;
    
    const items = Array.from(localQuestion.options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const reorderedOptions = items.map((opt, index) => ({
      ...opt,
      order_index: index
    }));
    
    updateLocal({ options: reorderedOptions });
  };

  const updateOption = (optionId: string, text: string) => {
    if (!localQuestion.options) return;
    updateLocal({
      options: localQuestion.options.map(opt =>
        opt.id === optionId ? { ...opt, option_text: text } : opt
      )
    });
  };

  const deleteOption = (optionId: string) => {
    if (!localQuestion.options || localQuestion.options.length <= 2) return;
    updateLocal({
      options: localQuestion.options.filter(opt => opt.id !== optionId)
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
    updateLocal({ options: newOptions });
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6" style={{ border: '1px solid var(--border-light)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Question Settings
        </h3>
        <button
          onClick={saveChanges}
          disabled={!hasChanges}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            hasChanges 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {hasChanges ? <Save size={16} /> : <Check size={16} />}
          {hasChanges ? 'Save Question' : 'Saved'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Question Text
          </label>
          <textarea
            value={localQuestion.question_text}
            onChange={(e) => updateLocal({ question_text: e.target.value })}
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
            value={localQuestion.question_description || ''}
            onChange={(e) => updateLocal({ question_description: e.target.value })}
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
            value={localQuestion.question_type}
            onChange={(e) => {
              const newType = e.target.value;
              const needsOptions = ['single_choice', 'multiple_choice', 'dropdown'];
              const updates: any = { question_type: newType };
              
              if (newType === 'slider') {
                updates.question_config = { min_value: 0, max_value: 10, step: 1 };
                updates.options = [];
              } else if (newType === 'rating') {
                updates.question_config = { max_value: 5 };
                updates.options = [];
              } else if (newType === 'likert_scale') {
                updates.question_config = { scale_type: '1-5' };
                updates.options = [];
              } else if (newType === 'nps') {
                updates.question_config = {};
                updates.options = [];
              } else if (needsOptions.includes(newType) && (!localQuestion.options || localQuestion.options.length === 0)) {
                updates.options = [
                  { id: crypto.randomUUID(), option_text: 'Option 1', option_value: '', order_index: 0, is_other: false },
                  { id: crypto.randomUUID(), option_text: 'Option 2', option_value: '', order_index: 1, is_other: false }
                ];
              } else if (!needsOptions.includes(newType) && newType !== 'slider') {
                updates.options = [];
                updates.question_config = {};
              }
              
              updateLocal(updates);
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
            <option value="rating">Rating Scale (Stars)</option>
            <option value="likert_scale">Likert Scale</option>
            <option value="nps">NPS Score (0-10)</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
            <option value="email">Email</option>
          </select>
        </div>

        {/* Options for choice questions */}
        {['single_choice', 'multiple_choice', 'dropdown'].includes(localQuestion.question_type) && (
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
                    {localQuestion.options?.map((option, index) => (
                      <Draggable key={option.id} draggableId={option.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center gap-2"
                          >
                            <GripVertical size={16} style={{ color: 'var(--text-secondary)' }} />
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
                              className="p-2 rounded transition-colors"
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                  checked={localQuestion.allow_other || false}
                  onChange={(e) => updateLocal({ allow_other: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Add "Other" option with text field
                </span>
              </label>
              {localQuestion.question_type === 'multiple_choice' && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={localQuestion.allow_none || false}
                    onChange={(e) => updateLocal({ allow_none: e.target.checked })}
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
        {(localQuestion.question_type === 'date' || question.question_type === 'time') && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Date/Time Settings
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localQuestion.validation_rule?.allow_future_dates !== false}
                  onChange={(e) => updateLocal({
                    validation_rule: { ...localQuestion.validation_rule, allow_future_dates: e.target.checked }
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
                  checked={localQuestion.validation_rule?.allow_past_dates !== false}
                  onChange={(e) => updateLocal({
                    validation_rule: { ...localQuestion.validation_rule, allow_past_dates: e.target.checked }
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
        {localQuestion.question_type === 'slider' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Min Value
                </label>
                <input
                  type="number"
                  value={localQuestion.question_config?.min_value ?? 0}
                  onChange={(e) => updateLocal({
                    question_config: { ...localQuestion.question_config, min_value: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Max Value
                </label>
                <input
                  type="number"
                  value={localQuestion.question_config?.max_value ?? 10}
                  onChange={(e) => updateLocal({
                    question_config: { ...localQuestion.question_config, max_value: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Step
                </label>
                <input
                  type="number"
                  value={localQuestion.question_config?.step ?? 1}
                  onChange={(e) => updateLocal({
                    question_config: { ...localQuestion.question_config, step: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)' }}
                  min="1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Likert Scale Configuration */}
        {(localQuestion.question_type === 'likert' || question.question_type === 'likert_scale') && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Scale Type
              </label>
              <select
                value={localQuestion.question_config?.scale_type || '1-5'}
                onChange={(e) => updateLocal({
                  question_config: { ...localQuestion.question_config, scale_type: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <option value="1-5">1-5</option>
                <option value="1-7">1-7</option>
                <option value="1-10">1-10</option>
                <option value="0-10">0-10</option>
              </select>
            </div>
          </div>
        )}

        {/* Rating Configuration */}
        {localQuestion.question_type === 'rating' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Max Stars
              </label>
              <select
                value={localQuestion.question_config?.max_value ?? 5}
                onChange={(e) => updateLocal({
                  question_config: { ...localQuestion.question_config, max_value: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
                <option value="7">7 Stars</option>
                <option value="10">10 Stars</option>
              </select>
            </div>
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
              value={localQuestion.response_required || 'optional'}
              onChange={(e) => updateLocal({ response_required: e.target.value })}
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
              checked={localQuestion.required}
              onChange={(e) => updateLocal({ required: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Required question (legacy flag)
            </span>
          </label>

          {['text_short', 'text_long'].includes(question.question_type) && (
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localQuestion.allow_voice}
                onChange={(e) => updateLocal({ allow_voice: e.target.checked })}
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
            value={localQuestion.section_name || ''}
            onChange={(e) => updateLocal({ section_name: e.target.value })}
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
