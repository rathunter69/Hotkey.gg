// Practice · Foundations — Enter and fill (screenplay 6.1; built from Type the column and Fill
// factory). The Austin washes-by-day page with its gaps: day names to fill, a column to type down,
// a row to type across, two closed days, a figure with an extra zero, a week formula and a target to
// fill. Graded on what the cells hold, whichever keys put it there.
import { parsFromRoute } from '../../app/pars.js';
import { buildPage, cutFrom, emptied, refsIn, SITES, DAY_NAMES, DAY_WASHES, WEEK, near, live, num } from './austin.js';

const TARGET = 250;
// Mueller was closed Wednesday and Thursday for repairs: the solved page holds those zeros
const washes = { ...DAY_WASHES, Mueller: DAY_WASHES.Mueller.map((w, i) => (i === 2 || i === 3 ? 0 : w)) };

const PAGE = buildPage({
  name: 'Washes', chapter: 1, title: `Austin washes by day, ${WEEK}`, units: 'Washes unless stated', labelHeader: 'Site',
  headers: [...DAY_NAMES, 'Week'], kinds: Array(7).fill('count'),
  blocks: [
    { rows: [
      ...SITES.map(s => ({ key: s, label: s, fill: (col, r) => (col === 'H' ? `=SUM(B${r}:G${r})` : washes[s][col.charCodeAt(0) - 66]) })),
      { key: 'total', label: 'Total', total: true, fill: col => `=SUM(${col}5:${col}9)` },
    ] },
    { title: 'Targets', rows: [{ key: 'target', label: 'Washes a day', fill: (col, r) => (col === 'H' ? `=SUM(B${r}:G${r})` : TARGET) }] },
  ],
  source: `Source: tunnel controllers, ${WEEK}`,
});
const T = PAGE.at.target;   // 13
const RIVERSIDE_MON = washes.Riverside[0];

const start = cutFrom(PAGE, (cells, sh) => {
  emptied(cells, [...refsIn('C4:G4'), ...refsIn('G5:G8'), ...refsIn('B9:G9'), 'D6', 'E6', ...refsIn('H6:H9'), ...refsIn(`C${T}:H${T}`)]);
  cells.B7.value = RIVERSIDE_MON * 10;   // typed with an extra zero
  sh.active = { r: 4, c: 2 };
});

const sat = SITES.slice(0, 4).map(s => washes[s][5]);
const airport = washes.Airport;
const rowSum = (s, r) => ['B', 'C', 'D', 'E', 'F', 'G'].reduce((t, c) => t + num(s, c + r), 0);

export default {
  id: 'enter-and-fill',
  chapter: 'foundations',
  title: 'Enter and fill',
  task: 'Fill the day names, type the missing washes, fix a figure, and fill the week and the targets.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Washes' }],
  goals: [
    { id: 'days', text: 'Fill the day names across C4:G4 from Mon in B4 with Fill Series.', keys: 'Ctrl+G "B4:G4" ↵ Alt H F I S ↵',
      check: s => DAY_NAMES.slice(1).every((d, i) => s.value(String.fromCharCode(67 + i) + '4') === d) },
    { id: 'saturday', text: `Type Saturday's washes down G5:G8, Enter after each: ${sat.join(', ')}.`, keys: `Ctrl+G "G5" ↵ ${sat.map(v => `"${v}" ↵`).join(' ')}`,
      check: s => sat.every((v, i) => s.value('G' + (5 + i)) === v) },
    { id: 'airport', text: `Type Airport's week across B9:G9, Tab between them: ${airport.join(', ')}.`, keys: `Ctrl+G "B9" ↵ ${airport.map(v => `"${v}"`).join(' Tab ')} ↵`,
      check: s => airport.every((v, i) => s.value(String.fromCharCode(66 + i) + '9') === v) },
    { id: 'closed', text: 'Mueller was closed Wednesday and Thursday: put 0 in D6:E6 with one Ctrl+Enter.', keys: 'Ctrl+G "D6:E6" ↵ "0" Ctrl+↵',
      check: s => s.value('D6') === 0 && s.value('E6') === 0 },
    { id: 'fix', text: "Riverside's Monday in B7 has an extra zero: open it with F2 and take it off.", keys: 'Ctrl+G "B7" ↵ F2 ⌫ ↵',
      check: s => s.value('B7') === RIVERSIDE_MON },
    { id: 'week', text: 'Fill the Week formula in H5 down H6:H9 with Ctrl+D.', keys: 'Ctrl+G "H5:H9" ↵ Ctrl+D',
      check: s => [6, 7, 8, 9].every(r => near(s.value('H' + r), rowSum(s, r)) && live(s, 'H' + r)) },
    { id: 'target', text: `Fill the ${TARGET} target in B${T} right across C${T}:G${T}.`, keys: `Ctrl+G "B${T}:G${T}" ↵ Ctrl+R`,
      check: s => ['C', 'D', 'E', 'F', 'G'].every(c => s.value(c + T) === s.value('B' + T) && typeof s.value('B' + T) === 'number') },
    { id: 'target-week', text: `Copy the Week formula from H9 into H${T}.`, keys: `Ctrl+G "H9" ↵ Ctrl+C Ctrl+G "H${T}" ↵ Ctrl+V`,
      check: s => near(s.value('H' + T), rowSum(s, T)) && live(s, 'H' + T) },
  ],
  solution: `Ctrl+G "B4:G4" Enter Alt H F I S Enter Ctrl+G "G5" Enter ${sat.map(v => `"${v}" Enter`).join(' ')} Ctrl+G "B9" Enter ${airport.map(v => `"${v}"`).join(' Tab ')} Enter `
    + `Ctrl+G "D6:E6" Enter "0" Ctrl+Enter Ctrl+G "B7" Enter F2 Backspace Enter Ctrl+G "H5:H9" Enter Ctrl+D Ctrl+G "B${T}:G${T}" Enter Ctrl+R Ctrl+G "H9" Enter Ctrl+C Ctrl+G "H${T}" Enter Ctrl+V`,
  optimalKeys: 106,
  route: 45,
  pars: parsFromRoute(45),
};
