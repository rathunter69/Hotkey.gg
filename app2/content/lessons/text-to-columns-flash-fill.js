// Chapter 3 · 3.4.4 Text to Columns and Flash Fill (clearcoat-databook, S4c → S4d)
// A one-time clean on a copy: the learner copies the codes off Transactions, inserts a sheet named
// Scratch at the end of the workbook and pastes them in, splits them at the hyphen with Text to
// Columns into B and C (the destination set to B1 so the codes stay whole in A), then types the
// first site into D and lets Flash Fill write the rest. Both tools write values: the closer changes a
// code on Scratch and nothing beside it follows, which is the point.
import { transactions, sheetIn, settled, selected, onSheet } from './lib/databook-checks.js';

const N = 90;
const scratch = ses => sheetIn(ses, 'Scratch');
const codes = ses => { const t = transactions(ses); const out = []; if (!t) return out; for (let r = 5; r < 5 + N; r++) out.push(t.value('B' + r)); return out; };
const valueAt = (sh, ref) => { const c = sh.cellAt(ref); return c.formula ? undefined : sh.value(ref); };
const copied = ses => { const t = transactions(ses); const cb = ses.clipboard || (t && t.clipboard); return !!cb && cb.src === t && !cb.cut && cb.rect.r1 === 5 && cb.rect.r2 === 4 + N && cb.rect.c1 === 2 && cb.rect.c2 === 2; };
const atEnd = ses => { const last = ses.sheets[ses.sheets.length - 1]; return !!last && last.name === 'Scratch'; };
const pasted = ses => { const sh = scratch(ses); if (!sh) return false; const cs = codes(ses); return cs.length === N && cs.every((c, i) => valueAt(sh, 'A' + (i + 1)) === c); };
const split = ses => { const sh = scratch(ses); if (!sh) return false; return codes(ses).every((c, i) => { const [a, b] = String(c).split('-'); return valueAt(sh, 'A' + (i + 1)) === c && valueAt(sh, 'B' + (i + 1)) === a && valueAt(sh, 'C' + (i + 1)) === b; }); };
const flashed = ses => { const sh = scratch(ses); if (!sh) return false; return codes(ses).every((c, i) => valueAt(sh, 'D' + (i + 1)) === String(c).split('-')[1]); };

