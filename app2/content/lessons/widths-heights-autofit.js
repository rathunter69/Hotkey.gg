// Chapter 1 · 1.4.2 — The page's columns (clearcoat-weekly, S4a → S4b)
// The Report's columns are still Excel's defaults. The six day columns go to one equal width in a
// single press and the two comparison columns to another; the label column is fitted to its site
// names as a RANGE, so the title stays out of it; the clipped header row is wrapped and its height
// fitted to the wrapped lines; the title row is given a height in points. AutoFit over the day
// columns shows why period columns are set by hand (six columns, six of Excel's guesses) and Ctrl+Z
// puts the equal width back. The Total still answers the closer.
import { ROWH_DEFAULT } from '../../engine/sheet.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const settled = ses => !ses.editing && !ses.dialog;   // nothing half-typed, no card open

const W12 = 12 * 7 + 5, W14 = 14 * 7 + 5;   // Excel width units → px, as the engine converts them (89, 103)
const PT24 = Math.round(24 * 4 / 3);          // 24 points → 32 px
const DAY_COLS = [2, 3, 4, 5, 6, 7];          // B:G, the daily table's six day columns
const CMP_COLS = [8, 9];                      // H:I, Margin % and Prior week rev ($)
const LABEL_ROWS = [5, 11];                   // A5:A11, the site names and Total: the range column A is fitted to
const HEADER_COLS = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];   // the header cells that wrap
/** Every column in `cols` was set by hand (or fitted) to exactly `px`. */
const widthsAre = (rep, cols, px) => cols.every(c => rep.colW[c] === px && rep.colSet[c] === true);
/** Column A is fitted to the site labels only: the width its A5:A11 content needs, not the title's. */
const labelFit = rep => rep.colSet[1] === true && rep.colW[1] === Math.max(rep.neededWidth(1, LABEL_ROWS[0], LABEL_ROWS[1]), 16);
const headersWrapped = rep => HEADER_COLS.every(col => rep.cellAt(col + '4').wrap === true);
const headerRowFit = rep => headersWrapped(rep) && rep.rowH[4] > ROWH_DEFAULT;

