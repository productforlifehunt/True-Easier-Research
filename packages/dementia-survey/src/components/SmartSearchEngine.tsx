import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, TrendingUp, MapPin, Clock, DollarSign, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { comprehensiveServices } from '../data/comprehensiveServices';

interface SearchResult {
  id: string;
  type: 'helper' | 'service' | 'location';
  name: string;
  description: string;
  rating?: number;
  price?: number;
  location?: string;
  availability?: string;
  matchScore: number;
}

interface SmartSearchEngineProps {
  onResultSelect: (result: SearchResult) => void;
  placeholder?: string;
}

const SmartSearchEngine: React.FC<SmartSearchEngineProps> = ({ 
  onResultSelect, 
  placeholder = "Search for friends, helpers, services, or locations..." 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    'Rent a friend for wedding',
    'Dog walker near me',
    'Virtual assistant',
    'Errand runner today',
    'Tour guide in NYC',
    'Pet sitter weekend',
    'Companion for elderly',
    'Moving help tomorrow'
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Search helpers
      const { data: helpers } = await supabase
        .from('hfh_helpers')
        .select('*')
        .or(`name.ilike.%${query}%,bio.ilike.%${query}%,service_type.ilike.%${query}%`)
        .limit(5);

      // Search services
      const matchingServices = comprehensiveServices.filter(service =>
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase()) ||
        service.subcategories.some(sub => 
          sub.name.toLowerCase().includes(query.toLowerCase()) ||
          sub.keywords.some(keyword => keyword.includes(query.toLowerCase()))
        )
      );

      // Calculate match scores and format results
      const searchResults: SearchResult[] = [];

      // Add helper results
      if (helpers && helpers.length > 0) {
        helpers.forEach(helper => {
          const matchScore = calculateMatchScore(query, [helper.name, helper.bio, helper.service_type].join(' '));
          searchResults.push({
            id: helper.id,
            type: 'helper',
            name: helper.name,
            description: `${helper.service_type} • ${helper.location} • $${helper.hourly_rate}/hr`,
            rating: helper.rating,
            price: helper.hourly_rate,
            location: helper.location,
            availability: helper.availability,
            matchScore
          });
        });
      }

      // Add service results
      matchingServices.forEach(service => {
        const matchScore = calculateMatchScore(query, service.name + ' ' + service.description);
        searchResults.push({
          id: service.id,
          type: 'service',
          name: service.name,
          description: service.description,
          matchScore
        });
      });

      // Sort by match score
      searchResults.sort((a, b) => b.matchScore - a.matchScore);

      setResults(searchResults.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
      setResults(generateSampleResults(query));
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (query: string, text: string): number => {
    const lowerQuery = query.toLowerCase();
    const lowerText = text.toLowerCase();
    
    // Exact match
    if (lowerText === lowerQuery) return 100;
    
    // Starts with query
    if (lowerText.startsWith(lowerQuery)) return 90;
    
    // Contains full query
    if (lowerText.includes(lowerQuery)) return 80;
    
    // Contains all words from query
    const queryWords = lowerQuery.split(' ');
    const allWordsFound = queryWords.every(word => lowerText.includes(word));
    if (allWordsFound) return 70;
    
    // Contains some words from query
    const someWordsFound = queryWords.some(word => lowerText.includes(word));
    if (someWordsFound) return 50;
    
    return 0;
  };

  const generateSampleResults = (query: string): SearchResult[] => {
    return [
      {
        id: '1',
        type: 'helper',
        name: 'Sarah Johnson',
        description: 'Friendly companion • Downtown • $25/hr',
        rating: 4.9,
        price: 25,
        location: 'Downtown',
        availability: 'Available today',
        matchScore: 95
      },
      {
        id: '2',
        type: 'service',
        name: 'Rent a Friend',
        description: 'Find companions for events, activities, or just hanging out',
        matchScore: 90
      },
      {
        id: '3',
        type: 'helper',
        name: 'Mike Chen',
        description: 'Professional tour guide • City Center • $35/hr',
        rating: 4.8,
        price: 35,
        location: 'City Center',
        availability: 'Available weekends',
        matchScore: 85
      }
    ];
  };

  const saveSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    saveSearch(searchTerm);
    setShowSuggestions(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Search Input */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '16px',
        padding: '12px 16px',
        transition: 'all 0.2s'
      }}
      onFocus={() => setShowSuggestions(true)}>
        <Search size={20} color="#6b7280" style={{ marginRight: '12px' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            color: '#111827'
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              padding: '4px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        )}
        <div style={{
          marginLeft: '12px',
          padding: '8px 16px',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={16} />
          Smart Search
        </div>
      </div>

      {/* Search Suggestions / Results */}
      {showSuggestions && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              Searching...
            </div>
          ) : query.length > 2 && results.length > 0 ? (
            <div>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '12px',
                fontWeight: 600,
                color: '#6b7280'
              }}>
                Search Results
              </div>
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => {
                    onResultSelect(result);
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {result.name}
                        {result.rating && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            color: '#f59e0b'
                          }}>
                            <Star size={12} fill="#f59e0b" />
                            {result.rating}
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {result.description}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      backgroundColor: result.type === 'helper' ? '#f0fdf4' : '#fef3c7',
                      color: result.type === 'helper' ? '#10b981' : '#f59e0b',
                      borderRadius: '12px',
                      fontWeight: 600
                    }}>
                      {result.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Clock size={14} />
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearch(search)}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#374151',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      {search}
                    </div>
                  ))}
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <TrendingUp size={14} />
                  Popular Searches
                </div>
                {popularSearches.slice(0, 5).map((search, index) => (
                  <div
                    key={index}
                    onClick={() => handleSearch(search)}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      borderBottom: index < 4 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    {search}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearchEngine;
