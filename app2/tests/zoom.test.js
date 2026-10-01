// app2/tests/zoom.test.js — M99: a drill or challenge opens zoomed to fit its used range, between
// the learner's sheet-zoom setting (the floor) and 150%; the zoom lands on the sheet as its property.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { fitZoomFor, fitOptions, opensFitted, ZOOM_FLOORS, ZOOM_FIT_MAX } from '../app/zoom.js';

test('the floor is the setting, the cap is 150', () => {
  assert.deepEqual(fitOptions({ sheetZoom: '125' }), { floor: 125, max: 150 });
  assert.deepEqual(fitOptions({ sheetZoom: 110 }), { floor: 110, max: 150 });
  assert.deepEqual(fitOptions({ sheetZoom: '80' }), { floor: 100, max: 150 }, 'an unknown setting floors at 100');
  assert.deepEqual(fitOptions(null), { floor: 100, max: ZOOM_FIT_MAX });
  assert.deepEqual(ZOOM_FLOORS, [100, 110, 125]);
});

test('fitZoomFor sets the sheet zoom: a small range zooms in to the cap, a large one holds the floor', () => {
  const small = new Sheet({ rows: 50, cols: 26, cells: { A1: 'Title', C4: 12 } });
  assert.equal(fitZoomFor(small, { width: 2000, height: 1200 }, { sheetZoom: '100' }), 150);
  assert.equal(small.zoom, 150, 'the engine owns the zoom');
  const cells = {}; for (let r = 1; r <= 40; r++) cells['A' + r] = r;
  const tall = new Sheet({ rows: 60, cols: 26, cells });
  assert.equal(fitZoomFor(tall, { width: 400, height: 300 }, { sheetZoom: '110' }), 110, 'never below the setting');
  assert.equal(fitZoomFor(tall, {}, { sheetZoom: '125' }), 125, 'no area known: the floor');
});

test('what opens fitted: drills, the Daily, challenges and assessments; a lesson opens at the setting', () => {
  for (const k of ['drill', 'daily', 'challenge', 'assessment']) assert.equal(opensFitted(k), true, k);
  assert.equal(opensFitted('lesson'), false);
  assert.equal(opensFitted('rapid'), false);
});
