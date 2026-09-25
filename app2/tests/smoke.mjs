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
// A goal the platform demonstrates ("does it tie?") says "watching · Esc skips": the smoke skips it the moment it
// appears, as a learner may, from inside the page — no round trip per key (test code; nothing in the app changes)
await context.addInitScript(() => {
  const skip = () => { if (document.querySelector('.goal-demo')) (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); };
  const start = () => new MutationObserver(skip).observe(document.documentElement, { subtree: true, childList: true });
  if (document.documentElement) start(); else document.addEventListener('DOMContentLoaded', start);
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/blockedbyclient|net::ERR_/.test(m.text())) errors.push('console: ' + m.text()); });
const base = `http://127.0.0.1:${PORT}/app2/index.html`;
let failures = 0;
const fail = msg => { failures++; console.log('FAIL', msg); };
/** A goal the platform demonstrates ("does it tie?") shows "watching · Esc skips": the smoke skips it, as a learner may. */
async function skipDemos() {
  for (let i = 0; i < 30; i++) {
    const watching = await page.$('.goal-demo');
    if (!watching) return;
    await page.keyboard.press('Escape'); await page.waitForTimeout(40);
  }
}
/** Press a key script on the page; a demonstrated goal is skipped with Esc before the keys go on. */
async function play(script) {
  for (const step of parseKeyScript(script)) {
    if (step.type === 'text') await page.keyboard.type(step.text);
    else await page.keyboard.press(pwKey(step.spec));
  }
  // a closer demo starts a beat after the last goal lands
  await page.waitForTimeout(150); await skipDemos();
}
const t = label => console.log(`  ${label} at ${((Date.now() - T0) / 1000).toFixed(1)}s`);

