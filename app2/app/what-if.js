// app2/app/what-if.js — what-if grading for drills (M84; screenplay 6.0). Where a typed number and a
// formula show the same value on the seed, the grader changes one or more input cells, recalculates,
// compares the answer cells with the reference route's workbook under the same change, and puts the
// inputs back. It tells a formula from a typed number, an anchored reference from a lucky one and a
// rule that reads a cell from one with the number typed in, without grading the route. It is the
// engine's one liveness rule (engine/live.js: perturb an input, check the result moves) widened from
// one cell to a drill's whole answer block, with the reference as the judge of where it should move.
//
// A drill (or lesson) opts in with data:
//   whatIf: { cases: [{ 'D5': 'Other income' }, { 'Inputs!C4': 0.12 }], answers: ['C14', 'C15'], why: '...' }
// A ref without a sheet name is on the first sheet. The runner adds one grader for it (runner.js
// graderStates), which runs only once every goal and end state already passes, so the clock has stopped.

import { siteCopy } from '../content/copy/apply.js';

const TOL = (a, b) => Math.max(0.005, 1e-6 * Math.abs(b));
/** Two answers agree: numbers to a cent (or a part in a million on a large one), anything else exactly. */
export function agree(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= TOL(a, b);
  return (a == null ? '' : a) === (b == null ? '' : b);
}

function split(ses, ref) {
  const bang = ref.lastIndexOf('!');
  const name = bang < 0 ? null : ref.slice(0, bang).replace(/^'|'$/g, '');
  const cell = (bang < 0 ? ref : ref.slice(bang + 1)).replace(/\$/g, '').toUpperCase();
  const list = ses.sheets || [{ name: null, sheet: ses.sheet }];
  const entry = name == null ? list[0] : list.find(e => e.name === name);
  return entry ? { sheet: entry.sheet, cell } : null;
}
/** A cell's value on a session ('' when empty). */
export function valueAt(ses, ref) {
  const at = split(ses, ref); if (!at) return undefined;
  const c = at.sheet.cells[at.cell];
  return c ? c.value : '';
}

/**
 * Type `values` over input cells, recalculate, run `fn(ses)`, then put every input back and
 * recalculate, so the sheet ends exactly as it was. An input that is missing or holds a formula
 * is not an input any more: the what-if fails (returns undefined) without touching anything.
 */
export function under(ses, values, fn) {
  const kept = [];
  for (const [ref, v] of Object.entries(values)) {
    const at = split(ses, ref);
    const c = at && at.sheet.cells[at.cell];
    if (!c || c.formula) { for (const [k, old] of kept) k.value = old; return undefined; }
    kept.push([c, c.value]); c.value = v;
  }
  try { ses.recalcAll(); return fn(ses); }
  finally { for (const [c, old] of kept) c.value = old; ses.recalcAll(); }
}

/**
 * The verdict: every case, every answer cell agrees with the reference under the same change.
 * Returns { ok, why, case, ref, got, want }; `why` is the drill's own line, or the plain default.
 */
export function whatIf(ses, ref, spec) {
  const why = (spec && spec.why) || siteCopy('whatif_why', 'An answer is typed where it should be worked out: change the input and it stays put.');
  if (!spec || !Array.isArray(spec.cases) || !Array.isArray(spec.answers)) return { ok: true };
  if (!ref) return { ok: true };   // no reference to judge by (a page without the route): the end state stands
  for (let i = 0; i < spec.cases.length; i++) {
    const values = spec.cases[i];
    const want = under(ref, values, r => spec.answers.map(a => valueAt(r, a)));
    if (!want) continue;   // the reference can't take this case: nothing to judge
    const got = under(ses, values, s => spec.answers.map(a => valueAt(s, a)));
    if (!got) return { ok: false, why: spec.inputWhy || why, case: i };
    for (let j = 0; j < spec.answers.length; j++) {
      if (!agree(got[j], want[j])) return { ok: false, why, case: i, ref: spec.answers[j], got: got[j], want: want[j] };
    }
  }
  return { ok: true };
}

/** Is `spec` a well-formed what-if? A list of problems (empty when it is). */
export function validateWhatIf(spec) {
  const errs = [];
  if (spec === undefined) return errs;
  const isRef = r => typeof r === 'string' && /^([^!]+!)?\$?[A-Z]{1,3}\$?\d{1,5}$/.test(r);
  if (!spec || typeof spec !== 'object') return ['whatIf must be an object'];
  if (!Array.isArray(spec.cases) || !spec.cases.length) errs.push('whatIf.cases must list at least one change');
  else for (const c of spec.cases) if (!c || typeof c !== 'object' || !Object.keys(c).length || !Object.keys(c).every(isRef)) errs.push('whatIf: each case maps input refs to values');
  if (!Array.isArray(spec.answers) || !spec.answers.length || !spec.answers.every(isRef)) errs.push('whatIf.answers must list the answer cells');
  if (spec.why !== undefined && typeof spec.why !== 'string') errs.push('whatIf.why must be a line');
  return errs;
}
