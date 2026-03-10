/**
 * Survey Flow Visualizer — Visual node-based flow diagram with inline editing + drag reorder
 * 调查流程可视化 — 可视化节点流程图（支持内联编辑 + 拖拽排序）
 * Now includes popup and notification nodes for holistic research flow overview
 */
import React, { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { ArrowDown, ArrowRight, GitBranch, Shield, XCircle, Eye, EyeOff, ChevronRight, GripVertical, Layers, Plus, Trash2, Edit3, Bell, MessageSquare, Clock, Sparkles } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { LogicRule } from '../utils/logicEngine';
import type { NotificationConfig } from '../utils/notificationConfigSync';

// Popup type (simplified for flow display) / 弹窗类型（简化用于流程显示）
interface PopupSummary {
  id: string;
  title: string;
  questionnaire_id: string | null;
  enabled: boolean;
  trigger_type?: string;
}

interface SurveyFlowVisualizerProps {
  questionnaires: QuestionnaireConfig[];
  logicRules: LogicRule[];
  projectId?: string;
  onUpdateLogic?: (rules: LogicRule[]) => void;
  onReorderQuestionnaires?: (questionnaires: QuestionnaireConfig[]) => void;
  notifications?: NotificationConfig[];
  popups?: PopupSummary[];
}

const TYPE_COLORS: Record<string, string> = {
  text_short: '#3b82f6', text_long: '#3b82f6',
  single_choice: '#8b5cf6', multiple_choice: '#8b5cf6', dropdown: '#8b5cf6', checkbox_group: '#8b5cf6',
  slider: '#f59e0b', rating: '#f59e0b', likert_scale: '#f59e0b', nps: '#f59e0b', bipolar_scale: '#f59e0b',
  number: '#06b6d4', date: '#06b6d4', time: '#06b6d4', email: '#06b6d4', phone: '#06b6d4',
  matrix: '#ec4899', ranking: '#ec4899', constant_sum: '#ec4899',
  section_header: '#10b981', divider: '#d4d4d4', text_block: '#a8a29e', image_block: '#a8a29e',
  yes_no: '#8b5cf6', file_upload: '#06b6d4', signature: '#ec4899', address: '#06b6d4',
  card_sort: '#8b5cf6', tree_test: '#8b5cf6', first_click: '#8b5cf6', five_second_test: '#8b5cf6',
  heatmap: '#8b5cf6', preference_test: '#8b5cf6', prototype_test: '#8b5cf6',
  max_diff: '#ec4899', design_survey: '#ec4899', conjoint: '#ec4899', kano: '#ec4899',
  sus: '#f59e0b', csat: '#f59e0b', ces: '#f59e0b',
  video_block: '#6366f1', audio_block: '#6366f1', embed_block: '#6366f1',
};

const ACTION_ICONS: Record<string, { icon: typeof ArrowRight; color: string; label: string }> = {
  skip: { icon: ArrowRight, color: '#3b82f6', label: 'Skip' },
  show: { icon: Eye, color: '#10b981', label: 'Show' },
  hide: { icon: EyeOff, color: '#f59e0b', label: 'Hide' },
  disqualify: { icon: XCircle, color: '#ef4444', label: 'Disqualify' },
  end_survey: { icon: Shield, color: '#ef4444', label: 'End' },
};

const CONDITIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
];

const ACTIONS = [
  { value: 'skip', label: 'Skip to' },
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
  { value: 'disqualify', label: 'Disqualify' },
  { value: 'end_survey', label: 'End Survey' },
  { value: 'show_questionnaire', label: 'Show Questionnaire' },
  { value: 'hide_questionnaire', label: 'Hide Questionnaire' },
];

