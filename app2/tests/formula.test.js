// Excel-semantics pins for the evaluator. Every expected value is what Microsoft Excel (365,
// en-US, iterative calc off) returns for the same formula over the same cells.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evalFormula, translateFormula, formulaRefs, formulaFunctions, autocorrectFormula, adjustFormulaStructure, parseFormula, textToNumber, parses, normalizeFormula } from '../engine/formula.js';

const cells = {
  A1: 1, A2: 2, A3: 3,
  B1: '5', B2: 'abc', B3: true,
  C1: '#N/A',
  D1: 10, D2: 20, D3: 30,
  E1: 'apple', E2: 'banana', E3: 'cherry',
  F1: null, F2: null, F3: null,
  G1: 0.5, G2: -2.5, G3: 2.5,
  AA1: 7,
  H1: 30, H2: 10, H3: 20,                       // unsorted (approximate lookups binary-search anyway)
  I1: 'cherry', I2: 'apple', I3: 'banana',
  J1: 30, J2: 20, J3: 10,                       // descending
};
const ctx = { raw: k => (k in cells ? cells[k] : null), rows: 20, cols: 30, cell: { r: 5, c: 2 }, today: () => 45000 };
const ev = f => evalFormula(f, ctx);
const near = (a, b) => Math.abs(a - b) < 1e-9;

function table(name, rows) {
  test(name, () => {
    for (const [f, exp] of rows) {
      const got = ev(f);
      if (typeof exp === 'number' && typeof got === 'number') assert.ok(near(got, exp), `${f} → ${got}, expected ${exp}`);
      else assert.deepEqual(got, exp, `${f} → ${JSON.stringify(got)}, expected ${JSON.stringify(exp)}`);
    }
  });
}

table('operator precedence and associativity', [
  ['=-2^2', 4],            // negation binds tighter than ^ in Excel
  ['=2^3^2', 64],          // ^ is left-associative
  ['=2^-2', 0.25],
  ['=1+2*3', 7], ['=(1+2)*3', 9], ['=10/2/5', 1], ['=2*-3', -6], ['=--A1', 1], ['=+A1', 1],
  ['=50%', 0.5], ['=-5%', -0.05], ['=2^50%', Math.SQRT2], ['=10%*2', 0.2], ['=A3%', 0.03],
  ['=1&2', '12'], ['=1+2&3', '33'],          // & sits below + -
  ['=1+1=2', true], ['=2>1&""', false], ['="a"&"b"="ab"', true],
]);

table('unary plus is a no-op (text stays text); only unary minus coerces', [
  ['=+E1', 'apple'], ['=+B3', true], ['=+"abc"', 'abc'], ['=+"12"', '12'], ['=+""', ''], ['=+E1&"x"', 'applex'], ['=+E1=E1', true], ['=+F1', 0], ['=+-B3', -1], ['=--B3', 1],
  ['=-"abc"', '#VALUE!'], ['=-E1', '#VALUE!'], ['=+C1', '#N/A'], ['=SUM(+A1:A3)', 6],
]);

table('booleans are a type of their own', [
  ['=1=1', true], ['=1<>1', false], ['=TRUE', true], ['=FALSE', false], ['=TRUE()', true],
  ['=TRUE+1', 2], ['=TRUE*5', 5], ['=NOT(0)', true], ['=NOT(TRUE)', false],
  ['=IF(TRUE,1)', 1], ['=IF(FALSE,1)', false], ['=IF("1",1,2)', 1], ['=IF("0",1,2)', 2],       // omitted else → FALSE; numeric text reads as its number
  ['=IF(A1>0,"big")', 'big'], ['=IF(A1<0,"neg")', false],
  ['=IF("TRUE",1,2)', 1], ['=IF("x",1,2)', '#VALUE!'], ['=IF(F1,1,2)', 2],
  ['=B3', true], ['=B3+1', 2], ['=SUM(B3)', 0], ['=SUM(TRUE)', 1], ['=AND(A1>0,A2>1)', true], ['=OR(A1:A3)', true], ['=AND("x")', '#VALUE!'], ['=XOR(TRUE,TRUE)', false],
]);

table('coercion of text, blanks and errors', [
  ['="5"+1', 6], ['=B1+1', 6], ['="abc"+1', '#VALUE!'], ['=B2*2', '#VALUE!'], ['=" 1,000 "*1', 1000], ['="10%"*1', 0.1], ['="$5"+0', 5],
  ['=F1+1', 1], ['=F1&"x"', 'x'], ['=F1', 0], ['=Z9', 0], ['=A1&F1&A2', '12'],
  ['=C1+1', '#N/A'], ['=SUM(A1:C1)', '#N/A'], ['=IFERROR(C1,0)', 0], ['=IFNA(C1,"missing")', 'missing'], ['=IFNA(1/0,0)', '#DIV/0!'],
  ['=1/0', '#DIV/0!'], ['=A1/F1', '#DIV/0!'], ['=0^-1', '#DIV/0!'], ['=SQRT(-1)', '#NUM!'], ['=FOO(1)', '#NAME?'], ['=foo', '#NAME?'], ['=#N/A', '#N/A'],
  ['=A1:A3+1', '#VALUE!'], ['=ISERROR(1/0)', true], ['=ISERROR(1)', false], ['=ISNA(C1)', true], ['=ISBLANK(F1)', true], ['=ISBLANK(A1)', false], ['=ISNUMBER(B1)', false], ['=ISNUMBER(A1)', true], ['=ISTEXT(B1)', true],
  // the IS* classifiers see an error as a value to classify, never as something to propagate (the ISNUMBER(MATCH()) / ISNUMBER(SEARCH()) idioms)
  ['=ISNUMBER(MATCH(99,D1:D3,0))', false], ['=IF(ISNUMBER(MATCH(99,D1:D3,0)),"found","missing")', 'missing'], ['=ISNUMBER(MATCH(20,D1:D3,0))', true], ['=IF(ISNUMBER(SEARCH("z",E1)),"yes","no")', 'no'], ['=ISNUMBER(SEARCH("p",E1))', true],
  ['=ISTEXT(1/0)', false], ['=ISLOGICAL(NA())', false], ['=ISNONTEXT(NA())', true], ['=ISBLANK(NA())', false], ['=ISNUMBER(C1)', false], ['=ISNONTEXT(C1)', true], ['=ISNUMBER("5")', false], ['=ISNUMBER(TRUE)', false],
]);

