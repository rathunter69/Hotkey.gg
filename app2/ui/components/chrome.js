// app2/ui/components/chrome.js — the workspace chrome (screenplay 3.0 "The workspace"; 3.7; M91).
// Laid out as Windows Excel lays out a workbook (Wolf, 2026-10-02): a title bar on top with Exit and
// the Quick Access Toolbar at the left, the lesson's title centred where Excel shows the workbook's
// name (a button that opens the module's lessons; arrows and Enter move between them), and at the
// right the goal segments with "Goal {n} of {m}" (in a drill the task count), then sound and More.
// Under it the Ribbon starts at the window's left edge, File first, as Excel's does. At the foot
// one strip, as Excel's: the sheet tabs at the left, the sheet keys, and the status (Ready, the
// selection's figures, the zoom) at the right. Esc does what it does in Excel (cancels an edit,
// closes a menu, a note or Help, drops the marching ants) and never leaves: Exit does, from its
// button, the More menu or Ctrl+Shift+X, through a small "Leave this lesson?" dialog with Stay
// focused. Every word is a site.csv row. One component, used by every workspace.
//
//   escLadder(state)                     → 'edit' | 'note' | 'menu' | 'help' | 'hint'   pure
//   EXIT_KEY, isExitKey(e)               the Exit chord (pure)
//   sheetKeys({ sheets, delivered, platform })  → the sheet-key hint on the strip (pure)
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
 * What Esc does, from what is open, the way Excel's does: an edit is cancelled first (the engine does
 * it; 'edit' says so), then a note, a menu or Help closes, then the marching ants drop ('ants', the
 * engine again). With nothing to close it does nothing on the sheet and the title bar says how to
 * leave ('hint'). Esc never leaves the workspace: Exit does.
 *   state: { editing, note, menu, help, ants }
 */
export function escLadder(s = {}) {
  if (s.editing) return 'edit';
  if (s.note) return 'note';
  if (s.menu) return 'menu';
  if (s.help) return 'help';
  if (s.ants) return 'ants';
  return 'hint';
}

/** The Exit chord: Ctrl+Shift+X (Ctrl+Shift+Q quits Chrome on some systems, Ctrl+W and Ctrl+F4 close the tab). */
export const EXIT_KEY = 'Ctrl+Shift+X';
export const isExitKey = e => !!e && !!e.ctrlKey && !!e.shiftKey && !e.altKey && (e.key === 'X' || e.key === 'x');

/**
 * The sheet keys the strip shows beside the tabs, for a workbook of more than one sheet. Excel's keys
 * are Ctrl+PgDn and Ctrl+PgUp; Chrome, Edge and Firefox keep them for their own tabs, so in a browser
 * tab Alt+PgDn and Alt+PgUp do the same job (⌥→ and ⌥← on a Mac) and are logged as Excel's. Once
 * the browser has handed the real keys over (the installed app, full screen with the keys locked),
 * the strip shows Excel's alone. → null, or { keys: ['Ctrl+PgUp', 'Ctrl+PgDn'], alias: [...] | null }. Pure.
 */
export function sheetKeys({ sheets = 1, delivered = false, platform = 'win' } = {}) {
  if (!(sheets > 1)) return null;
  const keys = ['Ctrl+PgUp', 'Ctrl+PgDn'];
  if (delivered) return { keys, alias: null };
  return { keys, alias: platform === 'mac' ? ['Alt+←', 'Alt+→'] : ['Alt+PgUp', 'Alt+PgDn'] };
}

/*
 * Whether this window hands Ctrl+PgDn and Ctrl+PgUp to the page. Nothing can ask a browser that, so
 * the workspace learns it: the installed app's own window does; full screen does once the keys are
 * locked (the Keyboard Lock API, Chrome and Edge); and any Ctrl+PgDn that arrives proves it for the
 * rest of the visit (Safari, a browser set up without tab keys).
 */
