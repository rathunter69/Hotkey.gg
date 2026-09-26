// app2/ui/effects.js — the feedback layer (SITE_SPEC §1, §6a): a small success tick per completed
// goal, a bigger finish on completion, soft synthesized sounds that stay OFF until the learner starts
// (the host calls armSounds() on the first keystroke), and an obvious, remembered mute.
//
//   const fx = mountEffects();               // { goalTick, finish, click, refuse, setMuted, isMuted, mountMuteButton, armSounds, destroy, … }
//   fx.mountMuteButton(modeBarEl);           // "Sound on / Sound off" toggle, aria-pressed, remembered in prefs (one store: app/prefs.js)
//   fx.armSounds();                          // first keystroke: sounds may play from now on
//   fx.goalTick(goalLi);  fx.finish(stageEl);  fx.refuse();  fx.click();
//   fx.finishSound('pb');                    // or the module-level finishSound(kind): one finish sound per burst, by priority
//
// Sounds are WebAudio sines with a 6 ms attack and an exponential decay (the old build's family),
// no asset files, all through one master gain and a compressor so moments landing together never
// sum into a loud cluster. Visual effects run whether or not sound is on. Every storage access is guarded.

import { prefs } from '../app/prefs.js';

/* ---------------- pure rules (unit-tested in tests/effects.test.js) ---------------- */

/** Finish-family sounds, loudest claim first: a burst of moments in one frame plays only the top one. */
export const MOMENT_PRIORITY = { pb: 90, rank: 80, tier: 70, pack: 60, level: 50, clean: 40, achievement: 30, finish: 20 };
/** How long a burst collects moments before its one sound plays (a challenge pass fires several in one frame). */
export const MOMENT_WINDOW_MS = 150;
/** Banner timing: a short hold, then a fade; any key fades every visible banner early (§6a: skippable by any key). */
export const BANNER_HOLD_MS = 2500;
export const BANNER_FADE_MS = 300;

/** The moment that sounds for a burst: the highest priority, the earliest on a tie; null for none. Pure. */
export function pickMoment(items) {
  let best = null;
  for (const it of items || []) {
    const p = it && MOMENT_PRIORITY[it.kind];
    if (p && (!best || p > MOMENT_PRIORITY[best.kind])) best = it;
  }
  return best;
}

/**
 * How a banner moves for a celebration level and the reduced-motion flag. Pure.
 * 'slide' (Full), 'fade' (Subtle, or reduced motion: movement swapped for a fade), 'static' (Off:
 * results only, but the information still shows).
 */
export function bannerMotion(level, reduced) {
  if (level === 'off') return 'static';
  return reduced || level === 'subtle' ? 'fade' : 'slide';
}

/** The master volume for a celebration level: Subtle and Off halve it; silence is the mute's job. Pure. */
export function masterGain(level) { return level === 'subtle' || level === 'off' ? 0.3 : 0.6; }

/** The lowest stack slot not held by a visible banner (banners stack up from the corner). Pure. */
export function freeSlot(used) {
  const taken = new Set(used || []);
  let i = 0; while (taken.has(i)) i++;
  return i;
}

// the mounted instance module-level callers reach (one page mounts one at a time)
let active = null;
/** Play one finish sound by priority ('pb' | 'rank' | 'tier' | 'pack' | 'level' | 'clean' | 'achievement' | 'finish'). */
export function finishSound(kind, arg) { if (active) active.finishSound(kind, arg); }

