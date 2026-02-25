import React, { useState, useEffect } from 'react';
import { Search, Bookmark, Trash2, Edit2, Bell, BellOff, MapPin, DollarSign, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    service_type?: string;
    location?: string;
    min_rate?: number;
    max_rate?: number;
    min_rating?: number;
    availability?: string;
  };
  notifications_enabled: boolean;
  created_at: string;
  match_count?: number;
}

const SavedSearches: React.FC = () => {
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('hfh_saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        // Calculate match counts for each search
        const searchesWithCounts = await Promise.all(
          data.map(async (search) => {
            const { count } = await supabase
              .from('hfh_helpers')
              .select('*', { count: 'exact', head: true })
              .gte('hourly_rate', search.filters.min_rate || 0)
              .lte('hourly_rate', search.filters.max_rate || 999)
              .gte('rating', search.filters.min_rating || 0);
            
            return { ...search, match_count: count || 0 };
          })
        );
        
        setSavedSearches(searchesWithCounts);
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (searchId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('hfh_saved_searches')
        .update({ notifications_enabled: !currentState })
        .eq('id', searchId);

      if (error) throw error;

      setSavedSearches(prev =>
        prev.map(s => s.id === searchId ? { ...s, notifications_enabled: !currentState } : s)
      );

      toast.success(`Notifications ${!currentState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notifications');
    }
  };

  const deleteSearch = async (searchId: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;

    try {
      const { error } = await supabase
        .from('hfh_saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(s => s.id !== searchId));
      toast.success('Search deleted');
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Failed to delete search');
    }
  };

  const executeSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.filters.service_type) params.set('service', search.filters.service_type);
    if (search.filters.location) params.set('location', search.filters.location);
    if (search.filters.min_rate) params.set('minRate', search.filters.min_rate.toString());
    if (search.filters.max_rate) params.set('maxRate', search.filters.max_rate.toString());
    if (search.filters.min_rating) params.set('minRating', search.filters.min_rating.toString());
    
    navigate(`/humans-for-hire/browse?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Bookmark size={24} style={{ color: '#10b981' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Saved Searches
          </h3>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Quickly access your favorite search criteria and get notified of new matches
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {loading ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            Loading saved searches...
          </div>
        ) : savedSearches.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <Bookmark size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              No saved searches yet
            </div>
            <div style={{ fontSize: '14px' }}>
              Save your search criteria to quickly find helpers later
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {savedSearches.map((search) => (
              <div
                key={search.id}
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#111827',
                      marginBottom: '8px'
                    }}>
                      {search.name}
                    </h4>
                    
                    {/* Filters Display */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap',
                      marginBottom: '12px'
                    }}>
                      {search.filters.service_type && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#374151'
                        }}>
                          <Search size={14} style={{ color: '#10b981' }} />
                          {search.filters.service_type}
                        </div>
                      )}
                      
                      {search.filters.location && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#374151'
                        }}>
                          <MapPin size={14} style={{ color: '#10b981' }} />
                          {search.filters.location}
                        </div>
                      )}
                      
                      {(search.filters.min_rate || search.filters.max_rate) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#374151'
                        }}>
                          <DollarSign size={14} style={{ color: '#10b981' }} />
                          ${search.filters.min_rate || 0}-${search.filters.max_rate || 999}/hr
                        </div>
                      )}
                      
                      {search.filters.min_rating && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#374151'
                        }}>
                          <Star size={14} style={{ color: '#10b981' }} />
                          {search.filters.min_rating}+ rating
                        </div>
                      )}
                    </div>

                    {/* Match Count & Date */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '13px',
                      color: '#6b7280'
                    }}>
                      <span>
                        <strong style={{ color: '#10b981' }}>{search.match_count || 0}</strong> matches
                      </span>
                      <span>
                        Saved {formatDate(search.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleNotifications(search.id, search.notifications_enabled)}
                      style={{
                        padding: '8px',
                        backgroundColor: search.notifications_enabled ? '#f0fdf4' : 'white',
                        border: `1px solid ${search.notifications_enabled ? '#10b981' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: search.notifications_enabled ? '#10b981' : '#6b7280',
                        transition: 'all 0.2s'
                      }}
                      title={search.notifications_enabled ? 'Notifications enabled' : 'Notifications disabled'}
                    >
                      {search.notifications_enabled ? <Bell size={16} /> : <BellOff size={16} />}
                    </button>
                    
                    <button
                      onClick={() => deleteSearch(search.id)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#6b7280',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.borderColor = '#dc2626';
                        e.currentTarget.style.color = '#dc2626';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Execute Search Button */}
                <button
                  onClick={() => executeSearch(search)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  <Search size={16} />
                  Run This Search
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
