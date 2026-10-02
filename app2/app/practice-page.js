// app2/app/practice-page.js — Practice (screenplay 3.0 "Practice"; 3.10; M89, M97). Practice opens
// on Drills: the header block ("Drills", one line, the length and "Start drilling" on Enter), the
// set from app/set-picker.js, and the catalog in two columns by chapter (name, length, your best,
// tier marks), the selected row carrying the cursor and Enter playing it. The Daily, Rapid-fire
// and Challenges are each their own page under Practice in the rail, with the same header block
// and a table or board below. One shared table component serves them all. The pure parts
// (catalogRows, setLine, drillUnlocked, the older helpers) are tested.
import { lessonNumber, CHAPTERS, modulesOf, moduleOf, lessonById } from '../content/index.js';
import { DRILLS, DRILLS_BY_ID } from '../content/drills.js';
import { CATALOG } from '../content/catalog.js';
import { pickSet, SET_LENGTHS } from './set-picker.js';
import { store } from './store.js';
import { prefs } from './prefs.js';
import { settings } from './settings.js';
import { entitlement } from './entitlement.js';
import { dailyFor } from './daily.js';
import { dayOf } from './records.js';
import { tierAtLeast } from './pars.js';
import { statusOf, chapterTabs } from './learn-page.js';
import { moduleNumber, itemNumber } from './numbering.js';
import { schedule, dueToday } from './schedule.js';
import { COURSE } from './progress-model.js';
import { siteCopy } from '../content/copy/apply.js';
import { esc, fill, fmtClock, fmtLength, numberWord, prettyDay } from '../ui/components/format.js';
import { panelHtml, tableHtml, buttonHtml, headerBlockHtml, wireRows, wireTabs } from '../ui/components/table.js';
import { routeKeys, keysRowHtml, chapterCardsHtml, drillTileHtml } from '../ui/components/path.js';
import { tierMarksHtml } from '../ui/components/marks.js';
import { paywallHtml } from '../ui/components/paywall.js';
import { auth } from './auth.js';
import { mountBoard } from './leaderboard-page.js';
import { liveLessons, moduleCtx } from './home-page.js';

const t = (key, vars) => fill(siteCopy(key, key), vars);
const TIER_LABEL = { pass: 'pass', pro: 'pro', legendary: 'legendary' };
/** One unit format for every time on the page: 'best 12.3 s', pars '4 s'. */
export const fmtSecs = n => (Math.round(n * 10) / 10).toFixed(1) + ' s';

/**
 * The module whose lessons teach each drill's keys: the LAST one it leans on (Insert and amend
 * moves rows, from 1.4, but ends on amending a total, taught in 1.6; the benchmark sits with 1.7). The module challenges carry their
 * own module. A drill missing here gets no tag; the practice test keeps the map complete.
 */
export const DRILL_MODULE = {
  'get-around': 'move-and-select',
  'enter-and-fill': 'enter-edit-copy-fill', 'find-and-fix': 'enter-edit-copy-fill', 'paste-surgeon': 'enter-edit-copy-fill',
  'row-wrangler': 'structure',
  'format-the-weekly-page': 'format',
  'insert-and-amend': 'formulas', 'formula-sprint': 'formulas', 'combine-two-tabs': 'formulas',
  'before-you-send': 'present-and-audit', 'weekly-sales-report': 'present-and-audit',
};

/** A drill's teaching module ({ id, n, title, lessons }) or null. */
export function drillModule(drill) {
  const id = (drill && (drill.kind === 'challenge' ? drill.module : DRILL_MODULE[drill.id])) || null;
  const ch = (drill && drill.kind === 'challenge' && CHAPTERS.find(c => c.id === drill.chapter)) || CHAPTERS[0];
  const k = id && ch ? modulesOf(ch).findIndex(m => m.id === id) : -1;
  if (k < 0) return null;
  const m = modulesOf(ch)[k];
  return { id: m.id, n: moduleNumber(m.id, k + 1), title: m.title, lessons: m.lessons };
}

/** Whether a module's lessons are all behind the learner: completed, or skipped by placement. */
export function moduleTaught(mod, all, skipped) {
  if (!mod || !mod.lessons.length) return false;
  return mod.lessons.every(l => { const s = statusOf(l.id, all, skipped); return s === 'done' || s === 'mastered' || s === 'skipped'; });
}

