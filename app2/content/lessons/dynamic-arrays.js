// Chapter 4 · 4.2.6 UNIQUE, FILTER and SORT: the modern list tools (clearcoat-pack, S425 → S426)
// Built on the working answer to screenplay 9.1 question 12 (build it, after the classic tools).
// On the Scratch sheet, beside the pasted rows: UNIQUE spills the six codes, SORT(UNIQUE) puts them
// in order, FILTER pulls Domain's fifteen rows with a SUM of their washes under them, and SEQUENCE
// writes 1 to 12. The closer types a new code into the export and the UNIQUE list grows on its own.
import { sheetIn, exportSheet, rowsOf, sameText, calls, live, near, settled, shellOf, refsIn } from './lib/pack-checks.js';
import { DYNAMIC } from '../workbooks/clearcoat-pack.js';

const scratch = ses => sheetIn(ses, 'Scratch');
const PLANT = [...Object.keys(DYNAMIC.labels), ...DYNAMIC.dates];
const A = DYNAMIC.anchors;
const codesIn = ses => { const out = []; for (const x of rowsOf(exportSheet(ses))) if (typeof x.site === 'string' && !out.some(c => sameText(c, x.site))) out.push(x.site); return out; };
const spill = (sh, col, from, n) => Array.from({ length: n }, (_, i) => sh.value(col + (from + i)));
const empty = v => v == null || v === '';
const unique = ses => { const sh = scratch(ses); const want = codesIn(ses); return calls(sh, 'I2', ['UNIQUE']) && spill(sh, 'I', 2, want.length).every((v, i) => sameText(v, want[i])) && empty(sh.value('I' + (2 + want.length))); };
const sorted = ses => { const sh = scratch(ses); const want = codesIn(ses).slice().sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase())); return calls(sh, 'J2', ['SORT', 'UNIQUE']) && spill(sh, 'J', 2, want.length).every((v, i) => sameText(v, want[i])); };
const domain = ses => rowsOf(exportSheet(ses)).filter(x => sameText(x.site, 'AUS-DOM'));
const filtered = ses => { const sh = scratch(ses); const rows = domain(ses); return calls(sh, 'L2', ['FILTER']) && rows.length > 0 && rows.every((x, i) => sh.value('L' + (2 + i)) === x.date && sameText(sh.value('M' + (2 + i)), x.site) && sh.value('P' + (2 + i)) === x.total) && empty(sh.value('L' + (2 + rows.length))); };
const washes = ses => { const sh = scratch(ses); return calls(sh, 'L18', ['SUM']) && near(sh.value('L18'), domain(ses).reduce((t, x) => t + (x.total || 0), 0)) && live(sh, 'L18'); };
const sequence = ses => { const sh = scratch(ses); return calls(sh, 'T2', ['SEQUENCE']) && spill(sh, 'T', 2, 12).every((v, i) => v === i + 1) && empty(sh.value('T14')); };

