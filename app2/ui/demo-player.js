// app2/ui/demo-player.js — a real lesson that plays itself (experience pass, decision 1): the
// Austin feed at S0 on the real sheet and ribbon, a task card that ticks as the platform presses
// the keys, the keycaps lighting up as they go. About twenty seconds. Used by the first run's
// opening step and the landing hero; on the landing, once the visitor clicks it or tabs to it,
// their first key takes the sheet over (SITE_SPEC §3), so the demo is the lesson, not a film of one.
//
//   const demo = mountDemo(hostEl, { compact, loop, autoplay, focusable, onDone, onPlay, onChange, onTakeover });
//   demo.play(); demo.skip(); demo.destroy();
//
// The keys pressed echo in a band of their own (the foot of the task panel; a strip under the
// grid in the compact card), never over the cells. The feed's columns are widened the way AutoFit
// would before the sheet paints, and the grid ends on a column boundary, so no label is cut off.
//
// No sound (the learner has not pressed a key yet), no records, no XP: nothing here counts.
import { LessonRun, hintToScript } from '../app/runner.js';
import { parseKeyScript } from '../engine/keyboard.js';
import { SheetView } from './sheet-view.js';
import { RibbonView } from './ribbon-view.js';
import { mountKeycaps } from './keycaps.js';
import { keyLabel } from '../app/prefs.js';
import { COLW_DEFAULT, COLW_MAX, FIT_SLACK, cellTxtPx } from '../engine/sheet.js';

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

/**
 * A key in a teach line: Ctrl / Shift / Alt, chorded with '+' ('Ctrl+Shift+↓', 'Shift+Space'), or a
 * KeyTip run after Alt ('Alt W V G'). A key ends at a space, punctuation or the end of the line, so
 * an arrow glyph or a full stop after it never breaks the match.
 */
export const TEACH_KEY_RX = /\b(?:Ctrl|Shift|Alt)(?:\+[^\s.,;:)]+)*(?:(?<=\bAlt)(?: [A-Z0-9](?=[\s.,;:)]|$))+)?(?=[\s.,;:)]|$)/g;

