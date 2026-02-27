import React, { useState } from 'react';
import { Plus, Trash2, Clock, Bell, BellOff, ChevronDown, ChevronUp, Copy, GripVertical, FileText, Edit2, Users, Mic, Settings, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import CustomDropdown from './CustomDropdown';
import { QUESTION_TYPE_DEFINITIONS } from '../constants/questionTypes';
import QuestionEditor from './QuestionEditor';

export interface QuestionnaireConfig {
  id: string;
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
}

interface QuestionnaireListProps {
  questionnaires: QuestionnaireConfig[];
  participantTypes: { id: string; name: string }[];
  onUpdate: (questionnaires: QuestionnaireConfig[]) => void;
  onEditQuestions: (questionnaireId: string) => void;
  activeQuestionnaireId: string | null;
  selectedQuestion: any | null;
  onSelectQuestion: (q: any | null) => void;
  onAddQuestion: (type: string) => void;
  onUpdateQuestion: (id: string, updates: any) => void;
  onDeleteQuestion: (id: string) => void;
  onMoveQuestion: (id: string, dir: 'up' | 'down') => void;
  onDuplicateQuestion: (q: any) => void;
  onQuestionDragEnd: (result: DropResult) => void;
  onCloseQuestionEditor: () => void;
  project: any;
}

const QuestionnaireList: React.FC<QuestionnaireListProps> = ({
  questionnaires, participantTypes, onUpdate, onEditQuestions, activeQuestionnaireId,
  selectedQuestion, onSelectQuestion, onAddQuestion, onUpdateQuestion, onDeleteQuestion,
  onMoveQuestion, onDuplicateQuestion, onQuestionDragEnd, onCloseQuestionEditor, project,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addQuestionnaire = () => {
    const num = questionnaires.length + 1;
    const newQ: QuestionnaireConfig = {
      id: crypto.randomUUID(),
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
    setExpandedId(newQ.id);
  };

  const updateQuestionnaire = (id: string, updates: Partial<QuestionnaireConfig>) => {
    onUpdate(questionnaires.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestionnaire = (id: string) => {
    onUpdate(questionnaires.filter(q => q.id !== id));
    if (expandedId === id) setExpandedId(null);
    if (activeQuestionnaireId === id) onCloseQuestionEditor();
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    // Delegate question drag to parent if it's a question drag
    if (result.type === 'QUESTION') {
      onQuestionDragEnd(result);
      return;
    }
    const items = Array.from(questionnaires);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    items.forEach((q, i) => q.order_index = i);
    onUpdate(items);
  };

  const frequencyOptions = [
    { value: 'once', label: 'One-time' },
    { value: 'hourly', label: 'Hourly' },
    { value: '2hours', label: 'Every 2 hours' },
    { value: '4hours', label: 'Every 4 hours' },
    { value: 'daily', label: 'Daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'weekly', label: 'Weekly' },
  ];

  const activeQ = activeQuestionnaireId ? questionnaires.find(q => q.id === activeQuestionnaireId) : null;

  // If editing a questionnaire's questions, show the question editor view
  if (activeQuestionnaireId && activeQ) {
    return (
      <div className="space-y-4">
        {/* Header bar */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-stone-200/60 shadow-sm">
          <button
            onClick={onCloseQuestionEditor}
            className="flex items-center gap-1.5 text-[13px] text-stone-500 hover:text-stone-700 font-medium"
          >
            <ChevronDown size={14} className="rotate-90" /> Back
          </button>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-stone-800">{activeQ.title}</h3>
            <p className="text-[11px] text-stone-400">{activeQ.questions.length} questions · {activeQ.frequency} · ~{activeQ.estimated_duration} min</p>
          </div>
          <CustomDropdown
            options={[
              { value: '', label: '+ Add Question' },
              ...QUESTION_TYPE_DEFINITIONS.map(def => ({
                value: def.type,
                label: def.label
              }))
            ]}
            value=""
            onChange={(value) => value && onAddQuestion(value)}
            placeholder="+ Add Question"
            buttonStyle={{ backgroundColor: '#10b981', color: 'white', borderRadius: '9999px', fontSize: '13px' }}
            className="w-full md:w-48"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm">
              <div className="p-4">
                {activeQ.questions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-stone-300" size={28} />
                    </div>
                    <p className="text-[13px] text-stone-400 font-light">
                      No questions yet. Add your first question above.
                    </p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onQuestionDragEnd}>
                    <Droppable droppableId="questions" type="QUESTION">
                      {(provided) => (
                        <div className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                          {activeQ.questions.map((question: any, index: number) => (
                            <Draggable key={question.id} draggableId={question.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`group p-4 rounded-xl border transition-all cursor-pointer ${
                                    selectedQuestion?.id === question.id
                                      ? 'border-emerald-300 bg-emerald-50/50 shadow-sm shadow-emerald-100'
                                      : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50/50'
                                  } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                  style={provided.draggableProps.style}
                                  onClick={() => onSelectQuestion(question)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <GripVertical size={14} className="text-stone-300" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                                            Q{index + 1}
                                          </span>
                                          {question.required && (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                                              Required
                                            </span>
                                          )}
                                          {question.allow_voice && (
                                            <Mic size={11} className="text-blue-400" />
                                          )}
                                          <span className="text-[9px] uppercase font-bold text-stone-300 bg-stone-50 px-1.5 py-0.5 rounded">
                                            {question.question_type?.replace(/_/g, ' ')}
                                          </span>
                                        </div>
                                        <h3 className="text-[13px] font-medium text-stone-700 leading-snug">
                                          {question.question_text}
                                        </h3>
                                        {question.options && question.options.length > 0 && (
                                          <div className="mt-2 space-y-0.5">
                                            {question.options.slice(0, 2).map((option: any) => (
                                              <div key={option.id} className="text-[12px] text-stone-400 flex items-center gap-1.5">
                                                <div className="w-3 h-3 rounded-full border border-stone-300" />
                                                {option.option_text}
                                              </div>
                                            ))}
                                            {question.options.length > 2 && (
                                              <div className="text-[11px] text-stone-300 ml-4">
                                                +{question.options.length - 2} more
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); onMoveQuestion(question.id, 'up'); }} disabled={index === 0}
                                        className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 transition-colors">
                                        <ChevronUp size={14} className="text-stone-400" />
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); onMoveQuestion(question.id, 'down'); }} disabled={index === activeQ.questions.length - 1}
                                        className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 transition-colors">
                                        <ChevronDown size={14} className="text-stone-400" />
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); onDuplicateQuestion(question); }}
                                        className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                                        <Copy size={14} className="text-stone-400" />
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); onDeleteQuestion(question.id); }}
                                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                        <Trash2 size={14} className="text-red-400" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-1">
            {selectedQuestion ? (
              <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm sticky top-24">
                <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-stone-800">Edit Question</h3>
                  <button onClick={() => onSelectQuestion(null)} className="p-1 rounded-lg hover:bg-stone-100">
                    <X size={14} className="text-stone-400" />
                  </button>
                </div>
                <div className="p-5">
                  <QuestionEditor
                    question={selectedQuestion}
                    project={project}
                    onUpdateQuestion={onUpdateQuestion}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-3">
                  <Settings size={20} className="text-stone-300" />
                </div>
                <p className="text-[13px] text-stone-400 font-light">Select a question to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: show questionnaire list
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[15px] font-semibold text-stone-800">Questionnaires</h3>
          <p className="text-[12px] text-stone-400 font-light mt-0.5">
            Each questionnaire has its own questions, schedule, and notification settings
          </p>
        </div>
        <button
          onClick={addQuestionnaire}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-200/50 transition-all"
        >
          <Plus size={14} /> Add Questionnaire
        </button>
      </div>

      {questionnaires.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-stone-300" />
          </div>
          <h2 className="text-[15px] font-semibold text-stone-700 mb-1">No Questionnaires</h2>
          <p className="text-[13px] text-stone-400 font-light">
            Add questionnaires like "Hourly Log", "Daily Log", "Screening", etc.
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questionnaire-list">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-emerald-50/30 rounded-2xl p-1 transition-colors' : ''}`}
              >
                {questionnaires.map((q, idx) => {
                  const isExpanded = expandedId === q.id;
                  return (
                    <Draggable key={q.id} draggableId={q.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                            'border-stone-100'
                          } ${snapshot.isDragging ? 'shadow-lg ring-2 ring-emerald-200' : ''}`}
                        >
                          {/* Header */}
                          <div
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50/50 transition-colors"
                            onClick={() => setExpandedId(isExpanded ? null : q.id)}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-stone-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical size={14} className="text-stone-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                                  Q{idx + 1}
                                </span>
                                <h4 className="text-[14px] font-semibold text-stone-800 truncate">{q.title}</h4>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                  <Clock size={10} /> {q.frequency === 'once' ? 'One-time' : q.frequency}
                                </span>
                                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                  <FileText size={10} /> {q.questions.length} questions
                                </span>
                                {q.notification_enabled ? (
                                  <span className="text-[11px] text-emerald-500 flex items-center gap-1">
                                    <Bell size={10} /> On
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-stone-300 flex items-center gap-1">
                                    <BellOff size={10} /> Off
                                  </span>
                                )}
                                {q.assigned_participant_types.length < participantTypes.length && participantTypes.length > 0 && (
                                  <span className="text-[11px] text-violet-500 flex items-center gap-1">
                                    <Users size={10} /> {q.assigned_participant_types.length}/{participantTypes.length}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={(e) => { e.stopPropagation(); onEditQuestions(q.id); }} className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors text-[12px] font-medium text-emerald-600 flex items-center gap-1" title="Edit questions">
                                <Edit2 size={12} /> Questions
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); duplicateQuestionnaire(q); }} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                                <Copy size={13} className="text-stone-400" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); removeQuestionnaire(q.id); }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                <Trash2 size={13} className="text-red-400" />
                              </button>
                              {isExpanded ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
                            </div>
                          </div>

                          {/* Expanded Settings */}
                          {isExpanded && (
                            <div className="border-t border-stone-100 px-4 py-4 space-y-4 bg-stone-50/30">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[12px] font-medium text-stone-400 mb-1">Title</label>
                                  <input type="text" value={q.title} onChange={(e) => updateQuestionnaire(q.id, { title: e.target.value })} className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                                </div>
                                <div>
                                  <label className="block text-[12px] font-medium text-stone-400 mb-1">Est. Duration (min)</label>
                                  <input type="number" value={q.estimated_duration} onChange={(e) => updateQuestionnaire(q.id, { estimated_duration: parseInt(e.target.value) || 5 })} className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[12px] font-medium text-stone-400 mb-1">Description</label>
                                <textarea value={q.description} onChange={(e) => updateQuestionnaire(q.id, { description: e.target.value })} className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" rows={2} placeholder="E.g., Log your activities and mood every hour..." />
                              </div>

                              {/* Schedule */}
                              <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-3">
                                <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} /> Schedule</h5>
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

                              {/* Notifications */}
                              <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-3">
                                <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5"><Bell size={12} /> Notifications</h5>
                                <div className="flex items-center justify-between">
                                  <div><p className="text-[12px] font-medium text-stone-700">Push Notifications</p><p className="text-[11px] text-stone-400">Remind participants when it's time to fill</p></div>
                                  <button onClick={() => updateQuestionnaire(q.id, { notification_enabled: !q.notification_enabled })} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${q.notification_enabled ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ left: q.notification_enabled ? '22px' : '2px' }} />
                                  </button>
                                </div>
                                {q.notification_enabled && (
                                  <div>
                                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Minutes before</label>
                                    <input type="number" value={q.notification_minutes_before} onChange={(e) => updateQuestionnaire(q.id, { notification_minutes_before: parseInt(e.target.value) || 5 })} className="w-24 px-2 py-1.5 rounded-lg text-[12px] border border-stone-200" />
                                  </div>
                                )}
                              </div>

                              {/* DND */}
                              <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-3">
                                <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5"><BellOff size={12} /> Do Not Disturb</h5>
                                <div className="flex items-center justify-between">
                                  <div><p className="text-[12px] font-medium text-stone-700">Allow DND</p><p className="text-[11px] text-stone-400">Participants can set quiet hours</p></div>
                                  <button onClick={() => updateQuestionnaire(q.id, { dnd_allowed: !q.dnd_allowed })} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${q.dnd_allowed ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ left: q.dnd_allowed ? '22px' : '2px' }} />
                                  </button>
                                </div>
                                {q.dnd_allowed && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-stone-400">Default:</span>
                                    <input type="time" value={q.dnd_default_start} onChange={(e) => updateQuestionnaire(q.id, { dnd_default_start: e.target.value })} className="px-2 py-1.5 rounded-lg text-[12px] border border-stone-200" />
                                    <span className="text-[11px] text-stone-400">to</span>
                                    <input type="time" value={q.dnd_default_end} onChange={(e) => updateQuestionnaire(q.id, { dnd_default_end: e.target.value })} className="px-2 py-1.5 rounded-lg text-[12px] border border-stone-200" />
                                  </div>
                                )}
                              </div>

                              {/* Participant Types */}
                              {participantTypes.length > 0 && (
                                <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2">
                                  <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5"><Users size={12} /> Assigned Participant Types</h5>
                                  <p className="text-[11px] text-stone-400">Only selected types will see this questionnaire</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {participantTypes.map(pt => {
                                      const assigned = q.assigned_participant_types.includes(pt.id);
                                      return (
                                        <button key={pt.id} onClick={() => {
                                          const newAssigned = assigned ? q.assigned_participant_types.filter(id => id !== pt.id) : [...q.assigned_participant_types, pt.id];
                                          updateQuestionnaire(q.id, { assigned_participant_types: newAssigned });
                                        }} className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${assigned ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'}`}>
                                          {pt.name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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
    </div>
  );
};

export default QuestionnaireList;
