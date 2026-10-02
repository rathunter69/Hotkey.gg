// app2/app/quests.js — the quest loop (screenplay 6.6 and 6.10; M54, M59). Pure over a ledger:
// draw() picks the three daily and three weekly quests for a period from the pool in
// content/quests.js, progress() counts a quest from the practice log, settle() ticks what a run
// finished and pays the bonus when all three are done. The ledger lives in localStorage
// (hk2_quests_v1); a quest once done stays done, so the XP it paid never moves.
//
// The practice log holds one entry per finished lesson, drill, Daily or challenge run:
//   { k: 'lesson'|'drill'|'daily'|'challenge', ref, at, clean, tier, pb, ghost, noWaste, noMouse, keys: { 'F4': 3, ... } }
// Rapid-fire rounds are read from their attempt records (kind 'rapid', splits[0] = hits), so the
// rapid-fire page needs no hook.
import { QUESTS, QUESTS_BY_ID, QUESTS_PER_PERIOD, QUEST_XP, AGAIN_AFTER_DAYS } from '../content/quests.js';
import { REFERENCE_BY_ID } from '../content/reference.js';

export const LEDGER_KEY = 'hk2_quests_v1';
const LOG_DAYS = 9;   // a week and a margin: older entries can count for nothing
const DAY = 86400000;

/* ---------------- periods (UTC, the Daily's clock) ---------------- */
export const dayKey = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);
/** The Monday that starts the UTC week holding t, as YYYY-MM-DD. */
export function weekKey(t = Date.now()) {
  const d = new Date(t); const back = (d.getUTCDay() + 6) % 7;
  return dayKey(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - back * DAY);
}
export const periodKey = (period, t) => (period === 'weekly' ? 'w' + weekKey(t) : 'd' + dayKey(t));
/** [start, end) of the period holding t, in ms. */
export function periodSpan(period, t = Date.now()) {
  const start = Date.parse((period === 'weekly' ? weekKey(t) : dayKey(t)) + 'T00:00:00Z');
  return [start, start + (period === 'weekly' ? 7 : 1) * DAY];
}

/* ---------------- a seeded order, so a day's draw is the same on every load ---------------- */
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ---------------- the ledger ---------------- */
export const emptyLedger = () => ({ log: [], done: {}, bonus: {}, draws: {}, rolls: {}, archive: { done: 0, weeks: 0, xp: 0 } });
const isObj = v => typeof v === 'object' && v !== null && !Array.isArray(v);
export function cleanLedger(v) {
  const L = emptyLedger();
  if (!isObj(v)) return L;
  if (Array.isArray(v.log)) L.log = v.log.filter(e => isObj(e) && typeof e.k === 'string' && Number.isFinite(e.at));
  for (const f of ['done', 'bonus', 'rolls']) if (isObj(v[f])) for (const k in v[f]) if (Number.isFinite(v[f][k]) || typeof v[f][k] === 'string') L[f][k] = v[f][k];
  if (isObj(v.archive)) for (const f of ['done', 'weeks', 'xp']) if (Number.isInteger(v.archive[f]) && v.archive[f] > 0) L.archive[f] = v.archive[f];
  if (isObj(v.draws)) for (const k in v.draws) if (Array.isArray(v.draws[k])) L.draws[k] = v.draws[k].filter(d => isObj(d) && QUESTS_BY_ID[d.id]);
  return L;
}
export function loadLedger() {
  try { const raw = localStorage.getItem(LEDGER_KEY); return cleanLedger(raw ? JSON.parse(raw) : null); } catch (e) { return emptyLedger(); }
}
export function saveLedger(L) {
  const keep = Date.now() - LOG_DAYS * DAY;
  const out = { ...L, log: L.log.filter(e => e.at >= keep).slice(-400) };
  // periods older than the log can no longer change: their draws go, and what they paid folds
  // into the archive totals, so the XP and the counts never move
  const oldest = 'd' + dayKey(keep), oldestW = 'w' + weekKey(keep);
  const old = k => { const p = k.split(':')[0]; return p < (p[0] === 'w' ? oldestW : oldest); };
  out.archive = { ...L.archive };
  for (const f of ['draws', 'done', 'bonus', 'rolls']) {
    out[f] = {};
    for (const k in L[f]) {
      if (!old(k)) { out[f][k] = L[f][k]; continue; }
      if (f === 'done') { const q = QUESTS_BY_ID[k.split(':')[1]]; out.archive.done++; out.archive.xp += q ? q.xp : 0; }
      if (f === 'bonus') { if (k[0] === 'w') out.archive.weeks++; out.archive.xp += k[0] === 'w' ? QUEST_XP.weeklyBonus : QUEST_XP.dailyBonus; }
    }
  }
  try { localStorage.setItem(LEDGER_KEY, JSON.stringify(out)); return true; } catch (e) { return false; }
}

