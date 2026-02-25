import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import UnifiedLayout from '../components/UnifiedLayout';
import { ShoppingBag, Package, Truck, Clock, Shield, Star, CheckCircle, ChevronRight, MapPin, DollarSign, Calendar, Home } from 'lucide-react';

const ErrandServices: React.FC = () => {
  const navigate = useNavigate();
  const [featuredHelpers, setFeaturedHelpers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const errandTypes = [
    { icon: ShoppingBag, name: 'Grocery Shopping', description: 'Fresh groceries delivered to your door', popular: true },
    { icon: Package, name: 'Package Pickup', description: 'Collect and deliver packages for you', popular: true },
    { icon: Truck, name: 'Delivery Services', description: 'Local delivery and courier services' },
    { icon: Home, name: 'Household Errands', description: 'Dry cleaning, post office, and more', popular: true },
    { icon: ShoppingBag, name: 'Shopping Assistance', description: 'Personal shopping for any items' },
    { icon: MapPin, name: 'Local Errands', description: 'Any local task you need done' },
    { icon: Clock, name: 'Urgent Errands', description: 'Same-day emergency errands' },
    { icon: Calendar, name: 'Scheduled Errands', description: 'Regular weekly/monthly errands' },
    { icon: DollarSign, name: 'Banking & Bills', description: 'Bank visits, bill payments' }
  ];

  useEffect(() => {
    loadFeaturedHelpers();
  }, []);

  const loadFeaturedHelpers = async () => {
    try {
      const { data, error } = await supabase
        .from('hfh_helpers')
        .select('*')
        .contains('services', ['errand-services'])
        .gte('rating', 4.5)
        .limit(6);

      if (error) throw error;
      setFeaturedHelpers(data || []);
    } catch (error) {
      console.error('Error loading featured helpers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UnifiedLayout>
      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        {/* Hero Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '80px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '24px'
              }}>
                <ShoppingBag size={16} />
                <span>Trusted • Fast • Reliable</span>
              </div>
              
              <h1 style={{
                fontSize: '48px',
                fontWeight: 800,
                color: '#111827',
                marginBottom: '16px',
                letterSpacing: '-0.02em'
              }}>
                Errand Services
              </h1>
              
              <p style={{
                fontSize: '20px',
                color: '#6b7280',
                maxWidth: '600px',
                margin: '0 auto 32px',
                lineHeight: 1.5
              }}>
                Get your errands done by trusted helpers. Save time and focus on what matters most.
              </p>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '32px'
              }}>
                <button
                  onClick={() => navigate('/humans-for-hire/browse?service=errand-services')}
                  style={{
                    padding: '14px 32px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Find Helpers
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/humans-for-hire/how-it-works')}
                  style={{
                    padding: '14px 32px',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  How It Works
                </button>
              </div>

              {/* Stats */}
              <div style={{
                display: 'flex',
                gap: '48px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>5,000+</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Helpers Available</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>30 min</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Average Response</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>Same Day</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Service Available</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Types */}
        <section style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Popular Errand Services
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {errandTypes.map((errand, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/humans-for-hire/browse?service=errand-services&type=${errand.name.toLowerCase().replace(/ /g, '-')}`)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'white',
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    {React.createElement(errand.icon, { size: 24, color: '#10b981' })}
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {errand.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: 1.5
                  }}>
                    {errand.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{
          backgroundColor: 'white',
          padding: '60px 24px',
          borderTop: '1px solid #f3f4f6'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              How Errand Services Work
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 700
                }}>
                  1
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                  Post Your Errand
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Describe what you need done and when you need it
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 700
                }}>
                  2
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                  Choose Helper
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Review profiles and select the best helper for your task
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 700
                }}>
                  3
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                  Get It Done
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Relax while your helper completes the errand safely
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Why Choose Our Errand Services
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <Shield size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  Vetted Helpers
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  All helpers are background checked and verified
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '24px' }}>
                <Clock size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  Fast Service
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Same-day service available for urgent tasks
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '24px' }}>
                <DollarSign size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  Fair Pricing
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Transparent pricing with no hidden fees
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '24px' }}>
                <Star size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  Rated Service
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Read verified reviews from real customers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '60px 24px',
          textAlign: 'center',
          borderTop: '1px solid #f3f4f6'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '16px'
            }}>
              Ready to Save Time?
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              marginBottom: '32px'
            }}>
              Get your errands done today by trusted helpers in your area
            </p>
            <button
              onClick={() => navigate('/humans-for-hire/browse?service=errand-services')}
              style={{
                padding: '16px 40px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Find Errand Helpers
            </button>
          </div>
        </section>
      </div>
    </UnifiedLayout>
  );
};

export default ErrandServices;
