// Practice · Foundations — Find and fix (screenplay 6.1). The Austin weekly report as a manager's
// copy arrives: two misspelled sites, a site name spelled two ways, last week's date in three
// places, a figure stuck as text, a ticket with an extra zero and a stray word in the spacer row.
// Find lands on one, Replace All fixes the rest in a pass; graded on what the cells hold.
import { parsFromRoute } from '../../app/pars.js';
import { reportPage, cutFrom, WEEK, WEEK_WASHES, SITE_TICKET, at } from './austin.js';

const PAGE = reportPage({ dailyTitle: `Washes by day, ${WEEK}` });
const A = PAGE.at;   // Riverside 7, South Lamar 8, Airport 9; the daily block's Mueller 18, Riverside 19
const STALE = 'Sep 8', NOW = 'Sep 15';
const DATED = ['A1', 'A' + (A['d-Domain'] - 2), 'A' + (A['d-Airport'] + 1)];   // the title, the daily block's title, the source line
const RIVERSIDE = WEEK_WASHES.Riverside, LAMAR = SITE_TICKET['South Lamar'];

const start = cutFrom(PAGE, (cells, sh) => {
  for (const ref of DATED) cells[ref].value = cells[ref].value.replace(NOW, STALE);
  cells['A' + A.Airport].value = 'Airprot';
  cells['A' + A['d-Riverside']].value = 'Riversid';
  cells['A' + A.Mueller].value = 'Muller';
  cells['A' + A['d-Mueller']].value = 'Muller';
  cells['B' + A.Riverside].value = RIVERSIDE + ' ';   // a figure typed as text, with a trailing space
  cells['C' + A['South Lamar']].value = LAMAR * 10;
  cells.A3 = { value: 'draft' };
  sh.active = { r: 1, c: 1 };
});

const r = k => A[k];
export default {
  id: 'find-and-fix',
  chapter: 'foundations',
  title: 'Find and fix',
  task: 'Find and fix two typos, Replace All a site name and last week’s date, and clean up three cells.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Report' }],
  goals: [
    { id: 'find', text: `Find the misspelled Airprot and land on it, A${r('Airport')}.`, keys: 'Ctrl+F "Airprot" ↵ Esc', check: (s, ses) => !ses.dialog && at(s, 'A' + r('Airport')) },
    { id: 'retype', text: `Retype A${r('Airport')} as Airport.`, keys: '"Airport" ↵', check: s => s.value('A' + r('Airport')) === 'Airport' },
    { id: 'riverside', text: `Fix Riversid in A${r('d-Riverside')} to read Riverside.`, keys: `Ctrl+G "A${r('d-Riverside')}" ↵ "Riverside" ↵`, check: s => s.value('A' + r('d-Riverside')) === 'Riverside' },
    { id: 'mueller', text: 'Replace every Muller with Mueller in one pass.', keys: 'Ctrl+H "Muller" Tab "Mueller" Alt+A Esc',
      check: (s, ses) => !ses.dialog && s.value('A' + r('Mueller')) === 'Mueller' && s.value('A' + r('d-Mueller')) === 'Mueller' },
    { id: 'week', text: `Replace every ${STALE} with ${NOW}, three cells at once.`, keys: `Ctrl+H "${STALE}" Tab "${NOW}" Alt+A Esc`,
      check: (s, ses) => !ses.dialog && DATED.every(ref => String(s.value(ref)).includes(NOW) && !String(s.value(ref)).includes(STALE)) },
    { id: 'text', text: `Riverside's washes in B${r('Riverside')} are stuck as text: type ${RIVERSIDE} over them as a number.`, keys: `Ctrl+G "B${r('Riverside')}" ↵ "${RIVERSIDE}" ↵`,
      check: s => s.value('B' + r('Riverside')) === RIVERSIDE },
    { id: 'ticket', text: `South Lamar's ticket in C${r('South Lamar')} has an extra zero: take it off with F2.`, keys: `Ctrl+G "C${r('South Lamar')}" ↵ F2 ⌫ ↵`,
      check: s => s.value('C' + r('South Lamar')) === LAMAR },
    { id: 'spacer', text: 'Clear the stray word out of A3, the spacer row.', keys: 'Ctrl+G "A3" ↵ Delete', check: s => s.value('A3') == null || s.value('A3') === '' },
  ],
  solution: `Ctrl+F "Airprot" Enter Escape "Airport" Enter Ctrl+G "A${r('d-Riverside')}" Enter "Riverside" Enter Ctrl+H "Muller" Tab "Mueller" Alt+A Escape `
    + `Ctrl+H "${STALE}" Tab "${NOW}" Alt+A Escape Ctrl+G "B${r('Riverside')}" Enter "${RIVERSIDE}" Enter Ctrl+G "C${r('South Lamar')}" Enter F2 Backspace Enter Ctrl+G "A3" Enter Delete`,
  optimalKeys: 86,
  route: 30,
  pars: parsFromRoute(30),
};