/** A challenge's name as Learn lists it: 'Challenge: find and mark' → 'Find and mark'. */
export const challengeName = s => { const x = String(s || '').replace(/^Challenge:\s*/i, ''); return x.charAt(0).toUpperCase() + x.slice(1); };

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

/** The lessons that teach a drill: the catalog's teaching lesson, else the module DRILL_MODULE names. */
export function teachingLessons(entry) {
  if (entry.lesson) { const l = lessonById(entry.lesson); return l ? [l] : []; }
  const m = drillModule({ id: entry.id, kind: entry.mode === 'challenge' ? 'challenge' : 'drill', module: entry.module, chapter: entry.chapter });
  return m ? m.lessons : [];
}

/**
 * Is a drill unlocked: its teaching lessons are done or skipped; a drill with none is open.
 * Returns { open, after } where `after` is the module number to finish first. Pure.
 */
export function drillUnlocked(entry, all, skipped) {
  const lessons = teachingLessons(entry);
  if (!lessons.length) return { open: true, after: '' };
  const open = lessons.every(l => { const s = statusOf(l.id, all, skipped); return s === 'done' || s === 'mastered' || s === 'skipped'; });
  if (open) return { open: true, after: '' };
  const at = moduleOf(lessons[lessons.length - 1]);
  return { open: false, after: at ? moduleNumber(at.module.id, at.k) : '' };
}

/**
 * The catalog by chapter (3.0, Practice): [{ id, n, title, rows: [{ id, title, length, best, tier, open, after, pro }], passed, of }]
 * over the catalog's drill entries (mode 'drill'). `bests` is { id: { secs, tier } }. Pure.
 */
export function catalogRows(catalog, { all = {}, skipped = [], bests = {}, pro = false } = {}) {
  const groups = [];
  for (const c of COURSE.chapters) {
    const entries = catalog.filter(e => e.mode === 'drill' && e.chapter === c.id);
    if (!entries.length) continue;
    const rows = entries.map(e => {
      const u = drillUnlocked(e, all, skipped);
      const b = bests[e.id] || null;
      return { id: e.id, title: e.title, length: e.length, best: b ? b.secs : null, tier: (b && b.tier) || 'none', open: u.open, after: u.after, pro: e.access === 'paid' && !pro };
    });
    const built = CHAPTERS.find(ch => ch.id === c.id);
    groups.push({ id: c.id, n: c.n, title: built ? built.title : c.title, rows, passed: rows.filter(r => r.tier !== 'none').length, of: rows.length });
  }
  return groups;
}

/**
 * The header's line: "Six drills picked for you, about ten minutes." When the open drills cannot fill the chosen
 * length (`budgetMins`), the line says so instead of reading as a short set for a long choice. Pure.
 */
export function setLine(count, secs, budgetMins) {
  if (!count) return t('practice_set_none');
  const mins = Math.max(1, Math.round(secs / 60));
  const minutes = mins === 1 ? t('practice_one_minute') : t('practice_minutes', { n: numberWord(mins) });
  const short = budgetMins && secs < budgetMins * 60 * 0.75;
  if (short) return count === 1 ? t('practice_set_short_one', { minutes }) : t('practice_set_short', { count: numberWord(count, { capital: true }), minutes });
  return count === 1 ? t('practice_set_line_one', { minutes }) : t('practice_set_line', { count: numberWord(count, { capital: true }), minutes });
}

/** The drills that hold the keys due a refresher: a drill whose teaching lesson teaches a due concept. */
export function dueDrills(catalog, dueConcepts) {
  const due = new Set(dueConcepts || []);
  if (!due.size) return [];
  return catalog.filter(e => teachingLessons(e).some(l => (l.teaches || []).some(c => due.has(c)))).map(e => e.id);
}

const bestsOf = () => { const out = {}; for (const d of DRILLS) { const pb = store.pb(d.id); if (pb) out[d.id] = { secs: pb.secs, tier: bestTier(store.attempts({ ref: d.id })) }; } return out; };

/* ---------------- the four pages ---------------- */

