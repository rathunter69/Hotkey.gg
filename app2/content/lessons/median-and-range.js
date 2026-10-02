// Chapter 6 · 6.1.3 Sort the set, filter the outliers, take the median (clearcoat-valuation, B613 → B614)
// The six comps are spread and their LTM is built. The learner flags each comp in or out, sorts a
// values copy of the set to see its shape, adds growth and leverage, puts Clearcoat on its own row,
// writes why the outlier is out, and takes the statistics through a helper column so an excluded
// comp drops out; then flips the flag to see the mean move and the median hold. Every figure is
// graded on what the page's formula gives on the learner's own cells.
import { settled, built, liveOn, comps, formatsAt, cellsAt, cellsIn, down, formulaOf, q, solutionOf, R } from './lib/comps-checks.js';
import { seenThen } from './lib/model-checks.js';
import { COMPS } from '../workbooks/clearcoat-valuation.js';

const F = ref => formulaOf(ref);
const r = R;
const STAT = k => r(k);
const SORT = ['sort0', 'sort1', 'sort2', 'sort3', 'sort4', 'sort5'].map(r);
const SORT_HDR = SORT[0] - 1;
// the values copy arrives in the set's own order; sorting it is the goal (B614 holds it sorted)
const sortedCells = cellsIn('B614');
const byName = Object.fromEntries(SORT.map(row => [sortedCells['B' + row].value, row]));
const unsorted = {};
COMPS.forEach((cp, i) => {
  const from = byName[cp.name], to = SORT[i];
  for (const col of ['B', 'C', 'D', 'E']) unsorted[`Comps!${col}${to}`] = JSON.parse(JSON.stringify(sortedCells[col + from]));
});
const SIDE = ['M', 'P', 'Q'].flatMap(c => ['stMed', 'stMean', 'stMin', 'stMax'].map(k => c + STAT(k)));
const OSTAT = ['stMed', 'stMean', 'stLow', 'stHigh', 'stMin', 'stMax'].map(k => 'O' + STAT(k));
const CC = ['I', 'J', 'M', 'P', 'Q'].map(c => c + r('cc'));

const flagsOk = ses => { const sh = comps(ses); return !!sh && down('N').every((ref, i) => !sh.formula(ref) && sh.value(ref) === COMPS[i].include); };
const sortOk = ses => {
  const sh = comps(ses); if (!sh) return false;
  const rows = SORT.map(row => ['B', 'C', 'D', 'E'].map(c => sh.value(c + row)));
  const want = SORT.map(row => ['B', 'C', 'D', 'E'].map(c => sortedCells[c + row].value));
  return JSON.stringify(rows) === JSON.stringify(want);
};
const colsOk = ses => built(ses, [...down('P'), ...down('Q')]);
const ccOk = ses => built(ses, CC);
const noteOk = ses => { const sh = comps(ses); const v = sh && sh.value('AB9'); return !!sh && !sh.formula('AB9') && typeof v === 'string' && v.trim().length >= 20; };
const helperOk = ses => built(ses, down('O'));
const statsOk = ses => built(ses, OSTAT);
const sideOk = ses => built(ses, SIDE);
const MEAN = 'O' + STAT('stMean');
const flipOk = ses => seenThen(ses, 'flag-flip', s => { const sh = comps(s); return sh.value('N9') === 1 && !sh.formula('N9'); }, s => { const sh = comps(s); return sh.value('N9') === 0 && !sh.formula('N9'); });

