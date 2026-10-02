// Chapter 5 · 5.1.4 The balance sheet (clearcoat-model, B514 → B515)
// Domain at September 30 on One site: cash from the cash flow's closing line, the receivable, PP&E
// net of wear; payables, deferred revenue and the loan after this month's repayment; opening equity
// from the opening balances plus net income; then the balance check as a live difference reading
// zero. The learner breaks it on purpose (a typed cash figure) and undoes it. Formats arrive planted;
// the closer moves the ticket and the check holds at zero.
import { site, siteLines, settled, live, at, formatsFrom, typeDown, script, reads, windowKeys } from './lib/model-checks.js';

const S = 'One site';
const KEYS = ['bsCash', 'bsRec', 'bsPpe', 'ta', 'bsPay', 'bsDef', 'bsLoan', 'tl', 'openEq', 'eqNi', 'closeEq', 'tle', 'check'];
const PLANT = formatsFrom('B515', S, KEYS.map(k => at(S, k)));
const K = {
  assets: 'Ctrl+G "C79" ↵ ' + typeDown(['=C76', '=C60', '=C16-C30+C47-C70']),
  total: '↓ ' + typeDown(['=SUM(C79:C81)']),
  liabilities: '↓ ' + typeDown(['=C59', '=C57', '=C18+C72', '=SUM(C83:C85)']),
  equity: '↓ ' + typeDown(['=C29+C28+C16-C30-C27-C18', '=C52', '=C87+C88']),
  check: '↓ ' + typeDown(['=C86+C89', '=ROUND(C82-C90,2)']),
  breakIt: 'Ctrl+↑ "60000" ↵ Ctrl+Z',
};
const ok = (ses, keys, ref) => { const sh = site(ses); return settled(ses) && siteLines(sh, keys) && (!ref || live(sh, ref)); };
/** The check is built to read zero whatever moves, so it is graded on what it reads (the two totals) and its value. */
const checkOk = sh => !!sh && reads(sh, 'C91', ['C82', 'C90']) && sh.value('C91') === 0;

