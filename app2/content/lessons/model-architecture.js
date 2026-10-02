// Chapter 5 · 5.2.1 Inputs, calculations, outputs: architecture and sheet order (clearcoat-model, B521 → B522)
// The model file arrives with its eight sheets shuffled and the Cover empty. The learner moves the tabs
// into the order the model calculates (Move or Copy, Alt H O M), then finishes the Cover: the title read
// from Inputs, the case number and the checks flag, and the first two links of the sheet map. The rest of
// the Cover (labels, the case list, the other links, the names list) and the names Case and Circ arrive
// planted. Tab colors are left out: the engine keeps no tab color.
import { settled, calls, sheetIn, formatOnly, cellIn, script, matches, tabsAre } from './lib/model-checks.js';
import { STATES } from '../workbooks/clearcoat-model.js';

const ORDER = ['Cover', 'Inputs', 'IS', 'CF', 'BS', 'Schedules', 'Checks', 'DCF'];
const OWN = ['A1', 'C6', 'C7', 'C11', 'C12'];
/** The Cover as the shell has it, the learner's five cells formatted and empty; the names the model already carries. */
const PLANT = {
  ...Object.fromEntries(Object.keys(STATES.B522.sheets.find(s => s.name === 'Cover').cells).map(ref => [`Cover!${ref}`, OWN.includes(ref) ? formatOnly(cellIn('B522', 'Cover', ref)) : cellIn('B522', 'Cover', ref)]).filter(([, c]) => c)),
  '#names': { Case: 'Cover!$C$6', Circ: 'Inputs!$C$81' },
};
const K = {
  cover: 'Ctrl+PgDn ×5 Alt H O M ↑ ×5 ↵',
  inputs: 'Ctrl+PgDn ×4 Alt H O M ↑ ×3 ↵',
  statements: 'Ctrl+PgDn ×6 Alt H O M ↑ ×5 ↵ Ctrl+PgDn ×5 Alt H O M ↑ ×4 ↵ Ctrl+PgDn ×2 Alt H O M ↑ ↵',
  schedules: 'Ctrl+PgDn ×3 Alt H O M ↑ ×2 ↵',
  title: 'Ctrl+G "Cover!A1" ↵ \'=Inputs!$C$104&": operating model"\' ↵',
  switch: 'Ctrl+G "Cover!C6" ↵ "=MATCH(C5,C23:C25,0)" ↵ ↓ "=Checks!C45" ↵',
  links: 'Ctrl+G "Cover!C11" ↵ \'=HYPERLINK("#Inputs!A1","Inputs")\' ↵ ↓ \'=HYPERLINK("#IS!A1","IS")\' ↵',
};
const cover = ses => sheetIn(ses, 'Cover');
const linked = ses => matches(ses, 'Cover', 'C11:C12', 'B522') && ['C11', 'C12'].every(ref => calls(cover(ses), ref, ['HYPERLINK']));

