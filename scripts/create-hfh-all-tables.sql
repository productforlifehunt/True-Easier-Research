-- Comprehensive Humans for Hire Database Schema
-- World-class gig marketplace platform

-- Drop existing tables if they exist
DROP TABLE IF EXISTS hfh_reviews CASCADE;
DROP TABLE IF EXISTS hfh_messages CASCADE;
DROP TABLE IF EXISTS hfh_conversations CASCADE;
DROP TABLE IF EXISTS hfh_bookings CASCADE;
DROP TABLE IF EXISTS hfh_availability CASCADE;
DROP TABLE IF EXISTS hfh_helper_services CASCADE;
DROP TABLE IF EXISTS hfh_service_packages CASCADE;
DROP TABLE IF EXISTS hfh_helpers CASCADE;
DROP TABLE IF EXISTS hfh_clients CASCADE;
DROP TABLE IF EXISTS hfh_users CASCADE;
DROP TABLE IF EXISTS hfh_service_categories CASCADE;
DROP TABLE IF EXISTS hfh_locations CASCADE;
DROP TABLE IF EXISTS hfh_background_checks CASCADE;
DROP TABLE IF EXISTS hfh_certifications CASCADE;
DROP TABLE IF EXISTS hfh_helper_media CASCADE;
DROP TABLE IF EXISTS hfh_favorite_helpers CASCADE;
DROP TABLE IF EXISTS hfh_transactions CASCADE;
DROP TABLE IF EXISTS hfh_promo_codes CASCADE;
DROP TABLE IF EXISTS hfh_referrals CASCADE;
DROP TABLE IF EXISTS hfh_rewards_points CASCADE;
DROP TABLE IF EXISTS hfh_corporate_accounts CASCADE;
DROP TABLE IF EXISTS hfh_team_members CASCADE;

-- Service Categories (comprehensive list)
CREATE TABLE hfh_service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  featured BOOLEAN DEFAULT false,
  parent_category_id UUID REFERENCES hfh_service_categories(id),
  keywords TEXT[],
  average_hourly_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations with geocoding
CREATE TABLE hfh_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'USA',
  postal_code VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  formatted_address TEXT,
  place_id VARCHAR(255), -- Google Places ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Users table
CREATE TABLE hfh_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID UNIQUE, -- Links to auth.users
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(200),
  date_of_birth DATE,
  gender VARCHAR(50), -- inclusive options
  profile_photo_url TEXT,
  location_id UUID REFERENCES hfh_locations(id),
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('client', 'helper', 'both')),
  account_type VARCHAR(50) DEFAULT 'individual' CHECK (account_type IN ('individual', 'corporate')),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  preferred_language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Helpers table with all features
CREATE TABLE hfh_helpers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES hfh_users(id) ON DELETE CASCADE,
  bio TEXT,
  tagline VARCHAR(200),
  hourly_rate DECIMAL(10,2),
  min_booking_hours INTEGER DEFAULT 1,
  max_travel_distance INTEGER DEFAULT 25,
  years_experience INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT ARRAY['English'],
  skills TEXT[],
  
  -- Availability settings
  instant_book BOOLEAN DEFAULT false,
  advance_notice_hours INTEGER DEFAULT 24,
  cancellation_policy VARCHAR(50) DEFAULT 'flexible',
  
  -- Verification & Trust
  identity_verified BOOLEAN DEFAULT false,
  identity_verified_at TIMESTAMPTZ,
  background_check_status VARCHAR(50) DEFAULT 'pending',
  background_check_completed_at TIMESTAMPTZ,
  background_check_provider VARCHAR(100),
  insurance_verified BOOLEAN DEFAULT false,
  insurance_expiry DATE,
  
  -- Performance metrics
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  response_time_minutes INTEGER,
  response_rate DECIMAL(5,2),
  acceptance_rate DECIMAL(5,2),
  on_time_rate DECIMAL(5,2),
  completion_rate DECIMAL(5,2),
  
  -- Profile completeness
  profile_completion INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  premium_member BOOLEAN DEFAULT false,
  premium_expiry DATE,
  
  -- Video profile
  intro_video_url TEXT,
  intro_video_thumbnail TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ
);

-- Helper Services mapping
CREATE TABLE hfh_helper_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_id UUID REFERENCES hfh_helpers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES hfh_service_categories(id),
  custom_rate DECIMAL(10,2),
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Packages for recurring/bundle deals
CREATE TABLE hfh_service_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_id UUID REFERENCES hfh_helpers(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  package_type VARCHAR(50) CHECK (package_type IN ('hourly', 'daily', 'weekly', 'monthly', 'custom')),
  hours_included INTEGER,
  price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2),
  valid_days INTEGER DEFAULT 30,
  max_uses INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Background Checks
