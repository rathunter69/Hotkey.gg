// app2/tests/drills.test.js — the drill catalogue holds its contract (Phase D):
// every drill validates, its solution replays to a finish inside the optimal keystroke count,
// each checkpoint's keys hint replays chained, pars are honest, and a Daily seed never breaks
// the checks. parsFrom's arithmetic is pinned too.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DRILLS, DRILLS_BY_ID, drillById, BENCHMARKS, DAILY_POOL } from '../content/drills.js';
import { validateDrill } from '../content/schema.js';
import { parsFrom, parsFromRoute, tierFor, tierAtLeast } from '../app/pars.js';
import { LessonRun } from '../app/runner.js';
import { replayReason, sampleLine } from './replay-select.js';
import { tells } from '../content/copy/tells.js';
import { BRITISH, namesVisibleThing, sentenceCount } from './copy-check.js';

/** A deterministic rng for seed tests (mulberry32; the Daily uses the same in engine/rng.js). */
function rng32(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** A keys hint as a replayable script (glyphs → key names, ×N expanded, connectives dropped). */
function hintScript(hint) {
  const out = [];
  for (const t of hint.match(/"[^"]*"|'[^']*'|\S+/g) || []) {   // a typed string in double quotes, or single when it holds a double quote
    if (/^(then|…|,|and|or)$/.test(t)) continue;
    const m = /^×(\d+)$/.exec(t);
    if (m) { const last = out[out.length - 1]; for (let i = 1; i < +m[1]; i++) out.push(last); continue; }
    out.push(t.startsWith('"') || t.startsWith("'") ? t : t.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/⌫/g, 'Backspace').replace(/↵/g, 'Enter'));
  }
  return out.join(' ');
}

/** The drills whose solutions and hints this run replays: all of them, or the gate's sample (replay-select.js; `--full` replays all). */
const PLAIN = DRILLS.filter(x => x.kind !== 'challenge');
const REPLAYED = PLAIN.filter((d, i) => replayReason(d, i));
sampleLine('drills', REPLAYED.length, PLAIN.length);

test('the catalogue: ids unique, lookups work, benchmarks and the Daily pool are real drills', () => {
  assert.ok(DRILLS.length >= 11, 'at least the eleven Chapter 1 drills');
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
  assert.equal(ch.length, 38, 'the seven Chapter 1 module challenges, the seven Chapter 2 ones (2.1 to 2.7), the remix, the six Chapter 3 ones (3.1 to 3.6), Chapter 4\'s six (4.1 to 4.6), Chapter 5\'s 5.1 to 5.7 and Chapter 6\'s 6.1 to 6.4 are registered');
  for (const d of ch) { assert.ok(d.lesson && d.lesson.kind === 'challenge' && d.pars && d.pars.pass > d.pars.legendary, d.id); assert.equal(d.access, d.chapter === 'foundations' ? 'free' : 'paid', d.id); }
  assert.deepEqual(ch.filter(d => d.benchmark).map(d => d.id), ['challenge-to-standard-in-three-minutes', 'challenge-the-site-pnl'], 'two challenges are benchmarks');
  assert.ok(ch.filter(d => d.access === 'free').every(d => DAILY_POOL.includes(d.id)), 'the Daily pool picks the free challenges up');
  assert.ok(ch.filter(d => d.access === 'paid').every(d => !DAILY_POOL.includes(d.id)), 'the Daily never draws a paid challenge');
});

/** Chapter 1's drills as screenplay 6.1 lists them (resized 2026-10-01; M108): id and Pass par. */
const CH1 = [['get-around', 80], ['enter-and-fill', 90], ['find-and-fix', 60], ['paste-surgeon', 90], ['row-wrangler', 60], ['format-the-weekly-page', 120],
  ['insert-and-amend', 90], ['formula-sprint', 120], ['combine-two-tabs', 120], ['before-you-send', 120], ['weekly-sales-report', 180]];

