// Chapter 3 · 3.6.2 F9 on a part, show formulas, Go To Special at scale (clearcoat-databook, S6a → S6b)
// The old Summary block with its ranges fixed (3.6.1). The learner opens Domain's SUMIF in D66 and
// turns its criteria range, then its criterion, into values with F9, Esc each time; shows formulas
// with Ctrl+`; sweeps the site rows C66:F71 with Go To Special, Constants, Numbers only, which lights
// the typed 1,240 in D67 alone, and replaces it with its neighbours' SUMIF by Paste Special Formulas;
// sweeps again with Text only, which lights the text "12" in C69, and links it to the site count
// =C18 like its neighbours; then turns formulas off. Checks read the key log for the F9 presses
// (every press is Escaped, so the formula stays), the selection Go To Special leaves, and the
// fixed cells against the export and the site counts.
import { livenessMemo as liveness } from '../../app/graders.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog;
const onSummary = ses => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === 'Summary';
const f9Count = ses => ses.keyLog.filter(e => e.k === 'F9').length;
const D66 = '=SUMIF(Transactions!$B$5:$B$94,B66,Transactions!$E$5:$E$94)';
const intact = ses => { const sh = summary(ses); return !!sh && sh.cellAt('D66').formula === D66; };

/** One site's retail revenue over the whole export. */
function siteSum(ses, code) {
  const tx = sheetOf(ses, 'Transactions'); let t = 0;
  for (let r = 5; r <= 200; r++) { const site = tx.value('B' + r); if (site == null || site === '') break; if (site === code) t += Number(tx.value('E' + r)) || 0; }
  return t;
}
const typedFixed = ses => { const sh = summary(ses); return !!sh && !!sh.cellAt('D67').formula && sh.value('D67') === siteSum(ses, sh.value('B67')) && liveness(sh, 'D67').ok; };
const textFixed = ses => { const sh = summary(ses); return !!sh && !!sh.cellAt('C69').formula && typeof sh.value('C69') === 'number' && sh.value('C69') === sh.value('C18') && liveness(sh, 'C69').ok; };

