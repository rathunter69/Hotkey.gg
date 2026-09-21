// One generic test over every lesson in the catalogue: the format validates, no goal requires a
// concept that neither this lesson nor its prerequisites teach, and replaying the reference
// solution through the engine lands every goal and every end-state check.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, LESSONS, LESSONS_BY_ID } from '../content/index.js';
import { validateLesson, availableConcepts } from '../content/schema.js';
import { LessonRun } from '../app/runner.js';

test('the catalogue is well formed', () => {
  assert.ok(CHAPTERS.length >= 1);
  const ids = LESSONS.map(l => l.id);
  assert.equal(new Set(ids).size, ids.length, 'lesson ids are unique');
  const foundations = CHAPTERS.find(c => c.id === 'foundations');
  assert.ok(foundations.lessons.length >= 5 && foundations.lessons.length <= 8, 'Foundations has 5–8 lessons');
  for (const l of LESSONS) for (const p of l.prerequisites) { assert.ok(LESSONS_BY_ID[p], `${l.id}: prerequisite ${p} exists`); assert.ok(ids.indexOf(p) < ids.indexOf(l.id), `${l.id}: prerequisite ${p} comes earlier`); }
});

for (const lesson of LESSONS) {
  test(`${lesson.id}: validates, requires only taught concepts, solution replays`, () => {
    const errs = validateLesson(lesson);
    assert.deepEqual(errs, [], errs.join('; '));
    const avail = availableConcepts(lesson, LESSONS_BY_ID);
    for (const g of lesson.goals) for (const c of g.requires) assert.ok(avail.has(c), `${lesson.id} goal ${g.id} requires "${c}" which is not taught here or earlier`);
    for (const st of lesson.steps) if (st.mode === 'teach') for (const p of st.body) assert.ok(!/\b(gonna|kinda|magic|super easy|awesome)\b/i.test(p), 'professional terminology');

    let t = 0;
    const run = new LessonRun(lesson, { mode: 'guided', now: () => (t += 100) });
    assert.equal(run.finished, false);
    assert.equal(run.doneCount, 0, 'no goal passes before any key');
    run.run(lesson.solution);
    const states = run.goalStates();
    assert.ok(run.finished, `${lesson.id}: solution did not finish — done ${run.doneCount}/${lesson.goals.length}; first unmet: ${states.find(g => !g.done)?.text}`);
    assert.equal(run.doneCount, lesson.goals.length);
    assert.ok(run.elapsed > 0);
  });
}

test('a run can be reset and goals latch in order', () => {
  const lesson = LESSONS[0];
  const run = new LessonRun(lesson, { now: () => 0 });
  run.run('Right Down Down');
  assert.equal(run.doneCount, 1);
  run.run('Ctrl+Home');
  assert.equal(run.doneCount, 1, 'an earlier goal does not un-latch');
  run.reset('solo');
  assert.equal(run.doneCount, 0); assert.equal(run.mode, 'solo'); assert.equal(run.sheet.selectionText(), 'A1');
});
