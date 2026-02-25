import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, DollarSign, Star, MessageCircle, User, MapPin, CheckCircle, XCircle, AlertCircle, Home, Settings, CreditCard, Heart, History, Bell, HelpCircle, ChevronRight, Package, Shield, Award, TrendingUp, Users } from 'lucide-react';
import UnifiedLayout from '../components/UnifiedLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  helper_id: string;
  helper_name: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'bookings' | 'favorites' | 'payments' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/humans-for-hire/auth');
      return;
    }
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('hfh_bookings')
        .select('*, helper:hfh_helpers(name)')
        .eq('client_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedBookings = data.map(booking => ({
          id: booking.id,
          helper_id: booking.helper_id,
          helper_name: booking.helper?.name || 'Helper',
          service: booking.service_type || 'General',
          date: booking.date,
          time: booking.time,
          status: booking.status || 'pending',
          total_price: booking.total_price || 0
        }));
        setBookings(transformedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('hfh_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'completed': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') {
      return ['pending', 'confirmed'].includes(booking.status) && new Date(booking.date) >= new Date();
    } else {
      return booking.status === 'completed' || new Date(booking.date) < new Date();
    }
  });

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'favorites', label: 'Favorite Helpers', icon: Heart },
    { id: 'payments', label: 'Payment History', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (authLoading) {
    return (
      <UnifiedLayout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 60px)',
          backgroundColor: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#10b981',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
            <p style={{ color: '#86868b', fontSize: '15px' }}>Loading your dashboard...</p>
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div style={{ 
        display: 'flex',
        backgroundColor: 'white',
        minHeight: 'calc(100vh - 60px)'
      }}>
        {/* macOS Style Sidebar */}
        <div style={{
          width: '280px',
          backgroundColor: 'white',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          {/* User Profile Section */}
          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '24px',
              fontWeight: 700,
              color: 'white'
            }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1d1d1f' }}>
              {user?.email?.split('@')[0] || 'User'}
            </div>
            <div style={{ fontSize: '12px', color: '#86868b', marginTop: '4px' }}>
              {user?.email}
            </div>
            <div style={{
              marginTop: '12px',
              padding: '6px 12px',
              backgroundColor: '#f0fdf4',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#10b981',
              display: 'inline-block'
            }}>
              Active Member
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1 }}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    marginBottom: '4px',
                    backgroundColor: isActive ? '#f0fdf4' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon 
                    size={18} 
                    style={{ 
                      color: isActive ? '#10b981' : '#6b7280',
                      flexShrink: 0
                    }} 
                  />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#10b981' : '#1d1d1f'
                  }}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '20px',
                      backgroundColor: '#10b981',
                      borderRadius: '0 2px 2px 0'
                    }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <button
              onClick={() => navigate('/humans-for-hire/browse')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Users size={16} />
              Find Helpers
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ 
          flex: 1,
          backgroundColor: 'white',
          borderRadius: '12px 0 0 0',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
          overflow: 'auto'
        }}>
          <div style={{ padding: '40px' }}>
            {/* Dynamic Content Based on Active Section */}
            {activeSection === 'overview' && (
              <>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 700, 
                  color: '#1d1d1f', 
                  marginBottom: '8px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                  Welcome back!
                </h1>
                <p style={{ fontSize: '15px', color: '#86868b', marginBottom: '32px' }}>
                  Here's what's happening with your bookings
                </p>

                {/* Stats Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    backgroundColor: '#f5f5f7',
                    borderRadius: '12px',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}>
                      <Calendar size={24} style={{ color: '#10b981' }} />
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#1d1d1f', marginBottom: '4px' }}>
                      {bookings.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#86868b' }}>Total Bookings</div>
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#10b981'
                    }}>
                      +12% this month
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#f5f5f7',
                    borderRadius: '12px',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}>
                      <Clock size={24} style={{ color: '#f59e0b' }} />
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#1d1d1f', marginBottom: '4px' }}>
                      {bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#86868b' }}>Upcoming</div>
                  </div>

                  <div style={{
                    backgroundColor: '#f5f5f7',
                    borderRadius: '12px',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}>
                      <DollarSign size={24} style={{ color: '#3b82f6' }} />
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#1d1d1f', marginBottom: '4px' }}>
                      ${bookings.reduce((sum, b) => sum + b.total_price, 0).toFixed(0)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#86868b' }}>Total Spent</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div style={{
                  backgroundColor: '#f5f5f7',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px'
                }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1d1d1f', marginBottom: '16px' }}>
                    Recent Activity
                  </h2>
                  {bookings.slice(0, 3).map((booking, idx) => (
                    <div
                      key={booking.id}
                      style={{
                        padding: '12px 0',
                        borderBottom: idx < 2 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={20} style={{ color: '#86868b' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1d1d1f' }}>
                            {booking.service} with {booking.helper_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#86868b' }}>
                            {new Date(booking.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: `${getStatusColor(booking.status)}20`,
                        color: getStatusColor(booking.status),
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'bookings' && (
              <>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 700, 
                  color: '#1d1d1f', 
                  marginBottom: '32px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                  My Bookings
                </h1>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {(['upcoming', 'past'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === tab ? '#10b981' : 'white',
                  color: activeTab === tab ? 'white' : '#6b7280',
                  border: `2px solid ${activeTab === tab ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab} Bookings
              </button>
            ))}
          </div>

                {/* Bookings List */}
                {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading bookings...
            </div>
                ) : filteredBookings.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px'
            }}>
              <Calendar size={48} style={{ color: '#e5e7eb', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '18px', color: '#6b7280' }}>
                No {activeTab} bookings found
              </p>
              <button
                onClick={() => navigate('/humans-for-hire/browse')}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Browse Helpers
              </button>
            </div>
                ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredBookings.map((booking) => {
                const StatusIcon = booking.status === 'confirmed' ? CheckCircle :
                                  booking.status === 'pending' ? Clock :
                                  booking.status === 'completed' ? CheckCircle :
                                  XCircle;
                
                return (
                  <div
                    key={booking.id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <StatusIcon size={20} style={{ color: getStatusColor(booking.status) }} />
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: `${getStatusColor(booking.status)}20`,
                          color: getStatusColor(booking.status),
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                        {booking.service} with {booking.helper_name}
                      </h3>
                      
                      <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6b7280' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} />
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} />
                          {booking.time}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <DollarSign size={14} />
                          ${booking.total_price}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: 'white',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/humans-for-hire/booking/${booking.id}`)}
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
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
              </>
            )}

            {activeSection === 'favorites' && (
              <>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 700, 
                  color: '#1d1d1f', 
                  marginBottom: '8px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                  Favorite Helpers
                </h1>
                <p style={{ fontSize: '15px', color: '#86868b', marginBottom: '32px' }}>
                  Your saved helpers for quick booking
                </p>
                
                <div style={{
                  backgroundColor: '#f5f5f7',
                  borderRadius: '12px',
                  padding: '48px',
                  textAlign: 'center'
                }}>
                  <Heart size={48} style={{ color: '#e5e7eb', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: '16px', color: '#86868b', marginBottom: '24px' }}>
                    No favorite helpers yet
                  </p>
                  <button
                    onClick={() => navigate('/humans-for-hire/browse')}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Find Helpers
                  </button>
                </div>
              </>
            )}

            {activeSection === 'payments' && (
              <>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 700, 
                  color: '#1d1d1f', 
                  marginBottom: '8px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                  Payment History
                </h1>
                <p style={{ fontSize: '15px', color: '#86868b', marginBottom: '32px' }}>
                  View your transaction history and payment methods
                </p>
                
                <div style={{
                  backgroundColor: '#f5f5f7',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f', marginBottom: '16px' }}>
                    Payment Methods
                  </h3>
                  <div style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <CreditCard size={20} style={{ color: '#86868b' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#1d1d1f' }}>•••• 4242</div>
                      <div style={{ fontSize: '12px', color: '#86868b' }}>Expires 12/25</div>
                    </div>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: '#10b981',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Edit
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'settings' && (
              <>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 700, 
                  color: '#1d1d1f', 
                  marginBottom: '8px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                  Settings
                </h1>
                <p style={{ fontSize: '15px', color: '#86868b', marginBottom: '32px' }}>
                  Manage your account preferences
                </p>
                
                <div style={{
                  backgroundColor: '#f5f5f7',
                  borderRadius: '12px',
                  padding: '0',
                  overflow: 'hidden'
                }}>
                  {[
                    { icon: User, label: 'Personal Information', description: 'Update your profile' },
                    { icon: Bell, label: 'Notifications', description: 'Manage alerts' },
                    { icon: Shield, label: 'Privacy & Security', description: 'Account protection' },
                    { icon: HelpCircle, label: 'Help & Support', description: 'Get assistance' },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        style={{
                          width: '100%',
                          padding: '20px 24px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: idx < 3 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={20} style={{ color: '#86868b' }} />
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontSize: '15px', fontWeight: 500, color: '#1d1d1f' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '13px', color: '#86868b' }}>
                            {item.description}
                          </div>
                        </div>
                        <ChevronRight size={18} style={{ color: '#c7c7cc' }} />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default UserDashboard;
