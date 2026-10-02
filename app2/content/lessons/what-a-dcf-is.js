// Chapter 5 · 5.6.1 What a DCF is, and what the statements feed it (clearcoat-model, B561 → B562)
// The DCF page opens as its title, the timeline and the labels of every block. The learner reaches
// it from Checks with Ctrl+PgDn, links the valuation date from Inputs, then the three lines the
// statements feed it: EBITDA from the IS, capex and the working-capital cash effect from Schedules.
// Each link is graded on the cell it reads and the figure it brings, whatever route typed it.
import { sheetIn, settled, onSheet, reads, near, formatsOf, doneFormula, R, rowRefs, linkRow, pressedSince } from './lib/model-checks.js';

const D = 'DCF';
const VAL = 'C' + R(D, 'valDate');
const ROWS = { ebitda: ['IS', 'ebitda', 1], capex: ['Schedules', 'capexTotal', -1], nwc: ['Schedules', 'wcCash', 1] };
const refs = key => rowRefs(D, key);
const linked = (ses, key) => { const [sn, sk, sign] = ROWS[key]; return linkRow(ses, D, refs(key), col => `${sn}!${col}${R(sn, sk)}`, sign); };
const F = { val: doneFormula(D, VAL), ebitda: doneFormula(D, 'C' + R(D, 'ebitda')), capex: doneFormula(D, 'C' + R(D, 'capex')), nwc: doneFormula(D, 'C' + R(D, 'nwc')) };
const dateOk = ses => { const sh = sheetIn(ses, D); return !!sh.formula(VAL) && reads(sh, VAL, ['Inputs!C' + R('Inputs', 'valDate')]) && near(sh.value(VAL), sheetIn(ses, 'Inputs').value('C' + R('Inputs', 'valDate'))); };

