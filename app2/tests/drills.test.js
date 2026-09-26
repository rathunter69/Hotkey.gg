// app2/tests/drills.test.js — the drill catalogue holds its contract (Phase D):
// every drill validates, its solution replays to a finish inside the optimal keystroke count,
// each checkpoint's keys hint replays chained, pars are honest, and a Daily seed never breaks
// the checks. parsFrom's arithmetic is pinned too.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DRILLS, DRILLS_BY_ID, drillById, BENCHMARKS, DAILY_POOL } from '../content/drills.js';
import { validateDrill } from '../content/schema.js';
import { parsFrom, tierFor, tierAtLeast } from '../app/pars.js';
import { LessonRun } from '../app/runner.js';

/** A deterministic rng for seed tests (mulberry32; the Daily uses the same in engine/rng.js). */
function rng32(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** A keys hint as a replayable script (glyphs → key names, ×N expanded, connectives dropped). */
function hintScript(hint) {
  const out = [];
  for (const t of hint.match(/"[^"]*"|\S+/g) || []) {
    if (/^(then|…|,|and|or)$/.test(t)) continue;
    const m = /^×(\d+)$/.exec(t);
    if (m) { const last = out[out.length - 1]; for (let i = 1; i < +m[1]; i++) out.push(last); continue; }
    out.push(t.startsWith('"') ? t : t.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/⌫/g, 'Backspace').replace(/↵/g, 'Enter'));
  }
  return out.join(' ');
}

test('the catalogue: ids unique, lookups work, benchmarks and the Daily pool are real drills', () => {
  assert.ok(DRILLS.length >= 6, 'at least the six Foundations drills');
  const ids = DRILLS.map(d => d.id);
  assert.equal(new Set(ids).size, ids.length, 'ids unique');
  for (const d of DRILLS) assert.equal(DRILLS_BY_ID[d.id], d);
  assert.equal(drillById('nope'), null);
  assert.ok(BENCHMARKS.length >= 1 && BENCHMARKS.every(d => d.benchmark === true), 'benchmarks flagged');
  assert.ok(DAILY_POOL.length >= 4 && DAILY_POOL.every(id => DRILLS_BY_ID[id]), 'daily pool names real drills');
});

test('every drill validates', () => {
  for (const d of DRILLS.filter(x => x.kind !== 'challenge')) assert.deepEqual(validateDrill(d), [], d.id);
  // the module challenges ride the catalogue as thin records over their (validated) lessons
  const ch = DRILLS.filter(x => x.kind === 'challenge');
  assert.equal(ch.length, 9, 'the seven Chapter 1 module challenges and the two Chapter 2 ones are registered');
  for (const d of ch) { assert.ok(d.lesson && d.lesson.kind === 'challenge' && d.pars && d.pars.pass > d.pars.legendary, d.id); assert.equal(d.access, d.chapter === 'foundations' ? 'free' : 'paid', d.id); }
  assert.deepEqual(ch.filter(d => d.benchmark).map(d => d.id), ['challenge-to-standard-in-three-minutes', 'challenge-the-site-pnl'], 'two challenges are benchmarks');
  assert.ok(ch.filter(d => d.access === 'free').every(d => DAILY_POOL.includes(d.id)), 'the Daily pool picks the free challenges up');
  assert.ok(ch.filter(d => d.access === 'paid').every(d => !DAILY_POOL.includes(d.id)), 'the Daily never draws a paid challenge');
});

test('validateDrill rejects the broken shapes', () => {
  const good = DRILLS.find(d => d.kind !== 'challenge');
  assert.ok(validateDrill({ ...good, pars: { pass: 10, pro: 10, legendary: 5 } }).some(e => /strictly/.test(e)), 'flat pars');
  assert.ok(validateDrill({ ...good, optimalKeys: 0 }).some(e => /optimalKeys/.test(e)), 'zero optimal');
  assert.ok(validateDrill({ ...good, goals: good.goals.map(g => ({ ...g, teach: 'no.' })) }).some(e => /no teach/.test(e)), 'teach refused');
  assert.ok(validateDrill({ ...good, task: 'Two sentences. Here.' }).some(e => /one sentence/.test(e)), 'task length');
});

test('every solution replays to a finish inside the optimal keystroke count; pars are hittable', () => {
  for (const d of DRILLS.filter(x => x.kind !== 'challenge')) {
    const run = new LessonRun(d, { mode: 'timed' });
    run.run(d.solution);
    assert.ok(run.finished, `${d.id}: solution finishes the drill`);
    assert.ok(run.session.keyLog.length <= d.optimalKeys, `${d.id}: replay used ${run.session.keyLog.length} keys, over optimalKeys ${d.optimalKeys}`);
    assert.ok(d.pars.legendary >= d.optimalKeys * 0.2, `${d.id}: legendary ${d.pars.legendary}s under 5 keys/s for ${d.optimalKeys} keys — nobody can hit it`);
  }
});

test('each checkpoint\'s keys hint replays chained from the previous end state', () => {
  for (const d of DRILLS.filter(x => x.kind !== 'challenge')) {
    const run = new LessonRun(d, { mode: 'timed' });
    d.goals.forEach((g, i) => {
      run.run(hintScript(g.keys));
      assert.ok(run.doneCount >= i + 1, `${d.id} › ${g.id}: keys hint did not land the checkpoint (done ${run.doneCount})`);
    });
    assert.ok(run.finished, `${d.id}: all checkpoint hints finish the drill`);
  }
});

test('a Daily seed patches figures without breaking the checks', () => {
  for (const d of DRILLS.filter(x => typeof x.seed === 'function')) {
    const patch = d.seed(rng32(20260922));
    assert.ok(Object.keys(patch).length > 0, `${d.id}: seed patches something`);
    for (const k in patch) assert.match(k, /^[A-Z]+\d+$/, `${d.id}: seed key ${k} is a cell ref`);
    const seeded = { ...d, sheet: { ...d.sheet, cells: { ...d.sheet.cells, ...patch } }, seed: undefined };
    assert.deepEqual(validateDrill(seeded), [], `${d.id}: seeded variant validates`);
    const run = new LessonRun(seeded, { mode: 'timed' });
    run.run(d.solution);
    assert.ok(run.finished, `${d.id}: solution still finishes on seeded figures`);
    // determinism: the same day seed gives the same patch
    assert.deepEqual(d.seed(rng32(20260922)), patch, `${d.id}: seed is deterministic`);
  }
});

test('parsFrom derives the old ladder and tierFor grades against it', () => {
  assert.deepEqual(parsFrom(30), { pass: 45, pro: 35, legendary: 30 });
  assert.deepEqual(parsFrom(25, { pass: 50 }), { pass: 50, pro: 29, legendary: 25 });
  assert.deepEqual(parsFrom(2), { pass: 4, pro: 3, legendary: 2 }, 'tiny pars stay strictly ordered');
  assert.equal(tierFor(29.9, parsFrom(30)), 'legendary');
  assert.equal(tierFor(33, parsFrom(30)), 'pro');
  assert.equal(tierFor(44, parsFrom(30)), 'pass');
  assert.equal(tierFor(46, parsFrom(30)), 'none');
  assert.equal(tierFor(NaN, parsFrom(30)), 'none');
  assert.ok(tierAtLeast('pro', 'pass') && !tierAtLeast('pass', 'legendary'));
});
