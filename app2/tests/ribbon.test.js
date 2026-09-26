// app2/tests/ribbon.test.js — the full ribbon's layout rules that are pure logic (ui/ribbon-view.js):
// a big button's label is set on at most two lines (a third line overprinted the group caption), and an
// anchored dropdown opens inside the workspace frame, flipping to its button's right edge near the edge.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bigLabelLines, dropLeft } from '../ui/ribbon-view.js';
import { RIBBON_LAYOUT, RIBBON_COMMANDS, MENU_META, UNIMPLEMENTED_BY_ID } from '../ui/ribbon-commands.js';

test('a short label or a single word stays on one line', () => {
  assert.deepEqual(bigLabelLines('Normal'), ['Normal']);
  assert.deepEqual(bigLabelLines('Orientation'), ['Orientation']);   // one word: the button widens, the word never breaks
  assert.deepEqual(bigLabelLines('100%'), ['100%']);
  assert.deepEqual(bigLabelLines('Cut It'), ['Cut It']);             // fits the 52px button's seven characters
  assert.deepEqual(bigLabelLines(''), ['']);
  assert.deepEqual(bigLabelLines(null), ['']);
});

test('a long label splits at the space that keeps the longer line shortest, as Excel sets it', () => {
  assert.deepEqual(bigLabelLines('Page Break Preview'), ['Page Break', 'Preview']);
  assert.deepEqual(bigLabelLines('Freeze Panes'), ['Freeze', 'Panes']);
  assert.deepEqual(bigLabelLines('Text to Columns'), ['Text to', 'Columns']);
  assert.deepEqual(bigLabelLines('Print Titles…'), ['Print', 'Titles…']);
  assert.deepEqual(bigLabelLines('Sort & Filter'), ['Sort &', 'Filter']);
  assert.deepEqual(bigLabelLines('  Remove   Duplicates '), ['Remove', 'Duplicates']);   // stray whitespace never makes an empty line
});

test('every big button and every group name on the full ribbon sets in at most two lines, losing no word', () => {
  const labels = [];
  const walk = it => {
    if (it.rows) return it.rows.forEach(r => r.forEach(walk));
    if (!it.big) return;
    if (it.dead) labels.push((UNIMPLEMENTED_BY_ID[it.dead] || {}).label);
    else if (it.menu && !it.cmd) labels.push((MENU_META[it.menu] || {}).label);
    else labels.push(it.label || RIBBON_COMMANDS[it.cmd].label);
  };
  for (const groups of Object.values(RIBBON_LAYOUT)) for (const g of groups) { labels.push(g.name); g.cols.forEach(walk); }
  assert.ok(labels.length > 40, 'the walk found the ribbon');
  for (const l of labels) {
    assert.equal(typeof l, 'string', 'every big item has a label');
    const lines = bigLabelLines(l);
    assert.ok(lines.length >= 1 && lines.length <= 2, `"${l}" → ${lines.length} lines`);
    assert.equal(lines.join(' '), l.trim().replace(/\s+/g, ' '), `"${l}" keeps every word in order`);
    assert.ok(lines.every(x => x.length), `"${l}" has no empty line`);
  }
});

test('a dropdown opens left-aligned to its button, inside the frame', () => {
  assert.equal(dropLeft(100, 160, 200, 33, 1237), 100);
  assert.equal(dropLeft(20, 60, 200, 33, 1237), 33);             // never left of the frame
});

test('near the frame edge a dropdown right-aligns to its button instead of hanging past it', () => {
  // Find & Select at 1280: the menu used to span 1035–1269 past the frame's right edge at 1237
  assert.equal(dropLeft(1065, 1196, 244, 33, 1237), 952);        // right edges meet: 1196 − 244
  assert.ok(dropLeft(1065, 1196, 244, 33, 1237) + 244 <= 1237);
  assert.equal(dropLeft(1200, 1260, 244, 33, 1237), 993);        // a button past the edge: the frame bounds it
  assert.equal(dropLeft(40, 80, 300, 33, 250), 33);              // wider than the room: pinned to the left edge
});
