// Chapter 6 · 6.5.A Assessment: raw comps and bids in, the board's page out, fifteen minutes (seeded over B6A; also the test-out)
// A second fresh set on the cut-back pack. The precedents and the LBO arrive finished, as do each
// peer's last twelve months and its operating line; the comps spread and range, the three bids and
// their waterfalls, and the Summary are empty (formats kept). The seed sets fresh odds on Bids (each
// bid's certainty and bid B's earnout odds), so which bid leads moves run to run and the route never
// depends on the numbers: each goal accepts the finished pack's formula, or any formula landing on
// the figure the finished pack gives on the learner's own odds.
import { parsFrom } from '../../app/pars.js';
import { packBuild, part, joined } from './lib/pack-build.js';
import { sheetIn, liveVia, toScript, quoted, cellAt } from './lib/bids-checks.js';

/** The blocks the learner builds: the comps spread (not each peer's LTM or operating line) and range, Bids, the Summary. */
const COMPS_COLS = ['E', 'H', 'K', 'L', 'M', 'O', 'P', 'Q'];
const builds = b => (b.sheet === 'Comps' ? (b.r2 <= 13 && COMPS_COLS.includes(b.range.match(/^[A-Z]+/)[0])) || b.r1 >= 35 : b.sheet === 'Bids' || b.sheet === 'Summary');
const LEARNER = new Set(['Comps!N5', 'Comps!N6', 'Comps!N7', 'Summary!A2', 'Summary!C18', 'Summary!B33']);
/** The odds the seed writes on Bids: ref → [low, high] in percent, in steps of five points. */
const ODDS = { C21: [80, 95], D21: [80, 95], E21: [65, 85], C58: [40, 90] };
const SEEDED = Object.keys(ODDS).map(r => 'Bids!' + r);
const PACK = packBuild({ before: 'B6A', after: 'B6AD', learner: t => LEARNER.has(`${t.sheet}!${t.ref}`), builds, leave: ['Summary!#gridlines'], seeded: SEEDED });

/** The seed: fresh odds on Bids (content only). */
export function freshOdds(rng) {
  const p = {};
  for (const [ref, [lo, hi]] of Object.entries(ODDS)) p['Bids!' + ref] = { ...cellAt('B6AD', 'Bids', ref), value: (lo + Math.floor(rng() * ((hi - lo) / 5 + 1)) * 5) / 100 };
  return p;
}
/** The finished pack on the odds the learner's Bids hold now. */
const want = ses => { const b = sheetIn(ses, 'Bids'); return PACK.finished(Object.fromEntries(Object.keys(ODDS).map(r => ['Bids!' + r, { ...cellAt('B6AD', 'Bids', r), value: b.value(r) }]))); };

/** The bid that leads on expected value on the learner's Bids, as its letter. */
const leader = ses => { const b = sheetIn(ses, 'Bids'); const v = ['C', 'D', 'E'].map(c => b.value(c + 22)); return 'ABC'[v.indexOf(Math.max(...v))]; };
const PICK = '=MID("ABC",MATCH(MAX(Bids!$C$22:$E$22),Bids!$C$22:$E$22,0),1)';
const picked = ses => { const sh = sheetIn(ses, 'Summary'); return String(sh.value('C18') || '').toUpperCase() === leader(ses); };
const pageDone = ses => { const sh = sheetIn(ses, 'Summary'); return sh.gridlines === false; };
const flagsIn = ses => { const sh = sheetIn(ses, 'Comps'); return [5, 6, 7].every(r => sh.value('N' + r) === 1); };
const noC18 = p => ({ blocks: p.blocks, typed: p.typed.filter(t => t.ref !== 'C18') });

