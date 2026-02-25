import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, Repeat, Check, AlertCircle } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface RecurringBookingProps {
  helper: {
    id: string;
    name: string;
    hourly_rate: number;
    service_type: string;
  };
  onClose?: () => void;
  onSuccess?: () => void;
}

const RecurringBooking: React.FC<RecurringBookingProps> = ({
  helper,
  onClose,
  onSuccess
}) => {
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const calculateTotalSessions = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const weeks = Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    switch (frequency) {
      case 'weekly':
        return weeks * selectedDays.length;
      case 'biweekly':
        return Math.ceil(weeks / 2) * selectedDays.length;
      case 'monthly':
        return Math.ceil(weeks / 4) * selectedDays.length;
      default:
        return 0;
    }
  };

  const totalSessions = calculateTotalSessions();
  const sessionCost = helper.hourly_rate * duration;
  const subtotal = sessionCost * totalSessions;
  const discount = totalSessions >= 10 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        toast.error('Please sign in to book');
        return;
      }

      // Get client profile
      const { data: clientData } = await supabase
        .from('hfh_clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!clientData) {
        toast.error('Client profile not found');
        return;
      }

      // Create recurring booking
      const { error } = await supabase
        .from('hfh_recurring_bookings')
        .insert({
          helper_id: helper.id,
          client_id: clientData.id,
          service_type: helper.service_type,
          frequency: frequency,
          days_of_week: selectedDays,
          start_date: startDate,
          end_date: endDate,
          start_time: startTime,
          duration_hours: duration,
          total_sessions: totalSessions,
          price_per_session: sessionCost,
          total_price: total,
          auto_renew: autoRenew,
          special_instructions: specialInstructions,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Recurring booking created successfully!');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating recurring booking:', error);
      toast.error('Failed to create recurring booking');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Repeat size={24} style={{ color: '#10b981' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Set Up Recurring Booking
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Book regular sessions with {helper.name}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Frequency */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              How often do you need help?
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {(['weekly', 'biweekly', 'monthly'] as const).map(freq => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: frequency === freq ? '#10b981' : 'white',
                    color: frequency === freq ? 'white' : '#374151',
                    border: `1px solid ${frequency === freq ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {freq === 'biweekly' ? 'Every 2 Weeks' : freq}
                </button>
              ))}
            </div>
          </div>

          {/* Days Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Select Days
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {weekDays.map(day => (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDays(prev =>
                      prev.includes(day)
                        ? prev.filter(d => d !== day)
                        : [...prev, day]
                    );
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: selectedDays.includes(day) ? '#10b981' : 'white',
                    color: selectedDays.includes(day) ? 'white' : '#374151',
                    border: `1px solid ${selectedDays.includes(day) ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Time & Duration */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Duration (hours)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
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
          </div>

          {/* Pricing Summary */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '16px'
            }}>
              Pricing Summary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Total Sessions
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  {totalSessions}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Per Session ({duration}h × ${helper.hourly_rate}/hr)
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  ${sessionCost}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Subtotal
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#10b981' }}>
                    10% Bulk Discount
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>
                    -${discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div style={{
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                  Total
                </span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Auto-Renew */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>
              Auto-renew this booking when it ends
            </span>
          </label>

          {/* Terms */}
          <label style={{
            display: 'flex',
            alignItems: 'start',
            gap: '12px',
            marginBottom: '24px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px' }}
            />
            <span style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
              I understand this is a recurring booking and I will be charged for each session. I can cancel or modify this booking at any time with 24 hours notice.
            </span>
          </label>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!agreedToTerms || selectedDays.length === 0}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: agreedToTerms && selectedDays.length > 0 ? '#10b981' : '#e5e7eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: agreedToTerms && selectedDays.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Check size={18} />
              Create Recurring Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringBooking;
