import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role key
// This should ONLY be used in server actions/API routes
// Uses CHATMAN_ prefixed variables to distinguish from subdomain projects
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.CHATMAN_SUPABASE_URL;
  const supabaseServiceKey = process.env.CHATMAN_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Chatman Supabase environment variables (CHATMAN_SUPABASE_URL, CHATMAN_SUPABASE_SERVICE_ROLE_KEY)');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
