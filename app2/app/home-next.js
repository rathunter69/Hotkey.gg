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
import { siteCopy } from '../content/copy/apply.js';
import { moduleNumber, isFinalItem, FINAL_MODULE } from './numbering.js';

/** The dashboard's built-in lines; site.csv (dash_*, due_*, save_nudge) overrides. Exported for the copy export. */
export const DASH_LINES = { learn: 'The path: chapters, modules, lessons and their challenges, one story on one file.', practice: 'The reps: timed, no story. What is due today, the Daily, drills and rapid-fire.' };
export const DUE_LINES = { foot: 'Short reps on what you are about to forget. Nothing is lost by skipping a day.', empty: 'Nothing due. Play the Daily, or carry on with the next lesson.',
  fresh: 'Nothing here yet. Shortcuts you learn come back here the next day as thirty-second refreshers.' };
/** The first sentence in bold, the rest plain (the nudge and the empty-queue line). */
const lead = t => { const m = /^(.*?[.!?])(\s+.*)?$/s.exec(String(t || '')); return m ? `<b>${esc(m[1])}</b>${m[2] ? esc(m[2]) : ''}` : esc(t); };
export const SAVE_NUDGE = 'Your progress is saved on this device. Create a free account to keep it across devices — everything carries over.';
import { dayOf } from './records.js';
import { gameCtx } from './stats.js';
import { schedule, dueToday, demoState, microLesson } from './schedule.js';
import { dealStripHtml } from './deal-strip.js';
import { ring } from '../ui/ring.js';
import { levelOf } from './xp.js';
import { mountLessonView } from './lesson-view.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TIER_MARK = { legendary: '◆◆◆', pro: '◆◆', pass: '◆', none: '—' };
/** Retired lessons (B2: the Welcome race folds into 1.1.1) never come up as next; the content session removes them. */
export const RETIRED = new Set(['welcome-export', 'welcome-race']);
export const liveLessons = () => LESSONS.filter(l => !RETIRED.has(l.id) && l.module !== 'welcome');

/** The modules of Chapter 1 with what each teaches, for the Keep-sharp rule. */
export function moduleCtx(all) {
  const ch = CHAPTERS.find(c => c.id === 'foundations'); if (!ch) return { modules: [] };
  return { modules: modulesOf(ch).map(m => ({ id: m.id, title: m.title, challengeId: m.challenge ? m.challenge.id : null, challengeSecs: m.challenge && m.challenge.pars ? m.challenge.pars.pass : null, complete: moduleStatus(m, all) === 'complete', teaches: [...new Set(m.lessons.flatMap(l => l.teaches || []))] })) };
}

/** A seeded first-week state for the storyboard: four lessons done, the fifth started, a Daily played, the queue as demoState(). */
export function demoCtx(now = Date.now()) {
  const done = ['inherited-workbook', 'ribbon-by-keyboard', 'analyst-setup'];
  const all = {};
  for (const id of done) all[id] = { completed: true, started: true, at: now - 2 * 86400000, best: 140 };
  all['colour-label-hardcode'] = { started: true, at: now - 3600000 };
  const xp = 3 * 50 + 30;
  return { all, queue: demoState(now), daily: { played: true, tier: 'pro', secs: 61.4, pos: 12, of: 38 }, xp, level: levelOf(xp), streak: 4, demo: true };
}

function realCtx() {
  const all = store.all();
  const ctx = gameCtx();
  const day = dayOf();
  // today's Daily: the best clean time, or — honestly — a run that was played but not clean
  const played = store.attempts({ kind: 'daily', day }).filter(a => a.secs != null);
  const clean = played.filter(a => a.clean).sort((a, b) => a.secs - b.secs);
  const best = clean[0] || null;
  const daily = best ? { played: true, clean: true, tier: best.tier, secs: best.secs, pos: null, of: null } : played.length ? { played: true, clean: false } : { played: false };
  return { all, queue: schedule.stateOrBackfill(all, liveLessons()), daily, xp: ctx.xp, level: ctx.levelInfo, streak: ctx.streakDays || 0, demo: false };
}

