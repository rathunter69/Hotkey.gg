// Calculation settings and the pins of run R2's small engine items: iterative calculation with a
// circuit breaker (M78), the circular-reference warning, the Series dialog's month step, and the
// Custom box's reading of a bare m.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session, CIRCULAR_NOTE } from '../engine/keyboard.js';
import { numberTabResult } from '../engine/dialogs.js';
import { normalizeCode, formatValue as fmtValue } from '../engine/numfmt.js';
const formatValue = (v, code) => fmtValue(v, code).text;

const fresh = (cells, sheetOpts) => { const toasts = []; const s = new Session(new Sheet({ ...(cells ? { cells } : {}), ...(sheetOpts || {}) }), { onToast: m => toasts.push(m), now: () => 0 }); s.toasts = toasts; return s; };

test('M78: a circle reads 0 and raises the warning once with iteration off; with iteration on it settles to Maximum Change, and the breaker at 0 removes it', () => {
  // interest on the average balance: C1 reads the closing E1, which reads C1
  const s = fresh({ A1: { value: 100 }, B1: { value: 0.1 }, D1: { value: 1 }, C1: { formula: '=IF(D1=1,B1*(A1+E1)/2,0)' }, E1: { formula: '=A1-C1' } }); const S = s.sheet;
  assert.deepEqual(S.circular, ['C1', 'E1']); assert.equal(S.value('C1'), 0); assert.equal(S.value('E1'), 0, 'every cell of the circle reads 0 with iteration off');
  assert.deepEqual(s.toasts, [], 'a circle loaded with the sheet is not an entry');
  S.goTo(1, 6); s.run('"=C1" Enter'); assert.equal(s.toasts.length, 0, 'a cell that reads a circle is not a new circle');
  s.run('"=F2+1" Enter'); assert.deepEqual(s.toasts, [CIRCULAR_NOTE], 'a formula that refers to its own cell raises the warning'); assert.deepEqual(s.circularRefs(), ['C1', 'E1', 'F2']);
  s.run('Delete'); S.goTo(2, 6); s.run('Delete'); assert.deepEqual(s.circularRefs(), ['C1', 'E1']);
  // File › Options › Formulas: Enable iterative calculation
  s.run('Alt F T F I Enter'); assert.equal(s.settings.iterative, true); assert.equal(s.settings.maxIterations, 100); assert.equal(s.settings.maxChange, 0.001);
  const c = S.value('C1'); assert.ok(Math.abs(c - 10 / 1.05) < 0.01, 'C = 0.1 × (100 + (100 − C)) / 2 settles near 9.524: ' + c); assert.ok(Math.abs(S.value('E1') - (100 - c)) < 0.01, 'consistent to Maximum Change');
  assert.deepEqual(S.circular, ['C1', 'E1'], 'the status bar still names the circle');
  S.goTo(1, 4); s.run('"0" Enter'); assert.equal(S.value('C1'), 0); assert.equal(S.value('E1'), 100, 'the breaker at 0 removes the circle');
  S.goTo(1, 4); s.run('"1" Enter'); assert.ok(Math.abs(S.value('C1') - 10 / 1.05) < 0.01, 'and back on it settles again'); assert.equal(s.toasts.length, 1, 'no warning while iteration is on');
  s.run('Alt F T F I Enter'); assert.equal(s.settings.iterative, false); assert.equal(S.value('C1'), 0, 'iteration off: the circle reads 0 again');
});

test('M67: the Series dialog steps a date by months (Alt H F I S, Date, Month)', () => {
  const jan31 = Math.round((Date.UTC(2026, 0, 31) - Date.UTC(1899, 11, 30)) / 86400000);
  const s = fresh({ A1: { value: jan31 } }); const S = s.sheet;
  S.select('A1:A4'); s.run('Alt H F I S Alt+D Alt+M Enter');
  const d = n => { const t = new Date(Date.UTC(1899, 11, 30) + n * 86400000); return t.getUTCFullYear() + '-' + (t.getUTCMonth() + 1) + '-' + t.getUTCDate(); };
  assert.deepEqual(['A1', 'A2', 'A3', 'A4'].map(k => d(S.value(k))), ['2026-1-31', '2026-2-28', '2026-3-31', '2026-4-30'], 'the month end clips to the shorter month');
  S.select('A1:A3'); s.run('Alt H F I S Alt+D Alt+Y Enter'); assert.equal(d(S.value('A3')), '2028-1-31', 'Year steps by twelve months');
});

test('the Custom box: m inside quotes is a literal; a bare m after a scaling comma is a date code, which Excel refuses beside digits', () => {
  assert.equal(formatValue(1234567, '#,##0.0,,"m"'), '1.2m'); assert.equal(formatValue(2500, '0,"m"'), '3m'); assert.equal(formatValue(46053, 'mmm "m"'), 'Jan m');
  assert.equal(normalizeCode('#,##0.0,,"m"'), '#,##0.0,,"m"'); assert.equal(normalizeCode('#,##0.0,,k'), '#,##0.0,,"k"', 'a letter that is no code is quoted for you');
  assert.equal(normalizeCode('#,##0.0,,m'), null, 'm is the month code: Excel cannot use the number format you typed');
  assert.equal(normalizeCode('0.0,,M'), null); assert.equal(normalizeCode('0 "mm"'), '0 "mm"'); assert.equal(normalizeCode('0 mm'), null);
  assert.equal(numberTabResult({ cat: 'custom', code: '#,##0.0,,m' }), null); assert.deepEqual(numberTabResult({ cat: 'custom', code: '#,##0.0,,"m"' }), { style: 'custom', numFmt: '#,##0.0,,"m"' });
});
