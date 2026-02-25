import { createClient } from '@supabase/supabase-js'

// Test caregivers data loading
const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'care_connector' }
})

async function testCaregiversData() {
  console.log('🔥 Testing caregivers data loading...')
  
  try {
    // Test the same query as dataService.getCaregivers()
    const { data, error } = await supabase
      .schema('care_connector')
      .from('profiles')
      .select('*')
      .in('role', ['caregiver', 'companion', 'professional', 'care_checker'])
      .eq('is_verified', true)

    if (error) {
      console.error('🔥 Database error:', error)
      return
    }

    console.log('🔥 Raw data from database:')
    console.log('🔥 Total profiles found:', data?.length || 0)
    
    // Check what roles we have
    const roleCount = {}
    data?.forEach(profile => {
      roleCount[profile.role] = (roleCount[profile.role] || 0) + 1
    })
    console.log('🔥 Profiles by role:', roleCount)
    
    // Show sample data for each role
    const caregivers = data?.filter(p => p.role === 'caregiver') || []
    const companions = data?.filter(p => p.role === 'companion') || []
    const professionals = data?.filter(p => p.role === 'professional') || []
    const careCheckers = data?.filter(p => p.role === 'care_checker') || []
    
    console.log('🔥 CAREGIVERS:')
    caregivers.forEach(caregiver => {
      console.log(`- ID: ${caregiver.id}`)
      console.log(`- Name: ${caregiver.full_name || caregiver.first_name + ' ' + caregiver.last_name}`)
      console.log(`- Location: ${caregiver.location}`)
      console.log(`- Verified: ${caregiver.is_verified}`)
      console.log('---')
    })
    
    console.log('🔥 COMPANIONS:')
    companions.forEach(companion => {
      console.log(`- ID: ${companion.id}`)
      console.log(`- Name: ${companion.full_name || companion.first_name + ' ' + companion.last_name}`)
      console.log(`- Location: ${companion.location}`)
      console.log(`- Verified: ${companion.is_verified}`)
      console.log('---')
    })
    
    console.log('🔥 PROFESSIONALS:')
    professionals.forEach(professional => {
      console.log(`- ID: ${professional.id}`)
      console.log(`- Name: ${professional.full_name || professional.first_name + ' ' + professional.last_name}`)
      console.log(`- Location: ${professional.location}`)
      console.log(`- Verified: ${professional.is_verified}`)
      console.log('---')
    })
    
    console.log('🔥 CARE CHECKERS:')
    careCheckers.forEach(checker => {
      console.log(`- ID: ${checker.id}`)
      console.log(`- Name: ${checker.full_name || checker.first_name + ' ' + checker.last_name}`)
      console.log(`- Location: ${checker.location}`)
      console.log(`- Verified: ${checker.is_verified}`)
      console.log('---')
    })

  } catch (error) {
    console.error('🔥 Error:', error)
  }
}

testCaregiversData()
