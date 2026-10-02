// Chapter 2 · 2.6.4 Cleaning imported labels: TRIM, PROPER, SUBSTITUTE (clearcoat-pnl, S6c → S6d)
// Monthly detail's labels came in the way the clusters' system writes them: capitals, doubled
// spaces, underscores and a footnote marker. A helper column (R, past the navigation column)
// builds the clean label with PROPER(TRIM(SUBSTITUTE(…))), the (1) comes out with a second
// SUBSTITUTE written over the whole helper with Ctrl+Enter, the clean labels go over B5:B69 as
// values, and the helper is cleared. EBITDA in B70 stays out of the paste (PROPER would write
// Ebitda). Title Case is accepted on a working sheet. The closer moves a figure and the total answers.
import { DETAIL, cleanLabel } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const detail = ses => sheetOf(ses, 'Monthly detail');
const settled = ses => !ses.editing && !ses.dialog;
const LAST = DETAIL.ebitda - 1;   // 69: the head office line, the last label PROPER can write
const fx = (sh, ref, rx) => { const c = sh.cellAt(ref); return !!c.formula && rx.test(c.formula.replace(/\s+/g, '').toUpperCase()); };
const blank = (sh, ref) => { const c = sh.cellAt(ref); return !c.formula && (c.value === null || c.value === undefined); };   // empty text is content, as Excel counts it
/** The labels as the system sent them, read once from the sheet the lesson opens on. */
/** The empty rows between the cluster blocks and the company block. */
const GAPS = [...DETAIL.clusters.map(k => k.contrib + 1)];
const ROWS = Array.from({ length: LAST - 4 }, (_, i) => i + 5);
const labelsClean = sh => !!sh && ROWS.filter(r => !GAPS.includes(r)).every(r => { const v = sh.cellAt('B' + r).value; return typeof v === 'string' && v !== '' && v === cleanLabel(v) && !sh.cellAt('B' + r).formula; }) && sh.value('B' + DETAIL.ebitda) === 'EBITDA';
const helperGone = sh => !!sh && ROWS.every(r => blank(sh, 'R' + r));

