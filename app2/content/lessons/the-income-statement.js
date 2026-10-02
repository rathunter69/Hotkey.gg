// Chapter 5 · 5.1.1 The income statement (clearcoat-model, B511 → B512)
// Domain's September on the One site page, inputs given: the learner writes the income statement
// from revenue to net income, every line a formula on the inputs above it, costs as negatives, and
// marks EBITDA and net income with a double bottom border. The number formats, the bold totals and
// their top borders arrive planted. The closer moves the ticket and every line answers.
import { site, siteLines, settled, live, at, formatsFrom, typeDown, script } from './lib/model-checks.js';

const S = 'One site';
const REFS = ['rev', 'cos', 'gp', 'gm', 'rent', 'labor', 'util', 'maint', 'card', 'siteCosts', 'contrib', 'ho', 'ebitda', 'em', 'dep', 'ebit', 'int', 'ebt', 'tax', 'ni'].map(k => at(S, k));
const PLANT = { ...formatsFrom('B512', S, REFS.filter(r => r !== 'C45' && r !== 'C52')), ...formatsFrom('B512', S, ['C45', 'C52'], ['bdbl']) };
const dbl = (sh, ref) => !!sh && !!sh.cellAt(ref).bdbl;

const K = {
  rev: 'Ctrl+G "C33" ↵ ' + typeDown(['=C6*C7']),
  gp: '↓ ' + typeDown(['=-C6*C8', '=C33+C34', '=IFERROR(C35/C33,"-")']),
  site: '↓ ' + typeDown(['=-C9', '=-C10', '=-C11', '=-C12', '=-C33*C13', '=SUM(C37:C41)', '=C35+C42']),
  ebitda: '↓ ' + typeDown(['=-C14/C15', '=C43+C44']) + ' Alt H B B ↓ ' + typeDown(['=IFERROR(C45/C33,"-")']),
  ebit: '↓ ' + typeDown(['=-C16/C17/12', '=C45+C47']),
  ebt: '↓ ' + typeDown(['=-C18*C19/12', '=C48+C49']),
  ni: '↓ ' + typeDown(['=-MAX(C50,0)*C21', '=C50+C51']) + ' Alt H B B',
};
const ok = (ses, keys, ref) => { const sh = site(ses); return settled(ses) && siteLines(sh, keys) && (!ref || live(sh, ref)); };

