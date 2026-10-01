// app2/tests/lesson-replay.js: the per-lesson tests (format, taught concepts, solution replay, and
// each guided hint walked goal by goal), registered for one shard of the catalogue. The shards are
// lesson-replay-<n>.test.js, so node --test runs them on separate cores and the gate stays inside
// its budget as chapters land.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DRIFT_LESSONS, driftSkip } from './known-drift.js';
import { LESSONS, LESSONS_BY_ID } from '../content/index.js';
import { validateLesson, availableConcepts } from '../content/schema.js';
import { LessonRun } from '../app/runner.js';
import { hintScript } from './hint-rules.js';

export const SHARDS = 4;
const fresh = (lesson, opts = {}) => new LessonRun(lesson, { now: () => 0, ...opts });

export function registerReplays(shard) {
  const mine = LESSONS.filter((_, i) => i % SHARDS === shard);
  for (const lesson of mine) {
    test(`${lesson.id}: validates, requires only taught concepts, solution replays`, { skip: driftSkip(DRIFT_LESSONS, lesson.id) }, () => {
      const errs = validateLesson(lesson);
      assert.deepEqual(errs, [], errs.join('; '));
      const avail = availableConcepts(lesson, LESSONS_BY_ID);
      for (const g of lesson.goals) for (const c of g.requires || []) assert.ok(avail.has(c), `${lesson.id} goal ${g.id} requires "${c}" which is not taught here or earlier`);

      let t = 0;
      const run = new LessonRun(lesson, { mode: 'guided', now: () => (t += 100) });
      assert.equal(run.finished, false);
      run.evaluate();
      assert.equal(run.doneCount, 0, 'no goal passes on the starting sheet');
      run.run(lesson.solution);
      const states = run.goalStates();
      assert.ok(run.finished, `${lesson.id}: solution did not finish — done ${run.doneCount}/${lesson.goals.length}; first unmet: ${states.find(g => !g.done)?.text || run.endStates().find(e => !e.ok)?.text}`);
      assert.equal(run.doneCount, lesson.goals.length);
      assert.ok(run.elapsed > 0);
      assert.equal(run.current, null);
    });
  }

  for (const lesson of mine) {
    test(`${lesson.id}: every guided hint lands exactly its goal from where the previous goal left off`, { skip: driftSkip(DRIFT_LESSONS, lesson.id) }, () => {
      const run = fresh(lesson);
      lesson.goals.forEach((g, i) => {
        if (g.demo) { run.run(''); assert.ok(run.doneCount >= i + 1, `${lesson.id} goal ${g.id}: the demo plays itself and lands its goal`); return; }
        assert.ok(typeof g.keys === 'string' && g.keys.trim(), `${lesson.id} goal ${g.id} has a guided hint`);
        run.run(hintScript(g.keys));
        // a demo goal that follows plays itself as soon as this goal lands, so it may already be done too
        let expect = i + 1; while (expect < lesson.goals.length && lesson.goals[expect].demo && run.doneCount > expect) expect++;
        assert.equal(run.doneCount, expect, `${lesson.id} goal ${g.id}: pressing exactly the hint "${g.keys}" should land this goal and no other (selection now ${run.sheet.selectionText()})`);
      });
      assert.ok(run.finished, `${lesson.id}: the hints, one after another, complete the lesson`);
    });
  }

}
