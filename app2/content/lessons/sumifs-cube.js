// Chapter 4 · 4.3.1 The SUMIFS cube: site × week, filled both ways (clearcoat-pack, S426 → S431; the module's start, S43, arrives as a planting)
// The Summary arrives with the washes cube typed in blue, pasted from someone's pivot. The site
// block links to the unique list on Lists, the cube's labels link to the site block, and one SUMIFS
// in the corner, anchored $B15 and C$14, fills eighteen cells; the totals come from AutoSum and the
// font goes back to automatic. The revenue cube below is built the same way on column F, and two
// checks tie both cubes to the export. Built by week, not month: the export covers one fortnight.
import { summary, exportRows, sumWhere, atSite, inWeek, calls, live, near, settled, shellOf, refsIn, sameText } from './lib/pack-checks.js';
import { workbookState } from '../workbooks/index.js';
import { S43_PLANT } from '../workbooks/clearcoat-pack.js';

const SITES = [5, 6, 7, 8, 9, 10];
const CUBE = { w: { first: 15, header: 14, total: 21, field: 'total', col: 'E' }, r: { first: 25, header: 24, total: 31, field: 'revenue', col: 'F' } };
const LISTS_CODES = (() => { const l = workbookState('clearcoat-pack', 'S43').sheets.find(s => s.name === 'Lists').cells; return SITES.map(r => l['N' + r].value); })();
const F = {
  link: '=Lists!N5',
  label: '=$B5',
  corner: '=SUMIFS(Export!$E$5:$E$94,Export!$B$5:$B$94,$B15,Export!$H$5:$H$94,C$14)',
  rev: '=SUMIFS(Export!$F$5:$F$94,Export!$B$5:$B$94,$B25,Export!$H$5:$H$94,C$24)',
  rowSum: '=SUM(C15:E15)',
  colSum: '=SUM(F15:F20)',
  c72: '=F21-SUM(Export!$E$5:$E$94)',
  c73: '=F31-SUM(Export!$F$5:$F$94)',
};
const PLANT = ['B23', ...refsIn('C24:F24'), ...refsIn('C25:F31'), 'B31', 'B71', 'B72', 'B73', 'C72', 'C73'];
const linked = sh => SITES.every((r, i) => /Lists!/i.test(sh.formula('B' + r) || '') && sameText(sh.value('B' + r), LISTS_CODES[i]) && sh.cellAt('B' + r).fontColor === 'green');
const labels = (sh, first) => SITES.every((r, i) => { const f = sh.formula('B' + (first + i)) || ''; return /B\$?\d+/.test(f) && sh.value('B' + (first + i)) === sh.value('B' + r); });
const cell = (ses, sh, c, cube, r) => { const k = CUBE[cube]; return calls(sh, c + r, ['SUMIFS']) && near(sh.value(c + r), sumWhere(exportRows(ses), k.field, atSite(sh.value('B' + r)), inWeek(sh.value(c + k.header)))); };
const corner = (ses, sh) => cell(ses, sh, 'C', 'w', 15) && live(sh, 'C15');
const filled = (ses, sh, cube) => { const k = CUBE[cube]; return SITES.every((_, i) => ['C', 'D', 'E'].every(c => cell(ses, sh, c, cube, k.first + i))) && live(sh, 'E' + (k.first + 5)); };
const totals = (sh, cube) => { const k = CUBE[cube]; const rows = SITES.map((_, i) => k.first + i);
  return rows.every(r => calls(sh, 'F' + r, ['SUM']) && near(sh.value('F' + r), ['C', 'D', 'E'].reduce((t, c) => t + sh.value(c + r), 0)))
    && ['C', 'D', 'E', 'F'].every(c => calls(sh, c + k.total, ['SUM']) && near(sh.value(c + k.total), rows.reduce((t, r) => t + sh.value(c + r), 0))); };
const black = sh => refsIn('C15:F21').every(ref => sh.cellAt(ref).fontColor !== 'blue');
const sumCol = (ses, field) => exportRows(ses).reduce((t, x) => t + (typeof x[field] === 'number' ? x[field] : 0), 0);
const checks = (ses, sh) => calls(sh, 'C72', ['SUM']) && near(sh.value('C72'), 0) && /F21/.test(sh.formula('C72') || '') && live(sh, 'C72')
  && calls(sh, 'C73', ['SUM']) && near(sh.value('C73'), 0) && /F31/.test(sh.formula('C73') || '') && near(sh.value('F31'), sumCol(ses, 'revenue'));

