// Chapter 3 · 3.4.3 VALUE and DATEVALUE: a text export into numbers (clearcoat-databook, S4b → S4c)
// Three amounts in the export are text. On Transactions the learner lights them with Go To Special
// (Constants, Text only), turns the column into numbers in a VALUE helper (Z), reads DATEVALUE on a
// text date (AA5, formatted as a date) and the times-one trick (AB5), pastes the helper's values over
// the amounts and deletes it. On Summary the SUMPRODUCT check reads zero, and the reconciliation
// takes the two washes 3.4.1 brought in: a reason and an adjustment of 1 each, in blue. The closer
// changes one of the three amounts and the revenue total counts it.
import { transactions, summary, settled, selected, onSheet, block, near, isNum, live, reads, liveValue, calls } from './lib/databook-checks.js';

const R1 = 5, R2 = 94;
const asNum = v => (isNum(v) ? v : typeof v === 'string' && v.trim() !== '' && isFinite(+v) ? +v : NaN);
const textCells = sh => { const out = []; if (!sh) return out; for (let r = R1; r <= R2; r++) if (typeof sh.value('E' + r) === 'string') out.push('E' + r); return out; };
const helper = sh => block(sh, 'Z', R1, R2, { fns: ['VALUE'], want: r => asNum(sh.value('E' + r)) });
const isDate = c => !!c && typeof c.numFmt === 'string' && /d/i.test(c.numFmt) && /y/i.test(c.numFmt);
const dated = sh => !!sh && calls(sh, 'AA5', ['DATEVALUE']) && sh.value('AA5') === 46280 && isDate(sh.cellAt('AA5'));
const timesOne = sh => !!sh && reads(sh, 'AB5', ['E5']) && liveValue(sh, 'AB5', asNum(sh.value('E5')));
const amounts = sh => { if (!sh) return false; for (let r = R1; r <= R2; r++) { const c = sh.cellAt('E' + r); if (c.formula || !isNum(sh.value('E' + r))) return false; } return true; };
const helperGone = sh => { if (!sh) return false; for (let r = R1; r <= R2; r++) { const c = sh.cellAt('Z' + r); if (c.formula || (c.value != null && c.value !== '')) return false; } return true; };
const blue = (sh, ref) => sh.cellAt(ref).fontColor === 'blue';
const typed = (sh, ref) => { const c = sh.cellAt(ref); return !c.formula && c.value != null && c.value !== ''; };
/** Domain and Mueller: a typed reason and a typed adjustment that brings the tally to the POS, both blue; the check reads zero. */
const reconciled = sh => !!sh && [51, 52].every(r => {
  const d = sh.value('D' + r) - sh.value('C' + r);
  return typed(sh, 'F' + r) && String(sh.value('F' + r)).trim().length >= 5 && blue(sh, 'F' + r) && typed(sh, 'G' + r) && near(sh.value('G' + r), -d) && blue(sh, 'G' + r) && near(sh.value('I' + r), 0);
}) && near(sh.value('C83'), 0);
const REASON = 'A wash the tally missed; the POS row carried a trailing space';
const F = { value: '=VALUE(E5)', date: '=DATEVALUE("2026-09-15")', times: '=E5*1' };

