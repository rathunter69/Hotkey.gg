// Chapter 4 · 4.2.5 Filter tricks: visible cells only, wildcards, skip blanks (clearcoat-pack, S424 → S425; the corrections column arrives as a planting)
// Three traps a list sets. Rows 20:34 of the sorted copy are hidden by hand; Alt+; before the copy
// leaves them behind, and the seventy-five rows land on a new Scratch sheet; then the rows come
// back. Beside the export, COUNTIF and SUMIFS take wildcards. Last, a column of hours corrections
// with gaps lands over the hours with Skip blanks, so only the four figures go in. The closer types
// a typo into a Domain code and only the pattern count notices.
import { exportSheet, copySheet, sheetIn, rowsOf, sameText, calls, live, near, settled, shellOf, sheetNames } from './lib/pack-list-checks.js';
import { workbookState } from '../workbooks/index.js';
import { CORRECTIONS } from '../workbooks/clearcoat-pack.js';

const WILD = ['I96', 'I97', 'I98', 'J96', 'J97', 'J98'];
const F = { austin: '=COUNTIF(B5:B94,"AUS-*")', domain: '=COUNTIF(B5:B94,"AUS-?O?")', endsR: '=SUMIFS(F5:F94,B5:B94,"*R")' };
const HID = { from: 20, to: 34 };
const CORRECTION_CELLS = (() => { const c = workbookState('clearcoat-pack', 'S425start').sheets.find(s => s.name === 'Export sort').cells; const out = {}; for (const r of ['4', ...Object.keys(CORRECTIONS.rows)]) out['Export sort!' + CORRECTIONS.col + r] = { ...c[CORRECTIONS.col + r] }; return out; })();
const HOURS = (() => { const sh = workbookState('clearcoat-pack', 'S425start').sheets.find(s => s.name === 'Export sort'); const out = {}; for (let r = 5; r <= 94; r++) out[r] = sh.cells['G' + r] ? sh.cells['G' + r].value : null; return out; })();
const hiddenBand = sh => !!sh && sh.hiddenRows.size === HID.to - HID.from + 1 && [...sh.hiddenRows].every(r => r >= HID.from && r <= HID.to);
const scratch = ses => sheetIn(ses, 'Scratch');
const scratchPlaced = ses => { const n = sheetNames(ses); const i = n.indexOf('Scratch'); return i > 0 && n[i - 1] === 'Export sort'; };
/** The visible rows of the copy (header and data, rows 20:34 left out), in order. */
const VISIBLE = (() => { const c = workbookState('clearcoat-pack', 'S425start').sheets.find(s => s.name === 'Export sort').cells; const v = ref => (c[ref] ? c[ref].value ?? null : null); const out = [];
  for (let r = 4; r <= 94; r++) if (r < HID.from || r > HID.to) out.push([...'ABCDEFG'].map(col => (col === 'E' && r > 4 && c['E' + r] ? v('C' + r) + v('D' + r) : v(col + r)))); return out; })();
const visibleRows = () => VISIBLE;
const copiedVisible = ses => { const cb = ses.sheet.clipboard; if (!cb) return false; const e = ses.sheets.find(x => x.sheet === cb.src); return !!e && e.name === 'Export sort' && cb.h === 76 && cb.w === 7 && cb.rect.r1 === 4 && cb.rect.r2 >= 94; };
const landed = ses => { const sc = scratch(ses); if (!sc || !scratchPlaced(ses)) return false; const want = visibleRows(ses); return want.every((row, i) => row.every((v, j) => { const got = sc.value('ABCDEFG'[j] + (i + 1)); return got === v || (v == null && (got == null || got === '')); })) && (sc.value('A77') == null || sc.value('A77') === ''); };
const unhidden = ses => copySheet(ses).hiddenRows.size === 0;
const wildcard = (pattern) => new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
const counts = ses => { const ex = exportSheet(ses); const rows = rowsOf(ex); const n = re => rows.filter(x => typeof x.site === 'string' && re.test(x.site)).length;
  return calls(ex, 'J96', ['COUNTIF']) && ex.value('J96') === n(wildcard('AUS-*')) && /\*/.test(ex.formula('J96') || '') && calls(ex, 'J97', ['COUNTIF']) && ex.value('J97') === n(wildcard('AUS-?O?')) && /\?/.test(ex.formula('J97') || '') && live(ex, 'J97'); };
