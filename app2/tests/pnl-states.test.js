// app2/tests/pnl-states.test.js — the Chapter 2 workbook (clearcoat-pnl): the raw export builds a
// real four-sheet workbook inside the engine’s grid, the figures tie (FY26E is its twelve months,
// the checks read zero, the subtotals are live), the chained module states land where the lessons
// expect, the presentation end state changes how the page reads and never what it says, and the
// cluster clothing is deterministic per seed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATES, STATE_ORDER, CHAIN, stateOf, LINE_ROWS, COST_ROWS, YEAR_COLS, YEAR_ENDS, MONTH_COLS, MONTHLY, FIGURES, CODES, MULTIPLE, clusterPnl, clusterPatch, diffStates } from '../content/workbooks/clearcoat-pnl.js';
import { WORKBOOKS, workbookState } from '../content/workbooks/index.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { mulberry32 } from '../engine/rng.js';

const build = sp => new Sheet({ cells: structuredClone(sp.cells), colW: sp.colW, gridlines: sp.gridlines, freeze: sp.freeze });
function live(st) {
  const ses = new Session(build(st.sheets[0]), { now: () => 0 });
  ses.sheets[0].name = st.sheets[0].name;
  for (const sh of st.sheets.slice(1)) ses.addSheet(sh.name, build(sh));
  for (let i = 0; i < 2; i++) for (const e of ses.sheets) e.sheet.recalc();
  return ses;
}
const sheetIn = (ses, name) => ses.sheets.find(x => x.name === name).sheet;
const close = (a, b) => Math.abs(a - b) < 1e-6;

test('the workbook is registered and every state builds P&L, Inputs, Monthly and Print (and Monthly detail from 2.4.3 on) inside 26 columns', () => {
  assert.ok(WORKBOOKS['clearcoat-pnl']);
  for (const id in STATES) {
    const st = workbookState('clearcoat-pnl', id);
    assert.deepEqual(st.sheets.slice(0, 4).map(s => s.name), ['P&L', 'Inputs', 'Monthly', 'Print'], id);
    assert.ok(st.sheets.length === 4 || (st.sheets.length === 5 && st.sheets[4].name === 'Monthly detail'), id);
    for (const sh of st.sheets) for (const ref in sh.cells) assert.ok(/^[A-Z]\d+$/.test(ref) && ref.charCodeAt(0) - 64 <= 26 && +ref.slice(1) <= 100, `${id} ${sh.name}!${ref} inside the grid`);
    assert.equal(live(st).sheets.length, st.sheets.length);
  }
});

test('the raw export ties: FY26E is its twelve months, the subtotals are live, the checks read zero', () => {
  const ses = live(stateOf('S1raw'));
  const pl = sheetIn(ses, 'P&L'), mon = sheetIn(ses, 'Monthly');
  for (const r of LINE_ROWS) {
    assert.equal(MONTHLY[r].reduce((a, v) => a + v, 0), FIGURES[r][2], `row ${r}: the months sum to FY26E`);
    assert.equal(pl.value('E' + r), FIGURES[r][2]);
  }
  assert.ok(close(pl.value('C39'), 0) && close(pl.value('C40'), 0), 'both checks read zero');
  assert.ok(close(mon.value('O10'), pl.value('E10')), 'Monthly full-year revenue is FY26E revenue');
  for (const col of YEAR_COLS) {
    const v = r => pl.value(col + r);
    assert.ok(close(v(24), v(10) - v(20) - v(23)), `${col}: EBITDA is revenue less site costs less head office, as the export writes it`);
    for (const r of COST_ROWS) assert.ok(v(r) > 0, `${col}${r}: the export types costs positive`);
  }
  assert.ok(pl.value('E24') > pl.value('C24') && pl.value('C24') > 0, 'EBITDA positive and growing');
  assert.equal(pl.value('C4'), 'FY2024', 'the timeline arrives as text');
  assert.equal(typeof sheetIn(ses, 'Inputs').value('B13'), 'string', 'the multiple arrives typed as text');
  assert.equal(Object.keys(stateOf('S1raw').sheets[3].cells).length, 0, 'Print is empty until 2.7');
});

