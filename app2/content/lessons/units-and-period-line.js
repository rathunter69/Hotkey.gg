// Chapter 2 · 2.6.5 A units line that writes itself (clearcoat-pnl, S6d → S6e)
// The units line has been typed on every page so far. It is built once on Inputs!B17 from the
// currency and the units (B12 holds the switch, so the line lives in B17), and every page's A2
// reads it: the P&L and Monthly keep their italic, Print's takes it. The learner types millions
// into B5 and undoes it; the closer switches the currency. The script's P&L period line is left
// out (the P&L has no free row 3 and Print already carries the period line from 2.6.3).
import { UNITS_LINE } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;
const used = (ses, label) => ses.keyLog.slice(ses.goalMark || 0).some(e => e.k === label);
const fx = (sh, ref, rx) => { const c = sh.cellAt(ref); return !!c.formula && rx.test(c.formula.replace(/\s+/g, '').toUpperCase()); };
const builtOnce = sh => !!sh && sh.value('B17') === UNITS_LINE && fx(sh, 'B17', /^=\$?B\$?4&.*\$?B\$?5&/);
const reads = (ses, name) => { const sh = sheetOf(ses, name); return !!sh && sh.value('A2') === UNITS_LINE && fx(sh, 'A2', /^=INPUTS!\$?B\$?17$/) && sh.cellAt('A2').it === true; };
const allRead = ses => ['P&L', 'Monthly', 'Print'].every(n => reads(ses, n));

export default {
  id: 'units-and-period-line',
  chapter: 'formatting',
  section: 'Dates and text for presentation',
  module: 'dates-and-text-for-presentation',
  workbook: 'clearcoat-pnl',
  state: { before: 'S6d', after: 'S6e' },
  title: 'A units line that writes itself',
  difficulty: 'medium',
  tags: ['formula', 'text', 'units', 'headers'],
  access: 'paid',
  minutes: 5,
  headline: '&',
  conventions: ['C5', 'B4'],
  teaches: ['single-source-line'],
  uses: ['concatenate-amp', 'dynamic-title', 'cross-sheet-ref', 'bold-italic-underline', 'undo-redo', 'go-to', 'sheet-reference', 'arrow-keys'],
  prerequisites: ['cleaning-imported-labels'],
  brief: 'The units line has been typed on every page so far. Build it once on Inputs from the currency and the units, and point every page’s A2 at it, so the day the book goes to euros or to millions is one edit. The key is `&`.',
  goals: [
    { id: 'build-line', teach: 'Text in quotes rides along with the cells it joins: B4 is the currency, " " the space between, B5 the units, and the rest of the sentence after them.', text: 'In Inputs!B17 enter =B4&" "&B5&" unless stated; costs shown as negatives" and read the units line.', keys: `Ctrl+G "Inputs!B17" ↵ '=B4&" "&B5&" unless stated; costs shown as negatives"' ↵`, requires: ['single-source-line', 'concatenate-amp', 'go-to', 'sheet-reference'], convention: 'C5',
      hintStuck: 'pulse cell B17 · Currency, a space, units, then the words.',
      check: (s, ses) => builtOnce(inputs(ses)) && settled(ses) },
    { id: 'pnl-reads', text: 'Point P&L!A2 at it with =Inputs!B17, so the typed units line goes.', keys: `Ctrl+G "'P&L'!A2" ↵ "=Inputs!B17" ↵`, requires: ['single-source-line', 'cross-sheet-ref', 'go-to', 'sheet-reference'], convention: 'B4',
      hintStuck: 'pulse cell A2 · The italic stays; only the content changes.',
      check: (s, ses) => reads(ses, 'P&L') && settled(ses) },
    { id: 'monthly-reads', text: 'Do the same in Monthly!A2: =Inputs!B17.', keys: 'Ctrl+G "Monthly!A2" ↵ "=Inputs!B17" ↵', requires: ['single-source-line', 'go-to', 'sheet-reference'],
      hintStuck: 'pulse cell A2 · Under the title, as on the P&L.',
      check: (s, ses) => reads(ses, 'Monthly') && settled(ses) },
    { id: 'print-reads', text: 'In Print!A2 enter =Inputs!B17 and set it in italic with Ctrl+I, like the other two.', keys: 'Ctrl+G "Print!A2" ↵ "=Inputs!B17" ↵ ↑ Ctrl+I', requires: ['single-source-line', 'bold-italic-underline', 'go-to', 'sheet-reference', 'arrow-keys'],
      hintStuck: 'pulse cell A2 · Print had no units line until now.',
      check: (s, ses) => reads(ses, 'Print') && settled(ses) },
    { id: 'try-millions', text: 'On Inputs, type millions into B5, read the three units lines, then put thousands back with Ctrl+Z.', keys: 'Ctrl+G "Inputs!B5" ↵ "millions" ↵ Ctrl+Z', requires: ['undo-redo', 'go-to', 'sheet-reference'],
      hintStuck: 'pulse cell B5 · Ctrl+Z puts thousands back.',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && used(ses, 'Ctrl+Z') && sh.value('B5') === 'thousands' && allRead(ses) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!B4" Enter "EUR" Enter Ctrl+G "Print!A2" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch Inputs!B4 change to EUR, and the units line on all three pages change with it.', requires: [],
      hintStuck: 'pulse cell A2 · One cell on Inputs, three pages.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Inputs B17 builds the units line from the currency and the units', check: (s, ses) => builtOnce(inputs(ses)) },
    { text: 'The P&L, Monthly and Print all read it in A2, in italic', check: (s, ses) => allRead(ses) },
    { text: 'Inputs B5 reads thousands', check: (s, ses) => { const sh = inputs(ses); return !!sh && sh.value('B5') === 'thousands'; } },
  ],
  closing: [
    'The header block reads Inputs, and the page can’t disagree with itself.',
    'The title, the period line, the FY labels and now the units line all come from Inputs and the timeline. Change the company, the year, the currency or the units in one cell and every page says so.',
  ],
  solution: `Ctrl+G "Inputs!B17" Enter '=B4&" "&B5&" unless stated; costs shown as negatives"' Enter Ctrl+G "'P&L'!A2" Enter "=Inputs!B17" Enter Ctrl+G "Monthly!A2" Enter "=Inputs!B17" Enter Ctrl+G "Print!A2" Enter "=Inputs!B17" Enter Up Ctrl+I Ctrl+G "Inputs!B5" Enter "millions" Enter Ctrl+Z`,
};
