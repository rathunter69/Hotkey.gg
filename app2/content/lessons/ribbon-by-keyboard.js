// Chapter 1 · 1.1.2 — The Ribbon by keyboard (voltline-weekly, S1a → S1b)
// KeyTips end to end: walk the tabs, back out with Esc one level at a time, turn Report's
// gridlines off (the one state change), and open Format Cells both ways.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const reportGridOff = (s, ses) => { const e = ses.sheets.find(x => x.name === 'Report'); return !!e && e.sheet.gridlines === false; };

export default {
  id: 'ribbon-by-keyboard',
  chapter: 'foundations',
  section: 'Open and set up',
  module: 'open-and-set-up',
  workbook: 'voltline-weekly',
  state: { before: 'S1a', after: 'S1b' },
  title: 'The Ribbon by keyboard',
  difficulty: 'easy',
  tags: ['ribbon', 'keytips', 'setup'],
  access: 'free',
  minutes: 5,
  headline: 'Alt',
  conventions: ['A3', 'A5'],
  teaches: ['keytips', 'ribbon-tabs', 'escape-backs-out', 'gridlines', 'format-cells-dialog', 'ribbon-route-dialog'],
  prerequisites: ['inherited-workbook'],
  brief: 'Every command in Excel is reachable without the mouse: Alt shows a letter on everything. Walk the Ribbon that way once, and turn the gridlines off on Report — it is a page people read, not a grid. The door is `Alt`.',
  goals: [
    { id: 'keytips', teach: 'Alt shows KeyTips: every tab and command has a letter, and Esc backs out one level at a time.', text: 'Open the Ribbon with Alt, step into Home › Font, then back all the way out with Esc.', keys: 'Alt H F then Esc Esc Esc', requires: ['keytips', 'escape-backs-out'],
      check: (s, ses) => ses.mode === 'normal' && !ses.dialog && windowKeys(ses).includes('Alt') && windowKeys(ses).includes('F') },
    { id: 'tabs', teach: 'The tab letters never change: H Home, N Insert, P Page Layout, M Formulas, A Data, W View.', text: 'Walk to the View tab with Alt, W, look at what lives there, and leave with Esc.', keys: 'Alt W then Esc Esc', requires: ['ribbon-tabs'],
      check: (s, ses) => ses.mode === 'normal' && windowKeys(ses).includes('W') && windowKeys(ses).includes('Alt') },
    { id: 'gridlines', teach: 'View › Show › Gridlines (Alt, W, V, G) toggles the grid on the active sheet only.', text: 'Report is a page someone reads: turn its gridlines off.', keys: 'Alt W V G', requires: ['gridlines'], convention: 'A3',
      check: (s, ses) => onSheet(ses, 'Report') && reportGridOff(s, ses) },
    { id: 'ctrl1', teach: 'Ctrl+1 opens Format Cells from anywhere — the dialog behind most formatting.', text: 'Open Format Cells with Ctrl+1, glance at its tabs, and close it with Esc.', keys: 'Ctrl+1 then Esc', requires: ['format-cells-dialog'],
      check: (s, ses) => !ses.dialog && ses.mode === 'normal' && windowKeys(ses).includes('Ctrl+1') },
    { id: 'ribbon-route', teach: 'Every dialog also has a Ribbon route — Format Cells is Home › Format › Format Cells, Alt, H, O, E.', text: 'Open the same dialog the long way, Alt, H, O, E, and close it again.', keys: 'Alt H O E then Esc ×4', requires: ['ribbon-route-dialog'],
      check: (s, ses) => !ses.dialog && ses.mode === 'normal' && windowKeys(ses).includes('O') && windowKeys(ses).includes('E') },
  ],
  endState: [
    { text: 'Gridlines stay off on Report', check: reportGridOff },
  ],
  solution: 'Alt H F Escape Escape Escape Alt W Escape Escape Alt W V G Ctrl+1 Escape Alt H O E Escape Escape Escape Escape',
};
