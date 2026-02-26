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
  const [selectedDay, setSelectedDay] = useState<number | null>(6); // Default to Day 6 for instant load
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [enrollment, setEnrollment] = useState<any>(null);
  const dayButtonRefs = React.useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const currentTimeRef = React.useRef<HTMLDivElement | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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
      
      // Check enrollment status and get current day
      const enrollmentData = await dataService.getSurveyEnrollment(user.id);
      
      if (enrollmentData) {
        setEnrollment(enrollmentData);
        
        // Get current survey day
        const day = await dataService.getCurrentSurveyDay(user.id);
        const displayDay = day > 0 ? day : 1;
        setCurrentDay(displayDay);
        
        // Update selected day if different from current
        if (displayDay !== selectedDay) {
          setSelectedDay(displayDay);
        }
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

  const getFilteredEntries = () => {
    let filtered = entries;
    
    // Filter by day using enrollment start date
    if (selectedDay !== null) {
      const studyStart = enrollment?.study_start_date || enrollment?.consent_signed_at || enrollment?.created_at;
      if (!studyStart) return entries; // Can't filter without a start date
      const startDate = new Date(studyStart);
      const dayStart = new Date(startDate);
      dayStart.setDate(dayStart.getDate() + (selectedDay - 1));
      dayStart.setHours(0, 0, 0, 0);
      
      // For Day 7 (or the last day), include all entries from that day onward
      const isLastDay = selectedDay === 7;
      const dayEnd = new Date(dayStart);
      if (!isLastDay) {
        dayEnd.setDate(dayEnd.getDate() + 1);
      } else {
        dayEnd.setFullYear(9999); // Include all future entries
      }
      
      filtered = entries.filter(entry => {
        const entryDate = new Date(entry.entry_timestamp);
        return entryDate >= dayStart && entryDate < dayEnd;
      });
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

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />
      <div className="max-w-6xl mx-auto px-6 py-4 pb-20 md:pb-6">
        {/* Header - Hidden on mobile */}
        <div className="mb-4 hidden md:block">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
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
                            onClick={() => navigate(`/entry/${entry.id}`)}
                            className="p-3 rounded-lg cursor-pointer hover:shadow-sm transition-all"
                            style={{ backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span
                                  className="text-xs font-medium px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: getEntryTypeColor(entry.entry_type),
                                    color: 'white'
                                  }}
                                >
                                  {entry.entry_type === 'care_activity' ? 'Activity' :
                                   entry.entry_type === 'care_need' ? 'Need' : 'Struggle'}
                                </span>
                                <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>
                                  {entry.description}
                                </p>
                                {entry.time_spent && (
                                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                    {entry.time_spent} min
                                  </p>
                                )}
                              </div>
                            </div>
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
