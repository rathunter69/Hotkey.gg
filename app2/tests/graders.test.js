// app2/tests/graders.test.js — every convention grader (C2 gap 3): a pass fixture and a fail
// fixture per predicate, with the one-line `why` naming the offending cell.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import {
  roleColour, noLiteralInFormula, rowConsistent, negativesParen, decimalsConsistent,
  totalsTopBorder, unitsLabel, checkCell, noHidden, liveness, unchangedExcept,
  zeroAsDash, dollarRows, costsNegative, signStated, gridlinesOff, noGrid, titleAcross,
  headersRight, italicLines, indented, oneFontSize, fullCanon,
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

// ---- Chapter 2: the full canon (BANKER_CONVENTIONS "Grader rules"), one pass and one fail per rule ----

const PLAIN = '#,##0_);(#,##0);-_)';
const DOLLAR = '$#,##0_);($#,##0);-_)';
const PCT = '0.0%_);(0.0%);-_)';
const custom = (value, numFmt, extra = {}) => ({ value, fmtStyle: 'custom', numFmt, ...extra });

test('negativesParen: a custom code with a parenthesised negative section passes; a bare custom minus fails; percent may keep the minus', () => {
  assert.equal(negativesParen(sheet({ B9: custom(-500, PLAIN) }), 'B9').ok, true);
  assert.equal(negativesParen(sheet({ B9: custom(-500, DOLLAR) }), 'B9').ok, true);
  const bare = negativesParen(sheet({ B9: custom(-1.5, '0.0"x"') }), 'B9');
  assert.equal(bare.ok, false);
  assert.match(bare.why, /B9 shows a minus/);
  assert.equal(negativesParen(sheet({ B11: { value: -0.05, fmtStyle: 'percent', decimals: 1 } }), 'B11').ok, true, 'a percent negative may keep its minus');
  assert.equal(negativesParen(sheet({ B11: custom(-0.05, '0.0%') }), 'B11').ok, true, 'a custom percent too');
});

test('decimalsConsistent reads a custom code\'s decimals', () => {
  assert.equal(decimalsConsistent(sheet({ B5: custom(1, PLAIN), C5: custom(2, PLAIN) }), 'B5:C5').ok, true);
  assert.equal(decimalsConsistent(sheet({ B5: custom(1, PCT), C5: { value: 0.2, fmtStyle: 'percent', decimals: 1 } }), 'B5:C5').ok, true, 'a custom 0.0% and a built-in 1-decimal percent agree');
  const r = decimalsConsistent(sheet({ B5: custom(1, PLAIN), C5: custom(2, '#,##0.00') }), 'B5:C5');
  assert.equal(r.ok, false);
  assert.match(r.why, /C5 shows 2 decimals against 0 at B5/);
});

test('zeroAsDash: a dash (custom fourth section or accounting) passes, a 0 or 0.0 names the cell', () => {
  assert.equal(zeroAsDash(sheet({ B6: custom(0, PLAIN), C6: { value: 0, fmtStyle: 'acct', decimals: 0 }, D6: { value: 5, fmtStyle: 'comma' } }), 'B6:D6').ok, true);
  assert.equal(zeroAsDash(sheet({ B6: custom(0, '#,##0;(#,##0);') }), 'B6').ok, true, 'a hidden zero shows no 0 either');
  const r = zeroAsDash(sheet({ B6: { value: 0, fmtStyle: 'comma', decimals: 1 } }), 'B6');
  assert.equal(r.ok, false);
  assert.match(r.why, /B6 shows a zero as 0.0 — zero is a dash/);
  assert.equal(zeroAsDash(sheet({ B6: { value: 0 } }), 'B6').ok, false, 'General 0 is still a 0');
});

test('dollarRows: the sign sits on the first and total rows only', () => {
  const good = sheet({ B5: custom(100, DOLLAR), B6: custom(40, PLAIN), B7: custom(-30, PLAIN), B8: custom(110, DOLLAR), B9: custom(0, DOLLAR) });
  assert.equal(dollarRows(good, 'B5:B9', [5, 8, 9]).ok, true, 'a zero on a $ row shows a dash and is skipped');
  const stray = dollarRows(sheet({ B5: custom(100, DOLLAR), B6: custom(40, DOLLAR) }), 'B5:B6', [5]);
  assert.equal(stray.ok, false);
  assert.match(stray.why, /B6 carries a \$/);
  const missing = dollarRows(sheet({ B5: custom(100, PLAIN), B6: custom(40, PLAIN) }), 'B5:B6', [5]);
  assert.equal(missing.ok, false);
  assert.match(missing.why, /B5 has no \$/);
  assert.equal(dollarRows(sheet({ B5: { value: 100, fmtStyle: 'currency' }, B6: { value: 40, fmtStyle: 'comma' } }), 'B5:B6', [5]).ok, true, 'built-in styles count too');
});

