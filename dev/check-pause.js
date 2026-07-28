#!/usr/bin/env node
/* r429 ALT-TAB PAUSE GUARD (Wolf round 3). Proves the three properties that make the
   pause worth having, all of which were broken before:
     1. leaving the window freezes the clock (it used to keep counting)
     2. resuming does NOT set mouseUsed (clicking the grid to get back in forfeited the
        clean run, which was the actual complaint)
     3. a key pressed to resume is swallowed, not played onto the board
   Run: CHROME=<chromium> node dev/check-pause.js   (needs the dev server on :8791) */
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:8791';

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  let fail = 0;
  const check = (ok, label, extra='') => { if (!ok) fail++; console.log(`  ${ok?'ok  ':'FAIL'} ${label}${extra?'  '+extra:''}`); };

  // Start as a RETURNING user. A fresh profile walks the whole first-run funnel — landing
  // overlay, platform picker, comfort fork, guided tour (__tourI) — and each stage swallows
  // every key before it reaches the grid, so the clock can never start and there is nothing
  // to pause. These two flags are what the app itself sets once that funnel is done.
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
    } catch (e) {}
  });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  // Dismiss the landing directly. Pressing Enter routes through tryEnter() -> advanceAccess(),
  // which lands in the auth gate when a Supabase client exists — leaving landingOpen true, and
  // the main keydown handler returns early on landingOpen, so no key ever reaches the grid.
  await page.evaluate(() => { try { dismissLanding(); } catch (e) {} });
  await page.waitForTimeout(700);
  // Dismissing the landing raises the first-run cards (platform picker, comfort fork). While
  // one is up, __introCardOpen makes the main keydown handler swallow everything, so the clock
  // can never start. Each card has its own picker listener, so Enter confirms the default.
  for (let i = 0; i < 5; i++) {
    if (!await page.evaluate(() => !!window.__introCardOpen)) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
  }
  // Load a REAL drill: Enter alone lands in the onboarding sandbox, which sets sandboxMode
  // and is deliberately never timed — so nothing there can pause and the guard proves nothing.
  await page.evaluate(() => { try { loadChallenge('filldr'); } catch (e) {} });
  await page.waitForTimeout(900);

  // Start the clock with a real keystroke, never a click (a click sets mouseUsed itself and
  // would mask the very thing this guard checks). Arrow keys are NOT enough — navigation is
  // deliberately untimed ("nothing is timed yet"); the run starts on the first real action.
  // F2 opens an edit (startClock), Escape backs out without touching the board.
  await page.keyboard.press('F2');
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const running = await page.evaluate(() => typeof running!=="undefined"?running:null);
  check(running === true, 'clock started (drill is timed)');

  // simulate leaving the window exactly as a real alt-tab does
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.waitForTimeout(120);

  const pausedNow = await page.evaluate(() => typeof paused!=="undefined"?paused:null);
  check(pausedNow === true, 'blur pauses the run', `(running was ${running})`);
  check(await page.locator('#hkPause').count() === 1, 'pause overlay is shown');

  // the clock must not advance while paused
  const t1 = await page.evaluate(() => document.getElementById('timer').textContent);
  await page.waitForTimeout(900);
  const t2 = await page.evaluate(() => document.getElementById('timer').textContent);
  check(t1 === t2, 'clock is frozen while paused', `(${t1} -> ${t2})`);

  // resume by keyboard; that key must NOT reach the board
  const cellBefore = await page.evaluate(() => JSON.stringify(typeof S!=="undefined"&&S?S.active:null));
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(250);
  const cellAfter = await page.evaluate(() => JSON.stringify(typeof S!=="undefined"&&S?S.active:null));
  check(await page.evaluate(() => typeof paused!=="undefined"?paused:null) === false, 'a key resumes the run');
  check(await page.locator('#hkPause').count() === 0, 'overlay is dismissed on resume');
  check(cellBefore === cellAfter, 'the resuming key is swallowed, not played', `(${cellBefore} -> ${cellAfter})`);

  // the whole point: getting back in must not cost the clean run
  check(await page.evaluate(() => typeof mouseUsed!=="undefined"?mouseUsed:null) === false, 'resume does not set mouseUsed');

  // and the clock runs again afterwards
  const t3 = await page.evaluate(() => document.getElementById('timer').textContent);
  await page.waitForTimeout(700);
  const t4 = await page.evaluate(() => document.getElementById('timer').textContent);
  check(t3 !== t4, 'clock resumes ticking', `(${t3} -> ${t4})`);

  // paused time must not be billed to the run
  check(parseFloat(t4) < 5, 'paused span excluded from elapsed', `(elapsed ${t4}s after ~2s of wall clock)`);

  await browser.close();
  console.log(fail ? `ALT-TAB PAUSE: ${fail} FAILURE(S)` : 'ALT-TAB PAUSE: clean');
  process.exit(fail ? 1 : 0);
})();
