// app2/app/reference-page.js — Reference as 3.0 draws it (screenplay 3.0 "Reference"; 3.15; M57,
// M106), made a thing to play with (Wolf, 2026-10-02, point 17): a keyboard across the top with
// every key the course uses lit in its group's colour, filled once you have it; point at a row (or
// move the cursor onto it) and its keys go down on the board and the card beside it says what it
// does and where it is taught; press any shortcut with Ctrl, or a function key, and the page finds
// it. Under the board, the groups in two dense columns, each in its own colour. A title, a search
// box ("/" focuses it) and the Windows or Mac toggle. The keys in
// groups (Move, Select, Edit, Format, Formulas, the Ribbon, Data), each group a table in two
// columns of tables, rendered from data: the key as a keycap, what it does, the lesson that
// teaches it, its state (Not yet, Taught, Practiced, Under par) and Drill it (a short rep on that
// key, where one exists). A key with a Ribbon route shows it as a second row of keycaps. A line
// at the foot: "{n} of {m} keys collected". The toggle swaps every keycap on the page and is the
// Key labels setting. The arrows move the cell cursor over the rows and Enter opens the lesson.
//
// The add-in layers (Macabacus, FactSet) stay in content/reference.js for the public pages; they
// are not course keys, so this page leaves them out.
import { lessonById, lessonNumber } from '../content/index.js';
import { settings } from './settings.js';
import { store } from './store.js';
import { schedule, MICRO } from './schedule.js';
import { itemNumber } from './numbering.js';
import { moduleOf } from '../content/index.js';
import { siteCopy } from '../content/copy/apply.js';
import { keyboardHtml, keyIdsOf, keysTouched, chordOfEvent, sameKeys, chordLabel } from '../ui/components/keyboard.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const t = (key, fb) => siteCopy(key, fb);

/** 'mac' when the browser reports a Mac (or iOS) platform, else 'win'. */
export function detectPlatform(nav = typeof navigator !== 'undefined' ? navigator : null) {
  try {
    if (!nav) return 'win';
    const p = String((nav.userAgentData && nav.userAgentData.platform) || nav.platform || '');
    const ua = String(nav.userAgent || '');
    return /mac|iphone|ipad|ipod/i.test(p) || /Macintosh|Mac OS/i.test(ua) ? 'mac' : 'win';
  } catch (e) { return 'win'; }
}

/** The groups of 3.0, in page order, each the categories of content/reference.js it gathers. */
export const REFERENCE_GROUPS = [
  { id: 'move', copy: 'ref_group_move', label: 'Move', categories: ['Navigation'] },
  { id: 'select', copy: 'ref_group_select', label: 'Select', categories: ['Selection'] },
  { id: 'edit', copy: 'ref_group_edit', label: 'Edit', categories: ['Editing', 'Copy and paste', 'Rows and columns', 'Workbook'] },
  { id: 'format', copy: 'ref_group_format', label: 'Format', categories: ['Formatting', 'Borders', 'Number formats'] },
  { id: 'formulas', copy: 'ref_group_formulas', label: 'Formulas', categories: ['Formulas and fill'] },
  { id: 'ribbon', copy: 'ref_group_ribbon', label: 'The Ribbon', categories: ['Ribbon'] },
  { id: 'data', copy: 'ref_group_data', label: 'Data', categories: ['Data and outline'] },
];
/** The four states of a key (3.0), in order of progress. */
export const KEY_STATES = ['not-yet', 'taught', 'practiced', 'under-par'];
const STATE_COPY = { 'not-yet': ['ref_state_not_yet', 'Not yet'], taught: ['ref_state_taught', 'Taught'], practiced: ['ref_state_practiced', 'Practiced'], 'under-par': ['ref_state_under_par', 'Under par'] };

/**
 * The rows of the page from the reference: the native entries gathered by group, and a Ribbon
 * route folded into the key it repeats (an entry whose name ends "(Ribbon)" with the same concept
 * as another entry in the group becomes that entry's second row of keycaps). Pure.
 */
