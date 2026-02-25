import React, { useState, useEffect } from 'react';
import { CreditCard, Check, CheckCircle, Shield, Calendar, Clock, DollarSign, AlertCircle, User, Lock } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PaymentProcessingProps {
  booking: {
    helper_id: string;
    helper_name: string;
    service_type: string;
    date: string;
    time: string;
    duration: number;
    rate: number;
    total: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentProcessing: React.FC<PaymentProcessingProps> = ({ booking, onSuccess, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple' | 'google'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [useEscrow, setUseEscrow] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'payment' | 'review' | 'success'>('payment');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const processPayment = async () => {
    setProcessing(true);
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        toast.error('Please sign in to complete payment');
        return;
      }

      // Create payment record
      await supabase.from('hfh_payments').insert({
        booking_id: booking.helper_id, // Should be actual booking ID
        user_id: user.id,
        amount: booking.total,
        payment_method: paymentMethod,
        status: useEscrow ? 'held_in_escrow' : 'completed',
        escrow_enabled: useEscrow,
        processed_at: new Date().toISOString()
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStep('success');
      toast.success('Payment processed successfully!');
      
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'payment') {
      setStep('review');
    } else if (step === 'review') {
      processPayment();
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
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Progress Steps */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            {['Payment', 'Review', 'Complete'].map((label, index) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: index <= ['payment', 'review', 'success'].indexOf(step) ? '#10b981' : '#e5e7eb',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {index < ['payment', 'review', 'success'].indexOf(step) ? '✓' : index + 1}
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: index <= ['payment', 'review', 'success'].indexOf(step) ? '#111827' : '#9ca3af'
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {step === 'success' ? (
          <div style={{
            padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f0fdf4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <CheckCircle size={48} color="#10b981" />
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '8px'
            }}>
              Payment Successful!
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              Your booking with {booking.helper_name} has been confirmed.
              {useEscrow && ' Payment is held securely in escrow.'}
            </p>
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                <strong>Booking ID:</strong> #BK{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
              </div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                <strong>Time:</strong> {booking.time}
              </div>
              <div style={{ fontSize: '13px' }}>
                <strong>Total Paid:</strong> ${booking.total.toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {step === 'payment' && (
              <>
                {/* Payment Method Selection */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '12px',
                    display: 'block'
                  }}>
                    Payment Method
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                  }}>
                    {[
                      { id: 'card', name: 'Credit Card', icon: '💳' },
                      { id: 'paypal', name: 'PayPal', icon: '🅿️' },
                      { id: 'apple', name: 'Apple Pay', icon: '🍎' },
                      { id: 'google', name: 'Google Pay', icon: '🟦' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        style={{
                          padding: '12px',
                          border: `2px solid ${paymentMethod === method.id ? '#10b981' : '#e5e7eb'}`,
                          borderRadius: '12px',
                          backgroundColor: paymentMethod === method.id ? '#f0fdf4' : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                          fontWeight: paymentMethod === method.id ? 600 : 400
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{method.icon}</span>
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <label style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '6px',
                          display: 'block'
                        }}>
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
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
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '6px',
                          display: 'block'
                        }}>
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          maxLength={4}
                          required
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

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '20px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}>
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      Save card for future bookings
                    </label>
                  </>
                )}

                {/* Escrow Protection */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={useEscrow}
                      onChange={(e) => setUseEscrow(e.target.checked)}
                      style={{ width: '18px', height: '18px', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Shield size={16} color="#10b981" />
                        Escrow Protection
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        lineHeight: 1.4
                      }}>
                        Your payment will be held securely until the service is completed. 
                        Release payment only when you're satisfied.
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}

            {step === 'review' && (
              <>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '20px'
                }}>
                  Review Your Booking
                </h3>

                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                      Service Provider
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                      {booking.helper_name}
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                        <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Date
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Time
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        {booking.time} ({booking.duration}h)
                      </div>
                    </div>
                  </div>

                  <div style={{
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        Rate
                      </span>
                      <span style={{ fontSize: '14px' }}>
                        ${booking.rate}/hr × {booking.duration}h
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        Service Fee
                      </span>
                      <span style={{ fontSize: '14px' }}>
                        ${(booking.total * 0.1).toFixed(2)}
                      </span>
                    </div>
                    {useEscrow && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          Escrow Protection
                        </span>
                        <span style={{ fontSize: '14px', color: '#10b981' }}>
                          ✓ Enabled
                        </span>
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                        Total
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
                        ${(booking.total * 1.1).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  fontSize: '12px',
                  marginBottom: '20px'
                }}>
                  <AlertCircle size={16} color="#f59e0b" />
                  <span>You can cancel up to 24 hours before for a full refund</span>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={step === 'payment' ? onCancel : () => setStep('payment')}
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
                {step === 'payment' ? 'Cancel' : 'Back'}
              </button>
              <button
                type="submit"
                disabled={processing}
                style={{
                  flex: 2,
                  padding: '12px',
                  backgroundColor: processing ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: processing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {processing ? (
                  <>Processing...</>
                ) : step === 'payment' ? (
                  <>Continue to Review</>
                ) : (
                  <>
                    <Lock size={16} />
                    Pay ${(booking.total * 1.1).toFixed(2)}
                  </>
                )}
              </button>
            </div>

            {/* Security Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '16px',
              fontSize: '11px',
              color: '#9ca3af'
            }}>
              <Lock size={12} />
              Secured by 256-bit SSL encryption
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessing;
