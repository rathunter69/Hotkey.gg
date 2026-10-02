// Chapter 5 · 5.6.3 The WACC block (clearcoat-model, B563 → B564)
// The seven sourced inputs sit on Inputs. The learner links them onto DCF, builds the cost of equity
// (risk-free plus beta times the premium, plus the size premium), the after-tax cost of debt, the
// weights and the WACC, then names the WACC cell so every discount factor reads it by name. Each line
// is graded on the figure it gives from the learner's own cells and the cells it reads.
import { sheetIn, settled, reads, near, formatsOf, doneFormula, R } from './lib/model-checks.js';

const D = 'DCF';
const c = key => 'C' + R(D, key);
const IN = { rf: 'rf', erp: 'erp', beta: 'beta', size: 'size', cod: 'cod', taxW: 'tax', debtW: 'debtW' };
const KEYS = ['rf', 'erp', 'beta', 'size', 'coe', 'cod', 'taxW', 'atcod', 'debtW', 'eqW', 'wacc'];
const F = Object.fromEntries(KEYS.map(k => [k, doneFormula(D, c(k))]));
const v = (ses, k) => sheetIn(ses, D).value(c(k));
const linkOk = (ses, k) => { const sh = sheetIn(ses, D); const src = 'Inputs!C' + R('Inputs', IN[k]); return !!sh.formula(c(k)) && reads(sh, c(k), [src]) && near(sh.value(c(k)), sheetIn(ses, 'Inputs').value(src.split('!')[1])); };
const calcOk = (ses, k, uses, want) => { const sh = sheetIn(ses, D); return !!sh.formula(c(k)) && reads(sh, c(k), uses.map(c)) && near(sh.value(c(k)), want(x => v(ses, x)), 1e-9); };
const eqInputs = ses => ['rf', 'erp', 'beta', 'size'].every(k => linkOk(ses, k));
const coeOk = ses => calcOk(ses, 'coe', ['rf', 'erp', 'beta', 'size'], x => x('rf') + x('beta') * x('erp') + x('size'));
const debtInputs = ses => ['cod', 'taxW'].every(k => linkOk(ses, k));
const atcodOk = ses => calcOk(ses, 'atcod', ['cod', 'taxW'], x => x('cod') * (1 - x('taxW')));
const weightsOk = ses => linkOk(ses, 'debtW') && calcOk(ses, 'eqW', ['debtW'], x => 1 - x('debtW'));
const waccOk = ses => calcOk(ses, 'wacc', ['eqW', 'coe', 'debtW', 'atcod'], x => x('eqW') * x('coe') + x('debtW') * x('atcod'));
const namedOk = ses => { const n = Object.entries(ses.names || {}).find(([k]) => k.toUpperCase() === 'WACC'); return !!n && String(n[1]).replace(/\$/g, '').toUpperCase() === 'DCF!' + c('wacc'); };
const type = (keys, first) => keys.map((k, i) => `${i ? '↓ ' : ''}"${F[k]}" ↵`).join(' ').replace(/^/, `Ctrl+G "${first}" ↵ `);

