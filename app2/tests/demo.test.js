// node --test app2/tests/demo.test.js — the self-playing demo and its two hosts (the landing and the
// first run): how a teach line boxes its keys, the demo's column fit, where a key on the landing goes,
// the hero's small print, and what the first run's picker and hand-off do.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { teachTokens, teachHtml, fitDemoColumns, DEMO_LESSON } from '../ui/demo-player.js';
import { LessonRun } from '../app/runner.js';
import { landingKeyRoute, microClauses, landingHtml, MODES } from '../app/landing-next.js';
import { finishPatch, pickerMove, FIRST_MODULE, FIRST_LESSON } from '../app/first-run-next.js';
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
  // the header row: kWh sold (C), Price ($/kWh) (D), Revenue ($) (E), Energy cost ($) (F) now fit their labels
  const need = (c, r = 1) => S.get(r, c).value.length * 6.9 + 20 + 4;
  for (const c of [3, 4, 5, 6]) assert.ok(S.colW[c] >= Math.floor(need(c)), 'header fits: column ' + c);
  assert.ok(S.colW[3] > before[3], 'kWh sold was cut off by Price and is widened');
  // H6 'Site totals (platform)' is a lone title over empty cells: it spills, and H is sized for the table below it
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

test('landing: the small print is whole clauses; the modes link where a guest can go; the hero has one call to action', () => {
  assert.deepEqual(microClauses('Chapter 1 is free · no account to start · nothing to install · progress saved on this device'),
    ['Chapter 1 is free', 'no account to start', 'nothing to install', 'progress saved on this device']);
  assert.deepEqual(microClauses(''), []);
  const html = landingHtml(0);
  const hero = html.slice(0, html.indexOf('id="lModes"'));
  assert.ok(hero.includes('id="startLearning"'));
  assert.doesNotMatch(hero, /#\/account/, 'the nav carries Sign in; the hero does not repeat it');
  assert.doesNotMatch(html, /<video[^>]*\sautoplay/, 'clips start when they are on screen, not on load');
  assert.equal((html.match(/class="ld2-clip-fb"/g) || []).length, 6, 'every clip has a card behind it');
  assert.deepEqual(MODES.map(m => m.href), ['#/start', '#/start', '#/practice', '#/practice', '#/practice', '#/leaderboard']);
  // the micro line renders as spans, never a literal separator
  const micro = html.slice(html.indexOf('ld2-micro-list'), html.indexOf('</div>', html.indexOf('ld2-micro-list')));
  assert.doesNotMatch(micro, /·/);
});

test('first run: ← → pick within a question, ↑ ↓ move between the two', () => {
  assert.deepEqual(pickerMove('ArrowRight', 'platform', 0, 2), { pick: 1 });
  assert.deepEqual(pickerMove('ArrowRight', 'platform', 1, 2), { pick: 0 }, 'wraps');
  assert.deepEqual(pickerMove('ArrowLeft', 'experience', 0, 3), { pick: 2 });
  assert.deepEqual(pickerMove('ArrowDown', 'platform', 0, 2), { group: 'experience' }, '↓ never changes the keyboard');
  assert.deepEqual(pickerMove('ArrowUp', 'experience', 2, 3), { group: 'platform' });
  assert.deepEqual(pickerMove('ArrowDown', 'experience', 0, 3), { stay: true });
  assert.deepEqual(pickerMove('ArrowUp', 'platform', 1, 2), { stay: true });
  assert.equal(pickerMove('Enter', 'platform', 0, 2), null);
});

test('first run hand-off: the choices and flags; 1.1\'s beat marked seen only when the deal was read', () => {
  assert.equal(LESSONS.find(l => l.id === FIRST_LESSON).module, FIRST_MODULE);
  const read = finishPatch({ platform: 'mac', experience: 'daily', sawDeal: true }, ['move-and-select']);
  assert.deepEqual(read, { platform: 'mac', experience: 'daily', firstRunDone: true, briefingDone: true, skipped: [], beatsSeen: ['move-and-select', FIRST_MODULE] });
  assert.deepEqual(finishPatch({ platform: 'win', experience: 'new', sawDeal: true }, [FIRST_MODULE]).beatsSeen, [FIRST_MODULE], 'no duplicate');
  const skipped = finishPatch({ platform: 'win', experience: 'new', sawDeal: false }, []);
  assert.equal('beatsSeen' in skipped, false, 'Esc past the deal: the beat still plays in 1.1.1');
});
