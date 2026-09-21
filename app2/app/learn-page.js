// app2/app/learn-page.js — the Learn catalog (SITE_SPEC §2): six chapters, sections inside
// Chapter 1, per-lesson status / difficulty / tags / access, filters, search, "next up", and
// full keyboard navigation (`/` focuses search, arrows move through lessons, Enter opens).
// The pure helpers (statusOf, pickNextLesson, matchesFilters) are shared with Home and tested.
import { CHAPTERS, LESSONS, lessonNumber, sectionsOf } from '../content/index.js';
import { progress } from './progress.js';
import { prefs } from './prefs.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The six chapters of SITE_SPEC §7. Chapter 1 is content/index.js; the rest are planned. */
export const CHAPTER_PLAN = [
  { id: 'foundations', n: 1, title: 'Foundations', access: 'free',
    line: 'The worksheet and the active cell, moving, selecting, entering and editing, the Ribbon and dialog boxes, basic formatting, basic formulas, copy, paste and fill.' },
  { id: 'formatting', n: 2, title: 'Formatting and presentation', access: 'paid',
    line: 'Number formats, fonts, borders and fills, alignment, column widths and cell styles: a report that reads cleanly.' },
  { id: 'formulas', n: 3, title: 'Formulas and functions', access: 'paid',
    line: 'Relative and absolute references, SUM, AVERAGE, IF, text and date functions, and how to audit a formula.' },
  { id: 'data', n: 4, title: 'Data and analysis', access: 'paid',
    line: 'Lists, sort and filter, lookups and summaries: the questions a manager asks of a table.' },
  { id: 'modeling', n: 5, title: 'Financial modeling', access: 'paid',
    line: 'Schedules, the three statements, linking them together, and auditing a model.' },
  { id: 'valuation', n: 6, title: 'Valuation and deals', access: 'paid',
    line: 'DCF, comps, LBO and waterfalls, built the way a deal team builds them.' },
];

export const STATUS_LABEL = { todo: ['Todo', 'st-todo'], started: ['Started', 'st-started'], done: ['Done', 'st-done'], mastered: ['Mastered', 'st-mastered'], skipped: ['Skipped', 'st-skipped'] };
export const ACCESS_LABEL = { free: 'Free', paid: 'Paid', sample: 'Sample' };

/**
 * A lesson's catalog status from the progress map and the skipped list. Completed always wins
 * over skipped (skipped is not completed; completing a skipped lesson clears the mark visually).
 * Pure.
 */
export function statusOf(id, all, skipped) {
  const p = all && all[id];
  if (p && (p.timed || p.solo)) return 'mastered';
  if (p && p.completed) return 'done';
  if (skipped && skipped.includes(id)) return 'skipped';
  if (p && p.started) return 'started';
  return 'todo';
}

/** The first lesson in catalog order that is neither completed nor skipped; null when none is left. Pure. */
export function pickNextLesson(lessons, all, skipped) {
  for (const l of lessons) { const s = statusOf(l.id, all, skipped); if (s !== 'done' && s !== 'mastered' && s !== 'skipped') return l; }
  return null;
}

/** Does a lesson pass the catalog's filters? `f` = { q, status, difficulty, access }; empty/'all' means no filter. Pure. */
export function matchesFilters(lesson, status, f) {
  const q = String(f.q || '').trim().toLowerCase();
  if (f.status && f.status !== 'all' && status !== f.status) return false;
  if (f.difficulty && f.difficulty !== 'all' && lesson.difficulty !== f.difficulty) return false;
  if (f.access && f.access !== 'all' && (lesson.access || 'free') !== f.access) return false;
  if (q) {
    const hay = [lesson.title, lesson.section || '', ...(lesson.tags || []), ...(lesson.concepts || [])].join(' ').toLowerCase();
    if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
  }
  return true;
}

/** Group a chapter's lessons by `section` (in first-seen order), falling back to "Basics". Pure. */
export function groupBySection(lessons) {
  const out = []; const idx = {};
  for (const l of lessons) {
    const name = l.section || 'Basics';
    if (idx[name] == null) { idx[name] = out.length; out.push({ name, lessons: [] }); }
    out[idx[name]].lessons.push(l);
  }
  return out;
}

