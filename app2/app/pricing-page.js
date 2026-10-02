// app2/app/pricing-page.js — Pricing (screenplay 3.0 "Pricing and the paywall"; 3.13; M105), with
// the plans Wolf agreed on 2026-10-01 (docs/phases/E-checkout.md, decision 3): three columns, Free,
// Full Access and Teams. Full Access is the recommended plan: the mode's rule on its panel, the
// "Recommended" mark and the page's one primary button (Enter). Each column holds its price, its
// ticked rows and one action; the trust lines sit under the action; the terms follow as rows.
//
// The page shows these plans whatever the `payments` flag says (Wolf, 2026-10-02). The flag decides
// only what Get full access does: off (hotkey.gg until Wolf says go) it is disabled with "Checkout
// opens at launch."; on (preview hosts) it goes to #/checkout. Teams are sold by hand at launch, so
// Talk to us is an email.
import { siteCopy } from '../content/copy/apply.js';
import { buttonHtml } from '../ui/components/table.js';
import { paymentsOn } from './config.js';
import { auth } from './auth.js';
import { entitlement } from './entitlement.js';
import { track } from './telemetry.js';
import { isStudentEmail } from '../supabase/functions/_shared/student-domains.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (key, fb) => siteCopy(key, fb);

/** The figures, in dollars (decision 3 and 4). The copy sheet carries the same figures as words. */
export const PRICES = { month: 15, studentMonth: 9, seat: 12, minSeats: 5 };
/** Where Talk to us writes to. */
export const TEAMS_EMAIL = 'teams@hotkey.gg';

/** The ticked rows of each plan, as site.csv rows. */
export const FREE_ROWS = () => ['pricing_free_1', 'pricing_free_2', 'pricing_free_3', 'pricing_free_4'].map((k, i) => t(k, ['All of Chapter 1', 'Chapter 1’s drills and challenges', 'Rapid-fire and the Daily', 'Boards, streaks and achievements'][i]));
export const FULL_ROWS = () => ['pricing_full_1', 'pricing_full_2', 'pricing_full_3', 'pricing_full_4'].map((k, i) => t(k, ['All six chapters', 'Every drill, challenge and assessment', 'The certificate, with a page anyone can check', 'Everything added to the course later'][i]));
export const TEAMS_ROWS = () => ['pricing_teams_1', 'pricing_teams_2', 'pricing_teams_3'].map((k, i) => t(k, ['Full Access for every seat', 'One monthly invoice for the team', 'Seats added as the team grows'][i]));
/** The trust lines under Get full access, each on its own line (3.0, rule 10). */
export const TRUST_LINES = () => [t('pricing_trust_cancel', 'Cancel any time from your account.'), t('pricing_trust_refund', 'Full refund on your first payment within 14 days.'), t('pricing_trust_stripe', 'Payment is handled by Stripe.')];

const tick = () => '<i class="plan-tick" aria-hidden="true"></i>';
const rows = list => `<ul class="ticks">${list.map(r => `<li>${tick()}<span>${esc(r)}</span></li>`).join('')}</ul>`;
const lines = list => `<ul class="plan-trust">${list.map(r => `<li class="fine">${esc(r)}</li>`).join('')}</ul>`;

/** The Full Access column's foot: the one primary action, then what it needs to say beside it. Pure. */
function fullFoot({ payments, entitled }) {
  if (entitled) return `<div class="plan-foot">${buttonHtml({ label: t('account_manage', 'Manage billing'), href: '#/account', id: 'goFull' })}<p class="fine">${esc(t('pricing_signed_in_note', 'You have full access. Manage it on the Account page.'))}</p></div>`;
  const go = payments
    ? buttonHtml({ label: t('pricing_full_go', 'Get full access'), key: 'Enter', href: '#/checkout', primary: true, id: 'goFull', attrs: { 'data-cursor': true } })
    : buttonHtml({ label: t('pricing_full_go', 'Get full access'), key: 'Enter', primary: true, id: 'goFull', attrs: { disabled: true, 'aria-disabled': 'true', 'aria-describedby': 'fullSoon' } });
  return `<div class="plan-foot">${go}${payments ? '' : `<p class="fine" id="fullSoon">${esc(t('pricing_checkout_soon', 'Checkout opens at launch.'))}</p>`}${lines(TRUST_LINES())}</div>`;
}

/**
 * The page's markup. Pure. `payments`: the flag (Get full access opens checkout, or waits for
 * launch). `entitled`: the signed-in account already has full access (its column says so instead).
 */
