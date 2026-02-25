import React, { useState } from 'react';
import { CreditCard, Lock, Shield, CheckCircle, AlertCircle, DollarSign, Clock, Calendar, Users, Award, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentFlowProps {
  booking: {
    helper: any;
    service: string;
    date: string;
    time: string;
    duration: number;
    location: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
    recurringEndDate?: string;
    groupSize?: number;
    isUrgent?: boolean;
    notes?: string;
  };
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({ booking, onClose, onSuccess }) => {
  const [step, setStep] = useState<'review' | 'payment' | 'processing' | 'success'>('review');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple' | 'google'>('card');
  const [saveCard, setSaveCard] = useState(true);
  const [tipAmount, setTipAmount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [addInsurance, setAddInsurance] = useState(true);
  
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    zip: ''
  });

  // Pricing calculations
  const baseRate = booking.helper.hourly_rate || 50;
  const urgentMultiplier = booking.isUrgent ? 1.5 : 1;
  const groupDiscount = booking.groupSize && booking.groupSize > 1 ? (1 - (booking.groupSize - 1) * 0.05) : 1;
  
  const subtotal = baseRate * booking.duration * urgentMultiplier * groupDiscount;
  const platformFee = subtotal * 0.15;
  const insuranceFee = addInsurance ? subtotal * 0.05 : 0;
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + platformFee + insuranceFee + tipAmount - promoDiscount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'FIRST25') {
      setPromoApplied(true);
      toast.success('Promo code applied! 10% discount');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handlePayment = async () => {
    setStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
      const paymentId = `PAY-${Date.now()}`;
      toast.success('Payment successful!');
      
      setTimeout(() => {
        onSuccess(paymentId);
      }, 2000);
    }, 2000);
  };

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

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  if (step === 'success') {
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
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '48px',
          maxWidth: '500px',
          width: '100%',
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
            <CheckCircle size={40} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
            Booking Confirmed!
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
            Your booking with {booking.helper.name} has been confirmed.
          </p>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Calendar size={18} color="#6b7280" />
              <span style={{ fontSize: '14px', color: '#374151' }}>{booking.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#6b7280" />
              <span style={{ fontSize: '14px', color: '#374151' }}>{booking.time} ({booking.duration} hours)</span>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Check your email for booking details and helper contact information.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
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
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div className="spinner" style={{ margin: '0 auto 24px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
            Processing Payment...
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>
            Please wait while we securely process your payment.
          </p>
        </div>
      </div>
    );
  }

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
            {step === 'review' ? 'Review & Pay' : 'Payment Details'}
          </h2>
          <button
            onClick={onClose}
            style={{
              fontSize: '24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', padding: '32px' }}>
          {/* Left: Order Summary */}
          <div style={{ flex: '1' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '20px' }}>
              Booking Summary
            </h3>
            
            {/* Helper Info */}
            <div style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 600
              }}>
                {booking.helper.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                  {booking.helper.name}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {booking.service}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Award size={14} color="#f59e0b" />
                  <span style={{ fontSize: '13px', color: '#374151' }}>
                    {booking.helper.rating} ({booking.helper.total_reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Date</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{booking.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Time</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{booking.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Duration</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{booking.duration} hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Location</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{booking.location}</span>
              </div>
              {booking.isRecurring && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                    ↻ Recurring {booking.recurringFrequency} until {booking.recurringEndDate}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Service (${baseRate}/hr × {booking.duration}hr)</span>
                <span style={{ fontSize: '14px', color: '#374151' }}>${subtotal.toFixed(2)}</span>
              </div>
              {booking.isUrgent && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#f59e0b' }}>⚡ Urgent booking (1.5x)</span>
                  <span style={{ fontSize: '14px', color: '#f59e0b' }}>Included above</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Platform fee</span>
                <span style={{ fontSize: '14px', color: '#374151' }}>${platformFee.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={addInsurance}
                    onChange={(e) => setAddInsurance(e.target.checked)}
                  />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Insurance protection</span>
                  <Info size={14} color="#6b7280" />
                </div>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  {addInsurance ? `$${insuranceFee.toFixed(2)}` : '-'}
                </span>
              </div>
              {promoApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#10b981' }}>Promo discount</span>
                  <span style={{ fontSize: '14px', color: '#10b981' }}>-${promoDiscount.toFixed(2)}</span>
                </div>
              )}
              {tipAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Tip</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>${tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Total</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Add Tip */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                Add a tip for {booking.helper.name}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[0, 5, 10, 15].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount === 0 ? 0 : subtotal * (amount / 100))}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: tipAmount === (amount === 0 ? 0 : subtotal * (amount / 100)) ? '2px solid #10b981' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: tipAmount === (amount === 0 ? 0 : subtotal * (amount / 100)) ? '#f0fdf4' : 'white',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    {amount === 0 ? 'No tip' : `${amount}%`}
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom"
                  onChange={(e) => setTipAmount(Number(e.target.value))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* Promo Code */}
            {!promoApplied && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={handleApplyPromo}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Right: Payment Form */}
          <div style={{ flex: '1.2' }}>
            {step === 'review' ? (
              <>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '20px' }}>
                  Payment Method
                </h3>

                {/* Payment Methods */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
                    { id: 'apple', name: 'Apple Pay', icon: '🍎' },
                    { id: 'google', name: 'Google Pay', icon: '🇬' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      style={{
                        padding: '16px',
                        border: paymentMethod === method.id ? '2px solid #10b981' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: paymentMethod === method.id ? '#f0fdf4' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{method.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{method.name}</span>
                    </button>
                  ))}
                </div>

                {/* Card Form */}
                {paymentMethod === 'card' && (
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                        maxLength={19}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                        Name on Card
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                          maxLength={5}
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
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.slice(0, 4) })}
                          maxLength={4}
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
                          ZIP
                        </label>
                        <input
                          type="text"
                          placeholder="12345"
                          value={cardDetails.zip}
                          onChange={(e) => setCardDetails({ ...cardDetails, zip: e.target.value.slice(0, 5) })}
                          maxLength={5}
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

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '24px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                      />
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        Save card for future bookings
                      </span>
                    </label>
                  </div>
                )}

                {/* Security Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <Lock size={16} color="#10b981" />
                  <span style={{ fontSize: '13px', color: '#047857' }}>
                    Your payment information is encrypted and secure
                  </span>
                </div>

                {/* Terms */}
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
                  By confirming this booking, you agree to our Terms of Service, Cancellation Policy, and acknowledge that you have read our Privacy Policy.
                </p>

                {/* Action Buttons */}
                <button
                  onClick={handlePayment}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Lock size={18} />
                  Pay ${total.toFixed(2)}
                </button>
              </>
            ) : (
              <div>Payment step content</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;
