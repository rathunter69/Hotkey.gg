// app2/app/home-next.js — Home as a dashboard (experience pass, decisions 3, 11, 12): above the
// fold, in this order — the Continue card (Enter resumes), Due today (up to three items, ninety
// seconds, from app/schedule.js), the Daily with today's tier and board position, and the
// "where we are in the deal" strip. Below: the current chapter's module rings and the level / XP
// chip. `?demo=1` renders a seeded first-week state for the storyboard (nothing is written).
// Also the #/due/<shortcut> route: a micro-drill mounted in the lesson workspace.
import { CHAPTERS, LESSONS, lessonNumber, chapterOf, modulesOf, moduleOf, lessonById } from '../content/index.js';
import { store } from './store.js';
import { prefs } from './prefs.js';
import { pickNextLesson, statusOf, moduleStatus, pathModel } from './learn-page.js';
import { DRILLS } from '../content/drills.js';
import { dailyFor } from './daily.js';
import { dayOf } from './records.js';
import { gameCtx } from './stats.js';
import { schedule, dueToday, demoState, microLesson } from './schedule.js';
import { dealStripHtml } from './deal-strip.js';
import { ring } from '../ui/ring.js';
import { levelOf } from './xp.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TIER_MARK = { legendary: '◆◆◆', pro: '◆◆', pass: '◆', none: '—' };

/** The modules of Chapter 1 with what each teaches, for the Keep-sharp rule. */
export function moduleCtx(all) {
  const ch = CHAPTERS.find(c => c.id === 'foundations'); if (!ch) return { modules: [] };
  return { modules: modulesOf(ch).map(m => ({ id: m.id, title: m.title, challengeId: m.challenge ? m.challenge.id : null, complete: moduleStatus(m, all) === 'complete', teaches: [...new Set(m.lessons.flatMap(l => l.teaches || []))] })) };
}

/** A seeded first-week state for the storyboard: four lessons done, the fifth started, a Daily played, the queue as demoState(). */
export function demoCtx(now = Date.now()) {
  const done = ['welcome-export', 'inherited-workbook', 'ribbon-by-keyboard', 'analyst-setup'];
  const all = {};
  for (const id of done) all[id] = { completed: true, started: true, at: now - 2 * 86400000, best: 140 };
  all['colour-label-hardcode'] = { started: true, at: now - 3600000 };
  const xp = 4 * 50 + 30;
  return { all, queue: demoState(now), daily: { played: true, tier: 'pro', secs: 61.4, pos: 12, of: 38 }, xp, level: levelOf(xp), demo: true };
}

function realCtx() {
  const all = store.all();
  const ctx = gameCtx();
  const day = dayOf();
  const todays = store.attempts({ kind: 'daily', day }).filter(a => a.clean && a.secs != null).sort((a, b) => a.secs - b.secs);
  const best = todays[0] || null;
  return { all, queue: schedule.state(), daily: best ? { played: true, tier: best.tier, secs: best.secs, pos: null, of: null } : { played: false }, xp: ctx.xp, level: ctx.levelInfo, demo: false };
}

