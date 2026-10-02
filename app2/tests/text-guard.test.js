// The rendered-text guard (text-guard.js): each rule catches its broken line and passes the good one.
// The browser smoke runs the same rules over the key pages as they render.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textProblems } from './text-guard.js';
import { siteCopy } from '../content/copy/apply.js';
import { liveLine, routeProgress } from '../ui/components/task-card.js';
import { PAGE_DELIVERED } from '../app/beats.js';

const rules = s => textProblems(s).map(p => p.rule);

test('the guard catches each kind of broken line', () => {
  assert.ok(rules('Your {board}').includes('placeholder'));
  assert.ok(rules('Best undefined, Pass').includes('missing value'));
  assert.ok(rules('NaN of 6 done').includes('missing value'));
  assert.ok(rules('Your The desk’s format in three minutes').includes('spliced title'));
  assert.ok(rules('Today it’s The weekly report: ninety seconds').includes('capital The mid-sentence'));
  assert.ok(rules('Page 1.3, The Report skeleton, is done.').includes('capital The mid-sentence'));
  assert.ok(rules('Select the the Revenue column.').includes('doubled word'));
  assert.ok(rules('boards_yours').includes('raw key'));
  assert.ok(rules('certificate_name').includes('raw key'));
  assert.ok(rules('level_title_new_workbook').includes('raw key'));
});

test('the guard passes good lines', () => {
  for (const s of ['Your runs', 'Your Daily', 'Play today’s Daily on The Daily board.', 'Alt H H', 'Alt W V G', 'Page 1.3 is done: The Report skeleton.',
    '=IFERROR(this_page, #REF!)', 'ctrl_z', 'marta_k', 'New Workbook\tWorkbook, High Contrast', 'The better way to master Excel', 'Your slowest goal, about 2 seconds a run:', 'Press the Ribbon’s letters in order.'])
    assert.deepEqual(textProblems(s), [], s);
});

test('the templates that broke now read', () => {
  assert.deepEqual(textProblems(siteCopy('boards_yours')), []);
  assert.ok(!/\{/.test(siteCopy('boards_yours')), 'the side panel heading takes no title');
  assert.deepEqual(textProblems(PAGE_DELIVERED.replace('{n}', '1.3').replace('{page}', 'The Report skeleton')), []);
  const toks = [{ text: 'Clearcoat - Austin Weekly KPI Report' }];
  assert.match(liveLine(routeProgress(toks, []), toks, 'win'), /^Type “Clearcoat/, 'a typed token is typed, never pressed');
});
