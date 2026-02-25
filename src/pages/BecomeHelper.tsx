import React, { useState } from 'react';
import { CheckCircle, Upload, Shield, DollarSign, Clock, Award, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UnifiedLayout from '../components/UnifiedLayout';
import toast from 'react-hot-toast';
import { supabase, authClient } from '../lib/supabase';

const BecomeHelper: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    
    // Location & Availability
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    availability: [] as string[],
    max_travel_distance: '10',
    
    // Services & Skills
    primary_service: '',
    services: [] as string[],
    hourly_rate: '',
    years_of_experience: '',
    skills: [] as string[],
    languages: [] as string[],
    
    // Bio & Media
    bio: '',
    why_helper: '',
    profile_photo: null as File | null,
    additional_photos: [] as File[],
    background_check_consent: false,
    terms_consent: false
  });

  const services = [
    'Rent a Friend', 'Tour Guide', 'Errand Services', 'Pet Care',
    'Childcare', 'Senior Care', 'Housekeeping', 'Handyman',
    'Virtual Assistant', 'Moving Help', 'Personal Training',
    'Event Help', 'Tech Support', 'Beauty & Wellness',
    'Lessons & Tutoring'
  ];

  const availabilityOptions = [
    'Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings',
    'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings',
    'Available Now', 'Flexible Schedule'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleArrayToggle = (field: string, value: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[];
    if (currentArray.includes(value)) {
      handleInputChange(field, currentArray.filter(v => v !== value));
    } else {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const handleFileUpload = (field: string, file: File) => {
    if (field === 'profile_photo') {
      handleInputChange('profile_photo', file);
    } else if (field === 'additional_photos') {
      handleInputChange('additional_photos', [...formData.additional_photos, file]);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
          toast.error('Please fill in all required personal information');
          return false;
        }
        break;
      case 2:
        if (!formData.city || !formData.state || formData.availability.length === 0) {
          toast.error('Please complete location and availability');
          return false;
        }
        break;
      case 3:
        if (!formData.primary_service || formData.services.length === 0 || !formData.hourly_rate) {
          toast.error('Please select services and set your rate');
          return false;
        }
        break;
      case 4:
        if (!formData.bio || !formData.why_helper) {
          toast.error('Please complete your profile');
          return false;
        }
        break;
      case 5:
        if (!formData.background_check_consent || !formData.terms_consent) {
          toast.error('Please agree to background check and terms');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    try {
      // In real app, upload to database
      toast.success('Application submitted successfully! We\'ll review and get back to you within 24 hours.');
      navigate('/humans-for-hire');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    }
  };

  return (
    <UnifiedLayout>
      <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '40px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              {[1, 2, 3, 4, 5].map((index, num) => (
                <div key={num} style={{
                  width: '18%',
                  height: '4px',
                  backgroundColor: step === index ? '#10b981' : step > index ? '#10b981' : 'white',
                  border: step === index || step > index ? 'none' : '2px solid #e5e7eb',
                  borderRadius: '2px',
                  transition: 'background-color 0.3s'
                }} />
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
              Step {step} of 5
            </div>
          </div>

          {/* Form Container */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  Personal Information
                </h2>
                <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
                  Tell us about yourself
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      Gender Identity
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="cis-male">Cis Male</option>
                      <option value="trans-male">Trans Male</option>
                      <option value="cis-female">Cis Female</option>
                      <option value="trans-female">Trans Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-say">Prefer Not to Say</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Availability */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  Location & Availability
                </h2>
                <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
                  Where and when can you help?
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.street_address}
                    onChange={(e) => handleInputChange('street_address', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
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

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                    Maximum Travel Distance
                  </label>
                  <select
                    value={formData.max_travel_distance}
                    onChange={(e) => handleInputChange('max_travel_distance', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="5">5 miles</option>
                    <option value="10">10 miles</option>
                    <option value="25">25 miles</option>
                    <option value="50">50 miles</option>
                    <option value="100">100 miles</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                    Availability *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {availabilityOptions.map(option => (
                      <label
                        key={option}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: 'white',
                          borderColor: formData.availability.includes(option) ? '#10b981' : '#e5e7eb',
                          borderWidth: formData.availability.includes(option) ? '2px' : '1px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.availability.includes(option)}
                          onChange={() => handleArrayToggle('availability', option)}
                        />
                        <span style={{ fontSize: '14px' }}>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Services & Pricing */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  Services & Pricing
                </h2>
                <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
                  What services do you offer?
                </p>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                    Primary Service *
                  </label>
                  <select
                    value={formData.primary_service}
                    onChange={(e) => handleInputChange('primary_service', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select primary service...</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                    Additional Services *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {services.map(service => (
                      <label
                        key={service}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: 'white',
                          borderColor: formData.services.includes(service) ? '#10b981' : '#e5e7eb',
                          borderWidth: formData.services.includes(service) ? '2px' : '1px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service)}
                          onChange={() => handleArrayToggle('services', service)}
                        />
                        <span style={{ fontSize: '14px' }}>{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      Hourly Rate * ($)
                    </label>
                    <input
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                      placeholder="50"
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      Years of Experience
                    </label>
                    <select
                      value={formData.years_of_experience}
                      onChange={(e) => handleInputChange('years_of_experience', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="<1">Less than 1 year</option>
                      <option value="1-2">1-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
              {step > 1 && (
                <button
                  onClick={handleBack}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
              )}
              {step < 5 ? (
                <button
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  Continue
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle size={20} />
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default BecomeHelper;
