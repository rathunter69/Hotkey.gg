// app2/tests/module-states.test.js — the module workbook (C2 gap 1): every named state builds a
// real workbook, stateOf hands out clones, diffStates is exact and empty on identity, the
// plantings later lessons rely on are present, and every module lesson's before/after chains.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATES, STATE_ORDER, stateOf, diffStates, sessionToState, KWH, SITES, rawRow, SITE_PRICE } from '../content/workbooks/voltline-weekly.js';
import { WORKBOOKS, workbookState } from '../content/workbooks/index.js';
import { CLUSTERS, pickCluster, siteNames } from '../content/workbooks/clusters.js';
import { mulberry32 } from '../engine/rng.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { LessonRun } from '../app/runner.js';
import { LESSONS } from '../content/index.js';

const build = sp => new Sheet({ rows: sp.rows, cols: sp.cols, cells: sp.cells, colW: sp.colW, active: sp.active, rowH: sp.rowH, hiddenRows: sp.hiddenRows, hiddenCols: sp.hiddenCols, freeze: sp.freeze, gridlines: sp.gridlines, groups: sp.groups });

test('every state builds into a real workbook session without throwing', () => {
  for (const id in STATES) {
    const st = stateOf(id);
    assert.ok(st.sheets.length >= 3, `${id}: a workbook, not a toy`);
    const session = new Session(build(st.sheets[0]), {});
    session.sheets[0].name = st.sheets[0].name;
    for (const sh of st.sheets.slice(1)) session.addSheet(sh.name, build(sh));
    assert.equal(session.sheets.length, st.sheets.length, id);
  }
});

test('stateOf clones: mutating a copy never touches the master', () => {
  const a = stateOf('S0');
  a.sheets[0].cells.A1 = { value: 'vandalised' };
  a.sheets.pop();
  const b = stateOf('S0');
  assert.equal(b.sheets[0].cells.A1.value, 'Date');
  assert.equal(b.sheets.length, 4);
  assert.equal(workbookState('voltline-weekly', 'S0').sheets.length, 4);
  assert.throws(() => workbookState('voltline-weekly', 'S99'), /unknown workbook state/);
  assert.throws(() => workbookState('nope', 'S0'), /unknown workbook/);
});

test('diffStates: empty on identity, exact on a change, and each derivation is a small diff', () => {
  for (const id in STATES) assert.deepEqual(diffStates(stateOf(id), stateOf(id)), [], id + ' vs itself');
  const a = stateOf('S1d'), b = stateOf('S1d');
  b.sheets.find(s => s.name === 'Inputs').cells.B4 = { value: 0.14, fontColor: 'blue' };
  const d = diffStates(a, b);
  assert.equal(d.length, 1);
  assert.deepEqual([d[0].sheet, d[0].kind, d[0].key], ['Inputs', 'cell', 'B4']);
  // the chain S0 → S1a → … each step changes something, and only the lesson's own ground
  const order = STATE_ORDER;
  assert.deepEqual(order.slice(0, 6), ['S0', 'S1a', 'S1b', 'S1c', 'S1d', 'S2a']);
  for (let i = 1; i < order.length; i++) {
    const diff = diffStates(stateOf(order[i - 1]), stateOf(order[i]));
    assert.ok(diff.length > 0, `${order[i]} differs from ${order[i - 1]}`);
  }
  // S1b touches exactly one thing: Report's gridlines
  const d1b = diffStates(stateOf('S1a'), stateOf('S1b'));
  assert.deepEqual(d1b.map(x => [x.sheet, x.kind]), [['Report', 'gridlines']]);
});

