// Chapter 5 · 5.1.3 The cash flow statement (clearcoat-model, B513 → B514)
// Domain's September cash flow on One site, indirect: net income and the depreciation add-back, the
// three working-capital changes from 5.1.2 and the operations subtotal, maintenance capex as
// investing, the month's loan amortization as financing, then the net change, opening and closing
// cash. Formats arrive planted. The closer halves the capex rate and closing cash rises by the saving.
import { site, siteLines, settled, live, at, formatsFrom, typeDown, script } from './lib/model-checks.js';

const S = 'One site';
const KEYS = ['cfNi', 'cfDep', 'cfRec', 'cfPay', 'cfDef', 'cfo', 'cfCapex', 'cfi', 'cfAmort', 'cff', 'net', 'open', 'close'];
const PLANT = formatsFrom('B514', S, KEYS.map(k => at(S, k)));
const K = {
  start: 'Ctrl+G "C64" ↵ ' + typeDown(['=C52', '=-C47']),
  gaps: '↓ ' + typeDown(['=-(C60-C28)', '=C59-C27', '=C57-0', '=SUM(C64:C68)']),
  investing: '↓ ' + typeDown(['=-C33*C26', '=C70']),
  financing: '↓ ' + typeDown(['=-C20/12', '=C72']),
  close: '↓ ' + typeDown(['=C69+C71+C73', '=C29', '=C75+C74']),
};
const ok = (ses, keys, ref) => { const sh = site(ses); return settled(ses) && siteLines(sh, keys) && (!ref || live(sh, ref)); };

export default {
  id: 'the-cash-flow-statement',
  chapter: 'finance-and-accounting',
  section: 'The three statements',
  module: 'the-three-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B513', after: 'B514' },
  plant: PLANT,
  title: 'The cash flow statement',
  difficulty: 'medium',
  tags: ['finance', 'statements', 'accounting', 'cash'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['C4', 'F2'],
  teaches: ['cash-flow-statement'],
  uses: ['income-statement', 'accrual-gaps', 'go-to', 'formula-basics', 'formula-operators', 'sum-family', 'arrow-keys'],
  prerequisites: ['accrual-and-cash'],
  brief: 'The cash flow statement starts from net income and walks back to cash in three parts. Operations adds back depreciation, because nothing was paid for the wear, and adjusts for the working-capital gaps from 5.1.2; investing is the cash spent on tunnels and equipment, capex; financing is loans drawn and repaid. The three sum to the change in cash, and opening cash plus the change is closing cash. Build Domain’s for September, the indirect way. The key is `=`.',
  wow: 'From net income to the cash in the bank, in three parts, and every line a link.',
  goals: [
    { id: 'start', teach: 'The indirect method starts from net income and adds back what wasn’t cash: depreciation was a cost, but no money left for it. Cash in reads positive and cash out negative, stated once in the heading (2.1.2).',
      text: 'Operations starts in C64: net income =C52, then depreciation added back in C65, =-C47.', keys: K.start, requires: ['cash-flow-statement', 'go-to', 'formula-basics'], convention: 'C4',
      hintStuck: 'pulse range C64:C65 · Depreciation is a negative in C47, so the add-back flips its sign.',
      check: (s, ses) => ok(ses, ['cfNi', 'cfDep'], 'C64') },
    { id: 'gaps', teach: 'The working-capital lines are changes, not balances: receivables rose, so that cash isn’t in yet and the line is negative; payables rose, so cash was kept and the line is positive.',
      text: 'The gaps in C66:C68, receivables =-(C60-C28), payables =C59-C27, deferred revenue =C57-0, and SUM them into C69.', keys: K.gaps, requires: ['cash-flow-statement', 'accrual-gaps', 'sum-family', 'arrow-keys'],
      hintStuck: 'pulse range C66:C69 · Closing less opening for each; deferred revenue opened at nil.',
      check: (s, ses) => ok(ses, ['cfRec', 'cfPay', 'cfDef', 'cfo'], 'C69') },
    { id: 'investing', teach: 'Investing is the cash spent on what the business will use for years. Here it is maintenance capex, 2% of revenue, and it goes out negative.',
      text: 'Investing: maintenance capex in C70, =-C33*C26, and cash from investing =C70 in C71.', keys: K.investing, requires: ['cash-flow-statement'],
      hintStuck: 'pulse range C70:C71 · Revenue is C33 and the capex rate C26.',
      check: (s, ses) => ok(ses, ['cfCapex', 'cfi'], 'C70') },
    { id: 'financing', teach: 'Financing is cash to and from the lenders and the owners. The site’s share of the loan repays $75,000 a year, so a month of it leaves negative; the interest already sits in net income.',
      text: 'Financing: a month of loan amortization in C72, =-C20/12, and cash from financing =C72 in C73.', keys: K.financing, requires: ['cash-flow-statement'],
      hintStuck: 'pulse range C72:C73 · The yearly amortization is in C20.',
      check: (s, ses) => ok(ses, ['cfAmort', 'cff'], 'C72') },
    { id: 'close', teach: 'The three parts sum to the change in cash, and opening cash plus the change is closing cash. Best practice: depreciation is added back because it was never cash, and capex is where the cash for the tunnel actually went.',
      text: 'Net change =C69+C71+C73 in C74, opening cash =C29 in C75, and closing cash =C75+C74 in C76.', keys: K.close, requires: ['cash-flow-statement'], convention: 'F2',
      hintStuck: 'pulse range C74:C76 · Opening cash is the input in C29.',
      check: (s, ses) => ok(ses, ['net', 'open', 'close'], 'C76') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C26" Enter "0.01" Enter Ctrl+G "C76" Enter', cadence: 320 },
      text: 'Does it tie? Watch the capex rate in C26 halve to 1%: closing cash rises by exactly the capex saved.', requires: [],
      hintStuck: 'pulse cell C76 · Capex is the only line the rate moves.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C64:C69 walk from net income to cash from operations', check: (s, ses) => siteLines(site(ses), ['cfNi', 'cfDep', 'cfRec', 'cfPay', 'cfDef', 'cfo']) },
    { text: 'C70:C76 carry investing, financing and the cash from opening to closing', check: (s, ses) => siteLines(site(ses), ['cfCapex', 'cfi', 'cfAmort', 'cff', 'net', 'open', 'close']) },
  ],
  closing: [
    'The statement walks from net income back to the cash in the bank, in three parts.',
    'Domain made $15,561, kept $26,003 from operations, spent $2,085 on equipment and repaid $6,250 of the loan: $17,668 more cash than it started the month with. Best practice: one sign convention, stated once, so a buyer adds the three parts without reading a single label.',
  ],
  solution: script(Object.values(K).join(' ')),
};
