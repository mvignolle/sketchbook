import { supabase } from './client';

const SESSION_ID_KEY = 'sketches:sessionId';

// Generate a session ID (format: session-{random_string})
function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `session-${result}`;
}

// Get or create a session
export async function getOrCreateSession(): Promise<string> {
  // Check localStorage first
  const storedSessionId = localStorage.getItem(SESSION_ID_KEY);
  if (storedSessionId) {
    // Validate session exists in DB
    const { data } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', storedSessionId)
      .single();

    if (data) {
      // Update last activity
      await updateSessionActivity(storedSessionId);
      return storedSessionId;
    }
  }

  // Create new session
  const newSessionId = generateSessionId();
  const { error } = await supabase
    .from('sessions')
    .insert({
      id: newSessionId,
      is_anonymous: true,
      device_info: navigator.userAgent,
      ip_hash: null,
    });

  if (error) {
    console.error('Failed to create session:', error);
    throw error;
  }

  // Store in localStorage
  localStorage.setItem(SESSION_ID_KEY, newSessionId);
  return newSessionId;
}

// Update last activity timestamp
export async function updateSessionActivity(sessionId: string): Promise<void> {
  await supabase
    .from('sessions')
    .update({ last_activity: new Date().toISOString() })
    .eq('id', sessionId);
}

// Get current session from localStorage (without DB validation)
export function getCurrentSession(): string | null {
  return localStorage.getItem(SESSION_ID_KEY);
}

// Clear session (logout)
export async function clearSession(): Promise<void> {
  const sessionId = getCurrentSession();
  if (sessionId) {
    await supabase.from('sessions').update({ is_anonymous: false }).eq('id', sessionId);
    localStorage.removeItem(SESSION_ID_KEY);
  }
}
