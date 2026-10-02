// Chapter 2 · 2.3.1 Title, units, timeline, sections, answer (clearcoat-pnl, S2d → S3a)
// The page gets its anatomy: the title in A1, bold and one size up, centered across A1:E1; the
// section headers typed and bold; the four answer lines bold; the sub-lines indented; the checks
// block given the same shape; the typed figures blue; the system's account codes cleared out of
// column A. The closer moves retail revenue and EBITDA answers under the title.
import { YEAR_COLS, TITLE, SECTION_HEADS, TOTAL_ROWS, INDENT_ROWS, LINE_ROWS } from '../workbooks/clearcoat-pnl.js';
import { TITLE_FSZ } from '../workbooks/page.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const cell = (sh, ref) => sh.cellAt(ref);

const titled = sh => sh.value('A1') === TITLE && cell(sh, 'A1').bold && cell(sh, 'A1').fsz === TITLE_FSZ;
const heads = sh => Object.entries(SECTION_HEADS).every(([r, t]) => sh.value('B' + r) === t && cell(sh, 'B' + r).bold);
const answers = sh => TOTAL_ROWS.every(r => ['B', ...YEAR_COLS].every(col => cell(sh, col + r).bold));
const indented = sh => INDENT_ROWS.every(r => (cell(sh, 'B' + r).indent | 0) === 1) && !(cell(sh, 'B12').indent | 0);
const checksShaped = sh => cell(sh, 'B38').bold && [39, 40].every(r => (cell(sh, 'B' + r).indent | 0) === 1);
const TYPED = [...LINE_ROWS, 33, 34].flatMap(r => YEAR_COLS.map(col => col + r));
const blueTyped = sh => TYPED.every(ref => cell(sh, ref).fontColor === 'blue') && YEAR_COLS.every(col => cell(sh, col + '10').fontColor !== 'blue' && cell(sh, col + '35').fontColor !== 'blue');
const codesGone = sh => { for (let r = 4; r <= 35; r++) { const c = sh.cells['A' + r]; if (c && (c.value != null || c.formula || c.bold)) return false; } return true; };

