// app2/tests/ribbon-commands.test.js — the mouse command table (ui/ribbon-commands.js) covers every
// Alt-walk command and produces the same sheet state as the keyboard walk. Headless: no DOM.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { COMMANDS, MENUS, TABS } from '../engine/ribbon.js';
import { RIBBON_COMMANDS, MOUSE_ONLY, UNIMPLEMENTED, UNIMPLEMENTED_BY_ID, RIBBON_LAYOUT, MENU_META, VIRTUAL_MENUS,
  runCommand, recordMouse, keyTipAt, itemTip, layoutItems, tableGaps, openMenuPath, closeDialog, MODAL_DIALOGS } from '../ui/ribbon-commands.js';

const CELLS = { A1: { value: 1234.567 }, A2: { value: 'x' }, B1: { value: 10 }, B2: { value: 20 }, B4: { formula: '=B1+B2' }, C1: { value: 3 }, C2: { value: 1 }, C3: { value: 2 } };
const fresh = () => new Session(new Sheet({ cells: JSON.parse(JSON.stringify(CELLS)) }), { now: () => 0 });
const state = s => JSON.stringify(s.sheet.toJSON());
/** The sheet after the keyboard chord vs after the mouse command, both from the same start. */
function sameAs(chord, id, setup) {
  const k = fresh(), m = fresh();
  if (setup) { setup(k); setup(m); }
  k.run(chord); runCommand(m, id);
  assert.equal(state(m), state(k), `${id} by mouse ≠ ${chord} by keyboard`);
  assert.equal(m.mode, k.mode, `${id} mode`); assert.equal(m.dialog, k.dialog, `${id} dialog`);
  if (!k.dialog) assert.equal(m.mode, 'normal', `${id} leaves the mouse session in normal mode`);
  return { k, m };
}

test('every Alt-walk command id has a table entry with a label, group, tab, icon and run', () => {
  assert.deepEqual(tableGaps(), { missing: [], badMenus: [] });
  for (const id of Object.keys(COMMANDS)) {
    const c = RIBBON_COMMANDS[id];
    assert.ok(c, id + ' missing');
    assert.equal(typeof c.label, 'string'); assert.ok(c.label.length, id + ' label');
    assert.equal(typeof c.group, 'string'); assert.ok(c.group.length, id + ' group');
    assert.ok(TABS.some(t => t.k === c.tab), id + ' tab ' + c.tab);
    assert.equal(typeof c.icon, 'string'); assert.ok(c.icon.length, id + ' icon');
    assert.equal(typeof c.run, 'function', id + ' run');
  }
  for (const id of Object.keys(RIBBON_COMMANDS)) assert.ok(COMMANDS[id] !== undefined || MOUSE_ONLY.includes(id), id + ' is neither an Alt path nor a declared mouse-only face');
});

test('direct commands: the mouse produces the keyboard walk\'s sheet state', () => {
  sameAs('Alt H 1', 'H1'); sameAs('Alt H 2', 'H2'); sameAs('Alt H 3', 'H3');
  sameAs('Alt H B O', 'HBO'); sameAs('Alt H B A', 'HBA'); sameAs('Alt H B T', 'HBT'); sameAs('Alt H B N', 'HBN', s => s.run('Alt H B A'));
  sameAs('Alt H K', 'HK'); sameAs('Alt H P', 'HP'); sameAs('Alt H 0', 'H0'); sameAs('Alt H 9', 'H9', s => s.run('Alt H K'));
  sameAs('Alt H A C', 'HAC'); sameAs('Alt H A R', 'HAR'); sameAs('Alt H A N', 'HAN'); sameAs('Alt H 6', 'H6'); sameAs('Alt H W', 'HW');
  sameAs('Alt H F G', 'HFG'); sameAs('Alt H F K', 'HFK');
  sameAs('Alt H I R', 'HIR'); sameAs('Alt H I C', 'HIC'); sameAs('Alt H D R', 'HDR'); sameAs('Alt H D C', 'HDC');
  sameAs('Alt H E F', 'HEF', s => s.run('Alt H 1')); sameAs('Alt H E C', 'HEC'); sameAs('Alt H E A', 'HEA');
  sameAs('Alt H O I', 'HOI'); sameAs('Alt H O A', 'HOA');
  sameAs('Alt H F I D', 'HFID', s => s.run('Shift+Down')); sameAs('Alt H F I R', 'HFIR', s => s.run('Shift+Right'));
  sameAs('Alt H V V', 'HVV', s => s.run('Ctrl+C Down Down'));
  sameAs('Alt A S A', 'ASA', s => s.run('Right Shift+Right Shift+Down Shift+Down'));   // a block: sorts by the anchor column, no warning
  sameAs('Alt A S D', 'ASD', s => s.run('Right Shift+Right Shift+Down Shift+Down'));
  const { m: warned } = sameAs('Alt A S A', 'ASA', s => s.run('Right Right Shift+Down Shift+Down')); assert.equal(warned.dialog, 'sortwarn');   // neighbours: the warning, both ways
  const { k, m } = sameAs('Alt W V G', 'WVG'); assert.equal(m.sheet.gridlines, false); assert.equal(k.sheet.gridlines, m.sheet.gridlines);
  const one = fresh(); runCommand(one, 'H1'); assert.equal(one.sheet.cellAt('A1').bold, true); runCommand(one, 'H1'); assert.equal(one.sheet.cellAt('A1').bold, false);
});

