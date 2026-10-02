// app2/tests/clearcoat-model.test.js — the Chapter 5 workbook (clearcoat-model): every state builds,
// the solved pages pass the sheet standard, the model ties (every check zero, the flag OK) in every
// case and with the circularity breaker either way, the cross-chapter figures match the script, and
// the plantings each lesson relies on are where the script says.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { sheetStandard } from '../app/graders.js';
import { WORKBOOKS } from '../content/workbooks/index.js';
import * as WB from '../content/workbooks/clearcoat-model.js';

const build = sp => new Sheet({ rows: sp.rows, cells: JSON.parse(JSON.stringify(sp.cells)), colW: sp.colW, freeze: sp.freeze, gridlines: sp.gridlines, condFmt: sp.condFmt });
/** A live workbook from a state, as the runner assembles one: sheets, settings, names, one recalculation. */
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
const row = (s, name, key, cols = WB.COLS) => cols.map(c => sh(s, name).value(c + WB.ROW[name][key]));
const cell = (st, name, ref) => (st.sheets.find(x => x.name === name) || { cells: {} }).cells[ref];
const errors = s => { const out = []; for (const e of s.sheets) for (const k in e.sheet.cells) { const v = e.sheet.cells[k].value; if (typeof v === 'string' && /^#(REF|NAME|VALUE|DIV|N\/A|NUM)/.test(v)) out.push(e.name + '!' + k + ' ' + v); } return out; };
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test('the workbook is registered, and every state builds as a workbook of real sheets with the sheets in the script\'s order', () => {
  assert.equal(WORKBOOKS['clearcoat-model'], WB);
  assert.equal(WB.CHAPTER, 5);
  const BUILT = new Set(['B511', 'B521', 'B531', 'B541', 'B551', 'B561', 'B5P', 'DONE']);   // every sheet of these is built live; the rest are checked as specs (the live build is the slow part)
  for (const id of WB.STATE_ORDER) {
    const st = WB.stateOf(id);
    assert.ok(Array.isArray(st.sheets) && st.sheets.length, id + ' has sheets');
    for (const sp of st.sheets) {
      assert.ok(typeof sp.name === 'string' && sp.cells && typeof sp.cells === 'object', id + ' ' + sp.name);
      for (const k in sp.cells) { const c = sp.cells[k]; assert.ok(c && typeof c === 'object' && /^[A-Z]+\d+$/.test(k), `${id} ${sp.name}!${k}`); if (c.formula) assert.ok(c.formula.startsWith('='), `${id} ${sp.name}!${k} formula`); }
      if (BUILT.has(id)) assert.doesNotThrow(() => build(sp), id + ' ' + sp.name);
    }
    assert.ok(WB.STATE_LESSONS[id], id + ' names its lesson');
  }
  const done = WB.stateOf('DONE');
  assert.deepEqual(done.sheets.map(s => s.name), WB.SHEET_ORDER);
  assert.deepEqual(done.sheets.slice(0, 8).map(s => s.name), ['Cover', 'Inputs', 'IS', 'CF', 'BS', 'Schedules', 'Checks', 'DCF']);
  assert.notDeepEqual(WB.stateOf('B521').sheets.slice(0, 8).map(s => s.name), WB.MODEL_SHEETS, '5.2.1 starts with the eight sheets out of order');
  assert.deepEqual(Object.keys(done.names), ['Case', 'LastHistorical', 'Circ', 'WACC']);
  assert.equal(done.settings.iterative, true, 'iterative calculation is on: the model carries a circle');
});

test('stateOf hands out clones', () => {
  const a = WB.stateOf('DONE'); a.sheets[0].cells.A1 = { value: 'x' };
  assert.notEqual(WB.stateOf('DONE').sheets[0].cells.A1.value, 'x');
});

test('every finished page passes the sheet standard for Chapter 5', () => {
  for (const [stateId, name, opts] of WB.STANDARD.pages) {
    const spec = WB.stateOf(stateId).sheets.find(s => s.name === name);
    assert.deepEqual(sheetStandard(new Sheet(spec), { chapter: 5, read: opts.read !== false }), [], name);
  }
});

test('the finished model ties: every check zero, no errors, the flag OK, and the cross-chapter figures match the script', () => {
  const s = session('DONE');
  assert.deepEqual(errors(s), []);
  for (const key of Object.keys(WB.ROW.Checks)) {
    if (['su', 'flag', 'pnl'].includes(key)) continue;
    for (const v of row(s, 'Checks', key)) if (v !== null && v !== '') assert.equal(v, 0, `Checks ${key}`);
  }
  assert.equal(sh(s, 'Checks').value('C' + WB.ROW.Checks.flag), 'OK');
  assert.equal(sh(s, 'Cover').value('C' + WB.ROW.Cover.flag), 'OK');
  assert.equal(sh(s, 'Cover').value('C' + WB.ROW.Cover.casen), 2, 'the Base case');
  assert.equal(sh(s, 'IS').value('A1'), 'Clearcoat Express: income statement, Base case');
  // Chapter 2's P&L: FY26 revenue 50,000, EBITDA 16,600, 40 sites, revenue per wash 13.89
  assert.deepEqual(row(s, 'IS', 'rev', ['C', 'D', 'E']), [33000, 41000, 50000]);
  assert.deepEqual(row(s, 'IS', 'ebitda', ['C', 'D', 'E']), [9780, 12560, 16600]);
  assert.deepEqual(row(s, 'Schedules', 'closeSites'), [28, 34, 40, 46, 52, 58, 64, 70]);
  near(sh(s, 'Schedules').value('E' + WB.ROW.Schedules.revPerWash), 13.89, 0.005, 'FY26 revenue per wash');
  assert.equal(sh(s, 'Inputs').value('C' + WB.ROW.Inputs.capexSite), 2500, 'own capex a site');
  assert.deepEqual(row(s, 'Schedules', 'capexNew', ['F', 'G']), [15000, 15000], 'six new sites at 2,500');
  // the Chapter 6 reads: FY27 to FY31 EBITDA and free cash flow, and two terminal values
  const fcf = row(s, 'DCF', 'fcf', WB.PROJ_COLS);
  assert.ok(fcf[0] < 500 && fcf[0] > -1500, 'FY27 free cash flow about zero: ' + fcf[0]);
  for (let i = 1; i < 5; i++) assert.ok(fcf[i] > fcf[i - 1], 'free cash flow rises each year');
  const dcf = key => sh(s, 'DCF').value('C' + WB.ROW.DCF[key]);
  near(dcf('wacc'), 0.1002, 0.0001, 'WACC: 60% of 13.2% plus 40% of 5.25%');
  assert.ok(dcf('evExit') > dcf('evPerp'), 'the exit value at 11.0x sits above the perpetuity at 3%');
  near(dcf('roundTrip'), 0.03, 1e-9, 'the terminal round trip gives the growth back');
  assert.equal(dcf('ev'), dcf('evExit'), 'the switch at 2 picks the exit method');
  near(dcf('netDebt'), 60000 - sh(s, 'CF').value('E' + WB.ROW.CF.close), 0.01, 'net debt at FY26');
  // the sensitivity tables: the base-case corner equals the page's own enterprise value
  near(sh(s, 'DCF').value('F' + WB.ROW.DCF.sg2), dcf('evPerp'), 0.01, 'perpetuity table centre');
  near(sh(s, 'DCF').value('F' + WB.ROW.DCF.sm2), dcf('evExit'), 0.01, 'exit table centre');
  // the one-site and one-week pages tie
  assert.equal(sh(s, 'One site').value('C' + WB.ROW['One site'].check), 0);
  assert.equal(sh(s, 'One week').value('C' + WB.ROW['One week'].check), 0);
  assert.equal(sh(s, 'One week').value('C' + WB.ROW['One week'].net), 15940);
  assert.equal(sh(s, 'One week').value('C' + WB.ROW['One week'].dCheck), 0, 'the direct count agrees with the statement');
  // every case switch works and the breaker settles the circle either way: the model balances in all of them
  for (const [caseName, circ] of [['Downside', 1], ['Management', 0]]) {
    // the two inputs set together and one recalculation (a commit would recalculate the workbook twice)
    sh(s, 'Cover').cells['C' + WB.ROW.Cover.case].value = caseName;
    sh(s, 'Inputs').cells['C' + WB.ROW.Inputs.circ].value = circ;
    s.recalcAll();
    assert.deepEqual(errors(s), [], caseName);
    assert.equal(sh(s, 'Checks').value('C' + WB.ROW.Checks.rollup), 0, `${caseName}, Circ ${circ}`);
    assert.equal(sh(s, 'Checks').value('C' + WB.ROW.Checks.flag), 'OK');
    const newSites = row(s, 'Schedules', 'newSites', WB.PROJ_COLS);
    assert.equal(newSites[0], caseName === 'Downside' ? 4 : 6, 'the live block follows the switch');
    assert.deepEqual(row(s, 'Schedules', 'closeSites', ['C', 'D', 'E']), [28, 34, 40], 'history never moves with the switch');
    assert.equal(sh(s, 'IS').value('A1'), `Clearcoat Express: income statement, ${caseName} case`);
    if (caseName === 'Downside') assert.ok(row(s, 'Schedules', 'revClose', WB.PROJ_COLS).some(v => v > 0), 'the Downside draws the revolver');
  }
});

test('the plantings: breaks, faults, the #REF!, the sweep, the shell and the project', () => {
  // 5.4.5: six breaks, the check off in every projected year, zero once each is put back
  const broken = session('B545');
  const bs = row(broken, 'Checks', 'bs', WB.PROJ_COLS);
  assert.ok(bs.every(v => v !== 0), 'the balance check reads a number in each projected year: ' + bs.join(','));
  near(Math.abs(bs[0]), Math.abs(sh(broken, 'IS').value('F' + WB.ROW.IS.dep)), 0.01, 'FY27 is off by exactly its depreciation');
  assert.equal(sh(broken, 'Checks').value('C' + WB.ROW.Checks.flag), 'CHECK');
  for (const [name, ref] of WB.BREAKS) { const done = cell(WB.stateOf('DONE'), name, ref); const c = cell(WB.stateOf('B545'), name, ref); assert.notDeepEqual(c, done, `${name}!${ref} is planted`); }
  // 5.5.2: one #REF! in a memo cell on Schedules (so the ties still read zero and the count reads 1); the errors block is the lesson's to build
  assert.equal(cell(WB.stateOf('B552'), 'Checks', 'C' + WB.ROW.Checks.errSch), undefined);
  assert.match(WB.plantPatch('B552', [WB.PLANT_REF])['Schedules!' + WB.PLANT_REF[1]].formula, /#REF!/, 'the lesson plants it over its clean start');
  assert.doesNotMatch(cell(WB.stateOf('B552'), 'Schedules', WB.PLANT_REF[1]).formula, /#REF!/);
  assert.equal(WB.ROW.Schedules.capexToDep, +WB.PLANT_REF[1].slice(1), 'the #REF! sits in the capex-to-depreciation memo row');
  // 5.5.3: two typed numbers in the IS projection and a pattern break in FY29; the hardcode count would catch the two
  const sweep = WB.plantPatch('B553', WB.PLANT_SWEEP);
  assert.equal(sweep['IS!' + WB.PLANT_SWEEP[0][1]].value, -3100); assert.equal(sweep['IS!' + WB.PLANT_SWEEP[0][1]].formula, undefined, 'typed, not a formula');
  assert.equal(sweep['IS!' + WB.PLANT_SWEEP[1][1]].value, -1400);
  assert.ok(sweep['Schedules!' + WB.PLANT_SWEEP[2][1]].formula.includes('Inputs!H$' + WB.ROW.Inputs.labor), 'FY29 labor lost its anchor');
  assert.equal(cell(WB.stateOf('B553'), 'Checks', 'C' + WB.ROW.Checks.hcIS), undefined, 'the hardcode count is the lesson\'s to build');
  assert.deepEqual(WB.stateOf('B553').watches, WB.WATCHES, '5.5.2 leaves the Watch Window\'s two rows');
  // 5.5.4: the margins divide bare
  assert.equal(WB.plantPatch('B554', WB.PLANT_MARGINS)['IS!F' + WB.ROW.IS.gm].formula.includes('IFERROR'), false);
  assert.deepEqual(WB.diffStates(WB.stateOf('B554'), WB.stateOf('B561')), [], 'the auditing chain ends where the DCF begins');
  assert.equal(cell(WB.stateOf('DONE'), 'IS', 'F' + WB.ROW.IS.gm).formula.includes('IFERROR'), true);
  // 5.5.C: eight faults
  const faults = WB.stateOf('B55C');
  assert.equal(cell(faults, 'Checks', 'C' + WB.ROW.Checks.eq).value, 0, 'the dead check is a typed zero');
  assert.equal(cell(faults, 'CF', 'G' + WB.ROW.CF.dep), undefined, 'the missing add-back');
  assert.match(cell(faults, 'BS', 'J' + WB.ROW.BS.cash).formula, /^=J\d+-J\d+-J\d+-J\d+$/, 'the plug');
  assert.equal(WB.FAULTS.length, 8 + WB.COLS.length - 1);
  // 5.2.4: the ties pending with "pending" beside them, never a typed zero
  const shell = WB.stateOf('B525');
  for (const key of ['debt', 'ppe', 'rev', 'xfoot', 'eq', 'ebitda']) { assert.equal(cell(shell, 'Checks', 'C' + WB.ROW.Checks[key]), undefined); assert.equal(cell(shell, 'Checks', 'K' + WB.ROW.Checks[key]).value, 'pending'); }
  const shellLive = session('B525');
  assert.deepEqual(row(shellLive, 'Checks', 'bs', ['C', 'D', 'E']), [0, 0, 0], 'the balance check reads zero on the typed history');
  assert.deepEqual(row(shellLive, 'Checks', 'cash', ['C', 'D', 'E']), [0, 0, 0]);
  assert.equal(cell(shell, 'IS', 'C' + WB.ROW.IS.retail), undefined, 'the IS historicals are not populated before 5.2.5');
  assert.equal(cell(shell, 'Inputs', 'M5').value, 'Retail revenue', 'the mapping table is on Inputs');
  // 5.2.5 leaves INDEX/MATCH in the actual years only; 5.4.1 turns them into one-formula rows
  const after525 = WB.stateOf('B526');
  assert.match(cell(after525, 'IS', 'C' + WB.ROW.IS.retail).formula, /^=INDEX\(Data!/);
  assert.match(cell(after525, 'IS', 'C' + WB.ROW.IS.rent).formula, /^=-SUMIFS\(/, 'the duplicate label reads by SUMIFS');
  assert.equal(cell(after525, 'IS', 'F' + WB.ROW.IS.retail), undefined);
  assert.match(cell(WB.stateOf('DONE'), 'IS', 'F' + WB.ROW.IS.retail).formula, /^=IF\(Inputs!F\$\d+=0,INDEX\(Data!.*,Schedules!F\d+\)$/);
  // 5.2.6: no drivers before, three blocks and a live block after, the Downside's ticket growth a link to a link
  assert.equal(cell(WB.stateOf('B526'), 'Inputs', 'F' + WB.ROW.Inputs.bNew), undefined);
  assert.equal(cell(WB.stateOf('B531'), 'Inputs', 'F' + WB.ROW.Inputs.bNew).value, 6);
  assert.equal(cell(WB.stateOf('B531'), 'Inputs', 'G' + WB.ROW.Inputs.dTick).formula, `=F${WB.ROW.Inputs.dTick}`);
  assert.match(cell(WB.stateOf('B531'), 'Inputs', 'F' + WB.ROW.Inputs.lNew).formula, /CHOOSE\(Case,/);
  // 5.3.x: each schedule block arrives in order
  for (const [id, key, present] of [['B531', 'closeSites', false], ['B532', 'closeSites', true], ['B532', 'cos', false], ['B533', 'cos', true], ['B533', 'rec', false], ['B534', 'rec', true], ['B534', 'ppeClose', false], ['B535', 'ppeClose', true], ['B535', 'termClose', false], ['B536', 'termClose', true], ['B536', 'taxCharge', false], ['B541', 'taxCharge', true], ['B541', 'revClose', false], ['B545', 'revClose', true]]) {
    assert.equal(!!cell(WB.stateOf(id), 'Schedules', 'F' + WB.ROW.Schedules[key]), present, `${id} Schedules.${key}`);
  }
  // 5.4.x: the statements are typed history and empty projection until linked
  assert.equal(cell(WB.stateOf('B542'), 'CF', 'C' + WB.ROW.CF.ni).value, WB.HIST.ni[1]);
  assert.equal(cell(WB.stateOf('B542'), 'CF', 'F' + WB.ROW.CF.ni), undefined);
  assert.equal(cell(WB.stateOf('B543'), 'CF', 'F' + WB.ROW.CF.ni).formula, `=IS!F${WB.ROW.IS.ni}`);
  assert.equal(cell(WB.stateOf('B543'), 'BS', 'C' + WB.ROW.BS.cash).value, WB.HIST.cash[1]);
  // 5.6.x: the DCF page arrives block by block
  assert.ok(Object.keys(WB.stateOf('B561').sheets.find(x => x.name === 'DCF').cells).every(k => /^B|\D[1-4]$/.test(k)), 'the DCF page is its title, timeline and labels');
  assert.ok(cell(WB.stateOf('B562'), 'DCF', 'F' + WB.ROW.DCF.ebitda) && !cell(WB.stateOf('B562'), 'DCF', 'F' + WB.ROW.DCF.fcf));
  assert.equal(WB.stateOf('B563').names.WACC, undefined); assert.equal(WB.stateOf('B564').names.WACC, 'DCF!$C$' + WB.ROW.DCF.wacc);
  assert.equal(cell(WB.stateOf('B56C'), 'DCF', 'F' + WB.ROW.DCF.fcf).value, WB.FCF_GIVEN[0]);
  // 5.A: everything but the debt schedule and its links; 5.P: the shell with Inputs, Data and the case switch
  const a = WB.stateOf('B5A');
  assert.equal(cell(a, 'Schedules', 'F' + WB.ROW.Schedules.termClose), undefined); assert.equal(cell(a, 'IS', 'F' + WB.ROW.IS.int), undefined); assert.ok(cell(a, 'IS', 'F' + WB.ROW.IS.rev));
  const p = session('B5P');
  assert.deepEqual(errors(p), [], 'the project shell is clean');
  assert.equal(sh(p, 'Inputs').value('F' + WB.ROW.Inputs.lNew), 6, 'the live block reads the case switch the shell keeps');
  // 5.1: the one-site pages grow block by block
  assert.deepEqual(WB.stateOf('B511').sheets.map(x => x.name), ['One site']);
  assert.equal(cell(WB.stateOf('B511'), 'One site', 'C' + WB.ROW['One site'].rev), undefined);
  assert.ok(cell(WB.stateOf('B512'), 'One site', 'C' + WB.ROW['One site'].ni));
  assert.deepEqual(WB.stateOf('B516').sheets.map(x => x.name), ['One site', 'One week']);
  assert.equal(cell(WB.stateOf('B51C'), 'One site', 'C' + WB.ROW['One site'].washes).value, WB.SITE_CHALLENGE.washes);
});
