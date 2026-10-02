// app2/tests/module-states.test.js — the Chapter 1 module workbook (C2 gap 1, re-skinned to Clearcoat
// Express in run R1): every named state builds a real workbook, stateOf hands out clones, diffStates
// is exact and empty on identity, the plantings later lessons rely on are present, and every module
// lesson's before/after chains and replays.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATES, STATE_ORDER, stateOf, diffStates, sessionToState, WASHES, SITES, rawRow, SITE_TICKET, COST_PER_WASH, BLANK_F, MISSING_DAY, WRONG_FIGURE, STALE_WEEK, THIS_WEEK, NAMES, CEDAR_PARK, MUELLER_LAST_WEEK } from '../content/workbooks/clearcoat-weekly.js';
import { SEEDED_KINDS } from '../content/schema.js';
import { WORKBOOKS, workbookState } from '../content/workbooks/index.js';
import { CLUSTERS, pickCluster, siteNames } from '../content/workbooks/clusters.js';
import { mulberry32 } from '../engine/rng.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { LessonRun } from '../app/runner.js';
import { LESSONS } from '../content/index.js';

const WB = 'clearcoat-weekly';
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
  assert.equal(workbookState(WB, 'S0').sheets.length, 4);
  assert.throws(() => workbookState(WB, 'S99'), /unknown workbook state/);
  assert.throws(() => workbookState('nope', 'S0'), /unknown workbook/);
  assert.equal(WORKBOOKS['voltline-weekly'], undefined, 'the Voltline workbook is retired (run R1)');
});

test('diffStates: empty on identity, exact on a change, and each derivation is a small diff', () => {
  for (const id in STATES) assert.deepEqual(diffStates(stateOf(id), stateOf(id)), [], id + ' vs itself');
  const a = stateOf('S1d'), b = stateOf('S1d');
  b.sheets.find(s => s.name === 'Inputs').cells.B4 = { value: 1.6, fontColor: 'blue' };
  const d = diffStates(a, b);
  assert.equal(d.length, 1);
  assert.deepEqual([d[0].sheet, d[0].kind, d[0].key], ['Inputs', 'cell', 'B4']);
  // the chain S0 → S1a → … each step changes something, and only the lesson's own ground
  const order = STATE_ORDER;
  assert.deepEqual(order.slice(0, 7), ['S0', 'S1a', 'S1b', 'S1c', 'S1d', 'S1e', 'S2a']);
  for (let i = 1; i < order.length; i++) {
    const diff = diffStates(stateOf(order[i - 1]), stateOf(order[i]));
    assert.ok(diff.length > 0, `${order[i]} differs from ${order[i - 1]}`);
  }
  // S1b touches exactly three things: Report's gridlines, and the two inputs 1.1.3 formats as the payoff
  // of Ctrl+1 and Alt H O E (B6 with a separator, B7 a percentage)
  const d1b = diffStates(stateOf('S1a'), stateOf('S1b'));
  assert.deepEqual(d1b.map(x => [x.sheet, x.kind, x.key]), [['Report', 'gridlines', 'gridlines'], ['Inputs', 'cell', 'B6'], ['Inputs', 'cell', 'B7']]);
  // S1e (1.2.2) changes only Raw: the selections' payoffs (aligned headers, row 1's height, column B fitted)
  const d1e = diffStates(stateOf('S1d'), stateOf('S1e'));
  assert.ok(d1e.length > 0 && d1e.every(x => x.sheet === 'Raw'), 'S1e touches Raw only');
});

