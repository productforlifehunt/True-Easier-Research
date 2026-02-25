import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, DollarSign, MapPin, User, MessageSquare, X, CheckCircle, XCircle, Star, Filter, Search, ChevronDown } from 'lucide-react';
import UnifiedLayout from '../components/UnifiedLayout';
import { authClient, supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  helper_id: string;
  helper_name: string;
  helper_service_type: string;
  client_id: string;
  client_name: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  payment_method: string;
  special_requests?: string;
  instant_booking: boolean;
  created_at: string;
}

const BookingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'helper' | 'client' | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'status'>('date');

  useEffect(() => {
    checkAuthAndLoadBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, selectedStatus, searchQuery, sortBy]);

  const checkAuthAndLoadBookings = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        navigate('/humans-for-hire/auth');
        return;
      }
      setCurrentUser(user);

      // Check if user is helper or client
      const { data: helperData } = await supabase
        .from('hfh_helpers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data: clientData } = await supabase
        .from('hfh_clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (helperData) {
        setUserRole('helper');
        await loadHelperBookings(helperData.id);
      } else if (clientData) {
        setUserRole('client');
        await loadClientBookings(clientData.id);
      }
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/humans-for-hire/auth');
    }
  };

  const loadHelperBookings = async (helperId: string) => {
    try {
      setLoading(true);
      const { data: bookingsData } = await supabase
        .from('hfh_bookings')
        .select(`
          *,
          hfh_clients!inner(name, user_id)
        `)
        .eq('helper_id', helperId)
        .order('start_time', { ascending: false });

      if (bookingsData) {
        const formattedBookings = bookingsData.map(b => ({
          id: b.id,
          helper_id: b.helper_id,
          helper_name: '',
          helper_service_type: b.service_type,
          client_id: b.client_id,
          client_name: b.hfh_clients.name,
          start_time: b.start_time,
          end_time: b.end_time,
          total_price: b.total_price,
          status: b.status,
          payment_method: b.payment_method,
          special_requests: b.special_requests,
          instant_booking: b.instant_booking,
          created_at: b.created_at
        }));
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadClientBookings = async (clientId: string) => {
    try {
      setLoading(true);
      const { data: bookingsData } = await supabase
        .from('hfh_bookings')
        .select(`
          *,
          hfh_helpers!inner(name, service_type, user_id)
        `)
        .eq('client_id', clientId)
        .order('start_time', { ascending: false });

      if (bookingsData) {
        const formattedBookings = bookingsData.map(b => ({
          id: b.id,
          helper_id: b.helper_id,
          helper_name: b.hfh_helpers.name,
          helper_service_type: b.hfh_helpers.service_type,
          client_id: b.client_id,
          client_name: '',
          start_time: b.start_time,
          end_time: b.end_time,
          total_price: b.total_price,
          status: b.status,
          payment_method: b.payment_method,
          special_requests: b.special_requests,
          instant_booking: b.instant_booking,
          created_at: b.created_at
        }));
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(b => b.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(b => {
        const searchTerm = searchQuery.toLowerCase();
        return (
          b.helper_name.toLowerCase().includes(searchTerm) ||
          b.client_name.toLowerCase().includes(searchTerm) ||
          b.helper_service_type.toLowerCase().includes(searchTerm)
        );
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
      }
      if (sortBy === 'price') {
        return b.total_price - a.total_price;
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('hfh_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus as any } : b)
      );

      toast.success(`Booking ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    revenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.total_price, 0)
  };

  return (
    <UnifiedLayout>
      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Booking Dashboard
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              Manage your {userRole === 'helper' ? 'service bookings' : 'appointments'}
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              padding: '24px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                Total Bookings
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>
                {stats.total}
              </div>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                Pending
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>
                {stats.pending}
              </div>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                Confirmed
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
                {stats.confirmed}
              </div>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                {userRole === 'helper' ? 'Revenue' : 'Total Spent'}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>
                ${stats.revenue.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '10px 36px 10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '10px 36px 10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div style={{
              padding: '80px 20px',
              textAlign: 'center',
              color: '#9ca3af'
            }}>
              Loading bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{
              padding: '80px 20px',
              textAlign: 'center',
              color: '#9ca3af'
            }}>
              <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                No bookings found
              </div>
              <div style={{ fontSize: '14px' }}>
                {searchQuery || selectedStatus !== 'all' ? 'Try adjusting your filters' : 'Your bookings will appear here'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredBookings.map((booking) => {
                const StatusIcon = getStatusIcon(booking.status);
                
                return (
                  <div
                    key={booking.id}
                    style={{
                      padding: '24px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '24px',
                      alignItems: 'start'
                    }}>
                      {/* Left Side */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{
                            padding: '8px',
                            backgroundColor: getStatusColor(booking.status) + '20',
                            borderRadius: '8px'
                          }}>
                            <StatusIcon size={20} style={{ color: getStatusColor(booking.status) }} />
                          </div>
                          
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                              {userRole === 'helper' ? booking.client_name : booking.helper_name}
                            </h3>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              {booking.helper_service_type}
                            </div>
                          </div>

                          <div style={{
                            padding: '6px 12px',
                            backgroundColor: getStatusColor(booking.status) + '20',
                            color: getStatusColor(booking.status),
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            marginLeft: 'auto'
                          }}>
                            {booking.status}
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '16px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} style={{ color: '#6b7280' }} />
                            <span style={{ fontSize: '14px', color: '#374151' }}>
                              {formatDate(booking.start_time)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} style={{ color: '#6b7280' }} />
                            <span style={{ fontSize: '14px', color: '#374151' }}>
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DollarSign size={16} style={{ color: '#6b7280' }} />
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                              ${booking.total_price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {booking.special_requests && (
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#6b7280',
                            lineHeight: 1.5
                          }}>
                            <strong>Special Requests:</strong> {booking.special_requests}
                          </div>
                        )}
                      </div>

                      {/* Right Side - Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                        {booking.status === 'pending' && userRole === 'helper' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              style={{
                                padding: '10px 16px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              style={{
                                padding: '10px 16px',
                                backgroundColor: 'white',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                            style={{
                              padding: '10px 16px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Start Service
                          </button>
                        )}

                        {booking.status === 'in_progress' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            style={{
                              padding: '10px 16px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Complete
                          </button>
                        )}

                        <button
                          onClick={() => navigate('/humans-for-hire/messages')}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: 'white',
                            color: '#10b981',
                            border: '1px solid #10b981',
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
                          <MessageSquare size={16} />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default BookingDashboard;
