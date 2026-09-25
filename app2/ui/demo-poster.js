// app2/ui/demo-poster.js — the self-playing demo's stand-in (experience pass C, item 9). The
// landing and the first run paint this still of a real lesson at once, then load the live demo
// (ui/demo-player.js) behind it; if that load fails, or the demo throws while mounting, the
// poster stays, with a way into the real lesson. Same surface as mountDemo(), so the hosts'
// key handlers need no special case.
//
//   let demo = mountDemoPoster(host, { compact });
//   loadLiveDemo(host, opts, d => { demo = d; });   // swaps the poster for the live demo when it arrives

const POSTER = './clips/lesson.jpg';

export function mountDemoPoster(host, o = {}) {
  const el = document.createElement('div');
  el.className = 'dp dp-poster' + (o.compact ? ' dp-compact' : '');
  el.innerHTML = `<div class="dp-head"><span class="dp-dots"><i></i><i></i><i></i></span><span class="dp-cap">a lesson · chapter 1 · move and select</span><span class="dp-count" id="demoCount">—</span></div>
    <div class="dp-poster-img"><img src="${POSTER}" alt="A real lesson: the Austin site feed on the sheet, the task card beside it, keycaps lighting as the keys are pressed" decoding="async"></div>
    <div class="dp-poster-note" hidden>The live demo did not load. <a href="#/lesson/inherited-workbook">Open lesson 1.1.1</a> and play it yourself.</div>`;
  if (host) host.appendChild(el);
  return {
    el, run: null, poster: true,
    play() {}, stop() {}, skip() {}, restart() {},
    takeover() { return false; },
    /** The live demo could not load: say so under the still, and keep the way in. */
    failed() { const n = el.querySelector('.dp-poster-note'); if (n) n.hidden = false; },
    get playing() { return false; }, get done() { return true; }, get taken() { return false; },
    destroy() { el.remove(); },
  };
}

/**
 * Load the live demo into `host` and hand it over; the poster already there is replaced. A failed
 * import or a demo that throws while mounting leaves the poster up, with its note.
 */
export function loadLiveDemo(host, opts, onReady, poster) {
  let cancelled = false;
  import('./demo-player.js').then(m => {
    if (cancelled) return;
    let live;
    try { live = m.mountDemo(host, opts); } catch (e) { if (poster) poster.failed(); return; }
    if (poster) poster.destroy();
    onReady(live);
  }).catch(() => { if (!cancelled && poster) poster.failed(); });
  return () => { cancelled = true; };
}
