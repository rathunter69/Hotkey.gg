// app2/app/learn-page.js — Learn (screenplay 3.0 "Learn"; 3.5; M89): page tabs for the six
// chapters, the chapter as a table (a row per module with its number, title, minutes, status and
// tier marks, the open module's lessons under it, the next lesson selected), and beside it the
// page the selected module builds. A Pro chapter on a free account shows the paywall panel in
// place of its lessons. The case's name stays off the page. The pure helpers (statusOf,
// pickNextLesson, moduleStatus, pathModel, chapterModel) are shared with Home and tested.
import { CHAPTERS, LESSONS, modulesOf } from '../content/index.js';
import { store } from './store.js';
import { prefs } from './prefs.js';
import { entitlement } from './entitlement.js';
import { COURSE } from './progress-model.js';
import { moduleNumber, FINAL_MODULE, isFinalItem } from './numbering.js';
import { siteCopy, moduleCopy } from '../content/copy/apply.js';
import { esc, fill, fmtMinutes } from '../ui/components/format.js';
import { panelHtml, tableHtml, tabsHtml, wireTabs, buttonHtml, wireRows } from '../ui/components/table.js';
import { tierMarksHtml } from '../ui/components/marks.js';
import { paywallHtml } from '../ui/components/paywall.js';
import { auth } from './auth.js';
import { sheetPreviewHtml, previewOfLesson } from '../ui/components/sheet-preview.js';
import { routeKeys, keysRowHtml, chapterCardsHtml, moduleRowHtml, continueHtml } from '../ui/components/path.js';
import { ACHIEVEMENTS } from '../content/achievements.js';
import { saveNudgeHtml, wireSaveNudge } from '../ui/components/nudge.js';
import { badgeArt } from '../ui/badges.js';

const t = (key, vars) => fill(siteCopy(key, key), vars);

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

/** The lessons this account can open: a paid lesson is out until the account holds the tier (the lock page, otherwise). */
export const openLessons = lessons => lessons.filter(l => !entitlement.locked(l));

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

/**
 * A module's standing from the progress map (C2 gap 9): 'complete' needs every lesson done AND the
 * challenge passed at any tier; all lessons without the challenge is 'lessons-done'; anything
 * touched is 'started'; else 'todo'. Pure.
 */
export function moduleStatus(module, all) {
  const ids = (module.lessons || []).map(l => (typeof l === 'string' ? l : l.id));
  const p = id => (all && all[id]) || null;
  const done = ids.filter(id => p(id) && p(id).completed).length;
  const chId = module.challenge && (typeof module.challenge === 'string' ? module.challenge : module.challenge.id);
  const chPassed = !!(chId && p(chId) && (p(chId).challenge || p(chId).completed));
  if (ids.length && done === ids.length) return chPassed || !chId ? 'complete' : 'lessons-done';
  if (done || chPassed || ids.some(id => p(id) && (p(id).started || p(id).completed))) return 'started';
  return 'todo';
}

/**
 * The Learn path's data (C2 gap 9): a chapter's modules with status, ring counts and their items
 * in order — the challenge last, carrying its best tier. `next` marks the first open item. Pure.
 */