export default {
  id: 'model-architecture',
  chapter: 'finance-and-accounting',
  section: 'Model setup and efficiencies',
  module: 'model-setup',
  workbook: 'clearcoat-model',
  // the model is a new file after 5.1's two hand-built pages, so this lesson opens it rather than continuing 5.1's
  state: { before: 'B521', after: 'B522', opens: true },
  plant: PLANT,
  title: 'Inputs, calculations, outputs: architecture and sheet order',
  difficulty: 'medium',
  tags: ['finance', 'model', 'sheets', 'cover'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt H O M',
  conventions: ['A4'],
  teaches: ['model-architecture'],
  uses: ['move-sheet', 'sheet-tabs', 'keytips', 'go-to', 'concatenate-amp', 'dynamic-title', 'match-function', 'case-switch', 'cross-sheet-ref', 'hyperlink'],
  prerequisites: ['challenge-one-site-month'],
  brief: 'A model reads left to right the way it calculates: Cover, Inputs, the three statements, the schedules that feed them, Checks, then the DCF. Inputs are blue and live on one sheet, calculations never hold a typed number, and outputs are the pages someone reads. The Cover carries the title, the case switch, the checks flag and a map of the sheets with links (2.4.4). Put the eight sheets in order with the Cover first, then finish the Cover. The key is `Alt H O M`.',
  wow: 'Eight tabs in the order the model calculates, and a Cover that says where everything is.',
  goals: [
    { id: 'cover-first', teach: 'A model runs in the order it calculates: inputs feed the schedules, the schedules feed the statements, the statements feed the DCF. The tabs read the same way, so a reader follows the money left to right.',
      text: 'Move Cover to the front: Ctrl+PgDn to it, then Alt, H, O, M and ↑ to the top of the list.', keys: K.cover, requires: ['model-architecture', 'move-sheet', 'sheet-tabs', 'keytips'], convention: 'A4',
      hintStuck: 'pulse tab Cover · The list in Move or Copy is the sheet it goes before.',
      check: (s, ses) => settled(ses) && tabsAre(ses, ['Cover']) },
    { id: 'inputs', teach: 'Best practice: every typed number lives on Inputs, in blue, and nowhere else. A typed number on any other sheet is a fault the audit in 5.5 will find.',
      text: 'Inputs goes second, straight after the Cover.', keys: K.inputs, requires: ['move-sheet'],
      hintStuck: 'pulse tab Inputs · Move it to sit before the sheet now second.',
      check: (s, ses) => settled(ses) && tabsAre(ses, ['Cover', 'Inputs']) },
    { id: 'statements', text: 'Then the three statements in the order a DCF reads them: IS, CF, BS.', keys: K.statements, requires: ['move-sheet'],
      hintStuck: 'pulse tab IS · One sheet at a time, each before the sheet that should follow it.',
      check: (s, ses) => settled(ses) && tabsAre(ses, ['Cover', 'Inputs', 'IS', 'CF', 'BS']) },
    { id: 'schedules', teach: 'The schedules sit behind the statements they feed, Checks behind everything it tests, and the DCF last because it reads the lot.',
      text: 'Schedules, Checks and DCF close the row, so the tabs read Cover to DCF.', keys: K.schedules, requires: ['move-sheet'],
      hintStuck: 'pulse tab Schedules · Only Schedules is out of place now.',
      check: (s, ses) => settled(ses) && tabsAre(ses, ORDER) },
    { id: 'title', teach: 'The Cover takes its title from Inputs, where the company name is typed once (2.6.3), so a renamed file renames every page.',
      text: 'On the Cover, the title in A1 from Inputs: =Inputs!$C$104&": operating model".', keys: K.title, requires: ['go-to', 'concatenate-amp', 'dynamic-title'],
      hintStuck: 'pulse cell A1 · The company name is Inputs!C104.',
      check: (s, ses) => settled(ses) && matches(ses, 'Cover', 'A1', 'B522') },
    { id: 'switch', teach: 'The switch in C5 is the word a buyer types; MATCH turns it into the number the drivers block reads, named Case (4.5.1). The flag reads Checks, so the Cover says at a glance whether the model ties.',
      text: 'The case number in C6, =MATCH(C5,C23:C25,0), and the checks flag in C7, =Checks!C45.', keys: K.switch, requires: ['match-function', 'case-switch', 'cross-sheet-ref'],
      hintStuck: 'pulse range C6:C7 · The three cases are listed in C23:C25.',
      check: (s, ses) => settled(ses) && matches(ses, 'Cover', 'C6:C7', 'B522') },
    { id: 'links', teach: 'A link per sheet makes the Cover the contents page (2.4.4). The rest of the map is in place; these two show the pattern.',
      text: 'The map: =HYPERLINK("#Inputs!A1","Inputs") in C11, and the same for IS in C12.', keys: K.links, requires: ['hyperlink'],
      hintStuck: 'pulse range C11:C12 · The # says the link is inside this file.',
      check: (s, ses) => settled(ses) && linked(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn', cadence: 420 },
      text: 'Does it tie? Watch the tabs go by from the Cover: inputs, statements, schedules, checks, then the DCF.', requires: [],
      hintStuck: 'pulse tab Cover · The order of the tabs is the order of the calculation.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The eight sheets read Cover, Inputs, IS, CF, BS, Schedules, Checks, DCF', check: (s, ses) => tabsAre(ses, ORDER) },
    { text: 'The Cover carries its title, the case number, the checks flag and the links', check: (s, ses) => matches(ses, 'Cover', 'A1', 'B522') && matches(ses, 'Cover', 'C6:C7', 'B522') && linked(ses) },
  ],
  closing: [
    'Eight sheets sit in the order they calculate, and the Cover says where everything is.',
    'Every formula from here on has a place to go: typed numbers on Inputs, workings on Schedules, the pages a buyer reads in the middle and the DCF at the end. A reviewer opening the file starts at the Cover and never hunts for a tab.',
  ],
  solution: script(Object.values(K).join(' ')),
};
