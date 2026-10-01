// Chapter 1 · 1.5.3 — Alignment and titles (clearcoat-weekly, S5b → S5c)
// The Report's figures and fonts are right; now the page lines up. The title is centered across
// A1:I1 with Center Across Selection, never merged, and the wow beat proves why: from A1,
// Ctrl+Shift+→ still runs across the row where a merged title would have swallowed the keys. In
// between, Format Cells is opened again and walked tab by tab with Ctrl+PgDn, then cancelled with
// Esc: every dialog in Excel moves the same way. The headers over numbers go right-aligned, the
// units line goes italic, the lines under the daily table's heading are indented as one selection,
// and the long source note on Inputs is wrapped. Nothing on the sheet changes but where it sits.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;

const TITLE_SPAN = 9;                                                        // A1:I1: the page's nine columns
const NUM_HEADERS = ['C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'];             // the headers that sit over numbers
const TEXT_HEADERS = ['A4', 'B4'];                                           // Site, Week: over text, they stay as they are
const DAILY_LINES = ['A14', 'A15', 'A16', 'A17', 'A18', 'A19', 'A20', 'A21'];   // Week, Day, Date and the five sites under 'Washes by day'
/** The title is centered across A1:I1 by Center Across Selection: A1 carries the span, and no cell was merged (D7). */
const titleAcross = sh => sh.cellAt('A1').ca === TITLE_SPAN;
const headersRight = sh => NUM_HEADERS.every(ref => sh.cellAt(ref).align === 'r') && TEXT_HEADERS.every(ref => !sh.cellAt(ref).align);
const linesIndented = sh => DAILY_LINES.every(ref => sh.cellAt(ref).indent === 1) && !sh.cellAt('A13').indent && !sh.cellAt('A22').indent;
/** The wow: with the title centered across, Ctrl+Shift+→ pressed from A1 still selects along the row: the selection starts at A1 and reaches past the title. */
const sweptAcross = (sh, ses) => windowKeys(ses).includes('Ctrl+Shift+→') && /^A1:[A-Z]+1$/.test(sh.selectionText()) && titleAcross(sh);
/** The tabs were walked: Format Cells opened, Ctrl+PgDn pressed at least five times inside it, Esc closed it, and nothing changed. */
const tabsWalked = ses => { const w = windowKeys(ses); const open = w.indexOf('Ctrl+1'); if (open < 0) return false; const rest = w.slice(open + 1); return rest.filter(k => k === 'Ctrl+PgDn' || k === 'Ctrl+PgUp').length >= 5 && rest.includes('Esc'); };

