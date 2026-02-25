import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Calendar, MessageSquare, Star, DollarSign, AlertCircle, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'review' | 'payment' | 'alert' | 'info';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface NotificationCenterProps {
  userId: string;
  userType: 'client' | 'helper';
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, userType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load demo notifications for now
    const demoNotifications: Notification[] = userType === 'client' ? [
      {
        id: '1',
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your booking with Sarah T. has been confirmed for tomorrow at 2:00 PM',
        read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action_url: '/humans-for-hire/client-dashboard'
      },
      {
        id: '2',
        type: 'message',
        title: 'New Message',
        message: 'Michael C. sent you a message about your upcoming booking',
        read: false,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        action_url: '/humans-for-hire/messages'
      },
      {
        id: '3',
        type: 'review',
        title: 'Leave a Review',
        message: 'How was your experience with Emma W.? Leave a review',
        read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'info',
        title: 'Profile Update',
        message: 'Your profile has been successfully updated',
        read: true,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      }
    ] : [
      {
        id: '1',
        type: 'booking',
        title: 'New Booking Request',
        message: 'Sarah M. has requested a booking for Friday at 3:00 PM',
        read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        action_url: '/humans-for-hire/helper-dashboard'
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Received',
        message: 'You received $120 for your completed booking',
        read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'review',
        title: 'New Review',
        message: 'Michael K. left you a 5-star review!',
        read: false,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'alert',
        title: 'Complete Your Profile',
        message: 'Add your availability to get more bookings',
        read: true,
        created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
      }
    ];

    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.read).length);
  }, [userId, userType]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'message': return MessageSquare;
      case 'review': return Star;
      case 'payment': return DollarSign;
      case 'alert': return AlertCircle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking': return '#10b981';
      case 'message': return '#3b82f6';
      case 'review': return '#f59e0b';
      case 'payment': return '#10b981';
      case 'alert': return '#ef4444';
      case 'info': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
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
        <Bell size={20} color="#6b7280" />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount}
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
          />
          
          {/* Dropdown */}
          <div style={{
            position: 'absolute',
            top: '48px',
            right: 0,
            width: '380px',
            maxHeight: '500px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                Notifications
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      fontSize: '12px',
                      color: '#10b981',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 500,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} color="#6b7280" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div style={{
              flex: 1,
              overflowY: 'auto'
            }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center'
                }}>
                  <Bell size={48} color="#e5e7eb" style={{ marginBottom: '12px' }} />
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map(notification => {
                  const Icon = getIcon(notification.type);
                  const iconColor = getIconColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.action_url) {
                          window.location.href = notification.action_url;
                        }
                      }}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: notification.read ? 'white' : '#f9fafb',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: notification.action_url ? 'pointer' : 'default',
                        transition: 'background-color 0.2s',
                        position: 'relative'
                      }}
                      onMouseOver={(e) => {
                        if (notification.action_url) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#f9fafb';
                      }}
                    >
                      {!notification.read && (
                        <div style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981'
                        }} />
                      )}
                      
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: `${iconColor}10`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Icon size={18} color={iconColor} />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#111827',
                            marginBottom: '4px'
                          }}>
                            {notification.title}
                          </h4>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            lineHeight: '1.4',
                            marginBottom: '4px'
                          }}>
                            {notification.message}
                          </p>
                          <p style={{
                            fontSize: '11px',
                            color: '#9ca3af'
                          }}>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page when implemented
                  }}
                  style={{
                    fontSize: '13px',
                    color: '#10b981',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    padding: '4px 12px',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
