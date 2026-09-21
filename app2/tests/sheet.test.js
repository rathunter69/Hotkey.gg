import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';

const seed = () => new Sheet({ cells: { A1: { value: 10 }, A2: { value: 20 }, A3: { value: 30 }, B1: { value: 'Sales', bold: true } } });

test('seeding and reading back', () => {
  const s = seed();
  assert.equal(s.value('A1'), 10); assert.equal(s.value('B1'), 'Sales'); assert.equal(s.cellAt('B1').txt, true); assert.equal(s.cellAt('B1').bold, true);
  assert.equal(s.value('Z9'), null); assert.equal(s.text('A1'), '10');
});

test('commit parsing: numbers, comma, percent, currency, parens, booleans, text, formulas', () => {
  const s = new Sheet();
  assert.deepEqual(Sheet.classifyInput('1,234'), { kind: 'value', value: 1234, fmtStyle: 'comma', decimals: 0 });
  assert.deepEqual(Sheet.classifyInput('12.5%'), { kind: 'value', value: 0.125, fmtStyle: 'percent', decimals: 1 });
  assert.deepEqual(Sheet.classifyInput('$1,500'), { kind: 'value', value: 1500, fmtStyle: 'currency', decimals: 0 });
  assert.deepEqual(Sheet.classifyInput('(250)'), { kind: 'value', value: -250 });
  assert.deepEqual(Sheet.classifyInput('true'), { kind: 'value', value: true });
  assert.deepEqual(Sheet.classifyInput('Hello'), { kind: 'value', value: 'Hello', txt: true });
  assert.deepEqual(Sheet.classifyInput('8', { fmtStyle: 'percent' }), { kind: 'value', value: 0.08 });   // bare number into a percent cell
  assert.deepEqual(Sheet.classifyInput('=sum(a1:a3'), { kind: 'formula', formula: '=SUM(A1:A3)' });     // auto-close + normalise
  assert.equal(Sheet.classifyInput('=1+').kind, 'fix');
  assert.equal(Sheet.classifyInput('=@@').kind, 'bad');
  s.commitInput('=1/0', 1, 1); assert.equal(s.value('A1'), '#DIV/0!');
  s.commitInput('#N/A', 1, 2); assert.equal(s.value('B1'), '#N/A'); assert.equal(s.cellAt('B1').txt, false);
});

test('recalc: chains, propagation, circular references read 0, OFFSET settles', () => {
  const s = new Sheet({ cells: { A1: { value: 5 }, B1: { formula: '=A1*2' }, C1: { formula: '=B1+1' }, D1: { formula: '=D1+1' }, E1: { formula: '=F1' }, F1: { formula: '=E1' }, G1: { formula: '=SUM(A1:C1)' }, H1: { formula: '=OFFSET(A1,0,1)' } } });
  assert.equal(s.value('B1'), 10); assert.equal(s.value('C1'), 11); assert.equal(s.value('D1'), 0); assert.equal(s.value('E1'), 0); assert.equal(s.value('G1'), 26); assert.equal(s.value('H1'), 10);
  s.commitInput('7', 1, 1); assert.equal(s.value('C1'), 15); assert.equal(s.value('G1'), 36); assert.equal(s.value('H1'), 14);
  s.commitInput('=1/0', 1, 1); assert.equal(s.value('C1'), '#DIV/0!');
});

test('selection model: move, extend, ctrl-jump, collapse from the displayed anchor', () => {
  const s = seed();
  s.move(1, 0, false, false); assert.equal(s.selectionText(), 'A2');
  s.move(1, 0, true, true); assert.equal(s.selectionText(), 'A2:A3');
  s.move(1, 0, false, false); assert.equal(s.selectionText(), 'A3');       // collapses to the anchor A2 then steps
  s.goTo(1, 1); s.move(1, 0, false, true); assert.equal(s.selectionText(), 'A3');  // Ctrl+Down to the block edge
  s.move(1, 0, false, true); assert.equal(s.selectionText(), 'A20');       // then to the sheet edge
  s.goTo(3, 2); s.selectRow(); assert.equal(s.selectionText(), 'A3:J3'); assert.deepEqual(s.dispActive(), { r: 3, c: 2 });
  s.goTo(1, 1); s.selectAll(); assert.equal(s.selectionText(), 'A1:B3'); s.selectAll(); assert.equal(s.selectionText(), 'A1:J20');
  s.goTo(2, 3); s.moveHome(false, false); assert.equal(s.selectionText(), 'A2'); s.moveHome(true, false); assert.equal(s.selectionText(), 'A1');
  s.moveEnd(true, false); assert.equal(s.selectionText(), 'B3');
});

