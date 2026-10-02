// app2/content/achievements.js — the shelf (screenplay 6.7; M103): long-arc goals over lessons,
// drills, the Daily, rapid-fire and quests. Achievements pay no XP: the shelf is its own reward.
// Every test(ctx) is total: it returns { done, prog, goal } on any ctx, including {} (a fresh
// guest), and never throws. Earned ids are derived from the records on every read, so an id may
// be renamed only together with every reader; names and descriptions are site.csv rows
// (ach_<id>, ach_<id>_desc), with the line here as the fallback. `art` is the pixel sprite
// (ui/sprites.js, 6.7b); rarity is a colored word under it, never part of the art.
//
// ctx = { progress   lessons map (store.all())
//         chapters   the chapter gate records by chapter id ({ assessment, testout })
//         pbs        PBs by ref (store.pbRecords())
//         attempts   attempt list (store.attempts())
//         quests     { done, weeks } (app/quests.js questTotals)
//         keyRecords { [keyId]: { p?, u? } } (app/key-states.js: practiced and under par)
//         xp, level, signedIn, streakDays }
import { LESSONS, CHAPTERS, modulesOf } from './index.js';
import { DRILLS } from './drills.js';
import { REFERENCE } from './reference.js';
import { siteCopy } from './copy/apply.js';
import { stateOf } from '../app/key-states.js';

const P = c => (c && typeof c.progress === 'object' && c.progress) || {};
const A = c => (Array.isArray(c && c.attempts) ? c.attempts : []);
const B = c => (c && typeof c.pbs === 'object' && c.pbs) || {};
const n = (done, prog, goal) => ({ done: !!done, prog: Math.min(prog || 0, goal), goal });
const count = (done, goal) => n(done >= goal, done, goal);
const completed = (c, id) => { const p = P(c)[id]; return !!(p && p.completed); };

/** Lessons proper: what a chapter's "every lesson" means (no challenge, project or gate). */
const isLesson = l => l.kind === undefined || l.kind === 'lesson';
const lessonsDone = c => LESSONS.filter(l => isLesson(l) && completed(c, l.id)).length;
const CH = CHAPTERS.map(ch => ({ id: ch.id, lessons: ch.lessons.filter(l => l.kind !== 'testout' && l.kind !== 'assessment'), modules: modulesOf(ch).filter(m => m.lessons.length) }));
const chapterDone = (c, i) => { const ls = CH[i] ? CH[i].lessons : []; const d = ls.filter(l => completed(c, l.id)).length; return n(ls.length > 0 && d >= ls.length, d, ls.length || 1); };
const verified = (c, i) => { const ch = CHAPTERS[i]; const g = ch && c && c.chapters && c.chapters[ch.id]; return !!(g && g.assessment); };
const moduleDone = (c, id) => {
  for (const ch of CH) {
    const m = ch.modules.find(x => x.id === id);
    if (!m) continue;
    const ls = m.lessons.filter(isLesson);
    const d = ls.filter(l => completed(c, l.id)).length;
    return n(ls.length > 0 && d >= ls.length, d, ls.length || 1);
  }
  return n(false, 0, 1);
};

