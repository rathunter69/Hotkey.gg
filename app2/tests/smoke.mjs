// Browser smoke — the non-blocking CI job (REBUILD_PLAN §3): under 2 minutes, every network request
// that is not loopback is blocked, never run against production. Usage:
//   node app2/tests/smoke.mjs            (serves the repo itself on a free port)
// Requires Playwright: locally the global install at /opt/node22/lib/node_modules/playwright, in CI
// `npm install --no-save playwright@<pinned>`; the module is resolved from either.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { LESSONS } from '../content/index.js';
import { parseKeyScript, parseKeySpec } from '../engine/keyboard.js';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const PORT = Number(process.env.PORT || 8765);
const T0 = Date.now();
const server = spawn(process.execPath, [new URL('./serve.js', import.meta.url).pathname], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));

const KEYNAME = { ' ': 'Space' };
function pwKey(spec) {
  const ev = parseKeySpec(spec);
  const mods = []; if (ev.ctrlKey) mods.push('Control'); if (ev.altKey) mods.push('Alt'); if (ev.shiftKey) mods.push('Shift');
  let key = ev.key;
  if (key.length === 1 && ev.shiftKey && /[A-Z]/.test(key)) key = key.toLowerCase();
  if (KEYNAME[key]) key = KEYNAME[key];
  return [...mods, key].join('+');
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, serviceWorkers: 'block' });
// Block every request that is not loopback: fonts, analytics, Supabase — nothing leaves the machine.
await context.route('**/*', route => {
  let origin; try { origin = new URL(route.request().url()).origin; } catch (e) { return route.abort('blockedbyclient'); }
  if (origin !== `http://127.0.0.1:${PORT}`) return route.abort('blockedbyclient');
  return route.continue();
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/blockedbyclient|net::ERR_/.test(m.text())) errors.push('console: ' + m.text()); });
const base = `http://127.0.0.1:${PORT}/app2/index.html`;
let failures = 0;
const fail = msg => { failures++; console.log('FAIL', msg); };

try {
  // every route renders
  for (const route of ['#/', '#/learn', '#/practice', '#/leaderboard', '#/reference', '#/pricing', '#/teams', '#/account', '#/about', '#/terms', '#/privacy', '#/contact', '#/sandbox', '#/nope']) {
    await page.goto(base + route);
    await page.waitForTimeout(250);
    const text = await page.evaluate(() => document.body.innerText.trim().length);
    if (!text) fail(`${route}: empty page`);
  }
  // play the first and last lesson end to end by keyboard
  for (const lesson of [LESSONS[0], LESSONS[LESSONS.length - 1]]) {
    await page.goto(base + '#/lesson/' + lesson.id);
    const start = await page.waitForSelector('#startBtn', { timeout: 5000 }).catch(() => null);
    if (!start) { fail(`${lesson.id}: lesson did not open`); continue; }
    await page.keyboard.press('Enter');
    await page.waitForSelector('.goal.current');
    for (const step of parseKeyScript(lesson.solution)) {
      if (step.type === 'text') await page.keyboard.type(step.text);
      else await page.keyboard.press(pwKey(step.spec));
    }
    const done = await page.waitForSelector('.lesson-done:not([hidden]) [data-act="continue"]', { timeout: 4000 }).catch(() => null);
    if (!done) fail(`${lesson.id}: did not complete`);
  }
} finally {
  if (errors.length) { failures += errors.length; console.log('ERRORS\n' + errors.join('\n')); }
  const secs = ((Date.now() - T0) / 1000).toFixed(1);
  console.log(failures ? `SMOKE FAILED: ${failures} problem(s) in ${secs}s` : `SMOKE OK in ${secs}s`);
  await browser.close();
  server.kill();
  process.exit(failures ? 1 : 0);
}
