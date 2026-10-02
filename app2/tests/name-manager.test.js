// app2/tests/name-manager.test.js — the Name Manager (Ctrl+F3, Alt M N) and Paste Name (F3) as
// Excel has them (4.6.2): the list, Delete with its question, Edit renaming a name (the formulas,
// rules and list sources that read it follow) and re-pointing it, and Paste List writing the names
// and what they refer to as text from the active cell down.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { renameInFormula } from '../engine/tools.js';
import { toolCard } from '../ui/tool-cards.js';

function book() {
  const s = new Session(new Sheet({ cells: { B4: { value: 1.5 }, B5: { value: 14 }, B6: { value: 'x' }, C4: { formula: '=B5-CostPerWash' }, C5: { formula: '="CostPerWash"&CostPerWash' } } }), { now: () => 0 });
  s.addSheet('Lists'); s.sheets[1].sheet.setCell('A1', { value: 'Base' }); s.sheets[1].sheet.setCell('A2', { value: 'Downside' });
  s.switchSheet(0);
  s.names = { CostPerWash: 'Sheet1!$B$4', Ticket: 'Sheet1!$B$5', Stray: 'Sheet1!$B$6', Cases: 'Lists!$A$1:$A$2' };
  s.sheet.validation = { D1: { allow: 'list', source: '=Cases' } };
  return s;
}

test('renameInFormula rewrites the name tokens only (not text in quotes, not other names)', () => {
  assert.equal(renameInFormula('=B5-costperwash*CostPerWashes+"CostPerWash"', 'CostPerWash', 'Cost_Per_Wash'), '=B5-Cost_Per_Wash*CostPerWashes+"CostPerWash"');
  assert.equal(renameInFormula('=SUM(A1:A3)', 'A', 'B'), '=SUM(A1:A3)');
});

test('Ctrl+F3 lists the names; Alt+D asks, Enter deletes; Esc on the question keeps the name', () => {
  const s = book();
  s.run('Ctrl+F3'); assert.equal(s.dialog, 'namemgr');
  assert.deepEqual(s.nameManagerRows().map(r => r.name), ['Cases', 'CostPerWash', 'Stray', 'Ticket']);
  assert.equal(s.nameManagerRows()[1].value, '1.5'); assert.equal(s.nameManagerRows()[1].scope, 'Workbook');
  assert.match(toolCard(s).body, /CostPerWash/);
  s.run('Down Down Alt+D'); assert.equal(s.dlg.confirm, true); assert.match(toolCard(s).body, /delete the name Stray/);
  s.run('Escape'); assert.equal(s.dialog, 'namemgr'); assert.ok('Stray' in s.names, 'Cancel keeps it');
  s.run('Alt+D Enter'); assert.equal(s.dialog, 'namemgr'); assert.deepEqual(Object.keys(s.names), ['Cases', 'CostPerWash', 'Ticket']);
  s.run('Escape'); assert.equal(s.dialog, null);
});

test('Edit renames a name and every formula and list source that reads it follows; it re-points one too', () => {
  const s = book(); const S = s.sheet;
  s.run('Ctrl+F3 Down Alt+E'); assert.equal(s.dlg.edit.name, 'CostPerWash'); assert.equal(s.dlg.edit.refersTo, '=Sheet1!$B$4');
  s.run('"Cost_Per_Wash" Enter'); assert.equal(s.dlg.edit, null);
  assert.deepEqual(s.names, { Cases: 'Lists!$A$1:$A$2', Cost_Per_Wash: 'Sheet1!$B$4', Stray: 'Sheet1!$B$6', Ticket: 'Sheet1!$B$5' });
  assert.equal(S.cellAt('C4').formula, '=B5-Cost_Per_Wash'); assert.equal(S.value('C4'), 12.5);
  assert.equal(S.cellAt('C5').formula, '="CostPerWash"&Cost_Per_Wash', 'the text in quotes stays');
  // a bad name and a taken one are refused with Excel's messages
  s.run('Alt+E "1x" Enter'); assert.equal(s.note, 'The name that you entered is not valid.'); s.run('Escape');
  s.run('Alt+E "Ticket" Enter'); assert.equal(s.note, 'The name that you entered already exists. Enter a unique name.'); s.run('Escape');
  // re-point Stray at the ticket (Alt+R, the field opens selected so typing replaces it)
  s.run('Down Alt+E Alt+R "=Sheet1!$B$5" Enter'); assert.equal(s.names.Stray, 'Sheet1!$B$5');
  // rename the list a validation reads
  s.run('Home Alt+E "CaseList" Enter Escape'); assert.equal(S.validation.D1.source, '=CaseList');
});

test('F3 Paste List writes the names and their references from the active cell, alphabetical, as text', () => {
  const s = book(); const S = s.sheet;
  S.goTo(10, 2); s.run('F3'); assert.equal(s.dialog, 'pastenames');
  s.run('Alt+L'); assert.equal(s.dialog, null);
  assert.deepEqual([10, 11, 12, 13].map(r => [S.value('B' + r), S.value('C' + r)]), [['Cases', '=Lists!$A$1:$A$2'], ['CostPerWash', '=Sheet1!$B$4'], ['Stray', '=Sheet1!$B$6'], ['Ticket', '=Sheet1!$B$5']]);
  assert.equal(S.cellAt('C10').formula || null, null, 'the reference is text, not a formula');
  S.goTo(1, 5); s.run('F3 Down Down Down Enter'); assert.equal(s.editing, true, 'OK starts a formula with the name'); s.run('Enter'); assert.equal(S.value('E1'), 14);
  s.run('Alt M N'); assert.equal(s.dialog, 'namemgr', 'Alt M N opens the Name Manager too');
});

test('a planting can carry names: #names merges into the workbook names, alphabetical, null deletes', async () => {
  const { applyStatePatch } = await import('../content/workbooks/index.js');
  const st = { names: { Ticket: 'Inputs!$C$15', Case: 'Scenarios!$C$11' }, sheets: [{ name: 'Inputs', cells: {} }] };
  applyStatePatch(st, { '#names': { OldTicket: 'Scenarios!$G$6', Case: null }, 'Inputs!B17': { value: 'Names' } });
  assert.deepEqual(Object.entries(st.names), [['OldTicket', 'Scenarios!$G$6'], ['Ticket', 'Inputs!$C$15']]);
  assert.equal(st.sheets[0].cells.B17.value, 'Names');
});
