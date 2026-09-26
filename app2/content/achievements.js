// app2/content/achievements.js — the badge wall (SITE_SPEC §9): long-arc goals over lessons,
// drills, the Daily and rapid-fire. Achievements pay no XP — they are their own reward. Every
// test(ctx) is total: it returns { done, prog, goal } on any ctx, including {} (a fresh guest),
// and never throws. Earned ids persist, so ids are FROZEN once shipped; only names and
// descriptions may move.
//
// ctx = { progress   lessons map (store.all()),
//         pbs        PBs by ref (store.pbRecords()),
//         attempts   attempt list (store.attempts()),
//         xp, level, rank, streakDays }
import { LESSONS } from './index.js';
import { DRILLS } from './drills.js';

const P = c => (c && typeof c.progress === 'object' && c.progress) || {};
const A = c => (Array.isArray(c && c.attempts) ? c.attempts : []);
const B = c => (c && typeof c.pbs === 'object' && c.pbs) || {};
const n = (done, prog, goal) => ({ done: !!done, prog: Math.min(prog || 0, goal), goal });
const count = (done, goal) => n(done >= goal, done, goal);

const lessonsDone = c => LESSONS.filter(l => { const p = P(c)[l.id]; return p && p.completed; }).length;
const sectionDone = (c, section) => {
  const ls = LESSONS.filter(l => l.section === section && (l.kind === undefined || l.kind === 'lesson'));
  const done = ls.filter(l => { const p = P(c)[l.id]; return p && p.completed; }).length;
  return n(ls.length > 0 && done >= ls.length, done, ls.length || 1);
};
const soloCount = c => LESSONS.filter(l => { const p = P(c)[l.id]; return p && p.solo; }).length;
const drillAttempts = c => A(c).filter(a => a.kind === 'drill' || a.kind === 'daily');
const drillsTried = c => new Set(drillAttempts(c).map(a => a.ref)).size;
const tierRuns = (c, tier) => {
  const order = { pass: 1, pro: 2, legendary: 3 };
  return drillAttempts(c).filter(a => order[a.tier] >= order[tier]);
};
const tierDrills = (c, tier) => new Set(tierRuns(c, tier).map(a => a.ref)).size;
const dailyDays = c => new Set(A(c).filter(a => a.kind === 'daily' && a.day).map(a => a.day)).size;
const optimalOf = ref => { const d = DRILLS.find(x => x.id === ref); return d ? d.optimalKeys : null; };
const atOptimal = c => drillAttempts(c).filter(a => { const o = optimalOf(a.ref); return a.clean && o != null && a.keys > 0 && a.keys <= o; });
const hourOf = at => { try { return new Date(at).getHours(); } catch (e) { return 12; } };
const rapidBest = (c, i) => Math.max(0, ...A(c).filter(a => a.kind === 'rapid').map(a => (a.splits && a.splits[i]) || 0));

export const RARITIES = ['common', 'rare', 'epic', 'legendary'];

