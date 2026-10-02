// The views of the Formulas and Data tools (ui/tool-cards.js), the nested outline and Page Break
// Preview overlays (ui/sheet-overlays.js), the gallery's custom styles, the Tab Color palette, and
// the workbook records a saved state carries (custom styles, watches, kept link values).
// Pure HTML from a live Session: the cards read the draft the keys edit, so a key and the card agree.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { toolCard, TOOL_CARDS } from '../ui/tool-cards.js';
import { RibbonView } from '../ui/ribbon-view.js';
import { outlineMarks, outlineHeaderHtml, outlineLevelHtml, pageBoxes } from '../ui/sheet-overlays.js';
import { TOOL_DIALOGS } from '../engine/tools.js';
import { sessionToState, diffStates } from '../content/workbooks/clearcoat-weekly.js';

const fresh = (cells, opts) => new Session(new Sheet({ cells, ...(opts || {}) }), { now: () => 0 });
const card = s => { const c = toolCard(s); assert.ok(c, 'a card for ' + s.dialog); return c; };

test('every tool dialog the engine opens has a card', () => {
  for (const d of TOOL_DIALOGS) assert.ok(TOOL_CARDS[d], d);
});

test('Goal Seek: the three boxes, then the status with target and current values; the card buttons are the keys', () => {
  const s = fresh({ A1: { value: 2 }, B1: { formula: '=A1*10' } }); s.sheet.goTo(1, 2);
  s.run('Alt A W G'); let c = card(s);
  assert.equal(c.title, 'Goal Seek'); assert.ok(c.body.includes('S<u>e</u>t cell:') && c.body.includes('B1') && c.body.includes('dset:key:Alt+V'));
  s.run('Alt+V "50" Alt+C "A1" Enter'); c = card(s);
  assert.equal(c.title, 'Goal Seek Status'); assert.ok(c.body.includes('found a solution') && c.body.includes('Target value:') && c.body.includes('>50<'), c.body);
});

test('Data Table, Text to Columns, Edit Links, the Watch Window', () => {
  let s = fresh({ A2: { value: 1 }, B1: { formula: '=A2*2' } }); s.sheet.select('A1:B4'); s.run('Alt A W T'); let c = card(s);
  assert.ok(c.body.includes('<u>R</u>ow input cell:') && c.body.includes('<u>C</u>olumn input cell:'));
  s = fresh({ A1: { value: 'AUS,Austin' }, A2: { value: 'DAL,Dallas' } }); s.sheet.select('A1:A2'); s.run('Alt A E'); c = card(s);
  assert.ok(c.body.includes('Step 1 of 3') && c.body.includes('<u>D</u>elimited'));
  s.run('Alt+N Alt+C'); c = card(s); assert.ok(c.body.includes('Step 2 of 3') && c.body.includes('<td class="">Austin</td>'), c.body);
  s.run('Alt+N Right'); c = card(s); assert.ok(c.body.includes('<th class="on" data-act="dset:tpick:1">General</th>'), 'the picked column is lit on step 3');
  assert.ok(c.foot.includes('Fi<u>n</u>ish') === false && c.foot.includes('<u>F</u>inish'));
  s = fresh({}); s.setExternalValues('Budget.xlsx', 'Annual', { C10: 125 }); s.sheet.commitInput('=[Budget.xlsx]Annual!C10+1', 1, 1);
  s.run('Alt A K'); c = card(s); assert.equal(c.title, 'Edit Links'); assert.ok(c.body.includes('Budget.xlsx') && c.body.includes('Sheet1!A1') && c.body.includes('<u>B</u>reak Link'));
  s.run('Alt+B'); c = card(s); assert.equal(c.title, 'Microsoft Excel'); assert.ok(c.foot.includes('Break Links'));
  s = fresh({ A1: { value: 2 }, B1: { formula: '=A1*3' } }); s.sheet.goTo(1, 2); s.run('Alt M W Alt+A Enter'); c = card(s);
  assert.equal(c.title, 'Watch Window'); assert.equal(c.pane, true); assert.ok(c.body.includes('<span>B1</span><span>6</span><span>=A1*3</span>'), c.body);
});

