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

test('undo and redo re-select the range the operation touched, never a mix of two selections', () => {
  const s = seed();
  s.select('A1:B3'); s.toggleAllOrNone('bold'); s.select('E5:F6');
  s.undo(); assert.equal(s.selectionText(), 'A1:B3'); assert.equal(s.cellAt('A1').bold, false); assert.deepEqual(s.dispActive(), { r: 1, c: 1 });
  s.select('H9'); s.redo(); assert.equal(s.selectionText(), 'A1:B3'); assert.equal(s.cellAt('A1').bold, true);
  const t = seed(); t.select('A1:A3'); t.toggleAllOrNone('bold'); t.move(1, 0, false, false); t.undo(); assert.equal(t.selectionText(), 'A1:A3');
  const u = seed(); u.goTo(3, 3); u.commitInput('5', 3, 3); u.select('A1:B2'); u.undo(); assert.equal(u.selectionText(), 'C3'); assert.equal(u.value('C3'), null);
});

test('autosum on a filled selection writes the totals beside it and never overwrites data', () => {
  const col = new Sheet({ cells: { D1: { value: 10 }, D2: { value: 20 }, D3: { value: 30 }, D4: { value: 40 }, D5: { value: 50 } } });
  col.select('D1:D5'); assert.deepEqual(col.autoSum(), { committed: true });
  assert.equal(col.value('D1'), 10); assert.equal(col.formula('D6'), '=SUM(D1:D5)'); assert.equal(col.value('D6'), 150);
  col.undo(); assert.equal(col.formula('D6'), null);
  col.goTo(5, 4); col.move(-4, 0, true, false); assert.equal(col.selectionText(), 'D1:D5'); col.autoSum(); assert.equal(col.value('D5'), 50); assert.equal(col.formula('D6'), '=SUM(D1:D5)');   // bottom-up selection
  const row = new Sheet({ cells: { A1: { value: 1 }, B1: { value: 2 }, C1: { value: 3 } } }); row.select('A1:C1'); row.autoSum();
  assert.equal(row.value('A1'), 1); assert.equal(row.formula('D1'), '=SUM(A1:C1)'); assert.equal(row.value('D1'), 6);
  const blk = new Sheet({ cells: { A1: { value: 1 }, B1: { value: 2 }, A2: { value: 3 }, B2: { value: 4 } } }); blk.select('A1:B2'); blk.autoSum();
  assert.equal(blk.value('A1'), 1); assert.equal(blk.formula('A3'), '=SUM(A1:A2)'); assert.equal(blk.formula('B3'), '=SUM(B1:B2)');
  const gap = new Sheet({ cells: { A1: { value: 1 }, B1: { value: 2 }, A2: { value: 3 }, B2: { value: 4 } } }); gap.select('A1:B3'); gap.autoSum();
  assert.equal(gap.formula('A3'), '=SUM(A1:A2)'); assert.equal(gap.formula('B3'), '=SUM(B1:B2)'); assert.equal(gap.formula('A4'), null);   // an empty bottom row takes the totals
  const side = new Sheet({ cells: { A1: { value: 1 }, B1: { value: 2 }, A2: { value: 3 }, B2: { value: 4 } } }); side.select('A1:C2'); side.autoSum();
  assert.equal(side.formula('C1'), '=SUM(A1:B1)'); assert.equal(side.formula('C2'), '=SUM(A2:B2)');
  const txt = new Sheet({ cells: { A1: { value: 'a' }, A2: { value: 'b' } } }); txt.select('A1:A2'); assert.deepEqual(txt.autoSum(), { committed: true });
  assert.equal(txt.value('A1'), 'a'); assert.equal(txt.formula('A3'), null); assert.equal(txt.undoStack.length, 0);   // nothing numeric: a no-op, not an empty =SUM( over A1
});

