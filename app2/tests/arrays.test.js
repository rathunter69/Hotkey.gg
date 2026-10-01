// Array evaluation inside formulas (Excel 365: every formula is an array formula) and the dynamic
// arrays that spill (M61, M75, M81): each case pins the value desktop Excel gives.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evalFormula, translateFormula, adjustFormulaStructure, parseFormula } from '../engine/formula.js';
import { Sheet } from '../engine/sheet.js';

// Checks: Region A/B, Amount, a formula column, text and blanks
const CELLS = { A1: 'A', A2: 'B', A3: 'A', A4: 'B', A5: 'A', B1: 10, B2: -20, B3: 30, B4: 'x', B5: null, C1: 1, C2: 2, C3: 2, C4: 3, C5: 3, D1: { formula: '=B1*2' }, D2: 5, D3: 'pending', D4: null, D5: 7 };
const sheet = () => new Sheet({ cells: Object.fromEntries(Object.entries(CELLS).map(([k, v]) => [k, v && typeof v === 'object' ? v : { value: v }])) });
const ev = (f, S = sheet()) => evalFormula(f, S.evalCtx({ cell: { r: 10, c: 10 } }));

test('array arithmetic inside the aggregates: SUMPRODUCT with coerced comparisons, ABS over a range, MEDIAN(IF()), array MATCH', () => {
  assert.equal(ev('=SUMPRODUCT((A1:A5="A")*(B1:B5))'), '#VALUE!', 'FALSE*"x" is #VALUE! in that element, and SUMPRODUCT propagates it as Excel does');
  assert.equal(ev('=SUMPRODUCT((A1:A5="A")*(B1:B3))'), '#N/A', 'a shorter operand runs out: #N/A in those elements, as Excel gives');
  assert.equal(ev('=SUMPRODUCT((A1:A5="A")*1,B1:B5)'), 40, 'the comma form reads text and the blank as 0; TRUE*1 is 1');
  assert.equal(ev('=SUMPRODUCT((A1:A3="A")*(B1:B3))'), 40);
  assert.equal(ev('=SUMPRODUCT((A1:A3="B")*(C1:C3>1)*B1:B3)'), -20);
  assert.equal(ev('=SUMPRODUCT(--(A1:A5="A"))'), 3, 'the double unary coerces booleans');
  assert.equal(ev('=SUMPRODUCT(ABS(B1:B3))'), 60, 'ABS lifted over the range, one absolute per cell');
  assert.equal(ev('=SUMPRODUCT(ABS(B1:B5))'), '#VALUE!', 'ABS of text is #VALUE! in that element, and SUMPRODUCT propagates it as Excel does');
  assert.equal(ev('=SUMPRODUCT(ROUND(B1:B3/3,0))'), 6, '3 − 7 + 10');
  assert.equal(ev('=SUMPRODUCT(ISNUMBER(D1:D5)*(1-ISFORMULA(D1:D5)))'), 2, 'typed numbers only: a formula, text and a blank add nothing (M75)');
  assert.equal(ev('=MEDIAN(IF(A1:A5="A",B1:B5))'), 10, 'FALSE elements are skipped, as Excel skips logicals in arrays; the blank B5 is picked as 0, so the median of 10, 30, 0');
  assert.equal(ev('=MAX(IF(C1:C5=3,B1:B5))'), 0, 'B4 is text and B5 blank: the array holds FALSE, FALSE, FALSE, 0 (the blank), FALSE → 0');
  assert.equal(ev('=SUM(IF(C1:C5>1,1,0))'), 4);
  assert.equal(ev('=MATCH(1,(A1:A5="B")*(C1:C5=3),0)'), 4, 'the two-condition MATCH');
  assert.equal(ev('=MATCH(1,(A1:A5="Z")*(C1:C5=3),0)'), '#N/A');
  assert.equal(ev('=INDEX(B1:B5,MATCH(1,(A1:A5="A")*(C1:C5=2),0))'), 30);
  assert.equal(ev('=SUM(LEN(A1:A5))'), 5); assert.equal(ev('=SUM(--(C1:C5>2))'), 2); assert.equal(ev('=AND(C1:C5>0)'), true); assert.equal(ev('=OR(B1:B3<0)'), true);
  assert.equal(ev('=SUM(IFERROR(1/(C1:C5-2),0))'), 1, 'IFERROR element by element: −1, two #DIV/0! as 0, 1, 1');
  assert.equal(ev('=COUNT(IF(A1:A5="A",B1:B5))'), 3); assert.equal(ev('=SUM(ISNUMBER(B1:B5)*1)'), 3);
  assert.throws(() => ev('=SUMPRODUCT(B1:B3,{1})'), SyntaxError, 'array constants are not read: the tokenizer refuses the brace, as before');
  assert.equal(ev('=SUMPRODUCT(B1:B3)'), 20); assert.equal(ev('=SUMPRODUCT(5)'), 5);
});

