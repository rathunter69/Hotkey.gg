// app2/content/lessons/lib/databook-checks.js — the end-state checks Chapter 3's math, aggregation
// and text lessons share on the clearcoat-databook workbook (modules 3.3 and 3.4). Every check reads
// the learner's sheet: a block holds a formula that calls the function the goal names (read from
// the parsed tokens, never the text), it reads the figure that function gives on the learner's own
// inputs, and the cell the goal names moves when an input moves (the shared liveness rule). Any
// legitimate route passes: typed, pointed, filled, pasted.
import { formulaFunctions, formulaRefs } from '../../../engine/formula.js';
import { parseRef } from '../../../engine/refs.js';
import { isLiveFormula } from '../../../engine/live.js';

export const sheetIn = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
export const summary = ses => sheetIn(ses, 'Summary');
export const transactions = ses => sheetIn(ses, 'Transactions');
/** Nothing open: no entry in progress, no dialog, no Ribbon walk. */
export const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
export const isNum = v => typeof v === 'number' && Number.isFinite(v);
export const near = (a, b, tol = 1e-6) => isNum(a) && isNum(b) && Math.abs(a - b) < tol;
/** The selection reads exactly `ref` ('Q5:Q10' or 'C7'). */
export const selected = (sh, ref) => !!sh && sh.selectionText() === ref;
/** The active sheet is `name`. */
export const onSheet = (ses, name) => !!ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;

/** The cell holds a formula that calls every function in `fns`. */
export function calls(sh, ref, fns) {
  const f = sh && sh.formula(ref);
  if (typeof f !== 'string' || !f) return false;
  const have = formulaFunctions(f);
  return fns.every(fn => have.includes(fn));
}
/** The cell is a live formula: perturb an input, the result moves. */
export const live = (sh, ref) => !!sh && isLiveFormula(sh, ref);
/**
 * A check cell is built to read zero whatever the inputs move to (that is its job), so no nudge
 * moves it and the liveness rule cannot see it. It is graded on its parsed references instead: a
 * formula that reads every cell in `keys` (on this sheet, or 'Sheet!A1').
 */
export function reads(sh, ref, keys) {
  const f = sh && sh.formula(ref); if (typeof f !== 'string' || !f) return false;
  const refs = formulaRefs(f, { rows: 1000, cols: 100 });
  const here = k => { const bang = k.indexOf('!'); return bang < 0 ? { sheet: null, key: k } : { sheet: k.slice(0, bang), key: k.slice(bang + 1) }; };
  return keys.every(k => {
    const { sheet, key } = here(k); const p = parseRef(key); if (!p) return false;
    return refs.some(x => (x.sheet || '').toUpperCase() === (sheet || '').toUpperCase() && (x.key ? x.key.replace(/\$/g, '') === key : x.range && p.r >= x.range.r1 && p.r <= x.range.r2 && p.c >= x.range.c1 && p.c <= x.range.c2));
  });
}

/** Rows r1..r2 in a column, as refs. */
export const colRefs = (col, r1, r2) => { const out = []; for (let r = r1; r <= r2; r++) out.push(col + r); return out; };

/**
 * Every row of a column block calls `fns` and reads `want(r)` (a number, compared within `tol`, or
 * any other value compared exactly); the cell named by `liveRef` is live. `want` reads the learner's
 * own inputs, so the figure is right whatever they are.
 */
export function block(sh, col, r1, r2, { fns = [], want, liveRef = col + r1, tol = 1e-6 } = {}) {
  if (!sh) return false;
  for (let r = r1; r <= r2; r++) {
    const ref = col + r;
    if (!calls(sh, ref, fns)) return false;
    if (want) {
      const w = want(r), v = sh.value(ref);
      if (typeof w === 'number' ? !near(v, w, tol) : v !== w) return false;
    }
  }
  return liveRef ? live(sh, liveRef) : true;
}

/** Excel's ROUND (half away from zero), on a float the way Excel shows it. */
export function xlRound(x, d) {
  const m = Math.pow(10, d); const y = Math.abs(x) * m;
  const r = Math.round(+(y.toPrecision(15)));
  return Math.sign(x) * r / m;
}
export const xlRoundDown = (x, d) => { const m = Math.pow(10, d); return Math.sign(x) * Math.floor(+(Math.abs(x) * m).toPrecision(15)) / m; };
export const xlCeiling = (x, s) => Math.ceil(+(x / s).toPrecision(15)) * s;
export const xlFloor = (x, s) => Math.floor(+(x / s).toPrecision(15)) * s;

/** The rows of the Transactions export, read off the learner's sheet: { site, pkg, member, amount, memo } with the values as they stand. */
export function exportRows(ses, first = 5, last = 94) {
  const t = transactions(ses); if (!t) return [];
  const out = [];
  for (let r = first; r <= last; r++) out.push({ r, date: t.value('A' + r), site: t.value('B' + r), pkg: t.value('C' + r), member: t.value('D' + r), amount: t.value('E' + r), memo: t.value('F' + r) });
  return out;
}
/** Excel's criteria equality for text: case-blind, exact otherwise (a trailing space is a different code). */
export const sameText = (a, b) => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
/** Rows matching every predicate. */
export const countRows = (rows, ...preds) => rows.filter(x => preds.every(p => p(x))).length;
export const sumRows = (rows, field, ...preds) => rows.filter(x => preds.every(p => p(x))).reduce((t, x) => t + (isNum(x[field]) ? x[field] : 0), 0);
/** The export's criteria, as Excel reads them. */
export const atSite = code => x => sameText(x.site, code);
export const ofPackage = code => x => sameText(x.pkg, code);
export const isMember = x => x.member != null && x.member !== '';
export const isRetailRow = x => !isMember(x);
export const amountOver = n => x => isNum(x.amount) && x.amount > n;
/** A total cell sums the column block above it: calls SUM and reads the block's sum. */
export function totalOf(sh, col, r1, r2, rTotal) {
  if (!calls(sh, col + rTotal, ['SUM'])) return false;
  let t = 0; for (let r = r1; r <= r2; r++) { const v = sh.value(col + r); if (isNum(v)) t += v; }
  return near(sh.value(col + rTotal), t);
}
/** The cell reads `want` and is a live formula. */
export const liveValue = (sh, ref, want) => !!sh && near(sh.value(ref), want) && live(sh, ref);