test('the figures are deterministic and the plantings sit where the map says', () => {
  assert.deepEqual(WASHES, (() => { const again = WASHES; return again; })());
  const s0 = stateOf('S0');
  const raw = s0.sheets[0];
  assert.equal(raw.name, 'Raw');
  assert.deepEqual(s0.sheets.map(s => s.name), ['Raw', 'Sheet2', 'Old wk37', 'Costs']);
  const c = raw.cells;
  assert.equal(c.B14.value, 'Muller');
  assert.equal(c.B27.value, 'Riversid');
  assert.equal(c.B55.value, 'Airprot');
  assert.equal(c.C33.value, '240 ');
  assert.equal(c.E41.value, WRONG_FIGURE.wrong);
  assert.equal(c.H3.value, 'draft');
  for (const ref of ['C61', 'D61', 'E61', 'F61']) assert.equal(c[ref], undefined, ref + ': Airport Saturday never came through');
  for (const r of BLANK_F) assert.equal(c['F' + r], undefined, 'F' + r + ' blank wash cost');
  assert.match(c.A65.value, /Week of Sep 8/);
  // the feed's site-totals block beside the feed: live SUMs the later modules freeze and watch
  assert.equal(c.H7.value, 'Site'); assert.equal(c.I8.formula, '=SUM(C8:C13)'); assert.equal(c.K12.formula, '=SUM(F56:F61)', 'this week\'s rows'); assert.equal(c.M8.value, 'AUS-01'); assert.equal(c.I13.formula, '=SUM(I8:I12)');
  assert.ok(c.L8.value < 0 && Number.isInteger(c.L8.value), 'last week\'s revenue arrives as negative cents');
  assert.equal(s0.sheets[1].cells.B3.value, STALE_WEEK, 'the inherited week label is last week\'s');
  // the module 1.3–1.4 states: the feed complete and clean, the Report skeleton, values frozen, the total live, Cedar Park in, the outline and the freeze
  const r3a = stateOf('S3a').sheets[1].cells; assert.equal(r3a.C61.value, MISSING_DAY.washes); assert.equal(r3a.F12.value, 0); assert.equal(r3a.H3.value, undefined);
  const r3b = stateOf('S3b').sheets[1].cells; assert.equal(r3b.B14.value, 'Mueller'); assert.equal(r3b.C33.value, 240); assert.equal(r3b.E41.value, WRONG_FIGURE.right);
  const p3c = stateOf('S3c').sheets[0].cells; assert.equal(p3c.A4.value, 'Site'); assert.equal(p3c.C4.bold, true); assert.equal(p3c.B9.value, STALE_WEEK); assert.equal(p3c.G13.value, STALE_WEEK);
  assert.match(stateOf('S3c').sheets[1].cells.J1.value, /^Notes/); assert.equal(stateOf('S3c').sheets[1].cells.A64, undefined, 'the Notes block moved beside the feed');
  const p3d = stateOf('S3d').sheets[0].cells; assert.equal(p3d.C10.formula, '=SUM(C5:C9)'); assert.equal(typeof p3d.C5.value, 'number'); assert.equal(p3d.C5.formula, undefined, 'a value, not a link'); assert.equal(p3d.I4.value, 'Old code'); assert.equal(p3d.F23.value, 'Airport');
  assert.ok(p3d.H5.value > 0, 'last week\'s revenue flipped and scaled to dollars');
  const p3e = stateOf('S3e').sheets[0].cells; assert.equal(p3e.B5.value, THIS_WEEK); assert.equal(p3e.G14.value, 'Sat'); assert.equal(p3e.G15.value, 20); assert.equal(stateOf('S3e').sheets[1].cells.B55.value, 'Airport');
  assert.deepEqual(stateOf('S3e').names, NAMES); assert.equal(stateOf('S3e').sheets[2].cells.D4.fmtStyle, 'date', 'the date stamp beside the cost');
  const p4a = stateOf('S4a').sheets[0].cells; assert.equal(p4a.A9.value, 'Cedar Park'); assert.equal(p4a.C9.value, CEDAR_PARK.washes); assert.equal(p4a.C11.formula, '=SUM(C5:C10)'); assert.equal(p4a.H4.value, 'Margin %'); assert.equal(p4a.I4.value, 'Prior week rev ($)'); assert.equal(p4a.J4, undefined, 'Old code is gone');
  const s4b = stateOf('S4b').sheets[0]; assert.equal(s4b.colW[2], 89); assert.equal(s4b.colW[9], 103); assert.ok(s4b.colW[1] > 64 && s4b.colW[1] < 130, 'A fits the site names, not the title'); assert.equal(s4b.rowH[4], 40, 'the wrapped header row stands two lines');
  const s4c = stateOf('S4c').sheets[0]; assert.deepEqual(s4c.groups.cols, [{ c1: 5, c2: 6, collapsed: false }]); assert.deepEqual(s4c.freeze, { r: 4, c: 1 }); assert.equal((s4c.hiddenCols || []).length, 0);
  // 60 data rows, site-major: washes in band, revenue live, the wash cost at the supplier rate
  assert.equal(rawRow('Domain', 0), 2); assert.equal(rawRow('Airport', 11), 61);
  for (const site of SITES) for (let d = 0; d < 12; d++) {
    const r = rawRow(site, d);
    if (r === 61 || r === 33) continue;
    const washes = c['C' + r].value;
    assert.ok(washes >= 150 && washes <= 350 && washes % 5 === 0, `washes in band at row ${r}`);
    assert.equal(c['D' + r].value, SITE_TICKET[site]);
    if (r !== 41) assert.equal(c['E' + r].formula, `=C${r}*D${r}`, `revenue is live at row ${r}`);
    if (!BLANK_F.includes(r)) assert.ok(Math.abs(c['F' + r].value - washes * COST_PER_WASH) < 0.01, `wash cost ties at row ${r}`);
  }
  // Costs: one live total, four typed (1.2.4's constants-vs-formulas material)
  const costs = s0.sheets[3].cells;
  assert.equal(costs.E4.formula, '=B4+C4+D4');
  for (const r of [5, 6, 7, 8]) { assert.equal(costs['E' + r].formula, undefined); assert.equal(typeof costs['E' + r].value, 'number'); }
  assert.equal(costs.C5, undefined); assert.equal(costs.C7, undefined);
  // S1a: Old wk37 gone, Report first, Inputs renamed
  assert.deepEqual(stateOf('S1a').sheets.map(s => s.name), ['Report', 'Raw', 'Inputs', 'Costs']);
  // S1c settings: iterative on, Enter stays put, the formatting commands on the QAT
  assert.equal(stateOf('S1c').settings.iterative, true);
  assert.equal(stateOf('S1c').settings.enterMoves, false);
  assert.ok(stateOf('S1c').settings.qat.includes('fontColor'));
  // S1d: the cost per wash is a blue input; the typed 1.5 inside B14 waits for 1.6.1 to point it at the name
  const inputs = stateOf('S1d').sheets.find(s => s.name === 'Inputs').cells;
  assert.equal(inputs.B14.formula, '=B6*1.5');
  assert.equal(inputs.B4.value, COST_PER_WASH);
  assert.equal(inputs.B4.fontColor, 'blue');
  assert.equal(inputs.B15.fontColor, undefined, 'the formula colored as an input is back to automatic');
  assert.match(stateOf('S3a').sheets[2].cells.A2.value, /USD/);
});