export default {
  id: 'f9-show-formulas-at-scale',
  chapter: 'formulas',
  section: 'Auditing',
  module: 'auditing',
  workbook: 'clearcoat-databook',
  state: { before: 'S6a', after: 'S6b' },
  title: 'F9 on a part, show formulas, Go To Special at scale',
  difficulty: 'medium',
  tags: ['formulas', 'audit', 'hardcodes'],
  access: 'paid',
  minutes: 7,
  headline: 'F9',
  conventions: ['F3', 'B4'],
  teaches: ['f9-part', 'goto-special-types'],
  uses: ['evaluate-formula', 'show-formulas', 'go-to-special', 'edit-mode-f2', 'edit-caret', 'escape-cancels', 'copy-cut-paste', 'paste-special', 'formula-basics', 'go-to', 'shift-arrow', 'arrow-keys'],
  prerequisites: ['trace-arrows-evaluate'],
  brief: 'Inside an open formula, select any part and press F9, and it turns into its value, so a long SUMIF can be read piece by piece. Then press Esc and never Enter, or that piece is hardcoded for good. Show formulas and Go To Special you already know, and on a databook they sweep whole blocks, so run them before anyone else does. Audit the old Summary with all three. The key is `F9`.',
  wow: 'Three sweeps made the two dead numbers in the block give themselves up.',
  goals: [
    { id: 'f9-range', teach: 'In Edit mode Ctrl+→ jumps the insertion point a word at a time and Shift extends a selection inside the formula. F9 then calculates only what is selected: a range becomes its values in braces. Esc leaves the cell as it was; Enter would keep the values.',
      text: 'Open Domain’s SUMIF in D66 with F2, select its criteria range Transactions!$B$5:$B$94, press F9 to read the codes, then Esc.',
      keys: 'Ctrl+G "D66" ↵ F2 Home Ctrl+→ ×2 Ctrl+Shift+→ ×3 Shift+← F9 Esc', requires: ['f9-part', 'edit-mode-f2', 'edit-caret', 'escape-cancels', 'go-to'],
      hintStuck: 'pulse cell D66 · The criteria range runs from after the bracket to the first comma.',
      check: (s, ses) => onSummary(ses) && f9Count(ses) >= 1 && intact(ses) && settled(ses) },
    { id: 'f9-criterion', text: 'Open it again, select the criterion B66 alone and press F9 to see the site code it tests, then Esc.',
      keys: 'F2 Home Ctrl+→ ×5 Shift+→ ×3 F9 Esc', requires: ['f9-part', 'edit-mode-f2', 'edit-caret', 'escape-cancels'],
      hintStuck: 'pulse cell D66 · The criterion sits between the two commas.',
      check: (s, ses) => onSummary(ses) && f9Count(ses) >= 2 && intact(ses) && settled(ses) },
    { id: 'show-formulas', text: 'Show formulas with Ctrl+` and read the block: a typed 1,240 and a text "12" stand out among the formulas.',
      keys: 'Ctrl+`', requires: ['show-formulas'],
      hintStuck: 'pulse range C66:F71 · Every other cell in the block starts with =.',
      check: (s, ses) => onSummary(ses) && !!ses.settings.showFormulas && settled(ses) },
    { id: 'numbers-only', teach: 'In Go To Special, Constants and Formulas each carry four boxes, Numbers (U), Text (X), Logicals (G) and Errors (E), all ticked at first. Untick three and the sweep picks only the fourth kind.',
      text: 'Select the site rows C66:F71 and Go To Special, Constants with Numbers only: the 1,240 in D67 lights alone.',
      keys: '← Shift+→ ×3 Shift+↓ ×5 Ctrl+G Alt+S O X G E ↵', requires: ['goto-special-types', 'go-to-special', 'shift-arrow', 'arrow-keys'], convention: 'F3',
      hintStuck: 'pulse range C66:F71 · O picks Constants, then X, G and E untick everything but Numbers.',
      check: (s, ses) => { const sh = summary(ses); return onSummary(ses) && !!sh && sh.selectionText() === 'D67' && settled(ses); } },
    { id: 'fix-typed', text: 'Replace the 1,240 with the SUMIF its neighbours use: copy D68 and paste only its formula into D67 with Ctrl+Alt+V, F.',
      keys: '↓ Ctrl+C ↑ Ctrl+Alt+V F ↵', requires: ['copy-cut-paste', 'paste-special', 'arrow-keys'], convention: 'B4',
      hintStuck: 'pulse cell D67 · The SUMIF reads the site code in column B, so it moves up a row with the paste.',
      check: (s, ses) => onSummary(ses) && typedFixed(ses) && settled(ses) },
    { id: 'text-only', text: 'Sweep C66:F71 again with Constants and Text only: the "12" in C69 lights, a number stored as text.',
      keys: '↑ ← Shift+→ ×3 Shift+↓ ×5 Ctrl+G Alt+S O U G E ↵', requires: ['goto-special-types', 'go-to-special', 'shift-arrow', 'arrow-keys'], convention: 'F3',
      hintStuck: 'pulse range C66:F71 · This time U unticks Numbers and leaves Text.',
      check: (s, ses) => { const sh = summary(ses); return onSummary(ses) && !!sh && typedFixed(ses) && sh.selectionText() === 'C69' && settled(ses); } },
    { id: 'fix-text', text: 'Link C69 to South Lamar’s wash count the way its neighbours do, =C18.',
      keys: '"=C18" ↵', requires: ['formula-basics'], convention: 'B4',
      hintStuck: 'pulse cell C69 · C66 reads C15, so each row reads the count fifty-one rows above it.',
      check: (s, ses) => onSummary(ses) && textFixed(ses) && settled(ses) },
    { id: 'formulas-off', text: 'Turn show formulas off with Ctrl+` and read the block as values again.',
      keys: 'Ctrl+`', requires: ['show-formulas'],
      hintStuck: 'pulse range C66:F71 · The same key turns it back.',
      check: (s, ses) => onSummary(ses) && typedFixed(ses) && textFixed(ses) && !ses.settings.showFormulas && settled(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!E7" Enter "60" Enter Ctrl+G "Summary!D67" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch a Mueller wash on Transactions change and the block move with it, D67 included.', requires: [],
      hintStuck: 'pulse cell D67 · Every cell in the block reads the export or the counts now.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'D67 reads the export with the same SUMIF as its neighbours', check: (s, ses) => typedFixed(ses) },
    { text: 'C69 links to the site count as a number, and formulas are hidden again', check: (s, ses) => textFixed(ses) && !ses.settings.showFormulas },
  ],
  closing: [
    'The 1,240 was a figure someone typed over a formula, and the "12" was a count that could never be added. Neither shows on the page as anything but a number, which is why the sweeps exist.',
    'Tip from the desk: a leading apostrophe parks a half-built formula as text while you work on its pieces. Type \' in front of the = and the cell shows the formula without running it or raising an error box. Delete the apostrophe and it is live again.',
  ],
  solution: 'Ctrl+G "D66" Enter F2 Home Ctrl+Right Ctrl+Right Ctrl+Shift+Right Ctrl+Shift+Right Ctrl+Shift+Right Shift+Left F9 Escape F2 Home Ctrl+Right Ctrl+Right Ctrl+Right Ctrl+Right Ctrl+Right Shift+Right Shift+Right Shift+Right F9 Escape Ctrl+` Left Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+G Alt+S O X G E Enter Down Ctrl+C Up Ctrl+Alt+V F Enter Up Left Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+G Alt+S O U G E Enter "=C18" Enter Ctrl+`',
};
