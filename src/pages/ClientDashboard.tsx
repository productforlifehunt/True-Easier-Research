import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient, supabase } from '../lib/supabase';
import { Calendar, Search, Star, Clock, MessageSquare, Settings, LogOut, Plus, Heart, MapPin, DollarSign, FileText, Edit2 } from 'lucide-react';
import MessagingSystem from '../components/MessagingSystem';
import { getBookingsByClient, Client, getFavoriteHelpers } from '../lib/humansForHireService';
import toast from 'react-hot-toast';
import UnifiedLayout from '../components/UnifiedLayout';
import ProfileEditModal from '../components/ProfileEditModal';
import NotificationCenter from '../components/NotificationCenter';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'bookings' | 'favorites' | 'messages'>('bookings');
  const [bookingTab, setBookingTab] = useState<'upcoming' | 'pending' | 'completed'>('upcoming');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user: currentUser } } = await authClient.auth.getUser();
      if (!currentUser) {
        // Create a demo client for testing
        setUser({ id: 'demo-client', email: 'demo@example.com' });
        setClientProfile({
          id: 'demo-client-profile',
          user_id: 'demo-client',
          name: 'Demo Client',
          email: 'demo@example.com',
          created_at: new Date().toISOString()
        } as Client);
        setLoading(false);
        return;
      }
      setUser(currentUser);

      // Get client profile
      let { data: profile, error: profileError } = await supabase
        .from('hfh_clients')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (profileError || !profile) {
        // Create a client profile for the user
        const { data: newProfile, error: createError } = await supabase
          .from('hfh_clients')
          .insert([{
            user_id: currentUser.id,
            name: currentUser.email?.split('@')[0] || 'Client',
            email: currentUser.email
          }])
          .select()
          .single();

        if (createError || !newProfile) {
          toast.error('Unable to access client dashboard');
          navigate('/humans-for-hire');
          return;
        }
        
        setClientProfile(newProfile);
        profile = newProfile;
      } else {
        setClientProfile(profile);
      }


      // Get bookings
      const bookingsData = await getBookingsByClient(profile.id);
      setBookings(bookingsData);

      // Get favorites
      const favoritesData = await getFavoriteHelpers(profile.id);
      setFavorites(favoritesData);

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authClient.auth.signOut();
    navigate('/humans-for-hire');
  };

  const filteredBookings = bookings.filter(b => {
    if (bookingTab === 'upcoming') {
      return b.status === 'confirmed' && new Date(b.scheduled_date) >= new Date();
    }
    if (bookingTab === 'pending') {
      return b.status === 'pending';
    }
    return b.status === 'completed';
  });

  if (loading) {
    return (
      <UnifiedLayout>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading dashboard...</p>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '24px' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid var(--border-separator)',
        padding: '16px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                My Dashboard
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Welcome back, {clientProfile?.name}!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <NotificationCenter userId={user?.id || 'demo-client'} userType="client" />
              <button
                onClick={() => navigate('/humans-for-hire/browse')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Search size={18} />
                Find Helpers
              </button>
              <button
                onClick={() => navigate('/humans-for-hire/client/profile')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  border: '1px solid var(--border-separator)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Settings size={18} />
                Settings
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  border: '1px solid var(--border-separator)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Recent Activity Feed */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid var(--border-separator)',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { type: 'booking', text: 'Booking confirmed with Sarah T.', time: '2 hours ago', icon: Calendar, color: '#10b981' },
              { type: 'message', text: 'New message from Michael C.', time: '5 hours ago', icon: MessageSquare, color: '#3b82f6' },
              { type: 'review', text: 'Helper reviewed your booking', time: '1 day ago', icon: Star, color: '#f59e0b' },
              { type: 'saved', text: 'You saved 3 new helpers', time: '2 days ago', icon: Heart, color: '#ef4444' }
            ].map((activity, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: `${activity.color}10`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <activity.icon size={20} color={activity.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{activity.text}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div
            onClick={() => navigate('/humans-for-hire/browse')}
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-separator)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            <Calendar size={32} color="#10b981" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Upcoming Bookings</h3>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>
              {bookings.filter(b => b.status === 'confirmed' && new Date(b.scheduled_date) >= new Date()).length}
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-separator)'
            }}
          >
            <Star size={32} color="#10b981" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Completed Services</h3>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>
              {bookings.filter(b => b.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Bookings Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid var(--border-separator)',
          overflow: 'hidden'
        }}>
          <div style={{
            borderBottom: '1px solid var(--border-separator)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '2px solid #f3f4f6' }}>
              {[{id: 'bookings', label: 'My Bookings', icon: Calendar}, {id: 'favorites', label: 'Saved Helpers', icon: Heart}, {id: 'messages', label: 'Messages', icon: MessageSquare}].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  style={{
                    padding: '12px 0',
                    backgroundColor: 'transparent',
                    color: selectedTab === tab.id ? '#10b981' : '#6b7280',
                    border: 'none',
                    borderBottom: selectedTab === tab.id ? '2px solid #10b981' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: selectedTab === tab.id ? 600 : 500,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    marginBottom: '-2px'
                  }}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
            
            {selectedTab === 'bookings' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Bookings</h3>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  {['upcoming', 'pending', 'completed'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setBookingTab(tab as any)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: bookingTab === tab ? '#10b981' : 'white',
                        color: bookingTab === tab ? 'white' : 'var(--text-primary)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '20px' }}>
            {selectedTab === 'bookings' && filteredBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  No {bookingTab} bookings
                </p>
                {bookingTab === 'upcoming' && (
                  <button
                    onClick={() => navigate('/humans-for-hire/browse')}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={18} />
                    Book a Helper
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredBookings.map(booking => (
                  <div
                    key={booking.id}
                    style={{
                      padding: '20px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid var(--border-separator)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
                            {booking.service_type}
                          </h3>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: 'white',
                            border: '1px solid ' + (booking.status === 'confirmed' ? '#10b981' : booking.status === 'pending' ? '#f59e0b' : '#10b981'),
                            color: booking.status === 'confirmed' ? '#065f46' : booking.status === 'pending' ? '#92400e' : '#065f46'
                          }}>
                            {booking.status === 'pending' ? '⏳ Pending' : booking.status === 'confirmed' ? '✓ Confirmed' : '✓ Completed'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} />
                            <span>{new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} />
                            <span>{booking.duration_hours} hours</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={16} />
                            <span>{booking.location}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DollarSign size={16} />
                            <span>${booking.total_amount}</span>
                          </div>
                          {booking.notes && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={16} />
                              <span>{booking.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {bookingTab === 'completed' && (
                          <button
                            onClick={() => navigate(`/humans-for-hire/review/${booking.id}`)}
                            style={{
                              padding: '10px 16px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                          >
                            Write Review
                          </button>
                        )}
                        {bookingTab === 'upcoming' && (
                          <button
                            onClick={() => navigate('/humans-for-hire/messages')}
                            style={{
                              padding: '10px 16px',
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#374151',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.borderColor = '#10b981';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                          >
                            <MessageSquare size={16} />
                            Message
                          </button>
                        )}
                        {bookingTab === 'pending' && (
                          <button
                            style={{
                              padding: '10px 16px',
                              backgroundColor: 'white',
                              border: '1px solid #f59e0b',
                              color: '#92400e',
                              borderRadius: '8px',
                              cursor: 'not-allowed',
                              fontSize: '14px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}
                            disabled
                          >
                            Awaiting Confirmation
                          </button>
                        )}
                        {bookingTab === 'upcoming' && (
                          <button
                            onClick={() => navigate(`/humans-for-hire/helper/${booking.helper_id}`)}
                            style={{
                              padding: '10px 16px',
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#374151',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.borderColor = '#10b981';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                          >
                            View Helper
                          </button>
                        )}
                        {(bookingTab === 'upcoming' || bookingTab === 'pending') && (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this booking?')) {
                                toast.success('Cancellation feature coming soon');
                              }
                            }}
                            style={{
                              padding: '10px 16px',
                              backgroundColor: 'white',
                              border: '1px solid #fecaca',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#991b1b',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.borderColor = '#ef4444';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.borderColor = '#fecaca';
                            }}
                          >
                            Cancel Booking
                          </button>
                        )}
                        {bookingTab === 'completed' && !booking.reviewed && (
                          <button
                            onClick={() => navigate(`/humans-for-hire/review/${booking.id}`)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#2c5f2d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Star size={16} />
                            Leave Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedTab === 'favorites' && (
              <div>
                {favorites.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Heart size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                    <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '16px' }}>No saved helpers yet</p>
                    <button
                      onClick={() => navigate('/humans-for-hire/browse')}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: 600
                      }}
                    >
                      Browse Helpers
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {favorites.map((helper: any) => (
                      <div
                        key={helper.id}
                        onClick={() => navigate(`/humans-for-hire/helper/${helper.id}`)}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{helper.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: 'white', border: '1px solid #f59e0b', borderRadius: '6px' }}>
                              <Star size={14} fill="#f59e0b" color="#f59e0b" />
                              <span style={{ fontSize: '14px', fontWeight: 600, color: '#92400e' }}>{helper.rating}</span>
                            </div>
                          </div>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.5 }}>
                            {helper.bio?.substring(0, 100)}...
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                            <span style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>${helper.hourly_rate}/hr</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/humans-for-hire/helper/${helper.id}`);
                              }}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {selectedTab === 'messages' && (
              <div style={{ padding: '20px' }}>
                <button
                  onClick={() => setShowMessaging(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                >
                  <MessageSquare size={18} />
                  Open Messages
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    {showMessaging && user && (
      <MessagingSystem 
        currentUserId={user.id}
        onClose={() => setShowMessaging(false)}
      />
    )}
    {showProfileEdit && clientProfile && (
      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        profile={clientProfile}
        userType="client"
        onUpdate={(updatedProfile) => {
          setClientProfile(updatedProfile);
          toast.success('Profile updated successfully');
        }}
      />
    )}
    </UnifiedLayout>
  );
};

export default ClientDashboard;
