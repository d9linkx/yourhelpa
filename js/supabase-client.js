import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Defensive initialization: the CDN script should expose a global with a createClient function.
const libAvailable = typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function';

if (libAvailable) {
	try {
		const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
		// Replace the library namespace with the initialized client for backward compatibility
		window.supabase = client;
		console.log('[supabase-client] Supabase client initialized. Has auth:', !!(client && client.auth));
		if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
			console.warn('[supabase-client] Warning: SUPABASE_URL or SUPABASE_ANON_KEY is empty. Ensure config.js is generated with correct values in your build environment.');
		}
	} catch (err) {
		console.error('[supabase-client] Failed to initialize Supabase client:', err);
		// Provide a minimal stub so consuming code fails gracefully with a clearer message
		window.supabase = {
			auth: {
				async signInWithPassword() { throw new Error('Client initialization failed: ' + err.message); },
				async signOut() { throw new Error('Client initialization failed'); },
				async getSession() { return { data: { session: null }, error: new Error('Client initialization failed') }; }
			},
			from: () => ({
				select: () => ({
					eq: () => ({ maybeSingle: async () => ({ error: new Error('Client initialization failed') }) })
				})
			})
		};
	}
} else {
	console.error('[supabase-client] Supabase library not available. Did the CDN script load before this file?');
	// Minimal stub to prevent uncaught TypeErrors in the UI — methods will throw helpful errors instead
	window.supabase = {
		auth: {
			async signInWithPassword() { throw new Error('Supabase auth not available (library missing)'); },
			async signOut() { throw new Error('Supabase auth not available (library missing)'); },
			async getSession() { return { data: { session: null }, error: new Error('Supabase auth not available') }; }
		}
	};
}

// Export the initialized client for module-style imports (keeps backward compatibility with window.supabase)
// Some pages use ES modules and import the client directly (e.g. login.js). Export a named and default export.
// Note: do not export here to keep this file usable as a non-module script tag.
// Module-friendly wrapper is provided in `js/supabase-client.module.js`.