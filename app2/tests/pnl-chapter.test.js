// app2/tests/pnl-chapter.test.js — the Chapter 2 workbook (clearcoat-pnl) through modules 2.3 to
// 2.7, the project and the assessment: every state builds, the chain of lesson end states reaches
// the solved workbook exactly, the solved pages pass the sheet standard and their checks tie, each
// state carries what its lesson leaves (the plantings the next lesson works on), the lesson
// plantings land where the script says, and the project's and a sister operator's exports solve
// through the same builder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STATES, STATE_ORDER, CHAIN, stateOf, CHALLENGES, challengeSeed, STRAY_RULES, PLANT_ROW_FLAG, FLAG_ROW, CF_ROW_FLAG, diffStates, sessionToState, finish, readExport, sisterExport, sisterPatch, SISTERS,
  PLANT_GRID, PLANT_MONTHLY, PLANT_STRAY, PLANT_CLUSTER_LINES, PLANT_DUP_LABEL,
  CODES, LABELS, LABEL_NOTE, FOOTNOTE, SOURCE_LINE, TITLE, TITLE_FORMULAS, UNITS_FORMULA, TIMELINE_FORMULAS, CH2_PAGE_SETUP, DETAIL, DETAIL_NAMES, NAV, PRINT,
  MONTHLY_ROW, MARGIN_W, TITLE_ROW_H, DIVIDER_FILL, CF_CHECKS, EXPORT, EXPORT_NEXT, FIGURES_NEXT, cleanLabel, YEAR_COLS, MONTH_COLS, LINE_ROWS, COST_ROWS,
} from '../content/workbooks/clearcoat-pnl.js';
import { applyStatePatch } from '../content/workbooks/index.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { sheetStandard } from '../app/graders.js';
import { mulberry32 } from '../engine/rng.js';
import { FIGURE_W } from '../content/workbooks/page.js';

const build = sp => new Sheet({ cells: structuredClone(sp.cells || {}), colW: sp.colW, rowH: sp.rowH, hiddenRows: sp.hiddenRows, hiddenCols: sp.hiddenCols, freeze: sp.freeze, gridlines: sp.gridlines, groups: sp.groups, condFmt: sp.condFmt });
function live(st) {
  const ses = new Session(build(st.sheets[0]), { now: () => 0 });
  ses.sheets[0].name = st.sheets[0].name;
  for (const sh of st.sheets.slice(1)) ses.addSheet(sh.name, build(sh));
  if (st.names) ses.names = st.names;
  if (st.settings) { ses.settings.calcMode = st.settings.calcMode; ses.settings.iterative = st.settings.iterative; ses.settings.qat = st.settings.qat.slice(); if (st.settings.pageSetup) ses.settings.pageSetup = structuredClone(st.settings.pageSetup); }
  for (let i = 0; i < 2; i++) for (const e of ses.sheets) e.sheet.recalc();
  return ses;
}
const sheetIn = (ses, name) => ses.sheets.find(x => x.name === name).sheet;
const cells = (id, name) => stateOf(id).sheets.find(s => s.name === name).cells;
const sheet = (id, name) => stateOf(id).sheets.find(s => s.name === name);
const close = (a, b) => Math.abs(a - b) < 1e-6;
const PAGES = [['Pdone', 'P&L', true], ['Pdone', 'Monthly', true], ['Pdone', 'Print', true], ['Pdone', 'Monthly detail', false], ['S8done', 'P&L', true], ['S8done', 'Monthly', true], ['S8done', 'Print', true]];

test('every state builds into a live workbook, and a session reads each one back as itself', () => {
  for (const id of STATE_ORDER) {
    const st = stateOf(id);
    const ses = live(st);
    assert.equal(ses.sheets.length, st.sheets.length, id);
    assert.deepEqual(diffStates(sessionToState(ses), st), [], `${id} survives the round trip through a session`);
  }
});

