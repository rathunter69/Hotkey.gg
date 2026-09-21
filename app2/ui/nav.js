// app2/ui/nav.js — the site's top nav (brand · pages · tools · burger) and the theme picker
// modal. Markup and behaviour lifted from nav.js (NAV_HTML 67–99, openThemes/closeThemes 177–204,
// init wiring 1207–1266, Esc 1181–1194). The old nav carried auth/rank/leaderboard chrome; this
// one carries only what the rebuild needs: links, the 4-dot theme button + name label, the burger.
//
//   mountNav(el, { active:'sandbox', links:[{key, label, href, icon?}] })

import { themeList, applyTheme, saveTheme, currentTheme, syncThemeLabels } from './themes.js';

const escHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
/** Line icons in the old nav's language (the trainer keyboard, the reference book). */
export const NAV_ICONS = {
  lessons: `<svg ${SVG}><path d="M12 6c-1.6-1-4-1.5-6-1.5S2 5 2 5v13s2-.5 4-.5 4.4.5 6 1.5c1.6-1 4-1.5 6-1.5s4 .5 4 .5V5s-2-.5-4-.5-4.4.5-6 1.5Z"/><path d="M12 6v13"/></svg>`,
  sandbox: `<svg ${SVG}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>`,
  trainer: `<svg ${SVG}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>`,
  stats: `<svg ${SVG}><path d="M3 3v18h18"/><path d="M7 15l4-6 3 4 5-8"/></svg>`,
  leaderboard: `<svg ${SVG}><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H5a2 2 0 0 0 0 4h2"/><path d="M17 6h2a2 2 0 0 1 0 4h-2"/><path d="M12 14v3"/><path d="M8 21h8"/><path d="M10 21a2 2 0 0 1 4 0"/></svg>`,
};

export const DEFAULT_LINKS = [
  { key: 'lessons', label: 'Lessons', href: '#/' },
  { key: 'sandbox', label: 'Sandbox', href: '#/sandbox' },
];

const THEME_DOTS = '<svg width="16" height="16" viewBox="0 0 18 18"><circle cx="5" cy="5" r="3.4" fill="#e74c3c"/><circle cx="13" cy="5" r="3.4" fill="#f39c12"/><circle cx="5" cy="13" r="3.4" fill="#27ae60"/><circle cx="13" cy="13" r="3.4" fill="#3498db"/></svg>';

function navHtml(links, active) {
  const pages = links.map(l => {
    const key = l.key || String(l.label).toLowerCase();
    const icon = l.icon || NAV_ICONS[key] || NAV_ICONS.sandbox;
    return `<a class="topnav-link${key === active ? ' active' : ''}" data-page="${escHtml(key)}" href="${escHtml(l.href)}" title="${escHtml(l.label)}" aria-label="${escHtml(l.label)}">${icon}<span class="tl-label">${escHtml(l.label)}</span></a>`;
  }).join('\n          ');
  return `
    <nav class="topnav">
      <div class="topnav-in">
        <a class="topnav-brand" href="#/" title="hotkey.gg — excel trainer">hotkey<b>.gg</b></a>
        <div class="topnav-pages" id="navPages">
          ${pages}
        </div>
        <div class="topnav-tools">
          <button class="topnav-icon" id="navThemes" title="themes" aria-label="themes">${THEME_DOTS}</button>
          <span class="topnav-theme-name" id="navThemeName" data-theme-label title="theme"></span>
        </div>
        <button class="topnav-burger" id="navBurger" aria-label="menu">&#8801;</button>
      </div>
    </nav>
    <div class="profile-modal" id="themesModal"></div>`;
}

/**
 * Inject the nav into `el`. Returns {openThemes, closeThemes, setActive, destroy}.
 * @param {HTMLElement} el
 * @param {{active?:string, links?:Array<{key?:string,label:string,href:string,icon?:string}>}} [opts]
 */
export function mountNav(el, opts = {}) {
  const links = opts.links || DEFAULT_LINKS;
  let active = opts.active || (links[0] && (links[0].key || links[0].label.toLowerCase()));
  el.innerHTML = navHtml(links, active);
  syncThemeLabels();

  const modal = el.querySelector('#themesModal');
  let themesOpen = false;

  function closeThemes() { themesOpen = false; modal.classList.remove('show'); }
  function openThemes() {
    themesOpen = true; modal.classList.add('show');
    const cur = currentTheme();
    const swatches = themeList().map(([key, t]) => {
      const v = t.vars; const isSel = key === cur;
      return `<button class="th-card${isSel ? ' sel' : ''}" data-key="${key}" style="background:${v.bg}; color:${v.text}; border-color:${isSel ? v.accent : v.line}">` +
        `<div class="th-name">${escHtml(t.name)}</div>` +
        `<div class="th-bars"><span style="background:${v.accent}"></span><span style="background:${v.warn}"></span><span style="background:${v.bad}"></span></div>` +
        `</button>`;
    }).join('');
    modal.innerHTML = '<div class="pc-card" style="width:600px"><a class="modal-x">×</a>' +
      '<div class="pc-head"><div class="pc-name">themes</div></div>' +
      '<div class="pc-sub">Click a theme to apply. Your pick saves across sessions.</div>' +
      '<div class="th-grid">' + swatches + '</div>' +
      '<div class="pc-foot"><span></span><a id="thClose">close</a></div>' +
      '</div>';
    modal.querySelectorAll('.th-card').forEach(b => b.onclick = () => {
      const k = b.dataset.key; applyTheme(k); saveTheme(k); openThemes();   // re-render so the ✓ moves
    });
    const c = modal.querySelector('#thClose'); if (c) c.onclick = closeThemes;
    const x = modal.querySelector('.modal-x'); if (x) x.onclick = e => { e.preventDefault(); closeThemes(); };
  }

  // backdrop click-away: clicking the dimmed area around the card closes it
  const onModalClick = e => { if (e.target === modal) closeThemes(); };
  modal.addEventListener('click', onModalClick);

  const thBtn = el.querySelector('#navThemes'); if (thBtn) thBtn.onclick = () => themesOpen ? closeThemes() : openThemes();
  const thName = el.querySelector('#navThemeName'); if (thName) thName.onclick = () => themesOpen ? closeThemes() : openThemes();
  const burger = el.querySelector('#navBurger'); if (burger) burger.onclick = () => { const p = el.querySelector('#navPages'); if (p) p.classList.toggle('open'); };

  // Esc closes the picker; while it is open no key reaches the sheet (the old trainer swallowed them).
  const onKey = e => {
    if (!themesOpen) return;
    if (e.key === 'Escape') { closeThemes(); e.preventDefault(); }
    e.stopImmediatePropagation();
  };
  window.addEventListener('keydown', onKey, true);

  function setActive(key) {
    active = key;
    el.querySelectorAll('.topnav-link').forEach(a => a.classList.toggle('active', a.dataset.page === key));
  }
  function destroy() {
    window.removeEventListener('keydown', onKey, true);
    modal.removeEventListener('click', onModalClick);
    el.innerHTML = '';
  }
  return { openThemes, closeThemes, setActive, destroy, get isOpen() { return themesOpen; } };
}
