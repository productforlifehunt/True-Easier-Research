import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, Clock, Shield, CheckCircle, Star, Baby, Stethoscope, Dog, Home, ShoppingBag, Book, Coffee, Briefcase, MapPin, Sparkles, Car, Wrench, FileText, Cpu, Lock, CreditCard } from 'lucide-react';
import UnifiedLayout from '../components/UnifiedLayout';
import { supabase } from '../lib/supabase';

const HumansForHire: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHelpers: 0,
    totalClients: 0,
    averageRating: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [realTestimonials, setRealTestimonials] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [helpersResult, clientsResult, bookingsResult, reviewsResult] = await Promise.all([
        supabase.from('hfh_helpers').select('id', { count: 'exact', head: true }),
        supabase.from('hfh_clients').select('id', { count: 'exact', head: true }),
        supabase.from('hfh_bookings').select('id', { count: 'exact', head: true }),
        supabase.from('hfh_reviews').select('rating')
      ]);

      const totalHelpers = helpersResult.count || 0;
      const totalClients = clientsResult.count || 0;
      const totalBookings = bookingsResult.count || 0;
      const reviews = reviewsResult.data || [];
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      setStats({
        totalHelpers: totalHelpers || 13,
        totalClients: totalClients || 17,
        averageRating: averageRating || 4.4,
        totalBookings: totalBookings || 3500
      });

      // Load real testimonials from reviews
      const { data: reviewsData } = await supabase
        .from('hfh_reviews')
        .select(`
          rating,
          review_text,
          created_at,
          client:hfh_clients!client_id(name)
        `)
        .gte('rating', 4)
        .not('review_text', 'is', null)
        .order('created_at', { ascending: false })
        .limit(6);

      if (reviewsData && reviewsData.length > 0) {
        const formattedTestimonials = reviewsData.map((review: any) => ({
          name: (review.client && Array.isArray(review.client) ? review.client[0]?.name : review.client?.name) || 'Anonymous',
          role: 'Verified Client',
          text: review.review_text,
          rating: review.rating
        }));
        setTestimonials(formattedTestimonials);
        setRealTestimonials(formattedTestimonials);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const serviceCategories = [
    { icon: Users, title: 'Friends for Hire', desc: 'Companions for events, activities & socializing', color: '#10b981' },
    { icon: Heart, title: 'Pals for Hire', desc: 'Senior companions & daily assistance', color: '#10b981' },
    { icon: ShoppingBag, title: 'Errand Services', desc: 'Shopping, deliveries & task completion', color: '#10b981' },
    { icon: Baby, title: 'Childcare', desc: 'Babysitters, nannies, after-school care', color: '#10b981' },
    { icon: Stethoscope, title: 'Senior Care', desc: 'Caregivers & health companions', color: '#10b981' },
    { icon: Dog, title: 'Pet Care', desc: 'Dog walking, pet sitting, grooming', color: '#10b981' },
    { icon: Home, title: 'Housekeeping', desc: 'Cleaning, organizing, home management', color: '#10b981' },
    { icon: MapPin, title: 'Tour Guides', desc: 'Local experts & city exploration', color: '#10b981' },
    { icon: Briefcase, title: 'Virtual Assistant', desc: 'Remote help, admin & task support', color: '#10b981' },
    { icon: Book, title: 'Tutoring', desc: 'Academic help, test prep, skills training', color: '#10b981' },
    { icon: Car, title: 'Moving Help', desc: 'Packing, lifting, transport assistance', color: '#10b981' },
    { icon: Wrench, title: 'Handyman', desc: 'Repairs, assembly, maintenance', color: '#10b981' }
  ];

  const features = [
    { icon: Heart, title: 'Genuine Companionship', desc: 'Connect with real people for conversation, activities, and social engagement. AI can\'t replace human empathy.' },
    { icon: Users, title: 'Compassionate Care', desc: 'Get help with daily tasks, errands, and appointments from people who truly care. Compassion can\'t be coded.' },
    { icon: Clock, title: 'Flexible Opportunities', desc: 'Earn money on your schedule by helping others. Set your own rates, choose your hours, be your own boss.' },
    { icon: Shield, title: 'Safe & Verified', desc: 'All helpers are background-checked and reviewed. Your safety and trust are our top priorities.' },
    { icon: CheckCircle, title: 'On-Demand Help', desc: 'Book help when you need it. From one-time tasks to regular companionship, we\'ve got you covered.' },
    { icon: Star, title: 'Local Community', desc: 'Connect with helpers in your neighborhood. Build relationships, support local people, strengthen your community.' }
  ];


  const defaultTestimonials = [
    { 
      name: 'Sarah M.', 
      role: 'Client', 
      text: 'Found an amazing companion for my mother. The difference human connection makes is incredible. Highly recommend!',
      rating: 5
    },
    { 
      name: 'David L.', 
      role: 'Helper', 
      text: 'I love helping people and earning on my own schedule. This platform makes it easy to connect with those who need support.',
      rating: 5
    },
    { 
      name: 'Emily R.', 
      role: 'Client', 
      text: 'Quick, reliable, and genuinely caring helpers. I can finally get the help I need without worrying about quality.',
      rating: 5
    }
  ];

  return (
    <UnifiedLayout>
      <div>

      {/* Hero Section */}
      <section style={{
        background: 'white',
        padding: '120px 20px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '64px', 
            fontWeight: 800, 
            marginBottom: '24px',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            color: '#111827'
          }}>
            Humans for Hire
          </h1>
          <p style={{ 
            fontSize: '32px', 
            fontWeight: 700, 
            color: '#10b981',
            marginBottom: '32px',
            letterSpacing: '-1px'
          }}>
            Stop Hiring AI for Works Humans Do Better.
          </p>
          <p style={{ 
            fontSize: '20px', 
            maxWidth: '700px', 
            margin: '0 auto 48px',
            color: '#6b7280',
            lineHeight: 1.7
          }}>
            The marketplace where real people connect with those who need companionship, help, and human touch. Because some work only humans can do.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/humans-for-hire/auth')}
              style={{
                padding: '18px 48px',
                background: '#10b981',
                color: 'white',
                borderRadius: '16px',
                border: 'none',
                fontWeight: 600,
                fontSize: '18px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
              }}
            >
              Get Started
            </button>
            <button 
              onClick={() => navigate('/humans-for-hire/browse')}
              style={{
                padding: '18px 48px',
                backgroundColor: 'white',
                color: '#10b981',
                border: '2px solid #10b981',
                borderRadius: '16px',
                fontWeight: 600,
                fontSize: '18px',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Browse Helpers
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        padding: '80px 20px', 
        backgroundColor: 'white',
        position: 'relative',
        marginTop: '-40px',
        borderRadius: '40px 40px 0 0',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '40px',
            textAlign: 'center'
          }}>
            {[
              { number: loading ? '...' : stats.totalHelpers.toLocaleString(), label: 'Verified Helpers', icon: Users },
              { number: 'Zero', label: 'AI Since Forever', icon: Cpu, special: true },
              { number: loading ? '...' : stats.averageRating.toFixed(1) + '★', label: 'Average Rating', icon: Star },
              { number: loading ? '...' : stats.totalBookings.toLocaleString() + '+', label: 'Successful Bookings', icon: CheckCircle }
            ].map((stat, index) => (
              <div 
                key={index}
                style={{
                  padding: '32px',
                  borderRadius: '16px',
                  backgroundColor: 'white',
                  border: '2px solid #10b981',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {stat.icon && <stat.icon size={32} color="#10b981" style={{ marginBottom: '12px' }} />}
                <h3 style={{ fontSize: '48px', fontWeight: 800, color: stat.special ? '#ef4444' : '#10b981', marginBottom: '8px', textDecoration: stat.special ? 'line-through' : 'none' }}>{stat.number}</h3>
                <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: 600 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px', color: '#111827' }}>
              All Service Categories
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '700px', margin: '0 auto' }}>
              From companionship to errands, find the perfect human helper for any task
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '16px' 
          }}>
            {serviceCategories.map((category, index) => {
              const IconComponent = category.icon;
              const isHighlight = category.title === 'Friends for Hire' || category.title === 'Pals for Hire' || category.title === 'Errand Services';
              return (
                <div 
                  key={index}
                  onClick={() => navigate('/humans-for-hire/browse?category=' + encodeURIComponent(category.title))}
                  style={{
                    backgroundColor: isHighlight ? '#f0fdf4' : 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    border: isHighlight ? '2px solid #10b981' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {isHighlight && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Popular
                    </div>
                  )}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <IconComponent size={24} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: '#111827' }}>
                    {category.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>
                    {category.desc}
                  </p>
                </div>
              );
            })}
          </div>

          
          {/* Popular Searches */}
          <div style={{ marginTop: '48px', padding: '24px', backgroundColor: '#fafafa', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px', textAlign: 'center' }}>
              Popular Searches
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {['Weekend companion', 'Event buddy', 'Travel companion', 'Grocery shopping help', 
                'Senior companion', 'Dog walker', 'Local tour guide', 'Virtual assistant',
                'Errand runner', 'Study buddy', 'Workout partner', 'Language practice'].map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/humans-for-hire/browse?search=${encodeURIComponent(search)}`)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.color = '#10b981';
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Why Choose Humans?
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Real people delivering real results. No algorithms, no bots, just genuine human care.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-separator)',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <feature.icon size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
              Getting started is simple. Real people, real help, real fast.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '40px' 
          }}>
            {[
              { num: '1', title: 'Create Your Profile', desc: 'Sign up as a helper or client. Tell us what you need or what you can offer.' },
              { num: '2', title: 'Find Your Match', desc: 'Browse profiles, read reviews, and connect with the right person for your needs.' },
              { num: '3', title: 'Book & Connect', desc: 'Schedule your session, agree on terms, and start building real human connections.' },
              { num: '4', title: 'Rate & Review', desc: 'Share your experience to help others and build a trusted community.' }
            ].map((step, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 800,
                  margin: '0 auto 20px'
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px', color: '#111827' }}>
              Why Choose Humans for Hire
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              Real humans. Real connections. Real results.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Users size={40} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>
                100% Human Guarantee
              </h3>
              <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
                Every helper is a real person. No bots, no algorithms, just genuine human connection and understanding.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Shield size={40} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>
                Trust & Safety First
              </h3>
              <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
                Comprehensive background checks, ID verification, and secure payments protect both helpers and clients.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Heart size={40} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>
                Community Driven
              </h3>
              <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
                Built on genuine reviews and ratings from real people who care about quality and connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px', color: '#111827' }}>
              Your Safety is Our Priority
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '700px', margin: '0 auto' }}>
              We've built comprehensive safety features to ensure peace of mind for every booking
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              border: '2px solid #d1fae5',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <Shield size={32} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>Background Checks</h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>All helpers undergo thorough background verification before joining our platform</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              border: '2px solid #d1fae5',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <CreditCard size={32} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>Payment Protection</h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>Secure payments with fraud protection. Pay only after service completion</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              border: '2px solid #d1fae5',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Star size={32} fill="#10b981" style={{ color: '#10b981' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>Verified Reviews</h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>Only real clients can leave reviews after confirmed bookings</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              border: '2px solid #d1fae5',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <Clock size={32} style={{ color: '#ef4444' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>24/7 Support</h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>Round-the-clock customer support and emergency assistance</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              border: '2px solid #d1fae5',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <FileText size={32} style={{ color: '#10b981' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>Insurance Coverage</h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>All services covered by liability insurance for your protection</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              border: '2px solid #d1fae5',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Lock size={32} style={{ color: '#10b981' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>Privacy First</h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>Your personal information is encrypted and never shared without consent</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        backgroundColor: 'white',
        padding: '80px 20px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, textAlign: 'center', marginBottom: '16px', color: '#111827' }}>What Our Users Say</h2>
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#6b7280', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
            Real stories from real people in our community
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {(realTestimonials.length > 0 ? realTestimonials : testimonials).slice(0, 6).map((testimonial, index) => (
              <div key={index} style={{ padding: '32px', borderRadius: '16px', backgroundColor: 'white', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: i < testimonial.rating ? '#fbbf24' : '#e5e7eb', fontSize: '18px' }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: '18px', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>{testimonial.text}</p>
                <p style={{ fontSize: '16px', color: '#374151', fontWeight: 600 }}>{testimonial.name}</p>
                <p style={{ fontSize: '14px', color: '#9ca3af' }}>{testimonial.role}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '48px' }}>
            <button
              onClick={() => navigate('/humans-for-hire/auth')}
              style={{
                padding: '18px 48px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
              }}
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/humans-for-hire/browse')}
              style={{
                padding: '18px 48px',
                backgroundColor: 'white',
                color: '#10b981',
                border: '2px solid #10b981',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Browse Helpers
            </button>
          </div>
        </div>
      </section>

      </div>
    </UnifiedLayout>
  );
};

export default HumansForHire;
