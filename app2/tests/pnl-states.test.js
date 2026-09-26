// app2/tests/pnl-states.test.js — the Chapter 2 workbook (voltline-pnl): the raw dump builds a real
// four-sheet workbook inside the engine's grid, the figures tie (FY26E is its twelve months, the
// checks read zero, the subtotals are live), the presentation end state changes how the page reads
// and never what it says, and the cluster clothing is deterministic per seed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATES, stateOf, present, PNL, LINE_ROWS, COST_ROWS, PERIOD_COLS, MONTH_COLS, ANNUAL, MONTHLY, FY26E, MONTH_ENDS, clusterPnl, diffStates } from '../content/workbooks/voltline-pnl.js';
import { WORKBOOKS, workbookState } from '../content/workbooks/index.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { mulberry32 } from '../engine/rng.js';
import { serialToDate } from '../engine/format.js';

const build = sp => new Sheet({ cells: structuredClone(sp.cells), colW: sp.colW, gridlines: sp.gridlines, freeze: sp.freeze });
function live(st) {
  const ses = new Session(build(st.sheets[0]), { now: () => 0 });
  ses.sheets[0].name = st.sheets[0].name;
  for (const sh of st.sheets.slice(1)) ses.addSheet(sh.name, build(sh));
  for (let i = 0; i < 2; i++) for (const e of ses.sheets) e.sheet.recalc();
  return ses;
}
const sheetIn = (ses, name) => ses.sheets.find(x => x.name === name).sheet;

test('the workbook is registered and every state builds P&L, Inputs, Monthly and Print inside 26 columns', () => {
  assert.ok(WORKBOOKS['voltline-pnl']);
  for (const id in STATES) {
    const st = workbookState('voltline-pnl', id);
    assert.deepEqual(st.sheets.map(s => s.name), ['P&L', 'Inputs', 'Monthly', 'Print'], id);
    for (const sh of st.sheets) for (const ref in sh.cells) assert.ok(/^[A-Z]\d+$/.test(ref) && ref.charCodeAt(0) - 64 <= 26 && +ref.slice(1) <= 100, `${id} ${sh.name}!${ref} inside the grid`);
    const ses = live(st);
    assert.equal(ses.sheets.length, 4);
  }
});

test('the raw dump ties: FY26E is its twelve months to the cent, the subtotals are live, the checks read zero', () => {
  const ses = live(stateOf('S1raw'));
  const pl = sheetIn(ses, 'P&L');
  for (const r of LINE_ROWS) {
    const sumCents = MONTHLY[r].reduce((a, v) => a + Math.round(v * 100), 0);
    assert.equal(Math.round(FY26E[r] * 100), sumCents, `row ${r}`);
    assert.equal(pl.value('D' + r), FY26E[r]);
  }
  assert.ok(Math.abs(pl.value('D23')) < 1e-6, 'FY26E revenue = sum of months');
  for (const col of MONTH_COLS) assert.equal(sheetIn(ses, 'Monthly').value(String.fromCharCode(col.charCodeAt(0) - 4) + '12'), 0, `Monthly check ${col}`);
  // live subtotals: EBITDA = revenue − energy − opex, as the export writes it (costs positive)
  const b = k => pl.value('B' + k);
  assert.ok(Math.abs(pl.value('B17') - (b(5) + b(6) + b(7) - b(9) - (b(12) + b(13) + b(14) + b(15)))) < 1e-6);
  assert.ok(pl.value('B17') > 0 && pl.value('D17') > pl.value('B17'), 'EBITDA positive and growing');
  // the plantings: costs positive, a site count dressed as currency, bare date serials, year numbers, a zero month, Home launching in April
  for (const r of COST_ROWS) assert.ok(pl.value('B' + r) > 0, `cost row ${r} arrives positive`);
  assert.equal(pl.cellAt('B20').fmtStyle, 'currency');
  assert.equal(pl.value('F4'), MONTH_ENDS[0]); assert.equal(serialToDate(MONTH_ENDS[0]).toISOString().slice(0, 10), '2026-01-31');
  assert.equal(pl.value('B4'), 2024);
  assert.equal(pl.value('L13'), 0, 'July maintenance slipped: a zero month');
  assert.equal(pl.value('B7'), 0); assert.equal(pl.value('F7'), 0); assert.ok(pl.value('I7') > 0);
  assert.equal(sheetIn(ses, 'Inputs').value('B10'), '2.9x', 'leverage typed as text');
  assert.equal(Object.keys(stateOf('S1raw').sheets[3].cells).length, 0, 'Print is empty until 2.7');
});

test('Pdone: presentation changes how the page reads, never what it says', () => {
  const raw = live(stateOf('S1raw')), done = live(stateOf('Pdone'));
  const a = sheetIn(raw, 'P&L'), b = sheetIn(done, 'P&L');
  for (const col of PERIOD_COLS) for (const r of [8, 10, 16, 17, 21]) {
    const want = r === 16 ? -a.value(col + r) : a.value(col + r);
    assert.ok(Math.abs(b.value(col + r) - want) < 1e-6, `${col}${r}`);
  }
  for (const col of PERIOD_COLS) for (const r of COST_ROWS) assert.ok(b.value(col + r) <= 0, `${col}${r} negative`);
  assert.equal(b.cellAt('C4').value, 'FY25A');
  assert.equal(b.cellAt('B10').formula, '=B8+B9');
  assert.equal(b.gridlines, false);
  assert.ok(diffStates(stateOf('S1raw'), stateOf('Pdone')).length > 100);
  assert.equal(stateOf('Pdone').sheets[0].cells.A1.ca, 17, 'the title centred across A:Q');
  const again = present(stateOf('S1raw'));
  assert.deepEqual(diffStates(again, stateOf('Pdone')), [], 'present() is deterministic');
});

test('clusterPnl: deterministic per seed, different across seeds, the same shape every time', () => {
  const a = clusterPnl(mulberry32(7)), b = clusterPnl(mulberry32(7)), c = clusterPnl(mulberry32(8));
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.annual, c.annual);
  for (const x of [a, c]) {
    assert.equal(x.annual.length, 3);
    for (const y of x.annual) assert.deepEqual(Object.keys(y).map(Number).sort((p, q) => p - q), [...LINE_ROWS].sort((p, q) => p - q));
    assert.ok(x.sites[0] < x.sites[1] && x.sites[1] < x.sites[2]);
    assert.match(x.title, /cluster P&L/);
  }
  assert.equal(ANNUAL[0][7], 0);
});