test('PivotTable: Create PivotTable, then the field list with its areas; Insert Hyperlink; the Style dialog', () => {
  const cells = { A1: { value: 'Site' }, B1: { value: 'Washes' }, A2: { value: 'Austin' }, B2: { value: 10 }, A3: { value: 'Dallas' }, B3: { value: 20 } };
  let s = fresh(cells); s.run('Alt N V T'); let c = card(s);
  assert.equal(c.title, 'Create PivotTable'); assert.ok(c.body.includes('$A$1:$B$3') && c.body.includes('<u>N</u>ew Worksheet'));
  s.run('Enter R Down V'); c = card(s); assert.equal(c.title, 'PivotTable Fields'); assert.equal(c.pane, true);
  assert.ok(c.body.includes('<span class="cf-chip">Site</span>') && c.body.includes('Sum of Washes'), c.body);
  s = fresh({ A1: { value: 'Go' } }); s.addSheet('Inputs'); s.switchSheet(0); s.run('Ctrl+K Alt+A'); c = card(s);
  assert.equal(c.title, 'Insert Hyperlink'); assert.ok(c.body.includes('Typ<u>e</u> the cell reference:') && c.body.includes('Inputs'));
  s = fresh({ A1: { value: 5, bold: true } }); s.run('Alt H J N'); c = card(s);
  assert.equal(c.title, 'Style'); assert.ok(c.body.includes('Style 1') && c.body.includes('Calibri 11, Bold'));
  s.run('Alt+B'); assert.ok(!card(s).body.includes('od-box on"></span><span class="od-lbl tc-w"><u>B</u>order'), 'the tick follows the key');
});

test('Sort, Remove Duplicates, Data Validation, Evaluate Formula, Error Checking, the filter menu', () => {
  const cells = { A1: { value: 'Site' }, B1: { value: 'Washes' }, A2: { value: 'Dallas' }, B2: { value: 20 }, A3: { value: 'Austin' }, B3: { value: 10 } };
  let s = fresh(cells); s.run('Alt A S S'); let c = card(s);
  assert.ok(c.body.includes('Sort by') && c.body.includes('A to Z') && c.body.includes('My data <u>h</u>as headers'));
  s.run('Escape Alt A M'); c = card(s); assert.ok(c.body.includes('Washes'));
  s.run('Escape'); s.sheet.goTo(2, 2); s.run('Alt A V V Down'); c = card(s); assert.ok(c.body.includes('Whole number') && c.body.includes('<u>M</u>inimum:'), c.body);
  s.run('Escape'); s = fresh({ A1: { value: 2 }, B1: { formula: '=A1/0' } }); s.sheet.goTo(1, 2); s.run('Alt M V'); c = card(s);
  assert.ok(c.body.includes('Sheet1!$B$1') && c.body.includes('<u>A1</u>'), c.body);
  s.run('Escape Alt M K'); c = card(s); assert.ok(c.body.includes('Error in cell B1') && c.body.includes('Divide by Zero Error'));
  s = fresh(cells); s.run('Ctrl+Shift+L'); s.sheet.goTo(1, 1); s.run('Alt+Down'); c = card(s);
  assert.ok(c.body.includes('Sort A to Z') && c.body.includes('(Select All)') && c.body.includes('Austin'), c.body);
});

test('the cell-style gallery lists the custom styles after the built-ins; Tab Color draws its palette', () => {
  const s = fresh({ A1: { value: 5, bold: true } }); s.run('Alt H J N "Total" Enter Alt H J');
  const html = RibbonView.styleChips(s, 'rdrop-chips');
  assert.ok(html.includes('st-custom" data-act="style:' + (s.cellStyleList().length - 1) + '">Total</span>') && html.includes('>custom<'), html);
  s.run('Escape Escape Escape Alt H O T Right'); const sw = RibbonView.prototype.swatchDropHtml.call({ session: s });
  assert.ok(sw.includes('tab color') && sw.includes('Red') && sw.includes('fc-swatch on'), sw);
});

