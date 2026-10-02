// app2/tests/what-if.test.js — what-if grading and pickers (M84, M85; screenplay 6.0): a typed answer
// or a hand-picked sum that shows the right figure on the seed fails once an input moves; any route
// to a live answer passes; the inputs always go back; a drill with pickers is graded on the value picked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatIf, under, agree, validateWhatIf, valueAt } from '../app/what-if.js';
import { LessonRun } from '../app/runner.js';
import { DRILLS_BY_ID } from '../content/drills.js';
import { catalogEntry, hasPickers } from '../content/catalog.js';
import { validateDrill } from '../content/schema.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';

const sessionOf = cells => { const s = new Session(new Sheet({ rows: 20, cols: 8, cells })); s.recalcAll(); return s; };
const BASE = { A1: { value: 10 }, A2: { value: 20 }, A3: { value: 30 } };

test('under() types the inputs, runs, and puts every input back', () => {
  const s = sessionOf({ ...BASE, B1: { formula: '=SUM(A1:A3)' } });
  assert.equal(valueAt(s, 'B1'), 60);
  assert.equal(under(s, { A1: 100 }, x => valueAt(x, 'B1')), 150);
  assert.equal(valueAt(s, 'A1'), 10); assert.equal(valueAt(s, 'B1'), 60, 'recalculated back');
  assert.equal(under(s, { B1: 5 }, () => 1), undefined, 'a formula is not an input');
  assert.equal(valueAt(s, 'B1'), 60);
});

test('whatIf: a live answer passes, a typed one or a lucky reference fails, judged against the reference', () => {
  const ref = sessionOf({ ...BASE, B1: { formula: '=SUM(A1:A3)' } });
  const spec = { cases: [{ A1: 1 }, { A3: 0 }], answers: ['B1'] };
  assert.equal(whatIf(sessionOf({ ...BASE, B1: { formula: '=A1+A2+A3' } }), ref, spec).ok, true, 'any route to the same live answer');
  const typed = whatIf(sessionOf({ ...BASE, B1: { value: 60 } }), ref, spec);
  assert.equal(typed.ok, false); assert.equal(typed.ref, 'B1'); assert.equal(typed.want, 51);
  assert.equal(whatIf(sessionOf({ ...BASE, B1: { formula: '=A2*3' } }), ref, spec).ok, false, 'right on the seed, wrong reference');
  assert.equal(whatIf(sessionOf({ ...BASE, B1: { formula: '=A1+A2+A3' } }), null, spec).ok, true, 'no reference: the end state stands');
  assert.ok(agree(0.1 + 0.2, 0.3)); assert.ok(!agree(1, 1.1)); assert.ok(agree('Revenue', 'Revenue'));
});

test('validateWhatIf names the broken shapes', () => {
  assert.deepEqual(validateWhatIf(undefined), []);
  assert.deepEqual(validateWhatIf({ cases: [{ C5: 1 }, { 'Inputs!C4': 0.1 }], answers: ['C14'] }), []);
  assert.ok(validateWhatIf({ cases: [], answers: ['C14'] }).length);
  assert.ok(validateWhatIf({ cases: [{ nope: 1 }], answers: ['C14'] }).length);
  assert.ok(validateWhatIf({ cases: [{ C5: 1 }], answers: [] }).length);
});

test('the proof drill: pickers graded by the value picked, totals by a what-if against the reference route', () => {
  const d = DRILLS_BY_ID['ch5-is-it-revenue'];
  assert.ok(d, 'registered');
  assert.deepEqual(validateDrill(d), []);
  assert.ok(hasPickers(d) && catalogEntry(d).pickers);
  const sol = d.solution;
  const totals = sol.slice(sol.indexOf('Ctrl+G "C14"'));
  const picks = sol.slice(0, sol.indexOf('Ctrl+G "C14"'));
  const play = script => { const run = new LessonRun(d, { mode: 'timed' }); run.run(script); return run; };
  const ok = play(sol);
  assert.ok(ok.finished, 'the reference route finishes');
  assert.equal(ok.sheet.value('D5'), 'Revenue'); assert.equal(ok.sheet.value('D10'), 'Not income');
  // typing the classes is a legitimate route too
  assert.ok(play(`"Revenue" Enter "Revenue" Enter "Revenue" Enter "Other income" Enter "Other income" Enter "Not income" Enter "Not income" Enter "Not income" Enter ${totals}`).finished);
  // the totals right on the seed by hand-picked cells fail the what-if, and say why
  const hand = play(`${picks}Ctrl+G "C14" Enter "=C5+C6+C7" Enter "=C8+C9" Enter`);
  assert.equal(hand.finished, false);
  assert.equal(hand.doneCount, d.goals.length, 'every goal landed on the seed');
  assert.match(hand.current.text, /SUMIF/);
  assert.equal(hand.sheet.value('C5'), 182400, 'the inputs went back');
  // a wrong pick never lands its goal
  assert.equal(play('Alt+Down N Enter').doneCount, 0);
});
