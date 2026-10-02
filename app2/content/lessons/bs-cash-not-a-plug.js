// Chapter 5 · 5.4.3 The balance sheet, and cash as the plug that isn't a plug (clearcoat-model, B543 → B544)
// Assets from the cash flow and the schedules, liabilities from working capital and debt (the
// revolver linked to its empty rows), equity as a corkscrew of net income and distributions, then
// the balance check with the debt and PP&E checks on Checks, and the Cover flag reading OK.
import { settled, sheetIn, reads, linesBuilt, liveVia, inputRef, plantLines, fillLines, solutionOf } from './lib/model-checks.js';

const AFTER = 'B544';
const S = 'BS';
const ASSETS = ['cash', 'rec', 'land', 'ppe', 'ta'];
const LIABS = ['pay', 'def', 'term', 'dd', 'rev', 'tl'];
const EQUITY = ['openEq', 'ni', 'dist', 'closeEq', 'tle'];
const CHECKS = ['debt', 'ppe'];
const ALL = [...ASSETS, ...LIABS, ...EQUITY, 'check'];
const lines = (ses, keys) => linesBuilt(ses, S, keys, AFTER);
const live = (ses, ref, key, col) => liveVia(ses, S, ref, [inputRef(key, col)]);
const activeName = ses => ses.sheets[ses.sheetIndex].name;
// the checks read zero by design, so they are graded on value and on what they compare
const checksLive = ses => {
  const bs = sheetIn(ses, S), ck = sheetIn(ses, 'Checks');
  return ['F', 'J'].every(c => reads(bs, `${c}28`, [`${c}10`, `${c}25`]) && reads(ck, `${c}8`, [`Schedules!${c}109`, `BS!${c}15`]) && reads(ck, `${c}9`, [`Schedules!${c}65`, `BS!${c}9`]));
};
const flagOk = ses => { const cv = sheetIn(ses, 'Cover'); return !!cv && cv.value('C7') === 'OK'; };

const goals = [
  { id: 'assets', text: 'Assets in C6:J10: cash from the cash flow’s closing line, receivables, land at cost, PP&E, then total assets.',
    teach: 'Cash looks like the plug, the number that makes the sheet balance, but it isn’t: it was built from every other line on the cash flow. So if the sheet balances, every link is right, and if it doesn’t, one of them is wrong.',
    keys: fillLines(AFTER, S, ASSETS), requires: ['cash-not-a-plug', 'schedule-links', 'index-match', 'if-function', 'sum-family', 'go-to', 'ctrl-enter-fill'], convention: 'F2',
    hintStuck: 'pulse range C6:J10 · Cash is CF row 30; receivables and PP&E are on Schedules; land holds its cost.',
    check: (s, ses) => settled(ses) && lines(ses, ASSETS) && live(ses, 'J10', 'capexSite') },
  { id: 'liabilities', text: 'Liabilities in C13:J18: payables, deferred revenue, the three debt closings, the revolver included, and the total.',
    keys: fillLines(AFTER, S, LIABS), requires: ['schedule-links', 'sum-family', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C13:J18 · Each closing balance is the last line of its block on Schedules; the revolver is row 103.',
    check: (s, ses) => settled(ses) && lines(ses, LIABS) && reads(sheetIn(ses, S), 'J17', ['Schedules!J103']) && live(ses, 'J18', 'termAmort') },
  { id: 'equity', text: 'Equity in C21:J25: opening, net income, distributions, closing, then total liabilities and equity.',
    keys: fillLines(AFTER, S, EQUITY), requires: ['corkscrew', 'schedule-links', 'index-match', 'if-function', 'sum-family', 'go-to', 'ctrl-enter-fill'],
    hintStuck: 'pulse range C21:J25 · Opening is last year’s closing; distributions read the cash flow’s line.',
    check: (s, ses) => settled(ses) && lines(ses, EQUITY) && live(ses, 'J24', 'rent') },
  { id: 'check', text: 'The balance check in C28:J28, then on Checks the debt and PP&E ties in C8:J9; every one reads zero.',
    keys: `${fillLines(AFTER, S, ['check'])} ${fillLines(AFTER, 'Checks', CHECKS)}`, requires: ['check-cell', 'round-function', 'cross-sheet-ref', 'go-to', 'ctrl-enter-fill'], convention: 'F1',
    hintStuck: 'pulse range C28:J28 · Total assets less total liabilities and equity, rounded to two places.',
    check: (s, ses) => settled(ses) && lines(ses, ['check']) && linesBuilt(ses, 'Checks', CHECKS, AFTER) && checksLive(ses) },
  { id: 'flag', text: 'Go to the checks flag in C7 of Cover and read it: OK, every check at zero.',
    keys: 'Ctrl+G "Cover!C7" ↵', requires: ['go-to', 'check-cell'],
    hintStuck: 'pulse cell Cover!C7 · The flag sums every check on Checks; zero is OK.',
    check: (s, ses) => settled(ses) && activeName(ses) === 'Cover' && sheetIn(ses, 'Cover').selectionText() === 'C7' && flagOk(ses) },
  { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!C61" Enter "6000" Enter Ctrl+G "BS!F6" Enter', cadence: 320 },
    text: 'Does it tie? Watch capex per site go to $6.0m: cash goes below zero, and the check still reads zero in every year.', requires: [],
    hintStuck: 'pulse range BS!F6:J6 · Negative cash balances too; the revolver in 5.4.4 is what stops it.',
    check: (s, ses) => ses.demoDone.has('tie') },
];

export default {
  id: 'bs-cash-not-a-plug',
  chapter: 'finance-and-accounting',
  section: 'Linking the statements',
  module: 'linking-the-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B543', after: AFTER },
  plant: { ...plantLines(AFTER, S, ALL), ...plantLines(AFTER, 'Checks', CHECKS), 'Checks!K8': null, 'Checks!K9': null },
  title: 'The balance sheet, and cash as the plug that isn’t a plug',
  difficulty: 'medium',
  tags: ['model', 'statements', 'balance sheet', 'linking', 'checks'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['F2', 'F1'],
  teaches: ['cash-not-a-plug'],
  uses: ['go-to', 'ctrl-enter-fill', 'index-match', 'if-function', 'cross-sheet-ref', 'sum-family', 'schedule-links', 'corkscrew', 'check-cell', 'round-function'],
  prerequisites: ['cf-indirect'],
  brief: 'The balance sheet links last: receivables, payables and deferred revenue from working capital, PP&E from its roll, debt from its schedule, equity as opening plus net income less distributions, and cash from the cash flow’s closing line. Cash looks like a plug but isn’t, because it was built from every other line. Link it, and the check on Checks goes live. The key is `=`.',
  goals,
  endState: [
    { text: 'The balance sheet is linked, its check and the debt and PP&E ties read zero, and the Cover flag reads OK', check: (s, ses) => lines(ses, ALL) && linesBuilt(ses, 'Checks', CHECKS, AFTER) && flagOk(ses) },
  ],
  closing: [
    'It balances, and it balances because every line was built, not forced.',
    'Best practice: never force the balance with a plug line. A model that balances by construction is the only kind a buyer will run.',
  ],
  solution: solutionOf(goals),
};
