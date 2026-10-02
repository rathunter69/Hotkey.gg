// app2/tests/key-states.test.js — the keys sheet (M50) and the learner's key states (M57).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { KEYS } from '../content/keys.js';
import { parseCsv } from '../content/copy/csv.js';
import { LESSONS, CHAPTERS } from '../content/index.js';
import { REFERENCE } from '../content/reference.js';
import { RAPID_DECK } from '../content/rapid-deck.js';
import { REFERENCE_GROUPS } from '../app/reference-page.js';
import { normRoute, pressedForms, keyIdsPressed, keyIdsForConcept, stateOf, collected, KEY_STATES } from '../app/key-states.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { shortcutsUsed } from '../app/runner.js';

const LESSON_BY_ID = Object.fromEntries(LESSONS.map(l => [l.id, l]));

test('M50: keys.csv carries the columns the build list names, and content/keys.js is that sheet', () => {
  const { header, rows } = parseCsv(readFileSync(new URL('../content/keys.csv', import.meta.url), 'utf8'));
  for (const col of ['command', 'group', 'win', 'ribbon', 'legacy', 'mac', 'lesson', 'alternatives']) assert.ok(header.includes(col), `the sheet has a ${col} column`);
  assert.deepEqual(rows, KEYS, 'content/keys.js is the sheet, inlined');
  assert.ok(KEYS.length >= 140, `${KEYS.length} keys: Chapter 1's and the commands Chapters 2 to 6 teach`);
});

test('M50: every row is complete and consistent: unique id, its group, the Mac key, a lesson in the catalog in the chapter it says', () => {
  const ids = KEYS.map(k => k.id);
  assert.equal(new Set(ids).size, ids.length, 'ids unique');
  const groupOf = Object.fromEntries(REFERENCE_GROUPS.flatMap(g => g.categories.map(c => [c, g.id])));
  for (const k of KEYS) {
    assert.ok(/^[a-z0-9-]+$/.test(k.id), `${k.id}: a slug`);
    assert.ok(k.command && k.win && k.mac && k.what, `${k.id}: command, Windows key, Mac key and what it does`);
    assert.equal(k.group, groupOf[k.category], `${k.id}: the group (${k.group}) is the one its category (${k.category}) sits in`);
    if (k.lesson) {
      const l = LESSON_BY_ID[k.lesson];
      assert.ok(l, `${k.id}: lesson ${k.lesson} is in the catalog`);
      assert.equal(Number(k.chapter), CHAPTERS.findIndex(c => c.id === l.chapter) + 1, `${k.id}: chapter ${k.chapter} is the lesson's`);
    } else assert.equal(k.chapter, '', `${k.id}: no lesson, no chapter`);
    assert.ok(!/colour|—|–/.test(k.what + k.alternatives + k.command), `${k.id}: American spelling, no dashes`);
  }
  assert.ok(KEYS.filter(k => k.ribbon).length >= 15, 'Ribbon routes are filled in');
  assert.ok(KEYS.filter(k => k.legacy).length >= 25, 'legacy chords are filled in');
  assert.ok(new Set(KEYS.filter(k => k.lesson).map(k => k.chapter)).size >= 5, 'keys taught across the chapters');
});

test('M50: the reference reads the sheet, so the page, the public pages and the Help tab describe a key once', () => {
  const native = REFERENCE.filter(e => !e.addin);
  assert.deepEqual(native.map(e => e.id), KEYS.map(k => k.id));
  const fc = REFERENCE.find(e => e.id === 'ctrl-1');
  assert.equal(fc.legacy, 'Alt O E'); assert.equal(fc.ribbon, 'Alt H O E');
  assert.equal(REFERENCE.find(e => e.id === 'alt-h-f-c').what.includes('colour'), false, 'the "colour" on the old page is fixed');
});

test('M19 and M50: every rapid-fire prompt is a key on the sheet, so the deck and the Reference page agree', () => {
  for (const p of RAPID_DECK) assert.ok(keyIdsPressed([p.keys]).length >= 1, `${p.id} (${p.keys}) is a row of keys.csv`);
});

test('M19: every taught key has a prompt, apart from the plain moves and commits, the sheet tabs (a fragment is one sheet), F9 and the Ribbon route to Format Cells', () => {
  const NO_PROMPT = ['arrow-keys', 'tab-move', 'enter-move', 'enter-commit', 'tab-commit', 'esc-cancel', 'esc-ribbon', 'ctrl-page-up-down',
    'alt-h-o-r', 'alt-h-i-s', 'alt-h-d-s', 'alt-h-o-m', 'f9', 'alt-h-o-e'];
  const covered = new Set(keyIdsPressed(RAPID_DECK.map(p => p.keys)));
  const missing = KEYS.filter(k => k.lesson && !covered.has(k.id)).map(k => k.id);
  assert.deepEqual(missing.sort(), NO_PROMPT.slice().sort());
});

