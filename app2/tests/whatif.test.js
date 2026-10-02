// What-If Analysis on the Data tab, driven by keys as desktop Excel has it: Goal Seek (Alt A W G)
// and Data Table (Alt A W T), with the calculation option Automatic except for Data Tables.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { GOALSEEK_FOUND, GOALSEEK_FORMULA_NOTE, DATATABLE_INPUT_NOTE, TABLE_CELL_NOTE } from '../engine/tools.js';

const fresh = cells => { const toasts = []; const s = new Session(new Sheet({ cells }), { onToast: m => toasts.push(m), now: () => 0 }); s.toasts = toasts; return s; };
// price B1, washes B2, cost B3; profit B4 = B1*B2-B3
const MODEL = { A1: { value: 'Price' }, B1: { value: 12 }, A2: { value: 'Washes' }, B2: { value: 1000 }, A3: { value: 'Cost' }, B3: { value: 9000 }, A4: { value: 'Profit' }, B4: { formula: '=B1*B2-B3' } };

test('Goal Seek (Alt A W G): the set cell starts on the active cell; OK finds the changing value; the status box keeps it on Enter, puts it back on Esc; undo', () => {
  const s = fresh(MODEL); const S = s.sheet;
  S.goTo(4, 2); s.run('Alt A W G'); assert.equal(s.dialog, 'goalseek'); assert.equal(s.dlg.set, 'B4');
  s.run('Alt+V 6000 Alt+C "B1" Enter');
  assert.equal(s.dlg.status.found, true); assert.equal(s.dlg.status.note, GOALSEEK_FOUND('B4'));
  assert.ok(Math.abs(S.value('B1') - 15) < 1e-6); assert.ok(Math.abs(S.value('B4') - 6000) < 0.001);
  s.run('Enter'); assert.equal(s.dialog, null); assert.ok(Math.abs(S.value('B1') - 15) < 1e-6);
  s.run('Ctrl+Z'); assert.equal(S.value('B1'), 12, 'one undo step'); assert.equal(S.value('B4'), 3000);
  S.goTo(4, 2); s.run('Alt A W G Alt+V 0 Alt+C "$B$2" Enter'); assert.ok(Math.abs(S.value('B2') - 750) < 1e-6); s.run('Escape');
  assert.equal(S.value('B2'), 1000, 'Cancel puts the old value back'); assert.equal(S.value('B4'), 3000); assert.equal(s.dialog, null);
  S.goTo(1, 2); s.run('Alt A W G Alt+V 5 Alt+C "B2" Enter'); assert.equal(s.toasts.at(-1), GOALSEEK_FORMULA_NOTE); assert.equal(s.dialog, 'goalseek'); s.run('Escape');
});

test('Data Table (Alt A W T): one and two inputs fill {=TABLE()} results, an entry inside is refused, Automatic except for Data Tables waits for F9', () => {
  const cells = { ...MODEL,
    D2: { formula: '=B4' }, C3: { value: 10 }, C4: { value: 12 }, C5: { value: 14 },   // a one-input table, prices down C, Column input cell B1
    F2: { formula: '=B4' }, G2: { value: 800 }, H2: { value: 1200 }, F3: { value: 10 }, F4: { value: 14 } };   // two inputs: washes across, prices down
  const s = fresh(cells); const S = s.sheet;
  S.goTo(2, 3); s.run('Shift+Down Shift+Down Shift+Down Shift+Right Alt A W T Alt+C "B1" Enter');
  assert.deepEqual([S.value('D3'), S.value('D4'), S.value('D5')], [1000, 3000, 5000]); assert.equal(S.get(3, 4).table, '{=TABLE(,B1)}');
  assert.equal(S.value('B1'), 12, 'the input cell is back as it was'); assert.equal(S.value('B4'), 3000);
  S.goTo(2, 6); s.run('Shift+Down Shift+Down Shift+Right Shift+Right Alt A W T Alt+R "B2" Alt+C "B1" Enter');
  assert.deepEqual([S.value('G3'), S.value('H3'), S.value('G4'), S.value('H4')], [-1000, 3000, 2200, 7800]);
  S.goTo(3, 4); s.run('"5" Enter'); assert.equal(s.toasts.at(-1), TABLE_CELL_NOTE); assert.equal(s.editing, true); s.run('Escape');
  S.goTo(3, 2); s.run('"10000" Enter'); assert.deepEqual([S.value('D3'), S.value('D5')], [0, 4000], 'Automatic: an edit refills the tables');
  s.run('Alt M X E'); assert.equal(s.settings.calcMode, 'autoExceptTables');
  S.goTo(3, 2); s.run('"8000" Enter'); assert.equal(S.value('B4'), 4000); assert.equal(S.value('D3'), 0, 'the table waits');
  s.run('F9'); assert.equal(S.value('D3'), 2000, 'F9 calculates the tables');
  S.goTo(2, 3); s.run('Shift+Right Alt A W T Enter'); assert.equal(s.toasts.at(-1), DATATABLE_INPUT_NOTE);
  const back = new Sheet(JSON.parse(JSON.stringify(S.toJSON()))); assert.equal(back.dataTables.length, 2); assert.equal(back.get(3, 4).table, '{=TABLE(,B1)}');
});
