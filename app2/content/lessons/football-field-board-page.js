// Chapter 6 · 6.4.4 The football-field table and the one-page summary for the board (clearcoat-valuation, B644 → DONE)
// Summary holds its labels and headers; every figure, the title, the units line, the source line
// and the checks wait, formatted (links green, the recommendation blue). The learner links the
// football field (comps, precedents, the DCF's range, the LBO ceiling, the three bids), reads each
// mid against the DCF's, picks the recommended bid and pulls its waterfall with MATCH and INDEX,
// writes the one line a person writes, gives the page its anatomy and its checks. Links are graded
// on the cell they read and the figure they show; the board's page answers a change on Bids.
import { settled, built, linked, reads, liveVia, sheetIn, formulaAt, R, plantFrom, toScript, quoted } from './lib/bids-checks.js';

const S = 'Summary';
const row = key => R(S, key);
const F = ref => formulaAt('DONE', S, ref);
const at = (key, col = 'C') => col + row(key);
const LMH = ['C', 'D', 'E'];
const BID_ROWS = ['ffA', 'ffB', 'ffC'];
const WF = ['wEV', 'wND', 'wEq', 'wFees', 'wPool', 'wProceeds', 'w1', 'w2', 'w3', 'wYou'];
const CHECKS = [36, 37, 38, 39].map(r => 'C' + r);
const TITLE = F('A1');
const UNITS = 'USD millions unless stated; every figure links to the page that built it; the waterfall in USD thousands';
const SOURCE = 'Comps, Precedents, DCF, LBO and Bids build every figure here; the Cover carries the model\'s checks. Prints portrait on one page.';
const RECOMMEND = 'Recommend bid A: the lowest headline, but the highest expected value once the earnout and the financing condition are priced, and all of it cash at close.';
const across = key => `Ctrl+G "${S}!${at(key)}" ↵ ` + LMH.map(c => quoted(F(at(key, c)))).join(' Tab ') + ' ↵';
const fillRow = key => `Ctrl+G "${S}!${at(key)}:${at(key, 'E')}" ↵ ${quoted(F(at(key)))} Ctrl+↵`;
const down = keys => `Ctrl+G "${S}!${at(keys[0])}" ↵ ` + keys.map(k => quoted(F(at(k))) + ' ↵').join(' ↓ ');
const srcOf = ref => { const m = /^=(\w+)!\$?([A-Z]+)\$?(\d+)$/.exec(F(ref)); return m ? `${m[1]}!${m[2]}${m[3]}` : null; };
const links = keys => [].concat(keys).flatMap(k => LMH.map(c => at(k, c)));

