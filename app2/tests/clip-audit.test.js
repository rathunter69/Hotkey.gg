// app2/tests/clip-audit.test.js — the clip audit's rules, and the finished pages of Chapters 3 to 6 with
// no label clipped and no #### (R8 polish). The full sweep over every state: node app2/tests/clip-audit.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { clippedCells, sessionOf, FIT_WORKBOOKS } from './clip-audit.js';
import { unclip } from '../content/workbooks/unclip.js';
import { WORKBOOKS } from '../content/workbooks/index.js';

test('clippedCells: a label cut by its neighbour, a header too wide, a number in ####', () => {
  const sheet = { colW: { 1: 64, 2: 40 }, cells: {
    A1: { value: 'Capacity (cars a day)' }, B1: { value: 1 },
    A2: { value: 'Spills into the empty row' },
    B3: { value: 'Management fee', align: 'r' },
    B4: { value: 123456789.25, numFmt: '#,##0.00' },
  } };
  const kinds = Object.fromEntries(clippedCells(sheet).map(f => [f.ref, f.kind]));
  assert.equal(kinds.A1, 'label');
  assert.equal(kinds.A2, undefined, 'text spills across empty cells');
  assert.equal(kinds.B3, 'header');
  assert.equal(kinds.B4, 'hashes');
});

test('unclip: only widens, raises and wraps the cells the fit names', () => {
  const st = { sheets: [{ name: 'Nowhere', colW: { 1: 50 }, cells: { A1: { value: 'x' } } }] };
  assert.deepEqual(unclip('clearcoat-model', structuredClone(st)), st, 'a sheet with no fit comes back as it went in');
  assert.deepEqual(unclip('no-such-workbook', structuredClone(st)), st);
});

for (const id of FIT_WORKBOOKS) {
  test(`${id}: the last state's finished pages clip nothing`, async () => {
    const wb = WORKBOOKS[id];
    const off = new Set(Object.keys((wb.STANDARD && wb.STANDARD.off) || {}));
    const order = wb.STATE_ORDER || Object.keys(wb.STATES);
    const last = order[order.length - 1];
    const ses = await sessionOf(wb.stateOf(last));
    const found = [];
    for (const { name, sheet } of ses.sheets) if (!off.has(name)) for (const f of clippedCells(sheet)) found.push(`${name}!${f.ref} ${f.kind} "${f.text.slice(0, 30)}"`);
    assert.deepEqual(found, [], `${id} ${last}: rerun node app2/tests/clip-audit.js --write`);
  });
}
