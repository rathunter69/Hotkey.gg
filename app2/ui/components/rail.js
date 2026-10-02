// app2/ui/components/rail.js — the dark left rail (screenplay 3.0 "The rail"; 3.3; M88). One
// component, rendered from data: the wordmark; Home; Learn; Practice with its four modes always
// listed under it, each with its color mark; Leaderboards; Reference. At the foot: the level with
// its XP bar and "{n} of {next} XP", the streak as "Day {n} of your streak" with the week's seven
// cells, and the account row, which opens Profile, Settings, Plan and billing and Your certificate
// in the rail. A free account sees a quiet Go Pro under the level. Words only, no icons. Every
// word is a site.csv row (rail_*). Each item carries its KeyTips letter (components/keytips.js
// shows them on Alt). Below 900px the rail folds into a top bar with a Menu button (CSS). The
// landing page gets the top bar of 3.0 instead: the wordmark, Pricing, For teams and Sign in.
//
//   const rail = mountRail(el, { active: 'home', onSignOut });
//   rail.setActive('learn'); rail.setUser(user | null); rail.setSaveState(text);
//   rail.setLevel({ lvl, into, need } | number | null); rail.setStreak({ day, week: [bool × 7] }); rail.setPro(bool);
//   rail.setLanding(bool); rail.openAccount(); rail.closeAccount(); rail.destroy();
import { siteCopy } from '../../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));

/**
 * The rail's items, top to bottom (3.0): key is the route's nav key, copy the site.csv row, tip
 * the KeyTips letter, mode the color mark (a mode item sits under Practice).
 */
export const RAIL_ITEMS = [
  { key: 'home', copy: 'rail_home', href: '#/', tip: 'H' },
  { key: 'learn', copy: 'rail_learn', href: '#/learn', tip: 'L' },
  { key: 'practice', copy: 'rail_practice', href: '#/practice', tip: 'P', children: [
    { key: 'daily', copy: 'rail_daily', href: '#/practice/daily', tip: 'D', mode: 'daily' },
    { key: 'drills', copy: 'rail_drills', href: '#/practice/drills', tip: 'R', mode: 'drills' },
    { key: 'rapid', copy: 'rail_rapid', href: '#/practice/rapid', tip: 'F', mode: 'rapid' },
    { key: 'challenges', copy: 'rail_challenges', href: '#/practice/challenges', tip: 'C', mode: 'challenges' },
  ] },
  { key: 'leaderboard', copy: 'rail_boards', href: '#/leaderboard', tip: 'B' },
  { key: 'reference', copy: 'rail_reference', href: '#/reference', tip: 'E' },
];
/** The account row's items (3.0, The rail): each opens its own page from the account row. */
export const ACCOUNT_ITEMS = [
  { key: 'profile', copy: 'rail_profile', href: '#/account?section=profile' },
  { key: 'settings', copy: 'rail_settings', href: '#/account?section=settings' },
  { key: 'billing', copy: 'rail_billing', href: '#/account?section=billing' },
  { key: 'certificate', copy: 'rail_certificate', href: '#/account?section=certificate' },
];
/** The landing page's top bar, in place of the rail. */
export const LANDING_ITEMS = [
  { key: 'pricing', copy: 'landing_nav_pricing', fallback: 'Pricing', href: '#/pricing' },
  { key: 'teams', copy: 'landing_nav_teams', fallback: 'For teams', href: '#/teams' },
  { key: 'signin', copy: 'rail_sign_in', href: '#/account' },
];
export const ACCOUNT_TIP = 'A';
const FALLBACK = { rail_home: 'Home', rail_learn: 'Learn', rail_practice: 'Practice', rail_daily: 'The Daily', rail_drills: 'Drills', rail_rapid: 'Rapid-fire', rail_challenges: 'Challenges',
  rail_boards: 'Leaderboards', rail_reference: 'Reference', rail_profile: 'Profile', rail_settings: 'Settings', rail_billing: 'Plan and billing', rail_certificate: 'Your certificate',
  rail_sign_in: 'Sign in', rail_sign_out: 'Sign out', rail_guest: 'Guest', rail_account: 'Account', rail_go_pro: 'Get full access', rail_menu: 'Menu', rail_level: 'Level {n}', rail_xp: '{n} of {next} XP',
  rail_streak: 'Day {n} of your streak', rail_streak_none: 'Your streak starts with today’s practice.', rail_week_days: 'M,T,W,T,F,S,S' };
