import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Users, Shield, Heart, Briefcase } from 'lucide-react';

const HFHFooter: React.FC = () => {
  const navigate = useNavigate();

  const footerLinks = {
    'For Clients': [
      { label: 'Browse Helpers', path: '/humans-for-hire/browse' },
      { label: 'How It Works', path: '/humans-for-hire/how-it-works' },
      { label: 'Trust & Safety', path: '/humans-for-hire/trust' },
      { label: 'Insurance', path: '/humans-for-hire/insurance' },
      { label: 'Pricing', path: '/humans-for-hire/pricing' }
    ],
    'For Helpers': [
      { label: 'Become a Helper', path: '/humans-for-hire/become-helper' },
      { label: 'Helper Dashboard', path: '/humans-for-hire/helper/dashboard' },
      { label: 'Background Checks', path: '/humans-for-hire/background-checks' },
      { label: 'Earnings', path: '/humans-for-hire/earnings' },
      { label: 'Resources', path: '/humans-for-hire/resources' }
    ],
    'Popular Services': [
      { label: 'Friends for Hire', path: '/humans-for-hire/browse?service=friends-for-hire' },
      { label: 'Pals for Hire', path: '/humans-for-hire/browse?service=pals-for-hire' },
      { label: 'Errand Services', path: '/humans-for-hire/browse?service=errand-services' },
      { label: 'Childcare', path: '/humans-for-hire/browse?service=childcare' },
      { label: 'Pet Care', path: '/humans-for-hire/browse?service=pet-care' },
      { label: 'Virtual Assistant', path: '/humans-for-hire/browse?service=virtual-assistant' }
    ],
    'Company': [
      { label: 'About Us', path: '/humans-for-hire/about' },
      { label: 'Careers', path: '/humans-for-hire/careers' },
      { label: 'Press', path: '/humans-for-hire/press' },
      { label: 'Blog', path: '/humans-for-hire/blog' },
      { label: 'Contact', path: '/humans-for-hire/contact' }
    ]
  };

  return (
    <footer style={{
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      marginTop: '80px'
    }}>
      {/* Main Footer Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '64px 24px 48px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '48px',
          marginBottom: '48px'
        }}>
          {/* Brand Column */}
          <div>
            <div 
              onClick={() => navigate('/humans-for-hire')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#10b981',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '-0.5px'
              }}>
                H4H
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#111827'
              }}>
                Humans for Hire
              </span>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: 1.6,
              marginBottom: '20px'
            }}>
              Stop hiring AI for works Humans do better. The world's first comprehensive platform for human services.
            </p>
            
            {/* Trust Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <div style={{
                padding: '6px 10px',
                backgroundColor: '#f0fdf4',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#059669',
                fontWeight: 600
              }}>
                <Shield size={14} />
                Verified
              </div>
              <div style={{
                padding: '6px 10px',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#d97706',
                fontWeight: 600
              }}>
                <Heart size={14} />
                Trusted
              </div>
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <button
                  key={index}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <Icon size={18} color="#6b7280" />
                </button>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map((link) => (
                  <li key={link.path} style={{ marginBottom: '12px' }}>
                    <button
                      onClick={() => navigate(link.path)}
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info Bar */}
        <div style={{
          padding: '24px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="#10b981" />
              <span style={{ fontSize: '14px', color: '#374151' }}>support@humansforhire.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="#10b981" />
              <span style={{ fontSize: '14px', color: '#374151' }}>1-800-HUMANS-4U</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#10b981" />
              <span style={{ fontSize: '14px', color: '#374151' }}>Available in 50+ Cities</span>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/humans-for-hire/become-helper')}
            style={{
              padding: '10px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            <Briefcase size={16} />
            Join as a Helper
          </button>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '32px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '13px',
            color: '#6b7280'
          }}>
            © 2024 Humans for Hire, Inc. All rights reserved.
          </div>
          
          <div style={{
            display: 'flex',
            gap: '24px'
          }}>
            <button
              style={{
                fontSize: '13px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Privacy Policy
            </button>
            <button
              style={{
                fontSize: '13px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Terms of Service
            </button>
            <button
              style={{
                fontSize: '13px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Cookie Policy
            </button>
            <button
              style={{
                fontSize: '13px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Accessibility
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HFHFooter;
