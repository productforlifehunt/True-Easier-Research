import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, HelpCircle, Bell, Home, Search, Plus, Menu, X, ShoppingBag, MapPin, Heart, Users, Baby, Dog, Calendar, Activity, Laptop, UserCheck, BookOpen, ChevronDown, MessageSquare, Star, Wrench, Briefcase, Coffee } from 'lucide-react';
import { authClient } from '../lib/supabase';

const HFHHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    checkUser();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const handleSignOut = async () => {
    await authClient.auth.signOut();
    setUser(null);
    navigate('/humans-for-hire');
  };

  const serviceCategories = {
    'Human Connections': [
      { icon: Users, label: 'Friends for Hire', path: '/humans-for-hire/browse?service=friends-for-hire', highlight: true },
      { icon: UserCheck, label: 'Pals for Hire', path: '/humans-for-hire/browse?service=pals-for-hire', highlight: true },
      { icon: Heart, label: 'Event Companions', path: '/humans-for-hire/browse?service=event-companion' },
      { icon: MapPin, label: 'Tour Guides', path: '/humans-for-hire/browse?service=tour-guide' },
      { icon: Users, label: 'Walking Companions', path: '/humans-for-hire/browse?service=walking-companion' },
      { icon: Users, label: 'Activity Partners', path: '/humans-for-hire/browse?service=activity-partner' }
    ],
    'Errands & Tasks': [
      { icon: ShoppingBag, label: 'Errand Services', path: '/humans-for-hire/browse?service=errand-services', highlight: true },
      { icon: ShoppingBag, label: 'Grocery Shopping', path: '/humans-for-hire/browse?service=grocery-shopping' },
      { icon: ShoppingBag, label: 'Package Services', path: '/humans-for-hire/browse?service=package-services' },
      { icon: Laptop, label: 'Virtual Assistant', path: '/humans-for-hire/browse?service=virtual-assistant' }
    ],
    'Home & Family': [
      { icon: Baby, label: 'Childcare', path: '/humans-for-hire/browse?service=childcare' },
      { icon: Users, label: 'Senior Care', path: '/humans-for-hire/browse?service=senior-care' },
      { icon: Dog, label: 'Pet Care', path: '/humans-for-hire/browse?service=pet-care' },
      { icon: Coffee, label: 'Housekeeping', path: '/humans-for-hire/browse?service=housekeeping' },
      { icon: Wrench, label: 'Handyman', path: '/humans-for-hire/browse?service=handyman' }
    ],
    'Personal Services': [
      { icon: BookOpen, label: 'Tutoring', path: '/humans-for-hire/browse?service=tutoring' },
      { icon: Heart, label: 'Personal Training', path: '/humans-for-hire/browse?service=personal-training' },
      { icon: Heart, label: 'Beauty & Wellness', path: '/humans-for-hire/browse?service=beauty-wellness' },
      { icon: Briefcase, label: 'Event Help', path: '/humans-for-hire/browse?service=event-help' }
    ]
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'white',
      borderBottom: '1px solid #e5e7eb',
      zIndex: 1000,
      backdropFilter: isScrolled ? 'blur(10px)' : 'none',
      transition: 'all 0.3s'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div 
            onClick={() => navigate('/humans-for-hire')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}
          >
            {/* H4H Square Logo */}
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#10b981',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
            }}>
              H4H
            </div>
            <span style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#111827'
            }}>
              Humans for Hire
            </span>
          </div>

          {/* Navigation */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px'
          }}>
            {/* Browse Dropdown */}
            <div 
              style={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setActiveDropdown('browse')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#374151',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Browse Services
                <ChevronDown size={16} />
              </button>
              
              {activeDropdown === 'browse' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '-50px',
                  marginTop: '12px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  padding: '20px',
                  minWidth: '700px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '32px',
                  zIndex: 99999
                }}>
                  {Object.entries(serviceCategories).map(([category, services]) => (
                    <div key={category}>
                      <h3 style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#6b7280',
                        marginBottom: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {category}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {services.map(service => (
                          <button
                            key={service.path}
                            onClick={() => {
                              navigate(service.path);
                              setActiveDropdown(null);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              backgroundColor: service.highlight ? '#f0fdf4' : 'white',
                              border: service.highlight ? '1px solid #10b981' : 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontSize: '14px',
                              fontWeight: service.highlight ? 600 : 500,
                              color: service.highlight ? '#10b981' : '#374151',
                              textAlign: 'left'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = service.highlight ? '#f0fdf4' : 'white';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <service.icon size={16} />
                            {service.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


            <button
              onClick={() => navigate('/humans-for-hire/how-it-works')}
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#374151',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              How It Works
            </button>

            <button
              onClick={() => navigate('/humans-for-hire/become-helper')}
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#374151',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Become a Helper
            </button>
          </nav>

          {/* User Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            {user ? (
              <>
                <button
                  onClick={() => navigate('/humans-for-hire/messages')}
                  style={{
                    position: 'relative',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '8px'
                  }}
                >
                  <MessageSquare size={20} color="#6b7280" />
                </button>
                
                <button
                  style={{
                    position: 'relative',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '8px'
                  }}
                >
                  <Bell size={20} color="#6b7280" />
                </button>

                <div 
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setActiveDropdown('user')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    style={{
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: '1px solid #e5e7eb',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <User size={20} color="#6b7280" />
                  </button>
                  {activeDropdown === 'user' && (
<div style={{
position: 'absolute',
top: '100%',
right: 0,
marginTop: '8px',
width: '200px',
backgroundColor: 'white',
borderRadius: '8px',
boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
border: '1px solid #e5e7eb',
padding: '8px',
}}>
<button
onClick={() => navigate('/humans-for-hire/client/dashboard')}
style={{
width: '100%',
padding: '10px 12px',
display: 'flex',
alignItems: 'center',
gap: '8px',
backgroundColor: 'transparent',
border: 'none',
borderRadius: '6px',
fontSize: '14px',
color: '#374151',
cursor: 'pointer',
textAlign: 'left'
}}
>
<Calendar size={16} />
My Bookings
</button>
<button
onClick={() => navigate('/humans-for-hire/helper/dashboard')}
style={{
width: '100%',
padding: '10px 12px',
display: 'flex',
alignItems: 'center',
gap: '8px',
backgroundColor: 'transparent',
border: 'none',
borderRadius: '6px',
fontSize: '14px',
color: '#374151',
cursor: 'pointer',
textAlign: 'left'
}}
>
<Briefcase size={16} />
Helper Dashboard
</button>
<div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />
<button
onClick={handleSignOut}
style={{
width: '100%',
padding: '10px 12px',
display: 'flex',
alignItems: 'center',
gap: '8px',
backgroundColor: 'transparent',
border: 'none',
borderRadius: '6px',
fontSize: '14px',
color: '#ef4444',
cursor: 'pointer',
textAlign: 'left'
}}
>
<LogOut size={16} />
Sign Out
</button>
</div>
)}
</div>
</>
) : (
<>
<button
onClick={() => navigate('/humans-for-hire/auth')}
style={{
padding: '8px 20px',
backgroundColor: 'transparent',
color: '#374151',
border: 'none',
borderRadius: '8px',
fontSize: '15px',
fontWeight: 500,
cursor: 'pointer'
}}
>
Sign In
</button>
<button
onClick={() => navigate('/humans-for-hire/auth')}
style={{
padding: '8px 20px',
backgroundColor: '#10b981',
color: 'white',
border: 'none',
borderRadius: '8px',
fontSize: '15px',
fontWeight: 600,
cursor: 'pointer',
transition: 'all 0.2s'
}}
onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
>
Get Started
</button>
</>
)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HFHHeader;
