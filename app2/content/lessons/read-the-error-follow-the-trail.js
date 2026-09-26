// Chapter 1 · 1.6.6 — Read the error, follow the trail (voltline-weekly, S6e → S6f, plant PLANT_COSTS_ERRORS)
// The Costs sheet came back from a colleague with its Total column showing error codes instead of
// figures, and the new cost-per-kWh line broken with them: #REF! (a deleted reference), #NAME? (a
// misspelled function), #VALUE! (the word "tbc" where a figure belongs), #N/A (a lookup that finds
// nothing) and, once the total is a number again, #DIV/0! (a division by an empty cell). Each code
// is read as the message it is; Ctrl+[ follows the trail to the cell a formula reads — on the same
// sheet, and across sheets from the link on B11 — and Ctrl+] comes back; every fix is to the input
// or the formula, never a number pasted over it. The plant replaces the planted cells' records, so
// the fixed totals also get the block's format back (E4's format pasted onto them: bold, comma
// style and automatic color in one press). The closer changes Domain's lease and B10 answers.
import { PLANT_COSTS_ERRORS } from '../workbooks/voltline-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const costs = ses => sheetOf(ses, 'Costs');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();
const automatic = c => c.fontColor == null || c.fontColor === 'black';

const TOTAL_ROWS = [5, 6, 7, 8];   // Mueller, Riverside, South Lamar, Airport — the four planted totals (Domain's E4 is sound)
/** E<r> is the block's one formula, lease + maintenance + network, and reads a number. */
const totalFormula = (sh, r) => normFormula(sh.formula('E' + r)) === `=B${r}+C${r}+D${r}` && isNum(sh.value('E' + r));
/** E<r> holds a live formula that reads the row's three costs as a number, whatever its shape. */
const totalReads = (sh, r) => { const c = sh.cellAt('E' + r); const sum = (sh.value('B' + r) || 0) + (sh.value('C' + r) || 0) + (sh.value('D' + r) || 0); return !!c.formula && near(c.value, sum); };
const allTotals = sh => TOTAL_ROWS.every(r => totalReads(sh, r));
/** The fixed totals carry the block's format again: automatic color, bold, thousands separators with no decimals. */
const totalsStyled = sh => TOTAL_ROWS.every(r => { const c = sh.cellAt('E' + r); return automatic(c) && c.bold === true && c.fmtStyle === 'comma' && (c.decimals || 0) === 0; });
const costPerKwh = sh => normFormula(sh.formula('B10')) === '=E9/B11' && isNum(sh.value('B10'));
const traced = ses => windowKeys(ses).includes('Ctrl+[');

