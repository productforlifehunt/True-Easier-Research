import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Clock, MessageSquare, FileText, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface DisputeResolutionProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  clientId: string;
  helperId: string;
  onResolved?: () => void;
}

const DisputeResolution: React.FC<DisputeResolutionProps> = ({
  isOpen,
  onClose,
  bookingId,
  clientId,
  helperId,
  onResolved
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'service_quality' | 'payment' | 'cancellation' | 'other'>('service_quality');
  const [resolution, setResolution] = useState<'refund' | 'partial_refund' | 'credit' | 'none'>('none');
  const [refundAmount, setRefundAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [disputeHistory, setDisputeHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadDisputeHistory();
    }
  }, [isOpen, bookingId]);

  const loadDisputeHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('hfh_disputes')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setDisputeHistory(data);
      }
    } catch (error) {
      console.error('Error loading dispute history:', error);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description of the issue');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('hfh_disputes')
        .insert({
          booking_id: bookingId,
          client_id: clientId,
          helper_id: helperId,
          category,
          reason,
          description,
          status: 'open',
          resolution_type: resolution,
          refund_amount: resolution === 'refund' || resolution === 'partial_refund' ? refundAmount : null
        });

      if (error) throw error;

      toast.success('Dispute submitted successfully. We\'ll review and respond within 24 hours.');
      
      if (onResolved) onResolved();
      onClose();
    } catch (error) {
      console.error('Error submitting dispute:', error);
      toast.error('Failed to submit dispute');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
      zIndex: 50,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#fef3c7',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={24} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Report an Issue
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
                We'll help resolve this quickly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#f3f4f6',
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
          {/* Dispute History */}
          {disputeHistory.length > 0 && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              border: '1px solid #fcd34d'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={16} color="#f59e0b" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#92400e' }}>
                  Previous dispute on this booking
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#78350f', margin: 0 }}>
                Status: {disputeHistory[0].status} • Submitted {new Date(disputeHistory[0].created_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Category Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>
              Issue Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="service_quality">Service Quality Issue</option>
              <option value="payment">Payment Dispute</option>
              <option value="cancellation">Cancellation Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Brief Reason */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>
              Brief Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Service not completed as agreed"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Detailed Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>
              Detailed Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide as much detail as possible about the issue..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Desired Resolution */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>
              Desired Resolution
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="none">Let support team decide</option>
              <option value="refund">Full Refund</option>
              <option value="partial_refund">Partial Refund</option>
              <option value="credit">Service Credit</option>
            </select>
          </div>

          {/* Refund Amount (if applicable) */}
          {(resolution === 'refund' || resolution === 'partial_refund') && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>
                Refund Amount Requested ($)
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}

          {/* Resolution Timeline */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
              What Happens Next?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>1</span>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#374151', margin: 0 }}>
                    Review (24 hours)
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Our team will review your dispute and contact both parties
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>2</span>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#374151', margin: 0 }}>
                    Investigation (48 hours)
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    We'll gather information and attempt mediation
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>3</span>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#374151', margin: 0 }}>
                    Resolution (72 hours)
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Final decision and any applicable refunds or credits
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: submitting ? '#d1d5db' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FileText size={18} />
              {submitting ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeResolution;
