import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchServices, serviceCategories } from '../lib/serviceCategories';
import { supabase } from '../lib/supabase';

interface SearchSuggestion {
  type: 'service' | 'helper' | 'location' | 'recent';
  text: string;
  subtitle?: string;
  icon?: React.ReactNode;
  data?: any;
}

interface SmartSearchProps {
  onSearch?: (query: string, filters?: any) => void;
  placeholder?: string;
  autofocus?: boolean;
  showSuggestions?: boolean;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  onSearch,
  placeholder = 'Search for any service, helper, or task...',
  autofocus = false,
  showSuggestions = true
}) => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    'Babysitter for tonight',
    'Dog walker near me',
    'House cleaning service',
    'Senior companion',
    'Grocery shopping help',
    'Math tutor',
    'Personal driver',
    'Pet sitting'
  ]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('hfh_recent_searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate suggestions based on query
  useEffect(() => {
    const generateSuggestions = async () => {
      if (!query.trim()) {
        // Show default suggestions when empty
        const defaultSuggestions: SearchSuggestion[] = [];
        
        // Add recent searches
        recentSearches.slice(0, 3).forEach(search => {
          defaultSuggestions.push({
            type: 'recent',
            text: search,
            icon: <Clock size={16} />
          });
        });
        
        // Add popular searches
        popularSearches.slice(0, 5).forEach(search => {
          defaultSuggestions.push({
            type: 'service',
            text: search,
            icon: <TrendingUp size={16} />
          });
        });
        
        setSuggestions(defaultSuggestions);
        return;
      }

      const newSuggestions: SearchSuggestion[] = [];
      const lowerQuery = query.toLowerCase();

      // Search through service categories
      const matchingServices = searchServices(query);
      matchingServices.slice(0, 3).forEach(category => {
        // Add main category
        newSuggestions.push({
          type: 'service',
          text: category.name,
          subtitle: category.description,
          data: { categoryId: category.id }
        });

        // Add matching subcategories
        category.subcategories
          .filter(sub => 
            sub.name.toLowerCase().includes(lowerQuery) ||
            sub.description.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 2)
          .forEach(sub => {
            newSuggestions.push({
              type: 'service',
              text: sub.name,
              subtitle: `${category.name} • $${sub.priceRange.min}-$${sub.priceRange.max}/hr`,
              data: { categoryId: category.id, subcategoryId: sub.id }
            });
          });
      });

      // Search for helpers (real database search)
      try {
        const { data: helpers } = await supabase
          .from('hfh_helpers')
          .select('id, name, location, rating, hourly_rate, services')
          .or(`name.ilike.%${query}%,services.cs.{${query}}`)
          .limit(3);

        if (helpers && helpers.length > 0) {
          helpers.forEach(helper => {
            newSuggestions.push({
              type: 'helper',
              text: helper.name,
              subtitle: `${helper.location} • $${helper.hourly_rate}/hr • ⭐ ${helper.rating}`,
              icon: <Star size={16} />,
              data: { helperId: helper.id }
            });
          });
        }
      } catch (error) {
        console.error('Error searching helpers:', error);
      }

      // Add location-based suggestion if it looks like a location
      const locationKeywords = ['near', 'in', 'at', 'around'];
      const hasLocationKeyword = locationKeywords.some(keyword => 
        lowerQuery.includes(keyword)
      );
      
      if (hasLocationKeyword) {
        newSuggestions.push({
          type: 'location',
          text: query,
          subtitle: 'Search in this area',
          icon: <MapPin size={16} />
        });
      }

      setSuggestions(newSuggestions);
    };

    generateSuggestions();
  }, [query, recentSearches, popularSearches]);

  const handleSearch = (searchText?: string) => {
    const searchQuery = searchText || query;
    
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('hfh_recent_searches', JSON.stringify(updated));

    // Close dropdown
    setShowDropdown(false);

    // Execute search
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Default behavior: navigate to browse with search params
      navigate(`/humans-for-hire/browse?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'helper' && suggestion.data?.helperId) {
      navigate(`/humans-for-hire/helper/${suggestion.data.helperId}`);
    } else if (suggestion.type === 'service' && suggestion.data?.categoryId) {
      navigate(`/humans-for-hire/browse?category=${suggestion.data.categoryId}`);
    } else {
      setQuery(suggestion.text);
      handleSearch(suggestion.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '0 16px',
        height: '48px',
        transition: 'all 0.2s',
        ...(showDropdown && { 
          borderColor: '#10b981',
          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
        })
      }}>
        <Search size={20} style={{ color: '#6b7280', marginRight: '12px', flexShrink: 0 }} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autofocus}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            color: '#111827',
            backgroundColor: 'transparent'
          }}
        />

        {query && (
          <button
            onClick={clearSearch}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#374151'}
            onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            <X size={18} />
          </button>
        )}

        <button
          onClick={() => handleSearch()}
          style={{
            marginLeft: '12px',
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Search
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e5e7eb',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: selectedIndex === index ? '#f3f4f6' : 'transparent',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background-color 0.1s'
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 
                selectedIndex === index ? '#f3f4f6' : 'transparent'
              }
            >
              <div style={{ color: '#6b7280' }}>
                {suggestion.icon || <Search size={16} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '15px', 
                  fontWeight: 500, 
                  color: '#111827',
                  marginBottom: suggestion.subtitle ? '2px' : 0
                }}>
                  {suggestion.text}
                </div>
                {suggestion.subtitle && (
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {suggestion.subtitle}
                  </div>
                )}
              </div>

              {suggestion.type === 'recent' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = recentSearches.filter(s => s !== suggestion.text);
                    setRecentSearches(updated);
                    localStorage.setItem('hfh_recent_searches', JSON.stringify(updated));
                  }}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
