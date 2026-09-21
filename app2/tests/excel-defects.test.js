// One test per defect the Excel audit found in the OLD evaluator (index.html r23463–r23778), each
// with the value Microsoft Excel returns. These stand in for REBUILD_PLAN.md §10 until that file
// arrives; the harness that reproduced every old result lives in the session scratchpad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evalFormula } from '../engine/formula.js';

const near = (a, b) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 1e-9;
function ev(f, cells = {}) { return evalFormula(f, { raw: k => (k in cells ? cells[k] : null), rows: 20, cols: 30, today: () => 45000 }); }
function expect(f, exp, cells) {
  const got = ev(f, cells);
  if (near(got, exp)) return;
  assert.deepEqual(got, exp, `${f} → ${JSON.stringify(got)}, Excel gives ${JSON.stringify(exp)}`);
}
function refused(f, cells) { assert.throws(() => ev(f, cells), SyntaxError, `${f} should be refused at entry`); }
const D = (name, fn) => test('defect: ' + name, fn);

/* ---- operators & coercion ---- */
D('blank cell in & concatenates as "" not "0"', () => { expect('=A1&"x"', 'x'); expect('="Total: "&A1', 'Total: '); expect('=A1&" "&B1', 'Ann ', { A1: 'Ann' }); expect('=A1&B1', ''); expect('=A1&"x"', 'x', { A1: '' }); });
D('a blank cell equals "" (and 0)', () => { expect('=A1=""', true); expect('=A1<>""', false); expect('=IF(A1="","Empty","Has")', 'Empty'); expect('=IF(A1<>"",A1*2,"")', ''); expect('=A1<"a"', true); expect('=A1=0', true); expect('=A1', '', { A1: '' }); });
D('arithmetic on non-numeric text is #VALUE!', () => { const c = { A1: 'n/a', B1: 10 }; expect('=A1*B1', '#VALUE!', c); expect('="abc"+1', '#VALUE!'); expect('=A1^2', '#VALUE!', c); expect('=2^"abc"', '#VALUE!'); expect('=-"abc"', '#VALUE!'); expect('="abc"%', '#VALUE!'); expect('=5/A1', '#VALUE!', c); expect('="TRUE"+1', '#VALUE!'); expect('=IFERROR(A1*2,"n/a")', 'n/a', c); });
D('TRUE / FALSE literals parse', () => { const c = { A1: 1, B1: 'x', A2: 2, B2: 'y' }; expect('=VLOOKUP(1,A1:B2,2,FALSE)', 'x', c); expect('=TRUE', true); expect('=TRUE+1', 2); expect('=IF(1=1,TRUE,FALSE)', true); expect('=AND(TRUE,1)', true); expect('=TRUE()', true); expect('=FALSE()', false); });
D('comparisons return booleans, not 1/0', () => { expect('=1=1', true); expect('=1<>1', false); expect('=(1=1)&""', 'TRUE'); expect('=IF(1=2,"a")', false); expect('=AND(1,1)', true); expect('=NOT(0)', true); expect('=OR(0,0)', false); expect('=IF(0,1)', false); });
D('text equality is case-insensitive', () => { expect('=A1="abc"', true, { A1: 'ABC' }); expect('="a"="A"', true); expect('="a"<>"A"', false); expect('=A1=B1', true, { A1: 'Yes', B1: 'yes' }); expect('=A1="yes"', true, { A1: 'Yes' }); });
D('text ordering is alphabetical, case-insensitive', () => { expect('=A1<B1', true, { A1: 'apple', B1: 'Banana' }); expect('="a"<"B"', true); expect('="A"<"a"', false); expect('="Zebra"<"apple"', false); expect('="B">"a"', true); });
D('any text is greater than any number', () => { expect('=A1>B1', true, { A1: '5', B1: 6 }); expect('=A1<B1', false, { A1: '5', B1: 6 }); expect('="abc">1', true); expect('=1<"abc"', true); expect('=A1>100', true, { A1: 'abc' }); expect('="5"<9', false); });
D('equality uses 15 significant digits', () => { expect('=0.1+0.2=0.3', true); expect('=1.1*3=3.3', true); });
D('empty text in arithmetic is #VALUE!', () => { expect('=A1+1', '#VALUE!', { A1: '' }); expect('=5/""', '#VALUE!'); });
D('scientific-notation literals', () => { expect('=1E3+1', 1001); expect('=1E-3', 0.001); expect('=2.5E6*2', 5000000); expect('=1e-2', 0.01); });
D('doubled quotes escape a quote', () => { expect('="say ""hi"""', 'say "hi"'); expect('="a""b"', 'a"b'); expect('=""""', '"'); expect('=LEN("say ""hi""")', 8); });
D('formatted numeric text coerces in arithmetic', () => { expect('=A1+1', 1001, { A1: '1,000' }); expect('="$5"+1', 6); expect('="$1,000"+1', 1001); expect('="50%"+1', 1.5); expect('=A1+1', 1.05, { A1: '5%' }); expect('=A1+1', 1001, { A1: '1e3' }); expect('="+5"+1', 6); expect('="5."+1', 6); expect('="(5)"+1', -4); });
D('& converts numbers with 15 significant digits', () => { expect('=1234567890123&""', '1234567890123'); expect('=1/3&""', '0.333333333333333'); expect('=1234567.1234567&""', '1234567.1234567'); expect('=A1&""', '123456789012', { A1: 123456789012 }); expect('=LEN(1/3)', 17); });
D('overflow and invalid powers are #NUM! / #DIV/0!', () => { expect('=2^1024', '#NUM!'); expect('=2^1024=2^1024', '#NUM!'); expect('=10^400', '#NUM!'); expect('=(-8)^(1/3)', '#NUM!'); expect('=(-1)^0.5', '#NUM!'); expect('=0^0', '#NUM!'); expect('=0^-1', '#DIV/0!'); });
D('IF coerces text conditions like Excel', () => { expect('=IF("abc",1,2)', '#VALUE!'); expect('=IF(A1,1,2)', '#VALUE!', { A1: 'abc' }); expect('=IF("FALSE",1,2)', 2); expect('=IF("0",1,2)', 2); });
D('trailing decimal point literal', () => { expect('=1.+1', 2); expect('=5.', 5); });
D('booleans and numbers are distinct types in comparisons', () => { expect('=(1=1)=1', false); expect('=1=1=1', false); expect('=1<2<3', false); });
D('large and small numbers convert to text in E notation', () => { expect('=0.0000001&""', '1E-07'); expect('=10^20&""', '1E+20'); });
D('no negative zero', () => { expect('=-A1', 0); assert.equal(Object.is(ev('=-0'), -0), false); });
D('multi-letter columns read the right cells', () => { const c = { AA1: 5, AB1: 6, A1: 100, B1: 200, AA2: 7, Z1: 9 }; expect('=SUM(AA1:AB1)', 11, c); expect('=SUM(AA1:AA2)', 12, c); expect('=SUM(Z1:AA1)', 14, c); expect('=OFFSET(Z1,0,1)', 5, c); expect('=OFFSET(AA1,0,0)', 5, c); });
D('bare unknown names are #NAME?', () => { expect('=FOO', '#NAME?'); expect('=AVG(1,2)', '#NAME?'); });
D('leading zeros in a row number are harmless', () => { expect('=A01', 5, { A1: 5 }); });
D('text that spells an error code is text', () => { expect('=LEN("#N/A")', 4); });

