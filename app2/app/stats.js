// app2/app/stats.js — one place that folds the stores into the game-layer's read models: the
// achievements/cosmetics ctx, the level, the Stats page numbers, and the celebration diff
// (which achievements and levels a finished run just earned). Pure over the store reads.
import { store } from './store.js';
import { eventsFrom, totalXP, levelOf } from './xp.js';
import { practiceStreak, ACHIEVEMENTS } from '../content/achievements.js';
import { earnedSet } from '../ui/badges.js';
import { dayOf } from './records.js';
import { DRILLS_BY_ID } from '../content/drills.js';
import { shortcutsUsed } from './runner.js';

/** The game ctx every consumer shares: achievements, cosmetics, the level chip, Stats. */
export function gameCtx() {
  const progress = store.all();
  const attempts = store.attempts();
  const pbs = store.pbRecords();
  const xp = totalXP(eventsFrom(progress, attempts));
  const lvl = levelOf(xp);
  const days = [...new Set(attempts.map(a => a.day).filter(Boolean))];
  for (const id in progress) { const at = progress[id] && progress[id].at; if (Number.isFinite(at)) days.push(dayOf(at)); }
  return {
    progress, attempts, pbs, xp,
    level: lvl.lvl, levelInfo: lvl,
    rank: store.rank(), rankIndex: 0,
    streakDays: practiceStreak([...new Set(days)], dayOf()),
  };
}

/**
 * What a just-finished run earned: { achievements: [defs], levelFrom, levelTo }.
 * Call snapshotCtx() BEFORE recording, then celebrate(effects, before) after.
 */
export function earnedSince(before) {
  const now = gameCtx();
  const had = earnedSet(before);
  const fresh = [];
  for (const id of earnedSet(now)) if (!had.has(id)) { const def = ACHIEVEMENTS.find(a => a.id === id); if (def) fresh.push(def); }
  return { achievements: fresh, levelFrom: before.level, levelTo: now.level, ctx: now };
}

/** Fire the named moments for everything a run just earned. Effects queue while the run is busy. */
export function celebrate(effects, before) {
  const r = earnedSince(before);
  if (r.levelTo > r.levelFrom && effects.levelUp) effects.levelUp(r.levelTo);
  for (const def of r.achievements) if (effects.achievement) effects.achievement(def);
  return r;
}

/* ---------------- the Stats page numbers (§8) ---------------- */
const sum = (list, f) => list.reduce((a, x) => a + (f(x) || 0), 0);

export function statsFor() {
  const ctx = gameCtx();
  const attempts = ctx.attempts;
  const graded = attempts.filter(a => a.kind === 'drill' || a.kind === 'daily');
  const timePractised = sum(attempts, a => a.secs);
  const keystrokes = sum(attempts, a => a.keys);
  // improvement per drill: first clean time vs the PB
  const improvement = Object.values(ctx.pbs).map(pb => {
    const firstClean = graded.filter(a => a.ref === pb.ref && a.clean && a.secs != null)[0];
    return { ref: pb.ref, title: (DRILLS_BY_ID[pb.ref] || {}).title || pb.ref, first: firstClean ? firstClean.secs : pb.secs, best: pb.secs };
  });
  // shortcuts used, folded from the stored PB traces (the honest sample we keep)
  const traceLog = Object.keys(ctx.pbs).flatMap(ref => store.trace(ref));
  const shortcuts = shortcutsUsed(traceLog);
  // estimated time saved — an ESTIMATE, labelled as such in the UI: a mouse-and-menus route runs
  // about three times the keystrokes' worth of actions; each action saved is worth ~0.5 s.
  const timeSaved = sum(graded.filter(a => a.clean), a => {
    const d = DRILLS_BY_ID[a.ref];
    return d ? Math.max(0, 3 * d.optimalKeys - a.keys) * 0.5 : 0;
  });
  return { ctx, attempts: attempts.length, timePractised, keystrokes, improvement, shortcuts, timeSaved, streak: ctx.streakDays };
}
