import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Check for environment variables
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client with optimized settings and better session handling
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // Enable session detection in URL
      storageKey: 'supabase.auth.token', // Consistent storage key
      flowType: 'pkce', // More secure auth flow
    },
    global: {
      headers: {
        'x-app-version': '1.0.0', // Add app version for debugging
      },
      fetch: (...args) => {
        // Add timeout to prevent hanging requests
        const [resource, config] = args;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        return fetch(resource, {
          ...config,
          signal: controller.signal,
        }).then(response => {
          clearTimeout(timeoutId);
          return response;
        }).catch(error => {
          clearTimeout(timeoutId);
          console.error('Fetch error:', error);
          throw error;
        });
      },
    },
    realtime: {
      // Optimize realtime subscriptions
      params: {
        eventsPerSecond: 1,
      },
    },
    // Log in development but removed debug flag due to type issues
  }
);

// Enable console logging in development
if (import.meta.env.DEV) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`Supabase auth event: ${event}`, session);
  });
}

// Helper to get session with error handling
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Create a singleton instance for caching
let instance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (instance) return instance;
  instance = supabase;
  return instance;
};