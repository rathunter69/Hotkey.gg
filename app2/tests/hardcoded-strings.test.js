// app2/tests/hardcoded-strings.test.js — M1: no learner-facing line is hard-coded in the screens or
// the drills. The screens' guard is a heuristic (tests/hardcoded-strings.js) with an allow list
// (tests/hardcoded-allow.js); the drills' guard is exact: every line a drill shows is its sheet row.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findings, isProse, scanScreens, unlisted } from './hardcoded-strings.js';
import { ALLOW, ALLOW_FILES } from './hardcoded-allow.js';
import { DRILLS } from '../content/drills.js';
import { COPY } from '../content/copy/index.js';
import { applyDrillCopy, drillLines } from '../content/copy/apply.js';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP2 = join(dirname(fileURLToPath(import.meta.url)), '..');

test('the heuristic: prose is caught, fallbacks, class lists, comments and developer text are not', () => {
  assert.ok(isProse('Saved to your account'));
  assert.ok(!isProse('btn btn-primary rp-cur'));
  assert.ok(!isProse('ref, tier, secs, clean'));
  assert.ok(!isProse('Ctrl+Shift+↓'));
  const src = [
    "el.textContent = 'Your streak starts today.';",                   // caught
    "const a = siteCopy('streak_none', 'Your streak starts today.');", // a fallback
    "const b = t('streak_none', 'Your streak starts today.');",         // a page's lookup
    "el.className = 'panel panel-quiet is-open';",                      // a class list
    "// a comment that says something in English",
    "console.warn('this is only for the developer');",
    "el.innerHTML = `<p>${esc(x)}</p><p>Nothing yet, play a drill.</p>`;", // caught inside a template
    "el.innerHTML = `<p>${esc(siteCopy('k', 'Inside the interpolation is a fallback'))}</p>`;",
  ].join('\n');
  const got = findings(src).map(f => f.text);
  assert.deepEqual(got, ['Your streak starts today.', 'Nothing yet, play a drill.']);
});

test('the screens carry no hard-coded line outside the copy sheets and the allow list', async () => {
  const left = unlisted(await scanScreens(), { ALLOW, ALLOW_FILES });
  assert.deepEqual(left.map(f => `${f.file}:${f.line} ${f.text.slice(0, 100)}`), [],
    'move each line into content/copy/site.csv and read it with siteCopy(key, fallback); only Excel’s own words, developer text and retired screens go on the allow list');
});

test('the allow list is not stale: every file exists and every line still matches one', async () => {
  for (const f in ALLOW_FILES) assert.ok(existsSync(join(APP2, f)), f + ' is gone: take it off the allow list');
  const all = await scanScreens();
  for (const a of ALLOW) assert.ok(all.some(f => f.file === a.file && f.text.startsWith(a.text)), `${a.file} "${a.text}" no longer appears: take it off the allow list`);
});

test('every drill shows its sheet rows: title, task, goals, end-state and what-if lines', () => {
  const keyed = DRILLS.filter(d => d.kind !== 'challenge');
  assert.ok(keyed.length >= 73, 'every keyed drill');
  for (const d of keyed) {
    const row = COPY.drills[d.id];
    assert.ok(row, `${d.id} has a drills.csv row (node app2/tests/copy-export.js adds it)`);
    assert.equal(d.title, row.title, d.id + ' title'); assert.equal(d.task, row.task, d.id + ' task');
    const rows = COPY.drillGoals[d.id] || [];
    for (const line of drillLines(d)) {
      const r = rows.find(x => x.kind === line.kind && Number(x.index) === line.index);
      assert.ok(r, `${d.id} ${line.kind} ${line.index} has a drill_goals.csv row`);
      assert.equal(line.text, r.text, `${d.id} ${line.kind} ${line.index} shows its row`);
    }
  }
});

test('applyDrillCopy: a row overrides the drill file’s line in place; a missing or empty cell keeps it', () => {
  const plant = { n: 0 };
  const drill = { id: 'x', title: 'JS title', task: 'JS task', goals: [{ text: 'JS goal', check: () => true }, { text: 'second' }], endState: [{ text: 'JS end' }], whatIf: { why: 'JS why' },
    get plant() { plant.n++; return []; } };
  const copy = { drills: { x: { id: 'x', title: 'Sheet title', task: '' } }, drillGoals: { x: [
    { drill_id: 'x', kind: 'goal', index: '1', text: 'Sheet second' }, { drill_id: 'x', kind: 'end', index: '0', text: 'Sheet end' }, { drill_id: 'x', kind: 'why', index: '0', text: 'Sheet why' }] } };
  const out = applyDrillCopy(drill, copy);
  assert.equal(out, drill, 'in place: the getters stay getters');
  assert.equal(plant.n, 0, 'the plant getter is not read');
  assert.equal(drill.title, 'Sheet title'); assert.equal(drill.task, 'JS task');
  assert.equal(drill.goals[0].text, 'JS goal'); assert.equal(drill.goals[1].text, 'Sheet second');
  assert.equal(drill.endState[0].text, 'Sheet end'); assert.equal(drill.whatIf.why, 'Sheet why');
});
