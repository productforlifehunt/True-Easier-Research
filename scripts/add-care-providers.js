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

async function addCareProviders() {
  console.log('👨‍⚕️ Adding care providers to care_provider table...');
  
  // Get existing professional profiles
  const { data: professionals, error: fetchError } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, full_name')
    .eq('role', 'professional')
    .limit(5);
    
  if (fetchError || !professionals || professionals.length === 0) {
    console.error('❌ No professional profiles found:', fetchError);
    return;
  }
  
  console.log(`Found ${professionals.length} professional profiles`);
  
  // Create care_provider entries for each professional
  // care_provider table requires id and full_name (NOT NULL)
  const careProviders = professionals.map(prof => ({
    id: prof.id, // Use same ID as profile - this is the foreign key to profiles
    full_name: prof.full_name || `${prof.first_name} ${prof.last_name}` || prof.email.split('@')[0]
  }));
  
  // Insert into care_provider table
  const { data: inserted, error: insertError } = await supabase
    .from('care_provider')
    .upsert(careProviders, { onConflict: 'id' })
    .select();
    
  if (insertError) {
    console.error('❌ Error adding care providers:', insertError);
    return;
  }
  
  console.log(`✅ Successfully added ${inserted?.length || 0} care providers`);
  
  // Display the IDs for reference
  if (inserted && inserted.length > 0) {
    console.log('📋 Care Provider IDs:');
    inserted.forEach(p => {
      console.log(`   - ${p.name}: ${p.id}`);
    });
  }
}

addCareProviders().catch(console.error);
