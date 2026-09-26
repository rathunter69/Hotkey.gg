// app2/tests/numfmt.test.js — custom number formats (Chapter 2): one engine renders the grid's
// cells, the Custom box and TEXT(). Every expectation is what Excel shows for the same code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatValue, compileFormat, isValidFormat, normalizeCode, builtinCode, stepDecimals, codeDecimals, FormatError } from '../engine/numfmt.js';
import { fmtNum, dispText, dispColor } from '../engine/format.js';
import { evalFormula } from '../engine/formula.js';
import { Sheet, cellTxtPx } from '../engine/sheet.js';
import { Session, NUMFMT_BAD_NOTE } from '../engine/keyboard.js';
import { runCommand } from '../ui/ribbon-commands.js';
import { HOUSE_FORMATS } from '../content/workbooks/voltline-pnl.js';

const F = (v, code) => formatValue(v, code).text;
const JAN31 = 46053;   // 2026-01-31

test('the four sections: positive; negative; zero; text — the house set from the P&L workbook', () => {
  assert.equal(F(1234.5, HOUSE_FORMATS.plain), '1,235 ');
  assert.equal(F(-1234.5, HOUSE_FORMATS.plain), '(1,235)');
  assert.equal(F(0, HOUSE_FORMATS.plain), '- ');
  assert.equal(F(1500, HOUSE_FORMATS.dollar), '$1,500 ');
  assert.equal(F(-1500, HOUSE_FORMATS.dollar), '($1,500)');
  assert.equal(F(0.1234, HOUSE_FORMATS.pct), '12.3% ');
  assert.equal(F(-0.05, HOUSE_FORMATS.pct), '(5.0%)');
  assert.equal(F(0, HOUSE_FORMATS.pct), '- ');
  assert.equal(F(1500000, HOUSE_FORMATS.perSite), '$1,500k ');
  assert.equal(F(-2500, HOUSE_FORMATS.perSite), '($3k)');   // 2.5 rounds half away from zero, as Excel rounds
  assert.equal(F(JAN31, HOUSE_FORMATS.month), 'Jan-26');
  assert.equal(F('n/a', '0;(0);"-";"text: "@'), 'text: n/a');   // the fourth section dresses text
  assert.equal(F('n/a', '0;(0);"-"'), 'n/a');                    // no text section: text passes through
  assert.equal(F(true, '0.0'), 'TRUE');
});

test('units in the format: k, m, x, bps — scaling commas and quoted literals', () => {
  assert.equal(F(1234567, '#,##0,'), '1,235');
  assert.equal(F(1234567, '#,##0.0,,"m"'), '1.2m');
  assert.equal(F(2.456, '0.0"x"'), '2.5x');
  assert.equal(F(25, '0" bps"'), '25 bps');
  assert.equal(F(0.1234, '0.0%'), '12.3%');
  assert.equal(F(-2.456, '0.0"x";(0.0"x")'), '(2.5x)');
  assert.equal(F(1234.5678, '0.00E+00'), '1.23E+03');
});

test('conditional sections and colours: [>=1000000] … ; [Red]; hidden zeros; ;;; hides everything', () => {
  const tiers = '[>=1000000]#,##0.0,,"m";[>=1000]#,##0,"k";#,##0';
  assert.equal(F(2500000, tiers), '2.5m'); assert.equal(F(12500, tiers), '13k'); assert.equal(F(999, tiers), '999'); assert.equal(F(-12500, tiers), '-12,500');
  assert.deepEqual(formatValue(-5, '#,##0;[Red](#,##0)'), { text: '(5)', color: 'red' });
  assert.deepEqual(formatValue(5, '#,##0;[Red](#,##0)'), { text: '5', color: null });
  assert.deepEqual(formatValue(1, '[Red]"ERROR";[Red]"ERROR";"OK"'), { text: 'ERROR', color: 'red' });
  assert.deepEqual(formatValue(0, '[Red]"ERROR";[Red]"ERROR";"OK"'), { text: 'OK', color: null });
  assert.equal(F(0, '#,##0;(#,##0);'), '');        // an empty zero section hides zeros
  assert.equal(F(0, '#,##0;(#,##0);;@'), '');
  assert.equal(F(123, ';;;'), '');                    // the classic hide-all
  assert.equal(F(0.5, '[Blue]0%;[Red]-0%'), '50%'); assert.equal(formatValue(0.5, '[Blue]0%;[Red]-0%').color, 'blue');
  assert.equal(F(5, '[<0]"neg";[>10]"big"'), '########');   // no section fits: Excel fills the cell
});

test('dates through the same codes', () => {
  assert.equal(F(JAN31, 'mmm-yy'), 'Jan-26'); assert.equal(F(JAN31, 'dd/mm/yyyy'), '31/01/2026');
  assert.equal(F(JAN31, 'mmmm d, yyyy'), 'January 31, 2026'); assert.equal(F(JAN31, 'ddd'), 'Sat'); assert.equal(F(JAN31, 'yy'), '26');
  assert.equal(F(JAN31 + 0.5, 'h:mm AM/PM'), '12:00 PM'); assert.equal(F(JAN31 + 0.75, '[h]:mm'), '1105290:00');
  assert.throws(() => formatValue(-1, 'mmm-yy'), FormatError);   // Excel shows #### for a negative date
});