let sheetKeyArrived = false, keysLocked = false;
/** A keydown: true the first time Excel's own sheet key arrives (the strip can drop the alias). */
export function noteSheetKey(e) {
  if (!e || !e.ctrlKey || e.altKey || (e.key !== 'PageDown' && e.key !== 'PageUp')) return false;
  const first = !sheetKeyArrived; sheetKeyArrived = true; return first;
}
export function sheetKeysDelivered() {
  if (sheetKeyArrived) return true;
  try { if (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches) return true; } catch (e) { /* no media queries */ }
  return !!(keysLocked && typeof document !== 'undefined' && document.fullscreenElement);
}
export const canFullscreen = () => typeof document !== 'undefined' && !!document.documentElement && typeof document.documentElement.requestFullscreen === 'function' && document.fullscreenEnabled !== false;
/** Full screen with the sheet keys locked to the page (Esc still leaves full screen, as the browser says). Resolves true when the keys are the sheet's. */
export async function fullscreenKeys() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    if (navigator.keyboard && typeof navigator.keyboard.lock === 'function') { await navigator.keyboard.lock(['PageUp', 'PageDown']); keysLocked = true; }
  } catch (e) { return false; }
  const off = () => { if (!document.fullscreenElement) { keysLocked = false; document.removeEventListener('fullscreenchange', off); } };
  document.addEventListener('fullscreenchange', off);
  return keysLocked;
}

