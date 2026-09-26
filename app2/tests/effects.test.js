// The feedback layer's rules (experience pass C, effects): one finish sound per burst by priority,
// everything through one master gain and a compressor, a soft refuse and a click for the clock
// stop, banners that never drop information under reduced motion or Off, the themed reward
// colours, and the Daily card's BOARD cell for guests.
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MOMENT_PRIORITY, MOMENT_WINDOW_MS, BANNER_HOLD_MS, pickMoment, bannerMotion, masterGain, freeSlot, mountEffects, finishSound } from '../ui/effects.js';
import { RARITY_COLOURS, renderPixel, GLYPHS } from '../ui/pixel.js';
import { boardCell, dailyCardHtml } from '../ui/result-card.js';

/* a WebAudio stand-in that records the graph and every note */
function fakeAudio() {
  const log = { notes: [], peaks: [], master: null, comp: null, dest: { name: 'destination' } };
  class Param { constructor(v) { this.value = v; } setValueAtTime() {} exponentialRampToValueAtTime(v) { if (v > 0.001) log.peaks.push(v); } }
  class Node { connect(n) { this.to = n; return n; } }
  class AC {
    constructor() { this.currentTime = 0; this.state = 'running'; this.destination = log.dest; }
    createOscillator() { const o = new Node(); o.type = 'sine'; o.frequency = { value: 0 }; o.start = () => log.notes.push({ f: o.frequency.value, type: o.type, via: o.to }); o.stop = () => {}; return o; }
    createGain() { const g = new Node(); g.gain = new Param(1); if (!log.master) log.master = g; return g; }
    createDynamicsCompressor() { const c = new Node(); for (const k of ['threshold', 'knee', 'ratio', 'attack', 'release']) c[k] = new Param(0); log.comp = c; return c; }
    resume() { return Promise.resolve(); }
    close() {}
  }
  return { AC, log };
}
function withAudio(prefsRec, fn) {
  const { AC, log } = fakeAudio();
  const store = new Map(prefsRec ? [['hk2_prefs', JSON.stringify(prefsRec)]] : []);
  globalThis.window = { AudioContext: AC };
  globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
  mock.timers.enable({ apis: ['setTimeout'] });
  try { return fn(log); } finally { mock.timers.reset(); delete globalThis.window; delete globalThis.localStorage; }
}

test('effects: a burst of finish moments sounds once, the highest priority wins, the earliest on a tie', () => {
  assert.equal(pickMoment([{ kind: 'finish' }, { kind: 'clean' }, { kind: 'pack' }, { kind: 'achievement' }]).kind, 'pack');
  assert.equal(pickMoment([{ kind: 'finish' }, { kind: 'pb' }, { kind: 'tier', arg: 'legendary' }]).kind, 'pb');
  assert.equal(pickMoment([{ kind: 'tier', arg: 'pass' }, { kind: 'tier', arg: 'pro' }]).arg, 'pass');
  assert.equal(pickMoment([{ kind: 'nonsense' }]), null);
  assert.equal(pickMoment([]), null);
  assert.ok(MOMENT_PRIORITY.pb > MOMENT_PRIORITY.tier && MOMENT_PRIORITY.tier > MOMENT_PRIORITY.pack && MOMENT_PRIORITY.pack > MOMENT_PRIORITY.clean && MOMENT_PRIORITY.clean > MOMENT_PRIORITY.finish, 'PB/tier > pack > clean > finish');
  assert.equal(MOMENT_WINDOW_MS, 150);
});

test('effects: banners always show — reduced motion and Subtle fade in place, Off shows them still', () => {
  assert.equal(bannerMotion('full', false), 'slide');
  assert.equal(bannerMotion('full', true), 'fade');
  assert.equal(bannerMotion('subtle', false), 'fade');
  assert.equal(bannerMotion('off', false), 'static');
  assert.equal(bannerMotion('off', true), 'static');
  assert.ok(BANNER_HOLD_MS <= 2600, 'a short hold');
  assert.equal(freeSlot([]), 0);
  assert.equal(freeSlot([0, 1]), 2);
  assert.equal(freeSlot([1, 2]), 0, 'a slot freed at the bottom is reused, never overprinting a visible banner');
  assert.equal(freeSlot(new Map([['a', 0], ['b', 2]]).values()), 1);
});

test('effects: the master gain is ~0.6, halved under Subtle and Off', () => {
  assert.equal(masterGain('full'), 0.6);
  assert.equal(masterGain('subtle'), 0.3);
  assert.equal(masterGain('off'), 0.3);
});

test('effects: a Daily finish (clock stop, finish, PB, achievement) is one click then one rise, all through the master and compressor', () => withAudio(null, log => {
  const fx = mountEffects(); fx.armSounds();
  fx.clockStop(); fx.finish(null); fx.newPB(); fx.achievement({ name: 'On the Range', desc: 'x', rarity: 'common' });
  assert.deepEqual(log.notes.map(n => n.f), [1250], 'only the clock-stop click plays at once');
  assert.equal(log.notes[0].type, 'triangle');
  mock.timers.tick(MOMENT_WINDOW_MS);
  assert.deepEqual(log.notes.map(n => n.f), [1250, 784, 988, 1319], 'then the PB rise alone — no finish chime or achievement chime on top');
  for (const n of log.notes) assert.equal(n.via.to, log.master, 'every note meets the master gain');
  assert.equal(log.master.to, log.comp); assert.equal(log.comp.to, log.dest);
  assert.equal(log.master.gain.value, 0.6);
  // the next queued achievement (1.1 s on) chimes on its own
  mock.timers.tick(1100 + MOMENT_WINDOW_MS);
  fx.destroy();
}));