test('codes Excel refuses are refused: unquoted letters, a fifth section, dates mixed with digits', () => {
  for (const bad of ['0 kg', '0;0;0;0;0', '0.0 mm', '', '[Foo]0', '0' + '.' + '0'.repeat(31)]) assert.equal(isValidFormat(bad), false, JSON.stringify(bad));
  assert.throws(() => compileFormat('0 kg'), FormatError);
  for (const ok of ['General', '0', '#,##0.00', '0.0%', '0.0"x"', '#,##0,"k"', '_($* #,##0_);_($* (#,##0);_($* "-"??_);_(@_)', 'mmm-yy', '[$€-x-euro]#,##0', '[Color 3]0']) assert.equal(isValidFormat(ok), true, ok);
  assert.equal(F(1234, '_($* #,##0_);_($* (#,##0);_($* "-"??_);_(@_)'), ' $1,234 ');   // the * fill drops, as TEXT() drops it
  assert.equal(F(1234, '[$€-x-euro]#,##0'), '€1,234');
});

test('the Custom box is lenient where Excel is: lone letters are quoted, real codes kept, the rest refused', () => {
  assert.equal(normalizeCode('0.0x'), '0.0"x"'); assert.equal(normalizeCode('#,##0,k'), '#,##0,"k"'); assert.equal(normalizeCode('0 bps'), '0 "bps"');
  assert.equal(normalizeCode('mmm-yy'), 'mmm-yy'); assert.equal(normalizeCode('0.00E+00'), '0.00E+00'); assert.equal(normalizeCode(HOUSE_FORMATS.plain), HOUSE_FORMATS.plain);
  assert.equal(normalizeCode('0 mm'), null); assert.equal(normalizeCode('#,##0.0,,m'), null); assert.equal(normalizeCode(''), null); assert.equal(normalizeCode('   '), null);
});

test('the built-in styles as codes; Increase / Decrease Decimal rewrite a code section by section', () => {
  assert.equal(builtinCode('comma', 2), '#,##0.00_);(#,##0.00)'); assert.equal(builtinCode('currency', 0, 3), '$#,##0,_);($#,##0,)');
  assert.equal(builtinCode('percent', 1), '0.0%'); assert.equal(builtinCode('mult', 1), '0.0"x"'); assert.equal(builtinCode('date'), 'mmm-yy'); assert.equal(builtinCode('general'), 'General');
  assert.equal(stepDecimals(HOUSE_FORMATS.plain, 1), '#,##0.0_);(#,##0.0);-_)');
  assert.equal(stepDecimals('#,##0.0_);(#,##0.0);-_)', -1), HOUSE_FORMATS.plain);
  assert.equal(stepDecimals('0.0%', -1), '0%'); assert.equal(stepDecimals('0%', -1), '0%'); assert.equal(stepDecimals('0.0"x"', 1), '0.00"x"');
  assert.equal(codeDecimals('0.00%'), 2); assert.equal(codeDecimals(HOUSE_FORMATS.plain), 0); assert.equal(codeDecimals('mmm-yy'), 0);
  assert.equal(F(1234.5, stepDecimals(HOUSE_FORMATS.plain, 1)), '1,234.5 ');
});

test('the grid renders a custom cell through the same engine; a bad code reads as General; [Red] reaches the painter', () => {
  assert.equal(fmtNum(1234.5, 'custom', 0, 0, HOUSE_FORMATS.plain), '1,235 ');
  assert.equal(fmtNum(-1234.5, 'custom', 0, 0, HOUSE_FORMATS.dollar), '($1,235)');
  assert.equal(fmtNum(1234.5, 'custom', 0, 0, '0 kg'), '1234.5');   // never crashes the paint
  assert.equal(dispText({ value: 0, fmtStyle: 'custom', numFmt: HOUSE_FORMATS.plain }), '- ');
  assert.equal(dispText({ value: 'n/a', fmtStyle: 'custom', numFmt: '0;(0);"-";"text: "@' }), 'text: n/a');
  assert.equal(dispColor({ value: -5, fmtStyle: 'custom', numFmt: '#,##0;[Red](#,##0)' }), 'red');
  assert.equal(dispColor({ value: 5, fmtStyle: 'custom', numFmt: '#,##0;[Red](#,##0)' }), null);
  assert.equal(dispColor({ value: 5, fmtStyle: 'comma', numFmt: null }), null);
  assert.equal(fmtNum(1234.5, 'comma', 0), '1,235');   // the Chapter 1 styles are untouched
});