test('normRoute and pressedForms: modifier order, Enter and Esc, the arrows spread, a sequence opened by a chord', () => {
  assert.equal(normRoute('Shift+Alt+→'), normRoute('Alt+Shift+→'));
  assert.equal(normRoute('Ctrl+Alt+V V Enter'), normRoute('Ctrl+Alt+V V ↵'));
  assert.equal(normRoute('Escape'), normRoute('Esc'));
  const arrows = pressedForms(KEYS.find(k => k.id === 'ctrl-arrow'));
  for (const k of ['Ctrl+↑', 'Ctrl+↓', 'Ctrl+←', 'Ctrl+→']) assert.ok(arrows.has(normRoute(k)), k);
  assert.ok(pressedForms(KEYS.find(k => k.id === 'paste-values')).has(normRoute('Ctrl+Alt+V')), 'the opening chord of Ctrl+Alt+V V Enter');
  assert.ok(pressedForms(KEYS.find(k => k.id === 'ctrl-1')).has(normRoute('Alt O E')), 'the legacy chord counts as the key');
});

test('M57: the keys a real run presses are found from its key log, whatever the route', () => {
  const s = new Session(new Sheet());
  s.run('Ctrl+Shift+4 Ctrl+B Ctrl+Down Alt H B O Alt W F F Ctrl+[ Shift+Alt+Right');
  const ids = keyIdsPressed(shortcutsUsed(s.keyLog));
  for (const id of ['ctrl-shift-dollar', 'ctrl-b', 'ctrl-arrow', 'alt-h-b-o', 'group', 'alt-w-f-f', 'ctrl-lbracket']) assert.ok(ids.includes(id), `${id} is practiced`);
  assert.ok(!ids.includes('ctrl-i'), 'a key not pressed stays where it was');
  assert.deepEqual(keyIdsPressed([]), []);
  assert.ok(keyIdsForConcept('ctrl-arrow').includes('ctrl-arrow'));
});

test('M57: the four states in order: under par, practiced, taught, not yet', () => {
  assert.deepEqual(KEY_STATES, ['not-yet', 'taught', 'practiced', 'under-par']);
  const k = KEYS.find(x => x.id === 'ctrl-1');
  assert.equal(stateOf(k, {}), 'not-yet');
  assert.equal(stateOf(k, { done: new Set([k.lesson]) }), 'taught');
  assert.equal(stateOf(k, { done: new Set([k.lesson]), records: { 'ctrl-1': { p: 1 } } }), 'practiced');
  assert.equal(stateOf(k, { records: { 'ctrl-1': { p: 1, u: 2 } } }), 'under-par');
  assert.equal(stateOf(k, { practiced: new Set([k.concept]) }), 'practiced', 'a refresher rep counts');
  assert.equal(collected(KEYS, { records: { 'ctrl-1': { p: 1 }, 'ctrl-b': { u: 1 } } }), 2);
});

test('M57: the store marks practiced and under par once, keeps the first stamp, and merges the account copy', async () => {
  const mem = new Map();
  globalThis.localStorage = { getItem: k => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k) };
  try {
    const { keyStates } = await import('../app/key-states.js');
    keyStates.clear();
    assert.deepEqual(keyStates.notePressed([{ keys: 'Ctrl+B', count: 2 }], 100), ['ctrl-b']);
    assert.deepEqual(keyStates.notePressed(['Ctrl+B'], 200), [], 'practiced once');
    assert.equal(keyStates.records()['ctrl-b'].p, 100);
    assert.deepEqual(keyStates.noteUnderPar(['ctrl-arrow', 'nope'], 300), ['ctrl-arrow']);
    assert.deepEqual(keyStates.records()['ctrl-arrow'], { p: 300, u: 300 }, 'under par is practiced too');
    keyStates.merge({ 'ctrl-b': { p: 50, u: 60 }, 'nope': { p: 1 } });
    assert.deepEqual(keyStates.records()['ctrl-b'], { p: 50, u: 60 }, 'the earlier stamp wins');
    assert.equal(keyStates.records().nope, undefined, 'unknown ids are dropped');
  } finally { delete globalThis.localStorage; }
});
