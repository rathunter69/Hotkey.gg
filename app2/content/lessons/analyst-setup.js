// Chapter 1 · 1.1.3 — Set Excel up like an analyst (voltline-weekly, S1b → S1c)
// Excel Options: know F9 and calculation mode (stays Automatic), iterative calculation on, and the
// four formatting commands every pass uses pinned to the Quick Access Toolbar, run with Alt+number.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const iterOn = (s, ses) => ses.settings.iterative === true;
const QAT_AFTER = ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'];
const qatIs = (s, ses) => ses.settings.qat.length === QAT_AFTER.length && ses.settings.qat.every((x, i) => x === QAT_AFTER[i]);

export default {
  id: 'analyst-setup',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'voltline-weekly',
  state: { before: 'S1b', after: 'S1c' },
  title: 'Set Excel up like an analyst',
  difficulty: 'medium',
  tags: ['options', 'calculation', 'setup'],
  access: 'free',
  minutes: 6,
  headline: 'Alt F T',
  conventions: ['A1', 'A2'],
  teaches: ['excel-options', 'calc-mode', 'calculate-now', 'iterative-calc', 'quick-access-toolbar', 'qat-run'],
  prerequisites: ['ribbon-by-keyboard'],
  brief: 'Before the real work, set the machine up once, the way every desk does on day one. Calculation stays Automatic, iterative calculation goes on, and the four formatting commands you will use all week go on the Quick Access Toolbar. It all lives behind `Alt F T`.',
  goals: [
    { id: 'f9', teach: 'Calculation is Automatic here; F9, Calculate Now, is the key you live on when a big model goes Manual.', text: 'Press F9 once — on Automatic it is instant, and your hands should know it.', keys: 'F9', requires: ['calc-mode', 'calculate-now'],
      check: (s, ses) => windowKeys(ses).includes('F9') },
    { id: 'iterative', teach: 'Alt, F, T opens Excel Options; on the Formulas page, I enables iterative calculation, which circular models need.', text: 'Open Excel Options and enable iterative calculation.', keys: 'Alt F T I ↵', requires: ['excel-options', 'iterative-calc'],
      check: iterOn },
    { id: 'qat-font', teach: 'Q opens the Quick Access Toolbar page: ↑ ↓ pick a command, A adds it, Enter is OK.', text: 'Add Font Color to the Quick Access Toolbar.', keys: 'Alt F T Q ↓ ×9 A ↵', requires: ['quick-access-toolbar'], convention: 'A2',
      check: (s, ses) => ses.settings.qat.includes('fontColor') },
    { id: 'qat-fill', text: 'Add Fill Color the same way.', keys: 'Alt F T Q ↓ ×8 A ↵', requires: ['quick-access-toolbar'],
      check: (s, ses) => ses.settings.qat.includes('fillColor') },
    { id: 'qat-borders', text: 'Add Borders.', keys: 'Alt F T Q ↓ ×2 A ↵', requires: ['quick-access-toolbar'],
      check: (s, ses) => ses.settings.qat.includes('borders') },
    { id: 'qat-dec', text: 'Add Decrease Decimal, the last of the four.', keys: 'Alt F T Q ↓ ×5 A ↵', requires: ['quick-access-toolbar'],
      check: (s, ses) => ses.settings.qat.includes('decDecimal') },
    { id: 'run-qat', teach: 'Alt alone numbers the toolbar 1–9; Alt then the number runs that command from anywhere.', text: 'Run one from the keyboard: Alt, then 2 — Undo, straight off the toolbar.', keys: 'Alt 2', requires: ['qat-run'],
      check: (s, ses) => windowKeys(ses).includes('Alt') && windowKeys(ses).includes('2') },
  ],
  endState: [
    { text: 'Iterative calculation stays on', check: iterOn },
    { text: 'The toolbar reads Save, Undo, Redo, Font Color, Fill Color, Borders, Decrease Decimal', check: qatIs },
  ],
  solution: 'F9 Alt F T I Enter Alt F T Q Down Down Down Down Down Down Down Down Down A Enter Alt F T Q Down Down Down Down Down Down Down Down A Enter Alt F T Q Down Down A Enter Alt F T Q Down Down Down Down Down A Enter Alt 2',
};
