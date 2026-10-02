// Chapter 5 · 5.8.P Project: the operating model with its DCF page (clearcoat-model, B5P → DONE)
// The empty shell: Inputs, Data (three historical years, typed and sourced) and the Cover's switch
// and map stand; every formula on the six model sheets is gone, the Cover's flag is not linked and
// WACC is not named. The build runs schedule by schedule, then the three statements, the DCF page
// and the checks, until the flag reads OK. Fifteen goals and the closer, no teach lines: nothing
// here is new. The route is read off the two states (lib/model-build.js): every formula block one
// Ctrl+Enter. Each goal accepts the finished model's formula or any formula landing on its figure.
import { hintToScript } from '../../app/runner.js';
import { blocksOf, blockKeys, pick, built, figures } from './lib/model-build.js';
import { sheetIn, moves } from './lib/model-checks.js';

const ALL = blocksOf('B5P');
const NAME = 'Ctrl+G "DCF!C60" ↵ Alt M M D "WACC" ↵';
const named = ses => (ses.names || {}).WACC === 'DCF!$C$60';
const flagOk = ses => { const c = sheetIn(ses, 'Cover'); return !!c && !!c.cells.C7 && !!c.cells.C7.formula && c.value('C7') === 'OK'; };

/** Each goal: its blocks, the route (keys), the concepts it leans on and the convention it shows. */
const PARTS = [
  { id: 'revenue', blocks: pick(ALL, 'Schedules', 6, 27), text: 'Build the rollout and revenue on Schedules, rows 6 to 27, each row one formula entered across C:J with Ctrl+Enter.',
    requires: ['index-match', 'if-function', 'sum-family'], convention: 'C3' },
  { id: 'costs', blocks: pick(ALL, 'Schedules', 30, 43), text: 'Build the cost build down to EBITDA and its margin on Schedules, rows 30 to 43.',
    requires: ['index-match', 'if-function', 'iferror-function', 'sum-family'], convention: 'C3' },
  { id: 'working-capital', blocks: pick(ALL, 'Schedules', 46, 57), text: 'Build working capital on Schedules, rows 46 to 57: the balances by days, the changes in cash and the cycle.',
    requires: ['index-match', 'if-function', 'iferror-function', 'sum-family'], convention: 'C3' },
  { id: 'ppe', blocks: pick(ALL, 'Schedules', 60, 76), text: 'Build PP&E and the depreciation waterfall on Schedules, rows 60 to 76, each vintage depreciating from the year after it is spent.',
    requires: ['index-match', 'if-function', 'iferror-function', 'sum-family'], convention: 'C3' },
  { id: 'debt', blocks: pick(ALL, 'Schedules', 79, 95), text: 'Build the term loan and the delayed draw on Schedules, rows 79 to 95, interest on the average balance behind the breaker.',
    requires: ['index-match', 'if-function', 'min-max-cap', 'iterative-calc', 'sum-family'], convention: 'C3' },
  { id: 'revolver', blocks: pick(ALL, 'Schedules', 98, 111), text: 'Build the revolver and the debt totals on Schedules, rows 98 to 111, drawing to the minimum cash and repaying from any surplus.',
    requires: ['index-match', 'if-function', 'min-max-cap', 'iterative-calc', 'cross-sheet-ref'], convention: 'C3' },
  { id: 'tax', blocks: pick(ALL, 'Schedules', 114, 121), text: 'Build tax on Schedules, rows 114 to 121, with the loss carried forward and used against later profit.',
    requires: ['if-function', 'min-max-cap', 'iferror-function', 'sum-family', 'cross-sheet-ref'], convention: 'C3' },
  { id: 'is', blocks: pick(ALL, 'IS'), text: 'Build the IS from revenue to net income, history from Data and projections from Schedules.',
    requires: ['index-match', 'if-function', 'iferror-function', 'cross-sheet-ref', 'sum-family'], convention: 'C3' },
  { id: 'cf', blocks: pick(ALL, 'CF'), text: 'Build the cash flow statement: the links from the IS and Schedules, the distribution, the section totals and cash.',
    requires: ['index-match', 'if-function', 'cross-sheet-ref', 'sum-family'], convention: 'B2' },
  { id: 'bs', blocks: pick(ALL, 'BS'), text: 'Build the BS: cash from the cash flow, the balances from Schedules, equity rolled forward, and the balance check.',
    requires: ['index-match', 'if-function', 'cross-sheet-ref', 'sum-family', 'round-function'], convention: 'B2' },
  { id: 'wacc', blocks: pick(ALL, 'DCF', 50, 65), pre: NAME, text: 'Name DCF C60 WACC with Alt M M D, then build the WACC block in DCF rows 50 to 65.',
    requires: ['defined-name', 'cross-sheet-ref', 'formula-basics'], convention: 'C9', also: named },
  { id: 'dcf', blocks: pick(ALL, 'DCF', 5, 47), text: 'Build the DCF in rows 5 to 47: free cash flow, the discount factors, terminal value both ways and the equity bridge.',
    requires: ['cross-sheet-ref', 'sum-family', 'sumproduct', 'case-switch', 'if-function', 'iferror-function'], convention: 'C3' },
  { id: 'sensitivity', blocks: pick(ALL, 'DCF', 68, 81), text: 'Build both sensitivity grids on DCF, rows 68 to 81, each axis stepping from the base case and each cell a live value.',
    requires: ['sumproduct', 'relative-absolute', 'cross-sheet-ref'], convention: 'E2' },
  { id: 'checks', blocks: pick(ALL, 'Checks', 6, 27), text: 'Build the checks on Checks, rows 6 to 27, each a rounded difference that reads 0 when the model ties.',
    requires: ['check-cell', 'round-function', 'countif-countifs', 'cross-sheet-ref', 'npv'], convention: 'F1' },
  { id: 'flag', blocks: [...pick(ALL, 'Checks', 30, 45), ...pick(ALL, 'Cover')], text: 'Count the errors and hardcodes on Checks, roll everything up to the flag in C45, and link the flag to the Cover.',
    requires: ['sumproduct', 'check-cell', 'if-function', 'cross-sheet-ref'], convention: 'F1', also: flagOk },
];
const keysOf = p => [p.pre, ...p.blocks.map(blockKeys)].filter(Boolean).join(' ');
const GOALS = PARTS.map(p => ({ id: p.id, text: p.text, keys: keysOf(p), requires: ['ctrl-enter-fill', 'go-to', ...p.requires], convention: p.convention,
  check: (s, ses) => !ses.editing && !ses.dialog && built(ses, p.blocks) && (!p.also || p.also(ses)) }));

