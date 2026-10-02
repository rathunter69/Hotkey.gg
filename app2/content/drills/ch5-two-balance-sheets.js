// Practice · Finance and Accounting — Two balance sheets (script-drills D14, D67). Domain's balance
// sheets at FY25 and FY26 side by side, the FY26 net income and depreciation under them, and a blank
// FY26 cash flow statement in column E. Write it by formula only: the operating lines as differences
// of the two balance sheets with the right sign, capex backed out of the PP&E movement and the
// depreciation, debt from its movement, distributions from the equity roll, the net change, and a
// check against the change in the cash line. Graded on every line tying to the learner's own figures
// and moving with the balance sheet cells it reads (the shared liveness rule), and the check at 0.
import { accountsDrill, buildPage, cutFrom, ties, SITE } from './accounts-drills.js';
import { script } from '../lessons/lib/model-checks.js';

const BS = [
  ['cash', 'Cash', 100000, 94000], ['rec', 'Receivables', 60000, 72000], ['ppe', 'PP&E, net', 1600000, 1640000],
  ['pay', 'Payables', 40000, 50000], ['def', 'Deferred revenue', 80000, 96000], ['debt', 'Debt', 1000000, 900000], ['eq', 'Equity', 640000, 760000],
];
const ROW = { cash: 5, rec: 6, ppe: 7, ta: 8, pay: 9, def: 10, debt: 11, eq: 12, tc: 13, ni: 16, dep: 17 };
const CF = {   // the cash flow lines: row, the reference formula, and the cells it must move with
  ni: [20, '=D16', ['D16']], dep: [21, '=D17', ['D17']],
  rec: [22, '=-(D6-C6)', ['D6', 'C6']], pay: [23, '=D9-C9', ['D9', 'C9']], def: [24, '=D10-C10', ['D10', 'C10']],
  cfo: [25, '=SUM(E20:E24)', ['D6', 'D9']],
  capex: [26, '=-(D7-C7+D17)', ['D7', 'C7', 'D17']],
  debt: [27, '=D11-C11', ['D11', 'C11']], dist: [28, '=-(C12+D16-D12)', ['C12', 'D16', 'D12']],
  net: [29, '=E25+E26+E27+E28', ['D6', 'D7', 'D11', 'D12']],
};
const cfRow = (key, label, extra = {}) => ({ key: 'cf-' + key, label, values: [null, null, CF[key][1]], ...extra });
const PAGE = buildPage({
  name: 'Two years', chapter: 5, title: `${SITE}, two balance sheets and the year between`, units: 'USD unless stated; FY26 cash flow worked from the balance sheets',
  headers: ['FY25', 'FY26', 'FY26 cash flow'],
  blocks: [
    { rows: [
      ...BS.slice(0, 3).map(([key, label, a, b]) => ({ key, label, values: [a, b] })),
      { key: 'ta', label: 'Total assets', total: true, fill: (col, r) => (col === 'E' ? null : `=SUM(${col}5:${col}7)`) },
      ...BS.slice(3).map(([key, label, a, b]) => ({ key, label, dollar: key === 'pay', values: [a, b] })),
      { key: 'tc', label: 'Total liabilities and equity', total: true, fill: (col, r) => (col === 'E' ? null : `=SUM(${col}9:${col}12)`) },
    ] },
    { title: 'FY26 profit and loss', rows: [{ key: 'ni', label: 'Net income', dollar: true, values: [null, 180000] }, { key: 'dep', label: 'Depreciation', values: [null, 120000] }] },
    { title: 'FY26 cash flow statement', rows: [
      cfRow('ni', 'Net income', { dollar: true }), cfRow('dep', 'Depreciation'), cfRow('rec', 'Change in receivables'), cfRow('pay', 'Change in payables'), cfRow('def', 'Change in deferred revenue'),
      cfRow('cfo', 'Cash from operations', { total: true }), cfRow('capex', 'Capital expenditure'), cfRow('debt', 'Debt repaid'), cfRow('dist', 'Distributions'),
      cfRow('net', 'Net change in cash', { total: true, final: true }),
    ] },
  ],
  checks: [{ label: 'Net change less the change in cash', formula: '=E29-(D5-C5)' }],
});
const CHECK = 'C' + (PAGE.std.checksRow + 1);
for (const [k, r] of Object.entries(ROW)) if (k in PAGE.at && PAGE.at[k] !== r) throw new Error(`two-balance-sheets: ${k} landed on row ${PAGE.at[k]}`);
for (const [k, [r]] of Object.entries(CF)) if (PAGE.at['cf-' + k] !== r) throw new Error(`two-balance-sheets: cf ${k} landed on row ${PAGE.at['cf-' + k]}`);
const start = cutFrom(PAGE, cells => { for (const [r] of Object.values(CF)) delete cells['E' + r].formula; delete cells[CHECK].formula; });

