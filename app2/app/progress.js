// app2/app/progress.js — guest progress in localStorage. Every access is wrapped in try/catch and
// every stored shape is normalised on load: a private window, a blocked storage API or a corrupt
// value must never break a lesson.

const KEY = 'hk2_progress_v1';

const isPlainObject = v => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Keep only what a lesson entry may hold, with the types record() writes; null for anything else. */
function cleanEntry(e) {
  if (!isPlainObject(e)) return null;
  const out = {};
  for (const k of ['completed', 'solo', 'timed', 'started']) if (e[k]) out[k] = true;
  if (Number.isFinite(e.best) && e.best >= 0) out.best = e.best;
  if (Number.isFinite(e.at)) out.at = e.at;
  return out;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    const lessons = {};
    if (isPlainObject(v) && isPlainObject(v.lessons)) {
      for (const id in v.lessons) { const e = cleanEntry(v.lessons[id]); if (e) lessons[id] = e; }
    }
    return { lessons };
  } catch (e) { return { lessons: {} }; }
}
function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; } }

export const progress = {
  /** {completed, solo, timed, best (seconds) , at} or null */
  get(id) { const s = load(); return s.lessons[id] || null; },
  all() { return load().lessons; },
  status(id) { const p = this.get(id); return !p ? 'todo' : p.timed || p.solo ? 'mastered' : p.completed ? 'done' : 'started'; },
  /** Record a finished run. mode: 'guided' | 'solo' | 'timed'; secs: elapsed seconds. Returns false when nothing was saved. */
  record(id, mode, secs) {
    try {
      const s = load();
      const p = s.lessons[id] || {};
      p.completed = true;
      if (mode === 'solo') p.solo = true;
      if (mode === 'timed') {
        p.timed = true;
        const prev = Number.isFinite(p.best) ? p.best : null;
        if (Number.isFinite(secs) && secs >= 0 && (prev == null || secs < prev)) p.best = Math.round(secs * 100) / 100;
      }
      p.at = Date.now();
      s.lessons[id] = p;
      return save(s);
    } catch (e) { return false; }
  },
  touch(id) {
    try { const s = load(); if (!s.lessons[id]) { s.lessons[id] = { started: true, at: Date.now() }; return save(s); } return true; }
    catch (e) { return false; }
  },
  clear() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } },
};
