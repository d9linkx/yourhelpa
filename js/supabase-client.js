import { createClient } from '@supabase/supabase-js';

// These variables are expected to be set in your environment.
// For local development, create a `.env.local` file in your project root.
// For production (Vercel), you will set these in the project's environment variable settings.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[supabase-client] Supabase credentials are not set. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your environment.');
} else {
    try {
        supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[supabase-client] Supabase client initialized.');
    } catch (err) {
        console.error('[supabase-client] Failed to initialize Supabase client:', err);
    }
}

// Export for ES module usage (e.g., import { supabase } from './supabase-client.js')
export const supabase = supabaseInstance;

// Also attach to the window object for backward compatibility with legacy scripts
// that expect `window.supabase` to be available (like auth.js, login.js).
if (typeof window !== 'undefined') {
    window.supabase = supabaseInstance;
}