test('Sheet.setCustomFormat: the selection takes the code, decimals mirror it, General resets, a bad code changes nothing', () => {
  const S = new Sheet({ cells: { A1: { value: 1234.5 }, A2: { value: -2 }, A3: { value: 0 }, B1: { value: 2.456 } } });
  S.select('A1:A3');
  assert.equal(S.setCustomFormat(HOUSE_FORMATS.plain), true);
  for (const r of ['A1', 'A2', 'A3']) { assert.equal(S.cellAt(r).fmtStyle, 'custom'); assert.equal(S.cellAt(r).numFmt, HOUSE_FORMATS.plain); }
  assert.deepEqual(['A1', 'A2', 'A3'].map(r => S.text(r)), ['1,235 ', '(2)', '- ']);
  S.changeDecimals(1); assert.equal(S.cellAt('A1').numFmt, '#,##0.0_);(#,##0.0);-_)'); assert.equal(S.cellAt('A1').decimals, 1); assert.equal(S.text('A1'), '1,234.5 ');
  S.changeDecimals(-1); assert.equal(S.cellAt('A1').numFmt, HOUSE_FORMATS.plain);
  S.goTo(1, 2); assert.equal(S.setCustomFormat('0.0x'), true); assert.equal(S.cellAt('B1').numFmt, '0.0"x"'); assert.equal(S.text('B1'), '2.5x');
  assert.equal(S.setCustomFormat('0;0;0;0;0'), false); assert.equal(S.cellAt('B1').numFmt, '0.0"x"');   // five sections: refused, nothing changes
  assert.equal(S.setCustomFormat('0 kg'), true); assert.equal(S.cellAt('B1').numFmt, '0 "kg"'); assert.equal(S.text('B1'), '2 kg');   // the box quotes a lone word, as Excel's does
  assert.equal(S.setCustomFormat('General'), true); assert.equal(S.cellAt('B1').fmtStyle, 'general'); assert.equal(S.cellAt('B1').numFmt, null); assert.equal(S.text('B1'), '2.456');
  S.goTo(1, 1); S.setNumberFormat('comma', 0); assert.equal(S.cellAt('A1').numFmt, null);   // a built-in style drops the code
  // copy › paste formats and Values & number formats carry the code; the JSON round-trips it
  S.goTo(2, 1); S.copy(false); S.goTo(1, 3); S.paste('formats'); assert.equal(S.cellAt('C1').numFmt, HOUSE_FORMATS.plain);
  S.goTo(2, 1); S.copy(false); S.goTo(2, 3); S.paste('valuesnum'); assert.equal(S.cellAt('C2').numFmt, HOUSE_FORMATS.plain); assert.equal(S.value('C2'), -2);
  const again = new Sheet(S.toJSON()); assert.equal(again.cellAt('A2').numFmt, HOUSE_FORMATS.plain); assert.equal(again.text('A2'), '(2)');
  S.goTo(2, 1); S.clearFormats(); assert.equal(S.cellAt('A2').numFmt, null); assert.equal(S.cellAt('A2').fmtStyle, 'general');
});

test('Ctrl+1 › U opens the Custom box on the cell\'s code, ↵ applies, a refused code keeps the box open with Excel\'s note', () => {
  const fresh = () => new Session(new Sheet({ cells: { A1: { value: 1234.5, fmtStyle: 'comma', decimals: 2 }, A2: { value: 7 } } }), { now: () => 0 });
  let s = fresh();
  s.run('Ctrl+1 U'); assert.equal(s.dialog, 'numfmt'); assert.equal(s.dlg.code, '#,##0.00_);(#,##0.00)'); assert.equal(s.dlg.selected, true);
  s.type('#,##0_);(#,##0);"-"_)'); s.run('Enter');
  assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null); assert.equal(s.sheet.cellAt('A1').numFmt, '#,##0_);(#,##0);"-"_)'); assert.equal(s.sheet.text('A1'), '1,235 ');
  s.run('Ctrl+1 U'); assert.equal(s.dlg.code, '#,##0_);(#,##0);"-"_)');   // reopens on the custom code
  s.run('"0.0 mm" Enter'); assert.equal(s.dialog, 'numfmt'); assert.equal(s.note, NUMFMT_BAD_NOTE); assert.equal(s.sheet.cellAt('A1').numFmt, '#,##0_);(#,##0);"-"_)');
  s.run('Escape'); assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null);
  s = fresh(); s.run('Down Alt H O E U "0.0x" Enter'); assert.equal(s.sheet.cellAt('A2').numFmt, '0.0"x"'); assert.equal(s.sheet.text('A2'), '7.0x');   // the Alt walk reaches the same box, lenient like Excel's
  s.run('Alt H 0'); assert.equal(s.sheet.text('A2'), '7.00x');   // Increase Decimal steps the code
  s = fresh(); s.run('Ctrl+1 U Backspace "mmm" Enter'); assert.equal(s.sheet.cellAt('A1').numFmt, 'mmm');   // Backspace on the selected code clears it first
  s = fresh(); runCommand(s, 'HOE'); s.applyRibbon('U'); assert.equal(s.dialog, 'numfmt'); assert.deepEqual(s.path, []);   // by mouse, one Esc away
  s.run('Escape'); assert.equal(s.mode, 'normal');
});

test('TEXT() speaks the same codes: the house set, units, tiers, dynamic headers; a bad code is #VALUE!', () => {
  const ev = (f, cells = {}) => evalFormula(f, { raw: k => cells[k] === undefined ? null : cells[k], rows: 100, cols: 26 });
  assert.equal(ev('=TEXT(1234.5,"#,##0_);(#,##0);""-""_)")'), '1,235 ');
  assert.equal(ev('=TEXT(-1234.5,"#,##0_);(#,##0);""-""_)")'), '(1,235)');
  assert.equal(ev('=TEXT(0,"#,##0_);(#,##0);""-""_)")'), '- ');
  assert.equal(ev('=TEXT(0.256,"0.0%")'), '25.6%'); assert.equal(ev('=TEXT(2500000,"#,##0.0,,""m""")'), '2.5m'); assert.equal(ev('=TEXT(2.456,"0.0""x""")'), '2.5x');
  assert.equal(ev('=TEXT(12500,"[>=1000000]#,##0.0,,""m"";[>=1000]#,##0,""k"";#,##0")'), '13k');
  assert.equal(ev('="FY"&TEXT(A1,"yy")&"E"', { A1: JAN31 }), 'FY26E');
  assert.equal(ev('="w/c "&TEXT(A1,"d mmm")', { A1: JAN31 - 5 }), 'w/c 26 Jan');
  assert.equal(ev('=TEXT("1234.5","#,##0")'), '1,235');     // numeric text reads as its number
  assert.equal(ev('=TEXT("abc","0")'), 'abc');              // text passes through
  assert.equal(ev('=TEXT(5,"0 kg")'), '#VALUE!'); assert.equal(ev('=TEXT(-1,"mmm-yy")'), '#VALUE!');
  assert.equal(ev('=TEXT(TRUE,"0")'), 'TRUE');
});

