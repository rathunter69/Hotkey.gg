// Chapter 1 · 1.3.1 — Enter the missing day (clearcoat-weekly, S2b → S3a)
// Airport's Saturday never came through and the manager emailed the four figures. Entering data the
// desk way: Enter commits and stays (1.1.4 turned "move selection" off), Tab runs a row, AutoComplete
// offers a name and Esc throws the entry away, one Ctrl+Enter zeroes the five blank wash costs, Delete
// clears a stray note, Alt+Enter breaks a line inside a cell, and two labels go on Inputs: the units
// line and the cost's source. The site totals block beside the feed answers the moment the day lands.
import { MISSING_DAY, BLANK_F } from '../workbooks/clearcoat-weekly.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const raw = ses => sheetOf(ses, 'Raw');
const rawIs = (ses, ref, fn) => { const sh = raw(ses); return !!sh && fn(sh.cellAt(ref)); };
const inputsIs = (ses, ref, fn) => { const sh = sheetOf(ses, 'Inputs'); return !!sh && fn(sh.cellAt(ref)); };
const multiIs = (s, keys) => Array.isArray(s.multi) && s.multi.join(',') === keys;
/** The engine's own one-glyph keycaps: never a character typed into a cell. */
const GLYPHS = new Set(['↑', '↓', '←', '→', '↵', '⌫', '⚠']);
/** Keys that can be logged inside an entry without ending it (Backspace also opens a cell empty). */
const IN_ENTRY = new Set(['⌫', 'Delete', 'F2', 'F4', 'F9', '⚠']);
/** A key that leaves the cell: an Alt walk into the ribbon, an Alt chord inside a dialog, or a dialog shortcut. The letters logged after it were typed into the ribbon or the dialog, not the cell. */
const leavesCell = k => k === 'Alt' || /^Alt\+[A-Z]$/.test(k) || k === 'F5' || k === 'Ctrl+G' || k === 'Ctrl+F' || k === 'Ctrl+H' || k === 'Ctrl+1';
/**
 * An entry was started in a cell and thrown away with Esc, somewhere in this goal's key window. For
 * each Esc, walk back over the entry's keys: it counts when a character was typed and the entry's
 * opener is not a ribbon walk or a dialog (ribbon and dialog letters are logged uppercase, so a
 * lowercase letter is always a cell-typed character).
 */
const typedThenEsc = ses => {
  const w = windowKeys(ses);
  const typed = k => k.length === 1 && !GLYPHS.has(k);
  return w.some((k, i) => {
    if (k !== 'Esc') return false;
    let j = i - 1, chars = 0, lower = false;
    while (j >= 0 && (typed(w[j]) || IN_ENTRY.has(w[j]))) { if (typed(w[j])) { chars++; if (/[a-z]/.test(w[j])) lower = true; } j--; }
    return chars > 0 && (lower || j < 0 || !leavesCell(w[j]));
  });
};

const BLANK_KEYS = BLANK_F.map(r => 'F' + r).join(',');
/** Every other wash cost in the feed is still a non-zero number: the zeros went only where the blanks were. */
const feedIntact = sh => { for (let r = 2; r <= 61; r++) { if (BLANK_F.includes(r)) continue; const v = sh.value('F' + r); if (typeof v !== 'number' || v === 0) return false; } return true; };
const { washes, ticket, revenue, cost } = MISSING_DAY;
const dayIn = sh => sh.value('C61') === washes && sh.value('D61') === ticket && sh.value('E61') === revenue && sh.value('F61') === cost;
const NOTE_H4 = 'Airport Sat missing\nemailed manager 9/15';
const UNITS = 'USD unless stated', SOURCE = 'per supplier quote';