test('the mouse-only Clipboard faces mirror the chords', () => {
  sameAs('Ctrl+C', 'COPY'); sameAs('Ctrl+X', 'CUT');
  sameAs('Ctrl+V', 'PASTE', s => s.run('Ctrl+C Down Down'));
  const m = fresh(); runCommand(m, 'COPY'); assert.ok(m.sheet.clipboard); m.sheet.goTo(3, 1); runCommand(m, 'PASTE'); assert.equal(m.sheet.value('A3'), 1234.567);
});

test('dialog commands open the same dialog state the keyboard reaches, with an empty path so one Esc closes them', () => {
  let s = fresh(); runCommand(s, 'HOE'); assert.equal(s.mode, 'ribbon'); assert.equal(s.dialog, 'fmt'); assert.deepEqual(s.path, []);
  s.applyRibbon('N'); assert.equal(s.sheet.cellAt('A1').fmtStyle, 'comma'); assert.equal(s.mode, 'normal');
  const k = fresh(); k.run('Alt H O E N'); assert.equal(state(s), state(k));
  s = fresh(); runCommand(s, 'OE'); assert.equal(s.dialog, 'fmt'); s.run('Escape'); assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null);
  s = fresh(); s.run('Ctrl+C Down Down'); runCommand(s, 'HVS'); assert.equal(s.dialog, 'paste'); assert.equal(s.pasteKind, 'all'); assert.equal(s.pasteOp, 'none');
  s.applyRibbon('V'); s.applyRibbon('ENTER'); assert.equal(s.sheet.value('A3'), 1234.567); assert.equal(s.mode, 'normal');
  s = fresh(); runCommand(s, 'ES'); assert.equal(s.dialog, 'paste');
  s = fresh(); runCommand(s, 'HH'); assert.equal(s.dialog, 'fillcolor'); assert.equal(s.fillColorIdx, 0); s.fillColorIdx = 1; s.applyRibbon('ENTER'); assert.equal(s.sheet.cellAt('A1').fill, 'gray');
  const kf = fresh(); kf.run('Alt H H Right Enter'); assert.equal(state(s), state(kf));
  s = fresh(); runCommand(s, 'HFC'); assert.equal(s.dialog, 'fontcolor'); s.fontColorIdx = 4; s.applyRibbon('ENTER'); assert.equal(s.sheet.cellAt('A1').fontColor, 'blue');
  s = fresh(); runCommand(s, 'HJ'); assert.equal(s.dialog, 'cellstyle'); s.cellStyleIdx = 3; s.applyRibbon('ENTER'); assert.equal(s.sheet.cellAt('A1').fsz, 16);
  s = fresh(); runCommand(s, 'HOW'); assert.equal(s.dialog, 'colw'); assert.equal(s.colwBuf, ''); s.run('20 Enter'); assert.equal(s.sheet.colW[1], 145);
  s = fresh(); s.run('Shift+Down'); runCommand(s, 'HFIS'); assert.equal(s.dialog, 'series'); s.run('Enter'); assert.equal(s.mode, 'normal');
  // a sort whose column has neighbours asks first, as Alt A S A does
  s = fresh(); s.run('Right Shift+Down'); runCommand(s, 'ASA'); assert.equal(s.dialog, 'sortwarn'); assert.ok(s.sortPend); s.applyRibbon('E'); assert.equal(s.mode, 'normal');
  const ks = fresh(); ks.run('Right Shift+Down Alt A S A E'); assert.equal(state(s), state(ks));
  // Cancel by mouse is Esc without a key
  s = fresh(); runCommand(s, 'HOE'); closeDialog(s); assert.equal(s.dialog, null); assert.equal(s.mode, 'normal');
  assert.ok(MODAL_DIALOGS.has('fmt') && MODAL_DIALOGS.has('paste') && !MODAL_DIALOGS.has('fontcolor'));
});

