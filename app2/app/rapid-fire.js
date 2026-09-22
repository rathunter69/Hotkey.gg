// app2/app/rapid-fire.js — rapid-fire (SITE_SPEC §5): one shortcut at a time on a real sheet,
// against a 30 / 60 / 120 second clock. Every prompt is a chord Chapter 1 taught; a hit grows
// the combo (score ×1 + combo/5, floored), a wrong chord breaks it. Recall is the game, so the
// keys stay hidden until you stall for three seconds. Rounds record as attempts (kind 'rapid');
// they never set PBs — points, not seconds, are the score here.
import { mountSandbox } from './sandbox.js';
import { prefs, keyLabel } from './prefs.js';
import { showToast } from '../ui/toast.js';
import { track } from './telemetry.js';
import { store } from './store.js';
import { attemptId, dayOf } from './records.js';
import { mulberry32 } from '../engine/rng.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The deck: prompts over the chords Chapter 1 teaches. `expect` is the exact key-log labels. */
export const RAPID_DECK = [
  { id: 'bold', text: 'Bold the active cell', keys: 'Ctrl+B', expect: ['Ctrl+B'] },
  { id: 'italic', text: 'Italic', keys: 'Ctrl+I', expect: ['Ctrl+I'] },
  { id: 'underline', text: 'Underline', keys: 'Ctrl+U', expect: ['Ctrl+U'] },
  { id: 'strike', text: 'Strikethrough', keys: 'Ctrl+5', expect: ['Ctrl+5'] },
  { id: 'edge-down', text: 'Jump to the bottom edge of the data', keys: 'Ctrl+↓', expect: ['Ctrl+↓'] },
  { id: 'home', text: 'Snap back to A1', keys: 'Ctrl+Home', expect: ['Ctrl+Home'] },
  { id: 'region', text: 'Select the whole region', keys: 'Ctrl+A', expect: ['Ctrl+A'] },
  { id: 'col', text: 'Select the whole column', keys: 'Ctrl+Space', expect: ['Ctrl+Space'] },
  { id: 'row', text: 'Select the whole row', keys: 'Shift+Space', expect: ['Shift+Space'] },
  { id: 'copy-paste', text: 'Copy the cell, then paste it', keys: 'Ctrl+C Ctrl+V', expect: ['Ctrl+C', 'Ctrl+V'] },
  { id: 'cut-paste', text: 'Cut the cell, then paste it', keys: 'Ctrl+X Ctrl+V', expect: ['Ctrl+X', 'Ctrl+V'] },
  { id: 'fill-down', text: 'Fill down from the cell above', keys: 'Ctrl+D', expect: ['Ctrl+D'] },
  { id: 'fill-right', text: 'Fill right from the cell to the left', keys: 'Ctrl+R', expect: ['Ctrl+R'] },
  { id: 'percent', text: 'Percent format', keys: 'Ctrl+Shift+%', expect: ['Ctrl+Shift+%'] },
  { id: 'currency', text: 'Currency format', keys: 'Ctrl+Shift+$', expect: ['Ctrl+Shift+$'] },
  { id: 'undo-redo', text: 'Undo, then redo', keys: 'Ctrl+Z Ctrl+Y', expect: ['Ctrl+Z', 'Ctrl+Y'] },
];
export const RAPID_DURATIONS = [30, 60, 120];

/** The small sheet a round runs on: data everywhere a prompt needs it. */
export const RAPID_SHEET = {
  A1: { value: 'Rapid fire', bold: true },
  A2: { value: 'North' }, B2: { value: 1200 }, C2: { value: 40 },
  A3: { value: 'South' }, B3: { value: 950 }, C3: { value: 31 },
  A4: { value: 'East' }, B4: { value: 1430 }, C4: { value: 47 },
  A5: { value: 'West' }, B5: { value: 1100 }, C5: { value: 36 },
};

/** Points a hit scores at a combo count (before the hit): 10 × (1 + floor(combo/5)). Pure. */
export const hitPoints = combo => 10 * (1 + Math.floor(combo / 5));

/** A seeded prompt order: the deck shuffled, repeated as needed. Pure. */
export function deckOrder(seed, deck = RAPID_DECK) {
  const rng = mulberry32(seed);
  const order = deck.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return order;
}

