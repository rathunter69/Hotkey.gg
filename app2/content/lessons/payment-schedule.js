// Chapter 3 · 3.5.4 A payment schedule with anchors (clearcoat-databook, S5c → S5d)
// The Cedar Park loan month by month on Loans, rows 44 to 163: months 1 to 120 by Fill Series (blue,
// typed), row 44 written once (opening reads the principal, interest is balance times the anchored
// monthly rate, principal is the payment less interest, closing is opening less principal), row 45's
// opening reads row 44's closing and the rest of row 45 takes row 44's formulas by Paste Special
// Formulas (so the dollar sign stays on the first row only), then D45:G163 filled down with Ctrl+D.
// IPMT and PPMT check the split, a running total of interest runs down J, and two checks at C167 and
// C168 read zero. Checks recompute the schedule from the loan's inputs, and liveness is read on the
// first and last rows. The closer moves the rate to 6% and the schedule still lands on zero.
import { liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const loans = ses => sheetOf(ses, 'Loans');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b, tol = 1e-6) => isNum(a) && isNum(b) && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const live = (sh, ref) => liveness(sh, ref).ok;
const FIRST = 44, LAST = 163;
const rows = () => Array.from({ length: LAST - FIRST + 1 }, (_, i) => FIRST + i);

/** The schedule the loan's inputs give: per row the opening, interest, principal, closing and interest to date. */
function schedule(sh) {
  const P = sh.value('C6'), r = sh.value('C12'), pmt = sh.value('C16');
  const out = []; let bal = P, cum = 0;
  for (let i = 0; i <= LAST - FIRST; i++) { const int = bal * r, prin = pmt - int; cum += int; out.push({ open: bal, int, prin, close: bal - prin, cum }); bal -= prin; }
  return out;
}
const months = sh => rows().every((r, i) => sh.value('C' + r) === i + 1 && !sh.cellAt('C' + r).formula && sh.cellAt('C' + r).fontColor === 'blue');
const colOk = (sh, col, key) => { const s = schedule(sh); return rows().every((r, i) => !!sh.cellAt(col + r).formula && near(sh.value(col + r), s[i][key], 1e-6)); };
const firstRow = sh => ['D', 'E', 'F', 'G'].every((c, j) => { const s = schedule(sh)[0]; return !!sh.cellAt(c + FIRST).formula && near(sh.value(c + FIRST), [s.open, s.int, s.prin, s.close][j]) && live(sh, c + FIRST); });
const secondRow = sh => ['D', 'E', 'F', 'G'].every((c, j) => { const s = schedule(sh)[1]; return !!sh.cellAt(c + 45).formula && near(sh.value(c + 45), [s.open, s.int, s.prin, s.close][j]) && live(sh, c + 45); });
const filled = sh => colOk(sh, 'D', 'open') && colOk(sh, 'E', 'int') && colOk(sh, 'F', 'prin') && colOk(sh, 'G', 'close') && live(sh, 'G' + LAST) && Math.abs(sh.value('G' + LAST)) < 0.01;
const functionsFirst = sh => { const s = schedule(sh)[0]; return near(sh.value('H44'), s.int) && near(sh.value('I44'), s.prin) && live(sh, 'H44') && live(sh, 'I44'); };
const functionsDown = sh => colOk(sh, 'H', 'int') && colOk(sh, 'I', 'prin') && colOk(sh, 'J', 'cum') && live(sh, 'J' + LAST);
const reads = (sh, ref, refs) => { const f = String(sh.cellAt(ref).formula || '').toUpperCase().replace(/\$/g, ''); return refs.every(x => f.includes(x)); };
const checks = sh => isNum(sh.value('C167')) && Math.abs(sh.value('C167')) < 0.005 && reads(sh, 'C167', ['E44', 'E163', 'C18'])
  && isNum(sh.value('C168')) && Math.abs(sh.value('C168')) < 0.005 && reads(sh, 'C168', ['G163']);

