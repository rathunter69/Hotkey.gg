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

test('Insert Hyperlink (Ctrl+K) to a place in this document: the text to display, the sheet and cell; followed by Shift+F10 O or a click; Remove Link', () => {
  const s = fresh({ A1: { value: 'Contents' } }); s.addSheet('Inputs'); const S = s.sheet;
  s.run('Ctrl+K'); assert.equal(s.dialog, 'hyperlink');
  s.run('Alt+A Alt+T "Go to inputs" Alt+C Down Alt+E "B5" Enter');
  const c = S.cellAt('A1'); assert.deepEqual(c.link, { sheet: 'Inputs', ref: 'B5' }); assert.equal(c.value, 'Go to inputs'); assert.equal(c.uline, true); assert.equal(c.fontColor, 'blue');
  s.run('Shift+F10 O'); assert.equal(s.sheet, s.sheets[1].sheet, 'followed to the Inputs sheet'); assert.deepEqual(s.sheet.active, { r: 5, c: 2 });
  s.switchSheet(0); assert.equal(s.followLink(1, 1), true, 'a click follows it too'); assert.equal(s.sheetIndex, 1);
  s.switchSheet(0); S.commitInput('=HYPERLINK("#Inputs!C7","Rates")', 2, 1); assert.equal(S.value('A2'), 'Rates'); s.followLink(2, 1); assert.deepEqual(s.sheet.active, { r: 7, c: 3 });
  s.switchSheet(0); S.goTo(1, 1); s.run('Ctrl+K'); assert.equal(s.dlg.mode, 'place'); s.run('Alt+R'); assert.equal(S.cellAt('A1').link, undefined); assert.equal(S.cellAt('A1').uline, false);
  S.goTo(3, 1); s.run('Ctrl+K Alt+X "https://hotkey.gg" Enter'); assert.deepEqual(S.cellAt('A3').link, { url: 'https://hotkey.gg' }); assert.equal(S.value('A3'), 'https://hotkey.gg');
});
