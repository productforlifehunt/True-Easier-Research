import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check, X, AlertCircle } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AvailabilitySlot {
  date: string;
  time: string;
  duration: number;
  isAvailable: boolean;
  isBooked?: boolean;
  clientName?: string;
}

interface HelperAvailabilityCalendarProps {
  helperId: string;
  helperName?: string;
  isHelperView?: boolean;
  onSlotSelect?: (slot: AvailabilitySlot) => void;
}

const HelperAvailabilityCalendar: React.FC<HelperAvailabilityCalendarProps> = ({
  helperId,
  helperName,
  isHelperView = false,
  onSlotSelect
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availability, setAvailability] = useState<Record<string, AvailabilitySlot[]>>({});
  const [loading, setLoading] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadAvailability();
  }, [currentMonth, helperId]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('hfh_availability')
        .select('*')
        .eq('helper_id', helperId)
        .gte('date', startOfMonth.toISOString())
        .lte('date', endOfMonth.toISOString());

      if (error) throw error;

      const availabilityMap: Record<string, AvailabilitySlot[]> = {};
      
      // Generate default availability if no data exists
      if (!data || data.length === 0) {
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          availabilityMap[dateStr] = [];
          
          // Default: all weekday slots available, weekends unavailable
          const timeSlots = ['09:00', '11:00', '14:00', '16:00', '18:00'];
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          timeSlots.forEach(time => {
            availabilityMap[dateStr].push({
              date: dateStr,
              time,
              duration: 2,
              isAvailable: !isWeekend,
              isBooked: false
            });
          });
        }
      } else {
        data.forEach(slot => {
          const dateStr = slot.date.split('T')[0];
          if (!availabilityMap[dateStr]) {
            availabilityMap[dateStr] = [];
          }
          availabilityMap[dateStr].push({
            date: dateStr,
            time: slot.time,
            duration: slot.duration_hours,
            isAvailable: slot.is_available,
            isBooked: slot.is_booked,
            clientName: slot.client_name
          });
        });
      }

      setAvailability(availabilityMap);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlotAvailability = async (slot: AvailabilitySlot) => {
    if (!isHelperView) return;

    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      await supabase.from('hfh_availability').upsert({
        helper_id: helperId,
        date: slot.date,
        time: slot.time,
        duration_hours: slot.duration,
        is_available: !slot.isAvailable,
        is_booked: false
      });

      toast.success(`Slot ${!slot.isAvailable ? 'opened' : 'closed'} successfully`);
      loadAvailability();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const days = getDaysInMonth();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Calendar Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CalendarIcon size={20} />
            {isHelperView ? 'Manage Your Availability' : `${helperName || 'Helper'}'s Availability`}
          </h3>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={() => navigateMonth('prev')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{
              padding: '6px 16px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              fontWeight: 600,
              minWidth: '140px',
              textAlign: 'center'
            }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              onClick={() => navigateMonth('next')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#10b981',
              borderRadius: '3px'
            }} />
            <span>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#ef4444',
              borderRadius: '3px'
            }} />
            <span>Booked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#e5e7eb',
              borderRadius: '3px'
            }} />
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ padding: '20px' }}>
        {/* Day Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '8px'
        }}>
          {dayNames.map(day => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: '#6b7280',
                padding: '8px 0'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px'
        }}>
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} />;
            }

            const dateKey = formatDateKey(day);
            const daySlots = availability[dateKey] || [];
            const hasAvailable = daySlots.some(s => s.isAvailable);
            const allBooked = daySlots.length > 0 && daySlots.every(s => s.isBooked);
            const isSelected = selectedDate?.toDateString() === day.toDateString();

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDate(day)}
                style={{
                  aspectRatio: '1',
                  border: `2px solid ${isSelected ? '#10b981' : isToday(day) ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#f0fdf4' : isToday(day) ? '#eff6ff' : 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = isToday(day) ? '#eff6ff' : 'white';
                  }
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: isToday(day) ? 700 : 600,
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {day.getDate()}
                </div>
                
                {daySlots.length > 0 && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: hasAvailable ? '#10b981' : allBooked ? '#ef4444' : '#e5e7eb'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Slots */}
      {selectedDate && (
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={18} />
            Time Slots for {selectedDate.toLocaleDateString()}
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '12px'
          }}>
            {(availability[formatDateKey(selectedDate)] || []).map((slot, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (isHelperView) {
                    toggleSlotAvailability(slot);
                  } else if (slot.isAvailable && onSlotSelect) {
                    onSlotSelect(slot);
                  }
                }}
                disabled={!isHelperView && !slot.isAvailable}
                style={{
                  padding: '12px',
                  backgroundColor: slot.isAvailable ? '#f0fdf4' : slot.isBooked ? '#fef2f2' : '#f3f4f6',
                  border: `2px solid ${slot.isAvailable ? '#10b981' : slot.isBooked ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: isHelperView || slot.isAvailable ? 'pointer' : 'not-allowed',
                  opacity: !isHelperView && !slot.isAvailable ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: slot.isAvailable ? '#10b981' : slot.isBooked ? '#ef4444' : '#6b7280',
                  marginBottom: '4px'
                }}>
                  {slot.time}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280'
                }}>
                  {slot.duration}h session
                </div>
                {slot.isBooked && slot.clientName && (
                  <div style={{
                    fontSize: '10px',
                    color: '#ef4444',
                    marginTop: '4px'
                  }}>
                    {isHelperView ? slot.clientName : 'Booked'}
                  </div>
                )}
              </button>
            ))}
          </div>

          {isHelperView && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#e0f2fe',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#075985',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              Click on time slots to toggle availability. Green = Available, Red = Booked, Grey = Unavailable
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HelperAvailabilityCalendar;
