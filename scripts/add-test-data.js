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

async function addTestData() {
  const userId = '068215cb-d0d2-48c7-91c4-a311d76489f9'; // Guowei's user ID
  
  console.log('📝 Adding test data for user:', userId);
  
  // 1. Get some provider IDs first
  const { data: providers } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'professional')
    .limit(3);
  
  if (!providers || providers.length === 0) {
    console.error('❌ No providers found in database');
    return;
  }
  
  console.log('✅ Found providers:', providers.length);
  
  // 2. Create some bookings for the user
  const now = new Date();
  const bookings = [
    {
      user_id: userId,
      provider_id: providers[0].id,
      start_time: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      end_time: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      status: 'confirmed',
      notes: 'Initial consultation appointment'
    },
    {
      user_id: userId,
      provider_id: providers[1]?.id || providers[0].id,
      start_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // In 3 days
      end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour later
      status: 'confirmed',
      notes: 'Physical therapy session'
    },
    {
      user_id: userId,
      provider_id: providers[0].id,
      start_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      end_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      status: 'completed',
      notes: 'Regular health checkup - completed'
    }
  ];
  
  const { data: insertedBookings, error: bookingError } = await supabase
    .from('bookings')
    .insert(bookings)
    .select();
  
  if (bookingError) {
    console.error('❌ Error creating bookings:', bookingError);
  } else {
    console.log('✅ Created bookings:', insertedBookings?.length || 0);
  }
  
  // 3. Create saved providers
  const savedProviders = providers.map(p => ({
    user_id: userId,
    provider_id: p.id
  }));
  
  const { data: insertedSaved, error: savedError } = await supabase
    .from('saved_providers')
    .insert(savedProviders)
    .select();
  
  if (savedError) {
    console.error('❌ Error creating saved providers:', savedError);
  } else {
    console.log('✅ Created saved providers:', insertedSaved?.length || 0);
  }
  
  // 4. Create a care group membership
  const { data: careGroup, error: groupError } = await supabase
    .from('care_groups')
    .insert({
      name: 'Family Care Group',
      created_by: userId,
      description: 'Care coordination for family members'
    })
    .select()
    .single();
  
  if (careGroup) {
    const { error: memberError } = await supabase
      .from('care_group_members')
      .insert({
        group_id: careGroup.id,
        user_id: userId,
        role: 'admin'
      });
    
    if (!memberError) {
      console.log('✅ Created care group and membership');
    }
  }
  
  console.log('🎉 Test data creation complete!');
  process.exit(0);
}

addTestData().catch(console.error);
