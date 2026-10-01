// Chapter 1 · 1.1.5 — Color-code the workbook (clearcoat-weekly, S1c → S1d)
// The reader's pass on Inputs: typed numbers blue, formulas Automatic, links to another sheet green,
// read in the formula bar one cell at a time; F2 to see a formula's inputs light up; the formula
// colored as an input put back. Goals 4 and 5 run B12 before B10 (script-ch1.md has B10 first) so
// the route from B5:B6 is one Ctrl+↓ and three ↑, not a four-arrow walk. The learner-facing words
// live in content/copy/*.csv.
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const inputs = ses => { const e = ses.sheets.find(x => x.name === 'Inputs'); return e ? e.sheet : null; };
const cellIs = (ses, ref, fn) => { const sh = inputs(ses); return !!sh && fn(sh.cellAt(ref)); };
const blue = c => c.fontColor === 'blue';
const green = c => c.fontColor === 'green';
const automatic = c => c.fontColor == null || c.fontColor === 'black';
const TYPED = ['B4', 'B5', 'B6', 'B7', 'B8', 'B9'], LINKS = ['B12', 'B13'], FORMULAS = ['B10', 'B11', 'B14', 'B15'];
const blockRight = ses => TYPED.every(r => cellIs(ses, r, blue)) && LINKS.every(r => cellIs(ses, r, green)) && FORMULAS.every(r => cellIs(ses, r, automatic));