/** A teach line as runs of text and keys: [{ text } | { key }]. Pure. */
export function teachTokens(line) {
  const s = String(line == null ? '' : line), out = [];
  let last = 0;
  for (const m of s.matchAll(TEACH_KEY_RX)) {
    if (m.index > last) out.push({ text: s.slice(last, m.index) });
    out.push({ key: m[0] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ text: s.slice(last) });
  return out;
}

/** A teach line with every key boxed, a KeyTip run one box per key. `label` maps a key to the platform's label. Pure over `label`. */
export function teachHtml(line, label = keyLabel) {
  return teachTokens(line).map(t => t.key ? t.key.split(' ').map(k => `<kbd>${esc(label(k))}</kbd>`).join(' ') : esc(t.text)).join('');
}

/**
 * Widen every column whose text a filled neighbour would cut off (the header row, the totals'
 * labels), as AutoFit would; a lone label (a title, a note) keeps spilling into the empty cells
 * beside it. Never narrows. `textPx(cell, row)` is the width a label needs with its padding: the
 * engine's estimate by default, the rendered font's own measure in the browser (textMeasurer).
 * Mutates the demo's own sheet before anything is recorded.
 */
export function fitDemoColumns(S, textPx = cell => cellTxtPx(cell)) {
  const filled = (r, c) => { if (c < 1 || c > S.cols) return false; const v = S.get(r, c).value; return v !== '' && v != null; };
  for (let c = 1; c <= S.cols; c++) {
    let need = 0;
    for (let r = 1; r <= S.rows; r++) {
      const cell = S.get(r, c);
      if (typeof cell.value !== 'string' || !cell.value || cell.wrap) continue;
      if (filled(r, c - 1) || filled(r, c + 1)) need = Math.max(need, textPx(cell, r) + FIT_SLACK);
    }
    need = Math.min(Math.ceil(need), COLW_MAX);
    if (need > (S.colW[c] || COLW_DEFAULT)) S.colW[c] = need;
  }
}

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
  if (o.focusable) { el.tabIndex = 0; el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'A lesson playing itself. While it has focus your keys go to the sheet; Tab moves on.'); }
  // the keys pressed, in a band of their own: the compact card's sheet-tab strip under the grid, the foot of the task panel otherwise
  const keyband = o.compact
    ? '<div class="dp-keyband"><span class="dp-sheettab" id="demoTab"></span><div class="keyflash demo dp-keys" id="demoKeys" aria-hidden="true"></div></div>'
    : '<div class="dp-keyband"><span class="dp-keyband-cap">keys pressed</span><div class="keyflash demo dp-keys" id="demoKeys" aria-hidden="true"></div></div>';
  el.innerHTML = `
    <div class="dp-head"><span class="dp-dots"><i></i><i></i><i></i></span><span class="dp-cap">chapter 1 · four goals from three modules</span><span class="dp-count" id="demoCount">0 / 4</span></div>
    <div class="dp-grid">
      <div class="dp-stage"><div class="stage"><div class="stage-row"><div class="stage-main">
        <div class="ribbon-slot rib-full" id="demoRibbonSlot"><div class="ribbon" id="demoRibbon"></div></div><div id="demoSheet"></div>
      </div></div>${o.compact ? keyband : ''}</div>
        <button type="button" class="dp-play" id="demoPlay" hidden>▶ Play the demo</button></div>
      <aside class="dp-panel">
        <div class="task-card" id="demoTask"></div>
        <ol class="goals dp-goals" id="demoGoals"></ol>
        <div class="dp-hand" id="demoHand" hidden><b>Your turn.</b> The sheet is yours — same goals, any route.</div>
        ${o.compact ? '' : keyband}
      </aside>
    </div>`;
  host.appendChild(el);
  const $ = id => el.querySelector('#' + id);

  const run = new LessonRun(DEMO_LESSON, { mode: 'guided' });
  let sheetView = null, ribbonView = null, keycaps = null, unclip = null;
  let timer = null, i = 0, playing = false, started = false, taken = false, done = false, destroyed = false;
  const script = demoScript(DEMO_LESSON, o.cadence || 560);

  function paint() {
    if (destroyed) return;
    ribbonView.render(); sheetView.render();
    const states = run.goalStates();
    $('demoCount').textContent = `${run.doneCount} / ${run.goals.length}`;
    const tab = $('demoTab'), sh = run.session.sheets && run.session.sheets[run.session.sheetIndex];
    if (tab) tab.textContent = sh ? sh.name : '';
    const cur = run.current;
    $('demoTask').innerHTML = cur && !run.finished
      ? `<div class="task-label">${taken ? 'Now' : 'Watch'}</div><div class="task-goal">${esc(cur.text)}</div>${cur.teach ? `<div class="task-teach">${teachHtml(cur.teach)}</div>` : ''}<div class="task-keys">${cur.keys.split(/\s+/).map(k => /^(then|×\d+)$/.test(k) ? `<span class="kx">${esc(k)}</span>` : `<kbd>${esc(keyLabel(k))}</kbd>`).join(' ')}</div>`
      : `<div class="task-label">Done</div><div class="task-goal">Four goals, twelve keys, no mouse.</div><div class="task-teach">That is a lesson. The sheet is graded on what it ends up as, so any correct route counts.</div>`;
    const list = $('demoGoals');
    list.innerHTML = states.map(g => `<li class="goal ${g.done ? 'done' : g.current ? 'current' : ''}"><span class="goal-mark">${g.done ? '✓' : g.current ? '›' : ''}</span><span class="goal-text">${esc(g.text)}</span></li>`).join('');
    // a short frame shows fewer goals: the list keeps the current one in view, at its top (the ticked ones scroll away above it)
    const now = list.querySelector('.goal.current');
    list.scrollTop = now && now.offsetTop + now.offsetHeight > list.clientHeight ? now.offsetTop : 0;
    list.classList.toggle('dp-goals-more', list.scrollHeight - list.scrollTop > list.clientHeight + 1);   // more below: fade the cut line out
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
    if (unclip) unclip(); if (sheetView) sheetView.destroy(); if (ribbonView && ribbonView.destroy) ribbonView.destroy(); if (keycaps) keycaps.destroy();
    $('demoSheet').innerHTML = ''; $('demoRibbonSlot').innerHTML = '<div class="ribbon" id="demoRibbon"></div>';
    sheetView = new SheetView($('demoSheet'), run.session);
    // AutoFit on the cell font as it renders, so the whole feed fits the card where it can; then paint at those widths
    fitDemoColumns(run.session.sheet, textMeasurer($('demoSheet')) || undefined);
    sheetView.render();
    // the frame is the one tab stop: its scroll box is not a second one (Tab in, Tab out)
    const gw = $('demoSheet').querySelector('.gridwrap'); if (gw) gw.tabIndex = -1;
    ribbonView = new RibbonView($('demoRibbon'), run.session, { mode: 'full' });
    keycaps = mountKeycaps(run.session, { el: $('demoKeys'), hold: 1600 });
    unclip = clipToColumns($('demoSheet'), run.session);
    paint();
  }
  function play() {
    if (playing || destroyed || taken) return;
    playing = true; started = true; $('demoPlay').hidden = true;
    if (o.onPlay) { try { o.onPlay(); } catch (e) { /* host hook */ } }
    step();
  }
  function stop() { playing = false; if (timer) clearTimeout(timer); timer = null; }
  /** Play the rest at once (the learner pressed Enter). */
  function skip() { stop(); while (i < script.length) { const s = script[i++]; if (s.spec) run.pressSpec(s.spec); else if (s.text) for (const ch of s.text) run.key({ key: ch }); } finish(); }
  /** The visitor's key (or a click on the sheet, no event): the demo stops where it is and the sheet is theirs. */
  function takeover(ev) {
    if (taken) return ev ? run.key(ev) : false;
    taken = true; stop(); keycaps.reset();
    $('demoHand').hidden = false; $('demoPlay').hidden = true;
    if (o.onTakeover) { try { o.onTakeover(); } catch (e) { /* host hook */ } }
    const handled = ev ? run.key(ev) : false;
    paint();
    return handled;
  }

  run.onChange(() => { paint(); if (o.onChange) { try { o.onChange(); } catch (e) { /* host hook */ } } });
  mountViews();
  $('demoPlay').onclick = e => { e.stopPropagation(); play(); };
  if (o.autoplay !== false) play();
  else $('demoPlay').hidden = false;   // reduced motion: the first frame, still, with a way to start it
  return {
    el, run, play, stop, skip, takeover, restart,
    get playing() { return playing; }, get started() { return started; }, get taken() { return taken; },
    /** Finished: the script ran out, or the goals all landed while the last pause still runs. */
    get done() { return done || run.finished; },
    destroy() { destroyed = true; stop(); if (unclip) unclip(); if (keycaps) keycaps.destroy(); if (sheetView) sheetView.destroy(); if (ribbonView && ribbonView.destroy) ribbonView.destroy(); el.remove(); },
  };
}

