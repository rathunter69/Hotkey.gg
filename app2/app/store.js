// app2/app/store.js — the one progress facade. Pages talk to the store, never to progress.js or
// the network directly:
//
//   guest      → delegates to progress.js / prefs.js unchanged (config empty = nothing changes)
//   signed in  → an optimistic device cache (hk2_cache_v1, the progress.js shape) hydrated by
//                paging rpc_my_progress, and an outbox (hk2_outbox_v1) of attempts flushed with
//                backoff — the lesson never waits on the network
//
// Save state is honest and announced: saveState() returns 'device' | 'pending' | 'account' |
// 'retry' | 'failed' and every change fires a `hk:save` window event with the same value (nav
// shows the §1 strings). A session that expires mid-run degrades to guest reads and writes while
// the dead account's cache and outboxes stay on the device for its next sign-in (auth.lostUid).
// Everything account-scoped carries an auth token; a reply for a stale token is dropped, and a
// cache or outbox written by another uid is discarded, never sent.
import { progress } from './progress.js';
import { records, cleanAttempt } from './records.js';
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
export function mergeRun(lessons, id, mode, secs, clean, opts = {}) {
  const TIER_RANK = { pass: 1, pro: 2, legendary: 3 };
  const out = { ...lessons };
  const p = { ...(out[id] || {}) };
  p.completed = true;
  if (mode === 'solo') p.solo = true;
  if (mode === 'timed' || mode === 'challenge') {
    if (mode === 'timed') p.timed = true;
    const prev = Number.isFinite(p.best) ? p.best : null;
    if (clean !== false && Number.isFinite(secs) && secs >= 0 && (prev == null || secs < prev)) p.best = Math.round(secs * 100) / 100;
  }
  if (mode === 'challenge') {
    p.challenge = true;
    const t = opts.tier;
    if (TIER_RANK[t] && (!p.tier || TIER_RANK[t] > TIER_RANK[p.tier])) p.tier = t;
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
 * The caller's challenge runs (game_attempts rows, kind 'challenge') folded into a lessons map:
 * any run is a pass (a finished challenge always records), the best tier across runs is the
 * stamp, the fastest clean time is the best. A challenge passes as a game attempt, never a lesson
 * attempt, so rpc_my_progress alone cannot rebuild a module after the cache is gone. Pure.
 */
export function mergeChallengeRuns(lessons, rows) {
  let out = { ...(lessons || {}) };
  for (const r of rows || []) {
    if (!r || typeof r.ref !== 'string' || !r.ref) continue;
    const secs = r.secs == null ? null : Number(r.secs);
    out = mergeRun(out, r.ref, 'challenge', secs, r.clean === true, { tier: r.tier });
    const at = r.client_at ? Date.parse(r.client_at) : NaN;
    if (Number.isFinite(at)) out[r.ref] = { ...out[r.ref], at };
  }
  return out;
}

/**
 * Runs still queued on this device, laid over what the server returned, so a hydrate never hides
 * work that has not reached the account yet. Lesson items follow mergeRun; game items only
 * matter here when they are challenges (the rest live in records.js). Pure.
 */
export function overlayQueued(lessons, lessonItems, gameItems) {
  let out = { ...(lessons || {}) };
  for (const i of lessonItems || []) if (i && typeof i.lesson_id === 'string') out = mergeRun(out, i.lesson_id, i.mode, i.secs, !i.assisted && !i.mouse_count);
  for (const g of gameItems || []) if (g && g.kind === 'challenge' && typeof g.ref === 'string') out = mergeRun(out, g.ref, 'challenge', g.secs, g.clean === true, { tier: g.tier });
  return out;
}

/** A PostgREST reply that means the session is gone (expired JWT, revoked, auth.uid() null). Pure. */
export function isAuthError(error, status) {
  if (status === 401 || status === 403 && /jwt/i.test(String(error && error.message))) return true;
  if (!error) return false;
  const code = String(error.code || '');
  if (code === 'PGRST301' || code === 'PGRST302' || code === '401') return true;
  return /jwt expired|invalid jwt|not signed in|JWSError/i.test(String(error.message || ''));
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
let lastSave = 'account';    // 'pending' | 'account' | 'retry' for the account
let guestSave = 'device';    // 'device' | 'failed' (storage blocked) for a guest
let hydrated = false;
let flushing = null;         // the in-flight drain (one at a time: two drains could both send items[0])
let gameFlushing = null;

function announce(state) {
  try { if (typeof window !== 'undefined' && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('hk:save', { detail: state })); } catch (e) { /* no DOM */ }
}
function setSave(state) { lastSave = state; announce(state); }

function uid() { const u = auth.user(); return u ? u.id : null; }
function signedIn() { return auth.state() === 'in'; }
/** Whose device state the store reads and writes: the signed-in uid, or the one whose session just expired. */
function acct() { return uid() || (typeof auth.lostUid === 'function' ? auth.lostUid() : null); }
function accountMode() { return !!acct(); }

/** The cache belongs to exactly one uid; anything else (foreign, corrupt) is discarded. Pure. */
export function ownedCache(raw, forUid) {
  return isObj(raw) && forUid && raw.uid === forUid && isObj(raw.lessons) ? raw.lessons : null;
}
/** The outbox too — a foreign account's queued attempts are NEVER sent. Pure. */
export function ownedOutbox(raw, forUid) {
  return isObj(raw) && forUid && raw.uid === forUid && Array.isArray(raw.items) ? raw.items : [];
}
function readCache() { return ownedCache(readJson(CACHE_KEY), acct()); }
function writeCache(lessons) { return writeJson(CACHE_KEY, { uid: acct(), lessons }); }

function readOutbox() { return ownedOutbox(readJson(OUTBOX_KEY), acct()); }
function writeOutbox(items) { return writeJson(OUTBOX_KEY, { uid: acct(), items }); }

function scheduleFlush(delay) {
  if (flushTimer || typeof setTimeout !== 'function') return;
  flushTimer = setTimeout(() => { flushTimer = null; flushOutbox(); }, delay == null ? flushDelay : delay);
}
function clearFlushTimer() { if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; } }

/**
 * Send one queued item. 'sent' (stored, or a duplicate the server ignored by id), 'drop' (a
 * malformed payload retrying cannot fix), 'retry' (network / server), 'auth' (session gone),
 * 'missing' (the RPC is not deployed yet), 'stale' (the owner changed mid-flight).
 */
async function sendOne(sb, t, rpc, args) {
  try {
    const { error, status } = await sb.rpc(rpc, args);
    if (!auth.current(t)) return 'stale';
    if (!error) return 'sent';
    if (isAuthError(error, status)) return 'auth';
    const msg = String(error.message || '');
    if (msg.includes('bad attempt')) return 'drop';
    if (/does not exist|schema cache|PGRST202/i.test(msg)) return 'missing';
    return 'retry';
  } catch (e) {
    return auth.current(t) ? 'retry' : 'stale';
  }
}

/**
 * Drain the lesson outbox in order, oldest first, one request at a time. An item leaves the
 * queue only once the server has it; ids are client-made, so a reply lost after the insert
 * resends a duplicate the server ignores — nothing is ever counted twice.
 */
function flushOutbox() {
  if (flushing) return flushing;
  // .finally is always async: an early return can never clear the slot before it is set
  flushing = (async () => {
    {
      clearFlushTimer();
      for (let guard = 0; guard < 500; guard++) {
        if (!signedIn()) return;
        const t = auth.token();
        const items = readOutbox();
        if (!items.length) { flushDelay = 1000; setSave('account'); return; }
        const sb = auth.client(); if (!sb) return;
        const item = items[0];
        const r = await sendOne(sb, t, 'rpc_record_attempt', { p: item });
        if (r === 'stale') return;
        if (r === 'auth') { setSave('retry'); if (await auth.recover(t)) continue; return; }
        if (r === 'retry' || r === 'missing') {
          setSave('retry');
          flushDelay = Math.min(flushDelay * 2, 60000);
          scheduleFlush();
          return;
        }
        writeOutbox(readOutbox().filter(i => i.id !== item.id));   // sent or dropped
        flushDelay = 1000;
      }
    }
  })().finally(() => { flushing = null; });
  return flushing;
}

/* ---- game attempts (Phase D follow-up): a second outbox to rpc_submit_game_attempt.
   Local records.js stays the UI's source (ghost, stats, PBs work offline); the server mirror
   accrues for boards, deduped by attempt id, so a dual write can never double count. ---- */
export const GAME_OUTBOX_KEY = 'hk2_game_outbox_v1';
const GAME_SYNC_KEY = 'hk2_game_sync_v1';
let gameFlushTimer = null;
let gameFlushDelay = 1000;
let gameRpcMissing = false;   // 0007 not applied yet: park the queue instead of retrying forever
function readGameOutbox() { return ownedOutbox(readJson(GAME_OUTBOX_KEY), acct()); }
function writeGameOutbox(items) { return writeJson(GAME_OUTBOX_KEY, { uid: acct(), items }); }

/** A local attempt as the RPC payload (records.cleanAttempt shapes it; `at` becomes client_at). */
export function attemptToWire(a) {
  const c = cleanAttempt(a);
  if (!c) return null;
  const { at, ...rest } = c;
  return { ...rest, client_at: new Date(at).toISOString() };
}

function scheduleGameFlush(delay) {
  if (gameRpcMissing || gameFlushTimer || typeof setTimeout !== 'function') return;
  gameFlushTimer = setTimeout(() => { gameFlushTimer = null; flushGameOutbox(); }, delay == null ? gameFlushDelay : delay);
}
function flushGameOutbox() {
  if (gameFlushing) return gameFlushing;
  // .finally is always async: an early return can never clear the slot before it is set
  gameFlushing = (async () => {
    {
      if (gameFlushTimer) { clearTimeout(gameFlushTimer); gameFlushTimer = null; }
      for (let guard = 0; guard < 1000; guard++) {
        if (!signedIn()) return;
        const t = auth.token();
        const items = readGameOutbox();
        if (!items.length) { gameFlushDelay = 1000; return; }
        const sb = auth.client(); if (!sb) return;
        const item = items[0];
        const { _guest, ...p } = item;
        const r = await sendOne(sb, t, 'rpc_submit_game_attempt', { p, p_guest: !!_guest });
        if (r === 'stale') return;
        if (r === 'missing') { gameRpcMissing = true; return; }   // server not there yet: park until the next hydrate
        if (r === 'auth') { if (await auth.recover(t)) continue; return; }
        if (r === 'retry') {
          gameFlushDelay = Math.min(gameFlushDelay * 2, 60000);
          scheduleGameFlush();
          return;
        }
        writeGameOutbox(readGameOutbox().filter(i => i.id !== item.id));
        gameFlushDelay = 1000;
      }
    }
  })().finally(() => { gameFlushing = null; });
  return gameFlushing;
}

/** Once per account on this device: replay the guest game records into the account (id-deduped). */
function maybeGameSync() {
  const me = uid(); if (!me) return;
  const synced = readJson(GAME_SYNC_KEY);
  if (isObj(synced) && synced.uid === me) return;
  const wired = records.attempts().map(a => {
    const w = attemptToWire(a);
    if (!w) return null;
    const pb = records.pb(a.ref);
    if (pb && pb.attemptId === a.id) w.trace = records.trace(a.ref);   // the PB run carries the ghost
    return { ...w, _guest: true };
  }).filter(Boolean);
  if (wired.length) {
    const have = new Set(readGameOutbox().map(i => i.id));
    writeGameOutbox(readGameOutbox().concat(wired.filter(w => !have.has(w.id))));
  }
  writeJson(GAME_SYNC_KEY, { uid: me, at: Date.now() });
  if (readGameOutbox().length) scheduleGameFlush(0);
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

/** The caller's challenge runs (owner-only select under RLS); null on any failure. */
async function fetchChallengeRuns(sb, t) {
  try {
    const { data, error } = await sb.from('game_attempts').select('ref, tier, secs, clean, client_at').eq('kind', 'challenge').order('created_at', { ascending: true }).limit(2000);
    if (!auth.current(t) || error || !Array.isArray(data)) return null;
    return data;
  } catch (e) { return null; }
}

/** Page rpc_my_game (the caller's clean-run PBs); null on any failure. */
async function fetchGamePbs(sb, t) {
  const rows = [];
  let after = '';
  try {
    for (let page = 0; page < 20; page++) {
      const { data, error } = await sb.rpc('rpc_my_game', { p_after: after, p_limit: 200 });
      if (!auth.current(t) || error || !Array.isArray(data)) return null;
      rows.push(...data);
      if (data.length < 200) break;
      after = data[data.length - 1].ref;
    }
  } catch (e) { return null; }
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

/** Global boards read on the Leaderboard, per account|ref|seed, kept for BOARD_TTL ms. */
const boardCache = new Map();
const BOARD_TTL = 30000;

/* ------------------------------------------------------------------ the facade */

export const store = {
  /* ---- reads: cache when signed in and hydrated, else the guest modules ---- */
  all() { if (accountMode()) { const c = cacheLessons || readCache(); if (c) return c; } return progress.all(); },
  get(id) { return this.all()[id] || null; },
  status(id) {
    const p = this.get(id);
    return !p ? 'todo' : p.timed || p.solo ? 'mastered' : p.completed ? 'done' : 'started';
  },
  touch(id) {
    if (accountMode()) {
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
    if (!accountMode()) {
      const ok = progress.record(id, mode, secs, opts);
      guestSave = ok ? 'device' : 'failed';
      announce(guestSave);
      return ok;
    }
    cacheLessons = mergeRun(this.all(), id, mode, secs, opts.clean, opts);
    const cached = writeCache(cacheLessons);
    // A challenge is a game run: its server record is the game attempt (addAttempt, kind
    // 'challenge' — 0008), not a lesson attempt; only the optimistic cache is written here.
    if (mode === 'challenge') return cached;
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
    if (!signedIn()) setSave('retry');                   // session expired: queued for the next sign-in
    else if (lastSave !== 'retry') setSave('pending');   // honest until the drain confirms
    if (signedIn()) flushOutbox();
    return cached || queued;
  },

  /* ---- chapter gates: local for now (an account mirror arrives with paid access in Phase E) ---- */
  chapter(ch) { return progress.chapter(ch); },
  chapterPass(ch, what) { return progress.chapterPass(ch, what); },

  /* ---- run records (Phase D): records.js is the UI's source; signed in, every attempt also
     rides the game outbox to rpc_submit_game_attempt (0007), deduped server-side by id. ---- */
  addAttempt(a) {
    const ok = records.addAttempt(a);
    if (accountMode()) {
      const w = attemptToWire(a);
      if (w) { writeGameOutbox(readGameOutbox().concat([w])); if (signedIn() && !gameRpcMissing) flushGameOutbox(); }
    }
    return ok;
  },
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
  /** Signed in: the Leaderboard reads the global field (rpc_board); signed out it stays local (§2). */
  liveBoards() { return signedIn(); },
  /**
   * One global board from rpc_board (0007/0008): p_seed null is the all-time board, a seed is
   * that sheet's board (the Daily). Resolves { rows, me } — rows best-first as the server ranks
   * them, `mine` flagged by the caller's handle — or null when signed out or the read failed.
   * Reads are cached briefly so switching tabs does not refetch every board.
   */
  async globalBoard(ref, { seed = null, limit = 200 } = {}) {
    if (!signedIn()) return null;
    const sb = auth.client(); if (!sb) return null;
    const t = auth.token();
    const key = acct() + '|' + ref + '|' + (seed == null ? '' : seed);
    const hit = boardCache.get(key);
    if (hit && Date.now() - hit.at < BOARD_TTL) return hit.v;
    try {
      const { data, error } = await sb.rpc('rpc_board', { p_ref: ref, p_limit: limit, p_seed: seed == null ? null : seed });
      if (!auth.current(t) || error || !Array.isArray(data)) return null;
      const me = profile && profile.handle;
      const v = { me: me || null, rows: data.map(r => ({ pos: Number(r.pos), handle: r.handle, level: r.level, secs: Number(r.secs), keys: r.keys, tier: r.tier, mine: !!me && r.handle === me })) };
      boardCache.set(key, { at: Date.now(), v });
      return v;
    } catch (e) { return null; }
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
  saveState() { return accountMode() ? lastSave : guestSave; },
  /** The §1 string for a state (nav and pages share one wording). */
  saveText(state) {
    const s = state || this.saveState();
    return SAVE_TEXT[s] || SAVE_TEXT.device;
  },
  /** The same state as a phrase after "Your progress is …" (landing, learn, home). */
  saveLine(state) {
    const s = state || this.saveState();
    return SAVE_LINE[s] || SAVE_LINE.device;
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
    const [rows, runs, pbs] = await Promise.all([fetchAllProgress(sb, t), fetchChallengeRuns(sb, t), fetchGamePbs(sb, t)]);
    if (!auth.current(t)) return;
    if (rows) {
      // the server's lessons + its challenge passes (modules rebuild from both) + anything still queued here
      let l = rowsToLessons(rows);
      if (runs) l = mergeChallengeRuns(l, runs);
      else l = mergeChallengeRuns(l, Object.entries(readCache() || {}).filter(([, v]) => v && v.challenge).map(([ref, v]) => ({ ref, tier: v.tier, secs: v.best, clean: v.best != null })));
      cacheLessons = overlayQueued(l, readOutbox(), readGameOutbox());
      writeCache(cacheLessons);
      hydrated = true;
    }
    if (pbs) records.importPbs(pbs);   // PBs survive a new device or a sign-out wipe (the ghost trace stays local)
    if (profile) {
      // the profile is the source of learner state once signed in
      prefs.set({ experience: profile.experience || null, firstRunDone: !!profile.first_run_done, skipped: profile.skipped_lessons || [] });
      // the theme follows the account (as in the old build)
      try { if (profile.theme && profile.theme !== currentTheme()) { applyTheme(profile.theme); saveTheme(profile.theme); } } catch (e) { /* no DOM */ }
      if (profile.handle) announceUser();
    }
    if (readOutbox().length) { setSave('pending'); flushOutbox(); } else setSave('account');
    gameRpcMissing = false;   // a fresh session may have 0007 by now
    maybeGameSync();
    if (readGameOutbox().length) flushGameOutbox();
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
  reset() {
    profile = null; cacheLessons = null; hydrated = false; flushDelay = 1000; gameFlushDelay = 1000;
    boardCache.clear();
    clearFlushTimer(); if (gameFlushTimer) { clearTimeout(gameFlushTimer); gameFlushTimer = null; }
    lastSave = auth.lostUid && auth.lostUid() && (readOutbox().length || readGameOutbox().length) ? 'retry' : 'account';
    announce(this.saveState());
  },
  flushNow() { return flushOutbox(); },
  /** Both queues, now; resolves when they are empty or stuck (the sign-out button waits on this, capped). */
  async drain(ms = 3000) {
    if (!signedIn()) return this.pending() === 0;
    const until = Date.now() + ms;
    const passes = (async () => {
      // an in-flight drain may be the one about to back off: a couple of fresh passes, then stop
      for (let i = 0; i < 3 && this.pending() && signedIn() && Date.now() < until; i++) {
        await Promise.all([flushOutbox(), gameRpcMissing ? null : flushGameOutbox()]);
      }
    })();
    let timer = null;
    await Promise.race([passes, new Promise(r => { timer = setTimeout(r, ms); })]);
    clearTimeout(timer);
    return this.pending() === 0;
  },
  /** Runs queued on this device that the account does not have yet. */
  pending() { return accountMode() ? readOutbox().length + readGameOutbox().length : 0; },
};

const SAVE_TEXT = {
  device: 'Saved on this device',
  pending: 'Saving to your account…',
  account: 'Saved to your account',
  retry: 'Couldn’t save, will retry',
  failed: 'Couldn’t save on this device',
};
const SAVE_LINE = {
  device: 'saved on this device',
  pending: 'being saved to your account',
  account: 'saved to your account',
  retry: 'kept on this device until your account can be reached',
  failed: 'not being saved: this browser is blocking storage',
};

// back online: drain now instead of waiting out the backoff
try {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', () => { if (signedIn()) { flushDelay = 1000; gameFlushDelay = 1000; flushOutbox(); if (!gameRpcMissing) flushGameOutbox(); } });
  }
} catch (e) { /* no DOM */ }

function announceUser() {
  try {
    if (typeof window !== 'undefined' && typeof CustomEvent === 'function' && profile) {
      window.dispatchEvent(new CustomEvent('hk:user', { detail: { handle: profile.handle, level: profile.level } }));
    }
  } catch (e) { /* no DOM */ }
}
