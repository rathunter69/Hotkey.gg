// app2/tests/workbook.test.js — the workbook layer of the Session (engine/keyboard.js): Go To,
// sheets and the keys between them, the recorded settings behind the Excel Options and Page Setup
// dialogs, the Quick Access Toolbar, and the key-script spellings the lessons will use. Headless.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session, parseKeyScript, parseKeySpec, isSheetName, nextSheetName } from '../engine/keyboard.js';
import { POPULAR_COMMANDS, QAT_COMMANDS, QAT_DEFAULT, OPTIONS_LIVE_PAGES, stepPath, COMMANDS, MENUS, DEAD } from '../engine/ribbon.js';

const fresh = (cells, opts) => { const log = []; const s = new Session(new Sheet({ ...(cells ? { cells } : {}), ...(opts || {}) }), { onKey: k => log.push(k), now: () => 0 }); s.log = log; return s; };
const keys = s => s.keyLog.map(e => e.k);

/* ---------------- Go To ---------------- */
test('Go To: Ctrl+G and F5 open the dialog, a cell reference lands on it, the keys are logged', () => {
  const s = fresh(); const S = s.sheet;
  s.run('Ctrl+G'); assert.equal(s.mode, 'ribbon'); assert.equal(s.dialog, 'goto'); assert.deepEqual(s.path, []); assert.equal(s.dialogBuf, '');
  s.run('"b4" Enter'); assert.equal(S.selectionText(), 'B4'); assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null);
  assert.deepEqual(keys(s), ['Ctrl+G', 'B', '4', '↵']);   // letters upper-cased, the typed keys logged, then ↵
  assert.equal(s.keyLog[0].cell, 'A1'); assert.equal(s.keyLog[3].cell, 'A1');   // logged on the cell the dialog was opened on
  s.run('F5'); assert.equal(s.dialog, 'goto'); s.run('"$C$7" Enter'); assert.equal(S.selectionText(), 'C7'); assert.equal(s.dialog, null);
  assert.deepEqual(keys(s).slice(4), ['F5', '$', 'C', '$', '7', '↵']);
  assert.deepEqual(s.gotoRecent, ['C7', 'B4']);   // Excel's list of previous locations
  s.run('F5 "a1:c3" Enter'); assert.equal(S.selectionText(), 'A1:C3'); assert.deepEqual(S.dispActive(), { r: 1, c: 1 });   // a range: selected, top-left active
  assert.equal(s.mode, 'normal');
  s.run('Ctrl+G "B2:B2" Enter'); assert.equal(S.selectionText(), 'B2'); assert.equal(S.sel, null);
});

test('Go To: an invalid or out-of-sheet reference keeps the dialog open with Excel\'s message; Backspace edits; Esc cancels and logs', () => {
  const s = fresh(undefined, { rows: 20, cols: 10 }); const S = s.sheet;
  s.run('Ctrl+G "hello" Enter'); assert.equal(s.dialog, 'goto'); assert.equal(s.note, 'Reference is not valid.'); assert.equal(s.dialogBuf, 'HELLO'); assert.equal(S.selectionText(), 'A1');
  s.run('Backspace Backspace Backspace Backspace Backspace'); assert.equal(s.dialogBuf, ''); assert.equal(s.note, '');
  s.run('"K5" Enter'); assert.equal(s.note, 'Reference is not valid.'); assert.equal(S.selectionText(), 'A1');   // column K is outside a 10-column sheet
  s.run('"Z99" Enter'); assert.equal(s.note, 'Reference is not valid.');
  s.run('Enter'); assert.equal(s.dialog, 'goto');   // an empty reference is not valid either
  s.run('Escape'); assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null); assert.equal(s.dialogBuf, ''); assert.equal(S.selectionText(), 'A1');
  assert.equal(keys(s).at(-1), 'Esc'); assert.ok(keys(s).includes('⌫'));
  assert.equal(s.goToRef('nope'), false); assert.equal(s.goToRef('B3'), true); assert.equal(S.selectionText(), 'B3');   // the resolver on its own
});

