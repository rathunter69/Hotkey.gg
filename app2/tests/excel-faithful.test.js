// Run R1's engine items (screenplay 9.3: M40, M41, M44, M63 to M68, M70 to M72, M83, M99): the
// keys and dialogs as desktop Excel has them. One test per item; each names the item it covers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet, zoomToFit } from '../engine/sheet.js';
import { dispMarked, PAD_MARK } from '../engine/format.js';
import { Session, isFormulaText, NUMBER_SHORTCUT_CODE, COMMA_STYLE_CODE } from '../engine/keyboard.js';
import { numberCode, numberTabResult, numberDraftFromCell, fillSeriesSpec, isValidName, suggestName, tabStepOf } from '../engine/dialogs.js';
import { transposeFormula } from '../engine/formula.js';
import { isDeskNumberFormat, deskNumberFormat, cellFormatCode, normalizeSignedFormula, sameFormula } from '../app/graders.js';

const fresh = (cells, sheetOpts) => { const log = []; const s = new Session(new Sheet({ ...(cells ? { cells } : {}), ...(sheetOpts || {}) }), { onKey: k => log.push(k), now: () => 0 }); s.log = log; return s; };

/* ---------------- M63: + and − start a formula ---------------- */
test('M63: a formula can start with + or −; +5 and −5 stay numbers; the grader sets the + aside', () => {
  const s = fresh({ D5: { value: 10 }, E5: { value: 4 } }, { active: { r: 5, c: 6 } }); const S = s.sheet;
  s.run('"+D5-E5" Enter'); assert.equal(S.formula('F5'), '=+D5-E5'); assert.equal(S.value('F5'), 6);
  s.run('"-D5" Enter'); assert.equal(S.formula('F6'), '=-D5'); assert.equal(S.value('F6'), -10);
  s.run('"+5" Enter "-5" Enter'); assert.equal(S.value('F7'), 5); assert.equal(S.formula('F7'), null); assert.equal(S.value('F8'), -5);
  s.run('"+" Up Up Up "-" Up Up Up Enter'); assert.equal(S.formula('F9'), '=+F6-F6', 'arrows point after a leading +, as after =');
  assert.equal(isFormulaText('+D5'), true); assert.equal(isFormulaText('-'), true); assert.equal(isFormulaText('-1,200.5'), false); assert.equal(isFormulaText('+1e3'), false); assert.equal(isFormulaText('5'), false);
  assert.equal(normalizeSignedFormula('=+D5-E5'), '=D5-E5'); assert.equal(normalizeSignedFormula('+d5 - e5'), '=D5-E5'); assert.equal(normalizeSignedFormula('=-D5'), '=-D5');
  assert.equal(sameFormula('=+D5-E5', '=D5-E5'), true); assert.equal(sameFormula('=D5-E5', '=E5-D5'), false);
  assert.equal(normalizeSignedFormula('="a b"&A1'), '="a b"&A1', 'text in quotes keeps its spaces and case');
});

