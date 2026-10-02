// Chapter 2 · 2.4.1 Wrap, indent, Center Across Selection at scale (clearcoat-pnl, S3f → S4a)
// Monthly's header row goes bold over its figures in one press, the full-year header is retyped
// in sentence case and wrapped rather than widened, the units line goes italic, and the label
// column is read for its levels. The months already sit right (2.2.3) and the title already spans
// A1:O1 (2.3.6), so the lesson finishes the alignment rather than redoing it. The closer moves
// January's retail revenue and the full year answers.
import { FULL_YEAR_COL, MONTH_COLS } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const monthly = ses => sheetOf(ses, 'Monthly');
const activeName = ses => ses.sheets[ses.sheetIndex].name;
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const HEAD_COLS = ['B', ...MONTH_COLS, FULL_YEAR_COL];

const headsBold = m => HEAD_COLS.every(col => m.cellAt(col + '4').bold);
const fullYear = m => m.value(FULL_YEAR_COL + '4') === 'Full year';
const wrapped = m => m.cellAt(FULL_YEAR_COL + '4').wrap && m.cellAt(FULL_YEAR_COL + '4').align === 'r';

export default {
  id: 'alignment-at-scale',
  chapter: 'formatting',
  section: 'Alignment and structure',
  module: 'alignment-and-structure',
  workbook: 'clearcoat-pnl',
  state: { before: 'S3f', after: 'S4a' },
  title: 'Wrap, indent, Center Across Selection at scale',
  difficulty: 'medium',
  tags: ['alignment', 'presentation', 'monthly'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt H W',
  conventions: ['D6', 'C5'],
  teaches: ['header-alignment'],
  uses: ['bold-italic-underline', 'wrap-text', 'indent-levels', 'go-to', 'sheet-reference', 'ctrl-enter-fill', 'replace-by-typing', 'page-anatomy'],
  prerequisites: ['challenge-pnl-presentation-quality'],
  brief: 'Alignment is the same three moves you know, done on a whole page at once: headers right over figures, sub-lines indented, long headers wrapped rather than widened, titles centered across the block. The Monthly page has twelve month headers, a full year, two levels of lines and a title over fifteen columns. Finish its alignment in a handful of presses. The key is `Alt H W`.',
  goals: [
    { id: 'bold-heads', teach: 'A header sits bold and right-aligned over its figures, so the eye reads straight down a column. The months are already right-aligned; one Ctrl+B on the row makes the whole header read as one.', text: 'On Monthly, bold the whole header row B4:O4 with one Ctrl+B.', keys: 'Ctrl+G "Monthly!B4:O4" ↵ Ctrl+B', requires: ['header-alignment', 'bold-italic-underline', 'go-to', 'sheet-reference'], convention: 'D6',
      hintStuck: 'pulse range B4:O4 · Month ending, twelve months and the full year.',
      check: (s, ses) => { const m = monthly(ses); return !!m && headsBold(m) && settled(ses); } },
    { id: 'full-year', text: 'Retype the capitals in the full-year header O4 as Full year, in sentence case.', keys: 'Ctrl+G "Monthly!O4" ↵ "Full year" Ctrl+↵', requires: ['replace-by-typing', 'ctrl-enter-fill', 'go-to'], convention: 'G3',
      hintStuck: 'pulse cell O4 · Typing over a header keeps its bold and its alignment.',
      check: (s, ses) => { const m = monthly(ses); return !!m && fullYear(m) && settled(ses); } },
    { id: 'wrap', teach: 'A long header wraps inside its column rather than widening it, so every period column keeps the same width. Wrap Text is Alt, H, W.', text: 'Wrap O4 with Alt, H, W rather than widening column O.', keys: 'Alt H W', requires: ['wrap-text', 'header-alignment'], convention: 'C2',
      hintStuck: 'pulse cell O4 · Column O keeps the width every month has.',
      check: (s, ses) => { const m = monthly(ses); return !!m && fullYear(m) && wrapped(m) && settled(ses); } },
    { id: 'units', text: 'Set the units line in A2 italic with Ctrl+I, left and unwrapped, as it reads on the P&L.', keys: 'Ctrl+G "Monthly!A2" ↵ Ctrl+I', requires: ['bold-italic-underline', 'go-to'], convention: 'C5',
      hintStuck: 'pulse cell A2 · The units line sits under the title.',
      check: (s, ses) => { const m = monthly(ses); return !!m && m.cellAt('A2').it && !m.cellAt('A2').wrap && settled(ses); } },
    { id: 'read', teach: 'The label column now says the hierarchy without a word added: a bold section, its lines one level in, and a bold total with its top border. The indents came across with the P&L’s formats in the last lesson.', text: 'Land on Labor in B14 and read the levels down column B: section, line and total.', keys: 'Ctrl+G "Monthly!B14" ↵', requires: ['indent-levels', 'go-to'], convention: 'D6',
      hintStuck: 'pulse cell B14 · Site costs is the section; total site costs closes it.',
      check: (s, ses) => { const m = monthly(ses); return !!m && activeName(ses) === 'Monthly' && m.selectionText() === 'B14' && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Monthly!C7" Enter "2000" Enter Ctrl+G "Monthly!O10" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Monthly!C7 change to 2000, and the full year in O10 answer.', requires: [],
      hintStuck: 'pulse cell O10 · The full year adds the twelve months.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The header row is bold over its figures, the full year wrapped', check: (s, ses) => { const m = monthly(ses); return !!m && headsBold(m) && fullYear(m) && wrapped(m); } },
    { text: 'The units line is italic', check: (s, ses) => { const m = monthly(ses); return !!m && m.cellAt('A2').it; } },
  ],
  closing: [
    'Fourteen headers, two levels of lines and fifteen columns got aligned in a handful of moves.',
    'The headers read as one row, the full year wraps inside the width every month has, and the label column says what belongs to what. Alignment done on a whole page at once is the same three moves you already know.',
  ],
  solution: 'Ctrl+G "Monthly!B4:O4" Enter Ctrl+B Ctrl+G "Monthly!O4" Enter "Full year" Ctrl+Enter Alt H W Ctrl+G "Monthly!A2" Enter Ctrl+I Ctrl+G "Monthly!B14" Enter',
};
