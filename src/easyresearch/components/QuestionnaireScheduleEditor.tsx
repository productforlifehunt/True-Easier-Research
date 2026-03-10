/**
 * QuestionnaireScheduleEditor — Advanced schedule configuration for questionnaires
 * 问卷计划编辑器 — 问卷的高级调度配置
 *
 * Supports:
 * - One-time: single send time / 一次性：单次发送时间
 * - Longitudinal: calendar-based template scheduling / 纵向研究：基于日历的模板调度
 *   - Fixed dates mode: specific calendar dates / 固定日期模式：特定日历日期
 *   - Relative days mode: day offsets from enrollment / 相对天数模式：从注册日开始的天数偏移
 */
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Clock, Calendar, Copy, ChevronLeft, ChevronRight, GripVertical, Save, X } from 'lucide-react';

// ─── Types / 类型 ─────────────────────────────────────────────

/** A time template = a named list of HH:MM send times / 时间模板 = 命名的 HH:MM 发送时间列表 */
export interface TimeTemplate {
  id: string;
  name: string;
  times: string[]; // HH:MM
}

/** Per-day schedule entry / 每日调度条目 */
export interface DaySchedule {
  /** date key: ISO date 'YYYY-MM-DD' for fixed, or 'day-N' for relative / 日期键 */
  dayKey: string;
  /** send times for this day / 此日的发送时间 */
  times: string[];
  /** template ID if applied / 应用的模板 ID */
  templateId?: string;
}

export interface ScheduleConfig {
  /** 'once' | 'recurring' */
  mode: 'once' | 'recurring';
  /** For one-time: single send time (HH:MM) / 一次性发送时间 */
  sendTime?: string;
  /** 'fixed_dates' | 'relative_days' / 固定日期 | 相对天数 */
  dateMode: 'fixed_dates' | 'relative_days';
  /** Saved templates / 保存的模板 */
  templates: TimeTemplate[];
  /** Per-day schedules / 每日调度 */
  daySchedules: DaySchedule[];
  /** Study duration in days (for relative mode) / 研究持续天数 */
  studyDuration?: number;
}

interface Props {
  frequency: string; // from parent questionnaire config
  schedule: ScheduleConfig;
  onChange: (schedule: ScheduleConfig) => void;
  studyDuration?: number;
}

const DEFAULT_SCHEDULE: ScheduleConfig = {
  mode: 'once',
  sendTime: '09:00',
  dateMode: 'relative_days',
  templates: [],
  daySchedules: [],
};

export function getDefaultScheduleConfig(frequency: string, studyDuration?: number): ScheduleConfig {
  return {
    mode: frequency === 'once' ? 'once' : 'recurring',
    sendTime: '09:00',
    dateMode: 'relative_days',
    templates: [],
    daySchedules: [],
    studyDuration,
  };
}

// ─── Component / 组件 ─────────────────────────────────────────