/* ---- Excel-parity fixes F7–F17, F26–F42: every expectation is what Excel shows for the same input ---- */

test('F7 fractional seconds: ss.00, h:mm:ss.000, [ss].00 and mm:ss.0 show hundredths, thousandths, tenths', () => {
  const v = 0.5 + 36.75 / 86400;
  assert.equal(F(v, 'ss.00'), '36.75'); assert.equal(F(v, 'h:mm:ss.00'), '12:00:36.75'); assert.equal(F(v, 'h:mm:ss.000'), '12:00:36.750');
  assert.equal(F(v, '[ss].00'), '43236.75'); assert.equal(F(v, 'mm:ss.0'), '00:36.8'); assert.equal(F(1.25 + 3.5 / 86400, '[h]:mm:ss.00'), '30:00:03.50');
  assert.equal(F(0.0432384259, '[ss].00'), '3735.80');   // Microsoft's elapsed-time example
  for (const ok of ['ss.00', 'h:mm:ss.00', '[ss].00', 'mm:ss.0']) assert.equal(isValidFormat(ok), true, ok);
  assert.equal(isValidFormat('0.0 mm'), false);   // digits elsewhere in a date section stay refused
  const ev = f => evalFormula(f, { raw: () => null, rows: 100, cols: 26 });
  assert.equal(ev('=TEXT(45000.5,"h:mm:ss.00")'), '12:00:00.00');
  const S = new Sheet({ cells: { A1: { value: v } } }); S.goTo(1, 1); assert.equal(S.setCustomFormat('h:mm:ss.00'), true); assert.equal(S.text('A1'), '12:00:36.75');
});

test('F8 TEXT() reads the bare letters Excel prints as themselves (x, k, bps); date and era letters still need quotes; the box still quotes', () => {
  const ev = f => evalFormula(f, { raw: () => null, rows: 100, cols: 26 });
  assert.equal(ev('=TEXT(2.5,"0.0x")'), '2.5x'); assert.equal(ev('=TEXT(1234567,"#,##0,k")'), '1,235k'); assert.equal(ev('=TEXT(2.5,"0.0 x")'), '2.5 x');
  assert.equal(ev('=TEXT(5,"0 kg")'), '#VALUE!'); assert.equal(ev('=TEXT(25,"0 bps")'), '#VALUE!');   // g is an era code, b the Buddhist year: Excel refuses them beside digits
  assert.equal(F(2.456, '0.0x'), '2.5x'); assert.equal(isValidFormat('0.0X'), false); assert.equal(isValidFormat('0 n'), false);
  assert.equal(fmtNum(2.456, 'custom', 0, 0, '0.0x'), '2.5x');   // a code stored unquoted by content data renders
  assert.equal(normalizeCode('0.0x'), '0.0"x"'); assert.equal(normalizeCode('#,##0,k'), '#,##0,"k"');   // the Custom box keeps quoting, as Excel's does
});

test('F9 + F30 the accounting family: the dash section carries one ? per decimal, never .0; builtinCode writes Excel\'s 42 / 44', () => {
  const id42 = '_($* #,##0_);_($* (#,##0);_($* "-"_);_(@_)', id44 = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)';
  const id43 = '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';
  assert.equal(stepDecimals(id44, 1), '_($* #,##0.000_);_($* (#,##0.000);_($* "-"???_);_(@_)');
  assert.equal(stepDecimals(id44, -1), '_($* #,##0.0_);_($* (#,##0.0);_($* "-"?_);_(@_)');
  assert.equal(stepDecimals(id42, 1), '_($* #,##0.0_);_($* (#,##0.0);_($* "-"?_);_(@_)');
  assert.equal(stepDecimals(id43, 1), '_(* #,##0.000_);_(* (#,##0.000);_(* "-"???_);_(@_)');
  assert.equal(stepDecimals(stepDecimals(id42, 1), 1), id44); assert.equal(stepDecimals(stepDecimals(id44, -1), -1), id42);   // the 0 → 1 → 2 round trip
  assert.equal(stepDecimals('#.', 1), '#.0'); assert.equal(stepDecimals('0.', 1), '0.0'); assert.equal(stepDecimals('#.', -1), '#');
  for (const code of [id42, stepDecimals(id42, 1), id44, stepDecimals(id44, 1)]) assert.equal(F(0, code).includes('.'), false, code);
  assert.equal(builtinCode('acct', 0), id42); assert.equal(builtinCode('acct', 1), '_($* #,##0.0_);_($* (#,##0.0);_($* "-"?_);_(@_)'); assert.equal(builtinCode('acct', 2), id44);
  assert.equal(F(0, builtinCode('acct', 0)), ' $- '); assert.equal(F(1234, builtinCode('acct', 0)), ' $1,234 ');
  const s = new Session(new Sheet({ cells: { A1: { value: 0, fmtStyle: 'acct', decimals: 0 }, A2: { value: 1234.5, fmtStyle: 'acct', decimals: 0 } } }), { now: () => 0 });
  s.sheet.select('A1:A2'); s.run('Ctrl+1 U'); assert.equal(s.dlg.code, id42); s.run('Enter Alt H 0');   // OK the box unchanged, then Increase Decimal
  assert.equal(s.sheet.cellAt('A1').numFmt, '_($* #,##0.0_);_($* (#,##0.0);_($* "-"?_);_(@_)'); assert.equal(s.sheet.text('A1'), ' $-  '); assert.equal(s.sheet.text('A2'), ' $1,234.5 ');
});

