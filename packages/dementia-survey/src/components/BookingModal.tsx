import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign, MessageSquare, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface BookingModalProps {
  helper: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ helper, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [location, setLocation] = useState('');
  const [service, setService] = useState(helper.services?.[0] || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !location || !service) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to book');
        return;
      }

      // Check if client profile exists
      let { data: clientProfile } = await supabase
        .from('hfh_clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Create client profile if doesn't exist
      if (!clientProfile) {
        const { data: newClient } = await supabase
          .from('hfh_clients')
          .insert([{
            user_id: user.id,
            name: user.email?.split('@')[0] || 'User',
            email: user.email,
            location: location
          }])
          .select()
          .single();
        clientProfile = newClient;
      }

      // Create booking
      const bookingDate = new Date(selectedDate);
      const { error } = await supabase
        .from('hfh_bookings')
        .insert([{
          client_id: clientProfile.id,
          helper_id: helper.id,
          service: service,
          date: bookingDate.toISOString().split('T')[0],
          start_time: selectedTime,
          duration: duration,
          location: location,
          special_instructions: message,
          status: 'pending',
          total_cost: helper.hourly_rate * duration
        }]);

      if (error) throw error;

      toast.success('Booking request sent successfully!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return (helper.hourly_rate * duration).toFixed(2);
  };

  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };
  
  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  const formatDateForDisplay = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '680px',
        maxHeight: '85vh',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        animation: 'slideUp 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* macOS Style Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f5f5f7',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={helper.avatar_url || helper.profile_image_url || `https://ui-avatars.com/api/?name=${helper.name}&background=10b981&color=white`}
              alt={helper.name}
              style={{ 
                width: 48, 
                height: 48, 
                borderRadius: '12px',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
            <div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 700, 
                margin: 0,
                color: '#1d1d1f',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
              }}>
                Book {helper.name}
              </h3>
              <p style={{ fontSize: '14px', color: '#86868b', margin: 0 }}>
                ${helper.hourly_rate}/hour • {helper.location || 'San Francisco'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'white',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              padding: 0,
              cursor: 'pointer',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <X size={16} color="#86868b" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {step === 1 && (
            <>
              {/* Service Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Select Service
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  {helper.services?.map((s: string, idx: number) => (
                    <option key={`${s}-${idx}`} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '16px'
                }}>
                  <Calendar size={18} color="#10b981" />
                  Select Date
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '8px',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid #f3f4f6'
                }}>
                  {generateDates().slice(0, 21).map((date) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <button
                        type="button"
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid #10b981' : '1px solid #e5e7eb',
                          backgroundColor: isSelected ? '#ecfdf5' : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease-in-out',
                          boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <span style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          fontWeight: 600
                        }}>
                          {date.toLocaleDateString('en', { weekday: 'short' })}
                        </span>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#10b981' : '#111827'
                        }}>
                          {date.getDate()}
                        </span>
                        {isToday && (
                          <span style={{
                            fontSize: '8px',
                            color: '#10b981',
                            fontWeight: 600
                          }}>●</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

                {/* Duration */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Duration (hours)
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    {[1, 2, 3, 4, 5, 6].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setDuration(hours)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 'var(--radius-md)',
                          border: duration === hours ? '2px solid #10b981' : '1px solid #e5e7eb',
                          backgroundColor: 'white',
                          color: duration === hours ? '#10b981' : '#374151',
                          fontSize: '14px',
                          fontWeight: duration === hours ? 600 : 400,
                          cursor: 'pointer'
                        }}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>

              {/* Time Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '16px'
                }}>
                  <Clock size={18} color="#10b981" />
                  Select Time
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px'
                }}>
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: selectedTime === time ? '2px solid #10b981' : '1px solid #e5e7eb',
                        backgroundColor: selectedTime === time ? '#f0fdf4' : 'white',
                        color: selectedTime === time ? '#059669' : '#374151',
                        fontSize: '14px',
                        fontWeight: selectedTime === time ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTime !== time) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTime !== time) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!selectedDate || !selectedTime) {
                    toast.error('Please select date and time');
                    return;
                  }
                  setStep(2);
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Continue
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Location */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  <MapPin size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Service Location
                </label>
                <textarea
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter the address where service is needed"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'none',
                    minHeight: '80px'
                  }}
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  <MessageSquare size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any special requests or information for the helper"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'none',
                    minHeight: '100px'
                  }}
                />
              </div>

              {/* Summary */}
              <div style={{
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '12px'
                }}>
                  Booking Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Service</span>
                    <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>{service}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Date</span>
                    <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>
                      {selectedDate?.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Time</span>
                    <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>
                      {selectedTime} ({duration} hours)
                    </span>
                  </div>
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '8px',
                    marginTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ color: '#111827', fontSize: '16px', fontWeight: 600 }}>Total</span>
                    <span style={{ color: '#10b981', fontSize: '18px', fontWeight: 700 }}>
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '14px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                  {!loading && <Check size={18} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
