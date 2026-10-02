// Practice · Data and Lookups — The missing washes (screenplay 6.2, the chapter's puzzle). The pack as
// module 4.3 left it (S436), with one change: Riverside's manager counted the day the controller
// never reported (Tuesday, September 22), so Riverside's tab carries 245 more washes in the week of
// 21-Sep than the export does, and the roll-up check on Summary stops reading zero. The task line is
// all the learner gets; graded on the site, the day and the washes typed into three cells under the
// checks (the washes by any route: typed, or a formula landing on them).
import { packDrill, packCell, solutionOf } from './pack-drills.js';
import { ROWS, PLANT, SITES } from '../workbooks/clearcoat-pack.js';
import { sheetIn, settled, isNum, near } from '../lessons/lib/databook-checks.js';

const S = 'Summary', TAB = SITES[PLANT.missing.site].tab, CODE = SITES[PLANT.missing.site].code;
const DAY = ROWS.find(r => r.day === PLANT.missing.day && r.site === PLANT.missing.site).date;
const ADDED = { retail: 120, member: 125 };
const MISSING = ADDED.retail + ADDED.member;
const COUNT = '#,##0_);(#,##0);"-"_)';
const plant = () => {
  const tab = ref => packCell('S436', TAB, ref);
  return {
    [`${TAB}!D5`]: { ...tab('D5'), value: tab('D5').value + ADDED.retail },
    [`${TAB}!D6`]: { ...tab('D6'), value: tab('D6').value + ADDED.member },
    [`${S}!B79`]: { value: 'Missing from the POS data', bold: true },
    [`${S}!B80`]: { value: 'Site code' }, [`${S}!C80`]: { fontColor: 'blue', align: 'r' },
    [`${S}!B81`]: { value: 'Date' }, [`${S}!C81`]: { fontColor: 'blue', fmtStyle: 'custom', numFmt: 'd-mmm-yy' },
    [`${S}!B82`]: { value: 'Washes' }, [`${S}!C82`]: { fmtStyle: 'custom', numFmt: COUNT },
  };
};
const found = ses => { const sh = sheetIn(ses, S); return !!sh && String(sh.value('C80') || '').trim().toUpperCase() === CODE && sh.value('C81') === DAY && isNum(sh.value('C82')) && near(sh.value('C82'), MISSING); };
const KEYS = `Ctrl+G "${S}!C80" ↵ "${CODE}" ↵ "9/22/2026" ↵ "${MISSING}" ↵`;

export default packDrill({
  id: 'puzzle-ch4',
  title: 'The missing washes',
  task: 'The site tabs say one number and the POS export another, so find the washes that went missing.',
  module: 'summaries-from-raw-rows',
  state: { before: 'S436' },
  plant,
  goals: [
    { id: 'found', text: 'In Summary C80:C82, the site code, the date and the washes the export is missing.', keys: KEYS,
      check: (s, ses) => settled(ses) && found(ses) },
  ],
  endState: [
    { text: 'The missing washes are found and put on the right site and day', check: (s, ses) => found(ses) },
  ],
  solution: solutionOf([{ keys: KEYS }]),
  optimalKeys: 40,
  route: 45,
});