const LESSON = {
  id: 'median-and-range',
  chapter: 'valuation',
  section: 'Trading comps',
  module: 'trading-comps',
  workbook: 'clearcoat-valuation',
  state: { before: 'B613', after: 'B614' },
  // the cells this lesson fills arrive in the page's format; the values copy and Clearcoat's flag line arrive written
  plant: { ...formatsAt('B614', [...down('N'), ...down('O'), ...down('P'), ...down('Q'), ...OSTAT, ...SIDE, ...CC]), ...cellsAt('B614', ['C', 'D', 'E'].map(c => c + SORT_HDR).concat(['AA' + r('cc')])), ...unsorted },
  title: 'Sort the set, filter the outliers, take the median',
  difficulty: 'hard',
  tags: ['valuation', 'comps', 'statistics'],
  access: 'paid',
  minutes: 8,
  headline: 'MEDIAN',
  conventions: ['B1', 'B6', 'C3', 'B2'],
  teaches: ['flagged-set-stats', 'quartile-range'],
  uses: ['go-to', 'ctrl-enter-fill', 'sort-dialog', 'formula-operators', 'cross-sheet-ref', 'link-colour-convention', 'if-function', 'arrow-keys', 'shift-arrow', 'sum-family'],
  prerequisites: ['calendarization-ltm'],
  brief: 'A set of six multiples has a shape, and one of the six is a struggling operator at 6x that would drag an average down. Sort the set to see it, decide which comp to exclude and say why in a note, and take the median (the middle value, which an outlier can’t move) plus the 25th and 75th percentiles as the range. Mean, median, low and high sit on their own rows, with a switch to include or exclude each comp. The key is `MEDIAN`.',
  goals: [
    { id: 'flags', teach: 'Exclude a comp in the open, with a flag and a reason, never by deleting its row. The Include column holds a typed 1 or 0 for each comp, blue like any input.',
      text: 'Flag the set in N5:N10: a 1 for each comp, then a 0 for Harbor in N9.',
      keys: 'Ctrl+G "Comps!N5:N10" ↵ "1" Ctrl+↵ Ctrl+G "Comps!N9" ↵ "0" ↵', requires: ['flagged-set-stats', 'ctrl-enter-fill', 'go-to'], convention: 'B1',
      hintStuck: 'pulse range N5:N10 · Harbor trades at about 6x while the rest sit near 10x.',
      check: (s, ses) => settled(ses) && flagsOk(ses) },
    { id: 'sort', teach: 'Below the set sits a values copy of it, so the sort can’t scramble a formula. Sorted by multiple, the shape shows at once: five companies between 8.7x and 12.0x and one at 6.1x.',
      text: `Sort the copy by EV / EBITDA, largest first: select C${SORT[0]}:C${SORT[5]}, press Alt, A, S, D, and expand the selection.`,
      keys: `Ctrl+G "Comps!C${SORT[0]}:C${SORT[5]}" ↵ Alt A S D ↵`, requires: ['sort-dialog', 'go-to'],
      hintStuck: `pulse range B${SORT[0]}:E${SORT[5]} · Expanding the selection carries each company’s name and figures with its multiple.`,
      check: (s, ses) => settled(ses) && sortOk(ses) },
    { id: 'cols', teach: 'Two columns say why a multiple is high or low. Growth compares this LTM with the four quarters before it; net debt over EBITDA is leverage, and a net-cash comp like Summit reads negative.',
      text: `LTM growth in P5:P10 ${F('P5')}, and net debt / EBITDA in Q5:Q10 ${F('Q5')}.`,
      keys: `Ctrl+G "Comps!P5:P10" ↵ ${q(F('P5'))} Ctrl+↵ Ctrl+G "Comps!Q5:Q10" ↵ ${q(F('Q5'))} Ctrl+↵`, requires: ['formula-operators', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: 'pulse range P5:Q10 · Q21 is the year before, built last lesson.',
      check: (s, ses) => settled(ses) && colsOk(ses) && liveOn(ses, 'Q7', 'G7') },
    { id: 'clearcoat', teach: 'Clearcoat goes on its own row under the set, linked green from the model: FY26E stands in for LTM, as the note in AA17 says. Its margin, growth and leverage then read against the set’s.',
      text: `Clearcoat on row ${r('cc')}: link I${r('cc')}:J${r('cc')} to IS, then its margin, growth and leverage in M${r('cc')}, P${r('cc')} and Q${r('cc')}.`,
      keys: `Ctrl+G "Comps!I${r('cc')}" ↵ ${q(F('I' + r('cc')))} ↵ → ${q(F('J' + r('cc')))} ↵ Ctrl+G "Comps!M${r('cc')}" ↵ ${q(F('M' + r('cc')))} ↵ Ctrl+G "Comps!P${r('cc')}" ↵ ${q(F('P' + r('cc')))} ↵ → ${q(F('Q' + r('cc')))} ↵`,
      requires: ['cross-sheet-ref', 'link-colour-convention', 'go-to', 'arrow-keys'], convention: 'B2',
      hintStuck: `pulse range I${r('cc')}:Q${r('cc')} · FY26E sits in column E on IS; leverage reads net debt from Schedules.`,
      check: (s, ses) => settled(ses) && ccOk(ses) },
    { id: 'note', teach: 'The reason for an exclusion comes from the columns, not from the multiple: a comp is out because it isn’t a peer, never because its number is inconvenient.',
      text: 'Write why Harbor is out in AB9: its growth, its margin and its leverage against the rest of the set.',
      keys: `Ctrl+G "Comps!AB9" ↵ "${cellsIn('B614').AB9.value}" ↵`, requires: ['flagged-set-stats', 'go-to'], convention: 'B6',
      hintStuck: 'pulse cell AB9 · Harbor’s EBITDA is falling, its margin is the lowest and its leverage the highest.',
      check: (s, ses) => settled(ses) && noteOk(ses) },
    { id: 'helper', teach: 'MEDIAN, AVERAGE, MIN and MAX skip text in a range, so a helper column that shows the multiple for an included comp and "" for an excluded one drops the outlier out instead of counting it as zero. You’ll also see =MEDIAN(IF(include=1,multiples)) on other people’s sheets; the helper is the standard here.',
      text: `The helper in O5:O10: ${F('O5')}.`,
      keys: `Ctrl+G "Comps!O5:O10" ↵ ${q(F('O5'))} Ctrl+↵`, requires: ['flagged-set-stats', 'if-function', 'ctrl-enter-fill'],
      hintStuck: 'pulse range O5:O10 · Harbor’s row shows nothing; the other five show their multiple.',
      check: (s, ses) => settled(ses) && helperOk(ses) && liveOn(ses, 'O9', 'N9') },
    { id: 'stats', teach: 'The median is the middle value, and the 25th and 75th percentiles from QUARTILE.INC are the low and high of the range: half the included set sits between them.',
      text: 'Under the helper, O11:O16: MEDIAN, AVERAGE, QUARTILE.INC 1 and 3, MIN and MAX, each on O5:O10.',
      keys: `Ctrl+G "Comps!${OSTAT[0]}" ↵ ${OSTAT.map(ref => q(F(ref))).join(' ↵ ↓ ')} ↵`, requires: ['quartile-range', 'sum-family', 'arrow-keys'],
      hintStuck: `pulse range ${OSTAT[0]}:${OSTAT[5]} · The labels in column B name each row.`,
      check: (s, ses) => settled(ses) && statsOk(ses) && liveOn(ses, OSTAT[0], 'C5') },
    { id: 'side', text: `Beneath margin, growth and leverage: MEDIAN, AVERAGE, MIN and MAX of M, P and Q, rows ${STAT('stMed')}, ${STAT('stMean')}, ${STAT('stMin')} and ${STAT('stMax')}.`,
      keys: `Ctrl+G "Comps!P${STAT('stMed')}:Q${STAT('stMed')}" ↵ ${q(F('P' + STAT('stMed')))} Ctrl+↵ ↓ Shift+→ ${q(F('P' + STAT('stMean')))} Ctrl+↵ ↓ ×3 Shift+→ ${q(F('P' + STAT('stMin')))} Ctrl+↵ ↓ Shift+→ ${q(F('P' + STAT('stMax')))} Ctrl+↵ `
        + `Ctrl+G "Comps!M${STAT('stMed')}" ↵ ${q(F('M' + STAT('stMed')))} ↵ ↓ ${q(F('M' + STAT('stMean')))} ↵ ↓ ×3 ${q(F('M' + STAT('stMin')))} ↵ ↓ ${q(F('M' + STAT('stMax')))} ↵`,
      requires: ['sum-family', 'ctrl-enter-fill', 'shift-arrow', 'arrow-keys'],
      hintStuck: `pulse range M${STAT('stMed')}:Q${STAT('stMax')} · These describe the whole set, Harbor included, so they read the columns directly.`,
      check: (s, ses) => settled(ses) && sideOk(ses) },
    { id: 'flip', teach: 'The outlier’s pull shows when it comes back in: the mean drops by about seven tenths of a turn, the median by a quarter. That is why the range is built on the median.',
      text: `Flip Harbor in: type 1 in N9, read the mean in ${MEAN} and the median in ${OSTAT[0]}, then type 0 again.`,
      keys: 'Ctrl+G "Comps!N9" ↵ "1" ↵ "0" ↵', requires: ['flagged-set-stats', 'go-to'],
      hintStuck: `pulse range ${OSTAT[0]}:${MEAN} · The mean moves from 10.5x to 9.8x; the median from 10.5x to 10.3x.`,
      check: (s, ses) => settled(ses) && flipOk(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Comps!C10" Enter "20" Enter Ctrl+G "Comps!O11" Enter', cadence: 360 },
      text: 'Does it tie? Watch Prairie’s price go from $15.60 to $20.00: its multiple climbs, and the median and the quartiles answer.', requires: [],
      hintStuck: `pulse range ${OSTAT[0]}:${OSTAT[3]} · The statistics read the helper, the helper reads the multiples.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Each comp is flagged in or out in the open, with the reason beside the outlier', check: (s, ses) => flagsOk(ses) && noteOk(ses) },
    { text: 'The statistics run on the helper, so the excluded comp drops out', check: (s, ses) => helperOk(ses) && statsOk(ses) },
    { text: 'Growth, leverage and Clearcoat’s own row sit beside the set', check: (s, ses) => colsOk(ses) && ccOk(ses) && sideOk(ses) },
  ],
  closing: [
    'You have the middle of the set and a range an outlier can’t pull.',
    'Best practice: exclude a comp in the open, with a flag and a reason, never by deleting its row. A reviewer can flip it back in and see what it costs.',
  ],
};
LESSON.solution = solutionOf(LESSON.goals);
export default LESSON;
