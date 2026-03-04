// Supabase configuration template
// Copy this file to `js/config.js` during your build process and fill in the values.
// DO NOT commit `js/config.js` with real keys to your repository.

// Example: window.SUPABASE_URL = "https://your-project-ref.supabase.co";
// Example: window.SUPABASE_ANON_KEY = "public-anon-key-from-supabase";

window.SUPABASE_URL = ""; // e.g. https://xxxx.supabase.co
window.SUPABASE_ANON_KEY = ""; // e.g. public anon key

// Recommended: create a CI/build step that writes a small `js/config.js` file with
// these values from environment variables (e.g., process.env.SUPABASE_URL).

// Minimal generator example (Node):
// const fs = require('fs');
// fs.writeFileSync('js/config.js', `window.SUPABASE_URL = "${process.env.SUPABASE_URL}";\nwindow.SUPABASE_ANON_KEY = "${process.env.SUPABASE_ANON_KEY}";\n`);
