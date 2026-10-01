// app2/app/run-record.js — one record per timed run (screenplay 3.0 "Get these right now", 1;
// M96). Every timed run of every kind (a drill, the Daily, a challenge, a chapter assessment, a
// rapid-fire round, a timed lesson) writes this one record: the time, the keys pressed, the
// route's key count, each goal with when it landed, the help and mouse flags, the tier, and the
// device's keyboard layout and platform. Boards, pace, the result panel and the par recalibration
// (M24) all read it, so none of them needs a schema change later. Pure functions; the store keeps
// the records (records.js, and migration 0009 on the account).
//
//   makeRunRecord(fields)        → a clean record (null when it is not a run at all)
//   fromRun(run, extra)          → the record for a finished LessonRun / DrillRun
//   toAttempt(rec)               → the records.js attempt shape (what the store and 0007's RPC take today)
//   splitsOf(rec)                → seconds per goal, in order
//   pace(elapsed, done, total, pars) → { projected, tier }: the tier the run reaches at this rate
//   RUN_RECORD_VERSION, RUN_KINDS, LAYOUTS, PLATFORMS, TIERS, MAX_KEYS, MAX_GOALS

export const RUN_RECORD_VERSION = 1;
export const RUN_KINDS = ['drill', 'daily', 'challenge', 'assessment', 'rapid', 'lesson-timed'];
export const LAYOUTS = ['us', 'uk', 'other'];
export const PLATFORMS = ['win', 'mac'];
export const TIERS = ['none', 'pass', 'pro', 'legendary'];
export const MAX_KEYS = 600;    // the key log is capped where the ghost trace is (records.js, 0007)
export const MAX_GOALS = 60;    // the checklist's range (M98)

const isObj = v => typeof v === 'object' && v !== null && !Array.isArray(v);
const finite = v => Number.isFinite(v);
const round2 = v => Math.round(v * 100) / 100;

/** A key log entry: { k: the key as pressed, t: ms since the clock started, cell: the active cell or null }. */
function cleanKey(e) {
  if (!isObj(e) || typeof e.k !== 'string' || !e.k || !finite(e.t)) return null;
  return { k: e.k.slice(0, 32), t: Math.max(0, Math.round(e.t)), cell: typeof e.cell === 'string' && /^[A-Z]{1,3}\d{1,7}$/.test(e.cell) ? e.cell : null };
}
/** A goal as landed: { id, at: ms since the clock started (null when it never landed), assisted }. */
function cleanGoal(g) {
  if (!isObj(g) || typeof g.id !== 'string' || !g.id) return null;
  return { id: g.id.slice(0, 64), at: finite(g.at) && g.at >= 0 ? Math.round(g.at) : null, assisted: g.assisted === true };
}

/**
 * Build (or re-validate) a run record from loose fields. Returns null when `kind` or `ref` is
 * missing or wrong. A helped or moused run is never clean and earns no tier; a run past its time
 * limit earns no tier either.
 */
export function makeRunRecord(f) {
  if (!isObj(f) || !RUN_KINDS.includes(f.kind) || typeof f.ref !== 'string' || !f.ref) return null;
  const rawKeys = Array.isArray(f.keys) ? f.keys : [];
  const keys = rawKeys.map(cleanKey).filter(Boolean).slice(0, MAX_KEYS);
  const goals = (Array.isArray(f.goals) ? f.goals : []).map(cleanGoal).filter(Boolean).slice(0, MAX_GOALS);
  const helped = f.helped === true || goals.some(g => g.assisted);
  const mouse = Number.isInteger(f.mouse) && f.mouse >= 0 ? f.mouse : 0;
  const timedOut = f.timedOut === true;
  const clean = !helped && mouse === 0;
  const tier = clean && !timedOut && TIERS.includes(f.tier) ? f.tier : 'none';
  return {
    v: RUN_RECORD_VERSION,
    id: typeof f.id === 'string' && f.id ? f.id : newRunId(),
    kind: f.kind, ref: f.ref,
    day: typeof f.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f.day) ? f.day : null,
    seed: finite(f.seed) ? f.seed : null,
    secs: finite(f.secs) && f.secs >= 0 ? round2(f.secs) : null,
    keyCount: Number.isInteger(f.keyCount) && f.keyCount >= 0 ? f.keyCount : rawKeys.length,
    routeKeys: Number.isInteger(f.routeKeys) && f.routeKeys > 0 ? f.routeKeys : null,
    keys, goals,
    helped, mouse, clean, tier, timedOut,
    layout: LAYOUTS.includes(f.layout) ? f.layout : 'other',
    platform: PLATFORMS.includes(f.platform) ? f.platform : 'win',
    at: finite(f.at) ? f.at : Date.now(),
  };
}

