// Practice · Formulas — Text split (screenplay 6.2; script-drills D59). The POS export (state S6d) with
// its split columns emptied: the cluster and the site out of the code in B (the site through TRIM, so a
// stray trailing space never reaches it), the position of the @ in the memo, then the site and the
// channel out of the memo with MID and FIND. Graded on the databook's figures on the learner's cells, the function each column names,
// and the last two columns written as one formula each that reads no helper column.
import { databookDrill, emptied, refsOf, built, callsAll, liveVia, reads, sheetIn, settled, fillFrom, toScript } from './databook-drills.js';

const T = 'Transactions';
const COL = { cluster: 'S', site: 'T', at: 'U', fromMemo: 'V', channel: 'W' };
const PARTS = Object.fromEntries(Object.entries(COL).map(([id, c]) => [id, refsOf(`${c}5:${c}94`)]));
const FNS = { cluster: ['LEFT'], site: ['RIGHT', 'TRIM'], at: ['FIND'], fromMemo: ['MID', 'FIND'], channel: ['MID', 'FIND'] };
const ok = id => ses => built(ses, T, PARTS[id]) && callsAll(ses, T, PARTS[id], FNS[id]);
/** The memo columns read the memo itself, never the helper position in U. */
const noHelper = ses => { const sh = sheetIn(ses, T); return [...PARTS.fromMemo, ...PARTS.channel].every(ref => !reads(sh, ref, ['U' + ref.slice(1)])); };
const KEYS = Object.fromEntries(Object.entries(COL).map(([id, c]) => [id, fillFrom(T, `${c}5:${c}94`)]));

export default databookDrill({
  id: 'ch3-text-split',
  title: 'Text split',
  task: 'Split the site codes and the memos with LEFT, RIGHT, MID and FIND: formulas, not typed text.',
  module: 'text',
  state: { before: 'S6d' },
  plant: () => emptied(T, Object.values(PARTS).flat()),
  goals: [
    { id: 'cluster', text: 'Transactions S5:S94: the cluster, the first three characters of the code in B, with LEFT.', keys: KEYS.cluster,
      check: (s, ses) => settled(ses) && ok('cluster')(ses) },
    { id: 'site', text: 'Transactions T5:T94: the site, the last three characters of B with RIGHT around TRIM.', keys: KEYS.site,
      check: (s, ses) => settled(ses) && ok('site')(ses) },
    { id: 'at', text: 'Transactions U5:U94: where the @ sits in the memo in F, with FIND.', keys: KEYS.at,
      check: (s, ses) => settled(ses) && ok('at')(ses) },
    { id: 'fromMemo', text: 'Transactions V5:V94: the seven characters of site code after the @ and its space, with MID and FIND.', keys: KEYS.fromMemo,
      check: (s, ses) => settled(ses) && ok('fromMemo')(ses) && liveVia(ses, T, 'V5', ['F5']) },
    { id: 'channel', text: 'Transactions W5:W94: the channel between the parentheses, with MID and FIND.', keys: KEYS.channel,
      check: (s, ses) => settled(ses) && ok('channel')(ses) },
  ],
  endState: [
    { text: 'Every split column ties to the export as a formula, and the memo columns read no helper', check: (s, ses) => Object.keys(PARTS).every(id => ok(id)(ses)) && noHelper(ses) },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
  optimalKeys: 260,
  route: 75,
});
