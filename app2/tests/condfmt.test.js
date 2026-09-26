// app2/tests/condfmt.test.js — conditional formatting (Chapter 2): an ordered rule list on the
// sheet, evaluated by condFmtMap() for the painter and the graders. Highlight presets, formula
// rules, data bars, colour scales, precedence, Stop If True, clear, undo, structure shifts,
// serialisation, and the Alt H L walk / mouse reaching the same state.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet, normCondFmt, cfOperand, subtractRect, rectsOfKeys, mergeRects, CF_STYLES, CF_BAR_COLORS, CF_SCALES, mixHex } from '../engine/sheet.js';
import { Session, CF_VALUE_NOTE, CF_FORMULA_NOTE } from '../engine/keyboard.js';
import { runCommand } from '../ui/ribbon-commands.js';
import { sessionToState, diffStates } from '../content/workbooks/voltline-weekly.js';

const CELLS = { A1: { value: 'Site' }, B1: { value: 'Rev' }, C1: { value: 'Cost' },
  A2: { value: 'North' }, B2: { value: 100 }, C2: { value: 80 },
  A3: { value: 'South' }, B3: { value: 40 }, C3: { value: 60 },
  A4: { value: 'East' }, B4: { value: 70 }, C4: { value: 70 },
  A5: { value: 'West' }, B5: { value: 0 }, C5: { value: 10 } };
const sheet = (extra = {}) => new Sheet({ cells: structuredClone(CELLS), ...extra });
const fresh = () => new Session(sheet(), { now: () => 0 });

test('normCondFmt: sane shapes, priority order kept, malformed rules dropped, defaults filled', () => {
  const rules = normCondFmt([
    { range: 'B2:B5', kind: 'cellValue', op: '>', v1: 50, style: 'green' },
    { range: 'nope', kind: 'cellValue', op: '>', v1: 1 },
    { range: 'B2:B5', kind: 'cellValue', op: 'is', v1: 1 },
    { range: 'B2:B5', kind: 'formula', formula: 'B2>C2' },
    { range: 'B2:B5', kind: 'formula', formula: '   ' },
    { range: 'C2:C5', kind: 'dataBar', color: 'teal' },
    { range: 'C2:C5', kind: 'colorScale' },
    { range: 'C2:C5', kind: 'sparkline' },
  ]);
  assert.equal(rules.length, 4);
  assert.deepEqual(rules.map(r => r.kind), ['cellValue', 'formula', 'dataBar', 'colorScale']);
  assert.equal(rules[0].style, 'green'); assert.equal(rules[0].stopIfTrue, false);
  assert.equal(rules[1].formula, '=B2>C2'); assert.equal(rules[1].style, 'lightred');
  assert.equal(rules[2].color, 'blue'); assert.equal(rules[3].scale, 'green-yellow-red');
  assert.equal(new Set(rules.map(r => r.id)).size, 4);
  assert.ok(Object.keys(CF_STYLES).length === 6 && CF_BAR_COLORS.length === 6 && CF_SCALES.length === 8);
});

test('Highlight Cells presets paint the cells that qualify; a formula operand is read on the sheet', () => {
  const S = sheet();
  S.select('B2:C5'); const r = S.addCondFmt({ kind: 'cellValue', op: '>', v1: 65, style: 'green' });
  assert.equal(r.range, 'B2:C5'); assert.equal(S.condFmt.length, 1);
  const m = S.condFmtMap();
  assert.deepEqual(Object.keys(m).sort(), ['B2', 'B4', 'C2', 'C4']);
  assert.deepEqual(m.B2, { fill: '#c6efce', fontColor: '#006100' });
  S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: 'between', v1: 30, v2: 80, style: 'yellow' });
  const m2 = S.condFmtMap(); assert.equal(m2.B3.fill, '#ffeb9c'); assert.equal(m2.B4.fill, '#ffeb9c', 'between is inclusive-ish and the top rule wins its own props');
  S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '=', v1: 0, style: 'redtext' });
  assert.deepEqual(S.condFmtMap().B5, { fontColor: '#9c0006' });
  S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '<', v1: '=$C$2', style: 'redborder' });   // a formula operand
  const m3 = S.condFmtMap(); assert.equal(m3.B3.border, '#9c0006'); assert.equal(m3.B5.border, '#9c0006'); assert.equal(m3.B2.border, undefined);
  assert.equal(S.condFmtRulesAt(3, 2).length, 4); assert.equal(S.condFmtRulesAt(3, 3).length, 1); assert.equal(S.condFmtRulesAt(9, 9).length, 0);
});

test('a formula rule is written for the top-left cell and translated across the range', () => {
  const S = sheet();
  S.select('A2:C5'); S.addCondFmt({ kind: 'formula', formula: '=$B2<$C2', style: 'lightred' });
  const m = S.condFmtMap();
  assert.deepEqual(Object.keys(m).sort(), ['A3', 'A5', 'B3', 'B5', 'C3', 'C5'], 'the two loss-making rows, every column');
  assert.equal(m.A3.fill, '#ffc7ce');
  S.clearCondFmt('sheet');
  S.select('B2:B5'); S.addCondFmt({ kind: 'formula', formula: '=ISBLANK(B2)', style: 'yellow' });
  assert.deepEqual(S.condFmtMap(), {});
  S.goTo(3, 2); S.clearContents(); assert.deepEqual(Object.keys(S.condFmtMap()), ['B3']);   // a formula rule can paint a blank
  S.select('B2:B5'); S.addCondFmt({ kind: 'formula', formula: '=1/0', style: 'yellow' });
  assert.deepEqual(Object.keys(S.condFmtMap()), ['B3'], 'an erroring formula paints nothing');
});

test('precedence: rules run top-down, the first rule to set a property wins, Stop If True ends the walk', () => {
  const S = sheet();
  S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 30, style: 'yellow' });       // added first: ends up BELOW
  S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 60, style: 'green' });        // added last: on top
  assert.deepEqual(S.condFmt.map(r => r.style), ['green', 'yellow']);
  let m = S.condFmtMap();
  assert.equal(m.B2.fill, '#c6efce', 'green wins on 100'); assert.equal(m.B3.fill, '#ffeb9c', 'only yellow holds on 40'); assert.equal(m.B5, undefined);
  S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 0, style: 'redtext' });       // on top: font colour only
  m = S.condFmtMap(); assert.deepEqual(m.B2, { fontColor: '#9c0006', fill: '#c6efce' }, 'a lower rule still supplies the props the top one left unset');
  const top = S.condFmt[0]; assert.equal(S.setCondFmtStop(top.id, true), true); assert.equal(S.condFmt[0].stopIfTrue, true);
  m = S.condFmtMap(); assert.deepEqual(m.B2, { fontColor: '#9c0006' }, 'Stop If True: nothing below runs where it holds'); assert.equal(m.B5, undefined);
  S.cellAt('B5').value = -5; m = S.condFmtMap(); assert.deepEqual(m.B5, undefined);
  assert.equal(S.moveCondFmt(top.id, 1), true); assert.deepEqual(S.condFmt.map(r => r.style), ['green', 'redtext', 'yellow']);
  m = S.condFmtMap(); assert.deepEqual(m.B2, { fill: '#c6efce', fontColor: '#006100' }, 'moved down: green paints first and keeps its font colour, then the stop rule ends the walk');
  assert.equal(S.moveCondFmt(top.id, 1), true); assert.equal(S.moveCondFmt(top.id, 1), false, 'already at the bottom');
  assert.equal(S.moveCondFmt('nope', -1), false);
  assert.equal(S.removeCondFmt(top.id), true); assert.equal(S.condFmt.length, 2); assert.equal(S.removeCondFmt(top.id), false);
});

