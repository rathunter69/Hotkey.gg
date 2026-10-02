// Practice · Data and Lookups — Name it (screenplay 6.2). The scenarios model as module 4.5 left it
// (S456), with no names: the live column and the side-by-side check read the case number at $C$11.
// Name the switch and the two key inputs, point the live column and the check at the name, then jump
// to an input by its name. Graded on the workbook's names (what each refers to), on the parsed
// formulas (the name Case read, $C$11 gone) and on the figures, and on the jump's landing.
import { packDrill, solutionOf } from './pack-drills.js';
import { NAMES } from '../workbooks/clearcoat-pack.js';
import { liveByName, checkByName } from '../lessons/naming-sparingly.js';

const settled = ses => !ses.editing && !ses.dialog;
const named = (ses, name, ref) => (ses.names || {})[name] === ref;
const at = (ses, sheet, ref) => { const e = ses.sheets[ses.sheetIndex]; return !!e && e.name === sheet && e.sheet.selectionText() === ref; };
const jumped = ses => (ses.keyLog || []).slice(ses.goalMark || 0).some(e => /Ctrl\+G|F5/.test(e.k));

const GOALS = [
  { id: 'case', text: 'Name the case number in Scenarios C11 Case, with Alt, M, M, D.',
    keys: 'Ctrl+G "Scenarios!C11" ↵ Alt M M D "Case" ↵',
    check: (s, ses) => settled(ses) && named(ses, 'Case', NAMES.Case) },
  { id: 'inputs', text: 'Name the ticket in Inputs C15 Ticket and the cost per wash in Inputs C5 Cost_Per_Wash.',
    keys: 'Ctrl+G "Inputs!C15" ↵ Alt M M D "Ticket" ↵ Ctrl+G "Inputs!C5" ↵ Alt M M D "Cost_Per_Wash" ↵',
    check: (s, ses) => settled(ses) && named(ses, 'Ticket', NAMES.Ticket) && named(ses, 'Cost_Per_Wash', NAMES.Cost_Per_Wash) },
  { id: 'live', text: 'Rewrite the live column, Scenarios G5:G8, to read Case in place of $C$11.',
    keys: 'Ctrl+G "Scenarios!G5" ↵ "=CHOOSE(Case,C5,D5,E5)" ↵ Shift+↓ ×2 "=INDEX(C6:E6,Case)" Ctrl+↵',
    check: (s, ses) => settled(ses) && liveByName(ses) },
  { id: 'check', text: 'Point the check in C58 at Case too: =ROUND(INDEX($D$54:$F$54,Case)-C24,0).',
    keys: 'Ctrl+G "C58" ↵ "=ROUND(INDEX($D$54:$F$54,Case)-C24,0)" ↵',
    check: (s, ses) => settled(ses) && checkByName(ses) },
  { id: 'jump', text: 'Jump to the ticket by its name: Ctrl+G, type Ticket and press Enter.',
    keys: 'Ctrl+G "Ticket" ↵',
    check: (s, ses) => settled(ses) && at(ses, 'Inputs', 'C15') && jumped(ses) },
];

export default packDrill({
  id: 'ch4-name-it',
  title: 'Name it',
  task: 'Name the toggle and the key inputs, then jump to each by name.',
  module: 'names-and-structure',
  state: { before: 'S456' },
  goals: GOALS,
  endState: [
    { text: 'Case, Ticket and Cost_Per_Wash point at the switch and the two inputs', check: (s, ses) => named(ses, 'Case', NAMES.Case) && named(ses, 'Ticket', NAMES.Ticket) && named(ses, 'Cost_Per_Wash', NAMES.Cost_Per_Wash) },
    { text: 'The live column and the check read Case, not $C$11', check: (s, ses) => liveByName(ses) && checkByName(ses) },
  ],
  solution: solutionOf(GOALS),
  optimalKeys: 195,
  route: 40,
});
