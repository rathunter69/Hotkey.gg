// Chapter 4 · 4.2.4 Data Validation and drop-downs (clearcoat-pack, S423 → S424)
// The case picker on Scenarios (C10) becomes a list drawn from Lists!L5:L7 and is set to Downside
// from its drop-down; a typed "Mangement" is refused and the Error Alert gets a message that says
// what to do; the site picker on Summary (C34) reads the unique site list from 4.2.3; and the washes
// a day inputs take only a whole number from 100 to 600. The closer types 700 and is refused.
import { scenarios, summary, ruleAt, sameText, settled } from './lib/pack-checks.js';
import { parseRef } from '../../engine/refs.js';

const CASES = ['Management', 'Base', 'Downside'];
const CODES = ['AUS-DOM', 'AUS-MUE', 'AUS-RIV', 'AUS-SLA', 'AUS-AIR', 'AUS-CED'];
const MSG = 'Pick a case from the list: Management, Base or Downside.';
/** The items a list rule offers, as the drop-down shows them. */
const items = (ses, sh, ref) => { const rule = ruleAt(sh, ref); if (!rule || rule.allow !== 'list') return []; return ses.validationItems(sh, rule, parseRef(ref)); };
const sameList = (got, want) => got.length === want.length && want.every((w, i) => sameText(got[i], w));
const casePicker = ses => sameList(items(ses, scenarios(ses), 'C10'), CASES);
const downside = ses => sameText(scenarios(ses).value('C10'), 'Downside');
const refused = ses => ses.keyLog.slice(ses.goalMark).some(k => k.k === '⚠');
const message = ses => { const r = ruleAt(scenarios(ses), 'C10'); return casePicker(ses) && !!r && String(r.errMsg || '').trim().length >= 10; };
const sitePicker = ses => sameList(items(ses, summary(ses), 'C34'), CODES);
const limit = ses => ['C5', 'D5', 'E5'].every(ref => { const r = ruleAt(scenarios(ses), ref); return !!r && r.allow === 'whole' && (r.data || 'between') === 'between' && +r.min === 100 && +r.max === 600; });

