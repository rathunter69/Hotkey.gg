// Find & Replace (phase C engine gap 1): Ctrl+F / Ctrl+H and the Alt H F D F / R routes,
// findNext scanning and wrap, Replace All in one undo step, dialog field editing.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Session, FIND_NONE_NOTE } from '../engine/keyboard.js';
import { Sheet } from '../engine/sheet.js';

const fresh = () => new Session(new Sheet({ rows: 20, cols: 8, cells: {
  A1: { value: 'Weekly Sales Report' }, A3: { value: 'Monday' }, A4: { value: 'Tuesday' }, A5: { value: 'Wenesday' },
  B3: { value: 1200 }, B4: { value: 950 }, B5: { value: 1430 },
  C1: { value: 'Q1 total' }, C2: { value: 'Q1 target' }, D1: { value: 'Sales team' },
  E5: { formula: '=SUM(B3:B5)' },
} }));
const keys = s => s.keyLog.map(e => e.k);

test('Ctrl+F opens Find, typing keeps its case, Enter jumps to the match and stays open', () => {
  const s = fresh();
  s.run('Ctrl+F');
  assert.equal(s.dialog, 'find');
  assert.equal(s.dlg.replace, false);
  s.run('"Wenesday" Enter');
  assert.equal(s.dlg.find, 'Wenesday', 'typed case is kept');
  assert.equal(s.sheet.selectionText(), 'A5', 'the active cell lands on the match');
  assert.equal(s.dialog, 'find', 'the card stays open, as Excel’s does');
  assert.ok(keys(s).includes('Ctrl+F'));
  s.run('Escape');
  assert.equal(s.dialog, null);
  assert.equal(s.mode, 'normal');
});

test('findNext: case-insensitive substring, row-major from the active cell, wraps once', () => {
  const s = fresh(); const S = s.sheet;
  assert.equal(S.findNext('q1'), 'C1');
  assert.equal(S.findNext('q1'), 'C2', 'the next match after the last');
  assert.equal(S.findNext('q1'), 'C1', 'wraps');
  assert.equal(S.findNext('zzz'), null, 'no match: null, nothing moves');
  assert.equal(S.selectionText(), 'C1');
  assert.equal(S.findNext('sum'), 'E5', 'formula text is searched too');
});

test('no match: Excel’s message, the dialog stays', () => {
  const s = fresh();
  s.run('Ctrl+F "zzz" Enter');
  assert.equal(s.note, FIND_NONE_NOTE);
  assert.equal(s.dialog, 'find');
});

test('Ctrl+H: Tab switches fields, Alt+A replaces everywhere in one undo step', () => {
  const s = fresh(); const S = s.sheet;
  s.run('Ctrl+H');
  assert.equal(s.dlg.replace, true);
  s.run('"Q1" Tab "Q2"');
  assert.equal(s.dlg.find, 'Q1');
  assert.equal(s.dlg.repl, 'Q2');
  s.run('Alt+A');
  assert.match(s.note, /2 replacements/);
  assert.equal(S.value('C1'), 'Q2 total');
  assert.equal(S.value('C2'), 'Q2 target');
  s.run('Escape');
  S.undo();
  assert.equal(S.value('C1'), 'Q1 total', 'one Ctrl+Z rewinds the whole Replace All');
  assert.equal(S.value('C2'), 'Q1 target');
});

test('replaceAll touches formulas, counts cells, and is case-insensitive', () => {
  const s = fresh(); const S = s.sheet;
  assert.equal(S.replaceAll('sales', 'Revenue'), 2, 'A1 and D1');
  assert.equal(S.value('A1'), 'Weekly Revenue Report');
  assert.equal(S.replaceAll('B3:B5', 'B3:B4'), 1, 'formula text replaces too');
  assert.equal(S.formula('E5'), '=SUM(B3:B4)');
  assert.equal(S.value('E5'), 2150, 'and the sheet recalculated');
  assert.equal(S.replaceAll('nope', 'x'), 0);
});

test('the ribbon routes: Alt H F D F opens Find, Alt H F D R opens Replace on the menu path', () => {
  const s = fresh();
  s.run('Alt H F D R');
  assert.equal(s.dialog, 'find');
  assert.equal(s.dlg.replace, true);
  s.run('Escape');
  assert.deepEqual(s.path, ['H', 'F', 'D'], 'Esc backs out to the menu');
  s.run('Escape Escape Escape Escape');
  assert.equal(s.mode, 'normal');
});
