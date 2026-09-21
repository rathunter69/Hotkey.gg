// app2/ui/effects.js — the feedback layer (SITE_SPEC §1): a small success tick per completed goal,
// a bigger finish on completion, soft synthesized sounds that stay OFF until the learner starts
// (the host calls armSounds() on the first keystroke), and an obvious, remembered mute.
//
//   const fx = mountEffects();               // { goalTick, finish, click, refuse, setMuted, isMuted, mountMuteButton, armSounds, destroy }
//   fx.mountMuteButton(modeBarEl);           // "Sound on / Sound off" toggle, aria-pressed, remembered in localStorage 'hk2_mute'
//   fx.armSounds();                          // first keystroke: sounds may play from now on
//   fx.goalTick(goalLi);  fx.finish(stageEl);  fx.refuse();  fx.click();
//
// Sounds are WebAudio sines with a 6 ms attack and an exponential decay (the old build's family),
// no asset files. Visual effects run whether or not sound is on. Every storage access is guarded.

const MUTE_KEY = 'hk2_mute';

function readMuted() { try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { return false; } }
function writeMuted(v) { try { localStorage.setItem(MUTE_KEY, v ? '1' : '0'); } catch (e) { /* storage blocked: the session still honours the choice */ } }

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
    if (el && el.appendChild) {
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
    if (stageEl && stageEl.classList) {
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
  function destroy() {
    for (const h of timers) clearTimeout(h); timers.clear();
    for (const b of buttons) b.remove(); buttons.clear();
    if (ctx && ctx.close) { try { ctx.close(); } catch (e) { /* already closed */ } }
    ctx = null;
  }

  return { session: opts.sessionRef || null, goalTick, finish, click, refuse, setMuted, isMuted, mountMuteButton, armSounds, isArmed: () => armed, destroy };
}
