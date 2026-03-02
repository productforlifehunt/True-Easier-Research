import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, Clock, Bell, BellOff, ChevronDown, ChevronRight, Copy, ArrowUpDown, FileText, Edit2, Users, Settings, X, GitBranch, FolderInput, Check, LayoutList, Layers } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import CustomDropdown from './CustomDropdown';
import { QUESTION_TYPE_DEFINITIONS } from '../constants/questionTypes';
import QuestionEditor from './QuestionEditor';
import TemplateMarketplaceEmbed from './TemplateMarketplaceEmbed';

export interface QuestionnaireConfig {
  id: string;
  project_id?: string;
  questionnaire_type: 'survey' | 'consent' | 'screening' | 'profile' | 'help' | 'custom';
  title: string;
  description: string;
  questions: any[];
  estimated_duration: number;
  frequency: string;
  time_windows: { start: string; end: string }[];
  notification_enabled: boolean;
  notification_minutes_before: number;
  dnd_allowed: boolean;
  dnd_default_start: string;
  dnd_default_end: string;
  assigned_participant_types: string[];
  order_index: number;
  consent_text?: string;
  consent_url?: string;
  consent_required?: boolean;
  disqualify_logic?: any;
  display_mode?: 'all_at_once' | 'one_per_page' | 'section_per_page';
  questions_per_page?: number | null; // null = unlimited (all at once), number = paginate by N
  tab_sections?: Array<{
    id: string;
    label: string;
    question_ids: string[];
    questions_per_page?: number | null; // per-tab override: null = unlimited, number = paginate by N
  }>;
  ai_chatbot_enabled?: boolean;
}

interface QuestionnaireListProps {
  questionnaires: QuestionnaireConfig[];
  participantTypes: { id: string; name: string }[];
  onUpdate: (questionnaires: QuestionnaireConfig[]) => void;
  project: any;
  logicRules?: any[];
  onUpdateLogic?: (rules: any[]) => void;
}

