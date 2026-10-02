// Chapter 4 · 4.1.6 Approximate match for bands, and IFERROR around a lookup (clearcoat-pack, S415 → S416)
// The manager bonus tiers on Lists (band edges ascending) read by VLOOKUP with TRUE and by INDEX with
// MATCH type 1, each site's washes a day being its export total over the fifteen days; the IFS ladder
// from 3.1.2 beside them agrees. An exact lookup that can miss is wrapped in IFERROR with a message.
// The closer lowers the 250 edge and the bonus column moves.
import { summary, lists, settled, calls, block, selected, onSheet, bandOf, SITE_ROWS } from './lib/pack-checks.js';
import { FMT } from '../workbooks/page.js';

const F = {
  vlookup: '=VLOOKUP($F15/15,Lists!$J$5:$K$8,2,TRUE)',
  match: '=INDEX(Lists!$K$5:$K$8,MATCH($F15/15,Lists!$J$5:$J$8,1))',
  ifs: '=IFS($F15/15>=350,150,$F15/15>=300,100,$F15/15>=250,50,TRUE,0)',
  wrapped: '=IFERROR(XLOOKUP("AUS-XXX",Lists!$B$5:$B$10,Lists!$F$5:$F$10),"Not listed")',
};
const q = f => `'${f}'`;
const MONEY = { fmtStyle: 'custom', numFmt: FMT.moneyDash };
const head = value => ({ value, bold: true, align: 'r' });
const PLANT = {
  'Summary!K4': head('Bonus (VLOOKUP TRUE)'), 'Summary!L4': head('Bonus (INDEX/MATCH 1)'), 'Summary!M4': head('Bonus (IFS)'),
  ...Object.fromEntries(SITE_ROWS.flatMap(r => [[`Summary!K${r}`, { fontColor: 'green', ...MONEY }], [`Summary!L${r}`, { fontColor: 'green', ...MONEY }], [`Summary!M${r}`, { ...MONEY }]])),
  'Summary!I17': { value: 'Not listed, wrapped', bold: true }, 'Summary!J17': { fontColor: 'green' },
};
/** The bonus a site earns: its washes a day (the cube total in F15:F20 over fifteen days) against the tiers on Lists. */
const band = (ses, sh) => r => bandOf(ses, sh.value('F' + (r + 10)) / 15);
const IFS_BAND = (sh) => r => { const w = sh.value('F' + (r + 10)) / 15; return w >= 350 ? 150 : w >= 300 ? 100 : w >= 250 ? 50 : 0; };
const byVlookup = (ses, sh) => block(sh, 'K', SITE_ROWS, { fns: ['VLOOKUP'], want: band(ses, sh) });
const byMatch = (ses, sh) => block(sh, 'L', SITE_ROWS, { fns: ['INDEX', 'MATCH'], want: band(ses, sh) });
const byIfs = sh => block(sh, 'M', SITE_ROWS, { fns: ['IFS'], want: IFS_BAND(sh) });
const wrapped = sh => calls(sh, 'J17', ['IFERROR', 'XLOOKUP']) && sh.value('J17') === 'Not listed';