export default {
  id: 'cleaning-imported-labels',
  chapter: 'formatting',
  section: 'Dates and text for presentation',
  module: 'dates-and-text-for-presentation',
  workbook: 'clearcoat-pnl',
  state: { before: 'S6c', after: 'S6d' },
  title: 'Cleaning imported labels: TRIM, PROPER, SUBSTITUTE',
  difficulty: 'medium',
  tags: ['formula', 'text', 'cleaning', 'working-sheet'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['G3', 'E4'],
  teaches: ['clean-text'],
  uses: ['paste-special', 'copy-cut-paste', 'fill-down-right', 'ctrl-enter-fill', 'delete-clears', 'go-to', 'sheet-reference', 'arrow-keys'],
  prerequisites: ['dynamic-titles'],
  brief: 'Monthly detail’s labels came in the way exports do: capitals, double spaces, an underscore where a space belongs. Three functions clean them without retyping: TRIM strips stray spaces, PROPER capitalizes each word, SUBSTITUTE swaps one piece of text for another. Build the clean label beside the dirty one, then paste values over the original. The key is `=`.',
  goals: [
    { id: 'clean-one', teach: 'Read it from the inside out: SUBSTITUTE swaps each _ for a space, TRIM strips the doubled and trailing spaces, and PROPER capitalizes each word. Column R is free, past the navigation column.', text: 'In Monthly detail!R5 enter =PROPER(TRIM(SUBSTITUTE(B5,"_"," "))) and read Austin.', keys: `Ctrl+G "'Monthly detail'!R5" ↵ '=PROPER(TRIM(SUBSTITUTE(B5,"_"," ")))' ↵`, requires: ['clean-text', 'go-to', 'sheet-reference'],
      hintStuck: 'pulse cell R5 · Three functions, one inside the other.',
      check: (s, ses) => { const sh = detail(ses); return !!sh && sh.value('R5') === 'Austin' && fx(sh, 'R5', /PROPER\(TRIM\(SUBSTITUTE\(/) && settled(ses); } },
    { id: 'fill-down', text: `Select R5:R${LAST} with Go To and fill the formula down with Ctrl+D, to the head office line.`, keys: `Ctrl+G "'Monthly detail'!R5:R${LAST}" ↵ Ctrl+D`, requires: ['fill-down-right', 'go-to', 'sheet-reference'],
      hintStuck: `pulse range R5:R${LAST} · Every label from Austin down to head office.`,
      check: (s, ses) => { const sh = detail(ses); return !!sh && sh.value('R' + LAST) === 'Head Office' && fx(sh, 'R' + LAST, /PROPER\(/) && settled(ses); } },
    { id: 'footnote', teach: 'R8 still reads Other Revenue (1): the marker belongs in a footnote, not in the label. A second SUBSTITUTE swaps "(1)" for nothing, and Ctrl+Enter writes the formula into every selected cell at once.', text: 'With R5:R69 still selected, type =PROPER(TRIM(SUBSTITUTE(SUBSTITUTE(B5,"_"," "),"(1)",""))) and press Ctrl+Enter.', keys: `'=PROPER(TRIM(SUBSTITUTE(SUBSTITUTE(B5,"_"," "),"(1)","")))' Ctrl+↵`, requires: ['clean-text', 'ctrl-enter-fill'],
      hintStuck: 'pulse cell R8 · The marker goes before TRIM tidies the space it leaves.',
      check: (s, ses) => { const sh = detail(ses); return !!sh && sh.value('R8') === 'Other Revenue' && sh.value('R' + LAST) === 'Head Office' && settled(ses); } },
    { id: 'paste-values', teach: 'Paste Special Values writes the words and drops the formulas, so the labels stand on their own once the helper goes. Stop at row 69: PROPER would write EBITDA in B70 as Ebitda.', text: `Copy R5:R${LAST} and paste it as values over the labels at B5 with Ctrl+Alt+V, V.`, keys: 'Ctrl+C Ctrl+G "B5" ↵ Ctrl+Alt+V V ↵', requires: ['paste-special', 'copy-cut-paste', 'go-to'], convention: 'E4',
      hintStuck: 'pulse range B5:B69 · Values only, so the formats on the labels stay.',
      check: (s, ses) => labelsClean(detail(ses)) && settled(ses) },
    { id: 'gaps', teach: 'A formula that returns nothing pastes as empty text, and Excel counts empty text as content: the four gaps between the blocks now hold it. Delete makes them truly empty again.', text: `Clear the gap rows the paste filled with empty text, ${GAPS.map(r => 'B' + r).join(', ').replace(/, (?=[^,]*$)/, ' and ')}, with Delete.`, keys: GAPS.map(r => `Ctrl+G "'Monthly detail'!B${r}" ↵ Delete`).join(' '), requires: ['delete-clears', 'go-to', 'sheet-reference'], convention: 'G3',
      hintStuck: `pulse cell B${GAPS[0]} · It looks empty; the paste says otherwise.`,
      check: (s, ses) => { const sh = detail(ses); return !!sh && GAPS.every(r => blank(sh, 'B' + r)) && labelsClean(sh) && settled(ses); } },
    { id: 'clear-helper', text: `Clear the helper column R5:R${LAST} with Delete, now that the labels stand on their own.`, keys: `Ctrl+G "'Monthly detail'!R5:R${LAST}" ↵ Delete`, requires: ['delete-clears', 'go-to', 'sheet-reference'], convention: 'G3',
      hintStuck: `pulse range R5:R${LAST} · The labels in B no longer read it.`,
      check: (s, ses) => { const sh = detail(ses); return labelsClean(sh) && helperGone(sh) && GAPS.every(r => blank(sh, 'B' + r)) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C10" Enter "900" Enter Escape', cadence: 320 }, text: 'Does it tie? Nothing here moved a number: watch Austin’s chemicals in C10 change to 900 and the total in C17 answer.', requires: [],
      hintStuck: 'pulse cell C17 · The labels changed; the formulas never noticed.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: `Monthly detail’s labels B5:B${LAST} are clean values, and B70 still reads EBITDA`, check: (s, ses) => labelsClean(detail(ses)) },
    { text: 'The helper column R and the gap rows are empty', check: (s, ses) => { const sh = detail(ses); return helperGone(sh) && GAPS.every(r => blank(sh, 'B' + r)); } },
  ],
  closing: [
    'One formula and one paste cleaned sixty-one labels.',
    'SUBSTITUTE, TRIM and PROPER fix what an export does to text, and Paste Special Values keeps the result once the helper is gone. PROPER gives Title Case, which is fine on a working sheet; the book’s pages keep the sentence case they were given when the page was built.',
  ],
  solution: `Ctrl+G "'Monthly detail'!R5" Enter '=PROPER(TRIM(SUBSTITUTE(B5,"_"," ")))' Enter Ctrl+G "'Monthly detail'!R5:R${LAST}" Enter Ctrl+D '=PROPER(TRIM(SUBSTITUTE(SUBSTITUTE(B5,"_"," "),"(1)","")))' Ctrl+Enter Ctrl+C Ctrl+G "B5" Enter Ctrl+Alt+V V Enter Escape ${GAPS.map(r => `Ctrl+G "'Monthly detail'!B${r}" Enter Delete`).join(' ')} Ctrl+G "'Monthly detail'!R5:R${LAST}" Enter Delete`,
};
