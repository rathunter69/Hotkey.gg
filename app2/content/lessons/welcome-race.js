// Foundations · Welcome — three rounds: the platform plays the slow way itself while the learner
// watches, then the learner does the fast way with one shortcut. Both clocks show at the end.
const cells = { A1: { value: 'Invoice', bold: true }, B1: { value: 'Amount', bold: true } };
for (let i = 0; i < 31; i++) { cells['A' + (2 + i)] = { value: 'INV-' + (1001 + i) }; cells['B' + (2 + i)] = { value: 250 + ((i * 137) % 900) }; }
const LAST = 32;   // the last invoice row
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
/** Keys pressed since the current goal became current (the runner's key window). */
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const repeat = (key, n) => Array(n).fill(key).join(' ');

export default {
  id: 'welcome-race',
  chapter: 'foundations',
  section: 'Welcome',
  title: 'Welcome: three shortcuts',
  difficulty: 'easy',
  tags: ['welcome', 'navigation', 'selection'],
  access: 'free',
  concepts: ['arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow', 'go-to'],
  prerequisites: [],
  read: 'Excel is fast when your hands know the shortcuts and slow when they do not. Three rounds: watch the slow way play itself, then do the fast way with one shortcut, both on the clock. It is the whole idea of this site in under a minute.',
  sheet: { cells, active: { r: 2, c: 1 }, colW: { 1: 88, 2: 72 } },
  par: 20,
  goals: [
    { id: 'watch-crawl', demo: { script: repeat('Down', LAST - 2), cadence: 110 }, teach: 'The arrow keys move the active cell one cell at a time.', text: 'Watch: the arrow key crawls down to the last invoice, one row per press.', requires: ['arrow-keys'],
      check: (s, ses) => ses.demoDone.has('watch-crawl') },
    { id: 'ctrl-up', teach: 'Ctrl+Arrow jumps to the edge of the data in one press.', text: 'Your turn: jump back to the top of the list with Ctrl+↑.', keys: 'Ctrl+↑', requires: ['ctrl-arrow'],
      check: (s, ses) => at(s, 'A1') && windowKeys(ses).includes('Ctrl+↑') },
    { id: 'watch-select', demo: { script: 'Down ' + repeat('Shift+Down', LAST - 2), cadence: 110 }, teach: 'Shift+Arrow extends a selection one cell at a time.', text: 'Watch: Shift+↓ selects the invoices one row per press, all the way down.', requires: ['shift-arrow'],
      check: (s, ses) => ses.demoDone.has('watch-select') },
    { id: 'ctrl-shift-down', teach: 'Ctrl+Shift+Arrow selects to the edge of the data in one press.', text: 'Your turn: select the amounts B2:B32 with Ctrl+Shift+↓ from B2.', keys: '→ then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow'],
      check: (s, ses) => s.selectionText() === 'B2:B' + LAST && windowKeys(ses).includes('Ctrl+Shift+↓') },
    { id: 'watch-walk', demo: { script: repeat('Right', 4) + ' ' + repeat('Down', 18), cadence: 110 }, text: 'Watch: the arrow keys walk over to F20, one cell per press.', requires: ['arrow-keys'],
      check: (s, ses) => ses.demoDone.has('watch-walk') },
    { id: 'goto-home', teach: 'Go To (Ctrl+G) jumps to any cell you can name: type the reference and press Enter.', text: 'Your turn: go back to A1 with Ctrl+G, A1, Enter.', keys: 'Ctrl+G "A1" Enter', requires: ['go-to'],
      check: (s, ses) => at(s, 'A1') && windowKeys(ses).includes('Ctrl+G') },
  ],
  race: [
    { label: 'To the end of the list', slow: 'watch-crawl', fast: 'ctrl-up' },
    { label: 'Select the list', slow: 'watch-select', fast: 'ctrl-shift-down' },
    { label: 'Get to a cell', slow: 'watch-walk', fast: 'goto-home' },
  ],
  closing: [
    'That is the whole idea of hotkey.gg: every lesson puts one shortcut in your hands on a real sheet, so your fingers learn it rather than your notes.',
    'Read a line, do it guided, then do it solo and against the clock. No video, no classroom, no mouse.',
  ],
  solution: 'Ctrl+Up Right Ctrl+Shift+Down Ctrl+G "A1" Enter',
};
