// app2/tests/section1.test.js — Chapter 1, section 1 "How Excel works": the five lessons' own
// checks beyond the generic lesson tests (lessons.test.js validates the format, replays the solution
// and every hint). Here: the workbooks the sheet lessons build, what each mechanic goal accepts and
// refuses (Go To by the dialog box, the sheet keys, the sheet commands and their confirm card, an
// open Ribbon tab, the recorded settings), and the end states that keep a lesson open when a landed
// goal is undone or flipped back. Headless.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, LESSONS, LESSONS_BY_ID, sectionsOf } from '../content/index.js';
import { CONCEPTS } from '../content/schema.js';
import { LessonRun } from '../app/runner.js';

const S1 = ['workbook-sheets-cells', 'managing-sheets', 'ribbon-and-keytips', 'excel-options', 'page-setup'];
// the prerequisite each section-1 lesson names: a chain from the Welcome race, with the sheet lesson a side branch off the workbook lesson
const PREREQ = { 'workbook-sheets-cells': 'welcome-race', 'managing-sheets': 'workbook-sheets-cells', 'ribbon-and-keytips': 'workbook-sheets-cells', 'excel-options': 'ribbon-and-keytips', 'page-setup': 'excel-options' };
const byId = id => { const l = LESSONS_BY_ID[id]; assert.ok(l, `${id} is in the catalogue`); return l; };
const fresh = id => new LessonRun(byId(id), { now: () => 0 });
const namesOf = run => run.session.sheets.map(s => s.name);

test('section 1: five free lessons in "How Excel works", right after the Welcome race, each on a prerequisite that comes earlier', () => {
  const ch = CHAPTERS.find(c => c.id === 'foundations');
  const sec = sectionsOf(ch).find(g => g.name === 'How Excel works');
  assert.deepEqual(sec.lessons.map(l => l.id), S1);
  const i0 = LESSONS.findIndex(l => l.id === 'welcome-race');   // the legacy block starts here mid-rewrite
  assert.deepEqual(LESSONS.slice(i0, i0 + 7).map(l => l.id), ['welcome-race', ...S1, 'active-cell']);
  for (const id of S1) {
    const l = byId(id);
    assert.equal(l.access, 'free', `${id} is free`); assert.equal(l.section, 'How Excel works');
    assert.deepEqual(l.prerequisites, [PREREQ[id]], `${id} follows ${PREREQ[id]}`);
    assert.ok(l.goals.length >= 3 && l.goals.length <= 5, `${id}: 3-5 goals`);
  }
  // every concept the section adds has a gloss and is taught by one of its lessons
  for (const c of ['workbook', 'sheet-tabs', 'go-to', 'sheet-reference', 'rename-sheet', 'insert-sheet', 'delete-sheet', 'move-sheet', 'ribbon-tabs', 'gridlines', 'excel-options', 'calc-mode', 'iterative-calc', 'quick-access-toolbar', 'calculate-now', 'page-setup', 'orientation', 'fit-to-page', 'font-color', 'input-colour-convention']) {
    assert.ok(CONCEPTS[c], `${c} has a gloss`);
    assert.ok(S1.some(id => byId(id).concepts.includes(c)), `${c} is taught in section 1`);
  }
});

/* ---------------- lesson 1: workbook, sheets and cells ---------------- */

test('lesson 1: the run is a two-sheet workbook, Sales first and Costs with its own cells, rebuilt on reset', () => {
  const run = fresh('workbook-sheets-cells');
  assert.deepEqual(namesOf(run), ['Sales', 'Costs']);
  assert.equal(run.session.sheetIndex, 0); assert.equal(run.sheet.value('A1'), 'Weekly Sales Report'); assert.equal(run.sheet.value('C4'), 31);
  const costs = run.session.sheets[1].sheet;
  assert.equal(costs.value('A1'), 'Weekly Costs'); assert.equal(costs.value('B3'), 640); assert.equal(costs.colW[1], 84);
  run.run('Ctrl+PgDn "x" Enter'); assert.equal(costs.value('A1'), 'x');
  run.reset();
  assert.deepEqual(namesOf(run), ['Sales', 'Costs']); assert.equal(run.session.sheetIndex, 0);
  assert.equal(run.session.sheets[1].sheet.value('A1'), 'Weekly Costs', 'reset rebuilds the second sheet from the lesson data');
});