test('Go To: the Ribbon route Alt H F D G opens the same dialog on its menu path, so Esc backs out one level', () => {
  const s = fresh();
  s.run('Alt H F D'); assert.deepEqual(s.path, ['H', 'F', 'D']); assert.equal(s.dialog, null);
  s.run('G'); assert.equal(s.dialog, 'goto'); assert.deepEqual(s.path, ['H', 'F', 'D']);
  s.run('"D2" Enter'); assert.equal(s.sheet.selectionText(), 'D2'); assert.equal(s.mode, 'normal');
  s.run('Alt H F D G Escape'); assert.equal(s.dialog, null); assert.deepEqual(s.path, ['H', 'F', 'D']); assert.equal(s.mode, 'ribbon');
  s.run('Escape Escape Escape Escape'); assert.equal(s.mode, 'normal');
  s.run('Alt H F D F'); assert.match(s.note, /Find/); assert.deepEqual(s.path, ['H', 'F', 'D']);   // a dead item notes and stays put
  assert.equal(COMMANDS.HFDG, 'Go To…'); assert.ok(DEAD.HFDF);
});

test('Go To: a sheet-qualified reference switches sheets first', () => {
  const s = fresh(); s.addSheet('Data'); s.addSheet('My Sheet');
  s.run('Ctrl+G "data!c3" Enter'); assert.equal(s.sheetIndex, 1); assert.equal(s.sheet.selectionText(), 'C3');
  s.run("Ctrl+G \"'My Sheet'!B2:C4\" Enter"); assert.equal(s.sheetIndex, 2); assert.equal(s.sheet.selectionText(), 'B2:C4');
  s.run('Ctrl+G "Nowhere!A1" Enter'); assert.equal(s.dialog, 'goto'); assert.equal(s.note, 'Reference is not valid.'); s.run('Escape');
});

/* ---------------- sheets ---------------- */
test('sheets: the session starts with Sheet1, addSheet appends, switchSheet re-points session.sheet and clamps', () => {
  const s = fresh({ A1: { value: 'one' } }); const first = s.sheet;
  assert.equal(s.sheets.length, 1); assert.equal(s.sheets[0].name, 'Sheet1'); assert.equal(s.sheets[0].sheet, first); assert.equal(s.sheetIndex, 0);
  const two = new Sheet({ cells: { A1: { value: 'two' } } });
  assert.equal(s.addSheet('Data', two), 1); assert.equal(s.addSheet(), 2); assert.equal(s.sheets[2].name, 'Sheet3');
  assert.equal(s.sheet, first);   // adding never switches
  assert.equal(s.switchSheet(1), true); assert.equal(s.sheetIndex, 1); assert.equal(s.sheet, two); assert.equal(s.sheet.value('A1'), 'two');
  assert.equal(s.switchSheet(1), false);   // already there
  assert.equal(s.switchSheet(99), true); assert.equal(s.sheetIndex, 2); assert.equal(s.switchSheet(-5), true); assert.equal(s.sheetIndex, 0); assert.equal(s.sheet, first);
  // keys act on the active sheet; the log names its cell
  s.switchSheet(1); s.run('"x" Enter'); assert.equal(two.value('A1'), 'x'); assert.equal(first.value('A1'), 'one'); assert.equal(s.keyLog.at(-1).cell, 'A1');
  // a change on the new sheet reaches the session's listeners
  let seen = 0; s.onChange(w => { if (w === 'sheet') seen++; }); two.commit('edit'); assert.ok(seen >= 1);
});

test('sheets: names must be Excel-legal and unique; the default name is the next free Sheet<n>', () => {
  assert.equal(isSheetName('Sheet1'), true); assert.equal(isSheetName('My Sheet'), true); assert.equal(isSheetName('a'.repeat(31)), true);
  for (const bad of ['', '   ', 'a'.repeat(32), 'A/B', 'A\\B', 'A:B', 'A*B', 'A?B', 'A[B', 'A]B']) assert.equal(isSheetName(bad), false, JSON.stringify(bad));
  assert.equal(nextSheetName([{ name: 'Sheet1' }]), 'Sheet2'); assert.equal(nextSheetName([{ name: 'Sheet1' }, { name: 'Sheet2' }]), 'Sheet3');
  assert.equal(nextSheetName([{ name: 'Sheet1' }, { name: 'sheet2' }]), 'Sheet3');   // case-insensitive, like Excel
  const s = fresh();
  assert.throws(() => s.addSheet('Bad/Name'), /not a legal sheet name/);
  assert.throws(() => s.addSheet('sheet1'), /already exists/);
  assert.equal(s.sheets.length, 1);
  s.sheets[0].name = 'Inputs'; assert.equal(s.addSheet(), 1); assert.equal(s.sheets[1].name, 'Sheet2');   // the runner may rename the first sheet
});