const QuestionnaireScheduleEditor: React.FC<Props> = ({ frequency, schedule: rawSchedule, onChange, studyDuration }) => {
  const schedule = { ...DEFAULT_SCHEDULE, ...rawSchedule };
  const isOnce = frequency === 'once';

  // Template editing state / 模板编辑状态
  const [editingTemplate, setEditingTemplate] = useState<TimeTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateTime, setNewTemplateTime] = useState('09:00');

  // Calendar state / 日历状态
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [newTimeInput, setNewTimeInput] = useState('09:00');

  // For relative mode, generate day keys / 相对模式下生成天数键
  const duration = studyDuration || schedule.studyDuration || 7;
  const relativeDays = useMemo(() => Array.from({ length: duration }, (_, i) => `day-${i + 1}`), [duration]);

  // ─── Helpers ───

  const update = (patch: Partial<ScheduleConfig>) => onChange({ ...schedule, ...patch });

  const getDaySchedule = (dayKey: string): DaySchedule => {
    return schedule.daySchedules.find(d => d.dayKey === dayKey) || { dayKey, times: [] };
  };

  const setDaySchedule = (dayKey: string, ds: DaySchedule) => {
    const existing = schedule.daySchedules.filter(d => d.dayKey !== dayKey);
    update({ daySchedules: [...existing, ds] });
  };

  const addTimeToDay = (dayKey: string, time: string) => {
    const ds = getDaySchedule(dayKey);
    if (ds.times.includes(time)) return;
    setDaySchedule(dayKey, { ...ds, times: [...ds.times, time].sort(), templateId: undefined });
  };

  const removeTimeFromDay = (dayKey: string, time: string) => {
    const ds = getDaySchedule(dayKey);
    setDaySchedule(dayKey, { ...ds, times: ds.times.filter(t => t !== time), templateId: undefined });
  };

  const applyTemplateToDay = (dayKey: string, template: TimeTemplate) => {
    setDaySchedule(dayKey, { dayKey, times: [...template.times].sort(), templateId: template.id });
  };

  // ─── Template Management / 模板管理 ───

  const saveTemplate = () => {
    if (!editingTemplate || !editingTemplate.name.trim()) return;
    const existing = schedule.templates.filter(t => t.id !== editingTemplate.id);
    update({ templates: [...existing, editingTemplate] });
    setEditingTemplate(null);
  };

  const deleteTemplate = (id: string) => {
    update({ templates: schedule.templates.filter(t => t.id !== id) });
  };

  // ─── Calendar helpers / 日历帮助函数 ───

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay();
  const formatDateKey = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // ─── One-time mode / 一次性模式 ───

  if (isOnce) {
    return (
      <div className="space-y-2">
        <h5 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={11} /> Send Time
        </h5>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={schedule.sendTime || '09:00'}
            onChange={(e) => update({ sendTime: e.target.value, mode: 'once' })}
            className="px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          />
          <span className="text-[11px] text-stone-400">One-time questionnaire — single send time</span>
        </div>
      </div>
    );
  }

  // ─── Recurring mode / 重复模式 ───

  const selectedDaySchedule = selectedDayKey ? getDaySchedule(selectedDayKey) : null;

  return (
    <div className="space-y-4">
      <h5 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
        <Calendar size={11} /> Advanced Schedule
      </h5>

      {/* Date mode toggle / 日期模式切换 */}
      <div className="flex gap-1 bg-stone-100 p-0.5 rounded-lg w-fit">
        <button
          onClick={() => update({ dateMode: 'fixed_dates' })}
          className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
            schedule.dateMode === 'fixed_dates' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          📅 Fixed Dates
        </button>
        <button
          onClick={() => update({ dateMode: 'relative_days' })}
          className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
            schedule.dateMode === 'relative_days' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          🔄 Relative Days
        </button>
      </div>

      {/* Templates section / 模板区域 */}
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            ⏰ Time Templates
          </span>
          <button
            onClick={() => setEditingTemplate({ id: crypto.randomUUID(), name: '', times: [] })}
            className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 hover:text-emerald-600"
          >
            <Plus size={10} /> New Template
          </button>
        </div>

        {schedule.templates.length === 0 && !editingTemplate && (
          <p className="text-[10px] text-stone-400 italic">No templates yet. Create one to quickly assign times to days.</p>
        )}

        {/* Existing templates / 已有模板 */}
        {schedule.templates.map(t => (
          <div key={t.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-stone-100">
            <span className="text-[11px] font-medium text-stone-700 flex-1">{t.name}</span>
            <div className="flex items-center gap-1 flex-wrap">
              {t.times.map(time => (
                <span key={time} className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">{time}</span>
              ))}
            </div>
            <button onClick={() => setEditingTemplate({ ...t })} className="p-1 hover:bg-stone-100 rounded">
              <Clock size={10} className="text-stone-400" />
            </button>
            <button onClick={() => deleteTemplate(t.id)} className="p-1 hover:bg-red-50 rounded">
              <Trash2 size={10} className="text-red-400" />
            </button>
          </div>
        ))}

        {/* Template editor / 模板编辑器 */}
        {editingTemplate && (
          <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2">
            <input
              type="text"
              value={editingTemplate.name}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Template name"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              {editingTemplate.times.map(time => (
                <span key={time} className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                  {time}
                  <button onClick={() => setEditingTemplate({ ...editingTemplate, times: editingTemplate.times.filter(t => t !== time) })}>
                    <X size={8} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="time"
                value={newTemplateTime}
                onChange={(e) => setNewTemplateTime(e.target.value)}
                className="px-2 py-1 rounded-lg text-[11px] border border-stone-200"
              />
              <button
                onClick={() => {
                  if (!editingTemplate.times.includes(newTemplateTime)) {
                    setEditingTemplate({ ...editingTemplate, times: [...editingTemplate.times, newTemplateTime].sort() });
                  }
                }}
                className="text-[10px] text-emerald-500 hover:text-emerald-600 font-medium"
              >
                + Add Time
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveTemplate} className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium text-white bg-emerald-500 hover:bg-emerald-600">
                <Save size={10} /> Save
              </button>
              <button onClick={() => setEditingTemplate(null)} className="text-[10px] text-stone-400 hover:text-stone-600">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Day selector + schedule / 日期选择器 + 调度 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left: Day selector / 左侧：日期选择器 */}
        <div className="bg-white rounded-xl border border-stone-200 p-3">
          {schedule.dateMode === 'fixed_dates' ? (
            /* Calendar view / 日历视图 */
            <div>
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => {
                  let m = calendarMonth.month - 1, y = calendarMonth.year;
                  if (m < 0) { m = 11; y--; }
                  setCalendarMonth({ year: y, month: m });
                }} className="p-1 hover:bg-stone-100 rounded"><ChevronLeft size={14} className="text-stone-400" /></button>
                <span className="text-[12px] font-medium text-stone-700">
                  {new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => {
                  let m = calendarMonth.month + 1, y = calendarMonth.year;
                  if (m > 11) { m = 0; y++; }
                  setCalendarMonth({ year: y, month: m });
                }} className="p-1 hover:bg-stone-100 rounded"><ChevronRight size={14} className="text-stone-400" /></button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <span key={d} className="text-[9px] font-medium text-stone-400 py-1">{d}</span>
                ))}
                {Array.from({ length: getFirstDayOfWeek(calendarMonth.year, calendarMonth.month) }).map((_, i) => (
                  <span key={`empty-${i}`} />
                ))}
                {Array.from({ length: getDaysInMonth(calendarMonth.year, calendarMonth.month) }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = formatDateKey(calendarMonth.year, calendarMonth.month, day);
                  const ds = getDaySchedule(dateKey);
                  const hasSchedule = ds.times.length > 0;
                  const isSelected = selectedDayKey === dateKey;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDayKey(isSelected ? null : dateKey)}
                      className={`p-1 rounded-lg text-[11px] transition-colors relative ${
                        isSelected ? 'bg-emerald-500 text-white' :
                        hasSchedule ? 'bg-emerald-50 text-emerald-700 font-medium' :
                        'hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      {day}
                      {hasSchedule && !isSelected && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Relative days list / 相对天数列表 */
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1.5">
                Study Days (1–{duration})
              </span>
              {relativeDays.map(dayKey => {
                const dayNum = parseInt(dayKey.split('-')[1]);
                const ds = getDaySchedule(dayKey);
                const hasSchedule = ds.times.length > 0;
                const isSelected = selectedDayKey === dayKey;
                return (
                  <button
                    key={dayKey}
                    onClick={() => setSelectedDayKey(isSelected ? null : dayKey)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                      isSelected ? 'bg-emerald-500 text-white' :
                      hasSchedule ? 'bg-emerald-50 text-emerald-700' :
                      'hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <span className="font-medium">Day {dayNum} / 第{dayNum}天</span>
                    {hasSchedule && (
                      <span className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-emerald-500'}`}>
                        {ds.times.length} time{ds.times.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Day detail / 右侧：当日详情 */}
        <div className="bg-white rounded-xl border border-stone-200 p-3">
          {selectedDayKey ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-stone-700">
                  {schedule.dateMode === 'fixed_dates'
                    ? new Date(selectedDayKey + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : `Day ${selectedDayKey.split('-')[1]} / 第${selectedDayKey.split('-')[1]}天`}
                </span>
                <button
                  onClick={() => setDaySchedule(selectedDayKey, { dayKey: selectedDayKey, times: [] })}
                  className="text-[10px] text-red-400 hover:text-red-500"
                >
                  Clear All / 清除全部
                </button>
              </div>

              {/* Apply template / 应用模板 */}
              {schedule.templates.length > 0 && (
                <div>
                  <span className="text-[10px] text-stone-400 block mb-1">Apply Template / 应用模板:</span>
                  <div className="flex flex-wrap gap-1">
                    {schedule.templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => applyTemplateToDay(selectedDayKey, t)}
                        className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                          selectedDaySchedule?.templateId === t.id
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'border-stone-200 text-stone-500 hover:border-emerald-300 hover:text-emerald-600'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Times list / 时间列表 */}
              <div className="space-y-1">
                {(selectedDaySchedule?.times || []).map(time => (
                  <div key={time} className="flex items-center justify-between px-2 py-1 rounded-lg bg-stone-50">
                    <span className="text-[11px] text-stone-700">{time}</span>
                    <button onClick={() => removeTimeFromDay(selectedDayKey, time)} className="p-0.5 hover:bg-red-50 rounded">
                      <X size={10} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add time / 添加时间 */}
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={newTimeInput}
                  onChange={(e) => setNewTimeInput(e.target.value)}
                  className="px-2 py-1 rounded-lg text-[11px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  onClick={() => { addTimeToDay(selectedDayKey, newTimeInput); }}
                  className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 hover:text-emerald-600"
                >
                  <Plus size={10} /> Add / 添加
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[120px]">
              <p className="text-[11px] text-stone-400 text-center">
                {schedule.dateMode === 'fixed_dates'
                  ? 'Select a date from the calendar / 从日历选择一个日期'
                  : 'Select a study day from the list / 从列表选择一个研究天数'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireScheduleEditor;