test('formatting: mixed-selection toggle, number formats, borders, undo/redo', () => {
  const s = seed();
  s.select('A1:B1');
  assert.equal(s.toggleAllOrNone('bold'), true); assert.equal(s.cellAt('A1').bold, true); assert.equal(s.cellAt('B1').bold, true);
  assert.equal(s.toggleAllOrNone('bold'), false); assert.equal(s.cellAt('A1').bold, false);
  s.select('A1:A3'); s.setNumberFormat('comma', 2); assert.equal(s.text('A3'), '30.00');
  s.changeDecimals(-1); assert.equal(s.text('A3'), '30.0'); s.changeDecimals(-5); assert.equal(s.cellAt('A3').decimals, 0);
  s.setNumberFormat('percent', 0); assert.equal(s.text('A1'), '1000%');
  s.border('outside'); assert.equal(s.cellAt('A1').bt, true); assert.equal(s.cellAt('A2').bl, true); assert.equal(s.cellAt('A2').bt, false); assert.equal(s.cellAt('A3').bb, true);
  s.select('A1'); s.border('outside'); assert.equal(s.cellAt('A1').ball, true);
  s.border('none'); assert.equal(s.cellAt('A1').ball, false); assert.equal(s.cellAt('A1').bt, false);
  s.undo(); assert.equal(s.cellAt('A1').ball, true); s.redo(); assert.equal(s.cellAt('A1').ball, false);
  s.select('A1:A3'); s.setAlign('c'); assert.equal(s.cellAt('A2').align, 'c'); s.changeIndent(1); assert.equal(s.cellAt('A2').indent, 1);
  s.setFill('yellow'); assert.equal(s.cellAt('A1').fill, 'yellow'); s.setFontColor('blue'); assert.equal(s.cellAt('A1').fontColor, 'blue');
  s.applyCellStyle('total'); assert.equal(s.cellAt('A1').bt, true); s.applyCellStyle('normal'); assert.equal(s.cellAt('A1').bt, false); assert.equal(s.value('A1'), 10);
  s.clearFormats(); assert.equal(s.cellAt('A1').fill, null); s.clearContents(); assert.equal(s.value('A1'), null);
});

test('clipboard: copy/paste translates, tiles, cut moves, values-only, drop', () => {
  const s = seed();
  s.commitInput('=SUM(A1:A3)', 4, 1);
  s.select('A1:A4'); s.copy(); s.select('C1'); s.paste('all');
  assert.equal(s.value('C1'), 10); assert.equal(s.formula('C4'), '=SUM(C1:C3)'); assert.equal(s.value('C4'), 60); assert.equal(s.selectionText(), 'C1:C4');
  s.select('A4'); s.copy(); s.select('D1'); s.paste('all'); assert.equal(s.formula('D1'), '=SUM(#REF!)'); assert.equal(s.value('D1'), '#REF!');   // pushed off the sheet
  s.select('A1'); s.copy(); s.select('E1:E3'); s.paste(); assert.deepEqual([s.value('E1'), s.value('E2'), s.value('E3')], [10, 10, 10]);   // tiles
  s.select('A4'); s.copy(); s.select('F1'); s.paste('values'); assert.equal(s.formula('F1'), null); assert.equal(s.value('F1'), 60);
  s.select('A1:A2'); s.copy(true); s.select('G1'); s.paste(); assert.equal(s.value('G1'), 10); assert.equal(s.value('A1'), null); assert.equal(s.clipboard, null);
  s.select('G1'); s.copy(); s.select('H5'); s.pasteDrop(); assert.equal(s.value('H5'), 10); assert.equal(s.clipboard, null); assert.equal(s.selectionText(), 'H5');
  s.select('E1'); s.copy(); s.select('E2:E3'); s.paste('all', 'multiply'); assert.equal(s.value('E2'), 100);
});