function drillsPage(el, ctx) {
  const all = store.all(); const skipped = prefs.get().skipped;
  const pro = entitlement.entitled();
  const bests = bestsOf();
  const groups = catalogRows(CATALOG, { all, skipped, bests, pro });
  const unlocked = CATALOG.filter(e => drillUnlocked(e, all, skipped).open).map(e => e.id);
  const queue = dueToday(schedule.stateOrBackfill(all, liveLessons()), moduleCtx(all));
  const due = dueDrills(CATALOG, queue.items.filter(i => i.kind === 'micro').map(i => i.id));
  const q = (ctx && ctx.query) || {};
  let minutes = Number(settings.get().setLength) || 10;
  let chapterKey = (chapterTabs().find(c => c.key === q.ch) || chapterTabs()[0]).key;
  let paywall = null;
  let unwire = null;
  const keysOf = id => { const e = CATALOG.find(x => x.id === id); return routeKeys(e && e.route && e.route.solution, 6); };
  function render(focusTab) {
    const set = pickSet({ catalog: CATALOG, minutes, pro, due, unlocked, bests });
    const first = set.ids[0] || null;
    const href = first ? `#/drill/${first}?set=${set.ids.join(',')}&len=${minutes}` : '';
    const control = `<label class="picker"><select id="setLen">${SET_LENGTHS.map(n => `<option value="${n}"${n === minutes ? ' selected' : ''}>${esc(t('setting_setLength_' + n))}</option>`).join('')}</select></label>`;
    const header = headerBlockHtml({ title: t('practice_drills'), line: esc(setLine(set.ids.length, set.secs, minutes)), control, button: first ? buttonHtml({ label: t('practice_start'), key: 'Enter', href, primary: true, id: 'startDrilling' }) : '', cls: 'hdr-drills' });
    // the chapters as the same cards Learn uses: the number on a key, the bar, the count or the lock; all six, so what Full Access opens is in view
    const cards = chapterTabs().map(c => {
      const gr = groups.find(x => x.id === c.key);
      const locked = c.access === 'paid' && !pro;
      return { key: c.key, n: c.n, title: c.title, on: c.key === chapterKey, locked, pct: gr && gr.of ? 100 * gr.passed / gr.of : 0,
        note: c.access === 'free' ? t('learn_free') : locked ? t('paywall_pro') : '', count: gr ? t('practice_chapter_fact', { done: gr.passed, of: gr.of }) : t('learn_being_written') };
    });
    const tab = chapterTabs().find(c => c.key === chapterKey) || chapterTabs()[0];
    const g = groups.find(x => x.id === chapterKey) || { id: tab.key, n: tab.n, title: tab.title, rows: [], passed: 0, of: 0 };
    const chLocked = tab.access === 'paid' && !pro;
    const nextId = (g.rows.find(r => r.open && !r.pro && r.best == null) || {}).id;
    const tiles = g.rows.map(r => drillTileHtml({ id: r.id, title: r.title, keys: keysOf(r.id), length: fmtLength(r.length), best: r.best != null ? fmtClock(r.best) : '', tier: r.tier, open: r.open, pro: r.pro, href: '#/drill/' + r.id, next: r.id === nextId },
      { notPlayed: t('practice_not_played'), after: t('practice_after', { n: r.after }), full: t('paywall_pro') })).join('');
    const main = panelHtml({ heading: esc(t('chapter_heading', { n: g.n, name: g.title })), facts: g.of ? esc(t('practice_chapter_fact', { done: g.passed, of: g.of })) : '', body: g.rows.length ? `<div class="dt-grid" data-cursor-cols="3">${tiles}</div>` : `<p class="panel-line">${esc(t('practice_chapter_coming', { n: g.n }))}</p>`, cls: 'catalog', stretch: true });
    // the set, inline: what Start drilling plays, in order, and why each is in it
    const setRows = set.ids.map((id, i) => { const e = CATALOG.find(x => x.id === id); return `<a class="set-row" href="#/drill/${esc(id)}"><kbd class="key set-n">${i + 1}</kbd><span class="set-main"><span class="row-name">${esc(e.title)}</span><span class="row-sub">${esc(t('reason_' + String(set.reasons[id]).replace('-', '_')))}</span></span><span class="set-len">${esc(fmtLength(e.length))}</span></a>`; }).join('');
    const setPanel = panelHtml({ heading: esc(t('practice_set_heading')), facts: set.ids.length ? esc(fmtLength(set.secs)) : '', body: set.ids.length ? `<div class="set-list">${setRows}</div>` : `<p class="panel-line">${esc(t('practice_set_none'))}</p>`, cls: 'set-panel', stretch: true });
    const paywallPanel = paywall || chLocked ? paywallHtml({ heading: paywall ? paywall.title : t('paywall_chapter', { n: tab.n, name: tab.title }), signedIn: auth.state() === 'in', mode: 'drills', ids: { go: 'practiceGoPro', notNow: 'practiceNotNow' } }) : '';   // the one paywall panel (M105)
    el.innerHTML = `${header}${chapterCardsHtml(cards, t('rail_practice'))}<div class="pg-two"><div class="pg-main">${main}</div><div class="pg-side">${paywallPanel || setPanel}</div></div>`;
    const len = el.querySelector('#setLen'); if (len) len.onchange = () => { minutes = Number(len.value); settings.set({ setLength: String(minutes) }); render(); };
    const nn = el.querySelector('#practiceNotNow'); if (nn) nn.onclick = () => { if (!paywall) chapterKey = chapterTabs()[0].key; paywall = null; render(); };
    el.querySelectorAll('[data-pro]').forEach(r => r.addEventListener('click', () => { const e = CATALOG.find(x => x.id === r.dataset.pro); paywall = { title: e ? e.title : '' }; render(); }));
    wireTabs(el, (key, viaKeys) => { chapterKey = key; paywall = null; render(viaKeys); });
    if (unwire) unwire();
    unwire = wireRows(el);
    if (focusTab) { const on = el.querySelector('.tab.on'); if (on) on.focus(); }
    if (ctx.keytips) ctx.keytips.register([{ id: 'start', label: t('practice_start'), el: el.querySelector('#startDrilling') }, ...chapterTabs().map(x => ({ id: x.key, label: t('learn_tab', { n: x.n }), el: el.querySelector(`.tab[data-tab="${x.key}"]`) }))].filter(i => i.el));
    if (ctx.cursor) ctx.cursor.refresh();
  }
  render();
  // the selected item: the header (Enter starts the set), else the next unplayed drill
  setTimeout(() => {
    if (!ctx.cursor) return;
    const pick = el.querySelector('.row-drill.next') || el.querySelector('.row-drill:not(.later):not(.pro)');
    const start = el.querySelector('#startDrilling');
    if (start) ctx.cursor.select(el.querySelector('.hdr'), { focus: false });
    else if (pick) ctx.cursor.select(pick, { focus: false });
  }, 0);
  const onKey = e => { if (e.key === 'Escape' && !e.defaultPrevented) { const nn = el.querySelector('#practiceNotNow'); if (nn) { e.preventDefault(); nn.click(); } } };
  document.addEventListener('keydown', onKey);
  return () => { document.removeEventListener('keydown', onKey); if (unwire) unwire(); };
}

