import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'care_connector' }
})

async function checkDatabase() {
  console.log('Checking real database data...')
  
  try {
    // Check all profiles without filters
    const { data: allProfiles, error } = await supabase
      .schema('care_connector')
      .from('profiles')
      .select('id, full_name, role, is_verified, created_at')
      .limit(10)

    if (error) {
      console.error('Database error:', error)
      return
    }

    console.log('\n=== ALL PROFILES IN DATABASE ===')
    console.log('Total profiles found:', allProfiles?.length || 0)
    allProfiles?.forEach(profile => {
      console.log(`- ${profile.full_name} (${profile.role}) - Verified: ${profile.is_verified}`)
    })

    // Check specifically for caregivers
    const { data: caregivers } = await supabase
      .schema('care_connector')
      .from('profiles')
      .select('*')
      .eq('role', 'caregiver')

    console.log('\n=== CAREGIVERS ===')
    console.log('Caregivers found:', caregivers?.length || 0)

    // Check companions
    const { data: companions } = await supabase
      .schema('care_connector')
      .from('profiles')
      .select('*')
      .eq('role', 'companion')

    console.log('\n=== COMPANIONS ===') 
    console.log('Companions found:', companions?.length || 0)

    // Check verified profiles
    const { data: verified } = await supabase
      .schema('care_connector')
      .from('profiles')
      .select('*')
      .eq('is_verified', true)

    console.log('\n=== VERIFIED PROFILES ===')
    console.log('Verified profiles found:', verified?.length || 0)

  } catch (error) {
    console.error('Error:', error)
  }
}

checkDatabase()