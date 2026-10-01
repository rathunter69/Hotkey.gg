// app2/tests/page.test.js — the shared page module (M86): a page built through buildPage meets
// the sheet standard, keyed rows resolve, and the audit names each departure it is shown.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sheet } from '../engine/sheet.js';
import { buildPage, cutFrom, FMT, layoutFor } from '../content/workbooks/page.js';
import { sheetStandard } from '../app/graders.js';
import { dispText } from '../engine/format.js';

const SITES = ['Domain', 'Mueller', 'Riverside'];
const washes = [31200, 28400, 26900], ticket = [14.2, 13.9, 14.5];
const spec = chapter => ({
  name: 'Report', chapter, title: 'Clearcoat Express: weekly site report', units: 'USD unless stated',
  labelHeader: 'Site', headers: ['Washes', 'Avg ticket ($)', 'Revenue ($)', 'Margin'], kinds: ['count', 'unit', 'money', 'pct'],
  center: true,
  blocks: [{
    rows: [
      ...SITES.map((s, i) => ({ key: s, label: s, indent: 1,
        values: [washes[i], ticket[i], `=${layoutFor(chapter).figCol === 2 ? 'B' : 'C'}${5 + i}*${layoutFor(chapter).figCol === 2 ? 'C' : 'D'}${5 + i}`, null] })),
      { key: 'total', label: 'Total', total: true, final: true, values: [] },
    ],
  }],
  source: 'Source: site POS feed, week ending 20 Sep 2026',
  checks: [{ label: 'Revenue ties to the feed', formula: (col, r, at) => `=${col}${at('total')}-${col}${at('total')}` }],
});

/** Build the spec without the fill shortcut (values carry the formulas) and with a filled total. */
function page(chapter) {
  const s = spec(chapter);
  const { figCol } = layoutFor(chapter);
  const col = i => String.fromCharCode(64 + figCol + i);
  s.blocks[0].rows.forEach(r => { delete r.fill; });
  s.blocks[0].rows.forEach((r, i) => {
    if (r.total) { r.fill = (c, rr, at) => c === col(1) || c === col(3) ? null : `=SUM(${c}${at('Domain')}:${c}${at('Riverside')})`; return; }
  });
  return buildPage(s);
}

test('a Chapter 1 page: labels in A, figures from B, title and units, frozen at B5, gridlines off', () => {
  const p = page(1);
  const c = p.sheet.cells;
  assert.equal(c.A1.bold, true); assert.equal(c.A1.ca, 5);
  assert.equal(c.A2.it, true);
  assert.equal(c.A4.value, 'Site'); assert.equal(c.B4.align, 'r');
  assert.equal(c.A5.value, 'Domain'); assert.equal(c.A5.indent, 1);
  assert.equal(c.B5.fontColor, 'blue');
  assert.equal(p.at.total, 8);
  assert.equal(c.A8.bold, true); assert.equal(c.B8.bt, true); assert.equal(c.B8.bdbl, true);
  assert.deepEqual(p.sheet.freeze, { r: 4, c: 1 });
  assert.equal(p.sheet.gridlines, false);
  assert.ok(p.sheet.colW[1] >= 89, 'the label column fits its longest label');
  assert.equal(p.sheet.colW[2], p.sheet.colW[3], 'figure columns match');
});

test('a Chapter 2 page: a narrow helper A, labels in B, figures from C, zero as a dash', () => {
  const p = page(2);
  const c = p.sheet.cells;
  assert.equal(c.B5.value, 'Domain'); assert.equal(c.C5.value, 31200);
  assert.deepEqual(p.sheet.freeze, { r: 4, c: 2 });
  assert.ok(p.sheet.colW[1] < 40);
  assert.equal(c.E6.numFmt, FMT.moneyDash);
  assert.equal(c.E5.numFmt, FMT.moneyDollarDash, 'the first row carries the $');
  assert.equal(c.C5.numFmt, FMT.countDash, 'counts never carry the $');
  const c1 = page(1).sheet.cells;
  assert.deepEqual([c1.D6.fmtStyle, c1.D6.decimals, c1.D5.fmtStyle, c1.B5.fmtStyle], ['comma', 0, 'currency', 'comma'], 'Chapter 1 uses the built-in styles that write the desk codes');
});

test('the built pages pass the sheet standard', () => {
  for (const ch of [1, 2]) {
    const p = page(ch);
    const sh = new Sheet(p.sheet);
    assert.deepEqual(sheetStandard(sh, { chapter: ch }), [], 'chapter ' + ch);
    const chk = sh.cells[`${ch === 1 ? 'B' : 'C'}${p.std.checksRow + 1}`];
    assert.equal(chk.value, 0, 'the check reads zero');
    assert.match(dispText(sh.cells[ch === 1 ? 'D5' : 'E5']), /^\$/);
    assert.doesNotMatch(dispText(sh.cells[ch === 1 ? 'D6' : 'E6']), /\$/);
  }
});

test('the audit names each departure', () => {
  const p = page(1);
  const bad = cutFrom(p, (cells, sh) => {
    cells.A2.it = false;               // units not italic
    cells.B5.fontColor = null;         // a typed value in black
    cells.C6.ball = true;              // a grid border
    cells.D8.bt = false; cells.D8.bdbl = false;   // a total without its border
    cells.A3 = { value: 'x' };         // the spacer filled
    sh.freeze = { r: 0, c: 0 };        // panes not frozen
    delete sh.gridlines;               // gridlines on
  });
  const out = sheetStandard(new Sheet(bad), { chapter: 1 });
  for (const want of [/A2 is the units line/, /B5 is an input/, /C6 carries a grid border/, /D8 is a total/, /A3 is filled/, /panes are not frozen/, /gridlines are on/])
    assert.ok(out.some(w => want.test(w)), `expected ${want} in ${JSON.stringify(out)}`);
  assert.deepEqual(sheetStandard(new Sheet(bad), { chapter: 1, read: false }).filter(w => /gridlines/.test(w)), [], 'a working sheet keeps its gridlines');
});

test('a row keyed twice or a missing key fails loudly', () => {
  const s = spec(1);
  s.blocks[0].rows[0].fill = (c, r, at) => `=${c}${at('nope')}`;
  assert.throws(() => buildPage(s), /no row keyed nope/);
});