table('comparisons: numbers < text < booleans, case-insensitive text', [
  ['=1<"a"', true], ['="a"<1', false], ['="a"<"B"', true], ['="A"="a"', true], ['="apple"<"banana"', true], ['=TRUE>"z"', true], ['=TRUE>1', true],
  ['=A1=""', false], ['=F1=""', true], ['=F1=0', true], ['=F1=FALSE', true], ['=0.1+0.2=0.3', true], ['=1/3*3=1', true],
]);

table('aggregates: ranges skip text/booleans, literal arguments coerce', [
  ['=SUM(A1:A3)', 6], ['=SUM(A1:A3,B1)', 6], ['=SUM(A1:A3,"3")', 9], ['=SUM("3",2)', 5], ['=SUM(B1:B3)', 0], ['=SUM(A:A)', 6], ['=SUM(1:1)', '#N/A'], ['=SUM(D1:D3)*2', 120],
  ['=AVERAGE(A1:A3)', 2], ['=AVERAGE(F1:F3)', '#DIV/0!'], ['=AVERAGE(A1:B3)', 2], ['=MIN(F1:F3)', 0], ['=MAX(F1:F3)', 0], ['=MIN(A1:A3,-1)', -1], ['=MAX(A1:A3,B1)', 3],
  ['=COUNT(A1:B3)', 3], ['=COUNT("3",TRUE,"x")', 2], ['=COUNTA(A1:C3)', 7], ['=COUNTA(F1:F3)', 0], ['=COUNTBLANK(A1:F3)', 5], ['=PRODUCT(A1:A3)', 6],
  ['=MEDIAN(D1:D3)', 20], ['=MEDIAN(D1:D2)', 15], ['=MEDIAN(F1:F3)', '#NUM!'], ['=LARGE(D1:D3,1)', 30], ['=SMALL(D1:D3,4)', '#NUM!'], ['=RANK(20,D1:D3)', 2], ['=RANK(20,D1:D3,1)', 2], ['=RANK(25,D1:D3)', '#N/A'],
  ['=SUMPRODUCT(A1:A3,D1:D3)', 140], ['=SUMPRODUCT(A1:A3,D1:D2)', '#VALUE!'],
]);

table('rounding is decimal, half away from zero', [
  ['=ROUND(2.5,0)', 3], ['=ROUND(-2.5,0)', -3], ['=ROUND(G2,0)', -3], ['=ROUND(1.005,2)', 1.01], ['=ROUND(2.675,2)', 2.68], ['=ROUND(1234.5678,-2)', 1200], ['=ROUND(-1.45,1)', -1.5],
  ['=ROUNDUP(3.1,0)', 4], ['=ROUNDUP(-3.1,0)', -4], ['=ROUNDDOWN(-3.9,0)', -3], ['=ROUNDUP(1.1,0)', 2], ['=ROUNDDOWN(1.99,1)', 1.9], ['=INT(-3.5)', -4], ['=INT(3.9)', 3], ['=TRUNC(-3.9)', -3], ['=TRUNC(3.14159,2)', 3.14],
  ['=MOD(-3,2)', 1], ['=MOD(3,-2)', -1], ['=MOD(5,0)', '#DIV/0!'], ['=ABS(-4)', 4], ['=SIGN(-4)', -1], ['=POWER(2,10)', 1024], ['=SQRT(16)', 4], ['=EXP(0)', 1], ['=LN(1)', 0], ['=LOG(100)', 2], ['=LOG(8,2)', 3], ['=LOG10(1000)', 3], ['=PI()', Math.PI],
  // 15-digit rounding survives the magnitudes where toPrecision(15) itself goes exponential (|x| ≥ 1e15, < 1e-6, ≥ 1e21)
  ['=ROUND(0.1+0.2-0.3,2)', 0], ['=ROUND(1E15,0)', 1e15], ['=ROUND(1234567890123456,0)', 1234567890123460], ['=ROUND(0.0000001,2)', 0], ['=ROUND(5E-7,6)', 0.000001], ['=ROUNDUP(1E-7,2)', 0.01], ['=ROUNDDOWN(1E15,0)', 1e15], ['=TRUNC(1E16)', 1e16], ['=TRUNC(G1+G3-3)', 0], ['=ROUND(1.5,21)', 1.5],
  // LOG(x) with base 10 / 2 is exact, so INT(LOG(1000)) is 3 and the digit-count idiom holds (ln/ln gives 2.9999999999999996)
  ['=INT(LOG(1000))', 3], ['=INT(LOG(1E6))+1', 7], ['=INT(LOG(1000,10))', 3], ['=MOD(LOG(1E15),1)', 0], ['=INT(LOG(536870912,2))', 29], ['=LOG(1000)=LOG10(1000)', true], ['=LOG(0)', '#NUM!'],
]);

