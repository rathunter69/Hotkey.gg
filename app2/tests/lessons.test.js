// One generic test over every lesson in the catalogue: the format validates, no goal requires a
// concept that neither this lesson nor its prerequisites teach, and replaying the reference
// solution through the engine lands every goal and every end-state check. Then the runner's
// contract (key window, end states, clock), each guided hint replayed goal by goal, the lesson
// validator on malformed input, negative replays per lesson, and guest progress on corrupt storage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, LESSONS, LESSONS_BY_ID, sectionsOf, sectionNames } from '../content/index.js';
import { validateLesson, availableConcepts, sentenceCount, goalBounds, countedGoals } from '../content/schema.js';
import { LessonRun, shortcutsUsed } from '../app/runner.js';
import { hintScript, hintTokens, goToOffence, arrowGrind, anchorBefore } from './hint-rules.js';

const byId = id => { const l = LESSONS_BY_ID[id]; assert.ok(l, `lesson ${id} is in the catalogue`); return l; };
const fresh = (lesson, opts = {}) => new LessonRun(lesson, { now: () => 0, ...opts });

/* ---------------- runner fixtures ----------------
   Small inline lessons in the legacy (non-module) shape: a tiny `sheet: { cells }`, sequential
   goals, a solution. The runner contract tests below (key window, goalMark, end states, the clock,
   reset, demo goals, ghost, mouse grading, the validator's probing) run against these, not against
   catalogue content, so the catalogue can move without the runner tests moving with it. */
const REPORT = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};
const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const sel = (sheet, ref) => sheet.selectionText() === ref;
const wholeRow = (sheet, r) => { const g = sheet.selRange(); return !!sheet.sel && g.r1 === r && g.r2 === r && g.c1 === 1 && g.c2 === sheet.cols; };
/** The key was pressed since the current goal became current (the runner's key window). */
const used = (session, label) => session.keyLog.slice(session.goalMark || 0).some(e => e.k === label);
const cell = (s, ref) => s.cellAt(ref);
const base = (id, title, over) => ({ id, chapter: 'foundations', section: 'Fixtures', title, difficulty: 'easy', tags: ['fixture'], access: 'free', prerequisites: [], par: 20, ...over });

