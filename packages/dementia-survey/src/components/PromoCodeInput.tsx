import React, { useState } from 'react';
import { Tag, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PromoCodeInputProps {
  subtotal: number;
  onApplyPromo: (discount: number, code: string) => void;
  onRemovePromo: () => void;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  subtotal,
  onApplyPromo,
  onRemovePromo
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedCode, setAppliedCode] = useState<any>(null);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setApplying(true);
    try {
      // Check if promo code exists and is valid
      const { data, error } = await supabase
        .from('hfh_promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .single();

      if (error || !data) {
        toast.error('Invalid promo code');
        setPromoCode('');
        return;
      }

      // Check if code is still valid
      const now = new Date();
      if (data.valid_from && new Date(data.valid_from) > now) {
        toast.error('This promo code is not yet valid');
        return;
      }
      if (data.valid_until && new Date(data.valid_until) < now) {
        toast.error('This promo code has expired');
        return;
      }
      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        toast.error('This promo code has reached its usage limit');
        return;
      }
      if (data.minimum_amount && subtotal < data.minimum_amount) {
        toast.error(`Minimum order amount of $${data.minimum_amount} required`);
        return;
      }

      // Calculate discount
      let discount = 0;
      if (data.discount_type === 'percentage') {
        discount = subtotal * (data.discount_value / 100);
        if (data.max_discount_amount) {
          discount = Math.min(discount, data.max_discount_amount);
        }
      } else {
        discount = Math.min(data.discount_value, subtotal);
      }

      setAppliedCode({
        ...data,
        calculatedDiscount: discount
      });

      onApplyPromo(discount, data.code);
      toast.success(`Promo code applied! You saved $${discount.toFixed(2)}`);

      // Increment usage count
      await supabase
        .from('hfh_promo_codes')
        .update({ usage_count: (data.usage_count || 0) + 1 })
        .eq('id', data.id);

    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error('Failed to apply promo code');
    } finally {
      setApplying(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCode(null);
    setPromoCode('');
    onRemovePromo();
    toast.success('Promo code removed');
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <Tag size={18} color="#10b981" />
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#111827',
          margin: 0
        }}>
          Have a promo code?
        </h3>
      </div>

      {!appliedCode ? (
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            disabled={applying}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          />
          <button
            onClick={handleApplyPromo}
            disabled={applying}
            style={{
              padding: '10px 20px',
              backgroundColor: applying ? '#d1d5db' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: applying ? 'not-allowed' : 'pointer'
            }}
          >
            {applying ? 'Applying...' : 'Apply'}
          </button>
        </div>
      ) : (
        <div style={{
          padding: '12px',
          backgroundColor: '#ecfdf5',
          borderRadius: '8px',
          border: '1px solid #10b981'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={18} color="#10b981" />
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#065f46',
                  margin: 0
                }}>
                  {appliedCode.code} applied
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#047857',
                  marginTop: '2px',
                  margin: 0
                }}>
                  {appliedCode.discount_type === 'percentage' 
                    ? `${appliedCode.discount_value}% off`
                    : `$${appliedCode.discount_value} off`}
                  {' - '}You saved ${appliedCode.calculatedDiscount.toFixed(2)}!
                </p>
              </div>
            </div>
            <button
              onClick={handleRemovePromo}
              style={{
                padding: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <XCircle size={18} color="#dc2626" />
            </button>
          </div>
        </div>
      )}

      {/* Popular Promo Codes */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          marginBottom: '8px'
        }}>
          Popular offers:
        </p>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {['FIRST10', 'WELCOME20', 'FRIEND15'].map(code => (
            <button
              key={code}
              onClick={() => {
                setPromoCode(code);
                handleApplyPromo();
              }}
              disabled={applying || appliedCode}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#374151',
                cursor: applying || appliedCode ? 'not-allowed' : 'pointer',
                opacity: applying || appliedCode ? 0.5 : 1,
                letterSpacing: '0.5px'
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoCodeInput;
