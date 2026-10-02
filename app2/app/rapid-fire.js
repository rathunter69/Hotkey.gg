// app2/app/rapid-fire.js — rapid-fire's stage (screenplay 3.0 "Rapid-fire", 6.5; M100). Not the
// workspace: a clean page with a top bar (Back on Esc, the round's length, the hits, the clock),
// the ten-segment combo meter, the command's name as the page's one large line, a small sheet
// fragment with the target cells outlined, and the keycaps, shown as "?" until each is pressed.
//
// Every prompt is a fresh fragment built from its own seed (content/rapid-deck.js), so no two look
// alike, and it is graded on the fragment's end state: any legitimate route passes. A chord that
// changes the fragment without landing the command is a miss: the keys shake, the meter drains and
// the next prompt comes. The round's result names the three slowest commands; Drill these (Enter)
// plays a thirty-second round of just those. A round counts as practice and pays a little XP; it
// never sets a drill best.
//
//   #/rapid               Ready on the last length (Enter starts)
//   #/rapid?len=60        Ready on that length
//   #/rapid?focus=a,b,c   Ready for a thirty-second round of those commands
import { RAPID_DECK, RAPID_BY_ID, RAPID_DURATIONS, deckFor, buildFrag, fragSession, atRest, stateSig, fragRect } from '../content/rapid-deck.js';
import { splitSequence, splitHold } from '../content/reference.js';
import { LESSONS_BY_ID, CHAPTERS } from '../content/index.js';
import { SheetView } from '../ui/sheet-view.js';
import { RibbonView } from '../ui/ribbon-view.js';
import { mountEffects, parseMs } from '../ui/effects.js';
import { prefs, keyLabel } from './prefs.js';
import { store } from './store.js';
import { attemptId, dayOf } from './records.js';
import { gameCtx, celebrate } from './stats.js';
import { schedule, rapidOrder, RAPID_CONCEPT } from './schedule.js';
import { track } from './telemetry.js';
import { siteCopy } from '../content/copy/apply.js';
import { esc, fill, fmtClock } from '../ui/components/format.js';
import { mulberry32 } from '../engine/rng.js';

const t = (key, vars) => fill(siteCopy(key, key), vars);

export { RAPID_DECK, RAPID_DURATIONS };
export const FOCUS_SECS = 30;
/** A combo that bursts: 5, 10, 15, 20 (3.0, Rapid-fire). */
export const BURSTS = [5, 10, 15, 20];
/** A miss counts as this many seconds when the slowest commands are ranked: a wrong chord is the slowest kind. */
export const MISS_SECS = 6;
const LEN_KEY = 'hk2_rapid_len';   // the last length played: a per-viewer convenience

/* ---------------- pure rules (tests/rapid-stage.test.js) ---------------- */

/** Points a hit scores at a combo count (before the hit): 10 × (1 + floor(combo/5)). Live Wire reads the total. */
export const hitPoints = combo => 10 * (1 + Math.floor(combo / 5));
/** The meter's lit segments for a combo: 0 to 10, the tenth hit filling it, the eleventh starting it again. */
export const meterFill = combo => (combo <= 0 ? 0 : ((combo - 1) % 10) + 1);
export const isBurst = combo => BURSTS.includes(combo);
export const accuracy = (hits, misses) => (hits + misses ? Math.round(100 * hits / (hits + misses)) : 0);

/**
 * The commands a round was slowest on: each prompt's average seconds (a miss counts MISS_SECS or
 * its own time, whichever is longer), slowest first. times: { id: [secs, …] } with a miss as -secs.
 * → [{ id, secs, misses, n }]
 */
export function slowest(times, n = 3) {
  const rows = Object.entries(times || {}).map(([id, list]) => {
    const misses = list.filter(x => x < 0).length;
    const secs = list.reduce((a, x) => a + (x < 0 ? Math.max(MISS_SECS, -x) : x), 0) / list.length;
    return { id, secs: Math.round(secs * 10) / 10, misses, n: list.length };
  });
  return rows.sort((a, b) => b.secs - a.secs || b.misses - a.misses || a.id.localeCompare(b.id)).slice(0, n);
}

