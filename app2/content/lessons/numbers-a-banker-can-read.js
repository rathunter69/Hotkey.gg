// Chapter 1 · 1.5.1 — Numbers a banker can read (clearcoat-weekly, S4c → S5a)
// The Report's figures are typed the way the feed sent them: stray decimals, no thousands
// separators, no $ anywhere. Format Cells (Ctrl+1) sets the desk number format from its Number
// tab (Number, 0 decimals, the separator, (1,234): the code #,##0_);(#,##0)); F4 repeats the
// whole dialog visit on the next block, Paste Special Formats repeats it once F4 has moved on;
// the chords Ctrl+Shift+4 and 5 dress the per-unit and percent lines, and Ctrl+Shift+1 with
// Alt H 9 twice leaves Excel's #,##0 on the daily block, a line of counts that never goes
// negative. Nothing on the sheet changes but how it reads; the closer perturbs Cedar Park's
// washes and the Total answers in its new dress. Every check reads the cell's format code, so any
// route to the same code passes (the dialog, F4, Paste Formats, a custom code typed by hand).
import { cellFormatCode, isDeskNumberFormat } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1, r2) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2; r++) out.push(String.fromCharCode(c) + r); return out; };
/** The desk number format on every cell (an empty cell counts: the format waits for its figure). */
const desk = (sh, refs) => refs.every(ref => isDeskNumberFormat(cellFormatCode(sh.cellAt(ref))));
/** A counts format on every cell: #,##0 (Ctrl+Shift+1 then Alt H 9 twice), or the desk number format. */
const countsFmt = (sh, refs) => refs.every(ref => isDeskNumberFormat(cellFormatCode(sh.cellAt(ref)), { countsOk: true }));
/** Every cell in `refs` carries the built-in style with `dec` decimals. */
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });

const WASHES = span('C', 'C', 5, 11);                    // the wash counts, Total included
const MONEY = span('D', 'F', 5, 11);                     // Revenue, Wash cost, Gross profit: the three money columns
const DOLLAR_ROWS = ['D5', 'E5', 'F5', 'D11', 'E11', 'F11', 'I5'];   // D4: $ on the first and total rows only
const MONEY_MIDDLE = MONEY.filter(ref => !DOLLAR_ROWS.includes(ref));
const PRIOR = span('I', 'I', 6, 10);                     // Prior week rev below its first row (I9 is Cedar Park's, empty this week)
const AVG_TICKET = span('G', 'G', 5, 11);
const MARGIN = span('H', 'H', 5, 11);
const DAILY = span('B', 'G', 17, 21);                    // the daily table's thirty count cells
const moneyRead = sh => desk(sh, MONEY_MIDDLE) && fmtIs(sh, DOLLAR_ROWS, 'currency', 0);

