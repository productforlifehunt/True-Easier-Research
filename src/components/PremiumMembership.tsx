import React, { useState } from 'react';
import { Crown, Check, Star, Zap, Shield, Video, Calendar, TrendingUp, X } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PremiumTier {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

const premiumTiers: PremiumTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    billing: 'monthly',
    features: [
      'Search and browse helpers',
      'Read reviews',
      'Send messages',
      'Basic booking',
      'Standard support'
    ]
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 9.99,
    billing: 'monthly',
    popular: true,
    features: [
      'Everything in Basic',
      'Priority search results',
      'Instant booking',
      'Video chat support',
      'Booking reminders',
      '10% discount on all bookings',
      'Cancel anytime'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    billing: 'monthly',
    features: [
      'Everything in Plus',
      'Unlimited bookings',
      'Dedicated account manager',
      'Premium helper access',
      '20% discount on all bookings',
      'Priority customer support',
      'Early access to new features',
      'Background check verification'
    ]
  }
];

const PremiumMembership: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleUpgrade = async (tierId: string) => {
    setSelectedTier(tierId);
    setShowUpgradeModal(true);
  };

  const processUpgrade = async () => {
    if (!selectedTier) return;

    try {
      setProcessing(true);
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upgrade');
        return;
      }

      const tier = premiumTiers.find(t => t.id === selectedTier);
      if (!tier) return;

      await supabase.from('hfh_subscriptions').insert({
        user_id: user.id,
        tier_id: tier.id,
        tier_name: tier.name,
        price: tier.price,
        billing_cycle: billingCycle,
        status: 'active',
        started_at: new Date().toISOString()
      });

      toast.success(`Upgraded to ${tier.name} successfully!`);
      setShowUpgradeModal(false);
    } catch (error) {
      console.error('Error upgrading:', error);
      toast.error('Failed to upgrade membership');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '64px 24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#fef3c7',
            borderRadius: '20px',
            marginBottom: '16px'
          }}>
            <Crown size={16} color="#f59e0b" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b' }}>
              PREMIUM MEMBERSHIP
            </span>
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '16px'
          }}>
            Unlock Premium Features
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Get more bookings, save money, and access exclusive features
          </p>
        </div>

        {/* Billing Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '48px'
        }}>
          <span style={{
            fontSize: '15px',
            color: billingCycle === 'monthly' ? '#111827' : '#9ca3af',
            fontWeight: billingCycle === 'monthly' ? 600 : 400
          }}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            style={{
              width: '56px',
              height: '32px',
              backgroundColor: billingCycle === 'yearly' ? '#10b981' : '#e5e7eb',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'white',
              borderRadius: '50%',
              position: 'absolute',
              top: '4px',
              left: billingCycle === 'yearly' ? '28px' : '4px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '15px',
              color: billingCycle === 'yearly' ? '#111827' : '#9ca3af',
              fontWeight: billingCycle === 'yearly' ? 600 : 400
            }}>
              Yearly
            </span>
            <span style={{
              fontSize: '12px',
              padding: '4px 8px',
              backgroundColor: '#f0fdf4',
              color: '#10b981',
              borderRadius: '6px',
              fontWeight: 600
            }}>
              Save 20%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '64px'
        }}>
          {premiumTiers.map((tier) => (
            <div
              key={tier.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '32px',
                border: tier.popular ? '3px solid #10b981' : '1px solid #e5e7eb',
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              {tier.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '6px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Star size={14} fill="white" />
                  MOST POPULAR
                </div>
              )}

              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '8px'
              }}>
                {tier.name}
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
                marginBottom: '24px'
              }}>
                <span style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: '#111827'
                }}>
                  ${billingCycle === 'yearly' ? (tier.price * 12 * 0.8).toFixed(0) : tier.price}
                </span>
                <span style={{
                  fontSize: '16px',
                  color: '#6b7280'
                }}>
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>

              <button
                onClick={() => handleUpgrade(tier.id)}
                disabled={tier.id === 'basic'}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: tier.popular ? '#10b981' : tier.id === 'basic' ? '#e5e7eb' : 'white',
                  color: tier.popular ? 'white' : tier.id === 'basic' ? '#9ca3af' : '#10b981',
                  border: tier.popular || tier.id === 'basic' ? 'none' : '2px solid #10b981',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: tier.id === 'basic' ? 'not-allowed' : 'pointer',
                  marginBottom: '24px'
                }}
              >
                {tier.id === 'basic' ? 'Current Plan' : 'Upgrade Now'}
              </button>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {tier.features.map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: '12px'
                    }}
                  >
                    <Check size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{
                      fontSize: '14px',
                      color: '#374151',
                      lineHeight: 1.5
                    }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '48px',
          marginBottom: '64px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#111827',
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            Why Go Premium?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            {[
              {
                icon: Zap,
                title: 'Instant Booking',
                description: 'Skip the wait and book your favorite helpers instantly'
              },
              {
                icon: TrendingUp,
                title: 'Priority Placement',
                description: 'Appear at the top of search results and get more bookings'
              },
              {
                icon: Video,
                title: 'Video Consultations',
                description: 'Connect with helpers via video before booking'
              },
              {
                icon: Shield,
                title: 'Enhanced Protection',
                description: 'Extra security features and verified background checks'
              }
            ].map((benefit, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <benefit.icon size={32} color="#10b981" />
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  {benefit.title}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: 1.5
                }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedTier && (
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
            padding: '32px'
          }}>
            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} color="#6b7280" />
            </button>

            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Crown size={32} color="#f59e0b" />
            </div>

            <h3 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              Upgrade to {premiumTiers.find(t => t.id === selectedTier)?.name}
            </h3>

            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              Unlock all premium features and save on every booking
            </p>

            <div style={{
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Billing Cycle
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                  {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                  Total
                </span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
                  ${(() => {
                    const tier = premiumTiers.find(t => t.id === selectedTier);
                    if (!tier) return '0';
                    return billingCycle === 'yearly' 
                      ? (tier.price * 12 * 0.8).toFixed(2)
                      : tier.price.toFixed(2);
                  })()}
                </span>
              </div>
            </div>

            <button
              onClick={processUpgrade}
              disabled={processing}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: processing ? '#d1d5db' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              {processing ? 'Processing...' : 'Confirm Upgrade'}
            </button>

            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              textAlign: 'center',
              marginTop: '16px'
            }}>
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumMembership;
