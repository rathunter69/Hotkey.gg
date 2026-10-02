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

test('outline to a second level (Alt+Shift+Right twice): nested groups, the level buttons fold by level, Hide Detail folds the innermost', () => {
  const s = fresh({}); const S = s.sheet;
  S.select('A2:A9'); s.run('Shift+Space Alt+Shift+Right');   // rows 2 to 9: level 1
  S.select('A3:A5'); s.run('Shift+Space Alt+Shift+Right'); S.select('A7:A8'); s.run('Shift+Space Alt+Shift+Right');   // two level-2 groups inside
  assert.deepEqual(S.groups.rows, [{ r1: 2, r2: 9, collapsed: false }, { r1: 3, r2: 5, collapsed: false, level: 2 }, { r1: 7, r2: 8, collapsed: false, level: 2 }]);
  assert.equal(S.outlineDepth('r'), 2, 'the buttons run 1 to 3');
  assert.equal(S.showOutlineLevel('r', 2), true); assert.deepEqual(S.groups.rows.map(g => g.collapsed), [false, true, true], 'level 2: the inner detail folds');
  assert.equal(S.isFolded('r', 4), true); assert.equal(S.isFolded('r', 6), false);
  S.showOutlineLevel('r', 1); assert.equal(S.isFolded('r', 6), true, 'level 1: only the summary rows show');
  S.showOutlineLevel('r', 3); assert.equal(S.groups.rows.some(g => g.collapsed), false, 'level 3: everything shows');
  S.goTo(4, 1); s.run('Alt A H'); assert.deepEqual(S.groups.rows.map(g => g.collapsed), [false, true, false], 'Hide Detail folds the innermost group at the cell');
  const back = new Sheet(JSON.parse(JSON.stringify(S.toJSON()))); assert.equal(back.groups.rows[1].level, 2);
  S.select('A3:A5'); s.run('Shift+Space Alt+Shift+Left'); assert.deepEqual(S.groups.rows, [{ r1: 2, r2: 9, collapsed: false }, { r1: 7, r2: 8, collapsed: false, level: 2 }]);
});

test('conditional formatting › Highlight Cells › Duplicate Values (Alt H L H D): every repeat across the range, text case aside, blanks never; Unique the other way', () => {
  const s = fresh({ A1: { value: 'AUS-DOM' }, A2: { value: 'aus-dom' }, A3: { value: 'AUS-MUE' }, A4: { value: 250 }, A5: { value: 250 }, A6: { value: null }, A7: { value: null }, A8: { value: '250' } }); const S = s.sheet;
  S.select('A1:A8'); s.run('Alt H L H D'); assert.equal(s.dialog, 'condfmt'); assert.equal(s.dlg.op, 'duplicate'); s.run('Enter');
  assert.deepEqual(S.condFmt.map(r => [r.kind, r.unique, r.range]), [['duplicate', false, 'A1:A8']]);
  const m = S.condFmtMap(); assert.deepEqual(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A8'].map(k => !!m[k]), [true, true, false, true, true, false, false], 'text "250" is not the number 250');
  S.select('B1:B3'); S.setCell('B1', { value: 1 }); S.setCell('B2', { value: 1 }); S.setCell('B3', { value: 2 }); S.recalc();
  s.run('Alt H L H D Down Enter'); assert.equal(S.condFmt[0].unique, true); const m2 = S.condFmtMap(); assert.deepEqual(['B1', 'B2', 'B3'].map(k => !!m2[k]), [false, false, true]);
  const back = new Sheet(JSON.parse(JSON.stringify(S.toJSON()))); assert.equal(back.condFmt[0].kind, 'duplicate');
});

test('Page Setup belongs to each sheet: a print area (Alt P R S), a custom header (Alt+C), manual page breaks (Alt P B I) and Page Break Preview (Alt W I)', () => {
  const cells = {}; for (let r = 1; r <= 120; r++) for (let c = 1; c <= 6; c++) cells[String.fromCharCode(64 + c) + r] = { value: r * c };
  const s = fresh(cells, { rows: 200 }); s.addSheet('Notes'); const S = s.sheet;
  s.run('Alt P O L'); assert.equal(s.settings.pageSetup.orientation, 'landscape');
  s.switchSheet(1); assert.equal(s.settings.pageSetup.orientation, 'portrait', 'the other sheet keeps its own setup'); s.switchSheet(0);
  S.select('A1:F80'); s.run('Alt P R S'); assert.equal(S.pageSetup.printArea, '$A$1:$F$80');
  s.run('Alt P S P H Alt+C "Project Rinse" Tab "&[Tab]" Enter Enter'); assert.deepEqual(S.pageSetup.header, { left: 'Project Rinse', centre: '&[Tab]', right: '' });
  s.run('Alt P S P S Alt+A'); assert.equal(s.dlg.focus, 'printArea'); assert.equal(s.dlg.printArea, '$A$1:$F$80'); s.run('Escape'); if (s.mode !== 'normal') s.run('Escape Escape Escape');
  s.run('Alt W I'); assert.equal(S.view, 'pagebreak');
  let pages = S.pages(); assert.equal(pages.length, 3, 'landscape letter: 80 rows of 20px run to three pages'); assert.equal(pages[0].r1, 1); assert.equal(pages.at(-1).r2, 80);
  S.goTo(41, 1); s.run('Alt P B I'); assert.deepEqual(S.breaks, { rows: [41], cols: [] });
  pages = S.pages(); assert.deepEqual(pages.map(p => [p.r1, p.r2]), [[1, 33], [34, 40], [41, 73], [74, 80]], 'the automatic breaks every 33 rows, restarted by the manual one'); assert.equal(pages[2].manual.top, true); assert.deepEqual(pages.auto.rows, [34, 74]);
  S.goTo(10, 4); s.run('Alt P B I'); assert.deepEqual(S.breaks, { rows: [10, 41], cols: [4] }); assert.equal(S.pages().find(p => p.c1 === 4 && p.r1 === 1).page > 1, true, 'pages run down, then over');
  s.run('Alt P B R'); assert.deepEqual(S.breaks, { rows: [41], cols: [] }); s.run('Alt P B A'); assert.deepEqual(S.breaks, { rows: [], cols: [] });
  s.run('Ctrl+Z'); assert.deepEqual(S.breaks, { rows: [41], cols: [] }, 'undo brings the breaks back');
  s.run('Alt P S P P Alt+F Enter'); assert.equal(S.pages().length, 1, 'Fit to 1 page ignores the manual breaks');
  const back = new Sheet(JSON.parse(JSON.stringify(S.toJSON()))); assert.equal(back.pageSetup.printArea, '$A$1:$F$80'); assert.equal(back.view, 'pagebreak'); assert.deepEqual(back.breaks.rows, [41]);
  s.run('Alt P R C'); assert.equal(S.pageSetup.printArea, undefined); s.run('Alt W L'); assert.equal(S.view, 'normal');
});
