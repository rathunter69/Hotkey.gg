// Chapter 5 · 5.2.C Challenge: a blank model shell to standard in three minutes (seeded over B52C)
// The model file as 5.2.1 found it, eight sheets shuffled, no timeline, no checks. The Cover, the names,
// LastHistorical, the formats, the IS helpers and the Checks catalog arrive planted. The learner orders the
// tabs, builds the timeline and the projection flag on Inputs, links row 4 to the six other sheets in one
// grouped entry, pulls the IS revenue history from Data by name and year, and makes the balance check
// live. The seed draws the accountants' FY26 retail and membership figures, so the history reads the
// learner's own Data.
import { challengeSeed, STATES } from '../workbooks/clearcoat-model.js';
import { parsFrom } from '../../app/pars.js';
import { settled, sheetIn, near, isNum, formatOnly, cellIn, formatsFrom, script, matches, tabsAre, cellsOf } from './lib/model-checks.js';

const ORDER = ['Cover', 'Inputs', 'IS', 'CF', 'BS', 'Schedules', 'Checks', 'DCF'];
const LINKED = ['IS', 'CF', 'BS', 'Schedules', 'Checks', 'DCF'];
const whole = (state, sheet, skip = new Set()) => Object.fromEntries(Object.keys(STATES[state].sheets.find(s => s.name === sheet).cells)
  .map(ref => [`${sheet}!${ref}`, skip.has(ref) ? formatOnly(cellIn(state, sheet, ref)) : cellIn(state, sheet, ref)]).filter(([, c]) => c));
const PLANT = {
  ...whole('B525', 'Cover'),
  ...whole('B525', 'Checks', new Set(cellsOf('C6:J6'))),
  'Checks!#condFmt': STATES.B525.sheets.find(s => s.name === 'Checks').condFmt,
  ...formatsFrom('B523', 'Inputs', cellsOf('C4:J10')),
  'Inputs!C11': cellIn('B523', 'Inputs', 'C11'),
  ...Object.assign({}, ...LINKED.map(name => formatsFrom('B523', name, cellsOf('C4:J4')))),
  ...Object.fromEntries(['A5', 'A6', 'A7'].map(ref => [`IS!${ref}`, cellIn('B526', 'IS', ref)])),
  ...formatsFrom('B526', 'IS', cellsOf('C5:E7')),
  '#names': { Case: 'Cover!$C$6', Circ: 'Inputs!$C$81', LastHistorical: 'Inputs!$C$11' },
};
const K = {
  order: 'Ctrl+PgDn ×5 Alt H O M ↑ ×5 ↵ Ctrl+PgDn ×4 Alt H O M ↑ ×3 ↵ Ctrl+PgDn ×6 Alt H O M ↑ ×5 ↵ Ctrl+PgDn ×5 Alt H O M ↑ ×4 ↵ Ctrl+PgDn ×2 Alt H O M ↑ ↵ Ctrl+PgDn ×3 Alt H O M ↑ ×2 ↵',
  timeline: 'Ctrl+G "Inputs!C4" ↵ "12/31/2024" ↵ → "=EOMONTH(C4,12)" ↵ Shift+→ ×6 Ctrl+R',
  flag: 'Ctrl+G "Inputs!C6" ↵ "=IF(C$4>LastHistorical,1,0)" ↵ Shift+→ ×7 Ctrl+R',
  linked: 'Ctrl+G "IS!C4" ↵ Ctrl+Shift+PgDn ×5 Ctrl+PgUp ×5 "=Inputs!C4" ↵ Shift+→ ×7 Ctrl+R Ctrl+PgUp',
  history: 'Ctrl+G "IS!C5:E7" ↵ "=INDEX(Data!$C$5:$F$44,MATCH($A5,Data!$B$5:$B$44,0),MATCH(YEAR(C$4),Data!$C$4:$F$4,0))" Ctrl+↵',
  checks: 'Ctrl+G "Checks!C6" ↵ "=ROUND(BS!C10-BS!C25,2)" ↵ Shift+→ ×7 Ctrl+R',
};
const yearOf = serial => new Date(Date.UTC(1899, 11, 30) + serial * 86400000).getUTCFullYear();
/** IS C5:E7 hold formulas reading what the learner's own Data holds for each line's mapped label and the column's year. */
function history(ses) {
  const is = sheetIn(ses, 'IS'), data = sheetIn(ses, 'Data');
  if (!is || !data) return false;
  const yearCol = y => ['C', 'D', 'E', 'F'].find(c => data.value(c + '4') === y);
  return cellsOf('C5:E7').every(ref => {
    const col = ref[0], r = ref.slice(1), label = is.value('A' + r), head = is.value(col + '4');
    if (!is.formula(ref) || !isNum(head)) return false;
    const yc = yearCol(yearOf(head)); if (!yc) return false;
    let row = null; for (let i = 5; i <= 44; i++) if (typeof data.value('B' + i) === 'string' && String(data.value('B' + i)).toLowerCase() === String(label).toLowerCase()) { row = i; break; }
    return row !== null && near(is.value(ref), data.value(yc + row), 1e-6);
  });
}
const timeline = ses => matches(ses, 'Inputs', 'C4:J4', 'B523');
const flagged = ses => matches(ses, 'Inputs', 'C6:J6', 'B523');
const linked = ses => LINKED.every(name => matches(ses, name, 'C4:J4', 'B523'));
const balanced = ses => matches(ses, 'Checks', 'C6:J6', 'B525');

