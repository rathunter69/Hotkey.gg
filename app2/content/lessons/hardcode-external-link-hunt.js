// Chapter 3 · 3.6.3 The hardcode and external-link hunt (clearcoat-databook, S6b → S6c)
// The old Summary block's last two faults: C73 reads last year's databook through an external
// link ('[Databook FY25.xlsx]Summary'!$F$21, which shows #REF! here because the file is not open),
// and the new-price column E66:E71 multiplies by a 1.05 typed inside each formula. The learner opens
// Edit Links, finds the cell with Ctrl+F for "[", types the figure it fetched (710) blue with its
// source beside it, confirms Edit Links is empty, then moves 1.05 into a labelled blue input in C75
// and points the six formulas at it with Replace inside the selection. Checks read the links the
// session finds, the cells, and the shared liveness rule; the literal check reads parsed tokens on
// E66:E71 only.
import { livenessMemo as liveness, noLiteralInFormula } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog;
const onSummary = ses => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === 'Summary';
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const editLinksPressed = ses => { const w = windowKeys(ses); return w.some((k, i) => k === 'Alt' && w[i + 1] === 'A' && w[i + 2] === 'K'); };
const noLinks = ses => typeof ses.externalLinks === 'function' && ses.externalLinks().length === 0;
const blue = (sh, ref) => sh.cellAt(ref).fontColor === 'blue';
const isText = v => typeof v === 'string' && v.trim() !== '';

const broughtInside = ses => { const sh = summary(ses); return !!sh && !sh.cellAt('C73').formula && sh.value('C73') === 710 && blue(sh, 'C73') && isText(sh.value('D73')) && blue(sh, 'D73'); };
const upliftInput = ses => { const sh = summary(ses); return !!sh && isText(sh.value('B75')) && !sh.cellAt('C75').formula && sh.value('C75') === 1.05 && blue(sh, 'C75'); };
const ROWS = [66, 67, 68, 69, 70, 71];
const pointed = ses => { const sh = summary(ses); if (!sh) return false; const k = sh.value('C75');
  return ROWS.every(r => { const ref = 'E' + r; return !!sh.cellAt(ref).formula && noLiteralInFormula(sh, ref).ok && Math.abs(sh.value(ref) - sh.value('D' + r) * k) < 1e-9; }) && liveness(sh, 'E66').ok; };

