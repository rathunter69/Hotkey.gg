// Chapter 2 · 2.6.3 Dynamic titles with & (clearcoat-pnl, S6b → S6c)
// The & joins text to text, so a title can be built from cells. P&L!A1, Monthly!A1 and Print!A1
// read the company name on Inputs!B3 (Print's title takes the P&L title's formats by Paste
// Special Formats first), and Print's period line goes in B4, over its labels, from the first and
// last year ends (bold and green). F2 reads one back. The closer renames the company on Inputs.
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const monthly = ses => sheetOf(ses, 'Monthly');
const print = ses => sheetOf(ses, 'Print');
const settled = ses => !ses.editing && !ses.dialog;
const used = (ses, label) => ses.keyLog.slice(ses.goalMark || 0).some(e => e.k === label);
const fx = (sh, ref, rx) => { const c = sh.cellAt(ref); return !!c.formula && rx.test(c.formula.replace(/\s+/g, '').toUpperCase()); };
const readsName = (sh, ref, title) => !!sh && sh.value(ref) === title && fx(sh, ref, /INPUTS!\$?B\$?3&/);
const titleDressed = sh => { const c = sh.cellAt('A1'); return c.bold === true && c.fsz === 16 && c.ca === 5; };
const PERIOD = 'Fiscal years 2024 to 2026';
const periodLine = sh => !!sh && sh.value('B4') === PERIOD && fx(sh, 'B4', /TEXT\('P&L'!\$?C\$?4,"YYYY"\)/);