table('lookups match Excel defaults', [
  ['=MATCH(20,D1:D3,0)', 2], ['=MATCH(25,D1:D3)', 2], ['=MATCH(25,D1:D3,1)', 2], ['=MATCH(25,D1:D3,0)', '#N/A'], ['=MATCH(5,D1:D3)', '#N/A'], ['=MATCH("BANANA",E1:E3,0)', 2], ['=MATCH("b*",E1:E3,0)', 2], ['=MATCH(30,D1:D3,-1)', '#N/A'],
  ['=VLOOKUP(20,D1:E3,2,FALSE)', 'banana'], ['=VLOOKUP(25,D1:E3,2)', 'banana'], ['=VLOOKUP(25,D1:E3,2,TRUE)', 'banana'], ['=VLOOKUP(5,D1:E3,2)', '#N/A'], ['=VLOOKUP(20,D1:E3,3,0)', '#REF!'], ['=VLOOKUP("Banana",E1:E3,1,0)', 'banana'], ['=VLOOKUP(99,D1:E3,2,0)', '#N/A'],
  ['=HLOOKUP(1,A1:B2,2,0)', 2], ['=INDEX(D1:E3,3,2)', 'cherry'], ['=INDEX(D1:D3,2)', 20], ['=INDEX(D1:D3,4)', '#REF!'], ['=INDEX(D1:E1,2)', 'apple'], ['=SUM(INDEX(D1:E3,0,1))', 60],
  ['=XLOOKUP(20,D1:D3,E1:E3)', 'banana'], ['=XLOOKUP(99,D1:D3,E1:E3,"none")', 'none'], ['=XLOOKUP(99,D1:D3,E1:E3)', '#N/A'],
  // XLOOKUP match_mode 1 / -1 mean next larger / next smaller on ANY data; mode 0 has no wildcards, mode 2 does; search_mode -1 scans last-to-first
  ['=XLOOKUP(25,D1:D3,E1:E3,,1)', 'cherry'], ['=XLOOKUP(5,D1:D3,E1:E3,,1)', 'apple'], ['=XLOOKUP(20,D1:D3,E1:E3,,1)', 'banana'], ['=XLOOKUP(25,D1:D3,E1:E3,,-1)', 'banana'], ['=XLOOKUP(35,D1:D3,E1:E3,,1)', '#N/A'], ['=XLOOKUP(25,D1:D3,E1:E3,"nf",1)', 'cherry'],
  ['=XLOOKUP(25,H1:H3,E1:E3,,-1)', 'cherry'], ['=XLOOKUP(15,H1:H3,H1:H3,,-1)', 10], ['=XLOOKUP(15,H1:H3,H1:H3,,1)', 20], ['=XLOOKUP("b*",E1:E3,D1:D3)', '#N/A'], ['=XLOOKUP("b*",E1:E3,D1:D3,,2)', 20], ['=XLOOKUP("BANANA",E1:E3,D1:D3)', 20], ['=XLOOKUP(20,D1:D3,E1:E3,,0,-1)', 'banana'], ['=XLOOKUP(20,D1:D3,E1:E3,,3)', '#VALUE!'],
  // approximate MATCH / VLOOKUP binary-search like Excel, so unsorted or descending data still yields a row (never #N/A just because row 1 is larger)
  ['=MATCH(15,H1:H3)', 2], ['=VLOOKUP("apple",I1:I3,1)', 'apple'], ['=MATCH(25,J1:J3,1)', 3], ['=VLOOKUP(25,J1:J3,1)', 10], ['=MATCH(20,D1:D3,1)', 2], ['=MATCH(9.99E+307,A1:B3,1)', 5],
  ['=OFFSET(A1,1,0)', 2], ['=SUM(OFFSET(A1,0,0,3,1))', 6], ['=OFFSET(A1,-1,0)', '#REF!'], ['=CHOOSE(2,"a","b")', 'b'], ['=CHOOSE(3,"a","b")', '#VALUE!'], ['=ROWS(A1:A3)', 3], ['=COLUMNS(A1:C1)', 3], ['=ROW()', 5], ['=COLUMN()', 2], ['=ROW(D7)', 7],
]);

table('criteria in the *IF family', [
  ['=SUMIF(D1:D3,">15")', 50], ['=SUMIF(D1:D3,">=20")', 50], ['=SUMIF(D1:D3,"<>20")', 40], ['=SUMIF(E1:E3,"apple",D1:D3)', 10], ['=SUMIF(E1:E3,"APPLE",D1:D3)', 10], ['=SUMIF(E1:E3,"b*",D1:D3)', 20], ['=SUMIF(E1:E3,"?????",D1:D3)', 10],
  ['=SUMIF(D1:D3,20)', 20], ['=SUMIF(D1:D3,"20")', 20], ['=SUMIF(D1:D3,">"&D1)', 50], ['=SUMIF(F1:F3,"",D1:D3)', 60], ['=COUNTIF(F1:F3,"")', 3], ['=COUNTIF(E1:E3,"<>")', 3], ['=COUNTIF(E1:E3,"b*")', 1], ['=COUNTIF(D1:D3,"<>20")', 2], ['=COUNTIF(E1:E3,"<>apple")', 2], ['=COUNTIF(B1:B3,"5")', 1], ['=COUNTIF(A1:A3,">1")', 2],
  // an error in a CRITERIA range is a value to match or skip, never a propagation; only a matched error in the SUM range propagates
  ['=COUNTIF(C1:C3,"#N/A")', 1], ['=COUNTIF(A1:C1,"<>")', 3], ['=COUNTIF(C1:C3,"<>#N/A")', 2], ['=COUNTIF(C1:C3,"*")', 0], ['=SUMIF(C1:D3,">15")', 50], ['=SUMIFS(D1:D3,C1:C3,"#N/A")', 10], ['=COUNTIFS(C1:C3,"<>",D1:D3,">5")', 1], ['=COUNTIF(C1:C3,"<>")', 1], ['=SUMIF(A1:A3,">1",C1:C3)', 0], ['=SUMIF(A1:A3,">0",C1:C3)', '#N/A'],
  ['=SUMIFS(D1:D3,E1:E3,"<>apple",D1:D3,">=30")', 30], ['=COUNTIFS(D1:D3,">10",D1:D3,"<30")', 1], ['=AVERAGEIF(D1:D3,">10")', 25], ['=AVERAGEIF(D1:D3,">50")', '#DIV/0!'], ['=AVERAGEIFS(D1:D3,E1:E3,"<>banana")', 20], ['=MAXIFS(D1:D3,E1:E3,"<>cherry")', 20], ['=MINIFS(D1:D3,E1:E3,"<>apple")', 20],
]);