test('LessonRun builds a module lesson from its before state (settings included)', () => {
  const fake = {
    id: 'x', workbook: WB, module: 'open-and-set-up', state: { before: 'S1c', after: 'S1d' },
    goals: [{ id: 'g', text: 'x.', check: s => s.value('Z99') === 'done' }],
  };
  const run = new LessonRun(fake, { mode: 'guided' });
  assert.deepEqual(run.session.sheets.map(s => s.name), ['Report', 'Raw', 'Inputs', 'Costs']);
  assert.equal(run.session.settings.iterative, true);
  assert.equal(run.session.settings.enterMoves, false);
  assert.ok(run.session.settings.qat.includes('borders'));
  assert.equal(run.session.sheets[0].sheet.gridlines, false, 'Report gridlines off carried from S1b');
  assert.equal(run.session.sheets[1].sheet.cellAt('B14').value, 'Muller');
  // a statePatch (the challenge seed's clothing) lands before the first key
  const seeded = new LessonRun(fake, { mode: 'guided', statePatch: { 'Raw!B14': { value: 'Muller Corner' }, 'Inputs!B6': { value: 9500 } } });
  assert.equal(seeded.session.sheets[1].sheet.cellAt('B14').value, 'Muller Corner');
  assert.equal(seeded.session.sheets[2].sheet.cellAt('B6').value, 9500);
  // the session reads back as a state: identity with its before state
  assert.deepEqual(diffStates(sessionToState(run.session), stateOf('S1c')), []);
});

