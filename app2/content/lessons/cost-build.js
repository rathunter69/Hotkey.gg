// Chapter 5 · 5.3.2 The cost build: per wash, per site, fixed (clearcoat-model, B532 → B533)
// The per-site block (labor, rent, utilities, maintenance, card fees, marketing and their total)
// came with 5.2.3; this lesson builds the rest of the cost build around it: cost of sales off the
// live cost-of-wash driver, the contribution line, head office as a fixed cost with a step, EBITDA.
import { settled, linesBuilt, liveVia, inputRef, plantLines, fillLines, solutionOf, sheetIn, near } from './lib/model-checks.js';

const AFTER = 'B533';
const S = 'Schedules';
const ALL = ['cos', 'cosShare', 'contrib', 'cm', 'ho', 'ebitda', 'em'];
const lines = (ses, keys) => linesBuilt(ses, S, keys, AFTER);

const goals = [
  { id: 'per-wash', text: 'Cost of sales in C30:J30: revenue times the live cost-of-wash driver, through the flag.',
    teach: 'Each cost is built the way it behaves. Chemicals, water and power move with every wash, so cost of sales is a share of revenue off the drivers block; the per-site block below (labor, rent, utilities, maintenance) is a cost per site × average sites, inflated each year; head office is fixed.',
    keys: fillLines(AFTER, S, ['cos']), requires: ['cost-behaviour', 'go-to', 'ctrl-enter-fill', 'index-match', 'if-function'], convention: 'C3',
    hintStuck: 'pulse range C30:J30 · The live cost-of-wash driver sits on Inputs, row 39.',
    check: (s, ses) => settled(ses) && lines(ses, ['cos']) && liveVia(ses, S, 'J30', [inputRef('bCos', 'J')]) },
  { id: 'share', text: 'Read it back in C31:J31: cost of sales as a share of revenue, which equals the driver in every projected year.',
    keys: fillLines(AFTER, S, ['cosShare']), requires: ['iferror-function', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C31:J31 · Cost of sales over total revenue, inside IFERROR.',
    check: (s, ses) => settled(ses) && lines(ses, ['cosShare']) && liveVia(ses, S, 'J31', [inputRef('bCos', 'J')]) },
  { id: 'contribution', text: 'Site contribution and the contribution margin in C39:J40: revenue less cost of sales less site costs.',
    keys: fillLines(AFTER, S, ['contrib', 'cm']), requires: ['cost-behaviour', 'margins-and-growth', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C39:J40 · What each site earns before head office.',
    check: (s, ses) => settled(ses) && lines(ses, ['contrib', 'cm']) && liveVia(ses, S, 'J39', [inputRef('rent')]) },
  { id: 'head-office', text: 'Head office in C41:J41: last year’s figure grown 3%, plus $50k for every new site, through the flag.',
    teach: 'A fixed cost doesn’t scale with sites or washes: it grows with inflation and steps up as the support team grows with the rollout. Last year’s cell times one plus the growth, plus the step times new sites.',
    keys: fillLines(AFTER, S, ['ho']), requires: ['cost-behaviour', 'go-to', 'ctrl-enter-fill'], convention: 'B4',
    hintStuck: 'pulse range C41:J41 · B41 reads the label, so the formula starts from the column before.',
    check: (s, ses) => settled(ses) && lines(ses, ['ho']) && liveVia(ses, S, 'J41', [inputRef('hoStep')]) },
  { id: 'ebitda', text: 'EBITDA and its margin in C42:J43; FY26 EBITDA reads $16,600k, the Chapter 2 P&L’s.',
    keys: fillLines(AFTER, S, ['ebitda', 'em']), requires: ['margins-and-growth', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C42:J43 · Site contribution less head office.',
    check: (s, ses) => settled(ses) && lines(ses, ['ebitda', 'em']) && near(sheetIn(ses, S).value('E42'), 16600, 1e-6) && liveVia(ses, S, 'J42', [inputRef('rent')]) },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C51" Enter "190" Enter Ctrl+G "Schedules!F42" Enter', cadence: 320 },
    text: 'Does it tie? Watch rent per site go to $190k: site costs and EBITDA answer in every projected year and no actual one.', requires: [],
    hintStuck: 'pulse range Schedules!F42:J42 · The actual years read Data, so the input never reaches them.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'cost-build',
  chapter: 'finance-and-accounting',
  section: 'Schedules',
  module: 'schedules',
  workbook: 'clearcoat-model',
  state: { before: 'B532', after: AFTER },
  plant: plantLines(AFTER, S, ALL),
  title: 'The cost build: per wash, per site, fixed',
  difficulty: 'medium',
  tags: ['model', 'schedules', 'costs', 'EBITDA'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['C3', 'B4'],
  teaches: ['cost-behaviour'],
  uses: ['go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'iferror-function', 'margins-and-growth', 'corkscrew', 'driver-build'],
  prerequisites: ['revenue-build'],
  brief: 'Costs come in three kinds and each is built its own way: per wash as a share of revenue, per site as a cost per site × average sites growing with inflation, and fixed as a base growing 3% plus a step per new site. The per-site block is already on Schedules. Build cost of sales, the contribution line, head office and EBITDA around it. The key is `=`.',
  goals,
  endState: [
    { text: 'The cost build runs from cost of sales to the EBITDA margin across FY24 to FY31', check: (s, ses) => lines(ses, ALL) },
  ],
  closing: [
    'Every cost is built the way it behaves: per wash, per site, or fixed.',
    'EBITDA is now a formula eight years long, and FY26 still reads $16.6m, the figure on the Chapter 2 P&L. Best practice: when a projected cost grows at a rate nobody can explain, rebuild it from the driver it really moves with.',
  ],
  solution: solutionOf(goals),
};