test('sort re-relativises the formulas that move with their row', () => {
  const s = new Sheet({ cells: { A1: { value: 'Pear' }, B1: { value: 2 }, C1: { value: 5 }, D1: { formula: '=B1*C1' }, A2: { value: 'Apple' }, B2: { value: 3 }, C2: { value: 1 }, D2: { formula: '=B2*C2' }, A3: { value: 'Fig' }, B3: { value: 1 }, C3: { value: 9 }, D3: { formula: '=B3*C3' } } });
  s.select('A1:D3'); assert.equal(s.sort('asc', 1), true);
  assert.deepEqual([1, 2, 3].map(r => [s.value('A' + r), s.formula('D' + r), s.value('D' + r)]), [['Apple', '=B1*C1', 3], ['Fig', '=B2*C2', 9], ['Pear', '=B3*C3', 10]]);
  s.undo(); assert.deepEqual([s.value('A1'), s.formula('D1'), s.formula('D3')], ['Pear', '=B1*C1', '=B3*C3']);
  const m = new Sheet({ cells: { A1: { value: 'b' }, D1: { formula: '=B$2' }, A2: { value: 'a' }, D2: { formula: '=B2*$F$1' }, B1: { value: 20 }, B2: { value: 3 }, F1: { value: 10 } } });
  m.select('A1:D2'); m.sort('asc', 1); assert.equal(m.formula('D1'), '=B1*$F$1'); assert.equal(m.value('D1'), 30); assert.equal(m.formula('D2'), '=B$2');   // $-anchored parts stay
});

test('cycle marking zeroes only the loop, whatever the entry order; every member of a loop reads 0', () => {
  const mk = order => { const spec = { A1: { value: 10 }, B1: { value: 20 }, C1: { formula: '=C1+1' }, D1: { formula: '=SUM(A1:C1)' } }; const cells = {}; for (const k of order) cells[k] = spec[k]; return new Sheet({ cells }); };
  assert.equal(mk(['A1', 'B1', 'D1', 'C1']).value('D1'), 30); assert.equal(mk(['A1', 'B1', 'C1', 'D1']).value('D1'), 30);
  const s = new Sheet({ cells: { A1: { value: 10 }, B1: { value: 20 } } });
  s.commitInput('=D1+5', 1, 5); s.commitInput('=SUM(A1:C1)', 1, 4); s.commitInput('=C1+1', 1, 3);
  assert.deepEqual([s.value('E1'), s.value('D1'), s.value('C1')], [35, 30, 0]);
  const two = new Sheet({ cells: { B2: { formula: '=C2+1' }, C2: { formula: '=B2+1' } } }); assert.deepEqual([two.value('B2'), two.value('C2')], [0, 0]);
  const tangle = new Sheet({ cells: { A2: { formula: '=B2+1' }, B2: { formula: '=C2+D2+1' }, C2: { formula: '=A2+1' }, D2: { formula: '=C2+1' } } });
  assert.deepEqual(['A2', 'B2', 'C2', 'D2'].map(k => tangle.value(k)), [0, 0, 0, 0]);
});

test('a self-reference that only exists through OFFSET is circular and stays 0 across unrelated edits', () => {
  const one = new Sheet(); one.commitInput('=OFFSET(B1,0,-1)+1', 1, 1); assert.equal(one.value('A1'), 0);
  one.commitInput('q', 5, 5); assert.equal(one.value('A1'), 0);
  one.select('A1'); one.toggleAllOrNone('bold'); assert.equal(one.value('A1'), 0);
  const many = new Sheet({ cells: { C1: { formula: '=1' }, C2: { formula: '=2' }, C3: { formula: '=3' }, C4: { formula: '=4' }, C5: { formula: '=5' }, C6: { formula: '=6' } } });
  many.commitInput('=OFFSET(B1,0,-1)+1', 1, 1); assert.equal(many.value('A1'), 0);
  const sm = new Sheet({ cells: { A1: { value: 1 }, A2: { value: 2 }, A3: { formula: '=SUM(OFFSET(A1,0,0,3,1))' } } }); assert.equal(sm.value('A3'), 0);
  const ch = new Sheet({ cells: { A1: { value: 1 }, B1: { formula: '=OFFSET(A1,0,0)+1' }, C1: { formula: '=OFFSET(B1,0,0)+1' } } });
  assert.deepEqual([ch.value('B1'), ch.value('C1')], [2, 3]); ch.commitInput('9', 5, 5); assert.deepEqual([ch.value('B1'), ch.value('C1')], [2, 3]);   // a non-cyclic OFFSET chain is stable
});

