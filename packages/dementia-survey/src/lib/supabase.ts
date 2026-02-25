import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc';

const YOUR_APP_SCHEMA = 'care_connector';
const SHARED_STORAGE_KEY = 'sb-yekarqanirdkdckimpna-auth-token';

// CLIENT 1: AUTH OPERATIONS ONLY
export const authClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: SHARED_STORAGE_KEY,
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js/2.0.0'
    }
  }
});

// CLIENT 2: ALL DATA OPERATIONS
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: SHARED_STORAGE_KEY,
  },
  db: {
    schema: YOUR_APP_SCHEMA
  },
  global: {
    headers: {
      'Accept-Profile': YOUR_APP_SCHEMA,
      'Content-Profile': YOUR_APP_SCHEMA,
      'x-client-info': 'supabase-js/2.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  (window as any).authClient = authClient;
  (window as any).supabaseConfigured = true;
}
