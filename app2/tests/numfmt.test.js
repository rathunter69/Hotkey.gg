// app2/tests/numfmt.test.js — custom number formats (Chapter 2): one engine renders the grid's
// cells, the Custom box and TEXT(). Every expectation is what Excel shows for the same code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatValue, compileFormat, isValidFormat, normalizeCode, builtinCode, stepDecimals, codeDecimals, FormatError } from '../engine/numfmt.js';
import { fmtNum, dispText, dispColor } from '../engine/format.js';
import { evalFormula } from '../engine/formula.js';
import { Sheet } from '../engine/sheet.js';
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
  assert.equal(stepDecimals(HOUSE_FORMATS.plain, 1), '#,##0.0_);(#,##0.0);"-"_)');
  assert.equal(stepDecimals('#,##0.0_);(#,##0.0);"-"_)', -1), HOUSE_FORMATS.plain);
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
  S.changeDecimals(1); assert.equal(S.cellAt('A1').numFmt, '#,##0.0_);(#,##0.0);"-"_)'); assert.equal(S.cellAt('A1').decimals, 1); assert.equal(S.text('A1'), '1,234.5 ');
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
