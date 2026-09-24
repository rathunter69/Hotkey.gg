// Chapter 1 · 1.6.2 — SUM family and AutoSum (voltline-weekly, S6a → S6b)
// The total row is missing its Gross profit SUM: select the whole figure block and press Alt+= once,
// and every column's SUM lands in row 11 together. Then the total row's Avg price and Margin % go
// in by pointing, and a Week summary block under the report takes AVERAGE, MAX, MIN, COUNT and
// COUNTA over the six sites (the exact lines are SUMMARY_LINES in the workbook). The closer clears
// one site's kWh: the average and COUNT answer, COUNTA does not — a blank is not a zero.
import { SUMMARY_LINES, REPORT } from '../workbooks/voltline-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const report = ses => { const e = ses.sheets.find(x => x.name === 'Report'); return e ? e.sheet : null; };
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();
/** A workspace click the views recorded this run (ribbon-commands recordMouse: { t, what }); the session, and its mouse log, is fresh per run. */
const clicked = (ses, what) => !!ses.mouse && ses.mouse.log.some(e => e.what === what);
/** AutoSum ran this goal: the chord Alt+= (logged 'Alt' then '='), the KeyTips walk Alt H U S / Alt M U S, or a click on Home › AutoSum / Formulas › AutoSum (recorded 'ribbon:HUS' / 'ribbon:MUS'; this is the first goal, so the run's mouse log is its window). */
const autoSumUsed = ses => { const w = windowKeys(ses); return w.some((k, i) => k === 'Alt' && (w[i + 1] === '=' || (w[i + 1] === 'H' && w[i + 2] === 'U' && w[i + 3] === 'S') || (w[i + 1] === 'M' && w[i + 2] === 'U' && w[i + 3] === 'S'))) || clicked(ses, 'ribbon:HUS') || clicked(ses, 'ribbon:MUS'); };

const { siteRows, totalRow: T, summaryRow: S } = REPORT;   // rows 5–10, total row 11, summary head row 26
const SUM_COLS = ['C', 'D', 'E', 'F'];
/** C11:F11 are SUMs over the six site rows and each reads its column's sum. */
const totalsLive = rep => SUM_COLS.every(col => {
  if (normFormula(rep.formula(col + T)) !== `=SUM(${col}${siteRows[0]}:${col}${siteRows[siteRows.length - 1]})`) return false;
  let sum = 0; for (const r of siteRows) { const v = rep.value(col + r); if (!isNum(v)) return false; sum += v; }
  return near(rep.value(col + T), sum);
});
/** A ratio cell holds exactly the formula asked for and reads its value (the total row's average price or margin). */
const ratio = (rep, ref, num, den) => normFormula(rep.formula(ref)) === `=${num}/${den}` && near(rep.value(ref), rep.value(num) / rep.value(den));
const LABELS = SUMMARY_LINES.map(l => l[0]);
const summaryLabels = rep => rep.value('A' + S) === 'Week summary' && rep.cellAt('A' + S).bold === true
  && LABELS.every((label, i) => rep.value('A' + (S + 1 + i)) === label);
/** Summary line i (0-based) holds its formula and reads a number. */
const summaryLine = (rep, i) => normFormula(rep.formula('B' + (S + 1 + i))) === normFormula(SUMMARY_LINES[i][1]) && isNum(rep.value('B' + (S + 1 + i)));
const comma0 = c => c.fmtStyle === 'comma' && (c.decimals || 0) === 0;

