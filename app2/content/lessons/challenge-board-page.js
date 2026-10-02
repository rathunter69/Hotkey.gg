// Chapter 6 · 6.4.C Challenge: a one-page valuation summary assembled (clearcoat-valuation, seeded over B64C)
// The pack is finished but for the board's page: Summary holds its labels and formats only. The seed
// sets fresh odds on Bids (each bid's certainty and bid B's earnout odds), so which bid leads on
// expected value moves run to run. The learner links the football field, reads each mid against the
// DCF's, names the leading bid and pulls its waterfall and the stake line, gives the page its anatomy
// and its checks. Every figure is graded on what it reads and the figure it shows on the learner's
// own Bids; the leading bid is graded against the expected values the seed left.
import { settled, built, linked, reads, liveVia, sheetIn, formulaAt, cellAt, R, plantFrom, toScript, quoted } from './lib/bids-checks.js';
import { parsFrom } from '../../app/pars.js';

const ID = 'challenge-board-page';
const S = 'Summary';
const row = key => R(S, key);
const F = ref => formulaAt('DONE', S, ref);
const at = (key, col = 'C') => col + row(key);
const LMH = ['C', 'D', 'E'];
const FIELD = ['ffComps', 'ffPrec', 'ffDcf', 'ffLbo', 'ffA', 'ffB', 'ffC'];
const WF = ['wEV', 'wND', 'wEq', 'wFees', 'wPool', 'wProceeds', 'w1', 'w2', 'w3'];
const CHECKS = [36, 37, 38, 39].map(r => 'C' + r);
const EXP = R('Bids', 'expected');
const PICK = `=MID("ABC",MATCH(MAX(Bids!$C$${EXP}:$E$${EXP}),Bids!$C$${EXP}:$E$${EXP},0),1)`;
const srcOf = ref => { const m = /^=(\w+)!\$?([A-Z]+)\$?(\d+)$/.exec(F(ref)); return m ? `${m[1]}!${m[2]}${m[3]}` : null; };
const across = key => `Ctrl+G "${S}!${at(key)}" ↵ ` + LMH.map(c => quoted(F(at(key, c)))).join(' Tab ') + ' ↵';
const fillRow = key => `Ctrl+G "${S}!${at(key)}:${at(key, 'E')}" ↵ ${quoted(F(at(key)))} Ctrl+↵`;
const down = (from, refs) => `Ctrl+G "${S}!${from}" ↵ ` + refs.map(ref => quoted(F(ref)) + ' ↵').join(' ↓ ');

/** The bid that leads on expected value on the learner's Bids, as its letter. */
const leader = ses => { const b = sheetIn(ses, 'Bids'); const v = ['C', 'D', 'E'].map(c => b.value(c + EXP)); return 'ABC'[v.indexOf(Math.max(...v))]; };
const ok = {
  field: ses => FIELD.every(k => (k === 'ffDcf' ? built(ses, S, LMH.map(c => at(k, c))) && reads(sheetIn(ses, S), at(k), [`DCF!D${R('DCF', 'sm0')}`]) : LMH.every(c => linked(ses, S, at(k, c), srcOf(at(k, c)))))),
  where: ses => built(ses, S, FIELD.map(k => at(k, 'F'))),
  pick: ses => { const sh = sheetIn(ses, S); return String(sh.value(at('recBid')) || '').toUpperCase() === leader(ses) && built(ses, S, [at('recIdx')]) && built(ses, S, WF.map(k => at(k))) && WF.every(k => reads(sh, at(k), [at('recIdx')])); },
  stake: ses => built(ses, S, [at('wYou')]) && reads(sheetIn(ses, S), at('wYou'), [at('recIdx'), `Bids!C${R('Bids', 'yourVal')}`]),
  anatomy: ses => { const sh = sheetIn(ses, S); const t = sh.value('A1');
    return reads(sh, 'A1', [`Inputs!C${R('Inputs', 'company')}`]) && typeof t === 'string' && /valuation summary/i.test(t) && /USD/.test(String(sh.value('A2') || '')) && sh.gridlines === false
      && linked(ses, S, at('flag'), `Cover!C${R('Cover', 'flag')}`); },
  checks: ses => { const sh = sheetIn(ses, S); return built(ses, S, CHECKS) && CHECKS.every(ref => sh.value(ref) === 0) && reads(sh, 'C36', ['Checks!C14']) && reads(sh, 'C37', ['Cover!C7']) && reads(sh, 'C38', ['C9', 'E15']) && reads(sh, 'C39', ['C25', 'C26', 'C27', 'C28']); },
};
const KEYS = {
  field: [fillRow('ffComps'), fillRow('ffPrec'), across('ffDcf'), fillRow('ffLbo'), across('ffA'), across('ffB'), across('ffC')].join(' '),
  where: `Ctrl+G "${S}!F${row('ffComps')}:F${row('ffC')}" ↵ ${quoted(F(at('ffComps', 'F')))} Ctrl+↵`,
  pick: `Ctrl+G "${S}!${at('recBid')}" ↵ ${quoted(PICK)} ↵ ↓ ${quoted(F(at('recIdx')))} ↵ ↓ ` + WF.map(k => quoted(F(at(k))) + ' ↵').join(' ↓ '),
  stake: `↓ ${quoted(F(at('wYou')))} ↵`,
  anatomy: `Ctrl+G "${S}!A1" ↵ ${quoted(F('A1'))} ↵ ↓ "USD millions unless stated; the waterfall in USD thousands" ↵ Ctrl+G "${S}!${at('flag')}" ↵ ${quoted(F(at('flag')))} ↵ Alt W V G`,
  checks: down('C36', CHECKS),
};

