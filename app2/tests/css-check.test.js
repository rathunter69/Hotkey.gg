// The CSS check (3.0, M94): each rule catches its tell and lets the standard's own idioms through,
// and the stylesheets written to the standard are clean.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkCss, rulesOf, runCssCheck, STANDARD_CSS, LEGACY_CSS } from './css-check.js';

const rules = (css, name = 'screens.css') => checkCss(css, name).map(x => x.rule);

test('css-check: each tell is caught', () => {
  assert.deepEqual(rules('.a{letter-spacing:var(--ls)}'), ['C1']);
  assert.deepEqual(rules('.a{text-transform:uppercase}'), ['C2']);
  assert.deepEqual(rules('.btn{font-family:var(--mono)}'), ['C3']);
  assert.deepEqual(rules("@font-face{font-family:'JetBrains Mono'; src:url(jetbrains-mono-latin.woff2)}"), [], 'declaring the self-hosted face is not using it');
  assert.deepEqual(rules('.a{color:#17201B}'), ['C4']);
  assert.deepEqual(rules('.a{background:rgba(0,0,0,.3)}'), ['C4']);
  assert.deepEqual(rules('.a{padding:12px}'), ['C5']);
  assert.deepEqual(rules('.a{transition:opacity .2s}'), ['C5']);
  assert.deepEqual(rules('.a{font-size:1.2rem}'), ['C5']);
  assert.deepEqual(rules('body{background:#fff}'), ['C4', 'C6']);
  assert.deepEqual(rules('.a{color:var(--ink)} @import url(https://unpkg.com/lucide/x.css);'), ['C7']);
});

test('css-check: the standard\'s idioms pass', () => {
  assert.deepEqual(rules('.a{letter-spacing:normal; padding:0 1px; border:1px solid var(--line); color:var(--ink); transition:opacity var(--d-note); width:calc(100% / 8)}'), []);
  assert.deepEqual(rules('kbd.key{font-family:var(--mono)} .rail-mark{font-family:var(--mono)} .clock{font:var(--fw-bold) var(--fs-clock) var(--mono)} td.mono{font-family:var(--mono)}'), []);
  assert.deepEqual(rules('.a{background-image:url(data:image/png;base64,iVBOR12px)}'), [], 'a url is not a size');
  assert.deepEqual(rules(':root{--ink:#17201B; --s4:16px; --d-goal:250ms}', 'tokens.css'), [], 'tokens.css is where the values live');
  assert.deepEqual(rules(':root{--x:1px; letter-spacing:.1em}', 'tokens.css'), ['C1'], 'but letter-spacing is never right, even there');
  assert.deepEqual(rulesOf('/* c */ .a{x:1} @media (max-width:900px){ .b{y:2} }').map(r => r[0]), ['.a', '.b']);
});

test('css-check: the stylesheets written to the standard are clean; the legacy ones only warn', () => {
  const { errors, warns } = runCssCheck();
  assert.deepEqual(errors, [], errors.join('\n'));
  for (const n of ['tokens.css', 'components.css', 'screens.css']) assert.ok(STANDARD_CSS.has(n), n);
  for (const n of LEGACY_CSS) assert.ok(!STANDARD_CSS.has(n), n + ' is one or the other');
  assert.ok(Array.isArray(warns));
});
