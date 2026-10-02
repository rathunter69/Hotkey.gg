// Chapter 5 · 5.2.6 The drivers block: three cases by year, one selector, one live block (clearcoat-model, B526 → B531)
// On Inputs, the Management, Base and Downside blocks of five drivers for FY27 to FY31 arrive typed, all
// but the Downside's flat ticket growth, which the learner types once and points each later year at the
// one before. The learner writes the live block's first two rows (new sites, washes a day), each one
// formula across eight years that reads the actual through the projection flag and the case through
// CHOOSE on the name Case; the other three rows, the case highlight and the CF, BS and DCF titles arrive
// planted. The Cover and IS titles take the case name.
import { settled, formatOnly, cellIn, script, matches, cellsOf } from './lib/model-checks.js';
import { STATES } from '../workbooks/clearcoat-model.js';

const OWN = new Set([...cellsOf('F30:J30'), ...cellsOf('C35:J36')]);
const inputs = STATES.B531.sheets.find(s => s.name === 'Inputs');
const PLANT = {
  ...Object.fromEntries([...cellsOf('C14:J32'), ...cellsOf('C35:J39')].filter(ref => inputs.cells[ref])
    .map(ref => [`Inputs!${ref}`, OWN.has(ref) ? formatOnly(cellIn('B531', 'Inputs', ref)) : cellIn('B531', 'Inputs', ref)]).filter(([, c]) => c)),
  'Inputs!#condFmt': inputs.condFmt,
  ...Object.fromEntries(['CF', 'BS', 'DCF'].map(name => [`${name}!A1`, cellIn('B531', name, 'A1')])),
};
const K = {
  flat: 'Ctrl+G "Inputs!F30" ↵ "0" → "=F30" ↵ Shift+→ ×3 Ctrl+R',
  sites: 'Ctrl+G "Inputs!C35" ↵ "=IF(Inputs!C$6=0,Schedules!C7,CHOOSE(Case,C14,C21,C28))" ↵ Shift+→ ×7 Ctrl+R',
  washes: '↓ "=IF(Inputs!C$6=0,Schedules!C16,CHOOSE(Case,C15,C22,C29))" ↵ Shift+→ ×7 Ctrl+R',
  cover: 'Ctrl+G "Cover!A1" ↵ \'=Inputs!$C$104&": operating model, "&C5&" case"\' ↵',
  is: 'Ctrl+G "IS!A1" ↵ \'=Inputs!$C$104&": income statement, "&Cover!$C$5&" case"\' ↵',
};
const on = (ses, range) => matches(ses, 'Inputs', range, 'B531');

