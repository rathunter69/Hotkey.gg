// app2/engine/live.js — the one shared "is this cell a live formula?" rule.
//
// A cell is LIVE when it holds a formula AND perturbing at least one input cell moves its output.
// No regex over the formula text: the sheet is cloned, one input at a time is nudged, the whole
// sheet recalculates, and the candidate cell's value is compared. So:
//   =SUM(B2:B4)     live (B2 moves it)        =B2*0    not live (nothing moves it)
//   =4470           not live (a hardcode dressed as a formula)
//   =B8             live (a single link still moves with its source)
// Formula cells count as inputs too (a chain =C3 → C3==B3+1 → B3 is live through B3).

import { parseRef, refKey } from './refs.js';
import { Sheet } from './sheet.js';

const clone = o => JSON.parse(JSON.stringify(o));

/** A value nudged so that any sane formula reading it moves. */
export function perturb(v) {
  if (typeof v === 'number') return v === 0 ? 1 : v * 2 + 1;
  if (typeof v === 'boolean') return !v;
  if (typeof v === 'string') return v + '​';   // a changed text still moves LEN/&/comparisons
  return 1;                                          // a blank becomes a number
}

/**
 * @param {Sheet} sheet
 * @param {string} ref  e.g. 'B6'
 * @param {object} [opts]  inputs: array of refs to try (default: every non-formula cell on the sheet, blanks included)
 * @returns {boolean}
 */
export function isLiveFormula(sheet, ref, opts = {}) {
  const p = parseRef(ref); if (!p) return false;
  const key = refKey(p.r, p.c);
  const target = sheet.cells[key];
  if (!target || !target.formula) return false;
  const base = sheet.value(key);
  const inputs = opts.inputs || defaultInputs(sheet, key);
  for (const inKey of inputs) {
    const test = new Sheet({ rows: sheet.rows, cols: sheet.cols, today: sheet.today || undefined });
    test.cells = clone(sheet.cells);
    const cell = test.cells[inKey] || (test.cells[inKey] = { value: null, formula: null });
    if (cell.formula) continue;   // only inputs are nudged; formula cells move through their own inputs
    cell.value = perturb(cell.value);
    test.recalc();
    const after = test.value(key);
    if (!sameValue(after, base)) return true;
  }
  return false;
}

function sameValue(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  return a === b;
}

function defaultInputs(sheet, exclude) {
  const out = [];
  for (let r = 1; r <= sheet.rows; r++) for (let c = 1; c <= sheet.cols; c++) {
    const k = refKey(r, c); if (k === exclude) continue;
    const cell = sheet.cells[k]; if (cell && cell.formula) continue;
    out.push(k);
  }
  // non-empty cells first so the common case answers on the first probe
  return out.sort((a, b) => (sheet.cells[b] ? 1 : 0) - (sheet.cells[a] ? 1 : 0));
}

/** Every formula cell on the sheet that is live, as a list of refs. */
export function liveFormulas(sheet) {
  return Object.keys(sheet.cells).filter(k => sheet.cells[k] && sheet.cells[k].formula && isLiveFormula(sheet, k));
}
