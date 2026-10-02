// Chapter 5 · 5.7.C Challenge: the three benchmarks in one run (clearcoat-model, seeded over DONE)
// The finished model with a piece of each benchmark cut back: the rollout on Schedules holds its
// FY24 column only and total revenue is empty; the cost build holds its FY24 column only, its
// plain lines without the desk number format; the debt and revolver links on the cash flow are
// empty and black. The seed sets fresh Base drivers (new sites and washes a day, FY27 to FY31), so
// every figure is checked against the finished model run on the learner's own inputs.
import { stateOf, ROW, COLS } from '../workbooks/clearcoat-model.js';
import { settled, like, moves, rowRefs, formatted, carries, cfLinked, sheetIn, finished, DESK } from './lib/model-checks.js';
import { parsFrom } from '../../app/pars.js';

const ID = 'challenge-model-speed';
const S = 'Schedules';
const REV = ['openSites', 'newSites', 'closures', 'closeSites'], COST = ['cos', 'cosShare', 'labor', 'rent', 'util', 'maint', 'card', 'mkt', 'siteCosts', 'contrib', 'cm', 'ho', 'ebitda', 'em'];
const PLAIN = ['labor', 'rent', 'util', 'maint', 'card', 'mkt'];
const LINKS = ['termDrawn', 'termRepaid', 'ddDrawn', 'ddRepaid', 'rev'];
const SEEDED = ['F', 'G', 'H', 'I', 'J'].flatMap(c => [c + ROW.Inputs.bNew, c + ROW.Inputs.bWash]);
const NUM_FMT = ['fmtStyle', 'numFmt', 'decimals'];

let DONE_CELLS = null;
const doneCells = name => { DONE_CELLS = DONE_CELLS || stateOf('DONE'); return DONE_CELLS.sheets.find(s => s.name === name).cells; };
const without = (rec, keys) => Object.fromEntries(Object.entries(rec || {}).filter(([k]) => !keys.includes(k)));

/** The plant: a piece of each benchmark cut back, formats kept where the benchmark keeps them; and fresh Base drivers. */
function seed(rng) {
  const p = {}, sch = doneCells(S), cf = doneCells('CF'), inp = doneCells('Inputs');
  for (const key of [...REV, ...COST]) for (const col of COLS.slice(1)) p[`${S}!${col}${ROW[S][key]}`] = null;
  for (const col of COLS) p[`${S}!${col}${ROW[S].rev}`] = without(sch[col + ROW[S].rev], ['formula', 'value']);
  for (const key of PLAIN) p[`${S}!C${ROW[S][key]}`] = without(sch['C' + ROW[S][key]], NUM_FMT);
  for (const key of LINKS) for (const col of COLS) p[`CF!${col}${ROW.CF[key]}`] = without(cf[col + ROW.CF[key]], ['formula', 'value', 'fontColor']);
  const step = (lo, hi, by) => lo + Math.floor(rng() * (Math.round((hi - lo) / by) + 1)) * by;
  const sites = step(4, 8, 1), washes = step(230, 270, 5);
  ['F', 'G', 'H', 'I', 'J'].forEach(c => {
    p[`Inputs!${c}${ROW.Inputs.bNew}`] = { ...inp[c + ROW.Inputs.bNew], value: sites };
    p[`Inputs!${c}${ROW.Inputs.bWash}`] = { ...inp[c + ROW.Inputs.bWash], value: washes };
  });
  return p;
}

/** The finished model run on the drivers the learner's Inputs hold now. */
const want = ses => { const I = sheetIn(ses, 'Inputs'), inp = doneCells('Inputs'); return finished(Object.fromEntries(SEEDED.map(r => [`Inputs!${r}`, { ...inp[r], value: I.cells[r] ? I.cells[r].value : null }]))); };
const revenueOk = ses => like(ses, S, rowRefs(S, [...REV, 'rev']), want(ses)) && moves(ses, `${S}!J26`, 'Inputs!J21');
const costsOk = ses => like(ses, S, rowRefs(S, COST), want(ses)) && moves(ses, `${S}!J42`, 'Inputs!J22');
const deskOk = ses => formatted(sheetIn(ses, S), rowRefs(S, PLAIN), DESK);
const linksOk = ses => cfLinked(ses, LINKS) && moves(ses, 'CF!F20', 'Inputs!F75');
const greenOk = ses => carries(sheetIn(ses, 'CF'), rowRefs('CF', LINKS), 'fontColor', 'green');
const GREEN = 'Alt H F C Right Right Right Right Right Right Right Right Enter';