export default {
  id: 'read-the-error-follow-the-trail',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'voltline-weekly',
  state: { before: 'S6e', after: 'S6f' },
  plant: PLANT_COSTS_ERRORS,
  title: 'Read the error, follow the trail',
  difficulty: 'hard',
  tags: ['formulas', 'errors', 'audit', 'costs'],
  access: 'free',
  minutes: 6,
  headline: 'Ctrl+[',
  conventions: ['F5', 'F3', 'B1'],
  teaches: ['formula-errors'],
  uses: ['edit-mode-f2', 'edit-caret', 'backspace', 'pointing', 'ctrl-enter-fill', 'fill-down-right', 'copy-cut-paste', 'paste-special', 'cross-sheet-ref', 'input-colour-convention', 'sheet-tabs', 'ctrl-arrow', 'shift-arrow', 'home-key', 'arrow-keys', 'type-to-enter'],
  prerequisites: ['one-formula-per-row-filled-right'],
  brief: 'Costs came back from a colleague with its Total column showing error codes instead of figures, and the cost per kWh line broken with them. Each code is a message about what broke: read it, follow the trail to the cell the formula reads, and fix the input or the formula, never paste a number over it. The key is `Ctrl+[`.',
  goals: [
    { id: 'ref-fix', teach: 'Each error code is a message: #REF! a deleted reference, #NAME? a name Excel does not know, #VALUE! text where a number belongs, #N/A a lookup that found nothing.', text: 'On Costs, Mueller’s total E5 says #REF!, a reference that was deleted: replace the dead tail with a pointer to D5 so it reads =B5+C5+D5.', keys: 'Ctrl+PgDn ×3 Ctrl+↓ Ctrl+→ ↓ ×2 F2 ⌫ ×5 F2 ← ↵', requires: ['formula-errors', 'edit-mode-f2', 'backspace', 'pointing', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'], convention: 'F5',
      check: (s, ses) => { const sh = costs(ses); return !!sh && totalFormula(sh, 5) && settled(ses); } },
    { id: 'name-fix', text: 'E6 says #NAME?: SUMM is not a function Excel knows, so edit the name in place to SUM and the total reads 2,580 again.', keys: 'F2 Home → ×3 Delete ↵', requires: ['formula-errors', 'edit-mode-f2', 'edit-caret'],
      check: (s, ses) => { const sh = costs(ses); return !!sh && totalFormula(sh, 5) && totalReads(sh, 6) && settled(ses); } },
    { id: 'value-trail', text: 'E7 says #VALUE!: Ctrl+[ lands on B7, and along that row D7 says tbc where the flat 260 network fee belongs: fill it down from D6.', keys: 'Ctrl+[ → ×2 ↑ Shift+↓ Ctrl+D', requires: ['formula-errors', 'fill-down-right', 'shift-arrow', 'arrow-keys'], convention: 'F3',
      check: (s, ses) => { const sh = costs(ses); return !!sh && sh.value('D7') === 260 && totalReads(sh, 7) && traced(ses) && settled(ses); } },
    { id: 'na-refill', text: 'Airport’s E8 says #N/A and holds nothing worth keeping: select E5:E8, press F2 on E5, and Ctrl+Enter writes its formula into all four rows.', keys: '→ ↑ Shift+↓ ×3 F2 Ctrl+↵', requires: ['formula-errors', 'ctrl-enter-fill', 'edit-mode-f2', 'shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = costs(ses); return !!sh && allTotals(sh) && sh.value('D7') === 260 && settled(ses); } },
    { id: 'div0-trail', text: 'B10 now says #DIV/0!, a division by nothing: Ctrl+[ jumps to E9, Ctrl+] back, and it divides by the empty B12, so edit it to =E9/B11.', keys: 'Ctrl+↓ ↓ Home → Ctrl+[ Ctrl+] F2 ⌫ ×2 "11" ↵', requires: ['formula-errors', 'edit-mode-f2', 'backspace', 'type-to-enter', 'ctrl-arrow', 'home-key', 'arrow-keys'],
      check: (s, ses) => { const sh = costs(ses); const w = windowKeys(ses); return !!sh && costPerKwh(sh) && allTotals(sh) && w.includes('Ctrl+[') && w.includes('Ctrl+]') && settled(ses); } },
    { id: 'cross-trail', text: 'B11 is a link to the Report: press Ctrl+[ on it and the trail crosses sheets to Report’s C11, the kWh the cost is spread over.', keys: 'Ctrl+[', requires: ['cross-sheet-ref', 'sheet-tabs'],
      check: (s, ses) => { const sh = costs(ses); return !!sh && ses.sheets[ses.sheetIndex].name === 'Report' && s.selectionText() === 'C11' && costPerKwh(sh) && traced(ses) && settled(ses); } },
    { id: 'formats-back', text: 'Back on Costs, E5:E8 are formulas, not inputs, and must read black like E4: copy E4 and paste its format only onto them with Paste Formats.', keys: 'Ctrl+G "Costs!E4" ↵ Ctrl+C ↓ Shift+↓ ×3 Ctrl+Alt+V T ↵', requires: ['input-colour-convention', 'copy-cut-paste', 'paste-special', 'go-to', 'sheet-reference', 'shift-arrow', 'arrow-keys'], convention: 'B1',
      check: (s, ses) => { const sh = costs(ses); return !!sh && totalsStyled(sh) && allTotals(sh) && costPerKwh(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Costs!B4" Enter "2500" Enter Ctrl+G "Costs!B10" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Domain’s lease in B4 change to 2,500 and the cost per kWh in B10 answer through the Total.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'E5:E8 hold live formulas over lease + maintenance + network and read numbers', check: (s, ses) => { const sh = costs(ses); return !!sh && allTotals(sh); } },
    { text: 'D7 holds 260, a number, where the word tbc was', check: (s, ses) => { const sh = costs(ses); return !!sh && sh.value('D7') === 260; } },
    { text: 'B10 divides the Total by the kWh link in B11 and reads a number', check: (s, ses) => { const sh = costs(ses); return !!sh && costPerKwh(sh); } },
    { text: 'The fixed totals read black, bold, with thousands separators', check: (s, ses) => { const sh = costs(ses); return !!sh && totalsStyled(sh); } },
  ],
  closing: [
    'Five error codes, five messages read and answered at the source: a deleted reference, a misspelled name, a word where a figure belongs, a lookup that found nothing, a division by an empty cell (F5), and Ctrl+[ followed the trail to the cell a formula reads, across sheets too (F3).',
    'Not one number was pasted over a formula: the totals are live, black like every formula (B1), and Domain’s lease still moves the cost per kWh.',
  ],
  solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+Down Ctrl+Right Down Down F2 Backspace Backspace Backspace Backspace Backspace F2 Left Enter F2 Home Right Right Right Delete Enter Ctrl+[ Right Right Up Shift+Down Ctrl+D Right Up Shift+Down Shift+Down Shift+Down F2 Ctrl+Enter Ctrl+Down Down Home Right Ctrl+[ Ctrl+] F2 Backspace Backspace "11" Enter Ctrl+[ Ctrl+G "Costs!E4" Enter Ctrl+C Down Shift+Down Shift+Down Shift+Down Ctrl+Alt+V T Enter',
};