test('fill down/right, series and autosum', () => {
  const s = new Sheet();
  s.commitInput('5', 1, 4); s.select('D1:D5'); s.fill('down'); assert.equal(s.value('D5'), 5);
  s.commitInput('=D1*2', 1, 5); s.select('E1:E3'); s.fill('down'); assert.equal(s.formula('E3'), '=D3*2'); assert.equal(s.value('E3'), 10);
  s.select('E2'); s.fill('down'); assert.equal(s.formula('E2'), '=D2*2');     // single-cell Ctrl+D copies the cell above
  s.commitInput('1', 1, 6); s.commitInput('3', 2, 6); s.select('F1:F4'); s.fillSeries(); assert.deepEqual([s.value('F3'), s.value('F4')], [5, 7]);
  s.select('D1:D6'); assert.deepEqual(s.autoSum(), { committed: true }); assert.equal(s.formula('D6'), '=SUM(D1:D5)'); assert.equal(s.value('D6'), 25);
  s.goTo(7, 4); assert.equal(s.autoSum().proposal, '=SUM(D1:D6');
  s.goTo(1, 9); assert.deepEqual(s.autoSum(), { proposal: '=SUM(', range: null });
});

test('sort keeps rows together and blanks last', () => {
  const s = new Sheet({ cells: { A1: { value: 'b' }, B1: { value: 2 }, A2: { value: 'a' }, B2: { value: 1 }, A3: { value: 'c' }, B3: { value: 3 } } });
  s.select('A1:B4'); assert.equal(s.sort('asc'), true);
  assert.deepEqual([s.value('A1'), s.value('B1'), s.value('A3'), s.value('B3'), s.value('A4')], ['a', 1, 'c', 3, null]);
  s.sort('desc'); assert.deepEqual([s.value('A1'), s.value('A4')], ['c', null]);
  s.select('A1:A3'); assert.equal(s.sortNeedsExpand(), true);
});

test('insert and delete rows/columns shift cells, formulas and widths', () => {
  const s = new Sheet({ cells: { A1: { value: 1 }, A2: { value: 2 }, A3: { formula: '=SUM(A1:A2)' }, C1: { formula: '=A1' } }, colW: { 1: 120 } });
  s.select('A1:J1'); assert.equal(s.insertOrDelete(true), true);
  assert.equal(s.value('A1'), null); assert.equal(s.value('A2'), 1); assert.equal(s.formula('A4'), '=SUM(A2:A3)'); assert.equal(s.formula('C2'), '=A2');
  s.setCell('E1', { formula: '=A2' }); s.recalc(); assert.equal(s.value('E1'), 1);
  s.select('A2:J2'); s.insertOrDelete(false); assert.equal(s.formula('A3'), '=SUM(A2:A2)'); assert.equal(s.formula('E1'), '=#REF!'); assert.equal(s.value('E1'), '#REF!'); assert.equal(s.formula('C1'), null);
  s.select('A1:A20'); s.insertOrDelete(true); assert.equal(s.formula('B3'), '=SUM(B2:B2)'); assert.equal(s.colW[2], 120); assert.equal(s.colW[1], 78); assert.equal(s.formula('F1'), '=#REF!');
  s.select('B2'); assert.equal(s.insertOrDelete(true), false);   // partial selection: the chord does nothing
});

test('column widths: autofit, explicit width, auto-grow after number formats', () => {
  const s = new Sheet({ cells: { A1: { value: 1234567.891 } } });
  assert.equal(s.overflowsCol(1), true);
  s.select('A1'); s.autofitCols(); assert.equal(s.overflowsCol(1), false); assert.ok(s.colW[1] > 78);
  s.setColWidth(10); assert.equal(s.colW[1], 75);
  const t = new Sheet({ cells: { B1: { value: 123456 } } }); t.select('B1'); t.setNumberFormat('currency', 2); assert.ok(t.colW[2] > 78);
});

test('toJSON keeps only what differs from a blank cell', () => {
  const s = new Sheet({ cells: { A1: { value: 1, bold: true }, B1: { formula: '=A1*2' } } });
  assert.deepEqual(s.toJSON().cells, { A1: { value: 1, bold: true }, B1: { formula: '=A1*2' } });
});
