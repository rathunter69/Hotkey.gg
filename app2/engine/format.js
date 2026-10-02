// app2/engine/format.js — number formatting for display. Pure. Lifted from index.html
// fmtNum/dispText (r23328–23356) with the same house conventions: comma/currency styles wrap
// negatives in parentheses, accounting sets the $ off from the figure and prints zero as a dash,
// General never shows binary float noise. A cell with fmtStyle 'custom' carries an Excel format
// code in numFmt (Chapter 2) and renders through numfmt.js — the same engine TEXT() uses.

import { formatValue, formatMarked, compileFormat, numToText, FormatError, PAD_MARK } from './numfmt.js';
export { PAD_MARK };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const loc = (n, dec, group = true) => n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: group });
/** What a date or time format shows for a value it cannot show (a negative or past 31 Dec 9999): Excel fills the cell with #. */
export const HASHES = '########';
const ERRORS = new Set(['#NULL!', '#DIV/0!', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#N/A', '#SPILL!', '#CALC!']);   // formula.js's ERROR_CODES (no import: formula.js imports this module)
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

/**
 * The cell's display text with every _x pad marked (PAD_MARK + x) for the grid, which paints the
 * gap at x's width: a custom code's pads, and the closing-bracket pad the built-in Comma and
 * Currency styles (#,##0_);(#,##0)) put after a positive figure or zero so it lines up with (1,234).
 * Everything else is dispText's.
 */
export function dispMarked(cell) {
  if (!cell || typeof cell.value !== 'number') return dispText(cell);
  if (cell.fmtStyle === 'custom' && cell.numFmt) {
    try { compileFormat(cell.numFmt); } catch (e) { return dispText(cell); }
    try { return formatMarked(cell.value, cell.numFmt).text; } catch (e) { return dispText(cell); }
  }
  const t = dispText(cell);
  if ((cell.fmtStyle === 'comma' || cell.fmtStyle === 'currency' || cell.fmtStyle === 'acct') && !t.endsWith(')') && t !== HASHES && isFinite(cell.value)) return t.replace(/ +$/, '') + PAD_MARK + ')';
  return t;
}

/** Excel rounds half away from zero on the decimal digits it shows. */
function roundAway(n, d) {
  const [m, e] = Math.abs(n).toPrecision(15).split('e');
  const x = Math.round(Number(m + 'e' + ((e ? +e : 0) + d)));
  return Math.sign(n) * Number(x + 'e-' + d);
}
/** Trailing zeros of a fixed-point string dropped, and a bare point with them. */
const trimZeros = s => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);

/**
 * What a General-format number shows in a column `maxChars` digits wide (M107). Excel never
 * fills a General cell with # while it can show the figure: it drops decimals until the number
 * fits (1234567.891 in a default column is 1234568), and an integer part too long for the column
 * goes to scientific notation with as many mantissa digits as fit (123456789012 is 1.23E+11).
 * Only a column too narrow for even the shortest scientific form gets #. Returns the text, or
 * null when nothing fits.
 */
export function fitGeneral(n, maxChars) {
  n = Number(n);
  if (!isFinite(n)) return '#NUM!';
  const full = fmtNum(n, 'general');
  if (full.length <= maxChars) return full;
  if (maxChars < 1) return null;
  const neg = n < 0, a = Math.abs(n);
  const sci = () => {
    if (a === 0) return null;
    let e = Math.floor(Math.log10(a));
    for (let k = 9; k >= 0; k--) {
      let m = roundAway(a / Math.pow(10, e), k), ee = e;
      if (m >= 10) { m = roundAway(m / 10, k); ee += 1; }
      const t = (neg ? '-' : '') + trimZeros(m.toFixed(k)) + 'E' + (ee < 0 ? '-' : '+') + String(Math.abs(ee)).padStart(2, '0');
      if (t.length <= maxChars) return t;
    }
    return null;
  };
  if (full.includes('E')) return sci();
  // fixed point: as many decimals as the column leaves room for
  const intPart = String(Math.trunc(roundAway(a, 0)));
  const intLen = (neg ? 1 : 0) + intPart.length;
  if (intLen > maxChars) return sci();
  for (let d = Math.max(0, maxChars - intLen - 1); d >= 0; d--) {
    const r = roundAway(a, d);
    if (r === 0 && a !== 0) return sci();          // every digit it could show is zero: Excel switches to E notation
    const t = (neg && r !== 0 ? '-' : '') + trimZeros(r.toFixed(d));
    if (t.length <= maxChars) return t;
  }
  return sci();
}
