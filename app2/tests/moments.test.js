// The moments registry (screenplay 3.0, Motion and moments; M95): every moment of the table is a
// named entry with its duration token, the plan respects the Effects setting and reduced motion,
// banners come one at a time, a sequence is skippable and under Off applies every step at once.
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MOMENTS, MOMENT_NAMES, RESULT_STEPS, BANNER_HOLD_MS, parseMs, momentPlan, stepsAfter, readDurations, mountEffects } from '../ui/effects.js';

function withDom(prefsRec, doc, fn) {
  const store = new Map(prefsRec ? [['hk2_prefs', JSON.stringify(prefsRec)]] : []);
  globalThis.window = {};
  globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
  globalThis.document = doc;
  mock.timers.enable({ apis: ['setTimeout'] });
  try { return fn(); } finally { mock.timers.reset(); delete globalThis.window; delete globalThis.localStorage; delete globalThis.document; }
}
const fakeEl = () => ({ classes: new Set(), classList: { add(...c) { c.forEach(x => this.classes.add(x)); }, remove(...c) { c.forEach(x => this.classes.delete(x)); }, contains(c) { return this.classes.has(c); } }, style: { setProperty() {} }, setAttribute() {}, remove() { this.gone = true; }, innerHTML: '', offsetWidth: 1 });
const docWith = kids => ({ documentElement: null, body: { appendChild: el => kids.push(el) }, createElement: () => { const el = fakeEl(); el.classList.classes = el.classes; return el; }, addEventListener() {}, removeEventListener() {}, querySelectorAll: () => [] });

test('moments: every moment of 3.0\'s table is in the registry, with its duration as a tokens.css token', () => {
  for (const n of ['route-bar', 'open-workbook', 'cursor', 'menu', 'key', 'goal-done', 'marker', 'beat', 'result', 'rapid-hit', 'combo', 'wrong', 'quests-done', 'streak-day', 'achievement', 'note', 'saving']) assert.ok(MOMENTS[n], n);
  const css = readFileSync(new URL('../ui/tokens.css', import.meta.url), 'utf8');
  for (const n of MOMENT_NAMES) { const t = MOMENTS[n].token; if (t) assert.ok(css.includes('--' + t + ':'), `${n}: --${t} is in tokens.css`); assert.ok(MOMENTS[n].when, n + ' says when'); }
  assert.deepEqual(RESULT_STEPS.map(s => s.step), ['time', 'marks', 'best', 'marker', 'place', 'xp', 'level', 'quest']);
  for (let i = 1; i < RESULT_STEPS.length; i++) assert.ok(RESULT_STEPS[i].at > RESULT_STEPS[i - 1].at);
  assert.ok(RESULT_STEPS[RESULT_STEPS.length - 1].at <= 4000, 'about four seconds');
  assert.equal(BANNER_HOLD_MS, 4000, 'a banner goes after four seconds or any key');
  assert.equal(parseMs('250ms'), 250); assert.equal(parseMs('4s'), 4000); assert.equal(parseMs(' 1.5s '), 1500); assert.equal(parseMs(''), 0); assert.equal(parseMs('abc'), 0);
  assert.deepEqual(readDurations(null), {}, 'no DOM: no durations, nothing throws');
});

test('moments: the plan respects the Effects setting and reduced motion, and says what any key may skip', () => {
  const d = { 'd-goal': 250, 'd-banner': 4000, 'd-cursor': 80, 'd-result': 4000 };
  assert.deepEqual(momentPlan('goal-done', { effects: 'full', reduced: false, durations: d }), { name: 'goal-done', motion: 'full', ms: 250, skip: true, banner: false });
  assert.equal(momentPlan('goal-done', { effects: 'full', reduced: true, durations: d }).motion, 'fade', 'reduced motion: opacity only');
  assert.equal(momentPlan('goal-done', { effects: 'subtle', durations: d }).motion, 'fade');
  const off = momentPlan('goal-done', { effects: 'off', durations: d });
  assert.equal(off.motion, 'none'); assert.equal(off.ms, 0, 'Off: the state is applied at once');
  const offBanner = momentPlan('achievement', { effects: 'off', durations: d });
  assert.equal(offBanner.motion, 'none'); assert.equal(offBanner.ms, 4000, 'a banner still holds under Off: the information is never dropped');
  assert.equal(momentPlan('cursor', { durations: d }).skip, false, 'a cursor slide is not skippable');
  assert.equal(momentPlan('result', { durations: d }).skip, true);
  assert.equal(momentPlan('nonsense', { durations: d }).motion, 'none');
  assert.equal(momentPlan('marker', { durations: d }).ms, 0, 'the marker runs with the clock, not a duration');
  assert.deepEqual(stepsAfter(RESULT_STEPS, 1450).map(s => s.step), ['marker', 'place', 'xp', 'level', 'quest']);
  assert.deepEqual(stepsAfter(RESULT_STEPS, 5000), []);
});

test('moments: banners come one at a time, the second waits for the first to go', () => {
  const kids = [];
  withDom(null, docWith(kids), () => {
    const fx = mountEffects();
    fx.banner('<b>one</b>'); fx.banner('<b>two</b>');
    assert.equal(kids.length, 1, 'the second banner waits');
    mock.timers.tick(BANNER_HOLD_MS); mock.timers.tick(300); mock.timers.tick(50);
    assert.equal(kids.length, 2, 'the second shows once the first has gone');
    assert.ok(kids[0].gone, 'the first was removed');
    fx.destroy();
  });
});

test('moments: a sequence under Off applies every step at once; a skip applies the rest; play() puts the class on for the duration', () => {
  withDom({ effects: 'off' }, docWith([]), () => {
    const fx = mountEffects(); const seen = [];
    fx.sequence('result', s => seen.push(s.step));
    assert.deepEqual(seen, RESULT_STEPS.map(s => s.step), 'Off: every step at once, nothing waits');
    fx.destroy();
  });
  withDom(null, docWith([]), () => {
    const fx = mountEffects(); const seen = [];
    const seq = fx.sequence('result', s => seen.push(s.step));   // no tokens readable: the table's own clock
    mock.timers.tick(1);
    assert.deepEqual(seen, ['time']);
    mock.timers.tick(1500);
    assert.deepEqual(seen, ['time', 'marks', 'best', 'marker']);
    seq.skip();
    assert.deepEqual(seen, RESULT_STEPS.map(s => s.step), 'a skip applies the remaining steps at once');
    const el = fakeEl(); el.classList.classes = el.classes;
    fx.play('goal-done', el);
    assert.ok(!el.classes.has('m-goal-done'), 'no duration readable (no tokens): nothing is held on the element');
    fx.destroy();
  });
});
