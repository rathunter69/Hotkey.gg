// Foundations · Basic formulas — AutoSum
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  A8: { value: 'Total', bold: true },
  A11: { value: 'Quarter', bold: true }, B11: { value: 'Q1', bold: true }, C11: { value: 'Q2', bold: true }, D11: { value: 'Q3', bold: true }, E11: { value: 'Q4', bold: true }, F11: { value: 'Year', bold: true },
  A12: { value: 'Sales' }, B12: { value: 14200 }, C12: { value: 15100 }, D12: { value: 13800 }, E12: { value: 16400 },
};

export default {
  id: 'autosum',
  chapter: 'foundations',
  section: 'Basic formulas',
  title: 'AutoSum',
  difficulty: 'easy',
  tags: ['formulas'],
  access: 'free',
  concepts: ['autosum'],
  prerequisites: ['sum-family'],
  read: 'The most common formula in the world has its own key. In this lesson Alt+= proposes =SUM over the numbers above or beside you, fills a whole edge of a block at once, and totals a row. Watch how much typing it saves.',
  sheet: { cells: SHEET, active: { r: 8, c: 2 }, colW: { 1: 84 } },
  par: 12,
  goals: [
    { id: 'one-cell', teach: 'AutoSum (Alt+=) proposes =SUM over the numbers above or to the left; Enter accepts it.', text: 'On B8, press Alt+= and accept the proposal to total Sales.', keys: 'Alt+= ↵', requires: ['autosum'], check: (s, ses) => s.formula('B8') === '=SUM(B3:B7)' && used(ses, 'Alt') && used(ses, '=') },
    { id: 'through-blank', text: 'Select C3:C8 — through the empty total cell — and press Alt+= once.', keys: 'Ctrl+G "C3:C8" ↵ then Alt+=', requires: ['autosum', 'go-to'], check: (s, ses) => s.formula('C8') === '=SUM(C3:C7)' && used(ses, 'Alt') && used(ses, '=') },
    { id: 'row-total', text: 'Select B12:F12 and let one Alt+= put the year’s total in F12.', keys: 'Ctrl+G "B12:F12" ↵ then Alt+=', requires: ['autosum', 'go-to'], check: (s, ses) => s.formula('F12') === '=SUM(B12:E12)' && used(ses, 'Alt') && used(ses, '=') },
  ],
  closing: ['AutoSum reads the shape of your selection: a column through its empty last cell sums into that cell, a row does the same sideways, and a whole block grows a total edge in one press.'],
  solution: 'Alt+= Enter Ctrl+G "C3:C8" Enter Alt+= Ctrl+G "B12:F12" Enter Alt+=',
};
