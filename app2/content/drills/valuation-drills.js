// app2/content/drills/valuation-drills.js — what Chapter 6's drills share: each runs on the valuation
// pack (clearcoat-valuation) from a named state, with a planting over it (cells emptied, formats
// kept), and grades on the checks the chapter's lessons use (lessons/lib/bids-checks.js): a cell is
// built when its formula lands where the pack's own formula lands on the learner's cells.
import { parsFromRoute } from '../../app/pars.js';
import { cellAt, formulaAt, quoted } from '../lessons/lib/bids-checks.js';
import { rangeRefs } from '../../engine/refs.js';

/** A planting that empties `refs` on `sheet` of state `from` (each cell keeps its formats). */
export function emptied(sheet, refs, from = 'DONE') {
  const p = {};
  for (const ref of refs) { const c = cellAt(from, sheet, ref); if (!c) continue; const { formula, value, ...fmt } = c; p[`${sheet}!${ref}`] = fmt; }
  return p;
}
/** The refs of a range ('C30:E39'). */
export const refsOf = range => { const [a, b = a] = range.split(':'); return rangeRefs(a, b); };
/** Keys: Go To a range on `sheet` and enter the pack's own formula of its first cell over it. */
export const fillFrom = (sheet, range, from = 'DONE') => `Ctrl+G "${sheet}!${range}" ↵ ${quoted(formulaAt(from, sheet, range.split(':')[0]))} ${range.includes(':') ? 'Ctrl+↵' : '↵'}`;
/** Keys: Go To the first of `refs` (one column, top down) and enter the pack's formula in each, stepping down. */
export const downFrom = (sheet, refs, from = 'DONE') => `Ctrl+G "${sheet}!${refs[0]}" ↵ ` + refs.map(ref => `${quoted(formulaAt(from, sheet, ref))} ↵`).join(' ↓ ');

/**
 * The fields every Chapter 6 drill carries; the pars from the reference route (seconds). A `plant`
 * given as a function is built on first read (it reads the pack, which the catalogue should not pay
 * for when it loads).
 */
export function valuationDrill({ route, plant, ...rest }) {
  const d = { chapter: 'valuation', access: 'paid', workbook: 'clearcoat-valuation', route, pars: parsFromRoute(route), ...rest };
  if (typeof plant === 'function') { let p = null; Object.defineProperty(d, 'plant', { get: () => (p = p || plant()), enumerable: true }); }
  else if (plant) d.plant = plant;
  return d;
}
