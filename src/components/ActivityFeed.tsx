import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Star, Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';

interface Activity {
  id: string;
  user_id: string;
  user_name: string;
  user_image?: string;
  type: 'booking' | 'review' | 'favorite' | 'achievement';
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('hfh_activities')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar size={20} color="#10b981" />;
      case 'review':
        return <Star size={20} color="#fbbf24" />;
      case 'favorite':
        return <Heart size={20} color="#ef4444" />;
      case 'achievement':
        return <TrendingUp size={20} color="#3b82f6" />;
      default:
        return <Users size={20} color="#6b7280" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '4px'
        }}>
          Community Activity
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#6b7280'
        }}>
          See what others are up to
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        {loading ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            No activities yet
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              style={{
                padding: '20px',
                borderBottom: index < activities.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  {activity.user_name[0]}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111827'
                    }}>
                      {activity.user_name}
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '12px'
                    }}>
                      {getActivityIcon(activity.type)}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#6b7280',
                        textTransform: 'capitalize'
                      }}>
                        {activity.type}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '13px',
                      color: '#9ca3af'
                    }}>
                      · {formatTime(activity.timestamp)}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: 1.5,
                    marginBottom: '12px'
                  }}>
                    {activity.content}
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: '16px'
                  }}>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#6b7280',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#10b981';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }}>
                      <Heart size={16} />
                      <span>{activity.likes}</span>
                    </button>

                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#6b7280',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#10b981';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }}>
                      <MessageCircle size={16} />
                      <span>{activity.comments}</span>
                    </button>

                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#6b7280',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#10b981';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }}>
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
