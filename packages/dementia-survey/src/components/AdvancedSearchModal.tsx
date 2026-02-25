import React, { useState } from 'react';
import { Search, X, Check, Filter, MapPin, Calendar, DollarSign, Star, Clock, Shield } from 'lucide-react';
import { comprehensiveServices } from '../data/comprehensiveServices';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (criteria: SearchCriteria) => void;
  currentFilters?: any;
}

interface SearchCriteria {
  services: string[];
  location: string;
  priceRange: { min: number; max: number };
  availability: string[];
  rating: number;
  verifiedOnly: boolean;
  instantBooking: boolean;
  distance: number;
  languages: string[];
  experience: string;
}

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  currentFilters
}) => {
  const [selectedServices, setSelectedServices] = useState<string[]>(currentFilters?.service ? [currentFilters.service] : []);
  const [location, setLocation] = useState(currentFilters?.location || '');
  const [priceRange, setPriceRange] = useState({ 
    min: currentFilters?.minRate || 0, 
    max: currentFilters?.maxRate || 200 
  });
  const [minRating, setMinRating] = useState(currentFilters?.minRating || 0);
  const [verifiedOnly, setVerifiedOnly] = useState(currentFilters?.verifiedOnly || false);
  const [instantBooking, setInstantBooking] = useState(currentFilters?.instantBookOnly || false);
  const [distance, setDistance] = useState(currentFilters?.distance || 10);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(currentFilters?.languages || []);
  const [experience, setExperience] = useState(currentFilters?.experienceLevel || '');

  const availableLanguages = ['English', 'Spanish', 'French', 'Mandarin', 'Cantonese', 'Japanese', 'Korean', 'German', 'Italian', 'Portuguese'];
  const experienceLevels = ['Any', '1-2 years', '3-5 years', '5-10 years', '10+ years'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSearch = () => {
    onSearch({
      services: selectedServices,
      location,
      priceRange,
      availability: selectedDays,
      rating: minRating,
      verifiedOnly,
      instantBooking,
      distance,
      languages: selectedLanguages,
      experience
    });
    onClose();
  };

  const clearAll = () => {
    setSelectedServices([]);
    setLocation('');
    setPriceRange({ min: 0, max: 200 });
    setMinRating(0);
    setVerifiedOnly(false);
    setInstantBooking(false);
    setDistance(10);
    setSelectedLanguages([]);
    setExperience('');
    setSelectedDays([]);
  };

  if (!isOpen) return null;

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderRadius: '20px 20px 0 0',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Filter size={24} style={{ color: '#10b981' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Advanced Search
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={clearAll}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          {/* Services Selection */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Services ({selectedServices.length} selected)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {comprehensiveServices.map(service => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: isSelected ? '#10b981' : 'white',
                      color: isSelected ? 'white' : '#374151',
                      border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{service.name}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Distance */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Location & Distance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Location
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city or zip code"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Distance: {distance} miles
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={distance}
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Price Range
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Min: ${priceRange.min}/hr
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Max: ${priceRange.max}/hr
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Availability
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {weekDays.map(day => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isSelected ? '#10b981' : 'white',
                      color: isSelected ? 'white' : '#374151',
                      border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Languages */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Languages
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {availableLanguages.map(language => {
                const isSelected = selectedLanguages.includes(language);
                return (
                  <button
                    key={language}
                    onClick={() => toggleLanguage(language)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isSelected ? '#10b981' : 'white',
                      color: isSelected ? 'white' : '#374151',
                      border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {language}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience & Rating */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                Experience Level
              </h3>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                Minimum Rating
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[0, 3, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: minRating === rating ? '#10b981' : 'white',
                      color: minRating === rating ? 'white' : '#374151',
                      border: `2px solid ${minRating === rating ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Star size={14} fill={minRating === rating ? 'white' : 'none'} />
                    {rating}+
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
              Additional Filters
            </h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151'
              }}>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <Shield size={18} style={{ color: '#10b981' }} />
                Background Verified Only
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151'
              }}>
                <input
                  type="checkbox"
                  checked={instantBooking}
                  onChange={(e) => setInstantBooking(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <Clock size={18} style={{ color: '#10b981' }} />
                Instant Booking Available
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              style={{
                padding: '12px 32px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Search size={18} />
              Apply Filters ({selectedServices.length} services)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;
