// app2/content/lessons/lib/pack-build.js — the build of a cut-back valuation pack back to a
// finished one, shared by the Chapter 6 project and assessment: the route is read off the two
// states (lib/bids-checks.js cutOf), every formula block one Ctrl+Enter, every typed entry the
// learner decides one entry; the data the learner could not know (sites, sources, reasons, the
// term sheets' odds) arrives whole in the planting. Parts group the blocks by sheet, rows and
// columns, so each goal is one piece of the pack.
import { cutOf, plantFrom, blockKeys, typedKeys, blocksBuilt, typedDone, figuresOf, settled } from './bids-checks.js';

const colOf = ref => ref.match(/^[A-Z]+/)[0];
const inCols = (ref, cols) => !cols || cols.includes(colOf(ref));
/** The pieces of a cut that sit on `sheet` between rows r1 and r2 (and in `cols`, by the block's first column). */
export function part(cut, sheet, r1, r2, cols = null) {
  return {
    blocks: cut.blocks.filter(b => b.sheet === sheet && b.r1 >= r1 && b.r2 <= r2 && inCols(b.refs[0], cols)),
    typed: cut.typed.filter(t => t.sheet === sheet && t.r >= r1 && t.r <= r2 && inCols(t.ref, cols)),
  };
}
/** Several parts as one. */
export const joined = (...parts) => ({ blocks: parts.flatMap(p => p.blocks), typed: parts.flatMap(p => p.typed) });
/** A part's keys: its typed entries first (so the formulas read them), then its blocks. */
export const partKeys = p => [...p.typed.map(typedKeys), ...p.blocks.map(blockKeys)].join(' ');

/**
 * The project's or the assessment's build: `before` cut back against `after`, the planting (formats
 * everywhere, the data whole except the entries `learner(t)` leaves to the learner), and goals
 * from `PARTS` ({ id, text, of(cut) → part, requires, convention, also(ses) }). `want(ses)` reads
 * the figures a cell should land on (the finished state's, or the finished state on a seed).
 */
export function packBuild({ before, after, learner, leave = [], sheets = null }) {
  let CUT = null, PLANT = null;
  const cut = () => {
    if (CUT) return CUT;
    const all = cutOf(before, after, { sheets });
    CUT = { blocks: all.blocks, typed: all.typed.filter(learner), given: all.typed.filter(t => !learner(t)) };
    return CUT;
  };
  const plant = () => PLANT || (PLANT = plantFrom(before, after, { whole: cut().given.map(t => `${t.sheet}!${t.ref}`), leave, sheets }));
  const goal = (p, want) => {
    let P = null; const of = () => (P = P || p.of(cut()));
    return { id: p.id, text: p.text, get keys() { return [p.pre, partKeys(of()), p.post].filter(Boolean).join(' '); }, requires: p.requires, convention: p.convention,
      check: (s, ses) => settled(ses) && typedDone(ses, of().typed) && blocksBuilt(ses, of().blocks, after, want(ses)) && (!p.also || p.also(ses)) };
  };
  return { cut, plant, goal, finished: patch => figuresOf(after, patch) };
}