test('data bars scale to the range; colour scales blend between the gallery colours', () => {
  const S = sheet();
  S.select('B2:B5'); S.addCondFmt({ kind: 'dataBar', color: 'green' });
  const m = S.condFmtMap();
  assert.deepEqual(m.B2.bar, { pct: 1, color: '#63c384' }); assert.equal(m.B5, undefined, 'a zero draws no bar (Excel\'s automatic bars are proportional to zero)'); assert.equal(m.B3.bar.pct, 0.4);
  assert.equal(m.A2, undefined, 'text gets no bar');
  S.clearCondFmt('sheet');
  S.select('B2:B5'); S.addCondFmt({ kind: 'colorScale', scale: 'green-yellow-red' });
  const c = S.condFmtMap();
  // the default midpoint is Percentile 50: for 0, 40, 70, 100 that is 55 (PERCENTILE.INC), the mean of the two middle values
  assert.equal(c.B2.scale, '#f8696b', 'max → the last colour'); assert.equal(c.B5.scale, '#63be7b', 'min → the first');
  assert.equal(c.B3.scale, mixHex('#63be7b', '#ffeb84', 40 / 55), '40 is 40/55 of the way from green to yellow'); assert.equal(c.B3.scale, '#d4df82');
  assert.equal(c.B4.scale, mixHex('#ffeb84', '#f8696b', 15 / 45), '70 is 15/45 of the way from yellow to red'); assert.equal(c.B4.scale, '#fdc07c');
  assert.equal(c.B3.fill, c.B3.scale, 'a colour scale is the cell\'s fill (it takes the fill slot in precedence)');
  S.clearCondFmt('sheet');
  S.select('B2:B5'); S.addCondFmt({ kind: 'colorScale', scale: 'white-green' });
  const two = S.condFmtMap(); assert.equal(two.B5.scale, '#fcfcff'); assert.equal(two.B2.scale, '#63be7b'); assert.equal(two.B3.scale, mixHex('#fcfcff', '#63be7b', 0.4));
  const one = sheet(); one.select('B2'); one.addCondFmt({ kind: 'dataBar' }); assert.equal(one.condFmtMap().B2.bar.pct, 1, 'a lone value fills its bar');
  assert.equal(mixHex('#000000', '#ffffff', 0.5), '#808080');
});

test('Clear Rules: from the selection (rules that meet it) or the whole sheet; undo brings them back', () => {
  const S = sheet();
  S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 50 });
  S.select('C2:C5'); S.addCondFmt({ kind: 'dataBar' });
  assert.equal(S.clearCondFmt('selection'), true); assert.equal(S.condFmt.length, 1); assert.equal(S.condFmt[0].kind, 'cellValue');
  S.select('A1'); assert.equal(S.clearCondFmt('selection'), false, 'nothing meets A1');
  assert.equal(S.undo(), true); assert.equal(S.condFmt.length, 2);
  assert.equal(S.clearCondFmt('sheet'), true); assert.equal(S.condFmt.length, 0); assert.equal(S.clearCondFmt('sheet'), false);
  S.undo(); assert.equal(S.condFmt.length, 2); S.undo(); assert.equal(S.condFmt.length, 1); S.undo(); assert.equal(S.condFmt.length, 0);
  S.redo(); assert.equal(S.condFmt.length, 1);
});

test('inserting and deleting rows / columns move a rule\'s range and formula; a rule with no cells left is dropped; JSON round-trips', () => {
  const S = sheet();
  S.select('B2:B5'); S.addCondFmt({ kind: 'formula', formula: '=B2>C2', style: 'green' });
  S.select('C2:C5'); S.addCondFmt({ kind: 'dataBar' });
  S.select('A1:Z1'); S.insert('r');
  assert.deepEqual(S.condFmt.map(r => r.range), ['C3:C6', 'B3:B6']); assert.equal(S.condFmt[1].formula, '=B3>C3');
  S.select('A1:A100'); S.insert('c');
  assert.deepEqual(S.condFmt.map(r => r.range), ['D3:D6', 'C3:C6']); assert.equal(S.condFmt[1].formula, '=C3>D3');
  S.select('A4:Z4'); S.remove('r');
  assert.deepEqual(S.condFmt.map(r => r.range), ['D3:D5', 'C3:C5']);
  S.select('D1:D100'); S.remove('c');
  assert.deepEqual(S.condFmt.map(r => r.range), ['C3:C5'], 'the data-bar column is gone, so is its rule'); assert.equal(S.condFmt[0].formula, '=C3>#REF!');
  const json = S.toJSON(); assert.equal(json.condFmt.length, 1);
  const again = new Sheet(json); assert.deepEqual(again.condFmt, S.condFmt);
  assert.equal(new Sheet().toJSON().condFmt, undefined, 'no rules: nothing serialised');
  const snap = S.snapshot(); S.clearCondFmt('sheet'); S.restore(snap); assert.equal(S.condFmt.length, 1);
});

test('Alt H L H G / L / B / E and Alt H L N: the card takes the value or formula, ← → the style, ↵ adds the rule on top', () => {
  let s = fresh(); const S = s.sheet;
  s.run('Alt H L'); assert.deepEqual(s.path, ['H', 'L']);
  s.run('H G'); assert.equal(s.dialog, 'condfmt'); assert.equal(s.dlg.op, '>'); assert.equal(s.dlg.focus, 'v1');
  s.run('Escape'); assert.equal(s.dialog, null); assert.deepEqual(s.path, ['H', 'L', 'H'], 'Esc closes the card back to the menu it came from, as every walk-opened card does');
  const out = () => { while (s.mode !== 'normal') s.run('Escape'); };
  out(); assert.equal(S.condFmt.length, 0);
  S.select('B2:B5'); s.run('Alt H L H G "60" Right Right Enter');
  assert.equal(s.mode, 'normal'); assert.equal(S.condFmt.length, 1);
  assert.equal(S.condFmt[0].op, '>'); assert.equal(S.condFmt[0].v1, 60); assert.equal(S.condFmt[0].style, 'green'); assert.equal(S.condFmt[0].range, 'B2:B5');
  s.run('Alt H L H L "50" Enter'); assert.equal(S.condFmt[0].op, '<'); assert.equal(S.condFmt[0].style, 'lightred'); assert.equal(S.condFmt.length, 2);
  s.run('Alt H L H B "30" Tab "80" Tab Left Enter'); assert.equal(S.condFmt[0].op, 'between'); assert.deepEqual([S.condFmt[0].v1, S.condFmt[0].v2], [30, 80]); assert.equal(S.condFmt[0].style, 'redborder');
  s.run('Alt H L H E "=$C$2" Enter'); assert.equal(S.condFmt[0].op, '='); assert.equal(S.condFmt[0].v1, '=$C$2');
  s.run('Alt H L H E "12%" Enter'); assert.equal(S.condFmt[0].v1, 0.12);
  s.run('Alt H L N "=$B2<$C2" Down Enter'); assert.equal(S.condFmt[0].kind, 'formula'); assert.equal(S.condFmt[0].formula, '=$B2<$C2'); assert.equal(S.condFmt[0].style, 'yellow');
  // refused entries keep the card open with Excel's note: an empty box, an unfinished formula — text is a valid value ("abc" is compared as text)
  s.run('Alt H L H G "abc" Enter'); assert.equal(s.mode, 'normal'); assert.equal(S.condFmt[0].v1, 'abc');
  s.run('Alt H L H G Enter'); assert.equal(s.dialog, 'condfmt'); assert.equal(s.note, CF_VALUE_NOTE); out();
  s.run('Alt H L H G "=B2>" Enter'); assert.equal(s.dialog, 'condfmt'); assert.equal(s.note, CF_VALUE_NOTE); out();
  s.run('Alt H L N "=B2>" Enter'); assert.equal(s.dialog, 'condfmt'); assert.equal(s.note, CF_FORMULA_NOTE); out();
  s.run('Alt H L N Enter'); assert.equal(s.note, CF_FORMULA_NOTE); out();
  assert.equal(S.condFmt.length, 7);
  // the value field keeps what was typed, case and all; Backspace edits it
  s.run('Alt H L H G "1x0" Backspace Backspace "5" Enter'); assert.equal(S.condFmt[0].v1, 15);
  assert.equal(s.mode, 'normal');
});

