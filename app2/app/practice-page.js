// app2/app/practice-page.js — Practice (SITE_SPEC §5): the drill list with pars, personal bests
// and best tiers; the Daily; rapid-fire; the sandbox; timed runs on completed lessons. The paid
// chapters' drills arrive with their chapters.
import { LESSONS, lessonNumber } from '../content/index.js';
import { DRILLS } from '../content/drills.js';
import { store } from './store.js';
import { dailyFor } from './daily.js';
import { dayOf } from './records.js';
import { tierAtLeast } from './pars.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TIER_LABEL = { pass: 'pass', pro: 'pro', legendary: 'legendary' };

/** The best clean tier this player holds on a drill, from the attempts. */
export function bestTier(attempts) {
  let best = 'none';
  for (const a of attempts) if (tierAtLeast(a.tier, best) && a.tier !== best) best = a.tier;
  return best;
}

export function mountPracticePage(root) {
  const el = document.createElement('div');
  el.className = 'page practice';
  const all = store.all();
  const done = LESSONS.filter(l => all[l.id] && all[l.id].completed);
  const day = dayOf();
  const daily = dailyFor(day);
  const dailyDrill = DRILLS.find(d => d.id === daily.drillId);
  const dailyDone = store.attempts({ kind: 'daily', day }).length;

  const rows = DRILLS.map(d => {
    const pb = store.pb(d.id);
    const tier = bestTier(store.attempts({ ref: d.id }));
    return `<a class="drow" href="#/drill/${esc(d.id)}">
      <span class="dt"><b>${esc(d.title)}${d.benchmark ? ' <span class="muted">· benchmark</span>' : ''}</b><span>${esc(d.task)}</span></span>
      <span class="dpars">${d.pars.pass} / ${d.pars.pro} / ${d.pars.legendary}s</span>
      <span class="dtier ${tier !== 'none' ? 't-' + tier : ''}">${tier !== 'none' ? TIER_LABEL[tier] : '—'}</span>
      <span class="dpb">${pb ? 'best ' + pb.secs.toFixed(1) + 's' : 'no time'}</span>
    </a>`;
  }).join('');

  el.innerHTML = `<div class="page-head"><h1>Practice</h1><p class="page-sub">Timed play is the layer you graduate into. The clock starts on your first key; help or mouse means no personal best and no posted time.</p></div>
    <div class="practice-grid">
      <section class="pcard pcard-now" style="grid-column:1 / -1">
        <div class="pcard-cap"><span>timed drills</span><span class="pcard-tag on">pass / pro / legendary</span></div>
        <div class="pcard-body">
          <div class="drill-list">${rows}</div>
        </div>
      </section>
      <section class="pcard pcard-now">
        <div class="pcard-cap"><span>the daily</span><span class="pcard-tag on">${dailyDone ? dailyDone + ' attempt' + (dailyDone === 1 ? '' : 's') + ' today' : 'open now'}</span></div>
        <div class="pcard-body">
          <h2>One drill a day, same for everyone</h2>
          <p>Today: <b>${esc(dailyDrill ? dailyDrill.title : '—')}</b>. Fresh figures every day where the drill carries them; the streak counts practice days and never takes anything away.</p>
          <a class="btn btn-primary" href="#/daily">Play the Daily</a>
        </div>
      </section>
      <section class="pcard pcard-now">
        <div class="pcard-cap"><span>rapid-fire</span><span class="pcard-tag on">open now</span></div>
        <div class="pcard-body">
          <h2>One shortcut at a time</h2>
          <p>30, 60 or 120 seconds of single chords on a live sheet. Hits build a combo; the keys stay hidden until you stall. Recall is the game.</p>
          <a class="btn" href="#/rapid">Start a round</a>
        </div>
      </section>
      <section class="pcard pcard-now">
        <div class="pcard-cap"><span>sandbox</span><span class="pcard-tag on">open now</span></div>
        <div class="pcard-body">
          <h2>A free sheet</h2>
          <p>The full workspace with nothing graded: try a shortcut, walk the Ribbon with <kbd>Alt</kbd>, build a small table.</p>
          <a class="btn" href="#/drill/sandbox">Open the sandbox</a>
        </div>
      </section>
      <section class="pcard pcard-now">
        <div class="pcard-cap"><span>timed runs</span><span class="pcard-tag on">lessons against the clock</span></div>
        <div class="pcard-body">
          ${done.length ? `<ul class="plain-list">${done.slice(0, 10).map(l => `<li><a href="#/lesson/${esc(l.id)}?mode=timed">${lessonNumber(l.id)}. ${esc(l.title)}</a><span class="muted">${all[l.id].best != null ? 'best ' + all[l.id].best + ' s' : 'no time yet'}</span></li>`).join('')}${done.length > 10 ? `<li><span class="muted">…and ${done.length - 10} more from the</span> <a href="#/learn">catalog</a></li>` : ''}</ul>`
            : `<h2>Lessons you have completed, against the clock</h2><p>Complete a lesson first; it then appears here with a Timed option. <a href="#/learn">Open the catalog</a>.</p>`}
        </div>
      </section>
    </div>
    <p class="page-fine">Rules for timed play (SITE_SPEC §6): any help or mouse use on the workspace in a timed run means no personal best and no board entry. Page controls like Start and Retry never count.</p>`;
  root.appendChild(el);
  return { destroy() { el.remove(); } };
}