export default {
  id: ID,
  chapter: 'finance-and-accounting',
  section: 'Model speed',
  module: 'model-speed',
  workbook: 'clearcoat-model',
  state: { before: 'DONE' },
  kind: 'challenge',
  title: 'Challenge: the three benchmarks in one run',
  difficulty: 'hard',
  tags: ['challenge', 'model speed', 'fill right', 'linking', 'formats'],
  access: 'paid',
  minutes: 3,
  conventions: ['C3', 'B2'],
  prerequisites: ['keyboard-only-linking'],
  brief: 'Fresh Base drivers, and a piece of each benchmark cut back: the rollout and total revenue, the cost build and its format, the debt links on the cash flow. Put all three back before the clock runs out.',
  timeLimit: 180,
  pars: parsFrom(80, { pass: 175, pro: 120 }),
  seed: rng => seed(rng),
  goals: [
    { id: 'revenue', text: 'Fill the rollout C6:J9 on Schedules right, and total revenue in C26:J26 as =C22+C24+C25.',
      keys: 'Ctrl+G "Schedules!C6:J9" ↵ Ctrl+R Ctrl+G "Schedules!C26:J26" ↵ "=C22+C24+C25" Ctrl+↵',
      check: (s, ses) => settled(ses) && revenueOk(ses) },
    { id: 'costs', text: 'Fill the cost build C30:J43 right in one press.',
      keys: 'Ctrl+G "Schedules!C30:J43" ↵ Ctrl+R',
      check: (s, ses) => settled(ses) && costsOk(ses) },
    { id: 'desk', text: `Give the cost lines C32:J37 the desk number format, ${DESK}.`,
      keys: `Ctrl+G "Schedules!C32:J37" ↵ Ctrl+1 N Tab End Alt+T '${DESK}' ↵`,
      check: (s, ses) => settled(ses) && deskOk(ses) },
    { id: 'links', text: 'Link the debt on the cash flow: =Schedules!C80 into C18:J19, =Schedules!C90 into C20:J21 and the revolver into C24:J24.',
      keys: 'Ctrl+G "CF!C18:J19" ↵ "=Schedules!C80" Ctrl+↵ Ctrl+G "CF!C20:J21" ↵ "=Schedules!C90" Ctrl+↵ Ctrl+G "CF!C24:J24" ↵ "=Schedules!C101+Schedules!C102" Ctrl+↵',
      check: (s, ses) => settled(ses) && linksOk(ses) },
    { id: 'green', text: 'Color the new links green: C18:J21 through Font Color, then F4 on C24:J24.',
      keys: 'Ctrl+G "CF!C18:J21" ↵ Alt H F C → ×8 ↵ Ctrl+G "CF!C24:J24" ↵ F4',
      check: (s, ses) => settled(ses) && greenOk(ses) },
  ],
  graders: [
    ses => revenueOk(ses) ? { ok: true } : { ok: false, why: 'the revenue build does not reach the finished figures. Each rollout row fills right from FY24, and total revenue adds the three revenue lines, not the member count' },
    ses => costsOk(ses) && deskOk(ses) ? { ok: true } : { ok: false, why: 'the cost build is not filled right through FY31, or its plain lines lack the desk number format' },
    ses => linksOk(ses) ? { ok: true } : { ok: false, why: 'a debt link does not read its schedule. Each row reads the line in the same order on Schedules, and the revolver nets its draw and repayment' },
    ses => greenOk(ses) ? { ok: true } : { ok: false, why: 'a link is not green. A figure from another sheet is colored green so a reader sees where it comes from' },
  ],
  solution: 'Ctrl+G "Schedules!C6:J9" Enter Ctrl+R Ctrl+G "Schedules!C26:J26" Enter "=C22+C24+C25" Ctrl+Enter Ctrl+G "Schedules!C30:J43" Enter Ctrl+R '
    + `Ctrl+G "Schedules!C32:J37" Enter Ctrl+1 N Tab End Alt+T '${DESK}' Enter `
    + 'Ctrl+G "CF!C18:J19" Enter "=Schedules!C80" Ctrl+Enter Ctrl+G "CF!C20:J21" Enter "=Schedules!C90" Ctrl+Enter Ctrl+G "CF!C24:J24" Enter "=Schedules!C101+Schedules!C102" Ctrl+Enter '
    + `Ctrl+G "CF!C18:J21" Enter ${GREEN} Ctrl+G "CF!C24:J24" Enter F4`,
};
