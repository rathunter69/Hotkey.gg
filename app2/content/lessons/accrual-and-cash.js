// Chapter 5 · 5.1.2 Accrual and cash: why profit isn't cash (clearcoat-model, B512 → B513)
// The timing gaps block on One site: membership cash in on the 1st and the deferred revenue it leaves
// at the 15th and the 30th, one member who paid on the 20th, the month's chemicals as a payable, three
// days of card revenue as a receivable, and cash from operations by hand. Formats arrive planted; the
// closer clears August's bill and cash from operations rises by it.
import { site, siteLines, settled, live, at, formatsFrom, typeDown, script } from './lib/model-checks.js';

const S = 'One site';
const KEYS = ['cashIn1', 'def15', 'def30', 'def20', 'payClose', 'recClose', 'cfoHand'];
const PLANT = formatsFrom('B513', S, KEYS.map(k => at(S, k)));
const K = {
  cash: 'Ctrl+G "C55" ↵ ' + typeDown(['=C22*C23']),
  deferred: '↓ ' + typeDown(['=C55*(C25-15)/C25', '=C55*(C25-C25)/C25']),
  late: '↓ ' + typeDown(['=C23*(C25-10)/C25']),
  payables: '↓ ' + typeDown(['=-C34']),
  receivables: '↓ ' + typeDown(['=C33/C25*C24']),
  cfo: '↓ ' + typeDown(['=C52-C47+(C59-C27)-(C60-C28)+C57']),
};
const ok = (ses, keys, ref) => { const sh = site(ses); return settled(ses) && siteLines(sh, keys) && (!ref || live(sh, ref)); };

export default {
  id: 'accrual-and-cash',
  chapter: 'finance-and-accounting',
  section: 'The three statements',
  module: 'the-three-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B512', after: 'B513' },
  plant: PLANT,
  title: 'Accrual and cash: why profit isn’t cash',
  difficulty: 'medium',
  tags: ['finance', 'statements', 'accounting', 'working-capital'],
  access: 'paid',
  minutes: 7,
  headline: '=',
  conventions: ['F1', 'B4'],
  teaches: ['accrual-gaps'],
  uses: ['income-statement', 'go-to', 'formula-basics', 'formula-operators', 'arrow-keys'],
  prerequisites: ['the-income-statement'],
  brief: 'A member pays $30 on the 1st for washes they’ll take all month, so on the 1st the cash is in the bank and none of the revenue is earned; the unearned part is deferred revenue, a liability, because the company owes the member washes. The chemical supplier is paid in thirty days, so September’s chemicals are a cost in September and cash in October: a payable. Card revenue settles in three days: a receivable. Profit and cash differ by timing gaps like these, so build them for Domain’s month. The key is `=`.',
  wow: 'Three timing gaps, and now you can say where every dollar between profit and cash went.',
  goals: [
    { id: 'cash-in', teach: 'Accrual accounting books revenue when it is earned and a cost when it is incurred, whenever the cash moves. A member’s fee arrives on the 1st, so the cash is in and the revenue is still owed to the member as washes.',
      text: 'Membership cash in C55: members times the fee paid on the 1st, =C22*C23, which reads $45,000.', keys: K.cash, requires: ['accrual-gaps', 'go-to', 'formula-basics'],
      hintStuck: 'pulse cell C55 · Members are C22, the fee C23.',
      check: (s, ses) => ok(ses, ['cashIn1'], 'C55') },
    { id: 'deferred', teach: 'The fee is earned a thirtieth a day, so the unearned part shrinks as the month runs: half at the 15th, none at the 30th. That unearned balance is deferred revenue, a liability on the balance sheet.',
      text: 'Deferred revenue at September 15 in C56, =C55*(C25-15)/C25, and at September 30 in C57, =C55*(C25-C25)/C25.', keys: K.deferred, requires: ['accrual-gaps', 'arrow-keys'],
      hintStuck: 'pulse range C56:C57 · The days left in the month over the days in it.',
      check: (s, ses) => ok(ses, ['def15', 'def30'], 'C56') },
    { id: 'late-member', text: 'One member who paid on the 20th: in C58, =C23*(C25-10)/C25, two thirds of the fee still unearned on the 30th.', keys: K.late, requires: ['accrual-gaps'],
      hintStuck: 'pulse cell C58 · From the 20th to the 30th is ten days earned, twenty still owed.',
      check: (s, ses) => ok(ses, ['def20'], 'C58') },
    { id: 'payables', teach: 'September’s chemicals are a cost in September and cash in October, so at the month end the whole bill is a payable. Chemicals count as used on delivery, so there is no inventory line. A year of insurance paid ahead is a prepaid asset, the mirror of deferred revenue, and wages worked but not yet paid are an accrued liability, the payable’s twin; neither has a row here.',
      text: 'Payables at September 30 in C59: the month’s chemicals, unpaid until October, =-C34.', keys: K.payables, requires: ['accrual-gaps'],
      hintStuck: 'pulse cell C59 · Cost of sales is a negative in C34; the payable is the same bill as a positive balance.',
      check: (s, ses) => ok(ses, ['payClose'], 'C59') },
    { id: 'receivables', teach: 'Card sales land in the bank three days later, so the last three days of the month are revenue booked and cash not yet in: a receivable, an asset.',
      text: 'Receivables at September 30 in C60: three days of card revenue, =C33/C25*C24.', keys: K.receivables, requires: ['accrual-gaps'],
      hintStuck: 'pulse cell C60 · A day of revenue is C33 over the days in C25.',
      check: (s, ses) => ok(ses, ['recClose'], 'C60') },
    { id: 'cfo', teach: 'Cash from operations starts at net income, adds back depreciation because no cash left for it, then adjusts for the gaps: a rise in a liability is cash kept, a rise in an asset is cash not yet in. Best practice: it is the change in a balance that moves cash, never the balance itself.',
      text: 'Cash from operations by hand in C61: =C52-C47+(C59-C27)-(C60-C28)+C57, net income adjusted for every gap.', keys: K.cfo, requires: ['accrual-gaps', 'income-statement'], convention: 'F1',
      hintStuck: 'pulse cell C61 · Opening payables are C27 and opening receivables C28; deferred revenue opened at nil.',
      check: (s, ses) => ok(ses, ['cfoHand'], 'C61') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C27" Enter "0" Enter Ctrl+G "C61" Enter', cadence: 320 },
      text: 'Does it tie? Watch August’s unpaid bill in C27 go to nil: September pays nothing for it, and cash from operations rises by $10,800.', requires: [],
      hintStuck: 'pulse cell C61 · A payable that is paid is cash out; one that never existed is not.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C55:C58 hold the membership cash and the deferred revenue it leaves', check: (s, ses) => siteLines(site(ses), ['cashIn1', 'def15', 'def30', 'def20']) },
    { text: 'C59:C61 hold the payable, the receivable and cash from operations', check: (s, ses) => siteLines(site(ses), ['payClose', 'recClose', 'cfoHand']) },
  ],
  closing: [
    'On this page profit and cash differ by three timing gaps, and now you can name each one.',
    'Domain made $15,561 and kept $26,003 of cash from operations: depreciation added back, a payable that grew by $450, a receivable that grew by $425. Best practice: read a working-capital line as a change, and a rise in what the business owes is cash in, a rise in what it’s owed is cash out.',
  ],
  solution: script(Object.values(K).join(' ')),
};