const t = (key, fb) => siteCopy(key, fb != null ? fb : FALLBACK[key] || key);

/** The letters of the week's seven cells, Monday first. */
export const weekLetters = () => t('rail_week_days').split(',').map(s => s.trim()).slice(0, 7);

/**
 * The week's seven cells (Monday to Sunday of the week holding `today`), each true when `days`
 * (YYYY-MM-DD strings) holds that day, plus which cell is today. Pure.
 */
export function weekCells(days, today) {
  const set = new Set(days || []);
  const d = new Date(String(today) + 'T00:00:00Z');
  if (!Number.isFinite(d.getTime())) return { cells: Array(7).fill(false), today: -1 };
  const dow = (d.getUTCDay() + 6) % 7;   // Monday 0
  const monday = d.getTime() - dow * 86400000;
  const cells = [];
  for (let i = 0; i < 7; i++) cells.push(set.has(new Date(monday + i * 86400000).toISOString().slice(0, 10)));
  return { cells, today: dow };
}

/** The two-letter avatar from a handle. */
export const initials = handle => String(handle || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '';

const keyHtml = tip => (tip ? `<kbd class="kt" data-kt="${esc(tip)}" aria-hidden="true">${esc(tip)}</kbd>` : '');
function itemHtml(it, active) {
  const on = it.key === active;
  const mark = it.mode ? `<i class="rail-dot" style="--mark:var(--${esc(it.mode)})"></i>` : '';
  return `<a class="rail-item${it.mode ? ' rail-mode' : ''}${on ? ' on' : ''}" data-page="${esc(it.key)}" data-keytip="${esc(it.tip)}" href="${esc(it.href)}"${on ? ' aria-current="page"' : ''}>${mark}<span class="rail-word">${esc(t(it.copy))}</span>${keyHtml(it.tip)}</a>`;
}

function railHtml(active) {
  const items = RAIL_ITEMS.map(it => itemHtml(it, active) + (it.children ? `<div class="rail-children">${it.children.map(c => itemHtml(c, active)).join('')}</div>` : '')).join('');
  const account = ACCOUNT_ITEMS.map(a => `<a class="rail-acct-item" role="menuitem" tabindex="-1" data-page="${esc(a.key)}" href="${esc(a.href)}">${esc(t(a.copy))}</a>`).join('');
  return `<nav class="rail" aria-label="site">
    <div class="rail-top">
      <a class="rail-mark" href="#/">hotkey<b>.gg</b></a>
      <button class="rail-menu" type="button" aria-expanded="false" aria-controls="railNav">${esc(t('rail_menu'))}</button>
    </div>
    <div class="rail-nav" id="railNav">${items}</div>
    <div class="rail-foot">
      <div class="rail-level" id="railLevel" hidden>
        <div class="rail-row"><span class="rail-level-word" id="railLevelWord"></span><span class="rail-sub-word" id="railXp"></span></div>
        <div class="rail-bar"><i id="railBar"></i></div>
        <a class="rail-pro" id="railPro" href="#/pricing" hidden>${esc(t('rail_go_pro'))}</a>
      </div>
      <div class="rail-streak" id="railStreak" hidden>
        <div class="rail-row"><span class="rail-sub-word" id="railStreakWord"></span><span class="rail-week" id="railWeek" aria-hidden="true"></span></div>
      </div>
      <div class="rail-account" id="railAccount">
        <button class="rail-acct" id="railAcctBtn" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="railAcctItems" data-keytip="${ACCOUNT_TIP}">
          <span class="rail-avatar" id="railAvatar" aria-hidden="true"></span>
          <span class="rail-handle" id="railHandle">${esc(t('rail_sign_in'))}</span>
          <span class="rail-acct-word"><span class="rail-acct-label">${esc(t('rail_account'))}</span>${keyHtml(ACCOUNT_TIP)}</span>
        </button>
        <div class="rail-acct-items" id="railAcctItems" role="menu" aria-labelledby="railAcctBtn" hidden>
          ${account}
          <div class="rail-save" id="railSave" role="presentation"></div>
          <a class="rail-acct-item rail-acct-auth" role="menuitem" tabindex="-1" id="railAuth" href="#/account">${esc(t('rail_sign_in'))}</a>
        </div>
      </div>
    </div>
  </nav>`;
}

function landingHtml() {
  return `<nav class="rail rail-landing" aria-label="site">
    <div class="rail-top"><a class="rail-mark" href="#/landing">hotkey<b>.gg</b></a></div>
    <div class="rail-landing-items">${LANDING_ITEMS.map(it => `<a class="rail-landing-item" data-page="${esc(it.key)}" href="${esc(it.href)}">${esc(t(it.copy, it.fallback))}</a>`).join('')}</div>
  </nav>`;
}

/**
 * Mount the rail into `el`. Returns the API above (the names mountNav had, so the shell keeps one
 * handle): setActive, setUser, setSaveState, setLevel, setStreak, setPro, setLanding, openAccount,
 * closeAccount, destroy.
 */
export function mountRail(el, opts = {}) {
  let active = String(opts.active || '').toLowerCase();
  let landing = false, user = null, pro = false, level = null, streak = null, saveText = '';
  let menuOpen = false;

  function render() {
    el.innerHTML = landing ? landingHtml() : railHtml(active);
    if (!landing) { paintUser(); paintLevel(); paintStreak(); paintSave(); wire(); }
  }
  const q = sel => el.querySelector(sel);

  function paintUser() {
    const handle = q('#railHandle'), avatar = q('#railAvatar'), auth = q('#railAuth');
    if (!handle) return;
    handle.textContent = user ? (user.handle || '') : t('rail_sign_in');
    avatar.textContent = user ? initials(user.handle) : '';
    avatar.classList.toggle('guest', !user);
    if (auth) {
      if (user) { auth.textContent = t('rail_sign_out'); auth.removeAttribute('href'); auth.setAttribute('role', 'menuitem'); auth.onclick = e => { e.preventDefault(); closeAccount(false); if (opts.onSignOut) { try { opts.onSignOut(); } catch (err) { /* app hook */ } } }; }
      else { auth.textContent = t('rail_sign_in'); auth.setAttribute('href', '#/account'); auth.onclick = null; }
    }
  }
  function paintLevel() {
    const box = q('#railLevel'); if (!box) return;
    if (!level) { box.hidden = true; return; }
    box.hidden = false;
    q('#railLevelWord').textContent = fill(t('rail_level'), { n: level.lvl });
    q('#railXp').textContent = fill(t('rail_xp'), { n: level.into, next: level.need });
    q('#railBar').style.width = Math.max(0, Math.min(100, level.need ? Math.round(100 * level.into / level.need) : 0)) + '%';
    const p = q('#railPro'); if (p) p.hidden = !!pro;
  }
  function paintStreak() {
    const box = q('#railStreak'); if (!box) return;
    if (!streak) { box.hidden = true; return; }
    box.hidden = false;
    q('#railStreakWord').textContent = streak.day > 0 ? fill(t('rail_streak'), { n: streak.day }) : t('rail_streak_none');
    const letters = weekLetters();
    q('#railWeek').innerHTML = (streak.week || []).slice(0, 7).map((on, i) => `<i class="${on ? 'on' : ''}${i === streak.today ? ' today' : ''}">${esc(letters[i] || '')}</i>`).join('');
  }
  function paintSave() { const s = q('#railSave'); if (s) s.textContent = saveText; }

  /* ---------------- the account row opens its items in the rail ---------------- */
  const items = () => [...el.querySelectorAll('#railAcctItems [role="menuitem"]')];
  function openAccount(focusIndex) {
    const box = q('#railAcctItems'), btn = q('#railAcctBtn'); if (!box) return;
    menuOpen = true; box.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.classList.add('open');
    const list = items(); if (focusIndex != null && list.length) list[(focusIndex + list.length) % list.length].focus();
  }
  function closeAccount(refocus) {
    const box = q('#railAcctItems'), btn = q('#railAcctBtn'); if (!box) return;
    menuOpen = false; box.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.classList.remove('open');
    if (refocus) btn.focus();
  }
  function wire() {
    const btn = q('#railAcctBtn'), box = q('#railAcctItems');
    if (btn) {
      btn.addEventListener('click', () => (menuOpen ? closeAccount(false) : openAccount(null)));
      btn.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); openAccount(e.key === 'ArrowUp' ? -1 : 0); }
        else if (e.key === 'Escape' && menuOpen) { e.preventDefault(); e.stopPropagation(); closeAccount(true); }
      });
    }
    if (box) {
      box.addEventListener('keydown', e => {
        const list = items(); const i = list.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); list[(i + 1) % list.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); list[(i - 1 + list.length) % list.length].focus(); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeAccount(true); }
        else if (e.key === 'Tab') closeAccount(false);
      });
      box.addEventListener('click', e => { if (e.target.closest('[role="menuitem"]')) closeAccount(false); });
    }
    const menu = q('.rail-menu');
    if (menu) menu.addEventListener('click', () => { const open = el.querySelector('.rail').classList.toggle('open'); menu.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    el.querySelectorAll('.rail-item').forEach(a => a.addEventListener('click', () => { const r = el.querySelector('.rail'); if (r) r.classList.remove('open'); }));
  }
  const onDocClick = e => { if (menuOpen && !el.contains(e.target)) closeAccount(false); };
  document.addEventListener('mousedown', onDocClick);

  function setActive(key) {
    active = String(key == null ? '' : key).toLowerCase();
    el.querySelectorAll('.rail-item').forEach(a => { const on = a.dataset.page === active; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const r = el.querySelector('.rail'); if (r) r.classList.remove('open');
  }
  function setUser(u) { user = u || null; paintUser(); }
  function setSaveState(text) { saveText = String(text || ''); paintSave(); }
  /** The level: { lvl, into, need } (content/levels.js levelOf), a bare level number, or null to hide. */
  function setLevel(info) {
    if (info == null) level = null;
    else if (typeof info === 'number') level = Number.isFinite(info) && info >= 1 ? { lvl: info, into: 0, need: 0 } : null;
    else level = { lvl: info.lvl, into: info.into || 0, need: info.need || 0 };
    paintLevel();
  }
  function setStreak(s) { streak = s && typeof s === 'object' ? { day: s.day | 0, week: Array.isArray(s.week) ? s.week : [], today: Number.isInteger(s.today) ? s.today : -1 } : null; paintStreak(); }
  function setPro(on) { pro = !!on; paintLevel(); }
  function setLanding(on) { on = !!on; if (on === landing) return; landing = on; render(); }
  function destroy() { document.removeEventListener('mousedown', onDocClick); el.innerHTML = ''; }

  render();
  return { setActive, setUser, setSaveState, setLevel, setStreak, setPro, setLanding, openAccount, closeAccount, destroy,
    get menuOpen() { return menuOpen; }, get landing() { return landing; } };
}
