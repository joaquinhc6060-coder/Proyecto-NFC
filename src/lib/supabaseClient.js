import { createClient } from '@supabase/supabase-js';

// Sanitize URL in case it has trailing slashes or /rest/v1
const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(cleanUrl && supabaseAnonKey && !cleanUrl.includes('tu-proyecto'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(cleanUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;
