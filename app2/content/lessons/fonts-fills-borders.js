// Chapter 1 · 1.5.2 — Fonts, fills, borders (voltline-weekly, S5a → S5b)
// The figures read right after 1.5.1; now the page tells the eye where to look. The title goes
// bold and one size up (the one size exception on the page), the header row and the total row go
// bold as WHOLE rows (Shift+Space, then one press formats every cell in the row), the total row
// takes a top border — a top border, never an all-borders grid — and the input block on Inputs
// takes the light tint that marks the cells a reader may change. Nothing on the sheet moves but
// its dress; the closer shows Cedar Park's kWh still answering in the bold Total.
import { TITLE_FSZ } from '../workbooks/voltline-weekly.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const inputs = ses => sheetOf(ses, 'Inputs');

const HEADER = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'];   // the whole header row, Site through Prior week rev ($)
const TOTAL = ['A11', 'C11', 'D11', 'E11'];                              // the total row's label and its three SUMs
const allBold = (sh, refs) => refs.every(ref => sh.cellAt(ref).bold === true);
const allTop = (sh, refs) => refs.every(ref => { const c = sh.cellAt(ref); return c.bt === true && !c.ball; });
const noGrid = sh => TOTAL.every(ref => !sh.cellAt(ref).ball);
const INPUT_BLOCK = ['B3', 'B4', 'B5', 'B6'];                             // week, wholesale price, target margin, est. kWh
const AROUND = ['B2', 'B7', 'A3', 'A4', 'A5', 'A6', 'C3', 'C4', 'C5', 'C6'];   // the cells beside the block stay untinted
const tinted = sh => INPUT_BLOCK.every(ref => sh.cellAt(ref).fill === 'blue') && AROUND.every(ref => !sh.cellAt(ref).fill);

export default {
  id: 'fonts-fills-borders',
  chapter: 'foundations',
  section: 'Format',
  module: 'format',
  workbook: 'voltline-weekly',
  state: { before: 'S5a', after: 'S5b' },
  title: 'Fonts, fills, borders',
  difficulty: 'easy',
  tags: ['format', 'fonts', 'borders', 'report'],
  access: 'free',
  minutes: 5,
  headline: 'Alt H B',
  conventions: ['D5', 'B3', 'D8'],
  teaches: ['bold-italic-underline', 'borders-menu', 'fills-and-colours'],
  uses: ['keytips', 'row-col-select', 'shift-arrow', 'ctrl-arrow', 'sheet-tabs'],
  prerequisites: ['numbers-a-banker-can-read'],
  brief: 'The Report’s figures now read right, but nothing on the page tells the eye where to look: the title, the first two headers and the total row all sit in plain text. Bold the title and size it up, bold the header and total rows, give the total row a top border, and tint the input block on Inputs. The key is `Alt H B`.',
  goals: [
    { id: 'title-bold', teach: 'Ctrl+B makes the selection bold, Ctrl+I italic and Ctrl+U underlined; on a mixed selection it follows the active cell, so start from a plain cell and every cell goes on.', text: 'The title in A1 is plain text: make it bold with Ctrl+B so the page has a heading.', keys: 'Ctrl+B', requires: ['bold-italic-underline'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.cellAt('A1').bold === true; } },
    { id: 'title-size', text: 'One font, one size, and the title is the one exception: take A1 one size up with Increase Font Size, Alt H F G.', keys: 'Alt H F G', requires: ['keytips'], convention: 'D8',
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.cellAt('A1').fsz === TITLE_FSZ; } },
    { id: 'header-row', text: 'Site and Week in A4:B4 were never bold: select the whole header row 4 with Shift+Space and one Ctrl+B bolds every header at once.', keys: '↓ ×3 Shift+Space Ctrl+B', requires: ['bold-italic-underline', 'row-col-select'],
      check: (s, ses) => { const rep = report(ses); return !!rep && allBold(rep, HEADER); } },
    { id: 'total-row', text: 'Ctrl+↓ jumps down the site list to the Total in A11: select the whole row 11 with Shift+Space and make it bold.', keys: 'Ctrl+↓ Shift+Space Ctrl+B', requires: ['bold-italic-underline', 'row-col-select', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && allBold(rep, TOTAL) && allBold(rep, HEADER); } },
    { id: 'total-border', teach: 'The Borders menu is Alt H B, then a letter: P a top border, O a bottom, A all borders, N none.', text: 'A total takes a top border, never a grid: with row 11 still selected, add the top border with Alt H B P.', keys: 'Alt H B P', requires: ['borders-menu'], convention: 'D5',
      check: (s, ses) => { const rep = report(ses); return !!rep && allTop(rep, TOTAL) && noGrid(rep) && allBold(rep, TOTAL); } },
    { id: 'input-tint', teach: 'Fill Color is Alt H H, then Enter for the light blue tint or arrows to another swatch; a fill marks a cell, never its value.', text: 'On Inputs, the cells a reader may change are B3:B6: select the block and tint it light blue with Alt H H then Enter.', keys: 'Ctrl+PgDn ×2 ↓ ×2 → Shift+↓ ×3 Alt H H ↵', requires: ['fills-and-colours', 'sheet-tabs', 'shift-arrow'], convention: 'B3',
      check: (s, ses) => { const inp = inputs(ses); return !!inp && tinted(inp); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "3000" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Cedar Park’s kWh in C9 change to 3,000 and the Total in C11 answer, in bold above its top border.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The title in A1 is bold and one size up', check: (s, ses) => { const rep = report(ses); return !!rep && rep.cellAt('A1').bold === true && rep.cellAt('A1').fsz === TITLE_FSZ; } },
    { text: 'The header row and the total row are bold, and the total row carries a top border', check: (s, ses) => { const rep = report(ses); return !!rep && allBold(rep, HEADER) && allBold(rep, TOTAL) && allTop(rep, TOTAL) && noGrid(rep); } },
    { text: 'Inputs!B3:B6 carry the light blue tint', check: (s, ses) => { const inp = inputs(ses); return !!inp && tinted(inp); } },
  ],
  closing: [
    'Shift+Space selected a whole row and one press dressed every cell in it: the header row and the total row went bold together, and the total took a top border, never a grid (D5).',
    'The title is the one cell on the page a size up (D8), the input block on Inputs carries the tint that says “change these” (B3), and Cedar Park’s kWh still moves the bold Total.',
  ],
  solution: 'Ctrl+B Alt H F G Down Down Down Shift+Space Ctrl+B Ctrl+Down Shift+Space Ctrl+B Alt H B P Ctrl+PgDn Ctrl+PgDn Down Down Right Shift+Down Shift+Down Shift+Down Alt H H Enter',
};
