// Chapter 1 · 1.1.4 — Set Excel up like an analyst (clearcoat-weekly, S1b → S1c)
// Excel Options: calculation stays Automatic (F9 is taught in the iterative goal's teach line, since on
// Automatic it has nothing to show), iterative calculation on, Enter set to stay on the cell, and the
// four formatting commands every pass uses pinned to the Quick Access Toolbar, then run with Alt+number
// on a real cell: Decrease Decimal trims 1.1.3's fee rate in Inputs!B7 from 2.50% to 2.5% (payoff pass,
// 2026-10-02). The learner-facing words live in content/copy/*.csv.
const iterOn = (s, ses) => ses.settings.iterative === true;
const enterStays = (s, ses) => ses.settings.enterMoves === false;
const QAT_AFTER = ['save', 'undo', 'redo', 'fontColor', 'fillColor', 'borders', 'decDecimal'];
const qatIs = (s, ses) => ses.settings.qat.length === QAT_AFTER.length && ses.settings.qat.every((x, i) => x === QAT_AFTER[i]);
const inputs = ses => { const e = ses.sheets.find(x => x.name === 'Inputs'); return e ? e.sheet : null; };
const rateTrimmed = (s, ses) => { const S = inputs(ses); return !!S && S.cellAt('B7').value === 0.025 && S.text('B7').trim() === '2.5%'; };

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
  uses: ['sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
  prerequisites: ['ribbon-by-keyboard'],
  brief: 'Let’s make sure you have your settings configured like a pro. Calculation stays on Automatic, so every formula updates when a cell changes, and F9 recalculates by hand on a big model switched to Manual; iterative calculation goes on so a model that loops on purpose can settle; Enter is set to stay in the cell you typed in. Then we’ll put the commands you use most (font color, fill color, borders, decimals) on the Quick Access Toolbar, the row just under the Ribbon, and run one on the fee rate from last lesson. The key is `Alt F T`.',
  goals: [
    { id: 'iterative', text: 'Open Excel Options and turn iterative calculation on.', keys: 'Alt F T I ↵', requires: ['excel-options', 'iterative-calc', 'calc-mode', 'calculate-now'],
      teach: 'Alt, F, T opens Excel Options; on the Formulas page, iterative calculation lets a model that loops on purpose (interest on debt, for one) settle instead of erroring out. Calculation stays on Automatic beside it, and on a big model switched to Manual to stay fast, F9 (Calculate Now) is what updates the numbers. Every desk turns iteration on, on day one.',
      hintStuck: 'pulse the Formulas page of Excel Options · It’s on the Formulas page of Options, and it only counts once the box is closed with OK.',
      check: iterOn },
    { id: 'enter-stays', text: 'On the Advanced page, turn off "After pressing Enter, move selection".', keys: 'Alt F T V Alt+M ↵', requires: ['excel-options', 'enter-stays'],
      teach: 'With this off, Enter commits what you typed and stays on the cell, so you read it back before you move; the arrow keys do the moving. It’s the setting the desks change first, and every lesson from here on assumes it.',
      hintStuck: 'pulse the Advanced page of Excel Options · Advanced is a long page; the setting is near the top, under Editing options.',
      check: enterStays },
    { id: 'qat-font', text: 'Add Font Color to the Quick Access Toolbar.', keys: 'Alt F T Q ↓ ×9 A ↵', requires: ['quick-access-toolbar'], convention: 'A2',
      teach: 'Q opens the Quick Access Toolbar page: ↑ ↓ pick a command, A adds it, Enter is OK. You’ll press these four commands more than anything else this week, and Alt plus a number is the shortest route to them there is. The toolbar sits under the Ribbon here, which is where most desks put it.',
      hintStuck: 'pulse the Add button · Added isn’t done until you OK the dialog. Check the toolbar under the Ribbon for the new button.',
      check: (s, ses) => ses.settings.qat.includes('fontColor') },
    { id: 'qat-fill', text: 'Add Fill Color the same way.', keys: 'Alt F T Q ↓ ×8 A ↵', requires: ['quick-access-toolbar'],
      teach: 'Fill Color is for the tint on the input block, later in the chapter. One Alt+number beats a trip into the Ribbon every time.',
      hintStuck: 'pulse the Add button · Same route: the goal counts once Fill Color is on the right-hand list and the box is OK’d.',
      check: (s, ses) => ses.settings.qat.includes('fillColor') },
    { id: 'qat-borders', text: 'Add Borders.', keys: 'Alt F T Q ↓ ×2 A ↵', requires: ['quick-access-toolbar'],
      teach: 'Borders is where a total’s top border comes from, and you’ll put one on every page you build.',
      hintStuck: 'pulse the command list · Borders sits near the top of the left-hand list.',
      check: (s, ses) => ses.settings.qat.includes('borders') },
    { id: 'qat-dec', text: 'Add Decrease Decimal, the last of the four.', keys: 'Alt F T Q ↓ ×5 A ↵', requires: ['quick-access-toolbar'],
      teach: 'Every figure column gets its decimals set, usually down to none. This button gets pressed more than you’d think, starting now.',
      hintStuck: 'pulse the command list · When it’s in, the toolbar reads seven buttons, ending with Decrease Decimal.',
      check: (s, ses) => ses.settings.qat.includes('decDecimal') },
    { id: 'run-qat', text: 'Run one from the toolbar: on Inputs, the fee rate in B7 reads 2.50%, so press Alt, then 7, the number over Decrease Decimal.', keys: 'Ctrl+PgDn ×2 Ctrl+↓ ↓ ×3 Tab ↓ then Alt 7', requires: ['qat-run', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
      teach: 'Alt on its own numbers the toolbar 1 to 9, left to right, and Alt then the number runs that command from anywhere. The numbers follow your own toolbar: this one starts with Save, Undo and Redo, so Decrease Decimal is 7 here, and on your own copy of Excel it may sit under another number. A rate reads to one decimal, and from now on that’s two keys away.',
      hintStuck: 'pulse the toolbar numbers · Land on B7 first, then press Alt on its own and read the number over Decrease Decimal.',
      check: rateTrimmed },
  ],
  endState: [
    { text: 'Iterative calculation stays on', check: iterOn },
    { text: 'Enter stays on the cell', check: enterStays },
    { text: 'The toolbar reads Save, Undo, Redo, Font Color, Fill Color, Borders, Decrease Decimal', check: qatIs },
    { text: 'The fee rate in B7 on Inputs reads 2.5%', check: rateTrimmed },
  ],
  wow: 'Your settings are set, and formatting is Alt and a number from here on.',
  closing: [
    'Calculation is on Automatic, iterative calculation is on, Enter stays put, and your four most-used formatting commands sit on the Quick Access Toolbar after Save, Undo and Redo: Alt+4 through Alt+7 here, and whatever numbers Alt shows on your toolbar. The fee rate on Inputs reads 2.5%, trimmed in two keys. That’s the setup every analyst does once.',
    'Top-bucket tip: a full desk toolbar runs to eight or nine (font color, fill color, borders, increase and decrease decimal, paste values, freeze panes, group and ungroup), and most people delete Save, Undo and Redo from it, since Ctrl+S, Ctrl+Z and Ctrl+Y already exist, so the numbers 1 to 9 are all formatting.',
    'Best practice: two more settings on a new install, both in Excel Options (Alt, F, T). On General, switch off the Start screen so Excel opens on a blank workbook; under Accessibility, switch off "Provide feedback with animation" so the cursor stops gliding (older builds: Advanced, "Disable hardware graphics acceleration").',
  ],
  solution: 'Alt F T I Enter Alt F T V Alt+M Enter Alt F T Q Down Down Down Down Down Down Down Down Down A Enter Alt F T Q Down Down Down Down Down Down Down Down A Enter Alt F T Q Down Down A Enter Alt F T Q Down Down Down Down Down A Enter Ctrl+PgDn Ctrl+PgDn Ctrl+Down Down Down Down Tab Down Alt 7',
};
