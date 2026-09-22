// app2/app/account-page.js — Account (SITE_SPEC §8). Signed out: the three-way sign-in form
// (password in/up, magic link, Google), the carry-over preview, export and delete-local-data.
// Signed in: the handle editor (server errors shown verbatim), public-profile toggle, theme,
// device settings, server export, delete account. States are honest; guest mode is untouched
// when config.js is empty ("Sign-in is not configured").
import { progress } from './progress.js';
import { prefs, PLATFORMS } from './prefs.js';
import { store } from './store.js';
import { auth } from './auth.js';
import { validateHandle } from './handle.js';
import { LESSONS } from '../content/index.js';
import { showToast } from '../ui/toast.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SECTIONS = ['desks', 'stats', 'profile', 'settings', 'data'];

/** Everything this device holds for the learner, as one JSON-able record (guest export). */
export function exportRecord() {
  return { site: 'hotkey.gg', version: 1, exportedAt: new Date().toISOString(), progress: progress.all(), prefs: prefs.get() };
}

function download(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function mountAccountPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'page account';
  const want = ctx.query && SECTIONS.includes(ctx.query.section) ? ctx.query.section : null;
  let tab = 'signin';          // signin | signup | magic
  let busy = false;
  let notice = null;           // { kind: 'error'|'check', text }
  let destroyed = false;
  const offAuth = auth.onChange(() => { if (!destroyed) { notice = null; render(); } });
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
          <label>Email<input id="authEmail" type="email" autocomplete="email" required${unavailable ? ' disabled' : ''}></label>
          ${tab === 'magic' ? '' : `<label>Password<input id="authPw" type="password" autocomplete="${tab === 'signup' ? 'new-password' : 'current-password'}" minlength="8" required${unavailable ? ' disabled' : ''}></label>`}
          ${notice && notice.kind === 'error' ? `<p class="form-msg form-err" role="alert">${esc(notice.text)}</p>` : ''}
          <div class="data-actions">
            <button class="btn btn-primary" type="submit"${unavailable || busy ? ' disabled' : ''}>${busy ? '…' : tab === 'signin' ? 'Sign in' : tab === 'signup' ? 'Create account' : 'Email me a link'}</button>
            <button class="btn btn-ghost" type="button" id="googleBtn"${unavailable || busy ? ' disabled' : ''}>Google</button>
          </div>
          ${unavailable ? '<p class="form-msg" role="status">Sign-in is not configured.</p>' : ''}
          ${tab === 'signup' ? '<p class="page-fine">You pick a handle right after — one is suggested. Minimum age 13.</p>' : ''}
        </form>`;
    return `<section class="acard acard-signin">
        <div class="acard-cap">sign in</div>
        <div class="acard-body">
          <h2>Keep your progress across devices.</h2>
          <p>Email and password, a magic link, or Google. No anonymous accounts: as a guest your work stays in this browser.</p>
          ${form}
          <h3>What is carried over when you sign up</h3>
          <ul class="plain-list">
            <li>Lesson progress: ${ids.length} lesson${ids.length === 1 ? '' : 's'} started, ${done} completed</li>
            <li>Personal bests: ${bests}</li>
            <li>Platform (${p.platform === 'mac' ? 'Mac' : 'Windows'}) and theme</li>
            <li>Skipped lessons from placement: ${p.skipped.length}</li>
          </ul>
          <p class="page-fine">Carried once, to the account you create, never from another account. Your handle appears on public boards and your public profile only if you allow it.</p>
        </div>
      </section>`;
  }

  /* ---------------- signed-in ---------------- */
  function profileCard() {
    const prof = store.profile();
    const u = auth.user();
    return `<section class="acard acard-signin">
        <div class="acard-cap">your account</div>
        <div class="acard-body">
          <h2>${prof && prof.handle ? esc(prof.handle) : '…'} <span class="page-fine">· level ${prof ? prof.level : '…'}</span></h2>
          <p class="page-fine">${esc(u && u.email || '')} · ${esc(store.saveText())}</p>
          <form id="handleForm" class="acct-form">
            <label>Handle<input id="handleInput" type="text" value="${prof ? esc(prof.handle) : ''}" maxlength="20" autocomplete="off" spellcheck="false"></label>
            <p class="page-fine">Appears on public boards and your public profile if you allow it; change any time (once a day).</p>
            ${notice && notice.kind === 'error' ? `<p class="form-msg form-err" role="alert">${esc(notice.text)}</p>` : ''}
            <div class="data-actions"><button class="btn btn-primary" type="submit"${busy ? ' disabled' : ''}>Save handle</button></div>
          </form>
          <label class="set set-check"><input id="pubToggle" type="checkbox"${prof && prof.public_profile ? ' checked' : ''}> Public profile<span class="set-note">Handle, level, rank and best times on boards and your profile page. Off = nothing public.</span></label>
          <div class="data-actions"><button class="btn btn-ghost" id="signOutBtn" type="button">Sign out</button></div>
        </div>
      </section>`;
  }

  function render() {
    const signedIn = auth.state() === 'in';
    const all = store.all(); const p = prefs.get();
    const ids = Object.keys(all);
    const secs = ids.reduce((n, id) => n + (all[id].best || 0), 0);
    el.innerHTML = `<div class="page-head"><h1>Account</h1><p class="page-sub">${signedIn ? `Signed in. Progress is <b>${esc(store.saveText().toLowerCase())}</b>.` : 'You are a guest. Everything here is <b>saved on this device</b> only.'}</p></div>
      <div class="acct-grid">
        ${signedIn ? profileCard() : signinCard()}
        <div class="acct-col">
          ${[['desks', 'Desks', 'Create a desk, invite by code or link, a private board and assignments from a captain.', 'Desks arrive after accounts.'],
            ['stats', 'Stats', 'Time, personal bests, improvement history, keystroke counts, shortcuts used, and an estimated time saved.', 'Stats arrive with timed play.'],
            ['profile', 'Profile', 'Handle, level, rank, featured achievements, best times. School and desk by opt-in only.', 'The public profile page arrives with the game layer.']].map(([id, t, d, note]) =>
            `<section class="acard" id="sec-${id}"><div class="acard-cap">${t.toLowerCase()}</div><div class="acard-body"><h2>${t}</h2><p>${d}</p><p class="coming">${note} Coming in a later phase.</p></div></section>`).join('')}
        </div>
      </div>
      <section class="acard" id="sec-settings">
        <div class="acard-cap">settings</div>
        <div class="acard-body settings-grid">
          <label class="set">Keys follow<select id="setPlatform">${PLATFORMS.map(v => `<option value="${v}"${p.platform === v ? ' selected' : ''}>${v === 'mac' ? 'Mac (⌘, ⌥)' : 'Windows (Ctrl, Alt)'}</option>`).join('')}</select><span class="set-note">Instructions and keycaps follow this. Stays with this device.</span></label>
          <label class="set">Ribbon<select id="setRibbon"><option value=""${!p.ribbon ? ' selected' : ''}>Default (full in Chapter 1, slim after)</option><option value="full"${p.ribbon === 'full' ? ' selected' : ''}>Always the full ribbon</option><option value="slim"${p.ribbon === 'slim' ? ' selected' : ''}>Always the slim strip</option></select><span class="set-note">Alt shows KeyTips on either.</span></label>
          <label class="set set-check"><input id="setMute" type="checkbox"${p.mute ? ' checked' : ''}> Mute sounds<span class="set-note">Sounds are soft and off until you start.</span></label>
          <div class="set"><span>Theme</span><button class="btn btn-ghost" id="setTheme" type="button">Open the theme picker</button><span class="set-note">${signedIn ? 'Follows your account.' : 'Also top right, on every page.'}</span></div>
        </div>
      </section>
      <section class="acard" id="sec-data">
        <div class="acard-cap">your data</div>
        <div class="acard-body">
          <p>${signedIn ? 'Your progress lives in your account. Export everything we hold, or delete the account and all of it.' : "Progress and settings live in this browser's storage. Export them as a file, or delete them here."}</p>
          <div class="data-actions">
            <button class="btn btn-ghost" id="exportBtn" type="button">Export data (JSON)</button>
            ${signedIn ? '<button class="btn btn-danger" id="deleteAcctBtn" type="button">Delete account</button>' : '<button class="btn btn-danger" id="deleteBtn" type="button">Delete local data</button>'}
          </div>
          <p class="page-fine">${ids.length ? `${ids.length} of ${LESSONS.length} lessons have progress${secs ? `; best times total ${secs.toFixed(1)} s` : ''}.` : 'Nothing is stored yet.'}${signedIn ? ' Deleting the account removes your profile, attempts and board entries. It cannot be undone.' : ''}</p>
        </div>
      </section>`;
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
      busy = true; notice = null; render();
      const emailEl = el.querySelector('#authEmail'); if (emailEl) emailEl.value = email;
      let res;
      if (tab === 'signin') res = await auth.signInPassword(email, pw);
      else if (tab === 'signup') res = await auth.signUpPassword(email, pw);
      else res = await auth.magicLink(email);
      busy = false;
      if (res && res.error) notice = { kind: 'error', text: res.error };
      else if (res && res.confirm) notice = { kind: 'check', text: tab === 'magic' ? 'The sign-in link is on its way; it works on this device.' : 'Click the confirmation link to finish creating your account.' };
      else notice = null;   // signed in: onChange re-renders
      render();
    };
    const g = el.querySelector('#googleBtn');
    if (g) g.onclick = async () => {
      if (busy) return;
      busy = true; notice = null; render();
      const res = await auth.google();
      busy = false;
      if (res && res.error) { notice = { kind: 'error', text: /provider is not enabled|validation_failed/i.test(res.error) ? 'Google sign-in is not switched on yet — use email for now.' : res.error }; render(); }
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
      } catch (err) { if (auth.current(t)) { busy = false; notice = { kind: 'error', text: 'Network error — try again.' }; render(); } }
    };
    const pub = el.querySelector('#pubToggle');
    if (pub) pub.onchange = async e => {
      const sb = auth.client(); if (!sb) return;
      const t = auth.token();
      const v = e.target.checked;
      try {
        const { error } = await sb.rpc('rpc_set_profile', { p: { public_profile: v } });
        if (!auth.current(t)) return;
        if (error) { showToast('Could not save — try again'); e.target.checked = !v; return; }
        showToast(v ? 'Profile is public' : 'Profile is private');
        store.hydrate();
      } catch (err) { if (auth.current(t)) { showToast('Could not save — try again'); e.target.checked = !v; } }
    };
    const out = el.querySelector('#signOutBtn');
    if (out) out.onclick = () => auth.signOut();

    // settings (device prefs, unchanged)
    el.querySelector('#setPlatform').onchange = e => { prefs.set({ platform: e.target.value }); showToast('Keys follow ' + (e.target.value === 'mac' ? 'Mac' : 'Windows')); };
    el.querySelector('#setRibbon').onchange = e => { const v = e.target.value || null; prefs.set({ ribbon: v }); showToast('Ribbon: ' + (v || 'default')); };
    el.querySelector('#setMute').onchange = e => { prefs.set({ mute: e.target.checked }); showToast(e.target.checked ? 'Sounds muted' : 'Sounds on'); };
    el.querySelector('#setTheme').onclick = () => { if (ctx.nav && ctx.nav.openThemes) ctx.nav.openThemes(); else { const b = document.getElementById('navThemes'); if (b) b.click(); } };

    // data
    el.querySelector('#exportBtn').onclick = async () => {
      try {
        if (signedIn) {
          const sb = auth.client();
          const t = auth.token();
          const { data, error } = await sb.rpc('rpc_export_my_data');
          if (!auth.current(t)) return;
          if (error || !data) { showToast('Export failed — try again'); return; }
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
      progress.clear(); prefs.clear();
      showToast('Local data deleted');
      render();
    };
    const delAcct = el.querySelector('#deleteAcctBtn');
    if (delAcct) delAcct.onclick = async () => {
      if (!confirm('Delete your account? Profile, attempts, bests and board entries are removed permanently. This cannot be undone.')) return;
      const sb = auth.client(); if (!sb) return;
      try {
        const { error } = await sb.rpc('rpc_delete_account');
        if (error) { showToast('Could not delete — try again or contact support'); return; }
        await auth.signOut();
        showToast('Account deleted');
      } catch (e) { showToast('Could not delete — try again or contact support'); }
    };
    if (want) { const s = el.querySelector('#sec-' + want); if (s) { s.classList.add('flash'); s.scrollIntoView({ block: 'center' }); const f = s.querySelector('select, input, button'); if (f) f.focus({ preventScroll: true }); } }
  }
  render();
  root.appendChild(el);
  if (want) { const s = el.querySelector('#sec-' + want); if (s) s.scrollIntoView({ block: 'center' }); }
  return { destroy() { destroyed = true; offAuth(); window.removeEventListener('hk:user', onUser); el.remove(); } };
}
