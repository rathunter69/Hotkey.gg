// Chapter 3 · 3.7.A Assessment: the databook on fresh figures (seeded over S7raw; also the test-out)
// The project's databook again, against a twelve-minute clock, on another fortnight of the San
// Antonio cluster: the seed reruns the cluster's data with a new seed (buildProject) and lays its raw
// export, member list and day totals over the same cells, with the managers' tallies already typed
// in blue. The faults are the same kinds in other rows, so the route never depends on where they sit.
// The goals are the project's, read structurally (each formula against the finished databook, the
// clean data, the colours), so any seed passes on the same keys.
import { hintToScript } from '../../app/runner.js';
import { parsFrom } from '../../app/pars.js';
import { rangeRefs } from '../../engine/refs.js';
import { buildProject, SAN_ANTONIO } from '../workbooks/clearcoat-databook.js';
import { goalsFor, TEXTS as PROJECT_TEXTS } from './ch3-project.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const near0 = v => typeof v === 'number' && Math.abs(v) < 1e-6;

const TEXTS = {
  ...PROJECT_TEXTS,
  reconciliation: 'Reconcile C44:I50 to the blue tallies in D: link the counts, take the gaps, then explain and adjust each in blue until I reads 0.',
};
const GOALS = goalsFor(TEXTS, { tallies: false });

/** The cells a fresh export replaces: the same cells on every seed, so the workload never moves. */
const OVERLAY = [['Transactions', 'A5:F94'], ['Members', 'B5:F44'], ['Daily', 'B5:E94']];
/** The seed: another fortnight's export over the same cells, and the managers' tallies for it typed blue in D44:D49. */
export function freshExport(rng) {
  const { raw, done } = buildProject({ ...SAN_ANTONIO, seed: 1 + Math.floor(rng() * 2147483646) });
  const patch = {};
  for (const [name, range] of OVERLAY) {
    const cells = raw.sheets.find(s => s.name === name).cells;
    const [a, b] = range.split(':');
    for (const ref of rangeRefs(a, b)) patch[`${name}!${ref}`] = cells[ref] ? { ...cells[ref] } : null;
  }
  const summary = done.sheets.find(s => s.name === 'Summary').cells;
  for (const ref of rangeRefs('D44', 'D49')) patch['Summary!' + ref] = { ...summary[ref] };
  return patch;
}

/** The databook ties: the roll-up flag reads OK, the reconciliation and the schedule's check read zero. */
export const GRADERS = [
  ses => { const sh = sheetOf(ses, 'Summary'); if (!sh) return { ok: false, why: 'No Summary sheet.' };
    for (const ref of ['C75', 'C2']) { if (!sh.cellAt(ref).formula) return { ok: false, why: `Summary ${ref} is not a formula. The flag is the roll-up of the checks, never typed` };
      if (sh.value(ref) !== 'OK') return { ok: false, why: `Summary ${ref} reads ${sh.value(ref)}. A check in C68:C73 is not at zero` }; }
    return { ok: true }; },
  ses => { const sh = sheetOf(ses, 'Summary'); if (!sh) return { ok: false, why: 'No Summary sheet.' };
    for (let r = 44; r <= 49; r++) if (!sh.cellAt('I' + r).formula || !near0(sh.value('I' + r))) return { ok: false, why: `Summary I${r} does not read 0. Every gap to the tally is explained and adjusted` };
    const loans = sheetOf(ses, 'Loans');
    if (!loans || !loans.cellAt('C53').formula || !near0(loans.value('C53'))) return { ok: false, why: 'Loans C53 does not read 0. The twelve months of principal tie to the balance' };
    return { ok: true }; },
];

export default {
  id: 'ch3-assessment',
  chapter: 'formulas',
  section: 'Project and assessment',
  module: 'ch3-project-and-assessment',
  workbook: 'clearcoat-databook',
  state: { before: 'S7raw' },
  kind: 'assessment',
  title: 'Assessment: the databook on fresh figures',
  difficulty: 'hard',
  tags: ['assessment', 'formulas', 'databook', 'audit'],
  access: 'paid',
  minutes: 12,
  headline: 'Ctrl+Enter',
  conventions: ['B1', 'B2', 'B4', 'B6', 'C3', 'C4', 'E2', 'F1', 'F3'],
  uses: [...new Set(GOALS.flatMap(g => g.requires))],
  prerequisites: ['ch3-project'],
  brief: 'Another fortnight’s export has landed, with the managers’ tallies already in: the same faults in other rows and figures you have not seen. Build the same databook on the clock with no help and the keyboard only, until the flag at the top reads OK. Pass, and the chapter is Verified; this is also the test-out. The key is `Ctrl+Enter`.',
  wow: 'You built the databook on figures you had never seen, on the clock, and the chapter is Verified.',
  timeLimit: 720,
  pars: parsFrom(360, { pass: 720, pro: 520 }),
  seed: freshExport,
  goals: [
    ...GOALS,
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!E5" Enter "150" Enter Ctrl+G "Summary!C2" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch the first amount on Transactions change to 150 and the flag in C2 turn to CHECK in red.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  graders: GRADERS,
  closing: [
    'A fortnight you had never seen, a databook to the standard: the export cleaned, every figure a live formula, the gaps explained, the case valued and the flag at OK.',
    'That is the databook a buyer’s analyst opens first, and you built it under a clock.',
  ],
  solution: hintToScript(GOALS.map(g => g.keys).join(' ')),
};
