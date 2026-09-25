// app2/app/home-page.js — Home for a returning learner (SITE_SPEC §2): the Continue card first
// (the next lesson not completed or skipped), chapter progress, the Daily (honest: it arrives with
// timed play), and a link to the catalog.
import { CHAPTERS, LESSONS, lessonNumber, chapterOf } from '../content/index.js';
import { store } from './store.js';
import { prefs } from './prefs.js';
import { CHAPTER_PLAN, pickNextLesson, statusOf } from './learn-page.js';
import { DRILLS } from '../content/drills.js';
import { dailyFor } from './daily.js';
import { dayOf } from './records.js';
import { gameCtx } from './stats.js';
import { bestTier } from './practice-page.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mountHomePage(root) {
  const el = document.createElement('div');
  el.className = 'home';
  const all = store.all(); const p = prefs.get(); const skipped = p.skipped;
  const ctx = gameCtx();
  const pbCount = Object.keys(ctx.pbs).length;
  const legendaries = DRILLS.filter(d => bestTier(store.attempts({ ref: d.id })) === 'legendary').length;
  const next = pickNextLesson(LESSONS, all, skipped);
  const ch1 = CHAPTERS.find(c => c.id === 'foundations') || { lessons: [] };
  const done = ch1.lessons.filter(l => ['done', 'mastered'].includes(statusOf(l.id, all, skipped))).length;
  const skippedN = ch1.lessons.filter(l => statusOf(l.id, all, skipped) === 'skipped').length;
  const started = next && all[next.id] && all[next.id].started;
  const pct = ch1.lessons.length ? Math.round(100 * done / ch1.lessons.length) : 0;

  const continueCard = next
    ? `<section class="home-continue">
        <div class="hc-cap">${started ? 'continue' : done || skippedN ? 'next up' : 'start here'}</div>
        <div class="hc-body">
          <div class="hc-crumb">${esc(chapterOf(next).title)} · lesson ${lessonNumber(next.id)}</div>
          <h1>${esc(next.title)}</h1>
          <p>${esc(next.read || '').replace(/`([^`]+)`/g, '<kbd>$1</kbd>')}</p>
          <div class="hc-actions"><a class="btn btn-primary" id="homeContinue" href="#/lesson/${esc(next.id)}">${started ? 'Continue' : 'Start'} <kbd>Enter</kbd></a><a class="btn btn-ghost" href="#/learn">All lessons</a></div>
        </div>
      </section>`
    : `<section class="home-continue">
        <div class="hc-cap">chapter 1 complete</div>
        <div class="hc-body"><h1>Foundations: done.</h1><p>Every lesson in Chapter 1 is complete. Repeat any lesson solo or against the clock from Practice, or open the catalog.</p>
          <div class="hc-actions"><a class="btn btn-primary" id="homeContinue" href="#/practice">Practice <kbd>Enter</kbd></a><a class="btn btn-ghost" href="#/learn">Catalog</a></div></div>
      </section>`;

  const chapters = CHAPTER_PLAN.map(pl => {
    if (pl.id === 'foundations') {
      return `<div class="home-ch"><div class="home-ch-row"><b>Chapter ${pl.n} · ${esc(pl.title)}</b><span class="home-ch-n">${done}/${ch1.lessons.length}${skippedN ? ` · ${skippedN} skipped` : ''}</span></div>
        <div class="cl-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${ch1.lessons.length}" aria-valuenow="${done}" aria-label="Chapter 1 progress"><div class="cl-bar-fill" style="width:${pct}%"></div></div>
        <div class="home-ch-line">${esc(pl.line)}</div></div>`;
    }
    return `<div class="home-ch locked"><div class="home-ch-row"><b>Chapter ${pl.n} · ${esc(pl.title)}</b><span class="home-ch-n access access-paid">Paid · coming</span></div><div class="home-ch-line">${esc(pl.line)}</div></div>`;
  }).join('');

  el.innerHTML = `${continueCard}
    <div class="home-grid">
      <section class="home-card">
        <div class="hc-cap">chapters</div>
        <div class="home-chs">${chapters}</div>
        <div class="home-foot"><a href="#/learn">Open the catalog →</a></div>
      </section>
      <div class="home-col">
        <section class="home-card">
          <div class="hc-cap">the daily</div>
          <div class="hc-body"><h2>One drill a day, same for everyone.</h2><p>Today: <b>${esc((DRILLS.find(d => d.id === dailyFor(dayOf()).drillId) || {}).title || '—')}</b>${ctx.streakDays > 1 ? ` · ${ctx.streakDays}-day streak` : ''}. Free for everyone; the streak never takes anything away.</p><a class="btn btn-ghost" href="#/daily">Play the Daily</a></div>
        </section>
        ${ctx.attempts.length ? `<section class="home-card">
          <div class="hc-cap">your game</div>
          <div class="hc-body"><p><b>Level ${ctx.level}</b> · ${ctx.levelInfo.into}/${ctx.levelInfo.need} XP${pbCount ? ` · ${pbCount} personal best${pbCount === 1 ? '' : 's'}` : ''}${legendaries ? ` · ${legendaries} legendary` : ''}</p>
          <p class="muted-line">Rank: Unranked — boards open with accounts, and rank stays hidden until the field fills.</p>
          <a href="#/practice">Practice →</a> · <a href="#/account?section=stats">Stats →</a></div>
        </section>` : ''}
        <section class="home-card">
          <div class="hc-cap">${esc(store.saveLine())}</div>
          <div class="hc-body"><p>${Object.keys(all).length} lesson${Object.keys(all).length === 1 ? '' : 's'} with progress · ${p.platform === 'mac' ? 'Mac' : 'Windows'} keys${p.experience ? ` · ${{ new: 'new to Excel', sometimes: 'uses Excel sometimes', daily: 'uses Excel daily' }[p.experience]}` : ''}</p><a href="#/account">Account and settings →</a></div>
        </section>
      </div>
    </div>`;
  root.appendChild(el);
  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.tagName === 'BUTTON' || t.tagName === 'A' || t.isContentEditable);
  const onKey = e => { if (e.key === 'Enter' && !isTyping(e.target) && !e.defaultPrevented) { const a = el.querySelector('#homeContinue'); if (a) { e.preventDefault(); location.hash = a.getAttribute('href'); } } };
  document.addEventListener('keydown', onKey);
  return { destroy() { document.removeEventListener('keydown', onKey); el.remove(); } };
}