test('lesson 1: the Go To goals grade the dialog box, not just where the cell ended up', () => {
  const L = 'workbook-sheets-cells';
  let run = fresh(L);
  run.run('Down Down Down Right Right'); assert.equal(run.sheet.selectionText(), 'C4'); assert.equal(run.doneCount, 0, 'arrows alone do not land the Go To goal');
  run.run('Ctrl+G Escape'); assert.equal(run.session.dialog, null); assert.equal(run.doneCount, 0, 'a cancelled Go To on C4 does not count');
  run.run('Ctrl+Home Ctrl+G Escape Down Down Down Right Right'); assert.equal(run.sheet.selectionText(), 'C4'); assert.equal(run.doneCount, 0, 'a cancelled Go To then arrows does not count');
  run.run('Ctrl+G "C4" Enter'); assert.equal(run.doneCount, 1);
  // F5 and the Ribbon's Find & Select › Go To open the same dialog box; letters may be typed lower-case
  run = fresh(L); run.run('F5 "c4" Enter'); assert.equal(run.doneCount, 1);
  run = fresh(L); run.run('Alt H F D G "C4" Enter'); assert.equal(run.doneCount, 1);
  // an invalid reference corrected inside the open dialog box still counts
  run = fresh(L); run.run('Ctrl+G "C444" Enter'); assert.equal(run.session.dialog, 'goto'); assert.equal(run.session.note, 'Reference is not valid.');
  run.run('Backspace Backspace Enter'); assert.equal(run.sheet.selectionText(), 'C4'); assert.equal(run.doneCount, 1);
  // the range goal: Shift+arrows to B3:B7 is a selection but not Go To; Go To lands it with B3 active
  run.run('Ctrl+Home Down Down Right Shift+Down Shift+Down Shift+Down Shift+Down'); assert.equal(run.sheet.selectionText(), 'B3:B7'); assert.equal(run.doneCount, 1);
  run.run('Ctrl+G "B3:B7" Enter'); assert.equal(run.sheet.selectionText(), 'B3:B7'); assert.deepEqual(run.sheet.dispActive(), { r: 3, c: 2 }); assert.equal(run.doneCount, 2);
  run = fresh(L); run.run('Ctrl+G "C4" Enter Ctrl+G "B3" Enter'); assert.equal(run.doneCount, 1, 'a single cell is not the range B3:B7');
});

test('lesson 1: the sheet goals need the sheet keys, and Go To onto the other sheet lands the last goal', () => {
  const run = fresh('workbook-sheets-cells');
  run.run('Ctrl+G "C4" Enter Ctrl+G "B3:B7" Enter'); assert.equal(run.doneCount, 2);
  run.run('Ctrl+G "Costs!A1" Enter'); assert.equal(run.session.sheetIndex, 1); assert.equal(run.doneCount, 2, 'reaching Costs through Go To is not the Ctrl+PgDn goal');
  run.run('Ctrl+PgDn'); assert.equal(run.session.sheetIndex, 1); assert.equal(run.doneCount, 3, 'Ctrl+PgDn on the last sheet still counts: the key was pressed and Costs is active');
  run.session.switchSheet(0); assert.equal(run.session.sheetIndex, 0); assert.equal(run.doneCount, 3, 'a tab click back to Sales is not the Ctrl+PgUp goal');
  run.run('Ctrl+PgDn Ctrl+PgUp'); assert.equal(run.session.sheetIndex, 0); assert.equal(run.doneCount, 4);
  run.run('Ctrl+PgDn Down Down Right'); assert.equal(run.session.sheetIndex, 1); assert.equal(run.sheet.selectionText(), 'B3'); assert.equal(run.doneCount, 4, 'arrowing onto Costs!B3 is not Go To');
  run.run('Ctrl+PgUp Ctrl+G "costs!b3" Enter'); assert.equal(run.session.sheetIndex, 1); assert.equal(run.sheet.selectionText(), 'B3'); assert.ok(run.finished);
  assert.equal(run.session.sheets[0].sheet.selectionText(), 'B3:B7', 'the Sales sheet keeps its own selection');
});

/* ---------------- lesson 2: sheets — insert, rename and delete ---------------- */

