import React, { useState } from 'react';
import { MessageSquare, DollarSign, Calendar, Clock, MapPin, Send, CheckCircle, XCircle } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface BookingNegotiationProps {
  helper: {
    id: string;
    name: string;
    hourly_rate: number;
    service_type: string;
  };
  onClose: () => void;
  onConfirm: (booking: any) => void;
}

const BookingNegotiation: React.FC<BookingNegotiationProps> = ({ helper, onClose, onConfirm }) => {
  const [proposedRate, setProposedRate] = useState(helper.hourly_rate);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [counterOffer, setCounterOffer] = useState<any>(null);
  const [negotiationStatus, setNegotiationStatus] = useState<'initial' | 'negotiating' | 'accepted' | 'declined'>('initial');

  const sendProposal = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        toast.error('Please sign in to send a proposal');
        return;
      }

      const proposal = {
        helper_id: helper.id,
        client_id: user.id,
        proposed_rate: proposedRate,
        proposed_date: proposedDate,
        proposed_time: proposedTime,
        duration_hours: duration,
        location,
        message,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('hfh_negotiations').insert(proposal);
      if (error) throw error;
      
      setNegotiationStatus('negotiating');
      toast.success('Proposal sent to helper! They will respond shortly.');
    } catch (error) {
      console.error('Error sending proposal:', error);
      toast.error('Failed to send proposal');
    }
  };

  const acceptCounterOffer = () => {
    setProposedRate(counterOffer.rate);
    setNegotiationStatus('accepted');
    toast.success('Deal confirmed!');
    onConfirm({
      helper_id: helper.id,
      rate: counterOffer.rate,
      date: proposedDate,
      time: proposedTime,
      duration: duration,
      location
    });
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
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '8px'
          }}>
            Negotiate Booking with {helper.name}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Propose your terms and negotiate the best deal
          </p>
        </div>

        <div style={{ padding: '24px' }}>
          {negotiationStatus === 'accepted' ? (
            <div style={{
              textAlign: 'center',
              padding: '32px'
            }}>
              <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 16px' }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '8px'
              }}>
                Booking Confirmed!
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                Your booking with {helper.name} has been confirmed at ${proposedRate}/hour
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    <DollarSign size={14} />
                    Proposed Rate (per hour)
                  </label>
                  <input
                    type="number"
                    value={proposedRate}
                    onChange={(e) => setProposedRate(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Helper's rate: ${helper.hourly_rate}/hr
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    <Clock size={14} />
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
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                      <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    <Calendar size={14} />
                    Date
                  </label>
                  <input
                    type="date"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    <Clock size={14} />
                    Time
                  </label>
                  <input
                    type="time"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  <MapPin size={14} />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter meeting location or 'Virtual' for online"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  <MessageSquare size={14} />
                  Message to Helper
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain what you need and why you're proposing this rate..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Price Summary */}
              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Proposed Rate
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>
                    ${proposedRate}/hr
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Duration
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>
                    {duration} hours
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                    Total
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
                    ${(proposedRate * duration).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Counter Offer */}
              {counterOffer && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#92400e',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <MessageSquare size={16} />
                    Counter Offer from {helper.name}
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#92400e',
                    marginBottom: '12px'
                  }}>
                    {counterOffer.message}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      onClick={acceptCounterOffer}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Accept Offer
                    </button>
                    <button
                      onClick={() => setCounterOffer(null)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: 'white',
                        color: '#92400e',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Make New Offer
                    </button>
                  </div>
                </div>
              )}

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
                  onClick={sendProposal}
                  disabled={negotiationStatus === 'negotiating'}
                  style={{
                    flex: 2,
                    padding: '12px',
                    backgroundColor: negotiationStatus === 'negotiating' ? '#d1d5db' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: negotiationStatus === 'negotiating' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={18} />
                  {negotiationStatus === 'negotiating' ? 'Waiting for Response...' : 'Send Proposal'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingNegotiation;
