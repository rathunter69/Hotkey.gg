// Chapter 5 · 5.1.C Challenge: one site's month through the three statements (seeded over B51C)
// Mueller's month on the One site page: the inputs given (the seed draws the washes, the ticket, the
// four site costs and the members) and every line of the three statements already in place except the
// ones that carry the module: revenue, EBITDA and net income; the payable and the receivable; cash
// from operations and closing cash; balance-sheet cash, closing equity, the total and the check; the
// margin, conversion and leverage. Checks read the learner's own inputs, so any seed grades the same.
import { challengeSeed } from '../workbooks/clearcoat-model.js';
import { parsFrom } from '../../app/pars.js';
import { site, siteLines, settled, at, formatsFrom, cellIn, typeDown, script, reads } from './lib/model-checks.js';

const S = 'One site';
const ALL = ['rev', 'cos', 'gp', 'gm', 'rent', 'labor', 'util', 'maint', 'card', 'siteCosts', 'contrib', 'ho', 'ebitda', 'em', 'dep', 'ebit', 'int', 'ebt', 'tax', 'ni',
  'cashIn1', 'def15', 'def30', 'def20', 'payClose', 'recClose', 'cfoHand', 'cfNi', 'cfDep', 'cfRec', 'cfPay', 'cfDef', 'cfo', 'cfCapex', 'cfi', 'cfAmort', 'cff', 'net', 'open', 'close',
  'bsCash', 'bsRec', 'bsPpe', 'ta', 'bsPay', 'bsDef', 'bsLoan', 'tl', 'openEq', 'eqNi', 'closeEq', 'tle', 'check', 'rMargin', 'rConv', 'rNetDebt', 'rLev', 'rCover', 'rReturn'];
const BUILD = { is: ['rev', 'ebitda', 'ni'], gaps: ['payClose', 'recClose'], cf: ['cfo', 'close'], bs: ['bsCash', 'closeEq', 'tle'], check: ['check'], ratios: ['rMargin', 'rConv', 'rLev'] };
const OWN = new Set(Object.values(BUILD).flat());
/** Every line but the learner's arrives as the solved page has it; the learner's arrive formatted and empty. */
const PLANT = {
  ...Object.fromEntries(ALL.filter(k => !OWN.has(k)).map(k => [`${S}!${at(S, k)}`, cellIn('B518', S, at(S, k))])),
  ...formatsFrom('B518', S, [...OWN].map(k => at(S, k))),
};
const F = k => cellIn('B518', S, at(S, k)).formula;
const K = {
  is: `Ctrl+G "C33" ↵ ${typeDown([F('rev')])} Ctrl+↓ ↓ ${typeDown([F('ebitda')])} Ctrl+↓ ↓ ${typeDown([F('ni')])}`,
  gaps: `Ctrl+↓ ×2 ↓ ${typeDown([F('payClose'), F('recClose')])}`,
  cf: `Ctrl+↓ ×3 ↓ ${typeDown([F('cfo')])} Ctrl+↓ ↓ ${typeDown([F('close')])}`,
  bs: `Ctrl+↓ ↑ ${typeDown([F('bsCash')])} Ctrl+↓ ↓ ${typeDown([F('closeEq'), F('tle')])}`,
  check: `↓ ${typeDown([F('check')])}`,
  ratios: `Ctrl+↓ ↑ ↑ ${typeDown([F('rMargin'), F('rConv')])} ↓ ↓ ${typeDown([F('rLev')])}`,
};
const lines = (ses, keys) => siteLines(site(ses), keys);
const checkZero = ses => { const sh = site(ses); return !!sh && reads(sh, 'C91', ['C82', 'C90']) && sh.value('C91') === 0; };

export default {
  id: 'challenge-one-site-month',
  chapter: 'finance-and-accounting',
  section: 'The three statements',
  module: 'the-three-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B51C' },
  plant: PLANT,
  kind: 'challenge',
  title: 'Challenge: one site’s month through the three statements',
  difficulty: 'hard',
  tags: ['challenge', 'finance', 'statements', 'ratios'],
  access: 'paid',
  minutes: 3,
  conventions: ['F1', 'F2'],
  prerequisites: ['read-like-a-buyer'],
  brief: 'Mueller’s month: the inputs given and most lines in place, the ones that carry each statement left for you. Write them, from revenue to the balance check at zero and the three ratios.',
  timeLimit: 180,
  pars: parsFrom(75, { pass: 170, pro: 110 }),
  seed: rng => challengeSeed('challenge-one-site-month', rng),
  goals: [
    { id: 'income', text: 'Revenue in C33, EBITDA in C45 and net income in C52.', convention: 'C4', keys: K.is,
      check: (s, ses) => settled(ses) && lines(ses, BUILD.is) },
    { id: 'gaps', text: 'The payable in C59 and the receivable in C60.', keys: K.gaps,
      check: (s, ses) => settled(ses) && lines(ses, BUILD.gaps) },
    { id: 'cash-flow', text: 'Cash from operations in C69 and closing cash in C76.', keys: K.cf,
      check: (s, ses) => settled(ses) && lines(ses, BUILD.cf) },
    { id: 'balance-sheet', text: 'Balance-sheet cash in C79 from the cash flow, closing equity in C89 and the total in C90.', convention: 'F2', keys: K.bs,
      check: (s, ses) => settled(ses) && lines(ses, BUILD.bs) },
    { id: 'check', text: 'The balance check in C91, reading zero.', convention: 'F1', keys: K.check,
      check: (s, ses) => settled(ses) && checkZero(ses) },
    { id: 'ratios', text: 'EBITDA margin in C94, cash conversion in C95 and leverage in C97.', keys: K.ratios,
      check: (s, ses) => settled(ses) && lines(ses, BUILD.ratios) },
  ],
  graders: [
    ses => (lines(ses, [...BUILD.is, ...BUILD.gaps]) ? { ok: true } : { ok: false, why: 'a line of the income statement or a timing gap does not read what Mueller’s inputs say it should' }),
    ses => (lines(ses, [...BUILD.cf, ...BUILD.bs]) ? { ok: true } : { ok: false, why: 'the cash flow or the balance sheet does not carry the month through' }),
    ses => (checkZero(ses) ? { ok: true } : { ok: false, why: 'the balance check in C91 does not compare total assets with total liabilities and equity, or does not read zero' }),
    ses => (lines(ses, BUILD.ratios) ? { ok: true } : { ok: false, why: 'a ratio in C94, C95 or C97 does not read off the statements' }),
  ],
  solution: script(Object.values(K).join(' ')),
};
