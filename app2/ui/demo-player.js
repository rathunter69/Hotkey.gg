// app2/ui/demo-player.js — a real lesson that plays itself (experience pass, decision 1; screenplay
// 3.0 "The landing page"): the weekly Report on the real sheet, under the Ribbon's tab row, with
// the task card that points (ui/components/task-card.js) sitting beside each goal's target, its
// keycaps filling as the platform presses them. About twenty seconds. The landing's hero runs it;
// once the visitor clicks it or tabs to it, their first key takes the sheet over (SITE_SPEC §3),
// so the demo is the lesson, not a film of one.
//
//   const demo = mountDemo(hostEl, { loop, autoplay, focusable, onDone, onPlay, onChange, onTakeover });
//   demo.play(); demo.skip(); demo.destroy();
//
// The sheet opens at the zoom that fits the Report across the frame (demoZoom, held between 85%
// and 100% so the cells stay readable), and the grid ends on a column boundary, so no label is cut off.
//
// No sound (the learner has not pressed a key yet), no records, no XP: nothing here counts.
import { LessonRun, hintToScript } from '../app/runner.js';
import { parseKeyScript } from '../engine/keyboard.js';
import { SheetView } from './sheet-view.js';
import { RibbonView } from './ribbon-view.js';
import { keyLabel } from '../app/prefs.js';
import { siteCopy } from '../content/copy/apply.js';
import { COLW_DEFAULT, COLW_MAX, FIT_SLACK, cellTxtPx } from '../engine/sheet.js';
import { createTaskCard, placeCard, routeTokens, routeProgress } from './components/task-card.js';
import { inferTarget, targetBoxes, unionBox } from './cues.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NUM_HEADERS = ['C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'];