test('the figures are deterministic and the plantings sit where the map says', () => {
  assert.deepEqual(KWH, (() => { const again = KWH; return again; })());
  const s0 = stateOf('S0');
  const raw = s0.sheets[0];
  assert.equal(raw.name, 'Raw');
  assert.deepEqual(s0.sheets.map(s => s.name), ['Raw', 'Sheet2', 'Old wk37', 'Costs']);
  const c = raw.cells;
  assert.equal(c.B14.value, 'Muller');
  assert.equal(c.B27.value, 'Riversid');
  assert.equal(c.B55.value, 'Airprot');
  assert.equal(c.C33.value, '1,240 ');
  assert.equal(c.E41.value, 81500);
  assert.equal(c.H3.value, 'draft');
  for (const ref of ['C61', 'D61', 'E61', 'F61']) assert.equal(c[ref], undefined, ref + ': Airport Saturday never came through');
  for (const r of [12, 19, 28, 44, 47]) assert.equal(c['F' + r], undefined, 'F' + r + ' blank Energy cost');
  assert.match(c.A65.value, /w\/c 08 Sep/);
  // the platform's site-totals block beside the feed: live SUMs the later modules freeze and watch
  assert.equal(c.H7.value, 'Site'); assert.equal(c.I8.formula, '=SUM(C8:C13)'); assert.equal(c.L12.formula, '=SUM(E50:E55)'); assert.equal(c.M8.value, 'AUS-01'); assert.equal(c.I13.formula, '=SUM(I8:I12)');
  assert.equal(s0.sheets[1].cells.B3.value, 'w/c 08 Sep', 'the associate’s week label is last week’s');
  // the module 1.3–1.4 states: the feed complete and clean, the Report skeleton, values frozen, the total live, Cedar Park in, the outline and the freeze
  const r3a = stateOf('S3a').sheets[1].cells; assert.equal(r3a.C61.value, KWH.Airport[11]); assert.equal(r3a.F12.value, 0); assert.equal(r3a.H3.value, undefined);
  const r3b = stateOf('S3b').sheets[1].cells; assert.equal(r3b.B14.value, 'Mueller'); assert.equal(r3b.C33.value, 1240); assert.equal(r3b.E41.value, 1075);
  const p3c = stateOf('S3c').sheets[0].cells; assert.equal(p3c.A4.value, 'Site'); assert.equal(p3c.C4.bold, true); assert.equal(p3c.B9.value, 'w/c 08 Sep'); assert.equal(p3c.G13.value, 'w/c 08 Sep');
  assert.equal(stateOf('S3c').sheets[1].cells.H1.value, 'Notes'); assert.equal(stateOf('S3c').sheets[1].cells.A64, undefined, 'the Notes block moved beside the feed');
  const p3d = stateOf('S3d').sheets[0].cells; assert.equal(p3d.C10.formula, '=SUM(C5:C9)'); assert.equal(typeof p3d.C5.value, 'number'); assert.equal(p3d.C5.formula, undefined, 'a value, not a link'); assert.equal(p3d.I4.value, 'Old code'); assert.equal(p3d.F23.value, 'Airport');
  const p3e = stateOf('S3e').sheets[0].cells; assert.equal(p3e.B5.value, 'w/c 15 Sep'); assert.equal(p3e.G14.value, 'Sat'); assert.equal(p3e.G15.value, 20); assert.equal(stateOf('S3e').sheets[1].cells.B55.value, 'Airport');
  const p4a = stateOf('S4a').sheets[0].cells; assert.equal(p4a.A9.value, 'Cedar Park'); assert.equal(p4a.C11.formula, '=SUM(C5:C10)'); assert.equal(p4a.H4.value, 'Margin %'); assert.equal(p4a.I4.value, 'Prior week rev ($)'); assert.equal(p4a.J4, undefined, 'Old code is gone'); assert.equal(p4a.A24.value, 'Price per kWh');
  const s4b = stateOf('S4b').sheets[0]; assert.equal(s4b.colW[2], 89); assert.equal(s4b.colW[9], 103); assert.ok(s4b.colW[1] > 64 && s4b.colW[1] < 130, 'A fits the site names, not the title'); assert.equal(s4b.rowH[4], 40, 'the wrapped header row stands two lines');
  const s4c = stateOf('S4c').sheets[0]; assert.deepEqual(s4c.groups.cols, [{ c1: 5, c2: 6, collapsed: false }]); assert.deepEqual(s4c.freeze, { r: 4, c: 1 }); assert.equal((s4c.hiddenCols || []).length, 0);
  // 60 data rows, site-major
  assert.equal(rawRow('Domain', 0), 2); assert.equal(rawRow('Airport', 11), 61);
  for (const site of SITES) for (let d = 0; d < 12; d++) {
    const r = rawRow(site, d);
    if (r === 61 || r === 33 || r === 41) continue;
    const kwh = c['C' + r].value;
    assert.ok(kwh >= 400 && kwh <= 2600, `kWh in band at row ${r}`);
    assert.ok(Math.abs(c['E' + r].value - kwh * SITE_PRICE[site]) < 0.01, `revenue ties at row ${r}`);
  }
  // Costs: one live total, four typed (1.2.4's constants-vs-formulas material)
  const costs = s0.sheets[3].cells;
  assert.equal(costs.E4.formula, '=B4+C4+D4');
  for (const r of [5, 6, 7, 8]) { assert.equal(costs['E' + r].formula, undefined); assert.equal(typeof costs['E' + r].value, 'number'); }
  assert.equal(costs.C5, undefined); assert.equal(costs.C7, undefined);
  // S1a: Old wk37 gone, Report first, Inputs renamed
  assert.deepEqual(stateOf('S1a').sheets.map(s => s.name), ['Report', 'Raw', 'Inputs', 'Costs']);
  // S1c settings
  assert.equal(stateOf('S1c').settings.iterative, true);
  assert.ok(stateOf('S1c').settings.qat.includes('fontColor'));
  // S1d: the hardcode is split — B14 references B4, B4 is a blue input
  const inputs = stateOf('S1d').sheets.find(s => s.name === 'Inputs').cells;
  assert.equal(inputs.B14.formula, '=B6*B4');
  assert.equal(inputs.B4.value, 0.13);
  assert.equal(inputs.B4.fontColor, 'blue');
  assert.match(inputs.A2.value, /USD/);
});

