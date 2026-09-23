import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session, parseKeySpec, parseKeyScript } from '../engine/keyboard.js';

const fresh = (cells, sheetOpts) => { const log = []; const s = new Session(new Sheet({ ...(cells ? { cells } : {}), ...(sheetOpts || {}) }), { onKey: k => log.push(k), now: () => 0 }); s.log = log; return s; };
const SMALL = { rows: 20, cols: 10 };   // the tests below name the far edge (J20, K) — the size is explicit, whatever the Sheet default is

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
  const s = fresh({ A1: { value: 1 }, A2: { value: 2 }, A3: { value: 3 }, B1: { value: 'x' } }, SMALL); const S = s.sheet;
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
  s.run('Down Alt H U S'); assert.equal(s.editing, true); assert.equal(s.editBuf, '=SUM(A1:A3'); s.run('Escape');   // the ribbon route proposes too (no selection: the column above)
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
  assert.deepEqual(s.log, ['a', '↵', '↓', 'Ctrl+Shift+→', 'Alt', 'H', 'B', 'O', 'Ctrl+B']);   // ↵ that commits an edit is logged (#36)
});

/* ---------------- regressions from the keyboard review (one per finding) ---------------- */

test('#8 #9 #57: edits, stamps and jumps act on the displayed active cell, never the moving corner', () => {
  let s = fresh({ A1: { value: 'keep-me' }, A2: { value: 'below' } }); let S = s.sheet;
  s.run('Shift+Down Backspace'); assert.deepEqual(s.editAnchor, { r: 1, c: 1 }); assert.equal(S.value('A1'), 'keep-me');   // opened on A1; nothing written yet
  s.run('Enter'); assert.equal(S.value('A1'), null); assert.equal(S.value('A2'), 'below'); assert.equal(S.selectionText(), 'A2');
  s = fresh({ B2: { value: 5 }, C2: { value: 6 } }); S = s.sheet;
  s.run('Right Down Shift+Right Backspace Escape'); assert.equal(S.value('B2'), 5); assert.equal(S.value('C2'), 6);
  s.run('Backspace Enter'); assert.equal(S.value('B2'), null); assert.equal(S.value('C2'), 6);
  const cells = { A1: { value: 'Day' }, B1: { value: 'Sales' }, C1: { value: 'Units' }, A2: { value: 'Mon' }, B2: { value: 10 }, C2: { value: 1 }, A3: { value: 'Tue' }, B3: { value: 20 }, C3: { value: 2 } };
  s = fresh(cells, { active: { r: 3, c: 2 }, ...SMALL }); S = s.sheet;
  s.run('Shift+Space "x" Enter'); assert.equal(S.value('B3'), 'x'); assert.equal(S.value('J3'), null); assert.equal(S.selectionText(), 'B4');
  s = fresh(cells, { active: { r: 2, c: 3 }, ...SMALL }); S = s.sheet;
  s.run('Ctrl+Space "=B2*2" Ctrl+Enter'); assert.equal(S.formula('C2'), '=B2*2'); assert.equal(S.value('C2'), 20); assert.equal(S.formula('C1'), '=B1*2'); assert.equal(S.formula('C20'), '=B20*2'); assert.equal(S.selectionText(), 'C1:C20');
  s = fresh(cells, { active: { r: 2, c: 2 }, ...SMALL }); S = s.sheet;
  s.run('Ctrl+A F2'); assert.equal(s.editBuf, '10'); assert.deepEqual(s.editAnchor, { r: 2, c: 2 }); s.run('Escape');
  s.run('Ctrl+Shift+Space "y" Enter'); assert.equal(S.value('B2'), 'y'); assert.equal(S.value('C3'), 2);
  s = fresh(undefined, { today: () => 46000, ...SMALL }); S = s.sheet;
  s.run('Shift+Down Shift+Down Ctrl+;'); assert.equal(S.value('A1'), 46000); assert.equal(S.cellAt('A1').fmtStyle, 'date'); assert.equal(S.value('A3'), null);
  s.run('Right Right Down Shift+Space Ctrl+;'); assert.equal(S.value('C2'), 46000); assert.equal(S.value('J2'), null);
  s = fresh({ A1: { formula: '=C1' }, A3: { formula: '=D3' }, E1: { formula: '=A1' }, F3: { formula: '=A3' } }); S = s.sheet;
  s.run('Shift+Down Shift+Down Ctrl+['); assert.equal(S.selectionText(), 'C1');
  s.run('Ctrl+Home Shift+Down Shift+Down Ctrl+]'); assert.equal(S.selectionText(), 'E1');
});

