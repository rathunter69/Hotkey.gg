// Chapter 2's engine features, driven by keys as desktop Excel has them: New Cell Style, Insert
// Hyperlink, a second outline level, the Duplicate Values rule, Page Break Preview with manual
// breaks, and Page Setup per sheet with a print area and a custom header.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';

const fresh = (cells, opts) => { const toasts = []; const s = new Session(new Sheet({ cells, ...(opts || {}) }), { onToast: m => toasts.push(m), now: () => 0 }); s.toasts = toasts; return s; };

test('Cell Styles › New Cell Style (Alt H J N): saved By Example from the active cell, the ticked parts only, then reapplied from the gallery', () => {
  const s = fresh({ A1: { value: 5 }, B3: { value: 7 }, C3: { value: 'x' } }); const S = s.sheet;
  s.run('Ctrl+B'); S.setFontColor('blue'); S.setFill('yellow');
  s.run('Alt H J N'); assert.equal(s.dialog, 'newstyle'); assert.equal(s.dlg.name, 'Style 1');
  s.run('"Clearcoat Input" Alt+I Enter'); assert.equal(s.dialog, null);
  assert.equal(s.cellStyles.length, 1); assert.equal(s.cellStyles[0].includes.fill, false, 'Fill unticked');
  assert.equal(S.get(1, 1).style, 'Clearcoat Input');
  S.goTo(3, 2); s.run('Shift+Right Alt H J'); const idx = s.cellStyleList().findIndex(x => x.name === 'Clearcoat Input');
  for (let i = 0; i < idx; i++) s.run('Right'); s.run('Enter');
  for (const k of ['B3', 'C3']) { const c = S.cellAt(k); assert.equal(c.bold, true); assert.equal(c.fontColor, 'blue'); assert.equal(c.fill, null, 'fill is not part of the style'); assert.equal(c.style, 'Clearcoat Input'); }
  s.run('Ctrl+Z'); assert.equal(S.cellAt('B3').bold, false, 'one undo step');
  assert.equal(s.applyCellStyleByName('clearcoat input'), true); assert.equal(S.cellAt('B3').bold, true);
});
