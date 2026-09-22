// Foundations · How Excel works — Options: the settings that matter
// Alt F T opens Excel Options: Workbook Calculation to Manual, iterative calculation on, AutoSum
// pinned to the Quick Access Toolbar; then F9 (Calculate Now). The settings are recorded by the
// engine (session.settings), so every goal grades that record.
const REPORT = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  A8: { value: 'Total', bold: true }, B8: { formula: '=SUM(B3:B7)', bold: true, bt: true }, C8: { formula: '=SUM(C3:C7)', bold: true, bt: true },
};
/** The key was pressed since the current goal became current (the runner's key window). */
const used = (ses, label) => ses.keyLog.slice(ses.goalMark || 0).some(e => e.k === label);
const manual = (s, ses) => ses.settings.calcMode === 'manual';
const iterative = (s, ses) => ses.settings.iterative === true;
const autoSumPinned = (s, ses) => ses.settings.qat.includes('autosum');

export default {
  id: 'excel-options',
  chapter: 'foundations',
  section: 'How Excel works',
  title: 'Options: the settings that matter',
  difficulty: 'medium',
  tags: ['options', 'calculation', 'basics'],
  access: 'free',
  concepts: ['excel-options', 'calc-mode', 'iterative-calc', 'quick-access-toolbar', 'calculate-now'],
  prerequisites: ['ribbon-and-keytips'],
  read: 'Some of the settings that matter most in Excel live outside the grid, in Excel Options. In this lesson you open it with Alt, F, T to set calculation to Manual, enable iterative calculation and pin AutoSum to the Quick Access Toolbar, then recalculate with F9. These are the first things an analyst changes on a new machine, because a big model on Automatic recalculates on every keystroke.',
  sheet: { cells: REPORT, active: { r: 1, c: 1 }, colW: { 1: 84 } },   // column A fitted to its day names, as an author would
  par: 20,
  goals: [
    { id: 'manual-calc', teach: 'Alt, F, T opens Excel Options; on its Formulas page M sets Workbook Calculation to Manual, and Enter presses OK.', text: 'Set Workbook Calculation to Manual.', keys: 'Alt F T M ↵', requires: ['excel-options', 'calc-mode'],
      check: manual },
    { id: 'iterative', teach: 'On the same page I turns on Enable iterative calculation, which lets a model resolve a circular reference such as interest on an average debt balance.', text: 'Open Excel Options again and enable iterative calculation.', keys: 'Alt F T I ↵', requires: ['excel-options', 'iterative-calc'],
      check: iterative },
    { id: 'qat-autosum', teach: 'The Quick Access Toolbar sits above the Ribbon: Q opens its page in Options, A adds the highlighted command, and Alt then a number runs it later.', text: 'Add AutoSum, the first command in the Popular Commands list, to the Quick Access Toolbar.', keys: 'Alt F T Q A ↵', requires: ['excel-options', 'quick-access-toolbar'],
      check: autoSumPinned },
    { id: 'calc-now', teach: 'F9 is Calculate Now: on Manual, it recalculates the whole workbook when you are ready.', text: 'Recalculate the workbook with F9.', keys: 'F9', requires: ['calculate-now', 'calc-mode'],
      check: (s, ses) => used(ses, 'F9') },
  ],
  // Goals latch, and Options can be reopened and flipped back, so the settings are restated here:
  // switching calculation back to Automatic after its tick keeps the lesson open until it is Manual again.
  endState: [
    { text: 'Workbook Calculation is still on Manual', check: manual },
    { text: 'Iterative calculation is still enabled', check: iterative },
    { text: 'AutoSum is still on the Quick Access Toolbar', check: autoSumPinned },
  ],
  solution: 'Alt F T M Enter Alt F T I Enter Alt F T Q A Enter F9',
};
