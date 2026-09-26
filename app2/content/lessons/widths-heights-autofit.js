// Chapter 1 · 1.4.2 — Widths, heights, AutoFit (voltline-weekly, S4a → S4b)
// The Report's columns are still Excel's defaults. The six day columns go to one equal width in a
// single press and the two comparison columns to another; the label column is fitted to its site
// names as a RANGE, so the title stays out of it; the title row is given a height in points and
// then fitted back; the clipped header row is wrapped and its height fitted to the wrapped lines.
// AutoFit over the day columns shows why period columns are set by hand — six columns, six of
// Excel's guesses — and Ctrl+Z puts the equal width back. The Total still answers the closer.
import { ROWH_DEFAULT } from '../../engine/sheet.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const settled = ses => !ses.editing && !ses.dialog;   // nothing half-typed, no card open
/** An Alt walk (each letter logged on its own) was pressed inside this goal's key window. */
const walked = (ses, path) => windowKeys(ses).join(' ').includes(path);

const W12 = 12 * 7 + 5, W14 = 14 * 7 + 5;   // Excel width units → px, as the engine converts them (89, 103)
const PT24 = Math.round(24 * 4 / 3);          // 24 points → 32 px
const DAY_COLS = [2, 3, 4, 5, 6, 7];          // B:G — the daily table's six day columns
const CMP_COLS = [8, 9];                      // H:I — Margin %, Prior week rev ($)
const LABEL_ROWS = [5, 11];                   // A5:A11 — the site names and Total, the range column A is fitted to
const HEADER_COLS = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];   // the header cells that wrap
/** Every column in `cols` was set by hand (or fitted) to exactly `px`. */
const widthsAre = (rep, cols, px) => cols.every(c => rep.colW[c] === px && rep.colSet[c] === true);
/** Column A is fitted to the site labels only — the width its A5:A11 content needs, not the title's. */
const labelFit = rep => rep.colSet[1] === true && rep.colW[1] === rep.neededWidth(1, LABEL_ROWS[0], LABEL_ROWS[1]);
const headersWrapped = rep => HEADER_COLS.every(col => rep.cellAt(col + '4').wrap === true);
const headerRowFit = rep => headersWrapped(rep) && rep.rowH[4] === 2 * ROWH_DEFAULT;

