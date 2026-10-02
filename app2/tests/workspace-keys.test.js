// The workspace's keys (Wolf, 2026-10-02): the sheet keys in a browser (Ctrl+PgDn is the browser's,
// so Alt+PgDn, Ctrl+Alt+PgDn and ⌥→ are aliases logged as Excel's key), PgDn and PgUp a screen with
// the window moving along, Exit's chord, the strip's sheet-key hint, a goal's alternate routes and
// the gentle wrong-key lines, the off-screen target's pill, and the focus veil's key rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { sheetKeys, isExitKey, EXIT_KEY, noteSheetKey } from '../ui/components/chrome.js';
import { alternates, offRoute, tryLine, worksToo, worksTooLine, routeTokens } from '../ui/components/task-card.js';
import { beaconPlace } from '../ui/components/sheet-marks.js';
import { veilSwallows } from '../ui/components/focus-veil.js';
import { MOMENTS } from '../ui/effects.js';
import { validateLesson, isAltKeys } from '../content/schema.js';
import { LESSONS } from '../content/index.js';
import { COPY } from '../content/copy/index.js';

const book = () => { const s = new Session(new Sheet({}), { now: () => 0 }); s.addSheet('Two'); s.addSheet('Three'); return s; };
const logged = s => s.keyLog.map(e => e.k);

test('sheet keys: Ctrl+PgDn, and the browser aliases Alt+PgDn, Ctrl+Alt+PgDn and Alt+→, all switch sheets and log Excel\'s key', () => {
  const s = book();
  s.key({ key: 'PageDown', ctrlKey: true }); assert.equal(s.sheetIndex, 1);
  s.key({ key: 'PageDown', altKey: true }); assert.equal(s.sheetIndex, 2);
  s.key({ key: 'PageUp', ctrlKey: true, altKey: true }); assert.equal(s.sheetIndex, 1);
  s.key({ key: 'ArrowLeft', altKey: true }); assert.equal(s.sheetIndex, 0);
  s.key({ key: 'ArrowRight', altKey: true }); assert.equal(s.sheetIndex, 1);
  s.key({ key: 'PageUp', altKey: true }); assert.equal(s.sheetIndex, 0);
  assert.deepEqual(logged(s), ['Ctrl+PgDn', 'Ctrl+PgDn', 'Ctrl+PgUp', 'Ctrl+PgUp', 'Ctrl+PgDn', 'Ctrl+PgUp'], 'every route counts as Excel\'s key for a goal');
});

test('sheet keys: with Shift the aliases group sheets as Ctrl+Shift+PgDn does in Excel; Alt+Shift+→ stays Group', () => {
  const s = book();
  s.key({ key: 'PageDown', altKey: true, shiftKey: true });
  assert.equal(s.sheetIndex, 1); assert.equal(s.isGrouped(), true);
  assert.deepEqual(logged(s), ['Ctrl+Shift+PgDn']);
});

test('sheet keys: mid-formula, Alt+PgDn shows the next sheet for pointing, as Ctrl+PgDn does', () => {
  const s = book();
  s.run('"=" ');
  s.key({ key: 'PageDown', altKey: true });
  assert.equal(s.editing, true, 'the entry stays open'); assert.equal(s.sheetIndex, 1);
});

test('PgDn and PgUp move a screen and leave the rows moved for the view, so the window moves with the cursor (Excel)', () => {
  const s = new Session(new Sheet({}), { now: () => 0 });
  s.pageRows = 20;
  s.key({ key: 'PageDown' });
  assert.equal(s.sheet.active.r, 21); assert.deepEqual(s.pageJump, { rows: 20 });
  s.pageJump = null;
  s.key({ key: 'PageUp' });
  assert.equal(s.sheet.active.r, 1); assert.deepEqual(s.pageJump, { rows: -20 });
  s.key({ key: 'PageUp' });
  assert.deepEqual(s.pageJump, { rows: 0 }, 'at the top nothing moves');
  s.key({ key: 'PageDown', shiftKey: true });
  assert.equal(s.sheet.selectionText(), 'A1:A21', 'Shift+PgDn extends a screen');
  assert.deepEqual(logged(s), ['PageDown', 'PageUp', 'PageUp', 'Shift+PageDown']);
});

test('Exit: Ctrl+Shift+X, and only that chord', () => {
  assert.equal(EXIT_KEY, 'Ctrl+Shift+X');
  assert.equal(isExitKey({ key: 'X', ctrlKey: true, shiftKey: true }), true);
  assert.equal(isExitKey({ key: 'x', ctrlKey: true, shiftKey: true }), true);
  assert.equal(isExitKey({ key: 'X', ctrlKey: true, shiftKey: true, altKey: true }), false);
  assert.equal(isExitKey({ key: 'x', ctrlKey: true }), false, 'Ctrl+X is Cut');
  assert.equal(isExitKey({ key: 'Escape' }), false, 'Esc never leaves');
});

test('sheetKeys: nothing for one sheet; Excel\'s keys with the browser alias until the real keys arrive; ⌥ arrows on a Mac', () => {
  assert.equal(sheetKeys({ sheets: 1 }), null);
  assert.deepEqual(sheetKeys({ sheets: 4 }), { keys: ['Ctrl+PgUp', 'Ctrl+PgDn'], alias: ['Alt+PgUp', 'Alt+PgDn'] });
  assert.deepEqual(sheetKeys({ sheets: 4, delivered: true }), { keys: ['Ctrl+PgUp', 'Ctrl+PgDn'], alias: null });
  assert.deepEqual(sheetKeys({ sheets: 2, platform: 'mac' }).alias, ['Alt+←', 'Alt+→']);
  assert.equal(noteSheetKey({ key: 'PageDown', altKey: true }), false, 'the alias proves nothing');
  assert.equal(noteSheetKey({ key: 'PageDown', ctrlKey: true }), true, 'Excel\'s own key arrived');
  assert.equal(noteSheetKey({ key: 'PageUp', ctrlKey: true }), false, 'only the first time');
});

