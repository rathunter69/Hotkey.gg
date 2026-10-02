// Chapter 6 · 6.1.4 Operating multiples: EV per site, EV per wash (clearcoat-valuation, B614 → B615)
// The set is spread, flagged and summarized on EV / EBITDA. Each comp's sites, washes and whether it
// owns or rents arrive typed and sourced. The learner adds EBITDA before rent, EV per site and per
// wash, their helper columns and statistics, and Clearcoat's own counts on its row. Graded on the
// figures the page's formulas give on the learner's own cells, live where the goal says so.
import { settled, built, liveOn, comps, formatsAt, cellsAt, down, formulaOf, q, solutionOf, R } from './lib/comps-checks.js';

const F = ref => formulaOf(ref);
const cc = R('cc');
const STATS = ['stMed', 'stMean', 'stLow', 'stHigh', 'stMin', 'stMax'].map(R);
const INPUTS = ['R', 'S', 'T', 'U'].flatMap(c => down(c));
const CC = ['R', 'S', 'U', 'V'].map(c => c + cc);
const STAT_REFS = STATS.flatMap(r => ['Y' + r, 'Z' + r]);
const ebitdarOk = ses => built(ses, down('V'));
const unitsOk = ses => built(ses, [...down('W'), ...down('X')]);
const helpersOk = ses => built(ses, [...down('Y'), ...down('Z')]);
const statsOk = ses => built(ses, STAT_REFS);
const ccOk = ses => { const sh = comps(ses); const t = sh && sh.value('T' + cc); return built(ses, CC) && typeof t === 'string' && t.trim().toLowerCase() === 'rents'; };
const statKeys = () => STATS.map((r, i) => `${i === 0 ? `Ctrl+G "Comps!Y${r}:Z${r}" ↵` : '↓ Shift+→'} ${q(F('Y' + r))} Ctrl+↵`).join(' ');

