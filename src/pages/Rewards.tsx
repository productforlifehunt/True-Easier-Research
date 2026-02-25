import React, { useState } from 'react';
import { Gift, Users, Star, Award, TrendingUp, Check, Copy, Share2, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UnifiedLayout from '../components/UnifiedLayout';
import toast from 'react-hot-toast';

const Rewards: React.FC = () => {
  const navigate = useNavigate();
  const [referralCode] = useState('FRIEND2024');
  const [points] = useState(1250);
  
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(`https://humansforhire.com/ref/${referralCode}`);
    toast.success('Referral link copied to clipboard!');
  };

  return (
    <UnifiedLayout>
      <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        {/* Hero */}
        <section style={{ padding: '80px 24px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Gift size={40} color="white" />
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
              Rewards & Referrals
            </h1>
            <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '600px', margin: '0 auto 24px' }}>
              Earn points with every booking and get rewards for referring friends
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'white',
              padding: '16px 32px',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <Star size={24} color="#f59e0b" fill="#f59e0b" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Your Points</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{points.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              How to Earn Points
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {[
                {
                  icon: DollarSign,
                  title: 'Book Services',
                  points: '10 points per $1',
                  description: 'Earn points on every dollar you spend booking helpers'
                },
                {
                  icon: Users,
                  title: 'Refer Friends',
                  points: '500 points',
                  description: 'Get 500 points when a friend makes their first booking'
                },
                {
                  icon: Star,
                  title: 'Leave Reviews',
                  points: '50 points',
                  description: 'Share your experience and help others make informed decisions'
                },
                {
                  icon: Award,
                  title: 'Complete Profile',
                  points: '200 points',
                  description: 'Fill out your profile with photo and preferences'
                }
              ].map((item, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <item.icon size={32} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                    {item.title}
                  </h3>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', marginBottom: '12px' }}>
                    {item.points}
                  </div>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Referral Program */}
        <section style={{ padding: '80px 24px', backgroundColor: '#fef3c7' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
                Refer & Earn $50
              </h2>
              <p style={{ fontSize: '18px', color: '#92400e', maxWidth: '700px', margin: '0 auto' }}>
                Give your friends $25 off their first booking, and you'll get $50 when they complete it
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '40px',
              marginBottom: '32px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                  Your Referral Link
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb'
                }}>
                  <input
                    type="text"
                    value={`https://humansforhire.com/ref/${referralCode}`}
                    readOnly
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '15px',
                      color: '#374151',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleCopyReferralCode}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Copy size={16} />
                    Copy Link
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <button style={{
                  padding: '14px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Share2 size={18} />
                  Share via Email
                </button>
                <button style={{
                  padding: '14px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Share2 size={18} />
                  Share on Social
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              textAlign: 'center'
            }}>
              {[
                { number: '1', title: 'Share Your Link', desc: 'Send to friends via email, text, or social media' },
                { number: '2', title: 'Friend Books', desc: 'They get $25 off their first service' },
                { number: '3', title: 'You Get $50', desc: 'Credited to your account after their booking' }
              ].map((step, index) => (
                <div key={index}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 700,
                    margin: '0 auto 16px'
                  }}>
                    {step.number}
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rewards Tiers */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Membership Tiers
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '48px', textAlign: 'center' }}>
              Unlock better rewards as you earn more points
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                {
                  tier: 'Bronze',
                  points: '0-999',
                  color: '#cd7f32',
                  benefits: ['5% cashback', 'Priority support', 'Early access to new helpers', 'Birthday bonus']
                },
                {
                  tier: 'Silver',
                  points: '1,000-4,999',
                  color: '#c0c0c0',
                  benefits: ['10% cashback', 'Free cancellation', 'Concierge service', 'Exclusive deals']
                },
                {
                  tier: 'Gold',
                  points: '5,000-9,999',
                  color: '#ffd700',
                  benefits: ['15% cashback', 'VIP support 24/7', 'Premium insurance', 'Partner perks']
                },
                {
                  tier: 'Platinum',
                  points: '10,000+',
                  color: '#10b981',
                  benefits: ['20% cashback', 'Personal account manager', 'Lifetime warranty', 'Invitation-only events']
                }
              ].map((level, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  border: index === 1 ? '3px solid #10b981' : '2px solid #e5e7eb',
                  position: 'relative'
                }}>
                  {index === 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '4px 16px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      YOUR TIER
                    </div>
                  )}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: level.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Award size={28} color="white" />
                  </div>
                  <h4 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
                    {level.tier}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px', textAlign: 'center' }}>
                    {level.points} points
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {level.benefits.map((benefit, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        fontSize: '14px',
                        color: '#374151'
                      }}>
                        <Check size={16} color="#10b981" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Redeem Points */}
        <section style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              Redeem Your Points
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              {[
                { points: 500, value: '$5', description: 'Service credit' },
                { points: 1000, value: '$12', description: 'Service credit' },
                { points: 2500, value: '$30', description: 'Service credit' },
                { points: 5000, value: '$75', description: 'Service credit' },
                { points: 10000, value: '$200', description: 'Service credit' }
              ].map((reward, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '2px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>
                    {reward.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    {reward.description}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                    {reward.points} points
                  </div>
                  <button
                    disabled={points < reward.points}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: points >= reward.points ? '#10b981' : '#e5e7eb',
                      color: points >= reward.points ? 'white' : '#9ca3af',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: points >= reward.points ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {points >= reward.points ? 'Redeem' : 'Not Enough Points'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Start Earning Today
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
              Book a service or refer a friend to start earning points
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/humans-for-hire/browse')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Book a Service
              </button>
              <button
                onClick={handleCopyReferralCode}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'white',
                  color: '#10b981',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Share Referral Link
              </button>
            </div>
          </div>
        </section>
      </div>
    </UnifiedLayout>
  );
};

export default Rewards;
