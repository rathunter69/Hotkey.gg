// app2/tests/graders.test.js — every convention grader (C2 gap 3): a pass fixture and a fail
// fixture per predicate, with the one-line `why` naming the offending cell.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import {
  roleColour, noLiteralInFormula, rowConsistent, negativesParen, decimalsConsistent,
  totalsTopBorder, unitsLabel, checkCell, noHidden, liveness, unchangedExcept,
} from '../app/graders.js';

const sheet = cells => new Sheet({ cells });

test('roleColour: blue inputs pass, a black input and a blue formula fail with the line', () => {
  const good = sheet({ B4: { value: 0.13, fontColor: 'blue' }, B5: { formula: '=B4*2' }, B6: { value: 'label' } });
  assert.equal(roleColour(good, 'B4:B6').ok, true);
  const blackInput = roleColour(sheet({ B4: { value: 0.13 } }), 'B4');
  assert.equal(blackInput.ok, false);
  assert.match(blackInput.why, /B4 is an input shown black/);
  const blueFormula = roleColour(sheet({ B6: { formula: '=B4*2', fontColor: 'blue' } }), 'B6');
  assert.equal(blueFormula.ok, false);
  assert.match(blueFormula.why, /B6 is a formula shown in blue/);
});

test('roleColour: green passes only on a pure cross-sheet link line', () => {
  const s = new Session(new Sheet({ cells: { A1: { value: 1 } } }), {});
  s.addSheet('Raw', new Sheet({ cells: { B3: { value: 500 } } }));
  const main = s.sheets[0].sheet;
  main.setCell('C3', { formula: '=Raw!B3', fontColor: 'green' });
  main.recalc();
  assert.equal(roleColour(main, 'C3').ok, true, 'a link line may be green');
  main.setCell('C4', { formula: '=A1*2', fontColor: 'green' });
  const r = roleColour(main, 'C4');
  assert.equal(r.ok, false);
  assert.match(r.why, /C4 is green/);
});

test('noLiteralInFormula: reads the parsed tokens, allows 0/1/100/12, names the literal', () => {
  assert.equal(noLiteralInFormula(sheet({ B14: { formula: '=B6*B4' } }), 'B14').ok, true);
  assert.equal(noLiteralInFormula(sheet({ B14: { formula: '=(B6-B5)*100/12' } }), 'B14').ok, true, 'signs, percentages, months');
  assert.equal(noLiteralInFormula(sheet({ B14: { formula: '=B6*1' } }), 'B14').ok, true);
  const r = noLiteralInFormula(sheet({ B14: { formula: '=B6*0.13' } }), 'B14');
  assert.equal(r.ok, false);
  assert.match(r.why, /B14 has 0.13 typed inside the formula/);
  // a string containing digits is NOT a literal (tokens, not text)
  assert.equal(noLiteralInFormula(sheet({ B14: { formula: '="wk 37"&B6' } }), 'B14').ok, true);
  // a plain value cell is not this grader's business
  assert.equal(noLiteralInFormula(sheet({ B14: { value: 0.13 } }), 'B14').ok, true);
});

test('rowConsistent: a translated row passes, a retyped period fails', () => {
  const good = sheet({ B5: { formula: '=B2*B3' }, C5: { formula: '=C2*C3' }, D5: { formula: '=D2*D3' } });
  assert.equal(rowConsistent(good, 'B5:D5').ok, true);
  const bad = sheet({ B5: { formula: '=B2*B3' }, C5: { formula: '=C2*C3' }, D5: { formula: '=D2*1.05' } });
  const r = rowConsistent(bad, 'B5:D5');
  assert.equal(r.ok, false);
  assert.match(r.why, /D5 breaks its row/);
  // anchored references translate too
  const anchored = sheet({ B5: { formula: '=B2*$B$1' }, C5: { formula: '=C2*$B$1' } });
  assert.equal(rowConsistent(anchored, 'B5:C5').ok, true);
  const typedValue = rowConsistent(sheet({ B5: { formula: '=B2*B3' }, C5: { value: 42 } }), 'B5:C5');
  assert.equal(typedValue.ok, false, 'a typed number where the row formula belongs fails');
});

