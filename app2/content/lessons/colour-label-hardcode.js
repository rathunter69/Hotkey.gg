// Chapter 1 · 1.1.4 — Color, label, one hardcode per cell (voltline-weekly, S1c → S1d)
// The owner's pass on Inputs: typed inputs blue, formulas black, the units line in A2, and the
// wholesale price dug out of =B6*0.13 into its own labelled input cell.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const inputs = ses => { const e = ses.sheets.find(x => x.name === 'Inputs'); return e ? e.sheet : null; };
const cellIs = (ses, ref, fn) => { const sh = inputs(ses); return !!sh && fn(sh.cellAt(ref)); };

export default {
  id: 'colour-label-hardcode',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'voltline-weekly',
  state: { before: 'S1c', after: 'S1d' },
  title: 'Color, label, one hardcode per cell',
  difficulty: 'medium',
  tags: ['conventions', 'inputs', 'setup'],
  access: 'free',
  minutes: 7,
  headline: 'Alt H F C',
  conventions: ['B1', 'B4', 'B6', 'C1', 'C5'],
  teaches: ['type-to-enter', 'font-color', 'input-colour-convention', 'edit-mode-f2'],
  uses: ['sheet-tabs', 'ctrl-arrow', 'shift-arrow'],
  prerequisites: ['analyst-setup'],
  brief: 'The Inputs sheet is where every number someone typed will live, and a reviewer must see at a glance which numbers those are. Color the typed inputs blue, state the units once, and dig the wholesale price out of the formula it is buried in. The brush is `Alt H F C`.',
  goals: [
    { id: 'to-inputs', text: 'The inputs scratch needs an owner’s pass: move to the Inputs sheet.', keys: 'Ctrl+PgDn ×2', requires: ['sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Inputs') },
    { id: 'units', teach: 'Type and press Enter to commit; every pack page states its currency once, near the top.', text: 'Add the units line: type USD unless stated into A2.', keys: '↓ "USD unless stated" ↵', requires: ['type-to-enter'], convention: 'C5',
      check: (s, ses) => cellIs(ses, 'A2', c => c.value === 'USD unless stated') },
    { id: 'blue-inputs', teach: 'House rule: anything typed is blue, anything calculated stays black, so a reviewer sees the drivers at a glance.', text: 'Color the typed figures blue — the margin target B5 and the kWh estimate B6.', keys: '→ ↓ ×2 Shift+↓ then Alt H F C → ×4 ↵', requires: ['font-color', 'input-colour-convention'], convention: 'B1',
      check: (s, ses) => cellIs(ses, 'B5', c => c.fontColor === 'blue') && cellIs(ses, 'B6', c => c.fontColor === 'blue') },
    { id: 'price-input', text: 'The wholesale price deserves its own cell: type 0.13 into B4 and color it blue too.', keys: '↑ "0.13" ↵ ↑ Alt H F C → ×4 ↵', requires: ['type-to-enter', 'font-color'],
      check: (s, ses) => cellIs(ses, 'B4', c => c.value === 0.13 && c.fontColor === 'blue') },
    { id: 'label-source', text: 'Label where the number comes from: per utility contract in C4.', keys: '→ "per utility contract" ↵', requires: ['type-to-enter'], convention: 'B6',
      check: (s, ses) => cellIs(ses, 'C4', c => c.value === 'per utility contract') },
    { id: 'split-hardcode', teach: 'F2 opens the cell for editing with the caret at the end — read a formula before you change it.', text: 'B14 still hides the price in =B6*0.13: rewrite it as =B6*B4, so the price lives in one place.', keys: '← Ctrl+↓ Ctrl+↓ F2 ⌫ ×4 "B4" ↵', requires: ['edit-mode-f2'], convention: 'B4',
      check: (s, ses) => cellIs(ses, 'B14', c => c.formula === '=B6*B4' && c.fontColor !== 'blue') && windowKeys(ses).includes('F2') },
  ],
  endState: [
    { text: 'A2 still reads USD unless stated', check: (s, ses) => cellIs(ses, 'A2', c => c.value === 'USD unless stated') },
    { text: 'B4, B5 and B6 stay blue', check: (s, ses) => ['B4', 'B5', 'B6'].every(r => cellIs(ses, r, c => c.fontColor === 'blue')) },
    { text: 'B14 computes from B4, no hardcode', check: (s, ses) => cellIs(ses, 'B14', c => c.formula === '=B6*B4') },
  ],
  solution: 'Ctrl+PgDn Ctrl+PgDn Down "USD unless stated" Enter Right Down Down Shift+Down Alt H F C Right Right Right Right Enter Up "0.13" Enter Up Alt H F C Right Right Right Right Enter Right "per utility contract" Enter Left Ctrl+Down Ctrl+Down F2 Backspace Backspace Backspace Backspace "B4" Enter',
};
