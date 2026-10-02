// app2/app/home-page.js — Home (screenplay 3.0 "Home"; 3.4; M89). Two columns, 1fr and 336px,
// ending on the same line. Left: the next lesson, selected when the page opens, with Resume (or
// Start) on Enter, one row of facts, a preview of the sheet the lesson opens on, and the chapter
// as a table. Right: Level, Today and Achievements. No deal strip, no case name: the case lives
// inside the lessons. Every line is a site.csv row; the pure parts (nextLessonModel, todayModel,
// achievementsModel) are tested.
import { CHAPTERS, LESSONS, moduleOf, chapterOf } from '../content/index.js';
import { store } from './store.js';
import { prefs } from './prefs.js';
import { pickNextLesson, openLessons, chapterModel, lessonMinutes, moduleStatus } from './learn-page.js';
import { modulesOf } from '../content/index.js';
import { DRILLS } from '../content/drills.js';
import { dailyFor } from './daily.js';
import { dayOf } from './records.js';
import { gameCtx } from './stats.js';
import { schedule, dueToday } from './schedule.js';
import { rewardAt, MAX_LEVEL } from '../content/levels.js';
import { evaluateAchievements, badgeArt } from '../ui/badges.js';
import { weekCells, weekLetters } from '../ui/components/rail.js';
import { siteCopy } from '../content/copy/apply.js';
import { xpForEvent } from './xp.js';
import { esc, fill, fmtMinutes, fmtClock } from '../ui/components/format.js';
import { panelHtml, tableHtml, buttonHtml, wireRows } from '../ui/components/table.js';
import { tierMarksHtml, segmentsHtml, barHtml, modeMarkHtml } from '../ui/components/marks.js';
import { sheetPreviewHtml, previewOfLesson } from '../ui/components/sheet-preview.js';
import { entitlement } from './entitlement.js';
import { routeKeys, moduleRowHtml, continueHtml } from '../ui/components/path.js';
import { saveNudgeHtml, wireSaveNudge } from '../ui/components/nudge.js';
import { courseNow, certTeaserHtml } from '../ui/components/certificate.js';

const t = (key, vars) => fill(siteCopy(key, key), vars);
import { questBoard } from './quest-loop.js';
import { flairTileHtml } from '../ui/components/flair.js';
import { QUESTS_BY_ID } from '../content/quests.js';

/** A quest's mode color and where Enter takes it (6.6: lessons, drills, the Daily, rapid-fire, challenges). */
export function questRoute(row) {
  const q = QUESTS_BY_ID[row.id] || {};
  const kind = (q.where && q.where.kind && q.where.kind[0]) || (q.metric === 'chapter' ? 'drill' : 'key');
  if (kind === 'lesson') return { mode: 'learn', href: '#/learn' };
  if (kind === 'daily') return { mode: 'daily', href: '#/daily' };
  if (kind === 'rapid') return { mode: 'rapid', href: '#/rapid' };
  if (kind === 'challenge') return { mode: 'challenges', href: row.ref ? '#/lesson/' + row.ref : '#/practice' };
  return { mode: 'drills', href: '#/practice' };
}
/** Retired lessons never come up as next. */
export const RETIRED = new Set(['welcome-export', 'welcome-race']);
export const liveLessons = () => LESSONS.filter(l => !RETIRED.has(l.id) && l.module !== 'welcome' && l.kind !== 'testout');

/** The modules of Chapter 1 with what each teaches, for the refresher queue. */
export function moduleCtx(all) {
  const ch = CHAPTERS.find(c => c.id === 'foundations'); if (!ch) return { modules: [] };
  return { modules: modulesOf(ch).map(m => ({ id: m.id, title: m.title, challengeId: m.challenge ? m.challenge.id : null, challengeSecs: m.challenge && m.challenge.pars ? m.challenge.pars.pass : null, complete: moduleStatus(m, all) === 'complete', teaches: [...new Set(m.lessons.flatMap(l => l.teaches || []))] })) };
}

