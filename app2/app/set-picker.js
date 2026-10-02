// app2/app/set-picker.js — the drill set for "Start drilling" (screenplay 3.0, Practice; M97).
// A pure function over the catalog (content/catalog.js) and what the learner has done: the set
// mixes what's due, the slowest drills against their pars, the newest unlocked drill and drills
// under their next tier, for a chosen length (5, 10 or 20 minutes), and never includes a Pro
// drill on a free account. Deterministic: the same inputs give the same set.
//
//   pickSet({ catalog, minutes, pro, due, unlocked, bests }) →
//     { ids, secs, reasons: { id: 'due' | 'slowest' | 'newest' | 'next-tier' | 'fill' } }
//
//   catalog   catalog entries (CATALOG, or a subset)
//   minutes   5 | 10 | 20 (SET_LENGTHS)
//   pro       true when the account holds Full Access, or a function chapterId → open (M58);
//             a paid drill in a chapter the account can't open is never picked
//   due       drill ids whose keys are due a refresher (the schedule), in due order
//   unlocked  drill ids whose teaching lesson is done, in catalog order; a drill off the list is locked
//   bests     { [id]: { secs, tier } } the learner's best clean runs

export const SET_LENGTHS = [5, 10, 20];
const TIER_UP = { none: 'pass', pass: 'pro', pro: 'legendary' };

export function pickSet({ catalog = [], minutes = 10, pro = false, due = [], unlocked = [], bests = {} } = {}) {
  const budget = (SET_LENGTHS.includes(minutes) ? minutes : 10) * 60;
  const open = new Set(unlocked);
  const opens = typeof pro === 'function' ? pro : () => !!pro;   // M58: true/false for every chapter, or a chapter test
  const playable = catalog.filter(e => e.mode === 'drill' && (e.access === 'free' || opens(e.chapter)) && open.has(e.id) && !e.tags.includes('long'));
  const byId = Object.fromEntries(playable.map(e => [e.id, e]));
  const best = id => bests && bests[id] && Number.isFinite(bests[id].secs) ? bests[id] : null;

  // the four sources, each in its own order
  const dueList = due.filter(id => byId[id]);
  const slowest = playable.filter(e => best(e.id)).map(e => ({ id: e.id, r: best(e.id).secs / e.pars.pass })).sort((a, b) => b.r - a.r).map(x => x.id);
  const newest = playable.filter(e => !best(e.id)).map(e => e.id).reverse();   // the latest unlocked, unplayed drill first
  const nextTier = playable.filter(e => best(e.id) && TIER_UP[best(e.id).tier || 'none']).map(e => {
    const b = best(e.id); const target = e.pars[TIER_UP[b.tier || 'none']];
    return { id: e.id, gap: (b.secs - target) / target };
  }).filter(x => x.gap > 0).sort((a, b) => a.gap - b.gap).map(x => x.id);

  const ids = [], reasons = {};
  let secs = 0;
  const take = (id, why) => {
    const e = byId[id]; if (!e || reasons[id]) return false;
    if (ids.length && secs + e.lengthSecs > budget) return false;
    ids.push(id); reasons[id] = why; secs += e.lengthSecs; return true;
  };
  // round-robin over the sources until nothing fits: due, slowest, newest, next tier
  const sources = [[dueList, 'due'], [slowest, 'slowest'], [newest, 'newest'], [nextTier, 'next-tier']];
  const cursors = sources.map(() => 0);
  let progress = true;
  while (progress && secs < budget) {
    progress = false;
    sources.forEach(([list, why], i) => {
      while (cursors[i] < list.length) {
        const id = list[cursors[i]++];
        if (reasons[id]) continue;
        if (take(id, why)) { progress = true; break; }
        if (secs + byId[id].lengthSecs > budget) break;
      }
    });
  }
  // short of the budget with sources spent: fill from the catalog in order
  for (const e of playable) { if (secs >= budget) break; take(e.id, 'fill'); }
  return { ids, secs, reasons };
}
