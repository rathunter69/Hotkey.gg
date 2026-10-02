// app2/tests/clearcoat-databook.test.js — the Chapter 3 workbook (clearcoat-databook): every state
// builds a real workbook inside the engine, the solved pages pass the sheet standard, the figures
// tie (the checks block, the reconciliation and the loan schedule all read zero, the roll-up flag
// reads OK), the chain of lesson states is a chain, and each state's plantings are where the
// script's lessons expect them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATES, STATE_ORDER, CHAIN_IDS, LESSONS, LESSON_STATES, stateOf, MAP, MAP_PROJECT, STANDARD, AS_OF, TX_FIRST, TX_LAST, MEM_FIRST, MEM_LAST, PERIOD, dailyRow, AUSTIN, clusterData } from '../content/workbooks/clearcoat-databook.js';
import { WORKBOOKS, workbookState } from '../content/workbooks/index.js';
import { diffStates } from '../content/workbooks/clearcoat-weekly.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { sheetStandard } from '../app/graders.js';

const build = sp => new Sheet({ rows: sp.rows, cols: sp.cols, cells: structuredClone(sp.cells), colW: sp.colW, gridlines: sp.gridlines, freeze: sp.freeze, condFmt: sp.condFmt });
function live(st) {
  const ses = new Session(build(st.sheets[0]), { now: () => 0 });
  ses.sheets[0].name = st.sheets[0].name;
  for (const sh of st.sheets.slice(1)) ses.addSheet(sh.name, build(sh));
  for (let i = 0; i < 2; i++) for (const e of ses.sheets) e.sheet.recalc();
  return ses;
}
const sheetIn = (ses, name) => ses.sheets.find(x => x.name === name).sheet;
const isEmpty = (c, msg) => assert.ok(!c || (c.value == null && c.formula == null), `${msg || 'cell'} is empty: ${JSON.stringify(c)}`);
const zero = (v, msg) => assert.ok(typeof v === 'number' && Math.abs(v) < 1e-6, `${msg}: ${JSON.stringify(v)}`);
const SHEETS = ['Summary', 'Loans', 'Sites', 'Packages', 'Members', 'Daily', 'Transactions'];

test('the workbook is registered and every state builds the seven sheets (Scratch from 3.4.4) with no errors on the finished pages', () => {
  assert.ok(WORKBOOKS['clearcoat-databook']);
  assert.deepEqual(STATE_ORDER, [...CHAIN_IDS, 'S7raw', 'S7done']);
  assert.equal(CHAIN_IDS.length, LESSONS.length + 1, 'one state per lesson boundary');
  for (const id of STATE_ORDER) {
    const st = workbookState('clearcoat-databook', id);
    const names = st.sheets.map(s => s.name);
    assert.deepEqual(names.slice(0, 7), SHEETS, id);
    for (const sh of st.sheets) { const S = build(sh); for (const ref in sh.cells) assert.ok(S.cells[ref], `${id} ${sh.name}!${ref}`); }
  }
  // the live workbook (cross-sheet links resolved) is built for the states the other tests read; here, the chain's ends
  for (const id of ['S0', 'S3f', 'S7raw']) assert.equal(live(stateOf(id)).sheets.length, stateOf(id).sheets.length, id);
});

test('stateOf clones: mutating a copy never touches the master', () => {
  const a = stateOf('S0'); a.sheets[0].cells.A1.value = 'x'; delete a.sheets[1];
  assert.equal(stateOf('S0').sheets[0].cells.A1.value, STATES.S0.sheets[0].cells.A1.value);
  assert.equal(stateOf('S0').sheets.length, STATES.S0.sheets.length);
});

test('the solved pages pass the sheet standard, and the chain changes something at every step', () => {
  for (const [id, name] of STANDARD.pages) {
    const spec = stateOf(id).sheets.find(s => s.name === name);
    assert.deepEqual(sheetStandard(build(spec), { chapter: 3, read: true }), [], `${id} ${name}`);
  }
  for (let i = 1; i < CHAIN_IDS.length; i++) {
    const d = diffStates(stateOf(CHAIN_IDS[i - 1]), stateOf(CHAIN_IDS[i]));
    assert.ok(d.length > 0, `${CHAIN_IDS[i - 1]} → ${CHAIN_IDS[i]} (${LESSONS[i - 1].id}) changes the workbook`);
  }
  for (const l of LESSONS) assert.ok(LESSON_STATES[l.lesson].before && LESSON_STATES[l.lesson].after, l.lesson);
});

