import React, { useState } from 'react';
import { Plus, Trash2, Clock, Bell, BellOff, ChevronDown, ChevronUp, Copy, GripVertical, FileText, Edit2, Users } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import CustomDropdown from './CustomDropdown';

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
}

const QuestionnaireList: React.FC<QuestionnaireListProps> = ({
  questionnaires, participantTypes, onUpdate, onEditQuestions, activeQuestionnaireId,
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
  };

  const duplicateQuestionnaire = (q: QuestionnaireConfig) => {
    const dup: QuestionnaireConfig = {
      ...q,
      id: crypto.randomUUID(),
      title: `${q.title} (Copy)`,
      order_index: questionnaires.length,
    };
    onUpdate([...questionnaires, dup]);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
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
            Add questionnaires like "Hourly Log", "Daily Log", etc.
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
                  const isActive = activeQuestionnaireId === q.id;
                  return (
                    <Draggable key={q.id} draggableId={q.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                            isActive ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-stone-100'
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
                              <button onClick={(e) => { e.stopPropagation(); onEditQuestions(q.id); }} className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors" title="Edit questions">
                                <Edit2 size={13} className="text-emerald-500" />
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
