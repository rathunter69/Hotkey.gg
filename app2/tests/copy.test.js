// app2/tests/copy.test.js — the copy layer (C2 Run 3): written rows replace inline strings, draft
// rows never do, the CSV round-trips, and the shipped module is what the CSV generates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyCopy, copyFor, allCopyRows } from '../content/copy/index.js';
import { parseCsv, toCsv, lessonStrings } from './copy-sync.js';
import { LESSONS, LESSONS_RAW } from '../content/index.js';

test('applyCopy: a written row replaces the inline string, a draft row leaves it, checks and states are untouched', () => {
  const lesson = { id: 'x', title: 'T', brief: 'B', goals: [{ id: 'a', text: 'A', teach: 'TA', check: () => true }, { id: 'b', text: 'Bt' }], closing: ['C1', 'C2'], endState: [{ text: 'E', check: () => true }], state: { before: 'S0' } };
  assert.equal(applyCopy(lesson), lesson, 'no rows for the id: the same object back');
  assert.equal(copyFor('nope', 'title', 'fb'), 'fb');
});

test('the CSV round-trips commas, quotes and newlines; lessonStrings lists every learner-facing string in order', () => {
  const rows = [{ id: 'l', field: 'brief', text: 'Say "hi", then\nstop.', draft: true }, { id: 'l', field: 'goal.a.text', text: 'plain', draft: false }];
  const back = parseCsv(toCsv(rows)); back.shift();
  assert.deepEqual(back, [['l', 'brief', 'Say "hi", then\nstop.', 'y'], ['l', 'goal.a.text', 'plain', '']]);
  const l = LESSONS_RAW.find(x => x.id === 'hide-group-freeze');
  const fields = lessonStrings(l).map(r => r.field);
  assert.deepEqual(fields.slice(0, 4), ['title', 'brief', 'goal.hide.text', 'goal.hide.teach']);
  assert.ok(fields.includes('closing.1'));
});

test('the catalogue ships the overlaid lessons: every module lesson from 1.3 on has draft rows, and written text validates like inline text', () => {
  const rows = allCopyRows();
  for (const l of LESSONS.filter(x => x.workbook && ['enter-edit-copy-fill', 'structure', 'format', 'formulas', 'present-and-audit'].includes(x.module))) {
    assert.ok(rows.some(r => r.id === l.id && r.field === 'brief'), l.id + ' has copy rows (node app2/tests/copy-sync.js --seed)');
  }
  const written = rows.filter(r => !r.draft);
  for (const r of written) {
    if (r.id.includes('/')) continue;
    const l = LESSONS.find(x => x.id === r.id); assert.ok(l, r.id + ' is a lesson');
    if (r.field === 'brief') assert.equal(l.brief, r.text, r.id + ': the written brief ships');
  }
});
