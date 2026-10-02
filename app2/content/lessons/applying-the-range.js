// Chapter 6 · 6.1.5 Applying the range to Clearcoat (clearcoat-valuation, B615 → B621)
// The set is spread, flagged and summarized on three multiples, and Clearcoat's FY26E figures sit on
// its own row. The learner builds the range block: each multiple's low, median and high read from
// the statistics, times Clearcoat's own figure; less net debt for the equity range; the median
// column bold. The lesson ends where module 6.2 begins. Graded on the figures the page's formulas
// give on the learner's own cells, live where the goal says so.
import { settled, built, liveOn, carries, formatsAt, formulaOf, q, solutionOf, R } from './lib/comps-checks.js';

const F = ref => formulaOf(ref);
const COLS = ['C', 'D', 'E'];
const row = key => COLS.map(c => c + R(key));
const KEYS = ['rgMult', 'rgEV', 'rgSiteMult', 'rgSiteEV', 'rgWashMult', 'rgWashEV', 'rgNetDebt', 'rgEq', 'rgEqSite', 'rgEqWash'];
const ALL = KEYS.flatMap(row);
const MED = KEYS.map(k => 'D' + R(k));
const multOk = ses => built(ses, [...row('rgMult'), ...row('rgEV')]);
const siteOk = ses => built(ses, [...row('rgSiteMult'), ...row('rgSiteEV')]);
const washOk = ses => built(ses, [...row('rgWashMult'), ...row('rgWashEV')]);
const eqOk = ses => built(ses, [...row('rgNetDebt'), ...row('rgEq'), ...row('rgEqSite'), ...row('rgEqWash')]);
const boldOk = ses => carries(ses, MED, 'bold');
/** A statistic row read across: low, median, high from a helper column's statistics. */
const readAcross = key => `Ctrl+G "Comps!C${R(key)}" ↵ ${COLS.map(c => q(F(c + R(key)))).join(' ↵ → ')} ↵`;
const fillAcross = key => `Ctrl+G "Comps!C${R(key)}:E${R(key)}" ↵ ${q(F('C' + R(key)))} Ctrl+↵`;

