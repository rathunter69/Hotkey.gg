// Chapter 1 · 1.5.3 — Alignment and titles (voltline-weekly, S5b → S5c)
// The Report's figures and fonts are right; now the page lines up. The title is centered across
// A1:I1 with Center Across Selection — never merged, and the wow beat proves why: from A1,
// Ctrl+Shift+→ still runs across the row where a merged title would have swallowed the keys. The
// headers over numbers go right-aligned so they sit over their figures, the units line goes italic
// so it reads as a note, the lines under the daily table's heading are indented as one selection,
// and the long source note on Inputs is wrapped. Nothing on the sheet changes but where it sits.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const inputs = ses => sheetOf(ses, 'Inputs');

const TITLE_SPAN = 9;                                                        // A1:I1 — the page's nine columns
const NUM_HEADERS = ['C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'];             // the headers that sit over numbers
const TEXT_HEADERS = ['A4', 'B4'];                                           // Site, Week — over text, they stay as they are
const DAILY_LINES = ['A14', 'A15', 'A16', 'A17', 'A18', 'A19', 'A20', 'A21'];   // Week, Day, Date and the five sites under 'kWh sold by day'
/** The title is centered across A1:I1 by Center Across Selection: A1 carries the span, and no cell was merged (D7). */
const titleAcross = sh => sh.cellAt('A1').ca === TITLE_SPAN;
const headersRight = sh => NUM_HEADERS.every(ref => sh.cellAt(ref).align === 'r') && TEXT_HEADERS.every(ref => !sh.cellAt(ref).align);
const linesIndented = sh => DAILY_LINES.every(ref => sh.cellAt(ref).indent === 1) && !sh.cellAt('A13').indent && !sh.cellAt('A22').indent;
/** The wow: with the title centered across, Ctrl+Shift+→ pressed from A1 still selects along the row — the selection starts at A1 and reaches past the title. */
const sweptAcross = (sh, ses) => windowKeys(ses).includes('Ctrl+Shift+→') && /^A1:[A-Z]+1$/.test(sh.selectionText()) && titleAcross(sh);

