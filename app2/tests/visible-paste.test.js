// Select Visible Cells (Alt+;) and Paste Special's Skip blanks (4.2.5): a block with rows hidden by
// hand copies every row unless Alt+; came first, a pasted formula shifts by its own row's distance,
// and a partial column pasted with Skip blanks lands only its filled cells.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Session } from '../engine/keyboard.js';
import { Sheet } from '../engine/sheet.js';

const fresh = () => new Session(new Sheet({ rows: 30, cols: 8, cells: {
  A1: { value: 'Site' }, B1: { value: 'Washes' }, C1: { value: 'Double' },
  ...Object.fromEntries([2, 3, 4, 5, 6].flatMap(r => [['A' + r, { value: 'S' + r }], ['B' + r, { value: r * 10 }], ['C' + r, { formula: `=B${r}*2` }]])),
} }));

test('a copy takes rows hidden by hand along; after Alt+; it leaves them behind', () => {
  const s = fresh(); const S = s.sheet;
  S.select('A3:A4'); s.run('Ctrl+9');
  assert.ok(S.hiddenRows.has(3) && S.hiddenRows.has(4));
  S.select('A1:C6'); s.run('Ctrl+C');
  assert.equal(S.clipboard.h, 6, 'all six rows, the hidden two included');
  S.select('A1:C6'); s.run('Alt+; Ctrl+C');
  assert.equal(S.clipboard.h, 4, 'four visible rows');
  assert.equal(s.keyLog.at(-2).k, 'Alt+;');
  S.goTo(10, 1); s.run('Ctrl+V');
  assert.deepEqual([10, 11, 12, 13].map(r => S.value('A' + r)), ['Site', 'S2', 'S5', 'S6']);
  assert.equal(S.formula('C12'), '=B12*2', 'the formula from row 5 reads its own new row');
  assert.equal(S.value('C13'), 120);
});

test('Alt+; only counts for the selection it was pressed on', () => {
  const s = fresh(); const S = s.sheet;
  S.select('A3:A3'); s.run('Ctrl+9');
  S.select('A1:C6'); s.run('Alt+;');
  S.select('A1:C5'); s.run('Ctrl+C');
  assert.equal(S.clipboard.h, 5, 'a new selection copies its hidden rows again');
});

test('Paste Special with Skip blanks (B) lands only the filled cells of a partial column', () => {
  const s = fresh(); const S = s.sheet;
  S.setCell('E2', { value: 99, fontColor: 'blue' }); S.setCell('E5', { value: 77 });
  S.select('E2:E6'); s.run('Ctrl+C');
  S.goTo(2, 2); s.run('Ctrl+Alt+V B Enter');
  assert.deepEqual([2, 3, 4, 5, 6].map(r => S.value('B' + r)), [99, 30, 40, 77, 60]);
  assert.equal(S.cellAt('B2').fontColor, 'blue', 'a landed cell carries its format');
  S.select('E2:E6'); s.run('Ctrl+C'); S.goTo(2, 1); s.run('Ctrl+Alt+V Enter');
  assert.equal(S.value('A3'), null, 'without the tick the blanks wipe what was there');
  assert.equal(s.pasteSkip, false, 'the tick does not outlive its paste');
});

test('Data, Clear (Alt A C) takes every filter off and keeps the arrows', () => {
  const s = fresh(); const S = s.sheet;
  S.goTo(1, 1); s.run('Ctrl+Shift+L Alt+Down E "S2" Enter');
  assert.equal(S.filterRows.size, 4, 'four of the five rows hidden');
  S.goTo(20, 5); s.run('Alt A C');
  assert.equal(S.filterRows.size, 0, 'every row shows again');
  assert.ok(S.filter, 'the arrows stay on');
  assert.deepEqual(S.filter.crit, {});
});