/**
 * The next-lesson block (3.0, Home; the defaults): the next open lesson with its module, place,
 * goals and minutes; once the chapter's lessons are done, the assessment; once that is Verified,
 * a free account sees the next chapter's first lesson with the paywall line. Pure over the data.
 *   → { kind: 'lesson' | 'assessment' | 'pro' | 'none', lesson, started, module, n, of, goals, minutes, chapter }
 */
export function nextLessonModel(lessons, all, skipped, { locked = () => false } = {}) {
  const open = lessons.filter(l => !locked(l));
  const next = pickNextLesson(open, all, skipped);
  if (next) {
    const at = moduleOf(next);
    const p = all[next.id];
    return { kind: next.kind === 'assessment' ? 'assessment' : 'lesson', lesson: next, started: !!(p && p.started), module: at ? at.module.title : (next.section || ''), n: at ? at.n : 0, of: at ? at.of : 0,
      goals: Array.isArray(next.goals) ? next.goals.length : 0, minutes: lessonMinutes(next), chapter: chapterOf(next) || null };
  }
  const first = lessons.find(l => locked(l));
  if (first) return { kind: 'pro', lesson: first, started: false, module: first.section || '', n: 1, of: 0, goals: Array.isArray(first.goals) ? first.goals.length : 0, minutes: lessonMinutes(first), chapter: chapterOf(first) || null };
  return { kind: 'none', lesson: null, chapter: CHAPTERS[0] || null };
}

/**
 * Today's rows (3.0, Home; the defaults): the refreshers due as one row, the Daily as one row.
 * The day's quests and the week's quests are R7's (6.6) and join these rows then. Pure.
 *   → { rows: [{ id, mode, title, length, xp, done, href, line }], done, of, fresh }
 */
export function todayModel({ queue = { items: [], secs: 0 }, daily = { played: false }, dailyTitle = '', completedLessons = 0, dailyXp = 30, quests = null, weekOpen = false } = {}) {
  const rows = [];
  // the day's three quests lead (6.6), each with a bar that fills as runs land
  const qrow = r => { const to = questRoute(r); return { id: 'q-' + r.id, quest: true, mode: to.mode, title: r.title, length: r.done ? '' : t('quest_count', { d: r.have, k: r.target }), xp: r.done ? 0 : r.xp, done: r.done, href: to.href, bar: r.done ? null : Math.round(100 * r.have / (r.target || 1)) }; };
  if (quests && quests.started) for (const r of quests.daily.rows) rows.push(qrow(r));
  const refreshers = queue.items.filter(i => i.kind === 'micro');
  if (refreshers.length) rows.push({ id: 'refreshers', mode: 'drills', title: t('home_refreshers', { n: refreshers.length }), length: t('home_seconds', { n: queue.secs }), xp: 0, done: false, href: '#/due/' + refreshers[0].id });
  const keep = queue.items.find(i => i.kind === 'challenge');
  if (keep) rows.push({ id: 'keep', mode: 'challenges', title: keep.title, length: t('home_seconds', { n: keep.secs }), xp: 0, done: false, href: '#/lesson/' + keep.id });
  const dailyLine = daily.played && daily.clean ? (daily.place ? t('home_daily_played', { t: fmtClock(daily.secs, true), place: daily.place, n: daily.of }) : t('home_daily_played_local', { t: fmtClock(daily.secs, true) })) : daily.played ? t('home_daily_help') : '';
  rows.push({ id: 'daily', mode: 'daily', title: t('home_daily_row'), length: daily.played ? '' : t('home_daily_len'), xp: daily.played ? 0 : dailyXp, done: !!daily.played, href: '#/daily', line: dailyLine, sub: dailyTitle });
  const done = rows.filter(r => r.done).length;
  const of = rows.length;
  if (quests && quests.started) {
    const D = quests.daily, W = quests.weekly;
    if (D.rows.length && D.rows.every(r => r.done)) rows.push({ id: 'bonus', bonus: true, mode: 'learn', title: t('quest_bonus_daily'), length: '', xp: 0, xpText: t('quest_bonus_xp', { xp: D.bonusXp }), done: D.bonus, href: '#/' });
    const wd = W.rows.filter(r => r.done).length;
    rows.push({ id: 'week', week: true, mode: 'learn', title: t('quest_this_week'), length: t('quest_count', { d: wd, k: W.rows.length }), xp: 0, done: false, href: weekOpen ? '#/' : '#/?week=1', open: weekOpen });
    if (weekOpen) for (const r of W.rows) rows.push({ ...qrow(r), sub: true });
    if (W.rows.length && W.rows.every(r => r.done)) rows.push({ id: 'week-bonus', bonus: true, mode: 'learn', title: t('quest_bonus_weekly'), line: W.rollLabel ? t('quest_roll', { reward: W.rollLabel }) : '', length: '', xp: 0, xpText: t('quest_bonus_xp', { xp: W.bonusXp }), done: W.bonus, href: '#/' });
  }
  return { rows, done, of, fresh: completedLessons === 0 };
}

