// app2/app/pricing-page.js — Pricing (SITE_SPEC §10): Free vs Paid, $9/mo, $90/yr, student $7/mo,
// $70/yr, no trial, 14-day guarantee, a "Teams and schools" row linking #/teams. Checkout buttons
// are disabled with "Checkout opens at launch" (the merchant of record is still being decided).
export const PRICES = { month: 9, year: 90, studentMonth: 7, studentYear: 70 };

export function mountPricingPage(root) {
  const el = document.createElement('div');
  el.className = 'page pricing';
  el.innerHTML = `<div class="page-head"><h1>Pricing</h1><p class="page-sub">Free to learn the basics. Paid for advanced Excel, full model builds and serious timed play. No trial: the free chapter is the trial.</p></div>
    <div class="l-tiers">
      <div class="l-tier">
        <div class="l-tier-cap">free</div>
        <div class="l-tier-body">
          <div class="l-price"><b>$0</b><span>no account, no card</span></div>
          <ul>
            <li><b>All of Chapter 1, Foundations</b>: navigation, editing, formatting, basic formulas, the Ribbon</li>
            <li>Chapter 1 timed drills, repeats and personal bests</li>
            <li>The Daily</li>
            <li>One sample lesson from each paid chapter</li>
            <li>A core set of themes</li>
          </ul>
          <a class="l-btn" href="#/start">Start learning →</a>
        </div>
      </div>
      <div class="l-tier l-tier-pro">
        <div class="l-tier-cap">paid</div>
        <div class="l-tier-body">
          <div class="l-price"><b>$${PRICES.month}</b><span>per month</span><span class="l-or">or</span><b>$${PRICES.year}</b><span>per year</span></div>
          <p class="l-alt">Students: <b>$${PRICES.studentMonth}</b> a month or <b>$${PRICES.studentYear}</b> a year with a verified .edu or school email, rechecked yearly.</p>
          <ul>
            <li><b>Chapters 2 to 6</b>: formatting and presentation, formulas and functions, data and analysis, financial modeling, valuation and deals</li>
            <li>Full model builds and end-of-chapter projects</li>
            <li>Timed and competitive play on that content: pars, boards, rank</li>
            <li>Chapter assessments and Verified certificates</li>
          </ul>
          <div class="price-actions">
            <button class="btn btn-primary" type="button" disabled aria-disabled="true" title="Checkout opens at launch">Monthly · $${PRICES.month}</button>
            <button class="btn btn-primary" type="button" disabled aria-disabled="true" title="Checkout opens at launch">Yearly · $${PRICES.year}</button>
            <button class="btn btn-ghost" type="button" disabled aria-disabled="true" title="Checkout opens at launch">Student</button>
          </div>
          <p class="l-note">Checkout opens at launch.</p>
        </div>
      </div>
    </div>
    <section class="price-terms">
      <div class="pt-row"><b>No trial</b><span>Chapter 1 is free in full, for as long as you like. That is the trial.</span></div>
      <div class="pt-row"><b>14-day guarantee</b><span>A full refund on your first payment if you ask within 14 days.</span></div>
      <div class="pt-row"><b>Cancel any time</b><span>Access runs to the end of the period you paid for. No questions.</span></div>
      <div class="pt-row"><b>Nothing cosmetic is sold</b><span>Themes, frames and flair are earned from level, achievements and rank.</span></div>
    </section>
    <section class="l-teams">
      <div><h2>Teams and schools</h2><p class="l-sub">Desks are free to create. Group access for banks, training providers and schools comes as one code or link, a seat count and one end date, with a progress view for the organiser.</p></div>
      <a class="l-btn" href="#/teams">Teams and schools →</a>
    </section>`;
  root.appendChild(el);
  return { destroy() { el.remove(); } };
}
