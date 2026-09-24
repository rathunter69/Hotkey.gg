// app2/tests/copy.test.js — the copy layer: the CSV codec, the overlay, the rules, the export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, toCsv } from '../content/copy/csv.js';
import { applyCopy, siteCopy, moduleCopy, splitParas, joinParas } from '../content/copy/apply.js';
import { COPY } from '../content/copy/index.js';
import { checkCopy, namesVisibleThing, sentenceCount, BRITISH } from './copy-check.js';
import { readCopyDir, renderIndex, HEADERS, COPY_DIR } from './copy-build.js';
import { exportCopy, siteDefaults, PLANNED } from './copy-export.js';
import { SITE_KEYS } from '../content/copy/rules.js';
import { LESSONS } from '../content/index.js';

test('csv: RFC-4180 round trip — commas, quotes, newlines, a BOM, CRLF', () => {
  const header = ['id', 'text'];
  const rows = [{ id: 'a', text: 'plain' }, { id: 'b', text: 'has, a comma' }, { id: 'c', text: 'says "hi"' }, { id: 'd', text: 'two\nlines' }, { id: 'e', text: '' }];
  const text = toCsv(header, rows);
  const back = parseCsv(text);
  assert.deepEqual(back.header, header);
  assert.deepEqual(back.rows, rows);
  assert.deepEqual(parseCsv('﻿id,text\r\na,"x, y"\r\n').rows, [{ id: 'a', text: 'x, y' }], 'a BOM and CRLF, as a spreadsheet saves it');
  assert.deepEqual(parseCsv('id,text\n a , b \n').rows, [{ id: 'a', text: 'b' }], 'cells are trimmed');
});

test('applyCopy: a row overlays the JS copy field by field; a missing or empty cell keeps the JS', () => {
  const source = { id: 'x', title: 'JS title', brief: 'JS brief', goals: [{ text: 'JS goal', teach: 'JS teach', check: () => true }, { text: 'second' }] };
  const copy = { lessons: { x: { id: 'x', title: 'CSV title', brief: '', closing: 'One. || Two.', wow: 'Wow.' } }, goals: { x: [{ lesson_id: 'x', goal_index: '1', text: 'CSV second', why: 'Because.', hint_stuck: 'Try F2.' }] }, modules: {}, site: {} };
  const lesson = applyCopy(source, copy);
  assert.notEqual(lesson, source, 'a clone'); assert.equal(source.title, 'JS title', 'the source is untouched'); assert.equal(lesson.goals[0].check, source.goals[0].check, 'checks are shared');
  assert.equal(lesson.title, 'CSV title');
  assert.equal(lesson.brief, 'JS brief', 'an empty cell is not an override');
  assert.deepEqual(lesson.closing, ['One.', 'Two.']);
  assert.equal(lesson.wow, 'Wow.');
  assert.equal(lesson.goals[0].text, 'JS goal'); assert.equal(lesson.goals[0].teach, 'JS teach');
  assert.equal(lesson.goals[1].text, 'CSV second'); assert.equal(lesson.goals[1].why, 'Because.'); assert.equal(lesson.goals[1].hintStuck, 'Try F2.');
  const none = { id: 'none', title: 't' }; assert.equal(applyCopy(none, copy), none, 'no row: the same object back');
  assert.equal(splitParas(' a || b ||  ').length, 2); assert.equal(joinParas(['a', ' b ']), 'a || b');
});

test('siteCopy and moduleCopy: the CSV line or the fallback', () => {
  assert.equal(siteCopy('no_such_key', 'fallback'), 'fallback');
  assert.equal(siteCopy('landing_subhead', 'x'), COPY.site.landing_subhead);
  assert.equal(moduleCopy('no-such-module'), null);
  assert.equal(moduleCopy('open-and-set-up').name, 'Open and set up');
});

test('the catalog reads its copy from the CSVs: every module lesson and goal is covered', () => {
  const live = LESSONS.filter(l => typeof l.module === 'string' && l.module !== 'welcome');
  assert.ok(live.length >= 10);
  for (const l of live) {
    assert.ok(COPY.lessons[l.id], l.id + ' has a lessons.csv row');
    assert.equal(l.title, COPY.lessons[l.id].title);
    (l.goals || []).forEach((g, i) => { const row = COPY.goals[l.id].find(r => Number(r.goal_index) === i); assert.ok(row, `${l.id} goal ${i} has a row`); assert.equal(g.text, row.text); });
  }
  for (const k of SITE_KEYS) assert.ok(typeof COPY.site[k] === 'string' && COPY.site[k].trim(), 'site.csv carries ' + k);
});