export default {
  id: 'ch5-project',
  chapter: 'finance-and-accounting',
  section: 'Project and assessment',
  module: 'ch5-project-and-assessment',
  workbook: 'clearcoat-model',
  kind: 'project',
  state: { before: 'B5P', after: 'DONE' },
  title: 'Project: the operating model with its DCF page',
  difficulty: 'hard',
  tags: ['project', 'operating model', 'three statements', 'DCF', 'checks'],
  access: 'paid',
  minutes: 15,
  headline: 'Ctrl+Enter',
  conventions: ['C3', 'B2', 'C9', 'E2', 'F1'],
  uses: [...new Set(GOALS.flatMap(g => g.requires))],
  prerequisites: ['challenge-model-speed'],
  brief: 'Fresh inputs, an empty shell, three historical years typed and sourced on Data. Build the schedules, link the three statements, value it on the DCF page and get the flag on the Cover to OK. No clock, and nothing here is new. The key is `Ctrl+Enter`.',
  wow: 'An empty shell in, a three statement model with its DCF out, the flag at OK, and that is Chapter 5.',
  goals: [...GOALS,
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!J22" Enter "300" Enter Ctrl+G "Cover!C7" Enter', cadence: 320 },
      text: 'Does it tie? Watch FY31 washes a day in Inputs J22 go from 250 to 300: every statement moves and the flag on the Cover holds at OK.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') }],
  endState: [
    { text: 'Every schedule and statement lands on the finished model’s figures', check: (s, ses) => figures(ses, ALL.filter(b => b.sheet !== 'DCF')) },
    { text: 'The DCF page values the business, its grids live and WACC named', check: (s, ses) => named(ses) && figures(ses, pick(ALL, 'DCF')) && moves(ses, 'DCF!C42', 'Inputs!J22') },
    { text: 'The flag on the Cover reads OK', check: (s, ses) => flagOk(ses) },
  ],
  closing: [
    'An empty shell in, a model out: seven schedules, three statements linked, a DCF with both terminal values and two grids, and the flag on the Cover at OK.',
    'This is the model a buyer’s team rebuilds before they sign. Now one schedule and its links again, on the clock.',
  ],
  solution: hintToScript(GOALS.map(g => g.keys).join(' ')),
};