test('#10: Backspace opens an empty edit — Esc restores, ↵ clears with one undo step, a blank cell stays a pure move', () => {
  const s = fresh({ A1: { value: 'hello' } }); const S = s.sheet;
  s.run('Backspace'); assert.equal(s.editing, true); assert.equal(s.editBuf, ''); assert.equal(s.editMode, 'enter'); assert.equal(S.value('A1'), 'hello'); assert.equal(S.undoStack.length, 0);
  s.run('Escape'); assert.equal(s.editing, false); assert.equal(S.value('A1'), 'hello'); assert.equal(S.undoStack.length, 0);
  s.run('Backspace Enter'); assert.equal(S.value('A1'), null); assert.equal(S.undoStack.length, 1); assert.equal(S.selectionText(), 'A2');
  s.run('Ctrl+Z'); assert.equal(S.value('A1'), 'hello');
  s.run('Ctrl+Home Backspace "new" Enter'); assert.equal(S.value('A1'), 'new'); assert.equal(S.undoStack.length, 1); s.run('Ctrl+Z'); assert.equal(S.value('A1'), 'hello');
  s.run('Ctrl+Home "x" Backspace Enter'); assert.equal(S.value('A1'), null);                                   // "x" ⌫ ↵ clears too
  s.run('Ctrl+Z Ctrl+Home F2 Backspace Backspace Backspace Backspace Backspace Enter'); assert.equal(S.value('A1'), null);   // F2 ⌫×5 ↵ clears
  const n = S.undoStack.length; s.run('Down Backspace Enter'); assert.equal(S.undoStack.length, n); assert.equal(S.selectionText(), 'A4');   // A3 was blank
  s.run('Ctrl+Home Ctrl+Z Shift+Down Backspace Ctrl+Enter'); assert.equal(S.value('A1'), null);                 // an empty Ctrl+↵ clears the range
});

test('#31: Ctrl+Arrow and Ctrl+Shift+Arrow jump to the block edge while pointing', () => {
  const cells = {}; for (let r = 1; r <= 5; r++) cells['A' + r] = { value: r };
  const s = fresh(cells, { active: { r: 7, c: 1 } });
  s.run('"=SUM(" Ctrl+Up'); assert.equal(s.editBuf, '=SUM(A5');
  s.run('Ctrl+Shift+Up'); assert.equal(s.editBuf, '=SUM(A5:A1'); assert.deepEqual(s.log.slice(-2), ['Ctrl+↑', 'Ctrl+⇧+↑']);
  s.run('Ctrl+Down'); assert.equal(s.editBuf, '=SUM(A5'); s.run('Up'); assert.equal(s.editBuf, '=SUM(A4');   // a plain arrow still steps one
  s.run('Escape "=" Up Ctrl+Up'); assert.equal(s.editBuf, '=A5');   // re-pointing a bare ref jumps too
});

test('#32: Ctrl+Enter on a single cell commits in place', () => {
  const s = fresh(); const S = s.sheet;
  s.run('"5" Ctrl+Enter'); assert.equal(S.value('A1'), 5); assert.equal(S.selectionText(), 'A1'); assert.equal(s.log.at(-1), 'Ctrl+↵');
  s.run('"a" Tab "b" Ctrl+Enter'); assert.equal(S.value('B1'), 'b'); assert.equal(S.selectionText(), 'B1');   // not the Tab-run home either
  s.run('"=1+2" Ctrl+Enter'); assert.equal(S.value('B1'), 3); assert.equal(S.selectionText(), 'B1');
  s.run('Ctrl+Enter'); assert.equal(s.editing, false); assert.equal(S.selectionText(), 'B1');   // not editing: no-op
});

