import React, { useState } from 'react';
import { X, Star, MapPin, Clock, DollarSign, Shield, Award, Check, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Helper {
  id: string;
  name: string;
  service_type: string;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  location: string;
  years_experience: number;
  verified: boolean;
  background_checked: boolean;
  response_time: string;
  completion_rate: number;
  specializations: string[];
}

interface HelperComparisonProps {
  helpers: Helper[];
  onClose?: () => void;
  maxHelpers?: number;
}

const HelperComparison: React.FC<HelperComparisonProps> = ({
  helpers: initialHelpers = [],
  onClose,
  maxHelpers = 3
}) => {
  const navigate = useNavigate();
  const [selectedHelpers, setSelectedHelpers] = useState<Helper[]>(initialHelpers.slice(0, maxHelpers));

  const removeHelper = (helperId: string) => {
    setSelectedHelpers(prev => prev.filter(h => h.id !== helperId));
  };

  const comparisonCategories = [
    { label: 'Hourly Rate', key: 'hourly_rate', icon: DollarSign, format: (val: any) => `$${val}/hr` },
    { label: 'Rating', key: 'rating', icon: Star, format: (val: any) => `${Number(val).toFixed(1)}/5.0` },
    { label: 'Total Reviews', key: 'total_reviews', icon: Award, format: (val: any) => val.toString() },
    { label: 'Experience', key: 'years_experience', icon: Clock, format: (val: any) => `${val} years` },
    { label: 'Response Time', key: 'response_time', icon: Clock, format: (val: any) => val },
    { label: 'Completion Rate', key: 'completion_rate', icon: Check, format: (val: any) => `${val}%` },
    { label: 'Location', key: 'location', icon: MapPin, format: (val: any) => val }
  ];

  const getBestValue = (key: string, helpers: Helper[]): any => {
    if (key === 'hourly_rate') {
      return Math.min(...helpers.map(h => h[key] as number));
    }
    if (key === 'rating' || key === 'total_reviews' || key === 'years_experience' || key === 'completion_rate') {
      return Math.max(...helpers.map(h => h[key] as number));
    }
    return null;
  };

  const isBestValue = (helper: Helper, key: string, bestValue: any): boolean => {
    if (bestValue === null) return false;
    return helper[key as keyof Helper] === bestValue;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}
    onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              Compare Helpers
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Compare up to {maxHelpers} helpers side by side
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <X size={24} />
            </button>
          )}
        </div>

        {selectedHelpers.length === 0 ? (
          <div style={{
            padding: '80px 40px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              No helpers selected
            </div>
            <div style={{ fontSize: '14px' }}>
              Add helpers to compare their rates, ratings, and qualifications
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            {/* Helper Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${selectedHelpers.length}, 1fr)`,
              gap: '16px',
              marginBottom: '32px'
            }}>
              {selectedHelpers.map((helper) => (
                <div
                  key={helper.id}
                  style={{
                    position: 'relative',
                    padding: '20px',
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeHelper(helper.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  >
                    <X size={14} />
                  </button>

                  {/* Avatar */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#10b981',
                    margin: '0 auto 16px'
                  }}>
                    {helper.name.charAt(0)}
                  </div>

                  {/* Name */}
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111827',
                    textAlign: 'center',
                    marginBottom: '4px'
                  }}>
                    {helper.name}
                  </h3>

                  {/* Service Type */}
                  <div style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    textAlign: 'center',
                    marginBottom: '12px'
                  }}>
                    {helper.service_type}
                  </div>

                  {/* Verification Badges */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {helper.verified && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        backgroundColor: '#dbeafe',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#1e40af'
                      }}>
                        <Shield size={12} />
                        Verified
                      </div>
                    )}
                    {helper.background_checked && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#15803d'
                      }}>
                        <Check size={12} />
                        Checked
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              {comparisonCategories.map((category, index) => {
                const bestValue = getBestValue(category.key, selectedHelpers);
                
                return (
                  <div
                    key={category.key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `200px repeat(${selectedHelpers.length}, 1fr)`,
                      borderBottom: index < comparisonCategories.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                  >
                    {/* Category Label */}
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderRight: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <category.icon size={18} style={{ color: '#6b7280' }} />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        {category.label}
                      </span>
                    </div>

                    {/* Values */}
                    {selectedHelpers.map((helper, helperIndex) => {
                      const value = helper[category.key as keyof Helper];
                      const isBest = isBestValue(helper, category.key, bestValue);
                      
                      return (
                        <div
                          key={helper.id}
                          style={{
                            padding: '20px',
                            backgroundColor: isBest ? '#f0fdf4' : 'white',
                            borderRight: helperIndex < selectedHelpers.length - 1 ? '1px solid #f3f4f6' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}
                        >
                          <span style={{
                            fontSize: '15px',
                            fontWeight: isBest ? 700 : 500,
                            color: isBest ? '#10b981' : '#374151',
                            textAlign: 'center'
                          }}>
                            {typeof value === 'number' ? category.format(value) : value}
                          </span>
                          {isBest && (
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              width: '20px',
                              height: '20px',
                              backgroundColor: '#10b981',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Check size={12} style={{ color: 'white' }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Specializations */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '16px'
              }}>
                Specializations
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${selectedHelpers.length}, 1fr)`,
                gap: '16px'
              }}>
                {selectedHelpers.map((helper) => (
                  <div
                    key={helper.id}
                    style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {helper.specializations.map((spec, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#374151'
                          }}
                        >
                          <Check size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                          {spec}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              marginTop: '32px',
              display: 'grid',
              gridTemplateColumns: `repeat(${selectedHelpers.length}, 1fr)`,
              gap: '16px'
            }}>
              {selectedHelpers.map((helper) => (
                <button
                  key={helper.id}
                  onClick={() => {
                    navigate(`/humans-for-hire/helper/${helper.id}`);
                    if (onClose) onClose();
                  }}
                  style={{
                    padding: '14px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  View {helper.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelperComparison;