export default {
  id: 'the-income-statement',
  chapter: 'finance-and-accounting',
  section: 'The three statements',
  module: 'the-three-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B511', after: 'B512' },
  plant: PLANT,
  title: 'The income statement',
  difficulty: 'medium',
  tags: ['finance', 'statements', 'accounting'],
  access: 'paid',
  minutes: 7,
  headline: '=',
  conventions: ['C4', 'B4'],
  teaches: ['income-statement'],
  uses: ['go-to', 'formula-basics', 'formula-operators', 'sum-family', 'iferror-function', 'min-max-cap', 'borders-menu', 'arrow-keys'],
  prerequisites: ['ch4-assessment'],
  brief: 'The income statement says what a business earned and spent over a period, and every line has a car-wash meaning: a wash sold is revenue, chemicals are cost of sales, the crew and the rent are site costs, the tunnel wearing out is depreciation, the loan costs interest and the government takes tax. What is left is net income. You built a P&L to EBITDA in Chapter 2; this one goes to the bottom line, for Domain, for September, every line a formula on the inputs above it. The key is `=`.',
  wow: 'Twenty lines from the first wash to the bottom line, and every one of them means something the site did.',
  goals: [
    { id: 'revenue', teach: 'Revenue is what the washes earned: washes times the blended ticket. Money that comes in another way, interest on the bank balance or an insurance payout for a damaged arch, is other income, and it sits below operating profit, outside EBITDA.',
      text: 'Revenue in C33: washes times the blended ticket, =C6*C7, which reads $104,250.', keys: K.rev, requires: ['income-statement', 'go-to', 'formula-basics'], convention: 'B4',
      hintStuck: 'pulse cell C33 · Washes sit in C6 and the ticket in C7.',
      check: (s, ses) => ok(ses, ['rev'], 'C33') },
    { id: 'gross-profit', teach: 'Cost of sales is what each wash used up, the chemicals, water and power at $1.50 a wash, and it goes in as a negative (2.1.2). Revenue less cost of sales is gross profit; over revenue it is the gross margin.',
      text: 'Below it: cost of sales =-C6*C8, gross profit =C33+C34, and gross margin in C36 with IFERROR.', keys: K.gp, requires: ['income-statement', 'iferror-function', 'arrow-keys'], convention: 'C4',
      hintStuck: 'pulse range C34:C36 · The minus makes the cost a negative, so gross profit is a plain sum.',
      check: (s, ses) => ok(ses, ['cos', 'gp', 'gm'], 'C35') },
    { id: 'site-costs', teach: 'Site costs are what it takes to open the doors: the crew, the rent, the power and the upkeep, each a negative link to its input, plus card fees at 2% of revenue. Gross profit less site costs is site contribution, what one site adds before head office.',
      text: 'Site costs in C37:C41 as negatives (card fees =-C33*C13), their SUM in C42, and site contribution =C35+C42 in C43.', keys: K.site, requires: ['income-statement', 'sum-family'],
      hintStuck: 'pulse range C37:C43 · Rent, labor, utilities and maintenance are C9 to C12, each with a minus in front.',
      check: (s, ses) => ok(ses, ['rent', 'labor', 'util', 'maint', 'card', 'siteCosts', 'contrib'], 'C43') },
    { id: 'ebitda', teach: 'Head office runs all forty sites, so each carries a fortieth of it. Site contribution less that share is EBITDA, earnings before interest, tax, depreciation and amortization, the profit a buyer prices, and a double bottom border marks it as an answer.',
      text: 'Head office share in C44 =-C14/C15, EBITDA =C43+C44 in C45 with a double bottom border (Alt H B B), its margin in C46.', keys: K.ebitda, requires: ['income-statement', 'borders-menu'],
      hintStuck: 'pulse range C44:C46 · Alt H B B draws the double bottom border on the active cell.',
      check: (s, ses) => ok(ses, ['ho', 'ebitda', 'em'], 'C45') && dbl(site(ses), 'C45') },
    { id: 'depreciation', teach: 'Depreciation is the tunnel wearing out: the $2,500,000 build spread over its twenty-year life, one month of it here, and no cash leaves for it. Amortization is the same charge for something bought that you can’t touch, a brand or a customer list; Clearcoat has none, and it isn’t the loan amortization of 5.1.3, which repays principal.',
      text: 'Depreciation in C47, the build over its life for one month, =-C16/C17/12, then EBIT =C45+C47 in C48.', keys: K.ebit, requires: ['income-statement'],
      hintStuck: 'pulse range C47:C48 · Twenty years of life, twelve months a year.',
      check: (s, ses) => ok(ses, ['dep', 'ebit'], 'C48') },
    { id: 'interest', teach: 'Interest is what the loan costs for the month: the site’s share of the balance times the rate, over twelve. It sits below EBIT because it pays the lenders, not the running of the site.',
      text: 'Interest on the site’s share of the loan in C49, =-C18*C19/12, then earnings before tax =C48+C49 in C50.', keys: K.ebt, requires: ['income-statement'],
      hintStuck: 'pulse range C49:C50 · The loan is C18 and its rate C19.',
      check: (s, ses) => ok(ses, ['int', 'ebt'], 'C50') },
    { id: 'net-income', teach: 'Tax is 25% of a profit and nothing on a loss, so MAX holds the base at zero when earnings before tax go negative. What is left is net income, the bottom line.',
      text: 'Tax in C51 =-MAX(C50,0)*C21, then net income =C50+C51 in C52 with a double bottom border.', keys: K.ni, requires: ['income-statement', 'min-max-cap', 'borders-menu'],
      hintStuck: 'pulse range C51:C52 · The tax is a negative, so net income is a plain sum.',
      check: (s, ses) => ok(ses, ['tax', 'ni'], 'C52') && dbl(site(ses), 'C52') },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C7" Enter "15" Enter Ctrl+G "C52" Enter', cadence: 320 },
      text: 'Does it tie? Watch the ticket in C7 go to $15 and every line from revenue to net income answer.', requires: [],
      hintStuck: 'pulse cell C52 · Every line reads the inputs, so one change runs to the bottom.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C33:C46 run from revenue to EBITDA, every line a formula', check: (s, ses) => siteLines(site(ses), ['rev', 'cos', 'gp', 'gm', 'rent', 'labor', 'util', 'maint', 'card', 'siteCosts', 'contrib', 'ho', 'ebitda', 'em']) },
    { text: 'C47:C52 run from depreciation to net income', check: (s, ses) => siteLines(site(ses), ['dep', 'ebit', 'int', 'ebt', 'tax', 'ni']) },
    { text: 'EBITDA and net income carry a double bottom border', check: (s, ses) => dbl(site(ses), 'C45') && dbl(site(ses), 'C52') },
  ],
  closing: [
    'Domain earned $15,561 in September out of $104,250 of washes, and every line between means something the site did.',
    'Best practice: costs go in as negatives and every subtotal is a plain sum, so a reader never has to guess which way a line points. EBITDA is the line a buyer prices; net income is what is left for the owners after the lenders and the government. The next lesson asks why that profit isn’t the cash in the bank.',
  ],
  solution: script(Object.values(K).join(' ')),
};