test('the solved databook ties: every check reads zero, the flag reads OK, the reconciliation and the schedule land on zero', () => {
  for (const [id, M] of [['S6d', MAP], ['S7done', MAP_PROJECT]]) {
    const ses = live(stateOf(id));
    const sm = sheetIn(ses, 'Summary'), lo = sheetIn(ses, 'Loans');
    const A = M.summary;
    for (let k = 1; k <= 6; k++) zero(sm.value('C' + (M.summaryChecksRow + k)), `${id} check ${k}`);
    assert.equal(sm.value('C' + (M.summaryChecksRow + 7)), 0);
    assert.equal(sm.value('C' + (M.summaryChecksRow + 8)), 'OK');
    assert.equal(sm.value('C2'), 'OK', 'the flag is linked to the top row');
    zero(sm.value('I' + A.rTotal), `${id} reconciliation`);
    assert.equal(sm.value('C' + A.sTotal), TX_LAST - TX_FIRST + 1, 'every export row is counted by site');
    assert.equal(sm.value('C' + A.pTotal), TX_LAST - TX_FIRST + 1, 'and by package');
    assert.equal(sm.value('D' + A.sTotal) + sm.value('E' + A.sTotal), TX_LAST - TX_FIRST + 1, 'member plus retail washes are every wash');
    assert.equal(sm.value('F' + A.sTotal), sm.value('C' + A.sumproduct), 'retail revenue by SUMIF equals washes times the price list');
    zero(sm.value('C' + A.oCheck), 'the inherited block ties once fixed');
    zero(lo.value('C' + (M.loansChecksRow + 1)), `${id} Loans check`);
    assert.ok(Math.abs(lo.value('C' + M.loans.npvHand) - lo.value('C' + M.loans.npvFn)) < 1e-6, 'NPV by hand agrees with the function');
    assert.ok(lo.value('C' + M.loans.npvHand) > 3000 && lo.value('C' + M.loans.npvHand) < 4000, 'the case is worth about $3.5m more than it cost');
    assert.ok(Math.abs(lo.value('C' + M.loans.irr) - 0.2617) < 5e-4, 'IRR about 26.2%');
    assert.ok(Math.abs(lo.value('C' + M.loans.payback) - 5.08) < 0.01, 'payback in the fifth year');
    assert.ok(Math.abs(lo.value('C' + M.loans.pmt) - 40637.97) < 0.01, 'the monthly payment');
    // the schedule's IPMT and PPMT columns match the built split on every row
    for (let k = 1; k <= M.months; k++) { const r = M.loans['m' + k]; zero(lo.value('E' + r) - lo.value('H' + r), `IPMT row ${k}`); zero(lo.value('F' + r) - lo.value('I' + r), `PPMT row ${k}`); }
    if (id === 'S6d') { zero(lo.value('G' + M.loans.m120), 'month 120 closes at zero'); zero(lo.value('J' + M.loans.m120) - lo.value('C' + M.loans.totalInt), 'cumulative interest is the total'); }
    // the flags block: five sites on target, one below; the bonus steps; the ramp site ramps
    assert.equal(sm.value('F' + A.onTarget), id === 'S6d' ? 5 : 4);
    if (id === 'S6d') {
      assert.deepEqual([5, 6, 7, 8, 9, 10].map(r => sm.value('E' + r)), ['On target', 'On target', 'On target', 'On target', 'On target', 'Below']);
      assert.deepEqual([5, 6, 7, 8, 9, 10].map(r => sm.value('I' + r)), [50, 0, 0, 50, 100, 0], 'the IFS bonus by tier');
      assert.equal(sm.value('P10'), 'Ramping'); assert.equal(sm.value('O6'), 'Visit'); assert.equal(sm.value('Q10'), 0, 'IFERROR catches Cedar Park\'s empty day');
      assert.equal(sm.value('C' + A.tradingDays), PERIOD.days);
      assert.equal(sm.value('C' + A.bandCheck), 0, 'the ticket bands sum to COUNT');
      const si = sheetIn(ses, 'Sites');
      assert.equal(si.value('J5'), AS_OF - AUSTIN.sites[0].opened); assert.ok(Math.abs(si.value('K5') - 7.5) < 0.01, 'Domain is seven and a half years old');
      assert.ok(Math.abs(si.value('C' + M.sites.stub) - 0.314) < 0.002, 'the Cedar Park stub (checklist H)');
      assert.equal(si.value('R10'), 8, 'Cedar Park has traded eight days'); assert.equal(si.value('Q5') > 1900 && si.value('Q5') < si.value('R5'), true);
      const mb = sheetIn(ses, 'Members');
      assert.equal(mb.value('L' + M.members.total), 3, 'three cancels in September');
      assert.equal(mb.value('J10'), 'Cancelled'); assert.equal(mb.value('G10'), mb.value('F10')); assert.equal(mb.value('G5'), AS_OF);
      const tx = sheetIn(ses, 'Transactions');
      assert.equal(tx.value('G5'), '2026-09'); assert.equal(tx.value('J5'), 'Q3 2026'); assert.equal(tx.value('L5'), 2027); assert.equal(tx.value('N5'), 'FY27 H1'); assert.equal(tx.value('P5'), 'Tue');
      assert.equal(tx.value('S5'), 'AUS'); assert.equal(tx.value('T5').length, 3); assert.ok(['kiosk', 'app', 'attendant'].includes(tx.value('W5')));
      assert.equal(tx.value('X' + (TX_FIRST + M.data.lowerRow)), 'D', 'SEARCH and UPPER read the lower-case memo');
      assert.equal(tx.value('AA5'), AS_OF);
    }
  }
});

