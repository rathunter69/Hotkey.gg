// Chapter 1 · 1.6.6 — Read the error, follow the trail (clearcoat-weekly, S6e → S6f, plant PLANT_COSTS_ERRORS)
// The Costs sheet came back from a manager with its Total column showing error codes instead of
// figures, and the new cost-per-wash line broken with them: #REF! (a deleted reference), #NAME? (a
// misspelled function), #VALUE! (the word "tbc" where a figure belongs), #N/A (a lookup that finds
// nothing) and, once the total is a number again, #DIV/0! (a division by an empty cell). Each code
// is read as the message it is; Ctrl+[ follows the trail to the cell a formula reads, on the same
// sheet, and across sheets from the link on B11, and Ctrl+] comes back; every fix is to the input
// or the formula, never a number pasted over it. The planted totals were colored blue; Format Cells'
// Font tab puts their color back to Automatic, black like every formula. The closer changes Domain's rent and B10 answers.
import { PLANT_COSTS_ERRORS } from '../workbooks/clearcoat-weekly.js';
import { cellFormatCode, isDeskNumberFormat } from '../../app/graders.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const costs = ses => sheetOf(ses, 'Costs');
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').replace(/^=\+/, '=').toUpperCase();
const automatic = c => c.fontColor == null || c.fontColor === 'black';

const TOTAL_ROWS = [5, 6, 7, 8];   // Mueller, Riverside, South Lamar, Airport: the four planted totals (Domain's E4 is sound)
/** E<r> is the block's one formula, rent + maintenance + card fees, and reads a number. */
const totalFormula = (sh, r) => normFormula(sh.formula('E' + r)) === `=B${r}+C${r}+D${r}` && isNum(sh.value('E' + r));
/** E<r> holds a live formula that reads the row's three costs as a number, whatever its shape. */
const totalReads = (sh, r) => { const c = sh.cellAt('E' + r); const sum = (sh.value('B' + r) || 0) + (sh.value('C' + r) || 0) + (sh.value('D' + r) || 0); return !!c.formula && near(c.value, sum); };
const allTotals = sh => TOTAL_ROWS.every(r => totalReads(sh, r));
/** The fixed totals read like E4 again: automatic color, bold, the desk number format. */
const totalsStyled = sh => TOTAL_ROWS.every(r => { const c = sh.cellAt('E' + r); return automatic(c) && c.bold === true && isDeskNumberFormat(cellFormatCode(c)); });
const costPerWash = sh => normFormula(sh.formula('B10')) === '=E9/B11' && isNum(sh.value('B10'));
const traced = ses => windowKeys(ses).includes('Ctrl+[');

