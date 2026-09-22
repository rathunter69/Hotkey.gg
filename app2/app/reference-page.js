// app2/app/reference-page.js — the searchable shortcut reference: category cards, Windows / Mac
// keycaps, a link to the lesson that teaches each shortcut. Data comes from content/reference.js,
// loaded on mount so a failed load shows an error with Retry instead of an empty page.
//
//   const page = mountReferencePage(root);   // { destroy(), ready: Promise }
//
// Keyboard: `/` focuses the search from anywhere on the page; ↓ from the search enters the list;
// ↑/↓ move a visible focus through the rows, Home/End jump, Enter opens the row's lesson, Esc
// clears the search. Chips take ←/→. The learner's keyboard (localStorage `hk2_platform`, 'win' |
// 'mac') defaults from the browser and is written back when toggled.
//
// The add-in categories (Macabacus, FactSet: every entry in them carries `addin`) sit under one
// "Add-ins (Windows)" section at the very bottom, a <details> that is closed by default and
// remembers nothing. The chips carry one "Add-ins" chip for both; choosing it opens the section
// and filters to it. A search that matches an add-in row opens the section so the row is visible;
// clearing the search closes it again unless the learner opened it. Row navigation skips the
// section while it is closed. Add-ins never take the Mac swap: the cards keep their Windows-only note.
import { lessonById, lessonNumber } from '../content/index.js';

export const PLATFORM_KEY = 'hk2_platform';
/** The chip value that filters to every add-in row (a pseudo-category, like 'all'). */
export const ADDINS_CAT = 'addins';
/** The heading of the collapsed section (and of the public index's group). */
export const ADDINS_TITLE = 'Add-ins (Windows)';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SEARCH_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
const CHEVRON = '<svg class="ref-addins-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

/** 'mac' when the browser reports a Mac (or iOS) platform, else 'win'. */
export function detectPlatform(nav = typeof navigator !== 'undefined' ? navigator : null) {
  try {
    if (!nav) return 'win';
    const p = String((nav.userAgentData && nav.userAgentData.platform) || nav.platform || '');
    const ua = String(nav.userAgent || '');
    return /mac|iphone|ipad|ipod/i.test(p) || /Macintosh|Mac OS/i.test(ua) ? 'mac' : 'win';
  } catch (e) { return 'win'; }
}
/** The saved platform, else the detected one. */
export function readPlatform() {
  try { const v = localStorage.getItem(PLATFORM_KEY); if (v === 'win' || v === 'mac') return v; } catch (e) { /* storage blocked */ }
  return detectPlatform();
}
export function savePlatform(p) { try { localStorage.setItem(PLATFORM_KEY, p); return true; } catch (e) { return false; } }

/** Keycaps for one chord: held keys joined with +, alternatives with /, sequence segments side by side. */
export function chordHtml(chord, parseChord) {
  return parseChord(chord).map(seg => `<span class="ref-seq">${seg.map(key => key.map(k => `<kbd>${esc(k)}</kbd>`).join('<span class="ref-alt">/</span>')).join('<span class="ref-plus">+</span>')}</span>`).join('');
}

const normQuery = s => String(s || '').toLowerCase().replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
const MAC_SHORT = { '⌘': 'cmd', '⌥': 'opt', '⇧': 'shift', '⌃': 'ctrl' };
const MAC_LONG = { '⌘': 'command', '⌥': 'option', '⇧': 'shift', '⌃': 'control' };
const glyphs = (s, map) => String(s).replace(/[⌘⌥⇧⌃]/g, g => ' ' + map[g] + ' ');

/** What the search box matches against: names, descriptions, both chords in typed-out forms, the lesson. */
export function searchText(e, lesson) {
  return normQuery([e.name, e.what, e.note, e.category, e.win, e.mac, glyphs(e.mac, MAC_SHORT), glyphs(e.mac, MAC_LONG), e.macNote, e.addin,
    lesson ? `lesson ${lessonNumber(lesson.id)} ${lesson.title}` : (e.addin ? 'add-in' : 'coming soon')].filter(Boolean).join(' '));
}

/* ---------- the add-in group ---------- */

