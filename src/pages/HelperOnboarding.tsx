import React, { useState } from 'react';
import { Check, ChevronRight, Upload, Shield, Award, Camera, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UnifiedLayout from '../components/UnifiedLayout';
import { authClient, supabase } from '../lib/supabase';
import { comprehensiveServices } from '../data/comprehensiveServices';
import toast from 'react-hot-toast';

const HelperOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    services: [] as string[],
    hourlyRate: '',
    availability: '',
    bio: '',
    skills: [] as string[],
    languages: [] as string[],
    governmentId: '',
    backgroundCheckConsent: false
  });

  const steps = [
    { title: 'Welcome', icon: Users },
    { title: 'Basic Info', icon: Users },
    { title: 'Services', icon: Award },
    { title: 'Verification', icon: Shield },
    { title: 'Profile', icon: Camera },
    { title: 'Review', icon: Check }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        navigate('/humans-for-hire/auth');
        return;
      }

      const { error } = await supabase.from('hfh_helpers').insert({
        user_id: user.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.services[0],
        hourly_rate: parseInt(formData.hourlyRate),
        availability: formData.availability,
        bio: formData.bio,
        skills: formData.skills,
        languages: formData.languages,
        verified: false,
        background_checked: formData.backgroundCheckConsent
      });

      if (error) throw error;
      
      toast.success('Profile created successfully!');
      navigate('/humans-for-hire/helper/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              backgroundColor: 'white',
              border: '2px solid #10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px'
            }}>
              <Users size={48} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>
              Welcome to Humans for Hire!
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
              Join thousands of helpers earning money doing what they love
            </p>
            <button
              onClick={handleNext}
              style={{
                padding: '16px 48px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Get Started
            </button>
          </div>
        );

      case 1:
        return (
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              Basic Information
            </h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              Services & Availability
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                Select Your Services
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {comprehensiveServices.slice(0, 8).map(service => (
                  <label
                    key={service.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, services: [...formData.services, service.id] });
                        } else {
                          setFormData({ ...formData, services: formData.services.filter(s => s !== service.id) });
                        }
                      }}
                    />
                    <span style={{ fontSize: '20px' }}>{service.icon}</span>
                    <span style={{ fontSize: '14px' }}>{service.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                Hourly Rate ($)
              </label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="25"
                style={{
                  width: '200px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              Verification
            </h3>
            <div style={{
              padding: '24px',
              backgroundColor: 'white',
              border: '2px solid #10b981',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <Shield size={32} color="#10b981" />
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                    Build Trust with Clients
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Verified helpers get 3x more bookings
                  </p>
                </div>
              </div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.backgroundCheckConsent}
                  onChange={(e) => setFormData({ ...formData, backgroundCheckConsent: e.target.checked })}
                />
                <span style={{ fontSize: '14px' }}>
                  I consent to a background check
                </span>
              </label>
            </div>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'white',
                border: '2px dashed #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <Upload size={20} color="#6b7280" />
              Upload Government ID
            </button>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              Complete Your Profile
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                About You
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell clients about yourself, your experience, and what makes you great at what you do..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  justifyContent: 'center'
                }}
              >
                <Camera size={20} color="#6b7280" />
                Add Profile Photo
              </button>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  justifyContent: 'center'
                }}
              >
                <Camera size={20} color="#6b7280" />
                Add Portfolio Photos
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'white',
              border: '2px solid #10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Check size={40} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
              You're All Set!
            </h3>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
              Your profile is ready. Start accepting bookings today!
            </p>
            <button
              onClick={handleSubmit}
              style={{
                padding: '14px 32px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Complete Setup
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <UnifiedLayout>
      <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              {steps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: currentStep === index ? '#10b981' : currentStep > index ? '#10b981' : 'white',
                    border: currentStep === index || currentStep > index ? 'none' : '2px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px'
                  }}>
                    {index < currentStep ? (
                      <Check size={20} color="white" />
                    ) : (
                      <step.icon size={20} color={index <= currentStep ? 'white' : '#6b7280'} />
                    )}
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: index <= currentStep ? '#10b981' : '#6b7280',
                    fontWeight: index === currentStep ? 600 : 400
                  }}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div style={{
              height: '4px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                backgroundColor: '#10b981',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Content */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            minHeight: '400px'
          }}>
            {renderStepContent()}
          </div>

          {/* Navigation */}
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '24px'
            }}>
              <button
                onClick={handleBack}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleNext}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default HelperOnboarding;
