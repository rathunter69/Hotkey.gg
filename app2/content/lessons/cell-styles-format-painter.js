// Chapter 2 · 2.3.6 Cell styles and Format Painter at scale (clearcoat-pnl, S3e + PLANT_MONTHLY → S3f)
// Monthly arrives as the analyst left it: the labels, sections, costs and margins typed in, and no
// formatting. One formatted column of the P&L, C6:C30, pasted as formats over Monthly!C6:O30 tiles
// across all thirteen columns; the label column takes P&L!B6:B30's formats; the full-year column
// goes back to black, since it is formulas; the title takes P&L!A1's look and centers across
// A1:O1; the P&L's total line is saved as a cell style, Total line, and applied to Monthly's
// subtotal rows by name; and Monthly takes the P&L's widths, freeze and gridlines. The engine has
// no Format Painter, so the title travels by Paste Special Formats (script-ch2.md, Built differently).
import { MONTH_COLS, FULL_YEAR_COL, MARGIN_W, PLANT_MONTHLY, TOTAL_STYLE } from '../workbooks/clearcoat-pnl.js';
import { TITLE_FSZ, FIGURE_W } from '../workbooks/page.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const monthly = ses => sheetOf(ses, 'Monthly');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const FIG_COLS = [...MONTH_COLS, FULL_YEAR_COL];
const FIELDS = ['bold', 'it', 'bt', 'bdbl', 'fmtStyle', 'numFmt', 'indent'];
const sameFmt = (a, b) => FIELDS.every(k => (a[k] || null) === (b[k] || null));
const ROWS = Array.from({ length: 25 }, (_, i) => 6 + i);

const figuresDressed = (p, m) => ROWS.every(r => FIG_COLS.every(col => sameFmt(p.cellAt('C' + r), m.cellAt(col + r))));
const labelsDressed = (p, m) => ROWS.every(r => sameFmt(p.cellAt('B' + r), m.cellAt('B' + r)));
const fullYearBlack = m => { for (let r = 6; r <= 24; r++) if (m.cellAt(FULL_YEAR_COL + r).fontColor) return false; return true; };
const titled = m => m.cellAt('A1').bold && m.cellAt('A1').fsz === TITLE_FSZ && (m.cellAt('A1').ca | 0) === 15;
const widths = m => m.colW[1] === MARGIN_W && FIG_COLS.every((col, i) => m.colW[3 + i] === FIGURE_W);
const fitB = m => m.colSet[2] && m.colW[2] === m.neededWidth(2, 4, 30);
const styleOf = ses => (ses.cellStyles || []).find(x => x.name.toLowerCase() === TOTAL_STYLE.name.toLowerCase()) || null;
const styleSaved = ses => { const st = styleOf(ses); return !!st && !st.includes.number && st.includes.font && st.includes.border && st.fmt.bold === true && st.fmt.bt === true; };
const styled = m => TOTAL_STYLE.rows.every(r => ['B', ...FIG_COLS].every(col => (m.cellAt(col + r).style || '').toLowerCase() === TOTAL_STYLE.name.toLowerCase()));

