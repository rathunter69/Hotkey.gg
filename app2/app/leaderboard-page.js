// app2/app/leaderboard-page.js — the board layout (SITE_SPEC §2, §11a): Benchmark, Daily, School
// and Desk tabs with honest empty states ("Boards open with timed play") and the small
// "Compete with your own group: start a desk" prompt. Look from the old lb.css (.board, .board-cap, .row).
const BOARDS = [
  { key: 'benchmark', label: 'Benchmark', title: 'Benchmark drills', sub: 'Best clean times on the benchmark drills. They set your rank.',
    rows: ['Foundations · Weekly Sales Report', 'Foundations · The Ribbon', 'Foundations · Format Cells'] },
  { key: 'daily', label: 'Daily', title: 'The Daily', sub: 'One drill a day, the same board for everyone. Resets at midnight UTC.', rows: ['Today', 'Yesterday', 'This week'] },
  { key: 'school', label: 'School', title: 'School boards', sub: 'Opt in with a verified school email to appear on your school’s board.', rows: ['Your school', 'All schools'] },
  { key: 'desk', label: 'Desk', title: 'Desk boards', sub: 'Private boards for a desk: a study group, a finance club, an analyst class, a team at work.', rows: ['Your desks'] },
];

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mountLeaderboardPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'page lb';
  let cur = (ctx.query && BOARDS.find(b => b.key === ctx.query.board) || BOARDS[0]).key;

  function render() {
    const b = BOARDS.find(x => x.key === cur);
    el.innerHTML = `<div class="page-head"><h1>Leaderboard</h1><p class="page-sub">Every timed drill has a board. Viewable by everyone; entries need a clean run: no help, no mouse on the workspace.</p></div>
      <div class="lb-tabs" role="tablist" aria-label="boards">${BOARDS.map(x => `<button type="button" role="tab" class="lb-tab${x.key === cur ? ' on' : ''}" aria-selected="${x.key === cur}" tabindex="${x.key === cur ? 0 : -1}" data-key="${x.key}">${esc(x.label)}</button>`).join('')}</div>
      <div class="boards" role="tabpanel">
        ${b.rows.map(r => `<div class="board"><div class="board-cap"><h2>${esc(r)}</h2><span class="lvl">${esc(b.label)}</span></div>
          <div class="row"><span class="rk">1</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>
          <div class="row"><span class="rk">2</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>
          <div class="row"><span class="rk">3</span><span class="nm muted">—</span><span class="mid"></span><span class="tm muted">—</span></div>
          <div class="empty">Boards open with timed play.</div></div>`).join('')}
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
