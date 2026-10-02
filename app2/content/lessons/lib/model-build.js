// app2/content/lessons/lib/model-build.js — the build of a cut-back operating model (clearcoat-model)
// back to the finished one, shared by the Chapter 5 project and assessment. The route is read off
// the two states: every empty formula cell of the finished model, grouped into blocks that take one
// relative formula (one Ctrl+Enter each), in sheet and row order. The checks read each block's end
// state: a formula the finished model's (spacing and case ignored) or one landing on its figure.
import { stateOf, COLS } from '../../workbooks/clearcoat-model.js';
import { translateFormula } from '../../../engine/formula.js';
import { parseRef, rangeRefs } from '../../../engine/refs.js';
import { sheetIn, agree, finished } from './model-checks.js';

const L = c => String.fromCharCode(64 + c);
export const norm = f => String(f || '').replace(/\s/g, '').toUpperCase();

/**
 * The formula blocks `before` lacks against the finished model, as [{ sheet, range, formula, refs }]:
 * each a rectangle whose every cell holds the first cell's formula moved relative, so one Ctrl+Enter
 * over the range writes it.
 */
export function blocksOf(before) {
  const B = stateOf(before), D = stateOf('DONE'), out = [];
  for (const ds of D.sheets) {
    const bs = B.sheets.find(s => s.name === ds.name);
    const byRow = {};
    for (const k of Object.keys(ds.cells)) {
      if (!ds.cells[k].formula || (bs.cells[k] && bs.cells[k].formula === ds.cells[k].formula)) continue;
      const p = parseRef(k); (byRow[p.r] = byRow[p.r] || []).push(p.c);
    }
    const runs = [];
    for (const r of Object.keys(byRow).map(Number).sort((a, b) => a - b)) {
      let run = null;
      for (const c of byRow[r].sort((a, b) => a - b)) {
        const f = ds.cells[L(c) + r].formula;
        if (run && c === run.c2 + 1 && translateFormula(run.f, 0, c - run.c1) === f) run.c2 = c;
        else { run = { r, c1: c, c2: c, f }; runs.push(run); }
      }
    }
    const merged = [];
    for (const run of runs) {
      const m = merged.find(x => x.c1 === run.c1 && x.c2 === run.c2 && x.r2 === run.r - 1 && translateFormula(x.f, run.r - x.r1, 0) === run.f);
      if (m) m.r2 = run.r; else merged.push({ ...run, r1: run.r, r2: run.r });
    }
    for (const m of merged) {
      const a = L(m.c1) + m.r1, b = L(m.c2) + m.r2;
      out.push({ sheet: ds.name, range: a === b ? a : `${a}:${b}`, formula: m.f, refs: rangeRefs(a, b), r1: m.r1, r2: m.r2 });
    }
  }
  return out;
}

const quoted = f => (f.includes('"') ? `'${f}'` : `"${f}"`);
/** One block's keys: Go To the range, type the first cell's formula, Ctrl+Enter. */
export const blockKeys = b => `Ctrl+G "${b.sheet}!${b.range}" ↵ ${quoted(b.formula)} Ctrl+↵`;
/** The blocks of `all` on `sheet` between rows `from` and `to`. */
export const pick = (all, sheet, from = 1, to = 1e4) => all.filter(b => b.sheet === sheet && b.r1 >= from && b.r2 <= to);

let DONE_STATE = null;
const doneCell = (sheet, ref) => { DONE_STATE = DONE_STATE || stateOf('DONE'); const s = DONE_STATE.sheets.find(x => x.name === sheet); return (s && s.cells[ref]) || {}; };

/**
 * Every cell of `blocks` holds a formula: the finished model's (spacing and case ignored), or any
 * formula landing on the finished figure (`want` reads it: finished() by default, or the finished
 * model run on a seed's inputs).
 */
export function built(ses, blocks, want = finished()) {
  return blocks.every(b => {
    const sh = sheetIn(ses, b.sheet); if (!sh) return false;
    return b.refs.every(ref => { const c = sh.cells[ref]; return !!c && !!c.formula && (norm(c.formula) === norm(doneCell(b.sheet, ref).formula) || agree(c.value, want(b.sheet, ref))); });
  });
}

/** Every cell of `blocks` lands on the finished figure (the end state, once the circle is closed). */
export function figures(ses, blocks, want = finished()) {
  return blocks.every(b => { const sh = sheetIn(ses, b.sheet); return !!sh && b.refs.every(ref => { const c = sh.cells[ref]; return !!c && !!c.formula && agree(c.value, want(b.sheet, ref)); }); });
}
export { COLS };
