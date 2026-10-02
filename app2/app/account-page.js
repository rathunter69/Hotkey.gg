// app2/app/account-page.js — Account (SITE_SPEC §8). Signed out: the three-way sign-in form
// (password in/up, magic link, Google), the carry-over preview, export and delete-local-data.
// Signed in: the handle editor (server errors shown verbatim), public-profile toggle, theme,
// device settings, server export, delete account. States are honest; guest mode is untouched
// when config.js is empty ("Sign-in is not configured").
import { progress } from './progress.js';
import { prefs } from './prefs.js';
import { store } from './store.js';
import { auth } from './auth.js';
import { validateHandle } from './handle.js';
import { track } from './telemetry.js';
import { LESSONS } from '../content/index.js';
import { showToast } from '../ui/toast.js';
import { statsFor } from './stats.js';
import { records } from './records.js';
import { badgesHtml } from '../ui/badges.js';
import { siteCopy } from '../content/copy/apply.js';
import { paymentsOn } from './config.js';
import { buttonHtml } from '../ui/components/table.js';
import { planDetails, openPortal, planDate } from './billing.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SECTIONS = ['stats', 'profile', 'data', 'billing'];
const fillIn = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));

/**
 * Plan and billing (3.0, Account; E-checkout section 6), behind the payments flag: the plan at the
 * right of the heading, its renewal or end date, and for a subscriber Cancel subscription (straight
 * to the portal's cancel confirmation; visible, never buried) and Manage billing (the portal home).
 * `plan` is billing.js planSummary(), or null while it loads. Pure.
 */
export function billingPanelHtml(plan, { payments = true } = {}) {
  const t = (k, fb) => siteCopy(k, fb);
  const kind = plan ? plan.kind : 'loading';
  const name = kind === 'subscription' || kind === 'granted' ? t('account_plan_full', 'Full Access') : kind === 'free' ? t('account_plan_free', 'Free') : '';
  const rows = [];
  let acts = '';
  if (kind === 'subscription') {
    if (plan.date) rows.push(fillIn(plan.renews ? t('account_plan_renews', 'Renews {date}') : t('account_plan_ends', 'Ends {date}'), { date: planDate(plan.date) }));
    if (plan.student) rows.push(t('account_plan_student', 'Student price'));
    acts = (plan.renews ? buttonHtml({ label: t('account_cancel', 'Cancel subscription'), id: 'billCancel' }) : '') + buttonHtml({ label: t('account_manage', 'Manage billing'), id: 'billManage' });
    if (plan.renews) rows.push(t('account_cancel_note', 'Cancelling keeps your access to the end of the month you paid for.'));
  } else if (kind === 'granted') {
    rows.push(plan.endsAt ? fillIn(t('account_plan_granted_until', 'From a code or a grant, until {date}'), { date: planDate(plan.endsAt) }) : t('account_plan_granted', 'From a code or a grant'));
    acts = buttonHtml({ label: t('account_manage', 'Manage billing'), id: 'billManage' });
  } else if (kind === 'free') {
    rows.push(t('account_plan_free_line', 'Chapter 1 is yours in full. Full Access opens Chapters 2 to 6.'));
    acts = buttonHtml({ label: t('account_get', 'Get Full Access'), href: payments ? '#/checkout' : '#/pricing', primary: true, id: 'billGet' });
  }
  return `<section class="panel acct-panel acct-billing" id="sec-billing" aria-label="${esc(t('account_plan', 'Plan and billing'))}">
      <div class="panel-head"><h2 class="panel-h">${esc(t('account_plan', 'Plan and billing'))}</h2>${name ? `<span class="panel-facts" id="billPlan">${esc(name)}</span>` : ''}</div>
      ${rows.map(r => `<p class="panel-line">${esc(r)}</p>`).join('')}
      <p class="co-err" id="billMsg" role="status" aria-live="polite"></p>
      ${acts ? `<div class="btn-row">${acts}</div>` : ''}
    </section>`;
}   // Settings is its own page (#/account?section=settings, settings-page.js)

/** Everything this device holds for the learner, as one JSON-able record (guest export). */
export function exportRecord() {
  return { site: 'hotkey.gg', version: 1, exportedAt: new Date().toISOString(), progress: progress.all(), prefs: prefs.get(), records: { attempts: records.attempts(), pbs: records.pbs() } };
}

