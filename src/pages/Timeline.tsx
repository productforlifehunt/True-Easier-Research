import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { dataService } from '../lib/dataService';
import { Clock, Plus, Calendar, Globe } from 'lucide-react';
import type { CareLogEntry } from '../types/care-log';
import { useLanguage } from '../hooks/useLanguage';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';
import AuthModal from '../components/AuthModal';

const Timeline: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<CareLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(6);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [enrollment, setEnrollment] = useState<any>(null);
  const dayButtonRefs = React.useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const currentTimeRef = React.useRef<HTMLDivElement | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { language, t } = useLanguage();
  const text = language === 'zh' ? {
    title: '时间线', day: '第', dayUnit: '天', noEntries: '此时间段暂无记录',
    addEntry: '添加记录', morning: '早晨', afternoon: '下午', evening: '晚上', night: '深夜'
  } : {
    title: 'Timeline', day: 'Day', dayUnit: '', noEntries: 'No entries for this time',
    addEntry: 'Add Entry', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night'
  };

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const enrollmentData = await dataService.getSurveyEnrollment(user.id);
      if (enrollmentData) {
        setEnrollment(enrollmentData);
        const day = await dataService.getCurrentSurveyDay(user.id);
        const displayDay = day > 0 ? day : 1;
        setCurrentDay(displayDay);
        if (displayDay !== selectedDay) setSelectedDay(displayDay);
      }
      await loadEntries();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('survey_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_timestamp', { ascending: true });
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  useEffect(() => {
    if (!loading && currentTimeRef.current) {
      setTimeout(() => {
        currentTimeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [loading]);

  useEffect(() => {
    if (selectedDay !== null && dayButtonRefs.current[selectedDay]) {
      setTimeout(() => {
        const button = dayButtonRefs.current[selectedDay];
        if (!button) return;
        const scrollContainer = button.parentElement?.parentElement;
        if (!scrollContainer) return;
        const buttonRect = button.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const scrollOffset = buttonRect.left + buttonRect.width / 2 - containerRect.left - containerRect.width / 2;
        scrollContainer.scrollBy({ left: scrollOffset, behavior: 'smooth' });
      }, 100);
    }
  }, [selectedDay]);

  if (!user) {
    return (
      <>
        <DesktopHeader />
        <MobileHeader />
        <AuthModal isOpen={true} onClose={() => {}} />
      </>
    );
  }

  const getFilteredEntries = () => {
    let filtered = entries;
    if (selectedDay !== null) {
      const studyStart = enrollment?.study_start_date || enrollment?.consent_signed_at || enrollment?.created_at;
      if (!studyStart) return entries;
      const startDate = new Date(studyStart);
      const dayStart = new Date(startDate);
      dayStart.setDate(dayStart.getDate() + (selectedDay - 1));
      dayStart.setHours(0, 0, 0, 0);
      const isLastDay = selectedDay === 7;
      const dayEnd = new Date(dayStart);
      if (!isLastDay) { dayEnd.setDate(dayEnd.getDate() + 1); } 
      else { dayEnd.setFullYear(9999); }
      filtered = entries.filter(entry => {
        const entryDate = new Date(entry.entry_timestamp);
        return entryDate >= dayStart && entryDate < dayEnd;
      });
    }
    if (selectedTimeSlot) {
      filtered = filtered.filter(entry => {
        const hour = new Date(entry.entry_timestamp).getHours();
        if (selectedTimeSlot === 'night') return hour >= 0 && hour < 6;
        if (selectedTimeSlot === 'morning') return hour >= 6 && hour < 12;
        if (selectedTimeSlot === 'afternoon') return hour >= 12 && hour < 17;
        if (selectedTimeSlot === 'evening') return hour >= 17 && hour < 24;
        return true;
      });
    }
    return filtered;
  };
  
  const getTimeSlotEntries = (hour: number) => {
    return getFilteredEntries().filter(entry => new Date(entry.entry_timestamp).getHours() === hour);
  };

  const getTimeSlotLabel = (hour: number) => {
    if (hour >= 6 && hour < 12) return text.morning;
    if (hour >= 12 && hour < 17) return text.afternoon;
    if (hour >= 17 && hour < 21) return text.evening;
    return text.night;
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'care_activity': return 'var(--color-green)';
      case 'care_need': return '#fb923c';
      case 'struggle': return '#ef4444';
      default: return 'var(--text-secondary)';
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const PillButton = React.forwardRef<HTMLButtonElement, any>(({ active, onClick, children }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="rounded-full font-medium transition-all"
      style={{
        backgroundColor: active ? 'var(--color-green)' : 'rgba(120, 120, 128, 0.08)',
        color: active ? 'white' : 'var(--text-secondary)',
        padding: '7px 14px',
        fontSize: '13px',
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap' as const,
        boxShadow: active ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none'
      }}
    >
      {children}
    </button>
  ));

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <DesktopHeader />
      <MobileHeader />
      <div className="max-w-3xl mx-auto px-5 py-4 pb-20 md:pb-6">
        {/* Header */}
        <div className="mb-4 hidden md:block">
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
        </div>

        {/* Day Selector */}
        <div className="mb-3 -mx-5 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
          <div className="flex gap-1.5" style={{ width: 'max-content' }}>
            <PillButton active={selectedDay === null} onClick={() => setSelectedDay(null)}>
              {language === 'zh' ? '全部' : 'All'}
            </PillButton>
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <PillButton 
                key={day}
                ref={(el: HTMLButtonElement | null) => dayButtonRefs.current[day] = el}
                active={selectedDay === day} 
                onClick={() => setSelectedDay(day)}
              >
                {text.day} {day}{text.dayUnit}
              </PillButton>
            ))}
          </div>
        </div>

        {/* Time Slot Filters */}
        <div className="mb-4 -mx-5 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-1.5" style={{ width: 'max-content' }}>
            <PillButton active={selectedTimeSlot === null} onClick={() => setSelectedTimeSlot(null)}>
              {language === 'zh' ? '全天' : 'All Day'}
            </PillButton>
            {['night', 'morning', 'afternoon', 'evening'].map(slot => (
              <PillButton key={slot} active={selectedTimeSlot === slot} onClick={() => setSelectedTimeSlot(slot)}>
                {slot === 'night' ? text.night : slot === 'morning' ? text.morning : slot === 'afternoon' ? text.afternoon : text.evening}
              </PillButton>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl p-4 md:p-5" style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="space-y-0">
            {hours.map(hour => {
              const slotEntries = getTimeSlotEntries(hour);
              const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
              const periodLabel = hour % 6 === 0 ? getTimeSlotLabel(hour) : null;
              const currentHour = new Date().getHours();
              const isCurrentHour = hour === currentHour;

              return (
                <div key={hour} className="relative" ref={isCurrentHour ? currentTimeRef : null}>
                  {periodLabel && (
                    <div className="text-[11px] font-semibold uppercase tracking-wider mb-2 mt-5 first:mt-0" style={{ color: 'var(--text-muted)' }}>
                      {periodLabel}
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    {/* Time Label */}
                    <div className="pt-2.5 relative" style={{ 
                      color: isCurrentHour ? 'var(--color-green)' : 'var(--text-muted)', 
                      minWidth: '42px',
                      fontSize: '12px',
                      fontWeight: isCurrentHour ? '600' : '400',
                      fontVariantNumeric: 'tabular-nums'
                    }}>
                      {timeLabel}
                    </div>

                    {/* Timeline Line and Content */}
                    <div className="flex-1 relative pb-1">
                      <div className="absolute left-2 top-0 bottom-0 w-px" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />

                      {/* Hour Dot */}
                      <div
                        className="absolute left-0.5 top-2.5 rounded-full"
                        style={{
                          width: isCurrentHour ? '12px' : '8px',
                          height: isCurrentHour ? '12px' : '8px',
                          backgroundColor: isCurrentHour ? 'var(--color-green)' : (slotEntries.length > 0 ? getEntryTypeColor(slotEntries[0].entry_type) : 'rgba(0,0,0,0.08)'),
                          boxShadow: isCurrentHour ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none',
                          transition: 'all 0.3s ease',
                          marginLeft: isCurrentHour ? '-2px' : '0'
                        }}
                      />

                      {/* Entries */}
                      <div className="ml-7 min-h-[32px]">
                        {slotEntries.length > 0 ? (
                          <div className="space-y-1.5">
                            {slotEntries.map(entry => (
                              <div
                                key={entry.id}
                                onClick={() => navigate(`/entry/${entry.id}`)}
                                className="p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
                                style={{ backgroundColor: 'var(--bg-secondary)' }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <span
                                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                      style={{
                                        backgroundColor: `${getEntryTypeColor(entry.entry_type)}15`,
                                        color: getEntryTypeColor(entry.entry_type)
                                      }}
                                    >
                                      {entry.entry_type === 'care_activity' ? 'Activity' :
                                       entry.entry_type === 'care_need' ? 'Need' : 'Struggle'}
                                    </span>
                                    <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                                      {entry.description}
                                    </p>
                                    {entry.time_spent && (
                                      <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                        {entry.time_spent} min
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-1" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
