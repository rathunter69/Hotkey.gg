// app2/app/records.js — guest run records in localStorage: every graded attempt (drill, Daily,
// rapid-fire round, timed lesson), the derived personal bests and the PB traces the ghost
// replays. Same discipline as progress.js: every access try/catch, every stored shape
// normalised on load — corrupt storage can never break a run. The account mirror is Phase B's
// attempts table (see docs/REBUILD_PLAN.md §4): PBs, boards, XP and rank derive server-side.

const KEY = 'hk2_records_v1';
const MAX_ATTEMPTS = 500;   // a runaway history cannot eat localStorage
const MAX_TRACE = 600;      // ghost trace entries per PB (the brief's cap)

export const ATTEMPT_KINDS = ['drill', 'daily', 'rapid', 'lesson-timed', 'challenge'];
const TIERS = ['none', 'pass', 'pro', 'legendary'];

const isPlainObject = v => typeof v === 'object' && v !== null && !Array.isArray(v);
const finite = v => Number.isFinite(v);

/** Keep only what an attempt may hold, with sane types; null when it is not an attempt at all. */
export function cleanAttempt(a) {
  if (!isPlainObject(a) || typeof a.id !== 'string' || !a.id) return null;
  if (!ATTEMPT_KINDS.includes(a.kind) || typeof a.ref !== 'string' || !a.ref) return null;
  const out = { id: a.id, kind: a.kind, ref: a.ref };
  out.day = typeof a.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(a.day) ? a.day : null;
  out.seed = finite(a.seed) ? a.seed : null;
  out.secs = finite(a.secs) && a.secs >= 0 ? Math.round(a.secs * 100) / 100 : null;
  out.keys = Number.isInteger(a.keys) && a.keys >= 0 ? a.keys : 0;
  out.clean = a.clean === true;
  out.helped = a.helped === true;
  out.mouse = Number.isInteger(a.mouse) && a.mouse >= 0 ? a.mouse : 0;
  out.tier = TIERS.includes(a.tier) ? a.tier : 'none';
  out.splits = Array.isArray(a.splits) ? a.splits.filter(finite).slice(0, 32) : [];
  out.trace = out.clean && Array.isArray(a.trace)
    ? a.trace.filter(e => isPlainObject(e) && typeof e.k === 'string' && finite(e.t)).slice(0, MAX_TRACE).map(e => ({ k: e.k, t: e.t, cell: typeof e.cell === 'string' ? e.cell : null }))
    : [];
  out.at = finite(a.at) ? a.at : Date.now();
  return out;
}

function cleanPb(p) {
  if (!isPlainObject(p) || typeof p.ref !== 'string' || !finite(p.secs) || p.secs < 0) return null;
  return { ref: p.ref, secs: p.secs, keys: Number.isInteger(p.keys) ? p.keys : 0, attemptId: typeof p.attemptId === 'string' ? p.attemptId : null, at: finite(p.at) ? p.at : 0 };
}

function load() {
  const empty = { attempts: [], pbs: {}, traces: {} };
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    if (!isPlainObject(v)) return empty;
    const attempts = Array.isArray(v.attempts) ? v.attempts.map(cleanAttempt).filter(Boolean).slice(-MAX_ATTEMPTS) : [];
    const pbs = {};
    if (isPlainObject(v.pbs)) for (const ref in v.pbs) { const p = cleanPb(v.pbs[ref]); if (p && p.ref === ref) pbs[ref] = p; }
    const traces = {};
    if (isPlainObject(v.traces)) for (const ref in v.traces) if (Array.isArray(v.traces[ref])) traces[ref] = v.traces[ref].filter(e => isPlainObject(e) && typeof e.k === 'string' && finite(e.t)).slice(0, MAX_TRACE);
    return { attempts, pbs, traces };
  } catch (e) { return empty; }
}
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }

export const records = {
  /**
   * Record one finished attempt. A clean one (no help, no mouse) that beats the ref's PB also
   * becomes the new PB and its trace becomes the ghost. Returns false when nothing was saved.
   */
  addAttempt(a) {
    const att = cleanAttempt(a);
    if (!att) return false;
    try {
      const s = load();
      s.attempts.push({ ...att, trace: [] });   // the run itself; the ghost trace lives per-ref below
      if (s.attempts.length > MAX_ATTEMPTS) s.attempts = s.attempts.slice(-MAX_ATTEMPTS);
      if (att.clean && att.secs != null) {
        const prev = s.pbs[att.ref];
        if (!prev || att.secs < prev.secs) {
          s.pbs[att.ref] = { ref: att.ref, secs: att.secs, keys: att.keys, attemptId: att.id, at: att.at };
          s.traces[att.ref] = att.trace;
        }
      }
      return save(s);
    } catch (e) { return false; }
  },
  /** The personal best for a ref: { ref, secs, keys, attemptId, at } or null. */
  pb(ref) { return load().pbs[ref] || null; },
  /** Every PB, keyed by ref. */
  pbs() { return load().pbs; },
  /** Attempts, newest last; filter by ref and/or day ('YYYY-MM-DD'). */
  attempts(f = {}) {
    let list = load().attempts;
    if (f.ref) list = list.filter(a => a.ref === f.ref);
    if (f.day) list = list.filter(a => a.day === f.day);
    if (f.kind) list = list.filter(a => a.kind === f.kind);
    return list;
  },
  /** The ghost trace of the ref's PB run: [{k, t, cell}]; empty when there is none. */
  trace(ref) { return load().traces[ref] || []; },
  clear() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } },
};

/** Today as the records day-bucket: UTC, 'YYYY-MM-DD' (boards and the Daily share it). */
export const dayOf = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);

/** A fresh attempt id (idempotent retries server-side key on it — Phase B). */
export function attemptId() {
  try { return crypto.randomUUID(); } catch (e) { return 'a-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); }
}

/**
 * A session keyLog as a ghost trace. Keys pressed before the clock started all carry t = 0;
 * only the last of them (the clock-starting key) stays, so the ghost never replays warm-up
 * wandering that took no time.
 */
export function traceOf(keyLog) {
  const log = Array.isArray(keyLog) ? keyLog : [];
  let i = 0;
  for (let j = 0; j < log.length; j++) { if (log[j].t === 0) i = j; else break; }
  return log.slice(i).map(e => ({ k: e.k, t: e.t, cell: e.cell || null }));
}