export default {
  id: 'text-to-columns-flash-fill',
  chapter: 'formulas',
  section: 'Text',
  module: 'text',
  workbook: 'clearcoat-databook',
  state: { before: 'S4c', after: 'S4d' },
  title: 'Text to Columns and Flash Fill',
  difficulty: 'medium',
  tags: ['data', 'text', 'tools'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt A E',
  conventions: ['A4', 'E4'],
  teaches: ['text-to-columns', 'flash-fill'],
  uses: ['go-to', 'copy-cut-paste', 'insert-sheet', 'rename-sheet', 'move-sheet', 'keytips', 'type-to-enter', 'formula-bar', 'ctrl-arrow'],
  prerequisites: ['text-to-numbers'],
  brief: 'When a whole column needs splitting once, a formula is more than the job needs. Text to Columns (Alt, A, E) splits by a delimiter, like the hyphen in AUS-DOM, or by a fixed width, in one pass; Flash Fill (Ctrl+E) watches you type the first result and fills the pattern down. Both write values, not formulas, so they are for a one-time clean, not a live model. Split a copy of the codes both ways. The key is `Alt A E`.',
  goals: [
    { id: 'copy', text: 'Copy the codes in Transactions!B5:B94: the split happens on a copy, never on the export itself.', keys: 'Ctrl+G "Transactions!B5:B94" ↵ Ctrl+C', requires: ['go-to', 'copy-cut-paste'],
      hintStuck: 'pulse range B5:B94 · The codes run from row 5 to row 94 of column B.',
      check: (s, ses) => settled(ses) && copied(ses) },
    { id: 'sheet', teach: 'A scratch sheet holds a one-time job away from the model. Shift+F11 inserts it in front of the active sheet, so move it to the end, where a reader of the workbook never trips over it.', text: 'Insert a sheet with Shift+F11, name it Scratch, and move it to the end of the workbook.', keys: 'Shift+F11 Alt H O R "Scratch" ↵ Alt H O M ↓ ×2 ↵', requires: ['insert-sheet', 'rename-sheet', 'move-sheet', 'keytips'], convention: 'A4',
      hintStuck: 'pulse cell A1 · In Move or Copy, (move to end) sits under the last sheet.',
      check: (s, ses) => settled(ses) && atEnd(ses) },
    { id: 'paste', text: 'Paste the codes into Scratch at A1.', keys: 'Ctrl+V', requires: ['copy-cut-paste'],
      hintStuck: 'pulse cell A1 · The marquee is still on the codes, so the copy is waiting.',
      check: (s, ses) => settled(ses) && pasted(ses) },
    { id: 'split', teach: 'Text to Columns is a three-step wizard: Delimited (Alt+D), then the delimiter (Other, Alt+O, and the hyphen), then where the pieces land (Destination, Alt+E) and Finish (Alt+F). The last step also sets each column’s type: set a code column to Text, or its leading zeros are lost. Read the preview first, because a delimiter inside a field over-splits it.', text: 'With A1:A90 selected, split the codes at the hyphen with Text to Columns, into B and C (Destination $B$1), so A keeps the code.', keys: 'Alt A E Alt+D ↵ Alt+O "-" Alt+N Alt+E "$B$1" Alt+F', requires: ['text-to-columns', 'keytips'],
      hintStuck: 'pulse range B1:C1 · Leave the Destination at A1 and the codes are split in place.',
      check: (s, ses) => settled(ses) && split(ses) },
    { id: 'read-split', text: 'Go to C90 and read it: the last code split too, all ninety in one pass, and the formula bar shows a value.', keys: 'Ctrl+G "C90" ↵', requires: ['go-to', 'formula-bar'],
      hintStuck: 'pulse cell C90 · The ninetieth code sits in row 90.',
      check: (s, ses) => { const sh = scratch(ses); return settled(ses) && onSheet(ses, 'Scratch') && selected(sh, 'C90'); } },
    { id: 'flash', teach: 'Flash Fill reads the example you typed, finds where it came from in the row, and writes the same for every row below. It only rearranges characters already in the row, so a site’s name, which is not in the code, stays a lookup.', text: 'Flash Fill: type AIR in D1 beside AUS-AIR, then press Ctrl+E in D2, and the rest of the sites fill down.', keys: 'Ctrl+↑ → "AIR" ↵ Ctrl+E', requires: ['flash-fill', 'ctrl-arrow', 'type-to-enter'],
      hintStuck: 'pulse cell D1 · Type the first answer, then Ctrl+E on the cell below it.',
      check: (s, ses) => settled(ses) && flashed(ses) },
    { id: 'read', text: 'Select D45 and read the formula bar: Flash Fill wrote a value, not a formula.', keys: 'Ctrl+G "D45" ↵', requires: ['go-to', 'formula-bar'], convention: 'E4',
      hintStuck: 'pulse cell D45 · No equals sign in the formula bar means nothing will update.',
      check: (s, ses) => { const sh = scratch(ses); return settled(ses) && onSheet(ses, 'Scratch') && selected(sh, 'D45'); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Scratch!A1" Enter "SAT-ALA" Enter Ctrl+G "Scratch!B1:D1" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the code in A1 change to SAT-ALA, and the split in B1:D1 stay exactly where it was.', requires: [],
      hintStuck: 'pulse range B1:D1 · Values do not follow; formulas do.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Scratch is the last sheet and holds a copy of the codes in A1:A90', check: (s, ses) => atEnd(ses) && pasted(ses) },
    { text: 'B and C hold each code split at the hyphen, as values', check: (s, ses) => split(ses) },
    { text: 'D holds the site, filled down by Flash Fill', check: (s, ses) => flashed(ses) },
  ],
  closing: [
    'A whole column split in one pass, and you know why the result is values.',
    'Text to Columns split ninety codes at the hyphen and Flash Fill copied a pattern from one example, both without a formula. Best practice: Text to Columns and Flash Fill for a one-time clean; LEFT, RIGHT and MID when the export refreshes, because only a formula follows the data.',
  ],
  solution: 'Ctrl+G "Transactions!B5:B94" Enter Ctrl+C Shift+F11 Alt H O R "Scratch" Enter Alt H O M Down Down Enter Ctrl+V '
    + 'Alt A E Alt+D Enter Alt+O "-" Alt+N Alt+E "$B$1" Alt+F Ctrl+G "C90" Enter Ctrl+Up Right "AIR" Enter Ctrl+E Ctrl+G "D45" Enter',
};
