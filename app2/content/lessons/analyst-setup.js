// Chapter 1 · 1.1.4 — Set Excel up like an analyst (clearcoat-weekly, S1b → S1c)
// Excel Options: know F9 and calculation mode (stays Automatic), iterative calculation on, Enter set
// to stay on the cell, and the four formatting commands every pass uses pinned to the Quick Access
// Toolbar, run with Alt+number. The learner-facing words live in content/copy/*.csv.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const iterOn = (s, ses) => ses.settings.iterative === true;
const enterStays = (s, ses) => ses.settings.enterMoves === false;
const QAT_AFTER = ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'];
const qatIs = (s, ses) => ses.settings.qat.length === QAT_AFTER.length && ses.settings.qat.every((x, i) => x === QAT_AFTER[i]);

export default {
  id: 'analyst-setup',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'clearcoat-weekly',
  state: { before: 'S1b', after: 'S1c' },
  title: 'Set Excel up like an analyst',
  difficulty: 'medium',
  tags: ['options', 'calculation', 'setup'],
  access: 'free',
  minutes: 6,
  headline: 'Alt F T',
  conventions: ['A1', 'A2'],
  teaches: ['excel-options', 'calc-mode', 'calculate-now', 'iterative-calc', 'enter-stays', 'quick-access-toolbar', 'qat-run'],
  prerequisites: ['ribbon-by-keyboard'],
  brief: 'Let’s make sure you have your settings configured like a pro. Calculation stays on Automatic, so every formula updates when a cell changes; iterative calculation goes on so a model that loops on purpose can settle; Enter is set to stay in the cell you typed in. And know F9: when a big model is switched to Manual to stay fast, nothing recalculates until you press it. Then we’ll put the commands you use most (font color, fill color, borders, decimals) on the Quick Access Toolbar, the row just under the Ribbon, so Alt and a number runs any of them. The key is `Alt F T`.',
  goals: [
    { id: 'f9', teach: 'Calculation is on Automatic here, so F9 does nothing you can see; on a model switched to Manual, F9 (Calculate Now) is the only thing that updates the numbers.', text: 'Press F9 once so your hands know where it is, even though on Automatic nothing visibly changes.', keys: 'F9', requires: ['calc-mode', 'calculate-now'],
      check: (s, ses) => windowKeys(ses).includes('F9') },
    { id: 'iterative', teach: 'Alt, F, T opens Excel Options; on the Formulas page, iterative calculation lets a model that loops on purpose settle instead of erroring out.', text: 'Open Excel Options and turn iterative calculation on.', keys: 'Alt F T I ↵', requires: ['excel-options', 'iterative-calc'],
      check: iterOn },
    { id: 'enter-stays', teach: 'With this off, Enter commits what you typed and stays on the cell, so you read it back before you move; the arrow keys do the moving.', text: 'On the Advanced page, turn off "After pressing Enter, move selection".', keys: 'Alt F T V Alt+M ↵', requires: ['excel-options', 'enter-stays'],
      check: enterStays },
    { id: 'qat-font', teach: 'Q opens the Quick Access Toolbar page: ↑ ↓ pick a command, A adds it, Enter is OK.', text: 'Add Font Color to the Quick Access Toolbar.', keys: 'Alt F T Q ↓ ×9 A ↵', requires: ['quick-access-toolbar'], convention: 'A2',
      check: (s, ses) => ses.settings.qat.includes('fontColor') },
    { id: 'qat-fill', teach: 'Fill Color is for the tint on the input block, later in the chapter.', text: 'Add Fill Color the same way.', keys: 'Alt F T Q ↓ ×8 A ↵', requires: ['quick-access-toolbar'],
      check: (s, ses) => ses.settings.qat.includes('fillColor') },
    { id: 'qat-borders', teach: 'Borders is where a total’s top border comes from, and you’ll put one on every page you build.', text: 'Add Borders.', keys: 'Alt F T Q ↓ ×2 A ↵', requires: ['quick-access-toolbar'],
      check: (s, ses) => ses.settings.qat.includes('borders') },
    { id: 'qat-dec', teach: 'Every figure column gets its decimals set, usually down to none.', text: 'Add Decrease Decimal, the last of the four.', keys: 'Alt F T Q ↓ ×5 A ↵', requires: ['quick-access-toolbar'],
      check: (s, ses) => ses.settings.qat.includes('decDecimal') },
    { id: 'run-qat', teach: 'Alt on its own numbers the toolbar 1 to 9, left to right, and Alt then the number runs that command from anywhere.', text: 'Run one from the keyboard by pressing Alt, reading the number over Undo on the toolbar (2 here) and pressing it.', keys: 'Alt 2', requires: ['qat-run'],
      check: (s, ses) => windowKeys(ses).includes('Alt') && windowKeys(ses).includes('2') },
  ],
  endState: [
    { text: 'Iterative calculation stays on', check: iterOn },
    { text: 'Enter stays on the cell', check: enterStays },
    { text: 'The toolbar reads Save, Undo, Redo, Font Color, Fill Color, Borders, Decrease Decimal', check: qatIs },
  ],
  wow: 'Your settings are set, and formatting is Alt and a number from here on.',
  closing: [
    'Calculation is on Automatic, iterative calculation is on, Enter stays put, and your four most-used formatting commands sit on the Quick Access Toolbar after Save, Undo and Redo: Alt+4 through Alt+7 here, and whatever numbers Alt shows on your toolbar. That’s the setup every analyst does once.',
    'Top-bucket tip: a full desk toolbar runs to eight or nine (font color, fill color, borders, increase and decrease decimal, paste values, freeze panes, group and ungroup), and most people delete Save, Undo and Redo from it, since Ctrl+S, Ctrl+Z and Ctrl+Y already exist, so the numbers 1 to 9 are all formatting.',
    'Best practice: two more settings on a new install, both in Excel Options (Alt, F, T). On General, switch off the Start screen so Excel opens on a blank workbook; under Accessibility, switch off "Provide feedback with animation" so the cursor stops gliding (older builds: Advanced, "Disable hardware graphics acceleration").',
  ],
  solution: 'F9 Alt F T I Enter Alt F T V Alt+M Enter Alt F T Q Down Down Down Down Down Down Down Down Down A Enter Alt F T Q Down Down Down Down Down Down Down Down A Enter Alt F T Q Down Down A Enter Alt F T Q Down Down Down Down Down A Enter Alt 2',
};