export default {
  id: 'cell-styles-format-painter',
  chapter: 'formatting',
  section: 'The page a buyer reads',
  module: 'the-page-a-buyer-reads',
  workbook: 'clearcoat-pnl',
  state: { before: 'S3e', after: 'S3f' },
  plant: PLANT_MONTHLY,
  title: 'One page\u2019s formats carried to the next',
  difficulty: 'medium',
  tags: ['presentation', 'paste-special', 'monthly'],
  access: 'paid',
  minutes: 7,
  headline: 'Ctrl+Alt+V',
  conventions: ['E4', 'B1', 'C2', 'A3'],
  teaches: ['paste-formats-tile', 'cell-style'],
  uses: ['paste-special', 'copy-cut-paste', 'go-to', 'sheet-reference', 'format-cells-dialog', 'format-cells-tabs', 'center-across', 'font-color', 'input-colour-convention', 'column-width', 'autofit', 'freeze-panes', 'gridlines', 'label-column'],
  prerequisites: ['widths-and-the-label-column'],
  brief: 'Monthly is the P&L twelve columns wide, and formatting it cell by cell would take the morning. Paste Special Formats carries a format from one place to many: copy one formatted column, paste its formats over a wider block, and the column repeats across every month. A cell style names a look so any page can use it by name. Dress Monthly from the P&L, then give it the P&L’s title, total line, widths and settings. The key is `Ctrl+Alt+V`.',
  goals: [
    { id: 'figures', teach: 'Paste Special Formats (Ctrl+Alt+V, T) pastes how the cells look and nothing they hold. A one-column source pasted over a wider block repeats across every column, so one P&L column dresses all thirteen.', text: 'Copy P&L!C6:C30 and paste its formats over Monthly!C6:O30 in one paste with Ctrl+Alt+V, T.', keys: `Ctrl+G "'P&L'!C6:C30" ↵ Ctrl+C Ctrl+G "Monthly!C6:O30" ↵ Ctrl+Alt+V T ↵`, requires: ['paste-formats-tile', 'paste-special', 'copy-cut-paste', 'go-to', 'sheet-reference'], convention: 'E4',
      hintStuck: 'pulse range C6:O30 · Column C on the P&L has no divider, so it is the one to copy.',
      check: (s, ses) => { const p = pnl(ses), m = monthly(ses); return !!p && !!m && figuresDressed(p, m) && settled(ses); } },
    { id: 'labels', text: 'The label column takes its own formats: copy P&L!B6:B30 and paste formats onto Monthly!B6.', keys: `Ctrl+G "'P&L'!B6:B30" ↵ Ctrl+C Ctrl+G "Monthly!B6" ↵ Ctrl+Alt+V T ↵`, requires: ['paste-special', 'copy-cut-paste', 'go-to'], convention: 'D6',
      hintStuck: 'pulse range B6:B30 · Bold sections, indented lines, bold totals with their borders.',
      check: (s, ses) => { const p = pnl(ses), m = monthly(ses); return !!p && !!m && labelsDressed(p, m) && settled(ses); } },
    { id: 'full-year', teach: 'The P&L’s column C is blue because it is typed; Monthly’s full year is formulas, so it goes back to black. On Ctrl+1’s Font tab, Alt+C reaches the color and ← steps back to Automatic.', text: 'The full year O7:O24 is formulas, not typed: set its font color back to Automatic from Ctrl+1’s Font tab.', keys: 'Ctrl+G "Monthly!O7:O24" ↵ Ctrl+1 F Alt+C ← ×5 ↵', requires: ['font-color', 'input-colour-convention', 'format-cells-dialog'], convention: 'B1',
      hintStuck: 'pulse range O7:O24 · Every cell in O is a SUM across the months.',
      check: (s, ses) => { const m = monthly(ses); return !!m && fullYearBlack(m) && settled(ses); } },
    { id: 'title', text: 'Copy the P&L’s title cell A1, paste its formats onto Monthly!A1, then center it across A1:O1.', keys: `Ctrl+G "'P&L'!A1" ↵ Ctrl+C Ctrl+G "Monthly!A1" ↵ Ctrl+Alt+V T ↵ Ctrl+G "Monthly!A1:O1" ↵ Ctrl+1 A Alt+H ↓ ×4 ↵`, requires: ['paste-special', 'center-across', 'format-cells-tabs'], convention: 'D7',
      hintStuck: 'pulse range A1:O1 · Paste onto A1 alone, then center across the fifteen columns.',
      check: (s, ses) => { const m = monthly(ses); return !!m && titled(m) && settled(ses); } },
    { id: 'save-style', teach: 'Cell Styles (Alt, H, J) name a look so a page can use it by name. New Cell Style (N) saves the active cell’s look, and its ticks choose the parts it carries: untick Number (Alt+N) and each figure keeps its own code. Total is Excel’s own style, so this one takes its own name.', text: 'On P&L!B10, open New Cell Style with Alt, H, J, N, name it Total line, untick Number with Alt+N and press Enter.', keys: `Ctrl+G "'P&L'!B10" ↵ Alt H J N "Total line" Alt+N ↵`, requires: ['cell-style', 'go-to', 'sheet-reference', 'keytips'], convention: 'D7',
      hintStuck: 'pulse cell B10 · Total revenue: bold with a top border.',
      check: (s, ses) => styleSaved(ses) && settled(ses) },
    { id: 'apply-style', text: 'Apply Total line to Monthly’s subtotals B10:O10, B20:O20 and B22:O22: Alt, H, J, ← once to it under Custom, Enter.', keys: 'Ctrl+G "Monthly!B10:O10" ↵ Alt H J ← ↵ Ctrl+G "Monthly!B20:O20" ↵ Alt H J ← ↵ Ctrl+G "Monthly!B22:O22" ↵ Alt H J ← ↵', requires: ['cell-style', 'go-to'], convention: 'D7',
      hintStuck: 'pulse range B10:O10 · Your own styles sit last in the gallery, one step left of the first.',
      check: (s, ses) => { const m = monthly(ses); return !!m && styleSaved(ses) && styled(m) && settled(ses); } },
    { id: 'widths', text: 'Give Monthly the P&L’s widths: column A 2, and the months and full year C:O 12.', keys: 'Ctrl+Home Alt H O W "2" ↵ Ctrl+G "Monthly!C4:O4" ↵ Alt H O W "12" ↵', requires: ['column-width', 'label-column', 'go-to'], convention: 'C2',
      hintStuck: 'pulse range C4:O4 · A width set on one row applies to the whole column.',
      check: (s, ses) => { const m = monthly(ses); return !!m && widths(m) && settled(ses); } },
    { id: 'fit-b', text: 'Fit Monthly’s label column to its labels: select B4:B30 and AutoFit with Alt, H, O, I.', keys: 'Ctrl+G "Monthly!B4:B30" ↵ Alt H O I', requires: ['autofit', 'label-column', 'go-to'], convention: 'C2',
      hintStuck: 'pulse range B4:B30 · The labels stop at revenue growth; the source runs long.',
      check: (s, ses) => { const m = monthly(ses); return !!m && fitB(m) && settled(ses); } },
    { id: 'settings', text: 'Freeze Monthly’s panes at C5 with Alt, W, F, F and turn its gridlines off with Alt, W, V, G.', keys: 'Ctrl+G "Monthly!C5" ↵ Alt W F F Alt W V G', requires: ['freeze-panes', 'gridlines', 'go-to'], convention: 'A3',
      hintStuck: 'pulse cell C5 · The same two settings the P&L carries.',
      check: (s, ses) => { const m = monthly(ses); return !!m && m.freeze.r === 4 && m.freeze.c === 2 && m.gridlines === false && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Monthly!C7" Enter "2000" Enter Ctrl+G "Monthly!C24" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Monthly!C7 change to 2000, and Monthly!C24 answer in the borrowed format.', requires: [],
      hintStuck: 'pulse cell C24 · Formats moved; the formulas never did.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Monthly’s figures and labels wear the P&L’s formats, the full year in black', check: (s, ses) => { const p = pnl(ses), m = monthly(ses); return !!p && !!m && figuresDressed(p, m) && labelsDressed(p, m) && fullYearBlack(m); } },
    { text: 'Total line is a cell style, and Monthly’s subtotals wear it', check: (s, ses) => { const m = monthly(ses); return !!m && styleSaved(ses) && styled(m); } },
    { text: 'The title is centered across the page, the widths and settings are the P&L’s', check: (s, ses) => { const m = monthly(ses); return !!m && titled(m) && widths(m) && fitB(m) && m.gridlines === false; } },
  ],
  closing: [
    'One page formatted became the template for the next.',
    'One column of the P&L dressed thirteen on Monthly in a single paste, the total line became a style with a name, and the label column, the title and the widths followed. Monthly now reads as the P&L’s sibling, not its cousin.',
  ],
  solution: `Ctrl+G "'P&L'!C6:C30" Enter Ctrl+C Ctrl+G "Monthly!C6:O30" Enter Ctrl+Alt+V T Enter Ctrl+G "'P&L'!B6:B30" Enter Ctrl+C Ctrl+G "Monthly!B6" Enter Ctrl+Alt+V T Enter Ctrl+G "Monthly!O7:O24" Enter Ctrl+1 F Alt+C Left Left Left Left Left Enter Ctrl+G "'P&L'!A1" Enter Ctrl+C Ctrl+G "Monthly!A1" Enter Ctrl+Alt+V T Enter Ctrl+G "Monthly!A1:O1" Enter Ctrl+1 A Alt+H Down Down Down Down Enter Ctrl+G "'P&L'!B10" Enter Alt H J N "Total line" Alt+N Enter Ctrl+G "Monthly!B10:O10" Enter Alt H J Left Enter Ctrl+G "Monthly!B20:O20" Enter Alt H J Left Enter Ctrl+G "Monthly!B22:O22" Enter Alt H J Left Enter Ctrl+Home Alt H O W "2" Enter Ctrl+G "Monthly!C4:O4" Enter Alt H O W "12" Enter Ctrl+G "Monthly!B4:B30" Enter Alt H O I Ctrl+G "Monthly!C5" Enter Alt W F F Alt W V G`,
};
