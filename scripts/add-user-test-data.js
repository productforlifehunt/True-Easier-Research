import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    db: { schema: 'care_connector' }
  }
);

async function addTestDataForUser() {
  const userId = '068215cb-d0d2-48c7-91c4-a311d76489f9';
  const userEmail = 'guowei.jiang.work@gmail.com';
  
  console.log('Adding test data for user:', userEmail);

  try {
    // Add upcoming bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: userId,
          provider_id: '11111111-1111-1111-1111-111111111111',
          service_type: 'Caregiving',
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          notes: 'Test upcoming appointment'
        },
        {
          user_id: userId,
          provider_id: '22222222-2222-2222-2222-222222222222',
          service_type: 'Companionship',
          start_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          end_time: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          notes: 'Test upcoming appointment 2'
        }
      ])
      .select();

    if (bookingsError) {
      console.error('Error adding bookings:', bookingsError);
    } else {
      console.log('Added bookings:', bookings?.length);
    }

    // Add saved providers
    const { data: savedProviders, error: spError } = await supabase
      .from('saved_providers')
      .insert([
        {
          user_id: userId,
          provider_id: '11111111-1111-1111-1111-111111111111',
          saved_at: new Date().toISOString()
        },
        {
          user_id: userId,
          provider_id: '22222222-2222-2222-2222-222222222222',
          saved_at: new Date().toISOString()
        },
        {
          user_id: userId,
          provider_id: '33333333-3333-3333-3333-333333333333',
          saved_at: new Date().toISOString()
        }
      ])
      .select();

    if (spError) {
      console.error('Error adding saved providers:', spError);
    } else {
      console.log('Added saved providers:', savedProviders?.length);
    }

    // Add care group membership
    const { data: careGroups, error: cgError } = await supabase
      .from('care_groups')
      .insert({
        name: 'Test Care Group',
        description: 'A test care group for Guowei',
        created_by: userId
      })
      .select()
      .single();

    if (cgError) {
      console.error('Error creating care group:', cgError);
    } else {
      console.log('Created care group:', careGroups?.name);
      
      // Add user as member
      const { error: memberError } = await supabase
        .from('care_group_members')
        .insert({
          group_id: careGroups.id,
          user_id: userId,
          role: 'admin',
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        console.error('Error adding member:', memberError);
      } else {
        console.log('Added user to care group');
      }
    }

    console.log('✅ Test data added successfully!');
    
    // Verify the data
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('start_time', new Date().toISOString());
    
    const { count: spCount } = await supabase
      .from('saved_providers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    const { count: cgCount } = await supabase
      .from('care_group_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    console.log('\n📊 Data verification:');
    console.log('- Upcoming bookings:', bookingCount);
    console.log('- Saved providers:', spCount);
    console.log('- Care groups:', cgCount);

  } catch (error) {
    console.error('Error:', error);
  }
}

addTestDataForUser();