/** The latest badges and the next one to earn: the one closest to done among the unearned, visible ones. Pure. */
export function achievementsModel(states, { latest = 10 } = {}) {
  const earned = states.filter(s => s.done);
  const shown = earned.slice(-latest);
  const open = states.filter(s => !s.done && !s.def.hidden).sort((a, b) => (b.prog / b.goal) - (a.prog / a.goal) || states.indexOf(a) - states.indexOf(b));
  return { shown, earned: earned.length, of: states.length, next: open[0] || null };
}

/** A badge on Home: a keycap in its rarity's color holding the sprite (01-home); a locked one is a blank key with "?". */
const badgeTile = s => `<span class="badge-tile badge-key r-${esc(s.def.rarity)}${s.done ? ' on' : ''}" title="${esc(s.def.name)}">${badgeArt(s.def, { done: s.done, size: 32 })}</span>`;
/** The next level's reward, drawn (3.0, Home; 6.10): the flair item itself, or the level's key when there is none. */
function rewardTileHtml(reward, n) {
  return (reward && flairTileHtml(reward)) || `<span class="level-tile level-tile-key" aria-hidden="true">${esc(n)}</span>`;
}

export function mountHomePage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'pg pg-home';
  const all = store.all(); const skipped = prefs.get().skipped;
  const game = gameCtx();
  const day = dayOf();
  const next = nextLessonModel(liveLessons(), all, skipped, { locked: l => entitlement.locked(l) });
  const chapter = next.chapter || CHAPTERS[0];
  const gate = store.chapter(chapter.id);
  const rows = chapterModel(chapter, all, skipped, gate);
  const completedN = Object.values(all).filter(p => p && p.completed).length;

  // ---- left: the one next step (its number, title, keys and the module's path), then the chapter as a path
  const nodesOf = r => r.lessons.map(l => ({ id: l.id, num: l.n, title: l.title, kind: l.kind === 'challenge' ? 'challenge' : 'lesson', st: l.next ? 'next' : l.status, href: '#/lesson/' + l.id }));
  let nextPanel;
  if (next.kind === 'none') nextPanel = continueHtml({ title: t('home_all_done', { n: chapter === CHAPTERS[0] ? 1 : 2 }), id: 'homeResume', button: buttonHtml({ label: t('rail_practice'), key: 'Enter', href: '#/practice', primary: true, id: 'homeResume' }) });
  else {
    const l = next.lesson;
    const row = rows.find(r => r.lessons.some(x => x.id === l.id)) || null;
    const num = row ? (row.lessons.find(x => x.id === l.id) || {}).n : '';
    const button = next.kind === 'assessment' ? buttonHtml({ label: t('home_start_assessment'), key: 'Enter', href: '#/lesson/' + l.id, primary: true, id: 'homeResume' })
      : next.kind === 'pro' ? buttonHtml({ label: t('paywall_go_pro'), key: 'Enter', href: '#/pricing', primary: true, id: 'homeResume' })
      : buttonHtml({ label: next.started ? t('home_resume') : t('home_start'), key: 'Enter', href: '#/lesson/' + l.id, primary: true, id: 'homeResume' });
    nextPanel = continueHtml({ num, title: next.kind === 'assessment' ? t('home_next_assessment', { n: 1 }) : l.title, eyebrow: next.kind === 'pro' ? t('paywall_pro') : t('learn_up_next'), where: next.module, keys: routeKeys(l.solution),
      nodes: row && next.kind === 'lesson' ? nodesOf(row) : [], place: next.of ? t('home_lesson_of', { n: next.n, m: next.of }) : '', line: next.kind === 'pro' ? siteCopy('paywall_line', 'Get full access for the rest of the content.') : '', id: 'homeResume', button });
  }
  const chapterN = (CHAPTERS.indexOf(chapter) >= 0 ? CHAPTERS.indexOf(chapter) : 0) + 1;
  const modRows = rows.map(r => moduleRowHtml({ ...r, nodes: nodesOf(r) }, { status: r.status === 'complete' || r.current ? r.statusText : '', minutes: fmtMinutes(r.minutes), href: '#/learn?ch=' + chapter.id + '&doc=' + r.id })).join('');
  const chapterPanel = panelHtml({ heading: esc(t('chapter_heading', { n: chapterN, name: chapter.title })), facts: esc(t('chapter_modules_done', { d: rows.filter(r => r.status === 'complete').length, m: rows.length })), body: `<div class="mod-list">${modRows}</div>`, cls: 'home-chapter', stretch: true });

  // ---- right: Level, Today, Achievements
  const lv = game.levelInfo;
  const reward = lv.lvl < MAX_LEVEL ? rewardAt(lv.lvl + 1) : null;
  const levelPanel = panelHtml({ heading: esc(t('home_level', { n: lv.lvl })), facts: esc(t('home_xp', { n: lv.into, next: lv.need })), body: `${barHtml(lv.pct, 'bar-level')}<div class="level-next">${rewardTileHtml(reward, lv.lvl < MAX_LEVEL ? lv.lvl + 1 : lv.lvl)}<span class="level-next-words">${reward ? `<span>${esc(t('home_next_reward', { n: lv.lvl + 1 }))} <b>${esc(reward.label)}</b></span><span>${esc(t('home_xp_to_go', { n: Math.max(0, lv.need - lv.into) }))}</span>` : `<span>${esc(t('home_top_level'))}</span>`}</span></div><p class="panel-line ink-2 xp-why">${esc(t('home_xp_why'))} <a href="#/?tour=1">${esc(t('home_tour'))}</a></p>`, cls: 'home-level' });

  const played = store.attempts({ kind: 'daily', day }).filter(a => a.secs != null);
  const clean = played.filter(a => a.clean).sort((a, b) => a.secs - b.secs);
  const daily = clean[0] ? { played: true, clean: true, secs: clean[0].secs, place: null, of: null } : played.length ? { played: true, clean: false } : { played: false };
  const dailyDrill = DRILLS.find(d => d.id === dailyFor(day).drillId) || null;
  const queue = dueToday(schedule.stateOrBackfill(all, liveLessons()), moduleCtx(all));
  let quests = null; try { quests = questBoard(); } catch (e) { /* no quests this visit */ }
  const today = todayModel({ queue, daily, dailyTitle: dailyDrill ? dailyDrill.title : '', completedLessons: completedN, dailyXp: xpForEvent({ kind: 'daily', day }, []), quests, weekOpen: !!(ctx.query && ctx.query.week === '1') });
  const week = weekCells(game.days || [], day); const letters = weekLetters();
  const rowCls = r => ['row-today', r.done ? 'done' : '', r.quest ? 'row-quest' : '', r.sub === true ? 'row-week-q' : '', r.bonus ? 'row-bonus m-quests-done' : '', r.week ? 'row-week' : ''].filter(Boolean).join(' ');
  const todayRows = today.rows.map(r => `<tr class="${rowCls(r)}" data-cursor tabindex="-1" data-href="${esc(r.href)}"${r.week ? ` aria-expanded="${r.open ? 'true' : 'false'}"` : ''}><td class="n">${r.week ? `<span class="week-caret${r.open ? ' open' : ''}" aria-hidden="true"></span>` : `<span class="tick${r.done ? ' on' : ''}" aria-hidden="true"></span>`}</td><td>${r.bonus || r.week ? '' : modeMarkHtml(r.mode)}<span class="row-name">${esc(r.title)}</span>${r.line ? `<span class="row-sub">${esc(r.line)}</span>` : typeof r.sub === 'string' ? `<span class="row-sub">${esc(r.sub)}</span>` : ''}${r.bar != null ? barHtml(r.bar, 'bar-quest') : ''}</td><td class="num len">${esc(r.length)}</td><td class="num xp">${r.xpText ? esc(r.xpText) : r.xp ? esc(t('home_xp_plus', { n: r.xp })) : r.done ? esc(t('status_done')) : ''}</td></tr>`).join('');
  const todayPanel = panelHtml({ heading: esc(t('home_today')), facts: esc(t('home_today_done', { d: today.done, n: today.of })), body: `${today.fresh ? `<p class="panel-line">${esc(t('quests_fresh'))}</p>` : ''}<table class="tbl tbl-today"><tbody>${todayRows}</tbody></table>
      <div class="streak-row"><span class="week" aria-hidden="true">${week.cells.map((on, i) => `<i class="${on ? 'on' : ''}${i === week.today ? ' today' : ''}">${esc(letters[i] || '')}</i>`).join('')}</span><span class="panel-facts">${game.streakDays ? esc(t('home_streak_day', { n: game.streakDays })) : ''}</span></div>`, cls: 'home-today' });

  const ach = achievementsModel(evaluateAchievements(game));
  const achPanel = panelHtml({ heading: esc(t('home_achievements')), facts: esc(t('home_count_of', { n: ach.earned, m: ach.of })), body: `<div class="badge-grid">${ach.shown.map(badgeTile).join('')}${ach.earned < 5 ? Array.from({ length: 5 - ach.earned }, () => '<span class="badge-tile locked" aria-hidden="true">?</span>').join('') : ''}</div>
      ${ach.next ? `<div class="ach-next" data-cursor tabindex="-1" data-href="#/account?section=profile"><div class="row-line"><span class="row-name">${esc(t('home_ach_next', { badge: ach.next.def.name }))}</span><span class="panel-facts">${esc(t('home_count_of', { n: ach.next.prog, m: ach.next.goal }))}</span></div><span class="row-sub">${esc(ach.next.def.desc)}</span>${barHtml(100 * ach.next.prog / ach.next.goal, 'bar-ach')}</div>` : ''}`, cls: 'home-ach', stretch: true });

  const nudge = completedN >= 1 ? saveNudgeHtml() : '';
  el.innerHTML = `<div class="pg-two"><div class="pg-main">${nextPanel}${chapterPanel}</div><div class="pg-side">${nudge}${levelPanel}${todayPanel}${achPanel}${certTeaserHtml(courseNow())}</div></div>`;
  wireSaveNudge(el);
  root.appendChild(el);
  const unwire = wireRows(el);
  if (ctx.keytips) ctx.keytips.register([
    { id: 'resume', label: next.kind === 'pro' ? t('paywall_go_pro') : t('home_resume'), el: el.querySelector('#homeResume') },
    { id: 'today', label: t('home_today'), el: el.querySelector('.home-today'), action: () => { const r = el.querySelector('.row-today'); if (r && ctx.cursor) ctx.cursor.select(r); } },
    { id: 'achievements', label: t('home_achievements'), el: el.querySelector('.home-ach'), action: () => { location.hash = '#/account?section=profile'; } },
  ]);
  setTimeout(() => { if (ctx.cursor) ctx.cursor.select(0, { focus: false }); }, 0);
  return { destroy() { unwire(); el.remove(); } };
}