test('the chain of lesson end states reaches the solved workbook exactly, one small step at a time', () => {
  assert.equal(CHAIN[0], 'S1raw'); assert.equal(CHAIN[CHAIN.length - 1], 'S7b');
  assert.deepEqual(CHAIN.slice(9), ['S3a', 'S3b', 'S3c', 'S3d', 'S3e', 'S3f', 'S4a', 'S4b', 'S4c', 'S4d', 'S5a', 'S5b', 'S5c', 'S5d', 'S6a', 'S6b', 'S6c', 'S6d', 'S6e', 'S7a', 'S7b']);
  for (let i = 1; i < CHAIN.length; i++) assert.ok(diffStates(stateOf(CHAIN[i - 1]), stateOf(CHAIN[i])).length > 0, `${CHAIN[i]} differs from ${CHAIN[i - 1]}`);
  assert.deepEqual(diffStates(stateOf('S7b'), stateOf('Pdone')), [], 'the chain ends on the solved chapter');
  assert.deepEqual(diffStates(stateOf('S8done'), finish(stateOf('S8raw'))), [], 'the project solves through the same builder');
});

test('the solved pages pass the sheet standard, and every check on them reads zero', () => {
  for (const [id, name, read] of PAGES) {
    const ses = live(stateOf(id));
    assert.deepEqual(sheetStandard(sheetIn(ses, name), { chapter: 2, read }), [], `${id} ${name}`);
  }
  for (const id of ['Pdone', 'S8done']) {
    const ses = live(stateOf(id));
    const pl = sheetIn(ses, 'P&L'), mon = sheetIn(ses, 'Monthly'), pr = sheetIn(ses, 'Print');
    for (const ref of ['C39', 'C40']) assert.ok(close(pl.value(ref), 0), `${id} P&L!${ref} ties`);
    for (const ref of ['C34', 'C35']) assert.ok(close(mon.value(ref), 0), `${id} Monthly!${ref} ties`);
    assert.ok(close(pr.value('C' + PRINT.check), 0), `${id} Print ties`);
    assert.equal(pl.value('C39'), 0, 'the revenue check is rounded, so the ledger\'s decimals never leave it a hair off zero');
    for (const col of YEAR_COLS) assert.ok(close(pl.value(col + '24'), pl.value(col + '10') + pl.value(col + '20') + pl.value(col + '23')), `${id} ${col}: EBITDA adds down`);
    assert.ok(close(mon.value('O24'), pl.value('E24')), `${id}: the full year on Monthly is the last year on the P&L`);
  }
  const done = live(stateOf('Pdone'));
  const pl = sheetIn(done, 'P&L'), det = sheetIn(done, 'Monthly detail');
  assert.equal(pl.value('E10'), 50000); assert.equal(pl.value('E24'), 16600); assert.equal(pl.value('E33'), 40);   // the figures Chapters 4 and 5 read
  assert.equal(pl.value('A1'), 'Clearcoat Express - Historical Financials'); assert.equal(pl.text('C4'), 'FY24A'); assert.equal(pl.text('E4'), 'FY26E');
  assert.equal(sheetIn(done, 'Monthly').value('C5'), 'January 2026'); assert.equal(sheetIn(done, 'Monthly').text('N4'), 'Dec-26');
  assert.equal(sheetIn(done, 'Print').value('C4'), 'FY24A'); assert.equal(sheetIn(done, 'Print').value('B4'), 'Fiscal years 2024 to 2026');
  assert.equal(sheetIn(done, 'Inputs').value('B19'), 'Revenue of 50,000k in FY26E'); assert.equal(sheetIn(done, 'Inputs').text('B18'), '12/30/2026');
  for (const ref of ['C' + DETAIL.checkRevenue, 'C' + DETAIL.checkEbitda]) assert.equal(det.value(ref), 0, 'the clusters add to Monthly');
  const next = live(stateOf('S8done'));
  assert.equal(sheetIn(next, 'P&L').text('E4'), 'FY27E'); assert.equal(sheetIn(next, 'P&L').value('E24'), 20210); assert.equal(Math.round(sheetIn(next, 'P&L').value('D10')), 50000, 'FY26 closed as the estimate said, to the ledger\'s decimals');
});

