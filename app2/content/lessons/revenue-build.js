// Chapter 5 · 5.3.1 The revenue build (clearcoat-model, B531 → B532)
// The rollout as a corkscrew and the revenue build on Schedules, one formula a row across FY24 to
// FY31 (the actuals read Data through the projection flag), then the revenue tie on Checks. The
// formats and the accountants' labels in column A are planted; the learner writes the formulas.
import { settled, linesBuilt, liveVia, inputRef, plantLines, fillLines, solutionOf } from './lib/model-checks.js';

const AFTER = 'B532';
const S = 'Schedules';
const ROLL = ['openSites', 'newSites', 'closures', 'closeSites'];
const WASH = ['washDayM', 'washDayN', 'washes'];
const SPLIT = ['washDay', 'share', 'retailWashes', 'memberWashes'];
const TICKET = ['ticket', 'tickGrowth', 'retailRev'];
const MEMBERS = ['members', 'clubRev', 'otherRev'];
const TOTAL = ['rev', 'revPerWash'];
const ALL = [...ROLL, 'avgSites', ...WASH, ...SPLIT, ...TICKET, ...MEMBERS, ...TOTAL];
const lines = (ses, keys) => linesBuilt(ses, S, keys, AFTER);

const goals = [
  { id: 'rollout', text: 'Build the rollout in C6:J9 as a corkscrew: opening sites, new sites, closures and closing sites, each through the flag.',
    teach: 'A corkscrew rolls a balance: opening, plus what comes in, less what goes out, is the closing, and the closing is next year’s opening. The rollout rolls this way, and so will PP&E, the debt and equity. One formula a row carries FY24 to FY31: the flag reads Data in an actual year and the drivers in a projected one.',
    keys: fillLines(AFTER, S, ROLL), requires: ['corkscrew', 'go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'cross-sheet-ref'], convention: 'C3',
    hintStuck: 'pulse range C6:J9 · Closing sites is opening plus new plus closures; next year’s opening reads it.',
    check: (s, ses) => settled(ses) && lines(ses, ROLL) && liveVia(ses, S, 'J9', [inputRef('bNew', 'G')]) },
  { id: 'average', text: 'Average sites in the year in C10:J10: the average of the opening and the closing count.',
    keys: fillLines(AFTER, S, ['avgSites']), requires: ['sum-family', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C10:J10 · A site that opens mid-year trades for about half of it.',
    check: (s, ses) => settled(ses) && lines(ses, ['avgSites']) && liveVia(ses, S, 'J10', [inputRef('bNew', 'G')]) },
  { id: 'washes', text: 'Washes a day for a mature and a new site in C13:J14, then a year of washes, in thousands, in C15:J15.',
    teach: 'A driver-based build multiplies inputs a buyer can question: (mature sites × 250 + new sites × 200) × 365 is a year of washes. The model is in thousands, so the line divides by the labeled 1,000 on Inputs and never by a 1000 typed into the formula.',
    keys: fillLines(AFTER, S, WASH), requires: ['driver-build', 'go-to', 'ctrl-enter-fill', 'cross-sheet-ref'], convention: 'B4',
    hintStuck: 'pulse range C13:J15 · Opening sites wash at the mature rate, new sites at the ramp rate.',
    check: (s, ses) => settled(ses) && lines(ses, WASH) && liveVia(ses, S, 'J15', [inputRef('days')]) },
  { id: 'split', text: 'Split the washes in C16:J19: washes a day per average site, the member share, retail washes and member washes.',
    keys: fillLines(AFTER, S, SPLIT), requires: ['driver-build', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C16:J19 · The share reads the live drivers block, so a case change reaches it.',
    check: (s, ses) => settled(ses) && lines(ses, SPLIT) && liveVia(ses, S, 'J18', [inputRef('bShare', 'J')]) },
  { id: 'ticket', text: 'The retail ticket, its growth and retail revenue in C20:J22: the ticket grows off the prior year by the live driver.',
    keys: fillLines(AFTER, S, TICKET), requires: ['driver-build', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C20:J22 · Last year’s ticket times one plus the growth driver.',
    check: (s, ses) => settled(ses) && lines(ses, TICKET) && liveVia(ses, S, 'J22', [inputRef('bTick', 'G')]) },
  { id: 'members', text: 'Average members, membership revenue and other revenue in C23:J25.',
    keys: fillLines(AFTER, S, MEMBERS), requires: ['driver-build', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C23:J25 · Members are member washes over washes a member a month, times twelve.',
    check: (s, ses) => settled(ses) && lines(ses, MEMBERS) && liveVia(ses, S, 'J24', [inputRef('fee')]) },
  { id: 'total', text: 'Total revenue and revenue per wash in C26:J27; FY26 reads $13.89, the figure on the Chapter 2 P&L.',
    keys: fillLines(AFTER, S, TOTAL), requires: ['go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C26:J27 · Revenue per wash is total revenue over washes, both in thousands.',
    check: (s, ses) => settled(ses) && lines(ses, TOTAL) && liveVia(ses, S, 'J26', [inputRef('fee')]) },
  { id: 'check', text: 'On Checks, tie the income statement’s revenue to the build in C10:J10 with a ROUND around the difference.',
    teach: 'The actual years read zero now. The projected years show the whole build until the income statement is linked to it in the next module, and then they read zero too.',
    keys: fillLines(AFTER, 'Checks', ['rev']), requires: ['check-cell', 'round-function', 'cross-sheet-ref', 'go-to', 'ctrl-enter-fill'], convention: 'F1',
    hintStuck: 'pulse range Checks!C10:J10 · IS revenue less the build’s total revenue, rounded to two places.',
    check: (s, ses) => settled(ses) && linesBuilt(ses, 'Checks', ['rev'], AFTER) },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!G21" Enter "8" Enter Ctrl+G "Schedules!G26" Enter', cadence: 320 },
    text: 'Does it tie? Watch two more sites go into FY28 on the Base case row of Inputs, and revenue answer from FY28 on.', requires: [],
    hintStuck: 'pulse range Schedules!G26:J26 · Every line from the rollout down reads the new count.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'revenue-build',
  chapter: 'finance-and-accounting',
  section: 'Schedules',
  module: 'schedules',
  workbook: 'clearcoat-model',
  state: { before: 'B531', after: AFTER },
  plant: { ...plantLines(AFTER, S, ALL), ...plantLines(AFTER, 'Checks', ['rev']), 'Checks!K10': null },
  title: 'The revenue build: sites × washes × days × ticket, plus members × fee',
  difficulty: 'hard',
  tags: ['model', 'schedules', 'revenue', 'corkscrew'],
  access: 'paid',
  minutes: 7,
  headline: '=',
  conventions: ['C3', 'B4', 'F1'],
  teaches: ['corkscrew', 'driver-build'],
  uses: ['go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'cross-sheet-ref', 'sum-family', 'check-cell', 'round-function'],
  prerequisites: ['challenge-model-shell'],
  brief: 'Revenue is built from its drivers, never typed: sites from the rollout, washes a day per site, days in the year and the retail ticket, plus members times the fee. Every driver sits on Inputs and every line on Schedules is a formula, one a row, with the actual years reading Data through the projection flag. Build the rollout and the revenue build, then tie revenue on Checks. The key is `=`.',
  goals,
  endState: [
    { text: 'The rollout and the revenue build are built across FY24 to FY31, and the revenue tie is on Checks', check: (s, ses) => lines(ses, ALL) && linesBuilt(ses, 'Checks', ['rev'], AFTER) },
  ],
  closing: [
    'Revenue is built from sites, washes and tickets now, and a buyer can change any of them.',
    'Best practice: a driver-based build is what a buyer will change. A revenue line that grows 8% a year is a number nobody can question or believe.',
  ],
  solution: solutionOf(goals),
};