test('lookups over arrays and whole records: nested two-way XLOOKUP, XMATCH, INDEX over an array, VLOOKUP over a sorted array', () => {
  const S = new Sheet({ cells: { A1: { value: 'Site' }, B1: { value: 'Jan' }, C1: { value: 'Feb' }, D1: { value: 'Mar' },
    A2: { value: 'Austin' }, B2: { value: 1 }, C2: { value: 2 }, D2: { value: 3 }, A3: { value: 'Boise' }, B3: { value: 4 }, C3: { value: 5 }, D3: { value: 6 } } });
  assert.equal(ev('=XLOOKUP("Boise",A2:A3,XLOOKUP("Feb",B1:D1,B2:D3))', S), 5, 'the inner XLOOKUP hands the outer its return column');
  assert.equal(ev('=XLOOKUP("Feb",B1:D1,XLOOKUP("Austin",A2:A3,B2:D3))', S), 2, 'and the other way round: a whole record, then one field');
  assert.equal(ev('=SUM(XLOOKUP("Boise",A2:A3,B2:D3))', S), 15, 'XLOOKUP returning a whole record (M72)');
  assert.equal(ev('=INDEX(XLOOKUP("Boise",A2:A3,B2:D3),2)', S), 5);
  assert.equal(ev('=XLOOKUP("Zed",A2:A3,B2:B3,"none")', S), 'none'); assert.equal(ev('=XLOOKUP("Zed",A2:A3,B2:B3)', S), '#N/A');
  assert.equal(ev('=XMATCH("Feb",B1:D1)', S), 2); assert.equal(ev('=XMATCH(4.5,B2:B3,-1)', S), 2); assert.equal(ev('=XMATCH(4.5,B2:B3,1)', S), '#N/A'); assert.equal(ev('=XMATCH("B*",A2:A3,2)', S), 2);
  assert.equal(ev('=INDEX(SORT(B2:B3,1,-1),1)', S), 4, 'INDEX over an array result');
  assert.equal(ev('=VLOOKUP(4,SORT(B2:D3,1,-1),3,FALSE)', S), 6, 'VLOOKUP over an array');
  assert.equal(ev('=SUM(INDEX(B2:D3,0,2))', S), 7); assert.equal(ev('=ROWS(SEQUENCE(4))', S), 4); assert.equal(ev('=COLUMNS(TRANSPOSE(B2:B3))', S), 2);
});

