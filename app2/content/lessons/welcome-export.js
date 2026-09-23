// Chapter 1 · 1.0.1 — Welcome: the feed in sixty seconds (module workbook: voltline-weekly, S0 → S0)
// Four moves, two rounds each, both played by the learner: the slow way on arrows, then the fast
// way on Ctrl+Arrow and Ctrl+Shift+Arrow, each on its own clock. Go To is not taught here (§6).
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
  brief: 'You are the analyst on the Voltline sale, and management just sent the Austin cluster’s 60-row site feed. Four moves, each run twice — the slow way, then the fast way — on the clock. The one that wins is `Ctrl+↓`.',
  goals: [
    { id: 'slow-down', slowRound: true, teach: 'The arrow keys move the active cell one cell per press — feel how long 60 rows takes.', text: 'Round one, the slow way: walk down the dates with ↓ until you reach the last one, A61.', keys: '↓ ×60', requires: ['arrow-keys'],
      check: (s, ses) => at(s, 'A61') && windowKeys(ses).includes('↓') },
    { id: 'fast-down', teach: 'Ctrl+Home returns to A1, and Ctrl+Arrow jumps to the edge of the data in one press.', text: 'Round two: back to the top with Ctrl+Home, then the same trip in one Ctrl+↓.', keys: 'Ctrl+Home then Ctrl+↓', requires: ['ctrl-home-end', 'ctrl-arrow'],
      check: (s, ses) => at(s, 'A61') && windowKeys(ses).includes('Ctrl+↓') },
    { id: 'slow-up', slowRound: true, text: 'Now back up the slow way: ↑ until you are on the header in A1.', keys: '↑ ×60', requires: ['arrow-keys'],
      check: (s, ses) => at(s, 'A1') && windowKeys(ses).includes('↑') },
    { id: 'fast-up', text: 'The fast way back: Ctrl+↓ to the bottom again, then one Ctrl+↑ to the top.', keys: 'Ctrl+↓ then Ctrl+↑', requires: ['ctrl-arrow'],
      check: (s, ses) => at(s, 'A1') && windowKeys(ses).includes('Ctrl+↑') },
    { id: 'slow-select', slowRound: true, teach: 'Shift+Arrow grows a selection one cell per press.', text: 'Now select: from the first Revenue figure E2, take one site’s twelve days with Shift+↓.', keys: 'Ctrl+→ ← ↓ then Shift+↓ ×11', requires: ['shift-arrow'],
      check: (s, ses) => s.selectionText() === 'E2:E13' && windowKeys(ses).includes('Shift+↓') },
    { id: 'fast-select', teach: 'Ctrl+Shift+Arrow selects to the edge of the data in one press — the same key as the jump, plus Shift.', text: 'The fast way: Ctrl+↑ to the top of the column, then the whole of Revenue in one Ctrl+Shift+↓.', keys: 'Ctrl+↑ then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow'],
      check: (s, ses) => s.selectionText() === 'E1:E60' && windowKeys(ses).includes('Ctrl+Shift+↓') },
    { id: 'slow-all', slowRound: true, text: 'Last move, the slow way: from A1, Shift+→ across to column M, then Shift+↓ down to row 67 — everything used on the sheet.', keys: 'Ctrl+Home then Shift+→ ×12 Shift+↓ ×66', requires: ['shift-arrow', 'ctrl-home-end'],
      check: (s, ses) => s.selectionText() === 'A1:M67' && windowKeys(ses).includes('Shift+↓') },
    { id: 'fast-all', text: 'The fast way: Ctrl+Home, then Ctrl+Shift+End takes everything from here to the last used cell in one press.', keys: 'Ctrl+Home then Ctrl+Shift+End', requires: ['ctrl-home-end', 'ctrl-shift-arrow'],
      check: (s, ses) => s.selectionText() === 'A1:M67' && windowKeys(ses).includes('Ctrl+Shift+End') },
  ],
  race: [
    { label: 'To the bottom of the feed', slow: 'slow-down', fast: 'fast-down' },
    { label: 'Back to the top', slow: 'slow-up', fast: 'fast-up' },
    { label: 'Select the Revenue column', slow: 'slow-select', fast: 'fast-select' },
    { label: 'Select everything used', slow: 'slow-all', fast: 'fast-all' },
  ],
  closing: [
    'That difference is the whole idea: your hands learn the fast way on a real sheet, job by job.',
    'This feed becomes a one-page weekly report — page one of the sale pack. You build it in this chapter.',
  ],
  solution: rep('Down', 60) + ' Ctrl+Home Ctrl+Down ' + rep('Up', 60) + ' Ctrl+Down Ctrl+Up Ctrl+Right Left Down ' + rep('Shift+Down', 11) + ' Ctrl+Up Ctrl+Shift+Down Ctrl+Home ' + rep('Shift+Right', 12) + ' ' + rep('Shift+Down', 66) + ' Ctrl+Home Ctrl+Shift+End',
};
