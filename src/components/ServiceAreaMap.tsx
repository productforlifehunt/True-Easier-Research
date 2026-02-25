import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Home } from 'lucide-react';

interface ServiceAreaMapProps {
  centerLat?: number;
  centerLng?: number;
  radius?: number; // in miles
  helperLocation?: { lat: number; lng: number };
  serviceAreas?: { name: string; coordinates: [number, number][] }[];
}

const ServiceAreaMap: React.FC<ServiceAreaMapProps> = ({
  centerLat = 37.7749,
  centerLng = -122.4194,
  radius = 10,
  helperLocation,
  serviceAreas = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In production, integrate with Google Maps or Mapbox
    // For now, show a styled placeholder with service area info
  }, [centerLat, centerLng, radius]);

  return (
    <div style={{
      width: '100%',
      height: '300px',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div ref={mapRef} style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#ffffff'
      }}>
        {/* Map Placeholder */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '2px dashed #10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(16, 185, 129, 0.05)'
        }}>
          <div style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            border: '2px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <MapPin size={24} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                {radius} mi
              </span>
            </div>
          </div>
        </div>

        {/* Service Area Info */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Navigation size={16} style={{ color: '#10b981' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
              Service Area
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Within {radius} miles of your location
            </div>
          </div>
          {helperLocation && (
            <div style={{
              padding: '6px 10px',
              backgroundColor: '#f0fdf4',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#10b981'
            }}>
              Available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceAreaMap;