test('F10 fractions: # ?/?, # ???/???, ?/?, fixed denominators; the whole number alone when the fraction is empty', () => {
  assert.equal(F(4.34, '# ?/?'), '4 1/3'); assert.equal(F(0.5, '# ?/?'), ' 1/2'); assert.equal(F(1.25, '# ?/?'), '1 1/4'); assert.equal(F(1234.5, '# ?/?'), '1234 1/2');
  assert.equal(F(5.25, '# ???/???'), '5   1/4  '); assert.equal(F(2.5, '# ??/??'), '2  1/2 '); assert.equal(F(1234.5, '#,##0 ?/?'), '1,234 1/2');
  assert.equal(F(0.5, '# ?/4'), ' 2/4'); assert.equal(F(0.5, '0/8'), '4/8'); assert.equal(F(3.375, '# ?/8'), '3 3/8'); assert.equal(F(0.0625, '# ?/16'), ' 1/16');
  assert.equal(F(1.5, '?/?'), '3/2'); assert.equal(F(0.75, '?/?'), '3/4'); assert.equal(F(5, '?/?'), '5/1');
  assert.equal(F(0, '# ?/?'), '0    '); assert.equal(F(5.001, '# ?/?'), '5    '); assert.equal(F(2.999, '# ?/?'), '3    ');   // an empty fraction: the whole number, the slot blank
  assert.equal(F(-4.34, '# ?/?'), '-4 1/3'); assert.equal(F(-4.34, '# ?/?;(# ?/?)'), '(4 1/3)');
  assert.equal(stepDecimals('# ?/?', 1), '# ?/?'); assert.equal(codeDecimals('# ?/?'), 0); assert.equal(isValidFormat('0.0 ?/?'), false);
  assert.equal(F(46053, 'm/d/yyyy'), '1/31/2026');   // a date's slash is still a separator
  const ev = f => evalFormula(f, { raw: () => null, rows: 100, cols: 26 });
  assert.equal(ev('=TEXT(4.34,"# ?/?")'), '4 1/3'); assert.equal(ev('=TRIM(TEXT(0.34,"# ?/?"))'), '1/3');   // Microsoft's TEXT examples
});

test('F11 engineering notation: with # or ? among the integer placeholders the exponent steps by their count', () => {
  assert.equal(F(1500500, '#0.0E+0'), '1.5E+6'); assert.equal(F(12200000, '#0.0E+0'), '12.2E+6'); assert.equal(F(1220000, '#0.0E+0'), '1.2E+6');
  assert.equal(F(1234.5678, '##0.0E+0'), '1.2E+3'); assert.equal(F(12345, '##0.0E+0'), '12.3E+3'); assert.equal(F(123456, '##0.0E+0'), '123.5E+3'); assert.equal(F(1234567, '##0.0E+0'), '1.2E+6');
  assert.equal(F(0.001234, '##0.0E+0'), '1.2E-3'); assert.equal(F(0.00012, '##0.0E+0'), '120.0E-6'); assert.equal(F(5, '##0.0E+0'), '5.0E+0'); assert.equal(F(999.96, '##0.0E+0'), '1.0E+3');
  assert.equal(F(1234.5, '00.0E+0'), '12.3E+2'); assert.equal(F(1234.5678, '0.00E+00'), '1.23E+03'); assert.equal(F(0, '##0.0E+0'), '0.0E+0');   // only 0 placeholders force digits
});

test('F12 a trailing @ section of a two- or three-section code is the text section: negatives keep their sign', () => {
  assert.equal(F(-5, '0;@'), '-5'); assert.equal(F(5, '0;@'), '5'); assert.equal(F(-5, '0;(0);@'), '(5)'); assert.equal(F(0, '0;(0);@'), '0');
  assert.equal(F('n/a', '0;"txt: "@'), 'txt: n/a'); assert.equal(F('hi', '0;(0);@'), 'hi'); assert.equal(F(46053, '[$-409]d-mmm-yy;@'), '31-Jan-26');
  assert.throws(() => formatValue(-1, '[$-409]d-mmm-yy;@'), FormatError); assert.throws(() => formatValue(-0.5, 'h:mm;@'), FormatError);   // a negative date fills the cell
  assert.equal(fmtNum(-1, 'custom', 0, 0, '[$-409]d-mmm-yy;@'), '########'); assert.equal(fmtNum(-5, 'custom', 0, 0, '0;@'), '-5');
  const ev = f => evalFormula(f, { raw: () => null, rows: 100, cols: 26 });
  assert.equal(ev('=TEXT(-5,"0;@")'), '-5'); assert.equal(ev('=TEXT(-1,"[$-409]d-mmm-yy;@")'), '#VALUE!');
});

test('F13 m after h or before ss is minutes across any separator: h.mm, mm.ss, h,mm', () => {
  const t = 0.5 + 5 / 1440 + 7 / 86400;
  assert.equal(F(t, 'h.mm'), '12.05'); assert.equal(F(t, 'hh.mm.ss'), '12.05.07'); assert.equal(F(t, 'mm.ss'), '05.07'); assert.equal(F(t, 'h,mm'), '12,05'); assert.equal(F(t, '[h].mm'), '12.05');
  assert.equal(F(46235 + t, 'dd.mm.yyyy hh.mm'), '01.08.2026 12.05');   // the date's mm stays the month
});

