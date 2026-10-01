// app2/app/settings-page.js — Settings as a page (screenplay 3.0 "Account"; 3.12; M101), rendered
// from app/settings.js SETTINGS_GROUPS: two columns of grouped panels, each setting a row with
// its control at the right and any help under it, saved as it changes (the save line at the top
// right says so). The controls are one component each: a segmented choice, a switch, the theme
// tiles (all one size, a locked one dimmed with its unlock under its name), a short text field,
// a link row and an action row. Every word is a site.csv row (settings_group_*, setting_*).
// Account-only settings show signed in; a guest sees the guest line in their place.
import { settings, SETTINGS_GROUPS } from './settings.js';
import { auth } from './auth.js';
import { themeList, tokensFor, applyTheme, saveTheme } from '../ui/themes.js';
import { siteCopy } from '../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (key, fb) => siteCopy(key, fb);
const words = s => String(s).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());

/** The two columns of 3.0's settings screen: the first three groups left, the rest right. Pure. */
export function columnsFor(groups = SETTINGS_GROUPS) {
  const left = groups.filter(g => ['keyboard', 'lessons', 'practice'].includes(g.id));
  const right = groups.filter(g => !left.includes(g));
  return [left, right];
}
/** Which settings a page shows: account-only rows need a signed-in account. Pure. */
export function visibleSettings(group, signedIn) { return group.settings.filter(s => !s.account || signedIn); }

/** The links an account row opens (handle, email and sign-in) and what an action row does. */
const LINKS = { handle: '#/account?section=profile', signIn: '#/account' };
const ACTIONS = { exportData: '#/account', deleteAccount: '#/account' };

export function controlHtml(s, rec, themes) {
  const key = 'setting_' + s.key;
  if (s.type === 'choice') return `<div class="seg" role="radiogroup" aria-label="${esc(t(key, words(s.key)))}">${s.options.map(o => `<button type="button" class="seg-btn${rec[s.key] === o ? ' on' : ''}" role="radio" aria-checked="${rec[s.key] === o}" data-key="${esc(s.key)}" data-v="${esc(o)}">${esc(t(key + '_' + o, words(o)))}</button>`).join('')}</div>`;
  if (s.type === 'switch') return `<button type="button" class="switch${rec[s.key] ? ' on' : ''}" role="switch" aria-checked="${!!rec[s.key]}" aria-label="${esc(t(key, words(s.key)))}" data-key="${esc(s.key)}"><i></i></button>`;
  if (s.type === 'theme') return `<div class="tiles" role="radiogroup" aria-label="${esc(t(key, 'Theme'))}" data-cursor-cols="4">${themes.map(th => `<button type="button" class="tile${rec.theme === th.key ? ' on' : ''}${th.lock ? ' locked' : ''}" role="radio" aria-checked="${rec.theme === th.key}" data-key="theme" data-v="${esc(th.key)}"${th.lock ? ' aria-disabled="true"' : ''} style="--tile-bg:${esc(th.bg)};--tile-fg:${esc(th.fg)};--tile-accent:${esc(th.accent)}"><span class="tile-swatch" aria-hidden="true"><i></i></span><span class="tile-name">${esc(th.label)}</span>${th.lock ? `<span class="tile-lock label">${esc(th.lock)}</span>` : ''}</button>`).join('')}</div>`;
  if (s.type === 'text') return `<input class="input" type="text" value="${esc(rec[s.key] || '')}" maxlength="${s.max || 80}" aria-label="${esc(t(key, words(s.key)))}" data-key="${esc(s.key)}">`;
  if (s.type === 'link') return `<a class="btn btn-small" href="${esc(LINKS[s.key] || '#/account')}">${esc(t(key + '_open', 'Open'))}</a>`;
  if (s.type === 'action') return `<a class="btn btn-small${s.key === 'deleteAccount' ? ' btn-danger' : ''}" href="${esc(ACTIONS[s.key] || '#/account')}">${esc(t(key + '_do', words(s.key)))}</a>`;
  return '';
}