export default {
  id: 'the-balance-sheet',
  chapter: 'finance-and-accounting',
  section: 'The three statements',
  module: 'the-three-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B514', after: 'B515' },
  plant: PLANT,
  title: 'The balance sheet',
  difficulty: 'medium',
  tags: ['finance', 'statements', 'accounting', 'checks'],
  access: 'paid',
  minutes: 7,
  headline: '=',
  conventions: ['F2', 'F1'],
  teaches: ['balance-sheet'],
  uses: ['income-statement', 'accrual-gaps', 'cash-flow-statement', 'go-to', 'formula-basics', 'formula-operators', 'sum-family', 'round-function', 'check-cell', 'undo-redo', 'ctrl-arrow', 'arrow-keys'],
  prerequisites: ['the-cash-flow-statement'],
  brief: 'The balance sheet is a snapshot: what the company owns (cash, receivables, the tunnels net of wear), what it owes (payables, deferred revenue, debt) and what is left for the owners, equity, which grows by net income. The cash flow statement’s closing cash lands in the top line, and if everything else is right, assets equal liabilities plus equity. That equality is the check that proves the other two statements. Build Domain’s at September 30 and watch it balance. The key is `=`.',
  wow: 'Assets equal liabilities plus equity, and that one zero proves the other two statements.',
  goals: [
    { id: 'assets', teach: 'Assets are what the site owns: the cash, the card revenue not yet collected, and the tunnel at what it cost, less the wear charged so far, plus the month’s capex. Domain’s land is rented, so there is no land on this page.',
      text: 'Assets from C79: cash =C76 from the cash flow, receivables =C60, and PP&E net =C16-C30+C47-C70.', keys: K.assets, requires: ['balance-sheet', 'go-to', 'formula-basics'], convention: 'F2',
      hintStuck: 'pulse range C79:C81 · Depreciation in C47 and capex in C70 are both negatives, so they flip.',
      check: (s, ses) => ok(ses, ['bsCash', 'bsRec', 'bsPpe'], 'C81') },
    { id: 'total-assets', teach: 'Assets list most liquid first and liabilities soonest due first, and current means inside twelve months: receivables are a current asset, payables and deferred revenue current liabilities. Cash is current too, though it sits outside working capital.',
      text: 'Total assets in C82, =SUM(C79:C81).', keys: K.total, requires: ['balance-sheet', 'sum-family', 'arrow-keys'],
      hintStuck: 'pulse cell C82 · Three lines above it.',
      check: (s, ses) => ok(ses, ['ta'], 'C82') },
    { id: 'liabilities', teach: 'Liabilities are what the site owes: the chemical bill, the washes members have paid for, and the loan less this month’s repayment. Published accounts split next year’s repayments out as the current portion of debt; the model keeps each loan on one row.',
      text: 'Liabilities from C83: payables =C59, deferred revenue =C57, the loan =C18+C72, and their SUM in C86.', keys: K.liabilities, requires: ['balance-sheet', 'sum-family'],
      hintStuck: 'pulse range C83:C86 · The repayment in C72 is a negative, so the loan is a plain sum.',
      check: (s, ses) => ok(ses, ['bsPay', 'bsDef', 'bsLoan', 'tl'], 'C85') },
    { id: 'equity', teach: 'Equity is what is left for the owners: what the opening balances leave once the debts are paid, plus what the month earned. Net income is the link from the income statement into the balance sheet.',
      text: 'Equity: opening =C29+C28+C16-C30-C27-C18 in C87, net income =C52, closing =C87+C88 in C89.', keys: K.equity, requires: ['balance-sheet'],
      hintStuck: 'pulse range C87:C89 · Opening cash, receivables and the tunnel net, less payables and the loan.',
      check: (s, ses) => ok(ses, ['openEq', 'eqNi', 'closeEq'], 'C89') },
    { id: 'check', teach: 'The balance check is a live difference (1.7.2): assets less liabilities and equity, rounded so floating-point dust reads as nil. Every figure here is what was paid, not what it would sell for, so this equity isn’t what Clearcoat is worth; Chapter 6 answers that.',
      text: 'Total liabilities and equity =C86+C89 in C90, and the balance check =ROUND(C82-C90,2) in C91, reading zero.', keys: K.check, requires: ['balance-sheet', 'round-function', 'check-cell'], convention: 'F1',
      hintStuck: 'pulse range C90:C91 · Assets in C82 less the total in C90.',
      check: (s, ses) => { const sh = site(ses); return ok(ses, ['tle'], 'C90') && checkOk(sh); } },
    { id: 'break-it', teach: 'A typed cash figure would make the check meaningless, because it can be set to anything. Best practice: cash is never typed on a balance sheet; it is the cash flow statement’s closing line, so the check proves something.',
      text: 'Break it on purpose: type 60000 over the cash in C79, watch the check leave zero, then Ctrl+Z.', keys: K.breakIt, requires: ['balance-sheet', 'undo-redo', 'ctrl-arrow'], convention: 'F2',
      hintStuck: 'pulse cell C79 · Ctrl+↑ climbs the block to the cash line; Ctrl+Z puts the link back.',
      check: (s, ses) => { const sh = site(ses); return settled(ses) && windowKeys(ses).includes('Ctrl+Z') && siteLines(sh, ['bsCash']) && reads(sh, 'C79', ['C76']) && checkOk(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C7" Enter "15" Enter Ctrl+G "C91" Enter', cadence: 320 },
      text: 'Does it tie? Watch the ticket in C7 go to $15: all three statements move, and the check stays at zero.', requires: [],
      hintStuck: 'pulse cell C91 · Net income, cash and equity all move by the same story.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C79:C82 hold the assets and their total', check: (s, ses) => siteLines(site(ses), ['bsCash', 'bsRec', 'bsPpe', 'ta']) },
    { text: 'C83:C90 hold the liabilities, the equity and their total', check: (s, ses) => siteLines(site(ses), ['bsPay', 'bsDef', 'bsLoan', 'tl', 'openEq', 'eqNi', 'closeEq', 'tle']) },
    { text: 'The balance check in C91 reads zero', check: (s, ses) => checkOk(site(ses)) },
  ],
  closing: [
    'Assets equal liabilities plus equity, and that one zero proves the other two statements.',
    'Cash came from the cash flow, net income from the income statement, and the two sides agreed without a number forced. Best practice: never type cash, never plug the check; when it doesn’t read zero, something upstream is wrong, and 5.4.5 is the order to look in.',
  ],
  solution: script(Object.values(K).join(' ')),
};
