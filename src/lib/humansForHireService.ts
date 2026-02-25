import { supabase } from './supabase';

export interface WaitlistSignup {
  id?: string;
  user_type: 'helper' | 'client';
  name: string;
  email: string;
  location: string;
  message?: string;
  status?: string;
  created_at?: string;
}

export interface Helper {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  bio?: string;
  hourly_rate?: number;
  availability?: any;
  services?: any; // Changed to any to handle jsonb
  verified?: boolean;
  verified_id?: boolean;
  background_check_status?: string;
  rating: number;
  total_reviews: number;
  profile_image_url?: string;
  years_experience?: number;
  languages?: any; // Changed to any to handle jsonb
  response_time_hours?: number;
  response_rate?: number;
  acceptance_rate?: number;
  instant_book?: boolean;
  certifications?: string[];
  insurance_verified?: boolean;
  gender_identity?: string;
  age_range?: string;
  repeat_clients?: number;
  specialties?: string[];
  availability_status?: 'available' | 'busy' | 'offline';
  next_available?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  preferences?: any;
  created_at?: string;
}

export interface Booking {
  id: string;
  helper_id: string;
  client_id: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_hours: number;
  location: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount?: number;
  created_at?: string;
}

export interface Review {
  id?: string;
  booking_id: string;
  helper_id: string;
  client_id: string;
  rating: number;
  review_text?: string;
  professionalism_rating?: number;
  communication_rating?: number;
  punctuality_rating?: number;
  quality_rating?: number;
  created_at?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
}

// Waitlist Functions
export async function submitWaitlist(data: WaitlistSignup) {
  const { data: result, error } = await supabase
    .from('hfh_waitlist')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function getWaitlistByEmail(email: string) {
  const { data, error } = await supabase
    .from('hfh_waitlist')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Helper Functions
export async function getHelpers(filters?: {
  location?: string;
  services?: string[];
  minRating?: number;
  maxRate?: number;
  minRate?: number;
  genderIdentity?: string;
  ageRange?: string;
  availability?: string;
  distance?: string;
  verified?: boolean;
  backgroundCheck?: boolean;
  instantBook?: boolean;
}) {
  let query = supabase
    .from('hfh_helpers')
    .select('*')
    .order('rating', { ascending: false });

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters?.services && filters.services.length > 0) {
    // Handle jsonb array contains
    for (const service of filters.services) {
      query = query.contains('services', [service]);
    }
  }

  if (filters?.minRating) {
    query = query.gte('rating', filters.minRating);
  }

  if (filters?.maxRate) {
    query = query.lte('hourly_rate', filters.maxRate);
  }

  if (filters?.minRate) {
    query = query.gte('hourly_rate', filters.minRate);
  }

  if (filters?.genderIdentity) {
    query = query.eq('gender_identity', filters.genderIdentity);
  }

  if (filters?.ageRange) {
    query = query.eq('age_range', filters.ageRange);
  }

  if (filters?.verified) {
    query = query.eq('verified', true);
  }

  if (filters?.backgroundCheck) {
    query = query.eq('background_check_status', 'passed');
  }

  if (filters?.instantBook) {
    query = query.eq('instant_book', true);
  }

  if (filters?.availability) {
    query = query.eq('availability_status', filters.availability);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching helpers:', error);
    throw error;
  }
  
  // Parse services and languages if they're jsonb strings
  const helpers = (data || []).map((helper: any) => {
    // Generate consistent Unsplash photo based on helper ID and gender
    const seed = helper.id ? helper.id.charCodeAt(0) + helper.id.charCodeAt(1) : Math.random() * 100;
    const malePhotos = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7'
    ];
    const femalePhotos = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9'
    ];
    const neutralPhotos = [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',
      'https://images.unsplash.com/photo-1504593811423-6dd665756598',
      'https://images.unsplash.com/photo-1542206395-9feb3edaa68d',
      'https://images.unsplash.com/photo-1557862921-37829c790f19',
      'https://images.unsplash.com/photo-1491349174775-aaafddd81942'
    ];
    
    let photos = neutralPhotos;
    if (helper.gender_identity?.toLowerCase().includes('female')) {
      photos = femalePhotos;
    } else if (helper.gender_identity?.toLowerCase().includes('male')) {
      photos = malePhotos;
    }
    
    const index = seed % photos.length;
    const realPhotoUrl = `${photos[index]}?w=400&h=400&fit=crop&crop=faces`;
    
    return {
      ...helper,
      // ALWAYS use real Unsplash photo - NEVER allow cartoon avatars
      profile_image_url: realPhotoUrl,
      services: Array.isArray(helper.services) ? helper.services : 
                (typeof helper.services === 'string' ? JSON.parse(helper.services) : []),
      languages: Array.isArray(helper.languages) ? helper.languages :
                 (typeof helper.languages === 'string' ? JSON.parse(helper.languages) : [])
    };
  });
  
  return helpers as Helper[];
}

