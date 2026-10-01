// Chapter 1 · 1.1.3 — The Ribbon by keyboard (clearcoat-weekly, S1a → S1b)
// KeyTips end to end: walk the tabs, back out with Esc one level at a time, turn Report's
// gridlines off (the one state change), and open Format Cells both ways. The learner-facing
// words live in content/copy/*.csv.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const reportGridOff = (s, ses) => { const e = ses.sheets.find(x => x.name === 'Report'); return !!e && e.sheet.gridlines === false; };

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
  minutes: 5,
  headline: 'Alt',
  conventions: ['A3', 'A5'],
  teaches: ['keytips', 'ribbon-tabs', 'escape-backs-out', 'gridlines', 'format-cells-dialog', 'ribbon-route-dialog'],
  prerequisites: ['know-the-screen'],
  brief: 'The Ribbon is the open secret of Excel power users, and the reason a mouse is taboo at elite firms. Unlike a normal shortcut, a Ribbon hotkey runs in sequence: press Alt, and every tab and command shows a letter; press the letters, and the command runs. The letters stay on screen to guide you, and with repetition you’ll type the sequence without looking. Watch it once, then walk it yourself, and finish by hiding the gridlines on Report. The key is `Alt`.',
  goals: [
    { id: 'keytips', teach: 'Alt puts a letter on every tab and every command; Esc backs out one level at a time.', text: 'Open the Ribbon with Alt, step into Home › Font, then back all the way out with Esc.', keys: 'Alt H F then Esc ×3', requires: ['keytips', 'escape-backs-out'],
      check: (s, ses) => ses.mode === 'normal' && !ses.dialog && windowKeys(ses).includes('Alt') && windowKeys(ses).includes('F') },
    { id: 'tabs', teach: 'The tab letters never change: H Home, N Insert, P Page Layout, M Formulas, A Data, W View.', text: 'Walk to the View tab with Alt, W, look at what lives there, and leave with Esc.', keys: 'Alt W then Esc ×2', requires: ['ribbon-tabs'],
      check: (s, ses) => ses.mode === 'normal' && windowKeys(ses).includes('W') && windowKeys(ses).includes('Alt') },
    { id: 'gridlines', teach: 'View › Show › Gridlines (Alt, W, V, G) hides or shows the grid on the active sheet.', text: 'Hide the gridlines on Report.', keys: 'Alt W V G', requires: ['gridlines'], convention: 'A3',
      check: (s, ses) => onSheet(ses, 'Report') && reportGridOff(s, ses) },
    { id: 'ctrl1', teach: 'From anywhere, Ctrl+1 opens Format Cells, the dialog with six tabs across the top where most formatting lives.', text: 'Open Format Cells with Ctrl+1, glance at its tabs, and close it with Esc.', keys: 'Ctrl+1 then Esc', requires: ['format-cells-dialog'],
      check: (s, ses) => !ses.dialog && ses.mode === 'normal' && windowKeys(ses).includes('Ctrl+1') },
    { id: 'ribbon-route', teach: 'Every dialog also has a Ribbon route: Format Cells is Home › Format › Format Cells.', text: 'Open the same dialog the long way, Alt, H, O, E, and close it again.', keys: 'Alt H O E then Esc ×4', requires: ['ribbon-route-dialog'],
      check: (s, ses) => !ses.dialog && ses.mode === 'normal' && windowKeys(ses).includes('O') && windowKeys(ses).includes('E') },
  ],
  endState: [
    { text: 'Gridlines stay off on Report', check: reportGridOff },
  ],
  wow: 'Alt, then the letters. Every command in Excel is reachable without the mouse.',
  closing: [
    'Every tab and button on the Ribbon has a letter, and Esc backs out one level at a time. It’s the same on every copy of Excel, so there’s nothing to memorize except the handful of hotkeys you use every day.',
    'Report’s gridlines are off, which is what most people do to a page someone else reads, though they keep them on while they work. It’s a matter of preference, and Alt W V G flips them either way.',
  ],
  macNote: 'On a Mac, press and release ⌥ Option to show the letters (Excel for Mac in Microsoft 365). A few commands have no letter there; the ⌘ shortcut or the mouse fills the gap. In System Settings › Keyboard, turn on "Use F1, F2, etc. keys as standard function keys" so F2, F4 and F9 work without holding fn.',
  solution: 'Alt H F Escape Escape Escape Alt W Escape Escape Alt W V G Ctrl+1 Escape Alt H O E Escape Escape Escape Escape',
};