const sumR = ses => { const ex = exportSheet(ses); const rows = rowsOf(ex); const re = wildcard('*R'); const want = rows.filter(x => typeof x.site === 'string' && re.test(x.site)).reduce((t, x) => t + (typeof x.revenue === 'number' ? x.revenue : 0), 0);
  return calls(ex, 'J98', ['SUMIFS']) && /\*/.test(ex.formula('J98') || '') && near(ex.value('J98'), want) && live(ex, 'J98'); };
const corrected = ses => { const cp = copySheet(ses); return Object.keys(HOURS).every(r => (CORRECTIONS.rows[r] != null ? cp.value('G' + r) === CORRECTIONS.rows[r] : cp.value('G' + r) === HOURS[r])); };

export default {
  id: 'filter-tricks',
  chapter: 'data-and-lookups',
  section: 'Lists and tables',
  module: 'lists-and-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S424', after: 'S425' },
  plant: { ...CORRECTION_CELLS, ...shellOf('S425', { Export: WILD }, { keepText: true }) },
  title: 'Filter tricks: visible cells only, wildcards, skip blanks',
  difficulty: 'hard',
  tags: ['data', 'lists', 'paste-special'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt+;',
  conventions: ['C7', 'E4'],
  teaches: ['visible-cells', 'wildcards', 'skip-blanks'],
  uses: ['go-to', 'ctrl-home-end', 'arrow-keys', 'shift-arrow', 'ctrl-shift-arrow', 'hide-unhide', 'copy-cut-paste', 'paste-special', 'insert-sheet', 'rename-sheet', 'page-keys', 'countif-countifs', 'sumif-sumifs', 'type-to-enter'],
  prerequisites: ['data-validation-dropdowns'],
  brief: 'A list does three things to the unwary: copy a block with rows hidden by hand and they come too, unless you select visible cells only first with Alt+;. Search for a site by part of its code and COUNTIF wants a wildcard, * for any run of characters and ? for exactly one. Paste a partial column over a full one and its blanks wipe what was there, unless Paste Special skips blanks. The key is `Alt+;`.',
  goals: [
    { id: 'hide', text: 'On Export sort, hide rows 20 to 34 by hand: Go To A20:A34 and press Ctrl+9.', keys: 'Ctrl+G "\'Export sort\'!A20:A34" ↵ Ctrl+9', requires: ['go-to', 'hide-unhide'], convention: 'C7',
      hintStuck: 'pulse rows 20:34 · Ctrl+9 hides every row the selection touches.',
      check: (s, ses) => hiddenBand(copySheet(ses)) },
    { id: 'visible', teach: 'A copy of a block takes rows hidden by hand along with it. Alt+; selects the visible cells only, so the next Ctrl+C leaves the hidden rows behind; a filter does this on its own.', text: 'Select the block A4:G94, press Alt+; for visible cells only, then Ctrl+C.', keys: 'Ctrl+Home ↓ ×3 Shift+→ ×6 Ctrl+Shift+↓ Alt+; Ctrl+C', requires: ['visible-cells', 'ctrl-home-end', 'arrow-keys', 'shift-arrow', 'ctrl-shift-arrow', 'copy-cut-paste'],
      hintStuck: 'pulse range A4:G94 · Alt+; works on the selection you have, so select first.',
      check: (s, ses) => hiddenBand(copySheet(ses)) && copiedVisible(ses) },
    { id: 'scratch', text: 'Insert a sheet after Export sort, rename it Scratch and paste at A1: seventy-five rows and the header.', keys: 'Ctrl+PgDn Shift+F11 Alt H O R "Scratch" ↵ Ctrl+V', requires: ['page-keys', 'insert-sheet', 'rename-sheet', 'copy-cut-paste'],
      hintStuck: 'pulse tab Domain · Shift+F11 puts the new sheet before the tab you are on.',
      check: (s, ses) => landed(ses) },
    { id: 'unhide', text: 'Back on Export sort, the block is still selected: Ctrl+Shift+9 brings rows 20 to 34 back.', keys: 'Ctrl+PgUp Ctrl+Shift+9', requires: ['page-keys', 'hide-unhide'],
      hintStuck: 'pulse rows 20:34 · Unhide works on the rows the selection spans.',
      check: (s, ses) => landed(ses) && unhidden(ses) },
    { id: 'wild', teach: 'In a criteria, * stands for any run of characters and ? for exactly one. "AUS-*" is every Austin code; "AUS-?O?" is a code whose middle letter of three is O.', text: 'Beside the export, count with wildcards: J96 =COUNTIF(B5:B94,"AUS-*") and J97 =COUNTIF(B5:B94,"AUS-?O?").', keys: `Ctrl+G "Export!J96" ↵ '${F.austin}' ↵ '${F.domain}' ↵`, requires: ['wildcards', 'countif-countifs', 'go-to', 'type-to-enter'],
      hintStuck: 'pulse range J96:J97 · Ninety Austin rows, and fifteen that fit the Domain pattern.',
      check: (s, ses) => settled(ses) && counts(ses) },
    { id: 'sum-r', text: 'In J98, retail revenue for every code ending in R: =SUMIFS(F5:F94,B5:B94,"*R").', keys: `'${F.endsR}' ↵`, requires: ['wildcards', 'sumif-sumifs', 'type-to-enter'],
      hintStuck: 'pulse cell J98 · A star in front matches any start; the R must be last.',
      check: (s, ses) => settled(ses) && counts(ses) && sumR(ses) },
    { id: 'skip', teach: 'Paste Special with Skip blanks (Ctrl+Alt+V, then B) leaves a blank cell of the copy out of the paste, so what sits under it stays. Without it, a partial column wipes the full one.', text: 'On Export sort, copy the corrections I5:I94 and Paste Special them over the hours at G5 with Skip blanks ticked.', keys: 'Ctrl+G "\'Export sort\'!I5:I94" ↵ Ctrl+C ← ×2 Ctrl+Alt+V B ↵', requires: ['skip-blanks', 'paste-special', 'go-to', 'arrow-keys'], convention: 'E4',
      hintStuck: 'pulse range G5:G94 · B ticks Skip blanks; only the four corrections land.',
      check: (s, ses) => settled(ses) && corrected(ses) && unhidden(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Export!B5" Enter "AUS-DMO" Enter Ctrl+G "J97" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch a typo in a Domain code drop the pattern count in J97 to 14 while J96 holds at 90.', requires: [],
      hintStuck: 'pulse cell J97 · AUS-DMO is still Austin, but its middle letter is no longer O.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Scratch, after Export sort, holds the seventy-five visible rows and the header', check: (s, ses) => landed(ses) },
    { text: 'Export sort shows every row, with the four hours corrections in G', check: (s, ses) => unhidden(ses) && corrected(ses) },
    { text: 'J96:J98 on Export hold the wildcard COUNTIFs and SUMIFS', check: (s, ses) => counts(ses) && sumR(ses) },
  ],
  closing: [
    'Visible cells only, a wildcard, and a paste that skips blanks: three keys that each save an afternoon.',
    'Best practice: press Alt+; before any copy from a block with hidden or grouped rows. A filter copies only what shows, but a block pasted onto a filtered list also lands in the rows the filter hides, so clear the filter before you paste.',
  ],
  solution: 'Ctrl+G "\'Export sort\'!A20:A34" Enter Ctrl+9 Ctrl+Home Down Down Down Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+Shift+Down Alt+; Ctrl+C '
    + 'Ctrl+PgDn Shift+F11 Alt H O R "Scratch" Enter Ctrl+V Ctrl+PgUp Ctrl+Shift+9 '
    + `Ctrl+G "Export!J96" Enter '${F.austin}' Enter '${F.domain}' Enter '${F.endsR}' Enter `
    + 'Ctrl+G "\'Export sort\'!I5:I94" Enter Ctrl+C Left Left Ctrl+Alt+V B Enter',
};
