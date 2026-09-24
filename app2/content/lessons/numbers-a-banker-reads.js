// Chapter 1 · 1.5.1 — Numbers a banker can read (voltline-weekly, S4c → S5a)
// The Report's figures are typed the way the feed sent them: stray decimals, no thousands
// separators, no $ anywhere. Format Cells (Ctrl+1) does every number format from one dialog, and
// the shortcut chords (Ctrl+Shift+1 / 4 / 5, then Alt H 9 / 0 for the decimals) does the same in one
// press: comma style down every figure column, $ on the first and total rows only, cents on the
// average price, one decimal on the margin, three on the wholesale price. Nothing on the sheet
// changes but how it reads; the closer perturbs Cedar Park's kWh and the Total answers in its new
// dress. Negatives read in parentheses by style, never a leading minus (D1).
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const inputs = ses => sheetOf(ses, 'Inputs');
const settled = ses => !ses.editing && !ses.dialog;

/** A1-style refs for a rectangular block, column letters inclusive. */
const span = (col1, col2, r1, r2) => { const out = []; for (let c = col1.charCodeAt(0); c <= col2.charCodeAt(0); c++) for (let r = r1; r <= r2; r++) out.push(String.fromCharCode(c) + r); return out; };
/** Every cell in `refs` carries the number format `style` with `dec` decimals (an empty cell counts: the format waits for its figure). */
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });

const KWH = span('C', 'C', 5, 11);                       // kWh sold, Total included
const MONEY = span('D', 'F', 5, 11);                     // Revenue, Energy cost, Gross profit: the three money columns
const DOLLAR_ROWS = ['D5', 'E5', 'F5', 'D11', 'E11', 'F11', 'I5'];   // D4: $ on the first and total rows only
const MONEY_MIDDLE = MONEY.filter(ref => !DOLLAR_ROWS.includes(ref));
const PRIOR = span('I', 'I', 6, 10);                     // Prior week rev below its first row (I9 is Cedar Park's, empty this week)
const AVG_PRICE = span('G', 'G', 5, 11);
const MARGIN = span('H', 'H', 5, 11);
const DAILY = span('B', 'G', 17, 21);                    // the daily table's thirty figure cells
const moneyRead = sh => fmtIs(sh, MONEY_MIDDLE, 'comma', 0) && fmtIs(sh, DOLLAR_ROWS, 'currency', 0);