/** f01: the active cell — three navigation goals on the arrow keys. */
const f01 = () => base('fx-active-cell', 'The active cell', {
  concepts: ['arrow-keys', 'cell-reference'],
  read: 'One of the cells is always the active cell. In this lesson you move it around the report with the arrow keys.',
  sheet: { cells: REPORT, active: { r: 1, c: 1 } },
  goals: [
    { id: 'to-b3', teach: 'The arrow keys move the active cell one cell at a time.', text: 'Make B3, the Monday Sales of 1200, the active cell.', keys: '→ ↓ ↓', requires: ['arrow-keys', 'cell-reference'], check: s => at(s, 'B3') },
    { id: 'to-c7', text: 'Move to C7, the Units for Friday.', keys: '→ ↓ ↓ ↓ ↓', requires: ['arrow-keys', 'cell-reference'], check: s => at(s, 'C7') },
    { id: 'to-a1', text: 'Return to A1, the report title.', keys: '← ← ↑ ↑ ↑ ↑ ↑ ↑', requires: ['arrow-keys'], check: s => at(s, 'A1') },
  ],
  solution: 'Right Down Down Right Down Down Down Down Left Left Up Up Up Up Up Up',
});
/** f02: moving around — mechanic goals that read the key window (Ctrl+Arrow, Home, Ctrl+Home/End, Enter and Tab). */
const f02 = () => base('fx-moving-around', 'Moving around the worksheet', {
  concepts: ['ctrl-arrow', 'home-key', 'ctrl-home-end', 'enter-tab-move'],
  read: 'One arrow press moves one cell, which is slow on a real sheet. In this lesson you jump around the report with Ctrl, Home and End instead.',
  sheet: { cells: { ...REPORT, A10: { value: 'Prepared by' }, B10: { value: 'Sales team' } }, active: { r: 3, c: 1 } },
  goals: [
    { id: 'ctrl-down', teach: 'Ctrl+↓ jumps to the edge of the data.', text: 'Move from A3 (Monday) to A7 (Friday).', keys: 'Ctrl+↓', requires: ['ctrl-arrow'], check: (s, ses) => at(s, 'A7') && used(ses, 'Ctrl+↓') },
    { id: 'ctrl-right', text: 'Jump to C7, the last column of the Friday row.', keys: 'Ctrl+→', requires: ['ctrl-arrow'], check: (s, ses) => at(s, 'C7') && used(ses, 'Ctrl+→') },
    { id: 'home', teach: 'Home moves to column A of the current row.', text: 'Return to A7.', keys: 'Home', requires: ['home-key'], check: (s, ses) => at(s, 'A7') && used(ses, 'Home') },
    { id: 'ctrl-end', teach: 'Ctrl+End jumps to the last used cell, and Ctrl+Home goes back to A1.', text: 'Go to C10, the bottom-right corner of the used area.', keys: 'Ctrl+End', requires: ['ctrl-home-end'], check: (s, ses) => at(s, 'C10') && used(ses, 'Ctrl+End') },
    { id: 'ctrl-home', text: 'Return to A1.', keys: 'Ctrl+Home', requires: ['ctrl-home-end'], check: (s, ses) => at(s, 'A1') && used(ses, 'Ctrl+Home') },
    { id: 'enter-tab', teach: 'Enter moves down one row and Tab moves right one column, even with nothing typed.', text: 'Move to B2, the Sales header, with one Enter and one Tab.', keys: 'Enter Tab', requires: ['enter-tab-move'], check: (s, ses) => at(s, 'B2') && used(ses, '↵') && used(ses, 'Tab') },
  ],
  solution: 'Ctrl+Down Ctrl+Right Home Ctrl+End Ctrl+Home Enter Tab',
});
/** f03: selecting — a range by Shift+Arrow, one by Ctrl+Shift+Arrow (a mechanic goal), a whole row, the region. */
const f03 = () => base('fx-selecting-ranges', 'Selecting a range', {
  concepts: ['range', 'shift-arrow', 'ctrl-shift-arrow', 'row-col-select', 'ctrl-a'],
  read: 'Formatting, copying and formulas all start with a selection. In this lesson you select ranges of the report from the keyboard.',
  sheet: { cells: REPORT, active: { r: 1, c: 1 } },
  goals: [
    { id: 'b3-b7', teach: 'Shift+Arrow extends the selection one cell at a time from the active cell.', text: 'Select the Sales figures B3:B7.', keys: '→ ↓ ↓ then Shift+↓ ×4', requires: ['shift-arrow', 'range'], check: s => sel(s, 'B3:B7') },
    { id: 'c3-c7', teach: 'Ctrl+Shift+Arrow extends the selection to the edge of the data in one press.', text: 'Select the Units figures C3:C7 with a single press.', keys: '→ then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow'], check: (s, ses) => sel(s, 'C3:C7') && used(ses, 'Ctrl+Shift+↓') },
    { id: 'row-2', teach: 'Shift+Space selects the whole row.', text: 'Select the whole header row 2.', keys: '↑ then Shift+Space', requires: ['row-col-select'], check: s => wholeRow(s, 2) },
    { id: 'region', teach: 'Ctrl+A selects the current region.', text: 'Select the whole report, A1:C7.', keys: 'Ctrl+A', requires: ['ctrl-a'], check: s => sel(s, 'A1:C7') },
  ],
  solution: 'Right Down Down Shift+Down Shift+Down Shift+Down Shift+Down Right Ctrl+Shift+Down Up Shift+Space Ctrl+A',
});
/** f05: editing — F2 goals whose checks read the key window. */
const f05 = () => base('fx-editing-cells', 'Editing a cell', {
  concepts: ['replace-by-typing', 'edit-mode-f2', 'edit-caret', 'backspace'],
  read: 'Data is rarely right the first time. In this lesson you fix a misspelled title, a wrong figure and a misspelled day.',
  sheet: { cells: { ...REPORT, A1: { value: 'Weekly Sales Reprot', bold: true }, A5: { value: 'Wenesday' } }, active: { r: 1, c: 1 } },
  goals: [
    { id: 'fix-title', teach: 'F2 opens the cell for editing with the insertion point at the end, and Backspace deletes the character before it.', text: 'Fix the title in A1: change Reprot to Report.', keys: 'F2 ⌫ ×4 "port" Enter', requires: ['edit-mode-f2', 'backspace'], check: (s, ses) => s.value('A1') === 'Weekly Sales Report' && used(ses, 'F2') },
    { id: 'replace-b4', teach: 'To replace a cell, select it and type.', text: 'Replace the Tuesday Sales in B4 with 1950.', keys: '→ ↓ ↓ then "1950" Enter', requires: ['replace-by-typing'], check: s => s.value('B4') === 1950 },
    { id: 'fix-wednesday', teach: 'In Edit mode ← and → move the insertion point.', text: 'Correct Wenesday in A5 to Wednesday by inserting the missing d.', keys: '← then F2 ← ×6 "d" Enter', requires: ['edit-mode-f2', 'edit-caret'], check: (s, ses) => s.value('A5') === 'Wednesday' && used(ses, 'F2') },
  ],
  solution: 'F2 Backspace Backspace Backspace Backspace "port" Enter Right Down Down "1950" Enter Left F2 Left Left Left Left Left Left "d" Enter',
});
/** f06: Ribbon formatting with latching goals restated as end states (a value guard, bold, a border, alignment). */
const f06 = () => {
  const START = Object.fromEntries(Object.entries({ ...REPORT, A8: { value: 'Total' }, B8: { value: 6355 }, C8: { value: 209 } }).map(([k, v]) => [k, { value: v.value }]));
  return base('fx-ribbon-commands', 'The Ribbon: tabs and commands', {
    concepts: ['keytips', 'home-tab', 'bold-command', 'borders-menu', 'align-command'],
    read: 'The Ribbon holds every command in Excel, and Alt lets you reach any of them from the keyboard. In this lesson you format the report with KeyTips.',
    sheet: { cells: START, active: { r: 1, c: 1 } },
    goals: [
      { id: 'bold-title', teach: 'Alt shows a KeyTip on every tab, H opens Home, and Alt, H, 1 is Bold.', text: 'Make the title Weekly Sales Report bold.', keys: 'Alt H 1', requires: ['keytips', 'home-tab', 'bold-command'], check: s => cell(s, 'A1').bold === true },
      { id: 'bold-headers', text: 'Select the headers Day, Sales and Units (A2:C2) and make them bold.', keys: '↓ Shift+→ Shift+→ then Alt H 1', requires: ['bold-command'], check: s => ['A2', 'B2', 'C2'].every(r => cell(s, r).bold === true) },
      { id: 'border-friday', teach: 'Alt, H, B opens Borders and O picks Bottom Border.', text: 'Put a bottom border under the Friday figures B7:C7.', keys: '→ ↓ ×5 Shift+→ then Alt H B O', requires: ['borders-menu'], check: s => cell(s, 'B7').bb === true && cell(s, 'C7').bb === true },
      { id: 'center-headers', teach: 'Alt, H, A, C centers the selection.', text: 'Center the Sales and Units headers (B2:C2).', keys: '↑ ×5 Shift+→ then Alt H A C', requires: ['align-command'], check: s => cell(s, 'B2').align === 'c' && cell(s, 'C2').align === 'c' },
    ],
    endState: [
      { text: 'The values themselves are unchanged', check: s => Object.keys(START).every(k => s.value(k) === START[k].value) },
      { text: 'The title and the headers are still bold', check: s => ['A1', 'A2', 'B2', 'C2'].every(r => cell(s, r).bold === true) },
      { text: 'The bottom border under B7:C7 is still in place', check: s => ['B7', 'C7'].every(r => cell(s, r).bb === true) },
      { text: 'The Sales and Units headers are still centered', check: s => ['B2', 'C2'].every(r => cell(s, r).align === 'c') },
    ],
    solution: 'Alt H 1 Down Shift+Right Shift+Right Alt H 1 Right Down Down Down Down Down Shift+Right Alt H B O Up Up Up Up Up Shift+Right Alt H A C',
  });
};
/** f08: a demo goal the platform plays first, then the learner's own goal. */
const f08 = () => base('fx-demo', 'Watch, then do', {
  concepts: ['ctrl-arrow', 'arrow-keys'],
  read: 'First the platform shows the slow way down the list. Then you take the fast way back up.',
  sheet: { cells: REPORT, active: { r: 3, c: 1 } },
  goals: [
    { id: 'watch-crawl', demo: { script: 'Down Down Down Down Down Down Down Down Down Down', cadence: 120 }, teach: 'Ten arrow presses crawl one cell at a time.', text: 'Watch the active cell crawl down column A one row at a time.', requires: ['arrow-keys'], check: (s, ses) => ses.demoDone.has('watch-crawl') },
    { id: 'ctrl-up', teach: 'Ctrl+↑ jumps to the top of the data in one press.', text: 'Jump back to A7, the last day, with one press.', keys: 'Ctrl+↑', requires: ['ctrl-arrow'], check: (s, ses) => at(s, 'A7') && used(ses, 'Ctrl+↑') },
  ],
  solution: 'Ctrl+Up',
});