test('costsNegative and signStated', () => {
  assert.equal(costsNegative(sheet({ B9: { value: -500 }, C9: { value: 0 }, D9: { formula: '=B9*2' } }), 'B9:D9').ok, true);
  const r = costsNegative(sheet({ B9: { value: -500 }, C9: { value: 420 } }), 'B9:C9');
  assert.equal(r.ok, false);
  assert.match(r.why, /C9 shows a cost as a positive/);
  assert.equal(signStated(sheet({ A2: { value: 'USD unless stated; costs shown as negatives' } })).ok, true);
  const s = signStated(sheet({ A2: { value: 'USD unless stated' } }));
  assert.equal(s.ok, false);
  assert.match(s.why, /sign convention is not stated/);
});

test('gridlinesOff and noGrid', () => {
  assert.equal(gridlinesOff(new Sheet({ cells: {}, gridlines: false })).ok, true);
  const on = gridlinesOff(sheet({}));
  assert.equal(on.ok, false);
  assert.match(on.why, /gridlines are on/);
  assert.equal(noGrid(sheet({ B8: { value: 1, bt: true }, B9: { value: 2, bdbl: true } }), 'B5:B9').ok, true, 'a top border and a double bottom are structure');
  const grid = noGrid(sheet({ B5: { value: 1, ball: true } }), 'B5:B9');
  assert.equal(grid.ok, false);
  assert.match(grid.why, /B5 carries a grid border/);
  assert.equal(noGrid(sheet({ B6: { value: 1, bb: true } }), 'B5:B9').ok, false, 'a bottom border on a line is a grid line');
});

test('titleAcross: centred across the span passes; padded spaces or the wrong span name the cell', () => {
  assert.equal(titleAcross(sheet({ A1: { value: 'Project Volt', ca: 15 } }), 'A1', 15).ok, true);
  const padded = titleAcross(sheet({ A1: { value: '      Project Volt', ca: 15 } }), 'A1', 15);
  assert.equal(padded.ok, false);
  assert.match(padded.why, /A1 is padded with spaces/);
  const narrow = titleAcross(sheet({ A1: { value: 'Project Volt', ca: 4 } }), 'A1', 15);
  assert.equal(narrow.ok, false);
  assert.match(narrow.why, /A1 is not centered across 15 columns/);
  assert.equal(titleAcross(sheet({}), 'A1', 15).ok, false, 'no title at all');
});

test('headersRight: text headers must be right-aligned; a number header keeps its natural edge', () => {
  assert.equal(headersRight(sheet({ B4: { value: 'FY24A', align: 'r' }, C4: { value: 45000, fmtStyle: 'date' }, D4: { value: 'FY26E', align: 'r' } }), 'B4:D4').ok, true);
  const r = headersRight(sheet({ B4: { value: 'FY24A' } }), 'B4:D4');
  assert.equal(r.ok, false);
  assert.match(r.why, /B4 is a header over numbers that is not right-aligned/);
  assert.equal(headersRight(sheet({ C4: { value: 45000, fmtStyle: 'date', align: 'c' } }), 'B4:D4').ok, false, 'a centred date header fails');
});

test('italicLines, indented and oneFontSize', () => {
  assert.equal(italicLines(sheet({ B11: { value: 0.4, it: true }, C11: { formula: '=B11', it: true } }), 'B11:C11').ok, true);
  const it = italicLines(sheet({ B11: { value: 0.4, it: true }, C11: { value: 0.5 } }), 'B11:C11');
  assert.equal(it.ok, false);
  assert.match(it.why, /C11 is a percentage line that is not italic/);
  assert.equal(indented(sheet({ A5: { value: 'Public', indent: 1 }, A6: { value: 'Fleet', indent: 2 } }), 'A5:A6').ok, true);
  const ind = indented(sheet({ A5: { value: 'Public', indent: 1 }, A6: { value: 'Fleet' } }), 'A5:A6');
  assert.equal(ind.ok, false);
  assert.match(ind.why, /A6 is a sub-item that is not indented/);
  assert.equal(oneFontSize(sheet({ A1: { value: 'Title', fsz: 16 }, A4: { value: 'a' }, B4: { value: 1, fsz: null } }), 'A1:B4', 'A1').ok, true, 'the title may be larger');
  const fs = oneFontSize(sheet({ A4: { value: 'a' }, B4: { value: 1, fsz: 10 } }), 'A4:B4');
  assert.equal(fs.ok, false);
  assert.match(fs.why, /B4 is a different font size from A4/);
  assert.equal(oneFontSize(sheet({ A1: { value: 'Title', fsz: 10 }, A4: { value: 'a' } }), 'A1:A4', 'A1').ok, false, 'a title smaller than the page fails');
});