export default {
  id: 'title-units-timeline-answer',
  chapter: 'formatting',
  section: 'The page a buyer reads',
  module: 'the-page-a-buyer-reads',
  workbook: 'clearcoat-pnl',
  state: { before: 'S2d', after: 'S3a' },
  title: 'Title, units, timeline, sections, answer',
  difficulty: 'medium',
  tags: ['format', 'presentation', 'pnl'],
  access: 'paid',
  minutes: 7,
  headline: 'Ctrl+B',
  conventions: ['G2', 'D6', 'D7', 'B1'],
  teaches: ['page-anatomy', 'font-size-step', 'indent-levels', 'clear-all'],
  uses: ['bold-italic-underline', 'center-across', 'format-cells-tabs', 'ctrl-arrow', 'shift-arrow', 'f4-repeat', 'go-to', 'go-to-special', 'font-color', 'input-colour-convention', 'ctrl-enter-fill', 'check-cell'],
  prerequisites: ['challenge-house-format-set'],
  brief: 'A financial page reads top to bottom in one order: what it is, what it’s in, when, the lines, the answer. The title in A1 says which company and which statement; the units line under it says the currency and the sign convention; the timeline is row 4; the sections are Revenue, Site costs, Site contribution, Head office, EBITDA. And EBITDA is the answer, so the page is built to land on it. Put the anatomy in place. The key is `Ctrl+B`.',
  goals: [
    { id: 'title', teach: 'The title says which company and which statement, and it is the one line on the page a size up. Increase Font Size is Alt, H, F, G, one step up the size list.', text: 'Type "Clearcoat Express - Historical Financials" in A1, bold it with Ctrl+B and take it one size up with Alt, H, F, G.', keys: '"Clearcoat Express - Historical Financials" Ctrl+↵ Ctrl+B Alt H F G', requires: ['page-anatomy', 'font-size-step', 'bold-italic-underline', 'ctrl-enter-fill'], convention: 'G2',
      hintStuck: 'pulse cell A1 · Ctrl+Enter keeps you on the cell you typed in.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && titled(sh) && settled(ses); } },
    { id: 'center', text: 'Center the title across A1:E1 with Ctrl+1, Alignment, Center Across Selection, so it sits over the figures without a merge.', keys: 'Shift+→ ×4 Ctrl+1 A Alt+H ↓ ×4 ↵', requires: ['center-across', 'format-cells-tabs', 'shift-arrow'], convention: 'D7',
      hintStuck: 'pulse range A1:E1 · The title spans the label column and the three years.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && (cell(sh, 'A1').ca | 0) === 5 && settled(ses); } },
    { id: 'sections', teach: 'Sections group the lines a reader adds in their head: what came in, what the sites cost, and the blocks under the answer. The units line in A2 is already there from module 2.1, italic, saying the currency and that costs show as negatives.', text: 'Type Revenue in B6, Site costs in B12 and Memo in B32, and bold all four section headers, Margins and growth in B26 too.', keys: 'Ctrl+↓ ×2 → ↓ ×2 "Revenue" Ctrl+↵ Ctrl+B Ctrl+↓ ×2 ↑ "Site costs" Ctrl+↵ Ctrl+B Ctrl+↓ ×4 Ctrl+B Ctrl+↓ ×2 ↑ "Memo" Ctrl+↵ Ctrl+B', requires: ['ctrl-arrow', 'ctrl-enter-fill', 'bold-italic-underline'], convention: 'G2',
      hintStuck: 'pulse cell B6 · Each header sits on the empty row above its block.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && heads(sh) && settled(ses); } },
    { id: 'answers', teach: 'Bold is for the lines the page adds down to, and nothing else: total revenue, total site costs, site contribution and EBITDA. F4 repeats the last action, so one Ctrl+B does all four.', text: 'Bold the answer lines B24:E24, B22:E22, B20:E20 and B10:E10, with Ctrl+B on the first and F4 on the rest.', keys: 'Ctrl+↑ ×3 Shift+→ ×3 Ctrl+B Ctrl+↑ Shift+→ ×3 F4 Ctrl+↑ Shift+→ ×3 F4 Ctrl+↑ ×2 Shift+→ ×3 F4', requires: ['bold-italic-underline', 'f4-repeat', 'ctrl-arrow', 'shift-arrow'], convention: 'D5',
      hintStuck: 'pulse range B24:E24 · Work up the page from EBITDA.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && answers(sh) && settled(ses); } },
    { id: 'indent', teach: 'An indent says a line belongs to the total under it. Increase Indent is Alt, H, 6 and Decrease Indent is Alt, H, 5, one level at a time.', text: 'Indent the sub-lines B7:B9 once with Alt, H, 6, then B13:B19 with F4.', keys: '↑ Shift+↑ ×2 Alt H 6 Ctrl+↓ ×2 ↓ Shift+↓ ×6 F4', requires: ['indent-levels', 'f4-repeat', 'shift-arrow', 'ctrl-arrow'], convention: 'D6',
      hintStuck: 'pulse range B13:B19 · The site costs run from chemicals and water to marketing.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && indented(sh) && settled(ses); } },
    { id: 'checks', text: 'The checks block takes the same anatomy: bold its header B38 and indent B39:B40 once.', keys: 'Ctrl+G "B38" ↵ Ctrl+B ↓ Shift+↓ Alt H 6', requires: ['go-to', 'bold-italic-underline', 'indent-levels', 'check-cell'], convention: 'F1',
      hintStuck: 'pulse cell B38 · The checks sit at the foot of the page.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && checksShaped(sh) && settled(ses); } },
    { id: 'blue', teach: 'Typed figures are blue and formulas black, on the page as in the model, so a reader knows which numbers came in from the ledger. Go To Special Constants picks the typed cells out of a block and leaves the formulas.', text: 'Select C7:E34, keep only the typed figures with Go To Special Constants (Alt, H, F, D, N), and color them blue.', keys: 'Ctrl+G "C7:E34" ↵ Alt H F D N Alt H F C → ×4 ↵', requires: ['go-to-special', 'font-color', 'input-colour-convention', 'go-to'], convention: 'B1',
      hintStuck: 'pulse range C7:E34 · Constants leaves the totals and the margins behind.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && blueTyped(sh) && settled(ses); } },
    { id: 'codes', teach: 'The account codes belong to the ledger, not to the page. Clear All (Alt, H, E, A) takes the contents and the formats, so nothing of them is left behind.', text: 'Select the account codes and their header in A4:A23 and clear them with Alt, H, E, A.', keys: 'Ctrl+Home Ctrl+↓ ×2 Ctrl+Shift+↓ ×5 Alt H E A', requires: ['clear-all', 'ctrl-arrow', 'ctrl-shift-arrow'], convention: 'G2',
      hintStuck: 'pulse range A4:A23 · The codes stop at head office in row 23.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && codesGone(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C7" Enter "18500" Enter Ctrl+G "C24" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch C7 change to 18500, and EBITDA in C24 answer under the title.', requires: [],
      hintStuck: 'pulse cell C24 · The page lands on EBITDA.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The title is bold, a size up and centered across the page', check: (s, ses) => { const sh = pnl(ses); return !!sh && titled(sh) && (cell(sh, 'A1').ca | 0) === 5; } },
    { text: 'The sections and the answer lines are bold, the sub-lines indented', check: (s, ses) => { const sh = pnl(ses); return !!sh && heads(sh) && answers(sh) && indented(sh); } },
    { text: 'The typed figures are blue and the account codes are gone', check: (s, ses) => { const sh = pnl(ses); return !!sh && blueTyped(sh) && codesGone(sh); } },
  ],
  closing: [
    'The page reads in the order a buyer reads it, and it lands on EBITDA.',
    'A title a size up, a units line, a timeline, four sections and four bold answers: that is the anatomy of every financial page in the book. The codes went back to the ledger, and the blue figures say which numbers were typed.',
  ],
  solution: '"Clearcoat Express - Historical Financials" Ctrl+Enter Ctrl+B Alt H F G Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+1 A Alt+H Down Down Down Down Enter Ctrl+Down Ctrl+Down Right Down Down "Revenue" Ctrl+Enter Ctrl+B Ctrl+Down Ctrl+Down Up "Site costs" Ctrl+Enter Ctrl+B Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+B Ctrl+Down Ctrl+Down Up "Memo" Ctrl+Enter Ctrl+B Ctrl+Up Ctrl+Up Ctrl+Up Shift+Right Shift+Right Shift+Right Ctrl+B Ctrl+Up Shift+Right Shift+Right Shift+Right F4 Ctrl+Up Shift+Right Shift+Right Shift+Right F4 Ctrl+Up Ctrl+Up Shift+Right Shift+Right Shift+Right F4 Up Shift+Up Shift+Up Alt H 6 Ctrl+Down Ctrl+Down Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down F4 Ctrl+G "B38" Enter Ctrl+B Down Shift+Down Alt H 6 Ctrl+G "C7:E34" Enter Alt H F D N Alt H F C Right Right Right Right Enter Ctrl+Home Ctrl+Down Ctrl+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Ctrl+Shift+Down Alt H E A',
};
