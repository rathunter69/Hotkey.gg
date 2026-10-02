// app2/tests/indirect-subtotal.test.js — INDIRECT and SUBTOTAL (Chapter 4: 4.1.8 reads INDIRECT in
// an inherited model; 4.2.2 totals a filtered list with SUBTOTAL(109) and counts it with (103)).
// Every expected value is what Excel 365 returns for the same formula over the same cells.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evalFormula } from '../engine/formula.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';

const cells = { A1: 10, A2: 20, A3: 30, A4: 40, B1: 'x', B2: null, B3: 'y', B4: 5, C1: 'A3', C2: 'Lists!B2', C3: 'A1:A4', C4: 'nonsense' };
const hidden = new Set([2, 3]);
const ctx = { raw: k => (k in cells ? cells[k] : null), rows: 50, cols: 30, rowHidden: r => hidden.has(r) };
const ev = f => evalFormula(f, ctx);
const near = (a, b) => Math.abs(a - b) < 1e-9;

test('INDIRECT reads a text as the reference it names', () => {
  assert.equal(ev('=INDIRECT("A3")'), 30);
  assert.equal(ev('=INDIRECT(C1)'), 30);
  assert.equal(ev('=INDIRECT("A"&(1+1))'), 20);
  assert.equal(ev('=SUM(INDIRECT("A1:A4"))'), 100);
  assert.equal(ev('=SUM(INDIRECT(C3))'), 100);
  assert.equal(ev('=SUM(INDIRECT("A:A"))'), 100);
  assert.equal(ev('=INDIRECT("$A$4")'), 40);
  assert.equal(ev('=INDIRECT(C4)'), '#REF!');
  assert.equal(ev('=INDIRECT("")'), '#REF!');
  assert.equal(ev('=INDIRECT("SUM(A1)")'), '#REF!');
  assert.equal(ev('=INDIRECT("A1",FALSE)'), '#REF!');   // R1C1 texts are not read
  assert.equal(ev('=INDIRECT(C2)'), '#REF!');           // no workbook around the sheet: another sheet is #REF!
});

test('INDIRECT reaches another sheet of a workbook, and the trace cannot see it statically', () => {
  const s = new Session(new Sheet({ cells: { B5: { value: 'AUS-DOM' }, C5: { formula: '=INDIRECT("Lists!F"&(4+MATCH(B5,Lists!$B$5:$B$6,0)))' } } }), { now: () => 0 });
  s.sheets[0].name = 'Summary';
  s.addSheet('Lists', new Sheet({ cells: { B5: { value: 'AUS-DOM' }, B6: { value: 'AUS-MUE' }, F5: { value: 120 }, F6: { value: 100 } } }));
  assert.equal(s.sheets[0].sheet.value('C5'), 120);
  s.sheets[0].sheet.setCell('B5', { value: 'AUS-MUE' }); s.sheets[0].sheet.commit('edit');
  assert.equal(s.sheets[0].sheet.value('C5'), 100);
});

test('SUBTOTAL 1-11 count every row, 101-111 only the rows that show', () => {
  assert.equal(ev('=SUBTOTAL(9,A1:A4)'), 100);
  assert.equal(ev('=SUBTOTAL(109,A1:A4)'), 50);
  assert.equal(ev('=SUBTOTAL(9,A1:A4,B1:B4)'), 105);
  assert.equal(ev('=SUBTOTAL(2,A1:A4)'), 4);
  assert.equal(ev('=SUBTOTAL(102,A1:A4)'), 2);
  assert.equal(ev('=SUBTOTAL(3,B1:B4)'), 3);
  assert.equal(ev('=SUBTOTAL(103,B1:B4)'), 2);
  assert.equal(ev('=SUBTOTAL(1,A1:A4)'), 25);
  assert.equal(ev('=SUBTOTAL(101,A1:A4)'), 25);
  assert.equal(ev('=SUBTOTAL(4,A1:A4)'), 40);
  assert.equal(ev('=SUBTOTAL(105,A1:A4)'), 10);
  assert.equal(ev('=SUBTOTAL(6,A1:A2)'), 200);
  assert.ok(near(ev('=SUBTOTAL(7,A1:A4)'), 12.909944487358056));
  assert.ok(near(ev('=SUBTOTAL(8,A1:A4)'), 11.180339887498949));
  assert.ok(near(ev('=SUBTOTAL(10,A1:A4)'), 166.66666666666666));
  assert.equal(ev('=SUBTOTAL(11,A1:A4)'), 125);
  assert.equal(ev('=SUBTOTAL(12,A1:A4)'), '#VALUE!');
  assert.equal(ev('=SUBTOTAL(0,A1:A4)'), '#VALUE!');
  assert.equal(ev('=SUBTOTAL(9,5)'), '#VALUE!');
  assert.equal(ev('=SUBTOTAL(1,B1:B3)'), '#DIV/0!');
});

test('SUBTOTAL 1-11 still skip the rows the AutoFilter hides (as Excel does)', () => {
  const fctx = { ...ctx, rowFiltered: r => r === 4, rowHidden: r => r === 4 || hidden.has(r) };
  assert.equal(evalFormula('=SUBTOTAL(9,A1:A4)', fctx), 60);
  assert.equal(evalFormula('=SUBTOTAL(109,A1:A4)', fctx), 10);
});

test('SUBTOTAL(109) on a sheet follows the rows hidden by hand', () => {
  const sh = new Sheet({ cells: { A1: { value: 10 }, A2: { value: 20 }, A3: { value: 30 }, A5: { formula: '=SUBTOTAL(109,A1:A3)' }, A6: { formula: '=SUBTOTAL(9,A1:A3)' } } });
  assert.equal(sh.value('A5'), 60);
  sh.select('A2'); sh.hideRows();
  assert.equal(sh.value('A5'), 40);
  assert.equal(sh.value('A6'), 60);
  sh.select('A2'); sh.unhideRows();
  assert.equal(sh.value('A5'), 60);
});
