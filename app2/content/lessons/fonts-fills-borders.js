// Chapter 1 · 1.5.2 — Fonts, fills, borders (clearcoat-weekly, S5a → S5b)
// The figures read right after 1.5.1; now the page tells the eye where to look. The title goes
// bold and one size up (the one size exception on the page), the header row and the total row go
// bold as WHOLE rows (Shift+Space, then one press formats every cell in the row), the total row
// takes a top border, a top border and never an all-borders grid, and the input block on Inputs
// takes the light tint that marks the cells a reader may change. Nothing on the sheet moves but
// its dress; the closer shows Cedar Park's washes still answering in the bold Total.
import { TITLE_FSZ } from '../workbooks/clearcoat-weekly.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const inputs = ses => sheetOf(ses, 'Inputs');

const HEADER = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'];   // the whole header row, Site through Prior week rev ($)
const TOTAL = ['A11', 'C11', 'D11', 'E11'];                              // the total row's label and its three SUMs
const allBold = (sh, refs) => refs.every(ref => sh.cellAt(ref).bold === true);
const allTop = (sh, refs) => refs.every(ref => { const c = sh.cellAt(ref); return c.bt === true && !c.ball; });
const noGrid = sh => TOTAL.every(ref => !sh.cellAt(ref).ball);
const INPUT_BLOCK = ['B3', 'B4', 'B5', 'B6'];                             // week, cost per wash, target ticket, est. washes
const AROUND = ['B2', 'B7', 'A3', 'A4', 'A5', 'A6', 'C3', 'C4', 'C5', 'C6'];   // the cells beside the block stay untinted
const tinted = sh => INPUT_BLOCK.every(ref => sh.cellAt(ref).fill === 'blue') && AROUND.every(ref => !sh.cellAt(ref).fill);

