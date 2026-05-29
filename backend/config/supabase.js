// require("dotenv").config()

// const { createClient } = require("@supabase/supabase-js")

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// )

// module.exports = supabase
// require('dotenv').config();

// const { createClient } = require('@supabase/supabase-js');
// const ws = require('ws');

// global.WebSocket = ws;

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

// module.exports = supabase;

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const ws = require('ws');

global.WebSocket = ws;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Fail-safe developer check
if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ CRITICAL CONFIGURATION ERROR: Supabase credentials are missing from your backend/.env file!');
}

// Clean trailing slashes automatically
const cleanUrl = supabaseUrl?.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;

const supabase = createClient(cleanUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  // CRITICAL FIX: Directs the global fetch driver to bypass strict local certificate chain rejections
  global: {
    fetch: (url, options) => {
      const agent = new https.Agent({ rejectUnauthorized: false });
      return fetch(url, { ...options, agent });
    }
  }
});

module.exports = supabase;