test("Chapter 1's eleven drills: 6.1's set and order, eight to twenty goals, pars from the reference route", () => {
  const keyed = DRILLS.filter(d => d.kind !== 'challenge' && d.chapter === 'foundations');
  assert.deepEqual(keyed.map(d => d.id), CH1.map(([id]) => id));
  for (const [id, pass] of CH1) {
    const d = DRILLS_BY_ID[id];
    assert.ok(d.goals.length >= 8 && d.goals.length <= 20, `${id}: ${d.goals.length} goals, 6.1 asks eight to twenty`);
    assert.equal(d.route * 2, pass, `${id}: the reference route is half the Pass par`);
    assert.deepEqual(d.pars, parsFromRoute(d.route), `${id}: pars from parsFromRoute`);
    assert.equal(d.pars.pass, pass, `${id}: Pass par ${pass} s`);
    assert.ok(d.optimalKeys / d.route <= 4, `${id}: ${d.optimalKeys} keys in a ${d.route} s route is faster than a fast hand`);
    assert.equal(d.access, 'free', `${id}: Chapter 1 is free`);
  }
  assert.deepEqual(BENCHMARKS.filter(d => d.kind !== 'challenge').map(d => d.id), ['weekly-sales-report', 'ch2-pnl-to-standard', 'ch3-tie-it-out', 'ch4-cube-it', 'ch5-revenue-build', 'ch6-paper-lbo'],
    'the weekly report and one benchmark a chapter from Chapter 2 on are the benchmarks');
  for (const [id] of CH1) assert.ok(DAILY_POOL.includes(id), `${id} is in the Daily's pool`);
});

/** Chapters 2 and 3: screenplay 6.2's planned seven (one the benchmark), the puzzle, and the two Wave 1 sketches each from script-drills.md. */
const CH23 = {
  formatting: { workbook: 'clearcoat-pnl', benchmark: 'ch2-pnl-to-standard', puzzle: 'puzzle-ch2',
    ids: ['ch2-format-sprint', 'ch2-to-thousands', 'ch2-flip-and-tie', 'ch2-custom-code', 'ch2-the-divider', 'ch2-top-and-bottom', 'ch2-flag-it', 'ch2-print-it', 'ch2-pnl-to-standard', 'puzzle-ch2'] },
  formulas: { workbook: 'clearcoat-databook', benchmark: 'ch3-tie-it-out', puzzle: 'puzzle-ch3',
    ids: ['ch3-if-ladder', 'ch3-override', 'ch3-date-math', 'ch3-sumifs-sprint', 'ch3-bands', 'ch3-text-split', 'ch3-loan-schedule', 'ch3-trace-the-error', 'ch3-tie-it-out', 'puzzle-ch3'] },
};

test("Chapters 2 and 3: the planned set, the puzzle and the Wave 1 sketches, on each chapter's workbook, pars from the reference route", () => {
  for (const [chapter, want] of Object.entries(CH23)) {
    const keyed = DRILLS.filter(d => d.kind !== 'challenge' && d.chapter === chapter);
    assert.deepEqual(keyed.map(d => d.id), want.ids, `${chapter}: the set and its order`);
    for (const d of keyed) {
      assert.equal(d.workbook, want.workbook, `${d.id} runs on ${want.workbook}`);
      assert.equal(d.access, 'paid', `${d.id}: Chapters 2 to 6 are Full Access`);
      assert.deepEqual(d.pars, parsFromRoute(d.route), `${d.id}: pars from parsFromRoute`);
      assert.ok(d.pars.pass >= 60 && d.pars.pass <= 180, `${d.id}: Pass par ${d.pars.pass} s sits in the 60 to 180 second class`);
      assert.ok(d.optimalKeys / d.route <= 4.5, `${d.id}: ${d.optimalKeys} keys in a ${d.route} s route is faster than a fast hand`);
      assert.ok(!DAILY_POOL.includes(d.id), `${d.id}: the Daily draws free drills only`);
    }
    assert.deepEqual(keyed.filter(d => d.benchmark).map(d => d.id), [want.benchmark], `${chapter}: one benchmark`);
    assert.equal(keyed[keyed.length - 1].id, want.puzzle, `${chapter}: the puzzle closes the set`);
  }
});

test('drill copy follows the copy rules: no tells, American spelling, one-sentence goals that name something visible', () => {
  for (const d of DRILLS.filter(x => x.kind !== 'challenge')) {
    for (const [field, text] of [['title', d.title], ['task', d.task], ...d.goals.map(g => [`goal ${g.id}`, g.text]), ...(d.endState || []).map((e, i) => [`endState ${i}`, e.text])]) {
      assert.deepEqual(tells(text), [], `${d.id} ${field}: "${text}"`);
      assert.doesNotMatch(text, BRITISH, `${d.id} ${field}: British spelling`);
    }
    for (const g of d.goals) {
      assert.ok(g.text.length <= 140, `${d.id} ${g.id}: ${g.text.length} characters`);
      assert.ok(namesVisibleThing(g.text), `${d.id} ${g.id} names nothing visible: "${g.text}"`);
      assert.ok(sentenceCount(g.text) === 1 && /\.$/.test(g.text), `${d.id} ${g.id}: one sentence ending in a full stop`);
    }
  }
});

