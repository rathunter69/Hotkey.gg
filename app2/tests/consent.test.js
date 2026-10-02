// app2/tests/consent.test.js — liability checklist (R9): form consents, the age statement, and the
// storage audit that decides there is no cookie banner. Pure, no DOM.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { consentHtml } from '../ui/components/consent.js';
import { billingPanelHtml } from '../app/account-page.js';

const app2 = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!['node_modules', 'vendor', 'tests', 'lessons', 'shortcuts'].includes(name)) walk(p, out); }
    else if (name.endsWith('.js')) out.push(p);
  }
  return out;
}
const SOURCES = walk(app2).map(f => ({ f: relative(app2, f), src: readFileSync(f, 'utf8') }));

test('the account consent links both policies in a new tab, says what the email is for and the minimum age', () => {
  const h = consentHtml('account');
  assert.match(h, /<a href="#\/terms" target="_blank" rel="noopener">Terms of Use<\/a>/);
  assert.match(h, /<a href="#\/privacy" target="_blank" rel="noopener">Privacy Policy<\/a>/);
  assert.match(h, /never for marketing/);
  assert.match(h, /13 or older/);
  assert.doesNotMatch(h, /[{}]/, 'every placeholder filled');
});

test('the Teams consent says what the details are for and links the Privacy Policy', () => {
  const h = consentHtml('teams');
  assert.match(h, /only to reply about your team/);
  assert.match(h, /href="#\/privacy"/);
});

test('every form that asks for an email carries the consent line', () => {
  const missing = SOURCES.filter(({ src }) => /type="email"/.test(src) && !/consentHtml\(/.test(src)).map(({ f }) => f);
  assert.deepEqual(missing, []);
});

test('no cookie banner is needed: nothing writes a cookie, and the analytics key stays in memory', () => {
  const strip = s => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  const cookies = SOURCES.filter(({ src }) => /document\.cookie\s*=/.test(strip(src))).map(({ f }) => f);
  assert.deepEqual(cookies, [], 'first-party code sets no cookies');
  assert.ok(!/sessionStorage|localStorage/.test(strip(readFileSync(join(app2, 'app/telemetry.js'), 'utf8'))), 'analytics uses no browser storage');
});

test('cancelling is offered beside Manage billing for a renewing subscription', () => {
  const h = billingPanelHtml({ kind: 'subscription', renews: true, date: '2026-11-02' });
  assert.match(h, /id="billCancel"/);
  assert.match(h, /id="billManage"/);
});
