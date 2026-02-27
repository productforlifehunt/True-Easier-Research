import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { dataService } from '../lib/dataService';
import { Clock, Plus, Calendar, Globe, Moon, Pencil, Trash2 } from 'lucide-react';
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
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // null = show all
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [enrollmentStartDate, setEnrollmentStartDate] = useState<string | null>(null);
  const dayButtonRefs = React.useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const currentTimeRef = React.useRef<HTMLDivElement | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const { language, t } = useLanguage();
  const text = language === 'zh' ? {
    title: '时间线',
    day: '第',
    dayUnit: '天',
    noEntries: '此时间段暂无记录',
    addEntry: '添加记录',
    morning: '早晨',
    afternoon: '下午',
    evening: '晚上',
    night: '深夜'
  } : {
    title: 'Timeline',
    day: 'Day',
    dayUnit: '',
    noEntries: 'No entries for this time',
    addEntry: 'Add Entry',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night'
  };

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check enrollment status and get start date for day calculation
      const enrollmentData = await dataService.getSurveyEnrollment(user.id);
      
      if (enrollmentData?.start_date) {
        setEnrollmentStartDate(enrollmentData.start_date);
        
        // Calculate current day based on start_date
        const startDate = new Date(enrollmentData.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const day = Math.max(1, Math.min(7, daysDiff + 1));
        setCurrentDay(day);
        setSelectedDay(day);
      } else {
        // No enrollment — default to showing all entries (today)
        setSelectedDay(null);
      }
      
      // Load entries
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

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Auto-scroll to current time
  useEffect(() => {
    if (!loading && currentTimeRef.current) {
      setTimeout(() => {
        currentTimeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    }
  }, [loading]);

  // Auto-scroll to selected day button
  useEffect(() => {
    if (selectedDay !== null && dayButtonRefs.current[selectedDay]) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        const button = dayButtonRefs.current[selectedDay];
        if (!button) return;
        
        // Find the scrollable container (overflow-x-auto parent)
        const scrollContainer = button.parentElement?.parentElement;
        if (!scrollContainer) return;
        
        // Calculate scroll position to center the button
        const buttonRect = button.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const buttonCenter = buttonRect.left + buttonRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const scrollOffset = buttonCenter - containerCenter;
        
        // Scroll the container
        scrollContainer.scrollBy({
          left: scrollOffset,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [selectedDay]);

  // Auth protection - return early if not logged in (AFTER all hooks)
  if (!user) {
    return (
      <>
        <DesktopHeader />
        <MobileHeader />
        <AuthModal isOpen={true} onClose={() => {}} />
      </>
    );
  }

  // Get the calendar date for a given survey day number (1-7)
  const getDateForDay = (dayNum: number): string | null => {
    if (!enrollmentStartDate) return null;
    const start = new Date(enrollmentStartDate);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + (dayNum - 1));
    return start.toISOString().split('T')[0];
  };

  const getFilteredEntries = () => {
    let filtered = entries;
    
    // Filter by day using actual calendar dates
    if (selectedDay !== null) {
      const targetDate = getDateForDay(selectedDay);
      if (targetDate) {
        filtered = filtered.filter(entry => {
          if (!entry.entry_timestamp) return false;
          const entryDate = new Date(entry.entry_timestamp).toISOString().split('T')[0];
          return entryDate === targetDate;
        });
      } else {
        // No enrollment start date — filter by "today" as fallback
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(entry => {
          if (!entry.entry_timestamp) return false;
          const entryDate = new Date(entry.entry_timestamp).toISOString().split('T')[0];
          return entryDate === today;
        });
      }
    }
    
    // Filter by time slot if selected
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
    const filtered = getFilteredEntries();
    return filtered.filter(entry => {
      const entryHour = new Date(entry.entry_timestamp).getHours();
      return entryHour === hour;
    });
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

  // Build a meaningful summary for an entry
  const getEntrySummary = (entry: CareLogEntry): string => {
    const parts: string[] = [];
    
    // Activity categories
    if (entry.activity_categories?.length > 0) {
      const categoryLabels: Record<string, string> = {
        adl_clinical: language === 'zh' ? '临床护理' : 'Clinical Care',
        adl_functional: language === 'zh' ? '功能护理' : 'Functional Care',
        iadl_logistics: language === 'zh' ? '后勤支持' : 'Logistics',
        iadl_household: language === 'zh' ? '家务' : 'Household',
        emotional_support: language === 'zh' ? '情感支持' : 'Emotional Support',
        supervision: language === 'zh' ? '监督' : 'Supervision',
        social_activities: language === 'zh' ? '社交活动' : 'Social Activities',
      };
      const labels = entry.activity_categories.map(c => categoryLabels[c] || c).join(', ');
      parts.push(labels);
    }
    
    if (entry.description) {
      parts.push(entry.description);
    }
    
    // Affect ratings summary
    const affects = [
      entry.affect_cheerful, entry.affect_relaxed, entry.affect_enthusiastic, entry.affect_satisfied,
      entry.affect_insecure, entry.affect_lonely, entry.affect_anxious, entry.affect_irritated,
      entry.affect_down, entry.affect_desperate, entry.affect_tensed
    ].filter(a => a && a !== '');
    if (affects.length > 0) {
      parts.push(language === 'zh' ? `${affects.length}项情绪已记录` : `${affects.length} affect ratings`);
    }
    
    // MBP
    if (entry.mbp_memory || entry.mbp_behavior || entry.mbp_depression) {
      parts.push(language === 'zh' ? 'MBP已记录' : 'MBP recorded');
    }
    
    // Stress
    if (entry.event_stress_rating && entry.event_stress_rating !== 0) {
      parts.push(language === 'zh' ? `压力: ${entry.event_stress_rating}` : `Stress: ${entry.event_stress_rating}`);
    }
    
    if (parts.length === 0) {
      return language === 'zh' ? '(已记录)' : '(recorded)';
    }
    return parts.join(' · ');
  };

  const handleDelete = async (entryId: number) => {
    try {
      const { error } = await supabase
        .from('survey_entries')
        .delete()
        .eq('id', entryId);
      if (error) throw error;
      setEntries(prev => prev.filter(e => e.id !== entryId));
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-20 md:pb-6">
        {/* Header - Hidden on mobile */}
        <div className="mb-3 hidden md:flex md:items-center md:justify-between">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
          <button
            onClick={() => navigate('/end-of-day')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: '#8b5cf6', color: 'white' }}
          >
            <Moon className="w-3.5 h-3.5" />
            {language === 'zh' ? '每日问卷' : 'End-of-Day Survey'}
          </button>
        </div>

        {/* Day Selector - Fixed Horizontal Scrollable */}
        <div className="mb-4 -mx-3 px-3 overflow-x-auto">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            <button
              onClick={() => setSelectedDay(null)}
              className="rounded-lg font-medium transition-all"
              style={{
                backgroundColor: selectedDay === null ? 'var(--color-green)' : 'var(--bg-secondary)',
                color: selectedDay === null ? 'white' : 'var(--text-secondary)',
                minWidth: 'clamp(3.5rem, 10vw, 5rem)',
                minHeight: '2.75rem',
                padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
                whiteSpace: 'nowrap'
              }}
            >
              {language === 'zh' ? '全部' : 'All'}
            </button>
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <button
                key={day}
                ref={(el) => dayButtonRefs.current[day] = el}
                onClick={() => setSelectedDay(day)}
                className="rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: selectedDay === day ? 'var(--color-green)' : 'var(--bg-secondary)',
                  color: selectedDay === day ? 'white' : 'var(--text-secondary)',
                  minWidth: 'clamp(3.5rem, 10vw, 5rem)',
                  minHeight: '2.75rem',
                  padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
                  whiteSpace: 'nowrap'
                }}
              >
                {text.day} {day}{text.dayUnit}
              </button>
            ))}
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="h-px mb-4" style={{ backgroundColor: 'var(--border-light)' }}></div>

        {/* Time Slot Filters */}
        <div className="mb-4 -mx-3 px-3 overflow-x-auto">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            <button
              onClick={() => setSelectedTimeSlot(null)}
              className="rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: selectedTimeSlot === null ? 'var(--color-green)' : 'var(--bg-secondary)',
                color: selectedTimeSlot === null ? 'white' : 'var(--text-secondary)',
                minHeight: '2.5rem',
                padding: '0.5rem 1rem',
                whiteSpace: 'nowrap'
              }}
            >
              {language === 'zh' ? '全天' : 'All Day'}
            </button>
            {['night', 'morning', 'afternoon', 'evening'].map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedTimeSlot(slot)}
                className="rounded-lg font-medium text-sm transition-all"
                style={{
                  backgroundColor: selectedTimeSlot === slot ? 'var(--color-green)' : 'var(--bg-secondary)',
                  color: selectedTimeSlot === slot ? 'white' : 'var(--text-secondary)',
                  minHeight: '2.5rem',
                  padding: '0.5rem 1rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {slot === 'night' ? text.night : 
                 slot === 'morning' ? text.morning :
                 slot === 'afternoon' ? text.afternoon : text.evening}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          {hours.map(hour => {
            const slotEntries = getTimeSlotEntries(hour);
            const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
            const periodLabel = hour % 6 === 0 ? getTimeSlotLabel(hour) : null;
            const currentHour = new Date().getHours();
            const isCurrentHour = hour === currentHour;

            return (
              <div key={hour} className="relative" ref={isCurrentHour ? currentTimeRef : null}>
                {periodLabel && (
                  <div className="text-sm font-semibold mb-2 mt-4" style={{ color: 'var(--text-secondary)' }}>
                    {periodLabel}
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  {/* Time Label */}
                  <div className="text-sm font-medium pt-2 relative" style={{ 
                    color: isCurrentHour ? 'var(--color-green)' : 'var(--text-muted)', 
                    minWidth: 'clamp(3rem, 8vw, 4rem)',
                    fontWeight: isCurrentHour ? '600' : '500'
                  }}>
                    {timeLabel}
                    {isCurrentHour && (
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-green)' }}></div>
                      </div>
                    )}
                  </div>

                  {/* Timeline Line and Content */}
                  <div className="flex-1 relative">
                    {/* Vertical Line */}
                    <div
                      className="absolute left-3 top-0 bottom-0 w-0.5"
                      style={{ backgroundColor: 'var(--border-light)' }}
                    />

                    {/* Hour Dot */}
                    <div
                      className={`absolute left-1.5 top-2 rounded-full border-2 ${
                        slotEntries.length > 0 ? '' : 'bg-white'
                      }`}
                      style={{
                        width: isCurrentHour ? 'clamp(1rem, 2.5vw, 1.25rem)' : 'clamp(0.875rem, 2vw, 1rem)',
                        height: isCurrentHour ? 'clamp(1rem, 2.5vw, 1.25rem)' : 'clamp(0.875rem, 2vw, 1rem)',
                        borderColor: isCurrentHour ? 'var(--color-green)' : (slotEntries.length > 0 ? getEntryTypeColor(slotEntries[0].entry_type) : 'var(--border-light)'),
                        backgroundColor: isCurrentHour ? 'var(--color-green)' : (slotEntries.length > 0 ? getEntryTypeColor(slotEntries[0].entry_type) : 'white'),
                        boxShadow: isCurrentHour ? '0 0 0 4px rgba(34, 197, 94, 0.2)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />

                    {/* Entries */}
                    <div className="ml-10 space-y-2 min-h-[40px]">
                      {slotEntries.length > 0 ? (
                        slotEntries.map(entry => (
                          <div
                            key={entry.id}
                            className="p-3 rounded-lg transition-all"
                            style={{ backgroundColor: 'var(--bg-secondary)' }}
                          >
                            {/* Delete confirmation */}
                            {deletingId === entry.id ? (
                              <div className="flex items-center justify-between">
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                  {language === 'zh' ? '确定删除？' : 'Delete this entry?'}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="px-3 py-1 rounded text-xs font-medium text-white"
                                    style={{ backgroundColor: '#ef4444' }}
                                  >
                                    {language === 'zh' ? '删除' : 'Delete'}
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(null)}
                                    className="px-3 py-1 rounded text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
                                  >
                                    {language === 'zh' ? '取消' : 'Cancel'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-2">
                                <div
                                  className="flex-1 cursor-pointer"
                                  onClick={() => navigate(`/edit-entry/${entry.id}`)}
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className="text-xs font-medium px-2 py-0.5 rounded"
                                      style={{
                                        backgroundColor: getEntryTypeColor(entry.entry_type),
                                        color: 'white'
                                      }}
                                    >
                                      {entry.entry_type === 'care_activity'
                                        ? (language === 'zh' ? '活动' : 'Activity')
                                        : entry.entry_type === 'care_need'
                                        ? (language === 'zh' ? '需求' : 'Need')
                                        : (language === 'zh' ? '困难' : 'Struggle')}
                                    </span>
                                    {entry.time_spent > 0 && (
                                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {entry.time_spent} min
                                      </span>
                                    )}
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                      {new Date(entry.entry_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-1.5 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                                    {getEntrySummary(entry)}
                                  </p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0 pt-0.5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/edit-entry/${entry.id}`); }}
                                    className="p-1.5 rounded-md hover:opacity-80 transition-all"
                                    style={{ color: 'var(--text-muted)' }}
                                    title={language === 'zh' ? '编辑' : 'Edit'}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setDeletingId(entry.id); }}
                                    className="p-1.5 rounded-md hover:opacity-80 transition-all"
                                    style={{ color: '#ef4444' }}
                                    title={language === 'zh' ? '删除' : 'Delete'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-2">
                          {/* Empty slot */}
                        </div>
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
  );
};

export default Timeline;