const ok = {
  compsPrec: ses => links(['ffComps', 'ffPrec']).every(ref => linked(ses, S, ref, srcOf(ref))),
  dcfLbo: ses => built(ses, S, links(['ffDcf', 'ffLbo'])) && reads(sheetIn(ses, S), at('ffDcf'), [`DCF!D${R('DCF', 'sm0')}`]) && links('ffLbo').every(ref => linked(ses, S, ref, srcOf(ref))),
  bids: ses => links(BID_ROWS).every(ref => linked(ses, S, ref, srcOf(ref))),
  where: ses => built(ses, S, ['ffComps', 'ffPrec', 'ffDcf', 'ffLbo', ...BID_ROWS].map(k => at(k, 'F'))),
  pick: ses => { const sh = sheetIn(ses, S); return !sh.formula(at('recBid')) && String(sh.value(at('recBid')) || '').toUpperCase() === 'A' && built(ses, S, [at('recIdx')]); },
  waterfall: ses => built(ses, S, WF.map(k => at(k))) && WF.every(k => reads(sheetIn(ses, S), at(k), [at('recIdx')])),
  recommend: ses => { const sh = sheetIn(ses, S); const v = sh.value(at('recText')); return !sh.formula(at('recText')) && typeof v === 'string' && v.trim().length >= 20; },
  anatomy: ses => { const sh = sheetIn(ses, S); const t = sh.value('A1'), u = sh.value('A2'), src = sh.value('B33');
    return reads(sh, 'A1', [`Inputs!C${R('Inputs', 'company')}`]) && typeof t === 'string' && /valuation summary/i.test(t) && typeof u === 'string' && /USD/.test(u) && !sh.formula('A2')
      && typeof src === 'string' && src.trim().length >= 20 && !sh.formula('B33') && sh.gridlines === false
      && linked(ses, S, at('flag'), `Cover!C${R('Cover', 'flag')}`) && linked(ses, S, at('asOf'), `Inputs!C${R('Inputs', 'valDate')}`); },
  checks: ses => built(ses, S, CHECKS) && CHECKS.every(ref => sheetIn(ses, S).value(ref) === 0) && reads(sheetIn(ses, S), 'C36', ['Checks!C14']) && reads(sheetIn(ses, S), 'C37', ['Cover!C7'])
    && reads(sheetIn(ses, S), 'C38', ['C9', 'E15']) && reads(sheetIn(ses, S), 'C39', ['C25', 'C26', 'C27', 'C28']),
};
const KEYS = {
  compsPrec: `${fillRow('ffComps')} ${fillRow('ffPrec')}`,
  dcfLbo: `${across('ffDcf')} ${fillRow('ffLbo')}`,
  bids: BID_ROWS.map(across).join(' '),
  where: `Ctrl+G "${S}!F${row('ffComps')}:F${row('ffC')}" ↵ ${quoted(F(at('ffComps', 'F')))} Ctrl+↵`,
  pick: `Ctrl+G "${S}!${at('recBid')}" ↵ "A" ↵ ↓ ${quoted(F(at('recIdx')))} ↵`,
  waterfall: down(WF),
  recommend: `Ctrl+G "${S}!${at('recText')}" ↵ ${quoted(RECOMMEND)} ↵`,
  anatomy: `Ctrl+G "${S}!A1" ↵ ${quoted(TITLE)} ↵ ↓ ${quoted(UNITS)} ↵ Ctrl+G "${S}!${at('flag')}" ↵ ${quoted(F(at('flag')))} ↵ ↓ ${quoted(F(at('asOf')))} ↵ Ctrl+G "${S}!B33" ↵ ${quoted(SOURCE)} ↵ Alt W V G`,
  // the checks block is not keyed: its four formulas typed down from C36
  checks: `Ctrl+G "${S}!C36" ↵ ` + CHECKS.map(ref => quoted(F(ref)) + ' ↵').join(' ↓ '),
};

