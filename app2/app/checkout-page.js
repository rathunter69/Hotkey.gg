// app2/app/checkout-page.js — #/checkout and #/checkout/done (docs/phases/E-checkout.md, section 6),
// built to screenplay 3.0: one page, one action, panels on the paper ground, the summary at the right.
//
//   #/checkout        signed out: the inline code sign-in (email, then the 6-digit code on the same
//                     page) where the form will be. Signed in: create-checkout, then Stripe's embedded
//                     form mounted in the page. Already subscribed: the plan line and Manage billing.
//   #/checkout/done   "Unlocking your course": polls the account's own entitlements every 2 s for up to
//                     20 s (the webhook grants; this page never does), then the unlocked moment and the
//                     chapter list; on timeout, the honest line and the support address.
//
// With the `payments` flag off (hotkey.gg until Wolf says go) both say checkout opens at launch.
import { auth } from './auth.js';
import { entitlement } from './entitlement.js';
import { paymentsOn, SUPPORT_EMAIL } from './config.js';
import { startCheckout, openPortal, planDetails, planDate } from './billing.js';
import { beginCheckout, mountPaymentForm } from './checkout.js';
import { track } from './telemetry.js';
import { siteCopy } from '../content/copy/apply.js';
import { buttonHtml, panelHtml } from '../ui/components/table.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (key, fb) => siteCopy(key, fb);
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));

/** How long the done page waits for the webhook, and how often it looks. */
export const POLL_MS = 2000;
export const POLL_LIMIT_MS = 20000;
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The summary at the right: what's included, the price, and the lines that make it safe to buy. Pure. */
export function summaryHtml({ student = false } = {}) {
  const inc = ['checkout_inc_1', 'checkout_inc_2', 'checkout_inc_3'].map((k, i) => t(k, ['All six chapters, and everything added later', 'Every drill, challenge and assessment', 'The certificate, with a page anyone can check'][i]));
  const body = `<div class="plan-price"><span class="plan-figure mono" id="coFigure">${student ? '$9' : '$15'}</span><span class="ink-2" id="coUnit">${esc(t('pricing_full_unit', 'a month'))}</span></div>
    ${student ? `<p class="plan-sub" id="coStudent">${esc(t('checkout_price_student', 'Student price $9 a month'))}</p>` : ''}
    <ul class="ticks">${inc.map(r => `<li><i class="plan-tick" aria-hidden="true"></i><span>${esc(r)}</span></li>`).join('')}</ul>
    <ul class="plan-trust">
      <li class="fine">${esc(t('checkout_cancel', 'Cancel any time from your account.'))}</li>
      <li class="fine">${esc(t('checkout_guarantee', 'If it’s not for you, you get your money back within 14 days.'))}</li>
      <li class="fine">${esc(t('checkout_stripe', 'Payment is handled by Stripe. Your receipt comes from Link.'))}</li>
    </ul>`;
  return panelHtml({ heading: esc(t('checkout_summary', 'Full Access')), body, mode: 'learn', cls: 'co-summary', id: 'coSummary' });
}

/** The inline sign-in: step 'email' or 'code'. Pure. */
export function signinHtml({ step = 'email', email = '', error = '', busy = false } = {}) {
  const err = error ? `<p class="co-err" role="alert">${esc(error)}</p>` : '';
  const body = step === 'code'
    ? `<p class="panel-line">${esc(fill(t('checkout_code_sent', 'We sent a code to {email}. Type it here; it works for an hour.'), { email }))}</p>
      <form class="co-form" id="coCodeForm" novalidate>
        <label class="label" for="coCode">${esc(t('checkout_code', '6-digit code'))}</label>
        <input class="input mono" id="coCode" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required>
        ${err}
        <div class="btn-row">${buttonHtml({ label: t('checkout_verify', 'Continue'), key: 'Enter', primary: true, id: 'coVerify', attrs: { type: 'submit', disabled: busy } })}${buttonHtml({ label: t('checkout_other_email', 'Use another email'), quiet: true, id: 'coBack' })}</div>
      </form>`
    : `<p class="panel-line">${esc(t('checkout_signin_line', 'Enter your email and we send you a 6-digit code. Sign in with a school email for the student price.'))}</p>
      <form class="co-form" id="coEmailForm" novalidate>
        <label class="label" for="coEmail">${esc(t('checkout_email', 'Email'))}</label>
        <input class="input" id="coEmail" name="email" type="email" autocomplete="email" value="${esc(email)}" required>
        ${err}
        <div class="btn-row">${buttonHtml({ label: t('checkout_send_code', 'Send code'), key: 'Enter', primary: true, id: 'coSend', attrs: { type: 'submit', disabled: busy } })}</div>
      </form>`;
  return panelHtml({ heading: esc(t('checkout_signin_head', 'Sign in to subscribe')), body, cls: 'co-main', id: 'coMain' });
}