test('sheets: Ctrl+PgDn / Ctrl+PgUp step without wrapping and always log; an open edit or walk is dropped first', () => {
  const s = fresh(); s.addSheet('Two'); s.addSheet('Three');
  s.run('Ctrl+PgDn'); assert.equal(s.sheetIndex, 1); s.run('Ctrl+PgDn'); assert.equal(s.sheetIndex, 2);
  s.run('Ctrl+PgDn'); assert.equal(s.sheetIndex, 2);   // no wrap at the end
  s.run('Ctrl+PgUp Ctrl+PgUp Ctrl+PgUp'); assert.equal(s.sheetIndex, 0);
  assert.deepEqual(keys(s), ['Ctrl+PgDn', 'Ctrl+PgDn', 'Ctrl+PgDn', 'Ctrl+PgUp', 'Ctrl+PgUp', 'Ctrl+PgUp']);
  s.run('Ctrl+PageDown'); assert.equal(s.sheetIndex, 1); assert.equal(keys(s).at(-1), 'Ctrl+PgDn');   // either spelling in a script
  s.run('"abc"'); assert.equal(s.editing, true); s.run('Ctrl+PgDn'); assert.equal(s.editing, false); assert.equal(s.sheetIndex, 2); assert.equal(s.sheets[1].sheet.value('A1'), 'abc');   // Enter mode: the entry commits, then the sheet changes (Excel)
  s.run('Ctrl+PgUp F2 Ctrl+PgDn'); assert.equal(s.editing, true); assert.equal(s.sheetIndex, 1); s.run('Escape');   // Edit mode (F2) swallows it
  s.run('"=" Down Ctrl+PgDn'); assert.equal(s.editing, true); assert.equal(s.sheetIndex, 1); s.run('Escape');           // so does point mode
  s.run('Alt H'); assert.equal(s.mode, 'ribbon'); s.run('Ctrl+PgUp'); assert.equal(s.mode, 'ribbon');   // a dialog-less walk swallows the chord (Excel ignores it too)
  s.run('Escape Escape'); s.run('Ctrl+PgDn'); assert.equal(s.mode, 'normal'); assert.equal(s.sheetIndex, 2); s.run('Ctrl+PgUp'); assert.equal(s.sheetIndex, 1);
  // Shift+F11 inserts a sheet before the active one and goes to it
  s.run('Shift+F11'); assert.equal(s.sheets.length, 4); assert.equal(s.sheetIndex, 1); assert.equal(s.sheets[1].name, 'Sheet4'); assert.equal(keys(s).at(-1), 'Shift+F11');
  assert.equal(s.sheets[2].name, 'Two');
});

test('page keys: PageDown / PageUp move by the view\'s screenful (10 rows until it says), Alt+PgDn / PgUp a screen sideways', () => {
  const s = fresh(); const S = s.sheet;
  s.run('PageDown'); assert.equal(S.selectionText(), 'A11'); s.run('PageUp'); assert.equal(S.selectionText(), 'A1');
  s.pageRows = 25; s.run('PageDown'); assert.equal(S.selectionText(), 'A26'); s.run('Shift+PageDown'); assert.equal(S.selectionText(), 'A26:A51');
  s.pageCols = 8; s.run('Ctrl+Home Alt+PgDn'); assert.equal(S.selectionText(), 'I1'); s.run('Alt+PgUp'); assert.equal(S.selectionText(), 'A1');
  assert.deepEqual(keys(s), ['PageDown', 'PageUp', 'PageDown', 'Shift+PageDown', 'Ctrl+Home', 'Alt+PgDn', 'Alt+PgUp']);
});

