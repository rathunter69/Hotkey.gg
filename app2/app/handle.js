// app2/app/handle.js — instant client-side handle feedback. The server (rpc_set_handle) is
// authoritative: same regex, a larger banned list, case-insensitive uniqueness, rate limit.
export const HANDLE_RE = /^[A-Za-z0-9_]{3,20}$/;

// a small mirror of public.banned_words — enough to catch the obvious before a round-trip
const BANNED = ['admin', 'moderator', 'hotkey_gg', 'official', 'support', 'staff', 'fuck', 'shit', 'cunt', 'bitch', 'nigger', 'nigga', 'faggot', 'retard', 'nazi', 'whore', 'slut', 'porn'];

/** '' when fine, else the message to show under the field. */
export function validateHandle(h) {
  const s = String(h == null ? '' : h);
  if (!HANDLE_RE.test(s)) return '3–20 letters, digits or underscores.';
  const low = s.toLowerCase();
  for (const w of BANNED) if (low.includes(w)) return 'That handle is not allowed.';
  return '';
}