const PARTS = [
  { id: 'comps-ev', of: c => part(c, 'Comps', 5, 7, ['E', 'H', 'K', 'L', 'M']), text: 'Build each peer’s market value, enterprise value and multiples on Comps, columns E to M.',
    requires: ['formula-basics', 'iferror-function'] },
  { id: 'comps-stats', of: c => joined(part(c, 'Comps', 5, 7, ['N', 'O', 'P', 'Q']), part(c, 'Comps', 8, 13)), also: flagsIn,
    text: 'Mark all three peers in with 1 in Comps N5:N7, then build the included multiples and their statistics in rows 8 to 13.', requires: ['if-function', 'large-small-rank', 'min-max-cap'] },
  { id: 'comps-range', of: c => part(c, 'Comps', 35, 44), text: 'Build the comps range on Comps, rows 35 to 44: the multiples low, mid and high, enterprise value and equity value each way.',
    requires: ['enterprise-to-equity', 'cross-sheet-ref'] },
  { id: 'bids-price', of: c => joined(part(c, 'Bids', 11, 20), part(c, 'Bids', 59, 61)), text: 'Price the three bids on Bids, rows 11 to 20: cash at close, the earnout and the rollover each valued.',
    requires: ['bid-pricing', 'cross-sheet-ref'] },
  { id: 'bids-rank', of: c => part(c, 'Bids', 22, 27), text: 'Weigh each bid by its certainty in Bids row 22, then rank the bids by headline, priced and expected value in rows 25 to 27.',
    requires: ['bid-pricing', 'large-small-rank'] },
  { id: 'waterfall', of: c => part(c, 'Bids', 30, 39), text: 'Build each bid’s waterfall in Bids rows 30 to 39, from enterprise value to every owner’s proceeds, with its check.',
    requires: ['proceeds-waterfall'] },
  { id: 'stake', of: c => part(c, 'Bids', 42, 43), text: 'Value your options under each bid in Bids rows 42 and 43.',
    requires: ['option-value'] },
  { id: 'field', of: c => part(c, 'Summary', 9, 15), text: 'Link the football field on Summary, C9:E15, and read each mid against the DCF’s in F9:F15.',
    requires: ['football-field', 'cross-sheet-ref', 'relative-absolute'] },
  { id: 'pick', of: c => noC18(part(c, 'Summary', 18, 29)), pre: `Ctrl+G "Summary!C18" ↵ ${quoted(PICK)} ↵`, also: picked,
    text: 'Name the bid that leads on expected value in Summary C18, then pull its waterfall and your stake into C19:C29.', requires: ['index-match', 'football-field'] },
  { id: 'page', of: c => joined(part(c, 'Summary', 1, 6), part(c, 'Summary', 33, 33)), post: 'Alt W V G', also: pageDone,
    text: 'Give the Summary its title in A1, units in A2, the flag and date in C5:C6, a line in B33, and turn the gridlines off.', requires: ['page-anatomy', 'gridlines', 'cross-sheet-ref'] },
  { id: 'checks', of: c => part(c, 'Summary', 36, 39), text: 'Fill the checks in Summary C36:C39 until each reads 0.',
    requires: ['check-cell', 'cross-sheet-ref'] },
];
const REQ = p => ['go-to', 'ctrl-enter-fill', ...p.requires];
const GOALS = PARTS.map(p => ({ ...PACK.goal({ ...p, convention: ['checks', 'page'].includes(p.id) ? 'F1' : 'C3' }, want), requires: REQ(p) }));

export const GRADERS = [
  ses => GOALS.slice(0, 3).every(g => g.check(null, ses)) ? { ok: true } : { ok: false, why: 'the comps do not reach the finished figures. Each multiple reads enterprise value over its own line, the statistics read only the included peers, and the range reads the statistics' },
  ses => GOALS.slice(3, 7).every(g => g.check(null, ses)) ? { ok: true } : { ok: false, why: 'a bid is not priced on these odds. Price each part, weigh it by its certainty, then run each bid down its waterfall to the owners' },
  ses => GOALS.slice(7).every(g => g.check(null, ses)) && liveVia(ses, 'Summary', 'D14', ['Bids!C58']) ? { ok: true } : { ok: false, why: 'the board’s page does not read live from the pack, or does not name the bid that leads on these odds' },
];

export default {
  id: 'ch6-assessment',
  chapter: 'valuation',
  section: 'Project and assessment',
  module: 'ch6-project-and-assessment',
  workbook: 'clearcoat-valuation',
  state: { before: 'B6A' },
  get plant() { return PACK.plant(); },
  kind: 'assessment',
  title: 'Assessment: raw comps and bids in, the board’s page out',
  difficulty: 'hard',
  tags: ['assessment', 'comps', 'bids', 'waterfall', 'football field'],
  access: 'paid',
  minutes: 15,
  headline: 'Ctrl+Enter',
  conventions: ['C3', 'F1'],
  uses: [...new Set(GOALS.flatMap(g => g.requires))],
  prerequisites: ['ch6-project'],
  brief: 'A fresh set: the precedents and the LBO are done, the comps spread and three bids are raw, and the odds are new. Spread the comps, price the bids and their waterfalls, then build the board’s page with every link live. No help, the keyboard only. Pass, and the last chapter is Verified; this is also the test-out. The key is `Ctrl+Enter`.',
  wow: 'Raw comps and three bids in, the board’s page out, on the clock, and the program is yours.',
  timeLimit: 900,
  pars: parsFrom(420, { pass: 900, pro: 600 }),
  seed: freshOdds,
  goals: [...GOALS,
    { id: 'odds', closer: true, demo: { script: 'Ctrl+G "Bids!C58" Enter "95" Enter Ctrl+G "Summary!D14" Enter', cadence: 360 },
      text: 'Does it hold? Watch bid B’s earnout odds in Bids C58 go to 95%: its line on the football field moves with them.', requires: [],
      check: (s, ses) => ses.demoDone.has('odds') }],
  graders: GRADERS,
  closing: [
    'Fresh peers, fresh odds, and fifteen minutes later the board has its page: the comps spread, three bids priced to the owners’ proceeds, the leading one named, every figure live.',
    'That is the pack a sell side team puts in front of a board, and you built it under a clock.',
  ],
  get solution() { return toScript(GOALS.map(g => g.keys).join(' ')); },
};
