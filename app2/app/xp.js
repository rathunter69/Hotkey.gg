// app2/app/xp.js — XP and level, pure functions (SITE_SPEC §9). The level curve is the old
// build's: 150 / 300 / 450 to level 4, then a flat 600 per level — the early drip is generous,
// the grind never becomes a desert. XP events are deliberately modest and capped: XP measures
// showing up and finishing things, never speed (pars and PBs own speed), and achievements pay
// nothing — they are their own reward.

/** Level from total XP: { lvl, into, need, pct } — `into`/`need` drive the level bar. */
export function levelOf(xp) {
  const total = Number.isFinite(xp) && xp > 0 ? Math.floor(xp) : 0;
  let lvl = 1, need = 150, floor = 0;
  while (total >= floor + need) { floor += need; lvl++; need = Math.min(150 * lvl, 600); }
  return { lvl, into: total - floor, need, pct: Math.min(100, Math.round(100 * (total - floor) / need)) };
}

const DAY_CAPS = { 'lesson-repeat': 3, 'drill-repeat': 3, 'challenge-repeat': 3, rapid: 3 };

/**
 * XP one event earns, given the events already awarded (earlier in time, same shapes).
 * Events:
 *   { kind:'lesson', ref, day, assisted }  — a lesson completion (guided and solo pay alike)
 *   { kind:'drill',  ref, day, clean }     — a drill finish
 *   { kind:'daily',  day }                 — a Daily finish
 *   { kind:'rapid',  day }                 — a rapid-fire round
 * First lesson completion 50 (30 when help was revealed; the first unassisted run later pays the
 * withheld 20). Lesson repeats 5, drill repeats 10, rapid rounds 10 — each capped at 3 a day.
 * First clean drill finish 40. The Daily pays 30, once a day. Anything else pays 0.
 */
export function xpForEvent(e, history = []) {
  if (!e || typeof e !== 'object') return 0;
  const h = Array.isArray(history) ? history : [];
  const sameDayCount = tag => h.filter(x => x._tag === tag && x.day === e.day).length;

  if (e.kind === 'lesson') {
    const prior = h.filter(x => x.kind === 'lesson' && x.ref === e.ref);
    if (!prior.length) { e._tag = 'lesson-first'; return e.assisted ? 30 : 50; }
    const firstWasAssisted = prior[0].assisted === true;
    const paidRest = prior.some(x => x._tag === 'lesson-rest');
    if (firstWasAssisted && !paidRest && !e.assisted) { e._tag = 'lesson-rest'; return 20; }
    if (sameDayCount('lesson-repeat') >= DAY_CAPS['lesson-repeat']) return 0;
    e._tag = 'lesson-repeat'; return 5;
  }
  if (e.kind === 'drill') {
    const firstClean = !h.some(x => x.kind === 'drill' && x.ref === e.ref && x._tag === 'drill-first');
    if (e.clean && firstClean) { e._tag = 'drill-first'; return 40; }
    if (sameDayCount('drill-repeat') >= DAY_CAPS['drill-repeat']) return 0;
    e._tag = 'drill-repeat'; return 10;
  }
  if (e.kind === 'challenge') {
    // a recorded challenge attempt IS a pass (failed runs never record): first pass pays the
    // module's completion bonus, repeats pay like drill repeats
    const first = !h.some(x => x.kind === 'challenge' && x.ref === e.ref && x._tag === 'challenge-first');
    if (first) { e._tag = 'challenge-first'; return 50; }
    if (sameDayCount('challenge-repeat') >= DAY_CAPS['challenge-repeat']) return 0;
    e._tag = 'challenge-repeat'; return 10;
  }
  if (e.kind === 'daily') {
    if (h.some(x => x.kind === 'daily' && x.day === e.day)) return 0;
    e._tag = 'daily'; return 30;
  }
  if (e.kind === 'rapid') {
    if (sameDayCount('rapid') >= DAY_CAPS.rapid) return 0;
    e._tag = 'rapid'; return 10;
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
 * The XP event list derived from stored state: lesson completions (progress.js) and attempts
 * (records.js), ordered by time. One derivation for the nav chip, Stats and the level bar.
 */
export function eventsFrom(progressAll, attempts) {
  const evs = [];
  const day = t => new Date(Number.isFinite(t) ? t : 0).toISOString().slice(0, 10);
  for (const ref in progressAll || {}) {
    const p = progressAll[ref];
    if (p && p.completed) evs.push({ kind: 'lesson', ref, day: day(p.at), assisted: false, _at: p.at || 0 });
  }
  for (const a of attempts || []) {
    if (a.kind === 'drill') evs.push({ kind: 'drill', ref: a.ref, day: a.day || day(a.at), clean: a.clean, _at: a.at || 0 });
    else if (a.kind === 'challenge') evs.push({ kind: 'challenge', ref: a.ref, day: a.day || day(a.at), clean: a.clean, _at: a.at || 0 });
    else if (a.kind === 'daily') evs.push({ kind: 'daily', day: a.day || day(a.at), _at: a.at || 0 });
    else if (a.kind === 'rapid') evs.push({ kind: 'rapid', day: a.day || day(a.at), _at: a.at || 0 });
  }
  return evs.sort((x, y) => x._at - y._at);
}
