// Chapter 2 · 2.5.3 Data bars and scales, and when not to (clearcoat-pnl, S5b → S5c)
// Data bars and color scales draw a chart inside the cells. Monthly's revenue line C10:N10 takes
// bars and its chemicals line C13:N13 a scale, and both come off again: Clear Rules from Selected
// Cells for the scale, Manage Rules for the bars (clearing C10:N10 would take the slow-month rule
// with them). One set of bars stays on the working sheet, Monthly detail's company revenue
// C66:N66. The closer raises one cluster's month and the bar answers.
import { DETAIL, slowMonthThreshold, EXPORT } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const monthly = ses => sheetOf(ses, 'Monthly');
const detail = ses => sheetOf(ses, 'Monthly detail');
const settled = ses => !ses.editing && !ses.dialog;
const cellsOf = range => { const [a, b] = range.split(':'); const c1 = a.charCodeAt(0) - 64, c2 = b.charCodeAt(0) - 64, r1 = +a.slice(1), r2 = +b.slice(1); const out = []; for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) out.push([r, c]); return out; };
const ruled = (sh, range, pred) => !!sh && cellsOf(range).every(([r, c]) => sh.condFmtRulesAt(r, c).some(pred));
const THRESHOLD = slowMonthThreshold(EXPORT);
const slowRule = x => x.kind === 'cellValue' && x.op === '<' && x.v1 === THRESHOLD && x.style === 'yellow';
const bar = x => x.kind === 'dataBar';
const scale = x => x.kind === 'colorScale';
const DETAIL_REV = `C${DETAIL.rev}:N${DETAIL.rev}`;
/** Monthly, the printed page: no bars and no scales, the slow-month rule kept. */
const monthlyClean = sh => !!sh && !sh.condFmt.some(x => bar(x) || scale(x)) && ruled(sh, 'C10:N10', slowRule);

export default {
  id: 'data-bars-and-scales',
  chapter: 'formatting',
  section: 'Conditional formatting',
  module: 'conditional-formatting',
  workbook: 'clearcoat-pnl',
  state: { before: 'S5b', after: 'S5c' },
  title: 'Data bars and scales, and when not to',
  difficulty: 'medium',
  tags: ['format', 'conditional-formatting', 'working-sheet'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt H L D',
  conventions: ['D8', 'G2'],
  teaches: ['data-bars'],
  uses: ['manage-rules', 'highlight-rule', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'],
  prerequisites: ['formula-driven-rules'],
  brief: 'Data bars and color scales draw a chart inside the cells, and on a working sheet they can show a shape in a second. On a page in the book they’re decoration: a buyer reads figures, not bars. Learn to add them so you know what they do, then take them off the page and keep one on a working sheet. The key is `Alt H L D`.',
  goals: [
    { id: 'bars', teach: 'Alt, H, L, D opens the Data Bars gallery: Enter takes the first, a blue bar in each cell sized to its value. Read the shape: winter low, summer high.', text: 'On Monthly, put data bars on the revenue line C10:N10 and read the seasonal shape.', keys: 'Ctrl+G "Monthly!C10" ↵ Ctrl+Shift+→ Shift+← Alt H L D ↵', requires: ['data-bars', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'shift-arrow'],
      hintStuck: 'pulse range C10:N10 · January to December; the full year in O would flatten every bar.',
      check: (s, ses) => ruled(monthly(ses), 'C10:N10', bar) && settled(ses) },
    { id: 'scale', teach: 'Alt, H, L, S opens Color Scales: green to red by default, each cell shaded by where it sits in the range.', text: 'Put a color scale on chemicals and water, C13:N13, and read which months cost most.', keys: '↓ ×3 Ctrl+Shift+→ Shift+← Alt H L S ↵', requires: ['data-bars', 'arrow-keys', 'ctrl-shift-arrow', 'shift-arrow'],
      hintStuck: 'pulse range C13:N13 · The first line under Site costs.',
      check: (s, ses) => ruled(monthly(ses), 'C13:N13', scale) && settled(ses) },
    { id: 'clear-scale', teach: 'Alt, H, L, C, S is Clear Rules from Selected Cells: every rule that meets the selection goes. Monthly is a page in the book, so the decoration comes off.', text: 'With C13:N13 still selected, take the scale off with Clear Rules from Selected Cells.', keys: 'Alt H L C S', requires: ['data-bars'], convention: 'D8',
      hintStuck: 'pulse range C13:N13 · C for Clear Rules, S for Selected Cells.',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && !sh.condFmt.some(scale) && settled(ses); } },
    { id: 'delete-bars', teach: 'Clearing C10:N10 would take the slow-month rule as well, since it sits on the same cells. Manage Rules deletes one rule and leaves the rest.', text: 'Open Manage Rules, delete the data bars at the top of the list, and keep the slow-month rule on C10:N10.', keys: 'Alt H L R Delete ↵', requires: ['manage-rules'], convention: 'G2',
      hintStuck: 'pulse range C10:N10 · Delete removes the selected rule, the first in the list.',
      check: (s, ses) => monthlyClean(monthly(ses)) && settled(ses) },
    { id: 'keep-bars', text: `On Monthly detail, the working sheet nobody prints, put data bars on the company revenue line ${DETAIL_REV}.`, keys: `Ctrl+G "'Monthly detail'!C${DETAIL.rev}" ↵ Ctrl+Shift+→ Shift+← Alt H L D ↵`, requires: ['data-bars', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'shift-arrow'],
      hintStuck: `pulse range ${DETAIL_REV} · Total revenue in the company block at the foot of the clusters.`,
      check: (s, ses) => ruled(detail(ses), DETAIL_REV, bar) && settled(ses) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "C${DETAIL.clusters[0].head + 1}" Enter "2000" Enter Escape`, cadence: 320 }, text: `Does it tie? Watch Austin’s January retail revenue in C${DETAIL.clusters[0].head + 1} go up to 2,000 and January’s bar on row ${DETAIL.rev} grow.`, requires: [],
      hintStuck: `pulse cell C${DETAIL.rev} · The company line adds the four clusters.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Monthly carries no bars or scales, and keeps its slow-month rule', check: (s, ses) => monthlyClean(monthly(ses)) },
    { text: `Monthly detail carries data bars on ${DETAIL_REV}`, check: (s, ses) => ruled(detail(ses), DETAIL_REV, bar) },
  ],
  closing: [
    'Bars stay on the working sheet; the page gets figures.',
    'A bar shows a shape faster than a column of numbers, which is why it belongs where you work, and a scale shades a line by rank, which is why a reader asks what the colors mean. The book’s pages carry the figures and the two quiet rules that flag a problem.',
  ],
  solution: `Ctrl+G "Monthly!C10" Enter Ctrl+Shift+Right Shift+Left Alt H L D Enter Down Down Down Ctrl+Shift+Right Shift+Left Alt H L S Enter Alt H L C S Alt H L R Delete Enter Ctrl+G "'Monthly detail'!C${DETAIL.rev}" Enter Ctrl+Shift+Right Shift+Left Alt H L D Enter`,
};