export default {
  id: 'colour-label-hardcode',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'clearcoat-weekly',
  state: { before: 'S1c', after: 'S1d' },
  title: 'Color-code the workbook',
  difficulty: 'medium',
  tags: ['conventions', 'inputs', 'setup'],
  access: 'free',
  minutes: 7,
  headline: 'Alt H F C',
  conventions: ['B1', 'B2'],
  teaches: ['font-color', 'input-colour-convention', 'link-colour-convention', 'edit-mode-f2'],
  uses: ['sheet-tabs', 'ctrl-arrow', 'shift-arrow', 'formula-bar', 'format-cells-dialog'],
  prerequisites: ['analyst-setup'],
  brief: 'Everything you type into this file will get emailed, printed and handed to someone who wasn’t there when you built it, and they need to understand it without asking you. That’s what font colors are for: blue for a hardcode (a number somebody typed), black for a formula, green for a link to another sheet, red for a link to another file. The formula bar tells you which is which. Inputs has a block of cells that are all still black, so read each one and color it right. The key is `Alt H F C`.',
  goals: [
    { id: 'to-inputs', teach: 'Every typed number in the file lives on Inputs, so it’s the sheet a reviewer opens first, and the sheet where color coding matters most.', text: 'Inputs is the sheet where the typed numbers live: go there first.', keys: 'Ctrl+PgDn ×2', requires: ['sheet-tabs'],
      check: (s, ses) => onSheet(ses, 'Inputs') },
    { id: 'b4-blue', teach: 'A number with no = in front of it is a hardcode, meaning somebody typed it, so it goes blue; Font Color is Alt, H, F, C, the arrow keys move across the swatches and Enter picks one.', text: 'Land on B4, read 1.50 typed in the formula bar, and color it blue.', keys: 'Ctrl+↓ ↓ → then Alt H F C → ×4 ↵', requires: ['font-color', 'input-colour-convention', 'formula-bar', 'ctrl-arrow'], convention: 'B1',
      check: (s, ses) => cellIs(ses, 'B4', blue) },
    { id: 'b5-b6-blue', teach: 'To select across cells, hold Shift and press an arrow: from B5, Shift+↓ takes B6 too, and a format applied to a selection lands on every cell in it.', text: 'B5 and B6 are typed too: select both and color them blue in one go.', keys: '↓ Shift+↓ then Alt H F C → ×4 ↵', requires: ['shift-arrow', 'font-color'],
      check: (s, ses) => cellIs(ses, 'B5', blue) && cellIs(ses, 'B6', blue) },
    { id: 'b12-green', teach: 'A reference with a sheet name and an exclamation mark points at another sheet, and links are green, so a reader knows which figures come from elsewhere in the file.', text: 'B12 holds =Raw!I13, a link to another sheet: color it green.', keys: 'Ctrl+↓ ↑ ×3 then Alt H F C → ×8 ↵', requires: ['link-colour-convention', 'font-color', 'ctrl-arrow'], convention: 'B2',
      check: (s, ses) => cellIs(ses, 'B12', green) },
    { id: 'b10-automatic', teach: 'Formulas are black: Automatic is the default font color, and it’s the one every calculated cell should have.', text: 'B10 holds =B5*B6, a formula, so it stays black, but set its font color to Automatic if it isn’t.', keys: '↑ ↑', requires: ['formula-bar', 'input-colour-convention'],
      check: (s, ses) => onSheet(ses, 'Inputs') && at(s, 'B10') && cellIs(ses, 'B10', automatic) },
    { id: 'rest-of-block', teach: 'Read each cell in the formula bar before you color it: no =, blue; =, black; a sheet name and !, green.', text: 'Now do the rest of the block, B7:B14, where three more typed numbers, two formulas and one link each need the right color.', keys: '↑ ×3 Shift+↓ ×2 Alt H F C → ×4 ↵ then Ctrl+↓ ↑ ↑ Alt H F C → ×8 ↵', requires: ['font-color', 'shift-arrow', 'ctrl-arrow', 'formula-bar'],
      check: (s, ses) => ['B7', 'B8', 'B9'].every(r => cellIs(ses, r, blue)) && cellIs(ses, 'B13', green) && cellIs(ses, 'B11', automatic) && cellIs(ses, 'B14', automatic) },
    { id: 'f2-look', teach: 'F2 puts a cell into edit mode: the caret appears at the end of the entry and, for a formula, each reference lights up in color on the sheet; Esc leaves it and throws your changes away.', text: 'Read the block back: press F2 on B10, watch its inputs light up on the sheet, then leave with Esc.', keys: '↑ ×3 F2 then Esc', requires: ['edit-mode-f2'],
      check: (s, ses) => onSheet(ses, 'Inputs') && ses.mode === 'normal' && at(s, 'B10') && windowKeys(ses).includes('F2') && cellIs(ses, 'B10', c => c.formula === '=B5*B6') },
    { id: 'b15-automatic', teach: 'A wrong color is worse than no color: a reviewer would change B15 thinking it was an input; Ctrl+1 opens Format Cells, whose Font tab has the color list with Automatic first.', text: 'B15 is blue but holds a formula, =B10/B6: set its font color back to Automatic.', keys: 'Ctrl+↓ then Ctrl+1 F Alt+C ← ×5 ↵', requires: ['format-cells-dialog', 'input-colour-convention'],
      check: (s, ses) => cellIs(ses, 'B15', c => automatic(c) && c.formula === '=B10/B6') },
  ],
  endState: [
    { text: 'Every typed number on Inputs is blue, every link green, every formula Automatic', check: (s, ses) => blockRight(ses) },
  ],
  wow: 'Blue is typed, black is calculated, green comes from another sheet. Anyone can read your workbook now.',
  closing: [
    'Every one of those twelve cells now says what it is before anyone reads the number. That’s the first thing a reviewer checks when they open your file, and it’ll be the first thing you check when someone sends you theirs.',
    'Top-bucket tip: add-ins like Macabacus can color a whole sheet in one press, blue, black and green by what each cell holds. Learn to do it by hand first. You’ll be checking their work, and the desks that don’t use them expect you to know why each cell is the color it is.',
  ],
  solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+Down Down Right Alt H F C Right Right Right Right Enter Down Shift+Down Alt H F C Right Right Right Right Enter Ctrl+Down Up Up Up Alt H F C Right Right Right Right Right Right Right Right Enter Up Up Up Up Up Shift+Down Shift+Down Alt H F C Right Right Right Right Enter Ctrl+Down Up Up Alt H F C Right Right Right Right Right Right Right Right Enter Up Up Up F2 Escape Ctrl+Down Ctrl+1 F Alt+C Left Left Left Left Left Enter',
};