export default {
  id: 'alignment-and-titles',
  chapter: 'foundations',
  section: 'Format',
  module: 'format',
  workbook: 'clearcoat-weekly',
  state: { before: 'S5b', after: 'S5c' },
  title: 'Alignment and titles',
  difficulty: 'medium',
  tags: ['format', 'alignment', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Ctrl+1',
  conventions: ['D7', 'D6'],
  teaches: ['center-across', 'align-command', 'dialog-box'],
  uses: ['format-cells-dialog', 'format-cells-tabs', 'bold-italic-underline', 'wrap-text', 'keytips', 'ctrl-shift-arrow', 'ctrl-arrow', 'shift-arrow', 'sheet-tabs', 'arrow-keys', 'escape-cancels'],
  prerequisites: ['fonts-fills-borders'],
  brief: 'The Report’s figures and fonts are right, but the title sits in the corner, the headers sit left while their numbers sit right, and the daily table’s lines all start flush. Center the title across the page without merging (Center Across Selection, never Merge & Center, because a merged cell breaks selection, fill and sorting for everyone after you), right-align the headers over numbers, indent the daily lines, and learn to move around a dialog without the mouse while you’re in Format Cells. The key is `Ctrl+1`.',
  goals: [
    { id: 'title-across', teach: 'Ctrl+1, then the Alignment tab (A), then Horizontal › Center Across Selection: the title sits centered over the selected columns and every cell stays its own cell. Merge & Center (Alt, H, M, C) looks the same and breaks selection, fill and sorting: the one Ribbon button you’ll learn to avoid.',
      text: 'The title in A1 belongs over the page: select A1:I1 and center it across the selection with Ctrl+1, then A, never Merge & Center.',
      hintStuck: 'pulse the Format Cells dialog · Select A1:I1; Ctrl+1; A; Alt+H for Horizontal; pick Center Across Selection; Enter.',
      keys: 'Shift+→ ×8 Ctrl+1 A Alt+H ↓ ×4 ↵', requires: ['center-across', 'format-cells-dialog', 'format-cells-tabs', 'shift-arrow'], convention: 'D7',
      check: (s, ses) => { const rep = report(ses); return !!rep && titleAcross(rep) && settled(ses); } },
    { id: 'tabs-walk', teach: 'Inside a dialog, Ctrl+PgDn and Ctrl+PgUp (or Ctrl+Tab) move between its tabs; Tab moves between the fields on a tab; Alt plus an underlined letter jumps to one; Space ticks a box; ↑ ↓ pick from a list; Enter is OK and Esc is Cancel. Every dialog in Excel works this way, so learn it on this one.',
      text: 'Open Format Cells on A1 again, walk its tabs with Ctrl+PgDn (Number, Alignment, Font, Border, Fill, Protection), then press Esc.',
      hintStuck: 'pulse the Format Cells tabs · Ctrl+1, then Ctrl+PgDn five times, reading each tab, then Esc.',
      keys: 'Ctrl+1 Ctrl+PgDn ×5 Esc', requires: ['dialog-box', 'format-cells-dialog', 'escape-cancels'],
      check: (s, ses) => { const rep = report(ses); return !!rep && tabsWalked(ses) && titleAcross(rep) && settled(ses); } },
    { id: 'still-selects', teach: 'That’s the proof. Across a merged cell the jump stops; across a centered one it runs. Every fill, sort and copy on the page depends on that.',
      text: 'Go to A1 and press Ctrl+Shift+→, and notice the selection still sweeps the row in one press, where a merged title would have stopped you.',
      hintStuck: 'pulse row 1 · Land on A1, then Ctrl+Shift+→.',
      keys: 'Ctrl+Shift+→', requires: ['center-across', 'ctrl-shift-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && sweptAcross(rep, ses); } },
    { id: 'headers-right', teach: 'Alignment is Alt, H, A, then L left, C center, R right. A header sits over its numbers when it’s aligned the way they are: right over figures, left over names.',
      text: 'Numbers align right, so their headers should too: select Washes through Prior week rev, C4:I4, and right-align them with Alt, H, A, R.',
      hintStuck: 'pulse cells C4:I4 · Land on C4, Ctrl+Shift+→; Alt, H, A, R.',
      keys: 'Ctrl+↓ ×2 → ×2 Ctrl+Shift+→ Alt H A R', requires: ['align-command', 'keytips', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'D6',
      check: (s, ses) => { const rep = report(ses); return !!rep && headersRight(rep) && settled(ses); } },
    { id: 'units-italic', teach: 'Italic is for notes, units and footnotes: text that explains the page rather than being part of it.',
      text: 'The units line USD unless stated in A2 is a note, not a figure: make it italic with Ctrl+I so it reads as one.',
      hintStuck: 'pulse cell A2 · A2, Ctrl+I.',
      keys: 'Ctrl+← ↑ ×2 Ctrl+I', requires: ['bold-italic-underline', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.cellAt('A2').it === true && !rep.cellAt('A1').it; } },
    { id: 'indent-lines', teach: 'Alt, H, 6 indents a level; Alt, H, 5 takes one back. Indent sub-items with the indent button, never with spaces. Spaces break sorting and lookups later.',
      text: 'The eight lines under Washes by day belong to it: jump to A13, select A14:A21 below it and indent them once with Alt, H, 6.',
      hintStuck: 'pulse cells A14:A21 · Land on A14, Ctrl+Shift+↓ (stops at A21); Alt, H, 6.',
      keys: 'Ctrl+↓ ×3 ↓ Ctrl+Shift+↓ Alt H 6', requires: ['align-command', 'keytips', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'D6',
      check: (s, ses) => { const rep = report(ses); return !!rep && linesIndented(rep) && settled(ses); } },
    { id: 'wrap-note', teach: 'Wrap for labels and notes, never for figures. The row grows to fit and the column stays narrow.',
      text: 'On Inputs, the source note per supplier quote in C4 runs past its column: wrap it inside the cell with Alt, H, W.',
      hintStuck: 'pulse cell C4 on Inputs · Ctrl+PgDn to Inputs; C4; Alt, H, W.',
      keys: 'Ctrl+PgDn ×2 ↓ ×3 Tab ×2 Alt H W', requires: ['wrap-text', 'keytips', 'sheet-tabs', 'arrow-keys'],
      check: (s, ses) => { const inp = inputs(ses); return !!inp && inp.cellAt('C4').wrap === true && !inp.cellAt('B4').wrap && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "300" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 },
      teach: 'Alignment rides on the cells; the SUM underneath doesn’t care.',
      text: 'Does it tie? Change Cedar Park’s washes in C9 to 300 and watch the Total in C11 answer under the centered title.',
      hintStuck: 'pulse cell C11 on Report · Ctrl+PgUp to Report; C9, 300, Enter.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The title is centered across A1:I1, not merged', check: (s, ses) => { const rep = report(ses); return !!rep && titleAcross(rep); } },
    { text: 'C4:I4 are right-aligned and A14:A21 are indented once', check: (s, ses) => { const rep = report(ses); return !!rep && headersRight(rep) && linesIndented(rep); } },
    { text: 'A2 is italic and Inputs!C4 is wrapped', check: (s, ses) => { const rep = report(ses), inp = inputs(ses); return !!rep && !!inp && rep.cellAt('A2').it === true && inp.cellAt('C4').wrap === true; } },
  ],
  wow: 'The title is centered across the page, and not one cell was merged to do it.',
  closing: [
    'The title is centered across the page and no cell was merged, so Ctrl+Shift+→ still sweeps the row and every fill and sort will still work. Headers sit over their numbers; the daily lines sit under their heading; the hierarchy reads without a word added.',
    'Best practice: if you ever inherit a page with merged cells, unmerge them first (Alt, H, M, U) and center across instead. Everyone after you will thank you.',
  ],
  solution: 'Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+1 A Alt+H Down Down Down Down Enter Ctrl+1 Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Escape Ctrl+Shift+Right Ctrl+Down Ctrl+Down Right Right Ctrl+Shift+Right Alt H A R Ctrl+Left Up Up Ctrl+I Ctrl+Down Ctrl+Down Ctrl+Down Down Ctrl+Shift+Down Alt H 6 Ctrl+PgDn Ctrl+PgDn Down Down Down Tab Tab Alt H W',
};
