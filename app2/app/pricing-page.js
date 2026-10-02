// app2/app/pricing-page.js — Pricing (screenplay 3.0 "Pricing and the paywall"; 3.13; M105): Free
// and Pro side by side as two panels, Pro with a toggle between its two terms, one ticked row per
// thing each plan holds, the primary button on Enter, the money-back line, the terms as rows,
// and Teams and classes as one row under both.
//
// The figures and the terms are the live ones (PRICES: $9 a month, $90 a year, students $7 and
// $70) and stay until Wolf says go; the toggle, the rows and the layout follow 3.0. Checkout is
// not built yet (Phase E), so Go Pro is disabled with the live "Checkout opens at launch" line.
// Once Wolf approves $29 to own or $10 a month: PRICES changes, the toggle's terms become Own it
// and Monthly (site.csv pricing_term_*), the student rows go (3.0: no student price at launch),
// and the yearly terms row goes with them.
import { siteCopy } from '../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const t = (key, fb) => siteCopy(key, fb);

/** The live figures, in dollars. Nothing here changes until Wolf says go. */
export const PRICES = { month: 9, year: 90, studentMonth: 7, studentYear: 70 };

/** The two terms of the Pro toggle, from the live figures: the figure and its unit line. Pure. */
export function proTerms(prices = PRICES) {
  return [
    { key: 'month', label: t('pricing_term_month', 'Monthly'), price: '$' + prices.month, unit: t('pricing_unit_month', 'a month, cancel any time') },
    { key: 'year', label: t('pricing_term_year', 'Yearly'), price: '$' + prices.year, unit: t('pricing_unit_year', 'a year, cancel any time') },
  ];
}

/** The ticked rows of each plan (3.13), as site.csv rows. */
export const FREE_ROWS = () => ['pricing_free_1', 'pricing_free_2', 'pricing_free_3', 'pricing_free_4'].map((k, i) => t(k, ['All of Chapter 1', 'Chapter 1’s drills and challenges', 'Rapid-fire and the Daily', 'Boards, streaks and achievements'][i]));
export const PRO_ROWS = () => ['pricing_pro_1', 'pricing_pro_2', 'pricing_pro_3', 'pricing_pro_4'].map((k, i) => t(k, ['Chapters 2 to 6', 'Every drill, challenge and assessment', 'The certificate, with a page anyone can check', 'Themes and flair as you level'][i]));

const tick = () => '<i class="plan-tick" aria-hidden="true"></i>';
const rows = list => `<ul class="ticks">${list.map(r => `<li>${tick()}<span>${esc(r)}</span></li>`).join('')}</ul>`;