/* ---------------- M64: the desk number format ---------------- */
test('M64: Format Cells › Number writes Excel\'s codes; 0 decimals, the separator and (1,234) is the desk format', () => {
  assert.equal(numberCode('number', 0, true, 'paren'), '#,##0_);(#,##0)');
  assert.equal(numberCode('number', 2, false, 'minus'), '0.00');
  assert.equal(numberCode('number', 1, true, 'red'), '#,##0.0;[Red]#,##0.0');
  assert.equal(numberCode('number', 0, true, 'parenRed'), '#,##0_);[Red](#,##0)');
  assert.equal(numberCode('currency', 2, true, 'minus'), '"$"#,##0.00');
  assert.deepEqual(numberTabResult({ cat: 'number', decimals: '0', sep: true, neg: 'paren' }), { style: 'comma', decimals: 0, numFmt: null });
  assert.deepEqual(numberTabResult({ cat: 'number', decimals: '2', sep: true, neg: 'minus' }), { style: 'custom', numFmt: '#,##0.00' });
  assert.equal(numberTabResult({ cat: 'custom', code: '[Color 57]0' }), null, 'a code Excel refuses');
  assert.deepEqual(numberDraftFromCell({ fmtStyle: 'custom', numFmt: '#,##0.0;[Red]#,##0.0' }), { cat: 'number', decimals: '1', sep: true, neg: 'red', typeIdx: 0, code: '#,##0.0;[Red]#,##0.0' });
  const s = fresh({ A1: { value: -1234.5 }, A2: { value: 98765.4 } }); const S = s.sheet;
  S.select('A1:A2'); s.run('Ctrl+1'); assert.equal(s.dialog, 'formatcells'); assert.equal(s.dlg.tab, 'number'); assert.equal(s.dlg.focus, 'tabs');
  s.run('Tab N'); assert.equal(s.dlg.cat, 'number'); assert.equal(s.dlg.decimals, '2', 'Number opens on 2 decimals');
  s.run('Alt+D 0 Alt+U Alt+N Down Down'); assert.deepEqual([s.dlg.decimals, s.dlg.sep, s.dlg.neg], ['0', true, 'paren']);
  s.run('Enter'); assert.equal(s.mode, 'normal'); assert.equal(S.text('A1').trim(), '(1,235)'); assert.equal(S.text('A2').trim(), '98,765');
  assert.equal(cellFormatCode(S.cellAt('A1')), '#,##0_);(#,##0)'); assert.equal(deskNumberFormat(S, 'A1:A2').ok, true);
  // the shortcuts write Excel's codes
  s.run('Ctrl+Shift+1'); assert.equal(S.cellAt('A1').numFmt, NUMBER_SHORTCUT_CODE); assert.equal(S.text('A1'), '-1,234.50');
  s.run('Alt H K'); assert.equal(S.cellAt('A1').numFmt, COMMA_STYLE_CODE); assert.equal(S.text('A1').trim(), '(1,234.50)');
  s.run('Alt H 9 Alt H 9'); assert.equal(S.text('A1').trim(), '(1,235)'); assert.equal(isDeskNumberFormat(cellFormatCode(S.cellAt('A1'))), true, 'Comma Style with its decimals taken off is the desk format');
  // the grader: every route passes, the near misses do not
  for (const c of ['#,##0_);(#,##0)', '#,##0_);[Red](#,##0)', '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)', '_(* #,##0_);_(* (#,##0);_(* "-"_);_(@_)']) assert.equal(isDeskNumberFormat(c), true, c);
  for (const c of ['#,##0', '#,##0.00_);(#,##0.00)', '0_);(0)', '#,##0;-#,##0', 'General', '$#,##0_);($#,##0)']) assert.equal(isDeskNumberFormat(c), false, c);
  assert.equal(isDeskNumberFormat('#,##0', { countsOk: true }), true, 'a count column may skip the brackets');
});

test('M64: the _) spacer is a bracket-wide gap; F4 repeats the whole Format Cells action', () => {
  const s = fresh({ A1: { value: 5 }, A2: { value: -5 }, B1: { value: 7 }, C1: { value: 'x' } }); const S = s.sheet;
  S.select('A1:A2'); s.run('Ctrl+1 Tab N Alt+D 0 Alt+U Alt+N Down Down Enter');
  assert.equal(dispMarked(S.cellAt('A1')), '5' + PAD_MARK + ')', 'a positive keeps a bracket\'s width on the right, so the digits line up');
  assert.equal(dispMarked(S.cellAt('A2')), '(5)');
  // a dialog visit that changes several things is one action: F4 lays all of it on the next cell
  s.run('Ctrl+1 Tab P Ctrl+PageDown'); assert.equal(s.dlg.tab, 'alignment'); s.run('Alt+H Down Down Down'); assert.equal(s.dlg.align, 'r');
  s.run('Ctrl+PageDown Alt+U Enter'); assert.equal(S.cellAt('A2').uline, true); assert.equal(S.cellAt('A2').align, 'r');
  S.goTo(1, 2); s.run('F4'); const b = S.cellAt('B1'); assert.deepEqual([b.align, b.uline, b.fmtStyle, b.decimals], ['r', true, 'percent', 2], 'F4 repeats the number format, the alignment and the underline at once');
  assert.equal(S.cellAt('C1').uline, false, 'and only on the selection');
});