/* ---- functions ---- */
D('VLOOKUP defaults to approximate match', () => { const c = { A1: 1, B1: 'a', A2: 3, B2: 'b', A3: 7, B3: 'c' }; expect('=VLOOKUP(5,A1:B3,2)', 'b', c); expect('=VLOOKUP(3,A1:B3,2,FALSE)', 'b', c); expect('=VLOOKUP(5,A1:B3,2,FALSE)', '#N/A', c); });
D('MATCH honours match_type, default 1', () => { const c = { A1: 1, A2: 3, A3: 7 }; expect('=MATCH(5,A1:A3)', 2, c); expect('=MATCH(5,A1:A3,0)', '#N/A', c); expect('=MATCH(5,A1:A3,-1)', 1, { A1: 7, A2: 3, A3: 1 }); });
D('AVERAGE ignores blanks and text; all-blank is #DIV/0!', () => { expect('=AVERAGE(A1:A3)', 15, { A1: 10, A3: 20 }); expect('=AVERAGE(A1:A3)', '#DIV/0!'); expect('=AVERAGE(A1:A3)', 10, { A1: 10, A2: 'x' }); expect('=MEDIAN(A1:A3)', 2, { A1: 1, A2: 3 }); expect('=MEDIAN(4,6,A9)', 5); });
D('MIN/MAX ignore blanks and text', () => { expect('=MIN(A1:A3)', 5, { A1: 5, A2: 8 }); expect('=MAX(-5,A9)', -5); expect('=MAX(A1,A2)', -5, { A1: -5 }); expect('=MIN(A1:A3)', 5, { A1: 5, A2: 'x', A3: 7 }); });
D('ROUND rounds half away from zero, on decimals', () => { expect('=ROUND(-2.5,0)', -3); expect('=ROUND(-1250,-2)', -1300); expect('=ROUND(-0.5,0)', -1); expect('=ROUND(1.005,2)', 1.01); });
D('SUMIF without sum_range sums the range itself; criteria operators and wildcards work', () => { const c = { A1: 3, A2: 7, A3: 9 }; expect('=SUMIF(A1:A3,7)', 7, c); expect('=SUMIF(A1:A3,">5")', 16, c); expect('=COUNTIF(A1:A3,">5")', 2, c); expect('=SUMIFS(A1:A3,A1:A3,">5")', 16, c); expect('=COUNTIF(A1:A3,">="&B1)', 2, { ...c, B1: 7 }); expect('=COUNTIF(A1:A3,"a*")', 2, { A1: 'apple', A2: 'avocado', A3: 'pear' }); expect('=COUNTIF(A1:A3,"?ear")', 1, { A1: 'apple', A2: 'avocado', A3: 'pear' }); });
D('IF without value_if_false gives FALSE', () => { expect('=IF(A1>5,"big")', false, { A1: 1 }); });
D('COUNTIF matches blanks with "" and non-blanks with "<>"', () => { expect('=COUNTIF(A1:A3,"")', 2, { A1: 'x' }); expect('=COUNTIF(A1:A3,"<>")', 1, { A1: 'x' }); expect('=SUMIF(A1:A3,"",B1:B3)', 16, { A1: 'x', B1: 5, B2: 7, B3: 9 }); });
D('a blank criteria cell means 0', () => { expect('=COUNTIF(A1:A3,A4)', 0, { A1: 1 }); expect('=COUNTIF(A1:A3,A4)', 1, { A1: 0, A2: 1 }); });
D('lookups are type-strict', () => { const c = { A1: 1, A2: 2, A3: 3 }; expect('=MATCH("3",A1:A3,0)', '#N/A', c); expect('=MATCH(5,A1:A3,0)', '#N/A', { A1: '5' }); expect('=VLOOKUP(C1,A1:B3,2,0)', '#N/A', { A1: 'x', B1: 1, B2: 2, A3: 'y', B3: 3 }); });
D('lookups do not trim whitespace', () => { expect('=COUNTIF(A1:A3,"a")', 1, { A1: 'a', A2: 'a ', A3: 'b' }); expect('=MATCH("a ",A1:A3,0)', '#N/A', { A1: 'a', A2: 'b' }); });
D('INDEX past the range is #REF!', () => { const c = { A1: 1, B1: 2, A2: 3, B2: 4, C2: 99 }; expect('=INDEX(A1:B3,2,3)', '#REF!', c); expect('=INDEX(A1:B3,4,1)', '#REF!', c); });
D('INDEX on a table with one index gives that row (spill anchor)', () => { expect('=INDEX(A1:B3,2)', 'a2', { A1: 'a1', B1: 'b1', A2: 'a2', B2: 'b2' }); });
D('text literal arguments coerce; text in ranges is ignored', () => { const c = { A1: 1, A2: 2, A3: 3 }; expect('=SUM("3",2)', 5); expect('=MIN(5,"3")', 3); expect('=AVERAGE("3",2)', 2.5); expect('=ROUND("2.567",2)', 2.57); expect('=SUM(A1:A3,"abc")', '#VALUE!', c); expect('=SUM("5",1)', 6); expect('=SUM("abc")', '#VALUE!'); expect('=COUNT("5")', 1); expect('=ABS(A1)', '#VALUE!', { A1: 'abc' }); expect('=ROUND(1.2345,A1)', '#VALUE!', { A1: 'abc' }); expect('=ROUND(1.2345,"2")', 1.23); });
D('NPV/IRR skip blank cells in a range', () => { expect('=NPV(0.1,A1:A3)', 100 / 1.1 + 100 / 1.21, { A1: 100, A3: 100 }); expect('=NPV(-2,100)', -100); expect('=NPV(-1,100)', '#DIV/0!'); });
D('YEARFRAC honours the basis, the February rule and argument order', () => { expect('=YEARFRAC(DATE(2024,1,1),DATE(2024,7,1),3)', 182 / 365); expect('=YEARFRAC(DATE(2024,1,1),DATE(2024,7,1),1)', 182 / 366); expect('=YEARFRAC(DATE(2023,2,28),DATE(2024,2,29))', 1); expect('=YEARFRAC(DATE(2024,7,1),DATE(2024,1,1))', 0.5); });
D('AND/OR over a range ignore blank and text cells', () => { expect('=AND(A1:A3)', true, { A1: 1, A2: 1 }); expect('=AND(1,A1)', true, { A1: 'x' }); expect('=OR(0,A1)', false, { A1: 'x' }); });
D('OFFSET can return a range', () => { expect('=SUM(OFFSET(A1,0,0,3,1))', 6, { A1: 1, A2: 2, A3: 3 }); });
D('COUNT and COUNTA on literals, empty text and errors', () => { expect('=COUNT(1,"2","x")', 2); expect('=COUNTA("")', 1); expect('=COUNTA(1,"",A1)', 2); expect('=COUNT(1/0)', 0); expect('=COUNTA(1/0)', 1); });
D('fractional integer arguments truncate', () => { const c = { A1: 1, A2: 2, A3: 3 }; expect('=CHOOSE(1.9,"a","b")', 'a'); expect('=INDEX(A1:A3,1.9)', 1, c); expect('=LEFT("abc",2.9)', 'ab'); expect('=OFFSET(A1,1.9,0)', 2, c); expect('=EDATE(DATE(2024,1,15),1.9)', 45337); expect('=VLOOKUP(2,A1:B3,2.9,0)', 'b', { A1: 1, B1: 'a', A2: 2, B2: 'b' }); });
D('the 1900 date system', () => { expect('=DATE(1900,1,1)', 1); expect('=DATE(1900,2,29)', 60); expect('=DATE(1900,3,1)', 61); expect('=YEAR(0)', 1900); expect('=MONTH(0)', 1); expect('=DAY(60)', 29); expect('=YEAR(A1)', 1900); expect('=DATE(2024,3,15)', 45366); });
D('#NUM! is a value', () => { const c = { A1: 1, A2: 2, A3: 3 }; expect('=LARGE(A1:A3,4)', '#NUM!', c); expect('=LARGE(A1:A3,9)', '#NUM!', { A1: 1, A2: 2 }); expect('=IRR(A1:A3)', '#NUM!', c); expect('=IFERROR(LARGE(A1:A3,4),"none")', 'none', c); });
D('SUMPRODUCT needs equal shapes', () => { expect('=SUMPRODUCT(A1:A3,B1:B2)', '#VALUE!', { A1: 1, A2: 2, A3: 3, B1: 10, B2: 20 }); });
D('common functions exist', () => { expect('=POWER(2,3)', 8); expect('=INT(-3.5)', -4); expect('=TRUNC(3.9)', 3); expect('=SEARCH("b","ABC")', 2); expect('=TEXT(0.5,"0%")', '50%'); expect('=SQRT(9)', 3); expect('=ISBLANK(A1)', true); expect('=ISNUMBER(1)', true); expect('=ISTEXT("a")', true); expect('=COUNTBLANK(A1:A3)', 2, { A1: 1 }); expect('=ISERROR(1/0)', true); expect('=ISNA(NA())', true); expect('=IFNA(NA(),0)', 0); expect('=#N/A', '#N/A'); assert.ok(near(ev('=PMT(0.05/12,60,10000)'), -188.71233644)); });
D('whole-column and whole-row references', () => { expect('=SUM(A:A)', 12, { A1: 5, A2: 7 }); expect('=SUM(1:1)', 12, { A1: 5, B1: 7 }); });
D('omitted arguments read as 0', () => { expect('=IF(A1>1,"yes",)', 0, { A1: 0 }); expect('=IF(1>0,,5)', 0); expect('=SUM(A1:A3,)', 6, { A1: 1, A2: 2, A3: 3 }); expect('=SUM(A1,,2)', 3, { A1: 1 }); });

/* ---- entry-time refusals (Excel rejects the formula; the commit gate keeps you editing) ---- */
D('syntax errors are refused even inside IFERROR', () => { refused('=IFERROR(1+,0)'); refused('=1+'); refused('=SUM(A1:A3'.slice(0, 9) + ':'); });
D('too few arguments is refused', () => { refused('=MAX()'); refused('=MIN()'); refused('=ABS()'); refused('=SUM()'); refused('=ROUND(1)'); refused('=IF()'); refused('=IFERROR(1)'); });