test('Alt H L D / S galleries, Alt H L C S / E clears, Alt H L R manages: ↑ ↓ pick, Delete, U / D move, S stop', () => {
  const s = fresh(); const S = s.sheet;
  S.select('B2:B5'); s.run('Alt H L D Right Enter'); assert.equal(S.condFmt[0].kind, 'dataBar'); assert.equal(S.condFmt[0].color, 'green');
  s.run('Alt H L S Left Enter'); assert.equal(S.condFmt[0].kind, 'colorScale'); assert.equal(S.condFmt[0].scale, 'red-white');
  s.run('Alt H L S Enter'); assert.equal(S.condFmt[0].scale, 'green-yellow-red');
  S.select('C2:C5'); s.run('Alt H L H G "65" Enter'); assert.equal(S.condFmt.length, 4);
  // Manage Rules: the list in precedence order, the selection walks it, every edit is live
  s.run('Alt H L R'); assert.equal(s.dialog, 'condrules'); assert.equal(s.dlg.sel, 0);
  s.run('S'); assert.equal(S.condFmt[0].stopIfTrue, true); s.run('S'); assert.equal(S.condFmt[0].stopIfTrue, false);
  s.run('Down S'); assert.equal(S.condFmt[1].stopIfTrue, false, 'Stop If True is greyed out on a colour scale: S does nothing there');
  s.run('D'); assert.equal(s.dlg.sel, 2); assert.equal(S.condFmt[2].scale, 'green-yellow-red');
  s.run('U U'); assert.equal(s.dlg.sel, 0); assert.equal(S.condFmt[0].scale, 'green-yellow-red'); assert.equal(S.condFmt[1].op, '>');
  s.run('Delete'); assert.equal(S.condFmt.length, 3); assert.equal(S.condFmt[0].op, '>');
  s.run('Down Down Down Down'); assert.equal(s.dlg.sel, 2); s.run('Delete'); assert.equal(S.condFmt.length, 2); assert.equal(s.dlg.sel, 1);
  s.run('Enter'); assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null);
  // Clear Rules from Selected Cells trims the rule to the cells outside the selection; the whole range clears it
  S.select('C3'); s.run('Alt H L C S'); assert.equal(S.condFmt.length, 2); assert.equal(S.condFmt[0].range, 'C2,C4:C5'); assert.equal(s.mode, 'normal');
  S.select('C2:C5'); s.run('Alt H L C S'); assert.equal(S.condFmt.length, 1); assert.equal(S.condFmt[0].kind, 'colorScale');
  s.run('Alt H L C E'); assert.equal(S.condFmt.length, 0);
  s.run('Ctrl+Z'); assert.equal(S.condFmt.length, 1, 'undo brings the rules back');
  s.run('Alt H L R'); assert.equal(s.dialog, 'condrules'); s.run('Delete Delete Enter'); assert.equal(S.condFmt.length, 0);   // a second Delete on an empty list is nothing
});

test('the mouse reaches the same dialog state as the keyboard, with an empty path; dialogSet drives the cards', () => {
  const state = x => JSON.stringify(x.sheet.toJSON().condFmt.map(({ id, ...r }) => r));
  let m = fresh(), k = fresh();
  m.sheet.select('B2:B5'); k.sheet.select('B2:B5');
  runCommand(m, 'HLHG'); assert.equal(m.dialog, 'condfmt'); assert.deepEqual(m.path, []); assert.equal(m.dlg.op, '>');
  assert.equal(m.dialogSet('style', 2), true); assert.equal(m.dlg.styleIdx, 2); assert.equal(m.dlg.focus, 'style'); assert.equal(m.dialogSet('style', 9), false);
  assert.equal(m.dialogSet('focus', 'v1'), true); m.run('"60" Enter');
  k.run('Alt H L H G "60" Right Right Enter'); assert.equal(state(m), state(k));
  m = fresh(); k = fresh(); m.sheet.select('B2:B5'); k.sheet.select('B2:B5');
  runCommand(m, 'HLD'); assert.equal(m.dialog, 'databar'); assert.equal(m.dialogSet('pick', 1), true); m.run('Enter');
  k.run('Alt H L D Right Enter'); assert.equal(state(m), state(k));
  runCommand(m, 'HLS'); assert.equal(m.dialog, 'colorscale'); assert.equal(m.dialogSet('pick', 7), true); assert.equal(m.dialogSet('pick', 8), false); m.run('Enter');
  k.run('Alt H L S Left Enter'); assert.equal(state(m), state(k));
  runCommand(m, 'HLR'); assert.equal(m.dialog, 'condrules'); assert.equal(m.dialogSet('rule', 1), true); assert.equal(m.dlg.sel, 1); assert.equal(m.dialogSet('rule', 5), false);
  assert.equal(m.dialogSet('ruleact', 'Delete'), true); assert.equal(m.sheet.condFmt.length, 1); assert.equal(m.dialogSet('ruleact', 'X'), false); m.run('Escape');
  k.run('Alt H L R Down Delete Escape'); assert.equal(state(m), state(k));
  runCommand(m, 'HLCE'); assert.equal(m.sheet.condFmt.length, 0); assert.equal(m.mode, 'normal');
  runCommand(m, 'HLN'); assert.equal(m.dialog, 'condfmt'); assert.equal(m.dlg.op, 'formula'); m.run('Escape');
  runCommand(m, 'HLCS'); assert.equal(m.mode, 'normal');
});

