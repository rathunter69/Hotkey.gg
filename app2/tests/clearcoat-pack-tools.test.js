// app2/tests/clearcoat-pack-tools.test.js — the Chapter 4 workbook (clearcoat-pack) under the engine's
// tools, driven by keys on the lesson states as a learner would: Sort (4.2.1), AutoFilter with
// SUBTOTAL (4.2.2), Remove Duplicates (4.2.3), Data Validation (4.2.4, 4.6.3), the dynamic arrays
// (4.2.6), a PivotTable (4.4.1), a Data Table on the pass-through driver (4.5.5), Goal Seek (4.5.4)
// and the names (4.6). Each answer is checked against the figure the solved pack holds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as wb from '../content/workbooks/clearcoat-pack.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';

const { stateOf, SUMMARY: S, SCENARIOS: C, SITES, ROWS, BREAK_EVEN, CASES } = wb;

// as the runner loads a module state: every sheet with its rules, then the names (which recalculate the workbook)
const build = sp => new Sheet({ cells: structuredClone(sp.cells), colW: sp.colW, gridlines: sp.gridlines, freeze: sp.freeze, condFmt: sp.condFmt, hiddenRows: sp.hiddenRows, validation: sp.validation, pivots: sp.pivots, dataTables: sp.dataTables });
function live(id) {
  const st = stateOf(id); const toasts = [];
  const ses = new Session(build(st.sheets[0]), { now: () => 0, onToast: m => toasts.push(m) });
  ses.sheets[0].name = st.sheets[0].name;
  for (const sh of st.sheets.slice(1)) ses.addSheet(sh.name, build(sh), undefined, { recalc: false });
  if (st.names && Object.keys(st.names).length) ses.names = st.names; else ses.recalcAll();
  ses.toasts = toasts;
  return ses;
}
const open = (ses, name) => { ses.switchSheet(ses.sheets.findIndex(e => e.name === name)); return ses.sheet; };
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;
const sum = xs => xs.reduce((a, b) => a + (b || 0), 0);

test('4.2.1 to 4.2.3: Sort by site then date, AutoFilter with SUBTOTAL, Remove Duplicates to the unique site list', () => {
  const ses = live('S421'); const X = open(ses, 'Export sort');
  const before = []; for (let r = 5; r <= 94; r++) before.push({ code: X.value('B' + r), date: X.value('A' + r), total: X.value('E' + r) });
  X.goTo(5, 1); ses.run('Alt A S S S Alt+A Enter');
  const want = before.map((x, i) => ({ ...x, i })).sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0) || a.date - b.date || a.i - b.i);
  for (let k = 0; k < 90; k++) { assert.equal(X.value('B' + (5 + k)), want[k].code, 'row ' + (5 + k)); assert.equal(X.value('A' + (5 + k)), want[k].date); }

  const s2 = live('S422'); const E = open(s2, 'Export');
  const all = sum(ROWS.map(r => (r.retail ?? 0) + (r.member ?? 0)));
  assert.equal(E.value('E96'), all); assert.equal(E.value('E97'), all); assert.equal(E.value('E98'), 90);
  E.goTo(4, 2); s2.run('Ctrl+Shift+L'); assert.ok(E.filter, 'AutoFilter on');
  const dom = SITES[0].code;
  // the Site header's menu: untick (Select All), tick Domain alone
  s2.run('Alt+Down'); const items = s2.dlg.items.map(it => it.text); const at = items.indexOf(dom) + 1;
  s2.run('Space' + ' Down'.repeat(at) + ' Space Enter');
  const domRows = ROWS.filter(r => r.code === dom && !(r.day === wb.PLANT.misspelt.day && r.site === wb.PLANT.misspelt.site));
  assert.equal(E.value('E97'), sum(domRows.map(r => r.retail + r.member)), 'SUBTOTAL(109) reads the rows showing');
  assert.equal(E.value('E98'), domRows.length, 'SUBTOTAL(103) counts them');
  assert.equal(E.value('E96'), all, 'SUM still reads every row');

  const s3 = live('S422'); const L = open(s3, 'Lists'); const Ex = open(s3, 'Export');
  for (let r = 5; r <= 94; r++) L.setCell('Q' + (r - 1), { value: Ex.value('B' + r) });
  L.setCell('Q3', { value: 'Site' }); open(s3, 'Lists'); L.commit('edit');
  L.goTo(3, 17); s3.run('Alt A M Enter');
  const uniq = []; for (let r = 4; r <= 94 && L.value('Q' + r) !== null; r++) uniq.push(L.value('Q' + r));
  assert.deepEqual(uniq, [...new Set(ROWS.map((r, i) => i === wb.exportRow(wb.PLANT.misspelt.day, wb.PLANT.misspelt.site) - 5 ? wb.PLANT.misspelt.code : r.code))], 'six sites and the misspelling (4.2.3 fixes it)');
});

