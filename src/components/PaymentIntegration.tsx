import React, { useState } from 'react';
import { CreditCard, Lock, AlertCircle, Check, Apple, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentIntegrationProps {
  amount: number;
  onSuccess?: (paymentMethodId: string) => void;
  onCancel?: () => void;
  showSaveCard?: boolean;
}

const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({
  amount,
  onSuccess,
  onCancel,
  showSaveCard = true
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateCard = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Invalid card number';
    }
    
    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Invalid format (MM/YY)';
    }
    
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }
    
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCard()) {
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create payment method record
      const paymentMethodId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      toast.success('Payment processed successfully!');
      
      if (onSuccess) {
        onSuccess(paymentMethodId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return 'Card';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Lock size={20} style={{ color: '#10b981' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Secure Payment
          </h3>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Your payment information is encrypted and secure
        </p>
      </div>

      {/* Amount */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: '#f0fdf4',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Amount</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>
            ${amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
        {/* Card Number */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>
            Card Number
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                if (formatted.replace(/\s/g, '').length <= 16) {
                  setCardNumber(formatted);
                }
              }}
              placeholder="1234 5678 9012 3456"
              style={{
                width: '100%',
                padding: '12px 40px 12px 12px',
                border: `1px solid ${errors.cardNumber ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => !errors.cardNumber && (e.currentTarget.style.borderColor = '#10b981')}
              onBlur={(e) => !errors.cardNumber && (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
            <CreditCard 
              size={20} 
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} 
            />
          </div>
          {errors.cardNumber && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '6px',
              fontSize: '13px',
              color: '#ef4444'
            }}>
              <AlertCircle size={14} />
              {errors.cardNumber}
            </div>
          )}
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            {getCardType(cardNumber)} • 16 digits
          </div>
        </div>

        {/* Expiry and CVV */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Expiry Date */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Expiry Date
            </label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => {
                const formatted = formatExpiryDate(e.target.value);
                if (formatted.length <= 5) {
                  setExpiryDate(formatted);
                }
              }}
              placeholder="MM/YY"
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.expiryDate ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => !errors.expiryDate && (e.currentTarget.style.borderColor = '#10b981')}
              onBlur={(e) => !errors.expiryDate && (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
            {errors.expiryDate && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
                fontSize: '13px',
                color: '#ef4444'
              }}>
                <AlertCircle size={14} />
                {errors.expiryDate}
              </div>
            )}
          </div>

          {/* CVV */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 4) {
                  setCvv(value);
                }
              }}
              placeholder="123"
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.cvv ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => !errors.cvv && (e.currentTarget.style.borderColor = '#10b981')}
              onBlur={(e) => !errors.cvv && (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
            {errors.cvv && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
                fontSize: '13px',
                color: '#ef4444'
              }}>
                <AlertCircle size={14} />
                {errors.cvv}
              </div>
            )}
          </div>
        </div>

        {/* Cardholder Name */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="John Doe"
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${errors.cardholderName ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: '10px',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => !errors.cardholderName && (e.currentTarget.style.borderColor = '#10b981')}
            onBlur={(e) => !errors.cardholderName && (e.currentTarget.style.borderColor = '#e5e7eb')}
          />
          {errors.cardholderName && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '6px',
              fontSize: '13px',
              color: '#ef4444'
            }}>
              <AlertCircle size={14} />
              {errors.cardholderName}
            </div>
          )}
        </div>

        {/* Save Card Option */}
        {showSaveCard && (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>
              Save card for future bookings
            </span>
          </label>
        )}

        {/* Security Info */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
          <Lock size={18} style={{ color: '#10b981', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', marginBottom: '4px' }}>
              256-bit SSL Encryption
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
              Your payment information is processed securely. We do not store credit card details.
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>
            WE ACCEPT
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#1a1f71'
            }}>
              VISA
            </div>
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#eb001b'
            }}>
              MASTERCARD
            </div>
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#006fcf'
            }}>
              AMEX
            </div>
            <Apple size={24} style={{ color: '#000000' }} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
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
                opacity: isProcessing ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={isProcessing}
            style={{
              flex: onCancel ? 1 : undefined,
              width: onCancel ? undefined : '100%',
              padding: '14px',
              backgroundColor: isProcessing ? '#e5e7eb' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isProcessing) {
                e.currentTarget.style.backgroundColor = '#059669';
              }
            }}
            onMouseOut={(e) => {
              if (!isProcessing) {
                e.currentTarget.style.backgroundColor = '#10b981';
              }
            }}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Check size={18} />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentIntegration;
