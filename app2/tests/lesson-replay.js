// app2/tests/lesson-replay.js: the per-lesson tests (format, taught concepts, solution replay, and
// each guided hint walked goal by goal), registered for one shard of the catalogue. The shards are
// lesson-replay-<n>.test.js, so the gate spreads them over its processes and stays inside its
// budget as chapters land. The lessons are dealt to the shards by measured cost (check-costs.json,
// written by `run-checks.js --measure`), heaviest first onto the lightest shard, so a chapter of
// heavy lessons cannot pile onto one shard; a lesson not measured yet counts the median.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LESSONS, LESSONS_BY_ID } from '../content/index.js';
import { validateLesson, availableConcepts, SEEDED_KINDS } from '../content/schema.js';
import { WORKBOOKS, workbookState } from '../content/workbooks/index.js';
import { LessonRun } from '../app/runner.js';
import { hintScript } from './hint-rules.js';

export const SHARDS = 8;
const fresh = (lesson, opts = {}) => new LessonRun(lesson, { now: () => 0, ...opts });

/** The measured seconds per lesson (both of its tests), from check-costs.json; {} when there is none. */
export function lessonCosts() {
  try { return JSON.parse(readFileSync(new URL('./check-costs.json', import.meta.url), 'utf8')).lessons || {}; } catch { return {}; }
}
/** The catalogue dealt into SHARDS lists of lessons: costliest first, each onto the lightest shard (ties in catalogue order). */
export function partition(lessons = LESSONS, costs = lessonCosts()) {
  const known = Object.values(costs).filter(Number.isFinite).sort((a, b) => a - b);
  const median = known.length ? known[known.length >> 1] : 1;
  const cost = l => (Number.isFinite(costs[l.id]) ? costs[l.id] : median);
  const shards = Array.from({ length: SHARDS }, () => ({ lessons: [], w: 0 }));
  const order = lessons.map((l, i) => ({ l, i, c: cost(l) })).sort((a, b) => b.c - a.c || a.i - b.i);
  for (const { l, c } of order) { const s = shards.reduce((a, b) => (b.w < a.w ? b : a)); s.lessons.push(l); s.w += c; }
  const at = new Map(lessons.map((l, i) => [l, i]));
  return shards.map(s => s.lessons.sort((a, b) => at.get(a) - at.get(b)));   // each shard runs in catalogue order
}

export function registerReplays(shard) {
  const mine = partition()[shard];
  for (const lesson of mine) {
    test(`${lesson.id}: validates, requires only taught concepts, solution replays`, () => {
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
      // a module lesson's solution leaves exactly its after state (the chain is real); checked on
      // this replay rather than a second one, so each lesson is replayed once for it
      if (lesson.workbook && lesson.state && lesson.state.after && !SEEDED_KINDS.includes(lesson.kind)) {
        const wb = WORKBOOKS[lesson.workbook];   // each workbook reads its own session: Clearcoat's carries enterMoves and the defined names
        const diff = wb.diffStates(wb.sessionToState(run.session), workbookState(lesson.workbook, lesson.state.after));
        assert.deepEqual(diff, [], `${lesson.id}: the solution leaves exactly ${lesson.state.after} — extra diffs: ${JSON.stringify(diff.slice(0, 4))}`);
      }
    });
  }

  for (const lesson of mine) {
    test(`${lesson.id}: every guided hint lands exactly its goal from where the previous goal left off`, () => {
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
