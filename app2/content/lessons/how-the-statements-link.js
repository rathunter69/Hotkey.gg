// Chapter 5 · 5.1.5 How the three statements link (clearcoat-model, B515 → B516: nothing is built)
// A tour of the five links on the finished One site page, each followed with Ctrl+[ from the cell
// that reads it: net income into the cash flow and into equity; depreciation added back; PP&E reading
// the wear and the capex; the loan reading its repayment; balance-sheet cash reading the cash flow's
// closing line. Every goal is graded on where Ctrl+[ left the selection. The closer moves the cost per
// wash and the check holds at zero.
import { site, settled, windowKeys, onSheet } from './lib/model-checks.js';
import { refKey } from '../../engine/refs.js';

const S = 'One site';
const presses = ses => windowKeys(ses).filter(k => k === 'Ctrl+[').length;
const activeIs = (ses, ref) => { const sh = site(ses); if (!sh || !onSheet(ses, S)) return false; const a = sh.dispActive(); return refKey(a.r, a.c) === ref; };
const selects = (ses, refs) => { const sh = site(ses); return !!sh && onSheet(ses, S) && Array.isArray(sh.multi) && refs.every(r => sh.multi.includes(r)); };
const K = {
  ni: 'Ctrl+G "C88" ↵ Ctrl+[ Ctrl+G "C64" ↵ Ctrl+[',
  dep: 'Ctrl+↓ ×3 ↓ Ctrl+[',
  ppe: 'Ctrl+↓ ×6 ↓ ×2 Ctrl+[',
  debt: 'Ctrl+G "C85" ↵ Ctrl+[',
  cash: 'Ctrl+End Ctrl+↑ ×2 Ctrl+[',
};
const solution = 'Ctrl+G "C88" Enter Ctrl+[ Ctrl+G "C64" Enter Ctrl+[ Ctrl+Down Ctrl+Down Ctrl+Down Down Ctrl+[ '
  + 'Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Down Ctrl+[ Ctrl+G "C85" Enter Ctrl+[ Ctrl+End Ctrl+Up Ctrl+Up Ctrl+[';

export default {
  id: 'how-the-statements-link',
  chapter: 'finance-and-accounting',
  section: 'The three statements',
  module: 'the-three-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B515', after: 'B516' },
  title: 'How the three statements link',
  difficulty: 'medium',
  tags: ['finance', 'statements', 'accounting', 'auditing'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+[',
  conventions: ['F2', 'F3'],
  teaches: ['statement-links'],
  uses: ['income-statement', 'cash-flow-statement', 'balance-sheet', 'go-to', 'ctrl-arrow', 'ctrl-home-end', 'arrow-keys', 'cross-sheet-ref'],
  prerequisites: ['the-balance-sheet'],
  brief: 'Three statements, three questions: the income statement asks what the business earned over the period, the cash flow statement where the cash went, the balance sheet what it owns and owes at the end. They are one system, joined by five links: net income, depreciation, capex, debt and closing cash. Each link is a formula, so Ctrl+[ follows it from the cell that reads it to the cell it reads. Walk all five on Domain’s page. The key is `Ctrl+[`.',
  wow: 'Five links join three statements, and you followed each one with Ctrl+[.',
  goals: [
    { id: 'net-income', teach: 'Link one: net income ends the income statement, starts the cash flow statement and grows equity on the balance sheet. Ctrl+[ jumps from a formula to the cells it reads, so from either end it lands on the same cell.',
      text: 'Net income, both ways: land on C88 in equity and press Ctrl+[, then on C64 in the cash flow and press it again.', keys: K.ni, requires: ['statement-links', 'go-to'],
      hintStuck: 'pulse cell C52 · Both formulas read C52, the bottom of the income statement.',
      check: (s, ses) => settled(ses) && presses(ses) >= 2 && activeIs(ses, 'C52') },
    { id: 'depreciation', teach: 'Link two: depreciation is a cost on the income statement, added back on the cash flow because no cash left for it, and taken off the tunnel on the balance sheet.',
      text: 'Depreciation: jump down to the add-back in C65 and press Ctrl+[ to land on the charge in C47.', keys: K.dep, requires: ['statement-links', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell C65 · Ctrl+↓ hops block to block; the add-back is the second line of the cash flow.',
      check: (s, ses) => settled(ses) && presses(ses) >= 1 && activeIs(ses, 'C47') },
    { id: 'capex', teach: 'Link three: capex leaves on the cash flow and lands in PP&E on the balance sheet. PP&E reads the build, the wear so far, this month’s depreciation and this month’s capex, so one Ctrl+[ selects all four.',
      text: 'Capex: jump to PP&E in C81 and press Ctrl+[, which selects the build, the wear, depreciation in C47 and capex in C70.', keys: K.ppe, requires: ['statement-links', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell C81 · The balance sheet is the block after the cash flow; PP&E is its third line.',
      check: (s, ses) => settled(ses) && presses(ses) >= 1 && selects(ses, ['C47', 'C70']) },
    { id: 'debt', teach: 'Link four: a loan drawn or repaid moves cash on the cash flow and the balance on the balance sheet, by the same amount.',
      text: 'Debt: land on the loan in C85 and press Ctrl+[, which selects the opening loan and the repayment in C72.', keys: K.debt, requires: ['statement-links', 'go-to'],
      hintStuck: 'pulse cell C85 · The loan is the third liability.',
      check: (s, ses) => settled(ses) && presses(ses) >= 1 && selects(ses, ['C18', 'C72']) },
    { id: 'cash', teach: 'Link five: closing cash on the cash flow is the cash line on the balance sheet. That is why the balance check proves everything upstream: every other link has to be right for the two sides to agree.',
      text: 'Cash: Ctrl+End, climb to cash in C79 and press Ctrl+[ to land on closing cash in C76.', keys: K.cash, requires: ['statement-links', 'ctrl-home-end', 'ctrl-arrow'], convention: 'F2',
      hintStuck: 'pulse cell C79 · From the end of the page, Ctrl+↑ climbs a block at a time.',
      check: (s, ses) => settled(ses) && presses(ses) >= 1 && activeIs(ses, 'C76') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C8" Enter "2" Enter Ctrl+G "C91" Enter', cadence: 320 },
      text: 'Does it tie? Watch the cost per wash in C8 go to $2: the five links carry it to the balance sheet, and the check stays at zero.', requires: [],
      hintStuck: 'pulse cell C91 · Net income falls, so equity and cash fall by the same story.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  closing: [
    'Five links join three statements, and you followed each one with Ctrl+[.',
    'Net income, depreciation, capex, debt and closing cash: every model you build or inherit joins its statements with these five. Best practice: when the check leaves zero, follow the links in this order with Ctrl+[ and the break shows itself.',
  ],
  solution,
};
