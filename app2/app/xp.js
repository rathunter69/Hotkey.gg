// app2/app/xp.js — XP, pure functions (screenplay 6.10; M59). The level curve and its constants
// live in content/levels.js (M103: one data table for levels, titles and XP); levelOf here is that
// function, re-exported so every reader keeps one import. XP measures how much you've practiced,
// never how fast (pars and PBs own speed), and achievements pay nothing: the shelf is its own reward.
import { levelOf } from '../content/levels.js';
import { QUEST_XP } from '../content/quests.js';
export { levelOf };

/**
 * Where XP comes from, one row per run (6.10's table, as data). The profile's "Where XP comes
 * from" table renders these rows, so the explanation and the arithmetic can never disagree.
 */
export const XP_TABLE = {
  lesson: 50, lessonClean: 10,
  challenge: 50, challengeExpert: 25, challengeLegendary: 50,
  drillFirstClean: 40, drillRepeat: 5,
  daily: 30,
  rapid: 10,
  questDaily: QUEST_XP.daily, questWeekly: QUEST_XP.weekly, bonusDaily: QUEST_XP.dailyBonus, bonusWeekly: QUEST_XP.weeklyBonus,
  achievement: 0,
};
/** Repeats that would farm XP stop paying after this many in a day. */
export const DAY_CAPS = { 'drill-repeat': 3, rapid: 3 };

/**
 * XP one event earns, given the events already awarded (earlier in time, same shapes).
 * Events:
 *   { kind:'lesson', ref, day, clean }        a lesson completion (a clean finish ever pays the +10 once)
 *   { kind:'challenge', ref, day, tier }      a challenge pass; each tier pays the first time it is reached
 *   { kind:'drill', ref, day, clean }         a drill finish
 *   { kind:'daily', day }                     a Daily finish, once a day
 *   { kind:'rapid', day }                     a rapid-fire round
 *   { kind:'quest' | 'quest-bonus' | 'quest-archive', xp }   what the quest ledger paid (app/quests.js)
 */
export function xpForEvent(e, history = []) {
  if (!e || typeof e !== 'object') return 0;
  const h = Array.isArray(history) ? history : [];
  const T = XP_TABLE;
  const sameDayCount = tag => h.filter(x => x._tag === tag && x.day === e.day).length;
  const had = (kind, tag) => h.some(x => x.kind === kind && x.ref === e.ref && x._tag === tag);

  if (e.kind === 'lesson') {
    let xp = 0;
    if (!h.some(x => x.kind === 'lesson' && x.ref === e.ref)) { xp += T.lesson; e._tag = 'lesson-first'; }
    if (e.clean && !h.some(x => x.kind === 'lesson' && x.ref === e.ref && x._clean)) { xp += T.lessonClean; e._clean = true; }
    return xp;
  }
  if (e.kind === 'challenge') {
    // a recorded challenge attempt is a pass (failed runs never record); each tier pays once
    const order = ['none', 'pass', 'pro', 'legendary'];
    const rank = order.indexOf(e.tier || 'none');
    let xp = 0;
    if (!had('challenge', 'c-pass')) { xp += T.challenge; e._tag = 'c-pass'; }
    const tiers = [];
    if (rank >= 2 && !h.some(x => x.kind === 'challenge' && x.ref === e.ref && (x._tiers || []).includes('pro'))) { xp += T.challengeExpert; tiers.push('pro'); }
    if (rank >= 3 && !h.some(x => x.kind === 'challenge' && x.ref === e.ref && (x._tiers || []).includes('legendary'))) { xp += T.challengeLegendary; tiers.push('legendary'); }
    e._tiers = tiers;
    return xp;
  }
  if (e.kind === 'drill') {
    if (e.clean && !had('drill', 'drill-first')) { e._tag = 'drill-first'; return T.drillFirstClean; }
    if (sameDayCount('drill-repeat') >= DAY_CAPS['drill-repeat']) return 0;
    e._tag = 'drill-repeat'; return T.drillRepeat;
  }
  if (e.kind === 'daily') {
    if (h.some(x => x.kind === 'daily' && x.day === e.day)) return 0;
    e._tag = 'daily'; return T.daily;
  }
  if (e.kind === 'rapid') {
    if (sameDayCount('rapid') >= DAY_CAPS.rapid) return 0;
    e._tag = 'rapid'; return T.rapid;
  }
  if (e.kind === 'quest' || e.kind === 'quest-bonus' || e.kind === 'quest-archive') {
    return Number.isInteger(e.xp) && e.xp > 0 ? e.xp : 0;
  }
  return 0;
}

/** Total XP over an event list, in order (each event sees only the ones before it). */
export function totalXP(events) {
  const seen = [];
  let xp = 0;
  for (const e of Array.isArray(events) ? events : []) {
    const ev = { ...e };
    xp += xpForEvent(ev, seen);
    seen.push(ev);
  }
  return xp;
}

/**
 * The XP event list derived from stored state: lesson completions (progress.js), attempts
 * (records.js) and what the quest ledger paid (app/quests.js questEvents), ordered by time. One
 * derivation for the rail chip, the profile and the level bar. A challenge pays through its
 * attempts, so its progress entry is skipped (it would count the same pass twice).
 */
export function eventsFrom(progressAll, attempts, questEvs = []) {
  const evs = [];
  const day = t => new Date(Number.isFinite(t) ? t : 0).toISOString().slice(0, 10);
  for (const ref in progressAll || {}) {
    const p = progressAll[ref];
    if (p && p.completed && !p.challenge) evs.push({ kind: 'lesson', ref, day: day(p.at), clean: p.clean === true, _at: p.at || 0 });
  }
  for (const a of attempts || []) {
    if (a.kind === 'drill') evs.push({ kind: 'drill', ref: a.ref, day: a.day || day(a.at), clean: a.clean, _at: a.at || 0 });
    else if (a.kind === 'challenge') evs.push({ kind: 'challenge', ref: a.ref, day: a.day || day(a.at), tier: a.clean && !a.timedOut ? a.tier : 'none', _at: a.at || 0 });
    else if (a.kind === 'daily') evs.push({ kind: 'daily', day: a.day || day(a.at), _at: a.at || 0 });
    else if (a.kind === 'rapid') evs.push({ kind: 'rapid', day: a.day || day(a.at), _at: a.at || 0 });
  }
  for (const q of questEvs || []) evs.push({ ...q });
  return evs.sort((x, y) => x._at - y._at);
}
