// One generic test over every lesson in the catalogue: the format validates, no goal requires a
// concept that neither this lesson nor its prerequisites teach, and replaying the reference
// solution through the engine lands every goal and every end-state check. Then the runner's
// contract (key window, end states, clock), each guided hint replayed goal by goal, the lesson
// validator on malformed input, negative replays per lesson, and guest progress on corrupt storage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, LESSONS, LESSONS_BY_ID, sectionsOf } from '../content/index.js';
import { validateLesson, availableConcepts } from '../content/schema.js';
import { LessonRun, shortcutsUsed } from '../app/runner.js';

const byId = id => { const l = LESSONS_BY_ID[id]; assert.ok(l, `lesson ${id} is in the catalogue`); return l; };
const f01 = () => byId('foundations-01-active-cell'), f02 = () => byId('foundations-02-moving-around'), f03 = () => byId('foundations-03-selecting-ranges');
const f04 = () => byId('foundations-04-entering-data'), f05 = () => byId('foundations-05-editing-cells'), f06 = () => byId('foundations-06-ribbon-commands'), f07 = () => byId('foundations-07-dialog-boxes');
const fresh = (lesson, opts = {}) => new LessonRun(lesson, { now: () => 0, ...opts });

test('the catalogue is well formed', () => {
  assert.ok(CHAPTERS.length >= 1);
  const ids = LESSONS.map(l => l.id);
  assert.equal(new Set(ids).size, ids.length, 'lesson ids are unique');
  const foundations = CHAPTERS.find(c => c.id === 'foundations');
  assert.ok(foundations.lessons.length >= 5 && foundations.lessons.length <= 8, 'Foundations has 5–8 lessons');
  for (const l of LESSONS) for (const p of l.prerequisites) { assert.ok(LESSONS_BY_ID[p], `${l.id}: prerequisite ${p} exists`); assert.ok(ids.indexOf(p) < ids.indexOf(l.id), `${l.id}: prerequisite ${p} comes earlier`); }
});

test('every lesson sits in one of its chapter\'s sections, and the sections come out in chapter order', () => {
  for (const ch of CHAPTERS) {
    assert.ok(Array.isArray(ch.sections) && ch.sections.length, `${ch.id}: sections listed`);
    for (const l of ch.lessons) assert.ok(ch.sections.includes(l.section), `${l.id}: section "${l.section}" is one of ${ch.id}'s sections`);
    const groups = sectionsOf(ch);
    assert.deepEqual(groups.map(g => g.name), ch.sections.filter(n => ch.lessons.some(l => l.section === n)), `${ch.id}: grouped in section order, empty sections dropped`);
    assert.deepEqual(groups.flatMap(g => g.lessons.map(l => l.id)), ch.lessons.filter(l => ch.sections.includes(l.section)).sort((a, b) => ch.sections.indexOf(a.section) - ch.sections.indexOf(b.section) || ch.lessons.indexOf(a) - ch.lessons.indexOf(b)).map(l => l.id));
  }
  assert.deepEqual(sectionsOf({ sections: ['A'], lessons: [{ id: 'x' }, { id: 'y', section: 'A' }] }).map(g => [g.name, g.lessons.map(l => l.id)]), [['A', ['y']], ['Basics', ['x']]], 'a lesson without a section falls into Basics after the listed sections');
});

