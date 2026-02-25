import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, MessageSquare, Calendar, Shield, Star, CheckCircle, DollarSign } from 'lucide-react';
import UnifiedLayout from '../components/UnifiedLayout';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <UnifiedLayout>
      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        {/* Hero */}
        <section style={{
          backgroundColor: 'white',
          padding: '80px 24px',
          textAlign: 'center',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '24px'
            }}>
              How It Works
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#6b7280',
              lineHeight: 1.6
            }}>
              Get started in minutes. Whether you need help or want to offer your services, our platform makes it simple and safe.
            </p>
          </div>
        </section>

        {/* For Clients */}
        <section style={{ padding: '80px 24px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              For Clients: Finding Help
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px'
            }}>
              {[
                {
                  icon: Search,
                  step: '1',
                  title: 'Search & Browse',
                  description: 'Browse our marketplace of verified helpers. Filter by service, location, price, and more.'
                },
                {
                  icon: UserPlus,
                  step: '2',
                  title: 'Review Profiles',
                  description: 'Check ratings, reviews, background checks, and video introductions. Compare up to 3 helpers.'
                },
                {
                  icon: MessageSquare,
                  step: '3',
                  title: 'Message & Negotiate',
                  description: 'Chat directly with helpers. Discuss details, negotiate rates, and schedule a time.'
                },
                {
                  icon: Calendar,
                  step: '4',
                  title: 'Book & Pay Securely',
                  description: 'Book instantly or schedule ahead. Payment held in escrow until service is complete.'
                }
              ].map((item, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'white',
                    border: '2px solid #10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    position: 'relative'
                  }}>
                    <item.icon size={32} color="#10b981" />
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700
                    }}>
                      {item.step}
                    </div>
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: 1.5
                  }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button
                onClick={() => navigate('/humans-for-hire/browse')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Start Browsing →
              </button>
            </div>
          </div>
        </section>

        {/* For Helpers */}
        <section style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              For Helpers: Earning Money
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px'
            }}>
              {[
                {
                  icon: UserPlus,
                  step: '1',
                  title: 'Create Profile',
                  description: 'Sign up and create your professional profile. Add services, rates, and availability.'
                },
                {
                  icon: Shield,
                  step: '2',
                  title: 'Get Verified',
                  description: 'Complete identity verification and optional background check to build trust.'
                },
                {
                  icon: MessageSquare,
                  step: '3',
                  title: 'Receive Requests',
                  description: 'Get booking requests from clients. Respond quickly to increase your success rate.'
                },
                {
                  icon: DollarSign,
                  step: '4',
                  title: 'Complete & Get Paid',
                  description: 'Provide great service. Get paid automatically after job completion and review.'
                }
              ].map((item, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    position: 'relative'
                  }}>
                    <item.icon size={32} color="#f59e0b" />
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700
                    }}>
                      {item.step}
                    </div>
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: 1.5
                  }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button
                onClick={() => navigate('/humans-for-hire/onboarding')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Become a Helper →
              </button>
            </div>
          </div>
        </section>

        {/* Safety & Trust */}
        <section style={{ padding: '80px 24px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Safety & Trust
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px'
            }}>
              {[
                {
                  icon: Shield,
                  title: 'Identity Verification',
                  description: 'All helpers must verify their identity. Look for the verified badge.'
                },
                {
                  icon: CheckCircle,
                  title: 'Background Checks',
                  description: 'Optional background checks available. Filter by background-checked helpers only.'
                },
                {
                  icon: DollarSign,
                  title: 'Secure Escrow',
                  description: 'Payments held safely until service is complete. Dispute resolution available.'
                },
                {
                  icon: Star,
                  title: 'Ratings & Reviews',
                  description: 'Real reviews from real clients. 4.8+ average rating across platform.'
                },
                {
                  icon: MessageSquare,
                  title: 'In-App Chat',
                  description: 'All communication on platform. No need to share personal contact info.'
                },
                {
                  icon: Shield,
                  title: 'Emergency Support',
                  description: '24/7 support team. Emergency alert button for safety concerns.'
                }
              ].map((item, index) => (
                <div key={index} style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'white',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <item.icon size={24} color="#10b981" />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#111827',
                      marginBottom: '6px'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      lineHeight: 1.5
                    }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          padding: '80px 24px',
          background: '#10b981',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: 'white',
              marginBottom: '16px'
            }}>
              Ready to Get Started?
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '32px'
            }}>
              Join thousands of happy clients and helpers on our platform
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => navigate('/humans-for-hire/browse')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'white',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Find Help
              </button>
              <button
                onClick={() => navigate('/humans-for-hire/onboarding')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Become a Helper
              </button>
            </div>
          </div>
        </section>
      </div>
    </UnifiedLayout>
  );
};

export default HowItWorks;
