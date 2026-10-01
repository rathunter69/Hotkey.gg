// Chapter 1 · 1.3.4 — Paste Special: values, formats, math (clearcoat-weekly, S3c → S3d)
// The Report skeleton gets its figures: last week's revenue and the old codes come off the feed's
// totals block as VALUES, the prior-week block is flipped (× −1) and scaled (÷ 100) where it sits
// with Paste Special's arithmetic, the four new headers take the header style from one bold cell
// with Paste Formats, this week's totals are snapshotted as values, the total row is pasted plain so
// its SUM re-points to the Report's own rows, and the site list is turned on its side with Transpose.
// The closer perturbs the feed: the live total on Raw moves, the snapshot on the Report does not.
import { SITES, OLD_CODES, SPARE } from '../workbooks/clearcoat-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
/** Paste Special was opened this goal: the chord Ctrl+Alt+V, or the ribbon walk Alt H V S (the same command; typed text logs single characters, never 'Alt'). */
const pasteSpecialUsed = ses => { const w = windowKeys(ses); return w.includes('Ctrl+Alt+V') || w.some((k, i) => k === 'Alt' && w[i + 1] === 'H' && w[i + 2] === 'V' && w[i + 3] === 'S'); };
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const raw = ses => sheetOf(ses, 'Raw');
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();
const blank = c => c.value == null && c.formula == null;

const ROWS = [0, 1, 2, 3, 4];   // the five site rows: Report 5..9 mirror Raw's totals block 8..12
/** Report rows 5..9 in `repCols` hold Raw rows 8..12 of `rawCols`, each through `fn`, as typed numbers: the same value, no formula. */
const mirrorsRaw = (rep, rw, repCols, rawCols, fn = v => v) => ROWS.every(i => repCols.every((col, j) => {
  const c = rep.cellAt(col + (5 + i)); const v = rw.value(rawCols[j] + (8 + i));
  return !c.formula && isNum(v) && near(c.value, fn(v));
}));
const codesOn = rep => ROWS.every(i => rep.value('I' + (5 + i)) === OLD_CODES[SITES[i]] && !rep.cellAt('I' + (5 + i)).formula);
const bothSheets = (ses, fn) => { const rep = report(ses), rw = raw(ses); return !!rep && !!rw && fn(rep, rw); };
const HEADERS = { F4: 'Gross profit ($)', G4: 'Avg ticket ($/wash)', H4: 'Prior week rev ($)', I4: 'Old code' };
const headersRead = rep => Object.keys(HEADERS).every(ref => rep.value(ref) === HEADERS[ref]);
const headersBold = rep => Object.keys(HEADERS).every(ref => rep.cellAt(ref).bold === true);
/** C10:E10 are live SUMs over the five site rows, and each reads the column's sum. */
const totalRowLive = rep => ['C', 'D', 'E'].every(col => {
  const c = rep.cellAt(col + '10');
  if (normFormula(c.formula) !== `=SUM(${col}5:${col}9)`) return false;
  let sum = 0; for (let r = 5; r <= 9; r++) { const v = rep.value(col + r); if (!isNum(v)) return false; sum += v; }
  return near(rep.value(col + '10'), sum);
});
const SENS = { A22: 'Wash cost sensitivity ($/wk)', A23: 'Cost per wash' };
const sitesAcross = rep => SITES.every((site, i) => rep.value(String.fromCharCode(66 + i) + '23') === site);

