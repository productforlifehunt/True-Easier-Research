import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc';

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'care_connector' },
  global: {
    headers: {
      'Accept-Profile': 'care_connector',
      'Content-Profile': 'care_connector'
    }
  }
});

async function setupHumansForHire() {
  console.log('Setting up Humans for Hire platform...');

  // Insert sample helpers
  const sampleHelpers = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '555-0101',
      location: 'Miami, FL',
      bio: 'Experienced companion and caregiver with 5+ years helping seniors stay active and engaged. Love cooking, gardening, and meaningful conversations.',
      hourly_rate: 25,
      services: ['Companionship', 'Errands & Shopping', 'Meal Preparation'],
      verified: true,
      rating: 4.8,
      total_reviews: 24
    },
    {
      name: 'Michael Chen',
      email: 'mchen@example.com',
      phone: '555-0102',
      location: 'Los Angeles, CA',
      bio: 'Tech-savvy helper specializing in technology assistance and transportation. Patient teacher for smartphones and computers.',
      hourly_rate: 30,
      services: ['Technology Help', 'Transportation', 'Companionship'],
      verified: true,
      rating: 4.9,
      total_reviews: 31
    },
    {
      name: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      phone: '555-0103',
      location: 'Miami, FL',
      bio: 'Friendly and reliable helper. Great with pets, light housework, and running errands. Available evenings and weekends.',
      hourly_rate: 20,
      services: ['Pet Care', 'Light Housework', 'Errands & Shopping'],
      verified: true,
      rating: 4.7,
      total_reviews: 18
    },
    {
      name: 'David Kim',
      email: 'david.k@example.com',
      phone: '555-0104',
      location: 'San Francisco, CA',
      bio: 'Certified companion care specialist. Enjoy outdoor activities, cooking healthy meals, and providing excellent companionship.',
      hourly_rate: 28,
      services: ['Companionship', 'Meal Preparation', 'Light Housework'],
      verified: true,
      rating: 5.0,
      total_reviews: 12
    },
    {
      name: 'Jessica Martinez',
      email: 'jmartinez@example.com',
      phone: '555-0105',
      location: 'Austin, TX',
      bio: 'Passionate about helping others maintain their independence. Skilled in meal prep, gardening, and creating a warm atmosphere.',
      hourly_rate: 22,
      services: ['Meal Preparation', 'Gardening', 'Companionship'],
      verified: true,
      rating: 4.6,
      total_reviews: 15
    },
    {
      name: 'Robert Thompson',
      email: 'rthompson@example.com',
      phone: '555-0106',
      location: 'Chicago, IL',
      bio: 'Reliable and trustworthy. Specialized in transportation and errands. Former professional driver with clean record.',
      hourly_rate: 24,
      services: ['Transportation', 'Errands & Shopping', 'Light Housework'],
      verified: true,
      rating: 4.8,
      total_reviews: 22
    },
    {
      name: 'Amanda Lee',
      email: 'alee@example.com',
      phone: '555-0107',
      location: 'Miami, FL',
      bio: 'Warm and caring companion with background in senior care. Love arts, crafts, and creating joyful moments together.',
      hourly_rate: 26,
      services: ['Companionship', 'Light Housework', 'Errands & Shopping'],
      verified: true,
      rating: 4.9,
      total_reviews: 28
    },
    {
      name: 'James Wilson',
      email: 'jwilson@example.com',
      phone: '555-0108',
      location: 'Seattle, WA',
      bio: 'Tech expert and patient teacher. Help with computers, smartphones, smart home devices. Also available for errands.',
      hourly_rate: 32,
      services: ['Technology Help', 'Errands & Shopping', 'Companionship'],
      verified: true,
      rating: 4.7,
      total_reviews: 19
    }
  ];

  try {
    // Check if helpers table exists and insert sample data
    const { data: existingHelpers, error: checkError } = await supabase
      .from('hfh_helpers')
      .select('id')
      .limit(1);

    if (checkError) {
      console.log('⚠️  Tables may not exist yet. Error:', checkError.message);
      console.log('📝 Please run the migration SQL file manually in Supabase dashboard');
      console.log('   Go to: SQL Editor in Supabase and paste the contents of:');
      console.log('   supabase/migrations/20250111_humans_for_hire_schema.sql');
      return;
    }

    // Insert helpers
    for (const helper of sampleHelpers) {
      const { data, error } = await supabase
        .from('hfh_helpers')
        .insert([helper])
        .select();

      if (error) {
        console.log(`❌ Error inserting ${helper.name}:`, error.message);
      } else {
        console.log(`✅ Added helper: ${helper.name}`);
      }
    }

    console.log('\n🎉 Setup complete!');
    console.log('📊 Added', sampleHelpers.length, 'sample helpers');
    console.log('🌐 Visit http://localhost:4002/humans-for-hire to see the landing page');
    console.log('🔍 Visit http://localhost:4002/humans-for-hire/browse to browse helpers');

  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupHumansForHire();
