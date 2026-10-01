// app2/app/deal-strip.js — "where we are in the deal" (experience pass, decision 8): the six
// stages of the sale as one line, with the current stage and what it delivers. Shown on
// Home and Learn; the workspace strip in the lesson view carries the same chapter › module
// crumb. Pure HTML from the chapter plan and the progress map.
import { CHAPTERS, modulesOf } from '../content/index.js';
import { moduleStatus } from './learn-page.js';
import { siteCopy } from '../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The six stages of the sale (docs/screenplay/screenplay.md, section 4.5): what management sends, what the analyst delivers. */
export const STAGES = [
  { n: 1, id: 'foundations', stage: siteCopy('deal_strip_stage_1', 'Preparation'), sends: 'The five Austin managers’ weekly sheets, pasted into one workbook', delivers: siteCopy('deal_strip_deliverable_1', 'A weekly KPI report the company can stand behind'), modules: 8, access: 'free' },
  { n: 2, id: 'formatting', stage: 'The book', sends: 'Three years of P&L as a raw export from the accounting system', delivers: 'The historical financials section, presentation quality', modules: 7, access: 'paid' },
  { n: 3, id: 'formulas', stage: 'First-round diligence', sends: 'The point-of-sale export, the site and package masters, the member list, and a summary that doesn’t tie', delivers: 'The KPI databook, every number reconciled to the point-of-sale data', modules: 7, access: 'paid' },
  { n: 4, id: 'data', stage: 'The data room opens', sends: 'The buyer question log, the raw transaction export and the rollout assumptions', delivers: 'The diligence pack, the utilization dashboard and the management case', modules: 6, access: 'paid' },
  { n: 5, id: 'modeling', stage: 'The final round', sends: 'The rollout plan, the debt terms and three years of statements', delivers: 'The three-statement operating model and the DCF page', modules: 5, access: 'paid' },
  { n: 6, id: 'valuation', stage: 'Final bids', sends: 'Three bids, the comparable companies, the precedent deals and a term sheet', delivers: 'The valuation and what the owners take home, on one page for the board', modules: 5, access: 'paid' },
];

/** The current stage and its module progress from the progress map. Pure over `all`. */
export function dealState(all) {
  const ch = CHAPTERS.find(c => c.id === 'foundations');
  const mods = ch ? modulesOf(ch).filter(m => m.id !== 'welcome') : [];
  const done = mods.filter(m => moduleStatus(m, all) === 'complete').length;
  const started = mods.find(m => moduleStatus(m, all) !== 'complete');
  const stage = STAGES[0];
  return { stage, modsBuilt: mods.length, done, current: started ? started.title : null, planned: stage.modules };
}

/** The strip: stage pips, the stage line, the deliverable and the module count. */
export function dealStripHtml(all, opts = {}) {
  const d = dealState(all);
  // Chapter 1 behind the learner (opts.done): stage 1 is delivered and the strip points at what comes next
  if (opts.done) {
    const nx = STAGES[1];
    const pips = STAGES.map(s => `<i class="${s.n === 1 ? 'past' : s.n === 2 ? 'now' : ''}" title="Stage ${s.n}: ${esc(s.stage)}"></i>`).join('');
    return `<div class="deal deal-done ${opts.compact ? 'deal-compact' : ''}" role="group" aria-label="Where we are in the deal">
    <span class="deal-pips" aria-hidden="true">${pips}</span>
    <span class="deal-stage"><b>Stage 1 delivered.</b> Page one of the pack is in the data room.</span>
    <span class="deal-deliver">Next: stage 2, ${esc(nx.stage)} (Pro). ${esc(nx.sends)}.</span>
    <span class="deal-count"><a href="#/learn?ch=${esc(nx.id)}">See Chapter 2</a></span>
  </div>`;
  }
  const pips = STAGES.map(s => `<i class="${s.n < d.stage.n ? 'past' : s.n === d.stage.n ? 'now' : ''}" title="Stage ${s.n}: ${esc(s.stage)}"></i>`).join('');
  return `<div class="deal ${opts.compact ? 'deal-compact' : ''}" role="group" aria-label="Where we are in the deal">
    <span class="deal-pips" aria-hidden="true">${pips}</span>
    <span class="deal-stage"><b>Stage ${d.stage.n} of 6: ${esc(d.stage.stage)}.</b> ${esc(d.stage.sends)}.</span>
    <span class="deal-deliver">Deliverable: ${esc(d.stage.delivers)}.</span>
    <span class="deal-count">${d.done} of ${d.planned} modules${d.current ? `, now on ${esc(d.current)}` : ''}</span>
  </div>`;
}
