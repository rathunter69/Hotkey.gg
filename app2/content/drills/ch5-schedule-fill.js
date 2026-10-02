// Practice · Finance and Accounting — Schedule fill (screenplay 6.2; script-drills D69). The PP&E
// roll on Schedules holds FY24 to FY26 only: FY27 to FY31 of opening, capex, depreciation, closing
// and the capex to depreciation memo are gone, and the memo's FY26 cell has lost its 0.0x format.
// Each row fills right from FY26; graded on the finished model's figures, a what-if on Inputs, and
// the memo's format across the row.
import { across, planting, modelDrill } from './model-drills.js';
import { settled, like, moves, formatted, sheetIn } from '../lessons/lib/model-checks.js';

const S = 'Schedules', FY = ['F', 'G', 'H', 'I', 'J'];
const ok = (ses, rs) => like(ses, S, across(rs, FY));
const RATIO = '0.0x';
// Format Cells writes the x quoted, as Excel does; the finished model carries it bare
const ratioOk = (ses, cols) => formatted(sheetIn(ses, S), across([66], cols), RATIO) || formatted(sheetIn(ses, S), across([66], cols), '0.0"x"');

export default modelDrill({
  id: 'ch5-schedule-fill',
  title: 'Schedule fill',
  task: 'Fill the PP&E roll on Schedules right from FY26 to FY31, every row one formula, and give the memo its 0.0x format.',
  module: 'schedules',
  state: { before: 'DONE' },
  plant: () => ({ ...planting({ cut: { [S]: across([60, 61, 62, 63, 64, 65, 66], FY) } }), [`${S}!E66`]: { formula: '=IFERROR(E63/E64,0)' } }),
  goals: [
    { id: 'capex', text: 'Fill the capex lines right: select E61:J63 on Schedules and press Ctrl+R.', keys: 'Ctrl+G "Schedules!E61:J63" ↵ Ctrl+R',
      check: (s, ses) => settled(ses) && ok(ses, [61, 62, 63]) && moves(ses, `${S}!J63`, 'Inputs!J21') },
    { id: 'depreciation', text: 'Fill depreciation right from E64 to J64, so each year reads its own waterfall total.', keys: 'Ctrl+G "Schedules!E64:J64" ↵ Ctrl+R',
      check: (s, ses) => settled(ses) && ok(ses, [64]) && moves(ses, `${S}!J64`, 'Inputs!H21') },
    { id: 'roll', text: 'Fill opening PP&E E60:J60 and closing PP&E E65:J65 right, so each closing feeds the next year’s opening.', keys: 'Ctrl+G "Schedules!E60:J60" ↵ Ctrl+R Ctrl+G "Schedules!E65:J65" ↵ Ctrl+R',
      check: (s, ses) => settled(ses) && ok(ses, [60, 65]) && moves(ses, `${S}!J60`, 'Inputs!G21') },
    { id: 'memo', text: 'Fill the capex to depreciation memo E66:J66 right.', keys: 'Ctrl+G "Schedules!E66:J66" ↵ Ctrl+R',
      check: (s, ses) => settled(ses) && ok(ses, [66]) },
    { id: 'format', text: `Give the memo E66:J66 the custom format ${RATIO} through Ctrl+1.`, keys: `Ctrl+G "Schedules!E66:J66" ↵ Ctrl+1 N Tab End Alt+T "${RATIO}" ↵`,
      check: (s, ses) => settled(ses) && ratioOk(ses, ['E', ...FY]) },
  ],
  endState: [
    { text: 'The PP&E roll on Schedules is the finished model’s from FY27 to FY31, and the memo reads in 0.0x', check: (s, ses) => ok(ses, [60, 61, 62, 63, 64, 65, 66]) && ratioOk(ses, FY) },
  ],
  solution: 'Ctrl+G "Schedules!E61:J63" Enter Ctrl+R Ctrl+G "Schedules!E64:J64" Enter Ctrl+R Ctrl+G "Schedules!E60:J60" Enter Ctrl+R Ctrl+G "Schedules!E65:J65" Enter Ctrl+R Ctrl+G "Schedules!E66:J66" Enter Ctrl+R Ctrl+G "Schedules!E66:J66" Enter Ctrl+1 N Tab End Alt+T "0.0x" Enter',
  optimalKeys: 140,
  route: 45,
});