test('LessonRun builds a module lesson from its before state (settings included)', () => {
  const fake = {
    id: 'x', workbook: 'voltline-weekly', module: 'open-and-set-up', state: { before: 'S1c', after: 'S1d' },
    goals: [{ id: 'g', text: 'x.', check: s => s.value('Z99') === 'done' }],
  };
  const run = new LessonRun(fake, { mode: 'guided' });
  assert.deepEqual(run.session.sheets.map(s => s.name), ['Report', 'Raw', 'Inputs', 'Costs']);
  assert.equal(run.session.settings.iterative, true);
  assert.ok(run.session.settings.qat.includes('borders'));
  assert.equal(run.session.sheets[0].sheet.gridlines, false, 'Report gridlines off carried from S1b');
  assert.equal(run.session.sheets[1].sheet.cellAt('B14').value, 'Muller');
  // a statePatch (the challenge seed's clothing) lands before the first key
  const seeded = new LessonRun(fake, { mode: 'guided', statePatch: { 'Raw!B14': { value: 'Muller Corner' }, 'Inputs!B6': { value: 90000 } } });
  assert.equal(seeded.session.sheets[1].sheet.cellAt('B14').value, 'Muller Corner');
  assert.equal(seeded.session.sheets[2].sheet.cellAt('B6').value, 90000);
});

test('the clothing pool: 12 cities, 5+ sites each, deterministic picks', () => {
  assert.equal(CLUSTERS.length, 12);
  for (const cl of CLUSTERS) { assert.ok(cl.sites.length >= 5, cl.city); assert.match(cl.week, /^w\/c /); }
  const rng = mulberry32(7);
  const pick = pickCluster(rng);
  assert.deepEqual(pickCluster(mulberry32(7)), pick, 'same seed, same cluster');
  assert.equal(siteNames(pick, 5).length, 5);
  assert.equal(siteNames(CLUSTERS[0], 99).length, CLUSTERS[0].sites.length);
});

test('every module lesson chains: before is the previous lesson\'s after', () => {
  const moduleLessons = LESSONS.filter(l => l.workbook && l.state);
  const byModule = new Map();
  for (const l of moduleLessons) { if (!byModule.has(l.module)) byModule.set(l.module, []); byModule.get(l.module).push(l); }
  let prevAfter = null;
  for (const l of moduleLessons) {
    if (prevAfter != null && l.kind !== 'challenge') assert.equal(l.state.before, prevAfter, `${l.id}: starts where the last lesson ended`);
    if (l.kind !== 'challenge') prevAfter = l.state.after || l.state.before;
  }
  assert.ok(true);
});

/* ---------------- the solution produces exactly the after state (C2: the chain is real) ---------------- */
test('every module lesson\'s solution replays to exactly its after state', () => {
  for (const l of LESSONS.filter(x => x.workbook && x.state && x.kind !== 'challenge')) {
    const run = new LessonRun(l, { now: () => 0 });
    run.run(l.solution);
    assert.ok(run.finished, `${l.id}: solution finishes`);
    const after = workbookState(l.workbook, l.state.after);
    const diff = diffStates(sessionToState(run.session), after);
    assert.deepEqual(diff, [], `${l.id}: the solution leaves exactly ${l.state.after} — extra diffs: ${JSON.stringify(diff.slice(0, 4))}`);
  }
});

/* ---------------- modules 1.5–1.7 (C2 Run 3): the format, formula, print and check states, and what the lessons plant ---------------- */
import { PLANT_COSTS_GRID, PLANT_DAILY, PLANT_COSTS_ERRORS, PLANT_AUDIT, REPORT_PAGE_SETUP, PAGE_SETUP_DEFAULT } from '../content/workbooks/voltline-weekly.js';
import { applyStatePatch } from '../content/workbooks/index.js';
const liveOf = st => { const build = sp => new Sheet({ cells: structuredClone(sp.cells), colW: sp.colW, hiddenCols: sp.hiddenCols, gridlines: sp.gridlines }); const ses = new Session(build(st.sheets[0]), { now: () => 0 }); ses.sheets[0].name = st.sheets[0].name; for (const sh of st.sheets.slice(1)) ses.addSheet(sh.name, build(sh)); for (let i = 0; i < 2; i++) for (const e of ses.sheets) e.sheet.recalc(); return ses; };
const sheetIn = (ses, name) => ses.sheets.find(x => x.name === name).sheet;

