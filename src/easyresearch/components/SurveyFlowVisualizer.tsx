/**
 * Survey Flow Visualizer — Visual node-based flow diagram with inline editing + reorder
 * 调查流程可视化 — 可视化节点流程图（支持内联编辑 + 排序）
 */
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, GitBranch, Shield, XCircle, Eye, EyeOff, ChevronRight, ChevronUp, ChevronDown, Layers, Plus, Trash2, Edit3 } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { LogicRule } from '../utils/logicEngine';

interface SurveyFlowVisualizerProps {
  questionnaires: QuestionnaireConfig[];
  logicRules: LogicRule[];
  projectId?: string;
  onUpdateLogic?: (rules: LogicRule[]) => void;
  onReorderQuestionnaires?: (questionnaires: QuestionnaireConfig[]) => void;
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

const SurveyFlowVisualizer: React.FC<SurveyFlowVisualizerProps> = ({ questionnaires, logicRules, projectId, onUpdateLogic, onReorderQuestionnaires }) => {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Build flat question list / 构建扁平问题列表
  const allQuestions = useMemo(() => {
    return questionnaires.flatMap(qc =>
      (qc.questions || []).map(q => ({ ...q, questionnaireName: qc.title, questionnaireId: qc.id }))
    );
  }, [questionnaires]);

  // Build logic map: source question → rules (show ALL rules, not just enabled)
  // 构建逻辑映射：源问题 → 规则（显示所有规则，不仅是启用的）
  const logicBySource = useMemo(() => {
    const map = new Map<string, LogicRule[]>();
    logicRules.forEach(rule => {
      const existing = map.get(rule.sourceQuestionId) || [];
      existing.push(rule);
      map.set(rule.sourceQuestionId, existing);
    });
    return map;
  }, [logicRules]);

  // Group questions by questionnaire / 按问卷分组问题
  const groupedQuestions = useMemo(() => {
    return questionnaires.map(qc => ({
      id: qc.id,
      title: qc.title,
      type: qc.questionnaire_type,
      questions: (qc.questions || []).filter(q => q.question_type !== 'section_header'),
    }));
  }, [questionnaires]);

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

  // Reorder questionnaires / 重新排序问卷
  const moveQuestionnaire = (index: number, direction: 'up' | 'down') => {
    if (!onReorderQuestionnaires) return;
    const newList = [...questionnaires];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    // Update order_index / 更新排序索引
    const reindexed = newList.map((q, i) => ({ ...q, order_index: i }));
    onReorderQuestionnaires(reindexed);
  };

  if (questionnaires.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <GitBranch size={32} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">No questionnaires to visualize / 无问卷可视化</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend — simplified: only Text, Choice, Scale, Media */}
      <div className="flex flex-wrap gap-3 text-[10px]">
        {[
          { label: 'Text / 文本', color: '#3b82f6' },
          { label: 'Choice / 选择', color: '#8b5cf6' },
          { label: 'Scale / 量表', color: '#f59e0b' },
          { label: 'Media / 媒体', color: '#6366f1' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-stone-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Flow diagram / 流程图 */}
      <div className="relative">
        {groupedQuestions.map((group, gi) => (
          <div key={group.id} className="mb-8">
            {/* Questionnaire header with reorder buttons / 问卷标题带排序按钮 */}
            <div className="flex items-center gap-2 mb-3">
              <Layers size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-stone-700">{group.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-400">{group.type}</span>
              <span className="text-[10px] text-stone-300">{group.questions.length} questions</span>
              {/* Reorder buttons / 排序按钮 */}
              {onReorderQuestionnaires && questionnaires.length > 1 && (
                <div className="flex items-center gap-0.5 ml-auto">
                  <button
                    onClick={() => moveQuestionnaire(gi, 'up')}
                    disabled={gi === 0}
                    className="p-1 rounded hover:bg-stone-100 disabled:opacity-20 transition-colors"
                    title="Move up / 上移"
                  >
                    <ChevronUp size={12} className="text-stone-500" />
                  </button>
                  <button
                    onClick={() => moveQuestionnaire(gi, 'down')}
                    disabled={gi === groupedQuestions.length - 1}
                    className="p-1 rounded hover:bg-stone-100 disabled:opacity-20 transition-colors"
                    title="Move down / 下移"
                  >
                    <ChevronDown size={12} className="text-stone-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Questions flow / 问题流 */}
            <div className="ml-4 border-l-2 border-stone-200 pl-6 space-y-1">
              {group.questions.map((q, qi) => {
                const rules = logicBySource.get(q.id) || [];
                const color = TYPE_COLORS[q.question_type] || '#a8a29e';
                const isLayout = ['text_block', 'divider', 'image_block', 'instruction'].includes(q.question_type);

                return (
                  <div key={q.id} className="relative">
                    {/* Connector dot */}
                    <div className="absolute -left-[31px] top-3 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: color }} />

                    {/* Question node */}
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

                    {/* Logic rule branches with inline edit / 逻辑规则分支（内联编辑） */}
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

                          {/* Inline editor / 内联编辑器 */}
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

            {/* Arrow to next questionnaire */}
            {gi < groupedQuestions.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown size={16} className="text-stone-300" />
              </div>
            )}
          </div>
        ))}

        {/* End node / 结束节点 */}
        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="text-xs font-medium text-stone-500">Survey Complete / 调查完成</span>
        </div>
      </div>
    </div>
  );
};

export default SurveyFlowVisualizer;