test('negativesParen and decimalsConsistent', () => {
  assert.equal(negativesParen(sheet({ B3: { value: -500, fmtStyle: 'comma', decimals: 0 } }), 'B3').ok, true);
  const minus = negativesParen(sheet({ B3: { value: -500 } }), 'B3');
  assert.equal(minus.ok, false);
  assert.match(minus.why, /B3 shows a minus/);
  assert.equal(negativesParen(sheet({ B3: { value: 500 } }), 'B3').ok, true, 'positives need nothing');
  assert.equal(decimalsConsistent(sheet({ B3: { value: 1, fmtStyle: 'comma', decimals: 0 }, B4: { value: 2, fmtStyle: 'comma', decimals: 0 } }), 'B3:B4').ok, true);
  const mixed = decimalsConsistent(sheet({ B3: { value: 1, fmtStyle: 'comma', decimals: 0 }, B4: { value: 2, fmtStyle: 'comma', decimals: 2 } }), 'B3:B4');
  assert.equal(mixed.ok, false);
  assert.match(mixed.why, /B4 shows 2 decimals against 0/);
});

test('totalsTopBorder and unitsLabel', () => {
  assert.equal(totalsTopBorder(sheet({ B8: { formula: '=SUM(B3:B7)', bt: true } }), ['B8']).ok, true);
  assert.equal(totalsTopBorder(sheet({ B8: { formula: '=SUM(B3:B7)', bdbl: true } }), ['B8']).ok, true, 'a double bottom grand total still carries structure');
  const r = totalsTopBorder(sheet({ B8: { formula: '=SUM(B3:B7)' } }), ['B8']);
  assert.equal(r.ok, false);
  assert.match(r.why, /B8 is a total without a top border/);
  assert.equal(unitsLabel(sheet({ A2: { value: 'USD unless stated' } })).ok, true);
  assert.equal(unitsLabel(sheet({ A9: { value: 'USD' } })).ok, false, 'the units line lives in the top rows');
});

test('checkCell: a live zero passes; a typed 0, a dead formula and a non-zero all fail', () => {
  const good = sheet({ B3: { value: 100 }, B4: { value: 100 }, B9: { formula: '=B3-B4' } });
  assert.equal(checkCell(good, 'B9').ok, true);
  const typed = checkCell(sheet({ B9: { value: 0 } }), 'B9');
  assert.equal(typed.ok, false);
  assert.match(typed.why, /typed 0/);
  const off = checkCell(sheet({ B3: { value: 100 }, B4: { value: 90 }, B9: { formula: '=B3-B4' } }), 'B9');
  assert.equal(off.ok, false);
  assert.match(off.why, /does not tie/);
});

test('noHidden and liveness', () => {
  assert.equal(noHidden(sheet({})).ok, true);
  const s = sheet({}); s.hiddenCols.add(4);
  const r = noHidden(s);
  assert.equal(r.ok, false);
  assert.match(r.why, /column D is hidden/);
  const live = sheet({ B3: { value: 10 }, B4: { formula: '=B3*2' } });
  assert.equal(liveness(live, 'B4').ok, true);
  const dead = liveness(sheet({ B4: { value: 20 } }), 'B4');
  assert.equal(dead.ok, false);
  assert.match(dead.why, /typed number where a live formula belongs/);
});

test('unchangedExcept: fixes inside the allowed set pass, anything else names the cell', () => {
  const before = { A1: { value: 'Title', bold: true }, B3: { value: 100 }, B4: { formula: '=B3*2' } };
  const fixed = sheet({ A1: { value: 'Title', bold: true }, B3: { value: 120 }, B4: { formula: '=B3*2' } });
  assert.equal(unchangedExcept(fixed, before, ['B3']).ok, true);
  const strayed = sheet({ A1: { value: 'Title' }, B3: { value: 120 }, B4: { formula: '=B3*2' } });
  const r = unchangedExcept(strayed, before, ['B3']);
  assert.equal(r.ok, false);
  assert.match(r.why, /A1 changed/);
  // a formula cell's computed value never counts as a change
  assert.equal(unchangedExcept(sheet({ A1: { value: 'Title', bold: true }, B3: { value: 100 }, B4: { formula: '=B3*2' } }), before, []).ok, true);
});
