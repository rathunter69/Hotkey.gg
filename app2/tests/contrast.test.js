// app2/tests/contrast.test.js — M87: every text and background pair in every theme passes
// WCAG AA (screenplay 3.0, rule 13): 4.5 to 1 for text, 3 to 1 for a control's edge and for a
// mode's fill against the ground (the cursor outline, a rule, a mark). Workbook is held to 3.0's
// own figures too. A theme that cannot pass is fixed in themes.js or dropped; the test lists every
// failing pair by theme, token and ratio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { THEMES, THEME_ORDER, TOKEN_NAMES, MODES, DEFAULT_THEME, tokensFor, contrast, hexToRgb } from '../ui/themes.js';

const TEXT = 4.5, EDGE = 3;

/** The pairs every theme must hold: [foreground token, background token, minimum]. */
export function pairsFor(tokens) {
  const pairs = [];
  for (const bg of ['paper', 'sheet', 'chrome']) { pairs.push(['ink', bg, TEXT], ['ink-2', bg, TEXT]); }
  for (const bg of ['paper', 'chrome', 'sheet']) pairs.push(['edge', bg, EDGE]);
  pairs.push(['rail-text', 'rail', TEXT], ['rail-text', 'rail-hi', TEXT], ['rail-sub', 'rail', TEXT], ['rail-sub', 'rail-hi', TEXT]);
  pairs.push(['note-ink', 'note', TEXT], ['red', 'paper', TEXT], ['red', 'sheet', TEXT]);
  for (const m of MODES) {
    if (m !== 'clock') {                                        // amber is never text and never text's ground (3.0): its ink does that work
      pairs.push(['on-fill', m, TEXT]);                         // white (or the dark ground) on the fill
      pairs.push([m, 'paper', EDGE], [m, 'sheet', EDGE]);      // the fill as a cursor outline, a rule, a control's edge
    }
    pairs.push([m + '-ink', m + '-tint', TEXT]);               // text on a tint uses the mode's ink
    pairs.push([m + '-ink', 'paper', TEXT], [m + '-ink', 'sheet', TEXT]);
    pairs.push(['ink', m + '-tint', TEXT]);                     // body text on a tinted row
  }
  return pairs.map(([f, b, min]) => ({ f, b, min, ratio: contrast(tokens[f], tokens[b]) }));
}

test('every theme supplies every token as a hex color', () => {
  for (const key of THEME_ORDER) {
    const t = tokensFor(key);
    for (const n of TOKEN_NAMES) assert.ok(hexToRgb(t[n]), `${key}: ${n} is ${t[n]}`);
  }
  assert.equal(DEFAULT_THEME, 'workbook');
  assert.ok(THEMES.workbook && !THEMES.workbook.dark);
});

test('Workbook holds 3.0\'s own figures', () => {
  const t = tokensFor('workbook');
  const at = (f, b) => Math.round(contrast(t[f], t[b]) * 10) / 10;
  assert.ok(at('ink', 'paper') >= 15, 'ink on paper 15.5 to 1');
  assert.ok(at('ink-2', 'paper') >= 6.3 && at('ink-2', 'chrome') >= 5.8, 'ink-2 6.4 on paper, 5.9 on chrome');
  assert.ok(at('edge', 'paper') >= 3.5 && at('edge', 'chrome') >= 3.2, 'edge 3.6 on paper, 3.3 on chrome');
  assert.ok(at('rail-text', 'rail') >= 10.8 && at('rail-sub', 'rail') >= 8.3, 'rail text 10.9 and 8.4');
  for (const m of MODES) if (m !== 'clock') assert.ok(at('on-fill', m) >= 4.5, `white on ${m}`);   // amber is never text's ground; its ink is the text
  assert.equal(t['on-fill'], '#FFFFFF');
});

test('every pair in every theme passes AA', () => {
  const failures = [];
  for (const key of THEME_ORDER) {
    const t = tokensFor(key);
    for (const p of pairsFor(t)) if (p.ratio < p.min) failures.push(`${key}: ${p.f} on ${p.b} is ${p.ratio.toFixed(2)} (needs ${p.min})`);
  }
  assert.deepEqual(failures, [], failures.join('\n'));
});

test('tokens.css carries the Workbook values and the aliases the older stylesheets read', () => {
  const css = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '..', 'ui', 'tokens.css'), 'utf8');
  const t = tokensFor('workbook');
  for (const n of TOKEN_NAMES) {
    const m = css.match(new RegExp(`--${n}:(#[0-9A-Fa-f]{6})`));
    assert.ok(m, 'tokens.css has --' + n);
    assert.equal(m[1].toUpperCase(), t[n].toUpperCase(), '--' + n + ' matches themes.js');
  }
  for (const alias of ['--bg:var(--paper)', '--surface:var(--sheet)', '--text:var(--ink)', '--muted:var(--ink-2)', '--accent:var(--learn)', '--on-accent:var(--on-fill)']) assert.ok(css.includes(alias), alias);
  assert.ok(!/--paper:#FFFFFF/i.test(css), 'the page ground is never pure white');
});
