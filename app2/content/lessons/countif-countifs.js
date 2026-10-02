// Chapter 3 · 3.3.2 COUNTIF and COUNTIFS (clearcoat-databook, S3a → S3b)
// The site and package count blocks on Summary, built from the Transactions export: washes by site
// with COUNTIF, member and retail washes with COUNTIFS and a criteria in quotes, washes and retail
// washes by package, three ticket bands with a check that reads zero only when the edges are right,
// the site by package block anchored both ways, the totals with AutoSum, and two checks. The
// export still carries two site codes with a trailing space, so the site block is two washes short
// of the package block: the checks say so, and 3.4.1 finds them. The closer moves one wash from
// Basic to Ultimate and both blocks shift.
import { summary, settled, selected, block, calls, live, near, exportRows, countRows, atSite, ofPackage, isMember, isRetailRow, amountOver, isNum, totalOf, liveValue, reads, colRefs } from './lib/databook-checks.js';

const SITES = [15, 20], PKG = [25, 27], BLOCK = [41, 46];
const code = (sh, ref) => sh.value(ref);
const bySite = (ses, sh, ...preds) => r => countRows(exportRows(ses), atSite(code(sh, 'B' + r)), ...preds);
const siteCounts = (ses, sh) => block(sh, 'C', ...SITES, { fns: ['COUNTIF'], want: bySite(ses, sh) });
const memberCounts = (ses, sh) => block(sh, 'D', ...SITES, { fns: ['COUNTIFS'], want: bySite(ses, sh, isMember) });
const retailCounts = (ses, sh) => block(sh, 'E', ...SITES, { fns: ['COUNTIFS'], want: bySite(ses, sh, amountOver(0)) });
const byPkg = (ses, sh, ...preds) => r => countRows(exportRows(ses), ofPackage(code(sh, 'B' + r)), ...preds);
const pkgWashes = (ses, sh) => block(sh, 'C', ...PKG, { fns: ['COUNTIF'], want: byPkg(ses, sh) });
const pkgRetail = (ses, sh) => block(sh, 'D', ...PKG, { fns: ['COUNTIFS'], want: byPkg(ses, sh, isRetailRow) });
const pkgCounts = (ses, sh) => pkgWashes(ses, sh) && pkgRetail(ses, sh);
const amounts = ses => exportRows(ses).map(x => x.amount).filter(isNum);
const BANDS = [a => a < 15, a => a >= 15 && a < 20, a => a >= 20];
const bands = (ses, sh) => !!sh && BANDS.every((f, i) => calls(sh, 'C' + (34 + i), ['COUNTIFS']) && near(sh.value('C' + (34 + i)), amounts(ses).filter(f).length)) && live(sh, 'C34')
  && colRefs('C', 34, 36).every(ref => sh.cellAt(ref).fontColor === 'green');
const bandCheck = (ses, sh) => !!sh && calls(sh, 'C37', ['COUNT']) && near(sh.value('C37'), 0) && reads(sh, 'C37', ['C34', 'C35', 'C36', 'Transactions!E5', 'Transactions!E94']);
const cross = (ses, sh) => ['C', 'D', 'E'].every(col => block(sh, col, ...BLOCK, { fns: ['COUNTIFS'], liveRef: null,
  want: r => countRows(exportRows(ses), atSite(code(sh, 'B' + r)), ofPackage(code(sh, col + '40'))) })) && live(sh, 'E46');
const totals = sh => !!sh && ['C', 'D', 'E'].every(col => totalOf(sh, col, 15, 20, 21) && totalOf(sh, col, 41, 46, 47)) && ['C', 'D'].every(col => totalOf(sh, col, 25, 27, 28));
const checks = (ses, sh) => !!sh && liveValue(sh, 'C80', sh.value('C21') - sh.value('C28')) && calls(sh, 'C81', ['COUNTA']) && liveValue(sh, 'C81', sh.value('C21') - exportRows(ses).filter(x => x.date != null).length);
const SEL5 = 'Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down';
const F = {
  site: '=COUNTIF(Transactions!$B$5:$B$94,B15)',
  member: '=COUNTIFS(Transactions!$B$5:$B$94,B15,Transactions!$D$5:$D$94,"<>")',
  retail: '=COUNTIFS(Transactions!$B$5:$B$94,B15,Transactions!$E$5:$E$94,">0")',
  pkg: '=COUNTIF(Transactions!$C$5:$C$94,B25)',
  pkgRetail: '=COUNTIFS(Transactions!$C$5:$C$94,B25,Transactions!$D$5:$D$94,"")',
  band1: '=COUNTIFS(Transactions!$E$5:$E$94,"<15")',
  band2: '=COUNTIFS(Transactions!$E$5:$E$94,">=15",Transactions!$E$5:$E$94,"<20")',
  band3: '=COUNTIFS(Transactions!$E$5:$E$94,">=20")',
  bandCheck: '=SUM(C34:C36)-COUNT(Transactions!$E$5:$E$94)',
  cross: '=COUNTIFS(Transactions!$B$5:$B$94,$B41,Transactions!$C$5:$C$94,C$40)',
  check1: '=C21-C28',
  check2: '=C21-COUNTA(Transactions!$A$5:$A$94)',
};
const q = f => `'${f}'`;   // a formula with double quotes types inside single ones