// The remembered mute lives in the one settings store (prefs.mute), so Settings, the drill bar and
// the lesson panel always agree.
function readMuted() { try { return !!prefs.get().mute; } catch (e) { return false; } }
function writeMuted(v) { try { prefs.set({ mute: !!v }); } catch (e) { /* storage blocked: the session still honours the choice */ } }
function reducedMotion() { try { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

const ICO_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const ICO_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>';

/**
 * @param {object} [opts]  sessionRef: the Session the host runs (kept as `fx.session` for callers
 *                         that want to gate on it; the module itself never reads it)
 */
export function mountEffects(opts = {}) {
  let muted = readMuted();
  let armed = false;
  let ctx = null, master = null;
  const buttons = new Set();
  const timers = new Set();

  function level() { try { return prefs.get().effects || 'full'; } catch (e) { return 'full'; } }
  function audio() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; ctx = AC ? new AC() : null;
      if (ctx) {
        // one master gain into a gentle compressor: every tone meets here, so stacked moments stay soft
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -24; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
        master = ctx.createGain(); master.gain.value = masterGain(level());
        master.connect(comp); comp.connect(ctx.destination);
      }
    } catch (e) { ctx = null; master = null; }
    return ctx;
  }
  /** One soft note: freq Hz, start s after now, dur s, peak gain. Silent unless armed and not muted (`force`: the mute button's own preview). */
  function tone(freq, start, dur, gain, force, type) {
    if ((!armed && !force) || muted) return;
    const ac = audio(); if (!ac) return;
    try {
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      if (master) master.gain.value = masterGain(level());   // a Settings change applies without a remount
      const t0 = ac.currentTime;
      const osc = ac.createOscillator(); const g = ac.createGain();
      osc.type = type || 'sine'; osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0 + start);
      g.gain.exponentialRampToValueAtTime(gain, t0 + start + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
      osc.connect(g); g.connect(master || ac.destination);
      osc.start(t0 + start); osc.stop(t0 + start + dur + 0.02);
    } catch (e) { /* audio is decoration */ }
  }
  function later(fn, ms) { const h = setTimeout(() => { timers.delete(h); fn(); }, ms); timers.add(h); return h; }

  /* ---------------- the finish-family sounds: one per burst, picked by priority ---------------- */
  const SOUNDS = {
    finish: () => { tone(660, 0, 0.12, 0.09); tone(880, 0.11, 0.2, 0.1); },                               // chime (lesson)
    clean: () => { tone(988, 0, 0.08, 0.06); tone(1319, 0.07, 0.14, 0.07); },                             // a bright, rising pair
    achievement: () => { tone(880, 0, 0.09, 0.07); tone(1319, 0.08, 0.16, 0.08); },
    level: () => { tone(523, 0, 0.1, 0.08); tone(659, 0.09, 0.1, 0.08); tone(784, 0.18, 0.18, 0.09); },   // short fanfare
    pack: () => { tone(784, 0, 0.1, 0.08); tone(988, 0.09, 0.1, 0.08); tone(1175, 0.18, 0.2, 0.09); },    // a settling three-note stamp
    tier: tier => { ({ pass: [660], pro: [660, 880], legendary: [660, 880, 1175] }[tier] || [660]).forEach((f, i) => tone(f, i * 0.09, 0.12, 0.08)); },   // escalates with the tier
    rank: () => { tone(659, 0, 0.12, 0.09); tone(988, 0.11, 0.22, 0.1); },
    pb: () => { tone(784, 0, 0.09, 0.08); tone(988, 0.08, 0.09, 0.08); tone(1319, 0.16, 0.16, 0.09); },   // rise
  };
  let burst = null;
  /** Queue a finish-family moment; MOMENT_WINDOW_MS after the first, the burst's top one plays. */
  function moment(kind, arg) {
    if (!MOMENT_PRIORITY[kind]) return;
    if (!burst) {
      burst = [];
      later(() => { const win = pickMoment(burst); burst = null; if (win) SOUNDS[win.kind](win.arg); }, MOMENT_WINDOW_MS);
    }
    burst.push({ kind, arg });
  }

  /** A ✓ pops on the goal element (~300 ms) with a single soft note; under reduced motion it fades in still. */
  function goalTick(el) {
    if (el && el.appendChild && level() !== 'off') {   // Off: the goal row's own done state carries it
      try {
        const still = reducedMotion();
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
        const tick = document.createElement('span'); tick.className = 'fx-tick' + (still ? ' still' : ''); tick.setAttribute('aria-hidden', 'true'); tick.textContent = '✓';
        el.appendChild(tick);
        later(() => tick.classList.add('out'), still ? 900 : 320);
        later(() => tick.remove(), still ? 1200 : 620);
      } catch (e) { /* not laid out */ }
    }
    tone(1046, 0, 0.09, 0.07);
  }
  /** The finish: an accent ring fades out around the stage (~750 ms, opacity and scale only) under a two-note chime. */
  const rings = new Set();
  function finish(stageEl) {
    if (stageEl && stageEl.classList && level() === 'full') {
      try {
        stageEl.classList.remove('fx-finish'); void stageEl.offsetWidth;   // the class stays as a hook; the ring is its own layer
        stageEl.classList.add('fx-finish');
        later(() => stageEl.classList.remove('fx-finish'), 800);
        // a fixed layer over the stage's box: no pseudo-element or position of the stage is borrowed
        const r = stageEl.getBoundingClientRect();
        if (r.width && r.height) {
          const ring = document.createElement('div');
          ring.className = 'fx-ring' + (reducedMotion() ? ' still' : ''); ring.setAttribute('aria-hidden', 'true');
          ring.style.cssText = `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px; border-radius:${getComputedStyle(stageEl).borderRadius || '12px'}`;
          document.body.appendChild(ring); rings.add(ring);
          later(() => { ring.remove(); rings.delete(ring); }, 800);
        }
      } catch (e) { /* not laid out */ }
    }
    moment('finish');
  }
  /** A barely-there tick for a mouse press on a ribbon control. */
  function click() { tone(1800, 0, 0.02, 0.025); }
  /** A refused action: one soft, low tick (§6a: no buzzers). */
  function refuse() { tone(233, 0, 0.06, 0.045); }

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
     sound stays governed by mute (Subtle and Off only quieten it). `busy` queues achievement
     banners while a run is live. A banner always shows: reduced motion and Subtle fade it in
     without moving, Off shows it still — the information is never dropped (§6a). */
  function visualsOn() { return level() !== 'off' && !reducedMotion(); }
  let busy = false;
  const queued = [];
  const live = new Map();   // visible banner → its stack slot
  let skipOn = false;
  // any key fades every visible banner (§6a: celebrations are skippable by any key); it never
  // prevents or stops the key, so the learner's keystroke still lands
  function onSkipKey() { for (const b of [...live.keys()]) dismiss(b); }
  function setSkip(on) {
    if (on === skipOn) return; skipOn = on;
    try { document[on ? 'addEventListener' : 'removeEventListener']('keydown', onSkipKey, true); } catch (e) { /* no DOM */ }
  }
  function dismiss(b) {
    if (!live.has(b)) return;
    live.delete(b);
    b.classList.remove('in');
    later(() => b.remove(), b.classList.contains('fx-static') ? 0 : BANNER_FADE_MS);
    if (!live.size) setSkip(false);
  }
  function banner(html, cls) {
    try {
      const lvl = level(); const motion = bannerMotion(lvl, reducedMotion());
      const b = document.createElement('div');
      b.className = 'fx-banner ' + (cls || '') + (lvl === 'subtle' ? ' subtle' : '') + (motion !== 'slide' ? ' fx-' + motion : '');
      b.setAttribute('role', 'status');
      // the corner lane (SITE_SPEC §6a): banners stack upward from the bottom-left, never over a result card
      const slot = freeSlot(live.values());
      b.style.setProperty('--fx-i', String(slot));
      b.innerHTML = html;
      document.body.appendChild(b);
      live.set(b, slot);
      if (motion === 'static') b.classList.add('in');
      // the key that finished the run is still being dispatched: listen for skips from the next one
      later(() => { if (!live.has(b)) return; b.classList.add('in'); setSkip(true); }, 20);
      later(() => dismiss(b), BANNER_HOLD_MS);
    } catch (e) { /* decoration */ }
  }
  const goalDone = el => goalTick(el);
  const lessonDone = stageEl => finish(stageEl);
  function newShortcut() { tone(1175, 0, 0.08, 0.06); tone(1568, 0.07, 0.1, 0.06); }   // pop (its own moment, not a finish)
  function newPB() { moment('pb'); banner('★ New personal best', 'fx-pb'); }
  function parTier(tier) { moment('tier', tier); }
  function levelUp(lvl) { moment('level'); banner('▲ Level ' + lvl, 'fx-level'); }
  function rankUp(name) { moment('rank'); banner('◆ ' + String(name), 'fx-rank'); }
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
      if (!def || busy) { if (def) queued.unshift(def); draining = false; return; }
      moment('achievement');
      banner('<b>' + String((def && def.name) || 'Achievement') + '</b><span>' + String((def && def.desc) || '') + '</span>', 'fx-ach r-' + ((def && def.rarity) || 'common'));
      later(step, 1100);
    };
    step();
  }
  function achievement(def) { queued.push(def); drainAchievements(); }
  function setBusy(v) { busy = !!v; if (!busy) drainAchievements(); }
  /** A clean sheet (no mouse, no help): a bright, rising pair — quieter than a PB. */
  function cleanSheet() { moment('clean'); }
  /** A pack page filled (a module's challenge passed, the first time): a settling three-note stamp. */
  function packPage() { moment('pack'); }   // the page itself slots into the result card (lesson-view)
  function clockStart() { tone(1046, 0, 0.05, 0.05); }
  /** The clock stops: one short, hard click (the "lock"); the finish sound follows once the burst settles. */
  function clockStop() { tone(1250, 0, 0.03, 0.06, false, 'triangle'); }
  function hit() { tone(1319, 0, 0.05, 0.06); }
  function comboBreak() { tone(220, 0, 0.08, 0.09); tone(165, 0.05, 0.1, 0.07); }

  function destroy() {
    for (const h of timers) clearTimeout(h); timers.clear();
    burst = null; queued.length = 0; draining = false;
    for (const b of buttons) b.remove(); buttons.clear();
    for (const r of rings) r.remove(); rings.clear();
    live.clear(); setSkip(false);
    try { document.querySelectorAll('.fx-banner').forEach(b => b.remove()); } catch (e) { /* no DOM */ }
    if (ctx && ctx.close) { try { ctx.close(); } catch (e) { /* already closed */ } }
    ctx = null; master = null;
    if (active === api) active = null;
  }

  const api = {
    session: opts.sessionRef || null,
    goalTick, finish, click, refuse, setMuted, isMuted, mountMuteButton, armSounds, isArmed: () => armed, destroy,
    goalDone, lessonDone, newShortcut, newPB, parTier, levelUp, rankUp, achievement, setBusy, clockStart, clockStop, hit, comboBreak, visualsOn, cleanSheet, packPage,
    finishSound: moment, moment,
  };
  active = api;
  return api;
}