test('the module states chain S1raw to S2d: each step is a small diff, and the plantings sit where the lessons expect', () => {
  assert.deepEqual(CHAIN.slice(0, 9), ['S1raw', 'S1a', 'S1b', 'S1c', 'S1d', 'S2a', 'S2b', 'S2c', 'S2d']);
  assert.deepEqual(STATE_ORDER.slice(-3), ['Pdone', 'S8raw', 'S8done']);
  for (let i = 1; i < CHAIN.length; i++) {
    const d = diffStates(stateOf(CHAIN[i - 1]), stateOf(CHAIN[i]));
    assert.ok(d.length > 0, `${CHAIN[i]} differs from ${CHAIN[i - 1]}`);
  }
  const pl = id => stateOf(id).sheets[0].cells;
  const inp = id => stateOf(id).sheets[1].cells;
  assert.equal(pl('S1a').C7.fmtStyle, 'comma');
  assert.ok(pl('S1b').C13.value < 0 && pl('S1b').E23.value < 0); assert.equal(pl('S1b').C22.formula, '=C10+C20'); assert.match(pl('S1b').A2.value, /negative/);
  assert.equal(pl('S1c').C27.fmtStyle, 'percent'); assert.equal(pl('S1c').C27.decimals, 1); assert.equal(pl('S1c').C7.fmtStyle, 'currency');
  assert.equal(pl('S1d').C4.value, YEAR_ENDS[0]); assert.equal(pl('S1d').E4.fmtStyle, 'date'); assert.equal(pl('S1d').E5.value, 'E');
  assert.equal(pl('S2a').C8.numFmt, CODES.plain); assert.equal(pl('S2a').C7.numFmt, CODES.dollar); assert.equal(pl('S2a').C27.numFmt, CODES.pct);
  assert.equal(inp('S2b').B13.value, MULTIPLE); assert.equal(inp('S2b').B13.numFmt, CODES.multiple); assert.equal(inp('S2b').B15.numFmt, CODES.millions);
  assert.equal(pl('S2c').C4.numFmt, CODES.fyActual); assert.equal(pl('S2c').E4.numFmt, CODES.fyEstimate);
  assert.equal(stateOf('S2c').sheets[2].cells[MONTH_COLS[0] + '4'].fmtStyle, 'date');
  assert.equal(pl('S2d').C39.numFmt, CODES.check); assert.equal(pl('S2d').C34.numFmt, CODES.washes); assert.equal(inp('S2d').B12.numFmt, CODES.onOff);
  const p2b = sheetIn(live(stateOf('S2b')), 'P&L');
  assert.equal(p2b.text('C4'), 'Dec-24');
});

test('Pdone: presentation changes how the page reads, never what it says', () => {
  const raw = sheetIn(live(stateOf('S1raw')), 'P&L'), done = sheetIn(live(stateOf('Pdone')), 'P&L');
  for (const col of YEAR_COLS) {
    for (const r of [7, 10, 22, 24]) assert.ok(close(done.value(col + r), raw.value(col + r)), `${col}${r}`);
    for (const r of COST_ROWS) assert.ok(close(done.value(col + r), -raw.value(col + r)), `${col}${r} negative`);
  }
  assert.ok(diffStates(stateOf('S1raw'), stateOf('Pdone')).length > 100);
});

test('clusterPnl: deterministic per seed, different across seeds, the same shape every time', () => {
  const a = clusterPnl(mulberry32(7)), b = clusterPnl(mulberry32(7)), c = clusterPnl(mulberry32(8));
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.annual, c.annual);
  for (const x of [a, c]) {
    assert.equal(x.annual.length, 3);
    for (const y of x.annual) assert.deepEqual(Object.keys(y).map(Number).sort((p, q) => p - q), [...LINE_ROWS].sort((p, q) => p - q));
    assert.ok(x.sites[0] < x.sites[1] && x.sites[1] < x.sites[2]);
    assert.match(x.title, /^Clearcoat Express: .+ cluster P&L export/);
  }
  const keys = n => Object.keys(clusterPatch(mulberry32(n), { margins: true })).length;
  assert.equal(keys(1), keys(2), 'the workload never moves');
});
