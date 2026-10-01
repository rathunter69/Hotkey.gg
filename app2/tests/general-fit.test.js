// M107: a General number fits its column as desktop Excel shows it (fewer decimals, then E
// notation); #### is only for formatted numbers and dates. And M64's _x pad: the grid paints it
// as an invisible x, so (1,234) and 1,234 line up on the bracket.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitGeneral, dispMarked, dispText, PAD_MARK } from '../engine/format.js';
import { formatValue, formatMarked } from '../engine/numfmt.js';
import { Sheet, cellShown, COLW_DEFAULT } from '../engine/sheet.js';
import { padHtml } from '../ui/sheet-view.js';

test('fitGeneral: the full General text when it fits', () => {
  assert.equal(fitGeneral(1234, 6), '1234');
  assert.equal(fitGeneral(-12.5, 5), '-12.5');
  assert.equal(fitGeneral(0, 1), '0');
});

test('fitGeneral: decimals drop until the number fits, rounding half away from zero', () => {
  assert.equal(fitGeneral(1234567.891, 7), '1234568');
  assert.equal(fitGeneral(1234567.891, 9), '1234567.9');
  assert.equal(fitGeneral(3.14159265, 4), '3.14');
  assert.equal(fitGeneral(2.5, 1), '3');
  assert.equal(fitGeneral(-2.5, 2), '-3');
  assert.equal(fitGeneral(99.96, 4), '100');
  assert.equal(fitGeneral(0.123456789, 6), '0.1235');
  assert.equal(fitGeneral(1.50001, 4), '1.5');   // trailing zeros never pad General
});

test('fitGeneral: an integer part too long for the column goes to E notation, then null', () => {
  assert.equal(fitGeneral(123456789012, 8), '1.23E+11');
  assert.equal(fitGeneral(123456789, 7), '1.2E+08');
  assert.equal(fitGeneral(123456789, 6), '1E+08');
  assert.equal(fitGeneral(123456789, 5), '1E+08');
  assert.equal(fitGeneral(-123456789, 6), '-1E+08');
  assert.equal(fitGeneral(0.00001234, 7), '1.2E-05');
  assert.equal(fitGeneral(123456789, 4), null);
});

test('a General cell never shows #### while a form fits; a formatted one does', () => {
  const narrow = 40;
  assert.deepEqual(cellShown({ value: 1234567.891, fmtStyle: 'general' }, 80), { text: '1234568', over: false });   // seven digits wide
  assert.deepEqual(cellShown({ value: 1234567.891, fmtStyle: 'general' }, COLW_DEFAULT), { text: '1E+06', over: false });   // six: the integer part no longer fits
  assert.equal(cellShown({ value: 1234567.891, fmtStyle: 'comma', decimals: 2 }, COLW_DEFAULT).over, true);
  assert.equal(cellShown({ value: 45000, fmtStyle: 'custom', numFmt: 'mmmm d, yyyy' }, narrow).over, true);
  assert.equal(cellShown({ value: 123456789012345, fmtStyle: 'general' }, 60).text, '1E+14');
  assert.equal(cellShown({ value: 123456789012345, fmtStyle: 'general' }, narrow).over, true);   // three digits: not even 1E+14 fits
  const s = new Sheet({ cells: { A1: { value: 1234567.891 }, B1: { value: 1234567.891, fmtStyle: 'comma', decimals: 2 } } });
  assert.equal(s.overflowsCol(1), false);
  assert.equal(s.overflowsCol(2), true);
  assert.equal(s.shown(1, 1).text, '1E+06');
  assert.equal(s.text('A1'), '1234567.891');   // the value's own text is unchanged: only the painted cell shrinks
});

test('the _x pad is marked for the painter and a space for everything else', () => {
  assert.equal(formatValue(1234, '#,##0_);(#,##0)').text, '1,234 ');
  assert.equal(formatMarked(1234, '#,##0_);(#,##0)').text, '1,234' + PAD_MARK + ')');
  assert.equal(formatMarked(-1234, '#,##0_);(#,##0)').text, '(1,234)');
  assert.equal(formatMarked(0, '_($* #,##0_);_($* (#,##0);_($* "-"_);_(@_)').text, PAD_MARK + '($-' + PAD_MARK + ')');   // the * fill is dropped
  // the built-in Comma and Currency styles carry the same pad after a positive figure
  assert.equal(dispMarked({ value: 1234, fmtStyle: 'comma', decimals: 0 }), '1,234' + PAD_MARK + ')');
  assert.equal(dispMarked({ value: -1234, fmtStyle: 'comma', decimals: 0 }), '(1,234)');
  assert.equal(dispText({ value: 1234, fmtStyle: 'comma', decimals: 0 }), '1,234');
  assert.equal(padHtml('1,234' + PAD_MARK + ')'), '1,234<span class="padx" aria-hidden="true">)</span>');
  assert.equal(padHtml('x' + PAD_MARK + '&nbsp;'), 'x<span class="padx" aria-hidden="true">&nbsp;</span>');
});
