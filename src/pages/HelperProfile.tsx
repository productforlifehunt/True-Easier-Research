import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, DollarSign, Clock, Shield, Calendar, ArrowLeft, MessageSquare, Heart, CheckCircle, Award, Globe, RefreshCw, Tag, Video, Zap, BadgeCheck, Users, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import UnifiedLayout from '../components/UnifiedLayout';
import BookingModal from '../components/BookingModal';
import PriceNegotiationModal from '../components/PriceNegotiationModal';
import RecurringBookingSetup from '../components/RecurringBookingSetup';

const HelperProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [helper, setHelper] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Get helper profile - using UUID string
      const { data: helperData, error: helperError } = await supabase
        .from('hfh_helpers')
        .select('*')
        .eq('id', id)
        .single();
      
      
      if (helperError) {
        console.error('Helper query error:', helperError);
        // For demo, load a default helper if specific one not found
        const { data: anyHelper } = await supabase
          .from('hfh_helpers')
          .select('*')
          .limit(1)
          .single();
        
        if (anyHelper) {
          setHelper(anyHelper);
        }
      } else {
        setHelper(helperData);
      }
      
      // Get reviews for this helper
      const { data: reviewsData } = await supabase
        .from('hfh_reviews')
        .select('*')
        .eq('helper_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setReviews(reviewsData || []);
      
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleBookNow = () => {
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!helper) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Helper not found</p>
      </div>
    );
  }

  return (
    <UnifiedLayout>
      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 0' }}>
          <button
            onClick={() => navigate('/humans-for-hire/browse')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              color: '#374151',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <ArrowLeft size={18} />
            Back to Search
          </button>
        </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
          {/* Main Content */}
          <div>
            {/* Profile Header */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '24px',
              border: '1px solid var(--border-separator)'
            }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 700,
                  color: '#2c5f2d'
                }}>
                  {helper.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                    {helper.name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={18} />
                      <span>{helper.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={18} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontWeight: 600 }}>{helper.rating.toFixed(1)}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        ({helper.total_reviews} reviews)
                      </span>
                    </div>
                  </div>
                  {helper.verified && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #10b981',
                      borderRadius: '20px',
                      color: '#10b981'
                    }}>
                      <Shield size={16} />
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>About</h2>
              <p style={{ lineHeight: 1.8, color: '#6b7280', fontSize: '16px', marginBottom: '24px' }}>
                {helper.bio || 'No bio available'}
              </p>
              
              {/* Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px', marginBottom: '24px' }}>
                {helper.verified && (
                  <span style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle size={14} /> Verified
                  </span>
                )}
                {helper.background_check_status === 'verified' && (
                  <span style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <BadgeCheck size={14} /> Background Checked
                  </span>
                )}
                {helper.instant_book && (
                  <span style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Zap size={14} /> Instant Book
                  </span>
                )}
                {helper.video_intro_url && (
                  <span style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    backgroundColor: '#ec4899',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Video size={14} /> Video Introduction
                  </span>
                )}
                {helper.insurance_verified && (
                  <span style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Shield size={14} /> Insured
                  </span>
                )}
                {helper.gender_identity && (
                  <span style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontWeight: 500
                  }}>
                    {helper.gender_identity === 'cis-male' ? 'Cisgender Male' :
                     helper.gender_identity === 'cis-female' ? 'Cisgender Female' :
                     helper.gender_identity === 'trans-male' ? 'Transgender Male' :
                     helper.gender_identity === 'trans-female' ? 'Transgender Female' :
                     helper.gender_identity === 'non-binary' ? 'Non-Binary' :
                     helper.gender_identity}
                  </span>
                )}
              </div>

              {/* Video Introduction */}
              {helper.video_intro_url && (
                <div style={{ marginBottom: '24px' }}>
                  <iframe
                    width="100%"
                    height="300"
                    src={helper.video_intro_url}
                    title="Video Introduction"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '12px' }}
                  />
                </div>
              )}
              
              {/* Key Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {helper.years_experience && helper.years_experience > 0 && (
                  <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Experience</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{helper.years_experience}+ years</div>
                  </div>
                )}
                {helper.response_time_hours && (
                  <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Response Time</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>~{helper.response_time_hours} hours</div>
                  </div>
                )}
                <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Response Rate</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{helper.response_rate || 95}%</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Acceptance Rate</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{helper.acceptance_rate || 90}%</div>
                </div>
                {helper.languages && (
                  <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Languages</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                      {Array.isArray(helper.languages) ? helper.languages.join(', ') : 'English'}
                    </div>
                  </div>
                )}
                {helper.total_reviews && helper.total_reviews > 0 && (
                  <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Reviews</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{helper.total_reviews}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Services & Packages */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '24px',
              border: '1px solid var(--border-separator)'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Services & Packages</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                {helper.services?.map((service, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '20px',
                      color: '#374151',
                      fontWeight: 500
                    }}
                  >
                    {service}
                  </span>
                )) || <p style={{ color: 'var(--text-secondary)' }}>No services listed</p>}
              </div>
              
              {/* Service Packages */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>Popular Packages</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { name: 'Quick Help', duration: '1 hour', price: helper.hourly_rate, description: 'Perfect for small tasks and quick errands' },
                    { name: 'Half Day', duration: '4 hours', price: helper.hourly_rate * 3.5, description: 'Great for shopping trips, events, or multiple tasks', savings: '12.5% off' },
                    { name: 'Full Day', duration: '8 hours', price: helper.hourly_rate * 6.5, description: 'Comprehensive assistance for all-day activities', savings: '18.75% off' },
                    { name: 'Weekly Bundle', duration: '20 hours/week', price: helper.hourly_rate * 15, description: 'Regular weekly support at discounted rate', savings: '25% off' }
                  ].map((pkg, idx) => (
                    <div key={idx} style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: idx === 1 ? '2px solid #10b981' : '1px solid #e5e7eb',
                      position: 'relative'
                    }}>
                      {idx === 1 && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 12px',
                          borderRadius: '12px'
                        }}>
                          Most Popular
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{pkg.name}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{pkg.duration}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>${pkg.price}</div>
                          {pkg.savings && (
                            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>{pkg.savings}</div>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{pkg.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Certifications & Verification */}
            {(helper.certifications && helper.certifications.length > 0) || helper.background_check_status === 'completed' ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: '#111827' }}>Certifications & Verification</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                  {helper.background_check_status === 'completed' && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '2px solid #10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 700
                      }}>✓</div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#065f46', marginBottom: '2px' }}>Background Check</div>
                        <div style={{ fontSize: '13px', color: '#059669' }}>Verified & Passed</div>
                      </div>
                    </div>
                  )}
                  {helper.certifications?.map((cert, idx) => (
                    <div key={idx} style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px'
                      }}>
                        <Award size={20} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>{cert}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Portfolio / Work Samples */}
            {
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: '#111827' }}>Portfolio</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {[
                    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
                    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 
                    'https://images.unsplash.com/photo-1559893088-c0787ebfc084?w=400',
                    'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=400'
                  ].map((img, idx) => (
                    <div key={idx} style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <img
                        src={img}
                        alt={`Portfolio ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            }

            {/* Availability Calendar */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: '#111827' }}>
                <Calendar size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Availability
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', padding: '8px' }}>
                    {day}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 5 + 1;
                  const isWeekend = (i % 7 === 0 || i % 7 === 6);
                  const isAvailable = dayNum > 0 && dayNum <= 31 && !isWeekend;
                  const isPast = dayNum <= new Date().getDate() && dayNum > 0;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: dayNum <= 0 ? 'transparent' : isAvailable && !isPast ? '#ecfdf5' : isPast ? '#f9fafb' : 'white',
                        border: dayNum <= 0 ? 'none' : isAvailable && !isPast ? '1px solid #10b981' : '1px solid #e5e7eb',
                        color: dayNum <= 0 ? 'transparent' : isPast ? '#d1d5db' : isAvailable ? '#059669' : '#9ca3af',
                        cursor: isAvailable && !isPast && dayNum > 0 ? 'pointer' : 'default',
                        fontWeight: isAvailable && !isPast ? 600 : 400,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (isAvailable && !isPast && dayNum > 0) {
                          e.currentTarget.style.backgroundColor = '#10b981';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isAvailable && !isPast && dayNum > 0) {
                          e.currentTarget.style.backgroundColor = '#ecfdf5';
                          e.currentTarget.style.color = '#059669';
                        }
                      }}
                    >
                      {dayNum > 0 ? dayNum : ''}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '4px' }} />
                  Available
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }} />
                  Unavailable
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              border: '1px solid var(--border-separator)'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No reviews yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map(review => (
                    <div
                      key={review.id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid #f3f4f6',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={16}
                              fill={star <= review.rating ? '#10b981' : '#e5e7eb'}
                              color={star <= review.rating ? '#10b981' : '#e5e7eb'}
                            />
                          ))}
                        </div>
                        <span style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                          {review.hfh_clients?.name || review.client_name || 'Client'}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ color: '#4b5563', lineHeight: 1.6, fontSize: '14px' }}>
                        {review.review_text || review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              position: 'sticky',
              top: '20px'
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 700,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#111827'
              }}>
                <DollarSign size={32} color="#10b981" />
                ${helper.hourly_rate || 'N/A'}/hr
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Plus applicable fees</p>

              <button
                onClick={handleBookNow}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '12px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                <Calendar size={20} />
                Book Now
              </button>

              <button
                onClick={() => navigate('/humans-for-hire/messages')}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '12px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#10b981';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <MessageSquare size={20} />
                Send Message
              </button>

              <button
                onClick={() => setShowPriceModal(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  color: '#10b981',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Tag size={20} />
                Make Offer
              </button>

              <button
                onClick={() => setShowRecurringModal(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  color: '#10b981',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={20} />
                Recurring Booking
              </button>

              <button
                onClick={toggleFavorite}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Heart size={20} fill={isFavorite ? '#10b981' : 'none'} color={isFavorite ? '#10b981' : '#6b7280'} />
                {isFavorite ? 'Saved' : 'Save'}
              </button>

              {/* Cancellation Policy */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>Cancellation Policy</h3>
                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                  <p style={{ marginBottom: '8px' }}>• Free cancellation up to 24 hours before booking</p>
                  <p style={{ marginBottom: '8px' }}>• 50% refund if cancelled 12-24 hours before</p>
                  <p>• No refund for cancellations within 12 hours</p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Clock size={16} color="#10b981" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>Quick Response</span>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Usually responds within {helper.response_time_hours || 2} hours</p>
              </div>

              {helper.instant_book && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>Instant Book</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>No waiting for approval</p>
                </div>
              )}

              {helper.background_check_status === 'approved' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Shield size={16} color="#10b981" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Background Checked</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Verified & cleared</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && helper && (
        <BookingModal
          helper={helper}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            navigate('/humans-for-hire/browse');
          }}
        />
      )}

      {/* Price Negotiation Modal */}
      {showPriceModal && helper && (
        <PriceNegotiationModal
          isOpen={showPriceModal}
          onClose={() => setShowPriceModal(false)}
          helper={{
            id: helper.id,
            name: helper.name,
            hourly_rate: helper.hourly_rate,
            profile_image_url: helper.profile_image_url,
            accepts_offers: true
          }}
          service={helper.services?.[0] || 'General Services'}
          onOfferSent={() => {
            toast.success('Offer sent successfully!');
            setShowPriceModal(false);
          }}
        />
      )}

      {/* Recurring Booking Modal */}
      {showRecurringModal && helper && (
        <RecurringBookingSetup
          isOpen={showRecurringModal}
          onClose={() => setShowRecurringModal(false)}
          helperId={helper.id}
          helperName={helper.name}
          hourlyRate={helper.hourly_rate}
          onScheduleCreated={() => {
            toast.success('Recurring schedule created!');
            setShowRecurringModal(false);
          }}
        />
      )}
    </UnifiedLayout>
  );
};

export default HelperProfile;
