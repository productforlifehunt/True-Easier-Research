import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'care_connector'
  },
  global: {
    headers: {
      'Accept-Profile': 'care_connector',
      'Content-Profile': 'care_connector'
    }
  }
});

async function addProfessionals() {
  console.log('👨‍⚕️ Adding healthcare professionals to database...');
  
  // Generate IDs that will be used for both users and profiles
  const professionalIds = [
    randomUUID(),
    randomUUID(), 
    randomUUID(),
    randomUUID(),
    randomUUID()
  ];
  
  const professionals = [
    {
      id: professionalIds[0],
      email: 'dr.smith@example.com',
      first_name: 'Robert',
      last_name: 'Smith',
      full_name: 'Dr. Robert Smith',
      role: 'professional',
      years_of_experience: 15,
      location: 'San Francisco, CA',
      phone_number: '415-555-0101',
      average_rating: 4.8,
      reviews_count: 127,
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'
    },
    {
      id: professionalIds[1],
      email: 'dr.johnson@example.com', 
      first_name: 'Emily',
      last_name: 'Johnson',
      full_name: 'Dr. Emily Johnson',
      role: 'professional',
      years_of_experience: 8,
      location: 'San Francisco, CA',
      phone_number: '415-555-0102',
      average_rating: 4.9,
      reviews_count: 89,
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400'
    },
    {
      id: professionalIds[2],
      email: 'nurse.davis@example.com',
      first_name: 'Michael',
      last_name: 'Davis',
      full_name: 'Michael Davis, RN',
      role: 'professional',
      years_of_experience: 12,
      location: 'San Francisco, CA',
      phone_number: '415-555-0103',
      average_rating: 4.7,
      reviews_count: 156,
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400'
    },
    {
      id: professionalIds[3],
      email: 'dr.patel@example.com',
      first_name: 'Priya',
      last_name: 'Patel',
      full_name: 'Dr. Priya Patel',
      role: 'professional',
      years_of_experience: 10,
      location: 'San Francisco, CA',
      phone_number: '415-555-0104',
      average_rating: 4.9,
      reviews_count: 203,
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400'
    },
    {
      id: professionalIds[4],
      email: 'dr.chen@example.com',
      first_name: 'James',
      last_name: 'Chen',
      full_name: 'Dr. James Chen',
      role: 'professional',
      years_of_experience: 18,
      location: 'San Francisco, CA',
      phone_number: '415-555-0105',
      average_rating: 4.8,
      reviews_count: 342,
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'
    }
  ];
  
  // First create users in auth.users table
  console.log('Creating users in auth...');
  for (let i = 0; i < professionals.length; i++) {
    const prof = professionals[i];
    // Sign up each professional as a user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: prof.email,
      password: 'TempPassword123!',
      options: {
        data: {
          id: prof.id,
          email: prof.email
        }
      }
    });
    
    if (authError && !authError.message.includes('already registered')) {
      console.error(`❌ Error creating auth user for ${prof.email}:`, authError);
      continue;
    }
    console.log(`✅ Created/verified auth user for ${prof.email}`);
  }
  
  // Now insert profiles
  console.log('Creating professional profiles...');
  const { data, error } = await supabase
    .from('profiles')
    .upsert(professionals, { onConflict: 'id' });
    
  if (error) {
    console.error('❌ Error adding professional profiles:', error);
    return;
  }
  
  console.log('✅ Successfully added professional profiles!');
  
  // Display the IDs for reference
  if (data && data.length > 0) {
    console.log('📋 Professional IDs:');
    data.forEach(p => {
      console.log(`   - ${p.full_name}: ${p.id}`);
    });
  }
  
  process.exit(0);
}

addProfessionals().catch(console.error);