const frequencyOptions = [
  { value: 'once', label: 'One-time' },
  { value: 'hourly', label: 'Hourly' },
  { value: '2hours', label: 'Every 2 hours' },
  { value: '4hours', label: 'Every 4 hours' },
  { value: 'daily', label: 'Daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'weekly', label: 'Weekly' },
];

const QuestionnaireList: React.FC<QuestionnaireListProps> = ({
  questionnaires, participantTypes, onUpdate, project, logicRules = [], onUpdateLogic,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, 'settings' | 'questions' | null>>({});
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  // Active tab filter per questionnaire: null = show all, 'general' = unassigned, sectionId = specific tab
  const [activeTabFilter, setActiveTabFilter] = useState<Record<string, string | null>>({});
  // Which question is showing its "assign to tab" dropdown
  const [assigningQuestionId, setAssigningQuestionId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const toggleSection = (qId: string, section: 'settings' | 'questions') => {
    setOpenSections(prev => ({
      ...prev,
      [qId]: prev[qId] === section ? null : section,
    }));
  };

  const addQuestionnaire = () => {
    const num = questionnaires.length + 1;
    const newQ: QuestionnaireConfig = {
      id: crypto.randomUUID(),
      questionnaire_type: 'survey',
      title: `Questionnaire ${num}`,
      description: '',
      questions: [],
      estimated_duration: 5,
      frequency: 'daily',
      time_windows: [{ start: '09:00', end: '21:00' }],
      notification_enabled: true,
      notification_minutes_before: 5,
      dnd_allowed: true,
      dnd_default_start: '22:00',
      dnd_default_end: '08:00',
      assigned_participant_types: participantTypes.map(pt => pt.id),
      order_index: questionnaires.length,
    };
    onUpdate([...questionnaires, newQ]);
    setOpenSections(prev => ({ ...prev, [newQ.id]: 'questions' }));
  };

  const updateQuestionnaire = useCallback((id: string, updates: Partial<QuestionnaireConfig>) => {
    onUpdate(questionnaires.map(q => q.id === id ? { ...q, ...updates } : q));
  }, [questionnaires, onUpdate]);

  const removeQuestionnaire = (id: string) => {
    onUpdate(questionnaires.filter(q => q.id !== id));
  };

  const duplicateQuestionnaire = (q: QuestionnaireConfig) => {
    const dup: QuestionnaireConfig = {
      ...q,
      id: crypto.randomUUID(),
      title: `${q.title} (Copy)`,
      questions: q.questions.map(qq => ({ ...qq, id: crypto.randomUUID() })),
      order_index: questionnaires.length,
    };
    onUpdate([...questionnaires, dup]);
  };

  const addQuestion = (qId: string, type: string) => {
    const def = QUESTION_TYPE_DEFINITIONS.find(d => d.type === type);
    if (!def) return;
    const qConfig = questionnaires.find(q => q.id === qId);
    if (!qConfig) return;

    const newQ: any = {
      id: crypto.randomUUID(),
      question_type: type,
      question_text: 'Enter your question',
      question_description: '',
      question_config: { ...def.defaultConfig },
      validation_rule: {},
      logic_rule: {},
      ai_config: {},
      order_index: qConfig.questions.length,
      required: false,
      allow_voice: false,
      allow_ai_assist: false,
      options: def.requiresOptions ? [
        { id: crypto.randomUUID(), option_text: 'Option 1', option_value: '', order_index: 0, is_other: false },
        { id: crypto.randomUUID(), option_text: 'Option 2', option_value: '', order_index: 1, is_other: false },
      ] : [],
    };

    // If a tab filter is active, auto-assign to that tab
    const activeFilter = activeTabFilter[qId];
    let updatedSections = qConfig.tab_sections;
    if (activeFilter && activeFilter !== 'general' && qConfig.tab_sections) {
      updatedSections = qConfig.tab_sections.map(s =>
        s.id === activeFilter ? { ...s, question_ids: [...s.question_ids, newQ.id] } : s
      );
    }

    updateQuestionnaire(qId, {
      questions: [...qConfig.questions, newQ],
      ...(updatedSections ? { tab_sections: updatedSections } : {}),
    });
    setEditingQuestionId(newQ.id);
  };

  const updateQuestion = useCallback((qId: string, questionId: string, updates: any) => {
    const qConfig = questionnaires.find(q => q.id === qId);
    if (!qConfig) return;
    updateQuestionnaire(qId, {
      questions: qConfig.questions.map(q => q.id === questionId ? { ...q, ...updates } : q),
    });
  }, [questionnaires, updateQuestionnaire]);

  const deleteQuestion = (qId: string, questionId: string) => {
    const qConfig = questionnaires.find(q => q.id === qId);
    if (!qConfig) return;
    // Also remove from tab sections
    const updatedSections = qConfig.tab_sections?.map(s => ({
      ...s,
      question_ids: s.question_ids.filter(id => id !== questionId),
    }));
    updateQuestionnaire(qId, {
      questions: qConfig.questions.filter(q => q.id !== questionId).map((q, i) => ({ ...q, order_index: i })),
      ...(updatedSections ? { tab_sections: updatedSections } : {}),
    });
    if (editingQuestionId === questionId) setEditingQuestionId(null);
  };

  const duplicateQuestion = (qId: string, question: any) => {
    const qConfig = questionnaires.find(q => q.id === qId);
    if (!qConfig) return;
    const dup = {
      ...question,
      id: crypto.randomUUID(),
      question_text: question.question_text + ' (Copy)',
      options: question.options?.map((o: any) => ({ ...o, id: crypto.randomUUID() })) || [],
      order_index: qConfig.questions.length,
    };
    updateQuestionnaire(qId, { questions: [...qConfig.questions, dup] });
  };

  const assignQuestionToTab = (qId: string, questionId: string, targetSectionId: string | 'general') => {
    const qConfig = questionnaires.find(q => q.id === qId);
    if (!qConfig || !qConfig.tab_sections) return;
    // Remove from all sections first
    let sections = qConfig.tab_sections.map(s => ({
      ...s,
      question_ids: s.question_ids.filter(id => id !== questionId),
    }));
    // Add to target section (unless 'general' which means unassigned)
    if (targetSectionId !== 'general') {
      sections = sections.map(s =>
        s.id === targetSectionId ? { ...s, question_ids: [...s.question_ids, questionId] } : s
      );
    }
    updateQuestionnaire(qId, { tab_sections: sections });
    setAssigningQuestionId(null);
  };

  const handleQuestionDragEnd = (qId: string, result: DropResult) => {
    if (!result.destination) return;
    const qConfig = questionnaires.find(q => q.id === qId);
    if (!qConfig) return;

    // Simple reorder within the filtered view
    const items = Array.from(qConfig.questions);
    const filteredItems = getFilteredQuestions(qConfig);
    const movedQuestion = filteredItems[result.source.index];
    if (!movedQuestion) return;

    // Find actual indices in the full array
    const fromIdx = items.findIndex(q => q.id === movedQuestion.id);
    const targetQuestion = filteredItems[result.destination.index];
    const toIdx = targetQuestion ? items.findIndex(q => q.id === targetQuestion.id) : items.length - 1;

    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    items.forEach((q, i) => q.order_index = i);
    updateQuestionnaire(qId, { questions: items });
  };

  const handleQuestionnaireDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(questionnaires);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    items.forEach((q, i) => q.order_index = i);
    onUpdate(items);
  };

  // Get the current tab a question belongs to
  const getQuestionTab = (qConfig: QuestionnaireConfig, questionId: string): string => {
    if (!qConfig.tab_sections) return 'general';
    for (const section of qConfig.tab_sections) {
      if (section.question_ids.includes(questionId)) return section.id;
    }
    return 'general';
  };

  // Get filtered questions based on active tab
  const getFilteredQuestions = (qConfig: QuestionnaireConfig): any[] => {
    const filter = activeTabFilter[qConfig.id];
    if (!filter || !qConfig.tab_sections || qConfig.tab_sections.length === 0) {
      return qConfig.questions;
    }
    if (filter === 'general') {
      const assignedIds = new Set(qConfig.tab_sections.flatMap(s => s.question_ids));
      return qConfig.questions.filter(q => !assignedIds.has(q.id));
    }
    const section = qConfig.tab_sections.find(s => s.id === filter);
    if (!section) return qConfig.questions;
    return section.question_ids
      .map(id => qConfig.questions.find(q => q.id === id))
      .filter(Boolean) as any[];
  };

  const renderQuestionRow = (dragProvided: any, dragSnapshot: any, question: any, q: QuestionnaireConfig, globalIdx: number) => {
    const isEditing = editingQuestionId === question.id;
    const isAssigning = assigningQuestionId === question.id;
    const hasTabs = q.tab_sections && q.tab_sections.length > 0;
    const currentTab = hasTabs ? getQuestionTab(q, question.id) : null;
    const currentTabLabel = currentTab === 'general' ? 'General' : q.tab_sections?.find(s => s.id === currentTab)?.label;

    return (
      <div
        ref={dragProvided.innerRef}
        {...dragProvided.draggableProps}
        className={`transition-all ${dragSnapshot.isDragging ? 'shadow-lg bg-white ring-2 ring-emerald-200 rounded-lg' : ''}`}
        style={dragProvided.draggableProps.style}
      >
        <div
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-stone-50/50 transition-colors ${isEditing ? 'bg-emerald-50/30' : ''}`}
          onClick={() => setEditingQuestionId(isEditing ? null : question.id)}
        >
          {/* Drag handle */}
          <div {...dragProvided.dragHandleProps} className="shrink-0 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-stone-100 transition-colors" title="Drag to reorder" onClick={(e) => e.stopPropagation()}>
            <ArrowUpDown size={12} className="text-stone-300" />
          </div>

          {/* Question number */}
          <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full shrink-0">
            Q{globalIdx + 1}
          </span>

          {/* Required badge */}
          {(question.response_required === 'force' || (!question.response_required && question.required)) && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 shrink-0">Req</span>
          )}

          {/* Type */}
          <span className="text-[9px] uppercase font-bold text-stone-300 shrink-0 hidden sm:inline">
            {question.question_type?.replace(/_/g, ' ')}
          </span>

          {/* Question text */}
          <span className="text-[13px] text-stone-700 truncate flex-1 min-w-0">
            {question.question_text}
          </span>

          {/* Tab badge - only show when viewing "All" (no filter active) */}
          {hasTabs && !activeTabFilter[q.id] && currentTabLabel && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
              currentTab === 'general' ? 'bg-stone-100 text-stone-400' : 'bg-emerald-50 text-emerald-500'
            }`}>
              {currentTabLabel}
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0 relative">
            {/* Assign to tab */}
            {hasTabs && (
              <button onClick={(e) => { e.stopPropagation(); setAssigningQuestionId(isAssigning ? null : question.id); }}
                className={`p-1 rounded-lg transition-colors ${isAssigning ? 'bg-blue-100 text-blue-600' : 'hover:bg-stone-100 text-stone-400'}`}
                title="Assign to tab">
                <FolderInput size={12} />
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); setEditingQuestionId(isEditing ? null : question.id); }}
              className={`p-1 rounded-lg transition-colors ${isEditing ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-stone-100 text-stone-400'}`} title="Edit">
              <Edit2 size={12} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); duplicateQuestion(q.id, question); }}
              className="p-1 rounded-lg hover:bg-stone-100 transition-colors text-stone-400" title="Duplicate">
              <Copy size={12} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id, question.id); }}
              className="p-1 rounded-lg hover:bg-red-50 transition-colors text-red-400" title="Delete">
              <Trash2 size={12} />
            </button>

            {/* Assign dropdown */}
            {isAssigning && hasTabs && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl border border-stone-200 shadow-xl py-1 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => assignQuestionToTab(q.id, question.id, 'general')}
                  className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-stone-50 flex items-center justify-between ${currentTab === 'general' ? 'text-emerald-600 font-medium' : 'text-stone-600'}`}>
                  General {currentTab === 'general' && <Check size={10} />}
                </button>
                {q.tab_sections!.map(s => (
                  <button key={s.id} onClick={() => assignQuestionToTab(q.id, question.id, s.id)}
                    className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-stone-50 flex items-center justify-between ${currentTab === s.id ? 'text-emerald-600 font-medium' : 'text-stone-600'}`}>
                    {s.label} {currentTab === s.id && <Check size={10} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inline editor */}
        {isEditing && (
          <div className="px-4 pb-4 pt-1 bg-stone-50/50 border-t border-stone-100">
            <QuestionEditor
              question={question}
              project={project}
              questionnaireType={q.questionnaire_type}
              onUpdateQuestion={(questionId, updates) => updateQuestion(q.id, questionId, updates)}
            />
            {onUpdateLogic && (
              <QuestionLogicEditor
                question={question}
                allQuestions={q.questions}
                logicRules={logicRules}
                onUpdateLogic={onUpdateLogic}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderQuestionsPanel = (q: QuestionnaireConfig) => {
    const hasTabs = q.tab_sections && q.tab_sections.length > 0;
    const filter = activeTabFilter[q.id] || null;
    const filteredQuestions = getFilteredQuestions(q);
    const assignedIds = hasTabs ? new Set(q.tab_sections!.flatMap(s => s.question_ids)) : new Set<string>();
    const generalCount = hasTabs ? q.questions.filter(qq => !assignedIds.has(qq.id)).length : q.questions.length;

    return (
      <div className="border-t border-stone-100">
        {/* Sticky toolbar: tabs + add question */}
        <div className="sticky top-14 z-20 bg-white border-b border-stone-100">
          {/* Tab bar */}
          <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto">
            {/* All tab */}
            <button
              onClick={() => setActiveTabFilter(prev => ({ ...prev, [q.id]: null }))}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                !filter ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              All ({q.questions.length})
            </button>

            {hasTabs && (
              <>
                <button
                  onClick={() => setActiveTabFilter(prev => ({ ...prev, [q.id]: 'general' }))}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    filter === 'general' ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  General ({generalCount})
                </button>
                {q.tab_sections!.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTabFilter(prev => ({ ...prev, [q.id]: section.id }))}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      filter === section.id ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {section.label} ({section.question_ids.length})
                  </button>
                ))}
              </>
            )}

            {/* Divider */}
            <div className="w-px h-5 bg-stone-200 shrink-0" />

            {/* Add tab */}
            <button
              onClick={() => {
                const sections = [...(q.tab_sections || []), { id: crypto.randomUUID(), label: `Tab ${(q.tab_sections?.length || 0) + 1}`, question_ids: [] }];
                updateQuestionnaire(q.id, { tab_sections: sections });
              }}
              className="shrink-0 px-2 py-1 rounded-full text-[10px] font-medium text-stone-400 border border-dashed border-stone-300 hover:border-emerald-400 hover:text-emerald-500 transition-colors"
            >
              + Tab
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Add question */}
            <CustomDropdown
              options={[
                { value: '', label: '+ Add Question' },
                ...QUESTION_TYPE_DEFINITIONS.map(def => ({ value: def.type, label: def.label }))
              ]}
              value=""
              onChange={(value) => value && addQuestion(q.id, value)}
              placeholder="+ Add Question"
              buttonStyle={{ backgroundColor: '#10b981', color: 'white', borderRadius: '9999px', fontSize: '11px', padding: '4px 12px' }}
              className="w-auto shrink-0"
            />
          </div>

          {/* Tab editing strip - only show when tabs exist */}
          {hasTabs && (
            <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto">
              {q.tab_sections!.map((section, si) => (
                <div key={section.id} className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-stone-200 bg-stone-50 text-[10px] shrink-0">
                  <input type="text" value={section.label}
                    onChange={(e) => {
                      const sections = [...(q.tab_sections || [])];
                      sections[si] = { ...sections[si], label: e.target.value };
                      updateQuestionnaire(q.id, { tab_sections: sections });
                    }}
                    className="bg-transparent border-none outline-none w-16 text-[10px] text-stone-600 font-medium"
                  />
                  <button onClick={() => {
                    const sections = (q.tab_sections || []).filter((_, i) => i !== si);
                    updateQuestionnaire(q.id, { tab_sections: sections });
                    // Reset filter if we deleted the active tab
                    if (activeTabFilter[q.id] === section.id) {
                      setActiveTabFilter(prev => ({ ...prev, [q.id]: null }));
                    }
                  }} className="text-red-400 hover:text-red-600">
                    <X size={9} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question list */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 px-4">
            <FileText className="mx-auto text-stone-200 mb-2" size={28} />
            <p className="text-[12px] text-stone-400">
              {q.questions.length === 0 ? 'No questions yet. Add your first question above.' : `No questions in this tab. Use the folder icon to assign questions.`}
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={(result) => handleQuestionDragEnd(q.id, result)}>
            <Droppable droppableId={`questions-${q.id}-filtered`}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-stone-100">
                  {filteredQuestions.map((question: any, qIdx: number) => {
                    const globalIdx = q.questions.indexOf(question);
                    return (
                      <Draggable key={question.id} draggableId={question.id} index={qIdx}>
                        {(dragProvided, dragSnapshot) => renderQuestionRow(dragProvided, dragSnapshot, question, q, globalIdx)}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {showTemplates ? (
        <TemplateMarketplaceEmbed
          mode="browse"
          onAddTemplate={(questions, title) => {
            // Create a new questionnaire with the template questions
            const newQ: QuestionnaireConfig = {
              id: crypto.randomUUID(),
              questionnaire_type: 'survey',
              title: title || `Questionnaire ${questionnaires.length + 1}`,
              description: '',
              questions: questions.map((q, i) => ({ ...q, order_index: i })),
              estimated_duration: Math.ceil(questions.length * 0.5),
              frequency: 'once',
              time_windows: [{ start: '09:00', end: '21:00' }],
              notification_enabled: false,
              notification_minutes_before: 5,
              dnd_allowed: false,
              dnd_default_start: '22:00',
              dnd_default_end: '08:00',
              assigned_participant_types: [],
              order_index: questionnaires.length,
            };
            onUpdate([...questionnaires, newQ]);
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
      ) : (
      <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-stone-800">Questionnaires</h3>
          <p className="text-[12px] text-stone-400 mt-0.5">Each questionnaire has its own questions, schedule, and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <Layers size={14} /> From Templates
          </button>
          <button
            onClick={addQuestionnaire}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-200/50 transition-all"
          >
            <Plus size={14} /> Add Questionnaire
          </button>
        </div>
      </div>

      {questionnaires.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-stone-300" />
          </div>
          <h2 className="text-[15px] font-semibold text-stone-700 mb-1">No Questionnaires</h2>
          <p className="text-[13px] text-stone-400">Add questionnaires like "Hourly Log", "Daily Log", etc.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleQuestionnaireDragEnd}>
          <Droppable droppableId="questionnaire-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {questionnaires.map((q, idx) => {
                  const openSection = openSections[q.id] || null;
                  return (
                    <Draggable key={q.id} draggableId={q.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                            snapshot.isDragging ? 'shadow-lg ring-2 ring-emerald-200 border-emerald-200' : 'border-stone-100'
                          }`}
                        >
                          {/* Questionnaire Header */}
                          <div className="flex items-center gap-3 px-4 py-3">
                            <div {...provided.dragHandleProps} className="flex items-center gap-0.5 shrink-0 cursor-grab active:cursor-grabbing px-1.5 py-1 rounded-lg hover:bg-stone-100 transition-colors" title="Drag to reorder">
                              <ArrowUpDown size={13} className="text-stone-300" />
                              <span className="text-[9px] text-stone-300 font-medium">Move</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full whitespace-nowrap">Questionnaire {idx + 1}</span>
                                <select
                                  value={q.questionnaire_type}
                                  onChange={(e) => { e.stopPropagation(); updateQuestionnaire(q.id, { questionnaire_type: e.target.value as any }); }}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border-none outline-none cursor-pointer ${
                                    q.questionnaire_type === 'consent' ? 'bg-emerald-50 text-emerald-600' :
                                    q.questionnaire_type === 'screening' ? 'bg-amber-50 text-amber-600' :
                                    q.questionnaire_type === 'profile' ? 'bg-violet-50 text-violet-600' :
                                    q.questionnaire_type === 'help' ? 'bg-sky-50 text-sky-600' :
                                    q.questionnaire_type === 'custom' ? 'bg-rose-50 text-rose-600' :
                                    'bg-stone-50 text-stone-500'
                                  }`}
                                >
                                  <option value="survey">Survey</option>
                                  <option value="consent">Consent</option>
                                  <option value="screening">Screening</option>
                                  <option value="profile">Profile</option>
                                  <option value="help">Help</option>
                                  <option value="custom">Custom</option>
                                </select>
                                <input
                                  type="text"
                                  value={q.title}
                                  onChange={(e) => updateQuestionnaire(q.id, { title: e.target.value })}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[14px] font-semibold text-stone-800 bg-transparent border border-transparent hover:border-stone-200 focus:border-emerald-400 focus:bg-white rounded-lg px-2 py-0.5 -ml-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-w-0 flex-1 transition-colors"
                                  placeholder="Questionnaire title"
                                />
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                  <Clock size={10} /> {frequencyOptions.find(f => f.value === q.frequency)?.label || q.frequency}
                                </span>
                                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                  <FileText size={10} /> {q.questions.length} question{q.questions.length !== 1 ? 's' : ''}
                                </span>
                                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                  <LayoutList size={10} /> {q.questions_per_page == null ? '∞/page' : `${q.questions_per_page}/page`}
                                </span>
                                {q.notification_enabled && (
                                  <span className="text-[11px] text-emerald-500 flex items-center gap-1">
                                    <Bell size={10} /> On
                                  </span>
                                )}
                                {participantTypes.length > 0 && (
                                  <span className="text-[11px] text-blue-500 flex items-center gap-1">
                                    <Users size={10} />
                                    {q.assigned_participant_types.length === 0
                                      ? 'No types'
                                      : q.assigned_participant_types.length === participantTypes.length
                                        ? 'All types'
                                        : `${q.assigned_participant_types.length} type${q.assigned_participant_types.length > 1 ? 's' : ''}`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => duplicateQuestionnaire(q)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors" title="Duplicate">
                                <Copy size={13} className="text-stone-400" />
                              </button>
                              <button onClick={() => removeQuestionnaire(q.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                                <Trash2 size={13} className="text-red-400" />
                              </button>
                            </div>
                          </div>

                          {/* Toggle Buttons */}
                          <div className="flex border-t border-stone-100">
                            <button
                              onClick={() => toggleSection(q.id, 'settings')}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium transition-colors ${
                                openSection === 'settings'
                                  ? 'text-emerald-600 bg-emerald-50/50'
                                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                              }`}
                            >
                              {openSection === 'settings' ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              <Settings size={12} /> Settings
                            </button>
                            <div className="w-px bg-stone-100" />
                            <button
                              onClick={() => toggleSection(q.id, 'questions')}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium transition-colors ${
                                openSection === 'questions'
                                  ? 'text-emerald-600 bg-emerald-50/50'
                                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                              }`}
                            >
                              {openSection === 'questions' ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              <Edit2 size={12} /> Questions ({q.questions.length})
                            </button>
                          </div>

                          {/* Settings Panel */}
                          {openSection === 'settings' && (
                            <div className="border-t border-stone-100 px-4 py-4 space-y-4 bg-stone-50/30">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Description</label>
                                  <textarea value={q.description} onChange={(e) => updateQuestionnaire(q.id, { description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" rows={2} placeholder="Describe this questionnaire..." />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Est. Duration (min)</label>
                                  <input type="number" value={q.estimated_duration} onChange={(e) => updateQuestionnaire(q.id, { estimated_duration: parseInt(e.target.value) || 5 })}
                                    className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                                </div>
                              </div>

                              <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-3">
                                <h5 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5"><LayoutList size={11} /> Questions Per Page</h5>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min={1}
                                      value={q.questions_per_page ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? null : Math.max(1, parseInt(e.target.value) || 1);
                                        updateQuestionnaire(q.id, { questions_per_page: val });
                                      }}
                                      placeholder="∞"
                                      className="w-20 px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                                    />
                                    <span className="text-[11px] text-stone-400">
                                      {q.questions_per_page === null || q.questions_per_page === undefined
                                        ? 'Unlimited — all questions on one page'
                                        : q.questions_per_page === 1
                                          ? '1 question per page (paginated)'
                                          : `${q.questions_per_page} questions per page`}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-stone-400 mt-1.5">Leave empty for unlimited (all on one page). Set to 1 for one-at-a-time navigation.</p>
                                  {q.tab_sections && q.tab_sections.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Per-tab overrides:</p>
                                      {q.tab_sections.map((section, si) => (
                                        <div key={section.id} className="flex items-center gap-2">
                                          <span className="text-[11px] text-stone-500 w-20 truncate" title={section.label}>{section.label}</span>
                                          <input
                                            type="number"
                                            min={1}
                                            value={section.questions_per_page ?? ''}
                                            onChange={(e) => {
                                              const val = e.target.value === '' ? undefined : Math.max(1, parseInt(e.target.value) || 1);
                                              const sections = [...(q.tab_sections || [])];
                                              sections[si] = { ...sections[si], questions_per_page: val ?? undefined };
                                              updateQuestionnaire(q.id, { tab_sections: sections });
                                            }}
                                            placeholder="Default"
                                            className="w-20 px-2 py-1 rounded-lg text-[11px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                                          />
                                          <span className="text-[10px] text-stone-400">
                                            {section.questions_per_page == null ? '(uses default)' : `${section.questions_per_page}/page`}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-3">
                                <h5 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5"><Clock size={11} /> Schedule</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Frequency</label>
                                    <CustomDropdown options={frequencyOptions} value={q.frequency} onChange={(v) => updateQuestionnaire(q.id, { frequency: v })} placeholder="Select frequency" />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Active Window</label>
                                    <div className="flex items-center gap-1.5">
                                      <input type="time" value={q.time_windows[0]?.start || '09:00'} onChange={(e) => updateQuestionnaire(q.id, { time_windows: [{ ...q.time_windows[0], start: e.target.value }] })} className="flex-1 px-2 py-1.5 rounded-lg text-[12px] border border-stone-200" />
                                      <span className="text-[11px] text-stone-400">to</span>
                                      <input type="time" value={q.time_windows[0]?.end || '21:00'} onChange={(e) => updateQuestionnaire(q.id, { time_windows: [{ ...q.time_windows[0], end: e.target.value }] })} className="flex-1 px-2 py-1.5 rounded-lg text-[12px] border border-stone-200" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2">
                                <h5 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5"><Bell size={11} /> Notifications</h5>
                                <div className="flex items-center justify-between">
                                  <span className="text-[12px] text-stone-600">Push Notifications</span>
                                  <button onClick={() => updateQuestionnaire(q.id, { notification_enabled: !q.notification_enabled })} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${q.notification_enabled ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ left: q.notification_enabled ? '22px' : '2px' }} />
                                  </button>
                                </div>
                                {q.notification_enabled && (
                                  <div className="flex items-center gap-2">
                                    <label className="text-[11px] text-stone-400">Minutes before:</label>
                                    <input type="number" value={q.notification_minutes_before} onChange={(e) => updateQuestionnaire(q.id, { notification_minutes_before: parseInt(e.target.value) || 5 })} className="w-20 px-2 py-1 rounded-lg text-[12px] border border-stone-200" />
                                  </div>
                                )}
                              </div>

                              <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2">
                                <h5 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5"><BellOff size={11} /> Do Not Disturb</h5>
                                <div className="flex items-center justify-between">
                                  <span className="text-[12px] text-stone-600">Allow participants to set DND</span>
                                  <button onClick={() => updateQuestionnaire(q.id, { dnd_allowed: !q.dnd_allowed })} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${q.dnd_allowed ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ left: q.dnd_allowed ? '22px' : '2px' }} />
                                  </button>
                                </div>
                                {q.dnd_allowed && (
                                  <p className="text-[11px] text-stone-400">Participants can configure their own quiet hours from the app settings.</p>
                                )}

                                {/* AI Chatbot Toggle */}
                                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                                  <div>
                                    <span className="text-[12px] text-stone-600 flex items-center gap-1.5">🤖 AI Survey Chatbot</span>
                                    <p className="text-[10px] text-stone-400 mt-0.5">Floating AI assistant that helps participants complete the survey conversationally</p>
                                  </div>
                                  <button onClick={() => updateQuestionnaire(q.id, { ai_chatbot_enabled: !q.ai_chatbot_enabled })} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${q.ai_chatbot_enabled ? 'bg-violet-500' : 'bg-stone-200'}`}>
                                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ left: q.ai_chatbot_enabled ? '22px' : '2px' }} />
                                  </button>
                                </div>
                              </div>

                              {participantTypes.length > 0 && (
                                <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2">
                                  <h5 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5"><Users size={11} /> Assigned Types</h5>
                                  <div className="space-y-1.5">
                                    {participantTypes.map(pt => {
                                      const assigned = q.assigned_participant_types.includes(pt.id);
                                      return (
                                        <label key={pt.id} className="flex items-center gap-2 cursor-pointer group">
                                          <input
                                            type="checkbox"
                                            checked={assigned}
                                            onChange={() => {
                                              const newAssigned = assigned ? q.assigned_participant_types.filter(id => id !== pt.id) : [...q.assigned_participant_types, pt.id];
                                              updateQuestionnaire(q.id, { assigned_participant_types: newAssigned });
                                            }}
                                            className="w-4 h-4 rounded border-stone-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                          />
                                          <span className={`text-[12px] font-medium transition-colors ${assigned ? 'text-emerald-600' : 'text-stone-400 group-hover:text-stone-600'}`}>
                                            {pt.name}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Questions Panel */}
                          {openSection === 'questions' && renderQuestionsPanel(q)}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      </>
      )}
    </div>
  );
};

// Inline logic editor for a single question
const QuestionLogicEditor: React.FC<{
  question: any;
  allQuestions: any[];
  logicRules: any[];
  onUpdateLogic: (rules: any[]) => void;
}> = ({ question, allQuestions, logicRules, onUpdateLogic }) => {
  const questionRules = logicRules.filter(r => r.questionId === question.id);
  const [expanded, setExpanded] = useState(questionRules.length > 0);

  const addRule = () => {
    const targetQ = allQuestions.find(q => q.id !== question.id);
    const newRule = {
      id: `rule_${Date.now()}`,
      questionId: question.id,
      condition: 'equals',
      value: '',
      action: 'skip' as const,
      targetQuestionId: targetQ?.id || '',
    };
    onUpdateLogic([...logicRules, newRule]);
    setExpanded(true);
  };

  const updateRule = (ruleId: string, field: string, value: any) => {
    onUpdateLogic(logicRules.map(r => r.id === ruleId ? { ...r, [field]: value } : r));
  };

  const deleteRule = (ruleId: string) => {
    onUpdateLogic(logicRules.filter(r => r.id !== ruleId));
  };

  return (
    <div className="mt-3 border-t border-stone-200 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400 hover:text-stone-600 transition-colors"
      >
        {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <GitBranch size={11} />
        Logic Rules ({questionRules.length})
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {questionRules.map(rule => (
            <div key={rule.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 text-[11px]">
              <span className="text-stone-400 shrink-0">IF</span>
              <select value={rule.condition} onChange={(e) => updateRule(rule.id, 'condition', e.target.value)}
                className="px-1.5 py-1 rounded border border-stone-200 text-[11px] bg-white">
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="is_empty">Is Empty</option>
              </select>
              <input type="text" value={rule.value} onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                className="flex-1 min-w-0 px-1.5 py-1 rounded border border-stone-200 text-[11px]" placeholder="Value" />
              <select value={rule.action} onChange={(e) => updateRule(rule.id, 'action', e.target.value)}
                className="px-1.5 py-1 rounded border border-stone-200 text-[11px] bg-white">
                <option value="skip">Skip to</option>
                <option value="show">Show</option>
                <option value="hide">Hide</option>
              </select>
              <select value={rule.targetQuestionId} onChange={(e) => updateRule(rule.id, 'targetQuestionId', e.target.value)}
                className="px-1.5 py-1 rounded border border-stone-200 text-[11px] bg-white max-w-[120px]">
                {allQuestions.filter(q => q.id !== question.id).map((q, i) => (
                  <option key={q.id} value={q.id}>Question {allQuestions.indexOf(q) + 1}: {q.question_text?.substring(0, 20)}</option>
                ))}
              </select>
              <button onClick={() => deleteRule(rule.id)} className="p-0.5 rounded hover:bg-red-50">
                <Trash2 size={10} className="text-red-400" />
              </button>
            </div>
          ))}
          <button onClick={addRule} className="flex items-center gap-1 text-[11px] text-emerald-500 hover:text-emerald-600 font-medium">
            <Plus size={10} /> Add Logic Rule
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionnaireList;
