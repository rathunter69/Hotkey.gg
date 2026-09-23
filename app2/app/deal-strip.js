// app2/app/deal-strip.js — "where we are in the deal" (experience pass, decision 8): the six
// stages of Project Volt as one line, with the current stage and what it delivers. Shown on
// Home and Learn; the workspace strip in the lesson view carries the same chapter › module
// crumb. Pure HTML from the chapter plan and the progress map.
import { CHAPTERS, modulesOf } from '../content/index.js';
import { moduleStatus } from './learn-page.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The six stages of the sale (docs/proposals/CURRICULUM_MAP): what management sends, what the analyst delivers. */
export const STAGES = [
  { n: 1, id: 'foundations', stage: 'The data comes in', sends: 'The weekly site report for the Austin cluster, untidy', delivers: 'The weekly KPI page: clean, live, formatted, checked, print-ready', modules: 7, access: 'free' },
  { n: 2, id: 'formatting', stage: 'Historical financials for the book', sends: 'Three years of P&L as a raw dump', delivers: 'The historical financials section, presentation quality', modules: 7, access: 'paid' },
  { n: 3, id: 'formulas', stage: 'The KPI databook', sends: 'Site master, tariff master, a session export, a summary that does not tie', delivers: 'The operating KPI databook, every number reconciled', modules: 7, access: 'paid' },
  { n: 4, id: 'data', stage: 'Diligence and the management case', sends: 'The data room opens; buyer questions arrive', delivers: 'The diligence pack, the utilization dashboard, the management case', modules: 6, access: 'paid' },
  { n: 5, id: 'modeling', stage: 'The operating model', sends: 'The rollout plan and the debt terms', delivers: 'The three-statement model buyers run their own cases on', modules: 5, access: 'paid' },
  { n: 6, id: 'valuation', stage: 'Valuation and the buyer universe', sends: 'Comparable companies, precedent deals, a term sheet', delivers: 'The valuation section and the one-page summary for the board', modules: 5, access: 'paid' },
];

/** The current stage and its module progress from the progress map. Pure over `all`. */
export function dealState(all) {
  const ch = CHAPTERS.find(c => c.id === 'foundations');
  const mods = ch ? modulesOf(ch) : [];
  const done = mods.filter(m => moduleStatus(m, all) === 'complete').length;
  const started = mods.find(m => moduleStatus(m, all) !== 'complete');
  const stage = STAGES[0];
  return { stage, modsBuilt: mods.length, done, current: started ? started.title : null, planned: stage.modules };
}

/** The strip: stage pips, the stage line, the deliverable and the module count. */
export function dealStripHtml(all, opts = {}) {
  const d = dealState(all);
  const pips = STAGES.map(s => `<i class="${s.n < d.stage.n ? 'past' : s.n === d.stage.n ? 'now' : ''}" title="Stage ${s.n} · ${esc(s.stage)}"></i>`).join('');
  return `<div class="deal ${opts.compact ? 'deal-compact' : ''}" role="group" aria-label="Where we are in the deal">
    <span class="deal-pips" aria-hidden="true">${pips}</span>
    <span class="deal-stage"><b>Stage ${d.stage.n} of 6 · ${esc(d.stage.stage)}.</b> ${esc(d.stage.sends)}.</span>
    <span class="deal-deliver">Deliverable: ${esc(d.stage.delivers)}.</span>
    <span class="deal-count">${d.done} of ${d.planned} modules${d.current ? ` · now: ${esc(d.current)}` : ''}</span>
  </div>`;
}
