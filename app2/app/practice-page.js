// app2/app/practice-page.js — Practice (SITE_SPEC §5): the drill list with pars, personal bests
// and best tiers; the Daily; rapid-fire; the sandbox; timed runs on completed lessons. The paid
// chapters' drills arrive with their chapters.
//
// Layout: the drill list (with Timed runs under it) takes two thirds; a rail stacks the Daily,
// Keep sharp, rapid-fire and the sandbox. Each drill names the module that teaches its keys:
// "taught in 1.2" once that module's lessons are done, "after 1.6" until then. Nothing locks.
import { LESSONS, lessonNumber, CHAPTERS, modulesOf, moduleOf } from '../content/index.js';
import { DRILLS } from '../content/drills.js';
import { store } from './store.js';
import { prefs } from './prefs.js';
import { dailyFor } from './daily.js';
import { dayOf } from './records.js';
import { tierAtLeast } from './pars.js';
import { statusOf } from './learn-page.js';
import { moduleNumber, itemNumber } from './numbering.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TIER_LABEL = { pass: 'pass', pro: 'pro', legendary: 'legendary' };
/** How many timed runs the card lists before it hands over to Learn. */
export const RUNS_SHOWN = 10;

/** One unit format for every time on the page: 'best 12.3 s', pars '4 s'. */
export const fmtSecs = n => (Math.round(n * 10) / 10).toFixed(1) + ' s';

/**
 * The module whose lessons teach each drill's keys: the LAST one it leans on (Type the column
 * types figures from 1.3 but ends on AutoSum, taught in 1.6). The module challenges carry their
 * own module. A drill missing here gets no tag; the practice test keeps the map complete.
 */
export const DRILL_MODULE = {
  'edge-jumps': 'move-and-select', 'go-anywhere': 'move-and-select', 'select-blocks': 'move-and-select',
  'find-and-fix': 'enter-edit-copy-fill', 'fill-factory': 'enter-edit-copy-fill', 'paste-surgeon': 'enter-edit-copy-fill',
  'row-wrangler': 'structure',
  'bold-and-borders': 'format', 'format-cells-numbers': 'format',
  'type-the-column': 'formulas', 'formula-sprint': 'formulas', 'weekly-sales-report': 'formulas',
};

/** A drill's teaching module ({ id, n, title, lessons }) or null. */
export function drillModule(drill) {
  const id = (drill && (drill.kind === 'challenge' ? drill.module : DRILL_MODULE[drill.id])) || null;
  const ch1 = CHAPTERS[0];
  const k = id && ch1 ? modulesOf(ch1).findIndex(m => m.id === id) : -1;
  if (k < 0) return null;
  const m = modulesOf(ch1)[k];
  return { id: m.id, n: moduleNumber(m.id, k + 1), title: m.title, lessons: m.lessons };
}

/** Whether a module's lessons are all behind the learner: completed, or skipped by placement. */
export function moduleTaught(mod, all, skipped) {
  if (!mod || !mod.lessons.length) return false;
  return mod.lessons.every(l => { const s = statusOf(l.id, all, skipped); return s === 'done' || s === 'mastered' || s === 'skipped'; });
}

/** A challenge's name as Learn lists it: 'Challenge: find and mark' → 'Find and mark'. */
export const challengeName = t => { const x = String(t || '').replace(/^Challenge:\s*/i, ''); return x.charAt(0).toUpperCase() + x.slice(1); };

/** A lesson's label in a list: its curriculum number and its Learn title ('1.2.3 Around the workbook', '1.1.C Another cluster’s file'). */
export function runLabel(lesson) {
  const n = itemNumber(lesson, moduleOf(lesson)) || String(lessonNumber(lesson.id));
  return { n, title: lesson.kind === 'challenge' ? challengeName(lesson.title) : lesson.title };
}

/** The best clean tier this player holds on a drill, from the attempts. */
export function bestTier(attempts) {
  let best = 'none';
  for (const a of attempts) if (tierAtLeast(a.tier, best) && a.tier !== best) best = a.tier;
  return best;
}

/**
 * The Keep-sharp offer (C2 Run 4): one challenge from a module EARLIER than the learner's current
 * one that has not been passed cleanly in the last 14 days — the earliest such module. Offered,
 * never nagged: null when nothing qualifies (nothing started yet, or every earlier challenge is
 * fresh). `all` is the progress map; `now` an epoch ms or a 'YYYY-MM-DD' day.
 */
