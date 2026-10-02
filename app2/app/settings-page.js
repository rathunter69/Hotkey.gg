// app2/app/settings-page.js — Settings as a page (screenplay 3.0 "Account"; 3.12; M101; Wolf,
// 2026-10-02, point 29: the look apart from the game). Two parts, never mixed: the Theme band at the
// top, each theme drawn as a little sheet in its own colours with Density and Sheet zoom beside it,
// and Game options under it, the play settings (Practice, Lessons, Keyboard) in the wide column and
// Sound, Account and Email at the side. Every option shows all its choices as words (On and Off
// included), so nothing hides behind a slider. Rendered from app/settings.js SETTINGS_GROUPS; every
// word is a site.csv row (settings_*, setting_*). Saved as it changes.
import { settings, SETTINGS_GROUPS } from './settings.js';
import { auth } from './auth.js';
import { themeList, tokensFor, applyTheme, saveTheme } from '../ui/themes.js';
import { siteCopy } from '../content/copy/apply.js';
import { buttonHtml } from '../ui/components/table.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (key, fb) => siteCopy(key, fb);
const words = s => String(s).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());

/** The page's parts: the look (Appearance, drawn in the Theme band), the game options in the wide column, the rest at the side. Pure. */
export const GAME_GROUPS = ['practice', 'lessons', 'keyboard'];
export function columnsFor(groups = SETTINGS_GROUPS) {
  const game = GAME_GROUPS.map(id => groups.find(g => g.id === id)).filter(Boolean);
  const side = groups.filter(g => g.id !== 'appearance' && !GAME_GROUPS.includes(g.id));
  return [game, side];
}
/** Which settings a page shows: account-only rows need a signed-in account. Pure. */
export function visibleSettings(group, signedIn) { return group.settings.filter(s => !s.account || signedIn); }

/** The links an account row opens (handle, email and sign-in) and what an action row does. */
const LINKS = { handle: '#/account?section=profile', signIn: '#/account' };
const ACTIONS = { exportData: '#/account', deleteAccount: '#/account' };

export function controlHtml(s, rec, themes) {
  const key = 'setting_' + s.key;
  if (s.type === 'choice') return `<div class="seg" role="radiogroup" aria-label="${esc(t(key, words(s.key)))}">${s.options.map(o => `<button type="button" class="seg-btn${rec[s.key] === o ? ' on' : ''}" role="radio" aria-checked="${rec[s.key] === o}" data-key="${esc(s.key)}" data-v="${esc(o)}">${esc(t(key + '_' + o, words(o)))}</button>`).join('')}</div>`;
  if (s.type === 'switch') return `<div class="seg seg-onoff" role="radiogroup" aria-label="${esc(t(key, words(s.key)))}">${[true, false].map(v => `<button type="button" class="seg-btn${!!rec[s.key] === v ? ' on' : ''}" role="radio" aria-checked="${!!rec[s.key] === v}" data-key="${esc(s.key)}" data-v="${v}" data-bool>${esc(t(v ? 'setting_on' : 'setting_off', v ? 'On' : 'Off'))}</button>`).join('')}</div>`;
  if (s.type === 'theme') return `<div class="tiles" role="radiogroup" aria-label="${esc(t(key, 'Theme'))}">${themes.map(th => `<button type="button" class="tile${rec.theme === th.key ? ' on' : ''}${th.lock ? ' locked' : ''}" role="radio" aria-checked="${rec.theme === th.key}" data-key="theme" data-v="${esc(th.key)}"${th.lock ? ' aria-disabled="true"' : ''} style="${esc(th.style)}">${miniSheet()}<span class="tile-name">${esc(th.label)}</span><span class="tile-lock">${esc(th.lock || t(th.dark ? 'theme_dark' : 'theme_light', th.dark ? 'Dark' : 'Light'))}</span></button>`).join('')}</div>`;
  if (s.type === 'text') return `<input class="input" type="text" value="${esc(rec[s.key] || '')}" maxlength="${s.max || 80}" aria-label="${esc(t(key, words(s.key)))}" data-key="${esc(s.key)}">`;
  if (s.type === 'link') return `<a class="btn btn-small" href="${esc(LINKS[s.key] || '#/account')}">${esc(t(key + '_open', 'Open'))}</a>`;
  if (s.type === 'action') return `<a class="btn btn-small${s.key === 'deleteAccount' ? ' btn-danger' : ''}" href="${esc(ACTIONS[s.key] || '#/account')}">${esc(t(key + '_do', words(s.key)))}</a>`;
  return '';
}

