// Chapter 5 · 5.8.A Assessment: one schedule and the links from it, fifteen minutes (seeded over B5A; also the test-out)
// The finished model with the debt schedule and every link from it emptied (formats kept): the term
// loan, the delayed draw, the revolver and the debt totals on Schedules, interest on the IS, the
// draws and repayments on the cash flow, the closing balances on the BS. The seed sets fresh debt
// terms on Inputs (the rates, the amortization, the delayed draw, the minimum cash), so the route
// never depends on the numbers: each goal accepts the finished model's formula, or any formula
// landing on the figure the finished model gives on the learner's own inputs.
import { hintToScript } from '../../app/runner.js';
import { parsFrom } from '../../app/pars.js';
import { stateOf } from '../workbooks/clearcoat-model.js';
import { blocksOf, blockKeys, pick, built, figures } from './lib/model-build.js';
import { sheetIn, finished, moves } from './lib/model-checks.js';

const ALL = blocksOf('B5A');
/** The seeded debt terms on Inputs: ref → [low, high, step]. */
const TERMS = { C73: [0.06, 0.08, 0.005], C74: [2500, 3500, 250], F75: [10000, 15000, 500], C76: [0.065, 0.085, 0.005], C78: [0.07, 0.09, 0.005], C80: [4000, 6000, 500] };
const SEEDED = [...Object.keys(TERMS), 'G75'];
let INPUTS = null;
const inputCell = ref => { INPUTS = INPUTS || stateOf('DONE').sheets.find(s => s.name === 'Inputs').cells; return INPUTS[ref]; };

/** The seed: fresh debt terms, each a step on its range (the delayed draw lands the same in FY27 and FY28). */
export function freshTerms(rng) {
  const p = {};
  for (const [ref, [lo, hi, by]] of Object.entries(TERMS)) {
    const v = Math.round((lo + Math.floor(rng() * (Math.round((hi - lo) / by) + 1)) * by) * 1e6) / 1e6;
    p['Inputs!' + ref] = { ...inputCell(ref), value: v };
    if (ref === 'F75') p['Inputs!G75'] = { ...inputCell('G75'), value: v };
  }
  return p;
}
/** The finished model run on the debt terms the learner's Inputs hold now. */
const want = ses => { const I = sheetIn(ses, 'Inputs'); return finished(Object.fromEntries(SEEDED.map(r => ['Inputs!' + r, { ...inputCell(r), value: I.cells[r] ? I.cells[r].value : null }]))); };
const balanced = ses => { const c = sheetIn(ses, 'Checks'); return !!c && ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].every(col => c.value(col + '6') === 0) && c.value('C45') === 'OK'; };

const PARTS = [
  { id: 'term-balance', blocks: pick(ALL, 'Schedules', 79, 82), text: 'Build the term loan on Schedules, rows 79 to 82: opening, drawn, repaid at the scheduled amortization or the balance if less, closing.' },
  { id: 'term-interest', blocks: pick(ALL, 'Schedules', 83, 85), text: 'Add the term loan’s average balance, its interest behind the breaker, and the effective rate in Schedules C83:J85.' },
  { id: 'dd-balance', blocks: pick(ALL, 'Schedules', 88, 92), text: 'Build the delayed draw on Schedules, rows 88 to 92: opening, draws to date, drawn, repaid and closing.' },
  { id: 'dd-interest', blocks: pick(ALL, 'Schedules', 93, 95), text: 'Add the delayed draw’s average balance, its interest behind the breaker, and the effective rate in Schedules C93:J95.' },
  { id: 'revolver', blocks: pick(ALL, 'Schedules', 98, 103), text: 'Build the revolver in Schedules C98:J103: cash before it, the minimum, a draw to cover a gap and a repayment from a surplus.' },
  { id: 'rev-interest', blocks: pick(ALL, 'Schedules', 104, 106), text: 'Add the revolver’s average balance, its interest behind the breaker, and the effective rate in Schedules C104:J106.' },
  { id: 'totals', blocks: pick(ALL, 'Schedules', 109, 111), text: 'Total the debt and the interest in rows 109 and 110, and net debt against the BS cash in row 111.' },
  { id: 'is', blocks: pick(ALL, 'IS'), text: 'Link interest on the IS, row 28, to the total on Schedules, as a cost, through the projection flag.' },
  { id: 'cf', blocks: pick(ALL, 'CF'), text: 'Link the draws and repayments on CF: the term loan in C18:J19, the delayed draw in C20:J21, the revolver in C24:J24.' },
  { id: 'bs', blocks: pick(ALL, 'BS'), text: 'Link the three closing balances to the BS, rows 15 to 17, until the balance check reads 0 in every year.' },
];
const REQUIRES = ['ctrl-enter-fill', 'go-to', 'cross-sheet-ref', 'if-function', 'min-max-cap', 'iterative-calc', 'sum-family', 'iferror-function', 'index-match'];
const GOALS = PARTS.map(p => ({ id: p.id, text: p.text, keys: p.blocks.map(blockKeys).join(' '), requires: REQUIRES, convention: p.id === 'cf' || p.id === 'bs' || p.id === 'is' ? 'B2' : 'C3',
  check: (s, ses) => !ses.editing && !ses.dialog && built(ses, p.blocks, want(ses)) }));