test('F14 a date the code cannot show fills with #: negatives, past 31 Dec 9999 (2958465); TEXT() is #VALUE!, never NaN or a crash', () => {
  assert.equal(F(2958465, 'd mmm yyyy'), '31 Dec 9999');
  for (const v of [-1, 2958466, 3000000, 1e8, 1e9]) for (const code of ['d mmm yyyy', 'yyyy', 'mmm', 'ddd', 'mmm-yy']) assert.throws(() => formatValue(v, code), FormatError, `${v} ${code}`);
  assert.equal(fmtNum(-1, 'custom', 0, 0, 'mmm-yy'), '########'); assert.equal(fmtNum(-0.5, 'custom', 0, 0, '[h]:mm'), '########'); assert.equal(fmtNum(2958466, 'custom', 0, 0, 'd/m/yyyy'), '########');
  assert.equal(fmtNum(1e9, 'custom', 0, 0, 'yyyy'), '########'); assert.equal(fmtNum(2958465, 'custom', 0, 0, 'd/m/yyyy'), '31/12/9999'); assert.equal(dispText({ value: -5, fmtStyle: 'custom', numFmt: 'mmm-yy' }), '########');
  assert.equal(fmtNum(-1, 'date'), '########'); assert.equal(fmtNum(1e9, 'date'), '########'); assert.equal(fmtNum(46053, 'date'), 'Jan-26');   // the Chapter 1 date style too
  assert.equal(fmtNum(1234.5, 'custom', 0, 0, '0 kg'), '1234.5');   // a code that will not compile still reads as General
  const ev = f => evalFormula(f, { raw: () => null, rows: 100, cols: 26 });
  assert.equal(ev('=TEXT(1E9,"mmm")'), '#VALUE!'); assert.equal(ev('=TEXT(1E9,"yyyy")'), '#VALUE!'); assert.equal(ev('=TEXT(2958466,"d/m/yyyy")'), '#VALUE!'); assert.equal(ev('=ISTEXT(TEXT(1E9,"yyyy"))'), false);
});

test('F15 number formats never apply to error values: ;;; does not hide #DIV/0!, @ does not dress it, [Red] does not colour it', () => {
  assert.equal(dispText({ value: '#DIV/0!', fmtStyle: 'custom', numFmt: ';;;' }), '#DIV/0!'); assert.equal(dispText({ value: '#DIV/0!', fmtStyle: 'custom', numFmt: '@" units"' }), '#DIV/0!');
  assert.equal(dispText({ value: '#DIV/0!', fmtStyle: 'custom', numFmt: '0;(0);"-";"t: "@' }), '#DIV/0!'); assert.equal(dispColor({ value: '#N/A', fmtStyle: 'custom', numFmt: '[Red]@' }), null);
  const S = new Sheet({ cells: { A1: { formula: '=1/0', fmtStyle: 'custom', numFmt: ';;;' }, A2: { value: 0.25, fmtStyle: 'custom', numFmt: ';;;' } } });
  assert.equal(S.text('A1'), '#DIV/0!'); assert.equal(S.text('A2'), '');   // ;;; still hides a number
});

test('F17 the compile cache is bounded for bad codes too', () => {
  let first; try { compileFormat('0 kg probe'); } catch (e) { first = e; }
  for (let i = 0; i < 2000; i++) isValidFormat('0 kg' + i);
  let again; try { compileFormat('0 kg probe'); } catch (e) { again = e; }
  assert.ok(first instanceof FormatError && again instanceof FormatError); assert.notEqual(first, again);   // evicted and re-parsed, not kept forever
});

test('F26 a section that is only a colour or a condition is General in that colour; a genuinely empty section still hides', () => {
  assert.deepEqual(formatValue(5, '[Red]'), { text: '5', color: 'red' }); assert.deepEqual(formatValue(-5, '[Red]'), { text: '-5', color: 'red' }); assert.deepEqual(formatValue(1234.5, '[Blue]'), { text: '1234.5', color: 'blue' });
  assert.deepEqual(formatValue(-5, '0;[Red]'), { text: '5', color: 'red' }); assert.equal(F(0, '0;0;[Red]'), '0'); assert.equal(isValidFormat('[>10]'), true);
  assert.equal(F(0, '0;0;'), ''); assert.equal(F(0, '#,##0;(#,##0);'), ''); assert.equal(F(123, ';;;'), '');
  const ev = f => evalFormula(f, { raw: () => null, rows: 100, cols: 26 });
  assert.equal(ev('=TEXT(5,"[Red]")'), '5'); assert.equal(dispText({ value: 5, fmtStyle: 'custom', numFmt: '[Red]' }), '5');
});

test('F27 + F42 digits come from Excel\'s 15 significant digits, then zeros; a number too large for its code is a FormatError, never a RangeError', () => {
  assert.equal(F(1 / 3, '0.' + '0'.repeat(17)), '0.33333333333333300'); assert.equal(F(0.1 + 0.2, '0.' + '0'.repeat(17)), '0.30000000000000000'); assert.equal(F(0.1, '0.' + '0'.repeat(22)), '0.1000000000000000000000');
  assert.equal(F(1234.5678, '0.' + '0'.repeat(18)), '1234.567800000000000000'); assert.equal(F(123456.789, '#,##0.000000000000'), '123,456.789000000000');
  assert.equal(F(2 ** 60, '#,##0'), '1,152,921,504,606,850,000'); assert.equal(F(123456789012345678901, '0'), '123456789012346000000'); assert.equal(F(1e23, '0'), '100000000000000000000000');
  assert.equal(F(1e300, '0'), '1' + '0'.repeat(300)); assert.equal(F(1e300, '0.000000000'), '1' + '0'.repeat(300) + '.000000000'); assert.equal(F(1e15, '#,##0'), '1,000,000,000,000,000');
  for (const [v, code] of [[1e307, '0%'], [2e306, '0%'], [0, '0' + '%'.repeat(160)], [5, '0' + '%'.repeat(160)], [-1e307, '0%']]) assert.throws(() => formatValue(v, code), FormatError, code);
  assert.equal(F(1e307, '0.00E+00'), '1.00E+307'); assert.equal(fmtNum(1e307, 'custom', 0, 0, '0%'), '########');
  const ev = f => evalFormula(f, { raw: () => null, rows: 100, cols: 26 });
  assert.equal(ev('=TEXT(1E+307,"0%")'), '#VALUE!'); assert.equal(ev('=IFERROR(TEXT(1E+307,"0%"),"x")'), 'x'); assert.equal(ev('=TEXT(2^60,"#,##0")'), '1,152,921,504,606,850,000');
});

