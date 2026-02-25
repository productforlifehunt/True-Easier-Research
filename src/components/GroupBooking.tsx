import React, { useState } from 'react';
import { Users, Calendar, MapPin, Clock, DollarSign, Plus, Minus, X, Check } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface GroupBookingProps {
  helper: {
    id: string;
    name: string;
    hourly_rate: number;
    service_type: string;
  };
  onClose?: () => void;
}

const GroupBooking: React.FC<GroupBookingProps> = ({ helper, onClose }) => {
  const [participants, setParticipants] = useState(2);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [splitPayment, setSplitPayment] = useState(true);

  const basePrice = helper.hourly_rate * duration;
  const groupDiscount = participants >= 3 ? 0.15 : participants >= 5 ? 0.25 : 0;
  const totalPrice = basePrice * (1 - groupDiscount);
  const pricePerPerson = totalPrice / participants;

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        toast.error('Please sign in to book');
        return;
      }

      await supabase.from('hfh_group_bookings').insert({
        helper_id: helper.id,
        organizer_id: user.id,
        event_type: eventType,
        date: date,
        time: time,
        duration_hours: duration,
        location: location,
        participant_count: participants,
        total_price: totalPrice,
        price_per_person: pricePerPerson,
        split_payment: splitPayment,
        special_requests: specialRequests,
        status: 'pending'
      });

      toast.success('Group booking request sent!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating group booking:', error);
      toast.error('Failed to create booking');
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
        overflowY: 'auto'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                Group Booking
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Book {helper.name} for your group event
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} color="#6b7280" />
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">Select event type</option>
              <option value="party">Birthday/Party</option>
              <option value="workshop">Workshop/Class</option>
              <option value="outing">Group Outing</option>
              <option value="team-building">Team Building</option>
              <option value="celebration">Celebration</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Number of Participants
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setParticipants(Math.max(2, participants - 1))}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Minus size={18} />
              </button>
              <div style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827'
              }}>
                {participants}
              </div>
              <button
                onClick={() => setParticipants(participants + 1)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#10b981',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Plus size={18} color="white" />
              </button>
            </div>
            {participants >= 3 && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#10b981',
                textAlign: 'center'
              }}>
                {participants >= 5 ? '25%' : '15%'} group discount applied!
              </div>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter event location"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Special Requests (Optional)
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requirements or requests..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Pricing Summary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Base Rate ({duration}h × ${helper.hourly_rate}/hr)
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  ${basePrice}
                </span>
              </div>
              {groupDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#10b981' }}>
                    Group Discount ({(groupDiscount * 100).toFixed(0)}%)
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>
                    -${(basePrice * groupDiscount).toFixed(2)}
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
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div style={{
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  ${pricePerPerson.toFixed(2)} per person
                </span>
              </div>
            </div>
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={splitPayment}
              onChange={(e) => setSplitPayment(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>
              Split payment among participants
            </span>
          </label>

          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Check size={18} />
            Request Group Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupBooking;