/* ---------------- Excel Options ---------------- */
test('settings: the recorded shape, gridlines mirroring the active sheet both ways', () => {
  const s = fresh();
  assert.deepEqual(JSON.parse(JSON.stringify(s.settings)), { calcMode: 'automatic', iterative: false, maxIterations: 100, maxChange: 0.001, gridlines: true, qat: ['save', 'undo', 'redo'], pageSetup: { orientation: 'portrait', scaling: 'adjust', adjustTo: 100, fitWide: 1, fitTall: 1 } });
  assert.deepEqual(s.settings.qat, QAT_DEFAULT); assert.notEqual(s.settings.qat, QAT_DEFAULT);   // a copy
  s.run('Alt W V G'); assert.equal(s.sheet.gridlines, false); assert.equal(s.settings.gridlines, false);
  s.settings.gridlines = true; assert.equal(s.sheet.gridlines, true);
  s.sheet.gridlines = false; assert.equal(s.settings.gridlines, false);
  s.addSheet('Two'); s.switchSheet(1); assert.equal(s.settings.gridlines, true);   // per worksheet, as in Excel
});

test('Options: Alt F opens the backstage (Options live, the rest dead), Alt F T opens the Formulas page, M then ↵ records Manual', () => {
  const s = fresh();
  s.run('Alt F'); assert.deepEqual(s.path, ['F']); assert.equal(s.dialog, null);
  assert.deepEqual(stepPath(['F'], 'T'), { kind: 'command', np: 'FT' }); assert.equal(stepPath(['F'], 'S').kind, 'dead'); assert.match(stepPath(['F'], 'S').note, /Save/);
  s.run('S'); assert.match(s.note, /Save/); assert.deepEqual(s.path, ['F']);
  s.run('T'); assert.equal(s.dialog, 'options'); assert.equal(s.mode, 'ribbon'); assert.deepEqual(s.path, ['F']);
  assert.equal(s.dlg.page, 'formulas'); assert.equal(s.dlg.focus, 'pages'); assert.equal(s.dlg.calcMode, 'automatic');
  s.run('M'); assert.equal(s.dlg.calcMode, 'manual'); assert.equal(s.settings.calcMode, 'automatic');   // a draft until OK
  s.run('Enter'); assert.equal(s.settings.calcMode, 'manual'); assert.equal(s.dialog, null); assert.equal(s.mode, 'normal'); assert.equal(s.dlg, null);
  assert.deepEqual(keys(s), ['Alt', 'F', 'S', 'T', 'M', '↵']);
  s.run('Alt F T A Enter'); assert.equal(s.settings.calcMode, 'automatic');
  s.run('Alt F T M Escape'); assert.equal(s.settings.calcMode, 'automatic'); assert.equal(s.dialog, null); assert.deepEqual(s.path, ['F']);   // Cancel discards and returns to the backstage
  assert.equal(keys(s).at(-1), 'Esc'); s.run('Escape Escape'); assert.equal(s.mode, 'normal');
  for (const np of ['FI', 'FN', 'FO', 'FS', 'FA', 'FP', 'FH', 'FE', 'FC', 'FD']) assert.ok(DEAD[np], np);
  assert.equal(MENUS.F.length, 11);
});

