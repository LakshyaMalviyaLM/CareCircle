import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const rawKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
   import.meta.env.VITE_SUPABASE_ANON_KEY ||
   '').trim();

// Check if credentials are valid and not placeholder strings
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('placeholder') &&
  !rawKey.includes('placeholder') &&
  rawUrl.startsWith('https://')
);

export const supabaseConfigError = !isSupabaseConfigured
  ? 'Supabase credentials are missing or invalid in your .env file. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
  : null;

// Extract project reference for diagnostics
export const supabaseProjectRef = rawUrl.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1] || '';
export const supabaseProjectUrl = rawUrl;

// Safe client instantiation
export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://placeholder-domain-never-called.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

export default supabase;