export async function getHelperById(id: string) {
  const { data, error } = await supabase
    .from('hfh_helpers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Helper;
}

export async function getHelperReviews(helperId: string) {
  const { data, error } = await supabase
    .from('hfh_reviews')
    .select('*')
    .eq('helper_id', helperId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Review[];
}

export async function createHelperProfile(helper: Partial<Helper>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('hfh_helpers')
    .insert([{ ...helper, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Helper;
}

export async function updateHelperProfile(id: string, updates: Partial<Helper>) {
  const { data, error } = await supabase
    .from('hfh_helpers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Helper;
}

// Client Functions
export async function createClientProfile(client: Partial<Client>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('hfh_clients')
    .insert([{ ...client, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

export async function getClientProfile(userId: string) {
  const { data, error } = await supabase
    .from('hfh_clients')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Client | null;
}

// Booking Functions
export async function createBooking(booking: Partial<Booking>) {
  const { data, error } = await supabase
    .from('hfh_bookings')
    .insert([booking])
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
}

export async function getBookingsByHelper(helperId: string) {
  const { data, error } = await supabase
    .from('hfh_bookings')
    .select('*')
    .eq('helper_id', helperId)
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  return data as Booking[];
}

export async function getBookingsByClient(clientId: string) {
  const { data, error } = await supabase
    .from('hfh_bookings')
    .select('*')
    .eq('client_id', clientId)
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  return data as Booking[];
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
) {
  const { data, error } = await supabase
    .from('hfh_bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
}

// Review Functions
export async function createReview(review: Partial<Review>) {
  const { data, error } = await supabase
    .from('hfh_reviews')
    .insert([review])
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

// Service Types
export async function getServiceTypes() {
  const { data, error } = await supabase
    .from('hfh_service_types')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data as ServiceType[];
}

// Search Functions
export async function searchHelpers(searchTerm: string) {
  const { data, error } = await supabase
    .from('hfh_helpers')
    .select('*')
    .eq('verified', true)
    .or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
    .order('rating', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as Helper[];
}

// Favorites Functions
export async function addFavorite(clientId: string, helperId: string) {
  const { data, error } = await supabase
    .from('hfh_favorites')
    .insert([{ client_id: clientId, helper_id: helperId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFavorite(clientId: string, helperId: string) {
  const { error } = await supabase
    .from('hfh_favorites')
    .delete()
    .eq('client_id', clientId)
    .eq('helper_id', helperId);

  if (error) throw error;
}

export async function getFavorites(clientId: string) {
  const { data, error } = await supabase
    .from('hfh_favorites')
    .select('helper_id')
    .eq('client_id', clientId);

  if (error) throw error;
  return data?.map(f => f.helper_id) || [];
}

export async function getFavoriteHelpers(clientId: string) {
  const { data, error } = await supabase
    .from('hfh_favorites')
    .select(`
      helper_id,
      hfh_helpers!inner (
        *
      )
    `)
    .eq('client_id', clientId);

  if (error) throw error;
  return (data?.map((f: any) => f.hfh_helpers).filter(Boolean) || []) as Helper[];
}

export async function isFavorite(clientId: string, helperId: string) {
  const { data, error } = await supabase
    .from('hfh_favorites')
    .select('id')
    .eq('client_id', clientId)
    .eq('helper_id', helperId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
