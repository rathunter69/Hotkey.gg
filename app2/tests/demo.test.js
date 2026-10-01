// node --test app2/tests/demo.test.js — the self-playing demo and its two hosts (the landing and the
// first run): how a teach line boxes its keys, the demo's column fit, where a key on the landing goes,
// the hero's small print, and what the first run's picker and hand-off do.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { teachTokens, teachHtml, fitDemoColumns, DEMO_LESSON } from '../ui/demo-player.js';
import { LessonRun } from '../app/runner.js';
import { landingKeyRoute, landingHtml } from '../app/landing-page.js';
import { finishPatch, pickerMove, answersAt, QUESTIONS, FIRST_MODULE, FIRST_LESSON } from '../app/first-run.js';
import { LESSONS } from '../content/index.js';

const keys = line => teachTokens(line).filter(t => t.key).map(t => t.key);
const id = k => k;

test('demo teach line: every key is boxed whole, an arrow or punctuation after it included', () => {
  assert.deepEqual(keys('Ctrl+Shift+↓ selects to the edge in one press.'), ['Ctrl+Shift+↓']);
  assert.deepEqual(keys('Ctrl+↓ jumps to the edge of the data.'), ['Ctrl+↓']);
  assert.deepEqual(keys('Shift+Space selects the row; Ctrl+B bolds it.'), ['Shift+Space', 'Ctrl+B']);
  assert.deepEqual(keys('Alt walks the Ribbon: W for View, V then G for Gridlines.'), ['Alt']);
  // punctuation straight after a key ends it and stays text
  assert.deepEqual(keys('Press Ctrl+B. Then Ctrl+↓, or (Ctrl+Home): done'), ['Ctrl+B', 'Ctrl+↓', 'Ctrl+Home']);
  assert.deepEqual(keys('Finish with Ctrl+→'), ['Ctrl+→'], 'a key at the end of the line');
  // a KeyTip run after Alt is one token, a box per key
  assert.deepEqual(keys('Press Alt W V G, then look.'), ['Alt W V G']);
  assert.equal(teachHtml('Press Alt W V G.', id), 'Press <kbd>Alt</kbd> <kbd>W</kbd> <kbd>V</kbd> <kbd>G</kbd>.');
  // words that start like a modifier are not keys
  assert.deepEqual(keys('Altogether, Shifts and Ctrls are words.'), []);
  // the text round-trips and is escaped; the key label follows the platform mapper
  const line = 'Shift+Space selects the row; Ctrl+B bolds <it>.';
  assert.equal(teachTokens(line).map(t => t.key || t.text).join(''), line);
  assert.equal(teachHtml(line, k => k.replace('Ctrl', '⌘')), '<kbd>Shift+Space</kbd> selects the row; <kbd>⌘+B</kbd> bolds &lt;it&gt;.');
  // every teach line in the demo boxes at least one key and leaves no modifier outside a box
  for (const g of DEMO_LESSON.goals) {
    const html = teachHtml(g.teach, id);
    assert.ok(/<kbd>/.test(html), g.id);
    assert.doesNotMatch(html.replace(/<kbd>[^<]*<\/kbd>/g, ''), /\b(Ctrl|Shift)\b/, g.id);
  }
});

test('demo columns: a label cut off by a filled neighbour is widened; lone labels spill; never narrower', () => {
  const run = new LessonRun(DEMO_LESSON, { mode: 'guided' });
  const S = run.session.sheet;
  const before = S.colW.slice();
  fitDemoColumns(S);
  for (let c = 1; c <= S.cols; c++) assert.ok(S.colW[c] >= before[c], 'never narrower: column ' + c);
  // the header row: Washes (C), Avg ticket ($) (D), Revenue ($) (E), Wash cost ($) (F) now fit their labels
  const need = (c, r = 1) => S.get(r, c).value.length * 6.9 + 20 + 4;
  for (const c of [3, 4, 5, 6]) assert.ok(S.colW[c] >= Math.floor(need(c)), 'header fits: column ' + c);
  assert.ok(S.colW[4] > before[4], 'Avg ticket ($) was cut off by Revenue and is widened');
  // H6 'Site totals (feed)' is a lone title over empty cells: it spills, and H is sized for the table below it
  assert.ok(S.colW[8] < need(8, 6), 'the title is not what sizes H');
  // a measurer can stand in for the engine's estimate; widths are capped the way AutoFit is
  const S2 = new LessonRun(DEMO_LESSON, { mode: 'guided' }).session.sheet;
  fitDemoColumns(S2, () => 1000);
  assert.ok(S2.colW.slice(1).every(w => w <= 220));
  // the fit changes no cell: the demo still finishes on its own solution
  run.run(DEMO_LESSON.solution);
  assert.ok(run.finished);
});

