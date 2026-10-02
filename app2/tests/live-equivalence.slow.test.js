// The liveness rule probes in place (nudge an input on the real workbook, recalculate only its
// dependents through the calculation graph, put it back). Before that it cloned the workbook and
// recalculated the clone whole for every question. This test replays every lesson's and every
// drill's reference solution and, at every liveness question the graders and goal checks ask,
// answers it both ways: the verdicts must agree, and the in-place probe must leave the workbook
// exactly as it found it (every cell record on every sheet, and the graph's view of it, which a
// later recalc diffs against). A question asked again on an unchanged workbook is checked once.
// Then, on each finished workbook, every formula cell of every sheet is asked both ways.
// Slow by design (the clone reference is what made the gate slow): run-checks.js --full runs it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '../content/index.js';
import { DRILLS } from '../content/drills.js';
import { LessonRun } from '../app/runner.js';
/** Content whose solution no longer replays: none since R1 retired known-drift.js. */
const DRIFT_LESSONS = new Map(), DRIFT_DRILLS = new Map();
import { liveHooks, isLiveFormula, isLiveFormulaByClone, liveFormulas, liveFormulasByClone } from '../engine/live.js';

/** A value as JSON with every object's keys sorted: field order and key order are not state. */
const canon = v => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map(n => [n, x[n]])) : x));
/**
 * Every sheet's cells, and the graph's view of the workbook (what it last saw of each cell, what
 * each formula reads, the circles): all of it is what a probe must put back, since the next
 * recalc diffs against the snapshot and follows the edges.
 */
function fingerprint(sheet) {
  const list = typeof sheet.allSheets === 'function' ? sheet.allSheets() : [{ name: '', sheet }];
  const book = sheet.book;
  const sheets = list.map(e => e.name + '\u0001' + canon(e.sheet.cells) + '\u0001' + JSON.stringify(e.sheet.circular || []));
  if (!book) return sheets.join('\u0002');
  const seen = [...book.seen].map(([cid, m]) => cid + ':' + canon(Object.fromEntries(m)));
  const deps = [...book.deps].map(([fk, set]) => fk + ':' + [...set].sort().join(',')).sort();
  return [...sheets, ...seen.sort(), deps.join(';'), [...book.cyclic].sort().join(',')].join('\u0002');
}

function checkAll(items, skip, mode, wholeSheets) {
  const stats = { asked: 0, checked: 0, live: 0, dead: 0, endCells: 0, endLive: 0, endDead: 0 };
  const mismatches = [];
  let inside = false; let current = '';
  const done = new Set();
  const hook = liveHooks.onVerdict = (sheet, key, opts, verdict) => {
    stats.asked++;
    if (inside) return;
    const before = fingerprint(sheet);
    const sig = key + '|' + JSON.stringify(opts.inputs || null) + '|' + before;
    if (done.has(sig)) return;
    done.add(sig);
    inside = true;
    try {
      stats.checked++; if (verdict) stats.live++; else stats.dead++;
      const ref = isLiveFormulaByClone(sheet, key, opts);
      const again = isLiveFormula(sheet, key, opts);
      const after = fingerprint(sheet);
      if (ref !== verdict || again !== verdict) mismatches.push(`${current} ${key}${opts.inputs ? ' inputs ' + opts.inputs.join(',') : ''}: in place ${verdict}/${again}, clone ${ref}`);
      if (after !== before) mismatches.push(`${current} ${key}: the in-place probe changed the workbook`);
    } finally { inside = false; }
  };
  try {
    for (const item of items) {
      if (skip.has(item.id)) continue;
      current = item.id;
      let t = 0;
      const run = new LessonRun(item, { mode, now: () => (t += 100), seedNo: 1 });
      run.run(item.solution);
      // the finished workbook, every formula cell on every sheet: the dead ones too (a label row's
      // =4470, a check that reads nothing), which the goals rarely ask about
      if (!wholeSheets) continue;
      liveHooks.onVerdict = null;
      for (const e of run.session.sheets) {
        const before = fingerprint(e.sheet);
        const mine = liveFormulas(e.sheet).sort(), ref = liveFormulasByClone(e.sheet).sort();
        const formulas = Object.keys(e.sheet.cells).filter(k => e.sheet.cells[k] && e.sheet.cells[k].formula).length;
        stats.endCells += formulas; stats.endLive += mine.length; stats.endDead += formulas - mine.length;
        if (mine.join() !== ref.join()) mismatches.push(`${current} ${e.name}: live in place only [${mine.filter(k => !ref.includes(k))}], by clone only [${ref.filter(k => !mine.includes(k))}]`);
        if (fingerprint(e.sheet) !== before) mismatches.push(`${current} ${e.name}: liveFormulas changed the workbook`);
      }
      liveHooks.onVerdict = hook;
    }
  } finally { liveHooks.onVerdict = null; }
  return { stats, mismatches };
}

test('every lesson: the in-place liveness verdicts match the clone reference and leave the workbook untouched', t => {
  const { stats, mismatches } = checkAll(LESSONS, DRIFT_LESSONS, 'guided', true);
  t.diagnostic('lessons: ' + JSON.stringify(stats));
  assert.deepEqual(mismatches, []);
  assert.ok(stats.checked > 0 && stats.live > 0, 'the lessons ask liveness questions: ' + JSON.stringify(stats));
});

test('every drill: the in-place liveness verdicts match the clone reference and leave the workbook untouched', t => {
  const { stats, mismatches } = checkAll(DRILLS.filter(d => d.kind !== 'challenge'), DRIFT_DRILLS, 'timed', true);
  t.diagnostic('drills: ' + JSON.stringify(stats));
  assert.deepEqual(mismatches, []);
});