test('#33: Delete while typing is a forward-delete in both modes — never a cell wipe', () => {
  const s = fresh({ B4: { value: 950 } }, { active: { r: 4, c: 2 } }); const S = s.sheet;
  s.run('"19" Delete'); assert.equal(s.editing, true); assert.equal(s.editBuf, '19'); assert.equal(S.value('B4'), 950);
  s.run('Enter'); assert.equal(S.value('B4'), 19);
  s.run('Up F2 F2 Delete'); assert.equal(s.editing, true); assert.equal(s.editMode, 'enter'); assert.equal(s.editBuf, '19'); assert.equal(S.value('B4'), 19);
  s.run('Home Delete'); assert.equal(s.editBuf, '9'); assert.equal(s.log.at(-1), 'Delete'); s.run('Enter'); assert.equal(S.value('B4'), 9);
  s.run('Up F2 Home Delete Enter'); assert.equal(S.value('B4'), null);   // deleting the only character then ↵ clears (like Excel)
});

test('#34: Ctrl+Alt+V opens Paste Special with no KeyTip path, so one Escape returns to the grid', () => {
  const s = fresh({ A1: { value: 1 } }); const S = s.sheet;
  s.run('Ctrl+C Down Ctrl+Alt+V'); assert.equal(s.dialog, 'paste'); assert.deepEqual(s.path, []);
  s.run('Escape'); assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null);
  s.run('"5" Enter'); assert.equal(S.value('A2'), 5); assert.equal(S.selectionText(), 'A3');
  s.run('Ctrl+Home Ctrl+C Down Down Ctrl+Alt+V V Enter'); assert.equal(S.value('A3'), 1); assert.equal(s.mode, 'normal');
});

test('#35: Alt+Enter while editing never commits', () => {
  const s = fresh(); const S = s.sheet;
  s.run('"line one" Alt+Enter'); assert.equal(s.editing, true); assert.equal(s.editBuf, 'line one'); assert.equal(S.value('A1'), null); assert.equal(S.selectionText(), 'A1');
  s.run('F2 Alt+Enter'); assert.equal(s.editing, true);
  s.run('Enter'); assert.equal(S.value('A1'), 'line one'); assert.equal(S.selectionText(), 'A2');
});

test('#36: commit keys pressed while editing are logged, on the edited cell, before the commit', () => {
  const s = fresh();
  s.run('"a" Tab "b" Shift+Tab "c" Enter "d" Shift+Enter');
  assert.deepEqual(s.log, ['a', 'Tab', 'b', 'Shift+Tab', 'c', '↵', 'd', 'Shift+↵']);
  assert.deepEqual(s.keyLog.filter(e => /Tab|↵/.test(e.k)).map(e => e.cell), ['A1', 'B1', 'A1', 'A2']);
  s.run('"=@@" Enter'); assert.deepEqual(s.log.slice(-2), ['↵', '⚠']);   // a refused ↵ was still pressed
});

test('#56: point mode and F4 leave LOG10-style names and out-of-sheet refs alone', () => {
  const cases = [['"=LOG10" Down', '=LOG10C6'], ['"=DAYS360" Down', '=DAYS360C6'], ['"=ATAN2" Down', '=ATAN2C6'], ['"=ZZ5" Down', '=ZZ5C6'], ['"=K5" Down', '=K5C6'],
    ['"=SUM(A1:A3)+LOG10" Down', '=SUM(A1:A3)+LOG10C6'], ['"=LOG10(" Down', '=LOG10(C6'], ['"=1+A1" Down', '=1+A2'],
    ['"=LOG10" F4', '=LOG10'], ['"=DAYS360" F4', '=DAYS360'], ['"=ATAN2" F4', '=ATAN2'], ['"=K5" F4', '=K5'], ['"=B2" F4', '=$B$2'], ['"=A1:B2" F4', '=$A$1:$B$2']];
  for (const [script, buf] of cases) {
    const s = fresh(undefined, { active: { r: 5, c: 3 }, ...SMALL });   // ten columns: K5 and ZZ5 lie outside the sheet
    s.run(script); assert.equal(s.editBuf, buf, script);
    assert.equal(s.log.includes('F4'), /F4/.test(script) && buf.includes('$'), script + ' logs F4 only when it changed a ref');
  }
});