CREATE TABLE hfh_background_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_id UUID REFERENCES hfh_helpers(id) ON DELETE CASCADE,
  check_type VARCHAR(100),
  provider VARCHAR(100),
  status VARCHAR(50),
  result JSONB,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications & Licenses
CREATE TABLE hfh_certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_id UUID REFERENCES hfh_helpers(id) ON DELETE CASCADE,
  type VARCHAR(100),
  name VARCHAR(200),
  issuer VARCHAR(200),
  issue_date DATE,
  expiry_date DATE,
  document_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper Media (photos, videos)
CREATE TABLE hfh_helper_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_id UUID REFERENCES hfh_helpers(id) ON DELETE CASCADE,
  media_type VARCHAR(50) CHECK (media_type IN ('photo', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper Availability Calendar
CREATE TABLE hfh_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_id UUID REFERENCES hfh_helpers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  recurring_pattern VARCHAR(50), -- daily, weekly, monthly
  recurring_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(helper_id, date, start_time)
);

-- Clients table
CREATE TABLE hfh_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES hfh_users(id) ON DELETE CASCADE,
  preferred_helpers UUID[],
  blocked_helpers UUID[],
  default_location_id UUID REFERENCES hfh_locations(id),
  payment_method_id VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_expiry DATE,
  loyalty_points INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings with all features
CREATE TABLE hfh_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_id UUID REFERENCES hfh_helpers(id),
  client_id UUID REFERENCES hfh_clients(id),
  service_category_id UUID REFERENCES hfh_service_categories(id),
  package_id UUID REFERENCES hfh_service_packages(id),
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours DECIMAL(4,2),
  
  -- Location
  location_id UUID REFERENCES hfh_locations(id),
  is_remote BOOLEAN DEFAULT false,
  
  -- Booking details
  booking_type VARCHAR(50) DEFAULT 'instant' CHECK (booking_type IN ('instant', 'request', 'recurring')),
  status VARCHAR(50) DEFAULT 'pending',
  special_instructions TEXT,
  group_size INTEGER DEFAULT 1,
  
  -- Pricing
  hourly_rate DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  insurance_fee DECIMAL(10,2),
  tip_amount DECIMAL(10,2) DEFAULT 0,
  promo_discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(50),
  recurring_end_date DATE,
  parent_booking_id UUID REFERENCES hfh_bookings(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES hfh_users(id),
  cancellation_reason TEXT
);

-- Conversations
CREATE TABLE hfh_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES hfh_users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES hfh_users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES hfh_bookings(id),
  last_message_at TIMESTAMPTZ,
  user1_unread_count INTEGER DEFAULT 0,
  user2_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Messages
CREATE TABLE hfh_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES hfh_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES hfh_users(id),
  content TEXT NOT NULL,
  attachments JSONB,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews with detailed ratings
CREATE TABLE hfh_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES hfh_bookings(id) UNIQUE,
  helper_id UUID REFERENCES hfh_helpers(id),
  client_id UUID REFERENCES hfh_clients(id),
  
  -- Overall rating
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- Detailed ratings
  professionalism_rating DECIMAL(2,1),
  communication_rating DECIMAL(2,1),
  punctuality_rating DECIMAL(2,1),
  quality_rating DECIMAL(2,1),
  value_rating DECIMAL(2,1),
  
  -- Media
  photos TEXT[],
  
  -- Helper response
  helper_response TEXT,
  helper_response_at TIMESTAMPTZ,
  
  -- Verification
  verified_booking BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorite Helpers
CREATE TABLE hfh_favorite_helpers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES hfh_clients(id) ON DELETE CASCADE,
  helper_id UUID REFERENCES hfh_helpers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, helper_id)
);

-- Transactions
CREATE TABLE hfh_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES hfh_bookings(id),
  user_id UUID REFERENCES hfh_users(id),
  type VARCHAR(50) CHECK (type IN ('payment', 'refund', 'payout', 'tip')),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_intent_id VARCHAR(255),
  transfer_id VARCHAR(255),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo Codes
CREATE TABLE hfh_promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(50) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2),
  min_booking_amount DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals
CREATE TABLE hfh_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES hfh_users(id),
  referred_id UUID REFERENCES hfh_users(id),
  referral_code VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  referrer_reward_amount DECIMAL(10,2),
  referred_discount_amount DECIMAL(10,2),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards Points
