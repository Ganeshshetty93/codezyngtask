import { createClient } from '@supabase/supabase-js';

// Required frontend environment variables for real-time task updates.
// Add these to frontend/.env.local or frontend/.env.example:
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-public-anon-key

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export let supabase = null;

const create = (url, key) => createClient(url, key);

export function initSupabase({ url, anonKey } = {}) {
  // Allow runtime override via parameters or global window variables
  supabaseUrl = url || supabaseUrl || (typeof window !== 'undefined' && window.__SUPABASE_URL);
  supabaseAnonKey = anonKey || supabaseAnonKey || (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase real-time updates are disabled. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or set window.__SUPABASE_URL / window.__SUPABASE_ANON_KEY.');
    supabase = null;
    return null;
  }

  try {
    supabase = create(supabaseUrl, supabaseAnonKey);
    try {
      const host = new URL(supabaseUrl).host;
      console.info('Supabase client initialized for realtime updates (host: ' + host + ')');
    } catch (e) {
      console.info('Supabase client initialized for realtime updates');
    }
    return supabase;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabase = null;
    return null;
  }
}

// Initialize immediately if env vars available
initSupabase();

export const getAuthUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const base64Payload = token.split('.')[1];
    const decodedPayload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedPayload);
    return payload?.id || null;
  } catch (error) {
    console.warn('Failed to decode auth token', error);
    return null;
  }
};

export const isRealtimeEnabled = () => !!supabase;
