// Practice · Finance and Accounting — Checks (screenplay 6.2). The first three rows of Checks
// emptied, labels, formulas and number format: the balance check, the cash check and the debt
// check. Label each, write each as a rounded live difference reading 0 in every year, and give the
// block the desk number format (or Comma Style). Graded on the formulas' figures, the cells each
// reads (a token check on the cells the goal names), the labels and the format.
import { across, planting, modelDrill } from './model-drills.js';
import { settled, like, reads, sheetIn, DESK } from '../lessons/lib/model-checks.js';

const K = 'Checks', C = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROWS = {
  balance: { row: 6, label: 'Balance sheet balances', f: '=ROUND(BS!C10-BS!C25,2)', reads: c => [`BS!${c}10`, `BS!${c}25`] },
  cash: { row: 7, label: 'BS cash equals CF closing cash', f: '=ROUND(BS!C6-CF!C30,2)', reads: c => [`BS!${c}6`, `CF!${c}30`] },
  debt: { row: 8, label: 'Debt schedule closing equals BS debt', f: '=ROUND(Schedules!C109-(BS!C15+BS!C16+BS!C17),2)', reads: c => [`Schedules!${c}109`, `BS!${c}15`, `BS!${c}16`, `BS!${c}17`] },
};
const labelled = (sh, r) => { const v = sh.value('B' + r); return typeof v === 'string' && v.trim().length > 2; };
const rowOk = (ses, k) => { const x = ROWS[k], sh = sheetIn(ses, K); return !!sh && labelled(sh, x.row) && like(ses, K, across(x.row)) && C.every(c => reads(sh, c + x.row, x.reads(c))); };
const formatOk = ses => { const sh = sheetIn(ses, K); return !!sh && across([6, 7, 8]).every(r => { const c = sh.cells[r]; return !!c && ((c.fmtStyle === 'custom' && c.numFmt === DESK) || c.fmtStyle === 'comma'); }); };
const route = k => { const x = ROWS[k]; return `Ctrl+G "Checks!B${x.row}" ↵ "${x.label}" ↵ Ctrl+G "Checks!C${x.row}:J${x.row}" ↵ "${x.f}" Ctrl+↵`; };

export default modelDrill({
  id: 'ch5-checks',
  title: 'Checks',
  task: 'Rebuild the top of the checks sheet: the balance, cash and debt checks, labeled, live and reading 0, in the desk number format.',
  module: 'auditing-a-model',
  state: { before: 'DONE' },
  plant: () => planting({ cut: { [K]: ['B6', 'B7', 'B8'] }, blank: { [K]: across([6, 7, 8]) }, drop: { [K]: ['fmtStyle', 'numFmt', 'decimals'] } }),
  goals: [
    { id: 'balance', text: `Label Checks B6 ${ROWS.balance.label} and enter ${ROWS.balance.f} into C6:J6 with Ctrl+Enter.`, keys: route('balance'),
      check: (s, ses) => settled(ses) && rowOk(ses, 'balance') },
    { id: 'cash', text: `Label B7 ${ROWS.cash.label} and enter ${ROWS.cash.f} into C7:J7.`, keys: route('cash'),
      check: (s, ses) => settled(ses) && rowOk(ses, 'cash') },
    { id: 'debt', text: `Label B8 ${ROWS.debt.label} and enter ${ROWS.debt.f} into C8:J8.`, keys: route('debt'),
      check: (s, ses) => settled(ses) && rowOk(ses, 'debt') },
    { id: 'format', text: 'Give the three checks C6:J8 the desk number format through Ctrl+1, so a zero shows as a dash.', keys: `Ctrl+G "Checks!C6:J8" ↵ Ctrl+1 N Tab End Alt+T '${DESK}' ↵`,
      check: (s, ses) => settled(ses) && formatOk(ses) },
  ],
  endState: [
    { text: 'The three checks are labeled, live, read 0 in every year and carry the number format', check: (s, ses) => ['balance', 'cash', 'debt'].every(k => rowOk(ses, k)) && formatOk(ses) },
  ],
  solution: [route('balance'), route('cash'), route('debt'), `Ctrl+G "Checks!C6:J8" ↵ Ctrl+1 N Tab End Alt+T '${DESK}' ↵`].join(' ').replace(/↵/g, 'Enter'),
  optimalKeys: 320,
  route: 90,
});
