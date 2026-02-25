import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase, authClient } from '../lib/supabase';
import UnifiedLayout from '../components/UnifiedLayout';
import '../styles/typography.css';
import '../styles/buttons.css';
import { Search, MapPin, Calendar, Filter, Star, Heart, Shield, CheckCircle, MessageCircle, DollarSign, Clock, Users, Baby, Car, Home, Activity, BookOpen, Package, Zap, TrendingUp, Award, Globe, ChevronDown, Grid, List, Map as MapIcon, X, AlertCircle, ArrowUpDown, ChevronRight, Video, UserCheck, ShoppingBag, RefreshCw, Sparkles, HeartHandshake, Laptop, BadgeCheck, GraduationCap, Tag, Dog, SlidersHorizontal, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { comprehensiveServices } from '../data/comprehensiveServices';
import MapSearch from '../components/MapSearch';
import SavedSearches from '../components/SavedSearches';
import HelperComparisonModal from '../components/HelperComparisonModal';
import PriceNegotiationModal from '../components/PriceNegotiationModal';
import ServiceAreaMap from '../components/ServiceAreaMap';
import MessagingModal from '../components/MessagingModal';
import MessageModal from '../components/MessageModal';
import OfferModal from '../components/OfferModal';
import ReviewModal from '../components/ReviewModal';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import AdvancedSearchModal from '../components/AdvancedSearchModal';
import VideoIntroModal from '../components/VideoIntroModal';
import ComprehensiveFilters from '../components/ComprehensiveFilters';

interface Helper {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  bio: string;
  hourly_rate: number;
  has_video?: boolean;
  team_available?: boolean;
  team_size?: number;
  rating: number;
  total_reviews: number;
  profile_image_url: string;
  languages: string[];
  services: string[];
  instant_book: boolean;
  years_experience: number;
  background_check_status: string;
  response_time_hours: number;
  availability?: string;
  availability_calendar?: any;
  verified?: boolean;
  gender?: string;
  age?: number;
  video_intro?: boolean;
  video_url?: string;
  created_at?: string;
  updated_at?: string;
  distance_miles?: number;
  distance?: number;
  service_radius?: number;
  insurance?: boolean;
  bonding?: boolean;
  background_check?: boolean;
  identity_verified?: boolean;
  emergency_available?: boolean;
  skills?: string[];
  certifications?: string[];
  portfolio_images?: string[];
  accepts_offers?: boolean;
  recurring_available?: boolean;
  package_deals?: any[];
  group_size?: string;
}

interface Filters {
  service: string;
  location: string;
  searchQuery: string;
  minRate: number;
  maxRate: number;
  minRating: number;
  availability: string;
  gender: string;
  genderIdentity: string;
  languages: string[];
  skills: string[];
  verifiedOnly: boolean;
  backgroundCheckOnly: boolean;
  instantBookOnly: boolean;
  hasVideo: boolean;
  experienceYears: number;
  experienceLevel: string;
  ageRange: string;
  sortBy: string;
  distance: number;
  responseTime: string;
  packageTypes: string[];
  serviceSubcategory?: string;
  certifications?: string[];
  specializations?: string[];
  vehicleType?: string;
  petTypes?: string[];
  childAgeGroups?: string[];
  availabilityDate?: Date | null;
  availabilityTime?: string | null;
}

const EnhancedBrowseHelpers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [compareList, setCompareList] = useState<Helper[]>([]);
  const [showNegotiateModal, setShowNegotiateModal] = useState<string | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [messagingModal, setMessagingModal] = useState<{isOpen: boolean; helper: Helper | null}>({ isOpen: false, helper: null });
  const [messageModal, setMessageModal] = useState<{isOpen: boolean; helper: Helper | null}>({ isOpen: false, helper: null });
  const [offerModal, setOfferModal] = useState<{isOpen: boolean; helper: Helper | null}>({ isOpen: false, helper: null });
  const [reviewModal, setReviewModal] = useState<{isOpen: boolean; helper: Helper | null}>({ isOpen: false, helper: null });
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [videoModal, setVideoModal] = useState<{isOpen: boolean; helper: Helper | null}>({ isOpen: false, helper: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [negotiateOffer, setNegotiateOffer] = useState({ hourlyRate: 0, hours: 1, message: '' });
  const [negotiationModal, setNegotiationModal] = useState<{isOpen: boolean; helper: Helper | null; service: string}>({ isOpen: false, helper: null, service: '' });
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [filteredHelpers, setFilteredHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<Filters>({
    service: searchParams.get('category') || '',
    location: '',
    searchQuery: '',
    minRate: 0,
    maxRate: 200,
    minRating: 0,
    availability: '',
    gender: '',
    genderIdentity: 'all',
    languages: [],
    skills: [],
    verifiedOnly: false,
    backgroundCheckOnly: false,
    instantBookOnly: false,
    hasVideo: false,
    experienceYears: 0,
    experienceLevel: '',
    ageRange: 'all',
    sortBy: 'recommended',
    distance: 10,
    responseTime: 'all',
    packageTypes: [],
    serviceSubcategory: '',
    certifications: [],
    specializations: [],
    vehicleType: '',
    petTypes: [],
    childAgeGroups: []
  });
  const [sortBy, setSortBy] = useState('relevance');

  const genderOptions = [
    { value: 'all', label: 'All Genders', isGroup: false },
    { value: 'male-group', label: 'Male', isGroup: true },
    { value: 'male', label: '  All Male', isGroup: false, indent: true },
    { value: 'cis-male', label: '  Cis Male', isGroup: false, indent: true },
    { value: 'trans-male', label: '  Trans Male', isGroup: false, indent: true },
    { value: 'female-group', label: 'Female', isGroup: true },
    { value: 'female', label: '  All Female', isGroup: false, indent: true },
    { value: 'cis-female', label: '  Cis Female', isGroup: false, indent: true },
    { value: 'trans-female', label: '  Trans Female', isGroup: false, indent: true },
    { value: 'non-binary', label: 'Non-Binary', isGroup: false },
    { value: 'genderfluid', label: 'Genderfluid', isGroup: false },
    { value: 'agender', label: 'Agender', isGroup: false },
    { value: 'other', label: 'Other/Prefer not to say', isGroup: false }
  ];

  useEffect(() => {
    // Clear any cached mock data first
    setHelpers([]);
    setFilteredHelpers([]);
    
    // Load fresh data from database
    loadHelpers();
    
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);
  
  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filters.service) params.set('service', filters.service);
    if (filters.location) params.set('location', filters.location);
    if (filters.searchQuery) params.set('q', filters.searchQuery);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    
    // Save search to recent searches
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const newSearch = filters.searchQuery.trim();
      const updatedSearches = [newSearch, ...recentSearches.filter(s => s !== newSearch)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    }
  }, [filters.service, filters.location, filters.searchQuery]);

  useEffect(() => {
    if (helpers.length > 0) {
      applyFilters();
    }
  }, [helpers, filters]); // Only react to filter changes, not helpers changes

  const loadHelpers = async () => {
    setLoading(true);
    try {
      
      // Fetch helpers with review counts
      const { data: helpersData, error: helpersError } = await supabase
        .from('hfh_helpers')
        .select('*')
        .order('rating', { ascending: false });

      if (helpersError) {
        console.error('Database error:', helpersError);
        throw helpersError;
      }
      
      // Fetch review counts for all helpers
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('hfh_reviews')
        .select('helper_id, rating');
        
      if (reviewsError) {
        console.error('Reviews error:', reviewsError);
      }
      
      // Calculate review counts and average ratings
      const reviewStats = {};
      if (reviewsData) {
        reviewsData.forEach(review => {
          if (!reviewStats[review.helper_id]) {
            reviewStats[review.helper_id] = { count: 0, total: 0 };
          }
          reviewStats[review.helper_id].count++;
          reviewStats[review.helper_id].total += review.rating;
        });
      }
      
      // Merge review stats with helpers
      const data = helpersData?.map(helper => {
        const stats = reviewStats[helper.id];
        if (stats && stats.count > 0) {
          return {
            ...helper,
            total_reviews: stats.count,
            rating: Math.round(stats.total / stats.count * 10) / 10
          };
        }
        return {
          ...helper,
          total_reviews: helper.total_reviews || 0
        };
      });

      if (!data || data.length === 0) {
        console.error('No helpers found in database');
        setHelpers([]);
        setFilteredHelpers([]);
        return;
      }
      
            
      // Parse the data - Supabase will auto-parse JSONB to JS arrays/objects
      const parsedData = (data || []).map(helper => {
        let services = helper.services;
        let languages = helper.languages;
        
        // Services is JSONB in care_connector schema, comes as array
        if (!services) {
          services = ['companions', 'errands', 'virtual-assistant']; // Default services
        } else if (!Array.isArray(services)) {
          // If it's not an array, something is wrong
          console.warn('Services not an array for:', helper.name, services);
          services = ['companions', 'errands'];
        } else {
          // Normalize service names and add friends-for-hire category
          services = services.map(s => {
            if (typeof s === 'string') {
              // Convert to lowercase and replace spaces with hyphens
              return s.toLowerCase()
                .replace(/\s+&\s+/g, '-and-')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            }
            return s;
          }).filter(s => s);
          // Add friends-for-hire to all companions
          if (services.includes('companions') || services.includes('social-activities')) {
            services.push('friends-for-hire');
          }
        }
        
        // Languages is also JSONB
        if (!languages) {
          languages = [];
        } else if (!Array.isArray(languages)) {
          languages = [];
        }
        
        return {
          ...helper,
          services: services,
          languages: languages
        };
      });
      
      setHelpers(parsedData);
      // Also set filtered helpers immediately for initial load
      setFilteredHelpers(parsedData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading helpers:', error);
      toast.error('Failed to load helpers');
      setHelpers([]);
      setFilteredHelpers([]);
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = helpers.filter(h =>
        h.name.toLowerCase().includes(query) ||
        h.bio?.toLowerCase().includes(query) ||
        (Array.isArray(h.services) && h.services.some(s => s.toLowerCase().includes(query))) ||
        (Array.isArray(h.skills) && h.skills.some(sk => sk.toLowerCase().includes(query)))
      );
      setFilteredHelpers(filtered);
    } else {
      applyFilters();
    }
  }, [searchQuery]);

  const applyFilters = useCallback(() => {
    // Only apply filters if we have real helpers data
    if (!helpers || helpers.length === 0) {
      setFilteredHelpers([]);
      return;
    }
    
    let filtered = [...helpers];

    if (filters.service) {
      filtered = filtered.filter(h => {
        if (!h.services || h.services.length === 0) {
          // If no services defined, include in all searches
          return true;
        }
        if (Array.isArray(h.services) && h.services.length > 0) {
          const serviceToMatch = filters.service.toLowerCase();
          // Special handling for friends-for-hire
          if (serviceToMatch === 'friends-for-hire') {
            // Include all companions, social activities, and friends services
            return h.services.some(s => {
              const sLower = s.toLowerCase();
              return sLower.includes('friend') || 
                     sLower.includes('companion') || 
                     sLower.includes('social') ||
                     sLower.includes('buddy') ||
                     sLower.includes('pal');
            });
          }
          return h.services.some(s => {
            if (typeof s === 'string') {
              const serviceLower = s.toLowerCase();
              return serviceLower === serviceToMatch || 
                     serviceLower.includes(serviceToMatch) ||
                     serviceToMatch.includes(serviceLower);
            }
            return false;
          });
        }
        return false;
      });
    }

    if (filters.location) {
      filtered = filtered.filter(h => 
        h.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(query) ||
        h.bio?.toLowerCase().includes(query) ||
        (Array.isArray(h.services) && h.services.some(s => s.toLowerCase().includes(query)))
      );
    }

    filtered = filtered.filter(h => 
      h.hourly_rate >= filters.minRate && h.hourly_rate <= filters.maxRate
    );

    filtered = filtered.filter(h => h.rating >= filters.minRating);

    if (filters.availability !== 'all') {
      filtered = filtered.filter(h => h.availability === filters.availability);
    }

    if (filters.gender !== 'all') {
      filtered = filtered.filter(h => {
        if (filters.gender === 'male') {
          return h.gender === 'male' || h.gender === 'cis-male' || h.gender === 'trans-male';
        }
        if (filters.gender === 'female') {
          return h.gender === 'female' || h.gender === 'cis-female' || h.gender === 'trans-female';
        }
        return h.gender === filters.gender;
      });
    }

    if (filters.verifiedOnly) {
      filtered = filtered.filter(h => h.verified);
    }
    
    if (filters.backgroundCheckOnly) {
      filtered = filtered.filter(h => h.background_check_status === 'approved');
    }
    
    if (filters.instantBookOnly) {
      filtered = filtered.filter(h => h.instant_book);
    }

    if (filters.hasVideo) {
      filtered = filtered.filter(h => h.video_intro);
    }

    if (filters.ageRange !== 'all') {
      filtered = filtered.filter(h => {
        if (!h.age) return false;
        const age = h.age;
        if (filters.ageRange === '18-25') return age >= 18 && age <= 25;
        if (filters.ageRange === '26-35') return age >= 26 && age <= 35;
        if (filters.ageRange === '36-45') return age >= 36 && age <= 45;
        if (filters.ageRange === '46+') return age >= 46;
        return true;
      });
    }

    if (filters.experienceYears > 0) {
      filtered = filtered.filter(h => {
        const exp = h.years_experience || 0;
        return exp >= filters.experienceYears;
      });
    }

    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.hourly_rate - b.hourly_rate);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.hourly_rate - a.hourly_rate);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
        break;
      default:
        filtered.sort((a, b) => (b.rating * b.total_reviews) - (a.rating * a.total_reviews));
    }

    // Sort the filtered results
    let sorted = [...filtered];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => a.hourly_rate - b.hourly_rate);
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => b.hourly_rate - a.hourly_rate);
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'experience') {
      sorted.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0));
    } else if (sortBy === 'distance') {
      sorted.sort((a, b) => {
        const distA = a.distance_miles || 999;
        const distB = b.distance_miles || 999;
        return distA - distB;
      });
    }

    setFilteredHelpers(sorted);
  }, [helpers, filters]);

  const toggleFavorite = async (helperId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save favorites');
        return;
      }

      const { data: clientProfile } = await supabase
        .from('hfh_clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!clientProfile) {
        toast.error('Client profile not found');
        return;
      }

      const isFavorite = favorites.includes(helperId);
      
      if (isFavorite) {
        await supabase
          .from('hfh_favorites')
          .delete()
          .eq('client_id', clientProfile.id)
          .eq('helper_id', helperId);
        setFavorites(prev => prev.filter(id => id !== helperId));
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from('hfh_favorites')
          .insert([{ client_id: clientProfile.id, helper_id: helperId }]);
        setFavorites(prev => [...prev, helperId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const toggleCompare = (helper: Helper) => {
    setCompareList(prev => {
      if (prev.some(h => h.id === helper.id)) {
        return prev.filter(h => h.id !== helper.id);
      }
      if (prev.length >= 3) {
        toast.error('You can compare up to 3 helpers at a time');
        return prev;
      }
      return [...prev, helper];
    });
  };

  const saveCurrentSearch = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save searches');
        return;
      }

      if (!searchName.trim()) {
        toast.error('Please enter a name for this search');
        return;
      }

      const { error } = await supabase
        .from('hfh_saved_searches')
        .insert([{
          user_id: user.id,
          name: searchName,
          filters: {
            service_type: filters.service,
            location: filters.location,
            min_rate: filters.minRate,
            max_rate: filters.maxRate,
            min_rating: filters.minRating,
            availability: filters.availability
          },
          notifications_enabled: false
        }]);

      if (error) throw error;

      toast.success('Search saved successfully!');
      setShowSaveSearchModal(false);
      setSearchName('');
    } catch (error: any) {
      console.error('Error saving search:', error);
      toast.error('Failed to save search');
    }
  };

  const renderFilters = () => (
    <div style={{
      width: '280px',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '20px',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Quick Service Filters */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Quick Filters</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { id: 'friends-for-hire', label: 'Friends for Hire', icon: Users },
            { id: 'pals-for-hire', label: 'Pals for Hire', icon: UserCheck },
            { id: 'errand-services', label: 'Errand Services', icon: ShoppingBag }
          ].map(service => {
            const isActive = filters.service === service.id;
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => {
                  const newService = isActive ? '' : service.id;
                  setFilters({ ...filters, service: newService });
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: isActive ? '#10b981' : 'white',
                  color: isActive ? 'white' : '#6b7280',
                  border: '1px solid ' + (isActive ? '#10b981' : '#e5e7eb'),
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Icon size={14} />
                {service.label}
              </button>
            );
          })}
        </div>
        
        {/* Popular Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={() => setFilters({ ...filters, instantBookOnly: !filters.instantBookOnly })}
            style={{
              padding: '4px 10px',
              backgroundColor: filters.instantBookOnly ? '#10b981' : 'white',
              color: filters.instantBookOnly ? 'white' : '#6b7280',
              border: '1px solid ' + (filters.instantBookOnly ? '#10b981' : '#e5e7eb'),
              borderRadius: 'var(--radius-xl)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Zap size={12} style={{ marginRight: '4px' }} />
            Instant Booking Available
          </button>
          <button
            onClick={() => setFilters({ ...filters, backgroundCheckOnly: !filters.backgroundCheckOnly })}
            style={{
              padding: '4px 10px',
              backgroundColor: filters.backgroundCheckOnly ? '#10b981' : 'white',
              color: filters.backgroundCheckOnly ? 'white' : '#6b7280',
              border: '1px solid ' + (filters.backgroundCheckOnly ? '#10b981' : '#e5e7eb'),
              borderRadius: 'var(--radius-xl)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <BadgeCheck size={12} />
            Background Verified
          </button>
          <button
            onClick={() => {
              const topRated = filters.minRating === 4.5;
              setFilters({ ...filters, minRating: topRated ? 0 : 4.5 });
            }}
            style={{
              padding: '4px 10px',
              backgroundColor: filters.minRating >= 4.5 ? '#10b981' : 'white',
              color: filters.minRating >= 4.5 ? 'white' : '#6b7280',
              border: '1px solid ' + (filters.minRating >= 4.5 ? '#10b981' : '#e5e7eb'),
              borderRadius: 'var(--radius-xl)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Star size={12} />
            Top Rated (4.5+)
          </button>
          <button
            onClick={() => {
              const nearMe = filters.distance === 5;
              setFilters({ ...filters, distance: nearMe ? 10 : 5 });
            }}
            style={{
              padding: '4px 10px',
              backgroundColor: filters.distance === 5 ? '#10b981' : 'white',
              color: filters.distance === 5 ? 'white' : '#6b7280',
              border: '1px solid ' + (filters.distance === 5 ? '#10b981' : '#e5e7eb'),
              borderRadius: 'var(--radius-xl)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <MapPin size={12} />
            Within 5 miles
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
          Filters
        </h3>
        <button
          onClick={() => setFilters({
            service: '',
            location: '',
            searchQuery: '',
            minRate: 0,
            maxRate: 200,
            minRating: 0,
            availability: 'all',
            gender: 'all',
            genderIdentity: 'all',
            languages: [],
            skills: [],
            verifiedOnly: false,
            backgroundCheckOnly: false,
            instantBookOnly: false,
            hasVideo: false,
            experienceYears: 0,
            experienceLevel: '',
            ageRange: 'all',
            sortBy: 'relevance',
            distance: 10,
            responseTime: 'all',
            packageTypes: []
          })}
          style={{
            fontSize: '13px',
            color: '#10b981',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Clear All
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Service Type</label>
        <select
          value={filters.service}
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px'
          }}
        >
          <option value="">All Services</option>
          {comprehensiveServices.map(service => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Price: ${filters.minRate} - ${filters.maxRate}/hr
        </label>
        <input
          type="range"
          min="0"
          max="200"
          value={filters.maxRate}
          onChange={(e) => setFilters({ ...filters, maxRate: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Distance: Within {filters.distance} miles
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={filters.distance}
          onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
          <span>1 mi</span>
          <span>50 mi</span>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Availability
        </label>
        <button
          onClick={() => setShowAvailabilityCalendar(!showAvailabilityCalendar)}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: filters.availabilityDate ? '#10b981' : 'white',
            color: filters.availabilityDate ? 'white' : '#374151',
            border: `1px solid ${filters.availabilityDate ? '#10b981' : '#e5e7eb'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <span>
            {filters.availabilityDate && filters.availabilityTime
              ? `${filters.availabilityDate.toLocaleDateString()} at ${filters.availabilityTime}`
              : 'Select Date & Time'}
          </span>
          <Calendar size={16} />
        </button>
        {filters.availabilityDate && (
          <button
            onClick={() => setFilters({ ...filters, availabilityDate: null, availabilityTime: null })}
            style={{
              width: '100%',
              padding: '6px 12px',
              backgroundColor: 'white',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Clear Date & Time
          </button>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Min Rating
        </label>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 3, 4, 4.5].map((rating: number) => (
            <button
              key={rating}
              onClick={() => setFilters({ ...filters, minRating: rating })}
              style={{
                padding: '6px 10px',
                border: `2px solid ${filters.minRating === rating ? '#10b981' : '#e5e7eb'}`,
                backgroundColor: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Star size={12} fill={filters.minRating === rating ? '#10b981' : 'none'} />
              {rating}+
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '14px', color: '#374151', marginBottom: '6px', display: 'block', fontWeight: 500 }}>
          Gender Identity
        </label>
        <select 
          value={filters.genderIdentity}
          onChange={(e) => {
            setFilters({...filters, genderIdentity: e.target.value});
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Genders</option>
          <optgroup label="Male">
            <option value="cis-male">Cisgender Male</option>
            <option value="trans-male">Transgender Male</option>
            <option value="male">Male (All)</option>
          </optgroup>
          <optgroup label="Female">
            <option value="cis-female">Cisgender Female</option>
            <option value="trans-female">Transgender Female</option>
            <option value="female">Female (All)</option>
          </optgroup>
          <option value="non-binary">Non-binary</option>
          <option value="genderfluid">Genderfluid</option>
          <option value="agender">Agender</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Distance
        </label>
        <select
          value={filters.distance}
          onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="1">Within 1 mile</option>
          <option value="5">Within 5 miles</option>
          <option value="10">Within 10 miles</option>
          <option value="25">Within 25 miles</option>
          <option value="50">Within 50 miles</option>
          <option value="100">Within 100 miles</option>
          <option value="any">Any distance</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Experience: {filters.experienceYears}+ years
        </label>
        <input
          type="range"
          min="0"
          max="15"
          step="1"
          value={filters.experienceYears}
          onChange={(e) => setFilters({ ...filters, experienceYears: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Age Range
        </label>
        <select
          value={filters.ageRange}
          onChange={(e) => setFilters({ ...filters, ageRange: e.target.value })}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="all">All Ages</option>
          <option value="18-25">18-25 years</option>
          <option value="26-35">26-35 years</option>
          <option value="36-45">36-45 years</option>
          <option value="46-55">46-55 years</option>
          <option value="56-65">56-65 years</option>
          <option value="65+">65+ years</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Languages
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
          {['English', 'Spanish', 'Mandarin', 'French', 'German', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Portuguese'].map(lang => (
            <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filters.languages.includes(lang.toLowerCase())}
                onChange={(e) => {
                  const langLower = lang.toLowerCase();
                  const newLangs = e.target.checked
                    ? [...filters.languages, langLower]
                    : filters.languages.filter(l => l !== langLower);
                  setFilters({ ...filters, languages: newLangs });
                }}
                style={{ accentColor: '#10b981' }}
              />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Experience Level
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Entry', 'Mid-Level', 'Senior', 'Expert'].map(level => (
            <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="experience"
                value={level.toLowerCase()}
                checked={filters.experienceLevel === level.toLowerCase()}
                onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                style={{ accentColor: '#10b981' }}
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Availability
        </label>
        <select
          value={filters.availability}
          onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="all">All</option>
          <option value="available">Available Now</option>
          <option value="today">Today</option>
          <option value="this-week">This Week</option>
          <option value="emergency">Emergency/Urgent</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Service Packages
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={filters.packageTypes.includes('hourly')}
              onChange={(e) => {
                const newTypes = e.target.checked 
                  ? [...filters.packageTypes, 'hourly']
                  : filters.packageTypes.filter(t => t !== 'hourly');
                setFilters({ ...filters, packageTypes: newTypes });
              }}
              style={{ accentColor: '#10b981' }} 
            />
            <span>Hourly Rates</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={filters.packageTypes.includes('daily')}
              onChange={(e) => {
                const newTypes = e.target.checked 
                  ? [...filters.packageTypes, 'daily']
                  : filters.packageTypes.filter(t => t !== 'daily');
                setFilters({ ...filters, packageTypes: newTypes });
              }}
              style={{ accentColor: '#10b981' }} 
            />
            <span>Daily Packages</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={filters.packageTypes.includes('weekly')}
              onChange={(e) => {
                const newTypes = e.target.checked 
                  ? [...filters.packageTypes, 'weekly']
                  : filters.packageTypes.filter(t => t !== 'weekly');
                setFilters({ ...filters, packageTypes: newTypes });
              }}
              style={{ accentColor: '#10b981' }} 
            />
            <span>Weekly Bundles</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={filters.packageTypes.includes('monthly')}
              onChange={(e) => {
                const newTypes = e.target.checked 
                  ? [...filters.packageTypes, 'monthly']
                  : filters.packageTypes.filter(t => t !== 'monthly');
                setFilters({ ...filters, packageTypes: newTypes });
              }}
              style={{ accentColor: '#10b981' }} 
            />
            <span>Monthly Plans</span>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Certifications
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            'CPR Certified',
            'First Aid',
            'Background Check',
            'Licensed Professional',
            'Insured & Bonded',
            'Food Handler',
            'Pet CPR'
          ].map(cert => (
            <label key={cert} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filters.skills.includes(cert)}
                onChange={(e) => {
                  const newSkills = e.target.checked
                    ? [...filters.skills, cert]
                    : filters.skills.filter(s => s !== cert);
                  setFilters({ ...filters, skills: newSkills });
                }}
                style={{ accentColor: '#10b981' }}
              />
              <span>{cert}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Verification
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
              style={{ accentColor: '#10b981' }}
            />
            <Shield size={14} color="#10b981" /> Verified Only
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={filters.backgroundCheckOnly}
              onChange={(e) => setFilters({ ...filters, backgroundCheckOnly: e.target.checked })}
              style={{ accentColor: '#10b981' }}
            />
            <CheckCircle size={14} color="#10b981" /> Background Checked
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={filters.instantBookOnly}
              onChange={(e) => setFilters({ ...filters, instantBookOnly: e.target.checked })}
              style={{ accentColor: '#10b981' }}
            />
            <Zap size={14} color="#10b981" /> Instant Book
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={filters.hasVideo}
              onChange={(e) => setFilters({ ...filters, hasVideo: e.target.checked })}
              style={{ accentColor: '#10b981' }}
            />
            <Video size={14} color="#10b981" /> Has Video Intro
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          More Services
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'childcare', label: 'Childcare', icon: Baby },
            { id: 'senior-care', label: 'Senior Care', icon: Heart },
            { id: 'pet-care', label: 'Pet Care', icon: Heart },
            { id: 'house-sitting', label: 'House Sitting', icon: Home },
            { id: 'tutoring', label: 'Tutoring', icon: BookOpen },
            { id: 'personal-training', label: 'Personal Training', icon: Activity }
          ].map(service => {
            const isActive = filters.service === service.id;
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => {
                  const newService = isActive ? '' : service.id;
                  setFilters({ ...filters, service: newService });
                }}
                style={{
                  padding: '6px 10px',
                  backgroundColor: isActive ? '#10b981' : 'white',
                  color: isActive ? 'white' : '#6b7280',
                  border: '1px solid ' + (isActive ? '#10b981' : '#e5e7eb'),
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  width: '100%',
                  justifyContent: 'flex-start'
                }}
              >
                <Icon size={12} />
                {service.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderHelperCard = (helper: Helper) => {
    const isFavorite = favorites.includes(helper.id);
    const isComparing = compareList.some(h => h.id === helper.id);
    const primaryService = Array.isArray(helper.services) && helper.services.length > 0 ? helper.services[0] : '';
    const service = comprehensiveServices.find(s => s.id === primaryService);

    return (
      <div
        key={helper.id}
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          position: 'relative',
          height: '100%',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f3f4f6'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        }}
        onClick={() => {
          navigate(`/humans-for-hire/helper/${helper.id}`);
        }}
      >
        <div style={{ position: 'relative' }}>
          {helper.profile_image_url ? (
            <img
              src={helper.profile_image_url || `https://images.unsplash.com/photo-${Math.abs(helper.name.charCodeAt(0) + helper.name.charCodeAt(1)) % 30 + 1500000000000}?auto=format&fit=crop&w=400&h=400&q=80`}
              alt={helper.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '280px',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={60} color="#d1d5db" />
            </div>
          )}
          
          {/* Comparison Checkbox */}
          <input
            type="checkbox"
            checked={isComparing}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.checked) {
                if (compareList.length < 3) {
                  setCompareList([...compareList, helper]);
                } else {
                  toast.error('You can compare up to 3 helpers');
                  e.target.checked = false;
                }
              } else {
                setCompareList(compareList.filter(h => h.id !== helper.id));
              }
            }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              zIndex: 1,
              accentColor: '#10b981'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
          }}>
            {helper.instant_book && (
              <div style={{
                padding: '4px 8px',
                backgroundColor: '#10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Zap size={12} color="white" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'white' }}>Instant Book</span>
              </div>
            )}
            {helper.verified && (
              <div style={{
                padding: '4px 8px',
                backgroundColor: 'white',
                border: '2px solid #10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <BadgeCheck size={12} color="#10b981" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>Photo Verified</span>
              </div>
            )}
            {helper.background_check_status === 'cleared' && (
              <div style={{
                padding: '4px 8px',
                backgroundColor: 'white',
                border: '1px solid #10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <BadgeCheck size={12} color="#10b981" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>BG Check</span>
              </div>
            )}
            {helper.certifications && helper.certifications.length > 0 && (
              <div style={{
                padding: '4px 8px',
                backgroundColor: 'white',
                border: '1px solid #10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <GraduationCap size={12} color="#10b981" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>Certified</span>
              </div>
            )}
            {helper.rating >= 4.8 && (
              <div style={{
                padding: '4px 8px',
                backgroundColor: 'white',
                border: '2px solid #10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '6px'
              }}>
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                  {helper.rating || 4.8}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  ({helper.total_reviews || 0} {helper.total_reviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
            {helper.package_deals && (
              <div style={{
                padding: '4px 8px',
                backgroundColor: 'white',
                border: '1px solid #10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Tag size={12} color="#10b981" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>Bundles Available</span>
              </div>
            )}
            {helper.recurring_available && (
              <div style={{
                padding: '4px 8px',
                backgroundColor: 'white',
                border: '1px solid #10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <RefreshCw size={12} color="#10b981" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>Weekly/Monthly</span>
              </div>
            )}
            {helper.has_video && (
              <div style={{
                padding: '4px 8px',
                backgroundColor: 'white',
                border: '1px solid #10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Video size={12} color="#10b981" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>Video Intro</span>
              </div>
            )}
            {helper.team_available && (
              <div style={{
                padding: '4px 8px',
                backgroundColor: 'white',
                border: '1px solid #10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Users size={12} color="#10b981" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>Team of {helper.team_size || 2}+</span>
              </div>
            )}
          </div>

          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '6px'
          }}>
            {/* Repeat Booking for returning customers */}
            {helper.total_reviews > 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success('Booking again with favorite helper!');
                  navigate(`/humans-for-hire/book/${helper.id}?repeat=true`);
                }}
                style={{
                  padding: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Book again"
              >
                <RefreshCw size={14} color="#10b981" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(helper.id);
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Heart size={14} fill={isFavorite ? '#ef4444' : 'none'} color="#ef4444" />
            </button>
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          {/* Availability Status & Response Time */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              backgroundColor: 'white',
              border: '1px solid ' + (helper.availability === 'available' ? '#10b981' : helper.availability === 'busy' ? '#ef4444' : '#e5e7eb'),
              borderRadius: '6px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: helper.availability === 'available' ? '#10b981' : helper.availability === 'busy' ? '#ef4444' : '#9ca3af'
              }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: helper.availability === 'available' ? '#059669' : helper.availability === 'busy' ? '#dc2626' : '#6b7280' }}>
                {helper.availability === 'available' ? 'Available Now' : helper.availability === 'busy' ? 'Busy' : 'Check Schedule'}
              </span>
            </div>
            {helper.response_time_hours && helper.response_time_hours <= 24 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                backgroundColor: 'white',
                border: '1px solid #10b981',
                borderRadius: '6px'
              }}>
                <Clock size={12} color="#10b981" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>
                  {helper.response_time_hours < 1 ? 'Responds in minutes' : `${helper.response_time_hours}h response`}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#111827',
                margin: 0
              }}>
                {helper.name}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} color="#6b7280" />
                <span>{helper.location || 'Los Angeles, CA'} • {helper.distance_miles || helper.distance || 2.5} miles away</span>
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '12px',
                  padding: '3px 8px',
                  backgroundColor: 'white',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-lg)',
                  color: '#10b981',
                  fontWeight: 500
                }}>
                  {(helper as any).gender_identity === 'cis-male' ? 'Cis Male' : (helper as any).gender_identity === 'cis-female' ? 'Cis Female' : (helper as any).gender_identity === 'trans-male' ? 'Trans Male' : (helper as any).gender_identity === 'trans-female' ? 'Trans Female' : (helper as any).gender_identity === 'male' ? 'Male' : (helper as any).gender_identity === 'female' ? 'Female' : (helper as any).gender_identity === 'non-binary' ? 'Non-Binary' : (helper as any).gender_identity === 'genderfluid' ? 'Genderfluid' : (helper as any).gender_identity === 'agender' ? 'Agender' : 'Not Specified'}
                </span>
                {helper.age && (
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>• Age {helper.age}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMessageModal({ isOpen: true, helper: helper });
                }}
                style={{
                  flex: 0,
                  padding: '12px 20px',
                  height: '44px',
                  backgroundColor: 'white',
                  color: '#10b981',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MessageCircle size={16} />
                Message
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOfferModal({ isOpen: true, helper: helper });
                }}
                style={{
                  flex: 0,
                  padding: '12px 20px',
                  height: '44px',
                  backgroundColor: 'white',
                  color: '#10b981',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <DollarSign size={14} />
                Offer
              </button>
              {helper.has_video && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoModal({ isOpen: true, helper: helper });
                  }}
                  style={{
                    flex: 0,
                    padding: '12px 20px',
                    height: '44px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: '1px solid #10b981',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Video size={16} />
                  Video
                </button>
              )}
            </div>
          </div>
          
          {/* Package Deals Display */}
          {helper.package_deals && Array.isArray(helper.package_deals) && helper.package_deals.length > 0 && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: 'white',
              borderTop: '1px solid #10b981',
              marginTop: '12px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Package size={14} />
                Package Deals Available
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {helper.package_deals.slice(0, 2).map((deal: any, idx: number) => (
                  <div key={idx} style={{
                    padding: '4px 8px',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #10b981',
                    fontSize: '12px',
                    color: '#059669'
                  }}>
                    {deal.name}: ${deal.price}
                  </div>
                ))}
                {helper.package_deals.length > 2 && (
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #10b981',
                    fontSize: '12px',
                    color: '#059669'
                  }}>
                    +{helper.package_deals.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <UnifiedLayout>
      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
          {/* Prominent Service Categories */}
          {!filters.service && (
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setFilters({ ...filters, service: 'friends-for-hire' })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Users size={18} />
                Friends for Hire
              </button>
              <button
                onClick={() => setFilters({ ...filters, service: 'pals-for-hire' })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <UserCheck size={18} />
                Pals for Hire
              </button>
              <button
                onClick={() => setFilters({ ...filters, service: 'errand-services' })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ShoppingBag size={18} />
                Errand Services
              </button>
              <button
                onClick={() => setFilters({ ...filters, service: 'tour-guide' })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <MapPin size={18} />
                Tour Guide
              </button>
              <button
                onClick={() => setFilters({ ...filters, service: 'virtual-assistant' })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Laptop size={18} />
                Virtual Assistant
              </button>
              <button
                onClick={() => setFilters({ ...filters, service: 'walking-companion' })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Users size={18} />
                City Walker
              </button>
              <button
                onClick={() => setFilters({ ...filters, service: 'odd-jobs' })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Wrench size={18} />
                Odd Jobs
              </button>
            </div>
          )}

          {/* Quick Filters */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '12px',
            borderBottom: '1px solid #e5e7eb',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setFilters({ ...filters, verifiedOnly: !filters.verifiedOnly })}
              style={{
                padding: '6px 12px',
                backgroundColor: filters.verifiedOnly ? '#10b981' : 'white',
                color: filters.verifiedOnly ? 'white' : '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: 'var(--radius-2xl)',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Shield size={14} />
              Verified
            </button>
            <button
              onClick={() => setShowAdvancedSearch(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                color: '#10b981',
                border: '2px solid #10b981',
                borderRadius: 'var(--radius-2xl)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <SlidersHorizontal size={14} />
              Advanced Search
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} />
                <input
                  type="text"
                  placeholder="Search helpers by name, service, or skill..."
                  value={filters.searchQuery}
                  onChange={(e) => {
                    handleFilterChange('searchQuery', e.target.value);
                    if (e.target.value.length > 1) {
                      const suggestions = [
                        'Weekend companion for events',
                        'Dog walking services',
                        'Grocery shopping help',
                        'Senior companion care',
                        'Local tour guide',
                        'Moving assistance',
                        'Childcare services',
                        'Virtual assistant'
                      ].filter(s => s.toLowerCase().includes(e.target.value.toLowerCase()));
                      setSearchSuggestions(suggestions);
                      setShowSuggestions(true);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (filters.searchQuery.length > 1) setShowSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 48px',
                    fontSize: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 'var(--radius-lg)',
                    outline: 'none'
                  }}
                />
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {searchSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          handleFilterChange('searchQuery', suggestion);
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#374151',
                          borderBottom: idx < searchSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0fdf4';
                          e.currentTarget.style.color = '#10b981';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <Search size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#374151'
                }}
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
              <div style={{
                display: 'flex',
                gap: '8px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 'var(--radius-lg)',
                padding: '4px'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: viewMode === 'grid' ? '#10b981' : 'white',
                    color: viewMode === 'grid' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  <Grid size={16} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: viewMode === 'list' ? '#10b981' : 'white',
                    color: viewMode === 'list' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  <List size={16} />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: viewMode === 'map' ? '#10b981' : 'white',
                    color: viewMode === 'map' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  <MapIcon size={16} />
                  Map
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{
            display: 'flex',
            gap: '24px',
            height: 'calc(100vh - 200px)'
          }}>
            {/* Filters Sidebar */}
            {showFilters && renderFilters()}
            
            {/* Results Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                  Loading helpers...
                </div>
              ) : helpers.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '120px 40px',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-2xl)',
                  border: '2px solid #e5e7eb',
                  maxWidth: '600px',
                  margin: '60px auto'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'white',
                    border: '2px solid #10b981',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    fontSize: '40px'
                  }}>
                    <Search size={32} color="#10b981" />
                  </div>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#111827', 
                    marginBottom: '12px',
                    lineHeight: 1.2
                  }}>
                    No Helpers Found
                  </h3>
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#6b7280', 
                    marginBottom: '32px',
                    lineHeight: 1.5,
                    maxWidth: '400px',
                    margin: '0 auto 32px'
                  }}>
                    Try adjusting your filters, search terms, or browse all available services
                  </p>
                  <button
                    onClick={() => {
                      setFilters({
                        service: '',
                        location: '',
                        searchQuery: '',
                        minRate: 0,
                        maxRate: 200,
                        minRating: 0,
                        availability: 'all',
                        gender: 'all',
                        genderIdentity: 'all',
                        languages: [],
                        skills: [],
                        verifiedOnly: false,
                        backgroundCheckOnly: false,
                        instantBookOnly: false,
                        hasVideo: false,
                        experienceYears: 0,
                        experienceLevel: '',
                        ageRange: 'all',
                        sortBy: 'recommended',
                        distance: 10,
                        responseTime: 'all',
                        packageTypes: []
                      });
                    }}
                    style={{
                      padding: '12px 32px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : viewMode === 'map' ? (
                <MapSearch
                  helpers={filteredHelpers.length > 0 ? filteredHelpers : helpers}
                  onHelperSelect={(helper) => navigate(`/humans-for-hire/helper/${helper.id}`)}
                />
              ) : (
                <div style={{
                  display: viewMode === 'grid' ? 'grid' : 'flex',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
                  flexDirection: viewMode === 'list' ? 'column' : undefined,
                  gap: '16px'
                }}>
                  {(filteredHelpers.length > 0 ? filteredHelpers : helpers).map(renderHelperCard)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      {compareList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          zIndex: 9999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {compareList.length} helper{compareList.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setCompareList([])}
              style={{
                padding: '4px 8px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
          <button
            onClick={() => {
              // Show comparison modal in a separate state
              const modal = document.createElement('div');
              document.body.appendChild(modal);
            }}
            disabled={compareList.length < 2}
            style={{
              width: '100%',
              padding: '10px 16px',
              backgroundColor: compareList.length >= 2 ? '#10b981' : '#e5e7eb',
              color: compareList.length >= 2 ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: compareList.length >= 2 ? 'pointer' : 'not-allowed'
            }}
          >
            Compare {compareList.length >= 2 ? 'Now' : '(select 2-3)'}
          </button>
        </div>
      )}

      {/* Helper Comparison Modal */}
      {compareList.length >= 2 && (
        <HelperComparisonModal
          helpers={compareList}
          onClose={() => setCompareList([])}
          onRemove={(helperId) => setCompareList(prev => prev.filter(h => h.id !== helperId))}
        />
      )}

      {/* Save Search Modal */}
      {showSaveSearchModal && (
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
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: '#111827' }}>
              Save This Search
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                color: '#6b7280',
                fontWeight: 500
              }}>
                Helper
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              Give your search a name to quickly access it later and get notified when new helpers match your criteria.
            </p>
            <input
              type="text"
              placeholder="e.g., Weekend Pet Sitter in SF"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                marginBottom: '24px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowSaveSearchModal(false);
                  setSearchName('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentSearch}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Negotiation Modal */}
      {negotiationModal.isOpen && negotiationModal.helper && (
        <PriceNegotiationModal
          isOpen={negotiationModal.isOpen}
          onClose={() => setNegotiationModal({ isOpen: false, helper: null, service: '' })}
          helper={{
            id: negotiationModal.helper.id,
            name: negotiationModal.helper.name,
            hourly_rate: negotiationModal.helper.hourly_rate,
            profile_image_url: negotiationModal.helper.profile_image_url,
            accepts_offers: true
          }}
          service={negotiationModal.service}
          onOfferSent={() => {
            toast.success('Offer sent successfully!');
            setNegotiationModal({ isOpen: false, helper: null, service: '' });
          }}
        />
      )}
      
      {/* Messaging Modal */}
      {messagingModal.isOpen && messagingModal.helper && (
        <MessagingModal
          isOpen={messagingModal.isOpen}
          onClose={() => setMessagingModal({ isOpen: false, helper: null })}
          recipientId={messagingModal.helper.user_id}
          recipientName={messagingModal.helper.name}
          helperImage={messagingModal.helper.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${messagingModal.helper.name}`}
        />
      )}

      {/* Message Modal */}
      {messageModal.isOpen && messageModal.helper && (
        <MessageModal
          helper={messageModal.helper}
          onClose={() => setMessageModal({ isOpen: false, helper: null })}
        />
      )}

      {/* Offer Modal */}
      {offerModal.isOpen && offerModal.helper && (
        <OfferModal
          helper={offerModal.helper}
          onClose={() => setOfferModal({ isOpen: false, helper: null })}
          onSuccess={() => {
            setOfferModal({ isOpen: false, helper: null });
            toast.success('Offer sent successfully!');
          }}
        />
      )}

      {/* Review Modal */}
      {reviewModal.isOpen && reviewModal.helper && (
        <ReviewModal
          helper={reviewModal.helper}
          onClose={() => setReviewModal({ isOpen: false, helper: null })}
          onSuccess={() => {
            setReviewModal({ isOpen: false, helper: null });
            toast.success('Review submitted successfully!');
            loadHelpers();
          }}
        />
      )}

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        currentFilters={filters}
        onSearch={(criteria) => {
          // Apply all search criteria to filters
          setFilters({
            ...filters,
            service: criteria.services.length > 0 ? criteria.services[0] : '',
            location: criteria.location,
            minRate: criteria.priceRange.min,
            maxRate: criteria.priceRange.max,
            minRating: criteria.rating,
            verifiedOnly: criteria.verifiedOnly,
            instantBookOnly: criteria.instantBooking,
            distance: criteria.distance,
            languages: criteria.languages,
            experienceLevel: criteria.experience
          });
          toast.success('Advanced search filters applied!');
          loadHelpers();
        }}
      />

      {/* Video Introduction Modal */}
      {videoModal.isOpen && videoModal.helper && (
        <VideoIntroModal
          isOpen={videoModal.isOpen}
          onClose={() => setVideoModal({ isOpen: false, helper: null })}
          helperId={videoModal.helper.id}
          helperName={videoModal.helper.name}
          videoUrl={videoModal.helper.video_url}
        />
      )}

      {/* Filters Sidebar */}
      {showFilters && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '320px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          overflowY: 'auto',
          zIndex: 100,
          paddingTop: '60px'
        }}>
          <ComprehensiveFilters 
            filters={filters}
            onFilterChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* Availability Calendar Modal */}
      {showAvailabilityCalendar && (
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
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowAvailabilityCalendar(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              ×
            </button>
            <AvailabilityCalendar
              helperId="all"
              selectedDate={filters.availabilityDate}
              selectedTime={filters.availabilityTime}
              onDateTimeSelect={(date, time) => {
                setFilters({ ...filters, availabilityDate: date, availabilityTime: time });
                setShowAvailabilityCalendar(false);
                toast.success('Availability filter applied!');
              }}
            />
          </div>
        </div>
      )}
    </UnifiedLayout>
  );
};

export default EnhancedBrowseHelpers;