/**
 * The width a label needs in the grid's own font: the text, the cell padding each side, a pixel of
 * border. Row 1 is measured bold (the demo bolds the header). null where there is no canvas.
 */
function textMeasurer(sheetEl) {
  const td = sheetEl.querySelector('.gridwrap td');
  const ctx = td && typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
  if (!ctx) return null;
  const cs = getComputedStyle(td), base = parseFloat(cs.fontSize) || 14.67;
  return (cell, r) => {
    ctx.font = `${cell.it ? 'italic ' : ''}${cell.bold || r === 1 ? 700 : 400} ${cell.fsz ? base * cell.fsz / 13.5 : base}px ${cs.fontFamily}`;
    return Math.ceil(ctx.measureText(String(cell.value)).width) + 2 * 3 + 1;
  };
}

/**
 * End the grid on a column boundary: .gridwrap narrows to the last column that shows whole at the
 * current scroll, and before any label that would spill past that edge, so the frame never slices
 * a word. Re-measured after every change, scroll and resize. Returns the undo.
 */
function clipToColumns(sheetEl, session) {
  let raf = 0;
  const gw = sheetEl.querySelector('.gridwrap');
  const measure = () => {
    raf = 0;
    const hdr = gw && gw.querySelector('tr');
    if (!hdr || !hdr.cells.length) return;
    const avail = sheetEl.clientWidth; if (avail <= 0) return;
    const g = gw.getBoundingClientRect(), chrome = gw.offsetWidth - gw.clientWidth;   // a vertical scrollbar, where the platform draws one
    const cells = hdr.cells, x0 = cells[0].getBoundingClientRect().right - g.left;   // the row numbers stay put at the left
    let edge = x0;
    for (let c = 1; c < cells.length; c++) {
      const r = cells[c].getBoundingClientRect(), left = r.left - g.left, right = r.right - g.left;
      if (left < x0 - 0.5) continue;   // scrolled away under the row numbers
      if (right + chrome > avail + 0.5) break;
      edge = right;
    }
    // a label spilling past that edge would be sliced there: end the grid before its column instead
    for (let moved = true; moved;) {
      moved = false;
      for (const sp of gw.querySelectorAll('td.spill > .sp')) {
        const s = sp.getBoundingClientRect(); if (s.bottom <= g.top || s.top >= g.bottom) continue;
        const left = sp.parentElement.getBoundingClientRect().left - g.left, right = s.right - g.left;
        if (left >= x0 - 0.5 && left < edge - 0.5 && right > edge + 0.5) { edge = left; moved = true; }
      }
    }
    const w = Math.round(edge + chrome) + 'px';
    if (gw.style.maxWidth !== w) gw.style.maxWidth = w;
    // the strip past the last column is blank sheet, not a hole in the frame (dark themes keep a light sheet)
    const tb = gw.querySelector('table'), paper = tb ? getComputedStyle(tb).backgroundColor : '';
    if (paper && sheetEl.style.backgroundColor !== paper) sheetEl.style.backgroundColor = paper;
  };
  const soon = () => { if (!raf) raf = requestAnimationFrame(measure); };
  const unsub = session.onChange(soon);
  if (gw) gw.addEventListener('scroll', soon, { passive: true });
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(soon) : null;
  if (ro) ro.observe(sheetEl);
  soon();
  return () => { if (raf) cancelAnimationFrame(raf); if (typeof unsub === 'function') unsub(); if (gw) gw.removeEventListener('scroll', soon); if (ro) ro.disconnect(); };
}
