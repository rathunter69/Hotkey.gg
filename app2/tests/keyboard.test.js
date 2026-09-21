import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session, parseKeySpec, parseKeyScript } from '../engine/keyboard.js';

const fresh = (cells) => { const log = []; const s = new Session(new Sheet(cells ? { cells } : undefined), { onKey: k => log.push(k), now: () => 0 }); s.log = log; return s; };

test('key specs and scripts parse', () => {
  assert.deepEqual(parseKeySpec('Ctrl+Shift+ArrowDown'), { key: 'ArrowDown', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, code: '' });
  assert.equal(parseKeySpec('Ctrl+Shift+1').key, '!'); assert.equal(parseKeySpec('Ctrl+B').key, 'b'); assert.equal(parseKeySpec('H').key, 'H'); assert.equal(parseKeySpec('H').code, 'KeyH');
  assert.equal(parseKeySpec('Ctrl++').key, '+'); assert.equal(parseKeySpec('Esc').key, 'Escape'); assert.equal(parseKeySpec('Space').key, ' ');
  assert.deepEqual(parseKeyScript('"a b" Enter Ctrl+B'), [{ type: 'text', text: 'a b' }, { type: 'press', spec: 'Enter' }, { type: 'press', spec: 'Ctrl+B' }]);
});

test('type-to-replace, Enter/Tab movement and the Tab-run home rule', () => {
  const s = fresh(); const S = s.sheet;
  s.run('"Weekly Sales Report" Enter'); assert.equal(S.value('A1'), 'Weekly Sales Report'); assert.equal(S.selectionText(), 'A2');
  s.run('"10" Tab "20" Tab "30" Enter'); assert.equal(S.value('A2'), 10); assert.equal(S.value('C2'), 30); assert.equal(S.selectionText(), 'A3');   // Enter after a Tab run returns home
  s.run('"x" Shift+Enter'); assert.equal(S.selectionText(), 'A2'); s.run('Shift+Tab'); assert.equal(S.selectionText(), 'A2');
  s.run('Ctrl+Home'); s.run('Escape'); assert.equal(s.editing, false);
});

test('formulas: typing, auto-close, point mode, F4, F2 edit mode, Ctrl+Enter', () => {
  const s = fresh({ A1: { value: 10 }, A2: { value: 20 }, A3: { value: 30 } }); const S = s.sheet;
  s.run('Down Down Down "=SUM(A1:A3" Enter'); assert.equal(S.formula('A4'), '=SUM(A1:A3)'); assert.equal(S.value('A4'), 60);
  s.run('Right Up Up "=" Left'); assert.equal(s.editBuf, '=A3'); assert.deepEqual(s.editPointer, { r: 3, c: 1 });
  s.run('Shift+Up'); assert.equal(s.editBuf, '=A3:A2'); s.run('F4'); assert.equal(s.editBuf, '=$A$3:$A$2'); s.run('F4'); assert.equal(s.editBuf, '=A$3:A$2');
  s.run('Backspace'); assert.equal(s.editBuf, '='); s.run('Left "*2" Enter'); assert.equal(S.formula('B3'), '=A3*2'); assert.equal(S.value('B3'), 60);
  s.run('Up F2'); assert.equal(s.editMode, 'edit'); assert.equal(s.editCaret, s.editBuf.length); s.run('Home'); assert.equal(s.editCaret, 1); s.run('End Left Left "+1" Enter'); assert.equal(S.formula('B3'), '=A3+1*2');
  s.run('Ctrl+Home Right Right Shift+Down Shift+Down "=A1*10" Ctrl+Enter'); assert.equal(S.formula('C3'), '=A3*10'); assert.equal(S.value('C3'), 300); assert.equal(S.selectionText(), 'C1:C3');
  s.run('Ctrl+Home "=1+" Enter'); assert.equal(s.dialog, 'fxfix'); s.run('Enter'); assert.equal(S.formula('A1'), '=1'); assert.equal(s.dialog, null);
  s.run('"=@@" Enter'); assert.equal(s.editing, true); assert.ok(s.log.includes('⚠')); s.run('Escape'); assert.equal(s.editing, false); assert.equal(S.formula('A1'), '=1');
  s.run('"=A2" F9'); assert.equal(s.editBuf, '20'); s.run('Escape');
});