/**
 * Split the categories (display order kept) into the native ones and the add-in ones: a category is
 * an add-in category when every entry in it carries `addin`. Empty categories are dropped.
 */
export function groupCategories(reference, categories) {
  const native = [], addins = [];
  for (const name of categories) {
    const entries = reference.filter(e => e.category === name);
    if (!entries.length) continue;
    (entries.every(e => e.addin) ? addins : native).push(name);
  }
  return { native, addins };
}
/** The category chips: All, each native category, then one Add-ins chip when there are add-ins. */
export function chipList(reference, categories) {
  const { native, addins } = groupCategories(reference, categories);
  return [{ cat: 'all', label: 'All' }, ...native.map(c => ({ cat: c, label: c })), ...(addins.length ? [{ cat: ADDINS_CAT, label: 'Add-ins' }] : [])];
}
/** Whether an entry passes the chip filter. */
export function inCategory(entry, cat) {
  return cat === 'all' || (cat === ADDINS_CAT ? !!entry.addin : entry.category === cat);
}

/**
 * The open state of the add-ins section: `user` when the learner opened it (the summary or the
 * Add-ins chip), `auto` when a search match opened it, `lastQ` the query that state belongs to.
 * The section is open when either flag is set. Pure, so the rules are unit-tested without a DOM.
 */
export const ADDINS_CLOSED = Object.freeze({ user: false, auto: false, lastQ: '' });
export const addinsOpen = s => s.user || s.auto;
/**
 * After a filter pass: a query that matches an add-in row (`hit`) opens the section; no query, or
 * one that matches nothing there, withdraws that automatic opening. A section the learner closed by
 * hand during a query stays closed for that exact query and opens again once the query changes.
 */
export function addinsAfterSearch(s, q, hit) {
  const auto = !q || !hit ? false : (q !== s.lastQ ? true : s.auto);
  return { user: s.user, auto, lastQ: q };
}
/** After the learner toggles it: opening is remembered as theirs; closing also drops any automatic opening. */
export function addinsAfterToggle(s, open) {
  return { user: open, auto: open ? s.auto : false, lastQ: s.lastQ };
}

const isEditable = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);

function ensureCss() {
  if (typeof document === 'undefined' || document.getElementById('refCss')) return;
  const link = document.createElement('link');
  link.id = 'refCss'; link.rel = 'stylesheet';
  link.href = new URL('../ui/reference.css', import.meta.url).href;
  document.head.appendChild(link);
}

