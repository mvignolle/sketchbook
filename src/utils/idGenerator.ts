export function generateId(prefix: string = ''): string {
  const id = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}-${id}` : id;
}

export function generateSessionId(): string {
  let sessionId = localStorage.getItem('sketches:sessionId');
  if (!sessionId) {
    sessionId = generateId('session');
    localStorage.setItem('sketches:sessionId', sessionId);
  }
  return sessionId;
}