test('selection chords and clipboard keys', () => {
  const s = fresh({ A1: { value: 1 }, A2: { value: 2 }, A3: { value: 3 }, B1: { value: 'x' } }); const S = s.sheet;
  s.run('Ctrl+Shift+Down'); assert.equal(S.selectionText(), 'A1:A3');
  s.run('Ctrl+C Right Right Ctrl+V'); assert.equal(S.value('C3'), 3); assert.equal(S.selectionText(), 'C1:C3'); assert.ok(S.clipboard);
  s.run('Escape'); assert.equal(S.clipboard, null);
  s.run('Ctrl+Home Ctrl+A'); assert.equal(S.selectionText(), 'A1:C3'); s.run('Ctrl+A'); assert.equal(S.selectionText(), 'A1:J20');
  s.run('Ctrl+Home Shift+Space'); assert.equal(S.selectionText(), 'A1:J1'); s.run('Ctrl+Space'); assert.equal(S.selectionText(), 'A1:J20');
  s.run('Ctrl+Home Down Ctrl+Space'); assert.equal(S.selectionText(), 'A1:A20');
  s.run('Ctrl+Home Ctrl+C Down Enter'); assert.equal(S.value('A2'), 1); assert.equal(S.clipboard, null); assert.equal(S.selectionText(), 'A2');
  s.run('Ctrl+Z'); assert.equal(S.value('A2'), 2); s.run('Ctrl+Y'); assert.equal(S.value('A2'), 1);
  s.run('Delete'); assert.equal(S.value('A2'), null); s.run('Backspace'); assert.equal(s.editing, true); s.run('Escape');
  s.run('Ctrl+Home Ctrl+End'); assert.equal(S.selectionText(), 'C3');
});

test('format chords', () => {
  const s = fresh({ A1: { value: 0.5 } }); const S = s.sheet;
  s.run('Ctrl+B Ctrl+I Ctrl+U Ctrl+5'); const c = S.cellAt('A1'); assert.deepEqual([c.bold, c.it, c.uline, c.strike], [true, true, true, true]);
  s.run('Ctrl+Shift+5'); assert.equal(S.text('A1'), '50%'); s.run('Ctrl+Shift+4'); assert.equal(S.text('A1'), '$0.50'); s.run('Ctrl+Shift+1'); assert.equal(S.text('A1'), '0.50'); s.run('Ctrl+Shift+`'); assert.equal(S.text('A1'), '0.5');
  s.run('Ctrl+1'); assert.equal(s.dialog, 'fmt'); s.run('P'); assert.equal(S.text('A1'), '50.0%'); assert.equal(s.mode, 'normal');
  s.run('Ctrl+1 Escape'); assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null);
  s.run('Ctrl+;'); assert.equal(S.cellAt('A1').fmtStyle, 'date');
});