export function mountReferencePage(root, opts = {}) {
  const load = opts.load || (() => import('../content/reference.js'));
  ensureCss();
  const el = document.createElement('div');
  el.className = 'ref';
  root.appendChild(el);

  let platform = readPlatform();
  let data = null;            // the loaded content module
  let category = 'all';
  let rows = [], cards = [];  // { entry, el, hay, addin } · { name, el, rows, addin }
  let addins = null;          // { el: <details>, state } when the data has add-in categories
  let search = null, count = null, empty = null;
  let disposed = false;

  /* ---------- load ---------- */
  async function boot() {
    el.innerHTML = '<div class="ref-loading">Loading the shortcut reference…</div>';
    try {
      const mod = await load();
      if (disposed) return;
      if (!mod || !Array.isArray(mod.REFERENCE) || mod.REFERENCE.length === 0 || !Array.isArray(mod.CATEGORIES) || typeof mod.parseChord !== 'function') throw new Error('the reference data is empty or malformed');
      data = mod;
      render();
    } catch (err) {
      if (!disposed) renderError(err);
    }
  }
  function renderError(err) {
    el.innerHTML = `<header class="ref-head"><h1>Shortcut <span class="em">reference</span></h1></header>
      <div class="ref-error" role="alert">
        <p class="ref-error-title">Couldn’t load the shortcut reference.</p>
        <p class="ref-error-detail">${esc(err && err.message ? err.message : err)}</p>
        <button class="btn btn-primary" type="button" id="refRetry">Retry</button>
      </div>`;
    el.querySelector('#refRetry').onclick = () => { boot(); };
  }

  /* ---------- render ---------- */
  function keysHtml(e) {
    const chord = platform === 'mac' ? e.mac : e.win;
    let html = chordHtml(chord, data.parseChord);
    if (platform === 'mac' && e.macNote && !e.addin) html += ` <span class="ref-macnote">· ${esc(e.macNote)}</span>`;
    return html;
  }
  function rowHtml(e) {
    const lesson = e.lessonId ? lessonById(e.lessonId) : null;
    const tail = lesson
      ? `<a class="ref-lesson" href="#/lesson/${esc(lesson.id)}" tabindex="-1" title="Lesson ${lessonNumber(lesson.id)}: ${esc(lesson.title)}"><span class="ref-lesson-n">Lesson ${lessonNumber(lesson.id)}: </span><span class="ref-lesson-t">${esc(lesson.title)}</span></a>`
      : `<span class="ref-soon">${e.addin ? 'Windows add-in' : 'coming soon'}</span>`;
    return `<div class="ref-row${lesson ? ' taught' : ''}" tabindex="-1" data-id="${esc(e.id)}" aria-label="${esc(e.name)}">
      <span class="ref-keys">${keysHtml(e)}</span>
      <span class="ref-text"><span class="ref-name">${esc(e.name)}</span><span class="ref-what">${esc(e.what)}${e.note ? ` <span class="ref-note">· ${esc(e.note)}</span>` : ''}</span></span>
      ${tail}</div>`;
  }
  /** One category card; `addin` cards carry the Windows-only note that shows under the Mac keyboard. */
  function buildCard(name, entries, addin) {
    const NOTES = data.CATEGORY_NOTES || {};
    const card = document.createElement('section');
    card.className = 'ref-card'; card.dataset.cat = name;
    card.innerHTML = `<h2>${esc(name)}<span class="n">${entries.length}</span></h2>` +
      (addin ? `<p class="ref-cardnote warn ref-wonly" hidden>Windows only: this add-in has no Mac build, so these stay Windows chords.</p>` : '') +
      (NOTES[name] ? `<p class="ref-cardnote">${esc(NOTES[name])}</p>` : '') +
      entries.map(rowHtml).join('');
    const cardRows = entries.map(e => { const rowEl = card.querySelector(`.ref-row[data-id="${CSS.escape(e.id)}"]`); return { entry: e, el: rowEl, hay: searchText(e, e.lessonId ? lessonById(e.lessonId) : null), addin }; });
    rows.push(...cardRows);
    cards.push({ name, el: card, rows: cardRows, addin });
    return card;
  }

  function render() {
    const { REFERENCE, CATEGORIES } = data;
    const groups = groupCategories(REFERENCE, CATEGORIES);
    el.innerHTML = `
      <header class="ref-head">
        <h1>Shortcut <span class="em">reference</span></h1>
        <p class="ref-sub">Every Excel shortcut in the course. A row with a lesson link is taught in that lesson; the rest arrive as the chapters are built.</p>
        <div class="ref-legend">
          <span><kbd>Ctrl</kbd><span class="ref-plus">+</span><kbd>B</kbd> hold together</span>
          <span><kbd>Alt</kbd> <kbd>H</kbd> <kbd>1</kbd> press one after the other</span>
          <div class="ref-plat" role="group" aria-label="Keyboard">
            <button type="button" data-plat="win" aria-pressed="false">Windows</button>
            <button type="button" data-plat="mac" aria-pressed="false">Mac</button>
          </div>
        </div>
      </header>
      <div class="ref-toolbar">
        <div class="ref-searchrow">
          <label class="ref-search">${SEARCH_ICON}<input id="refSearch" type="text" placeholder="Search shortcuts" aria-label="Search shortcuts" autocomplete="off" spellcheck="false"><kbd class="ref-slash" aria-hidden="true">/</kbd></label>
          <span class="ref-count" id="refCount" aria-live="polite"></span>
        </div>
        <div class="ref-chips" id="refChips" role="group" aria-label="Category"></div>
      </div>
      <div class="ref-grid" id="refGrid"></div>
      ${groups.addins.length ? `<details class="ref-addins" id="refAddins">
        <summary class="ref-addins-sum" id="refAddinsSum">${CHEVRON}<span class="ref-addins-title">${esc(ADDINS_TITLE)}</span><span class="ref-addins-hint">${esc(groups.addins.join(' · '))}</span><span class="n" id="refAddinsN"></span></summary>
        <div class="ref-grid ref-addins-grid" id="refAddinsGrid"></div>
        <p class="ref-disclaimer" id="refDisclaimer">${esc(data.ADDIN_DISCLAIMER || '')}</p>
      </details>` : ''}`;
    search = el.querySelector('#refSearch'); count = el.querySelector('#refCount');

    // chips: All, the native categories, one Add-ins chip
    const chips = el.querySelector('#refChips');
    chips.innerHTML = chipList(REFERENCE, CATEGORIES).map(c => `<button type="button" class="ref-chip" data-cat="${esc(c.cat)}" aria-pressed="${c.cat === category}">${esc(c.label)}</button>`).join('');

    // cards: the native categories in the grid, the add-ins inside the collapsed section
    const grid = el.querySelector('#refGrid');
    cards = []; rows = []; addins = null;
    for (const name of groups.native) grid.appendChild(buildCard(name, REFERENCE.filter(e => e.category === name), false));
    empty = document.createElement('div');
    empty.className = 'ref-empty'; empty.hidden = true;
    grid.appendChild(empty);
    if (groups.addins.length) {
      const details = el.querySelector('#refAddins'); const agrid = el.querySelector('#refAddinsGrid');
      let n = 0;
      for (const name of groups.addins) { const entries = REFERENCE.filter(e => e.category === name); n += entries.length; agrid.appendChild(buildCard(name, entries, true)); }
      el.querySelector('#refAddinsN').textContent = String(n);
      addins = { el: details, state: ADDINS_CLOSED };
      details.open = false;
      details.addEventListener('toggle', onToggle);
    }

    applyPlatform();
    apply();
  }

  /* ---------- state ---------- */
  function applyPlatform() {
    el.querySelectorAll('.ref-plat button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.plat === platform)));
    for (const r of rows) r.el.querySelector('.ref-keys').innerHTML = keysHtml(r.entry);
    el.querySelectorAll('.ref-wonly').forEach(n => { n.hidden = platform !== 'mac'; });
  }
  function setPlatform(p) {
    if (p !== 'win' && p !== 'mac') return;
    platform = p; savePlatform(p); applyPlatform();
  }
  /** The add-in rows count as visible only while their section is shown and open. */
  const addinsShowing = () => !!addins && !addins.el.hidden && addins.el.open;
  function visibleRows() { const show = addinsShowing(); return rows.filter(r => !r.el.hidden && (!r.addin || show)); }
  function updateTabStops() {
    const vis = visibleRows();
    const focused = vis.find(r => r.el === document.activeElement);
    for (const r of rows) r.el.tabIndex = -1;
    const first = focused || vis[0];
    if (first) first.el.tabIndex = 0;
  }
  /** Put the <details> where the state says; the toggle event that follows sees no difference and leaves the state alone. */
  function syncAddins() {
    if (!addins) return;
    const open = addinsOpen(addins.state);
    if (addins.el.open !== open) addins.el.open = open;
  }
  function apply() {
    const q = normQuery(search.value);
    let shown = 0;
    for (const card of cards) {
      let any = false;
      for (const r of card.rows) {
        const hit = inCategory(r.entry, category) && (!q || r.hay.includes(q));
        r.el.hidden = !hit;
        if (hit) { any = true; shown++; }
      }
      card.el.hidden = !any;
    }
    count.innerHTML = `<b>${shown}</b> of ${rows.length} shortcuts`;
    if (shown === 0) {
      empty.hidden = false;
      empty.innerHTML = `<span>No shortcuts match ${q ? `“${esc(search.value.trim())}”` : 'that filter'}.</span><button class="btn btn-ghost" type="button" id="refClear">Clear the search</button>`;
      empty.querySelector('#refClear').onclick = () => { clearSearch(); search.focus(); };
    } else empty.hidden = true;
    if (addins) {
      const hit = cards.some(c => c.addin && !c.el.hidden);
      addins.el.hidden = !hit;   // the filter leaves nothing under it: the whole section goes, summary included
      addins.state = addinsAfterSearch(addins.state, q, hit);
      syncAddins();
    }
    updateTabStops();
  }
  function setCategory(cat) {
    category = cat;
    if (cat === ADDINS_CAT && addins) addins.state = addinsAfterToggle(addins.state, true);   // choosing the chip opens the section
    syncChips(); apply();
  }
  function clearSearch() { if (search.value) { search.value = ''; } category = 'all'; syncChips(); apply(); }
  function syncChips() { el.querySelectorAll('.ref-chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.cat === category))); }
  function focusRow(r) {
    if (!r) return;
    r.el.focus({ preventScroll: true });
    updateTabStops();
    try { r.el.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ }
  }
  function openRow(rowEl) {
    const a = rowEl.querySelector('a.ref-lesson');
    if (a) location.hash = a.getAttribute('href');
  }
  /** Esc clears the search; when that closes the section around the focused row, the search takes the focus back. */
  function escapeClears(e, rowEl) {
    if (!search.value) return;
    e.preventDefault(); search.value = ''; apply();
    if (rowEl && !visibleRows().some(r => r.el === rowEl)) { search.focus(); search.select(); }
  }

  /* ---------- events ---------- */
  // The learner (or the browser's find-in-page) flipped the <details>: a mismatch with the state says so.
  const onToggle = () => {
    if (!addins) return;
    if (addins.el.open !== addinsOpen(addins.state)) addins.state = addinsAfterToggle(addins.state, addins.el.open);
    updateTabStops();
  };
  const onClick = e => {
    const plat = e.target.closest('.ref-plat button'); if (plat) { setPlatform(plat.dataset.plat); return; }
    const chip = e.target.closest('.ref-chip'); if (chip) { setCategory(chip.dataset.cat); return; }
    const row = e.target.closest('.ref-row'); if (row && !e.target.closest('a')) { const r = rows.find(x => x.el === row); if (r) focusRow(r); }
  };
  const onInput = e => { if (e.target === search) apply(); };
  const onKey = e => {
    if (!data) return;
    const t = e.target;
    if (t === search) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { const v = visibleRows(); if (v[0]) { e.preventDefault(); focusRow(v[0]); } }
      else if (e.key === 'Escape') escapeClears(e, null);
      return;
    }
    const rowEl = t.closest ? t.closest('.ref-row') : null;
    if (rowEl) {
      const v = visibleRows(); const i = v.findIndex(r => r.el === rowEl);
      if (e.key === 'ArrowDown') { e.preventDefault(); focusRow(v[Math.min(i + 1, v.length - 1)]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0) { search.focus(); search.select(); } else focusRow(v[i - 1]); }
      else if (e.key === 'Home') { e.preventDefault(); focusRow(v[0]); }
      else if (e.key === 'End') { e.preventDefault(); focusRow(v[v.length - 1]); }
      else if (e.key === 'Enter') { e.preventDefault(); openRow(rowEl); }
      else if (e.key === 'Escape') escapeClears(e, rowEl);
      return;
    }
    if (t.classList && t.classList.contains('ref-chip')) {
      const chips = [...el.querySelectorAll('.ref-chip')]; const i = chips.indexOf(t);
      if (e.key === 'ArrowRight') { e.preventDefault(); chips[(i + 1) % chips.length].focus(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); chips[(i - 1 + chips.length) % chips.length].focus(); }
    }
    if (e.key === 'Escape') escapeClears(e, null);   // from a chip, the keyboard toggle or the add-ins summary
  };
  // `/` from anywhere on the page (not inside a text field) jumps to the search box.
  const onWindowKey = e => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    if (isEditable(e.target) || !search || !document.body.contains(el)) return;
    e.preventDefault(); search.focus(); search.select();
  };
  el.addEventListener('click', onClick);
  el.addEventListener('input', onInput);
  el.addEventListener('keydown', onKey);
  window.addEventListener('keydown', onWindowKey);

  const ready = boot();
  return {
    ready,
    get platform() { return platform; },
    destroy() {
      disposed = true;
      window.removeEventListener('keydown', onWindowKey);
      el.removeEventListener('click', onClick); el.removeEventListener('input', onInput); el.removeEventListener('keydown', onKey);
      el.remove();
    },
  };
}
