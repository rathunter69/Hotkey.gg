// Practice · Formulas — The fiscal half (screenplay 6.2, the chapter's puzzle; script-drills D62). The
// databook (state S6d) with a block under the calendar on Sites: Clearcoat's twelve month ends of 2026,
// and the lead buyer's fiscal year, half and half end to fill (the buyer's year ends June 30). The task
// line is all the learner gets. Graded on all twelve months against the calendar, and again in a
// what-if that moves four months onto the edges (January 1, June 30, July 1, December 31); the half end
// comes from EOMONTH and a MOD offset, with no IF in it.
import { databookDrill, cellIn, sheetIn, settled, calls, fnCount, under, toScript } from './databook-drills.js';
import { dateToSerial, serialToDate } from '../../engine/format.js';

const S = 'Sites', FIRST = 20, ROWS = Array.from({ length: 12 }, (_, i) => FIRST + i);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const LAST_DAY = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const EDGES = { [`${S}!C20`]: dateToSerial(2026, 1, 1), [`${S}!C21`]: dateToSerial(2026, 6, 30), [`${S}!C22`]: dateToSerial(2026, 7, 1), [`${S}!C23`]: dateToSerial(2026, 12, 31) };
const parts = serial => { const d = serialToDate(serial); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 }; };
/** The buyer's calendar for a date: the fiscal year (named for the June it ends in), the half, and the half's last day. */
const buyer = serial => { const { y, m } = parts(serial); return { fy: m > 6 ? y + 1 : y, half: m > 6 ? 'H1' : 'H2', end: m > 6 ? dateToSerial(y, 12, 31) : dateToSerial(y, 6, 30) }; };
const COL = { fy: 'D', half: 'E', end: 'F' };
function plant() {
  const p = {};
  const head = { bold: true, align: 'r' }, date = { fmtStyle: 'custom', numFmt: 'm/d/yyyy' };
  p[`${S}!B18`] = { value: 'Lead buyer’s fiscal calendar, the year ending June 30', bold: true };
  p[`${S}!C19`] = { value: 'Month end', ...head }; p[`${S}!D19`] = { value: 'Buyer FY', ...head }; p[`${S}!E19`] = { value: 'Half', ...head }; p[`${S}!F19`] = { value: 'Half ends', ...head };
  ROWS.forEach((r, i) => {
    p[`${S}!B${r}`] = { value: MONTHS[i] };
    p[`${S}!C${r}`] = { value: dateToSerial(2026, i + 1, LAST_DAY[i]), fontColor: 'blue', ...date };
    p[`${S}!D${r}`] = { fmtStyle: 'custom', numFmt: '0' };
    p[`${S}!E${r}`] = { align: 'r' };
    p[`${S}!F${r}`] = { ...date };
  });
  return p;
}
/** Every month's three answers are formulas and read the buyer's calendar for the date beside them. */
const ties = (ses, ids) => { const sh = sheetIn(ses, S); return !!sh && ROWS.every(r => { const b = buyer(sh.value('C' + r)); return ids.every(id => { const ref = COL[id] + r; return !!sh.formula(ref) && sh.value(ref) === b[id]; }); }); };
const holds = (ses, ids) => ties(ses, ids) && under(ses, EDGES, x => ties(x, ids));
const noIf = ses => { const sh = sheetIn(ses, S); return ROWS.every(r => calls(sh, 'F' + r, ['EOMONTH']) && fnCount(sh, 'F' + r, 'IF') === 0 && fnCount(sh, 'F' + r, 'IFS') === 0); };
const F = { fy: '=YEAR(C20)+(MONTH(C20)>6)', half: '=IF(MONTH(C20)>6,"H1","H2")', end: '=EOMONTH(C20,MOD(6-MONTH(C20),6))' };
const KEYS = Object.fromEntries(Object.entries(F).map(([id, f]) => [id, `Ctrl+G "${S}!${COL[id]}20:${COL[id]}31" ↵ ${f.includes('"') ? `'${f}'` : `"${f}"`} Ctrl+↵`]));

export default databookDrill({
  id: 'puzzle-ch3',
  title: 'The fiscal half',
  task: 'The lead buyer’s fiscal year ends in June: restate every month of Clearcoat’s calendar into the buyer’s year and half.',
  module: 'dates',
  state: { before: 'S6d' },
  plant,
  goals: [
    { id: 'fy', text: 'Sites D20:D31: the buyer’s fiscal year for each month end in C, named for the June it closes in.', keys: KEYS.fy,
      check: (s, ses) => settled(ses) && holds(ses, ['fy']) },
    { id: 'half', text: 'Sites E20:E31: H1 for July to December, H2 for January to June.', keys: KEYS.half,
      check: (s, ses) => settled(ses) && holds(ses, ['half']) },
    { id: 'end', text: 'Sites F20:F31: the last day of the buyer’s half, from EOMONTH, with no IF.', keys: KEYS.end,
      check: (s, ses) => settled(ses) && holds(ses, ['end']) && noIf(ses) },
  ],
  endState: [
    { text: 'All twelve months tie to the buyer’s calendar, on the edges too, and the half end holds no IF', check: (s, ses) => holds(ses, ['fy', 'half', 'end']) && noIf(ses) },
  ],
  solution: toScript(Object.values(KEYS).join(' ')),
  optimalKeys: 160,
  route: 75,
});