export default {
  id: 'countif-countifs',
  chapter: 'formulas',
  section: 'Math and aggregation',
  module: 'math-and-aggregation',
  workbook: 'clearcoat-databook',
  state: { before: 'S3a', after: 'S3b' },
  title: 'COUNTIF and COUNTIFS',
  difficulty: 'medium',
  tags: ['formulas', 'functions', 'aggregation'],
  access: 'paid',
  minutes: 7,
  headline: 'COUNTIFS',
  conventions: ['E5', 'F1', 'B2'],
  teaches: ['countif-countifs', 'criteria-operators'],
  uses: ['round-function', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill', 'relative-absolute', 'cross-sheet-ref', 'autosum', 'font-color', 'link-colour-convention', 'check-cell', 'counta', 'go-to', 'keytips', 'type-to-enter'],
  prerequisites: ['round-family'],
  brief: 'A count with a condition is the first question anyone asks of an export: how many washes at Domain, how many Ultimate washes, how many member washes at Domain. COUNTIF takes one range and one condition; COUNTIFS takes as many range and condition pairs as you need. The condition can be a cell, a text, or a comparison in quotes, like ">=250". Build the site and package count blocks on Summary from Transactions, rows 5 to 94. The key is `COUNTIFS`.',
  goals: [
    { id: 'site-count', teach: 'COUNTIF(range, criteria) counts the cells in the range that match the criteria, so =COUNTIF(Transactions!$B$5:$B$94,B15) counts the export rows whose site is the code in B15. Anchor the range with $ and leave B15 relative, and one formula serves all six sites.', text: 'Count the washes by site: select C15:C20, type =COUNTIF(Transactions!$B$5:$B$94,B15) and press Ctrl+Enter.', keys: `→ Ctrl+↓ ×4 → Shift+↓ ×5 "${F.site}" Ctrl+↵`, requires: ['countif-countifs', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill', 'relative-absolute', 'cross-sheet-ref'],
      hintStuck: 'pulse range C15:C20 · The site codes in B15:B20 are the criteria.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && siteCounts(ses, sh); } },
    { id: 'package-count', text: 'The same COUNTIF by package: C25:C27 =COUNTIF(Transactions!$C$5:$C$94,B25) with Ctrl+Enter, the package letters as the criteria.', keys: `Ctrl+↓ ×2 ↓ Shift+↓ ×2 "${F.pkg}" Ctrl+↵`, requires: ['countif-countifs', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C25:C27 · The package letters in B25:B27 are the criteria.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && pkgWashes(ses, sh); } },
    { id: 'member-count', teach: 'COUNTIFS takes the pairs one after another and counts a row only when every pair matches. A criteria in quotes can compare: "<>" means not blank, so the member column with "<>" counts member washes.', text: 'In D15:D20 count each site’s member washes: COUNTIFS on the site, then the member column Transactions!$D$5:$D$94 with "<>".', keys: `Ctrl+↑ ×3 ↓ → Shift+↓ ×5 ${q(F.member)} Ctrl+↵`, requires: ['criteria-operators', 'countif-countifs', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range D15:D20 · A member wash has an id in column D of the export.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && memberCounts(ses, sh); } },
    { id: 'retail-count', text: 'Retail washes with COUNTIFS: E15:E20 on the site with the amounts ">0", then D25:D27 on the package with the member column "".', keys: `→ Shift+↓ ×5 ${q(F.retail)} Ctrl+↵ Ctrl+↓ ×2 ↓ ← Shift+↓ ×2 ${q(F.pkgRetail)} Ctrl+↵`, requires: ['criteria-operators', 'countif-countifs', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range E15:E20 · A member wash carries 0 and a member id; a retail wash carries its price and no id.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && retailCounts(ses, sh) && pkgRetail(ses, sh); } },
    { id: 'bands', teach: 'Two pairs on the same range make a band: ">=15" with "<20" counts the $15 tickets and leaves the $20 ones to the next band. The edges are where a band count goes wrong, because a > where >= belongs drops every ticket sitting exactly on the edge.', text: 'Count the tickets in C34:C36: "<15", then ">=15" with "<20", then ">=20", and color the three green, since they read only Transactions.', keys: `← ×2 Ctrl+↓ ×2 ↓ → ${q(F.band1)} ↵ ${q(F.band2)} ↵ ${q(F.band3)} ↵ ↑ Shift+↑ ×2 Alt H F C → ×8 ↵`, requires: ['criteria-operators', 'countif-countifs', 'font-color', 'link-colour-convention', 'ctrl-arrow', 'shift-arrow', 'type-to-enter'], convention: 'B2',
      hintStuck: 'pulse range C34:C36 · The band labels in B34:B36 give the edges.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && bands(ses, sh); } },
    { id: 'band-check', text: 'Check the bands in C37: =SUM(C34:C36)-COUNT(Transactions!$E$5:$E$94) reads 0 when every numeric ticket sits in one band.', keys: `↓ "${F.bandCheck}" ↵`, requires: ['check-cell', 'sum-family', 'type-to-enter'], convention: 'F1',
      hintStuck: 'pulse cell C37 · COUNT counts the numbers in the amount column.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && bandCheck(ses, sh); } },
    { id: 'cross', teach: 'In a block, anchor the criteria both ways: $B41 keeps the column of site codes as the formula moves right, and C$40 keeps the row of package letters as it moves down. One formula then fills the whole block.', text: 'Fill the site by package block C41:E46 in one Ctrl+Enter: COUNTIFS on the site $B41 and the package C$40.', keys: `Ctrl+↓ ↓ Shift+↓ ×5 Shift+→ ×2 "${F.cross}" Ctrl+↵`, requires: ['countif-countifs', 'relative-absolute', 'ctrl-arrow', 'shift-arrow', 'ctrl-enter-fill'],
      hintStuck: 'pulse range C41:E46 · The site codes run down B, the package letters across row 40.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && cross(ses, sh); } },
    { id: 'totals', text: 'Total the three blocks with AutoSum: select each block with its empty total row, C41:E47, C25:D28 and C15:E21, and press Alt+=.', keys: 'Ctrl+↑ ↓ Shift+↓ ×6 Shift+→ ×2 Alt+= Ctrl+↑ ×5 ↓ Shift+↓ ×3 Shift+→ Alt+= Ctrl+↑ ×3 ↓ Shift+↓ ×6 Shift+→ ×2 Alt+=', requires: ['autosum', 'ctrl-arrow', 'shift-arrow'], convention: 'E5',
      hintStuck: 'pulse range C21:E21 · Select the empty total row and Alt+= sums what sits above it.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && totals(sh); } },
    { id: 'checks', text: 'Write the checks: C80 =C21-C28 and C81 =C21-COUNTA(Transactions!$A$5:$A$94); both read (2), two washes the site codes miss.', keys: `Ctrl+G "C80" ↵ "${F.check1}" ↵ "${F.check2}" ↵`, requires: ['check-cell', 'counta', 'go-to'], convention: 'F1',
      hintStuck: 'pulse range C80:C81 · The checks block sits under the page, from B79.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && checks(ses, sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!C5" Enter "U" Enter Ctrl+G "Summary!C25:C27" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the first wash in Transactions!C5 change from B to U, and Basic and Ultimate in C25:C27 shift by one each.', requires: [],
      hintStuck: 'pulse range C25:C27 · Every count reads the export, so the export leads.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C15:E20 count washes, member washes and retail washes by site', check: (s, ses) => { const sh = summary(ses); return siteCounts(ses, sh) && memberCounts(ses, sh) && retailCounts(ses, sh); } },
    { text: 'C25:D27 count washes and retail washes by package, and C41:E46 by site and package', check: (s, ses) => { const sh = summary(ses); return pkgCounts(ses, sh) && cross(ses, sh); } },
    { text: 'The bands in C34:C36 tie to the count of amounts in C37', check: (s, ses) => { const sh = summary(ses); return bands(ses, sh) && bandCheck(ses, sh); } },
    { text: 'Every block has its total, and the checks in C80:C81 are live', check: (s, ses) => { const sh = summary(ses); return totals(sh) && checks(ses, sh); } },
  ],
  closing: [
    'Ninety rows counted six ways, and the blocks agree with each other except where the export lies.',
    'The package block counts all 90 washes and the site block finds 88, because two site codes in the export end in a space and match nothing in B15:B20. The checks in C80:C81 caught it before a buyer did; module 3.4 finds the two rows and fixes them. Best practice: write the criteria range once, anchor it, and fill; a range that slips by a row is the commonest wrong number in a databook.',
  ],
  solution: `Right Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Right ${SEL5} "${F.site}" Ctrl+Enter Ctrl+Down Ctrl+Down Down Shift+Down Shift+Down "${F.pkg}" Ctrl+Enter `
    + `Ctrl+Up Ctrl+Up Ctrl+Up Down Right ${SEL5} ${q(F.member)} Ctrl+Enter Right ${SEL5} ${q(F.retail)} Ctrl+Enter Ctrl+Down Ctrl+Down Down Left Shift+Down Shift+Down ${q(F.pkgRetail)} Ctrl+Enter `
    + `Left Left Ctrl+Down Ctrl+Down Down Right ${q(F.band1)} Enter ${q(F.band2)} Enter ${q(F.band3)} Enter Up Shift+Up Shift+Up Alt H F C Right Right Right Right Right Right Right Right Enter `
    + `Down "${F.bandCheck}" Enter Ctrl+Down Down ${SEL5} Shift+Right Shift+Right "${F.cross}" Ctrl+Enter `
    + 'Ctrl+Up Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Right Shift+Right Alt+= Ctrl+Up Ctrl+Up Ctrl+Up Ctrl+Up Ctrl+Up Down Shift+Down Shift+Down Shift+Down Shift+Right Alt+= Ctrl+Up Ctrl+Up Ctrl+Up Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Right Shift+Right Alt+= '
    + `Ctrl+G "C80" Enter "${F.check1}" Enter "${F.check2}" Enter`,
};