table('text functions', [
  ['=LEN(1234)', 4], ['=LEN("")', 0], ['=LEN(F1)', 0], ['=LEFT("hello")', 'h'], ['=LEFT("hello",2)', 'he'], ['=RIGHT("hello",2)', 'lo'], ['=RIGHT("hello",0)', ''], ['=LEFT("hi",-1)', '#VALUE!'], ['=MID("hello",2,3)', 'ell'], ['=MID("hello",0,3)', '#VALUE!'],
  ['=FIND("l","hello")', 3], ['=FIND("L","hello")', '#VALUE!'], ['=SEARCH("L","hello")', 3], ['=SEARCH("l?o","hello")', 3], ['=FIND("l","hello",4)', 4], ['=TRIM("  a   b ")', 'a b'], ['=UPPER("ab")', 'AB'], ['=LOWER("AB")', 'ab'], ['=PROPER("hello world")', 'Hello World'],
  ['=CONCATENATE("a",1,TRUE)', 'a1TRUE'], ['=CONCAT(E1:E3)', 'applebananacherry'], ['=CONCATENATE(E1:E3)', '#VALUE!'], ['=TEXTJOIN(",",TRUE,E1:E3)', 'apple,banana,cherry'], ['=TEXTJOIN("-",TRUE,A1,F1,A2)', '1-2'], ['=TEXTJOIN("-",FALSE,A1,F1,A2)', '1--2'],
  ['=SUBSTITUTE("aaa","a","b",2)', 'aba'], ['=SUBSTITUTE("a.b.c",".","")', 'abc'], ['=REPT("ab",3)', 'ababab'], ['=EXACT("a","A")', false], ['=VALUE("1,234.5")', 1234.5], ['=VALUE("x")', '#VALUE!'], ['=T(A1)', ''], ['=T(E1)', 'apple'], ['=N(E1)', 0], ['=N(TRUE)', 1],
  ['="say ""hi"""', 'say "hi"'], ['=A1&""', '1'], ['=G1&""', '0.5'], ['=(0.1+0.2)&""', '0.3'], ['=1E3', 1000], ['=.5', 0.5], ['=1e3&""', '1000'],
  ['=TEXT(1234.5,"#,##0.00")', '1,234.50'], ['=TEXT(0.256,"0.0%")', '25.6%'], ['=TEXT(1234.5678,"0")', '1235'], ['=TEXT(45000,"yyyy-mm-dd")', '2023-03-15'], ['=TEXT(45000,"mmm-yy")', 'Mar-23'], ['=TEXT(45000,"dddd")', 'Wednesday'], ['=TEXT(-5,"$#,##0")', '-$5'],
]);