test('validateDrill rejects the broken shapes', () => {
  const good = DRILLS.find(d => d.kind !== 'challenge');
  assert.ok(validateDrill({ ...good, pars: { pass: 10, pro: 10, legendary: 5 } }).some(e => /strictly/.test(e)), 'flat pars');
  assert.ok(validateDrill({ ...good, optimalKeys: 0 }).some(e => /optimalKeys/.test(e)), 'zero optimal');
  assert.ok(validateDrill({ ...good, goals: good.goals.map(g => ({ ...g, teach: 'no.' })) }).some(e => /no teach/.test(e)), 'teach refused');
  assert.ok(validateDrill({ ...good, task: 'Two sentences. Here.' }).some(e => /one sentence/.test(e)), 'task length');
});

test('every solution replays to a finish inside the optimal keystroke count; pars are hittable', () => {
  for (const d of REPLAYED) {
    const run = new LessonRun(d, { mode: 'timed' });
    run.run(d.solution);
    assert.ok(run.finished, `${d.id}: solution finishes the drill`);
    assert.ok(run.session.keyLog.length <= d.optimalKeys, `${d.id}: replay used ${run.session.keyLog.length} keys, over optimalKeys ${d.optimalKeys}`);
    assert.ok(d.pars.legendary >= d.optimalKeys * 0.2, `${d.id}: legendary ${d.pars.legendary}s under 5 keys/s for ${d.optimalKeys} keys — nobody can hit it`);
  }
});

test('each checkpoint\'s keys hint replays chained from the previous end state', () => {
  for (const d of REPLAYED) {
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

test('parsFromRoute sets Pass at 2x the route, Expert at 1.4x, Legendary at 1.1x (screenplay 6.0)', () => {
  assert.deepEqual(parsFromRoute(30), { pass: 60, pro: 42, legendary: 33 });
  assert.deepEqual(parsFromRoute(45), { pass: 90, pro: 63, legendary: 50 });
  assert.deepEqual(parsFromRoute(90), { pass: 180, pro: 126, legendary: 99 });
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

/** Chapter 4's keyed drills (screenplay 6.2, with sort and filter from script-drills D60, the two Wave 1 sketches and the puzzle) and Chapter 6's Wave 1 sketches. */
const CH4 = ['ch4-lookup-relay', 'ch4-sort-and-filter', 'ch4-pivot-in-90', 'ch4-data-table', 'ch4-goal-seek', 'ch4-name-it', 'ch4-cube-it', 'ch4-six-tabs', 'ch4-two-pickers', 'puzzle-ch4'];
const CH6_WAVE1 = ['ch6-three-ways-to-a-price', 'ch6-ltm-two-ways', 'ch6-napkin', 'ch6-cap-the-amort', 'ch6-lenders-return', 'ch6-ceiling-price'];

test("Chapter 4's drills and Chapter 6's Wave 1 are registered, paid, on their packs, with pars from the reference route", () => {
  assert.deepEqual(DRILLS.filter(d => d.kind !== 'challenge' && d.chapter === 'data-and-lookups').map(d => d.id), CH4);
  for (const id of CH6_WAVE1) assert.ok(DRILLS_BY_ID[id], `${id} registered`);
  for (const id of [...CH4, ...CH6_WAVE1]) {
    const d = DRILLS_BY_ID[id];
    assert.equal(d.access, 'paid', `${id}: paid`);
    assert.equal(d.workbook, id.includes('ch4') ? 'clearcoat-pack' : 'clearcoat-valuation', `${id}: its chapter's pack`);
    assert.ok(Number.isFinite(d.route) && d.route > 0, `${id}: a reference route`);
    assert.deepEqual(d.pars, parsFromRoute(d.route), `${id}: pars from parsFromRoute`);
    assert.ok(typeof d.module === 'string' && d.module, `${id}: the module that teaches it`);
  }
});
