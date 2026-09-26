// Chapter 1 · 1.3.1 — Enter the missing day (voltline-weekly, S2a → S3a)
// Airport's Saturday never came through and management emailed the four figures: a Tab run puts
// the day on the feed, Enter drops to the next record, Esc keeps a right entry right, one
// Ctrl+Enter zeroes the five blank energy costs, and Delete clears a stray note. The site totals
// block beside the feed answers the moment the day lands.
import { MISSING_DAY } from '../workbooks/voltline-weekly.js';

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const raw = ses => { const e = ses.sheets.find(x => x.name === 'Raw'); return e ? e.sheet : null; };
const rawIs = (ses, ref, fn) => { const sh = raw(ses); return !!sh && fn(sh.cellAt(ref)); };
const multiIs = (s, keys) => Array.isArray(s.multi) && s.multi.join(',') === keys;
/** The engine's own one-glyph keycaps: never a character typed into a cell. */
const GLYPHS = new Set(['↑', '↓', '←', '→', '↵', '⌫', '⚠']);
/** Keys that can be logged inside an entry without ending it (Backspace also opens a cell empty). */
const IN_ENTRY = new Set(['⌫', 'Delete', 'F2', 'F4', 'F9', '⚠']);
/**
 * A key that leaves the cell: an Alt walk into the ribbon, an Alt chord inside a dialog, or a dialog
 * shortcut (Go To, Find, Replace, Format Cells). The letters and digits logged after it were typed
 * into the ribbon or the dialog, not the cell.
 */
const leavesCell = k => k === 'Alt' || /^Alt\+[A-Z]$/.test(k) || k === 'F5' || k === 'Ctrl+G' || k === 'Ctrl+F' || k === 'Ctrl+H' || k === 'Ctrl+1';
/**
 * An entry was started in a cell and thrown away with Esc, somewhere in this goal's key window.
 * Every Esc is considered (a cancelled dialog earlier in the window never stalls the goal). For each
 * one, walk back over the entry's keys: it counts when a character was typed and the entry's opener
 * (the key before it, or the window's start) is not a ribbon walk or a dialog. Ribbon and dialog
 * letters are logged uppercase, so a lowercase letter is always a cell-typed character and counts
 * whatever came before it.
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

const BLANK_F = [12, 19, 28, 44, 47];   // the five Energy cost cells the feed left empty
const BLANK_KEYS = BLANK_F.map(r => 'F' + r).join(',');
/** Every other Energy cost figure in the feed is still a non-zero number: the zeros went only where the blanks were. */
const feedIntact = sh => { for (let r = 2; r <= 61; r++) { if (BLANK_F.includes(r)) continue; const v = sh.value('F' + r); if (typeof v !== 'number' || v === 0) return false; } return true; };
const dayIn = sh => sh.value('C61') === MISSING_DAY.kwh && sh.value('D61') === MISSING_DAY.price && sh.value('E61') === MISSING_DAY.revenue && sh.value('F61') === MISSING_DAY.energy;

// the figures as management wrote them (2,500 kWh, $0.48, $1,200.00, $325.00) and as they are typed (2500, 0.48, 1200, 325)
const usd = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const { kwh, price, revenue, energy } = MISSING_DAY;

