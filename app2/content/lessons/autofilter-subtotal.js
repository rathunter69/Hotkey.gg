// Chapter 4 · 4.2.2 AutoFilter and filtered totals with SUBTOTAL (clearcoat-pack, S421 → S422)
// A filter hides the rows that don't match without moving anything. The export gets its filter
// arrows, shows Domain only, and under the block a SUM (which keeps counting the hidden rows) sits
// beside SUBTOTAL(109), which adds only what shows; then Saturdays on top, SUBTOTAL(103) counts the
// rows showing, and the filters come off. The closer filters to Airport: only the SUBTOTALs move.
import { exportSheet, rowsOf, sameText, calls, near, isNum, settled, shellOf, filterOn } from './lib/pack-list-checks.js';

const TOTALS = ['D96', 'D97', 'D98', 'E96', 'E97', 'E98'];
const F = { sum: '=SUM(E5:E94)', sub: '=SUBTOTAL(109,E5:E94)', count: '=SUBTOTAL(103,A5:A94)' };
/** The export’s filter: arrows on the header row (row 4) across the block, down to the last row. */
const filterOnBlock = sh => !!sh && !!sh.filter && sh.filter.r1 === 4 && sh.filter.c1 === 1 && sh.filter.c2 >= 9 && sh.filter.r2 >= 94;
const showing = sh => rowsOf(sh).filter(x => !sh.filterRows.has(x.r));
const domainOnly = sh => { const v = showing(sh); return v.length > 0 && v.length < 90 && v.every(x => sameText(x.site, 'AUS-DOM')) && v.length === rowsOf(sh).filter(x => sameText(x.site, 'AUS-DOM')).length; };
const saturdays = sh => { const v = showing(sh); return domainOnly(sh) === false && v.length > 0 && v.every(x => sameText(x.site, 'AUS-DOM') && sameText(x.day, 'Sat')) && !!filterOn(sh, 2) && !!filterOn(sh, 9); };
const total = (sh, rows) => rows.reduce((t, x) => t + (isNum(x.total) ? x.total : 0), 0);
/** The SUBTOTAL in E97 and the SUM in E96: each calls its function and reads the figure the filter allows. */
const sumCell = sh => calls(sh, 'E96', ['SUM']) && near(sh.value('E96'), total(sh, rowsOf(sh)));
const subCell = sh => calls(sh, 'E97', ['SUBTOTAL']) && /109/.test(sh.formula('E97') || '') && near(sh.value('E97'), total(sh, showing(sh)));
const countCell = sh => calls(sh, 'E98', ['SUBTOTAL']) && /103/.test(sh.formula('E98') || '') && sh.value('E98') === showing(sh).length;
const cleared = sh => showing(sh).length === 90 && !Object.keys((sh.filter && sh.filter.crit) || {}).length;