function dailyPage(el, ctx) {
  const day = dayOf(); const pick = dailyFor(day); const drill = DRILLS_BY_ID[pick.drillId] || null;
  const chapterN = drill ? (COURSE.chapters.find(c => c.id === drill.chapter) || {}).n : 1;
  const proNote = drill && drill.access === 'paid' && !entitlement.entitled() ? `<p class="panel-line">${esc(t('daily_pro_note', { n: chapterN }))}</p>` : '';
  el.innerHTML = `${headerBlockHtml({ title: t('daily_title'), facts: esc(prettyDay(day)), line: esc(t('daily_line', { drill: drill ? drill.title : '' })), button: buttonHtml({ label: t('daily_play'), key: 'Enter', href: '#/daily', primary: true, id: 'playDaily' }), cls: 'hdr-daily' })}${proNote}<div class="board-host"></div>`;
  const board = mountBoard(el.querySelector('.board-host'), { ref: pick.drillId, seed: pick.seed, title: drill ? drill.title : t('daily_title'), yours: t('boards_yours', { board: t('rail_daily').replace(/^The /, '') }), dayLabel: '' });
  if (ctx.keytips) ctx.keytips.register([{ id: 'play', label: t('daily_play'), el: el.querySelector('#playDaily') }]);
  setTimeout(() => { if (ctx.cursor) ctx.cursor.select(el.querySelector('.hdr'), { focus: false }); }, 0);
  return () => board.destroy();
}

