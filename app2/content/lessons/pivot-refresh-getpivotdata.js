// Chapter 4 · 4.4.3 Refresh and GETPIVOTDATA (clearcoat-pack, S442 → S443)
// The pivot on Cuts laid out as the cube again (week down, site across, washes), the controller's
// correction typed on Export and on the Domain tab's own copy of the week (or the roll-up check on
// Summary stops reading zero), the pivot seen to hold its old figure until Alt+F5, then read from
// Summary by GETPIVOTDATA with a check beside it against the SUMIFS cube, and turned round (site
// down, week across) with the GETPIVOTDATA still finding Domain. The labels on Summary are planted.
import { pivotLike, current, settled, calls, reads, near, summary, exportSheet, sheetIn } from './lib/pack-scenario-checks.js';
import { PIVOTS, PIVOT_FIX, PIVOT_READ, CUTS, stateOf } from '../workbooks/clearcoat-pack.js';

const CUBE = { row: 'Week', col: 'Site', value: 'Total washes' };
const DOM = 'AUS-DOM';
/** Domain's washes as the export holds them now. */
const domainWashes = ses => { const X = exportSheet(ses); let t = 0; for (let r = 5; r <= 94; r++) if (X.value('B' + r) === DOM) t += X.value('E' + r) || 0; return t; };
const fixed = ses => !!exportSheet(ses) && exportSheet(ses).value(PIVOT_FIX.ref) === PIVOT_FIX.value;
const TAB_WAS = stateOf('S442').sheets.find(x => x.name === PIVOT_FIX.tab).cells[PIVOT_FIX.tabRef].value;
const tabFixed = ses => { const t = sheetIn(ses, PIVOT_FIX.tab); return !!t && !t.formula(PIVOT_FIX.tabRef) && t.value(PIVOT_FIX.tabRef) === TAB_WAS + 10; };
const rollupTies = ses => { const sh = summary(ses); return !!sh && near(sh.value('C76'), 0); };
const reader = ses => { const sh = summary(ses); return !!sh && calls(sh, 'I14', ['GETPIVOTDATA']) && near(sh.value('I14'), domainWashes(ses)); };
const tie = ses => { const sh = summary(ses); return !!sh && reads(sh, 'I15', ['I14', 'F15']) && near(sh.value('I15'), 0); };
const swapped = ses => { const x = pivotLike(ses, PIVOTS.S443); return !!x && x.name === CUTS && current(ses, x); };
const q = f => `'${f}'`;
const F = { gpd: PIVOT_READ.formulas.I14, tie: PIVOT_READ.formulas.I15 };

