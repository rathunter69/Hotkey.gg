// The Data tab's tools (Chapters 3 to 5): AutoFilter and its header menu, the Sort dialog,
// Remove Duplicates, Data Validation lists, Text to Columns, Flash Fill, Edit Links,
// Goal Seek and data tables. Keys as desktop Excel has them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { wildMatch, DUPLICATES_NOTE, NO_DUPLICATES_NOTE, VALIDATION_NOTE } from '../engine/tools.js';

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

test('Remove Duplicates (Alt A M): the ticked columns define a duplicate, the first stays, the rest shift up, and the count is reported', () => {
  const s = fresh({ A1: { value: 'Site' }, B1: { value: 'Date' }, A2: { value: 'AUS-DOM' }, B2: { value: 1 }, A3: { value: 'aus-dom' }, B3: { value: 2 }, A4: { value: 'AUS-MUE' }, B4: { value: 1 }, A5: { value: 'AUS-DOM' }, B5: { value: 1 }, A6: { value: 'AUS-DMO' }, B6: { value: 3 }, C6: { formula: '=B6*2' } }); const S = s.sheet;
  S.goTo(2, 1); s.run('Alt A M'); assert.equal(s.dialog, 'removedup'); assert.equal(s.dlg.headers, true); assert.deepEqual(s.removeDuplicatesView().columns.map(c => c.label + (c.checked ? '*' : '')), ['Site*', 'Date*', 'Column C*']);
  s.run('Enter');   // both columns ticked: a row goes only when the pair repeats
  assert.deepEqual([2, 3, 4, 5, 6].map(r => S.value('A' + r)), ['AUS-DOM', 'aus-dom', 'AUS-MUE', 'AUS-DMO', null]); assert.equal(S.formula('C5'), '=B5*2', 'a moved formula follows its row'); assert.deepEqual(s.toasts, [DUPLICATES_NOTE(1, 4)]);
  s.run('Ctrl+Z'); S.goTo(2, 1); s.run('Alt A M Alt+U Space Enter');   // Site alone ticked: every later row for a site goes, case-insensitively
  assert.deepEqual([2, 3, 4, 5, 6].map(r => S.value('A' + r)), ['AUS-DOM', 'AUS-MUE', 'AUS-DMO', null, null]); assert.equal(s.toasts[1], DUPLICATES_NOTE(2, 3));
  s.run('Alt A M Enter'); assert.equal(s.toasts[2], NO_DUPLICATES_NOTE); assert.equal(s.mode, 'normal');
});