export default {
  id: 'sumifs-cube',
  chapter: 'data-and-lookups',
  section: 'Summaries from raw rows',
  module: 'summaries-from-raw-rows',
  workbook: 'clearcoat-pack',
  state: { before: 'S426', after: 'S431' },
  plant: { ...S43_PLANT, ...shellOf('S431', { Summary: PLANT }, { keepText: true }) },
  title: 'The SUMIFS cube: site × week, filled both ways',
  difficulty: 'medium',
  tags: ['formulas', 'sumifs', 'summary'],
  access: 'paid',
  minutes: 6,
  headline: 'SUMIFS',
  conventions: ['C3', 'B2', 'F1'],
  teaches: ['sumifs-cube'],
  uses: ['sumif-sumifs', 'relative-absolute', 'cross-sheet-ref', 'fill-down-right', 'autosum', 'ctrl-enter-fill', 'font-color', 'link-colour-convention', 'format-cells-dialog', 'go-to', 'ctrl-arrow', 'shift-arrow', 'arrow-keys', 'type-to-enter', 'sum-family'],
  prerequisites: ['challenge-filtered-list'],
  brief: 'SUMIFS you know from Chapter 3; the cube is what it becomes at scale. Sites down the side, weeks across the top, and one formula in the corner cell that reads the site from its row and the week from its column ($B15 and C$14), filled across and down, so eighteen cells are one formula. The week key on the export is what the column criterion matches. Replace the pasted cube with the live one, then build the revenue cube. The key is `SUMIFS`.',
  goals: [
    { id: 'sites', text: 'On Summary, link the site block to the unique list: B5:B10 =Lists!N5 with Ctrl+Enter, in green.', keys: `Ctrl+G "Summary!B5" ↵ Shift+↓ ×5 "${F.link}" Ctrl+↵ Alt H F C → ×8 ↵`, requires: ['cross-sheet-ref', 'link-colour-convention', 'font-color', 'go-to', 'shift-arrow', 'ctrl-enter-fill'], convention: 'B2',
      hintStuck: 'pulse range B5:B10 · Every figure on the page starts from Lists, so the sites do too.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && linked(sh); } },
    { id: 'labels', text: 'The cube’s sites in B15:B20 read the block above: =$B5 with Ctrl+Enter.', keys: `Ctrl+↓ ×3 Shift+↓ ×5 "${F.label}" Ctrl+↵`, requires: ['relative-absolute', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range B15:B20 · One list of sites, read everywhere it is needed.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && linked(sh) && labels(sh, 15); } },
    { id: 'corner', teach: 'A cube is one SUMIFS read two ways: the site from its row and the week from its column. Anchor the column of the site ($B15) and the row of the week (C$14), and the corner cell’s formula is right in every cell of the grid.', text: `In C15, the corner: ${F.corner}.`, keys: `→ "${F.corner}" ↵`, requires: ['sumifs-cube', 'sumif-sumifs', 'relative-absolute', 'type-to-enter'],
      hintStuck: 'pulse cell C15 · Washes are column E of the export, the site B and the week key H.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && corner(ses, sh); } },
    { id: 'fill', text: 'Select C15:E20 and fill it, Ctrl+D down and then Ctrl+R across: eighteen cells, one formula.', keys: '↑ Shift+↓ ×5 Shift+→ ×2 Ctrl+D Ctrl+R', requires: ['sumifs-cube', 'fill-down-right', 'shift-arrow'], convention: 'C3',
      hintStuck: 'pulse range C15:E20 · Ctrl+D copies the top row down; Ctrl+R then copies column C across.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && filled(ses, sh, 'w'); } },
    { id: 'totals', text: 'Type the totals over the pasted ones, F15:F20 =SUM(C15:E15) and C21:F21 =SUM(F15:F20), then set C15:F21 to Automatic font.', keys: `Ctrl+→ Shift+↓ ×5 "${F.rowSum}" Ctrl+↵ Ctrl+↓ Shift+← ×3 "${F.colSum}" Ctrl+↵ Shift+↑ ×6 Ctrl+1 F Alt+C ← ×5 ↵`, requires: ['sum-family', 'ctrl-enter-fill', 'format-cells-dialog', 'ctrl-arrow', 'shift-arrow'],
      hintStuck: 'pulse range C15:F21 · Formulas are black: in Ctrl+1, Font, Automatic is the first color in the list.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && filled(ses, sh, 'w') && totals(sh, 'w') && black(sh); } },
    { id: 'revenue', text: 'The revenue cube the same way: B25:B30 =$B5, then C25:E30 a SUMIFS on column F against C$24, and Alt+= on C25:F31.', keys: `Ctrl+↓ ↓ Ctrl+← → Shift+↓ ×5 "${F.label}" Ctrl+↵ → Shift+↓ ×5 Shift+→ ×2 "${F.rev}" Ctrl+↵ → ← Shift+↓ ×6 Shift+→ ×3 Alt+=`, requires: ['sumifs-cube', 'autosum', 'ctrl-arrow', 'shift-arrow', 'arrow-keys', 'ctrl-enter-fill'],
      hintStuck: `pulse range C25:E30 · The corner: ${F.rev}`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && labels(sh, 25) && filled(ses, sh, 'r') && totals(sh, 'r'); } },
    { id: 'checks', text: 'Tie both cubes to the export in the Checks block: C72 =F21-SUM(Export!$E$5:$E$94) and C73 the same for revenue.', keys: `Ctrl+G "C72" ↵ "${F.c72}" ↵ "${F.c73}" ↵`, requires: ['sum-family', 'cross-sheet-ref', 'go-to', 'type-to-enter'], convention: 'F1',
      hintStuck: `pulse range C72:C73 · Revenue is column F: ${F.c73}`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && checks(ses, sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Export!C5" Enter "300" Enter Ctrl+G "Summary!C15" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch one export row’s retail washes change, and its cube cell, the totals and the check move with it.', requires: [],
      hintStuck: 'pulse cell C15 · The check still reads a dash: the cube reads the same rows the SUM does.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The site block links to Lists, in green', check: (s, ses) => linked(summary(ses)) },
    { text: 'The washes cube C15:E20 is one SUMIFS, with its totals, in black', check: (s, ses) => { const sh = summary(ses); return filled(ses, sh, 'w') && totals(sh, 'w') && black(sh); } },
    { text: 'The revenue cube C25:E30 is one SUMIFS, with its totals', check: (s, ses) => { const sh = summary(ses); return labels(sh, 25) && filled(ses, sh, 'r') && totals(sh, 'r'); } },
    { text: 'C72 and C73 tie both cubes to the export data', check: (s, ses) => checks(ses, summary(ses)) },
  ],
  closing: [
    'One formula filled eighteen cells, and the grand total ties to the export.',
    'Best practice: bounded, anchored ranges. Whole-column references such as E:E work, but every SUMIFS then reads a million rows, and a pack with a few hundred of them crawls.',
  ],
  solution: `Ctrl+G "Summary!B5" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.link}" Ctrl+Enter Alt H F C Right Right Right Right Right Right Right Right Enter `
    + `Ctrl+Down Ctrl+Down Ctrl+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.label}" Ctrl+Enter Right "${F.corner}" Enter `
    + 'Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Right Shift+Right Ctrl+D Ctrl+R '
    + `Ctrl+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.rowSum}" Ctrl+Enter Ctrl+Down Shift+Left Shift+Left Shift+Left "${F.colSum}" Ctrl+Enter Shift+Up Shift+Up Shift+Up Shift+Up Shift+Up Shift+Up Ctrl+1 F Alt+C Left Left Left Left Left Enter `
    + `Ctrl+Down Down Ctrl+Left Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.label}" Ctrl+Enter Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Right Shift+Right "${F.rev}" Ctrl+Enter Right Left Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Right Shift+Right Shift+Right Alt+= `
    + `Ctrl+G "C72" Enter "${F.c72}" Enter "${F.c73}" Enter`,
};
