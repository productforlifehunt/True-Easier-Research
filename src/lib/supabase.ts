import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const YOUR_APP_SCHEMA = 'care_connector';
const PUBLIC_SCHEMA = YOUR_APP_SCHEMA;
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

export const supabasePublic = supabase;

if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  (window as any).supabasePublic = supabasePublic;
  (window as any).authClient = authClient;
  (window as any).supabaseConfigured = true;
}