/** The furthest chapter the learner has reached: the latest chapter with a lesson started or done (1 at least). */
export function reachedChapter(all = {}) {
  let n = 1;
  for (const id in all) {
    const l = LESSONS_BY_ID[id]; if (!l || !all[id]) continue;
    const i = CHAPTERS.findIndex(c => c.id === l.chapter);
    if (i >= 0) n = Math.max(n, i + 1);
  }
  return n;
}

/** The keys a chord is pressed with, one cap each: 'Ctrl+Alt+V V ↵' → ['Ctrl', 'Alt', 'V', 'V', '↵']. */
export const capsOf = chord => splitSequence(chord).flatMap(seg => splitHold(seg));
/** The keys of one key-log label ('Ctrl+Shift+↓', 'Alt', 'H'): the same split. */
export const keysOfLabel = label => (label === '+' ? ['+'] : splitHold(label));

/**
 * The prompt order for a round: the deck, the weakest remembered first (the due-today memory),
 * then cycled with a fresh shuffle, never the same command twice in a row.
 */
export function roundOrder(ids, seed, memory = null, n = 400) {
  const rng = mulberry32(seed);
  const deck = ids.map(id => ({ id }));
  const first = memory ? rapidOrder(deck, memory, seed).map(i => ids[i]) : ids.slice();
  const out = [];
  let bag = first;
  while (out.length < n) {
    for (const id of bag) { if (out.length && out[out.length - 1] === id && bag.length > 1) continue; out.push(id); if (out.length >= n) break; }
    bag = ids.slice();
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    if (ids.length === 1) bag = ids.slice();
  }
  return out;
}

/** The deck line under Ready: how many commands, from which chapters. */
export function deckLine(n, ch, focus) {
  if (focus) return t('rapid_deck_focus', { n });
  return ch <= 1 ? t('rapid_deck_ch1', { n }) : t('rapid_deck_chs', { n, k: ch });
}

const lastLen = () => { try { const n = Number(localStorage.getItem(LEN_KEY)); return RAPID_DURATIONS.includes(n) ? n : 60; } catch (e) { return 60; } };
const keepLen = n => { try { localStorage.setItem(LEN_KEY, String(n)); } catch (e) { /* private window */ } };
const cssMs = name => { try { return parseMs(getComputedStyle(document.documentElement).getPropertyValue('--' + name)); } catch (e) { return 0; } };
const cssNum = (name, dflt) => { try { const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--' + name)); return Number.isFinite(v) ? v : dflt; } catch (e) { return dflt; } };
const lenLabel = n => t('rapid_len_' + n);
const hitsLabel = n => (n === 1 ? t('rapid_hits_one') : t('rapid_hits', { n }));
const cmdName = id => siteCopy('rapid_cmd_' + id, (RAPID_BY_ID[id] || {}).name || id);
const capHtml = (label, cls = '') => `<kbd class="key rf-cap${cls}">${esc(label)}</kbd>`;
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'AltGraph']);

/* ---------------- the page ---------------- */

