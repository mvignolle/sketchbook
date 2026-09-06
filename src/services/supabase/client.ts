import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_KEY)');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to set session context for RLS policies
export function setSessionContext(sessionId: string) {
  return supabase.rpc('set_session_context', { session_id: sessionId }).then(() => sessionId);
}
