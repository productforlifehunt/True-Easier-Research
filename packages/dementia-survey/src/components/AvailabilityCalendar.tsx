import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Check } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

interface AvailabilityCalendarProps {
  helperId: string;
  onDateTimeSelect?: (date: Date, time: string) => void;
  selectedDate?: Date | null;
  selectedTime?: string | null;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  helperId,
  onDateTimeSelect,
  selectedDate: externalSelectedDate,
  selectedTime: externalSelectedTime
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(externalSelectedDate || null);
  const [selectedTime, setSelectedTime] = useState<string | null>(externalSelectedTime || null);
  const [availability, setAvailability] = useState<{[key: string]: TimeSlot[]}>({});
  const [loading, setLoading] = useState(false);

  // Time slots for each day (8 AM to 8 PM)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour <= 20; hour++) {
      const time = hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
      const halfTime = hour < 12 ? `${hour}:30 AM` : hour === 12 ? '12:30 PM' : `${hour - 12}:30 PM`;
      
      // Simulate availability (in production, this would come from database)
      const isAvailable = Math.random() > 0.3; // 70% available
      
      slots.push({ time, available: isAvailable, booked: false });
      if (hour < 20) {
        slots.push({ time: halfTime, available: isAvailable, booked: false });
      }
    }
    return slots;
  };

  // Load availability data
  useEffect(() => {
    loadAvailability();
  }, [currentMonth, helperId]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      // Simulate loading availability from database
      // In production, this would be a real API call
      const newAvailability: {[key: string]: TimeSlot[]} = {};
      
      const daysInMonth = getDaysInMonth();
      daysInMonth.forEach(date => {
        const dateKey = date.toISOString().split('T')[0];
        newAvailability[dateKey] = generateTimeSlots();
      });
      
      setAvailability(newAvailability);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (): Date[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const getMonthStart = (): Date => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month, 1);
  };

  const getCalendarDays = (): (Date | null)[] => {
    const monthStart = getMonthStart();
    const startDayOfWeek = monthStart.getDay();
    const daysInMonth = getDaysInMonth();
    
    // Add empty slots for days before month starts
    const calendarDays: (Date | null)[] = Array(startDayOfWeek).fill(null);
    
    // Add all days in month
    calendarDays.push(...daysInMonth);
    
    // Add empty slots to complete the grid (6 rows × 7 days = 42 cells)
    while (calendarDays.length < 42) {
      calendarDays.push(null);
    }
    
    return calendarDays;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      setSelectedTime(time);
      if (onDateTimeSelect) {
        onDateTimeSelect(selectedDate, time);
      }
    }
  };

  const isDateAvailable = (date: Date): boolean => {
    const dateKey = date.toISOString().split('T')[0];
    const slots = availability[dateKey] || [];
    return slots.some(slot => slot.available && !slot.booked);
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = getCalendarDays();
  const selectedDateKey = selectedDate?.toISOString().split('T')[0];
  const timeSlots = selectedDateKey ? availability[selectedDateKey] || [] : [];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Calendar Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CalendarIcon size={24} style={{ color: '#10b981' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Select Date & Time
          </h3>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              padding: '8px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div style={{
            padding: '8px 16px',
            fontSize: '15px',
            fontWeight: 600,
            color: '#374151',
            minWidth: '150px',
            textAlign: 'center'
          }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          
          <button
            onClick={goToNextMonth}
            style={{
              padding: '8px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Calendar Grid */}
        <div>
          {/* Day names */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '4px',
            marginBottom: '8px'
          }}>
            {dayNames.map(day => (
              <div key={day} style={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: '#6b7280',
                padding: '8px 0'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '4px'
          }}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} style={{ padding: '8px' }} />;
              }

              const available = isDateAvailable(date);
              const selected = isDateSelected(date);
              const today = isToday(date);
              const past = isPastDate(date);
              const disabled = past || !available;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !disabled && handleDateSelect(date)}
                  disabled={disabled}
                  style={{
                    padding: '12px 8px',
                    backgroundColor: selected ? '#10b981' : today ? '#f0fdf4' : 'white',
                    color: selected ? 'white' : disabled ? '#d1d5db' : '#111827',
                    border: `1px solid ${selected ? '#10b981' : today ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: selected || today ? 600 : 500,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    if (!disabled && !selected) {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#10b981';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!disabled && !selected) {
                      e.currentTarget.style.backgroundColor = today ? '#f0fdf4' : 'white';
                      e.currentTarget.style.borderColor = today ? '#10b981' : '#e5e7eb';
                    }
                  }}
                >
                  {date.getDate()}
                  {available && !past && (
                    <div style={{
                      width: '4px',
                      height: '4px',
                      backgroundColor: selected ? 'white' : '#10b981',
                      borderRadius: '50%',
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <Clock size={18} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              {selectedDate 
                ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
                : 'Select a date'}
            </span>
          </div>

          {selectedDate ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '4px'
            }}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isDisabled = !slot.available || slot.booked;

                return (
                  <button
                    key={slot.time}
                    onClick={() => !isDisabled && handleTimeSelect(slot.time)}
                    disabled={isDisabled}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: isSelected ? '#10b981' : 'white',
                      color: isSelected ? 'white' : isDisabled ? '#d1d5db' : '#374151',
                      border: `1px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseOver={(e) => {
                      if (!isDisabled && !isSelected) {
                        e.currentTarget.style.backgroundColor = '#f0fdf4';
                        e.currentTarget.style.borderColor = '#10b981';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isDisabled && !isSelected) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    {isSelected && <Check size={14} />}
                    {slot.time}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              color: '#9ca3af',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              <CalendarIcon size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
              Select a date to view<br />available time slots
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        gap: '24px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '4px' }} />
          <span style={{ color: '#6b7280' }}>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '4px' }} />
          <span style={{ color: '#6b7280' }}>Today</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} />
          <span style={{ color: '#6b7280' }}>Available</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
