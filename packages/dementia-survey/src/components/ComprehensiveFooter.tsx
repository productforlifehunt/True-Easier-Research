import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, ShoppingBag, Map, Baby, Dog, Home, Wrench, Monitor, Package, Dumbbell, PartyPopper, Laptop, Sparkles, GraduationCap } from 'lucide-react';
import { comprehensiveServices } from '../data/comprehensiveServices';

const ComprehensiveFooter: React.FC = () => {
  const navigate = useNavigate();
  
  const featuredServices = comprehensiveServices.filter(s => s.featured);
  const additionalServices = comprehensiveServices.filter(s => !s.featured);

  return (
    <footer style={{
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '60px 24px 40px',
      marginTop: '80px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand Section */}
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: 'white'
              }}>H4H</div>
              Humans for Hire
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '16px' }}>
              Stop hiring AI for works Humans do better
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
              Humans don't hallucinate • 100% real expertise
            </p>
          </div>

          {/* Featured Services */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Featured Services
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {featuredServices.map(service => (
                <button
                  key={service.id}
                  onClick={() => navigate(`/humans-for-hire/browse?service=${service.id}`)}
                  style={{
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 0',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>

          {/* Care Services */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Care Services
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['childcare', 'senior-care', 'pet-care'].map(serviceId => {
                const service = comprehensiveServices.find(s => s.id === serviceId);
                return service ? (
                  <button
                    key={service.id}
                    onClick={() => navigate(`/humans-for-hire/browse?service=${service.id}`)}
                    style={{
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#6b7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                  >
                    {service.name}
                  </button>
                ) : null;
              })}
            </div>
          </div>

          {/* Home Services */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Home Services
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['housekeeping', 'handyman', 'moving-help'].map(serviceId => {
                const service = comprehensiveServices.find(s => s.id === serviceId);
                return service ? (
                  <button
                    key={service.id}
                    onClick={() => navigate(`/humans-for-hire/browse?service=${service.id}`)}
                    style={{
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#6b7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                  >
                    {service.name}
                  </button>
                ) : null;
              })}
            </div>
          </div>

          {/* Professional Services */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Professional
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['virtual-assistant', 'tech-support', 'lessons-tutoring'].map(serviceId => {
                const service = comprehensiveServices.find(s => s.id === serviceId);
                return service ? (
                  <button
                    key={service.id}
                    onClick={() => navigate(`/humans-for-hire/browse?service=${service.id}`)}
                    style={{
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#6b7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                  >
                    {service.name}
                  </button>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>
            © 2025 Humans for Hire. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              style={{
                fontSize: '13px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
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
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate('/humans-for-hire/browse')}
              style={{
                fontSize: '13px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Browse All Services
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ComprehensiveFooter;
