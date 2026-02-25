import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, Star, MessageSquare, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import UnifiedLayout from '../components/UnifiedLayout';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  helper_id: string;
  helper_name: string;
  helper_image?: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_hours: number;
  hourly_rate: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  location: string;
  notes?: string;
  created_at: string;
  is_recurring?: boolean;
  rating?: number;
  review?: string;
}

const BookingHistory: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user, filter]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        navigate('/humans-for-hire/auth');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/humans-for-hire/auth');
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('hfh_bookings')
        .select(`
          *,
          helper:hfh_helpers(name, profile_image_url)
        `)
        .eq('client_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (filter === 'upcoming') {
        query = query.gte('scheduled_date', new Date().toISOString()).in('status', ['pending', 'confirmed']);
      } else if (filter === 'past') {
        query = query.lt('scheduled_date', new Date().toISOString()).eq('status', 'completed');
      } else if (filter === 'cancelled') {
        query = query.eq('status', 'cancelled');
      }

      const { data, error } = await query;

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load booking history');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const { error } = await supabase
        .from('hfh_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Booking cancelled successfully');
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const rebookService = (booking: Booking) => {
    navigate(`/humans-for-hire/browse?service=${booking.service_type}&helper=${booking.helper_id}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} color="#10b981" />;
      case 'completed':
        return <CheckCircle size={16} color="#3b82f6" />;
      case 'cancelled':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <AlertCircle size={16} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  return (
    <UnifiedLayout>
      <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '8px'
            }}>
              Booking History
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              View and manage your past and upcoming bookings
            </p>
          </div>

          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '32px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '2px'
          }}>
            {(['all', 'upcoming', 'past', 'cancelled'] as const).map(filterOption => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: filter === filterOption ? '#10b981' : '#6b7280',
                  border: 'none',
                  borderBottom: filter === filterOption ? '2px solid #10b981' : '2px solid transparent',
                  fontSize: '15px',
                  fontWeight: filter === filterOption ? 600 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {filterOption === 'all' ? 'All Bookings' : filterOption}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '60px 0',
              color: '#6b7280'
            }}>
              Loading your bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
              backgroundColor: '#f9fafb',
              borderRadius: '16px'
            }}>
              <Calendar size={48} color="#e5e7eb" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                No bookings found
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                {filter === 'upcoming' ? "You don't have any upcoming bookings" :
                 filter === 'past' ? "You don't have any past bookings" :
                 filter === 'cancelled' ? "You haven't cancelled any bookings" :
                 "You haven't made any bookings yet"}
              </p>
              <button
                onClick={() => navigate('/humans-for-hire/browse')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Browse Helpers
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {bookings.map(booking => (
                <div
                  key={booking.id}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '24px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', gap: '24px' }}>
                    {/* Helper Image */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      backgroundColor: booking.helper_image ? 'transparent' : '#f3f4f6',
                      backgroundImage: booking.helper_image ? `url(${booking.helper_image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 600,
                      color: '#9ca3af'
                    }}>
                      {!booking.helper_image && booking.helper_name.charAt(0)}
                    </div>

                    {/* Booking Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#111827',
                            marginBottom: '4px'
                          }}>
                            {booking.helper_name}
                          </h3>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <span style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#10b981'
                            }}>
                              {booking.service_type}
                            </span>
                            {booking.is_recurring && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                backgroundColor: '#e0f2fe',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#0369a1'
                              }}>
                                <RefreshCw size={12} />
                                Recurring
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: 'white',
                          border: `1px solid ${getStatusColor(booking.status)}`,
                          borderRadius: '20px'
                        }}>
                          {getStatusIcon(booking.status)}
                          <span style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: getStatusColor(booking.status),
                            textTransform: 'capitalize'
                          }}>
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                        marginBottom: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} color="#6b7280" />
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            {new Date(booking.scheduled_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={14} color="#6b7280" />
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            {booking.scheduled_time} ({booking.duration_hours}h)
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={14} color="#6b7280" />
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            {booking.location}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <DollarSign size={14} color="#6b7280" />
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                            ${booking.total_amount}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '16px',
                          fontStyle: 'italic'
                        }}>
                          "{booking.notes}"
                        </p>
                      )}

                      {/* Review */}
                      {booking.status === 'completed' && booking.rating && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px'
                          }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i <= booking.rating! ? '#fbbf24' : 'none'}
                                  color="#fbbf24"
                                />
                              ))}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                              Your Rating
                            </span>
                          </div>
                          {booking.review && (
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>
                              {booking.review}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {booking.status === 'confirmed' || booking.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => navigate(`/humans-for-hire/messages`)}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: 'white',
                                color: '#10b981',
                                border: '1px solid #10b981',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <MessageSquare size={16} />
                              Message
                            </button>
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: 'white',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Cancel Booking
                            </button>
                          </>
                        ) : booking.status === 'completed' ? (
                          <>
                            <button
                              onClick={() => rebookService(booking)}
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
                                gap: '6px'
                              }}
                            >
                              <RefreshCw size={16} />
                              Book Again
                            </button>
                            {!booking.rating && (
                              <button
                                onClick={() => navigate(`/humans-for-hire/review/${booking.id}`)}
                                style={{
                                  padding: '10px 20px',
                                  backgroundColor: 'white',
                                  color: '#10b981',
                                  border: '1px solid #10b981',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  fontWeight: 600,
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
                          </>
                        ) : (
                          <button
                            onClick={() => rebookService(booking)}
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
                              gap: '6px'
                            }}
                          >
                            <RefreshCw size={16} />
                            Book Again
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default BookingHistory;