export default {
  id: 'pivot-refresh-getpivotdata',
  chapter: 'data-and-lookups',
  section: 'Pivot tables',
  module: 'pivot-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S442', after: 'S443' },
  plant: Object.fromEntries([...Object.entries(PIVOT_READ.labels), ...Object.entries(PIVOT_READ.formats)].map(([k, v]) => ['Summary!' + k, v])),
  title: 'Refresh and GETPIVOTDATA',
  difficulty: 'medium',
  tags: ['pivot tables', 'summaries', 'checks'],
  access: 'paid',
  minutes: 6,
  headline: 'Alt+F5',
  conventions: ['F1', 'B2'],
  teaches: ['pivot-refresh', 'getpivotdata'],
  uses: ['pivot-table', 'pivot-value-settings', 'go-to', 'sheet-reference', 'check-cell'],
  prerequisites: ['pivot-group-values'],
  brief: 'A pivot holds a snapshot of its source and shows it until you refresh it with Alt+F5, which is why the standard never builds a model on one. When a page has to read a pivot, GETPIVOTDATA fetches a figure by its labels, so the reference survives a rearrangement. The controller has resent Domain’s first day: correct the export and the site tab, refresh the pivot, read it from Summary with a check beside it, and turn the pivot round to prove the reference holds. The key is `Alt+F5`.',
  goals: [
    { id: 'cube', text: 'On Cuts, reopen the field list and lay the pivot out as the cube: Week down, Site across, Total washes in Values.', keys: 'Ctrl+G "Cuts!A3" ↵ Shift+F10 D End ↑ ↑ R Home ↓ C ↓ ×3 V ↵', requires: ['pivot-table', 'pivot-value-settings', 'go-to'],
      hintStuck: 'pulse the field list · R sends a field down, C across, V into Values.',
      check: (s, ses) => settled(ses) && !!pivotLike(ses, CUBE) },
    { id: 'correct', text: `Type the controller’s correction: Domain’s member washes on its first day, Export!D5, are ${PIVOT_FIX.value}.`, keys: `Ctrl+G "Export!D5" ↵ "${PIVOT_FIX.value}" ↵`, requires: ['go-to', 'sheet-reference'],
      hintStuck: `pulse cell Export!D5 · It reads ${PIVOT_FIX.value - 10} today.`,
      check: (s, ses) => settled(ses) && fixed(ses) },
    { id: 'tab', text: `The Domain tab keeps its own copy of the week: make its first week of member washes, Domain!C6, ${TAB_WAS + 10}.`, keys: `Ctrl+G "Domain!C6" ↵ "${TAB_WAS + 10}" ↵`, requires: ['go-to', 'sheet-reference'], convention: 'F1',
      hintStuck: 'pulse cell Domain!C6 · Summary’s roll-up check compares the six tabs with the cube, so it reads -10 until the tab agrees.',
      check: (s, ses) => settled(ses) && tabFixed(ses) && rollupTies(ses) },
    { id: 'refresh', teach: 'A pivot reads its own copy of the source, so an edit to the export does not reach it. Alt+F5 refreshes the pivot under the cursor; Ctrl+Alt+F5 refreshes every pivot in the workbook.',
      text: 'Go back to the pivot, see Domain’s first week unchanged, and press Alt+F5 to refresh it.', keys: 'Ctrl+G "Cuts!D5" ↵ Alt+F5', requires: ['pivot-refresh', 'go-to'],
      hintStuck: 'pulse cell Cuts!D5 · Domain’s first week should rise by 10.',
      check: (s, ses) => { const x = pivotLike(ses, CUBE); return !!x && current(ses, x) && fixed(ses); } },
    { id: 'read', teach: 'GETPIVOTDATA(data_field, pivot, field, item) finds a figure by its labels, not its address: the data field, any cell of the pivot, then each field and item that narrows it down. In Excel, typing = and pointing at a pivot cell writes one for you.',
      text: 'On Summary, read Domain’s washes from the pivot: I14 =GETPIVOTDATA("Total washes",Cuts!$A$3,"Site","AUS-DOM").', keys: `Ctrl+G "Summary!I14" ↵ ${q(F.gpd)} ↵`, requires: ['getpivotdata', 'go-to'],
      hintStuck: 'pulse cell Summary!I14 · Each label sits in quotes; the pivot is any cell of it, anchored.',
      check: (s, ses) => settled(ses) && reader(ses) },
    { id: 'tie', text: 'Put the check beside it: I15 =I14-F15, the pivot less the SUMIFS cube, which reads 0.', keys: `"${F.tie}" ↵`, requires: ['check-cell'], convention: 'F1',
      hintStuck: 'pulse cell Summary!I15 · F15 is Domain’s total in the cube.',
      check: (s, ses) => settled(ses) && tie(ses) },
    { id: 'turn', text: 'Turn the pivot round, Site down and Week across, and watch I14 still find Domain.', keys: 'Ctrl+G "Cuts!A3" ↵ Shift+F10 D Home ↓ R End ↑ ↑ C ↵', requires: ['pivot-table', 'pivot-value-settings', 'getpivotdata'],
      hintStuck: 'pulse the field list · R on Site, then C on Week.',
      check: (s, ses) => settled(ses) && swapped(ses) && reader(ses) },
    { id: 'follow', closer: true, demo: { script: 'Ctrl+G "Export!D5" Enter "200" Enter Ctrl+G "Cuts!A3" Enter Alt+F5 Ctrl+G "Summary!I14" Enter', cadence: 300 },
      text: 'Does it tie? Watch Domain’s first day change on Export, the pivot refresh, and I14 follow it.', requires: [],
      hintStuck: 'pulse cell Summary!I14 · The refresh carries the change to the pivot, and GETPIVOTDATA reads it.',
      check: (s, ses) => ses.demoDone.has('follow') },
  ],
  endState: [
    { text: 'The pivot on Cuts is refreshed and laid out site down, week across', check: (s, ses) => swapped(ses) },
    { text: 'Export and the Domain tab carry the correction, and the roll-up check reads zero', check: (s, ses) => fixed(ses) && tabFixed(ses) && rollupTies(ses) },
    { text: 'Summary reads Domain’s washes from the pivot in I14 and checks them against the cube in I15', check: (s, ses) => reader(ses) && tie(ses) },
  ],
  closing: [
    'The pivot refreshes on command, and the page reads it by name.',
    'A pivot is a copy until Alt+F5, so the cut you send is only as fresh as your last refresh. Best practice: cuts from a pivot, models from SUMIFS on the export; when a page must read a pivot, read it with GETPIVOTDATA, check it against the cube, and refresh before you send.',
  ],
  solution: `Ctrl+G "Cuts!A3" Enter Shift+F10 D End Up Up R Home Down C Down Down Down V Enter Ctrl+G "Export!D5" Enter "${PIVOT_FIX.value}" Enter Ctrl+G "Domain!C6" Enter "${TAB_WAS + 10}" Enter `
    + `Ctrl+G "Cuts!D5" Enter Alt+F5 Ctrl+G "Summary!I14" Enter ${q(F.gpd)} Enter "${F.tie}" Enter `
    + 'Ctrl+G "Cuts!A3" Enter Shift+F10 D Home Down R End Up Up C Enter',
};