test('F28 [Color n] is 1–56 and every index paints: a swatch key where the grid has the colour, else the palette hex', () => {
  for (const code of ['[Color 0]0', '[Color 57]0', '[Color 99]0']) assert.equal(isValidFormat(code), false, code);
  for (let i = 1; i <= 56; i++) assert.ok(formatValue(5, `[Color ${i}]0`).color, `[Color ${i}]`);
  assert.equal(formatValue(5, '[Color 3]0').color, 'red'); assert.equal(formatValue(5, '[Color 9]0').color, '#800000'); assert.equal(formatValue(5, '[Color 11]0').color, '#000080'); assert.equal(formatValue(5, '[COLOR 10]0').color, 'green');
  assert.equal(dispColor({ value: 5, fmtStyle: 'custom', numFmt: '[Color 9]0' }), '#800000');
  const s = new Session(new Sheet({ cells: { A1: { value: 5 } } }), { now: () => 0 }); s.run('Ctrl+1 U "[Color 57]0" Enter'); assert.equal(s.dialog, 'numfmt'); assert.equal(s.note, NUMFMT_BAD_NOTE);
});

test('F29 the section grammar Excel refuses: lone conditions, conditions past the second section, @ beside digits or General, two colours or conditions', () => {
  for (const code of ['[>10]0', '[Red][>10]0', '[>10]0;[>5]0;[>0]0', '0;0;[>5]0', 'General@', '0@', '@0', '[Red][Blue]0', '[>0][>1]0', '[<0]"neg"']) assert.equal(isValidFormat(code), false, code);
  for (const code of ['[>10]General', '[Red][>10]General', '[>=1000000]#,##0.0,,"m";[>=1000]#,##0,"k";#,##0', '[<0]"neg";[>10]"big"', '[Red]"ERROR";[Red]"ERROR";"OK"', '0;[<0]0']) assert.equal(isValidFormat(code), true, code);
  const s = new Session(new Sheet({ cells: { A1: { value: 5 } } }), { now: () => 0 }); s.run('Ctrl+1 U "General@" Enter'); assert.equal(s.dialog, 'numfmt'); assert.equal(s.note, NUMFMT_BAD_NOTE);
});

test('F31 codeDecimals stops at the exponent: 0.00E+00 shows two decimals', () => {
  assert.equal(codeDecimals('0.00E+00'), 2); assert.equal(codeDecimals('0.0E+00'), 1); assert.equal(codeDecimals('##0.0E+0'), 1); assert.equal(codeDecimals('0E+00'), 0); assert.equal(codeDecimals('0.000E+00'), 3);
  const S = new Sheet({ cells: { A1: { value: 1234.5 } } }); S.goTo(1, 1); S.setCustomFormat('0.00E+00'); assert.equal(S.cellAt('A1').decimals, 2); S.changeDecimals(1); assert.equal(S.cellAt('A1').decimals, 3); assert.equal(S.text('A1'), '1.235E+03');
});

test('F32 + F36 times round to the finest unit shown, the carry rolls into the date, h and m truncate; [hh] [mm] [ss] keep their width', () => {
  assert.equal(F(0.5208333, 'h:mm:ss'), '12:30:00'); assert.equal(F(0.5208333, 'h:mm'), '12:30'); assert.equal(F(0.5208333, 'hh:mm:ss AM/PM'), '12:30:00 PM');
  assert.equal(F(0.9999999, 'h:mm:ss'), '0:00:00'); assert.equal(F(0.9999999, '[h]:mm:ss'), '24:00:00'); assert.equal(F(0.9999999, 'h:mm'), '0:00');
  assert.equal(F(45000.999999999, 'm/d/yyyy h:mm:ss'), '3/16/2023 0:00:00'); assert.equal(F(45000.999999999, 'hh:mm:ss AM/PM'), '12:00:00 AM'); assert.equal(F(45000.999999999, 'h AM/PM'), '12 AM');
  assert.equal(F(1 / 7, 'h:mm:ss'), '3:25:43'); assert.equal(F(0.08333, 'h'), '2'); assert.equal(F(0.5 + 59 / 86400, 'h:mm'), '12:00'); assert.equal(F(0.5 + 59.6 / 86400, 'h:mm'), '12:01');   // Excel's own corpus: ss rounds, h:mm carries the rounded second and truncates the rest
  assert.equal(F(0.52083, 'ss.000'), '59.712'); assert.equal(F(0.50035, 'ss.0'), '30.2'); assert.equal(F(0.52083, '[m]'), '750');
  assert.equal(F(5 / 24, '[hh]:mm'), '05:00'); assert.equal(F(5 / 24, '[h]:mm'), '5:00'); assert.equal(F(0.0625, '[hh]:mm:ss'), '01:30:00'); assert.equal(F(7 / 1440, '[mm]:ss'), '07:00'); assert.equal(F(0.5, '[mm]:ss'), '720:00');
  assert.equal(F(9 / 86400, '[ss]'), '09'); assert.equal(F(5 / 24, '[ss]'), '18000'); assert.equal(F(0, '[hh]:mm'), '00:00');
});

