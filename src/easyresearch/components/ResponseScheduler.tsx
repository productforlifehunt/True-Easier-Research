/**
 * Response Scheduler & Longitudinal Study Manager
 * 响应调度器与纵向研究管理
 *
 * Features: wave scheduling, time-point management, retention tracking, reminder automation
 * 功能：波次调度、时间点管理、留存追踪、提醒自动化
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Bell, TrendingUp, Users, ChevronRight, Plus, Trash2, Play, Pause, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { bToast, toast } from '../utils/bilingualToast';

interface TimePoint {
  id: string;
  label: string; // "Baseline", "Week 1", "Month 3", etc.
  dayOffset: number; // days from enrollment
  questionnaire_ids: string[]; // which questionnaires to send
  reminderHours: number[]; // hours before deadline to remind
  windowDays: number; // response window in days
  isActive: boolean;
}

interface Wave {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  maxParticipants: number;
  enrolledCount: number;
  status: 'planned' | 'recruiting' | 'active' | 'completed';
}

interface RetentionData {
  timePointLabel: string;
  expected: number;
  completed: number;
  rate: number;
}

interface Props {
  projectId: string;
  questionnaires: any[];
}

const ResponseScheduler: React.FC<Props> = ({ projectId, questionnaires }) => {
  const [timePoints, setTimePoints] = useState<TimePoint[]>([]);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'schedule' | 'waves' | 'retention'>('schedule');

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: project }, { data: enroll }, { data: resp }] = await Promise.all([
        supabase.from('research_project').select('setting').eq('id', projectId).maybeSingle(),
        supabase.from('enrollment').select('*').eq('project_id', projectId),
        supabase.from('survey_response').select('id, questionnaire_id, enrollment_id, created_at, status').eq('project_id', projectId),
      ]);

      const setting = (project?.setting as any) || {};
      setTimePoints(setting.timePoints || []);
      setWaves(setting.waves || []);
      setEnrollments(enroll || []);
      setResponses(resp || []);
    } catch (e) {
      console.error('Error loading scheduler data:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (updates: { timePoints?: TimePoint[]; waves?: Wave[] }) => {
    try {
      const { data: project } = await supabase
        .from('research_project')
        .select('setting')
        .eq('id', projectId)
        .maybeSingle();
      const setting = (project?.setting as any) || {};

      await supabase
        .from('research_project')
        .update({
          setting: {
            ...setting,
            ...(updates.timePoints !== undefined ? { timePoints: updates.timePoints } : {}),
            ...(updates.waves !== undefined ? { waves: updates.waves } : {}),
          }
        })
        .eq('id', projectId);

      if (updates.timePoints !== undefined) setTimePoints(updates.timePoints);
      if (updates.waves !== undefined) setWaves(updates.waves);
    } catch (e) {
      console.error('Error saving config:', e);
    }
  };

  const addTimePoint = () => {
    const maxDay = timePoints.reduce((m, t) => Math.max(m, t.dayOffset), -1);
    const newTP: TimePoint = {
      id: crypto.randomUUID(),
      label: `Day ${maxDay + 7}`,
      dayOffset: maxDay + 7,
      questionnaire_ids: [],
      reminderHours: [24, 2],
      windowDays: 3,
      isActive: true,
    };
    saveConfig({ timePoints: [...timePoints, newTP] });
  };

  const updateTimePoint = (id: string, updates: Partial<TimePoint>) => {
    const updated = timePoints.map(t => t.id === id ? { ...t, ...updates } : t);
    saveConfig({ timePoints: updated });
  };

  const removeTimePoint = (id: string) => {
    saveConfig({ timePoints: timePoints.filter(t => t.id !== id) });
  };

  const addWave = () => {
    const newWave: Wave = {
      id: crypto.randomUUID(),
      name: `Wave ${waves.length + 1}`,
      startDate: new Date().toISOString().split('T')[0],
      maxParticipants: 50,
      enrolledCount: 0,
      status: 'planned',
    };
    saveConfig({ waves: [...waves, newWave] });
  };

  // Retention analysis / 留存分析
  const retentionData: RetentionData[] = useMemo(() => {
    if (!timePoints.length || !enrollments.length) return [];

    return timePoints.map(tp => {
      const expected = enrollments.filter(e => e.status !== 'disqualified').length;
      // Count responses for questionnaires in this time point / 计算此时间点中问卷的响应数
      const completed = tp.questionnaire_ids.length > 0
        ? responses.filter(r => tp.questionnaire_ids.includes(r.questionnaire_id)).length
        : 0;
      return {
        timePointLabel: tp.label,
        expected,
        completed,
        rate: expected > 0 ? Math.round((completed / expected) * 100) : 0,
      };
    });
  }, [timePoints, enrollments, responses]);

  if (loading) return <div className="p-8 text-center text-stone-400 text-[12px]">Loading scheduler... / 正在加载调度器...</div>;

  return (
    <div className="space-y-5">
      {/* View Tabs / 视图标签 */}
      <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5 w-fit">
        {(['schedule', 'waves', 'retention'] as const).map(v => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={`text-[12px] px-4 py-1.5 rounded-md transition-colors capitalize ${activeView === v ? 'bg-white text-stone-800 shadow-sm font-medium' : 'text-stone-500'}`}
          >
            {v === 'schedule' && <Calendar size={12} className="inline mr-1.5" />}
            {v === 'waves' && <Users size={12} className="inline mr-1.5" />}
            {v === 'retention' && <TrendingUp size={12} className="inline mr-1.5" />}
            {v === 'schedule' ? 'Time Points / 时间点' : v === 'waves' ? 'Waves / 波次' : 'Retention / 留存'}
          </button>
        ))}
      </div>

      {activeView === 'schedule' && (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <h3 className="text-[13px] font-semibold text-stone-800 flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              Longitudinal Schedule / 纵向调度
            </h3>
            <button onClick={addTimePoint} className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors">
              <Plus size={12} /> Add Time Point / 添加时间点
            </button>
          </div>

          {timePoints.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <Calendar size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-[12px]">No time points defined / 未定义时间点</p>
              <p className="text-[11px] mt-1">Set up a longitudinal schedule for your study / 为您的研究设置纵向调度</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {timePoints.sort((a, b) => a.dayOffset - b.dayOffset).map((tp, i) => (
                <div key={tp.id} className="px-5 py-3 flex items-center gap-4">
                  {/* Timeline dot / 时间线点 */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-3 h-3 rounded-full ${tp.isActive ? 'bg-emerald-400' : 'bg-stone-300'}`} />
                    {i < timePoints.length - 1 && <div className="w-0.5 h-8 bg-stone-200 mt-0.5" />}
                  </div>

                  {/* Label / 标签 */}
                  <input
                    type="text"
                    value={tp.label}
                    onChange={e => updateTimePoint(tp.id, { label: e.target.value })}
                    className="text-[12px] font-medium text-stone-700 bg-transparent border-none outline-none w-28"
                  />

                  {/* Day offset / 天数偏移 */}
                  <div className="flex items-center gap-1">
                    <Clock size={10} className="text-stone-400" />
                    <span className="text-[10px] text-stone-400">Day</span>
                    <input
                      type="number"
                      value={tp.dayOffset}
                      onChange={e => updateTimePoint(tp.id, { dayOffset: parseInt(e.target.value) || 0 })}
                      className="text-[11px] w-12 px-1 py-0.5 rounded border border-stone-200 text-center"
                    />
                  </div>

                  {/* Window / 窗口 */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-stone-400">Window:</span>
                    <input
                      type="number"
                      value={tp.windowDays}
                      onChange={e => updateTimePoint(tp.id, { windowDays: parseInt(e.target.value) || 1 })}
                      className="text-[11px] w-10 px-1 py-0.5 rounded border border-stone-200 text-center"
                    />
                    <span className="text-[10px] text-stone-400">days</span>
                  </div>

                  {/* Questionnaire selector / 问卷选择器 */}
                  <select
                    value={tp.questionnaire_ids[0] || ''}
                    onChange={e => updateTimePoint(tp.id, { questionnaire_ids: e.target.value ? [e.target.value] : [] })}
                    className="text-[11px] px-2 py-1 rounded border border-stone-200 bg-white max-w-[150px]"
                  >
                    <option value="">Select questionnaire / 选择问卷</option>
                    {questionnaires.map(q => (
                      <option key={q.id} value={q.id}>{q.title?.substring(0, 30)}</option>
                    ))}
                  </select>

                  {/* Toggle + Delete / 切换和删除 */}
                  <button
                    onClick={() => updateTimePoint(tp.id, { isActive: !tp.isActive })}
                    className={`text-[10px] px-2 py-0.5 rounded ${tp.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}
                  >
                    {tp.isActive ? 'Active' : 'Paused'}
                  </button>
                  <button onClick={() => removeTimePoint(tp.id)} className="text-stone-300 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'waves' && (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <h3 className="text-[13px] font-semibold text-stone-800 flex items-center gap-2">
              <Users size={14} className="text-violet-500" />
              Recruitment Waves / 招募波次
            </h3>
            <button onClick={addWave} className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50">
              <Plus size={12} /> Add Wave / 添加波次
            </button>
          </div>

          {waves.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <Users size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-[12px]">No waves defined / 未定义波次</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {waves.map(w => (
                <div key={w.id} className="px-5 py-3 flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    w.status === 'active' ? 'bg-emerald-400' :
                    w.status === 'recruiting' ? 'bg-blue-400' :
                    w.status === 'completed' ? 'bg-stone-400' : 'bg-amber-400'
                  }`} />
                  <input
                    type="text"
                    value={w.name}
                    onChange={e => {
                      const updated = waves.map(x => x.id === w.id ? { ...x, name: e.target.value } : x);
                      saveConfig({ waves: updated });
                    }}
                    className="text-[12px] font-medium text-stone-700 bg-transparent border-none outline-none w-28"
                  />
                  <input
                    type="date"
                    value={w.startDate}
                    onChange={e => {
                      const updated = waves.map(x => x.id === w.id ? { ...x, startDate: e.target.value } : x);
                      saveConfig({ waves: updated });
                    }}
                    className="text-[11px] px-2 py-1 rounded border border-stone-200"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-stone-400">Max:</span>
                    <input
                      type="number"
                      value={w.maxParticipants}
                      onChange={e => {
                        const updated = waves.map(x => x.id === w.id ? { ...x, maxParticipants: parseInt(e.target.value) || 0 } : x);
                        saveConfig({ waves: updated });
                      }}
                      className="text-[11px] w-14 px-1 py-0.5 rounded border border-stone-200 text-center"
                    />
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                    w.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                    w.status === 'recruiting' ? 'bg-blue-100 text-blue-600' :
                    w.status === 'completed' ? 'bg-stone-100 text-stone-500' :
                    'bg-amber-100 text-amber-600'
                  }`}>{w.status}</span>
                  <button
                    onClick={() => {
                      const updated = waves.filter(x => x.id !== w.id);
                      saveConfig({ waves: updated });
                    }}
                    className="text-stone-300 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'retention' && (
        <div className="bg-white rounded-xl border border-stone-100 p-4">
          <h3 className="text-[13px] font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" />
            Retention Curve / 留存曲线
          </h3>
          {retentionData.length === 0 ? (
            <p className="text-[12px] text-stone-400 text-center py-6">Define time points first to see retention / 先定义时间点以查看留存</p>
          ) : (
            <div className="space-y-3">
              {retentionData.map((rd, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] text-stone-600 w-24 shrink-0">{rd.timePointLabel}</span>
                  <div className="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, rd.rate)}%`,
                        backgroundColor: rd.rate >= 80 ? '#10b981' : rd.rate >= 60 ? '#06b6d4' : rd.rate >= 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-stone-700">
                      {rd.completed}/{rd.expected} ({rd.rate}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResponseScheduler;