test('the runner fixtures validate as lessons and their solutions replay', () => {
  for (const f of [f01, f02, f03, f05, f06, f08]) {
    const lesson = f();
    assert.deepEqual(validateLesson(lesson), [], lesson.id);
    const run = fresh(lesson); run.run(lesson.solution);
    assert.ok(run.finished, `${lesson.id}: the solution finishes`);
  }
});

test('the catalogue is well formed', () => {
  assert.ok(CHAPTERS.length >= 1);
  const ids = LESSONS.map(l => l.id);
  assert.equal(new Set(ids).size, ids.length, 'lesson ids are unique');
  const foundations = CHAPTERS.find(c => c.id === 'foundations');
  assert.ok(foundations.lessons.length >= 5, 'Foundations has at least the first slice of lessons');
  for (const l of LESSONS) for (const p of l.prerequisites) { assert.ok(LESSONS_BY_ID[p], `${l.id}: prerequisite ${p} exists`); assert.ok(ids.indexOf(p) < ids.indexOf(l.id), `${l.id}: prerequisite ${p} comes earlier`); }
});

test('every lesson sits in one of its chapter\'s sections; the catalogue lists every section in order, empty ones as upcoming', () => {
  for (const ch of CHAPTERS) {
    const names = sectionNames(ch);
    assert.ok(names.length, `${ch.id}: sections listed`);
    for (const l of ch.lessons) assert.ok(names.includes(l.section), `${l.id}: section "${l.section}" is one of ${ch.id}'s sections`);
    const groups = sectionsOf(ch);
    assert.deepEqual(groups.map(g => g.name), names, `${ch.id}: every section comes out, in chapter order`);
    for (const g of groups) assert.ok(typeof g.blurb === 'string', `${ch.id} › ${g.name}: has a blurb string`);
    assert.deepEqual(groups.flatMap(g => g.lessons.map(l => l.id)), ch.lessons.slice().sort((a, b) => names.indexOf(a.section) - names.indexOf(b.section) || ch.lessons.indexOf(a) - ch.lessons.indexOf(b)).map(l => l.id));
  }
  const foundations = CHAPTERS.find(c => c.id === 'foundations');
  assert.equal(sectionNames(foundations).length, 8, 'Chapter 1: the seven authored modules plus Project and assessment (the legacy sections are gone)');
  assert.ok(sectionsOf(foundations).every(g => g.lessons.length > 0), 'every Chapter 1 section has lessons (the chapter is complete)');
  assert.equal(sectionsOf({ sections: [{ name: 'Soon', blurb: 'arrives later' }], lessons: [] })[0].blurb, 'arrives later', 'an upcoming (empty) section still carries its blurb');
  assert.deepEqual(sectionsOf({ sections: ['A'], lessons: [{ id: 'x' }, { id: 'y', section: 'A' }] }).map(g => [g.name, g.lessons.map(l => l.id)]), [['A', ['y']], ['Basics', ['x']]], 'a lesson without a section falls into Basics after the listed sections');
});

