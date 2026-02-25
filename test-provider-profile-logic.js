import { createClient } from '@supabase/supabase-js'

// Test the exact same logic as ProviderProfile component
const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'care_connector' }
})

async function testProviderProfileLogic() {
  // Simulate the exact same parameters from the URL
  const providerId = '5c3fc8db-f439-468a-bd0a-d75361f5cbb1'
  const providerType = 'companion'
  
  console.log('🔥 Testing ProviderProfile logic...')
  console.log('🔥 Provider ID:', providerId)
  console.log('🔥 Provider Type:', providerType)
  
  try {
    // Simulate the exact same role filter logic
    let roleFilter
    switch (providerType) {
      case 'caregiver':
      case 'caregivers':
        roleFilter = 'caregiver'
        break
      case 'companion':
      case 'companions':
        roleFilter = 'companion'
        break
      case 'professional':
      case 'professionals':
        roleFilter = 'professional'
        break
      case 'care-checker':
      case 'care-checkers':
        roleFilter = 'care_checker'
        break
      default:
        throw new Error('Invalid provider type')
    }
    
    console.log('🔥 Role Filter:', roleFilter)
    
    // Use the EXACT same query as the updated ProviderProfile component
    const { data: providerData, error: providerError } = await supabase
      .schema('care_connector')
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        full_name,
        location,
        is_verified,
        role,
        avatar_url,
        created_at
      `)
      .eq('role', roleFilter)
      .eq('id', providerId)
      .single()

    if (providerError) {
      console.error('🔥 Provider fetch error:', providerError)
      
      // Try to find what providers exist (same as component)
      const { data: allProviders } = await supabase
        .schema('care_connector')
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', roleFilter)
        .limit(5)
      
      console.log('🔥 Available providers with this role:', allProviders)
      console.log('🔥 ERROR MESSAGE THAT WOULD BE SHOWN:', `Provider not found. Available ${roleFilter}s: ${allProviders?.map(p => `${p.full_name} (${p.id.slice(0, 8)}...)`).join(', ') || 'none'}`)
      return
    }

    console.log('🔥 SUCCESS! Provider found:')
    console.log('🔥 Raw provider data:', providerData)
    
    // Simulate the exact same data processing as the component
    const foundProvider = providerData
    const processedProvider = {
      id: foundProvider.id,
      name: foundProvider.full_name || `${foundProvider.first_name || ''} ${foundProvider.last_name || ''}`.trim() || 'Unknown Provider',
      bio: `Experienced ${foundProvider.role} providing quality care and support. Contact for more details about services and availability.`,
      location: foundProvider.location || 'Location not specified',
      specialties: foundProvider.role === 'companion' ? 'Companionship, Social Support' : 
                  foundProvider.role === 'caregiver' ? 'Personal Care, Health Support' :
                  foundProvider.role === 'professional' ? 'Professional Healthcare Services' : 'Care Services',
      verified: foundProvider.is_verified || false,
      hourly_rate: 25,
      years_experience: 3,
      rating: 4.5,
      reviews_count: 12,
      provider_type: foundProvider.role,
      profile_image: foundProvider.avatar_url,
      languages: ['English'],
      certifications: foundProvider.role === 'professional' ? ['Licensed Professional'] : ['Certified Care Provider'],
      personality_traits: ['Professional', 'Caring', 'Reliable'],
      availability: ['Morning', 'Afternoon', 'Evening'],
      insurance_accepted: ['Medicare', 'Medicaid', 'Private Insurance'],
      points: 75
    }
    
    console.log('🔥 PROCESSED PROVIDER (what component would display):')
    console.log('🔥 Name:', processedProvider.name)
    console.log('🔥 Bio:', processedProvider.bio)
    console.log('🔥 Location:', processedProvider.location)
    console.log('🔥 Verified:', processedProvider.verified)
    console.log('🔥 Rating:', processedProvider.rating)
    console.log('🔥 RESULT: PROVIDER PROFILE SHOULD LOAD SUCCESSFULLY!')

  } catch (error) {
    console.error('🔥 ERROR in provider profile logic:', error)
    console.log('🔥 ERROR MESSAGE THAT WOULD BE SHOWN:', error.message)
  }
}

testProviderProfileLogic()