export default {
  id: 'autofilter-subtotal',
  chapter: 'data-and-lookups',
  section: 'Lists and tables',
  module: 'lists-and-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S421', after: 'S422' },
  plant: shellOf('S422', { Export: TOTALS }, { keepText: true }),
  title: 'AutoFilter and filtered totals with SUBTOTAL',
  difficulty: 'medium',
  tags: ['data', 'lists', 'filter'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+Shift+L',
  conventions: ['F5', 'F1'],
  teaches: ['autofilter', 'subtotal-visible'],
  uses: ['go-to', 'type-to-enter', 'formula-basics', 'sum-family', 'dialog-box', 'keytips'],
  prerequisites: ['sort-multi-level'],
  brief: 'A filter hides the rows that don’t match, so the export can show only Saturdays, or only Domain, without moving anything. Ctrl+Shift+L turns it on, and Alt+Down on a header opens its menu. The trap: SUM adds hidden rows too. SUBTOTAL(109, range) adds only what shows and SUBTOTAL(103, range) counts it, so a filtered total tells the truth; answer Sponsor B’s Saturday question with them. The key is `Ctrl+Shift+L`.',
  goals: [
    { id: 'arrows', teach: 'Ctrl+Shift+L puts a filter arrow on every header of the block around the active cell. Nothing is hidden yet: the arrows are the switches.', text: 'On Export, land on the header A4 and press Ctrl+Shift+L: filter arrows on every header.', keys: 'Ctrl+G "Export!A4" ↵ Ctrl+Shift+L', requires: ['autofilter', 'go-to'],
      hintStuck: 'pulse cell Export!A4 · The filter covers the block around the active cell.',
      check: (s, ses) => filterOnBlock(exportSheet(ses)) },
    { id: 'domain', text: 'Alt+Down on the Site header B4, press E to search, type DOM and Enter: Domain’s fifteen days only.', keys: '→ Alt+↓ E "DOM" ↵', requires: ['autofilter'],
      hintStuck: 'pulse cell B4 · The search box keeps only the values that contain what you type.',
      check: (s, ses) => { const sh = exportSheet(ses); return filterOnBlock(sh) && domainOnly(sh); } },
    { id: 'sum-sub', teach: 'SUBTOTAL(109, range) adds the cells of rows that show; a row a filter hides drops out. SUM never looks, so under a filter the two disagree, and the SUBTOTAL is the one that answers the question on screen.', text: 'Under the block, put =SUM(E5:E94) in E96 and =SUBTOTAL(109,E5:E94) in E97, and read the two against each other.', keys: `Ctrl+G "E96" ↵ "${F.sum}" ↵ "${F.sub}" ↵`, requires: ['subtotal-visible', 'sum-family', 'go-to', 'type-to-enter'], convention: 'F5',
      hintStuck: 'pulse range E96:E97 · SUM still counts all ninety rows; SUBTOTAL counts Domain’s fifteen.',
      check: (s, ses) => { const sh = exportSheet(ses); return settled(ses) && domainOnly(sh) && sumCell(sh) && subCell(sh); } },
    { id: 'saturday', text: 'Add a second filter on the Day column, I4: search Sat, so only Domain’s Saturdays show.', keys: 'Ctrl+G "I4" ↵ Alt+↓ E "Sat" ↵', requires: ['autofilter', 'go-to'],
      hintStuck: 'pulse cell I4 · Filters stack: the Site filter stays on while you add the Day one.',
      check: (s, ses) => { const sh = exportSheet(ses); return saturdays(sh) && subCell(sh); } },
    { id: 'count', text: 'Count the rows showing with =SUBTOTAL(103,A5:A94) in E98: Sponsor B’s Saturdays at Domain.', keys: `Ctrl+G "E98" ↵ "${F.count}" ↵`, requires: ['subtotal-visible', 'go-to', 'type-to-enter'],
      hintStuck: 'pulse cell E98 · 103 counts the cells that are not empty, in the rows that show.',
      check: (s, ses) => { const sh = exportSheet(ses); return settled(ses) && saturdays(sh) && countCell(sh); } },
    { id: 'clear', text: 'Clear every filter with Alt, A, C, and check that SUM and SUBTOTAL agree again.', keys: 'Alt A C', requires: ['autofilter', 'keytips'], convention: 'F1',
      hintStuck: 'pulse range E96:E97 · With every row showing, the two totals read the same.',
      check: (s, ses) => { const sh = exportSheet(ses); return settled(ses) && cleared(sh) && sumCell(sh) && subCell(sh) && countCell(sh) && near(sh.value('E96'), sh.value('E97')); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "B4" Enter Alt+Down E "AIR" Enter Ctrl+G "E96" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch the export filter to Airport: the SUM in E96 stays put, and only the SUBTOTALs move.', requires: [],
      hintStuck: 'pulse range E96:E98 · Only SUBTOTAL knows which rows the filter hides.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'E96:E98 hold the SUM, the SUBTOTAL(109) and the SUBTOTAL(103) under the export data', check: (s, ses) => { const sh = exportSheet(ses); return sumCell(sh) && subCell(sh) && countCell(sh); } },
    { text: 'Every filter on the export is cleared', check: (s, ses) => cleared(exportSheet(ses)) },
  ],
  closing: [
    'The rows you hid stayed out of the total, because SUBTOTAL knows what is showing.',
    'Best practice: any total that sits under a list someone might filter is a SUBTOTAL, never a SUM. Leave the filter arrows on if you like, but clear the filters before you send, or the next reader sees a third of the rows and thinks it is all of them.',
  ],
  solution: `Ctrl+G "Export!A4" Enter Ctrl+Shift+L Right Alt+Down E "DOM" Enter Ctrl+G "E96" Enter "${F.sum}" Enter "${F.sub}" Enter `
    + `Ctrl+G "I4" Enter Alt+Down E "Sat" Enter Ctrl+G "E98" Enter "${F.count}" Enter Alt A C`,
};
