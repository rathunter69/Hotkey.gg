// Chapter 2 · 2.3.2 Actuals vs estimates: the divider (clearcoat-pnl, S3a → S3b)
// Two years happened and one is a forecast. The estimate header E4:E5 takes the gray header
// shade, Monthly's twelve estimate months take it too, and the last actual column D4:D35 takes a
// right border: the one vertical line a page allows. The closer moves FY26E retail revenue and
// EBITDA answers on the estimate side of the line.
import { DIVIDER_FILL, MONTH_COLS } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const monthly = ses => sheetOf(ses, 'Monthly');
const activeName = ses => ses.sheets[ses.sheetIndex].name;
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const at = (sh, ref) => sh.selectionText && sh.selectionText() === ref;

const shaded = sh => ['E4', 'E5'].every(ref => sh.cellAt(ref).fill === DIVIDER_FILL);
const monthsShaded = sh => MONTH_COLS.every(col => sh.cellAt(col + '4').fill === DIVIDER_FILL) && !sh.cellAt('O4').fill;
const divider = sh => { for (let r = 4; r <= 35; r++) if (!sh.cellAt('D' + r).br) return false; return !sh.cellAt('C7').br && !sh.cellAt('E7').br; };

export default {
  id: 'actuals-vs-estimates-divider',
  chapter: 'formatting',
  section: 'The page a buyer reads',
  module: 'the-page-a-buyer-reads',
  workbook: 'clearcoat-pnl',
  state: { before: 'S3a', after: 'S3b' },
  title: 'Actuals vs estimates: the divider',
  difficulty: 'medium',
  tags: ['format', 'presentation', 'pnl'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt H B R',
  conventions: ['B5', 'D8'],
  teaches: ['ae-divider'],
  uses: ['fills-and-colours', 'borders-menu', 'go-to', 'sheet-reference', 'ctrl-arrow', 'shift-arrow', 'formula-bar'],
  prerequisites: ['title-units-timeline-answer'],
  brief: 'Two of the three years happened; one is a forecast. A reader has to see the line between them without reading the flags, so the page carries a divider: a vertical border between the last actual and the first estimate, and a light shade on the estimate header. That’s the one vertical border a page is allowed, and the one fill besides the input tint. The key is `Alt H B R`.',
  goals: [
    { id: 'shade', teach: 'The estimate header takes the gray header shade, so the eye finds the forecast before it reads a number. Fill Color is Alt, H, H; → steps along the swatches and Enter picks one.', text: 'Shade the estimate header E4:E5 gray with Alt, H, H, → and Enter.', keys: '→ ×3 Ctrl+↓ → Shift+↓ Alt H H → ↵', requires: ['ae-divider', 'fills-and-colours', 'ctrl-arrow', 'shift-arrow'], convention: 'B5',
      hintStuck: 'pulse range E4:E5 · FY26E and its E flag sit in column E.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && shaded(sh) && settled(ses); } },
    { id: 'monthly', text: 'On Monthly, all twelve months are estimates: shade the whole header row C4:N4 the same gray.', keys: 'Ctrl+G "Monthly!C4:N4" ↵ Alt H H → ↵', requires: ['go-to', 'sheet-reference', 'fills-and-colours'], convention: 'B5',
      hintStuck: 'pulse range C4:N4 · The full year in O is a total, not a month.',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && monthsShaded(sh) && settled(ses); } },
    { id: 'select-actuals', text: 'Back on the P&L, select the last actual column D4:D35, from FY25A down to revenue per wash.', keys: `Ctrl+G "'P&L'!D4:D35" ↵`, requires: ['go-to', 'sheet-reference'],
      hintStuck: 'pulse range D4:D35 · FY25A is the last year that happened.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && activeName(ses) === 'P&L' && at(sh, 'D4:D35') && settled(ses); } },
    { id: 'divider', teach: 'The divider is a right border down the last actual column: Alt, H, B, R. It is the one vertical line a page allows, so it reads as a statement.', text: 'Give D4:D35 a right border with Alt, H, B, R.', keys: 'Alt H B R', requires: ['borders-menu', 'ae-divider'], convention: 'B5',
      hintStuck: 'pulse range D4:D35 · Right, not outside: one line between D and E.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && divider(sh) && settled(ses); } },
    { id: 'read-flag', text: 'Land on E5 and read E in the formula bar: the flag sits under the shade, right-aligned and italic.', keys: '→ ↓', requires: ['formula-bar'],
      hintStuck: 'pulse cell E5 · The flag row sits under the timeline.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && activeName(ses) === 'P&L' && at(sh, 'E5') && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "E7" Enter "27000" Enter Ctrl+G "E24" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch E7 change to 27000, and EBITDA in E24 answer on the estimate side of the line.', requires: [],
      hintStuck: 'pulse cell E24 · The estimate column is as live as the actuals.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The last actual column carries the divider', check: (s, ses) => { const sh = pnl(ses); return !!sh && divider(sh); } },
    { text: 'The estimate header is shaded, on the P&L and on Monthly', check: (s, ses) => { const p = pnl(ses), m = monthly(ses); return !!p && !!m && shaded(p) && monthsShaded(m); } },
  ],
  closing: [
    'One vertical line and one shade tell a reader what happened and what’s forecast.',
    'The eye finds the line between FY25A and FY26E before it reads a figure, and Monthly says every one of its months is an estimate. A buyer prices actuals and questions estimates, so the page tells them apart.',
  ],
  solution: `Right Right Right Ctrl+Down Right Shift+Down Alt H H Right Enter Ctrl+G "Monthly!C4:N4" Enter Alt H H Right Enter Ctrl+G "'P&L'!D4:D35" Enter Alt H B R Right Down`,
};
