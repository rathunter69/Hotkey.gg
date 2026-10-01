// Formula auditing (Chapter 3.6, 5.5): trace arrows, Evaluate Formula, F9 on a selected piece,
// Ctrl+[ / Ctrl+], Error Checking (M79) and Go To Special's Row / Column differences.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { ERRCHECK_DONE_NOTE } from '../engine/tools.js';

const fresh = (cells, opts) => new Session(new Sheet({ cells, ...(opts || {}) }), { now: () => 0 });
const CELLS = { A1: { value: 10 }, A2: { value: 20 }, A3: { value: 1240 }, B1: { formula: '=A1*2' }, B2: { formula: '=A2*2' }, B3: { formula: '=SUM(A1:A3)' }, C3: { formula: '=B3/2' }, C4: { formula: '=A3+1' }, D4: { formula: '=C4*B1' } };

test('Trace Precedents / Dependents draw one level per press, as boxes for ranges; Remove Arrows clears; Ctrl+[ and Ctrl+] select every direct precedent / dependent', () => {
  const s = fresh(CELLS); const S = s.sheet;
  S.goTo(3, 3); s.run('Alt M P'); assert.deepEqual(S.arrows, [{ kind: 'precedent', from: 'B3', to: 'C3', sheet: undefined }]); assert.equal(S.selectionText(), 'C3', 'the selection stays');
  s.run('Alt M P'); assert.deepEqual(S.arrows[1], { kind: 'precedent', from: 'A1', to: 'B3', range: { r1: 1, c1: 1, r2: 3, c2: 1 }, sheet: undefined }, 'the second press traces the next level: the range as one arrow with its box');
  const n = S.arrows.length; s.run('Alt M P'); assert.equal(S.arrows.length, n, 'nothing more to trace draws nothing');
  S.goTo(3, 1); s.run('Alt M D'); assert.deepEqual(S.arrows.filter(a => a.kind === 'dependent').map(a => a.to), ['B3', 'C4'], 'A3 feeds B3 (through the range) and C4');
  s.run('Alt M D'); assert.deepEqual(S.arrows.filter(a => a.kind === 'dependent').map(a => a.from + '>' + a.to), ['A3>B3', 'A3>C4', 'B3>C3', 'C4>D4']);
  s.run('Alt M A P'); assert.ok(S.arrows.every(a => a.kind === 'dependent')); s.run('Alt M A A'); assert.deepEqual(S.arrows, []);
  S.goTo(4, 4); s.run('Ctrl+['); assert.equal(S.selectionText(), 'C4,B1', 'every direct precedent, the first active');
  S.goTo(1, 1); s.run('Ctrl+]'); assert.equal(S.selectionText(), 'B1,B3');
});

test('Evaluate Formula (Alt M V) steps through the formula, underlining the next piece; F9 on a selected piece writes its value', () => {
  const s = fresh(CELLS); const S = s.sheet;
  S.goTo(3, 3); s.run('Alt M V'); assert.equal(s.dialog, 'evalfx');
  const v = () => { const w = s.evaluateView(); return w.under || w.after ? w.before + '[' + w.under + ']' + w.after : w.before; };
  assert.equal(v(), '=[B3]/2'); s.run('Enter'); assert.equal(v(), '=[1270/2]'); s.run('Alt+E'); assert.equal(v(), '=635'); assert.equal(s.dlg.done, true); assert.equal(s.dlg.result, 635);
  s.run('Alt+R'); assert.equal(v(), '=[B3]/2', 'Restart'); s.run('Escape'); assert.equal(s.dialog, null);
  S.goTo(3, 2); s.run('Alt M V'); assert.equal(v(), '=[SUM(A1:A3)]', 'a range is read whole'); s.run('Enter'); assert.equal(v(), '=1270');
  s.run('Escape'); S.goTo(1, 1); s.run('Alt M V'); assert.equal(s.dialog, null, 'a cell without a formula opens nothing');
  // F9 in the formula bar: Shift+← selects the tail, F9 replaces it with its value; Esc restores the formula
  S.goTo(4, 4); s.run('F2 Shift+Left Shift+Left'); assert.deepEqual([s.editSel.start, s.editSel.end], [4, 6]); s.run('F9'); assert.equal(s.editBuf, '=C4*20'); s.run('Escape'); assert.equal(S.formula('D4'), '=C4*B1');
  s.run('F2 F9'); assert.equal(s.editBuf, '24820', 'F9 with nothing selected: the whole formula'); s.run('Enter'); assert.equal(S.formula('D4'), null); assert.equal(S.value('D4'), 24820);
});