test('lesson 2: the run is a three-sheet workbook — Sales, a blank Sheet2 and a stale Old — rebuilt on reset', () => {
  const run = fresh('managing-sheets');
  assert.deepEqual(namesOf(run), ['Sales', 'Sheet2', 'Old']); assert.equal(run.session.sheetIndex, 0);
  assert.equal(run.sheet.value('A1'), 'Weekly Sales Report'); assert.equal(run.sheet.colW[1], 84);
  assert.equal(run.session.sheetHasContent(1), false, 'Sheet2 is blank: deleting it would not ask');
  assert.equal(run.session.sheetHasContent(2), true, 'Old holds data: deleting it asks first'); assert.equal(run.session.sheets[2].sheet.value('A1'), 'Old sales (superseded)');
  run.run('Ctrl+PgDn Alt H O R "Costs" Enter Ctrl+PgDn Alt H D S Enter'); assert.deepEqual(namesOf(run), ['Sales', 'Costs']); assert.equal(run.doneCount, 2);
  run.reset();
  assert.deepEqual(namesOf(run), ['Sales', 'Sheet2', 'Old']); assert.equal(run.session.sheetIndex, 0); assert.equal(run.doneCount, 0);
  assert.equal(run.session.sheets[2].sheet.value('B3'), 1150, 'reset rebuilds the Old sheet from the lesson data');
});

test('lesson 2: every goal grades the sheet names in order — the route is free, the wrong sheet or the wrong place is not', () => {
  const L = 'managing-sheets';
  let run = fresh(L);
  // goal 1: Sales renamed Costs is the wrong sheet; Sheet2 renamed by the KeyTips, or by the tab's double-click path from anywhere, counts; the case matters
  run.run('Alt H O R "Costs" Enter'); assert.deepEqual(namesOf(run), ['Costs', 'Sheet2', 'Old']); assert.equal(run.doneCount, 0, 'Sales renamed Costs is not the goal');
  run.run('Alt H O R "Sales" Enter Ctrl+PgDn Alt H O R "Costs" Enter'); assert.deepEqual(namesOf(run), ['Sales', 'Costs', 'Old']); assert.equal(run.doneCount, 1);
  run = fresh(L); run.session.openRenameSheet(1); run.run('"costs" Enter'); assert.equal(run.doneCount, 0, 'costs is not Costs');
  run.session.openRenameSheet(1); run.run('"Costs" Enter'); assert.equal(run.doneCount, 1, 'the strip\'s double-click route counts'); assert.equal(run.session.sheetIndex, 0);
  // goal 2: Old goes through the confirm card; Esc keeps it; a blank sheet would not ask
  run.run('Ctrl+PgDn Ctrl+PgDn Alt H D S'); assert.equal(run.session.dialog, 'deletesheet'); assert.equal(run.session.sheets.length, 3); assert.equal(run.doneCount, 1);
  run.run('Escape'); assert.equal(run.session.dialog, null); assert.equal(run.session.sheets.length, 3); assert.equal(run.doneCount, 1, 'Cancel keeps the sheet'); run.run('Escape Escape Escape');
  run.run('Alt H D S Enter'); assert.deepEqual(namesOf(run), ['Sales', 'Costs']); assert.equal(run.session.sheetIndex, 1, 'Costs, the previous sheet, becomes active'); assert.equal(run.doneCount, 2);
  // goal 3: the new sheet must sit between Sales and Costs — Shift+F11 from Costs; from Sales it lands in front and the goal waits; Alt H I S is the same insert
  run.run('Ctrl+PgUp Shift+F11'); assert.deepEqual(namesOf(run), ['Sheet3', 'Sales', 'Costs']); assert.equal(run.doneCount, 2, 'inserted in front of Sales: not the goal');
  run.run('Alt H D S'); assert.deepEqual(namesOf(run), ['Sales', 'Costs']); assert.equal(run.session.dialog, null, 'a blank sheet goes without the confirm');
  run.run('Ctrl+PgDn Alt H I S'); assert.deepEqual(namesOf(run), ['Sales', 'Sheet3', 'Costs']); assert.equal(run.session.sheetIndex, 1); assert.equal(run.doneCount, 3);
  // goal 4 then 5: the name must be Summary; a copy is not a move; the move by Move or Copy lands it
  run.run('Alt H O R "Summary" Enter'); assert.deepEqual(namesOf(run), ['Sales', 'Summary', 'Costs']); assert.equal(run.doneCount, 4);
  run.run('Alt H O M C Up Enter'); assert.deepEqual(namesOf(run), ['Summary (2)', 'Sales', 'Summary', 'Costs']); assert.equal(run.doneCount, 4, 'a copy at the front is not Summary moved');
  run.run('Alt H D S'); assert.deepEqual(namesOf(run), ['Sales', 'Summary', 'Costs']); assert.equal(run.session.sheetIndex, 0);
  run.run('Ctrl+PgDn Alt H O M Up Enter'); assert.deepEqual(namesOf(run), ['Summary', 'Sales', 'Costs']); assert.ok(run.finished);
  assert.equal(run.session.sheets[1].sheet.value('B7'), 1675, 'the Sales table travelled with its sheet');
  // the last sheet never goes, and the message is Excel's
  run = fresh(L); run.run('Ctrl+PgDn Alt H D S Ctrl+PgDn Alt H D S Enter'); assert.deepEqual(namesOf(run), ['Sales']);
  run.run('Alt H D S'); assert.deepEqual(namesOf(run), ['Sales']); assert.equal(run.session.note, 'A workbook must contain at least one visible worksheet.');
});

