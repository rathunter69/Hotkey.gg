// Practice · Data and Lookups — Goal Seek (screenplay 6.2). The break-even block on Scenarios as
// 4.5.4 left it (S454): Domain's site costs, the contribution per wash, 250 washes a day in C43 and
// the daily contribution in C44. Goal Seek C44 to zero by changing C43 for Domain, then for Mueller
// and Airport by changing the site code in C40. Each is graded on the end state: the code in C40,
// C43 a typed figure on the break-even the hand formula in C45 gives, and C44 at zero.
import { packDrill, solutionOf } from './pack-drills.js';
import { SCENARIOS } from '../workbooks/clearcoat-pack.js';
import { scenarios, settled, near, isNum } from '../lessons/lib/pack-scenario-checks.js';

const B = SCENARIOS.breakEven;
const v = (sh, r) => sh.value('C' + r);
/** C43 holds the washes a day at which the site in C40 breaks even, typed by Goal Seek, and C44 reads zero. */
const sought = (ses, code) => {
  const sh = scenarios(ses); if (!sh) return false;
  return (!code || String(v(sh, B.site)).toUpperCase() === code) && !sh.formula('C' + B.washes) && isNum(v(sh, B.washes))
    && near(v(sh, B.washes), v(sh, B.hand), 1e-3) && Math.abs(v(sh, B.daily)) < 0.01;
};
const SEEK = `Ctrl+G "Scenarios!C${B.daily}" ↵ Alt A W G Alt+V "0" Alt+C "C${B.washes}" ↵ ↵`;
const site = code => `Ctrl+G "Scenarios!C${B.site}" ↵ "${code}" ↵ ${SEEK}`;

const GOALS = [
  { id: 'domain', text: `Goal Seek Scenarios C${B.daily} to 0 by changing C${B.washes}: Domain’s break-even washes a day.`, keys: SEEK,
    check: (s, ses) => settled(ses) && sought(ses, 'AUS-DOM') },
  { id: 'mueller', text: `Type AUS-MUE in C${B.site} and Goal Seek again: Mueller’s break-even lands in C${B.washes}.`, keys: site('AUS-MUE'),
    check: (s, ses) => settled(ses) && sought(ses, 'AUS-MUE') },
  { id: 'airport', text: `Then Airport: AUS-AIR in C${B.site}, and Goal Seek C${B.daily} to 0 once more.`, keys: site('AUS-AIR'),
    check: (s, ses) => settled(ses) && sought(ses, 'AUS-AIR') },
];

export default packDrill({
  id: 'ch4-goal-seek',
  title: 'Goal Seek',
  task: 'The washes a day each site needs to break even.',
  module: 'scenarios-and-sensitivity',
  state: { before: 'S454' },
  goals: GOALS,
  endState: [
    { text: `C${B.washes} holds Airport’s break-even washes a day and C${B.daily} reads zero`, check: (s, ses) => sought(ses, 'AUS-AIR') },
  ],
  solution: solutionOf(GOALS),
  optimalKeys: 135,
  route: 30,
});