export function keepSharp(all, now = Date.now(), attemptsFor = ref => store.attempts({ ref })) {
  const ch1 = CHAPTERS[0]; if (!ch1) return null;
  const mods = modulesOf(ch1).filter(m => m.id !== 'welcome' && m.challenge);
  let current = -1;
  mods.forEach((m, i) => { if (m.lessons.some(l => all[l.id] && (all[l.id].completed || all[l.id].started)) || (all[m.challenge.id] && (all[m.challenge.id].completed || all[m.challenge.id].challenge))) current = i; });
  if (current <= 0) return null;
  const nowMs = typeof now === 'number' ? now : Date.parse(now + 'T00:00:00Z');
  const cutoff = nowMs - 14 * 86400000;
  for (let i = 0; i < current; i++) {
    const m = mods[i];
    const clean = attemptsFor(m.challenge.id).filter(a => a.clean && !a.timedOut && a.secs != null);
    const last = clean.reduce((acc, a) => Math.max(acc, a.at || 0), 0);
    if (last >= cutoff) continue;
    return { module: m, challenge: m.challenge, n: '1.' + (i + 1), last: last || null, days: last ? Math.floor((nowMs - last) / 86400000) : null };
  }
  return null;
}

/** The Timed runs list: the first RUNS_SHOWN completed lessons, then ONE link to the rest in Learn. Pure. */
export function timedRunsHtml(done, all) {
  const items = done.slice(0, RUNS_SHOWN).map(l => {
    const { n, title } = runLabel(l);
    const best = all[l.id] && all[l.id].best != null ? 'best ' + fmtSecs(all[l.id].best) : 'no time yet';
    return `<li><a href="#/lesson/${esc(l.id)}?mode=timed"><span class="pl-n">${esc(n)}</span> ${esc(title)}</a><span class="muted">${best}</span></li>`;
  });
  if (done.length > RUNS_SHOWN) items.push(`<li class="pl-more"><a href="#/learn">See all ${done.length} in Learn</a></li>`);
  return `<ul class="plain-list runs-list">${items.join('')}</ul>`;
}

/** One drill row. `a.drow` is the row's link: its title, stretched over the whole row, so the module tag can be a link of its own. */
function drillRowHtml(d, all, skipped) {
  const pb = store.pb(d.id);
  const tier = bestTier(store.attempts({ ref: d.id }));
  const mod = drillModule(d);
  const taught = moduleTaught(mod, all, skipped);
  const isCh = d.kind === 'challenge';
  const label = isCh && d.lesson ? runLabel(d.lesson) : { n: '', title: d.title };
  const modTag = !mod ? ''
    : taught ? (isCh ? '' : `<a class="dmod" href="#/learn?doc=${esc(mod.id)}" title="Module ${esc(mod.n)} · ${esc(mod.title)}">taught in ${esc(mod.n)}</a>`)
      : `<a class="dmod dmod-later" href="#/learn?doc=${esc(mod.id)}" title="The keys are taught in module ${esc(mod.n)} · ${esc(mod.title)}">after ${esc(mod.n)}</a>`;
  return `<div class="drill-row${taught || !mod ? '' : ' later'}">
      <span class="dt"><span class="dt-line">${label.n ? `<span class="dnum">${esc(label.n)}</span> ` : ''}<a class="drow" href="${isCh ? '#/lesson/' : '#/drill/'}${esc(d.id)}">${esc(label.title)}</a>${isCh ? ' <span class="dflag">challenge</span>' : ''}${d.benchmark ? ' <span class="dflag">benchmark</span>' : ''}${modTag ? ' ' + modTag : ''}</span>
        <span class="dt-task">${esc(d.task)}</span></span>
      <span class="dpar">${d.pars.pass} s</span><span class="dpar">${d.pars.pro} s</span><span class="dpar">${d.pars.legendary} s</span>
      <span class="dtier${tier !== 'none' ? ' t-' + tier : ''}">${tier !== 'none' ? TIER_LABEL[tier] : '<span aria-label="no tier yet">–</span>'}</span>
      <span class="dpb${pb ? '' : ' none'}">${pb ? fmtSecs(pb.secs) : 'no time'}</span>
    </div>`;
}