test('#58: accepting an autocorrect proposal keeps the Tab-run behaviour', () => {
  let s = fresh(); let S = s.sheet;
  s.run('"a" Tab "b" Tab "=1+" Enter'); assert.equal(s.dialog, 'fxfix'); s.run('Enter'); assert.equal(S.formula('C1'), '=1'); assert.equal(S.selectionText(), 'A2');
  s = fresh(); S = s.sheet;
  s.run('"a" Tab "=1+" Tab Enter "c" Enter'); assert.equal(S.value('C1'), 'c'); assert.equal(S.selectionText(), 'A2');
  s = fresh(); S = s.sheet;
  s.run('"=1+" Shift+Enter'); assert.equal(s.dialog, 'fxfix'); s.run('Escape'); assert.equal(s.editing, true); assert.equal(s.editBuf, '=1+');   // reject: editor stays
  s.run('Escape Down "=1+" Shift+Enter Enter'); assert.equal(S.formula('A2'), '=1'); assert.equal(S.selectionText(), 'A1');   // the accepted key still moves up
});

test('#59: F2 while pointing ends point mode', () => {
  const s = fresh({ A2: { value: 7 } });
  s.run('"=" Down'); assert.deepEqual(s.editPointer, { r: 2, c: 1 });
  s.run('F2'); assert.equal(s.editPointer, null); assert.equal(s.editMode, 'edit');
  s.run('Left Backspace'); assert.equal(s.editBuf, '=2'); assert.equal(s.editCaret, 1);
});

test('#60: a refused commit leaves the buffer exactly as typed', () => {
  const s = fresh(undefined, { active: { r: 2, c: 2 } }); const S = s.sheet;
  s.run('"=(1+" Enter'); assert.equal(s.editing, true); assert.equal(s.editBuf, '=(1+'); assert.equal(s.editCaret, 4); assert.equal(s.log.at(-1), '⚠');
  s.run('Up Enter'); assert.equal(S.formula('B2'), '=(1+B1)'); assert.equal(S.value('B2'), 1);          // pointing after a refusal works
  s.run('"=(1+" Ctrl+Enter'); assert.equal(s.editBuf, '=(1+'); assert.equal(s.editCaret, 4);
  s.run('"2)" Enter'); assert.equal(S.formula('B3'), '=(1+2)'); assert.equal(S.value('B3'), 3);         // closing it yourself is not a double paren
  s.run('"=SUM(1,2" Enter'); assert.equal(S.formula('B4'), '=SUM(1,2)');                                 // a valid entry still auto-closes
});

test('#61: Home and End move the insertion point in Enter mode too', () => {
  const s = fresh(); const S = s.sheet;
  s.run('"abc" Home "X"'); assert.equal(s.editBuf, 'Xabc'); assert.equal(s.editCaret, 1); assert.equal(s.editMode, 'enter');
  s.run('End "Y"'); assert.equal(s.editBuf, 'XabcY'); s.run('Right'); assert.equal(S.value('A1'), 'XabcY'); assert.equal(S.selectionText(), 'B1');   // still Enter mode: an arrow commits
  s.run('"=1+2" Home "5" Enter'); assert.equal(S.formula('B1'), '=51+2');
  s.run('"=" Down Home'); assert.equal(s.editPointer, null); s.run('Escape');   // Home leaves point mode
});

test('#62: Ctrl+* from the keypad selects the current region', () => {
  const s = fresh({ A1: { value: 1 }, B1: { value: 2 }, A2: { value: 3 }, B2: { value: 4 } }); const S = s.sheet;
  assert.equal(s.key({ key: '*', ctrlKey: true, code: 'NumpadMultiply' }), true); assert.equal(S.selectionText(), 'A1:B2'); assert.equal(s.log.at(-1), 'Ctrl+Shift+8');
  s.run('Ctrl+Home'); s.key({ key: '*', ctrlKey: true, shiftKey: true }); assert.equal(S.selectionText(), 'A1:B2');
  s.run('Ctrl+Home Ctrl+Shift+8'); assert.equal(S.selectionText(), 'A1:B2');
  s.run('Ctrl+Home'); s.key({ key: '8', ctrlKey: true }); assert.equal(S.selectionText(), 'A1');   // Ctrl+8 alone is not the chord
});