export function groupRows(reference, groups = REFERENCE_GROUPS) {
  return groups.map(g => {
    const entries = reference.filter(e => !e.addin && g.categories.includes(e.category));
    const rows = [];
    for (const e of entries) {
      const ribbon = /\(Ribbon\)$/.test(e.name);
      const stem = ribbon ? e.name.replace(/\s*\(Ribbon\)$/, '').toLowerCase() : '';
      // the route folds into the key that does the same thing: same concept, or the same name before "(Ribbon)"
      const host = ribbon ? rows.find(r => !/\(Ribbon\)$/.test(r.entry.name) && !r.ribbon && ((e.concept && r.entry.concept === e.concept) || r.entry.name.toLowerCase().startsWith(stem))) : null;
      if (host) host.ribbon = e; else rows.push({ entry: e, ribbon: null });
    }
    return { ...g, rows };
  }).filter(g => g.rows.length);
}

/**
 * A key's state for this learner. Pure.
 *   done: the completed lesson ids; practiced: concept ids with a rep noted; underPar: concept ids under par
 *   under-par > practiced > taught (the lesson that teaches it is complete) > not-yet
 */
export function keyState(entry, { done = new Set(), practiced = new Set(), underPar = new Set() } = {}) {
  const c = entry && entry.concept;
  if (c && underPar.has(c)) return 'under-par';
  if (c && practiced.has(c)) return 'practiced';
  if (entry && entry.lessonId && done.has(entry.lessonId)) return 'taught';
  return 'not-yet';
}
/** The keys collected: every row past Not yet. Pure. */
export function collectedCount(rows, ctx) { return rows.filter(r => keyState(r.entry, ctx) !== 'not-yet').length; }

/** The learner's key context from the records: the lessons done and the concepts the schedule has reps for. */
export function learnerKeyContext() {
  const done = new Set(), practiced = new Set(), underPar = new Set();
  try { const all = store.all(); for (const id in all) if (all[id] && all[id].completed) done.add(id); } catch (e) { /* no records */ }
  try {
    const st = schedule.state();
    for (const id in st) { const it = st[id]; if (it && it.reps > 0) practiced.add(id); if (it && it.reps > 0 && it.q >= 5) underPar.add(id); }
  } catch (e) { /* no schedule */ }
  return { done, practiced, underPar };
}

/** Keycaps for one chord: held keys joined with +, alternatives with /, sequence segments side by side. */
export function chordHtml(chord, parseChord) {
  // the four arrows as alternatives read as one key, the way the cluster sits under your hand
  const alts = key => (key.length === 4 && ['↑', '↓', '←', '→'].every(k => key.includes(k)) ? '<kbd class="key key-arrows">↑ ↓ ← →</kbd>' : key.map(k => `<kbd class="key">${esc(k)}</kbd>`).join('<span class="chord-alt">/</span>'));
  return parseChord(chord).map(seg => `<span class="chord">${seg.map(alts).join('<span class="chord-plus">+</span>')}</span>`).join('');
}

const normQuery = s => String(s || '').toLowerCase().replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
const MAC_SHORT = { '⌘': 'cmd', '⌥': 'opt', '⇧': 'shift', '⌃': 'ctrl' };
const MAC_LONG = { '⌘': 'command', '⌥': 'option', '⇧': 'shift', '⌃': 'control' };
const glyphs = (s, map) => String(s).replace(/[⌘⌥⇧⌃]/g, g => ' ' + map[g] + ' ');
/** What the search box matches against: names, descriptions, both chords in typed-out forms, the lesson. */
export function searchText(e, lesson) {
  return normQuery([e.name, e.what, e.note, e.category, e.win, e.mac, glyphs(e.mac, MAC_SHORT), glyphs(e.mac, MAC_LONG), e.macNote, e.addin,
    lesson ? `lesson ${lessonNumber(lesson.id)} lesson ${lessonNumberOf(lesson)} ${lesson.title}` : (e.addin ? 'add-in' : 'coming soon')].filter(Boolean).join(' '));
}
/** '1.2.3' for a module lesson, else its catalog position. */
function lessonNumberOf(lesson) { try { return itemNumber(lesson, moduleOf(lesson)) || ''; } catch (e) { return ''; } }
/** '1.2' from '1.2.3': the lesson's module, which is what the Taught in column shows. */
export const taughtIn = num => String(num || '').split('.').slice(0, 2).join('.');

