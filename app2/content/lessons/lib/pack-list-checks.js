// app2/content/lessons/lib/pack-list-checks.js — the end-state checks Chapter 4's list and summary
// lessons share on the clearcoat-pack workbook (modules 4.2 and 4.3). As in Chapter 3 (the
// databook checks this file builds on): a block holds a formula that calls the function the goal
// names (read from the parsed tokens), it reads the figure that function gives on the learner's
// own export, and the cell the goal names moves when an input moves. Any legitimate route passes.
import { sheetIn, settled, isNum, near, calls, live, reads, block, totalOf, liveValue, sameText, onSheet, selected } from './databook-checks.js';
import { workbookState } from '../../workbooks/index.js';

export { sheetIn, settled, isNum, near, calls, live, reads, block, totalOf, liveValue, sameText, onSheet, selected };
export const summary = ses => sheetIn(ses, 'Summary');
export const exportSheet = ses => sheetIn(ses, 'Export');
export const lists = ses => sheetIn(ses, 'Lists');
export const qa = ses => sheetIn(ses, 'Q&A');
export const scenarios = ses => sheetIn(ses, 'Scenarios');
export const copySheet = ses => sheetIn(ses, 'Export sort');

/** The POS export’s rows (A to I), read off a sheet as they stand: { r, date, site, retail, member, total, revenue, hours, week, day }. */
export function rowsOf(sh, first = 5, last = 94) {
  if (!sh) return [];
  const out = [];
  for (let r = first; r <= last; r++) out.push({ r, date: sh.value('A' + r), site: sh.value('B' + r), retail: sh.value('C' + r), member: sh.value('D' + r), total: sh.value('E' + r), revenue: sh.value('F' + r), hours: sh.value('G' + r), week: sh.value('H' + r), day: sh.value('I' + r) });
  return out;
}
export const exportRows = ses => rowsOf(exportSheet(ses));
/** Sum a field over the rows that pass every predicate (text criteria compare as Excel's do: case-blind). */
export const sumWhere = (rows, field, ...preds) => rows.filter(x => preds.every(p => p(x))).reduce((t, x) => t + (isNum(x[field]) ? x[field] : 0), 0);
export const countWhere = (rows, ...preds) => rows.filter(x => preds.every(p => p(x))).length;
export const maxWhere = (rows, field, ...preds) => rows.filter(x => preds.every(p => p(x)) && isNum(x[field])).reduce((m, x) => Math.max(m, x[field]), 0);
export const atSite = code => x => sameText(x.site, code);
export const inWeek = key => x => sameText(x.week, key);
export const between = (a, b) => x => isNum(x.date) && x.date >= a && x.date <= b;

/** The validation rule on a cell (null when none). */
export const ruleAt = (sh, ref) => (sh && sh.validation && sh.validation[ref]) || null;
/** The sheet's AutoFilter criteria on a column (by number), or null. */
export const filterOn = (sh, col) => (sh && sh.filter && sh.filter.crit && sh.filter.crit[col]) || null;
/** The workbook's sheet names, in tab order. */
export const sheetNames = ses => ses.sheets.map(e => e.name);

/**
 * A lesson's planting cut from its own end state: the cells a lesson writes, laid out before it
 * starts with their formats (and, with keepText, their typed labels), but no figure or formula.
 * The page's layout is there; the learner writes what the page reads. `refs` by sheet:
 * { Summary: ['C25', …] }.
 */
export function shellOf(stateId, refsBySheet, { keepText = [] } = {}) {
  const st = workbookState('clearcoat-pack', stateId); const out = {};
  for (const name in refsBySheet) {
    const sh = st.sheets.find(s => s.name === name); if (!sh) continue;
    for (const ref of refsBySheet[name]) {
      const c = sh.cells[ref]; if (!c) continue;
      const shell = { ...c }; delete shell.formula;
      const isLabel = typeof c.value === 'string' && !c.formula && (keepText === true || keepText.includes(ref));
      if (!isLabel) delete shell.value;
      if (Object.keys(shell).length) out[name + '!' + ref] = shell;
    }
  }
  return out;
}
/** Every ref in a block such as 'C15:F21'. */
export function refsIn(range) {
  const [a, b] = range.split(':'); const pa = /^([A-Z])(\d+)$/.exec(a), pb = /^([A-Z])(\d+)$/.exec(b || a); const out = [];
  for (let r = +pa[2]; r <= +pb[2]; r++) for (let c = pa[1].charCodeAt(0); c <= pb[1].charCodeAt(0); c++) out.push(String.fromCharCode(c) + r);
  return out;
}