test('the nested outline: a bracket per level, each button in its level lane, level buttons 1 to depth + 1', () => {
  const S = new Sheet({}); S.groupSpan('r', 2, 9); S.groupSpan('r', 3, 5);
  const m = outlineMarks(S, 'r', S.rows);
  assert.equal(m.depth, 2); assert.deepEqual(m.bars[4].map(b => b.level), [1, 2]); assert.deepEqual(m.bars[5], [{ level: 1, end: false }, { level: 2, end: true }]);
  assert.deepEqual(m.btns[6], [{ i: 1, level: 2, on: false }]); assert.deepEqual(m.btns[10], [{ i: 0, level: 1, on: false }]);
  assert.ok(outlineHeaderHtml(m, 'r', 6).includes('--ol-l:2" data-ol="r:1"'));
  assert.equal((outlineLevelHtml(m, outlineMarks(S, 'c', S.cols)).match(/data-olv="r:/g) || []).length, 3);
  S.showOutlineLevel('r', 2); const m2 = outlineMarks(S, 'r', S.rows);
  assert.equal(m2.bars[4].length, 1, 'level 2 folds the inner group: its bracket goes'); assert.equal(m2.btns[6][0].on, true);
});

test('Page Break Preview: the page boxes, numbered down then over; an automatic break dashed, a manual one solid; nothing in Normal view', () => {
  const cells = {}; for (let r = 1; r <= 80; r++) cells['A' + r] = { value: r };
  const S = new Sheet({ cells, rows: 100 }); assert.equal(pageBoxes(S), null);
  S.view = 'pagebreak'; let b = pageBoxes(S);
  assert.equal(b.range.r2, 80); assert.ok(b.pages.length >= 2); assert.equal(b.pages[1].autoTop, true);
  S.goTo(10, 1); S.insertPageBreak(); b = pageBoxes(S);
  assert.equal(b.pages[1].r1, 10); assert.equal(b.pages[1].autoTop, false, 'the manual break is solid'); assert.deepEqual(b.pages.map(p => p.page), b.pages.map((_, i) => i + 1));
});

test('the saved state carries the custom cell styles, the watches and the values kept with links, and loads them back', () => {
  const s = fresh({ A1: { value: 5, bold: true }, B1: { formula: '=A1*2' } });
  s.run('Alt H J N "Total" Enter'); s.sheet.goTo(1, 2); s.run('Alt M W Alt+A Enter Escape');
  s.setExternalValues('Budget.xlsx', 'Annual', { C10: 125 }); s.sheet.commitInput('=[Budget.xlsx]Annual!C10+1', 2, 1);
  const st = JSON.parse(JSON.stringify(sessionToState(s)));
  assert.equal(st.cellStyles[0].name, 'Total'); assert.deepEqual(st.watches, [{ sheet: 'Sheet1', key: 'B1' }]); assert.deepEqual(st.externalValues, { '[budget.xlsx]annual': { C10: 125 } });
  const t = new Session(new Sheet({ cells: JSON.parse(JSON.stringify(st.sheets[0].cells)) }), { now: () => 0 });
  assert.equal(t.loadWorkbookExtras(st), true); t.recalcAll();
  assert.equal(t.sheet.value('A2'), 126, 'the kept value feeds the link'); assert.ok(t.applyCellStyleByName('Total')); assert.equal(t.watchView()[0].value, '10');
  assert.deepEqual(diffStates(sessionToState(t), st).filter(d => ['cellStyles', 'watches', 'externalValues'].includes(d.kind)), []);
  t.watches = []; assert.deepEqual(diffStates(sessionToState(t), st).map(d => d.kind).filter(k => ['cellStyles', 'watches', 'externalValues'].includes(k)), ['watches'], 'a lost watch is a difference');
  assert.equal(sessionToState(fresh({})).cellStyles, undefined, 'an untouched workbook adds nothing');
});
