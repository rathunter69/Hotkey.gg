// app2/app/quest-loop.js — the quest loop bound to the stores (screenplay 6.6, 6.10; M59). The
// rules are app/quests.js (pure); this file builds the learner's ctx from the records, folds a
// finished run into the practice log, ticks what it finished and saves the ledger. The drill page
// and the lesson workspace call recordRun() after they record the run and before they read the XP,
// so the quest XP lands in the same result; Home calls questBoard(), which also pays any quest a
// rapid-fire round finished (rounds are read from their attempt records).
import { store } from './store.js';
import { entitlement } from './entitlement.js';
import { LESSONS, CHAPTERS, modulesOf } from '../content/index.js';
import { DRILLS } from '../content/drills.js';
import { QUESTS_BY_ID } from '../content/quests.js';
import { FLAIR_BY_ID } from '../content/flair.js';
import { siteCopy } from '../content/copy/apply.js';
import { loadLedger, saveLedger, settle, board, logEntry, againCandidates, questEvents } from './quests.js';
import { awardSync } from './award-sync.js';
import { rollReward } from './cosmetics.js';
import { levelOf, totalXP, eventsFrom } from './xp.js';

/** The learner's quest ctx from the stores. */
export function questCtx() {
  let pro = false; try { pro = entitlement.entitled(); } catch (e) { /* a guest */ }
  const all = store.all();
  const completed = new Set(Object.keys(all).filter(id => all[id] && all[id].completed));
  const open = l => pro || l.access !== 'paid';
  const lessonsLeft = LESSONS.some(l => open(l) && l.kind !== 'testout' && !completed.has(l.id));
  const challenges = [];
  for (const ch of CHAPTERS) for (const m of modulesOf(ch)) if (m.challenge && open(m.challenge)) challenges.push({ ref: m.challenge.id, module: m.title });
  const drillsByChapter = {};
  for (const d of DRILLS) if (d.kind !== 'challenge' && open(d)) (drillsByChapter[d.chapter] = drillsByChapter[d.chapter] || []).push(d.id);
  return { completed, lessonsLeft, pro, again: againCandidates(challenges, store.attempts()), drillsByChapter };
}

/** The weekly clear's roll, over the learner's level and what earlier weeks rolled. */
function roller(attempts) {
  return L => {
    const xp = totalXP(eventsFrom(store.all(), attempts, questEvents(L)));
    const key = Object.keys(L.bonus).filter(k => k[0] === 'w').sort().pop() || 'w';
    return rollReward({ level: levelOf(xp).lvl, rolled: Object.values(L.rolls) }, key);
  };
}

/** A quest's line, with its module named where it names one. */
export function questTitle(row) {
  const q = QUESTS_BY_ID[row.id];
  return siteCopy('quest_' + row.id, q ? q.fallback : row.id).replace(/\{module\}/g, row.module || '');
}

/**
 * Fold a finished run into the log and tick what it finished.
 * run = { kind: 'lesson'|'drill'|'daily'|'challenge', ref, clean, tier, pb, ghost, noWaste, noMouse, used }
 * Returns the rows for the result panel: { quests: [{ title, have, target, done, xp }], bonus: [{ period, xp, reward }] }.
 */
export function recordRun(run) {
  try {
    const L = loadLedger();
    const attempts = store.attempts();
    const ctx = questCtx();
    const before = board(L, attempts, ctx);
    const had = {}; for (const p of ['daily', 'weekly']) for (const row of before[p].rows) had[p + row.id] = row.done ? Infinity : row.have;
    L.log.push(logEntry(run));
    const r = settle(L, attempts, ctx, Date.now(), roller(attempts));
    saveLedger(L);
    try { awardSync.quests(r); } catch (e) { /* the device keeps what it paid */ }
    // the rows this run moved: a step forward, or the tick
    const tickedNow = new Set(r.ticked.map(row => row.id));
    const moved = ['daily', 'weekly'].flatMap(p => r.board[p].rows.filter(row => tickedNow.has(row.id) || (had[p + row.id] !== Infinity && row.have > (had[p + row.id] || 0))));
    return {
      quests: moved.map(row => ({ title: questTitle(row), have: row.have, target: row.target, done: row.done, xp: row.xp })),
      bonus: r.bonus.map(b => ({ period: b.period, xp: b.xp, reward: b.roll && FLAIR_BY_ID[b.roll] ? siteCopy('flair_' + b.roll, FLAIR_BY_ID[b.roll].fallback) : '' })),
    };
  } catch (e) { return { quests: [], bonus: [] }; }
}
/** The board for Home: { started, daily, weekly }, each row titled. Pays anything a rapid-fire round finished. */
export function questBoard() {
  const L = loadLedger();
  const attempts = store.attempts();
  const r = settle(L, attempts, questCtx(), Date.now(), roller(attempts));
  saveLedger(L);
  try { awardSync.quests(r); } catch (e) { /* the device keeps what it paid */ }
  const b = r.board;
  for (const p of ['daily', 'weekly']) if (b[p]) for (const row of b[p].rows) row.title = questTitle(row);
  b.paid = r.ticked.length + r.bonus.length;
  if (b.weekly && b.weekly.roll && FLAIR_BY_ID[b.weekly.roll]) b.weekly.rollLabel = siteCopy('flair_' + b.weekly.roll, FLAIR_BY_ID[b.weekly.roll].fallback);
  return b;
}