test('the clothing pool: 12 cities, 5+ sites each, deterministic picks', () => {
  assert.equal(CLUSTERS.length, 12);
  for (const cl of CLUSTERS) { assert.ok(cl.sites.length >= 5, cl.city); assert.match(cl.week, /^Week of [A-Z][a-z]{2} \d{1,2}, \d{4}$/); }
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
  let prevAfter = null, prevWb = null;
  for (const l of moduleLessons) {
    if (l.workbook !== prevWb) { prevAfter = null; prevWb = l.workbook; }   // each chapter's workbook starts its own chain
    if (/project-and-assessment$/.test(l.module)) continue;   // 1.8 and 2.8 open the next export (S8raw), not the chain's end
    // a lesson that opens another file of the same workbook (5.2.1 opens the model after 5.1's pages by hand) says so in state.opens
    if (prevAfter != null && l.kind !== 'challenge' && !l.state.opens) assert.equal(l.state.before, prevAfter, `${l.id}: starts where the last lesson ended`);
    if (l.kind !== 'challenge') prevAfter = l.state.after || l.state.before;
  }
  assert.ok(true);
});

/* the solution produces exactly the after state (C2: the chain is real): checked in lesson-replay.js on the one replay of each lesson */

/* ---------------- modules 1.5–1.7 (C2 Run 3): the format, formula, print and check states, and what the lessons plant ---------------- */
import { PLANT_GRIDS, PLANT_DAILY, PLANT_COSTS_ERRORS, PLANT_AUDIT, REPORT_PAGE_SETUP, PAGE_SETUP_DEFAULT, COUNTS_FMT } from '../content/workbooks/clearcoat-weekly.js';
import { applyStatePatch } from '../content/workbooks/index.js';
const liveOf = st => { const build = sp => new Sheet({ cells: structuredClone(sp.cells), colW: sp.colW, hiddenCols: sp.hiddenCols, gridlines: sp.gridlines }); const ses = new Session(build(st.sheets[0]), { now: () => 0 }); ses.sheets[0].name = st.sheets[0].name; for (const sh of st.sheets.slice(1)) ses.addSheet(sh.name, build(sh)); ses.names = st.names; for (let i = 0; i < 2; i++) for (const e of ses.sheets) e.sheet.recalc(); return ses; };
const sheetIn = (ses, name) => ses.sheets.find(x => x.name === name).sheet;
const domainThisWeek = WASHES.Domain.slice(6).reduce((t, w) => t + w, 0);

