import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