export default {
  id: 'hardcode-external-link-hunt',
  chapter: 'formulas',
  section: 'Auditing',
  module: 'auditing',
  workbook: 'clearcoat-databook',
  state: { before: 'S6b', after: 'S6c' },
  title: 'The hardcode and external-link hunt',
  difficulty: 'medium',
  tags: ['formulas', 'audit', 'hardcodes', 'links'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt A K',
  conventions: ['E7', 'B4', 'B6', 'B1'],
  teaches: ['edit-links'],
  uses: ['find-replace', 'replace-all', 'input-colour-convention', 'font-color', 'format-cells-dialog', 'number-formats', 'tab-commits', 'keytips', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
  prerequisites: ['f9-show-formulas-at-scale'],
  brief: 'Two things travel badly: a number typed inside a formula, and a link to another workbook, which breaks the day the file is moved and shows a path nobody can follow. Data › Edit Links (Alt, A, K) lists every outside workbook a file reads, and Find for a bracket shows which cell reads it. The old Summary has one of each. Find them and bring both inside. The key is `Alt A K`.',
  wow: 'Nothing in the file reaches outside it, and nothing hides a number inside a formula.',
  goals: [
    { id: 'edit-links', teach: 'A stray link like this is born when someone types =, switches to another open file (Ctrl+Tab cycles the open workbooks, even with a formula open) and points. Edit Links shows the file it reads, and #REF! is what a reader sees once that file has moved.',
      text: 'Open Data › Edit Links with Alt A K and read the one external link: last year’s databook, Databook FY25.xlsx.',
      keys: 'Alt A K', requires: ['edit-links', 'keytips'],
      hintStuck: 'pulse cell C73 · The list shows every other workbook this file reads.',
      check: (s, ses) => !!ses.dlg && ses.dlg.kind === 'editlinks' },
    { id: 'find-link', teach: 'An external reference always starts with the file name in square brackets, so Find for [ lands on it. The same search finds what reads a sheet: before deleting a tab, Find its name with Within set to Workbook and Look in to Formulas, Find All, and repoint every cell in the list.',
      text: 'Close it, then find the cell that carries the link with Ctrl+F for [ and close Find.',
      keys: 'Esc Ctrl+F "[" ↵ Esc', requires: ['find-replace', 'escape-backs-out'],
      hintStuck: 'pulse cell C73 · The prior year sits under the total, in the block’s last rows.',
      check: (s, ses) => { const sh = summary(ses); return onSummary(ses) && !!sh && sh.selectionText() === 'C73' && settled(ses); } },
    { id: 'bring-inside', teach: 'A figure from outside the file becomes an input: typed, blue, and documented, with the source in the next cell so a reader can check it.',
      text: 'Type the 710 the link fetched into C73, its source Databook FY25, Summary F21 in D73, and make both blue.',
      keys: '"710" Tab "Databook FY25, Summary F21" ↵ ↑ Shift+→ Alt H F C → ×4 ↵', requires: ['input-colour-convention', 'font-color', 'tab-commits', 'keytips', 'shift-arrow', 'arrow-keys'], convention: 'B6',
      hintStuck: 'pulse range C73:D73 · The value goes where the link was, the source beside it.',
      check: (s, ses) => onSummary(ses) && broughtInside(ses) && settled(ses) },
    { id: 'links-gone', text: 'Press Alt A K again: with no cell reading it, the link has gone and Excel says the workbook has no links.',
      keys: 'Alt A K', requires: ['edit-links', 'keytips'], convention: 'E7',
      hintStuck: 'pulse cell C73 · Excel drops a link as soon as the last formula reading it is gone.',
      check: (s, ses) => broughtInside(ses) && noLinks(ses) && editLinksPressed(ses) && settled(ses) },
    { id: 'uplift-input', text: 'Move the 1.05 out of the formulas: label B75 Price uplift (x), type 1.05 blue in C75, two decimals with the separator and (1,234).',
      keys: '↓ ×2 ← "Price uplift (x)" Tab "1.05" ↵ ↑ → Alt H F C → ×4 ↵ Ctrl+1 N Tab N Alt+D 2 Alt+U Alt+N ↓ ↓ ↵', requires: ['input-colour-convention', 'font-color', 'format-cells-dialog', 'number-formats', 'tab-commits', 'keytips', 'arrow-keys'], convention: 'B1',
      hintStuck: 'pulse range B75:C75 · An input gets its own labelled cell, two rows under the block’s total.',
      check: (s, ses) => onSummary(ses) && upliftInput(ses) && settled(ses) },
    { id: 'point-at-input', teach: 'Replace inside the selection rewrites every formula at once: 1.05 becomes $C$75, anchored, so each row reads the same input.',
      text: 'Select E66:E71 and replace 1.05 with $C$75, so all six new-price formulas read the input.',
      keys: 'Ctrl+↑ ↓ → ×2 Shift+↓ ×5 Ctrl+H "1.05" Tab "$C$75" Alt+A Esc', requires: ['find-replace', 'replace-all', 'relative-absolute', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'], convention: 'B4',
      hintStuck: 'pulse range E66:E71 · The column beside Retail revenue is the one at new prices.',
      check: (s, ses) => onSummary(ses) && pointed(ses) && settled(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!C75" Enter "1.08" Enter Ctrl+G "Summary!E72" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch the uplift in C75 change to 1.08 and the whole new-price column answer.', requires: [],
      hintStuck: 'pulse cell C75 · One input, six formulas reading it.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C73 is a typed blue 710 with its source beside it, and the workbook has no external links', check: (s, ses) => broughtInside(ses) && noLinks(ses) },
    { text: 'The uplift is a blue input in C75, and E66:E71 read it with no number inside the formula', check: (s, ses) => upliftInput(ses) && pointed(ses) },
  ],
  closing: [
    'The link would have shown #REF! on the buyer’s screen the day the file left the desk, and the 1.05 would have stayed 1.05 whatever the price list said. Both are inputs now, blue, labelled and sourced.',
    'Run Alt A K on every file before it goes out. An empty Edit Links is the quickest proof that a workbook stands on its own.',
  ],
  solution: 'Alt A K Escape Ctrl+F "[" Enter Escape "710" Tab "Databook FY25, Summary F21" Enter Up Shift+Right Alt H F C Right Right Right Right Enter Alt A K Down Down Left "Price uplift (x)" Tab "1.05" Enter Up Right Alt H F C Right Right Right Right Enter Ctrl+1 N Tab N Alt+D 2 Alt+U Alt+N Down Down Enter Ctrl+Up Down Right Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+H "1.05" Tab "$C$75" Alt+A Escape',
};