export default {
  id: 'numbers-a-banker-reads',
  chapter: 'foundations',
  section: 'Format',
  module: 'format',
  workbook: 'voltline-weekly',
  state: { before: 'S4c', after: 'S5a' },
  title: 'Numbers a banker can read',
  difficulty: 'medium',
  tags: ['format', 'number-formats', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Ctrl+1',
  conventions: ['D1', 'D2', 'D4'],
  teaches: ['number-formats', 'format-cells-tabs'],
  uses: ['format-cells-dialog', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow', 'home-key', 'go-to', 'sheet-reference'],
  prerequisites: ['hide-group-freeze'],
  brief: 'The Report’s figures are typed the way the feed sent them, with stray decimals and no thousands separators, and a reader who has to squint at 18439.2 in a total stops trusting the page. Format Cells gives every figure the format the team uses, from one dialog, and the shortcut chords, Ctrl+Shift+1, 4 and 5, do the same in one press. The key is `Ctrl+1`.',
  goals: [
    { id: 'kwh-comma', teach: 'A number format changes how a value shows, not the value itself: Ctrl+1 opens Format Cells, whose categories answer to their first letter, N Number, C Currency, P Percentage.', text: 'Select the kWh sold figures C5:C11, Total included, and give them thousands separators with no decimals: Ctrl+1, then N.', keys: 'Ctrl+↓ ×2 ↓ → ×2 Ctrl+Shift+↓ then Ctrl+1 N', requires: ['number-formats', 'format-cells-tabs', 'format-cells-dialog', 'ctrl-shift-arrow', 'ctrl-arrow'], convention: 'D2',
      check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, KWH, 'comma', 0) && settled(ses); } },
    { id: 'money-chord', text: 'Give Revenue, Energy cost and Gross profit D5:F11 comma style in one press with Ctrl+Shift+1, then Alt H 9 twice: negatives will read in parentheses.', keys: '→ Ctrl+Shift+↓ Shift+→ ×2 Ctrl+Shift+1 then Alt H 9 Alt H 9', requires: ['number-formats', 'ctrl-shift-arrow', 'shift-arrow'], convention: 'D1',
      check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, KWH, 'comma', 0) && fmtIs(sh, MONEY, 'comma', 0) && settled(ses); } },
    { id: 'dollar-rows', text: 'The $ goes on a money column’s first and total rows only: make D5:F5, D11:F11 and Prior week’s I5 currency with no decimals, Ctrl+1 then C.', keys: 'Ctrl+← → ×3 Shift+→ ×2 Ctrl+1 C then Ctrl+↓ Shift+→ ×2 Ctrl+1 C then Ctrl+↑ Ctrl+→ ↓ Ctrl+1 C', requires: ['format-cells-tabs', 'number-formats', 'ctrl-arrow', 'shift-arrow'], convention: 'D4',
      check: (s, ses) => { const sh = report(ses); return !!sh && moneyRead(sh) && settled(ses); } },
    { id: 'prior-week', text: 'Prior week rev I6:I10 gets thousands separators with no decimals, Cedar Park’s empty I9 included, while I5 keeps the column’s $.', keys: '↓ Ctrl+Shift+↓ Shift+↓ ×2 Ctrl+1 N', requires: ['number-formats', 'ctrl-shift-arrow', 'shift-arrow'],
      check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, PRIOR, 'comma', 0) && fmtIs(sh, ['I5'], 'currency', 0) && settled(ses); } },
    { id: 'avg-price', text: 'Avg price ($/kWh) shows cents: select G5:G11 from the bottom, Ctrl+Shift+↑ then Shift+↓ to let go of the header, and give it currency with Ctrl+Shift+4.', keys: 'Ctrl+↓ ×2 ↓ ← ×2 Ctrl+Shift+↑ Shift+↓ Ctrl+Shift+4', requires: ['number-formats', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-arrow'],
      check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, AVG_PRICE, 'currency', 2) && sh.cellAt('G4').fmtStyle !== 'currency' && settled(ses); } },
    { id: 'margin-pct', text: 'Margin % H5:H11 reads as a percentage to one decimal: select it the same way, Ctrl+Shift+5 for percent, then Alt H 0 for the decimal.', keys: '→ Ctrl+Shift+↑ Shift+↓ Ctrl+Shift+5 then Alt H 0', requires: ['number-formats', 'ctrl-shift-arrow', 'shift-arrow'],
      check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, MARGIN, 'percent', 1) && fmtIs(sh, AVG_PRICE, 'currency', 2) && settled(ses); } },
    { id: 'daily-block', text: 'The daily table B17:G21 will hold thirty kWh figures: format the whole block at once, comma style with Ctrl+Shift+1, then Alt H 9 twice.', keys: 'Home Ctrl+↓ ×2 → Ctrl+↑ ↓ Shift+↓ ×4 Shift+→ ×5 Ctrl+Shift+1 then Alt H 9 Alt H 9', requires: ['number-formats', 'shift-arrow', 'ctrl-arrow', 'home-key'],
      check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, DAILY, 'comma', 0) && ['B16', 'G16', 'B15'].every(ref => sh.cellAt(ref).fmtStyle === 'general') && settled(ses); } },
    { id: 'wholesale-price', text: 'On Inputs, the wholesale energy price B4 is quoted to the tenth of a cent: currency with Ctrl+Shift+4, then Alt H 0 for the third decimal.', keys: 'Ctrl+G "Inputs!B4" ↵ Ctrl+Shift+4 then Alt H 0', requires: ['number-formats', 'go-to', 'sheet-reference'],
      check: (s, ses) => { const sh = inputs(ses); return !!sh && fmtIs(sh, ['B4'], 'currency', 3) && sh.value('B4') === 0.13 && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "3000" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Cedar Park’s kWh in C9 change to 3,000 and the Total in C11 answer, thousands separator and all.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C5:F11 and I6:I10 read with thousands separators and no decimals', check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, KWH, 'comma', 0) && fmtIs(sh, MONEY_MIDDLE, 'comma', 0) && fmtIs(sh, PRIOR, 'comma', 0); } },
    { text: 'The $ sits on the first and total rows of the money columns only', check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, DOLLAR_ROWS, 'currency', 0); } },
    { text: 'Avg price shows cents, Margin % one decimal, the daily block comma style', check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, AVG_PRICE, 'currency', 2) && fmtIs(sh, MARGIN, 'percent', 1) && fmtIs(sh, DAILY, 'comma', 0); } },
    { text: 'The wholesale price on Inputs reads to three decimals as currency', check: (s, ses) => { const sh = inputs(ses); return !!sh && fmtIs(sh, ['B4'], 'currency', 3); } },
  ],
  closing: [
    'Every figure on the Report now reads the way the team formats it: one decimals setting down each line (D2), the $ on the first and total rows only (D4), and negatives in parentheses by style, never a leading minus (D1).',
    'Ctrl+1 did all of it from one dialog, and the shortcut chords, Ctrl+Shift+1, 4 and 5 with Alt H 9 and 0 for the decimals, did the same in one press; Cedar Park’s kWh still moves the Total.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Right Ctrl+Shift+Down Ctrl+1 N Right Ctrl+Shift+Down Shift+Right Shift+Right Ctrl+Shift+1 Alt H 9 Alt H 9 Ctrl+Left Right Right Right Shift+Right Shift+Right Ctrl+1 C Ctrl+Down Shift+Right Shift+Right Ctrl+1 C Ctrl+Up Ctrl+Right Down Ctrl+1 C Down Ctrl+Shift+Down Shift+Down Shift+Down Ctrl+1 N Ctrl+Down Ctrl+Down Down Left Left Ctrl+Shift+Up Shift+Down Ctrl+Shift+4 Right Ctrl+Shift+Up Shift+Down Ctrl+Shift+5 Alt H 0 Home Ctrl+Down Ctrl+Down Right Ctrl+Up Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Ctrl+Shift+1 Alt H 9 Alt H 9 Ctrl+G "Inputs!B4" Enter Ctrl+Shift+4 Alt H 0',
};