/** The More menu (3.0, Defaults): Lessons in this module, Restart the lesson, Collapse the Ribbon, Move the card, Report a problem, Exit. */
export const MORE_ITEMS = [
  { id: 'lessons', copy: 'more_lessons', fallback: 'Lessons in this module', key: 'L', lessonOnly: true },
  { id: 'restart', copy: 'more_restart', fallback: 'Restart the lesson', key: 'R' },
  { id: 'collapse', copy: 'more_collapse', fallback: 'Collapse the Ribbon', key: 'Ctrl+F1', altCopy: 'more_expand', altFallback: 'Show the Ribbon' },
  { id: 'move', copy: 'more_move', fallback: 'Move the card', key: 'Ctrl+Shift+J', cardOnly: true },
  { id: 'report', copy: 'more_report', fallback: 'Report a problem', key: 'P' },
  { id: 'exit', copy: 'more_exit', fallback: 'Exit', key: EXIT_KEY, letter: 'X' },
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
 *   onBack()   Exit was asked for (its button, the More menu); the host confirms and leaves
 *   onPick(id), onMore(id), onSound(), onFullscreen(), platform()
 *   hasCard    whether Move the card is on the More menu
 */
export function createChrome(host, opts = {}) {
  const el = document.createElement('div');
  el.className = 'wsc'; el.dataset.kind = opts.kind || 'lesson';
  el.innerHTML = `
    <div class="wsc-top">
      <div class="wsc-bar">
        <div class="wsc-left">
          <button type="button" class="wsc-exit" data-act="back" title="${esc(siteCopy('ws_exit', 'Exit'))} (${esc(keyLabel(EXIT_KEY, platform()))})">${BACK}<span class="wsc-exit-word">${esc(siteCopy('ws_exit', 'Exit'))}</span><kbd class="wsc-key">${esc(keyLabel(EXIT_KEY, platform()))}</kbd></button>
          <div class="wsc-qat" role="toolbar"></div>
        </div>
        <button type="button" class="wsc-title" data-act="title" aria-haspopup="menu" aria-expanded="false"><b class="wsc-title-text"></b><span class="wsc-sub"></span>${opts.lessons ? CARET : ''}</button>
        <div class="wsc-right">
          <span class="wsc-progress"></span>
          <button type="button" class="wsc-icon wsc-sound" data-act="sound" aria-pressed="true"><span class="wsc-sr"></span></button>
          <button type="button" class="wsc-icon wsc-more" data-act="more" aria-haspopup="menu" aria-expanded="false">${MORE}<span class="wsc-sr">${esc(siteCopy('ws_more', 'More'))}</span></button>
        </div>
      </div>
      <div class="ribbon-slot" data-ribbon="full"><div class="ribbon" id="ribbon"></div></div>
      <div class="wsc-menu" id="wscLessons" role="menu" hidden></div>
      <div class="wsc-menu wsc-menu-more" id="wscMore" role="menu" hidden></div>
    </div>
    <div class="wsc-main">
      <div class="wsc-stage" id="stage">
        <div class="wsc-sheet" id="sheetMount"></div>
        <div class="wsc-foot"><div class="wsc-tabs" id="sheetTabs"></div><div class="wsc-sheetkeys" hidden></div><div class="wsc-status" id="statusMount"></div></div>
      </div>
      <div class="wsc-side" id="sideMount"></div>
    </div>
    <div class="wsc-hint" hidden></div>`;
  host.appendChild(el);
  const $ = sel => el.querySelector(sel);
  const lessonsMenu = $('#wscLessons'), moreMenu = $('#wscMore');
  function platform() { return opts.platform ? opts.platform() : undefined; }
  let menu = null;    // 'lessons' | 'more' | null
  let menuIx = 0;
  let muted = false, collapsed = false, hintH = 0;

  function setTitle(title, sub) { $('.wsc-title-text').textContent = title || ''; $('.wsc-sub').textContent = sub || ''; }
  /** The right cluster's progress: { n, m } draws the goal segments with "Goal {n} of {m}"; { d, n } the task count; a string shows as it is. */
  function setProgress(p) {
    const slot = $('.wsc-progress');
    if (!p) { slot.innerHTML = ''; return; }
    if (typeof p === 'string') { slot.innerHTML = `<span class="wsc-fact">${esc(p)}</span>`; return; }
    if (p.m != null) {
      let segs = '<span class="wsc-segs" aria-hidden="true">';
      for (let i = 1; i <= p.m; i++) segs += `<i class="${i < p.n ? 'done' : i === p.n ? 'now' : ''}"></i>`;
      slot.innerHTML = segs + '</span>' + `<span class="wsc-fact">${esc(t('ws_goal_count', 'Goal {n} of {m}', { n: Math.min(p.n, p.m), m: p.m }))}</span>`;
    } else slot.innerHTML = `<span class="wsc-fact">${esc(t('ws_task_count', '{d} of {n} tasks', { d: p.d, n: p.n }))}</span>`;
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
  /** The Quick Access Toolbar, in the title bar at the left as Excel's: the host hands it the QAT's html on each paint; clicks route back. */
  function renderQat(html) { const q = $('.wsc-qat'); if (q.innerHTML !== (html || '')) q.innerHTML = html || ''; }
  /** The status bar (the sheet view's .sbar) moves into the strip, at the right of the tabs. */
  function adoptStatus(sbar) { if (sbar && sbar.parentElement !== $('#statusMount')) $('#statusMount').appendChild(sbar); }
  /**
   * The sheet keys beside the tabs (sheetKeys() above): Excel's keys, and in a browser tab the alias
   * that works there, with Full screen when the browser can hand the real keys over.
   */
  function setSheetKeys(hint, { fullscreen = false, isFull = false } = {}) {
    const box = $('.wsc-sheetkeys');
    if (!hint) { box.hidden = true; box.innerHTML = ''; return; }
    // the keys that work in this window: the browser's alias until Excel's own arrive, each titled with what it stands for
    const tip = esc(siteCopy('ws_sheet_keys_tip', 'Excel’s keys are Ctrl+PgUp and Ctrl+PgDn. Your browser keeps them for its tabs, so these do the same here.'));
    const k = x => `<kbd class="wsc-key"${hint.alias ? ` title="${tip}"` : ''}>${esc(keyLabel(x, platform()))}</kbd>`;
    let h = `<span class="wsc-sk-label">${esc(siteCopy('ws_sheet_keys', 'Sheets'))}</span>${(hint.alias || hint.keys).map(k).join('')}`;
    if (fullscreen && hint.alias && !isFull) h += `<button type="button" class="wsc-sk-full" data-act="fullscreen" title="${esc(siteCopy('ws_full_screen_tip', 'Full screen hands Ctrl+PgDn and Ctrl+PgUp to the sheet'))}">${esc(siteCopy('ws_full_screen', 'Full screen for Ctrl+PgDn'))}</button>`;
    if (box.innerHTML !== h) box.innerHTML = h;
    box.hidden = false;
  }
  /** A one-line hint under the Ribbon ("Exit is Ctrl+Shift+X"), gone after a moment or on any key. */
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
    if (which === 'lessons') {
      paintLessons(); lessonsMenu.hidden = false; $('.wsc-title').setAttribute('aria-expanded', 'true');
      // the list grows from the centred title, kept inside the window
      const tb = $('.wsc-title'), w = lessonsMenu.offsetWidth || 0, max = Math.max(0, el.clientWidth - w);
      lessonsMenu.style.left = Math.round(Math.max(0, Math.min(max, tb.offsetLeft + tb.offsetWidth / 2 - w / 2))) + 'px';
    }
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
    if (menu === 'more' && /^[a-z]$/i.test(key)) { const i = moreItems().findIndex(it => String(it.letter || it.key).toUpperCase() === key.toUpperCase()); if (i >= 0) { pick(i); return true; } }
    return true;
  }
  function pick(i) {
    if (menu === 'lessons') { const r = rows[i]; closeMenu(); if (r && opts.onPick) opts.onPick(r.id, r); return; }
    const it = moreItems()[i]; closeMenu(); if (!it) return;
    if (it.id === 'exit') { if (opts.onBack) opts.onBack(); return; }
    if (opts.onMore) opts.onMore(it.id);
  }
  el.addEventListener('click', e => {
    const a = e.target.closest('[data-act]');
    if (a) {
      e.preventDefault();
      if (a.closest('.wsc-qat')) { if (opts.onQat) opts.onQat(a.dataset.act); return; }   // the toolbar's commands go back to the Ribbon
      if (a.dataset.act === 'back') { closeMenu(); if (opts.onBack) opts.onBack(); }
      else if (a.dataset.act === 'title') { if (!opts.lessons) return; menu === 'lessons' ? closeMenu() : openMenu('lessons'); }
      else if (a.dataset.act === 'more') { menu === 'more' ? closeMenu() : openMenu('more'); }
      else if (a.dataset.act === 'sound') { if (opts.onSound) opts.onSound(); }
      else if (a.dataset.act === 'fullscreen') { if (opts.onFullscreen) opts.onFullscreen(); }
      return;
    }
    const li = e.target.closest('[data-id]'); if (li && menu === 'lessons') { e.preventDefault(); pick(rows.findIndex(r => r.id === li.dataset.id)); return; }
    const mi = e.target.closest('[data-more]'); if (mi) { e.preventDefault(); pick(moreItems().findIndex(it => it.id === mi.dataset.more)); return; }
  });
  // a click on the chrome never takes the keyboard from the sheet (Excel's Ribbon doesn't either)
  const onChromeDown = e => { if (e.button === 0 && e.target.closest('.wsc-bar, .wsc-foot, .wsc-menu')) e.preventDefault(); };
  el.addEventListener('mousedown', onChromeDown);
  const onDocDown = e => { if (menu && !e.target.closest('.wsc-menu, .wsc-title, .wsc-more')) closeMenu(); };
  document.addEventListener('mousedown', onDocDown, true);

  setTitle(opts.title, opts.subtitle);
  setSound(false);
  return {
    el, ribbonSlot: $('.ribbon-slot'), stage: $('#stage'), sheetMount: $('#sheetMount'), tabsMount: $('#sheetTabs'), statusMount: $('#statusMount'), sideMount: $('#sideMount'), qat: $('.wsc-qat'),
    setTitle, setProgress, setSound, setCollapsed, renderQat, adoptStatus, setSheetKeys, hint, openMenu, closeMenu, menuKey,
    setLessons(list) { rows = list || []; if (menu === 'lessons') paintLessons(); },
    get menu() { return menu; }, get collapsed() { return collapsed; },
    destroy() { clearTimeout(hintH); el.removeEventListener('mousedown', onChromeDown); document.removeEventListener('mousedown', onDocDown, true); el.remove(); },
  };
}

/**
 * The only dialog: a confirmation with a title, one sentence, and two buttons, the cancel (Esc) and
 * the action. `focus: 'cancel'` puts the focus on the cancel button (Stay, when leaving), so Enter
 * keeps the learner where they are; Tab and the arrows move between the two, and Enter presses the
 * focused one. Returns a promise of true (the action) or false (cancelled). Keys are captured while it shows.
 */
export function confirmDialog({ title, body, action, cancel, platform, focus = 'action' } = {}) {
  return new Promise(resolve => {
    const wrap = document.createElement('div');
    wrap.className = 'wsc-dialog-wrap'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'wscDlgTitle');
    const okFirst = focus !== 'cancel';
    const btn = (which, label, key, primary) => `<button type="button" class="wsc-btn${primary ? ' wsc-btn-primary' : ''}" data-dlg="${which}"><span>${esc(label)}</span>${key ? `<kbd class="wsc-key">${esc(keyLabel(key, platform))}</kbd>` : ''}</button>`;
    const cancelLabel = cancel || siteCopy('dialog_cancel', 'Cancel');
    // the focused button carries Enter; the cancel always carries Esc
    const acts = okFirst
      ? btn('cancel', cancelLabel, 'Esc', false) + btn('ok', action, 'Enter', true)
      : btn('ok', action, '', false) + btn('cancel', cancelLabel, 'Enter', true);
    wrap.innerHTML = `<div class="wsc-dialog"><div class="wsc-dialog-title" id="wscDlgTitle">${esc(title)}</div><p class="wsc-dialog-body">${esc(body || '')}</p><div class="wsc-dialog-acts">${acts}</div></div>`;
    document.body.appendChild(wrap);
    const btns = [...wrap.querySelectorAll('[data-dlg]')];
    const done = v => { document.removeEventListener('keydown', onKey, true); wrap.remove(); resolve(v); };
    const onKey = e => {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); done(false); return; }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const f = btns.includes(document.activeElement) ? document.activeElement : wrap.querySelector(okFirst ? '[data-dlg="ok"]' : '[data-dlg="cancel"]'); done(f.dataset.dlg === 'ok'); return; }
      if (e.key === 'Tab' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const i = btns.indexOf(document.activeElement); btns[(i + 1) % btns.length].focus(); return; }
      e.preventDefault();   // nothing reaches the sheet while the dialog shows
    };
    document.addEventListener('keydown', onKey, true);
    wrap.addEventListener('click', e => { const b = e.target.closest('[data-dlg]'); if (b) done(b.dataset.dlg === 'ok'); else if (e.target === wrap) done(false); });
    // Enter presses the focused button, so its keycap moves with the focus
    const enterCap = wrap.querySelector('[data-dlg] .wsc-key:last-child');
    const enterKbd = [...wrap.querySelectorAll('.wsc-key')].find(k => k.textContent === keyLabel('Enter', platform)) || enterCap;
    wrap.addEventListener('focusin', e => { const b = e.target.closest && e.target.closest('[data-dlg]'); if (b && enterKbd && enterKbd.parentNode !== b) b.appendChild(enterKbd); });
    const first = wrap.querySelector(okFirst ? '[data-dlg="ok"]' : '[data-dlg="cancel"]'); if (first) first.focus();
  });
}