export default {
  id: 'what-a-dcf-is',
  chapter: 'finance-and-accounting',
  section: 'DCF',
  module: 'dcf',
  workbook: 'clearcoat-model',
  state: { before: 'B561', after: 'B562' },
  plant: formatsOf(D, [VAL, ...refs('ebitda'), ...refs('capex'), ...refs('nwc')]),
  title: 'What a DCF is, and what the statements feed it',
  difficulty: 'medium',
  tags: ['model', 'dcf', 'links'],
  access: 'paid',
  minutes: 5,
  headline: 'Ctrl+PgDn',
  conventions: ['B2', 'C3'],
  teaches: ['dcf'],
  uses: ['sheet-tabs', 'go-to', 'cross-sheet-ref', 'f4-anchor', 'ctrl-enter-fill', 'link-colour-convention'],
  prerequisites: ['challenge-eight-faults'],
  brief: 'A discounted cash flow values a business as the cash it will generate, discounted to today: the NPV from Chapter 3 applied to the whole company instead of one site. It needs cash flows, a discount rate and a terminal value, and the model already holds what the cash flows are built from. The DCF page sits next to Checks, laid out and empty. Link it to the model so the next five lessons can fill it. The key is `Ctrl+PgDn`.',
  goals: [
    { id: 'tab', teach: 'Ctrl+PgDn moves one sheet to the right, and the DCF page is the tab after Checks. Its blocks are labeled already: free cash flow, discounting, terminal value, enterprise value to equity value, WACC and the sensitivity tables.',
      text: 'Go to Checks with Ctrl+G, then press Ctrl+PgDn to reach the DCF page next door.',
      keys: 'Ctrl+G "Checks!A1" ↵ Ctrl+PgDn', requires: ['sheet-tabs', 'go-to'],
      hintStuck: 'pulse cell A1 · DCF is the tab to the right of Checks.',
      check: (s, ses) => settled(ses) && onSheet(ses, D) && pressedSince(ses, 'Ctrl+PgDn') },
    { id: 'date', teach: 'Every discount period counts from a stated date: the FY26 year end, the same date the net debt is taken at. It is typed once with the DCF inputs and linked here.',
      text: `Link the valuation date in ${VAL} to Inputs: ${F.val}.`,
      keys: `Ctrl+G "${VAL}" ↵ "${F.val}" ↵`, requires: ['dcf', 'cross-sheet-ref', 'f4-anchor', 'go-to'], convention: 'B2',
      hintStuck: `pulse cell ${VAL} · Row ${R('Inputs', 'valDate')} on Inputs holds 12/31/2026.`,
      check: (s, ses) => settled(ses) && dateOk(ses) },
    { id: 'ebitda', teach: 'The cash flows start from EBITDA, the operating profit before depreciation, interest and tax. The IS already has it, so the DCF reads it and never retypes it.',
      text: `Link EBITDA across C${R(D, 'ebitda')}:J${R(D, 'ebitda')}: ${F.ebitda}, entered with Ctrl+Enter.`,
      keys: `Ctrl+G "C${R(D, 'ebitda')}:J${R(D, 'ebitda')}" ↵ "${F.ebitda}" Ctrl+↵`, requires: ['dcf', 'cross-sheet-ref', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range C${R(D, 'ebitda')}:J${R(D, 'ebitda')} · EBITDA is row ${R('IS', 'ebitda')} on the IS.`,
      check: (s, ses) => settled(ses) && linked(ses, 'ebitda') },
    { id: 'capex', teach: 'Capex is cash out the door, so it comes in with a minus sign: the schedule shows it as a positive spend.',
      text: `Link capex across C${R(D, 'capex')}:J${R(D, 'capex')}: ${F.capex}.`,
      keys: `Ctrl+G "C${R(D, 'capex')}:J${R(D, 'capex')}" ↵ "${F.capex}" Ctrl+↵`, requires: ['cross-sheet-ref', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range C${R(D, 'capex')}:J${R(D, 'capex')} · Total capex is row ${R('Schedules', 'capexTotal')} on Schedules.`,
      check: (s, ses) => settled(ses) && linked(ses, 'capex') },
    { id: 'nwc', teach: 'The working-capital schedule already shows its cash effect with the sign the cash flow needs, so this link takes it as it stands.',
      text: `Link the change in working capital across C${R(D, 'nwc')}:J${R(D, 'nwc')}: ${F.nwc}.`,
      keys: `Ctrl+G "C${R(D, 'nwc')}:J${R(D, 'nwc')}" ↵ "${F.nwc}" Ctrl+↵`, requires: ['cross-sheet-ref', 'ctrl-enter-fill', 'go-to'], convention: 'C3',
      hintStuck: `pulse range C${R(D, 'nwc')}:J${R(D, 'nwc')} · The cash effect of working capital is row ${R('Schedules', 'wcCash')} on Schedules.`,
      check: (s, ses) => settled(ses) && linked(ses, 'nwc') },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "Inputs!G${R('Inputs', 'bNew')}" Enter "3" Enter Ctrl+G "DCF!G${R(D, 'capex')}" Enter`, cadence: 360 },
      text: 'Does it tie? Watch three new sites in FY28 instead of six: capex on the DCF falls with them.', requires: [],
      hintStuck: `pulse cell G${R(D, 'capex')} · The DCF reads the schedule, so it moves with the rollout.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The valuation date on DCF links Inputs', check: (s, ses) => dateOk(ses) },
    { text: 'EBITDA, capex and the change in working capital on DCF link the model', check: (s, ses) => linked(ses, 'ebitda') && linked(ses, 'capex') && linked(ses, 'nwc') },
  ],
  closing: [
    'The page is laid out, and every input it needs already lives in the model.',
    'Best practice: the DCF reads the model. A DCF with its own typed cash flows is a calculator, not a valuation, and it stops moving the first time the rollout does. Picture a house: what the house is worth is enterprise value, the mortgage is net debt, and the owner’s stake is equity. This page prices it off the rent it would earn.',
  ],
  solution: `Ctrl+G "Checks!A1" Enter Ctrl+PgDn Ctrl+G "${VAL}" Enter "${F.val}" Enter `
    + `Ctrl+G "C${R(D, 'ebitda')}:J${R(D, 'ebitda')}" Enter "${F.ebitda}" Ctrl+Enter Ctrl+G "C${R(D, 'capex')}:J${R(D, 'capex')}" Enter "${F.capex}" Ctrl+Enter `
    + `Ctrl+G "C${R(D, 'nwc')}:J${R(D, 'nwc')}" Enter "${F.nwc}" Ctrl+Enter`,
};