export default {
  id: 'challenge-model-shell',
  chapter: 'finance-and-accounting',
  section: 'Model setup and efficiencies',
  module: 'model-setup',
  workbook: 'clearcoat-model',
  state: { before: 'B52C' },
  plant: PLANT,
  kind: 'challenge',
  title: 'Challenge: a blank model shell to standard in three minutes',
  difficulty: 'hard',
  tags: ['challenge', 'finance', 'model', 'timeline'],
  access: 'paid',
  minutes: 3,
  conventions: ['A4', 'F1'],
  prerequisites: ['drivers-block'],
  brief: 'Eight sheets in the wrong order, no timeline and no live checks. Order the tabs, build the timeline and its flag, link it everywhere, pull the revenue history from Data and make the balance check live.',
  timeLimit: 180,
  pars: parsFrom(80, { pass: 175, pro: 120 }),
  seed: rng => challengeSeed('challenge-model-shell', rng),
  goals: [
    { id: 'order', text: 'The tabs in order: Cover, Inputs, IS, CF, BS, Schedules, Checks, DCF.', convention: 'A4', keys: K.order,
      check: (s, ses) => settled(ses) && tabsAre(ses, ORDER) },
    { id: 'timeline', text: 'On Inputs, 12/31/2024 in C4 and =EOMONTH(C4,12) across D4:J4.', keys: K.timeline,
      check: (s, ses) => settled(ses) && timeline(ses) },
    { id: 'flag', text: 'The projection flag across C6:J6, reading LastHistorical.', keys: K.flag,
      check: (s, ses) => settled(ses) && flagged(ses) },
    { id: 'linked', text: 'Row 4 on IS, CF, BS, Schedules, Checks and DCF linked to Inputs, ending the group.', keys: K.linked,
      check: (s, ses) => settled(ses) && !ses.group && linked(ses) },
    { id: 'history', text: 'IS revenue in C5:E7 from Data by name and year, with INDEX/MATCH.', keys: K.history,
      check: (s, ses) => settled(ses) && history(ses) },
    { id: 'checks', text: 'The balance check live across Checks C6:J6, reading zero.', convention: 'F1', keys: K.checks,
      check: (s, ses) => settled(ses) && balanced(ses) },
  ],
  graders: [
    ses => (tabsAre(ses, ORDER) ? { ok: true } : { ok: false, why: 'the tabs do not read Cover, Inputs, IS, CF, BS, Schedules, Checks, DCF' }),
    ses => (timeline(ses) && flagged(ses) && linked(ses) ? { ok: true } : { ok: false, why: 'the timeline, its flag or a sheet’s row 4 does not read from the one date on Inputs' }),
    ses => (history(ses) ? { ok: true } : { ok: false, why: 'the revenue history in IS C5:E7 does not read what Data holds for each line and year' }),
    ses => (balanced(ses) ? { ok: true } : { ok: false, why: 'the balance check in Checks C6:J6 is not a live difference reading zero' }),
  ],
  solution: script(Object.values(K).join(' ')),
};
