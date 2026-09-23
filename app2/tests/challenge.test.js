// app2/tests/challenge.test.js — the challenge kind (C2 gap 2): seeded generation over a module
// state, graders gating the finish, the seed stored for ghosts, records/XP/progress carrying the
// new kind, and the WORKLOAD INVARIANT: seeds vary content, never workload.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LessonRun } from '../app/runner.js';
import { validateLesson } from '../content/schema.js';
import { cleanAttempt } from '../app/records.js';
import { totalXP } from '../app/xp.js';
import { unitsLabel, liveness } from '../app/graders.js';
import { pickCluster } from '../content/workbooks/clusters.js';
import { LESSONS } from '../content/index.js';
import { mulberry32 } from '../engine/rng.js';

const sheetOf = (ses, name) => ses.sheets.find(s => s.name === name).sheet;

/** A fixture challenge over the real module workbook: content varies by seed, checks read the sheet. */
const CH = {
  id: 'fixture-challenge', chapter: 'foundations', section: 'Open and set up', title: 'Fixture: another cluster’s file',
  kind: 'challenge', module: 'open-and-set-up', workbook: 'voltline-weekly', state: { before: 'S1d' },
  difficulty: 'medium', tags: ['challenge'], access: 'free', minutes: 3,
  brief: 'Another cluster’s file came in: label it and link the check.',
  timeLimit: 180, pars: { pass: 90, pro: 54, legendary: 36 },
  seed: rng => {
    const cluster = pickCluster(rng);
    return {
      'Raw!B2': { value: cluster.sites[0] },
      'Raw!C2': { value: 500 + Math.floor(rng() * 200) * 10 },
      'Inputs!B6': { value: 60000 + Math.floor(rng() * 400) * 100, fontColor: 'blue' },
    };
  },
  goals: [
    { id: 'title', text: 'Type Weekly check into A1 of Report.', keys: '"Weekly check" ↵', check: (s, ses) => sheetOf(ses, 'Report').value('A1') === 'Weekly check' },
    { id: 'link', text: 'Link B1 to the first kWh figure on Raw.', keys: 'Ctrl+G "B1" ↵ "=Raw!C2" ↵', check: (s, ses) => sheetOf(ses, 'Report').value('B1') === sheetOf(ses, 'Raw').value('C2') && liveness(sheetOf(ses, 'Report'), 'B1').ok },
    { id: 'double', text: 'Double it in B2.', keys: '"=B1*2" ↵', check: (s, ses) => sheetOf(ses, 'Report').value('B2') === sheetOf(ses, 'Raw').value('C2') * 2 },
    { id: 'estimate', text: 'Copy the cluster kWh estimate from Inputs into B4.', keys: 'Ctrl+G "B4" ↵ "=Inputs!B6" ↵', check: (s, ses) => sheetOf(ses, 'Report').value('B4') === sheetOf(ses, 'Inputs').value('B6') },
  ],
  graders: [ses => unitsLabel(sheetOf(ses, 'Report'))],
  solution: '"Weekly check" Enter Ctrl+G "B1" Enter "=Raw!C2" Enter "=B1*2" Enter Ctrl+G "B4" Enter "=Inputs!B6" Enter Ctrl+Home "x" Escape',
};
const SOLUTION_CORE = '"Weekly check" Enter Ctrl+G "B1" Enter "=Raw!C2" Enter "=B1*2" Enter Ctrl+G "B4" Enter "=Inputs!B6" Enter';
const UNITS_FIX = 'Ctrl+G "A2" Enter "USD unless stated" Enter';

test('a challenge validates, and the validator rejects the broken shapes', () => {
  assert.deepEqual(validateLesson(CH), []);
  assert.ok(validateLesson({ ...CH, seed: undefined }).some(e => /generator/.test(e)), 'seed required');
  assert.ok(validateLesson({ ...CH, timeLimit: 60 }).some(e => /150-180/.test(e)), 'time limit banded');
  assert.ok(validateLesson({ ...CH, graders: [] }).some(e => /graders/.test(e)), 'graders required');
  assert.ok(validateLesson({ ...CH, pars: { pass: 10, pro: 20, legendary: 30 } }).some(e => /strictly/.test(e)), 'pars ordered');
  assert.ok(validateLesson({ ...CH, goals: CH.goals.map(g => ({ ...g, teach: 'no.' })) }).some(e => /no teach/.test(e)), 'teach refused');
  assert.ok(validateLesson({ ...CH, par: 30 }).some(e => /pars, not par/.test(e)));
});

