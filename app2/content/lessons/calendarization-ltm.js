// Chapter 6 · 6.1.2 Calendarization and LTM (clearcoat-valuation, B612 → B613)
// The quarters block holds eight quarters of EBITDA per comp, typed, with the first period end and
// the two fiscal-year totals. The learner dates the quarters, sets the LTM date and its windows,
// builds LTM and the year before with SUMIFS on the dates, calendarizes the March years, links the
// built LTM into the spread in place of the given one, and checks LTM the filings' way. Graded on
// the figures the page's formulas give on the learner's own cells; live where the goal says so.
import { settled, built, liveOn, comps, lacks, formatsAt, cellsAt, down, formulaOf, q, solutionOf, R } from './lib/comps-checks.js';

const F = ref => formulaOf(ref);
const QK = ['q0', 'q1', 'q2', 'q3', 'q4', 'q5'];
const qd = col => QK.map(k => col + R(k));
const HDR = R('q0') - 1;
const DATES = ['D', 'E', 'F', 'G', 'H', 'I', 'J'].map(c => c + HDR);
const HEADS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'].map(c => c + HDR);
const [LTMD, START, PRIOR] = ['ltmDate', 'ltmStart', 'priorStart'].map(k => 'C' + R(k));
const P0 = 'P' + R('q0'), R0 = 'R' + R('q0'), S0 = 'S' + R('q0');
const datesOk = ses => built(ses, DATES);
const windowOk = ses => { const sh = comps(ses); return !!sh && !sh.formula(LTMD) && sh.value(LTMD) === 46203 && built(ses, [START, PRIOR]); };
const ltmOk = ses => built(ses, qd('P'));
const priorOk = ses => built(ses, qd('Q'));
const calOk = ses => built(ses, [...qd('N'), ...qd('O')]);
const linkOk = ses => built(ses, down('J')) && lacks(ses, down('J'), 'fontColor', 'blue');
const filingsOk = ses => built(ses, [R0, S0]) && comps(ses).value(S0) === 0;