/* ---------------- lesson 3: the Ribbon and KeyTips ---------------- */

test('lesson 3: goal 1 needs the View tab open; gridlines by end state; Home then Esc, Esc by the key window and the mode', () => {
  const L = 'ribbon-and-keytips';
  let run = fresh(L);
  run.run('Alt H'); assert.equal(run.session.mode, 'ribbon'); assert.equal(run.doneCount, 0, 'Home is not View');
  run.run('Escape Escape Alt'); assert.equal(run.doneCount, 0, 'the tab strip alone is not the View tab');
  run.run('W'); assert.equal(run.doneCount, 1); assert.deepEqual(run.session.path, ['W']);
  run.run('Escape Escape'); assert.equal(run.session.mode, 'normal'); assert.equal(run.doneCount, 1, 'goal 1 stays landed once the tab is closed again');
  run.run('Alt W V'); assert.equal(run.doneCount, 1); assert.equal(run.sheet.gridlines, true);
  run.run('G'); assert.equal(run.sheet.gridlines, false); assert.equal(run.session.mode, 'normal'); assert.equal(run.doneCount, 2);
  run.run('Alt F T V G Enter'); assert.equal(run.sheet.gridlines, true); assert.equal(run.doneCount, 3, 'gridlines back on through Excel Options is a legitimate route');
  run.run('Alt H 1'); assert.equal(run.sheet.cellAt('A1').bold, false); assert.equal(run.session.mode, 'normal'); assert.equal(run.doneCount, 3, 'a Home walk that ran a command is not Alt, H, Esc, Esc');
  run.run('Ctrl+Z'); assert.equal(run.sheet.cellAt('A1').bold, true);
  run.run('Alt H Escape'); assert.equal(run.session.mode, 'ribbon'); assert.deepEqual(run.session.path, []); assert.equal(run.doneCount, 3, 'one Esc only backs out to the tab strip');
  run.run('Escape'); assert.equal(run.session.mode, 'normal'); assert.ok(run.finished);
  // the whole chord in one go lands the first two goals in order
  run = fresh(L); run.run('Alt W V G'); assert.equal(run.doneCount, 2); assert.equal(run.sheet.gridlines, false);
  run.run('Alt W V G Alt H Escape Escape'); assert.ok(run.finished);
});

/* ---------------- lesson 4: Excel Options ---------------- */

