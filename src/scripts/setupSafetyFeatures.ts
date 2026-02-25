import { supabase } from '../lib/supabase'
import { readFileSync } from 'fs'
import { join } from 'path'

// Script to set up safety and medication management database tables
async function setupSafetyFeatures() {
  console.log('🔧 Setting up Safety & Medication Management features...')

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, 'createSafetyTables.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Executing ${statements.length} SQL statements...`)

    console.log('⚠️ Note: SQL statements need to be executed manually in Supabase SQL Editor')
    console.log('📋 Copy and paste the following SQL into your Supabase SQL Editor:')
    console.log('='.repeat(80))
    console.log(sql)
    console.log('='.repeat(80))

    console.log('🎉 Safety features setup completed!')

    // Create some sample data for testing
    await createSampleData()

  } catch (error) {
    console.error('❌ Error setting up safety features:', error)
  }
}

async function createSampleData() {
  console.log('📊 Creating sample safety data...')

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('⚠️ No authenticated user found. Skipping sample data creation.')
      return
    }

    console.log(`👤 Creating sample data for user: ${user.email}`)

    // Create sample emergency contacts
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

    console.log('🎉 Sample data creation completed!')

  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  }
}

// Run the setup
setupSafetyFeatures()