const v = (sh, ref) => sh.value(ref) || 0;
const WANT = {
  ni: sh => v(sh, 'D16'), dep: sh => v(sh, 'D17'),
  rec: sh => -(v(sh, 'D6') - v(sh, 'C6')), pay: sh => v(sh, 'D9') - v(sh, 'C9'), def: sh => v(sh, 'D10') - v(sh, 'C10'),
  cfo: sh => ['ni', 'dep', 'rec', 'pay', 'def'].reduce((a, k) => a + WANT[k](sh), 0),
  capex: sh => -(v(sh, 'D7') - v(sh, 'C7') + v(sh, 'D17')),
  debt: sh => v(sh, 'D11') - v(sh, 'C11'), dist: sh => -(v(sh, 'C12') + v(sh, 'D16') - v(sh, 'D12')),
  net: sh => ['cfo', 'capex', 'debt', 'dist'].reduce((a, k) => a + WANT[k](sh), 0),
};
const line = (sh, k) => ties(sh, 'E' + CF[k][0], WANT[k](sh), CF[k][2]);
const lines = (sh, keys) => keys.every(k => line(sh, k));
const checked = sh => ties(sh, CHECK, 0, ['D5']);
const typeDown = keys => keys.map(k => { const f = CF[k][1]; return f.includes('"') ? `'${f}'` : `"${f}"`; }).join(' ↵ ') + ' ↵';
const KEYS = {
  operating: `Ctrl+G "E20" ↵ ${typeDown(['ni', 'dep', 'rec', 'pay', 'def', 'cfo'])}`,
  capex: `Ctrl+G "E26" ↵ ${typeDown(['capex'])}`,
  financing: `Ctrl+G "E27" ↵ ${typeDown(['debt', 'dist'])}`,
  net: `Ctrl+G "E29" ↵ ${typeDown(['net'])} Ctrl+G "${CHECK}" ↵ "=E29-(D5-C5)" ↵`,
};

export default accountsDrill({
  id: 'ch5-two-balance-sheets',
  title: 'Two balance sheets',
  task: 'Two balance sheets and the year between them, so write the cash flow statement by formula only and land on the change in cash.',
  module: 'the-three-statements',
  tab: 'Two years',
  start,
  goals: [
    { id: 'operating', text: 'Write the operating lines in E20:E25: net income and depreciation, each working capital change with its sign, the subtotal.', keys: KEYS.operating,
      check: (s, ses) => !ses.editing && lines(s, ['ni', 'dep', 'rec', 'pay', 'def', 'cfo']) },
    { id: 'capex', text: 'Back capex out in E26 from the PP&E movement and the depreciation.', keys: KEYS.capex,
      check: (s, ses) => !ses.editing && line(s, 'capex') },
    { id: 'financing', text: 'Take debt repaid in E27 from the debt movement, and distributions in E28 from the equity roll.', keys: KEYS.financing,
      check: (s, ses) => !ses.editing && lines(s, ['debt', 'dist']) },
    { id: 'net', text: `Total the net change in cash in E29, then check it in ${CHECK} against the change in the cash line.`, keys: KEYS.net,
      check: (s, ses) => !ses.editing && line(s, 'net') && checked(s) },
  ],
  endState: [
    { text: 'Every line of the cash flow is a formula on the two balance sheets, and the check reads 0', check: s => lines(s, Object.keys(CF)) && checked(s) },
  ],
  solution: script(Object.values(KEYS).join(' ')),
  optimalKeys: 190,
  route: 75,
});
