// Chapter 1 · 1.2.4 — What's typed and what's calculated (clearcoat-weekly, S2a → S2b)
// Costs mixes typed figures, one formula and two blanks: Go To Special picks each kind out of a
// selection in one stroke; the constants are colored blue, the formula confirmed black, the blanks
// found. The learner-facing words live in content/copy/*.csv.
import { COSTS_CONSTANTS } from '../workbooks/clearcoat-weekly.js';

const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const costs = ses => { const e = ses.sheets.find(x => x.name === 'Costs'); return e ? e.sheet : null; };
const multiIs = (s, keys) => Array.isArray(s.multi) && s.multi.join(',') === keys;
const coloured = ses => { const sh = costs(ses); return !!sh && COSTS_CONSTANTS.every(r => sh.cellAt(r).fontColor === 'blue') && sh.cellAt('E4').fontColor !== 'blue'; };

export default {
  id: 'typed-vs-calculated',
  chapter: 'foundations',
  section: 'Move and select',
  module: 'move-and-select',
  workbook: 'clearcoat-weekly',
  state: { before: 'S2a', after: 'S2b' },
  title: 'What’s typed and what’s calculated',
  difficulty: 'medium',
  tags: ['selection', 'conventions'],
  access: 'free',
  minutes: 6,
  headline: 'Alt H F D S',
  conventions: ['F3', 'B1'],
  teaches: ['go-to-special'],
  uses: ['ctrl-shift-arrow', 'ctrl-arrow', 'font-color', 'input-colour-convention', 'sheet-tabs', 'ctrl-home-end'],
  prerequisites: ['around-the-workbook'],
  brief: 'In 1.1.5 you colored twelve cells by reading them one at a time. Costs has seventeen typed figures, one formula and two blanks, and a buyer’s analyst will ask which is which. Go To Special selects cells by what they hold (every constant, every formula, every blank) inside whatever you’ve selected, so you can color a whole block in one stroke and find the holes in it with another. The key is `Alt H F D S`.',
  goals: [
    { id: 'to-costs', teach: 'Ctrl+PgDn to the last tab; Costs is the sheet a manager built by hand: rent, maintenance and card fees by site.', text: 'The question is about Costs: go there.', keys: 'Ctrl+PgDn ×3', requires: ['sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Costs') },
    { id: 'select-table', teach: 'Land on B4, then press Ctrl+Shift+→ and Ctrl+Shift+↓, and two presses give you twenty cells; Go To Special works inside whatever you’ve selected, so the selection comes first.', text: 'Select the table body B4:E8, edge to edge.', keys: 'Ctrl+↓ ↓ → then Ctrl+Shift+→ Ctrl+Shift+↓', requires: ['ctrl-shift-arrow', 'ctrl-arrow'],
      check: (s, ses) => onSheet(ses, 'Costs') && s.selectionText() === 'B4:E8' },
    { id: 'constants-blue', teach: 'Go To Special is Home › Find & Select › Go To Special (Alt, H, F, D, S), or F5 then Alt+S; inside your selection it picks cells by kind: O for Constants, F for Formulas, K for Blanks.', text: 'Pick out the constants, meaning everything someone typed, and color them blue in one stroke.', keys: 'Alt H F D S O ↵ then Alt H F C → ×4 ↵', requires: ['go-to-special', 'font-color', 'input-colour-convention'], convention: 'B1',
      check: (s, ses) => coloured(ses) },
    { id: 'formulas-black', teach: 'Formulas stay black, because Go To Special only shows you where they are; one total in a block of typed figures is normal for a sheet a manager built.', text: 'Select the body again and pick out the formulas, which lights up only the Domain total in E4, and it stays black.', keys: 'Ctrl+Home Ctrl+↓ ↓ → Ctrl+Shift+→ Ctrl+Shift+↓ then Alt H F D S F ↵', requires: ['go-to-special', 'ctrl-home-end'], convention: 'F3',
      check: (s, ses) => onSheet(ses, 'Costs') && multiIs(s, 'E4') && !ses.dialog },
    { id: 'blanks', teach: 'Blanks are the holes: two sites never sent a maintenance number, and now you know which ones before the CFO asks.', text: 'One more pass picks out the blanks, which are the two sites with no maintenance figure.', keys: 'Ctrl+Home Ctrl+↓ ↓ → Ctrl+Shift+→ Ctrl+Shift+↓ then Alt H F D S K ↵', requires: ['go-to-special'],
      check: (s, ses) => multiIs(s, 'C5,C7') && !ses.dialog },
  ],
  endState: [
    { text: 'Every typed figure on Costs stays blue, the formula black', check: (s, ses) => coloured(ses) },
  ],
  wow: 'Seventeen typed cells turned blue in one stroke.',
  closing: [
    'Go To Special selects by kind (constants, formulas, blanks) inside whatever you’ve selected. It’s how you color a block in one move, and how you audit someone else’s in one look, which comes back in the hardcode hunt at the end of the chapter.',
    'Costs is color-coded and its two holes are found.',
  ],
  solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Shift+Down Alt H F D S O Enter Alt H F C Right Right Right Right Enter Ctrl+Home Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Shift+Down Alt H F D S F Enter Ctrl+Home Ctrl+Down Down Right Ctrl+Shift+Right Ctrl+Shift+Down Alt H F D S K Enter',
};
