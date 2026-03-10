import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Copy, Trash2, Clock, Calendar, GripVertical, Edit2 } from 'lucide-react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: any[];
  estimated_duration: number;
}

interface ScheduleItem {
  id: string;
  questionnaire_id: string;
  day_number: number;
  scheduled_time: string;
  notification_enabled: boolean;
  notification_minute_before: number;
  questionnaire?: Questionnaire;
}

interface QuestionnaireSchedulerProps {
  projectId: string;
  studyDuration: number; // Total days in study
  showLibraryOnly?: boolean;
  showScheduleOnly?: boolean;
}

const DraggableQuestionnaireCard: React.FC<{
  questionnaire: Questionnaire;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}> = ({ questionnaire, isSelected, onSelect, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: questionnaire.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isSelected ? 'var(--color-green)' : 'var(--bg-secondary)',
    border: isSelected ? '2px solid var(--color-green)' : '2px dashed var(--border-light)',
    color: isSelected ? 'white' : 'inherit',
    transition: 'all 0.2s ease',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      className="p-4 rounded-lg hover:shadow-md cursor-move touch-none"
    >
      <div className="flex items-start gap-2" style={{ pointerEvents: 'none' }}>
        <GripVertical size={16} style={{ color: 'var(--text-secondary)' }} />
        <div className="flex-1">
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{questionnaire.title}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{questionnaire.description}</div>
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Clock size={12} />
            <span>{questionnaire.estimated_duration} min</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 rounded hover:opacity-70"
          style={{ pointerEvents: 'auto' }}
        >
          <Edit2 size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>
    </div>
  );
};

const DroppableTimelineCell: React.FC<{
  dayNumber: number;
  timeSlot: string;
  scheduleItem?: ScheduleItem;
  isOver: boolean;
  onTapSchedule: (e: React.MouseEvent) => void;
  onRemove?: () => void;
}> = ({ dayNumber, timeSlot, scheduleItem, isOver, onTapSchedule, onRemove }) => {
  const { setNodeRef } = useDroppable({
    id: `day-${dayNumber}-time-${timeSlot}`,
  });

  const cellStyle = {
    backgroundColor: isOver ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
    border: isOver ? '2px dashed var(--color-green)' : '1px solid var(--border-light)',
    transform: isOver ? 'scale(0.98)' : 'scale(1)',
    transition: 'all 0.2s ease',
  };

  return (
    <td
      ref={setNodeRef}
      className="p-2 text-center cursor-pointer relative"
      style={cellStyle}
      onClick={onTapSchedule}
    >
      {scheduleItem ? (
        <div
          className="p-2 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--color-green)',
            color: 'white',
            animation: 'dropIn 0.3s ease-out',
          }}
        >
          <div className="font-medium">{scheduleItem.questionnaire?.title}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="mt-1 p-1 rounded hover:opacity-70"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ) : (
        <div className="h-16" />
      )}
    </td>
  );
};

