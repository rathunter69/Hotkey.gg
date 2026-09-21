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
/** Keys the Format Cells card logs but ignores: Enter, and letters or digits that are not one of its options. */
const CARD_IGNORES = /^(↵|[A-Z0-9=])$/;
/**
 * `key` was applied from the Format Cells card after opening it through the Ribbon, read from the
 * key window (keyLog since this goal became current): the last Alt is followed by H O E (or the
 * legacy O E route Excel still honours), then only keys the card ignores, then `key` as the latest
 * key. A card opened with Ctrl+1, or letters logged elsewhere (another menu, typed text), do not count.
 */
const appliedViaRibbon = (ses, key) => {
  const ks = ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
  const i = ks.lastIndexOf('Alt');
  if (i < 0 || ks[ks.length - 1] !== key) return false;
  const after = ks.slice(i + 1);
  const route = [['H', 'O', 'E'], ['O', 'E']].find(r => r.every((k, j) => after[j] === k));
  return !!route && after.slice(route.length, -1).every(k => CARD_IGNORES.test(k));
};

export default {
  id: 'foundations-07-dialog-boxes',
  chapter: 'foundations',
  section: 'The Ribbon and dialog boxes',
  title: 'Dialog boxes: Format Cells',
  difficulty: 'medium',
  tags: ['ribbon', 'formatting', 'number-formats'],
  access: 'free',
  concepts: ['dialog-box', 'format-cells-dialog', 'number-formats', 'ribbon-route-dialog'],
  prerequisites: ['foundations-06-ribbon-commands'],
  sheet: { cells: START, active: { r: 1, c: 1 } },
  steps: [
    { mode: 'teach', title: 'Commands that ask a question', body: [
      'Some commands open a dialog box: a panel of choices that stays open until you confirm it with `Enter` or cancel it with `Esc`.',
      '`Ctrl+1` opens Format Cells for the selected cells. On its Number tab, typing the first letter of a category picks it: `N` Number, `C` Currency, `P` Percentage.',
      'This trainer shortens the dialog box: the letter applies at once and closes the card. Its Number format shows 1,200 and Percentage shows 5.0%, where Excel\'s defaults show two decimal places.',
      'A number format changes how a value is displayed, never the value itself. 0.05 shown as 5.0% is still 0.05 in the Formula Bar.',
      'The Ribbon reaches the same dialog box: `Alt` `H` `O` opens the Format menu and `E` chooses Format Cells.',
    ] },
    { mode: 'guided' },
    { mode: 'solo' },
    { mode: 'timed', par: 25 },
  ],
  goals: [
    { id: 'comma-sales', text: 'Select the Sales figures B3:B8 and apply the Number format with Ctrl+1, then N', keys: '↓ ↓ → Ctrl+Shift+↓ then Ctrl+1 N', requires: ['format-cells-dialog', 'number-formats', 'ctrl-shift-arrow'], check: s => ['B3', 'B4', 'B5', 'B6', 'B7', 'B8'].every(r => cell(s, r).fmtStyle === 'comma') },
    { id: 'percent-growth', text: 'Select the Growth figures C3:C7 and format them as percentages with Ctrl+1, then P', keys: '→ Ctrl+Shift+↓ then Ctrl+1 P', requires: ['format-cells-dialog', 'number-formats', 'ctrl-shift-arrow'], check: s => ['C3', 'C4', 'C5', 'C6', 'C7'].every(r => cell(s, r).fmtStyle === 'percent') },
    { id: 'currency-total', text: 'Open Format Cells on the Total in B8 through the Ribbon, Alt, H, O, E, and apply Currency with C', keys: '← Ctrl+↓ then Alt H O E C', requires: ['ribbon-route-dialog', 'ctrl-arrow'], check: (s, ses) => cell(s, 'B8').fmtStyle === 'currency' && appliedViaRibbon(ses, 'C') },
  ],
  // Goals latch, so the formats the first two goals produce are restated here (B8 is left out: the
  // last goal legitimately turns it to Currency). Undoing one keeps the lesson open until it is back.
  endState: [
    { text: 'The values themselves are unchanged', check: s => Object.keys(START).every(k => s.value(k) === START[k].value) },
    { text: 'B3:B7 still show the Number format', check: s => ['B3', 'B4', 'B5', 'B6', 'B7'].every(r => cell(s, r).fmtStyle === 'comma') },
    { text: 'C3:C7 still show the Percentage format', check: s => ['C3', 'C4', 'C5', 'C6', 'C7'].every(r => cell(s, r).fmtStyle === 'percent') },
  ],
  solution: 'Down Down Right Ctrl+Shift+Down Ctrl+1 N Right Ctrl+Shift+Down Ctrl+1 P Left Ctrl+Down Alt H O E C',
};
