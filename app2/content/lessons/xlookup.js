// Chapter 4 · 4.1.5 XLOOKUP: exact, not-found, two-way (clearcoat-pack, S414 → S415)
// Capacity by XLOOKUP beside the INDEX/MATCH; a code that isn't listed reads #N/A, then "Not listed"
// with the fourth argument; the code from a name, right to left; two XLOOKUPs nested for the two-way
// answer, which ties to 4.1.4's INDEX/MATCH in C38.
import { summary, settled, calls, live, same, block, byCode, listValue, cubeValue, SITE_ROWS } from './lib/pack-checks.js';
import { FMT } from '../workbooks/page.js';

const F = {
  capacity: '=XLOOKUP(B5,Lists!$B$5:$B$10,Lists!$F$5:$F$10)',
  miss: '=XLOOKUP("AUS-XXX",Lists!$B$5:$B$10,Lists!$F$5:$F$10)',
  message: '=XLOOKUP("AUS-XXX",Lists!$B$5:$B$10,Lists!$F$5:$F$10,"Not listed")',
  left: '=XLOOKUP("Airport",Lists!$C$5:$C$10,Lists!$B$5:$B$10)',
  nested: '=XLOOKUP(C35,$C$14:$E$14,XLOOKUP(C34,$B$15:$B$20,$C$15:$E$20))',
};
const q = f => `'${f}'`;
const COUNT = { fmtStyle: 'custom', numFmt: FMT.countDash };
const PLANT = {
  'Summary!J4': { value: 'Capacity (XLOOKUP)', bold: true, align: 'r' },
  ...Object.fromEntries(SITE_ROWS.map(r => [`Summary!J${r}`, { fontColor: 'green', ...COUNT }])),
  'Summary!I15': { value: 'Not listed code', bold: true }, 'Summary!J15': { fontColor: 'green' },
  'Summary!I16': { value: 'Code from name', bold: true }, 'Summary!J16': { fontColor: 'green' },
  'Summary!I19': { value: 'Two-way, nested', bold: true }, 'Summary!J19': { ...COUNT },
};
const capacity = (ses, sh) => block(sh, 'J', SITE_ROWS, { fns: ['XLOOKUP'], want: byCode(ses, sh, 'capacity') });
const message = sh => calls(sh, 'J15', ['XLOOKUP']) && sh.value('J15') === 'Not listed';
const left = (ses, sh) => calls(sh, 'J16', ['XLOOKUP']) && same(sh.value('J16'), listValue(ses, 'Airport', 'code', 'name'));
const nested = sh => calls(sh, 'J19', ['XLOOKUP']) && (sh.formula('J19').match(/XLOOKUP/gi) || []).length === 2 && same(sh.value('J19'), cubeValue(sh, sh.value('C34'), sh.value('C35'))) && same(sh.value('J19'), sh.value('C38')) && live(sh, 'J19');