// The Read standard (SITE_SPEC §1: short sentences, direct, never cutesy): every paragraph of a
// teach step is one or two sentences and stays short; the whole Read fits in a glance.
const sentences = p => (p.match(/[.!?](\s|$)/g) || []).length;
test('every Read paragraph is one or two short sentences', () => {
  for (const l of LESSONS) for (const st of l.steps) if (st.mode === 'teach') {
    assert.ok(st.body.length >= 2 && st.body.length <= 5, `${l.id}: Read has 2–5 paragraphs (${st.body.length})`);
    for (const p of st.body) {
      const n = sentences(p);
      assert.ok(n >= 1 && n <= 2, `${l.id}: "${p.slice(0, 40)}…" has ${n} sentences`);
      assert.ok(p.split(/\s+/).length <= 40, `${l.id}: "${p.slice(0, 40)}…" is over 40 words`);
      assert.ok(!/!\s*$/.test(p) && !/\b(awesome|super|easy peasy|magic|wow)\b/i.test(p), `${l.id}: tone`);
    }
  }
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

/* ---------------- guided hints: each is the complete route from the previous goal's end state ---------------- */

/** A hint as a keystroke script: glyphs → key names, '×N' repeats the key before it, connectives dropped, quoted text kept. */
function hintScript(hint) {
  const out = [];
  for (const t of hint.match(/"[^"]*"|\S+/g) || []) {
    if (/^(then|…|,|and|or)$/.test(t)) continue;
    const m = /^×(\d+)$/.exec(t);
    if (m) { assert.ok(out.length, `"${hint}": ×N needs a key before it`); const last = out[out.length - 1]; for (let i = 1; i < +m[1]; i++) out.push(last); continue; }
    out.push(t.startsWith('"') ? t : t.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/⌫/g, 'Backspace').replace(/↵/g, 'Enter'));
  }
  return out.join(' ');
}

test('hintScript turns a hint into a replayable script', () => {
  assert.equal(hintScript('→ ↓ ×5 Shift+→ then Alt H B O'), 'Right Down Down Down Down Down Shift+Right Alt H B O');
  assert.equal(hintScript('F2 ⌫ ×4 "port" Enter'), 'F2 Backspace Backspace Backspace Backspace "port" Enter');
  assert.equal(hintScript('↓ ↓ → Ctrl+Shift+↓ then Ctrl+1 N'), 'Down Down Right Ctrl+Shift+Down Ctrl+1 N');
});

for (const lesson of LESSONS) {
  test(`${lesson.id}: every guided hint lands exactly its goal from where the previous goal left off`, () => {
    const run = fresh(lesson);
    lesson.goals.forEach((g, i) => {
      assert.ok(typeof g.keys === 'string' && g.keys.trim(), `${lesson.id} goal ${g.id} has a guided hint`);
      run.run(hintScript(g.keys));
      assert.equal(run.doneCount, i + 1, `${lesson.id} goal ${g.id}: pressing exactly the hint "${g.keys}" should land this goal and no other (selection now ${run.sheet.selectionText()})`);
    });
    assert.ok(run.finished, `${lesson.id}: the hints, one after another, complete the lesson`);
  });
}

/* ---------------- runner contract ---------------- */

test('a run can be reset and goals latch in order', () => {
  const run = fresh(LESSONS[0]);
  run.run('Right Down Down');
  assert.equal(run.doneCount, 1);
  run.run('Ctrl+Home');
  assert.equal(run.doneCount, 1, 'an earlier goal does not un-latch');
  run.reset('solo');
  assert.equal(run.doneCount, 0); assert.equal(run.mode, 'solo'); assert.equal(run.sheet.selectionText(), 'A1');
  assert.equal(run.session.goalMark, 0, 'the key window restarts on reset');
});

test('#39 the key window: a mechanic goal reads only keys pressed since it became current', () => {
  // f05 goal 3 asks for F2: retyping the whole word after goals 1–2 must not pass on goal 1's F2
  let run = fresh(f05());
  run.run('F2 Backspace Backspace Backspace Backspace "port" Enter Right Down Down "1950" Enter Left');
  assert.equal(run.doneCount, 2);
  run.run('"Wednesday" Enter');
  assert.equal(run.doneCount, 2, 'retyping Wednesday without F2 does not land the F2 goal');
  assert.equal(run.finished, false);
  run.run('Up F2 Enter');
  assert.equal(run.doneCount, 3, 'F2 on the corrected cell (then Enter) lands it');
  // f02 goal 3 asks for Home: a Home pressed before the lesson began does not count
  run = fresh(f02());
  run.run('Home');
  run.run('Ctrl+Down Ctrl+Right');
  assert.equal(run.doneCount, 2);
  run.run('Left Left');
  assert.equal(run.doneCount, 2, 'arrowing back to A7 does not land the Home goal');
  run.run('Right Right Home');
  assert.equal(run.doneCount, 3);
  // f02 goal 5 asks for Ctrl+Home: a stray Ctrl+Home at the start does not count
  run = fresh(f02());
  run.run('Ctrl+Home Ctrl+Down Ctrl+Right Home Ctrl+End');
  assert.equal(run.doneCount, 4);
  run.run('Up Up Up Up Up Up Up Up Up Left Left');
  assert.equal(run.sheet.selectionText(), 'A1');
  assert.equal(run.doneCount, 4, 'arrowing to A1 does not land the Ctrl+Home goal');
  run.run('Ctrl+Home');
  assert.equal(run.doneCount, 5);
  run.run('Down Right');
  assert.equal(run.sheet.selectionText(), 'B2');
  assert.equal(run.doneCount, 5, 'arrowing to B2 does not land the Enter + Tab goal');
  run.run('Up Left Enter Tab');
  assert.ok(run.finished);
  // f03 goal 2 asks for a single Ctrl+Shift+↓: one pressed for goal 1 does not carry over
  run = fresh(f03());
  run.run('Right Down Down Ctrl+Shift+Down');
  assert.equal(run.doneCount, 1);
  run.run('Right Shift+Down Shift+Down Shift+Down Shift+Down');
  assert.equal(run.sheet.selectionText(), 'C3:C7');
  assert.equal(run.doneCount, 1, 'four Shift+↓ presses do not land the Ctrl+Shift+↓ goal');
  run.run('Up Down Ctrl+Shift+Down');   // an arrow collapses to the anchor C3: C2, then back to C3
  assert.equal(run.sheet.selectionText(), 'C3:C7'); assert.equal(run.doneCount, 2);
});

test('#39 goalMark advances past the key that landed each goal', () => {
  const run = fresh(f01());
  run.run('Right Down Down');
  assert.equal(run.session.goalMark, 3);
  assert.deepEqual(run.session.keyLog.slice(run.session.goalMark), []);
});

test('#40 lesson 7: Currency must be applied from a Format Cells card opened with Alt H O E', () => {
  const setup = 'Down Down Right Ctrl+Shift+Down Ctrl+1 N Right Ctrl+Shift+Down Ctrl+1 P Left Ctrl+Down';
  let run = fresh(f07()); run.run(setup); assert.equal(run.doneCount, 2);
  run.run('Ctrl+1 O C');                      // Ctrl+1 route; the card ignores O but it is logged
  assert.equal(run.sheet.cellAt('B8').fmtStyle, 'currency'); assert.equal(run.doneCount, 2);
  run.run('Alt H E');                         // the Clear menu logs an E
  assert.equal(run.finished, false, 'Alt H O E was never walked'); assert.equal(run.doneCount, 2);
  run.run('Escape Escape Escape');
  for (const wrong of ['Alt H O C E Escape Escape Escape Ctrl+1 C', 'Alt H E Escape Escape Escape Alt H O Escape Escape Escape Ctrl+1 C', 'Alt H O E Escape Escape Escape Ctrl+1 C']) {
    run = fresh(f07()); run.run(setup); run.run(wrong);
    assert.equal(run.doneCount, 2, `"${wrong}" does not count as the Ribbon route`);
  }
  run = fresh(f07()); run.run(setup); run.run('Alt H O E C');
  assert.ok(run.finished, 'Alt H O E C completes the lesson');
  run = fresh(f07()); run.run(setup); run.run('Alt O E C');
  assert.ok(run.finished, 'the legacy Alt O E route Excel still honours is accepted');
  run = fresh(f07()); run.run(setup); run.run('Alt H O E Q Enter C');
  assert.ok(run.finished, 'a stray key the card ignores does not break the route');
  run = fresh(f07()); run.run(setup); run.run('Alt H O E C');
  assert.ok(run.finished);
});

test('#38 / #69 a failing end state is surfaced as the pending item instead of a silent dead end', () => {
  // values changed: every goal ticks, the value guard fails, and `current` points at it
  let run = fresh(f07());
  run.run('Down Down Right Ctrl+Shift+Down Ctrl+1 N Right Ctrl+Shift+Down Ctrl+1 P Left Ctrl+Down');
  run.run('C Enter');                          // a stray C typed into B8 before opening the dialog box
  run.run('Up Alt H O E C');
  assert.equal(run.doneCount, 3); assert.equal(run.finished, false);
  const ends = run.endStates();
  assert.equal(ends.length, 3); assert.equal(ends[0].ok, false); assert.equal(ends[0].text, 'The values themselves are unchanged');
  assert.ok(run.current, 'current is not undefined once every goal has landed');
  assert.equal(run.current.text, ends[0].text);
  assert.deepEqual(run.goalStates().map(g => g.current), [false, false, false]);
  run.run('"6355" Enter');
  assert.ok(run.finished, 'restoring the value completes the lesson'); assert.equal(run.current, null);
  // formats undone after their tick: the end state keeps the lesson open until they are back
  run = fresh(f07());
  run.run('Down Down Right Ctrl+Shift+Down Ctrl+1 N Ctrl+Z');
  run.run('Right Ctrl+Shift+Down Ctrl+1 P Ctrl+Z');
  run.run('Left Ctrl+Down Alt H O E C');
  assert.equal(run.doneCount, 3); assert.equal(run.finished, false, 'the Number and Percentage formats are gone');
  assert.equal(run.current.text, 'B3:B7 still show the Number format');
  assert.deepEqual(run.endStates().map(e => e.ok), [true, false, false]);
  run.run('Up Shift+Up Shift+Up Shift+Up Shift+Up Ctrl+1 N');   // B3:B7 back to Number (B8 stays Currency)
  assert.equal(run.sheet.cellAt('B8').fmtStyle, 'currency');
  assert.equal(run.current.text, 'C3:C7 still show the Percentage format');
  run.run('Right Shift+Up Shift+Up Shift+Up Shift+Up Ctrl+1 P');   // Right collapses to the anchor B7, so this is C3:C7
  assert.ok(run.finished, 'reapplying both formats completes the lesson');
  assert.equal(run.sheet.cellAt('B8').fmtStyle, 'currency');
  // lesson 6 restates its formats the same way
  run = fresh(f06());
  run.run('Alt H 1 Ctrl+Z Down Shift+Right Shift+Right Alt H 1 Right Down Down Down Down Down Shift+Right Alt H B O Up Up Up Up Up Shift+Right Alt H A C');
  assert.equal(run.doneCount, 4); assert.equal(run.finished, false);
  assert.equal(run.current.text, 'The title and the headers are still bold');
  run.run('Ctrl+Home Ctrl+B');
  assert.ok(run.finished);
});

test('#41 the lesson clock is the engine clock: keys that do nothing do not start it', () => {
  let t = 1000;
  for (const ev of [{ key: 'Escape' }, { key: '0', ctrlKey: true }, { key: 'k', ctrlKey: true }]) {
    const r = new LessonRun(f01(), { mode: 'timed', now: () => t });
    t = 1000; r.key(ev); t = 6000;
    assert.equal(r.startedAt, null, `${JSON.stringify(ev)} does not start the clock`); assert.equal(r.elapsed, 0);
    assert.equal(r.session.t0, null);
  }
  const r = new LessonRun(f01(), { mode: 'timed', now: () => t });
  t = 1000; r.key({ key: 'Escape' }); t = 6000; r.key({ key: 'ArrowRight' }); t = 8000;
  assert.equal(r.startedAt, 6000); assert.equal(r.elapsed, 2); assert.equal(r.startedAt, r.session.t0);
  r.reset();
  assert.equal(r.startedAt, null); assert.equal(r.elapsed, 0);
});

/* ---------------- lesson 4: committed entries ---------------- */

test('lesson 4: clearing the draft must be committed, entering 40 must be confirmed with Tab', () => {
  const upTo2 = '"Weekly Sales Report" Enter Right Down "1200" Enter "950" Enter "1430" Enter "1100" Enter "1675" Enter';
  // units-tab: an Enter commit then arrowing onto D3 is not a Tab commit
  let run = fresh(f04()); run.run(upTo2); assert.equal(run.doneCount, 2);
  run.run('Right Up Up Up Up Up "40" Enter Up Right');
  assert.equal(run.sheet.value('C3'), 40); assert.equal(run.sheet.selectionText(), 'D3');
  assert.equal(run.doneCount, 2, 'C3 holds 40 and the active cell is D3, but Tab never confirmed it');
  run.run('Left "40" Tab');
  assert.equal(run.doneCount, 3, 'typing 40 on C3 and pressing Tab lands it');
  // a Tab that merely moves off C3 (no entry) is not enough either
  run = fresh(f04()); run.run(upTo2); run.run('Right Up Up Up Up Up "40" Enter Up Tab');
  assert.equal(run.sheet.selectionText(), 'D3'); assert.equal(run.doneCount, 2, 'Tab from C3 without an entry in progress is not a Tab commit');
  // any order: Units entered with Tab before the Sales still count when the goal comes up
  run = fresh(f04());
  run.run('"Weekly Sales Report" Enter Right Right Down "40" Tab');
  assert.equal(run.sheet.value('C3'), 40); assert.equal(run.doneCount, 1);
  run.run('Left Left "1200" Enter "950" Enter "1430" Enter "1100" Enter "1675" Enter');
  assert.equal(run.doneCount, 3, 'goals 2 and 3 land together: the Tab commit on C3 is read from the whole log');
  // clear-draft: a pending edit on B8 is not a committed clear
  run.run('Right Up Up Up Up Up "40" Tab');   // no-op for goals; keep going from C3
  run.run('Left Left Down Down Down Down Down');
  assert.equal(run.sheet.selectionText(), 'B8'); assert.equal(run.doneCount, 3);
  run.run('"x"');
  assert.equal(run.session.editing, true); assert.equal(run.doneCount, 3, 'typing over B8 has not cleared it');
  run.run('Escape Backspace');
  assert.equal(run.session.editing, true); assert.equal(run.doneCount, 3, 'Backspace opens an edit: nothing is committed yet');
  run.run('Escape Delete');
  assert.equal(run.sheet.value('B8'), null); assert.equal(run.session.editing, false);
  assert.ok(run.finished, 'Delete clears B8 at once');
});

/* ---------------- the validator ---------------- */

test('#67 validateLesson instantiates the starting sheet and probes every check', () => {
  const base = f01();
  const throwing = { ...base, goals: [{ ...base.goals[0], check: s => s.nope.x }] };
  assert.ok(validateLesson(throwing).some(e => /goal to-b3: check throws on the starting sheet/.test(e)), 'a throwing check is reported');
  const presolved = { ...base, goals: [base.goals[2], base.goals[0], base.goals[1]] };   // 'to-a1' first; the sheet starts on A1
  assert.ok(validateLesson(presolved).some(e => /goal to-a1: already satisfied by the starting sheet/.test(e)), 'a pre-satisfied first goal is reported');
  const bad = { ...base, sheet: { cells: { Monday: { value: 1 } }, active: { r: 1, c: 1 } } };
  assert.ok(validateLesson(bad).some(e => /bad cell key "Monday"/.test(e)), 'a bad cell key is reported');
  const off = { ...base, sheet: { cells: {}, active: { r: 99, c: 99 } } };
  assert.ok(validateLesson(off).some(e => /active .* is outside the 20×10 grid/.test(e)), 'an active cell outside the grid is reported');
  const badEnd = { ...base, endState: [{ text: 'boom', check: () => { throw new Error('no'); } }] };
  assert.ok(validateLesson(badEnd).some(e => /endState "boom": check throws/.test(e)), 'a throwing endState check is reported');
  // later goals may hold at the start: f01's 'to-a1' is gated behind the first two and validates clean
  assert.deepEqual(validateLesson(base), []);
});

test('#68 validateLesson returns problems instead of throwing on malformed input', () => {
  const base = f01();
  const cases = [
    [{ steps: 'teach' }, /steps missing/], [{ steps: {} }, /steps missing/], [{ goals: {} }, /goals missing/],
    [{ endState: {} }, /endState must be an array/], [{ concepts: 'active-cell' }, /concepts must list what the lesson teaches/],
    [{ sheet: 'nope' }, /sheet \(starting sheet\) missing/], [{ sheet: { cells: { A1: 'x' } } }, /cell A1 must be a record/],
  ];
  for (const [patch, rx] of cases) {
    let errs;
    assert.doesNotThrow(() => { errs = validateLesson({ ...base, ...patch }); }, `${JSON.stringify(patch)} does not throw`);
    assert.ok(Array.isArray(errs) && errs.length > 0, `${JSON.stringify(patch)} reports a problem`);
    assert.ok(errs.some(e => rx.test(e)), `${JSON.stringify(patch)} reports ${rx}: ${errs.join('; ')}`);
  }
  assert.equal(validateLesson({ ...base, concepts: 'active-cell' }).length, 1, 'a string concepts field is one problem, not one per character');
  assert.deepEqual(validateLesson(null), ['lesson must be an object']);
});

/* ---------------- guest progress on corrupt storage ---------------- */

test('#65 / #66 progress.js survives corrupt localStorage shapes', async () => {
  const store = {};
  globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  try {
    const { progress } = await import('../app/progress.js');
    const ID = 'foundations-01-active-cell';
    for (const raw of ['{"lessons":"corrupt"}', '{"lessons":1}', '{"lessons":[]}', '[]', 'null', '"x"', '{',
      `{"lessons":{"${ID}":"done"}}`, `{"lessons":{"${ID}":true}}`, `{"lessons":{"${ID}":5}}`, `{"lessons":{"${ID}":null}}`, `{"lessons":{"${ID}":[]}}`]) {
      store.hk2_progress_v1 = raw;
      assert.equal(progress.status(ID), 'todo', `${raw}: status`);
      assert.doesNotThrow(() => progress.touch(ID), `${raw}: touch`);
      assert.equal(progress.status(ID), 'started', `${raw}: touch wrote a fresh entry`);
      store.hk2_progress_v1 = raw;
      assert.doesNotThrow(() => progress.record(ID, 'guided', 3), `${raw}: record`);
      assert.equal(progress.status(ID), 'done', `${raw}: record wrote a fresh entry`);
      assert.doesNotThrow(() => Object.values(progress.all()).filter(p => p.completed).length, `${raw}: all() is safe to filter`);
    }
    store.hk2_progress_v1 = `{"lessons":{"${ID}":null,"foundations-02-moving-around":{"completed":true}}}`;
    assert.equal(Object.values(progress.all()).filter(p => p.completed).length, 1, 'a null entry is dropped, not counted');
    // a corrupt best is replaced by a real timed time; a good best is only lowered
    for (const best of ['"abc"', '{"x":1}', '"5"', '-1', 'null', 'Infinity']) {
      store.hk2_progress_v1 = `{"lessons":{"${ID}":{"completed":true,"timed":true,"best":${best},"at":1}}}`.replace('Infinity', '1e999');
      progress.record(ID, 'timed', 9.5);
      assert.equal(progress.get(ID).best, 9.5, `best ${best} is replaced by 9.5`);
    }
    progress.record(ID, 'timed', 12);
    assert.equal(progress.get(ID).best, 9.5, 'a slower run does not replace the best');
    progress.record(ID, 'timed', 7.257);
    assert.equal(progress.get(ID).best, 7.26);
    progress.record(ID, 'timed', NaN);
    assert.equal(progress.get(ID).best, 7.26, 'a non-finite time never becomes the best');
    assert.equal(progress.status(ID), 'mastered');
    // a broken storage API cannot throw out of record()/touch()
    globalThis.localStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } };
    assert.equal(progress.record(ID, 'guided', 1), false); assert.equal(progress.touch(ID), false); assert.equal(progress.status(ID), 'todo');
    assert.doesNotThrow(() => progress.clear());
  } finally { delete globalThis.localStorage; }
});