test('the Alt ribbon walk: tabs, menus, commands, dialogs, Escape one level at a time', () => {
  const s = fresh({ A1: { value: 1234.567 }, A2: { value: 'x' } }); const S = s.sheet;
  s.run('Alt'); assert.equal(s.mode, 'ribbon'); assert.deepEqual(s.path, []);
  s.run('H'); assert.deepEqual(s.path, ['H']); s.run('B'); assert.deepEqual(s.path, ['H', 'B']); s.run('Escape'); assert.deepEqual(s.path, ['H']); s.run('Escape'); assert.deepEqual(s.path, []); assert.equal(s.mode, 'ribbon'); s.run('Escape'); assert.equal(s.mode, 'normal');
  s.run('Alt H B O'); assert.equal(S.cellAt('A1').bb, true); assert.equal(s.mode, 'normal');
  s.run('Alt H K'); assert.equal(S.text('A1'), '1,234.57'); s.run('Alt H 9'); assert.equal(S.text('A1'), '1,234.6'); s.run('Alt H 0 Alt H 0'); assert.equal(S.text('A1'), '1,234.567');
  s.run('Alt H P'); assert.equal(S.text('A1'), '123457%'); s.run('Alt H A C'); assert.equal(S.cellAt('A1').align, 'c'); s.run('Alt H 1'); assert.equal(S.cellAt('A1').bold, true);
  s.run('Alt H H'); assert.equal(s.dialog, 'fillcolor'); s.run('Right Enter'); assert.equal(S.cellAt('A1').fill, 'gray'); assert.equal(s.mode, 'normal');
  s.run('Alt H F C Right Right Right Right Enter'); assert.equal(S.cellAt('A1').fontColor, 'blue');
  s.run('Alt H J Right Right Right Enter'); assert.equal(S.cellAt('A1').fsz, 16);
  s.run('Alt H O W "20" Enter'); assert.equal(S.colW[1], 145); s.run('Alt H O W 12 Enter'); assert.equal(S.colW[1], 89);
  s.run('Alt H O E N'); assert.equal(S.cellAt('A1').fmtStyle, 'comma'); assert.equal(S.cellAt('A1').decimals, 0);
  s.run('Alt H E F'); assert.equal(S.cellAt('A1').bold, false); assert.equal(S.value('A1'), 1234.567);
  s.run('Alt Q'); assert.equal(s.mode, 'ribbon'); s.run('Z'); assert.equal(s.mode, 'ribbon'); assert.deepEqual(s.path, []); s.run('Escape');
  s.run('Alt N'); assert.match(s.note, /Insert/); s.run('Escape');
  s.run('Alt W V G'); assert.equal(S.gridlines, false); s.run('Alt W G'); assert.equal(S.gridlines, true);
  s.run('Down Alt H I R'); assert.equal(S.value('A3'), 'x'); assert.equal(S.value('A2'), null);
  s.run('Alt H D R'); assert.equal(S.value('A2'), 'x');
  s.run('Ctrl+Home Alt H V S'); assert.equal(s.dialog, 'paste'); s.run('Escape'); assert.equal(s.dialog, null); assert.deepEqual(s.path, ['H', 'V']); s.run('Escape Escape Escape'); assert.equal(s.mode, 'normal');
  s.run('Ctrl+1 Escape'); assert.equal(s.mode, 'normal');   // a dialog opened by a chord closes straight back to the grid
});

test('Alt+= autosum proposes with the range live and commits in place', () => {
  const s = fresh({ A1: { value: 1 }, A2: { value: 2 } }); const S = s.sheet;
  s.run('Down Down Alt ='); assert.equal(s.editing, true); assert.equal(s.editBuf, '=SUM(A1:A2'); assert.equal(s.mode, 'normal');
  s.run('Enter'); assert.equal(S.formula('A3'), '=SUM(A1:A2)'); assert.equal(S.value('A3'), 3); assert.equal(S.selectionText(), 'A3');
  s.run('Ctrl+Shift+Up Alt H U S'); assert.equal(s.editing, true); assert.equal(s.editBuf, '=SUM(A1:A2'); s.run('Escape');
});

test('structure chords need whole rows or columns', () => {
  const s = fresh({ A1: { value: 1 }, A2: { value: 2 } }); const S = s.sheet;
  s.run('Ctrl+Shift+='); assert.equal(S.value('A1'), 1);                       // single cell: no-op
  s.run('Shift+Space Ctrl+Shift+='); assert.equal(S.value('A1'), null); assert.equal(S.value('A2'), 1);
  s.run('Ctrl+-'); assert.equal(S.value('A1'), 1);
});

test('the key log uses the keycap vocabulary', () => {
  const s = fresh();
  s.run('"a" Enter Down Ctrl+Shift+Right Alt H B O Ctrl+B');
  assert.deepEqual(s.log, ['a', '↓', 'Ctrl+Shift+→', 'Alt', 'H', 'B', 'O', 'Ctrl+B']);
});