/* ---------------- who may be drawn what ---------------- */
/**
 * ctx: { completed: Set<lessonId>, lessonsLeft: bool, pro: bool, again: [{ ref, module }],
 *        drillsByChapter: { [chapterId]: [drillId] } (the drills this learner may play) }
 */
export function eligible(q, ctx) {
  if (!q || !ctx) return false;
  if (q.pro && !ctx.pro) return false;
  const n = q.needs;
  if (n === 'lessons-left' && !ctx.lessonsLeft) return false;
  if (n === 'challenge-again' && !(ctx.again && ctx.again.length)) return false;
  if (n && typeof n === 'object') {
    const lesson = n.lesson || (n.taught && REFERENCE_BY_ID[n.taught] && REFERENCE_BY_ID[n.taught].lessonId);
    if (!lesson || !(ctx.completed && ctx.completed.has(lesson))) return false;
  }
  if (q.metric === 'chapter' && !Object.values(ctx.drillsByChapter || {}).some(l => l.length >= 2)) return false;
  return true;
}

/** The three quests of a period: [{ id, ref?, module? }]. Seeded by the period key; no repeats. */
export function draw(period, key, ctx, pool = QUESTS) {
  const rows = pool.filter(q => q.period === period && eligible(q, ctx));
  rows.sort((a, b) => hash(key + a.id) - hash(key + b.id));
  // a daily draw carries at most one fun quest, so the core loop always leads
  const picked = []; let fun = 0;
  for (const q of rows) {
    if (picked.length >= QUESTS_PER_PERIOD) break;
    if (q.fun && fun >= 1) continue;
    if (q.fun) fun++;
    picked.push(q);
  }
  for (const q of rows) if (picked.length < QUESTS_PER_PERIOD && !picked.includes(q)) picked.push(q);
  return picked.map(q => {
    if (q.needs !== 'challenge-again') return { id: q.id };
    const a = ctx.again[hash(key + q.id) % ctx.again.length];
    return { id: q.id, ref: a.ref, module: a.module };
  });
}

/** The modules whose challenge was passed but not clean in the last fourteen days: [{ ref, module }]. */
export function againCandidates(challenges, attempts, now = Date.now()) {
  const cut = now - AGAIN_AFTER_DAYS * DAY;
  const out = [];
  for (const c of challenges) {
    const runs = attempts.filter(a => a.kind === 'challenge' && a.ref === c.ref);
    if (!runs.length) continue;
    if (runs.some(a => a.clean && a.at >= cut)) continue;
    out.push(c);
  }
  return out;
}

/* ---------------- progress ---------------- */
function matches(e, w = {}, draw = {}) {
  if (w.kind && !w.kind.includes(e.k)) return false;
  if (w.clean && !e.clean) return false;
  if (w.tier) { const order = ['none', 'pass', 'pro', 'legendary']; if (order.indexOf(e.tier || 'none') < order.indexOf(w.tier)) return false; }
  if (w.pb && !e.pb) return false;
  if (w.ghost && !e.ghost) return false;
  if (w.noWaste && !e.noWaste) return false;
  if (w.noMouse && !e.noMouse) return false;
  if (w.before != null && !(new Date(e.at).getHours() < w.before)) return false;
  if (w.ref === '{ref}' && e.ref !== draw.ref) return false;
  return true;
}
function keyCount(e, keys) {
  let n = 0;
  for (const k in e.keys || {}) if (keys.some(want => want === k || (want === 'Alt *' && /^Alt [A-Z0-9=]/.test(k)))) n += e.keys[k] || 0;
  return n;
}

/**
 * How far one drawn quest has got: { have, target, done }. `events` is the practice log plus the
 * rapid rounds, already cut to the period.
 */
export function progress(d, events, ctx = {}) {
  const q = QUESTS_BY_ID[d.id];
  if (!q) return { have: 0, target: 1, done: false };
  let have = 0, target = q.target;
  const hits = events.filter(e => matches(e, q.where, d));
  if (q.metric === 'count') have = hits.length;
  else if (q.metric === 'distinct') have = new Set(hits.map(e => e.ref)).size;
  else if (q.metric === 'best') have = hits.reduce((m, e) => Math.max(m, Number(e[q.field]) || 0), 0);
  else if (q.metric === 'keys') have = events.reduce((n, e) => n + keyCount(e, q.keys), 0);
  else if (q.metric === 'chapter') {
    // the chapter nearest done sets the bar: every drill in it, once
    const played = new Set(events.filter(e => e.k === 'drill').map(e => e.ref));
    let best = null;
    for (const [ch, ids] of Object.entries(ctx.drillsByChapter || {})) {
      if (ids.length < 2) continue;
      const got = ids.filter(id => played.has(id)).length;
      const left = ids.length - got;
      if (!best || left < best.left || (left === best.left && ids.length < best.of)) best = { ch, got, of: ids.length, left };
    }
    have = best ? best.got : 0; target = best ? best.of : 1;
  }
  return { have: Math.min(have, target), target, done: have >= target };
}