test('two seeds dress the sheet differently; the same seed reproduces it; checks still grade', () => {
  const a = new LessonRun(CH, { seedNo: 1 });
  const b = new LessonRun(CH, { seedNo: 2 });
  const a2 = new LessonRun(CH, { seedNo: 1 });
  const cell = run => sheetOf(run.session, 'Inputs').cellAt('B6').value;
  assert.equal(cell(a), cell(a2), 'same seed, same sheet');
  assert.notEqual(cell(a), cell(b), 'different seeds, different figures');
  assert.equal(a.seedNo, 1); assert.equal(b.seedNo, 2);
  for (const run of [a, b]) {
    run.run(SOLUTION_CORE);
    assert.equal(run.doneCount, 4, 'every goal grades from the sheet, whatever the seed');
    assert.equal(run.finished, false, 'goals alone do not finish: a grader still fails');
    assert.match(run.current.text, /units line/, 'the failing grader is the pending item, with its why');
    run.run(UNITS_FIX);
    assert.equal(run.finished, true, 'the convention fixed, the run passes');
  }
});

test('an unseeded run draws a random seed and records it', () => {
  const run = new LessonRun(CH, {});
  assert.ok(Number.isInteger(run.seedNo) && run.seedNo >= 0, 'a practice run carries its seed for the attempt record');
});

test('workload invariant: 50 seeds change content, never the workload', () => {
  const keyCounts = new Set();
  const figures = new Set();
  for (let seedNo = 1; seedNo <= 50; seedNo++) {
    const patch = CH.seed(mulberry32(seedNo));
    keyCounts.add(Object.keys(patch).length);
    figures.add(patch['Inputs!B6'].value);
    const run = new LessonRun(CH, { seedNo });
    assert.equal(run.goals.length, 4, 'goal count never moves');
  }
  assert.equal(keyCounts.size, 1, 'the seed patches the same shape every time');
  assert.ok(figures.size > 10, 'the figures genuinely vary');
  // and the real challenges, as they land, obey the same law
  for (const ch of LESSONS.filter(l => l.kind === 'challenge')) {
    const counts = new Set();
    for (let s = 1; s <= 50; s++) counts.add(Object.keys(ch.seed(mulberry32(s))).length);
    assert.ok(counts.size <= 2, `${ch.id}: a twist may add cells, but the workload band holds (saw ${[...counts].join(',')})`);
    assert.deepEqual(validateLesson(ch), [], ch.id);
  }
});

test('records, XP and progress carry the challenge kind', async () => {
  const att = cleanAttempt({ id: 'c-1', kind: 'challenge', ref: 'challenge-inherited-file', day: '2026-09-23', seed: 7, secs: 80, keys: 40, clean: true, tier: 'pro', at: 1 });
  assert.ok(att, 'a challenge attempt is not dropped');
  assert.equal(att.kind, 'challenge');
  assert.equal(att.seed, 7, 'the seed rides the attempt (ghosts replay the same sheet)');
  const D = '2026-09-23';
  assert.equal(totalXP([{ kind: 'challenge', ref: 'c', day: D }]), 50, 'first pass pays the module bonus');
  assert.equal(totalXP([
    { kind: 'challenge', ref: 'c', day: D }, { kind: 'challenge', ref: 'c', day: D },
    { kind: 'challenge', ref: 'c', day: D }, { kind: 'challenge', ref: 'c', day: D }, { kind: 'challenge', ref: 'c', day: D },
  ]), 50 + 30, 'repeats pay 10, capped at three a day');
  // progress: the pass latches the best tier
  const mem = {}; globalThis.localStorage = { getItem: k => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
  try {
    const { progress } = await import('../app/progress.js');
    progress.record('challenge-inherited-file', 'challenge', 95, { clean: true, tier: 'pass' });
    assert.deepEqual(progress.get('challenge-inherited-file').tier, 'pass');
    progress.record('challenge-inherited-file', 'challenge', 60, { clean: true, tier: 'legendary' });
    assert.equal(progress.get('challenge-inherited-file').tier, 'legendary', 'the best tier wins');
    progress.record('challenge-inherited-file', 'challenge', 70, { clean: true, tier: 'pass' });
    assert.equal(progress.get('challenge-inherited-file').tier, 'legendary', 'and never regresses');
    assert.equal(progress.get('challenge-inherited-file').best, 60, 'best time from clean runs');
    assert.equal(progress.get('challenge-inherited-file').challenge, true);
  } finally { delete globalThis.localStorage; }
});
