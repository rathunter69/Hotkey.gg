// Foundations 7 — Dialog boxes
const START = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true, align: 'c' }, C2: { value: 'Growth', bold: true, align: 'c' },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 0.05 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: -0.12 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 0.21 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 0.08 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 0.15 },
  A8: { value: 'Total', bold: true }, B8: { value: 6355, bold: true, bt: true },
};
const cell = (s, ref) => s.cellAt(ref);
const used = (session, label) => session.keyLog.some(e => e.k === label);

export default {
  id: 'foundations-07-dialog-boxes',
  chapter: 'foundations',
  title: 'Dialog boxes: Format Cells',
  difficulty: 'medium',
  tags: ['ribbon', 'formatting', 'number-formats'],
  access: 'free',
  concepts: ['dialog-box', 'format-cells-dialog', 'number-formats', 'ribbon-route-dialog'],
  prerequisites: ['foundations-06-ribbon-commands'],
  sheet: { cells: START, active: { r: 1, c: 1 } },
  steps: [
    { mode: 'teach', title: 'Commands that ask a question', body: [
      'Some commands do not act at once. They open a dialog box: a panel of choices that stays open until you confirm or cancel it. Format Cells is the dialog box you will use most.',
      '`Ctrl+1` opens Format Cells for the selected cells. Every option in it has a letter: `N` applies the Number format with a thousands separator, `C` applies Currency, `P` applies Percentage, and `G` returns to General. `Esc` closes the dialog box without changing anything.',
      'A number format changes how a value is displayed, never the value itself. 0.05 shown as 5% is still 0.05 in the Formula Bar.',
      'The same dialog box can be reached from the Ribbon: `Alt` `H` `O` opens the Format menu on the Home tab and `E` chooses Format Cells.',
    ] },
    { mode: 'guided' },
    { mode: 'solo' },
    { mode: 'timed', par: 25 },
  ],
  goals: [
    { id: 'comma-sales', text: 'Select the Sales figures B3:B8 and apply the Number format with Ctrl+1, then N', keys: 'Ctrl+1 N', requires: ['format-cells-dialog', 'number-formats', 'ctrl-shift-arrow'], check: s => ['B3', 'B4', 'B5', 'B6', 'B7', 'B8'].every(r => cell(s, r).fmtStyle === 'comma') },
    { id: 'percent-growth', text: 'Select the Growth figures C3:C7 and format them as percentages with Ctrl+1, then P', keys: 'Ctrl+1 P', requires: ['format-cells-dialog', 'number-formats'], check: s => ['C3', 'C4', 'C5', 'C6', 'C7'].every(r => cell(s, r).fmtStyle === 'percent') },
    { id: 'currency-total', text: 'Open Format Cells on the Total in B8 through the Ribbon, Alt, H, O, E, and apply Currency with C', keys: 'Alt H O E C', requires: ['ribbon-route-dialog'], check: (s, ses) => cell(s, 'B8').fmtStyle === 'currency' && used(ses, 'O') && used(ses, 'E') },
  ],
  endState: [
    { text: 'The values themselves are unchanged', check: s => s.value('B8') === 6355 && s.value('C3') === 0.05 },
  ],
  solution: 'Down Down Right Ctrl+Shift+Down Ctrl+1 N Right Ctrl+Shift+Down Ctrl+1 P Left Ctrl+Down Alt H O E C',
};
