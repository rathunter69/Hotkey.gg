// app2/engine/format.js — number formatting for display. Pure. Lifted from index.html
// fmtNum/dispText (r23328–23356) with the same house conventions: comma/currency styles wrap
// negatives in parentheses, accounting sets the $ off from the figure and prints zero as a dash,
// General never shows binary float noise. A cell with fmtStyle 'custom' carries an Excel format
// code in numFmt (Chapter 2) and renders through numfmt.js — the same engine TEXT() uses.

import { formatValue, compileFormat, numToText, FormatError } from './numfmt.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const loc = (n, dec, group = true) => n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: group });
/** What a date or time format shows for a value it cannot show (a negative or past 31 Dec 9999): Excel fills the cell with #. */
export const HASHES = '########';
const ERRORS = new Set(['#NULL!', '#DIV/0!', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#N/A']);   // formula.js's ERROR_CODES (no import: formula.js imports this module)
const isErr = v => typeof v === 'string' && ERRORS.has(v);

/** Excel serial (days since 1899-12-30) → UTC Date. */
export function serialToDate(serial) { return new Date(Date.UTC(1899, 11, 30) + Number(serial) * 86400000); }
/** UTC Date (or y,m,d) → Excel serial. */
export function dateToSerial(y, m, d) { return Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000); }

/**
 * A custom code's rendering of a value, or null when the code will not compile (a bad code reads
 * as General). A code that compiles but cannot show the value — a date out of range, a number too
 * large — fills with #, as Excel's cell does.
 */
function custom(v, code) {
  if (!code) return null;
  try { compileFormat(code); } catch (e) { return null; }
  try { return formatValue(v, code); } catch (e) { return e instanceof FormatError ? { text: HASHES, color: null } : null; }
}

/**
 * Format a number for a cell.
 * @param {number} n
 * @param {'general'|'comma'|'currency'|'acct'|'percent'|'mult'|'date'|'custom'} [style]
 * @param {number} [dec] decimals
 * @param {number} [scale] display-only divisor exponent (3 = thousands, 6 = millions)
 * @param {string} [numFmt] the format code when style is 'custom'
 */
export function fmtNum(n, style, dec, scale, numFmt) {
  n = Number(n);
  if (!isFinite(n)) return '#NUM!';
  if (style === 'custom') { const r = custom(n, numFmt); if (r) return r.text; style = 'general'; }
  if (scale) n = n / Math.pow(10, scale);
  dec = (typeof dec === 'number' && dec >= 0) ? dec : 0;
  if (style === 'comma') { const a = loc(Math.abs(n), dec); return n < 0 ? '(' + a + ')' : a; }
  if (style === 'currency') { const a = '$' + loc(Math.abs(n), dec); return n < 0 ? '(' + a + ')' : a; }
  if (style === 'acct') {
    if (n === 0) return '$   -  ';
    const a = loc(Math.abs(n), dec);
    return n < 0 ? '$ (' + a + ')' : '$ ' + a;
  }
  if (style === 'percent') return loc(n * 100, dec, false) + '%';   // Excel's Percent style is "0%": no thousands separator
  if (style === 'mult') return loc(n, dec, false) + 'x';
  if (style === 'date') { if (n < 0 || n >= 2958466) return HASHES; const d = serialToDate(n); return MONTHS[d.getUTCMonth()] + '-' + String(d.getUTCFullYear()).slice(2); }
  // General: 10 significant digits in the cell, in the E+nn form & and TEXT(…,"General") use past 1E+15 and below 1E-04
  if (dec > 0 && Math.abs(n) % 1 !== 0) return Number(n).toFixed(dec);
  return numToText(parseFloat(Number(n).toPrecision(10)));
}

/** Display text for a cell object ({value, fmtStyle, decimals, scale, numFmt}). Booleans print TRUE/FALSE. */
export function dispText(cell) {
  if (!cell || cell.value === null || cell.value === undefined || cell.value === '') return '';
  if (typeof cell.value === 'number') return fmtNum(cell.value, cell.fmtStyle, cell.decimals, cell.scale, cell.numFmt);
  if (typeof cell.value === 'boolean') return cell.value ? 'TRUE' : 'FALSE';
  if (cell.fmtStyle === 'custom' && cell.numFmt && !isErr(cell.value)) { const r = custom(cell.value, cell.numFmt); if (r) return r.text; }   // a text section (@) dresses text — never an error value
  return String(cell.value);
}

/** The font colour a custom code's section imposes ([Red] on the negative section) — a FONT_SWATCHES key or a #hex, or null (an error value takes no section's colour). */
export function dispColor(cell) {
  if (!cell || cell.fmtStyle !== 'custom' || !cell.numFmt || cell.value === null || cell.value === undefined || cell.value === '' || isErr(cell.value)) return null;
  const r = custom(cell.value, cell.numFmt);
  return r ? r.color : null;
}