export default {
  id: 'dynamic-titles',
  chapter: 'formatting',
  section: 'Dates and text for presentation',
  module: 'dates-and-text-for-presentation',
  workbook: 'clearcoat-pnl',
  state: { before: 'S6b', after: 'S6c' },
  title: 'Dynamic titles with &',
  difficulty: 'medium',
  tags: ['formula', 'text', 'titles'],
  access: 'paid',
  minutes: 6,
  headline: '&',
  conventions: ['B4', 'G2'],
  teaches: ['dynamic-title'],
  uses: ['concatenate-amp', 'text-function', 'cross-sheet-ref', 'paste-special', 'copy-cut-paste', 'bold-italic-underline', 'font-color', 'link-colour-convention', 'edit-mode-f2', 'go-to', 'sheet-reference', 'arrow-keys'],
  prerequisites: ['eomonth-edate'],
  brief: 'The & joins text to text, so a title can be built from cells: the company name on Inputs, the statement name, the period from the timeline. Change the name once and every page’s title follows. Build the P&L, Monthly and Print titles from Inputs, and a period line that reads the first and last year ends. The key is `&`.',
  goals: [
    { id: 'pnl-title', teach: 'A title typed on every page goes wrong one page at a time. Built with &, it reads the company name from the one cell on Inputs, and the formats on A1 stay as they were.', text: 'In P&L!A1 join Inputs!B3 to the words Historical Financials with &, and see the title still center across A1:E1.', keys: `'=Inputs!B3&" - Historical Financials"' ↵`, requires: ['dynamic-title', 'concatenate-amp', 'cross-sheet-ref'], convention: 'B4',
      hintStuck: 'pulse cell A1 · The text in quotes keeps its spaces.',
      check: (s, ses) => { const sh = pnl(ses); return readsName(sh, 'A1', 'Clearcoat Express - Historical Financials') && sh.cellAt('A1').ca === 5 && settled(ses); } },
    { id: 'monthly-title', text: 'In Monthly!A1 join Inputs!B3 to the words FY26 by month with & in the same way.', keys: `Ctrl+G "Monthly!A1" ↵ '=Inputs!B3&" - FY26 by month"' ↵`, requires: ['dynamic-title', 'go-to', 'sheet-reference'],
      hintStuck: 'pulse cell A1 · The same name, a different statement.',
      check: (s, ses) => readsName(monthly(ses), 'A1', 'Clearcoat Express - FY26 by month') && settled(ses) },
    { id: 'print-formats', text: 'Copy P&L!A1 and paste its formats onto Print!A1 with Ctrl+Alt+V, T.', keys: `Ctrl+G "'P&L'!A1" ↵ Ctrl+C Ctrl+G "Print!A1" ↵ Ctrl+Alt+V T ↵`, requires: ['paste-special', 'copy-cut-paste', 'go-to', 'sheet-reference'],
      hintStuck: 'pulse cell A1 · Formats only: bold, the size and the centering.',
      check: (s, ses) => { const sh = print(ses); return !!sh && titleDressed(sh) && settled(ses); } },
    { id: 'print-title', text: 'In Print!A1 join Inputs!B3 to the words Summary financials with &.', keys: `'=Inputs!B3&" - Summary financials"' ↵`, requires: ['dynamic-title'],
      hintStuck: 'pulse cell A1 · Type straight over the formatted cell.',
      check: (s, ses) => { const sh = print(ses); return readsName(sh, 'A1', 'Clearcoat Express - Summary financials') && titleDressed(sh) && settled(ses); } },
    { id: 'period-line', teach: 'TEXT with yyyy writes a year end as its year, and & strings the words around it, so the line can never name the wrong years.', text: `In Print!B4 build the line Fiscal years 2024 to 2026 with & from TEXT('P&L'!C4,"yyyy") and TEXT('P&L'!E4,"yyyy").`, keys: `↓ ×2 → '="Fiscal years "&TEXT(' "'P&L'!C4" ',"yyyy")&" to "&TEXT(' "'P&L'!E4" ',"yyyy")' ↵`, requires: ['concatenate-amp', 'text-function', 'arrow-keys'], convention: 'G2',
      hintStuck: 'pulse cell B4 · Two TEXTs, one for each end of the timeline.',
      check: (s, ses) => periodLine(print(ses)) && settled(ses) },
    { id: 'period-dress', text: 'Make B4 bold and color it green, since it reads the P&L.', keys: '↑ Ctrl+B Alt H F C → ×8 ↵', requires: ['bold-italic-underline', 'font-color', 'link-colour-convention', 'arrow-keys'], convention: 'B2',
      hintStuck: 'pulse cell B4 · Green is the eighth step along the font colors.',
      check: (s, ses) => { const sh = print(ses); return !!sh && periodLine(sh) && sh.cellAt('B4').bold === true && sh.cellAt('B4').fontColor === 'green' && settled(ses); } },
    { id: 'read-back', text: 'Read B4 back with F2, follow its pieces, and leave it with Esc.', keys: 'F2 Esc', requires: ['edit-mode-f2'],
      hintStuck: 'pulse cell B4 · Esc leaves the cell as it was.',
      check: (s, ses) => used(ses, 'F2') && settled(ses) && periodLine(print(ses)) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!B3" Enter "Clearcoat Express Holdings" Enter Ctrl+G "Print!A1" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch Inputs!B3 change to Clearcoat Express Holdings, and three titles change with it.', requires: [],
      hintStuck: 'pulse cell A1 · One name, three pages.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The P&L, Monthly and Print titles read the name on Inputs', check: (s, ses) => readsName(pnl(ses), 'A1', 'Clearcoat Express - Historical Financials') && readsName(monthly(ses), 'A1', 'Clearcoat Express - FY26 by month') && readsName(print(ses), 'A1', 'Clearcoat Express - Summary financials') },
    { text: 'Print B4 reads the years from the P&L’s timeline', check: (s, ses) => periodLine(print(ses)) },
  ],
  closing: [
    'Three titles read one source, so a name change is one edit.',
    'The & joins the name on Inputs to the words each page needs, and TEXT turns the year ends into the years the period line names. The day the book goes out under the holding company’s name, the pages say so without anyone retyping a title.',
  ],
  solution: `'=Inputs!B3&" - Historical Financials"' Enter Ctrl+G "Monthly!A1" Enter '=Inputs!B3&" - FY26 by month"' Enter Ctrl+G "'P&L'!A1" Enter Ctrl+C Ctrl+G "Print!A1" Enter Ctrl+Alt+V T Enter '=Inputs!B3&" - Summary financials"' Enter Down Down Right '="Fiscal years "&TEXT(' "'P&L'!C4" ',"yyyy")&" to "&TEXT(' "'P&L'!E4" ',"yyyy")' Enter Up Ctrl+B Alt H F C Right Right Right Right Right Right Right Right Enter F2 Escape`,
};
