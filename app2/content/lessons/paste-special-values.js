// Chapter 1 · 1.3.4 — Paste Special: values, formats, transpose (voltline-weekly, S3c → S3d)
// The Report skeleton gets its figures: this week's site totals and last week's revenue come off
// the Raw feed's totals block as VALUES (a snapshot, on purpose), the four new headers take the
// header style from one bold cell with Paste Formats, the total row is pasted plain so its SUM
// re-points to the Report's own rows, and the site list is turned on its side with Transpose.
// The closer perturbs the feed: the live total on Raw moves, the snapshot on the Report does not.
import { SITES } from '../workbooks/voltline-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
/** Paste Special was opened this goal: the chord Ctrl+Alt+V, or the ribbon walk Alt H V S (the same command; typed text logs single characters, never 'Alt'). */
const pasteSpecialUsed = ses => { const w = windowKeys(ses); return w.includes('Ctrl+Alt+V') || w.some((k, i) => k === 'Alt' && w[i + 1] === 'H' && w[i + 2] === 'V' && w[i + 3] === 'S'); };
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const raw = ses => sheetOf(ses, 'Raw');
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();

const ROWS = [0, 1, 2, 3, 4];   // the five site rows: Report 5..9 mirror Raw's totals block 8..12
/** Report rows 5..9 in `repCols` hold Raw rows 8..12 of `rawCols` as typed numbers — the same value, no formula. */
const mirrorsRaw = (rep, rw, repCols, rawCols) => ROWS.every(i => repCols.every((col, j) => {
  const c = rep.cellAt(col + (5 + i)); const v = rw.value(rawCols[j] + (8 + i));
  return !c.formula && isNum(v) && c.value === v;
}));
const bothSheets = (ses, fn) => { const rep = report(ses), rw = raw(ses); return !!rep && !!rw && fn(rep, rw); };
const HEADERS = { F4: 'Gross profit ($)', G4: 'Avg price ($/kWh)', H4: 'Prior week rev ($)', I4: 'Old code' };
const headersRead = rep => Object.keys(HEADERS).every(ref => rep.value(ref) === HEADERS[ref]);
const headersBold = rep => Object.keys(HEADERS).every(ref => rep.cellAt(ref).bold === true);
/** C10:E10 are live SUMs over the five site rows, and each reads the column's sum. */
const totalRowLive = rep => ['C', 'D', 'E'].every(col => {
  const c = rep.cellAt(col + '10');
  if (normFormula(c.formula) !== `=SUM(${col}5:${col}9)`) return false;
  let sum = 0; for (let r = 5; r <= 9; r++) { const v = rep.value(col + r); if (!isNum(v)) return false; sum += v; }
  return near(rep.value(col + '10'), sum);
});