export default {
  id: 'numbers-a-banker-can-read',
  chapter: 'foundations',
  section: 'Format',
  module: 'format',
  workbook: 'clearcoat-weekly',
  state: { before: 'S4c', after: 'S5a' },
  title: 'Numbers a banker can read',
  difficulty: 'medium',
  tags: ['format', 'number-formats', 'report'],
  access: 'free',
  minutes: 7,
  headline: 'Ctrl+1',
  conventions: ['D1', 'D2', 'D4'],
  teaches: ['number-formats', 'format-cells-tabs', 'f4-repeat'],
  uses: ['format-cells-dialog', 'paste-special', 'copy-cut-paste', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'arrow-keys', 'sheet-tabs'],
  prerequisites: ['hide-group-freeze'],
  brief: 'The Report’s figures are typed the way the feed sent them, with stray decimals and no thousands separators, and a reader who has to squint at 18439.2 in a total stops trusting the page. Format Cells (Ctrl+1) sets the desk number format (a thousands separator, no decimals and a negative in parentheses) from the Number category on its Number tab. The chords Ctrl+Shift+1, 4 and 5 apply Number, Currency and Percent in one press, and Alt, H, 9 and 0 take a decimal off and put one on. The key is `Ctrl+1`.',
  macNote: 'Some Mac and non-US regional settings don’t list the (1,234) choice under Negative numbers. There, choose Custom at the bottom of the Category list and type #,##0_);(#,##0) into the Type box: it’s the same format, written out by hand.',
  goals: [
    { id: 'washes-desk', teach: 'A number format changes how a value shows, not the value itself. Format Cells (Ctrl+1) opens with the keyboard on its row of tabs, where N is the Number tab; Tab steps into the Category list, and there N picks Number with its three settings: Decimal places, Use 1000 Separator and Negative numbers. Set 0, tick the separator and pick (1,234): that’s the desk number format, which Excel stores as the code #,##0_);(#,##0), and every dollar figure and every check in this course carries it.',
      text: 'Select the wash counts C5:C11, Total included, and set the desk number format in Ctrl+1: Number, no decimals, the separator, (1,234).',
      hintStuck: 'pulse the Format Cells dialog · Select C5:C11; Ctrl+1; N for the Number tab; Tab, then N for Number; Decimal places 0; tick Use 1000 Separator; pick (1,234) under Negative numbers; Enter.',
      keys: 'Ctrl+↓ ×2 ↓ → ×2 Ctrl+Shift+↓ Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵', requires: ['number-formats', 'format-cells-tabs', 'format-cells-dialog', 'ctrl-shift-arrow', 'ctrl-arrow', 'arrow-keys'], convention: 'D2',
      check: (s, ses) => { const sh = report(ses); return !!sh && desk(sh, WASHES) && settled(ses); } },
    { id: 'money-f4', teach: 'F4 repeats your last action, and a whole trip through Format Cells counts as one action, so the desk number format lands on the new block in one press. It shows a negative in parentheses, which is the convention: never a leading minus on a page. Alt, H, 9 takes a decimal off and Alt, H, 0 puts one on, for the lines that need them.',
      text: 'Revenue, Wash cost and Gross profit D5:F11 take the same format: select them and press F4, so a loss would read in parentheses.',
      hintStuck: 'pulse cells D5:F11 · Select D5:F11 straight after goal 1, then one F4; if another action came between, Ctrl+1 and the same three settings.',
      keys: '→ Ctrl+Shift+↓ Shift+→ ×2 F4', requires: ['f4-repeat', 'number-formats', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'], convention: 'D1',
      check: (s, ses) => { const sh = report(ses); return !!sh && desk(sh, WASHES) && desk(sh, MONEY) && settled(ses); } },
    { id: 'dollar-rows', teach: 'The currency sign sits on the first row and the total row of a money column, and nowhere in between. A page full of $ is noise. In Ctrl+1 the same steps reach Currency (N, Tab, then C) with decimals at 0 and ($1,234) under Negative numbers, so a loss on a $ row reads in parentheses like the rows between.',
      text: 'The $ goes on a money column’s first and total rows only: make D5:F5, D11:F11 and Prior week’s I5 currency with no decimals in Ctrl+1.',
      hintStuck: 'pulse cells D5:F5 · Select D5:F5; Ctrl+1; N, Tab, C; decimals 0; ($1,234); Enter; F4 on D11:F11 and on I5.',
      keys: '← → Shift+→ ×2 Ctrl+1 N Tab C Alt+D 0 ↵ Ctrl+↓ Shift+→ ×2 F4 Ctrl+↑ Ctrl+→ ↓ F4', requires: ['format-cells-tabs', 'number-formats', 'f4-repeat', 'format-cells-dialog', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'], convention: 'D4',
      check: (s, ses) => { const sh = report(ses); return !!sh && moneyRead(sh) && settled(ses); } },
    { id: 'prior-week', teach: 'Format the whole span, empty cells included, so a figure typed later comes out right. The $ stays on I5 above; the body takes the desk number format, and once another action has taken F4’s place, Paste Special Formats (1.3.4) from a cell that carries it is the repeat.',
      text: 'Prior week rev I6:I10 gets the desk number format by Paste Formats from D6, Cedar Park’s empty I9 included, while I5 keeps the column’s $.',
      hintStuck: 'pulse cells I6:I10 · Copy D6; select I6:I10; Ctrl+Alt+V, T, Enter.',
      keys: '↓ Ctrl+← ← Ctrl+C Ctrl+→ ×2 Shift+↓ ×4 Ctrl+Alt+V T ↵', requires: ['number-formats', 'paste-special', 'copy-cut-paste', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && desk(sh, PRIOR) && fmtIs(sh, ['I5'], 'currency', 0) && settled(ses); } },
    { id: 'avg-ticket', teach: 'Ctrl+Shift+4 is currency with two decimals in one press, right for a per-unit figure like a ticket price. Selecting from the bottom with Ctrl+Shift+↑ runs to the header; Shift+↓ steps back off it.',
      text: 'Avg ticket ($/wash) shows cents: select G5:G11 from the bottom, Ctrl+Shift+↑ then Shift+↓ off the header, then currency, Ctrl+Shift+4.',
      hintStuck: 'pulse cells G5:G11 · Land on G11, Ctrl+Shift+↑, Shift+↓; Ctrl+Shift+4.',
      keys: 'Ctrl+← Ctrl+↓ → ×2 Ctrl+Shift+↑ Shift+↓ Ctrl+Shift+4', requires: ['number-formats', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, AVG_TICKET, 'currency', 2) && sh.cellAt('G4').fmtStyle !== 'currency' && settled(ses); } },
    { id: 'margin-pct', teach: 'Ctrl+Shift+5 is percent with no decimals; Alt, H, 0 adds one. One decimal on a percentage is the convention: 41.2%, not 41% and not 41.23%.',
      text: 'Margin % H5:H11 reads as a percentage to one decimal: select it the same way, Ctrl+Shift+5 for percent, then Alt, H, 0 for the decimal.',
      hintStuck: 'pulse cells H5:H11 · Land on H11, Ctrl+Shift+↑, Shift+↓; Ctrl+Shift+5; Alt, H, 0.',
      keys: '→ Ctrl+Shift+↑ Shift+↓ Ctrl+Shift+5 Alt H 0', requires: ['number-formats', 'ctrl-shift-arrow', 'shift-arrow', 'arrow-keys'], convention: 'D2',
      check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, MARGIN, 'percent', 1) && fmtIs(sh, AVG_TICKET, 'currency', 2) && settled(ses); } },
    { id: 'daily-block', teach: 'Ctrl+Shift+1 applies Number with a thousands separator and two decimals in one press, and Alt, H, 9 takes a decimal off. It shows a negative with a minus sign, so keep it for counts that can’t go below zero, like washes; dollar lines and checks take the desk number format. Format the block before the figures arrive and every link that lands there comes out right.',
      text: 'The daily table B17:G21 will hold thirty wash counts: format the whole block at once with Ctrl+Shift+1, then Alt, H, 9 twice.',
      hintStuck: 'pulse cells B17:G21 · Land on B17, Shift+→ five times, Shift+↓ four times; Ctrl+Shift+1; Alt, H, 9 twice.',
      keys: 'Ctrl+← Ctrl+↓ ×2 ↓ Ctrl+← → Shift+→ ×5 Shift+↓ ×4 Ctrl+Shift+1 Alt H 9 Alt H 9', requires: ['number-formats', 'shift-arrow', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && countsFmt(sh, DAILY) && ['B16', 'G16', 'B15', 'A17'].every(ref => (sh.cellAt(ref).fmtStyle || 'general') === 'general') && settled(ses); } },
    { id: 'cost-cents', teach: 'A per-unit input keeps the decimals it’s quoted to. $1.50, not $2 and not $1.5000.',
      text: 'On Inputs, the cost per wash B4 is quoted to the cent: currency with two decimals, Ctrl+Shift+4.',
      hintStuck: 'pulse cell B4 on Inputs · Ctrl+PgDn to Inputs, B4, Ctrl+Shift+4.',
      keys: 'Ctrl+PgDn ×2 ↓ ×3 Tab Ctrl+Shift+4', requires: ['number-formats', 'sheet-tabs', 'arrow-keys'],
      check: (s, ses) => { const sh = inputs(ses); return !!sh && fmtIs(sh, ['B4'], 'currency', 2) && sh.value('B4') === 1.5 && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "300" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 },
      teach: 'The format rides on the cell; the value moves underneath it. Change an input, and the total updates in the format you set.',
      text: 'Does it tie? Change Cedar Park’s washes in C9 to 300 and watch the Total in C11 answer, thousands separator and all.',
      hintStuck: 'pulse cell C11 on Report · Ctrl+PgUp to Report; C9, 300, Enter.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C5:F11 and I6:I10 carry the desk number format', check: (s, ses) => { const sh = report(ses); return !!sh && desk(sh, WASHES) && desk(sh, MONEY_MIDDLE) && desk(sh, PRIOR); } },
    { text: 'The $ sits on the first and total rows of the money columns only', check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, DOLLAR_ROWS, 'currency', 0); } },
    { text: 'Avg ticket shows cents, Margin % one decimal, the daily block a thousands separator with no decimals', check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, AVG_TICKET, 'currency', 2) && fmtIs(sh, MARGIN, 'percent', 1) && countsFmt(sh, DAILY); } },
    { text: 'The cost per wash on Inputs reads to the cent as currency', check: (s, ses) => { const sh = inputs(ses); return !!sh && fmtIs(sh, ['B4'], 'currency', 2); } },
  ],
  wow: 'Every figure has its commas, its decimals and its $ where they belong, and one format runs down each line.',
  closing: [
    'Every figure on the Report now reads the way a banker formats it: one decimals setting down each line, the $ on the first and total rows only, negatives in parentheses by style rather than a leading minus. Ctrl+1 set the desk number format once, F4 and Paste Formats repeated it, and the chords did the counts, the currency and the percent in one press each.',
    'Top-bucket tip: percentages to one decimal, currency to none, per-unit figures to two, and never mix decimals down a column.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Right Ctrl+Shift+Down Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N Down Down Enter Right Ctrl+Shift+Down Shift+Right Shift+Right F4 Left Right Shift+Right Shift+Right Ctrl+1 N Tab C Alt+D 0 Enter Ctrl+Down Shift+Right Shift+Right F4 Ctrl+Up Ctrl+Right Down F4 Down Ctrl+Left Left Ctrl+C Ctrl+Right Ctrl+Right Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+Alt+V T Enter Ctrl+Left Ctrl+Down Right Right Ctrl+Shift+Up Shift+Down Ctrl+Shift+4 Right Ctrl+Shift+Up Shift+Down Ctrl+Shift+5 Alt H 0 Ctrl+Left Ctrl+Down Ctrl+Down Down Ctrl+Left Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+Shift+1 Alt H 9 Alt H 9 Ctrl+PgDn Ctrl+PgDn Down Down Down Tab Ctrl+Shift+4',
};