test('Options › Formulas: the calc radio by letters and arrows, iterative calculation and its fields by Tab and digits', () => {
  const s = fresh();
  s.run('Alt F T'); s.run('Down'); assert.equal(s.dlg.page, 'advanced');   // ↓ on the page list moves between the live pages
  s.run('Down'); assert.equal(s.dlg.page, 'qat'); s.run('Down'); assert.equal(s.dlg.page, 'qat'); s.run('Up Up'); assert.equal(s.dlg.page, 'formulas'); s.run('Up'); assert.equal(s.dlg.page, 'formulas');
  s.run('F'); assert.equal(s.dlg.focus, 'calc');   // the page letter jumps into the page
  s.run('Down'); assert.equal(s.dlg.calcMode, 'manual'); s.run('Up'); assert.equal(s.dlg.calcMode, 'automatic');
  s.run('Tab'); assert.equal(s.dlg.focus, 'iter'); s.run('Tab'); assert.equal(s.dlg.focus, 'pages');   // the fields are skipped while iterative is off
  s.run('I'); assert.equal(s.dlg.iterative, true); assert.equal(s.dlg.focus, 'iter');
  s.run('Space'); assert.equal(s.dlg.iterative, false); s.run('Space'); assert.equal(s.dlg.iterative, true);
  s.run('Tab'); assert.equal(s.dlg.focus, 'maxIter'); s.run('Backspace Backspace Backspace 250'); assert.equal(s.dlg.maxIterations, '250');
  s.run('Tab'); assert.equal(s.dlg.focus, 'maxChange'); s.run('Backspace Backspace Backspace Backspace Backspace "0.01"'); assert.equal(s.dlg.maxChange, '0.01');
  s.run('Shift+Tab'); assert.equal(s.dlg.focus, 'maxIter'); s.run('X'); assert.equal(s.dlg.focus, 'maxIter'); s.run('C'); assert.equal(s.dlg.focus, 'maxChange');
  s.run('Enter');
  assert.equal(s.settings.iterative, true); assert.equal(s.settings.maxIterations, 250); assert.equal(s.settings.maxChange, 0.01); assert.equal(s.settings.calcMode, 'automatic');
  assert.deepEqual(keys(s).slice(0, 8), ['Alt', 'F', 'T', '↓', '↓', '↓', '↑', '↑']); assert.ok(keys(s).includes('Tab') && keys(s).includes('Space') && keys(s).includes('2'));
  // a blank or silly number keeps the previous value on OK
  s.run('Alt F T I I Tab Backspace Backspace Backspace Enter'); assert.equal(s.settings.maxIterations, 250); assert.equal(s.settings.iterative, true);
  s.run('Alt F T I Enter'); assert.equal(s.settings.iterative, false);
});

test('Options › Advanced: G toggles gridlines in the draft; OK writes it to the sheet, Cancel does not', () => {
  const s = fresh();
  s.run('Alt F T V'); assert.equal(s.dlg.page, 'advanced'); assert.equal(s.dlg.focus, 'gridlines'); assert.equal(s.dlg.gridlines, true);
  s.run('G'); assert.equal(s.dlg.gridlines, false); assert.equal(s.sheet.gridlines, true);
  s.run('Escape'); assert.equal(s.sheet.gridlines, true); assert.equal(s.settings.gridlines, true); s.run('Escape Escape');
  s.run('Alt F T V G Enter'); assert.equal(s.sheet.gridlines, false); assert.equal(s.settings.gridlines, false);
  s.run('Alt F T V Tab Tab Space Enter'); assert.equal(s.sheet.gridlines, true);   // V focuses the box; Tab to the page list and back, Space toggles
  s.run('Alt W V G'); assert.equal(s.settings.gridlines, false);
  s.run('Alt F T V'); assert.equal(s.dlg.gridlines, false); s.run('Escape Escape Escape');
});