test('F33 the weekday follows the serial: 1-Jan-1900 is a Sunday in Excel', () => {
  const ev = f => evalFormula(f, { raw: () => null, rows: 100, cols: 26 });
  assert.equal(F(1, 'dddd'), 'Sunday'); assert.equal(F(59, 'dddd'), 'Tuesday'); assert.equal(F(0, 'dddd'), 'Saturday'); assert.equal(F(60, 'dddd'), 'Wednesday'); assert.equal(F(61, 'ddd'), 'Thu'); assert.equal(F(45000, 'dddd'), 'Wednesday');
  assert.equal(ev('=WEEKDAY(1)'), 1); assert.equal(ev('=WEEKDAY(59)'), 3); assert.equal(ev('=WEEKDAY(60)'), 4); assert.equal(ev('=WEEKDAY(61)'), 5); assert.equal(ev('=WEEKDAY(45000)'), 4); assert.equal(ev('=TEXT(DATE(1900,1,1),"dddd")'), 'Sunday');
});

test('F35 e, b and g are date codes (the year, the Buddhist year, the era), never quoted by the box', () => {
  assert.equal(F(JAN31, 'd-mmm-e'), '31-Jan-2026'); assert.equal(F(JAN31, 'd-mmm-ee'), '31-Jan-2026'); assert.equal(F(JAN31, 'bbbb'), '2569'); assert.equal(F(JAN31, 'bb'), '69'); assert.equal(F(JAN31, 'ggg'), ''); assert.equal(F(JAN31, 'ggge"年"m"月"d"日"'), '2026年1月31日');
  assert.equal(normalizeCode('d-mmm-e'), 'd-mmm-e'); assert.equal(normalizeCode('bbbb'), 'bbbb'); assert.equal(normalizeCode('0 kg'), '0 "kg"');
  const S = new Sheet({ cells: { A1: { value: JAN31 } } }); S.goTo(1, 1); S.setCustomFormat('d-mmm-e'); assert.equal(S.cellAt('A1').numFmt, 'd-mmm-e'); assert.equal(S.text('A1'), '31-Jan-2026');
});

test('F37 the box stores a code as typed: a trailing space is a literal, a fill keeps its character', () => {
  assert.equal(normalizeCode('0.0 '), '0.0 '); assert.equal(normalizeCode(' 0'), ' 0'); assert.equal(normalizeCode('0* '), '0* '); assert.equal(normalizeCode('   '), null); assert.equal(normalizeCode(''), null);
  const S = new Sheet({ cells: { A1: { value: 5 } } }); S.goTo(1, 1); S.setCustomFormat('0.0 '); assert.equal(S.cellAt('A1').numFmt, '0.0 '); assert.equal(S.text('A1'), '5.0 ');
  S.setCustomFormat(' General '); assert.equal(S.cellAt('A1').fmtStyle, 'general');   // General stays the built-in style
});

test('F38 the grid\'s General agrees with & and TEXT(…,"General") on the E+nn form', () => {
  assert.equal(fmtNum(1e21, 'general'), '1E+21'); assert.equal(fmtNum(1e-7, 'general'), '1E-07'); assert.equal(fmtNum(0.00001, 'general'), '1E-05'); assert.equal(fmtNum(0.0001, 'general'), '0.0001'); assert.equal(fmtNum(-1e-7, 'general'), '-1E-07');
  assert.equal(fmtNum(999999999999999, 'general'), '1E+15'); assert.equal(fmtNum(1 / 3, 'general'), '0.3333333333'); assert.equal(fmtNum(1234.5, 'general'), '1234.5'); assert.equal(fmtNum(0.1 + 0.2, 'general'), '0.3');
});

test('F40 only a section whose condition catches negatives supplies the sign: [<>0] keeps the minus', () => {
  assert.equal(F(-1234.5, '[<>0]0;"zero"'), '-1235'); assert.equal(F(-5, '[<>0]0;"zero"'), '-5'); assert.equal(F(0, '[<>0]0;"zero"'), 'zero'); assert.equal(F(-5, '[<>0]0.00;"-"'), '-5.00');
  assert.equal(F(-1234.5, '[<0]0;0'), '1235'); assert.equal(F(-1234.5, '[<=0]0;0'), '1235'); assert.equal(F(-1234.5, '[<-100]0;0'), '1235'); assert.equal(F(-1234.5, '[<5]0;0'), '-1235'); assert.equal(F(-1234.5, '[>-5000]0;0'), '-1235');
});

test('F41 a custom-dressed text value measures as its painted text, so it spills and autofits', () => {
  const S = new Sheet({ cells: { A1: { value: 'n/a', fmtStyle: 'custom', numFmt: '"Site name: "@' }, A2: { value: 'Site name: n/a' } } });
  assert.equal(cellTxtPx(S.cellAt('A1')), cellTxtPx(S.cellAt('A2'))); assert.ok(cellTxtPx(S.cellAt('A1')) > 100);
  S.select('A1'); S.autofitCols(); assert.equal(S.colW[1], S.neededWidth(1)); assert.ok(S.colW[1] > 100);
});
