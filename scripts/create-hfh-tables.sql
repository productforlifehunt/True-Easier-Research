-- Create Humans for Hire tables in care_connector schema

-- Service types lookup
CREATE TABLE IF NOT EXISTS care_connector.hfh_service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  active BOOLEAN DEFAULT true
);

-- Helper profiles
CREATE TABLE IF NOT EXISTS care_connector.hfh_helpers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT NOT NULL,
  bio TEXT,
  hourly_rate DECIMAL(10,2),
  availability JSONB DEFAULT '[]',
  services JSONB DEFAULT '[]',
  verified BOOLEAN DEFAULT false,
  background_check_status TEXT DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  profile_image_url TEXT,
  years_experience INTEGER DEFAULT 0,
  languages JSONB DEFAULT '["English"]',
  response_time_hours INTEGER DEFAULT 2,
  instant_book BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client profiles
CREATE TABLE IF NOT EXISTS care_connector.hfh_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS care_connector.hfh_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES care_connector.hfh_clients(id),
  helper_id UUID REFERENCES care_connector.hfh_helpers(id),
  service TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  location TEXT NOT NULL,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending',
  total_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS care_connector.hfh_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES care_connector.hfh_bookings(id),
  client_id UUID REFERENCES care_connector.hfh_clients(id),
  helper_id UUID REFERENCES care_connector.hfh_helpers(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS care_connector.hfh_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID,
  receiver_id UUID,
  booking_id UUID REFERENCES care_connector.hfh_bookings(id),
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS care_connector.hfh_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES care_connector.hfh_clients(id),
  helper_id UUID REFERENCES care_connector.hfh_helpers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, helper_id)
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
  ('Gardening', 'Yard work, plant care, outdoor tasks', '🌱'),
  ('Child Care', 'Babysitting, tutoring, activities', '👶'),
  ('Senior Care', 'Daily assistance, medication reminders', '👵'),
  ('Personal Assistant', 'Admin tasks, scheduling, organizing', '💼'),
  ('Fitness Training', 'Personal training, yoga, wellness', '💪'),
  ('Local Guide', 'Tours, local expertise, translation', '🗺️'),
  ('Handyman', 'Home repairs, maintenance, assembly', '🔧')
ON CONFLICT (name) DO NOTHING;