export default {
  id: 'enter-the-missing-day',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'voltline-weekly',
  state: { before: 'S2a', after: 'S3a' },
  title: 'Enter the missing day',
  difficulty: 'easy',
  tags: ['editing', 'data-entry'],
  access: 'free',
  minutes: 6,
  headline: 'Tab',
  conventions: ['F5'],
  teaches: ['tab-commits', 'enter-tab-direction', 'escape-cancels', 'ctrl-enter-fill', 'delete-clears'],
  uses: ['sheet-tabs', 'ctrl-arrow', 'ctrl-home-end', 'ctrl-a', 'go-to-special', 'type-to-enter'],
  prerequisites: ['typed-vs-calculated'],
  brief: 'Airport’s Saturday never came through on the platform feed, and management has emailed the four figures. Enter the day, put 0 into the five blank energy costs in one press, and clear a stray note — the site totals answer the moment the day lands. A row of figures goes in without touching the arrow keys: the key is `Tab`.',
  goals: [
    { id: 'to-gap', text: 'Airport’s Saturday never came through: jump to the first blank cell of its row, Raw!C61.', keys: 'Ctrl+PgDn Ctrl+↓ Ctrl+→ →', requires: ['sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => onSheet(ses, 'Raw') && at(s, 'C61') },
    { id: 'kwh-price', teach: 'Tab commits the entry and steps one cell right, and Excel remembers where the run began — that is where Enter will return you.', text: `Management emailed the day: enter ${kwh.toLocaleString('en-US')} kWh in C61 and the price ${usd(price)} in D61, moving right with Tab.`, keys: `"${kwh}" Tab "${price}" Tab`, requires: ['tab-commits', 'type-to-enter'],
      check: (s, ses) => rawIs(ses, 'C61', c => c.value === kwh) && rawIs(ses, 'D61', c => c.value === price) },
    { id: 'revenue-energy', teach: 'Enter after a Tab run commits and drops to the column the run started in, one row down — where the next record begins.', text: `Finish the row with the revenue ${usd(revenue)} in E61 and the energy cost ${usd(energy)} in F61, then Enter to land in C62.`, keys: `"${revenue}" Tab "${energy}" ↵`, requires: ['enter-tab-direction', 'tab-commits', 'type-to-enter'],
      check: (s, ses) => onSheet(ses, 'Raw') && rawIs(ses, 'E61', c => c.value === revenue) && rawIs(ses, 'F61', c => c.value === energy) && at(s, 'C62') && windowKeys(ses).includes('↵') },
    { id: 'keep-airport', teach: 'Esc throws away an entry you have started: the cell keeps what it had, and nothing is committed.', text: 'Start retyping the site name over B61, then look again — Airport is right, so discard the entry and keep it.', keys: '↑ ← "Air" Esc', requires: ['escape-cancels'],
      check: (s, ses) => rawIs(ses, 'B61', c => c.value === 'Airport') && !ses.editing && typedThenEsc(ses) },
    { id: 'pick-blanks', text: 'Five Energy cost cells in column F are blank: select the feed from the top, pick out the blanks with Go To Special and count them.', keys: 'Ctrl+Home Ctrl+A then Alt H F D S ↵', requires: ['ctrl-home-end', 'ctrl-a', 'go-to-special'], convention: 'F5',
      check: (s, ses) => onSheet(ses, 'Raw') && multiIs(s, BLANK_KEYS) && !ses.dialog },
    { id: 'zero-blanks', teach: 'Ctrl+Enter commits one entry into every selected cell at once — five blanks, one press.', text: 'Type 0 once and commit it into all five blank Energy cost cells at the same time.', keys: '"0" Ctrl+↵', requires: ['ctrl-enter-fill', 'type-to-enter'],
      check: (s, ses) => { const sh = raw(ses); return !!sh && BLANK_F.every(r => sh.value('F' + r) === 0) && feedIntact(sh) && windowKeys(ses).includes('Ctrl+↵'); } },
    { id: 'clear-draft', teach: 'Delete clears what the cell holds and leaves its formatting behind — the italic stays for whatever is typed there next.', text: 'A stray “draft” note sits in H3, above the site totals block: clear it.', keys: 'Ctrl+Home ↓ ×2 Ctrl+→ Ctrl+→ Delete', requires: ['delete-clears', 'ctrl-home-end', 'ctrl-arrow'],
      check: (s, ses) => rawIs(ses, 'H3', c => c.value == null && c.formula == null) && !ses.editing && windowKeys(ses).includes('Delete') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Raw!C61" Enter "3000" Enter Ctrl+G "Raw!I12" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Airport’s Saturday kWh in C61 change to 3,000 and the Airport line of the site totals, I12, answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C61:F61 hold the four emailed figures', check: (s, ses) => { const sh = raw(ses); return !!sh && dayIn(sh); } },
    { text: 'The five blank Energy cost cells read 0', check: (s, ses) => { const sh = raw(ses); return !!sh && BLANK_F.every(r => sh.value('F' + r) === 0); } },
    { text: 'H3 is clear', check: (s, ses) => rawIs(ses, 'H3', c => c.value == null && c.formula == null) },
  ],
  closing: ['The emailed day is on the feed, and the Airport total moved the moment it landed. Read what Excel tells you (F5): Go To Special lights up the five blanks before you commit, and a total that answers says the entry is in.'],
  solution: `Ctrl+PgDn Ctrl+Down Ctrl+Right Right "${kwh}" Tab "${price}" Tab "${revenue}" Tab "${energy}" Enter Up Left "Air" Escape Ctrl+Home Ctrl+A Alt H F D S Enter "0" Ctrl+Enter Ctrl+Home Down Down Ctrl+Right Ctrl+Right Delete`,
};