const SurveyFlowVisualizer: React.FC<SurveyFlowVisualizerProps> = ({
  questionnaires, logicRules, projectId, onUpdateLogic, onReorderQuestionnaires,
  notifications = [], popups = [],
}) => {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const allQuestions = useMemo(() => {
    return questionnaires.flatMap(qc =>
      (qc.questions || []).map(q => ({ ...q, questionnaireName: qc.title, questionnaireId: qc.id }))
    );
  }, [questionnaires]);

  const logicBySource = useMemo(() => {
    const map = new Map<string, LogicRule[]>();
    logicRules.forEach(rule => {
      const existing = map.get(rule.sourceQuestionId) || [];
      existing.push(rule);
      map.set(rule.sourceQuestionId, existing);
    });
    return map;
  }, [logicRules]);

  const groupedQuestions = useMemo(() => {
    return questionnaires.map(qc => ({
      id: qc.id,
      title: qc.title,
      type: qc.questionnaire_type,
      questions: (qc.questions || []).filter(q => q.question_type !== 'section_header'),
    }));
  }, [questionnaires]);

  // Group notifications by questionnaire / 按问卷分组通知
  const notifsByQuestionnaire = useMemo(() => {
    const map = new Map<string, NotificationConfig[]>();
    const projectLevel: NotificationConfig[] = [];
    notifications.forEach(n => {
      if (n.questionnaire_id) {
        const arr = map.get(n.questionnaire_id) || [];
        arr.push(n);
        map.set(n.questionnaire_id, arr);
      } else {
        projectLevel.push(n);
      }
    });
    return { byQuestionnaire: map, projectLevel };
  }, [notifications]);

  // Group popups by linked questionnaire / 按关联问卷分组弹窗
  const popupsByQuestionnaire = useMemo(() => {
    const map = new Map<string, PopupSummary[]>();
    const unlinked: PopupSummary[] = [];
    popups.forEach(p => {
      if (p.questionnaire_id) {
        const arr = map.get(p.questionnaire_id) || [];
        arr.push(p);
        map.set(p.questionnaire_id, arr);
      } else {
        unlinked.push(p);
      }
    });
    return { byQuestionnaire: map, unlinked };
  }, [popups]);

  const getQuestionLabel = (id: string) => {
    const q = allQuestions.find(q => q.id === id);
    return q ? (q.question_text || 'Untitled').substring(0, 40) : id.substring(0, 8);
  };

  const updateRule = (ruleId: string, field: string, value: any) => {
    if (!onUpdateLogic) return;
    onUpdateLogic(logicRules.map(r => r.id === ruleId ? { ...r, [field]: value } : r));
  };

  const deleteRule = (ruleId: string) => {
    if (!onUpdateLogic) return;
    onUpdateLogic(logicRules.filter(r => r.id !== ruleId));
    if (editingRuleId === ruleId) setEditingRuleId(null);
  };

  const addRuleForQuestion = (questionId: string, questionnaireId: string) => {
    if (!onUpdateLogic || !projectId) return;
    const newRule: LogicRule = {
      id: crypto.randomUUID(),
      projectId,
      questionnaireId,
      sourceQuestionId: questionId,
      condition: 'equals',
      value: '',
      action: 'skip',
      targetQuestionId: '',
      orderIndex: logicRules.length,
      enabled: true,
    };
    onUpdateLogic([...logicRules, newRule]);
    setEditingRuleId(newRule.id);
  };

  // Drag-and-drop handler / 拖拽排序处理
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorderQuestionnaires) return;
    if (result.source.index === result.destination.index) return;
    const newList = [...questionnaires];
    const [moved] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, moved);
    const reindexed = newList.map((q, i) => ({ ...q, order_index: i }));
    onReorderQuestionnaires(reindexed);
  };

  if (questionnaires.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <GitBranch size={32} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">No questionnaires to visualize</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend / 图例 */}
      <div className="flex flex-wrap gap-3 text-[10px]">
        {[
          { label: 'Text', color: '#3b82f6' },
          { label: 'Choice', color: '#8b5cf6' },
          { label: 'Scale', color: '#f59e0b' },
          { label: 'Media', color: '#6366f1' },
          { label: 'Notification', color: '#0ea5e9' },
          { label: 'Popup', color: '#a855f7' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-stone-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Project-level popups (unlinked) / 项目级弹窗（未关联问卷） */}
      {popupsByQuestionnaire.unlinked.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-purple-500" />
            <span className="text-xs font-semibold text-stone-700">Project Popups</span>
            <span className="text-[10px] text-stone-300">{popupsByQuestionnaire.unlinked.length} popup{popupsByQuestionnaire.unlinked.length > 1 ? 's' : ''}</span>
          </div>
          <div className="ml-4 space-y-1">
            {popupsByQuestionnaire.unlinked.map(popup => (
              <div key={popup.id} className={`flex items-center gap-2 py-1.5 px-3 rounded-lg bg-purple-50/50 ${!popup.enabled ? 'opacity-40' : ''}`}>
                <MessageSquare size={10} className="text-purple-500" />
                <span className="text-[11px] text-stone-600">{popup.title}</span>
                {popup.trigger_type && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-500">{popup.trigger_type}</span>}
                {!popup.enabled && <span className="text-[9px] text-stone-300 italic">disabled</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-center py-2"><ArrowDown size={16} className="text-stone-300" /></div>
        </div>
      )}

      {/* Project-level notifications / 项目级通知 */}
      {notifsByQuestionnaire.projectLevel.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} className="text-sky-500" />
            <span className="text-xs font-semibold text-stone-700">Project Notifications</span>
            <span className="text-[10px] text-stone-300">{notifsByQuestionnaire.projectLevel.length} notification{notifsByQuestionnaire.projectLevel.length > 1 ? 's' : ''}</span>
          </div>
          <div className="ml-4 space-y-1">
            {notifsByQuestionnaire.projectLevel.map(notif => (
              <div key={notif.id} className={`flex items-center gap-2 py-1.5 px-3 rounded-lg bg-sky-50/50 ${!notif.enabled ? 'opacity-40' : ''}`}>
                <Bell size={10} className="text-sky-500" />
                <span className="text-[11px] text-stone-600">{notif.title || 'Untitled'}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-500">
                  {notif.schedule_mode === 'specific_times' ? `${notif.specific_times?.length || 0} times` : notif.frequency}
                </span>
                {!notif.enabled && <span className="text-[9px] text-stone-300 italic">disabled</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-center py-2"><ArrowDown size={16} className="text-stone-300" /></div>
        </div>
      )}

      {/* Flow diagram with drag-and-drop / 可拖拽流程图 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="flow-questionnaires">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="relative">
              {groupedQuestions.map((group, gi) => {
                const qNotifs = notifsByQuestionnaire.byQuestionnaire.get(group.id) || [];
                const qPopups = popupsByQuestionnaire.byQuestionnaire.get(group.id) || [];

                return (
                  <Draggable key={group.id} draggableId={group.id} index={gi} isDragDisabled={!onReorderQuestionnaires}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`mb-8 transition-shadow ${dragSnapshot.isDragging ? 'bg-white rounded-xl shadow-lg ring-2 ring-emerald-500/30 p-3' : ''}`}
                      >
                        {/* Questionnaire header with drag handle / 问卷标题带拖拽手柄 */}
                        <div className="flex items-center gap-2 mb-3 group/header">
                          {onReorderQuestionnaires && questionnaires.length > 1 && (
                            <div
                              {...dragProvided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-stone-100 transition-colors"
                              title="Drag to reorder"
                            >
                              <GripVertical size={14} className="text-stone-400" />
                            </div>
                          )}
                          <Layers size={14} className="text-emerald-500" />
                          <span className="text-xs font-semibold text-stone-700">{group.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-400">{group.type}</span>
                          <span className="text-[10px] text-stone-300">{group.questions.length} questions</span>
                          {qNotifs.length > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-500 flex items-center gap-0.5">
                              <Bell size={8} /> {qNotifs.length}
                            </span>
                          )}
                          {qPopups.length > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-500 flex items-center gap-0.5">
                              <MessageSquare size={8} /> {qPopups.length}
                            </span>
                          )}
                        </div>

                        {/* Linked popups for this questionnaire / 关联此问卷的弹窗 */}
                        {qPopups.length > 0 && (
                          <div className="ml-4 mb-2 space-y-1">
                            {qPopups.map(popup => (
                              <div key={popup.id} className={`flex items-center gap-2 py-1 px-3 rounded-lg bg-purple-50/30 border border-purple-100 ${!popup.enabled ? 'opacity-40' : ''}`}>
                                <MessageSquare size={10} className="text-purple-400" />
                                <span className="text-[10px] text-purple-600 font-medium">Popup: {popup.title}</span>
                                {popup.trigger_type && <span className="text-[9px] px-1 rounded bg-purple-100 text-purple-500">{popup.trigger_type}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Questions flow / 问题流 */}
                        <div className="ml-4 border-l-2 border-stone-200 pl-6 space-y-1">
                          {group.questions.map((q, qi) => {
                            const rules = logicBySource.get(q.id) || [];
                            const color = TYPE_COLORS[q.question_type] || '#a8a29e';
                            const isLayout = ['text_block', 'divider', 'image_block', 'instruction'].includes(q.question_type);

                            return (
                              <div key={q.id} className="relative">
                                <div className="absolute -left-[31px] top-3 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: color }} />
                                <div className={`group flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-stone-50/80 transition-colors ${isLayout ? 'opacity-50' : ''}`}>
                                  <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                                    {qi + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-medium text-stone-700 truncate">
                                      {q.question_text || <span className="italic text-stone-300">Untitled</span>}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-stone-400">{q.question_type}</span>
                                      {q.required && <span className="text-[9px] px-1 rounded bg-red-50 text-red-400 font-medium">REQ</span>}
                                      {rules.length > 0 && (
                                        <span className="text-[9px] px-1 rounded bg-blue-50 text-blue-500 font-medium flex items-center gap-0.5">
                                          <GitBranch size={8} /> {rules.length} rule{rules.length > 1 ? 's' : ''}
                                        </span>
                                      )}
                                      {onUpdateLogic && (
                                        <button
                                          onClick={() => addRuleForQuestion(q.id, group.id)}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-500 hover:bg-emerald-100 flex items-center gap-0.5"
                                        >
                                          <Plus size={8} /> Rule
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Logic rule branches / 逻辑规则分支 */}
                                {rules.map(rule => {
                                  const actionInfo = ACTION_ICONS[rule.action] || ACTION_ICONS.skip;
                                  const ActionIcon = actionInfo.icon;
                                  const isEditing = editingRuleId === rule.id;
                                  const isDisabled = !rule.enabled;

                                  return (
                                    <div key={rule.id} className={`ml-9 ${isDisabled ? 'opacity-40' : ''}`}>
                                      <div className="flex items-center gap-2 py-1 text-[10px] group/rule">
                                        <div className="w-8 border-t border-dashed" style={{ borderColor: actionInfo.color }} />
                                        <ActionIcon size={10} style={{ color: actionInfo.color }} />
                                        <span style={{ color: actionInfo.color }} className="font-medium">{actionInfo.label}</span>
                                        {isDisabled && <span className="text-stone-300 italic">(disabled)</span>}
                                        <span className="text-stone-400">
                                          if {rule.condition} "{String(rule.value).substring(0, 20)}"
                                        </span>
                                        {rule.targetQuestionId && (
                                          <>
                                            <ChevronRight size={10} className="text-stone-300" />
                                            <span className="text-stone-500 font-medium truncate max-w-[200px]">
                                              {getQuestionLabel(rule.targetQuestionId)}
                                            </span>
                                          </>
                                        )}
                                        {onUpdateLogic && (
                                          <div className="opacity-0 group-hover/rule:opacity-100 transition-opacity flex items-center gap-0.5 ml-auto">
                                            <button onClick={() => setEditingRuleId(isEditing ? null : rule.id)} className="p-0.5 rounded hover:bg-stone-100">
                                              <Edit3 size={9} className="text-stone-400" />
                                            </button>
                                            <button onClick={() => deleteRule(rule.id)} className="p-0.5 rounded hover:bg-red-50">
                                              <Trash2 size={9} className="text-red-400" />
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {isEditing && onUpdateLogic && (
                                        <div className="ml-10 mt-1 mb-2 p-2.5 bg-stone-50 rounded-lg border border-stone-200 grid grid-cols-4 gap-2">
                                          <div>
                                            <label className="block text-[9px] text-stone-400 mb-0.5">Condition</label>
                                            <CustomDropdown options={CONDITIONS} value={rule.condition} onChange={(v) => updateRule(rule.id, 'condition', v)} placeholder="Condition" />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] text-stone-400 mb-0.5">Value</label>
                                            <input type="text" value={rule.value} onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                                              className="w-full px-2 py-1.5 rounded-lg text-[11px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Value..." />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] text-stone-400 mb-0.5">Action</label>
                                            <CustomDropdown options={ACTIONS} value={rule.action} onChange={(v) => updateRule(rule.id, 'action', v)} placeholder="Action" />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] text-stone-400 mb-0.5">Target</label>
                                            <CustomDropdown
                                              options={allQuestions.map((tq, i) => ({ value: tq.id, label: `Q${i + 1}: ${(tq.question_text || '').substring(0, 20)}` }))}
                                              value={rule.targetQuestionId || ''}
                                              onChange={(v) => updateRule(rule.id, 'targetQuestionId', v)}
                                              placeholder="Target..."
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>

                        {/* Linked notifications for this questionnaire / 关联此问卷的通知 */}
                        {qNotifs.length > 0 && (
                          <div className="ml-4 mt-2 space-y-1">
                            {qNotifs.map(notif => (
                              <div key={notif.id} className={`flex items-center gap-2 py-1 px-3 rounded-lg bg-sky-50/30 border border-sky-100 ${!notif.enabled ? 'opacity-40' : ''}`}>
                                <Bell size={10} className="text-sky-400" />
                                <span className="text-[10px] text-sky-600 font-medium">{notif.title || 'Notification'}</span>
                                <Clock size={8} className="text-sky-400" />
                                <span className="text-[9px] text-sky-500">
                                  {notif.schedule_mode === 'specific_times' ? `${notif.specific_times?.length || 0} times` : notif.frequency}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Arrow to next questionnaire / 连接箭头 */}
                        {gi < groupedQuestions.length - 1 && !dragSnapshot.isDragging && (
                          <div className="flex justify-center py-2">
                            <ArrowDown size={16} className="text-stone-300" />
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}

              {/* End node / 结束节点 */}
              <div className="flex items-center gap-2 ml-4">
                <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center">
                  <Shield size={14} className="text-white" />
                </div>
                <span className="text-xs font-medium text-stone-500">Survey Complete</span>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SurveyFlowVisualizer;