test('a paste whose footprint would run off the sheet is refused and leaves everything intact', () => {
  const s = new Sheet({ cells: { A1: { value: 10 }, A2: { value: 20 }, A3: { value: 30 }, A4: { value: 40 }, A5: { value: 50 }, C1: { formula: '=SUM(A21:A22)' } } });
  s.select('A1:A5'); s.copy(); s.select('A18'); assert.equal(s.paste('all'), false);
  assert.deepEqual(Object.keys(s.cells).filter(k => +k.slice(1) > s.rows), []); assert.equal(s.value('A18'), null); assert.equal(s.value('C1'), 0);
  assert.equal(s.selectionText(), 'A18'); assert.equal(s.undoStack.length, 0); assert.ok(s.clipboard);
  s.select('A16'); assert.equal(s.paste('all'), true); assert.equal(s.value('A20'), 50);
  const c = new Sheet({ cells: { J1: { value: 1 }, J2: { value: 2 } } }); c.select('J1:J2'); c.copy(true); c.select('J20');
  assert.equal(c.paste(), false); assert.equal(c.value('J1'), 1); assert.equal(c.value('J21'), null); assert.ok(c.clipboard);   // the cut source is untouched, the marquee stays
  const t = new Sheet({ cells: { A1: { value: 1 }, A2: { value: 2 }, A3: { value: 3 }, A4: { value: 4 }, A5: { value: 5 } } }); t.select('A1:A5'); t.copy();
  t.select('H1'); assert.equal(t.paste('transpose'), false); assert.equal(t.value('K1'), null);
  t.select('F1'); assert.equal(t.paste('transpose'), true); assert.equal(t.value('J1'), 5);
  const m = new Sheet({ cells: { A1: { value: 1 } } }); m.select('A1'); m.copy(); m.select('A1:A20'); assert.equal(m.paste(), true); assert.equal(m.value('A20'), 1);   // tiling over an in-grid selection is fine
});

test('commit parsing keeps typed precision, reads trailing/leading-point numbers, and scales every numeric entry in a percent cell', () => {
  assert.deepEqual(Sheet.classifyInput('1,234.56'), { kind: 'value', value: 1234.56, fmtStyle: 'comma', decimals: 2 });
  assert.deepEqual(Sheet.classifyInput('12.55%'), { kind: 'value', value: 0.1255, fmtStyle: 'percent', decimals: 2 });
  const show = txt => { const s = new Sheet(); s.commitInput(txt, 1, 1); return s.text('A1'); };
  assert.equal(show('1,234.56'), '1,234.56'); assert.equal(show('12.55%'), '12.55%'); assert.equal(show('1,234.5'), '1,234.5'); assert.equal(show('1,000.00'), '1,000.00'); assert.equal(show('12%'), '12%');
  assert.deepEqual(Sheet.classifyInput('1.'), { kind: 'value', value: 1 }); assert.deepEqual(Sheet.classifyInput('.5e2'), { kind: 'value', value: 50 });
  assert.deepEqual(Sheet.classifyInput('1.e2'), { kind: 'value', value: 100 }); assert.deepEqual(Sheet.classifyInput('+1.'), { kind: 'value', value: 1 });
  assert.deepEqual(Sheet.classifyInput('1.5e-2'), { kind: 'value', value: 0.015 });
  for (const t of ['.', '+', '-', 'e5']) assert.deepEqual(Sheet.classifyInput(t), { kind: 'value', value: t, txt: true });
  const s = new Sheet(); s.commitInput('1.', 1, 1); assert.equal(s.cellAt('A1').txt, false); assert.equal(s.value('A1'), 1);
  assert.deepEqual(Sheet.classifyInput('1,234', { fmtStyle: 'percent' }), { kind: 'value', value: 12.34, fmtStyle: undefined, decimals: undefined });
  const p = txt => { const t = new Sheet(); t.setCell('A1', { fmtStyle: 'percent' }); t.commitInput(txt, 1, 1); return [t.value('A1'), t.text('A1')]; };
  assert.deepEqual(p('1234'), [12.34, '1234%']); assert.deepEqual(p('1,234'), [12.34, '1234%']); assert.deepEqual(p('(1,234)'), [-12.34, '-1234%']); assert.deepEqual(p('1e2'), [1, '100%']);
});

