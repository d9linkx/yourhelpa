// Module wrapper that exports the initialized Supabase client. This file expects that
// `js/supabase-client.js` (legacy script) has already run and populated `window.supabase`.

export const supabase = window.supabase;
export default window.supabase;
