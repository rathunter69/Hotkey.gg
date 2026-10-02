// Chapter 4 · 4.6.2 The Name Manager (clearcoat-pack, S461 → S462, planted)
// The pack holds the three names of 4.6.1 and a stray, OldTicket, still pointing at the ticket's old
// cell on Scenarios. The learner opens the Name Manager (Ctrl+F3), deletes the stray, renames
// CostPerWash to Cost_Per_Wash, goes to the renamed name, and pastes the list of names under its
// heading on Inputs with Paste Name (F3) › Paste List. Checks read the names the session holds, the
// Name Manager's picked row while it is open, the cell Go To lands on, and the pasted list against
// the names themselves (so any order of the steps that ends in the same list passes).
import { hintToScript } from '../../app/runner.js';
import { NAMES, NAME_MANAGER_PLANT } from '../workbooks/clearcoat-pack.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const settled = ses => !ses.editing && !ses.dialog;
const names = ses => ses.names || {};
const strayGone = ses => !('OldTicket' in names(ses)) && names(ses).Case === NAMES.Case && names(ses).Ticket === NAMES.Ticket;
const renamed = ses => names(ses).Cost_Per_Wash === NAMES.Cost_Per_Wash && !('CostPerWash' in names(ses));
/** The list on Inputs from B19 is every name, alphabetical, with what it refers to. */
export function listMatches(ses, at = 19) {
  const sh = sheetOf(ses, 'Inputs'); if (!sh) return false;
  const rows = ses.definedNames();
  return rows.length > 0 && rows.every((n, i) => sh.value('B' + (at + i)) === n.name && sh.value('C' + (at + i)) === n.refersTo);
}
const onInputsAt = (ses, ref) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === 'Inputs' && ses.sheet.selectionText() === ref;
const usedGoTo = ses => (ses.keyLog || []).slice(ses.goalMark || 0).some(e => /Ctrl\+G|F5/.test(e.k));

export default {
  id: 'name-manager',
  chapter: 'data-and-lookups',
  section: 'Names and structure',
  module: 'names-and-structure',
  workbook: 'clearcoat-pack',
  state: { before: 'S461', after: 'S462' },
  plant: NAME_MANAGER_PLANT,
  title: 'The Name Manager',
  difficulty: 'medium',
  tags: ['names', 'structure', 'audit'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+F3',
  conventions: ['C9'],
  teaches: ['name-manager', 'paste-list'],
  uses: ['names-sparingly', 'defined-name', 'go-to', 'keytips', 'arrow-keys'],
  prerequisites: ['naming-sparingly'],
  brief: 'The Name Manager lists every name in the file, what it holds, where it points and its scope, including the ones somebody left behind. This file has one: OldTicket, still pointing at the ticket’s old cell on Scenarios, which would quietly feed a formula the wrong price. Delete it, give the cost per wash the house spelling, and paste the list where the reviewer will see it. The key is `Ctrl+F3`.',
  wow: 'Every name in the file is listed, fixed and on the page.',
  goals: [
    { id: 'find-stray', teach: 'Ctrl+F3 opens the Name Manager: one row per name, with its value, what it refers to and its scope. ↑ and ↓ pick a row. OldTicket points at the live ticket on Scenarios, a cell the model no longer treats as the input.',
      text: 'Open the Name Manager with Ctrl+F3 and pick the stray, OldTicket.',
      keys: 'Ctrl+F3 ↓ ×2', requires: ['name-manager', 'arrow-keys'], convention: 'C9',
      hintStuck: 'pulse the Name Manager · The list is alphabetical: Case, CostPerWash, OldTicket, Ticket.',
      check: (s, ses) => ses.dialog === 'namemgr' && !!ses.dlg && !ses.dlg.edit && !ses.dlg.confirm && (ses.definedNames()[ses.dlg.idx] || {}).name === 'OldTicket' },
    { id: 'delete-stray', teach: 'Delete (Alt+D) asks before it removes a name, and Enter answers OK. Read the Refers To column first: a stray that still points at a real cell is the dangerous kind, because nothing on the sheet looks broken.',
      text: 'Delete OldTicket, confirm, and close the Name Manager.',
      keys: 'Alt+D ↵ Esc', requires: ['name-manager'],
      hintStuck: 'pulse the Name Manager · Alt+D on the picked row, Enter to confirm, Esc to close.',
      check: (s, ses) => strayGone(ses) && settled(ses) },
    { id: 'rename', teach: 'Edit (Alt+E) opens the picked name with its text selected, so typing replaces it; Enter saves, and every formula that reads the name follows it. Scope reads Workbook: a name defined this way works on every sheet, while a sheet copied with its names makes sheet-scoped duplicates, which is where strays like OldTicket come from.',
      text: 'Rename CostPerWash to Cost_Per_Wash with Edit (Alt+E) in the Name Manager, then close it.',
      keys: 'Ctrl+F3 ↓ Alt+E "Cost_Per_Wash" ↵ Esc', requires: ['name-manager', 'arrow-keys'], convention: 'C9',
      hintStuck: 'pulse the Name Manager · Pick CostPerWash, Alt+E, type the new name over the old one.',
      check: (s, ses) => strayGone(ses) && renamed(ses) && settled(ses) },
    { id: 'go-to-renamed', text: 'Go To Cost_Per_Wash and land on the cost per wash on Inputs C5.',
      keys: 'Ctrl+G "Cost_Per_Wash" ↵', requires: ['go-to', 'defined-name'],
      hintStuck: 'pulse cell C5 · Ctrl+G takes the new name; the old one no longer exists.',
      check: (s, ses) => renamed(ses) && onInputsAt(ses, 'C5') && usedGoTo(ses) && settled(ses) },
    { id: 'paste-list', teach: 'Paste Name (F3) lists the names; Paste List (Alt+L) writes each one and what it refers to from the active cell down, as text. It is a snapshot, so paste it again whenever the names change.',
      text: 'Paste the list of names under its heading on Inputs: F3 in B19, then Paste List.',
      keys: 'Ctrl+G "Inputs!B19" ↵ F3 Alt+L', requires: ['paste-list', 'go-to'], convention: 'C9',
      hintStuck: 'pulse cell B19 · F3 opens Paste Name; Alt+L is Paste List.',
      check: (s, ses) => renamed(ses) && listMatches(ses) && settled(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Ticket" Enter "13" Enter Ctrl+G "Scenarios!C24" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch Go To land on Ticket, a $13 ticket typed there, and EBITDA on Scenarios fall.', requires: [],
      hintStuck: 'pulse cell C24 on Scenarios · Every name in the list lands where it says.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The stray is gone and the cost per wash is named Cost_Per_Wash', check: (s, ses) => strayGone(ses) && renamed(ses) },
    { text: 'The list on Inputs from B19 shows every name and what it refers to', check: (s, ses) => listMatches(ses) },
  ],
  closing: [
    'The Name Manager is the one place a name can hide, and now it holds three, each pointing where it says. The list on Inputs tells a reviewer the same without opening anything.',
    'Open it on every file you inherit: a name pointing at #REF! after a deleted sheet, or at a cell nobody uses any more, feeds a formula silently. Delete what you cannot explain.',
  ],
  solution: hintToScript('Ctrl+F3 ↓ ×2 Alt+D ↵ Esc Ctrl+F3 ↓ Alt+E "Cost_Per_Wash" ↵ Esc Ctrl+G "Cost_Per_Wash" ↵ Ctrl+G "Inputs!B19" ↵ F3 Alt+L'),
};
