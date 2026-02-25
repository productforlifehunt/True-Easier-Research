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
  const [localQuestion, setLocalQuestion] = useState<Question | null>(question);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalQuestion(question);
    setHasChanges(false);
  }, [question?.id]);

  const updateLocal = (updates: Partial<Question>) => {
    if (!localQuestion || !question) return;
    const updated = { ...localQuestion, ...updates };
    setLocalQuestion(updated);
    setHasChanges(true);
    onUpdateQuestion(question.id, updated);
  };

  const saveChanges = () => {
    if (!localQuestion || !question) return;
    onUpdateQuestion(question.id, localQuestion);
    setHasChanges(false);
    toast.success('Question saved!');
  };

  if (!question || !localQuestion) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
            <Settings className="text-stone-300" size={20} />
          </div>
          <p className="text-[13px] text-stone-400 font-light">Select a question to edit</p>
        </div>
      </div>
    );
  }

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
            <input type="range" min={minVal} max={maxVal} step={stepVal} defaultValue={midVal} className="w-full cursor-pointer accent-emerald-500" />
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>{question.question_config?.min_label || minVal}</span>
              <span className="font-semibold text-emerald-600">{midVal}</span>
              <span>{question.question_config?.max_label || maxVal}</span>
            </div>
          </div>
        );
      case 'single_choice':
      case 'multiple_choice':
      case 'dropdown':
        if (!question.options || question.options.length === 0) return null;
        return (
          <div className="space-y-1.5">
            {question.options.slice(0, 3).map((opt) => (
              <div key={opt.id} className="flex items-center gap-2 text-[12px] text-stone-500">
                {localQuestion.question_type === 'single_choice' && <span className="w-3.5 h-3.5 border-2 border-stone-300 rounded-full shrink-0" />}
                {localQuestion.question_type === 'multiple_choice' && <span className="w-3.5 h-3.5 border-2 border-stone-300 rounded shrink-0" />}
                {question.question_type !== 'dropdown' && <span>{opt.option_text}</span>}
              </div>
            ))}
            {question.options.length > 3 && <p className="text-[11px] text-stone-400">+{question.options.length - 3} more</p>}
          </div>
        );
      case 'likert_scale':
        const scaleType = question.question_config?.scale_type || '1-5';
        const range = scaleType.split('-').map(Number);
        const scaleOptions: number[] = [];
        for (let i = range[0]; i <= range[1]; i++) scaleOptions.push(i);
        return (
          <div className="flex gap-1.5">
            {scaleOptions.slice(0, 7).map(val => (
              <div key={val} className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-[12px] text-stone-500 hover:border-emerald-300 transition-colors">{val}</div>
            ))}
          </div>
        );
      case 'text_short': case 'text_long': case 'number': case 'email': case 'date': case 'time':
        return <div className="h-8 rounded-lg border border-stone-200 bg-stone-50" />;
      case 'rating':
        return <div className="flex gap-1 text-amber-300">{Array.from({length: question.question_config?.max_value || 5}).map((_, i) => <span key={i} className="text-lg">★</span>)}</div>;
      case 'nps':
        return <div className="flex gap-0.5 flex-wrap">{Array.from({length: 11}, (_, i) => <div key={i} className="w-6 h-6 rounded border border-stone-200 flex items-center justify-center text-[10px] text-stone-400">{i}</div>)}</div>;
      default: return null;
    }
  };

  const addOption = () => {
    if (!localQuestion.options) return;
    const newOption: QuestionOption = { id: crypto.randomUUID(), option_text: `Option ${localQuestion.options.length + 1}`, option_value: '', order_index: localQuestion.options.length, is_other: false };
    updateLocal({ options: [...localQuestion.options, newOption] });
  };

  const removeOption = (optionId: string) => {
    if (!localQuestion.options) return;
    updateLocal({ options: localQuestion.options.filter(opt => opt.id !== optionId).map((opt, i) => ({ ...opt, order_index: i })) });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !localQuestion.options) return;
    const items = Array.from(localQuestion.options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateLocal({ options: items.map((opt, i) => ({ ...opt, order_index: i })) });
  };

  const updateOption = (optionId: string, text: string) => {
    if (!localQuestion.options) return;
    updateLocal({ options: localQuestion.options.map(opt => opt.id === optionId ? { ...opt, option_text: text } : opt) });
  };

  const deleteOption = (optionId: string) => {
    if (!localQuestion.options || localQuestion.options.length <= 2) return;
    updateLocal({ options: localQuestion.options.filter(opt => opt.id !== optionId) });
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
    updateLocal({ options: template.options.map((text, i) => ({ id: crypto.randomUUID(), option_text: text, option_value: text, order_index: i, is_other: false })) });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
        <h3 className="text-[14px] font-semibold text-stone-800">Settings</h3>
        <button
          onClick={saveChanges}
          disabled={!hasChanges}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
            hasChanges
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-stone-100 text-stone-400'
          }`}
        >
          {hasChanges ? <Save size={12} /> : <Check size={12} />}
          {hasChanges ? 'Save' : 'Saved'}
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Question Text */}
        <div>
          <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Question Text</label>
          <textarea
            value={localQuestion.question_text}
            onChange={(e) => updateLocal({ question_text: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
            rows={2}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Description</label>
          <textarea
            value={localQuestion.question_description || ''}
            onChange={(e) => updateLocal({ question_description: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
            rows={2}
            placeholder="Helper text"
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Type</label>
          <select
            value={localQuestion.question_type}
            onChange={(e) => {
              const newType = e.target.value;
              const needsOptions = ['single_choice', 'multiple_choice', 'dropdown'];
              const updates: any = { question_type: newType };
              if (newType === 'slider') { updates.question_config = { min_value: 0, max_value: 10, step: 1 }; updates.options = []; }
              else if (newType === 'rating') { updates.question_config = { max_value: 5 }; updates.options = []; }
              else if (newType === 'likert_scale') { updates.question_config = { scale_type: '1-5' }; updates.options = []; }
              else if (newType === 'nps') { updates.question_config = {}; updates.options = []; }
              else if (needsOptions.includes(newType) && (!localQuestion.options || localQuestion.options.length === 0)) {
                updates.options = [
                  { id: crypto.randomUUID(), option_text: 'Option 1', option_value: '', order_index: 0, is_other: false },
                  { id: crypto.randomUUID(), option_text: 'Option 2', option_value: '', order_index: 1, is_other: false }
                ];
              } else if (!needsOptions.includes(newType) && newType !== 'slider') { updates.options = []; updates.question_config = {}; }
              updateLocal(updates);
            }}
            className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
          >
            <option value="text_short">Short Text</option>
            <option value="text_long">Long Text</option>
            <option value="single_choice">Single Choice</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="dropdown">Dropdown</option>
            <option value="slider">Slider</option>
            <option value="rating">Rating</option>
            <option value="likert_scale">Likert Scale</option>
            <option value="nps">NPS (0-10)</option>
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
              <label className="text-[12px] font-medium text-stone-400">Options</label>
              <select
                onChange={(e) => { const t = preFillTemplates.find(t => t.name === e.target.value); if (t) applyTemplate(t); e.target.value = ''; }}
                className="text-[11px] px-2 py-1 rounded-lg border border-stone-200 bg-white text-stone-500"
                defaultValue=""
              >
                <option value="">Pre-fill...</option>
                {preFillTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="options">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1.5">
                    {localQuestion.options?.map((option, index) => (
                      <Draggable key={option.id} draggableId={option.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex items-center gap-1.5">
                            <GripVertical size={12} className="text-stone-300 shrink-0" />
                            <input
                              type="text"
                              value={option.option_text}
                              onChange={(e) => updateOption(option.id, e.target.value)}
                              className="flex-1 px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                              placeholder={`Option ${index + 1}`}
                            />
                            <button onClick={() => removeOption(option.id)} className="p-1 rounded-lg hover:bg-red-50 transition-colors">
                              <X size={12} className="text-red-400" />
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
            <button onClick={addOption} className="w-full mt-2 py-1.5 rounded-lg border border-dashed border-stone-200 text-[12px] text-stone-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors">
              + Add Option
            </button>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-[12px] text-stone-600">
                <input type="checkbox" checked={localQuestion.allow_other || false} onChange={(e) => updateLocal({ allow_other: e.target.checked })} className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
                Add "Other" option
              </label>
              {localQuestion.question_type === 'multiple_choice' && (
                <label className="flex items-center gap-2 text-[12px] text-stone-600">
                  <input type="checkbox" checked={localQuestion.allow_none || false} onChange={(e) => updateLocal({ allow_none: e.target.checked })} className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
                  Add "None of the above"
                </label>
              )}
            </div>
          </div>
        )}

        {/* Date/Time Configuration */}
        {(localQuestion.question_type === 'date' || question.question_type === 'time') && (
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-stone-400">Date/Time Settings</label>
            <label className="flex items-center gap-2 text-[12px] text-stone-600">
              <input type="checkbox" checked={localQuestion.validation_rule?.allow_future_dates !== false} onChange={(e) => updateLocal({ validation_rule: { ...localQuestion.validation_rule, allow_future_dates: e.target.checked } })} className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
              Allow future dates/times
            </label>
            <label className="flex items-center gap-2 text-[12px] text-stone-600">
              <input type="checkbox" checked={localQuestion.validation_rule?.allow_past_dates !== false} onChange={(e) => updateLocal({ validation_rule: { ...localQuestion.validation_rule, allow_past_dates: e.target.checked } })} className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
              Allow past dates/times
            </label>
          </div>
        )}

        {/* Slider Configuration */}
        {localQuestion.question_type === 'slider' && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Min', key: 'min_value', default: 0 },
              { label: 'Max', key: 'max_value', default: 10 },
              { label: 'Step', key: 'step', default: 1 },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">{f.label}</label>
                <input type="number" value={localQuestion.question_config?.[f.key] ?? f.default} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, [f.key]: Number(e.target.value) } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" min={f.key === 'step' ? 1 : undefined} />
              </div>
            ))}
          </div>
        )}

        {/* Likert Scale Configuration */}
        {(localQuestion.question_type === 'likert' || question.question_type === 'likert_scale') && (
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Scale Type</label>
            <select value={localQuestion.question_config?.scale_type || '1-5'} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, scale_type: e.target.value } })}
              className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
              <option value="1-5">1-5</option><option value="1-7">1-7</option><option value="1-10">1-10</option><option value="0-10">0-10</option>
            </select>
          </div>
        )}

        {/* Rating Configuration */}
        {localQuestion.question_type === 'rating' && (
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Max Stars</label>
            <select value={localQuestion.question_config?.max_value ?? 5} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, max_value: Number(e.target.value) } })}
              className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
              <option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="7">7</option><option value="10">10</option>
            </select>
          </div>
        )}

        {/* Settings section */}
        <div className="space-y-3 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-stone-400">Response Type</label>
            <select value={localQuestion.response_required || 'optional'} onChange={(e) => updateLocal({ response_required: e.target.value })}
              className="px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
              <option value="optional">Optional</option><option value="request">Request</option><option value="force">Required</option>
            </select>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-xl bg-stone-50">
            <p className="text-[11px] font-medium text-stone-400 mb-2">Preview</p>
            <div className="bg-white p-3 rounded-lg border border-stone-100">
              <p className="text-[13px] font-medium text-stone-800 mb-1.5">
                {question.question_text || 'Enter your question'}
                {question.response_required === 'force' && <span className="text-red-500 ml-1">*</span>}
              </p>
              {question.question_description && <p className="text-[12px] text-stone-400 mb-2">{question.question_description}</p>}
              {renderPreview()}
            </div>
          </div>

          <label className="flex items-center gap-2 text-[12px] text-stone-600">
            <input type="checkbox" checked={localQuestion.required} onChange={(e) => updateLocal({ required: e.target.checked })} className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
            Required (legacy)
          </label>

          {['text_short', 'text_long'].includes(question.question_type) && (
            <label className="flex items-center gap-2 text-[12px] text-stone-600">
              <input type="checkbox" checked={localQuestion.allow_voice} onChange={(e) => updateLocal({ allow_voice: e.target.checked })} className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
              <Mic size={12} className="text-emerald-500" /> Voice input
            </label>
          )}
        </div>

        {/* Section Name */}
        <div>
          <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Section</label>
          <input type="text" value={localQuestion.section_name || ''} onChange={(e) => updateLocal({ section_name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            placeholder="e.g., Demographics" />
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
