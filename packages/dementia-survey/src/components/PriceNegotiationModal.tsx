import React, { useState } from 'react';
import { X, DollarSign, Send, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PriceNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  helper: {
    id: string;
    name: string;
    hourly_rate: number;
    profile_image_url?: string;
    accepts_offers?: boolean;
  };
  service: string;
  onOfferSent?: () => void;
}

const PriceNegotiationModal: React.FC<PriceNegotiationModalProps> = ({
  isOpen,
  onClose,
  helper,
  service,
  onOfferSent
}) => {
  const [offerAmount, setOfferAmount] = useState(Math.floor(helper.hourly_rate * 0.9));
  const [duration, setDuration] = useState(2);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmitOffer = async () => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to make an offer');
        return;
      }

      const { error } = await supabase
        .from('hfh_price_offers')
        .insert({
          helper_id: helper.id,
          client_id: user.id,
          service_type: service,
          offered_rate: offerAmount,
          duration_hours: duration,
          message: message,
          status: 'pending',
          original_rate: helper.hourly_rate
        });

      if (error) throw error;

      toast.success('Offer sent successfully! The helper will respond soon.');
      onOfferSent?.();
      onClose();
    } catch (error) {
      console.error('Error sending offer:', error);
      toast.error('Failed to send offer');
    } finally {
      setSending(false);
    }
  };

  const totalOriginal = helper.hourly_rate * duration;
  const totalOffer = offerAmount * duration;
  const savings = totalOriginal - totalOffer;
  const savingsPercent = Math.round((savings / totalOriginal) * 100);

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
        maxWidth: '500px',
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
            <DollarSign size={24} />
            Make an Offer
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
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: helper.profile_image_url ? 'transparent' : '#e5e7eb',
              backgroundImage: helper.profile_image_url ? `url(${helper.profile_image_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 600,
              color: '#6b7280'
            }}>
              {!helper.profile_image_url && helper.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                {helper.name}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Standard rate: ${helper.hourly_rate}/hour
              </div>
            </div>
          </div>

          {/* Offer Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Your Offer (per hour)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="range"
                min={Math.floor(helper.hourly_rate * 0.5)}
                max={helper.hourly_rate}
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                style={{
                  flex: 1,
                  cursor: 'pointer'
                }}
              />
              <div style={{
                width: '80px',
                padding: '8px',
                border: '2px solid #10b981',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 600,
                color: '#10b981'
              }}>
                ${offerAmount}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: '20px' }}>
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

          {/* Message */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain why you're making this offer..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Price Summary */}
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
                Original Total ({duration}h × ${helper.hourly_rate})
              </span>
              <span style={{
                fontSize: '14px',
                color: '#6b7280',
                textDecoration: 'line-through'
              }}>
                ${totalOriginal}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                Your Offer ({duration}h × ${offerAmount})
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                ${totalOffer}
              </span>
            </div>
            {savings > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid #d1fae5'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                  You Save
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                  ${savings} ({savingsPercent}%)
                </span>
              </div>
            )}
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
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              The helper will receive your offer and can accept, decline, or counter-offer. 
              You'll be notified of their response.
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
              onClick={handleSubmitOffer}
              disabled={sending || offerAmount <= 0}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: sending ? '#e5e7eb' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: sending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Send size={18} />
              {sending ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceNegotiationModal;
