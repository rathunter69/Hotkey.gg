// Practice · Finance and Accounting — Statement link (screenplay 6.2). The finished model with the
// three links that carry net income and cash around the statements emptied (their formats stay):
// net income at the top of the cash flow, cash on the BS, net income into equity. Each link is
// graded on the learner's own figures (it reads its source in the same column), since the circle
// stays open until all three are in; the end state is the finished model's and a BS that balances.
import { across, planting, modelDrill } from './model-drills.js';
import { settled, like, echoes, cfLinked, sheetIn } from '../lessons/lib/model-checks.js';

const C = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const bsReads = (ses, key, sheet, row) => echoes(ses, 'BS', [key], (col, v) => v(sheet, col + row));
const balanced = ses => { const ch = sheetIn(ses, 'Checks'); return !!ch && C.every(c => ch.value(c + '6') === 0 && ch.value(c + '7') === 0); };

export default modelDrill({
  id: 'ch5-statement-link',
  title: 'Statement link',
  task: 'Carry net income to the cash flow statement and into equity, and land closing cash on the balance sheet, until it balances.',
  module: 'linking-the-statements',
  state: { before: 'DONE' },
  plant: () => planting({ blank: { CF: across(6), BS: across([6, 22]) } }),
  goals: [
    { id: 'net-income', text: 'Start the cash flow with net income: =IS!C31 into CF C6:J6 with Ctrl+Enter.', keys: 'Ctrl+G "CF!C6:J6" ↵ "=IS!C31" Ctrl+↵',
      check: (s, ses) => settled(ses) && cfLinked(ses, ['ni']) },
    { id: 'cash', text: 'Land closing cash on the BS: =CF!C30 into BS C6:J6 with Ctrl+Enter.', keys: 'Ctrl+G "BS!C6:J6" ↵ "=CF!C30" Ctrl+↵',
      check: (s, ses) => settled(ses) && bsReads(ses, 'cash', 'CF', 30) },
    { id: 'equity', text: 'Add net income to equity: =IS!C31 into BS C22:J22 with Ctrl+Enter.', keys: 'Ctrl+G "BS!C22:J22" ↵ "=IS!C31" Ctrl+↵',
      check: (s, ses) => settled(ses) && bsReads(ses, 'ni', 'IS', 31) && balanced(ses) },
  ],
  endState: [
    { text: 'The three links are the finished model’s and the balance and cash checks read 0 in every year', check: (s, ses) => like(ses, 'CF', across(6)) && like(ses, 'BS', across([6, 22])) && balanced(ses) },
  ],
  solution: 'Ctrl+G "CF!C6:J6" Enter "=IS!C31" Ctrl+Enter Ctrl+G "BS!C6:J6" Enter "=CF!C30" Ctrl+Enter Ctrl+G "BS!C22:J22" Enter "=IS!C31" Ctrl+Enter',
  optimalKeys: 70,
  route: 30,
});
