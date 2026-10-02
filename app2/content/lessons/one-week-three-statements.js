// Chapter 5 · 5.1.6 One week of one site through all three statements (clearcoat-model, B516 → B517)
// Domain for one week on the One week page: six events given (washes, a chemical delivery on credit,
// payroll paid, a loan payment split into interest and principal, a week of depreciation, the card
// lag) with an opening balance sheet. The learner builds the income statement, the cash flow, the
// closing balance sheet and its check, then counts the week's cash directly and ties it to the
// statement. Formats arrive planted; the closer adds one wash.
import { week, weekLines, settled, live, at, formatsFrom, typeDown, script, reads } from './lib/model-checks.js';

const S = 'One week';
const KEYS = ['rev', 'cos', 'site', 'ebitda', 'isDep', 'isInt', 'ebt', 'tax', 'ni', 'cfNi', 'cfDep', 'cfRec', 'cfPay', 'cfTax', 'cfo', 'cfPrin', 'cff', 'net', 'open', 'close',
  'bsCash', 'bsRec', 'bsPpe', 'ta', 'bsPay', 'bsTax', 'bsLoan', 'bsEq', 'tle', 'check', 'dWashes', 'dPayroll', 'dLoan', 'dNet', 'dCheck'];
const PLANT = formatsFrom('B517', S, KEYS.map(k => at(S, k)));
const K = {
  ebitda: 'Ctrl+PgDn Ctrl+G "C30" ↵ ' + typeDown(['=C6*C7', '=-C8', '=-C10', '=SUM(C30:C32)']),
  ni: '↓ ' + typeDown(['=-C14', '=-C12', '=C33+C34+C35', '=-MAX(C36,0)*C16', '=C36+C37']),
  ops: '↓ ×3 ' + typeDown(['=C38', '=C14', '=-(C30/7*C15-C20)', '=C8-C23', '=-C37-C24', '=SUM(C41:C45)']),
  cash: '↓ ' + typeDown(['=-C13', '=C47', '=C46+C48', '=C19', '=C50+C49']),
  assets: '↓ ×3 ' + typeDown(['=C51', '=C30/7*C15', '=C21-C14', '=SUM(C54:C56)']),
  claims: '↓ ' + typeDown(['=C23+C8', '=C24-C37', '=C25-C13', '=C26+C38', '=SUM(C58:C61)', '=ROUND(C57-C62,2)']),
  direct: '↓ ×3 ' + typeDown(['=C30+C43', '=-C10', '=-C11', '=SUM(C66:C68)', '=ROUND(C69-C49,2)']),
};
const ok = (ses, keys, ref) => { const sh = week(ses); return settled(ses) && weekLines(sh, keys) && (!ref || live(sh, ref)); };
const zeroOn = (sh, ref, refs) => !!sh && reads(sh, ref, refs) && sh.value(ref) === 0;

