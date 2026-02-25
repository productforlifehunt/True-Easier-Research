-- Humans for Hire Platform Schema
-- All tables in care_connector schema

-- Waitlist signups
CREATE TABLE IF NOT EXISTS care_connector.hfh_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL CHECK (user_type IN ('helper', 'client')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'contacted', 'onboarded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper profiles
CREATE TABLE IF NOT EXISTS care_connector.hfh_helpers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT NOT NULL,
  bio TEXT,
  hourly_rate DECIMAL(10,2),
  availability JSONB DEFAULT '[]',
  services JSONB DEFAULT '[]', -- Array of service types
  verified BOOLEAN DEFAULT false,
  background_check_status TEXT DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client profiles
CREATE TABLE IF NOT EXISTS care_connector.hfh_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT NOT NULL,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS care_connector.hfh_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID REFERENCES care_connector.hfh_helpers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES care_connector.hfh_clients(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS care_connector.hfh_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES care_connector.hfh_bookings(id) ON DELETE CASCADE,
  helper_id UUID REFERENCES care_connector.hfh_helpers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES care_connector.hfh_clients(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS care_connector.hfh_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  booking_id UUID REFERENCES care_connector.hfh_bookings(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service types lookup
CREATE TABLE IF NOT EXISTS care_connector.hfh_service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  active BOOLEAN DEFAULT true
);

-- Insert default service types
INSERT INTO care_connector.hfh_service_types (name, description, icon) VALUES
  ('Companionship', 'Social visits, conversation, and activities', '🤝'),
  ('Errands & Shopping', 'Grocery shopping, pharmacy runs, errands', '🛒'),
  ('Transportation', 'Rides to appointments, events, activities', '🚗'),
  ('Light Housework', 'Cleaning, organizing, laundry', '🧹'),
  ('Meal Preparation', 'Cooking, meal planning, food prep', '🍳'),
  ('Technology Help', 'Phone, computer, device assistance', '💻'),
  ('Pet Care', 'Walking, feeding, pet sitting', '🐕'),
  ('Gardening', 'Yard work, plant care, outdoor tasks', '🌱')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE care_connector.hfh_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.hfh_helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.hfh_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.hfh_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.hfh_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.hfh_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.hfh_service_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Waitlist: Anyone can insert, only admins can view/update
CREATE POLICY "Anyone can join waitlist" ON care_connector.hfh_waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own waitlist entry" ON care_connector.hfh_waitlist
  FOR SELECT USING (email = auth.jwt()->>'email');

-- Helpers: Public can view verified helpers, users can manage own profile
CREATE POLICY "Anyone can view verified helpers" ON care_connector.hfh_helpers
  FOR SELECT USING (verified = true);

CREATE POLICY "Users can insert own helper profile" ON care_connector.hfh_helpers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own helper profile" ON care_connector.hfh_helpers
  FOR UPDATE USING (auth.uid() = user_id);

-- Clients: Users can manage own profile
CREATE POLICY "Users can view own client profile" ON care_connector.hfh_clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client profile" ON care_connector.hfh_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client profile" ON care_connector.hfh_clients
  FOR UPDATE USING (auth.uid() = user_id);

-- Bookings: Helpers and clients can view their own bookings
CREATE POLICY "Helpers can view their bookings" ON care_connector.hfh_bookings
  FOR SELECT USING (
    helper_id IN (SELECT id FROM care_connector.hfh_helpers WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can view their bookings" ON care_connector.hfh_bookings
  FOR SELECT USING (
    client_id IN (SELECT id FROM care_connector.hfh_clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can create bookings" ON care_connector.hfh_bookings
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM care_connector.hfh_clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Helpers can update their bookings" ON care_connector.hfh_bookings
  FOR UPDATE USING (
    helper_id IN (SELECT id FROM care_connector.hfh_helpers WHERE user_id = auth.uid())
  );

-- Reviews: Public can view, clients can create for completed bookings
CREATE POLICY "Anyone can view reviews" ON care_connector.hfh_reviews
  FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews for completed bookings" ON care_connector.hfh_reviews
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM care_connector.hfh_clients WHERE user_id = auth.uid())
    AND booking_id IN (SELECT id FROM care_connector.hfh_bookings WHERE status = 'completed')
  );

-- Messages: Users can view and send their own messages
CREATE POLICY "Users can view their messages" ON care_connector.hfh_messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON care_connector.hfh_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Service types: Everyone can view
CREATE POLICY "Anyone can view service types" ON care_connector.hfh_service_types
  FOR SELECT USING (active = true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hfh_helpers_location ON care_connector.hfh_helpers(location);
CREATE INDEX IF NOT EXISTS idx_hfh_helpers_rating ON care_connector.hfh_helpers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_hfh_helpers_verified ON care_connector.hfh_helpers(verified);
CREATE INDEX IF NOT EXISTS idx_hfh_bookings_helper ON care_connector.hfh_bookings(helper_id);
CREATE INDEX IF NOT EXISTS idx_hfh_bookings_client ON care_connector.hfh_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_hfh_bookings_date ON care_connector.hfh_bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_hfh_messages_receiver ON care_connector.hfh_messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hfh_reviews_helper ON care_connector.hfh_reviews(helper_id);

-- Function to update helper rating after review
CREATE OR REPLACE FUNCTION care_connector.update_helper_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE care_connector.hfh_helpers
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM care_connector.hfh_reviews
      WHERE helper_id = NEW.helper_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM care_connector.hfh_reviews
      WHERE helper_id = NEW.helper_id
    ),
    updated_at = NOW()
  WHERE id = NEW.helper_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating after review insert
CREATE TRIGGER update_helper_rating_trigger
AFTER INSERT ON care_connector.hfh_reviews
FOR EACH ROW
EXECUTE FUNCTION care_connector.update_helper_rating();
