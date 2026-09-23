// app2/app/leaderboard-page.js — the board layout (SITE_SPEC §2, §11a): Benchmark and Daily tabs
// carry your own clean times (the honest local board until accounts bring global fields); School
// and Desk keep their coming states; the "start a desk" prompt stays.
import { DRILLS } from '../content/drills.js';
import { store } from './store.js';
import { dailyFor } from './daily.js';
import { dayOf } from './records.js';

const BOARDS = [
  { key: 'benchmark', label: 'Benchmark', title: 'Benchmark drills', sub: 'Best clean times. Global fields open with accounts; until then these are your own posted times, which will carry over.' },
  { key: 'daily', label: 'Daily', title: 'The Daily', sub: 'One drill a day, the same board for everyone. Resets at midnight UTC. Your local attempts show until the global board opens.' },
  { key: 'school', label: 'School', title: 'School boards', sub: 'Opt in with a verified school email to appear on your school’s board.', rows: ['Your school', 'All schools'] },
  { key: 'desk', label: 'Desk', title: 'Desk boards', sub: 'Private boards for a desk: a study group, a finance club, an analyst class, a team at work.', rows: ['Your desks'] },
];

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** A local board: caption + your best clean rows (top 3) + the honest note. */
function localBoard(caption, tag, rows, note) {
  const filled = rows.slice(0, 3).map((r, i) => `<div class="row"><span class="rk">${i + 1}</span><span class="nm">you</span><span class="mid">${esc(r.mid || '')}</span><span class="tm">${r.secs.toFixed(2)}s</span></div>`);
  while (filled.length < 3) filled.push(`<div class="row"><span class="rk">${filled.length + 1}</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>`);
  return `<div class="board lb-mine"><div class="board-cap"><h2>${esc(caption)}</h2><span class="lvl">${esc(tag)}</span></div>${filled.join('')}<div class="empty">${esc(note)}</div></div>`;
}

export function mountLeaderboardPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'page lb';
  let cur = (ctx.query && BOARDS.find(b => b.key === ctx.query.board) || BOARDS[0]).key;

  function render() {
    const b = BOARDS.find(x => x.key === cur);
    el.innerHTML = `<div class="page-head"><h1>Leaderboard</h1><p class="page-sub">Every timed drill has a board. Viewable by everyone; entries need a clean run: no help, no mouse on the workspace.</p></div>
      <div class="lb-tabs" role="tablist" aria-label="boards">${BOARDS.map(x => `<button type="button" role="tab" class="lb-tab${x.key === cur ? ' on' : ''}" aria-selected="${x.key === cur}" tabindex="${x.key === cur ? 0 : -1}" data-key="${x.key}">${esc(x.label)}</button>`).join('')}</div>
      <div class="boards" role="tabpanel">
        ${b.key === 'benchmark'
          ? DRILLS.filter(d => d.benchmark).concat(DRILLS.filter(d => !d.benchmark)).map(d =>
              localBoard(d.title, d.benchmark ? 'benchmark' : 'drill', store.boards(d.id).map(r => ({ ...r, mid: (r.tier && r.tier !== 'none' ? r.tier + ' · ' : '') + r.keys + '/~' + d.optimalKeys })), store.boards(d.id).length ? 'Your clean times, with keys against the reference route. The global field opens with accounts.' : 'No clean time yet — a run without help or mouse posts here.')).join('')
          : b.key === 'daily'
          ? (() => { const day = dayOf(); const pick = dailyFor(day); const drill = DRILLS.find(d => d.id === pick.drillId);
              const rows = store.attempts({ kind: 'daily', day }).filter(a => a.clean && a.secs != null).sort((x, y) => x.secs - y.secs).map(a => ({ secs: a.secs, mid: a.tier !== 'none' ? a.tier : '' }));
              return localBoard(`Today · ${drill ? drill.title : '—'}`, day, rows, rows.length ? 'Your clean attempts today. The worldwide board opens with accounts.' : 'No clean attempt yet today.'); })()
          : b.rows.map(r => `<div class="board"><div class="board-cap"><h2>${esc(r)}</h2><span class="lvl">${esc(b.label)}</span></div>
          <div class="row"><span class="rk">1</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>
          <div class="row"><span class="rk">2</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>
          <div class="row"><span class="rk">3</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>
          <div class="empty">Boards open with accounts.</div></div>`).join('')}
      </div>
      <p class="lb-sub">${esc(b.sub)}</p>
      <div class="lb-desk-prompt"><span>Compete with your own group: start a desk.</span><a class="btn btn-ghost" href="#/teams">Teams and desks →</a></div>`;
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
  return { destroy() { el.remove(); } };
}