test('sessionToState / diffStates see the rules, ids aside', () => {
  const a = fresh(), b = fresh();
  a.sheet.select('B2:B5'); a.run('Alt H L H G "60" Enter');
  const d = diffStates(sessionToState(a), sessionToState(b));
  assert.equal(d.length, 1); assert.equal(d[0].kind, 'condFmt');
  b.sheet.select('B2:B5'); b.run('Alt H L H G "60" Enter');
  assert.deepEqual(diffStates(sessionToState(a), sessionToState(b)), [], 'the same rule, different ids: no difference');
  b.run('Alt H L R S Enter');
  assert.equal(diffStates(sessionToState(a), sessionToState(b)).length, 1, 'Stop If True is a difference');
});

/* ---- the Excel-parity fixes (condfmt review): each test fails on the engine before its fix ---- */

test('F1: condFmtMap() is memoised until the cells or the rules change; a rule is parsed once and evaluated per cell with an offset', () => {
  const S = sheet();
  S.select('A2:C5'); S.addCondFmt({ kind: 'formula', formula: '=$B2<$C2', style: 'lightred' });
  const a = S.condFmtMap(); S.move(1, 0); S.select('B2:B4'); S.goTo(3, 3);
  assert.equal(S.condFmtMap(), a, 'a selection change never re-evaluates the rules');
  S.commitInput('1', 2, 3); assert.notEqual(S.condFmtMap(), a, 'an edit does'); assert.deepEqual(Object.keys(S.condFmtMap()).sort(), ['A3', 'A5', 'B3', 'B5', 'C3', 'C5'], 'row 2 no longer qualifies: 100 < 1 is false');
  const b = S.condFmtMap(); S.select('B2:B5'); S.addCondFmt({ kind: 'dataBar' }); assert.notEqual(S.condFmtMap(), b, 'so does a rule change');
  const c = S.condFmtMap(); S.undo(); assert.notEqual(S.condFmtMap(), c, 'and undo');
  // whole-column / whole-row references shift with the cell too, $ kept, as translating the text would
  const T = new Sheet({ cells: { A1: { value: 5 }, A2: { value: 5 }, B1: { value: 1 }, C1: { value: 1 } } });
  T.select('A1:C1'); T.addCondFmt({ kind: 'formula', formula: '=SUM(A:A)>5', style: 'green' });
  assert.deepEqual(Object.keys(T.condFmtMap()), ['A1'], 'A:A walks to B:B and C:C');
  T.clearCondFmt('sheet'); T.select('A1:C1'); T.addCondFmt({ kind: 'formula', formula: '=SUM($A:$A)>5', style: 'green' });
  assert.deepEqual(Object.keys(T.condFmtMap()).sort(), ['A1', 'B1', 'C1'], '$A:$A stays');
});

test('F2: the presets compare like the formula =A1>5 — text and booleans rank above every number, a blank reads as 0, an error cell is never formatted', () => {
  const cells = { B2: { value: 100 }, B3: { value: 'abc' }, B5: { value: true }, B6: { value: -5 }, B7: { formula: '=1/0' }, B8: { value: 0 }, B9: { value: '100' } };   // B4 blank
  const run = (op, v1, v2) => { const S = new Sheet({ cells: structuredClone(cells) }); S.select('B2:B9'); S.addCondFmt({ kind: 'cellValue', op, v1, v2, style: 'yellow' }); return Object.keys(S.condFmtMap()).sort(); };
  assert.deepEqual(run('>', 5), ['B2', 'B3', 'B5', 'B9']);
  assert.deepEqual(run('<', 5), ['B4', 'B6', 'B8']);
  assert.deepEqual(run('=', 0), ['B4', 'B8']);
  assert.deepEqual(run('<>', 5), ['B2', 'B3', 'B4', 'B5', 'B6', 'B8', 'B9']);
  assert.deepEqual(run('between', -10, 10), ['B4', 'B6', 'B8']);
  assert.deepEqual(run('notBetween', -10, 10), ['B2', 'B3', 'B5', 'B9']);
  assert.deepEqual(run('>=', 5), ['B2', 'B3', 'B5', 'B9']); assert.deepEqual(run('<=', 5), ['B4', 'B6', 'B8']);
  // the Excel idiom now has something to do: a Blanks rule with Stop If True above a Less Than rule spares the blank
  const S = new Sheet({ cells: structuredClone(cells) });
  S.select('B2:B9'); S.addCondFmt({ kind: 'cellValue', op: '<', v1: 5, style: 'lightred' });
  S.select('B2:B9'); const blanks = S.addCondFmt({ kind: 'formula', formula: '=ISBLANK(B2)', style: 'yellow' }); S.setCondFmtStop(blanks.id, true);
  const m = S.condFmtMap(); assert.equal(m.B4.fill, '#ffeb9c'); assert.equal(m.B6.fill, '#ffc7ce');
});

test('F3: Equal To (and every preset) takes text, dates, $5, (3) and TRUE like a cell entry; text matches case aside; 0x10 is text', () => {
  const cells = { A1: { value: 'Site' }, A2: { value: 'North' }, A3: { value: 'north' }, A4: { value: 'South' }, A5: { value: 'NORTH' }, B2: { value: 100 }, B3: { value: 5 }, B4: { value: 16 }, B5: { value: 20 } };
  const model = (op, v1) => { const S = new Sheet({ cells: structuredClone(cells) }); S.select('A2:A5'); S.addCondFmt({ kind: 'cellValue', op, v1, style: 'yellow' }); return Object.keys(S.condFmtMap()).sort(); };
  assert.deepEqual(model('=', 'North'), ['A2', 'A3', 'A5']); assert.deepEqual(model('<>', 'North'), ['A4']);
  assert.deepEqual(model('=', '=$A$2'), ['A2', 'A3', 'A5'], 'a formula operand may return text'); assert.deepEqual(model('=', '="north"'), ['A2', 'A3', 'A5']);
  assert.deepEqual(model('>', 'M'), ['A2', 'A3', 'A4', 'A5'], 'text operands compare lexically');
  // the operand grammar is the grid's
  assert.equal(cfOperand('1,000'), 1000); assert.equal(cfOperand('12%'), 0.12); assert.equal(cfOperand('$5'), 5); assert.equal(cfOperand('(3)'), -3); assert.equal(cfOperand('1e1'), 10);
  assert.equal(cfOperand('TRUE'), true); assert.equal(cfOperand('1/1/2024'), 45292); assert.equal(cfOperand('North'), 'North'); assert.equal(cfOperand('0x10'), '0x10'); assert.equal(cfOperand('Infinity'), 'Infinity');
  assert.equal(cfOperand('=$c$2'), '=$C$2'); assert.equal(cfOperand(''), null); assert.equal(cfOperand('=B2>'), null); assert.equal(cfOperand('='), null);
  // the card: every entry Excel accepts adds the rule; only an empty box or a broken formula shows the note
  const card = (range, keys) => { const s = new Session(new Sheet({ cells: structuredClone(cells) }), { now: () => 0 }); s.sheet.select(range); s.run(keys); return s.dialog ? s.note : [s.sheet.condFmt[0].v1, Object.keys(s.sheet.condFmtMap()).sort().join(',')]; };
  assert.deepEqual(card('A2:A5', 'Alt H L H E "North" Enter'), ['North', 'A2,A3,A5']);
  assert.deepEqual(card('B2:B5', 'Alt H L H G "1/1/2024" Enter'), [45292, '']);
  assert.deepEqual(card('B2:B5', 'Alt H L H G "$5" Enter'), [5, 'B2,B4,B5']);
  assert.deepEqual(card('B2:B5', 'Alt H L H G "(3)" Enter'), [-3, 'B2,B3,B4,B5']);
  assert.deepEqual(card('B2:B5', 'Alt H L H E "TRUE" Enter'), [true, '']);
  assert.deepEqual(card('B2:B5', 'Alt H L H G "0x10" Enter'), ['0x10', '']);
  assert.equal(card('B2:B5', 'Alt H L H G "=B2>" Enter'), CF_VALUE_NOTE); assert.equal(card('B2:B5', 'Alt H L H G Enter'), CF_VALUE_NOTE);
  const S = new Sheet({ cells: structuredClone(cells), condFmt: [{ range: 'B2:B5', kind: 'cellValue', op: '>', v1: '10' }] });
  assert.equal(S.condFmt[0].v1, 10, 'an authored numeric string is the number');
});

