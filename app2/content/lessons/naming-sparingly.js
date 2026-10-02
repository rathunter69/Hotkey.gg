// Chapter 4 · 4.6.1 Naming toggles and key inputs, sparingly (clearcoat-pack, S456 → S461)
// The pack's case switch sits on Scenarios at C11 and every live input reads it as $C$11. The
// learner names the switch Case, the blended ticket on Inputs Ticket and the cost per wash
// CostPerWash (4.6.2 renames it), then rewrites the live column G5:G8 and the side-by-side check in
// C58 to read Case. Checks read the defined names the session holds, and the parsed formula tokens of
// the cells the goals name (the switch read by name, never by its address); any route that leaves
// those names and formulas passes.
import { hintToScript } from '../../app/runner.js';
import { tokenize } from '../../engine/formula.js';
import { NAMES } from '../workbooks/clearcoat-pack.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const settled = ses => !ses.editing && !ses.dialog;
const named = (ses, name, ref) => (ses.names || {})[name] === ref;
/** A formula on Scenarios that reads the switch by the name Case and never by its address. */
export function readsCase(sh, ref) {
  const f = sh && sh.cellAt(ref).formula; if (!f) return false;
  let toks; try { toks = tokenize(f); } catch (e) { return false; }
  return toks.some(t => t.t === 'name' && t.v === 'CASE') && !toks.some(t => t.t === 'ref' && !t.sheet && t.v.replace(/\$/g, '') === 'C11');
}
const LIVE = ['G5', 'G6', 'G7', 'G8'];
/** The live column reads Case and still shows the picked case's column. */
export const liveByName = ses => { const sh = sheetOf(ses, 'Scenarios'); if (!sh) return false; const k = sh.value('C11');
  return LIVE.every(ref => readsCase(sh, ref) && sh.value(ref) === sh.value(['C', 'D', 'E'][k - 1] + ref.slice(1))); };
export const checkByName = ses => { const sh = sheetOf(ses, 'Scenarios'); return !!sh && readsCase(sh, 'C58') && sh.value('C58') === 0; };

