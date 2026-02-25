import React from 'react';
import { Shield, CheckCircle, Award, Star, TrendingUp } from 'lucide-react';

interface TrustScoreProps {
  verified: boolean;
  backgroundCheck?: boolean;
  insuranceVerified?: boolean;
  rating: number;
  totalReviews: number;
  responseRate?: number;
  yearsExperience?: number;
  repeatClients?: number;
  compact?: boolean;
}

const TrustScore: React.FC<TrustScoreProps> = ({
  verified,
  backgroundCheck,
  insuranceVerified,
  rating,
  totalReviews,
  responseRate = 0,
  yearsExperience = 0,
  repeatClients = 0,
  compact = false
}) => {
  // Calculate trust score (0-100)
  const calculateTrustScore = () => {
    let score = 0;
    
    // Verification factors (40 points max)
    if (verified) score += 15;
    if (backgroundCheck) score += 15;
    if (insuranceVerified) score += 10;
    
    // Performance factors (40 points max)
    score += (rating / 5) * 20; // Up to 20 points for rating
    score += Math.min(totalReviews / 50, 1) * 10; // Up to 10 points for reviews (50+ = max)
    score += (responseRate / 100) * 10; // Up to 10 points for response rate
    
    // Experience factors (20 points max)
    score += Math.min(yearsExperience / 5, 1) * 10; // Up to 10 points for experience (5+ years = max)
    score += Math.min(repeatClients / 30, 1) * 10; // Up to 10 points for repeat clients (30% = max)
    
    return Math.round(score);
  };

  const trustScore = calculateTrustScore();
  
  const getTrustLevel = (score: number) => {
    if (score >= 90) return { label: 'Exceptional', color: '#059669' };
    if (score >= 75) return { label: 'Excellent', color: '#10b981' };
    if (score >= 60) return { label: 'Very Good', color: '#34d399' };
    if (score >= 45) return { label: 'Good', color: '#f59e0b' };
    if (score >= 30) return { label: 'Fair', color: '#fb923c' };
    return { label: 'Building Trust', color: '#94a3b8' };
  };

  const trustLevel = getTrustLevel(trustScore);

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'white',
        border: `2px solid ${trustLevel.color}`,
        borderRadius: '20px'
      }}>
        <Shield size={16} color={trustLevel.color} strokeWidth={2.5} />
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: trustLevel.color
        }}>
          {trustScore}% Trust
        </span>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: `${trustLevel.color}20`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={24} color={trustLevel.color} strokeWidth={2} />
          </div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#111827',
              margin: 0
            }}>
              Trust Score
            </h3>
            <p style={{
              fontSize: '14px',
              color: trustLevel.color,
              fontWeight: 600,
              margin: 0
            }}>
              {trustLevel.label}
            </p>
          </div>
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 700,
          color: trustLevel.color
        }}>
          {trustScore}%
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{
          width: `${trustScore}%`,
          height: '100%',
          backgroundColor: trustLevel.color,
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Trust Factors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Verification Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color={verified ? '#10b981' : '#d1d5db'} />
            <span style={{
              fontSize: '14px',
              color: verified ? '#065f46' : '#9ca3af',
              fontWeight: 500
            }}>
              ID Verification
            </span>
          </div>
          <span style={{
            fontSize: '12px',
            padding: '3px 8px',
            backgroundColor: verified ? '#ecfdf5' : '#f3f4f6',
            color: verified ? '#065f46' : '#9ca3af',
            borderRadius: '4px',
            fontWeight: 600
          }}>
            {verified ? 'Verified' : 'Pending'}
          </span>
        </div>

        {/* Background Check */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color={backgroundCheck ? '#10b981' : '#d1d5db'} />
            <span style={{
              fontSize: '14px',
              color: backgroundCheck ? '#065f46' : '#9ca3af',
              fontWeight: 500
            }}>
              Background Check
            </span>
          </div>
          <span style={{
            fontSize: '12px',
            padding: '3px 8px',
            backgroundColor: backgroundCheck ? '#ecfdf5' : '#f3f4f6',
            color: backgroundCheck ? '#065f46' : '#9ca3af',
            borderRadius: '4px',
            fontWeight: 600
          }}>
            {backgroundCheck ? 'Passed' : 'Not Verified'}
          </span>
        </div>

        {/* Performance Metrics */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} color="#f59e0b" />
            <span style={{
              fontSize: '14px',
              color: '#374151',
              fontWeight: 500
            }}>
              Customer Rating
            </span>
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827'
          }}>
            {rating.toFixed(1)} ({totalReviews} reviews)
          </span>
        </div>

        {/* Response Rate */}
        {responseRate > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#6366f1" />
              <span style={{
                fontSize: '14px',
                color: '#374151',
                fontWeight: 500
              }}>
                Response Rate
              </span>
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#111827'
            }}>
              {responseRate}%
            </span>
          </div>
        )}

        {/* Experience */}
        {yearsExperience > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#8b5cf6" />
              <span style={{
                fontSize: '14px',
                color: '#374151',
                fontWeight: 500
              }}>
                Years of Experience
              </span>
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#111827'
            }}>
              {yearsExperience}+ years
            </span>
          </div>
        )}
      </div>

      {/* Trust Score Explanation */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #fcd34d'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#78350f',
          margin: 0,
          lineHeight: 1.5
        }}>
          <strong>Trust Score</strong> is calculated based on verification status, customer ratings, response rate, and experience. Higher scores indicate more reliable helpers.
        </p>
      </div>
    </div>
  );
};

export default TrustScore;
