// Chapter 1 · 1.3.2 — Fix it in place (clearcoat-weekly, S3a → S3b)
// The feed is complete but not clean: two misspelled site names, a wash count typed as text, a
// revenue ten times its neighbors, and a third typo sixty rows deep. The flick (arrow, F2, Esc) reads a
// column the way a reviewer does; F2, Home and the arrows change only what is wrong; a retype replaces
// the one entry with nothing worth keeping; Ctrl+Z and Ctrl+Y try a fix and keep it; Ctrl+F finds the
// typo you cannot see; Alt, H, H, N clears a flag and F4 repeats it. The site totals beside the feed answer.
import { rawRow, WRONG_FIGURE } from '../workbooks/clearcoat-weekly.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const raw = ses => { const e = ses.sheets.find(x => x.name === 'Raw'); return e ? e.sheet : null; };
const rawIs = (ses, ref, fn) => { const sh = raw(ses); return !!sh && fn(sh.cellAt(ref)); };
const settled = ses => !ses.editing && !ses.dialog;
const RIVERSIDE_ROWS = Array.from({ length: 12 }, (_, d) => rawRow('Riverside', d));   // B26:B37: every Riverside row, not only the typo
const AIRPORT_ROWS = Array.from({ length: 12 }, (_, d) => rawRow('Airport', d));       // B50:B61
const WRONG = WRONG_FIGURE.wrong, RIGHT = WRONG_FIGURE.right;
const FLAGGED = ['E41', 'C33', 'B14'];   // the three cells the reviewer filled yellow
const flagsClear = ses => FLAGGED.every(ref => rawIs(ses, ref, c => !c.fill));
/** The flick: an F2 followed by an Esc somewhere in this goal's key window (the cell was looked at, not changed). */
const flicked = ses => { const w = windowKeys(ses); const i = w.indexOf('F2'); return i >= 0 && w.indexOf('Esc', i) > i; };