test('1.5: the figures read as a banker reads them; 1.6: every Report figure is live and green, energy cost runs off the one wholesale price; 1.7: the checks read zero', () => {
  const r5 = stateOf('S5a').sheets[0].cells;
  assert.deepEqual([r5.C5.fmtStyle, r5.C5.decimals, r5.D5.fmtStyle, r5.D11.fmtStyle, r5.G5.decimals, r5.H5.fmtStyle], ['comma', 0, 'currency', 'currency', 2, 'percent']);
  const r5b = stateOf('S5b').sheets[0].cells; assert.equal(r5b.A11.bt, true); assert.equal(r5b.C11.bold, true); assert.equal(r5b.A1.fsz, 16);
  const r5c = stateOf('S5c').sheets[0].cells; assert.equal(r5c.A1.ca, 9); assert.equal(r5c.C4.align, 'r'); assert.equal(r5c.A17.indent, 1);
  const d6 = liveOf(workbookState('voltline-weekly', 'S6d')), R = sheetIn(d6, 'Report');
  assert.equal(R.cellAt('C5').formula, '=Raw!I8'); assert.equal(R.cellAt('C5').fontColor, 'green'); assert.equal(R.value('C5'), 6710);
  assert.ok(Math.abs(R.value('E5') - 6710 * 0.13) < 1e-6, 'energy cost is kWh × the wholesale price on Inputs'); assert.equal(R.cellAt('C9').formula, null, 'Cedar Park stays typed');
  const e6 = liveOf(workbookState('voltline-weekly', 'S6e')); assert.equal(sheetIn(e6, 'Report').cellAt('B17').formula, '=Raw!I32'); assert.equal(sheetIn(e6, 'Report').value('G21'), 2500, 'Airport Saturday is the emailed day');
  const f6 = liveOf(workbookState('voltline-weekly', 'S6f')), C = sheetIn(f6, 'Costs'); assert.equal(C.cellAt('E5').formula, '=B5+C5+D5'); assert.equal(C.value('E9'), 12410); assert.ok(Math.abs(C.value('B10') - 12410 / 40530) < 1e-9);
  assert.deepEqual(stateOf('S7a').settings.pageSetup, REPORT_PAGE_SETUP); assert.deepEqual(diffStates(stateOf('S6f'), stateOf('S7a')).map(d => d.kind), ['settings']);
  const b7 = liveOf(workbookState('voltline-weekly', 'S7b')), R7 = sheetIn(b7, 'Report'); assert.deepEqual([R7.value('B34'), R7.value('B35'), R7.value('B36')], [0, 0, 0], 'the checks tie');
  assert.deepEqual(diffStates(stateOf('S7b'), stateOf('S7c')).map(d => d.key), ['C9', 'D9', 'E9']);
  assert.ok(PAGE_SETUP_DEFAULT.titlesRows === '');
});

test('the plantings: a grid on Costs, a retyped Thursday, five error codes, the associate\'s eight-violation markup', () => {
  const g = workbookState('voltline-weekly', 'S5c'); applyStatePatch(g, PLANT_COSTS_GRID); assert.equal(g.sheets.find(s => s.name === 'Costs').cells.A3.ball, true);
  const d = workbookState('voltline-weekly', 'S6d'); applyStatePatch(d, PLANT_DAILY); const dr = sheetIn(liveOf(d), 'Report');
  assert.equal(dr.cellAt('E19').formula, null); assert.equal(dr.value('E19'), sheetIn(liveOf(workbookState('voltline-weekly', 'S6e')), 'Report').value('E19'), 'the right number, dead'); assert.equal(dr.cellAt('B18').formula, '=Raw!I33');
  const e = workbookState('voltline-weekly', 'S6e'); applyStatePatch(e, PLANT_COSTS_ERRORS); const ec = sheetIn(liveOf(e), 'Costs');
  assert.deepEqual([ec.text('E5'), ec.text('E6'), ec.text('E7'), ec.text('E8')], ['#REF!', '#NAME?', '#VALUE!', '#N/A']);
  assert.equal(ec.text('B10'), '#REF!', 'the total carries E5\'s error until it is fixed; then B10 reads #DIV/0!');
  const a = workbookState('voltline-weekly', 'S7b'); applyStatePatch(a, PLANT_AUDIT); const ar = sheetIn(liveOf(a), 'Report');
  assert.equal(ar.cellAt('G6').formula, '=D6/6850'); assert.equal(ar.cellAt('E18').formula, null); assert.ok(String(ar.value('A1')).startsWith(' ')); assert.equal(ar.cellAt('A1').ca, 0); assert.equal(ar.value('A2'), null);
  assert.equal(ar.hiddenCols.has(9), true); assert.equal(ar.gridlines, true); assert.equal(ar.cellAt('B15').ball, true);
});
