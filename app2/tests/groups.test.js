// app2/tests/groups.test.js — grouping / outline (C2 gap 4): Alt+Shift+→ / ← group and ungroup
// whole rows or columns into one outline level, Data › Group / Ungroup / Hide / Show Detail walk the
// same state, a folded group hides in the view but never counts as hidden (graders tell the two
// apart), the outline survives snapshot / undo / toJSON / copySheet, and insert / delete shift it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Session, GROUP_SELECT_NOTE } from '../engine/keyboard.js';
import { Sheet, normGroups } from '../engine/sheet.js';
import { noHidden } from '../app/graders.js';
import { runCommand, RIBBON_COMMANDS, RIBBON_LAYOUT, layoutItems } from '../ui/ribbon-commands.js';
import { COMMANDS, MENUS } from '../engine/ribbon.js';

const fresh = () => { const toasts = []; const s = new Session(new Sheet({ rows: 20, cols: 8, cells: {
  A1: { value: 'Report' }, A3: { value: 'Mon' }, B3: { value: 1 }, C3: { value: 2 }, A4: { value: 'Tue' }, B4: { value: 3 }, C4: { value: 4 }, D6: { formula: '=SUM(B3:C4)' },
} }), { onToast: m => toasts.push(m), now: () => 0 }); s.toasts = toasts; return s; };
const keys = s => s.keyLog.map(e => e.k);

test('Alt+Shift+→ groups whole columns; Alt+Shift+← ungroups; a partial selection only says so', () => {
  const s = fresh(); const S = s.sheet;
  S.goTo(3, 2);
  s.run('Shift+Right Ctrl+Space Alt+Shift+Right');
  assert.deepEqual(S.groups.cols, [{ c1: 2, c2: 3, collapsed: false }]);
  assert.deepEqual(S.groups.rows, []);
  assert.equal(keys(s).at(-1), 'Alt+Shift+→');
  assert.equal(S.hiddenCols.size, 0, 'grouping hides nothing');
  s.run('Alt+Shift+Left');
  assert.deepEqual(S.groups.cols, [], 'ungrouped');
  assert.equal(keys(s).at(-1), 'Alt+Shift+←');
  S.goTo(3, 2); s.run('Shift+Right Alt+Shift+Right');
  assert.deepEqual(S.groups.cols, [], 'a range that is not whole columns groups nothing');
  assert.equal(s.toasts.at(-1), GROUP_SELECT_NOTE);
  assert.equal(keys(s).at(-1), 'Alt+Shift+→', 'the chord was still pressed');
  // rows: Shift+Space first, as the brief has it
  S.goTo(3, 1); s.run('Shift+Down Shift+Space Alt+Shift+Right');
  assert.deepEqual(S.groups.rows, [{ r1: 3, r2: 4, collapsed: false }]);
  assert.equal(s.mode, 'normal');
});

test('the browser delivers a held chord as Alt then the arrow: the KeyTips close and the group lands', () => {
  const s = fresh(); const S = s.sheet;
  S.goTo(2, 3); s.run('Ctrl+Space');
  s.key({ key: 'Alt' }); assert.equal(s.mode, 'ribbon');
  s.key({ key: 'ArrowRight', altKey: true, shiftKey: true });
  assert.equal(s.mode, 'normal');
  assert.deepEqual(S.groups.cols, [{ c1: 3, c2: 3, collapsed: false }]);
  assert.deepEqual(keys(s).slice(-2), ['Alt', 'Alt+Shift+→']);
});

test('touching bands merge into one level; ungrouping the middle of a band leaves two', () => {
  const S = new Sheet({ rows: 20, cols: 8 });
  S.select('B1:B20'); S.group('c'); S.select('C1:D20'); S.group('c');
  assert.deepEqual(S.groups.cols, [{ c1: 2, c2: 4, collapsed: false }], 'adjacent bands join');
  assert.equal(S.group('c'), false, 'a band already inside a group is a no-op (one level)');
  S.select('B1:D20'); assert.equal(S.group('c'), false, 'the same band again is a no-op');
  S.select('C1:C20'); assert.equal(S.ungroup('c'), true);
  assert.deepEqual(S.groups.cols, [{ c1: 2, c2: 2, collapsed: false }, { c1: 4, c2: 4, collapsed: false }]);
  S.select('F1:F20'); assert.equal(S.ungroup('c'), false, 'nothing grouped there');
});

