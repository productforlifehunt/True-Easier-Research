import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/supabase';
import { createHelperProfile, createClientProfile } from '../lib/humansForHireService';
import toast from 'react-hot-toast';
import { User, Lock, Mail, MapPin, Phone, DollarSign, Briefcase } from 'lucide-react';
import UnifiedLayout from '../components/UnifiedLayout';

const HumansForHireAuth: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'helper' | 'client'>('client');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    location: '',
    bio: '',
    hourly_rate: '',
    services: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  const services = [
    'Companionship',
    'Errands & Shopping',
    'Transportation',
    'Light Housework',
    'Meal Preparation',
    'Technology Help',
    'Pet Care',
    'Gardening'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Sign up
        const { data: authData, error: authError } = await authClient.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              user_type: userType
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create profile based on user type
          if (userType === 'helper') {
            await createHelperProfile({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              location: formData.location,
              bio: formData.bio,
              hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
              services: formData.services,
              verified: false
            });
            toast.success('Helper account created! Please check your email to verify.');
            navigate('/humans-for-hire/helper/dashboard');
          } else {
            await createClientProfile({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              location: formData.location
            });
            toast.success('Client account created! Please check your email to verify.');
            navigate('/humans-for-hire/client/dashboard');
          }
        }
      } else {
        // Login
        const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (authError) throw authError;

        toast.success('Logged in successfully!');
        
        // Check user type and redirect
        const userMetadata = authData.user?.user_metadata;
        if (userMetadata?.user_type === 'helper') {
          navigate('/humans-for-hire/helper/dashboard');
        } else {
          navigate('/humans-for-hire/client/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  return (
    <UnifiedLayout>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'white',
        display: 'flex', 
        alignItems: 'center',
        padding: '40px 20px'
      }}>
      
        <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '20px', 
            padding: '48px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              backgroundColor: '#10b981',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '32px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}>
              <User size={32} color="white" />
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#111827',
              marginBottom: '8px'
            }}>
              {mode === 'login' ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p style={{ 
              color: '#6b7280',
              fontSize: '16px'
            }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create your account to continue'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            marginBottom: '32px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            padding: '3px',
            borderRadius: '12px'
          }}>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: mode === 'login' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: mode === 'signup' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: mode === 'signup' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Sign Up
            </button>
          </div>

          {mode === 'signup' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 500,
                color: 'var(--text-primary)'
              }}>
                I want to:
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setUserType('client')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: userType === 'client' ? '#10b981' : 'white',
                    color: userType === 'client' ? 'white' : '#6b7280',
                    border: userType === 'client' ? 'none' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: userType === 'client' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <User size={18} />
                    Find Help
                  </div>
                </button>
                <button
                  onClick={() => setUserType('helper')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: userType === 'helper' ? '#10b981' : 'white',
                    color: userType === 'helper' ? 'white' : '#6b7280',
                    border: userType === 'helper' ? 'none' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: userType === 'helper' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                  }}
                >
                  <Briefcase size={18} style={{ marginRight: '8px' }} />
                  Be a Helper
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    <User size={16} style={{ marginRight: '6px' }} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    <Phone size={16} style={{ marginRight: '6px' }} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border-separator)',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    <MapPin size={16} style={{ marginRight: '6px' }} />
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border-separator)',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                {userType === 'helper' && (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        Bio
                      </label>
                      <textarea
                        required
                        placeholder="Tell clients about yourself..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid var(--border-separator)',
                          borderRadius: '8px',
                          fontSize: '16px',
                          minHeight: '100px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        <DollarSign size={16} style={{ marginRight: '6px' }} />
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        required
                        min="10"
                        max="200"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid var(--border-separator)',
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        Services Offered
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {services.map(service => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: formData.services.includes(service) ? '#2c5f2d' : 'white',
                              color: formData.services.includes(service) ? 'white' : 'var(--text-primary)',
                              border: '1px solid var(--border-separator)',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                <Mail size={16} style={{ marginRight: '6px' }} />
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-separator)',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                <Lock size={16} style={{ marginRight: '6px' }} />
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-separator)',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? '#e5e7eb' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(102, 126, 234, 0.3)'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ 
            textAlign: 'center', 
            marginTop: '20px',
            color: 'var(--text-secondary)'
          }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2c5f2d',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
      </div>
    </UnifiedLayout>
  );
};

export default HumansForHireAuth;
