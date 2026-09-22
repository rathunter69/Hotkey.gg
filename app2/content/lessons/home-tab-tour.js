// Foundations · The Ribbon and dialogs — A tour of the Home tab
const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 },
  A4: { value: 'Tuesday' }, B4: { value: 950 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 },
  A6: { value: 'Thursday' }, B6: { value: 1100 },
  A7: { value: 'Friday' }, B7: { value: 1675 },
  A10: { value: 'Prepared by' }, B10: { value: 'Sales team' },
};
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'home-tab-tour',
  chapter: 'foundations',
  section: 'The Ribbon and dialogs',
  title: 'A tour of the Home tab',
  difficulty: 'easy',
  tags: ['ribbon', 'formatting'],
  access: 'free',
  concepts: ['bold-italic-underline'],
  prerequisites: ['dialog-boxes', 'go-to-cells'],
  read: 'The Home tab holds the everyday commands, and every one answers to Alt plus a short letter walk. In this lesson you grow the title, italicise a note, underline a name, and practise backing out of a walk you did not mean to start. The Home letters become reflexes fast because you use them constantly.',
  sheet: { cells: SHEET, active: { r: 1, c: 1 }, colW: { 1: 84 } },
  par: 14,
  goals: [
    { id: 'grow-title', text: 'Grow the title’s font one step with Alt, H, F, G.', keys: 'Alt H F G', requires: ['home-tab', 'keytips'], check: s => s.cellAt('A1').fsz === 16 },
    { id: 'italic-note', teach: 'Ctrl+B bold, Ctrl+I italic, Ctrl+U underline — and Alt, H, 1 / 2 / 3 from the Ribbon.', text: 'Italicise the Prepared by note in A10 with Alt, H, 2.', keys: 'Ctrl+G "A10" ↵ then Alt H 2', requires: ['bold-italic-underline', 'go-to'], check: s => s.cellAt('A10').it === true },
    { id: 'underline-name', text: 'Underline the team name in B10 with Alt, H, 3.', keys: 'Tab Alt H 3', requires: ['bold-italic-underline'], check: s => s.cellAt('B10').uline === true },
    { id: 'back-out', text: 'Open the Ribbon with Alt, step into Home, and back all the way out with Esc, changing nothing.', keys: 'Alt H Esc Esc', requires: ['escape-backs-out'], check: (s, ses) => used(ses, 'Alt') && used(ses, 'H') && ses.mode === 'normal' },
  ],
  endState: [
    { text: 'The title still shows the larger font', check: s => s.cellAt('A1').fsz === 16 },
    { text: 'A10 is still italic and B10 still underlined', check: s => s.cellAt('A10').it === true && s.cellAt('B10').uline === true },
  ],
  closing: ['Esc backs out one level at a time — dialog, menu, tab, gone — so a wrong turn on the Ribbon never costs more than a couple of taps.'],
  solution: 'Alt H F G Ctrl+G "A10" Enter Alt H 2 Tab Alt H 3 Alt H Escape Escape',
};
