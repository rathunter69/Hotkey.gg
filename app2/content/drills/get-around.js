// Practice · Foundations — Get around the report (screenplay 6.1; built from Edge jumps, Go anywhere
// and Block select). Nothing on the sheet changes: the end state graded is where the cursor and the
// selection stand, on the sheet the goal names, whatever keys put them there.
import { parsFromRoute } from '../../app/pars.js';
import { reportPage, costsPage, cutFrom, at, selIs } from './austin.js';
import { colLetter } from '../../engine/refs.js';

const REPORT = reportPage();
const COSTS = costsPage();
const start = cutFrom(REPORT, (cells, sh) => { sh.active = { r: 5, c: 1 }; });
const onReport = (ses, fn) => ses.sheetIndex === 0 && fn();

export default {
  id: 'get-around',
  chapter: 'foundations',
  title: 'Get around the report',
  task: 'Get around the report by its edges and by address, select its blocks, a row and a column, and visit Costs.',
  access: 'free',
  sheet: start,
  sheets: [{ name: 'Report' }, COSTS.sheet],
  goals: [
    { id: 'total', text: 'Jump down to the Total row in A10.', keys: 'Ctrl+↓', check: (s, ses) => onReport(ses, () => at(s, 'A10')) },
    { id: 'edge', text: 'Jump to the right edge of the Total row, F10.', keys: 'Ctrl+→', check: (s, ses) => onReport(ses, () => at(s, 'F10')) },
    { id: 'top', text: 'Jump up to the Gross profit header in F4.', keys: 'Ctrl+↑', check: (s, ses) => onReport(ses, () => at(s, 'F4')) },
    { id: 'check', text: 'Go straight to the check in B25.', keys: 'Ctrl+G "B25" ↵', check: (s, ses) => !ses.dialog && onReport(ses, () => at(s, 'B25')) },
    { id: 'home', text: 'Snap home to B5, the first figure under the frozen panes.', keys: 'Ctrl+Home', check: (s, ses) => onReport(ses, () => at(s, 'B5')) },
    { id: 'block', text: 'Select the site figures B5:F9 in one jump.', keys: 'Ctrl+G "B5:F9" ↵', check: (s, ses) => !ses.dialog && onReport(ses, () => selIs(s, 'B5:F9')) },
    { id: 'days', text: 'Select the washes by day, B17:G21, from B17 by its edges.', keys: 'Ctrl+G "B17" ↵ Ctrl+Shift+↓ Ctrl+Shift+→', check: (s, ses) => !ses.dialog && onReport(ses, () => selIs(s, 'B17:G21')) },
    { id: 'row', text: 'Select all of row 10, the Total row.', keys: 'Ctrl+G "A10" ↵ Shift+Space', check: (s, ses) => onReport(ses, () => selIs(s, `A10:${colLetter(s.cols)}10`)) },
    { id: 'column', text: 'Select all of column D, Revenue.', keys: 'Ctrl+G "D4" ↵ Ctrl+Space', check: (s, ses) => onReport(ses, () => selIs(s, `D1:D${s.rows}`)) },
    { id: 'costs', text: 'Go to Monday’s card fees on Costs, B8.', keys: 'Ctrl+G "Costs!B8" ↵', check: (s, ses) => !ses.dialog && ses.sheetIndex === 1 && at(s, 'B8') },
    { id: 'back', text: 'Go back to Report and snap home to B5.', keys: 'Ctrl+PgUp Ctrl+Home', check: (s, ses) => onReport(ses, () => at(s, 'B5')) },
  ],
  solution: 'Ctrl+Down Ctrl+Right Ctrl+Up Ctrl+G "B25" Enter Ctrl+Home Ctrl+G "B5:F9" Enter Ctrl+G "B17" Enter Ctrl+Shift+Down Ctrl+Shift+Right Ctrl+G "A10" Enter Shift+Space Ctrl+G "D4" Enter Ctrl+Space Ctrl+G "Costs!B8" Enter Ctrl+PgUp Ctrl+Home',
  optimalKeys: 46,
  route: 30,
  pars: parsFromRoute(30),
};
