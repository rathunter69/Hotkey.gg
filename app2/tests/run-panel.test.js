// The one run panel (M93, M98): the clock and par formats, the time track's bands and markers, the
// pace line, the board line, the Ready facts, and the checklist fold the Run beat shows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fmtClock, fmtPar, fmtDelta, trackModel, paceLabel, tierLabel, tierMarks, boardLine, aboutLength, TRACK_PAST_PASS, PANEL_W } from '../ui/components/run-panel.js';
import { createChecklist, landTo, assist, view } from '../app/checklist.js';
import { pace } from '../app/run-record.js';

test('fmtClock and fmtPar: m:ss.t for a clock, m:ss for a par', () => {
  assert.equal(fmtClock(0), '0:00.0');
  assert.equal(fmtClock(30.44), '0:30.4');
  assert.equal(fmtClock(78.46), '1:18.4');
  assert.equal(fmtClock(-3), '0:00.0');
  assert.equal(fmtPar(120), '2:00');
  assert.equal(fmtPar(84.4), '1:24');
  assert.equal(fmtPar(66), '1:06');
  assert.equal(fmtDelta(6.24), '6.2');
  assert.equal(fmtDelta(6), '6');
});

test('tiers: the labels and the marks', () => {
  assert.equal(tierLabel('pro'), 'Expert');
  assert.equal(tierLabel('legendary'), 'Legendary');
  assert.equal(tierLabel('none'), 'No tier');
  assert.equal(tierMarks('pass'), 1); assert.equal(tierMarks('legendary'), 3); assert.equal(tierMarks('none'), 0);
});

test('trackModel: three bands to the Pass par, gray past it, the run and the best in percent', () => {
  const pars = { pass: 120, pro: 84, legendary: 66 };
  const m = trackModel(pars, { secs: 78.4, best: 84.6 });
  assert.equal(m.span, 120 * TRACK_PAST_PASS);
  assert.equal(m.bands.length, 3);
  assert.equal(m.bands[0].tier, 'legendary'); assert.equal(m.bands[0].from, 0);
  assert.ok(Math.abs(m.bands[2].to - 100 / TRACK_PAST_PASS) < 1e-9, 'the Pass band ends at the Pass par');
  assert.ok(m.marker > m.bands[0].to && m.marker < m.bands[1].to, 'the run sits in the Expert band');
  assert.ok(m.best > m.marker, 'the old best sits to the right of a faster run');
  assert.deepEqual(m.labels.map(l => l.label), ['Legendary', 'Expert', 'Pass']);
  assert.equal(trackModel(pars, {}).marker, null);
  assert.equal(trackModel(null, { secs: 10 }).span, 60 * TRACK_PAST_PASS);
});

test('paceLabel from run-record pace: "{tier} pace", "Behind Pass pace", nothing before the first goal', () => {
  const pars = { pass: 120, pro: 84, legendary: 66 };
  assert.equal(paceLabel(pace(10, 0, 10, pars).tier), '');
  assert.equal(paceLabel(pace(30, 5, 10, pars).tier), 'Legendary pace');
  assert.equal(paceLabel(pace(40, 5, 10, pars).tier), 'Expert pace');
  assert.equal(paceLabel(pace(55, 5, 10, pars).tier), 'Pass pace');
  assert.equal(paceLabel(pace(70, 5, 10, pars).tier), 'Behind Pass pace');
});

test('boardLine: the place, the field and the move', () => {
  assert.equal(boardLine(31, 212, 9), '31st of 212, up 9');
  assert.equal(boardLine(2, 40, -3), '2nd of 40, down 3');
  assert.equal(boardLine(3, 40, 0), '3rd of 40');
  assert.equal(boardLine(11, 40), '11th of 40');
  assert.equal(boardLine(0, 40), '');
});

test('aboutLength: the Ready length from the Pass par', () => {
  assert.equal(aboutLength(120), '2 minutes');
  assert.equal(aboutLength(75), '1 minute');
  assert.equal(aboutLength(45), '45 seconds');
  assert.equal(aboutLength(0), '');
});

test('the Run beat’s checklist fold: done tasks fold into one line, the current, the next few, the rest counted', () => {
  let s = createChecklist(Array.from({ length: 13 }, (_, i) => ({ id: 'g' + i, text: 'Task ' + (i + 1) })));
  s = landTo(s, 5);
  const v = view(s, { next: 5 });
  assert.equal(v.done, 5);
  assert.equal(v.current.index, 5);
  assert.equal(v.next.length, 5);
  assert.equal(v.moreAfter, 2);
  s = assist(s);
  assert.equal(view(s).assisted, 1);
  const all = view(landTo(s, 13));
  assert.equal(all.allDone, true); assert.equal(all.current, null);
  assert.equal(PANEL_W, 340);
});