/** A small P&L block that meets the whole canon; each fail fixture breaks one rule. */
function canonSheet(patch = {}) {
  const cells = {
    A1: { value: 'Project Volt', ca: 4, bold: true, fsz: 16 },
    A2: { value: 'USD unless stated; costs shown as negatives' },
    B4: { value: 'FY24A', align: 'r', bold: true }, C4: { value: 'FY25A', align: 'r', bold: true },
    A5: { value: 'Revenue' }, B5: custom(1000, DOLLAR, { fontColor: 'blue' }), C5: custom(1200, DOLLAR, { fontColor: 'blue' }),
    A6: { value: 'Energy cost', indent: 1 }, B6: custom(-400, PLAIN, { fontColor: 'blue' }), C6: custom(0, PLAIN, { fontColor: 'blue' }),
    A7: { value: 'Gross profit', bold: true }, B7: { formula: '=B5+B6', fmtStyle: 'custom', numFmt: DOLLAR, bt: true, bold: true }, C7: { formula: '=C5+C6', fmtStyle: 'custom', numFmt: DOLLAR, bt: true, bold: true },
    A8: { value: 'Margin %', it: true }, B8: { formula: '=B7/B5', fmtStyle: 'custom', numFmt: PCT, it: true }, C8: { formula: '=C7/C5', fmtStyle: 'custom', numFmt: PCT, it: true },
    B9: { value: 600, fontColor: 'blue' },   // the control total (from the source) the check ties to
    B10: { formula: '=B7-B9' },
  };
  const { __gridlines: gridlines = false, ...cellPatch } = patch;
  for (const [ref, c] of Object.entries(cellPatch)) { if (c === null) delete cells[ref]; else cells[ref] = { ...(cells[ref] || {}), ...c }; }
  return new Sheet({ cells, gridlines });
}
const CANON_SPEC = {
  range: 'B5:C8', zeroDash: true, rows: ['B7:C7', 'B8:C8'], costRows: 'B6:C6', units: true,
  dollar: { range: 'B5:C8', rows: [5, 7] }, totals: ['B7', 'C7'], pctLines: 'B8:C8', indent: 'A6',
  headers: 'B4:C4', title: { ref: 'A1', span: 4 }, fontSize: 'A1:C8', gridlines: true, hidden: true, check: 'B10',
};

test('fullCanon: a block that meets every rule passes', () => {
  const r = fullCanon(canonSheet(), CANON_SPEC);
  assert.deepEqual(r, { ok: true, why: '' });
  assert.equal(fullCanon(null, CANON_SPEC).ok, false, 'a missing sheet fails');
  assert.equal(fullCanon(canonSheet(), {}).ok, true, 'an empty spec asks nothing');
  assert.equal(fullCanon(canonSheet({ C6: { fmtStyle: 'comma', numFmt: null } }), { ...CANON_SPEC, zeroDash: undefined }).ok, true, 'without zeroDash a 0 is not graded (module 2.1)');
});

test('fullCanon: each broken rule returns its one line, naming the cell', () => {
  const cases = [
    [{ __gridlines: true }, /gridlines are on/],
    [{ A2: { value: 'USD unless stated' } }, /sign convention is not stated/],
    [{ A2: { value: 'costs shown as negatives' } }, /no units line/],
    [{ A1: { ca: 0 } }, /A1 is not centered across 4 columns/],
    [{ B5: { fsz: 10 } }, /B5 is a different font size/],
    [{ C4: { align: null } }, /C4 is a header over numbers/],
    [{ B5: { fontColor: null } }, /B5 is an input shown black/],
    [{ B7: { fontColor: 'blue' } }, /B7 is a formula shown in blue/],
    [{ C7: { formula: '=C5*0.6' } }, /C7 has 0.6 typed inside the formula/],
    [{ C8: { formula: '=C7/B5' } }, /C8 breaks its row/],
    [{ B6: { value: 400 } }, /B6 shows a cost as a positive/],
    [{ B6: { fmtStyle: 'general', numFmt: null } }, /B6 shows a minus/],
    [{ C6: { value: -10, numFmt: '#,##0.0_);(#,##0.0);-_)' } }, /C6 shows 1 decimals against 0 at B6/],
    [{ C6: { fmtStyle: 'comma', numFmt: null } }, /C6 shows a zero as 0 — zero is a dash/],
    [{ B6: { ball: true } }, /B6 carries a grid border/],
    [{ B6: { numFmt: DOLLAR } }, /B6 carries a \$/],
    [{ C7: { bt: false } }, /C7 is a total without a top border/],
    [{ B8: { it: false } }, /B8 is a percentage line that is not italic/],
    [{ A6: { indent: 0 } }, /A6 is a sub-item that is not indented/],
    [{ B10: { formula: null, value: 0 } }, /B10 is not a formula/],
  ];
  for (const [patch, want] of cases) {
    const r = fullCanon(canonSheet(patch), CANON_SPEC);
    assert.equal(r.ok, false, `expected a failure for ${JSON.stringify(patch)}`);
    assert.match(r.why, want, `for ${JSON.stringify(patch)} got: ${r.why}`);
  }
  const hidden = canonSheet(); hidden.hiddenCols.add(3);
  assert.match(fullCanon(hidden, CANON_SPEC).why, /column C is hidden/);
});
