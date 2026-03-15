const fs = require('fs');
const path = require('path');

// Get the path to where the config file should be
const configPath = path.join(__dirname, '..', 'js', 'config.js');

// Get values from environment variables
const supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.trim() : '';

// Log to the build console to verify the variables are being read.
console.log(`Build-time SUPABASE_URL: ${supabaseUrl ? 'Loaded' : 'NOT FOUND'}`);
console.log(`Build-time SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Loaded' : 'NOT FOUND'}`);

// Check if the variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set.');
  process.exit(1); // Exit with an error code
}

// Create the content for config.js using the ES module export syntax
const configContent = `export const SUPABASE_URL = "${supabaseUrl}";
export const SUPABASE_ANON_KEY = "${supabaseAnonKey}";
`;

// Write the file
fs.writeFileSync(configPath, configContent.trim());
console.log('Successfully created js/config.js for production.');