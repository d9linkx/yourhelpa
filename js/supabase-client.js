const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Defensive initialization: the CDN script should expose a global with a createClient function.
const libAvailable = typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function';

if (!libAvailable) {
    console.error('[supabase-client] Supabase library not available. Did the CDN script load before this file?');
    window.supabase = null;
} else if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[supabase-client] Supabase credentials are not set. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your .env file and your hosting provider.');
    window.supabase = null;
} else {
    try {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Replace the library namespace with the initialized client for backward compatibility
        window.supabase = client;
        console.log('[supabase-client] Supabase client initialized.');
    } catch (err) {
        console.error('[supabase-client] Failed to initialize Supabase client:', err);
        window.supabase = null;
    }
}

// Export the initialized client for module-style imports (keeps backward compatibility with window.supabase)
// Some pages use ES modules and import the client directly (e.g. login.js). Export a named and default export.
// Note: do not export here to keep this file usable as a non-module script tag.
// Module-friendly wrapper is provided in `js/supabase-client.module.js`.