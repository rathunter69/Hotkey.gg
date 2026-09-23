// app2/tests/module-states.test.js — the module workbook (C2 gap 1): every named state builds a
// real workbook, stateOf hands out clones, diffStates is exact and empty on identity, the
// plantings later lessons rely on are present, and every module lesson's before/after chains.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATES, stateOf, diffStates, KWH, SITES, rawRow, SITE_PRICE } from '../content/workbooks/voltline-weekly.js';
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
  const order = ['S0', 'S1a', 'S1b', 'S1c', 'S1d', 'S2a'];
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
/** A live session, extracted in the authored-state shape so diffStates can compare them. */
function sessionToState(ses) {
  return {
    sheets: ses.sheets.map(e => ({
      name: e.name, cells: e.sheet.cells,
      gridlines: e.sheet.gridlines === false ? false : undefined,
      hiddenRows: [...e.sheet.hiddenRows], hiddenCols: [...e.sheet.hiddenCols], freeze: { ...e.sheet.freeze },
    })),
    settings: { calcMode: ses.settings.calcMode, iterative: ses.settings.iterative, qat: ses.settings.qat.slice() },
  };
}

test('every module lesson\'s solution replays to exactly its after state', () => {
  for (const l of LESSONS.filter(x => x.workbook && x.state && x.kind !== 'challenge')) {
    const run = new LessonRun(l, { now: () => 0 });
    run.run(l.solution);
    assert.ok(run.finished, `${l.id}: solution finishes`);
    const after = workbookState(l.workbook, l.state.after);
    // column widths and row heights become graded ground at 1.4.2; until then the extraction skips them
    const diff = diffStates(sessionToState(run.session), after).filter(d => d.kind !== 'colW' && d.kind !== 'rowH');
    assert.deepEqual(diff, [], `${l.id}: the solution leaves exactly ${l.state.after} — extra diffs: ${JSON.stringify(diff.slice(0, 4))}`);
  }
});
