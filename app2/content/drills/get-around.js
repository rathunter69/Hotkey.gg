// Practice · Foundations — Get around the report (screenplay 6.1; built from Edge jumps, Go anywhere
// and Block select). Every jump and every selection ends in a fix you can see (payoff pass,
// 2026-10-02): the report arrives half tidied, with the Total row plain, the headers left over their
// figures, the typed inputs black, the Revenue column too narrow to read, and a typo on Costs. The
// end state graded is the sheet's formats and the fixed figure, whatever keys put them there.
import { parsFromRoute } from '../../app/pars.js';
import { reportPage, costsPage, cutFrom, refsIn } from './austin.js';

const REPORT = reportPage();
const COSTS = costsPage();
COSTS.sheet.cells.B8 = { ...COSTS.sheet.cells.B8, value: 880 };   // Monday's card fees, a zero too many
const TOTAL = refsIn('A10:F10'), HEADERS = refsIn('B4:F4'), INPUTS = refsIn('B5:C9'), DAYS = refsIn('B17:G21');
const start = cutFrom(REPORT, (cells, sh) => {
  for (const ref of TOTAL) { delete cells[ref].bold; delete cells[ref].bt; }
  for (const ref of HEADERS) delete cells[ref].align;
  for (const ref of [...INPUTS, 'B13', ...DAYS]) delete cells[ref].fontColor;
  sh.colW = { ...sh.colW, 4: 40 };
  sh.active = { r: 5, c: 1 };
});
const report = ses => ses.sheets[0].sheet;
const blue = (s, refs) => refs.every(ref => s.cellAt(ref).fontColor === 'blue');

export default {
  id: 'get-around',
  chapter: 'foundations',
  title: 'Get around the report',
  task: 'Get around the report by its edges and fix each part you land on, then fix a typo on Costs by its address.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Report' }, COSTS.sheet],
  goals: [
    { id: 'total', text: 'Jump down to the Total row, select A10:F10 to its edge and bold it.', keys: 'Ctrl+↓ Ctrl+Shift+→ Ctrl+B',
      check: (s, ses) => TOTAL.every(ref => report(ses).cellAt(ref).bold) },
    { id: 'rule', text: 'Give the same Total row a top border.', keys: 'Alt H B P',
      check: (s, ses) => TOTAL.every(ref => report(ses).cellAt(ref).bt) },
    { id: 'headers', text: 'Jump up to the headers and right-align B4:F4 over their figures.', keys: 'Ctrl+↑ → Ctrl+Shift+→ then Alt H A R',
      check: (s, ses) => HEADERS.every(ref => report(ses).cellAt(ref).align === 'r') },
    { id: 'inputs', text: 'Select the typed washes and tickets B5:C9 and color them blue.', keys: '↓ Shift+→ Shift+↓ ×4 then Alt H F C → ×4 ↵',
      check: (s, ses) => blue(report(ses), INPUTS) },
    { id: 'cost', text: 'Jump down to the cost per wash in B13 and make it blue with F4.', keys: 'Ctrl+↓ Ctrl+↓ F4',
      check: (s, ses) => blue(report(ses), ['B13']) },
    { id: 'days', text: 'Select the washes by day B17:G21 by their edges and make them blue with F4.', keys: 'Ctrl+↓ ↓ Ctrl+Shift+↓ Ctrl+Shift+→ F4',
      check: (s, ses) => blue(report(ses), DAYS) },
    { id: 'revenue', text: 'Revenue in column D is too narrow to read: select the column and AutoFit it.', keys: 'Ctrl+Home → → Ctrl+Space then Alt H O I',
      check: (s, ses) => { const sh = report(ses); return sh.colW[4] >= sh.neededWidth(4); } },
    { id: 'costs', text: 'Go to Monday’s card fees on Costs, B8, and fix the typo: 880 should be 88.', keys: 'Ctrl+G "Costs!B8" ↵ "88" ↵',
      check: (s, ses) => ses.sheets[1].sheet.value('B8') === 88 },
  ],
  solution: 'Ctrl+Down Ctrl+Shift+Right Ctrl+B Alt H B P Ctrl+Up Right Ctrl+Shift+Right Alt H A R Down Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Alt H F C Right Right Right Right Enter '
    + 'Ctrl+Down Ctrl+Down F4 Ctrl+Down Down Ctrl+Shift+Down Ctrl+Shift+Right F4 Ctrl+Home Right Right Ctrl+Space Alt H O I Ctrl+G "Costs!B8" Enter "88" Enter',
  optimalKeys: 60,
  route: 40,
  pars: parsFromRoute(40),
};