test('an insert that would push a non-blank cell off the grid is refused; a blank pushed off leaves #REF! behind', () => {
  const s = new Sheet({ cells: { J1: { value: 99 }, A1: { formula: '=J1*2' } } }); s.select('B1:B20'); const before = JSON.stringify(s.toJSON());
  assert.equal(s.insertOrDelete(true), false); assert.equal(JSON.stringify(s.toJSON()), before); assert.equal(s.undoStack.length, 0); assert.equal(s.value('A1'), 198);
  const r = new Sheet({ cells: { A20: { value: 7 }, A1: { formula: '=A20+1' } } }); r.select('A2:J2'); assert.equal(r.insertOrDelete(true), false); assert.equal(r.formula('A1'), '=A20+1');
  const f = new Sheet({ cells: { J1: { bold: true } } }); f.select('A1:A20'); assert.equal(f.insert('c'), false);   // formatting counts as non-blank, like Excel
  const b = new Sheet({ cells: { A1: { formula: '=J1' }, B1: { formula: '=SUM(H1:J1)' }, C1: { formula: '=SUM(J1:J2)' }, D1: { formula: '=$J$1' } } }); b.select('B1:B20');
  assert.equal(b.insertOrDelete(true), true); assert.equal(b.formula('A1'), '=#REF!'); assert.equal(b.value('A1'), '#REF!');
  assert.equal(b.formula('C1'), '=SUM(I1:J1)'); assert.equal(b.formula('D1'), '=SUM(#REF!)'); assert.equal(b.formula('E1'), '=#REF!'); assert.ok(!b.cells.K1);
  const rr = new Sheet({ cells: { A1: { formula: '=A20' }, B1: { formula: '=SUM(A19:A20)' } } }); rr.select('A2:J2'); assert.equal(rr.insertOrDelete(true), true);
  assert.equal(rr.formula('A1'), '=#REF!'); assert.equal(rr.formula('B1'), '=SUM(A20:A20)'); assert.ok(!rr.cells.A21);
});

test('deleting rows keeps the active column and deleting columns keeps the active row', () => {
  const s = new Sheet({ cells: { C3: { value: 1 }, C4: { value: 2 }, C5: { value: 3 } } }); s.select('C3:C4'); s.remove('r'); assert.equal(s.selectionText(), 'C3'); assert.equal(s.value('C3'), 3);
  const c = new Sheet(); c.select('C5:D5'); c.remove('c'); assert.equal(c.selectionText(), 'C5');
  const b = new Sheet(); b.select('B3:D4'); b.remove('r'); assert.equal(b.selectionText(), 'B3');   // the displayed anchor's column, not the far corner's
  const w = new Sheet(); w.goTo(4, 3); w.selectRow(); assert.equal(w.insertOrDelete(false), true); assert.equal(w.selectionText(), 'C4');   // the Ctrl+- chord too
});

test('an inserted band inherits formats (alignment, borders) but never a comment or the text flag', () => {
  const s = new Sheet({ cells: { A1: { value: 'Total', bold: true, cmt: true, ca: 3, bt: true } } }); s.select('A2:J2'); s.insertOrDelete(true);
  const a2 = s.cellAt('A2'); assert.equal(a2.bold, true); assert.equal(a2.ca, 3); assert.equal(a2.bt, true); assert.equal(a2.cmt, false); assert.equal(a2.txt, false); assert.equal(a2.value, null);
  assert.equal(s.cellAt('A1').cmt, true); assert.ok(!s.cells.B2);
  const k = new Sheet({ cells: { A1: { value: 'T', bold: true, cmt: true } } }); k.select('B1:B20'); k.insertOrDelete(true); assert.equal(k.cellAt('B1').bold, true); assert.equal(k.cellAt('B1').cmt, false);
  const o = new Sheet({ cells: { A1: { value: 'T', cmt: true } } }); o.select('A2:J2'); o.insertOrDelete(true); assert.ok(!o.cells.A2);   // a comment alone is nothing to inherit
});

