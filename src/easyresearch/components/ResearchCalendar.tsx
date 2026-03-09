import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Target, Bell, Users } from 'lucide-react';
import toast from 'react-hot-toast';

// Research Calendar – Project timeline and milestone management
// 研究日历 – 项目时间线和里程碑管理

interface Props {
  projectId: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'milestone' | 'deadline' | 'meeting' | 'data_collection' | 'analysis' | 'report' | 'irb' | 'custom';
  description: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
  color: string;
}

const EVENT_TYPES = [
  { value: 'milestone', label: '🏁 Milestone / 里程碑', color: '#10b981' },
  { value: 'deadline', label: '⏰ Deadline / 截止日期', color: '#ef4444' },
  { value: 'meeting', label: '👥 Meeting / 会议', color: '#6366f1' },
  { value: 'data_collection', label: '📊 Data Collection / 数据收集', color: '#06b6d4' },
  { value: 'analysis', label: '🔬 Analysis / 分析', color: '#8b5cf6' },
  { value: 'report', label: '📄 Report / 报告', color: '#f59e0b' },
  { value: 'irb', label: '🏛️ IRB Review / IRB审查', color: '#ec4899' },
  { value: 'custom', label: '📌 Custom / 自定义', color: '#64748b' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ResearchCalendar: React.FC<Props> = ({ projectId }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const stored = localStorage.getItem(`calendar_${projectId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', type: 'milestone', description: '', date: '', status: 'upcoming' });

  const save = (updated: CalendarEvent[]) => {
    setEvents(updated);
    localStorage.setItem(`calendar_${projectId}`, JSON.stringify(updated));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const eventsForDay = (day: number) => events.filter(e => e.date === getDateStr(day));

  const createEvent = () => {
    if (!form.title || !form.date) return;
    const eventType = EVENT_TYPES.find(t => t.value === form.type);
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: form.title,
      date: form.date,
      type: form.type as any,
      description: form.description,
      status: form.status as any,
      color: eventType?.color || '#64748b',
    };
    save([...events, newEvent]);
    setForm({ title: '', type: 'milestone', description: '', date: '', status: 'upcoming' });
    setShowCreate(false);
    toast.success('Event created / 事件已创建');
  };

  const deleteEvent = (id: string) => {
    save(events.filter(e => e.id !== id));
  };

  const toggleStatus = (id: string) => {
    save(events.map(e => {
      if (e.id !== id) return e;
      const next = e.status === 'upcoming' ? 'in_progress' : e.status === 'in_progress' ? 'completed' : 'upcoming';
      return { ...e, status: next };
    }));
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Upcoming events / 即将到来的事件
  const upcoming = events.filter(e => e.date >= today && e.status !== 'completed').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const selectedDayEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Calendar size={22} className="text-emerald-600" />
            Research Calendar / 研究日历
          </h2>
          <p className="text-sm text-stone-500 mt-1">Plan milestones, deadlines, and research activities / 规划里程碑、截止日期和研究活动</p>
        </div>
        <button onClick={() => { setShowCreate(true); setForm({ ...form, date: selectedDate || today }); }} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
          <Plus size={14} /> Add Event / 添加事件
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title / 事件标题" className="col-span-2 px-3 py-2 rounded-lg border border-stone-200 text-sm" />
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="px-3 py-2 rounded-lg border border-stone-200 text-sm" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="px-3 py-2 rounded-lg border border-stone-200 text-sm">
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description / 描述" className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
          <div className="flex gap-2">
            <button onClick={createEvent} disabled={!form.title || !form.date} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium disabled:opacity-50">Create / 创建</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600">Cancel / 取消</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-stone-100"><ChevronLeft size={18} /></button>
            <h3 className="text-sm font-semibold text-stone-800">{MONTHS[month]} {year}</h3>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-stone-100"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-px">
            {DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-stone-400 py-2">{d}</div>)}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
              const dateStr = getDateStr(day);
              const dayEvents = eventsForDay(day);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`aspect-square rounded-lg p-1 text-left transition-all relative ${
                    isSelected ? 'bg-emerald-50 ring-2 ring-emerald-500' :
                    isToday ? 'bg-blue-50 ring-1 ring-blue-300' :
                    'hover:bg-stone-50'
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'font-bold text-blue-600' : 'text-stone-600'}`}>{day}</span>
                  <div className="flex gap-0.5 flex-wrap mt-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} title={e.title} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Day Events */}
          {selectedDate && (
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <h4 className="text-xs font-semibold text-stone-600 mb-2">{selectedDate}</h4>
              {selectedDayEvents.length === 0 && <p className="text-xs text-stone-400">No events / 无事件</p>}
              {selectedDayEvents.map(e => (
                <div key={e.id} className="flex items-start gap-2 py-2 border-b border-stone-50 last:border-0">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: e.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-stone-800">{e.title}</div>
                    {e.description && <p className="text-[10px] text-stone-500">{e.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => toggleStatus(e.id)} className={`text-[10px] px-1.5 py-0.5 rounded-full ${e.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : e.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-600'}`}>
                        {e.status}
                      </button>
                      <button onClick={() => deleteEvent(e.id)} className="text-[10px] text-stone-400 hover:text-red-500">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <h4 className="text-xs font-semibold text-stone-600 mb-2 flex items-center gap-1"><Clock size={12} /> Upcoming / 即将到来</h4>
            {upcoming.length === 0 && <p className="text-xs text-stone-400">No upcoming events / 无即将到来的事件</p>}
            {upcoming.map(e => (
              <div key={e.id} className="flex items-center gap-2 py-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                <span className="text-xs text-stone-700 flex-1 truncate">{e.title}</span>
                <span className="text-[10px] text-stone-400">{e.date.slice(5)}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <h4 className="text-xs font-semibold text-stone-600 mb-2">Summary / 概要</h4>
            <div className="space-y-1 text-xs text-stone-500">
              <div className="flex justify-between"><span>Total events</span><span className="font-medium text-stone-700">{events.length}</span></div>
              <div className="flex justify-between"><span>Completed</span><span className="font-medium text-emerald-600">{events.filter(e => e.status === 'completed').length}</span></div>
              <div className="flex justify-between"><span>In Progress</span><span className="font-medium text-blue-600">{events.filter(e => e.status === 'in_progress').length}</span></div>
              <div className="flex justify-between"><span>Upcoming</span><span className="font-medium text-stone-700">{events.filter(e => e.status === 'upcoming').length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchCalendar;