const PLAIN_DRILLS = DRILLS.filter(d => d.kind !== 'challenge');
const DRILLS_BY_CHAPTER = CHAPTERS.map(ch => PLAIN_DRILLS.filter(d => d.chapter === ch.id).map(d => d.id)).filter(l => l.length);
const drillRuns = c => A(c).filter(a => a.kind === 'drill' || a.kind === 'daily');
const TIER = { pass: 1, pro: 2, legendary: 3 };
const tierRuns = (c, tier) => drillRuns(c).filter(a => a.clean && TIER[a.tier] >= TIER[tier]);
const tierDrills = (c, tier) => new Set(tierRuns(c, tier).map(a => a.ref));
/** The chapter nearest a full set: { got, of } over the chapters' drill lists. */
const bestChapter = (ids, have) => DRILLS_BY_CHAPTER.reduce((best, list) => { const got = list.filter(id => have.has(id)).length; return !best || list.length - got < best.of - best.got ? { got, of: list.length } : best; }, null) || { got: 0, of: 1 };
const chapterSet = (c, have) => { const b = bestChapter(DRILLS_BY_CHAPTER, have); return n(b.got >= b.of, b.got, b.of); };
const dailyDays = c => new Set(A(c).filter(a => a.kind === 'daily' && a.day).map(a => a.day)).size;
const drillOf = ref => DRILLS.find(x => x.id === ref) || null;
const optimalOf = ref => { const d = drillOf(ref); return d ? d.optimalKeys : null; };
const atOptimal = c => drillRuns(c).filter(a => { const o = optimalOf(a.ref); return a.clean && o != null && a.keys > 0 && a.keys <= o; });
const hourOf = at => { try { return new Date(at).getHours(); } catch (e) { return 12; } };
const rapids = c => A(c).filter(a => a.kind === 'rapid');
const rapidBest = (c, i) => Math.max(0, ...rapids(c).map(a => (a.splits && a.splits[i]) || 0));
/** Clean lessons: a lesson finished at least once with no mouse and no help (progress.js latches it). */
const cleanLessons = c => LESSONS.filter(l => { const p = P(c)[l.id]; return p && p.completed && p.clean; }).length;
const cleanModule = c => {
  let best = { got: 0, of: 1 };
  for (const ch of CH) for (const m of ch.modules) {
    const ids = m.lessons.filter(isLesson).map(l => l.id);
    if (m.challenge) ids.push(m.challenge.id);
    if (!ids.length) continue;
    const got = ids.filter(id => { const p = P(c)[id]; return (p && p.completed && p.clean) || A(c).some(a => a.ref === id && a.kind === 'challenge' && a.clean); }).length;
    if (ids.length - got < best.of - best.got) best = { got, of: ids.length };
  }
  return n(best.got >= best.of, best.got, best.of);
};
/** Every key a chapter's lessons teach (the keys sheet's rows whose lesson sits in the chapter), each past Not yet on the Reference page (M57). */
const KEYS_BY_CHAPTER = CHAPTERS.map(ch => { const ids = new Set(ch.lessons.map(l => l.id)); return REFERENCE.filter(e => !e.addin && e.lessonId && ids.has(e.lessonId)); });
const keysCollected = (c, i) => {
  const rows = KEYS_BY_CHAPTER[i] || [];
  const done = new Set(Object.keys(P(c)).filter(id => completed(c, id)));
  const ctx = { done, records: (c && typeof c.keyRecords === 'object' && c.keyRecords) || {} };
  const d = rows.filter(r => stateOf(r, ctx) !== 'not-yet').length;
  return n(rows.length > 0 && d >= rows.length, d, rows.length || 1);
};
const Q = c => (c && c.quests) || {};

export const RARITIES = ['common', 'rare', 'epic', 'legendary'];

const CHAPTER_ART = ['slab', 'book', 'ties-out', 'folder-key', 'three-pages', 'envelope'];
const CHAPTER_NAMES = ['Foundations Poured', 'Book Ready', 'Ties Out', 'Data Room', 'Three Statements', 'The Bid'];
const CHAPTER_TITLES = ['Foundations', 'Formatting', 'Formulas', 'Data and Lookups', 'Finance and Accounting', 'Valuation'];
const MOD_BADGES = [
  ['mod-setup', 'open-and-set-up', 'door', 'Through the Door', 'Finish Open and set up'],
  ['mod-move', 'move-and-select', 'compass', 'Navigator', 'Finish Move and select'],
  ['mod-edit', 'enter-edit-copy-fill', 'pencil-cell', 'Editor', 'Finish Enter, edit, copy and fill'],
  ['mod-structure', 'structure', 'i-beam', 'Structural', 'Finish Structure'],
  ['mod-format', 'format', 'ruled-page', 'By the Book', 'Finish Format'],
  ['mod-formulas', 'formulas', 'equals-tile', 'Calculator', 'Finish Formulas'],
  ['mod-present', 'present-and-audit', 'signed-page', 'Signed Off', 'Finish Present and audit'],
];