/** The demo lesson: four goals on the weekly Report (1.5.3's page before its alignment pass), each one real, each graded on the sheet's end state. */
export const DEMO_LESSON = {
  id: 'demo', kind: 'lesson', chapter: 'foundations', section: 'Format', title: 'Alignment and titles', difficulty: 'easy', tags: [], access: 'free',
  workbook: 'clearcoat-weekly', state: { before: 'S5b', after: 'S5b' }, minutes: 1,
  brief: 'The Report’s figures are in. Make the units line a note, right-align the headers over the figures and turn the gridlines off.',
  goals: [
    { id: 'units', teach: 'Ctrl+I sets italic, so a note reads as a note.', text: 'Make the units line italic, A2.', keys: '↓ Ctrl+I', requires: ['bold-italic-underline'], check: s => !!s.cellAt('A2').it },
    { id: 'headers', teach: 'Ctrl+Shift+→ selects to the edge in one press.', text: 'Select the headers over the figures, C4:I4.', keys: '↓ ×2 → ×2 Ctrl+Shift+→', requires: ['ctrl-shift-arrow'], check: s => s.selectionText() === 'C4:I4' },
    { id: 'right', teach: 'Alt walks the Ribbon: H for Home, A for Align, R for Right.', text: 'Right-align the headers, C4:I4.', keys: 'Alt H A R', requires: ['align-command'], check: s => NUM_HEADERS.every(ref => s.cellAt(ref).align === 'r') },
    { id: 'grid', teach: 'Alt walks the Ribbon: W for View, V then G for Gridlines.', text: 'Turn the gridlines off.', keys: 'Alt W V G', requires: ['gridlines'], check: s => s.gridlines === false },
  ],
  solution: 'Down Ctrl+I Down Down Right Right Ctrl+Shift+Right Alt H A R Alt W V G',
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

/** The zoom the demo opens at: as much of the Report as fits across the frame, never past 100% nor under 85% (so the cells stay readable). */
export const DEMO_ZOOM = { floor: 85, max: 100, rowHdr: 36 };

/**
 * The zoom (%) at which every filled column of the sheet (the row numbers included) fits `width`
 * px, held between DEMO_ZOOM's floor and max. A whole-row format (a bold header row) does not
 * count as content, so it never shrinks the page. Pure over the sheet.
 */
export function demoZoom(S, width, z = DEMO_ZOOM) {
  if (!S || !(width > 0)) return z.max;
  let last = 1;
  for (let r = 1; r <= S.rows; r++) for (let c = S.cols; c > last; c--) { const x = S.get(r, c); if (x.formula || (x.value !== '' && x.value != null)) { last = c; break; } }
  let w = z.rowHdr;
  for (let c = 1; c <= last; c++) w += S.colW[c] || COLW_DEFAULT;
  return Math.max(z.floor, Math.min(z.max, Math.floor(100 * width / w)));
}

/**
 * @param {HTMLElement} host
 * @param {object} [o]  loop: restart after the end; autoplay (default true); focusable: the frame
 *                      is one tab stop and its keys go to the sheet; onDone(), onPlay(), onChange(),
 *                      onTakeover(); cadence ms
 */
export function mountDemo(host, o = {}) {
  const el = document.createElement('div');
  el.className = 'dp dp-live';
  if (o.focusable) { el.tabIndex = 0; el.setAttribute('role', 'group'); el.setAttribute('aria-label', siteCopy('demo_aria', 'A lesson playing itself. While it has focus your keys go to the sheet; Tab moves on.')); }
  el.innerHTML = `
    <div class="ribbon-slot dp-rib" id="demoRibbonSlot"><div class="ribbon" id="demoRibbon"></div></div>
    <div class="dp-stage" id="demoStage"><div class="stage"><div class="stage-row"><div class="stage-main"><div id="demoSheet"></div></div></div></div>
      <button type="button" class="dp-play" id="demoPlay" hidden>${esc(siteCopy('demo_play', 'Play the demo'))}</button></div>
    <div class="dp-foot"><span class="dp-sheettab" id="demoTab"></span><span class="dp-count" id="demoCount">0 / 4</span></div>`;
  host.appendChild(el);
  const $ = id => el.querySelector('#' + id);
  const stage = $('demoStage');
  const card = createTaskCard(stage, {});

  const run = new LessonRun(DEMO_LESSON, { mode: 'guided' });
  let sheetView = null, ribbonView = null, unclip = null, ro = null;
  let timer = null, i = 0, playing = false, started = false, taken = false, done = false, destroyed = false;
  const script = demoScript(DEMO_LESSON, o.cadence || 560);
  const sheetName = () => { const sh = run.session.sheets && run.session.sheets[run.session.sheetIndex]; return sh ? sh.name : ''; };

  function paintCard() {
    const m = run.goals.length, cur = run.current;
    if (!cur || run.finished) card.set({ n: m, m, goal: siteCopy('demo_done', 'That was a lesson. The sheet is graded on how it ends up, so any route that gets there counts, and the next one is yours.'), state: 'done' });
    else {
      const tokens = routeTokens(cur.keys);
      const progress = routeProgress(tokens, run.session.keyLog.slice(run.session.goalMark || 0));
      card.set({ n: Math.min(run.doneCount + 1, m), m, goal: cur.text, keys: tokens, progress, state: 'repeat' });
    }
    card.el.hidden = false;
    placeNow();
  }
  /** The card beside the goal's target on the side with the most room (the lesson workspace's rule), or docked when the goal has none. */
  function placeNow() {
    if (!sheetView) return;
    const gw = sheetView.gw, b = sheetView.box(); if (!b) return;
    const g = gw.getBoundingClientRect(), st = stage.getBoundingClientRect();
    if (!g.width || !g.height) return;
    const box = { w: gw.clientWidth, h: gw.clientHeight, x0: b.x0, y0: b.y0 };
    const sl = gw.scrollLeft, sp = gw.scrollTop;
    const shift = r => (r ? { left: r.left - sl, top: r.top - sp, width: r.width, height: r.height } : null);
    const cur = run.finished ? null : run.current;
    const names = (run.session.sheets || []).map(x => x.name);
    const target = cur ? shift(unionBox(targetBoxes(sheetView, inferTarget(cur, names), sheetName()))) : null;
    const sel = run.session.sheet && run.session.sheet.selectionText ? run.session.sheet.selectionText() : '';
    const avoid = targetBoxes(sheetView, sel, null).map(shift).filter(r => r.width * r.height < 0.3 * box.w * box.h);
    const size = card.measure();
    card.place(placeCard(box, target, size, { avoid }), { left: g.left - st.left, top: g.top - st.top });
  }
  function paint() {
    if (destroyed || !sheetView || !ribbonView) return;   // a change while the views mount (the zoom) paints once they are up
    ribbonView.render(); sheetView.render();
    $('demoCount').textContent = `${run.doneCount} / ${run.goals.length}`;
    $('demoTab').textContent = sheetName();
    paintCard();
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
  /** The zoom that fits the Report across the sheet's frame, at the frame's current width. */
  function fitZoom() {
    const S = run.session.sheet, w = $('demoSheet').clientWidth;
    if (!S || !(w > 0)) return false;
    const z = demoZoom(S, w - 2);
    if (z === S.zoom) return false;
    S.setZoom(z); return true;
  }
  /** Fresh views on the run's (possibly rebuilt) session. */
  function mountViews() {
    if (unclip) unclip(); if (sheetView) sheetView.destroy(); if (ribbonView && ribbonView.destroy) ribbonView.destroy();
    $('demoSheet').innerHTML = ''; $('demoRibbonSlot').innerHTML = '<div class="ribbon" id="demoRibbon"></div>';
    const ss = run.session;
    ss.settings.ribbonCollapsed = true;   // the Ribbon's tab row; a KeyTip walk opens the groups over the sheet, as Ctrl+F1 does in Excel
    // so small a frame shows the page whole: no outline bar over the column letters, no frozen column holding the title in A
    for (const e of ss.sheets || []) if (e.sheet) { e.sheet.groups = { rows: [], cols: [] }; e.sheet.freeze = { r: 0, c: 0 }; }
    sheetView = new SheetView($('demoSheet'), ss);
    fitDemoColumns(ss.sheet, textMeasurer($('demoSheet')) || undefined);
    fitZoom();
    sheetView.render();
    // the frame is the one tab stop: its scroll box is not a second one (Tab in, Tab out)
    const gw = $('demoSheet').querySelector('.gridwrap'); if (gw) gw.tabIndex = -1;
    ribbonView = new RibbonView($('demoRibbon'), ss, { mode: 'full' });
    unclip = clipToColumns($('demoSheet'), ss);
    paint();
  }
  function play() {
    if (playing || destroyed || taken) return;
    playing = true; started = true; $('demoPlay').hidden = true;
    if (o.onPlay) { try { o.onPlay(); } catch (e) { /* host hook */ } }
    step();
  }
  function stop() { playing = false; if (timer) clearTimeout(timer); timer = null; }
  /** Play the rest at once. */
  function skip() { stop(); while (i < script.length) { const s = script[i++]; if (s.spec) run.pressSpec(s.spec); else if (s.text) for (const ch of s.text) run.key({ key: ch }); } finish(); }
  /** The visitor's key (or a click on the sheet, no event): the demo stops where it is and the sheet is theirs. */
  function takeover(ev) {
    if (taken) return ev ? run.key(ev) : false;
    taken = true; stop();
    $('demoPlay').hidden = true;
    if (o.onTakeover) { try { o.onTakeover(); } catch (e) { /* host hook */ } }
    const handled = ev ? run.key(ev) : false;
    paint();
    return handled;
  }

  run.onChange(() => { paint(); if (o.onChange) { try { o.onChange(); } catch (e) { /* host hook */ } } });
  mountViews();
  // a wider or narrower frame (the window, the breakpoint) refits the zoom and moves the card
  if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(() => { if (destroyed) return; if (fitZoom()) sheetView.render(); placeNow(); }); ro.observe($('demoSheet')); }
  $('demoPlay').onclick = e => { e.stopPropagation(); play(); };
  if (o.autoplay !== false) play();
  else $('demoPlay').hidden = false;   // reduced motion: the first frame, still, with a way to start it
  return {
    el, run, play, stop, skip, takeover, restart,
    get playing() { return playing; }, get started() { return started; }, get taken() { return taken; },
    /** Finished: the script ran out, or the goals all landed while the last pause still runs. */
    get done() { return done || run.finished; },
    destroy() { destroyed = true; stop(); if (ro) ro.disconnect(); if (unclip) unclip(); card.destroy(); if (sheetView) sheetView.destroy(); if (ribbonView && ribbonView.destroy) ribbonView.destroy(); el.remove(); },
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
