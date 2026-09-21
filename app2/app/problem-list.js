// app2/app/problem-list.js — the LeetCode-style list: chapter, difficulty, status, tags, free/paid.
import { CHAPTERS, lessonNumber } from '../content/index.js';
import { progress } from './progress.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const STATUS = { todo: ['Todo', 'st-todo'], started: ['Started', 'st-started'], done: ['Done', 'st-done'], mastered: ['Mastered', 'st-mastered'] };

export function mountProblemList(root) {
  const el = document.createElement('div');
  el.className = 'plist';
  const all = progress.all();
  const doneCount = Object.values(all).filter(p => p.completed).length;
  let html = `<div class="plist-head"><h1>Lessons</h1><p class="plist-sub">Excel, from the first cell up. Keyboard only. Your progress stays in this browser — no account needed.</p>
    <p class="plist-stat"><b>${doneCount}</b> of <b>${CHAPTERS.reduce((n, c) => n + c.lessons.length, 0)}</b> done</p></div>`;
  for (const ch of CHAPTERS) {
    html += `<section class="chapter"><h2>${esc(ch.title)}</h2><p class="chapter-blurb">${esc(ch.blurb)}</p>
      <table class="ptable"><thead><tr><th class="c-num">#</th><th class="c-status">Status</th><th class="c-title">Title</th><th class="c-diff">Difficulty</th><th class="c-tags">Tags</th><th class="c-access">Access</th></tr></thead><tbody>`;
    for (const l of ch.lessons) {
      const st = progress.status(l.id); const [label, cls] = STATUS[st] || STATUS.todo;
      const p = progress.get(l.id);
      html += `<tr class="prow" data-id="${esc(l.id)}" tabindex="0">
        <td class="c-num">${lessonNumber(l.id)}</td>
        <td class="c-status"><span class="st ${cls}" title="${p && p.best != null ? 'best ' + p.best + ' s' : ''}">${label}</span></td>
        <td class="c-title"><a href="#/lesson/${esc(l.id)}">${esc(l.title)}</a></td>
        <td class="c-diff"><span class="diff diff-${esc(l.difficulty)}">${esc(l.difficulty)}</span></td>
        <td class="c-tags">${l.tags.map(t => `<span class="tag">${esc(t)}</span>`).join(' ')}</td>
        <td class="c-access"><span class="access access-${esc(l.access)}">${l.access === 'free' ? 'Free' : 'Pro'}</span></td></tr>`;
    }
    html += '</tbody></table></section>';
  }
  el.innerHTML = html;
  el.addEventListener('click', e => { const row = e.target.closest('.prow'); if (row && !e.target.closest('a')) location.hash = '#/lesson/' + row.dataset.id; });
  el.addEventListener('keydown', e => { const row = e.target.closest('.prow'); if (row && e.key === 'Enter') location.hash = '#/lesson/' + row.dataset.id; });
  root.appendChild(el);
  return { destroy() { el.remove(); } };
}