export function pathModel(chapter, all, skipped) {
  const mods = modulesOf(chapter);
  let nextMarked = false;
  return mods.map(m => {
    const items = [...m.lessons.map(l => ({ id: l.id, title: l.title, kind: 'lesson', st: statusOf(l.id, all, skipped) }))];
    if (m.challenge) {
      const p = (all && all[m.challenge.id]) || null;
      items.push({ id: m.challenge.id, title: m.challenge.title, kind: 'challenge', st: p && (p.challenge || p.completed) ? 'done' : 'todo', tier: (p && p.tier) || null });
    }
    for (const it of items) {
      if (!nextMarked && it.st !== 'done' && it.st !== 'mastered' && it.st !== 'skipped') { it.next = true; nextMarked = true; }
    }
    const done = items.filter(i => i.st === 'done' || i.st === 'mastered').length;
    return { id: m.id, title: m.title, status: moduleStatus(m, all), done, total: items.length, items };
  });
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

/** The minutes a lesson takes: its own figure, else its time limit, else nothing. */
export const lessonMinutes = l => (Number.isFinite(l && l.minutes) ? l.minutes : Number.isFinite(l && l.timeLimit) ? Math.max(1, Math.round(l.timeLimit / 60)) : 0);
/** A challenge's name where the row already says it is one: 'Challenge: find and mark' → 'Find and mark'. */
export const plainTitle = s => { const x = String(s || '').replace(/^Challenge:\s*/i, ''); return x.charAt(0).toUpperCase() + x.slice(1); };

/**
 * The chapter as the table shows it (3.0, Home and Learn; 3.5's status words): one row per module
 * with its number, title, minutes, status, the challenge's tier and its lessons (the challenge
 * last, then for module 1.8 the project, the assessment and the test-out), with the next open
 * item marked. `gate` is the chapter's record ({ assessment, testout }). Pure.
 */
export function chapterModel(chapter, all = {}, skipped = [], gate = {}) {
  const mods = modulesOf(chapter);
  let nextMarked = false;
  const mark = it => { if (!nextMarked && it.status !== 'done' && it.status !== 'skipped') { it.next = true; nextMarked = true; } return it; };
  const lessonRow = (l, n) => mark({ id: l.id, n, title: l.kind === 'challenge' ? plainTitle(l.title) : l.title, kind: l.kind || 'lesson', minutes: lessonMinutes(l), status: lessonStatusWord(l, all, skipped) });
  const rows = mods.map((m, k) => {
    const num = moduleNumber(m.id, k + 1);
    const lessons = m.lessons.map((l, i) => lessonRow(l, `${num}.${i + 1}`));
    if (m.challenge) lessons.push(lessonRow(m.challenge, `${num}.C`));
    const st = moduleStatus(m, all);
    const ch = m.challenge ? all[m.challenge.id] : null;
    const row = { id: m.id, n: num, title: m.title, minutes: lessons.reduce((s, l) => s + l.minutes, 0), status: st, tier: (ch && (ch.challenge || ch.completed) && ch.tier) || 'none', lessons };
    const cur = lessons.find(l => l.next);
    row.current = !!cur;
    const main = lessons.filter(l => l.kind !== 'challenge');   // "Lesson n of m" counts the lessons, not the challenge, as Home does
    row.statusText = statusWord(st, cur ? { n: Math.max(1, main.indexOf(cur) + 1), m: main.length } : null);
    return row;
  });
  // module 1.8: the project, the assessment and the test-out, whether the catalog carries them as a module or a section
  const verified = !!(gate && (gate.assessment || gate.testout));
  const assess = chapter.lessons.find(l => l.kind === 'assessment');
  const a = assess && all[assess.id];
  const own = rows.find(r => r.id === FINAL_MODULE.id);
  if (own) {
    own.final = true;
    if (verified) { own.status = 'complete'; own.statusText = t('status_verified'); own.tier = (a && a.tier) || own.tier; }
  } else {
    const finals = chapter.lessons.filter(l => isFinalItem(l));
    if (finals.length) {
      const main = finals.filter(l => l.kind !== 'testout');
      const label = { project: 'P', assessment: 'A', testout: 'T' };
      const lessons = finals.map(l => lessonRow(l, `${FINAL_MODULE.n}.${label[l.kind] || ''}`));
      const doneN = main.filter(l => all[l.id] && all[l.id].completed).length;
      const st = verified ? 'complete' : doneN || main.some(l => all[l.id] && all[l.id].started) ? 'started' : 'todo';
      const copy = moduleCopy(FINAL_MODULE.id);
      const cur = lessons.find(l => l.next && l.kind !== 'testout');
      rows.push({ id: FINAL_MODULE.id, n: FINAL_MODULE.n, title: (copy && copy.name) || FINAL_MODULE.title, minutes: lessons.filter(l => l.kind !== 'testout').reduce((s, l) => s + l.minutes, 0), status: st, tier: (verified && a && a.tier) || 'none', lessons, current: !!cur, final: true,
        statusText: verified ? t('status_verified') : statusWord(st, cur ? { n: main.findIndex(l => l.id === cur.id) + 1, m: main.length } : null) });
    }
  }
  return rows;
}

function lessonStatusWord(l, all, skipped) {
  const s = statusOf(l.id, all, skipped);
  return s === 'done' || s === 'mastered' ? 'done' : s;
}
/** The status words of 3.5. */
export function statusWord(status, cur) {
  if (status === 'complete') return t('status_complete');
  if (status === 'lessons-done') return t('status_lessons_done');
  if (cur) return t('status_lesson_of', cur);   // the current module says where the learner is, started or not
  if (status === 'started') return t('status_in_progress');
  if (status === 'coming') return t('status_coming');
  return t('status_not_started');
}

/** The chapters the page tabs offer: the six of the course, each with its built content when it has landed. */
export function chapterTabs() {
  return COURSE.chapters.map(c => {
    const built = CHAPTERS.find(ch => ch.id === c.id) || CHAPTERS.find(ch => (CHAPTER_PLAN.find(p => p.id === ch.id) || {}).n === c.n) || null;
    return { key: c.id, n: c.n, title: built ? built.title : c.title, built, access: c.n === 1 ? 'free' : 'paid' };
  });
}

/** The page a module builds: its project's sheet when it has one, else its last lesson's; `delivered` shows the after state. */
export function modulePreview(chapter, moduleId, delivered) {
  const lessons = chapter.lessons.filter(l => l.module === moduleId && l.kind !== 'testout' && l.kind !== 'assessment');
  const built = lessons.filter(l => l.kind !== 'challenge');   // a module's challenge runs on another location's file, not the page this module builds
  const last = lessons.find(l => l.kind === 'project') || built[built.length - 1] || lessons[lessons.length - 1];
  const first = lessons[0];
  if (!last) return null;
  return previewOfLesson(delivered ? last : first, delivered ? 'after' : 'before');
}

/** The badge a module pays out when it is finished (the def names its module), or null. */
export function moduleBadge(moduleId) {
  return ACHIEVEMENTS.find(a => a.module === moduleId) || null;
}

/** The next lesson the learner can open, with where it sits; null when none is left. Pure over the store's shape. */
export function continueModel(all, skipped, { locked = () => false } = {}) {
  const open = LESSONS.filter(l => l.kind !== 'testout' && l.module !== 'welcome' && !locked(l));
  const next = pickNextLesson(open, all, skipped);
  if (!next) return null;
  const chapter = CHAPTERS.find(c => c.lessons.includes(next)) || null;
  const mods = chapter ? modulesOf(chapter) : [];
  const k = mods.findIndex(m => m.lessons.includes(next) || (m.challenge && m.challenge.id === next.id));
  const m = mods[k] || null;
  const num = m ? moduleNumber(m.id, k + 1) : '';
  const i = m ? m.lessons.indexOf(next) : -1;
  return { lesson: next, chapter, module: m, num: m ? (i >= 0 ? `${num}.${i + 1}` : `${num}.C`) : '', started: !!(all[next.id] && all[next.id].started), keys: routeKeys(next.solution) };
}

export function mountLearnPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'pg pg-learn';
  const tabs = chapterTabs();
  const q = (ctx && ctx.query) || {};
  const all0 = store.all(); const skipped0 = prefs.get().skipped;
  const cont = continueModel(all0, skipped0, { locked: l => entitlement.locked(l) });
  const contTab = cont && cont.chapter ? tabs.find(x => x.built === cont.chapter) : null;
  let chapterKey = (tabs.find(x => x.key === q.ch) || contTab || tabs[0]).key;
  let openModule = q.doc || null;
  let unwire = null;

  /** The six chapter cards: the number on a key, the bar, the count or what opens it. */
  function cards(all, skipped) {
    return tabs.map(x => {
      const rows = x.built ? chapterModel(x.built, all, skipped, store.chapter(x.key)) : [];
      const done = rows.filter(r => r.status === 'complete').length;
      const locked = x.access === 'paid' && !entitlement.entitled();
      return { key: x.key, n: x.n, title: x.title, on: x.key === chapterKey, locked, pct: rows.length ? 100 * done / rows.length : 0,
        note: x.access === 'free' ? t('learn_free') : locked ? t('paywall_pro') : '',
        count: rows.length ? t('chapter_modules_done', { d: done, m: rows.length }) : t('learn_being_written') };
    });
  }

  /** The continue strip: the one obvious next step, its number on a key, the keys it teaches, Enter. */
  function nextStepHtml() {
    if (!cont) return '';
    const l = cont.lesson;
    const label = cont.started ? t('home_resume') : t('home_start');
    const where = cont.module ? cont.module.title : '';
    return continueHtml({ num: cont.num, title: l.title, where, keys: cont.keys, eyebrow: t('learn_up_next'), id: 'learnGo', button: buttonHtml({ label, key: 'Enter', href: '#/lesson/' + l.id, primary: true, id: 'learnGo' }) });
  }

  function render(focusTab) {
    const tab = tabs.find(x => x.key === chapterKey);
    const all = store.all(); const skipped = prefs.get().skipped;
    const locked = tab.access === 'paid' && !entitlement.entitled();
    const gate = store.chapter(tab.key);
    const rows = tab.built ? chapterModel(tab.built, all, skipped, gate) : [];
    if (!openModule || !rows.some(r => r.id === openModule)) openModule = (rows.find(r => r.current) || rows.find(r => r.status !== 'complete') || rows[0] || {}).id || null;
    const open = rows.find(r => r.id === openModule) || null;

    // the chapter: a row per module with its path of lessons, the open module's lessons under it
    const list = rows.map(r => {
      const nodes = r.lessons.map(l => ({ id: l.id, num: l.n, title: l.title, kind: l.kind === 'challenge' ? 'challenge' : 'lesson', st: l.next ? 'next' : l.status, href: locked ? '' : '#/lesson/' + l.id }));
      const isOpen = r.id === openModule && !locked;
      let lessons = '';
      if (isOpen) lessons = `<div class="mod-lessons">${r.lessons.map(l => {
        const lesson = LESSONS.find(x => x.id === l.id);
        const word = l.status === 'done' ? t('status_done') : l.status === 'started' ? t('status_in_progress') : l.status === 'skipped' ? t('status_skipped') : l.next ? t('learn_up_next') : '';
        return `<a class="ls-row${l.next ? ' next' : ''} ls-${esc(l.status)}${l.kind === 'challenge' ? ' ls-ch' : ''}" href="#/lesson/${esc(l.id)}" data-lesson="${esc(l.id)}" data-cursor tabindex="-1"><span class="ls-n">${esc(l.n)}</span><span class="ls-title">${esc(l.title)}</span>${keysRowHtml(routeKeys(lesson && lesson.solution), { max: 3 })}<span class="ls-st">${esc(word)}</span></a>`;
      }).join('')}</div>`;
      return moduleRowHtml({ ...r, nodes }, { open: isOpen, locked, status: r.status === 'complete' ? r.statusText : r.current ? r.statusText : '', minutes: fmtMinutes(r.minutes) }) + lessons;
    }).join('');
    const plan = CHAPTER_PLAN.find(p => p.n === tab.n);
    const heading = t('chapter_heading', { n: tab.n, name: tab.title });
    const doneN = rows.filter(r => r.status === 'complete').length;
    let facts = rows.length ? esc(t('chapter_modules_done', { d: doneN, m: rows.length })) : esc(t('status_coming'));
    if (tab.n === 1 && tab.built) {
      const to = tab.built.lessons.find(l => l.kind === 'testout');
      if (to) facts = (gate.testout || gate.assessment ? esc(t('learn_verified')) + ',' : `<a href="#/lesson/${esc(to.id)}">${esc(t('learn_testout'))}</a>`) + ' ' + facts;
    }
    const body = rows.length ? `<div class="mod-list${locked ? ' mod-list-locked' : ''}">${list}</div>` : `<p class="panel-line">${esc(t('learn_coming', { n: tab.n }))}</p>${plan ? `<p class="panel-line">${esc(plan.line)}</p>` : ''}`;
    const paywall = locked ? paywallHtml({ heading: t('paywall_chapter', { n: tab.n, name: tab.title }), signedIn: auth.state() === 'in', mode: 'learn', ids: { go: 'learnGoPro', notNow: 'learnNotNow' } }) : '';   // the one paywall panel (M105)
    let side = '';
    if (open && tab.built && !locked) {
      const delivered = open.status === 'complete' || prefs.get().pagesDelivered.includes(open.id);   // the module's challenge hands the page in (lesson-view.js)
      const copy = moduleCopy(open.id);
      const pageName = (copy && copy.page_name) || open.title;
      const beat = copy && copy.story_beat ? String(copy.story_beat).split('||')[0].trim() : '';
      const modKeys = [...new Set(open.lessons.flatMap(l => { const x = LESSONS.find(y => y.id === l.id); return routeKeys(x && x.solution, 4); }))];
      const badge = moduleBadge(open.id);
      const earned = open.status === 'complete';
      const reward = badge ? `<div class="learn-reward${earned ? ' on' : ''}">${badgeArt(badge, { done: earned, size: 40 })}<span><span class="row-name">${esc(badge.name)}</span><span class="row-sub">${esc(earned ? t('learn_reward_earned') : t('learn_reward', { module: open.title }))}</span></span></div>` : '';
      side = panelHtml({ heading: esc(open.title), facts: esc(t('learn_keys_n', { n: modKeys.length })), body: `${beat ? `<p class="panel-line learn-beat">${esc(beat)}</p>` : ''}<div class="learn-keys">${keysRowHtml(modKeys, { max: 14 })}</div><p class="panel-line ink-2">${esc(delivered ? t('learn_page_built', { page: pageName }) : t('learn_page_fill'))}</p>${delivered && open.lessons.some(l => l.kind === 'challenge') ? `<a class="panel-link" href="#/lesson/${esc(open.lessons.find(l => l.kind === 'challenge').id)}?seed=new">${esc(t('learn_replay'))}</a>` : ''}${reward}`, cls: 'learn-side', stretch: true });
    } else if (locked) side = paywall;
    // before Chapter 1 ends (Wolf, 2026-10-02, point 25): past its halfway module, a guest is offered the account that keeps it
    if (tab.n === 1 && !locked && rows.length && doneN >= Math.ceil(rows.length / 2)) side = saveNudgeHtml({ line: t('save_line_ch1') }) + side;
    el.innerHTML = `${nextStepHtml()}${chapterCardsHtml(cards(all, skipped), t('rail_learn'))}
      <div class="pg-two"><div class="pg-main">${panelHtml({ heading: esc(heading), facts, body, cls: 'learn-table', stretch: true })}</div><div class="pg-side">${side}</div></div>`;
    wireSaveNudge(el);
    wireTabs(el, (key, viaKeys) => { chapterKey = key; openModule = null; render(viaKeys); });
    if (unwire) unwire();
    unwire = wireRows(el);
    el.querySelectorAll('.mod-row[data-cursor]').forEach(r => { r.addEventListener('click', e => { if (e.target.closest('a')) return; openModule = r.dataset.module; render(); selectNext(); }); });
    const notNow = el.querySelector('#learnNotNow'); if (notNow) notNow.onclick = () => { chapterKey = tabs[0].key; openModule = null; render(); };
    if (focusTab) { const on = el.querySelector('.tab.on'); if (on) on.focus(); }
    if (ctx.keytips) ctx.keytips.register([...(cont ? [{ id: 'continue', label: t('home_resume'), el: el.querySelector('#learnGo') }] : []), ...tabs.map(x => ({ id: x.key, label: t('learn_tab', { n: x.n }), el: el.querySelector(`.tab[data-tab="${x.key}"]`) }))]);
    if (ctx.cursor) ctx.cursor.refresh();
  }
  function selectNext() {
    const c = ctx.cursor; if (!c) return;
    const target = el.querySelector('.learn-continue') || el.querySelector('.ls-row.next') || el.querySelector('.row-module.open') || el.querySelector('[data-cursor]');
    if (target) c.select(target, { focus: false });
  }
  const onKey = e => {
    if (e.key === 'Escape' && !e.defaultPrevented) { const nn = el.querySelector('#learnNotNow'); if (nn) { e.preventDefault(); nn.click(); } }
  };
  document.addEventListener('keydown', onKey);
  render();
  root.appendChild(el);
  setTimeout(selectNext, 0);
  return { destroy() { document.removeEventListener('keydown', onKey); if (unwire) unwire(); el.remove(); } };
}
