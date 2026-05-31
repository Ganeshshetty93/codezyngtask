require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const ws = require('ws');

global.WebSocket = ws;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ CRITICAL CONFIGURATION ERROR: Supabase credentials are missing from your backend/.env file!');
}

const cleanUrl = supabaseUrl?.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;

const supabase = createClient(cleanUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    fetch: (url, options) => {
      const agent = new https.Agent({ rejectUnauthorized: false });
      return fetch(url, { ...options, agent });
    }
  }
});

module.exports = supabase;
