// Row height, hide/unhide, freeze (phase C engine gap 3): the chords, the Alt walks, the
// structure surviving snapshot/undo and shifting with insert/delete.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Session } from '../engine/keyboard.js';
import { Sheet, ROWH_DEFAULT } from '../engine/sheet.js';

const fresh = () => new Session(new Sheet({ rows: 20, cols: 8, cells: {
  A1: { value: 'Report' }, A3: { value: 'Mon' }, B3: { value: 1 }, A4: { value: 'Tue' }, B4: { value: 2 },
} }));
const keys = s => s.keyLog.map(e => e.k);

test('Ctrl+9 hides the selection’s rows; Ctrl+Shift+( unhides them', () => {
  const s = fresh(); const S = s.sheet;
  S.goTo(3, 1);
  s.run('Shift+Space Ctrl+9');
  assert.ok(S.hiddenRows.has(3));
  assert.ok(keys(s).includes('Ctrl+9'));
  S.select('A2:A5');
  s.run('Ctrl+Shift+9');   // arrives as '(' — the trap the brief pins
  assert.equal(S.hiddenRows.size, 0);
  assert.equal(keys(s).at(-1), 'Ctrl+Shift+(');
});

test('Ctrl+0 hides columns; Ctrl+Shift+0 unhides inside the selection', () => {
  const s = fresh(); const S = s.sheet;
  S.goTo(3, 2);
  s.run('Ctrl+0');
  assert.ok(S.hiddenCols.has(2));
  S.select('A1:C1');
  s.run('Ctrl+Shift+0');   // arrives as ')'
  assert.equal(S.hiddenCols.size, 0);
  assert.equal(keys(s).at(-1), 'Ctrl+Shift+)');
});

test('the Hide & Unhide menu: Alt H O U R / C / O / L', () => {
  const s = fresh(); const S = s.sheet;
  S.goTo(4, 1);
  s.run('Alt H O U R');
  assert.ok(S.hiddenRows.has(4));
  s.run('Alt H O U O');
  assert.equal(S.hiddenRows.size, 0, 'unhide rows inside the selection’s rows');
  s.run('Alt H O U C');
  assert.ok(S.hiddenCols.has(1));
  s.run('Alt H O U L');
  assert.equal(S.hiddenCols.size, 0);
  assert.equal(s.mode, 'normal');
});

test('Row Height (Alt H O H): points to px at 4/3, over the selection’s rows', () => {
  const s = fresh(); const S = s.sheet;
  S.goTo(4, 1);
  s.run('Alt H O H 30 Enter');
  assert.equal(S.rowH[4], 40, '30pt = 40px');
  assert.equal(S.rowH[3], ROWH_DEFAULT);
  assert.equal(s.mode, 'normal');
  S.undo();
  assert.equal(S.rowH[4], ROWH_DEFAULT, 'row height is undoable');
});

test('AutoFit Row Height (Alt H O A): a wrapped cell doubles per extra line, others reset', () => {
  const s = fresh(); const S = s.sheet;
  S.setCell('A6', { value: 'a very long wrapped label that needs several lines to fit here', wrap: true });
  S.recalc();
  S.rowH[6] = 80;
  S.goTo(6, 1);
  s.run('Alt H O A');
  assert.ok(S.rowH[6] >= ROWH_DEFAULT * 2, 'grew for the wrap');
  S.goTo(3, 1);
  s.run('Alt H O A');
  assert.equal(S.rowH[3], ROWH_DEFAULT);
});

test('Freeze Panes: Alt W F R / C / F, and F toggles off', () => {
  const s = fresh(); const S = s.sheet;
  s.run('Alt W F R');
  assert.deepEqual(S.freeze, { r: 1, c: 0 });
  s.run('Alt W F C');
  assert.deepEqual(S.freeze, { r: 0, c: 1 });
  s.run('Alt W F F');
  assert.deepEqual(S.freeze, { r: 0, c: 0 }, 'set panes: F unfreezes');
  S.goTo(3, 2);
  s.run('Alt W F F');
  assert.deepEqual(S.freeze, { r: 2, c: 1 }, 'F freezes above/left of the active cell');
});

test('insert/delete rows shift heights, hidden rows and the freeze seam', () => {
  const s = fresh(); const S = s.sheet;
  S.rowH[4] = 40; S.hiddenRows.add(4); S.freeze = { r: 3, c: 0 };
  S.goTo(2, 1);
  s.run('Shift+Space Ctrl+Shift+=');
  assert.equal(S.rowH[5], 40, 'the sized row moved down');
  assert.ok(S.hiddenRows.has(5) && !S.hiddenRows.has(4));
  assert.equal(S.freeze.r, 4);
  s.run('Shift+Space Ctrl+-');
  assert.equal(S.rowH[4], 40, 'delete shifts back');
  assert.ok(S.hiddenRows.has(4));
  assert.equal(S.freeze.r, 3);
});

test('undo restores heights, hidden sets and the freeze; toJSON carries them', () => {
  const s = fresh(); const S = s.sheet;
  s.run('Alt H O H 30 Enter');
  S.hideRows();
  assert.ok(S.hiddenRows.has(1));
  S.undo();
  assert.equal(S.hiddenRows.size, 0);
  S.freeze = { r: 1, c: 0 };
  const j = S.toJSON();
  assert.deepEqual(j.freeze, { r: 1, c: 0 });
  assert.equal(j.rowH['1'], 40);
  const back = new Sheet({ rows: 20, cols: 8, cells: j.cells, rowH: j.rowH, freeze: j.freeze });
  assert.equal(back.rowH[1], 40);
  assert.deepEqual(back.freeze, { r: 1, c: 0 });
});
