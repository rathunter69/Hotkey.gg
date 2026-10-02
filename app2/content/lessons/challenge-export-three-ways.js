// Chapter 4 · 4.4.C Challenge: an export summarized three ways (clearcoat-pack, seeded over S44C)
// A fresh fortnight of washes and revenue over the module's export, with Riverside's late day
// parked beside its row (Export!L49:M49). Three pivots, each on its own sheet: washes by site and
// week, revenue by week and site as a share of each site's column, average washes by site; the
// late row entered and every pivot refreshed; Domain's washes read on Summary by GETPIVOTDATA.
// Graded on the learner's own workbook: each pivot's layout, and its figures against the export as
// it stands. Seeds pick the figures; the workload never moves.
import { challengeSeed, LATE, PIVOTS, stateOf } from '../workbooks/clearcoat-pack.js';
import { pivots, pivotLike, current, settled, calls, near, summary, exportSheet } from './lib/pack-scenario-checks.js';
import { parsFrom } from '../../app/pars.js';

const ID = 'challenge-export-three-ways';
const REV = PIVOTS.S441.value;
const ONE = { row: 'Site', col: 'Week', value: 'Total washes' };
const TWO = { row: 'Week', col: 'Site', value: REV, show: 'pctCol' };
const THREE = { row: 'Site', col: null, value: 'Total washes', fn: 'average' };
const r = LATE.row;
const lateIn = ses => { const X = exportSheet(ses); return !!X && [['C', LATE.retail], ['D', LATE.member]].every(([to, from]) => !X.formula(to + r) && near(X.value(to + r), X.value(from + r))); };
const allCurrent = ses => [ONE, TWO, THREE].every(w => { const x = pivotLike(ses, w); return !!x && current(ses, x); });
const domainWashes = ses => { const X = exportSheet(ses); let t = 0; for (let i = 5; i <= 94; i++) if (X.value('B' + i) === 'AUS-DOM') t += X.value('E' + i) || 0; return t; };
const reader = ses => { const sh = summary(ses); return !!sh && calls(sh, 'I14', ['GETPIVOTDATA']) && near(sh.value('I14'), domainWashes(ses)); };
/** Pivot one lands on the first new sheet, which Excel names after the book's sheet count. */
const FIRST_NEW = 'Sheet' + (stateOf('S44C').sheets.length + 1);
const GPD = `=GETPIVOTDATA("Total washes",${FIRST_NEW}!$A$3,"Site","AUS-DOM")`;

export default {
  id: ID,
  chapter: 'data-and-lookups',
  section: 'Pivot tables',
  module: 'pivot-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S44C' },
  kind: 'challenge',
  title: 'Challenge: an export summarized three ways',
  difficulty: 'hard',
  tags: ['challenge', 'pivot tables', 'summaries'],
  access: 'paid',
  minutes: 3,
  conventions: ['F4'],
  prerequisites: ['pivot-refresh-getpivotdata'],
  brief: 'A fresh export, with Riverside’s late day parked beside its row. Three pivots, the late day entered and every pivot refreshed, then Domain’s washes on Summary by GETPIVOTDATA.',
  timeLimit: 180,
  pars: parsFrom(70, { pass: 175, pro: 110 }),
  seed: rng => challengeSeed(ID, rng),
  goals: [
    { id: 'one', text: 'Pivot one, on a sheet of its own: Total washes by Site down and Week across.',
      keys: 'Ctrl+G "Export!A4" ↵ Alt N V T ↵ ↓ R ↓ ×3 V ↓ ×3 C ↵',
      check: (s, ses) => settled(ses) && !!pivotLike(ses, ONE) },
    { id: 'two', text: 'Pivot two: Retail revenue ($) by Week down and Site across, shown as a % of Column Total.',
      keys: 'Ctrl+G "Export!A4" ↵ Alt N V T ↵ End ↑ ↑ R ↑ ↑ V Home ↓ C ↵ ↓ ↓ Shift+F10 A C',
      check: (s, ses) => settled(ses) && !!pivotLike(ses, TWO) },
    { id: 'three', text: 'Pivot three: the average Total washes by Site.',
      keys: 'Ctrl+G "Export!A4" ↵ Alt N V T ↵ ↓ R ↓ ×3 V S S ↵',
      check: (s, ses) => settled(ses) && !!pivotLike(ses, THREE) },
    { id: 'late', text: `Enter Riverside’s late day: copy Export!M${r}:N${r} into C${r}:D${r}, then refresh every pivot with Ctrl+Alt+F5.`,
      keys: `Ctrl+G "Export!M${r}:N${r}" ↵ Ctrl+C Ctrl+G "Export!C${r}" ↵ Ctrl+V Ctrl+Alt+F5`,
      check: (s, ses) => settled(ses) && lateIn(ses) && allCurrent(ses) },
    { id: 'read', text: 'On Summary, read Domain’s washes from pivot one into I14 with GETPIVOTDATA.',
      keys: `Ctrl+G "Summary!I14" ↵ '${GPD}' ↵`,
      check: (s, ses) => settled(ses) && reader(ses) },
  ],
  graders: [
    ses => pivots(ses).length >= 3 ? { ok: true } : { ok: false, why: 'three cuts need three pivots, each on a sheet of its own' },
    ses => allCurrent(ses) ? { ok: true } : { ok: false, why: 'a pivot still shows the export before the late day. A pivot is a copy until it is refreshed, so refresh every one before you send' },
    ses => reader(ses) ? { ok: true } : { ok: false, why: 'Summary!I14 does not read Domain’s washes from the pivot. GETPIVOTDATA finds the figure by its labels, so it holds when the pivot moves' },
  ],
  solution: 'Ctrl+G "Export!A4" Enter Alt N V T Enter Down R Down Down Down V Down Down Down C Enter '
    + 'Ctrl+G "Export!A4" Enter Alt N V T Enter End Up Up R Up Up V Home Down C Enter Down Down Shift+F10 A C '
    + 'Ctrl+G "Export!A4" Enter Alt N V T Enter Down R Down Down Down V S S Enter '
    + `Ctrl+G "Export!M${r}:N${r}" Enter Ctrl+C Ctrl+G "Export!C${r}" Enter Ctrl+V Ctrl+Alt+F5 `
    + `Ctrl+G "Summary!I14" Enter '${GPD}' Enter`,
};
