// Practice · Finance and Accounting — DCF read-back (script-drills D33, D34). The finished DCF page
// with its four memo cells under enterprise value cut, formats and all: the forecast years' share of
// enterprise value, the terminal value's share, and enterprise value over FY26E and FY27 EBITDA.
// Graded on the finished model's figures, the two shares summing to 100% and moving when the exit
// multiple does (a what-if), the multiple's formula anchoring enterprise value (a token check on the
// cells the goal names) and the formats: a percentage, and 0.0x.
import { planting, modelDrill } from './model-drills.js';
import { settled, like, moves, sheetIn, near } from '../lessons/lib/model-checks.js';

// one decimal and an x: Format Cells stores a typed 0.0x as 0.0"x", as Excel does, so either code passes
const MULT = new Set(['0.0x', '0.0"x"', '0.0\\x']);
const formatted = (sh, refs) => !!sh && refs.every(r => { const c = sh.cells[r]; return !!c && c.fmtStyle === 'custom' && MULT.has(c.numFmt); });

const D = 'DCF';
const SHARES = ['C45', 'C46'], MULTS = ['E47', 'F47'];
const pct = (ses, refs) => { const sh = sheetIn(ses, D); return refs.every(r => sh.cells[r] && sh.cells[r].fmtStyle === 'percent'); };
const anchored = ses => { const sh = sheetIn(ses, D); return MULTS.every(r => /\$C\$42/.test(String(sh.formula(r) || '').toUpperCase())); };
const whole = ses => { const sh = sheetIn(ses, D); return near(sh.value('C45') + sh.value('C46'), 1, 1e-9); };
const KEYS = {
  forecast: `Ctrl+G "${D}!C46" ↵ "=C23/C42" ↵ Ctrl+Shift+5`,
  terminal: `Ctrl+G "${D}!C45" ↵ "=1-C46" ↵ Ctrl+Shift+5`,
  multiple: `Ctrl+G "${D}!E47:F47" ↵ "=$C$42/E8" Ctrl+↵ Ctrl+1 N Tab End Alt+T "0.0x" ↵`,
};

export default modelDrill({
  id: 'ch5-dcf-read-back',
  title: 'DCF read-back',
  task: 'Under enterprise value, show how much of it is the terminal value and what multiple it implies.',
  module: 'dcf',
  state: { before: 'DONE' },
  plant: () => planting({ cut: { [D]: [...SHARES, ...MULTS] } }),
  goals: [
    { id: 'forecast', text: 'Put the forecast years’ share of enterprise value in DCF C46: the PVs in C23 over C42, as a percentage.', keys: KEYS.forecast,
      check: (s, ses) => settled(ses) && like(ses, D, ['C46']) && pct(ses, ['C46']) },
    { id: 'terminal', text: 'Put the terminal value’s share in DCF C45 as a percentage, so C45 and C46 add to 100%.', keys: KEYS.terminal,
      check: (s, ses) => settled(ses) && like(ses, D, SHARES) && pct(ses, SHARES) && whole(ses) && moves(ses, `${D}!C45`, 'Inputs!C94') },
    { id: 'multiple', text: 'Fill DCF E47:F47 from one formula, enterprise value in $C$42 over each year’s EBITDA in row 8, in the 0.0x format.', keys: KEYS.multiple,
      check: (s, ses) => settled(ses) && like(ses, D, MULTS) && anchored(ses) && formatted(sheetIn(ses, D), MULTS) },
  ],
  endState: [
    { text: 'The two shares add to 100% and move with the exit multiple, and the multiples anchor enterprise value and read in 0.0x', check: (s, ses) => like(ses, D, [...SHARES, ...MULTS]) && pct(ses, SHARES) && whole(ses) && anchored(ses) && formatted(sheetIn(ses, D), MULTS) },
  ],
  solution: Object.values(KEYS).join(' ').replace(/↵/g, 'Enter'),
  optimalKeys: 110,
  route: 45,
});
