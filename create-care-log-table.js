// Script to create the missing care_log table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc';

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'care_connector'
  },
  global: {
    headers: {
      'Accept-Profile': 'care_connector',
      'Content-Profile': 'care_connector'
    }
  }
});

async function createCareLogTable() {
  try {
    console.log('Testing database connection...');
    
    // First test if we can access existing tables
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Database connection failed:', testError);
      return;
    }

    console.log('✅ Database connection successful');
    
    // Try to check if care_log table already exists
    const { data, error: existError } = await supabase
      .from('care_log')
      .select('*')
      .limit(1);

    if (!existError) {
      console.log('✅ care_log table already exists and is accessible');
      return;
    }

    console.log('care_log table does not exist, it needs to be created manually in Supabase dashboard');
    console.log('Error accessing care_log:', existError.message);

  } catch (error) {
    console.error('Script error:', error);
  }
}

createCareLogTable();
