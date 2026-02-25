import React, { useState } from 'react';
import { X, Calendar, Clock, DollarSign, Check, AlertCircle, CreditCard, Shield } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface InstantBookModalProps {
  helper: {
    id: string;
    name: string;
    hourly_rate: number;
    service_type: string;
  };
  selectedDate: Date;
  selectedTime: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const InstantBookModal: React.FC<InstantBookModalProps> = ({
  helper,
  selectedDate,
  selectedTime,
  onClose,
  onSuccess
}) => {
  const [duration, setDuration] = useState<number>(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalCost = helper.hourly_rate * duration;
  const serviceFee = totalCost * 0.15; // 15% service fee
  const grandTotal = totalCost + serviceFee;

  const handleInstantBook = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      setIsProcessing(true);

      // Get current user
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

      // Calculate end time
      const startDateTime = new Date(selectedDate);
      const [time, period] = selectedTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      startDateTime.setHours(hours, minutes || 0, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + duration);

      // Create booking
      const { data: booking, error } = await supabase
        .from('hfh_bookings')
        .insert([{
          helper_id: helper.id,
          client_id: clientData.id,
          service_type: helper.service_type,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          total_price: grandTotal,
          status: 'confirmed',
          payment_method: paymentMethod,
          special_requests: specialRequests || null,
          instant_booking: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Create initial message
      await supabase
        .from('hfh_messages')
        .insert([{
          sender_id: user.id,
          receiver_id: helper.id,
          message_text: `Hi! I've just booked you for ${duration} hour${duration > 1 ? 's' : ''} on ${selectedDate.toLocaleDateString()} at ${selectedTime}. ${specialRequests ? `Special requests: ${specialRequests}` : 'Looking forward to working with you!'}`,
          booking_id: booking.id
        }]);

      toast.success('Booking confirmed! You will receive a confirmation email shortly.');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to complete booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              Instant Booking
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Confirm your booking with {helper.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Booking Details */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Booking Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={18} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={18} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  {selectedTime}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DollarSign size={18} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  ${helper.hourly_rate}/hour
                </span>
              </div>
            </div>
          </div>

          {/* Duration Selection */}
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
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                <button
                  key={hours}
                  onClick={() => setDuration(hours)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: duration === hours ? '#10b981' : 'white',
                    color: duration === hours ? 'white' : '#374151',
                    border: `1px solid ${duration === hours ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Special Requests (optional)
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requirements or preferences..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '80px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Payment Method
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setPaymentMethod('card')}
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: paymentMethod === 'card' ? '#f0fdf4' : 'white',
                  border: `2px solid ${paymentMethod === 'card' ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CreditCard size={24} style={{ color: paymentMethod === 'card' ? '#10b981' : '#6b7280' }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: paymentMethod === 'card' ? '#10b981' : '#374151'
                }}>
                  Credit Card
                </span>
              </button>
              
              <button
                onClick={() => setPaymentMethod('cash')}
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: paymentMethod === 'cash' ? '#f0fdf4' : 'white',
                  border: `2px solid ${paymentMethod === 'cash' ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <DollarSign size={24} style={{ color: paymentMethod === 'cash' ? '#10b981' : '#6b7280' }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: paymentMethod === 'cash' ? '#10b981' : '#374151'
                }}>
                  Pay in Cash
                </span>
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Price Breakdown
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  ${helper.hourly_rate}/hr × {duration} hours
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Service fee (15%)
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  ${serviceFee.toFixed(2)}
                </span>
              </div>
              
              <div style={{
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                  Total
                </span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
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
              style={{
                width: '18px',
                height: '18px',
                marginTop: '2px',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
              I agree to the terms and conditions, cancellation policy, and understand that payment will be processed according to the selected method.
            </span>
          </label>

          {/* Security Notice */}
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#f0fdf4',
            borderRadius: '10px',
            marginBottom: '24px'
          }}>
            <Shield size={20} style={{ color: '#10b981', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', marginBottom: '4px' }}>
                Secure Booking
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                Your payment information is secure and encrypted. You're protected by our satisfaction guarantee.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleInstantBook}
              disabled={!agreedToTerms || isProcessing}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: agreedToTerms && !isProcessing ? '#10b981' : '#e5e7eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: agreedToTerms && !isProcessing ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (agreedToTerms && !isProcessing) {
                  e.currentTarget.style.backgroundColor = '#059669';
                }
              }}
              onMouseOut={(e) => {
                if (agreedToTerms && !isProcessing) {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }
              }}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Check size={18} />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantBookModal;
