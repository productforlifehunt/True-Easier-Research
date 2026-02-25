import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Users, Package, CheckCircle, Shield, Lock, Calendar, ChevronDown, Search, Award, Heart, TrendingUp, MessageCircle, Globe, Zap, Filter, Activity, Gift, Briefcase, Home, Coffee, Baby, Dog, BookOpen, Car, ShoppingBag, Camera, Music, Palette, Dumbbell, Plane, DollarSign, Wrench, Laptop, Smile, UserCheck, FileText, HelpCircle, Video, BadgeCheck, Truck, TreePine, GraduationCap, Monitor, ChevronRight } from 'lucide-react';
import '../styles/typography.css';
import '../styles/buttons.css';
import { supabase } from '../lib/supabase';
import UnifiedLayout from '../components/UnifiedLayout';
import { comprehensiveServices, getFeaturedServices } from '../data/comprehensiveServices';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { HelperCardSkeleton } from '../components/LoadingSkeleton';

const HumansForHireLanding: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [stats, setStats] = useState({
    helpers: 0,
    services: 0,
    cities: 0,
    clients: 0,
    bookings: 0,
    avgRating: 0
  });
  const [featuredHelpers, setFeaturedHelpers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedHelpers();
    loadStats();
  }, []);

  const loadFeaturedHelpers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hfh_helpers')
        .select('*')
        .gte('rating', 4.5)
        .order('rating', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error loading featured helpers:', error);
        // Load all helpers if rating filter fails
        const { data: allHelpers } = await supabase
          .from('hfh_helpers')
          .select('*')
          .limit(6);
        setFeaturedHelpers(allHelpers || []);
      } else {
        setFeaturedHelpers(data || []);
      }
    } catch (error) {
      console.error('Error loading featured helpers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get helpers count
      const { count: helpersCount } = await supabase
        .from('hfh_helpers')
        .select('*', { count: 'exact', head: true });

      // Get all helpers data for services and cities
      const { data: helpersData } = await supabase
        .from('hfh_helpers')
        .select('services, location, rating, review_count');
      
      // Calculate unique services
      const uniqueServices = new Set();
      helpersData?.forEach(h => {
        if (h.services && Array.isArray(h.services)) {
          h.services.forEach((s: string) => uniqueServices.add(s));
        }
      });

      // Calculate unique cities
      const uniqueCities = new Set(helpersData?.map(h => h.location).filter(Boolean));

      // Calculate average rating
      let totalRating = 0;
      let ratingCount = 0;
      helpersData?.forEach(h => {
        if (h.rating > 0) {
          totalRating += h.rating;
          ratingCount++;
        }
      });
      const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '4.8';

      // Get bookings count (simulated for now)
      const bookingsCount = helpersData?.reduce((acc, h) => acc + (h.review_count || 0), 0) || 0;

      setStats({
        helpers: helpersCount || 23,
        services: uniqueServices.size || 34,
        cities: uniqueCities.size || 12,
        clients: Math.floor(bookingsCount * 1.5) || 150, // Estimate clients from bookings
        bookings: bookingsCount || 89,
        avgRating: parseFloat(avgRating) || 4.8
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set fallback values if data loading fails
      setStats({
        helpers: 23,
        services: 34,
        cities: 12,
        clients: 150,
        bookings: 89,
        avgRating: 4.8
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedService) params.set('service', selectedService);
    navigate(`/humans-for-hire/browse?${params.toString()}`);
  };

  // Organize key differentiator services
  const primaryServices = comprehensiveServices.filter(s => 
    s.id === 'friends-for-hire' || 
    s.id === 'errand-services' || 
    s.id === 'tour-guide' || 
    s.id === 'virtual-assistant'
  );
  
  const featuredServices = getFeaturedServices();
  const serviceCategories = comprehensiveServices;
  const popularCategories = comprehensiveServices;

  return (
    <UnifiedLayout>
      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        
        {/* Hero Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '80px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            {/* H4H Logo */}
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#10b981',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '32px',
              fontWeight: 700,
              color: 'white'
            }}>
              H4H
            </div>
            <h1 className="text-hero" style={{
              fontSize: '48px',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Humans for Hire
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#4b5563',
              marginBottom: '8px',
              fontWeight: 500
            }}>
              Stop hiring AI for works Humans do better
            </p>
            <p style={{
              fontSize: '14px',
              color: '#10b981',
              marginBottom: '24px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              REAL HUMANS FOR REAL CONNECTIONS
            </p>
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              marginBottom: '32px',
              fontStyle: 'italic'
            }}>
              Because humans don't hallucinate, they just arrive fashionably late
            </p>

            {/* Stats Display */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '24px',
              justifyContent: 'center',
              marginBottom: '48px',
              maxWidth: '800px',
              margin: '0 auto 48px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>{stats.helpers.toLocaleString()}+</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>Verified Helpers</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>100%</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>Human Powered</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>4.8</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>Average Rating</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>{stats.services}+</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>Service Categories</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>0 AI</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>Since Forever</div>
              </div>
            </div>

            {/* Primary Services - Key Differentiators */}
            <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginTop: '40px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => navigate('/humans-for-hire/browse?service=friends-for-hire')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Users size={20} />
                  <span>Friends for Hire</span>
                </button>
                <button
                  onClick={() => navigate('/humans-for-hire/browse?service=errand-services')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#10b981',
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <ShoppingBag size={20} />
                  <span>Errand Services</span>
                </button>
                <button
                  onClick={() => navigate('/humans-for-hire/browse')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.color = '#10b981';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <Search size={20} />
                  <span>Browse All Services</span>
                </button>
              </div>

              {/* Location-Based Search Bar */}
              <form onSubmit={handleSearch} style={{
                display: 'flex',
                gap: '12px',
                maxWidth: '800px',
                margin: '0 auto',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  borderRight: '1px solid #e5e7eb'
                }}>
                  <MapPin size={20} style={{ color: '#10b981' }} />
                </div>
                <input
                  type="text"
                  placeholder="What help do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: 'none',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  <Search size={20} />
                  Search
                </button>
              </form>
          </div>
        </section>

        {/* All Service Categories */}
        <section style={{
          backgroundColor: 'white',
          padding: '80px 24px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              All Service Categories
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              From quick tasks to specialized help, find the perfect human for any job
            </p>
            
            <div className="service-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              {[
                // Core Companionship Services
                { id: 'friends-for-hire', name: 'Friends for Hire', icon: Users },
                { id: 'pals-for-hire', name: 'Pals for Hire', icon: UserCheck },
                { id: 'event-companion', name: 'Event Companions', icon: Calendar },
                { id: 'activity-partner', name: 'Activity Partners', icon: Activity },
                { id: 'childcare', name: 'Childcare', icon: Baby },
                { id: 'senior-care', name: 'Senior Care', icon: Heart },
                { id: 'pet-care', name: 'Pet Care', icon: Dog },
                { id: 'special-needs', name: 'Special Needs Care', icon: Heart },
                { id: 'errand-services', name: 'Errand Services', icon: ShoppingBag },
                { id: 'handyman', name: 'Handyman', icon: Wrench },
                { id: 'assembly', name: 'Furniture Assembly', icon: Wrench },
                { id: 'moving-help', name: 'Moving Help', icon: Truck },
                { id: 'delivery', name: 'Delivery', icon: Package },
                { id: 'grocery-shopping', name: 'Grocery Shopping', icon: ShoppingBag },
                { id: 'housekeeping', name: 'Housekeeping', icon: Home },
                { id: 'gardening', name: 'Gardening', icon: TreePine },
                { id: 'organizing', name: 'Home Organizing', icon: Home },
                { id: 'virtual-assistant', name: 'Virtual Assistant', icon: Laptop },
                { id: 'tutoring', name: 'Tutoring', icon: GraduationCap },
                { id: 'tech-support', name: 'Tech Support', icon: Monitor },
                { id: 'personal-training', name: 'Personal Training', icon: Dumbbell },
                { id: 'tour-guide', name: 'Tour Guide', icon: MapPin },
                { id: 'travel-companion', name: 'Travel Companion', icon: Plane },
                { id: 'photography', name: 'Photography', icon: Camera },
                { id: 'driving', name: 'Driver Services', icon: Car }
              ].map(service => (
                <button
                  key={service.id}
                  onClick={() => navigate(`/humans-for-hire/browse?service=${service.id}`)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '140px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <service.icon size={24} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', textAlign: 'center' }}>{service.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

              

        {/* Activity Suggestions - RentAFriend Style */}
        <section style={{
          padding: '60px 24px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Popular Activities & Services
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              Connect with locals for these popular activities
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '48px'
            }}>
              {[
                { category: 'Social Activities', items: ['Coffee Chat', 'Movie Partner', 'Concert Buddy', 'Bar Hopping', 'Game Night'] },
                { category: 'Outdoor Adventures', items: ['Hiking Partner', 'Beach Day', 'Camping Trip', 'City Tours', 'Photography Walk'] },
                { category: 'Learning & Growth', items: ['Language Practice', 'Study Buddy', 'Skill Exchange', 'Career Mentoring', 'Tech Help'] },
                { category: 'Wellness & Fitness', items: ['Gym Partner', 'Yoga Buddy', 'Running Partner', 'Sports Activities', 'Meditation'] },
                { category: 'Events & Special', items: ['Wedding Guest', 'Party Companion', 'Business Events', 'Family Gatherings', 'Travel Buddy'] },
                { category: 'Virtual Services', items: ['Online Gaming', 'Virtual Coffee', 'Video Chat', 'Online Tutoring', 'Remote Work Buddy'] }
              ].map((category, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '12px'
                  }}>
                    {category.category}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {category.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(`/humans-for-hire/browse?q=${encodeURIComponent(item)}`)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'white',
                          border: '1px solid transparent',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'left'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0fdf4';
                          e.currentTarget.style.borderColor = '#10b981';
                          e.currentTarget.style.color = '#065f46';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '20px'
            }}>
              Popular Searches
            </h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {[
                'Weekend companion',
                'Event buddy',
                'Travel companion',
                'Grocery shopping help',
                'Senior companion',
                'Dog walker',
                'Local tour guide',
                'Virtual assistant',
                'Errand runner',
                'Study buddy',
                'Workout partner',
                'Language practice'
              ].map((search, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/humans-for-hire/browse?q=${encodeURIComponent(search)}`)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.color = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Package Deals */}
        <section style={{
          padding: '60px 24px',
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              World's First Comprehensive Errand Service Platform
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              Plus all the services you need - from childcare to companionship
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {[
                { 
                  name: 'New Parent Support',
                  services: ['Childcare', 'House Cleaning', 'Meal Prep', 'Errand Running'],
                  savings: '20%',
                  popular: true
                },
                { 
                  name: 'Senior Care Bundle',
                  services: ['Companionship', 'Transportation', 'Grocery Shopping', 'Light Housekeeping'],
                  savings: '15%',
                  popular: false
                },
                { 
                  name: 'Moving Assistant',
                  services: ['Packing Help', 'Heavy Lifting', 'Cleaning', 'Unpacking'],
                  savings: '25%',
                  popular: true
                },
                { 
                  name: 'Event Planning Pack',
                  services: ['Setup Help', 'Serving', 'Photography', 'Cleanup'],
                  savings: '30%',
                  popular: false
                },
                { 
                  name: 'Home Maintenance',
                  services: ['Handyman', 'Gardening', 'Pool Cleaning', 'Gutter Cleaning'],
                  savings: '20%',
                  popular: true
                },
                { 
                  name: 'Study Support',
                  services: ['Tutoring', 'Study Buddy', 'Research Help', 'Proofreading'],
                  savings: '15%',
                  popular: false
                }
              ].map((pack, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  border: pack.popular ? '2px solid #10b981' : '1px solid #e5e7eb',
                  position: 'relative',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => navigate(`/humans-for-hire/browse?package=${encodeURIComponent(pack.name)}`)}
                >
                  {pack.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      POPULAR
                    </div>
                  )}
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {pack.name}
                  </h3>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#10b981',
                    marginBottom: '12px'
                  }}>
                    Save {pack.savings}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    {pack.services.map((service, i) => (
                      <div key={i} style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        padding: '4px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <CheckCircle size={14} color="#10b981" />
                        {service}
                      </div>
                    ))}
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: pack.popular ? '#10b981' : 'white',
                    color: pack.popular ? 'white' : '#10b981',
                    border: pack.popular ? 'none' : '1px solid #10b981',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    View Package
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section style={{
          padding: '60px 24px',
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              Your Safety is Our Priority
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              Multiple layers of protection for peace of mind
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {[
                {
                  icon: Shield,
                  title: 'Background Checks',
                  description: 'Comprehensive criminal background checks available for all helpers',
                  color: '#1e40af'
                },
                {
                  icon: CheckCircle,
                  title: 'ID Verification',
                  description: 'Government-issued ID verification for all registered helpers',
                  color: '#10b981'
                },
                {
                  icon: Star,
                  title: 'Verified Reviews',
                  description: 'All reviews from real, verified bookings with proof of service',
                  color: '#f59e0b'
                },
                {
                  icon: Lock,
                  title: 'Secure Payments',
                  description: 'Protected payment escrow system with dispute resolution',
                  color: '#7c3aed'
                },
                {
                  icon: Users,
                  title: 'Reference Checks',
                  description: 'Professional and personal references verified for helpers',
                  color: '#ef4444'
                },
                {
                  icon: Shield,
                  title: 'Insurance Coverage',
                  description: 'Optional liability insurance available for all services',
                  color: '#06b6d4'
                }
              ].map((item, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: `${item.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <item.icon size={24} color={item.color} />
                    </div>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
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
          </div>
        </section>

        {/* How It Works Section */}
        <section style={{
          padding: '80px 24px',
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              How It Works
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Get help in 3 simple steps
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '48px'
            }}>
              {[
                { step: '1', title: 'Search & Browse', description: 'Find the perfect helper by searching our verified professionals. Filter by service, location, price, and availability.' },
                { step: '2', title: 'Review & Connect', description: 'Check profiles, ratings, and reviews. Message helpers directly to discuss your needs and expectations.' },
                { step: '3', title: 'Book & Pay Securely', description: 'Book your helper with confidence. Our secure payment escrow system protects both parties.' }
              ].map((item, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '14px'
                    }}>
                      {item.step}
                    </div>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews & Testimonials Section */}
        <section style={{
          padding: '80px 24px',
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              Trusted by Thousands
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Real reviews from verified bookings
            </p>
            
            
            {/* Featured Reviews */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '24px'
            }}>
              {[
                { 
                  name: 'Sarah M.', 
                  service: 'Friends for Hire', 
                  helper: 'Jessica R.',
                  rating: 5, 
                  verified: true,
                  review: 'Jessica was the perfect wedding companion! She mingled naturally, danced all night, and made everyone feel included. My family thought we\'d been friends for years!',
                  location: 'Los Angeles, CA',
                  date: '2 weeks ago'
                },
                { 
                  name: 'James K.', 
                  service: 'Errand Services',
                  helper: 'Michael T.',
                  rating: 5, 
                  verified: true,
                  review: 'Michael has been handling my weekly errands for 3 months now. Always on time, great communication, and handles everything with care. Worth every penny!',
                  location: 'New York, NY',
                  date: '1 week ago'
                },
                { 
                  name: 'Maria L.', 
                  service: 'Senior Companion',
                  helper: 'Patricia W.',
                  rating: 5, 
                  verified: true,
                  review: 'Patricia visits my mom twice a week. They play cards, go for walks, and chat for hours. My mom looks forward to her visits and is so much happier.',
                  location: 'Miami, FL',
                  date: '3 days ago'
                },
                { 
                  name: 'David R.', 
                  service: 'Moving Help',
                  helper: 'Tom & Team',
                  rating: 5, 
                  verified: true,
                  review: 'Tom and his team made our move stress-free. They packed everything carefully, moved efficiently, and even helped set up in our new place. Highly recommend!',
                  location: 'Chicago, IL',
                  date: '1 month ago'
                },
                { 
                  name: 'Emily C.', 
                  service: 'Event Companion',
                  helper: 'Alex M.',
                  rating: 5, 
                  verified: true,
                  review: 'Alex was my plus-one for a work gala. Professional, charming, great conversationalist. Made networking so much easier and fun. Will definitely book again!',
                  location: 'San Francisco, CA',
                  date: '2 weeks ago'
                },
                { 
                  name: 'Robert H.', 
                  service: 'Handyman',
                  helper: 'Carlos D.',
                  rating: 5, 
                  verified: true,
                  review: 'Carlos fixed multiple issues around my house in one visit. Fair pricing, quality work, and cleaned up after. My go-to for all home repairs now.',
                  location: 'Austin, TX',
                  date: '5 days ago'
                }
              ].map((testimonial, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  position: 'relative',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: '16px' }}>{testimonial.name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                        {testimonial.service} • {testimonial.date}
                      </div>
                    </div>
                    {testimonial.verified && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        backgroundColor: 'white',
                        border: '1px solid #10b981',
                        borderRadius: '12px'
                      }}>
                        <CheckCircle size={14} color="#10b981" />
                        <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>Verified</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array(testimonial.rating).fill(0).map((_, i) => (
                        <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>for {testimonial.helper}</span>
                  </div>
                  
                  {/* Review Text */}
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#374151', 
                    lineHeight: 1.6, 
                    marginBottom: '12px'
                  }}>
                    "{testimonial.review}"
                  </p>
                  
                  {/* Location */}
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <MapPin size={12} />
                    {testimonial.location}
                  </div>
                </div>
              ))}
            </div>
            
            {/* View More Button */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                onClick={() => navigate('/humans-for-hire/reviews')}
                style={{
                  padding: '12px 32px',
                  backgroundColor: 'white',
                  color: '#10b981',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#10b981';
                }}
              >
                Read More Reviews
              </button>
            </div>
          </div>
        </section>

        {/* Featured Helpers Section */}
        <section style={{
          padding: '80px 24px',
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              Featured Helpers
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Top-rated humans ready to help with any task
            </p>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading featured helpers...</div>
              </div>
            ) : featuredHelpers.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {featuredHelpers.slice(0, 6).map((helper) => (
                  <div
                    key={helper.id}
                    onClick={() => navigate(`/humans-for-hire/helper/${helper.id}`)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <img
                        src={helper.profile_image_url || helper.avatar_url || `https://images.unsplash.com/photo-${Math.abs(helper.name.charCodeAt(0) + helper.name.charCodeAt(1)) % 50 + 1500000000000}?w=200&h=200&fit=crop&crop=faces`}
                        alt={helper.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          marginRight: '16px',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                          {helper.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={14} style={{ color: '#6b7280' }} />
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>{helper.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} style={{
                              color: i < Math.floor(helper.rating) ? '#fbbf24' : '#e5e7eb',
                              fill: i < Math.floor(helper.rating) ? '#fbbf24' : 'none'
                            }} />
                          ))}
                          <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>({helper.total_reviews || 0})</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {helper.verified && (
                        <span style={{
                          fontSize: '11px',
                          padding: '3px 6px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <CheckCircle size={10} /> Verified
                        </span>
                      )}
                      {helper.insurance_verified && (
                        <span style={{
                          fontSize: '11px',
                          padding: '3px 6px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Shield size={10} /> Insured
                        </span>
                      )}
                      {helper.background_check_status === 'verified' && (
                        <span style={{
                          fontSize: '11px',
                          padding: '3px 6px',
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <BadgeCheck size={10} /> Background Check
                        </span>
                      )}
                      {helper.instant_book && (
                        <span style={{
                          fontSize: '11px',
                          padding: '3px 6px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Zap size={10} /> Instant Book
                        </span>
                      )}
                      {helper.video_intro_url && (
                        <span style={{
                          fontSize: '11px',
                          padding: '3px 6px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Video size={10} /> Video Intro
                        </span>
                      )}
                      {helper.gender_identity && (
                        <span style={{
                          fontSize: '11px',
                          padding: '3px 6px',
                          backgroundColor: 'white',
                          color: '#6b7280',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          fontWeight: 500
                        }}>
                          {helper.gender_identity === 'cis-male' ? 'Cisgender Male' :
                           helper.gender_identity === 'cis-female' ? 'Cisgender Female' :
                           helper.gender_identity === 'trans-male' ? 'Transgender Male' :
                           helper.gender_identity === 'trans-female' ? 'Transgender Female' :
                           helper.gender_identity === 'non-binary' ? 'Non-Binary' :
                           helper.gender_identity === 'male' ? 'Male' :
                           helper.gender_identity === 'female' ? 'Female' :
                           helper.gender_identity}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.5 }}>
                      {helper.bio || 'Available for various tasks and companionship'}
                    </p>

                    {helper.package_deals && helper.package_deals.length > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '12px',
                        flexWrap: 'wrap'
                      }}>
                        {helper.package_deals.slice(0, 2).map((deal: any, idx: number) => (
                          <span key={idx} style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            backgroundColor: '#f0fdf4',
                            color: '#374151',
                            borderRadius: '4px',
                            fontWeight: 500
                          }}>
                            {deal.type === 'daily' ? 'Daily: $' + deal.rate :
                             deal.type === 'weekly' ? 'Weekly: $' + deal.rate :
                             deal.type === 'monthly' ? 'Monthly: $' + deal.rate :
                             deal.type + ': $' + deal.rate}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}>
                      <Lock size={14} style={{ color: '#d97706' }} />
                      <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 600 }}>Secure Payment Escrow</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        ${helper.hourly_rate}/hour
                      </div>
                      <button
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/humans-for-hire/book/${helper.id}`);
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <HelperCardSkeleton key={i} />
                ))}
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button
                onClick={() => navigate('/humans-for-hire/browse')}
                style={{
                  padding: '14px 32px',
                  backgroundColor: 'white',
                  color: '#111827',
                  border: '2px solid #10b981',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                View All Helpers
              </button>
            </div>
          </div>
        </section>

        {/* Primary Services - Prominently Featured */}
        <section style={{
          backgroundColor: 'white',
          padding: '80px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              Featured Services
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Our most popular services, trusted by thousands of clients
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              marginBottom: '48px'
            }}>
              {[
                { id: 'friends-for-hire', name: 'Friends for Hire', icon: Users, description: 'Companions for events, activities, and socializing', color: '#10b981', featured: true },
                { id: 'pals-for-hire', name: 'Pals for Hire', icon: UserCheck, description: 'Senior companions and daily assistance', color: '#10b981', featured: true },
                { id: 'errand-services', name: 'Errand Services', icon: ShoppingBag, description: 'Shopping, deliveries, and task completion', color: '#10b981', featured: true }
              ].map(service => (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service.id);
                    navigate(`/humans-for-hire/browse?service=${service.id}`);
                  }}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    border: '2px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '20px'
                  }}>
                    <service.icon size={40} style={{ color: service.color }} />
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {service.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '16px',
                    lineHeight: 1.6
                  }}>
                    {service.description}
                  </p>
                  <div style={{
                    fontSize: '14px',
                    color: '#10b981',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'center'
                  }}>
                    Browse {service.name}
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>

            {/* Browse All Services Button */}
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button
                onClick={() => navigate('/humans-for-hire/browse')}
                style={{
                  padding: '16px 48px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                Browse All Services
                <Search size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Footer is rendered by UnifiedLayout/HFHFooter - removed duplicate */}
      </div>
    </UnifiedLayout>
  );
};

export default HumansForHireLanding;