export function mountHomePage(root, pageCtx = {}) {
  const q = (pageCtx && pageCtx.query) || {};
  const c = q.demo === '1' ? demoCtx() : realCtx();
  const all = c.all; const skipped = c.demo ? [] : prefs.get().skipped;
  const el = document.createElement('div');
  el.className = 'hm';
  const next = pickNextLesson(LESSONS, all, skipped);
  const at = next ? moduleOf(next) : null;
  const started = next && all[next.id] && all[next.id].started;
  const day = dayOf();
  const dailyDrill = DRILLS.find(d => d.id === dailyFor(day).drillId) || null;
  const queue = dueToday(c.queue, moduleCtx(all));
  const ch1 = CHAPTERS.find(x => x.id === 'foundations');
  const mods = ch1 ? pathModel(ch1, all, skipped) : [];

  const continueCard = next
    ? `<section class="hm-continue" aria-label="Continue">
        <div class="hm-cap">${started ? 'continue' : 'next up'}</div>
        <div class="hm-c-main">
          <div class="hm-crumb">${esc(chapterOf(next).title)}${at ? ` › ${esc(at.module.title)} › ${next.kind === 'challenge' ? 'Challenge' : `Lesson ${at.n} of ${at.of}`}` : ` · lesson ${lessonNumber(next.id)}`}</div>
          <h1>${esc(next.title)}</h1>
          <p>${esc(String(next.brief || next.read || '').split(/(?<=[.!?])\s+/)[0]).replace(/`([^`]+)`/g, '<kbd>$1</kbd>')}</p>
          <div class="hm-actions"><a class="btn btn-primary" id="homeContinue" href="#/lesson/${esc(next.id)}">${started ? 'Continue' : 'Start'} <kbd>Enter</kbd></a><a class="btn btn-ghost" href="#/learn">Data room</a></div>
        </div>
        ${at ? `<div class="hm-c-ring">${ring(at.module.lessons.filter(l => all[l.id] && all[l.id].completed).length, at.module.lessons.length, { size: 72, stroke: 6, label: 'auto' })}<span>module ${at.k} of ${at.of7}</span></div>` : ''}
      </section>`
    : `<section class="hm-continue"><div class="hm-cap">chapter 1 complete</div><div class="hm-c-main"><h1>Foundations: done.</h1><p>Page one of the pack is delivered. Keep it sharp from Practice, or open the data room.</p>
        <div class="hm-actions"><a class="btn btn-primary" id="homeContinue" href="#/practice">Practice <kbd>Enter</kbd></a><a class="btn btn-ghost" href="#/learn">Data room</a></div></div></section>`;

  const dueCard = `<section class="hm-card hm-due" aria-label="Due today">
      <div class="hm-cap">due today${queue.items.length ? ` <span>${queue.items.length} item${queue.items.length === 1 ? '' : 's'} · ${queue.secs} s</span>` : ''}</div>
      ${queue.items.length ? `<ol class="hm-due-list">${queue.items.map((it, i) => `<li><a href="${it.kind === 'challenge' ? '#/lesson/' + esc(it.id) : '#/due/' + esc(it.id)}"><span class="hm-due-n">${i + 1}</span><span class="hm-due-body"><b>${esc(it.title)}</b><span>${esc(it.task)}</span></span><span class="hm-due-secs">${it.secs} s</span></a></li>`).join('')}</ol>
        <p class="hm-due-foot">Short reps on what you are about to forget. Nothing is lost by skipping a day.</p>`
        : `<div class="hm-empty"><b>Nothing due.</b> Play the Daily, or carry on with the next lesson.</div>`}
    </section>`;

  const dailyCard = `<section class="hm-card hm-daily" aria-label="The Daily">
      <div class="hm-cap">the daily <span>${esc(day)}</span></div>
      <div class="hm-daily-body">
        <div class="hm-daily-title">${esc(dailyDrill ? dailyDrill.title : '—')}</div>
        <div class="hm-daily-stats">
          <div><span>today</span><b>${c.daily.played ? esc(TIER_MARK[c.daily.tier] || '—') + ' ' + esc(c.daily.tier === 'none' ? 'done' : c.daily.tier) : 'not yet'}</b></div>
          <div><span>time</span><b>${c.daily.played && c.daily.secs != null ? c.daily.secs.toFixed(1) + ' s' : '—'}</b></div>
          <div><span>board</span><b>${c.daily.played && c.daily.pos ? '#' + c.daily.pos + ' of ' + c.daily.of : c.daily.played ? 'local' : '—'}</b></div>
        </div>
        <a class="btn ${c.daily.played ? 'btn-ghost' : 'btn-primary'}" href="#/daily">${c.daily.played ? 'Play again' : 'Play the Daily'}</a>
      </div>
    </section>`;

  const modules = `<section class="hm-card hm-modules" aria-label="Modules">
      <div class="hm-cap">chapter 1 · foundations <span>${mods.filter(m => m.status === 'complete').length} of ${mods.length} modules</span></div>
      <div class="hm-rings">${mods.map((m, i) => `<a class="hm-ring hm-${esc(m.status)}" href="#/learn" title="${esc(m.title)} · ${m.done} of ${m.total}">${ring(m.done, m.total, { size: 44, stroke: 4 })}<span class="hm-ring-n">1.${i}</span><span class="hm-ring-t">${esc(m.title)}</span></a>`).join('')}</div>
    </section>`;

  const level = `<section class="hm-card hm-level" aria-label="Level">
      <div class="hm-cap">level</div>
      <div class="hm-level-body"><div class="hm-level-chip">L${c.level.lvl}</div><div class="hm-level-bar"><div class="hm-level-track"><i style="width:${c.level.pct}%"></i></div><span>${c.level.into} / ${c.level.need} XP to level ${c.level.lvl + 1}</span></div></div>
      <p class="hm-fine">XP comes from finishing lessons and challenges. Speed earns pars and board places, never XP.</p>
    </section>`;

  const completedN = Object.values(all).filter(p => p && p.completed).length;
  const nudge = !c.demo && completedN >= 1 && store.saveState() === 'device' && !prefs.get().saveNudgeDone
    ? `<div class="hm-nudge" id="hmNudge" role="status"><span><b>Your progress is saved on this device.</b> Create a free account to keep it across devices — everything carries over.</span><span class="hm-nudge-acts"><a class="btn btn-primary" href="#/account">Create account</a><button class="btn btn-ghost" type="button" id="hmNudgeNo">Not now</button></span></div>` : '';
  el.innerHTML = `${nudge}${continueCard}
    <div class="hm-row">${dueCard}${dailyCard}</div>
    ${dealStripHtml(all)}
    <div class="hm-row hm-row-below">${modules}${level}</div>
    ${c.demo ? '<p class="hm-fine hm-demo-note">Storyboard: a seeded first-week state (day five). Nothing here is saved.</p>' : ''}`;
  root.appendChild(el);
  const no = el.querySelector('#hmNudgeNo'); if (no) no.onclick = () => { prefs.set({ saveNudgeDone: true }); const n = el.querySelector('#hmNudge'); if (n) n.remove(); };
  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.tagName === 'BUTTON' || t.tagName === 'A' || t.isContentEditable);
  const onKey = e => { if (e.key === 'Enter' && !isTyping(e.target) && !e.defaultPrevented) { const a = el.querySelector('#homeContinue'); if (a) { e.preventDefault(); location.hash = a.getAttribute('href'); } } };
  document.addEventListener('keydown', onKey);
  return { destroy() { document.removeEventListener('keydown', onKey); el.remove(); } };
}

/** #/due/<shortcut>: the micro-drill in the lesson workspace; an unknown id shows the queue instead. */
export async function mountDuePage(root, ctx = {}) {
  const id = ctx.params && ctx.params.id;
  const lesson = microLesson(id);
  if (!lesson) {
    root.innerHTML = `<div class="nf-card"><div class="nf-cap">due today</div><div class="nf-body"><h1>Nothing to drill here.</h1><p>That item is not in today’s queue.</p><div class="nf-row"><a class="btn btn-primary" href="#/">Home</a></div></div></div>`;
    return { destroy() { root.innerHTML = ''; } };
  }
  const { mountLessonView } = await import('./lesson-view.js');
  return mountLessonView(root, lesson, { mode: 'guided' });
}

export { lessonById };
