// Chapter 2 · 2.5.1 Highlight rules: negatives, exceptions (clearcoat-pnl, S4d → S5a, plant PLANT_DUP_LABEL)
// A conditional format is a rule a range applies to itself. The margin lines C27:E29 take Less
// Than 0 in red text, Monthly's revenue line C10:N10 shades the slow months under 3,800, and
// Duplicate Values over the P&L's labels B7:B35 lights the label planted in B18 (Card fees reads
// Marketing), which is retyped. Manage Rules reads the list back. The closer lifts January's retail
// revenue and the month's shade clears.
import { PLANT_DUP_LABEL, slowMonthThreshold, EXPORT, LABELS } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const monthly = ses => sheetOf(ses, 'Monthly');
const settled = ses => !ses.editing && !ses.dialog;
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const cellsOf = range => { const [a, b] = range.split(':'); const c1 = a.charCodeAt(0) - 64, c2 = b.charCodeAt(0) - 64, r1 = +a.slice(1), r2 = +b.slice(1); const out = []; for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) out.push([r, c]); return out; };
/** Every cell of `range` carries a rule that passes `pred`. */
const ruled = (sh, range, pred) => !!sh && cellsOf(range).every(([r, c]) => sh.condFmtRulesAt(r, c).some(pred));
const RED = new Set(['redtext', 'lightred', 'redfill']);
const negRule = x => x.kind === 'cellValue' && x.op === '<' && x.v1 === 0 && RED.has(x.style);
const THRESHOLD = slowMonthThreshold(EXPORT);
const dupRule = x => x.kind === 'duplicate' && !x.unique;
const dupRuled = sh => !!sh && sh.condFmt.some(x => dupRule(x) && x.range === 'B7:B35');
const slowRule = x => x.kind === 'cellValue' && x.op === '<' && x.v1 === THRESHOLD && x.style === 'yellow';