test('S0 plants what the chapter finds: the export faults, the broken Summary, the empty cells each lesson fills', () => {
  const st = stateOf('S0');
  const ses = live(st);
  const sm = sheetIn(ses, 'Summary'), tx = st.sheets.find(s => s.name === 'Transactions').cells, A = MAP.summary;
  const data = MAP.data;
  for (const i of data.textRows) assert.equal(typeof tx['E' + (TX_FIRST + i)].value, 'string', `amount typed as text, row ${TX_FIRST + i}`);
  for (const i of data.dirtyRows) assert.match(tx['B' + (TX_FIRST + i)].value, / $/, `trailing space, row ${TX_FIRST + i}`);
  assert.match(tx['F' + (TX_FIRST + data.lowerRow)].value, /^Wash d @/, 'the lower-case memo');
  isEmpty(tx.G5, 'no helper columns yet'); assert.equal(tx.G4.value, 'Month key', 'but their headers');
  assert.equal(st.sheets.length, 7, 'no Scratch sheet yet');
  // the flags block: links and givens, nothing the lessons build
  assert.equal(sm.value('C5'), AUSTIN.sites[0].sep15); assert.equal(sm.value('D5'), 250); assert.equal(sm.value('Q10'), '#DIV/0!', 'Cedar Park\'s empty day shows the error 3.1.4 catches');
  for (const col of ['E', 'F', 'G', 'I', 'M', 'N', 'O', 'P', 'S', 'T', 'X']) assert.equal(st.sheets[0].cells[col + '5']?.formula, undefined, col + '5 is empty');
  assert.equal(st.sheets[0].cells.L5.value, 7.5); assert.equal(st.sheets[0].cells.L5.fontColor, 'blue', 'the age is typed until 3.2.1');
  assert.equal(st.sheets[0].cells.J6.value, 250, 'the tier table is given');
  // the inherited block: a short SUMIF, a typed 1,240, a text "12", an external link, a literal uplift
  assert.match(st.sheets[0].cells['D' + A.o0].formula, /\$B\$5:\$B\$93/, 'the SUMIF range is a row short');
  assert.equal(st.sheets[0].cells['D' + A.o1].value, 1240); assert.equal(st.sheets[0].cells['C' + A.o3].value, '12');
  assert.match(st.sheets[0].cells['C' + A.prior].formula, /^='\[Databook FY25\.xlsx\]/); assert.equal(sm.value('C' + A.prior), '#REF!');
  assert.match(st.sheets[0].cells['E' + A.o0].formula, /\*1\.05$/); isEmpty(st.sheets[0].cells['C' + A.uplift]);
  assert.notEqual(sm.value('C' + A.oCheck), 0, 'the inherited total does not tie');
  // the rest of the page is a skeleton: labels and headers, no figures; the checks block is labelled and empty
  assert.equal(st.sheets[0].cells['C' + A.s0].formula, undefined); assert.equal(st.sheets[0].cells['B' + A.s0].value, 'AUS-DOM');
  assert.equal(st.sheets[0].cells['C' + (MAP.summaryChecksRow + 1)].formula, undefined); assert.equal(st.sheets[0].cells['B' + (MAP.summaryChecksRow + 1)].value, 'Site counts tie to package counts');
  assert.equal(st.sheets[0].cells.C2, undefined); assert.equal(st.sheets[0].condFmt, undefined);
  // Sites, Members, Loans: inputs in, formulas out
  const si = st.sheets.find(s => s.name === 'Sites').cells, mb = st.sheets.find(s => s.name === 'Members').cells, lo = st.sheets.find(s => s.name === 'Loans').cells;
  assert.equal(si.I5.value, AS_OF); isEmpty(si.J5); assert.equal(si.C13.value, PERIOD.start - 8, 'Labor Day'); assert.equal(si['C' + MAP.sites.stub].formula, undefined);
  assert.equal(mb.E5.fontColor, 'blue'); isEmpty(mb.G5); isEmpty(mb.L2, 'the fee is typed in 3.2.2'); assert.equal(mb.H2.formula, '=Sites!I5');
  assert.equal(lo['C' + MAP.loans.principal].value, 3500000); assert.equal(lo['C' + MAP.loans.pmt].formula, undefined); isEmpty(lo['D' + MAP.loans.m1]); assert.equal(lo['C' + MAP.loans.opCf].value, -5000);
});

test('each lesson state holds what its goals need (plantings and empties, in script order)', () => {
  const S = id => stateOf(id), cells = (id, name) => S(id).sheets.find(s => s.name === name).cells;
  const A = MAP.summary, L = MAP.loans;
  const st = l => LESSON_STATES[l];
  // 3.1.1 → 3.1.4
  assert.equal(cells(st('if-on-a-threshold').after, 'Summary').E5.formula, '=IF(C5>=D5,"On target","Below")'); assert.equal(cells(st('if-on-a-threshold').after, 'Summary').G5.formula, '=IF(C5>=D5,C5-D5,0)');
  assert.equal(cells(st('nested-if-ifs-min-max').after, 'Summary').G5.formula, '=MAX(C5-D5,0)'); assert.match(cells(st('nested-if-ifs-min-max').after, 'Summary').I5.formula, /^=IFS\(/); assert.equal(cells(st('nested-if-ifs-min-max').before, 'Summary').I4.value, undefined, 'the column is labelled in 3.1.2');
  assert.equal(cells(st('and-or-not').after, 'Summary').M5.formula, '=AND(C5<D5,L5>2)');
  assert.equal(cells(st('iferror-and-the-override').before, 'Summary').Q5.formula, '=H5/C5'); isEmpty(cells(st('iferror-and-the-override').before, 'Summary').R5);
  assert.equal(cells(st('iferror-and-the-override').after, 'Summary').Q5.formula, '=IFERROR(H5/C5,0)'); assert.equal(cells(st('iferror-and-the-override').after, 'Summary').R5.fontColor, 'blue'); assert.equal(cells(st('iferror-and-the-override').after, 'Summary').E5.formula, '=IF(S5>=D5,"On target","Below")');
  // 3.2.1 → 3.2.5
  isEmpty(cells(st('date-serials').before, 'Sites').J5); assert.equal(cells(st('date-serials').after, 'Sites').K5.formula, '=J5/365.25'); assert.equal(cells(st('date-serials').after, 'Summary').L5.formula, '=Sites!K5');
  isEmpty(cells(st('member-tenure').before, 'Members').L2); assert.equal(cells(st('member-tenure').after, 'Members').L2.value, 30); assert.equal(cells(st('member-tenure').after, 'Members').G5.formula, '=IF(F5="",$H$2,F5)');
  assert.equal(cells(st('period-keys').after, 'Transactions').G5.formula, '=TEXT(A5,"yyyy-mm")'); isEmpty(cells(st('period-keys').after, 'Transactions').L5);
  assert.equal(cells(st('yearfrac-and-fiscal-periods').after, 'Sites').K5.formula, '=YEARFRAC(E5,$I$5)'); assert.equal(cells(st('yearfrac-and-fiscal-periods').after, 'Transactions').L5.formula, '=IF(MONTH(A5)>=7,YEAR(A5)+1,YEAR(A5))');
  isEmpty(cells(st('trading-calendar').before, 'Sites').Q5); assert.equal(cells(st('trading-calendar').after, 'Sites').R5.formula, '=NETWORKDAYS.INTL(E5,$I$5,"0000000",$C$13:$C$14)'); assert.ok(cells(st('trading-calendar').after, 'Summary')['P' + A.s0].formula);
  // 3.3.1 → 3.3.6
  assert.equal(cells(st('round-family').after, 'Summary').U5.formula, '=CEILING(Q5,0.25)');
  assert.equal(cells(st('countif-countifs').before, 'Summary')['C' + A.s0].formula, undefined); assert.equal(cells(st('countif-countifs').after, 'Summary')['C' + A.s0].formula, `=COUNTIF(Transactions!$B$5:$B$94,B${A.s0})`);
  assert.equal(cells(st('countif-countifs').after, 'Summary')['F' + A.s0].formula, undefined, 'the sums wait for 3.3.3');
  assert.equal(cells(st('sumif-sumifs-averageifs').after, 'Summary')['F' + A.s0].formula, `=SUMIF(Transactions!$B$5:$B$94,B${A.s0},Transactions!$E$5:$E$94)`);
  assert.equal(cells(st('busiest-sites').after, 'Summary')['K' + A.s0].formula, `=RANK(C${A.s0},$C$${A.s0}:$C$${A.s5})`);
  assert.equal(cells(st('sumproduct-blended-ticket').after, 'Summary')['C' + A.sumproduct].formula, `=SUMPRODUCT(D${A.p0}:D${A.p2},E${A.p0}:E${A.p2})`);
  isEmpty(cells(st('the-reconciliation').before, 'Summary')['D' + A.r0]);
  const recon = cells(st('the-reconciliation').after, 'Summary');
  assert.equal(recon['G' + A.r2].value, -1); assert.equal(recon['G' + A.r4].value, -2); isEmpty(recon['G' + A.r0], 'the first two sites tie until the codes are cleaned');
  let ses = live(S(st('the-reconciliation').after));
  zero(sheetIn(ses, 'Summary').value('I' + A.rTotal), 'the reconciliation ties at the end of 3.3.6');
  assert.equal(sheetIn(ses, 'Summary').value('C' + (MAP.summaryChecksRow + 2)), -2, 'the counts are two short of the export rows until 3.4.1 (the trailing spaces)');
  assert.notEqual(sheetIn(ses, 'Summary').value('C' + (MAP.summaryChecksRow + 3)), 0, 'and SUMIF misses the three text amounts until 3.4.3');
  // 3.4.1 → 3.4.4
  const t41 = cells(st('split-the-codes').before, 'Transactions');
  for (const i of MAP.data.dirtyRows) assert.match(t41['B' + (TX_FIRST + i)].value, / $/);
  const t41a = cells(st('split-the-codes').after, 'Transactions');
  for (const i of MAP.data.dirtyRows) assert.doesNotMatch(t41a['B' + (TX_FIRST + i)].value, / $/, '3.4.1 leaves the codes clean');
  assert.equal(t41a.T5.formula, '=RIGHT(TRIM(B5),3)');
  ses = live(S(st('split-the-codes').after));
  zero(sheetIn(ses, 'Summary').value('C' + (MAP.summaryChecksRow + 2)), 'the counts tie once the codes are clean');
  assert.equal(sheetIn(ses, 'Summary').value('I' + A.rTotal), -2, 'and the reconciliation moves by the two washes the tallies missed');
  const t43 = cells(st('text-to-numbers').before, 'Transactions');
  for (const i of MAP.data.textRows) assert.equal(typeof t43['E' + (TX_FIRST + i)].value, 'string');
  const t43a = cells(st('text-to-numbers').after, 'Transactions');
  for (const i of MAP.data.textRows) assert.equal(typeof t43a['E' + (TX_FIRST + i)].value, 'number');
  assert.equal(t43a.AA5.formula, '=DATEVALUE("2026-09-15")');
  ses = live(S(st('text-to-numbers').after));
  zero(sheetIn(ses, 'Summary').value('I' + A.rTotal), '3.4.3 re-ties the reconciliation'); zero(sheetIn(ses, 'Summary').value('C' + (MAP.summaryChecksRow + 3)), 'and the SUMPRODUCT check');
  assert.equal(S(st('text-to-columns-flash-fill').before).sheets.length, 7); assert.equal(S(st('text-to-columns-flash-fill').after).sheets[7].name, 'Scratch');
  // 3.5.1 → 3.5.4
  assert.equal(cells(st('pv-fv-pmt').before, 'Loans')['C' + L.pmt].formula, undefined); assert.equal(cells(st('pv-fv-pmt').after, 'Loans')['C' + L.pmt].formula, `=-PMT(C${L.mRate},C${L.periods},C${L.principal})`);
  assert.equal(cells(st('npv-xnpv').after, 'Loans')['C' + L.npvFn].formula, `=NPV(C${L.dr},D${L.cf}:H${L.cf})+C${L.cf}`); isEmpty(cells(st('npv-xnpv').before, 'Loans')['C' + L.df]);
  assert.equal(cells(st('irr-xirr').after, 'Loans')['C' + L.irr].formula, `=IRR(C${L.cf}:H${L.cf})`);
  isEmpty(cells(st('payment-schedule').before, 'Loans')['D' + L.m1]); assert.equal(cells(st('payment-schedule').after, 'Loans')['C' + L.m120].value, 120); assert.equal(cells(st('payment-schedule').after, 'Loans')['H' + L.m1].formula, `=-IPMT($C$${L.mRate},C${L.m1},$C$${L.periods},$C$${L.principal})`);
  // 3.6.1 → 3.6.4
  assert.match(cells(st('trace-arrows-evaluate').before, 'Summary')['D' + A.o0].formula, /\$E\$5:\$E\$93/); assert.match(cells(st('trace-arrows-evaluate').after, 'Summary')['D' + A.o0].formula, /\$E\$5:\$E\$94/);
  assert.equal(cells(st('f9-show-formulas-at-scale').before, 'Summary')['D' + A.o1].value, 1240); assert.equal(cells(st('f9-show-formulas-at-scale').after, 'Summary')['D' + A.o1].formula, `=SUMIF(Transactions!$B$5:$B$94,B${A.o1},Transactions!$E$5:$E$94)`);
  assert.equal(cells(st('f9-show-formulas-at-scale').before, 'Summary')['C' + A.o3].value, '12'); assert.equal(cells(st('f9-show-formulas-at-scale').after, 'Summary')['C' + A.o3].formula, `=C${A.s3}`);
  assert.match(cells(st('hardcode-external-link-hunt').before, 'Summary')['C' + A.prior].formula, /Databook FY25/); assert.equal(cells(st('hardcode-external-link-hunt').after, 'Summary')['C' + A.prior].value, MAP.priorYear);
  assert.equal(cells(st('hardcode-external-link-hunt').after, 'Summary')['C' + A.uplift].value, 1.05); assert.equal(cells(st('hardcode-external-link-hunt').after, 'Summary')['E' + A.o0].formula, `=D${A.o0}*$C$${A.uplift}`);
  assert.equal(cells(st('checks-block-rollup').before, 'Summary').C2, undefined); assert.equal(cells(st('checks-block-rollup').after, 'Summary').C2.formula, `=C${MAP.summaryChecksRow + 8}`);
  assert.equal(S(st('checks-block-rollup').after).sheets[0].condFmt.length, 1);
  ses = live(S(st('checks-block-rollup').before));
  assert.equal(sheetIn(ses, 'Summary').value('C' + (MAP.summaryChecksRow + 7)), null, 'the roll-up is 3.6.4\'s');
});

test('the project: a fresh cluster, the same faults in, the trimmed databook out, deterministic', () => {
  const raw = stateOf('S7raw'), done = stateOf('S7done');
  assert.equal(raw.sheets[0].cells.A1.value, 'Clearcoat Express: San Antonio KPI databook, Sep 15 to Sep 29, 2026');
  const tx = raw.sheets.find(s => s.name === 'Transactions').cells;
  for (const i of MAP_PROJECT.data.textRows) assert.equal(typeof tx['E' + (TX_FIRST + i)].value, 'string');
  for (const i of MAP_PROJECT.data.dirtyRows) assert.match(tx['B' + (TX_FIRST + i)].value, / $/);
  isEmpty(raw.sheets[0].cells.E5); assert.equal(raw.sheets[0].cells.T4, undefined, 'the project has no ROUND family');
  assert.equal(done.sheets.length, 7, 'no Scratch sheet in the project');
  assert.equal(MAP_PROJECT.months, 12);
  assert.ok(MAP_PROJECT.summaryChecksRow < MAP.summaryChecksRow, 'a shorter page');
  const d1 = clusterData(AUSTIN), d2 = clusterData(AUSTIN);
  assert.deepEqual(d1.tx, d2.tx); assert.deepEqual(d1.daily, d2.daily);
  assert.equal(dailyRow(1, 0), 5 + PERIOD.days);
  assert.deepEqual(diffStates(stateOf('S7done'), stateOf('S7done')), []);
  assert.equal(MEM_LAST - MEM_FIRST + 1, 40);
});