const LESSON = {
  id: 'applying-the-range',
  chapter: 'valuation',
  section: 'Trading comps',
  module: 'trading-comps',
  workbook: 'clearcoat-valuation',
  state: { before: 'B615', after: 'B621' },
  // the block's cells arrive in the book's format ($m to one decimal, the equity totals bold); the median's bold is the learner's
  plant: { ...formatsAt('B621', ALL.filter(ref => !MED.includes(ref))), ...formatsAt('B621', MED, ['bold']) },
  title: 'Applying the range to Clearcoat',
  difficulty: 'medium',
  tags: ['valuation', 'comps', 'range'],
  access: 'paid',
  minutes: 6,
  headline: '*',
  conventions: ['C3', 'E2', 'D9', 'B2'],
  teaches: ['applied-range'],
  uses: ['go-to', 'arrow-keys', 'ctrl-enter-fill', 'f4-anchor', 'formula-operators', 'cross-sheet-ref', 'link-colour-convention', 'enterprise-to-equity', 'bold-italic-underline', 'shift-arrow'],
  prerequisites: ['operating-multiples'],
  brief: 'A range of multiples times Clearcoat’s EBITDA is a range of enterprise values: low, median, high. That’s the comps row of the football field, and it’s the first place the buyers will anchor. Build it for all three multiples, in one block that reads the statistics block. Trading multiples price minority stakes, and a control buyer pays more, which is where precedents come in. The key is `*`.',
  goals: [
    { id: 'mult', teach: 'A multiple and the figure it multiplies cover the same period, so an LTM multiple belongs on LTM EBITDA. Clearcoat’s row uses FY26E as the proxy, flagged in AA17: this set carries no forward estimates. The block reads the statistics block, so it follows every flag.',
      text: `The EV / EBITDA range: C${R('rgMult')}:E${R('rgMult')} read O13, O11 and O14, and C${R('rgEV')}:E${R('rgEV')} ${F('C' + R('rgEV'))} across.`,
      keys: `${readAcross('rgMult')} ${fillAcross('rgEV')}`, requires: ['applied-range', 'go-to', 'arrow-keys', 'ctrl-enter-fill', 'f4-anchor'], convention: 'C3',
      hintStuck: `pulse range C${R('rgMult')}:E${R('rgEV')} · $J$17 is Clearcoat’s EBITDA, anchored so it holds across the row.`,
      check: (s, ses) => settled(ses) && multOk(ses) && liveOn(ses, 'D' + R('rgEV'), 'C5') },
    { id: 'sites', text: `The same on EV per site: C${R('rgSiteMult')}:E${R('rgSiteMult')} read Y13, Y11 and Y14, and C${R('rgSiteEV')}:E${R('rgSiteEV')} ${F('C' + R('rgSiteEV'))} across.`,
      keys: `${readAcross('rgSiteMult')} ${fillAcross('rgSiteEV')}`, requires: ['applied-range', 'go-to', 'arrow-keys', 'ctrl-enter-fill', 'f4-anchor'],
      hintStuck: `pulse range C${R('rgSiteMult')}:E${R('rgSiteEV')} · EV per site is in millions, so times a thousand brings it back to thousands.`,
      check: (s, ses) => settled(ses) && siteOk(ses) && liveOn(ses, 'D' + R('rgSiteEV'), 'R5') },
    { id: 'washes', text: `And on EV per wash: C${R('rgWashMult')}:E${R('rgWashMult')} read Z13, Z11 and Z14, and C${R('rgWashEV')}:E${R('rgWashEV')} ${F('C' + R('rgWashEV'))} across.`,
      keys: `${readAcross('rgWashMult')} ${fillAcross('rgWashEV')}`, requires: ['applied-range', 'go-to', 'arrow-keys', 'ctrl-enter-fill', 'f4-anchor'],
      hintStuck: `pulse range C${R('rgWashMult')}:E${R('rgWashEV')} · Dollars a wash times thousands of washes is thousands of dollars.`,
      check: (s, ses) => settled(ses) && washOk(ses) && liveOn(ses, 'D' + R('rgWashEV'), 'S5') },
    { id: 'equity', teach: 'Enterprise value belongs to everyone who funds the business; the owners get what is left after net debt (5.6.5). The same net debt comes off each range, linked green from the DCF page.',
      text: `Net debt in C${R('rgNetDebt')}:E${R('rgNetDebt')} ${F('C' + R('rgNetDebt'))}, then each equity range in rows ${R('rgEq')} to ${R('rgEqWash')}: its EV plus that row.`,
      keys: `${fillAcross('rgNetDebt')} ${fillAcross('rgEq')} ↓ Shift+→ ×2 ${q(F('C' + R('rgEqSite')))} Ctrl+↵ ↓ Shift+→ ×2 ${q(F('C' + R('rgEqWash')))} Ctrl+↵`,
      requires: ['enterprise-to-equity', 'cross-sheet-ref', 'link-colour-convention', 'ctrl-enter-fill', 'shift-arrow'], convention: 'B2',
      hintStuck: `pulse range C${R('rgNetDebt')}:E${R('rgEqWash')} · Net debt is negative here, so each equity line adds it.`,
      check: (s, ses) => settled(ses) && eqOk(ses) && liveOn(ses, 'D' + R('rgEq'), 'C5') },
    { id: 'bold', teach: 'The block prints the way the book does: USD millions to one decimal from the format, and the median bold, because the median is the number the page leads with.',
      text: `Bold the median column, D${R('rgMult')}:D${R('rgEqWash')}, with Ctrl+B.`,
      keys: `Ctrl+G "Comps!D${R('rgMult')}:D${R('rgEqWash')}" ↵ Ctrl+B`, requires: ['bold-italic-underline', 'go-to'], convention: 'D9',
      hintStuck: `pulse range D${R('rgMult')}:D${R('rgEqWash')} · The totals are bold already; the rest follow.`,
      check: (s, ses) => settled(ses) && boldOk(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Comps!N9" Enter "1" Enter Ctrl+G "Comps!D45" Enter', cadence: 360 },
      text: `Does it tie? Watch Harbor’s flag in N9 go from 0 to 1: the median falls, and the whole range in C${R('rgMult')}:E${R('rgEqWash')} moves with it.`, requires: [],
      hintStuck: `pulse range C${R('rgEV')}:E${R('rgEV')} · The block reads the statistics, the statistics read the flags.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Low, median and high on three multiples, each times Clearcoat’s own figure', check: (s, ses) => multOk(ses) && siteOk(ses) && washOk(ses) },
    { text: 'The equity range is each EV range less the same net debt', check: (s, ses) => eqOk(ses) },
    { text: 'The median column is bold', check: (s, ses) => boldOk(ses) },
  ],
  closing: [
    'The first range on the board’s page came from six companies and a median.',
    'Best practice: the range block reads the statistics block and never retypes a multiple, so a flag flipped on the set reaches the board’s page by itself.',
  ],
};
LESSON.solution = solutionOf(LESSON.goals);
export default LESSON;
