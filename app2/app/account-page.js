// app2/app/account-page.js — Account (SITE_SPEC §8, shape only): the guest state, what will be
// carried over at signup, "Sign-in arrives in the next phase", the Desks / Stats / Profile /
// Settings sections with an honest "coming in a later phase" note, and two things that work now:
// export data (a progress JSON download) and delete local data (with confirm).
import { progress } from './progress.js';
import { prefs, PLATFORMS } from './prefs.js';
import { LESSONS } from '../content/index.js';
import { showToast } from '../ui/toast.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SECTIONS = ['desks', 'stats', 'profile', 'settings', 'data'];

/** Everything this device holds for the learner, as one JSON-able record. */
export function exportRecord() {
  return { site: 'hotkey.gg', version: 1, exportedAt: new Date().toISOString(), progress: progress.all(), prefs: prefs.get() };
}

export function mountAccountPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'page account';
  const want = ctx.query && SECTIONS.includes(ctx.query.section) ? ctx.query.section : null;

  function render() {
    const all = progress.all(); const p = prefs.get();
    const ids = Object.keys(all);
    const done = ids.filter(id => all[id].completed).length;
    const bests = ids.filter(id => all[id].best != null).length;
    const secs = ids.reduce((n, id) => n + (all[id].best || 0), 0);
    el.innerHTML = `<div class="page-head"><h1>Account</h1><p class="page-sub">You are a guest. Everything here is <b>saved on this device</b> only.</p></div>
      <div class="acct-grid">
        <section class="acard acard-signin">
          <div class="acard-cap">sign in</div>
          <div class="acard-body">
            <h2>Sign-in arrives in the next phase.</h2>
            <p>Email and password, a magic link, or Google. No anonymous accounts: until then, your work stays in this browser.</p>
            <h3>What is carried over when you sign up</h3>
            <ul class="plain-list">
              <li>Lesson progress: ${ids.length} lesson${ids.length === 1 ? '' : 's'} started, ${done} completed</li>
              <li>Personal bests: ${bests}</li>
              <li>Platform (${p.platform === 'mac' ? 'Mac' : 'Windows'}) and theme</li>
              <li>Skipped lessons from placement: ${p.skipped.length}</li>
            </ul>
            <p class="page-fine">Carried once, to the account you create, never from another account. You will pick a handle at signup; it appears on public boards only if you allow it.</p>
            <button class="btn btn-primary" type="button" disabled aria-disabled="true" title="Sign-in arrives in the next phase">Sign in</button>
          </div>
        </section>
        <div class="acct-col">
          ${[['desks', 'Desks', 'Create a desk, invite by code or link, a private board and assignments from a captain.', 'Desks arrive after accounts.'],
            ['stats', 'Stats', 'Time, personal bests, improvement history, keystroke counts, shortcuts used, and an estimated time saved.', 'Stats arrive with timed play.'],
            ['profile', 'Profile', 'Handle, level, rank, featured achievements, best times. School and desk by opt-in only.', 'Profiles arrive with accounts.']].map(([id, t, d, note]) =>
            `<section class="acard" id="sec-${id}"><div class="acard-cap">${t.toLowerCase()}</div><div class="acard-body"><h2>${t}</h2><p>${d}</p><p class="coming">${note} Coming in a later phase.</p></div></section>`).join('')}
        </div>
      </div>
      <section class="acard" id="sec-settings">
        <div class="acard-cap">settings</div>
        <div class="acard-body settings-grid">
          <label class="set">Keys follow<select id="setPlatform">${PLATFORMS.map(v => `<option value="${v}"${p.platform === v ? ' selected' : ''}>${v === 'mac' ? 'Mac (⌘, ⌥)' : 'Windows (Ctrl, Alt)'}</option>`).join('')}</select><span class="set-note">Instructions and keycaps follow this.</span></label>
          <label class="set">Ribbon<select id="setRibbon"><option value=""${!p.ribbon ? ' selected' : ''}>Default (full in Chapter 1, slim after)</option><option value="full"${p.ribbon === 'full' ? ' selected' : ''}>Always the full ribbon</option><option value="slim"${p.ribbon === 'slim' ? ' selected' : ''}>Always the slim strip</option></select><span class="set-note">Alt shows KeyTips on either.</span></label>
          <label class="set set-check"><input id="setMute" type="checkbox"${p.mute ? ' checked' : ''}> Mute sounds<span class="set-note">Sounds are soft and off until you start.</span></label>
          <div class="set"><span>Theme</span><button class="btn btn-ghost" id="setTheme" type="button">Open the theme picker</button><span class="set-note">Also top right, on every page.</span></div>
        </div>
      </section>
      <section class="acard" id="sec-data">
        <div class="acard-cap">your data</div>
        <div class="acard-body">
          <p>Progress and settings live in this browser's storage. Export them as a file, or delete them here.</p>
          <div class="data-actions">
            <button class="btn btn-ghost" id="exportBtn" type="button">Export data (JSON)</button>
            <button class="btn btn-danger" id="deleteBtn" type="button">Delete local data</button>
          </div>
          <p class="page-fine">${ids.length ? `${ids.length} of ${LESSONS.length} lessons have progress${secs ? `; best times total ${secs.toFixed(1)} s` : ''}.` : 'Nothing is stored yet.'} Account deletion arrives with accounts.</p>
        </div>
      </section>`;
    wire();
  }

  function wire() {
    el.querySelector('#setPlatform').onchange = e => { prefs.set({ platform: e.target.value }); showToast('Keys follow ' + (e.target.value === 'mac' ? 'Mac' : 'Windows')); };
    // prefs is the one settings store: the ribbon view and the effects module read these same fields.
    el.querySelector('#setRibbon').onchange = e => { const v = e.target.value || null; prefs.set({ ribbon: v }); showToast('Ribbon: ' + (v || 'default')); };
    el.querySelector('#setMute').onchange = e => { prefs.set({ mute: e.target.checked }); showToast(e.target.checked ? 'Sounds muted' : 'Sounds on'); };
    el.querySelector('#setTheme').onclick = () => { if (ctx.nav && ctx.nav.openThemes) ctx.nav.openThemes(); else { const b = document.getElementById('navThemes'); if (b) b.click(); } };
    el.querySelector('#exportBtn').onclick = () => {
      try {
        const blob = new Blob([JSON.stringify(exportRecord(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = 'hotkey-progress-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('Exported');
      } catch (e) { showToast('Export failed'); }
    };
    el.querySelector('#deleteBtn').onclick = () => {
      if (!confirm('Delete all progress and settings saved on this device? This cannot be undone.')) return;
      progress.clear(); prefs.clear();
      showToast('Local data deleted');
      render();
    };
    if (want) { const s = el.querySelector('#sec-' + want); if (s) { s.classList.add('flash'); s.scrollIntoView({ block: 'center' }); const f = s.querySelector('select, input, button'); if (f) f.focus({ preventScroll: true }); } }
  }
  render();
  root.appendChild(el);
  if (want) { const s = el.querySelector('#sec-' + want); if (s) s.scrollIntoView({ block: 'center' }); }
  return { destroy() { el.remove(); } };
}
