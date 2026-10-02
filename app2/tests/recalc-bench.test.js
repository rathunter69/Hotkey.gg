// The calculation graph (engine/calc.js) on the Chapter 5 model: an edit recalculates only what
// reads it, across every sheet, and leaves nothing stale; a plain cell's edit evaluates no formula;
// the cost stays within a generous bound. Also the graph's rules on a small workbook: cross-sheet
// readers, a circle through a bridge cell, settings changes, undo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { evalFormula } from '../engine/formula.js';
import { parseRef } from '../engine/refs.js';
import * as WB from '../content/workbooks/clearcoat-model.js';

const build = sp => new Sheet({ rows: sp.rows, cells: JSON.parse(JSON.stringify(sp.cells)), colW: sp.colW, freeze: sp.freeze, gridlines: sp.gridlines, condFmt: sp.condFmt });
function model(id) {
  const st = WB.stateOf(id);
  const s = new Session(build(st.sheets[0]));
  s.renameSheet(0, st.sheets[0].name);
  for (const sh of st.sheets.slice(1)) s.addSheet(sh.name, build(sh), undefined, { recalc: false });
  Object.assign(s.settings, { iterative: !!st.settings.iterative, maxIterations: st.settings.maxIterations || 100, maxChange: st.settings.maxChange == null ? 0.001 : st.settings.maxChange });
  if (st.names && Object.keys(st.names).length) s.names = st.names; else s.recalcAll();
  return s;
}
/** Every formula whose stored value disagrees with a fresh evaluation of its inputs (beyond Maximum Change). */
function staleCells(s, tol = 0.002) {
  const out = [];
  for (const e of s.sheets) for (const k in e.sheet.cells) { const c = e.sheet.cells[k]; if (!c.formula) continue; let v; try { v = evalFormula(c.formula, e.sheet.evalCtx({ cell: parseRef(k) })); } catch (x) { v = '#NAME?'; }
    if (!(v === c.value || (typeof v === 'number' && typeof c.value === 'number' && Math.abs(v - c.value) <= tol))) out.push(e.name + '!' + k); }
  return out;
}
const sh = (s, name) => s.sheets.find(e => e.name === name).sheet;

test('the Chapter 5 model: an edit on Inputs recalculates its readers only, leaves nothing stale, and stays fast; a plain cell costs no evaluation', () => {
  const s = model('DONE'); const book = s.book;
  let formulas = 0; for (const e of s.sheets) for (const k in e.sheet.cells) if (e.sheet.cells[k].formula) formulas++;
  assert.ok(formulas > 1500, 'the model has ' + formulas + ' formulas');
  assert.deepEqual(staleCells(s), [], 'the build settles everything (the circle under iterative calculation included)');
  const inputs = sh(s, 'Inputs'); const r = WB.ROW.Inputs;
  const key = ['F' + r.bTick, 'F' + r.bWash, 'C' + r.labor, 'C' + r.infl].find(k => typeof inputs.value(k) === 'number' && !inputs.formula(k));   // a Base-case driver the statements read
  assert.ok(key, 'an input to edit');
  const p = parseRef(key); const was = inputs.value(key);
  const bsBefore = sh(s, 'BS').value('J25');
  const t0 = process.cpuUsage(); const N = 5;   // CPU time, not wall: the gate runs its files side by side, often on a busy box
  for (let i = 0; i < N; i++) inputs.commitInput(String((typeof was === 'number' ? was : 0.03) + 0.01 * (i + 1)), p.r, p.c);
  const used = process.cpuUsage(t0); const per = (used.user + used.system) / 1000 / N;
  assert.ok(book.dirtyCount < formulas * 0.8, `an Inputs edit reaches ${book.dirtyCount} formulas, not the ${formulas} of the model`);
  assert.ok(book.evals < formulas * 8, `the circle's iterations stay bounded: ${book.evals} evaluations`);
  assert.ok(book.dirtyCount > 50, 'the edit reaches the statements: ' + book.dirtyCount + ' cells dirty');
  assert.notEqual(sh(s, 'BS').value('J25'), bsBefore, 'the balance sheet moved with the input');
  assert.deepEqual(staleCells(s), [], 'nothing is stale after the edits');
  assert.ok(per < 400, `an edit on the model takes ${per.toFixed(0)} ms of CPU (bound 400 ms; it runs near 40 ms)`);
  const cover = sh(s, 'Cover'); cover.commitInput('a note', 2, 9);
  assert.equal(book.evals, 0, 'a plain cell nobody reads costs no evaluation'); assert.equal(book.dirtyCount, 0);
  inputs.commitInput(String(was), p.r, p.c); const back = sh(s, 'BS').value('J25');
  assert.ok(Math.abs(back - bsBefore) < Math.abs(bsBefore) * 0.001, `putting the input back lands on the same solution (within the circle's tolerance): ${back} vs ${bsBefore}`);   // a revolver circle may settle on a near-by fixed point, as Excel's does
  assert.deepEqual(staleCells(s), []);
});

test('the graph: cross-sheet readers follow an edit, a circle through a bridge cell settles, iteration toggles re-run the circle, undo and names recalculate', () => {
  const s = new Session(new Sheet({ cells: { A1: { value: 10 }, B1: { formula: '=A1*2' } } }));
  s.renameSheet(0, 'Data');
  s.addSheet('Report', new Sheet({ cells: { A1: { formula: '=Data!B1+1' }, A2: { formula: '=SUM(Data!A1:A3)' } } }));
  const data = sh(s, 'Data'), report = sh(s, 'Report');
  assert.deepEqual([report.value('A1'), report.value('A2')], [21, 10]);
  data.commitInput('5', 1, 1); assert.deepEqual([data.value('B1'), report.value('A1'), report.value('A2')], [10, 11, 5], 'the readers on the other sheet move with the edit');
  assert.equal(s.book.evals, 3, 'exactly the three readers ran');
  data.commitInput('7', 3, 1); assert.equal(report.value('A2'), 12, 'a cell inside a read range, blank before, counts once filled'); assert.equal(s.book.evals, 1);
  report.commitInput('=A1*0', 5, 1); assert.equal(s.book.evals, 1);
  data.undo(); assert.equal(report.value('A2'), 5, 'undo on one sheet recalculates its readers');
  // a circle through a bridge: C1 reads D1, D1 reads C1 (iteration off: both 0; on: converge)
  data.commitInput('=D1*0.5+10', 1, 3); data.commitInput('=C1', 1, 4);
  assert.deepEqual([data.value('C1'), data.value('D1')], [0, 0]); assert.deepEqual(data.circular, ['C1', 'D1']);
  s.settings.iterative = true; s.settings.maxIterations = 100; s.settings.maxChange = 0.001; data.commit('settings');
  assert.ok(Math.abs(data.value('C1') - 20) < 0.01, 'iteration on: the circle settles (C = C/2 + 10 → 20): ' + data.value('C1'));
  s.settings.iterative = false; data.commit('settings'); assert.deepEqual([data.value('C1'), data.value('D1')], [0, 0], 'iteration off: the circle reads 0 again');
  // a defined name: its readers follow the cells it names
  s.names = { Rate: 'Data!$A$1' }; report.commitInput('=Rate*2', 6, 1); assert.equal(report.value('A6'), 10);
  data.commitInput('6', 1, 1); assert.equal(report.value('A6'), 12, 'the name reader follows the named cell');
});