test('copy-check: the rules fire on the row and say which', () => {
  const base = { lessons: {}, goals: {}, modules: {}, site: Object.fromEntries(SITE_KEYS.map(k => [k, 'x'])) };
  const rules = findings => findings.filter(f => f.level === 'error').map(f => f.rule);
  const lesson = { id: 'l', module: 'm', goals: [{ text: 'a' }] };
  assert.deepEqual(checkCopy({ ...base }, [lesson]).map(f => f.rule), ['R1'], 'no row: a warning, not an error');
  const four = 'One. Two. Three. Four.';
  const long = Array(71).fill('word').join(' ') + '.';
  assert.deepEqual(rules(checkCopy({ ...base, lessons: { l: { id: 'l', brief: four } } }, [])), ['R3']);
  assert.deepEqual(rules(checkCopy({ ...base, lessons: { l: { id: 'l', brief: long } } }, [])), ['R3']);
  assert.deepEqual(rules(checkCopy({ ...base, lessons: { l: { id: 'l', title: 'Colour it' } } }, [])), ['R5']);
  assert.deepEqual(rules(checkCopy({ ...base, lessons: { l: { id: 'l', brief: 'To house style.' } } }, [])), ['R6']);
  assert.deepEqual(rules(checkCopy({ ...base, modules: { m: { id: 'm', objective: 'For a first-year analyst.' } } }, [])), ['R7']);
  const goal = (text, extra = {}) => ({ ...base, goals: { l: [{ lesson_id: 'l', goal_index: '0', text, ...extra }] } });
  assert.deepEqual(rules(checkCopy(goal('Make it look tidier.'), [])), ['R4'], 'names nothing visible');
  assert.deepEqual(rules(checkCopy(goal('Make B4 bold.'), [])), []);
  assert.deepEqual(rules(checkCopy(goal('Make the "Weekly Sales Report" title bold.'), [])), []);
  assert.deepEqual(rules(checkCopy(goal('Rename Sheet2 to Inputs.'), [])), []);
  assert.deepEqual(rules(checkCopy(goal('Open Format Cells with Ctrl+1.'), [])), []);
  assert.deepEqual(rules(checkCopy(goal('Make B4 bold'), [])), ['R10'], 'no full stop');
  assert.deepEqual(rules(checkCopy(goal('Make B4 bold. Then C4. Then D4.'), [])), ['R10'], 'three sentences');
  assert.deepEqual(rules(checkCopy(goal('Make B4 bold, ' + Array(30).fill('really').join(' ') + '.'), [])), ['R8']);
  assert.deepEqual(rules(checkCopy(goal('Make B4 bold.', { why: Array(25).fill('because').join(' ') + '.' }), [])), ['R9']);
  assert.deepEqual(rules(checkCopy(goal('Make B4 bold.', { teach: 'One. Two.' }), [])), ['R10']);
  assert.deepEqual(rules(checkCopy(goal('Make B4 bold.', { hint_stuck: 'Practise it.' }), [])), ['R5']);
  const missing = checkCopy({ ...base, site: {} }, []);
  assert.equal(missing.filter(f => f.rule === 'R11').length, SITE_KEYS.length, 'every missing site key warns');
  assert.ok(missing.every(f => f.level === 'warn'));
  // the helpers
  assert.equal(sentenceCount('Fix #DIV/0! in B4. Then w/c 15 Sep.'), 2);
  assert.ok(namesVisibleThing('Press Ctrl+↓.')); assert.ok(namesVisibleThing('Select column B.')); assert.ok(!namesVisibleThing('Do the thing.'));
  assert.ok(BRITISH.test('organise') && BRITISH.test('centre') && BRITISH.test('practising') && !BRITISH.test('practice') && !BRITISH.test('color'));
});

test('the checked-in copy passes its own rules and the inlined index matches the CSVs', () => {
  const copy = readCopyDir(COPY_DIR);
  const findings = checkCopy(copy);
  assert.deepEqual(findings.filter(f => f.level === 'error'), [], 'no violations in content/copy');
  assert.deepEqual(JSON.parse(renderIndex(copy).replace(/^[\s\S]*?export const COPY = /, '').replace(/;\s*$/, '')), { lessons: copy.lessons, goals: copy.goals, modules: copy.modules, site: copy.site });
  for (const f in HEADERS) assert.ok(Array.isArray(HEADERS[f]));
});

test('copy-export: idempotent over the checked-in set; existing cells win; every planned row is present', () => {
  const current = readCopyDir(COPY_DIR);
  const out = exportCopy(current);
  assert.equal(toCsv(HEADERS['lessons.csv'], out.lessons), toCsv(HEADERS['lessons.csv'], current.order.map(id => current.lessons[id])), 'lessons.csv unchanged');
  assert.equal(out.site.length, Object.keys(current.site).length);
  // a planned row stands until the catalog carries that map number, then the authored lesson's row does
  const authored = new Set(LESSONS.filter(l => typeof l.module === 'string').map(l => current.lessons[l.id] && current.lessons[l.id].order));
  for (const p of PLANNED) {
    const rows = out.lessons.filter(r => r.order === p.order);
    assert.equal(rows.length, 1, p.order + ': one row per map number');
    if (!authored.has(p.order)) assert.ok(rows[0].id === p.id && rows[0].title === p.title, p.id);
  }
  assert.ok(authored.has('1.3.1'), 'module 1.3 is authored: its rows come from the catalog');
  const edited = { ...current, lessons: { ...current.lessons, 'inherited-workbook': { ...current.lessons['inherited-workbook'], title: 'Wolf’s title' } }, site: { ...current.site, landing_subhead: 'Wolf’s subhead' } };
  const out2 = exportCopy(edited);
  assert.equal(out2.lessons.find(r => r.id === 'inherited-workbook').title, 'Wolf’s title');
  assert.equal(out2.site.find(r => r.key === 'landing_subhead').text, 'Wolf’s subhead');
  assert.equal(siteDefaults().landing_headline_a, COPY.site.landing_headline_a);
});
