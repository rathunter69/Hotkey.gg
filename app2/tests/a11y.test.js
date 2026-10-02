// app2/tests/a11y.test.js — liability checklist (R9), alt text: the source half of the accessible-name
// check. Every <img> written in app2 carries an alt attribute, and no <button> or link is written
// with nothing to read out (only empty icons inside) unless it carries aria-label or title. The
// rendered half is a11y-guard.js, which the browser smoke runs on every page it opens.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const app2 = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!['node_modules', 'vendor', 'tests'].includes(name)) walk(p, out); }
    else if (/\.(js|html)$/.test(name)) out.push(p);
  }
  return out;
}
const SOURCES = walk(app2).map(f => ({ f: relative(app2, f), src: readFileSync(f, 'utf8') }));

/** <img ...> tags with no alt attribute. Pure. */
export function imgsWithoutAlt(src) {
  return (src.match(/<img\b[^>]*>/gi) || []).filter(tag => !/\balt\s*=/i.test(tag));
}
/** <button>/<a> written with only empty elements inside (an icon) and no aria-label or title. Pure. */
export function iconOnlyWithoutName(src) {
  const re = /<(button|a)\b([^>]*)>((?:\s*<(i|span|svg|b)\b[^>]*>\s*<\/\4>)+)\s*<\/\1>/gi;
  const out = []; let m;
  while ((m = re.exec(src))) if (!/\b(aria-label|aria-labelledby|title)\s*=/i.test(m[2])) out.push(m[0]);
  return out;
}

test('the source checks catch what they are for', () => {
  assert.deepEqual(imgsWithoutAlt('<img src="a.png"><img src="b.png" alt="">'), ['<img src="a.png">']);
  assert.equal(iconOnlyWithoutName('<button class="x"><i class="icon"></i></button>').length, 1);
  assert.equal(iconOnlyWithoutName('<button aria-label="Close"><i class="icon"></i></button>').length, 0);
  assert.equal(iconOnlyWithoutName('<button><span>Save</span></button>').length, 0);
});

test('every <img> in app2 has an alt attribute', () => {
  const bad = SOURCES.flatMap(({ f, src }) => imgsWithoutAlt(src).map(t => `${f}: ${t}`));
  assert.deepEqual(bad, []);
});

test('no icon-only button or link in app2 is written without an accessible name', () => {
  const bad = SOURCES.flatMap(({ f, src }) => iconOnlyWithoutName(src).map(t => `${f}: ${t.slice(0, 120)}`));
  assert.deepEqual(bad, []);
});
