// Chapter 1 · 1.0.1 — Welcome: the feed in sixty seconds (module workbook: voltline-weekly, S0 → S0)
// Two rounds per move, both played by the learner: the slow way on arrows, then the fast way on
// Ctrl+Arrow, each on its own clock. Go To is not taught here (framework §6).
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const rep = (k, n) => Array(n).fill(k).join(' ');

export default {
  id: 'welcome-export',
  chapter: 'foundations',
  section: 'Welcome',
  module: 'welcome',
  workbook: 'voltline-weekly',
  state: { before: 'S0', after: 'S0' },
  title: 'Welcome: the feed in sixty seconds',
  difficulty: 'easy',
  tags: ['welcome', 'navigation', 'selection'],
  access: 'free',
  minutes: 3,
  headline: 'Ctrl+Arrow',
  conventions: ['A5'],
  teaches: ['arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow', 'ctrl-home-end'],
  prerequisites: [],
  brief: 'You are the analyst on the Voltline sale, and management just sent the Austin cluster’s 60-row site feed. Every move here runs twice — the slow way, then the fast way — on the clock. The one that wins is `Ctrl+↓`.',
  goals: [
    { id: 'slow-down', slowRound: true, teach: 'The arrow keys move the active cell one cell per press — feel how long 60 rows takes.', text: 'Round one, the slow way: walk down the dates with ↓ until you reach the last one, A61.', keys: '↓ ×60', requires: ['arrow-keys'],
      check: (s, ses) => at(s, 'A61') && windowKeys(ses).includes('↓') },
    { id: 'fast-down', teach: 'Ctrl+Home returns to A1, and Ctrl+Arrow jumps to the edge of the data in one press.', text: 'Round two: back to the top with Ctrl+Home, then the same trip in one Ctrl+↓.', keys: 'Ctrl+Home then Ctrl+↓', requires: ['ctrl-home-end', 'ctrl-arrow'],
      check: (s, ses) => at(s, 'A61') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'slow-select', teach: 'Shift+Arrow grows a selection one cell per press.', text: 'Now select: from the first Revenue figure E2, take one site’s twelve days with Shift+↓.', keys: 'Ctrl+Home Ctrl+→ ← ↓ then Shift+↓ ×11', requires: ['shift-arrow'],
      check: (s, ses) => s.selectionText() === 'E2:E13' && windowKeys(ses).includes('Shift+↓') },
    { id: 'fast-select', teach: 'Ctrl+Shift+Arrow selects to the edge of the data in one press.', text: 'The fast way: Ctrl+↑ to the top of the column, then the whole of Revenue in one Ctrl+Shift+↓.', keys: 'Ctrl+↑ then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow'],
      check: (s, ses) => s.selectionText() === 'E1:E60' && windowKeys(ses).includes('Ctrl+Shift+↓') },
    { id: 'home', text: 'Finish where every job starts: Ctrl+Home, back to A1.', keys: 'Ctrl+Home', requires: ['ctrl-home-end'],
      check: (s, ses) => at(s, 'A1') && windowKeys(ses).includes('Ctrl+Home') },
  ],
  race: [
    { label: 'To the bottom of the feed', slow: 'slow-down', fast: 'fast-down' },
    { label: 'Select the Revenue column', slow: 'slow-select', fast: 'fast-select' },
  ],
  closing: [
    'That difference is the whole idea: your hands learn the fast way on a real sheet, job by job.',
    'This feed becomes a one-page weekly report — page one of the sale pack. You build it in this chapter.',
  ],
  solution: rep('Down', 60) + ' Ctrl+Home Ctrl+Down Ctrl+Home Ctrl+Right Left Down ' + rep('Shift+Down', 11) + ' Ctrl+Up Ctrl+Shift+Down Ctrl+Home',
};
