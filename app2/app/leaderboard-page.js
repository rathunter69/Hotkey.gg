// app2/app/leaderboard-page.js — the board layout (SITE_SPEC §2, §11a). Signed in, the Benchmark
// and Daily tabs show the global field from rpc_board (the top rows, plus your own row when you
// sit below them), with this device's clean times beneath as "your times", never merged in.
// Signed out they show your own clean times only, honestly labelled. Real people only: no
// seeded pace-setters here (those are ghosts inside runs). School and Desk keep their coming
// states; the "start a desk" prompt stays.
import { DRILLS } from '../content/drills.js';
import { store } from './store.js';
import { dailyFor } from './daily.js';
import { dayOf } from './records.js';

const BOARDS = [
  { key: 'benchmark', label: 'Benchmark', title: 'Benchmark drills', sub: 'Best clean times. The global field opens when you sign in; until then these are your own posted times, which carry over.', liveSub: 'Best clean times from everyone with a public profile. Your times on this device sit beneath each board.' },
  { key: 'daily', label: 'Daily', title: 'The Daily', sub: 'One drill a day, the same board for everyone. Resets at midnight UTC. Your attempts show here; the global board opens when you sign in.', liveSub: 'One drill a day, the same sheet and the same board for everyone. Resets at midnight UTC.' },
  { key: 'school', label: 'School', title: 'School boards', sub: 'Opt in with a verified school email to appear on your school’s board.', rows: ['Your school', 'All schools'] },
  { key: 'desk', label: 'Desk', title: 'Desk boards', sub: 'Private boards for a desk: a study group, a finance club, an analyst class, a team at work.', rows: ['Your desks'] },
];

/** Global rows shown per board before your own row is appended below them. */
export const TOP = 10;

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** A local board: caption + your best clean rows (top 3) + the honest note. */
function localBoard(caption, tag, rows, note) {
  const filled = rows.slice(0, 3).map((r, i) => `<div class="row"><span class="rk">${i + 1}</span><span class="nm">you</span><span class="mid">${esc(r.mid || '')}</span><span class="tm">${r.secs.toFixed(2)}s</span></div>`);
  while (filled.length < 3) filled.push(`<div class="row"><span class="rk">${filled.length + 1}</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>`);
  return `<div class="board lb-mine"><div class="board-cap"><h2>${esc(caption)}</h2><span class="lvl">${esc(tag)}</span></div>${filled.join('')}<div class="empty">${esc(note)}</div></div>`;
}

/** A board's middle column: the tier, then keys against the reference route when known. Pure. */
function midOf(tier, keys, optimalKeys) {
  const t = tier && tier !== 'none' ? tier : '';
  const k = keys != null && optimalKeys ? keys + '/~' + optimalKeys : '';
  return t && k ? t + ' · ' + k : t || k;
}

/**
 * A signed-in board: the global field on top, "your times" beneath. `global` is undefined while
 * loading, null when the read failed, else { rows } from store.globalBoard. Pure; exported for the
 * tests. The empty field says so in one line; nothing is padded or invented.
 */
export function liveBoard(caption, tag, global, local, { optimalKeys, localEmpty = 'No clean time on this device yet.' } = {}) {
  let field;
  if (global === undefined) field = `<div class="empty">Loading the board…</div>`;
  else if (global === null) field = `<div class="empty lb-failed">Couldn’t load the board. <button type="button" class="btn btn-ghost lb-retry">Try again</button></div>`;
  else if (!global.rows.length) field = `<div class="empty">No one is on this board yet. A clean run puts you first.</div>`;
  else {
    const top = global.rows.slice(0, TOP);
    const mine = top.some(r => r.mine) ? null : global.rows.find(r => r.mine);
    field = top.concat(mine ? [mine] : []).map(r => `<div class="row${r.mine ? ' lb-me' : ''}"><span class="rk">${r.pos}</span><span class="nm">${esc(r.handle)}${r.mine ? ' <span class="muted">(you)</span>' : ''}</span><span class="mid">${esc(midOf(r.tier, r.keys, optimalKeys))}</span><span class="tm">${r.secs.toFixed(2)}s</span></div>`).join('');
  }
  const yours = local.length
    ? local.slice(0, 3).map((r, i) => `<div class="row"><span class="rk">${i + 1}</span><span class="nm">you</span><span class="mid">${esc(r.mid || '')}</span><span class="tm">${r.secs.toFixed(2)}s</span></div>`).join('')
    : `<div class="empty">${esc(localEmpty)}</div>`;
  return `<div class="board lb-live"><div class="board-cap"><h2>${esc(caption)}</h2><span class="lvl">${esc(tag)}</span></div>${field}<div class="board-cap lb-yours"><h2>Your times</h2><span class="lvl">this device</span></div>${yours}</div>`;
}

/** The boards a tab reads: [{ ref, seed, key }] (key is the page's state key). */
function boardRefs(tab) {
  if (tab === 'benchmark') return benchmarkDrills().map(d => ({ ref: d.id, seed: null, key: d.id }));
  if (tab === 'daily') { const pick = dailyFor(dayOf()); return [{ ref: pick.drillId, seed: pick.seed, key: 'daily|' + pick.drillId + '|' + pick.seed }]; }
  return [];
}
const benchmarkDrills = () => DRILLS.filter(d => d.benchmark).concat(DRILLS.filter(d => !d.benchmark));
const localRows = d => store.boards(d.id).map(r => ({ ...r, mid: (r.tier && r.tier !== 'none' ? r.tier + ' · ' : '') + r.keys + '/~' + d.optimalKeys }));