test('effects: a first challenge pass plays the pack stamp alone; refuse is one soft low tick; Subtle halves the master', () => {
  withAudio(null, log => {
    const fx = mountEffects(); fx.armSounds();
    fx.finish(null); fx.cleanSheet(); fx.packPage(); fx.levelUp(3);
    mock.timers.tick(MOMENT_WINDOW_MS);
    assert.deepEqual(log.notes.map(n => n.f), [784, 988, 1175]);
    log.notes.length = 0; log.peaks.length = 0;
    fx.refuse();
    assert.equal(log.notes.length, 1, 'one note, not a two-tone buzzer');
    assert.ok(log.notes[0].f < 300 && Math.max(...log.peaks) <= 0.05, 'low and soft');
    fx.destroy();
  });
  withAudio({ effects: 'subtle' }, log => {
    const fx = mountEffects(); fx.armSounds(); fx.parTier('pro');
    mock.timers.tick(MOMENT_WINDOW_MS);
    assert.deepEqual(log.notes.map(n => n.f), [660, 880]);
    assert.equal(log.master.gain.value, 0.3);
    fx.destroy();
  });
});

test('effects: finishSound() reaches the live instance; nothing plays unarmed, muted, or after destroy', () => withAudio(null, log => {
  const fx = mountEffects();
  finishSound('pb'); mock.timers.tick(MOMENT_WINDOW_MS);
  assert.equal(log.notes.length, 0, 'not armed yet');
  fx.armSounds(); finishSound('tier', 'legendary'); finishSound('clean'); mock.timers.tick(MOMENT_WINDOW_MS);
  assert.deepEqual(log.notes.map(n => n.f), [660, 880, 1175]);
  fx.setMuted(true); finishSound('pb'); mock.timers.tick(MOMENT_WINDOW_MS);
  assert.equal(log.notes.length, 3, 'muted');
  fx.setMuted(false); fx.destroy(); finishSound('pb'); mock.timers.tick(MOMENT_WINDOW_MS);
  assert.equal(log.notes.length, 3, 'destroyed');
}));

test('effects: achievements queue while busy and none is lost when a run starts mid-drain', () => withAudio(null, log => {
  const fx = mountEffects(); fx.armSounds();
  fx.setBusy(true);
  fx.achievement({ name: 'A' }); fx.achievement({ name: 'B' });
  mock.timers.tick(2000);
  assert.equal(log.notes.length, 0, 'held while the run is live');
  fx.setBusy(false); mock.timers.tick(MOMENT_WINDOW_MS);
  assert.deepEqual(log.notes.map(n => n.f), [880, 1319], 'A chimes');
  fx.setBusy(true); mock.timers.tick(1100 + MOMENT_WINDOW_MS);
  assert.equal(log.notes.length, 2, 'B waits for the run');
  fx.setBusy(false); mock.timers.tick(MOMENT_WINDOW_MS);
  assert.equal(log.notes.length, 4, 'B was kept, not dropped');
  fx.destroy();
}));

test('reward colours: rarities and tiers are theme tokens, --ink and the tokens are defined at :root', () => {
  for (const [k, v] of Object.entries(RARITY_COLOURS)) assert.match(v, /^var\(--rar-/, k);
  const svg = renderPixel(GLYPHS.star);
  assert.ok(svg.includes('var(--ink'), 'outline follows --ink');
  const css = readFileSync(new URL('../ui/app.css', import.meta.url), 'utf8');
  const root = css.slice(css.indexOf(':root{'), css.indexOf('}', css.indexOf(':root{')));
  for (const t of ['--ink', '--tier-pass', '--tier-pro', '--tier-legendary', '--rar-common', '--rar-rare', '--rar-epic', '--rar-legendary']) assert.ok(root.includes(t + ':'), t);
  const site = readFileSync(new URL('../ui/site.css', import.meta.url), 'utf8');
  assert.ok(!/#4a9eda|#a06bd6|#e0913f/i.test(site), 'no fixed reward hues left in site.css');
});

test('Daily card: the BOARD cell says "sign in" for a guest, keeps a given position, and never says "local"', () => {
  assert.ok(boardCell({ pos: null, handle: null }).includes('sign in'));
  assert.equal(boardCell({ pos: 3, of: 41 }), '#3 <i>of 41</i>');
  assert.equal(boardCell({ pos: null, handle: 'wolf' }), '—');
  assert.equal(boardCell({ pos: null, clean: false }), '—');
  const guest = dailyCardHtml({ day: '2026-09-25', title: 'x', secs: 1.6, tier: 'legendary', keys: 66, refKeys: 66, pos: null, of: null, attempts: 1, clean: true, handle: null });
  assert.ok(guest.includes('sign in') && !guest.includes('local'));
});