/* ---------------- Phase A: mouse recording, the shortcuts-used fold, clean timed PBs ---------------- */

test('shortcutsUsed folds an Alt walk into one entry and drops typed characters', () => {
  const log = ['Ctrl+↓', 'Alt', 'H', '1', 'W', 'e', 'e', 'k', '↵', 'Alt', 'H', 'B', 'O', 'Esc', '↓', '↓', 'F2', '⌫', '⚠', 'Tab', 'Ctrl+↓'].map(k => ({ k }));
  assert.deepEqual(shortcutsUsed(log), [
    { keys: 'Ctrl+↓', count: 2 }, { keys: 'Alt H 1', count: 1 }, { keys: '↵', count: 1 }, { keys: 'Alt H B O', count: 1 },
    { keys: 'Esc', count: 1 }, { keys: '↓', count: 2 }, { keys: 'F2', count: 1 }, { keys: '⌫', count: 1 }, { keys: 'Tab', count: 1 },
  ]);
  assert.deepEqual(shortcutsUsed([]), []);
  assert.deepEqual(shortcutsUsed([{ k: 'Alt' }]), [{ keys: 'Alt', count: 1 }], 'a bare Alt at the end still shows');
});

test('a change made without a key (a mouse click on the sheet) is graded, and the mouse callback reaches the session', () => {
  const seen = [];
  const run = fresh(f01(), { onMouse: w => seen.push(w) });
  // the view records a click by calling the session option; the sheet change itself grades the goal
  run.session.opts.onMouse('cell');
  run.sheet.goTo(3, 2);   // B3 by mouse
  assert.equal(run.doneCount, 1, 'the first goal (make B3 active) landed without a key');
  assert.deepEqual(seen, ['cell']);
  run.session.mouse = { count: 1, log: [] };
  assert.equal(run.mouseCount, 1);
  run.pressSpec('Right'); run.pressSpec('Down'); run.pressSpec('Down'); run.pressSpec('Down'); run.pressSpec('Down');
  assert.equal(run.doneCount, 2, 'keys still grade');
});

test('#PB a timed run sets a personal best only when clean (no help, no mouse)', async () => {
  const store = new Map();
  globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
  try {
    const { progress } = await import('../app/progress.js?pb');
    progress.clear();
    assert.equal(progress.record('x', 'timed', 12.34, { clean: false }), true);
    assert.equal(progress.get('x').best, undefined, 'no PB for an assisted run');
    progress.record('x', 'timed', 12.34);
    assert.equal(progress.get('x').best, 12.34, 'a clean run (default) sets it');
    progress.record('x', 'timed', 9.5, { clean: true });
    assert.equal(progress.get('x').best, 9.5);
    progress.record('x', 'timed', 5, { clean: false });
    assert.equal(progress.get('x').best, 9.5, 'a faster assisted run does not beat it');
  } finally { delete globalThis.localStorage; }
});