test('#63: parseKeyScript fails loudly on unknown tokens and expands a held Alt chord', () => {
  for (const tok of ['Sales', '10%', '1,000', '-5', 'Ctrl+Foo', 'Hyper+A']) assert.throws(() => parseKeyScript(tok + ' Enter'), new RegExp('unknown key "' + tok.replace(/[+]/g, '\\+') + '"'), tok);
  assert.deepEqual(parseKeyScript('20 2.5 F2 Ctrl++ Alt+H 1'), [{ type: 'text', text: '20' }, { type: 'text', text: '2.5' }, { type: 'press', spec: 'F2' }, { type: 'press', spec: 'Ctrl++' }, { type: 'press', spec: 'Alt' }, { type: 'press', spec: 'H' }, { type: 'press', spec: '1' }]);
  assert.deepEqual(parseKeyScript('Alt+= Ctrl+Alt+V Alt+Enter'), [{ type: 'press', spec: 'Alt+=' }, { type: 'press', spec: 'Ctrl+Alt+V' }, { type: 'press', spec: 'Alt+Enter' }]);   // real chords stay chords
  const s = fresh({ A1: { value: 1 } }); const S = s.sheet;
  s.run('Alt+H 1'); assert.equal(S.cellAt('A1').bold, true); assert.equal(s.mode, 'normal'); assert.equal(s.editing, false);
  s.run('Alt+h b o'); assert.equal(S.cellAt('A1').bb, true);
});

test('#64: an event without a key string is ignored in every mode', () => {
  const s = fresh();
  const snap = () => JSON.stringify([s.mode, s.editing, s.editBuf, s.editCaret, s.path, s.dialog, s.keyLog.length, s.sheet.active]);
  for (const prep of ['', '"ab"', 'Escape Alt H']) {
    s.run(prep);
    for (const ev of [{}, { ctrlKey: true }, { key: null }, { code: 'KeyA' }, undefined]) { const before = snap(); assert.equal(s.key(ev), false, JSON.stringify(ev)); assert.equal(snap(), before, JSON.stringify(ev)); }
  }
  s.run('Escape Escape'); assert.equal(s.mode, 'normal');
});

/* ---------------- C2 gaps 5 and 6: show formulas, Page Setup titles / footer / print gridlines; Esc logged ---------------- */

test('Ctrl+` toggles show formulas, as does Formulas › Show Formulas (Alt M H); the setting is a session flag the view reads', () => {
  const s = fresh({ A1: { value: 2 }, A2: { formula: '=A1*3' } });
  assert.equal(s.settings.showFormulas, false);
  s.run('Ctrl+`'); assert.equal(s.settings.showFormulas, true); assert.equal(s.log.at(-1), 'Ctrl+`');
  s.run('Ctrl+`'); assert.equal(s.settings.showFormulas, false);
  s.run('Alt M H'); assert.equal(s.settings.showFormulas, true); assert.equal(s.mode, 'normal');
  assert.equal(s.sheet.value('A2'), 6, 'values keep computing underneath');
  s.run('Ctrl+Shift+`'); assert.equal(s.settings.showFormulas, true, 'Ctrl+Shift+` is still the General format, not the toggle');
});

