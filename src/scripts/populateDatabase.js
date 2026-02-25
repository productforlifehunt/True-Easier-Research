import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'care_connector' }
})

// Script to populate database with sample caregiver data for testing
async function populateDatabase() {
  console.log('Starting database population...')

  // Minimal caregiver data - only essential fields that exist in profiles table
  const sampleCaregivers = [
    {
      id: '372e1027-cd9c-426e-9871-bea29252e169',
      first_name: 'Michael',
      last_name: 'Chen',
      full_name: 'Michael Chen',
      email: 'michael.chen@example.com',
      role: 'caregiver',
      is_verified: true
    },
    {
      id: '8f3d2c1b-9e4a-4b5c-8d7e-6f9a8b7c6d5e',
      first_name: 'Emily',
      last_name: 'Rodriguez',
      full_name: 'Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      role: 'caregiver',
      is_verified: true
    },
    {
      id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      first_name: 'Sarah',
      last_name: 'Johnson',
      full_name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'caregiver',
      is_verified: true
    },
    {
      id: '4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
      first_name: 'James',
      last_name: 'Thompson',
      full_name: 'James Thompson',
      email: 'james.thompson@example.com',
      role: 'professional',
      is_verified: true
    },
    {
      id: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
      first_name: 'Maria',
      last_name: 'Garcia',
      full_name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      role: 'care_checker',
      is_verified: true
    }
  ]

  try {
    // Insert sample caregivers
    const { data, error } = await supabase

      .from('profiles')
      .upsert(sampleCaregivers, { onConflict: 'id' })
      .select()

    if (error) {
      console.error('Error inserting caregivers:', error)
      return
    }

    console.log('Successfully inserted caregivers:', data)

    // Minimal companion data - only essential fields
    const sampleCompanions = [
      {
        id: 'c0a81a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
        first_name: 'Lisa',
        last_name: 'Wong',
        full_name: 'Lisa Wong',
        email: 'lisa.wong@example.com',
        role: 'companion',
        is_verified: true
      },
      {
        id: 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a',
        first_name: 'Robert',
        last_name: 'Davis',
        full_name: 'Robert Davis',
        email: 'robert.davis@example.com',
        role: 'companion',
        is_verified: true
      }
    ]

    const { data: companionData, error: companionError } = await supabase

      .from('profiles')
      .upsert(sampleCompanions, { onConflict: 'id' })
      .select()

    if (companionError) {
      console.error('Error inserting companions:', companionError)
    } else {
      console.log('Successfully inserted companions:', companionData)
    }

    console.log('Database population completed!')

  } catch (error) {
    console.error('Error populating database:', error)
  }
}

// Run the population script
populateDatabase()