// Chapter 4 · 4.4.2 Group dates and value settings (clearcoat-pack, S441 → S442)
// The pivot on Cuts reworked through its field list and its shortcut menu: the dates down the
// side, grouped back into weeks by the period key on the export, the revenue shown as a % of Column
// Total, the washes averaged by site-day, and last the days each site reported, counted. The
// count reads fifteen for Riverside where Summary reads fourteen: a count counts rows, and one
// of the days at Riverside came in blank.
import { pivotLike, settled, at } from './lib/pack-scenario-checks.js';
import { PIVOTS } from '../workbooks/clearcoat-pack.js';

const REV = PIVOTS.S441.value;   // 'Retail revenue ($)'
const listOpen = ses => ses.dialog === 'pivot' && !!ses.dlg && ses.dlg.step === 'fields';

export default {
  id: 'pivot-group-values',
  chapter: 'data-and-lookups',
  section: 'Pivot tables',
  module: 'pivot-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S441', after: 'S442' },
  title: 'Group dates and value settings',
  difficulty: 'medium',
  tags: ['pivot tables', 'summaries'],
  access: 'paid',
  minutes: 6,
  headline: 'Shift+F10',
  conventions: ['F4'],
  teaches: ['pivot-value-settings'],
  uses: ['pivot-table', 'go-to', 'sheet-reference'],
  prerequisites: ['pivot-build-rearrange'],
  brief: 'A pivot can put the export’s dates down the side, group them into weeks, and show each figure as a sum, a count, an average or a share of its column, all without a formula. The field list moves the fields; the pivot’s shortcut menu (Shift+F10) opens the list again and changes what the values show. Group the days into weeks, show revenue as a share of each site’s fortnight, average the washes, and count the days each site reported. The key is `Shift+F10`.',
  goals: [
    { id: 'open-list', teach: 'Shift+F10 opens the shortcut menu on the cell under the cursor. On a pivot it offers Show Field List (D), Refresh (R) and Show Values As (A).',
      text: 'Go to the pivot on Cuts and open its field list again with Shift+F10, D.', keys: 'Ctrl+G "Cuts!A3" ↵ Shift+F10 D', requires: ['pivot-value-settings', 'go-to'],
      hintStuck: 'pulse cell Cuts!A3 · The cursor has to sit inside the pivot for its shortcut menu.',
      check: (s, ses) => listOpen(ses) },
    { id: 'dates', text: 'Put Date in Rows in place of Week: fifteen days down the side, one row each.', keys: 'Home R', requires: ['pivot-table'],
      hintStuck: 'pulse the field list · Date is the first field, so Home lands on it.',
      check: (s, ses) => !!pivotLike(ses, { row: 'Date', col: 'Site', value: REV }) },
    { id: 'weeks', teach: 'Excel can group a date field into days, months or years itself (Alt, J, T, G). A period key in the export does the same job, and it matches every SUMIFS that reads the same column.',
      text: 'Group the days into weeks: put Week back in Rows, the period key the export already carries.', keys: 'End ↑ ↑ R', requires: ['pivot-table'],
      hintStuck: 'pulse the field list · Week sits two fields above the last one.',
      check: (s, ses) => !!pivotLike(ses, PIVOTS.S441) },
    { id: 'share', teach: 'Show Values As changes what a figure means, not the data under it. % of Column Total divides each cell by its column’s total, so each site’s column adds to 100%.',
      text: 'Close the list, then press Shift+F10, A, C: each week’s revenue as a % of Column Total.', keys: '↵ Shift+F10 A C', requires: ['pivot-value-settings'],
      hintStuck: 'pulse cell Cuts!A3 · A opens Show Values As; C picks % of Column Total.',
      check: (s, ses) => settled(ses) && !!pivotLike(ses, { ...PIVOTS.S441, show: 'pctCol' }) },
    { id: 'average', teach: 'S in the field list cycles the value field through Sum, Count and Average. A new value field starts at No Calculation, so the share goes with the revenue.',
      text: 'Reopen the list, put Total washes in Values and press S twice for the average washes per site-day.', keys: 'Shift+F10 D ↑ V S S', requires: ['pivot-value-settings'],
      hintStuck: 'pulse the field list · The list opens on the field in Values; Total washes is one above it.',
      check: (s, ses) => !!pivotLike(ses, { row: 'Week', col: 'Site', value: 'Total washes', fn: 'average' }) },
    { id: 'count', teach: 'Count counts rows, whatever they hold: a day that came in with no washes still counts as a day.',
      text: 'Count the days each site reported: “Site” alone in Rows, then “Date” in Values as a Count, and close the list.', keys: 'Home ↓ R Home V S ↵', requires: ['pivot-value-settings'],
      hintStuck: 'pulse the field list · R on Site takes it out of Columns too; S once turns the sum of dates into a count.',
      check: (s, ses) => settled(ses) && !!pivotLike(ses, PIVOTS.S442) },
    { id: 'read', text: 'Go to Summary!G7, Riverside’s days reported: 14 there, 15 rows in the pivot, because one day came in blank.', keys: 'Ctrl+G "Summary!G7" ↵', requires: ['go-to', 'sheet-reference'], convention: 'F4',
      hintStuck: 'pulse cell Summary!G7 · Summary counts the days with hours open; the pivot counts rows.',
      check: (s, ses) => at(ses, 'Summary', 'G7') && !!pivotLike(ses, PIVOTS.S442) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Cuts!B10" Enter', cadence: 320 },
      text: 'Does it tie? Watch the counts add to 90 in the grand total: one row for each site and day in the export.', requires: [],
      hintStuck: 'pulse cell Cuts!B10 · Six sites, fifteen days.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The pivot on Cuts counts the days each site reported', check: (s, ses) => !!pivotLike(ses, PIVOTS.S442) },
  ],
  closing: [
    'The pivot grouped the dates and counted, averaged and shared the values, and nothing was written by hand.',
    'Every view was a few keys: the field list for what goes where, the shortcut menu for what the values mean. Best practice: when a pivot and the page disagree, as Riverside’s fifteen and fourteen do, find out why before anyone else does; here a count of rows met a count of days open.',
  ],
  solution: 'Ctrl+G "Cuts!A3" Enter Shift+F10 D Home R End Up Up R Enter Shift+F10 A C Shift+F10 D Up V S S Home Down R Home V S Enter Ctrl+G "Summary!G7" Enter',
};