try {
  // every route renders
  for (const route of ['#/', '#/learn', '#/practice', '#/leaderboard', '#/reference', '#/pricing', '#/teams', '#/account', '#/about', '#/terms', '#/privacy', '#/contact', '#/sandbox', '#/nope']) {
    await page.goto(base + route);
    await page.waitForTimeout(250);
    const text = await page.evaluate(() => document.body.innerText.trim().length);
    if (!text) fail(`${route}: empty page`);
  }
  // accounts (phase B): with every non-loopback request blocked, the account page still renders
  // the sign-in form, the user chip reads guest, and the save state stays honest
  await page.goto(base + '#/account');
  await page.waitForTimeout(400);
  const acct = await page.evaluate(() => ({
    hasVendor: !!(window.supabase && window.supabase.createClient),
    form: !!document.querySelector('#authForm'),
    emailDisabled: !!(document.querySelector('#authEmail') && document.querySelector('#authEmail').disabled),
    notConfigured: /Sign-in is not configured/.test(document.body.innerText),
    chip: (document.querySelector('#userState') || {}).textContent || '',
    saveLine: (document.querySelector('#umState') || {}).textContent || '',
  }));
  if (!acct.form) fail('#/account: sign-in form missing');
  if (acct.hasVendor && (acct.emailDisabled || acct.notConfigured)) fail('#/account: form disabled although the client exists');
  if (!acct.hasVendor && !acct.notConfigured) fail('#/account: no client and no "Sign-in is not configured" notice');
  if (acct.chip !== 'guest') fail(`#/account: user chip reads "${acct.chip}", not guest`);
  if (acct.saveLine !== 'Saved on this device') fail(`#/account: save state reads "${acct.saveLine}"`);

  // the fresh-visitor journey (experience pass C): landing → first run → 1.1.1 → 1.1.C → Home →
  // Learn → Practice → the Daily, one profile from empty storage, every non-loopback request blocked
  {
    await page.goto(base + '#/'); await page.evaluate(() => localStorage.clear()); await page.reload();
    if (!(await page.waitForSelector('.ld2', { timeout: 5000 }).catch(() => null))) fail('journey: a fresh visitor does not get the landing');
    await page.keyboard.press('Enter');   // Enter anywhere starts
    const frame = await page.waitForSelector('.fr2-frame', { timeout: 5000 }).catch(() => null);
    if (!frame) fail('journey: Enter on the landing did not open the first run');
    else {
      const size = async () => page.evaluate(() => { const r = document.querySelector('.fr2-frame').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)].join('x'); });
      const s0 = await size();
      await page.waitForFunction(() => /2 \/ 4|3 \/ 4|4 \/ 4/.test((document.querySelector('#demoCount') || {}).textContent || ''), null, { timeout: 15000 }).catch(() => fail('journey: the first-run demo did not press keys'));
      const steps = [];
      // the demo takes two Enters (finish, then continue), the four cards one each, the picker one: seven, and the hash leaves #/start
      for (let i = 0; i < 8; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(250); if (!/#\/start/.test(page.url())) break; steps.push((await page.evaluate(() => (document.querySelector('#frEyebrow') || {}).textContent || '')) + ' ' + await size()); }
      const sizes = new Set(steps.map(x => x.split(' ').pop()));
      if (sizes.size > 1 || !sizes.has(s0)) fail('journey: the first-run frame changed size between steps: ' + steps.join(' | '));
      await page.waitForFunction(() => /#\/lesson\/inherited-workbook/.test(location.hash), null, { timeout: 4000 }).catch(() => fail('journey: the first run did not land on lesson 1.1.1 (' + page.url() + ')'));
      const prefsRec = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('hk2_prefs')); } catch (e) { return null; } });
      if (!prefsRec || !prefsRec.briefingDone || !prefsRec.firstRunDone) fail('journey: first-run prefs not written');
    }
    t('first run');
    // 1.1.1: the module's story beat once, the strip reads 1.1, then the whole lesson by keyboard
    if (!(await page.waitForSelector('.ws-beat', { timeout: 5000 }).catch(() => null))) fail('journey: no story beat before lesson 1.1.1');
    await page.keyboard.press('Enter'); await page.waitForTimeout(250);
    const crumb = await page.evaluate(() => (document.querySelector('.ws-crumb') || {}).textContent || '');
    if (!/1\.1 Open and set up/.test(crumb)) fail('journey: the strip does not read 1.1 Open and set up: ' + crumb);
    await play(LESSONS.find(l => l.id === 'inherited-workbook').solution);
    if (!(await page.waitForSelector('.lesson-done:not([hidden]) [data-act="continue"]', { timeout: 4000 }).catch(() => null))) fail('journey: 1.1.1 did not complete');
    t('1.1.1');
    // 1.1.C: the module challenge passes with a tier, and the page is delivered
    await page.goto(base + '#/lesson/challenge-inherited-file');
    await page.waitForSelector('.goal.current, #startBtn', { state: 'attached', timeout: 5000 }).catch(() => fail('journey: 1.1.C did not open'));
    if (await page.$('#startBtn')) await page.keyboard.press('Enter');
    await play(LESSONS.find(l => l.id === 'challenge-inherited-file').solution);
    if (!(await page.waitForSelector('.lesson-done:not([hidden]) .tstamp.hit', { timeout: 5000 }).catch(() => null))) fail('journey: 1.1.C passed with no tier stamp');
    if (!(await page.$('.lesson-done:not([hidden]) .rm-page'))) fail('journey: 1.1.C passed without delivering its page');
    t('1.1.C');
    // Home: the Continue card names the next lesson; no card is an empty box; the deal strip is there
    await page.goto(base + '#/'); await page.waitForSelector('.hm', { timeout: 5000 }).catch(() => fail('journey: Home did not render'));
    const home = await page.evaluate(() => ({
      next: (document.querySelector('.hm-continue h1') || {}).textContent || '',
      empty: [...document.querySelectorAll('.hm-card, .hm-continue, .deal')].filter(c => !c.innerText.trim()).map(c => c.className),
      cards: ['.hm-continue', '.hm-due', '.hm-daily', '.deal'].filter(sel => !document.querySelector(sel)),
    }));
    if (!/Ribbon by keyboard/.test(home.next)) fail('journey: Home continue card reads "' + home.next + '", not the next lesson');
    if (home.empty.length) fail('journey: Home has empty boxes: ' + home.empty.join(', '));
    if (home.cards.length) fail('journey: Home is missing ' + home.cards.join(', '));
    // Learn: the data room shows module 1.1's document with the delivered page
    await page.goto(base + '#/learn'); await page.waitForSelector('.dr-doc', { timeout: 5000 }).catch(() => fail('journey: the data room did not render'));
    if (!(await page.$('.dr-doc[data-doc="open-and-set-up"] .dr-thumb.delivered'))) fail('journey: the data room does not show page 1.1 as delivered');
    // Practice renders its drills
    await page.goto(base + '#/practice'); await page.waitForTimeout(300);
    if ((await page.$$('a.drow[href^="#/drill/"]')).length < 3) fail('journey: Practice shows fewer than three drills');
    t('home, learn, practice');
    // the Daily: start card, the drill by keyboard, the result card
    const { dailyFor } = await import('../app/daily.js'); const { DRILLS } = await import('../content/drills.js');
    const day = await page.evaluate(() => new Date().toISOString().slice(0, 10));   // the Daily's day key (records.js dayOf)
    const daily = DRILLS.find(d => d.id === dailyFor(day).drillId);
    await page.goto(base + '#/daily');
    if (!(await page.waitForSelector('.start-card', { timeout: 5000 }).catch(() => null))) fail('journey: the Daily has no start card');
    await page.keyboard.press('Space'); await page.waitForTimeout(120);
    if (daily) await play(daily.solution); else fail('journey: no Daily drill for ' + day);
    if (!(await page.waitForSelector('.lesson-done:not([hidden]) .dc', { timeout: 5000 }).catch(() => null))) fail('journey: the Daily did not end on its result card');
    t('the Daily');
  }

  // play the first and last lesson end to end by keyboard, plus the phase-C feature carriers
  // (find/replace dialog, hide+freeze, cross-sheet formulas, the two-sheet project)
  // one lesson per module that carries new engine ground (paste special, grouping/freeze, F4 repeat, cross-sheet pointing, the audit), one seeded challenge, the project; the last lesson is the test-out
  const extras = ['copy-cut-paste-fill', 'hide-group-freeze', 'the-style-pass', 'link-across-sheets', 'hardcode-hunt', 'challenge-audit-before-you-send', 'weekly-kpi-project'].map(id => LESSONS.find(l => l.id === id)).filter(Boolean);
  for (const lesson of [...extras, LESSONS[LESSONS.length - 1]]) {   // 1.1.1 is played by the journey above
    await page.goto(base + '#/lesson/' + lesson.id);
    // the goal list sits behind the floating card (B4), so wait for it attached, not visible
    const opened = await page.waitForSelector('.goal.current, #startBtn', { timeout: 5000, state: 'attached' }).catch(() => null);
    if (!opened) { fail(`${lesson.id}: lesson did not open`); continue; }
    if (await page.$('#startBtn')) await page.keyboard.press('Enter');
    if (await page.$('.ws-beat')) await page.keyboard.press('Enter');   // a module's story beat, once
    await page.waitForSelector('.goal.current', { state: 'attached' });
    const t0 = Date.now();
    await play(lesson.solution);
    const done = await page.waitForSelector('.lesson-done:not([hidden]) [data-act="continue"], .lesson-done:not([hidden]) [data-act="retry-same"]', { timeout: 4000 }).catch(() => null);
    if (!done) fail(`${lesson.id}: did not complete`);
    t(`${lesson.id} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }

  // the experience pass: the seeded dashboard, the data room, a due-today micro-drill, a story beat,
  // and ?flow=off putting the live screens back
  {
    await page.goto(base + '#/?flow=next&demo=1'); await page.waitForTimeout(400);
    for (const sel of ['.hm-continue', '.hm-due-list li', '.hm-daily', '.deal', '.hm-rings .hm-ring', '.hm-level']) if (!(await page.$(sel))) fail('home (next): missing ' + sel);
    await page.goto(base + '#/learn?flow=next'); await page.waitForTimeout(400);
    for (const sel of ['.dr-tree .dr-folder.open', '.dr-doc', '.dr-step.next', '.dr-thumb', '.dr-folder.locked']) if (!(await page.$(sel))) fail('data room (next): missing ' + sel);
    if (await page.$('.mp-toggle')) fail('data room (next): the path/list toggle is still there');
    // a micro-drill from the queue plays in the workspace and completes on its route
    const { microLesson } = await import('../app/schedule.js');
    const micro = microLesson('ctrl-shift-arrow');
    await page.goto(base + '#/due/ctrl-shift-arrow?flow=next');
    const ws = await page.waitForSelector('.ws-strip', { timeout: 5000 }).catch(() => null);
    if (!ws) fail('due (next): no workspace strip');
    for (const step of parseKeyScript(micro.solution)) { if (step.type === 'text') await page.keyboard.type(step.text); else await page.keyboard.press(pwKey(step.spec)); }
    const dueDone = await page.waitForSelector('.lesson-done:not([hidden]) [data-act="due-next"]', { timeout: 4000 }).catch(() => null);
    if (!dueDone) fail('due (next): the micro-drill did not complete');
    const sched = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('hk2_schedule_v1')); } catch (e) { return null; } });
    if (!sched || !sched['ctrl-shift-arrow']) fail('due (next): no memory note recorded');
    // a Chapter 1 lesson under the flag: the strip, the story beat, then a cue on the first goal's target
    await page.evaluate(() => { try { const p = JSON.parse(localStorage.getItem('hk2_prefs') || '{}'); p.beatsSeen = []; localStorage.setItem('hk2_prefs', JSON.stringify(p)); } catch (e) { /* ignore */ } });
    await page.goto(base + '#/lesson/inherited-workbook?flow=next'); await page.waitForTimeout(500);
    if (!(await page.$('.ws-beat'))) fail('lesson (next): no story beat before the module’s first lesson');
    await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    if (await page.$('.ws-beat')) fail('lesson (next): Enter did not close the beat');
    // the flag off: the live landing is back
    await page.goto(base + '#/landing?flow=off'); await page.waitForTimeout(400);
    if (await page.$('.ld2')) fail('flow=off: the next landing still shows');
    if (!(await page.$('.ld'))) fail('flow=off: the live landing did not come back');
    await page.evaluate(() => { localStorage.removeItem('hk2_prefs'); localStorage.removeItem('hk2_schedule_v1'); localStorage.removeItem('hk2_flow'); });
  }

  // the drill workspace (Phase D): start card key never lands, solution replays to a tier,
  // the attempt lands in records, and after a reload the PB ghost toggle is enabled
  {
    const { DRILLS_BY_ID } = await import('../content/drills.js');
    const drill = DRILLS_BY_ID['edge-jumps'];
    await page.goto(base + '#/drill/edge-jumps');
    const card = await page.waitForSelector('.start-card', { timeout: 5000 }).catch(() => null);
    if (!card) fail('edge-jumps: no start card');
    await page.keyboard.press('Space');
    await page.waitForTimeout(120);
    if (await page.$('.start-card')) fail('edge-jumps: start card did not dismiss');
    if (await page.evaluate(() => document.querySelector('#drKeys').textContent) !== '0') fail('edge-jumps: the start key landed on the sheet');
    for (const step of parseKeyScript(drill.solution)) {
      if (step.type === 'text') await page.keyboard.type(step.text);
      else await page.keyboard.press(pwKey(step.spec));
    }
    const res = await page.waitForSelector('.lesson-done:not([hidden]) .tstamp.hit', { timeout: 4000 }).catch(() => null);
    if (!res) fail('edge-jumps: no tier stamp on the result card');
    const rec = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('hk2_records_v1')); } catch (e) { return null; } });
    const att = rec && rec.attempts && rec.attempts.find(a => a.ref === 'edge-jumps');
    if (!att) fail('edge-jumps: no attempt recorded');
    else if (!att.clean || att.tier === 'none') fail(`edge-jumps: attempt not clean/tiered (${JSON.stringify({ clean: att.clean, tier: att.tier })})`);
    if (!(rec && rec.pbs && rec.pbs['edge-jumps'])) fail('edge-jumps: no PB recorded');
    await page.reload();
    await page.waitForSelector('.start-card', { timeout: 5000 }).catch(() => fail('edge-jumps: reload lost the drill'));
    const ghost = await page.evaluate(() => { const b = document.querySelector('#ghostToggle'); return b ? !b.disabled : null; });
    if (ghost !== true) fail('edge-jumps: ghost toggle not enabled after a PB');
  }
} finally {
  if (errors.length) { failures += errors.length; console.log('ERRORS\n' + errors.join('\n')); }
  const secs = ((Date.now() - T0) / 1000).toFixed(1);
  console.log(failures ? `SMOKE FAILED: ${failures} problem(s) in ${secs}s` : `SMOKE OK in ${secs}s`);
  await browser.close();
  server.kill();
  process.exit(failures ? 1 : 0);
}