/** Stripe's form goes in here; until it arrives the placeholder says what is coming. Pure. */
export function formHtml({ error = '' } = {}) {
  const body = error
    ? `<p class="co-err" role="alert">${esc(error)}</p><div class="btn-row">${buttonHtml({ label: t('checkout_retry', 'Try again'), key: 'Enter', primary: true, id: 'coRetry' })}</div>`
    : `<div class="co-stripe" id="coStripe" aria-busy="true"><p class="co-placeholder ink-2" role="status">${esc(t('checkout_loading', 'Opening the secure payment form'))}</p></div>`;
  return panelHtml({ heading: esc(t('checkout_form_label', 'Payment')), body, cls: 'co-main', id: 'coMain' });
}

/** An account that already subscribes: its plan line and Manage billing, never a second subscription. Pure. */
export function haveHtml(plan) {
  const line = planLine(plan);
  const body = `${line ? `<p class="panel-line">${esc(line)}</p>` : ''}${plan && plan.student ? `<p class="panel-line">${esc(t('account_plan_student', 'Student price'))}</p>` : ''}<p class="panel-line">${esc(t('checkout_have_line', 'Your plan is on the Account page, with your card and receipts under Manage billing.'))}</p>
    <p class="co-err" id="coPortalMsg" role="status"></p>
    <div class="btn-row">${buttonHtml({ label: t('account_manage', 'Manage billing'), key: 'Enter', primary: true, id: 'coManage' })}</div>`;
  return panelHtml({ heading: esc(t('checkout_have_head', 'You already have Full Access')), body, cls: 'co-main', id: 'coMain' });
}

/** The account's plan in one line: "Full Access, renews November 2, 2026". Pure. */
export function planLine(plan) {
  if (!plan) return '';
  const full = t('account_plan_full', 'Full Access');
  if (plan.kind === 'subscription') {
    const when = plan.date ? fill(plan.renews ? t('account_plan_renews', 'Renews {date}') : t('account_plan_ends', 'Ends {date}'), { date: planDate(plan.date) }) : '';
    return [full, when.charAt(0).toLowerCase() + when.slice(1)].filter(Boolean).join(', ');
  }
  if (plan.kind === 'granted') return full + ', ' + (plan.endsAt ? fill(t('account_plan_granted_until', 'From a code or a grant, until {date}'), { date: planDate(plan.endsAt) }) : t('account_plan_granted', 'From a code or a grant')).replace(/^F/, 'f');
  return t('account_plan_free', 'Free');
}

/** The checkout page's frame: the title, the main panel at the left, the summary at the right. Pure. */
export function checkoutHtml(main, { student = false } = {}) {
  return `<div class="page checkout">
    <h1 class="h-title">${esc(t('checkout_title', 'Get Full Access'))}</h1>
    <div class="cols-2"><div class="col" id="coLeft">${main}</div><div class="col">${summaryHtml({ student })}</div></div>
  </div>`;
}

/** With the flag off: checkout waits for launch, and Pricing is the way back. Pure. */
export function closedHtml() {
  const body = `<p class="panel-line">${esc(t('checkout_unavailable', 'Checkout opens at launch.'))}</p><div class="btn-row">${buttonHtml({ label: t('checkout_see_pricing', 'See pricing'), key: 'Enter', href: '#/pricing', primary: true, id: 'coPricing' })}</div>`;
  return `<div class="page checkout"><h1 class="h-title">${esc(t('checkout_title', 'Get Full Access'))}</h1>${panelHtml({ heading: esc(t('checkout_summary', 'Full Access')), body, mode: 'learn', cls: 'co-main' })}</div>`;
}

const friendly = code => (code === 'network' ? t('checkout_err_network', 'Network error. Check your connection and try again.') : t('checkout_err_failed', 'Checkout didn’t open. Try again in a minute.'));

