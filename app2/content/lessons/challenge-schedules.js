// Chapter 5 · 5.3.C Challenge: the schedules (seeded over B53C)
// Every schedule built, with ten projected lines blank across FY27 to FY31: the rollout's closing
// sites, retail and membership revenue, labor and rent per site, receivables and payables, the first
// waterfall row, closing PP&E and term-loan interest. The seed draws fresh inputs (capex per site,
// washes a day per new site, labor, rent, payable days), so every figure is new; the workload never
// moves. A line is graded on its value against the model's own formula in the learner's workbook,
// and on the shared liveness rule through an input it has to move with.
import { parsFrom } from '../../app/pars.js';
import { challengeSeed } from '../workbooks/clearcoat-model.js';
import { settled, built, refsOf, liveVia, inputRef, PROJ_COLS } from './lib/model-checks.js';

const ID = 'challenge-schedules';
const REF = 'B541';
const S = 'Schedules';
const lineOk = (ses, keys) => built(ses, S, refsOf(S, keys, PROJ_COLS), REF);
const fill = (row, f) => `Ctrl+G "${S}!F${row}:J${row}" ↵ "${f}" Ctrl+↵`;

const LINES = {
  rollout: ['closeSites'],
  revenue: ['retailRev', 'clubRev'],
  costs: ['labor', 'rent'],
  wc: ['rec', 'pay'],
  ppe: ['wf1', 'ppeClose'],
  debt: ['termInt'],
};
const LIVE = {
  rollout: ['J9', inputRef('bNew', 'J')],
  revenue: ['J22', inputRef('newWash')],
  costs: ['J33', inputRef('rent')],
  wc: ['J47', inputRef('payDays')],
  ppe: ['J65', inputRef('capexSite')],
  debt: ['J84', inputRef('termRate')],
};
const done = (ses, id) => lineOk(ses, LINES[id]) && liveVia(ses, S, LIVE[id][0], [LIVE[id][1]]);
const WHY = {
  rollout: 'closing sites in F9:J9 is not opening plus new sites plus closures',
  revenue: 'retail or membership revenue in F22:J22 or F24:J24 does not read the build',
  costs: 'labor or rent per site in F32:J33 is not the inflated cost per site times average sites',
  wc: 'receivables or payables in F46:J47 is not the base over 365 times the days on Inputs',
  ppe: 'the FY27 waterfall row in F71:J71 or closing PP&E in F65:J65 does not roll',
  debt: 'term-loan interest in F84:J84 does not read the rate through the Circ breaker',
};

const goals = [
  { id: 'rollout', text: 'Closing sites in F9:J9: opening plus new sites plus closures.', convention: 'C3',
    keys: fill(9, '=F6+F7+F8'), check: (s, ses) => settled(ses) && done(ses, 'rollout') },
  { id: 'revenue', text: 'Retail revenue in F22:J22 and membership revenue in F24:J24 from the build above them.',
    keys: `${fill(22, '=F18*F20')} ${fill(24, '=F23*Inputs!$C$44*12')}`, check: (s, ses) => settled(ses) && done(ses, 'revenue') },
  { id: 'costs', text: 'Labor and rent in F32:J33: the cost per site on Inputs, inflated each year, times average sites.',
    keys: `${fill(32, '=Inputs!$C$50*(1+Inputs!$C$54)^Inputs!F$8*F10')} ${fill(33, '=Inputs!$C$51*(1+Inputs!$C$54)^Inputs!F$8*F10')}`,
    check: (s, ses) => settled(ses) && done(ses, 'costs') },
  { id: 'wc', text: 'Receivables and payables in F46:J47, each its base ÷ 365 × its days on Inputs.', convention: 'B4',
    keys: `${fill(46, '=F26/Inputs!$C$43*Inputs!$C$68')} ${fill(47, '=(F30+F38)/Inputs!$C$43*Inputs!$C$69')}`,
    check: (s, ses) => settled(ses) && done(ses, 'wc') },
  { id: 'ppe', text: 'The FY27 waterfall row in F71:J71 and closing PP&E in F65:J65.',
    keys: `${fill(71, '=IF(Inputs!F$8>1,$F$63/Inputs!$C$63,0)')} ${fill(65, '=F60+F63-F64')}`,
    check: (s, ses) => settled(ses) && done(ses, 'ppe') },
  { id: 'debt', text: 'Term-loan interest in F84:J84: the rate on the average while Circ is 1, on the opening while it is 0.', convention: 'E8',
    keys: fill(84, '=IF(Circ=1,Inputs!$C$73*F83,Inputs!$C$73*F79)'), check: (s, ses) => settled(ses) && done(ses, 'debt') },
];

export default {
  id: ID,
  chapter: 'finance-and-accounting',
  section: 'Schedules',
  module: 'schedules',
  workbook: 'clearcoat-model',
  state: { before: 'B53C' },
  kind: 'challenge',
  title: 'Challenge: the schedules',
  difficulty: 'hard',
  tags: ['challenge', 'model', 'schedules'],
  access: 'paid',
  minutes: 3,
  headline: '=',
  conventions: ['C3', 'B4', 'E8'],
  prerequisites: ['tax-schedule'],
  brief: 'A model with its schedules built and ten projected lines missing, on fresh inputs. Rebuild them across FY27 to FY31 so every line reads its drivers.',
  timeLimit: 180,
  pars: parsFrom(80, { pass: 170, pro: 110 }),
  seed: rng => challengeSeed(ID, rng),
  goals,
  graders: [
    ses => { for (const id of ['rollout', 'revenue', 'costs']) if (!done(ses, id)) return { ok: false, why: WHY[id] }; return { ok: true }; },
    ses => { for (const id of ['wc', 'ppe', 'debt']) if (!done(ses, id)) return { ok: false, why: WHY[id] }; return { ok: true }; },
  ],
  solution: goals.map(g => g.keys).join(' ').replace(/↵/g, 'Enter'),
};
