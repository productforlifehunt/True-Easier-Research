import React, { useState } from 'react';
import { Workflow, Plus, Trash2, ArrowRight, Zap, Mail, MessageSquare, Globe, Database, Bell, GitBranch, CheckCircle2 } from 'lucide-react';

/* ────────────────────────────────────────────────────
 * Workflow Automation Builder
 * Visual IF/THEN action builder for survey events.
 * Qualtrics-style workflows.
 *
 * 工作流自动化构建器
 * 可视化IF/THEN操作构建器。
 * Qualtrics风格的工作流。
 * ──────────────────────────────────────────────────── */

interface WorkflowTrigger {
  type: 'survey_completed' | 'survey_started' | 'response_updated' | 'quota_met' | 'quality_flagged' | 'abandoned' | 'scheduled';
  config: Record<string, any>;
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
  logic: 'and' | 'or';
}

interface WorkflowAction {
  id: string;
  type: 'send_email' | 'webhook' | 'slack_message' | 'update_contact' | 'add_tag' | 'create_ticket' | 'delay' | 'notification';
  config: Record<string, any>;
  label: string;
}

interface WorkflowRule {
  id: string;
  name: string;
  nameZh: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
}

interface Props {
  projectId: string;
}

const TRIGGERS = [
  { type: 'survey_completed', label: 'Survey Completed / 调查完成', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  { type: 'survey_started', label: 'Survey Started / 调查开始', icon: Zap, color: 'text-blue-600 bg-blue-50' },
  { type: 'response_updated', label: 'Response Updated / 回复更新', icon: Database, color: 'text-purple-600 bg-purple-50' },
  { type: 'quota_met', label: 'Quota Met / 配额已满', icon: Bell, color: 'text-amber-600 bg-amber-50' },
  { type: 'quality_flagged', label: 'Quality Flagged / 质量标记', icon: GitBranch, color: 'text-red-600 bg-red-50' },
  { type: 'abandoned', label: 'Survey Abandoned / 调查放弃', icon: ArrowRight, color: 'text-orange-600 bg-orange-50' },
  { type: 'scheduled', label: 'Scheduled / 定时触发', icon: Bell, color: 'text-stone-600 bg-stone-50' },
];

const ACTIONS = [
  { type: 'send_email', label: 'Send Email / 发送邮件', icon: Mail },
  { type: 'webhook', label: 'HTTP Webhook', icon: Globe },
  { type: 'slack_message', label: 'Slack Message / Slack消息', icon: MessageSquare },
  { type: 'update_contact', label: 'Update Contact / 更新联系人', icon: Database },
  { type: 'add_tag', label: 'Add Tag / 添加标签', icon: Zap },
  { type: 'notification', label: 'In-App Notification / 应用内通知', icon: Bell },
  { type: 'delay', label: 'Wait / 等待', icon: ArrowRight },
];

const OPERATORS = [
  { value: 'equals', label: 'equals / 等于' },
  { value: 'not_equals', label: 'not equals / 不等于' },
  { value: 'contains', label: 'contains / 包含' },
  { value: 'greater_than', label: '> greater than / 大于' },
  { value: 'less_than', label: '< less than / 小于' },
  { value: 'is_empty', label: 'is empty / 为空' },
  { value: 'is_not_empty', label: 'is not empty / 非空' },
];

const WorkflowAutomationBuilder: React.FC<Props> = ({ projectId }) => {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([
    {
      id: 'wf1', name: 'Send thank you email on completion', nameZh: '完成时发送感谢邮件', enabled: true,
      trigger: { type: 'survey_completed', config: {} },
      conditions: [],
      actions: [{ id: 'a1', type: 'send_email', config: { templateId: 'thank_you', to: '{{respondent_email}}' }, label: 'Send Thank You Email' }],
    },
    {
      id: 'wf2', name: 'Notify researcher on quality flag', nameZh: '质量标记时通知研究员', enabled: true,
      trigger: { type: 'quality_flagged', config: {} },
      conditions: [{ id: 'cond1', field: 'quality_score', operator: 'less_than', value: '30', logic: 'and' }],
      actions: [
        { id: 'a2', type: 'notification', config: { message: 'Low quality response detected' }, label: 'Send Notification' },
        { id: 'a3', type: 'webhook', config: { url: '', method: 'POST' }, label: 'Trigger Webhook' },
      ],
    },
  ]);
  const [editingWf, setEditingWf] = useState<string | null>(null);

  const addWorkflow = () => {
    const wf: WorkflowRule = {
      id: `wf_${Date.now()}`, name: 'New Workflow', nameZh: '新工作流', enabled: true,
      trigger: { type: 'survey_completed', config: {} },
      conditions: [], actions: [],
    };
    setWorkflows(prev => [...prev, wf]);
    setEditingWf(wf.id);
  };

  const updateWorkflow = (id: string, updates: Partial<WorkflowRule>) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const removeWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    if (editingWf === id) setEditingWf(null);
  };

  const addCondition = (wfId: string) => {
    setWorkflows(prev => prev.map(w => w.id === wfId ? {
      ...w, conditions: [...w.conditions, { id: `c_${Date.now()}`, field: '', operator: 'equals' as const, value: '', logic: 'and' as const }]
    } : w));
  };

  const addAction = (wfId: string, type: string) => {
    const actionDef = ACTIONS.find(a => a.type === type);
    setWorkflows(prev => prev.map(w => w.id === wfId ? {
      ...w, actions: [...w.actions, { id: `a_${Date.now()}`, type: type as any, config: {}, label: actionDef?.label || type }]
    } : w));
  };

  const removeAction = (wfId: string, actionId: string) => {
    setWorkflows(prev => prev.map(w => w.id === wfId ? { ...w, actions: w.actions.filter(a => a.id !== actionId) } : w));
  };

  const removeCondition = (wfId: string, condId: string) => {
    setWorkflows(prev => prev.map(w => w.id === wfId ? { ...w, conditions: w.conditions.filter(c => c.id !== condId) } : w));
  };

  const editing = workflows.find(w => w.id === editingWf);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Workflow size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Workflow Automation / 工作流自动化</h2>
            <p className="text-xs text-stone-500">Visual IF/THEN rules for survey events / 可视化IF/THEN调查事件规则</p>
          </div>
        </div>
        <button onClick={addWorkflow}
          className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1">
          <Plus size={12} /> New Workflow / 新建工作流
        </button>
      </div>

      <div className="flex gap-6">
        {/* Workflow list / 工作流列表 */}
        <div className="flex-1 space-y-3">
          {workflows.map(wf => {
            const triggerDef = TRIGGERS.find(t => t.type === wf.trigger.type);
            const TriggerIcon = triggerDef?.icon || Zap;
            return (
              <div key={wf.id} onClick={() => setEditingWf(wf.id)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${editingWf === wf.id ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-stone-200 hover:border-stone-300'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); updateWorkflow(wf.id, { enabled: !wf.enabled }); }}
                      className={`w-8 h-4 rounded-full transition-colors ${wf.enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition-transform ${wf.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <h4 className="text-sm font-semibold text-stone-700">{wf.name}</h4>
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeWorkflow(wf.id); }}
                    className="p-1 text-stone-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>

                {/* Visual flow / 可视化流程 */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {/* Trigger / 触发器 */}
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 ${triggerDef?.color || ''}`}>
                    <TriggerIcon size={12} /> {wf.trigger.type.replace(/_/g, ' ')}
                  </div>

                  {/* Conditions / 条件 */}
                  {wf.conditions.length > 0 && (
                    <>
                      <ArrowRight size={12} className="text-stone-300 shrink-0" />
                      <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1">
                        <GitBranch size={12} /> IF ({wf.conditions.length})
                      </div>
                    </>
                  )}

                  {/* Actions / 操作 */}
                  {wf.actions.map(action => {
                    const ActionIcon = ACTIONS.find(a => a.type === action.type)?.icon || Zap;
                    return (
                      <React.Fragment key={action.id}>
                        <ArrowRight size={12} className="text-stone-300 shrink-0" />
                        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1">
                          <ActionIcon size={12} /> {action.type.replace(/_/g, ' ')}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {workflows.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-dashed border-stone-200 p-8 text-center">
              <Workflow size={28} className="mx-auto text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">No workflows yet / 暂无工作流</p>
            </div>
          )}
        </div>

        {/* Editor panel / 编辑面板 */}
        {editing && (
          <div className="w-80 bg-white rounded-xl border border-stone-200 p-4 space-y-4 shrink-0 self-start sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h4 className="text-sm font-bold text-stone-700">Edit Workflow / 编辑工作流</h4>

            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Name (EN)</label>
              <input value={editing.name} onChange={e => updateWorkflow(editing.id, { name: e.target.value })}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Name (ZH)</label>
              <input value={editing.nameZh} onChange={e => updateWorkflow(editing.id, { nameZh: e.target.value })}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
            </div>

            {/* Trigger / 触发器 */}
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">WHEN (Trigger) / 当（触发器）</label>
              <select value={editing.trigger.type}
                onChange={e => updateWorkflow(editing.id, { trigger: { ...editing.trigger, type: e.target.value as any } })}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg bg-white">
                {TRIGGERS.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
              </select>
            </div>

            {/* Conditions / 条件 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase">IF (Conditions) / 如果（条件）</label>
                <button onClick={() => addCondition(editing.id)} className="text-[10px] text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                  <Plus size={10} /> Add
                </button>
              </div>
              {editing.conditions.map((cond, i) => (
                <div key={cond.id} className="mb-2 p-2 bg-stone-50 rounded-lg space-y-1">
                  {i > 0 && (
                    <select value={cond.logic} onChange={e => {
                      const conditions = [...editing.conditions]; conditions[i] = { ...cond, logic: e.target.value as 'and' | 'or' };
                      updateWorkflow(editing.id, { conditions });
                    }} className="text-[10px] px-1 py-0.5 border rounded bg-white font-semibold text-emerald-700">
                      <option value="and">AND</option><option value="or">OR</option>
                    </select>
                  )}
                  <input value={cond.field} onChange={e => {
                    const conditions = [...editing.conditions]; conditions[i] = { ...cond, field: e.target.value };
                    updateWorkflow(editing.id, { conditions });
                  }} placeholder="Field name..." className="w-full px-2 py-1 text-[10px] border border-stone-200 rounded" />
                  <div className="flex gap-1">
                    <select value={cond.operator} onChange={e => {
                      const conditions = [...editing.conditions]; conditions[i] = { ...cond, operator: e.target.value as any };
                      updateWorkflow(editing.id, { conditions });
                    }} className="flex-1 px-1 py-1 text-[10px] border border-stone-200 rounded bg-white">
                      {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input value={cond.value} onChange={e => {
                      const conditions = [...editing.conditions]; conditions[i] = { ...cond, value: e.target.value };
                      updateWorkflow(editing.id, { conditions });
                    }} placeholder="Value..." className="flex-1 px-2 py-1 text-[10px] border border-stone-200 rounded" />
                    <button onClick={() => removeCondition(editing.id, cond.id)} className="text-stone-400 hover:text-red-500"><Trash2 size={10} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions / 操作 */}
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase mb-2 block">THEN (Actions) / 然后（操作）</label>
              {editing.actions.map((action, i) => {
                const ActionIcon = ACTIONS.find(a => a.type === action.type)?.icon || Zap;
                return (
                  <div key={action.id} className="mb-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">{i + 1}.</span>
                      <ActionIcon size={12} className="text-blue-600" />
                      <span className="text-xs text-blue-700">{action.label}</span>
                    </div>
                    <button onClick={() => removeAction(editing.id, action.id)} className="text-stone-400 hover:text-red-500"><Trash2 size={10} /></button>
                  </div>
                );
              })}
              <div className="flex flex-wrap gap-1 mt-2">
                {ACTIONS.map(a => {
                  const Icon = a.icon;
                  return (
                    <button key={a.type} onClick={() => addAction(editing.id, a.type)}
                      className="flex items-center gap-1 px-2 py-1 text-[9px] bg-white border border-stone-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <Icon size={9} /> {a.type.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowAutomationBuilder;
