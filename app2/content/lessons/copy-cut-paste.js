// Foundations · Copy, paste and fill — Copy, cut and paste
const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  A10: { value: 'Prepared by' }, B10: { value: 'Sales team' },
};
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

export default {
  id: 'copy-cut-paste',
  chapter: 'foundations',
  section: 'Copy, paste and fill',
  title: 'Copy, cut and paste',
  difficulty: 'easy',
  tags: ['clipboard'],
  access: 'free',
  concepts: ['copy-cut-paste', 'paste-enter-drop'],
  prerequisites: ['formula-errors'],
  read: 'The clipboard moves work around the sheet: Ctrl+C copies, Ctrl+X moves, Ctrl+V lands it. In this lesson you copy the headers, move a note, drop a copy with plain Enter and cancel a marquee with Esc. These four keys are muscle memory within a week.',
  sheet: { cells: SHEET, active: { r: 2, c: 2 }, colW: { 1: 92 } },
  par: 14,
  goals: [
    { id: 'copy-paste', teach: 'Ctrl+C copies, Ctrl+X cuts, Ctrl+V pastes at the selection; Esc drops the marquee.', text: 'Copy the headers B2:C2 and paste them onto E2 with Ctrl+C and Ctrl+V.', keys: 'Shift+→ Ctrl+C then Ctrl+G "E2" ↵ Ctrl+V', requires: ['copy-cut-paste', 'shift-arrow', 'go-to'], check: (s, ses) => s.value('E2') === 'Sales' && s.value('F2') === 'Units' && used(ses, 'Ctrl+C') && used(ses, 'Ctrl+V') },
    { id: 'cut-paste', text: 'Cut the Prepared by label from A10 and paste it two rows down onto A12.', keys: 'Ctrl+G "A10" ↵ Ctrl+X Ctrl+G "A12" ↵ Ctrl+V', requires: ['copy-cut-paste', 'go-to'], check: (s, ses) => s.value('A12') === 'Prepared by' && s.value('A10') === null && used(ses, 'Ctrl+X') },
    { id: 'enter-drop', teach: 'After a copy, Enter pastes once and drops the marquee.', text: 'Copy the title in A1 and drop one copy onto A14 with a single Enter.', keys: 'Ctrl+Home Ctrl+C Ctrl+G "A14" ↵ ↵', requires: ['paste-enter-drop', 'go-to', 'ctrl-home-end'], check: (s, ses) => s.value('A14') === 'Weekly Sales Report' && !s.clipboard && used(ses, '↵') },
    { id: 'esc-marquee', text: 'Copy B3 and then change your mind: cancel the marquee with Esc.', keys: 'Ctrl+G "B3" ↵ Ctrl+C Esc', requires: ['copy-cut-paste', 'escape-cancels', 'go-to'], check: (s, ses) => !s.clipboard && used(ses, 'Ctrl+C') && used(ses, 'Esc') },
  ],
  closing: ['A cut leaves the source empty; a copy leaves it alone; Enter-paste is single-use. The marquee shows what is armed — no marquee, nothing pastes.'],
  solution: 'Shift+Right Ctrl+C Ctrl+G "E2" Enter Ctrl+V Ctrl+G "A10" Enter Ctrl+X Ctrl+G "A12" Enter Ctrl+V Ctrl+Home Ctrl+C Ctrl+G "A14" Enter Enter Ctrl+G "B3" Enter Ctrl+C Escape',
};
