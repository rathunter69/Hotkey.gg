// Chapter 1 · 1.3.2 — Fix it in place (voltline-weekly, S3a → S3b)
// The feed is complete but not clean: two misspelled site names, a kWh figure typed as text, a
// revenue that cannot be right. Find each cell with Ctrl+F, open it with F2, move the insertion
// point and change only what is wrong; retype the one cell whose old entry has nothing worth keeping;
// undo the fix to read what was there and redo it. The site totals beside the feed answer every fix.
import { rawRow, WRONG_FIGURE } from '../workbooks/voltline-weekly.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const raw = ses => { const e = ses.sheets.find(x => x.name === 'Raw'); return e ? e.sheet : null; };
const rawIs = (ses, ref, fn) => { const sh = raw(ses); return !!sh && fn(sh.cellAt(ref)); };
const RIVERSIDE_ROWS = Array.from({ length: 12 }, (_, d) => rawRow('Riverside', d));   // B26:B37 — every Riverside row, not only the typo
const WRONG = WRONG_FIGURE.wrong, RIGHT = WRONG_FIGURE.right;

export default {
  id: 'fix-it-in-place',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'voltline-weekly',
  state: { before: 'S3a', after: 'S3b' },
  title: 'Fix it in place',
  difficulty: 'medium',
  tags: ['editing', 'find', 'undo'],
  access: 'free',
  minutes: 5,
  headline: 'F2',
  conventions: ['E1', 'F5'],
  teaches: ['find-replace', 'edit-caret', 'backspace', 'replace-by-typing', 'undo-redo', 'text-vs-number'],
  uses: ['edit-mode-f2', 'sheet-tabs', 'type-to-enter'],
  prerequisites: ['enter-the-missing-day'],
  brief: `The feed is complete but not clean: two site names are misspelled, one kWh figure was typed as text, and E41 shows ${WRONG} for a single day's revenue. Find each cell, open it and change only what is wrong — a reviewer trusts the person who reads a cell before retyping it. The key is \`F2\`.`,
  goals: [
    { id: 'find-muller', teach: 'Ctrl+F opens Find: type part of what you want, Enter jumps to the next cell containing it, Esc closes the card.', text: 'Mueller is misspelled somewhere in the 60-row feed: move to Raw and find Muller.', keys: 'Ctrl+PgDn Ctrl+F "Muller" ↵ Esc', requires: ['sheet-tabs', 'find-replace'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'B14') && !ses.dialog },
    { id: 'caret-fix', teach: 'In Edit mode, Home and End send the insertion point to either end of the entry and ← → step it one character; typing inserts there.', text: 'Open B14 with F2, move the insertion point to just after Mu, and insert the e so it reads Mueller.', keys: 'F2 Home → ×2 "e" ↵', requires: ['edit-mode-f2', 'edit-caret'], convention: 'E1',
      check: (s, ses) => rawIs(ses, 'B14', c => c.value === 'Mueller') && windowKeys(ses).includes('F2') },
    { id: 'find-riversid', text: 'Riverside lost its e in one row: find Riversid, Find Next past the first hit (a correct Riverside), and add the e.', keys: 'Ctrl+F "Riversid" ↵ ×2 Esc F2 "e" ↵', requires: ['find-replace', 'edit-mode-f2'],
      check: (s, ses) => RIVERSIDE_ROWS.every(r => rawIs(ses, 'B' + r, c => c.value === 'Riverside')) },
    { id: 'text-number', teach: 'A figure sitting on the left is text, not a number; Backspace deletes the character before the insertion point, so the trailing space goes and 1,240 snaps right.', text: 'C33 shows 1,240 on the left — text with a trailing space: find it, open it, delete the space and commit it as a number.', keys: 'Ctrl+F "1,240" ↵ Esc F2 ⌫ ↵', requires: ['find-replace', 'edit-mode-f2', 'text-vs-number', 'backspace'], convention: 'F5',
      check: (s, ses) => rawIs(ses, 'C33', c => c.value === 1240) },
    { id: 'retype', teach: 'Typing on a cell replaces its whole contents — no F2 when nothing in the old entry is worth keeping.', text: `E41 reads ${WRONG} for one day of South Lamar revenue when kWh × price says ${RIGHT}: find it and type ${RIGHT} over it.`, keys: `Ctrl+F "${WRONG}" ↵ Esc "${RIGHT}" ↵`, requires: ['find-replace', 'replace-by-typing', 'type-to-enter'],
      check: (s, ses) => rawIs(ses, 'E41', c => c.value === RIGHT) },
    { id: 'undo', teach: 'Ctrl+Z undoes the last change and Ctrl+Y puts it back, so a fix can be tried, read and kept.', text: `The associate asks what was there before: Ctrl+Z, and E41 shows ${WRONG} again.`, keys: 'Ctrl+Z', requires: ['undo-redo'],
      check: (s, ses) => rawIs(ses, 'E41', c => c.value === WRONG) && windowKeys(ses).includes('Ctrl+Z') },
    { id: 'redo', text: `The figure was wrong after all: Ctrl+Y puts ${RIGHT} back in E41.`, keys: 'Ctrl+Y', requires: ['undo-redo'],
      check: (s, ses) => rawIs(ses, 'E41', c => c.value === RIGHT) && windowKeys(ses).includes('Ctrl+Y') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C33" Enter "2000" Enter Ctrl+G "Raw!I10" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch C33, a Riverside kWh figure, change to 2,000 and Riverside’s kWh total in I10 answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'B14 reads Mueller', check: (s, ses) => rawIs(ses, 'B14', c => c.value === 'Mueller') },
    { text: 'every Riverside row reads Riverside', check: (s, ses) => RIVERSIDE_ROWS.every(r => rawIs(ses, 'B' + r, c => c.value === 'Riverside')) },
    { text: 'C33 is the number 1,240', check: (s, ses) => rawIs(ses, 'C33', c => c.value === 1240) },
    { text: `E41 reads ${RIGHT}`, check: (s, ses) => rawIs(ses, 'E41', c => c.value === RIGHT) },
  ],
  closing: [
    'Every fix went in place: F2 opened the cell, the insertion point moved, only the wrong characters changed — and the site totals beside the feed answered without being asked.',
    'Read what Excel shows you: a figure on the left is text, and a revenue far above its neighbors is a typo, not a record day.',
  ],
  solution: `Ctrl+PgDn Ctrl+F "Muller" Enter Escape F2 Home Right Right "e" Enter Ctrl+F "Riversid" Enter Enter Escape F2 "e" Enter Ctrl+F "1,240" Enter Escape F2 Backspace Enter Ctrl+F "${WRONG}" Enter Escape "${RIGHT}" Enter Ctrl+Z Ctrl+Y`,
};