test('landing keys: the demo gets keys only while it has focus; Tab, Space and paging stay the page\'s', () => {
  const k = (key, mods = {}) => ({ key, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, ...mods });
  // not focused: nothing but a plain Enter (start) is taken from the page
  for (const key of ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End', 'Tab', 'a', 'Backspace']) assert.equal(landingKeyRoute(k(key), false), null, key);
  assert.equal(landingKeyRoute(k('f', { ctrlKey: true }), false), null, 'Ctrl+F finds in the page');
  assert.equal(landingKeyRoute(k('Enter'), false), 'start');
  assert.equal(landingKeyRoute(k('Enter', { ctrlKey: true }), false), null);
  // focused: the sheet's keys go to the demo, Tab still moves focus on
  for (const key of ['ArrowDown', 'PageDown', ' ', 'Home', 'a', 'Enter', 'Escape', 'F2']) assert.equal(landingKeyRoute(k(key), true), 'demo', key);
  assert.equal(landingKeyRoute(k('b', { ctrlKey: true }), true), 'demo');
  assert.equal(landingKeyRoute(k('Tab'), true), null);
  assert.equal(landingKeyRoute(k('Tab', { shiftKey: true }), true), null);
  assert.equal(landingKeyRoute(k('Shift', { shiftKey: true }), true), null, 'a lone modifier press is nobody\'s');
});

test('landing: the hero has one call to action and the facts each in their own place; no dot-joined fragments', () => {
  const html = landingHtml(0);
  const hero = html.slice(0, html.indexOf('id="path"'));
  assert.equal((hero.match(/id="startLearning"/g) || []).length, 1);
  assert.doesNotMatch(hero, /#\/account/, 'the top bar carries Sign in; the hero does not repeat it');
  assert.doesNotMatch(html.replace(/<[^>]+>/g, ' '), /\s·\s/, 'no facts joined by middle dots');
  assert.equal((html.match(/class="lp-facts"/g) || []).length, 1, 'the course in three facts under the start cell');
  assert.ok(html.includes('class="plate"'), 'a proof plate per section');
});

test('first run: ↑ ↓ move the highlight down one list across both questions, and the highlight is the answer', () => {
  assert.equal(pickerMove('ArrowDown', 0, 5), 1);
  assert.equal(pickerMove('ArrowDown', 4, 5), 4, 'clamped at the end');
  assert.equal(pickerMove('ArrowUp', 0, 5), 0, 'clamped at the start');
  assert.equal(pickerMove('ArrowUp', 3, 5), 2);
  assert.equal(pickerMove('Enter', 2, 5), 2);
  const a = answersAt(QUESTIONS, { platform: 'win', experience: 'new' }, 1);
  assert.deepEqual(a, { platform: 'mac', experience: 'new' }, 'the highlight on Mac answers the keyboard question');
  assert.deepEqual(answersAt(QUESTIONS, a, 4), { platform: 'mac', experience: 'daily' }, 'moving into the second question keeps the first answer');
});

test('first run hand-off: the choices and the flags', () => {
  assert.equal(LESSONS.find(l => l.id === FIRST_LESSON).module, FIRST_MODULE);
  assert.deepEqual(finishPatch({ platform: 'mac', experience: 'daily' }), { platform: 'mac', experience: 'daily', firstRunDone: true, briefingDone: true, skipped: [] });
});