/**
 * The tab panel's boards. `live` = signed in; `global` maps a boardRefs key to its read state
 * (absent = loading, null = failed, { rows }). Exported for the tests.
 */
export function panelHtml(tab, { live = false, global = {} } = {}) {
  if (tab === 'benchmark') {
    return benchmarkDrills().map(d => {
      const local = localRows(d);
      if (live) return liveBoard(d.title, d.benchmark ? 'benchmark' : 'drill', global[d.id], local, { optimalKeys: d.optimalKeys, localEmpty: 'No clean time on this device yet.' });
      return localBoard(d.title, d.benchmark ? 'benchmark' : 'drill', local, local.length ? 'Your clean times, with keys against the reference route. The global field opens when you sign in.' : 'No clean time yet — a run without help or mouse posts here.');
    }).join('');
  }
  if (tab === 'daily') {
    const day = dayOf(); const pick = dailyFor(day); const drill = DRILLS.find(d => d.id === pick.drillId);
    const rows = store.attempts({ kind: 'daily', day }).filter(a => a.clean && a.secs != null).sort((x, y) => x.secs - y.secs).map(a => ({ secs: a.secs, mid: a.tier !== 'none' ? a.tier : '' }));
    const caption = `Today · ${drill ? drill.title : '—'}`;
    if (live) return liveBoard(caption, day, global['daily|' + pick.drillId + '|' + pick.seed], rows, { optimalKeys: drill && drill.optimalKeys, localEmpty: 'No clean attempt on this device today.' });
    return localBoard(caption, day, rows, rows.length ? 'Your clean attempts today. The worldwide board opens when you sign in.' : 'No clean attempt yet today.');
  }
  const b = BOARDS.find(x => x.key === tab);
  return b.rows.map(r => `<div class="board"><div class="board-cap"><h2>${esc(r)}</h2><span class="lvl">${esc(b.label)}</span></div>
          <div class="row"><span class="rk">1</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>
          <div class="row"><span class="rk">2</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>
          <div class="row"><span class="rk">3</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>
          <div class="empty">Boards open with accounts.</div></div>`).join('');
}

export function mountLeaderboardPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'page lb';
  let cur = (ctx.query && BOARDS.find(b => b.key === ctx.query.board) || BOARDS[0]).key;
  let gone = false;
  const global = {};        // boardRefs key → null (failed) | { rows }; absent while loading
  const inflight = new Set();
  const live = () => store.liveBoards();

  /** Fetch the current tab's global boards; each arrival redraws only the panel (focus stays put). */
  function load() {
    if (!live()) return;
    for (const { ref, seed, key } of boardRefs(cur)) {
      if (key in global || inflight.has(key)) continue;
      inflight.add(key);
      store.globalBoard(ref, { seed }).then(v => v, () => null).then(v => {
        inflight.delete(key);
        if (gone) return;
        global[key] = v;
        if (boardRefs(cur).some(b => b.key === key)) drawPanel();
      });
    }
  }
  function drawPanel() {
    const panel = el.querySelector('.boards');
    if (!panel) return;
    panel.innerHTML = panelHtml(cur, { live: live(), global });
    panel.querySelectorAll('.lb-retry').forEach(btn => {
      btn.onclick = () => { for (const k of Object.keys(global)) if (global[k] === null) delete global[k]; drawPanel(); load(); };
    });
  }

  function render() {
    const b = BOARDS.find(x => x.key === cur);
    el.innerHTML = `<div class="page-head"><h1>Leaderboard</h1><p class="page-sub">Every timed drill has a board. Viewable by everyone; entries need a clean run: no help, no mouse on the workspace.</p></div>
      <div class="lb-tabs" role="tablist" aria-label="boards">${BOARDS.map(x => `<button type="button" role="tab" class="lb-tab${x.key === cur ? ' on' : ''}" aria-selected="${x.key === cur}" tabindex="${x.key === cur ? 0 : -1}" data-key="${x.key}">${esc(x.label)}</button>`).join('')}</div>
      <div class="boards" role="tabpanel"></div>
      <p class="lb-sub">${esc(live() && b.liveSub ? b.liveSub : b.sub)}</p>
      <div class="lb-desk-prompt"><span>Compete with your own group: start a desk.</span><a class="btn btn-ghost" href="#/teams">Teams and desks →</a></div>`;
    drawPanel();
    load();
    const tabs = [...el.querySelectorAll('.lb-tab')];
    tabs.forEach((t, i) => {
      t.onclick = () => { cur = t.dataset.key; render(); el.querySelector('.lb-tab.on').focus(); };
      t.onkeydown = e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); cur = tabs[(i + 1) % tabs.length].dataset.key; render(); el.querySelector('.lb-tab.on').focus(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); cur = tabs[(i - 1 + tabs.length) % tabs.length].dataset.key; render(); el.querySelector('.lb-tab.on').focus(); }
        else if (e.key === 'Home') { e.preventDefault(); cur = tabs[0].dataset.key; render(); el.querySelector('.lb-tab.on').focus(); }
        else if (e.key === 'End') { e.preventDefault(); cur = tabs[tabs.length - 1].dataset.key; render(); el.querySelector('.lb-tab.on').focus(); }
      };
    });
  }
  render();
  root.appendChild(el);
  return { destroy() { gone = true; el.remove(); } };
}
