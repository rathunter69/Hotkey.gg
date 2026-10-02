// Chapter 5 · 5.3.4 PP&E: capex per new site and the depreciation waterfall (clearcoat-model, B534 → B535)
// Capex from the rollout and revenue, the FY26 base depreciated over its remaining life, a waterfall
// with one row per projected year's capex, the total that feeds depreciation, the PP&E roll-forward
// as a corkscrew, and two memos: capex over depreciation, and the implied life of the base.
import { settled, linesBuilt, liveVia, inputRef, plantLines, fillLines, solutionOf } from './lib/model-checks.js';

const AFTER = 'B535';
const S = 'Schedules';
const CAPEX = ['capexNew', 'capexMaint', 'capexTotal'];
const WATERFALL = ['wf1', 'wf2', 'wf3', 'wf4', 'wf5'];
const ROLL = ['ppeOpen', 'ppeClose'];
const ALL = [...CAPEX, 'wfBase', ...WATERFALL, 'wfTotal', 'dep', ...ROLL, 'capexToDep', 'impliedLife'];
const lines = (ses, keys, cols) => linesBuilt(ses, S, keys, AFTER, cols);
const live = (ses, ref, key) => liveVia(ses, S, ref, [inputRef(key)]);

const goals = [
  { id: 'capex', text: 'Capex in C61:J63: new sites × capex per site, maintenance capex as 2% of revenue, and the total.',
    teach: 'Capex per site is the building, the tunnel and the equipment, $2.5m, the part that wears out over twenty years. The land under a new site is rented, and the land Clearcoat owns sits on the balance sheet at cost, outside this schedule: land is never depreciated, and no resale value is assumed at the end.',
    keys: fillLines(AFTER, S, CAPEX), requires: ['driver-build', 'go-to', 'ctrl-enter-fill', 'index-match', 'if-function'], convention: 'C3',
    hintStuck: 'pulse range C61:J63 · New sites are on row 7, revenue on row 26.',
    check: (s, ses) => settled(ses) && lines(ses, CAPEX) && live(ses, 'J63', 'capexSite') },
  { id: 'base', text: 'The existing base in C70:J70: FY26’s net PP&E from Data over its remaining life, in the projected years only.',
    keys: fillLines(AFTER, S, ['wfBase']), requires: ['index-match', 'if-function', 'go-to', 'ctrl-enter-fill'], convention: 'B4',
    hintStuck: 'pulse range C70:J70 · The flag is 1 in a projected year; $E$4 pins the year to FY26.',
    check: (s, ses) => settled(ses) && lines(ses, ['wfBase']) && live(ses, 'J70', 'remLife') },
  { id: 'waterfall', text: 'The waterfall in C71:J75: each projected year’s capex over its 20-year life, from the year after it is spent.',
    teach: 'One row per year of capex, each anchored to its own year’s capex ($F$63 for FY27) and switched on by the projection counter from the following year. Read down a column and you see what each vintage costs that year; read across a row and you see one year’s capex wear out.',
    keys: fillLines(AFTER, S, WATERFALL), requires: ['depreciation-waterfall', 'relative-absolute', 'if-function', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C71:J75 · Each row anchors its own capex cell; the counter starts it the year after.',
    check: (s, ses) => settled(ses) && lines(ses, WATERFALL) && live(ses, 'J71', 'capexSite') },
  { id: 'depreciation', text: 'Total depreciation down the waterfall in C76:J76, and the depreciation line in C64:J64 reading it through the flag.',
    keys: fillLines(AFTER, S, ['wfTotal', 'dep']), requires: ['depreciation-waterfall', 'sum-family', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C76:J76 · A SUM down the base and the five vintages.',
    check: (s, ses) => settled(ses) && lines(ses, ['wfTotal', 'dep']) && live(ses, 'J64', 'capexSite') },
  { id: 'roll', text: 'Roll PP&E forward in C60:J65: opening is last year’s closing, closing is opening plus capex less depreciation.',
    keys: fillLines(AFTER, S, ROLL), requires: ['corkscrew', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C60:J65 · The same corkscrew as the rollout, with capex in and depreciation out.',
    check: (s, ses) => settled(ses) && lines(ses, ROLL) && live(ses, 'J65', 'capexSite') },
  { id: 'memos', text: 'Two memos: capex over depreciation in C66:J66, and in C67 the life the FY26 base implies.',
    teach: 'Capex runs at several times depreciation while the rollout lasts and heads toward one after it, which says FY31 isn’t a steady year yet. The implied life, gross depreciable PP&E over FY26 depreciation with the land left out, should land near the 20 years on Inputs; a figure far off means the life or the base is wrong.',
    keys: `${fillLines(AFTER, S, ['capexToDep'])} ${fillLines(AFTER, S, ['impliedLife'], ['C'])}`, requires: ['iferror-function', 'go-to', 'ctrl-enter-fill'], convention: 'F4',
    hintStuck: 'pulse range C66:J67 · Total capex over depreciation; Inputs’ gross base over FY26 depreciation.',
    check: (s, ses) => settled(ses) && lines(ses, ['capexToDep']) && lines(ses, ['impliedLife'], ['C']) && live(ses, 'J66', 'capexSite') && live(ses, 'C67', 'gross') },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C61" Enter "3000" Enter Ctrl+G "Schedules!F65" Enter', cadence: 320 },
    text: 'Does it tie? Watch capex per site go to $3.0m: capex moves in every rollout year, depreciation from the year after.', requires: [],
    hintStuck: 'pulse range Schedules!F63:J65 · A vintage starts wearing out the year after it is bought.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'ppe-and-depreciation',
  chapter: 'finance-and-accounting',
  section: 'Schedules',
  module: 'schedules',
  workbook: 'clearcoat-model',
  state: { before: 'B534', after: AFTER },
  plant: plantLines(AFTER, S, ALL),
  title: 'PP&E: capex per new site and the depreciation waterfall',
  difficulty: 'hard',
  tags: ['model', 'schedules', 'PP&E', 'capex', 'depreciation'],
  access: 'paid',
  minutes: 7,
  headline: '=',
  conventions: ['C3', 'B4', 'F4'],
  teaches: ['depreciation-waterfall'],
  uses: ['go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'iferror-function', 'sum-family', 'relative-absolute', 'corkscrew', 'driver-build'],
  prerequisites: ['working-capital-schedule'],
  brief: 'The tunnels are the balance sheet’s biggest line, and they roll: opening PP&E plus capex less depreciation is closing PP&E. Capex is new sites × $2.5m plus maintenance at 2% of revenue; depreciation is the existing base over its remaining life plus each year’s capex over twenty years. The waterfall lays each year’s capex on its own row, so the total is a SUM down a column. Build capex, the waterfall and the roll-forward. The key is `=`.',
  goals,
  endState: [
    { text: 'Capex, the waterfall, depreciation and the PP&E roll-forward are built, with both memos', check: (s, ses) => lines(ses, ALL.filter(k => k !== 'impliedLife')) && lines(ses, ['impliedLife'], ['C']) },
  ],
  closing: [
    'The tunnels roll forward, and each year’s capex wears out on its own row.',
    'Closing PP&E is the line the balance sheet will read, and the check on Checks waits for it. Best practice: a waterfall shows where depreciation comes from, which one rate on the whole balance never can.',
  ],
  solution: solutionOf(goals),
};
