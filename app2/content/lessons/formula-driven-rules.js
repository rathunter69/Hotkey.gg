// Chapter 2 · 2.5.2 Formula-driven rules: a check that isn't zero turns red (clearcoat-pnl, S5a → S5b, plant PLANT_ROW_FLAG)
// A formula rule can ask anything. The checks C39:C40 turn light red when they leave zero
// (=C39<>0), and the revenue lines B7:E9 light up yellow where the margin cell in A holds an x
// (=$A7="x", the column anchored and the row free). An x planted in A8 shows the rule working; a
// second x in A9 proves the anchor, then both are cleared so the page keeps no flag. Manage Rules
// reads the list back: the newest rule on top. The closer types over total revenue and the check
// goes red.
import { PLANT_ROW_FLAG, FLAG_ROW } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const cellsOf = range => { const [a, b] = range.split(':'); const c1 = a.charCodeAt(0) - 64, c2 = b.charCodeAt(0) - 64, r1 = +a.slice(1), r2 = +b.slice(1); const out = []; for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) out.push([r, c]); return out; };
const ruled = (sh, range, pred) => !!sh && cellsOf(range).every(([r, c]) => sh.condFmtRulesAt(r, c).some(pred));
const squash = f => String(f || '').replace(/\s+/g, '').toUpperCase();
const checksRule = x => x.kind === 'formula' && squash(x.formula) === '=C39<>0' && (x.style === 'lightred' || x.style === 'redfill');
const flagRule = x => x.kind === 'formula' && squash(x.formula) === '=$A7="X"' && x.style === 'yellow';
const blank = (sh, ref) => { const v = sh.value(ref); return v === null || v === undefined || v === ''; };

export default {
  id: 'formula-driven-rules',
  chapter: 'formatting',
  section: 'Conditional formatting',
  module: 'conditional-formatting',
  workbook: 'clearcoat-pnl',
  state: { before: 'S5a', after: 'S5b' },
  plant: PLANT_ROW_FLAG,
  title: 'Formula-driven rules: a check that isn’t zero turns red',
  difficulty: 'medium',
  tags: ['format', 'conditional-formatting', 'checks', 'pnl'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt H L N',
  conventions: ['F1', 'E2'],
  teaches: ['formula-rule'],
  uses: ['highlight-rule', 'manage-rules', 'relative-absolute', 'check-cell', 'go-to', 'shift-arrow', 'delete-clears', 'type-to-enter', 'arrow-keys'],
  prerequisites: ['highlight-rules'],
  brief: 'The built-in rules ask about the cell’s own value; a formula rule can ask anything. The checks row should turn red when a check isn’t zero, and a whole row can highlight when the flag at its left says so. Write the rule once with the right anchors and it applies across the range like any formula. The key is `Alt H L N`.',
  goals: [
    { id: 'checks-red', teach: 'Alt, H, L, N opens a new rule that uses a formula: the cell is painted wherever the formula is TRUE. =C39<>0 reads “C39 is not zero”, so a check paints itself the moment two figures disagree.', text: 'Select the checks C39:C40 and add a formula rule, =C39<>0, with the Light Red Fill.', keys: 'Ctrl+G "C39" ↵ Shift+↓ Alt H L N "=C39<>0" ↵', requires: ['formula-rule', 'check-cell', 'go-to', 'shift-arrow'], convention: 'F1',
      hintStuck: 'pulse range C39:C40 · The first format in the list is the light red one.',
      check: (s, ses) => ruled(pnl(ses), 'C39:C40', checksRule) && settled(ses) },
    { id: 'row-rule', teach: 'A formula rule is written for the top-left cell of the selection and read in every cell as if it had been filled. $A7 locks the column, so every cell of a row looks at its own flag in A, and the row stays free to move down.', text: 'Select the revenue lines B7:E9 and add =$A7="x" with the Yellow Fill, so the row flagged x in A8 lights up.', keys: `Ctrl+G "B7" ↵ Shift+→ ×3 Shift+↓ ×2 Alt H L N '=$A7="x"' ↓ ↵`, requires: ['formula-rule', 'relative-absolute', 'go-to', 'shift-arrow'], convention: 'E2',
      hintStuck: 'pulse range B7:E9 · A dollar before the A and none before the 7.',
      check: (s, ses) => ruled(pnl(ses), 'B7:E9', flagRule) && settled(ses) },
    { id: 'second-flag', text: 'Type x in A9 and watch B9:E9 light up too: the rule follows each row.', keys: '← ↓ ×2 "x" ↵', requires: ['type-to-enter', 'arrow-keys'],
      hintStuck: 'pulse cell A9 · Beside other revenue, in the narrow margin column.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && String(sh.value('A9')).toLowerCase() === 'x' && settled(ses); } },
    { id: 'clear-flags', text: 'Clear the flags in A8:A9 with Delete, so the page keeps no x and no yellow.', keys: '↑ ×2 Shift+↓ Delete', requires: ['delete-clears', 'shift-arrow'],
      hintStuck: `pulse range A${FLAG_ROW}:A9 · The rules stay; only the flags go.`,
      check: (s, ses) => { const sh = pnl(ses); return !!sh && blank(sh, 'A8') && blank(sh, 'A9') && settled(ses); } },
    { id: 'read-rules', text: 'Open Manage Rules with Alt, H, L, R and read the four rules, the newest on top.', keys: 'Alt H L R', requires: ['manage-rules'],
      hintStuck: 'pulse range B7:E9 · The row rule, the checks rule, Duplicate Values, then the margin rule.',
      check: (s, ses) => onSheet(ses, 'P&L') && ses.dialog === 'condrules' },
    { id: 'close-rules', text: 'Close Manage Rules with Enter.', keys: '↵', requires: ['manage-rules'],
      hintStuck: 'pulse range C39:C40 · Enter is OK.',
      check: (s, ses) => settled(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C10" Enter "32000" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch total revenue in C10 typed over as 32000, and the check in C39 leave zero and turn red.', requires: [],
      hintStuck: 'pulse cell C39 · A typed total no longer matches its lines.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The checks C39:C40 carry the rule =C39<>0', check: (s, ses) => ruled(pnl(ses), 'C39:C40', checksRule) },
    { text: 'The revenue lines B7:E9 carry the rule =$A7="x"', check: (s, ses) => ruled(pnl(ses), 'B7:E9', flagRule) },
    { text: 'A8 and A9 are empty', check: (s, ses) => { const sh = pnl(ses); return !!sh && blank(sh, 'A8') && blank(sh, 'A9'); } },
  ],
  closing: [
    'The check turns red before anyone else sees it.',
    'A formula rule asks any question a formula can, and its anchors work the way they do in a cell: the dollar on the A holds the flag column while the row moves down. The checks block now flags itself, which is what a buyer’s analyst will test first.',
  ],
  solution: `Ctrl+G "C39" Enter Shift+Down Alt H L N "=C39<>0" Enter Ctrl+G "B7" Enter Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Alt H L N '=$A7="x"' Down Enter Left Down Down "x" Enter Up Up Shift+Down Delete Alt H L R Enter`,
};
