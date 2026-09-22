// Foundations · How Excel works — Page setup and best practices
// Alt P S P opens Page Setup (Landscape, Fit to 1 page wide by 1 tall); then the colour
// convention: the hardcoded inputs go blue (Alt H F C), the formulas stay black.
const START = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Inputs', bold: true },
  A3: { value: 'Units sold' }, B3: { value: 240 },
  A4: { value: 'Price' }, B4: { value: 25 },
  A5: { value: 'Discount' }, B5: { value: 0.1, fmtStyle: 'percent', decimals: 0 },
  A7: { value: 'Calculations', bold: true },
  A8: { value: 'Gross sales' }, B8: { formula: '=B3*B4' },
  A9: { value: 'Discount' }, B9: { formula: '=B8*B5' },
  A10: { value: 'Net sales', bold: true }, B10: { formula: '=B8-B9', bold: true, bt: true },
};
const INPUTS = ['B3', 'B4', 'B5'], FORMULAS = ['B8', 'B9', 'B10'];
const cell = (s, ref) => s.cellAt(ref);
const blue = s => INPUTS.every(r => cell(s, r).fontColor === 'blue');
const black = s => FORMULAS.every(r => !cell(s, r).fontColor || cell(s, r).fontColor === 'black');

export default {
  id: 'page-setup',
  chapter: 'foundations',
  section: 'How Excel works',
  title: 'Page setup and best practices',
  difficulty: 'medium',
  tags: ['page-setup', 'best-practices', 'formatting'],
  access: 'free',
  concepts: ['page-setup', 'orientation', 'fit-to-page', 'font-color', 'input-colour-convention'],
  prerequisites: ['excel-options'],
  read: 'Two habits separate a sheet that prints and reads well from one that does not: page setup and the colour convention. In this lesson you set the Weekly Sales Report to Landscape and Fit to 1 page in Page Setup, then colour its hardcoded inputs blue and leave the formulas black. Keep one hardcode per cell, in blue, and anyone can see what to change without breaking a formula.',
  sheet: { cells: START, active: { r: 1, c: 1 }, colW: { 1: 100 } },   // column A fitted to its labels, as an author would
  par: 25,
  goals: [
    { id: 'landscape', teach: 'Alt, P, S, P opens the Page Setup dialog box from the Page Layout tab, where L picks Landscape, T Portrait, and Enter presses OK.', text: 'Set the page orientation to Landscape.', keys: 'Alt P S P L ↵', requires: ['page-setup', 'orientation'],
      check: (s, ses) => ses.settings.pageSetup.orientation === 'landscape' },
    { id: 'fit-one-page', teach: 'In the same dialog box F chooses Fit to 1 page wide by 1 tall, so a wide sheet prints on one page instead of spilling onto a second.', text: 'Open Page Setup again and choose Fit to 1 page wide by 1 tall.', keys: 'Alt P S P F ↵', requires: ['page-setup', 'fit-to-page'],
      check: (s, ses) => { const p = ses.settings.pageSetup; return p.scaling === 'fit' && p.fitWide === 1 && p.fitTall === 1; } },
    { id: 'blue-inputs', teach: 'Models colour hardcoded inputs blue and formulas black so a reader knows what to change: Alt, H, F, C opens Font Color, → moves along the swatches, Enter applies.', text: 'Select the three inputs B3:B5 and make them blue.', keys: 'Ctrl+G "B3:B5" ↵ then Alt H F C → ×4 ↵', requires: ['font-color', 'input-colour-convention', 'go-to', 'range'],
      check: blue },
  ],
  // Goals latch, so the colours are restated here: undoing the blue after its tick, or colouring the
  // formulas as well, keeps the lesson open until the inputs are blue and the formulas black again.
  endState: [
    { text: 'The inputs B3:B5 are still blue', check: blue },
    { text: 'The formulas B8:B10 are still black', check: black },
    { text: 'The inputs and formulas themselves are unchanged', check: s => INPUTS.every(r => s.value(r) === START[r].value) && FORMULAS.every(r => cell(s, r).formula === START[r].formula) },
  ],
  solution: 'Alt P S P L Enter Alt P S P F Enter Ctrl+G "B3:B5" Enter Alt H F C Right Right Right Right Enter',
};
