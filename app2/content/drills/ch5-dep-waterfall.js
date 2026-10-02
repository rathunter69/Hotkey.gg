// Practice · Finance and Accounting — Depreciation waterfall (script-drills D78). The finished model
// with the waterfall on Schedules emptied (rows 70 to 76, formats stay) and the capex to depreciation
// memo cut (row 66, format and all). Rebuild it: each of the five rollout years' capex over the life on
// Inputs from the year after the spend, the FY26 base over its remaining life, the total, and the memo
// ratio in the 0.0x format. Graded on the finished model's figures, a what-if on the life and the
// remaining life, and the memo's format code.
import { across, planting, modelDrill } from './model-drills.js';
import { settled, like, moves, sheetIn } from '../lessons/lib/model-checks.js';

// one decimal and an x: Format Cells stores a typed 0.0x as 0.0"x", as Excel does, so either code passes
const MULT = new Set(['0.0x', '0.0"x"', '0.0\\x']);
const formatted = (sh, refs) => !!sh && refs.every(r => { const c = sh.cells[r]; return !!c && c.fmtStyle === 'custom' && MULT.has(c.numFmt); });

const S = 'Schedules';
const VINTAGES = [71, 72, 73, 74, 75];
// one anchored formula over the whole block: the vintage's number (ROWS) picks its year's capex
// and starts the charge the year after (the projection counter on Inputs row 8 passes it)
const F = { vintage: '=IF(Inputs!C$8>ROWS($71:71),INDEX($F$63:$J$63,ROWS($71:71))/Inputs!$C$63,0)', base: '=IF(Inputs!C$6=1,$E$65/Inputs!$C$65,0)', total: '=SUM(C70:C75)', memo: '=C63/C64' };
const fill = (row, f) => `Ctrl+G "${S}!C${row}:J${row}" ↵ "${f}" Ctrl+↵`;
const KEYS = {
  vintages: `Ctrl+G "${S}!C71:J75" ↵ "${F.vintage}" Ctrl+↵`,
  base: fill(70, F.base),
  total: fill(76, F.total),
  memo: `${fill(66, F.memo)} Ctrl+1 N Tab End Alt+T "0.0x" ↵`,
};
const built = (ses, rows) => like(ses, S, across(rows));

export default modelDrill({
  id: 'ch5-dep-waterfall',
  title: 'Depreciation waterfall',
  task: 'Five years of rollout capex, each on its own row over twenty years, plus the old tunnels running off.',
  module: 'schedules',
  state: { before: 'DONE' },
  plant: () => planting({ blank: { [S]: across([70, ...VINTAGES, 76]) }, cut: { [S]: across(66) } }),
  goals: [
    { id: 'vintages', text: 'Fill Schedules C71:J75 from one formula: each year’s capex in row 63 over the life in Inputs C63, from the year after.', keys: KEYS.vintages,
      check: (s, ses) => settled(ses) && built(ses, VINTAGES) && moves(ses, `${S}!J71`, 'Inputs!C63') },
    { id: 'base', text: 'Run off the FY26 base in Schedules C70:J70: net PP&E in E65 over the remaining life in Inputs C65.', keys: KEYS.base,
      check: (s, ses) => settled(ses) && built(ses, [70]) && moves(ses, `${S}!J70`, 'Inputs!C65') },
    { id: 'total', text: 'Total the waterfall in Schedules C76:J76, the base and the five vintages summed down.', keys: KEYS.total,
      check: (s, ses) => settled(ses) && built(ses, [76]) },
    { id: 'memo', text: 'Put capex over depreciation in Schedules C66:J66 and give it the 0.0x format through Ctrl+1.', keys: KEYS.memo,
      check: (s, ses) => settled(ses) && built(ses, [66]) && formatted(sheetIn(ses, S), across(66)) },
  ],
  endState: [
    { text: 'The waterfall and the memo are the finished model’s, they move with the lives on Inputs, and the ratio reads in 0.0x', check: (s, ses) => built(ses, [66, 70, ...VINTAGES, 76]) && formatted(sheetIn(ses, S), across(66)) },
  ],
  solution: Object.values(KEYS).join(' ').replace(/↵/g, 'Enter'),
  optimalKeys: 260,
  route: 75,
});
