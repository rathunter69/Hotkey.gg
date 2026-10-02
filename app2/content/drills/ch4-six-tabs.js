// Practice · Data and Lookups — Six tabs (script-drills D45, Wave 1). The pack as module 4.3 left it
// (S436), with the units line in A2 and the check block in B12:C13 emptied on all six site tabs
// (formats stay), and Mueller's title misspelled. Group the six tabs and type the units line and the
// check block once, leave the group, and fix Mueller's title on Mueller alone. Graded on the six
// tabs agreeing, no group left on, and the other five titles untouched, which is the trap.
import { packDrill, packCell, solutionOf } from './pack-drills.js';
import { SITES } from '../workbooks/clearcoat-pack.js';
import { sheetIn, settled, reads, near } from '../lessons/lib/databook-checks.js';

const TABS = SITES.map(s => s.tab);
const TITLE = tab => packCell('S436', tab, 'A1').value;
const TYPO = TITLE('Mueller').replace('Mueller', 'Muller');
const fmt = (tab, ref) => { const { value, formula, ...f } = packCell('S436', tab, ref); void value; void formula; return f; };
const plant = () => {
  const p = {};
  for (const tab of TABS) for (const ref of ['A2', 'B12', 'B13', 'C13']) p[`${tab}!${ref}`] = fmt(tab, ref);
  p['Mueller!A1'] = { ...packCell('S436', 'Mueller', 'A1'), value: TYPO };
  return p;
};
const text = v => String(v == null ? '' : v).trim().toLowerCase();
const units = ses => { const want = text(sheetIn(ses, 'Summary').value('A2')); return TABS.every(t => text(sheetIn(ses, t).value('A2')) === want); };
const checks = ses => {
  const label = text(sheetIn(ses, TABS[0]).value('B13'));
  return !!label && TABS.every(t => { const sh = sheetIn(ses, t); return text(sh.value('B12')) === 'checks' && text(sh.value('B13')) === label && reads(sh, 'C13', ['F7', 'F5', 'F6']) && near(sh.value('C13'), 0); });
};
const ungrouped = ses => !ses.group || ses.group.size <= 1;
const titles = ses => TABS.every(t => sheetIn(ses, t).value('A1') === TITLE(t));

const GOALS = [
  { id: 'units', text: 'From Domain A2, group the six site tabs (Ctrl+Shift+PgDn five times) and type the units line Summary carries, once.',
    keys: 'Ctrl+G "Domain!A2" ↵ Ctrl+Shift+PgDn ×5 Ctrl+PgUp ×5 "USD unless stated; costs shown as negatives" ↵',
    check: (s, ses) => settled(ses) && units(ses) },
  { id: 'checks', text: 'Still grouped, the check block once: Checks in B12, its label in B13 and =F7-F5-F6 in C13.',
    keys: 'Ctrl+G "B12" ↵ "Checks" ↵ "Total washes tie to retail plus member" Tab "=F7-F5-F6" ↵',
    check: (s, ses) => settled(ses) && units(ses) && checks(ses) },
  { id: 'typo', text: 'Leave the group with Ctrl+PgUp, then fix the title in Mueller A1 on that tab alone.',
    keys: 'Ctrl+PgUp Ctrl+G "Mueller!A1" ↵ F2 Home → ×21 "e" ↵',
    check: (s, ses) => settled(ses) && ungrouped(ses) && titles(ses) },
];

export default packDrill({
  id: 'ch4-six-tabs',
  title: 'Six tabs',
  task: 'Put the same units line and check row on all six site tabs at once, then fix one site’s typo without touching the others.',
  module: 'summaries-from-raw-rows',
  state: { before: 'S436' },
  plant,
  goals: GOALS,
  endState: [
    { text: 'All six tabs carry the units line and the check block, and no sheets are left grouped', check: (s, ses) => units(ses) && checks(ses) && ungrouped(ses) },
    { text: 'Mueller’s title is right and the other five titles are as they were', check: (s, ses) => titles(ses) },
  ],
  solution: solutionOf(GOALS),
  optimalKeys: 150,
  route: 40,
});
