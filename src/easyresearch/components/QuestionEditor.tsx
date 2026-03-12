import React, { useState, useEffect } from 'react';
import { Settings, Mic, GripVertical, X, Save, Check, Volume2, Globe, Sparkles, Wand2 } from 'lucide-react';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';
import CustomDropdown from './CustomDropdown';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { bToast } from '../utils/bilingualToast';
import { useI18n } from '../hooks/useI18n';

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  question_description?: string;
  question_config: any;
  validation_rule: any;
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
  questionnaireType?: 'survey' | 'consent' | 'screening' | 'profile' | 'help' | 'custom' | 'onboarding';
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, project, questionnaireType, onUpdateQuestion }) => {
  const { t } = useI18n();
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
    bToast.success('Question saved!', '问题已保存！');
  };

  if (!question || !localQuestion) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
            <Settings className="text-stone-300" size={20} />
          </div>
          <p className="text-[13px] text-stone-400 font-light">{t('qe.selectQuestion')}</p>
        </div>
      </div>
    );
  }

  const renderPreview = () => {
    const normalizedType = normalizeLegacyQuestionType(localQuestion.question_type);
    switch (normalizedType) {
      case 'section_header':
        return (
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: (localQuestion.question_config?.section_color || '#10b981') + '15' }}>
            {localQuestion.question_config?.section_icon && <span className="text-lg">{localQuestion.question_config.section_icon}</span>}
            <span className="text-[12px] font-semibold" style={{ color: localQuestion.question_config?.section_color || '#10b981' }}>Section Tab</span>
          </div>
        );
      case 'bipolar_scale':
        const bMin = localQuestion.question_config?.min_value ?? -3;
        const bMax = localQuestion.question_config?.max_value ?? 3;
        const bMid = 0;
        return (
          <div className="space-y-2">
            <div className="flex justify-between gap-0.5">
              {Array.from({ length: bMax - bMin + 1 }, (_, i) => bMin + i).map(v => (
                <div key={v} className={`flex-1 text-center py-1 rounded text-[10px] font-medium border ${v === bMid ? 'border-stone-300 bg-stone-50' : 'border-stone-200'}`}
                  style={{ color: v < 0 ? '#ef4444' : v > 0 ? '#10b981' : '#6b7280' }}>
                  {v > 0 ? `+${v}` : v}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>{localQuestion.question_config?.min_label || 'Negative'}</span>
              <span>{localQuestion.question_config?.max_label || 'Positive'}</span>
            </div>
          </div>
        );
      case 'checkbox_group':
        if (!localQuestion.options || localQuestion.options.length === 0) return null;
        return (
          <div className="grid grid-cols-2 gap-1">
            {localQuestion.options.slice(0, 4).map((opt) => (
              <div key={opt.id} className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <span className="w-3 h-3 border border-stone-300 rounded shrink-0" />
                <span className="truncate">{opt.option_text}</span>
              </div>
            ))}
            {localQuestion.options.length > 4 && <p className="text-[10px] text-stone-400 col-span-2">+{localQuestion.options.length - 4} more</p>}
          </div>
        );
      case 'slider':
        const minVal = localQuestion.question_config?.min_value ?? localQuestion.question_config?.min ?? 0;
        const maxVal = localQuestion.question_config?.max_value ?? localQuestion.question_config?.max ?? 10;
        const stepVal = localQuestion.question_config?.step ?? 1;
        const midVal = Math.round((minVal + maxVal) / 2);
        return (
          <div className="space-y-2">
            <input type="range" min={minVal} max={maxVal} step={stepVal} defaultValue={midVal} className="w-full cursor-pointer accent-emerald-500" />
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>{localQuestion.question_config?.min_label || minVal}</span>
              <span className="font-semibold text-emerald-600">{midVal}</span>
              <span>{localQuestion.question_config?.max_label || maxVal}</span>
            </div>
          </div>
        );
      case 'single_choice':
      case 'multiple_choice':
      case 'dropdown':
        if (!localQuestion.options || localQuestion.options.length === 0) return null;
        return (
          <div className="space-y-1.5">
            {localQuestion.options?.slice(0, 3).map((opt) => (
              <div key={opt.id} className="flex items-center gap-2 text-[12px] text-stone-500">
                {localQuestion.question_type === 'single_choice' && <span className="w-3.5 h-3.5 border-2 border-stone-300 rounded-full shrink-0" />}
                {localQuestion.question_type === 'multiple_choice' && <span className="w-3.5 h-3.5 border-2 border-stone-300 rounded shrink-0" />}
                {localQuestion.question_type !== 'dropdown' && <span>{opt.option_text}</span>}
              </div>
            ))}
            {localQuestion.options && localQuestion.options.length > 3 && <p className="text-[11px] text-stone-400">+{localQuestion.options.length - 3} more</p>}
          </div>
        );
      case 'likert_scale':
        const scaleType = localQuestion.question_config?.scale_type || '1-5';
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
      case 'text_short': case 'text_long': case 'number': case 'email': case 'date': case 'time': case 'phone':
        return <div className="h-8 rounded-lg border border-stone-200 bg-stone-50" />;
      case 'rating':
        return <div className="flex gap-1 text-amber-300">{Array.from({length: localQuestion.question_config?.max_value || 5}).map((_, i) => <span key={i} className="text-lg">★</span>)}</div>;
      case 'nps':
        return <div className="flex gap-0.5 flex-wrap">{Array.from({length: 11}, (_, i) => <div key={i} className="w-6 h-6 rounded border border-stone-200 flex items-center justify-center text-[10px] text-stone-400">{i}</div>)}</div>;
      case 'yes_no':
        return (
          <div className="flex gap-2">
            <div className="flex-1 text-center py-2 rounded-lg border border-stone-200 text-[12px] text-stone-500">{localQuestion.question_config?.yes_label || 'Yes'}</div>
            <div className="flex-1 text-center py-2 rounded-lg border border-stone-200 text-[12px] text-stone-500">{localQuestion.question_config?.no_label || 'No'}</div>
          </div>
        );
      case 'matrix':
        const matrixCols = localQuestion.question_config?.columns || [];
        return (
          <div className="space-y-1">
            <div className="flex gap-1 text-[9px] text-stone-400 pl-16">
              {matrixCols.slice(0, 5).map((col: string, i: number) => <div key={i} className="flex-1 text-center truncate">{col}</div>)}
            </div>
            {(localQuestion.options || []).slice(0, 2).map((opt: any) => (
              <div key={opt.id} className="flex items-center gap-1">
                <span className="w-16 text-[10px] text-stone-500 truncate">{opt.option_text}</span>
                {matrixCols.slice(0, 5).map((_: string, i: number) => <div key={i} className="flex-1 flex justify-center"><span className="w-3 h-3 rounded-full border border-stone-300" /></div>)}
              </div>
            ))}
          </div>
        );
      case 'ranking':
        if (!localQuestion.options || localQuestion.options.length === 0) return null;
        return (
          <div className="space-y-1">
            {localQuestion.options.slice(0, 3).map((opt: any, i: number) => (
              <div key={opt.id} className="flex items-center gap-1.5 text-[11px] text-stone-500 p-1 border border-dashed border-stone-200 rounded">
                <span className="text-[10px] font-bold text-stone-400">{i+1}.</span>
                <span className="truncate">{opt.option_text}</span>
              </div>
            ))}
          </div>
        );
      case 'file_upload':
        return <div className="h-16 rounded-lg border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-[11px] text-stone-400">Drop file here</div>;
      case 'image_choice':
        return (
          <div className="flex gap-1">
            {(localQuestion.options || []).slice(0, 3).map((opt: any) => (
              <div key={opt.id} className="w-12 h-12 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center text-[16px]">{opt.option_text}</div>
            ))}
          </div>
        );
      case 'instruction':
        return <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-600">Instruction block</div>;
      case 'text_block':
        return (
          <div className="p-2 rounded-lg bg-stone-50 border border-stone-200">
            <p className="text-[11px] text-stone-600">{localQuestion.question_config?.content || localQuestion.question_text || 'Text content...'}</p>
          </div>
        );
      case 'divider':
        return (
          <hr style={{
            borderStyle: localQuestion.question_config?.style || 'solid',
            borderColor: localQuestion.question_config?.color || '#e5e7eb',
            borderWidth: `${localQuestion.question_config?.thickness || 1}px 0 0 0`,
            margin: '8px 0',
          }} />
        );
      case 'image_block':
        return (
          <div className="text-center">
            {localQuestion.question_config?.image_url ? (
              <img src={localQuestion.question_config.image_url} alt={localQuestion.question_config?.alt_text || ''} className="max-h-24 mx-auto rounded-lg border border-stone-200" style={{ maxWidth: localQuestion.question_config?.max_width || '100%' }} />
            ) : (
              <div className="h-16 rounded-lg border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-[11px] text-stone-400">Image placeholder</div>
            )}
            {localQuestion.question_config?.caption && <p className="text-[10px] text-stone-400 mt-1">{localQuestion.question_config.caption}</p>}
          </div>
        );
      case 'video_block':
        return <div className="h-16 rounded-lg bg-stone-100 flex items-center justify-center text-[11px] text-stone-400">{localQuestion.question_config?.video_url ? 'Video' : 'No video set'}</div>;
      case 'audio_block':
        return <div className="h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[11px] text-stone-400"><Volume2 size={12} className="mr-1" /> {localQuestion.question_config?.audio_url ? 'Audio' : 'No audio set'}</div>;
      case 'embed_block':
        return <div className="h-16 rounded-lg bg-stone-100 flex items-center justify-center text-[11px] text-stone-400"><Globe size={12} className="mr-1" /> {localQuestion.question_config?.embed_url ? 'Embedded content' : 'No embed set'}</div>;
      case 'card_sort':
        return (
          <div className="flex flex-wrap gap-1">
            {(localQuestion.question_config?.cards || []).slice(0, 4).map((c: string, i: number) => (
              <div key={i} className="px-2 py-1 rounded border border-dashed border-stone-300 text-[10px] text-stone-500">{c}</div>
            ))}
            {(localQuestion.question_config?.cards || []).length > 4 && <span className="text-[10px] text-stone-400">+{(localQuestion.question_config?.cards || []).length - 4}</span>}
          </div>
        );
      case 'tree_test':
        return <div className="h-12 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-[11px] text-stone-400">Tree navigation test</div>;
      case 'first_click':
        return <div className="h-12 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-[11px] text-stone-400">First click test</div>;
      case 'five_second_test':
        return <div className="h-12 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-[11px] text-stone-400">{localQuestion.question_config?.test_duration ?? 5}s exposure test</div>;
      case 'preference_test':
        return (
          <div className="grid grid-cols-2 gap-1">
            <div className="h-10 rounded-lg bg-stone-100 flex items-center justify-center text-[10px] text-stone-500">{localQuestion.question_config?.variant_a_label || 'A'}</div>
            <div className="h-10 rounded-lg bg-stone-100 flex items-center justify-center text-[10px] text-stone-500">{localQuestion.question_config?.variant_b_label || 'B'}</div>
          </div>
        );
      case 'prototype_test':
        return <div className="h-16 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-[11px] text-stone-400">Prototype ({localQuestion.question_config?.prototype_platform || 'figma'})</div>;
      case 'max_diff':
        return (
          <div className="space-y-1">
            <p className="text-[10px] text-stone-400 font-semibold">Best-Worst Scaling</p>
            {(localQuestion.options || []).slice(0, 3).map((opt: any, i: number) => (
              <div key={opt.id} className="flex items-center justify-between text-[10px] text-stone-500 px-2 py-1 border border-stone-200 rounded">
                <span className="text-emerald-500 text-[9px]">BEST</span>
                <span className="truncate mx-2">{opt.option_text}</span>
                <span className="text-red-400 text-[9px]">WORST</span>
              </div>
            ))}
          </div>
        );
      case 'design_survey':
        return (
          <div className="grid grid-cols-3 gap-1">
            {(localQuestion.options || []).slice(0, 3).map((opt: any) => (
              <div key={opt.id} className="h-10 rounded-lg bg-stone-100 flex items-center justify-center text-[9px] text-stone-500 text-center p-1">{opt.option_text}</div>
            ))}
            {(localQuestion.options || []).length > 3 && <span className="text-[9px] text-stone-400">+{(localQuestion.options || []).length - 3}</span>}
          </div>
        );
      case 'heatmap':
        return (
          <div className="h-16 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-[11px] text-stone-400">
            Heatmap ({localQuestion.question_config?.max_clicks || 10} clicks)
          </div>
        );
      default: return null;
    }
  };

  const addOption = () => {
    if (!localQuestion.options) return;
    const newOption: QuestionOption = { id: crypto.randomUUID(), option_text: `Option ${localQuestion.options.length + 1}`, option_value: '', order_index: localQuestion.options.length, is_other: false };
    updateLocal({ options: [...localQuestion.options, newOption] });
  };

  const removeOption = (optionId: string) => {
    if (!localQuestion.options || localQuestion.options.length <= 2) return;
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
        <h3 className="text-[14px] font-semibold text-stone-800">{t('qe.settings')}</h3>
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
          {hasChanges ? t('qe.save') : t('qe.saved')}
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Question Text */}
        <div>
          <label className="block text-[12px] font-medium text-stone-400 mb-1.5">{t('qe.questionText')}</label>
          <textarea
            value={localQuestion.question_text}
            onChange={(e) => updateLocal({ question_text: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
            rows={2}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[12px] font-medium text-stone-400 mb-1.5">{t('qe.description')}</label>
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
          <CustomDropdown
            options={[
              // Layout & Media
              { value: 'section_header', label: 'Section / Tab' },
              { value: 'text_block', label: 'Text Block' },
              { value: 'divider', label: 'Divider Line' },
              { value: 'image_block', label: 'Image' },
              { value: 'video_block', label: 'Video' },
              { value: 'audio_block', label: 'Audio' },
              { value: 'embed_block', label: 'Embed / Webpage' },
              // Text
              { value: 'text_short', label: 'Short Text' },
              { value: 'text_long', label: 'Long Text' },
              // Choice
              { value: 'single_choice', label: 'Single Choice' },
              { value: 'multiple_choice', label: 'Multiple Choice' },
              { value: 'checkbox_group', label: 'Checkbox Group' },
              { value: 'dropdown', label: 'Dropdown' },
              { value: 'yes_no', label: 'Yes / No' },
              { value: 'image_choice', label: 'Image Choice' },
              { value: 'matrix', label: 'Matrix / Grid' },
              { value: 'ranking', label: 'Ranking' },
              // Scale
              { value: 'slider', label: 'Slider' },
              { value: 'bipolar_scale', label: 'Bipolar Scale (-/+)' },
              { value: 'rating', label: 'Rating' },
              { value: 'likert_scale', label: 'Likert Scale' },
              { value: 'nps', label: 'NPS (0-10)' },
              // Data
              { value: 'number', label: 'Number' },
              { value: 'date', label: 'Date' },
              { value: 'time', label: 'Time' },
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone Number' },
              { value: 'file_upload', label: 'File Upload' },
              // UX Research
              { value: 'card_sort', label: 'Card Sort' },
              { value: 'tree_test', label: 'Tree Test' },
              { value: 'first_click', label: 'First Click Test' },
              { value: 'five_second_test', label: '5-Second Test' },
              { value: 'preference_test', label: 'Preference Test (A/B)' },
              { value: 'prototype_test', label: 'Prototype Test' },
              { value: 'max_diff', label: 'MaxDiff (Best-Worst)' },
              { value: 'design_survey', label: 'Design Survey (Multi-Variant)' },
              { value: 'heatmap', label: 'Heatmap (Multi-Click)' },
              { value: 'conjoint', label: 'Conjoint Analysis' },
              { value: 'kano', label: 'Kano Model' },
              // Standardized Metrics
              { value: 'sus', label: 'SUS (System Usability Scale)' },
              { value: 'csat', label: 'CSAT (Customer Satisfaction)' },
              { value: 'ces', label: 'CES (Customer Effort Score)' },
            ]}
            value={localQuestion.question_type}
            onChange={(newType) => {
              const needsOptions = ['single_choice', 'multiple_choice', 'dropdown', 'checkbox_group', 'matrix', 'ranking', 'image_choice'];
              const updates: any = { question_type: newType };
              if (newType === 'slider') { updates.question_config = { min_value: 0, max_value: 10, step: 1 }; updates.options = []; }
              else if (newType === 'bipolar_scale') { updates.question_config = { min_value: -3, max_value: 3, step: 1, min_label: 'Very Negative', max_label: 'Very Positive', show_value_labels: true }; updates.options = []; }
              else if (newType === 'rating') { updates.question_config = { max_value: 5 }; updates.options = []; }
              else if (newType === 'likert_scale') { updates.question_config = { scale_type: '1-5' }; updates.options = []; }
              else if (newType === 'nps') { updates.question_config = {}; updates.options = []; }
              else if (newType === 'section_header') { updates.question_config = { section_icon: '', section_color: '#10b981' }; updates.options = []; }
              else if (newType === 'matrix') { 
                updates.question_config = { columns: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] }; 
                if (!localQuestion.options || localQuestion.options.length === 0) {
                  updates.options = [
                    { id: crypto.randomUUID(), option_text: 'Item 1', option_value: '', order_index: 0, is_other: false },
                    { id: crypto.randomUUID(), option_text: 'Item 2', option_value: '', order_index: 1, is_other: false },
                    { id: crypto.randomUUID(), option_text: 'Item 3', option_value: '', order_index: 2, is_other: false }
                  ];
                }
              }
              else if (newType === 'yes_no') { updates.question_config = { yes_label: 'Yes', no_label: 'No' }; updates.options = []; }
              else if (newType === 'instruction') { updates.question_config = { content_type: 'text' }; updates.options = []; }
              else if (newType === 'text_block') { updates.question_config = { content: '', font_size: 14 }; updates.options = []; }
              else if (newType === 'divider') { updates.question_config = { style: 'solid', color: '#e5e7eb', thickness: 1 }; updates.options = []; updates.question_text = 'Divider'; }
              else if (newType === 'image_block') { updates.question_config = { image_url: '', caption: '', alt_text: '', max_width: '100%' }; updates.options = []; updates.question_text = 'Image'; }
              else if (newType === 'file_upload') { updates.question_config = { max_files: 1, max_size_mb: 10, accepted_types: 'image/*,.pdf,.doc,.docx' }; updates.options = []; }
              else if (newType === 'video_block') { updates.question_config = { video_url: '', autoplay: false, loop: false, muted: true }; updates.options = []; updates.question_text = updates.question_text || 'Video'; }
              else if (newType === 'audio_block') { updates.question_config = { audio_url: '', autoplay: false, loop: false }; updates.options = []; updates.question_text = updates.question_text || 'Audio'; }
              else if (newType === 'embed_block') { updates.question_config = { embed_url: '', embed_type: 'iframe', embed_height: '400px', allow_fullscreen: true }; updates.options = []; updates.question_text = updates.question_text || 'Embed'; }
              else if (newType === 'card_sort') { updates.question_config = { cards: ['Card 1', 'Card 2', 'Card 3'], categories: ['Category A', 'Category B'], sort_type: 'open' }; updates.options = []; }
              else if (newType === 'tree_test') { updates.question_config = { tree_data: [{ label: 'Home', children: [{ label: 'Products', children: [] }, { label: 'About', children: [] }] }], task_description: 'Find the product page', correct_answer: 'Products' }; updates.options = []; }
              else if (newType === 'first_click') { updates.question_config = { test_image_url: '', task_description: 'Where would you click to...?', followup_question: 'Why did you click there?' }; updates.options = []; }
              else if (newType === 'five_second_test') { updates.question_config = { test_image_url: '', test_duration: 5, followup_question: 'What do you remember about this page?' }; updates.options = []; }
              else if (newType === 'preference_test') { updates.question_config = { variant_a_url: '', variant_a_label: 'Design A', variant_b_url: '', variant_b_label: 'Design B', followup_question: 'Why do you prefer this design?' }; updates.options = []; }
              else if (newType === 'prototype_test') { updates.question_config = { prototype_url: '', prototype_platform: 'figma', task_list: [{ task: 'Complete the checkout flow', success_url: '' }], embed_height: '600px' }; updates.options = []; }
              else if (newType === 'max_diff') {
                updates.question_config = { items_per_set: 4, best_label: 'Most Important', worst_label: 'Least Important' };
                if (!localQuestion.options || localQuestion.options.length < 4) {
                  updates.options = Array.from({ length: 6 }, (_, i) => ({ id: crypto.randomUUID(), option_text: `Item ${i + 1}`, option_value: '', order_index: i, is_other: false }));
                }
              }
              else if (newType === 'design_survey') {
                updates.question_config = { show_labels: true, randomize_variants: false, followup_question: 'Which design best meets your needs and why?' };
                if (!localQuestion.options || localQuestion.options.length < 3) {
                  updates.options = Array.from({ length: 3 }, (_, i) => ({ id: crypto.randomUUID(), option_text: `Design ${String.fromCharCode(65 + i)}`, option_value: '', order_index: i, is_other: false }));
                }
              }
              else if (newType === 'heatmap') { updates.question_config = { test_image_url: '', task_description: 'Click all areas that grab your attention', allow_multiple_clicks: true, max_clicks: 10, followup_question: '' }; updates.options = []; }
              else if (newType === 'conjoint') { updates.question_config = { conjoint_attributes: [{ name: 'Price', levels: ['$10', '$20', '$30'] }, { name: 'Color', levels: ['Red', 'Blue', 'Green'] }], profiles_per_task: 3, num_choice_tasks: 6, include_none_option: true }; updates.options = []; }
              else if (newType === 'kano') { updates.question_config = { kano_functional: 'How would you feel if this feature were present?', kano_dysfunctional: 'How would you feel if this feature were absent?', kano_categories: ['I like it', 'I expect it', 'I am neutral', 'I can tolerate it', 'I dislike it'] }; }
              else if (newType === 'sus') { updates.question_config = { scale_type: 'sus' }; updates.options = []; }
              else if (newType === 'csat') { updates.question_config = { scale_type: 'csat', min_value: 1, max_value: 5, min_label: 'Very Unsatisfied', max_label: 'Very Satisfied' }; updates.options = []; }
              else if (newType === 'ces') { updates.question_config = { scale_type: 'ces', min_value: 1, max_value: 7, min_label: 'Very Difficult', max_label: 'Very Easy' }; updates.options = []; }
              else if (needsOptions.includes(newType) && (!localQuestion.options || localQuestion.options.length === 0)) {
                updates.options = [
                  { id: crypto.randomUUID(), option_text: 'Option 1', option_value: '', order_index: 0, is_other: false },
                  { id: crypto.randomUUID(), option_text: 'Option 2', option_value: '', order_index: 1, is_other: false }
                ];
              } else if (!needsOptions.includes(newType) && !['slider','bipolar_scale','section_header','yes_no','instruction','text_block','divider','image_block','video_block','audio_block','embed_block','file_upload','card_sort','tree_test','first_click','five_second_test','preference_test','prototype_test','max_diff','design_survey','heatmap','conjoint','kano','sus','csat','ces'].includes(newType)) { updates.options = []; updates.question_config = {}; }
              updateLocal(updates);
            }}
            placeholder="Select type"
          />
        </div>

        {/* Section Header Configuration */}
        {localQuestion.question_type === 'section_header' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Section Color</label>
              <input type="color" value={localQuestion.question_config?.section_color || '#10b981'} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, section_color: e.target.value } })}
                className="w-full h-8 rounded-lg border border-stone-200 cursor-pointer" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Section Icon</label>
              <input type="text" value={localQuestion.question_config?.section_icon || ''} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, section_icon: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                placeholder="e.g., Tab icon" maxLength={4} />
            </div>
            <p className="text-[11px] text-stone-400">All questions after this section header (until the next one) will be grouped into this tab.</p>
          </div>
        )}

        {/* Bipolar Scale Configuration */}
        {localQuestion.question_type === 'bipolar_scale' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Min', key: 'min_value', default: -3 },
                { label: 'Max', key: 'max_value', default: 3 },
                { label: 'Step', key: 'step', default: 1 },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">{f.label}</label>
                  <input type="number" value={localQuestion.question_config?.[f.key] ?? f.default} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, [f.key]: Number(e.target.value) } })}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Min Label</label>
                <input type="text" value={localQuestion.question_config?.min_label || ''} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, min_label: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" placeholder="Very Negative" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Max Label</label>
                <input type="text" value={localQuestion.question_config?.max_label || ''} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, max_label: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" placeholder="Very Positive" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-stone-600">
              <input type="checkbox" checked={localQuestion.question_config?.show_value_labels !== false} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, show_value_labels: e.target.checked } })} className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
              Show value labels on each point
            </label>
          </div>
        )}

        {/* Options for choice questions */}
        {['single_choice', 'multiple_choice', 'dropdown', 'checkbox_group', 'ranking', 'matrix', 'image_choice'].includes(localQuestion.question_type) && (
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
        {(localQuestion.question_type === 'date' || localQuestion.question_type === 'time') && (
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
        {(localQuestion.question_type === 'likert' || localQuestion.question_type === 'likert_scale') && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Scale Range</label>
              <select value={localQuestion.question_config?.scale_type || '1-5'} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, scale_type: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
                <option value="1-5">1-5</option><option value="1-7">1-7</option><option value="1-10">1-10</option><option value="0-10">0-10</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Min Label</label>
                <input type="text" value={localQuestion.question_config?.min_label || ''} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, min_label: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" placeholder="Strongly Disagree" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Max Label</label>
                <input type="text" value={localQuestion.question_config?.max_label || ''} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, max_label: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" placeholder="Strongly Agree" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Custom Labels (one per line, overrides default)</label>
              <textarea value={localQuestion.question_config?.custom_labels?.join('\n') || ''} onChange={(e) => {
                const labels = e.target.value.split('\n').filter(l => l.trim());
                updateLocal({ question_config: { ...localQuestion.question_config, custom_labels: labels.length > 0 ? labels : undefined } });
              }}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                rows={3} placeholder="Strongly Disagree&#10;Disagree&#10;Neutral&#10;Agree&#10;Strongly Agree" />
            </div>
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


        {/* Matrix / Grid Configuration */}
        {localQuestion.question_type === 'matrix' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Column Headers (one per line)</label>
              <textarea
                value={(localQuestion.question_config?.columns || []).join('\n')}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, columns: e.target.value.split('\n').filter(l => l.trim()) } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                rows={5}
                placeholder="Strongly Disagree&#10;Disagree&#10;Neutral&#10;Agree&#10;Strongly Agree"
              />
            </div>
            <p className="text-[11px] text-stone-400">Row items are defined in the Options section above. Each row will have the same column choices.</p>
          </div>
        )}

        {/* Yes/No Configuration */}
        {localQuestion.question_type === 'yes_no' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Yes Label</label>
              <input type="text" value={localQuestion.question_config?.yes_label || 'Yes'} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, yes_label: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">No Label</label>
              <input type="text" value={localQuestion.question_config?.no_label || 'No'} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, no_label: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
          </div>
        )}

        {/* Instruction Block Configuration */}
        {localQuestion.question_type === 'instruction' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Content Type</label>
              <select value={localQuestion.question_config?.content_type || 'text'} onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, content_type: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 bg-white">
                <option value="text">Plain Text</option>
                <option value="info">Info Notice</option>
                <option value="warning">Warning Notice</option>
                <option value="tip">Tip / Hint</option>
              </select>
            </div>
            <p className="text-[11px] text-stone-400">The question text above will be displayed as instructional content. No response is collected.</p>
          </div>
        )}

        {/* Text Block Configuration */}
        {localQuestion.question_type === 'text_block' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Content</label>
              <textarea
                value={localQuestion.question_config?.content || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, content: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                rows={4}
                placeholder="Enter text content to display..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Font Size (px)</label>
              <input type="number" value={localQuestion.question_config?.font_size ?? 14} min={10} max={32}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, font_size: Number(e.target.value) } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <p className="text-[11px] text-stone-400">Displays formatted text content. No response is collected.</p>
          </div>
        )}

        {/* Divider Configuration */}
        {localQuestion.question_type === 'divider' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Style</label>
                <select value={localQuestion.question_config?.style || 'solid'}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, style: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 bg-white">
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Color</label>
                <input type="color" value={localQuestion.question_config?.color || '#e5e7eb'}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, color: e.target.value } })}
                  className="w-full h-8 rounded-lg border border-stone-200 cursor-pointer" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Thickness</label>
                <input type="number" value={localQuestion.question_config?.thickness ?? 1} min={1} max={10}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, thickness: Number(e.target.value) } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" />
              </div>
            </div>
            <p className="text-[11px] text-stone-400">Visual separator between sections. No response is collected.</p>
          </div>
        )}

        {/* Image Block Configuration */}
        {localQuestion.question_type === 'image_block' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Image URL</label>
              <input type="text" value={localQuestion.question_config?.image_url || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, image_url: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                placeholder="https://example.com/image.png" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Caption</label>
                <input type="text" value={localQuestion.question_config?.caption || ''}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, caption: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200"
                  placeholder="Optional caption" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Alt Text</label>
                <input type="text" value={localQuestion.question_config?.alt_text || ''}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, alt_text: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200"
                  placeholder="Describe the image" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Max Width</label>
              <select value={localQuestion.question_config?.max_width || '100%'}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, max_width: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 bg-white">
                <option value="100%">Full Width</option>
                <option value="75%">75%</option>
                <option value="50%">50%</option>
                <option value="200px">Small (200px)</option>
              </select>
            </div>
            <p className="text-[11px] text-stone-400">Displays an image. No response is collected.</p>
          </div>
        )}

        {/* File Upload Configuration */}
        {localQuestion.question_type === 'file_upload' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Max Files</label>
                <input type="number" value={localQuestion.question_config?.max_files ?? 1} min={1} max={10}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, max_files: Number(e.target.value) } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Max Size (MB)</label>
                <input type="number" value={localQuestion.question_config?.max_size_mb ?? 10} min={1} max={100}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, max_size_mb: Number(e.target.value) } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Accepted File Types</label>
              <input type="text" value={localQuestion.question_config?.accepted_types || 'image/*,.pdf,.doc,.docx'}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, accepted_types: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200"
                placeholder="image/*,.pdf,.doc,.docx" />
            </div>
          </div>
        )}

        {/* Image Choice Configuration */}
        {localQuestion.question_type === 'image_choice' && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[12px] text-stone-600">
              <input type="checkbox" checked={localQuestion.question_config?.allow_multiple || false}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, allow_multiple: e.target.checked } })}
                className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
              Allow multiple selections
            </label>
            <p className="text-[11px] text-stone-400">Add options above with image URLs in the option value field, or use text labels as visual options.</p>
          </div>
        )}

        {/* Video Block Configuration */}
        {localQuestion.question_type === 'video_block' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Video URL</label>
              <input type="text" value={localQuestion.question_config?.video_url || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, video_url: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="YouTube, Vimeo, or direct MP4 URL" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Poster Image (optional)</label>
              <input type="text" value={localQuestion.question_config?.poster_url || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, poster_url: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" placeholder="Thumbnail URL" />
            </div>
            <div className="space-y-2">
              {[{ key: 'autoplay', label: 'Autoplay' }, { key: 'loop', label: 'Loop' }, { key: 'muted', label: 'Start muted' }].map(opt => (
                <label key={opt.key} className="flex items-center gap-2 text-[12px] text-stone-600">
                  <input type="checkbox" checked={localQuestion.question_config?.[opt.key] || false}
                    onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, [opt.key]: e.target.checked } })}
                    className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
                  {opt.label}
                </label>
              ))}
            </div>
            <p className="text-[11px] text-stone-400">Supports YouTube, Vimeo, Loom, and direct video URLs.</p>
          </div>
        )}

        {/* Audio Block Configuration */}
        {localQuestion.question_type === 'audio_block' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Audio URL</label>
              <input type="text" value={localQuestion.question_config?.audio_url || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, audio_url: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="https://example.com/audio.mp3" />
            </div>
            <div className="space-y-2">
              {[{ key: 'autoplay', label: 'Autoplay' }, { key: 'loop', label: 'Loop' }].map(opt => (
                <label key={opt.key} className="flex items-center gap-2 text-[12px] text-stone-600">
                  <input type="checkbox" checked={localQuestion.question_config?.[opt.key] || false}
                    onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, [opt.key]: e.target.checked } })}
                    className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Embed / Webpage Configuration */}
        {localQuestion.question_type === 'embed_block' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Embed URL</label>
              <input type="text" value={localQuestion.question_config?.embed_url || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, embed_url: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Figma, Google Docs, Miro, or any URL" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Type</label>
                <select value={localQuestion.question_config?.embed_type || 'iframe'}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, embed_type: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 bg-white">
                  <option value="iframe">iFrame</option><option value="figma">Figma</option><option value="google_docs">Google Docs</option>
                  <option value="miro">Miro</option><option value="loom">Loom</option><option value="airtable">Airtable</option>
                  <option value="notion">Notion</option><option value="typeform">Typeform</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Height</label>
                <select value={localQuestion.question_config?.embed_height || '400px'}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, embed_height: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 bg-white">
                  <option value="200px">Small</option><option value="400px">Medium</option><option value="600px">Large</option><option value="800px">XL</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-stone-600">
              <input type="checkbox" checked={localQuestion.question_config?.allow_fullscreen !== false}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, allow_fullscreen: e.target.checked } })}
                className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
              Allow fullscreen
            </label>
          </div>
        )}

        {/* Card Sort Configuration */}
        {localQuestion.question_type === 'card_sort' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Sort Type</label>
              <select value={localQuestion.question_config?.sort_type || 'open'}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, sort_type: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 bg-white">
                <option value="open">Open Sort (participants create categories)</option>
                <option value="closed">Closed Sort (predefined categories)</option>
                <option value="hybrid">Hybrid (predefined + custom)</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Cards (one per line)</label>
              <textarea value={(localQuestion.question_config?.cards || []).join('\n')}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, cards: e.target.value.split('\n').filter((l: string) => l.trim()) } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 resize-none" rows={5} placeholder="Navigation&#10;Search&#10;Cart" />
            </div>
            {localQuestion.question_config?.sort_type !== 'open' && (
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Categories (one per line)</label>
                <textarea value={(localQuestion.question_config?.categories || []).join('\n')}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, categories: e.target.value.split('\n').filter((l: string) => l.trim()) } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 resize-none" rows={3} placeholder="Header&#10;Sidebar&#10;Footer" />
              </div>
            )}
          </div>
        )}

        {/* Tree Test Configuration */}
        {localQuestion.question_type === 'tree_test' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Task Description</label>
              <textarea value={localQuestion.question_config?.task_description || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, task_description: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 resize-none" rows={2} placeholder="Find pricing info" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Tree Structure (JSON)</label>
              <textarea value={JSON.stringify(localQuestion.question_config?.tree_data || [], null, 2)}
                onChange={(e) => { try { updateLocal({ question_config: { ...localQuestion.question_config, tree_data: JSON.parse(e.target.value) } }); } catch {} }}
                className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-mono border border-stone-200 resize-none" rows={6} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Correct Answer (node label)</label>
              <input type="text" value={localQuestion.question_config?.correct_answer || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, correct_answer: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" />
            </div>
          </div>
        )}

        {/* First Click Test Configuration */}
        {localQuestion.question_type === 'first_click' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Test Image URL</label>
              <input type="text" value={localQuestion.question_config?.test_image_url || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, test_image_url: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200" placeholder="https://example.com/mockup.png" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Task</label>
              <textarea value={localQuestion.question_config?.task_description || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, task_description: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 resize-none" rows={2} placeholder="Where would you click to...?" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Follow-up Question</label>
              <input type="text" value={localQuestion.question_config?.followup_question || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, followup_question: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" placeholder="Why did you click there?" />
            </div>
          </div>
        )}

        {/* 5-Second Test Configuration */}
        {localQuestion.question_type === 'five_second_test' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Test Image URL</label>
              <input type="text" value={localQuestion.question_config?.test_image_url || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, test_image_url: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200" placeholder="https://example.com/design.png" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Display Duration (sec)</label>
              <input type="number" value={localQuestion.question_config?.test_duration ?? 5} min={1} max={30}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, test_duration: Number(e.target.value) } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Follow-up Question</label>
              <input type="text" value={localQuestion.question_config?.followup_question || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, followup_question: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" placeholder="What do you remember?" />
            </div>
          </div>
        )}

        {/* Preference Test Configuration */}
        {localQuestion.question_type === 'preference_test' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Variant A URL</label>
                <input type="text" value={localQuestion.question_config?.variant_a_url || ''}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, variant_a_url: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" placeholder="Design A" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Label A</label>
                <input type="text" value={localQuestion.question_config?.variant_a_label || 'Design A'}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, variant_a_label: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Variant B URL</label>
                <input type="text" value={localQuestion.question_config?.variant_b_url || ''}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, variant_b_url: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" placeholder="Design B" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Label B</label>
                <input type="text" value={localQuestion.question_config?.variant_b_label || 'Design B'}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, variant_b_label: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Follow-up Question</label>
              <input type="text" value={localQuestion.question_config?.followup_question || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, followup_question: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" placeholder="Why?" />
            </div>
          </div>
        )}

        {/* Prototype Test Configuration */}
        {localQuestion.question_type === 'prototype_test' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Prototype URL</label>
              <input type="text" value={localQuestion.question_config?.prototype_url || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, prototype_url: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200" placeholder="https://figma.com/proto/..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Platform</label>
                <select value={localQuestion.question_config?.prototype_platform || 'figma'}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, prototype_platform: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 bg-white">
                  <option value="figma">Figma</option><option value="invision">InVision</option><option value="sketch">Sketch</option>
                  <option value="adobe_xd">Adobe XD</option><option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Height</label>
                <select value={localQuestion.question_config?.embed_height || '600px'}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, embed_height: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 bg-white">
                  <option value="400px">400px</option><option value="600px">600px</option><option value="800px">800px</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Tasks (JSON)</label>
              <textarea value={JSON.stringify(localQuestion.question_config?.task_list || [], null, 2)}
                onChange={(e) => { try { updateLocal({ question_config: { ...localQuestion.question_config, task_list: JSON.parse(e.target.value) } }); } catch {} }}
                className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-mono border border-stone-200 resize-none" rows={4} />
            </div>
          </div>
        )}

        {/* MaxDiff Configuration */}
        {localQuestion.question_type === 'max_diff' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Items Per Set</label>
              <input type="number" value={localQuestion.question_config?.items_per_set ?? 4} min={3} max={7}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, items_per_set: Number(e.target.value) } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" />
              <p className="text-[10px] text-stone-400 mt-1">How many items shown per comparison set (3-7)</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Best Label</label>
                <input type="text" value={localQuestion.question_config?.best_label || 'Most Important'}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, best_label: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Worst Label</label>
                <input type="text" value={localQuestion.question_config?.worst_label || 'Least Important'}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, worst_label: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
              </div>
            </div>
            <p className="text-[11px] text-stone-400">Add items via the Options section above. Each participant will see randomized sets of {localQuestion.question_config?.items_per_set || 4} items and pick the best &amp; worst from each set.</p>
          </div>
        )}

        {/* Design Survey Configuration */}
        {localQuestion.question_type === 'design_survey' && (
          <div className="space-y-3">
            <p className="text-[11px] text-stone-400">Add design variants via Options above. Use option_value for image URLs. Participants compare all variants side-by-side.</p>
            <label className="flex items-center gap-2 text-[12px] text-stone-600">
              <input type="checkbox" checked={localQuestion.question_config?.show_labels !== false}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, show_labels: e.target.checked } })}
                className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
              Show variant labels
            </label>
            <label className="flex items-center gap-2 text-[12px] text-stone-600">
              <input type="checkbox" checked={localQuestion.question_config?.randomize_variants || false}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, randomize_variants: e.target.checked } })}
                className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
              Randomize display order
            </label>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Follow-up Question</label>
              <input type="text" value={localQuestion.question_config?.followup_question || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, followup_question: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" placeholder="Why did you choose this design?" />
            </div>
          </div>
        )}

        {/* Heatmap Configuration */}
        {localQuestion.question_type === 'heatmap' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Test Image URL</label>
              <input type="text" value={localQuestion.question_config?.test_image_url || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, test_image_url: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200" placeholder="https://example.com/page-screenshot.png" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Task</label>
              <textarea value={localQuestion.question_config?.task_description || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, task_description: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 resize-none" rows={2} placeholder="Click all areas that grab your attention" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Max Clicks</label>
              <input type="number" value={localQuestion.question_config?.max_clicks ?? 10} min={1} max={50}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, max_clicks: Number(e.target.value) } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Follow-up Question</label>
              <input type="text" value={localQuestion.question_config?.followup_question || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, followup_question: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" placeholder="What stood out most?" />
            </div>
          </div>
        )}

        {/* Conjoint Analysis Configuration */}
        {localQuestion.question_type === 'conjoint' && (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Conjoint Attributes</p>
            {(localQuestion.question_config?.conjoint_attributes || []).map((attr: any, ai: number) => (
              <div key={ai} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex gap-2">
                  <input type="text" value={attr.name || ''} onChange={(e) => {
                    const attrs = [...(localQuestion.question_config?.conjoint_attributes || [])];
                    attrs[ai] = { ...attrs[ai], name: e.target.value };
                    updateLocal({ question_config: { ...localQuestion.question_config, conjoint_attributes: attrs } });
                  }} className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" placeholder="Attribute name" />
                  <button onClick={() => {
                    const attrs = (localQuestion.question_config?.conjoint_attributes || []).filter((_: any, i: number) => i !== ai);
                    updateLocal({ question_config: { ...localQuestion.question_config, conjoint_attributes: attrs } });
                  }} className="text-red-400 hover:text-red-600 text-[11px]">✕</button>
                </div>
                <div className="space-y-1">
                  {(attr.levels || []).map((level: string, li: number) => (
                    <div key={li} className="flex gap-1">
                      <input type="text" value={level} onChange={(e) => {
                        const attrs = [...(localQuestion.question_config?.conjoint_attributes || [])];
                        const levels = [...(attrs[ai].levels || [])];
                        levels[li] = e.target.value;
                        attrs[ai] = { ...attrs[ai], levels };
                        updateLocal({ question_config: { ...localQuestion.question_config, conjoint_attributes: attrs } });
                      }} className="flex-1 px-2 py-1 rounded text-[11px] border border-stone-200" placeholder={`Level ${li + 1}`} />
                      <button onClick={() => {
                        const attrs = [...(localQuestion.question_config?.conjoint_attributes || [])];
                        attrs[ai] = { ...attrs[ai], levels: attrs[ai].levels.filter((_: any, i: number) => i !== li) };
                        updateLocal({ question_config: { ...localQuestion.question_config, conjoint_attributes: attrs } });
                      }} className="text-red-300 text-[10px]">✕</button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const attrs = [...(localQuestion.question_config?.conjoint_attributes || [])];
                    attrs[ai] = { ...attrs[ai], levels: [...(attrs[ai].levels || []), ''] };
                    updateLocal({ question_config: { ...localQuestion.question_config, conjoint_attributes: attrs } });
                  }} className="text-[10px] text-emerald-500 hover:underline">+ Add level</button>
                </div>
              </div>
            ))}
            <button onClick={() => {
              const attrs = [...(localQuestion.question_config?.conjoint_attributes || []), { name: '', levels: ['', ''] }];
              updateLocal({ question_config: { ...localQuestion.question_config, conjoint_attributes: attrs } });
            }} className="text-[11px] text-blue-500 hover:underline">+ Add attribute</button>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Profiles per task</label>
                <input type="number" value={localQuestion.question_config?.profiles_per_task ?? 3} min={2} max={5}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, profiles_per_task: Number(e.target.value) } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
              </div>
              <div>
                <label className="block text-[11px] text-stone-400 mb-1"># Choice tasks</label>
                <input type="number" value={localQuestion.question_config?.num_choice_tasks ?? 6} min={1} max={20}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, num_choice_tasks: Number(e.target.value) } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-stone-600">
              <input type="checkbox" checked={localQuestion.question_config?.include_none_option ?? true}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, include_none_option: e.target.checked } })}
                className="rounded border-stone-300" />
              Include "None of these" option
            </label>
          </div>
        )}

        {/* Kano Model Configuration */}
        {localQuestion.question_type === 'kano' && (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Kano Paired Questions</p>
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">Functional question</label>
              <input type="text" value={localQuestion.question_config?.kano_functional || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, kano_functional: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" placeholder="How would you feel if this feature were present?" />
            </div>
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">Dysfunctional question</label>
              <input type="text" value={localQuestion.question_config?.kano_dysfunctional || ''}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, kano_dysfunctional: e.target.value } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" placeholder="How would you feel if this feature were absent?" />
            </div>
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">Response categories (one per line)</label>
              <textarea value={(localQuestion.question_config?.kano_categories || []).join('\n')}
                onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, kano_categories: e.target.value.split('\n').filter(Boolean) } })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[11px] border border-stone-200 resize-none" rows={5}
                placeholder="I like it&#10;I expect it&#10;I am neutral&#10;I can tolerate it&#10;I dislike it" />
            </div>
            <p className="text-[10px] text-stone-400">Each option in the questionnaire represents a feature. For each, participants answer both the functional and dysfunctional questions. Results classify features as Must-be, Attractive, Performance, Indifferent, or Reverse.</p>
          </div>
        )}

        {!['section_header', 'text_block', 'instruction', 'divider', 'image_block', 'video_block', 'audio_block', 'embed_block'].includes(localQuestion.question_type) && (
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <label className="text-[12px] font-medium text-stone-400">Response Type</label>
            <select value={localQuestion.response_required || 'optional'} onChange={(e) => {
              const val = e.target.value;
              updateLocal({ response_required: val, required: val === 'force' });
            }}
              className="px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
              <option value="optional">Optional</option><option value="request">Request</option><option value="force">Required</option>
            </select>
          </div>
        )}

        {/* Validation Rules */}
        {['text_short', 'text_long', 'number', 'email', 'phone'].includes(localQuestion.question_type) && (
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <label className="text-[12px] font-medium text-stone-400">Validation</label>
            {['text_short', 'text_long'].includes(localQuestion.question_type) && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Min Length</label>
                  <input type="number" value={localQuestion.validation_rule?.min_length ?? ''} min={0}
                    onChange={(e) => updateLocal({ validation_rule: { ...localQuestion.validation_rule, min_length: e.target.value ? Number(e.target.value) : undefined } })}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Max Length</label>
                  <input type="number" value={localQuestion.validation_rule?.max_length ?? ''} min={1}
                    onChange={(e) => updateLocal({ validation_rule: { ...localQuestion.validation_rule, max_length: e.target.value ? Number(e.target.value) : undefined } })}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" placeholder="No limit" />
                </div>
              </div>
            )}
            {localQuestion.question_type === 'number' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Min Value</label>
                  <input type="number" value={localQuestion.validation_rule?.min_value ?? ''}
                    onChange={(e) => updateLocal({ validation_rule: { ...localQuestion.validation_rule, min_value: e.target.value ? Number(e.target.value) : undefined } })}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Max Value</label>
                  <input type="number" value={localQuestion.validation_rule?.max_value ?? ''}
                    onChange={(e) => updateLocal({ validation_rule: { ...localQuestion.validation_rule, max_value: e.target.value ? Number(e.target.value) : undefined } })}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Screening Disqualification Logic */}
        {questionnaireType === 'screening' && (
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-red-500">Screening Logic</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Set which answer value should disqualify a participant. If a participant selects this value, they will not pass screening.
            </p>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Disqualify if answer equals</label>
              {localQuestion.question_type === 'yes_no' ? (
                <select
                  value={localQuestion.question_config?.disqualify_value || ''}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, disqualify_value: e.target.value || null } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                >
                  <option value="">No disqualification</option>
                  <option value="yes">{localQuestion.question_config?.yes_label || 'Yes'}</option>
                  <option value="no">{localQuestion.question_config?.no_label || 'No'}</option>
                </select>
              ) : ['single_choice', 'dropdown'].includes(localQuestion.question_type) && localQuestion.options?.length ? (
                <select
                  value={localQuestion.question_config?.disqualify_value || ''}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, disqualify_value: e.target.value || null } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                >
                  <option value="">No disqualification</option>
                  {localQuestion.options.map(opt => (
                    <option key={opt.id} value={opt.option_text}>{opt.option_text}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={localQuestion.question_config?.disqualify_value || ''}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, disqualify_value: e.target.value || null } })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  placeholder="Enter the disqualifying answer value"
                />
              )}
            </div>
            {localQuestion.question_config?.disqualify_value && (
              <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                <p className="text-[11px] text-red-600">
                  Participants answering "<strong>{localQuestion.question_config.disqualify_value}</strong>" will be disqualified from the study.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Settings section */}
        <div className="space-y-3 pt-3 border-t border-stone-100">

          {/* Preview */}
          <div className="p-3 rounded-xl bg-stone-50">
            <p className="text-[11px] font-medium text-stone-400 mb-2">Preview</p>
            <div className="bg-white p-3 rounded-lg border border-stone-100">
              <p className="text-[13px] font-medium text-stone-800 mb-1.5">
                {localQuestion.question_text || 'Enter your question'}
                {localQuestion.response_required === 'force' && <span className="text-red-500 ml-1">*</span>}
              </p>
              {localQuestion.question_description && <p className="text-[12px] text-stone-400 mb-2">{localQuestion.question_description}</p>}
              {renderPreview()}
            </div>
          </div>

           {/* AI Support — per-question settings (inherited from questionnaire, overridable) */}
          {!['section_header', 'text_block', 'instruction', 'divider', 'image_block', 'video_block', 'audio_block', 'embed_block'].includes(localQuestion.question_type) && (
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5"><Sparkles size={11} /> {t('builder.aiSupport')}</p>
              <p className="text-[10px] text-stone-400">{t('ai.inheritedDesc')}</p>
              <label className="flex items-center gap-2 text-[12px] text-stone-600 cursor-pointer">
                <input type="checkbox" checked={localQuestion.question_config?.allow_voice ?? localQuestion.allow_voice ?? false}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, allow_voice: e.target.checked }, allow_voice: e.target.checked })}
                  className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
                <Mic size={12} className="text-emerald-500" /> {t('ai.voiceInputLabel')}
              </label>
              <label className="flex items-center gap-2 text-[12px] text-stone-600 cursor-pointer">
                <input type="checkbox" checked={localQuestion.question_config?.allow_ai_assist ?? localQuestion.allow_ai_assist ?? false}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, allow_ai_assist: e.target.checked }, allow_ai_assist: e.target.checked })}
                  className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
                <Sparkles size={12} className="text-emerald-500" /> {t('ai.assistHelpEnhance')}
              </label>
              <label className="flex items-center gap-2 text-[12px] text-stone-600 cursor-pointer">
                <input type="checkbox" checked={localQuestion.question_config?.allow_ai_auto_answer ?? false}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, allow_ai_auto_answer: e.target.checked } })}
                  className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
                <Wand2 size={12} className="text-emerald-500" /> {t('ai.autoAnswerPredictive')}
              </label>
              {/* AI Guidance for this question */}
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">{t('ai.guidanceForQuestion')}</label>
                <textarea
                  value={localQuestion.question_config?.ai_guidance || ''}
                  onChange={(e) => updateLocal({ question_config: { ...localQuestion.question_config, ai_guidance: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                  rows={2}
                  placeholder={t('ai.guidanceForQuestionPlaceholder')}
                />
              </div>
              <p className="text-[10px] text-stone-400">{t('ai.featuresDesc')}</p>
            </div>
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