test('Data › Group / Ungroup / Hide Detail / Show Detail: KeyTips and the mouse table reach one state; a folded band is not hidden', () => {
  for (const id of ['AG', 'AU', 'AH', 'AJ', 'MH']) { assert.ok(COMMANDS[id], id + ' is an Alt path'); assert.ok(RIBBON_COMMANDS[id] && RIBBON_COMMANDS[id].icon, id + ' has a table entry'); }
  assert.ok(MENUS.A.some(([k]) => k === 'G') && MENUS.A.some(([k]) => k === 'U'));
  assert.ok(RIBBON_LAYOUT.A.some(g => g.name === 'Outline'), 'the Data tab draws the Outline group');
  assert.ok(layoutItems('A').some(it => it.cmd === 'AG') && layoutItems('A').some(it => it.cmd === 'AJ'));
  const k = fresh(), m = fresh();
  for (const s of [k, m]) { s.sheet.goTo(3, 2); s.run('Shift+Right Ctrl+Space'); }
  k.run('Alt A G'); runCommand(m, 'AG');
  assert.deepEqual(k.sheet.groups, m.sheet.groups); assert.deepEqual(k.sheet.groups.cols, [{ c1: 2, c2: 3, collapsed: false }]);
  assert.equal(k.mode, 'normal'); assert.equal(m.mode, 'normal');
  assert.deepEqual(keys(k).slice(-3), ['Alt', 'A', 'G'], 'the ribbon route logs its walk, not the chord');
  // Hide Detail folds the group the active cell sits in; Show Detail unfolds it
  k.sheet.goTo(5, 2); k.run('Alt A H'); runCommand(m, 'AH');
  assert.equal(k.sheet.groups.cols[0].collapsed, true); assert.equal(m.sheet.groups.cols[0].collapsed, true);
  assert.equal(k.sheet.isFolded('c', 2), true); assert.equal(k.sheet.isFolded('c', 4), false);
  assert.equal(k.sheet.hiddenCols.size, 0, 'folded, not hidden');
  assert.equal(noHidden(k.sheet).ok, true, 'the C7 grader passes on a collapsed group');
  k.run('Alt A J'); runCommand(m, 'AJ');
  assert.equal(k.sheet.groups.cols[0].collapsed, false); assert.equal(m.sheet.groups.cols[0].collapsed, false);
  k.sheet.goTo(9, 7); k.run('Alt A H'); assert.equal(k.toasts.at(-1), 'No group here.');
  k.sheet.goTo(3, 1); k.run('Shift+Space Alt A U'); assert.deepEqual(k.sheet.groups.cols.length, 1, 'ungrouping rows leaves the column group');
  k.sheet.goTo(3, 2); k.run('Ctrl+Space Alt A U'); assert.deepEqual(k.sheet.groups.cols, [{ c1: 3, c2: 3, collapsed: false }]);
});

test('the outline survives snapshot / undo, toJSON and copySheet, and insert / delete shift it', () => {
  const s = fresh(); const S = s.sheet;
  S.select('B1:C20'); S.group('c'); S.select('A3:H4'); S.group('r');
  assert.deepEqual(S.toJSON().groups, { cols: [{ c1: 2, c2: 3, collapsed: false }], rows: [{ r1: 3, r2: 4, collapsed: false }] });
  S.undo(); assert.deepEqual(S.groups.rows, [], 'grouping is one undo step'); S.redo(); assert.deepEqual(S.groups.rows, [{ r1: 3, r2: 4, collapsed: false }]);
  S.setGroupFold('c', 0, true); S.undo(); assert.equal(S.groups.cols[0].collapsed, false, 'folding is undoable'); S.redo();
  const j = s.copySheet(0); assert.deepEqual(s.sheets[j].sheet.groups, S.groups, 'the copy carries the outline'); s.switchSheet(0);
  // insert a column before the band: it moves; inside it: it grows; delete inside it: it shrinks
  S.select('A1:A20'); S.insert('c'); assert.deepEqual(S.groups.cols, [{ c1: 3, c2: 4, collapsed: true }]);
  S.select('D1:D20'); S.insert('c'); assert.deepEqual(S.groups.cols, [{ c1: 3, c2: 5, collapsed: true }]);
  S.select('D1:D20'); S.remove('c'); assert.deepEqual(S.groups.cols, [{ c1: 3, c2: 4, collapsed: true }]);
  S.select('C1:D20'); S.remove('c'); assert.deepEqual(S.groups.cols, [], 'the whole band went with its columns');
  // rows: an insert above shifts, a delete straddling the band clips it
  S.select('A1:H1'); S.insert('r'); assert.deepEqual(S.groups.rows, [{ r1: 4, r2: 5, collapsed: false }]);
  S.select('A5:H6'); S.remove('r'); assert.deepEqual(S.groups.rows, [{ r1: 4, r2: 4, collapsed: false }]);
  // a state file's groups build straight into a Sheet, normalised
  const t = new Sheet({ rows: 10, cols: 5, groups: { cols: [{ c1: 4, c2: 2 }, { c1: 2, c2: 3, collapsed: 'yes' }], rows: 'nope' } });
  assert.deepEqual(t.groups, { rows: [], cols: [{ c1: 2, c2: 3, collapsed: false }] });
  assert.deepEqual(normGroups(null), { rows: [], cols: [] });
});
