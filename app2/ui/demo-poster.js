// app2/ui/demo-poster.js — the self-playing demo's stand-in (experience pass C, item 9). The
// landing and the first run paint this still of a real lesson at once, then load the live demo
// (ui/demo-player.js) behind it; if that load fails, or the demo throws while mounting, the
// poster stays, with a way into the real lesson. Same surface as mountDemo(), so the hosts'
// key handlers need no special case.
//
//   let demo = mountDemoPoster(host, { note });
//   loadLiveDemo(host, { ...opts, onFail }, d => { demo = d; }, demo);   // swaps the poster for the live demo when it arrives
//
// The still is the demo's own last frame (4 / 4), the whole frame taken from the live player on the
// landing at its real size: clips/demo-compact.jpg. Re-take it when the demo changes (node app2/tests/record-clips.mjs).

const POSTER = './clips/demo-compact.jpg';

/** o.note: false when the host says the demo failed in its own caption. */
export function mountDemoPoster(host, o = {}) {
  const el = document.createElement('div');
  el.className = 'dp dp-poster';
  el.innerHTML = `<div class="dp-poster-img"><img src="${POSTER}" alt="A finished demo: four goals from Chapter 1 done on the weekly report" decoding="async"></div>
    <div class="dp-poster-note" hidden>The live demo didn’t load, so this still shows the finished sheet. <a href="#/lesson/inherited-workbook">Open lesson 1.1.1</a> to do it yourself.</div>`;
  if (host) host.appendChild(el);
  return {
    el, run: null, poster: true,
    play() {}, stop() {}, skip() {}, restart() {},
    takeover() { return false; },
    /** The live demo could not load: say so under the still (unless the host says it), and keep the way in. */
    failed() { const n = el.querySelector('.dp-poster-note'); if (n && o.note !== false) n.hidden = false; },
    get playing() { return false; }, get started() { return false; }, get done() { return true; }, get taken() { return false; },
    destroy() { el.remove(); },
  };
}

/**
 * Load the live demo into `host` and hand it over; the poster already there is replaced. A failed
 * import or a demo that throws while mounting leaves the poster up, with its note, and calls
 * opts.onFail() so the host can say so in its own words.
 */
export function loadLiveDemo(host, opts, onReady, poster) {
  let cancelled = false;
  const fail = () => {
    if (cancelled) return;
    if (poster) poster.failed();
    if (opts && opts.onFail) { try { opts.onFail(); } catch (e) { /* host hook */ } }
  };
  import('./demo-player.js').then(m => {
    if (cancelled) return;
    let live;
    try { live = m.mountDemo(host, opts); } catch (e) { fail(); return; }
    if (poster) poster.destroy();
    onReady(live);
  }).catch(fail);
  return () => { cancelled = true; };
}
