// The Data tab's tools (Chapters 3 to 5): AutoFilter and its header menu, the Sort dialog,
// Remove Duplicates, Data Validation lists, Text to Columns, Flash Fill, Edit Links,
// Goal Seek and data tables. Keys as desktop Excel has them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { wildMatch } from '../engine/tools.js';

const fresh = (cells, opts) => { const toasts = []; const s = new Session(new Sheet({ cells, ...(opts || {}) }), { onToast: m => toasts.push(m), now: () => 0 }); s.toasts = toasts; return s; };
const LIST = { A1: { value: 'Site' }, B1: { value: 'Region' }, C1: { value: 'Washes' },
  A2: { value: 'Austin' }, B2: { value: 'West' }, C2: { value: 420 },
  A3: { value: 'Boston' }, B3: { value: 'East' }, C3: { value: 150 },
  A4: { value: 'Dallas' }, B4: { value: 'West' }, C4: { value: 300 },
  A5: { value: 'Erie' }, B5: { value: 'East' }, C5: { value: 90 },
  A6: { value: 'Fresno' }, B6: { value: 'West' }, C6: { value: 610 }, E1: { value: 'note' } };
const visible = S => [2, 3, 4, 5, 6].filter(r => S.isVisible('r', r));

test('AutoFilter: Ctrl+Shift+L on the region, the header menu ticks values, Number Filters, Clear, sort, copy of the visible rows, and off again', () => {
  const s = fresh(LIST); const S = s.sheet;
  S.goTo(3, 2); s.run('Ctrl+Shift+L'); assert.deepEqual({ ...S.filter, crit: undefined }, { r1: 1, c1: 1, r2: 6, c2: 3, crit: undefined }, 'the current region, its first row the header');
  S.goTo(1, 2); s.run('Alt+ArrowDown'); assert.equal(s.dialog, 'autofilter'); assert.deepEqual(s.dlg.items.map(it => it.text), ['East', 'West']); assert.equal(s.dlg.header, 'Region');
  s.run('ArrowDown ArrowDown Space Enter');   // (Select All), East, West: untick West
  assert.deepEqual(S.filter.crit[2], { kind: 'values', values: ['East'] }); assert.deepEqual(visible(S), [3, 5]); assert.equal(s.dialog, null);
  assert.equal(S.evalCtx().rowFiltered(2), true); assert.equal(S.evalCtx().rowHidden(2), true); assert.equal(S.evalCtx().rowHidden(3), false);
  S.goTo(1, 3); s.run('Alt+ArrowDown'); assert.deepEqual(s.dlg.items.map(it => it.text), ['90', '150'], 'the value list shows what the other filters leave, numbers in order');
  s.run('F G 100 Enter');   // Number Filters › Greater Than… 100, OK
  assert.deepEqual(S.filter.crit[3], { kind: 'custom', op1: 'gt', v1: '100', and: true, op2: null, v2: '' }); assert.deepEqual(visible(S), [3]);
  S.select('A1:C6'); s.run('Ctrl+C'); assert.equal(S.clipboard.h, 2, 'a copy of a filtered list takes the visible rows only'); assert.equal(S.clipboard.data[1][0].value, 'Boston');
  S.goTo(1, 2); s.run('Alt+ArrowDown C'); assert.equal(S.filter.crit[2], undefined); assert.deepEqual(visible(S), [2, 3, 4, 6], 'Clear Filter From "Region": the Washes filter still holds');
  S.goTo(1, 3); s.run('Alt+ArrowDown F W 100 Tab Tab 400 Enter'); assert.deepEqual(visible(S), [3, 4], 'Between 100 and 400');
  s.run('Alt+ArrowDown C Alt+ArrowDown O'); assert.deepEqual([2, 3, 4, 5, 6].map(r => S.value('C' + r)), [610, 420, 300, 150, 90], 'Sort Largest to Smallest sorts the body, the header stays'); assert.equal(S.value('A2'), 'Fresno');
  s.run('Alt+ArrowDown F T'); assert.deepEqual(visible(S), [2, 3, 4, 5, 6], 'Top 10 of five items shows all five'); s.run('Alt+ArrowDown F A'); assert.deepEqual(visible(S), [2, 3], 'Above Average: 610 and 420');
  s.run('Ctrl+Z'); assert.deepEqual(visible(S), [2, 3, 4, 5, 6], 'undo restores the filter state');
  s.run('Alt A T'); assert.equal(S.filter, null); assert.deepEqual(visible(S), [2, 3, 4, 5, 6], 'Filter off clears everything');
  S.goTo(8, 8); s.run('Alt+ArrowDown'); assert.equal(s.dialog, null, 'no drop-down on a plain cell');
  assert.equal(wildMatch('a*n', 'Austin'), true); assert.equal(wildMatch('b?ston', 'Boston'), true); assert.equal(wildMatch('10~*', '10*'), true); assert.equal(wildMatch('a*', 'Boston'), false);
});

test('the Sort dialog (Alt A S S): levels by column, Add Level, orders, My data has headers, and a sort within a filtered list', () => {
  const s = fresh({ ...LIST, D1: { value: 'Day' }, D2: { value: 3 }, D3: { value: 1 }, D4: { value: 2 }, D5: { value: 1 }, D6: { value: 2 } }); const S = s.sheet;
  S.goTo(3, 2); s.run('Alt A S S'); assert.equal(s.dialog, 'sortdlg'); assert.equal(s.dlg.headers, true, 'a text first row over numbers: My data has headers'); assert.deepEqual(s.dlg.levels, [{ col: 2, dir: 'asc' }], 'Sort by starts on the active column');
  assert.deepEqual(s.sortDialogView().levels[0], { col: 2, label: 'Region', dir: 'asc', order: 'A to Z' });
  s.run('Alt+A D Enter');   // Add Level, jump to Day, OK: Region A to Z, then Day Smallest to Largest
  assert.deepEqual([2, 3, 4, 5, 6].map(r => S.value('A' + r)), ['Boston', 'Erie', 'Dallas', 'Fresno', 'Austin']); assert.equal(S.value('A1'), 'Site', 'the header row stays');
  s.run('Alt A S S W Tab Down Enter');   // Sort by Washes, Largest to Smallest
  assert.deepEqual([2, 3, 4, 5, 6].map(r => S.value('C' + r)), [610, 420, 300, 150, 90]);
  s.run('Alt A S S Alt+H Enter'); assert.equal(S.value('A1'), 'Boston', 'headers unticked: the first row sorts too (East, then the Region header, then West)'); s.run('Ctrl+Z');
  s.run('Ctrl+Shift+L'); S.goTo(1, 1); s.run('Alt A S S Tab Down Enter'); assert.deepEqual([2, 3, 4, 5, 6].map(r => S.value('A' + r)), ['Fresno', 'Erie', 'Dallas', 'Boston', 'Austin'], 'inside a filtered list the dialog sorts the list');
  assert.equal(s.dialog, null); assert.equal(s.mode, 'normal');
});
