// Chapter 5 · 5.6.2 Unlevered free cash flow (clearcoat-model, B562 → B563)
// The DCF holds EBITDA, capex and the working-capital cash effect, linked. The learner takes
// depreciation off to reach EBIT, taxes EBIT at the rate (never the IS tax, which already reflects
// interest), adds depreciation back, sums to unlevered free cash flow and adds the memo of FCF as a
// share of EBITDA. Each row is graded on the figure it gives from the learner's own cells and on
// the rows it reads, so any formula that gets there passes.
import { sheetIn, settled, reads, near, isNum, formatsOf, doneFormula, R, rowRefs, linkRow, COLS } from './lib/model-checks.js';

const D = 'DCF';
const r = key => R(D, key);
const TAX = 'Inputs!C' + R('Inputs', 'tax');
const KEYS = ['depLess', 'ebit', 'taxEbit', 'nopat', 'depBack', 'fcf', 'fcfShare'];
const F = Object.fromEntries(KEYS.map(k => [k, doneFormula(D, 'C' + r(k))]));
const range = key => `C${r(key)}:J${r(key)}`;
/** Each column of the row holds a formula reading `uses` (row keys, same column) and showing `want`. */
function calcRow(ses, key, uses, want, extra = []) {
  const sh = sheetIn(ses, D); const v = (k, col) => sh.value(col + r(k));
  return COLS.every(col => {
    const ref = col + r(key); const w = want(k => v(k, col), sheetIn(ses, 'Inputs').value(TAX.split('!')[1]));
    if (!sh.formula(ref) || !reads(sh, ref, [...uses.map(k => col + r(k)), ...extra])) return false;
    return typeof w === 'number' ? near(sh.value(ref), w, 1e-6 * Math.max(1, Math.abs(w))) : sh.value(ref) === w;
  });
}
const depOk = ses => linkRow(ses, D, rowRefs(D, 'depLess'), col => `Schedules!${col}${R('Schedules', 'dep')}`, -1);
const ebitOk = ses => calcRow(ses, 'ebit', ['ebitda', 'depLess'], v => v('ebitda') + v('depLess'));
const taxOk = ses => calcRow(ses, 'taxEbit', ['ebit'], (v, t) => -Math.max(v('ebit'), 0) * t, [TAX]);
const nopatOk = ses => calcRow(ses, 'nopat', ['ebit', 'taxEbit'], v => v('ebit') + v('taxEbit'));
const backOk = ses => calcRow(ses, 'depBack', ['depLess'], v => -v('depLess'));
const fcfOk = ses => calcRow(ses, 'fcf', ['nopat', 'capex', 'nwc'], v => v('nopat') + v('depBack') + v('capex') + v('nwc'));
const shareOk = ses => calcRow(ses, 'fcfShare', ['fcf', 'ebitda'], v => (isNum(v('ebitda')) && v('ebitda') !== 0 ? v('fcf') / v('ebitda') : '-'));
const go = key => range(key);
const step = (key, text) => ({ keys: `Ctrl+G "DCF!${go(key)}" ↵ '${F[key]}' Ctrl+↵`, text: text.replace('%F', F[key]).replace('%R', range(key)) });

