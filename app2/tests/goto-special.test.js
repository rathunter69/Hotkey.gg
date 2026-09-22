// Go To Special (phase C engine gap 2): selectSpecial kinds, the multi selection the format
// and clear operations honour, the dialog routes (Alt H F D S, Go To › Alt+S, HFDU/HFDN).
import test from 'node:test';
import assert from 'node:assert/strict';
import { Session, SPECIAL_NONE_NOTE } from '../engine/keyboard.js';
import { Sheet } from '../engine/sheet.js';

const fresh = () => new Session(new Sheet({ rows: 20, cols: 8, cells: {
  A2: { value: 'Day' }, B2: { value: 'Sales' },
  A3: { value: 'Mon' }, B3: { value: 1200 },
  A4: { value: 'Tue' },                          // B4 blank
  A5: { value: 'Wed' }, B5: { value: 1430 },
  A6: { value: 'Thu' },                          // B6 blank
  A7: { value: 'Fri' }, B7: { formula: '=B3+B5' },
} }));

test('selectSpecial: blanks / constants / formulas inside the selection set multi', () => {
  const s = fresh(); const S = s.sheet;
  S.select('B2:B7');
  assert.equal(S.selectSpecial('blanks'), true);
  assert.deepEqual(S.multi, ['B4', 'B6']);
  assert.equal(S.selectionText(), 'B4,B6');
  S.select('B2:B7');
  assert.equal(S.selectSpecial('formulas'), true);
  assert.deepEqual(S.multi, ['B7']);
  S.select('B2:B7');
  assert.equal(S.selectSpecial('constants'), true);
  assert.deepEqual(S.multi, ['B2', 'B3', 'B5']);
});

test('a single cell means the region around it; nothing found refuses without moving', () => {
  const s = fresh(); const S = s.sheet;
  S.goTo(3, 1);   // A3, inside the block
  assert.equal(S.selectSpecial('blanks'), true, 'the region A2:B7 has blanks');
  assert.deepEqual(S.multi, ['B4', 'B6']);
  S.select('A3:A7');
  assert.equal(S.selectSpecial('formulas'), false, 'no formulas in A3:A7');
  assert.equal(S.selectionText(), 'A3:A7', 'the selection stays');
});

test('formats and clears act on the multi; any selection change drops it', () => {
  const s = fresh(); const S = s.sheet;
  S.select('B2:B7'); S.selectSpecial('constants');
  S.toggleAllOrNone('bold');
  assert.equal(S.cellAt('B3').bold, true);
  assert.equal(S.cellAt('B4').bold, false, 'a blank outside the multi is untouched');
  S.select('B2:B7'); S.selectSpecial('blanks');
  S.setFill('yellow');
  assert.equal(S.cellAt('B4').fill, 'yellow');
  assert.equal(S.cellAt('B3').fill, null);
  S.move(1, 0, false, false);
  assert.equal(S.multi, null, 'moving clears the special selection');
});

test('the dialog: Alt H F D S picks a kind with K/O/F, Enter applies; HFDU/HFDN are direct', () => {
  const s = fresh(); const S = s.sheet;
  S.select('B2:B7');
  s.run('Alt H F D S');
  assert.equal(s.dialog, 'gotospecial');
  s.run('F Enter');
  assert.deepEqual(S.multi, ['B7']);
  assert.equal(s.mode, 'normal');
  S.select('B2:B7');
  s.run('Alt H F D U');
  assert.deepEqual(S.multi, ['B7'], 'HFDU = formulas directly');
  S.select('A3:A7');
  s.run('Alt H F D S F Enter');
  assert.equal(s.dialog, 'gotospecial', 'nothing found: the card stays');
  assert.equal(s.note, SPECIAL_NONE_NOTE);
  s.run('Escape Escape Escape Escape Escape');
});

test('Go To opens Special with Alt+S', () => {
  const s = fresh(); const S = s.sheet;
  S.select('B2:B7');
  s.run('Ctrl+G Alt+S');
  assert.equal(s.dialog, 'gotospecial');
  s.run('K Enter');
  assert.deepEqual(S.multi, ['B4', 'B6']);
});

test('Ctrl+Enter fills every cell of the multi (the Excel blanks-fill pattern)', () => {
  const s = fresh(); const S = s.sheet;
  S.select('B2:B7'); S.selectSpecial('blanks');
  s.run('0 Ctrl+Enter');
  assert.equal(S.value('B4'), 0);
  assert.equal(S.value('B6'), 0);
  assert.equal(S.value('B3'), 1200, 'filled cells untouched');
});
