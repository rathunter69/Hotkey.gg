// Chapter 4 · 4.7.A Assessment: a fresh export, twelve minutes (seeded over SAraw; also the test-out)
// The project's diligence pack again, against a twelve-minute clock, on another cluster: Dallas's
// six sites on their own fortnight, cut the way the project's pack is (buildSolved with Dallas's
// sites, then the same cells taken out). The seed reruns the export's figures with a new seed over
// the same cells (the retail and member counts, the revenue, the hours, and each site tab's weekly
// figures), so the route never depends on the numbers. The goals are the project's, read
// structurally (each formula against the finished pack, spacing and case ignored), so any seed
// passes on the same keys.
import { hintToScript } from '../../app/runner.js';
import { parsFrom } from '../../app/pars.js';
import { stateOf, DALLAS, freshFigures } from '../workbooks/clearcoat-pack.js';
import { goalsFor, checksFor, TEXTS as PROJECT_TEXTS, TIE } from './ch4-project.js';

const DONE = stateOf('SAdone');
const GOALS = goalsFor(PROJECT_TEXTS, { done: DONE, sites: DALLAS });
const CHECKS = checksFor(DONE, DALLAS);

/** The seed: Dallas's export rerun with a new seed over the same cells (the codes, the dates and the planted faults stay). */
export const freshExport = rng => freshFigures(1 + Math.floor(rng() * 2147483646));

/** The pack ties: the KPI page reads the clean export, the case is wired, every check reads 0 and the log is answered. */
export const GRADERS = [
  ses => { if (!CHECKS['clean-export'](ses)) return { ok: false, why: 'a site code on Export is still misspelt' };
    if (!CHECKS['unique-list'](ses)) return { ok: false, why: 'the unique site list on Lists N5:N10 or its proof in O5:O11 and C26 is not complete' };
    if (!CHECKS['site-block'](ses) || !CHECKS['kpi-block'](ses)) return { ok: false, why: 'the site block or the KPI block on Summary C5:M11 is not the INDEX, MATCH and SUMIFS set the pack uses' };
    if (!CHECKS.cubes(ses) || !CHECKS.window(ses)) return { ok: false, why: 'a cube on Summary or the window in C50:C51 does not read the export by SUMIFS' };
    return { ok: true }; },
  ses => { if (!CHECKS.names(ses) || !CHECKS.pickers(ses)) return { ok: false, why: 'the five names, their list on Inputs or the two pickers by name are not all there' };
    if (!CHECKS.switch(ses) || !CHECKS.driver(ses) || !CHECKS.outputs(ses)) return { ok: false, why: 'the switch, the driver or the outputs on Scenarios are not wired' };
    if (!CHECKS['break-even'](ses)) return { ok: false, why: 'break-even in C41:C45 or the Goal Seek answer in C46 is missing' };
    if (!CHECKS.checks(ses)) return { ok: false, why: 'a check on Summary or Scenarios is not a live difference reading 0' };
    if (!CHECKS.log(ses)) return { ok: false, why: 'a question on Q&A is still open or its answer does not point at its cell' };
    return { ok: true }; },
];

export default {
  id: 'ch4-assessment',
  chapter: 'data-and-lookups',
  section: 'Project and assessment',
  module: 'ch4-project-and-assessment',
  workbook: 'clearcoat-pack',
  state: { before: 'SAraw' },
  kind: 'assessment',
  title: 'Assessment: a fresh export, twelve minutes',
  difficulty: 'hard',
  tags: ['assessment', 'lookups', 'scenarios', 'names', 'diligence'],
  access: 'paid',
  minutes: 12,
  headline: 'Ctrl+Enter',
  conventions: ['C3', 'C9', 'E9', 'F1', 'B2'],
  uses: [...new Set(GOALS.flatMap(g => g.requires))],
  prerequisites: ['ch4-project'],
  brief: 'Dallas has sent its own fortnight: six sites you have not seen, the same misspelling in another code, a KPI page and a case sheet cut back the same way, and eight questions open. Build the same diligence pack on the clock with no help and the keyboard only, until every check reads 0. Pass, and the chapter is Verified; this is also the test-out. The key is `Ctrl+Enter`.',
  wow: 'You built the diligence pack on another cluster’s export, on the clock, and the chapter is Verified.',
  timeLimit: 720,
  pars: parsFrom(420, { pass: 720, pro: 560 }),
  seed: freshExport,
  goals: [...GOALS, TIE],
  graders: GRADERS,
  closing: [
    'A cluster you had never seen, a pack to the standard: the export cleaned, the KPI page reading it, the case wired by name, break-even found, every check at 0 and the log answered.',
    'That is the pack a buyer’s analyst opens first in the data room, and you built it under a clock.',
  ],
  solution: hintToScript(GOALS.map(g => g.keys).join(' ')),
};
