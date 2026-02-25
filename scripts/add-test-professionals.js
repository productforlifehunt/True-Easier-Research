import { createClient } from '@supabase/supabase-js';

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

async function addTestProfessionals() {
  console.log('🔍 Checking for existing professional users...');
  
  // Get existing users who registered as professionals
  const { data: existingUsers, error: fetchError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('role', 'professional')
    .limit(5);
    
  if (existingUsers && existingUsers.length > 0) {
    console.log(`Found ${existingUsers.length} existing professional users`);
    
    // Update their profiles with professional data
    for (const user of existingUsers) {
      const updates = {
        id: user.id,
        role: 'professional',
        years_of_experience: Math.floor(Math.random() * 15) + 5,
        location: 'San Francisco, CA',
        average_rating: (4.5 + Math.random() * 0.5).toFixed(1),
        reviews_count: Math.floor(Math.random() * 200) + 50,
        is_verified: true
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (updateError) {
        console.error(`Error updating ${user.email}:`, updateError);
      } else {
        console.log(`✅ Updated professional profile for ${user.email}`);
      }
    }
  } else {
    console.log('No existing professional users found. Creating test professionals from existing users...');
    
    // Get ANY existing users and make some of them professionals
    const { data: anyUsers, error: anyError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(3);
      
    if (anyUsers && anyUsers.length > 0) {
      console.log(`Found ${anyUsers.length} existing users to convert to professionals`);
      
      for (const user of anyUsers) {
        const updates = {
          role: 'professional',
          first_name: 'Dr.',
          last_name: user.email.split('@')[0],
          full_name: `Dr. ${user.email.split('@')[0]}`,
          years_of_experience: 10,
          location: 'San Francisco, CA',
          average_rating: 4.8,
          reviews_count: 150,
          is_verified: true,
          avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'
        };
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
          
        if (updateError) {
          console.error(`Error converting ${user.email} to professional:`, updateError);
        } else {
          console.log(`✅ Converted ${user.email} to professional`);
        }
      }
    } else {
      console.log('❌ No users found in database. Please register users first.');
    }
  }
  
  console.log('✅ Done!');
}

addTestProfessionals().catch(console.error);
