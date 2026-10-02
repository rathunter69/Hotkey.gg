// app2/app/leaderboard-page.js — Leaderboards (screenplay 3.0 "Leaderboards"; 3.11; M104). Page
// tabs: The Daily, Drills, Challenges, Desks. A board is a table: the place, the player with their
// level, a bar showing the time against the field, the time, the gap to first and the keys used,
// with the route's key count in the header. No tier marks on a board. The learner's own row is
// pinned under the top ten with its move. Beside the board, the learner's last five runs on it and
// one line on where the time is going. Signed in, the field is rpc_board through the store; signed
// out, the board holds the learner's own clean runs and says the field opens on sign-in. The pure
// parts (boardModel, whereTimeGoes, lastRuns) are tested; mountBoard is shared with the Daily's page.
import { DRILLS, DRILLS_BY_ID } from '../content/drills.js';
import { CATALOG } from '../content/catalog.js';
import { store } from './store.js';
import { dailyFor } from './daily.js';
import { dayOf } from './records.js';
import { siteCopy } from '../content/copy/apply.js';
import { esc, fill, fmtClock, fmtGap, prettyDay, weekdayOf } from '../ui/components/format.js';
import { panelHtml, tableHtml, tabsHtml, wireTabs, buttonHtml } from '../ui/components/table.js';
import { barHtml, levelChipHtml } from '../ui/components/marks.js';

const t = (key, vars) => fill(siteCopy(key, key), vars);
/** Global rows shown per board before your own row is pinned below them. */
export const TOP = 10;
export const SEEN_KEY = 'hk2_board_seen_v1';
export const BOARD_TABS = [
  { key: 'daily', copy: 'boards_tab_daily', mode: 'daily' },
  { key: 'drills', copy: 'boards_tab_drills', mode: 'drills' },
  { key: 'challenges', copy: 'boards_tab_challenges', mode: 'challenges' },
  { key: 'desks', copy: 'boards_tab_desks', mode: '' },
];

/**
 * The board as the table shows it. `rows` come best-first as the server ranks them
 * ({ pos, handle, level, secs, keys, mine }); the top ten stay, your own row is pinned under them
 * when you sit lower, with the move from `prevPlace`. Each row carries its gap to first and its
 * bar against the slowest row shown. Pure.
 */
export function boardModel(rows, { top = TOP, prevPlace = null } = {}) {
  const list = (rows || []).filter(r => r && Number.isFinite(r.secs)).map(r => ({ ...r, place: Number.isFinite(r.place) ? r.place : r.pos }));
  const first = list.length ? list[0].secs : null;
  const shown = list.slice(0, top);
  const mine = list.find(r => r.mine) || null;
  const pinned = mine && !shown.some(r => r.mine) ? mine : null;
  const all = pinned ? shown.concat([pinned]) : shown;
  const max = all.reduce((m, r) => Math.max(m, r.secs), 0) || 1;
  const out = all.map(r => ({ place: r.place, handle: r.handle, level: r.level, secs: r.secs, keys: r.keys, mine: !!r.mine, gap: first == null ? 0 : r.secs - first, pct: 100 * r.secs / max, pinned: r === pinned }));
  const move = mine && Number.isFinite(prevPlace) ? prevPlace - mine.place : null;
  return { rows: out, first, mine: mine ? { place: mine.place, secs: mine.secs } : null, move, count: list.length };
}

/** Your last five clean runs on a board, newest first: { day, secs, keys, at }. Pure. */
export function lastRuns(attempts, n = 5) {
  return (attempts || []).filter(a => a.clean && Number.isFinite(a.secs)).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, n).map(a => ({ day: a.day || dayOf(a.at), secs: a.secs, keys: a.keys, at: a.at }));
}

/** Where the time goes: the goal with the largest mean split over the runs, { index, secs } or null. Pure. */
export function whereTimeGoes(attempts) {
  const sums = [], counts = [];
  for (const a of attempts || []) {
    if (!Array.isArray(a.splits)) continue;
    a.splits.forEach((s, i) => { if (Number.isFinite(s)) { sums[i] = (sums[i] || 0) + s; counts[i] = (counts[i] || 0) + 1; } });
  }
  let best = -1, secs = 0;
  sums.forEach((s, i) => { const m = s / counts[i]; if (m > secs) { secs = m; best = i; } });
  return best < 0 ? null : { index: best, secs: Math.round(secs) };
}

/** Local rows (signed out, or your device's runs): your clean runs ranked as a field of one. */
export function localRows(ref) {
  return store.boards(ref).map((r, i) => ({ pos: i + 1, handle: 'you', level: null, secs: r.secs, keys: r.keys, mine: i === 0 }));
}