export default {
  id: 'read-the-error-follow-the-trail',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'clearcoat-weekly',
  state: { before: 'S6e', after: 'S6f' },
  plant: PLANT_COSTS_ERRORS,
  title: 'Read the error, follow the trail',
  difficulty: 'hard',
  tags: ['formulas', 'errors', 'audit', 'costs'],
  access: 'free',
  minutes: 7,
  headline: 'Ctrl+[',
  conventions: ['F5', 'F3', 'B1'],
  teaches: ['formula-errors'],
  uses: ['edit-mode-f2', 'edit-caret', 'backspace', 'delete-clears', 'pointing', 'ctrl-enter-fill', 'fill-down-right', 'cross-sheet-ref', 'format-cells-dialog', 'format-cells-tabs', 'input-colour-convention', 'sheet-tabs', 'ctrl-arrow', 'shift-arrow', 'home-key', 'arrow-keys', 'type-to-enter'],
  prerequisites: ['one-formula-per-row-filled-right'],
  brief: 'Costs came back from a manager with its Total column showing error codes instead of figures, and the cost-per-wash line broken with them. Each code is a message about what broke: #REF! a deleted reference, #NAME? a name Excel doesn’t know, #VALUE! text where a number belongs, #N/A a lookup that found nothing, #DIV/0! a division by an empty cell, #NUM! a result Excel can’t hold. Read it, follow the trail to the cell the formula reads with Ctrl+[, and fix the input or the formula. Never paste a number over it. The key is `Ctrl+[`.',
  goals: [
    { id: 'ref-fix', teach: '#REF! means the formula pointed at a cell that no longer exists. F2, Backspace the #REF! out, F2 again to point (1.6.1), ← to D5, Enter. The other codes: #NAME? a name Excel doesn’t know, #VALUE! text where a number belongs, #N/A a lookup that found nothing, #DIV/0! a division by nothing, #NUM! a result Excel can’t hold or a rate it can’t find (3.5.3).',
      text: 'On Costs, Mueller’s total E5 says #REF!, a reference that was deleted: replace the dead tail with a pointer to D5 so it reads =B5+C5+D5.',
      hintStuck: 'pulse cell E5 on Costs · E5, F2, Backspace over #REF!, F2, ←, Enter.',
      keys: 'Ctrl+PgDn ×3 Ctrl+↓ Ctrl+→ ↓ ×2 F2 ⌫ ×5 F2 ← ↵', requires: ['formula-errors', 'edit-mode-f2', 'backspace', 'pointing', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'], convention: 'F5',
      check: (s, ses) => { const sh = costs(ses); return !!sh && totalFormula(sh, 5) && settled(ses); } },
    { id: 'name-fix', teach: 'F2 opens the cell, Home takes you to the front, → three times, Delete the extra M, Enter. A misspelled function name gives you #NAME? every time, so when that code appears read the formula itself rather than the code.',
      text: 'E6 says #NAME?: SUMM is not a function Excel knows, so edit the name in place to SUM and the total reads 2,580 again.',
      hintStuck: 'pulse cell E6 · E6, F2, Home, → → →, Delete, Enter.',
      keys: '↓ F2 Home → ×3 Delete ↵', requires: ['formula-errors', 'edit-mode-f2', 'edit-caret', 'delete-clears', 'arrow-keys'],
      check: (s, ses) => { const sh = costs(ses); return !!sh && totalFormula(sh, 5) && totalReads(sh, 6) && settled(ses); } },
    { id: 'value-trail', teach: 'Ctrl+[ selects the cells the formula reads, so follow the trail from the error back to its source. Text sitting in a figure column breaks every formula that adds it up, and selecting D6:D7 then Ctrl+D puts the number back in.',
      text: 'E7 says #VALUE!: Ctrl+[ lands on B7, and along that row D7 says tbc where the flat 260 card fee belongs: fill it down from D6.',
      hintStuck: 'pulse cell D7 · E7, Ctrl+[; → to D7; land on D6, Shift+↓, Ctrl+D.',
      keys: '↓ Ctrl+[ → ×2 ↑ Shift+↓ Ctrl+D', requires: ['formula-errors', 'fill-down-right', 'shift-arrow', 'arrow-keys'], convention: 'F3',
      check: (s, ses) => { const sh = costs(ses); return !!sh && sh.value('D7') === 260 && totalReads(sh, 7) && traced(ses) && settled(ses); } },
    { id: 'na-refill', teach: 'Fix the pattern, not the cell: one good formula filled into the block with Ctrl+Enter replaces the broken one everywhere at once. #N/A is a lookup that found nothing, which is Chapter 4’s error to learn, so here it only needs to go.',
      text: 'Airport’s E8 says #N/A and holds nothing worth keeping: select E5:E8, press F2 on E5, and Ctrl+Enter writes its formula into all four rows.',
      hintStuck: 'pulse cells E5:E8 · Select E5:E8, F2, Ctrl+Enter.',
      keys: '→ ↑ Shift+↓ ×3 F2 Ctrl+↵', requires: ['formula-errors', 'ctrl-enter-fill', 'edit-mode-f2', 'shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = costs(ses); return !!sh && allTotals(sh) && sh.value('D7') === 260 && settled(ses); } },
    { id: 'div0-trail', teach: 'Ctrl+[ goes to what a formula reads, Ctrl+] to what reads it. B10 divides the cluster’s total cost by the washes in B11. The formula pointed one row too far.',
      text: 'B10 now says #DIV/0!, a division by nothing: Ctrl+[ jumps to E9, Ctrl+] back, and it divides by the empty B12, so edit it to =E9/B11.',
      hintStuck: 'pulse cell B10 · B10, Ctrl+[, look, Ctrl+]; F2, End, Backspace, 1, Enter.',
      keys: 'Ctrl+↓ ↓ Home → Ctrl+[ Ctrl+] F2 ⌫ "1" ↵', requires: ['formula-errors', 'edit-mode-f2', 'backspace', 'type-to-enter', 'ctrl-arrow', 'home-key', 'arrow-keys'],
      check: (s, ses) => { const sh = costs(ses); const w = windowKeys(ses); return !!sh && costPerWash(sh) && allTotals(sh) && w.includes('Ctrl+[') && w.includes('Ctrl+]') && settled(ses); } },
    { id: 'cross-trail', teach: 'Ctrl+[ follows a link to another sheet as easily as a cell next door. The sheet key brings you back. That’s the audit trail, two keys.',
      text: 'B11 is a link to the Report: press Ctrl+[ on it and the trail crosses sheets to Report’s C11, the washes the cost is spread over.',
      hintStuck: 'pulse cell B11 · B11, Ctrl+[; then Ctrl+PgDn back to Costs.',
      keys: '↓ Ctrl+[', requires: ['cross-sheet-ref', 'sheet-tabs', 'arrow-keys'],
      check: (s, ses) => { const sh = costs(ses); return !!sh && onSheet(ses, 'Report') && s.selectionText() === 'C11' && costPerWash(sh) && traced(ses) && settled(ses); } },
    { id: 'black-again', teach: 'Someone colored the totals blue. A formula reads in automatic black, so open Format Cells on the block, F for the Font tab, Alt+C for Color, and step the list back to Automatic: the four totals read like E4 again. Automatic is not a color, it is the absence of one, so a reader knows the cell is calculated.',
      text: 'Back on Costs, E5:E8 are formulas, not inputs, and must read black like E4: in Ctrl+1 set their Font Color back to Automatic.',
      hintStuck: 'pulse cells E5:E8 · Ctrl+PgDn to Costs; select E5:E8; Ctrl+1, F, Alt+C, ← until Automatic, Enter.',
      keys: 'Ctrl+PgDn ×3 Ctrl+↑ ×2 Ctrl+→ Shift+↑ ×3 Ctrl+1 F Alt+C ← ×5 ↵', requires: ['input-colour-convention', 'format-cells-dialog', 'format-cells-tabs', 'sheet-tabs', 'ctrl-arrow', 'shift-arrow'], convention: 'B1',
      check: (s, ses) => { const sh = costs(ses); return !!sh && totalsStyled(sh) && allTotals(sh) && costPerWash(sh) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Costs!B4" Enter "2500" Enter Ctrl+G "Costs!B10" Enter Escape Escape Escape', cadence: 320 },
      teach: 'Five errors gone and the sheet is live end to end: rent to total to cost per wash.',
      text: 'Does it tie? Change Domain’s rent in B4 to 2,500 and watch the cost per wash in B10 answer through the Total.',
      hintStuck: 'pulse cell B10 · B4, 2500, Enter; B10 moves.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'E5:E8 hold live formulas over rent + maintenance + card fees and read numbers', check: (s, ses) => { const sh = costs(ses); return !!sh && allTotals(sh); } },
    { text: 'D7 holds 260, a number, where the word tbc was', check: (s, ses) => { const sh = costs(ses); return !!sh && sh.value('D7') === 260; } },
    { text: 'B10 divides the Total by the washes link in B11 and reads a number', check: (s, ses) => { const sh = costs(ses); return !!sh && costPerWash(sh); } },
    { text: 'The fixed totals read black, bold, in the desk number format', check: (s, ses) => { const sh = costs(ses); return !!sh && totalsStyled(sh); } },
  ],
  wow: 'Five error codes read and fixed at the source, and nothing pasted over.',
  closing: [
    'Each code was a message (a deleted reference, a misspelled name, a word where a figure belongs, a lookup that found nothing, a division by an empty cell), and Ctrl+[ followed the trail to the cell each formula reads, across sheets too.',
    'Not one number was pasted over a formula: the totals are live, black like every formula, and Domain’s rent still moves the cost per wash.',
  ],
  solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+Down Ctrl+Right Down Down F2 Backspace Backspace Backspace Backspace Backspace F2 Left Enter Down F2 Home Right Right Right Delete Enter Down Ctrl+[ Right Right Up Shift+Down Ctrl+D Right Up Shift+Down Shift+Down Shift+Down F2 Ctrl+Enter Ctrl+Down Down Home Right Ctrl+[ Ctrl+] F2 Backspace "1" Enter Down Ctrl+[ Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+Up Ctrl+Up Ctrl+Right Shift+Up Shift+Up Shift+Up Ctrl+1 F Alt+C Left Left Left Left Left Enter',
};
