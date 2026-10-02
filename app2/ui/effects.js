// app2/ui/effects.js — the feedback layer and the one moments registry (screenplay 3.0 "Motion and
// moments"; M95): every animation is a named moment in MOMENTS with its duration token, the
// Effects setting and reduced motion are respected, banners queue one at a time, and any key
// skips what is playing. Plus the older feedback: a small success tick per completed goal, a
// bigger finish on completion, soft synthesized sounds that stay OFF until the learner starts
// (the host calls armSounds() on the first keystroke), and an obvious, remembered mute.
//
//   fx.play('goal-done', el)         → { done, skip }: the class m-goal-done on el for --d-goal
//   fx.sequence('result', onStep)    → the result's eight steps on the clock of --d-result, any key applies the rest at once
//   fx.plan('combo')                 → { motion:'full'|'fade'|'none', ms, skip, banner } for this learner
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
import { siteCopy } from '../content/copy/apply.js';
import { spriteSvg } from './sprites.js';

/* ---------------- pure rules (unit-tested in tests/effects.test.js) ---------------- */

/** Finish-family sounds, loudest claim first: a burst of moments in one frame plays only the top one. */
export const MOMENT_PRIORITY = { pb: 90, rank: 80, tier: 70, pack: 60, level: 50, clean: 40, achievement: 30, finish: 20 };
/** How long a burst collects moments before its one sound plays (a challenge pass fires several in one frame). */
export const MOMENT_WINDOW_MS = 150;
/** Banner timing (3.0, Menus, help and dialogs): one at a time at the top right, gone after four seconds or any key. */
export const BANNER_HOLD_MS = 4000;
export const BANNER_FADE_MS = 300;

/* ---------------- the moments registry (3.0, Motion and moments; M95) ----------------
   Every animation on the site is a named moment here: what it answers, which duration token in
   tokens.css it runs for (no millisecond appears in the JS), whether it is a banner (queued, one at
   a time) and whether it carries a sequence (the result). momentPlan() turns a name into what to
   do for this learner: the Effects setting ('full' | 'subtle' | 'off') and the computer's
   reduced-motion setting are both respected, and any key skips what is playing. */
export const MOMENTS = {
  'route-bar': { when: 'A page change over 150ms', token: 'd-route', skip: false },
  'open-workbook': { when: 'Entering a lesson, challenge or drill', token: 'd-open' },
  'cursor': { when: 'An arrow key on a site page', token: 'd-cursor', skip: false },
  'menu': { when: 'The account menu, More, Help opens', token: 'd-menu', skip: false },
  'key': { when: 'A key in a taught route', token: 'd-key', skip: false },
  'goal-done': { when: 'A goal lands', token: 'd-goal' },
  'cursor-ping': { when: 'A goal lands, the window comes back, a sheet changes: a ring grows out of the cell cursor', token: 'd-ping', skip: false },
  'marker': { when: 'A timed run: the marker moves with the clock', token: null, skip: false },
  'beat': { when: 'The panel changes beat', token: 'd-beat', skip: false },
  'result': { when: 'A timed run ends', token: 'd-result', sequence: true },
  'rapid-hit': { when: 'A correct chord in rapid-fire', token: 'd-hit' },
  'combo': { when: 'Combo 5, 10, 15, 20', token: 'd-combo' },
  'wrong': { when: 'A wrong chord in rapid-fire', token: 'd-wrong' },
  'quests-done': { when: 'The third daily quest', token: 'd-quests' },
  'streak-day': { when: 'The day’s first practice', token: 'd-streak' },
  'achievement': { when: 'An achievement is earned', token: 'd-banner', banner: true },
  'level-up': { when: 'A level lands outside a result', token: 'd-banner', banner: true },
  'new-best': { when: 'A personal best outside a result', token: 'd-banner', banner: true },
  'note': { when: 'A goal with a tip', token: 'd-note', skip: false },
  'saving': { when: 'A write to the account', token: null, skip: false },
  'unlocked': { when: 'Checkout unlocks the course (#/checkout/done)', token: 'd-unlock' },
};
export const MOMENT_NAMES = Object.keys(MOMENTS);
/** The result sequence (3.0's table), each step's start and end in ms from the moment the run ends. */
export const RESULT_STEPS = [
  { step: 'time', at: 0, until: 900 },
  { step: 'marks', at: 1000, until: 1300 },
  { step: 'best', at: 1450, until: 1450 },
  { step: 'marker', at: 1500, until: 2300 },
  { step: 'place', at: 1900, until: 2800 },
  { step: 'xp', at: 2300, until: 3100 },
  { step: 'level', at: 3200, until: 3200 },
  { step: 'quest', at: 3900, until: 3900 },
];

