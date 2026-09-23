// app2/ui/demo-player.js — a real lesson that plays itself (experience pass, decision 1): the
// Austin feed at S0 on the real sheet and ribbon, a task card that ticks as the platform presses
// the keys, the keycaps lighting up as they go. About twenty seconds. Used by the first run's
// opening step and the landing hero; on the landing the first key the visitor presses takes
// the sheet over (SITE_SPEC §3), so the demo is the lesson, not a film of one.
//
//   const demo = mountDemo(hostEl, { compact, loop, takeover, onDone, onTakeover });
//   demo.play(); demo.skip(); demo.destroy();
//
// No sound (the learner has not pressed a key yet), no records, no XP: nothing here counts.
import { LessonRun, hintToScript } from '../app/runner.js';
import { parseKeyScript } from '../engine/keyboard.js';
import { SheetView } from './sheet-view.js';
import { RibbonView } from './ribbon-view.js';
import { mountKeycaps } from './keycaps.js';
import { keyLabel } from '../app/prefs.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;

/** The demo lesson: four goals on the feed, each one real, each graded on the sheet's end state. */
export const DEMO_LESSON = {
  id: 'demo', kind: 'lesson', chapter: 'foundations', section: 'Move and select', title: 'Jump, don’t scroll', difficulty: 'easy', tags: [], access: 'free',
  workbook: 'voltline-weekly', state: { before: 'S0', after: 'S0' }, minutes: 1,
  brief: 'Management sent the Austin feed. Get to the bottom of it, select the Revenue column, bold the header and turn the gridlines off.',
  goals: [
    { id: 'bottom', teach: 'Ctrl+↓ jumps to the edge of the data.', text: 'Jump to the bottom of the feed, A61.', keys: 'Ctrl+↓', requires: ['ctrl-arrow'], check: s => at(s, 'A61') },
    { id: 'revenue', teach: 'Ctrl+Shift+↓ selects to the edge in one press.', text: 'Select the Revenue column, E1:E60.', keys: 'Ctrl+↑ Ctrl+→ ← then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow'], check: s => s.selectionText() === 'E1:E60' },
    { id: 'bold', teach: 'Shift+Space selects the row; Ctrl+B bolds it.', text: 'Make the header row bold.', keys: 'Ctrl+Home Shift+Space Ctrl+B', requires: ['bold-command'], check: s => { const c = s.cellAt('F1'); return !!c && !!c.bold && s.selectionText() === 'A1:Z1'; } },
    { id: 'grid', teach: 'Alt walks the Ribbon: W for View, V then G for Gridlines.', text: 'Turn the gridlines off.', keys: 'Alt W V G', requires: ['gridlines'], check: s => s.gridlines === false },
  ],
  solution: 'Ctrl+Down Ctrl+Up Ctrl+Right Left Ctrl+Shift+Down Ctrl+Home Shift+Space Ctrl+B Alt W V G',
};

/** The keystroke script with the pauses that make it readable: [{ spec } | { wait: ms }]. Pure. */
export function demoScript(lesson = DEMO_LESSON, cadence = 560, goalPause = 2000) {
  const out = [{ wait: 1600 }];
  for (const g of lesson.goals) {
    for (const step of parseKeyScript(hintToScript(g.keys))) out.push(step.type === 'text' ? { text: step.text } : { spec: step.spec }, { wait: cadence });
    out.push({ wait: goalPause });
  }
  return out;
}

/**
 * @param {HTMLElement} host
 * @param {object} [o]  compact: the landing card (task on top, keys at the bottom); loop: restart
 *                      after the end; takeover: the visitor's first key stops the demo and the sheet
 *                      is theirs; onDone(), onTakeover(); cadence ms
 */
