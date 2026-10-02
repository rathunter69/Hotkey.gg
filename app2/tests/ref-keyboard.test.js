// app2/tests/ref-keyboard.test.js — the keyboard on Reference (ui/components/keyboard.js): a chord names
// the board keys it holds, a real press becomes the same set, and only presses with Ctrl (Cmd on a
// Mac) or a function key are lookups, so the arrows, Enter, typing and Alt keep their jobs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEYBOARD, NAV_CLUSTER, keyIdsOf, keysTouched, chordOfEvent, sameKeys, chordLabel, keyboardHtml } from '../ui/components/keyboard.js';
import { REFERENCE, parseChord } from '../content/reference.js';

const ids = (...k) => new Set(k);

test('a chord names the board keys it holds, one set per alternative', () => {
  assert.ok(sameKeys(keyIdsOf('Ctrl+Home', parseChord)[0], ids('Ctrl', 'Home')));
  assert.equal(keyIdsOf('Ctrl+↑/↓/←/→', parseChord).length, 4);
  // a shifted symbol is Shift and the key that types it
  assert.ok(sameKeys(keyIdsOf('Ctrl+Shift+$', parseChord)[0], ids('Ctrl', 'Shift', '4')));
  assert.ok(sameKeys(keyIdsOf('Ctrl+Shift++', parseChord)[0], ids('Ctrl', 'Shift', '=')));
  // a sequence is looked up by its first step; every step colours the board
  assert.ok(sameKeys(keyIdsOf('Alt H B O', parseChord)[0], ids('Alt')));
  assert.ok(sameKeys(keysTouched('Alt H B O', parseChord), ids('Alt', 'H', 'B', 'O')));
});

test('every key a course chord uses is on the board', () => {
  const board = new Set([...KEYBOARD, ...NAV_CLUSTER].flat().map(k => k.id).filter(Boolean));
  const missing = new Set();
  for (const e of REFERENCE.filter(x => !x.addin)) for (const id of keysTouched(e.win, parseChord)) if (!board.has(id)) missing.add(id);
  assert.deepEqual([...missing], []);
});

test('a real press becomes the same set; only Ctrl, Cmd on a Mac, or a function key is a lookup', () => {
  const ev = o => ({ ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...o });
  assert.ok(sameKeys(chordOfEvent(ev({ ctrlKey: true, code: 'Home' })), ids('Ctrl', 'Home')));
  assert.ok(sameKeys(chordOfEvent(ev({ ctrlKey: true, shiftKey: true, code: 'Digit4' })), ids('Ctrl', 'Shift', '4')));
  assert.ok(sameKeys(chordOfEvent(ev({ metaKey: true, code: 'KeyB' }), 'mac'), ids('Ctrl', 'B')));
  assert.ok(sameKeys(chordOfEvent(ev({ code: 'F2' })), ids('F2')));
  assert.equal(chordOfEvent(ev({ code: 'ArrowDown' })), null, 'the arrows move the cursor');
  assert.equal(chordOfEvent(ev({ code: 'KeyA' })), null, 'typing is typing');
  assert.equal(chordOfEvent(ev({ altKey: true, ctrlKey: true, code: 'KeyV' })), null, 'Alt is the Ribbon');
  assert.equal(chordOfEvent(ev({ metaKey: true, code: 'KeyB' }), 'win'), null);
  assert.equal(chordLabel(ids('4', 'Shift', 'Ctrl')), 'Ctrl+Shift+4');
  // a press finds Currency
  const hit = REFERENCE.filter(e => !e.addin && keyIdsOf(e.win, parseChord).some(s => sameKeys(s, ids('Ctrl', 'Shift', '4'))));
  assert.ok(hit.length >= 1);
});

test('the board draws every key with its id and marks the used ones', () => {
  const html = keyboardHtml({ marks: { H: { g: 'format', on: true }, B: { g: 'format', on: false } } });
  assert.match(html, /class="kb-key kb-used kb-on" data-k="H" data-g="format"/);
  assert.match(html, /class="kb-key kb-used" data-k="B" data-g="format"/);
  assert.match(html, /data-k="Home"/);
});
