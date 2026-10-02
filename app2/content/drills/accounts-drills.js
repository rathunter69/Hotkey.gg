// app2/content/drills/accounts-drills.js — what Chapter 5's accounting drills share (script-drills,
// "The accounting (5.1)"): each runs on one small page of its own, one site and one month the way 5.1
// does, built to the sheet standard through buildPage and cut back to its start state; the judgment
// drills answer through pickers (a validated list, Alt+↓), and the grader reads the value picked.
import { buildPage, cutFrom } from '../workbooks/page.js';
import { parsFromRoute } from '../../app/pars.js';
import { isLiveFormula } from '../../engine/live.js';

export { buildPage, cutFrom };
export const SITE = 'Domain';
export const UNITS = 'USD unless stated';

/** A list picker on a cell: the in-cell drop-down over `items` (Data Validation, List). */
export const picker = items => ({ allow: 'list', source: items.join(','), inCell: true, ignoreBlank: true, errStyle: 'stop' });
/** The same picker on every ref. */
export const pickers = (refs, items) => Object.fromEntries(refs.map(r => [r, picker(items)]));
/** The value picked in `ref` is `want` (lists compare without case, as Excel's do). */
export const picked = (sh, ref, want) => String(sh.value(ref) ?? '').trim().toLowerCase() === String(want).toLowerCase();
/** Keys: open the drop-down on the active cell and pick `want` (from the top of the list; the cell starts empty). */
export const pickKeys = (items, want) => { const i = items.indexOf(want); if (i < 0) throw new Error(`no item ${want}`); return `Alt+↓ ${i ? `↓ ×${i} ` : ''}↵`; };

export const isNum = v => typeof v === 'number' && Number.isFinite(v);
export const near = (a, b, tol = 0.005) => isNum(a) && isNum(b) && Math.abs(a - b) <= tol;
/** The cell is a live formula that moves when one of `inputs` is nudged (the shared liveness rule). */
export const live = (sh, ref, inputs) => !!sh && isLiveFormula(sh, ref, inputs ? { inputs } : {});
/** The cell holds a formula that is live through `inputs` and reads `want` (a figure worked out from the learner's own inputs). */
export const ties = (sh, ref, want, inputs) => { const c = sh && sh.cells[ref]; return !!c && !!c.formula && near(sh.value(ref), want) && live(sh, ref, inputs); };

/**
 * The cell moves the right way with each input: nudge `input` by 100 (a what-if on the learner's own
 * sheet, put back after), and the cell moves by `sign` × 100. `inputs` is { ref: sign }; a typed number
 * never moves, and a line added where it should come off moves the wrong way.
 */
export function slopes(sh, ref, inputs) {
  const c0 = sh.cells[ref]; if (!c0 || !c0.formula) return false;
  const base = sh.value(ref);
  return Object.entries(inputs).every(([input, sign]) => {
    const c = sh.cells[input]; if (!c || c.formula || !isNum(c.value)) return false;
    const old = c.value;
    try { c.value = old + 100; sh.recalc(); return near(sh.value(ref) - base, sign * 100, 1e-6); }
    finally { c.value = old; sh.recalc(); }
  });
}

/**
 * The fields every accounting drill carries: Chapter 5, paid, its own one-tab workbook, the pars from
 * the reference route (seconds). `start` is the cut-back sheet, `validation` its pickers.
 */
export function accountsDrill({ route, start, validation, tab, ...rest }) {
  const sheet = validation ? { ...start, validation } : start;
  return { chapter: 'finance-and-accounting', access: 'paid', sheet, sheets: [{ name: tab }], route, pars: parsFromRoute(route), ...rest };
}