test('each lesson end state carries what its lesson leaves', () => {
  const p3a = cells('S3a', 'P&L');
  assert.deepEqual(p3a.A1, { value: TITLE, bold: true, fsz: 16, ca: 5 }); assert.equal(p3a.B6.bold, true); assert.equal(p3a.B12.value, 'Site costs'); assert.equal(p3a.B32.value, 'Memo');
  assert.equal(p3a.C10.bold, true); assert.equal(p3a.B7.indent, 1); assert.equal(p3a.C7.fontColor, 'blue'); assert.equal(p3a.A7, undefined); assert.equal(p3a.A4, undefined); assert.equal(p3a.B38.bold, true);
  const p3b = cells('S3b', 'P&L'); assert.equal(p3b.D4.br, true); assert.equal(p3b.D35.br, true); assert.equal(p3b.D36, undefined); assert.equal(p3b.E4.fill, DIVIDER_FILL); assert.equal(cells('S3b', 'Monthly').N4.fill, DIVIDER_FILL);
  const p3c = cells('S3c', 'P&L'); assert.equal(p3c.B10.bt, true); assert.equal(p3c.E20.bt, true); assert.equal(p3c.C24.bdbl, true); assert.equal(p3c.C24.bb, undefined); assert.equal(sheet('S3c', 'P&L').gridlines, false); assert.equal(sheet('S3b', 'P&L').gridlines, undefined);
  const p3d = cells('S3d', 'P&L'); assert.equal(p3d.B7.value, LABELS[7]); assert.equal(p3d.B9.value, LABEL_NOTE); assert.equal(p3d.B35.value, LABELS[35]); assert.deepEqual(p3d.B36, { value: SOURCE_LINE, it: true }); assert.deepEqual(p3d.B37, { value: FOOTNOTE, it: true }); assert.equal(p3d.B24.value, 'EBITDA');
  const s3e = sheet('S3e', 'P&L'); assert.deepEqual(s3e.colW, { 1: MARGIN_W, 2: s3e.colW[2], 3: FIGURE_W, 4: FIGURE_W, 5: FIGURE_W }); assert.ok(s3e.colW[2] > 150 && s3e.colW[2] < 230, 'B fits its labels, not the title'); assert.deepEqual(s3e.rowH, { 1: TITLE_ROW_H }); assert.deepEqual(s3e.freeze, { r: 4, c: 2 });
  const m3f = sheet('S3f', 'Monthly'), mc = m3f.cells;
  assert.equal(mc.C7.numFmt, CODES.dollar); assert.equal(mc.C7.fontColor, 'blue'); assert.equal(mc.O7.fontColor, undefined, 'the full-year formulas are back to black'); assert.equal(mc.O24.bdbl, true); assert.equal(mc.B20.bt, true); assert.equal(mc.B13.indent, 1);
  assert.equal(mc.A1.ca, 15); assert.equal(mc.A1.fsz, 16); assert.equal(mc.D27.numFmt, CODES.pct); assert.equal(mc.D27.it, true); assert.ok(mc.C13.value < 0, 'Monthly\'s costs arrive flipped'); assert.equal(mc.C22.formula, '=C10+C20');
  assert.equal(m3f.colW[15], FIGURE_W); assert.equal(m3f.gridlines, false); assert.deepEqual(m3f.freeze, { r: 4, c: 2 });
  const m4a = cells('S4a', 'Monthly'); assert.equal(m4a.O4.wrap, true); assert.equal(m4a.O4.value, 'Full year'); assert.equal(m4a.C4.bold, true); assert.equal(m4a.B4.value, 'Month ending'); assert.equal(m4a.A2.it, true);
  assert.deepEqual(sheet('S4b', 'P&L').groups.rows.map(g => [g.r1, g.r2]), [[13, 19], [33, 35]]);
  assert.deepEqual(sheet('S4c', 'P&L').groups.rows.map(g => [g.r1, g.r2]), [[13, 19], [26, 30], [33, 35]]); assert.equal(sheet('S4c', 'P&L').hiddenRows, undefined);
  const d4c = stateOf('S4c').sheets[4]; assert.equal(d4c.name, 'Monthly detail'); assert.equal(d4c.cells.A1.bold, true); assert.equal(d4c.cells.B5.value, 'AUSTIN'); assert.equal(d4c.cells.B6.value, 'RETAIL_WASH  REVENUE'); assert.equal(d4c.cells.C9.formula, '=SUM(C6:C8)'); assert.equal(d4c.cells.B20, undefined, 'one cluster so far');
  assert.deepEqual(stateOf('S4d').names, DETAIL_NAMES); const d4d = cells('S4d', 'Monthly detail'); assert.equal(d4d[NAV.col + NAV.head].value, 'Go to'); assert.equal(d4d.Q7.value, 'EBITDA'); assert.equal(d4d['B' + DETAIL.company].value, 'COMPANY'); assert.equal(d4d['C' + DETAIL.rev].formula, '=C9+C24+C39+C54'); assert.deepEqual(stateOf('S4d').sheets[4].freeze, { r: 4, c: 2 });
  assert.deepEqual(sheet('S5a', 'P&L').condFmt.map(r => [r.kind, r.range]), [['cellValue', 'C27:E29']]); assert.deepEqual(sheet('S5a', 'Monthly').condFmt.map(r => [r.op, r.v1, r.range]), [['<', 3800, 'C10:N10']]);
  assert.deepEqual(sheet('S5b', 'P&L').condFmt.map(r => r.range), ['B7:E9', 'C39:C40', 'C27:E29']); assert.equal(sheet('S5b', 'P&L').condFmt[1].stopIfTrue, false);
  assert.deepEqual(sheet('S5c', 'Monthly detail').condFmt.map(r => [r.kind, r.range]), [['dataBar', `C${DETAIL.rev}:N${DETAIL.rev}`]]); assert.deepEqual(sheet('S5c', 'Monthly').condFmt.length, 1, 'the bars came off the page');
  assert.deepEqual(sheet('S5d', 'P&L').condFmt, [CF_CHECKS, { kind: 'cellValue', op: '<', v1: 0, range: 'C27:E30', style: 'redtext' }]);
  const m6a = cells('S6a', 'Monthly'); assert.equal(m6a.C5.formula, '=TEXT(C4,"mmmm yyyy")'); assert.equal(m6a.N5.align, 'r'); assert.equal(cells('S6a', 'Print').E4.formula, `="FY"&TEXT('P&L'!E4,"yy")&'P&L'!E5`); assert.equal(cells('S6a', 'Print').E4.fontColor, 'green'); assert.match(cells('S6a', 'Inputs').B19.formula, /^="Revenue of "&TEXT\('P&L'!E10/);
  const m6b = cells('S6b', 'Monthly'); assert.equal(m6b.D4.formula, '=EOMONTH(C4,1)'); assert.equal(m6b.D4.value, undefined); assert.equal(m6b.C4.fontColor, 'blue'); assert.equal(typeof m6b.C4.value, 'number'); const p6b = cells('S6b', 'P&L'); assert.equal(p6b.C4.formula, TIMELINE_FORMULAS.C4); assert.equal(p6b.C4.fontColor, 'green'); assert.equal(p6b.E4.numFmt, CODES.fyEstimate); assert.equal(cells('S6b', 'Inputs').B18.formula, '=EDATE(B10,3)');
  assert.equal(cells('S6c', 'P&L').A1.formula, TITLE_FORMULAS['P&L']); assert.equal(cells('S6c', 'P&L').A1.ca, 5); assert.equal(cells('S6c', 'Monthly').A1.formula, TITLE_FORMULAS.Monthly('FY26')); assert.equal(cells('S6c', 'Print').A1.formula, TITLE_FORMULAS.Print); assert.match(cells('S6c', 'Print').B4.formula, /^="Fiscal years "/);
  const d6d = cells('S6d', 'Monthly detail'); assert.equal(d6d.B6.value, 'Retail Wash Revenue'); assert.equal(d6d.B8.value, 'Other Revenue'); assert.equal(d6d.B5.value, 'Austin'); assert.equal(d6d['B' + DETAIL.ebitda].value, 'EBITDA'); assert.equal(d6d['B' + DETAIL.clusters[3].head].value, 'Dallas-Fort Worth'); assert.equal(cells('S6c', 'Monthly detail').B8.value, 'OTHER  REVENUE (1)');
  for (const name of ['P&L', 'Monthly', 'Print']) assert.deepEqual(cells('S6e', name).A2, { formula: UNITS_FORMULA, it: true }, name); assert.equal(cells('S6e', 'Inputs').B17.formula, '=B4&" "&B5&" unless stated; costs shown as negatives"');
  assert.deepEqual(stateOf('S7a').settings.pageSetup, CH2_PAGE_SETUP); assert.equal(stateOf('S6e').settings.pageSetup, undefined);
  const pr = sheet('S7b', 'Print'); assert.equal(pr.cells.B5.value, 'Revenue'); assert.equal(pr.cells.E7.formula, "='P&L'!E24"); assert.equal(pr.cells.E7.fontColor, 'green'); assert.equal(pr.cells.E7.numFmt, CODES.dollar); assert.equal(pr.cells.C8.it, true); assert.equal(pr.cells.D9.br, true); assert.equal(pr.cells.E4.fill, DIVIDER_FILL); assert.equal(pr.cells['C' + PRINT.check].formula, "=E7-'P&L'!E24"); assert.equal(pr.gridlines, false); assert.deepEqual(pr.freeze, { r: 4, c: 2 });
});

test('the plantings land where the script says, over the state each lesson starts from', () => {
  const g = applyStatePatch(stateOf('S3b'), PLANT_GRID); const gc = g.sheets[0].cells;
  assert.equal(gc.C7.ball, true); assert.equal(gc.C7.value, cells('S3b', 'P&L').C7.value, 'a planted border keeps the figure under it'); assert.equal(gc.E24.ball, true); assert.equal(gc.C11.ball, undefined, 'the grid covers the lines, not the empty rows');
  const m = applyStatePatch(stateOf('S3e'), PLANT_MONTHLY); const mc = m.sheets[2].cells;
  assert.equal(mc.A1.value, 'Clearcoat Express - FY26 by month'); assert.equal(mc.A1.bold, undefined); assert.ok(mc.C13.value < 0); assert.equal(mc.C24.formula, '=C22+C23'); assert.equal(mc.B26.value, 'Margins and growth'); assert.equal(mc.D30.formula, '=D10/C10-1'); assert.equal(mc['C' + MONTHLY_ROW.checkRevenue].formula, "=O10-'P&L'!E10"); assert.equal(mc.B7.value, LABELS[7]);
  assert.ok(close(sheetIn(live(m), 'Monthly').value('C' + MONTHLY_ROW.checkRevenue), 0), 'the planted checks tie before the dressing');
  const s = applyStatePatch(stateOf('S4b'), PLANT_STRAY); const sc = s.sheets[0].cells;
  assert.deepEqual(s.sheets[0].hiddenRows, [26, 27, 28, 29, 30]); assert.equal(sc['A' + DETAIL.strayTop].bold, true); assert.equal(sc.B45.value, 'AUSTIN'); assert.equal(sc.C49.formula, '=SUM(C46:C48)'); assert.equal(sc.O46.formula, '=SUM(C46:N46)'); assert.equal(sc.A59, undefined);
  // the lesson's route: cut the block, a new sheet named Monthly detail, paste at A1, and the block is S4c's sheet to the cell
  const ses = live(s); const pl = sheetIn(ses, 'P&L');
  pl.select(`A${DETAIL.strayTop}:O${DETAIL.strayTop + DETAIL.clusters[0].contrib - 1}`); pl.copy(true);
  const at = ses.addSheet('Monthly detail', new Sheet({})); ses.switchSheet(at);
  ses.sheet.select('A1'); ses.sheet.paste();
  const got = sessionToState(ses).sheets.find(x => x.name === 'Monthly detail'); const want = stateOf('S4c').sheets[4];
  const diff = diffStates({ sheets: [got], settings: {} }, { sheets: [want], settings: {} }).filter(d => d.kind === 'cell');
  assert.deepEqual(diff, [], 'the cut block lands as S4c holds it, its subtotals still adding their own lines');
  assert.equal(sheetIn(ses, 'P&L').cellAt('B45').value, null, 'the block left the P&L');
  const c = applyStatePatch(stateOf('S4c'), PLANT_CLUSTER_LINES); const cc = c.sheets[4].cells;
  assert.equal(cc.B20.value, 'SAN ANTONIO'); assert.equal(cc['B' + DETAIL.company].value, 'COMPANY'); assert.equal(cc['B' + DETAIL.checkRevenue].value, 'Revenue less Monthly'); assert.equal(c.sheets[4].colW[15], FIGURE_W); assert.deepEqual(c.sheets[4].freeze, { r: 4, c: 2 });
  assert.equal(sheetIn(live(c), 'Monthly detail').value('C' + DETAIL.checkEbitda), 0, 'the four clusters and head office add to Monthly');
  const d = applyStatePatch(stateOf('S4d'), PLANT_DUP_LABEL); assert.equal(d.sheets[0].cells.B18.value, 'Marketing'); assert.equal(d.sheets[0].cells.B19.value, 'Marketing'); assert.equal(d.sheets[0].cells.B18.indent, 1);
});

test('the export reads back from the raw file and from the chain alike; the clusters split the months whole', () => {
  const raw = readExport(stateOf('S1raw')), chain = readExport(stateOf('S2d'));
  assert.deepEqual(raw, chain);
  assert.deepEqual(raw.years, [2024, 2025, 2026]); assert.deepEqual(raw.flags, ['A', 'A', 'E']); assert.equal(raw.company, 'Clearcoat Express');
  for (const r of LINE_ROWS) { assert.deepEqual(raw.figures[r], EXPORT.figures[r]); assert.ok(raw.figures[r].every(v => v > 0)); }
  assert.deepEqual(readExport(stateOf('S8raw')).years, [2025, 2026, 2027]);
  const det = cells('Pdone', 'Monthly detail');
  for (const col of MONTH_COLS) for (const r of [7, 13]) {
    const parts = DETAIL.clusters.map(cl => det[col + (cl.head + (r === 7 ? 1 : 5))].value);
    assert.ok(parts.every(Number.isInteger), 'whole thousands');
    assert.equal(parts.reduce((a, v) => a + v, 0), (COST_ROWS.includes(r) ? -1 : 1) * EXPORT.months[r][MONTH_COLS.indexOf(col)], `${col}: the clusters add to the company's month`);
  }
  assert.equal(cleanLabel('RETAIL_WASH  REVENUE'), 'Retail Wash Revenue'); assert.equal(cleanLabel('OTHER  REVENUE (1)'), 'Other Revenue'); assert.equal(cleanLabel('EBITDA'), 'EBITDA'); assert.equal(cleanLabel('DALLAS-FORT WORTH'), 'Dallas-Fort Worth');
});

test('the project is the same export a year on; a sister operator seeds the assessment and solves through finish()', () => {
  for (const r of LINE_ROWS) { assert.equal(FIGURES_NEXT[r][0], EXPORT.figures[r][1]); assert.equal(Math.round(FIGURES_NEXT[r][1]), EXPORT.figures[r][2]); assert.ok(Number.isInteger(FIGURES_NEXT[r][2])); }
  assert.equal(Object.values(EXPORT_NEXT.months).flat().every(Number.isInteger), true);
  const raw = stateOf('S8raw'); assert.equal(raw.sheets[0].cells.C4.value, 'FY2025'); assert.equal(raw.sheets[1].cells.B3.value, 'Clearcoat Express'); assert.equal(raw.sheets.length, 4); assert.equal(raw.settings.pageSetup, undefined);
  assert.deepEqual(stateOf('S8done').names, { EBITDA: 'Monthly!$B$24:$O$24', Rev: 'Monthly!$B$10:$O$10', SiteCosts: 'Monthly!$B$20:$O$20' });
  assert.equal(cells('S8done', 'Monthly').Q4.value, 'Go to');
  const a = sisterExport(mulberry32(3)), b = sisterExport(mulberry32(3)), c = sisterExport(mulberry32(4));
  assert.deepEqual(a, b); assert.notDeepEqual(a.figures, c.figures); assert.ok(SISTERS.includes(a.company));
  for (const r of LINE_ROWS) assert.ok(a.figures[r][2] < EXPORT_NEXT.figures[r][2] && a.figures[r][2] > 0.3 * EXPORT_NEXT.figures[r][2], 'a smaller operator');
  const keys = n => Object.keys(sisterPatch(mulberry32(n))).length;
  assert.equal(keys(1), keys(2), 'the workload never moves');
  const seeded = applyStatePatch(stateOf('S8raw'), sisterPatch(mulberry32(11)));
  assert.equal(seeded.sheets[1].cells.B3.value, sisterExport(mulberry32(11)).company);
  const solved = finish(seeded);
  const ses = live(solved);
  for (const [name, read] of [['P&L', true], ['Monthly', true], ['Print', true]]) assert.deepEqual(sheetStandard(sheetIn(ses, name), { chapter: 2, read }), [], name);
  const pl = sheetIn(ses, 'P&L');
  assert.equal(pl.value('A1'), sisterExport(mulberry32(11)).company + ' - Historical Financials');
  for (const ref of ['C39', 'C40']) assert.equal(pl.value(ref), 0, ref + ' ties on the sister\'s figures');
  assert.ok(close(sheetIn(ses, 'Print').value('E7'), pl.value('E24')));
});

test('the module challenges seed over their start states: the cluster\'s figures, the module\'s faults, the same workload every seed', () => {
  assert.deepEqual(diffStates(stateOf('S7C'), (() => { const s = stateOf('S7b'); delete s.settings.pageSetup; return s; })()), [], 'S7C is the finished pack with no print set-up');
  for (const id in CHALLENGES) {
    const { before, after } = CHALLENGES[id];
    assert.ok(STATES[before] && STATES[after], id);
    const a = challengeSeed(id, mulberry32(5)), b = challengeSeed(id, mulberry32(5));
    assert.deepEqual(a, b, `${id} is deterministic`);
    assert.equal(Object.keys(challengeSeed(id, mulberry32(1))).length, Object.keys(challengeSeed(id, mulberry32(2))).length, `${id}: the workload never moves`);
    const seeded = applyStatePatch(stateOf(before), a);
    const ses = live(seeded);
    assert.equal(sheetIn(ses, 'P&L').value('C39'), 0, `${id}: the cluster's revenue check ties`);
    assert.ok(Math.abs(sheetIn(ses, 'P&L').value('C10')) < 0.4 * 33000, `${id}: a cluster's figures, not the company's`);
  }
  const g = applyStatePatch(stateOf('S2d'), challengeSeed('challenge-pnl-presentation-quality', mulberry32(3))).sheets[0];
  assert.equal(g.cells.C7.ball, true); assert.equal(g.cells.C7.numFmt, CODES.dollar, 'formatted for numbers already'); assert.equal(g.cells.A7.value, '4010', 'the codes still in A');
  const n = applyStatePatch(stateOf('S3f'), challengeSeed('challenge-grouped-navigable', mulberry32(3))).sheets[0];
  assert.deepEqual(n.hiddenRows, [26, 27, 28, 29, 30]); assert.equal(n.cells.B45.value, 'AUSTIN'); assert.equal(n.groups, undefined, 'flat');
  const f = applyStatePatch(stateOf('S4d'), challengeSeed('challenge-checks-flags', mulberry32(3)));
  assert.deepEqual(f.sheets[0].condFmt, STRAY_RULES); assert.deepEqual(f.sheets[2].condFmt, []); assert.equal([7, 8, 9].filter(r => f.sheets[0].cells['A' + r] && f.sheets[0].cells['A' + r].value === 'x').length, 1);
  const h = applyStatePatch(stateOf('S5d'), challengeSeed('challenge-dynamic-header-block', mulberry32(3)));
  assert.equal(h.sheets[2].cells.C4.value, '2026-01'); assert.equal(h.sheets[2].cells.N4.value, '2026-12'); assert.equal(h.sheets[0].cells.A1.value, TITLE, 'the typed title stays');
  assert.equal(cells('S5d', 'Monthly detail').B6.value, 'RETAIL_WASH  REVENUE', 'the dirty labels arrive with the start state');
  const fl = applyStatePatch(stateOf('S5a'), PLANT_ROW_FLAG); fl.sheets[0].condFmt = [CF_ROW_FLAG];
  const fs = sheetIn(live(fl), 'P&L');
  assert.equal(fl.sheets[0].cells['A' + FLAG_ROW].value, 'x'); assert.equal(fl.sheets[0].cells.C8.value, cells('S5a', 'P&L').C8.value);
  const map = fs.condFmtMap(); assert.ok(map['C' + FLAG_ROW] && map['C' + FLAG_ROW].fill, 'the row rule lights the flagged row'); assert.equal(map.C7, undefined, 'and no other');
});
