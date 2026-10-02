// Chapter 4 · 4.1.1 Why lookups: a model reads a dataset it can't hold (clearcoat-pack, S0 → S411)
// The question log's first answer is a typed 15. A VLOOKUP beside it reads the Deluxe price from the
// package list on Lists; the price moves to 16 and only the lookup follows; Ctrl+Z puts it back; the
// answer cell becomes the lookup itself, green as a link, and the working cell goes. The closer moves
// the price again and the log answer follows.
import { qa, lists, settled, calls, live, near, selected, onSheet, blank } from './lib/pack-checks.js';

const F = { lookup: '=VLOOKUP("D",Lists!$B$14:$E$16,3,FALSE)' };
const q = f => `'${f}'`;   // a formula with double quotes types inside single ones
const deluxe = ses => { const l = lists(ses); return l ? l.value('D15') : null; };
const looksUp = (ses, ref) => { const sh = qa(ses); return !!sh && calls(sh, ref, ['VLOOKUP']) && near(sh.value(ref), deluxe(ses)) && live(sh, ref); };

export default {
  id: 'why-lookups',
  chapter: 'data-and-lookups',
  section: 'Lookups',
  module: 'lookups',
  workbook: 'clearcoat-pack',
  state: { before: 'S0', after: 'S411' },
  title: 'Why lookups: a model reads a dataset it can’t hold',
  difficulty: 'medium',
  tags: ['formulas', 'lookups'],
  access: 'paid',
  minutes: 6,
  headline: 'VLOOKUP',
  conventions: ['B4', 'B2'],
  teaches: ['vlookup'],
  uses: ['go-to', 'cross-sheet-ref', 'undo-redo', 'font-color', 'link-colour-convention', 'ctrl-enter-fill', 'delete-clears', 'keytips'],
  prerequisites: ['ch3-assessment'],
  brief: 'The question log is the buyers’ diligence questions, numbered, with an owner and a status, and every answer points at a cell. The first asks the Deluxe price, and the answer in F5 is a typed 15: the day the price list changes, it is wrong and nobody knows. A lookup finds the row for D in the package list on Lists and brings back its price, so the answer moves when the list does. Watch a typed answer and a looked-up one part ways, then make the log read the list. The key is `VLOOKUP`.',
  wow: 'The answer reads the list now, so it can’t be wrong the day the list changes.',
  goals: [
    { id: 'read-list', text: 'On Lists, select the Deluxe retail price in the package list, D15.', keys: 'Ctrl+G "Lists!D15" ↵', requires: ['go-to', 'sheet-reference'],
      hintStuck: 'pulse cell D15 on Lists · The package list sits under the site list, codes in B14:B16.',
      check: (s, ses) => settled(ses) && onSheet(ses, 'Lists') && selected(lists(ses), 'D15') },
    { id: 'lookup', teach: 'VLOOKUP(key, table, column, FALSE) looks down the table’s first column for the key and returns the column you count to: "D" in Lists!$B$14:$E$16, column 3, is the Deluxe retail price. FALSE asks for an exact match, and the anchors keep the table still wherever the formula goes.',
      text: 'Back on Q&A, enter =VLOOKUP("D",Lists!$B$14:$E$16,3,FALSE) in G5, beside the typed answer.', keys: `Ctrl+G "'Q&A'!G5" ↵ ${q(F.lookup)} ↵`, requires: ['vlookup', 'go-to', 'cross-sheet-ref'],
      hintStuck: 'pulse cell G5 on Q&A · The table is the package list, B14:E16 on Lists; the price is its third column.',
      check: (s, ses) => settled(ses) && looksUp(ses, 'G5') },
    { id: 'diverge', text: 'Change the Deluxe price on Lists to 16 and watch G5 read 16 while the typed F5 still reads 15.', keys: 'Ctrl+G "Lists!D15" ↵ "16" ↵', requires: ['go-to', 'type-to-enter'],
      hintStuck: 'pulse cell D15 on Lists · Type over the price; the lookup on Q&A follows it.',
      check: (s, ses) => { const sh = qa(ses); return settled(ses) && !!sh && near(deluxe(ses), 16) && near(sh.value('G5'), 16) && near(sh.value('F5'), 15); } },
    { id: 'undo', text: 'Press Ctrl+Z to put the Deluxe price back to 15.', keys: 'Ctrl+Z', requires: ['undo-redo'],
      hintStuck: 'pulse cell D15 on Lists · Undo takes back the last change on the sheet.',
      check: (s, ses) => { const l = lists(ses); return settled(ses) && !!l && near(l.value('D15'), 15) && !l.formula('D15'); } },
    { id: 'answer-link', teach: 'An answer in the log is a reference to a cell that reads the data, never a typed figure, because a buyer will change the data and expect the answer to move. The lookup reads another sheet, so it is green like every link.',
      text: 'Retype the answer in F5 as the same lookup and color it green, a link to another sheet.', keys: `Ctrl+G "'Q&A'!F5" ↵ ${q(F.lookup)} Ctrl+↵ Alt H F C → ×8 ↵`, requires: ['vlookup', 'ctrl-enter-fill', 'font-color', 'link-colour-convention', 'keytips'], convention: 'B2',
      hintStuck: 'pulse cell F5 on Q&A · Ctrl+Enter keeps the cell selected for the color.',
      check: (s, ses) => { const sh = qa(ses); return settled(ses) && looksUp(ses, 'F5') && sh.cellAt('F5').fontColor === 'green'; } },
    { id: 'clear-helper', text: 'Clear the working lookup in G5 with Delete, so the log holds one answer.', keys: '→ Delete', requires: ['delete-clears', 'arrow-keys'],
      hintStuck: 'pulse cell G5 on Q&A · F5 holds the answer now.',
      check: (s, ses) => settled(ses) && blank(qa(ses), 'G5') && looksUp(ses, 'F5') },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "Lists!D15" Enter "17" Enter Ctrl+G "'Q&A'!F5" Enter`, cadence: 320 },
      text: 'Does it tie? Watch the Deluxe price on Lists move to 17 and the answer in F5 follow it.', requires: [],
      hintStuck: 'pulse cell F5 on Q&A · The answer reads the list, so the list leads.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'F5 on Q&A reads the Deluxe price from Lists with a live VLOOKUP, green', check: (s, ses) => looksUp(ses, 'F5') && qa(ses).cellAt('F5').fontColor === 'green' },
  ],
  closing: [
    'The answer reads the list now, so it can’t be wrong the day the list changes.',
    'A typed answer is a copy of the data taken on one day; a lookup is a question the sheet asks every time it calculates. Every number in the log will point at a cell that reads the data, and the next lessons show how a lookup fails, so you know what to check.',
  ],
  solution: `Ctrl+G "Lists!D15" Enter Ctrl+G "'Q&A'!G5" Enter ${q(F.lookup)} Enter Ctrl+G "Lists!D15" Enter "16" Enter Ctrl+Z `
    + `Ctrl+G "'Q&A'!F5" Enter ${q(F.lookup)} Ctrl+Enter Alt H F C Right Right Right Right Right Right Right Right Enter Right Delete`,
};
