// app2/ui/nav.js — the site's top nav (brand · pages · tools · burger), the theme picker modal and
// the account menu. Markup and behaviour lifted from the old nav.js (NAV_HTML 67–99,
// openThemes/closeThemes 177–204, init wiring 1207–1266, Esc 1181–1194) with the old auth slot's
// user-menu dropdown rebuilt as a keyboard-reachable menu (guest state for now: "Saved on this
// device", Sign in, Desks, Stats, Profile, Settings — all routing to #/account).
//
//   mountNav(el, { active:'learn', links:[{key, label, href, icon?}], account:true })

import { themeList, applyTheme, saveTheme, currentTheme, syncThemeLabels } from './themes.js';

const escHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
/** Line icons in the old nav's language (the trainer keyboard, the reference book, the trophy). */
export const NAV_ICONS = {
  learn: `<svg ${SVG}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M9 7h7M9 11h5"/></svg>`,
  lessons: `<svg ${SVG}><path d="M12 6c-1.6-1-4-1.5-6-1.5S2 5 2 5v13s2-.5 4-.5 4.4.5 6 1.5c1.6-1 4-1.5 6-1.5s4 .5 4 .5V5s-2-.5-4-.5-4.4.5-6 1.5Z"/><path d="M12 6v13"/></svg>`,
  practice: `<svg ${SVG}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>`,
  sandbox: `<svg ${SVG}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>`,
  trainer: `<svg ${SVG}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>`,
  stats: `<svg ${SVG}><path d="M3 3v18h18"/><path d="M7 15l4-6 3 4 5-8"/></svg>`,
  leaderboard: `<svg ${SVG}><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H5a2 2 0 0 0 0 4h2"/><path d="M17 6h2a2 2 0 0 1 0 4h-2"/><path d="M12 14v3"/><path d="M8 21h8"/><path d="M10 21a2 2 0 0 1 4 0"/></svg>`,
  reference: `<svg ${SVG}><path d="M12 6c-1.6-1-4-1.5-6-1.5S2 5 2 5v13s2-.5 4-.5 4.4.5 6 1.5c1.6-1 4-1.5 6-1.5s4 .5 4 .5V5s-2-.5-4-.5-4.4.5-6 1.5Z"/><path d="M12 6v13"/></svg>`,
  user: `<svg width="16" height="16" ${SVG}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
};

export const DEFAULT_LINKS = [
  { key: 'learn', label: 'Learn', href: '#/learn' },
  { key: 'practice', label: 'Practice', href: '#/practice' },
  { key: 'leaderboard', label: 'Leaderboard', href: '#/leaderboard' },
  { key: 'reference', label: 'Reference', href: '#/reference' },
];

const THEME_DOTS = '<svg width="16" height="16" viewBox="0 0 18 18"><circle cx="5" cy="5" r="3.4" fill="#e74c3c"/><circle cx="13" cy="5" r="3.4" fill="#f39c12"/><circle cx="5" cy="13" r="3.4" fill="#27ae60"/><circle cx="13" cy="13" r="3.4" fill="#3498db"/></svg>';

/** The guest account menu: a state line, Sign in, then the account sections (all on #/account for now). */
export const ACCOUNT_ITEMS = [
  { label: 'Sign in', href: '#/account', accent: true },
  { divider: true },
  { label: 'Desks', href: '#/account?section=desks' },
  { label: 'Stats', href: '#/account?section=stats' },
  { label: 'Profile', href: '#/account?section=profile' },
  { label: 'Settings', href: '#/account?section=settings' },
];

/** A link's page key: its `key`, else its label, lowercased — so 'Learn' and 'learn' both address it. */
const keyOf = l => String(l.key || l.label || '').toLowerCase();
const norm = k => String(k == null ? '' : k).toLowerCase();

function navHtml(links, active, account) {
  const pages = links.map(l => {
    const key = keyOf(l);
    const icon = l.icon || NAV_ICONS[key] || NAV_ICONS.sandbox;
    return `<a class="topnav-link${key === norm(active) ? ' active' : ''}" data-page="${escHtml(key)}" href="${escHtml(l.href)}" title="${escHtml(l.label)}" aria-label="${escHtml(l.label)}">${icon}<span class="tl-label">${escHtml(l.label)}</span></a>`;
  }).join('\n          ');
  const acct = account ? `
          <div class="auth-slot" id="authSlot">
            <div class="user-menu" id="userMenu">
              <button class="user-btn" id="userBtn" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="userDropdown" title="account">${NAV_ICONS.user}<span class="user-guest" id="userState">guest</span><span class="um-caret">▾</span></button>
              <div class="user-dropdown" id="userDropdown" role="menu" aria-labelledby="userBtn">
                <div class="um-state" id="umState" role="presentation">Saved on this device</div>
                ${ACCOUNT_ITEMS.map(it => it.divider ? '<div class="um-divider" role="separator"></div>' : `<a role="menuitem" tabindex="-1" class="${it.accent ? 'um-accent' : ''}" href="${escHtml(it.href)}">${escHtml(it.label)}</a>`).join('\n                ')}
              </div>
            </div>
          </div>` : '';
  return `
    <nav class="topnav" aria-label="site">
      <div class="topnav-in">
        <a class="topnav-brand" href="#/" title="hotkey.gg — learn Excel by doing">hotkey<b>.gg</b></a>
        <div class="topnav-pages" id="navPages">
          ${pages}
        </div>
        <div class="topnav-tools">
          <button class="topnav-icon" id="navThemes" type="button" title="themes" aria-label="themes" aria-haspopup="dialog">${THEME_DOTS}</button>
          <button class="topnav-theme-name" id="navThemeName" type="button" data-theme-label title="theme"></button>${acct}
        </div>
        <button class="topnav-burger" id="navBurger" type="button" aria-label="menu" aria-expanded="false" aria-controls="navPages">&#8801;</button>
      </div>
    </nav>
    <div class="profile-modal" id="themesModal" role="dialog" aria-label="themes"></div>`;
}

/**
 * Inject the nav into `el`. Returns {openThemes, closeThemes, setActive, setSaveState, destroy}.
 * @param {HTMLElement} el
 * @param {{active?:string, links?:Array<{key?:string,label:string,href:string,icon?:string}>, account?:boolean}} [opts]
 */
export function mountNav(el, opts = {}) {
  const links = opts.links || DEFAULT_LINKS;
  const account = opts.account !== false;
  let active = norm(opts.active || (links[0] && keyOf(links[0])));
  el.innerHTML = navHtml(links, active, account);
  syncThemeLabels();

  const modal = el.querySelector('#themesModal');
  let themesOpen = false;
  let lastFocus = null;

  function closeThemes() {
    if (!themesOpen) return;
    themesOpen = false; modal.classList.remove('show');
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* gone */ } }
  }
  function openThemes() {
    if (!themesOpen) lastFocus = document.activeElement;
    themesOpen = true; modal.classList.add('show');
    const cur = currentTheme();
    const swatches = themeList().map(([key, t]) => {
      const v = t.vars; const isSel = key === cur;
      return `<button type="button" class="th-card${isSel ? ' sel' : ''}" data-key="${key}" aria-pressed="${isSel}" style="background:${v.bg}; color:${v.text}; border-color:${isSel ? v.accent : v.line}">` +
        `<div class="th-name">${escHtml(t.name)}</div>` +
        `<div class="th-bars"><span style="background:${v.accent}"></span><span style="background:${v.warn}"></span><span style="background:${v.bad}"></span></div>` +
        `</button>`;
    }).join('');
    modal.innerHTML = '<div class="pc-card" style="width:600px"><button type="button" class="modal-x" aria-label="close">×</button>' +
      '<div class="pc-head"><div class="pc-name">themes</div></div>' +
      '<div class="pc-sub">Pick a theme. Your pick is saved on this device.</div>' +
      '<div class="th-grid">' + swatches + '</div>' +
      '<div class="pc-foot"><span></span><a id="thClose" href="#" role="button">close</a></div>' +
      '</div>';
    modal.querySelectorAll('.th-card').forEach(b => b.onclick = () => {
      const k = b.dataset.key; applyTheme(k); saveTheme(k); openThemes();   // re-render so the ✓ moves
      const again = modal.querySelector(`.th-card[data-key="${k}"]`); if (again) again.focus();
    });
    const c = modal.querySelector('#thClose'); if (c) c.onclick = e => { e.preventDefault(); closeThemes(); };
    const x = modal.querySelector('.modal-x'); if (x) x.onclick = e => { e.preventDefault(); closeThemes(); };
    const sel = modal.querySelector('.th-card.sel') || modal.querySelector('.th-card'); if (sel && document.activeElement !== sel && !modal.contains(document.activeElement)) sel.focus();
  }

  // backdrop click-away: clicking the dimmed area around the card closes it
  const onModalClick = e => { if (e.target === modal) closeThemes(); };
  modal.addEventListener('click', onModalClick);

  const thBtn = el.querySelector('#navThemes'); if (thBtn) thBtn.onclick = () => themesOpen ? closeThemes() : openThemes();
  const thName = el.querySelector('#navThemeName'); if (thName) thName.onclick = () => themesOpen ? closeThemes() : openThemes();
  const burger = el.querySelector('#navBurger'); if (burger) burger.onclick = () => { const p = el.querySelector('#navPages'); if (p) { p.classList.toggle('open'); burger.setAttribute('aria-expanded', p.classList.contains('open') ? 'true' : 'false'); } };

  // Esc closes the picker; while it is open no key reaches the sheet (the old trainer swallowed them).
  const onKey = e => {
    if (!themesOpen) return;
    if (e.key === 'Escape') { closeThemes(); e.preventDefault(); }
    if (e.key === 'Tab') return;   // let focus move among the swatches
    e.stopImmediatePropagation();
  };
  window.addEventListener('keydown', onKey, true);

  /* ---------------- account menu ---------------- */
  const menu = el.querySelector('#userMenu');
  const userBtn = el.querySelector('#userBtn');
  const dropdown = el.querySelector('#userDropdown');
  let menuOpen = false;
  const items = () => dropdown ? [...dropdown.querySelectorAll('[role="menuitem"]')] : [];
  function openMenu(focusIndex) {
    if (!dropdown) return;
    menuOpen = true; dropdown.classList.add('open'); userBtn.classList.add('open'); userBtn.setAttribute('aria-expanded', 'true');
    const list = items(); if (focusIndex != null && list.length) list[(focusIndex + list.length) % list.length].focus();
  }
  function closeMenu(refocus) {
    if (!dropdown) return;
    menuOpen = false; dropdown.classList.remove('open'); userBtn.classList.remove('open'); userBtn.setAttribute('aria-expanded', 'false');
    if (refocus) userBtn.focus();
  }
  if (userBtn) {
    userBtn.addEventListener('click', () => menuOpen ? closeMenu(false) : openMenu(null));
    userBtn.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || ((e.key === 'Enter' || e.key === ' ') && !menuOpen)) {
        e.preventDefault(); e.stopPropagation(); openMenu(e.key === 'ArrowUp' ? -1 : 0);
      } else if (e.key === 'Escape' && menuOpen) { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
    });
    dropdown.addEventListener('keydown', e => {
      const list = items(); const i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); list[(i + 1) % list.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); list[(i - 1 + list.length) % list.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); e.stopPropagation(); list[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); e.stopPropagation(); list[list.length - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
      else if (e.key === 'Tab') { closeMenu(false); }
      else if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); if (e.key === ' ') { e.preventDefault(); const a = document.activeElement; if (a && a.click) a.click(); } }
    });
    dropdown.addEventListener('click', e => { if (e.target.closest('[role="menuitem"]')) closeMenu(false); });
  }
  const onDocClick = e => { if (menuOpen && menu && !menu.contains(e.target)) closeMenu(false); };
  document.addEventListener('mousedown', onDocClick);
  const onFocusOut = e => { if (menuOpen && menu && e.relatedTarget && !menu.contains(e.relatedTarget)) closeMenu(false); };
  if (menu) menu.addEventListener('focusout', onFocusOut);

  function setActive(key) {
    active = norm(key);
    el.querySelectorAll('.topnav-link').forEach(a => { const on = a.dataset.page === active; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const p = el.querySelector('#navPages'); if (p) p.classList.remove('open');
  }
  /** The honest save state shown in the menu: "Saved on this device" | "Saved to your account" | "Couldn't save, will retry". */
  function setSaveState(text) { const s = el.querySelector('#umState'); if (s) s.textContent = text; }
  function destroy() {
    window.removeEventListener('keydown', onKey, true);
    document.removeEventListener('mousedown', onDocClick);
    modal.removeEventListener('click', onModalClick);
    el.innerHTML = '';
  }
  return { openThemes, closeThemes, openMenu, closeMenu, setActive, setSaveState, destroy, get isOpen() { return themesOpen; }, get menuOpen() { return menuOpen; } };
}