CREATE TABLE hfh_rewards_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES hfh_users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type VARCHAR(50),
  description TEXT,
  booking_id UUID REFERENCES hfh_bookings(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corporate Accounts
CREATE TABLE hfh_corporate_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  admin_user_id UUID REFERENCES hfh_users(id),
  billing_email VARCHAR(255),
  tax_id VARCHAR(50),
  address_id UUID REFERENCES hfh_locations(id),
  credit_limit DECIMAL(12,2),
  current_balance DECIMAL(12,2) DEFAULT 0,
  payment_terms INTEGER DEFAULT 30, -- net days
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members for Corporate Accounts
CREATE TABLE hfh_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  corporate_account_id UUID REFERENCES hfh_corporate_accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES hfh_users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  spending_limit DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(corporate_account_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_helpers_user_id ON hfh_helpers(user_id);
CREATE INDEX idx_helpers_rating ON hfh_helpers(rating DESC);
CREATE INDEX idx_helpers_location ON hfh_helpers(user_id);
CREATE INDEX idx_bookings_helper_id ON hfh_bookings(helper_id);
CREATE INDEX idx_bookings_client_id ON hfh_bookings(client_id);
CREATE INDEX idx_bookings_date ON hfh_bookings(scheduled_date);
CREATE INDEX idx_bookings_status ON hfh_bookings(status);
CREATE INDEX idx_messages_conversation ON hfh_messages(conversation_id);
CREATE INDEX idx_messages_created ON hfh_messages(created_at DESC);
CREATE INDEX idx_reviews_helper ON hfh_reviews(helper_id);
CREATE INDEX idx_availability_helper_date ON hfh_availability(helper_id, date);

-- Insert initial service categories
INSERT INTO hfh_service_categories (slug, name, description, icon, featured) VALUES
('rent-a-friend', 'Rent a Friend', 'Companionship for events, activities, or just hanging out', '👥', true),
('tour-guide', 'Tour & Local Guide', 'Discover your city or destination with local experts', '🗺️', true),
('errand-services', 'Errand Services', 'Get help with daily tasks and errands', '🏃', true),
('childcare', 'Childcare & Babysitting', 'Trusted caregivers for your children', '👶', false),
('senior-care', 'Senior Care', 'Compassionate care for elderly loved ones', '👴', false),
('pet-care', 'Pet Care', 'Loving care for your furry friends', '🐕', false),
('housekeeping', 'Housekeeping & Cleaning', 'Professional home cleaning services', '🏠', false),
('handyman', 'Handyman & Repairs', 'Home repairs and maintenance', '🔧', false),
('virtual-assistant', 'Virtual Assistant', 'Remote help with tasks', '💻', true),
('moving-help', 'Moving & Delivery', 'Help with moving and heavy lifting', '📦', false),
('personal-training', 'Personal Training & Fitness', 'Get fit with personal trainers', '💪', false),
('event-help', 'Event & Party Help', 'Make your events memorable', '🎉', false),
('tech-support', 'Tech Support', 'Help with technology and devices', '🖥️', false),
('beauty-wellness', 'Beauty & Wellness', 'Personal beauty and wellness', '💅', false),
('lessons-tutoring', 'Lessons & Tutoring', 'Learn new skills', '📚', false);

-- Add subcategories for Rent-a-Friend
INSERT INTO hfh_service_categories (slug, name, parent_category_id, icon) 
SELECT 
  'rent-friend-' || slug,
  name,
  (SELECT id FROM hfh_service_categories WHERE slug = 'rent-a-friend'),
  icon
FROM (VALUES 
  ('events', 'Event Companion', '🎉'),
  ('activities', 'Activity Partner', '⚽'),
  ('travel', 'Travel Buddy', '✈️'),
  ('social', 'Social Companion', '☕'),
  ('virtual', 'Virtual Friend', '💻'),
  ('citywalk', 'City Walk Companion', '🚶')
) AS t(slug, name, icon);

-- Add subcategories for Errand Services
INSERT INTO hfh_service_categories (slug, name, parent_category_id, icon)
SELECT 
  'errand-' || slug,
  name,
  (SELECT id FROM hfh_service_categories WHERE slug = 'errand-services'),
  icon
FROM (VALUES
  ('grocery', 'Grocery Shopping', '🛒'),
  ('package', 'Package & Mail Services', '📬'),
  ('prescription', 'Prescription Pickup', '💊'),
  ('drycleaning', 'Dry Cleaning', '👔'),
  ('waiting', 'Waiting Services', '⏰'),
  ('returns', 'Returns & Exchanges', '🔄')
) AS t(slug, name, icon);
