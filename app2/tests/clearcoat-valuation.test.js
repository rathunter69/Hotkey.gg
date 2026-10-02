// app2/tests/clearcoat-valuation.test.js — the Chapter 6 workbook (clearcoat-valuation): the
// valuation pack on the Chapter 5 model. Every state builds, the five pages pass the sheet
// standard, the pack ties (sources equal uses live on Checks, every check row zero, the board page
// reads the model), the figures the script leans on come out as it says, the Chapter 5 states are
// untouched, and each lesson's start state holds what its goals need.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { sheetStandard } from '../app/graders.js';
import { WORKBOOKS } from '../content/workbooks/index.js';
import * as WB from '../content/workbooks/clearcoat-valuation.js';
import * as M from '../content/workbooks/clearcoat-model.js';

const build = sp => new Sheet({ rows: sp.rows, cells: JSON.parse(JSON.stringify(sp.cells)), colW: sp.colW, freeze: sp.freeze, gridlines: sp.gridlines, condFmt: sp.condFmt });
/** A live workbook from a state, as the runner assembles one. */
function session(id) {
  const st = WB.stateOf(id);
  const s = new Session(build(st.sheets[0]));
  s.renameSheet(0, st.sheets[0].name);
  for (const sh of st.sheets.slice(1)) s.addSheet(sh.name, build(sh), undefined, { recalc: false });
  Object.assign(s.settings, { iterative: !!st.settings.iterative, maxIterations: st.settings.maxIterations || 100, maxChange: st.settings.maxChange == null ? 0.001 : st.settings.maxChange });
  if (st.names && Object.keys(st.names).length) s.names = st.names; else s.recalcAll();
  return s;
}
const sh = (s, name) => s.sheets.find(e => e.name === name).sheet;
const R = WB.ROW, C6 = WB.COMPS_COLS, D6 = WB.DEAL_COLS;
const row = (s, name, key, cols, rows = R) => cols.map(c => sh(s, name).value(c + rows[name][key]));
const one = (s, name, key, col = 'C', rows = R) => sh(s, name).value(col + rows[name][key]);
const cell = (st, name, ref) => (st.sheets.find(x => x.name === name) || { cells: {} }).cells[ref];
const has = (st, name, key, col, rows = R) => !!cell(st, name, col + rows[name][key]);
const errors = s => { const out = []; for (const e of s.sheets) for (const k in e.sheet.cells) { const v = e.sheet.cells[k].value; if (typeof v === 'string' && /^#(REF|NAME|VALUE|DIV|N\/A|NUM)/.test(v)) out.push(e.name + '!' + k + ' ' + v); } return out; };
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const LCOLS = ['C', 'D', 'E', 'F', 'G', 'H'], YRS = LCOLS.slice(1);

test('the workbook is registered; every state builds as a workbook of real sheets; the pack sits after DCF; Chapter 5 is untouched', () => {
  assert.equal(WORKBOOKS['clearcoat-valuation'], WB);
  assert.equal(WB.CHAPTER, 6);
  const LIVE = new Set(['B63C', 'B6P', 'DONE']);   // these build live, as workbooks, in the tests below; every state's sheets build here (a whole workbook recalc is the slow part)
  for (const id of WB.STATE_ORDER) {
    const st = WB.stateOf(id);
    assert.ok(Array.isArray(st.sheets) && st.sheets.length, id + ' has sheets');
    for (const sp of st.sheets) {
      assert.ok(typeof sp.name === 'string' && sp.cells && typeof sp.cells === 'object', id + ' ' + sp.name);
      for (const k in sp.cells) { const c = sp.cells[k]; assert.ok(c && typeof c === 'object' && /^[A-Z]+\d+$/.test(k), `${id} ${sp.name}!${k}`); if (c.formula) assert.ok(c.formula.startsWith('='), `${id} ${sp.name}!${k} formula`); }
      if (!LIVE.has(id) && WB.PAGE_NAMES.includes(sp.name)) assert.doesNotThrow(() => build(sp), id + ' ' + sp.name);
    }
    assert.ok(WB.STATE_LESSONS[id], id + ' names its lesson');
  }
  const done = WB.stateOf('DONE');
  assert.deepEqual(done.sheets.map(s => s.name), WB.SHEET_ORDER);
  assert.deepEqual(done.sheets.slice(8, 13).map(s => s.name), WB.PAGE_NAMES, 'the five pages sit after DCF');
  assert.deepEqual(Object.keys(done.names), ['Case', 'LastHistorical', 'Circ', 'WACC']);
  assert.equal(done.settings.iterative, true, 'the LBO carries a circle of its own');
  // the Cover's map names the five pages; Sources equal uses is live on Checks, with no "pending" beside it
  const cover = Object.values(done.sheets[0].cells).map(c => c.value).filter(v => typeof v === 'string');
  for (const name of WB.PAGE_NAMES) assert.ok(cover.includes(name), 'the Cover maps ' + name);
  assert.match(cell(done, 'Checks', 'C' + M.ROW.Checks.su).formula, /^=ROUND\(LBO!C\d+-LBO!C\d+,2\)$/);
  assert.equal(cell(done, 'Checks', 'K' + M.ROW.Checks.su), undefined);
  // Chapter 5's own states have none of this
  const m = M.stateOf('DONE');
  assert.deepEqual(m.sheets.map(s => s.name), M.SHEET_ORDER);
  assert.equal(cell(m, 'Checks', 'K' + M.ROW.Checks.su).value, 'pending');
  assert.equal(cell(m, 'Checks', 'C' + M.ROW.Checks.su), undefined);
});

test('stateOf hands out clones', () => {
  const a = WB.stateOf('DONE'); a.sheets[0].cells.A1 = { value: 'x' };
  assert.notEqual(WB.stateOf('DONE').sheets[0].cells.A1.value, 'x');
});

test('every finished page passes the sheet standard for Chapter 6', () => {
  for (const [stateId, name, opts] of WB.STANDARD.pages) {
    const spec = WB.stateOf(stateId).sheets.find(s => s.name === name);
    assert.deepEqual(sheetStandard(new Sheet(spec), { chapter: 6, read: opts.read !== false }), [], stateId + ' ' + name);
  }
});

test('the finished pack ties: the model still balances, sources equal uses, every check reads zero, and the board page reads the model', () => {
  const s = session('DONE');
  assert.deepEqual(errors(s), []);
  assert.equal(sh(s, 'Checks').value('C' + M.ROW.Checks.rollup), 0);
  assert.equal(sh(s, 'Checks').value('C' + M.ROW.Checks.flag), 'OK');
  assert.equal(sh(s, 'Checks').value('C' + M.ROW.Checks.su), 0, 'sources equal uses');
  assert.equal(sh(s, 'Cover').value('C' + M.ROW.Cover.flag), 'OK');
  // Comps: the EV build, the helper statistics, the net-cash comp, the LTM from the quarters, the calendarization
  assert.deepEqual(row(s, 'Comps', 'c0', [C6.mcap, C6.ev, C6.ebitda]), [1470000, 1945000, 170500]);
  near(one(s, 'Comps', 'c0', C6.evEbitda), 11.41, 0.01, "Pinnacle's multiple");
  assert.equal(one(s, 'Comps', 'c4', C6.helper), '', 'the excluded outlier drops out of the helper');
  assert.ok(one(s, 'Comps', 'c2', C6.lev) < 0, 'Summit holds net cash');
  near(one(s, 'Comps', 'stMed', C6.helper), 10.51, 0.01, 'the median multiple'); near(one(s, 'Comps', 'stLow', C6.helper), 9.99, 0.01); near(one(s, 'Comps', 'stHigh', C6.helper), 11.41, 0.01);
  assert.ok(one(s, 'Comps', 'stMean', C6.helper) > one(s, 'Comps', 'stMin', C6.helper));
  assert.equal(one(s, 'Comps', 'q0', 'S'), 0, 'the filings route to LTM agrees with the SUMIFS');
  assert.equal(one(s, 'Comps', 'q0', 'P'), 170500, 'LTM from the quarters');
  near(one(s, 'Comps', 'c0', C6.growth), 0.08, 0.001, 'LTM growth from the two windows');
  assert.equal(one(s, 'Comps', 'q1', 'N'), 0.25, 'a March year weights the 2025 fiscal year a quarter');
  assert.equal(one(s, 'Comps', 'q0', 'N'), 1, 'a December year weights it fully');
  assert.equal(one(s, 'Comps', 'q1', 'L'), row(s, 'Comps', 'q1', ['F', 'G', 'H', 'I']).reduce((a, b) => a + b, 0), 'a March fiscal year is its four quarters');
  assert.deepEqual(row(s, 'Comps', 'cc', [C6.ebitda, C6.sites, C6.washes]), [16600, 40, 3600], 'Clearcoat FY26E from the model');
  const comps = row(s, 'Comps', 'rgEV', ['C', 'D', 'E']);
  near(comps[1], 10.51 * 16600, 100, 'the comps range on EBITDA'); assert.ok(comps[0] < comps[1] && comps[1] < comps[2]);
  assert.equal(cell(WB.stateOf('DONE'), 'Comps', 'D' + R.Comps.rgEV).bold, true, 'the median prints bold');
  // Precedents: the premium where listed, ages, the included median above the trading median, the DCF's exit multiple between them
  near(one(s, 'Precedents', 'd1', D6.premium), 0.3, 1e-9); assert.equal(one(s, 'Precedents', 'd0', D6.premium), '-');
  near(one(s, 'Precedents', 'd0', D6.age), 3.96, 0.02, 'the four-year-old deal');
  assert.equal(one(s, 'Precedents', 'd0', D6.helper), '', 'excluded');
  near(one(s, 'Precedents', 'precMed'), 12.24, 0.01); assert.ok(one(s, 'Precedents', 'precMed') > one(s, 'Precedents', 'tradMed'));
  assert.ok(one(s, 'Precedents', 'ctrlPrem') > 0.1, 'a control premium');
  assert.equal(one(s, 'Precedents', 'dcfRead'), 'Between the two medians');
  const prec = row(s, 'Precedents', 'rgEV', ['C', 'D', 'E']); assert.ok(prec[0] > comps[2], 'the precedents range sits above the comps range');
  // the LBO: sources and uses, the sweep check, the returns and their checks, the bridge, the sensitivity centre, the range
  near(one(s, 'LBO', 'entryMult'), 11.75, 0.01); assert.deepEqual([one(s, 'LBO', 'usesTotal'), one(s, 'LBO', 'srcTotal'), one(s, 'LBO', 'suCheck')], [198900, 198900, 0]);
  assert.deepEqual([one(s, 'LBO', 'srcSenior'), one(s, 'LBO', 'srcMezz'), one(s, 'LBO', 'entryEq')], [74700, 16600, 107600]);
  near(one(s, 'LBO', 'rollNewShare'), 0.26, 0.01, 'the rolled stake is about a quarter of the new equity');
  assert.deepEqual(row(s, 'LBO', 'ebitda', YRS), row(s, 'IS', 'ebitda', M.PROJ_COLS, M.ROW), 'EBITDA is the model\'s');
  assert.deepEqual(row(s, 'LBO', 'fcf', YRS), row(s, 'DCF', 'fcf', M.PROJ_COLS, M.ROW), 'free cash flow is the model\'s');
  for (const v of row(s, 'LBO', 'sweepCheck', YRS)) assert.equal(v, 0);
  assert.ok(one(s, 'LBO', 'revDrawn', 'D') > 0, 'FY27 is a short year: the revolver is drawn');
  assert.ok(row(s, 'LBO', 'senClose', LCOLS).every((v, i, a) => i === 0 || v < a[i - 1]), 'the senior loan amortizes every year');
  for (const k of ['irrDiff', 'splitCheck', 'bridgeCheck']) assert.equal(one(s, 'LBO', k), 0, k);
  near(one(s, 'LBO', 'irr'), Math.pow(one(s, 'LBO', 'moic'), 1 / 5) - 1, 1e-9, 'IRR and MOIC agree over five years');
  near(one(s, 'LBO', 'lenderIrr'), 0.08, 0.005, "the lender's IRR within half a point of the rate");
  assert.equal(one(s, 'LBO', 'hurdleFlag'), one(s, 'LBO', 'irr') >= 0.2 ? 'Clears' : 'Short');
  near(one(s, 'LBO', 'sens2', 'F'), one(s, 'LBO', 'irr'), 1e-9, 'the table centre is the page\'s IRR');
  near(one(s, 'LBO', 'growthSh') + one(s, 'LBO', 'multSh') + one(s, 'LBO', 'paydownSh') + one(s, 'LBO', 'feesSh'), 1, 1e-9, 'the bridge shares sum to one');
  const top = row(s, 'LBO', 'topEV', ['C', 'D', 'E']); assert.ok(top[0] < top[1] && top[1] < top[2], 'a higher hurdle means a lower price');
  near(Math.pow((one(s, 'LBO', 'exitEq')) / (top[1] * 1.02 - 91300), 0.2) - 1, 0.2, 1e-6, 'the 20% column earns exactly 20%');
  // Bids: three orders, the waterfall ties and floors, your stake
  assert.deepEqual(row(s, 'Bids', 'rankHead', ['C', 'D', 'E']), [3, 1, 2]);
  assert.deepEqual(row(s, 'Bids', 'rankPriced', ['C', 'D', 'E']), [3, 2, 1]);
  assert.deepEqual(row(s, 'Bids', 'rankExp', ['C', 'D', 'E']), [1, 2, 3]);
  near(one(s, 'Bids', 'rollNew', 'E'), one(s, 'LBO', 'rollNewShare'), 1e-9, 'the rolled share agrees with the LBO');
  for (const v of row(s, 'Bids', 'wfCheck', ['C', 'D', 'E'])) assert.equal(v, 0);
  assert.ok(one(s, 'Bids', 'yourVal') > 0 && one(s, 'Bids', 'yourVal') < 1000, 'your options are worth a few hundred thousand dollars');
  assert.equal(one(s, 'Bids', 'ownCheck'), 0);
  // Summary: the football field reads every page, the waterfall follows the recommended bid, the checks block is zero
  assert.equal(one(s, 'Summary', 'flag'), 'OK');
  assert.deepEqual(row(s, 'Summary', 'ffComps', ['C', 'D', 'E']), comps);
  assert.deepEqual(row(s, 'Summary', 'ffLbo', ['C', 'D', 'E']), top);
  near(one(s, 'Summary', 'ffDcf', 'D'), sh(s, 'DCF').value('C' + M.ROW.DCF.ev), 1e-6);
  near(one(s, 'Summary', 'ffDcf', 'F'), 1, 1e-9);
  for (const k of ['ffComps', 'ffPrec', 'ffDcf', 'ffLbo', 'ffA', 'ffB', 'ffC']) { const [lo, mid, hi] = row(s, 'Summary', k, ['C', 'D', 'E']); assert.ok(lo <= mid && mid <= hi, k + ' runs low to high'); }
  assert.equal(one(s, 'Summary', 'recIdx'), 1); assert.equal(one(s, 'Summary', 'wEV'), one(s, 'Bids', 'priced', 'C'));
  assert.equal(one(s, 'Summary', 'wProceeds'), one(s, 'Bids', 'wfProceeds', 'C'));
  const sc = sh(s, 'Summary'); for (let r = R.Summary.recText + 1; r < R.Summary.recText + 8; r++) { const c = sc.cells['C' + r]; if (c && c.formula) assert.equal(c.value, 0, 'Summary check ' + r); }
  assert.equal(Object.keys(sc.cells).filter(k => /^C\d+$/.test(k) && +k.slice(1) > R.Summary.recText && sc.cells[k].formula).length, 4, 'four checks');
  // does it tie: the outlier moves the mean more than the median; the sale-leaseback cuts exit debt and the exit value; the Downside case recalculates clean; zero leverage leaves no error
  const med0 = one(s, 'Comps', 'stMed', C6.helper), mean0 = one(s, 'Comps', 'stMean', C6.helper);
  sh(s, 'Comps').cells[C6.include + R.Comps.c4].value = 1; s.recalcAll();
  assert.ok(Math.abs(one(s, 'Comps', 'stMed', C6.helper) - med0) < Math.abs(one(s, 'Comps', 'stMean', C6.helper) - mean0), 'the outlier pulls the mean, not the median');
  sh(s, 'Comps').cells[C6.include + R.Comps.c4].value = 0;
  const exitEV0 = one(s, 'LBO', 'exitEV'), exitND0 = one(s, 'LBO', 'netDebt', 'H');
  sh(s, 'LBO').cells['C' + R.LBO.slbOn].value = 1; s.recalcAll();
  assert.deepEqual(errors(s), []);
  assert.ok(one(s, 'LBO', 'netDebt', 'H') < exitND0 && one(s, 'LBO', 'exitEV') < exitEV0, 'the sale-leaseback: exit debt falls, exit value falls');
  assert.equal(one(s, 'LBO', 'bridgeCheck'), 0); for (const v of row(s, 'LBO', 'sweepCheck', YRS)) assert.equal(v, 0);
  sh(s, 'LBO').cells['C' + R.LBO.slbOn].value = 0;
  sh(s, 'Cover').cells['C' + M.ROW.Cover.case].value = 'Downside'; s.recalcAll();
  assert.deepEqual(errors(s), []); assert.equal(sh(s, 'Checks').value('C' + M.ROW.Checks.flag), 'OK'); assert.equal(one(s, 'Summary', 'flag'), 'OK');
  // zero leverage: only the LBO page moves (nothing it reads changes), so it alone recalculates; no error anywhere on it
  sh(s, 'LBO').cells['C' + R.LBO.senLev].value = 0; sh(s, 'LBO').cells['C' + R.LBO.mezLev].value = 0; sh(s, 'LBO').recalc();
  assert.deepEqual(errors({ sheets: s.sheets.filter(e => e.name === 'LBO') }), []); assert.equal(one(s, 'LBO', 'lenderIrr'), 'n/a'); assert.equal(typeof one(s, 'LBO', 'irr'), 'number');
});

test('the start states: each lesson finds its inputs, the empty cells it fills and the plantings it reads', () => {
  const st = id => WB.stateOf(id);
  const c = (id, name, key, col, rows) => has(st(id), name, key, col, rows);
  // 6.1.1: the inputs and the given LTM, blue; nothing derived; the net-cash note there, the outlier's note not yet; later pages raw
  const b611 = st('B611');
  assert.equal(cell(b611, 'Comps', C6.ebitda + R.Comps.c0).value, 170500); assert.equal(cell(b611, 'Comps', C6.ebitda + R.Comps.c0).fontColor, 'blue');
  for (const col of [C6.mcap, C6.ev, C6.evEbitda, C6.include, C6.sites]) assert.equal(cell(b611, 'Comps', col + R.Comps.c0), undefined, 'B611 ' + col);
  assert.ok(cell(b611, 'Comps', C6.note + R.Comps.c2)); assert.equal(cell(b611, 'Comps', C6.note + R.Comps.c4), undefined);
  assert.equal(cell(b611, 'Comps', 'C' + R.Comps.q0).fontColor, 'blue', 'the quarters typed (6.1.2 reads them), nothing built on them'); assert.equal(cell(b611, 'Comps', 'P' + R.Comps.q0), undefined); assert.equal(cell(b611, 'Comps', 'C' + R.Comps.cc), undefined);
  assert.deepEqual(WB.diffStates(WB.stateOf('B615'), (() => { const s = WB.stateOf('B621'); for (const k of Object.keys(s.sheets.find(x => x.name === 'Comps').cells)) { const r = +k.replace(/^[A-Z]+/, ''); if (r >= R.Comps.rgMult && r <= R.Comps.rgEqWash && !k.startsWith('B')) delete s.sheets.find(x => x.name === 'Comps').cells[k]; } return s; })()), [], '6.1.5 ends where 6.2.1 starts');
  assert.equal(cell(b611, 'Precedents', D6.mult + R.Precedents.d0), undefined); assert.ok(cell(b611, 'Precedents', D6.ev + R.Precedents.d0));
  assert.equal(cell(b611, 'LBO', 'C' + R.LBO.entryEV), undefined); assert.equal(cell(b611, 'Bids', 'C' + R.Bids.headline), undefined); assert.ok(cell(b611, 'Bids', 'C' + R.Bids.feePct));
  assert.equal(cell(b611, 'Summary', 'A1'), undefined); assert.ok(cell(b611, 'Summary', 'B' + R.Summary.ffComps));
  assert.equal(cell(b611, 'Checks', 'K' + M.ROW.Checks.su).value, 'pending');
  // 6.1.2: the EV build done; the quarters typed with the first period end only; the LTM still given; no dates block
  const b612 = st('B612');
  assert.ok(cell(b612, 'Comps', C6.ev + R.Comps.c0).formula); assert.equal(cell(b612, 'Comps', C6.ebitda + R.Comps.c0).value, 170500);
  assert.ok(cell(b612, 'Comps', 'C' + R.Comps.q0).fontColor === 'blue'); assert.ok(cell(b612, 'Comps', 'C' + (R.Comps.q0 - 1)).value > 40000, 'the first period end is typed'); assert.equal(cell(b612, 'Comps', 'D' + (R.Comps.q0 - 1)), undefined);
  assert.equal(cell(b612, 'Comps', 'P' + R.Comps.q0), undefined); assert.equal(cell(b612, 'Comps', 'C' + R.Comps.ltmDate), undefined);
  // 6.1.3: LTM links the quarters; no include column, statistics or Clearcoat row
  const b613 = st('B613');
  assert.match(cell(b613, 'Comps', C6.ebitda + R.Comps.c0).formula, /^=P\d+$/); assert.equal(cell(b613, 'Comps', C6.include + R.Comps.c0), undefined); assert.equal(cell(b613, 'Comps', C6.helper + R.Comps.stMed), undefined);
  assert.ok(cell(b613, 'Comps', 'S' + R.Comps.q0), 'the filings difference is built'); assert.ok(cell(b613, 'Comps', 'C' + R.Comps.ltmDate));
  // 6.1.4: statistics done, operating multiples not; 6.1.5: the range block empty
  assert.ok(cell(st('B614'), 'Comps', C6.helper + R.Comps.stMed)); assert.equal(cell(st('B614'), 'Comps', C6.sites + R.Comps.c0), undefined); assert.ok(cell(st('B614'), 'Comps', C6.ebitda + R.Comps.cc));
  assert.ok(cell(st('B615'), 'Comps', C6.evSite + R.Comps.c0)); assert.equal(cell(st('B615'), 'Comps', 'C' + R.Comps.rgEV), undefined);
  // 6.1.C: three fresh comps, their quarters typed, no LTM, no later pages
  const b61c = st('B61C'), ar = WB.ALT_ROWS();
  assert.deepEqual(b61c.sheets.map(x => x.name).filter(n => WB.PAGE_NAMES.includes(n)), ['Comps']);
  assert.equal(cell(b61c, 'Comps', 'B' + ar.Comps.c2).value, 'Ironwood Express'); assert.equal(cell(b61c, 'Comps', 'B' + ar.Comps.c3), undefined);
  assert.equal(cell(b61c, 'Comps', C6.ebitda + ar.Comps.c0), undefined); assert.ok(cell(b61c, 'Comps', 'J' + ar.Comps.q0));
  // 6.2.x: the deals typed, then the multiples, then the ages and flags, then the range
  assert.ok(cell(st('B621'), 'Precedents', D6.ev + R.Precedents.d0)); assert.equal(cell(st('B621'), 'Precedents', D6.type + R.Precedents.d0), undefined); assert.equal(cell(st('B621'), 'Precedents', D6.mult + R.Precedents.d0), undefined);
  assert.ok(cell(st('B622'), 'Precedents', D6.mult + R.Precedents.d0)); assert.equal(cell(st('B622'), 'Precedents', D6.age + R.Precedents.d0), undefined); assert.equal(cell(st('B622'), 'Precedents', 'C' + R.Precedents.asOf), undefined);
  assert.ok(cell(st('B623'), 'Precedents', D6.include + R.Precedents.d0)); assert.equal(cell(st('B623'), 'Precedents', 'C' + R.Precedents.rgEV), undefined); assert.equal(cell(st('B623'), 'LBO', 'C' + R.LBO.entryEV), undefined);
  assert.equal(cell(st('B62C'), 'Precedents', 'B' + ar.Precedents.d4).value, 'Blue Ridge Car Care'); assert.equal(cell(st('B62C'), 'Precedents', D6.mult + ar.Precedents.d0), undefined);
  // 6.3.x: the LBO block by block; Sources equal uses goes live with 6.3.1
  assert.equal(cell(st('B631'), 'LBO', 'C' + R.LBO.entryEV), undefined); assert.equal(cell(st('B631'), 'Checks', 'K' + M.ROW.Checks.su).value, 'pending');
  assert.equal(cell(st('B632'), 'LBO', 'C' + R.LBO.entryEV).value, 195000); assert.ok(cell(st('B632'), 'LBO', 'C' + R.LBO.srcSponsor)); assert.equal(cell(st('B632'), 'LBO', 'D' + R.LBO.ebitda), undefined); assert.ok(cell(st('B632'), 'Checks', 'C' + M.ROW.Checks.su).formula);
  assert.match(cell(st('B633'), 'LBO', 'D' + R.LBO.ebitda).formula, /^=IS!F\$\d+$/); assert.ok(cell(st('B633'), 'LBO', 'H' + R.LBO.senClose)); assert.equal(cell(st('B633'), 'LBO', 'C' + R.LBO.slbOn), undefined); assert.equal(cell(st('B633'), 'LBO', 'D' + R.LBO.rent), undefined);
  assert.ok(cell(st('B634'), 'LBO', 'C' + R.LBO.slbOn)); assert.equal(cell(st('B634'), 'LBO', 'C' + R.LBO.exitEV), undefined);
  assert.ok(cell(st('B635'), 'LBO', 'C' + R.LBO.irr)); assert.equal(cell(st('B635'), 'LBO', 'C' + R.LBO.gain), undefined);
  assert.ok(cell(st('B636'), 'LBO', 'C' + R.LBO.gain)); assert.equal(cell(st('B636'), 'LBO', 'D' + R.LBO.sens0), undefined); assert.equal(cell(st('B636'), 'LBO', 'C' + R.LBO.topEV), undefined); assert.equal(cell(st('B636'), 'Bids', 'C' + R.Bids.headline), undefined);
  // 6.3.C: the paper LBO is one sheet with its term sheet and the operating lines typed
  const b63c = st('B63C'), pr = WB.PAPER_ROWS();
  assert.deepEqual(b63c.sheets.map(x => x.name), ['LBO']);
  assert.equal(cell(b63c, 'LBO', 'D' + pr.LBO.ebitda).value, 16500); assert.equal(cell(b63c, 'LBO', 'D' + pr.LBO.ebitda).fontColor, 'blue'); assert.equal(cell(b63c, 'LBO', 'C' + pr.LBO.mezLev).value, 0);
  assert.equal(cell(b63c, 'LBO', 'C' + pr.LBO.srcSenior), undefined); assert.equal(cell(b63c, 'LBO', 'C' + pr.LBO.irr), undefined);
  const live63c = session('B63C'); assert.deepEqual(errors(live63c), []);
  // 6.4.x: the bids, the waterfall, your stake, then the board page from labels
  assert.equal(cell(st('B641'), 'Bids', 'C' + R.Bids.headline), undefined); assert.ok(cell(st('B641'), 'Bids', 'C' + R.Bids.strikeVal)); assert.equal(cell(st('B641'), 'Bids', 'C' + R.Bids.earnProb), undefined);
  assert.equal(cell(st('B642'), 'Bids', 'D' + R.Bids.headline).value, 200000); assert.ok(cell(st('B642'), 'Bids', 'C' + R.Bids.earnProb)); assert.equal(cell(st('B642'), 'Bids', 'C' + R.Bids.wfEV), undefined);
  assert.ok(cell(st('B643'), 'Bids', 'C' + R.Bids.wfProceeds)); assert.equal(cell(st('B643'), 'Bids', 'C' + R.Bids.yourVal), undefined);
  const b644 = st('B644');
  assert.ok(cell(b644, 'Bids', 'C' + R.Bids.yourVal)); assert.equal(cell(b644, 'Summary', 'A1'), undefined); assert.equal(cell(b644, 'Summary', 'C' + R.Summary.ffComps), undefined); assert.ok(cell(b644, 'Summary', 'B' + R.Summary.ffComps));
  assert.ok(cell(b644, 'Summary', 'C4'), 'the headers stay');
  assert.deepEqual(Object.keys(cell(st('B64C'), 'Summary', 'A1') ? {} : st('B64C').sheets.find(x => x.name === 'Summary').cells), [], '6.4.C starts from a blank Summary');
  // 6.P and 6.A: fresh sets, the term sheet given, everything else to build
  const b6p = st('B6P');
  assert.equal(cell(b6p, 'Comps', 'B' + ar.Comps.c0).value, 'Cascade Wash Group'); assert.equal(cell(b6p, 'Comps', C6.ebitda + ar.Comps.c0), undefined); assert.ok(cell(b6p, 'Comps', 'J' + ar.Comps.q0));
  assert.equal(cell(b6p, 'LBO', 'C' + ar.LBO.entryEV).value, 185000); assert.equal(cell(b6p, 'LBO', 'C' + ar.LBO.srcSenior), undefined);
  assert.equal(cell(b6p, 'Bids', 'D' + ar.Bids.headline).value, 190000); assert.equal(cell(b6p, 'Bids', 'C' + ar.Bids.cashClose), undefined);
  assert.equal(cell(b6p, 'Summary', 'A1'), undefined); assert.equal(cell(b6p, 'Checks', 'K' + M.ROW.Checks.su).value, 'pending');
  const live6p = session('B6P'); assert.deepEqual(errors(live6p), []); assert.equal(sh(live6p, 'Checks').value('C' + M.ROW.Checks.flag), 'OK', 'Sources equal uses pending: the flag still reads OK');
  const b6a = st('B6A'), a2 = WB.ALT2_ROWS();
  assert.equal(cell(b6a, 'Comps', 'B' + a2.Comps.c0).value, 'Lakeshore Wash Co'); assert.equal(cell(b6a, 'LBO', 'C' + a2.LBO.entryEV).value, 190000);
  assert.notEqual(cell(b6a, 'Precedents', 'B' + a2.Precedents.d0).value, cell(b6p, 'Precedents', 'B' + ar.Precedents.d0).value, 'the assessment set is not the project set');
});