export default {
  id: 'enter-the-missing-day',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'clearcoat-weekly',
  state: { before: 'S2b', after: 'S3a' },
  title: 'Enter the missing day',
  difficulty: 'easy',
  tags: ['editing', 'data-entry'],
  access: 'free',
  minutes: 7,
  headline: 'Tab',
  conventions: ['F5', 'C5', 'B6'],
  teaches: ['enter-commits', 'tab-commits', 'escape-cancels', 'ctrl-enter-fill', 'delete-clears'],
  uses: ['sheet-tabs', 'ctrl-arrow', 'ctrl-home-end', 'ctrl-a', 'go-to-special', 'type-to-enter', 'home-key'],
  prerequisites: ['typed-vs-calculated'],
  brief: 'Airport’s Saturday never came through on the feed, and the manager has emailed the four figures. Enter commits and stays on the cell, Tab commits and moves right, and Ctrl+Enter puts one entry into every selected cell at once. Enter the day, zero the blank wash costs in one press, label two things on Inputs. The key is `Tab`.',
  goals: [
    { id: 'to-gap', text: 'Airport’s Saturday never came through: jump to the first blank cell of its row, Raw!C61.', keys: 'Ctrl+PgDn Ctrl+↓ Ctrl+→ →', requires: ['sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'C61') },
    { id: 'washes', teach: 'Enter commits; with "move selection" off the cursor stays put, which is how you check a figure before you leave it.', text: 'Enter 250 washes in C61 and press Enter: the cell stays selected, so read it back, then → to D61.', keys: `"${washes}" ↵ →`, requires: ['enter-commits', 'type-to-enter'],
      check: (s, ses) => onSheet(ses, 'Raw') && rawIs(ses, 'C61', c => c.value === washes) && !ses.editing && at(s, 'D61') },
    { id: 'tab-run', teach: 'Tab commits and steps one cell right, so a row of figures goes in without an arrow key.', text: 'The rest of the row as a Tab run: 14 in D61, Tab, 3500 in E61, Tab, 375 in F61, Enter.', keys: `"${ticket}" Tab "${revenue}" Tab "${cost}" ↵`, requires: ['tab-commits', 'type-to-enter'],
      check: (s, ses) => { const sh = raw(ses); return !!sh && dayIn(sh) && !ses.editing; } },
    { id: 'keep-airport', teach: 'AutoComplete proposes an entry from the same column once you have typed enough letters; Esc discards what you started and the cell keeps what it had.', text: 'Type Airp over B61, AutoComplete offers Airport after three letters, and since it is already right, throw the entry away with Esc.', keys: 'Home → "Airp" Esc', requires: ['escape-cancels', 'home-key'],
      check: (s, ses) => rawIs(ses, 'B61', c => c.value === 'Airport') && !ses.editing && typedThenEsc(ses) },
    { id: 'pick-blanks', text: 'Five wash-cost cells in column F are blank: select the feed from the top, pick out the blanks with Go To Special and count them.', keys: 'Ctrl+Home Ctrl+A then Alt H F D S K ↵', requires: ['ctrl-home-end', 'ctrl-a', 'go-to-special'], convention: 'F5',
      check: (s, ses) => onSheet(ses, 'Raw') && multiIs(s, BLANK_KEYS) && !ses.dialog },
    { id: 'zero-blanks', teach: 'Ctrl+Enter commits one entry into every selected cell at once, so five blanks take one press.', text: 'Type 0 once and commit it into all five blank cells of the Wash cost column at the same time.', keys: '"0" Ctrl+↵', requires: ['ctrl-enter-fill', 'type-to-enter'],
      check: (s, ses) => { const sh = raw(ses); return !!sh && BLANK_F.every(r => sh.value('F' + r) === 0) && feedIntact(sh) && windowKeys(ses).includes('Ctrl+↵'); } },
    { id: 'clear-draft', teach: 'Delete clears what a cell holds and leaves its format and any note behind.', text: 'Clear the stray "draft" in H3, then a two-line note in H4: Airport Sat missing, Alt+Enter, emailed manager 9/15.', keys: 'Ctrl+Home ↓ ×2 Ctrl+→ Ctrl+→ Delete ↓ "Airport Sat missing" Alt+↵ "emailed manager 9/15" ↵', requires: ['delete-clears', 'ctrl-home-end', 'ctrl-arrow', 'type-to-enter'],
      check: (s, ses) => rawIs(ses, 'H3', c => c.value == null && c.formula == null) && rawIs(ses, 'H4', c => c.value === NOTE_H4) && !ses.editing && windowKeys(ses).includes('Delete') },
    { id: 'inputs-labels', text: 'Two labels on Inputs: USD unless stated into A2, and per supplier quote into C4, beside the cost per wash.', keys: 'Ctrl+PgDn Ctrl+Home ↓ "USD unless stated" ↵ ↓ ×2 Tab ×2 "per supplier quote" ↵', requires: ['sheet-tabs', 'ctrl-home-end', 'type-to-enter', 'tab-commits'], convention: 'C5',
      check: (s, ses) => inputsIs(ses, 'A2', c => c.value === UNITS) && inputsIs(ses, 'C4', c => c.value === SOURCE) && !ses.editing },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C61" Enter "300" Enter Ctrl+G "Raw!I12" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Change Airport’s Saturday washes in C61 to 300 and watch the Airport line of the site totals, I12, answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C61:F61 hold the four emailed figures', check: (s, ses) => { const sh = raw(ses); return !!sh && dayIn(sh); } },
    { text: 'The five blank wash-cost cells read 0', check: (s, ses) => { const sh = raw(ses); return !!sh && BLANK_F.every(r => sh.value('F' + r) === 0); } },
    { text: 'H3 is clear and H4 carries the two-line note', check: (s, ses) => rawIs(ses, 'H3', c => c.value == null && c.formula == null) && rawIs(ses, 'H4', c => c.value === NOTE_H4) },
    { text: 'Inputs carries the units line in A2 and the cost’s source in C4', check: (s, ses) => inputsIs(ses, 'A2', c => c.value === UNITS) && inputsIs(ses, 'C4', c => c.value === SOURCE) },
  ],
  closing: ['Enter commits and stays, arrows move, Tab runs a row, Ctrl+Enter fills a selection, Esc backs out, Alt+Enter breaks a line. The site total answering the moment the day landed is the point of a live sheet.'],
  solution: `Ctrl+PgDn Ctrl+Down Ctrl+Right Right "${washes}" Enter Right "${ticket}" Tab "${revenue}" Tab "${cost}" Enter Home Right "Airp" Escape Ctrl+Home Ctrl+A Alt H F D S K Enter "0" Ctrl+Enter Ctrl+Home Down Down Ctrl+Right Ctrl+Right Delete Down "Airport Sat missing" Alt+Enter "emailed manager 9/15" Enter Ctrl+PgDn Ctrl+Home Down "USD unless stated" Enter Down Down Tab Tab "per supplier quote" Enter`,
};
