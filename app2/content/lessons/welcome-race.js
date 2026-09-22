// Foundations · Welcome — the race: sixty invoices, once with the arrow key and once with Ctrl+↓.
// Both times are shown side by side at the end; the closing lines say what the platform does.
const cells = { A1: { value: 'Invoice', bold: true }, B1: { value: 'Amount', bold: true } };
for (let i = 0; i < 60; i++) { cells['A' + (2 + i)] = { value: 'INV-' + (1001 + i) }; cells['B' + (2 + i)] = { value: 250 + ((i * 137) % 900) }; }
const LAST = 'A61';
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
/** Keys pressed since the current goal became current (the runner's key window). */
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);

export default {
  id: 'welcome-race',
  chapter: 'foundations',
  section: 'Welcome',
  title: 'Welcome: the race',
  difficulty: 'easy',
  tags: ['welcome', 'navigation'],
  access: 'free',
  concepts: ['arrow-keys', 'ctrl-arrow'],
  prerequisites: [],
  read: 'Excel is fast when your hands know the shortcuts and slow when they do not. In this race you move down a list of sixty invoices twice: once with the arrow key, once with Ctrl+↓. Both times are shown side by side at the end.',
  sheet: { cells, active: { r: 2, c: 1 }, colW: { 1: 88, 2: 72 } },
  par: 20,
  goals: [
    { id: 'arrows', teach: 'The arrow keys move the active cell one cell at a time.', text: 'Press ↓ until you reach the last invoice, INV-1060 in A61.', keys: '↓ ×59', requires: ['arrow-keys'],
      check: (s, ses) => at(s, LAST) && windowKeys(ses).filter(k => k === '↓').length >= 50 },
    { id: 'back-to-top', teach: 'Ctrl+Arrow jumps to the edge of the data in one press.', text: 'Jump back to the top of the list with a single Ctrl+↑.', keys: 'Ctrl+↑', requires: ['ctrl-arrow'],
      check: (s, ses) => at(s, 'A1') && windowKeys(ses).includes('Ctrl+↑') },
    { id: 'ctrl-down', text: 'Now race it: reach A61 again with one Ctrl+↓.', keys: 'Ctrl+↓', requires: ['ctrl-arrow'],
      check: (s, ses) => at(s, LAST) && windowKeys(ses).includes('Ctrl+↓') },
  ],
  race: [{ goal: 'arrows', label: 'Arrow key, 59 presses' }, { goal: 'ctrl-down', label: 'Ctrl+↓, one press' }],
  closing: [
    'That is the whole idea of hotkey.gg: every lesson puts one shortcut in your hands on a real sheet, so your fingers learn it rather than your notes.',
    'Read a line, do it guided, then do it solo and against the clock. No video, no classroom, no mouse.',
  ],
  solution: Array(59).fill('Down').join(' ') + ' Ctrl+Up Ctrl+Down',
};