test('AutoSum and the audit jumps go through the session, as the keyboard does', () => {
  let s = fresh(); s.sheet.goTo(3, 2); runCommand(s, 'HUS'); assert.equal(s.editing, true); assert.equal(s.editBuf, '=SUM(B1:B2'); assert.equal(s.mode, 'normal');
  const k = fresh(); k.sheet.goTo(3, 2); k.run('Alt H U S'); assert.equal(k.editBuf, s.editBuf);
  s.run('Enter'); assert.equal(s.sheet.value('B3'), 30);
  s = fresh(); s.sheet.goTo(3, 2); runCommand(s, 'MUS'); assert.equal(s.editBuf, '=SUM(B1:B2'); s.run('Escape');
  s = fresh(); s.sheet.goTo(4, 2); runCommand(s, 'MP'); assert.equal(s.sheet.selectionText(), 'B1');
  runCommand(s, 'MD'); assert.equal(s.sheet.selectionText(), 'B4');
});

test('a click while editing commits the entry first; a refused entry keeps the editor and drops the click', () => {
  const s = fresh(); s.sheet.goTo(5, 1); s.type('hello'); assert.equal(s.editing, true);
  assert.equal(runCommand(s, 'H1'), true); assert.equal(s.editing, false); assert.equal(s.sheet.value('A5'), 'hello'); assert.equal(s.sheet.cellAt('A5').bold, true);
  s.sheet.goTo(6, 1); s.type('=@@'); assert.equal(runCommand(s, 'H1'), false); assert.equal(s.editing, true); assert.equal(!!s.sheet.cellAt('A6').bold, false);
  s.run('Escape');
  s.sheet.goTo(7, 1); s.type('=1+'); assert.equal(runCommand(s, 'H1'), false); assert.equal(s.dialog, 'fxfix'); s.run('Enter'); assert.equal(s.sheet.formula('A7'), '=1');
});

test('a command clicked while KeyTips or a menu are up leaves the walk, and a menu opens by path', () => {
  const s = fresh(); s.run('Alt H B'); assert.deepEqual(s.path, ['H', 'B']);
  runCommand(s, 'HK'); assert.equal(s.mode, 'normal'); assert.deepEqual(s.path, []); assert.equal(s.sheet.text('A1'), '1,234.57');
  openMenuPath(s, 'HB'); assert.equal(s.mode, 'ribbon'); assert.deepEqual(s.path, ['H', 'B']); assert.equal(s.dialog, null);
  s.run('O'); assert.equal(s.sheet.cellAt('A1').bb, true); assert.equal(s.mode, 'normal');   // the keyboard finishes what the mouse opened
});

test('recordMouse counts and logs every workspace click and tells the host', () => {
  const seen = []; const s = new Session(new Sheet(), { onMouse: w => seen.push(w) });
  assert.equal(s.mouse, undefined);
  recordMouse(s, 'cell'); recordMouse(s, 'ribbon:H1'); recordMouse(s, 'dialog:fmt');
  assert.equal(s.mouse.count, 3); assert.deepEqual(s.mouse.log.map(x => x.what), ['cell', 'ribbon:H1', 'dialog:fmt']);
  assert.ok(s.mouse.log.every(x => typeof x.t === 'number')); assert.deepEqual(seen, ['cell', 'ribbon:H1', 'dialog:fmt']);
  const bare = new Session(new Sheet()); recordMouse(bare, 'header'); assert.equal(bare.mouse.count, 1);   // no host listener: still recorded
});

