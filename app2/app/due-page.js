// app2/app/due-page.js — the #/due/<shortcut> route: a refresher rep from today's queue
// (app/schedule.js), mounted in the lesson workspace as a micro lesson (no record, no XP, one
// memory note). Home's Today row "Run your {n} refreshers" opens the first one; the lesson's
// complete panel offers the next. An id that is not in today's queue shows a way home instead.
import { microLesson } from './schedule.js';
import { mountLessonView } from './lesson-view.js';
import { siteCopy } from '../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mountDuePage(root, ctx = {}) {
  const id = ctx.params && ctx.params.id;
  const lesson = microLesson(id);
  if (!lesson) {
    root.innerHTML = `<div class="nf-card"><div class="nf-body"><h1>${esc(siteCopy('due_none_title', 'Nothing to drill here.'))}</h1><p>${esc(siteCopy('due_none_body', 'That item is not in today’s queue.'))}</p><div class="nf-row"><a class="btn btn-primary" href="#/">${esc(siteCopy('rail_home', 'Home'))}</a></div></div></div>`;
    return { destroy() { root.innerHTML = ''; } };
  }
  return mountLessonView(root, lesson, { mode: 'guided' });
}
