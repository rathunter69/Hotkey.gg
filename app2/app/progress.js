// app2/app/progress.js — guest progress in localStorage. Every access is wrapped in try/catch and
// every stored shape is normalised on load: a private window, a blocked storage API or a corrupt
// value must never break a lesson.

const KEY = 'hk2_progress_v1';

/**
 * The lesson id migration map: a retired id → the lesson that now carries its ground. A record
 * under a retired id folds into the new one as `started` (the learner began that ground; nothing
 * they did not do is marked done), then the old key goes. Run 4 extends this map when the legacy
 * lessons are deleted.
 */
export const LESSON_ID_MAP = {
  'welcome-export': 'inherited-workbook',   // the Welcome race folded into 1.1.1's opening goals (C2 Run 2 addendum)
  'welcome-race': 'inherited-workbook',     // the legacy race: the same ground (Run 4)
  'managing-sheets': 'inherited-workbook',
  'excel-options': 'analyst-setup',
  'page-setup': 'fit-to-one-page',
  'weekly-report-project': 'weekly-kpi-project',
  // 'foundations-assessment' and 'foundations-testout' keep their ids
};
/** The legacy lesson ids deleted in Run 4: their records are dropped on load (bar the map above) and their URLs go to the catalog. */
export const LEGACY_IDS = new Set(['welcome-race', 'workbook-sheets-cells', 'managing-sheets', 'ribbon-and-keytips', 'excel-options', 'page-setup', 'active-cell', 'moving-around', 'selecting-ranges', 'entering-data', 'editing-cells', 'ribbon-commands', 'dialog-boxes', 'page-keys', 'go-to-cells', 'select-blocks', 'go-to-special', 'undo-redo', 'fill-down-right', 'find-replace', 'insert-delete-rows', 'widths-heights', 'hide-freeze', 'home-tab-tour', 'format-cells-tabs', 'fills-and-colours', 'first-formula', 'sum-family', 'autosum', 'absolute-refs', 'cross-sheet', 'formula-errors', 'copy-cut-paste', 'paste-special', 'fill-series', 'weekly-report-project', 'welcome-export']);
/** Apply the id migration once over a lessons map (in place): mapped ids fold into their successor as started; other legacy ids are dropped. */
export function migrateIds(lessons) {
  for (const old in LESSON_ID_MAP) {
    if (!lessons[old]) continue;
    const to = LESSON_ID_MAP[old];
    if (!lessons[to]) lessons[to] = { started: true, ...(Number.isFinite(lessons[old].at) ? { at: lessons[old].at } : {}) };
    delete lessons[old];
  }
  for (const id in lessons) if (LEGACY_IDS.has(id)) delete lessons[id];
  return lessons;
}

const isPlainObject = v => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Keep only what a lesson entry may hold, with the types record() writes; null for anything else. */
function cleanEntry(e) {
  if (!isPlainObject(e)) return null;
  const out = {};
  for (const k of ['completed', 'solo', 'timed', 'started', 'challenge']) if (e[k]) out[k] = true;
  if (['pass', 'pro', 'legendary'].includes(e.tier)) out.tier = e.tier;
  if (Number.isFinite(e.best) && e.best >= 0) out.best = e.best;
  if (Number.isFinite(e.at)) out.at = e.at;
  return out;
}
const TIER_RANK = { pass: 1, pro: 2, legendary: 3 };

/** Keep only chapter records of the shape {assessment: true, testout: true}; anything else drops. */
function cleanChapters(v) {
  const out = {};
  if (!isPlainObject(v)) return out;
  for (const ch in v) {
    if (!isPlainObject(v[ch])) continue;
    const rec = {};
    for (const k of ['assessment', 'testout']) if (v[ch][k]) rec[k] = true;
    if (Object.keys(rec).length) out[ch] = rec;
  }
  return out;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    const lessons = {};
    if (isPlainObject(v) && isPlainObject(v.lessons)) {
      for (const id in v.lessons) { const e = cleanEntry(v.lessons[id]); if (e) lessons[id] = e; }
      migrateIds(lessons);
    }
    return { lessons, chapters: cleanChapters(isPlainObject(v) ? v.chapters : null) };
  } catch (e) { return { lessons: {}, chapters: {} }; }
}
function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; } }

export const progress = {
  /** {completed, solo, timed, best (seconds) , at} or null */
  get(id) { const s = load(); return s.lessons[id] || null; },
  all() { return load().lessons; },
  status(id) { const p = this.get(id); return !p ? 'todo' : p.timed || p.solo ? 'mastered' : p.completed ? 'done' : 'started'; },
  /**
   * Record a finished run. mode: 'guided' | 'solo' | 'timed'; secs: elapsed seconds. A timed run
   * sets a personal best only when it was clean (opts.clean, default true): SITE_SPEC §6 — any
   * help or workspace mouse use in a timed run means no PB. Returns false when nothing was saved.
   */
  record(id, mode, secs, opts = {}) {
    try {
      const s = load();
      const p = s.lessons[id] || {};
      p.completed = true;
      if (mode === 'solo') p.solo = true;
      if (mode === 'timed' || mode === 'challenge') {
        if (mode === 'timed') p.timed = true;
        const prev = Number.isFinite(p.best) ? p.best : null;
        if (opts.clean !== false && Number.isFinite(secs) && secs >= 0 && (prev == null || secs < prev)) p.best = Math.round(secs * 100) / 100;
      }
      if (mode === 'challenge') {
        // a recorded challenge run is a pass at some tier; the entry keeps the best tier ever
        p.challenge = true;
        const t = opts.tier;
        if (TIER_RANK[t] && (!p.tier || TIER_RANK[t] > TIER_RANK[p.tier])) p.tier = t;
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
  /** A chapter gate passed: what = 'assessment' | 'testout'. Latches; returns false when nothing was saved. */
  chapterPass(ch, what) {
    if (what !== 'assessment' && what !== 'testout') return false;
    try { const s = load(); const rec = s.chapters[ch] || {}; rec[what] = true; s.chapters[ch] = rec; return save(s); }
    catch (e) { return false; }
  },
  /** The chapter's gate record: { assessment?: true, testout?: true } (empty when nothing passed). */
  chapter(ch) { return load().chapters[ch] || {}; },
  clear() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } },
};
