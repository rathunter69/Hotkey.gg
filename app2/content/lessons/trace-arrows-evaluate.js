// Chapter 3 · 3.6.1 Trace precedents and dependents (clearcoat-databook, S5d → S6a)
// The old Summary block someone left at rows 64 to 77: its SUMIFs stop at row 93 of the export
// while the export runs to row 94 (the last row is an Airport wash), D67 is a typed 1,240, C69 a
// text "12", C73 an external link and the new-price column multiplies by 1.05 inside the formula.
// This lesson traces the total in D72 back with Alt M P, follows Airport's SUMIF, draws the typed
// number's three dependents with Alt M D and the next level after them, clears the arrows, steps through Airport's SUMIF with
// Evaluate Formula, then fixes the five ranges at once with Replace inside the selection. The
// Evaluate runs again on the fixed SUMIF. The other faults are the next lessons'. Checks read the arrows and the dialog the engine keeps, and
// the fixed SUMIFs against the full export.
import { livenessMemo as liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog;
const onSummary = ses => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === 'Summary';
const arrows = ses => { const sh = summary(ses); return (sh && sh.arrows) || []; };
const hasArrow = (ses, kind, from, to) => arrows(ses).some(a => a.kind === kind && (from == null || a.from === from) && (to == null || a.to === to));
const SUMIF_ROWS = [66, 68, 69, 70, 71];

/** Each site's retail revenue over the whole export, rows 5 to the last filled row. */
function fullSums(ses) {
  const tx = sheetOf(ses, 'Transactions'); const out = {};
  for (let r = 5; r <= 200; r++) { const site = tx.value('B' + r); if (site == null || site === '') break; out[site] = (out[site] || 0) + (Number(tx.value('E' + r)) || 0); }
  return out;
}
const fixed = ses => { const sh = summary(ses); if (!sh) return false; const sums = fullSums(ses);
  return SUMIF_ROWS.every(r => !!sh.cellAt('D' + r).formula && Math.abs(sh.value('D' + r) - (sums[sh.value('B' + r)] || 0)) < 1e-9) && liveness(sh, 'D70').ok; };

export default {
  id: 'trace-arrows-evaluate',
  chapter: 'formulas',
  section: 'Auditing',
  module: 'auditing',
  workbook: 'clearcoat-databook',
  state: { before: 'S5d', after: 'S6a' },
  title: 'Trace precedents and dependents',
  difficulty: 'medium',
  tags: ['formulas', 'audit', 'trace'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt M P',
  conventions: ['F3', 'F5'],
  teaches: ['trace-arrows', 'evaluate-formula'],
  uses: ['find-replace', 'replace-all', 'go-to', 'keytips', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
  prerequisites: ['challenge-new-site-case'],
  brief: 'Ctrl+[ jumps to what a cell reads; the trace arrows draw it on the sheet, so a whole chain shows at once, and Evaluate Formula steps through a formula one calculation at a time. On a sheet someone else built, those two tell you what a number is made of before you decide whether it is right. Trace the old Summary’s total back to its ranges. The key is `Alt M P`.',
  wow: 'The arrows showed the chain, and Evaluate showed where the number went wrong.',
  goals: [
    { id: 'precedents', teach: 'Formulas › Trace Precedents (Alt, M, P) draws an arrow into the active cell from every cell it reads, and a box around a range it reads whole. Press it again and it traces one level further back.',
      text: 'On the Summary, land on the old block’s total in D72, which does not tie, and draw its precedents with Alt M P.',
      keys: 'Ctrl+G "D72" ↵ Alt M P', requires: ['trace-arrows', 'go-to', 'keytips'],
      hintStuck: 'pulse cell D72 · The total reads the six site cells above it.',
      check: (s, ses) => onSummary(ses) && hasArrow(ses, 'precedent', null, 'D72') && settled(ses) },
    { id: 'trace-sumif', teach: 'A formula that reads another sheet draws its arrow to a small sheet icon, and the range it names is in the formula itself: Transactions rows 5 to 93, while the export runs to row 94.',
      text: 'Airport’s cell D70 is a SUMIF, so trace its precedents too and read where its ranges end.',
      keys: '↑ ×2 Alt M P', requires: ['trace-arrows', 'keytips', 'arrow-keys'],
      hintStuck: 'pulse cell D70 · The export’s last row is an Airport wash in row 94.',
      check: (s, ses) => onSummary(ses) && hasArrow(ses, 'precedent', null, 'D70') && settled(ses) },
    { id: 'dependents', teach: 'Trace Dependents (Alt, M, D) works the other way: arrows out of the active cell to every cell that reads it, so you see how far one wrong number has travelled.',
      text: 'D67 is a typed 1,240 in a column of formulas: draw its dependents with Alt M D and count the three cells it feeds.',
      keys: '↑ ×3 Alt M D', requires: ['trace-arrows', 'keytips', 'arrow-keys'],
      hintStuck: 'pulse cell D67 · The new price, the share and the total all read it.',
      check: (s, ses) => onSummary(ses) && hasArrow(ses, 'dependent', 'D67', null) && settled(ses) },
    { id: 'dependents-next', text: 'Press Alt M D again for the next level: the total in D72 feeds the growth, the check and every share, so the 1,240 reached them all.',
      keys: 'Alt M D', requires: ['trace-arrows', 'keytips'],
      hintStuck: 'pulse cell D72 · Each press of Trace Dependents follows the chain one step further.',
      check: (s, ses) => onSummary(ses) && hasArrow(ses, 'dependent', 'D72', null) && settled(ses) },
    { id: 'remove', text: 'Clear every arrow off the sheet with Remove Arrows, Alt M A A.',
      keys: 'Alt M A A', requires: ['trace-arrows', 'keytips'],
      hintStuck: 'pulse cell D67 · The arrows are drawings, so removing them changes nothing in a cell.',
      check: (s, ses) => onSummary(ses) && arrows(ses).length === 0 && settled(ses) },
    { id: 'evaluate', teach: 'Evaluate Formula (Alt, M, V) shows the formula with the next part to calculate underlined; each Enter replaces it with its result, until the formula is one value. Enter again closes it.',
      text: 'Step through Airport’s SUMIF in D70 with Evaluate Formula, Alt M V, until it reads its short total.',
      keys: '↓ ×3 Alt M V ↵ ×2', requires: ['evaluate-formula', 'keytips', 'arrow-keys'],
      hintStuck: 'pulse cell D70 · First the criterion becomes the site code, then the SUMIF its total.',
      check: (s, ses) => onSummary(ses) && !!ses.dlg && ses.dlg.kind === 'evalfx' && ses.dlg.cell === 'D70' && ses.dlg.done },
    { id: 'fix', teach: 'Replace with a range selected works inside the selection only, so one Replace All moves every range end in the block and leaves the rest of the sheet alone.',
      text: 'Close Evaluate, select the site rows D66:D71 and replace $93 with $94, so all five SUMIFs read the whole export.',
      keys: '↵ Ctrl+↑ ↓ Shift+↓ ×5 Ctrl+H "$93" Tab "$94" Alt+A Esc', requires: ['find-replace', 'replace-all', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range D66:D71 · Only the five SUMIFs carry $93; the typed 1,240 is the next lesson’s.',
      check: (s, ses) => onSummary(ses) && fixed(ses) && settled(ses) },
    { id: 're-evaluate', text: 'Evaluate Airport’s SUMIF in D70 again with Alt M V: it now reads the export’s last wash too, then close it.',
      keys: 'Ctrl+↓ ↑ ×2 Alt M V ↵ ×3', requires: ['evaluate-formula', 'keytips', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell D70 · The ranges run to row 94 now, so the total is larger.',
      check: (s, ses) => onSummary(ses) && fixed(ses) && !!ses.dlg && ses.dlg.kind === 'evalfx' && ses.dlg.cell === 'D70' && ses.dlg.done },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!E6" Enter "45" Enter Ctrl+G "Summary!D66" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch a Domain wash on Transactions change and Domain’s fixed total in D66 move with it.', requires: [],
      hintStuck: 'pulse cell D66 · The SUMIF reads every row of the export now.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Every site’s SUMIF in D66:D71 reads the whole export, rows 5 to 94', check: (s, ses) => fixed(ses) },
    { text: 'No trace arrows are left on the Summary', check: (s, ses) => arrows(ses).length === 0 },
  ],
  closing: [
    'The arrows showed what the total was made of, and Evaluate showed the Airport SUMIF stopping a row short: the export’s last wash never reached the block. Five ranges fixed in one Replace.',
    'The typed 1,240, the text 12, the link to last year’s file and the 1.05 inside the formula are still there. The next two lessons find them with sweeps that cover the whole sheet.',
  ],
  solution: 'Ctrl+G "D72" Enter Alt M P Up Up Alt M P Up Up Up Alt M D Alt M D Alt M A A Down Down Down Alt M V Enter Enter Enter Ctrl+Up Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+H "$93" Tab "$94" Alt+A Escape Ctrl+Down Up Up Alt M V Enter Enter Enter',
};
