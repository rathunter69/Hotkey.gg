// Chapter 5 · 5.1.7 Reading a set of statements the way a buyer does (clearcoat-model, B517 → B518)
// The ratios block at the foot of One site: EBITDA margin, cash conversion before interest and tax,
// net debt and leverage on annualized EBITDA, interest cover, and the return on the site's build.
// Formats (percent, 0.0x) arrive planted. The closer cuts the loan: leverage moves, margin holds.
import { site, siteLines, settled, live, at, formatsFrom, typeDown, script } from './lib/model-checks.js';

const S = 'One site';
const KEYS = ['rMargin', 'rConv', 'rNetDebt', 'rLev', 'rCover', 'rReturn'];
const PLANT = formatsFrom('B518', S, KEYS.map(k => at(S, k)));
const K = {
  margin: 'Ctrl+G "C94" ↵ ' + typeDown(['=IFERROR(C45/C33,"-")']),
  conversion: '↓ ' + typeDown(['=IFERROR((C69-C49-C51)/C45,"-")']),
  leverage: '↓ ' + typeDown(['=C85-C79', '=C96/(C45*12)']),
  cover: '↓ ' + typeDown(['=-C45/C49']),
  return: '↓ ' + typeDown(['=C43*12/C16']),
};
const ok = (ses, keys, ref) => { const sh = site(ses); return settled(ses) && siteLines(sh, keys) && (!ref || live(sh, ref)); };

export default {
  id: 'read-like-a-buyer',
  chapter: 'finance-and-accounting',
  section: 'The three statements',
  module: 'the-three-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B517', after: 'B518' },
  plant: PLANT,
  title: 'Reading a set of statements the way a buyer does',
  difficulty: 'medium',
  tags: ['finance', 'statements', 'ratios'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['D2', 'G2'],
  teaches: ['buyer-ratios'],
  uses: ['income-statement', 'cash-flow-statement', 'balance-sheet', 'go-to', 'formula-basics', 'formula-operators', 'iferror-function', 'arrow-keys'],
  prerequisites: ['one-week-three-statements'],
  brief: 'A buyer reads three ratios before anything else: margin (EBITDA over revenue, how much of a dollar of washes becomes profit), cash conversion (cash from operations over EBITDA, how much of that profit turns into cash) and leverage (net debt over EBITDA, how many years of profit the debt represents). Build them at the foot of Domain’s statements, with interest cover and the return on the site beside them, and read what each says about a car wash. The key is `=`.',
  wow: 'Margin, cash conversion and leverage: the three numbers a buyer reads first, in one block.',
  goals: [
    { id: 'margin', teach: 'EBITDA margin says how much of each dollar of washes becomes profit. Domain’s 38% sits above the company’s 33% on the Chapter 2 P&L, because a mature site carries none of the new sites’ ramp-up.',
      text: 'EBITDA margin in C94: =IFERROR(C45/C33,"-"), which reads 38.3%.', keys: K.margin, requires: ['buyer-ratios', 'go-to', 'iferror-function'], convention: 'D2',
      hintStuck: 'pulse cell C94 · EBITDA is C45 and revenue C33.',
      check: (s, ses) => ok(ses, ['rMargin'], 'C94') },
    { id: 'conversion', teach: 'Cash conversion is cash from operations before interest and tax, over EBITDA: how much of the profit turns into cash. A member business converts well, because members pay on the 1st, before the washes are delivered.',
      text: 'Cash conversion in C95: =IFERROR((C69-C49-C51)/C45,"-"), operations with interest and tax added back, over EBITDA.', keys: K.conversion, requires: ['buyer-ratios', 'iferror-function'],
      hintStuck: 'pulse cell C95 · Interest in C49 and tax in C51 are negatives, so subtracting them adds them back.',
      check: (s, ses) => ok(ses, ['rConv'], 'C95') },
    { id: 'leverage', teach: 'Net debt is the debt less the cash that could repay it. Leverage is net debt over a year of EBITDA, in years, shown as 3.0x (2.2.2): how many years of profit the debt represents.',
      text: 'Net debt =C85-C79 in C96, and leverage =C96/(C45*12) in C97, on a year of EBITDA.', keys: K.leverage, requires: ['buyer-ratios'],
      hintStuck: 'pulse range C96:C97 · The month’s EBITDA times twelve is the year’s.',
      check: (s, ses) => ok(ses, ['rNetDebt', 'rLev'], 'C97') },
    { id: 'cover', teach: 'Interest cover is EBITDA over interest: how many times the profit pays the interest. Leverage says how much debt; cover says whether the earnings can carry it.',
      text: 'Interest cover in C98: =-C45/C49, a positive multiple because interest is a negative.', keys: K.cover, requires: ['buyer-ratios'],
      hintStuck: 'pulse cell C98 · The minus turns the negative interest into a positive ratio.',
      check: (s, ses) => ok(ses, ['rCover'], 'C98') },
    { id: 'return', teach: 'The return on the site is a year of site contribution, which is after rent, over the $2,500,000 Clearcoat spent building it. Best practice: the same ratios on every set of statements, in the same place, in the same formats, so a reader compares sites at a glance.',
      text: 'Return on the site in C99: =C43*12/C16, a year of site contribution over the build.', keys: K.return, requires: ['buyer-ratios'], convention: 'G2',
      hintStuck: 'pulse cell C99 · Site contribution is C43 and the build C16.',
      check: (s, ses) => ok(ses, ['rReturn'], 'C99') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C18" Enter "1000000" Enter Ctrl+G "C97" Enter', cadence: 320 },
      text: 'Does it tie? Watch the loan in C18 fall to $1,000,000: leverage drops and cover rises, while the margin doesn’t move.', requires: [],
      hintStuck: 'pulse cell C97 · Debt sits below EBITDA, so the margin never sees it.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C94:C99 hold the margin, conversion, net debt, leverage, cover and return', check: (s, ses) => siteLines(site(ses), KEYS) },
  ],
  closing: [
    'Margin, cash conversion and leverage are the three numbers a buyer reads first.',
    'Domain turns 38% of its washes into EBITDA, converts all of it to cash, and carries about three years of profit in debt that the earnings cover four and a half times. A buyer reads those before any line above them, so they sit in the same place on every set you build.',
  ],
  solution: script(Object.values(K).join(' ')),
};
