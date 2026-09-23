// Chapter 1 · 1.2.4 — What's typed and what's calculated (voltline-weekly, S1d → S2a)
// Costs mixes typed figures and formulas: Go To Special picks each kind out of a selection in one
// stroke — constants colored blue, formulas confirmed black, blanks found.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const costs = ses => { const e = ses.sheets.find(x => x.name === 'Costs'); return e ? e.sheet : null; };
const multiIs = (s, keys) => Array.isArray(s.multi) && s.multi.join(',') === keys;
const BLUE_SET = ['B4', 'C4', 'D4', 'B5', 'D5', 'E5', 'B6', 'C6', 'D6', 'E6', 'B7', 'D7', 'E7', 'B8', 'C8', 'D8', 'E8'];

export default {
  id: 'typed-vs-calculated',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'voltline-weekly',
  state: { before: 'S1d', after: 'S2a' },
  title: 'What’s typed and what’s calculated',
  difficulty: 'medium',
  tags: ['selection', 'conventions'],
  access: 'free',
  minutes: 6,
  headline: 'Alt H F D S',
  conventions: ['F3', 'B1'],
  teaches: ['go-to-special'],
  uses: ['ctrl-shift-arrow', 'font-color', 'input-colour-convention', 'sheet-tabs', 'ctrl-home-end'],
  prerequisites: ['around-the-workbook'],
  brief: 'A buyer will ask which cost figures were typed and which are calculated, and the Costs sheet does not say. Make it say: constants blue in one stroke, formulas checked, blanks found — all through `Alt H F D S`.',
  goals: [
    { id: 'to-costs', text: 'The question is about Costs: go there.', keys: 'Ctrl+PgDn ×3', requires: ['sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Costs') },
    { id: 'select-table', text: 'Select the table body B4:E8, edge to edge.', keys: 'Ctrl+↓ ↓ → then Ctrl+Shift+→ Ctrl+Shift+↓', requires: ['ctrl-shift-arrow'],
      check: (s, ses) => s.selectionText() === 'B4:E8' },
    { id: 'constants-blue', teach: 'Go To Special (Alt, H, F, D, S) selects by kind inside your selection — O is Constants, F Formulas, Enter Blanks.', text: 'Pick out the constants — everything someone typed — and color them blue in one stroke.', keys: 'Alt H F D S O ↵ then Alt H F C → ×4 ↵', requires: ['go-to-special', 'font-color', 'input-colour-convention'], convention: 'B1',
      check: (s, ses) => { const sh = costs(ses); return !!sh && BLUE_SET.every(r => sh.cellAt(r).fontColor === 'blue') && sh.cellAt('E4').fontColor !== 'blue'; } },
    { id: 'formulas-black', text: 'Select the body again and pick out the formulas — only the Domain total E4 lights up, and it stays black.', keys: 'Ctrl+Home Ctrl+↓ ↓ → Ctrl+Shift+→ Ctrl+Shift+↓ then Alt H F D S F ↵', requires: ['go-to-special'], convention: 'F3',
      check: (s, ses) => onSheet(ses, 'Costs') && multiIs(s, 'E4') && !ses.dialog },
    { id: 'blanks', text: 'One more pass: the blanks — the two sites with no maintenance figure.', keys: 'Ctrl+Home Ctrl+↓ ↓ → Ctrl+Shift+→ Ctrl+Shift+↓ then Alt H F D S ↵', requires: ['go-to-special'],
      check: (s, ses) => multiIs(s, 'C5,C7') && !ses.dialog },
  ],
  endState: [
    { text: 'Every typed figure on Costs stays blue, the formula black', check: (s, ses) => { const sh = costs(ses); return !!sh && BLUE_SET.every(r => sh.cellAt(r).fontColor === 'blue') && sh.cellAt('E4').fontColor !== 'blue'; } },
  ],
  solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Shift+Down Alt H F D S O Enter Alt H F C Right Right Right Right Enter Ctrl+Home Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Shift+Down Alt H F D S F Enter Ctrl+Home Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Shift+Down Alt H F D S Enter',
};
