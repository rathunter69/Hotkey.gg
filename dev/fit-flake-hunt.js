/* r437 FIT-FLAKE HUNT — a diagnostic, not a gate.
   DEPTH_PASS_CAMPAIGN open item #4: "a fit-sweep flake was seen once in four runs (one drill
   loading with #####, seed-dependent); a scan of every non-exempt drill x 8 seeds found
   nothing. Real but intermittent — capture the drill key next time it fires."

   e2e-fit-sweep runs REPS=3 per drill and prints the offender, but its output is easy to lose
   in a batched gate run and 3 seeds is thin for a rare seed. This runs the same two scans at a
   configurable depth and reports, per drill, HOW MANY of N seeds fired and on which scan
   (LOAD vs POST-solve) — so a one-in-forty seed gets a hit count instead of a coin flip.

   Run: node dev/fit-flake-hunt.js [reps] [drillKey]
        REPS defaults to 40. Give a drill key to hammer just that one. */
'use strict';
const { chromium } = require('playwright-core');
const EXE  = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const REPS = +(process.argv[2] || 40);
const ONLY = process.argv[3] || null;
const EXEMPT = new Set(['autofit', 'combo', 'gauntlet', 'unhide']);   // same exemptions as the gate

const SCAN = `
  (() => {
    const out = [];
    for (let c = 1; c <= COLS; c++) {
      for (let r = 1; r <= S.ROWS; r++) {
        const cell = S.cells[colLetter(c) + r];
        if (!cell || cell.wrap || typeof cell.value !== 'number') continue;
        const t = fmtNum(cell.value, cell.fmtStyle, cell.decimals);
        if (t.length * CHARPX + 12 > colW[c]) out.push(colLetter(c) + r + '=' + t + ' @' + colW[c] + 'px');
      }
    }
    return out;
  })()`;

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1');    localStorage.setItem('hk_beta_ok', '1');
    localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  await page.goto(process.env.URL || 'http://127.0.0.1:8791/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  const keys = (await page.evaluate(() => Object.keys(CHALLENGES)))
    .filter(k => !EXEMPT.has(k)).filter(k => !ONLY || k === ONLY);
  const tally = {};   // key -> {load:n, post:n, seen:Set}

  for (const key of keys) {
    for (let rep = 0; rep < REPS; rep++) {
      const res = await page.evaluate(([k, scan]) => {
        document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
        loadChallenge(k);
        const load = eval(scan);
        let post = [];
        try {
          const C = CHALLENGES[k];
          const moves = (typeof C.demo === 'function') ? C.demo.call(C) : C.demo;
          if (moves) { for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
                       post = eval(scan); }
        } catch (e) { post = ['THREW:' + e.message]; }
        return { load, post };
      }, [key, SCAN]);
      if (res.load.length || res.post.length) {
        const t = tally[key] = tally[key] || { load: 0, post: 0, seen: new Set() };
        if (res.load.length) { t.load++; res.load.forEach(h => t.seen.add('LOAD ' + h)); }
        if (res.post.length) { t.post++; res.post.forEach(h => t.seen.add('POST ' + h)); }
      }
    }
    if (tally[key]) {
      const t = tally[key];
      console.log(`HIT ${key.padEnd(12)} load ${t.load}/${REPS} · post ${t.post}/${REPS}`);
      [...t.seen].slice(0, 8).forEach(h => console.log(`      ${h}`));
    }
  }

  const names = Object.keys(tally);
  console.log(`\nFIT-FLAKE HUNT: ${keys.length} drill(s) x ${REPS} seeds — ` +
    (names.length ? `${names.length} offender(s): ${names.join(', ')}` : 'no drill ever overflowed'));
  await browser.close();
  process.exit(names.length ? 1 : 0);
})();
