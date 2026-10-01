// app2/tests/tells.test.js — the tells checker (M94): what the copy and the screen never do.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dashTell, emojiTell, joinedTell, capsTell, arrowLabelTell, tells } from '../content/copy/tells.js';

test('a dash used as punctuation is a tell; hyphens in words, ranges and minus signs are not', () => {
  for (const s of ['Bounce — round the report', 'week - one', 'Mon – Sat', 'two–three words joined']) assert.ok(dashTell(s), s);
  for (const s of ['A well-formatted page.', 'Drills run 60-180 seconds.', 'Mon–Sat of last week.', '1–3 minutes.', 'Cash flow of −$200k.', 'FY27–FY31']) assert.equal(dashTell(s), null, s);
});

test('an emoji or an icon symbol is a tell; key glyphs are key names', () => {
  for (const s of ['Done ✓', '✨ New', '★ Legendary', '• bullet']) assert.ok(emojiTell(s), s);
  for (const s of ['Press Ctrl+↓.', 'Then ↑ five times.', 'Enter ↵ commits.', '⌘ and ⌥ on a Mac.', 'Microsoft® Excel™']) assert.equal(emojiTell(s), null, s);
});

test('facts joined by a middle dot or a pipe are a tell; the paragraph break is not', () => {
  assert.ok(joinedTell('Free · No account · Ten minutes'));
  assert.ok(joinedTell('Daily | public board'));
  assert.equal(joinedTell('First paragraph. || Second paragraph.'), null);
  assert.equal(joinedTell('Time to execute.'), null);
});

test('capitals: shouting is a tell; keys, functions and acronyms are not', () => {
  assert.ok(capsTell('NEVER merge cells.'));
  assert.ok(capsTell('A BRAND new best.'));
  for (const s of ['Use VLOOKUP or XLOOKUP.', 'EBITDA and the DCF.', 'QUARTILE.INC skips text.', 'The P&L sheet.', '#VALUE! means text.', 'Press `F4`.']) assert.equal(capsTell(s), null, s);
});

test('an arrow at the end of a label is a tell; a key chord ending in an arrow is not', () => {
  assert.ok(arrowLabelTell('Start learning →'));
  assert.ok(arrowLabelTell('Next ›'));
  assert.equal(arrowLabelTell('Ctrl+Shift+→'), null);
  assert.deepEqual(tells('Start learning →', { label: true }), ['an arrow or symbol at the end of a label']);
});

test('text typed into a cell is exempt', () => {
  assert.deepEqual(tells('Type "AUS - Domain" into A5.'), []);
  assert.deepEqual(tells('Enter =B4-C4 in D4.'), []);
});
