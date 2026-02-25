-- Humans for Hire Complete Schema
-- All tables for the enhanced helper marketplace platform

-- Helpers table
CREATE TABLE IF NOT EXISTS care_connector.hfh_helpers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profile_image TEXT,
  bio TEXT,
  service_type TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL,
  location TEXT,
  availability TEXT,
  skills TEXT[],
  languages TEXT[],
  experience_years INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  background_checked BOOLEAN DEFAULT false,
  instant_book BOOLEAN DEFAULT false,
  video_intro TEXT,
  portfolio_images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS care_connector.hfh_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS care_connector.hfh_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID REFERENCES care_connector.hfh_helpers(id),
  client_id UUID REFERENCES care_connector.hfh_clients(id),
  service_type TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Bookings table
CREATE TABLE IF NOT EXISTS care_connector.hfh_recurring_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID REFERENCES care_connector.hfh_helpers(id),
  client_id UUID REFERENCES care_connector.hfh_clients(id),
  service_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  days_of_week TEXT[],
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  total_sessions INTEGER,
  price_per_session DECIMAL(10,2),
  total_price DECIMAL(10,2),
  auto_renew BOOLEAN DEFAULT false,
  special_instructions TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Bookings table
CREATE TABLE IF NOT EXISTS care_connector.hfh_group_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID REFERENCES care_connector.hfh_helpers(id),
  organizer_id UUID,
  event_type TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  location TEXT,
  participant_count INTEGER NOT NULL,
  total_price DECIMAL(10,2),
  price_per_person DECIMAL(10,2),
  split_payment BOOLEAN DEFAULT true,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS care_connector.hfh_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID REFERENCES care_connector.hfh_helpers(id),
  reviewer_id UUID,
  booking_id UUID REFERENCES care_connector.hfh_bookings(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[],
  helpful_count INTEGER DEFAULT 0,
  verified_booking BOOLEAN DEFAULT false,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS care_connector.hfh_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,
  sender_id UUID,
  sender_name TEXT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

-- Location Sharing table
CREATE TABLE IF NOT EXISTS care_connector.hfh_location_sharing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  booking_id UUID,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safety Alerts table
CREATE TABLE IF NOT EXISTS care_connector.hfh_safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  booking_id UUID,
  helper_id UUID,
  alert_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS care_connector.hfh_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  tier_id TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Activities table
CREATE TABLE IF NOT EXISTS care_connector.hfh_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT,
  user_image TEXT,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0
);

-- Favorites table
CREATE TABLE IF NOT EXISTS care_connector.hfh_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  helper_id UUID REFERENCES care_connector.hfh_helpers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, helper_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hfh_helpers_service_type ON care_connector.hfh_helpers(service_type);
CREATE INDEX IF NOT EXISTS idx_hfh_helpers_location ON care_connector.hfh_helpers(location);
CREATE INDEX IF NOT EXISTS idx_hfh_helpers_rating ON care_connector.hfh_helpers(rating);
CREATE INDEX IF NOT EXISTS idx_hfh_bookings_helper_id ON care_connector.hfh_bookings(helper_id);
CREATE INDEX IF NOT EXISTS idx_hfh_bookings_client_id ON care_connector.hfh_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_hfh_reviews_helper_id ON care_connector.hfh_reviews(helper_id);
CREATE INDEX IF NOT EXISTS idx_hfh_messages_conversation_id ON care_connector.hfh_messages(conversation_id);
