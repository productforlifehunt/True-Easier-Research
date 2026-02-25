import React from 'react';
import { Star, MapPin, Calendar, Shield, Clock, Heart, CheckCircle, Users, MessageSquare, Zap, DollarSign, Video, Award, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HelperCardProps {
  helper: any;
  onCompare?: (helper: any) => void;
  isComparing?: boolean;
  onBook?: (helper: any) => void;
  favorites?: string[];
  onToggleFavorite?: (helperId: string) => void;
  onMessage?: (helper: any) => void;
  onOffer?: (helper: any) => void;
  onVideoIntro?: (helper: any) => void;
}

const HelperCard: React.FC<HelperCardProps & { onClick?: (helper: any) => void; style?: React.CSSProperties }> = ({
  helper,
  onCompare,
  isComparing = false,
  onBook,
  favorites = [],
  onToggleFavorite,
  onMessage,
  onOffer,
  onVideoIntro,
  onClick,
  style
}) => {
  const navigate = useNavigate();

  const getGenderLabel = (gender?: string) => {
    if (!gender) return null;
    switch(gender) {
      case 'cis-male': return 'Cis Male';
      case 'trans-male': return 'Trans Male';
      case 'cis-female': return 'Cis Female';
      case 'trans-female': return 'Trans Female';
      case 'non-binary': return 'Non-Binary';
      case 'genderfluid': return 'Genderfluid';
      case 'agender': return 'Agender';
      case 'male': return 'Male';
      case 'female': return 'Female';
      default: return gender.charAt(0).toUpperCase() + gender.slice(1);
    }
  };

  return (
    <div onClick={() => onClick?.(helper)} style={{
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.2s',
      height: '440px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      ...style
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Badge Row */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {helper.verified && (
            <div style={{
              padding: '4px 8px',
              backgroundColor: 'white',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>VERIFIED</span>
            </div>
          )}
          {helper.instant_book && (
            <div style={{
              padding: '4px 8px',
              backgroundColor: '#fef3c7',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Zap size={14} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e' }}>INSTANT</span>
            </div>
          )}
          {getGenderLabel(helper.gender || helper.gender_identity) && (
            <div style={{
              padding: '4px 8px',
              backgroundColor: 'white',
              border: '1px solid #10b981',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>
                {getGenderLabel(helper.gender || helper.gender_identity)}
              </span>
            </div>
          )}
        </div>
        {helper.availability_today && (
          <div style={{
            padding: '4px 8px',
            backgroundColor: 'white',
            border: '1px solid #10b981',
            borderRadius: '6px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>AVAILABLE TODAY</span>
          </div>
        )}
      </div>

      {/* Profile Image */}
      <div style={{
        width: '100%',
        height: '200px',
        backgroundColor: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img
          src={helper.profile_image_url || `https://ui-avatars.com/api/?name=${helper.name}&background=10b981&color=fff`}
          alt={helper.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(helper.id);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Heart size={16} fill={favorites.includes(helper.id) ? '#ef4444' : 'none'} color="#ef4444" />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Name and Price Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '4px'
            }}>
              {helper.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                fontSize: '13px',
                color: '#10b981',
                fontWeight: 600
              }}>
                {helper.services?.[0] || 'General Services'}
              </div>
              {helper.gender && (
                <div style={{
                  padding: '2px 8px',
                  backgroundColor: 'white',
                  border: '1px solid #10b981',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#059669',
                  letterSpacing: '0.5px'
                }}>
                  {getGenderLabel(helper.gender)}
                </div>
              )}
            </div>
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#111827'
          }}>
            ${helper.hourly_rate}<span style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280' }}>/hr</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '12px',
          flexWrap: 'wrap'
        }}>
          {helper.background_check_status === 'approved' && (
            <div style={{
              padding: '3px 8px',
              backgroundColor: '#f0fdf4',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Shield size={12} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#065f46' }}>Background Check</span>
            </div>
          )}
          {helper.response_time && (
            <div style={{
              padding: '3px 8px',
              backgroundColor: '#fef3c7',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Clock size={12} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#92400e' }}>Responds in {helper.response_time}</span>
            </div>
          )}
          {helper.years_experience && helper.years_experience >= 3 && (
            <div style={{
              padding: '3px 8px',
              backgroundColor: '#fef3c7',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Award size={12} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#92400e' }}>{helper.years_experience}+ Years</span>
            </div>
          )}
          {helper.response_time_hours && helper.response_time_hours <= 1 && (
            <div style={{
              padding: '3px 8px',
              backgroundColor: '#dbeafe',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Clock size={12} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e40af' }}>~1hr Response</span>
            </div>
          )}
        </div>

        {/* Rating and Location */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '8px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= Math.floor(helper.rating || 0) ? '#fbbf24' : 'none'} stroke={star <= Math.floor(helper.rating || 0) ? '#fbbf24' : '#e5e7eb'} strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
            <span style={{ marginLeft: '4px', fontSize: '12px', color: '#6b7280' }}>
              ({helper.reviews_count || 0})
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="#6b7280" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {helper.location}
            </span>
          </div>
        </div>

        {/* Languages */}
        {helper.languages && helper.languages.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '12px'
          }}>
            <Globe size={12} color="#6b7280" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {helper.languages.slice(0, 2).join(', ')}
              {helper.languages.length > 2 && ` +${helper.languages.length - 2}`}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {onCompare && (
            <input
              type="checkbox"
              checked={isComparing}
              onChange={(e) => {
                e.stopPropagation();
                onCompare(helper);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: '#10b981'
              }}
              title="Compare helpers"
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/humans-for-hire/book/${helper.id}`);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            {helper.instant_book ? <Zap size={14} /> : <Calendar size={14} />}
            {helper.instant_book ? 'Instant Book' : 'Book Now'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.(helper);
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: 'white',
              color: '#10b981',
              border: '1px solid #10b981',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Message"
          >
            <MessageSquare size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOffer?.(helper);
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: 'white',
              color: '#10b981',
              border: '1px solid #10b981',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Make Offer"
          >
            <DollarSign size={14} />
          </button>
          {helper.has_video && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVideoIntro?.(helper);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: '1px solid #10b981',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Watch Video Introduction"
            >
              <Video size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelperCard;