test('1.5: the figures read as a banker reads them; 1.6: every Report figure is live and green, wash cost runs off the one cost per wash; 1.7: the checks read zero', () => {
  const r5 = stateOf('S5a').sheets[0].cells;
  assert.deepEqual([r5.C5.fmtStyle, r5.C5.decimals, r5.D5.fmtStyle, r5.D11.fmtStyle, r5.G5.decimals, r5.H5.fmtStyle], ['comma', 0, 'currency', 'currency', 2, 'percent']);
  assert.deepEqual({ fmtStyle: r5.B17.fmtStyle, numFmt: r5.B17.numFmt }, COUNTS_FMT, 'the daily block holds counts');
  const r5b = stateOf('S5b').sheets[0].cells; assert.equal(r5b.A11.bt, true); assert.equal(r5b.C11.bold, true); assert.equal(r5b.A1.fsz, 16);
  const r5c = stateOf('S5c').sheets[0].cells; assert.equal(r5c.A1.ca, 9); assert.equal(r5c.C4.align, 'r'); assert.equal(r5c.A17.indent, 1);
  const d6 = liveOf(workbookState(WB, 'S6d')), R = sheetIn(d6, 'Report');
  assert.equal(R.cellAt('C5').formula, '=Raw!I8'); assert.equal(R.cellAt('C5').fontColor, 'green'); assert.equal(R.value('C5'), domainThisWeek);
  assert.ok(Math.abs(R.value('E5') - domainThisWeek * COST_PER_WASH) < 1e-6, 'wash cost is washes × the cost per wash on Inputs'); assert.equal(R.cellAt('C9').formula, null, 'Cedar Park stays typed');
  const e6 = liveOf(workbookState(WB, 'S6e')); assert.equal(sheetIn(e6, 'Report').cellAt('B17').formula, '=Raw!I32'); assert.equal(sheetIn(e6, 'Report').value('G21'), MISSING_DAY.washes, 'Airport Saturday is the emailed day');
  const f6 = liveOf(workbookState(WB, 'S6f')), C = sheetIn(f6, 'Costs'); assert.equal(C.cellAt('E5').formula, '=B5+C5+D5'); assert.equal(C.value('E9'), 12410); assert.equal(C.value('B11'), sheetIn(f6, 'Report').value('C11'), 'the washes link to the Report'); assert.ok(Math.abs(C.value('B10') - 12410 / C.value('B11')) < 1e-9);
  assert.deepEqual(stateOf('S7a').settings.pageSetup, REPORT_PAGE_SETUP); assert.deepEqual(diffStates(stateOf('S6f'), stateOf('S7a')).map(d => d.kind), ['settings']);
  const b7 = liveOf(workbookState(WB, 'S7b')), R7 = sheetIn(b7, 'Report'); assert.deepEqual([R7.value('B34'), R7.value('B35'), R7.value('B36')], [0, 0, 0], 'the checks tie');
  assert.deepEqual(diffStates(stateOf('S7b'), stateOf('S7c')).map(d => d.key), ['C9', 'D9', 'E9']);
  assert.ok(PAGE_SETUP_DEFAULT.titlesRows === '');
});

test('the plantings: grids on three sheets, a retyped Thursday, five error codes, the CFO\'s eight-violation markup', () => {
  const g = workbookState(WB, 'S5c'); applyStatePatch(g, PLANT_GRIDS);
  assert.equal(g.sheets.find(s => s.name === 'Costs').cells.A3.ball, true); assert.equal(g.sheets.find(s => s.name === 'Raw').cells.H7.ball, true); assert.equal(g.sheets.find(s => s.name === 'Inputs').cells.A3.ball, true);
  const d = workbookState(WB, 'S6d'); applyStatePatch(d, PLANT_DAILY); const dr = sheetIn(liveOf(d), 'Report');
  assert.equal(dr.cellAt('E19').formula, null); assert.equal(dr.value('E19'), sheetIn(liveOf(workbookState(WB, 'S6e')), 'Report').value('E19'), 'the right number, dead'); assert.equal(dr.cellAt('B18').formula, '=Raw!I33');
  const e = workbookState(WB, 'S6e'); applyStatePatch(e, PLANT_COSTS_ERRORS); const ec = sheetIn(liveOf(e), 'Costs');
  assert.deepEqual([ec.text('E5'), ec.text('E6'), ec.text('E7'), ec.text('E8')], ['#REF!', '#NAME?', '#VALUE!', '#N/A']);
  assert.equal(ec.text('B10'), '#REF!', 'the total carries E5\'s error until it is fixed; then B10 reads #DIV/0!');
  const a = workbookState(WB, 'S7b'); applyStatePatch(a, PLANT_AUDIT); const ar = sheetIn(liveOf(a), 'Report');
  assert.equal(ar.cellAt('G6').formula, `=D6/${MUELLER_LAST_WEEK}`); assert.equal(ar.cellAt('E18').formula, null); assert.ok(String(ar.value('A1')).startsWith(' ')); assert.equal(ar.cellAt('A1').ca, 0); assert.equal(ar.value('A2'), null);
  assert.equal(ar.hiddenCols.has(9), true); assert.equal(ar.gridlines, true); assert.equal(ar.cellAt('B15').ball, true);
});