export function groupHtml(g, rec, signedIn, themes) {
  const list = visibleSettings(g, signedIn);
  const body = list.length ? list.map(s => `<div class="setting${s.type === 'theme' ? ' setting-wide' : ''}" data-cursor${s.type === 'theme' ? '' : ' data-cursor-enter="button, input, a"'}>
      <div class="setting-row"><span class="setting-name">${esc(t('setting_' + s.key, words(s.key)))}</span><span class="setting-control">${s.type === 'theme' ? '' : controlHtml(s, rec, themes)}</span></div>
      ${s.help ? `<p class="setting-help ink-2">${esc(t('setting_' + s.key + '_help', ''))}</p>` : ''}
      ${s.type === 'theme' ? controlHtml(s, rec, themes) : ''}
    </div>`).join('') : `<p class="body ink-2">${esc(t('account_guest', 'You’re a guest, so everything here is saved on this device only.'))}</p>`;
  return `<section class="panel" data-group="${g.id}"><div class="h-row"><h2 class="h-panel">${esc(t('settings_group_' + g.id, words(g.id)))}</h2></div>${body}</section>`;
}

/** The theme tiles' data: key, label, the swatch colors and the lock line (cosmetics decide the lock; here only the palette). */
export function themeTiles(lockOf = () => null) {
  return themeList().map(([key, th]) => { const tk = tokensFor(key); return { key, label: th.name || key, bg: tk.paper, fg: tk.ink, accent: tk.learn, lock: lockOf(key) }; });
}

export function mountSettingsPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'page settings';
  root.appendChild(el);
  let lockOf = () => null;
  let rec = settings.get();
  const signedIn = () => auth.state() === 'in';
  function render() {
    rec = settings.get();
    const themes = themeTiles(lockOf);
    const [left, right] = columnsFor();
    el.innerHTML = `<div class="h-row h-row-title"><h1 class="h-title">${esc(t('settings_title', 'Settings'))}</h1><span class="label" id="settingsSave">${esc(t('settings_saved_line', 'Saved as you change them'))}</span></div>
      <div class="cols-2 cols-equal"><div class="col">${left.map(g => groupHtml(g, rec, signedIn(), themes)).join('')}</div><div class="col">${right.map(g => groupHtml(g, rec, signedIn(), themes)).join('')}</div></div>`;
    if (ctx.cursor && ctx.cursor.refresh) ctx.cursor.refresh();
  }
  function save(patch) {
    rec = settings.set(patch);
    const line = el.querySelector('#settingsSave');
    if (line) line.textContent = rec.ok === false ? t('settings_not_saved', 'Couldn’t save on this device') : t('settings_saved_line', 'Saved as you change them');
    if (patch.theme) { try { applyTheme(patch.theme); saveTheme(patch.theme); } catch (e) { /* the theme module is decoration */ } }
  }
  const onClick = e => {
    const seg = e.target.closest('.seg-btn[data-key]');
    if (seg) { save({ [seg.dataset.key]: seg.dataset.v }); seg.closest('.seg').querySelectorAll('.seg-btn').forEach(b => { const on = b === seg; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); }); return; }
    const sw = e.target.closest('.switch[data-key]');
    if (sw) { const on = !sw.classList.contains('on'); save({ [sw.dataset.key]: on }); sw.classList.toggle('on', on); sw.setAttribute('aria-checked', String(on)); return; }
    const tile = e.target.closest('.tile[data-key="theme"]');
    if (tile && !tile.classList.contains('locked')) { save({ theme: tile.dataset.v }); tile.closest('.tiles').querySelectorAll('.tile').forEach(b => { const on = b === tile; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); }); }
  };
  const onChange = e => { const inp = e.target.closest('input[data-key]'); if (inp) save({ [inp.dataset.key]: inp.value }); };
  el.addEventListener('click', onClick);
  el.addEventListener('change', onChange);
  render();
  // the theme locks come from the lazy stats stack; the tiles redraw once they arrive
  Promise.all([import('./stats.js'), import('./cosmetics.js'), import('../ui/badges.js')]).then(([st, c, b]) => {
    try { const g = st.gameCtx(); const earned = b.earnedSet ? b.earnedSet(g) : new Set(); lockOf = key => c.themeLock(key, { level: g.level, earned, rankIndex: g.rankIndex || 0 }); render(); } catch (e) { /* locks stay open */ }
  }).catch(() => { /* locks stay open */ });
  return { destroy() { el.removeEventListener('click', onClick); el.removeEventListener('change', onChange); el.remove(); } };
}