test('the dynamic-array functions and the spill: FILTER, SORT, UNIQUE, SEQUENCE spill into the sheet; a blocked spill is #SPILL!; A1# reads the block', () => {
  const S = sheet();
  S.setCell('F1', { formula: '=FILTER(B1:B5,A1:A5="A")' }); S.setCell('G1', { formula: '=SORT(C1:C5,1,-1)' }); S.setCell('H1', { formula: '=UNIQUE(C1:C5)' });
  S.setCell('I1', { formula: '=SEQUENCE(2,3,10,5)' }); S.setCell('F7', { formula: '=SUM(F1#)' }); S.setCell('G7', { formula: '=ROWS(H1#)' }); S.setCell('H7', { formula: '=UNIQUE(C1:C5,FALSE,TRUE)' });
  S.recalc();
  assert.deepEqual(['F1', 'F2', 'F3'].map(k => S.value(k)), [10, 30, 0], 'FILTER: the A rows, the blank spilling as 0'); assert.equal(S.value('F4'), null);
  assert.deepEqual(['G1', 'G2', 'G3', 'G4', 'G5'].map(k => S.value(k)), [3, 3, 2, 2, 1]);
  assert.deepEqual(['H1', 'H2', 'H3', 'H4'].map(k => S.value(k)), [1, 2, 3, null]);
  assert.deepEqual([S.value('I1'), S.value('K1'), S.value('I2'), S.value('K2')], [10, 20, 25, 35]); assert.deepEqual(S.cellAt('I1').spillTo, { r1: 1, c1: 9, r2: 2, c2: 11 });
  assert.equal(S.cellAt('F2').spill, 'F1'); assert.equal(S.cellAt('F2').formula, null);
  assert.equal(S.value('F7'), 40, 'A1# is the spilled range'); assert.equal(S.value('G7'), 3); assert.equal(S.value('H7'), 1, 'exactly_once');
  // a cell in the way blocks the spill; clearing it lets the block back
  S.setCell('F3', { value: 'blocker' }); S.recalc();
  assert.equal(S.value('F1'), '#SPILL!'); assert.equal(S.value('F2'), null); assert.equal(S.value('F7'), '#SPILL!', 'a read of a blocked anchor through # is the error');
  S.setCell('F3', { value: null }); S.recalc(); assert.equal(S.value('F1'), 10); assert.equal(S.value('F3'), 0); assert.equal(S.value('F7'), 40);
  // an edit of the anchor's inputs moves the spill; a shrinking spill clears what it leaves
  S.setCell('A3', { value: 'B' }); S.recalc(); assert.deepEqual(['F1', 'F2', 'F3'].map(k => S.value(k)), [10, 0, null]); assert.equal(S.value('F7'), 10);
  assert.equal(ev('=FILTER(B1:B5,A1:A5="Z","none")'), 'none'); assert.equal(ev('=FILTER(B1:B5,A1:A5="Z")'), '#CALC!'); assert.equal(ev('=FILTER(B1:B5,C1:C4>0)'), '#VALUE!', 'the include must match a side');
  assert.equal(ev('=SORT(A1:A5,1,2)'), '#VALUE!'); assert.equal(ev('=SEQUENCE(0)'), '#VALUE!'); assert.equal(ev('=SEQUENCE(3)'), 1);
  const T = new Sheet({ cells: { A1: { value: 'b' }, A2: { value: 'B' }, A3: { value: 'a' }, A4: { value: 2 }, A5: { value: null }, A6: { value: true }, B1: { formula: '=SORT(A1:A6)' }, C1: { formula: '=UNIQUE(A1:A6)' }, D1: { formula: '=A1:A2' } } });
  assert.deepEqual(['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].map(k => T.value(k)), [2, 'a', 'b', 'B', true, 0], 'numbers, then text (case kept, order stable), booleans, blanks last');
  assert.deepEqual(['C1', 'C2', 'C3', 'C4', 'C5'].map(k => T.value(k)), ['b', 'a', 2, 0, true], 'UNIQUE compares text case-insensitively');
  assert.deepEqual([T.value('D1'), T.value('D2')], ['b', 'B'], 'a bare multi-cell reference spills too');
  // the # token travels with its reference through the text rewriters
  assert.equal(translateFormula('=SUM(F1#)+F1', 1, 1), '=SUM(G2#)+G2'); assert.equal(adjustFormulaStructure('=SUM(F1#)', 'r', 1, 1), '=SUM(F2#)');
  assert.equal(parseFormula('=F1#').spill, true); assert.equal(ev('=SUM(B1#)'), '#REF!', 'a # on a cell that holds no formula is #REF!');
});

test('the Chapter 2 to 6 functions: RRI, REPLACE, QUARTILE.INC, PERCENTILE.INC, ISFORMULA', () => {
  assert.ok(Math.abs(ev('=RRI(5,100,200)') - 0.148698354997035) < 1e-12); assert.equal(ev('=RRI(0,100,200)'), '#NUM!'); assert.equal(ev('=RRI(5,0,200)'), '#NUM!'); assert.equal(ev('=RRI(5,100,-200)'), '#NUM!');
  assert.equal(ev('=REPLACE("Clearcoat",6,4,"wash")'), 'Clearwash'); assert.equal(ev('=REPLACE("abc",0,1,"x")'), '#VALUE!'); assert.equal(ev('=REPLACE("abc",2,0,"x")'), 'axbc');
  assert.equal(ev('=QUARTILE.INC(C1:C5,1)'), 2); assert.equal(ev('=QUARTILE.INC(C1:C5,3)'), 3); assert.equal(ev('=QUARTILE.INC(C1:C5,2)'), 2); assert.equal(ev('=QUARTILE.INC(C1:C5,5)'), '#NUM!');
  assert.equal(ev('=QUARTILE(B1:B3,1)'), -5); assert.equal(ev('=PERCENTILE.INC(C1:C5,0.9)'), 3); assert.equal(ev('=QUARTILE.INC(D3:D4,1)'), '#NUM!', 'text and a blank: no numbers');
  assert.equal(ev('=ISFORMULA(D1)'), true); assert.equal(ev('=ISFORMULA(D2)'), false); assert.equal(ev('=ISFORMULA(5)'), '#VALUE!');
  assert.equal(ev('=MEDIAN(D1:D5)'), 7, 'MEDIAN skips text and blanks (M81)');
});