// The adaptive format (SITE_SPEC §4): the Read is two or three sentences in total; every goal is one
// action sentence; the goal that first uses a concept the lesson teaches carries a one-line teaching
// point and a reuse goal carries none. validateLesson enforces it; this pins the rule with examples.
test('the adaptive lesson format is enforced', () => {
  const base = f02();
  assert.deepEqual(validateLesson(base), []);
  const readLong = { ...base, read: 'One. Two. Three. Four.' };
  assert.ok(validateLesson(readLong).some(e => /read must be two or three sentences \(it has 4\)/.test(e)));
  const readShort = { ...base, read: 'Just one sentence.' };
  assert.ok(validateLesson(readShort).some(e => /read must be two or three sentences/.test(e)));
  const noTeach = { ...base, goals: base.goals.map((g, i) => (i === 0 ? { ...g, teach: undefined } : g)) };
  assert.ok(validateLesson(noTeach).some(e => /goal ctrl-down: introduces ctrl-arrow and needs a one-line teach/.test(e)));
  const extraTeach = { ...base, goals: base.goals.map((g, i) => (i === 1 ? { ...g, teach: 'Ctrl+→ jumps right.' } : g)) };
  assert.ok(validateLesson(extraTeach).some(e => /goal ctrl-right: reuses taught concepts only/.test(e)));
  const twoSentences = { ...base, goals: base.goals.map((g, i) => (i === 0 ? { ...g, text: 'Move down. Then stop.' } : g)) };
  assert.ok(validateLesson(twoSentences).some(e => /goal ctrl-down: the action must be one sentence/.test(e)));
  const noStop = { ...base, goals: base.goals.map((g, i) => (i === 0 ? { ...g, teach: 'Ctrl+↓ jumps to the edge of the data' } : g)) };
  assert.ok(validateLesson(noStop).some(e => /goal ctrl-down: teach must be one sentence ending in a full stop/.test(e)));
  assert.equal(sentenceCount('Numbers like 1,200.00 and 5.0% are not sentence ends. This is the second.'), 2);
  for (const l of LESSONS) {
    assert.ok(!/\b(awesome|super|easy peasy|magic|wow|gonna|kinda)\b/i.test(l.read + l.goals.map(g => (g.teach || '') + g.text).join(' ')), `${l.id}: tone`);
    const b = goalBounds(l.kind, typeof l.module === 'string');
    const n = countedGoals(l.goals).length;
    assert.ok(n >= b.min && n <= b.max, `${l.id}: ${b.min}-${b.max} goals for kind ${l.kind || 'lesson'} (has ${n} plus ${l.goals.length - n} closer)`);
  }
});