/** The day, as the learner reads it: 'Thu 25 Sep'. */
const prettyDay = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }); } catch (e) { return d; } };
/** A challenge's name where the crumb already says "Challenge". */
const challengeName = t => { const x = String(t || '').replace(/^Challenge:\s*/i, ''); return x.charAt(0).toUpperCase() + x.slice(1); };
/** Rings the learner saw last time, to mark the one that moved since (SITE_SPEC §6a: rings animate when you come back). */
const RING_KEY = 'hk2_rings_seen';
function ringsSeen() { try { return JSON.parse(sessionStorage.getItem(RING_KEY) || '{}') || {}; } catch (e) { return {}; } }
function saveRings(map) { try { sessionStorage.setItem(RING_KEY, JSON.stringify(map)); } catch (e) { /* private window */ } }

export function mountHomePage(root, pageCtx = {}) {
  const q = (pageCtx && pageCtx.query) || {};
  const c = q.demo === '1' ? demoCtx() : realCtx();
  const all = c.all; const skipped = c.demo ? [] : prefs.get().skipped;
  const el = document.createElement('div');
  el.className = 'hm';
  const next = pickNextLesson(liveLessons(), all, skipped);
  const at = next ? moduleOf(next) : null;
  const started = next && all[next.id] && all[next.id].started;
  const day = dayOf();
  const dailyDrill = DRILLS.find(d => d.id === dailyFor(day).drillId) || null;
  const queue = dueToday(c.queue, moduleCtx(all));
  const ch1 = CHAPTERS.find(x => x.id === 'foundations');
  const mods = ch1 ? pathModel(ch1, all, skipped).filter(m => m.id !== 'welcome') : [];
  const gate = c.demo ? {} : store.chapter('foundations');
  const completedN = Object.values(all).filter(p => p && p.completed).length;
  const chapterDone = !!(gate.assessment || gate.testout) || (!next && mods.length && mods.every(m => m.status === 'complete'));
  const pm = at ? mods.find(m => m.id === at.module.id) : null;   // the module with its challenge, for the Continue ring

  const continueCard = next && !chapterDone
    ? `<section class="hm-continue" aria-label="Continue">
        <div class="hm-cap">${started ? 'continue' : 'next up'}</div>
        <div class="hm-c-main">
          <div class="hm-crumb">${esc(chapterOf(next).title)}${at ? ` › ${esc(moduleNumber(at.module.id, at.k))} ${esc(at.module.title)} › ${next.kind === 'challenge' ? 'Challenge' : `Lesson ${at.n} of ${at.of}`}` : ` · lesson ${lessonNumber(next.id)}`}</div>
          <h1>${esc(next.kind === 'challenge' ? challengeName(next.title) : next.title)}</h1>
          <p>${esc(String(next.brief || next.read || '').split(/(?<=[.!?])\s+/)[0]).replace(/`([^`]+)`/g, '<kbd>$1</kbd>')}</p>
          <div class="hm-actions"><a class="btn btn-primary" id="homeContinue" href="#/lesson/${esc(next.id)}">${started ? 'Continue' : 'Start'} <kbd>Enter</kbd></a><a class="btn btn-ghost" href="#/learn" title="Learn: every chapter, module and lesson">All lessons</a></div>
        </div>
        ${at && pm ? `<div class="hm-c-ring">${ring(pm.done, pm.total, { size: 72, stroke: 6, label: 'auto' })}<span>module ${esc(moduleNumber(at.module.id, at.k))}</span></div>` : ''}
      </section>`
    : `<section class="hm-continue hm-chapter-done"><div class="hm-cap">chapter 1 complete</div><div class="hm-c-main"><h1>Foundations: done.</h1><p>Page one of the pack is delivered. Keep it sharp from Practice, or look at what Chapter 2 brings.</p>
        <div class="hm-actions"><a class="btn btn-primary" id="homeContinue" href="#/practice">Practice <kbd>Enter</kbd></a><a class="btn btn-ghost" href="#/learn?ch=formatting">See Chapter 2 →</a></div></div></section>`;

  const dueEmpty = completedN ? siteCopy('due_empty', DUE_LINES.empty) : siteCopy('due_fresh', DUE_LINES.fresh);
  const dueCard = `<section class="hm-card hm-due" aria-label="Due today">
      <div class="hm-cap">due today${queue.items.length ? ` <span>${queue.items.length} item${queue.items.length === 1 ? '' : 's'} · ${queue.secs} s</span>` : ''}</div>
      ${queue.items.length ? `<ol class="hm-due-list">${queue.items.map((it, i) => `<li><a href="${it.kind === 'challenge' ? '#/lesson/' + esc(it.id) : '#/due/' + esc(it.id)}"><span class="hm-due-n">${i + 1}</span><span class="hm-due-body"><b>${esc(it.title)}</b><span>${esc(it.task)}</span></span><span class="hm-due-secs">${it.secs} s</span></a></li>`).join('')}</ol>
        <p class="hm-due-foot">${esc(siteCopy('due_foot', DUE_LINES.foot))}</p>`
        : `<div class="hm-empty">${lead(dueEmpty)}</div>`}
    </section>`;

  // the Daily: before today's run it says what it is; after, the numbers (the board cell only once there is a position)
  const d = c.daily;
  const dailyStats = d.played && d.clean
    ? `<div class="hm-daily-stats"><div><span>today</span><b>${esc(TIER_MARK[d.tier] && d.tier !== 'none' ? TIER_MARK[d.tier] + ' ' + d.tier : 'no tier')}</b></div><div><span>time</span><b>${d.secs != null ? d.secs.toFixed(1) + ' s' : '—'}</b></div>${d.pos ? `<div><span>board</span><b>#${d.pos} of ${d.of}</b></div>` : ''}</div>`
    : d.played ? `<p class="hm-daily-line">Played today, with help or the mouse: no time posted. A clean run posts one.</p>`
    : `<p class="hm-daily-line">${esc(siteCopy('mode_daily', 'Ninety seconds, the same sheet for everyone, once a day.'))}</p>`;
  const dailyCard = `<section class="hm-card hm-daily" aria-label="The Daily">
      <div class="hm-cap">the daily <span>${esc(prettyDay(day))}${c.streak > 1 ? ` · <b class="hm-streak">${c.streak}-day streak</b>` : ''}</span></div>
      <div class="hm-daily-body">
        <div class="hm-daily-title">${esc(dailyDrill ? dailyDrill.title : '—')}</div>
        ${dailyStats}
        <a class="btn ${d.played ? 'btn-ghost' : 'btn-primary'}" href="#/daily">${d.played ? 'Play again' : 'Play the Daily'}</a>
      </div>
    </section>`;

  // the rings: each links to its own document; the current one is marked; one that moved since the last visit says so
  const seen = ringsSeen(); const nowSeen = {};
  const ringA = (id, n, title, done, total, st, cur) => {
    const f = total ? done / total : 0; nowSeen[id] = f;
    const moved = seen[id] != null && f > seen[id];
    return `<a class="hm-ring hm-${esc(st)}${cur ? ' hm-now' : ''}${moved ? ' hm-moved' : ''}" href="#/learn?doc=${esc(id)}" title="${esc(title)} · ${done} of ${total}${cur ? ' · you are here' : ''}">${ring(done, total, { size: 44, stroke: 4 })}<span class="hm-ring-n">${esc(n)}</span><span class="hm-ring-t">${esc(title)}</span></a>`;
  };
  function finalRing() {
    if (mods.some(m => m.id === FINAL_MODULE.id)) return '';   // the catalogue carries 1.8 as a module (Run 4): its ring is already there
    const finals = ch1 ? ch1.lessons.filter(l => isFinalItem(l) && l.kind !== 'testout') : [];
    if (!finals.length) return '';
    const done = finals.filter(l => all[l.id] && all[l.id].completed).length;
    const st = gate.assessment || gate.testout ? 'complete' : done ? 'started' : 'not-started';
    return ringA(FINAL_MODULE.id, FINAL_MODULE.n, 'Project and assessment', gate.testout ? finals.length : done, finals.length, st, !!(next && isFinalItem(next)));
  }
  const modules = `<section class="hm-card hm-modules" aria-label="Modules">
      <div class="hm-cap">chapter 1 · foundations <span>${mods.filter(m => m.status === 'complete').length} of ${mods.length} modules${gate.assessment || gate.testout ? ' · assessment passed' : ''}</span></div>
      <div class="hm-rings">${mods.map((m, i) => ringA(m.id, moduleNumber(m.id, i + 1), m.title, m.done, m.total, m.status, !!(at && at.module.id === m.id))).join('')}${finalRing()}</div>
    </section>`;
  if (!c.demo) saveRings(nowSeen);

  const level = `<section class="hm-card hm-level" aria-label="Level">
      <div class="hm-cap">level</div>
      <div class="hm-level-body"><div class="hm-level-chip">L${c.level.lvl}</div><div class="hm-level-bar"><div class="hm-level-track"><i style="width:${c.level.pct}%"></i></div><span>${c.level.into} / ${c.level.need} XP to level ${c.level.lvl + 1}</span></div></div>
      ${c.level.lvl < 2 ? '<p class="hm-fine">XP comes from finishing lessons and challenges. Speed earns pars and board places, never XP.</p>' : ''}
    </section>`;

  const nudge = !c.demo && completedN >= 1 && store.saveState() === 'device' && !prefs.get().saveNudgeDone
    ? `<div class="hm-nudge" id="hmNudge" role="status"><span>${lead(siteCopy('save_nudge', SAVE_NUDGE))}</span><span class="hm-nudge-acts"><a class="btn btn-primary" href="#/account">Create account</a><button class="btn btn-ghost" type="button" id="hmNudgeNo">Not now</button></span></div>` : '';
  // Learn and Practice are two different things (B6): the path with its story on the left, the reps on the right.
  // The one-line explanations show until the first lesson is done (not just the first render).
  const hints = !prefs.get().dashHintsSeen;
  if (hints && !c.demo && completedN >= 1) prefs.set({ dashHintsSeen: true });
  el.innerHTML = `${nudge}
    ${dealStripHtml(all, { done: chapterDone })}
    <div class="hm-halves">
      <section class="hm-half hm-learn" aria-label="Learn">
        <div class="hm-half-head"><h2>Learn</h2>${hints ? `<p>${esc(siteCopy('dash_learn', DASH_LINES.learn))}</p>` : ''}</div>
        ${continueCard}${modules}${level}
      </section>
      <section class="hm-half hm-practice" aria-label="Practice">
        <div class="hm-half-head"><h2>Practice</h2>${hints ? `<p>${esc(siteCopy('dash_practice', DASH_LINES.practice))}</p>` : ''}</div>
        ${dueCard}${dailyCard}
      </section>
    </div>
    ${c.demo ? '<p class="hm-fine hm-demo-note">Storyboard: a seeded first-week state (day five). Nothing here is saved.</p>' : ''}`;
  root.appendChild(el);
  const no = el.querySelector('#hmNudgeNo'); if (no) no.onclick = () => { prefs.set({ saveNudgeDone: true }); const n = el.querySelector('#hmNudge'); if (n) n.remove(); };
  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.tagName === 'BUTTON' || t.tagName === 'A' || t.isContentEditable);
  const onKey = e => { if (e.key === 'Enter' && !isTyping(e.target) && !e.defaultPrevented) { const a = el.querySelector('#homeContinue'); if (a) { e.preventDefault(); location.hash = a.getAttribute('href'); } } };
  document.addEventListener('keydown', onKey);
  return { destroy() { document.removeEventListener('keydown', onKey); el.remove(); } };
}

/** #/due/<shortcut>: the micro-drill in the lesson workspace; an unknown id shows the queue instead. */
export function mountDuePage(root, ctx = {}) {
  const id = ctx.params && ctx.params.id;
  const lesson = microLesson(id);
  if (!lesson) {
    root.innerHTML = `<div class="nf-card"><div class="nf-cap">due today</div><div class="nf-body"><h1>Nothing to drill here.</h1><p>That item is not in today’s queue.</p><div class="nf-row"><a class="btn btn-primary" href="#/">Home</a></div></div></div>`;
    return { destroy() { root.innerHTML = ''; } };
  }
  return mountLessonView(root, lesson, { mode: 'guided' });
}

export { lessonById };