export function mountRapidPage(root) {
  const el = document.createElement('div');
  el.className = 'drill-page rapid-page';
  root.appendChild(el);
  let sb = null, phase = 'pick';   // 'pick' | 'run' | 'done'
  let dur = 60, endAt = 0, tickH = null, stallH = null;
  let order = [], oi = 0, progress = 0;
  let hits = 0, misses = 0, combo = 0, bestCombo = 0, points = 0, promptAt = 0;
  const p = prefs.get();

  const kbds = keys => keys.split(' ').map(k => `<kbd>${esc(keyLabel(k, prefs.get().platform))}</kbd>`).join(' ');

  function renderPick() {
    phase = 'pick';
    if (sb) { sb.destroy(); sb = null; }
    if (tickH) { clearInterval(tickH); tickH = null; }
    el.innerHTML = `<div class="page rapid-pick">
      <div class="page-head"><h1>Rapid-fire</h1><p class="page-sub">One shortcut at a time, on a real sheet. Hits build a combo; a wrong chord breaks it. The keys stay hidden until you stall — recall is the game.</p></div>
      <div class="rapid-durs">${RAPID_DURATIONS.map((d, i) => `<button class="btn ${d === 60 ? 'btn-primary' : ''}" data-dur="${d}" type="button">${d >= 60 ? (d / 60) + ' minute' + (d > 60 ? 's' : '') : d + ' seconds'} <kbd>${i + 1}</kbd></button>`).join('')}</div>
      <p class="page-fine">A round records as practice; it never sets a drill PB. <a href="#/practice">Back to Practice</a>.</p>
    </div>`;
    el.querySelectorAll('[data-dur]').forEach(b => { b.onclick = () => startRound(+b.dataset.dur); });
  }

  function startRound(seconds) {
    dur = seconds; phase = 'run';
    hits = 0; misses = 0; combo = 0; bestCombo = 0; points = 0; oi = 0; progress = 0;
    order = deckOrder(Date.now() >>> 0);
    el.innerHTML = `
      <div class="rf-head">
        <div class="rf-instr" id="rfInstr">—</div>
        <div class="rf-keys" id="rfKeys" hidden></div>
        <div class="rf-meta"><span class="rf-clock" id="rfClock">${dur}.0</span><span class="rf-score">score <b id="rfScore">0</b></span><span class="rf-combo" id="rfCombo"></span></div>
      </div>
      <div class="stage drill-stage"><div class="stage-row"><div class="stage-main drill-host" id="rfHost"></div></div></div>
      <div class="bar drill-status"><div class="stat">hits <b id="rfHits">0</b> · misses <b id="rfMiss">0</b> · best combo <b id="rfBest">0</b></div><div class="spacer"></div><button class="btn btn-ghost" id="rfEnd" type="button">End round</button></div>`;
    sb = mountSandbox(el.querySelector('#rfHost'), { cells: { ...RAPID_SHEET }, active: { r: 2, c: 2 }, modeBar: false, ribbonMode: 'slim', onKey: onLabel });
    el.querySelector('#rfEnd').onclick = () => endRound();
    endAt = Date.now() + dur * 1000;
    tickH = setInterval(tick, 100);
    track('rapid_start', { dur });
    nextPrompt();
  }

  const prompt = () => RAPID_DECK[order[oi % order.length]];
  function nextPrompt() {
    oi++; progress = 0; promptAt = Date.now();
    paintPrompt();
  }
  function paintPrompt() {
    const pr = prompt();
    el.querySelector('#rfInstr').textContent = pr.text;
    const keysEl = el.querySelector('#rfKeys');
    keysEl.hidden = true; keysEl.innerHTML = kbds(pr.keys);
    if (stallH) clearTimeout(stallH);
    stallH = setTimeout(() => { if (phase === 'run') keysEl.hidden = false; }, 3000);
  }
  function onLabel(label) {
    if (phase !== 'run') return;
    if (label === 'Alt' || label === 'Esc' || label === '⚠' || label.length === 1) return;   // walks, cancels and typing are not chords
    const pr = prompt();
    if (label === pr.expect[progress]) {
      progress++;
      if (progress >= pr.expect.length) {
        points += hitPoints(combo); combo++; hits++;
        bestCombo = Math.max(bestCombo, combo);
        if (sb) sb.fx.click();
        paintScore();
        nextPrompt();
      }
      return;
    }
    // a wrong chord: the combo breaks, the matcher restarts (the wrong key may start the sequence)
    misses++;
    if (combo > 0 && sb) sb.fx.refuse();
    combo = 0;
    progress = label === pr.expect[0] ? 1 : 0;
    paintScore();
  }
  function paintScore() {
    el.querySelector('#rfScore').textContent = String(points);
    el.querySelector('#rfHits').textContent = String(hits);
    el.querySelector('#rfMiss').textContent = String(misses);
    el.querySelector('#rfBest').textContent = String(bestCombo);
    el.querySelector('#rfCombo').textContent = combo >= 2 ? '×' + (1 + Math.floor(combo / 5)) + ' · combo ' + combo : '';
  }
  function tick() {
    const left = (endAt - Date.now()) / 1000;
    const c = el.querySelector('#rfClock'); if (c) { c.textContent = Math.max(0, left).toFixed(1); c.classList.toggle('low', left < 10); }
    if (left <= 0) endRound();
  }

  function endRound() {
    if (phase !== 'run') return;
    phase = 'done';
    if (tickH) { clearInterval(tickH); tickH = null; }
    if (stallH) { clearTimeout(stallH); stallH = null; }
    const keys = sb ? sb.session.keyLog.length : 0;
    store.addAttempt({ id: attemptId(), kind: 'rapid', ref: 'rapid-' + dur, day: dayOf(), seed: null, secs: dur, keys, clean: false, helped: false, mouse: sb ? sb.session.mouse.count : 0, tier: 'none', splits: [hits, misses, bestCombo, points], trace: [], at: Date.now() });
    track('rapid_complete', { dur, hits, misses, points });
    if (sb) { sb.destroy(); sb = null; }
    const prevBest = Math.max(0, ...store.attempts({ kind: 'rapid' }).slice(0, -1).filter(a => a.ref === 'rapid-' + dur).map(a => (a.splits && a.splits[3]) || 0));
    el.innerHTML = `<div class="page rapid-pick"><div class="rm-card" style="margin:40px auto">
      <div class="rm-title">Round over</div>
      <div class="rm-time">${points}<span>pts</span></div>
      <div class="rm-stats"><div>hits<b>${hits}</b></div><div>misses<b>${misses}</b></div><div>best combo<b>${bestCombo}</b></div><div>round<b>${dur}s</b></div></div>
      ${points > prevBest && prevBest > 0 ? '<div class="rm-note">New best for this round length.</div>' : ''}
      <div class="rm-opts">
        <button class="btn btn-primary" id="rfAgain" type="button">Again <kbd>Enter</kbd></button>
        <button class="btn" id="rfPick" type="button">Change length</button>
        <a class="btn" href="#/practice">Back to Practice</a>
      </div></div></div>`;
    el.querySelector('#rfAgain').onclick = () => startRound(dur);
    el.querySelector('#rfPick').onclick = () => renderPick();
    const b = el.querySelector('#rfAgain'); if (b) b.focus();
  }

  const onKey = e => {
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (t && (t.tagName === 'BUTTON' || t.tagName === 'A') && (e.key === 'Enter' || e.key === ' ')) return;
    if (phase === 'pick' && /^[123]$/.test(e.key)) { e.preventDefault(); startRound(RAPID_DURATIONS[+e.key - 1]); }
    else if (phase === 'done' && e.key === 'Enter') { e.preventDefault(); startRound(dur); }
    else if (phase === 'run' && e.key === 'Escape' && e.shiftKey) { e.preventDefault(); endRound(); }
  };
  document.addEventListener('keydown', onKey);

  renderPick();
  return {
    destroy() {
      document.removeEventListener('keydown', onKey);
      if (tickH) clearInterval(tickH);
      if (stallH) clearTimeout(stallH);
      if (sb) sb.destroy();
      el.remove();
    },
  };
}