test('Data Validation (Alt A V V): a list from a range or a name with the Alt+Down drop-down, the Stop alert with Retry and Cancel, a whole-number limit, a custom message', () => {
  const s = fresh({ A1: { value: 'Base' }, A2: { value: 'Management' }, A3: { value: 'Downside' } }); const S = s.sheet;
  S.goTo(1, 4); s.run('Alt A V V'); assert.equal(s.dialog, 'validation'); assert.equal(s.dlg.allow, 'any');
  s.run('L Alt+S "=$A$1:$A$3" Enter'); assert.equal(s.dialog, null); assert.deepEqual({ allow: S.validation.D1.allow, source: S.validation.D1.source }, { allow: 'list', source: '=$A$1:$A$3' });
  s.run('Alt+ArrowDown'); assert.equal(s.dialog, 'dvlist'); assert.deepEqual(s.dlg.items, ['Base', 'Management', 'Downside']);
  s.run('Down Enter'); assert.equal(S.value('D1'), 'Management'); assert.equal(s.mode, 'normal');
  s.run('"Mangement" Enter'); assert.equal(s.dialog, 'dvalert'); assert.equal(s.editing, true); assert.equal(s.dvPend.message, VALIDATION_NOTE);
  s.run('Enter'); assert.equal(s.dialog, null); assert.equal(s.editing, true, 'Retry keeps the entry to fix'); assert.equal(s.editBuf, 'Mangement');
  s.run('Escape'); assert.equal(s.editing, false); assert.equal(S.value('D1'), 'Management');
  s.run('"Mangement" Enter Escape'); assert.equal(s.editing, false, 'Cancel on the alert discards the entry'); assert.equal(S.value('D1'), 'Management');
  s.run('"downside" Enter'); assert.equal(S.value('D1'), 'downside', 'a list matches case-insensitively and keeps what was typed');
  S.goTo(1, 4); s.run('Delete'); assert.equal(S.value('D1'), null, 'Ignore blank: clearing is allowed');
  s.names = { Cases: 'Sheet1!$A$1:$A$3' }; S.goTo(2, 4); s.run('Alt A V V L Alt+S "=Cases" Enter'); s.run('Alt+ArrowDown'); assert.deepEqual(s.dlg.items, ['Base', 'Management', 'Downside'], 'a named list'); s.run('Escape');
  // a whole number between 100 and 600, with a custom error message on the Error Alert tab
  S.goTo(3, 4); s.run('Alt A V V W Alt+M 100 Alt+X 600 Ctrl+PageDown Ctrl+PageDown Alt+E "Washes a day: 100 to 600" Enter');
  assert.deepEqual([S.validation.D3.allow, S.validation.D3.min, S.validation.D3.max, S.validation.D3.errMsg], ['whole', '100', '600', 'Washes a day: 100 to 600']);
  s.run('"50" Enter'); assert.equal(s.dialog, 'dvalert'); assert.equal(s.dvPend.message, 'Washes a day: 100 to 600'); s.run('Escape');
  s.run('"250.5" Enter'); assert.equal(s.dialog, 'dvalert', 'a decimal fails a whole-number rule'); s.run('Escape');
  s.run('"250" Enter'); assert.equal(S.value('D3'), 250); s.run('Up "=125*4" Enter'); assert.equal(S.value('D3'), 500, 'a formula is judged by its result');
  S.goTo(3, 4); s.run('Alt A V V Alt+C Enter'); assert.equal(S.validation.D3, undefined, 'Clear All removes the rule');
  s.run('Ctrl+Z'); assert.ok(S.validation.D3, 'undo brings the rule back');
});

test('Data Validation: a Warning alert lets the entry in on Yes, No goes back to it; the rules survive toJSON', () => {
  const s = fresh({}); const S = s.sheet;
  s.run('Alt A V V W Alt+M 1 Alt+X 10 Ctrl+PageDown Ctrl+PageDown Down Enter'); assert.equal(S.validation.A1.errStyle, 'warning');
  s.run('"50" Enter'); assert.equal(s.dialog, 'dvalert'); s.run('N'); assert.equal(s.editing, true); assert.equal(s.dialog, null);
  s.run('Enter'); assert.equal(s.dialog, 'dvalert'); s.run('Enter'); assert.equal(S.value('A1'), 50, 'Yes keeps the entry'); assert.equal(s.editing, false);
  const back = new Sheet(JSON.parse(JSON.stringify(S.toJSON()))); assert.equal(back.validation.A1.max, '10');
});

test('Text to Columns (Alt A E): Delimited by comma, a Text column, Do not import, the overwrite question; Fixed width with the suggested breaks', async () => {
  const { TTC_OVERWRITE_NOTE } = await import('../engine/tools.js');
  const s = fresh({ A1: { value: 'AUS-DOM,Austin,0042' }, A2: { value: 'AUS-MUE,Austin,0107' }, A3: { value: 'DAL-ELM,Dallas,0009' }, B1: { value: 'x' } }); const S = s.sheet;
  S.select('A1:A3'); s.run('Alt A E'); assert.equal(s.dialog, 'texttocols'); assert.equal(s.dlg.step, 1);
  s.run('Enter Alt+T Alt+C'); assert.deepEqual(s.textToColumnsView().rows[0], ['AUS-DOM', 'Austin', '0042']);
  s.run('Enter Right Right Alt+T Left Alt+I'); assert.deepEqual(s.textToColumnsView().formats, ['general', 'skip', 'text']);
  s.run('Enter'); assert.equal(s.dlg.confirm, true, 'B1 holds data: Excel asks'); assert.equal(s.note, TTC_OVERWRITE_NOTE);
  s.run('Enter'); assert.equal(s.dialog, null);
  assert.deepEqual(['A1', 'B1', 'A3', 'B3'].map(k => S.value(k)), ['AUS-DOM', '0042', 'DAL-ELM', '0009'], 'the city skipped; the code kept as text, zeros and all');
  assert.equal(S.cellAt('B2').txt, true);
  s.run('Ctrl+Z'); assert.equal(S.value('A1'), 'AUS-DOM,Austin,0042', 'one undo step');
  const t = fresh({ A1: { value: 'AUS 120 4.5' }, A2: { value: 'DAL 95  3.9' } }); const T = t.sheet;
  T.select('A1:A2'); t.run('Alt A E Alt+W Alt+N'); assert.deepEqual(t.dlg.breaks, [4, 8]); t.run('Alt+F');
  assert.deepEqual(['A1', 'B1', 'C1', 'A2', 'B2', 'C2'].map(k => T.value(k)), ['AUS', 120, 4.5, 'DAL', 95, 3.9]);
});