export default {
  id: 'fix-it-in-place',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'clearcoat-weekly',
  state: { before: 'S3a', after: 'S3b' },
  title: 'Fix it in place',
  difficulty: 'medium',
  tags: ['editing', 'find', 'undo'],
  access: 'free',
  minutes: 7,
  headline: 'F2',
  conventions: ['E1', 'F5'],
  teaches: ['edit-caret', 'backspace', 'replace-by-typing', 'undo-redo', 'text-vs-number', 'find-replace', 'f4-repeat'],
  uses: ['edit-mode-f2', 'sheet-tabs', 'type-to-enter', 'page-keys', 'arrow-keys', 'escape-cancels'],
  prerequisites: ['enter-the-missing-day'],
  brief: `The feed is complete but not clean: two site names are misspelled, one wash count was typed as text, and one day’s revenue is ten times its neighbors. Analysts find these by flicking through cells (arrow to a cell, F2 to see exactly what is in it, Esc to leave it untouched) and fix them in place with F2, Home, End and the arrows, changing only what is wrong. Ctrl+Z undoes a change and Ctrl+Y puts it back; F4 repeats a fix on the next cell. The key is \`F2\`.`,
  goals: [
    { id: 'flick', text: 'Move to Raw and flick down the Site column from B10: ↓, F2, Esc, until you find Muller in B14.', keys: 'Ctrl+PgDn → ↓ ×9 then ↓ F2 Esc ↓ F2 Esc ↓ F2 Esc ↓ F2 Esc', slowRound: true, requires: ['sheet-tabs', 'arrow-keys', 'edit-mode-f2', 'escape-cancels'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'B14') && settled(ses) && flicked(ses) },
    { id: 'caret-fix', teach: 'In Edit mode, Home and End send the insertion point to either end of the entry and ← → step it one character; typing inserts where the caret is, and Enter keeps the change.', text: 'Open B14 with F2, move the insertion point to just after Mu, and insert the e so it reads Mueller.', keys: 'F2 Home → ×2 "e" ↵', requires: ['edit-mode-f2', 'edit-caret'], convention: 'E1',
      check: (s, ses) => rawIs(ses, 'B14', c => c.value === 'Mueller') && settled(ses) && windowKeys(ses).includes('F2') },
    { id: 'riverside', text: 'Keep flicking: Riverside lost its e in one row further down, B27, so read each before you edit it, then add the e.', keys: 'PgDn ↓ ×3 F2 "e" ↵', requires: ['page-keys', 'edit-mode-f2', 'edit-caret'],
      check: (s, ses) => RIVERSIDE_ROWS.every(r => rawIs(ses, 'B' + r, c => c.value === 'Riverside')) && settled(ses) },
    { id: 'text-number', teach: 'A figure sitting on the left is text, not a number, and a total that reads it will skip it. Backspace deletes the character before the insertion point, so the trailing space goes and 240 snaps to the right.', text: 'C33 shows 240 sitting on the left, which means text with a trailing space: open it, delete the space and commit it as a number.', keys: '→ ↓ ×6 F2 ⌫ ↵', slowRound: true, requires: ['text-vs-number', 'backspace', 'edit-mode-f2'], convention: 'F5',
      check: (s, ses) => rawIs(ses, 'C33', c => c.value === 240 && !c.formula) && settled(ses) },
    { id: 'retype', teach: 'Typing on a cell replaces its whole entry: no F2 when nothing in the old entry is worth keeping. Sanity-check the magnitude; one site does not do $81,500 in a day.', text: `E41 reads ${WRONG} for one day of South Lamar revenue when washes times ticket says 3,150: type ${RIGHT} over it.`, keys: `→ ×2 ↓ ×8 "${RIGHT}" ↵`, slowRound: true, requires: ['replace-by-typing', 'type-to-enter'],
      check: (s, ses) => rawIs(ses, 'E41', c => c.value === RIGHT) && settled(ses) },
    { id: 'undo-redo', teach: 'Ctrl+Z undoes the last change and Ctrl+Y puts it back, dozens of steps deep, so a fix can be tried, read and kept, or shown to someone who asks.', text: `The CFO asks what was there before: Ctrl+Z, read ${WRONG}, then Ctrl+Y to put the fix back.`, keys: 'Ctrl+Z Ctrl+Y', requires: ['undo-redo'],
      check: (s, ses) => rawIs(ses, 'E41', c => c.value === RIGHT) && windowKeys(ses).includes('Ctrl+Z') && windowKeys(ses).includes('Ctrl+Y') },
    { id: 'find-airprot', teach: 'Ctrl+F is for when you know the text but not the cell: type part of it, Enter jumps to the next match, Esc closes the box and leaves you there.', text: 'One typo you cannot see from here, Airprot somewhere in sixty rows: Ctrl+F finds it, then type Airport over it.', keys: 'Ctrl+F "Airprot" ↵ Esc "Airport" ↵', requires: ['find-replace', 'replace-by-typing', 'type-to-enter'],
      check: (s, ses) => AIRPORT_ROWS.every(r => rawIs(ses, 'B' + r, c => c.value === 'Airport')) && settled(ses) && windowKeys(ses).includes('Ctrl+F') },
    { id: 'clear-flags', teach: 'F4 repeats your last action on the cell you are on now: a format, a border, a width, an insert. Fix it once, F4 the rest. It does not repeat typing; for that there is Ctrl+Enter.', text: 'Whoever flagged the errors filled E41, C33 and B14 yellow: clear the fill on E41 with Alt, H, H, N, then F4 on C33 and F4 on B14.', keys: 'Ctrl+F "3150" ↵ Esc Alt H H N then ← ×2 ↑ ×8 F4 then Ctrl+F "Mueller" ↵ ×3 Esc F4', slowRound: true, requires: ['f4-repeat', 'find-replace'],
      check: (s, ses) => flagsClear(ses) && settled(ses) && windowKeys(ses).includes('F4') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C33" Enter "260" Enter Ctrl+G "Raw!I10" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Change C33, a Riverside wash count, to 260 and watch Riverside’s total in I10 answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'B14 reads Mueller and every Riverside row reads Riverside', check: (s, ses) => rawIs(ses, 'B14', c => c.value === 'Mueller') && RIVERSIDE_ROWS.every(r => rawIs(ses, 'B' + r, c => c.value === 'Riverside')) },
    { text: 'C33 is the number 240', check: (s, ses) => rawIs(ses, 'C33', c => c.value === 240) },
    { text: `E41 reads ${RIGHT}`, check: (s, ses) => rawIs(ses, 'E41', c => c.value === RIGHT) },
    { text: 'Every Airport row reads Airport', check: (s, ses) => AIRPORT_ROWS.every(r => rawIs(ses, 'B' + r, c => c.value === 'Airport')) },
    { text: 'The three yellow flags are cleared', check: (s, ses) => flagsClear(ses) },
  ],
  closing: [
    'F2 to look, Esc to leave, F2 again to fix: that flick down a column is how a reviewer reads a sheet, and it is faster than any search because you see everything, not just what you searched for.',
    'Read what Excel shows you: a figure sitting on the left is text, not a number, and a revenue ten times its neighbors is a typo, not a record day.',
  ],
  solution: `Ctrl+PgDn Right Down Down Down Down Down Down Down Down Down Down F2 Escape Down F2 Escape Down F2 Escape Down F2 Escape F2 Home Right Right "e" Enter PageDown Down Down Down F2 "e" Enter Right Down Down Down Down Down Down F2 Backspace Enter Right Right Down Down Down Down Down Down Down Down "${RIGHT}" Enter Ctrl+Z Ctrl+Y Ctrl+F "Airprot" Enter Escape "Airport" Enter Ctrl+F "${RIGHT}" Enter Escape Alt H H N Left Left Up Up Up Up Up Up Up Up F4 Ctrl+F "Mueller" Enter Enter Enter Escape F4`,
};