test('F4: Clear Rules from Selected Cells takes the cells out of the rule; the Applies-to becomes a union and survives JSON', () => {
  const S = sheet();
  S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 50, style: 'green' });
  S.select('B3'); assert.equal(S.clearCondFmt('selection'), true);
  assert.deepEqual(S.condFmt.map(r => r.range), ['B2,B4:B5']); assert.deepEqual(Object.keys(S.condFmtMap()).sort(), ['B2', 'B4']);
  assert.equal(S.condFmtRulesAt(3, 2).length, 0); assert.equal(S.condFmtRulesAt(4, 2).length, 1);
  const again = new Sheet(S.toJSON()); assert.equal(again.condFmt[0].range, 'B2,B4:B5');
  S.select('C2:C5'); S.addCondFmt({ kind: 'dataBar' });
  S.select('B3:C3'); assert.equal(S.clearCondFmt('selection'), true); assert.deepEqual(S.condFmt.map(r => r.range), ['C2,C4:C5', 'B2,B4:B5']);
  S.select('B2:C5'); assert.equal(S.clearCondFmt('selection'), true); assert.equal(S.condFmt.length, 0, 'a rule with no cell left goes');
  S.undo(); assert.equal(S.condFmt.length, 2);
  S.select('A1'); assert.equal(S.clearCondFmt('selection'), false, 'a selection that meets no rule changes nothing');
  // a formula rule's formula is re-based when its first cell goes, so every remaining cell keeps its meaning
  const T = sheet(); T.select('B2:B5'); T.addCondFmt({ kind: 'formula', formula: '=B2>C2', style: 'green' });
  T.select('B2'); T.clearCondFmt('selection'); assert.equal(T.condFmt[0].range, 'B3:B5'); assert.equal(T.condFmt[0].formula, '=B3>C3'); assert.deepEqual(Object.keys(T.condFmtMap()), []);
  assert.deepEqual(subtractRect({ r1: 2, c1: 2, r2: 5, c2: 3 }, { r1: 3, c1: 3, r2: 3, c2: 3 }), [{ r1: 2, c1: 2, r2: 2, c2: 3 }, { r1: 4, c1: 2, r2: 5, c2: 3 }, { r1: 3, c1: 2, r2: 3, c2: 2 }]);
  assert.deepEqual(normCondFmt([{ range: 'B2,B4:B5', kind: 'dataBar' }, { range: 'B2,nope', kind: 'dataBar' }]).map(r => r.range), ['B2,B4:B5']);
});

test('F5: deleting the row or column holding a rule\'s first cell keeps the rule for the surviving cells; only references into the deleted band become #REF!', () => {
  const S = sheet(); S.select('A2:C5'); S.addCondFmt({ kind: 'formula', formula: '=$B2<$C2', style: 'lightred' });
  S.select('A2:Z2'); S.remove('r');
  assert.equal(S.condFmt[0].range, 'A2:C4'); assert.equal(S.condFmt[0].formula, '=$B2<$C2'); assert.deepEqual(Object.keys(S.condFmtMap()).sort(), ['A2', 'A4', 'B2', 'B4', 'C2', 'C4']);
  const T = sheet(); T.select('B2:C5'); T.addCondFmt({ kind: 'formula', formula: '=B2>50', style: 'green' });
  T.select('B1:B100'); T.remove('c');
  assert.equal(T.condFmt[0].range, 'B2:B5'); assert.equal(T.condFmt[0].formula, '=B2>50'); assert.deepEqual(Object.keys(T.condFmtMap()).sort(), ['B2', 'B3', 'B4'], 'old C2:C5 = 80, 60, 70, 10 now sit in B');
  const U = sheet(); U.select('B3:B5'); U.addCondFmt({ kind: 'formula', formula: '=B$2>50', style: 'green' });
  U.select('A2:Z2'); U.remove('r'); assert.equal(U.condFmt[0].formula, '=#REF!>50', 'the referenced row itself went'); assert.deepEqual(U.condFmtMap(), {});
  const V = sheet(); V.select('B2:B5'); V.addCondFmt({ kind: 'cellValue', op: '>', v1: '=C2', style: 'green' });
  V.select('A2:Z2'); V.remove('r'); assert.equal(V.condFmt[0].v1, '=C2', 'a preset\'s operand is re-based the same way'); assert.deepEqual(V.condFmtMap(), {}, 'the surviving rows read 40/60, 70/70, 0/10: none has B > C');
});

test('F6: data bars are proportional to zero, run 0–100 %, draw negatives leftward in red from an automatic axis', () => {
  const bars = vals => { const cells = {}; vals.forEach((v, i) => { cells['B' + (i + 2)] = { value: v }; }); const S = new Sheet({ cells }); S.select('B2:B' + (vals.length + 1)); S.addCondFmt({ kind: 'dataBar', color: 'blue' }); const m = S.condFmtMap(); return vals.map((v, i) => { const o = m['B' + (i + 2)]; return o && o.bar ? o.bar : null; }); };
  assert.deepEqual(bars([90, 95, 100]).map(b => b.pct), [0.9, 0.95, 1]);
  assert.deepEqual(bars([0, 40, 70, 100]).map(b => b && b.pct), [null, 0.4, 0.7, 1]);
  assert.deepEqual(bars([0, 0, 0]), [null, null, null]);
  assert.deepEqual(bars([5, 5, 5]).map(b => b.pct), [1, 1, 1]);
  assert.deepEqual(bars([-5, -5, -5]), [{ pct: 1, color: '#638ec6', neg: true, axis: 1 }, { pct: 1, color: '#638ec6', neg: true, axis: 1 }, { pct: 1, color: '#638ec6', neg: true, axis: 1 }]);
  assert.deepEqual(bars([-50, 0, 50, 100]), [{ pct: 1, color: '#638ec6', neg: true, axis: 0.33 }, null, { pct: 0.5, color: '#638ec6', axis: 0.33 }, { pct: 1, color: '#638ec6', axis: 0.33 }]);
  assert.deepEqual(bars([-100, -40]).map(b => [b.pct, b.neg, b.axis]), [[1, true, 1], [0.4, true, 1]]);
  assert.deepEqual(bars([-3]), [{ pct: 1, color: '#638ec6', neg: true, axis: 1 }]); assert.deepEqual(bars([100]), [{ pct: 1, color: '#638ec6' }]);
  // a zero takes the bar slot all the same: a lower bar rule never shows through, a fill below still paints
  const S = new Sheet({ cells: { B2: { value: 0 }, B3: { value: 10 } } });
  S.select('B2:B3'); S.addCondFmt({ kind: 'cellValue', op: '>=', v1: 0, style: 'green' }); S.select('B2:B3'); S.addCondFmt({ kind: 'dataBar', color: 'red' }); S.select('B2:B3'); S.addCondFmt({ kind: 'dataBar', color: 'blue' });
  const m = S.condFmtMap(); assert.deepEqual(m.B2, { fill: '#c6efce', fontColor: '#006100' }); assert.equal(m.B3.bar.color, '#638ec6');
});