export default {
  id: 'wacc-block',
  chapter: 'finance-and-accounting',
  section: 'DCF',
  module: 'dcf',
  workbook: 'clearcoat-model',
  state: { before: 'B563', after: 'B564' },
  plant: formatsOf(D, KEYS.map(c)),
  title: 'The WACC block',
  difficulty: 'medium',
  tags: ['model', 'dcf', 'wacc'],
  access: 'paid',
  minutes: 6,
  headline: '=',
  conventions: ['B2', 'C9'],
  teaches: ['wacc'],
  uses: ['cross-sheet-ref', 'f4-anchor', 'go-to', 'arrow-keys', 'formula-operators', 'defined-name', 'keytips'],
  prerequisites: ['unlevered-free-cash-flow'],
  brief: 'The discount rate is the weighted average cost of capital: the return equity investors require, blended with the after-tax cost of debt, weighted by how much of the company each funds. Cost of equity is a risk-free rate plus beta times the market premium; cost of debt is what the company could borrow at today, less the tax shield; the weights come from a target capital structure. Build the block from the inputs and read what a car wash’s WACC is. The key is `=`.',
  goals: [
    { id: 'equity-inputs', teach: 'The seven WACC inputs are typed once on Inputs, each with its source in the next cell, and the DCF links them. Clearcoat is private, so its beta of 1.2 stands for the listed operators’ betas, relevered at the 40% target.',
      text: `Link the four cost of equity inputs into ${c('rf')}:${c('size')}, starting with ${c('rf')} ${F.rf}.`,
      keys: type(['rf', 'erp', 'beta', 'size'], 'DCF!' + c('rf')), requires: ['wacc', 'cross-sheet-ref', 'f4-anchor', 'go-to', 'arrow-keys'], convention: 'B2',
      hintStuck: `pulse range ${c('rf')}:${c('size')} · Rows ${R('Inputs', 'rf')} to ${R('Inputs', 'size')} on Inputs, in the same order.`,
      check: (s, ses) => settled(ses) && eqInputs(ses) },
    { id: 'coe', teach: 'The size premium is the extra return investors ask of a company as small as Clearcoat. It is added after beta times the premium, never inside it.',
      text: `Cost of equity in ${c('coe')}: ${F.coe}, about 13.2%.`,
      keys: `Ctrl+G "${c('coe')}" ↵ "${F.coe}" ↵`, requires: ['wacc', 'formula-operators', 'go-to'],
      hintStuck: `pulse cell ${c('coe')} · Risk-free, plus beta times the premium, plus the size premium.`,
      check: (s, ses) => settled(ses) && coeOk(ses) },
    { id: 'debt-inputs', text: `Link the cost of debt and the tax rate into ${c('cod')}:${c('taxW')}: ${F.cod}, then ${F.taxW}.`,
      keys: type(['cod', 'taxW'], c('cod')), requires: ['cross-sheet-ref', 'f4-anchor', 'go-to', 'arrow-keys'], convention: 'B2',
      hintStuck: `pulse range ${c('cod')}:${c('taxW')} · The loan’s 7% is what Clearcoat could borrow at today.`,
      check: (s, ses) => settled(ses) && debtInputs(ses) },
    { id: 'atcod', teach: 'Interest is deducted before tax, so every dollar of it saves a quarter in tax. Debt costs its rate times one less the tax rate.',
      text: `After-tax cost of debt in ${c('atcod')}: ${F.atcod}.`,
      keys: `Ctrl+G "${c('atcod')}" ↵ "${F.atcod}" ↵`, requires: ['wacc', 'formula-operators', 'go-to'],
      hintStuck: `pulse cell ${c('atcod')} · 7% times 75%.`,
      check: (s, ses) => settled(ses) && atcodOk(ses) },
    { id: 'weights', teach: 'The weights come from a target capital structure, the mix a buyer would fund the business with, not whatever today’s balance sheet happens to show.',
      text: `The weights: ${c('debtW')} ${F.debtW}, and ${c('eqW')} ${F.eqW}.`,
      keys: type(['debtW', 'eqW'], c('debtW')), requires: ['wacc', 'cross-sheet-ref', 'go-to', 'arrow-keys'], convention: 'B2',
      hintStuck: `pulse range ${c('debtW')}:${c('eqW')} · Equity funds whatever debt does not.`,
      check: (s, ses) => settled(ses) && weightsOk(ses) },
    { id: 'wacc', text: `WACC in ${c('wacc')}: ${F.wacc}, about 10%.`,
      keys: `Ctrl+G "${c('wacc')}" ↵ "${F.wacc}" ↵`, requires: ['wacc', 'formula-operators', 'go-to'],
      hintStuck: `pulse cell ${c('wacc')} · Each cost times its weight, added.`,
      check: (s, ses) => settled(ses) && waccOk(ses) },
    { id: 'name', teach: 'Every discount factor on the page reads this one cell, so it gets a name: WACC reads better in a formula than a cell address, and it cannot drift when rows move.',
      text: `With ${c('wacc')} selected, define the name WACC with Alt, M, M, D.`,
      keys: 'Alt M M D "WACC" ↵', requires: ['defined-name', 'keytips'], convention: 'C9',
      hintStuck: `pulse cell ${c('wacc')} · Type the name and press Enter; the cell is already selected.`,
      check: (s, ses) => settled(ses) && namedOk(ses) },
    { id: 'tie', closer: true, demo: { script: `Ctrl+G "Inputs!C${R('Inputs', 'beta')}" Enter "1.5" Enter Ctrl+G "DCF!${c('wacc')}" Enter`, cadence: 360 },
      text: 'Does it tie? Watch beta go from 1.2 to 1.5: the cost of equity rises, and WACC with it.', requires: [],
      hintStuck: `pulse cell ${c('wacc')} · Beta drives the cost of equity, and equity is 60% of the blend.`,
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The cost of equity and the after-tax cost of debt build from linked inputs', check: (s, ses) => eqInputs(ses) && coeOk(ses) && debtInputs(ses) && atcodOk(ses) },
    { text: 'WACC blends them at the target weights, and the cell is named WACC', check: (s, ses) => weightsOk(ses) && waccOk(ses) && namedOk(ses) },
  ],
  closing: [
    'Seven sourced inputs built the return the company’s investors require.',
    'Best practice: every WACC input carries its source in the next cell on Inputs. It is the number a buyer argues with first, and a source is what ends the argument.',
  ],
  solution: [type(['rf', 'erp', 'beta', 'size'], 'DCF!' + c('rf')), `Ctrl+G "${c('coe')}" ↵ "${F.coe}" ↵`, type(['cod', 'taxW'], c('cod')), `Ctrl+G "${c('atcod')}" ↵ "${F.atcod}" ↵`,
    type(['debtW', 'eqW'], c('debtW')), `Ctrl+G "${c('wacc')}" ↵ "${F.wacc}" ↵`, 'Alt M M D "WACC" ↵'].join(' ').replace(/↵/g, 'Enter').replace(/↓/g, 'Down'),
};
