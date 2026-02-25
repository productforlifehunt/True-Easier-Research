import React, { useState } from 'react';
import { CreditCard, Shield, Clock, CheckCircle, AlertCircle, Lock, DollarSign, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentEscrowProps {
  booking: any;
  onComplete?: () => void;
}

const PaymentEscrow: React.FC<PaymentEscrowProps> = ({ booking, onComplete }) => {
  const [step, setStep] = useState<'payment' | 'processing' | 'held' | 'released'>('payment');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      setStep('processing');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStep('held');
      toast.success('Payment secured in escrow');
      
      // Simulate automatic release after service completion
      setTimeout(() => {
        setStep('released');
        toast.success('Payment released to helper');
        onComplete?.();
      }, 5000);
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={24} style={{ color: '#10b981' }} />
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#1d1d1f',
              margin: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              Secure Payment Escrow
            </h3>
            <p style={{ fontSize: '13px', color: '#86868b', margin: '4px 0 0' }}>
              Your payment is protected until service completion
            </p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div style={{
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '24px',
          right: '24px',
          height: '2px',
          backgroundColor: '#f0fdf4',
          zIndex: 0
        }}>
          <div style={{
            width: step === 'payment' ? '0%' : 
                   step === 'processing' ? '33%' : 
                   step === 'held' ? '66%' : '100%',
            height: '100%',
            backgroundColor: '#10b981',
            transition: 'width 0.5s ease'
          }} />
        </div>

        {[
          { id: 'payment', label: 'Payment', icon: CreditCard },
          { id: 'processing', label: 'Processing', icon: Clock },
          { id: 'held', label: 'In Escrow', icon: Lock },
          { id: 'released', label: 'Released', icon: CheckCircle }
        ].map((s, idx) => {
          const Icon = s.icon;
          const isActive = ['payment', 'processing', 'held', 'released'].indexOf(step) >= idx;
          
          return (
            <div key={s.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#10b981' : 'white',
                border: `2px solid ${isActive ? '#10b981' : '#e5e7eb'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}>
                <Icon size={16} color={isActive ? 'white' : '#9ca3af'} />
              </div>
              <span style={{
                fontSize: '12px',
                color: isActive ? '#1d1d1f' : '#86868b',
                marginTop: '8px',
                fontWeight: isActive ? 600 : 400
              }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {step === 'payment' && (
          <>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { id: 'card', label: 'Credit Card', icon: CreditCard },
                  { id: 'paypal', label: 'PayPal', icon: DollarSign }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    style={{
                      padding: '16px',
                      backgroundColor: paymentMethod === method.id ? '#f0fdf4' : 'white',
                      border: `2px solid ${paymentMethod === method.id ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <method.icon size={20} color={paymentMethod === method.id ? '#10b981' : '#6b7280'} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: paymentMethod === method.id ? '#10b981' : '#374151'
                    }}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Summary */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Service Amount</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                  ${booking?.total_amount || 120}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Platform Fee (5%)</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                  ${((booking?.total_amount || 120) * 0.05).toFixed(2)}
                </span>
              </div>
              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Total</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
                  ${((booking?.total_amount || 120) * 1.05).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Security Info */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '13px', color: '#92400e', margin: 0, fontWeight: 600 }}>
                  Escrow Protection
                </p>
                <p style={{ fontSize: '12px', color: '#92400e', margin: '4px 0 0', lineHeight: 1.4 }}>
                  Your payment will be held securely until the service is completed. 
                  The helper receives payment only after you confirm satisfaction.
                </p>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              Secure Payment
              <ArrowRight size={18} />
            </button>
          </>
        )}

        {step === 'processing' && (
          <div style={{
            textAlign: 'center',
            padding: '40px 0'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <Clock size={32} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>
              Processing Payment
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Securing your payment in escrow...
            </p>
          </div>
        )}

        {step === 'held' && (
          <div style={{
            textAlign: 'center',
            padding: '40px 0'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={32} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>
              Payment Secured
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              Your payment is safely held in escrow
            </p>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'left'
            }}>
              <p style={{ fontSize: '13px', color: '#065f46', margin: 0, fontWeight: 600 }}>
                What happens next?
              </p>
              <ul style={{ fontSize: '12px', color: '#065f46', margin: '8px 0 0', paddingLeft: '20px' }}>
                <li>Helper completes the service</li>
                <li>You confirm satisfaction</li>
                <li>Payment is released to helper</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'released' && (
          <div style={{
            textAlign: 'center',
            padding: '40px 0'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={32} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>
              Payment Released
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Transaction completed successfully
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.7; }
          100% { transform: scale(0.95); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PaymentEscrow;
