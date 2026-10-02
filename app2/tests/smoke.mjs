// Browser smoke — the non-blocking CI job (REBUILD_PLAN §3): under 2 minutes, every network request
// that is not loopback is blocked, never run against production. Usage:
//   node app2/tests/smoke.mjs            (serves the repo itself on a free port)
//   SMOKE_FULL=1 node app2/tests/smoke.mjs   (adds the project and test-out replays; no time budget)
// Requires Playwright: locally the global install at /opt/node22/lib/node_modules/playwright, in CI
// `npm install --no-save playwright@<pinned>`; the module is resolved from either.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { LESSONS } from '../content/index.js';
import { parseKeyScript, parseKeySpec } from '../engine/keyboard.js';
import { textProblems, readableText } from './text-guard.js';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const PORT = Number(process.env.PORT || 8765);
const T0 = Date.now();
const FULL = process.env.SMOKE_FULL === '1';
const BUDGET_S = 120;   // the brief's ceiling for the blocking smoke; the full run is exempt
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
  const skip = () => { if (document.querySelector('.tc-live-demo')) (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); };
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
    const watching = await page.$('.tc-live-demo');
    if (!watching) return;
    await page.keyboard.press('Escape'); await page.waitForTimeout(40);
  }
}
/** A module's story beat closes on Enter; a timed run's Ready starts on any key, which never lands on the sheet. */
async function startTimed() {
  if (await page.$('.rp[data-beat="story"]')) { await page.keyboard.press('Enter'); await page.waitForTimeout(200); }
  if (await page.$('.rp[data-beat="ready"]')) { await page.keyboard.press('Space'); await page.waitForSelector('.rp[data-beat="run"] .rp-keys', { timeout: 2000 }).catch(() => null); }
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
/** The rendered-text guard (text-guard.js): no unfilled placeholder, missing value, spliced title, doubled word or raw key on the page. */
async function guardText(label) {
  const txt = await page.evaluate(readableText);
  for (const p of textProblems(txt)) fail(`${label}: text: ${p.rule}: ${p.line.slice(0, 140)}`);
}

try {
  // every route renders
  for (const route of ['#/', '#/learn', '#/practice', '#/practice/daily', '#/practice/rapid', '#/practice/challenges', '#/leaderboard', '#/leaderboard?board=drills', '#/leaderboard?board=challenges', '#/reference', '#/pricing', '#/teams', '#/account', '#/account?section=settings', '#/about', '#/terms', '#/privacy', '#/contact', '#/checkout', '#/checkout/done', '#/nope']) {
    await page.goto(base + route);
    await page.waitForTimeout(250);
    const text = await page.evaluate(() => document.body.innerText.trim().length);
    if (!text) fail(`${route}: empty page`);
    await guardText(route);
  }
  // checkout (Phase E): the local server is a preview host, so the flag is on: Pricing's Get full
  // access goes to #/checkout, and a guest there gets the inline code sign-in, never Stripe's form
  await page.goto(base + '#/pricing');
  await page.waitForTimeout(250);
  if ((await page.getAttribute('#goFull', 'href')) !== '#/checkout') fail('#/pricing: Get full access does not open checkout with the flag on');
  await page.goto(base + '#/checkout');
  await page.waitForTimeout(400);
  if (!(await page.$('#coEmailForm'))) fail('#/checkout: the signed-out code sign-in is missing');
  // accounts (phase B): with every non-loopback request blocked, the account page still renders
  // the sign-in form, the user chip reads guest, and the save state stays honest
  await page.goto(base + '#/account');
  await page.waitForTimeout(400);
  const acct = await page.evaluate(() => ({
    hasVendor: !!(window.supabase && window.supabase.createClient),
    form: !!document.querySelector('#authForm'),
    emailDisabled: !!(document.querySelector('#authEmail') && document.querySelector('#authEmail').disabled),
    notConfigured: /Sign-in is not configured/.test(document.body.innerText),
    chip: document.querySelector('#railAvatar.guest') ? 'guest' : ((document.querySelector('#railAcctBtn') || {}).textContent || '').trim(),
    saveLine: (document.querySelector('#railSave') || {}).textContent || '',
  }));
  if (!acct.form) fail('#/account: sign-in form missing');
  if (acct.hasVendor && (acct.emailDisabled || acct.notConfigured)) fail('#/account: form disabled although the client exists');
  if (!acct.hasVendor && !acct.notConfigured) fail('#/account: no client and no "Sign-in is not configured" notice');
  if (acct.chip !== 'guest') fail(`#/account: user chip reads "${acct.chip}", not guest`);
  if (acct.saveLine !== 'Saved on this device') fail(`#/account: save state reads "${acct.saveLine}"`);

  // the fresh-visitor journey (3.0): landing → the first run (two questions, the story card) → 1.1.1 with
  // the module's story beat and the card naming itself → 1.1.C → Home → Learn → Practice → the Daily,
  // one profile from empty storage, every non-loopback request blocked
  {
    await page.goto(base + '#/'); await page.evaluate(() => localStorage.clear()); await page.reload();
    if (!(await page.waitForSelector('.lp-hero', { timeout: 5000 }).catch(() => null))) fail('journey: a fresh visitor does not get the landing');
    await page.keyboard.press('Enter');   // Start learning is the selected cell: Enter anywhere starts
    const fr = await page.waitForSelector('.fr', { timeout: 5000 }).catch(() => null);
    if (!fr) fail('journey: Enter on the landing did not open the first run');
    else {
      if (!(await page.$('.fr-opt.cursor-on'))) fail('journey: the first run opens with no option under the cursor');
      await page.keyboard.press('ArrowDown'); await page.waitForTimeout(80);   // the arrows move through the options: the highlight starts on the experience answer
      await page.keyboard.press('Enter'); await page.waitForTimeout(250);   // Next: the story card
      if (!/Clearcoat/.test(await page.evaluate(() => document.body.innerText))) fail('journey: the story card does not carry Wolf\'s line');
      await page.keyboard.press('Enter');   // Start lesson 1.1.1
      await page.waitForFunction(() => /#\/lesson\/inherited-workbook/.test(location.hash), null, { timeout: 4000 }).catch(() => fail('journey: the first run did not land on lesson 1.1.1 (' + page.url() + ')'));
      const prefsRec = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('hk2_prefs')); } catch (e) { return null; } });
      if (!prefsRec || !prefsRec.briefingDone || !prefsRec.firstRunDone) fail('journey: first-run prefs not written');
      if (!prefsRec || prefsRec.experience !== 'sometimes' || prefsRec.platform !== 'win') fail('journey: the arrow did not move the experience answer: ' + JSON.stringify(prefsRec && [prefsRec.platform, prefsRec.experience]));
    }
    t('first run');
    // 1.1.1: the module's story beat in the panel (Enter starts the job), the title row reads 1.1, the card names itself once, then the lesson by keyboard
    await page.waitForSelector('.wsc', { timeout: 5000 }).catch(() => null); await page.waitForTimeout(250);
    if (!(await page.$('.rp[data-beat="story"]'))) fail('journey: 1.1.1 has no story beat before the module\'s first lesson');
    else { await page.keyboard.press('Enter'); await page.waitForTimeout(300); if (await page.$('.rp[data-beat="story"]')) fail('journey: Enter did not close the story beat'); }
    const crumb = await page.evaluate(() => (document.querySelector('.wsc-sub') || {}).textContent || '');
    if (!/^1\.1, lesson 1 of/.test(crumb)) fail('journey: the title row does not read 1.1, lesson 1 of n: ' + crumb);
    if (!(await page.$('.tc .tc-intro'))) fail('journey: the task card does not name itself in 1.1.1');
    await play(LESSONS.find(l => l.id === 'inherited-workbook').solution);
    if (!(await page.waitForSelector('.rp[data-beat="complete"] .rp-btn[data-act="next"]', { timeout: 4000 }).catch(() => null))) fail('journey: 1.1.1 did not complete');
    await guardText('1.1.1 complete');
    t('1.1.1');
    // 1.1.C: the module challenge passes with a tier, and the page is delivered
    await page.goto(base + '#/lesson/challenge-inherited-file');
    await page.waitForSelector('.rp[data-beat="ready"], .rp[data-beat="story"]', { timeout: 5000 }).catch(() => fail('journey: 1.1.C did not open'));
    await startTimed();
    await play(LESSONS.find(l => l.id === 'challenge-inherited-file').solution);
    if (!(await page.waitForSelector('.rp[data-beat="result"] .rp-marks i.on', { state: 'attached', timeout: 5000 }).catch(() => null))) fail('journey: 1.1.C passed with no tier');
    if (!/Page 1\.1/.test(await page.evaluate(() => (document.querySelector('.rp[data-beat="result"]') || {}).textContent || ''))) fail('journey: 1.1.C passed without delivering its page');
    await guardText('1.1.C result');
    t('1.1.C');
    // Home (3.0): the next-lesson block names the next lesson, the chapter table, Level, Today and Achievements are there, none empty;
    // the first visit after a lesson shows the coach marks, dismissed with Enter
    await page.goto(base + '#/'); await page.waitForSelector('.home-level', { timeout: 5000 }).catch(() => fail('journey: Home did not render'));
    const home = await page.evaluate(() => ({
      next: (document.querySelector('.panel-h-page') || {}).textContent || '',
      empty: [...document.querySelectorAll('.panel')].filter(c => !c.innerText.trim()).map(c => c.className),
      panels: ['.home-chapter', '.home-level', '.home-today', '.home-ach', '.tbl-chapter tr.current'].filter(sel => !document.querySelector(sel)),
      coach: !!document.querySelector('.coach'),
    }));
    if (!/Know the screen/.test(home.next)) fail('journey: Home\'s next lesson reads "' + home.next + '", not the next lesson');
    if (home.empty.length) fail('journey: Home has empty panels: ' + home.empty.join(', '));
    if (home.panels.length) fail('journey: Home is missing ' + home.panels.join(', '));
    await guardText('Home after 1.1');
    if (!home.coach) fail('journey: no coach marks on the first Home after a lesson');
    else { for (let i = 0; i < 8 && (await page.$('.coach')); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(60); } if (await page.$('.coach')) fail('journey: Enter did not dismiss the coach marks'); }
    // Learn (3.0): the chapter table with module 1.1 open and current, and its page built beside it
    await page.goto(base + '#/learn'); await page.waitForSelector('.learn-table', { timeout: 5000 }).catch(() => fail('journey: Learn did not render'));
    if (!(await page.$('.learn-table tr.row-module.open'))) fail('journey: Learn has no open module');
    if (!/built/.test(await page.evaluate(() => (document.querySelector('.learn-side') || {}).textContent || ''))) fail('journey: Learn does not show page 1.1 as built');
    // Practice renders its catalog, with the first drills unlocked by 1.1
    await page.goto(base + '#/practice'); await page.waitForTimeout(300);
    if ((await page.$$('tr.row-drill[data-href]')).length < 3) fail('journey: Practice shows fewer than three drills');
    await guardText('Practice after 1.1');
    if (await page.evaluate(() => { const h = document.querySelector('.hdr'); if (!h) return false; const cs = getComputedStyle(h); return (document.activeElement === h) || (cs.outlineStyle !== 'none' && cs.outlineColor !== 'rgba(0, 0, 0, 0)' && parseFloat(cs.outlineWidth) > 0); })) fail('journey: Practice\'s header block draws a stray outline');
    t('home, learn, practice');
    // the Daily: the Ready panel, the drill by keyboard, the result panel
    const { dailyFor } = await import('../app/daily.js'); const { DRILLS } = await import('../content/drills.js');
    const day = await page.evaluate(() => new Date().toISOString().slice(0, 10));   // the Daily's day key (records.js dayOf)
    const daily = DRILLS.find(d => d.id === dailyFor(day).drillId);
    await page.goto(base + '#/daily');
    if (daily && daily.kind === 'challenge') {
      // a module challenge drawn as the Daily runs in the lesson workspace on the day's seed (drill-page.js),
      // so it has no start card; check it opens there (lessons.test.js replays every challenge headless)
      if (!(await page.waitForURL(u => u.hash.startsWith('#/lesson/' + daily.id) && u.hash.includes('daily=1'), { timeout: 5000 }).then(() => true).catch(() => false))) fail('journey: the Daily challenge did not open in the lesson workspace');
      else if (!(await page.waitForSelector('.rp[data-beat="ready"], .rp[data-beat="story"]', { timeout: 5000 }).catch(() => null))) fail('journey: the Daily challenge did not open');
    } else {
      if (!(await page.waitForSelector('.rp[data-beat="ready"]', { timeout: 5000 }).catch(() => null))) fail('journey: the Daily has no Ready panel');
      await page.keyboard.press('Space'); await page.waitForSelector('.rp[data-beat="run"] .rp-keys', { timeout: 2000 }).catch(() => fail('journey: the Daily did not start on a key'));
      if (daily) await play(daily.solution); else fail('journey: no Daily drill for ' + day);
      if (!(await page.waitForSelector('.rp[data-beat="result"]', { timeout: 5000 }).catch(() => null))) fail('journey: the Daily did not end on its result panel');
    }
    t('the Daily');
  }

  // play the first and last lesson end to end by keyboard, plus the phase-C feature carriers
  // (find/replace dialog, hide+freeze, cross-sheet formulas, the two-sheet project)
  // one lesson per module that carries new engine ground (paste special, grouping/freeze, F4 repeat, cross-sheet pointing, the audit), one seeded challenge, the project; the last lesson is the test-out
  const extras = ['copy-cut-paste-fill', 'hide-group-freeze', 'the-style-pass', 'link-across-sheets', 'hardcode-hunt', 'challenge-audit-before-you-send', 'weekly-kpi-project'].map(id => LESSONS.find(l => l.id === id)).filter(Boolean);
  // the two longest replays (the project, ~30 s, and the test-out) run with SMOKE_FULL=1 (nightly, on demand) so the
  // blocking run stays well inside its two minutes; lessons.test.js replays every solution headless on every gate
  const longOnes = FULL ? [LESSONS.find(l => l.id === 'weekly-kpi-project'), LESSONS[LESSONS.length - 1]].filter(Boolean) : [];
  for (const lesson of [...extras.filter(l => l.id !== 'weekly-kpi-project'), ...longOnes]) {   // 1.1.1 is played by the journey above
    await page.goto(base + '#/lesson/' + lesson.id);
    // the task card, or the panel's Ready (a timed run) or story beat (a module's first lesson)
    const opened = await page.waitForSelector('.tc, .rp[data-beat="ready"], .rp[data-beat="story"]', { timeout: 5000, state: 'attached' }).catch(() => null);
    if (!opened) { fail(`${lesson.id}: lesson did not open`); continue; }
    await startTimed();
    const t0 = Date.now();
    await play(lesson.solution);
    const done = await page.waitForSelector('.rp[data-beat="complete"] .rp-btn[data-act="next"], .rp[data-beat="result"]', { timeout: 4000 }).catch(() => null);
    if (!done) fail(`${lesson.id}: did not complete`);
    t(`${lesson.id} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }

  // a refresher rep from today's queue (#/due/<shortcut>) plays in the workspace and completes on its route
  {
    const { microLesson } = await import('../app/schedule.js');
    const micro = microLesson('ctrl-shift-arrow');
    await page.goto(base + '#/due/ctrl-shift-arrow');
    const ws = await page.waitForSelector('.wsc .tc', { timeout: 5000, state: 'attached' }).catch(() => null);
    if (!ws) fail('due: no workspace with a task card');
    for (const step of parseKeyScript(micro.solution)) { if (step.type === 'text') await page.keyboard.type(step.text); else await page.keyboard.press(pwKey(step.spec)); }
    const dueDone = await page.waitForSelector('.rp[data-beat="complete"] .rp-btn[data-act="due-next"]', { timeout: 4000 }).catch(() => null);
    if (!dueDone) fail('due: the refresher did not complete');
    const sched = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('hk2_schedule_v1')); } catch (e) { return null; } });
    if (!sched || !sched['ctrl-shift-arrow']) fail('due: no memory note recorded');
    await page.evaluate(() => { localStorage.removeItem('hk2_prefs'); localStorage.removeItem('hk2_schedule_v1'); });
  }

  // the drill workspace (Phase D): start card key never lands, solution replays to a tier,
  // the attempt lands in records, and after a reload the PB ghost toggle is enabled
  {
    const { DRILLS_BY_ID } = await import('../content/drills.js');
    const drill = DRILLS_BY_ID['get-around'];
    await page.goto(base + '#/drill/get-around');
    const card = await page.waitForSelector('.rp[data-beat="ready"]', { timeout: 5000 }).catch(() => null);
    if (!card) fail('get-around: no Ready panel');
    await page.keyboard.press('Space');
    if (!(await page.waitForSelector('.rp[data-beat="run"] .rp-keys', { timeout: 2000 }).catch(() => null))) fail('get-around: the start key did not start the run');
    if (await page.evaluate(() => document.querySelector('.ghost-cursor') == null)) fail('get-around: no PB ghost cursor in the sheet');
    const keysLine = await page.evaluate(() => (document.querySelector('.rp-keys') || {}).textContent || '');
    if (!/:\s*0$/.test(keysLine)) fail('get-around: the start key landed on the sheet: ' + keysLine);
    for (const step of parseKeyScript(drill.solution)) {
      if (step.type === 'text') await page.keyboard.type(step.text);
      else await page.keyboard.press(pwKey(step.spec));
    }
    const res = await page.waitForSelector('.rp[data-beat="result"] .rp-marks i.on', { state: 'attached', timeout: 4000 }).catch(() => null);
    if (!res) fail('get-around: no tier on the result panel');
    else await guardText('get-around result');
    const rec = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('hk2_records_v1')); } catch (e) { return null; } });
    const att = rec && rec.attempts && rec.attempts.find(a => a.ref === 'get-around');
    if (!att) fail('get-around: no attempt recorded');
    else if (!att.clean || att.tier === 'none') fail(`get-around: attempt not clean/tiered (${JSON.stringify({ clean: att.clean, tier: att.tier })})`);
    if (!(rec && rec.pbs && rec.pbs['get-around'])) fail('get-around: no PB recorded');
    await page.reload();
    await page.waitForSelector('.rp[data-beat="ready"]', { timeout: 5000 }).catch(() => fail('get-around: reload lost the drill'));
    const best = await page.evaluate(() => /Best /.test((document.querySelector('.rp-facts') || {}).textContent || '') && !!document.querySelector('.ghost-cursor'));
    if (best !== true) fail('get-around: Ready does not show the best with its ghost after a PB');
    // the board with a run on it: the side panel's heading and the slowest-goal line read as sentences
    await page.goto(base + '#/leaderboard?board=drills&ref=get-around'); await page.waitForTimeout(300);
    await guardText('the get-around board');
  }

  // failure paths, in their own context so the module map starts clean: a page file that
  // fails shows Retry and Retry mounts it; a failed dependency (which the browser keeps failing) recovers through the
  // reload Retry falls back to; a landing whose demo player never arrives keeps a still with a way in
  {
    const ctx2 = await browser.newContext({ viewport: { width: 1400, height: 900 }, serviceWorkers: 'block' });
    let block = null;
    await ctx2.route('**/*', route => {
      let u; try { u = new URL(route.request().url()); } catch (e) { return route.abort('blockedbyclient'); }
      if (u.origin !== `http://127.0.0.1:${PORT}`) return route.abort('blockedbyclient');
      if (block && block.test(u.pathname)) return route.abort('failed');
      return route.continue();
    });
    await ctx2.addInitScript(() => { if (!localStorage.getItem('hk2_prefs')) localStorage.setItem('hk2_prefs', JSON.stringify({ platform: 'win', firstRunDone: true, briefingDone: true, mute: true })); });
    const p2 = await ctx2.newPage();
    block = /\/app\/home-page\.js$/;
    await p2.goto(base + '#/');
    if (!(await p2.waitForSelector('#errRetry', { timeout: 5000 }).catch(() => null))) fail('failure: a Home that did not load shows no Retry');
    block = null;
    await p2.click('#errRetry').catch(() => {});
    if (!(await p2.waitForSelector('.home-level', { timeout: 5000 }).catch(() => null))) fail('failure: Retry did not bring Home back');
    const p3 = await ctx2.newPage();
    block = /\/app\/daily\.js$/;
    await p3.goto(base + '#/');
    if (!(await p3.waitForSelector('#errRetry', { timeout: 5000 }).catch(() => null))) fail('failure: a Home whose dependency failed shows no Retry');
    block = null;
    await p3.click('#errRetry').catch(() => {});
    if (!(await p3.waitForSelector('.home-level', { timeout: 8000 }).catch(() => null))) fail('failure: Retry did not recover from a failed dependency');
    const p4 = await ctx2.newPage();
    block = /\/ui\/demo-player\.js$/;
    await p4.goto(base + '#/landing');
    if (!(await p4.waitForSelector('.dp-poster img', { timeout: 5000 }).catch(() => null))) fail('failure: the landing without its demo player shows no still');
    await p4.waitForFunction(() => /didn.t load/i.test((document.querySelector('#ldDemoNote') || {}).textContent || ''), null, { timeout: 5000 }).catch(() => fail('failure: the landing does not say its live demo did not load'));
    block = null;
    await ctx2.close();
    t('failure paths');
  }
} finally {
  if (errors.length) { failures += errors.length; console.log('ERRORS\n' + errors.join('\n')); }
  const secs = ((Date.now() - T0) / 1000).toFixed(1);
  if (!FULL && +secs > BUDGET_S) { failures++; console.log(`FAIL the smoke took ${secs}s, over its ${BUDGET_S}s budget`); }
  console.log(failures ? `SMOKE FAILED: ${failures} problem(s) in ${secs}s` : `SMOKE OK in ${secs}s`);
  await browser.close();
  server.kill();
  process.exit(failures ? 1 : 0);
}
