// app2/tests/condfmt.test.js — conditional formatting (Chapter 2): an ordered rule list on the
// sheet, evaluated by condFmtMap() for the painter and the graders. Highlight presets, formula
// rules, data bars, colour scales, precedence, Stop If True, clear, undo, structure shifts,
// serialisation, and the Alt H L walk / mouse reaching the same state.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet, normCondFmt, CF_STYLES, CF_BAR_COLORS, CF_SCALES, mixHex } from '../engine/sheet.js';
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

test('Highlight Cells presets paint only the numbers that qualify; text and blanks stay', () => {
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
  assert.deepEqual(m.B2.bar, { pct: 1, color: '#63c384' }); assert.deepEqual(m.B5.bar, { pct: 0.08, color: '#63c384' }); assert.equal(m.B3.bar.pct, 0.4);
  assert.equal(m.A2, undefined, 'text gets no bar');
  S.clearCondFmt('sheet');
  S.select('B2:B5'); S.addCondFmt({ kind: 'colorScale', scale: 'green-yellow-red' });
  const c = S.condFmtMap();
  assert.equal(c.B2.scale, '#f8696b', 'max → the last colour'); assert.equal(c.B5.scale, '#63be7b', 'min → the first'); assert.equal(c.B3.scale, '#ffeb84', 'the median → the middle');
  assert.equal(c.B4.scale, mixHex('#ffeb84', '#f8696b', 0.5));
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
  // refused entries keep the card open with Excel's note
  s.run('Alt H L H G "abc" Enter'); assert.equal(s.dialog, 'condfmt'); assert.equal(s.note, CF_VALUE_NOTE); out();
  s.run('Alt H L H G Enter'); assert.equal(s.dialog, 'condfmt'); assert.equal(s.note, CF_VALUE_NOTE); out();
  s.run('Alt H L N "=B2>" Enter'); assert.equal(s.dialog, 'condfmt'); assert.equal(s.note, CF_FORMULA_NOTE); out();
  s.run('Alt H L N Enter'); assert.equal(s.note, CF_FORMULA_NOTE); out();
  assert.equal(S.condFmt.length, 6);
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
  s.run('Down S'); assert.equal(S.condFmt[1].stopIfTrue, true); s.run('S'); assert.equal(S.condFmt[1].stopIfTrue, false);
  s.run('D'); assert.equal(s.dlg.sel, 2); assert.equal(S.condFmt[2].scale, 'green-yellow-red');
  s.run('U U'); assert.equal(s.dlg.sel, 0); assert.equal(S.condFmt[0].scale, 'green-yellow-red'); assert.equal(S.condFmt[1].op, '>');
  s.run('Delete'); assert.equal(S.condFmt.length, 3); assert.equal(S.condFmt[0].op, '>');
  s.run('Down Down Down Down'); assert.equal(s.dlg.sel, 2); s.run('Delete'); assert.equal(S.condFmt.length, 2); assert.equal(s.dlg.sel, 1);
  s.run('Enter'); assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null);
  // Clear Rules
  S.select('C3'); s.run('Alt H L C S'); assert.equal(S.condFmt.length, 1); assert.equal(S.condFmt[0].kind, 'colorScale'); assert.equal(s.mode, 'normal');
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
