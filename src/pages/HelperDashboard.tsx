import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient, supabase } from '../lib/supabase';
import { Calendar, DollarSign, Star, CheckCircle, XCircle, MessageSquare, Clock, MapPin, FileText, Briefcase, TrendingUp, Settings, LogOut, Edit2 } from 'lucide-react';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { getBookingsByHelper, updateBookingStatus, Helper } from '../lib/humansForHireService';
import toast from 'react-hot-toast';
import UnifiedLayout from '../components/UnifiedLayout';
import ProfileEditModal from '../components/ProfileEditModal';
import NotificationCenter from '../components/NotificationCenter';

const HelperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [helperProfile, setHelperProfile] = useState<Helper | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedBookings: 0,
    upcomingBookings: 0,
    rating: 0,
    totalReviews: 0
  });
  const [selectedTab, setSelectedTab] = useState<'bookings' | 'earnings' | 'schedule'>('bookings');
  const [bookingTab, setBookingTab] = useState<'upcoming' | 'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);
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
        // Create a demo helper for testing
        setUser({ id: 'demo-helper', email: 'helper@example.com' });
        setHelperProfile({
          id: 'demo-helper-profile',
          user_id: 'demo-helper',
          name: 'Demo Helper',
          email: 'helper@example.com',
          location: 'Los Angeles, CA',
          services: ['Virtual Assistant', 'Errands'],
          hourly_rate: 35,
          rating: 4.8,
          total_reviews: 15,
          verified: true,
          created_at: new Date().toISOString()
        } as Helper);
        setLoading(false);
        return;
      }
      setUser(currentUser);

      // Get helper profile
      let { data: profile, error: profileError } = await supabase
        .from('hfh_helpers')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (profileError || !profile) {
        toast.error('Helper profile not found. Please complete onboarding first.');
        navigate('/humans-for-hire/become-helper');
        return;
      }
      
      setHelperProfile(profile);

      // Get bookings
      const bookingsData = await getBookingsByHelper(profile.id);
      setBookings(bookingsData);

      // Calculate stats
      const completed = bookingsData.filter(b => b.status === 'completed');
      const upcoming = bookingsData.filter(b => 
        b.status === 'confirmed' && new Date(b.scheduled_date) > new Date()
      );

      setStats({
        totalEarnings: completed.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        completedBookings: completed.length,
        upcomingBookings: upcoming.length,
        rating: profile.rating || 0,
        totalReviews: profile.total_reviews || 0
      });

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'cancel') => {
    try {
      const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
      await updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking ${action === 'confirm' ? 'confirmed' : 'cancelled'}`);
      loadData();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <UnifiedLayout>
      <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '24px' }}>
        {/* Header */}
        <header style={{
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                  Helper Dashboard
                </h1>
                <button
                  onClick={() => setShowProfileEdit(true)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <Edit2 size={16} color="#6b7280" />
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Welcome back, {helperProfile?.name}!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <NotificationCenter userId={user?.id || 'demo-helper'} userType="helper" />
              <button
                onClick={() => navigate('/humans-for-hire/helper/profile')}
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
                Edit Profile
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
              { type: 'booking', text: 'New booking request from Sarah M.', time: '30 min ago', icon: Briefcase, color: '#10b981' },
              { type: 'payment', text: 'Payment received: $120', time: '2 hours ago', icon: DollarSign, color: '#10b981' },
              { type: 'review', text: '5-star review from Michael K.', time: '1 day ago', icon: Star, color: '#f59e0b' },
              { type: 'message', text: 'New message from Emma W.', time: '2 days ago', icon: MessageSquare, color: '#3b82f6' }
            ].map((activity, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
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

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-separator)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <DollarSign size={24} color="#10b981" />
              <span style={{ color: 'var(--text-secondary)' }}>Total Earnings</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>${stats.totalEarnings}</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-separator)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Calendar size={24} color="#10b981" />
              <span style={{ color: 'var(--text-secondary)' }}>Upcoming</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>{stats.upcomingBookings}</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-separator)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <CheckCircle size={24} color="#10b981" />
              <span style={{ color: 'var(--text-secondary)' }}>Completed</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>{stats.completedBookings}</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-separator)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Star size={24} color="#10b981" />
              <span style={{ color: 'var(--text-secondary)' }}>Rating</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <p style={{ fontSize: '32px', fontWeight: 700 }}>{stats.rating.toFixed(1)}</p>
              <span style={{ color: 'var(--text-secondary)' }}>({stats.totalReviews} reviews)</span>
            </div>
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
            <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #f3f4f6' }}>
              {[{id: 'bookings', label: 'Booking Requests', icon: Briefcase}, {id: 'earnings', label: 'Earnings', icon: TrendingUp}, {id: 'schedule', label: 'Schedule', icon: Calendar}].map(tab => (
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
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  {['pending', 'upcoming', 'completed'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setBookingTab(tab as any)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: bookingTab === tab ? '#10b981' : 'white',
                        color: bookingTab === tab ? 'white' : '#6b7280',
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
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                No {bookingTab} bookings
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredBookings.map(booking => (
                  <div
                    key={booking.id}
                    style={{
                      padding: '20px',
                      backgroundColor: '#fafafa',
                      borderRadius: '8px',
                      border: '1px solid var(--border-separator)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                          {booking.service_type}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
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
                      {bookingTab === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'confirm')}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CheckCircle size={16} />
                            Accept
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'cancel')}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <XCircle size={16} />
                            Decline
                          </button>
                        </div>
                      )}
                      {bookingTab === 'upcoming' && (
                        <button
                          onClick={() => navigate(`/humans-for-hire/messages/${booking.id}`)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: 'white',
                            border: '1px solid var(--border-separator)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <MessageSquare size={16} />
                          Message Client
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedTab === 'earnings' && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <TrendingUp size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>Total Earnings: ${stats.totalEarnings}</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>From {stats.completedBookings} completed bookings</p>
                <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#f9fafb', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: 600 }}>Average per booking</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
                        ${stats.completedBookings > 0 ? (stats.totalEarnings / stats.completedBookings).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>Completion rate</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
                        {bookings.length > 0 ? Math.round((stats.completedBookings / bookings.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedTab === 'schedule' && (
              <div style={{ padding: '20px' }}>
                <AvailabilityCalendar 
                  helperId={helperProfile?.id || ''}
                  onDateTimeSelect={(date, time) => {
                    // Date/time selected for availability
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    {showProfileEdit && helperProfile && (
      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        profile={helperProfile}
        userType="helper"
        onUpdate={(updatedProfile) => {
          setHelperProfile(updatedProfile);
          toast.success('Profile updated successfully');
        }}
      />
    )}
    </UnifiedLayout>
  );
};

export default HelperDashboard;
