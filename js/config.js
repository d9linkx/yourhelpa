// Supabase Configuration
// NOTE: Do NOT commit real keys to the repository. This file should be generated at build time
// from environment variables (e.g., via a CI step or Vercel build hook). The real values
// have been removed from the repo for security. Replace them in your deployment pipeline.

// Placeholder (empty) values to avoid exposing secrets in the repository.
window.SUPABASE_URL = window.SUPABASE_URL || "";
window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";

if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
	console.warn('[config] Supabase keys are not set in js/config.js. Generate this file at build time from secure environment variables.');
}