/* DEMO-REPLAY E2E (r106) — plays every drill's own demo() through the REAL engine
   and asserts the win. Closes the verification gap the offline harness can't reach
   (pointer mode, F2, copy/paste, sort, dialogs): real KeyboardEvents, real recalc,
   real graders, real win path.

   Run (cloud session):
     python3 -m http.server 8791 &                       # serve the repo root
     npm i playwright-core                               # anywhere; or NODE_PATH to it
     node dev/e2e-demo-replay.js [drill ...]             # no args = all 55
   Chromium is preinstalled at /opt/pw-browsers. Supabase CDN is blocked in the
   sandbox, so sb=false paths exercise — the boot banner there is an artifact.

   Per drill × REPS random builds: replay demo via setDemoSel + demoKey (the demo
   player's own dispatcher, no sleeps), then assert (a) the engine `done` flag —
   the real win — and (b) C.checks(S) all ok. Zero page errors tolerated. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '3', 10);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1'); // skip the landing
      localStorage.setItem('hk_tour_done', '1');     // no spotlight tour
      localStorage.setItem('hk_learn_done', '1');    // no auto-guided first drill
      localStorage.setItem('hk_handle_cache', '');   // no welcome-back card
    } catch (e) {}
  });
  await page.goto(URL, { waitUntil: 'load' });
  // CHALLENGES is a top-level const (global lexical scope, NOT a window property)
  await page.waitForFunction(() =>
    typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function' &&
    typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });

  const all = await page.evaluate(() => Object.keys(CHALLENGES));
  const want = process.argv.slice(2);
  const keys = want.length ? all.filter(k => want.includes(k)) : all;

  let failures = 0;
  for (const key of keys) {
    const runs = [];
    for (let rep = 0; rep < REPS; rep++) {
      const r = await page.evaluate((k) => {
        try {
          // close anything modal-ish left over, then a fresh build
          document.querySelectorAll('.wb-dlg').forEach(n => n.remove());
          loadChallenge(k);
          const C = CHALLENGES[k];
          const moves = (typeof C.demo === 'function') ? C.demo.call(C) : C.demo;
          if (!moves || !moves.length) return { skip: 'no demo' };
          for (const mv of moves) {
            setDemoSel(mv.sel);
            for (const kk of mv.keys) demoKey(kk);
          }
          const res = C.checks(S).map(x => ({ label: x.label, ok: !!x.ok }));
          return { done: (typeof done !== 'undefined') ? done : null,
                   fails: res.filter(x => !x.ok).map(x => x.label) };
        } catch (e) { return { error: String(e && e.message || e).slice(0, 140) }; }
      }, key);
      runs.push(r);
      if (r.skip) break;
    }
    const bad = runs.filter(r => r.error || (r.fails && r.fails.length) || r.done === false);
    if (runs[0] && runs[0].skip) { console.log(key + ': SKIP (' + runs[0].skip + ')'); continue; }
    if (bad.length) {
      failures++;
      const b = bad[0];
      console.log(key + ': FAIL ' + bad.length + '/' + runs.length +
        (b.error ? ' error=' + b.error : '') +
        (b.fails && b.fails.length ? ' checks=[' + b.fails.join(' | ') + ']' : '') +
        (b.done === false ? ' (no win flag)' : ''));
    } else {
      console.log(key + ': WIN ' + runs.length + '/' + runs.length);
    }
  }
  if (pageErrors.length) {
    failures++;
    console.log('PAGE ERRORS (' + pageErrors.length + '): ' + [...new Set(pageErrors)].slice(0, 5).join(' | '));
  }
  await browser.close();
  console.log(failures ? ('E2E: ' + failures + ' FAILURE CLASS(ES)') : 'E2E: ALL GREEN');
  process.exit(failures ? 1 : 0);
})();