export function mountDemo(host, o = {}) {
  const el = document.createElement('div');
  el.className = 'dp' + (o.compact ? ' dp-compact' : '');
  el.innerHTML = `
    <div class="dp-head"><span class="dp-dots"><i></i><i></i><i></i></span><span class="dp-cap">a lesson · chapter 1 · move and select</span><span class="dp-count" id="demoCount">0 / 4</span></div>
    <div class="dp-grid">
      <div class="dp-stage"><div class="stage"><div class="stage-row"><div class="stage-main">
        <div class="ribbon-slot rib-full" id="demoRibbonSlot"><div class="ribbon" id="demoRibbon"></div></div><div id="demoSheet"></div>
      </div></div></div></div>
      <aside class="dp-panel">
        <div class="task-card" id="demoTask"></div>
        <ol class="goals dp-goals" id="demoGoals"></ol>
        <div class="dp-hand" id="demoHand" hidden><b>Your turn.</b> The sheet is yours — same goals, any route.</div>
      </aside>
    </div>
    <div class="keyflash demo dp-keys" id="demoKeys" aria-hidden="true"></div>`;
  host.appendChild(el);
  const $ = id => el.querySelector('#' + id);

  const run = new LessonRun(DEMO_LESSON, { mode: 'guided' });
  let sheetView = null, ribbonView = null, keycaps = null;
  let timer = null, i = 0, playing = false, taken = false, done = false, destroyed = false;
  const script = demoScript(DEMO_LESSON, o.cadence || 560);

  function paint() {
    if (destroyed) return;
    ribbonView.render(); sheetView.render();
    const states = run.goalStates();
    $('demoCount').textContent = `${run.doneCount} / ${run.goals.length}`;
    const cur = run.current;
    $('demoTask').innerHTML = cur && !run.finished
      ? `<div class="task-label">${taken ? 'Now' : 'Watch'}</div><div class="task-goal">${esc(cur.text)}</div>${cur.teach ? `<div class="task-teach">${esc(cur.teach).replace(/\b(Ctrl\+\S+|Shift\+\S+|Alt)\b/g, m => `<kbd>${esc(keyLabel(m))}</kbd>`)}</div>` : ''}<div class="task-keys">${cur.keys.split(/\s+/).map(k => /^(then|×\d+)$/.test(k) ? `<span class="kx">${esc(k)}</span>` : `<kbd>${esc(keyLabel(k))}</kbd>`).join(' ')}</div>`
      : `<div class="task-label">Done</div><div class="task-goal">Four goals, twelve keys, no mouse.</div><div class="task-teach">That is a lesson. The sheet is graded on what it ends up as, so any correct route counts.</div>`;
    $('demoGoals').innerHTML = states.map(g => `<li class="goal ${g.done ? 'done' : g.current ? 'current' : ''}"><span class="goal-mark">${g.done ? '✓' : g.current ? '›' : ''}</span><span class="goal-text">${esc(g.text)}</span></li>`).join('');
  }

  function step() {
    if (destroyed || !playing) return;
    if (i >= script.length) { finish(); return; }
    const s = script[i++];
    if (s.wait != null) { timer = setTimeout(step, s.wait); return; }
    if (s.text) { for (const ch of s.text) run.key({ key: ch, shiftKey: /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(ch) }); }
    else run.pressSpec(s.spec);
    paint();
    timer = setTimeout(step, 30);
  }
  function finish() {
    playing = false; done = true;
    paint();
    if (o.onDone) { try { o.onDone(); } catch (e) { /* host hook */ } }
    if (o.loop && !taken) timer = setTimeout(() => { if (!destroyed && !taken) restart(); }, 2600);
  }
  function restart() {
    run.reset('guided');
    mountViews(); i = 0; done = false; play();
  }
  /** Fresh views on the run's (possibly rebuilt) session. */
  function mountViews() {
    if (sheetView) sheetView.destroy(); if (ribbonView && ribbonView.destroy) ribbonView.destroy(); if (keycaps) keycaps.destroy();
    $('demoSheet').innerHTML = ''; $('demoRibbonSlot').innerHTML = '<div class="ribbon" id="demoRibbon"></div>';
    sheetView = new SheetView($('demoSheet'), run.session);
    ribbonView = new RibbonView($('demoRibbon'), run.session, { mode: 'full' });
    keycaps = mountKeycaps(run.session, { el: $('demoKeys'), hold: 1600 });
    paint();
  }
  function play() { if (playing || destroyed) return; playing = true; step(); }
  function stop() { playing = false; if (timer) clearTimeout(timer); timer = null; }
  /** Play the rest at once (the learner pressed Enter). */
  function skip() { stop(); while (i < script.length) { const s = script[i++]; if (s.spec) run.pressSpec(s.spec); else if (s.text) for (const ch of s.text) run.key({ key: ch }); } finish(); }
  /** The visitor's key: the demo stops where it is and the sheet is theirs. */
  function takeover(ev) {
    if (taken) return run.key(ev);
    taken = true; stop(); keycaps.reset();
    $('demoHand').hidden = false;
    if (o.onTakeover) { try { o.onTakeover(); } catch (e) { /* host hook */ } }
    const handled = run.key(ev);
    paint();
    return handled;
  }

  run.onChange(() => paint());
  mountViews();
  if (o.autoplay !== false) play();
  return {
    el, run, play, stop, skip, takeover, restart,
    get playing() { return playing; }, get done() { return done; }, get taken() { return taken; },
    destroy() { destroyed = true; stop(); if (keycaps) keycaps.destroy(); if (sheetView) sheetView.destroy(); if (ribbonView && ribbonView.destroy) ribbonView.destroy(); el.remove(); },
  };
}
