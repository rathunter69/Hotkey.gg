// app2/tests/site-pages.test.js — Home, Learn and Practice (screenplay 3.0; M89, M97): the pure
// models behind the screens, the shared formatters and marks, the chapter table, the next-lesson
// block through its three states, Today's rows, the drill catalog and the set's line, the
// challenges table, the sheet preview on the real engine, and every line a learner reads on them
// as a site.csv row that reads clean.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
globalThis.localStorage = { get length() { return mem.size; }, key(i) { return [...mem.keys()][i] ?? null; }, getItem(k) { return mem.has(k) ? mem.get(k) : null; }, setItem(k, v) { mem.set(k, String(v)); }, removeItem(k) { mem.delete(k); } };
globalThis.sessionStorage = { getItem: () => null, setItem() {} };
globalThis.window = { addEventListener() {}, dispatchEvent() {} };

const { fmtClock, fmtGap, fmtLength, fmtMinutes, ordinal, numberWord, fill } = await import('../ui/components/format.js');
const { tierMarksHtml, segmentsHtml, barHtml } = await import('../ui/components/marks.js');
const { tableHtml, panelHtml, tabsHtml, buttonHtml, headerBlockHtml } = await import('../ui/components/table.js');
const { chapterModel, statusWord, chapterTabs, lessonMinutes, modulePreview } = await import('../app/learn-page.js');
const { nextLessonModel, todayModel, achievementsModel, liveLessons } = await import('../app/home-page.js');
const { catalogRows, setLine, drillUnlocked, dueDrills, challengeRows, bestRounds, teachingLessons } = await import('../app/practice-page.js');
const { sheetPreviewHtml, previewOfLesson, usedRange } = await import('../ui/components/sheet-preview.js');
const { CATALOG } = await import('../content/catalog.js');
const { DRILLS } = await import('../content/drills.js');
const { CHAPTERS, LESSONS, lessonById } = await import('../content/index.js');
const { COPY } = await import('../content/copy/index.js');
const { tells } = await import('../content/copy/tells.js');
const { SITE_KEYS } = await import('../content/copy/rules.js');

test('formatters: times as m:ss and m:ss.t, gaps, lengths, ordinals and number words', () => {
  assert.equal(fmtClock(41), '0:41'); assert.equal(fmtClock(61.24, true), '1:01.2'); assert.equal(fmtClock(0, true), '0:00.0'); assert.equal(fmtClock(NaN), '');
  assert.equal(fmtGap(2.64), '+2.6'); assert.equal(fmtGap(0), '');
  assert.equal(fmtLength(60), '1 min'); assert.equal(fmtLength(90), '1.5 min'); assert.equal(fmtLength('long'), '5 min'); assert.equal(fmtLength(0), '');
  assert.equal(fmtMinutes(25), '25 min'); assert.equal(fmtMinutes(0), '');
  assert.equal(ordinal(1), '1st'); assert.equal(ordinal(12), '12th'); assert.equal(ordinal(31), '31st'); assert.equal(ordinal(102), '102nd');
  assert.equal(numberWord(6, { capital: true }), 'Six'); assert.equal(numberWord(10), 'ten'); assert.equal(numberWord(21), '21');
  assert.equal(fill('{n} of {m}', { n: 1, m: 2 }), '1 of 2');
});

test('marks: three diamonds filled to the tier, goal segments, a bar', () => {
  assert.equal((tierMarksHtml('pro').match(/class="on"/g) || []).length, 2);
  assert.equal((tierMarksHtml('legendary').match(/class="on"/g) || []).length, 3);
  assert.match(tierMarksHtml('none'), /tiers-none/);
  assert.match(tierMarksHtml('pass'), /aria-label="Pass"/);
  const segs = segmentsHtml(3, 8, true);
  assert.equal((segs.match(/<i/g) || []).length, 8); assert.equal((segs.match(/class="on"/g) || []).length, 3); assert.match(segs, /class="now"/);
  assert.equal(segmentsHtml(0, 0), '');
  assert.match(barHtml(53), /width:53%/); assert.match(barHtml(140), /width:100%/);
});

