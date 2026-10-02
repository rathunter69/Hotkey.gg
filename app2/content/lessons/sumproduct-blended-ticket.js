// Chapter 3 · 3.3.5 SUMPRODUCT: the blended ticket (clearcoat-databook, S3d → S3e)
// The package block on Summary: retail washes by package times the price list in one SUMPRODUCT,
// the blended ticket (retail revenue over every wash, member washes included), the weighted
// average retail price as SUMPRODUCT over SUM, and the check that retail revenue from the export
// ties to the price list. It reads (60): money the export sends in a form the SUMIFs cannot read
// yet, which module 3.4 cleans. The closer raises the Ultimate price and the list figures answer.
import { summary, settled, selected, calls, near, isNum, live, liveValue } from './lib/databook-checks.js';

const P = [25, 26, 27];
const dot = sh => P.reduce((t, r) => t + sh.value('D' + r) * sh.value('E' + r), 0);
const retailWashes = sh => P.reduce((t, r) => t + sh.value('D' + r), 0);
const atList = sh => !!sh && calls(sh, 'C29', ['SUMPRODUCT']) && liveValue(sh, 'C29', dot(sh));
const blended = sh => !!sh && isNum(sh.value('C21')) && liveValue(sh, 'C30', sh.value('F21') / sh.value('C21'));
const weighted = sh => !!sh && calls(sh, 'C31', ['SUMPRODUCT', 'SUM']) && liveValue(sh, 'C31', dot(sh) / retailWashes(sh));
const tieCheck = sh => !!sh && liveValue(sh, 'C82', sh.value('F21') - sh.value('C29'));
const F = {
  sp: '=SUMPRODUCT(D25:D27,E25:E27)',
  blended: '=F21/C21',
  weighted: '=SUMPRODUCT(D25:D27,E25:E27)/SUM(D25:D27)',
  check: '=F21-C29',
};

export default {
  id: 'sumproduct-blended-ticket',
  chapter: 'formulas',
  section: 'Math and aggregation',
  module: 'math-and-aggregation',
  workbook: 'clearcoat-databook',
  state: { before: 'S3d', after: 'S3e' },
  title: 'SUMPRODUCT: the blended ticket',
  difficulty: 'medium',
  tags: ['formulas', 'functions', 'aggregation'],
  access: 'paid',
  minutes: 5,
  headline: 'SUMPRODUCT',
  conventions: ['F1'],
  teaches: ['sumproduct'],
  uses: ['sumif-sumifs', 'ctrl-arrow', 'shift-arrow', 'go-to', 'check-cell', 'sum-family', 'type-to-enter', 'formula-basics'],
  prerequisites: ['busiest-sites'],
  brief: 'The blended ticket is revenue over every wash, member washes included, so it sits well below the price list, and it is the number a buyer uses to value a wash. SUMPRODUCT multiplies two ranges pair by pair and adds the products in one call: retail washes by package times the price by package, with no helper column. It also does conditional sums the old way, before SUMIFS existed, and you will meet that in other people’s models. The key is `SUMPRODUCT`.',
  goals: [
    { id: 'read-block', text: 'Select the retail washes and the price list side by side in D25:E27: the two ranges SUMPRODUCT pairs up.', keys: '→ Ctrl+↓ ×6 → → Shift+↓ ×2 Shift+→', requires: ['ctrl-arrow', 'shift-arrow'],
      hintStuck: 'pulse range D25:E27 · The package block starts at B25.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && selected(sh, 'D25:E27'); } },
    { id: 'sumproduct', teach: 'SUMPRODUCT(array1, array2) multiplies the first pair, the second pair and the third, then adds the three products: 17 × $10 + 23 × $15 + 14 × $20. The two ranges must be the same shape, or it returns #VALUE!.', text: 'Retail revenue at the price list in C29: =SUMPRODUCT(D25:D27,E25:E27).', keys: `← Ctrl+↓ ↓ "${F.sp}" ↵`, requires: ['sumproduct', 'ctrl-arrow', 'type-to-enter'],
      hintStuck: 'pulse cell C29 · Washes first, prices second, the same three rows each.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && atList(sh); } },
    { id: 'blended', teach: 'The blended ticket divides revenue by every wash, member washes included, so it reads well under the cheapest price on the list. That gap is the membership model: a member who washes four times a month pays one fee.', text: 'The blended ticket in C30: retail revenue over all washes, =F21/C21.', keys: `"${F.blended}" ↵`, requires: ['formula-basics', 'type-to-enter'],
      hintStuck: 'pulse cell C30 · Retail revenue totals in F21, washes in C21.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && blended(sh); } },
    { id: 'weighted', teach: 'SUMPRODUCT over SUM is a weighted average: each price counts as many times as it was sold, where AVERAGE(E25:E27) would count each price once. The same shape weights anything, a ticket by washes or a rate by balance.', text: 'The weighted average retail price in C31: =SUMPRODUCT(D25:D27,E25:E27)/SUM(D25:D27).', keys: `"${F.weighted}" ↵`, requires: ['sumproduct', 'sum-family', 'type-to-enter'],
      hintStuck: 'pulse cell C31 · Divide by the retail washes, not by three.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && weighted(sh); } },
    { id: 'check', teach: 'Before SUMIFS existed, a conditional sum read =SUMPRODUCT((range="AUS-DOM")*amounts): the test gives TRUE or FALSE, and TRUE times a number is the number. It still works, but SUMIFS says what it does, so write SUMIFS and read the old form when you inherit it.', text: 'Tie the two routes in C82, =F21-C29: it reads (60), money the export sends in a form the SUMIFs cannot read yet.', keys: `Ctrl+G "C82" ↵ "${F.check}" ↵`, requires: ['check-cell', 'go-to', 'type-to-enter'], convention: 'F1',
      hintStuck: 'pulse cell C82 · The checks block sits under the page, from B79.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && tieCheck(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!E27" Enter "25" Enter Ctrl+G "Summary!C29:C31" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the Ultimate price in E27 change to 25, and revenue at the list in C29 and the weighted price in C31 answer.', requires: [],
      hintStuck: 'pulse range C29:C31 · Both read the price list in E25:E27.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C29 is SUMPRODUCT of retail washes and prices, C31 the weighted price', check: (s, ses) => { const sh = summary(ses); return atList(sh) && weighted(sh); } },
    { text: 'C30 is the blended ticket, and the check in C82 is live', check: (s, ses) => { const sh = summary(ses); return blended(sh) && tieCheck(sh); } },
  ],
  closing: [
    'SUMPRODUCT summed washes times prices in one call, and the blended ticket is the number a buyer prices a wash from.',
    'The check in C82 reads (60): three amounts in the export are text, and a row carries a site code with a trailing space, so the SUMIFs miss them while the price list does not. Leave it red; module 3.4 cleans the export and the check comes back to zero on its own. Best practice: when two routes to one number disagree, the check is doing its job, so fix the data, never the check.',
  ],
  solution: `Right Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Right Right Shift+Down Shift+Down Shift+Right Left Ctrl+Down Down "${F.sp}" Enter "${F.blended}" Enter "${F.weighted}" Enter Ctrl+G "C82" Enter "${F.check}" Enter`,
};