test('4.2.4 and 4.6.3: the pickers are validation lists (on Lists, then on the names); the washes inputs refuse 700', () => {
  for (const id of ['S424', 'S463']) {
    const ses = live(id); const Sc = open(ses, 'Scenarios');
    Sc.goTo(C.picker, 3); ses.run('Alt+Down'); assert.equal(ses.dialog, 'dvlist', id + ': the case picker drops down');
    ses.run('Escape');
    ses.run('"Mangement" Enter'); assert.equal(Sc.value('C' + C.picker), id === 'S424' ? 'Downside' : 'Base', id + ': a misspelt case is refused');
    ses.run('Escape Escape');
    Sc.goTo(C.picker, 3); ses.run('"Management" Enter'); assert.equal(Sc.value('C' + C.picker), 'Management');
    if (id === 'S463') { assert.equal(Sc.value('C' + C.switch), 1); assert.equal(Sc.value('G' + C.inputs.washes), wb.CASE_INPUTS.washes[0], 'the switch follows the picker'); }
    Sc.goTo(C.inputs.washes, 4); ses.run('"700" Enter'); assert.equal(Sc.value('D' + C.inputs.washes), wb.CASE_INPUTS.washes[1], id + ': 700 washes a day is refused');
    ses.run('Escape Escape');
    const Su = open(ses, 'Summary'); Su.goTo(S.twoWay.site, 3); ses.run('"AUS-XXX" Enter'); assert.notEqual(Su.value('C' + S.twoWay.site), 'AUS-XXX', id + ': the site picker lists the sites');
    ses.run('Escape Escape');
  }
  assert.equal(stateOf('S463').sheets.find(s => s.name === 'Scenarios').validation['C' + C.picker].source, '=Cases');
  assert.equal(stateOf('S423').sheets.find(s => s.name === 'Scenarios').validation, undefined, 'no rules before 4.2.4');
  assert.deepEqual(CASES, ['Management', 'Base', 'Downside']);
});

test('4.2.6: UNIQUE, SORT and FILTER spill over the POS rows', () => {
  const ses = live('S425'); const L = open(ses, 'Lists');
  L.commitInput('=SORT(UNIQUE(Export!$B$5:$B$94))', 30, 17);
  const got = []; for (let r = 30; r < 30 + 6; r++) got.push(L.value('Q' + r));
  assert.deepEqual(got, SITES.map(s => s.code).sort());
  assert.equal(L.value('Q36'), null, 'six sites once the misspelling is fixed');
  L.commitInput('=SUM(FILTER(Export!$E$5:$E$94,Export!$B$5:$B$94="AUS-AIR"))', 30, 19);
  assert.equal(L.value('S30'), sum(ROWS.filter(r => r.code === 'AUS-AIR').map(r => r.retail + r.member)));
});

