import React, { useState } from 'react';
import { 
  Filter, Search, MapPin, DollarSign, Star, Shield, Clock, 
  Users, Calendar, Globe, Briefcase, Heart, Baby, Dog, Home,
  Car, BookOpen, Laptop, ShoppingBag, Coffee, Camera, Music,
  Wrench, ChevronDown, ChevronUp, X
} from 'lucide-react';

interface ComprehensiveFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  onClose?: () => void;
}

const ComprehensiveFilters: React.FC<ComprehensiveFiltersProps> = ({
  filters,
  onFilterChange,
  onClose
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['services', 'availability']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Service categories matching competitors
  const serviceCategories = [
    { id: 'childcare', name: 'Childcare & Babysitting', icon: Baby, count: 156 },
    { id: 'senior-care', name: 'Senior & Elder Care', icon: Heart, count: 89 },
    { id: 'pet-care', name: 'Pet Care & Walking', icon: Dog, count: 124 },
    { id: 'friends-for-hire', name: 'Friends for Hire', icon: Users, count: 67 },
    { id: 'pals-for-hire', name: 'Pals for Hire (Senior Companions)', icon: Coffee, count: 45 },
    { id: 'errand-services', name: 'Errand Services', icon: ShoppingBag, count: 203 },
    { id: 'house-sitting', name: 'House Sitting', icon: Home, count: 78 },
    { id: 'tutoring', name: 'Tutoring & Lessons', icon: BookOpen, count: 92 },
    { id: 'virtual-assistant', name: 'Virtual Assistant', icon: Laptop, count: 64 },
    { id: 'tour-guide', name: 'Local Tour Guide', icon: Camera, count: 51 },
    { id: 'transportation', name: 'Transportation & Rides', icon: Car, count: 87 },
    { id: 'odd-jobs', name: 'Odd Jobs & Handyman', icon: Wrench, count: 145 },
    { id: 'event-companion', name: 'Event Companion', icon: Music, count: 38 },
    { id: 'personal-training', name: 'Fitness & Wellness', icon: Heart, count: 73 },
    { id: 'moving-help', name: 'Moving & Packing', icon: Briefcase, count: 96 }
  ];

  // Gender options with inclusive categories
  const genderOptions = [
    { id: 'all', name: 'All Genders' },
    { id: 'male', name: 'Male (All)', group: true },
    { id: 'cis-male', name: 'Cis Male', indent: true },
    { id: 'trans-male', name: 'Trans Male', indent: true },
    { id: 'female', name: 'Female (All)', group: true },
    { id: 'cis-female', name: 'Cis Female', indent: true },
    { id: 'trans-female', name: 'Trans Female', indent: true },
    { id: 'non-binary', name: 'Non-Binary' },
    { id: 'genderfluid', name: 'Genderfluid' },
    { id: 'agender', name: 'Agender' }
  ];

  // Languages
  const languages = [
    'English', 'Spanish', 'French', 'Mandarin', 'Cantonese', 
    'Arabic', 'Hindi', 'Portuguese', 'Russian', 'Japanese',
    'Korean', 'German', 'Italian', 'Vietnamese', 'Tagalog'
  ];

  // Availability options
  const availabilityOptions = [
    { id: 'now', name: 'Available Now' },
    { id: 'today', name: 'Available Today' },
    { id: 'tomorrow', name: 'Available Tomorrow' },
    { id: 'weekdays', name: 'Weekdays' },
    { id: 'weekends', name: 'Weekends' },
    { id: 'evenings', name: 'Evenings' },
    { id: 'overnight', name: 'Overnight' },
    { id: 'emergency', name: '24/7 Emergency' }
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: '320px',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={20} style={{ color: '#10b981' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            Filters
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={20} style={{ color: '#6b7280' }} />
          </button>
        )}
      </div>

      {/* Services Section */}
      <div style={{ borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => toggleSection('services')}
          style={{
            width: '100%',
            padding: '16px 20px',
            backgroundColor: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151'
          }}
        >
          Services
          {expandedSections.includes('services') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.includes('services') && (
          <div style={{ padding: '0 20px 20px' }}>
            {serviceCategories.map(service => {
              const Icon = service.icon;
              const isSelected = filters.services?.includes(service.id);
              return (
                <label
                  key={service.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#374151'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={isSelected || false}
                      onChange={() => {
                        const newServices = isSelected
                          ? filters.services.filter((s: string) => s !== service.id)
                          : [...(filters.services || []), service.id];
                        onFilterChange({ ...filters, services: newServices });
                      }}
                      style={{ accentColor: '#10b981' }}
                    />
                    <Icon size={16} style={{ color: '#6b7280' }} />
                    <span>{service.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                    ({service.count})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div style={{ borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => toggleSection('price')}
          style={{
            width: '100%',
            padding: '16px 20px',
            backgroundColor: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151'
          }}
        >
          Price Range
          {expandedSections.includes('price') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.includes('price') && (
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '8px' }}>
                Hourly Rate: ${filters.minRate || 0} - ${filters.maxRate || 200}
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.maxRate || 200}
                onChange={(e) => onFilterChange({ ...filters, maxRate: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => onFilterChange({ ...filters, minRate: 0, maxRate: 30 })}
                style={{
                  padding: '8px',
                  backgroundColor: filters.maxRate === 30 ? '#10b981' : 'white',
                  color: filters.maxRate === 30 ? 'white' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Under $30
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, minRate: 30, maxRate: 60 })}
                style={{
                  padding: '8px',
                  backgroundColor: filters.minRate === 30 && filters.maxRate === 60 ? '#10b981' : 'white',
                  color: filters.minRate === 30 && filters.maxRate === 60 ? 'white' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                $30-$60
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, minRate: 60, maxRate: 100 })}
                style={{
                  padding: '8px',
                  backgroundColor: filters.minRate === 60 && filters.maxRate === 100 ? '#10b981' : 'white',
                  color: filters.minRate === 60 && filters.maxRate === 100 ? 'white' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                $60-$100
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, minRate: 100, maxRate: 200 })}
                style={{
                  padding: '8px',
                  backgroundColor: filters.minRate === 100 ? '#10b981' : 'white',
                  color: filters.minRate === 100 ? 'white' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                $100+
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Availability Section */}
      <div style={{ borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => toggleSection('availability')}
          style={{
            width: '100%',
            padding: '16px 20px',
            backgroundColor: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151'
          }}
        >
          Availability
          {expandedSections.includes('availability') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.includes('availability') && (
          <div style={{ padding: '0 20px 20px' }}>
            {availabilityOptions.map(option => (
              <label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 0',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#374151'
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.availability?.includes(option.id) || false}
                  onChange={() => {
                    const newAvailability = filters.availability?.includes(option.id)
                      ? filters.availability.filter((a: string) => a !== option.id)
                      : [...(filters.availability || []), option.id];
                    onFilterChange({ ...filters, availability: newAvailability });
                  }}
                  style={{ accentColor: '#10b981', marginRight: '10px' }}
                />
                {option.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Gender Section */}
      <div style={{ borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => toggleSection('gender')}
          style={{
            width: '100%',
            padding: '16px 20px',
            backgroundColor: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151'
          }}
        >
          Gender Preference
          {expandedSections.includes('gender') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.includes('gender') && (
          <div style={{ padding: '0 20px 20px' }}>
            {genderOptions.map(option => (
              <label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 0',
                  paddingLeft: option.indent ? '24px' : '0',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: option.group ? '#111827' : '#374151',
                  fontWeight: option.group ? 600 : 400
                }}
              >
                <input
                  type="radio"
                  name="gender"
                  checked={filters.gender === option.id}
                  onChange={() => onFilterChange({ ...filters, gender: option.id })}
                  style={{ accentColor: '#10b981', marginRight: '10px' }}
                />
                {option.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Languages Section */}
      <div style={{ borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => toggleSection('languages')}
          style={{
            width: '100%',
            padding: '16px 20px',
            backgroundColor: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151'
          }}
        >
          Languages
          {expandedSections.includes('languages') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.includes('languages') && (
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {languages.map(lang => {
                const isSelected = filters.languages?.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      const newLangs = isSelected
                        ? filters.languages.filter((l: string) => l !== lang)
                        : [...(filters.languages || []), lang];
                      onFilterChange({ ...filters, languages: newLangs });
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: isSelected ? '#10b981' : 'white',
                      color: isSelected ? 'white' : '#374151',
                      border: `1px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '16px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Additional Filters */}
      <div style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
          Additional Filters
        </h4>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 0',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={filters.verifiedOnly || false}
            onChange={(e) => onFilterChange({ ...filters, verifiedOnly: e.target.checked })}
            style={{ accentColor: '#10b981', marginRight: '10px' }}
          />
          <Shield size={14} style={{ color: '#10b981', marginRight: '6px' }} />
          Background Verified Only
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 0',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={filters.instantBookOnly || false}
            onChange={(e) => onFilterChange({ ...filters, instantBookOnly: e.target.checked })}
            style={{ accentColor: '#10b981', marginRight: '10px' }}
          />
          <Clock size={14} style={{ color: '#10b981', marginRight: '6px' }} />
          Instant Book Available
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 0',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={filters.hasVideo || false}
            onChange={(e) => onFilterChange({ ...filters, hasVideo: e.target.checked })}
            style={{ accentColor: '#10b981', marginRight: '10px' }}
          />
          Has Video Introduction
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 0',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={filters.acceptsOffers || false}
            onChange={(e) => onFilterChange({ ...filters, acceptsOffers: e.target.checked })}
            style={{ accentColor: '#10b981', marginRight: '10px' }}
          />
          Accepts Price Negotiation
        </label>
      </div>

      {/* Clear All Button */}
      <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
        <button
          onClick={() => onFilterChange({})}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'white',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default ComprehensiveFilters;