export default {
  id: 'text-to-numbers',
  chapter: 'formulas',
  section: 'Text',
  module: 'text',
  workbook: 'clearcoat-databook',
  state: { before: 'S4b', after: 'S4c' },
  title: 'VALUE and DATEVALUE: a text export into numbers',
  difficulty: 'hard',
  tags: ['formulas', 'functions', 'text'],
  access: 'paid',
  minutes: 7,
  headline: 'VALUE',
  conventions: ['E4', 'F1', 'B1'],
  teaches: ['value-datevalue'],
  uses: ['go-to', 'go-to-special', 'ctrl-enter-fill', 'type-to-enter', 'format-cells-dialog', 'date-format', 'copy-cut-paste', 'paste-special', 'ctrl-shift-arrow', 'delete-clears', 'check-cell', 'tab-commits', 'shift-arrow', 'font-color', 'input-colour-convention', 'keytips', 'reconciliation'],
  prerequisites: ['parse-the-memo'],
  brief: 'Three amounts in the export sit on the left of their cells, which means they are text, not numbers, and every SUMIFS skips them. VALUE turns a text number into a number and DATEVALUE turns a text date into a date, and when you are in a hurry, multiplying by 1 does the same job. Paste the values over the originals, so the export holds numbers and the sums come out right. The key is `VALUE`.',
  goals: [
    { id: 'find-text', teach: 'A number stored as text sits on the left of its cell, and SUM, SUMIF and every criteria skip it without a word. Go To Special’s Constants comes with four boxes, Numbers, Text, Logicals and Errors: untick all but Text (U, G and E) and only the text lights.', text: 'On Transactions, select E5:E94 and light the text amounts with Go To Special: Constants, with only Text ticked.', keys: 'Ctrl+G "Transactions!E5:E94" ↵ Alt H F D S O U G E ↵', requires: ['go-to-special', 'go-to', 'keytips'],
      hintStuck: 'pulse range E5:E94 · Three amounts sit on the left of their cells.',
      check: (s, ses) => { const sh = transactions(ses); const want = textCells(sh); return settled(ses) && onSheet(ses, 'Transactions') && want.length > 0 && selected(sh, want.join(',')); } },
    { id: 'value', teach: 'VALUE(text) reads a number stored as text and returns the number; a real number passes through unchanged. Build it in a helper column beside the data, so you can see every result before it replaces anything.', text: 'A helper in Z5:Z94: =VALUE(E5) with Ctrl+Enter turns the three into numbers and leaves the rest as they were.', keys: `Ctrl+G "Z5:Z94" ↵ "${F.value}" Ctrl+↵`, requires: ['value-datevalue', 'go-to', 'ctrl-enter-fill'],
      hintStuck: 'pulse range Z5:Z94 · VALUE reads the amount in E on its own row.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && helper(sh); } },
    { id: 'datevalue', teach: 'DATEVALUE(date_text) does the same for a date: "2026-09-15" becomes 46280, the serial Excel counts days in, and a date format makes it read as a date again.', text: `A text date in AA5: ${F.date}, then format it as a date with Ctrl+1.`, keys: `Ctrl+G "AA5" ↵ '${F.date}' ↵ ↑ Ctrl+1 N Tab D ↵`, requires: ['value-datevalue', 'go-to', 'type-to-enter', 'format-cells-dialog', 'date-format'],
      hintStuck: 'pulse cell AA5 · The serial reads 46280 until the cell carries a date format.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && dated(sh); } },
    { id: 'times-one', teach: 'Any arithmetic makes Excel read a text number as a number, so =E5*1 does what VALUE does. VALUE says what it means, which is why it goes in a model; times one is the quick check.', text: `The trick in AB5: ${F.times}, and read it beside the amount.`, keys: `→ "${F.times}" ↵`, requires: ['formula-basics', 'type-to-enter'],
      hintStuck: 'pulse cell AB5 · Multiply the amount in E5 by one.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && timesOne(sh); } },
    { id: 'paste-values', teach: 'Paste Special Values writes the helper’s numbers over the text and keeps the column’s formats, so the export holds real amounts and nothing points at the helper any more.', text: 'Copy Z5:Z94 and paste it as values over E5:E94 with Paste Special Values.', keys: '↑ ← ← Ctrl+Shift+↓ Ctrl+C Ctrl+G "E5:E94" ↵ Ctrl+Alt+V V ↵', requires: ['copy-cut-paste', 'paste-special', 'ctrl-shift-arrow', 'go-to'], convention: 'E4',
      hintStuck: 'pulse range E5:E94 · Values only, so the amounts stop depending on the helper.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && amounts(sh); } },
    { id: 'clear-helper', text: 'The helper has done its job: select Z5:Z94 and delete it.', keys: 'Esc Ctrl+G "Z5:Z94" ↵ Delete', requires: ['go-to', 'delete-clears'],
      hintStuck: 'pulse range Z5:Z94 · The amounts in E are numbers now, so the helper can go.',
      check: (s, ses) => { const sh = transactions(ses); return settled(ses) && amounts(sh) && helperGone(sh); } },
    { id: 'read-check', text: 'Read the SUMPRODUCT check on Summary in C82: with the three amounts counted, it reads zero.', keys: 'Ctrl+G "Summary!C82" ↵', requires: ['go-to', 'check-cell'], convention: 'F1',
      hintStuck: 'pulse cell C82 · The SUMIFs now see the amounts the price list always counted.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && onSheet(ses, 'Summary') && selected(sh, 'C82'); } },
    { id: 'reconcile', teach: 'Fixing the two codes put two washes on the POS that the managers never counted, so the reconciliation moved. Explain each in words and adjust each by 1, in blue like every typed input.', text: 'Explain Domain and Mueller in F51:F52, adjust each by 1 in G51:G52, and color the four cells blue so C83 reads zero.', keys: `Ctrl+G "F51" ↵ "${REASON}" Tab "1" ↵ "${REASON}" Tab "1" ↵ ↑ Shift+↑ Shift+→ Alt H F C → ×4 ↵`, requires: ['reconciliation', 'tab-commits', 'type-to-enter', 'shift-arrow', 'font-color', 'input-colour-convention'], convention: 'B1',
      hintStuck: `pulse range F51:G52 · ${REASON}.`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && reconciled(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!E13" Enter "35" Enter Ctrl+G "Summary!F21" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the amount in E13, a number now, change to 35, and the retail revenue total in Summary F21 count it.', requires: [],
      hintStuck: 'pulse cell F21 · A number is summed; a text amount never was.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'E5:E94 hold numbers, the helper is gone, and AB5 multiplies an amount by one', check: (s, ses) => { const sh = transactions(ses); return amounts(sh) && helperGone(sh) && timesOne(sh); } },
    { text: 'AA5 reads a text date with DATEVALUE in a date format', check: (s, ses) => dated(transactions(ses)) },
    { text: 'Domain and Mueller are explained and adjusted in blue, and the reconciliation reads zero', check: (s, ses) => reconciled(summary(ses)) },
  ],
  closing: [
    'Three text amounts became numbers, and the sums finally counted them.',
    'Go To Special found the text, VALUE in a helper turned it into numbers, and Paste Special Values put them back where the formulas look. Best practice: convert in a helper you can read, paste values once you trust it, and delete the helper so nothing depends on it.',
  ],
  solution: `Ctrl+G "Transactions!E5:E94" Enter Alt H F D S O U G E Enter Ctrl+G "Z5:Z94" Enter "${F.value}" Ctrl+Enter Ctrl+G "AA5" Enter '${F.date}' Enter Up Ctrl+1 N Tab D Enter `
    + `Right "${F.times}" Enter Up Left Left Ctrl+Shift+Down Ctrl+C Ctrl+G "E5:E94" Enter Ctrl+Alt+V V Enter Escape Ctrl+G "Z5:Z94" Enter Delete `
    + `Ctrl+G "Summary!C82" Enter Ctrl+G "F51" Enter "${REASON}" Tab "1" Enter "${REASON}" Tab "1" Enter Up Shift+Up Shift+Right Alt H F C Right Right Right Right Enter`,
};