export default {
  id: 'unlevered-free-cash-flow',
  chapter: 'finance-and-accounting',
  section: 'DCF',
  module: 'dcf',
  workbook: 'clearcoat-model',
  state: { before: 'B562', after: 'B563' },
  plant: formatsOf(D, KEYS.flatMap(k => rowRefs(D, k))),
  title: 'Unlevered free cash flow',
  difficulty: 'medium',
  tags: ['model', 'dcf', 'free cash flow'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['C3', 'B2'],
  teaches: ['unlevered-fcf'],
  uses: ['cross-sheet-ref', 'ctrl-enter-fill', 'go-to', 'min-max-cap', 'f4-anchor', 'sum-family', 'iferror-function'],
  prerequisites: ['what-a-dcf-is'],
  brief: 'Unlevered free cash flow is the cash the washes generate before anybody gets paid, not the lenders and not the owners. Start from EBIT, take off the tax owed on it as if there were no debt, add depreciation back, then take off capex and the cash tied up in working capital. It ignores how the business is financed, so the operations are valued first and the debt comes off at equity value. Build it from the linked lines. The key is `=`.',
  goals: [
    { id: 'dep', teach: 'Free cash flow is built down the page from EBITDA, one line at a time. Depreciation comes off first to reach EBIT, because tax is charged on profit after depreciation.',
      ...step('depLess', 'Link depreciation across %R, as a deduction: %F.'),
      requires: ['unlevered-fcf', 'cross-sheet-ref', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${range('depLess')} · Depreciation is row ${R('Schedules', 'dep')} on Schedules, shown positive there.`,
      check: (s, ses) => settled(ses) && depOk(ses) },
    { id: 'ebit', ...step('ebit', 'EBIT across %R: %F.'), requires: ['ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${range('ebit')} · EBITDA plus the line below it, which is negative.`,
      check: (s, ses) => settled(ses) && ebitOk(ses) },
    { id: 'tax', teach: 'Tax here is on EBIT at the rate, not the tax on the IS, which is lower because interest came off first. MAX keeps a loss year from turning into a refund.',
      ...step('taxEbit', 'Tax on EBIT across %R: %F.'), requires: ['unlevered-fcf', 'min-max-cap', 'f4-anchor', 'cross-sheet-ref', 'ctrl-enter-fill', 'go-to'], convention: 'B2',
      hintStuck: `pulse range ${range('taxEbit')} · The tax rate is row ${R('Inputs', 'tax')} on Inputs; anchor it with F4.`,
      check: (s, ses) => settled(ses) && taxOk(ses) },
    { id: 'nopat', ...step('nopat', 'NOPAT, EBIT after that tax, across %R: %F.'), requires: ['ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${range('nopat')} · EBIT plus the tax line, which is negative.`,
      check: (s, ses) => settled(ses) && nopatOk(ses) },
    { id: 'back', teach: 'Depreciation is a charge that never left the bank account, so it comes back now that tax is done.',
      ...step('depBack', 'Add depreciation back across %R: %F.'), requires: ['ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${range('depBack')} · The deduction in row ${r('depLess')}, turned around.`,
      check: (s, ses) => settled(ses) && backOk(ses) },
    { id: 'fcf', ...step('fcf', 'Unlevered free cash flow across %R: %F.'), requires: ['unlevered-fcf', 'sum-family', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${range('fcf')} · NOPAT, depreciation back, capex and working capital, rows ${r('nopat')} to ${r('nwc')}.`,
      check: (s, ses) => settled(ses) && fcfOk(ses) },
    { id: 'share', ...step('fcfShare', 'The memo, FCF as a share of EBITDA, across %R: %F.'), requires: ['iferror-function', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range ${range('fcfShare')} · Free cash flow over EBITDA; IFERROR shows a dash where EBITDA is nothing.`,
      check: (s, ses) => settled(ses) && shareOk(ses) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "Inputs!F${R('Inputs', 'bNew')}" Enter "3" Enter Ctrl+G "DCF!F${r('fcf')}" Enter`, cadence: 360 },
      text: 'Does it tie? Watch three new sites in FY27 instead of six: capex falls, and free cash flow rises that year.', requires: [],
      hintStuck: `pulse cell F${r('fcf')} · Fewer sites, less capex, more cash.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'EBIT, tax on EBIT and NOPAT build down from EBITDA', check: (s, ses) => depOk(ses) && ebitOk(ses) && taxOk(ses) && nopatOk(ses) },
    { text: 'Unlevered free cash flow adds depreciation back and takes off capex and working capital', check: (s, ses) => backOk(ses) && fcfOk(ses) && shareOk(ses) },
  ],
  closing: [
    'This is the cash the business throws off for whoever owns it, before the debt is paid.',
    'Best practice: tax here is on EBIT, and interest is nowhere on this page. If either slips in, the value counts the debt twice. Unlevered cash flow goes with WACC and gives enterprise value; cash flow after interest goes with the cost of equity and gives equity value. Mixing the two is the classic error.',
  ],
  solution: KEYS.map(k => `Ctrl+G "DCF!${go(k)}" Enter '${F[k]}' Ctrl+Enter`).join(' '),
};