test('the table and panel render from data: a rule above the header, figures right, rows that carry the cursor', () => {
  const html = tableHtml({ columns: [{ key: 'a', label: 'Module' }, { key: 'b', label: 'Minutes', align: 'right', cls: 'min' }], rows: [{ cells: { a: 'One', b: '25 min' }, href: '#/x', cls: 'current' }, { cells: { a: 'Two' }, cursor: false }] });
  assert.match(html, /<th>Module<\/th><th class="num" data-col="min">Minutes<\/th>/);
  assert.match(html, /<tr class="current" data-href="#\/x" data-cursor tabindex="-1">/);
  assert.doesNotMatch(html.split('</tr>')[2], /data-cursor/, 'a row can opt out of the cursor');
  const p = panelHtml({ heading: 'Level 4', facts: '320 of 600 XP', body: '<p>x</p>', mode: 'learn', stretch: true });
  assert.match(p, /class="panel panel-mode panel-stretch/); assert.match(p, /<h2 class="panel-h">Level 4<\/h2><span class="panel-facts">320 of 600 XP<\/span>/);
  assert.match(tabsHtml([{ key: 'a', label: 'A', on: true, mode: 'daily' }]), /role="tab" class="tab on" aria-selected="true"/);
  assert.match(buttonHtml({ label: 'Resume lesson', key: 'Enter', href: '#/l', primary: true, id: 'r' }), /<a class="btn2 btn2-primary " href="#\/l" id="r"><span>Resume lesson<\/span><kbd class="key">Enter<\/kbd><\/a>/);
  assert.match(headerBlockHtml({ title: 'Drills' }), /data-cursor data-cursor-enter=".btn2-primary"/);
});

const ch1 = CHAPTERS[0];
test('chapterModel: a row per module with its number, title, minutes, status and tier, the lessons under it, one next item', () => {
  const rows = chapterModel(ch1, {}, [], {});
  assert.ok(rows.length >= 8, 'seven modules and module 1.8');
  assert.equal(rows[0].n, '1.1'); assert.equal(rows[rows.length - 1].n, '1.8'); assert.equal(rows[rows.length - 1].final, true);
  assert.ok(rows[0].minutes > 0, 'minutes add up from the lessons');
  assert.equal(rows[0].statusText, 'Lesson 1 of ' + rows[0].lessons.filter(l => l.kind !== 'challenge').length); assert.equal(rows[0].current, true);
  assert.equal(rows[1].statusText, 'Not started');
  assert.equal(rows.flatMap(r => r.lessons).filter(l => l.next).length, 1, 'exactly one next item');
  assert.equal(rows[0].lessons[rows[0].lessons.length - 1].kind, 'challenge', 'the challenge last');
  // every lesson done and the challenge passed: Complete, with the tier
  const all = {};
  for (const l of ch1.lessons.filter(l => l.module === rows[0].id)) all[l.id] = { completed: true, challenge: l.kind === 'challenge', tier: 'pro' };
  const done = chapterModel(ch1, all, [], {});
  assert.equal(done[0].status, 'complete'); assert.equal(done[0].statusText, 'Complete'); assert.equal(done[0].tier, 'pro');
  assert.equal(done[1].current, true, 'the next module carries the cursor');
  // the chapter Verified: module 1.8 says so
  assert.equal(chapterModel(ch1, all, [], { assessment: true })[rows.length - 1].statusText, 'Verified');
  assert.equal(statusWord('lessons-done'), 'Lessons done, challenge open'); assert.equal(statusWord('coming'), 'Coming');
  assert.equal(lessonMinutes({ minutes: 5 }), 5); assert.equal(lessonMinutes({ timeLimit: 170 }), 3); assert.equal(lessonMinutes({}), 0);
});

test('chapterTabs: six chapters, Chapter 1 free and built, the rest Pro', () => {
  const tabs = chapterTabs();
  assert.deepEqual(tabs.map(x => x.n), [1, 2, 3, 4, 5, 6]);
  assert.equal(tabs[0].access, 'free'); assert.ok(tabs[0].built); assert.ok(tabs.slice(1).every(x => x.access === 'paid'));
  assert.ok(modulePreview(ch1, 'format', false), 'a module previews the page it builds');
});

test('nextLessonModel: the next open lesson with its place, then the assessment, then Chapter 2 behind the paywall', () => {
  const lessons = liveLessons();
  const fresh = nextLessonModel(lessons, {}, [], { locked: l => l.access === 'paid' });
  assert.equal(fresh.kind, 'lesson'); assert.equal(fresh.lesson.id, 'inherited-workbook'); assert.equal(fresh.started, false); assert.equal(fresh.n, 1); assert.ok(fresh.goals > 0); assert.ok(fresh.minutes > 0);
  const all = {};
  for (const l of ch1.lessons) if (l.kind !== 'assessment' && l.kind !== 'testout') all[l.id] = { completed: true, started: true };
  const assess = nextLessonModel(lessons, all, [], { locked: l => l.access === 'paid' });
  assert.equal(assess.kind, 'assessment');
  all[assess.lesson.id] = { completed: true };
  const pro = nextLessonModel(lessons, all, [], { locked: l => l.access === 'paid' });
  assert.equal(pro.kind, 'pro'); assert.equal(pro.lesson.chapter, 'formatting');
  const started = nextLessonModel(lessons, { 'inherited-workbook': { started: true } }, [], {});
  assert.equal(started.started, true);
});

test('todayModel: the refreshers as one row, the Daily as one row, done counts, the fresh line', () => {
  const m = todayModel({ queue: { items: [{ kind: 'micro', id: 'ctrl-arrow', secs: 30 }, { kind: 'micro', id: 'f2', secs: 30 }], secs: 60 }, daily: { played: false }, dailyTitle: 'Get around', completedLessons: 3, dailyXp: 30 });
  assert.deepEqual(m.rows.map(r => r.id), ['refreshers', 'daily']);
  assert.equal(m.rows[0].title, 'Run your 2 refreshers'); assert.equal(m.rows[0].length, '60 s'); assert.equal(m.rows[0].href, '#/due/ctrl-arrow');
  assert.equal(m.rows[1].xp, 30); assert.equal(m.rows[1].length, '90 s'); assert.equal(m.done, 0); assert.equal(m.of, 2); assert.equal(m.fresh, false);
  const played = todayModel({ daily: { played: true, clean: true, secs: 88.4, place: 31, of: 212 }, completedLessons: 0 });
  assert.equal(played.rows[0].done, true); assert.equal(played.rows[0].line, '1:28.4, 31 of 212 on today’s board'); assert.equal(played.done, 1); assert.equal(played.fresh, true);
  assert.match(todayModel({ daily: { played: true, clean: false } }).rows[0].line, /no time posted/);
  assert.equal(todayModel({ queue: { items: [{ kind: 'challenge', id: 'c', title: 'Keep sharp: Format', secs: 120 }], secs: 120 } }).rows[0].mode, 'challenges');
});

test('achievementsModel: the latest earned, the count, and the closest unearned visible badge next', () => {
  const def = (id, hidden) => ({ id, name: id, desc: id, glyph: 'star', rarity: 'common', hidden });
  const states = [{ def: def('a'), done: true, prog: 1, goal: 1 }, { def: def('b'), done: false, prog: 1, goal: 4 }, { def: def('c'), done: false, prog: 3, goal: 4 }, { def: def('h', true), done: false, prog: 9, goal: 10 }];
  const m = achievementsModel(states);
  assert.equal(m.earned, 1); assert.equal(m.of, 4); assert.equal(m.next.def.id, 'c', 'the closest, never a hidden one'); assert.deepEqual(m.shown.map(s => s.def.id), ['a']);
});

test('the catalog: a row per drill by chapter with its length, best and tier; locked drills say which module to finish; Pro on a free account', () => {
  const groups = catalogRows(CATALOG, { all: {}, skipped: [], bests: { 'get-around': { secs: 41, tier: 'pro' } }, pro: false });
  assert.equal(groups[0].n, 1); assert.equal(groups[0].rows.length, DRILLS.filter(d => d.kind !== 'challenge' && d.chapter === 'foundations').length);
  const ga = groups[0].rows.find(r => r.id === 'get-around');
  assert.equal(ga.best, 41); assert.equal(ga.tier, 'pro'); assert.equal(ga.length, 90); assert.equal(ga.open, false); assert.equal(ga.after, '1.2');
  assert.equal(groups[0].passed, 1);
  const paid = catalogRows([{ id: 'x', title: 'X', chapter: 'formatting', mode: 'drill', length: 90, access: 'paid', lesson: null, tags: [] }], { pro: false });
  assert.equal(paid[0].rows[0].pro, true); assert.equal(paid[0].n, 2);
  assert.equal(catalogRows([{ id: 'x', title: 'X', chapter: 'formatting', mode: 'drill', length: 90, access: 'paid', lesson: null, tags: [] }], { pro: true })[0].rows[0].pro, false);
  // unlocking: the teaching lesson done or skipped
  const e = CATALOG.find(x => x.id === 'get-around');
  const taught = teachingLessons(e).map(l => l.id);
  assert.ok(taught.length >= 1, 'DRILL_MODULE names the module that teaches it');
  assert.equal(drillUnlocked(e, Object.fromEntries(taught.map(id => [id, { completed: true }])), []).open, true);
  assert.equal(drillUnlocked(e, {}, taught).open, true);
  assert.equal(drillUnlocked({ id: 'nothing', lesson: null }, {}, []).open, true);
  // what's due: the drills that hold the due keys
  const teaches = teachingLessons(e).flatMap(l => l.teaches || []);
  assert.ok(teaches.length, 'the teaching lessons name what they teach');
  assert.ok(dueDrills(CATALOG, [teaches[0]]).includes('get-around'));
  assert.deepEqual(dueDrills(CATALOG, []), []);
});

test('the set\'s line counts in words, and the challenges table reads the curriculum', () => {
  assert.equal(setLine(6, 600), 'Six drills picked for you, about ten minutes.');
  assert.equal(setLine(1, 60), 'One drill picked for you, about one minute.');
  assert.equal(setLine(3, 290), 'Three drills picked for you, about five minutes.');
  assert.equal(setLine(0, 0), 'Finish a lesson and its drills unlock here.');
  // a set the open drills cannot fill to the chosen length says so, not "picked, about one minute" under 10 minutes
  assert.equal(setLine(1, 60, 10), 'One drill open so far, about one minute. Each lesson you finish opens more.');
  assert.equal(setLine(2, 150, 10), 'Two drills open so far, about three minutes. Each lesson you finish opens more.');
  assert.equal(setLine(6, 600, 10), 'Six drills picked for you, about ten minutes.');
  const rows = challengeRows(DRILLS.filter(d => d.kind === 'challenge'), { 'challenge-inherited-file': { challenge: true } }, { 'challenge-inherited-file': { secs: 100, tier: 'pass' } });
  const first = rows.find(r => r.id === 'challenge-inherited-file');
  assert.equal(first.n, '1.1'); assert.equal(first.module, 'Open and set up'); assert.equal(first.passed, true); assert.equal(first.best, 100); assert.ok(first.length > 0);
  assert.doesNotMatch(first.title, /^Challenge:/);
  assert.deepEqual(bestRounds([{ kind: 'rapid', ref: 'rapid-60', secs: 60, splits: [12, 3, 5, 300] }, { kind: 'rapid', ref: 'rapid-60', secs: 60, splits: [15, 1, 7, 400] }, { kind: 'rapid', ref: 'rapid-30', secs: 30, splits: [8, 0, 8, 200] }]), [{ secs: 30, hits: 8, combo: 8 }, { secs: 60, hits: 15, combo: 7 }]);
});

test('the sheet preview runs on the real engine: formulas show their values, the used range sets the size', () => {
  const lesson = lessonById('alignment-and-titles');
  const sheet = previewOfLesson(lesson, 'before');
  assert.ok(sheet && sheet.name, 'the lesson\'s workbook sheet');
  const html = sheetPreviewHtml(sheet, { rows: 12, cols: 9 });
  assert.match(html, /class="sheet-preview"/); assert.match(html, /<th>A<\/th><th>B<\/th>/);
  assert.doesNotMatch(html, /=SUM|=B/, 'no formula text, only values');
  assert.equal((html.match(/<tr>/g) || []).length, 13, 'the header row and twelve rows');
  assert.deepEqual(usedRange({ A1: {}, C7: {} }), { rows: 7, cols: 3 });
  assert.equal(sheetPreviewHtml(null), '');
  assert.equal(previewOfLesson({ id: 'x' }), null);
});

test('every line the screens read is a site.csv row that reads clean', () => {
  const keys = SITE_KEYS.filter(k => /^(home_|chapter_|col_|status_|learn_|practice_|reason_|daily_|rapid_|challenges_|boards_|paywall_|quests_)/.test(k));
  assert.ok(keys.length > 90, 'the new screens\' keys are registered');
  for (const k of keys) { assert.ok(k in COPY.site, k + ' in site.csv'); assert.deepEqual(tells(COPY.site[k]), [], k); }
  for (const k in COPY.site) assert.ok(!/[—]| · |\|(?!\|)/.test(COPY.site[k].replace(/\s\|\|\s/g, ' ')), k + ' carries a dash or joined facts');
});
