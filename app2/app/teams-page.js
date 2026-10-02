// app2/app/teams-page.js — Teams (screenplay 3.0 page rules; 3.13; Phase F desks v1). Teams is sold
// by hand (docs/phases/E-checkout.md, decision 6): $12 a seat a month, 5 seats or more, Talk to us by
// email, and Wolf sets the desk up and sends its code. The page says what a Teams desk is, how it
// works in four rows, and what its owner sees about each seat (the join page's promise, word for
// word); the side holds the code box, which goes to the desk's join page. There is no create button:
// desks are made by hand. Every line is a site.csv row.
import { siteCopy } from '../content/copy/apply.js';
import { esc, fill } from '../ui/components/format.js';
import { panelHtml, buttonHtml } from '../ui/components/table.js';
import { PRICES } from './plans.js';
import { codeBoxHtml, wireCodeBox, OWNER_SEES } from './desk-page.js';
import { auth } from './auth.js';

const t = (key, vars) => fill(siteCopy(key, key), vars);
/** Where Talk to us writes to (the pricing page's address). */
export const TEAMS_EMAIL = 'teams@hotkey.gg';

/** How a desk works, in order: [heading key, line key]. */
export const HOW_ROWS = [['teams_how_1_k', 'teams_how_1'], ['teams_how_2_k', 'teams_how_2'], ['teams_how_3_k', 'teams_how_3'], ['teams_how_4_k', 'teams_how_4']];
/** What a Teams desk includes, each a ticked row. */
export const DESK_ROWS = () => ['teams_row_1', 'teams_row_2', 'teams_row_3', 'teams_row_4'].map(k => t(k));

/** The page's markup. Pure. */
export function teamsHtml({ signedIn = false } = {}) {
  const mail = `mailto:${TEAMS_EMAIL}?subject=${encodeURIComponent(t('pricing_teams_subject'))}`;
  const ticks = `<ul class="ticks">${DESK_ROWS().map(r => `<li><i class="plan-tick" aria-hidden="true"></i><span>${esc(r)}</span></li>`).join('')}</ul>`;
  const plan = panelHtml({ heading: esc(t('teams_desk_head')), facts: `<span class="plan-mark">${esc(t('teams_by_hand'))}</span>`, mode: 'learn', cls: 'plan teams-plan',
    attrs: { 'data-cursor': true, 'data-cursor-enter': '#teamsTalk', tabindex: '-1' },
    body: `<div class="plan-price"><span class="plan-figure mono">${esc(t('pricing_teams_figure', '$' + PRICES.seat))}</span><span class="ink-2">${esc(t('pricing_teams_unit'))}</span></div>
      <p class="plan-sub ink-2">${esc(t('pricing_teams_seats'))}</p>
      ${ticks}
      <div class="plan-foot">${buttonHtml({ label: t('pricing_teams_go'), key: 'Enter', href: mail, primary: true, id: 'teamsTalk' })}<p class="fine">${esc(t('teams_talk_line'))}</p></div>` });
  const how = panelHtml({ heading: esc(t('teams_how_head')), cls: 'teams-how', stretch: true,
    body: `<table class="tbl rows-only"><tbody>${HOW_ROWS.map(([k, v], i) => `<tr><td class="num teams-step">${i + 1}</td><td class="name">${esc(t(k))}</td><td>${esc(t(v))}</td></tr>`).join('')}</tbody></table>` });
  const code = panelHtml({ heading: esc(t('teams_code_head')), cls: 'teams-code',
    body: `${codeBoxHtml({ id: 'teamsCode', primary: false })}${signedIn ? `<a class="panel-link" href="#/desk">${esc(t('teams_your_desk'))}</a>` : `<p class="fine">${esc(t('teams_code_signin'))}</p>`}` });
  const sees = panelHtml({ heading: esc(t('desk_sees_head')), cls: 'desk-sees-panel', stretch: true,
    body: `<ul class="desk-sees">${OWNER_SEES().map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="panel-line ink-2">${esc(t('desk_sees_not'))}</p>` });
  return `<div class="page teams">
    <div class="pr-head"><h1 class="h-title">${esc(t('teams_title'))}</h1><p class="pr-line">${esc(t('teams_sub'))}</p></div>
    <div class="pg-two"><div class="pg-main">${plan}${how}</div><div class="pg-side">${code}${sees}</div></div>
  </div>`;
}

export function mountTeamsPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.innerHTML = teamsHtml({ signedIn: auth.state() === 'in' });
  root.appendChild(el);
  wireCodeBox(el, 'teamsCode');
  // Enter does the page's one primary action, Talk to us, unless the focus is in the code box (3.0, rule 2)
  const onKey = e => {
    if (e.defaultPrevented || e.key !== 'Enter') return;
    if (e.target && e.target.closest && e.target.closest('a, button, input, select, textarea')) return;
    const go = el.querySelector('#teamsTalk'); if (go) { e.preventDefault(); go.click(); }
  };
  document.addEventListener('keydown', onKey);
  if (ctx.cursor) ctx.cursor.refresh();
  return { destroy() { document.removeEventListener('keydown', onKey); el.remove(); } };
}
