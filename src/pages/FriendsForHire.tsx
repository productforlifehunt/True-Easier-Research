import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import UnifiedLayout from '../components/UnifiedLayout';
import { Users, Calendar, MapPin, Heart, Star, Shield, Clock, Video, Coffee, Music, Film, Book, Camera, Gamepad2, Dumbbell, ShoppingBag, Plane, ChevronRight } from 'lucide-react';

const FriendsForHire: React.FC = () => {
  const navigate = useNavigate();
  const [featuredFriends, setFeaturedFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activityCategories = [
    { icon: Coffee, name: 'Coffee & Chat', description: 'Grab coffee and have meaningful conversations' },
    { icon: Film, name: 'Movie Buddy', description: 'Watch movies together at home or theater' },
    { icon: Music, name: 'Concert Partner', description: 'Attend concerts and music events' },
    { icon: Dumbbell, name: 'Workout Partner', description: 'Stay motivated with a gym buddy' },
    { icon: ShoppingBag, name: 'Shopping Companion', description: 'Make shopping more fun with company' },
    { icon: Book, name: 'Study Buddy', description: 'Study together and stay focused' },
    { icon: Gamepad2, name: 'Gaming Partner', description: 'Play video games or board games' },
    { icon: Camera, name: 'Photography Walks', description: 'Explore and capture moments together' },
    { icon: Plane, name: 'Travel Companion', description: 'Explore new places with a friend' }
  ];

  useEffect(() => {
    loadFeaturedFriends();
  }, []);

  const loadFeaturedFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('hfh_helpers')
        .select('*')
        .contains('services', ['friends-for-hire'])
        .gte('rating', 4.5)
        .limit(8);

      if (error) throw error;
      setFeaturedFriends(data || []);
    } catch (error) {
      console.error('Error loading featured friends:', error);
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
                <Users size={16} />
                <span>100% Real Humans • Zero AI</span>
              </div>
              
              <h1 style={{
                fontSize: '48px',
                fontWeight: 800,
                color: '#111827',
                marginBottom: '16px',
                letterSpacing: '-0.02em'
              }}>
                Friends for Hire
              </h1>
              
              <p style={{
                fontSize: '20px',
                color: '#6b7280',
                maxWidth: '600px',
                margin: '0 auto 32px',
                lineHeight: 1.5
              }}>
                Find genuine companions for activities, events, and meaningful connections.
                Because sometimes you just need a human friend.
              </p>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '32px'
              }}>
                <button
                  onClick={() => navigate('/humans-for-hire/browse?service=friends-for-hire')}
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
                  Browse Friends
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
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>10,000+</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Verified Friends</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>4.8</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Average Rating</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>24/7</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Availability</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Categories */}
        <section style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Find Friends for Any Activity
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {activityCategories.map((category, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/humans-for-hire/browse?service=friends-for-hire&activity=${category.name.toLowerCase().replace(/ /g, '-')}`)}
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
                    {React.createElement(category.icon, { size: 24, color: '#10b981' })}
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {category.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: 1.5
                  }}>
                    {category.description}
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
              How Friends for Hire Works
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
                  Browse & Match
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Browse verified friends based on interests, location, and availability
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
                  Connect & Plan
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Message your friend to plan activities and set expectations
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
                  Meet & Enjoy
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Meet in person for your planned activity and build genuine connections
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Safety */}
        <section style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Your Safety is Our Priority
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '24px'
              }}>
                <Shield size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  Background Checks
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  All friends undergo thorough background verification
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '24px'
              }}>
                <Video size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  Video Profiles
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  See video introductions before booking
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '24px'
              }}>
                <Star size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  Verified Reviews
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Read authentic reviews from real users
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '24px'
              }}>
                <Clock size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  24/7 Support
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Our team is always here to help you
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
              Ready to Find Your Perfect Friend?
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              marginBottom: '32px'
            }}>
              Join thousands of people making genuine connections every day
            </p>
            <button
              onClick={() => navigate('/humans-for-hire/browse?service=friends-for-hire')}
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
              Start Browsing Friends
            </button>
          </div>
        </section>
      </div>
    </UnifiedLayout>
  );
};

export default FriendsForHire;
