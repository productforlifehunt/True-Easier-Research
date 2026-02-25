import { createClient } from '@supabase/supabase-js'

// Test what companions data is being loaded
const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'care_connector' }
})

async function testCompanionsData() {
  console.log('Testing companions data that would be loaded by the app...')
  
  try {
    // This is the same query used by the Companions page
    let query = supabase
      .schema('care_connector')
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        role,
        location,
        avatar_url,
        full_name,
        is_verified,
        created_at
      `)
      .eq('role', 'companion')

    const { data, error } = await query

    if (error) {
      console.error('Query error:', error)
      return
    }

    console.log('Raw companions data from database:')
    data?.forEach(companion => {
      console.log('- ID:', companion.id)
      console.log('- Name:', companion.first_name, companion.last_name)
      console.log('- Location:', companion.location)
      console.log('- URL would be: /provider/companion/' + companion.id)
      console.log('---')
    })

    // Also test the specific ID from the URL
    const urlId = '5c3fc8db-1439-468a-bd0a-d75361f5ccb1' // Wrong ID from URL
    const correctId = '5c3fc8db-f439-468a-bd0a-d75361f5cbb1' // Correct ID from database
    
    console.log('\nTesting URL ID vs Correct ID:')
    console.log('URL ID:', urlId)
    console.log('Correct ID:', correctId)
    console.log('Match:', urlId === correctId)

  } catch (error) {
    console.error('Error:', error)
  }
}

testCompanionsData()