test('Error Checking (Alt M K) walks the error cells of the active sheet only; Next, Previous, Ignore Error, Edit in Formula Bar; then the sheet is complete', () => {
  const s = fresh({ A1: { formula: '=1/0' }, B2: { formula: '=NA()' }, C1: { value: 5 }, D1: { formula: '=#REF!+1' } }); const S = s.sheet;
  s.insertSheet(); s.sheet.setCell('A1', { formula: '=1/0' }); s.sheet.recalc(); s.switchSheet(1 - s.sheetIndex);
  s.run('Alt M K'); assert.equal(s.dialog, 'errcheck'); assert.deepEqual([s.dlg.cell, s.dlg.error], ['A1', '#DIV/0!']); assert.equal(S.selectionText(), 'A1');
  s.run('Alt+N'); assert.deepEqual([s.dlg.cell, s.dlg.error], ['D1', '#REF!'], 'row by row, left to right'); s.run('Alt+N'); assert.equal(s.dlg.cell, 'B2');
  s.run('Alt+P'); assert.equal(s.dlg.cell, 'D1'); s.run('Alt+I'); assert.equal(s.dlg.cell, 'B2', 'Ignore Error steps on');
  s.run('Alt+N'); assert.equal(s.dlg.done, true); assert.equal(s.dlg.note, ERRCHECK_DONE_NOTE, 'the other sheet\'s error is not visited (M79)');
  s.run('Enter'); assert.equal(s.dialog, null);
  s.run('Alt M K'); assert.equal(s.dlg.cell, 'A1'); s.run('Alt+N'); assert.equal(s.dlg.cell, 'B2', 'the ignored D1 is skipped'); s.run('Alt+F'); assert.equal(s.editing, true); assert.equal(s.editBuf, '=NA()'); s.run('Escape');
  const t = fresh({ A1: { value: 1 } }); t.run('Alt M K'); assert.equal(t.dlg.done, true); assert.equal(t.dlg.note, ERRCHECK_DONE_NOTE);
});

test('Go To Special: Row differences lights the cell that breaks a row\'s pattern; Column differences a column\'s', () => {
  const s = fresh({ A1: { value: 1 }, B1: { value: 2 }, C1: { value: 3 }, D1: { value: 4 }, A2: { formula: '=A1*2' }, B2: { formula: '=B1*2' }, C2: { formula: '=$B1*2' }, D2: { formula: '=D1*2' }, A3: { value: 7 }, B3: { value: 7 }, C3: { value: 8 }, D3: { formula: '=7' } }); const S = s.sheet;
  S.select('A2:D2'); s.run('Alt H F D S W Enter'); assert.equal(S.selectionText(), 'C2', 'C2 lost its relative shape');
  S.select('A3:D3'); s.run('Alt H F D S W Enter'); assert.equal(S.selectionText(), 'C3,D3', 'a different value, and a formula where constants stand');
  S.select('A1:D2'); s.run('Alt H F D S M Enter'); assert.equal(S.selectionText(), 'A2,B2,C2,D2', 'Column differences against row 1 (the active cell\'s row): every formula differs from the value above it');
  S.select('A2:B2'); s.run('Alt H F D S W Enter'); assert.equal(s.dialog, 'gotospecial', 'no difference: Excel\'s No cells were found');
});