export function mountRapidPage(root, ctx = {}) {
  const q = (ctx && ctx.query) || {};
  const focusIds = String(q.focus || '').split(',').filter(id => RAPID_BY_ID[id]).slice(0, 3);
  const focus = focusIds.length > 0;
  let dur = focus ? FOCUS_SECS : (RAPID_DURATIONS.includes(Number(q.len)) ? Number(q.len) : lastLen());
  const chapter = reachedChapter(store.all());
  const ids = focus ? focusIds : deckFor(chapter).map(p => p.id);

  const el = document.createElement('div');
  el.className = 'rf';
  el.dataset.phase = 'ready';
  root.appendChild(el);
  const fx = mountEffects();
  const platform = prefs.get().platform;

  let phase = 'ready';
  let s = null, view = null, ribbon = null, unsub = null;
  let frag = null, prompt = null, order = [], oi = 0, sig = '', logAt = 0, pressed = [], stallH = null, holdH = null, tickH = null, hold = false;
  let endAt = 0, startAt = 0, promptAt = 0;
  let hits = 0, misses = 0, combo = 0, bestCombo = 0, points = 0, keys = 0, seed = 0;
  let times = {};
  let synthwave = false;
  const hadCombo10 = store.attempts({ kind: 'rapid' }).some(a => ((a.splits && a.splits[2]) || 0) >= 10);
  const STALL = cssMs('d-stall') || 3000, NEXT = cssMs('d-rapid-next') || 450, WRONG = cssMs('d-wrong-wait') || 1200;

  el.innerHTML = `
    <header class="rf-top">
      <button type="button" class="btn2 btn2-quiet rf-back" id="rfBack"><kbd class="key">Esc</kbd><span>${esc(t('rapid_back'))}</span></button>
      <span class="rf-len" id="rfLen"></span>
      <span class="rf-hits" id="rfHits"></span>
      <span class="rf-clock" id="rfClock"></span>
    </header>
    <div class="rf-meter" id="rfMeter" aria-live="polite">
      <div class="rf-segs">${Array.from({ length: 10 }, () => '<i></i>').join('')}</div>
      <span class="rf-combo" id="rfCombo"></span>
    </div>
    <main class="rf-main" id="rfMain"></main>`;
  const $ = sel => el.querySelector(sel);
  $('#rfBack').onclick = () => leave();

  function paintTop() {
    $('#rfLen').textContent = lenLabel(dur);
    $('#rfHits').textContent = hitsLabel(hits);
    const left = phase === 'run' ? Math.max(0, (endAt - Date.now()) / 1000) : dur;
    const c = $('#rfClock'); c.textContent = fmtClock(left, true); c.classList.toggle('low', phase === 'run' && left < 10);
  }
  function paintMeter() {
    const lit = meterFill(combo);
    el.querySelectorAll('.rf-segs i').forEach((seg, i) => seg.classList.toggle('on', i < lit));
    $('#rfCombo').textContent = combo > 0 ? t('rapid_combo', { n: combo }) : t('rapid_combo_none');
  }

  /* ---- Ready ---- */
  function renderReady() {
    phase = 'ready'; el.dataset.phase = 'ready';
    const lens = focus ? '' : `<div class="rf-lens" role="radiogroup">${RAPID_DURATIONS.map((n, i) => `<button type="button" role="radio" aria-checked="${n === dur}" class="rf-lenbtn${n === dur ? ' on' : ''}" data-len="${n}"><kbd class="key">${i + 1}</kbd><span>${esc(t('rapid_len_short_' + n))}</span></button>`).join('')}</div>`;
    $('#rfMain').innerHTML = `<section class="rf-ready">
      <p class="rf-start">${esc(focus ? t('rapid_ready_focus') : t('rapid_ready'))}</p>
      ${lens}
      <p class="rf-deckline">${esc(deckLine(ids.length, chapter, focus))}</p>
      ${focus ? `<ol class="rf-focus">${focusIds.map(id => `<li>${esc(cmdName(id))}</li>`).join('')}</ol>` : ''}
      <p class="rf-fine">${esc(siteCopy('rapid_fine', ''))} ${esc(t('rapid_esc_note'))}</p>
    </section>`;
    el.querySelectorAll('.rf-lenbtn').forEach(b => { b.onclick = () => { dur = Number(b.dataset.len); keepLen(dur); renderReady(); }; });
    paintTop(); paintMeter();
  }

  /* ---- Run ---- */
  function startRound() {
    phase = 'run'; el.dataset.phase = 'run';
    if (!focus) keepLen(dur);
    hits = 0; misses = 0; combo = 0; bestCombo = 0; points = 0; keys = 0; times = {}; synthwave = false;
    seed = (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
    let memory = null; try { memory = schedule.state(); } catch (e) { memory = null; }
    order = roundOrder(ids, seed, memory); oi = 0;
    $('#rfMain').innerHTML = `<section class="rf-play">
      <h1 class="rf-prompt" id="rfPrompt"></h1>
      <div class="rf-frag" id="rfFrag"><div class="rf-ribbon ribbon-slot"></div><div class="rf-sheet stage-main" id="rfSheet"></div><div class="rf-target" id="rfTarget" aria-hidden="true"></div></div>
      <div class="rf-keys" id="rfKeys"></div>
      <p class="rf-note" id="rfNote"></p>
    </section>`;
    startAt = Date.now(); endAt = startAt + dur * 1000;
    tickH = setInterval(tick, 100);
    fx.setBusy(true); fx.clockStart();
    track('rapid_start', { dur, focus: focus ? 1 : 0 });
    nextPrompt();
    paintTop(); paintMeter();
  }

  function mountFragment() {
    if (unsub) { unsub(); unsub = null; }
    if (view) { view.destroy(); view = null; }
    if (ribbon) { ribbon.destroy(); ribbon = null; }
    s = fragSession(frag, { onKey: () => {} });
    s.sheet.zoom = cssNum('rf-zoom', 160);
    const host = $('#rfSheet'); host.innerHTML = '';
    ribbon = new RibbonView($('#rfFrag .rf-ribbon'), s, { mode: 'slim' });
    view = new SheetView(host, s);
    unsub = s.onChange(() => requestAnimationFrame(placeTarget));
    requestAnimationFrame(placeTarget);
  }

  /** The dashed outline over the target cells, from the painted grid's own cells. */
  function placeTarget() {
    const box = $('#rfTarget'), host = $('#rfFrag'); if (!box || !host || !frag) return;
    const g = fragRect(frag.target); if (!g) { box.hidden = true; return; }
    const tdAt = (r, c) => host.querySelector(`td[data-r="${r}"][data-c="${c}"]`);
    let a = null, b = null;
    for (let r = g.r1; r <= g.r2 && !a; r++) for (let c = g.c1; c <= g.c2 && !a; c++) { const td = tdAt(r, c); if (td && td.offsetWidth) a = td; }
    for (let r = g.r2; r >= g.r1 && !b; r--) for (let c = g.c2; c >= g.c1 && !b; c--) { const td = tdAt(r, c); if (td && td.offsetWidth) b = td; }
    if (!a || !b) { box.hidden = true; return; }
    const hr = host.getBoundingClientRect(), ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
    const clip = $('#rfSheet').getBoundingClientRect();
    const left = Math.max(ar.left, clip.left), top = Math.max(ar.top, clip.top), right = Math.min(br.right, clip.right), bottom = Math.min(br.bottom, clip.bottom);
    if (right <= left || bottom <= top) { box.hidden = true; return; }
    box.hidden = false;
    box.style.left = (left - hr.left) + 'px'; box.style.top = (top - hr.top) + 'px';
    box.style.width = (right - left) + 'px'; box.style.height = (bottom - top) + 'px';
  }

  function nextPrompt() {
    hold = false;
    const id = order[oi % order.length]; oi++;
    prompt = RAPID_BY_ID[id];
    frag = buildFrag(id, (seed + oi * 2654435761) >>> 0);
    mountFragment();
    sig = stateSig(s); logAt = 0; pressed = [];
    promptAt = Date.now();
    $('#rfPrompt').textContent = cmdName(id);
    $('#rfFrag').classList.remove('hit', 'miss');
    paintCaps('hidden');
    if (stallH) clearTimeout(stallH);
    stallH = setTimeout(() => { if (phase === 'run' && !hold) paintCaps('reveal'); }, STALL);
  }

  /** The caps: one per key of the reference chord, "?" until pressed; pressed keys fill them in order. */
  function paintCaps(how) {
    const ref = capsOf(prompt.keys).map(k => keyLabel(k, platform));
    const n = Math.max(ref.length, pressed.length);
    let html = '';
    for (let i = 0; i < n; i++) {
      if (how === 'answer' || how === 'reveal') html += capHtml(ref[i] || '', how === 'reveal' ? ' shown' : ' answer');
      else if (i < pressed.length) html += capHtml(keyLabel(pressed[i], platform), ' on');
      else html += capHtml('?', ' q');
    }
    $('#rfKeys').innerHTML = html;
  }

  function tick() {
    paintTop();
    if (phase === 'run' && Date.now() >= endAt) endRound();
  }

  function onHit() {
    const secs = (Date.now() - promptAt) / 1000;
    (times[prompt.id] = times[prompt.id] || []).push(Math.round(secs * 10) / 10);
    points += hitPoints(combo); combo++; hits++; bestCombo = Math.max(bestCombo, combo);
    noteMemory(prompt.id, secs <= 3 ? 5 : 4);
    hold = true; if (stallH) clearTimeout(stallH);
    $('#rfFrag').classList.add('hit');
    paintCaps('pressed');
    fx.hit(); fx.play('rapid-hit', $('#rfKeys'));
    if (isBurst(combo)) {
      fx.play('combo', $('#rfMeter'));
      if (combo === 10 && !hadCombo10 && !synthwave) { synthwave = true; $('#rfNote').textContent = t('rapid_synthwave'); }
    }
    paintTop(); paintMeter();
    holdH = setTimeout(() => { if (phase === 'run') nextPrompt(); }, NEXT);
  }
  function onMiss() {
    const secs = (Date.now() - promptAt) / 1000;
    (times[prompt.id] = times[prompt.id] || []).push(-Math.round(secs * 10) / 10);
    misses++;
    noteMemory(prompt.id, 1);
    if (combo > 0) fx.comboBreak();
    combo = 0;
    hold = true; if (stallH) clearTimeout(stallH);
    $('#rfFrag').classList.add('miss');
    paintCaps('answer');
    fx.play('wrong', $('#rfKeys'));
    paintTop(); paintMeter();
    holdH = setTimeout(() => { if (phase === 'run') nextPrompt(); }, WRONG);
  }
  function noteMemory(id, q) { const c = RAPID_CONCEPT[id]; if (!c) return; try { schedule.note([c], q); } catch (e) { /* storage */ } }

  /** After every key the session took: fill the caps, then judge the fragment. */
  function judge() {
    const log = s.keyLog;
    if (log.length > logAt) { for (const e of log.slice(logAt)) pressed.push(...keysOfLabel(e.k)); keys += log.length - logAt; logAt = log.length; }
    if (prompt.check(s, frag)) { onHit(); return; }
    paintCaps('pressed');
    if (atRest(s) && stateSig(s) !== sig) onMiss();
  }

  function endRound() {
    if (phase !== 'run') return;
    phase = 'done'; el.dataset.phase = 'done';
    stopTimers();
    fx.clockStop();
    const before = gameCtx();
    recordRound(dur);
    const after = gameCtx();
    track('rapid_complete', { dur, hits, misses, combo: bestCombo, focus: focus ? 1 : 0 });
    fx.setBusy(false);
    celebrate(fx, before);
    renderResult(Math.max(0, after.xp - before.xp));
  }
  function recordRound(secs) {
    store.addAttempt({ id: attemptId(), kind: 'rapid', ref: focus ? 'rapid-focus' : 'rapid-' + dur, day: dayOf(), seed, secs, keys, clean: false, helped: false, mouse: 0, tier: 'none', splits: [hits, misses, bestCombo, points], trace: [], at: Date.now() });
  }

  /* ---- Result ---- */
  let slow = [];
  function renderResult(xp) {
    tearDownSheet();
    slow = slowest(times, 3);
    const rows = slow.map(r => `<tr><td class="rf-cmd">${esc(cmdName(r.id))}</td><td class="rf-ks">${capsOf(RAPID_BY_ID[r.id].keys).map(k => capHtml(keyLabel(k, platform))).join('')}</td><td class="num rf-time">${esc(t('rapid_secs', { s: r.secs.toFixed(1) }))}</td></tr>`).join('');
    const facts = [t('rapid_best_combo', { c: bestCombo }), t('rapid_accuracy', { a: accuracy(hits, misses) }), xp ? t('rapid_xp', { n: xp }) : t('rapid_xp_none')];
    $('#rfMain').innerHTML = `<section class="rf-result">
      <h1 class="rf-prompt rf-total">${esc(hitsLabel(hits))}</h1>
      <ul class="rf-facts">${facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      ${synthwave ? `<p class="rf-unlock">${esc(t('rapid_synthwave'))}</p>` : ''}
      <div class="rf-slow">
        <h2 class="rf-slow-h">${esc(slow.length >= 3 ? t('rapid_slowest') : t('rapid_slowest_few'))}</h2>
        ${slow.length ? `<table class="rf-slow-t"><thead><tr><th>${esc(t('col_command'))}</th><th>${esc(t('col_keys_press'))}</th><th class="num">${esc(t('col_average'))}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="rf-fine">${esc(t('rapid_slow_none'))}</p>`}
      </div>
      <div class="rf-acts">
        ${slow.length ? `<button type="button" class="btn2 btn2-primary" id="rfDrill"><span>${esc(t('rapid_drill_these'))}</span><kbd class="key">Enter</kbd></button>` : ''}
        <button type="button" class="btn2${slow.length ? '' : ' btn2-primary'}" id="rfAgain"><span>${esc(t('rapid_again'))}</span><kbd class="key">R</kbd></button>
        <button type="button" class="btn2 btn2-quiet" id="rfDone"><span>${esc(t('rapid_back'))}</span><kbd class="key">Esc</kbd></button>
      </div>
    </section>`;
    const d = $('#rfDrill'); if (d) d.onclick = drillThese;
    $('#rfAgain').onclick = again;
    $('#rfDone').onclick = () => leave();
    paintTop(); paintMeter();
  }
  function drillThese() { if (!slow.length) return again(); location.hash = '#/rapid?focus=' + slow.map(r => r.id).join(','); }
  function again() { if (focus) location.hash = '#/rapid?len=' + lastLen(); else { combo = 0; startRound(); } }

  function stopTimers() {
    if (tickH) { clearInterval(tickH); tickH = null; }
    if (stallH) { clearTimeout(stallH); stallH = null; }
    if (holdH) { clearTimeout(holdH); holdH = null; }
  }
  function tearDownSheet() {
    if (unsub) { unsub(); unsub = null; }
    if (view) { view.destroy(); view = null; }
    if (ribbon) { ribbon.destroy(); ribbon = null; }
    s = null;
  }
  /** Esc, or Back: out to the Rapid-fire page. A round left early is not recorded, unless it reached the first Combo 10 the meter promised. */
  function leave() {
    if (phase === 'run') {
      stopTimers();
      if (synthwave) recordRound(Math.round((Date.now() - startAt) / 100) / 10);
      fx.setBusy(false);
    }
    phase = 'left';
    location.hash = '#/practice/rapid';
  }

  /* ---- the keyboard ---- */
  const onKeyDown = e => {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (MODIFIER_KEYS.has(e.key)) { if (phase === 'run' && e.key === 'Alt') e.preventDefault(); return; }
    fx.armSounds();
    if (phase === 'ready') {
      if (e.key === 'Escape') { e.preventDefault(); leave(); return; }
      if (!focus && /^[123]$/.test(e.key) && !e.ctrlKey && !e.altKey) { e.preventDefault(); dur = RAPID_DURATIONS[Number(e.key) - 1]; keepLen(dur); renderReady(); return; }
      if (e.target && e.target.tagName === 'BUTTON' && (e.key === ' ')) return;
      e.preventDefault();   // the key that starts the round never lands on the sheet
      startRound();
      return;
    }
    if (phase === 'done') {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'Enter') { e.preventDefault(); drillThese(); }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); again(); }
      else if (e.key === 'Escape') { e.preventDefault(); leave(); }
      return;
    }
    if (phase !== 'run' || !s) return;
    if (hold) { e.preventDefault(); if (e.key === 'Escape') leave(); return; }
    if (e.key === 'Escape' && atRest(s)) { e.preventDefault(); leave(); return; }
    const took = s.key(e);
    if (took || e.ctrlKey || e.altKey || /^F\d+$/.test(e.key)) e.preventDefault();
    if (took) judge();
  };
  const onKeyUp = e => { if (e.key === 'Alt' && phase === 'run') e.preventDefault(); };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp, { capture: true });
  const onResize = () => requestAnimationFrame(placeTarget);
  window.addEventListener('resize', onResize);

  renderReady();
  return {
    destroy() {
      stopTimers();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp, { capture: true });
      window.removeEventListener('resize', onResize);
      tearDownSheet();
      fx.destroy();
      el.remove();
    },
  };
}
