// app2/tests/progress-model.test.js — M102: lessons roll up to modules, chapters and one
// certificate; Verified is a status; the LinkedIn link and the verify URL are filled in.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, modulesOf } from '../content/index.js';
import { COURSE, lessonStatus, moduleProgress, chapterProgress, courseProgress, certificateState, verifyUrl, linkedInAddUrl } from '../app/progress-model.js';

const ch1 = CHAPTERS.find(c => c.id === 'foundations');
const mods = modulesOf(ch1);
const doneAll = (chapter, opts = {}) => {
  const out = {};
  for (const l of chapter.lessons) {
    if (l.kind === 'assessment' || l.kind === 'testout') { if (opts.gate) out[l.id] = { completed: true, best: opts.gate }; continue; }
    out[l.id] = l.kind === 'challenge' ? { completed: true, challenge: true, tier: 'pass' } : { completed: true };
  }
  return out;
};

test('lesson and module status', () => {
  assert.equal(lessonStatus(null), 'todo'); assert.equal(lessonStatus({ started: true }), 'started'); assert.equal(lessonStatus({ completed: true }), 'done');
  const m = mods[0];
  assert.equal(moduleProgress(m, {}).status, 'not-started');
  const half = { [m.lessons[0].id]: { completed: true } };
  const p = moduleProgress(m, half);
  assert.deepEqual([p.done, p.of, p.status, p.challenge.passed], [1, m.lessons.length, 'in-progress', false]);
  const full = doneAll(ch1);
  const q = moduleProgress(m, full);
  assert.deepEqual([q.done, q.status, q.challenge.passed, q.challenge.tier], [m.lessons.length, 'done', true, 'pass']);
  const noChallenge = { ...full }; delete noChallenge[m.challenge.id];
  assert.equal(moduleProgress(m, noChallenge).status, 'in-progress', 'a module is done only with its challenge');
});

test('chapter status: not started, in progress, completed, verified (with the assessment time)', () => {
  assert.equal(chapterProgress(ch1, {}, {}).status, 'not-started');
  assert.equal(chapterProgress(ch1, { [ch1.lessons[0].id]: { started: true } }, {}).status, 'in-progress');
  const c = chapterProgress(ch1, doneAll(ch1), {});
  assert.equal(c.status, 'completed'); assert.equal(c.completed, true); assert.equal(c.verified, false); assert.equal(c.lessonsDone, c.lessons);
  const v = chapterProgress(ch1, doneAll(ch1, { gate: 412.5 }), { assessment: true });
  assert.equal(v.status, 'verified'); assert.equal(v.assessmentSecs, 412.5);
  const t = chapterProgress(ch1, {}, { testout: true });
  assert.equal(t.status, 'verified', 'a test-out verifies too'); assert.equal(t.assessmentSecs, null);
  assert.equal(chapterProgress({ id: 'valuation' }, {}, {}).status, 'not-started', 'an unbuilt chapter reads empty');
});

test('the course: six chapters toward one certificate', () => {
  assert.equal(COURSE.chapters.length, 6); assert.equal(COURSE.chapters[0].id, 'foundations'); assert.equal(COURSE.chapters[5].n, 6);
  const none = courseProgress(CHAPTERS, {}, {});
  assert.deepEqual([none.verifiedCount, none.of, none.issued, none.chapters.length], [0, 6, false, 6]);
  assert.equal(none.chapters[0].built, true); assert.equal(none.chapters[5].built, true, 'Chapter 6 has lessons');
  const recs = Object.fromEntries(COURSE.chapters.map(c => [c.id, { assessment: true }]));
  const all = courseProgress(CHAPTERS, doneAll(ch1, { gate: 400 }), recs);
  assert.deepEqual([all.verifiedCount, all.issued, all.chapters[0].status, all.chapters[5].status], [6, true, 'verified', 'verified']);
  const five = courseProgress(CHAPTERS, {}, { ...recs, valuation: {} });
  assert.deepEqual([five.verifiedCount, five.issued], [5, false]);
  const s = certificateState(five);
  assert.deepEqual([s.issued, s.earned, s.verifiedCount, s.of, s.credentialId], [false, false, 5, 6, null]);
  const issued = certificateState(all, { credential_id: 'HK-ABC123', issued_at: '2026-11-01T00:00:00Z', display_name: 'Wolf' });
  assert.deepEqual([issued.issued, issued.earned, issued.credentialId, issued.displayName, issued.verifyUrl], [true, true, 'HK-ABC123', 'Wolf', 'https://hotkey.gg/#/verify/HK-ABC123']);
});

test('the verify URL and the LinkedIn add-certification link', () => {
  assert.equal(verifyUrl('HK-1'), 'https://hotkey.gg/#/verify/HK-1');
  const u = new URL(linkedInAddUrl({ issuedAt: '2026-11-15T12:00:00Z', credentialId: 'HK-ABC123' }));
  assert.equal(u.origin + u.pathname, 'https://www.linkedin.com/profile/add');
  assert.equal(u.searchParams.get('startTask'), 'CERTIFICATION_NAME');
  assert.equal(u.searchParams.get('name'), 'hotkey.gg Certified, Excel for Finance');
  assert.equal(u.searchParams.get('organizationName'), 'hotkey.gg');
  assert.equal(u.searchParams.get('issueYear'), '2026'); assert.equal(u.searchParams.get('issueMonth'), '11');
  assert.equal(u.searchParams.get('certId'), 'HK-ABC123'); assert.equal(u.searchParams.get('certUrl'), 'https://hotkey.gg/#/verify/HK-ABC123');
  assert.ok(!new URL(linkedInAddUrl({})).searchParams.has('certId'), 'no id, no credential fields');
});