export function pricingHtml({ term = 'month', prices = PRICES } = {}) {
  const terms = proTerms(prices);
  const cur = terms.find(x => x.key === term) || terms[0];
  return `<div class="page pricing">
    <h1 class="h-title">${esc(t('pricing_title', 'Pricing'))}</h1>
    <div class="cols-2 cols-equal">
      <section class="panel plan" aria-label="${esc(t('pricing_free', 'Free'))}">
        <div class="h-row"><h2 class="h-panel">${esc(t('pricing_free', 'Free'))}</h2></div>
        <div class="plan-price"><span class="plan-figure mono">$0</span><span class="ink-2">${esc(t('pricing_free_unit', 'No card, no account needed to start'))}</span></div>
        ${rows(FREE_ROWS())}
        <div class="btn-row plan-foot"><a class="btn" href="#/start" data-cursor>${esc(t('landing_start', 'Start learning'))}</a></div>
      </section>
      <section class="panel panel-mode plan plan-pro" data-mode="learn" aria-label="${esc(t('pricing_pro', 'Pro'))}">
        <div class="h-row"><h2 class="h-panel">${esc(t('pricing_pro', 'Pro'))}</h2>
          <div class="seg" role="radiogroup" aria-label="${esc(t('pricing_term', 'Term'))}">${terms.map(x => `<button type="button" class="seg-btn${x.key === cur.key ? ' on' : ''}" role="radio" aria-checked="${x.key === cur.key}" data-term="${x.key}">${esc(x.label)}</button>`).join('')}</div></div>
        <div class="plan-price"><span class="plan-figure mono" id="proFigure">${esc(cur.price)}</span><span class="ink-2" id="proUnit">${esc(cur.unit)}</span></div>
        <p class="body ink-2">${esc(fill(t('pricing_student', 'Students: ${m} a month or ${y} a year with a verified .edu or school email, rechecked yearly.'), { m: prices.studentMonth, y: prices.studentYear }))}</p>
        ${rows(PRO_ROWS())}
        <div class="btn-row plan-foot"><button type="button" class="btn btn-primary" id="goPro" disabled aria-disabled="true" data-cursor>${esc(t('paywall_go', 'Go Pro'))}<kbd class="key key-on-fill">Enter</kbd></button><span class="fine">${esc(t('pricing_checkout_soon', 'Checkout opens at launch.'))}</span></div>
        <p class="fine">${esc(t('pricing_money_back', 'If it’s not for you, you get your money back within 14 days.'))} ${esc(t('pricing_stripe', 'Checkout runs on Stripe.'))}</p>
      </section>
    </div>
    <section class="panel" aria-label="${esc(t('pricing_terms_title', 'Terms'))}">
      <table class="tbl rows-only"><tbody>
        <tr><td class="name">${esc(t('pricing_term_1_name', 'No trial'))}</td><td>${esc(t('pricing_term_1', 'Chapter 1 is free in full, for as long as you like.'))}</td></tr>
        <tr><td class="name">${esc(t('pricing_term_2_name', 'Cancel any time'))}</td><td>${esc(t('pricing_term_2', 'Access runs to the end of the period you paid for.'))}</td></tr>
        <tr><td class="name">${esc(t('pricing_term_3_name', 'Money back'))}</td><td>${esc(t('pricing_term_3', 'A full refund on your first payment if you ask within 14 days.'))}</td></tr>
        <tr><td class="name">${esc(t('pricing_term_4_name', 'Nothing cosmetic is sold'))}</td><td>${esc(t('pricing_term_4', 'Themes and flair are earned from your level and achievements.'))}</td></tr>
      </tbody></table>
    </section>
    <section class="panel row-panel" aria-label="${esc(t('pricing_teams_title', 'Teams and classes'))}">
      <p class="body"><b>${esc(t('pricing_teams_title', 'Teams and classes.'))}</b> ${esc(t('pricing_teams', 'Buying for a team or a class? For teams has desks and group access.'))}</p>
      <a class="btn" href="#/teams" data-cursor>${esc(t('landing_nav_teams', 'For teams'))}</a>
    </section>
  </div>`;
}

export function mountPricingPage(root) {
  const el = document.createElement('div');
  let term = 'month';
  el.innerHTML = pricingHtml({ term });
  root.appendChild(el);
  const terms = proTerms();
  const onClick = e => {
    const b = e.target.closest('[data-term]'); if (!b) return;
    term = b.dataset.term;
    const cur = terms.find(x => x.key === term) || terms[0];
    el.querySelectorAll('[data-term]').forEach(x => { const on = x.dataset.term === term; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
    el.querySelector('#proFigure').textContent = cur.price; el.querySelector('#proUnit').textContent = cur.unit;
  };
  el.addEventListener('click', onClick);
  // Enter does the primary action (3.0, rule 2): Go Pro, once checkout exists; until then the button is disabled and Enter does nothing
  const onKey = e => {
    if (e.defaultPrevented || e.key !== 'Enter') return;
    if (e.target && e.target.closest && e.target.closest('a, button, input')) return;
    const go = el.querySelector('#goPro'); if (go && !go.disabled) { e.preventDefault(); go.click(); }
  };
  document.addEventListener('keydown', onKey);
  return { destroy() { document.removeEventListener('keydown', onKey); el.removeEventListener('click', onClick); el.remove(); } };
}