test('alternates: a goal\'s alt data, and the browser alias for the sheet keys (whole for a route of sheet keys, the keys alone inside a longer one)', () => {
  assert.deepEqual(alternates({ keys: 'Ctrl+Shift+=', alt: 'Alt H I C' }), ['Alt H I C']);
  assert.deepEqual(alternates({ keys: 'Ctrl+Shift+=', alt: ['Alt H I C', 'Alt H I C'] }), ['Alt H I C']);
  assert.deepEqual(alternates({ keys: 'Ctrl+PgDn ×3' }), ['Alt+PgDn ×3']);
  assert.deepEqual(alternates({ keys: 'Ctrl+PgDn ×2 ↓ Ctrl+PgUp ↵' }), ['Alt+PgDn', 'Alt+PgUp']);
  assert.deepEqual(alternates({ keys: 'Ctrl+PgDn ×3' }, { browserTab: false }), [], 'the installed app has the real keys');
  assert.deepEqual(alternates({ keys: 'Ctrl+↓' }), []);
  assert.deepEqual(alternates(null), []);
});

test('offRoute: a key off the shown route, unless an alternate is under way', () => {
  const route = routeTokens('Ctrl+Shift+='), alt = [routeTokens('Alt H I C')];
  assert.equal(offRoute(route, alt, ['Ctrl+Shift+=']), false);
  assert.equal(offRoute(route, alt, ['Alt', 'H']), false, 'the Ribbon route is under way');
  assert.equal(offRoute(route, alt, ['↓']), true);
  assert.equal(offRoute(routeTokens('↓ ×5 Ctrl+↓'), [], ['↓', '↓', '↓', '↓', '↓', '↓']), false, 'one ↓ too many starts the route again, not a wrong key');
  assert.equal(offRoute([], [], ['↓']), false, 'no keys shown, nothing to be off');
});

test('tryLine and worksToo: the gentle lines', () => {
  const route = routeTokens('↓ ×5 Ctrl+↓');
  assert.equal(tryLine({ matched: 0 }, route, 'win'), 'Not quite. Try ↓.');
  assert.equal(worksToo(route, [], ['Ctrl+↓']), true, 'landed by another route: that works too');
  assert.equal(worksToo(route, [], ['↓', '↓', '↓', '↓', '↓', 'Ctrl+↓']), false, 'the route shown');
  assert.equal(worksToo(routeTokens('Ctrl+Shift+='), [routeTokens('Alt H I C')], ['Alt', 'H', 'I', 'C']), false, 'an alternate the card showed');
  assert.equal(worksToo(route, [], []), false);
  assert.match(worksTooLine(route, 'win'), /^That works too\. .*↓ ↓ ↓ ↓ ↓ Ctrl\+↓\.$/);
  for (const k of ['card_live_try', 'card_live_works', 'card_also_works']) assert.ok(COPY.site[k], k);
});

test('beaconPlace: nothing while the target shows; on the edge that faces it, with the way to go', () => {
  const view = { sl: 0, st: 0, w: 800, h: 600, x0: 40, y0: 20 };
  assert.equal(beaconPlace({ left: 100, top: 100, width: 64, height: 20 }, view), null);
  const below = beaconPlace({ left: 40, top: 1200, width: 64, height: 20 }, view);
  assert.equal(below.arrow, '↓'); assert.ok(below.top + 22 <= 600 && below.top > 500, 'at the bottom edge');
  assert.equal(beaconPlace({ left: 2000, top: 100, width: 64, height: 20 }, view).arrow, '→');
  assert.equal(beaconPlace({ left: 2000, top: 1200, width: 64, height: 20 }, view).arrow, '↘');
  assert.equal(beaconPlace({ left: 40, top: 100, width: 64, height: 20 }, { ...view, st: 900 }).arrow, '↑', 'scrolled past it');
});

test('the focus veil swallows any key, a modifier included; the ping is a registered moment', () => {
  for (const key of ['a', 'Enter', 'Alt', 'ArrowDown', 'Escape']) assert.equal(veilSwallows({ key }), true, key);
  assert.equal(veilSwallows({ key: '' }), false);
  assert.ok(MOMENTS['cursor-ping'] && MOMENTS['cursor-ping'].token === 'd-ping');
  for (const k of ['ws_focus_title', 'ws_focus_where', 'ws_focus_clock']) assert.ok(COPY.site[k], k);
});

test('schema: alt is another route as keycaps, on a goal with keys; every lesson that carries one validates', () => {
  assert.equal(isAltKeys('Alt H I C'), true); assert.equal(isAltKeys(['Alt H I C', 'Ctrl+Shift+=']), true);
  assert.equal(isAltKeys(''), false); assert.equal(isAltKeys([]), false); assert.equal(isAltKeys([3]), false);
  const withAlt = LESSONS.filter(l => l.goals.some(g => g.alt));
  assert.ok(withAlt.length >= 1, 'some Chapter 1 goals carry an alt');
  for (const l of withAlt) assert.deepEqual(validateLesson(l), [], l.id);
  const bad = { ...withAlt[0], goals: withAlt[0].goals.map((g, i) => (i === 0 ? { ...g, alt: 7 } : g)) };
  assert.ok(validateLesson(bad).some(e => /alt is another route/.test(e)));
});