test('Options › Quick Access Toolbar: ↑↓ move the highlight, A adds, R removes, Tab switches lists, OK records', () => {
  const s = fresh();
  s.run('Alt F T Q'); assert.equal(s.dlg.page, 'qat'); assert.equal(s.dlg.focus, 'qatLeft'); assert.equal(s.dlg.qatPick, 0);
  const bold = POPULAR_COMMANDS.indexOf('bold'); assert.ok(bold > 0);
  s.run('Down'.repeat(1).trim()); for (let i = 1; i < bold; i++) s.run('Down');
  assert.equal(POPULAR_COMMANDS[s.dlg.qatPick], 'bold');
  s.run('A'); assert.deepEqual(s.dlg.qat, ['save', 'undo', 'redo', 'bold']); assert.equal(s.dlg.qatSel, 3); assert.deepEqual(s.settings.qat, ['save', 'undo', 'redo']);
  s.run('Tab'); assert.equal(s.dlg.focus, 'qatRight'); s.run('Up Up Up'); assert.equal(s.dlg.qatSel, 0); s.run('Up'); assert.equal(s.dlg.qatSel, 0);
  s.run('R'); assert.deepEqual(s.dlg.qat, ['undo', 'redo', 'bold']); assert.equal(s.dlg.qatSel, 0);
  s.run('Tab'); assert.equal(s.dlg.focus, 'pages'); s.run('Tab'); assert.equal(s.dlg.focus, 'qatLeft');
  s.run('Enter'); assert.deepEqual(s.settings.qat, ['undo', 'redo', 'bold']); assert.equal(s.mode, 'normal');
  assert.equal(s.dialogSet('qatPick', 2), false);   // no dialog open
  s.run('Alt F T Q'); assert.equal(s.dialogSet('qatPick', 2), true); assert.equal(s.dlg.qatPick, 2); assert.equal(s.dialogSet('qatSel', 1), true); assert.equal(s.dlg.focus, 'qatRight');
  assert.equal(s.dialogSet('page', 'advanced'), true); assert.equal(s.dlg.page, 'advanced'); assert.equal(s.dialogSet('page', 'general'), false);
  assert.equal(s.dialogSet('focus', 'gridlines'), true); assert.equal(s.dialogSet('focus', 'nope'), false);
  s.run('Escape Escape Escape'); assert.equal(s.mode, 'normal');
  s.run('Alt F T Q'); for (let i = 0; i < POPULAR_COMMANDS.length + 3; i++) s.run('Down'); assert.equal(s.dlg.qatPick, POPULAR_COMMANDS.length - 1);   // clamped
  s.run('Tab R R R Tab Tab Tab R'); assert.deepEqual(s.dlg.qat, []); s.run('Escape Escape Escape');
  assert.deepEqual(s.settings.qat, ['undo', 'redo', 'bold']);
  for (const id of POPULAR_COMMANDS) assert.ok(QAT_COMMANDS[id] && QAT_COMMANDS[id].label, id);
  assert.deepEqual(OPTIONS_LIVE_PAGES, ['formulas', 'advanced', 'qat']);
});

/* ---------------- Page Setup ---------------- */
test('Page Setup: Alt P S P opens the dialog; T/L, A/F, digits and Tab edit the draft; OK records, Cancel discards', () => {
  const s = fresh();
  s.run('Alt P'); assert.deepEqual(s.path, ['P']); s.run('S'); assert.deepEqual(s.path, ['P', 'S']); s.run('P');
  assert.equal(s.dialog, 'pagesetup'); assert.deepEqual(s.path, ['P', 'S']); assert.equal(s.dlg.focus, 'orient'); assert.equal(s.dlg.orientation, 'portrait');
  s.run('L'); assert.equal(s.dlg.orientation, 'landscape'); assert.equal(s.settings.pageSetup.orientation, 'portrait');
  s.run('Enter'); assert.equal(s.settings.pageSetup.orientation, 'landscape'); assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null);
  assert.deepEqual(keys(s), ['Alt', 'P', 'S', 'P', 'L', '↵']);
  s.run('Alt P S P T Escape'); assert.equal(s.settings.pageSetup.orientation, 'landscape'); assert.deepEqual(s.path, ['P', 'S']); s.run('Escape Escape Escape'); assert.equal(s.mode, 'normal');
  s.run('Alt P S P Down'); assert.equal(s.dlg.orientation, 'landscape'); s.run('Up'); assert.equal(s.dlg.orientation, 'portrait');
  s.run('A'); assert.equal(s.dlg.scaling, 'adjust'); assert.equal(s.dlg.focus, 'adjustTo'); s.run('Backspace Backspace Backspace 80'); assert.equal(s.dlg.adjustTo, '80');
  s.run('Up Up'); assert.equal(s.dlg.adjustTo, '82');   // the spinner
  s.run('F'); assert.equal(s.dlg.scaling, 'fit'); assert.equal(s.dlg.focus, 'fitWide'); s.run('Backspace 2'); assert.equal(s.dlg.fitWide, '2');
  s.run('Tab'); assert.equal(s.dlg.focus, 'fitTall'); s.run('Backspace 3'); assert.equal(s.dlg.fitTall, '3'); s.run('Tab'); assert.equal(s.dlg.focus, 'orient'); s.run('Shift+Tab'); assert.equal(s.dlg.focus, 'fitTall');
  s.run('Enter'); assert.deepEqual(s.settings.pageSetup, { orientation: 'portrait', scaling: 'fit', adjustTo: 82, fitWide: 2, fitTall: 3 });
  s.run('Alt P S P A Backspace Backspace 5 Enter'); assert.equal(s.settings.pageSetup.adjustTo, 10);   // clamped to Excel's 10..400
  s.run('Alt P S P F Backspace Enter'); assert.equal(s.settings.pageSetup.fitWide, 2);   // a blank field keeps its value
  // Orientation ▾ on the tab itself, and the dead Page Layout items
  s.run('Alt P O L'); assert.equal(s.settings.pageSetup.orientation, 'landscape'); assert.equal(s.mode, 'normal');
  s.run('Alt P O P'); assert.equal(s.settings.pageSetup.orientation, 'portrait');
  s.run('Alt P M'); assert.match(s.note, /Margins/); assert.deepEqual(s.path, ['P']); s.run('Escape Escape');
  assert.equal(COMMANDS.PSP, 'Page Setup…'); assert.equal(COMMANDS.POL, 'Landscape');
});