export default {
  id: 'widths-heights-autofit',
  chapter: 'foundations',
  section: 'Structure',
  module: 'structure',
  workbook: 'voltline-weekly',
  state: { before: 'S4a', after: 'S4b' },
  title: 'Widths, heights, AutoFit',
  difficulty: 'easy',
  tags: ['structure', 'layout', 'report'],
  access: 'free',
  minutes: 5,
  headline: 'Alt H O W',
  conventions: ['C2'],
  teaches: ['column-width', 'row-height', 'autofit', 'wrap-text'],
  uses: ['row-col-select', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-arrow', 'undo-redo', 'ctrl-home-end'],
  prerequisites: ['rows-cols-honest-totals'],
  brief: 'The Report’s columns are still Excel’s defaults: South Lamar is cut off at the default width, the header row is clipped, and every column sits at 8.43 characters wide. Set the day columns to one width and the comparison columns to another, fit the label column to its site names, size the title row, and wrap the headers so nothing is clipped. The key is `Alt H O W`.',
  goals: [
    { id: 'day-widths', teach: 'Column Width (Alt, H, O, W) sets every selected column to one width in Excel character units: select the columns first, then type the number and Enter.', text: 'The daily table’s six day columns B:G should share one width: select them from its timeline row and set Column Width 12.', keys: 'Ctrl+↓ ×4 ↓ → Ctrl+Shift+→ Ctrl+Space then Alt H O W "12" ↵', requires: ['column-width', 'row-col-select', 'shift-arrow', 'ctrl-arrow'], convention: 'C2',
      check: (s, ses) => { const rep = report(ses); return !!rep && widthsAre(rep, DAY_COLS, W12) && settled(ses); } },
    { id: 'comparison-widths', text: 'Margin % and Prior week rev ($) in H:I are the comparison columns: select both from the header row and set them to 14.', keys: 'Ctrl+↑ ×2 Ctrl+→ Ctrl+Space Shift+← then Alt H O W "14" ↵', requires: ['column-width', 'row-col-select', 'shift-arrow', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && widthsAre(rep, CMP_COLS, W14) && widthsAre(rep, DAY_COLS, W12) && settled(ses); } },
    { id: 'fit-labels', teach: 'AutoFit Column Width (Alt, H, O, I) sizes a column to its content — a whole column fits everything in it, a selected range fits only those cells.', text: 'Fit the label column to its site names, not the title: select A5:A11 and AutoFit — column A sizes to South Lamar.', keys: 'Ctrl+← ↓ Ctrl+Shift+↓ then Alt H O I', requires: ['autofit', 'ctrl-arrow', 'ctrl-shift-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && labelFit(rep) && settled(ses); } },
    { id: 'title-height', teach: 'Row Height (Alt, H, O, H) sets the selected rows’ height in points; AutoFit Row Height (Alt, H, O, A) sizes a row back to its content.', text: 'The title row is cramped at the default height: from A1, set Row Height 24 points.', keys: 'Ctrl+Home then Alt H O H "24" ↵', requires: ['row-height', 'ctrl-home-end'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.rowH[1] === PT24 && settled(ses); } },
    { id: 'fit-title', text: 'Twenty-four was a guess: AutoFit Row Height puts row 1 back to what its one line of text needs.', keys: 'Alt H O A', requires: ['autofit'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.rowH[1] === ROWH_DEFAULT && settled(ses); } },
    { id: 'wrap-headers', teach: 'Wrap Text (Alt, H, W) folds a long entry onto more lines inside its cell, and AutoFit Row Height then sizes the row to the wrapped lines.', text: 'At these widths the headers B4:I4 are clipped: select them from B4, wrap the text, then AutoFit row 4 to two lines.', keys: 'Ctrl+↓ ×2 → Ctrl+Shift+→ then Alt H W then Alt H O A', requires: ['wrap-text', 'autofit', 'ctrl-arrow', 'ctrl-shift-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && headerRowFit(rep) && settled(ses); } },
    { id: 'autofit-vs-equal', text: 'See why the day columns were set by hand: AutoFit B:G at once, read the uneven widths, then Ctrl+Z puts the equal 12 back.', keys: 'Ctrl+↓ ×2 Ctrl+Shift+→ Ctrl+Space then Alt H O I then Ctrl+Z', requires: ['autofit', 'undo-redo', 'row-col-select', 'ctrl-shift-arrow'], convention: 'C2',
      check: (s, ses) => { const rep = report(ses); return !!rep && widthsAre(rep, DAY_COLS, W12) && windowKeys(ses).includes('Ctrl+Z') && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "3000" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Cedar Park’s kWh in C9 change to 3,000 and the Total in C11 answer through the new widths.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'B:G are width 12 and H:I width 14', check: (s, ses) => { const rep = report(ses); return !!rep && widthsAre(rep, DAY_COLS, W12) && widthsAre(rep, CMP_COLS, W14); } },
    { text: 'Column A is fitted to its site labels', check: (s, ses) => { const rep = report(ses); return !!rep && labelFit(rep); } },
    { text: 'B4:I4 wrap and row 4 stands two lines high', check: (s, ses) => { const rep = report(ses); return !!rep && headerRowFit(rep); } },
    { text: 'Row 1 is back at its default height', check: (s, ses) => { const rep = report(ses); return !!rep && rep.rowH[1] === ROWH_DEFAULT; } },
  ],
  closing: [
    'The Report’s columns now read as a page: the six day columns share one width, the comparison columns another, the label column fits its longest site name, and nothing in the header row is clipped — equal period columns (C2).',
    'AutoFit fits whatever happens to sit in a column — one stray label lower down in E breaks the equal period columns — so set period columns by hand, and let AutoFit size the labels and the wrapped rows.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Space Alt H O W "12" Enter Ctrl+Up Ctrl+Up Ctrl+Right Ctrl+Space Shift+Left Alt H O W "14" Enter Ctrl+Left Down Ctrl+Shift+Down Alt H O I Ctrl+Home Alt H O H "24" Enter Alt H O A Ctrl+Down Ctrl+Down Right Ctrl+Shift+Right Alt H W Alt H O A Ctrl+Down Ctrl+Down Ctrl+Shift+Right Ctrl+Space Alt H O I Ctrl+Z',
};