const DEFS = [
  // ---- the starters (Wolf, 2026-10-02): opening a lesson, making an account, the first lesson, and a joke one ----
  { id: 'first-open', art: 'time-card', rarity: 'common', name: 'Clocked In', desc: 'Open your first lesson', test: c => count(Object.values(P(c)).some(p => p && (p.started || p.completed)) ? 1 : 0, 1) },
  { id: 'account', art: 'name-tag', rarity: 'common', name: 'On the Roster', desc: 'Make a free account', test: c => count(c && c.signedIn ? 1 : 0, 1) },
  { id: 'first-lesson', art: 'keycap', rarity: 'common', name: 'First Steps', desc: 'Complete your first lesson', test: c => count(lessonsDone(c), 1) },
  { id: 'scenic-route', art: 'snail', rarity: 'common', name: 'Scenic Route', desc: 'Finish a drill with twice the keys its route needs', test: c => count(drillRuns(c).filter(a => { const o = optimalOf(a.ref); return o != null && a.keys >= 2 * o; }).length, 1) },
  // ---- the campaign: Chapter 1's modules, its project, the gates, and every chapter ----
  ...MOD_BADGES.map(([id, module, art, name, desc]) => ({ id, module, art, rarity: 'common', name, desc, test: c => moduleDone(c, module) })),
  { id: 'ch1-project', art: 'report', rarity: 'rare', name: 'Report Builder', desc: 'Complete the Chapter 1 project', test: c => count(completed(c, 'weekly-kpi-project') ? 1 : 0, 1) },
  ...CHAPTERS.slice(0, 6).map((ch, i) => ({ id: `ch${i + 1}-verified`, chapter: ch.id, art: `verified-${i + 1}`, rarity: 'rare', name: `Verified: ${CHAPTER_TITLES[i]}`, desc: `Pass the Chapter ${i + 1} assessment`, test: c => count(verified(c, i) ? 1 : 0, 1) })),
  { id: 'ch1-testout', art: 'missing-step', rarity: 'rare', hidden: true, name: 'Tested Out', desc: 'Pass the Chapter 1 assessment without finishing the lessons', test: c => count(c && c.chapters && c.chapters.foundations && c.chapters.foundations.testout ? 1 : 0, 1) },
  ...CHAPTERS.slice(0, 6).map((ch, i) => ({ id: `ch${i + 1}-complete`, chapter: ch.id, art: CHAPTER_ART[i], rarity: 'epic', name: CHAPTER_NAMES[i], desc: i === 0 ? 'Complete every Chapter 1 lesson' : `Complete Chapter ${i + 1}`, test: c => chapterDone(c, i) })),
  { id: 'program', art: 'seal', rarity: 'legendary', name: 'Certified', desc: 'All six chapters Verified', test: c => count(CHAPTERS.slice(0, 6).filter((_, i) => verified(c, i)).length, 6) },
  // ---- clean work ----
  { id: 'clean-1', art: 'clean-cell', rarity: 'common', name: 'Clean Sheet', desc: 'Finish a lesson with no mouse and no help', test: c => count(cleanLessons(c), 1) },
  { id: 'clean-10', art: 'no-mouse', rarity: 'rare', name: 'Hands Off', desc: 'Ten clean lessons', test: c => count(cleanLessons(c), 10) },
  { id: 'clean-module', art: 'glove', rarity: 'epic', name: 'Untouched', desc: 'A whole module clean, challenge included', test: cleanModule },
  { id: 'timed-1', art: 'stopwatch', rarity: 'common', name: 'Against the Clock', desc: 'Finish a timed run', test: c => count(A(c).filter(a => a.kind === 'lesson-timed' || a.kind === 'challenge').length, 1) },
  // ---- drills, PBs, tiers ----
  { id: 'drill-1', art: 'target', rarity: 'common', name: 'On the Range', desc: 'Attempt a drill', test: c => count(new Set(drillRuns(c).map(a => a.ref)).size, 1) },
  { id: 'drill-tour', art: 'suitcase', rarity: 'rare', name: 'Tourist', desc: 'Attempt every drill in a chapter', test: c => chapterSet(c, new Set(drillRuns(c).map(a => a.ref))) },
  { id: 'pb-1', art: 'board', rarity: 'common', name: 'On the Board', desc: 'Set your first personal best', test: c => count(Object.keys(B(c)).length, 1) },
  { id: 'pb-all', art: 'medals', rarity: 'epic', name: 'Collector', desc: 'A personal best on every drill in a chapter', test: c => chapterSet(c, new Set(Object.keys(B(c)))) },
  ...CHAPTERS.slice(0, 6).map((ch, i) => ({ id: `keys-ch${i + 1}`, chapter: ch.id, art: `keyring-${i + 1}`, rarity: 'rare', name: 'Keyring', desc: `Every key in Chapter ${i + 1} collected on the Reference page`, test: c => keysCollected(c, i) })),
  { id: 'tier-pass', art: 'green-light', rarity: 'common', name: 'Cleared', desc: 'Beat a Pass clock clean', test: c => count(tierRuns(c, 'pass').length, 1) },
  { id: 'tier-pro', art: 'gem-blue', rarity: 'rare', name: 'Expert', desc: 'Beat an Expert clock clean', test: c => count(tierRuns(c, 'pro').length, 1) },
  { id: 'tier-legend', art: 'gem-gold', rarity: 'epic', name: 'Legendary', desc: 'Beat a Legendary clock clean', test: c => count(tierRuns(c, 'legendary').length, 1) },
  { id: 'legend-3', art: 'flame', rarity: 'epic', name: 'Heating Up', desc: 'Legendary on three different drills', test: c => count(tierDrills(c, 'legendary').size, 3) },
  { id: 'legend-all', art: 'crown', rarity: 'legendary', name: 'Untouchable', desc: 'Legendary on every drill in a chapter', test: c => chapterSet(c, tierDrills(c, 'legendary')) },
  // ---- the Daily and streaks ----
  { id: 'daily-1', art: 'calendar-day', rarity: 'common', name: 'Showed Up', desc: 'Finish a Daily', test: c => count(dailyDays(c), 1) },
  { id: 'daily-7', art: 'calendar-week', rarity: 'rare', name: 'Regular', desc: 'Seven Dailies on seven days', test: c => count(dailyDays(c), 7) },
  { id: 'daily-30', art: 'calendar-month', rarity: 'epic', name: 'Fixture', desc: 'Thirty Dailies on thirty days', test: c => count(dailyDays(c), 30) },
  { id: 'streak-7', art: 'runner', rarity: 'rare', name: 'Momentum', desc: 'Practice seven days in a row', test: c => count((c && c.streakDays) || 0, 7) },
  // ---- efficiency ----
  { id: 'no-waste', art: 'key-star', rarity: 'rare', name: 'No Wasted Keys', desc: 'Finish a drill clean at the optimal keystroke count', test: c => count(atOptimal(c).length, 1) },
  { id: 'econ-10', art: 'abacus', rarity: 'epic', name: 'Economist', desc: 'Ten clean runs at or under optimal keys', test: c => count(atOptimal(c).length, 10) },
  // ---- rapid-fire ----
  { id: 'rapid-1', art: 'bolt', rarity: 'common', name: 'Quick Draw', desc: 'Finish a rapid-fire round', test: c => count(rapids(c).length, 1) },
  { id: 'rapid-500', art: 'bolt-burst', rarity: 'rare', name: 'Live Wire', desc: 'Reach Combo 20 in one rapid-fire round', test: c => n(rapidBest(c, 2) >= 20, rapidBest(c, 2), 20) },
  { id: 'combo-10', art: 'chain', rarity: 'rare', name: 'In the Zone', desc: 'A ten-hit rapid-fire combo', test: c => n(rapidBest(c, 2) >= 10, rapidBest(c, 2), 10) },
  { id: 'rapid-perfect', art: 'bolt-ring', rarity: 'epic', name: 'Perfect Round', desc: 'A full rapid-fire round with no misses', test: c => count(rapids(c).filter(a => a.splits && a.splits[0] >= 20 && a.splits[1] === 0).length, 1) },
  // ---- quests ----
  { id: 'quest-1', art: 'scroll', rarity: 'common', name: 'First Quest', desc: 'Complete a quest', test: c => count(Q(c).done || 0, 1) },
  { id: 'quest-25', art: 'scrolls', rarity: 'rare', name: 'Questing', desc: 'Twenty-five quests', test: c => count(Q(c).done || 0, 25) },
  { id: 'quest-week', art: 'broom', rarity: 'epic', name: 'Clean Sweep', desc: 'Every quest in one week', test: c => count(Q(c).weeks || 0, 1) },
  // ---- volume and level ----
  { id: 'runs-100', art: 'ledger', rarity: 'rare', name: 'Volume Business', desc: 'One hundred recorded runs', test: c => count(A(c).length, 100) },
  { id: 'level-5', art: 'candle', rarity: 'common', name: 'Warming Up', desc: 'Reach level 5', test: c => count((c && c.level) || 1, 5) },
  { id: 'level-10', art: 'campfire', rarity: 'rare', name: 'Committed', desc: 'Reach level 10', test: c => count((c && c.level) || 1, 10) },
  { id: 'level-20', art: 'pepper-mill', rarity: 'epic', name: 'Seasoned', desc: 'Reach level 20', test: c => count((c && c.level) || 1, 20) },
  { id: 'level-30', art: 'bucket', rarity: 'legendary', name: 'Top Bucket', desc: 'Reach level 30', test: c => count((c && c.level) || 1, 30) },
  // ---- the hidden jokes ----
  { id: 'blink', art: 'eye', rarity: 'epic', hidden: true, name: 'Blink', desc: 'Finish a drill clean ten seconds or more under its Legendary par', test: c => count(drillRuns(c).filter(a => { const d = drillOf(a.ref); return a.clean && a.secs != null && d && d.pars && d.pars.legendary != null && a.secs <= d.pars.legendary - 10; }).length, 1) },
  { id: 'night-shift', art: 'moon-monitor', rarity: 'rare', hidden: true, name: 'Goblin Hours', desc: 'A clean run between midnight and 4am', test: c => count(A(c).filter(a => a.clean && hourOf(a.at) < 4).length, 1) },
  { id: 'early-bird', art: 'sunrise', rarity: 'rare', hidden: true, name: 'First One In', desc: 'A clean run between 5 and 7am', test: c => count(A(c).filter(a => a.clean && hourOf(a.at) >= 5 && hourOf(a.at) < 7).length, 1) },
  { id: 'weekend', art: 'hammock', rarity: 'common', hidden: true, name: 'Weekend Warrior', desc: 'A clean run on a Saturday or Sunday', test: c => count(A(c).filter(a => { if (!a.clean) return false; try { const d = new Date(a.at).getDay(); return d === 0 || d === 6; } catch (e) { return false; } }).length, 1) },
  { id: 'old-habits', art: 'cracked-mouse', rarity: 'common', hidden: true, name: 'Old Habits', desc: 'Ruin a timed run with the mouse', test: c => count(A(c).filter(a => a.mouse > 0).length, 1) },
];

/** The words come from the sheet (site.csv ach_<id>, ach_<id>_desc); the lines above are fallbacks. */
export const ACHIEVEMENTS = DEFS.map(d => {
  const { name, desc, ...rest } = d;
  return Object.defineProperties(rest, {
    fallbackName: { value: name }, fallbackDesc: { value: desc },
    name: { enumerable: true, get() { return siteCopy('ach_' + d.id, name); } },
    desc: { enumerable: true, get() { return siteCopy('ach_' + d.id + '_desc', desc); } },
  });
});

export const ACHIEVEMENTS_BY_ID = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
/** The badge a module pays for finishing it (Learn shows it as the module's reward). */
export const moduleBadge = moduleId => ACHIEVEMENTS.find(a => a.module === moduleId) || null;

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