export default {
  id: 'paste-special-values',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'voltline-weekly',
  state: { before: 'S3c', after: 'S3d' },
  title: 'Paste Special: values, formats, transpose',
  difficulty: 'medium',
  tags: ['clipboard', 'paste-special', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Ctrl+Alt+V',
  conventions: ['E4'],
  teaches: ['paste-special', 'relative-absolute'],
  uses: ['copy-cut-paste', 'paste-enter-drop', 'tab-commits', 'enter-tab-direction', 'ctrl-shift-arrow', 'shift-arrow', 'sheet-tabs', 'type-to-enter', 'ctrl-arrow', 'go-to', 'sheet-reference', 'home-key', 'ctrl-home-end'],
  prerequisites: ['copy-cut-paste-fill'],
  brief: 'The Report needs this week’s site totals and last week’s revenue beside them — as numbers that stay put once the page is sent, not links that move with the feed. Paste Special brings one aspect of what you copied: values only, formats only, or a block turned on its side, so the snapshot is taken on purpose. The key is `Ctrl+Alt+V`.',
  goals: [
    { id: 'kpi-headers', text: 'Two more figure columns are coming: type Gross profit ($) in F4 and Avg price ($/kWh) in G4 as one Tab run.', keys: '↓ ×3 Ctrl+→ → "Gross profit ($)" Tab "Avg price ($/kWh)" ↵', requires: ['type-to-enter', 'tab-commits', 'enter-tab-direction', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.value('F4') === HEADERS.F4 && rep.value('G4') === HEADERS.G4 && !ses.editing; } },
    { id: 'prior-week-values', teach: 'Paste Special, Ctrl+Alt+V, pastes one aspect of the copy — V values only, T formats only, E transposed — then Enter confirms.', text: 'The associate wants last week beside this week: copy Raw’s Prior week rev and Old code block L7:M12 and paste values only onto H4.', keys: 'Ctrl+G "Raw!M12" ↵ Ctrl+Shift+↑ Shift+← Ctrl+C Ctrl+PgUp ↑ → ×2 Ctrl+Alt+V V ↵', requires: ['paste-special', 'copy-cut-paste', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'shift-arrow', 'sheet-tabs'], convention: 'E4',
      check: (s, ses) => bothSheets(ses, (rep, rw) => rep.value('H4') === HEADERS.H4 && rep.value('I4') === HEADERS.I4
        && mirrorsRaw(rep, rw, ['H'], ['L']) && ROWS.every(i => rep.value('I' + (5 + i)) === rw.value('M' + (8 + i)) && !rep.cellAt('I' + (5 + i)).formula)) },
    { id: 'header-style', text: 'Four new headers, one style: copy the kWh sold header C4 and paste its format only onto F4:I4 with Paste Formats.', keys: 'Ctrl+← → ×2 Ctrl+C → ×3 Shift+→ ×3 Ctrl+Alt+V T ↵', requires: ['paste-special', 'copy-cut-paste', 'ctrl-arrow', 'shift-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && headersRead(rep) && headersBold(rep) && pasteSpecialUsed(ses); } },
    { id: 'this-week-values', text: 'Snapshot this week: copy the five sites’ live totals Raw!I8:K12 and paste values only onto C5, so the page holds numbers, not links.', keys: 'Ctrl+G "Raw!I8" ↵ Ctrl+Shift+↓ Shift+↑ Shift+→ ×2 Ctrl+C Ctrl+PgUp Home ↓ → ×2 Ctrl+Alt+V V ↵', requires: ['paste-special', 'copy-cut-paste', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'shift-arrow', 'sheet-tabs', 'home-key'], convention: 'E4',
      check: (s, ses) => bothSheets(ses, (rep, rw) => mirrorsRaw(rep, rw, ['C', 'D', 'E'], ['I', 'J', 'K'])) },
    { id: 'total-row', teach: 'A pasted formula keeps its shape, not its cells: the references shift with the move, so =SUM(I8:I12) becomes =SUM(C5:C9) — a $ would pin them.', text: 'Type Total in A10, then copy Raw’s total row I13:K13 and paste it plain onto C10: the SUM re-points to C5:C9.', keys: 'Ctrl+↓ Ctrl+← ↓ "Total" ↵ Ctrl+G "Raw!I13" ↵ Shift+→ ×2 Ctrl+C Ctrl+PgUp ↑ → ×2 ↵', requires: ['relative-absolute', 'copy-cut-paste', 'paste-enter-drop', 'type-to-enter', 'go-to', 'sheet-reference', 'shift-arrow', 'sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.value('A10') === 'Total' && totalRowLive(rep) && !ses.editing; } },
    { id: 'sensitivity-labels', text: 'Start the sensitivity block (how energy cost moves with price) under the daily table: Energy cost sensitivity ($/wk) in A22 and Price per kWh in A23.', keys: 'Ctrl+← Ctrl+↓ ×2 ↓ ×2 "Energy cost sensitivity ($/wk)" ↵ "Price per kWh" ↵', requires: ['type-to-enter', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.value('A22') === 'Energy cost sensitivity ($/wk)' && rep.value('A23') === 'Price per kWh' && !ses.editing; } },
    { id: 'transpose-sites', text: 'The sensitivity table needs the sites across its top: copy A5:A9 and paste them transposed onto B23, one row of five.', keys: 'Ctrl+Home Ctrl+↓ ×2 ↓ Ctrl+Shift+↓ Shift+↑ Ctrl+C Ctrl+End Home → Ctrl+Alt+V E ↵', requires: ['paste-special', 'copy-cut-paste', 'ctrl-home-end', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'home-key'],
      check: (s, ses) => { const rep = report(ses); return !!rep && SITES.every((site, i) => rep.value(String.fromCharCode(66 + i) + '23') === site) && pasteSpecialUsed(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C8" Enter "3000" Enter Ctrl+G "Raw!I8" Enter Ctrl+G "Report!C5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Domain’s Monday kWh in Raw’s C8 change: the live total I8 moves, and the Report’s snapshot C5 stays put.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C5:E9 and H5:H9 hold typed numbers, not formulas', check: (s, ses) => bothSheets(ses, (rep, rw) => mirrorsRaw(rep, rw, ['C', 'D', 'E', 'H'], ['I', 'J', 'K', 'L'])) },
    { text: 'F4:I4 read as bold headers', check: (s, ses) => { const rep = report(ses); return !!rep && headersRead(rep) && headersBold(rep); } },
    { text: 'C10:E10 are live SUMs over C5:C9', check: (s, ses) => { const rep = report(ses); return !!rep && totalRowLive(rep); } },
  ],
  closing: [
    'The Report now carries this week’s and last week’s site figures as a snapshot: the feed can move, the page will not — Paste Special on purpose (E4).',
    'The total row went in plain, and its SUM followed the paste to C5:C9; the site list stands across the sensitivity table without a name retyped.',
  ],
  solution: 'Down Down Down Ctrl+Right Right "Gross profit ($)" Tab "Avg price ($/kWh)" Enter Ctrl+G "Raw!M12" Enter Ctrl+Shift+Up Shift+Left Ctrl+C Ctrl+PgUp Up Right Right Ctrl+Alt+V V Enter Ctrl+Left Right Right Ctrl+C Right Right Right Shift+Right Shift+Right Shift+Right Ctrl+Alt+V T Enter Ctrl+G "Raw!I8" Enter Ctrl+Shift+Down Shift+Up Shift+Right Shift+Right Ctrl+C Ctrl+PgUp Home Down Right Right Ctrl+Alt+V V Enter Ctrl+Down Ctrl+Left Down "Total" Enter Ctrl+G "Raw!I13" Enter Shift+Right Shift+Right Ctrl+C Ctrl+PgUp Up Right Right Enter Ctrl+Left Ctrl+Down Ctrl+Down Down Down "Energy cost sensitivity ($/wk)" Enter "Price per kWh" Enter Ctrl+Home Ctrl+Down Ctrl+Down Down Ctrl+Shift+Down Shift+Up Ctrl+C Ctrl+End Home Right Ctrl+Alt+V E Enter',
};