/* ---------------- the Quick Access Toolbar ---------------- */
test('QAT: Alt then a digit runs that toolbar entry; a command the engine lacks is a logged no-op', () => {
  const s = fresh({ A1: { value: 'x' } }); const S = s.sheet;
  s.run('Alt 1'); assert.equal(s.mode, 'normal'); assert.deepEqual(keys(s), ['Alt', '1']);   // Save: nothing to do
  s.run('"y" Enter'); assert.equal(S.value('A1'), 'y'); s.run('Alt 2'); assert.equal(S.value('A1'), 'x'); s.run('Alt 3'); assert.equal(S.value('A1'), 'y');   // Undo, Redo
  s.run('Alt 4'); assert.equal(s.mode, 'ribbon'); assert.deepEqual(s.path, []); s.run('Escape');   // no fourth entry: the walk stays open
  s.settings.qat = ['bold', 'copy', 'fillColor']; s.run('Ctrl+Home Alt 1'); assert.equal(S.cellAt('A1').bold, true); assert.equal(s.mode, 'normal');
  s.run('Alt 2'); assert.ok(S.clipboard); s.run('Escape');
  s.run('Alt 3'); assert.equal(s.dialog, 'fillcolor'); s.run('Escape');   // a dialog command opens its dialog
  assert.equal(s.runQat('nope'), false); assert.equal(s.runQat('formatPainter'), false); assert.equal(s.runQat('bold'), true); assert.equal(S.cellAt('A1').bold, false);
  s.run('Alt F T Q A Enter'); assert.deepEqual(s.settings.qat, ['bold', 'copy', 'fillColor', POPULAR_COMMANDS[0]]);
});

/* ---------------- scripts ---------------- */
test('parseKeyScript accepts every workbook key the lessons will write', () => {
  assert.deepEqual(parseKeyScript('Ctrl+G "B4" Enter F5 Ctrl+PgDn Ctrl+PgUp Ctrl+PageDown Alt+PgDn Shift+F11 F9'),
    [{ type: 'press', spec: 'Ctrl+G' }, { type: 'text', text: 'B4' }, { type: 'press', spec: 'Enter' }, { type: 'press', spec: 'F5' }, { type: 'press', spec: 'Ctrl+PgDn' }, { type: 'press', spec: 'Ctrl+PgUp' },
      { type: 'press', spec: 'Ctrl+PageDown' }, { type: 'press', spec: 'Alt+PgDn' }, { type: 'press', spec: 'Shift+F11' }, { type: 'press', spec: 'F9' }]);
  assert.deepEqual(parseKeySpec('Ctrl+PgDn'), { key: 'PageDown', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false, code: '' });
  assert.equal(parseKeySpec('Ctrl+G').key, 'g'); assert.equal(parseKeySpec('F5').key, 'F5'); assert.equal(parseKeySpec('Shift+F11').key, 'F11');
  assert.deepEqual(parseKeyScript('Alt F T M Enter'), ['Alt', 'F', 'T', 'M', 'Enter'].map(spec => ({ type: 'press', spec })));
  assert.deepEqual(parseKeyScript('Alt+F T'), [{ type: 'press', spec: 'Alt' }, { type: 'press', spec: 'F' }, { type: 'press', spec: 'T' }]);
  const s = fresh(); s.run('F9'); assert.deepEqual(keys(s), ['F9']); assert.equal(s.mode, 'normal');
});