test('F18: a relative reference in a preset\'s value walks the range like a formula rule\'s', () => {
  const cells = { B2: { value: 100 }, B3: { value: 90 }, B4: { value: 70 }, B5: { value: 0 }, C2: { value: 80 }, C3: { value: 95 }, C4: { value: 70 }, C5: { value: 10 } };
  const run = (range, op, v1, v2) => { const S = new Sheet({ cells: structuredClone(cells) }); S.select(range); S.addCondFmt({ kind: 'cellValue', op, v1, v2, style: 'green' }); return Object.keys(S.condFmtMap()).sort(); };
  assert.deepEqual(run('B2:B5', '>', '=C2'), ['B2'], 'B3 is compared with C3 (95), not C2');
  assert.deepEqual(run('B2:B5', '>', '=$C$2'), ['B2', 'B3'], 'an absolute operand stays put');
  assert.deepEqual(run('B3:B5', '<', '=C3'), ['B3', 'B5']);
  assert.deepEqual(run('B2:B5', 'between', '=C2-15', '=C2+15'), ['B3', 'B4', 'B5']);
  const s = new Session(new Sheet({ cells: structuredClone(cells) }), { now: () => 0 }); s.sheet.select('B2:B5'); s.run('Alt H L H G "=C2" Enter');
  assert.deepEqual(Object.keys(s.sheet.condFmtMap()), ['B2'], 'the card route');
});

test('F19: a preset\'s value formulas follow row / column inserts and deletes like a formula rule\'s formula', () => {
  const mk = () => new Sheet({ cells: { B2: { value: 100 }, B3: { value: 40 }, B4: { value: 70 }, C2: { value: 80 }, D1: { value: 50 }, E1: { value: 100 } } });
  let S = mk(); S.select('B2:B3'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: '=$D$1', style: 'green' });
  S.select('A1:A100'); S.insert('c'); assert.equal(S.condFmt[0].range, 'C2:C3'); assert.equal(S.condFmt[0].v1, '=$E$1'); assert.deepEqual(Object.keys(S.condFmtMap()), ['C2']);
  S = mk(); S.select('B2:B3'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: '=$D$1', style: 'green' });
  S.select('D1:D100'); S.remove('c'); assert.equal(S.condFmt[0].v1, '=#REF!'); assert.deepEqual(S.condFmtMap(), {}, 'an operand that errors formats nothing');
  S = mk(); S.select('B2:B4'); S.addCondFmt({ kind: 'cellValue', op: '<', v1: '=$C$2', style: 'lightred' });
  S.select('A1:Z1'); S.insert('r'); assert.equal(S.condFmt[0].v1, '=$C$3'); assert.deepEqual(Object.keys(S.condFmtMap()).sort(), ['B4', 'B5']);
  S = mk(); S.select('B2:B3'); S.addCondFmt({ kind: 'cellValue', op: 'between', v1: '=$D$1', v2: '=$E$1', style: 'yellow' });
  S.select('A1:Z1'); S.insert('r'); assert.deepEqual([S.condFmt[0].v1, S.condFmt[0].v2], ['=$D$2', '=$E$2']); assert.deepEqual(Object.keys(S.condFmtMap()), ['B3']);
});

test('F20: the card reads a formula for the ACTIVE cell of the selection and stores it re-based to the top-left', () => {
  let s = fresh(); let S = s.sheet;
  S.goTo(5, 2); s.run('Shift+Up Shift+Up Shift+Up'); assert.equal(S.selectionText(), 'B2:B5'); assert.deepEqual(S.dispActive(), { r: 5, c: 2 });
  s.run('Alt H L N "=$B5>$C5" Enter'); assert.equal(S.condFmt[0].range, 'B2:B5'); assert.equal(S.condFmt[0].formula, '=$B2>$C2'); assert.deepEqual(Object.keys(S.condFmtMap()), ['B2']);
  s.run('Alt H L H G "=$C5" Enter'); assert.equal(S.condFmt[0].v1, '=$C2'); assert.deepEqual(Object.keys(S.condFmtMap()), ['B2']);
  s.run('Alt H L H G "=$C$5" Enter'); assert.equal(S.condFmt[0].v1, '=$C$5', 'an absolute reference is untouched');
  s = fresh(); S = s.sheet; S.goTo(5, 2); s.run('Ctrl+Shift+Up'); assert.equal(S.selectionText(), 'B1:B5');
  s.run('Alt H L N "=$B5>$C5" Enter'); assert.equal(S.condFmt[0].formula, '=$B1>$C1'); assert.deepEqual(Object.keys(S.condFmtMap()), ['B1', 'B2'], 'the header row too: "Rev" > "Cost" as text');
  s = fresh(); S = s.sheet; S.select('B2:B5'); s.run('Alt H L N "=$B2>$C2" Enter'); assert.equal(S.condFmt[0].formula, '=$B2>$C2', 'a selection made downward: the active cell is the top-left');
});

test('F21: a colour scale is a fill in precedence: higher than a fill rule it shows, lower it is hidden', () => {
  let S = sheet();
  S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 50, style: 'green' }); S.select('B2:B5'); S.addCondFmt({ kind: 'colorScale' });
  let m = S.condFmtMap(); assert.equal(m.B2.fill, '#f8696b'); assert.equal(m.B2.fontColor, '#006100', 'the lower rule still adds the font colour'); assert.equal(m.B4.fill, '#fcaa78'.replace('#fcaa78', mixHex('#ffeb84', '#f8696b', 15 / 45)));
  S = sheet();
  S.select('B2:B5'); S.addCondFmt({ kind: 'colorScale' }); S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 50, style: 'green' });
  m = S.condFmtMap(); assert.equal(m.B2.fill, '#c6efce'); assert.equal(m.B2.scale, undefined); assert.equal(m.B3.fill, mixHex('#63be7b', '#ffeb84', 40 / 55));
  S = sheet();
  S.select('B2:B5'); S.addCondFmt({ kind: 'colorScale' }); S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 50, style: 'redtext' });
  m = S.condFmtMap(); assert.equal(m.B2.fill, '#f8696b', 'a font-only rule above leaves the fill to the scale'); assert.equal(m.B2.fontColor, '#9c0006');
});