export default {
  id: 'football-field-board-page',
  chapter: 'valuation',
  section: 'The bids and the waterfall',
  module: 'bids-and-waterfall',
  workbook: 'clearcoat-valuation',
  state: { before: 'B644', after: 'DONE' },
  get plant() { return plantFrom('B644', 'DONE', { leave: [`${S}!#gridlines`] }); },
  title: 'The football-field table and the one-page summary for the board',
  difficulty: 'hard',
  tags: ['valuation', 'football field', 'summary', 'board'],
  access: 'paid',
  minutes: 9,
  headline: 'Ctrl+PgDn',
  conventions: ['B2', 'G2', 'C5', 'F1', 'A3'],
  teaches: ['football-field'],
  uses: ['cross-sheet-ref', 'summary-links', 'min-max-cap', 'f4-anchor', 'relative-absolute', 'ctrl-enter-fill', 'match-function', 'index-function', 'dynamic-title', 'source-line', 'page-anatomy', 'gridlines', 'check-cell', 'round-function', 'sumproduct', 'if-function', 'tab-commits', 'arrow-keys', 'keytips', 'go-to'],
  prerequisites: ['your-stake'],
  brief: 'The football field puts every valuation range on one line each: comps, precedents, the DCF, the LBO ceiling and the three bids, low, mid and high, as a table, so the board sees in one look where the bids sit against every method. Under it go the waterfall for the recommended bid and one line of recommendation. Every figure on the page is a link to the sheet that built it, a Ctrl+PgDn away. The key is `Ctrl+PgDn`.',
  goals: [
    { id: 'comps-prec', teach: 'A football field is every method’s range on its own line, low, mid and high, all in enterprise value. Each line links the range block of the page that built it, so the board’s page never holds a typed figure.',
      text: `On Summary, link the comps range to ${at('ffComps')}:${at('ffComps', 'E')} and the precedents range to row ${row('ffPrec')}.`,
      keys: KEYS.compsPrec, requires: ['football-field', 'cross-sheet-ref', 'summary-links', 'relative-absolute', 'ctrl-enter-fill', 'go-to'], convention: 'B2',
      hintStuck: `pulse range ${at('ffComps')}:${at('ffPrec', 'E')} · Comps row ${R('Comps', 'rgEV')} and Precedents row ${R('Precedents', 'rgEV')} hold each low, median and high.`,
      check: (s, ses) => settled(ses) && ok.compsPrec(ses) },
    { id: 'dcf-lbo', teach: 'The DCF’s range is its exit-multiple sensitivity grid, lowest to highest, with the page’s enterprise value as the mid. The LBO line is what the sponsor can pay at three hurdles: a ceiling, not a valuation.',
      text: `Row ${row('ffDcf')}: the DCF grid’s MIN, enterprise value and MAX; row ${row('ffLbo')}: the LBO’s top prices from LBO row ${R('LBO', 'topEV')}.`,
      keys: KEYS.dcfLbo, requires: ['football-field', 'min-max-cap', 'cross-sheet-ref', 'tab-commits', 'ctrl-enter-fill', 'go-to'], convention: 'B2',
      hintStuck: `pulse range ${at('ffDcf')}:${at('ffLbo', 'E')} · The exit grid is DCF D${R('DCF', 'sm0')}:H${R('DCF', 'sm4')} and the enterprise value DCF C${R('DCF', 'ev')}.`,
      check: (s, ses) => settled(ses) && ok.dcfLbo(ses) },
    { id: 'bids', text: `Link each bid’s expected, priced and headline value from Bids into rows ${row('ffA')} to ${row('ffC')}, low to high.`,
      keys: KEYS.bids, requires: ['cross-sheet-ref', 'f4-anchor', 'tab-commits', 'go-to'], convention: 'B2',
      hintStuck: `pulse range ${at('ffA')}:${at('ffC', 'E')} · Bid A is Bids column C: row ${R('Bids', 'expected')}, row ${R('Bids', 'priced')}, then row ${R('Bids', 'headline')}.`,
      check: (s, ses) => settled(ses) && ok.bids(ses) && liveVia(ses, S, at('ffB', 'D'), [`Bids!C${R('Bids', 'earnProb')}`]) },
    { id: 'where', teach: 'One ratio says where each line sits: its mid over the DCF’s mid. A bid at 95% of the DCF is a bid below what the cash flows say the business is worth.',
      text: `Show where each line sits in F${row('ffComps')}:F${row('ffC')}: ${F(at('ffComps', 'F'))}, entered with Ctrl+Enter.`,
      keys: KEYS.where, requires: ['football-field', 'f4-anchor', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range F${row('ffComps')}:F${row('ffC')} · The DCF’s mid, D${row('ffDcf')}, anchored with F4.`,
      check: (s, ses) => settled(ses) && ok.where(ses) },
    { id: 'pick', teach: 'The waterfall shows one bid, the one recommended. MATCH finds that bid’s column on Bids from its letter, so changing one typed letter changes the whole block.',
      text: `Type A in ${at('recBid')} for the recommended bid, then find its column in ${at('recIdx')}: ${F(at('recIdx'))}.`,
      keys: KEYS.pick, requires: ['match-function', 'cross-sheet-ref', 'arrow-keys', 'go-to'], convention: 'B1',
      hintStuck: `pulse range ${at('recBid')}:${at('recIdx')} · The headers on Bids row 4 read Bid A, Bid B and Bid C.`,
      check: (s, ses) => settled(ses) && ok.pick(ses) },
    { id: 'waterfall', text: `Pull the recommended bid’s waterfall into ${at('wEV')}:${at('wYou')} with INDEX on ${at('recIdx')}, starting ${F(at('wEV'))}.`,
      keys: KEYS.waterfall, requires: ['index-function', 'cross-sheet-ref', 'f4-anchor', 'arrow-keys', 'go-to'], convention: 'B2',
      hintStuck: `pulse range ${at('wEV')}:${at('wYou')} · Each line reads its own row of the Bids waterfall, and your options are Bids row ${R('Bids', 'yourVal')}.`,
      check: (s, ses) => settled(ses) && ok.waterfall(ses) },
    { id: 'recommend', teach: 'The recommendation is the one place on the page a person wrote, so it is typed, in blue, in one sentence. Everything above it is a link the board can follow.',
      text: `Type the recommendation in ${at('recText')}, one sentence: bid A, the lowest headline, has the highest expected value and is all cash at close.`,
      keys: KEYS.recommend, requires: ['go-to'], convention: 'B1',
      hintStuck: `pulse cell ${at('recText')} · Say which bid and why, in the words the board uses.`,
      check: (s, ses) => settled(ses) && ok.recommend(ses) },
    { id: 'anatomy', teach: 'The page has the anatomy every page in the pack has: a title from Inputs, a units line, the model’s checks flag from the Cover, a source line under the table, and no gridlines on a page someone reads.',
      text: `Title A1 from Inputs, units in A2, the Cover’s flag and the valuation date in ${at('flag')}:${at('asOf')}, the source in B33, gridlines off.`,
      keys: KEYS.anatomy, requires: ['page-anatomy', 'dynamic-title', 'source-line', 'gridlines', 'cross-sheet-ref', 'keytips', 'arrow-keys', 'go-to'], convention: 'G2',
      hintStuck: `pulse cell A1 · ${TITLE}; Alt, W, V, G turns the gridlines off.`,
      check: (s, ses) => settled(ses) && ok.anatomy(ses) },
    { id: 'checks', text: 'Fill the checks block in C36:C39: sources equal uses from Checks, the Cover’s flag, the ranges in order, the owners’ lines.',
      keys: KEYS.checks, requires: ['check-cell', 'cross-sheet-ref', 'if-function', 'sumproduct', 'round-function', 'arrow-keys', 'go-to'], convention: 'F1',
      hintStuck: `pulse range C36:C39 · ${F('C36')}, then ${F('C37')}; each reads zero when the page ties.`,
      check: (s, ses) => settled(ses) && ok.checks(ses) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "Bids!C${R('Bids', 'earnProb')}" Enter "90" Enter Ctrl+G "${S}!${at('ffB', 'D')}" Enter`, cadence: 360 },
      text: `Does it tie? Watch bid B’s earnout odds on Bids go to 90%: bid B’s line on the football field, row ${row('ffB')}, answers on the board’s page.`, requires: [],
      hintStuck: `pulse range ${at('ffB')}:${at('ffB', 'F')} · Every figure on the page is a link, so a change on Bids reaches it at once.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The football field links every method’s range and every bid, and reads each against the DCF', check: (s, ses) => ok.compsPrec(ses) && ok.dcfLbo(ses) && ok.bids(ses) && ok.where(ses) },
    { text: 'The recommended bid’s waterfall, the recommendation, the page’s anatomy and its checks are in place', check: (s, ses) => ok.pick(ses) && ok.waterfall(ses) && ok.recommend(ses) && ok.anatomy(ses) && ok.checks(ses) },
  ],
  closing: [
    'Every method and every bid on one page, and the board can see where the money is.',
    'Best practice: green on every link, and one sentence in blue. The board will ask where a number came from, and the answer is always one Ctrl+[ away.',
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
};
