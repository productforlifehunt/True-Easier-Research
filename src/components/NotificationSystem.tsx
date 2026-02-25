import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Calendar, MessageSquare, DollarSign, Star, AlertCircle, Settings } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('hfh_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      await supabase
        .from('hfh_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      await supabase
        .from('hfh_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      await supabase
        .from('hfh_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar size={16} color="#10b981" />;
      case 'message':
        return <MessageSquare size={16} color="#3b82f6" />;
      case 'payment':
        return <DollarSign size={16} color="#10b981" />;
      case 'review':
        return <Star size={16} color="#fbbf24" />;
      case 'system':
        return <AlertCircle size={16} color="#6b7280" />;
      default:
        return <Bell size={16} color="#6b7280" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return time.toLocaleDateString();
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: showPanel ? '#f0fdf4' : 'white',
          border: `1px solid ${showPanel ? '#10b981' : '#e5e7eb'}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
      >
        <Bell size={20} color={showPanel ? '#10b981' : '#6b7280'} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '20px',
            height: '20px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          width: '380px',
          maxHeight: '500px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'white'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827'
              }}>
                Notifications
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={14} color="#6b7280" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: filter === 'all' ? '#10b981' : 'white',
                  color: filter === 'all' ? 'white' : '#6b7280',
                  border: `1px solid ${filter === 'all' ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: filter === 'unread' ? '#10b981' : 'white',
                  color: filter === 'unread' ? 'white' : '#6b7280',
                  border: `1px solid ${filter === 'unread' ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{
            maxHeight: '350px',
            overflowY: 'auto'
          }}>
            {filteredNotifications.length === 0 ? (
              <div style={{
                padding: '48px',
                textAlign: 'center',
                color: '#9ca3af'
              }}>
                <Bell size={48} color="#e5e7eb" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: '14px' }}>No {filter === 'unread' ? 'unread ' : ''}notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: notification.read ? 'white' : '#f0fdf4',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = notification.read ? '#f0fdf4' : '#dcfce7';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#f0fdf4';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: notification.read ? '#f3f4f6' : '#e0f2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '4px'
                      }}>
                        <h4 style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#111827'
                        }}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.5
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '0.5'}
                        >
                          <X size={14} color="#6b7280" />
                        </button>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginBottom: '4px',
                        lineHeight: 1.4
                      }}>
                        {notification.message}
                      </p>
                      <div style={{
                        fontSize: '11px',
                        color: '#9ca3af'
                      }}>
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {filteredNotifications.length > 0 && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                style={{
                  fontSize: '13px',
                  color: unreadCount === 0 ? '#9ca3af' : '#10b981',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: unreadCount === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Mark all as read
              </button>
              <button
                onClick={() => {
                  setShowPanel(false);
                  // Navigate to notifications page
                }}
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Settings size={14} />
                Settings
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationSystem;
