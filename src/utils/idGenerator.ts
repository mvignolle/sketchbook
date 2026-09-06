import { getCurrentSession } from '../services/supabase/sessionManager';

export function generateId(prefix: string = ''): string {
  const id = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}-${id}` : id;
}

export function generateSessionId(): string {
  // Get session from localStorage (set by sessionManager.getOrCreateSession())
  const sessionId = getCurrentSession();
  if (!sessionId) {
    console.warn('No session found. Ensure sessionManager.getOrCreateSession() was called.');
    // Fallback: generate and store a session ID
    const newSessionId = generateId('session');
    localStorage.setItem('sketches:sessionId', newSessionId);
    return newSessionId;
  }
  return sessionId;
}