table('TEXT follows Excel format codes: leading zeros, sections, times, scientific, passthrough', [
  ['=TEXT(5,"0000")', '0005'], ['=TEXT(12,"000")', '012'], ['=TEXT(7,"00")&"-"&TEXT(3,"00")', '07-03'], ['=TEXT(1234.5,"000000.00")', '001234.50'], ['=TEXT(5,"0,000")', '0,005'], ['=TEXT(-5,"000")', '-005'], ['=TEXT(5,"$000")', '$005'], ['=TEXT(0.05,"00%")', '05%'], ['=TEXT(5,"000.0")', '005.0'],
  ['=TEXT(0,"#")', ''], ['=TEXT(0.5,"#.0")', '.5'], ['=TEXT(1.5,"0.00##")', '1.50'], ['=TEXT(1234567,"#,##0")', '1,234,567'], ['=TEXT(1234567,"#,##0,")', '1,235'], ['=TEXT(5,"0 ""kg""")', '5 kg'], ['=TEXT(1234.5,"General")', '1234.5'], ['=TEXT(1E15,"#,##0")', '1,000,000,000,000,000'], ['=TEXT(1E-7,"0.00")', '0.00'],
  // sections: positive;negative;zero — the negative section supplies its own sign
  ['=TEXT(-1234.5,"#,##0;(#,##0)")', '(1,235)'], ['=TEXT(-0.25,"0.0%;(0.0%)")', '(25.0%)'], ['=TEXT(0,"#,##0;(#,##0);-")', '-'], ['=TEXT(-5,"0;0")', '5'], ['=TEXT(1234.5,"#,##0;(#,##0)")', '1,235'], ['=TEXT(0.25,"0.0%;(0.0%)")', '25.0%'], ['=TEXT(0,"#,##0;(#,##0)")', '0'],
  // times, scientific, text passthrough, and no silent garbage for unknown codes
  ['=TEXT(45000.5,"h:mm")', '12:00'], ['=TEXT(45000.75,"hh:mm AM/PM")', '06:00 PM'], ['=TEXT(45000.25,"h:mm:ss am/pm")', '6:00:00 am'], ['=TEXT(45000.5,"h")', '12'], ['=TEXT(45000.5,"[h]")', '1080012'], ['=TEXT(0.5,"[m]:ss")', '720:00'], ['=TEXT(45000,"m/d/yyyy")', '3/15/2023'], ['=TEXT(45000,"mmm d, yyyy")', 'Mar 15, 2023'], ['=TEXT(45000,"mmmmm")', 'M'],
  ['=TEXT(1234,"0.00E+00")', '1.23E+03'], ['=TEXT(0.000123,"0.0E-0")', '1.2E-4'], ['=TEXT("abc","0")', 'abc'], ['=TEXT(E1,"@")', 'apple'], ['=TEXT(B1,"0.00")', '5.00'], ['=TEXT(B3,"0")', 'TRUE'], ['=TEXT(F1,"0")', '0'], ['=TEXT(5,"0 kg")', '#VALUE!'], ['=TEXT(45000,"0 yyyy")', '#VALUE!'], ['=TEXT(-1,"yyyy")', '#VALUE!'], ['=TEXT(5,"\\k\\g0")', 'kg5'], ['=TEXT(12345.678,"$#,##0.00_);($#,##0.00)")', '$12,345.68 '], ['=TEXT(-12345.678,"$#,##0.00_);($#,##0.00)")', '($12,345.68)'],
  // Excel's text limits: 32,767 characters per result, 30 decimal places per format — errors, never a RangeError
  ['=LEN(REPT("a",32767))', 32767], ['=REPT("a",32768)', '#VALUE!'], ['=REPT("a",1E9)', '#VALUE!'], ['=LEN(REPT("a",40000))', '#VALUE!'], ['=LEN(CONCAT(REPT("a",30000),REPT("b",30000)))', '#VALUE!'], ['=LEN(REPT("a",30000)&REPT("b",30000))', '#VALUE!'], ['=LEN(SUBSTITUTE(REPT("a",32767),"a",REPT("b",32767)))', '#VALUE!'], ['=TEXT(1,"0."&REPT("0",101))', '#VALUE!'], ['=TEXT(1.5,"0."&REPT("0",25))', '1.5000000000000000000000000'],
]);

table('dates are serial numbers', [
  ['=TODAY()', 45000], ['=DATE(2024,3,15)', 45366], ['=DATE(2024,13,1)', 45658], ['=DATE(2024,2,30)', 45352], ['=DATE(2023,0,15)', 44910],
  ['=YEAR(45000)', 2023], ['=MONTH(45000)', 3], ['=DAY(45000)', 15], ['=WEEKDAY(45000)', 4], ['=WEEKDAY(45000,2)', 3], ['=DAYS(45010,45000)', 10],
  ['=EOMONTH(45000,0)', 45016], ['=EOMONTH(45000,1)', 45046], ['=EDATE(45000,1)', 45031], ['=EDATE(DATE(2024,1,31),1)', 45351], ['=YEARFRAC(DATE(2024,1,1),DATE(2024,7,1))', 0.5], ['=YEARFRAC(DATE(2024,1,31),DATE(2024,3,31))', 60 / 360],
  // WEEKDAY return types 11–17 start the week on Monday…Sunday; 4–10 are #NUM!
  ['=WEEKDAY(45000,11)', 3], ['=WEEKDAY(45000,12)', 2], ['=WEEKDAY(45000,13)', 1], ['=WEEKDAY(45000,16)', 5], ['=WEEKDAY(45000,17)', 4], ['=WEEKDAY(45000,3)', 2], ['=WEEKDAY(45004,2)', 7], ['=WEEKDAY(45004,17)', 1], ['=WEEKDAY(45000,4)', '#NUM!'], ['=WEEKDAY(45000,0)', '#NUM!'], ['=WEEKDAY(45000,18)', '#NUM!'],
  // YEARFRAC basis 4 is European 30/360 (only a 31st clips, no February rule); basis outside 0–4 is #NUM!
  ['=YEARFRAC(DATE(2024,2,29),DATE(2024,3,31),4)', 31 / 360], ['=YEARFRAC(DATE(2024,1,31),DATE(2024,2,29),4)', 29 / 360], ['=YEARFRAC(DATE(2024,1,1),DATE(2024,12,31),4)', 359 / 360], ['=YEARFRAC(DATE(2024,1,15),DATE(2024,3,31),4)', 75 / 360], ['=YEARFRAC(DATE(2024,2,29),DATE(2024,3,31),0)', 30 / 360], ['=YEARFRAC(DATE(2024,1,1),DATE(2024,7,1),5)', '#NUM!'], ['=YEARFRAC(DATE(2024,1,1),DATE(2024,7,1),-1)', '#NUM!'],
]);

table('financial functions', [
  ['=NPV(0.1,100,100)', 100 / 1.1 + 100 / 1.21], ['=NPV(0.1,D1:D3)', 10 / 1.1 + 20 / 1.21 + 30 / 1.331], ['=NPV(-1,100)', '#DIV/0!'], ['=NPV(-2,100)', -100], ['=IRR(D1:D3)', '#NUM!'],
]);
test('PMT / PV / FV / IRR agree with Excel to 4 decimals', () => {
  const near4 = (f, exp) => { const got = ev(f); assert.ok(Math.abs(got - exp) < 5e-5, `${f} → ${got}, expected ${exp}`); };
  near4('=PMT(0.05/12,60,10000)', -188.7123); near4('=PV(0.05,10,-100)', 772.1735); near4('=FV(0.05,10,-100)', 1257.7893); near4('=PMT(0,12,1200)', -100);
  const r = evalFormula('=IRR(A1:A4)', { raw: k => ({ A1: -100, A2: 50, A3: 40, A4: 30 })[k] ?? null }); assert.ok(Math.abs(r - 0.10652) < 5e-5, String(r));
});

