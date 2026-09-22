// Foundations · The Ribbon and dialogs — Dialog boxes: Format Cells
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
  id: 'dialog-boxes',
  chapter: 'foundations',
  section: 'The Ribbon and dialogs',
  title: 'Dialog boxes: Format Cells',
  difficulty: 'medium',
  tags: ['ribbon', 'formatting', 'number-formats'],
  access: 'free',
  concepts: ['dialog-box', 'format-cells-dialog', 'number-formats', 'ribbon-route-dialog'],
  prerequisites: ['ribbon-commands'],
  read: 'Some commands do not act at once: they open a dialog box and wait for your choice. In this lesson you open Format Cells with Ctrl+1 and from the Ribbon to give the Weekly Sales Report proper number formats, which change how a value is shown, never the value itself. Number formatting is the difference between raw figures and a report someone can read.',
  sheet: { cells: START, active: { r: 1, c: 1 }, colW: { 1: 84 } },   // column A fitted to its day names, as an author would
  par: 25,
  goals: [
    { id: 'comma-sales', teach: 'Ctrl+1 opens the Format Cells dialog box, and here the first letter of a category applies it: N is Number.', text: 'Select the Sales figures B3:B8 and apply the Number format.', keys: '↓ ↓ → Ctrl+Shift+↓ then Ctrl+1 N', requires: ['format-cells-dialog', 'number-formats', 'ctrl-shift-arrow'], check: s => ['B3', 'B4', 'B5', 'B6', 'B7', 'B8'].every(r => cell(s, r).fmtStyle === 'comma') },
    { id: 'percent-growth', text: 'Select the Growth figures C3:C7 and apply the Percentage format (P).', keys: '→ Ctrl+Shift+↓ then Ctrl+1 P', requires: ['format-cells-dialog', 'number-formats', 'ctrl-shift-arrow'], check: s => ['C3', 'C4', 'C5', 'C6', 'C7'].every(r => cell(s, r).fmtStyle === 'percent') },
    { id: 'currency-total', teach: 'The Ribbon reaches the same dialog box: Alt, H, O opens the Format menu and E chooses Format Cells.', text: 'Open Format Cells on the Total in B8 through the Ribbon and apply Currency (C).', keys: '← Ctrl+↓ then Alt H O E C', requires: ['ribbon-route-dialog', 'ctrl-arrow'], check: (s, ses) => cell(s, 'B8').fmtStyle === 'currency' && appliedViaRibbon(ses, 'C') },
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
