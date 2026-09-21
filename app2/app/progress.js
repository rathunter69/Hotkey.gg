// app2/app/progress.js — guest progress in localStorage. Every access is wrapped in try/catch:
// a private window, a blocked storage API or a corrupt value must never break a lesson.

const KEY = 'hk2_progress_v1';

function load() {
  try { const raw = localStorage.getItem(KEY); const v = raw ? JSON.parse(raw) : null; return v && typeof v === 'object' && v.lessons ? v : { lessons: {} }; }
  catch (e) { return { lessons: {} }; }
}
function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; } }

export const progress = {
  /** {completed, solo, timed, best (seconds) , at} or null */
  get(id) { const s = load(); return s.lessons[id] || null; },
  all() { return load().lessons; },
  status(id) { const p = this.get(id); return !p ? 'todo' : p.timed || p.solo ? 'mastered' : p.completed ? 'done' : 'started'; },
  /** Record a finished run. mode: 'guided' | 'solo' | 'timed'; secs: elapsed seconds. */
  record(id, mode, secs) {
    const s = load();
    const p = s.lessons[id] || {};
    p.completed = true;
    if (mode === 'solo') p.solo = true;
    if (mode === 'timed') { p.timed = true; if (typeof secs === 'number' && (p.best == null || secs < p.best)) p.best = Math.round(secs * 100) / 100; }
    p.at = Date.now();
    s.lessons[id] = p;
    return save(s);
  },
  touch(id) { const s = load(); if (!s.lessons[id]) { s.lessons[id] = { started: true, at: Date.now() }; save(s); } },
  clear() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } },
};