export const GRADERS = [
  ses => figures(ses, ALL.filter(b => b.sheet === 'Schedules'), want(ses)) ? { ok: true } : { ok: false, why: 'the debt schedule does not reach the finished figures on these terms. Each tranche is a corkscrew, and interest reads the average balance behind the breaker' },
  ses => figures(ses, ALL.filter(b => b.sheet !== 'Schedules'), want(ses)) && moves(ses, 'IS!G28', 'Inputs!C76') && moves(ses, 'BS!G16', 'Inputs!F75') && moves(ses, 'CF!F20', 'Inputs!F75') ? { ok: true } : { ok: false, why: 'a link from the schedule is missing. Interest goes to the IS, draws and repayments to the cash flow, closing balances to the BS' },
  ses => balanced(ses) ? { ok: true } : { ok: false, why: 'the balance check is not 0 in every year, so the flag does not read OK' },
];

export default {
  id: 'ch5-assessment',
  chapter: 'finance-and-accounting',
  section: 'Project and assessment',
  module: 'ch5-project-and-assessment',
  workbook: 'clearcoat-model',
  state: { before: 'B5A' },
  kind: 'assessment',
  title: 'Assessment: one schedule and the links from it, fifteen minutes',
  difficulty: 'hard',
  tags: ['assessment', 'debt schedule', 'revolver', 'linking', 'circularity'],
  access: 'paid',
  minutes: 15,
  headline: 'Ctrl+Enter',
  conventions: ['C3', 'B2'],
  uses: REQUIRES,
  prerequisites: ['ch5-project'],
  brief: 'The model is built except its debt: the two tranches, the revolver and every link from them are empty, and the lenders have sent fresh terms. Build the schedule with the breaker, link interest to the IS, the draws and repayments to the cash flow and the balances to the BS, until the balance check reads 0 in every year. No help, the keyboard only. Pass, and the chapter is Verified; this is also the test-out. The key is `Ctrl+Enter`.',
  wow: 'You built the debt and its links on fresh terms, on the clock, and the chapter is Verified.',
  timeLimit: 900,
  pars: parsFrom(360, { pass: 900, pro: 600 }),
  seed: freshTerms,
  goals: [...GOALS,
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C80" Enter "8000" Enter Ctrl+G "Checks!C6" Enter', cadence: 320 },
      text: 'Does it tie? Watch the minimum cash in Inputs C80 go to 8,000: the revolver draws more and the balance check, Checks row 6, holds at 0.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') }],
  graders: GRADERS,
  closing: [
    'Fresh terms, an empty schedule, and fifteen minutes later the debt ties: three tranches, the circle closed behind the breaker, every link in place and the balance check at 0 in every year.',
    'That is the schedule a lender’s model is checked against, and you built it under a clock.',
  ],
  solution: hintToScript(GOALS.map(g => g.keys).join(' ')),
};