test('F23: cut / paste moves the rules, copy / paste all and formats copy them, fill extends them, Clear Formats / All and a plain paste remove them', () => {
  const gt = (S, range) => { S.select(range); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 50, style: 'green' }); };
  const ranges = S => S.condFmt.map(r => r.range), painted = S => Object.keys(S.condFmtMap()).sort();
  let S = sheet(); gt(S, 'B2:B5'); S.select('B2:B5'); S.copy(true); S.goTo(2, 5); assert.equal(S.paste('all'), true);
  assert.deepEqual(ranges(S), ['E2:E5']); assert.deepEqual(painted(S), ['E2', 'E4']);
  S = sheet(); gt(S, 'B2:B5'); S.select('B2:B5'); S.copy(false); S.goTo(2, 5); S.paste('all');
  assert.deepEqual(ranges(S), ['E2:E5', 'B2:B5']); assert.deepEqual(painted(S), ['B2', 'B4', 'E2', 'E4']);
  S = sheet(); S.setCell('F2', { value: 99 }); S.setCell('F3', { value: 10 }); S.setCell('F4', { value: 60 }); S.setCell('F5', { value: 5 }); S.recalc(); gt(S, 'B2:B5'); S.select('B2:B5'); S.copy(false); S.goTo(2, 6); S.paste('formats');
  assert.deepEqual(ranges(S), ['F2:F5', 'B2:B5']); assert.deepEqual(painted(S), ['B2', 'B4', 'F2', 'F4']);
  S = sheet(); gt(S, 'B2'); S.select('B2:B5'); assert.equal(S.fill('down'), true); assert.deepEqual(ranges(S), ['B2:B5']); assert.deepEqual(painted(S), ['B2', 'B3', 'B4', 'B5']);
  S = sheet(); gt(S, 'B5'); S.select('B2:B5'); S.fill('up'); assert.deepEqual(ranges(S), ['B2:B5']);
  S = sheet(); gt(S, 'B2:B5'); S.select('B3:B4'); S.clearFormats(); assert.deepEqual(ranges(S), ['B2,B5']); assert.deepEqual(painted(S), ['B2']); assert.equal(S.value('B3'), 40, 'values kept');
  S = sheet(); gt(S, 'B2:B5'); S.select('B2:B5'); S.clearAll(); assert.deepEqual(ranges(S), []);
  S = sheet(); S.setCell('C2', { value: 55 }); S.recalc(); gt(S, 'B2:B5'); S.select('C2'); S.copy(false); S.select('B2:B5'); S.paste('all'); assert.deepEqual(ranges(S), [], 'a plain paste replaces the destination\'s conditional formats with the source\'s: none');
  S = sheet(); gt(S, 'B2:B5'); S.select('B2:B5'); S.copy(false); S.goTo(2, 5); S.paste('values'); assert.deepEqual(ranges(S), ['B2:B5'], 'paste values carries no rule and leaves the destination alone');
  S = sheet(); gt(S, 'B2:B5'); S.select('B2:B5'); S.copy(false); S.goTo(2, 5); S.paste('valuesnum'); assert.deepEqual(ranges(S), ['B2:B5']);
  S = sheet(); gt(S, 'B2:B5'); S.goTo(3, 2); S.deleteContents(); assert.deepEqual(ranges(S), ['B2:B5'], 'the Delete key clears contents, not conditional formats');
  // formulas: a copy shifts relative references, a cut relocates references into the moved block
  S = sheet(); S.select('B2:B5'); S.addCondFmt({ kind: 'formula', formula: '=B2>50', style: 'green' }); S.select('B2:B5'); S.copy(false); S.goTo(2, 5); S.paste('all');
  assert.equal(S.condFmt[0].formula, '=E2>50'); assert.equal(S.condFmt[0].range, 'E2:E5'); assert.deepEqual(painted(S), ['B2', 'B4', 'E2', 'E4']);
  S = sheet(); S.select('B2:B5'); S.addCondFmt({ kind: 'formula', formula: '=$B2>50', style: 'green' }); S.select('B2:B5'); S.copy(false); S.goTo(2, 5); S.paste('all');
  assert.equal(S.condFmt[0].formula, '=$B2>50', 'a copy keeps the $ column: the E cells watch column B'); assert.deepEqual(painted(S), ['B2', 'B4', 'E2', 'E4']);
  S = sheet(); S.select('B2:B5'); S.addCondFmt({ kind: 'formula', formula: '=$B2>50', style: 'green' }); S.select('B2:B5'); S.copy(true); S.goTo(2, 5); S.paste('all');
  assert.equal(S.condFmt[0].formula, '=$E2>50', 'a cut takes the reference along with the moved cells'); assert.deepEqual(painted(S), ['E2', 'E4']);
  S = sheet(); S.select('B2:B5'); S.addCondFmt({ kind: 'formula', formula: '=$A2="North"', style: 'green' }); S.select('B2:B5'); S.copy(true); S.goTo(2, 5); S.paste('all');
  assert.equal(S.condFmt[0].formula, '=$A2="North"', 'a reference outside the moved block stays'); assert.deepEqual(painted(S), ['E2']);
  // a cut of part of a rule: the rest stays, the moved part is a rule of its own right below it
  S = sheet(); gt(S, 'B2:B5'); S.select('B4:B5'); S.copy(true); S.goTo(2, 5); S.paste('all');
  assert.deepEqual(ranges(S), ['B2:B3', 'E2:E3']); assert.deepEqual(painted(S), ['B2', 'E2'], 'E2 holds the moved 70');
  // a tiled paste and a transpose carry the rules over every pasted cell
  S = sheet(); gt(S, 'B2:B5'); S.select('B2:B5'); S.copy(false); S.select('E2:F9'); S.paste('all'); assert.deepEqual(ranges(S), ['E2:F9', 'B2:B5']); assert.equal(painted(S).length, 2 + 8);
  S = sheet(); gt(S, 'B2:B5'); S.select('B2:B5'); S.copy(false); S.goTo(8, 2); S.paste('transpose'); assert.deepEqual(ranges(S), ['B8:E8', 'B2:B5']); assert.deepEqual(painted(S), ['B2', 'B4', 'B8', 'D8']);
  // through the keys
  const s = fresh(); gt(s.sheet, 'B2:B5'); s.sheet.select('B2:B5'); s.run('Ctrl+X'); s.sheet.goTo(2, 5); s.run('Ctrl+V'); assert.deepEqual(ranges(s.sheet), ['E2:E5']);
  s.run('Ctrl+Z'); assert.deepEqual(ranges(s.sheet), ['B2:B5'], 'undo brings the rule home');
  assert.deepEqual(mergeRects([{ r1: 2, c1: 2, r2: 2, c2: 2 }, { r1: 3, c1: 2, r2: 5, c2: 2 }]), [{ r1: 2, c1: 2, r2: 5, c2: 2 }]);
});

test('F24: Move or Copy › Create a copy keeps the sheet\'s rules, with ids of its own', () => {
  const s = fresh(); const S = s.sheet;
  S.select('B2:B3'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 50, style: 'green' }); S.select('C2:C3'); S.addCondFmt({ kind: 'dataBar', color: 'green' });
  s.run('Alt H O M C Enter'); assert.equal(s.sheets.length, 2); assert.equal(s.sheets[0].name, 'Sheet1 (2)');
  const strip = list => list.map(({ id, ...r }) => r);
  assert.deepEqual(strip(s.sheet.condFmt), strip(S.condFmt)); assert.notEqual(s.sheet, S);
  assert.deepEqual(Object.keys(s.sheet.condFmtMap()).sort(), ['B2', 'C2', 'C3']);
  assert.equal(new Set([...S.condFmt, ...s.sheet.condFmt].map(r => r.id)).size, 4, 'the copy minted its own ids');
});