test('the disabled Excel commands are listed with labels and groups, and never collide with live ids', () => {
  assert.ok(UNIMPLEMENTED.length >= 40);
  const ids = new Set();
  for (const u of UNIMPLEMENTED) {
    assert.ok(u.id && u.label && u.group, JSON.stringify(u)); assert.ok(TABS.some(t => t.k === u.tab), u.id + ' tab');
    assert.ok(!ids.has(u.id), 'duplicate ' + u.id); ids.add(u.id);
    assert.equal(RIBBON_COMMANDS[u.id], undefined, u.id + ' is also live');
  }
  const homeGroups = new Set(UNIMPLEMENTED.filter(u => u.tab === 'H').map(u => u.group));
  for (const g of ['Clipboard', 'Font', 'Alignment', 'Number', 'Styles', 'Editing']) assert.ok(homeGroups.has(g), 'Home has a disabled ' + g + ' command');
});

test('the full-bar layout: every tab drawn, every item resolvable, every Home KeyTip reachable, badges Excel-true', () => {
  for (const t of TABS) assert.ok(Array.isArray(RIBBON_LAYOUT[t.k]) && RIBBON_LAYOUT[t.k].length, t.name + ' has groups');
  const homeNames = RIBBON_LAYOUT.H.map(g => g.name);
  assert.deepEqual(homeNames, ['Clipboard', 'Font', 'Alignment', 'Number', 'Styles', 'Cells', 'Editing']);
  for (const it of layoutItems()) {
    const kinds = ['cmd', 'menu', 'dead', 'box'].filter(k => it[k] !== undefined);
    assert.ok(kinds.length >= 1, JSON.stringify(it));
    if (it.cmd) assert.ok(RIBBON_COMMANDS[it.cmd], 'layout cmd ' + it.cmd);
    if (it.menu) assert.ok(MENUS[it.menu] || (MENU_META[it.menu] && MENU_META[it.menu].items), 'layout menu ' + it.menu);
    if (it.dead) assert.ok(UNIMPLEMENTED_BY_ID[it.dead], 'layout dead ' + it.dead);
  }
  for (const key of Object.keys(MENU_META)) if (MENU_META[key].items) for (const it of MENU_META[key].items) assert.ok(it.cmd ? RIBBON_COMMANDS[it.cmd] : UNIMPLEMENTED_BY_ID[it.dead]);
  // every Home-menu letter lands on a bar control (a button's tip or a dropdown's key), so Alt H never shows a letter with nowhere to go
  const homeTips = layoutItems('H').map(itemTip).filter(Boolean);
  for (const [k] of MENUS.H) {
    const np = 'H' + k;
    const onBar = homeTips.some(t => t === np || t.startsWith(np));
    assert.ok(onBar, 'Alt H ' + k + ' has no control on the Home bar');
  }
  for (const key of Object.keys(MENUS)) if (!VIRTUAL_MENUS.has(key) && !TABS.some(t => t.k === key) && key !== 'E' && key !== 'O') assert.ok(MENU_META[key], key + ' menu has a label');
  assert.equal(keyTipAt('H1', 'H'), '1'); assert.equal(keyTipAt('HFC', 'H'), 'FC'); assert.equal(keyTipAt('HFC', 'HF'), 'C');
  assert.equal(keyTipAt('HB', 'H'), 'B'); assert.equal(keyTipAt('HB', 'HB'), ''); assert.equal(keyTipAt('HBO', 'H1'), ''); assert.equal(keyTipAt('H1', ''), ''); assert.equal(keyTipAt('', 'H'), '');
  assert.equal(itemTip({ menu: 'HV', cmd: 'PASTE' }), 'HV'); assert.equal(itemTip({ cmd: 'H1' }), 'H1'); assert.equal(itemTip({ dead: 'Filter' }), '');
});
