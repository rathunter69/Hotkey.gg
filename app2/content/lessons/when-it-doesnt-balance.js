// Chapter 5 · 5.4.5 When it doesn't balance: the order to check (clearcoat-model, B551 with six breaks → B551)
// The linked model with six breaks planted, one a year from FY27 (the workbook's BREAKS): depreciation
// not added back, cash typed on the balance sheet, a working-capital sign flipped, capex left out of
// PP&E, net income not reaching equity, and the PP&E change netted on the cash flow so depreciation
// counts twice. The learner reads the difference, then fixes them in the reviewer's order. Each fix
// is graded on the cell's value against the model's own formula, by any route, and on liveness.
import { BREAKS } from '../workbooks/clearcoat-model.js';
import { settled, sheetIn, built, liveVia, inputRef, cellsAt, formatOnly, quoted, solutionOf } from './lib/model-checks.js';

const AFTER = 'B551';
const activeName = ses => ses.sheets[ses.sheetIndex].name;
// each break keeps the look of the cell it replaces, so the fix is the formula alone
const PLANT = Object.fromEntries(BREAKS.map(([name, ref, cell]) => {
  const look = formatOnly(cellsAt(AFTER, name)[ref]) || {};
  return [`${name}!${ref}`, cell ? { ...look, ...(cell.formula ? { formula: cell.formula } : { value: cell.value }) } : look];
}));
const fix = (name, ref) => `Ctrl+G "${name}!${ref}" ↵ ${quoted(cellsAt(AFTER, name)[ref].formula)} ↵`;
const fixed = (ses, name, ref, key) => settled(ses) && built(ses, name, [ref], AFTER) && liveVia(ses, name, ref, [inputRef(key)]);
const balanced = ses => { const bs = sheetIn(ses, 'BS'); return !!bs && ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].every(c => bs.value(c + '28') === 0); };

const goals = [
  { id: 'read', text: 'Go to the balance check in F28 of BS and read the difference: FY27 is off by exactly FY27’s depreciation.',
    teach: 'A balance sheet that’s off is off for one of a short list of reasons, and a reviewer checks them in order: the cash tie, the working-capital signs, depreciation, capex, debt, net income to equity, the opening balances. Read the size of the difference before you look anywhere else, because it usually names the line.',
    keys: 'Ctrl+G "BS!F28" ↵', requires: ['balance-order', 'go-to'],
    hintStuck: 'pulse cell BS!F28 · −5,000 is FY27’s depreciation on Schedules row 64.',
    check: (s, ses) => settled(ses) && activeName(ses) === 'BS' && sheetIn(ses, 'BS').selectionText() === 'F28' },
  { id: 'cash', text: 'Check 1, the cash tie: FY28 cash in G6 of BS is a typed number, so link it to the CF’s closing cash.',
    keys: fix('BS', 'G6'), requires: ['balance-order', 'schedule-links', 'go-to'], convention: 'F2',
    hintStuck: 'pulse cell BS!G6 · Cash is CF row 30, never typed.',
    check: (s, ses) => fixed(ses, 'BS', 'G6', 'capexSite') },
  { id: 'sign', text: 'Check 2, the signs: fix the FY29 change in receivables in H8 of the CF, which has its sign turned.',
    keys: fix('CF', 'H8'), requires: ['balance-order', 'indirect-cash-flow', 'go-to'], convention: 'C4',
    hintStuck: 'pulse cell CF!H8 · The schedule’s change already carries its sign; the CF links it as it is.',
    check: (s, ses) => fixed(ses, 'CF', 'H8', 'recDays') },
  { id: 'depreciation', text: 'Check 3, depreciation: FY27’s add-back in F7 of the CF is empty, so link it back to the PP&E schedule.',
    keys: fix('CF', 'F7'), requires: ['balance-order', 'indirect-cash-flow', 'go-to'],
    hintStuck: 'pulse cell CF!F7 · Depreciation is Schedules row 64.',
    check: (s, ses) => fixed(ses, 'CF', 'F7', 'remLife') },
  { id: 'capex', text: 'Check 4, capex in both places: FY30 closing PP&E in I65 of Schedules leaves capex out, so put it back.',
    teach: 'Ctrl+[ selects the cells a formula reads, on any sheet, so you can follow a line back to where it comes from. Closing PP&E reads the opening and depreciation but not capex, which the cash flow still spends.',
    keys: fix('Schedules', 'I65'), requires: ['select-precedents', 'balance-order', 'corkscrew', 'go-to'],
    hintStuck: 'pulse cell Schedules!I65 · Opening plus capex less depreciation, through the flag.',
    check: (s, ses) => fixed(ses, 'Schedules', 'I65', 'capexSite') },
  { id: 'equity', text: 'Check 5, net income to equity: FY31 net income in J22 of BS is empty, so link it to the income statement.',
    keys: fix('BS', 'J22'), requires: ['balance-order', 'schedule-links', 'go-to'],
    hintStuck: 'pulse cell BS!J22 · Net income is IS row 31.',
    check: (s, ses) => fixed(ses, 'BS', 'J22', 'rent') },
  { id: 'tick-off', text: 'When the checks run out, tick it off: FY31 capex in J14 of the CF nets the PP&E change, so link it to capex.',
    teach: 'Go down the balance sheet, find each line’s change on the cash flow with the right sign, and mark both; the line left unmarked is the break. It’s the one way to find a movement counted twice, like depreciation added back and also netted into the PP&E change.',
    keys: fix('CF', 'J14'), requires: ['balance-order', 'go-to'],
    hintStuck: 'pulse cell CF!J14 · Capex is Schedules row 63, with a minus.',
    check: (s, ses) => fixed(ses, 'CF', 'J14', 'capexSite') && balanced(ses) },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "BS!F28" Enter Ctrl+G "Cover!C7" Enter', cadence: 320 },
    text: 'Does it tie? The check reads zero across eight years, and the Cover flag reads OK.', requires: [],
    hintStuck: 'pulse cell Cover!C7 · Every fix moved the check toward zero; the last one landed it.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'when-it-doesnt-balance',
  chapter: 'finance-and-accounting',
  section: 'Linking the statements',
  module: 'linking-the-statements',
  workbook: 'clearcoat-model',
  state: { before: AFTER, after: AFTER },
  plant: PLANT,
  title: 'When it doesn’t balance: the order to check',
  difficulty: 'hard',
  tags: ['model', 'balance sheet', 'debugging', 'checks'],
  access: 'paid',
  minutes: 7,
  headline: '=',
  conventions: ['F2', 'C4'],
  teaches: ['balance-order', 'select-precedents'],
  uses: ['go-to', 'schedule-links', 'indirect-cash-flow', 'corkscrew', 'cash-not-a-plug'],
  prerequisites: ['cash-sweep-revolver'],
  brief: 'A balance sheet that’s off is off for one of a short list of reasons, and a reviewer checks them in order. The difference is often a clue: exactly one line’s value, or twice a working-capital change. Six breaks are planted, one a year from FY27, and the check reads a number in each. Find each one in order and fix it. The key is `=`.',
  goals,
  endState: [
    { text: 'All six breaks are fixed and the balance check reads zero in every year', check: (s, ses) => balanced(ses) },
  ],
  closing: [
    'You found six breaks in order, and the difference told you where each one was.',
    'Best practice: read the size of the difference before you look anywhere else, because it usually names the line.',
  ],
  solution: solutionOf(goals),
};
