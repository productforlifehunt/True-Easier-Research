import { supabase } from '../lib/supabase'

// Script to populate database with sample caregiver data for testing
async function populateDatabase() {
  console.log('Starting database population...')

  // Sample caregiver data - comprehensive verified provider data
  const sampleCaregivers = [
    {
      id: '372e1027-cd9c-426e-9871-bea29252e169',
      first_name: 'Michael',
      last_name: 'Chen',
      full_name: 'Michael Chen',
      email: 'michael.chen@example.com',
      role: 'caregiver',
      is_verified: true,
      location: 'San Francisco, CA',
      languages: ['English', 'Mandarin'],
      certifications: ['CNA', 'CPR'],
      years_of_experience: 8,
      average_rating: '4.8',
      reviews_count: 127,
      points: 85,
      personality_traits: ['Compassionate', 'Patient', 'Reliable'],
      availability: ['Morning', 'Afternoon'],
      insurance_accepted: ['Medicare', 'Blue Cross'],
      avatar_url: null
    },
    {
      id: '8f3d2c1b-9e4a-4b5c-8d7e-6f9a8b7c6d5e',
      first_name: 'Emily',
      last_name: 'Rodriguez',
      full_name: 'Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      role: 'caregiver',
      is_verified: true,
      location: 'Los Angeles, CA',
      languages: ['English', 'Spanish'],
      certifications: ['HHA', 'Memory Care Specialist'],
      years_of_experience: 6,
      average_rating: '4.9',
      reviews_count: 89,
      points: 92,
      personality_traits: ['Empathetic', 'Professional', 'Detail-oriented'],
      availability: ['Evening', 'Weekend'],
      insurance_accepted: ['Medicaid', 'Aetna'],
      avatar_url: null
    },
    {
      id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      first_name: 'Sarah',
      last_name: 'Johnson',
      full_name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'caregiver',
      is_verified: true,

      location: 'Seattle, WA',
      languages: ['English'],
      certifications: ['RN', 'IV Therapy', 'Wound Care'],
      years_of_experience: 12,
      average_rating: '4.7',
      reviews_count: 203,
      points: 78,
      personality_traits: ['Skilled', 'Caring', 'Knowledgeable'],
      availability: ['Morning', 'Afternoon', 'On-call'],
      insurance_accepted: ['Medicare', 'United Healthcare'],
      avatar_url: null
    },
    {
      id: '4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
      first_name: 'James',
      last_name: 'Thompson',
      full_name: 'James Thompson',
      email: 'james.thompson@example.com',
      role: 'professional',
      is_verified: true,
      location: 'Phoenix, AZ',
      languages: ['English'],
      certifications: ['DPT', 'Geriatric PT', 'Fall Prevention'],
      years_of_experience: 10,
      average_rating: '4.8',
      reviews_count: 156,
      points: 88,
      personality_traits: ['Motivating', 'Expert', 'Patient'],
      availability: ['Morning', 'Afternoon'],
      insurance_accepted: ['Medicare', 'Cigna'],
      avatar_url: null
    },
    {
      id: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
      first_name: 'Maria',
      last_name: 'Garcia',
      full_name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      role: 'care_checker',
      is_verified: true,
      location: 'Austin, TX',
      languages: ['English', 'Spanish'],
      certifications: ['Quality Assurance', 'Safety Inspector'],
      years_of_experience: 7,
      average_rating: '4.9',
      reviews_count: 72,
      points: 95,
      personality_traits: ['Thorough', 'Reliable', 'Detail-focused'],
      availability: ['Flexible'],
      insurance_accepted: ['All Major Providers'],
      avatar_url: null
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

    // Also create some sample companions - comprehensive verified companion data
    const sampleCompanions = [
      {
        id: 'c0a81a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
        first_name: 'Lisa',
        last_name: 'Wong',
        full_name: 'Lisa Wong',
        email: 'lisa.wong@example.com',
        role: 'companion',
        is_verified: true,
        location: 'Portland, OR',
        languages: ['English', 'Cantonese'],
        years_of_experience: 4,
        average_rating: '4.7',
        reviews_count: 45,
        points: 82,
        personality_traits: ['Friendly', 'Engaging', 'Supportive'],
        availability: ['Afternoon', 'Evening'],
        interests: ['Reading', 'Gardening', 'Board Games'],
        avatar_url: null
      },
      {
        id: 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a',
        first_name: 'Robert',
        last_name: 'Davis',
        full_name: 'Robert Davis',
        email: 'robert.davis@example.com',
        role: 'companion',
        is_verified: true,
        location: 'Denver, CO',
        languages: ['English'],
        years_of_experience: 3,
        average_rating: '4.8',
        reviews_count: 62,
        points: 87,
        personality_traits: ['Intellectual', 'Patient', 'Kind'],
        availability: ['Morning', 'Afternoon'],
        interests: ['History', 'Literature', 'Chess'],
        avatar_url: null
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
populateDatabase() // Execute the database population
