// The Practice page's pure parts: which module teaches each drill, when that module counts as
// taught, the curriculum labels on challenges, and one time format.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DRILLS } from '../content/drills.js';
import { lessonById, CHAPTERS, modulesOf } from '../content/index.js';
import { DRILL_MODULE, drillModule, moduleTaught, runLabel, challengeName, fmtSecs } from '../app/practice-page.js';

test('practice: every drill names the module that teaches its keys (chapter 1 for the keyed drills, its own chapter for a challenge)', () => {
  const ids = new Set(CHAPTERS.flatMap(ch => modulesOf(ch).map(m => m.id)));
  for (const d of DRILLS) {
    const m = drillModule(d);
    assert.ok(m, `${d.id} has no teaching module`);
    assert.ok(ids.has(m.id), `${d.id} → unknown module ${m.id}`);
    assert.match(m.n, d.chapter !== 'foundations' ? /^[2-6]\.([1-9]|R)$/ : /^1\.[1-7]$/, `${d.id} → ${m.n}`);
  }
  // the map covers exactly the non-challenge drills (a new drill must be added to it)
  assert.deepEqual(Object.keys(DRILL_MODULE).sort(), DRILLS.filter(d => d.kind !== 'challenge').map(d => d.id).sort());
});

test('practice: a drill is tagged with the LAST module it leans on', () => {
  const n = id => drillModule(DRILLS.find(d => d.id === id)).n;
  assert.equal(n('get-around'), '1.2');
  assert.equal(n('insert-and-amend'), '1.6');       // moves rows (1.4), ends on amending the total (1.6)
  assert.equal(n('row-wrangler'), '1.4');
  assert.equal(n('before-you-send'), '1.7');
  assert.equal(n('challenge-find-and-mark'), '1.2'); // a challenge carries its own module
});

test('practice: a module is taught once every lesson is completed or skipped, never by a challenge alone', () => {
  const m = drillModule(DRILLS.find(d => d.id === 'get-around'));
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

test('practice: lessons and challenges read as the curriculum writes them', () => {
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


// R7's exit check (REBUILD_PLAN 2a): Practice shows every built drill, with pars from a reference route.
test('practice: every registered drill shows under its chapter and module on Practice, with pars from its reference route', async () => {
  const { CATALOG } = await import('../content/catalog.js');
  const { catalogRows } = await import('../app/practice-page.js');
  const { parsFromRoute } = await import('../app/pars.js');
  const groups = catalogRows(CATALOG, {});
  const shown = new Map();
  for (const g of groups) for (const r of g.rows) { assert.ok(!shown.has(r.id), `${r.id} shows once`); shown.set(r.id, g.id); }
  const drills = DRILLS.filter(d => d.kind !== 'challenge');
  assert.equal(shown.size, drills.length, 'the Drills page lists exactly the registered drills');
  for (const d of drills) {
    assert.equal(shown.get(d.id), d.chapter, `${d.id} shows under its chapter`);
    const m = drillModule(d);
    assert.ok(m && m.id, `${d.id} sits under a Practice module`);
    assert.ok(Number.isFinite(d.route) && d.route > 0, `${d.id}: a reference route time`);
    assert.ok(typeof d.solution === 'string' && d.solution.trim(), `${d.id}: a reference route to replay`);
    assert.deepEqual(d.pars, parsFromRoute(d.route), `${d.id}: pars from its reference route`);
    const e = CATALOG.find(x => x.id === d.id);
    assert.deepEqual(e.pars, d.pars, `${d.id}: the catalog carries the pars Practice shows`);
    assert.equal(e.route.solution, d.solution, `${d.id}: the catalog carries the reference route`);
  }
});

test("practice: a drill's keycaps are chords, never typed text in either quote", async () => {
  const { routeKeys } = await import('../ui/components/path.js');
  assert.deepEqual(routeKeys(`Ctrl+G "A1" Enter '=MID(F5,FIND("@",F5)+2,7)' Ctrl+Enter Alt H B P`), ['Ctrl+Enter', 'Alt H B P', 'Ctrl+G']);
  for (const d of DRILLS.filter(x => x.kind !== 'challenge'))
    for (const k of routeKeys(d.solution)) assert.ok(!/["'(]|^=/.test(k) && !/ .*[=(]/.test(k), `${d.id}: keycap ${k} is typed text`);
});
