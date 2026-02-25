import { createClient } from '@supabase/supabase-js'

// Test provider query directly
const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'care_connector' }
})

async function testProviderQuery() {
  const providerId = '5c3fc8db-f439-468a-bd0a-d75361f5cbb1'
  const roleFilter = 'companion'
  
  console.log('Testing provider query...')
  console.log('Provider ID:', providerId)
  console.log('Role Filter:', roleFilter)
  
  try {
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
      console.error('Provider fetch error:', providerError)
      
      // Try to find what providers exist
      const { data: allProviders } = await supabase
        .schema('care_connector')
        .from('profiles')
        .select('id, full_name, role, first_name, last_name')
        .eq('role', roleFilter)
        .limit(5)
      
      console.log('Available providers with this role:', allProviders)
      return
    }

    console.log('SUCCESS! Provider found:')
    console.log('- ID:', providerData.id)
    console.log('- Name:', providerData.full_name || `${providerData.first_name} ${providerData.last_name}`)
    console.log('- Role:', providerData.role)
    console.log('- Bio:', providerData.bio)
    console.log('- Location:', providerData.location)
    console.log('- Verified:', providerData.is_verified)
    console.log('- Rating:', providerData.average_rating)
    console.log('- Full data:', providerData)

  } catch (error) {
    console.error('Query error:', error)
  }
}

testProviderQuery()