export function groupHtml(g, rec, signedIn, themes) {
  const list = visibleSettings(g, signedIn);
  const body = list.length ? list.map(s => `<div class="setting${s.type === 'theme' ? ' setting-wide' : ''}" data-cursor${s.type === 'theme' ? '' : ' data-cursor-enter="button, input, a"'}>
      <div class="setting-row"><span class="setting-words"><span class="setting-name">${esc(t('setting_' + s.key, words(s.key)))}</span>${s.help ? `<span class="setting-help">${esc(t('setting_' + s.key + '_help', ''))}</span>` : ''}</span><span class="setting-control">${s.type === 'theme' ? '' : controlHtml(s, rec, themes)}</span></div>
      ${s.type === 'theme' ? controlHtml(s, rec, themes) : ''}
    </div>`).join('') : `<p class="body ink-2">${esc(t('account_guest', 'You’re a guest, so everything here is saved on this device only.'))}</p>`;
  return `<section class="panel set-group" data-group="${g.id}"><div class="panel-head"><h2 class="panel-h">${esc(t('settings_group_' + g.id, words(g.id)))}</h2></div>${body}</section>`;
}

/** A theme drawn as a corner of a sheet: its rail, the column letters, three rows of figures, the cell cursor on one, a total in the mode green. */
const MINI = [['', 'A', 'B', 'C'], ['1', '120', '45', '165'], ['2', '210', '80', '290'], ['3', '330', '125', '455']];
function miniSheet() {
  return `<span class="tile-sheet" aria-hidden="true"><span class="ts-rail"></span><span class="ts-grid">${MINI.map((r, i) => r.map((c, j) => `<i class="${i === 0 || j === 0 ? 'ts-hd' : ''}${i === 2 && j === 2 ? ' ts-cur' : ''}${i === 3 && j > 0 ? ' ts-tot' : ''}">${c}</i>`).join('')).join('')}</span></span>`;
}

/** The theme tiles' data: key, label, dark, the palette as custom properties, and the lock line (cosmetics decide the lock; here only the palette). */
export function themeTiles(lockOf = () => null) {
  return themeList().map(([key, th]) => {
    const tk = tokensFor(key);
    const style = `--tile-bg:${tk.paper};--tile-sheet:${tk.sheet};--tile-chrome:${tk.chrome};--tile-grid:${tk.line};--tile-fg:${tk.ink};--tile-fg2:${tk['ink-2']};--tile-rail:${tk.rail};--tile-accent:${tk.learn};--tile-accent-ink:${tk['learn-ink']}`;
    return { key, label: th.name || key, dark: !!th.dark, bg: tk.paper, fg: tk.ink, accent: tk.learn, style, lock: lockOf(key) };
  });
}

/** The Theme band: the cards across the page, Density and Sheet zoom under them. */
export function lookHtml(rec, themes) {
  const ap = SETTINGS_GROUPS.find(g => g.id === 'appearance');
  const theme = ap.settings.find(s => s.type === 'theme');
  const rest = ap.settings.filter(s => s.type !== 'theme');
  return `<section class="panel set-look" data-group="appearance">
    <div class="panel-head"><h2 class="panel-h">${esc(t('setting_theme', 'Theme'))}</h2><span class="panel-facts">${esc(t('settings_look_line', 'How hotkey.gg looks. Nothing here changes how you play.'))}</span></div>
    <div class="setting setting-wide" data-cursor data-cursor-enter=".tile.on">${controlHtml(theme, rec, themes)}</div>
    <div class="set-look-row">${rest.map(s => `<div class="setting setting-inline" data-cursor data-cursor-enter="button"><span class="setting-name">${esc(t('setting_' + s.key, words(s.key)))}</span>${controlHtml(s, rec, themes)}</div>`).join('')}</div>
  </section>`;
}

/** The side column: Sound, then Email and Account signed in; a guest sees one panel in their place, with the way to an account. */
function sideHtml(groups, rec, signedIn, themes) {
  const shown = groups.filter(g => visibleSettings(g, signedIn).length);
  const guest = signedIn ? '' : `<section class="panel set-group set-guest"><div class="panel-head"><h2 class="panel-h">${esc(t('settings_group_account', 'Account and privacy'))}</h2></div><p class="panel-line">${esc(t('account_guest', ''))}</p><div class="btn-row">${buttonHtml({ label: t('save_go', 'Make a free account'), href: '#/account', primary: true })}</div></section>`;
  return shown.map(g => groupHtml(g, rec, signedIn, themes)).join('') + guest;
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
      ${lookHtml(rec, themes)}
      <div class="set-game-head"><h2 class="set-game-h">${esc(t('settings_game_head', 'Game options'))}</h2><span class="panel-facts">${esc(t('settings_game_line', 'How lessons, drills and the keyboard behave.'))}</span></div>
      <div class="cols-2 set-game"><div class="col">${left.map(g => groupHtml(g, rec, signedIn(), themes)).join('')}</div><div class="col">${sideHtml(right, rec, signedIn(), themes)}</div></div>`;
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
    if (seg) { save({ [seg.dataset.key]: seg.hasAttribute('data-bool') ? seg.dataset.v === 'true' : seg.dataset.v }); seg.closest('.seg').querySelectorAll('.seg-btn').forEach(b => { const on = b === seg; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); }); return; }
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