export default {
  id: 'dynamic-arrays',
  chapter: 'data-and-lookups',
  section: 'Lists and tables',
  module: 'lists-and-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S425', after: 'S426' },
  plant: shellOf('S426', { Scratch: PLANT }, { keepText: true }),
  title: 'UNIQUE, FILTER and SORT: the modern list tools',
  difficulty: 'medium',
  tags: ['data', 'lists', 'dynamic-arrays'],
  access: 'paid',
  minutes: 5,
  headline: 'UNIQUE',
  conventions: ['F4'],
  teaches: ['dynamic-arrays'],
  uses: ['go-to', 'arrow-keys', 'ctrl-arrow', 'cross-sheet-ref', 'sum-family', 'type-to-enter', 'remove-duplicates', 'autofilter', 'sort-dialog'],
  prerequisites: ['filter-tricks'],
  brief: 'Modern Excel does three of this module’s jobs with a formula that spills its answer into the cells below: UNIQUE(range) gives the unique list, FILTER(range, condition) the matching rows, SORT puts them in order, and SEQUENCE writes 1 to n. They are live where Remove Duplicates and the filter are one-off, but they need a version of Excel that has them, and not every desk does. Build them on Scratch, a sheet that stays yours. The key is `UNIQUE`.',
  goals: [
    { id: 'unique', teach: 'A dynamic array formula is typed in one cell and spills its answer down as many cells as it needs, with a thin border round the spill. Only the first cell holds the formula; the rest are its answer.', text: 'On Scratch, put =UNIQUE(Export!B5:B94) in I2 and watch six codes spill down.', keys: `Ctrl+G "Scratch!I2" ↵ "${A.I2}" ↵`, requires: ['dynamic-arrays', 'go-to', 'cross-sheet-ref', 'type-to-enter'],
      hintStuck: 'pulse cell Scratch!I2 · One formula, six answers below it.',
      check: (s, ses) => settled(ses) && unique(ses) },
    { id: 'sort', text: 'In J2, wrap it in SORT: =SORT(UNIQUE(Export!B5:B94)) gives the same codes A to Z.', keys: `↑ → "${A.J2}" ↵`, requires: ['dynamic-arrays', 'arrow-keys', 'type-to-enter'],
      hintStuck: 'pulse cell J2 · SORT takes the whole spilled list as its range.',
      check: (s, ses) => settled(ses) && unique(ses) && sorted(ses) },
    { id: 'filter', text: 'In L2, =FILTER(Export!A5:G94,Export!B5:B94="AUS-DOM") pulls Domain’s fifteen rows across seven columns.', keys: `↑ → ×2 '${A.L2}' ↵`, requires: ['dynamic-arrays', 'arrow-keys', 'type-to-enter'],
      hintStuck: 'pulse cell L2 · The condition is a column of TRUE and FALSE, one per row of the range.',
      check: (s, ses) => settled(ses) && filtered(ses) },
    { id: 'sum', text: 'Under the filtered rows, L18 =SUM(P2:P16) adds Domain’s total washes from the spill.', keys: `Ctrl+↓ ↓ ×2 "${A.L18}" ↵`, requires: ['sum-family', 'ctrl-arrow', 'arrow-keys', 'type-to-enter'], convention: 'F4',
      hintStuck: 'pulse cell L18 · Total washes is the fifth column of the export, so P in the spill.',
      check: (s, ses) => settled(ses) && filtered(ses) && washes(ses) },
    { id: 'sequence', text: 'In T2, =SEQUENCE(12) writes a month counter, 1 to 12, from one cell.', keys: `Ctrl+G "T2" ↵ "${A.T2}" ↵`, requires: ['dynamic-arrays', 'go-to', 'type-to-enter'],
      hintStuck: 'pulse cell T2 · SEQUENCE(n) counts from 1 to n down the column.',
      check: (s, ses) => settled(ses) && sequence(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Export!B5" Enter "AUS-NEW" Enter Ctrl+G "Scratch!I2" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch a new code typed into the export join the UNIQUE list as a seventh row, with nobody rerunning anything.', requires: [],
      hintStuck: 'pulse range I2:I8 · A spill recalculates like any formula.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Scratch holds the UNIQUE and SORT(UNIQUE) lists of the six codes', check: (s, ses) => unique(ses) && sorted(ses) },
    { text: 'The FILTER of Domain’s rows, its washes summed in L18, and the SEQUENCE are in place', check: (s, ses) => filtered(ses) && washes(ses) && sequence(ses) },
  ],
  closing: [
    'The list tools became live formulas, on a sheet that can use them.',
    'Best practice: dynamic arrays in a file that stays yours; the classic tools plus SUMIFS in anything a bank will open, because an older Excel shows a spilled formula as one cell and an error. Check the version before you send.',
  ],
  solution: `Ctrl+G "Scratch!I2" Enter "${A.I2}" Enter Up Right "${A.J2}" Enter Up Right Right '${A.L2}' Enter Ctrl+Down Down Down "${A.L18}" Enter Ctrl+G "T2" Enter "${A.T2}" Enter`,
};
