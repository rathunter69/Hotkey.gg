// Chapter 2 · 2.1.4 Dates on the timeline (clearcoat-pnl, S1c → S1d)
// The column headers are text, FY2024 typed by the system, and text can’t be added to, compared
// or rolled forward. A timeline is real dates (C2): the three year ends typed into C4:E4 as a Tab
// run, shown as Dec-24 with Ctrl+1 then D, the row labeled Fiscal year ending and right-aligned,
// the A/E flags under the years (right-aligned, italic), the timeline row bold. The closer rolls
// C4 back a year and the header follows the date.
import { YEAR_COLS, YEAR_ENDS, FLAGS, YEAR_LABEL } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;

const HEADS = YEAR_COLS.map(col => col + '4');
const FLAG_CELLS = YEAR_COLS.map(col => col + '5');
const yearEnds = sh => HEADS.every((ref, i) => sh.value(ref) === YEAR_ENDS[i]);
const shownAsDates = sh => HEADS.every(ref => sh.cellAt(ref).fmtStyle === 'date');
const labeled = sh => { const c = sh.cellAt('B4'); return c.value === YEAR_LABEL && c.align === 'r'; };
const flagsTyped = sh => FLAG_CELLS.every((ref, i) => sh.value(ref) === FLAGS[i]);
const flagsSet = sh => FLAG_CELLS.every(ref => { const c = sh.cellAt(ref); return c.align === 'r' && c.it === true; });
const rowBold = sh => ['A4', 'B4', ...HEADS].every(ref => sh.cellAt(ref).bold === true);

export default {
  id: 'dates-on-the-timeline',
  chapter: 'formatting',
  section: 'Number formats',
  module: 'number-formats',
  workbook: 'clearcoat-pnl',
  state: { before: 'S1c', after: 'S1d' },
  title: 'Dates on the timeline',
  difficulty: 'easy',
  tags: ['format', 'dates', 'timeline', 'pnl'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+1',
  conventions: ['C2', 'D6', 'B5'],
  teaches: ['date-format'],
  uses: ['tab-commits', 'format-cells-tabs', 'shift-arrow', 'ctrl-arrow', 'align-command', 'bold-italic-underline', 'type-to-enter', 'row-col-select'],
  prerequisites: ['currency-and-percent-lines'],
  brief: 'The column headers are text, FY2024 typed by the system, and text can’t be added to, compared or rolled forward. A fiscal year is the twelve months the accounts cover, and a timeline is real dates: the year end of each, formatted to read the way the page wants. A is actual; E is the estimate for the year still running. Put real dates in row 4, format them, and add the A and E flags underneath, so the headers can write themselves in module 2.6. The key is `Ctrl+1`.',
  goals: [
    { id: 'type-year-ends', teach: 'A date is a serial number of days shown in a date format: 12/31/2024 is 45657 underneath, so it sorts, subtracts and rolls forward.', text: 'Type the three year ends into C4:E4 as a Tab run: 12/31/2024, 12/31/2025 and 12/31/2026.', keys: 'Ctrl+↓ ×2 → ×2 "12/31/2024" Tab "12/31/2025" Tab "12/31/2026" ↵', requires: ['date-format', 'tab-commits', 'ctrl-arrow'], convention: 'C2',
      hintStuck: 'pulse cell C4 · Type over the text headers; Tab moves right after each.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && yearEnds(sh) && settled(ses); } },
    { id: 'show-as-dates', text: 'Select C4:E4 and show the dates the way the page reads them with Ctrl+1 then D, which gives Dec-24.', keys: '↑ Shift+→ ×2 Ctrl+1 D', requires: ['date-format', 'format-cells-tabs', 'shift-arrow'], convention: 'C2',
      hintStuck: 'pulse range C4:E4 · Enter after a Tab run lands one row under the first date.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && yearEnds(sh) && shownAsDates(sh) && settled(ses); } },
    { id: 'label-row', text: 'Label the row: type Fiscal year ending in B4 and right-align it over the dates with Alt H A R.', keys: '← "Fiscal year ending" ↵ ↑ Alt H A R', requires: ['type-to-enter', 'align-command'], convention: 'D6',
      hintStuck: 'pulse cell B4 · The label goes left of the first date, over the labels column.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && labeled(sh) && settled(ses); } },
    { id: 'type-flags', text: 'Type the flags A, A and E into C5:E5 as a Tab run, one under each year.', keys: '↓ → "A" Tab "A" Tab "E" ↵', requires: ['tab-commits'], convention: 'B5',
      hintStuck: 'pulse cell C5 · Two actual years, then the estimate.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && flagsTyped(sh) && settled(ses); } },
    { id: 'set-flags', text: 'Select the flags C5:E5, right-align them with Alt H A R, then set them in italic with Ctrl+I.', keys: '↑ Shift+→ ×2 Alt H A R Ctrl+I', requires: ['align-command', 'bold-italic-underline', 'shift-arrow'], convention: 'B5',
      hintStuck: 'pulse range C5:E5 · The flags sit right under the dates they describe.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && flagsSet(sh) && settled(ses); } },
    { id: 'bold-row', text: 'Bold the timeline: select row 4 with Shift+Space and press Ctrl+B.', keys: '↑ Shift+Space Ctrl+B', requires: ['row-col-select', 'bold-italic-underline'], convention: 'C2',
      hintStuck: 'pulse row 4 · Shift+Space takes the whole row of the active cell.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && rowBold(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C4" Enter "12/31/2023" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch C4 change to 12/31/2023 and the header read Dec-23: the page rolls with one edit.', requires: [],
      hintStuck: 'pulse cell C4 · The header shows whatever date is underneath.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C4:E4 hold the three year ends as real dates, shown as Dec-24 to Dec-26', check: (s, ses) => { const sh = pnl(ses); return !!sh && yearEnds(sh) && shownAsDates(sh); } },
    { text: 'The row is labeled Fiscal year ending and bold', check: (s, ses) => { const sh = pnl(ses); return !!sh && labeled(sh) && rowBold(sh); } },
    { text: 'The A and E flags sit under the years, right-aligned and in italic', check: (s, ses) => { const sh = pnl(ses); return !!sh && flagsTyped(sh) && flagsSet(sh); } },
  ],
  closing: [
    'The timeline is real dates now, and the page can roll forward a year in one edit.',
    'Each header is a count of days shown through a date format, which is why Ctrl+1 can show it any way the page likes. The flags under the years say which two happened and which one is the forecast.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Right Right "12/31/2024" Tab "12/31/2025" Tab "12/31/2026" Enter Up Shift+Right Shift+Right Ctrl+1 D Left "Fiscal year ending" Enter Up Alt H A R Down Right "A" Tab "A" Tab "E" Enter Up Shift+Right Shift+Right Alt H A R Ctrl+I Up Shift+Space Ctrl+B',
};
