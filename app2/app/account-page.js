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
import { track } from './telemetry.js';
import { LESSONS } from '../content/index.js';
import { showToast } from '../ui/toast.js';
import { statsFor } from './stats.js';
import { records } from './records.js';
import { badgesHtml } from '../ui/badges.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SECTIONS = ['desks', 'stats', 'profile', 'settings', 'data'];

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
  el.className = 'page account';
  const want = ctx.query && SECTIONS.includes(ctx.query.section) ? ctx.query.section : null;
  let tab = 'signin';          // signin | signup | magic
  let busy = false;
  let notice = null;
  let lastEmail = '';           // { kind: 'error'|'check', text }
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
          <label>Email<input id="authEmail" type="email" value="${esc(lastEmail)}" autocomplete="email" required${unavailable ? ' disabled' : ''}></label>
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
          <form id="redeemForm" class="acct-form">
            <label>Have a code?<input id="redeemInput" type="text" placeholder="XXXX-XXXX-XXXX" maxlength="32" autocomplete="off" spellcheck="false" style="text-transform:uppercase"></label>
            <p class="form-msg" id="redeemMsg" role="status" aria-live="polite"></p>
            <div class="data-actions"><button class="btn btn-ghost" type="submit">Redeem</button></div>
          </form>
          <div class="data-actions"><button class="btn btn-ghost" id="signOutBtn" type="button">Sign out</button></div>
        </div>
      </section>`;
  }

  /** The Stats section (SITE_SPEC §8): real numbers from progress + records, one source. */
  function statsCard() {
    const s = statsFor();
    const fmtDur = secs => { const m = Math.floor(secs / 60); return m >= 60 ? Math.floor(m / 60) + 'h ' + (m % 60) + 'm' : m >= 1 ? m + 'm ' + Math.round(secs % 60) + 's' : Math.round(secs) + 's'; };
    if (!s.attempts && !Object.keys(s.ctx.progress).length) {
      return `<section class="acard" id="sec-stats"><div class="acard-cap">stats</div><div class="acard-body"><h2>Stats</h2><p>Nothing yet: stats build from your lessons, drills and Dailies as you play.</p></div></section>`;
    }
    const improving = s.improvement.filter(r => r.first > r.best);
    return `<section class="acard" id="sec-stats"><div class="acard-cap">stats</div><div class="acard-body">
      <h2>Stats</h2>
      <div class="stats-grid">
        <div class="stat-cell"><b>${s.ctx.level}</b><span>level · ${s.ctx.xp} XP</span></div>
        <div class="stat-cell"><b>${fmtDur(s.timePractised)}</b><span>timed practice</span></div>
        <div class="stat-cell"><b>${s.attempts}</b><span>recorded runs</span></div>
        <div class="stat-cell"><b>${s.keystrokes}</b><span>keystrokes in runs</span></div>
        <div class="stat-cell"><b>${Object.keys(s.ctx.pbs).length}</b><span>personal bests</span></div>
        <div class="stat-cell"><b>${s.streak}</b><span>day streak</span></div>
      </div>
      ${improving.length ? `<p class="stats-improve">Improvement: ${improving.slice(0, 4).map(r => `${esc(r.title)} <b>${r.first.toFixed(1)}s → ${r.best.toFixed(1)}s</b>`).join(' · ')}</p>` : ''}
      ${s.shortcuts.length ? `<p class="stats-keys">Most-used shortcuts (from your best runs): ${s.shortcuts.sort((a, b) => b.count - a.count).slice(0, 6).map(u => `<kbd>${esc(u.keys)}</kbd>${u.count > 1 ? '×' + u.count : ''}`).join(' ')}</p>` : ''}
      ${s.timeSaved > 5 ? `<p class="page-fine">Estimated time saved vs a mouse-and-menus route: ~${fmtDur(s.timeSaved)}. An estimate: keystroke counts against a slow route at half a second an action.</p>` : ''}
      <div class="stats-badges">${badgesHtml(s.ctx)}</div>
    </div></section>`;
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
          ${statsCard()}
          ${[['desks', 'Desks', 'Create a desk, invite by code or link, a private board and assignments from a captain.', 'Desks arrive after accounts.'],
            ['profile', 'Profile', 'Handle, level, rank, featured achievements, best times. School and desk by opt-in only.', 'The public profile page arrives with accounts.']].map(([id, t, d, note]) =>
            `<section class="acard" id="sec-${id}"><div class="acard-cap">${t.toLowerCase()}</div><div class="acard-body"><h2>${t}</h2><p>${d}</p><p class="coming">${note} Coming in a later phase.</p></div></section>`).join('')}
        </div>
      </div>
      <section class="acard" id="sec-settings">
        <div class="acard-cap">settings</div>
        <div class="acard-body settings-grid">
          <label class="set">Keys follow<select id="setPlatform">${PLATFORMS.map(v => `<option value="${v}"${p.platform === v ? ' selected' : ''}>${v === 'mac' ? 'Mac (⌘, ⌥)' : 'Windows (Ctrl, Alt)'}</option>`).join('')}</select><span class="set-note">Instructions and keycaps follow this. Stays with this device.</span></label>
          <label class="set">Ribbon<select id="setRibbon"><option value=""${!p.ribbon ? ' selected' : ''}>Default (full in Chapter 1, slim after)</option><option value="full"${p.ribbon === 'full' ? ' selected' : ''}>Always the full ribbon</option><option value="slim"${p.ribbon === 'slim' ? ' selected' : ''}>Always the slim strip</option></select><span class="set-note">Alt shows KeyTips on either.</span></label>
          <label class="set set-check"><input id="setMute" type="checkbox"${p.mute ? ' checked' : ''}> Mute sounds<span class="set-note">Sounds are soft and off until you start.</span></label>
          <label class="set">Celebrations<select id="setEffects">${[['full', 'Full (ticks, chimes, banners)'], ['subtle', 'Subtle (small and quiet)'], ['off', 'Off (results only)']].map(([v, t]) => `<option value="${v}"${p.effects === v ? ' selected' : ''}>${t}</option>`).join('')}</select><span class="set-note">Also follows your system's reduced-motion setting.</span></label>
          <label class="set set-check"><input id="setGhost" type="checkbox"${p.ghost !== false ? ' checked' : ''}> PB ghost in drills<span class="set-note">A faint cursor races your best run once you have one.</span></label>
          <label class="set">Density<select id="setDensity">${[['comfortable', 'Comfortable (a step up, breathing room)'], ['compact', 'Compact (tighter, more on screen)']].map(([v, t]) => `<option value="${v}"${p.density === v ? ' selected' : ''}>${t}</option>`).join('')}</select><span class="set-note">Type, keycaps and the Ribbon; the sheet stays at Excel’s 100%.</span></label>
          <label class="set">Lesson panel<select id="setPanelSide">${[['overlay', 'Floating card over the sheet (moves out of the way)'], ['right', 'Docked right of the sheet'], ['left', 'Docked left of the sheet']].map(([v, t]) => `<option value="${v}"${p.panelSide === v ? ' selected' : ''}>${t}</option>`).join('')}</select><span class="set-note">Also on the workspace strip. Ctrl+Shift+K hides or shows the card; Ctrl+Shift+J moves it.</span></label>
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
      lastEmail = email;
      busy = true; notice = null; render();
      let res;
      if (tab === 'signin') res = await auth.signInPassword(email, pw);
      else if (tab === 'signup') res = await auth.signUpPassword(email, pw);
      else res = await auth.magicLink(email);
      busy = false;
      if (res && res.error) notice = { kind: 'error', text: /Failed to fetch|NetworkError|fetch failed/i.test(res.error) ? 'Network error — check your connection and try again.' : res.error };
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
          msg.textContent = m.includes('bad code') ? 'That code is not right — check it and try again.'
            : m.includes('already used') ? 'That code has already been used.'
            : m.includes('expired') ? 'That code has expired.'
            : m.includes('too many tries') ? 'Too many tries — wait an hour.'
            : 'Could not redeem — try again.';
          return;
        }
        const until = data && data.ends_at ? new Date(data.ends_at).toLocaleDateString() : null;
        msg.textContent = until ? `Paid access is on until ${until}.` : 'Paid access is on.';
        showToast('Code redeemed');
        el.querySelector('#redeemInput').value = '';
      } catch (err) { if (auth.current(t)) msg.textContent = 'Network error — try again.'; }
    };

    // settings (device prefs, unchanged)
    el.querySelector('#setPlatform').onchange = e => { prefs.set({ platform: e.target.value }); showToast('Keys follow ' + (e.target.value === 'mac' ? 'Mac' : 'Windows')); };
    el.querySelector('#setRibbon').onchange = e => { const v = e.target.value || null; prefs.set({ ribbon: v }); showToast('Ribbon: ' + (v || 'default')); };
    el.querySelector('#setMute').onchange = e => { prefs.set({ mute: e.target.checked }); showToast(e.target.checked ? 'Sounds muted' : 'Sounds on'); };
    el.querySelector('#setEffects').onchange = e => { prefs.set({ effects: e.target.value }); showToast('Celebrations: ' + e.target.value); };
    el.querySelector('#setGhost').onchange = e => { prefs.set({ ghost: e.target.checked }); showToast(e.target.checked ? 'Ghost on' : 'Ghost off'); };
    el.querySelector('#setDensity').onchange = e => { prefs.set({ density: e.target.value }); showToast('Density: ' + e.target.value); };
    el.querySelector('#setPanelSide').onchange = e => { prefs.set({ panelSide: e.target.value }); showToast('Panel: ' + e.target.value); };
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
      progress.clear(); prefs.clear(); records.clear();
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