export function newRunId() {
  try { return crypto.randomUUID(); } catch (e) { return 'r-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); }
}

/**
 * The record for a finished run (app/runner.js LessonRun or app/drill-run.js DrillRun):
 * `extra` carries what the run does not know: kind, ref, day, seed, layout, platform, tier, routeKeys.
 * Goals land at the session clock (ms since t0); keys the same, from the session's key log.
 */
export function fromRun(run, extra = {}) {
  const ses = run.session || {};
  const t0 = finite(ses.t0) ? ses.t0 : null;
  const spec = run.drill || run.lesson || {};
  const goals = (run.goals || []).map((g, i) => {
    const at = run.landedAt && finite(run.landedAt[i]) && t0 != null ? run.landedAt[i] - t0 : null;
    return { id: g.id || String(i), at, assisted: Array.isArray(run.assisted) ? run.assisted.includes(i) : (run.assistedGoals instanceof Set ? run.assistedGoals.has(i) : false) };
  });
  const log = Array.isArray(ses.keyLog) ? ses.keyLog : [];
  let first = 0;   // keys before the clock started all carry t = 0; only the clock-starting key stays
  for (let j = 0; j < log.length; j++) { if (log[j].t === 0) first = j; else break; }
  return makeRunRecord({
    id: extra.id, kind: extra.kind || run.kind || 'drill', ref: extra.ref || spec.id, day: extra.day, seed: extra.seed != null ? extra.seed : run.seed,
    secs: run.elapsed, keyCount: log.length, routeKeys: extra.routeKeys != null ? extra.routeKeys : spec.optimalKeys,
    keys: log.slice(first), goals,
    helped: run.helped === true, mouse: run.mouseCount || 0, timedOut: run.timedOut === true,
    tier: extra.tier != null ? extra.tier : run.tier, layout: extra.layout, platform: extra.platform, at: extra.at,
  });
}

/** Seconds per goal in order (null for a goal that never landed): the result panel's task rows and the par recalibration. */
export function splitsOf(rec) {
  let prev = 0;
  return (rec && rec.goals ? rec.goals : []).map(g => {
    if (g.at == null) return null;
    const s = round2(Math.max(0, g.at - prev) / 1000); prev = g.at; return s;
  });
}

/** The records.js attempt shape (what the device store and 0007's RPC take today), from a run record. */
export function toAttempt(rec) {
  if (!rec) return null;
  return {
    id: rec.id, kind: rec.kind === 'assessment' ? 'challenge' : rec.kind, ref: rec.ref, day: rec.day, seed: rec.seed,
    secs: rec.secs, keys: rec.keyCount, clean: rec.clean, helped: rec.helped, mouse: rec.mouse, tier: rec.tier, timedOut: rec.timedOut,
    splits: splitsOf(rec).filter(finite), trace: rec.clean ? rec.keys : [], at: rec.at,
    // the fields 0007 does not carry yet ride along for 0009 (route_keys, goals, layout, platform); the device store keeps what it knows
    routeKeys: rec.routeKeys, goals: rec.goals, layout: rec.layout, platform: rec.platform,
  };
}

/**
 * The pace line's figures (3.0, "The timed run"): at `elapsed` seconds with `done` of `total`
 * goals landed, the projected finish is elapsed × total / done, and `tier` is the tier that time
 * would earn against the pars ('none' when no tier is in reach: "Behind Pass pace"). Before the
 * first goal lands the pace is unknown: { projected: null, tier: null }.
 */
export function pace(elapsed, done, total, pars) {
  if (!finite(elapsed) || !Number.isInteger(done) || !Number.isInteger(total) || done <= 0 || total <= 0) return { projected: null, tier: null };
  const projected = round2(elapsed * total / done);
  let tier = 'none';
  if (pars && finite(pars.legendary) && projected <= pars.legendary) tier = 'legendary';
  else if (pars && finite(pars.pro) && projected <= pars.pro) tier = 'pro';
  else if (pars && finite(pars.pass) && projected <= pars.pass) tier = 'pass';
  return { projected, tier };
}
