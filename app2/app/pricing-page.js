// app2/app/pricing-page.js — Pricing (screenplay 3.0 "Pricing and the paywall"; 3.13; M105), with
// the plans Wolf agreed on 2026-10-01 (docs/phases/E-checkout.md, decision 3): Free and Full Access
// side by side with the course as a sheet beside them (what each plan opens, chapter by chapter),
// Teams as one row under them, the terms under that. Full Access is the recommended plan: the mode's rule on its panel, the
// "Recommended" mark and the page's one primary button (Enter). Each column holds its price, its
// ticked rows and one action; the trust lines sit under the action; the terms follow as rows.
//
// The page shows these plans whatever the `payments` flag says (Wolf, 2026-10-02). The flag decides
// only what Get Full Access does: off (hotkey.gg until Wolf says go) it is disabled with "Checkout
// opens at launch."; on (preview hosts) it goes to #/checkout. Teams are sold by hand at launch, so
// Talk to us is an email.
import { siteCopy } from '../content/copy/apply.js';
import { PRICES, FREE_ROWS, FULL_ROWS, TEAMS_ROWS } from './plans.js';
import { buttonHtml, tableHtml } from '../ui/components/table.js';
import { COURSE } from './progress-model.js';
import { paymentsOn } from './config.js';
import { auth } from './auth.js';
import { entitlement } from './entitlement.js';
import { track } from './telemetry.js';
import { isStudentEmail } from '../supabase/functions/_shared/student-domains.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (key, fb) => siteCopy(key, fb);

/** The figures and the plans' rows live in app/plans.js, which the landing reads too. */
export { PRICES, FREE_ROWS, FULL_ROWS, TEAMS_ROWS };
/** Where Talk to us writes to. */
export const TEAMS_EMAIL = 'teams@hotkey.gg';

/** The trust lines under Get Full Access, each on its own line (3.0, rule 10). */
export const TRUST_LINES = () => [t('pricing_trust_cancel', 'Cancel any time from your account.'), t('pricing_trust_refund', 'Full refund on your first payment within 14 days.'), t('pricing_trust_stripe', 'Payment is handled by Stripe.')];

const tick = () => '<i class="plan-tick" aria-hidden="true"></i>';

/**
 * What each plan opens, as a sheet: the six chapters by number and name, then the play everyone
 * has and the certificate, with a mark in the column of each plan that opens it. A blank cell is
 * a no, the way a blank cell reads in a workbook. Pure.
 */
export function courseSheetHtml() {
  const yes = `<i class="inc-tick" role="img" aria-label="${esc(t('pricing_included', 'Included'))}"></i>`;
  const no = `<span class="sr-only">${esc(t('pricing_not_included', 'Not included'))}</span>`;
  const rows = COURSE.chapters.map(c => ({ what: `<span class="cs-what"><span class="cs-n">${c.n}</span><span class="row-name">${esc(c.title)}</span></span>`, free: c.n === 1, full: true }))
    .concat([{ what: `<span class="cs-what"><span class="cs-n"></span><span class="row-name">${esc(t('pricing_row_play', 'Rapid-fire, the Daily and the boards'))}</span></span>`, free: true, full: true },
      { what: `<span class="cs-what"><span class="cs-n"></span><span class="row-name">${esc(t('pricing_row_cert', 'The certificate'))}</span></span>`, free: false, full: true }]);
  return tableHtml({ sheet: true, cls: 'tbl-course', label: t('pricing_sheet_head', 'What each plan opens'),
    columns: [{ key: 'what', label: t('pricing_col_what', 'In the course') }, { key: 'free', label: t('pricing_free', 'Free'), align: 'center', cls: 'free' }, { key: 'full', label: t('pricing_full', 'Full Access'), align: 'center', cls: 'full' }],
    rows: rows.map(r => ({ cells: { what: r.what, free: r.free ? yes : no, full: r.full ? yes : no }, cls: r.free ? '' : 'paid', cursor: false })) });
}
const rows = list => `<ul class="ticks">${list.map(r => `<li>${tick()}<span>${esc(r)}</span></li>`).join('')}</ul>`;
const lines = list => `<ul class="plan-trust">${list.map(r => `<li class="fine">${esc(r)}</li>`).join('')}</ul>`;

/** The Full Access column's foot: the one primary action, then what it needs to say beside it. Pure. */
function fullFoot({ payments, entitled }) {
  if (entitled) return `<div class="plan-foot">${buttonHtml({ label: t('account_manage', 'Manage billing'), href: '#/account', id: 'goFull' })}<p class="fine">${esc(t('pricing_signed_in_note', 'You have Full Access. Manage it on the Account page.'))}</p></div>`;
  const go = payments
    ? buttonHtml({ label: t('pricing_full_go', 'Get Full Access'), key: 'Enter', href: '#/checkout', primary: true, id: 'goFull', attrs: { 'data-cursor': true } })
    : buttonHtml({ label: t('pricing_full_go', 'Get Full Access'), key: 'Enter', primary: true, id: 'goFull', attrs: { disabled: true, 'aria-disabled': 'true', 'aria-describedby': 'fullSoon' } });
  return `<div class="plan-foot">${go}${payments ? '' : `<p class="fine" id="fullSoon">${esc(t('pricing_checkout_soon', 'Checkout opens at launch.'))}</p>`}${lines(TRUST_LINES())}</div>`;
}

/**
 * The page's markup. Pure. `payments`: the flag (Get Full Access opens checkout, or waits for
 * launch). `entitled`: the signed-in account already has Full Access (its column says so instead).
 */
export function pricingHtml({ payments = false, entitled = false } = {}) {
  const mail = `mailto:${TEAMS_EMAIL}?subject=${encodeURIComponent(t('pricing_teams_subject', 'hotkey.gg for a team'))}`;
  return `<div class="page pricing">
    <div class="pr-head"><h1 class="h-title">${esc(t('pricing_title', 'Pricing'))}</h1><p class="pr-line">${esc(t('pricing_line', 'Chapter 1 is free in full. Full Access opens the other five chapters and the certificate.'))}</p></div>
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
      <section class="panel pr-course" aria-label="${esc(t('pricing_sheet_head', 'What each plan opens'))}"><div class="panel-head"><h2 class="panel-h">${esc(t('pricing_sheet_head', 'What each plan opens'))}</h2></div>${courseSheetHtml()}</section>
      <section class="panel plan" aria-label="${esc(t('pricing_teams_col', 'Teams'))}">
        <div class="pt-who"><h2 class="h-panel">${esc(t('pricing_teams_col', 'Teams'))}</h2>
        <div class="plan-price"><span class="plan-figure mono">${esc(t('pricing_teams_figure', '$' + PRICES.seat))}</span><span class="ink-2">${esc(t('pricing_teams_unit', 'a seat a month'))}</span></div>
        <p class="plan-sub ink-2">${esc(t('pricing_teams_seats', '5 seats or more'))}</p></div>
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
  // Enter does the primary action (3.0, rule 2): Get Full Access, once checkout is on; while it waits for launch the button is disabled and Enter does nothing
  const onKey = e => {
    if (e.defaultPrevented || e.key !== 'Enter') return;
    if (e.target && e.target.closest && e.target.closest('a, button, input')) return;
    const go = el.querySelector('#goFull'); if (go && !go.disabled) { e.preventDefault(); go.click(); }
  };
  document.addEventListener('keydown', onKey);
  return { destroy() { alive = false; document.removeEventListener('keydown', onKey); el.remove(); } };
}