export default {
  id: 'widths-heights-autofit',
  chapter: 'foundations',
  section: 'Structure',
  module: 'structure',
  workbook: 'clearcoat-weekly',
  state: { before: 'S4a', after: 'S4b' },
  title: 'The page’s columns',
  difficulty: 'easy',
  tags: ['structure', 'layout', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Alt H O W',
  conventions: ['C2'],
  teaches: ['column-width', 'row-height', 'autofit', 'wrap-text'],
  uses: ['row-col-select', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-arrow', 'undo-redo', 'ctrl-home-end', 'arrow-keys'],
  prerequisites: ['rows-cols-honest-totals'],
  brief: 'The Report’s columns are still Excel’s defaults: South Lamar is cut off, the headers are clipped, and every column is 8.43 characters wide. A page reads when its period columns share one width, its comparison columns another, its label column fits the longest name, and its headers wrap instead of spilling. Widths and AutoFit you know from 1.2.3; the new idea is which columns get set by hand and which get AutoFit. The key is `Alt H O W`.',
  goals: [
    { id: 'day-widths', teach: 'Select the columns first (Ctrl+Space, then Shift+→ across), then Alt, H, O, W, 12, Enter. One width for every period column is the convention on any page with a timeline.', text: 'The daily table’s six day columns B:G should share one width: select them from the timeline row and set Column Width 12.', keys: 'Ctrl+↓ ×4 ↓ → Ctrl+Shift+→ Ctrl+Space then Alt H O W "12" ↵', requires: ['column-width', 'row-col-select', 'ctrl-shift-arrow', 'ctrl-arrow', 'arrow-keys'], convention: 'C2',
      check: (s, ses) => { const rep = report(ses); return !!rep && widthsAre(rep, DAY_COLS, W12) && settled(ses); } },
    { id: 'comparison-widths', text: 'Margin % and Prior week rev in H:I are the comparison columns: select both from the header row and set them to 14, or press F4.', keys: 'Ctrl+Home ↓ ×3 Ctrl+→ Ctrl+Space Shift+← then Alt H O W "14" ↵', requires: ['column-width', 'row-col-select', 'shift-arrow', 'ctrl-arrow', 'ctrl-home-end', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && widthsAre(rep, CMP_COLS, W14) && widthsAre(rep, DAY_COLS, W12) && settled(ses); } },
    { id: 'fit-labels', teach: 'AutoFit on a selected range fits only those cells; AutoFit on a whole column fits everything in it, title included, which would make A absurdly wide. Select the names, then Alt, H, O, I.', text: 'Fit the label column to its site names, not the title: select A5:A11 and AutoFit, and column A sizes to South Lamar.', keys: 'Ctrl+← ↓ Ctrl+Shift+↓ then Alt H O I', requires: ['autofit', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && labelFit(rep) && settled(ses); } },
    { id: 'wrap-headers', teach: 'Wrap Text (Alt, H, W) folds a long header inside its cell; AutoFit Row Height (Alt, H, O, A) then sizes the row to the wrapped lines. Headers wrap; figures never do.', text: 'At these widths the headers B4:I4 are clipped: select them from B4, wrap the text, then AutoFit row 4 to two lines.', keys: 'Ctrl+↑ → Ctrl+Shift+→ then Alt H W then Alt H O A', requires: ['wrap-text', 'autofit', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && headerRowFit(rep) && settled(ses); } },
    { id: 'title-height', teach: 'Row Height (Alt, H, O, H) in points. A title row a little taller than the rest is the one height exception on a page.', text: 'The title row is cramped: set row 1 to height 24.', keys: 'Ctrl+Home then Alt H O H "24" ↵', requires: ['row-height', 'ctrl-home-end'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.rowH[1] === PT24 && settled(ses); } },
    { id: 'autofit-vs-equal', text: 'See why the day columns were set by hand: AutoFit B:G at once, read the uneven widths, then Ctrl+Z puts the equal 12 back.', keys: 'Ctrl+↓ ×4 ↓ → Ctrl+Shift+→ Ctrl+Space then Alt H O I then Ctrl+Z', requires: ['autofit', 'undo-redo', 'row-col-select', 'ctrl-shift-arrow', 'ctrl-arrow', 'arrow-keys'], convention: 'C2',
      check: (s, ses) => { const rep = report(ses); return !!rep && widthsAre(rep, DAY_COLS, W12) && widthsAre(rep, CMP_COLS, W14) && rep.rowH[1] === PT24 && headerRowFit(rep) && windowKeys(ses).includes('Ctrl+Z') && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "300" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Change Cedar Park’s washes in C9 to 300 and watch the Total in C11 answer through the new widths.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'B:G are width 12 and H:I width 14', check: (s, ses) => { const rep = report(ses); return !!rep && widthsAre(rep, DAY_COLS, W12) && widthsAre(rep, CMP_COLS, W14); } },
    { text: 'Column A is fitted to its site labels', check: (s, ses) => { const rep = report(ses); return !!rep && labelFit(rep); } },
    { text: 'B4:I4 wrap and row 4 stands two lines high', check: (s, ses) => { const rep = report(ses); return !!rep && headerRowFit(rep); } },
    { text: 'Row 1 stands 24 points high', check: (s, ses) => { const rep = report(ses); return !!rep && rep.rowH[1] === PT24; } },
  ],
  closing: [
    'Period columns are set by hand to one width, because AutoFit fits whatever happens to be in a column, and one stray label lower down leaves the days ragged. Label columns and wrapped header rows get AutoFit, because that is what it is for.',
    'Top-bucket tip: keep column A narrow as a margin and put the labels in B. Then make every period column the same width to the character, because reviewers notice.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Space Alt H O W "12" Enter Ctrl+Home Down Down Down Ctrl+Right Ctrl+Space Shift+Left Alt H O W "14" Enter Ctrl+Left Down Ctrl+Shift+Down Alt H O I Ctrl+Up Right Ctrl+Shift+Right Alt H W Alt H O A Ctrl+Home Alt H O H "24" Enter Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Space Alt H O I Ctrl+Z',
};
