// The Practice page's pure parts: which module teaches each drill, when that module counts as
// taught, the curriculum labels on timed runs and challenges, one time format, and the Timed
// runs list handing over to Learn in ONE element.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DRILLS } from '../content/drills.js';
import { lessonById, CHAPTERS, modulesOf } from '../content/index.js';
import { DRILL_MODULE, drillModule, moduleTaught, runLabel, challengeName, fmtSecs, timedRunsHtml, RUNS_SHOWN } from '../app/practice-page.js';

test('practice: every drill names the chapter 1 module that teaches its keys', () => {
  const ids = new Set(modulesOf(CHAPTERS[0]).map(m => m.id));
  for (const d of DRILLS) {
    const m = drillModule(d);
    assert.ok(m, `${d.id} has no teaching module`);
    assert.ok(ids.has(m.id), `${d.id} → unknown module ${m.id}`);
    assert.match(m.n, /^1\.[1-7]$/, `${d.id} → ${m.n}`);
  }
  // the map covers exactly the non-challenge drills (a new drill must be added to it)
  assert.deepEqual(Object.keys(DRILL_MODULE).sort(), DRILLS.filter(d => d.kind !== 'challenge').map(d => d.id).sort());
});

test('practice: a drill is tagged with the LAST module it leans on', () => {
  const n = id => drillModule(DRILLS.find(d => d.id === id)).n;
  assert.equal(n('edge-jumps'), '1.2');
  assert.equal(n('type-the-column'), '1.6');        // types figures (1.3), ends on AutoSum (1.6)
  assert.equal(n('row-wrangler'), '1.4');
  assert.equal(n('challenge-find-and-mark'), '1.2'); // a challenge carries its own module
});

test('practice: a module is taught once every lesson is completed or skipped, never by a challenge alone', () => {
  const m = drillModule(DRILLS.find(d => d.id === 'edge-jumps'));
  const ids = m.lessons.map(l => l.id);
  assert.equal(moduleTaught(m, {}, []), false);
  const all = Object.fromEntries(ids.map(id => [id, { completed: true }]));
  assert.equal(moduleTaught(m, all, []), true);
  delete all[ids[1]];
  assert.equal(moduleTaught(m, all, []), false);
  assert.equal(moduleTaught(m, all, [ids[1]]), true);                                  // placement skipped it
  assert.equal(moduleTaught(m, { ...all, [ids[1]]: { started: true } }, []), false);   // started is not done
  assert.equal(moduleTaught(null, all, []), false);
});

test('practice: timed runs and challenges read as the curriculum writes them', () => {
  assert.deepEqual(runLabel(lessonById('around-the-workbook')), { n: '1.2.3', title: lessonById('around-the-workbook').title });
  const ch = lessonById('challenge-inherited-file');
  const label = runLabel(ch);
  assert.equal(label.n, '1.1.C');
  assert.doesNotMatch(label.title, /^Challenge:/);
  assert.equal(challengeName('Challenge: find and mark'), 'Find and mark');
  assert.equal(challengeName('Find and mark'), 'Find and mark');
});

test('practice: one time format, a space before the unit', () => {
  assert.equal(fmtSecs(12.34), '12.3 s');
  assert.equal(fmtSecs(5.2), '5.2 s');
  assert.equal(fmtSecs(150), '150.0 s');
});

test('practice: the Timed runs list ends in ONE link to Learn when it overflows', () => {
  const done = modulesOf(CHAPTERS[0]).flatMap(m => m.lessons).slice(0, RUNS_SHOWN + 3);
  const all = Object.fromEntries(done.map(l => [l.id, { completed: true }]));
  all[done[0].id].best = 41.33;
  const html = timedRunsHtml(done, all);
  assert.equal((html.match(/<li/g) || []).length, RUNS_SHOWN + 1);
  assert.match(html, /<li class="pl-more"><a href="#\/learn">See all 13 in Learn<\/a><\/li><\/ul>$/);
  assert.match(html, /best 41\.3 s/);
  const short = timedRunsHtml(done.slice(0, 2), all);
  assert.equal((short.match(/<li/g) || []).length, 2);
  assert.doesNotMatch(short, /See all/);
});