/** Enter presses the page's primary button when the focus isn't in a field or on another control (3.0, rule 2). */
function enterDoesPrimary(el) {
  const onKey = e => {
    if (e.defaultPrevented || e.key !== 'Enter') return;
    if (e.target && e.target.closest && e.target.closest('a, button, input, select, textarea, iframe')) return;
    const b = el.querySelector('.btn2-primary:not([disabled])'); if (b) { e.preventDefault(); b.click(); }
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}

export function mountCheckoutPage(root, ctx = {}) {
  if (ctx.params && ctx.params.done) return mountDone(root, ctx);
  const el = document.createElement('div');
  root.appendChild(el);
  let alive = true; let embedded = null;
  const offKey = enterDoesPrimary(el);
  const destroy = () => { alive = false; offKey(); if (embedded && embedded.destroy) { try { embedded.destroy(); } catch (e) { /* already gone */ } } el.remove(); };
  if (!paymentsOn()) { el.innerHTML = closedHtml(); return { destroy }; }
  track('checkout_view', { signed_in: auth.state() === 'in' });

  const state = { step: 'email', email: '', error: '', busy: false, student: false };
  const left = () => el.querySelector('#coLeft');
  const paint = main => { if (!el.firstChild) el.innerHTML = checkoutHtml(main, { student: state.student }); else left().innerHTML = main; };

  function showSignin() {
    paint(signinHtml(state));
    const f = el.querySelector('#coEmailForm'), c = el.querySelector('#coCodeForm');
    if (f) {
      const inp = el.querySelector('#coEmail'); inp.focus();
      f.onsubmit = async e => {
        e.preventDefault(); if (state.busy) return;
        const email = inp.value.trim();
        if (!EMAIL_RX.test(email)) { state.error = t('checkout_err_email', 'Enter your email address.'); state.email = email; showSignin(); return; }
        state.busy = true; state.email = email; state.error = ''; showSignin();
        const r = await auth.sendCode(email);
        if (!alive) return;
        state.busy = false;
        if (r.error) state.error = /fetch|network/i.test(r.error) ? friendly('network') : r.error; else state.step = 'code';
        showSignin();
      };
    }
    if (c) {
      const inp = el.querySelector('#coCode'); inp.focus();
      el.querySelector('#coBack').onclick = () => { state.step = 'email'; state.error = ''; showSignin(); };
      c.onsubmit = async e => {
        e.preventDefault(); if (state.busy) return;
        const code = inp.value.replace(/\D/g, '');
        if (code.length !== 6) { state.error = t('checkout_err_code', 'That code isn’t right. Check it and try again.'); showSignin(); return; }
        state.busy = true; state.error = ''; showSignin();
        const r = await auth.verifyCode(state.email, code);
        if (!alive) return;
        state.busy = false;
        if (r.error) { state.error = /fetch|network/i.test(r.error) ? friendly('network') : t('checkout_err_code', 'That code isn’t right. Check it and try again.'); showSignin(); return; }
        track('checkout_signin', {});
        // signed in: the shell re-routes on the owner change and this page mounts again, signed in
      };
    }
  }

  async function showForm() {
    paint(formHtml());
    const r = await beginCheckout(startCheckout);
    if (!alive || r.error === 'stale') return;
    if (r.error === 'already_subscribed') { await showHave(); return; }
    if (r.error === 'not_signed_in') { showSignin(); return; }
    if (r.error) { showError(r.error); return; }
    if (r.student && !state.student) {
      state.student = true;
      const s = el.querySelector('#coSummary'); if (s) s.outerHTML = summaryHtml({ student: true });
    }
    try {
      // the processor's form (checkout.js picks the adapter; Stripe's embedded form today)
      const mount = el.querySelector('#coStripe');
      embedded = await mountPaymentForm(mount, r.session, { alive: () => alive });
      if (embedded) mount.removeAttribute('aria-busy');
    } catch (e) { if (alive) showError('failed'); }
  }

  function showError(code) {
    paint(formHtml({ error: friendly(code) }));
    el.querySelector('#coRetry').onclick = () => { showForm(); };
  }

  async function showHave() {
    const plan = await planDetails();
    if (!alive) return;
    paint(haveHtml(plan));
    const b = el.querySelector('#coManage');
    b.onclick = async () => {
      b.disabled = true;
      const r = await openPortal();
      if (!alive) return;
      b.disabled = false;
      if (r && r.error) el.querySelector('#coPortalMsg').textContent = t('account_billing_err', 'Billing didn’t open. Try again in a minute.');
    };
  }

  auth.ready().then(() => {
    if (!alive) return;
    if (auth.state() === 'in') showForm(); else showSignin();
  });
  return { destroy };
}

/** The done page's panel for each phase: waiting, unlocked, timed out, signed out. Pure. */
export function doneHtml({ phase = 'wait', chapters = [], firstHref = '#/learn' } = {}) {
  let body;
  if (phase === 'ok') {
    body = `<p class="panel-line co-done-line">${esc(t('checkout_done_ok', 'You have Full Access, and Chapters 2 to 6 are open.'))}</p>
      ${chapters.length ? `<ul class="ticks" aria-label="${esc(t('checkout_done_chapters', 'Your chapters'))}">${chapters.map(c => `<li><i class="plan-tick" aria-hidden="true"></i><a href="${esc(c.href)}">${esc(c.label)}</a></li>`).join('')}</ul>` : ''}
      <div class="btn-row">${buttonHtml({ label: t('checkout_done_go', 'Start Chapter 2'), key: 'Enter', href: firstHref, primary: true, id: 'coStart' })}</div>`;
  } else if (phase === 'timeout') {
    body = `<p class="panel-line">${esc(t('checkout_done_timeout', 'Payment received. Unlocking can take a minute; refresh this page.'))}</p>
      <p class="panel-line ink-2">${esc(fill(t('checkout_done_support', 'Still locked after that? Email {email} and we sort it out.'), { email: SUPPORT_EMAIL }))}</p>
      <div class="btn-row">${buttonHtml({ label: t('checkout_done_refresh', 'Refresh'), key: 'Enter', primary: true, id: 'coRefresh' })}</div>`;
  } else if (phase === 'signin') {
    body = `<p class="panel-line">${esc(t('checkout_done_signin', 'Sign in with the email you paid with, and your course opens.'))}</p>
      <div class="btn-row">${buttonHtml({ label: t('rail_sign_in', 'Sign in'), key: 'Enter', href: '#/checkout', primary: true, id: 'coSignin' })}</div>`;
  } else {
    body = `<p class="panel-line co-placeholder" role="status">${esc(t('checkout_done_wait', 'Payment received. Opening Chapters 2 to 6.'))}</p>`;
  }
  return `<div class="page checkout checkout-done"><h1 class="h-title">${esc(t('checkout_done_title', 'Unlocking your course'))}</h1>${panelHtml({ heading: esc(t('checkout_summary', 'Full Access')), body, mode: 'learn', cls: 'co-done', id: 'coDone' })}</div>`;
}

function mountDone(root) {
  const el = document.createElement('div');
  root.appendChild(el);
  let alive = true; let timer = null; let fx = null;
  const offKey = enterDoesPrimary(el);
  const destroy = () => { alive = false; offKey(); if (timer) clearTimeout(timer); if (fx) { try { fx.destroy(); } catch (e) { /* gone */ } } el.remove(); };
  if (!paymentsOn()) { el.innerHTML = closedHtml(); return { destroy }; }
  el.innerHTML = doneHtml({ phase: 'wait' });
  const started = Date.now();

  async function unlocked() {
    let chapters = [], firstHref = '#/learn';
    try {
      const content = await import('../content/index.js');
      const paid = content.CHAPTERS.map((c, i) => ({ c, n: i + 1 })).filter(x => x.c.access === 'paid');
      chapters = paid.map(x => ({ label: fill(t('paywall_chapter', 'Chapter {n}: {name}'), { n: x.n, name: x.c.title }), href: '#/learn' }));
      const first = paid[0] && paid[0].c.lessons && paid[0].c.lessons[0];
      if (first) firstHref = '#/lesson/' + first.id;
    } catch (e) { /* the list is a nicety; the line and the button stand */ }
    if (!alive) return;
    el.innerHTML = doneHtml({ phase: 'ok', chapters, firstHref });
    track('checkout_unlocked', { secs: Math.round((Date.now() - started) / 1000) });
    try {
      const { mountEffects } = await import('../ui/effects.js');
      if (!alive) return;
      fx = mountEffects();
      fx.play('unlocked', el.querySelector('#coDone'));
      fx.finishSound('pack');
    } catch (e) { /* no moment: the page still says it */ }
  }

  async function poll() {
    if (!alive) return;
    const paid = await entitlement.refresh(true);
    if (!alive) return;
    if (paid) { unlocked(); return; }
    if (Date.now() - started >= POLL_LIMIT_MS) {
      el.innerHTML = doneHtml({ phase: 'timeout' });
      el.querySelector('#coRefresh').onclick = () => location.reload();
      track('checkout_timeout', {});
      return;
    }
    timer = setTimeout(poll, POLL_MS);
  }

  auth.ready().then(() => {
    if (!alive) return;
    if (auth.state() !== 'in') { el.innerHTML = doneHtml({ phase: 'signin' }); return; }
    poll();
  });
  return { destroy };
}