/** Fresh odds on Bids: each bid's certainty and bid B's earnout odds, in steps of five points (content only). */
function seed(rng) {
  const step = (lo, hi) => (lo + Math.floor(rng() * ((hi - lo) / 5 + 1)) * 5) / 100;
  const cell = ref => ({ ...cellAt('DONE', 'Bids', ref) });
  const p = {};
  const CERT = R('Bids', 'certainty');
  [['C', 80, 95], ['D', 80, 95], ['E', 65, 85]].forEach(([c, lo, hi]) => { p[`Bids!${c}${CERT}`] = { ...cell(c + CERT), value: step(lo, hi) }; });
  const odds = 'C' + R('Bids', 'earnProb');
  p['Bids!' + odds] = { ...cell(odds), value: step(40, 90) };
  return p;
}

export default {
  id: ID,
  chapter: 'valuation',
  section: 'The bids and the waterfall',
  module: 'bids-and-waterfall',
  workbook: 'clearcoat-valuation',
  state: { before: 'B64C' },
  get plant() { return { ...plantFrom('B64C', 'B644', { whole: true, sheets: [S] }), ...plantFrom('B644', 'DONE', { sheets: [S], leave: [`${S}!#gridlines`] }) }; },
  kind: 'challenge',
  title: 'Challenge: a one-page valuation summary assembled',
  difficulty: 'hard',
  tags: ['challenge', 'valuation', 'football field', 'waterfall'],
  access: 'paid',
  minutes: 3,
  conventions: ['B2', 'G2', 'F1'],
  prerequisites: ['football-field-board-page'],
  brief: 'Five ranges and three bids sit on other sheets, the odds are fresh, and the Summary holds only its labels. Link the football field, name the bid that leads on expected value and pull its waterfall and your stake, then give the page its anatomy and its checks.',
  timeLimit: 180,
  pars: parsFrom(120, { pass: 178, pro: 145 }),
  seed: rng => seed(rng),
  goals: [
    { id: 'field', text: `Link the football field in ${at('ffComps')}:${at('ffC', 'E')}: comps, precedents, the DCF’s range, the LBO ceiling and the three bids.`,
      keys: KEYS.field, check: (s, ses) => settled(ses) && ok.field(ses) },
    { id: 'where', text: `Read each line’s mid against the DCF’s in F${row('ffComps')}:F${row('ffC')}.`,
      keys: KEYS.where, check: (s, ses) => settled(ses) && ok.where(ses) },
    { id: 'pick', text: `Name the bid that leads on expected value in ${at('recBid')}, then pull its waterfall into ${at('recIdx')}:${at('w3')} with MATCH and INDEX.`,
      keys: KEYS.pick, check: (s, ses) => settled(ses) && ok.pick(ses) },
    { id: 'stake', text: `Add your options under that bid in ${at('wYou')}.`,
      keys: KEYS.stake, check: (s, ses) => settled(ses) && ok.stake(ses) },
    { id: 'anatomy', text: 'Title A1 from Inputs, a units line in A2, the Cover’s flag in C5, and the gridlines off.',
      keys: KEYS.anatomy, check: (s, ses) => settled(ses) && ok.anatomy(ses) },
    { id: 'checks', text: 'Fill the checks in C36:C39: sources equal uses, the Cover’s flag, the ranges in order, the owners’ lines.',
      keys: KEYS.checks, check: (s, ses) => settled(ses) && ok.checks(ses) },
  ],
  graders: [
    ses => ok.field(ses) && liveVia(ses, S, at('ffB', 'D'), [`Bids!C${R('Bids', 'earnProb')}`]) ? { ok: true } : { ok: false, why: 'a line of the football field is not a live link. Each low, mid and high reads the range block of the page that built it, and the bids read Bids' },
    ses => ok.where(ses) ? { ok: true } : { ok: false, why: 'the column beside the field does not read each mid over the DCF’s mid, anchored' },
    ses => ok.pick(ses) && ok.stake(ses) ? { ok: true } : { ok: false, why: 'the waterfall is not the leading bid’s. Read the expected values on Bids, then MATCH its column and INDEX each waterfall line from it' },
    ses => ok.anatomy(ses) && ok.checks(ses) ? { ok: true } : { ok: false, why: 'the page is missing part of its anatomy or a check. A title from Inputs, a units line, the flag, no gridlines, and four checks reading zero' },
  ],
  get solution() { return toScript(Object.values(KEYS).join(' ')); },
};