export const ACHIEVEMENTS = [
  // ---- the campaign: sections and the chapter ----
  { id: 'first-lesson', glyph: 'seed', rarity: 'common', name: 'First Steps', desc: 'Complete your first lesson', test: c => count(lessonsDone(c), 1) },
  { id: 'mod-setup', glyph: 'flag', rarity: 'common', name: 'Through the Door', desc: 'Finish Open and set up', test: c => sectionDone(c, 'Open and set up') },
  { id: 'mod-move', glyph: 'arrows', rarity: 'common', name: 'Navigator', desc: 'Finish Move and select', test: c => sectionDone(c, 'Move and select') },
  { id: 'mod-edit', glyph: 'pencil', rarity: 'common', name: 'Editor', desc: 'Finish Enter, edit, copy and fill', test: c => sectionDone(c, 'Enter, edit, copy and fill') },
  { id: 'mod-structure', glyph: 'rows', rarity: 'common', name: 'Structural', desc: 'Finish Structure', test: c => sectionDone(c, 'Structure') },
  { id: 'mod-format', glyph: 'ribbon', rarity: 'common', name: 'House Style', desc: 'Finish Format', test: c => sectionDone(c, 'Format') },
  { id: 'mod-formulas', glyph: 'sigma', rarity: 'common', name: 'Calculator', desc: 'Finish Formulas', test: c => sectionDone(c, 'Formulas') },
  { id: 'mod-present', glyph: 'book', rarity: 'common', name: 'Signed Off', desc: 'Finish Present and audit', test: c => sectionDone(c, 'Present and audit') },
  { id: 'ch1-project', glyph: 'grid', rarity: 'rare', name: 'Report Builder', desc: 'Complete the weekly report project', test: c => count(P(c)['weekly-kpi-project'] && P(c)['weekly-kpi-project'].completed ? 1 : 0, 1) },
  { id: 'ch1-assessment', glyph: 'clock', rarity: 'rare', name: 'Under the Clock', desc: 'Pass the Foundations assessment', test: c => count(P(c)['foundations-assessment'] && P(c)['foundations-assessment'].completed ? 1 : 0, 1) },
  { id: 'ch1-testout', glyph: 'bolt', rarity: 'rare', name: 'Skipped Ahead', desc: 'Test out of Foundations', test: c => count(P(c)['foundations-testout'] && P(c)['foundations-testout'].completed ? 1 : 0, 1) },
  { id: 'ch1-complete', glyph: 'trophy', rarity: 'epic', name: 'Foundations Poured', desc: 'Complete every Foundations lesson', test: c => count(lessonsDone(c), LESSONS.length) },
  // ---- solo and timed lessons ----
  { id: 'solo-1', glyph: 'star', rarity: 'common', name: 'No Training Wheels', desc: 'Complete a lesson solo', test: c => count(soloCount(c), 1) },
  { id: 'solo-5', glyph: 'star', rarity: 'rare', name: 'Own Two Hands', desc: 'Five lessons solo', test: c => count(soloCount(c), 5) },
  { id: 'solo-20', glyph: 'star', rarity: 'epic', name: 'Self-Taught', desc: 'Twenty lessons solo', test: c => count(soloCount(c), 20) },
  { id: 'timed-1', glyph: 'clock', rarity: 'common', name: 'Against the Clock', desc: 'Finish a timed lesson run', test: c => count(A(c).filter(a => a.kind === 'lesson-timed').length, 1) },
  // ---- drills, PBs, tiers ----
  { id: 'drill-1', glyph: 'target', rarity: 'common', name: 'On the Range', desc: 'Attempt a drill', test: c => count(drillsTried(c), 1) },
  { id: 'drill-tour', glyph: 'target', rarity: 'rare', name: 'Tourist', desc: 'Attempt every drill', test: c => count(drillsTried(c), DRILLS.length) },
  { id: 'pb-1', glyph: 'medal', rarity: 'common', name: 'On the Board', desc: 'Set your first personal best', test: c => count(Object.keys(B(c)).length, 1) },
  { id: 'pb-all', glyph: 'medal', rarity: 'epic', name: 'Collector', desc: 'A personal best on every drill', test: c => count(Object.keys(B(c)).filter(r => DRILLS.some(d => d.id === r)).length, DRILLS.length) },
  { id: 'tier-pass', glyph: 'medal', rarity: 'common', name: 'Cleared', desc: 'Beat a pass clock clean', test: c => count(tierRuns(c, 'pass').length, 1) },
  { id: 'tier-pro', glyph: 'medal', rarity: 'rare', name: 'Professional', desc: 'Beat a pro clock clean', test: c => count(tierRuns(c, 'pro').length, 1) },
  { id: 'tier-legend', glyph: 'flame', rarity: 'epic', name: 'Legendary', desc: 'Beat a legendary clock clean', test: c => count(tierRuns(c, 'legendary').length, 1) },
  { id: 'legend-3', glyph: 'flame', rarity: 'epic', name: 'Heating Up', desc: 'Legendary on three different drills', test: c => count(tierDrills(c, 'legendary'), 3) },
  { id: 'legend-all', glyph: 'crown', rarity: 'legendary', name: 'Untouchable', desc: 'Legendary on every drill', test: c => count(tierDrills(c, 'legendary'), DRILLS.length) },
  // ---- the Daily and streaks ----
  { id: 'daily-1', glyph: 'calendar', rarity: 'common', name: 'Showed Up', desc: 'Finish a Daily', test: c => count(dailyDays(c), 1) },
  { id: 'daily-7', glyph: 'calendar', rarity: 'rare', name: 'Regular', desc: 'Seven Dailies on seven days', test: c => count(dailyDays(c), 7) },
  { id: 'daily-30', glyph: 'calendar', rarity: 'epic', name: 'Fixture', desc: 'Thirty Dailies on thirty days', test: c => count(dailyDays(c), 30) },
  { id: 'streak-7', glyph: 'flame', rarity: 'rare', name: 'Momentum', desc: 'Practise seven days in a row', test: c => count((c && c.streakDays) || 0, 7) },
  // ---- efficiency ----
  { id: 'no-waste', glyph: 'gem', rarity: 'rare', name: 'No Wasted Keys', desc: 'Finish a drill clean at the optimal keystroke count', test: c => count(atOptimal(c).length, 1) },
  { id: 'econ-10', glyph: 'gem', rarity: 'epic', name: 'Economist', desc: 'Ten clean runs at or under optimal keys', test: c => count(atOptimal(c).length, 10) },
  // ---- rapid-fire ----
  { id: 'rapid-1', glyph: 'bolt', rarity: 'common', name: 'Quick Draw', desc: 'Finish a rapid-fire round', test: c => count(A(c).filter(a => a.kind === 'rapid').length, 1) },
  { id: 'rapid-500', glyph: 'bolt', rarity: 'rare', name: 'Live Wire', desc: 'Score 500 in one rapid-fire round', test: c => n(rapidBest(c, 3) >= 500, rapidBest(c, 3), 500) },
  { id: 'combo-10', glyph: 'flame', rarity: 'rare', name: 'In the Zone', desc: 'A ten-hit rapid-fire combo', test: c => n(rapidBest(c, 2) >= 10, rapidBest(c, 2), 10) },
  // ---- volume and level ----
  { id: 'runs-100', glyph: 'stack', rarity: 'rare', name: 'Volume Business', desc: 'One hundred recorded runs', test: c => count(A(c).length, 100) },
  { id: 'level-5', glyph: 'star', rarity: 'common', name: 'Warming Up', desc: 'Reach level 5', test: c => count((c && c.level) || 1, 5) },
  { id: 'level-10', glyph: 'star', rarity: 'rare', name: 'Committed', desc: 'Reach level 10', test: c => count((c && c.level) || 1, 10) },
  // ---- the hidden five ----
  { id: 'blink', glyph: 'bolt', rarity: 'epic', hidden: true, name: 'Blink', desc: 'Finish any drill clean in under 5 seconds', test: c => count(drillAttempts(c).filter(a => a.clean && a.secs != null && a.secs < 5).length, 1) },
  { id: 'night-shift', glyph: 'moon', rarity: 'rare', hidden: true, name: 'Goblin Hours', desc: 'A clean run between midnight and 4am', test: c => count(A(c).filter(a => a.clean && hourOf(a.at) < 4).length, 1) },
  { id: 'early-bird', glyph: 'sun', rarity: 'rare', hidden: true, name: 'First One In', desc: 'A clean run between 5 and 7am', test: c => count(A(c).filter(a => a.clean && hourOf(a.at) >= 5 && hourOf(a.at) < 7).length, 1) },
  { id: 'weekend', glyph: 'calendar', rarity: 'common', hidden: true, name: 'Weekend Warrior', desc: 'A clean run on a Saturday or Sunday', test: c => count(A(c).filter(a => { if (!a.clean) return false; try { const d = new Date(a.at).getDay(); return d === 0 || d === 6; } catch (e) { return false; } }).length, 1) },
  { id: 'old-habits', glyph: 'mouse', rarity: 'common', hidden: true, name: 'Old Habits', desc: 'Ruin a timed run with the mouse', test: c => count(A(c).filter(a => a.mouse > 0).length, 1) },
];

export const ACHIEVEMENTS_BY_ID = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));

/** Consecutive UTC practice days ending today (or yesterday, keeping an unbroken run alive). Pure. */
export function practiceStreak(days, today) {
  const set = new Set(days || []);
  if (!set.size) return 0;
  const dayMs = 86400000;
  const t = Date.parse(today + 'T00:00:00Z');
  if (!Number.isFinite(t)) return 0;
  let start = t;
  if (!set.has(today)) { start = t - dayMs; if (!set.has(new Date(start).toISOString().slice(0, 10))) return 0; }
  let streak = 0;
  for (let d = start; ; d -= dayMs) {
    const key = new Date(d).toISOString().slice(0, 10);
    if (!set.has(key)) break;
    streak++;
  }
  return streak;
}
