// app2/ui/components/chrome.js — the workspace chrome (screenplay 3.0 "The workspace"; 3.7; M91).
// Inside a lesson, a challenge or a drill the chrome is one row, the Ribbon, the toolbar row and the
// formula bar; everything else gives way to the grid. The one title row is folded into the Ribbon's
// tab row: a back button with its Esc key, the title as a button that opens the module's lessons
// (arrows and Enter move between lessons), the Ribbon's own tabs, and at the right the goal segments
// with "Goal {n} of {m}" (in a drill the task count), then sound and More. A lesson tints the back
// and title cells green. The Quick Access Toolbar sits on its own row below the Ribbon. The Esc
// ladder: an edit, then a note, a menu or Help, then "Esc again to leave". The only dialog is a
// confirmation. Every word is a site.csv row. One component, used by every workspace.
//
//   escLadder(state)                     → 'edit' | 'note' | 'menu' | 'help' | 'arm' | 'leave'   pure
//   lessonRows(lessons, { currentId, progress, goalLine })  → the lesson menu's rows             pure
//   MORE_ITEMS                           the More menu, as data
//   createChrome(host, opts)             → the component: its ribbon slot, toolbar row, sheet and side slots
//   confirmDialog(opts)                  → the one dialog: a title, one sentence, Cancel (Esc) and the action (Enter)
import { siteCopy } from '../../content/copy/apply.js';
import { keyLabel } from '../../app/prefs.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const t = (key, fb, vars) => fill(siteCopy(key, fb), vars);

/**
 * What Esc does, from what is open: an edit is cancelled first (the engine does it; 'edit' says so),
 * then a note, a menu or Help closes, then a run part-way asks for Esc again ('arm'), and only then
 * the workspace is left. A Ribbon walk or a dialog is the engine's own Esc and comes before all of
 * these (the host feeds Esc to the engine first and asks here only when it was not consumed).
 *   state: { editing, note, menu, help, partWay, armed }
 */
export function escLadder(s = {}) {
  if (s.editing) return 'edit';
  if (s.note) return 'note';
  if (s.menu) return 'menu';
  if (s.help) return 'help';
  if (s.partWay && !s.armed) return 'arm';
  return 'leave';
}

/** The More menu (3.0, Defaults): Lessons in this module, Restart the lesson, Collapse the Ribbon, Move the card, Report a problem. */
export const MORE_ITEMS = [
  { id: 'lessons', copy: 'more_lessons', fallback: 'Lessons in this module', key: 'L', lessonOnly: true },
  { id: 'restart', copy: 'more_restart', fallback: 'Restart the lesson', key: 'R' },
  { id: 'collapse', copy: 'more_collapse', fallback: 'Collapse the Ribbon', key: 'Ctrl+F1', altCopy: 'more_expand', altFallback: 'Show the Ribbon' },
  { id: 'move', copy: 'more_move', fallback: 'Move the card', key: 'Ctrl+Shift+J', cardOnly: true },
  { id: 'report', copy: 'more_report', fallback: 'Report a problem', key: 'P' },
];

/**
 * The lesson menu's rows: number, title, and at the right "Done", the current goal line, or nothing.
 *   lessons: [{ id, num, title, href, kind }]; progress: { [id]: { completed } }; goalLine: the current lesson's "Goal {n} of {m}"
 */
export function lessonRows(lessons, { currentId, progress = {}, goalLine = '' } = {}) {
  return (lessons || []).map(l => ({
    id: l.id, num: l.num, title: l.title, href: l.href, current: l.id === currentId,
    right: l.id === currentId ? goalLine : progress[l.id] && progress[l.id].completed ? siteCopy('ws_done', 'Done') : '',
  }));
}

const SOUND_ON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3.2L10.5 4v12L6.2 12.5H3z" fill="currentColor"/><path d="M13 7a4 4 0 0 1 0 6M15.3 4.8a7 7 0 0 1 0 10.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const SOUND_OFF = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3.2L10.5 4v12L6.2 12.5H3z" fill="currentColor"/><path d="M13 7.5l4 5M17 7.5l-4 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const BACK = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const MORE = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="4" cy="10" r="1.7" fill="currentColor"/><circle cx="10" cy="10" r="1.7" fill="currentColor"/><circle cx="16" cy="10" r="1.7" fill="currentColor"/></svg>';
const CARET = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/**
 * @param {HTMLElement} host
 * @param {object} opts
 *   kind       'lesson' | 'challenge' | 'assessment' | 'drill' | 'daily'
 *   title      the lesson's or drill's title; subtitle: "1.5, lesson 3 of 4" or "Chapter 1, taught in 1.5"
 *   lessons    the module's lessons for the title menu ([{ id, num, title, href }]) or null
 *   onBack(), onPick(id), onMore(id), onSound(), platform()
 *   hasCard    whether Move the card is on the More menu
 */
