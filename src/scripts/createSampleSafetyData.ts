import { supabase } from '../lib/supabase'

// Script to create sample safety and medication data for testing
async function createSampleSafetyData() {
  console.log('🔧 Creating sample safety and medication data...')

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('⚠️ No authenticated user found. Please sign in first.')
      return
    }

    console.log(`👤 Creating sample data for user: ${user.email}`)

    // Create sample emergency contacts
    console.log('📞 Creating emergency contacts...')
    const emergencyContacts = [
      {
        user_id: user.id,
        name: 'Dr. Sarah Johnson',
        phone: '+1-555-0123',
        relationship: 'Primary Care Physician',
        is_primary: true
      },
      {
        user_id: user.id,
        name: 'John Smith',
        phone: '+1-555-0456',
        relationship: 'Emergency Contact',
        is_primary: false
      },
      {
        user_id: user.id,
        name: 'Mary Johnson',
        phone: '+1-555-0789',
        relationship: 'Family Member',
        is_primary: false
      }
    ]

    const { error: contactsError } = await supabase
      .from('emergency_contacts')
      .upsert(emergencyContacts)

    if (contactsError) {
      console.error('❌ Error creating emergency contacts:', contactsError)
    } else {
      console.log('✅ Sample emergency contacts created')
    }

    // Create sample medications
    console.log('💊 Creating medications...')
    const medications = [
      {
        user_id: user.id,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'daily',
        times: ['08:00'],
        start_date: '2024-01-01',
        prescriber: 'Dr. Sarah Johnson',
        instructions: 'Take with food',
        side_effects: ['Dizziness', 'Dry cough'],
        interactions: ['NSAIDs', 'Potassium supplements'],
        is_active: true
      },
      {
        user_id: user.id,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice_daily',
        times: ['08:00', '20:00'],
        start_date: '2024-01-15',
        prescriber: 'Dr. Sarah Johnson',
        instructions: 'Take with meals',
        side_effects: ['Nausea', 'Stomach upset'],
        is_active: true
      },
      {
        user_id: user.id,
        name: 'Vitamin D3',
        dosage: '1000 IU',
        frequency: 'daily',
        times: ['08:00'],
        start_date: '2024-02-01',
        prescriber: 'Dr. Sarah Johnson',
        instructions: 'Take with breakfast',
        side_effects: [],
        is_active: true
      }
    ]

    const { data: medicationData, error: medicationsError } = await supabase
      .from('medications')
      .upsert(medications)
      .select()

    if (medicationsError) {
      console.error('❌ Error creating medications:', medicationsError)
    } else {
      console.log('✅ Sample medications created')

      // Create medication reminders for today
      if (medicationData && medicationData.length > 0) {
        console.log('⏰ Creating medication reminders...')
        const today = new Date().toISOString().split('T')[0]
        const reminders = []

        for (const medication of medicationData) {
          for (const time of medication.times) {
            reminders.push({
              user_id: user.id,
              medication_id: medication.id,
              scheduled_time: `${today}T${time}:00Z`,
              taken: Math.random() > 0.5, // Random taken status for demo
              taken_at: Math.random() > 0.5 ? new Date().toISOString() : null
            })
          }
        }

        const { error: remindersError } = await supabase
          .from('medication_reminders')
          .upsert(reminders)

        if (remindersError) {
          console.error('❌ Error creating medication reminders:', remindersError)
        } else {
          console.log('✅ Sample medication reminders created')
        }
      }
    }

    // Create sample safety check-ins
    console.log('🛡️ Creating safety check-ins...')
    const safetyCheckIns = [
      {
        user_id: user.id,
        location_data: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Main St, San Francisco, CA',
          accuracy: 10,
          timestamp: new Date().toISOString()
        },
        status: 'safe',
        message: 'All good, arrived safely at home'
      },
      {
        user_id: user.id,
        location_data: {
          latitude: 37.7849,
          longitude: -122.4094,
          address: '456 Oak Ave, San Francisco, CA',
          accuracy: 15,
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        status: 'check_in',
        message: 'Regular check-in from work'
      }
    ]

    const { error: checkInsError } = await supabase
      .from('safety_check_ins')
      .upsert(safetyCheckIns)

    if (checkInsError) {
      console.error('❌ Error creating safety check-ins:', checkInsError)
    } else {
      console.log('✅ Sample safety check-ins created')
    }

    console.log('🎉 Sample safety data creation completed!')

  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  }
}

// Run the script
createSampleSafetyData()