function seenPlaces() { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') || {}; } catch (e) { return {}; } }
function rememberPlace(key, place) { try { const m = seenPlaces(); m[key] = place; localStorage.setItem(SEEN_KEY, JSON.stringify(m)); } catch (e) { /* private window */ } }

/** The goal as the learner read it, a whole sentence with its own capital and full stop: it is quoted, never spliced mid-sentence. */
const goalText = (drill, i) => { const goals = drill && (drill.goals || (drill.lesson && drill.lesson.goals)) || []; const g = goals[i]; if (!g || !g.text) return ''; const s = String(g.text).trim(); return /[.!?]$/.test(s) ? s : s + '.'; };
/** "1 second" / "12 seconds": a count that reads. */
const secsText = n => t(n === 1 ? 'boards_second' : 'boards_seconds', { n });
/** "1 clean run" / "12 clean runs". */
const runsText = n => t(n === 1 ? 'boards_clean_run' : 'boards_clean_runs', { n });

/** The board's table from a model. */
export function boardTableHtml(model, { routeKeys = null } = {}) {
  const columns = [{ key: 'place', label: t('col_place'), cls: 'n' }, { key: 'player', label: t('col_player') }, { key: 'field', label: t('col_field'), cls: 'field' }, { key: 'time', label: t('col_time'), align: 'right', cls: 'time' }, { key: 'gap', label: t('col_gap'), align: 'right', cls: 'gap' }, { key: 'keys', label: routeKeys ? t('boards_keys_route', { n: routeKeys }) : t('col_keys'), align: 'right', cls: 'keys' }];
  const rows = model.rows.map(r => ({ cells: { place: String(r.place), player: `<span class="row-name">${esc(r.handle)}</span>${levelChipHtml(r.level)}${r.mine && model.move ? `<span class="move">${esc(model.move > 0 ? t('boards_up', { k: model.move }) : t('boards_down', { k: -model.move }))}</span>` : ''}`, field: barHtml(r.pct, 'bar-field'), time: fmtClock(r.secs, true), gap: fmtGap(r.gap), keys: r.keys != null ? String(r.keys) : '' }, cls: `row-board${r.mine ? ' mine' : ''}${r.pinned ? ' pinned' : ''}`, cursor: false }));
  return tableHtml({ columns, rows, cls: 'tbl-board' });
}

/** The side panel: your last five runs and the line on where the time goes. */
export function sidePanelHtml({ title, runs, where, drill, empty }) {
  const columns = [{ key: 'day', label: '' }, { key: 'time', label: '', align: 'right', cls: 'time' }, { key: 'keys', label: '', align: 'right', cls: 'keys' }];
  const rows = runs.map(r => ({ cells: { day: esc(prettyDay(r.day)), time: fmtClock(r.secs, true), keys: String(r.keys) }, cursor: false }));
  const task = where ? goalText(drill, where.index) : '';
  const body = runs.length ? `${tableHtml({ columns, rows, head: false, cls: 'tbl-runs', label: t('boards_last_five') })}${task ? `<p class="panel-line">${esc(t('boards_where', { secs: secsText(where.secs) }))}</p><p class="panel-line">${esc(task)}</p>` : ''}` : `<p class="panel-line">${esc(empty)}</p>`;
  return panelHtml({ heading: esc(title), body, cls: 'board-side', stretch: true });
}

/**
 * Mount one board with its side panel into `el`: { ref, seed, title, yours, mode }. The field is
 * read through the store when signed in; signed out it is the device's own runs. Returns { destroy }.
 */
export function mountBoard(el, { ref, seed = null, title, yours, dayLabel = '' } = {}) {
  let gone = false;
  const drill = DRILLS_BY_ID[ref] || null;
  const routeKeys = drill ? drill.optimalKeys : null;
  const key = ref + '|' + (seed == null ? '' : seed);
  const live = store.liveBoards();
  let state = live ? undefined : { rows: localRows(ref) };
  function draw() {
    let table, facts = '', line = '';
    if (state === undefined) table = `<p class="panel-line">${esc(t('boards_loading'))}</p>`;
    else if (state === null) table = `<p class="panel-line">${esc(t('boards_failed'))} <button type="button" class="link-btn board-retry">${esc(t('boards_retry'))}</button></p>`;
    else {
      const model = boardModel(state.rows, { prevPlace: seenPlaces()[key] });
      if (model.mine) rememberPlace(key, model.mine.place);
      facts = esc(dayLabel ? t('boards_day_runs', { day: dayLabel, runs: runsText(model.count) }) : runsText(model.count));
      table = model.rows.length ? boardTableHtml(model, { routeKeys }) : `<p class="panel-line">${esc(t('boards_empty'))}</p>`;
      if (!live) line = `<p class="panel-line">${esc(t('boards_signed_out'))}</p>`;
    }
    const attempts = store.attempts({ ref }).filter(a => seed == null || a.seed === seed);
    const runs = lastRuns(attempts);
    el.innerHTML = `<div class="pg-two"><div class="pg-main">${panelHtml({ heading: esc(title), facts, body: table + line, cls: 'board', stretch: true })}</div><div class="pg-side">${sidePanelHtml({ title: yours, runs, where: whereTimeGoes(attempts.filter(a => a.clean)), drill, empty: seed != null ? t('daily_not_played') : t('boards_none_yet') })}</div></div>`;
    const retry = el.querySelector('.board-retry'); if (retry) retry.onclick = () => { state = undefined; draw(); load(); };
  }
  function load() {
    if (!live) return;
    store.globalBoard(ref, { seed }).then(v => v, () => null).then(v => { if (gone) return; state = v; draw(); });
  }
  draw(); load();
  return { destroy() { gone = true; } };
}

/** The board a tab opens on: the drill with your latest clean run, else the first benchmark, else the first. */
export function defaultRef(entries, attempts) {
  const ids = new Set(entries.map(e => e.id));
  const latest = (attempts || []).filter(a => a.clean && ids.has(a.ref)).sort((a, b) => (b.at || 0) - (a.at || 0))[0];
  if (latest) return latest.ref;
  const bench = entries.find(e => (e.tags || []).includes('benchmark') || e.benchmark);
  return (bench || entries[0] || {}).id || null;
}

export function mountLeaderboardPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'pg pg-boards';
  const q = (ctx.query) || {};
  let tab = (BOARD_TABS.find(b => b.key === q.board) || BOARD_TABS[0]).key;
  let ref = q.ref || null;
  let board = null;
  const signedIn = () => store.liveBoards();

  function entriesFor(k) {
    if (k === 'drills') return CATALOG.filter(e => e.mode === 'drill');
    if (k === 'challenges') return DRILLS.filter(d => d.kind === 'challenge').map(d => ({ id: d.id, title: d.title.replace(/^Challenge:\s*/i, '').replace(/^./, c => c.toUpperCase()), chapter: d.chapter, benchmark: d.benchmark }));
    return [];
  }
  function render(focusTab) {
    if (board) { board.destroy(); board = null; }
    document.body.dataset.mode = (BOARD_TABS.find(b => b.key === tab) || {}).mode || 'daily';
    const tabsHtmlStr = tabsHtml(BOARD_TABS.map(b => ({ key: b.key, label: t(b.copy), mode: b.mode, on: b.key === tab })), t('boards_title'));
    let picker = '', host = '<div class="board-host"></div>';
    if (tab === 'desks') {
      host = `<div class="pg-two"><div class="pg-main">${panelHtml({ heading: esc(t('boards_tab_desks')), body: `<p class="panel-line">${esc(signedIn() ? siteCopy('boards_desk_prompt', 'Start a desk to compete with your own group.') : t('boards_desks_signed_out'))}</p><div class="btn-row">${buttonHtml({ label: signedIn() ? t('boards_desk_link') : t('rail_sign_in'), key: 'Enter', href: signedIn() ? '#/teams' : '#/account', primary: true, id: 'boardsDesk' })}</div>`, cls: 'board', attrs: { 'data-cursor': true, 'data-cursor-enter': '#boardsDesk', tabindex: '-1' } })}</div></div>`;
    } else if (tab !== 'daily') {
      const entries = entriesFor(tab);
      if (!ref || !entries.some(e => e.id === ref)) ref = defaultRef(entries, store.attempts());
      picker = `<label class="picker"><span>${esc(t('boards_pick'))}</span><select id="boardPick">${entries.map(e => `<option value="${esc(e.id)}"${e.id === ref ? ' selected' : ''}>${esc(e.title)}</option>`).join('')}</select></label>`;
    }
    el.innerHTML = `<div class="tabs-row">${tabsHtmlStr}${picker}</div>${host}`;
    wireTabs(el, (key, viaKeys) => { tab = key; ref = null; render(viaKeys); });
    const pick = el.querySelector('#boardPick'); if (pick) pick.onchange = () => { ref = pick.value; render(); };
    const hostEl = el.querySelector('.board-host');
    if (hostEl) {
      if (tab === 'daily') {
        const day = dayOf(); const p = dailyFor(day); const d = DRILLS_BY_ID[p.drillId];
        board = mountBoard(hostEl, { ref: p.drillId, seed: p.seed, title: d ? d.title : t('daily_title'), yours: t('boards_yours_daily'), dayLabel: weekdayOf(day) });
      } else {
        const e = entriesFor(tab).find(x => x.id === ref);
        board = mountBoard(hostEl, { ref, title: e ? e.title : ref, yours: t('boards_yours') });
      }
    }
    if (focusTab) { const on = el.querySelector('.tab.on'); if (on) on.focus(); }
    if (ctx.keytips) ctx.keytips.register(BOARD_TABS.map(b => ({ id: b.key, label: t(b.copy), el: el.querySelector(`.tab[data-tab="${b.key}"]`) })));
    if (ctx.cursor) ctx.cursor.refresh();
  }
  render();
  root.appendChild(el);
  return { destroy() { if (board) board.destroy(); el.remove(); } };
}
