// Quick test to check if there are caregivers in the database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCaregivers() {
  try {
    console.log('Checking caregivers in database...')
    
    const { data, error } = await supabase
      .schema('care_connector')
      .from('profiles')
      .select('id, first_name, last_name, role, email')
      .in('role', ['caregiver', 'companion', 'professional', 'care_checker'])
      .limit(5)

    if (error) {
      console.error('Database error:', error)
      return
    }

    console.log('Found caregivers:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('Sample caregivers:')
      data.forEach(caregiver => {
        console.log(`- ${caregiver.first_name} ${caregiver.last_name} (${caregiver.role}) - ID: ${caregiver.id}`)
      })
    } else {
      console.log('No caregivers found in database')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

checkCaregivers()