export function mountLearnPage(root) {
  const el = document.createElement('div');
  el.className = 'plist';
  const filters = { q: '', status: 'all', difficulty: 'all', access: 'all' };
  let focusId = null;   // the lesson row that carries the keyboard focus

  function counts() {
    const all = progress.all(); const skipped = prefs.get().skipped;
    let done = 0; for (const l of LESSONS) { const s = statusOf(l.id, all, skipped); if (s === 'done' || s === 'mastered') done++; }
    return { done, total: LESSONS.length, skipped: LESSONS.filter(l => statusOf(l.id, all, skipped) === 'skipped').length };
  }

  function render() {
    const all = progress.all(); const skipped = prefs.get().skipped;
    const next = pickNextLesson(LESSONS, all, skipped);
    const c = counts();
    let html = `<div class="plist-head"><h1>Learn</h1>
      <p class="plist-sub">Six chapters, from the first cell to a full model. Chapter 1 is free. Your progress is saved on this device.</p>
      <p class="plist-stat"><b>${c.done}</b> of <b>${c.total}</b> lessons done${c.skipped ? ` · <b>${c.skipped}</b> skipped` : ''}${next ? ` · next up: <a href="#/lesson/${esc(next.id)}">${esc(next.title)}</a>` : ' · Chapter 1 complete'}</p></div>`;
    html += `<div class="cat-tools" role="search">
      <label class="cat-search"><span class="vis-hidden">Search lessons</span><input id="catSearch" type="search" placeholder="Search lessons  ( / )" autocomplete="off" value="${esc(filters.q)}"></label>
      <label class="cat-filter">Status <select id="fStatus">${['all', 'todo', 'started', 'done', 'mastered', 'skipped'].map(v => `<option value="${v}"${filters.status === v ? ' selected' : ''}>${v === 'all' ? 'All' : STATUS_LABEL[v][0]}</option>`).join('')}</select></label>
      <label class="cat-filter">Difficulty <select id="fDiff">${['all', 'easy', 'medium', 'hard'].map(v => `<option value="${v}"${filters.difficulty === v ? ' selected' : ''}>${v === 'all' ? 'All' : v[0].toUpperCase() + v.slice(1)}</option>`).join('')}</select></label>
      <label class="cat-filter">Access <select id="fAccess">${['all', 'free', 'paid', 'sample'].map(v => `<option value="${v}"${filters.access === v ? ' selected' : ''}>${v === 'all' ? 'All' : ACCESS_LABEL[v]}</option>`).join('')}</select></label>
      <span class="cat-keys"><kbd>↑</kbd><kbd>↓</kbd> move · <kbd>Enter</kbd> open</span>
    </div>`;
    let shown = 0;
    for (const plan of CHAPTER_PLAN) {
      const ch = CHAPTERS.find(x => x.id === plan.id);
      if (!ch) {
        html += `<section class="chapter chapter-locked"><div class="chapter-row"><h2><span class="chapter-n">Chapter ${plan.n}</span> ${esc(plan.title)}</h2><span class="access access-paid">Paid · coming</span></div><p class="chapter-blurb">${esc(plan.line)}</p></section>`;
        continue;
      }
      html += `<section class="chapter"><div class="chapter-row"><h2><span class="chapter-n">Chapter ${plan.n}</span> ${esc(ch.title)}</h2><span class="access access-free">Free</span></div><p class="chapter-blurb">${esc(ch.blurb)}</p>`;
      for (const sec of (typeof sectionsOf === 'function' ? sectionsOf(ch) : groupBySection(ch.lessons))) {
        const rows = sec.lessons.filter(l => matchesFilters(l, statusOf(l.id, all, skipped), filters));
        if (!rows.length) continue;
        shown += rows.length;
        html += `<h3 class="section-h">${esc(sec.name)}</h3>
          <table class="ptable"><thead><tr><th class="c-num">#</th><th class="c-status">Status</th><th class="c-title">Title</th><th class="c-diff">Difficulty</th><th class="c-tags">Tags</th><th class="c-access">Access</th></tr></thead><tbody>`;
        for (const l of rows) {
          const st = statusOf(l.id, all, skipped); const [label, cls] = STATUS_LABEL[st];
          const p = all[l.id]; const isNext = next && next.id === l.id;
          html += `<tr class="prow${isNext ? ' next-up' : ''}" data-id="${esc(l.id)}" tabindex="-1" aria-label="${esc(l.title)}">
            <td class="c-num">${lessonNumber(l.id)}</td>
            <td class="c-status"><span class="st ${cls}" title="${p && p.best != null ? 'best ' + p.best + ' s' : ''}">${label}</span></td>
            <td class="c-title"><a href="#/lesson/${esc(l.id)}" tabindex="-1">${esc(l.title)}</a>${isNext ? '<span class="next-badge">Next up</span>' : ''}</td>
            <td class="c-diff"><span class="diff diff-${esc(l.difficulty)}">${esc(l.difficulty)}</span></td>
            <td class="c-tags">${(l.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join(' ')}</td>
            <td class="c-access"><span class="access access-${esc(l.access || 'free')}">${ACCESS_LABEL[l.access] || 'Free'}</span></td></tr>`;
        }
        html += '</tbody></table>';
      }
      if (!shown) html += `<div class="cat-empty">No lessons match. <button class="btn btn-ghost" id="catClear" type="button">Clear filters</button></div>`;
      html += '</section>';
    }
    el.innerHTML = html;
    wire();
  }

  function rows() { return [...el.querySelectorAll('.prow')]; }
  /** Move the visible focus to `row`. `remember` keeps it across re-renders (only when the learner chose it). */
  function setFocus(row, viaKeyboard, remember = viaKeyboard) {
    rows().forEach(r => { r.classList.remove('kb-focus'); r.tabIndex = -1; });
    if (!row) return;
    row.tabIndex = 0; row.classList.add('kb-focus');
    if (remember) focusId = row.dataset.id;
    if (viaKeyboard) { row.focus({ preventScroll: true }); row.scrollIntoView({ block: 'nearest' }); }
  }
  function wire() {
    const search = el.querySelector('#catSearch');
    search.oninput = () => { filters.q = search.value; const pos = search.selectionStart; render(); const s2 = el.querySelector('#catSearch'); s2.focus(); try { s2.setSelectionRange(pos, pos); } catch (e) { /* ignore */ } };
    search.onkeydown = e => {
      if (e.key === 'Escape') { e.preventDefault(); if (search.value) { search.value = ''; filters.q = ''; render(); el.querySelector('#catSearch').focus(); } else { const first = rows()[0]; if (first) setFocus(first, true); } }
      if (e.key === 'ArrowDown' || e.key === 'Enter') { const first = el.querySelector('.prow.kb-focus') || rows()[0]; if (first) { e.preventDefault(); setFocus(first, true); } }
    };
    for (const [id, key] of [['fStatus', 'status'], ['fDiff', 'difficulty'], ['fAccess', 'access']]) {
      const sel = el.querySelector('#' + id); sel.onchange = () => { filters[key] = sel.value; render(); el.querySelector('#' + id).focus(); };
    }
    const clear = el.querySelector('#catClear'); if (clear) clear.onclick = () => { Object.assign(filters, { q: '', status: 'all', difficulty: 'all', access: 'all' }); render(); el.querySelector('#catSearch').focus(); };
    const all = rows();
    const keep = all.find(r => r.dataset.id === focusId) || el.querySelector('.prow.next-up') || all[0];
    setFocus(keep, false, false);   // the pick is the page's, not the learner's: not remembered
  }

  function open(id) { location.hash = '#/lesson/' + id; }
  el.addEventListener('click', e => { const row = e.target.closest('.prow'); if (row && !e.target.closest('a')) open(row.dataset.id); });
  el.addEventListener('focusin', e => { const row = e.target.closest('.prow'); if (row) setFocus(row, false); });
  el.addEventListener('keydown', e => {
    const row = e.target.closest('.prow'); if (!row) return;
    const all = rows(); const i = all.indexOf(row);
    if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); setFocus(all[Math.min(all.length - 1, i + 1)], true); }
    else if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); if (i === 0) el.querySelector('#catSearch').focus(); else setFocus(all[i - 1], true); }
    else if (e.key === 'Home') { e.preventDefault(); setFocus(all[0], true); }
    else if (e.key === 'End') { e.preventDefault(); setFocus(all[all.length - 1], true); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(row.dataset.id); }
  });
  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  const onDocKey = e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '/' && !isTyping(e.target)) { e.preventDefault(); const s = el.querySelector('#catSearch'); if (s) { s.focus(); s.select(); } }
  };
  document.addEventListener('keydown', onDocKey);

  render();
  root.appendChild(el);
  return { destroy() { document.removeEventListener('keydown', onDocKey); el.remove(); } };
}
