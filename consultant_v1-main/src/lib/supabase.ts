import { createClient } from '@supabase/supabase-js';

// Check for environment variables
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client with optimized settings
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // Enable session detection in URL
      storageKey: 'supabase.auth.token', // Consistent storage key
    },
    global: {
      fetch: (...args) => {
        // @ts-ignore
        return fetch(...args);
      },
    },
    realtime: {
      // Disable realtime subscriptions if not needed
      params: {
        eventsPerSecond: 1,
      },
    },
  }
);

// Create a singleton instance for caching
let instance = null;

export const getSupabaseClient = () => {
  if (instance) return instance;
  instance = supabase;
  return instance;
};