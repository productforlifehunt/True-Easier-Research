import React, { useState, useEffect } from 'react';
import { Calendar, Clock, RepeatIcon, Edit2, Trash2, Plus, Check, X, AlertCircle } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface RecurringBooking {
  id: string;
  client_id: string;
  helper_id: string;
  helper_name: string;
  helper_avatar?: string;
  service_type: string;
  start_date: string;
  end_date?: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  day_of_week?: number;
  time_slot: string;
  duration_hours: number;
  rate_per_hour: number;
  status: 'active' | 'paused' | 'cancelled';
  notes?: string;
  created_at: string;
  next_occurrence?: string;
}

const RecurringBookingManager: React.FC = () => {
  const [bookings, setBookings] = useState<RecurringBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<RecurringBooking | null>(null);
  const [formData, setFormData] = useState({
    helper_id: '',
    service_type: '',
    start_date: '',
    end_date: '',
    frequency: 'weekly' as const,
    day_of_week: 1,
    time_slot: '09:00',
    duration_hours: 2,
    rate_per_hour: 35,
    notes: ''
  });

  useEffect(() => {
    loadRecurringBookings();
  }, []);

  const loadRecurringBookings = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      // Get client ID
      const { data: client } = await supabase
        .from('hfh_clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!client) return;

      // Load recurring bookings
      const { data, error } = await supabase
        .from('hfh_recurring_bookings')
        .select(`
          *,
          helper:hfh_helpers(name, profile_image_url)
        `)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookingsWithDetails = (data || []).map(booking => ({
        ...booking,
        helper_name: booking.helper?.name || 'Unknown Helper',
        helper_avatar: booking.helper?.profile_image_url
      }));

      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error('Error loading recurring bookings:', error);
      toast.error('Failed to load recurring bookings');
    } finally {
      setLoading(false);
    }
  };

  const saveRecurringBooking = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      const { data: client } = await supabase
        .from('hfh_clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!client) return;

      const bookingData = {
        client_id: client.id,
        helper_id: formData.helper_id,
        service_type: formData.service_type,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        frequency: formData.frequency,
        day_of_week: formData.day_of_week,
        time_slot: formData.time_slot,
        duration_hours: formData.duration_hours,
        rate_per_hour: formData.rate_per_hour,
        status: 'active' as const,
        notes: formData.notes
      };

      if (editingBooking) {
        const { error } = await supabase
          .from('hfh_recurring_bookings')
          .update(bookingData)
          .eq('id', editingBooking.id);

        if (error) throw error;
        toast.success('Recurring booking updated');
      } else {
        const { error } = await supabase
          .from('hfh_recurring_bookings')
          .insert([bookingData]);

        if (error) throw error;
        toast.success('Recurring booking created');
      }

      setShowAddModal(false);
      setEditingBooking(null);
      resetForm();
      await loadRecurringBookings();
    } catch (error) {
      console.error('Error saving recurring booking:', error);
      toast.error('Failed to save recurring booking');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'active' | 'paused' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('hfh_recurring_bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(`Booking ${status === 'active' ? 'activated' : status === 'paused' ? 'paused' : 'cancelled'}`);
      await loadRecurringBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this recurring booking?')) return;

    try {
      const { error } = await supabase
        .from('hfh_recurring_bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Recurring booking deleted');
      await loadRecurringBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const resetForm = () => {
    setFormData({
      helper_id: '',
      service_type: '',
      start_date: '',
      end_date: '',
      frequency: 'weekly',
      day_of_week: 1,
      time_slot: '09:00',
      duration_hours: 2,
      rate_per_hour: 35,
      notes: ''
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Every 2 Weeks',
      monthly: 'Monthly'
    };
    return labels[frequency] || frequency;
  };

  const getDayLabel = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading recurring bookings...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
            Recurring Bookings
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Manage your regular helper bookings
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} />
          New Recurring Booking
        </button>
      </div>

      {/* Bookings Grid */}
      {bookings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '2px dashed #e5e7eb'
        }}>
          <RepeatIcon size={48} color="#10b981" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
            No Recurring Bookings
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Set up regular bookings with your favorite helpers
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Create Your First Recurring Booking
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {bookings.map(booking => (
            <div
              key={booking.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid #e5e7eb',
                padding: '20px',
                position: 'relative'
              }}
            >
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '4px 12px',
                backgroundColor: getStatusColor(booking.status) + '20',
                color: getStatusColor(booking.status),
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {booking.status}
              </div>

              {/* Helper Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img
                  src={booking.helper_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.helper_name}`}
                  alt={booking.helper_name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    {booking.helper_name}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    {booking.service_type}
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RepeatIcon size={14} color="#6b7280" />
                  <span style={{ fontSize: '13px', color: '#374151' }}>
                    {getFrequencyLabel(booking.frequency)}
                    {booking.frequency === 'weekly' && ` on ${getDayLabel(booking.day_of_week || 0)}`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} color="#6b7280" />
                  <span style={{ fontSize: '13px', color: '#374151' }}>
                    {booking.time_slot} • {booking.duration_hours} hours
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} color="#6b7280" />
                  <span style={{ fontSize: '13px', color: '#374151' }}>
                    Started {new Date(booking.start_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Per session:</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                    ${booking.rate_per_hour * booking.duration_hours}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  ${booking.rate_per_hour}/hour
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {booking.status === 'active' ? (
                  <button
                    onClick={() => updateBookingStatus(booking.id, 'paused')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <X size={14} />
                    Pause
                  </button>
                ) : booking.status === 'paused' ? (
                  <button
                    onClick={() => updateBookingStatus(booking.id, 'active')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#d1fae5',
                      color: '#059669',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check size={14} />
                    Resume
                  </button>
                ) : null}
                
                <button
                  onClick={() => {
                    setEditingBooking(booking);
                    setFormData({
                      helper_id: booking.helper_id,
                      service_type: booking.service_type,
                      start_date: booking.start_date,
                      end_date: booking.end_date || '',
                      frequency: booking.frequency as 'weekly',
                      day_of_week: booking.day_of_week || 1,
                      time_slot: booking.time_slot,
                      duration_hours: booking.duration_hours,
                      rate_per_hour: booking.rate_per_hour,
                      notes: booking.notes || ''
                    });
                    setShowAddModal(true);
                  }}
                  style={{
                    padding: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={14} color="#6b7280" />
                </button>
                
                <button
                  onClick={() => deleteBooking(booking.id)}
                  style={{
                    padding: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} color="#ef4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
              {editingBooking ? 'Edit' : 'New'} Recurring Booking
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Service Type */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Service Type
                </label>
                <input
                  type="text"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  placeholder="e.g., Grocery Shopping, Dog Walking"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Frequency */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px'
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 Weeks</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Day of Week (for weekly/biweekly) */}
              {(formData.frequency === 'weekly' || formData.frequency === 'biweekly') && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Day of Week
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px'
                    }}
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              {/* Time and Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time_slot}
                    onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Rate */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Rate per Hour ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.rate_per_hour}
                  onChange={(e) => setFormData({ ...formData, rate_per_hour: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingBooking(null);
                  resetForm();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveRecurringBooking}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {editingBooking ? 'Update' : 'Create'} Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringBookingManager;