export function pricingHtml({ payments = false, entitled = false } = {}) {
  const mail = `mailto:${TEAMS_EMAIL}?subject=${encodeURIComponent(t('pricing_teams_subject', 'hotkey.gg for a team'))}`;
  return `<div class="page pricing">
    <h1 class="h-title">${esc(t('pricing_title', 'Pricing'))}</h1>
    <div class="plans">
      <section class="panel plan" aria-label="${esc(t('pricing_free', 'Free'))}">
        <div class="h-row"><h2 class="h-panel">${esc(t('pricing_free', 'Free'))}</h2></div>
        <div class="plan-price"><span class="plan-figure mono">$0</span></div>
        <p class="plan-sub ink-2">${esc(t('pricing_free_unit', 'No card, no account needed to start'))}</p>
        ${rows(FREE_ROWS())}
        <div class="plan-foot">${buttonHtml({ label: t('landing_start', 'Start learning'), href: '#/start', id: 'goFree' })}</div>
      </section>
      <section class="panel panel-mode plan plan-full" data-mode="learn" aria-label="${esc(t('pricing_full', 'Full Access'))}">
        <div class="h-row"><h2 class="h-panel">${esc(t('pricing_full', 'Full Access'))}</h2><span class="plan-mark">${esc(t('pricing_recommended', 'Recommended'))}</span></div>
        <div class="plan-price"><span class="plan-figure mono">${esc(t('pricing_full_figure', '$' + PRICES.month))}</span><span class="ink-2">${esc(t('pricing_full_unit', 'a month'))}</span></div>
        <p class="plan-sub">${esc(t('pricing_full_student', 'Students $9 a month with your school email'))}</p>
        ${rows(FULL_ROWS())}
        ${fullFoot({ payments, entitled })}
      </section>
      <section class="panel plan" aria-label="${esc(t('pricing_teams_col', 'Teams'))}">
        <div class="h-row"><h2 class="h-panel">${esc(t('pricing_teams_col', 'Teams'))}</h2></div>
        <div class="plan-price"><span class="plan-figure mono">${esc(t('pricing_teams_figure', '$' + PRICES.seat))}</span><span class="ink-2">${esc(t('pricing_teams_unit', 'a seat a month'))}</span></div>
        <p class="plan-sub ink-2">${esc(t('pricing_teams_seats', '5 seats or more'))}</p>
        ${rows(TEAMS_ROWS())}
        <div class="plan-foot">${buttonHtml({ label: t('pricing_teams_go', 'Talk to us'), href: mail, id: 'goTeams' })}<p class="fine">${esc(t('pricing_teams_note', 'Email us the team size and we set it up.'))}</p></div>
      </section>
    </div>
    <section class="panel" aria-label="${esc(t('pricing_terms_title', 'Terms'))}">
      <table class="tbl rows-only"><tbody>
        <tr><td class="name">${esc(t('pricing_term_1_name', 'No trial'))}</td><td>${esc(t('pricing_term_1', 'Chapter 1 is free in full, for as long as you like, so it is the trial.'))}</td></tr>
        <tr><td class="name">${esc(t('pricing_term_2_name', 'Cancel any time'))}</td><td>${esc(t('pricing_term_2', 'Cancel any time from your account, and your access runs to the end of the month you paid for.'))}</td></tr>
        <tr><td class="name">${esc(t('pricing_term_3_name', 'Money back'))}</td><td>${esc(t('pricing_term_3', 'A full refund on your first payment if you ask within 14 days.'))}</td></tr>
        <tr><td class="name">${esc(t('pricing_term_4_name', 'Nothing cosmetic is sold'))}</td><td>${esc(t('pricing_term_4', 'Themes and flair are earned from your level and achievements.'))}</td></tr>
      </tbody></table>
    </section>
  </div>`;
}

export function mountPricingPage(root) {
  const el = document.createElement('div');
  const payments = paymentsOn();
  const draw = () => { el.innerHTML = pricingHtml({ payments, entitled: entitlement.entitled() }); };
  draw();
  root.appendChild(el);
  const u = auth.user();
  track('pricing_view', { student: u ? isStudentEmail(u.email) : null, payments });
  // a signed-in account's entitlement may arrive after the first paint
  let alive = true;
  if (auth.state() === 'in') entitlement.refresh().then(() => { if (alive) draw(); });
  // Enter does the primary action (3.0, rule 2): Get full access, once checkout is on; while it waits for launch the button is disabled and Enter does nothing
  const onKey = e => {
    if (e.defaultPrevented || e.key !== 'Enter') return;
    if (e.target && e.target.closest && e.target.closest('a, button, input')) return;
    const go = el.querySelector('#goFull'); if (go && !go.disabled) { e.preventDefault(); go.click(); }
  };
  document.addEventListener('keydown', onKey);
  return { destroy() { alive = false; document.removeEventListener('keydown', onKey); el.remove(); } };
}
