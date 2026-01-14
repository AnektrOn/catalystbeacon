import { createClient } from '@supabase/supabase-js'

// Singleton pattern to ensure only one Supabase client instance is created
let supabaseInstance = null

// Get Supabase credentials from environment variables
// Create React App uses REACT_APP_ prefix
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate that we have required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. ' +
    'Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file. ' +
    'Make sure to restart your development server after adding environment variables.'
  throw new Error(errorMsg)
}

// Create client only if it doesn't exist (singleton pattern)
if (!supabaseInstance) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'hcuniversity-web'
    }
  },
  db: {
    schema: 'public'
  },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
}

// Export the singleton instance
export const supabase = supabaseInstance