table('multi-letter columns, absolute refs, parsing edge cases', [
  ['=AA1*2', 14], ['=$A$1+$a2', 3], ['=a1+a2', 3], ['=sum(a1:a3)', 6], ['=SUM( A1 : A3 )', 6], ['=(A1)', 1], ['=SUM(-1,2)', 1], ['=-SUM(1,2)', -3], ['=SUM(A1:A3)*(A1>0)', 6],
  ['=IF(A1=1,"one","other")', 'one'], ['=IF(A1>=1,IF(A2>=2,"both","first"),"none")', 'both'], ['=IFS(A1>5,"a",A1>0,"b")', 'b'], ['=IFS(A1>5,"a")', '#N/A'], ['=SWITCH(A2,1,"one",2,"two","other")', 'two'], ['=SWITCH(A3,1,"one","other")', 'other'],
  ['=IFERROR(1/0,"bad")', 'bad'], ['=IF(1/0,1,2)', '#DIV/0!'], ['=IF(TRUE,1,1/0)', 1], ['=IF(FALSE,1/0,2)', 2],
  // absolute whole-column / whole-row references, either half anchored
  ['=SUM($A:$A)', 6], ['=SUM(A:$A)', 6], ['=SUM($A:A)', 6], ['=VLOOKUP(2,$A:$B,1,0)', 2], ['=SUM($2:$2)', 49.5], ['=SUM($2:2)', 49.5], ['=SUM(2:$2)', 49.5], ['=SUM($1:$1)', '#N/A'],
  // error literals are case-insensitive, as everything else in a formula is; inside a string they stay text
  ['=#n/a', '#N/A'], ['=#ref!', '#REF!'], ['=#Div/0!', '#DIV/0!'], ['=IF(A1=1,#n/a,0)', '#N/A'], ['=IF(A1=2,#n/a,0)', 0], ['=LEN("#n/a")', 4],
  // an omitted slot in a lazy form is a blank, never a TypeError: IF(,1,2) is 2
  ['=IF(,1,2)', 2], ['=IF(A1,,2)', 0], ['=CHOOSE(,1,2)', '#VALUE!'], ['=CHOOSE(1,,2)', 0], ['=SWITCH(1,1,)', 0], ['=SWITCH(,0,"zero","other")', 'zero'], ['=IFS(,1)', '#N/A'], ['=IFS(,1,TRUE,2)', 2], ['=ROUND(1,)', 1], ['=SUM(,)', 0], ['=MAX(,)', 0],
]);

test('syntax errors throw (the commit gate decides), never return a value', () => {
  for (const f of ['=1+', '=SUM(A1:A3', '=(1', '=1,000', '=@@', '=', '=A1:', '="abc', '=IFERROR(1/0)', '=IF(1)', '=MAX()', '=$1', '=A1:$1']) assert.throws(() => ev(f), SyntaxError, f);
});

test('argument counts are checked by the parser, so parses()/autocorrect agree with evalFormula (Excel refuses at entry)', () => {
  // too few, too many: refused everywhere
  for (const f of ['=SUM()', '=VLOOKUP(1,A1:B3)', '=ROUND(2.5)', '=IF(1)', '=IFERROR(1)', '=CHOOSE()', '=SWITCH()', '=ISERROR()', '=ISNA()', '=ABS(1,2)', '=PI(1)', '=IF(1,2,3,4)', '=TODAY(1)', '=LEN("a","b")']) {
    assert.throws(() => ev(f), SyntaxError, f); assert.equal(parses(f), false, f); assert.equal(autocorrectFormula(f).kind, 'bad', f);
  }
  // empty slots count as arguments, as in Excel (=SUM(,) is 0, =ROUND(1,) is 1)
  for (const f of ['=SUM(,)', '=ROUND(1,)', '=IF(,1,2)', '=MAX(,)', '=SUM(A1:A3,)', '=IF(A1,,)']) { assert.equal(parses(f), true, f); assert.equal(autocorrectFormula(f).kind, 'ok', f); }
  assert.throws(() => ev('=SUM()'), /too few arguments for SUM/);
  assert.throws(() => ev('=ABS(1,2)'), /too many arguments for ABS/);
});

test('length and nesting limits are SyntaxErrors (Excel: 8,192 characters, 64 nested functions); nothing else ever escapes', () => {
  const chain4096 = '=' + '1+'.repeat(4095) + '1';                       // 8,192 characters including '='
  assert.equal(chain4096.length, 8192); assert.equal(ev(chain4096), 4096);
  assert.throws(() => ev('=' + '1+'.repeat(4096) + '1'), /formula too long/);
  assert.equal(ev('=' + '1*2+'.repeat(2000) + '1'), 4001);
  assert.equal(ev('=' + 'SUM('.repeat(64) + '1' + ')'.repeat(64)), 1);
  assert.throws(() => ev('=' + 'SUM('.repeat(65) + '1' + ')'.repeat(65)), /too many nested levels/);
  assert.equal(ev('=' + '('.repeat(500) + '1' + ')'.repeat(500)), 1);
  assert.equal(ev('=' + '-'.repeat(400) + '1'), 1);
  for (const f of ['=' + '('.repeat(3000) + '1' + ')'.repeat(3000), '=' + '1+'.repeat(20000) + '1', '=' + '('.repeat(600) + '1' + ')'.repeat(600)]) {
    assert.throws(() => ev(f), SyntaxError); assert.equal(parses(f), false); assert.equal(autocorrectFormula(f).kind, 'bad');
  }
});

