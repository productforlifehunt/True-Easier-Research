import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, DollarSign, AlertCircle, Zap, RefreshCw, Gift, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isToday, isBefore } from 'date-fns';
import toast from 'react-hot-toast';

interface BookingCalendarProps {
  helper: any;
  onClose: () => void;
  onConfirm: (booking: any) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ helper, onClose, onConfirm }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState(2);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('weekly');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [groupSize, setGroupSize] = useState(1);
  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [addInsurance, setAddInsurance] = useState(false);
  
  // Available time slots
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  // Calculate pricing
  const calculatePricing = () => {
    let baseRate = helper.hourly_rate || 50;
    
    // Surge pricing for urgent bookings
    if (isUrgent) {
      baseRate *= 1.5;
    }
    
    // Group discount
    if (groupSize > 1) {
      baseRate *= (1 - (groupSize - 1) * 0.05); // 5% discount per additional person
    }
    
    const serviceTotal = baseRate * duration * (isRecurring ? 4 : 1); // Monthly for recurring
    const insuranceFee = addInsurance ? serviceTotal * 0.05 : 0;
    const platformFee = serviceTotal * 0.15;
    const total = serviceTotal + insuranceFee + platformFee;
    
    return {
      baseRate,
      serviceTotal,
      insuranceFee,
      platformFee,
      total
    };
  };

  const pricing = calculatePricing();

  // Calendar rendering
  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      const currentDay = day;
      const isDisabled = isBefore(currentDay, new Date());
      const isSelected = selectedDate && isSameDay(currentDay, selectedDate);
      
      days.push(
        <div
          key={currentDay.toString()}
          onClick={() => !isDisabled && setSelectedDate(currentDay)}
          style={{
            padding: '12px',
            textAlign: 'center',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            backgroundColor: isSelected ? '#10b981' : isToday(currentDay) ? '#f0fdf4' : 'white',
            color: isSelected ? 'white' : isDisabled ? '#d1d5db' : '#374151',
            borderRadius: '8px',
            fontWeight: isToday(currentDay) || isSelected ? 600 : 400,
            fontSize: '14px',
            transition: 'all 0.2s',
            border: isToday(currentDay) && !isSelected ? '2px solid #10b981' : '2px solid transparent'
          }}
          onMouseOver={(e) => {
            if (!isDisabled && !isSelected) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseOut={(e) => {
            if (!isDisabled && !isSelected) {
              e.currentTarget.style.backgroundColor = isToday(currentDay) ? '#f0fdf4' : 'white';
            }
          }}
        >
          {format(currentDay, 'd')}
        </div>
      );
      day = addDays(day, 1);
    }
    
    return days;
  };

  const handleBookingConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    
    const booking = {
      helper_id: helper.id,
      date: selectedDate,
      time: selectedTime,
      duration,
      isRecurring,
      recurringFrequency,
      recurringEndDate,
      isUrgent,
      groupSize,
      notes,
      promoCode,
      addInsurance,
      pricing
    };
    
    onConfirm(booking);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              Book {helper.name}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              ${helper.hourly_rate}/hour • {helper.service_type}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: '24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', padding: '32px' }}>
          {/* Left Column - Calendar & Options */}
          <div style={{ flex: 1 }}>
            {/* Calendar */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                  Select Date
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: 600, minWidth: '140px', textAlign: 'center' }}>
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              {/* Days of week */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                marginBottom: '8px'
              }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    padding: '8px'
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
                {renderCalendarDays()}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                  Select Time
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px'
                }}>
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      style={{
                        padding: '10px',
                        backgroundColor: selectedTime === time ? '#10b981' : '#f3f4f6',
                        color: selectedTime === time ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: selectedTime === time ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Duration (hours)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                  <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Special Options */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                Special Options
              </h3>
              
              {/* Urgent Booking */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                />
                <Zap size={16} color="#f59e0b" />
                <span style={{ fontSize: '14px' }}>Urgent booking (+50% surge pricing)</span>
              </label>
              
              {/* Recurring */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <RefreshCw size={16} color="#10b981" />
                <span style={{ fontSize: '14px' }}>Make this recurring</span>
              </label>
              
              {isRecurring && (
                <div style={{ marginLeft: '24px', marginBottom: '12px' }}>
                  <select
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      marginRight: '8px'
                    }}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    placeholder="End date"
                    style={{
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              )}
              
              {/* Insurance */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={addInsurance}
                  onChange={(e) => setAddInsurance(e.target.checked)}
                />
                <Shield size={16} color="#6366f1" />
                <span style={{ fontSize: '14px' }}>Add booking insurance (+5%)</span>
              </label>
            </div>
          </div>

          {/* Right Column - Pricing Summary */}
          <div style={{
            width: '320px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '24px',
            height: 'fit-content'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '20px' }}>
              Booking Summary
            </h3>
            
            {/* Group Size */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Group Size
              </label>
              <select
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                ))}
              </select>
              {groupSize > 1 && (
                <p style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                  Group discount applied!
                </p>
              )}
            </div>
            
            {/* Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Special Instructions
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements or notes..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  minHeight: '60px',
                  backgroundColor: 'white'
                }}
              />
            </div>
            
            {/* Promo Code */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                <Gift size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Promo Code
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: 'white'
                }}
              />
            </div>
            
            {/* Price Breakdown */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Service ({duration}hr × ${pricing.baseRate.toFixed(0)}/hr)
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  ${pricing.serviceTotal.toFixed(2)}
                </span>
              </div>
              
              {isUrgent && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#f59e0b' }}>
                    <Zap size={12} style={{ display: 'inline' }} /> Urgent surcharge
                  </span>
                  <span style={{ fontSize: '14px', color: '#f59e0b' }}>
                    Included
                  </span>
                </div>
              )}
              
              {addInsurance && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Booking insurance
                  </span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    ${pricing.insuranceFee.toFixed(2)}
                  </span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Platform fee
                </span>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  ${pricing.platformFee.toFixed(2)}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                  Total
                </span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
                  ${pricing.total.toFixed(2)}
                </span>
              </div>
              
              {isRecurring && (
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>
                  *Charged {recurringFrequency}
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={handleBookingConfirm}
              disabled={!selectedDate || !selectedTime}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: selectedDate && selectedTime ? '#10b981' : '#e5e7eb',
                color: selectedDate && selectedTime ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed',
                marginBottom: '12px'
              }}
            >
              Proceed to Payment
            </button>
            
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            {/* Trust Badges */}
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
                <Shield size={20} color="#10b981" />
                <Clock size={20} color="#10b981" />
                <DollarSign size={20} color="#10b981" />
              </div>
              <p style={{ fontSize: '11px', color: '#6b7280' }}>
                Secure Payment • Free Cancellation • 100% Satisfaction Guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
