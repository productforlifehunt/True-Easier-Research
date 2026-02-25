import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Bell, MessageSquare, Calendar, DollarSign } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'booking' | 'message' | 'payment';
  title: string;
  message: string;
  timestamp?: Date;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} color="white" />;
      case 'error':
        return <XCircle size={20} color="white" />;
      case 'warning':
        return <AlertCircle size={20} color="white" />;
      case 'info':
        return <Info size={20} color="white" />;
      case 'booking':
        return <Calendar size={20} color="white" />;
      case 'message':
        return <MessageSquare size={20} color="white" />;
      case 'payment':
        return <DollarSign size={20} color="white" />;
      default:
        return <Bell size={20} color="white" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      case 'booking':
        return '#8b5cf6';
      case 'message':
        return '#3b82f6';
      case 'payment':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        transform: `translateX(${!isVisible || isExiting ? '400px' : '0'})`,
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 10000,
        maxWidth: '380px',
        width: '100%'
      }}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        {/* Colored header bar */}
        <div style={{
          height: '4px',
          backgroundColor: getBackgroundColor()
        }} />

        <div style={{
          padding: '16px',
          display: 'flex',
          gap: '12px'
        }}>
          {/* Icon */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: getBackgroundColor(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {getIcon()}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1d1d1f',
              margin: '0 0 4px 0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              {notification.title}
            </h4>
            <p style={{
              fontSize: '13px',
              color: '#86868b',
              margin: 0,
              lineHeight: 1.4
            }}>
              {notification.message}
            </p>
            
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  backgroundColor: getBackgroundColor(),
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                {notification.action.label}
              </button>
            )}

            {notification.timestamp && (
              <p style={{
                fontSize: '11px',
                color: '#a1a1a6',
                marginTop: '6px'
              }}>
                {new Date(notification.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              flexShrink: 0
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={16} color="#86868b" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Manager Component
export const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event: CustomEvent<Notification>) => {
      const notification = {
        ...event.detail,
        id: event.detail.id || Date.now().toString(),
        timestamp: event.detail.timestamp || new Date()
      };
      setNotifications(prev => [...prev, notification]);
    };

    window.addEventListener('app-notification' as any, handleNotification);
    return () => {
      window.removeEventListener('app-notification' as any, handleNotification);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 10000,
      pointerEvents: 'none'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'auto'
      }}>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              transform: `translateY(${index * 10}px)`,
              transition: 'transform 0.3s ease'
            }}
          >
            <NotificationToast
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to trigger notifications
export const showNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
  const event = new CustomEvent('app-notification', {
    detail: {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }
  });
  window.dispatchEvent(event);
};

export default NotificationToast;