/* ---------------- M65: the mode word and pointing at the caret ---------------- */
test('M65: the status bar says Ready, Enter, Edit or Point; an arrow writes its reference at the caret', () => {
  const s = fresh({ A1: { value: 3 }, A2: { value: 4 } }, { active: { r: 1, c: 2 } });
  assert.equal(s.modeWord(), 'Ready');
  s.run('"=()"'); assert.equal(s.modeWord(), 'Enter');
  s.run('F2'); assert.equal(s.modeWord(), 'Edit'); s.run('Left F2'); assert.equal(s.editCaret, 2);
  s.run('Left'); assert.equal(s.modeWord(), 'Point'); assert.equal(s.editBuf, '=(A1)', 'written at the caret, the text after it kept');
  s.run('Down'); assert.equal(s.editBuf, '=(A2)');
  s.run('"*2" Enter'); assert.equal(s.sheet.value('B1'), 8); assert.equal(s.modeWord(), 'Ready');
  s.run('Shift+F2'); assert.equal(s.modeWord(), 'Edit', 'a note being written is Edit'); s.run('Escape');
});

/* ---------------- M66: dialog tabs ---------------- */
test('M66: Format Cells opens on the last tab on its tab row; letters pick tabs and categories; Ctrl+PgDn / Ctrl+Tab and the Alt alias step', () => {
  const s = fresh({ A1: { value: 1 } });
  s.run('Ctrl+1'); assert.equal(s.dlg.focus, 'tabs');
  s.run('A'); assert.equal(s.dlg.tab, 'alignment'); s.run('P'); assert.equal(s.dlg.tab, 'protection'); s.run('C'); assert.equal(s.dlg.tab, 'protection', 'a letter no tab has does nothing');
  s.run('N'); assert.equal(s.dlg.tab, 'number'); s.run('F'); assert.equal(s.dlg.tab, 'font'); s.run('F'); assert.equal(s.dlg.tab, 'fill', 'F again: the next tab with F');
  s.run('Ctrl+PageUp'); assert.equal(s.dlg.tab, 'border'); s.run('Alt+PageDown'); assert.equal(s.dlg.tab, 'fill'); s.run('Ctrl+Tab'); assert.equal(s.dlg.tab, 'protection'); s.run('Ctrl+Shift+Tab'); assert.equal(s.dlg.tab, 'fill');
  assert.ok(s.log.includes('Ctrl+PgDn') && s.log.includes('Ctrl+PgUp'), 'tab steps are logged as Excel\'s keys');
  s.run('Escape Ctrl+1'); assert.equal(s.dlg.tab, 'fill', 'a cancelled visit counts: it reopens where it was left');
  s.run('N Tab'); assert.equal(s.dlg.focus, 'category');
  s.run('N'); assert.equal(s.dlg.cat, 'number'); s.run('C'); assert.equal(s.dlg.cat, 'currency'); s.run('C'); assert.equal(s.dlg.cat, 'custom'); s.run('P'); assert.equal(s.dlg.cat, 'percentage');
  s.run('End'); assert.equal(s.dlg.cat, 'custom'); s.run('Home'); assert.equal(s.dlg.cat, 'general');
  s.run('N Alt+N'); assert.equal(s.dlg.focus, 'neg'); s.run('Alt+U'); assert.equal(s.dlg.sep, true); s.run('Alt+D'); assert.equal(s.dlg.focus, 'decimals');
  s.run('Escape'); assert.equal(s.mode, 'normal');
  assert.equal(tabStepOf({ key: 'PageDown', ctrlKey: true }), 'NextTab'); assert.equal(tabStepOf({ key: 'PageUp', altKey: true }), 'PrevTab'); assert.equal(tabStepOf({ key: 'Tab' }), null);
});

