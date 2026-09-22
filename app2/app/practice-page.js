// app2/app/practice-page.js — Practice (SITE_SPEC §5): timed drills with pars, the Daily and
// rapid-fire arrive with the game layer (Phase D); today it offers the Sandbox and timed runs on
// lessons already completed. Honest about what is not here yet.
import { LESSONS, lessonNumber } from '../content/index.js';
import { store } from './store.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mountPracticePage(root) {
  const el = document.createElement('div');
  el.className = 'page practice';
  const all = store.all();
  const done = LESSONS.filter(l => all[l.id] && all[l.id].completed);
  el.innerHTML = `<div class="page-head"><h1>Practice</h1><p class="page-sub">Timed play is the layer you graduate into. Reading time is free; the clock starts on your first key press.</p></div>
    <div class="practice-grid">
      <section class="pcard pcard-now">
        <div class="pcard-cap"><span>sandbox</span><span class="pcard-tag on">open now</span></div>
        <div class="pcard-body">
          <h2>A free sheet</h2>
          <p>The full workspace with nothing graded: try a shortcut, walk the Ribbon with <kbd>Alt</kbd>, build a small table. The drill layout you will use for timed runs.</p>
          <a class="btn btn-primary" href="#/drill/sandbox">Open the sandbox</a>
        </div>
      </section>
      <section class="pcard pcard-now">
        <div class="pcard-cap"><span>timed runs</span><span class="pcard-tag on">open now</span></div>
        <div class="pcard-body">
          <h2>Lessons you have completed, against the clock</h2>
          ${done.length ? `<ul class="plain-list">${done.map(l => `<li><a href="#/lesson/${esc(l.id)}?mode=timed">${lessonNumber(l.id)}. ${esc(l.title)}</a><span class="muted">${all[l.id].best != null ? 'best ' + all[l.id].best + ' s' : 'no time yet'}</span></li>`).join('')}</ul>`
            : `<p>Complete a lesson first; it then appears here with a Timed option. <a href="#/learn">Open the catalog</a>.</p>`}
        </div>
      </section>
      <section class="pcard">
        <div class="pcard-cap"><span>timed drills</span><span class="pcard-tag">arrives with timed play</span></div>
        <div class="pcard-body"><h2>Drills with pars</h2><p>Every drill carries pass, pro and legendary par times, personal bests, and a board. Free on Chapter 1 content; paid chapters add theirs.</p></div>
      </section>
      <section class="pcard">
        <div class="pcard-cap"><span>the daily</span><span class="pcard-tag">arrives with timed play</span></div>
        <div class="pcard-body"><h2>One drill a day, same for everyone</h2><p>Free for everyone. The streak is optional, counts practice days, and never takes anything away.</p></div>
      </section>
      <section class="pcard">
        <div class="pcard-cap"><span>rapid-fire</span><span class="pcard-tag">arrives with timed play</span></div>
        <div class="pcard-body"><h2>One shortcut at a time</h2><p>A timed run of single commands on the sheet, for building recall once the lessons have taught them.</p></div>
      </section>
    </div>
    <p class="page-fine">Rules for timed play (SITE_SPEC §6): any help or mouse use on the workspace in a timed run means no personal best and no board entry. Page controls like Start and Retry never count.</p>`;
  root.appendChild(el);
  return { destroy() { el.remove(); } };
}