const isEditable = tg => !!tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT' || tg.isContentEditable);

export function mountReferencePage(root, opts = {}) {
  const load = opts.load || (() => import('../content/reference.js'));
  const el = document.createElement('div');
  el.className = 'page reference';
  root.appendChild(el);
  let platform = (() => { try { return settings.get().keyLabels || detectPlatform(); } catch (e) { return detectPlatform(); } })();
  let data = null, groups = [], rows = [];   // rows: { entry, ribbon, el, hay, state }
  let search = null, foot = null, disposed = false;
  const ctxOf = () => learnerKeyContext();

  async function boot() {
    el.innerHTML = `<h1 class="h-title">${esc(t('ref_title', 'Reference'))}</h1><p class="body ink-2">${esc(t('ref_loading', 'Loading the keys.'))}</p>`;
    try {
      const mod = await load();
      if (disposed) return;
      if (!mod || !Array.isArray(mod.REFERENCE) || !mod.REFERENCE.length || typeof mod.parseChord !== 'function') throw new Error('the reference data is empty or malformed');
      data = mod; render();
    } catch (err) { if (!disposed) renderError(err); }
  }
  function renderError(err) {
    el.innerHTML = `<h1 class="h-title">${esc(t('ref_title', 'Reference'))}</h1><section class="panel" role="alert"><p class="body">${esc(t('ref_failed', 'The keys didn’t load.'))}</p><p class="fine">${esc(err && err.message ? err.message : err)}</p><div class="btn-row"><button class="btn btn-primary" type="button" id="refRetry">${esc(t('retry', 'Retry'))}</button></div></section>`;
    el.querySelector('#refRetry').onclick = () => boot();
  }

  function keysHtml(e) { return chordHtml(platform === 'mac' ? e.mac : e.win, data.parseChord); }
  function stateWord(state) { return esc(t(STATE_COPY[state][0], STATE_COPY[state][1])); }
  function rowHtml(r, ctx, g) {
    const e = r.entry;
    const lesson = e.lessonId ? lessonById(e.lessonId) : null;
    const num = lesson ? taughtIn(lessonNumberOf(lesson)) : '';
    const state = keyState(e, ctx);
    return `<tr class="kr-row" data-id="${esc(e.id)}" data-g="${g.id}" data-cursor data-cursor-enter="a.kr-lesson" data-state="${state}" tabindex="-1">
      <td class="kr-keys">${keysHtml(e)}${r.ribbon ? `<span class="kr-or label">${esc(t('ref_or', 'or'))}</span>${keysHtml(r.ribbon)}` : ''}</td>
      <td class="kr-what">${esc(e.name)}</td>
      <td class="num mono">${lesson ? `<a class="kr-lesson" href="#/lesson/${esc(lesson.id)}" tabindex="-1">${esc(num)}</a>` : ''}</td>
      <td class="kr-state" data-state="${state}"><i class="kr-dot" aria-hidden="true"></i>${stateWord(state)}</td></tr>`;
  }
  /** The board's colours: each key the course uses takes the group that uses it most, filled when any of its shortcuts is collected. */
  function boardMarks(ctx) {
    const tally = {};
    for (const g of groups) for (const r of g.rows) {
      const got = keyState(r.entry, ctx) !== 'not-yet';
      for (const id of keysTouched(r.entry.win, data.parseChord)) {
        if (['Ctrl', 'Shift', 'Alt'].includes(id)) continue;
        const m = tally[id] || (tally[id] = { by: {}, on: false });
        m.by[g.id] = (m.by[g.id] || 0) + 1; if (got) m.on = true;
      }
    }
    const marks = {};
    for (const id in tally) { const by = tally[id].by; marks[id] = { g: Object.keys(by).sort((a, b) => by[b] - by[a])[0], on: tally[id].on }; }
    return marks;
  }
  function focusHtml(r, ctx) {
    if (!r) return `<div class="kr-focus-empty"><div><div class="kr-focus-try" aria-hidden="true"><kbd class="key">Ctrl</kbd><span class="chord-plus">+</span><kbd class="key">?</kbd></div><p class="kr-focus-hint">${esc(t('ref_board_hint', 'Press any shortcut with Ctrl, or a function key, to find it here. Or point at a row.'))}</p></div></div>`;
    const e = r.entry;
    const lesson = e.lessonId ? lessonById(e.lessonId) : null;
    const state = keyState(e, ctx);
    const g = groups.find(x => x.rows.includes(r) || x.rows.some(y => y.entry === e)) || groups[0];
    const drill = e.concept && MICRO[e.concept] && state !== 'not-yet' ? `<a class="btn2 btn2-quiet" href="#/due/${esc(e.concept)}">${esc(t('ref_drill_it', 'Drill it'))}</a>` : '';
    const open = lesson ? `<a class="btn2" href="#/lesson/${esc(lesson.id)}">${esc(fill(t('ref_open_lesson', 'Lesson {n}'), { n: taughtIn(lessonNumberOf(lesson)) }))}</a>` : '';
    return `<div class="kr-focus-card" data-g="${g.id}">
      <span class="kr-focus-group">${esc(t(g.copy, g.label))}</span>
      <div class="kr-focus-keys">${keysHtml(e)}</div>
      ${r.ribbon ? `<div class="kr-focus-or"><span class="label">${esc(t('ref_or', 'or'))}</span>${keysHtml(r.ribbon)}</div>` : ''}
      <h2 class="kr-focus-name">${esc(e.name)}</h2>
      ${e.what && e.what !== e.name ? `<p class="kr-focus-what">${esc(e.what)}</p>` : ''}
      ${e.note && e.note !== 'Windows only' ? `<p class="kr-focus-note">${esc(e.note)}</p>` : ''}
      <div class="kr-focus-foot"><span class="kr-state" data-state="${state}"><i class="kr-dot" aria-hidden="true"></i>${stateWord(state)}</span><span class="btn-row">${open}${drill}</span></div>
    </div>`;
  }
  function render() {
    const ctx = ctxOf();
    groups = groupRows(data.REFERENCE);
    const all = groups.flatMap(g => g.rows);
    const legend = groups.map(g => { const got = g.rows.filter(r => keyState(r.entry, ctx) !== 'not-yet').length; return `<a class="kr-leg" data-g="${g.id}" href="#/reference" data-jump="${g.id}"><i class="kr-sw" aria-hidden="true"></i><span>${esc(t(g.copy, g.label))}</span><span class="kr-leg-n">${got}/${g.rows.length}</span></a>`; }).join('');
    el.innerHTML = `<div class="h-row h-row-title">
        <h1 class="h-title">${esc(t('ref_title', 'Reference'))}</h1>
        <div class="h-tools">
          <label class="search"><input id="refSearch" type="text" placeholder="${esc(t('ref_search', 'Search the keys'))}" aria-label="${esc(t('ref_search', 'Search the keys'))}" autocomplete="off" spellcheck="false"><kbd class="key" aria-hidden="true">/</kbd></label>
          <div class="seg" role="radiogroup" aria-label="${esc(t('setting_keyLabels', 'Key labels'))}"><button type="button" class="seg-btn" role="radio" data-plat="win">${esc(t('setting_keyLabels_win', 'Windows'))}</button><button type="button" class="seg-btn" role="radio" data-plat="mac">${esc(t('setting_keyLabels_mac', 'Mac'))}</button></div>
        </div></div>
      <section class="panel kr-board" aria-label="${esc(t('ref_board', 'The keyboard'))}">
        <div class="kr-board-main">${keyboardHtml({ marks: boardMarks(ctx) })}<div class="kr-legend">${legend}<span class="kr-leg-key"><i class="kb-key kb-used" aria-hidden="true"></i>${esc(t('ref_leg_open', 'Not yet'))}<i class="kb-key kb-used kb-on" aria-hidden="true"></i>${esc(t('ref_leg_got', 'Yours'))}</span></div></div>
        <div class="kr-focus" id="refFocus" aria-live="polite">${focusHtml(null, ctx)}</div>
      </section>
      <div class="kr-grid" id="refGrid">${groups.map(g => `<section class="panel kr-group" data-group="${g.id}" data-g="${g.id}" id="ref-${g.id}"><div class="panel-head"><h2 class="panel-h"><i class="kr-sw" aria-hidden="true"></i>${esc(t(g.copy, g.label))}</h2><span class="panel-facts">${esc(fill(t('ref_group_count', '{n} keys'), { n: g.rows.length }))}</span></div>
        <table class="tbl kr-tbl"><tbody>${g.rows.map(r => rowHtml(r, ctx, g)).join('')}</tbody></table></section>`).join('')}</div>
      <p class="body ink-2 kr-empty" id="refEmpty" hidden>${esc(t('ref_no_match', 'No key matches that.'))}</p>
      <p class="fine" id="refFoot"></p>`;
    rows = [];
    for (const g of groups) for (const r of g.rows) { const rowEl = el.querySelector(`.kr-row[data-id="${CSS.escape(r.entry.id)}"]`); rows.push({ ...r, el: rowEl, g, hay: searchText(r.entry, r.entry.lessonId ? lessonById(r.entry.lessonId) : null) + (r.ribbon ? ' ' + searchText(r.ribbon, null) : ''), ids: keyIdsOf(r.entry.win, data.parseChord).concat(r.ribbon ? keyIdsOf(r.ribbon.win, data.parseChord) : []) }); }
    search = el.querySelector('#refSearch'); foot = el.querySelector('#refFoot');
    foot.textContent = fill(t('ref_collected', '{n} of {m} keys collected.'), { n: collectedCount(all, ctx), m: all.length }) + ' ' + t('ref_drill_note', 'Drill it opens a short rep on that one key.');
    applyPlatform(); apply();
  }
  let shown = null, only = null;
  /** Show a row in the card and press its keys on the board. */
  function show(r, pressed) {
    shown = r;
    const box = el.querySelector('#refFocus'); if (box) box.innerHTML = focusHtml(r, ctxOf());
    el.querySelectorAll('.kb-key.kb-down').forEach(k => { k.classList.remove('kb-down'); if (k.dataset.g0 != null) { if (k.dataset.g0) k.setAttribute('data-g', k.dataset.g0); else k.removeAttribute('data-g'); delete k.dataset.g0; } });
    const ids = pressed || (r && r.ids[0]) || new Set();
    // a pressed key takes the colour of the row that pressed it, and gives its own back when released
    for (const id of ids) el.querySelectorAll(`.kr-board .kb-key[data-k="${CSS.escape(id)}"]`).forEach(k => { k.classList.add('kb-down'); if (r) { k.dataset.g0 = k.getAttribute('data-g') || ''; k.setAttribute('data-g', r.g.id); } });
    el.querySelectorAll('.kr-row.kr-lit').forEach(x => x.classList.remove('kr-lit'));
    if (r && r.el) r.el.classList.add('kr-lit');
  }
  function applyPlatform() {
    el.querySelectorAll('[data-plat]').forEach(b => { const on = b.dataset.plat === platform; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
    for (const r of rows) r.el.querySelector('.kr-keys').innerHTML = keysHtml(r.entry) + (r.ribbon ? `<span class="kr-or label">${esc(t('ref_or', 'or'))}</span>${keysHtml(r.ribbon)}` : '');
    if (shown) show(shown);
  }
  function setPlatform(p) { if (p !== 'win' && p !== 'mac') return; platform = p; try { settings.set({ keyLabels: p }); } catch (e) { /* storage blocked */ } applyPlatform(); }
  function apply() {
    const q = only ? '' : normQuery(search.value);
    let count = 0;
    for (const g of groups) {
      let any = false;
      for (const r of rows.filter(x => x.g === g)) { const hit = only ? only.has(r) : (!q || r.hay.includes(q)); r.el.hidden = !hit; if (hit) { any = true; count++; } }
      const sec = el.querySelector(`.kr-group[data-group="${g.id}"]`); if (sec) sec.hidden = !any;
    }
    const empty = el.querySelector('#refEmpty'); if (empty) empty.hidden = count > 0;
    if (opts.cursor && opts.cursor.refresh) opts.cursor.refresh();
  }
  /** A real press: find every row whose keys are the keys pressed. */
  function lookup(ids) {
    const hits = rows.filter(r => r.ids.some(set => sameKeys(set, ids)));
    only = new Set(hits); search.value = chordLabel(ids); apply();
    if (hits.length) show(hits[0], ids);
    else { show(null, ids); const box = el.querySelector('#refFocus'); if (box) box.innerHTML = `<div class="kr-focus-empty"><p class="kr-focus-hint">${esc(fill(t('ref_no_key', 'Nothing in the course uses {k} yet.'), { k: chordLabel(ids) }))}</p></div>`; }
  }
  const rowOf = target => { const tr = target && target.closest && target.closest('.kr-row'); return tr ? rows.find(r => r.el === tr) : null; };
  const onOver = e => { const r = rowOf(e.target); if (r && r !== shown) show(r); };
  const onFocusIn = e => { const r = rowOf(e.target); if (r) show(r); };
  const onClick = e => {
    const b = e.target.closest('[data-plat]'); if (b) { setPlatform(b.dataset.plat); return; }
    const j = e.target.closest('[data-jump]'); if (j) { e.preventDefault(); const sec = el.querySelector('#ref-' + j.dataset.jump); if (sec) sec.scrollIntoView({ block: 'start' }); const first = rows.find(r => r.g.id === j.dataset.jump && !r.el.hidden); if (first) show(first); }
  };
  const onInput = e => { if (e.target === search) { only = null; apply(); } };
  const onKey = e => {
    if (!data) return;
    if (e.target === search) {
      if (e.key === 'Escape') { e.preventDefault(); search.value = ''; only = null; apply(); }
      else if (e.key === 'ArrowDown' || e.key === 'Enter') { const first = rows.find(r => !r.el.hidden); if (first) { e.preventDefault(); first.el.focus(); } }
    }
  };
  // "/" from anywhere on the page (not inside a text field) jumps to the search box; a shortcut pressed
  // anywhere on the page (Ctrl, or Cmd on a Mac, or a function key) is looked up; Esc clears the lookup
  const onWindowKey = e => {
    if (e.defaultPrevented || isEditable(e.target) || !search || !document.body.contains(el) || !data) return;
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); search.focus(); search.select(); return; }
    if (e.key === 'Escape' && only) { e.preventDefault(); only = null; search.value = ''; apply(); show(null); return; }
    if (['Control', 'Shift', 'Meta', 'Alt'].includes(e.key)) return;
    const ids = chordOfEvent(e, platform);
    if (ids) { e.preventDefault(); lookup(ids); }
  };
  el.addEventListener('click', onClick); el.addEventListener('input', onInput); el.addEventListener('keydown', onKey);
  el.addEventListener('mouseover', onOver); el.addEventListener('focusin', onFocusIn);
  window.addEventListener('keydown', onWindowKey);
  const ready = boot();
  return { ready, get platform() { return platform; },
    destroy() { disposed = true; window.removeEventListener('keydown', onWindowKey); el.removeEventListener('click', onClick); el.removeEventListener('input', onInput); el.removeEventListener('keydown', onKey); el.removeEventListener('mouseover', onOver); el.removeEventListener('focusin', onFocusIn); el.remove(); } };
}
