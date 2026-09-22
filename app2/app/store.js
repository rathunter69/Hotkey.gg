// app2/app/store.js — the one progress facade. Pages talk to the store, never to progress.js or
// the network directly:
//
//   guest      → delegates to progress.js / prefs.js unchanged (config empty = nothing changes)
//   signed in  → an optimistic device cache (hk2_cache_v1, the progress.js shape) hydrated by
//                paging rpc_my_progress, and an outbox (hk2_outbox_v1) of attempts flushed with
//                backoff — the lesson never waits on the network
//
// Save state is honest and announced: saveState() returns 'device' | 'account' | 'retry' and
// every change fires a `hk:save` window event with the same value (nav shows the §1 strings).
// Everything account-scoped carries an auth token; a reply for a stale token is dropped, and a
// cache or outbox written by another uid is discarded, never sent.
import { progress } from './progress.js';
import { records } from './records.js';
import { prefs } from './prefs.js';
import { auth } from './auth.js';
import { applyTheme, saveTheme, currentTheme } from '../ui/themes.js';
import { track } from './telemetry.js';

export const CACHE_KEY = 'hk2_cache_v1';
export const OUTBOX_KEY = 'hk2_outbox_v1';
export const GUEST_ID_KEY = 'hk2_guest_id';

const isObj = v => typeof v === 'object' && v !== null && !Array.isArray(v);
const store_ = () => (typeof localStorage !== 'undefined' ? localStorage : null);
function readJson(key) {
  try { const s = store_(); const raw = s && s.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function writeJson(key, v) {
  try { const s = store_(); if (!s) return false; s.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; }
}
function removeKey(key) { try { const s = store_(); if (s) s.removeItem(key); } catch (e) { /* blocked */ } }
export function newId() {
  try { return crypto.randomUUID(); } catch (e) {
    // no crypto.randomUUID (very old engine): RFC-4122-shaped fallback, good enough for retry dedupe
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
  }
}

/* ------------------------------------------------------------------ pure: the progress merge */

/**
 * Apply one recorded run to a progress-shaped lessons map, mirroring progress.js record() and
 * the server's apply_attempt: completed always; solo/timed per mode; best only on a clean timed
 * run, never regressing. Pure; exported for the tests.
 */
export function mergeRun(lessons, id, mode, secs, clean) {
  const out = { ...lessons };
  const p = { ...(out[id] || {}) };
  p.completed = true;
  if (mode === 'solo') p.solo = true;
  if (mode === 'timed') {
    p.timed = true;
    const prev = Number.isFinite(p.best) ? p.best : null;
    if (clean !== false && Number.isFinite(secs) && secs >= 0 && (prev == null || secs < prev)) p.best = Math.round(secs * 100) / 100;
  }
  p.at = Date.now();
  out[id] = p;
  return out;
}

/** Server lesson_progress rows → the progress.js lessons shape. Pure; exported for the tests. */
export function rowsToLessons(rows) {
  const lessons = {};
  for (const r of rows || []) {
    if (!r || typeof r.lesson_id !== 'string') continue;
    const e = {};
    if (r.completed) e.completed = true;
    if (r.solo) e.solo = true;
    if (r.timed) e.timed = true;
    const best = r.best_secs == null ? null : Number(r.best_secs);
    if (Number.isFinite(best) && best >= 0) e.best = best;
    const at = r.last_at ? Date.parse(r.last_at) : NaN;
    if (Number.isFinite(at)) e.at = at;
    lessons[r.lesson_id] = e;
  }
  return lessons;
}

/**
 * Guest progress + prefs → the rpc_carry_over payload: one synthetic guided attempt per
 * completed lesson (secs null), plus solo/timed attempts carrying the flags and the best.
 * Pure over its inputs; exported for the tests.
 */
export function buildCarryPayload(lessons, prefsRec, guestId, makeId) {
  const mk = makeId || newId;
  const attempts = [];
  const now = new Date().toISOString();
  for (const id of Object.keys(lessons || {})) {
    const p = lessons[id];
    if (!p || !p.completed) continue;
    attempts.push({ id: mk(), lesson_id: id, mode: 'guided', secs: null, client_at: now });
    if (p.solo) attempts.push({ id: mk(), lesson_id: id, mode: 'solo', secs: null, client_at: now });
    if (p.timed) attempts.push({ id: mk(), lesson_id: id, mode: 'timed', secs: Number.isFinite(p.best) ? p.best : null, client_at: now });
  }
  return {
    guest_id: guestId,
    attempts,
    skipped: (prefsRec && prefsRec.skipped) || [],
    experience: (prefsRec && prefsRec.experience) || null,
    lessons: attempts.filter(a => a.mode === 'guided').length,
    bests: attempts.filter(a => a.mode === 'timed' && a.secs != null).length,
  };
}

/* ------------------------------------------------------------------ signed-in state */

let profile = null;          // { handle, level, xp, theme, experience, first_run_done, skipped_lessons, public_profile, carried_at }
let cacheLessons = null;     // the account's lessons map (progress.js shape), null while not hydrated
let flushTimer = null;
let flushDelay = 1000;
let lastSave = 'account';    // 'account' | 'retry' while signed in
let hydrated = false;

function announce(state) {
  try { if (typeof window !== 'undefined' && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('hk:save', { detail: state })); } catch (e) { /* no DOM */ }
}
function setSave(state) { lastSave = state; announce(state); }

function uid() { const u = auth.user(); return u ? u.id : null; }
function signedIn() { return auth.state() === 'in'; }

/** The cache belongs to exactly one uid; anything else (foreign, corrupt) is discarded. Pure. */
export function ownedCache(raw, forUid) {
  return isObj(raw) && forUid && raw.uid === forUid && isObj(raw.lessons) ? raw.lessons : null;
}
/** The outbox too — a foreign account's queued attempts are NEVER sent. Pure. */
export function ownedOutbox(raw, forUid) {
  return isObj(raw) && forUid && raw.uid === forUid && Array.isArray(raw.items) ? raw.items : [];
}
function readCache() { return ownedCache(readJson(CACHE_KEY), uid()); }
function writeCache(lessons) { writeJson(CACHE_KEY, { uid: uid(), lessons }); }

function readOutbox() { return ownedOutbox(readJson(OUTBOX_KEY), uid()); }
function writeOutbox(items) { writeJson(OUTBOX_KEY, { uid: uid(), items }); }

function scheduleFlush(delay) {
  if (flushTimer || typeof setTimeout !== 'function') return;
  flushTimer = setTimeout(() => { flushTimer = null; flushOutbox(); }, delay == null ? flushDelay : delay);
}

async function flushOutbox() {
  if (!signedIn()) return;
  const t = auth.token();
  const items = readOutbox();
  if (!items.length) { setSave('account'); return; }
  const sb = auth.client();
  if (!sb) return;
  const item = items[0];
  let failed = false;
  try {
    const { error } = await sb.rpc('rpc_record_attempt', { p: item });
    if (!auth.current(t)) return;                        // owner changed mid-flight: drop
    if (error) failed = !String(error.message || '').includes('bad attempt');
    // 'bad attempt' is a malformed payload: retrying it forever cannot help — drop it
  } catch (e) {
    if (!auth.current(t)) return;
    failed = true;
  }
  if (failed) {
    setSave('retry');
    flushDelay = Math.min(flushDelay * 2, 60000);
    scheduleFlush();
    return;
  }
  writeOutbox(readOutbox().filter(i => i.id !== item.id));
  flushDelay = 1000;
  if (readOutbox().length) scheduleFlush(0); else setSave('account');
}

/** Page rpc_my_progress until a short page; null on any failure (the cache stays). */
async function fetchAllProgress(sb, t) {
  const rows = [];
  let after = '';
  for (let page = 0; page < 50; page++) {
    const { data, error } = await sb.rpc('rpc_my_progress', { p_after: after, p_limit: 200 });
    if (!auth.current(t)) return null;
    if (error || !Array.isArray(data)) return null;
    rows.push(...data);
    if (data.length < 200) break;
    after = data[data.length - 1].lesson_id;
  }
  return rows;
}

async function fetchProfile(sb, t) {
  const { data, error } = await sb.from('profiles').select('handle, level, xp, theme, experience, first_run_done, skipped_lessons, public_profile, carried_at').eq('id', t.id).single();
  if (!auth.current(t) || error || !isObj(data)) return null;
  return data;
}

/** Once per sign-in: carry the guest blob over, then drop the local copies. */
async function maybeCarryOver(sb, t) {
  const local = progress.all();
  if (!Object.keys(local).length) return;
  if (!profile || profile.carried_at) { removeKey(GUEST_ID_KEY); return; }
  let guestId = null;
  try { guestId = store_() && store_().getItem(GUEST_ID_KEY); } catch (e) { /* blocked */ }
  if (!guestId) { guestId = newId(); try { store_() && store_().setItem(GUEST_ID_KEY, guestId); } catch (e) { /* blocked */ } }
  const payload = buildCarryPayload(local, prefs.get(), guestId);
  let theme = null;
  try { theme = localStorage.getItem('hotkey_theme'); } catch (e) { /* blocked */ }
  try {
    const { error } = await sb.rpc('rpc_carry_over', {
      p_guest_id: payload.guest_id,
      p_attempts: payload.attempts,
      p_skipped: payload.skipped,
      p_experience: payload.experience,
      p_theme: theme,
    });
    if (!auth.current(t)) return;
    const msg = error ? String(error.message || '') : '';
    if (!error || msg.includes('already carried') || msg.includes('carried to another account')) {
      // carried (or this blob's chance is spent): the local copy must not carry twice
      progress.clear();
      removeKey(GUEST_ID_KEY);
      if (!error) { profile = { ...profile, carried_at: new Date().toISOString() }; track('carry_over', { lessons: payload.lessons, bests: payload.bests }); }
    }
  } catch (e) { /* network: try again next sign-in */ }
}

/* ------------------------------------------------------------------ the facade */

export const store = {
  /* ---- reads: cache when signed in and hydrated, else the guest modules ---- */
  all() { if (signedIn()) { const c = cacheLessons || readCache(); if (c) return c; } return progress.all(); },
  get(id) { return this.all()[id] || null; },
  status(id) {
    const p = this.get(id);
    return !p ? 'todo' : p.timed || p.solo ? 'mastered' : p.completed ? 'done' : 'started';
  },
  touch(id) {
    if (signedIn()) {
      const c = this.all();
      if (!c[id]) { cacheLessons = { ...c, [id]: { started: true, at: Date.now() } }; writeCache(cacheLessons); }
      return true;
    }
    return progress.touch(id);
  },

  /**
   * Record a finished run. Guest: progress.js, unchanged. Signed in: optimistic cache merge,
   * outbox push, background flush. Returns false only when nothing could be stored at all.
   */
  record(id, mode, secs, opts = {}) {
    if (!signedIn()) {
      const ok = progress.record(id, mode, secs, opts);
      announce(ok ? 'device' : 'retry');
      return ok;
    }
    cacheLessons = mergeRun(this.all(), id, mode, secs, opts.clean);
    const cached = writeCache(cacheLessons);
    const item = {
      id: newId(),
      lesson_id: id,
      mode,
      secs: Number.isFinite(secs) ? Math.round(secs * 100) / 100 : null,
      keystrokes: Number.isFinite(opts.keystrokes) ? opts.keystrokes : 0,
      mouse_count: Number.isFinite(opts.mouseCount) ? opts.mouseCount : 0,
      assisted: !!opts.assisted,
      client_at: new Date().toISOString(),
    };
    const queued = writeOutbox(readOutbox().concat([item]));
    setSave('retry');            // honest until the flush confirms
    scheduleFlush(0);
    return cached || queued;
  },

  /* ---- chapter gates: local for now (an account mirror arrives with paid access in Phase E) ---- */
  chapter(ch) { return progress.chapter(ch); },
  chapterPass(ch, what) { return progress.chapterPass(ch, what); },

  /* ---- run records (Phase D): local store; the account mirror is the attempts table (plan §4).
     When accounts carry attempts, addAttempt gains an outbox push like record() above. ---- */
  addAttempt(a) { return records.addAttempt(a); },
  pb(ref) { return records.pb(ref); },
  pbRecords() { return records.pbs(); },
  attempts(f) { return records.attempts(f); },
  trace(ref) { return records.trace(ref); },
  /** The board for a ref: your clean times, best first — the honest local list until boards ship. */
  boards(ref) {
    return records.attempts({ ref }).filter(a => a.clean && a.secs != null)
      .sort((x, y) => x.secs - y.secs)
      .map(a => ({ secs: a.secs, keys: a.keys, tier: a.tier, at: a.at, mine: true }));
  },
  /** Rank needs real boards (Phase B): every guest is Unranked, honestly. */
  rank() { return null; },

  /* ---- learner state: prefs stays the read path; the store writes through ---- */
  skipped() { return prefs.get().skipped; },
  skip(ids) { prefs.skip(ids); this.pushLearner(); },
  unskip(id) { prefs.unskip(id); this.pushLearner(); },
  setLearner(patch) {
    prefs.set(patch);
    this.pushLearner();
  },
  /** Mirror the prefs learner fields to the profile (fire-and-forget, token-guarded). */
  pushLearner() {
    if (!signedIn()) return;
    const sb = auth.client(); if (!sb) return;
    const t = auth.token();
    const p = prefs.get();
    sb.rpc('rpc_set_profile', { p: { experience: p.experience, first_run_done: p.firstRunDone, skipped_lessons: p.skipped } })
      .then(({ data, error }) => { if (auth.current(t) && !error && data) profile = data; })
      .catch(() => { /* the next write retries implicitly */ });
  },

  /* ---- save state ---- */
  saveState() { return signedIn() ? lastSave : 'device'; },
  /** The §1 string for a state (nav and pages share one wording). */
  saveText(state) {
    const s = state || this.saveState();
    return s === 'account' ? 'Saved to your account' : s === 'retry' ? 'Couldn’t save, will retry' : 'Saved on this device';
  },

  /* ---- account ---- */
  profile() { return signedIn() ? profile : null; },
  /**
   * After ready()/sign-in: load the profile, carry guest work over (once, ever), hydrate the
   * account cache from rpc_my_progress, hydrate the prefs learner fields from the profile,
   * flush anything queued. Safe to call repeatedly; token-guarded throughout.
   */
  async hydrate() {
    if (!signedIn()) { hydrated = false; profile = null; cacheLessons = null; return; }
    const sb = auth.client(); if (!sb) return;
    const t = auth.token();
    const prof = await fetchProfile(sb, t);
    if (!auth.current(t)) return;
    if (prof) profile = prof;
    await maybeCarryOver(sb, t);
    if (!auth.current(t)) return;
    const rows = await fetchAllProgress(sb, t);
    if (!auth.current(t)) return;
    if (rows) { cacheLessons = rowsToLessons(rows); writeCache(cacheLessons); hydrated = true; }
    if (profile) {
      // the profile is the source of learner state once signed in
      prefs.set({ experience: profile.experience || null, firstRunDone: !!profile.first_run_done, skipped: profile.skipped_lessons || [] });
      // the theme follows the account (as in the old build)
      try { if (profile.theme && profile.theme !== currentTheme()) { applyTheme(profile.theme); saveTheme(profile.theme); } } catch (e) { /* no DOM */ }
      if (profile.handle) announceUser();
    }
    if (readOutbox().length) { setSave('retry'); scheduleFlush(0); } else setSave('account');
  },
  /** The theme picker calls this on every pick; signed in, the pick rides the account. */
  setTheme(name) {
    if (!signedIn()) return;
    const sb = auth.client(); if (!sb) return;
    const t = auth.token();
    sb.rpc('rpc_set_profile', { p: { theme: String(name).slice(0, 32) } })
      .then(({ data, error }) => { if (auth.current(t) && !error && data) profile = data; })
      .catch(() => { /* next pick retries */ });
  },
  /** Drop the in-memory account state (sign-out path; auth cleared the device keys already). */
  reset() { profile = null; cacheLessons = null; hydrated = false; lastSave = 'account'; flushDelay = 1000; announce('device'); },
  flushNow() { return flushOutbox(); },
};

function announceUser() {
  try {
    if (typeof window !== 'undefined' && typeof CustomEvent === 'function' && profile) {
      window.dispatchEvent(new CustomEvent('hk:user', { detail: { handle: profile.handle, level: profile.level } }));
    }
  } catch (e) { /* no DOM */ }
}