const QuestionnaireScheduler: React.FC<QuestionnaireSchedulerProps> = ({ 
  projectId, 
  studyDuration = 7,
  showLibraryOnly = false,
  showScheduleOnly = false
}) => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<Questionnaire | ScheduleItem | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const timeSlots = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const { data: questionnaireData, error: qError } = await supabase
        .from('questionnaire')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (!qError && questionnaireData) {
        setQuestionnaires(questionnaireData);
      } else {
        setQuestionnaires([]);
      }

      const { data: scheduleData } = await supabase
        .from('questionnaire_schedule')
        .select('*, questionnaire:questionnaire(*)')
        .eq('project_id', projectId)
        .order('day_number', { ascending: true });

      if (scheduleData) {
        setSchedule(scheduleData);
      }
    } catch (error) {
      // Silent error handling for production
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);
    const item = questionnaires.find(q => q.id === active.id) || schedule.find(s => s.id === active.id);
    setDraggedItem(item || null);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    setOverId(over?.id || null);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    setDraggedItem(null);

    if (!over || !active) return;

    // Parse drop target ID (format: "day-{day}-time-{time}")
    const dropId = over.id;
    if (typeof dropId === 'string' && dropId.startsWith('day-')) {
      const parts = dropId.split('-');
      const dayNumber = parseInt(parts[1]);
      const timeSlot = parts[3];

      // Find the dragged questionnaire
      const draggedQuestionnaire = questionnaires.find(q => q.id === active.id);
      if (draggedQuestionnaire) {
        await handleDrop(dayNumber, timeSlot);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
    setDraggedItem(null);
  };

  const handleTapSchedule = async (e: React.MouseEvent, dayNumber: number, timeSlot: string) => {
    e.stopPropagation();
    if (!selectedQuestionnaire) return;

    try {
      const { error } = await supabase
        .from('questionnaire_schedule')
        .insert({
          project_id: projectId,
          questionnaire_id: selectedQuestionnaire.id,
          day_number: dayNumber,
          scheduled_time: timeSlot,
          notification_enabled: true,
          notification_minute_before: 15
        });

      if (!error) {
        await loadData();
        setSelectedQuestionnaire(null);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const handleDrop = async (dayNumber: number, timeSlot: string) => {
    if (!draggedItem) return;

    try {
      // If dragging from library, create new schedule item
      if ('questions' in draggedItem) {
        const { error } = await supabase
          .from('questionnaire_schedule')
          .insert({
            project_id: projectId,
            questionnaire_id: draggedItem.id,
            day_number: dayNumber,
            scheduled_time: timeSlot,
            notification_enabled: true,
            notification_minute_before: 15
          });

        if (!error) {
          await loadData();
        }
      } else {
        // If dragging from schedule, update existing item
        const { error } = await supabase
          .from('questionnaire_schedule')
          .update({
            day_number: dayNumber,
            scheduled_time: timeSlot
          })
          .eq('id', draggedItem.id);

        if (!error) {
          await loadData();
        }
      }
    } catch (error) {
      console.error('Error dropping item:', error);
    } finally {
      setDraggedItem(null);
    }
  };


  const removeScheduleItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('questionnaire_schedule')
        .delete()
        .eq('id', id);

      if (!error) {
        await loadData();
      }
    } catch (error) {
      console.error('Error removing schedule item:', error);
    }
  };

  const copyDaySchedule = (dayNumber: number) => {
    setCopiedDay(dayNumber);
  };

  const pasteDaySchedule = async (targetDay: number) => {
    if (copiedDay === null) return;

    try {
      // Get items from copied day
      const itemsToCopy = schedule.filter(s => s.day_number === copiedDay);

      // Insert new items for target day
      const newItems = itemsToCopy.map(item => ({
        project_id: projectId,
        questionnaire_id: item.questionnaire_id,
        day_number: targetDay,
        scheduled_time: item.scheduled_time,
        notification_enabled: item.notification_enabled,
        notification_minute_before: item.notification_minute_before
      }));

      const { error } = await supabase
        .from('questionnaire_schedule')
        .insert(newItems);

      if (!error) {
        await loadData();
      }
    } catch (error) {
      console.error('Error pasting schedule:', error);
    }
  };

  const getScheduleForDayAndTime = (day: number, time: string): ScheduleItem | undefined => {
    return schedule.find(s => {
      const scheduleTime = s.scheduled_time.substring(0, 5); // Get HH:MM from HH:MM:SS
      return s.day_number === day && scheduleTime === time;
    });
  };

  const createQuestionnaire = async (title: string, description: string) => {
    try {
      // Auto-number questionnaires: Questionnaire 1, Questionnaire 2, etc.
      const questionnaireNumber = questionnaires.length + 1;
      const autoTitle = title || `Questionnaire ${questionnaireNumber}`;
      const autoDescription = description || `Questionnaire ${questionnaireNumber} for this study`;

      const { data: newQuestionnaire, error } = await supabase
        .from('questionnaire')
        .insert({
          project_id: projectId,
          title: autoTitle,
          description: autoDescription,
          question: [],
          estimated_duration: 10
        })
        .select()
        .single();

      if (!error && newQuestionnaire) {
        await loadData();
        setShowQuestionnaireModal(false);
        // Edit questionnaire will open the editor
        setEditingQuestionnaire(newQuestionnaire);
      }
    } catch (error) {
      console.error('Error creating questionnaire:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
      </div>
    );
  }

  // If both are true or both are false, show both (default behavior)
  const showBoth = (!showLibraryOnly && !showScheduleOnly) || (showLibraryOnly && showScheduleOnly);
  const showLibrary = showLibraryOnly || showBoth;
  const showSchedule = showScheduleOnly || showBoth;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <style>{`
        @keyframes dropIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          50% {
            transform: scale(1.05) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
      <div className={showBoth ? "flex flex-col md:flex-row gap-6 h-full" : ""} >
      {/* Questionnaire Library Sidebar */}
      {showLibrary && (
      <div className={showBoth ? "w-full md:w-80 bg-white rounded-xl p-4 md:p-6" : "bg-white rounded-xl p-4 md:p-6"} style={{ border: '1px solid var(--border-light)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Questionnaire Library
          </h3>
          <button
            onClick={() => setShowQuestionnaireModal(true)}
            className="p-2 rounded-lg hover:opacity-80"
            style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {questionnaires.map(q => (
            <DraggableQuestionnaireCard
              key={q.id}
              questionnaire={q}
              isSelected={selectedQuestionnaire?.id === q.id}
              onSelect={() => setSelectedQuestionnaire(selectedQuestionnaire?.id === q.id ? null : q)}
              onEdit={() => setEditingQuestionnaire(q)}
            />
          ))}
        </div>
      </div>
      )}

      {/* Timeline Grid */}
      {showSchedule && (
      <div className="flex-1 bg-white rounded-xl p-4 md:p-6 overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
        <h3 className="font-bold text-base md:text-lg mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>
          Study Schedule
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          Drag questionnaires from library above to schedule them
        </p>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left" style={{ color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-light)' }}>
                  Time
                </th>
                {Array.from({ length: studyDuration }, (_, i) => i + 1).map(day => (
                  <th
                    key={day}
                    className="p-3 text-center min-w-[120px]"
                    style={{ color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-light)' }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Day {day}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyDaySchedule(day)}
                          className="p-1 rounded hover:opacity-70"
                          title="Copy day schedule"
                        >
                          <Copy size={14} style={{ color: copiedDay === day ? 'var(--color-green)' : 'var(--text-secondary)' }} />
                        </button>
                        {copiedDay !== null && (
                          <button
                            onClick={() => pasteDaySchedule(day)}
                            className="p-1 rounded hover:opacity-70"
                            title="Paste day schedule"
                            style={{ color: 'var(--color-green)' }}
                          >
                            Paste
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="p-3 font-semibold" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                    {time}
                  </td>
                  {Array.from({ length: studyDuration }, (_, i) => i + 1).map(day => {
                    const scheduleItem = getScheduleForDayAndTime(day, time);
                    const cellId = `day-${day}-time-${time}`;
                    const isOver = overId === cellId;
                    return (
                      <DroppableTimelineCell
                        key={cellId}
                        dayNumber={day}
                        timeSlot={time}
                        scheduleItem={scheduleItem}
                        isOver={isOver}
                        onTapSchedule={(e) => handleTapSchedule(e, day, time)}
                        onRemove={scheduleItem ? () => removeScheduleItem(scheduleItem.id) : undefined}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Create Questionnaire Modal */}
      {showQuestionnaireModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Create Questionnaire
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createQuestionnaire(
                formData.get('title') as string,
                formData.get('description') as string
              );
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Title (optional - auto-numbered)
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder={`Questionnaire ${questionnaires.length + 1}`}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ border: '1px solid var(--border-light)' }}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief description of this questionnaire"
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ border: '1px solid var(--border-light)' }}
                />
              </div>
              <div className="text-sm mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                After creating, you'll be able to add questions to this questionnaire using the full question editor.
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: 'var(--color-green)' }}
                >
                  Create & Add Questions
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuestionnaireModal(false)}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ border: '1px solid var(--border-light)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questionnaire Editor Modal */}
      {editingQuestionnaire && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {editingQuestionnaire.title}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {editingQuestionnaire.description}
                </p>
              </div>
              <button
                onClick={() => setEditingQuestionnaire(null)}
                className="p-2 rounded-lg hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24' }}>
              <p className="text-sm font-medium" style={{ color: '#92400e' }}>
                ⚠️ To add questions to this questionnaire:
              </p>
              <ol className="text-sm mt-2 ml-4 list-decimal" style={{ color: '#92400e' }}>
                <li>Go to the main project editor (Questions tab)</li>
                <li>Click "+ Add Question" and create your questions</li>
                <li>Questions will be available for all questionnaires in this study</li>
                <li>Return here to schedule this questionnaire on specific days</li>
              </ol>
              <p className="text-sm mt-3 font-medium" style={{ color: '#92400e' }}>
                💡 For longitudinal studies: Each questionnaire can be scheduled independently on different days/times
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Questionnaire Title</label>
                <input
                  type="text"
                  value={editingQuestionnaire.title}
                  onChange={async (e) => {
                    const newTitle = e.target.value;
                    setEditingQuestionnaire({ ...editingQuestionnaire, title: newTitle });
                    await supabase
                      .from('questionnaire')
                      .update({ title: newTitle })
                      .eq('id', editingQuestionnaire.id);
                    await loadData();
                  }}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ border: '1px solid var(--border-light)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  value={editingQuestionnaire.description}
                  onChange={async (e) => {
                    const newDesc = e.target.value;
                    setEditingQuestionnaire({ ...editingQuestionnaire, description: newDesc });
                    await supabase
                      .from('questionnaire')
                      .update({ description: newDesc })
                      .eq('id', editingQuestionnaire.id);
                    await loadData();
                  }}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ border: '1px solid var(--border-light)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Estimated Duration (minutes)</label>
                <input
                  type="number"
                  value={editingQuestionnaire.estimated_duration}
                  onChange={async (e) => {
                    const newDuration = parseInt(e.target.value) || 10;
                    setEditingQuestionnaire({ ...editingQuestionnaire, estimated_duration: newDuration });
                    await supabase
                      .from('questionnaire')
                      .update({ estimated_duration: newDuration })
                      .eq('id', editingQuestionnaire.id);
                    await loadData();
                  }}
                  min="1"
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ border: '1px solid var(--border-light)' }}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingQuestionnaire(null)}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                Done
              </button>
              <button
                onClick={async () => {
                  if (confirm('Delete this questionnaire? This will also remove all scheduled instances.')) {
                    await supabase.from('questionnaire_schedule').delete().eq('questionnaire_id', editingQuestionnaire.id);
                    await supabase.from('questionnaire').delete().eq('id', editingQuestionnaire.id);
                    await loadData();
                    setEditingQuestionnaire(null);
                  }
                }}
                className="px-4 py-2 rounded-lg font-medium text-red-500"
                style={{ border: '1px solid var(--border-light)' }}
              >
                Delete Questionnaire
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      
      <DragOverlay>
        {activeId && draggedItem && 'questions' in draggedItem ? (
          <div
            className="p-4 rounded-lg shadow-2xl cursor-move"
            style={{
              backgroundColor: 'var(--color-green)',
              border: '2px solid var(--color-green)',
              color: 'white',
              opacity: 0.9,
              transform: 'rotate(-3deg)',
            }}
          >
            <div className="flex items-start gap-2">
              <GripVertical size={16} />
              <div className="flex-1">
                <div className="font-semibold">{draggedItem.title}</div>
                <div className="text-sm opacity-90">{draggedItem.description}</div>
                <div className="flex items-center gap-1 mt-2 text-xs">
                  <Clock size={12} />
                  <span>{draggedItem.estimated_duration} min</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default QuestionnaireScheduler;
