import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Filter, X, Star } from 'lucide-react';

interface Helper {
  id: string;
  name: string;
  location: string;
  bio?: string;
  hourly_rate: number;
  rating: number;
  total_reviews?: number;
  profile_image_url?: string;
  services?: string[];
  [key: string]: any;
}

interface MapSearchProps {
  helpers: Helper[];
  onHelperSelect: (helper: Helper) => void;
  currentLocation?: { lat: number; lng: number };
}

const MapSearch: React.FC<MapSearchProps> = ({
  helpers,
  onHelperSelect,
  currentLocation
}) => {
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [mapCenter, setMapCenter] = useState(currentLocation || { lat: 40.7128, lng: -74.0060 });

  const handleHelperClick = (helper: Helper) => {
    setSelectedHelper(helper);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '350px 1fr',
      height: '600px',
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb'
    }}>
      {/* Sidebar */}
      <div style={{
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9fafb'
      }}>
        {/* Search Controls */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Search Radius
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="1"
                max="50"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#10b981',
                minWidth: '60px',
                textAlign: 'right'
              }}>
                {searchRadius} mi
              </span>
            </div>
          </div>

          <button
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
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
            <Navigation size={16} />
            Use My Location
          </button>
        </div>

        {/* Helper List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6b7280',
            marginBottom: '12px',
            paddingLeft: '8px'
          }}>
            {helpers.length} helpers nearby
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {helpers.map((helper) => (
              <div
                key={helper.id}
                onClick={() => {
                  handleHelperClick(helper);
                  onHelperSelect(helper);
                }}
                style={{
                  padding: '12px',
                  backgroundColor: selectedHelper?.id === helper.id ? '#f0fdf4' : 'white',
                  border: `1px solid ${selectedHelper?.id === helper.id ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (selectedHelper?.id !== helper.id) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedHelper?.id !== helper.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <img
                    src={helper.profile_image || `https://ui-avatars.com/api/?name=${helper.name}&background=10b981&color=fff`}
                    alt={helper.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111827',
                      marginBottom: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {helper.name}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginBottom: '4px'
                    }}>
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>
                        {helper.rating}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        ({helper.total_reviews})
                      </span>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#10b981'
                    }}>
                      ${helper.hourly_rate}/hr
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div style={{
        position: 'relative',
        backgroundColor: '#f3f4f6'
      }}>
        {/* Placeholder Map */}
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
          color: '#9ca3af'
        }}>
          <MapPin size={64} color="#9ca3af" />
          <div style={{
            textAlign: 'center',
            maxWidth: '400px',
            padding: '0 20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              Interactive Map View
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#9ca3af',
              lineHeight: 1.5
            }}>
              This feature shows helpers on an interactive map based on their location. 
              Click on map markers to view helper details and book instantly.
            </p>
          </div>

          {/* Mock Map Markers */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none'
          }}>
            {helpers.slice(0, 10).map((helper, index) => (
              <div
                key={helper.id}
                style={{
                  position: 'absolute',
                  left: `${20 + (index % 4) * 20}%`,
                  top: `${20 + Math.floor(index / 4) * 25}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: selectedHelper?.id === helper.id ? '#10b981' : 'white',
                  borderRadius: '50%',
                  border: '3px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
                onClick={() => {
                  handleHelperClick(helper);
                  onHelperSelect(helper);
                }}>
                  <span style={{
                    fontSize: '18px'
                  }}>
                    👤
                  </span>
                </div>
                <div style={{
                  width: '2px',
                  height: '16px',
                  backgroundColor: '#10b981',
                  margin: '0 auto'
                }} />
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  margin: '0 auto'
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Selected Helper Card */}
        {selectedHelper && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setSelectedHelper(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
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

            <div style={{ display: 'flex', gap: '16px' }}>
              <img
                src={selectedHelper.profile_image || `https://ui-avatars.com/api/?name=${selectedHelper.name}&background=10b981&color=fff`}
                alt={selectedHelper.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {selectedHelper.name}
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px'
                }}>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedHelper.rating}
                  </span>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    ({selectedHelper.total_reviews} reviews)
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px'
                }}>
                  <MapPin size={14} color="#6b7280" />
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    {selectedHelper.location}
                  </span>
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#10b981'
                }}>
                  ${selectedHelper.hourly_rate}/hr
                </div>
              </div>
            </div>

            <button
              onClick={() => onHelperSelect(selectedHelper)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              View Profile
            </button>
          </div>
        )}

        {/* Map Controls */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 600,
            color: '#374151'
          }}>
            +
          </button>
          <button style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 600,
            color: '#374151'
          }}>
            −
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapSearch;