test('wildcards match with an iterative glob: many * segments stay in milliseconds and agree with the regex semantics', () => {
  const c = {}; for (let i = 1; i <= 5; i++) c['A' + i] = 'a'.repeat(28);
  const cx = { raw: k => c[k] ?? null, rows: 20, cols: 10 };
  for (const pat of ['*a'.repeat(50) + '*b', '*'.repeat(30) + 'x', '*a?'.repeat(40) + 'b']) {
    const t0 = Date.now();
    assert.equal(evalFormula('=COUNTIF(A1:A5,"' + pat + '")', cx), 0); assert.equal(evalFormula('=MATCH("' + pat + '",A1:A5,0)', cx), '#N/A'); assert.equal(evalFormula('=SEARCH("' + pat + '",A1)', cx), '#VALUE!');
    assert.ok(Date.now() - t0 < 200, pat.length + '-char pattern took ' + (Date.now() - t0) + ' ms');
  }
  // parity with a straightforward regex translation over random patterns (case-insensitive, ? spans any char, ~ escapes)
  const esc = ch => ch.replace(/[.*+?^$\{}()|[\]\\]/g, m => '\\' + m);
  const rx = pat => { let r = '^'; for (let i = 0; i < pat.length; i++) { const ch = pat[i]; if (ch === '~' && i + 1 < pat.length) r += esc(pat[++i]); else if (ch === '*') r += '.*'; else if (ch === '?') r += '.'; else r += esc(ch); } return new RegExp(r + '$', 'is'); };
  let seed = 12345; const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  const alpha = 'ab*?~A\n';
  for (let k = 0; k < 3000; k++) {
    let pat = '', str = ''; const lp = rnd(6), ls = rnd(7);
    for (let i = 0; i < lp; i++) pat += alpha[rnd(alpha.length)]; for (let i = 0; i < ls; i++) str += alpha[rnd(alpha.length)];
    const got = evalFormula('=COUNTIF(A1,B1)', { raw: k => ({ A1: str, B1: pat })[k] ?? null });
    const exp = pat === '' ? (str === '' ? 1 : 0) : (rx(pat).test(str) ? 1 : 0);
    assert.equal(got, exp, JSON.stringify({ pat, str }));
  }
  assert.equal(ev('=COUNTIF(E1:E3,"~*")'), 0); assert.equal(evalFormula('=COUNTIF(A1:A2,"a~*b")', { raw: k => ({ A1: 'a*b', A2: 'axb' })[k] ?? null }), 1); assert.equal(ev('=SEARCH("a*c","xxabcxx")'), 3); assert.equal(ev('=SEARCH("~*","a*b")'), 2);
});

test('textToNumber mirrors Excel text coercion', () => {
  assert.equal(textToNumber('5'), 5); assert.equal(textToNumber(' -1,234.5 '), -1234.5); assert.equal(textToNumber('12%'), 0.12); assert.equal(textToNumber('$1,000'), 1000); assert.equal(textToNumber('(5)'), -5); assert.equal(textToNumber('1e3'), 1000);
  assert.equal(textToNumber('abc'), null); assert.equal(textToNumber(''), null); assert.equal(textToNumber('1,00'), null); assert.equal(textToNumber('TRUE'), null);
});

test('translateFormula shifts relative parts only and returns #REF! off the sheet', () => {
  assert.equal(translateFormula('=SUM($A$1:B2)+C3&"x"', 1, 1), '=SUM($A$1:C3)+D4&"x"');
  assert.equal(translateFormula('=A1', -1, 0), '=#REF!');
  assert.equal(translateFormula('=SUM(A1:A3)', -1, 0), '=SUM(#REF!)');
  assert.equal(translateFormula('=SUM($A$1:A3)', -1, 0), '=SUM($A$1:A2)');
  assert.equal(translateFormula('=SUM(A:A)', 0, 1), '=SUM(B:B)');
  assert.equal(translateFormula('=SUM(1:1)', 1, 0), '=SUM(2:2)');
  assert.equal(translateFormula('="A1"&A1', 0, 1), '="A1"&B1');
  assert.equal(translateFormula('=Z1', 0, 1), '=AA1');
  // absolute halves of whole-column / whole-row references stay put
  assert.equal(translateFormula('=SUM($A:$A)', 0, 1), '=SUM($A:$A)'); assert.equal(translateFormula('=SUM(A:$A)', 0, 1), '=SUM(B:$A)'); assert.equal(translateFormula('=SUM(1:$1)', 1, 0), '=SUM(2:$1)'); assert.equal(translateFormula('=SUM($1:$1)', 1, 0), '=SUM($1:$1)');
  // a whole-column / whole-row reference pushed off the sheet is ONE #REF! token that still parses (never #REF!:#REF!)
  assert.equal(translateFormula('=SUM(B:B)', 0, -2), '=SUM(#REF!)'); assert.equal(translateFormula('=SUM(2:2)', -2, 0), '=SUM(#REF!)'); assert.equal(translateFormula('=COUNTIF(A:A,B2)', 0, -1), '=COUNTIF(#REF!,A2)'); assert.equal(translateFormula('=SUM(B:B)+1', 0, -2), '=SUM(#REF!)+1');
  assert.equal(ev(translateFormula('=SUM(B:B)', 0, -2)), '#REF!'); assert.equal(ev(translateFormula('=SUM(2:2)', -2, 0)), '#REF!');
});