for (const lesson of LESSONS) {
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
  });
}

/* ---------------- guided hints: each is the complete route from the previous goal's end state ---------------- */


test('hintScript turns a hint into a replayable script', () => {
  assert.equal(hintScript('→ ↓ ×5 Shift+→ then Alt H B O'), 'Right Down Down Down Down Down Shift+Right Alt H B O');
  assert.equal(hintScript('F2 ⌫ ×4 "port" Enter'), 'F2 Backspace Backspace Backspace Backspace "port" Enter');
  assert.equal(hintScript('↓ ↓ → Ctrl+Shift+↓ then Ctrl+1 N'), 'Down Down Right Ctrl+Shift+Down Ctrl+1 N');
});

for (const lesson of LESSONS) {
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

/* ---------------- runner contract ---------------- */

test('a run can be reset and goals latch in order', () => {
  const run = fresh(f01());
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

test('#38 / #69 a failing end state is surfaced as the pending item instead of a silent dead end', () => {
  // a value changed: every goal ticks, the value guard fails, and `current` points at it
  let run = fresh(f06());
  run.run('Alt H 1 Down Shift+Right Shift+Right Alt H 1 Right Down Down Down Down Down Shift+Right Alt H B O');
  run.run('Down "6000" Enter');                 // B8's Total retyped: a value the lesson never asked to change
  run.run('Up Up Up Up Up Up Up Shift+Right Alt H A C');   // B2:C2 centered: the last goal lands
  assert.equal(run.doneCount, 4); assert.equal(run.finished, false);
  const ends = run.endStates();
  assert.equal(ends.length, 4); assert.equal(ends[0].ok, false); assert.equal(ends[0].text, 'The values themselves are unchanged');
  assert.ok(run.current, 'current is not undefined once every goal has landed');
  assert.equal(run.current.text, ends[0].text);
  assert.deepEqual(run.goalStates().map(g => g.current), [false, false, false, false]);
  run.run('Down Down Down Down Down Down "6355" Enter');
  assert.ok(run.finished, 'restoring the value completes the lesson'); assert.equal(run.current, null);
  // formats undone after their tick: the end state keeps the lesson open until they are back
  run = fresh(f06());
  run.run('Alt H 1 Ctrl+Z Down Shift+Right Shift+Right Alt H 1 Right Down Down Down Down Down Shift+Right Alt H B O Up Up Up Up Up Shift+Right Alt H A C');
  assert.equal(run.doneCount, 4); assert.equal(run.finished, false, 'the title\'s bold is gone');
  assert.equal(run.current.text, 'The title and the headers are still bold');
  assert.deepEqual(run.endStates().map(e => e.ok), [true, false, true, true]);
  run.run('Ctrl+Home Ctrl+B');
  assert.ok(run.finished, 'reapplying the format completes the lesson');
});

test('#41 the lesson clock is the engine clock: keys that do nothing do not start it', () => {
  let t = 1000;
  for (const ev of [{ key: 'Escape' }, { key: 'k', ctrlKey: true }]) {   // Ctrl+0 hides a column since phase C: it is real work and starts the clock
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

/* ---------------- the validator ---------------- */

test('#67 validateLesson instantiates the starting sheet and probes every check', () => {
  const base = f01();
  const throwing = { ...base, goals: [{ ...base.goals[0], check: s => s.nope.x }] };
  assert.ok(validateLesson(throwing).some(e => /goal to-b3: check throws on the starting sheet/.test(e)), 'a throwing check is reported');
  const presolved = { ...base, goals: [base.goals[2], base.goals[0], base.goals[1]] };   // 'to-a1' first; the sheet starts on A1
  assert.ok(validateLesson(presolved).some(e => /goal to-a1: already satisfied by the starting sheet/.test(e)), 'a pre-satisfied first goal is reported');
  const bad = { ...base, sheet: { cells: { Monday: { value: 1 } }, active: { r: 1, c: 1 } } };
  assert.ok(validateLesson(bad).some(e => /bad cell key "Monday"/.test(e)), 'a bad cell key is reported');
  const off = { ...base, sheet: { cells: {}, active: { r: 999, c: 99 } } };
  assert.ok(validateLesson(off).some(e => /active .* is outside the 100×26 grid/.test(e)), 'an active cell outside the grid is reported');
  const badEnd = { ...base, endState: [{ text: 'boom', check: () => { throw new Error('no'); } }] };
  assert.ok(validateLesson(badEnd).some(e => /endState "boom": check throws/.test(e)), 'a throwing endState check is reported');
  // later goals may hold at the start: f01's 'to-a1' is gated behind the first two and validates clean
  assert.deepEqual(validateLesson(base), []);
});

test('#68 validateLesson returns problems instead of throwing on malformed input', () => {
  const base = f01();
  const cases = [
    [{ read: 42 }, /read missing/], [{ par: 'fast' }, /par \(timed-mode seconds\) missing/], [{ goals: {} }, /goals missing/],
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
    const ID = 'inherited-workbook';
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
    store.hk2_progress_v1 = `{"lessons":{"${ID}":null,"ribbon-by-keyboard":{"completed":true}}}`;
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
    // chapter gates (#C5): chapterPass latches, chapter() reads, corrupt shapes normalise to {}
    for (const raw of ['{"chapters":"x"}', '{"chapters":[]}', '{"chapters":{"foundations":"yes"}}', '{"chapters":{"foundations":{"assessment":"maybe","other":1}}}', '{}']) {
      store.hk2_progress_v1 = raw;
      assert.deepEqual(progress.chapter('foundations'), raw.includes('"maybe"') ? { assessment: true } : {}, `${raw}: chapter() normalises`);
    }
    store.hk2_progress_v1 = '{}';
    assert.equal(progress.chapterPass('foundations', 'nonsense'), false, 'an unknown gate is refused');
    assert.ok(progress.chapterPass('foundations', 'testout'));
    assert.ok(progress.chapterPass('foundations', 'assessment'));
    assert.deepEqual(progress.chapter('foundations'), { testout: true, assessment: true });
    assert.deepEqual(progress.chapter('formatting'), {}, 'an unpassed chapter reads empty');
    progress.record(ID, 'guided', 3);
    assert.deepEqual(progress.chapter('foundations'), { testout: true, assessment: true }, 'a lesson record does not disturb the gates');
    // a broken storage API cannot throw out of record()/touch()
    globalThis.localStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } };
    assert.equal(progress.record(ID, 'guided', 1), false); assert.equal(progress.touch(ID), false); assert.equal(progress.status(ID), 'todo');
    assert.equal(progress.chapterPass('foundations', 'testout'), false, 'blocked storage: chapterPass reports failure');
    assert.deepEqual(progress.chapter('foundations'), {}, 'blocked storage: chapter() reads empty');
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

test('demo goals: the platform plays the script, the goal lands only when it has finished, and the split is timed', () => {
  const lesson = f08();
  const demos = lesson.goals.filter(g => g.demo);
  assert.equal(demos.length, 1);
  let t = 0;
  const run = new LessonRun(lesson, { mode: 'guided', now: () => (t += 100) });
  assert.equal(run.pendingDemo() && run.pendingDemo().id, demos[0].id, 'the first goal is a demo waiting to play');
  assert.equal(run.doneCount, 0);
  const steps = run.demoSteps(demos[0]);
  assert.ok(steps.length > 5, 'the demo has keys to press');
  for (const step of steps.slice(0, 3)) run.demoStep(step);
  assert.equal(run.doneCount, 0, 'a partly played demo has not landed');
  for (const step of steps.slice(3)) run.demoStep(step);
  assert.equal(run.doneCount, 0, 'every key pressed, but the goal waits for finishDemo');
  run.finishDemo(demos[0]);
  assert.equal(run.doneCount, 1, 'the demo goal lands when the demo finishes');
  assert.ok(run.splits()[0] > 0, 'the demo leg has a split time');
  assert.equal(run.pendingDemo(), null, 'the learner\'s goal is next');
  run.run('Ctrl+Up');
  assert.ok(run.finished);
  // a module lesson's closer is a demo the platform plays as a ghost: it lands last, and the sheet goes back as it stood
  const checks = byId('the-checks-row');
  const closer = checks.goals[checks.goals.length - 1];
  assert.ok(closer.closer && closer.demo && closer.demo.script, 'the closer is a demo');
  const mod = new LessonRun(checks, { mode: 'guided', now: () => (t += 100) });
  mod.run(checks.solution);
  assert.ok(mod.finished);
  assert.ok(mod.session.demoDone.has(closer.id), 'the closer played');
  assert.equal(mod.session.sheets.find(x => x.name === 'Report').sheet.value('D6') !== 3000, true, 'the perturbation the closer typed went back');
});

/* ---------------- C2 hint vocabulary (framework v2 §5) ----------------
   Go To is a tool, not movement glue: a hint may reach for Ctrl+G / F5 only when the target is on
   another sheet, more than a screen away (≥ 20 rows or ≥ 10 columns), or the dialog is the door to
   Go To Special. And no hint grinds arrows: more than three consecutive plain arrow presses only on
   goals flagged `slowRound` (the Welcome's deliberate slow legs). The rules bind the module lessons
   (`l.module`); the legacy 38 are exempt until the rewrite replaces them. */
test('module hints never use Go To as movement glue and never grind arrows', () => {
  // the rule itself, pinned on fixtures
  assert.equal(goToOffence(hintTokens('Ctrl+G "B4" ↵'), { r: 2, c: 1 }), 'jumps to B4 from A2 — a screen or less away');
  assert.equal(goToOffence(hintTokens('Ctrl+G "A45" ↵'), { r: 2, c: 1 }), null, 'more than a screen down is a jump');
  assert.equal(goToOffence(hintTokens('Ctrl+G "N2" ↵'), { r: 2, c: 1 }), null, 'more than a screen across is a jump');
  assert.equal(goToOffence(hintTokens('Ctrl+G "Inputs!B4" ↵'), { r: 2, c: 1 }), null, 'another sheet is a jump');
  assert.equal(goToOffence(hintTokens('Ctrl+G Alt+S "K" ↵'), { r: 2, c: 1 }), null, 'Go To Special is the dialog’s own job');
  assert.equal(goToOffence(hintTokens('F5 "C3" ↵'), { r: 1, c: 1 }), 'jumps to C3 from A1 — a screen or less away');
  assert.ok(arrowGrind(hintTokens('↓ ↓ ↓ ↓')), 'four arrows grind');
  assert.ok(arrowGrind(hintTokens('↓ ×5')), '×N counts as N presses');
  assert.ok(!arrowGrind(hintTokens('↓ ↓ ↓ then Ctrl+↓')), 'three arrows and a jump is fine');
  assert.ok(!arrowGrind(hintTokens('Ctrl+↓ Ctrl+↓ Ctrl+↓ Ctrl+↓')), 'modified arrows are jumps, not grinding');
  assert.ok(!arrowGrind(hintTokens('Alt F T Q ↓ ×9 A ↵')), 'arrows inside a dialog are list navigation');
  assert.ok(arrowGrind(hintTokens('Alt F T Q ↓ ↵ ↓ ↓ ↓ ↓')), 'the exemption ends when the dialog closes');
  // and every module lesson obeys it
  for (const l of LESSONS.filter(x => typeof x.module === 'string')) {
    l.goals.forEach((g, gi) => {
      const toks = hintTokens(g.keys);
      const bad = goToOffence(toks, anchorBefore(l, gi));
      assert.equal(bad, null, `Go To used as movement glue in ${l.id}/${g.id}: ${bad}`);
      if (!g.slowRound) assert.ok(!arrowGrind(toks), `arrow grinding in ${l.id}/${g.id}: more than three plain arrows in a row`);
    });
  }
});

/* ---------------- ghost replay (C2 gap 9a): "Show me" plays the keys and puts everything back ---------------- */
import { hintToScript } from '../app/runner.js';

test('hintToScript: glyphs become key names, ×N repeats, prose falls away', () => {
  assert.equal(hintToScript('Ctrl+G "C3:C7" ↵ then Ctrl+D'), 'Ctrl+G "C3:C7" Enter Ctrl+D');
  assert.equal(hintToScript('↓ ×3'), 'Down Down Down');
  assert.equal(hintToScript('Ctrl+↓ and Shift+→'), 'Ctrl+Down Shift+Right');
  assert.equal(hintToScript('"1200" ↵ ⌫ Esc'), '"1200" Enter Backspace Escape');
  assert.equal(hintToScript(''), '');
});

test('the ghost plays the hint on the live sheet and endGhost leaves no trace at all', () => {
  const lesson = f02();
  const run = fresh(lesson);
  const before = {
    snaps: run.session.sheets.map(e => JSON.stringify(e.sheet.snapshot())),
    keys: run.session.keyLog.length, t0: run.session.t0, done: run.doneCount, idx: run.session.sheetIndex,
  };
  run.beginGhost();
  const steps = run.ghostSteps(run.current.keys);
  assert.ok(steps.length > 0, 'the first goal has a playable hint');
  for (const s of steps) run.ghostStep(s);
  assert.ok(run.session.keyLog.length > before.keys, 'the ghost really pressed keys');
  assert.equal(run.doneCount, 0, 'nothing a ghost presses lands a goal');
  run.endGhost();
  assert.deepEqual(run.session.sheets.map(e => JSON.stringify(e.sheet.snapshot())), before.snaps, 'every sheet is exactly as it stood');
  assert.equal(run.session.keyLog.length, before.keys, 'no key-log line survives');
  assert.equal(run.session.t0, before.t0, 'the clock did not start');
  assert.equal(run.doneCount, before.done);
  assert.equal(run.session.sheetIndex, before.idx);
  assert.equal(run.session.mode, 'normal');
  assert.equal(run.session.sheet.undoStack.length, 0, 'no undo entry survives');
  // and the run still plays out normally afterwards
  run.run(lesson.solution);
  assert.ok(run.finished, 'the solution still finishes after a ghost');
});
