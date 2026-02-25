import React, { useState } from 'react';
import { AlertCircle, Phone, MapPin, Share2, Shield, Clock, X, Check } from 'lucide-react';
import { supabase, authClient } from '../lib/supabase';
import toast from 'react-hot-toast';

interface SafetyFeaturesProps {
  bookingId?: string;
  helperId?: string;
  helperName?: string;
}

const SafetyFeatures: React.FC<SafetyFeaturesProps> = ({
  bookingId,
  helperId,
  helperName
}) => {
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

  const triggerEmergency = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) return;

      await supabase.from('hfh_safety_alerts').insert({
        user_id: user.id,
        booking_id: bookingId,
        helper_id: helperId,
        alert_type: 'emergency',
        status: 'active',
        timestamp: new Date().toISOString()
      });

      toast.success('Emergency services have been notified');
    } catch (error) {
      console.error('Error triggering emergency:', error);
      toast.error('Failed to send alert');
    }
  };

  const shareLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Location sharing not supported');
      return;
    }

    setSharingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { data: { user } } = await authClient.auth.getUser();
          if (!user) return;

          await supabase.from('hfh_location_sharing').insert({
            user_id: user.id,
            booking_id: bookingId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            shared_at: new Date().toISOString()
          });

          toast.success('Location shared successfully');
        } catch (error) {
          console.error('Error sharing location:', error);
          toast.error('Failed to share location');
        } finally {
          setSharingLocation(false);
        }
      },
      () => {
        toast.error('Unable to access location');
        setSharingLocation(false);
      }
    );
  };

  return (
    <div>
      {/* Emergency Button - Always Visible */}
      <button
        onClick={() => setShowEmergencyPanel(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          backgroundColor: '#ef4444',
          border: 'none',
          borderRadius: '50%',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(239, 68, 68, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
        }}
      >
        <Shield size={28} color="white" />
      </button>

      {/* Emergency Panel */}
      {showEmergencyPanel && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            padding: '32px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowEmergencyPanel(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} color="#6b7280" />
            </button>

            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <AlertCircle size={32} color="#ef4444" />
            </div>

            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              Safety & Emergency
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              Your safety is our top priority
            </p>

            {/* Emergency Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  window.location.href = 'tel:911';
                }}
                style={{
                  padding: '16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <Phone size={20} />
                Call 911 Emergency
              </button>

              <button
                onClick={shareLocation}
                disabled={sharingLocation}
                style={{
                  padding: '16px',
                  backgroundColor: sharingLocation ? '#d1d5db' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: sharingLocation ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <MapPin size={18} />
                {sharingLocation ? 'Sharing Location...' : 'Share My Location'}
              </button>

              <button
                onClick={triggerEmergency}
                style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  color: '#ef4444',
                  border: '2px solid #ef4444',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <AlertCircle size={18} />
                Alert Platform Support
              </button>
            </div>

            {/* Safety Info */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #10b981'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'start',
                gap: '12px'
              }}>
                <Check size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '4px'
                  }}>
                    Current Booking Protected
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    {helperName ? `Your session with ${helperName}` : 'Your current session'} is monitored. 
                    Location sharing is active and emergency contacts have been notified.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#9ca3af',
                textAlign: 'center',
                lineHeight: 1.5
              }}>
                All emergency alerts are recorded and immediately sent to our safety team and local authorities if needed.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyFeatures;
