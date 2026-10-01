// Practice · Foundations — Paste surgeon (screenplay 6.1). The Austin revenue snapshot: freeze this
// week's revenue as values, scale and flip last week's accounting export (negative cents) with
// Paste Special arithmetic, and carry formats, a formula and a width across, one aspect at a time.
import { parsFromRoute } from '../../app/pars.js';
import { priorWeekRevenue } from '../workbooks/clearcoat-weekly.js';
import { buildPage, cutFrom, unformatted, emptied, refsIn, SITES, SITE_TICKET, WEEK_WASHES, UNITS, WEEK, near, live } from './austin.js';

const LAST = Object.fromEntries(SITES.map(s => [s, priorWeekRevenue(undefined, s)]));
const PAGE = buildPage({
  name: 'Snapshot', chapter: 1, title: `Austin revenue snapshot, ${WEEK}`, units: UNITS, labelHeader: 'Site',
  headers: ['Washes', 'Avg ticket', 'Revenue', 'Last week', 'Change', 'At close'], kinds: ['count', 'unit', 'money', 'money', 'money', 'money'],
  blocks: [
    { rows: [
      ...SITES.map(s => ({ key: s, label: s, fill: (col, r) => ({ B: WEEK_WASHES[s], C: SITE_TICKET[s], D: `=B${r}*C${r}`, E: LAST[s], F: `=D${r}-E${r}`, G: WEEK_WASHES[s] * SITE_TICKET[s] })[col] })),
      { key: 'total', label: 'Total', total: true, fill: (col, r) => (col === 'C' ? `=D${r}/B${r}` : col === 'F' ? `=D${r}-E${r}` : `=SUM(${col}5:${col}9)`) },
    ] },
    { title: 'Inputs', rows: [
      { key: 'cents', label: 'Cents per dollar', kind: 'count', values: [100] },
      { key: 'flip', label: 'Flip the sign', kind: 'count', values: [-1] },
    ] },
  ],
  source: 'Source: site POS; last week from the accounting system',
});
const C = PAGE.at.cents, FL = PAGE.at.flip;   // 13, 14

const start = cutFrom(PAGE, (cells, sh) => {
  emptied(cells, [...refsIn('G5:G9'), ...refsIn('F6:F10')]);
  unformatted(cells, ['F4', 'G4', 'G10', ...refsIn('E5:E9')]);
  for (const s of SITES) cells['E' + PAGE.at[s]].value = -Math.round(LAST[s] * 100);   // the export: negative, in cents
  sh.colW = { ...sh.colW, 5: 40 };   // the column arrived narrow from accounting
  sh.active = { r: 5, c: 4 };
});

const rows = [5, 6, 7, 8, 9];
const lastOf = r => LAST[SITES[r - 5]];
export default {
  id: 'paste-surgeon',
  chapter: 'foundations',
  title: 'Paste surgeon',
  task: 'Freeze the revenue as values, fix last week’s export with Paste Special math, and paste formats, a formula and a width.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Snapshot' }],
  goals: [
    { id: 'values', text: 'Copy the revenue D5:D9 and paste only its values onto G5:G9, the figures at close.', keys: 'Ctrl+G "D5:D9" ↵ Ctrl+C Ctrl+G "G5" ↵ Ctrl+Alt+V V ↵',
      check: s => rows.every(r => !s.formula('G' + r) && near(s.value('G' + r), s.value('D' + r))) },
    { id: 'headers', text: 'Copy the header D4 and paste only its format onto F4:G4.', keys: 'Ctrl+G "D4" ↵ Ctrl+C Ctrl+G "F4:G4" ↵ Ctrl+Alt+V T ↵',
      check: s => ['F4', 'G4'].every(ref => s.cellAt(ref).bold && s.cellAt(ref).align === 'r' && typeof s.value(ref) === 'string') },
    { id: 'divide', text: `Last week in E5:E9 came in cents: divide it by the 100 in B${C} with Paste Special.`, keys: `Ctrl+G "B${C}" ↵ Ctrl+C Ctrl+G "E5:E9" ↵ Ctrl+Alt+V I ↵`,
      check: s => rows.every(r => near(Math.abs(s.value('E' + r)), lastOf(r))) },
    { id: 'flip', text: `Multiply E5:E9 by the -1 in B${FL} to turn last week positive.`, keys: `Ctrl+G "B${FL}" ↵ Ctrl+C Ctrl+G "E5:E9" ↵ Ctrl+Alt+V M ↵`,
      check: s => rows.every(r => near(s.value('E' + r), lastOf(r))) },
    { id: 'formats', text: 'Copy G5:G9 and paste only its formats onto last week, E5:E9.', keys: 'Ctrl+G "G5:G9" ↵ Ctrl+C Ctrl+G "E5:E9" ↵ Ctrl+Alt+V T ↵',
      check: s => rows.every(r => { const e = s.cellAt('E' + r), g = s.cellAt('G' + r); return e.fontColor === 'blue' && e.fmtStyle === g.fmtStyle && e.decimals === g.decimals; }) },
    { id: 'formulas', text: 'Copy the change formula in F5 and paste only formulas onto F6:F10.', keys: 'Ctrl+G "F5" ↵ Ctrl+C Ctrl+G "F6:F10" ↵ Ctrl+Alt+V F ↵',
      check: s => [6, 7, 8, 9, 10].every(r => near(s.value('F' + r), s.value('D' + r) - s.value('E' + r)) && live(s, 'F' + r)) },
    { id: 'width', text: 'Copy column D’s width onto column E with Paste Special, Column widths.', keys: 'Ctrl+G "D4" ↵ Ctrl+C Ctrl+G "E4" ↵ Ctrl+Alt+V W ↵',
      check: s => s.colW[5] === s.colW[4] },
    { id: 'total', text: 'Copy the total D10 and paste only its format onto G10.', keys: 'Ctrl+G "D10" ↵ Ctrl+C Ctrl+G "G10" ↵ Ctrl+Alt+V T ↵',
      check: s => s.cellAt('G10').bold === true && s.cellAt('G10').bt === true && !!s.formula('G10') },
  ],
  solution: 'Ctrl+G "D5:D9" Enter Ctrl+C Ctrl+G "G5" Enter Ctrl+Alt+V V Enter Ctrl+G "D4" Enter Ctrl+C Ctrl+G "F4:G4" Enter Ctrl+Alt+V T Enter '
    + `Ctrl+G "B${C}" Enter Ctrl+C Ctrl+G "E5:E9" Enter Ctrl+Alt+V I Enter Ctrl+G "B${FL}" Enter Ctrl+C Ctrl+G "E5:E9" Enter Ctrl+Alt+V M Enter `
    + 'Ctrl+G "G5:G9" Enter Ctrl+C Ctrl+G "E5:E9" Enter Ctrl+Alt+V T Enter Ctrl+G "F5" Enter Ctrl+C Ctrl+G "F6:F10" Enter Ctrl+Alt+V F Enter '
    + 'Ctrl+G "D4" Enter Ctrl+C Ctrl+G "E4" Enter Ctrl+Alt+V W Enter Ctrl+G "D10" Enter Ctrl+C Ctrl+G "G10" Enter Ctrl+Alt+V T Enter',
  optimalKeys: 122,
  route: 45,
  pars: parsFromRoute(45),
};