-- Sample helpers with diverse profiles
INSERT INTO care_connector.hfh_helpers (
  name, email, phone, location, bio, hourly_rate, services, 
  verified, background_check_status, rating, total_reviews,
  years_experience, languages, response_time_hours, instant_book
) VALUES
  ('Sarah Johnson', 'sarah.j@example.com', '(305) 555-0101', 'Miami, FL', 
   'Experienced companion with 5+ years helping seniors stay active and engaged. I love cooking healthy meals, organizing fun activities, and providing genuine companionship. Certified in CPR and first aid.',
   28, '["Companionship", "Meal Preparation", "Light Housework"]'::jsonb,
   true, 'completed', 4.9, 47, 5, '["English", "Spanish"]'::jsonb, 1, true),
   
  ('Michael Chen', 'mchen@example.com', '(213) 555-0102', 'Los Angeles, CA',
   'Tech-savvy helper specializing in technology assistance and transportation. Patient teacher for smartphones, computers, and smart home devices. Clean driving record with comfortable sedan.',
   35, '["Technology Help", "Transportation", "Errands & Shopping"]'::jsonb,
   true, 'completed', 4.8, 31, 3, '["English", "Mandarin"]'::jsonb, 2, true),
   
  ('Emily Rodriguez', 'emily.r@example.com', '(305) 555-0103', 'Miami, FL',
   'Friendly and reliable helper with a passion for animals. Great with pets, light housework, and running errands. Available evenings and weekends. Bilingual English/Spanish.',
   24, '["Pet Care", "Light Housework", "Errands & Shopping"]'::jsonb,
   true, 'completed', 5.0, 18, 2, '["English", "Spanish"]'::jsonb, 1, true),
   
  ('David Kim', 'david.k@example.com', '(415) 555-0104', 'San Francisco, CA',
   'Certified companion care specialist with background in social work. Enjoy outdoor activities, cooking healthy meals, and meaningful conversations. Specialized in dementia care support.',
   42, '["Companionship", "Meal Preparation", "Transportation"]'::jsonb,
   true, 'completed', 4.9, 63, 8, '["English", "Korean"]'::jsonb, 2, false),
   
  ('Jessica Martinez', 'jmartinez@example.com', '(512) 555-0105', 'Austin, TX',
   'Passionate about helping others maintain independence. Skilled in meal prep, gardening, and creating a warm, supportive atmosphere. Former chef with nutrition expertise.',
   30, '["Meal Preparation", "Gardening", "Companionship"]'::jsonb,
   true, 'completed', 4.7, 22, 4, '["English"]'::jsonb, 3, true),
   
  ('Robert Thompson', 'rthompson@example.com', '(312) 555-0106', 'Chicago, IL',
   'Reliable and trustworthy with 10+ years experience. Former professional driver with spotless record. Excellent at organizing, errands, and household management.',
   32, '["Transportation", "Errands & Shopping", "Light Housework"]'::jsonb,
   true, 'completed', 4.8, 89, 10, '["English"]'::jsonb, 1, true),
   
  ('Amanda Lee', 'alee@example.com', '(305) 555-0107', 'Miami, FL',
   'Warm and caring companion with nursing assistant background. Love arts, crafts, and creating joyful moments. Specialized in mobility assistance and medication reminders.',
   38, '["Senior Care", "Companionship", "Light Housework"]'::jsonb,
   true, 'completed', 5.0, 52, 6, '["English", "French"]'::jsonb, 1, true),
   
  ('James Wilson', 'jwilson@example.com', '(206) 555-0108', 'Seattle, WA',
   'Tech expert helping seniors navigate the digital world. Patient teacher for video calls, online shopping, and smart devices. Also available for errands and companionship.',
   40, '["Technology Help", "Companionship", "Errands & Shopping"]'::jsonb,
   true, 'completed', 4.9, 27, 3, '["English"]'::jsonb, 2, false),
   
  ('Maria Gonzalez', 'mgonzalez@example.com', '(305) 555-0109', 'Miami, FL',
   'Dedicated caregiver fluent in English and Spanish. Specializing in companionship, meal preparation with Latin cuisine expertise, and household organization.',
   26, '["Companionship", "Meal Preparation", "Light Housework"]'::jsonb,
   true, 'completed', 4.8, 41, 5, '["English", "Spanish"]'::jsonb, 2, true),
   
  ('Thomas Anderson', 'tanderson@example.com', '(617) 555-0110', 'Boston, MA',
   'Former teacher with patience and compassion. Excellent at companionship, organizing activities, and helping with technology. Chess enthusiast and great conversationalist.',
   34, '["Companionship", "Technology Help", "Light Housework"]'::jsonb,
   true, 'completed', 4.7, 35, 7, '["English"]'::jsonb, 3, false),
   
  ('Lisa Park', 'lpark@example.com', '(415) 555-0111', 'San Francisco, CA',
   'Professional child care provider with early childhood education degree. Creative, energetic, and safety-focused. Experience with special needs children.',
   45, '["Child Care", "Tutoring", "Meal Preparation"]'::jsonb,
   true, 'completed', 5.0, 78, 12, '["English", "Korean"]'::jsonb, 1, true),
   
  ('Carlos Rivera', 'crivera@example.com', '(212) 555-0112', 'New York, NY',
   'Certified personal trainer and wellness coach. Specializing in senior fitness, yoga, and nutrition guidance. Making exercise fun and accessible for all ages.',
   55, '["Fitness Training", "Companionship", "Transportation"]'::jsonb,
   true, 'completed', 4.9, 44, 8, '["English", "Spanish"]'::jsonb, 2, true),
   
  ('Sophie Chen', 'schen@example.com', '(305) 555-0113', 'Miami, FL',
   'Professional dog walker and pet sitter. Experienced with all breeds and sizes. Pet first aid certified. Your furry friends will love me!',
   28, '["Pet Care", "Errands & Shopping", "Light Housework"]'::jsonb,
   true, 'completed', 5.0, 93, 4, '["English", "Mandarin"]'::jsonb, 1, true),
   
  ('Mark Davis', 'mdavis@example.com', '(503) 555-0114', 'Portland, OR',
   'Licensed tour guide with deep knowledge of local history and culture. Fluent in three languages. Making every tour memorable and educational.',
   60, '["Local Guide", "Transportation", "Companionship"]'::jsonb,
   true, 'completed', 4.9, 67, 15, '["English", "French", "Spanish"]'::jsonb, 2, false),
   
  ('Jennifer White', 'jwhite@example.com', '(415) 555-0115', 'San Francisco, CA',
   'Professional organizer and personal assistant. Excel at decluttering, scheduling, and making life easier. Your peace of mind is my priority.',
   48, '["Personal Assistant", "Light Housework", "Errands & Shopping"]'::jsonb,
   true, 'completed', 4.8, 29, 6, '["English"]'::jsonb, 1, true);
