import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc';

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'care_connector' }
});

// First, let's create the tables if they don't exist
const createTables = `
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default service types if not exist
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
`;

async function setupAndSeedData() {
  console.log('🚀 Setting up Humans for Hire database...\n');

  // Sample helpers with diverse profiles
  const sampleHelpers = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '(305) 555-0101',
      location: 'Miami, FL',
      bio: 'Experienced companion with 5+ years helping seniors stay active and engaged. I love cooking healthy meals, organizing fun activities, and providing genuine companionship. Certified in CPR and first aid.',
      hourly_rate: 28,
      services: ['Companionship', 'Meal Preparation', 'Light Housework'],
      verified: true,
      background_check_status: 'completed',
      rating: 4.9,
      total_reviews: 47
    },
    {
      name: 'Michael Chen',
      email: 'mchen@example.com',
      phone: '(213) 555-0102',
      location: 'Los Angeles, CA',
      bio: 'Tech-savvy helper specializing in technology assistance and transportation. Patient teacher for smartphones, computers, and smart home devices. Clean driving record with comfortable sedan.',
      hourly_rate: 35,
      services: ['Technology Help', 'Transportation', 'Errands & Shopping'],
      verified: true,
      background_check_status: 'completed',
      rating: 4.8,
      total_reviews: 31
    },
    {
      name: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      phone: '(305) 555-0103',
      location: 'Miami, FL',
      bio: 'Friendly and reliable helper with a passion for animals. Great with pets, light housework, and running errands. Available evenings and weekends. Bilingual English/Spanish.',
      hourly_rate: 24,
      services: ['Pet Care', 'Light Housework', 'Errands & Shopping'],
      verified: true,
      background_check_status: 'completed',
      rating: 5.0,
      total_reviews: 18
    },
    {
      name: 'David Kim',
      email: 'david.k@example.com',
      phone: '(415) 555-0104',
      location: 'San Francisco, CA',
      bio: 'Certified companion care specialist with background in social work. Enjoy outdoor activities, cooking healthy meals, and meaningful conversations. Specialized in dementia care support.',
      hourly_rate: 42,
      services: ['Companionship', 'Meal Preparation', 'Transportation'],
      verified: true,
      background_check_status: 'completed',
      rating: 4.9,
      total_reviews: 63
    },
    {
      name: 'Jessica Martinez',
      email: 'jmartinez@example.com',
      phone: '(512) 555-0105',
      location: 'Austin, TX',
      bio: 'Passionate about helping others maintain independence. Skilled in meal prep, gardening, and creating a warm, supportive atmosphere. Former chef with nutrition expertise.',
      hourly_rate: 30,
      services: ['Meal Preparation', 'Gardening', 'Companionship'],
      verified: true,
      background_check_status: 'completed',
      rating: 4.7,
      total_reviews: 22
    },
    {
      name: 'Robert Thompson',
      email: 'rthompson@example.com',
      phone: '(312) 555-0106',
      location: 'Chicago, IL',
      bio: 'Reliable and trustworthy with 10+ years experience. Former professional driver with spotless record. Excellent at organizing, errands, and household management.',
      hourly_rate: 32,
      services: ['Transportation', 'Errands & Shopping', 'Light Housework'],
      verified: true,
      background_check_status: 'completed',
      rating: 4.8,
      total_reviews: 89
    },
    {
      name: 'Amanda Lee',
      email: 'alee@example.com',
      phone: '(305) 555-0107',
      location: 'Miami, FL',
      bio: 'Warm and caring companion with nursing assistant background. Love arts, crafts, and creating joyful moments. Specialized in mobility assistance and medication reminders.',
      hourly_rate: 38,
      services: ['Companionship', 'Light Housework', 'Meal Preparation'],
      verified: true,
      background_check_status: 'completed',
      rating: 5.0,
      total_reviews: 52
    },
    {
      name: 'James Wilson',
      email: 'jwilson@example.com',
      phone: '(206) 555-0108',
      location: 'Seattle, WA',
      bio: 'Tech expert helping seniors navigate the digital world. Patient teacher for video calls, online shopping, and smart devices. Also available for errands and companionship.',
      hourly_rate: 40,
      services: ['Technology Help', 'Companionship', 'Errands & Shopping'],
      verified: true,
      background_check_status: 'completed',
      rating: 4.9,
      total_reviews: 27
    },
    {
      name: 'Maria Gonzalez',
      email: 'mgonzalez@example.com',
      phone: '(305) 555-0109',
      location: 'Miami, FL',
      bio: 'Dedicated caregiver fluent in English and Spanish. Specializing in companionship, meal preparation with Latin cuisine expertise, and household organization.',
      hourly_rate: 26,
      services: ['Companionship', 'Meal Preparation', 'Light Housework'],
      verified: true,
      background_check_status: 'completed',
      rating: 4.8,
      total_reviews: 41
    },
    {
      name: 'Thomas Anderson',
      email: 'tanderson@example.com',
      phone: '(617) 555-0110',
      location: 'Boston, MA',
      bio: 'Former teacher with patience and compassion. Excellent at companionship, organizing activities, and helping with technology. Chess enthusiast and great conversationalist.',
      hourly_rate: 34,
      services: ['Companionship', 'Technology Help', 'Light Housework'],
      verified: true,
      background_check_status: 'completed',
      rating: 4.7,
      total_reviews: 35
    }
  ];

  try {
    // First, run the CREATE TABLE statements via raw SQL
    console.log('📋 Creating tables if they don\'t exist...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: createTables
    }).select();
    
    if (createError) {
      console.log('⚠️  Could not create tables via RPC. Trying direct insertion...');
    }

    // Check if helpers table exists and has data
    const { data: existingHelpers, error: checkError } = await supabase
      .from('hfh_helpers')
      .select('id')
      .limit(1);

    if (checkError) {
      console.log('⚠️  Helpers table may not exist:', checkError.message);
      console.log('\n📝 Please run the following SQL in your Supabase SQL Editor:');
      console.log('----------------------------------------');
      console.log(createTables);
      console.log('----------------------------------------\n');
      return;
    }

    // If helpers already exist, skip seeding
    if (existingHelpers && existingHelpers.length > 0) {
      console.log('✅ Helpers already exist in database. Skipping seed...');
      return;
    }

    // Insert helpers
    console.log('👥 Adding sample helpers...\n');
    
    for (const helper of sampleHelpers) {
      const { data, error } = await supabase
        .from('hfh_helpers')
        .insert([helper])
        .select();

      if (error) {
        console.log(`❌ Error adding ${helper.name}:`, error.message);
      } else {
        console.log(`✅ Added: ${helper.name} - ${helper.location} - $${helper.hourly_rate}/hr`);
      }
    }

    console.log('\n🎉 Setup complete!');
    console.log('📊 Added', sampleHelpers.length, 'sample helpers');
    console.log('\n🌐 Visit http://localhost:4002/humans-for-hire to see your platform!');
    console.log('🔍 Browse helpers at http://localhost:4002/humans-for-hire/browse');

  } catch (error) {
    console.error('❌ Setup error:', error);
    console.log('\n💡 If you see errors, please run the SQL above in your Supabase dashboard first.');
  }
}

setupAndSeedData();