/** Your best rapid-fire rounds by length: [{ secs, hits, combo }]. Pure over the attempts (splits: hits, misses, best combo, points). */
export function bestRounds(attempts) {
  const by = {};
  for (const a of attempts || []) {
    if (a.kind !== 'rapid') continue;
    const len = Number(String(a.ref || '').replace('rapid-', '')) || a.secs;
    const hits = (a.splits && a.splits[0]) || 0, combo = (a.splits && a.splits[2]) || 0;
    if (!by[len] || hits > by[len].hits) by[len] = { secs: len, hits, combo };
  }
  return Object.values(by).sort((a, b) => a.secs - b.secs);
}

const RAPID_LENS = [30, 60, 120];
const RAPID_LEN_KEY = 'hk2_rapid_len';   // the last length played: a per-viewer convenience, so Enter starts it again
const lastRapidLen = () => { try { const n = Number(localStorage.getItem(RAPID_LEN_KEY)); return RAPID_LENS.includes(n) ? n : 60; } catch (e) { return 60; } };
const keepRapidLen = n => { try { localStorage.setItem(RAPID_LEN_KEY, String(n)); } catch (e) { /* private window */ } };

/**
 * Rapid-fire: one keystroke from here to a round (Wolf, 19). Enter plays the last length, 1, 2 and
 * 3 play that length; the three lengths as tiles with your best at each; how it scores at the side;
 * the deck of commands below with their keys, so the page teaches before the round asks.
 */
function rapidPage(el, ctx) {
  let len = lastRapidLen();
  let RAPID_DECK = [];   // the round's module loads the sheet engine, so the deck arrives after the page draws
  const go = n => { keepRapidLen(n); location.hash = '#/rapid?len=' + n; };
  function render() {
    const rounds = bestRounds(store.attempts({ kind: 'rapid' }));
    const tiles = RAPID_LENS.map((n, i) => { const r = rounds.find(x => x.secs === n);
      return `<button type="button" class="rf-len${n === len ? ' on' : ''}" data-len="${n}" data-cursor tabindex="-1"><span class="rf-len-top"><kbd class="key">${i + 1}</kbd><span class="rf-len-n">${esc(t('rapid_len_' + n))}</span></span><span class="rf-len-best">${r ? `<span><b>${r.hits}</b> ${esc(t('col_hits'))}</span><span><b>${r.combo}</b> ${esc(t('col_combo'))}</span>` : `<span>${esc(t('rapid_none'))}</span>`}</span></button>`; }).join('');
    const deck = RAPID_DECK.map(d => `<div class="rf-card"><span class="rf-card-t">${esc(d.text)}</span>${keysRowHtml(d.keys.split(' '), { max: 3 })}</div>`).join('');
    const how = ['rapid_how_1', 'rapid_how_2', 'rapid_how_3'].map((k, i) => `<li><kbd class="key set-n">${i + 1}</kbd><span>${esc(t(k))}</span></li>`).join('');
    el.innerHTML = `${headerBlockHtml({ title: t('rapid_title'), line: esc(siteCopy('rapid_intro', '')), button: buttonHtml({ label: t('rapid_start_len', { len: t('rapid_len_' + len) }), key: 'Enter', href: '#/rapid?len=' + len, primary: true, id: 'startRound' }), cls: 'hdr-rapid' })}
      <div class="pg-two"><div class="pg-main">${panelHtml({ heading: esc(t('rapid_lengths')), facts: esc(t('rapid_keys_hint')), body: `<div class="rf-lens" data-cursor-cols="3">${tiles}</div>`, cls: 'rounds' })}${panelHtml({ heading: esc(t('rapid_deck')), facts: esc(t('rapid_deck_n', { n: RAPID_DECK.length })), body: `<div class="rf-deck">${deck}</div>`, cls: 'rf-deck-panel', stretch: true })}</div>
      <div class="pg-side">${panelHtml({ heading: esc(t('rapid_how')), body: `<ol class="how-list">${how}</ol><p class="panel-line ink-2">${esc(siteCopy('rapid_fine', ''))}</p>`, cls: 'rf-how', stretch: true })}</div></div>`;
    const startBtn = el.querySelector('#startRound'); if (startBtn) startBtn.onclick = e => { e.preventDefault(); go(len); };
    el.querySelectorAll('.rf-len').forEach(b => { b.onclick = () => go(Number(b.dataset.len)); });
    if (ctx.keytips) ctx.keytips.register([{ id: 'start', label: t('rapid_start'), el: el.querySelector('#startRound') }]);
    if (ctx.cursor) ctx.cursor.refresh();
  }
  render();
  import('./rapid-fire.js').then(m => { RAPID_DECK = m.RAPID_DECK || []; if (el.isConnected || el.parentNode) render(); }).catch(() => {});
  const onKey = e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '')) return;
    if (/^[123]$/.test(e.key)) { e.preventDefault(); go(RAPID_LENS[Number(e.key) - 1]); }
  };
  document.addEventListener('keydown', onKey);
  setTimeout(() => { if (ctx.cursor) ctx.cursor.select(el.querySelector('.hdr'), { focus: false }); }, 0);
  return () => document.removeEventListener('keydown', onKey);
}

