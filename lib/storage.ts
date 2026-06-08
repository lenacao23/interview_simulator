import type { Session } from './types';

const SESSIONS_KEY = 'interview_sessions';
const MAX_SESSIONS = 10;

export function getSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function getSession(id: string): Session | null {
  return getSessions().find((s) => s.id === id) ?? null;
}

export function saveSession(session: Session): void {
  const sessions = getSessions().filter((s) => s.id !== session.id);
  sessions.unshift(session);
  localStorage.setItem(
    SESSIONS_KEY,
    JSON.stringify(sessions.slice(0, MAX_SESSIONS)),
  );
}
