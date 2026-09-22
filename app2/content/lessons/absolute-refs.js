// Foundations · Basic formulas — Relative and absolute references
import { isLiveFormula } from '../../engine/live.js';
/** The key was pressed since the current goal became current (the runner's key window, keyLog.slice(goalMark)). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);

const SHEET = {
  A1: { value: 'Weekly Sales Report', bold: true },
  D1: { value: 'Commission rate' }, E1: { value: 0.1, fontColor: 'blue' },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Commission', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 },
  A4: { value: 'Tuesday' }, B4: { value: 950 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 },
  A6: { value: 'Thursday' }, B6: { value: 1100 },
  A7: { value: 'Friday' }, B7: { value: 1675 },
};
const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;
const live = (s, ref) => isLiveFormula(s, ref);

export default {
  id: 'absolute-refs',
  chapter: 'foundations',
  section: 'Basic formulas',
  title: 'Relative and absolute references',
  difficulty: 'medium',
  tags: ['formulas', 'references'],
  access: 'free',
  concepts: ['relative-absolute', 'f4-anchor'],
  prerequisites: ['autosum', 'fill-down-right'],
  read: 'Fill a formula down and its references walk with it — usually what you want, fatal for the one cell that must not move. In this lesson $ anchors the commission rate in E1 so every filled row still reads it, and F4 types the anchors for you. This distinction is the number one beginner formula bug.',
  sheet: { cells: SHEET, active: { r: 3, c: 3 }, colW: { 1: 92, 4: 118 } },
  par: 18,
  goals: [
    { id: 'anchor', teach: 'A relative reference (B3) shifts when copied; $ anchors it: $B$3 never moves.', text: 'In C3, enter =B3*$E$1: Monday’s commission at the anchored rate.', keys: '"=B3*$E$1" ↵', requires: ['relative-absolute'], check: s => near(s.value('C3'), 120) && live(s, 'C3') },
    { id: 'fill', text: 'Select C3:C7 and fill down — every row shifts its day but keeps the one rate.', keys: 'Ctrl+G "C3:C7" ↵ then Ctrl+D', requires: ['relative-absolute', 'fill-down-right', 'go-to'], check: (s, ses) => near(s.value('C4'), 95) && near(s.value('C5'), 143) && near(s.value('C6'), 110) && near(s.value('C7'), 167.5) && live(s, 'C7') && used(ses, 'Ctrl+D') },
    { id: 'f4', teach: 'F4 cycles the anchors on the reference at the insertion point: E1, $E$1, E$1, $E1.', text: 'In D3, type =B3*E1, press F4 to anchor the rate, then commit.', keys: 'Ctrl+G "D3" ↵ "=B3*E1" F4 ↵', requires: ['f4-anchor', 'go-to'], check: (s, ses) => String(s.formula('D3') || '').includes('$E$1') && live(s, 'D3') && used(ses, 'F4') },
  ],
  closing: ['Blue E1, black formulas: the rate is typed once and referenced everywhere, which is why anchoring it matters. F4 keeps cycling if you press it again — twice gives E$1, row-only, for the mixed anchors Chapter 3 uses.'],
  solution: '"=B3*$E$1" Enter Ctrl+G "C3:C7" Enter Ctrl+D Ctrl+G "D3" Enter "=B3*E1" F4 Enter',
};