export default {
  id: 'payment-schedule',
  chapter: 'formulas',
  section: 'Time value of money',
  module: 'time-value-of-money',
  workbook: 'clearcoat-databook',
  state: { before: 'S5c', after: 'S5d' },
  title: 'A payment schedule with anchors',
  difficulty: 'hard',
  tags: ['formulas', 'finance', 'loan', 'anchors'],
  access: 'paid',
  minutes: 9,
  headline: 'F4',
  conventions: ['B1', 'E2'],
  teaches: ['loan-schedule', 'running-total'],
  uses: ['pmt-pv-fv', 'fill-series', 'font-color', 'input-colour-convention', 'relative-absolute', 'f4-anchor', 'fill-down-right', 'copy-cut-paste', 'paste-special', 'sum-family', 'check-cell', 'formula-basics', 'formula-operators', 'go-to', 'keytips', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys', 'tab-commits'],
  prerequisites: ['irr-xirr'],
  brief: 'A loan schedule shows every month: the opening balance, the interest, the principal and the closing balance that opens the next month. The payment stays the same while the split shifts toward principal as the balance falls. Write one row with every input anchored, fill it down 120 times, then check it two ways: IPMT and PPMT give the same split, and the interest adds up to the total from 3.5.1. The key is `F4`.',
  wow: 'One anchored row filled a hundred and twenty times, and the balance lands on zero.',
  goals: [
    { id: 'months', text: 'On Loans, type 1 in C44, make it blue, then select down column C and Fill Series to a stop value of 120.',
      keys: 'Ctrl+G "Loans!C44" ↵ "1" ↵ ↑ Alt H F C → ×4 ↵ Ctrl+Shift+↓ Alt H F I S Alt+O "120" ↵', requires: ['fill-series', 'font-color', 'input-colour-convention', 'go-to', 'keytips', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'B1',
      hintStuck: 'pulse range C44:C163 · Alt+O in the Series dialog sets where the series stops.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && months(sh) && settled(ses); } },
    { id: 'first-row', teach: 'Each month’s interest is the opening balance times the monthly rate in C12, and the principal is the payment in C16 less that interest. The rate and the payment are the same every month, so anchor both with F4 before the row is filled down; the balance is not anchored, because it moves.',
      text: 'Write month 1 across D44:G44: opening =C6, interest =D44*$C$12, principal =$C$16-E44, closing =D44-F44.',
      keys: '→ "=C6" Tab "=D44*$C$12" Tab "=$C$16-E44" Tab "=D44-F44" ↵', requires: ['loan-schedule', 'relative-absolute', 'f4-anchor', 'formula-basics', 'formula-operators', 'tab-commits', 'arrow-keys'], convention: 'E2',
      hintStuck: 'pulse range D44:G44 · Opening, interest, principal, closing: four formulas with a Tab between them.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && months(sh) && firstRow(sh) && settled(ses); } },
    { id: 'pattern', teach: 'Paste Special Formulas (Ctrl+Alt+V, then F) pastes the formulas and leaves the cell’s own format alone, so month 2 keeps its plain number format while the dollar sign stays on the first row.',
      text: 'Make month 2 the pattern: in D45 the opening reads the last closing, =G44, then copy E44:G44 and paste only its formulas into E45.',
      keys: '"=G44" ↵ ↑ ×2 → Shift+→ ×2 Ctrl+C ↓ Ctrl+Alt+V F ↵', requires: ['loan-schedule', 'copy-cut-paste', 'paste-special', 'formula-basics', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range D45:G45 · Only the opening changes from month 1; the other three formulas move down a row as they are.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && firstRow(sh) && secondRow(sh) && settled(ses); } },
    { id: 'fill', text: 'Select D45:G163 and fill month 2 down to month 120 with Ctrl+D, then read the closing balance in G163: zero.',
      keys: '← ×2 Ctrl+↓ → Shift+→ ×3 Ctrl+Shift+↑ Ctrl+D', requires: ['fill-down-right', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'], convention: 'E2',
      hintStuck: 'pulse range D45:G163 · The month column runs to row 163, so the fill stops where the months do.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && filled(sh) && settled(ses); } },
    { id: 'functions', teach: 'IPMT(rate, period, periods, principal) and PPMT with the same arguments return one month’s interest and principal directly. Like PMT they come back negative, so a minus in front matches the schedule.',
      text: 'Check the split with the functions: in H44 =-IPMT($C$12,C44,$C$13,$C$6) and in I44 =-PPMT($C$12,C44,$C$13,$C$6).',
      keys: 'Ctrl+↑ ↓ Ctrl+→ → "=-IPMT($C$12,C44,$C$13,$C$6)" Tab "=-PPMT($C$12,C44,$C$13,$C$6)" ↵', requires: ['loan-schedule', 'pmt-pv-fv', 'relative-absolute', 'formula-basics', 'ctrl-arrow', 'arrow-keys', 'tab-commits'],
      hintStuck: 'pulse range H44:I44 · Only the month, C44, moves down the schedule; the rate, the periods and the principal are anchored.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && filled(sh) && functionsFirst(sh) && settled(ses); } },
    { id: 'running', teach: 'A running total anchors the start of its range and lets the end move: =SUM($E$44:E44) reads one month, and filled down it reads every month so far. The same pattern totals anything that accumulates, capex to date or cash paid so far.',
      text: 'In J44 total the interest to date, =SUM($E$44:E44), then copy H44:J44 and paste its formulas down to row 163.',
      keys: '↑ → ×2 "=SUM($E$44:E44)" ↵ ↑ ← ×2 Shift+→ ×2 Ctrl+C ← Ctrl+↓ → Shift+→ ×2 Ctrl+Shift+↑ Ctrl+Alt+V F ↵', requires: ['running-total', 'relative-absolute', 'f4-anchor', 'sum-family', 'copy-cut-paste', 'paste-special', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'], convention: 'E2',
      hintStuck: 'pulse range H44:J163 · Paste formulas over the whole block, row 44 included, and every format stays as it was.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && filled(sh) && functionsDown(sh) && settled(ses); } },
    { id: 'checks', text: 'In the checks at C167 and C168 tie the schedule out: =ROUND(SUM(E44:E163)-C18,2), then =ROUND(G163,2); both read zero.',
      keys: 'Ctrl+G "C167" ↵ "=ROUND(SUM(E44:E163)-C18,2)" ↵ "=ROUND(G163,2)" ↵', requires: ['check-cell', 'sum-family', 'formula-basics', 'go-to'],
      hintStuck: 'pulse range C167:C168 · The interest in the schedule is the interest from 3.5.1, and the last balance is nothing.',
      check: (s, ses) => { const sh = loans(ses); return !!sh && functionsDown(sh) && checks(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Loans!C7" Enter "6%" Enter Ctrl+G "Loans!G163" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch the rate in C7 change to 6%, the whole schedule run again, and month 120 still close at zero.', requires: [],
      hintStuck: 'pulse cell G163 · Every row reads the inputs, so the schedule always clears the loan.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Months 1 to 120 run down C44:C163 and the schedule fills D44:G163, closing at zero', check: (s, ses) => { const sh = loans(ses); return !!sh && months(sh) && filled(sh); } },
    { text: 'IPMT, PPMT and the interest to date run beside it, and both checks read zero', check: (s, ses) => { const sh = loans(ses); return !!sh && functionsDown(sh) && checks(sh); } },
  ],
  closing: [
    'Every month of the Cedar Park loan is on the page now, and the interest it adds up to is the $1.38m from the first lesson to the cent. The first month is half interest; by the last, nearly all of the payment is principal.',
    'The row was written once, with the rate and the payment anchored and the balance free to move, and the fill did the other 119. That is how a schedule stays right when the terms change.',
  ],
  solution: 'Ctrl+G "Loans!C44" Enter "1" Enter Up Alt H F C Right Right Right Right Enter Ctrl+Shift+Down Alt H F I S Alt+O "120" Enter Right "=C6" Tab "=D44*$C$12" Tab "=$C$16-E44" Tab "=D44-F44" Enter "=G44" Enter Up Up Right Shift+Right Shift+Right Ctrl+C Down Ctrl+Alt+V F Enter Left Left Ctrl+Down Right Shift+Right Shift+Right Shift+Right Ctrl+Shift+Up Ctrl+D Ctrl+Up Down Ctrl+Right Right "=-IPMT($C$12,C44,$C$13,$C$6)" Tab "=-PPMT($C$12,C44,$C$13,$C$6)" Enter Up Right Right "=SUM($E$44:E44)" Enter Up Left Left Shift+Right Shift+Right Ctrl+C Left Ctrl+Down Right Shift+Right Shift+Right Ctrl+Shift+Up Ctrl+Alt+V F Enter Ctrl+G "C167" Enter "=ROUND(SUM(E44:E163)-C18,2)" Enter "=ROUND(G163,2)" Enter',
};
