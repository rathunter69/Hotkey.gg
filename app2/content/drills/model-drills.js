// app2/content/drills/model-drills.js — what Chapter 5's drills share: each runs on the operating
// model (clearcoat-model) from a named state, with a planting over it (cells cut back or broken),
// and grades on the model checks the chapter's lessons use (lessons/lib/model-checks.js).
import { stateOf, COLS } from '../workbooks/clearcoat-model.js';
import { parsFromRoute } from '../../app/pars.js';

let DONE = null;
const doneCells = sheet => { DONE = DONE || stateOf('DONE'); return DONE.sheets.find(s => s.name === sheet).cells; };
const without = (rec, keys) => Object.fromEntries(Object.entries(rec || {}).filter(([k]) => !keys.includes(k)));

/** The refs of `rows` across `cols` (C:J by default). */
export const across = (rows, cols = COLS) => [].concat(rows).flatMap(r => cols.map(c => c + r));

/**
 * A planting over the finished model, built from its own cells: `cut` deletes cells outright,
 * `blank` empties them (formats stay; `drop` names format fields to take too), `set` writes a
 * record over the finished one ({ 'Sheet!ref': { formula } } or { value }).
 */
export function planting({ cut = {}, blank = {}, drop = {}, set = {} } = {}) {
  const p = {};
  for (const [sheet, refs] of Object.entries(cut)) for (const ref of refs) p[`${sheet}!${ref}`] = null;
  for (const [sheet, refs] of Object.entries(blank)) for (const ref of refs) p[`${sheet}!${ref}`] = without(doneCells(sheet)[ref], ['formula', 'value', ...(drop[sheet] || [])]);
  for (const [key, rec] of Object.entries(set)) { const [sheet, ref] = key.split('!'); p[key] = { ...without(doneCells(sheet)[ref], ['formula', 'value']), ...rec }; }
  return p;
}

/** A finished model cell's record, for a check that compares against it. */
export const doneCell = (sheet, ref) => doneCells(sheet)[ref] || {};

/**
 * The fields every Chapter 5 drill carries; the pars from the reference route (seconds). A `plant`
 * given as a function is built on first read (it reads the finished model, which the catalogue
 * should not pay for when it loads).
 */
export function modelDrill({ route, plant, ...rest }) {
  const d = { chapter: 'finance-and-accounting', access: 'paid', workbook: 'clearcoat-model', route, pars: parsFromRoute(route), ...rest };
  if (typeof plant === 'function') { let p = null; Object.defineProperty(d, 'plant', { get: () => (p = p || plant()), enumerable: true }); }
  else if (plant) d.plant = plant;
  return d;
}