export default {
  id: 'fonts-fills-borders',
  chapter: 'foundations',
  section: 'Format',
  module: 'format',
  workbook: 'clearcoat-weekly',
  state: { before: 'S5a', after: 'S5b' },
  title: 'Fonts, fills, borders',
  difficulty: 'easy',
  tags: ['format', 'fonts', 'borders', 'report'],
  access: 'free',
  minutes: 5,
  headline: 'Alt H B',
  conventions: ['D5', 'B3', 'D8'],
  teaches: ['bold-italic-underline', 'borders-menu', 'fills-and-colours'],
  uses: ['keytips', 'row-col-select', 'shift-arrow', 'ctrl-arrow', 'sheet-tabs', 'arrow-keys'],
  prerequisites: ['numbers-a-banker-can-read'],
  brief: 'The Report’s figures read right, but nothing on the page tells the eye where to look: the title, the headers and the total row all sit in plain text. Bold the title and take it one size up, bold the header and total rows, give the total row a top border (a top border, never a grid) and tint the input block on Inputs so a reader knows what they’re allowed to change. The key is `Alt H B`.',
  goals: [
    { id: 'title-bold', teach: 'Ctrl+B makes the selection bold, Ctrl+I italic and Ctrl+U underlined; on a mixed selection they follow the active cell, so start from a plain cell and every cell goes on.',
      text: 'The title in A1 is plain text: make it bold with Ctrl+B so the page has a heading.',
      hintStuck: 'pulse cell A1 · Land on A1, then Ctrl+B.',
      keys: 'Ctrl+B', requires: ['bold-italic-underline'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.cellAt('A1').bold === true; } },
    { id: 'title-size', teach: 'Alt, H, F, G grows the font a step; Alt, H, F, K shrinks it. Everything else on the page stays one size. The title being bigger is what makes it the title.',
      text: 'One font, one size, and the title is the one exception: take A1 one size up with Increase Font Size, Alt, H, F, G.',
      hintStuck: 'pulse cell A1 · Alt, H, F, G once.',
      keys: 'Alt H F G', requires: ['keytips'], convention: 'D8',
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.cellAt('A1').fsz === TITLE_FSZ; } },
    { id: 'header-row', teach: 'Shift+Space, then Ctrl+B: a whole row dressed in two presses. Formatting a row or a column whole is faster than selecting the cells, and it catches the ones you’d miss.',
      text: 'Site and Week in A4:B4 were never bold: select the whole header row 4 with Shift+Space and one Ctrl+B bolds every header at once.',
      hintStuck: 'pulse row 4 · Land on A4, Shift+Space, Ctrl+B.',
      keys: '↓ ×3 Shift+Space Ctrl+B', requires: ['bold-italic-underline', 'row-col-select', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && allBold(rep, HEADER); } },
    { id: 'total-row', teach: 'Ctrl+↓ from A4 lands on the total; Shift+Space, Ctrl+B. A total row is bold on every page in the pack.',
      text: 'Jump down the site list to the Total in A11, select the whole row 11 with Shift+Space and make the total row bold.',
      hintStuck: 'pulse row 11 · Ctrl+↓ to A11, Shift+Space, Ctrl+B.',
      keys: 'Ctrl+↓ Shift+Space Ctrl+B', requires: ['bold-italic-underline', 'row-col-select', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && allBold(rep, TOTAL) && allBold(rep, HEADER); } },
    { id: 'total-border', teach: 'The Borders menu is Alt, H, B, then a letter: P top, O bottom, A all borders, N none. A top border on the total survives rows inserted above it; a grid has to be redrawn every time.',
      text: 'A total takes a top border, never a grid: with row 11 still selected, add the top border with Alt, H, B, P.',
      hintStuck: 'pulse row 11 · Alt, H, B, P with row 11 selected.',
      keys: 'Alt H B P', requires: ['borders-menu', 'keytips'], convention: 'D5',
      check: (s, ses) => { const rep = report(ses); return !!rep && allTop(rep, TOTAL) && noGrid(rep) && allBold(rep, TOTAL); } },
    { id: 'input-tint', teach: 'Fill Color is Alt, H, H, then Enter for the first tint or the arrows to another swatch. A fill marks a block of inputs so a reader can find them; it never carries meaning about the value itself.',
      text: 'On Inputs, the cells a reader may change are B3:B6: select the block and tint it light blue with Alt, H, H, then Enter.',
      hintStuck: 'pulse cells B3:B6 on Inputs · Ctrl+PgDn to Inputs; B3, Shift+↓ three times; Alt, H, H, Enter.',
      keys: 'Ctrl+PgDn ×2 ↓ ×2 → Shift+↓ ×3 Alt H H ↵', requires: ['fills-and-colours', 'keytips', 'sheet-tabs', 'shift-arrow', 'arrow-keys'], convention: 'B3',
      check: (s, ses) => { const inp = inputs(ses); return !!inp && tinted(inp); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "300" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 },
      teach: 'Fonts and borders ride on the cells, and the SUM underneath doesn’t care, so the total still moves.',
      text: 'Does it tie? Change Cedar Park’s washes in C9 to 300 and watch the Total in C11 answer, in bold above its top border.',
      hintStuck: 'pulse cell C11 on Report · Ctrl+PgUp to Report; C9, 300, Enter.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The title in A1 is bold and one size up', check: (s, ses) => { const rep = report(ses); return !!rep && rep.cellAt('A1').bold === true && rep.cellAt('A1').fsz === TITLE_FSZ; } },
    { text: 'The header row and the total row are bold, and the total row carries a top border', check: (s, ses) => { const rep = report(ses); return !!rep && allBold(rep, HEADER) && allBold(rep, TOTAL) && allTop(rep, TOTAL) && noGrid(rep); } },
    { text: 'Inputs!B3:B6 carry the light blue tint', check: (s, ses) => { const inp = inputs(ses); return !!inp && tinted(inp); } },
  ],
  wow: 'Bold where it matters and a line over the total. The eye knows where to go now.',
  closing: [
    'You put a top border on the total row, and top borders are preferred because you can insert rows of data above them and never have to fix the total’s border. The title is the one cell on the page a size up, and the input block on Inputs carries the tint that says "change these".',
    'Top-bucket tip: use no vertical borders ever, put a double bottom border on the final total of a statement, and add no fills except the input tint. A grid is not structure, and a top border is.',
  ],
  solution: 'Ctrl+B Alt H F G Down Down Down Shift+Space Ctrl+B Ctrl+Down Shift+Space Ctrl+B Alt H B P Ctrl+PgDn Ctrl+PgDn Down Down Right Shift+Down Shift+Down Shift+Down Alt H H Enter',
};