test('Page Setup (Alt P S P): rows to repeat, the footer sections and print gridlines are typed fields; Alt+letter reaches any control; OK records them', () => {
  const s = fresh();
  s.run('Alt P S P'); assert.equal(s.dialog, 'pagesetup'); assert.equal(s.dlg.tab, 'page');
  s.run('L F'); assert.equal(s.dlg.orientation, 'landscape'); assert.equal(s.dlg.scaling, 'fit');
  s.run('Alt+R'); assert.equal(s.dlg.tab, 'sheet'); assert.equal(s.dlg.focus, 'titlesRows');
  s.run('"$1:$3"'); assert.equal(s.dlg.titlesRows, '$1:$3', 'a text field takes what is typed');
  s.run('Alt+H'); assert.equal(s.dlg.tab, 'hf'); assert.equal(s.dlg.focus, 'footL');
  s.run('"&[file]" Tab "Voltline" Tab "&[Date]"'); assert.equal(s.dlg.footL, '&[file]'); assert.equal(s.dlg.footC, 'Voltline'); assert.equal(s.dlg.footR, '&[Date]');
  s.run('Alt+G'); assert.equal(s.dlg.tab, 'sheet'); assert.equal(s.dlg.printGridlines, true);
  s.run('Alt+G'); assert.equal(s.dlg.printGridlines, false);
  s.run('Enter'); assert.equal(s.mode, 'normal'); assert.equal(s.dialog, null);
  const p = s.settings.pageSetup;
  assert.equal(p.orientation, 'landscape'); assert.equal(p.scaling, 'fit');
  assert.equal(p.titlesRows, '1:3', 'stored as Excel does'); assert.deepEqual(p.footer, { left: '&[File]', centre: 'Voltline', right: '&[Date]' }); assert.equal(p.printGridlines, false);
  assert.ok(s.log.includes('Alt+R') && s.log.includes('Alt+H'), 'the accelerators are logged as chords');
  // Print Titles (Alt P I) opens the Sheet page directly; Esc cancels the draft
  s.run('Alt P I'); assert.equal(s.dialog, 'pagesetup'); assert.equal(s.dlg.tab, 'sheet'); assert.equal(s.dlg.titlesRows, '1:3');
  s.run('Backspace Backspace Backspace "9" Escape'); assert.equal(s.settings.pageSetup.titlesRows, '1:3', 'Cancel discards the draft');
  s.run('Escape Escape'); assert.equal(s.mode, 'normal');   // Cancel returns to the Page Layout tab it was opened from; Esc backs out of the walk
  // the bare letter only acts when no text field has the focus: on the Page page L is Landscape, in a footer field it types
  s.run('Alt P S P T'); assert.equal(s.dlg.orientation, 'portrait'); s.run('L'); assert.equal(s.dlg.orientation, 'landscape');
  s.run('Alt+H "L"'); assert.equal(s.dlg.footL, '&[File]L'); s.run('Escape Escape Escape Escape'); assert.equal(s.mode, 'normal');
  // an invalid rows-to-repeat clears the titles
  s.run('Alt P I Backspace Backspace Backspace "x" Enter'); assert.equal(s.settings.pageSetup.titlesRows, ''); assert.equal(s.mode, 'normal');
});

test('Esc that discards an entry in progress is logged, on the edited cell', () => {
  const s = fresh({ B2: { value: 'keep' } }); const S = s.sheet;
  s.run('Right Down "typo" Escape');
  assert.equal(S.value('B2'), 'keep'); assert.equal(s.editing, false);
  assert.equal(s.log.at(-1), 'Esc'); assert.equal(s.keyLog.at(-1).cell, 'B2');
  s.run('Escape'); assert.equal(s.log.at(-1), 'Esc', 'a bare Esc with nothing to cancel is not logged');
  assert.equal(s.keyLog.filter(e => e.k === 'Esc').length, 1);
});

test('Fill Series continues the weekday and month lists from one cell; numbers still step; a range AutoFit fits the selected cells only', () => {
  const s = fresh({ B14: { value: 'Mon' }, B16: { value: 'JAN' }, A1: { value: 'A very long title sits in the first row of the report' }, A5: { value: 'South Lamar' }, A6: { value: 'Airport' } });
  const S = s.sheet;
  S.select('B14:G14'); s.run('Alt H F I S Enter');
  assert.deepEqual(['B14', 'C14', 'D14', 'E14', 'F14', 'G14'].map(r => S.value(r)), ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  assert.equal(S.cellAt('D14').txt, true);
  S.select('B16:E16'); S.fillSeries(); assert.deepEqual(['C16', 'D16', 'E16'].map(r => S.value(r)), ['FEB', 'MAR', 'APR'], 'the list keeps the cell’s case');
  S.setCell('B18', { value: 'Fri' }); S.select('B18:E18'); S.fillSeries(); assert.deepEqual(['C18', 'D18', 'E18'].map(r => S.value(r)), ['Sat', 'Sun', 'Mon'], 'the list wraps');
  S.setCell('B20', { value: 'hello' }); S.select('B20:D20'); assert.equal(S.fillSeries(), false, 'plain text is not a series');
  S.select('A5:A6'); S.autofitCols();
  assert.equal(S.colW[1], S.neededWidth(1, 5, 6), 'fit to the site names, not the title');
  assert.ok(S.colW[1] < S.neededWidth(1));
  S.select('A1:A100'); S.autofitCols(); assert.equal(S.colW[1], S.neededWidth(1), 'whole column: the title counts');
});