export default {
  id: 'sum-family-and-autosum',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'voltline-weekly',
  state: { before: 'S6a', after: 'S6b' },
  title: 'SUM family and AutoSum',
  difficulty: 'medium',
  tags: ['formulas', 'autosum', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Alt+=',
  conventions: ['E5'],
  teaches: ['autosum', 'sum-family', 'counta'],
  uses: ['pointing', 'formula-basics', 'formula-operators', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'ctrl-home-end', 'type-to-enter', 'tab-commits', 'enter-tab-direction', 'bold-italic-underline', 'number-formats'],
  prerequisites: ['point-dont-type'],
  brief: 'The total row is missing its Gross profit SUM, the total’s average price and margin are still blank, and the associate wants a week summary under the report: the average, best and lowest site, and a count of the figures and of the site names. AutoSum over the whole block writes every column’s SUM in one press, and the SUM family covers the rest. The key is `Alt+=`.',
  goals: [
    { id: 'block-autosum', teach: 'AutoSum, Alt+=, on one empty cell proposes a SUM over the numbers above; over a whole block it writes every column’s SUM into the row below in one press.', text: 'Select the six sites’ figures C5:F10 and press Alt+= once: every column’s SUM lands in the total row, Gross profit’s F11 included.', keys: 'Ctrl+Home Ctrl+↓ ×2 ↓ → ×2 Ctrl+Shift+↓ Shift+↑ Shift+→ ×3 then Alt+=', requires: ['autosum', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'ctrl-home-end'], convention: 'E5',
      check: (s, ses) => { const rep = report(ses); return !!rep && totalsLive(rep) && autoSumUsed(ses) && !ses.editing; } },
    { id: 'total-avg-price', text: 'The total row needs its average price: G11 is total revenue over total kWh, D11 divided by C11, pointed the way the site rows were.', keys: 'Ctrl+↓ Ctrl+→ → "=" Ctrl+← ← ×2 "/" Ctrl+← ×2 Tab', requires: ['pointing', 'formula-basics', 'formula-operators', 'ctrl-arrow', 'tab-commits'],
      check: (s, ses) => { const rep = report(ses); return !!rep && ratio(rep, 'G' + T, 'D' + T, 'C' + T) && !ses.editing; } },
    { id: 'total-margin', text: 'The total row needs its margin: H11 is total gross profit over total revenue, F11 divided by D11, pointed the same way.', keys: '"=" Ctrl+← ← "/" Ctrl+← ×2 → ↵', requires: ['pointing', 'formula-basics', 'formula-operators', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && ratio(rep, 'H' + T, 'F' + T, 'D' + T) && !ses.editing; } },
    { id: 'summary-labels', text: `Start a Week summary block under the report: Week summary in A26, bold, then the five line labels A27:A31 as one Enter run.`, keys: `Ctrl+← Ctrl+↓ ×4 ↓ ×2 Ctrl+B "Week summary" ↵ ${LABELS.map(l => `"${l}" ↵`).join(' ')}`, requires: ['type-to-enter', 'bold-italic-underline', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && summaryLabels(rep) && !ses.editing; } },
    { id: 'avg-max-min', teach: 'SUM, AVERAGE, MAX, MIN and COUNT each take one range, =AVERAGE(C5:C10), and a blank inside the range is left out, not counted as zero.', text: 'Type the first three lines: B27 =AVERAGE(C5:C10) for the average site, B28 =MAX(C5:C10) for the best, B29 =MIN(C5:C10) for the lowest.', keys: `Ctrl+↑ ×2 ↓ → "${SUMMARY_LINES[0][1]}" ↵ "${SUMMARY_LINES[1][1]}" ↵ "${SUMMARY_LINES[2][1]}" ↵`, requires: ['sum-family', 'formula-basics', 'type-to-enter', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && [0, 1, 2].every(i => summaryLine(rep, i)) && !ses.editing; } },
    { id: 'summary-format', text: 'The three kWh lines B27:B29 read as figures: thousands separators and no decimals, the same comma format the report above uses.', keys: '↑ ×3 Ctrl+Shift+↓ Ctrl+Shift+1 then Alt H 9 Alt H 9', requires: ['number-formats', 'ctrl-shift-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && [0, 1, 2].every(i => summaryLine(rep, i) && comma0(rep.cellAt('B' + (S + 1 + i)))) && !ses.editing; } },
    { id: 'count-counta', teach: 'COUNT counts the numbers in a range and COUNTA counts every non-empty cell, text included, so COUNT checks the figures and COUNTA checks the names.', text: 'Count the figures and the names: B30 =COUNT(C5:C10) counts the kWh figures, B31 =COUNTA(A5:A10) counts the site names.', keys: `Ctrl+↓ ↓ "${SUMMARY_LINES[3][1]}" ↵ "${SUMMARY_LINES[4][1]}" ↵`, requires: ['counta', 'sum-family', 'type-to-enter', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && summaryLine(rep, 3) && summaryLine(rep, 4) && rep.value('B' + (S + 4)) === siteRows.length && rep.value('B' + (S + 5)) === siteRows.length && !ses.editing; } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C7" Enter Delete Ctrl+G "Report!B27" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Riverside’s kWh in C7 clear: the average in B27 and the count in B30 answer, and Sites listed in B31 does not.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C11:F11 are live SUMs over rows 5 to 10 and tie', check: (s, ses) => { const rep = report(ses); return !!rep && totalsLive(rep); } },
    { text: 'G11 reads =D11/C11 and H11 =F11/D11', check: (s, ses) => { const rep = report(ses); return !!rep && ratio(rep, 'G' + T, 'D' + T, 'C' + T) && ratio(rep, 'H' + T, 'F' + T, 'D' + T); } },
    { text: 'The Week summary A26:B31 holds its five lines, each a live formula', check: (s, ses) => { const rep = report(ses); return !!rep && summaryLabels(rep) && [0, 1, 2, 3, 4].every(i => summaryLine(rep, i)); } },
  ],
  closing: [
    'One press of Alt+= over the six sites’ figures wrote every column’s SUM into the row below at once, Gross profit included. That is E5: AutoSum the whole block in one press, never one column at a time; when the total row is still empty, take it into the selection and the SUMs land in it.',
    'The total row’s average price and margin came in by pointing, and the Week summary reads the six sites with AVERAGE, MAX, MIN, COUNT and COUNTA — clear one site’s kWh and the average and COUNT move while COUNTA does not, because a blank is not a zero.',
  ],
  solution: `Ctrl+Home Ctrl+Down Ctrl+Down Down Right Right Ctrl+Shift+Down Shift+Up Shift+Right Shift+Right Shift+Right Alt+= Ctrl+Down Ctrl+Right Right "=" Ctrl+Left Left Left "/" Ctrl+Left Ctrl+Left Tab "=" Ctrl+Left Left "/" Ctrl+Left Ctrl+Left Right Enter Ctrl+Left Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Down Ctrl+B "Week summary" Enter ${LABELS.map(l => `"${l}" Enter`).join(' ')} Ctrl+Up Ctrl+Up Down Right "${SUMMARY_LINES[0][1]}" Enter "${SUMMARY_LINES[1][1]}" Enter "${SUMMARY_LINES[2][1]}" Enter Up Up Up Ctrl+Shift+Down Ctrl+Shift+1 Alt H 9 Alt H 9 Ctrl+Down Down "${SUMMARY_LINES[3][1]}" Enter "${SUMMARY_LINES[4][1]}" Enter`,
};
