import React, { useState } from 'react';
import { X, DollarSign, Calendar, Clock, MessageSquare, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface OfferModalProps {
  helper: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const OfferModal: React.FC<OfferModalProps> = ({ helper, onClose, onSuccess }) => {
  const [offerAmount, setOfferAmount] = useState('');
  const [duration, setDuration] = useState('2');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceTime, setServiceTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitOffer = async () => {
    if (!offerAmount || !serviceDate || !serviceTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to make an offer');
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
            location: 'Not specified'
          }])
          .select()
          .single();
        clientProfile = newClient;
      }

      // Create offer/negotiation
      const { error } = await supabase
        .from('hfh_offers')
        .insert([{
          client_id: clientProfile.id,
          helper_id: helper.id,
          offered_rate: parseFloat(offerAmount),
          duration_hours: parseInt(duration),
          service_date: serviceDate,
          service_time: serviceTime,
          message: message,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success('Offer sent successfully! The helper will respond soon.');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error submitting offer:', error);
      toast.error('Failed to send offer');
    } finally {
      setLoading(false);
    }
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
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#111827',
              margin: 0
            }}>
              Make an Offer
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              Negotiate a custom rate with {helper.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Current Rate Display */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                Standard Rate:
              </span>
              <span style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#111827'
              }}>
                ${helper.hourly_rate}/hour
              </span>
            </div>
          </div>

          {/* Offer Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              <DollarSign size={18} color="#10b981" />
              Your Offer (per hour) *
            </label>
            <input
              type="number"
              placeholder="Enter your offer amount"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Duration */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              <Clock size={18} color="#10b981" />
              Duration (hours) *
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="5">5 hours</option>
              <option value="6">6 hours</option>
              <option value="8">8 hours (Full day)</option>
            </select>
          </div>

          {/* Service Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              <Calendar size={18} color="#10b981" />
              Service Date *
            </label>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Service Time */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              <Clock size={18} color="#10b981" />
              Service Time *
            </label>
            <input
              type="time"
              value={serviceTime}
              onChange={(e) => setServiceTime(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              <MessageSquare size={18} color="#10b981" />
              Message (optional)
            </label>
            <textarea
              placeholder="Explain your needs or special requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Total Estimate */}
          {offerAmount && duration && (
            <div style={{
              padding: '16px',
              backgroundColor: '#ecfdf5',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #10b981'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', color: '#059669' }}>
                  Total Estimate:
                </span>
                <span style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#059669'
                }}>
                  ${(parseFloat(offerAmount) * parseInt(duration)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Terms Notice */}
          <div style={{
            padding: '12px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            gap: '8px'
          }}>
            <FileText size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{
              fontSize: '12px',
              color: '#92400e',
              margin: 0,
              lineHeight: 1.5
            }}>
              Your offer will be sent to the helper for review. They may accept, decline, or counter your offer. Payment is processed only after service completion.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitOffer}
              disabled={loading || !offerAmount || !serviceDate || !serviceTime}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: loading || !offerAmount || !serviceDate || !serviceTime ? '#e5e7eb' : '#10b981',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                cursor: loading || !offerAmount || !serviceDate || !serviceTime ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;