test('F25: rule ids stay unique: a loaded id is never reused, a duplicate in JSON is re-minted, addCondFmt ignores an incoming id', () => {
  const S = new Sheet({ cells: structuredClone(CELLS), condFmt: [{ id: 'cf900000', range: 'B2:B3', kind: 'cellValue', op: '>', v1: 50 }, { id: 'cf900001', range: 'C2:C3', kind: 'dataBar' }] });
  const added = S.addCondFmt({ kind: 'colorScale' });
  assert.equal(new Set(S.condFmt.map(r => r.id)).size, 3); assert.equal(added.id, 'cf900002', 'the numbering carries on past the loaded ids');
  const T = new Sheet({ condFmt: [{ id: 'cf1', range: 'B2:B3', kind: 'dataBar' }, { id: 'cf1', range: 'C2:C3', kind: 'dataBar' }] });
  assert.equal(T.condFmt[0].id, 'cf1'); assert.notEqual(T.condFmt[1].id, 'cf1');
  const dup = S.addCondFmt({ id: 'cf900000', range: 'D2:D3', kind: 'dataBar' }); assert.notEqual(dup.id, 'cf900000');
  // the manager acts on the highlighted row, whatever the ids came in as
  const s = new Session(new Sheet({ cells: structuredClone(CELLS), condFmt: [{ id: 'cf1', range: 'B2:B3', kind: 'cellValue', op: '>', v1: 50 }] }), { now: () => 0 });
  s.sheet.select('B2:B3'); s.run('Alt H L D Enter'); assert.deepEqual(s.sheet.condFmt.map(r => r.kind), ['dataBar', 'cellValue']);
  s.run('Alt H L R Down Delete Enter'); assert.deepEqual(s.sheet.condFmt.map(r => r.kind), ['dataBar'], 'the highlighted (cellValue) row went, not the bar');
});

test('F43: Stop If True cannot be set on a data bar or a colour scale, so a highlight rule below them still paints', () => {
  const S = sheet();
  S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: '>', v1: 50, style: 'green' }); S.select('B2:B5'); const bar = S.addCondFmt({ kind: 'dataBar' });
  const frames = S.undoStack.length;
  assert.equal(S.setCondFmtStop(bar.id, true), false); assert.equal(S.condFmt[0].stopIfTrue, false); assert.equal(S.undoStack.length, frames, 'no undo frame');
  assert.deepEqual(S.condFmtMap().B2, { bar: { pct: 1, color: '#638ec6' }, fill: '#c6efce', fontColor: '#006100' });
  S.select('B2:B5'); const sc = S.addCondFmt({ kind: 'colorScale' }); assert.equal(S.setCondFmtStop(sc.id, true), false);
  assert.deepEqual(normCondFmt([{ range: 'B2:B5', kind: 'dataBar', stopIfTrue: true }, { range: 'B2:B5', kind: 'colorScale', stopIfTrue: true }]).map(r => r.stopIfTrue), [false, false], 'JSON cannot smuggle it in');
  const s = fresh(); s.sheet.select('B2:B5'); s.run('Alt H L H G "50" Enter'); s.sheet.select('B2:B5'); s.run('Alt H L D Enter');
  s.run('Alt H L R S'); assert.equal(s.sheet.condFmt[0].stopIfTrue, false); assert.equal(s.dialogSet('ruleact', 'S'), true); assert.equal(s.sheet.condFmt[0].stopIfTrue, false);
  assert.equal(s.sheet.condFmtMap().B2.fill, '#ffc7ce'); s.run('Enter');
});

test('F45: Between with the bounds reversed is stored low bound first, as Excel swaps them', () => {
  const s = fresh(); s.sheet.select('B2:B5'); s.run('Alt H L H B "80" Tab "30" Enter');
  assert.deepEqual([s.sheet.condFmt[0].v1, s.sheet.condFmt[0].v2], [30, 80]); assert.deepEqual(Object.keys(s.sheet.condFmtMap()).sort(), ['B3', 'B4']);
  assert.deepEqual(normCondFmt([{ range: 'B2:B5', kind: 'cellValue', op: 'notBetween', v1: 80, v2: 30 }]).map(r => [r.v1, r.v2]), [[30, 80]]);
  const S = sheet(); S.select('B2:B5'); S.addCondFmt({ kind: 'cellValue', op: 'between', v1: '=$C$2', v2: 30, style: 'yellow' });
  assert.deepEqual([S.condFmt[0].v1, S.condFmt[0].v2], ['=$C$2', 30], 'a formula bound is kept where it was typed'); assert.deepEqual(Object.keys(S.condFmtMap()).sort(), ['B3', 'B4'], 'and the pair still reads as the interval between them');
});

test('F46: after Go To Special the rule applies to every selected area', () => {
  const S = new Sheet({ cells: { B2: { value: 1 }, B3: { formula: '=B2' }, B4: { value: 3 }, C2: { value: 'x' } } });
  S.select('B2:C4'); assert.equal(S.selectSpecial('constants'), true); assert.equal(S.selectionText(), 'B2,C2,B4');
  const r = S.addCondFmt({ kind: 'cellValue', op: '>', v1: 0, style: 'green' });
  assert.equal(r.range, 'B2:C2,B4'); assert.deepEqual(Object.keys(S.condFmtMap()).sort(), ['B2', 'B4', 'C2']);
  const s = new Session(new Sheet({ cells: { B2: { value: 1 }, B3: { formula: '=B2' }, B4: { value: 3 }, C2: { value: 'x' } } }), { now: () => 0 });
  s.sheet.select('B2:C4'); s.sheet.selectSpecial('constants'); s.run('Alt H L D Enter'); assert.equal(s.sheet.condFmt[0].range, 'B2:C2,B4');
  assert.deepEqual(rectsOfKeys(['B2', 'B3', 'C2', 'C3', 'E5']), [{ r1: 2, c1: 2, r2: 3, c2: 3 }, { r1: 5, c1: 5, r2: 5, c2: 5 }]);
});

test('F47: a rule over a range far beyond the sheet costs what its cells on the sheet cost', () => {
  const huge = new Sheet({ cells: { B2: { value: 10 }, B3: { value: 20 } }, condFmt: [{ range: 'B1:B1000000', kind: 'dataBar' }, { range: 'B2:ZZZ99999', kind: 'colorScale' }] });
  const fit = new Sheet({ cells: { B2: { value: 10 }, B3: { value: 20 } }, condFmt: [{ range: 'B1:B100', kind: 'dataBar' }, { range: 'B2:Z100', kind: 'colorScale' }] });
  const t0 = performance.now(); const m = huge.condFmtMap(); const ms = performance.now() - t0;
  assert.deepEqual(m, fit.condFmtMap()); assert.ok(ms < 300, 'took ' + ms.toFixed(1) + ' ms');
});