export function mountPracticePage(root) {
  const el = document.createElement('div');
  el.className = 'page practice';
  const all = store.all();
  const skipped = prefs.get().skipped;
  const done = LESSONS.filter(l => all[l.id] && all[l.id].completed);
  const day = dayOf();
  const daily = dailyFor(day);
  const dailyDrill = DRILLS.find(d => d.id === daily.drillId);
  const dailyDone = store.attempts({ kind: 'daily', day }).length;

  const rows = DRILLS.map(d => drillRowHtml(d, all, skipped)).join('');
  const keep = keepSharp(all, dayOf());
  const keepLabel = keep ? runLabel(keep.challenge) : null;
  el.innerHTML = `<div class="page-head"><h1>Practice</h1><p class="page-sub">Drills against the clock, once the lessons are done. The clock starts on your first key; help or mouse means no personal best and no posted time.</p></div>
    <div class="practice-grid">
      <div class="practice-main">
        <section class="pcard pcard-now pcard-drills">
          <div class="pcard-cap"><span>timed drills</span></div>
          <div class="pcard-body">
            <div class="drill-list">
              <div class="drill-head" aria-hidden="true"><span></span><span>pass</span><span>pro</span><span>legendary</span><span>tier</span><span>best</span></div>
              ${rows}
            </div>
          </div>
        </section>
        <section class="pcard pcard-runs">
          <div class="pcard-cap"><span>timed runs</span>${done.length ? `<span class="pcard-tag">${done.length} lesson${done.length === 1 ? '' : 's'} done</span>` : ''}</div>
          <div class="pcard-body">
            ${done.length ? `<p>Lessons you have completed, against the clock.</p>${timedRunsHtml(done, all)}`
              : `<h2>Lessons you have completed, against the clock</h2><p>Complete a lesson first; it then appears here with a Timed option. <a href="#/learn">Open the catalog</a>.</p>`}
          </div>
        </section>
      </div>
      <aside class="practice-rail">
        <section class="pcard pcard-now">
          <div class="pcard-cap"><span>the daily</span>${dailyDone ? `<span class="pcard-tag on">${dailyDone} attempt${dailyDone === 1 ? '' : 's'} today</span>` : ''}</div>
          <div class="pcard-body">
            <h2>One drill a day, same for everyone</h2>
            <p>Today: <b>${esc(dailyDrill ? dailyDrill.title : '—')}</b>. The figures change each day where the drill allows; the streak counts practice days and never takes anything away.</p>
            <a class="btn btn-primary" href="#/daily">Play the Daily</a>
          </div>
        </section>
        ${keep ? `<section class="pcard pcard-now pcard-keep">
          <div class="pcard-cap"><span>keep sharp</span><span class="pcard-tag on">${keep.last ? keep.days + ' days since a clean pass' : 'no clean pass yet'}</span></div>
          <div class="pcard-body">
            <h2><span class="pl-n">${esc(keepLabel.n)}</span> ${esc(keepLabel.title)}</h2>
            <p>The challenge from module ${esc(keep.n)}, ${esc(keep.module.title)}. Two to three minutes; the keys are the ones the module taught.</p>
            <a class="btn" href="#/lesson/${esc(keep.challenge.id)}">Run the challenge</a>
          </div>
        </section>` : ''}
        <section class="pcard pcard-now">
          <div class="pcard-cap"><span>rapid-fire</span></div>
          <div class="pcard-body">
            <h2>One shortcut at a time</h2>
            <p>30, 60 or 120 seconds of single chords on a live sheet. Hits build a combo; the keys stay hidden until you stall. Recall is the game.</p>
            <a class="btn" href="#/rapid">Start a round</a>
          </div>
        </section>
        <section class="pcard pcard-now">
          <div class="pcard-cap"><span>sandbox</span></div>
          <div class="pcard-body">
            <h2>A free sheet</h2>
            <p>The full workspace with nothing graded: try a shortcut, walk the Ribbon with <kbd>Alt</kbd>, build a small table.</p>
            <a class="btn" href="#/drill/sandbox">Open the sandbox</a>
          </div>
        </section>
      </aside>
    </div>
    <p class="page-fine">Rules for timed play: any help or mouse use on the workspace in a timed run means no personal best and no board entry. Page controls like Start and Retry never count.</p>`;
  root.appendChild(el);
  return { destroy() { el.remove(); } };
}
