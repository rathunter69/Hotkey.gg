// The workspace chrome (M91): the Esc ladder, the lesson menu's rows, the More menu as data with
// its site.csv rows, and the stuck cue's live line.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escLadder, lessonRows, MORE_ITEMS } from '../ui/components/chrome.js';
import { stuckLine } from '../ui/components/task-card.js';
import { COPY } from '../content/copy/index.js';
import { SITE_KEYS } from '../content/copy/rules.js';

test('escLadder: Excel\'s Esc: an edit, then a note, a menu or Help, then the marching ants; with nothing to close, a hint, never leave', () => {
  assert.equal(escLadder({ editing: true, note: true, menu: true }), 'edit');
  assert.equal(escLadder({ note: true, menu: true }), 'note');
  assert.equal(escLadder({ menu: 'more', help: true }), 'menu');
  assert.equal(escLadder({ help: true, ants: true }), 'help');
  assert.equal(escLadder({ ants: true }), 'ants');
  assert.equal(escLadder({}), 'hint');
  for (const s of [{}, { partWay: true }, { partWay: true, armed: true }]) assert.notEqual(escLadder(s), 'leave', 'Esc never leaves the workspace');
});

test('lessonRows: number, title, Done or the current goal line at the right', () => {
  const list = [{ id: 'a', num: '1.5.1', title: 'One', href: '#/lesson/a' }, { id: 'b', num: '1.5.2', title: 'Two', href: '#/lesson/b' }, { id: 'c', num: '1.5.3', title: 'Three', href: '#/lesson/c' }];
  const rows = lessonRows(list, { currentId: 'b', progress: { a: { completed: true } }, goalLine: 'Goal 4 of 8' });
  assert.equal(rows[0].right, 'Done');
  assert.equal(rows[1].right, 'Goal 4 of 8'); assert.equal(rows[1].current, true);
  assert.equal(rows[2].right, '');
  assert.equal(lessonRows(null).length, 0);
});

test('MORE_ITEMS: the five items of 3.0 and Exit, with their keys and rows', () => {
  assert.deepEqual(MORE_ITEMS.map(i => i.id), ['lessons', 'restart', 'collapse', 'move', 'report', 'exit']);
  assert.equal(MORE_ITEMS.find(i => i.id === 'exit').key, 'Ctrl+Shift+X');
  assert.equal(MORE_ITEMS.find(i => i.id === 'collapse').key, 'Ctrl+F1');
  assert.equal(MORE_ITEMS.find(i => i.id === 'move').key, 'Ctrl+Shift+J');
  for (const it of MORE_ITEMS) { assert.ok(COPY.site[it.copy], it.copy); assert.ok(SITE_KEYS.includes(it.copy), it.copy + ' is a listed key'); }
  assert.equal(COPY.site.more_expand, 'Show the Ribbon');
  for (const k of ['ws_exit', 'ws_exit_hint', 'leave_title', 'leave_body', 'leave_stay', 'leave_action', 'restart_title', 'restart_body', 'restart_action', 'dialog_cancel', 'ws_goal_count', 'ws_task_count']) assert.ok(COPY.site[k], k);
});

test('stuckLine: the subtle line after the pulse cue', () => {
  assert.equal(stuckLine('pulse B5 · Ctrl+↓ jumps to the edge of the data.'), 'Ctrl+↓ jumps to the edge of the data.');
  assert.equal(stuckLine('pulse A1'), '');
  assert.equal(stuckLine('Try F2.'), 'Try F2.');
  assert.equal(stuckLine(''), '');
});
