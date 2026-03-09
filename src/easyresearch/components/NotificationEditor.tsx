import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Bell, BellOff, Clock, X } from 'lucide-react';
import { loadNotificationConfigs, saveNotificationConfigs, createDefaultNotificationConfig, type NotificationConfig } from '../utils/notificationConfigSync';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';
import toast from 'react-hot-toast';

interface NotificationEditorProps {
  projectId: string;
  questionnaires: QuestionnaireConfig[];
  participantTypes: ParticipantType[];
}

const NOTIFICATION_TYPES = [
  { value: 'push', label: '📱 Push' },
  { value: 'email', label: '📧 Email' },
  { value: 'sms', label: '💬 SMS' },
  { value: 'push_email', label: '📱📧 Push + Email' },
];

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Once' },
  { value: 'hourly', label: 'Hourly' },
  { value: '2hours', label: 'Every 2 Hours' },
  { value: '4hours', label: 'Every 4 Hours' },
  { value: 'daily', label: 'Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'weekly', label: 'Weekly' },
];

// Generate hour options 0-23 / 生成 0-23 小时选项
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, '0')}:00`,
}));

const NotificationEditor: React.FC<NotificationEditorProps> = ({ projectId, questionnaires, participantTypes }) => {
  const [configs, setConfigs] = useState<NotificationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    loadNotificationConfigs(projectId).then(data => {
      setConfigs(data);
      setLoading(false);
    });
  }, [projectId]);

  const save = useCallback(async (updated: NotificationConfig[]) => {
    setConfigs(updated);
    await saveNotificationConfigs(projectId, updated);
    toast.success('Notifications saved');
  }, [projectId]);

  const addProjectNotification = () => {
    const nc = createDefaultNotificationConfig(projectId, null);
    nc.order_index = configs.filter(c => !c.questionnaire_id).length;
    const updated = [...configs, nc];
    save(updated);
    setExpandedId(nc.id);
  };

  const addQuestionnaireNotification = (questionnaireId: string) => {
    const nc = createDefaultNotificationConfig(projectId, questionnaireId);
    nc.order_index = configs.filter(c => c.questionnaire_id === questionnaireId).length;
    const updated = [...configs, nc];
    save(updated);
    setExpandedId(nc.id);
  };

  const updateConfig = (id: string, updates: Partial<NotificationConfig>) => {
    save(configs.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeConfig = (id: string) => {
    save(configs.filter(c => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const togglePT = (configId: string, ptId: string) => {
    const config = configs.find(c => c.id === configId);
    if (!config) return;
    const current = config.assigned_participant_types;
    const next = current.includes(ptId)
      ? current.filter(x => x !== ptId)
      : [...current, ptId];
    updateConfig(configId, { assigned_participant_types: next });
  };

  // Add a specific time / 添加一个具体时间
  const addSpecificTime = (configId: string) => {
    const config = configs.find(c => c.id === configId);
    if (!config) return;
    // Find a time not already in the list / 找一个不在列表中的时间
    const existingSet = new Set(config.specific_times);
    let newTime = '09:00';
    for (let h = 8; h <= 21; h++) {
      const candidate = `${h.toString().padStart(2, '0')}:00`;
      if (!existingSet.has(candidate)) { newTime = candidate; break; }
    }
    updateConfig(configId, { specific_times: [...config.specific_times, newTime].sort() });
  };

  const removeSpecificTime = (configId: string, idx: number) => {
    const config = configs.find(c => c.id === configId);
    if (!config) return;
    updateConfig(configId, { specific_times: config.specific_times.filter((_, i) => i !== idx) });
  };

  const updateSpecificTime = (configId: string, idx: number, newTime: string) => {
    const config = configs.find(c => c.id === configId);
    if (!config) return;
    const updated = [...config.specific_times];
    updated[idx] = newTime;
    updateConfig(configId, { specific_times: updated.sort() });
  };

  // Group configs
  const projectConfigs = configs.filter(c => !c.questionnaire_id);
  const surveyQuestionnaires = questionnaires.filter(q => q.questionnaire_type === 'survey');
  const componentQuestionnaires = questionnaires.filter(q => ['consent', 'screening', 'profile', 'help', 'custom', 'onboarding'].includes(q.questionnaire_type));

  // Check if frequency is interval-compatible / 检查频率是否兼容间隔模式
  const isIntervalFrequency = (freq: string) => ['hourly', '2hours', '4hours'].includes(freq);

  const renderConfigCard = (nc: NotificationConfig) => {
    const isExpanded = expandedId === nc.id;
    return (
      <div key={nc.id} className="border border-stone-200 rounded-xl bg-white overflow-hidden">
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
          onClick={() => setExpandedId(isExpanded ? null : nc.id)}
        >
          {isExpanded ? <ChevronDown size={14} className="text-stone-400" /> : <ChevronRight size={14} className="text-stone-400" />}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-stone-700 truncate">{nc.title || 'Untitled'}</span>
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400">
              {nc.schedule_mode === 'specific_times'
                ? `${nc.specific_times.length} times`
                : (FREQUENCY_OPTIONS.find(f => f.value === nc.frequency)?.label || nc.frequency)
              }
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); updateConfig(nc.id, { enabled: !nc.enabled }); }}
            className="p-1"
          >
            {nc.enabled
              ? <ToggleRight size={20} className="text-emerald-500" />
              : <ToggleLeft size={20} className="text-stone-300" />
            }
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeConfig(nc.id); }}
            className="p-1 text-stone-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {isExpanded && (
          <div className="border-t border-stone-100 px-4 py-4 space-y-3">
            {/* Title / 标题 */}
            <div>
              <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Title / 标题</label>
              <input
                type="text"
                value={nc.title}
                onChange={(e) => updateConfig(nc.id, { title: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
              />
            </div>

            {/* Body / 正文 */}
            <div>
              <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Body / 正文</label>
              <textarea
                value={nc.body}
                onChange={(e) => updateConfig(nc.id, { body: e.target.value })}
                rows={2}
                className="mt-1 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 resize-y"
              />
            </div>

            {/* Type / 类型 */}
            <div>
              <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Type / 类型</label>
              <select
                value={nc.notification_type}
                onChange={(e) => updateConfig(nc.id, { notification_type: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
              >
                {NOTIFICATION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Schedule Mode / 调度模式 */}
            <div>
              <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1.5 block">
                Schedule Mode / 调度模式
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateConfig(nc.id, { schedule_mode: 'interval' })}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    nc.schedule_mode === 'interval'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300'
                  }`}
                >
                  ⏱ Interval / 间隔模式
                </button>
                <button
                  onClick={() => updateConfig(nc.id, { schedule_mode: 'specific_times' })}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    nc.schedule_mode === 'specific_times'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300'
                  }`}
                >
                  🕐 Specific Times / 指定时间
                </button>
              </div>
            </div>

            {/* Interval mode controls / 间隔模式控制 */}
            {nc.schedule_mode === 'interval' && (
              <div className="space-y-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
                <div>
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Frequency / 频率</label>
                  <select
                    value={nc.frequency}
                    onChange={(e) => updateConfig(nc.id, { frequency: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 bg-white"
                  >
                    {FREQUENCY_OPTIONS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                {isIntervalFrequency(nc.frequency) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Start / 开始</label>
                      <select
                        value={nc.interval_start_hour}
                        onChange={(e) => updateConfig(nc.id, { interval_start_hour: parseInt(e.target.value) })}
                        className="mt-1 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 bg-white"
                      >
                        {HOUR_OPTIONS.map(h => (
                          <option key={h.value} value={h.value}>{h.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">End / 结束</label>
                      <select
                        value={nc.interval_end_hour}
                        onChange={(e) => updateConfig(nc.id, { interval_end_hour: parseInt(e.target.value) })}
                        className="mt-1 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 bg-white"
                      >
                        {HOUR_OPTIONS.map(h => (
                          <option key={h.value} value={h.value}>{h.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specific times mode / 指定时间模式 */}
            {nc.schedule_mode === 'specific_times' && (
              <div className="space-y-2 p-3 bg-stone-50 rounded-lg border border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                    Times / 时间列表 ({nc.specific_times.length})
                  </label>
                  <button
                    onClick={() => addSpecificTime(nc.id)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
                  >
                    <Plus size={10} /> Add Time / 添加
                  </button>
                </div>
                {nc.specific_times.length === 0 && (
                  <p className="text-[11px] text-stone-300 text-center py-3">No times set. Click "Add Time". / 未设置时间，点击"添加"。</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {nc.specific_times.map((time, idx) => (
                    <div key={`${time}-${idx}`} className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2 py-1">
                      <Clock size={11} className="text-stone-400" />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateSpecificTime(nc.id, idx, e.target.value)}
                        className="text-sm border-none outline-none bg-transparent w-20"
                      />
                      <button
                        onClick={() => removeSpecificTime(nc.id, idx)}
                        className="p-0.5 text-stone-300 hover:text-red-400"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Minutes before + DND */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Minutes Before / 提前分钟</label>
                <input
                  type="number"
                  min={0}
                  value={nc.minutes_before}
                  onChange={(e) => updateConfig(nc.id, { minutes_before: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nc.dnd_allowed}
                    onChange={(e) => updateConfig(nc.id, { dnd_allowed: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-300"
                  />
                  <span className="text-xs text-stone-600">
                    {nc.dnd_allowed ? <BellOff size={11} className="inline mr-1" /> : <Bell size={11} className="inline mr-1" />}
                    Allow DND / 允许免打扰
                  </span>
                </label>
              </div>
            </div>

            {/* Participant Types / 参与者类型 */}
            {participantTypes.length > 0 && (
              <div>
                <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1.5 block">
                  Participant Types / 参与者类型
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {participantTypes.map(pt => {
                    const active = nc.assigned_participant_types.includes(pt.id);
                    return (
                      <button
                        key={pt.id}
                        onClick={() => togglePT(nc.id, pt.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                          active
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300'
                        }`}
                      >
                        {pt.name}
                      </button>
                    );
                  })}
                  <span className="text-[10px] text-stone-300 self-center ml-1">
                    {nc.assigned_participant_types.length === 0 ? '(all types / 所有类型)' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-12 text-stone-400">Loading notifications... / 加载通知中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Project-level notifications / 项目级通知 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-stone-800">Project Notifications / 项目通知</h3>
            <p className="text-xs text-stone-400 mt-0.5">Not linked to any questionnaire / 不关联任何问卷</p>
          </div>
          <button
            onClick={addProjectNotification}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-colors"
          >
            <Plus size={14} /> Add / 添加
          </button>
        </div>

        {projectConfigs.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-xl">
            <Bell size={24} className="mx-auto text-stone-300 mb-2" />
            <p className="text-xs text-stone-400">No project-level notifications / 暂无项目级通知</p>
          </div>
        )}

        <div className="space-y-2">
          {projectConfigs.map(renderConfigCard)}
        </div>
      </div>

      {/* Per-questionnaire notifications / 按问卷通知 */}
      {surveyQuestionnaires.map(q => {
        const qConfigs = configs.filter(c => c.questionnaire_id === q.id);
        return (
          <div key={q.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-stone-700">📋 {q.title}</h3>
                <p className="text-[11px] text-stone-400">Questionnaire notifications / 问卷通知</p>
              </div>
              <button
                onClick={() => addQuestionnaireNotification(q.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-colors"
              >
                <Plus size={12} /> Add / 添加
              </button>
            </div>

            {qConfigs.length === 0 && (
              <div className="text-center py-6 border border-dashed border-stone-200 rounded-xl">
                <p className="text-[11px] text-stone-300">No notifications for this questionnaire / 此问卷暂无通知</p>
              </div>
            )}

            <div className="space-y-2">
              {qConfigs.map(renderConfigCard)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationEditor;