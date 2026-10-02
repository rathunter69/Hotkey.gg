// app2/tests/clearcoat-pack.test.js — the Chapter 4 workbook (clearcoat-pack): every state builds a
// real workbook inside the engine, the solved pages pass the sheet standard, the figures tie (the
// cubes to the export, the roll-up to the cubes, the case table to the live case, the checks at
// zero, the one-line model to FY26), and each state carries the plantings its lesson reads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as wb from '../content/workbooks/clearcoat-pack.js';
import { WORKBOOKS, workbookState } from '../content/workbooks/index.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { sheetStandard } from '../app/graders.js';

const { STATES, STATE_ORDER, STATE_LESSONS, stateOf, SUMMARY: S, SCENARIOS: C, SITES, ROWS, WEEKS, PLANT, INPUTS, CASE_INPUTS, BREAK_EVEN, exportRow } = wb;

const build = sp => new Sheet({ cells: structuredClone(sp.cells), colW: sp.colW, gridlines: sp.gridlines, freeze: sp.freeze, condFmt: sp.condFmt, hiddenRows: sp.hiddenRows });
function live(st) {
  const ses = new Session(build(st.sheets[0]), { now: () => 0 });
  ses.sheets[0].name = st.sheets[0].name;
  for (const sh of st.sheets.slice(1)) ses.addSheet(sh.name, build(sh));
  ses.names = st.names || {};
  for (const e of ses.sheets) e.sheet.recalc();
  return ses;
}
// a Session of thirteen sheets costs most of a second to build, so the live check samples the run; every state still builds sheet by sheet
const LIVE_SAMPLE = ['S0', 'S418', 'S42C', 'S436', 'S456', 'SPraw'];
const sheetIn = (ses, name) => ses.sheets.find(x => x.name === name).sheet;
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;
const SHEETS = ['Q&A', 'Summary', 'Scenarios', 'Dashboard', 'Lists', 'Inputs', 'Export', ...SITES.map(s => s.tab)];

test('the workbook is registered and every state builds the thirteen-sheet pack inside the grid', () => {
  assert.ok(WORKBOOKS['clearcoat-pack']);
  assert.equal(wb.CHAPTER, 4);
  for (const id of STATE_ORDER) {
    const st = workbookState('clearcoat-pack', id);
    const names = st.sheets.map(s => s.name);
    for (const n of SHEETS) assert.ok(names.includes(n), `${id} has ${n}`);
    for (const sh of st.sheets) for (const ref in sh.cells) assert.ok(/^[A-Z]\d+$/.test(ref) && ref.charCodeAt(0) - 64 <= 26 && +ref.slice(1) <= 100, `${id} ${sh.name}!${ref} inside the grid`);
    for (const sh of st.sheets) assert.ok(build(sh), `${id} ${sh.name} builds`);
    if (LIVE_SAMPLE.includes(id)) assert.equal(live(st).sheets.length, st.sheets.length, id);
  }
  assert.deepEqual(STATE_LESSONS.map(x => x[0]).filter((v, i, a) => a.indexOf(v) === i).sort(), STATE_ORDER.slice().sort(), 'every state serves a lesson');
  assert.throws(() => stateOf('S999'), /unknown workbook state/);
});

test('the solved pages pass the sheet standard', () => {
  for (const [stateId, name] of wb.STANDARD.pages) {
    const spec = stateOf(stateId).sheets.find(s => s.name === name);
    assert.deepEqual(sheetStandard(new Sheet(spec), { chapter: 4, read: true }), [], `${stateId} ${name}`);
  }
});

test('the export: ninety rows, date-major, fifteen days, the two plantings', () => {
  assert.equal(ROWS.length, 90);
  assert.equal(WEEKS.length, 3);
  assert.deepEqual(WEEKS.map(w => w.key), ['Week of 14-Sep', 'Week of 21-Sep', 'Week of 28-Sep']);
  assert.deepEqual(WEEKS.map(w => w.days), [6, 7, 2]);
  const missing = ROWS[exportRow(PLANT.missing.day, PLANT.missing.site) - 5];
  assert.equal(missing.code, 'AUS-RIV'); assert.equal(missing.retail, null);
  const ex = stateOf('S0').sheets.find(s => s.name === 'Export').cells;
  assert.equal(ex['B' + exportRow(PLANT.misspelt.day, PLANT.misspelt.site)].value, 'AUS-DMO', 'S0 carries the misspelt code');
  assert.equal(ex['C' + exportRow(PLANT.missing.day, PLANT.missing.site)], undefined, 'the missing day is blank');
  assert.equal(ex.B94.value, 'AUS-CED'); assert.equal(ex.A5.value + 14, ex.A94.value);
  assert.equal(ex.J5, undefined, 'no key column before 4.1.7');
  // the solved export: the code fixed, the key column, the filtered totals
  const done = stateOf('SPdone').sheets.find(s => s.name === 'Export').cells;
  assert.equal(done['B' + exportRow(PLANT.misspelt.day, PLANT.misspelt.site)].value, 'AUS-DOM');
  assert.match(done.J5.formula, /TEXT\(A5,"yyyy-mm-dd"\)/);
  assert.match(done.E97.formula, /SUBTOTAL\(109/);
});

test('the solved workbook ties: cubes to the export, roll-up to the cubes, KPIs to their parts, every check at zero', () => {
  const ses = live(stateOf('SPdone'));
  const sm = sheetIn(ses, 'Summary'), ex = sheetIn(ses, 'Export');
  const washes = ROWS.filter(r => r.date >= 0).reduce((t, r) => t + (r.retail || 0) + (r.member || 0), 0);
  void ex;
  // the project's fortnight is its own export; the chapter's figures are asserted on S463 below
  for (const r of S.checkRows) assert.equal(sm.value('C' + r), 0, `Summary check row ${r}`);
  assert.equal(sm.value('F' + S.cubeTotal), sm.value('H' + S.totalRow));
  assert.equal(sm.value('F' + S.rollup.total), sm.value('F' + S.cubeTotal));
  for (const r of S.siteRows) { assert.ok(sm.value('I' + r) > 0.08 && sm.value('I' + r) < 0.25, `utilization ${r} in the express range`); assert.ok(sm.value('M' + r) > 0.4 && sm.value('M' + r) < 0.6, `member share ${r}`); }
  assert.equal(sm.value('G' + S.siteRows[2]), 14, 'Riverside reported fourteen days');
  for (const site of SITES) assert.equal(sheetIn(ses, site.tab).value('C13'), 0, `${site.tab} ties to the export`);
  assert.equal(sheetIn(ses, 'Lists').value('O11'), 90); assert.equal(sheetIn(ses, 'Lists').value('C26'), 0);
  assert.equal(sheetIn(ses, 'Dashboard').value('C25'), 0);
  assert.equal(sheetIn(ses, 'Q&A').value('C20'), 0);
  assert.equal(sheetIn(ses, 'Q&A').value('F5'), 15, 'the Deluxe price by lookup');
  assert.match(sheetIn(ses, 'Q&A').value('F11'), /^AUS-\w{3} at \$[\d,]+\.\d\d an hour$/);
  void washes;
});

test('the chapter states tie on the chapter export: the cube reads 4,245 washes for Domain and the window the last seven days', () => {
  const ses = live(stateOf('S463'));
  const sm = sheetIn(ses, 'Summary');
  const total = ROWS.reduce((t, r) => t + (r.retail || 0) + (r.member || 0), 0);
  assert.equal(sm.value('F' + S.cubeTotal), total);
  assert.equal(sm.value('H' + S.totalRow), total);
  for (const r of S.checkRows) assert.equal(sm.value('C' + r), 0, `check row ${r}`);
  const win = ROWS.filter(r => r.day >= 8).reduce((t, r) => t + (r.retail || 0) + (r.member || 0), 0);
  assert.equal(sm.value('C' + S.window.washes), win);
  assert.equal(sm.value('C' + S.multi.im), sm.value('C' + S.multi.sumifs), 'the key column and SUMIFS agree');
  assert.equal(sm.value('C' + S.twoWay.answer), sm.value('D' + S.cubeRows[4]), 'Airport in the second week');
  assert.equal(sm.value('C' + S.multi.key), 'AUS-SLA|2026-09-19');
  assert.equal(sm.value('A1'), 'Clearcoat Express: KPI page, Sep 15 to 29, 2026');
});

test('Scenarios: the live case, the sensitivities, break-even and the side-by-side table agree with the one-line model, and FY26 inputs give FY26 EBITDA', () => {
  const ses = live(stateOf('S463'));
  const sc = sheetIn(ses, 'Scenarios');
  const base = wb.model(wb.caseOf(1));
  assert.equal(sc.value('C' + C.switch), 2);
  assert.equal(sc.value('A1'), 'Base case: Clearcoat Express forecast, FY27');
  for (const k of ['washesYr', 'revenue', 'cow', 'retail', 'siteCosts', 'contrib', 'ho', 'ebitda']) assert.ok(near(sc.value('C' + C.outputs[k]), base[k]), `${k}: ${sc.value('C' + C.outputs[k])} vs ${base[k]}`);
  // the ticket row at $14 is the live EBITDA; the two-way grid at 50% and $14 too; the downside column of the case table is the downside model
  assert.ok(near(sc.value('E' + C.oneWay.ebitda), base.ebitda));
  assert.ok(near(sc.value('E' + C.twoWay.rows[2]), base.ebitda));
  assert.ok(near(sc.value('C' + C.twoWay.rows[0]), wb.model({ ...wb.caseOf(1), ticket: 12, share: 0.4 }).ebitda));
  [0, 1, 2].forEach(i => assert.ok(near(sc.value('CDE'[i] + C.cases.ebitda), wb.model(wb.caseOf(i)).ebitda), 'case ' + i));
  assert.ok(sc.value('C' + C.cases.ebitda) > sc.value('D' + C.cases.ebitda) && sc.value('D' + C.cases.ebitda) > sc.value('E' + C.cases.ebitda), 'Management above Base above Downside');
  assert.ok(near(sc.value('C' + C.breakEven.hand), BREAK_EVEN.hand)); assert.equal(sc.value('C' + C.breakEven.goalSeek), BREAK_EVEN.goalSeek);
  assert.equal(sc.value('C' + C.breakEven.daily), 250 * BREAK_EVEN.cpw - SITES[0].costs);
  for (const r of C.checkRows) assert.equal(sc.value('C' + r), 0, `check row ${r}`);
  // the cross-chapter tie: FY26's 40 sites at 250 washes and the FY26 blended ticket give FY26 EBITDA within half a percent
  const fy26 = wb.model({ washes: 250, ticket: INPUTS.fy26Revenue / (40 * 250 * 365), share: 0.5, sites: 40 });
  assert.ok(near(fy26.revenue, INPUTS.fy26Revenue, 1) && Math.abs(fy26.ebitda - INPUTS.fy26Ebitda) / INPUTS.fy26Ebitda < 0.005, `FY26 EBITDA ${fy26.ebitda}`);
  assert.equal(CASE_INPUTS.sites[2], 40);
  // the picker drives it: Downside
  sc.setCell('C' + C.picker, { value: 'Downside' }); sc.commit('edit');
  assert.ok(near(sc.value('C' + C.outputs.ebitda), wb.model(wb.caseOf(2)).ebitda));
  assert.equal(sc.value('A1'), 'Downside case: Clearcoat Express forecast, FY27');
  assert.equal(sc.value('C' + C.checkRows[0]), 0);
});

test('each state carries what its lesson reads', () => {
  const cells = (id, name) => stateOf(id).sheets.find(s => s.name === name).cells;
  const sm = id => cells(id, 'Summary'), sc = id => cells(id, 'Scenarios'), qa = id => cells(id, 'Q&A');
  // S0: question 1 typed; the washes cube pasted as values; Scenarios' inputs typed; no names; no ticket on Inputs; no check rows on the tabs
  assert.deepEqual([qa('S0').F5.value, qa('S0').F5.fontColor, qa('S0').E5.value], [15, 'blue', 'Open']);
  assert.equal(sm('S0').C15.formula, undefined); assert.equal(sm('S0').C15.fontColor, 'blue'); assert.equal(sm('S0').C5, undefined);
  assert.equal(sm('S0').F21.value, ROWS.reduce((t, r) => t + (r.retail || 0) + (r.member || 0), 0), 'the pasted cube carries the export total');
  assert.equal(sc('S0').C6.value, 14.5); assert.equal(sc('S0').G5, undefined); assert.equal(sc('S0').C11, undefined);
  assert.equal(stateOf('S0').names, undefined); assert.equal(cells('S0', 'Inputs').C15, undefined); assert.equal(cells('S0', 'Domain').C13, undefined);
  // 4.1.1 to 4.1.8
  assert.match(qa('S411').F5.formula, /^=VLOOKUP\("D",Lists!\$B\$14:\$E\$16,3,FALSE\)$/);
  assert.match(sm('S412').D5.formula, /VLOOKUP\(B5,Lists!\$B\$5:\$H\$10,5,FALSE\)/); assert.match(sm('S412').I14.formula, /^=HLOOKUP/);
  assert.match(sm('S413').E5.formula, /^=MATCH/); assert.match(sm('S413').G5.formula, /^=INDEX\(Lists!\$F\$5:\$F\$10,MATCH/);
  assert.match(sm('S414')['C' + S.twoWay.answer].formula, /^=INDEX\(\$C\$15:\$E\$20,MATCH/);
  assert.match(sm('S415').J5.formula, /^=XLOOKUP/); assert.match(sm('S415').J15.formula, /"Not listed"\)$/);
  assert.match(sm('S416').K5.formula, /,2,TRUE\)$/); assert.match(sm('S416').L5.formula, /,1\)\)$/); assert.match(sm('S416').J17.formula, /^=IFERROR\(XLOOKUP/);
  assert.match(cells('S417', 'Export').J5.formula, /^=B5&"\|"&TEXT/); assert.match(sm('S417')['C' + S.multi.im].formula, /Export!\$J\$5:\$J\$94/);
  assert.match(wb.SCAFFOLD_418.N5.formula, /^=OFFSET\(Lists!\$B\$4,MATCH/); assert.match(wb.SCAFFOLD_418.O5.formula, /^=INDIRECT\("Lists!F"/);
  assert.match(sm('S418').N5.formula, /^=INDEX\(Lists!\$F\$5/); assert.equal(sm('S418').O5, undefined); assert.match(sm('S418').J18.formula, /INDEX\(\$C\$15:\$E\$20,0,2\)/);
  // 4.1.C: five broken lookups, then five fixed
  const broken = sm('S41C'), fixed = sm('S41Cdone');
  assert.match(broken.C5.formula, /,2\)$/); assert.match(broken.D5.formula, /,4,FALSE\)$/); assert.match(broken.E5.formula, /^=VLOOKUP\(C5/); assert.match(broken.F5.formula, /^=OFFSET/); assert.match(broken.G5.formula, /,""\)$/);
  for (const col of 'CDEF') assert.match(fixed[col + '5'].formula, /^=INDEX\(Lists!/); assert.match(fixed.G5.formula, /"Not listed"\)$/);
  assert.equal(broken.N5, undefined);
  // 4.2: the module start is tidy; the copy sorted by revenue; the filtered totals; the misspelling fixed with the unique list; the corrections; the scratch paste; the wildcards
  assert.equal(sm('S42').E5, undefined); assert.match(sm('S42').D5.formula, /^=INDEX\(Lists!\$F\$5/);
  const copy = cells('S421', 'Export sort');
  assert.ok(copy.F5.value >= copy.F6.value && copy.F6.value >= copy.F7.value, 'the copy is sorted by revenue, largest first');
  assert.ok(Object.values(copy).some(c => c.value === 'AUS-DMO'), 'the copy carries the misspelling it was taken with');
  assert.equal(copy.E5.formula, undefined, 'pasted as values');
  assert.match(cells('S422', 'Export').E97.formula, /SUBTOTAL\(109,E5:E94\)/); assert.match(cells('S422', 'Export').E98.formula, /SUBTOTAL\(103,A5:A94\)/);
  assert.equal(cells('S422', 'Export')['B' + exportRow(PLANT.misspelt.day, PLANT.misspelt.site)].value, 'AUS-DMO');
  assert.equal(cells('S423', 'Export')['B' + exportRow(PLANT.misspelt.day, PLANT.misspelt.site)].value, 'AUS-DOM');
  assert.match(cells('S423', 'Lists').O5.formula, /^=COUNTIF\(Export!\$B\$5:\$B\$94,N5\)$/); assert.equal(cells('S422', 'Lists').N5, undefined);
  assert.equal(sc('S424')['C' + C.picker].value, 'Downside');
  assert.equal(cells('S425start', 'Export sort').I9.value, 12); assert.equal(cells('S425start', 'Export sort').G9.value, 14);
  assert.equal(cells('S425', 'Export sort').G9.value, 12, 'the correction landed'); assert.equal(cells('S425', 'Export sort').G10.value, 14, 'the blank skipped');
  const scratch = cells('S425', 'Scratch');
  assert.equal(Object.keys(scratch).filter(k => k[0] === 'B').length, 76, 'seventy-five rows and the header');
  assert.match(cells('S425', 'Export').J96.formula, /"AUS-\*"/); assert.match(cells('S425', 'Export').J98.formula, /"\*R"/);
  assert.deepEqual(stateOf('S426'), stateOf('S425'), '4.2.6 stays on the helper route');
  assert.equal(cells('S42C', 'Export sort').A5.value, cells('S42C', 'Export').A5.value, 'the challenge copy is in export order');
  // 4.3: the cube live, the KPI block, the window, the title from Inputs, the ranking, the roll-up
  assert.equal(stateOf('S43').sheets.some(s => s.name === 'Scratch' || s.name === 'Export sort'), false);
  assert.match(sm('S431').C15.formula, /^=SUMIFS\(Export!\$E\$5:\$E\$94,Export!\$B\$5:\$B\$94,\$B15,Export!\$H\$5:\$H\$94,C\$14\)$/);
  assert.match(sm('S431').B15.formula, /^=\$B5$/); assert.match(sm('S431').C25.formula, /Export!\$F\$5/); assert.ok(sm('S431')['C' + S.checkRows[0]]); assert.equal(sm('S431')['C' + S.checkRows[2]], undefined);
  assert.equal(sm('S431').E5, undefined); assert.match(sm('S432').I5.formula, /^=H5\/\(F5\*G5\)$/); assert.match(sm('S432').J5.formula, /^=MAXIFS/);
  assert.equal(qa('S432').E6.value, 'Answered'); assert.match(qa('S432').F6.formula, /^=Summary!I5$/); assert.equal(qa('S431').F6, undefined);
  assert.match(sm('S433')['C' + S.window.washes].formula, /">="&C48/);
  assert.match(sm('S434').A1.formula, /Inputs!\$C\$14/); assert.equal(sm('S433').A1.formula, undefined); assert.ok(sm('S434')['C' + S.checkRows[5]]); assert.equal(sm('S434')['C' + S.checkRows[4]], undefined);
  assert.deepEqual(stateOf('S434').settings.pageSetup.orientation, 'landscape');
  assert.match(sm('S435')['F' + S.perHour.rows[0]].formula, /^=RANK/); assert.match(qa('S435').F11.formula, /an hour"$/);
  assert.match(sm('S436')['C' + S.rollup.retail].formula, /^=Domain!C5\+Mueller!C5/); assert.ok(sm('S436')['C' + S.checkRows[4]]); assert.ok(cells('S436', 'Airport').C13);
  // 4.5: the switch and live column, the grids, break-even, the driver, the table on the switch
  assert.equal(sc('S45').G5, undefined);
  assert.match(sc('S451').G5.formula, /^=CHOOSE\(\$C\$11,C5,D5,E5\)$/); assert.match(sc('S451').G6.formula, /^=INDEX\(C6:E6,\$C\$11\)$/);
  assert.match(sc('S451')['C' + C.outputs.revenue].formula, /\*G6$/); assert.equal(sc('S451').C6.value, 14.5);
  assert.equal(stateOf('S451').sheets.find(s => s.name === 'Scenarios').condFmt.length, 1); assert.match(sc('S451').A1.formula, /^=\$C\$10&/);
  assert.equal(sc('S452')['G' + C.oneWay.ebitda].formula.includes('G28'), true); assert.equal(sc('S452')['C' + C.twoWay.vals], undefined);
  assert.equal(sc('S453')['B' + C.twoWay.rows[0]].value, 0.4); assert.equal(stateOf('S453').sheets.find(s => s.name === 'Scenarios').condFmt.length, 2);
  assert.match(sc('S454')['C' + C.breakEven.cpw].formula, /^=G6-/); assert.equal(sc('S454')['C' + C.breakEven.goalSeek].value, BREAK_EVEN.goalSeek);
  assert.equal(cells('S454', 'Inputs').C15, undefined); assert.equal(cells('S455', 'Inputs').C15.value, 14);
  assert.match(sc('S455').C6.formula, /^=Inputs!\$C\$15$/); assert.match(sc('S455')['C' + C.ticketModel].formula, /^=IF\(C13="",Inputs!\$C\$15,C13\)$/); assert.match(sc('S455')['C' + C.outputs.revenue].formula, /\*C14$/);
  assert.match(sc('S456')['C' + C.cases.ebitda].formula, /^=C53\+\$C\$23$/); assert.match(sc('S456')['C' + C.checkRows[0]].formula, /\$C\$11\)-C24$/); assert.equal(qa('S456').E13.value, 'Answered');
  // 4.6: the names, the stray, the rename, the list on Inputs
  assert.deepEqual(Object.keys(stateOf('S461').names), ['Case', 'Ticket', 'CostPerWash']); assert.match(sc('S461').G6.formula, /,Case\)$/);
  assert.deepEqual(stateOf('S462start').names.OldTicket, 'Scenarios!$G$6');
  assert.deepEqual(Object.keys(stateOf('S462').names), ['Case', 'Ticket', 'Cost_Per_Wash']); assert.equal(cells('S462', 'Inputs').B19.value, 'Case'); assert.equal(cells('S462', 'Inputs').B20, undefined);
  assert.deepEqual(stateOf('S463').names, wb.NAMES); assert.equal(cells('S463', 'Inputs').C20.value, '=Lists!$L$5:$L$7');
  // 4.P: a fresh fortnight, the same shape
  assert.equal(cells('SPraw', 'Export').A5.value, wb.EXPORT_NEXT.start); assert.equal(cells('SPraw', 'Summary').C15, undefined); assert.equal(cells('SPraw', 'Summary').B15, undefined);
  assert.equal(cells('SPdone', 'Export').A5.value, wb.EXPORT_NEXT.start); assert.notEqual(cells('SPdone', 'Export').C5.value, cells('S463', 'Export').C5.value);
});

test('the names resolve in a session: Case drives the live column, Cases and Sites are ranges', () => {
  const ses = live(stateOf('S463'));
  const names = ses.definedNames().map(n => n.name).sort();
  assert.deepEqual(names, ['Case', 'Cases', 'Cost_Per_Wash', 'Sites', 'Ticket']);
  assert.equal(sheetIn(ses, 'Scenarios').value('G5'), CASE_INPUTS.washes[1]);
});