test('lesson 4: the goals grade the recorded settings; Cancel records nothing; F9 counts only in its window; flipping back keeps the lesson open', () => {
  const L = 'excel-options';
  let run = fresh(L);
  run.run('F9'); assert.equal(run.doneCount, 0);
  run.run('Alt F T M Escape'); assert.equal(run.session.settings.calcMode, 'automatic'); assert.equal(run.doneCount, 0, 'Esc cancels the draft');
  run.run('Escape Escape'); assert.equal(run.session.mode, 'normal');
  run.run('Alt F T M'); assert.equal(run.session.dlg.calcMode, 'manual'); assert.equal(run.doneCount, 0, 'a draft is not a setting until OK');
  run.run('Enter'); assert.equal(run.session.settings.calcMode, 'manual'); assert.equal(run.session.mode, 'normal'); assert.equal(run.doneCount, 1);
  run.run('Alt F T I Enter'); assert.equal(run.session.settings.iterative, true); assert.equal(run.session.settings.calcMode, 'manual'); assert.equal(run.doneCount, 2);
  run.run('Alt F T Q A Enter'); assert.deepEqual(run.session.settings.qat, ['save', 'undo', 'redo', 'autosum']); assert.equal(run.doneCount, 3);
  assert.equal(run.finished, false, 'the F9 pressed before the lesson began does not count');
  run.run('Alt F T A Enter'); assert.equal(run.session.settings.calcMode, 'automatic'); assert.equal(run.doneCount, 3);
  run.run('F9'); assert.equal(run.doneCount, 4); assert.equal(run.finished, false, 'calculation flipped back to Automatic: the end state keeps the lesson open');
  assert.equal(run.current.text, 'Workbook Calculation is still on Manual');
  run.run('Alt F T M Enter'); assert.ok(run.finished);
  // one visit that sets everything lands the first three goals together; the sheet is untouched throughout
  run = fresh(L); run.run('Alt F T M I Q A Enter'); assert.equal(run.doneCount, 3); assert.equal(run.sheet.value('B8'), 6355);
  run.run('F9'); assert.ok(run.finished); assert.equal(run.sheet.value('B8'), 6355);
});

/* ---------------- lesson 5: page setup and best practices ---------------- */

test('lesson 5: Page Setup or the Orientation button lands Landscape; Fit to 1 by 1; the colour convention is restated as end state', () => {
  const L = 'page-setup';
  let run = fresh(L);
  assert.equal(run.sheet.value('B10'), 5400, 'the formulas evaluate: 240 × 25 less 10%');
  run.run('Alt P S P L Escape'); assert.equal(run.session.settings.pageSetup.orientation, 'portrait'); assert.equal(run.doneCount, 0, 'Cancel discards the draft');
  run.run('Escape Escape Escape'); assert.equal(run.session.mode, 'normal');
  run.run('Alt P O L'); assert.equal(run.session.settings.pageSetup.orientation, 'landscape'); assert.equal(run.doneCount, 1, 'Orientation › Landscape on the Page Layout tab is a legitimate route');
  run.run('Alt P S P A Enter'); assert.equal(run.doneCount, 1, 'Adjust to is not Fit to');
  run.run('Alt P S P F Backspace 2 Enter'); assert.equal(run.session.settings.pageSetup.fitWide, 2); assert.equal(run.doneCount, 1, 'Fit to 2 pages wide is not the goal');
  run.run('Alt P S P F Backspace 1 Enter');
  assert.deepEqual(run.session.settings.pageSetup, { orientation: 'landscape', scaling: 'fit', adjustTo: 100, fitWide: 1, fitTall: 1 }); assert.equal(run.doneCount, 2);
  // colouring: Shift+arrows select as well as Go To does; colouring the formulas too, or undoing, keeps the lesson open
  run.run('Ctrl+Home Down Down Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down'); assert.equal(run.sheet.selectionText(), 'B3:B10');
  run.run('Alt H F C Right Right Right Right Enter');
  assert.equal(run.sheet.cellAt('B3').fontColor, 'blue'); assert.equal(run.sheet.cellAt('B8').fontColor, 'blue');
  assert.equal(run.doneCount, 3); assert.equal(run.finished, false); assert.equal(run.current.text, 'The formulas B8:B10 are still black');
  run.run('Ctrl+Z'); assert.equal(run.sheet.cellAt('B3').fontColor, null); assert.equal(run.finished, false); assert.equal(run.current.text, 'The inputs B3:B5 are still blue');
  run.run('Ctrl+G "B3:B5" Enter Alt H F C Right Right Right Right Enter'); assert.ok(run.finished);
  assert.equal(run.sheet.cellAt('B10').fontColor, null); assert.equal(run.sheet.value('B10'), 5400);
  // Red is not the convention, and Esc on the swatches applies nothing
  run = fresh(L); run.run('Alt P S P L Enter Alt P S P F Enter Ctrl+G "B3:B5" Enter');
  run.run('Alt H F C Right Right Right Right Escape'); assert.equal(run.sheet.cellAt('B3').fontColor, null); assert.equal(run.doneCount, 2);
  run.run('Escape Escape Escape Alt H F C Right Right Right Right Right Enter'); assert.equal(run.sheet.cellAt('B3').fontColor, 'red'); assert.equal(run.doneCount, 2);
});