test('4.3.3 and 4.3.6: SUMPRODUCT array arithmetic and a 3D SUM agree with the solved SUMIFS and roll-up', () => {
  const ses = live('S436'); const Su = open(ses, 'Summary'); const W = S.window;
  Su.commitInput(`=SUMPRODUCT((Export!$A$5:$A$94>=C${W.start})*(Export!$A$5:$A$94<=C${W.end})*Export!$E$5:$E$94)`, 99, 8);
  assert.equal(Su.value('H99'), Su.value('C' + W.washes));
  Su.commitInput(`=SUM(${SITES[0].tab}:${SITES.at(-1).tab}!C5)`, 99, 9);
  assert.equal(Su.value('I99'), Su.value('C' + S.rollup.retail));
});

test('4.4.1: a PivotTable over the export, Site in Rows and Total washes in Values, ties to the cube', () => {
  const ses = live('S44'); const E = open(ses, 'Export');
  E.goTo(5, 1); ses.run('Alt N V T'); assert.equal(ses.dialog, 'pivot'); assert.match(ses.dlg.source, /^Export!\$A\$4:\$[IJ]\$94$/);
  ses.run('Enter'); assert.equal(ses.dlg.step, 'fields'); const f = ses.dlg.fields;
  ses.run('Down'.repeat(1) + ' R' + ' Down'.repeat(f.indexOf('Total washes') - 1) + ' V Enter');
  const P = ses.sheet; const Su = ses.sheets.find(e => e.name === 'Summary').sheet;
  let r = 4; const got = {}; while (P.value('A' + r) !== 'Grand Total') { got[P.value('A' + r)] = P.value('B' + r); r++; }
  assert.equal(P.value('B' + r), Su.value('F' + S.cubeTotal), 'the grand total ties to the washes cube');
  SITES.forEach((s, i) => assert.equal(got[s.code], Su.value('F' + S.cubeRows[i]), s.code));
});

test('4.5.4 and 4.5.5: Goal Seek finds the Domain break-even; a Data Table on the driver reproduces the one-way grid', () => {
  const ses = live('S455'); const Sc = open(ses, 'Scenarios'); const BE = C.breakEven;
  Sc.goTo(BE.daily, 3); ses.run(`Alt A W G Alt+V 0 Alt+C "C${BE.washes}" Enter`);
  assert.ok(near(Sc.value('C' + BE.washes), BREAK_EVEN.hand, 1e-3)); assert.equal(Math.round(Sc.value('C' + BE.washes)), BREAK_EVEN.goalSeek);
  ses.run('Escape');
  // a column-oriented one-input table off to the right: tickets down I, EBITDA in J, the driver C13 as the column input cell
  const r0 = C.oneWay.vals;
  Sc.commitInput(`=C${C.outputs.ebitda}`, r0, 10);
  [12, 13, 14, 15, 16].forEach((t, i) => Sc.commitInput(String(t), r0 + 1 + i, 9));
  Sc.goTo(r0, 9); ses.run(`Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Right Alt A W T Alt+C "C${C.driver}" Enter`);
  const grid = ['D', 'E', 'F', 'G', 'H'].map(c => Sc.value(c + C.oneWay.ebitda));
  [0, 1, 2, 3, 4].forEach(i => assert.ok(near(Sc.value('J' + (r0 + 1 + i)), grid[i], 1e-6), `ticket ${12 + i}`));
  assert.equal(Sc.value('C' + C.driver), null, 'the driver is left blank');
});

test('4.6: the names resolve on the sheet and in a formula', () => {
  const ses = live('S463'); const Sc = open(ses, 'Scenarios');
  assert.deepEqual(Object.keys(ses.names).sort(), Object.keys(wb.NAMES).sort());
  Sc.commitInput('=INDEX(Cases,Case)', 99, 3); assert.equal(Sc.value('C99'), Sc.value('C' + C.picker));
  Sc.commitInput('=ROWS(Sites)', 99, 4); assert.equal(Sc.value('D99'), 6);
  Sc.commitInput('=Ticket-Cost_Per_Wash', 99, 5); assert.equal(Sc.value('E99'), wb.INPUTS.ticket - wb.INPUTS.cost);
});