export default {
  id: 'highlight-rules',
  chapter: 'formatting',
  section: 'Conditional formatting',
  module: 'conditional-formatting',
  workbook: 'clearcoat-pnl',
  state: { before: 'S4d', after: 'S5a' },
  plant: PLANT_DUP_LABEL,
  title: 'Highlight rules: negatives, exceptions',
  difficulty: 'medium',
  tags: ['format', 'conditional-formatting', 'pnl'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt H L',
  conventions: ['F4', 'D8'],
  teaches: ['highlight-rule', 'duplicate-values', 'manage-rules'],
  uses: ['go-to', 'sheet-reference', 'shift-arrow', 'ctrl-shift-arrow', 'replace-by-typing'],
  prerequisites: ['navigation-column'],
  brief: 'Conditional formatting is a rule a range applies to itself, and the built-in rules cover most of what a page needs: less than, greater than, between, equal to, duplicate values. Highlight a negative margin, a month under a threshold and a duplicate label, and choose the format a reader will understand, not the loudest one. The key is `Alt H L`.',
  goals: [
    { id: 'select-margins', text: 'Select the three margin lines, C27:E29, the cells the first rule will watch.', keys: 'Ctrl+G "C27" ↵ Shift+→ ×2 Shift+↓ ×2', requires: ['go-to', 'shift-arrow'],
      hintStuck: 'pulse range C27:E29 · Gross, site contribution and EBITDA margin, under Margins and growth.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && onSheet(ses, 'P&L') && sh.selectionText() === 'C27:E29'; } },
    { id: 'neg-margins', teach: 'Alt, H, L opens Conditional Formatting, H the Highlight Cells Rules, and L is Less Than. Type the value, pick the format with the arrows, and Enter adds the rule. Red Text is enough: a margin under zero needs to be noticed, not shouted.', text: 'Add a rule to C27:E29: Less Than 0, Red Text.', keys: 'Alt H L H L "0" → ×4 ↵', requires: ['highlight-rule'], convention: 'D8',
      hintStuck: 'pulse range C27:E29 · Four steps right of the first format is Red Text.',
      check: (s, ses) => ruled(pnl(ses), 'C27:E29', negRule) && settled(ses) },
    { id: 'slow-months', text: 'On Monthly, give revenue under 3,800 in C10:N10 a Yellow Fill with Dark Yellow Text, so the slow months show up.', keys: 'Ctrl+G "Monthly!C10" ↵ Ctrl+Shift+→ Shift+← Alt H L H L "3800" → ↵', requires: ['highlight-rule', 'go-to', 'sheet-reference', 'ctrl-shift-arrow'], convention: 'F4',
      hintStuck: 'pulse range C10:N10 · January to December, not the full year in O.',
      check: (s, ses) => ruled(monthly(ses), 'C10:N10', slowRule) && settled(ses) },
    { id: 'dup-rule', teach: 'A label that repeats is the easiest error to miss and the first one a buyer finds. Highlight Cells Rules › Duplicate Values (Alt, H, L, H, D) lights every label that appears more than once.', text: 'Back on the P&L, select the labels B7:B35 and add Duplicate Values with Alt, H, L, H, D, Enter.', keys: `Ctrl+G "'P&L'!B7:B35" ↵ Alt H L H D ↵`, requires: ['duplicate-values', 'go-to', 'sheet-reference'], convention: 'F4',
      hintStuck: 'pulse range B7:B35 · Every label from retail wash revenue to the memo.',
      check: (s, ses) => dupRuled(pnl(ses)) && settled(ses) },
    { id: 'duplicate', text: 'B18 and B19 light up because B18 repeats Marketing: type Card fees over it.', keys: `Ctrl+G "'P&L'!B18" ↵ "Card fees" ↵`, requires: ['go-to', 'replace-by-typing'], convention: 'F4',
      hintStuck: 'pulse cell B18 · The line between maintenance and marketing.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && dupRuled(sh) && sh.value('B18') === LABELS[18] && settled(ses); } },
    { id: 'read-rules', teach: 'Alt, H, L, R opens Manage Rules: every rule on the sheet, its format and the range it applies to, in the order they run.', text: 'Open Manage Rules with Alt, H, L, R and read the two rules on the P&L, the newest on top, and the ranges they apply to.', keys: 'Alt H L R', requires: ['manage-rules'],
      hintStuck: 'pulse range C27:E29 · Duplicate Values on the labels, then the margin rule.',
      check: (s, ses) => onSheet(ses, 'P&L') && ses.dialog === 'condrules' },
    { id: 'close-rules', text: 'Close Manage Rules with Enter, leaving the rules as they are.', keys: '↵', requires: ['manage-rules'],
      hintStuck: 'pulse range C27:E29 · Enter is OK.',
      check: (s, ses) => settled(ses) && ruled(pnl(ses), 'C27:E29', negRule) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Monthly!C7" Enter "2300" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch January’s retail revenue in Monthly!C7 rise to 2,300, the month reach 4,000, and its yellow clear.', requires: [],
      hintStuck: 'pulse cell C10 · The rule reads the value every time it changes.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The margin lines C27:E29 turn red below zero', check: (s, ses) => ruled(pnl(ses), 'C27:E29', negRule) },
    { text: 'Monthly shades a month under 3,800 in C10:N10', check: (s, ses) => ruled(monthly(ses), 'C10:N10', slowRule) },
    { text: 'Duplicate Values watches the labels B7:B35, and B18 reads Card fees', check: (s, ses) => { const sh = pnl(ses); return dupRuled(sh) && sh.value('B18') === LABELS[18]; } },
  ],
  closing: [
    'With three rules in and the duplicate gone, the page points at its own soft spots.',
    'A margin under zero now reads red without anyone looking for it, and the slow winter months show on Monthly at a glance. Rules like these are a second pair of eyes: one quiet format each, on the cells that matter.',
  ],
  solution: `Ctrl+G "C27" Enter Shift+Right Shift+Right Shift+Down Shift+Down Alt H L H L "0" Right Right Right Right Enter Ctrl+G "Monthly!C10" Enter Ctrl+Shift+Right Shift+Left Alt H L H L "3800" Right Enter Ctrl+G "'P&L'!B7:B35" Enter Alt H L H D Enter Ctrl+G "'P&L'!B18" Enter "Card fees" Enter Alt H L R Enter`,
};