const LESSON = {
  id: 'operating-multiples',
  chapter: 'valuation',
  section: 'Trading comps',
  module: 'trading-comps',
  workbook: 'clearcoat-valuation',
  state: { before: 'B614', after: 'B615' },
  // the counts arrive typed and sourced; every cell the learner fills arrives in the page's format
  plant: { ...cellsAt('B615', INPUTS), ...formatsAt('B615', [...['V', 'W', 'X', 'Y', 'Z'].flatMap(c => down(c)), ...STAT_REFS, ...CC]) },
  title: 'Operating multiples: EV per site, EV per wash',
  difficulty: 'medium',
  tags: ['valuation', 'comps', 'operating multiples'],
  access: 'paid',
  minutes: 6,
  headline: '/',
  conventions: ['C3', 'B2', 'B1'],
  teaches: ['operating-multiples'],
  uses: ['go-to', 'ctrl-enter-fill', 'formula-operators', 'flagged-set-stats', 'quartile-range', 'if-function', 'shift-arrow', 'arrow-keys', 'cross-sheet-ref', 'link-colour-convention', 'sum-family'],
  prerequisites: ['median-and-range'],
  brief: 'EBITDA can be dressed up; a site can’t. Car-wash buyers read enterprise value per site and per wash alongside EV / EBITDA, because a site is a unit anyone can count and a wash is what the site actually sells. Build both across the set, take their medians, and read where Clearcoat’s forty sites and 3.6m washes would sit. The key is `/`.',
  goals: [
    { id: 'ebitdar', teach: 'Sites and washes now sit beside each comp in R and S, typed and sourced, with whether it owns or rents its land. A comp that rents pays rent above the EBITDA line, so for the same washes it shows less EBITDA than one that owns; adding the rent back (EBITDAR) compares them evenly.',
      text: `EBITDA before rent in V5:V10: ${F('V5')}, so a comp that rents compares with one that owns.`,
      keys: `Ctrl+G "Comps!V5:V10" ↵ ${q(F('V5'))} Ctrl+↵`, requires: ['operating-multiples', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range V5:V10 · An owner’s rent cell is empty, so its EBITDAR is its EBITDA.',
      check: (s, ses) => settled(ses) && ebitdarOk(ses) && liveOn(ses, 'V6', 'U6') },
    { id: 'units', teach: 'EV per site is in millions of dollars, so the thousands divide by a thousand more; EV per wash is thousands over thousands, already in dollars.',
      text: `EV per site in W5:W10 ${F('W5')}, and EV per wash in X5:X10 ${F('X5')}.`,
      keys: `Ctrl+G "Comps!W5:W10" ↵ ${q(F('W5'))} Ctrl+↵ Ctrl+G "Comps!X5:X10" ↵ ${q(F('X5'))} Ctrl+↵`, requires: ['operating-multiples', 'formula-operators', 'ctrl-enter-fill'],
      hintStuck: 'pulse range W5:X10 · Enterprise value is in H; sites in R, washes in S.',
      check: (s, ses) => settled(ses) && unitsOk(ses) && liveOn(ses, 'W5', 'R5') },
    { id: 'helpers', teach: 'Each operating multiple gets its own helper column, read off the same Include flags, so Harbor drops out of these statistics too.',
      text: `The helpers: Y5:Y10 ${F('Y5')}, and Z5:Z10 ${F('Z5')}.`,
      keys: `Ctrl+G "Comps!Y5:Y10" ↵ ${q(F('Y5'))} Ctrl+↵ Ctrl+G "Comps!Z5:Z10" ↵ ${q(F('Z5'))} Ctrl+↵`, requires: ['flagged-set-stats', 'if-function', 'ctrl-enter-fill'],
      hintStuck: 'pulse range Y5:Z10 · The flags are in N, as for the EV / EBITDA helper in O.',
      check: (s, ses) => settled(ses) && helpersOk(ses) && liveOn(ses, 'Y9', 'N9') },
    { id: 'stats', text: `The statistics on both helpers, Y${STATS[0]}:Z${STATS[5]}: median, mean, the two quartiles, minimum and maximum, one row at a time across Y and Z.`,
      keys: statKeys(), requires: ['quartile-range', 'sum-family', 'ctrl-enter-fill', 'shift-arrow', 'arrow-keys'],
      hintStuck: `pulse range Y${STATS[0]}:Z${STATS[5]} · The rows follow the labels in column B, as in O.`,
      check: (s, ses) => settled(ses) && statsOk(ses) && liveOn(ses, 'Y' + STATS[0], 'R5') },
    { id: 'clearcoat', teach: 'Clearcoat’s own counts come from the model: forty sites and 3.6m washes in FY26E on Schedules, and its rent from IS, turned positive to add back. Clearcoat rents its land, so its EBITDAR sits well above its EBITDA.',
      text: `Clearcoat’s row: R${cc}:S${cc} from Schedules, Rents in T${cc}, its rent in U${cc} ${F('U' + cc)}, and EBITDAR in V${cc}.`,
      keys: `Ctrl+G "Comps!R${cc}" ↵ ${q(F('R' + cc))} ↵ → ${q(F('S' + cc))} ↵ → "Rents" ↵ → ${q(F('U' + cc))} ↵ → ${q(F('V' + cc))} ↵`,
      requires: ['cross-sheet-ref', 'link-colour-convention', 'go-to', 'arrow-keys'], convention: 'B2',
      hintStuck: `pulse range R${cc}:V${cc} · Sites and washes are column E of Schedules, rows 9 and 15.`,
      check: (s, ses) => settled(ses) && ccOk(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Comps!R5" Enter "500" Enter Ctrl+G "Comps!Y11" Enter', cadence: 360 },
      text: 'Does it tie? Watch Pinnacle’s site count go from 400 to 500: its EV per site falls, and the median in Y11 moves with it.', requires: [],
      hintStuck: 'pulse cell Y11 · Pinnacle is the middle of the included set on EV per site.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'EV per site and per wash across the set, with EBITDA before rent beside them', check: (s, ses) => ebitdarOk(ses) && unitsOk(ses) },
    { text: 'Their statistics skip the excluded comp through their own helpers', check: (s, ses) => helpersOk(ses) && statsOk(ses) },
    { text: 'Clearcoat’s sites, washes and rent link from the model', check: (s, ses) => ccOk(ses) },
  ],
  closing: [
    'Six companies anyone can count gave you a price per site and per wash.',
    'Best practice: three multiples on every comps page. When they disagree, the one built on the unit a buyer can count wins the argument.',
  ],
};
LESSON.solution = solutionOf(LESSON.goals);
export default LESSON;