/** The challenges table: [{ id, n, title, module, length, best, tier, passed }], in curriculum order. Pure over the challenge drills. */
export function challengeRows(challengeDrills, all = {}, bests = {}) {
  return challengeDrills.map(d => {
    const l = d.lesson || lessonById(d.id); const at = l ? moduleOf(l) : null;
    const p = all[d.id];
    const b = bests[d.id] || null;
    return { id: d.id, n: at ? moduleNumber(at.module.id, at.k) : '', title: challengeName(d.title), module: at ? at.module.title : '', length: l && l.timeLimit ? l.timeLimit : null, best: b ? b.secs : null, tier: (b && b.tier) || 'none', passed: !!(p && (p.challenge || p.completed)), locked: entitlement.locked(l || d) };
  });
}

/**
 * Challenges: the same chapter cards as Learn and Drills, each module's challenge as a tile with the
 * keys it calls on and your tier, and at the side the next one's three pars, so the page says what
 * each tier takes instead of a lone button.
 */
function challengesPage(el, ctx) {
  const all = store.all();
  const drills = DRILLS.filter(d => d.kind === 'challenge');
  const rows = challengeRows(drills, all, bestsOf());
  const open = rows.filter(r => !r.locked);
  const next = open.find(r => !r.passed) || open[0] || null;
  const tabs = chapterTabs();
  const chOf = id => (drills.find(d => d.id === id) || {}).chapter;
  let chapterKey = (next && chOf(next.id)) || tabs[0].key;
  let paywall = false;
  let unwire = null;
  const keysOf = id => { const l = lessonById(id); const d = drills.find(x => x.id === id); return routeKeys((l && l.solution) || (d && d.solution), 6); };
  function render(focusTab) {
    const cards = tabs.map(c => {
      const mine = rows.filter(r => chOf(r.id) === c.key);
      const locked = c.access === 'paid' && !entitlement.entitled();
      const passed = mine.filter(r => r.passed).length;
      return { key: c.key, n: c.n, title: c.title, on: c.key === chapterKey, locked, pct: mine.length ? 100 * passed / mine.length : 0,
        note: c.access === 'free' ? t('learn_free') : locked ? t('paywall_pro') : '', count: mine.length ? t('chapter_modules_done', { d: passed, m: mine.length }) : t('learn_being_written') };
    });
    const tab = tabs.find(c => c.key === chapterKey) || tabs[0];
    const mine = rows.filter(r => chOf(r.id) === tab.key);
    const tiles = mine.map(r => drillTileHtml({ id: r.id, title: r.module, sub: r.title, keys: keysOf(r.id), length: r.length ? fmtLength(r.length) : '', best: r.best != null ? fmtClock(r.best, true) : '', tier: r.tier, open: true, pro: r.locked, href: `#/lesson/${r.id}?seed=new`, next: !!(next && r.id === next.id), mode: 'challenges' },
      { notPlayed: r.passed ? t('status_done') : t('practice_not_played'), full: t('paywall_pro') })).join('');
    const main = panelHtml({ heading: esc(t('chapter_heading', { n: tab.n, name: tab.title })), facts: mine.length ? esc(t('challenges_passed', { n: mine.filter(r => r.passed).length, m: mine.length })) : '', body: mine.length ? `<div class="dt-grid" data-cursor-cols="3">${tiles}</div>` : `<p class="panel-line">${esc(t('learn_coming', { n: tab.n }))}</p>`, cls: 'challenges', stretch: true });
    // the side: what each tier takes on the next challenge, from its pars
    const nd = next ? drills.find(d => d.id === next.id) : null;
    const pars = nd && nd.pars ? nd.pars : null;
    const tierRows = pars ? [['pass', 'tier_pass', pars.pass], ['pro', 'tier_expert', pars.pro], ['legendary', 'tier_legendary', pars.legendary]].map(([tier, k, secs]) => `<div class="tier-row${next && tierAtLeast(next.tier, tier) ? ' on' : ''}">${tierMarksHtml(tier)}<span class="row-name">${esc(t(k))}</span><span class="tier-time">${esc(fmtClock(secs, true))}</span></div>`).join('') : '';
    const lockedTab = tab.access === 'paid' && !entitlement.entitled();
    const side = paywall || lockedTab ? paywallHtml({ heading: t('paywall_chapter', { n: tab.n, name: tab.title }), signedIn: auth.state() === 'in', mode: 'challenges', ids: { go: 'chGoPro', notNow: 'chNotNow' } })
      : panelHtml({ heading: esc(next ? next.module : t('challenges_title')), facts: next ? esc(next.n) : '', body: `${next ? `<p class="panel-line">${esc(next.title)}</p>` : ''}${tierRows ? `<div class="tier-list">${tierRows}</div>` : ''}<p class="panel-line ink-2">${esc(t('challenges_line'))}</p>`, cls: 'ch-side', stretch: true });
    el.innerHTML = `${headerBlockHtml({ title: t('challenges_title'), line: esc(t('challenges_intro')), button: next ? buttonHtml({ label: t('challenges_start'), key: 'Enter', href: `#/lesson/${next.id}?seed=new`, primary: true, id: 'startChallenge' }) : '', cls: 'hdr-challenges' })}${chapterCardsHtml(cards, t('rail_challenges'))}<div class="pg-two"><div class="pg-main">${main}</div><div class="pg-side">${side}</div></div>`;
    wireTabs(el, (key, viaKeys) => { chapterKey = key; paywall = false; render(viaKeys); });
    el.querySelectorAll('[data-pro]').forEach(r => r.addEventListener('click', () => { paywall = true; render(); }));
    const nn = el.querySelector('#chNotNow'); if (nn) nn.onclick = () => { if (!paywall) chapterKey = tabs[0].key; paywall = false; render(); };
    if (unwire) unwire();
    unwire = wireRows(el);
    if (focusTab) { const on = el.querySelector('.tab.on'); if (on) on.focus(); }
    if (ctx.keytips) ctx.keytips.register([{ id: 'start', label: t('challenges_start'), el: el.querySelector('#startChallenge') }, ...tabs.map(x => ({ id: x.key, label: t('learn_tab', { n: x.n }), el: el.querySelector(`.tab[data-tab="${x.key}"]`) }))].filter(i => i.el));
    if (ctx.cursor) ctx.cursor.refresh();
  }
  render();
  const onKey = e => { if (e.key === 'Escape' && !e.defaultPrevented) { const nn = el.querySelector('#chNotNow'); if (nn) { e.preventDefault(); nn.click(); } } };
  document.addEventListener('keydown', onKey);
  setTimeout(() => { if (ctx.cursor) ctx.cursor.select(el.querySelector('.hdr'), { focus: false }); }, 0);
  return () => { document.removeEventListener('keydown', onKey); if (unwire) unwire(); };
}

export function mountPracticePage(root, ctx = {}) {
  const el = document.createElement('div');
  const mode = (ctx.params && ctx.params.mode) || 'drills';
  el.className = 'pg pg-practice pg-' + mode;
  const pages = { drills: drillsPage, daily: dailyPage, rapid: rapidPage, challenges: challengesPage };
  const page = pages[mode] || drillsPage;
  // the header block is the page's one selected item (table.js gives it the cursor): Enter does its primary action
  const cleanup = page(el, ctx);
  root.appendChild(el);
  if (ctx.cursor) ctx.cursor.refresh();
  return { destroy() { if (typeof cleanup === 'function') cleanup(); el.remove(); } };
}
