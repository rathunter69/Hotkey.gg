// Chapter 2 · 2.6.1 TEXT for labels and headers (clearcoat-pnl, S5d → S6a)
// TEXT turns a value into words in a chosen format. Monthly's month names go in C5:N5 under its
// dates (=TEXT(C4,"mmmm yyyy"), filled right, italic and right-aligned), the book's FY labels in
// Print!C4:E4 from the P&L's dates and flags (="FY"&TEXT('P&L'!C4,"yy")&'P&L'!C5, bold, right,
// green), and the headline on Inputs!B19 quotes FY26E revenue with its comma. The closer flips
// the FY26 flag to A and Print's header follows.
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const monthly = ses => sheetOf(ses, 'Monthly');
const print = ses => sheetOf(ses, 'Print');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const COLS = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
const has = (sh, ref, rx) => { const c = sh.cellAt(ref); return !!c.formula && rx.test(c.formula.replace(/\s+/g, '').toUpperCase()); };
/** A month label: the TEXT of the date above it, live. */
const monthLabel = (sh, i) => sh.value(COLS[i] + '5') === `${MONTHS[i]} 2026` && has(sh, COLS[i] + '5', new RegExp(`TEXT\\(\\$?${COLS[i]}\\$?4,`));
const monthsLive = sh => !!sh && COLS.every((col, i) => monthLabel(sh, i));
const FY = ['FY24A', 'FY25A', 'FY26E'];
const fyLive = sh => !!sh && ['C', 'D', 'E'].every((col, i) => sh.value(col + '4') === FY[i] && has(sh, col + '4', /TEXT\('P&L'!/));
const fyDressed = sh => !!sh && ['C', 'D', 'E'].every(col => { const c = sh.cellAt(col + '4'); return c.bold === true && c.align === 'r' && c.fontColor === 'green'; });
const HEADLINE = 'Revenue of 50,000k in FY26E';

export default {
  id: 'text-for-labels',
  chapter: 'formatting',
  section: 'Dates and text for presentation',
  module: 'dates-and-text-for-presentation',
  workbook: 'clearcoat-pnl',
  state: { before: 'S5d', after: 'S6a' },
  title: 'TEXT for labels and headers',
  difficulty: 'medium',
  tags: ['formula', 'text', 'dates', 'headers'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['C2', 'B2'],
  teaches: ['text-function', 'concatenate-amp'],
  uses: ['custom-date-code', 'fill-down-right', 'bold-italic-underline', 'align-command', 'font-color', 'link-colour-convention', 'go-to', 'sheet-reference', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys', 'shift-arrow'],
  prerequisites: ['managing-rules'],
  brief: 'TEXT turns a value into words in a format you choose: =TEXT(C4,"mmm-yy") gives Jan-26 as text, and =TEXT(C10,"#,##0") gives 33,000 with its comma. A header built with TEXT reads from the date under it, so it can never disagree with it. Build Monthly’s month names from its dates, and the book’s FY labels from the P&L’s timeline and flags. The key is `=`.',
  goals: [
    { id: 'first-month', teach: 'TEXT(value, "code") writes a value through a format code and returns text: the codes are the ones you typed in the Custom box, so mmmm is the month in full and yyyy the year.', text: 'In Monthly!C5, under the first month end, enter =TEXT(C4,"mmmm yyyy") and read January 2026.', keys: `Ctrl+G "Monthly!C5" ↵ '=TEXT(C4,"mmmm yyyy")' ↵`, requires: ['text-function', 'custom-date-code', 'go-to', 'sheet-reference'], convention: 'C2',
      hintStuck: 'pulse cell C5 · The date sits right above it in C4.',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && monthLabel(sh, 0) && settled(ses); } },
    { id: 'fill-months', teach: 'Ctrl+Shift+← from N5 stops at the first filled cell, C5, so the selection runs C5:N5 and Ctrl+R fills it from the left.', text: 'Fill C5 right to N5 with Ctrl+R, one month name under each date.', keys: '↑ ×2 Ctrl+→ ← ↓ Ctrl+Shift+← Ctrl+R', requires: ['fill-down-right', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range C5:N5 · January to December, not the full year in O.',
      check: (s, ses) => monthsLive(monthly(ses)) && settled(ses) },
    { id: 'dress-months', text: 'With C5:N5 still selected, set the month names in italic with Ctrl+I and right-align them under the dates.', keys: 'Ctrl+I Alt H A R', requires: ['bold-italic-underline', 'align-command'],
      hintStuck: 'pulse range C5:N5 · Right-aligned, so each name sits over its column of figures.',
      check: (s, ses) => { const sh = monthly(ses); return !!sh && COLS.every(col => { const c = sh.cellAt(col + '5'); return c.it === true && c.align === 'r'; }) && settled(ses); } },
    { id: 'fy-label', teach: 'The & joins text to text: "FY", the two-digit year from TEXT, and the A or E flag under the date make FY24A. A sheet name with an & in it takes single quotes.', text: `In Print!C4 enter ="FY"&TEXT('P&L'!C4,"yy")&'P&L'!C5 and read FY24A.`, keys: `Ctrl+G "Print!C4" ↵ '="FY"&TEXT(' "'P&L'!C4" ',"yy")&' "'P&L'!C5" ↵`, requires: ['concatenate-amp', 'text-function', 'go-to', 'sheet-reference'], convention: 'C2',
      hintStuck: 'pulse cell C4 · Three pieces joined: the letters, the year, the flag.',
      check: (s, ses) => { const sh = print(ses); return !!sh && sh.value('C4') === FY[0] && has(sh, 'C4', /TEXT\('P&L'!/) && settled(ses); } },
    { id: 'fy-fill', text: 'Fill C4 right to E4 with Ctrl+R to read FY24A, FY25A, FY26E.', keys: '↑ Shift+→ ×2 Ctrl+R', requires: ['fill-down-right', 'shift-arrow'],
      hintStuck: 'pulse range C4:E4 · The references move one column with each cell.',
      check: (s, ses) => fyLive(print(ses)) && settled(ses) },
    { id: 'fy-dress', text: 'Make C4:E4 bold and right-aligned, and color them green: they read another sheet.', keys: 'Ctrl+B Alt H A R Alt H F C → ×8 ↵', requires: ['bold-italic-underline', 'align-command', 'font-color', 'link-colour-convention'], convention: 'B2',
      hintStuck: 'pulse range C4:E4 · Green is the eighth step along the font colors.',
      check: (s, ses) => fyDressed(print(ses)) && settled(ses) },
    { id: 'headline', text: `In Inputs!B19 build the headline Revenue of 50,000k in FY26E with & and TEXT('P&L'!E10,"#,##0"), and color it green.`, keys: `Ctrl+G "Inputs!B19" ↵ '="Revenue of "&TEXT(' "'P&L'!E10" ',"#,##0")&"k in FY26E"' ↵ ↑ Alt H F C → ×8 ↵`, requires: ['text-function', 'concatenate-amp', 'font-color', 'go-to', 'sheet-reference'], convention: 'B2',
      hintStuck: 'pulse cell B19 · TEXT keeps the comma that a plain & would drop.',
      check: (s, ses) => { const sh = inputs(ses); return !!sh && sh.value('B19') === HEADLINE && sh.cellAt('B19').fontColor === 'green' && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "'P&L'!E5" Enter "A" Enter Ctrl+G "Print!E4" Enter Escape`, cadence: 320 }, text: 'Does it tie? Watch the FY26 flag in P&L!E5 change to A, and the header in Print!E4 read FY26A.', requires: [],
      hintStuck: 'pulse cell E4 · The header reads the flag, so it follows it.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Monthly C5:N5 name the months from the dates above them', check: (s, ses) => monthsLive(monthly(ses)) },
    { text: 'Print C4:E4 read FY24A, FY25A, FY26E from the P&L, bold, right and green', check: (s, ses) => fyLive(print(ses)) && fyDressed(print(ses)) },
    { text: 'Inputs B19 reads the headline from the P&L', check: (s, ses) => { const sh = inputs(ses); return !!sh && sh.value('B19') === HEADLINE; } },
  ],
  closing: [
    'The header reads the date under it, so they can never disagree.',
    'TEXT writes a number or a date as words through the same codes as the Custom box, and & joins the pieces. Every label on the page that names a period now comes from the timeline, so the day the dates move, the words move with them.',
  ],
  solution: `Ctrl+G "Monthly!C5" Enter '=TEXT(C4,"mmmm yyyy")' Enter Up Up Ctrl+Right Left Down Ctrl+Shift+Left Ctrl+R Ctrl+I Alt H A R Ctrl+G "Print!C4" Enter '="FY"&TEXT(' "'P&L'!C4" ',"yy")&' "'P&L'!C5" Enter Up Shift+Right Shift+Right Ctrl+R Ctrl+B Alt H A R Alt H F C Right Right Right Right Right Right Right Right Enter Ctrl+G "Inputs!B19" Enter '="Revenue of "&TEXT(' "'P&L'!E10" ',"#,##0")&"k in FY26E"' Enter Up Alt H F C Right Right Right Right Right Right Right Right Enter`,
};
