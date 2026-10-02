// Chapter 5 · 5.4.1 The income statement from the schedules (clearcoat-model, B541 → B542)
// Every line of the IS becomes one formula a row: the flag reads Data in an actual year and the
// schedule's last line in a projected one, signs turned for costs. The subtotals already run in the
// actual years, so they are written across FY27 to FY31; the margins are rewritten across all eight.
// The look (green links, italic margins, the A/E divider) is planted; the learner writes the links.
import { settled, linesBuilt, liveVia, inputRef, plantLines, fillLines, solutionOf, COLS, PROJ_COLS } from './lib/model-checks.js';

const AFTER = 'B542';
const S = 'IS';
const REV = ['retail', 'club', 'other'];
const SITE = ['labor', 'rent', 'util', 'maint', 'card', 'mkt'];
// [keys over C:J, keys over F:J] for each goal
const PARTS = {
  revenue: [REV, ['rev']],
  gross: [['cos'], ['gp']],
  gmargin: [['gm'], []],
  site: [SITE, ['siteCosts', 'contrib']],
  cmargin: [['cm'], []],
  ebitda: [['ho'], ['ebitda']],
  emargin: [['em'], []],
  below: [['dep'], ['ebit']],
  interest: [['int'], ['ebt']],
  tax: [['tax'], ['ni']],
  nmargin: [['nm'], []],
};
const lines = (ses, ...ids) => ids.every(id => linesBuilt(ses, S, PARTS[id][0], AFTER, COLS) && linesBuilt(ses, S, PARTS[id][1], AFTER, PROJ_COLS));
const keysOf = (...ids) => ids.map(id => [PARTS[id][0].length ? fillLines(AFTER, S, PARTS[id][0]) : '', PARTS[id][1].length ? fillLines(AFTER, S, PARTS[id][1], PROJ_COLS) : ''].filter(Boolean).join(' ')).join(' ');
const live = (ses, ref, key, col) => liveVia(ses, S, ref, [inputRef(key, col)]);

const goals = [
  { id: 'revenue', text: 'The three revenue lines in C5:J7, each reading Data or the revenue build through the flag, then total revenue in F8:J8.',
    teach: 'Each statement line is one formula a row: IF the flag is 0, the INDEX/MATCH on Data, otherwise a link to the schedule’s line, and Ctrl+Enter carries it across all eight years. A tip from the desk: Alt W N opens a second window on the same file and Alt W A arranges the two side by side, so the IS and the schedule it reads sit next to each other while you point.',
    keys: keysOf('revenue'), requires: ['statement-links', 'index-match', 'if-function', 'cross-sheet-ref', 'sum-family', 'go-to', 'ctrl-enter-fill'], convention: 'C3',
    hintStuck: 'pulse range C5:J7 · The revenue build’s lines are on Schedules, rows 22, 24 and 25.',
    check: (s, ses) => settled(ses) && lines(ses, 'revenue') && live(ses, 'J8', 'newWash') },
  { id: 'gross', text: 'Cost of sales in C9:J9 from the cost build as a negative, gross profit in F10:J10 and the gross margin in C11:J11.',
    keys: keysOf('gross', 'gmargin'), requires: ['statement-links', 'iferror-function', 'go-to', 'ctrl-enter-fill'], convention: 'C4',
    hintStuck: 'pulse range C9:J9 · Costs carry a minus on the statement; the build holds them as positives.',
    check: (s, ses) => settled(ses) && lines(ses, 'gross', 'gmargin') && live(ses, 'J10', 'bCos', 'J') },
  { id: 'site', text: 'The six site-cost lines in C13:J18, then site costs and site contribution in F19:J20 and the margin in C21:J21.',
    keys: keysOf('site', 'cmargin'), requires: ['statement-links', 'sum-family', 'iferror-function', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C13:J18 · Labor to marketing are Schedules rows 32 to 37; rent sums its Data lines.',
    check: (s, ses) => settled(ses) && lines(ses, 'site', 'cmargin') && live(ses, 'J20', 'rent') },
  { id: 'ebitda', text: 'Head office in C23:J23, EBITDA in F24:J24 and the EBITDA margin in C25:J25.',
    keys: keysOf('ebitda', 'emargin'), requires: ['statement-links', 'iferror-function', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C23:J23 · Head office is Schedules row 41, with the sign turned.',
    check: (s, ses) => settled(ses) && lines(ses, 'ebitda', 'emargin') && live(ses, 'J24', 'hoStep') },
  { id: 'below', text: 'Depreciation in C26:J26 from PP&E, EBIT in F27:J27, interest in C28:J28 from the debt schedule and EBT in F29:J29.',
    keys: keysOf('below', 'interest'), requires: ['statement-links', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C26:J29 · Depreciation is Schedules row 64; total interest is row 110.',
    check: (s, ses) => settled(ses) && lines(ses, 'below', 'interest') && live(ses, 'J27', 'capexSite') && live(ses, 'J29', 'termRate') },
  { id: 'net', text: 'Tax in C30:J30 from the tax schedule, net income in F31:J31 and the net margin in C32:J32.',
    keys: keysOf('tax', 'nmargin'), requires: ['statement-links', 'iferror-function', 'go-to', 'ctrl-enter-fill'], convention: 'B4',
    hintStuck: 'pulse range C30:J32 · The tax charge is Schedules row 120; net income is EBT plus tax.',
    check: (s, ses) => settled(ses) && lines(ses, 'tax', 'nmargin') && live(ses, 'J31', 'tax') },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!G21" Enter "8" Enter Ctrl+G "IS!J31" Enter', cadence: 320 },
    text: 'Does it tie? Watch two more sites go into FY28 on the Base case row of Inputs, and FY31 net income answer.', requires: [],
    hintStuck: 'pulse range IS!G31:J31 · The rollout reaches revenue, costs, depreciation and tax on its way down.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

const ALL_C = Object.values(PARTS).flatMap(p => p[0]);
const ALL_F = Object.values(PARTS).flatMap(p => p[1]);

export default {
  id: 'is-from-schedules',
  chapter: 'finance-and-accounting',
  section: 'Linking the statements',
  module: 'linking-the-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B541', after: AFTER },
  plant: { ...plantLines(AFTER, S, ALL_C), ...plantLines(AFTER, S, ALL_F, PROJ_COLS) },
  title: 'The income statement from the schedules',
  difficulty: 'medium',
  tags: ['model', 'statements', 'income statement', 'linking'],
  access: 'paid',
  minutes: 7,
  headline: '=',
  conventions: ['C3', 'C4', 'B4'],
  teaches: ['statement-links'],
  uses: ['go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'iferror-function', 'cross-sheet-ref', 'sum-family'],
  prerequisites: ['challenge-schedules'],
  brief: 'Every projected line of the income statement is a link to a schedule: revenue from the revenue build, costs from the cost build, depreciation from PP&E, interest from debt, tax from the tax schedule. The actual years read Data in the same one-formula row, and the flag decides which one a column shows. Link the statement top to bottom and read net income for FY31. The key is `=`.',
  goals,
  endState: [
    { text: 'Every line of the income statement reads Data or its schedule, from revenue to the net margin', check: (s, ses) => lines(ses, ...Object.keys(PARTS)) },
  ],
  closing: [
    'The income statement reads the schedules, and net income is a formula eight years long.',
    'Best practice: one formula a row, history and projection alike, so the only typed numbers in the model sit on Data and Inputs.',
  ],
  solution: solutionOf(goals),
};
