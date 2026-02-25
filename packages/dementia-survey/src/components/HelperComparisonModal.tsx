import React from 'react';
import { X, Star, MapPin, DollarSign, Clock, Shield, Award, CheckCircle, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Helper {
  id: string;
  name: string;
  location: string;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  services: string[];
  years_experience: number;
  languages: string[];
  response_time_hours: number;
  background_check_status: string;
  instant_book: boolean;
  profile_image_url: string;
  bio: string;
}

interface HelperComparisonModalProps {
  helpers: Helper[];
  onClose: () => void;
  onRemove: (helperId: string) => void;
}

const HelperComparisonModal: React.FC<HelperComparisonModalProps> = ({ helpers, onClose, onRemove }) => {
  const navigate = useNavigate();

  if (helpers.length === 0) return null;

  const comparisonRows = [
    { label: 'Hourly Rate', icon: DollarSign, getValue: (h: Helper) => `$${h.hourly_rate}/hr` },
    { label: 'Rating', icon: Star, getValue: (h: Helper) => `${h.rating.toFixed(1)} (${h.total_reviews} reviews)` },
    { label: 'Location', icon: MapPin, getValue: (h: Helper) => h.location },
    { label: 'Experience', icon: Award, getValue: (h: Helper) => `${h.years_experience}+ years` },
    { label: 'Response Time', icon: Clock, getValue: (h: Helper) => `~${h.response_time_hours} hours` },
    { label: 'Languages', icon: Globe, getValue: (h: Helper) => h.languages.join(', ') || 'English' },
    { label: 'Background Check', icon: Shield, getValue: (h: Helper) => h.background_check_status === 'approved' ? 'Verified ✓' : 'Not verified' },
    { label: 'Instant Book', icon: CheckCircle, getValue: (h: Helper) => h.instant_book ? 'Available ✓' : 'Not available' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Compare Helpers ({helpers.length})
          </h3>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: '24px',
              fontWeight: 300,
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Comparison Table */}
        <div style={{ padding: '24px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              {/* Helper Headers */}
              <thead>
                <tr>
                  <th style={{ 
                    width: '200px', 
                    textAlign: 'left', 
                    padding: '16px',
                    borderBottom: '2px solid #e5e7eb',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'white',
                    zIndex: 2
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Features</div>
                  </th>
                  {helpers.map((helper) => (
                    <th key={helper.id} style={{
                      minWidth: '250px',
                      textAlign: 'center',
                      padding: '16px',
                      borderBottom: '2px solid #e5e7eb',
                      backgroundColor: 'white'
                    }}>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => onRemove(helper.id)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={14} />
                        </button>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundColor: '#f3f4f6',
                          margin: '0 auto 12px',
                          overflow: 'hidden'
                        }}>
                          {helper.profile_image_url ? (
                            <img src={helper.profile_image_url} alt={helper.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
                              {helper.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                          {helper.name}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          {helper.services[0]}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Comparison Rows */}
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{
                      padding: '16px',
                      borderBottom: '1px solid #e5e7eb',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb',
                      zIndex: 1
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <row.icon size={16} style={{ color: '#10b981' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{row.label}</span>
                      </div>
                    </td>
                    {helpers.map((helper) => (
                      <td key={helper.id} style={{
                        padding: '16px',
                        textAlign: 'center',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#111827'
                      }}>
                        {row.getValue(helper)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Services Row */}
                <tr style={{ backgroundColor: 'white' }}>
                  <td style={{
                    padding: '16px',
                    borderBottom: '1px solid #e5e7eb',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'white',
                    zIndex: 1
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Services</div>
                  </td>
                  {helpers.map((helper) => (
                    <td key={helper.id} style={{
                      padding: '16px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        {helper.services.slice(0, 3).map((service, idx) => (
                          <span key={idx} style={{
                            padding: '4px 8px',
                            backgroundColor: '#f0fdf4',
                            color: '#059669',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500
                          }}>
                            {service}
                          </span>
                        ))}
                        {helper.services.length > 3 && (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            +{helper.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            {helpers.map((helper) => (
              <button
                key={helper.id}
                onClick={() => {
                  navigate(`/humans-for-hire/helper/${helper.id}`);
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View {helper.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperComparisonModal;
