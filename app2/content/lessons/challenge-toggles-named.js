// Chapter 4 · 4.6.C Challenge: a model's toggles named and wired (seeded over S46C)
// The pack with its names stripped: the live column and the check read the switch as $C$11, the case
// picker reads the range on Lists, the names list on Inputs is empty, and the Name Manager holds a
// Ticket pointing at the live ticket on Scenarios and a stray Ticket_old. The learner names the switch,
// the cost per wash and the case list, re-points Ticket at Inputs C15 and deletes the stray, rewrites
// the switch formulas by name, drives the picker by name and pastes the list. The seed picks the case
// the picker shows (the outputs move with it); the workload never moves. Checks read the names the
// session holds, the parsed tokens of the cells the goals name, the picker's rule and the pasted list.
import { NAMES, CASES } from '../workbooks/clearcoat-pack.js';
import { parsFrom } from '../../app/pars.js';
import { liveByName, checkByName } from './naming-sparingly.js';
import { listMatches } from './name-manager.js';
import { pickerReads } from './validation-list-by-name.js';

const settled = ses => !ses.editing && !ses.dialog;
const names = ses => ses.names || {};
const namesDefined = ses => ['Case', 'Cost_Per_Wash', 'Cases'].every(n => names(ses)[n] === NAMES[n]);
const ticketFixed = ses => names(ses).Ticket === NAMES.Ticket && !('Ticket_old' in names(ses));

/** The seed: which case the picker shows when the file opens. */
export const pickedCase = rng => ({ 'Scenarios!C10': { value: CASES[Math.floor(rng() * CASES.length)], fontColor: 'blue' } });

export default {
  id: 'challenge-toggles-named',
  chapter: 'data-and-lookups',
  section: 'Names and structure',
  module: 'names-and-structure',
  workbook: 'clearcoat-pack',
  state: { before: 'S46C' },
  kind: 'challenge',
  title: 'Challenge: a model’s toggles named and wired',
  difficulty: 'hard',
  tags: ['challenge', 'names', 'scenarios', 'structure'],
  access: 'paid',
  minutes: 3,
  conventions: ['C9', 'E9'],
  prerequisites: ['validation-list-by-name'],
  brief: 'A model with its switch read by address, a broken Ticket and a stray in the Name Manager. Name the switch and the key inputs, fix the names, drive the picker by name and paste the list on Inputs.',
  timeLimit: 180,
  pars: parsFrom(70, { pass: 170, pro: 110 }),
  seed: pickedCase,
  goals: [
    { id: 'names', text: 'Name the switch on Scenarios C11 Case, Inputs C5 Cost_Per_Wash and the case list on Lists L5:L7 Cases.', convention: 'C9',
      keys: 'Ctrl+G "Scenarios!C11" ↵ Alt M M D "Case" ↵ Ctrl+G "Inputs!C5" ↵ Alt M M D "Cost_Per_Wash" ↵ Ctrl+G "Lists!L5:L7" ↵ Alt M M D "Cases" ↵',
      check: (s, ses) => namesDefined(ses) && settled(ses) },
    { id: 'fix-names', text: 'In the Name Manager point Ticket at Inputs C15, delete the stray Ticket_old and close it.', convention: 'C9',
      keys: 'Ctrl+F3 ↓ ×3 Alt+E Alt+R "=Inputs!$C$15" ↵ ↓ Alt+D ↵ Esc',
      check: (s, ses) => namesDefined(ses) && ticketFixed(ses) && settled(ses) },
    { id: 'switch-by-name', text: 'Make the live column G5:G8 and the check in C58 on Scenarios read the switch as Case.', convention: 'C9',
      keys: 'Ctrl+G "Scenarios!G5" ↵ "=CHOOSE(Case,C5,D5,E5)" ↵ Shift+↓ ×2 "=INDEX(C6:E6,Case)" Ctrl+↵ Ctrl+G "C58" ↵ "=ROUND(INDEX($D$54:$F$54,Case)-C24,0)" ↵',
      check: (s, ses) => liveByName(ses) && checkByName(ses) && settled(ses) },
    { id: 'picker', text: 'Point the case picker in Scenarios C10 at the name: Data Validation, List, Source =Cases.', convention: 'E9',
      keys: 'Ctrl+G "C10" ↵ Alt A V V Alt+C L Alt+S "=Cases" ↵',
      check: (s, ses) => pickerReads(ses, 'Scenarios', 'C10', 'Cases') && settled(ses) },
    { id: 'paste-list', text: 'Paste the names list on Inputs from B19 with F3 and Paste List.', convention: 'C9',
      keys: 'Ctrl+G "Inputs!B19" ↵ F3 Alt+L',
      check: (s, ses) => namesDefined(ses) && ticketFixed(ses) && listMatches(ses) && settled(ses) },
  ],
  graders: [
    ses => { if (!namesDefined(ses)) return { ok: false, why: 'a name is missing: Case on Scenarios C11, Cost_Per_Wash on Inputs C5 and Cases on Lists L5:L7' };
      if (!ticketFixed(ses)) return { ok: false, why: 'Ticket does not point at Inputs C15, or the stray Ticket_old is still in the Name Manager' };
      return { ok: true }; },
    ses => { if (!liveByName(ses)) return { ok: false, why: 'the live column G5:G8 still reads the switch by its address, or shows the wrong case' };
      if (!checkByName(ses)) return { ok: false, why: 'the check in C58 does not read Case, or does not read 0' };
      if (!pickerReads(ses, 'Scenarios', 'C10', 'Cases')) return { ok: false, why: 'the case picker in C10 does not read =Cases' };
      if (!listMatches(ses)) return { ok: false, why: 'the list on Inputs from B19 does not show every name and what it refers to' };
      return { ok: true }; },
  ],
  solution: 'Ctrl+G "Scenarios!C11" Enter Alt M M D "Case" Enter Ctrl+G "Inputs!C5" Enter Alt M M D "Cost_Per_Wash" Enter Ctrl+G "Lists!L5:L7" Enter Alt M M D "Cases" Enter Ctrl+F3 Down Down Down Alt+E Alt+R "=Inputs!$C$15" Enter Down Alt+D Enter Escape Ctrl+G "Scenarios!G5" Enter "=CHOOSE(Case,C5,D5,E5)" Enter Shift+Down Shift+Down "=INDEX(C6:E6,Case)" Ctrl+Enter Ctrl+G "C58" Enter "=ROUND(INDEX($D$54:$F$54,Case)-C24,0)" Enter Ctrl+G "C10" Enter Alt A V V Alt+C L Alt+S "=Cases" Enter Ctrl+G "Inputs!B19" Enter F3 Alt+L',
};
