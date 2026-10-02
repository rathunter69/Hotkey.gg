// app2/ui/components/signin-dialog.js — Sign in for a signed-out visitor (Wolf, 2026-10-02, point 28):
// a pop-out over the page they are on, never the signed-in account menu. One email, a 6-digit code
// (the same code makes a new account), or Google. Esc or Not now closes it; signing in closes it and
// the shell redraws the page signed in. Every line is a site.csv row.
//
//   openSigninDialog({ heading, line })   → { close }
import { siteCopy } from '../../content/copy/apply.js';
import { auth } from '../../app/auth.js';
import { buttonHtml } from './table.js';
import { esc, fill } from './format.js';

const t = (k, fb) => siteCopy(k, fb);
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let open = null;

export function openSigninDialog({ heading = t('signin_head', 'Sign in or make a free account'), line = t('signin_line', '') } = {}) {
  if (open) return open;
  const back = document.activeElement;
  const el = document.createElement('div');
  el.className = 'pop';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', heading);
  document.body.appendChild(el);
  const state = { step: 'email', email: '', error: '', busy: false };
  let alive = true;

  function paint() {
    const err = state.error ? `<p class="co-err" role="alert">${esc(state.error)}</p>` : '';
    const form = state.step === 'code'
      ? `<p class="panel-line">${esc(fill(t('checkout_code_sent', 'We sent a code to {email}.'), { email: state.email }))}</p>
        <form class="co-form" id="sdCodeForm" novalidate><label class="label" for="sdCode">${esc(t('checkout_code', '6-digit code'))}</label>
        <input class="input mono" id="sdCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required>${err}
        <div class="btn-row">${buttonHtml({ label: t('checkout_verify', 'Continue'), key: 'Enter', primary: true, attrs: { type: 'submit', disabled: state.busy } })}${buttonHtml({ label: t('checkout_other_email', 'Use another email'), quiet: true, id: 'sdBack' })}</div></form>`
      : `<form class="co-form" id="sdEmailForm" novalidate><label class="label" for="sdEmail">${esc(t('checkout_email', 'Email'))}</label>
        <input class="input" id="sdEmail" type="email" autocomplete="email" value="${esc(state.email)}" required>${err}
        <div class="btn-row">${buttonHtml({ label: t('checkout_send_code', 'Send code'), key: 'Enter', primary: true, attrs: { type: 'submit', disabled: state.busy } })}${buttonHtml({ label: t('signin_google', 'Continue with Google'), id: 'sdGoogle' })}</div></form>`;
    el.innerHTML = `<section class="panel pop-card"><div class="panel-head"><h2 class="panel-h">${esc(heading)}</h2>${buttonHtml({ label: t('paywall_not_now', 'Not now'), key: 'Esc', quiet: true, id: 'sdClose' })}</div>
      ${line ? `<p class="panel-line">${esc(line)}</p>` : ''}${form}<p class="fine">${esc(t('signin_fine', ''))}</p></section>`;
    el.querySelector('#sdClose').onclick = () => close();
    const f = el.querySelector('#sdEmailForm'), c = el.querySelector('#sdCodeForm');
    if (f) {
      const inp = el.querySelector('#sdEmail'); inp.focus();
      el.querySelector('#sdGoogle').onclick = () => { auth.google(); };
      f.onsubmit = async e => {
        e.preventDefault(); if (state.busy) return;
        const email = inp.value.trim();
        if (!EMAIL_RX.test(email)) { state.error = t('checkout_err_email', 'Enter your email address.'); state.email = email; paint(); return; }
        state.busy = true; state.email = email; state.error = ''; paint();
        const r = await auth.sendCode(email);
        if (!alive) return;
        state.busy = false;
        if (r && r.error) state.error = /fetch|network/i.test(r.error) ? t('checkout_err_network', 'Network error.') : r.error; else state.step = 'code';
        paint();
      };
    }
    if (c) {
      const inp = el.querySelector('#sdCode'); inp.focus();
      el.querySelector('#sdBack').onclick = () => { state.step = 'email'; state.error = ''; paint(); };
      c.onsubmit = async e => {
        e.preventDefault(); if (state.busy) return;
        const code = inp.value.replace(/\D/g, '');
        if (code.length !== 6) { state.error = t('checkout_err_code', 'That code isn’t right.'); paint(); return; }
        state.busy = true; state.error = ''; paint();
        const r = await auth.verifyCode(state.email, code);
        if (!alive) return;
        state.busy = false;
        if (r && r.error) { state.error = t('checkout_err_code', 'That code isn’t right.'); paint(); return; }
        close();
      };
    }
  }
  const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
  const onScrim = e => { if (e.target === el) close(); };
  window.addEventListener('keydown', onKey, true);
  el.addEventListener('mousedown', onScrim);
  const off = auth.onChange(() => { if (auth.state() === 'in') close(); });
  function close() {
    if (!alive) return; alive = false;
    window.removeEventListener('keydown', onKey, true);
    if (typeof off === 'function') off();
    el.remove(); open = null;
    if (back && typeof back.focus === 'function' && document.contains(back)) back.focus({ preventScroll: true });
  }
  paint();
  open = { close };
  return open;
}

/** Links that ask for an account ('#/account' while signed out, or [data-signin]) open the dialog instead of a page. */
export function wireSigninLinks(root) {
  const onClick = e => {
    const a = e.target.closest && e.target.closest('a[href="#/account"], [data-signin]');
    if (!a || auth.state() === 'in' || !root.contains(a)) return;
    e.preventDefault(); openSigninDialog();
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