export default {
  id: 'approximate-match-bands',
  chapter: 'data-and-lookups',
  section: 'Lookups',
  module: 'lookups',
  workbook: 'clearcoat-pack',
  state: { before: 'S415', after: 'S416' },
  plant: PLANT,
  title: 'Approximate match for bands, and IFERROR around a lookup',
  difficulty: 'medium',
  tags: ['formulas', 'lookups'],
  access: 'paid',
  minutes: 6,
  headline: 'MATCH',
  conventions: ['B4', 'E6'],
  teaches: ['approximate-match'],
  uses: ['vlookup', 'index-match', 'xlookup', 'ifs-function', 'iferror-function', 'go-to', 'ctrl-enter-fill', 'shift-arrow', 'relative-absolute'],
  prerequisites: ['xlookup'],
  brief: 'Sometimes the key isn’t in the list on purpose: a manager whose site does 282 washes a day earns the bonus for the 250 band, and the tier table holds only the band edges. That is approximate match, VLOOKUP with TRUE or MATCH with 1 on a list sorted ascending, returning the nearest edge below. It replaces the IFS ladder from 3.1.2 with a table anyone can edit, and a lookup that can miss gets IFERROR from 3.1.4 with an honest message. The key is `MATCH`.',
  wow: 'A band lookup replaced the IFS ladder, and a miss says so in words.',
  goals: [
    { id: 'tiers', text: 'On Lists, select the bonus tiers in J5:K8: the band edges run ascending, 0 to 350 washes a day.', keys: 'Ctrl+G "Lists!J5:K8" ↵', requires: ['go-to'],
      hintStuck: 'pulse range J5:K8 on Lists · The tiers sit right of the site list, under Washes a day.',
      check: (s, ses) => settled(ses) && onSheet(ses, 'Lists') && selected(lists(ses), 'J5:K8') },
    { id: 'vlookup-true', teach: 'With TRUE, VLOOKUP walks a list sorted ascending and stops at the largest edge at or below the key: 282 washes a day lands on 250 and returns $50. The key here is a calculation, the cube total over fifteen days, and $F15 keeps the formula on the total column as it fills.',
      text: 'Bonus by band in Summary K5:K10: =VLOOKUP($F15/15,Lists!$J$5:$K$8,2,TRUE), each site’s washes a day.', keys: `Ctrl+G "Summary!K5:K10" ↵ "${F.vlookup}" Ctrl+↵`, requires: ['approximate-match', 'go-to', 'ctrl-enter-fill', 'relative-absolute'],
      hintStuck: 'pulse range K5:K10 on Summary · F15:F20 hold each site’s export total; fifteen days make the daily figure.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && byVlookup(ses, sh); } },
    { id: 'match-one', teach: 'MATCH with 1 as its last argument does the same walk and returns the position of the edge, so INDEX on the bonus column gives the same answer from a table you point at.',
      text: 'The same band by INDEX/MATCH in L5:L10, MATCH type 1 on the edges in Lists!$J$5:$J$8.', keys: `→ Shift+↓ ×5 "${F.match}" Ctrl+↵`, requires: ['approximate-match', 'index-match', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range L5:L10 · INDEX the bonuses in Lists!$K$5:$K$8; MATCH the edges with 1.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && byMatch(ses, sh); } },
    { id: 'ifs', text: 'Write the IFS ladder from 3.1.2 in M5:M10 and read it agree with the table.', keys: `→ Shift+↓ ×5 "${F.ifs}" Ctrl+↵`, requires: ['ifs-function', 'shift-arrow', 'ctrl-enter-fill'], convention: 'B4',
      hintStuck: 'pulse range M5:M10 · Test the top band first: 350, then 300, then 250, then TRUE for 0.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && byIfs(sh); } },
    { id: 'wrapped', teach: 'They agree, but only the table can be changed by someone who can’t read a formula, and the ladder hides four typed figures. IFERROR belongs only where a miss is expected, and its fallback should say what happened: a blank reads as a zero, a message reads as a missing code.',
      text: 'In J17, wrap a lookup that misses: =IFERROR(XLOOKUP("AUS-XXX",…),"Not listed") on the codes and capacities.', keys: `Ctrl+G "Summary!J17" ↵ ${q(F.wrapped)} ↵`, requires: ['iferror-function', 'xlookup', 'go-to'], convention: 'E6',
      hintStuck: 'pulse cell J17 on Summary · The XLOOKUP from J15 without its fourth argument goes inside the IFERROR.',
      check: (s, ses) => settled(ses) && wrapped(summary(ses)) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Lists!J6" Enter "220" Enter Ctrl+G "Summary!K5:K10" Enter', cadence: 320 },
      text: 'Does it tie? Watch the 250 edge on Lists drop to 220, and Mueller and Riverside move into the $50 band.', requires: [],
      hintStuck: 'pulse range K5:K10 on Summary · The table leads; the bonuses follow.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'K5:M10 read the bonus three ways and agree; J17 says Not listed', check: (s, ses) => { const sh = summary(ses); return byVlookup(ses, sh) && byMatch(ses, sh) && byIfs(sh) && wrapped(sh); } },
  ],
  closing: [
    'A band lookup replaced the IFS ladder, and a miss says so in words.',
    'Approximate match needs one thing to be true, a list sorted ascending, and then any band table becomes a lookup an ops manager can edit without touching a formula. The IFS column goes when module 4.2 starts; the table stays.',
  ],
  solution: `Ctrl+G "Lists!J5:K8" Enter Ctrl+G "Summary!K5:K10" Enter "${F.vlookup}" Ctrl+Enter Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.match}" Ctrl+Enter `
    + `Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.ifs}" Ctrl+Enter Ctrl+G "Summary!J17" Enter ${q(F.wrapped)} Enter`,
};