/** '250ms' → 250, '4s' → 4000, '' → 0. Pure. */
export function parseMs(v) {
  const m = String(v == null ? '' : v).trim().match(/^(-?[\d.]+)\s*(ms|s)?$/i);
  if (!m) return 0;
  const n = parseFloat(m[1]); if (!Number.isFinite(n)) return 0;
  return Math.round((m[2] || 'ms').toLowerCase() === 's' ? n * 1000 : n);
}
/** The duration tokens as numbers, read from the computed style of <html> (tokens.css is the only place a duration lives). */
export function readDurations(doc = typeof document !== 'undefined' ? document : null) {
  const out = {};
  try {
    if (!doc || !doc.documentElement || typeof getComputedStyle !== 'function') return out;
    const cs = getComputedStyle(doc.documentElement);
    for (const name of MOMENT_NAMES) { const t = MOMENTS[name].token; if (t && out[t] == null) out[t] = parseMs(cs.getPropertyValue('--' + t)); }
  } catch (e) { /* no DOM */ }
  return out;
}
/**
 * What a moment does for this learner. Pure.
 *   effects 'off' or an unknown name → motion 'none', 0ms: the state is applied at once, nothing moves
 *   reduced motion, or effects 'subtle' → motion 'fade': opacity only, at the moment's duration (a banner keeps its hold)
 *   otherwise → motion 'full' at the moment's duration
 * `skip` says whether any key may end it early (a banner, a sequence, a celebration: yes; a cursor slide or a menu: no).
 */