/** The log and rapid rounds that fall in a period. */
export function periodEvents(L, attempts, period, t = Date.now()) {
  const [a, b] = periodSpan(period, t);
  const rapid = (attempts || []).filter(x => x.kind === 'rapid').map(x => ({ k: 'rapid', ref: x.ref, at: x.at, hits: (x.splits || [])[0] || 0 }));
  return [...L.log, ...rapid].filter(e => e.at >= a && e.at < b);
}

/**
 * The quest board for now: { started, daily: {key, rows, bonus}, weekly: {key, rows, bonus} }.
 * Draws a period the first time it is asked for and keeps the draw in the ledger (mutates L).
 * A row: { id, ref, module, have, target, done, xp }.
 */
export function board(L, attempts, ctx, t = Date.now()) {
  const started = !!(ctx.completed && ctx.completed.size);
  const out = { started };
  for (const period of ['daily', 'weekly']) {
    const key = periodKey(period, t);
    if (!L.draws[key] && started) L.draws[key] = draw(period, key, ctx);
    const evs = periodEvents(L, attempts, period, t);
    const rows = (L.draws[key] || []).map(d => {
      const q = QUESTS_BY_ID[d.id];
      const p = progress(d, evs, ctx);
      const done = !!L.done[key + ':' + d.id] || p.done;
      return { ...d, have: done ? p.target : p.have, target: p.target, done, xp: q.xp, period };
    });
    out[period] = { key, rows, bonus: !!L.bonus[key], bonusXp: period === 'weekly' ? QUEST_XP.weeklyBonus : QUEST_XP.dailyBonus, roll: L.rolls[key] || null };
  }
  return out;
}

/**
 * Tick what is now done (mutates L): returns { ticked: [row], bonus: [{ period, xp, roll }] }.
 * `roll(L)` picks the weekly clear's reward (a flair id the learner hasn't got), or null.
 */
export function settle(L, attempts, ctx, t = Date.now(), roll = null) {
  const b = board(L, attempts, ctx, t);
  const ticked = [], bonus = [];
  if (!b.started) return { ticked, bonus, board: b };
  for (const period of ['daily', 'weekly']) {
    const P = b[period];
    for (const r of P.rows) if (r.done && !L.done[P.key + ':' + r.id]) { L.done[P.key + ':' + r.id] = t; ticked.push(r); }
    if (P.rows.length === QUESTS_PER_PERIOD && P.rows.every(r => r.done) && !L.bonus[P.key]) {
      L.bonus[P.key] = t;
      let got = null;
      if (period === 'weekly' && roll) { got = roll(L) || null; if (got) L.rolls[P.key] = got; }
      P.bonus = true; P.roll = got;
      bonus.push({ period, xp: P.bonusXp, roll: got });
    }
  }
  return { ticked, bonus, board: b };
}

/** The XP events the ledger has paid: quests done and bonuses, for app/xp.js. */
export function questEvents(L) {
  const evs = [];
  for (const k in L.done) {
    const [key, id] = k.split(':'); const q = QUESTS_BY_ID[id];
    if (q && key) evs.push({ kind: 'quest', ref: k, xp: q.xp, _at: L.done[k] });
  }
  if (L.archive && L.archive.xp) evs.push({ kind: 'quest-archive', ref: 'archive', xp: L.archive.xp, _at: 0 });
  for (const k in L.bonus) evs.push({ kind: 'quest-bonus', ref: k, xp: k[0] === 'w' ? QUEST_XP.weeklyBonus : QUEST_XP.dailyBonus, _at: L.bonus[k] });
  return evs;
}

/** How many quests the learner has ever finished, and weekly clears: for the achievements. */
export function questTotals(L) {
  const a = L.archive || {};
  return { done: Object.keys(L.done).length + (a.done || 0), weeks: Object.keys(L.bonus).filter(k => k[0] === 'w').length + (a.weeks || 0) };
}

/** One log entry from a finished run (the shortcuts used, folded to a map). */
export function logEntry({ kind, ref, clean = false, tier = 'none', pb = false, ghost = false, noWaste = false, noMouse = false, used = [], at = Date.now() }) {
  const keys = {};
  for (const u of used || []) if (u && typeof u.keys === 'string') keys[u.keys] = (keys[u.keys] || 0) + (u.count || 0);
  return { k: kind, ref, at, clean: !!clean, tier, pb: !!pb, ghost: !!ghost, noWaste: !!noWaste, noMouse: !!noMouse, keys };
}
