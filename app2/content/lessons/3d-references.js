// Chapter 4 · 4.3.6 3D references and grouped sheets (clearcoat-pack, S435 → S436)
// Head office keeps one tab per site, six in Austin, every one laid out the same. On Summary the
// company roll-up sums the input lines across the run of tabs with one 3D reference each,
// =SUM(Domain:CedarPark!C5), and works its own total row and column. Then the six tabs are grouped
// and one check row typed once lands on all six; moving to a sheet outside the group ends it, and
// the roll-up's tie to the cube goes into the checks. The closer changes a figure on Mueller's tab.
import { summary, sheetIn, calls, near, isNum, settled, shellOf, refsIn, onSheet } from './lib/pack-list-checks.js';
import { TAB_CHECK, ROLLUP_3D } from '../workbooks/clearcoat-pack.js';

const CODE = TAB_CHECK.C13.numFmt;
const TABS = ['Domain', 'Mueller', 'Riverside', 'SouthLamar', 'Airport', 'CedarPark'];
const PLANT = ['B63', ...refsIn('C64:F64'), ...refsIn('B65:B68'), ...refsIn('C65:F68'), 'C76'];
const LINE = { 65: ROLLUP_3D.retail, 66: ROLLUP_3D.member, 68: ROLLUP_3D.revenue };
const F = {
  r65: '=SUM(Domain:CedarPark!C5)', r66: '=SUM(Domain:CedarPark!C6)', r68: '=SUM(Domain:CedarPark!C8)',
  tot: '=C65+C66', row: '=SUM(C65:E65)', label: TAB_CHECK.B13.value, check: TAB_CHECK.C13.formula, tie: '=F67-F21',
};
const tabSum = (ses, ref) => TABS.reduce((t, n) => { const v = sheetIn(ses, n).value(ref); return t + (isNum(v) ? v : 0); }, 0);
const threeD = (ses, sh) => Object.keys(LINE).every(r => ['C', 'D', 'E'].every(c => { const f = sh.formula(c + r) || '';
  return calls(sh, c + r, ['SUM']) && /Domain:CedarPark!/i.test(f) && near(sh.value(c + r), tabSum(ses, c + LINE[r])); }));
const totals = sh => ['C', 'D', 'E'].every(c => near(sh.value(c + '67'), sh.value(c + '65') + sh.value(c + '66')) && !!sh.formula(c + '67'))
  && [65, 66, 67, 68].every(r => calls(sh, 'F' + r, ['SUM']) && near(sh.value('F' + r), sh.value('C' + r) + sh.value('D' + r) + sh.value('E' + r)));
const tabChecks = ses => TABS.every(n => { const t = sheetIn(ses, n); const b12 = t.cellAt('B12'), b13 = t.cellAt('B13');
  return b12.value === 'Checks' && b12.bold && b13.value === F.label && b13.indent === 1 && /F7/.test(t.formula('C13') || '') && near(t.value('C13'), 0) && t.cellAt('C13').numFmt === CODE; });
const ungrouped = ses => !ses.group || ses.group.size <= 1;
const tied = sh => /F67/.test(sh.formula('C76') || '') && /F21/.test(sh.formula('C76') || '') && near(sh.value('C76'), 0) && sh.value('C77') === 0;