export default {
  id: 'xlookup',
  chapter: 'data-and-lookups',
  section: 'Lookups',
  module: 'lookups',
  workbook: 'clearcoat-pack',
  state: { before: 'S414', after: 'S415' },
  plant: PLANT,
  title: 'XLOOKUP: exact, not-found, two-way',
  difficulty: 'medium',
  tags: ['formulas', 'lookups'],
  access: 'paid',
  minutes: 6,
  headline: 'XLOOKUP',
  conventions: ['F5', 'B2'],
  teaches: ['xlookup'],
  uses: ['index-match', 'two-way-lookup', 'go-to', 'cross-sheet-ref', 'ctrl-enter-fill', 'arrow-keys'],
  prerequisites: ['two-way-index-match'],
  brief: 'XLOOKUP is the modern lookup: the key, the column to search, the column to return, and an optional message for a miss. It is exact by default, looks in any direction, and nests for a two-way answer. Banks lag versions, so most models you inherit still read INDEX/MATCH; learn XLOOKUP so you can use it where the file allows and read it where you find it. The key is `XLOOKUP`.',
  wow: 'One function does what two did, when the file allows it.',
  goals: [
    { id: 'capacity', teach: 'XLOOKUP(key, lookup range, return range) finds the key in the first range and returns the cell beside it in the second. No column is counted and no FALSE is needed, because exact is the default.',
      text: 'Capacity by XLOOKUP in Summary J5:J10: =XLOOKUP(B5,Lists!$B$5:$B$10,Lists!$F$5:$F$10).', keys: `Ctrl+G "Summary!J5:J10" ↵ "${F.capacity}" Ctrl+↵`, requires: ['xlookup', 'go-to', 'ctrl-enter-fill', 'cross-sheet-ref'],
      hintStuck: 'pulse range J5:J10 on Summary · Search the codes, return the capacities.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && capacity(ses, sh); } },
    { id: 'miss', text: 'In J15, look up a code that isn’t on Lists, AUS-XXX, and read #N/A.', keys: `Ctrl+G "Summary!J15" ↵ ${q(F.miss)} ↵`, requires: ['xlookup', 'go-to'], convention: 'F5',
      hintStuck: 'pulse cell J15 · Type the code in quotes as the key.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && calls(sh, 'J15', ['XLOOKUP']) && sh.value('J15') === '#N/A'; } },
    { id: 'message', teach: 'The fourth argument is what XLOOKUP returns when the key isn’t there. A message in words tells the reader the code is missing; a #N/A only tells them something broke.',
      text: 'Add the fourth argument to J15, "Not listed", so the miss says so in words.', keys: `↑ ${q(F.message)} ↵`, requires: ['xlookup', 'arrow-keys'],
      hintStuck: 'pulse cell J15 · The message goes in quotes after the return range.',
      check: (s, ses) => settled(ses) && message(summary(ses)) },
    { id: 'left', teach: 'The lookup range and the return range are separate, so the return can sit left of the key: search the names, return the codes, no rearranging.',
      text: 'In J16, look up Airport’s code right to left: search the names in Lists!$C$5:$C$10, return the codes.', keys: `${q(F.left)} ↵`, requires: ['xlookup'],
      hintStuck: 'pulse cell J16 · The codes in Lists!$B$5:$B$10 sit left of the names.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && left(ses, sh); } },
    { id: 'nested', teach: 'An XLOOKUP can return a whole row: the inner one finds the site’s row of the cube, and the outer one finds the week across the top and returns that cell of the row. Best practice: XLOOKUP where the file is yours and the version allows, INDEX/MATCH in anything a bank’s model will read; XMATCH is MATCH with exact as the default and goes inside INDEX the same way.',
      text: 'Nest two XLOOKUPs in J19 for the two-way answer, and read it match C38.', keys: `↓ ×2 "${F.nested}" ↵`, requires: ['xlookup', 'two-way-lookup', 'arrow-keys'],
      hintStuck: 'pulse cell J19 · Inside: the site’s row of C15:E20. Outside: the week across C14:E14.',
      check: (s, ses) => settled(ses) && nested(summary(ses)) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Lists!F5" Enter "130" Enter Ctrl+G "Summary!J5" Enter', cadence: 320 },
      text: 'Does it tie? Watch Domain’s capacity on Lists move to 130 and J5 follow it.', requires: [],
      hintStuck: 'pulse cell J5 on Summary · XLOOKUP reads Lists like any lookup.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'J5:J10, J15, J16 and J19 hold the four XLOOKUPs', check: (s, ses) => { const sh = summary(ses); return capacity(ses, sh) && message(sh) && left(ses, sh) && nested(sh); } },
  ],
  closing: [
    'One function does what two did, when the file allows it.',
    'XLOOKUP is exact by default, says what you tell it on a miss, and looks either way. INDEX/MATCH stays the standard in a shared model, because every version of Excel can read it.',
  ],
  solution: `Ctrl+G "Summary!J5:J10" Enter "${F.capacity}" Ctrl+Enter Ctrl+G "Summary!J15" Enter ${q(F.miss)} Enter Up ${q(F.message)} Enter ${q(F.left)} Enter Down Down "${F.nested}" Enter`,
};