function download(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function mountAccountPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'pg account';
  const want = ctx.query && SECTIONS.includes(ctx.query.section) ? ctx.query.section : null;
  let tab = 'signin';          // signin | signup | magic
  let busy = false;
  let notice = null;
  let lastEmail = '';           // { kind: 'error'|'check', text }
  let destroyed = false;
  let confirmDelete = false;    // the typed delete confirmation is open
  const payments = paymentsOn();
  let plan = null;              // planSummary() of this account's rows, once read
  const loadPlan = () => { if (!payments || auth.state() !== 'in') return; planDetails().then(p => { if (destroyed) return; plan = p || { kind: 'free' }; render(); }); };
  const offAuth = auth.onChange(() => { if (!destroyed) { notice = null; plan = null; render(); loadPlan(); } });
  const onUser = () => { if (!destroyed) render(); };
  window.addEventListener('hk:user', onUser);

  /* ---------------- signed-out ---------------- */
  function signinCard() {
    const unavailable = auth.state() === 'unavailable';
    const all = progress.all(); const p = prefs.get();
    const ids = Object.keys(all);
    const done = ids.filter(id => all[id].completed).length;
    const bests = ids.filter(id => all[id].best != null).length;
    const seg = (id, label) => `<button type="button" class="btn ${tab === id ? 'btn-primary' : 'btn-ghost'}" data-tab="${id}"${unavailable ? ' disabled' : ''}>${label}</button>`;
    const form = notice && notice.kind === 'check' ? `
        <div class="acct-check" role="status"><b>Check your email.</b> ${esc(notice.text)}</div>
        <button class="btn btn-ghost" type="button" id="backBtn">Back</button>`
      : `
        <div class="acct-tabs" role="tablist">${seg('signin', 'Sign in')}${seg('signup', 'Create account')}${seg('magic', 'Magic link')}</div>
        <form id="authForm" class="acct-form">
          <label>Email<input id="authEmail" type="email" value="${esc(lastEmail)}" autocomplete="email" required${unavailable ? ' disabled' : ''}></label>
          ${tab === 'magic' ? '' : `<label>Password<input id="authPw" type="password" autocomplete="${tab === 'signup' ? 'new-password' : 'current-password'}" minlength="8" required${unavailable ? ' disabled' : ''}></label>`}
          ${notice && notice.kind === 'error' ? `<p class="form-msg form-err" role="alert">${esc(notice.text)}</p>` : ''}
          <div class="data-actions">
            <button class="btn btn-primary" type="submit"${unavailable || busy ? ' disabled' : ''}>${busy ? '…' : tab === 'signin' ? 'Sign in' : tab === 'signup' ? 'Create account' : 'Email me a link'}</button>
            <button class="btn btn-ghost" type="button" id="googleBtn"${unavailable || busy ? ' disabled' : ''}>Google</button>
          </div>
          ${unavailable ? '<p class="form-msg" role="status">Sign-in is not configured.</p>' : ''}
          ${tab === 'signup' ? '<p class="fine">You pick a handle right after, and one is suggested. Minimum age 13.</p>' : ''}
        </form>`;
    return `<section class="panel acct-panel" id="sec-profile">
          <div class="panel-head"><h2 class="panel-h">Keep your progress across devices.</h2></div>
          <p>Email and password, a magic link, or Google. No anonymous accounts: as a guest your work stays in this browser.</p>
          ${form}
          <h3 class="row-name">What is carried over when you sign up</h3>
          <ul class="plain-list">
            <li>Lesson progress: ${ids.length} lesson${ids.length === 1 ? '' : 's'} started, ${done} completed</li>
            <li>Personal bests: ${bests}</li>
            <li>Platform (${p.platform === 'mac' ? 'Mac' : 'Windows'}) and theme</li>
            <li>Skipped lessons from placement: ${p.skipped.length}</li>
          </ul>
          <p class="fine">Carried once, to the account you create, never from another account. Your handle appears on public boards and your public profile only if you allow it.</p>
      </section>`;
  }

  /* ---------------- signed-in ---------------- */
  function profileCard() {
    const prof = store.profile();
    const u = auth.user();
    return `<section class="panel acct-panel" id="sec-profile">
          <div class="panel-head"><h2 class="panel-h">${prof && prof.handle ? esc(prof.handle) : '…'}</h2><span class="panel-facts">${esc(siteCopy('account_level', 'Level {n}').replace('{n}', prof ? prof.level : '…'))}</span></div>
          <p class="fine">${esc(u && u.email || '')}</p><p class="fine">${esc(store.saveText())}</p>
          <form id="handleForm" class="acct-form">
            <label>Handle<input id="handleInput" type="text" value="${prof ? esc(prof.handle) : ''}" maxlength="20" autocomplete="off" spellcheck="false"></label>
            <p class="fine">Appears on public boards and your public profile if you allow it; change any time (once a day).</p>
            ${notice && notice.kind === 'error' ? `<p class="form-msg form-err" role="alert">${esc(notice.text)}</p>` : ''}
            <div class="data-actions"><button class="btn btn-primary" type="submit"${busy ? ' disabled' : ''}>Save handle</button></div>
          </form>
          <label class="set set-check"><input id="pubToggle" type="checkbox"${prof && prof.public_profile ? ' checked' : ''}> Public profile<span class="set-note">${esc(siteCopy('account_public_note', ''))}</span></label>
          <form id="redeemForm" class="acct-form">
            <label>Have a code?<input id="redeemInput" type="text" placeholder="XXXX-XXXX-XXXX" maxlength="32" autocomplete="off" spellcheck="false" style="text-transform:uppercase"></label>
            <p class="form-msg" id="redeemMsg" role="status" aria-live="polite"></p>
            <div class="data-actions"><button class="btn btn-ghost" type="submit">Redeem</button></div>
          </form>
          <div class="data-actions"><button class="btn btn-ghost" id="signOutBtn" type="button">Sign out</button></div>
      </section>`;
  }

  /** The Stats section (SITE_SPEC §8): real numbers from progress + records, one source. */
  function statsCard() {
    const s = statsFor();
    const fmtDur = secs => { const m = Math.floor(secs / 60); return m >= 60 ? Math.floor(m / 60) + 'h ' + (m % 60) + 'm' : m >= 1 ? m + 'm ' + Math.round(secs % 60) + 's' : Math.round(secs) + 's'; };
    if (!s.attempts && !Object.keys(s.ctx.progress).length) {
      return `<section class="panel acct-panel" id="sec-stats"><div class="panel-head"><h2 class="panel-h">Stats</h2></div><p class="panel-line">Nothing yet: stats build from your lessons, drills and Dailies as you play.</p></section>`;
    }
    const improving = s.improvement.filter(r => r.first > r.best);
    return `<section class="panel acct-panel" id="sec-stats"><div class="panel-head"><h2 class="panel-h">Stats</h2></div>
      <div class="stats-grid">
        <div class="stat-cell"><b>${s.ctx.level}</b><span>level (${s.ctx.xp} XP)</span></div>
        <div class="stat-cell"><b>${fmtDur(s.timePractised)}</b><span>timed practice</span></div>
        <div class="stat-cell"><b>${s.attempts}</b><span>recorded runs</span></div>
        <div class="stat-cell"><b>${s.keystrokes}</b><span>keystrokes in runs</span></div>
        <div class="stat-cell"><b>${Object.keys(s.ctx.pbs).length}</b><span>personal bests</span></div>
        <div class="stat-cell"><b>${s.streak}</b><span>day streak</span></div>
      </div>
      ${improving.length ? `<p class="stats-improve">Improvement: ${improving.slice(0, 4).map(r => `${esc(r.title)} <b>${r.first.toFixed(1)}s → ${r.best.toFixed(1)}s</b>`).join(', ')}</p>` : ''}
      ${s.shortcuts.length ? `<p class="stats-keys">Most-used shortcuts (from your best runs): ${s.shortcuts.sort((a, b) => b.count - a.count).slice(0, 6).map(u => `<kbd>${esc(u.keys)}</kbd>${u.count > 1 ? '×' + u.count : ''}`).join(' ')}</p>` : ''}
      ${s.timeSaved > 5 ? `<p class="fine">${esc(siteCopy('account_time_saved', '').replace('{d}', fmtDur(s.timeSaved)))}</p>` : ''}
      <div class="stats-badges">${badgesHtml(s.ctx)}</div>
    </section>`;
  }

  /** What the learner types to delete: their handle, or DELETE while the profile is still loading. */
  function deleteWord() { const prof = store.profile(); return prof && prof.handle ? prof.handle : 'DELETE'; }
  function deleteConfirmHtml() {
    return `<div class="acct-form acct-delete" role="group" aria-labelledby="delTitle">
        <p id="delTitle"><b>Delete your account for good.</b> Profile, attempts, bests and board entries go, and it cannot be undone. Type <kbd>${esc(deleteWord())}</kbd> to confirm.</p>
        <label>Confirm<input id="deleteWordInput" type="text" autocomplete="off" spellcheck="false" autocapitalize="off"></label>
        <p class="form-msg form-err" id="deleteMsg" role="alert"></p>
        <div class="data-actions">
          <button class="btn btn-danger" id="deleteConfirmBtn" type="button" disabled>Delete my account</button>
          <button class="btn btn-ghost" id="deleteCancelBtn" type="button">Keep my account</button>
        </div>
      </div>`;
  }

  function render() {
    const signedIn = auth.state() === 'in';
    const all = store.all();
    const ids = Object.keys(all);
    const secs = ids.reduce((n, id) => n + (all[id].best || 0), 0);
    el.innerHTML = `<div class="h-row h-row-title"><h1 class="h-title">${esc(siteCopy('account_title', 'Account'))}</h1><span class="label">${signedIn ? esc(store.saveText()) : esc(siteCopy('account_guest', 'You’re a guest, so everything here is saved on this device only.'))}</span></div>
      <div class="pg-two"><div class="pg-main">${signedIn ? profileCard() : signinCard()}${signedIn && payments ? billingPanelHtml(plan, { payments }) : ''}</div>
      <div class="pg-side">${statsCard()}
      <section class="panel acct-panel" id="sec-data">
        <div class="panel-head"><h2 class="panel-h">${esc(siteCopy('account_data', 'Your data'))}</h2></div>
          <p class="panel-line">${signedIn ? 'Your progress lives in your account. Export everything we hold, or delete the account and all of it.' : "Progress and settings live in this browser's storage. Export them as a file, or delete them here."}</p>
          <div class="data-actions">
            <button class="btn btn-ghost" id="exportBtn" type="button">Export data (JSON)</button>
            ${signedIn ? (confirmDelete ? '' : '<button class="btn btn-danger" id="deleteAcctBtn" type="button">Delete account</button>') : '<button class="btn btn-danger" id="deleteBtn" type="button">Delete local data</button>'}
          </div>
          ${signedIn && confirmDelete ? deleteConfirmHtml() : ''}
          <p class="fine">${ids.length ? `${ids.length} of ${LESSONS.length} lessons have progress${secs ? `; best times total ${secs.toFixed(1)} s` : ''}.` : 'Nothing is stored yet.'}${signedIn ? ' Deleting the account removes your profile, attempts and board entries. It cannot be undone.' : ''}</p>
      </section></div></div>`;
    wire(signedIn);
  }

  function wire(signedIn) {
    // sign-in form
    el.querySelectorAll('[data-tab]').forEach(b => { b.onclick = () => { tab = b.dataset.tab; notice = null; render(); const f = el.querySelector('#authEmail'); if (f) f.focus(); }; });
    const back = el.querySelector('#backBtn'); if (back) back.onclick = () => { notice = null; render(); };
    const authForm = el.querySelector('#authForm');
    if (authForm) authForm.onsubmit = async e => {
      e.preventDefault();
      if (busy) return;
      const email = el.querySelector('#authEmail').value.trim();
      const pwEl = el.querySelector('#authPw');
      const pw = pwEl ? pwEl.value : '';
      lastEmail = email;
      busy = true; notice = null; render();
      let res;
      if (tab === 'signin') res = await auth.signInPassword(email, pw);
      else if (tab === 'signup') res = await auth.signUpPassword(email, pw);
      else res = await auth.magicLink(email);
      busy = false;
      if (res && res.error) notice = { kind: 'error', text: /Failed to fetch|NetworkError|fetch failed/i.test(res.error) ? 'Network error. Check your connection and try again.' : res.error };
      else if (res && res.confirm) { notice = { kind: 'check', text: tab === 'magic' ? 'The sign-in link is on its way; it works on this device.' : 'Click the confirmation link to finish creating your account.' }; if (tab === 'signup') track('signup'); }
      else { notice = null; track(tab === 'signup' ? 'signup' : 'sign_in'); }   // signed in: onChange re-renders
      render();
    };
    const g = el.querySelector('#googleBtn');
    if (g) g.onclick = async () => {
      if (busy) return;
      busy = true; notice = null; render();
      const res = await auth.google();
      busy = false;
      if (res && res.error) { notice = { kind: 'error', text: /provider is not enabled|validation_failed/i.test(res.error) ? 'Google sign-in isn’t switched on yet, so use email for now.' : res.error }; render(); }
    };

    // signed-in: handle + public toggle + sign out
    const handleForm = el.querySelector('#handleForm');
    if (handleForm) handleForm.onsubmit = async e => {
      e.preventDefault();
      if (busy) return;
      const h = el.querySelector('#handleInput').value.trim();
      const local = validateHandle(h);
      if (local) { notice = { kind: 'error', text: local }; render(); return; }
      const sb = auth.client(); if (!sb) return;
      busy = true; notice = null; render();
      const t = auth.token();
      try {
        const { error } = await sb.rpc('rpc_set_handle', { p_handle: h });
        if (!auth.current(t)) return;
        busy = false;
        if (error) { notice = { kind: 'error', text: error.message }; render(); return; }
        notice = null;
        await store.hydrate();
        showToast('Handle saved');
        render();
      } catch (err) { if (auth.current(t)) { busy = false; notice = { kind: 'error', text: 'Network error. Try again.' }; render(); } }
    };
    const pub = el.querySelector('#pubToggle');
    if (pub) pub.onchange = async e => {
      const sb = auth.client(); if (!sb) return;
      const t = auth.token();
      const v = e.target.checked;
      try {
        const { error } = await sb.rpc('rpc_set_profile', { p: { public_profile: v } });
        if (!auth.current(t)) return;
        if (error) { showToast('Couldn’t save. Try again'); e.target.checked = !v; return; }
        showToast(v ? 'Profile is public' : 'Profile is private');
        store.hydrate();
      } catch (err) { if (auth.current(t)) { showToast('Couldn’t save. Try again'); e.target.checked = !v; } }
    };
    const out = el.querySelector('#signOutBtn');
    if (out) out.onclick = async () => {
      if (busy) return;
      busy = true; out.disabled = true; out.textContent = 'Signing out…';
      // give queued runs a moment to reach the account; sign-out then wipes this device
      const clear = await store.drain(3000);
      const left = store.pending();
      busy = false;
      if (!clear && left && !confirm(`${left} run${left === 1 ? ' has' : 's have'} not reached your account yet and will be lost from this device. Sign out anyway?`)) { render(); return; }
      auth.signOut();
    };
    const redeem = el.querySelector('#redeemForm');
    if (redeem) redeem.onsubmit = async e => {
      e.preventDefault();
      const code = el.querySelector('#redeemInput').value.trim().toUpperCase();
      const msg = el.querySelector('#redeemMsg');
      if (!code) { msg.textContent = 'Enter the code you were given.'; return; }
      const sb = auth.client(); if (!sb) return;
      const t = auth.token();
      try {
        const { data, error } = await sb.rpc('rpc_redeem', { p_code: code });
        if (!auth.current(t)) return;
        if (error) {
          const m = String(error.message || '');
          msg.textContent = m.includes('bad code') ? 'That code isn’t right. Check it and try again.'
            : m.includes('already used') ? 'That code has already been used.'
            : m.includes('expired') ? 'That code has expired.'
            : m.includes('too many tries') ? 'Too many tries. Wait an hour.'
            : 'Couldn’t redeem. Try again.';
          return;
        }
        const until = data && data.ends_at ? new Date(data.ends_at).toLocaleDateString() : null;
        msg.textContent = until ? `Paid access is on until ${until}.` : 'Paid access is on.';
        showToast('Code redeemed');
        el.querySelector('#redeemInput').value = '';
      } catch (err) { if (auth.current(t)) msg.textContent = 'Network error. Try again.'; }
    };

    // plan and billing: the portal opens in this tab and returns to #/account
    const billMsg = el.querySelector('#billMsg');
    const portal = flow => async e => {
      const b = e.currentTarget; b.disabled = true;
      const r = await openPortal(flow);
      if (destroyed) return;
      b.disabled = false;
      if (r && r.error && billMsg) billMsg.textContent = r.error === 'no_customer' ? siteCopy('account_billing_none', 'There is no subscription on this account yet.') : siteCopy('account_billing_err', 'Billing didn’t open. Try again in a minute.');
    };
    const bc = el.querySelector('#billCancel'); if (bc) bc.onclick = portal('cancel');
    const bm = el.querySelector('#billManage'); if (bm) bm.onclick = portal(null);

    // data
    el.querySelector('#exportBtn').onclick = async () => {
      try {
        if (signedIn) {
          const sb = auth.client();
          const t = auth.token();
          const { data, error } = await sb.rpc('rpc_export_my_data');
          if (!auth.current(t)) return;
          if (error || !data) { showToast('Export failed. Try again'); return; }
          download('hotkey-account-' + new Date().toISOString().slice(0, 10) + '.json', data);
        } else {
          download('hotkey-progress-' + new Date().toISOString().slice(0, 10) + '.json', exportRecord());
        }
        showToast('Exported');
      } catch (e) { showToast('Export failed'); }
    };
    const del = el.querySelector('#deleteBtn');
    if (del) del.onclick = () => {
      if (!confirm('Delete all progress and settings saved on this device? This cannot be undone.')) return;
      progress.clear(); prefs.clear(); records.clear();
      showToast('Local data deleted');
      render();
    };
    const delAcct = el.querySelector('#deleteAcctBtn');
    // Deleting the account is a typed confirmation, never a dialog: Enter cannot carry through it
    // (the button stays disabled until the handle is typed, and there is no form to submit)
    if (delAcct) delAcct.onclick = () => { confirmDelete = true; render(); const f = el.querySelector('#deleteWordInput'); if (f) f.focus(); };
    const delWord = el.querySelector('#deleteWordInput');
    const delGo = el.querySelector('#deleteConfirmBtn');
    const delCancel = el.querySelector('#deleteCancelBtn');
    if (delCancel) delCancel.onclick = () => { confirmDelete = false; render(); };
    if (delWord && delGo) {
      delWord.oninput = () => { delGo.disabled = delWord.value.trim() !== deleteWord(); };
      delWord.onkeydown = e => { if (e.key === 'Enter') e.preventDefault(); };
      delGo.onclick = async () => {
        if (busy || delWord.value.trim() !== deleteWord()) return;
        const sb = auth.client(); if (!sb) return;
        const t = auth.token();
        const msg = el.querySelector('#deleteMsg');
        busy = true; delGo.disabled = true; delGo.textContent = 'Deleting…';
        try {
          const { error } = await sb.rpc('rpc_delete_account');
          if (!auth.current(t)) return;
          busy = false;
          if (error) { delGo.disabled = false; delGo.textContent = 'Delete my account'; msg.textContent = 'Couldn’t delete. Try again or contact support.'; return; }
          confirmDelete = false;
          await auth.signOut();
          showToast('Account deleted');
        } catch (e) {
          if (!auth.current(t)) return;
          busy = false; delGo.disabled = false; delGo.textContent = 'Delete my account';
          msg.textContent = 'Network error, so nothing was deleted. Try again.';
        }
      };
    }
    if (want) { const s = el.querySelector('#sec-' + want); if (s) { s.classList.add('flash'); s.scrollIntoView({ block: 'center' }); const f = s.querySelector('select, input, button'); if (f) f.focus({ preventScroll: true }); } }
  }
  render();
  loadPlan();
  root.appendChild(el);
  if (want) { const s = el.querySelector('#sec-' + want); if (s) s.scrollIntoView({ block: 'center' }); }
  return { destroy() { destroyed = true; offAuth(); window.removeEventListener('hk:user', onUser); el.remove(); } };
}
