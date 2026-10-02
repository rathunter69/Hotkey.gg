// Chapter 1 · 1.1.3 — The Ribbon by keyboard (clearcoat-weekly, S1a → S1b)
// KeyTips end to end: walk the tabs, back out with Esc one level at a time, then use each route for a
// real job the moment it is learned (payoff pass, 2026-10-02): Report's gridlines off, Inputs' estimated
// washes B6 given a thousands separator in Format Cells (Ctrl+1), and the card fee rate B7 made a
// percentage through the Ribbon route to the same dialog (Alt H O E). 1.1.4 trims B7's decimal from the
// Quick Access Toolbar. The learner-facing words live in content/copy/*.csv.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const reportGridOff = (s, ses) => { const e = ses.sheets.find(x => x.name === 'Report'); return !!e && e.sheet.gridlines === false; };
const inputs = ses => { const e = ses.sheets.find(x => x.name === 'Inputs'); return e ? e.sheet : null; };
const washesSeparated = (s, ses) => { const S = inputs(ses); return !!S && S.cellAt('B6').value === 9000 && S.text('B6').trim() === '9,000'; };
const rateIsPercent = (s, ses) => { const S = inputs(ses); return !!S && S.cellAt('B7').value === 0.025 && S.cellAt('B7').fmtStyle === 'percent' && /^2\.50?%$/.test(S.text('B7').trim()); };

export default {
  id: 'ribbon-by-keyboard',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'clearcoat-weekly',
  state: { before: 'S1a', after: 'S1b' },
  title: 'The Ribbon by keyboard',
  difficulty: 'easy',
  tags: ['ribbon', 'keytips', 'setup'],
  access: 'free',
  minutes: 6,
  headline: 'Alt',
  conventions: ['A3', 'A5'],
  teaches: ['keytips', 'ribbon-tabs', 'escape-backs-out', 'gridlines', 'format-cells-dialog', 'ribbon-route-dialog'],
  uses: ['sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
  prerequisites: ['know-the-screen'],
  brief: 'The Ribbon is the open secret of Excel power users, and the reason a mouse is taboo at elite firms. Unlike a normal shortcut, a Ribbon hotkey runs in sequence: press Alt, and every tab and command shows a letter; press the letters, and the command runs. The letters stay on screen to guide you, and with repetition you’ll type the sequence without looking. Walk it once, then put it to work: hide the gridlines on Report and make two of the inputs read the way a reader expects. The key is `Alt`.',
  goals: [
    { id: 'keytips', text: 'Open the Ribbon with Alt, step into Home › Font, then back all the way out with Esc.', keys: 'Alt H F then Esc ×3', requires: ['keytips', 'escape-backs-out'],
      teach: 'Alt puts a letter on every tab and every command; Esc backs out one level at a time. Once you know the letters, any command is three keys away and your hands never leave the keyboard.',
      hintStuck: 'pulse the KeyTips · Keep pressing Esc until the letters are gone. The goal counts once you’re all the way out.',
      check: (s, ses) => ses.mode === 'normal' && !ses.dialog && windowKeys(ses).includes('Alt') && windowKeys(ses).includes('F') },
    { id: 'tabs', text: 'Walk to the View tab with Alt, W, find Gridlines among its letters, and back out with Esc.', keys: 'Alt W then Esc ×2', requires: ['ribbon-tabs'],
      teach: 'The tab letters never change: H Home, N Insert, P Page Layout, M Formulas, A Data, W View. They’re the same on every copy of Excel you’ll ever sit at, so learn them once.',
      hintStuck: 'pulse the View tab · Alt first, wait for the letters, then W.',
      check: (s, ses) => ses.mode === 'normal' && windowKeys(ses).includes('W') && windowKeys(ses).includes('Alt') },
    { id: 'gridlines', text: 'Now run it: Alt, W, V, G hides the gridlines on Report.', keys: 'Alt W V G', requires: ['gridlines'], convention: 'A3',
      teach: 'View › Show › Gridlines (Alt, W, V, G) hides or shows the grid on the active sheet. Most people turn gridlines off on a page someone else reads; on a working sheet they can help. It’s a matter of preference, and the hotkey flips them either way.',
      hintStuck: 'pulse the Gridlines box on the View tab · It only switches the sheet you’re on, so check the tab bar says Report.',
      check: (s, ses) => onSheet(ses, 'Report') && reportGridOff(s, ses) },
    { id: 'ctrl1', text: 'On Inputs, the estimated washes in B6 read 9000: open Format Cells with Ctrl+1 and give them a thousands separator, no decimals.', keys: 'Ctrl+PgDn ×2 → Ctrl+↓ ↓ ×3 then Ctrl+1 N Tab N Alt+D 0 Alt+U ↵', requires: ['format-cells-dialog', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
      teach: 'From anywhere, Ctrl+1 opens Format Cells, the dialog where most formatting lives. Inside it, a letter picks from a list, Tab moves to the next field, and Alt with an underlined letter jumps to that field: Alt+D for Decimal places, Alt+U for the separator. Enter is OK and Esc is Cancel, and 9,000 reads at a glance where 9000 makes you count.',
      hintStuck: 'pulse the Format Cells dialog · On the Number page pick Number, set Decimal places to 0, tick the separator, then Enter.',
      check: washesSeparated },
    { id: 'ribbon-route', text: 'The card fee rate below it in B7 reads 0.025: open the same dialog the long way, Alt, H, O, E, and make it a Percentage.', keys: '↓ then Alt H O E N Tab P ↵', requires: ['ribbon-route-dialog', 'format-cells-dialog', 'arrow-keys'],
      teach: 'Every dialog also has a Ribbon route: Format Cells is Home › Format › Format Cells. When a shortcut slips your mind, the route still gets you there, so know both. A rate reads as a percentage, and the dialog gives it two decimals unless you say otherwise.',
      hintStuck: 'pulse Home › Format · O is Format, near the end of the Home tab; in the Category list, P goes to Percentage.',
      check: rateIsPercent },
  ],
  endState: [
    { text: 'Gridlines stay off on Report', check: reportGridOff },
    { text: 'B6 on Inputs reads 9,000', check: washesSeparated },
    { text: 'B7 on Inputs reads as a percentage', check: rateIsPercent },
  ],
  wow: 'Alt, then the letters. Every command in Excel is reachable without the mouse.',
  closing: [
    'Every tab and button on the Ribbon has a letter, and Esc backs out one level at a time. It’s the same on every copy of Excel, so there’s nothing to memorize except the handful of hotkeys you use every day, and Ctrl+1 for the dialog behind most of them.',
    'Report’s gridlines are off, which is what most people do to a page someone else reads, though they keep them on while they work. On Inputs, 9,000 washes and a 2.50% fee rate now read at a glance; the rate has one decimal more than it needs, and the next lesson trims it.',
  ],
  macNote: 'On a Mac, press and release ⌥ Option to show the letters (Excel for Mac in Microsoft 365). A few commands have no letter there; the ⌘ shortcut or the mouse fills the gap. In System Settings › Keyboard, turn on "Use F1, F2, etc. keys as standard function keys" so F2, F4 and F9 work without holding fn.',
  solution: 'Alt H F Escape Escape Escape Alt W Escape Escape Alt W V G Ctrl+PgDn Ctrl+PgDn Right Ctrl+Down Down Down Down Ctrl+1 N Tab N Alt+D 0 Alt+U Enter Down Alt H O E N Tab P Enter',
};