export default {
  id: 'alignment-and-titles',
  chapter: 'foundations',
  section: 'Format',
  module: 'format',
  workbook: 'voltline-weekly',
  state: { before: 'S5b', after: 'S5c' },
  title: 'Alignment and titles',
  difficulty: 'medium',
  tags: ['format', 'alignment', 'report'],
  access: 'free',
  minutes: 5,
  headline: 'Ctrl+1',
  conventions: ['D7', 'D6'],
  teaches: ['center-across', 'align-command'],
  uses: ['format-cells-dialog', 'bold-italic-underline', 'wrap-text', 'keytips', 'ctrl-shift-arrow', 'ctrl-arrow', 'ctrl-home-end', 'sheet-tabs'],
  prerequisites: ['fonts-fills-borders'],
  brief: 'The Report’s figures and fonts are right, but the title sits in the corner, the headers sit left while their numbers sit right, and the daily table’s lines all start flush. Center the title across the page without merging, right-align the headers over numbers, indent the daily lines and wrap the long note on Inputs. The key is `Ctrl+1`.',
  goals: [
    { id: 'title-across', teach: 'Center Across Selection (Ctrl+1, then A) centers a title over the selected columns without merging them; a merged cell breaks selection, fill and sorting.', text: 'The title in A1 belongs over the page: select A1:I1 and center it across the selection with Ctrl+1 then A, never Merge & Center.', keys: 'Ctrl+Home ↑ Ctrl+→ ↑ ×3 Ctrl+Shift+← then Ctrl+1 A', requires: ['center-across', 'format-cells-dialog', 'ctrl-shift-arrow', 'ctrl-arrow', 'ctrl-home-end'], convention: 'D7',
      check: (s, ses) => { const rep = report(ses); return !!rep && titleAcross(rep) && !ses.editing; } },
    { id: 'still-selects', text: 'A merged title would have stopped you here: go to A1 and press Ctrl+Shift+→ — the selection still sweeps along the row in one press.', keys: 'Ctrl+Home Home Ctrl+↑ ×3 Ctrl+Shift+→', requires: ['center-across', 'ctrl-shift-arrow', 'ctrl-home-end'],
      check: (s, ses) => { const rep = report(ses); return !!rep && sweptAcross(rep, ses); } },
    { id: 'headers-right', teach: 'The alignment commands are Alt H A then a letter, L left, C center, R right; a header sits over its numbers when it is aligned the way they are.', text: 'Numbers align right, so their headers should too: select kWh sold through Prior week rev, C4:I4, and right-align them with Alt H A R.', keys: 'Ctrl+↓ ×2 → ×2 Ctrl+Shift+→ Alt H A R', requires: ['align-command', 'keytips', 'ctrl-arrow', 'ctrl-shift-arrow'], convention: 'D6',
      check: (s, ses) => { const rep = report(ses); return !!rep && headersRight(rep); } },
    { id: 'units-italic', text: 'The units line USD unless stated in A2 is a note, not a figure: make it italic with Ctrl+I so it reads as one.', keys: 'Ctrl+Home Home Ctrl+↑ ×2 Ctrl+I', requires: ['bold-italic-underline', 'ctrl-home-end'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.cellAt('A2').it === true && !rep.cellAt('A1').it; } },
    { id: 'indent-lines', text: 'The eight lines under kWh sold by day belong to it: jump to A13, select A14:A21 below it and indent them once with Alt H 6.', keys: 'Ctrl+↓ ×3 ↓ Ctrl+Shift+↓ Alt H 6', requires: ['align-command', 'keytips', 'ctrl-arrow', 'ctrl-shift-arrow'], convention: 'D6',
      check: (s, ses) => { const rep = report(ses); return !!rep && linesIndented(rep); } },
    { id: 'wrap-note', text: 'On Inputs, the source note per utility contract in C4 runs past its column: wrap it inside the cell with Alt H W.', keys: 'Ctrl+PgDn ×2 Ctrl+↓ ↑ ×2 Ctrl+→ Alt H W', requires: ['wrap-text', 'keytips', 'sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => { const inp = inputs(ses); return !!inp && inp.cellAt('C4').wrap === true && !inp.cellAt('B4').wrap; } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "3000" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Cedar Park’s kWh in C9 change to 3,000 and the Total in C11 answer under the centered title.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The title is centered across A1:I1, not merged', check: (s, ses) => { const rep = report(ses); return !!rep && titleAcross(rep); } },
    { text: 'C4:I4 are right-aligned and A14:A21 are indented once', check: (s, ses) => { const rep = report(ses); return !!rep && headersRight(rep) && linesIndented(rep); } },
    { text: 'A2 is italic and Inputs!C4 is wrapped', check: (s, ses) => { const rep = report(ses), inp = inputs(ses); return !!rep && !!inp && rep.cellAt('A2').it === true && inp.cellAt('C4').wrap === true; } },
  ],
  closing: [
    'The title is centered across the page and no cell was merged, so Ctrl+Shift+→ still sweeps the row and every fill and sort will still work (D7).',
    'The headers sit over their numbers and the daily lines are indented under their heading, so the hierarchy reads without a word added (D6) — and Cedar Park’s kWh still moves the Total.',
  ],
  solution: 'Ctrl+Home Up Ctrl+Right Up Up Up Ctrl+Shift+Left Ctrl+1 A Ctrl+Home Home Ctrl+Up Ctrl+Up Ctrl+Up Ctrl+Shift+Right Ctrl+Down Ctrl+Down Right Right Ctrl+Shift+Right Alt H A R Ctrl+Home Home Ctrl+Up Ctrl+Up Ctrl+I Ctrl+Down Ctrl+Down Ctrl+Down Down Ctrl+Shift+Down Alt H 6 Ctrl+PgDn Ctrl+PgDn Ctrl+Down Up Up Ctrl+Right Alt H W',
};