export default {
  id: '3d-references',
  chapter: 'data-and-lookups',
  section: 'Summaries from raw rows',
  module: 'summaries-from-raw-rows',
  workbook: 'clearcoat-pack',
  state: { before: 'S435', after: 'S436' },
  plant: shellOf('S436', { Summary: PLANT }, { keepText: true }),
  title: '3D references and grouped sheets: site tabs in one formula',
  difficulty: 'hard',
  tags: ['formulas', 'sheets', 'roll-up'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+Shift+PgDn',
  conventions: ['C3', 'F1'],
  teaches: ['three-d-reference', 'group-sheets'],
  uses: ['sum-family', 'sheet-reference', 'cross-sheet-ref', 'ctrl-enter-fill', 'formula-basics', 'bold-italic-underline', 'indent-levels', 'number-formats', 'format-cells-dialog', 'go-to', 'page-keys', 'ctrl-arrow', 'arrow-keys', 'shift-arrow', 'type-to-enter', 'tab-commits', 'keytips'],
  prerequisites: ['question-end-to-end'],
  brief: 'Head office keeps one tab per site, every one laid out the same, and the buyers want the company total by line. A 3D reference sums the same cell across a run of sheets, =SUM(Domain:CedarPark!C5), so the total is one formula, and a site tab inserted inside the run joins it. Grouping the sheets (Ctrl+Shift+PgDn adds the next) lets you type one row on all of them at once. Build the roll-up from the six Austin tabs. The key is `Ctrl+Shift+PgDn`.',
  goals: [
    { id: 'read', text: 'Open the Domain tab and read it: weeks across, the lines down, the same layout as the other five site tabs.', keys: 'Ctrl+G "Domain!C5" ↵', requires: ['go-to', 'sheet-reference'],
      hintStuck: 'pulse range Domain!B4:F9 · Retail washes on row 5, member washes on 6, retail revenue on 8.',
      check: (s, ses) => onSheet(ses, 'Domain') },
    { id: 'three-d', teach: 'A 3D reference names a run of sheets, first and last, and a cell: =SUM(Domain:CedarPark!C5) adds C5 on every tab from Domain to Cedar Park. Only the input lines are 3D sums; the roll-up works its own totals.', text: 'On Summary, the roll-up’s input lines: C65:E65 =SUM(Domain:CedarPark!C5), then the same on row 66 (C6) and row 68 (C8).', keys: `Ctrl+G "Summary!C65" ↵ Shift+→ ×2 "${F.r65}" Ctrl+↵ ↓ Shift+→ ×2 "${F.r66}" Ctrl+↵ ↓ ×2 Shift+→ ×2 "${F.r68}" Ctrl+↵`, requires: ['three-d-reference', 'sum-family', 'go-to', 'shift-arrow', 'arrow-keys', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C65:E68 · Ctrl+Enter carries the 3D sum across: D65 adds D5, E65 adds E5.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && threeD(ses, sh); } },
    { id: 'totals', text: 'The roll-up’s own arithmetic: C67:E67 =C65+C66, and F65:F68 =SUM(C65:E65) down the side.', keys: `↑ Shift+→ ×2 "${F.tot}" Ctrl+↵ Ctrl+→ → ↑ ×2 Shift+↓ ×3 "${F.row}" Ctrl+↵`, requires: ['formula-basics', 'sum-family', 'ctrl-arrow', 'arrow-keys', 'shift-arrow', 'ctrl-enter-fill'], convention: 'C3',
      hintStuck: 'pulse range C67:F67 · A total row on the page proves its own arithmetic.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && threeD(ses, sh) && totals(sh); } },
    { id: 'group', teach: 'Ctrl+Shift+PgDn adds the next tab to a group, and while a group is on, what you type and format lands on every sheet in it. Moving to a sheet outside the group ends it; check before any other edit.', text: 'From Domain!B12, group the six tabs (Ctrl+Shift+PgDn five times) and type the check block once: Checks in bold, the tie in row 13.', keys: `Ctrl+G "Domain!B12" ↵ Ctrl+Shift+PgDn ×5 Ctrl+PgUp ×5 "Checks" ↵ ↑ Ctrl+B ↓ "${F.label}" Tab "${F.check}" ↵ ↑ Alt H 6 → Ctrl+1 N Tab End Alt+T '${CODE}' ↵`, requires: ['group-sheets', 'bold-italic-underline', 'indent-levels', 'format-cells-dialog', 'go-to', 'tab-commits', 'keytips'],
      hintStuck: `pulse range B12:C13 · Row 13: ${F.label}, then ${F.check} beside it, indented and in the page’s number format.`,
      check: (s, ses) => settled(ses) && tabChecks(ses) },
    { id: 'tie-in', text: 'Leave the group with Ctrl+PgUp to Export, then on Summary tie the roll-up to the cube in C76: =F67-F21.', keys: `Ctrl+PgUp Ctrl+G "Summary!C76" ↵ "${F.tie}" ↵`, requires: ['group-sheets', 'page-keys', 'go-to', 'type-to-enter'], convention: 'F1',
      hintStuck: 'pulse cell C76 · The flag in C77 reads it the moment it is there.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && ungrouped(ses) && tabChecks(ses) && tied(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Mueller!C5" Enter "900" Enter Ctrl+G "Summary!C65" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch a figure on Mueller’s tab change and the roll-up in C65 move with it.', requires: [],
      hintStuck: 'pulse cell C65 · One formula reads all six tabs.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The roll-up’s input lines are 3D sums across the six tabs, with its own totals', check: (s, ses) => { const sh = summary(ses); return threeD(ses, sh) && totals(sh); } },
    { text: 'Every site tab carries the check row, and no sheets are left grouped', check: (s, ses) => tabChecks(ses) && ungrouped(ses) },
    { text: 'C76 ties the roll-up to the cube', check: (s, ses) => tied(summary(ses)) },
  ],
  closing: [
    'Six tabs summed in one formula, and a new tab inside the run joins the sum on its own.',
    'Best practice: 3D references only across tabs that are truly identical, with the first and last tab of the run kept as bookends so a new site can never fall outside it. Ungroup before any other edit: a grouped workbook types on every tab.',
  ],
  solution: `Ctrl+G "Domain!C5" Enter Ctrl+G "Summary!C65" Enter Shift+Right Shift+Right "${F.r65}" Ctrl+Enter Down Shift+Right Shift+Right "${F.r66}" Ctrl+Enter Down Down Shift+Right Shift+Right "${F.r68}" Ctrl+Enter `
    + `Up Shift+Right Shift+Right "${F.tot}" Ctrl+Enter Ctrl+Right Right Up Up Shift+Down Shift+Down Shift+Down "${F.row}" Ctrl+Enter `
    + `Ctrl+G "Domain!B12" Enter Ctrl+Shift+PgDn Ctrl+Shift+PgDn Ctrl+Shift+PgDn Ctrl+Shift+PgDn Ctrl+Shift+PgDn Ctrl+PgUp Ctrl+PgUp Ctrl+PgUp Ctrl+PgUp Ctrl+PgUp "Checks" Enter Up Ctrl+B Down "${F.label}" Tab "${F.check}" Enter Up Alt H 6 Right Ctrl+1 N Tab End Alt+T '${CODE}' Enter `
    + `Ctrl+PgUp Ctrl+G "Summary!C76" Enter "${F.tie}" Enter`,
};