export function createChrome(host, opts = {}) {
  const el = document.createElement('div');
  el.className = 'wsc'; el.dataset.kind = opts.kind || 'lesson';
  el.innerHTML = `
    <div class="wsc-top">
      <div class="ribbon-slot" data-ribbon="full"><div class="ribbon" id="ribbon"></div></div>
      <div class="wsc-row">
        <div class="wsc-left">
          <button type="button" class="wsc-back" data-act="back">${BACK}<kbd class="wsc-key">${esc(keyLabel('Esc', platform()))}</kbd><span class="wsc-sr">${esc(siteCopy('ws_back', 'Back'))}</span></button>
          <button type="button" class="wsc-title" data-act="title" aria-haspopup="menu" aria-expanded="false"><b class="wsc-title-text"></b><span class="wsc-sub"></span>${opts.lessons ? CARET : ''}</button>
        </div>
        <div class="wsc-right">
          <span class="wsc-progress"></span>
          <button type="button" class="wsc-icon wsc-sound" data-act="sound" aria-pressed="true"><span class="wsc-sr"></span></button>
          <button type="button" class="wsc-icon wsc-more" data-act="more" aria-haspopup="menu" aria-expanded="false">${MORE}<span class="wsc-sr">${esc(siteCopy('ws_more', 'More'))}</span></button>
        </div>
      </div>
      <div class="wsc-menu" id="wscLessons" role="menu" hidden></div>
      <div class="wsc-menu wsc-menu-more" id="wscMore" role="menu" hidden></div>
    </div>
    <div class="wsc-qat" role="toolbar"></div>
    <div class="wsc-main">
      <div class="wsc-stage" id="stage"><div class="wsc-sheet" id="sheetMount"></div><div class="wsc-tabs" id="sheetTabs"></div></div>
      <div class="wsc-side" id="sideMount"></div>
    </div>
    <div class="wsc-hint" hidden></div>`;
  host.appendChild(el);
  const $ = sel => el.querySelector(sel);
  const row = $('.wsc-row'), left = $('.wsc-left'), right = $('.wsc-right');
  const lessonsMenu = $('#wscLessons'), moreMenu = $('#wscMore');
  function platform() { return opts.platform ? opts.platform() : undefined; }
  let menu = null;    // 'lessons' | 'more' | null
  let menuIx = 0;
  let muted = false, collapsed = false, hintH = 0;

  /* ---- the row's clusters pad the Ribbon's tab row: measured, so the tabs never sit under them ---- */
  let tight = false;   // the tab row ran out of room: the goal segments hide until the window grows
  function measure() {
    const top = $('.wsc-top');
    top.style.setProperty('--wsc-left-w', left.offsetWidth + 'px');
    top.style.setProperty('--wsc-right-w', right.offsetWidth + 'px');
    // the tabs run under the right cluster when the last one ends past the row's padded edge
    const tabs = el.querySelector('.ribbon-slot .rf-tabs');
    const last = tabs ? [...tabs.querySelectorAll('.rf-tab')].pop() : null;
    if (last && !tight && last.getBoundingClientRect().right > tabs.getBoundingClientRect().right - right.offsetWidth - 1) { tight = true; top.classList.add('wsc-tight'); measure(); }
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
  if (ro) { ro.observe(left); ro.observe(right); }
  const onResize = () => { if (tight) { tight = false; $('.wsc-top').classList.remove('wsc-tight'); } measure(); };
  if (typeof window !== 'undefined') window.addEventListener('resize', onResize);

  function setTitle(title, sub) { $('.wsc-title-text').textContent = title || ''; $('.wsc-sub').textContent = sub || ''; measure(); }
  /** The right cluster's progress: { n, m } draws the goal segments with "Goal {n} of {m}"; { d, n } the task count; a string shows as it is. */
  function setProgress(p) {
    const slot = $('.wsc-progress');
    if (!p) { slot.innerHTML = ''; measure(); return; }
    if (typeof p === 'string') { slot.innerHTML = `<span class="wsc-fact">${esc(p)}</span>`; measure(); return; }
    if (p.m != null) {
      let segs = '<span class="wsc-segs" aria-hidden="true">';
      for (let i = 1; i <= p.m; i++) segs += `<i class="${i < p.n ? 'done' : i === p.n ? 'now' : ''}"></i>`;
      slot.innerHTML = segs + '</span>' + `<span class="wsc-fact">${esc(t('ws_goal_count', 'Goal {n} of {m}', { n: Math.min(p.n, p.m), m: p.m }))}</span>`;
    } else slot.innerHTML = `<span class="wsc-fact">${esc(t('ws_task_count', '{d} of {n} tasks', { d: p.d, n: p.n }))}</span>`;
    measure();
  }
  function setSound(isMuted) {
    muted = !!isMuted;
    const b = $('.wsc-sound');
    b.innerHTML = (muted ? SOUND_OFF : SOUND_ON) + `<span class="wsc-sr">${esc(siteCopy(muted ? 'ws_sound_off' : 'ws_sound_on', muted ? 'Sound off' : 'Sound on'))}</span>`;
    b.setAttribute('aria-pressed', String(!muted));
    b.title = siteCopy(muted ? 'ws_sound_off' : 'ws_sound_on', muted ? 'Sound off' : 'Sound on');
  }
  /** Collapsed to its tabs (Ctrl+F1): the slot keeps the tab row's height and the body drops over the sheet when Alt opens it. */
  function setCollapsed(on) { collapsed = !!on; $('.ribbon-slot').dataset.ribbon = collapsed ? 'tabs' : 'full'; if (menu === 'more') paintMore(); }
  /** The toolbar row below the Ribbon: the host hands it the QAT's html on each paint; clicks route back. */
  function renderQat(html) { $('.wsc-qat').innerHTML = html || ''; }
  /** A one-line hint in the row's place ("Esc again to leave"), gone after a moment or on any key. */
  function hint(text, ms) {
    const h = $('.wsc-hint'); clearTimeout(hintH);
    if (!text) { h.hidden = true; return; }
    h.textContent = text; h.hidden = false;
    hintH = setTimeout(() => { h.hidden = true; }, ms || 3000);
  }

  /* ---- menus: the lesson list grows from the title, More from its button; arrows and Enter, Esc closes ---- */
  let rows = [];
  function paintLessons() {
    lessonsMenu.innerHTML = rows.map((r, i) => `<a class="wsc-item${r.current ? ' on' : ''}${i === menuIx ? ' cursor-on' : ''}" role="menuitem" href="${esc(r.href || '#')}" data-id="${esc(r.id)}"><span class="wsc-num">${esc(r.num || '')}</span><span class="wsc-item-title">${esc(r.title)}</span><span class="wsc-item-right">${esc(r.right || '')}</span></a>`).join('') +
      `<div class="wsc-menu-foot"><span>${esc(siteCopy('ws_lesson_menu_hint', 'Arrows and Enter to move between lessons'))}</span><span class="wsc-foot-k"><kbd class="wsc-key">${esc(keyLabel('Esc', platform()))}</kbd> ${esc(siteCopy('ws_close', 'close'))}</span></div>`;
  }
  function moreItems() { return MORE_ITEMS.filter(it => (!it.lessonOnly || opts.lessons) && (!it.cardOnly || opts.hasCard)); }
  function paintMore() {
    moreMenu.innerHTML = moreItems().map((it, i) => `<button type="button" class="wsc-item${i === menuIx ? ' cursor-on' : ''}" role="menuitem" data-more="${it.id}"><span class="wsc-item-title">${esc(it.id === 'collapse' && collapsed ? siteCopy(it.altCopy, it.altFallback) : siteCopy(it.copy, it.fallback))}</span><kbd class="wsc-key wsc-item-key">${esc(keyLabel(it.key, platform()))}</kbd></button>`).join('');
  }
  function openMenu(which) {
    closeMenu();
    menu = which; menuIx = which === 'lessons' ? Math.max(0, rows.findIndex(r => r.current)) : 0;
    if (which === 'lessons') { paintLessons(); lessonsMenu.hidden = false; $('.wsc-title').setAttribute('aria-expanded', 'true'); }
    else { paintMore(); moreMenu.hidden = false; $('.wsc-more').setAttribute('aria-expanded', 'true'); }
    el.classList.add('wsc-menu-open');
  }
  function closeMenu() {
    if (!menu) return false;
    menu = null; lessonsMenu.hidden = true; moreMenu.hidden = true;
    $('.wsc-title').setAttribute('aria-expanded', 'false'); $('.wsc-more').setAttribute('aria-expanded', 'false');
    el.classList.remove('wsc-menu-open');
    return true;
  }
  /** A key while a menu is open: arrows move the cursor, Enter picks, Esc closes, a letter picks the More item with that key. True when consumed. */
  function menuKey(key) {
    if (!menu) return false;
    const n = menu === 'lessons' ? rows.length : moreItems().length;
    if (key === 'ArrowDown') { menuIx = (menuIx + 1) % Math.max(1, n); menu === 'lessons' ? paintLessons() : paintMore(); return true; }
    if (key === 'ArrowUp') { menuIx = (menuIx + n - 1) % Math.max(1, n); menu === 'lessons' ? paintLessons() : paintMore(); return true; }
    if (key === 'Escape') { closeMenu(); return true; }
    if (key === 'Enter') { pick(menuIx); return true; }
    if (menu === 'more' && /^[a-z]$/i.test(key)) { const i = moreItems().findIndex(it => it.key.toUpperCase() === key.toUpperCase()); if (i >= 0) { pick(i); return true; } }
    return true;
  }
  function pick(i) {
    if (menu === 'lessons') { const r = rows[i]; closeMenu(); if (r && opts.onPick) opts.onPick(r.id, r); return; }
    const it = moreItems()[i]; closeMenu(); if (it && opts.onMore) opts.onMore(it.id);
  }
  el.addEventListener('click', e => {
    const a = e.target.closest('[data-act]');
    if (a) {
      e.preventDefault();
      if (a.closest('.wsc-qat')) { if (opts.onQat) opts.onQat(a.dataset.act); return; }   // the toolbar row's commands go back to the Ribbon
      if (a.dataset.act === 'back') { closeMenu(); if (opts.onBack) opts.onBack(); }
      else if (a.dataset.act === 'title') { if (!opts.lessons) return; menu === 'lessons' ? closeMenu() : openMenu('lessons'); }
      else if (a.dataset.act === 'more') { menu === 'more' ? closeMenu() : openMenu('more'); }
      else if (a.dataset.act === 'sound') { if (opts.onSound) opts.onSound(); }
      return;
    }
    const li = e.target.closest('[data-id]'); if (li && menu === 'lessons') { e.preventDefault(); pick(rows.findIndex(r => r.id === li.dataset.id)); return; }
    const mi = e.target.closest('[data-more]'); if (mi) { e.preventDefault(); pick(moreItems().findIndex(it => it.id === mi.dataset.more)); return; }
  });
  const onDocDown = e => { if (menu && !e.target.closest('.wsc-menu, .wsc-title, .wsc-more')) closeMenu(); };
  document.addEventListener('mousedown', onDocDown, true);

  setTitle(opts.title, opts.subtitle);
  setSound(false);
  measure();
  return {
    el, ribbonSlot: $('.ribbon-slot'), stage: $('#stage'), sheetMount: $('#sheetMount'), tabsMount: $('#sheetTabs'), sideMount: $('#sideMount'), qat: $('.wsc-qat'),
    setTitle, setProgress, setSound, setCollapsed, renderQat, hint, openMenu, closeMenu, menuKey,
    setLessons(list) { rows = list || []; if (menu === 'lessons') paintLessons(); },
    get menu() { return menu; }, get collapsed() { return collapsed; },
    destroy() { if (ro) ro.disconnect(); if (typeof window !== 'undefined') window.removeEventListener('resize', onResize); clearTimeout(hintH); document.removeEventListener('mousedown', onDocDown, true); el.remove(); },
  };
}

/**
 * The only dialog: a confirmation with a title, one sentence, Cancel (Esc) and the action (Enter).
 * Returns a promise of true (the action) or false (cancelled). Keys are captured while it shows.
 */
export function confirmDialog({ title, body, action, cancel, platform } = {}) {
  return new Promise(resolve => {
    const wrap = document.createElement('div');
    wrap.className = 'wsc-dialog-wrap'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'wscDlgTitle');
    wrap.innerHTML = `<div class="wsc-dialog"><div class="wsc-dialog-title" id="wscDlgTitle">${esc(title)}</div><p class="wsc-dialog-body">${esc(body || '')}</p>
      <div class="wsc-dialog-acts"><button type="button" class="wsc-btn" data-dlg="cancel"><span>${esc(cancel || siteCopy('dialog_cancel', 'Cancel'))}</span><kbd class="wsc-key">${esc(keyLabel('Esc', platform))}</kbd></button><button type="button" class="wsc-btn wsc-btn-primary" data-dlg="ok"><span>${esc(action)}</span><kbd class="wsc-key">${esc(keyLabel('Enter', platform))}</kbd></button></div></div>`;
    document.body.appendChild(wrap);
    const done = v => { document.removeEventListener('keydown', onKey, true); wrap.remove(); resolve(v); };
    const onKey = e => { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); done(false); } else if (e.key === 'Enter') { e.preventDefault(); done(true); } };
    document.addEventListener('keydown', onKey, true);
    wrap.addEventListener('click', e => { const b = e.target.closest('[data-dlg]'); if (b) done(b.dataset.dlg === 'ok'); else if (e.target === wrap) done(false); });
    const ok = wrap.querySelector('[data-dlg="ok"]'); if (ok) ok.focus();
  });
}
