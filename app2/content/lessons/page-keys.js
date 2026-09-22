// Foundations · Moving — Pages and screens
// A 60-row daily sales log: too long for arrows, exactly what the page keys are for.
const LOG = {
  A1: { value: 'Daily Sales Log', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true },
};
for (let i = 1; i <= 60; i++) {
  LOG['A' + (i + 2)] = { value: 'Day ' + i };
  LOG['B' + (i + 2)] = { value: 900 + ((i * 37) % 400) };
}
LOG.A63 = { value: 'Total', bold: true };
LOG.B63 = { formula: '=SUM(B3:B62)', bold: true, bt: true };

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'page-keys',
  chapter: 'foundations',
  section: 'Moving',
  title: 'Pages and screens',
  difficulty: 'easy',
  tags: ['navigation'],
  access: 'free',
  concepts: ['page-keys'],
  prerequisites: ['moving-around'],
  read: 'A real log runs past the bottom of the screen, and holding an arrow down is not a plan. In this lesson you move through a 60-day sales log a screen at a time with PgDn, PgUp and Alt+PgDn. Paging is how you skim a long sheet without losing your place.',
  sheet: { cells: LOG, active: { r: 1, c: 1 }, colW: { 1: 72 } },
  par: 8,
  goals: [
    { id: 'pgdn', teach: 'PgDn and PgUp move one screen down and up; Alt+PgDn and Alt+PgUp one screen right and left.', text: 'Page down from the top until the active cell has left the first screen.', keys: 'PgDn', requires: ['page-keys'], check: (s, ses) => used(ses, 'PageDown') && s.dispActive().r >= 11 },
    { id: 'alt-pgdn', text: 'Page one screen to the right with Alt+PgDn.', keys: 'Alt+PgDn', requires: ['page-keys'], check: (s, ses) => used(ses, 'Alt+PgDn') && s.dispActive().c >= 11 },
    { id: 'pgup', text: 'Page back up until the active cell is inside the first ten rows.', keys: 'PgUp', requires: ['page-keys'], check: (s, ses) => used(ses, 'PageUp') && s.dispActive().r <= 10 },
    { id: 'ctrl-end', text: 'Jump straight to B63, the Total at the bottom, with Ctrl+End.', keys: 'Ctrl+End', requires: ['ctrl-home-end'], check: (s, ses) => at(s, 'B63') && used(ses, 'Ctrl+End') },
  ],
  closing: ['On this sheet a screen is ten rows; in Excel it is however many rows fit your window. The habit is the same: page to skim, Ctrl+Arrow to jump edges, Ctrl+End for the bottom corner.'],
  solution: 'PgDn Alt+PgDn PgUp Ctrl+End',
};
