// app2/ui/effects.js — the feedback layer (SITE_SPEC §1): a small success tick per completed goal,
// a bigger finish on completion, soft synthesized sounds that stay OFF until the learner starts
// (the host calls armSounds() on the first keystroke), and an obvious, remembered mute.
//
//   const fx = mountEffects();               // { goalTick, finish, click, refuse, setMuted, isMuted, mountMuteButton, armSounds, destroy }
//   fx.mountMuteButton(modeBarEl);           // "Sound on / Sound off" toggle, aria-pressed, remembered in prefs (one store: app/prefs.js)
//   fx.armSounds();                          // first keystroke: sounds may play from now on
//   fx.goalTick(goalLi);  fx.finish(stageEl);  fx.refuse();  fx.click();
//
// Sounds are WebAudio sines with a 6 ms attack and an exponential decay (the old build's family),
// no asset files. Visual effects run whether or not sound is on. Every storage access is guarded.

import { prefs } from '../app/prefs.js';

// The remembered mute lives in the one settings store (prefs.mute), so Settings, the drill bar and
// the lesson panel always agree.
function readMuted() { try { return !!prefs.get().mute; } catch (e) { return false; } }
function writeMuted(v) { try { prefs.set({ mute: !!v }); } catch (e) { /* storage blocked: the session still honours the choice */ } }

const ICO_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const ICO_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>';

/**
 * @param {object} [opts]  sessionRef: the Session the host runs (kept as `fx.session` for callers
 *                         that want to gate on it; the module itself never reads it)
 */