export default {
  id: 'naming-sparingly',
  chapter: 'data-and-lookups',
  section: 'Names and structure',
  module: 'names-and-structure',
  workbook: 'clearcoat-pack',
  state: { before: 'S456', after: 'S461' },
  title: 'Naming toggles and key inputs, sparingly',
  difficulty: 'medium',
  tags: ['names', 'scenarios', 'structure'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt M M D',
  conventions: ['C9', 'E9'],
  teaches: ['names-sparingly'],
  uses: ['defined-name', 'go-to', 'keytips', 'ctrl-enter-fill', 'shift-arrow', 'formula-basics', 'check-cell'],
  prerequisites: ['challenge-a-three-case-model-with-a-sensitivity-table', 'ch3-assessment'],
  brief: 'You named one cell back in 1.3.5; now decide which cells deserve it. The rule is short: name the cells another sheet reads and a reviewer will hunt for, the case switch and the key inputs, and leave the cubes and the totals alone. Name the switch Case and two inputs, then rewrite the formulas that read the switch so they say Case instead of $C$11. The key is `Alt M M D`.',
  wow: 'Three cells got names, and each is one a reviewer would look for.',
  goals: [
    { id: 'name-case', teach: 'Define Name (Alt, M, M, D) names the selected cell. Pick the switch, not the picker beside it: C11 holds the case as a number, and that number is what every formula reads.',
      text: 'Name the case switch on Scenarios C11 Case with Define Name.',
      keys: 'Ctrl+G "Scenarios!C11" ↵ Alt M M D "Case" ↵', requires: ['names-sparingly', 'defined-name', 'go-to', 'keytips'], convention: 'C9',
      hintStuck: 'pulse cell C11 · The number under the picker is the switch; type Case over the suggested name.',
      check: (s, ses) => named(ses, 'Case', NAMES.Case) && settled(ses) },
    { id: 'name-inputs', teach: 'Inputs that formulas on other sheets read are the next to earn a name. The ticket and the cost per wash both live on Inputs and both turn up in the outputs, the break-even and the sensitivities.',
      text: 'Name the blended ticket on Inputs C15 Ticket and the cost per wash in Inputs C5 CostPerWash.',
      keys: 'Ctrl+G "Inputs!C15" ↵ Alt M M D "Ticket" ↵ Ctrl+G "Inputs!C5" ↵ Alt M M D "CostPerWash" ↵', requires: ['names-sparingly', 'defined-name', 'go-to', 'keytips'], convention: 'C9',
      hintStuck: 'pulse cell C15 · Go To takes the sheet name first: Inputs!C15, then Inputs!C5.',
      check: (s, ses) => named(ses, 'Ticket', NAMES.Ticket) && named(ses, 'CostPerWash', NAMES.Cost_Per_Wash) && settled(ses) },
    { id: 'live-column', teach: 'A name goes anywhere an address goes, and it never needs a dollar sign: it always means the same cell. Read the new formula aloud and it says what it does.',
      text: 'Rewrite the live column on Scenarios: =CHOOSE(Case,C5,D5,E5) in G5, then =INDEX(C6:E6,Case) down G6:G8.',
      keys: 'Ctrl+G "Scenarios!G5" ↵ "=CHOOSE(Case,C5,D5,E5)" ↵ Shift+↓ ×2 "=INDEX(C6:E6,Case)" Ctrl+↵', requires: ['names-sparingly', 'formula-basics', 'go-to', 'shift-arrow', 'ctrl-enter-fill'], convention: 'C9',
      hintStuck: 'pulse range G5:G8 · Case takes the place of $C$11; fill G6:G8 with one entry and Ctrl+Enter.',
      check: (s, ses) => liveByName(ses) && settled(ses) },
    { id: 'check-by-name', text: 'Rewrite the check in C58 to read the switch by name: =INDEX($C$54:$E$54,Case)-C24.',
      keys: 'Ctrl+G "C58" ↵ "=INDEX($C$54:$E$54,Case)-C24" ↵', requires: ['formula-basics', 'go-to', 'check-cell'],
      hintStuck: 'pulse cell C58 · The live case’s EBITDA in the side-by-side table, less the EBITDA above.',
      check: (s, ses) => checkByName(ses) && settled(ses) },
    { id: 'go-to-name', teach: 'Go To takes a name where it takes an address, so a reviewer who knows the switch is called Case lands on it from any sheet. That is the test for a name: would someone look for it?',
      text: 'Go To Case from the Inputs sheet and land on the switch.',
      keys: 'Ctrl+G "Inputs!A1" ↵ Ctrl+G "Case" ↵', requires: ['names-sparingly', 'go-to'],
      hintStuck: 'pulse cell C11 · Ctrl+G, type the name, Enter.',
      check: (s, ses) => { const i = ses.sheets.findIndex(e => e.name === 'Scenarios'); return ses.sheetIndex === i && ses.sheet.selectionText() === 'C11' && (ses.keyLog || []).slice(ses.goalMark || 0).some(e => /Ctrl\+G|F5/.test(e.k)) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Scenarios!C10" Enter "Downside" Enter Ctrl+G "G5" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch the picker switch to Downside and the live column, which now reads Case, move with it.', requires: [],
      hintStuck: 'pulse range G5:G8 · Case is still C11; only the way the formulas say it changed.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Case, Ticket and CostPerWash are defined on the switch and the two inputs', check: (s, ses) => named(ses, 'Case', NAMES.Case) && named(ses, 'Ticket', NAMES.Ticket) && named(ses, 'CostPerWash', NAMES.Cost_Per_Wash) },
    { text: 'The live column and the check read Case, not $C$11', check: (s, ses) => liveByName(ses) && checkByName(ses) },
  ],
  closing: [
    'Three names, each on a cell a reviewer would go looking for: the switch every input reads, and two inputs the outputs lean on. The live column now says what it does, INDEX of the row by Case.',
    'The rule for next time: if another sheet reads it and a reviewer would hunt for it, name it. The cube, the totals and the working cells stay as addresses, because a model with a hundred names is harder to read than one with none.',
  ],
  solution: hintToScript('Ctrl+G "Scenarios!C11" ↵ Alt M M D "Case" ↵ Ctrl+G "Inputs!C15" ↵ Alt M M D "Ticket" ↵ Ctrl+G "Inputs!C5" ↵ Alt M M D "CostPerWash" ↵ Ctrl+G "Scenarios!G5" ↵ "=CHOOSE(Case,C5,D5,E5)" ↵ Shift+↓ ×2 "=INDEX(C6:E6,Case)" Ctrl+↵ Ctrl+G "C58" ↵ "=INDEX($C$54:$E$54,Case)-C24" ↵ Ctrl+G "Inputs!A1" ↵ Ctrl+G "Case" ↵'),
};
