// Chapter 4 · 4.6.3 A validation list driven by a name (clearcoat-pack, S462 → S463)
// The case picker on Scenarios C10 and the site picker on Summary C34 are Data Validation lists that
// read ranges on Lists (4.2.4). The learner names the case list Cases and the unique site list Sites,
// points each picker's Source at the name, and pastes the names list on Inputs again so it shows all
// five. Checks read the names the session holds, the validation rule on each picker (a List whose
// Source is the name), and the pasted list against the names.
import { hintToScript } from '../../app/runner.js';
import { NAMES } from '../workbooks/clearcoat-pack.js';
import { listMatches } from './name-manager.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const settled = ses => !ses.editing && !ses.dialog;
const named = (ses, name) => (ses.names || {})[name] === NAMES[name];
/** The picker at `ref` on `sheet` is a List whose Source is the name (=Cases, any case). */
export const pickerReads = (ses, sheet, ref, name) => { const sh = sheetOf(ses, sheet); const v = sh && sh.validation && sh.validation[ref];
  return !!v && v.allow === 'list' && String(v.source || '').replace(/\s/g, '').toUpperCase() === '=' + name.toUpperCase(); };

export default {
  id: 'validation-list-by-name',
  chapter: 'data-and-lookups',
  section: 'Names and structure',
  module: 'names-and-structure',
  workbook: 'clearcoat-pack',
  state: { before: 'S462', after: 'S463' },
  title: 'A validation list driven by a name',
  difficulty: 'medium',
  tags: ['names', 'validation', 'structure'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt A V V',
  conventions: ['C9', 'E9'],
  teaches: ['name-driven-list'],
  uses: ['data-validation', 'names-sparingly', 'name-manager', 'paste-list', 'defined-name', 'go-to', 'keytips'],
  prerequisites: ['name-manager'],
  brief: 'The case picker you built in 4.2.4 reads a range on Lists, so it breaks the day someone moves the list. Name the list Cases and the picker reads =Cases: the name follows the list wherever it goes, and works from any sheet. It is the pattern for every drop-down in the pack, a named list on Lists, a validation that reads the name, a MATCH that turns the choice into a number. The key is `Alt A V V`.',
  wow: 'Both pickers read a name, so the lists can move and the pickers won’t notice.',
  goals: [
    { id: 'name-cases', teach: 'Define Name works on a range as well as a cell: select the three cases and the name covers all of them. A list that a drop-down reads is the other kind of cell that earns a name.',
      text: 'Name the case list on Lists L5:L7 Cases with Define Name.',
      keys: 'Ctrl+G "Lists!L5:L7" ↵ Alt M M D "Cases" ↵', requires: ['name-driven-list', 'defined-name', 'go-to', 'keytips'], convention: 'C9',
      hintStuck: 'pulse range L5:L7 on Lists · Select the three cases first, then Alt M M D.',
      check: (s, ses) => named(ses, 'Cases') && settled(ses) },
    { id: 'case-picker', teach: 'Data Validation (Alt, A, V, V) on the picker: Clear All (Alt+C) empties the old rule, L picks List, and Source (Alt+S) takes =Cases. The = matters; without it the drop-down would offer the word Cases.',
      text: 'Point the case picker on Scenarios C10 at the name: Data Validation, List, Source =Cases.',
      keys: 'Ctrl+G "Scenarios!C10" ↵ Alt A V V Alt+C L Alt+S "=Cases" ↵', requires: ['name-driven-list', 'data-validation', 'go-to', 'keytips'], convention: 'E9',
      hintStuck: 'pulse cell C10 on Scenarios · Alt A V V, Alt+C to clear, L for List, Alt+S, then =Cases.',
      check: (s, ses) => pickerReads(ses, 'Scenarios', 'C10', 'Cases') && settled(ses) },
    { id: 'name-sites', text: 'Name the unique site list on Lists N5:N10 Sites.',
      keys: 'Ctrl+G "Lists!N5:N10" ↵ Alt M M D "Sites" ↵', requires: ['defined-name', 'go-to', 'keytips'], convention: 'C9',
      hintStuck: 'pulse range N5:N10 on Lists · The six codes 4.2.3 left, one row each.',
      check: (s, ses) => named(ses, 'Sites') && settled(ses) },
    { id: 'site-picker', text: 'Point the site picker on Summary C34 at =Sites the same way.',
      keys: 'Ctrl+G "Summary!C34" ↵ Alt A V V Alt+C L Alt+S "=Sites" ↵', requires: ['name-driven-list', 'data-validation', 'go-to', 'keytips'],
      hintStuck: 'pulse cell C34 on Summary · The site code the two-way lookup reads.',
      check: (s, ses) => pickerReads(ses, 'Summary', 'C34', 'Sites') && settled(ses) },
    { id: 'paste-again', teach: 'Paste List writes what the names are now, not what they were, so a list on the page goes stale the moment a name is added. Paste it over the old one.',
      text: 'Paste the names list again from Inputs B19 so it shows all five names.',
      keys: 'Ctrl+G "Inputs!B19" ↵ F3 Alt+L', requires: ['paste-list', 'go-to'], convention: 'C9',
      hintStuck: 'pulse cell B19 on Inputs · F3, then Alt+L for Paste List.',
      check: (s, ses) => named(ses, 'Cases') && named(ses, 'Sites') && listMatches(ses) && settled(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Scenarios!C10" Enter Alt+Down Down Enter Ctrl+G "G5" Enter Escape Escape', cadence: 360 },
      text: 'Does it tie? Watch the case picker drop down the three cases it reads through Cases, and the live column follow the pick.', requires: [],
      hintStuck: 'pulse cell C10 on Scenarios · The drop-down lists whatever the name Cases covers.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Cases and Sites name the two lists on Lists', check: (s, ses) => named(ses, 'Cases') && named(ses, 'Sites') },
    { text: 'The case picker reads =Cases and the site picker reads =Sites', check: (s, ses) => pickerReads(ses, 'Scenarios', 'C10', 'Cases') && pickerReads(ses, 'Summary', 'C34', 'Sites') },
    { text: 'The names list on Inputs shows all five names', check: (s, ses) => listMatches(ses) },
  ],
  closing: [
    'Two pickers now read names instead of addresses. Move the case list down five rows, or onto another sheet, and the name moves with it; the picker never notices.',
    'Every drop-down in a model you build should look like this: a named list on Lists, a validation that reads the name, and a MATCH beside it that turns the choice into a number the formulas use.',
  ],
  solution: hintToScript('Ctrl+G "Lists!L5:L7" ↵ Alt M M D "Cases" ↵ Ctrl+G "Scenarios!C10" ↵ Alt A V V Alt+C L Alt+S "=Cases" ↵ Ctrl+G "Lists!N5:N10" ↵ Alt M M D "Sites" ↵ Ctrl+G "Summary!C34" ↵ Alt A V V Alt+C L Alt+S "=Sites" ↵ Ctrl+G "Inputs!B19" ↵ F3 Alt+L'),
};