export function mountEffects(opts = {}) {
  let muted = readMuted();
  let armed = false;
  let ctx = null;
  const buttons = new Set();
  const timers = new Set();

  function audio() {
    if (ctx) return ctx;
    try { const AC = window.AudioContext || window.webkitAudioContext; ctx = AC ? new AC() : null; } catch (e) { ctx = null; }
    return ctx;
  }
  /** One soft sine: freq Hz, start s after now, dur s, peak gain. Silent unless armed and not muted (`force`: the mute button's own preview). */
  function tone(freq, start, dur, gain, force) {
    if ((!armed && !force) || muted) return;
    const ac = audio(); if (!ac) return;
    try {
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      const t0 = ac.currentTime;
      const osc = ac.createOscillator(); const g = ac.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0 + start);
      g.gain.exponentialRampToValueAtTime(gain, t0 + start + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
      osc.connect(g).connect(ac.destination);
      osc.start(t0 + start); osc.stop(t0 + start + dur + 0.02);
    } catch (e) { /* audio is decoration */ }
  }
  function later(fn, ms) { const h = setTimeout(() => { timers.delete(h); fn(); }, ms); timers.add(h); return h; }

  /** A green ✓ pops on the goal element (~300 ms) with a single soft note. */
  function goalTick(el) {
    if (el && el.appendChild && visualsOn()) {
      try {
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
        const tick = document.createElement('span'); tick.className = 'fx-tick'; tick.setAttribute('aria-hidden', 'true'); tick.textContent = '✓';
        el.appendChild(tick);
        later(() => tick.classList.add('out'), 320);
        later(() => tick.remove(), 620);
      } catch (e) { /* not laid out */ }
    }
    tone(1046, 0, 0.09, 0.07);
  }
  /** The finish: an accent ring pulses out from the stage (~700 ms) under a two-note chime. */
  function finish(stageEl) {
    if (stageEl && stageEl.classList && visualsOn() && level() === 'full') {
      stageEl.classList.remove('fx-finish'); void stageEl.offsetWidth;   // restart the animation on a repeat
      stageEl.classList.add('fx-finish');
      later(() => stageEl.classList.remove('fx-finish'), 800);
    }
    tone(660, 0, 0.12, 0.09);
    tone(880, 0.11, 0.2, 0.1);
  }
  /** A barely-there tick for a mouse press on a ribbon control. */
  function click() { tone(1800, 0, 0.02, 0.025); }
  /** A refused action: low and short. */
  function refuse() { tone(196, 0, 0.09, 0.11); tone(147, 0.04, 0.11, 0.08); }

  function paintButtons() {
    for (const b of buttons) {
      b.setAttribute('aria-pressed', muted ? 'false' : 'true');
      b.classList.toggle('on', !muted);
      b.title = muted ? 'Sound is off — click to turn it on' : 'Sound is on — click to mute';
      b.innerHTML = (muted ? ICO_OFF : ICO_ON) + '<span class="fx-mute-lbl">' + (muted ? 'Sound off' : 'Sound on') + '</span>';
    }
  }
  function setMuted(v) { muted = !!v; writeMuted(muted); paintButtons(); return muted; }
  function isMuted() { return muted; }
  /** Sounds may play from now on (the host calls this on the learner's first keystroke). */
  function armSounds() { armed = true; }
  /** An obvious, keyboard-reachable Sound on / Sound off toggle (aria-pressed = sound on). */
  function mountMuteButton(hostEl) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mb-tool fx-mute';
    b.addEventListener('click', () => { setMuted(!muted); if (!muted) tone(1046, 0, 0.09, 0.07, true); });   // a preview of the state just picked; arming stays the host's call
    buttons.add(b); paintButtons();
    if (hostEl) hostEl.appendChild(b);
    return b;
  }
  /* ---------------- named moments (Phase D): every celebration in one vocabulary ----------------
     Visual intensity follows prefs.effects ('full' | 'subtle' | 'off') and prefers-reduced-motion;
     sound stays governed by mute alone. `busy` queues achievement banners while a run is live. */
  function level() { try { return prefs.get().effects || 'full'; } catch (e) { return 'full'; } }
  function visualsOn() {
    if (level() === 'off') return false;
    try { if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return false; } catch (e) { /* no DOM */ }
    return true;
  }
  let busy = false;
  const queued = [];
  function banner(html, cls) {
    if (!visualsOn()) return;
    try {
      const b = document.createElement('div');
      b.className = 'fx-banner ' + (cls || '') + (level() === 'subtle' ? ' subtle' : '');
      b.setAttribute('role', 'status');
      // the corner lane (SITE_SPEC §6a): banners stack upward from the bottom-left, never over a result card
      b.style.setProperty('--fx-i', String(document.querySelectorAll('.fx-banner').length));
      b.innerHTML = html;
      document.body.appendChild(b);
      later(() => b.classList.add('in'), 20);
      later(() => b.classList.remove('in'), 3400);
      later(() => b.remove(), 3900);
    } catch (e) { /* decoration */ }
  }
  const goalDone = el => goalTick(el);
  const lessonDone = stageEl => finish(stageEl);
  function newShortcut() { tone(1175, 0, 0.08, 0.06); tone(1568, 0.07, 0.1, 0.06); }
  function newPB() { tone(784, 0, 0.09, 0.08); tone(988, 0.08, 0.09, 0.08); tone(1319, 0.16, 0.16, 0.09); banner('★ New personal best', 'fx-pb'); }
  function parTier(tier) {
    const notes = { pass: [660], pro: [660, 880], legendary: [660, 880, 1175] }[tier] || [];
    notes.forEach((f, i) => tone(f, i * 0.09, 0.12, 0.08));
  }
  function levelUp(lvl) { tone(523, 0, 0.1, 0.08); tone(659, 0.09, 0.1, 0.08); tone(784, 0.18, 0.18, 0.09); banner('▲ Level ' + lvl, 'fx-level'); }
  function rankUp(name) { tone(659, 0, 0.12, 0.09); tone(988, 0.11, 0.22, 0.1); banner('◆ ' + String(name), 'fx-rank'); }
  /**
   * An achievement landed. Banners always show one at a time (a legendary first run can earn
   * half a dozen at once); while a run is live (setBusy(true)) they hold until it rests.
   */
  let draining = false;
  function drainAchievements() {
    if (draining || busy) return;
    draining = true;
    const step = () => {
      const def = queued.shift();
      if (!def || busy) { draining = false; return; }
      tone(880, 0, 0.09, 0.07); tone(1319, 0.08, 0.16, 0.08);
      banner('<b>' + String((def && def.name) || 'Achievement') + '</b><span>' + String((def && def.desc) || '') + '</span>', 'fx-ach r-' + ((def && def.rarity) || 'common'));
      later(step, 1100);
    };
    step();
  }
  function achievement(def) { queued.push(def); drainAchievements(); }
  function setBusy(v) { busy = !!v; if (!busy) drainAchievements(); }
  /** A clean sheet (no mouse, no help): a bright, rising pair — quieter than a PB. */
  function cleanSheet() { tone(988, 0, 0.08, 0.06); tone(1319, 0.07, 0.14, 0.07); }
  /** A pack page filled (a module's challenge passed, the first time): a settling three-note stamp. */
  function packPage() { tone(784, 0, 0.1, 0.08); tone(988, 0.09, 0.1, 0.08); tone(1175, 0.18, 0.2, 0.09); }   // the page itself slots into the result card (lesson-view)
  function clockStart() { tone(1046, 0, 0.05, 0.05); }
  function clockStop() { tone(1046, 0, 0.06, 0.06); tone(1568, 0.06, 0.1, 0.06); }
  function hit() { tone(1319, 0, 0.05, 0.06); }
  function comboBreak() { tone(220, 0, 0.08, 0.09); tone(165, 0.05, 0.1, 0.07); }

  function destroy() {
    for (const h of timers) clearTimeout(h); timers.clear();
    for (const b of buttons) b.remove(); buttons.clear();
    try { document.querySelectorAll('.fx-banner').forEach(b => b.remove()); } catch (e) { /* no DOM */ }
    if (ctx && ctx.close) { try { ctx.close(); } catch (e) { /* already closed */ } }
    ctx = null;
  }

  return {
    session: opts.sessionRef || null,
    goalTick, finish, click, refuse, setMuted, isMuted, mountMuteButton, armSounds, isArmed: () => armed, destroy,
    goalDone, lessonDone, newShortcut, newPB, parTier, levelUp, rankUp, achievement, setBusy, clockStart, clockStop, hit, comboBreak, visualsOn, cleanSheet, packPage,
  };
}