test('adjustFormulaStructure rewrites references for inserted and deleted rows/columns', () => {
  assert.equal(adjustFormulaStructure('=SUM(A2:A5)+B7', 'r', 3, 2), '=SUM(A2:A7)+B9');
  assert.equal(adjustFormulaStructure('=SUM(A2:A5)+B3', 'r', 3, -1), '=SUM(A2:A4)+#REF!');
  assert.equal(adjustFormulaStructure('=SUM(A3:A4)', 'r', 3, -2), '=SUM(#REF!)');
  assert.equal(adjustFormulaStructure('=SUM(B1:C1)+D1', 'c', 2, 1), '=SUM(C1:D1)+E1');
  assert.equal(adjustFormulaStructure('=$A$5', 'r', 2, 1), '=$A$6');   // $ does not protect against structure changes
  // whole-column / whole-row references shift on their own axis and are untouched on the other
  assert.equal(adjustFormulaStructure('=SUM(B:B)', 'c', 1, 1), '=SUM(C:C)'); assert.equal(adjustFormulaStructure('=SUM(B:B)', 'c', 2, -1), '=SUM(#REF!)'); assert.equal(adjustFormulaStructure('=SUM(2:2)', 'r', 1, 1), '=SUM(3:3)');
  assert.equal(adjustFormulaStructure('=SUM(B:D)', 'c', 3, -1), '=SUM(B:C)'); assert.equal(adjustFormulaStructure('=SUM(B:B)', 'r', 1, 1), '=SUM(B:B)'); assert.equal(adjustFormulaStructure('=SUM(2:2)', 'c', 1, 1), '=SUM(2:2)');
  assert.equal(adjustFormulaStructure('=SUM($B:$B)+A1', 'c', 1, 1), '=SUM($C:$C)+B1'); assert.equal(adjustFormulaStructure('=SUM(D:B)', 'c', 3, -1), '=SUM(C:B)'); assert.equal(adjustFormulaStructure('=SUM(1:$3)', 'r', 2, -1), '=SUM(1:$2)');
});

test('formulaRefs and formulaFunctions are token based', () => {
  assert.deepEqual(formulaRefs('=SUM(A1:B2)+c3').map(r => r.key || 'range'), ['range', 'C3']);
  assert.deepEqual(formulaRefs('="A1"&B2').map(r => r.key), ['B2']);
  assert.deepEqual(formulaFunctions('=IFERROR(vlookup(A1,B:C,2,0),0)'), ['IFERROR', 'VLOOKUP']);
  assert.deepEqual(formulaFunctions('="SUM("'), []);
  // whole-column / whole-row references are emitted as ranges bounded by the sheet size (defaults match evalFormula's 20×10), so recalc sees =SUM(A:A) in column A as circular
  assert.deepEqual(formulaRefs('=SUM(A:A)').map(r => r.range), [{ r1: 1, c1: 1, r2: 20, c2: 1 }]);
  assert.deepEqual(formulaRefs('=SUM(1:1)', { rows: 30, cols: 12 }).map(r => r.range), [{ r1: 1, c1: 1, r2: 1, c2: 12 }]);
  assert.deepEqual(formulaRefs('=SUM($B:$A)+C3', { rows: 50, cols: 8 }).map(r => [r.text, r.pos, r.end, r.key || r.range]), [['$B:$A', 5, 10, { r1: 1, c1: 1, r2: 50, c2: 2 }], ['C3', 12, 14, 'C3']]);
  assert.deepEqual(formulaRefs('=SUM($2:3)').map(r => r.range), [{ r1: 2, c1: 1, r2: 3, c2: 10 }]);
});

test('normalizeFormula upper-cases error literals outside strings', () => {
  assert.equal(normalizeFormula('=#n/a&"#n/a"'), '=#N/A&"#n/a"'); assert.equal(normalizeFormula('=if(a1=1,#ref!,#div/0!)'), '=IF(A1=1,#REF!,#DIV/0!)');
  assert.deepEqual(autocorrectFormula('=#n/a'), { kind: 'ok', buf: '=#N/A' }); assert.deepEqual(autocorrectFormula('=SUM($a$1:$a$3)'), { kind: 'ok', buf: '=SUM($A$1:$A$3)' }); assert.equal(autocorrectFormula('=SUM($A:$A)').kind, 'ok');
});

test('autocorrect ladder: ok / fix / bad', () => {
  assert.deepEqual(autocorrectFormula('=sum(a1:a3)'), { kind: 'ok', buf: '=SUM(A1:A3)' });
  assert.equal(autocorrectFormula('=SUM(A1;A2)').kind, 'ok');
  assert.deepEqual(autocorrectFormula('=1+'), { kind: 'fix', buf: '=1+', fixed: '=1' });
  assert.deepEqual(autocorrectFormula('=SUM(A1:A3))'), { kind: 'fix', buf: '=SUM(A1:A3))', fixed: '=SUM(A1:A3)' });
  assert.equal(autocorrectFormula('==1').fixed, '=1');
  assert.equal(autocorrectFormula('=@@').kind, 'bad');
  assert.equal(autocorrectFormula('=FOO(1)').kind, 'ok');   // #NAME? is a value, not a syntax error
});

test('parseFormula builds the expected tree shape', () => {
  const ast = parseFormula('=-2^2');
  assert.equal(ast.k, 'bin'); assert.equal(ast.op, '^'); assert.equal(ast.l.k, 'un');
});