export default {
  id: 'drivers-block',
  chapter: 'finance-and-accounting',
  section: 'Model setup and efficiencies',
  module: 'model-setup',
  workbook: 'clearcoat-model',
  state: { before: 'B526', after: 'B531' },
  plant: PLANT,
  title: 'The drivers block: three cases by year, one selector, one live block',
  difficulty: 'hard',
  tags: ['finance', 'model', 'scenarios', 'cases'],
  access: 'paid',
  minutes: 7,
  headline: 'CHOOSE',
  conventions: ['B1', 'B4'],
  teaches: ['drivers-block'],
  uses: ['go-to', 'case-switch', 'if-function', 'timeline-flags', 'defined-name', 'fill-down-right', 'shift-arrow', 'arrow-keys', 'pass-through-driver', 'concatenate-amp', 'dynamic-title', 'cross-sheet-ref'],
  prerequisites: ['populate-from-data'],
  brief: 'A buyer doesn’t want one forecast; they want the company’s case, their own, and the one they can live with, and they want to flip between them without opening a second file. So the drivers, the handful of inputs that move everything, live on Inputs three times, one block per case, by year, and a live block beneath reads whichever case the Cover’s switch names (4.5.1). Every schedule reads the live block and only the live block. The key is `CHOOSE`.',
  wow: 'Three cases on one Inputs page, and one cell on the Cover runs the whole model.',
  goals: [
    { id: 'flat', teach: 'A driver held flat is typed once, in FY27, and each later year points at the one before, in black because it is a formula: one edit rolls through. It is the one accepted link to a link (1.6.4).',
      text: 'The Downside’s ticket growth: 0 in F30, then =F30 in G30 filled right to J30.', keys: K.flat, requires: ['drivers-block', 'go-to', 'pass-through-driver', 'fill-down-right', 'arrow-keys'], convention: 'B1',
      hintStuck: 'pulse range F30:J30 · Only FY27 is typed.',
      check: (s, ses) => settled(ses) && on(ses, 'F30:J30') },
    { id: 'sites', teach: 'CHOOSE(Case, …) picks the Management, Base or Downside figure by the Cover’s case number. Case is a name, so it holds still wherever the formula goes, and the three block references move with the fill. The flag hands the actual years their actuals, so history never moves with the switch.',
      text: 'Live new sites in C35: =IF(Inputs!C$6=0,Schedules!C7,CHOOSE(Case,C14,C21,C28)), filled right to J35.', keys: K.sites, requires: ['drivers-block', 'case-switch', 'if-function', 'timeline-flags', 'defined-name'], convention: 'B4',
      hintStuck: 'pulse range C35:J35 · Rows 14, 21 and 28 are new sites in the three blocks.',
      check: (s, ses) => settled(ses) && on(ses, 'C35:J35') },
    { id: 'washes', teach: 'Best practice: from 5.3 on, every schedule reads a driver from the live block, never from one of the three cases. A typed input beside a live one is the fault an audit finds first.',
      text: 'Live washes a day in C36: =IF(Inputs!C$6=0,Schedules!C16,CHOOSE(Case,C15,C22,C29)), filled right to J36.', keys: K.washes, requires: ['drivers-block', 'case-switch', 'fill-down-right'],
      hintStuck: 'pulse range C36:J36 · The actual reads Schedules row 16.',
      check: (s, ses) => settled(ses) && on(ses, 'C36:J36') },
    { id: 'cover-title', teach: 'Every page says which case it shows (2.6.3), so a printed page can’t be mistaken for another case.',
      text: 'The Cover title in A1 takes the case: =Inputs!$C$104&": operating model, "&C5&" case".', keys: K.cover, requires: ['concatenate-amp', 'dynamic-title'],
      hintStuck: 'pulse cell A1 · The switch’s word is in C5.',
      check: (s, ses) => settled(ses) && matches(ses, 'Cover', 'A1', 'B531') },
    { id: 'is-title', teach: 'A scenario moves several drivers together and tells a story; a sensitivity moves one at a time (4.5.2). The drivers block is for scenarios, the data tables for sensitivities, and a model a buyer trusts has both.',
      text: 'The IS title in A1 the same way: =Inputs!$C$104&": income statement, "&Cover!$C$5&" case".', keys: K.is, requires: ['concatenate-amp', 'dynamic-title', 'cross-sheet-ref'],
      hintStuck: 'pulse cell A1 · The case word lives on the Cover.',
      check: (s, ses) => settled(ses) && matches(ses, 'IS', 'A1', 'B531') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Cover!C5" Enter "Downside" Enter Ctrl+G "Inputs!F35" Enter', cadence: 360 },
      text: 'Does it tie? Watch the Cover switch to Downside: the live block moves in FY27 to FY31 and holds in FY24 to FY26.', requires: [],
      hintStuck: 'pulse range C35:J39 · Only the projected years read the cases.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The live block reads the case through CHOOSE and the actuals through the flag', check: (s, ses) => on(ses, 'C35:J36') },
    { text: 'The Downside ticket growth is typed once and carried across', check: (s, ses) => on(ses, 'F30:J30') },
    { text: 'The Cover and IS titles name the case', check: (s, ses) => matches(ses, 'Cover', 'A1', 'B531') && matches(ses, 'IS', 'A1', 'B531') },
  ],
  closing: [
    'Three cases live on one Inputs page, and one cell on the Cover runs the whole model.',
    'A buyer types Downside on the Cover and every schedule you build from 5.3 on answers, while the three years of history stay where the accountants put them. CHOOSE reads plainest with the cases in separate blocks; INDEX does the same job when each driver’s cases are stacked.',
  ],
  solution: script(Object.values(K).join(' ')),
};