test('Flash Fill (Ctrl+E): one example beside the data fills the column; a header is left out; no pattern is Excel\'s note', async () => {
  const { FLASH_FILL_NONE_NOTE } = await import('../engine/tools.js');
  const s = fresh({ A1: { value: 'Site' }, B1: { value: 'Manager' }, C1: { value: 'Code' },
    A2: { value: 'aus-dom' }, B2: { value: 'Maria Lopez' }, C2: { value: 'AUS-DOM (Lopez)' },
    A3: { value: 'aus-mue' }, B3: { value: 'Tom Reed' }, A4: { value: 'dal-elm' }, B4: { value: 'Ana Ruiz' } }); const S = s.sheet;
  S.goTo(3, 3); s.run('Ctrl+E');
  assert.deepEqual([S.value('C3'), S.value('C4')], ['AUS-MUE (Reed)', 'DAL-ELM (Ruiz)']);
  s.run('Ctrl+Z'); assert.equal(S.value('C3'), null);
  S.goTo(3, 3); s.run('Alt A F'); assert.equal(S.value('C4'), 'DAL-ELM (Ruiz)', 'Data › Flash Fill does the same');
  const t = fresh({ A1: { value: 'abc' }, A2: { value: 'def' } }); t.sheet.goTo(1, 2); t.run('Ctrl+E'); assert.equal(t.toasts.at(-1), FLASH_FILL_NONE_NOTE);
});

test('Edit Links (Alt A K): the other workbooks the formulas read, their kept values, Change Source and Break Link', async () => {
  const { NO_LINKS_NOTE, BREAK_LINKS_NOTE } = await import('../engine/tools.js');
  const s = fresh({}); const S = s.sheet;
  s.run('Alt A K'); assert.equal(s.toasts.at(-1), NO_LINKS_NOTE); assert.equal(s.mode, 'normal');
  s.setExternalValues('Seller Model.xlsx', 'P&L', { C10: 4200 }); s.setExternalValues('Budget.xlsx', 'Annual', { C10: 125 });
  S.commitInput("='[Seller Model.xlsx]P&L'!C10*2", 1, 1); S.commitInput('=[Budget.xlsx]Annual!C10+1', 2, 1); S.commitInput('=A1+A2', 3, 1);
  assert.deepEqual([S.value('A1'), S.value('A2'), S.value('A3')], [8400, 126, 8526]);
  s.run('Alt A K'); assert.equal(s.dialog, 'editlinks'); assert.deepEqual(s.dlg.list.map(x => x.file), ['Seller Model.xlsx', 'Budget.xlsx']);
  s.run('Down Alt+N "Budget v2.xlsx" Enter'); assert.equal(S.formula('A2'), "='[Budget v2.xlsx]Annual'!C10+1"); assert.equal(S.value('A2'), 126, 'the kept values move with the source');
  s.run('Up Alt+B'); assert.equal(s.note, BREAK_LINKS_NOTE); s.run('Enter');
  assert.equal(S.formula('A1'), null); assert.equal(S.value('A1'), 8400, 'the formula became its value'); assert.equal(S.formula('A3'), '=A1+A2');
  assert.deepEqual(s.dlg.list.map(x => x.file), ['Budget v2.xlsx']); s.run('Escape'); assert.equal(s.dialog, null);
  S.commitInput('=[Nowhere.xlsx]Sheet1!A1', 4, 1); assert.equal(S.value('A4'), '#REF!', 'a link with no kept value');
});