export default {
  id: 'paste-special-values',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'clearcoat-weekly',
  state: { before: 'S3c', after: 'S3d' },
  title: 'Paste Special: values, formats, math',
  difficulty: 'medium',
  tags: ['clipboard', 'paste-special', 'report'],
  access: 'free',
  minutes: 8,
  headline: 'Ctrl+Alt+V',
  conventions: ['E4'],
  teaches: ['paste-special', 'paste-special-operation', 'relative-absolute'],
  uses: ['copy-cut-paste', 'paste-enter-drop', 'tab-commits', 'ctrl-shift-arrow', 'shift-arrow', 'sheet-tabs', 'type-to-enter', 'ctrl-arrow', 'go-to', 'sheet-reference', 'home-key', 'ctrl-home-end', 'delete-clears', 'arrow-keys'],
  prerequisites: ['copy-cut-paste-fill'],
  brief: 'The Report needs this week’s site totals and last week’s revenue beside them, as numbers that stay put once the page is sent, not links that move with the feed. Paste Special brings one part of what you copied (values only, formats only, a block turned on its side) or does arithmetic on the cells you paste over: copy a −1 and Multiply flips a block’s sign; copy 1000 and Divide turns dollars into thousands. Every desk lives in this dialog. Ctrl+Alt+V opens it, and Alt, E, S, V is the old route people still say out loud. The key is `Ctrl+Alt+V`.',
  goals: [
    { id: 'kpi-headers', text: 'Two more figure columns are coming: type Gross profit ($) in F4 and Avg ticket ($/wash) in G4 as one Tab run.', keys: '↓ ×3 Ctrl+→ → "Gross profit ($)" Tab "Avg ticket ($/wash)" ↵', requires: ['type-to-enter', 'tab-commits', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.value('F4') === HEADERS.F4 && rep.value('G4') === HEADERS.G4 && !ses.editing; } },
    { id: 'prior-week-values', teach: 'Paste Special, Ctrl+Alt+V, pastes one part of the copy (V values only, T formats only, F formulas only, E transposed), then Enter confirms. Formats only dresses the cells and leaves what they say alone; values only is how you take a snapshot: the numbers, not the formulas behind them.', text: 'The CFO wants last week beside this week: copy Raw’s Prior week rev and Old code block L7:M12 and paste values only onto H4.', keys: 'Ctrl+G "Raw!L7" ↵ Ctrl+Shift+↓ Shift+↑ Shift+→ Ctrl+C Ctrl+PgUp ↑ → ×2 Ctrl+Alt+V V ↵', requires: ['paste-special', 'copy-cut-paste', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'shift-arrow', 'sheet-tabs'], convention: 'E4',
      check: (s, ses) => bothSheets(ses, (rep, rw) => rep.value('H4') === HEADERS.H4 && rep.value('I4') === HEADERS.I4 && mirrorsRaw(rep, rw, ['H'], ['L']) && codesOn(rep) && blank(rep.cellAt('H10'))) },
    { id: 'flip-sign', teach: 'Paste Special can do arithmetic on the cells you paste over: Add, Subtract, Multiply, Divide (M for Multiply, I for Divide) with the number you copied, so × −1 flips a block’s sign and ÷ 100 turns cents into dollars, no formula, nothing retyped. It rewrites formulas too, so select typed cells only (Go To Special, Constants) on a mixed block.', text: `The prior-week revenue came out of the export as negatives: copy a −1 from spare cell ${SPARE}, select H5:H9, Paste Special, Multiply.`, keys: '→ ×3 "-1" ↵ Ctrl+C Ctrl+← ← ↓ Shift+↓ ×4 Ctrl+Alt+V M ↵', requires: ['paste-special-operation', 'paste-special', 'copy-cut-paste', 'type-to-enter', 'ctrl-arrow', 'shift-arrow'],
      check: (s, ses) => bothSheets(ses, (rep, rw) => mirrorsRaw(rep, rw, ['H'], ['L'], v => -v)) && pasteSpecialUsed(ses) },
    { id: 'scale-units', text: `Same block, and the figures are in cents: copy 100 from the spare cell, select H5:H9, Paste Special Divide, then clear ${SPARE}.`, keys: '↑ Ctrl+→ → ×2 "100" ↵ Ctrl+C Ctrl+← ← ↓ Shift+↓ ×4 Ctrl+Alt+V I ↵ then ↑ Ctrl+→ → ×2 Delete', requires: ['paste-special-operation', 'paste-special', 'copy-cut-paste', 'type-to-enter', 'ctrl-arrow', 'shift-arrow', 'delete-clears'],
      check: (s, ses) => bothSheets(ses, (rep, rw) => mirrorsRaw(rep, rw, ['H'], ['L'], v => -v / 100) && blank(rep.cellAt(SPARE))) && pasteSpecialUsed(ses) },
    { id: 'header-style', text: 'Four new headers, one style: copy the Washes header C4 and paste its format only onto F4:I4 with Paste Formats.', keys: 'Ctrl+← ×2 → ×2 Ctrl+C → ×3 Shift+→ ×3 Ctrl+Alt+V T ↵', requires: ['paste-special', 'copy-cut-paste', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && headersRead(rep) && headersBold(rep) && pasteSpecialUsed(ses); } },
    { id: 'this-week-values', text: 'Snapshot this week: copy the five sites’ live totals Raw!I8:K12 and paste values only onto C5, so the page holds numbers, not links.', keys: 'Ctrl+G "Raw!I8" ↵ Ctrl+Shift+↓ Shift+↑ Shift+→ ×2 Ctrl+C Ctrl+PgUp Home ↓ → ×2 Ctrl+Alt+V V ↵', requires: ['paste-special', 'copy-cut-paste', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'shift-arrow', 'sheet-tabs', 'home-key'], convention: 'E4',
      check: (s, ses) => bothSheets(ses, (rep, rw) => mirrorsRaw(rep, rw, ['C', 'D', 'E'], ['I', 'J', 'K'])) },
    { id: 'total-row', teach: 'A pasted formula keeps its shape, not its cells: the references shift with the move, so =SUM(I8:I12) becomes =SUM(C5:C9). That is relative referencing, and a $ in front of a row or column would pin it (module 1.6).', text: 'Type Total in A10, then copy Raw’s total row I13:K13 and paste it plain onto C10: the SUM re-points to C5:C9.', keys: 'Ctrl+↓ Ctrl+← ↓ "Total" ↵ Ctrl+G "Raw!I13" ↵ Shift+→ ×2 Ctrl+C Ctrl+PgUp → ×2 ↵', requires: ['relative-absolute', 'copy-cut-paste', 'paste-enter-drop', 'type-to-enter', 'go-to', 'sheet-reference', 'shift-arrow', 'sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.value('A10') === 'Total' && totalRowLive(rep) && !ses.editing; } },
    { id: 'sensitivity', text: `Start the sensitivity block: ${SENS.A22} in A22, ${SENS.A23} in A23, then copy A5:A9 and paste them transposed onto B23.`, keys: `Ctrl+← Ctrl+↓ ×2 ↓ ×2 "${SENS.A22}" ↵ ↓ "${SENS.A23}" ↵ Ctrl+Home Ctrl+↓ ×2 ↓ Shift+↓ ×4 Ctrl+C Ctrl+End Home → Ctrl+Alt+V E ↵`, requires: ['paste-special', 'copy-cut-paste', 'type-to-enter', 'ctrl-home-end', 'ctrl-arrow', 'shift-arrow', 'home-key'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.value('A22') === SENS.A22 && rep.value('A23') === SENS.A23 && sitesAcross(rep) && pasteSpecialUsed(ses) && !ses.editing; } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C8" Enter "300" Enter Ctrl+G "Raw!I8" Enter Ctrl+G "Report!C5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Change Domain’s Monday washes in Raw’s C8: the live total I8 moves, and the Report’s snapshot C5 stays put.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C5:E9 hold this week’s totals and H5:H9 last week’s revenue, as typed numbers', check: (s, ses) => bothSheets(ses, (rep, rw) => mirrorsRaw(rep, rw, ['C', 'D', 'E'], ['I', 'J', 'K']) && mirrorsRaw(rep, rw, ['H'], ['L'], v => -v / 100)) },
    { text: 'F4:I4 read as bold headers', check: (s, ses) => { const rep = report(ses); return !!rep && headersRead(rep) && headersBold(rep); } },
    { text: 'C10:E10 are live SUMs over C5:C9', check: (s, ses) => { const rep = report(ses); return !!rep && totalRowLive(rep); } },
    { text: 'The sites stand across B23:F23 and the spare cell is clear', check: (s, ses) => { const rep = report(ses); return !!rep && sitesAcross(rep) && blank(rep.cellAt(SPARE)); } },
  ],
  closing: [
    'Paste values for a snapshot, paste formats to dress a row, transpose to turn a list on its side, and Multiply or Divide to fix a block’s sign or units where it sits. None of it needs a formula or a retyped figure.',
    'The total row went in plain and its SUM followed the paste to C5:C9; the site list stands across the sensitivity table without a name retyped.',
  ],
  solution: `Down Down Down Ctrl+Right Right "Gross profit ($)" Tab "Avg ticket ($/wash)" Enter Ctrl+G "Raw!L7" Enter Ctrl+Shift+Down Shift+Up Shift+Right Ctrl+C Ctrl+PgUp Up Right Right Ctrl+Alt+V V Enter Right Right Right "-1" Enter Ctrl+C Ctrl+Left Left Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+Alt+V M Enter Up Ctrl+Right Right Right "100" Enter Ctrl+C Ctrl+Left Left Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+Alt+V I Enter Up Ctrl+Right Right Right Delete Ctrl+Left Ctrl+Left Right Right Ctrl+C Right Right Right Shift+Right Shift+Right Shift+Right Ctrl+Alt+V T Enter Ctrl+G "Raw!I8" Enter Ctrl+Shift+Down Shift+Up Shift+Right Shift+Right Ctrl+C Ctrl+PgUp Home Down Right Right Ctrl+Alt+V V Enter Ctrl+Down Ctrl+Left Down "Total" Enter Ctrl+G "Raw!I13" Enter Shift+Right Shift+Right Ctrl+C Ctrl+PgUp Right Right Enter Ctrl+Left Ctrl+Down Ctrl+Down Down Down "${SENS.A22}" Enter Down "${SENS.A23}" Enter Ctrl+Home Ctrl+Down Ctrl+Down Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+C Ctrl+End Home Right Ctrl+Alt+V E Enter`,
};
