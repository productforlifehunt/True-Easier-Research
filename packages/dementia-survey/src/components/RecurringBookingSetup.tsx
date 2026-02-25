import React, { useState } from 'react';
import { X, RefreshCw, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface RecurringBookingSetupProps {
  isOpen: boolean;
  onClose: () => void;
  helperId: string;
  helperName: string;
  hourlyRate: number;
  onScheduleCreated?: () => void;
}

const RecurringBookingSetup: React.FC<RecurringBookingSetupProps> = ({
  isOpen,
  onClose,
  helperId,
  helperName,
  hourlyRate,
  onScheduleCreated
}) => {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState<number[]>([1]); // Monday default
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [duration, setDuration] = useState(2);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [endType, setEndType] = useState<'never' | 'date' | 'occurrences'>('never');
  const [occurrences, setOccurrences] = useState(10);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const daysOfWeek = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' }
  ];

  const toggleDay = (day: number) => {
    if (dayOfWeek.includes(day)) {
      setDayOfWeek(dayOfWeek.filter(d => d !== day));
    } else {
      setDayOfWeek([...dayOfWeek, day].sort());
    }
  };

  const calculateTotalCost = () => {
    const sessionCost = hourlyRate * duration;
    let totalOccurrences = occurrences;

    if (endType === 'never') {
      totalOccurrences = 12; // Show cost for 3 months
    } else if (endType === 'date' && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const weeks = Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
      totalOccurrences = frequency === 'weekly' ? weeks : frequency === 'biweekly' ? Math.ceil(weeks / 2) : weeks * 4;
    }

    return {
      perSession: sessionCost,
      estimated: sessionCost * totalOccurrences,
      occurrences: totalOccurrences
    };
  };

  const handleSave = async () => {
    if (dayOfWeek.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to create recurring bookings');
        return;
      }

      const { error } = await supabase
        .from('hfh_recurring_schedules')
        .insert({
          client_id: user.id,
          helper_id: helperId,
          frequency,
          days_of_week: dayOfWeek,
          time_of_day: timeOfDay,
          duration_hours: duration,
          start_date: startDate,
          end_date: endType === 'date' ? endDate : null,
          max_occurrences: endType === 'occurrences' ? occurrences : null,
          status: 'pending',
          hourly_rate: hourlyRate
        });

      if (error) throw error;

      toast.success('Recurring schedule created! Pending helper approval.');
      onScheduleCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating recurring schedule:', error);
      toast.error('Failed to create recurring schedule');
    } finally {
      setSaving(false);
    }
  };

  const cost = calculateTotalCost();

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
      zIndex: 9999,
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <RefreshCw size={24} />
            Set Up Recurring Booking
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Helper Info */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
              Recurring booking with
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
              {helperName}
            </div>
            <div style={{ fontSize: '14px', color: '#10b981', marginTop: '4px' }}>
              ${hourlyRate}/hour
            </div>
          </div>

          {/* Frequency */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Frequency
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {(['daily', 'weekly', 'biweekly', 'monthly'] as const).map(freq => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  style={{
                    padding: '12px',
                    backgroundColor: frequency === freq ? '#f0fdf4' : 'white',
                    color: frequency === freq ? '#10b981' : '#6b7280',
                    border: `2px solid ${frequency === freq ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {freq === 'biweekly' ? 'Bi-weekly' : freq}
                </button>
              ))}
            </div>
          </div>

          {/* Days of Week (for weekly/biweekly) */}
          {(frequency === 'weekly' || frequency === 'biweekly') && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Days of Week
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {daysOfWeek.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: dayOfWeek.includes(day.value) ? '#10b981' : 'white',
                      color: dayOfWeek.includes(day.value) ? 'white' : '#6b7280',
                      border: `1px solid ${dayOfWeek.includes(day.value) ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time and Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Time
              </label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
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
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                  <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div style={{ marginBottom: '24px' }}>
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
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* End Options */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              End Schedule
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => setEndType('never')}
                style={{
                  padding: '12px',
                  backgroundColor: endType === 'never' ? '#f0fdf4' : 'white',
                  color: endType === 'never' ? '#10b981' : '#6b7280',
                  border: `2px solid ${endType === 'never' ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Never (ongoing until cancelled)
              </button>
              <button
                onClick={() => setEndType('date')}
                style={{
                  padding: '12px',
                  backgroundColor: endType === 'date' ? '#f0fdf4' : 'white',
                  color: endType === 'date' ? '#10b981' : '#6b7280',
                  border: `2px solid ${endType === 'date' ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                On specific date
              </button>
              {endType === 'date' && (
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginTop: '-8px'
                  }}
                />
              )}
              <button
                onClick={() => setEndType('occurrences')}
                style={{
                  padding: '12px',
                  backgroundColor: endType === 'occurrences' ? '#f0fdf4' : 'white',
                  color: endType === 'occurrences' ? '#10b981' : '#6b7280',
                  border: `2px solid ${endType === 'occurrences' ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                After number of sessions
              </button>
              {endType === 'occurrences' && (
                <input
                  type="number"
                  value={occurrences}
                  onChange={(e) => setOccurrences(Number(e.target.value))}
                  min={1}
                  max={100}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginTop: '-8px'
                  }}
                />
              )}
            </div>
          </div>

          {/* Cost Summary */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                Per Session ({duration}h × ${hourlyRate})
              </span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                ${cost.perSession}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid #d1fae5'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                Estimated Total ({cost.occurrences} sessions)
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                ${cost.estimated}
              </span>
            </div>
          </div>

          {/* Info */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#3b82f6'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              This recurring schedule requires helper approval. You'll be charged per session. 
              You can cancel or pause the schedule anytime.
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || dayOfWeek.length === 0}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: saving || dayOfWeek.length === 0 ? '#e5e7eb' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: saving || dayOfWeek.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={18} />
              {saving ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringBookingSetup;