const LESSON = {
  id: 'calendarization-ltm',
  chapter: 'valuation',
  section: 'Trading comps',
  module: 'trading-comps',
  workbook: 'clearcoat-valuation',
  state: { before: 'B612', after: 'B613' },
  // the headers of the block arrive written; every cell the learner fills arrives in the page's format
  plant: { ...cellsAt('B613', HEADS), ...formatsAt('B613', [...DATES, LTMD, START, PRIOR, ...['N', 'O', 'P', 'Q'].flatMap(qd), R0, S0]) },
  title: 'Calendarization and LTM',
  difficulty: 'hard',
  tags: ['valuation', 'comps', 'LTM'],
  access: 'paid',
  minutes: 7,
  headline: 'SUM',
  conventions: ['B4', 'B1', 'F1', 'C3'],
  teaches: ['ltm', 'calendarization'],
  uses: ['go-to', 'eomonth-edate', 'ctrl-enter-fill', 'sumif-sumifs', 'date-window', 'f4-anchor', 'year-month-day', 'paste-special', 'copy-cut-paste', 'round-function', 'check-cell', 'arrow-keys'],
  prerequisites: ['spreading-a-comp'],
  brief: 'Two of the six report to March, and a multiple on a year that ended six months apart isn’t comparable. LTM (the last twelve months) fixes it: the last four quarters, whatever the fiscal year, so every company is measured to the same date. Calendarization restates a fiscal year onto a calendar year by weighting two fiscal years by the months each contributes. Build LTM EBITDA from the quarters and calendarize the two March companies. The key is `SUM`.',
  goals: [
    { id: 'dates', teach: 'Below the spread, each comp’s last eight quarters of EBITDA sit by period end, with only the first end typed. The rest are formulas, each quarter end three months after the last.',
      text: `Date the quarters: D${HDR}:J${HDR} ${F('D' + HDR)}, written once with Ctrl+Enter.`,
      keys: `Ctrl+G "Comps!D${HDR}:J${HDR}" ↵ ${q(F('D' + HDR))} Ctrl+↵`, requires: ['eomonth-edate', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range D${HDR}:J${HDR} · Each reads the date to its left.`,
      check: (s, ses) => settled(ses) && datesOk(ses) && liveOn(ses, 'J' + HDR, 'C' + HDR) },
    { id: 'window', teach: 'LTM runs to one date, and that date is one input cell: every LTM formula reads it, so the set rolls forward in one edit. The window opens twelve months before it, and the year before opens twenty-four months before.',
      text: `Type the LTM date 6/30/2026 in ${LTMD}, then ${START} ${F(START)} and ${PRIOR} ${F(PRIOR)}.`,
      keys: `Ctrl+G "Comps!${LTMD}" ↵ "6/30/2026" ↵ ↓ ${q(F(START))} ↵ ↓ ${q(F(PRIOR))} ↵`, requires: ['ltm', 'eomonth-edate', 'f4-anchor', 'arrow-keys'], convention: 'B4',
      hintStuck: `pulse range ${LTMD}:${PRIOR} · The date is typed and blue; the two below it count back from it.`,
      check: (s, ses) => settled(ses) && windowOk(ses) && liveOn(ses, PRIOR, LTMD) },
    { id: 'ltm', teach: 'LTM EBITDA is the sum of the quarters that end after the window opens and on or before the LTM date. A SUMIFS on the date row picks them, so the same formula works for a December year and a March one.',
      text: `LTM EBITDA in P${R('q0')}:P${R('q5')}: a SUMIFS of each row’s quarters dated after ${START} and up to ${LTMD}.`,
      keys: `Ctrl+G "Comps!P${R('q0')}:P${R('q5')}" ↵ ${q(F(P0))} Ctrl+↵`, requires: ['ltm', 'sumif-sumifs', 'date-window', 'f4-anchor', 'ctrl-enter-fill'],
      hintStuck: `pulse range P${R('q0')}:P${R('q5')} · The dates row is anchored with $, the quarters row is not.`,
      check: (s, ses) => settled(ses) && ltmOk(ses) && liveOn(ses, P0, LTMD) },
    { id: 'prior', text: `The year before in Q${R('q0')}:Q${R('q5')}: the same SUMIFS on the window from ${PRIOR} to ${START}.`,
      keys: `Ctrl+G "Comps!Q${R('q0')}:Q${R('q5')}" ↵ ${q(F('Q' + R('q0')))} Ctrl+↵`, requires: ['sumif-sumifs', 'date-window', 'ctrl-enter-fill'],
      hintStuck: `pulse range Q${R('q0')}:Q${R('q5')} · Next lesson reads growth from this column.`,
      check: (s, ses) => settled(ses) && priorOk(ses) && liveOn(ses, 'Q' + R('q0'), LTMD) },
    { id: 'cal', teach: 'A March company’s fiscal 2026 holds nine months of calendar 2025, so calendar 2025 is three twelfths of fiscal 2025 plus nine twelfths of fiscal 2026. The weight comes from the year end cell, never typed into the formula, so a December year gets twelve twelfths and the two weights always total 100%.',
      text: `Calendarize: N${R('q0')}:N${R('q5')} ${F('N' + R('q0'))}, and calendar 2025 in O${R('q0')}:O${R('q5')} ${F('O' + R('q0'))}.`,
      keys: `Ctrl+G "Comps!N${R('q0')}:N${R('q5')}" ↵ ${q(F('N' + R('q0')))} Ctrl+↵ Ctrl+G "Comps!O${R('q0')}:O${R('q5')}" ↵ ${q(F('O' + R('q0')))} Ctrl+↵`,
      requires: ['calendarization', 'year-month-day', 'ctrl-enter-fill'], convention: 'B4',
      hintStuck: `pulse range N${R('q1')}:O${R('q1')} · Riverbend’s year ends March 31, so its weight is 25%.`,
      check: (s, ses) => settled(ses) && calOk(ses) && liveOn(ses, 'O' + R('q1'), 'M' + R('q1')) },
    { id: 'link', teach: 'The spread now reads the built LTM instead of the typed one. A formula is black, so the blue goes: Paste Special, Formats from column H carries the page’s look without touching the formulas.',
      text: 'Replace the given LTM: J5:J10 =P21, then copy H5:H10 and paste its formats over J5 with Ctrl+Alt+V, T.',
      keys: `Ctrl+G "Comps!J5:J10" ↵ "=P${R('q0')}" Ctrl+↵ Ctrl+G "Comps!H5:H10" ↵ Ctrl+C Ctrl+G "Comps!J5" ↵ Ctrl+Alt+V T ↵`,
      requires: ['paste-special', 'copy-cut-paste', 'ctrl-enter-fill', 'go-to'], convention: 'B1',
      hintStuck: 'pulse range J5:J10 · The multiples in L5:L10 update as the links land.',
      check: (s, ses) => settled(ses) && linkOk(ses) && liveOn(ses, 'J5', 'J' + R('q0')) },
    { id: 'filings', teach: 'Filings give LTM another way: the last full fiscal year, plus this year’s quarters so far, less the same quarters a year earlier. For Pinnacle that is fiscal 2025 plus the March and June quarters of 2026, less the same two of 2025, and a live difference against the SUMIFS reads zero.',
      text: `The filings route for Pinnacle: ${R0} ${F(R0)}, and ${S0} ${F(S0)} reads 0.`,
      keys: `Ctrl+G "Comps!${R0}" ↵ ${q(F(R0))} ↵ → ${q(F(S0))} ↵`, requires: ['ltm', 'round-function', 'check-cell', 'go-to', 'arrow-keys'], convention: 'F1',
      hintStuck: `pulse range ${R0}:${S0} · K${R('q0')} is fiscal 2025; I and J hold 2026’s two quarters, E and F 2025’s.`,
      check: (s, ses) => settled(ses) && filingsOk(ses) && liveOn(ses, R0, 'J' + R('q0')) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "Comps!${LTMD}" Enter "3/31/2026" Enter Ctrl+G "Comps!${P0}" Enter`, cadence: 360 },
      text: `Does it tie? Watch the LTM date in ${LTMD} move back a quarter to 3/31/2026: every LTM figure, and every multiple above, shifts.`, requires: [],
      hintStuck: `pulse range P${R('q0')}:P${R('q5')} · One input cell rolls the whole set.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Every LTM figure is the last four quarters to the one LTM date, and the spread reads it', check: (s, ses) => windowOk(ses) && ltmOk(ses) && linkOk(ses) },
    { text: 'The March years are calendarized with weights read from the year end', check: (s, ses) => calOk(ses) },
    { text: 'The filings route agrees with the SUMIFS', check: (s, ses) => filingsOk(ses) },
  ],
  closing: [
    'Every company is measured to the same date, whatever its fiscal year.',
    'Best practice: the LTM date is one input cell on the sheet, and every LTM formula reads it. Next quarter, one edit rolls the set forward.',
  ],
};
LESSON.solution = solutionOf(LESSON.goals);
export default LESSON;
