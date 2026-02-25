import { createClient } from '@supabase/supabase-js'

// Test direct data access
const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'care_connector' }
})

async function testDataAccess() {
  console.log('Testing companions query...')
  
  const { data, error } = await supabase
    .schema('care_connector')
    .from('profiles')
    .select('*')
    .eq('role', 'companion')
    .eq('is_verified', true)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Companions found:', data?.length || 0)
  data?.forEach(profile => {
    const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || `User ${profile.id.slice(0, 8)}`
    console.log(`- ID: ${profile.id}`)
    console.log(`- Display Name: ${displayName}`)
    console.log(`- Role: ${profile.role}`)
    console.log(`- Verified: ${profile.is_verified}`)
    console.log('---')
  })
}

testDataAccess()