test('select() clamps a range to the grid, so selection ops never create off-grid cells', () => {
  const s = new Sheet(); s.select('A1:Z50'); assert.equal(s.selectionText(), 'A1:J20'); s.toggleAllOrNone('bold');
  assert.equal(Object.keys(s.cells).length, s.rows * s.cols); assert.ok(!s.cells.Z50);
  s.select('H15:M25'); assert.equal(s.selectionText(), 'H15:J20');
  s.select('K21:Z50'); assert.equal(s.selectionText(), 'J20'); assert.equal(s.sel, null);   // collapses to a single cell
  assert.deepEqual(new Sheet({ active: { r: 99, c: 99 } }).active, { r: 20, c: 10 });
});

test('an empty entry is a no-op: no undo frame, the redo stack survives', () => {
  const s = new Sheet(); s.commitInput('5', 1, 1); s.undo(); assert.equal(s.redoStack.length, 1);
  assert.deepEqual(s.commitInput('', 2, 2), { kind: 'empty' }); assert.equal(s.redoStack.length, 1); assert.equal(s.undoStack.length, 0); assert.ok(!s.cells.B2);
  assert.equal(s.redo(), true); assert.equal(s.value('A1'), 5);
  const t = new Sheet(); t.commitInput('5', 1, 1); t.undo(); t.select('B2:B3'); assert.deepEqual(t.commitInputAll('', 2, 2), { kind: 'empty' });
  assert.equal(t.redoStack.length, 1); assert.equal(t.undoStack.length, 0); assert.equal(t.redo(), true); assert.equal(t.value('A1'), 5);
});

test('sheet-level pins for the formula-engine review: arity refusals, error literals, unary plus, whole-column self-references', () => {
  assert.equal(Sheet.classifyInput('=SUM()').kind, 'bad', 'arity is checked at entry, so classifyInput refuses what Excel refuses');
  assert.deepEqual(Sheet.classifyInput('=#n/a'), { kind: 'formula', formula: '=#N/A' }, 'error literals are stored upper-cased');
  const s = new Sheet({ cells: { E1: { value: 'apple' }, A1: { value: 1 }, A2: { value: 2 } } });
  s.commitInput('=+E1', 1, 6); assert.equal(s.value('F1'), 'apple', '=+E1 shows the text unchanged');
  s.commitInput('=SUM(A:A)', 6, 1); assert.equal(s.value('A6'), 0, '=SUM(A:A) in column A is circular and reads 0');
  s.commitInput('=SUM(A1:A2)', 7, 1); assert.equal(s.value('A7'), 3, 'a plain range in the same column is not');
  const big = new Sheet({ rows: 40, cols: 12, cells: { A1: { value: 5 } } });
  big.commitInput('=SUM(A:A)', 30, 1); assert.equal(big.value('A30'), 0, 'the sheet size reaches formulaRefs: circular on a 40-row sheet too');
  big.commitInput('=SUM(A:A)', 2, 2); assert.equal(big.value('B2'), 5);
  // paste and column insert move whole-column references like any other
  const p = new Sheet({ cells: { B1: { value: 1 }, B2: { value: 2 }, C1: { formula: '=SUM(B:B)' } } });
  assert.equal(p.value('C1'), 3);
  p.select('C1'); p.copy(); p.select('A1'); p.paste('all'); assert.equal(p.formula('A1'), '=SUM(#REF!)'); assert.equal(p.value('A1'), '#REF!');
  const q = new Sheet({ cells: { B1: { value: 1 }, B2: { value: 2 }, D1: { formula: '=SUM(B:B)' } } });
  q.select('A1'); q.insert('c'); assert.equal(q.formula('E1'), '=SUM(C:C)'); assert.equal(q.value('E1'), 3);
});
