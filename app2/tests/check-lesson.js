// app2/tests/check-lesson.js — one lesson file, every law, standalone (authoring aid):
//   node app2/tests/check-lesson.js app2/content/lessons/<id>.js [--seeds 10]
// Runs validateLesson, the taught-concepts rule against the catalogue, the solution replay (a
// module lesson must land exactly on its `after` state; a challenge must pass its graders on
// several seeds with the workload invariant), each guided hint from the previous goal's end
// state, and the hint vocabulary law. Exit 1 with the first problems listed; exit 0 = clean.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import { validateLesson, availableConcepts, countedGoals, goalBounds, SEEDED_KINDS } from '../content/schema.js';
import { LESSONS_BY_ID } from '../content/index.js';
import { LessonRun } from '../app/runner.js';
import { workbookState } from '../content/workbooks/index.js';
import { diffStates, sessionToState } from '../content/workbooks/voltline-weekly.js';
import { mulberry32 } from '../engine/rng.js';
import { hintScript, hintTokens, goToOffence, arrowGrind, anchorBefore } from './hint-rules.js';

const file = process.argv[2];
if (!file) { console.error('usage: node app2/tests/check-lesson.js <lesson.js> [--seeds N]'); process.exit(2); }
const seedsArg = process.argv.indexOf('--seeds'); const SEEDS = seedsArg > 0 ? +process.argv[seedsArg + 1] || 10 : 10;
const lesson = (await import(pathToFileURL(resolve(file)).href)).default;
const problems = [];
const bad = (m) => problems.push(m);

// 1. the format
for (const e of validateLesson(lesson)) bad('validate: ' + e);
const b = goalBounds(lesson.kind, typeof lesson.module === 'string');
const n = countedGoals(lesson.goals || []).length;
if (n < b.min || n > b.max) bad(`goals: ${n} counted, band is ${b.min}-${b.max}`);
// 2. concepts: this lesson's own, plus its prerequisites' through the catalogue — and through the
// sibling files in content/lessons/ that are not registered yet (a module is authored before it lands)
const byId = { ...LESSONS_BY_ID, [lesson.id]: lesson };
{
  const dir = resolve(file, '..');
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.js')) continue;
    try { const m = (await import(pathToFileURL(resolve(dir, name)).href)).default; if (m && typeof m.id === 'string' && !byId[m.id]) byId[m.id] = m; } catch (e) { /* a sibling mid-edit is not this file's problem */ }
  }
}
const avail = availableConcepts(lesson, byId);
for (const g of lesson.goals || []) for (const c of g.requires || []) if (!avail.has(c)) bad(`goal ${g.id} requires "${c}", taught neither here nor by a prerequisite`);
for (const c of lesson.uses || []) if (!avail.has(c) || (lesson.teaches || []).includes(c)) bad(`uses "${c}" is ${(lesson.teaches || []).includes(c) ? 'also taught here' : 'not taught by any prerequisite'}`);

if (!problems.length) {
  if (SEEDED_KINDS.includes(lesson.kind)) {
    // 3a. a seeded kind (challenge, assessment, test-out): the solution passes on several seeds; the workload never moves
    const counts = new Set();
    for (let seedNo = 1; seedNo <= SEEDS; seedNo++) {
      counts.add(Object.keys(lesson.seed(mulberry32(seedNo))).length);
      const run = new LessonRun(lesson, { seedNo, now: () => 0 });
      try { run.run(lesson.solution); } catch (e) { bad(`seed ${seedNo}: solution throws: ${e.message}`); continue; }
      if (!run.finished) {
        const pending = run.current;
        bad(`seed ${seedNo}: solution does not finish — ${run.doneCount}/${run.goals.length} goals; pending: ${pending ? pending.text : '?'}; graders: ${run.graderStates().filter(g => !g.ok).map(g => g.why).join(' | ')}`);
      }
    }
    if (counts.size > 2) bad(`workload: the seed patch has ${[...counts].join(',')} keys across seeds — content varies, workload must not`);
  } else {
    // 3b. a lesson: the solution finishes and (module lesson) lands exactly on `after`
    const run = new LessonRun(lesson, { now: () => 0 });
    run.evaluate();
    if (run.doneCount) bad('the first goal is already satisfied by the starting state');
    try { run.run(lesson.solution); } catch (e) { bad(`solution throws: ${e.message}`); }
    if (!run.finished) bad(`solution does not finish — ${run.doneCount}/${run.goals.length} goals; pending: ${run.current ? run.current.text : '?'}`);
    else if (lesson.workbook && lesson.state && lesson.state.after) {
      const diff = diffStates(sessionToState(run.session), workbookState(lesson.workbook, lesson.state.after));
      for (const d of diff.slice(0, 12)) bad(`after-state diff on ${d.sheet}!${d.key} (${d.kind}): solution left ${JSON.stringify(d.a)} but ${lesson.state.after} has ${JSON.stringify(d.b)}`);
      if (diff.length > 12) bad(`… and ${diff.length - 12} more diffs`);
    }
    // 4. every hint lands exactly its goal from where the previous one left off
    const hr = new LessonRun(lesson, { now: () => 0 });
    (lesson.goals || []).forEach((g, i) => {
      if (problems.some(p => p.startsWith('hint'))) return;
      if (g.demo) { hr.run(''); if (hr.doneCount < i + 1) bad(`hint: demo goal ${g.id} did not land itself`); return; }
      try { hr.run(hintScript(g.keys)); } catch (e) { bad(`hint ${g.id}: throws: ${e.message}`); return; }
      let expect = i + 1; while (expect < lesson.goals.length && lesson.goals[expect].demo && hr.doneCount > expect) expect++;
      if (hr.doneCount !== expect) bad(`hint ${g.id}: "${g.keys}" leaves ${hr.doneCount}/${lesson.goals.length} goals done (expected ${expect}); selection ${hr.sheet.selectionText()} on ${hr.session.sheets[hr.session.sheetIndex].name}`);
    });
    if (!hr.finished && !problems.some(p => p.startsWith('hint'))) bad('hints: one after another they do not complete the lesson');
  }
  // 5. the hint vocabulary law
  if (typeof lesson.module === 'string') (lesson.goals || []).forEach((g, gi) => {
    const toks = hintTokens(g.keys);
    const off = goToOffence(toks, anchorBefore(lesson, gi));
    if (off) bad(`vocabulary ${g.id}: Go To used as movement glue — ${off}`);
    if (!g.slowRound && arrowGrind(toks)) bad(`vocabulary ${g.id}: more than three plain arrows in a row`);
  });
}

if (problems.length) { console.log(`${lesson.id || file}: ${problems.length} problem(s)`); for (const p of problems) console.log('  - ' + p); process.exit(1); }
console.log(`${lesson.id}: ok — ${n} goals${(lesson.goals || []).some(g => g.closer) ? ' + closer' : ''}, ${lesson.kind || 'lesson'}${lesson.state ? `, ${lesson.state.before} → ${lesson.state.after || 'seeded'}` : ''}`);