export function momentPlan(name, { effects = 'full', reduced = false, durations = {} } = {}) {
  const def = MOMENTS[name];
  if (!def) return { name, motion: 'none', ms: 0, skip: false, banner: false };
  const ms = def.token ? (Number(durations[def.token]) || 0) : 0;
  const skip = def.skip !== false;
  if (effects === 'off') return { name, motion: 'none', ms: def.banner ? ms : 0, skip, banner: !!def.banner };
  if (reduced || effects === 'subtle') return { name, motion: 'fade', ms, skip, banner: !!def.banner };
  return { name, motion: 'full', ms, skip, banner: !!def.banner };
}
/** The steps of a sequence that are still to come at `elapsed` ms, so a skip can apply them all at once. Pure. */
export function stepsAfter(steps, elapsed) { return (steps || []).filter(s => s.at > elapsed); }

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
      b.title = muted ? siteCopy('fx_sound_off_title', 'Sound is off. Click to turn it on.') : siteCopy('fx_sound_on_title', 'Sound is on. Click to mute.');
      b.innerHTML = (muted ? ICO_OFF : ICO_ON) + '<span class="fx-mute-lbl">' + (muted ? siteCopy('fx_sound_off', 'Sound off') : siteCopy('fx_sound_on', 'Sound on')) + '</span>';
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
  const live = new Map();   // the visible banner → its slot (always 0: banners come one at a time, 3.0)
  const waiting = [];       // banners that wait for the visible one to go
  let skipOn = false;
  const playing = new Set();   // the moments and sequences playing now: any key skips them
  // any key ends what is playing (3.0: any key skips a moment); it never prevents or stops the
  // key, so the learner's keystroke still lands
  function onSkipKey() { for (const b of [...live.keys()]) dismiss(b); for (const p of [...playing]) p.skip(); }
  function setSkip(on) {
    if (on === skipOn) return; skipOn = on;
    try { document[on ? 'addEventListener' : 'removeEventListener']('keydown', onSkipKey, true); } catch (e) { /* no DOM */ }
  }
  function syncSkip() { setSkip(live.size > 0 || playing.size > 0); }
  function dismiss(b) {
    if (!live.has(b)) return;
    live.delete(b);
    b.classList.remove('in');
    later(() => b.remove(), b.classList.contains('fx-static') ? 0 : BANNER_FADE_MS);
    syncSkip();
    const next = waiting.shift(); if (next) later(next, BANNER_FADE_MS);
  }
  /** One banner at the top right; a second waits until the first has gone (3.0: banners come one at a time). */
  function banner(html, cls) {
    const show = () => {
      try {
        const lvl = level(); const motion = bannerMotion(lvl, reducedMotion());
        const b = document.createElement('div');
        b.className = 'fx-banner ' + (cls || '') + (lvl === 'subtle' ? ' subtle' : '') + (motion !== 'slide' ? ' fx-' + motion : '');
        b.setAttribute('role', 'status');
        b.style.setProperty('--fx-i', '0');
        b.innerHTML = html;
        document.body.appendChild(b);
        live.set(b, 0);
        if (motion === 'static') b.classList.add('in');
        // the key that finished the run is still being dispatched: listen for skips from the next one
        later(() => { if (!live.has(b)) return; b.classList.add('in'); syncSkip(); }, 20);
        later(() => dismiss(b), durationOf('d-banner', BANNER_HOLD_MS));
      } catch (e) { /* decoration */ }
    };
    if (live.size) waiting.push(show); else show();
  }
  /* ---------------- the registry at work: play a named moment on an element, or run a sequence ---------------- */
  let durations = null;
  function durationOf(token, fallback) { if (!durations) durations = readDurations(); const v = durations[token]; return Number.isFinite(v) && v > 0 ? v : fallback; }
  function plan(name) { if (!durations) durations = readDurations(); return momentPlan(name, { effects: level(), reduced: reducedMotion(), durations }); }
  /**
   * Play a moment on `el`: the class m-<name> (and m-fade under reduced motion or Subtle) goes on
   * for the moment's duration, then comes off. Resolves when it ends or is skipped; under Off it
   * resolves at once with nothing moving. Returns { done: Promise, skip() }.
   */
  function play(name, el) {
    const p = plan(name);
    let finish = null; let h = null;
    const done = new Promise(res => { finish = res; });
    const end = () => { if (h) { clearTimeout(h); timers.delete(h); h = null; } if (el && el.classList) { el.classList.remove('m-' + name, 'm-fade'); } playing.delete(handle); syncSkip(); finish(p); };
    const handle = { name, plan: p, skip: () => { if (p.skip) end(); } };
    if (p.motion === 'none' || !p.ms || !el || !el.classList) { later(end, 0); return { done, skip: handle.skip }; }
    try { el.classList.remove('m-' + name); void el.offsetWidth; el.classList.add('m-' + name); if (p.motion === 'fade') el.classList.add('m-fade'); } catch (e) { /* not laid out */ }
    playing.add(handle); syncSkip();
    h = later(end, p.ms);
    return { done, skip: handle.skip };
  }
  /**
   * Run a sequence (the result): `onStep(step)` is called at each step's start; any key applies
   * every remaining step at once. Under Off every step is applied immediately. Resolves when the
   * last step has started.
   */
  function sequence(name, onStep, steps = RESULT_STEPS) {
    const p = plan(name);
    let finish = null; const hs = new Set(); let ended = false;
    const applied = new Set();
    const done = new Promise(res => { finish = res; });
    const apply = s => { if (applied.has(s)) return; applied.add(s); try { onStep(s); } catch (e) { /* a host hook */ } };
    const end = () => {
      if (ended) return; ended = true;
      for (const h of hs) { clearTimeout(h); timers.delete(h); } hs.clear();
      for (const s of steps) apply(s);   // whatever has not landed yet lands now, in order
      playing.delete(handle); syncSkip(); finish(p);
    };
    const handle = { name, plan: p, skip: end };
    if (p.motion === 'none') { for (const s of steps) apply(s); later(() => { ended = true; finish(p); }, 0); return { done, skip: () => {} }; }
    playing.add(handle); syncSkip();
    // every step is scaled to the moment's duration, so a shorter --d-result squeezes the whole run
    const total = steps.reduce((m, s) => Math.max(m, s.until || s.at), 0) || 1;
    const scale = p.ms ? p.ms / total : 1;
    for (const s of steps) hs.add(later(() => { if (!ended) apply(s); }, Math.round(s.at * scale)));
    hs.add(later(end, Math.round(total * scale) + 1));
    return { done, skip: end };
  }
  const goalDone = el => goalTick(el);
  const lessonDone = stageEl => finish(stageEl);
  function newShortcut() { tone(1175, 0, 0.08, 0.06); tone(1568, 0.07, 0.1, 0.06); }   // pop (its own moment, not a finish)
  function newPB() { moment('pb'); banner(siteCopy('fx_new_pb', 'New personal best'), 'fx-pb'); }
  function parTier(tier) { moment('tier', tier); }
  function levelUp(lvl) { moment('level'); banner(siteCopy('fx_level', 'Level {n}').replace('{n}', String(lvl)), 'fx-level'); }
  function rankUp(name) { moment('rank'); banner(String(name), 'fx-rank'); }
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
      const art = def && def.art ? spriteSvg(def.art, { size: 48, cls: 'fx-ach-art' }) : '';
      banner(art + '<span class="fx-ach-words"><b>' + String((def && def.name) || siteCopy('ach_banner', 'Achievement')) + '</b><span>' + String((def && def.desc) || '') + '</span><i class="fx-ach-rar">' + siteCopy('rarity_' + ((def && def.rarity) || 'common'), '') + '</i></span>', 'fx-ach r-' + ((def && def.rarity) || 'common'));
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
    live.clear(); waiting.length = 0; for (const p of playing) p.skip(); playing.clear(); setSkip(false);
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
    play, sequence, plan, banner: (html, cls) => banner(html, cls),
  };
  active = api;
  return api;
}
