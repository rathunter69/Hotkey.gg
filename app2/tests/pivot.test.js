// A minimal PivotTable (Insert › PivotTable, Alt N V T) driven by keys, its Refresh (Alt+F5) and
// GETPIVOTDATA reading it, against the figures Excel's compact layout shows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';

const DATA = [['Site', 'Region', 'Washes'], ['AUS-DOM', 'Austin', 120], ['DAL-ELM', 'Dallas', 95], ['AUS-MUE', 'Austin', 80], ['DAL-OAK', 'Dallas', 60], ['HOU-MON', 'Houston', 40]];
const cells = () => { const o = {}; DATA.forEach((row, i) => row.forEach((v, j) => { o[String.fromCharCode(65 + j) + (i + 1)] = { value: v }; })); return o; };

test('PivotTable (Alt N V T): a new sheet, Region in Rows and Washes in Values; Columns; the summary steps; Alt+F5 refreshes; GETPIVOTDATA reads it', () => {
  const s = new Session(new Sheet({ cells: cells() })); s.renameSheet(0, 'Data'); const D = s.sheet;
  D.goTo(2, 2); s.run('Alt N V T'); assert.equal(s.dialog, 'pivot'); assert.equal(s.dlg.source, 'Data!$A$1:$C$6');
  s.run('Enter'); assert.equal(s.sheets.length, 2); assert.equal(s.sheetIndex, 0, 'the new sheet goes in front and opens'); assert.equal(s.dlg.step, 'fields'); assert.deepEqual(s.dlg.fields, ['Site', 'Region', 'Washes']);
  s.run('Down R Down V'); const P = s.sheet;
  assert.deepEqual(['A3', 'B3', 'A4', 'B4', 'A5', 'B5', 'A6', 'B6', 'A7', 'B7'].map(k => P.value(k)), ['Row Labels', 'Sum of Washes', 'Austin', 200, 'Dallas', 155, 'Houston', 40, 'Grand Total', 395]);
  s.run('S'); assert.equal(P.value('B3'), 'Count of Washes'); assert.equal(P.value('B4'), 2); s.run('S'); assert.equal(P.value('B4'), 100, 'Average'); s.run('S'); assert.equal(P.value('B4'), 200);
  s.run('Enter'); assert.equal(s.dialog, null);
  P.commitInput('=GETPIVOTDATA("Washes",$A$3,"Region","Dallas")', 10, 1); assert.equal(P.value('A10'), 155);
  P.commitInput('=GETPIVOTDATA("Sum of Washes",$A$3)', 11, 1); assert.equal(P.value('A11'), 395);
  P.commitInput('=GETPIVOTDATA("Washes",$A$3,"Region","Phoenix")', 12, 1); assert.equal(P.value('A12'), '#REF!');
  D.commitInput('100', 5, 3); assert.equal(P.value('B5'), 155, 'a pivot does not move until it is refreshed');
  P.goTo(4, 2); s.run('Alt+F5'); assert.equal(P.value('B5'), 195); assert.equal(P.value('A10'), 195, 'GETPIVOTDATA follows the refresh');
  // Site across the columns
  s.run('Alt N V T'); assert.equal(s.dialog, 'pivot');
  s.run('Escape'); const pv = P.pivots[0]; pv.spec.col = 'Site'; s.refreshPivot(P, pv);
  assert.deepEqual([P.value('A3'), P.value('B3'), P.value('A4'), P.value('B4'), P.value('G4'), P.value('G8')], ['Sum of Washes', 'Column Labels', 'Row Labels', 'AUS-DOM', 'Grand Total', 435]);
  P.commitInput('=GETPIVOTDATA("Washes",$A$3,"Region","Austin","Site","AUS-MUE")', 13, 1); assert.equal(P.value('A13'), 80);
  const back = new Sheet(JSON.parse(JSON.stringify(P.toJSON()))); assert.equal(back.pivots[0].spec.row, 'Region');
});

test('PivotTable shortcut menu (Shift+F10 on a pivot): Show Values As % of Column Total, Refresh, Show Field List; Home and End in the field list; date items keep their format', () => {
  const s = new Session(new Sheet({ cells: cells() })); s.renameSheet(0, 'Data'); const D = s.sheet;
  D.goTo(2, 1); s.run('Alt N V T Enter End Up R Home R');
  assert.deepEqual([s.dlg.idx, s.findPivot(s.dlg.pivot).pivot.spec.row], [0, 'Site'], 'Home and End move to the first and last field');
  s.run('Down R End V Enter'); const P = s.sheet;
  assert.equal(P.value('B4'), 200, 'Austin washes');
  P.goTo(5, 2); s.run('Shift+F10 A C');
  assert.equal(s.dialog, null);
  assert.ok(Math.abs(P.value('B4') - 200 / 395) < 1e-12, 'a share of the column total');
  assert.equal(P.value('B7'), 1, 'the grand total is the whole column');
  assert.deepEqual([P.cellAt('B4').fmtStyle, P.cellAt('B4').decimals], ['percent', 2], 'shares read as percentages');
  P.commitInput('=GETPIVOTDATA("Washes",$A$3,"Region","Houston")', 10, 1); assert.ok(Math.abs(P.value('A10') - 40 / 395) < 1e-12, 'GETPIVOTDATA reads what the pivot shows');
  P.goTo(4, 1); s.run('Shift+F10 A N'); assert.equal(P.value('B4'), 200, 'No Calculation puts the sums back'); assert.equal(P.cellAt('B4').fmtStyle || 'general', 'general');
  D.commitInput('100', 5, 3); assert.equal(P.value('B5'), 155);
  P.goTo(5, 1); s.run('Shift+F10 R'); assert.equal(P.value('B5'), 195, 'Refresh from the shortcut menu');
  s.run('Shift+F10 D'); assert.equal(s.dialog, 'pivot'); assert.equal(s.dlg.step, 'fields'); assert.equal(s.dlg.fields[s.dlg.idx], 'Washes', 'the list opens on the field in Values');
  s.run('Home C'); assert.equal(P.pivots[0].spec.col, 'Site'); assert.equal(P.value('A3'), 'Sum of Washes');
  s.run('End V'); assert.equal(P.pivots[0].spec.show, undefined, 'a new value field starts at No Calculation');
  s.run('Escape');
  // a date field in Rows: its items wear the source's date format
  const dated = new Session(new Sheet({ cells: { A1: { value: 'Date' }, B1: { value: 'Washes' }, A2: { value: 46280, fmtStyle: 'custom', numFmt: 'd-mmm-yy' }, B2: { value: 5 }, A3: { value: 46281, fmtStyle: 'custom', numFmt: 'd-mmm-yy' }, B3: { value: 7 } } }));
  dated.sheet.goTo(1, 1); dated.run('Alt N V T Enter R Down V Enter');
  assert.deepEqual([dated.sheet.value('A4'), dated.sheet.cellAt('A4').numFmt], [46280, 'd-mmm-yy']);
});