export default {
  id: 'one-week-three-statements',
  chapter: 'finance-and-accounting',
  section: 'The three statements',
  module: 'the-three-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B516', after: 'B517' },
  plant: PLANT,
  title: 'One week of one site through all three statements',
  difficulty: 'hard',
  tags: ['finance', 'statements', 'accounting', 'checks'],
  access: 'paid',
  minutes: 8,
  headline: '=',
  conventions: ['F1', 'F2'],
  teaches: ['three-statement-events'],
  uses: ['income-statement', 'accrual-gaps', 'cash-flow-statement', 'balance-sheet', 'statement-links', 'go-to', 'sheet-tabs', 'formula-basics', 'formula-operators', 'sum-family', 'min-max-cap', 'round-function', 'check-cell', 'arrow-keys'],
  prerequisites: ['how-the-statements-link'],
  brief: 'Now the whole thing by hand, small enough to hold in your head: Domain for one week, 1,750 washes, one chemical delivery on credit, one payroll, one loan payment, one week of wear, with the balance sheet it opened on. Every event lands in at least two statements, and the balance check at the end says whether you placed each one right. It is the exercise every modeling course runs, and the one a buyer’s analyst will ask you to talk through. The key is `=`.',
  wow: 'Six events through three statements, two answers for cash, and both checks read zero.',
  goals: [
    { id: 'ebitda', teach: 'Every event lands in at least two statements. The washes are revenue on the income statement and cash or a receivable on the balance sheet; the delivery is a cost now and a payable until it is paid; the payroll is a cost and cash out.',
      text: 'On One week, the income statement from C30: revenue =C6*C7, the delivery =-C8, payroll =-C10, and EBITDA =SUM(C30:C32).', keys: K.ebitda, requires: ['three-statement-events', 'sheet-tabs', 'go-to', 'sum-family'],
      hintStuck: 'pulse range C30:C33 · The week’s events are the inputs in C6:C16.',
      check: (s, ses) => ok(ses, ['rev', 'cos', 'site', 'ebitda'], 'C33') },
    { id: 'net-income', teach: 'The loan payment is two events in one: the interest is a cost on the income statement, the principal only moves cash and debt. Tax is accrued this week and paid later, so it is a cost now and a payable on the balance sheet.',
      text: 'Down to net income: depreciation =-C14, interest =-C12, EBT =C33+C34+C35, tax =-MAX(C36,0)*C16, net income =C36+C37.', keys: K.ni, requires: ['three-statement-events', 'min-max-cap'],
      hintStuck: 'pulse range C34:C38 · Only the interest part of the payment, C12, is a cost.',
      check: (s, ses) => ok(ses, ['isDep', 'isInt', 'ebt', 'tax', 'ni'], 'C38') },
    { id: 'operations', teach: 'Operations walks from net income to cash: depreciation back, the receivable that grew, the delivery still unpaid, and the tax not yet paid.',
      text: 'Cash from operations from C41: =C38, =C14, =-(C30/7*C15-C20), =C8-C23, =-C37-C24, and the SUM in C46.', keys: K.ops, requires: ['three-statement-events', 'cash-flow-statement', 'arrow-keys'],
      hintStuck: 'pulse range C41:C46 · The receivable is three days of the week’s revenue, less the one it opened with in C20.',
      check: (s, ses) => ok(ses, ['cfNi', 'cfDep', 'cfRec', 'cfPay', 'cfTax', 'cfo'], 'C46') },
    { id: 'closing-cash', text: 'The principal repaid =-C13, financing =C47, net change =C46+C48, opening cash =C19, closing cash =C50+C49 in C51.', keys: K.cash, requires: ['three-statement-events', 'cash-flow-statement'],
      hintStuck: 'pulse range C47:C51 · The principal, C13, is the only financing event.',
      check: (s, ses) => ok(ses, ['cfPrin', 'cff', 'net', 'open', 'close'], 'C51') },
    { id: 'assets', text: 'The closing balance sheet from C54: cash =C51, receivables =C30/7*C15, PP&E =C21-C14, total assets =SUM(C54:C56).', keys: K.assets, requires: ['three-statement-events', 'balance-sheet', 'arrow-keys'],
      hintStuck: 'pulse range C54:C57 · PP&E opened at C21 and wore by a week of depreciation.',
      check: (s, ses) => ok(ses, ['bsCash', 'bsRec', 'bsPpe', 'ta'], 'C57') },
    { id: 'check', teach: 'Best practice: an event that touches cash touches the cash flow, one that changes what is owned or owed touches the balance sheet, and one that is earned or incurred touches the income statement; most touch two. When the check leaves zero, find the event you put in one statement and not the other.',
      text: 'Payables =C23+C8, tax payable =C24-C37, the loan =C25-C13, equity =C26+C38, their SUM in C62, and the check =ROUND(C57-C62,2).', keys: K.claims, requires: ['three-statement-events', 'balance-sheet', 'round-function', 'check-cell'], convention: 'F1',
      hintStuck: 'pulse range C58:C63 · Each closing balance is its opening line plus the week’s event.',
      check: (s, ses) => ok(ses, ['bsPay', 'bsTax', 'bsLoan', 'bsEq', 'tle'], 'C62') && zeroOn(week(ses), 'C63', ['C57', 'C62']) },
    { id: 'direct', teach: 'A second answer for cash: count what actually moved, the washes collected, the payroll and the loan payment. The delivery isn’t in the count because it is on credit, and neither is the tax because it is unpaid; if the count agrees with the statement, both are right.',
      text: 'Count the week’s cash from C66: =C30+C43, =-C10, =-C11, the SUM in C69, and =ROUND(C69-C49,2) against the statement.', keys: K.direct, requires: ['three-statement-events', 'round-function', 'check-cell'], convention: 'F1',
      hintStuck: 'pulse range C66:C70 · Washes collected are revenue less the rise in receivables from C43.',
      check: (s, ses) => ok(ses, ['dWashes', 'dPayroll', 'dLoan', 'dNet'], 'C69') && zeroOn(week(ses), 'C70', ['C69', 'C49']) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C6" Enter "1751" Enter Ctrl+G "C63" Enter', cadence: 320 },
      text: 'Does it tie? Watch one more wash go into C6: it flows through revenue, net income, cash and equity, and both checks stay at zero.', requires: [],
      hintStuck: 'pulse cell C63 · One wash is $13.90 of revenue, part of it still in receivables.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The week’s income statement and cash flow run from revenue to closing cash', check: (s, ses) => weekLines(week(ses), KEYS.slice(0, 20)) },
    { text: 'The closing balance sheet balances in C63', check: (s, ses) => weekLines(week(ses), KEYS.slice(20, 29)) && zeroOn(week(ses), 'C63', ['C57', 'C62']) },
    { text: 'The direct count agrees with the statement in C70', check: (s, ses) => zeroOn(week(ses), 'C70', ['C69', 'C49']) },
  ],
  closing: [
    'One week’s six events went through three statements, and the check reads zero.',
    'The week earned $9,585 and added $15,940 to the bank, and you can say where every dollar of the gap went: depreciation, the unpaid delivery, the unpaid tax, the receivable and the principal. That walk is the one a buyer’s analyst asks for, and now you can talk it through.',
  ],
  solution: script(Object.values(K).join(' ')),
};
