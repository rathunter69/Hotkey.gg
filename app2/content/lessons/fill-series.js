// Foundations · Copy, paste and fill — Fill Series
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

const SHEET = {
  A1: { value: 'Ten-Day Sales Plan', bold: true },
  A2: { value: 'Day #', bold: true }, B2: { value: 'Target', bold: true }, C2: { value: 'Week 1', bold: true },
  A3: { value: 1 }, B3: { value: 100 },
  A4: { value: 2 }, B4: { value: 110 },
};

export default {
  id: 'fill-series',
  chapter: 'foundations',
  section: 'Copy, paste and fill',
  title: 'Fill Series',
  difficulty: 'easy',
  tags: ['fill'],
  access: 'free',
  concepts: ['fill-series'],
  prerequisites: ['paste-special'],
  read: 'Numbering rows by hand is beneath you. In this lesson Fill Series reads the step your first two cells set — 1, 2 and 100, 110 — and continues each run for you, while Ctrl+R shows the difference between filling a series and copying a value. Timelines in every model start exactly like this.',
  sheet: { cells: SHEET, active: { r: 3, c: 1 }, colW: { 1: 72 } },
  par: 12,
  goals: [
    { id: 'series-1', teach: 'Fill Series (Alt, H, F, I, S) continues the step your first two cells set.', text: 'Select A3:A12 and fill the day numbers 1 to 10 with Fill Series.', keys: 'Ctrl+G "A3:A12" ↵ then Alt H F I S ↵', requires: ['fill-series', 'go-to'], check: s => s.value('A7') === 5 && s.value('A12') === 10 },
    { id: 'series-step', text: 'Select B3:B12 and fill the targets — the series continues in steps of 10.', keys: 'Ctrl+G "B3:B12" ↵ then Alt H F I S ↵', requires: ['fill-series', 'go-to'], check: s => s.value('B7') === 140 && s.value('B12') === 190 },
    { id: 'copy-not-series', text: 'Select C2:E2 and fill right with Ctrl+R — a plain fill copies, it does not count.', keys: 'Ctrl+G "C2:E2" ↵ then Ctrl+R', requires: ['fill-down-right', 'go-to'], check: (s, ses) => s.value('D2') === 'Week 1' && s.value('E2') === 'Week 1' && used(ses, 'Ctrl+R') },
  ],
  closing: ['Fill Series is arithmetic: first cell, step, done. Excel’s Flash Fill (Ctrl+E) goes further — it fills a column by the pattern of your worked examples, splitting names or building codes; it arrives here with the data chapter.'],
  solution: 'Ctrl+G "A3:A12" Enter Alt H F I S Enter Ctrl+G "B3:B12" Enter Alt H F I S Enter Ctrl+G "C2:E2" Enter Ctrl+R',
};