/* ---------------- M67: the Series dialog ---------------- */
test('M67: Series opens on Linear with the cursor in Step value; Alt+F AutoFill continues lists and reads a step from two numbers', () => {
  const s = fresh({ B2: { value: 'Mon' }, B4: { value: 5 }, B6: { value: 15 }, C6: { value: 16 } }); const S = s.sheet;
  S.select('B2:G2'); s.run('Alt H F I S'); assert.equal(s.dialog, 'series'); assert.deepEqual([s.dlg.type, s.dlg.dir, s.dlg.focus], ['linear', 'rows', 'step']);
  s.run('Enter'); assert.equal(S.value('C2'), null, 'Linear leaves a day name alone');
  s.run('Alt H F I S Alt+F Enter'); assert.deepEqual(['C2', 'D2', 'E2', 'F2', 'G2'].map(r => S.value(r)), ['Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  S.select('B4:F4'); s.run('Alt H F I S 5 Enter'); assert.deepEqual(['B4', 'C4', 'D4', 'E4', 'F4'].map(r => S.value(r)), [5, 10, 15, 20, 25], 'the first digit replaces the selected 1');
  S.select('B6:F6'); s.run('Alt H F I S Alt+F Enter'); assert.deepEqual(['D6', 'E6', 'F6'].map(r => S.value(r)), [17, 18, 19]);
  S.setCell('B8', { value: 2 }); S.select('B8:H8'); s.run('Alt H F I S Alt+G 3'); assert.equal(s.dlg.step, '1', 'a digit on the Type buttons types nothing'); s.run('Alt+S 3 Alt+O 100 Enter'); assert.deepEqual(['C8', 'D8', 'E8', 'F8'].map(r => S.value(r)), [6, 18, 54, null], 'Growth stops before passing the stop value');
  S.setCell('A10', { value: 45322 }); S.select('A10:A13'); s.run('Alt H F I S'); assert.equal(s.dlg.dir, 'cols'); s.run('Alt+D Alt+M Enter');
  assert.deepEqual(['A11', 'A12', 'A13'].map(r => S.value(r)), [45351, 45382, 45412], 'Date by Month: Jan 31 → Feb 29, Mar 31, Apr 30');
  S.setCell('C10', { value: 1 }); S.select('C10:C12'); s.run('F4'); assert.deepEqual(['C11', 'C12'].map(r => S.value(r)), [32, 60], 'F4 repeats the last Series (a month on from serial 1)');
  assert.equal(fillSeriesSpec(S, { dir: 'cols', type: 'linear', step: 'x' }), false);
});

/* ---------------- M68: Clear menu, Paste Special Formulas, paste arithmetic, transpose, cut ---------------- */
test('M68: Alt H E M clears notes; Paste Special F keeps the destination\'s formats; arithmetic wraps a formula; Transpose turns formulas; Cut repoints its readers', () => {
  const s = fresh({ A1: { value: 1 }, B1: { value: 2 }, A2: { formula: '=A1+B1' }, D5: { value: 10, bold: true }, C5: { formula: '=SUM(A1:B1)' }, E1: { value: -1 } }); const S = s.sheet;
  S.setNote(1, 1, 'source: feed'); assert.equal(S.noteAt(1, 1), 'source: feed');
  S.goTo(1, 1); s.run('Delete'); assert.equal(S.noteAt(1, 1), 'source: feed', 'Delete keeps the note'); s.run('Ctrl+Z');
  s.run('Alt H E M'); assert.equal(S.noteAt(1, 1), null); assert.equal(S.value('A1'), 1, 'Clear Comments and Notes leaves the value');
  // Go To Special › Notes
  S.setNote(2, 2, 'x'); S.select('A1:C3'); s.run('Alt H F D S N Enter'); assert.deepEqual(S.multi, ['B2']);
  // Paste Special › Formulas
  S.goTo(2, 1); s.run('Ctrl+C'); S.goTo(5, 4); s.run('Ctrl+Alt+V F Enter'); assert.equal(S.formula('D5'), '=D4+E4'); assert.equal(S.cellAt('D5').bold, true, 'the destination keeps its formats');
  // paste arithmetic on a formula
  S.goTo(1, 5); s.run('Ctrl+C'); S.goTo(5, 3); s.run('Ctrl+Alt+V M Enter'); assert.equal(S.formula('C5'), '=(SUM(A1:B1))*-1'); assert.equal(S.value('C5'), -3);
  // transpose turns relative references
  assert.equal(transposeFormula('=A1+B1', 2, 1, 1, 5), '=D1+D2');
  assert.equal(transposeFormula('=$A$1+A1', 2, 1, 1, 5), '=$A$1+D1');
  S.select('A1:B2'); s.run('Ctrl+C'); S.goTo(1, 7); s.run('Ctrl+Alt+V E Enter'); assert.equal(S.formula('H1'), '=G1+G2'); assert.equal(S.value('H1'), 3);
  // cut and paste: the moved formula keeps its references and the readers follow the moved cell
  S.goTo(1, 1); s.run('Ctrl+X'); S.goTo(9, 1); s.run('Ctrl+V'); assert.equal(S.formula('A2'), '=A9+B1'); assert.equal(S.value('A2'), 3);
});

/* ---------------- M70: grouped sheets ---------------- */
test('M70: Ctrl+Shift+PgDn groups sheets; an entry, a format and a width land on every grouped sheet; a plain sheet key outside the group ungroups', () => {
  const s = fresh(); s.addSheet('Two'); s.addSheet('Three');
  s.run('Ctrl+Shift+PageDown'); assert.equal(s.sheetIndex, 1); assert.equal(s.isGrouped(), true); assert.deepEqual([...s.group].sort(), [0, 1]);
  s.run('"Q1" Enter Up Ctrl+B'); for (const i of [0, 1]) { assert.equal(s.sheets[i].sheet.value('A1'), 'Q1'); assert.equal(s.sheets[i].sheet.cellAt('A1').bold, true); }
  assert.equal(s.sheets[2].sheet.value('A1'), null, 'a sheet outside the group is untouched');
  assert.equal(s.statusInfo().grouped, true);
  s.run('Ctrl+PageDown'); assert.equal(s.sheetIndex, 2); assert.equal(s.isGrouped(), false, 'moving to a sheet outside the group ungroups');
  s.run('"x" Enter'); assert.equal(s.sheets[1].sheet.value('A1'), 'Q1');
});

/* ---------------- M71 / M72: Find options; an apostrophe's formula text goes live ---------------- */
test('M72: Find Options: Within Workbook, Look in Values or Notes, Find All lists every match', () => {
  const s = fresh({ A1: { value: 1200, fmtStyle: 'comma', decimals: 0 }, A2: { formula: '=A1*2' } }); s.addSheet('Two'); s.sheets[1].sheet.setCell('C3', { value: 'Total 1,200' });
  s.sheets[0].sheet.setNote(5, 5, 'check the feed');
  s.run('Ctrl+F "1,200" Enter'); assert.equal(s.note, "We couldn't find what you were looking for.", 'Formulas look at what was typed: 1200, not 1,200');
  s.run('Alt+T'); assert.equal(s.dlg.options, true); s.run('Alt+L'); assert.equal(s.dlg.lookIn, 'values'); s.run('Enter'); assert.equal(s.sheet.selectionText(), 'A1');
  s.run('Alt+H'); assert.equal(s.dlg.within, 'workbook'); s.run('Alt+I');
  assert.deepEqual(s.dlg.results.map(r => r.sheet + '!' + r.cell), ['Sheet1!$A$1', 'Two!$C$3']); assert.equal(s.dlg.results[0].value.trim(), '1,200');
  s.run('Down'); assert.equal(s.sheetIndex, 1); assert.equal(s.sheet.selectionText(), 'C3'); assert.equal(s.dialog, 'find', 'the results walk keeps the dialog open');
  s.run('Escape Ctrl+F'); assert.equal(s.dlg.options, true, 'the options stay open through the session'); assert.equal(s.dlg.find, '1,200'); assert.equal(s.dlg.findSel, true);
  s.run('"feed" Alt+L Enter'); assert.equal(s.dlg.lookIn, 'notes'); assert.equal(s.sheetIndex, 0); assert.equal(s.sheet.selectionText(), 'E5', 'Look in Notes finds the note');
  s.run('Escape');
});

test('M71: a leading apostrophe keeps formula text as text; F2 shows it; taking it away makes the formula live', () => {
  const s = fresh({ A1: { value: 2 } }, { active: { r: 1, c: 2 } }); const S = s.sheet;
  s.run('"\'=A1*3" Enter'); assert.equal(S.value('B1'), '=A1*3'); assert.equal(S.formula('B1'), null); assert.equal(S.cellAt('B1').apos, true);
  s.run('Up F2'); assert.equal(s.editBuf, "'=A1*3");
  s.run('Home Delete Enter'); assert.equal(S.formula('B1'), '=A1*3'); assert.equal(S.value('B1'), 6); assert.equal(S.cellAt('B1').apos, false);
});

/* ---------------- M83: Formula AutoComplete ---------------- */
test('M83: typing a function\'s first letters lists the functions and names that start with them; ↓ moves, Tab completes with the bracket', () => {
  const s = fresh({ A1: { value: 4 } }, { active: { r: 1, c: 2 } });
  s.defineName('Margin', 'A1');
  s.run('"=SU"'); assert.ok(s.fxList); const names = s.fxList.items.map(i => i.name); assert.equal(names[0], 'SUBSTITUTE'); assert.ok(names.includes('SUM') && names.includes('SUMIF') && names.includes('SUMPRODUCT'));
  assert.deepEqual(names, names.slice().sort(), 'alphabetical');
  s.run('Down'); assert.equal(s.fxList.items[s.fxList.idx].name, names[1]);
  s.run('Escape "M" Tab'); assert.equal(s.editBuf, '=SUM(', 'Tab takes the highlighted SUM with its bracket');
  s.run('"A1)*Ma"'); assert.ok(s.fxList.items.some(i => i.kind === 'name' && i.name === 'Margin'), 'a defined name is on the list beside MATCH and MAX');
  s.run('"r" Tab'); assert.equal(s.editBuf, '=SUM(A1)*Margin', 'a name goes in without a bracket'); s.run('Enter'); assert.equal(s.sheet.value('B1'), 16);
  s.run('"=1+2"'); assert.equal(s.fxList, null, 'nothing named, no list'); s.run('Escape');
});

/* ---------------- M40, M41, M44: the editing and workbook keys ---------------- */
test('M40: Enter-move setting, column AutoComplete, Alt+Enter, Ctrl+; and the edit keys', () => {
  const s = fresh({ A1: { value: 'Airport' }, A2: { value: 'South Lamar' } }, { active: { r: 3, c: 1 }, today: () => 45566 }); const S = s.sheet;
  s.run('"Ai"'); assert.equal(s.acFull, 'Airport'); s.run('Enter'); assert.equal(S.value('A3'), 'Airport', 'Enter takes the proposal');
  s.run('"So" Backspace Enter'); assert.equal(S.value('A4'), 'So', 'Backspace drops the proposal, what was typed stays');
  s.run('"a" Delete Enter'); assert.equal(S.value('A5'), 'a', 'Delete drops it too');
  s.run('"x"'); assert.equal(s.acFull, null, 'nothing starts with x');
  s.run('Escape');
  // Enter-move off: Excel Options › Advanced › After pressing Enter, move selection (Alt+M); a state carries settings.enterMoves
  s.run('Alt F T V Alt+M Enter'); assert.equal(s.settings.enterMoves, false);
  S.goTo(10, 2); s.run('"5" Enter'); assert.equal(S.selectionText(), 'B10', 'Enter commits and stays'); s.run('Enter'); assert.equal(S.selectionText(), 'B10');
  s.settings.enterMoves = true; s.run('Enter'); assert.equal(S.selectionText(), 'B11');
  // Ctrl+; dates the cell with the sheet's today; inside an entry it types the date
  s.run('Ctrl+;'); assert.equal(S.value('B11'), 45566); assert.equal(S.cellAt('B11').fmtStyle, 'date');
  s.run('Down "Due " Ctrl+; Enter'); assert.equal(S.value('B12'), 'Due 10/1/2024');
  // edit keys: Home / End, Ctrl+← / →, Delete forward, Backspace back
  s.run('"=SUM(A1,B2)" F2 Home'); assert.equal(s.editCaret, 0); s.run('Ctrl+Right'); assert.equal(s.editCaret, 1); s.run('Ctrl+Right'); assert.equal(s.editCaret, 5);
  s.run('End Ctrl+Left'); assert.equal(s.editCaret, 8); s.run('Delete Delete'); assert.equal(s.editBuf, '=SUM(A1,)'); s.run('Backspace'); assert.equal(s.editBuf, '=SUM(A1)'); s.run('Escape');
  s.run('Ctrl+Backspace'); assert.equal(s.log.at(-1), 'Ctrl+⌫');
  s.run('Ctrl+Shift+U'); assert.equal(s.settings.formulaBarExpanded, true); s.run('Ctrl+F1'); assert.equal(s.settings.ribbonCollapsed, true);
});

test('M40: the status bar sums, averages and counts the selection in the active cell\'s format; Min and Max when ticked', () => {
  const s = fresh({ A1: { value: 1000, fmtStyle: 'comma', decimals: 0 }, A2: { value: 2500 }, A3: { value: 'n/a' }, A4: { value: -500 } }); const S = s.sheet;
  let st = s.statusInfo(); assert.equal(st.show, false, 'one cell: nothing to sum'); assert.equal(st.mode, 'Ready'); assert.equal(st.zoom, 100);
  S.select('A1:A5'); st = s.statusInfo();
  assert.deepEqual([st.show, st.count, st.numCount, st.sum], [true, 4, 3, 3000]); assert.equal(st.text.sum.trim(), '3,000'); assert.equal(st.text.average.trim(), '1,000'); assert.equal(st.text.count, '4');
  assert.equal(st.showMin, false); s.toggleStatusItem('min'); s.toggleStatusItem('max'); st = s.statusInfo(); assert.equal(st.text.min.trim(), '(500)'); assert.equal(st.text.max.trim(), '2,500');
});

test('M40: F4 repeats a fill; Define Name (Alt M M D) names the selection; a name reads in formulas, in Go To, and through ses.names', () => {
  const s = fresh({ A4: { value: 'Cost per wash' }, B4: { value: 1.25 }, B6: { value: 100 }, C1: { value: 7 } }, { active: { r: 4, c: 2 } }); const S = s.sheet;
  s.run('Alt M M D'); assert.equal(s.dialog, 'definename'); assert.equal(s.dlg.name, 'Cost_per_wash', 'Excel suggests the label beside it'); assert.equal(s.dlg.refersTo, '=Sheet1!$B$4');
  s.run('"CostPerWash" Enter'); assert.deepEqual(s.names, { CostPerWash: 'Sheet1!$B$4' });
  S.goTo(6, 3); s.run('"=B6*costperwash" Enter'); assert.equal(S.value('C6'), 125);
  s.run('Alt M M D "B6" Enter'); assert.equal(s.note, 'The name that you entered is not valid.'); s.run('Backspace Backspace "x" Enter'); s.run('Escape');
  s.run('Alt M M D "CostPerWash" Enter'); assert.equal(s.note, 'The name that you entered already exists. Enter a unique name.'); s.run('Escape Escape Escape Escape'); assert.equal(s.mode, 'normal');
  S.goTo(1, 1); s.run('Ctrl+G "CostPerWash" Enter'); assert.equal(S.selectionText(), 'B4', 'Go To takes a name');
  // the state shape the runner applies: { name: 'Sheet!$C$R' }
  s.addSheet('Inputs'); s.sheets[1].sheet.setCell('B4', { value: 2 }); s.names = { CostPerWash: 'Inputs!$B$4' };
  assert.equal(S.value('C6'), 200, 'formulas follow the name to its new cell'); assert.deepEqual(s.names, { CostPerWash: 'Inputs!$B$4' });
  // rows inserted above a named cell move the name with it
  s.switchSheet(1); s.sheet.goTo(1, 1); s.run('Shift+Space Ctrl+Shift+='); assert.deepEqual(s.names, { CostPerWash: 'Inputs!$B$5' }); s.switchSheet(0); assert.equal(S.value('C6'), 200);
  assert.equal(isValidName('Q1'), false); assert.equal(isValidName('R'), false); assert.equal(isValidName('_tax.rate'), true); assert.equal(isValidName('My Name'), false);
  assert.equal(suggestName(S, 4, 2), 'Cost_per_wash');
  // F4 repeats a fill
  S.select('C1:C3'); s.run('Ctrl+D'); S.select('D1:D3'); S.setCell('D1', { value: 9 }); s.run('F4'); assert.equal(S.value('D3'), 9);
});

test('M40: Shift+F2 writes a note (Esc leaves it, saved), the cell carries the note text', () => {
  const s = fresh({ B2: { value: 5 } }, { active: { r: 2, c: 2 } }); const S = s.sheet;
  s.run('Shift+F2'); assert.equal(s.dialog, 'note'); s.run('"From the March feed" Enter "Checked"'); assert.equal(s.dlg.text, 'From the March feed\nChecked');
  s.run('Escape'); assert.equal(s.dialog, null); assert.equal(S.cellAt('B2').cmt, 'From the March feed\nChecked');
  s.run('Shift+F2'); assert.equal(s.dlg.text, 'From the March feed\nChecked', 'reopens on its text'); s.run('Escape');
  s.run('Ctrl+Z'); assert.equal(S.cellAt('B2').cmt, 'From the March feed\nChecked', 'an unchanged visit is its own undo step');
});

test('M41 / M44 / M99: Alt+PgDn and Ctrl+Alt+PgDn are the sheet keys; zoom is the sheet\'s own and fits the used range', () => {
  const s = fresh({ A1: { value: 1 }, H40: { value: 2 } }); s.addSheet('Two');
  s.run('Alt+PageDown'); assert.equal(s.sheetIndex, 1); s.run('Ctrl+Alt+PageUp'); assert.equal(s.sheetIndex, 0); assert.deepEqual(s.log.slice(-2), ['Ctrl+PgDn', 'Ctrl+PgUp']);
  s.run('Alt W Q'); assert.equal(s.dialog, 'zoom'); s.run('7 Enter'); assert.equal(s.sheet.zoom, 75); assert.equal(s.sheets[1].sheet.zoom, 100, 'zoom is per sheet');
  s.run('Alt W Q C 150 Enter'); assert.equal(s.sheet.zoom, 150); s.run('Alt W Q C 5 Enter'); assert.equal(s.note, 'Enter a number between 10 and 400.'); s.run('Escape Escape Escape'); assert.equal(s.mode, 'normal');
  s.run('Alt W J'); assert.equal(s.sheet.zoom, 100);
  s.sheet.select('A1:B2'); s.viewSize = { width: 800, height: 400 }; s.run('Alt W Q F Enter'); assert.equal(s.sheet.zoom, 400, 'Fit selection, capped at 400');
  assert.equal(s.sheet.toJSON().zoom, 400); s.sheet.setZoom(100); assert.equal(s.sheet.toJSON().zoom, undefined);
  assert.equal(zoomToFit(s.sheet, { width: 3000, height: 3000 }), 150, 'a small used range zooms in to the cap');
  assert.equal(zoomToFit(s.sheet, { width: 300, height: 300, floor: 50 }), 50, 'a large one is held at the floor');
  assert.equal(zoomToFit(s.sheet, {}), 100);
});
