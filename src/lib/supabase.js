// src/lib/supabase.js
//
// Supabase client. Reads credentials from environment variables.
// NEVER import or use VITE_SUPABASE_SERVICE_ROLE_KEY on the client.
// Only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are safe here.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local. ' +
    'App will run in local-only mode until then.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,       // explicit for iOS PWA sandboxed storage
        storageKey: 'sb-auth-token',        // stable key across app restarts
        flowType: 'pkce',                   // more reliable on mobile WebKit
      },
    })
  : null;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