export default {
  id: 'data-validation-dropdowns',
  chapter: 'data-and-lookups',
  section: 'Lists and tables',
  module: 'lists-and-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S423', after: 'S424' },
  title: 'Data Validation and drop-downs',
  difficulty: 'medium',
  tags: ['data', 'lists', 'validation'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt A V V',
  conventions: ['B1', 'E9'],
  teaches: ['data-validation'],
  uses: ['go-to', 'shift-arrow', 'dialog-box', 'keytips', 'type-to-enter', 'escape-cancels', 'cross-sheet-ref', 'relative-absolute', 'remove-duplicates'],
  prerequisites: ['remove-duplicates'],
  brief: 'The case sheet has an input for the case name, and someone will type "Mangement". Data Validation (Alt, A, V, V) limits a cell to a list or a range of numbers, and shows a drop-down so the choice is picked, not typed. The list comes from Lists, so adding a case adds a choice. Wire the case picker and the site picker, and set a limit on the washes a day inputs. The key is `Alt A V V`.',
  goals: [
    { id: 'case-list', teach: 'Alt, A, V, V opens Data Validation on the selected cells. Allow List with a Source of cells turns each one into a drop-down of those cells, and anything else typed there is refused.', text: 'On Scenarios, C10 is the case picker: Alt, A, V, V, Allow List, Source =Lists!$L$5:$L$7, and OK.', keys: 'Ctrl+G "Scenarios!C10" ↵ Alt A V V L Tab "=Lists!$L$5:$L$7" ↵', requires: ['data-validation', 'go-to', 'cross-sheet-ref', 'relative-absolute'],
      hintStuck: 'pulse cell Scenarios!C10 · L jumps the Allow box to List; Tab moves to Source.',
      check: (s, ses) => settled(ses) && casePicker(ses) },
    { id: 'pick', text: 'Alt+Down on C10 opens the drop-down: pick Downside and press Enter.', keys: 'Alt+↓ D ↵', requires: ['data-validation'], convention: 'B1',
      hintStuck: 'pulse cell C10 · A letter jumps to the case that starts with it.',
      check: (s, ses) => settled(ses) && casePicker(ses) && downside(ses) },
    { id: 'refuse', text: 'Type Mangement into C10 and press Enter: read the refusal, then Esc to cancel it.', keys: '"Mangement" ↵ Esc', requires: ['escape-cancels', 'type-to-enter'],
      hintStuck: 'pulse cell C10 · Cancel throws the typing away and leaves Downside in the cell.',
      check: (s, ses) => settled(ses) && refused(ses) && downside(ses) },
    { id: 'message', text: 'Give the refusal a message that helps: on the Error Alert tab (Ctrl+PgDn twice), Alt+E and type what to pick.', keys: `Alt A V V Ctrl+PgDn ×2 Alt+E "${MSG}" ↵`, requires: ['data-validation', 'dialog-box'],
      hintStuck: `pulse cell C10 · Something like: ${MSG}`,
      check: (s, ses) => settled(ses) && message(ses) && downside(ses) },
    { id: 'sites', text: 'On Summary, C34 picks the site: a list rule with Source =Lists!$N$5:$N$10, the unique sites from the last lesson.', keys: 'Ctrl+G "Summary!C34" ↵ Alt A V V L Tab "=Lists!$N$5:$N$10" ↵', requires: ['data-validation', 'go-to', 'remove-duplicates'],
      hintStuck: 'pulse cell Summary!C34 · The site codes sit in N5:N10 on Lists.',
      check: (s, ses) => settled(ses) && sitePicker(ses) },
    { id: 'limit', text: 'On Scenarios, select the washes a day inputs C5:E5 and allow only a whole number between 100 and 600.', keys: 'Ctrl+G "Scenarios!C5" ↵ Shift+→ ×2 Alt A V V W Tab ×2 "100" Tab "600" ↵', requires: ['data-validation', 'go-to', 'shift-arrow'], convention: 'B1',
      hintStuck: 'pulse range Scenarios!C5:E5 · W picks Whole number; Tab twice reaches Minimum.',
      check: (s, ses) => settled(ses) && limit(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "D5" Enter "700" Enter Escape', cadence: 320 }, text: 'Does it hold? Watch 700 typed into the Base washes in D5 get refused, and 250 stay.', requires: [],
      hintStuck: 'pulse cell D5 · The rule allows 100 to 600, so 700 never lands.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The case picker C10 is a list from Lists!L5:L7, set to Downside, with an error message', check: (s, ses) => message(ses) && downside(ses) },
    { text: 'The site picker Summary!C34 is a list of the six site codes', check: (s, ses) => sitePicker(ses) },
    { text: 'The washes a day inputs C5:E5 take a whole number from 100 to 600', check: (s, ses) => limit(ses) },
  ],
  closing: [
    'Nobody can type a case that does not exist.',
    'Best practice: every picker reads its list from Lists, so a new case or a new site is one more cell there and the drop-down grows with it. A validation rule is not a check, though: a paste over the cell skips it, so the checks row still has the last word.',
  ],
  solution: 'Ctrl+G "Scenarios!C10" Enter Alt A V V L Tab "=Lists!$L$5:$L$7" Enter Alt+Down D Enter "Mangement" Enter Escape '
    + `Alt A V V Ctrl+PgDn Ctrl+PgDn Alt+E "${MSG}" Enter `
    + 'Ctrl+G "Summary!C34" Enter Alt A V V L Tab "=Lists!$N$5:$N$10" Enter '
    + 'Ctrl+G "Scenarios!C5" Enter Shift+Right Shift+Right Alt A V V W Tab Tab "100" Tab "600" Enter',
};
