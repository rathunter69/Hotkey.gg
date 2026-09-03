/* r452 (audit P1-1) — THE RE-FIT GUARD.
   The sheet is supposed to fill a CONSTANT frame (r333) on any screen: render()'s elastic fit
   reads gridwrap.clientWidth and scales the columns to it. It does that correctly on a FRESH
   load at any size — but until r452 it never re-ran when the window changed size, so shrinking
   1440 -> 960 left the grid laid out for the old width and it overran the frame by ~200px on
   every drill in the catalog (measured: scrollWidth 852 in a 650px wrap; one explicit render()
   brought it to 640). Three causes, all fixed in index.html's r452 block: the ResizeObserver
   handle lived on `S` and was dropped by every loadChallenge(); the callback compared height
   only, so a width-only shrink was ignored; and there was no window `resize` listener at all.

   This suite is deliberately TINY and fast — dev/e2e-fit-sweep.js already walks the catalog for
   fit invariants but takes over an hour, which is why the gate never carried it and why this
   class went unwatched. A 20-second targeted check that actually runs on every PR is worth more
   than an hour-long one that does not. Four drills, the shapes that matter — a plain wide board
   (foot), the reference board (navigation), a tall model (threestmt) and a formatting board
   (pastes) — plus a §4 case for the r333 __noShrink exemption (combo), which opts OUT of the
   shrink on purpose (audit P2-9: shrinking would re-narrow the column an autofit drill just had
   the player widen) and so is asked only to re-run the fit, not to fit.

   Run: node dev/check-resize.js   (server on 127.0.0.1:8791; BASE/URL override the origin)
*/
'use strict';
const { chromium } = require('playwright-core');
/* accept either convention the fleet uses: BASE is an origin, URL is a full index.html — some
   harnesses take one, some the other, and a caller exporting URL for the batch must not end up
   requesting /index.html/index.html here */
const BASE = (process.env.BASE || process.env.URL || 'http://127.0.0.1:8791').replace(/\/index\.html\/?$/, '');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const DRILLS = (process.argv.slice(2).length ? process.argv.slice(2) : ['foot', 'navigation', 'threestmt', 'pastes']);

let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

const measure = () => {
  const w = document.getElementById('gridwrap');
  const g = document.getElementById('grid');
  if (!w || !g) return null;
  return {
    sw: g.scrollWidth, ow: Math.round(g.getBoundingClientRect().width),
    cw: w.clientWidth, ch: w.clientHeight,
    ro: !!window.__gridRO, bound: !!window.__gridResizeBound,
    /* S is a module-level `let`, not a window property — read it by bare name */
    fitW: (typeof S !== 'undefined' && S && S._renderedGwW) || 0,
    noShrink: (() => { try { const C = CHALLENGES[cur]; return !!(C && C.checks && /overflowsCol|clipsCol|####/.test(String(C.checks))); } catch (e) { return false; } })()
  };
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  /* r450 start gate: this suite never types, it only measures layout — but loadChallenge() is
     driven directly, so declare the stance (check-invariants C14) and open the gate. */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');
    localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  await page.route('**/@supabase/**', r => r.abort());
  await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* §1 — the observer is DOCUMENT-scoped and survives a board change. This is the exact
     regression: it used to live on S._gridRO, and S is rebuilt by every loadChallenge(). */
  await page.evaluate(() => loadChallenge('foot'));
  await page.waitForTimeout(400);
  await page.evaluate(() => loadChallenge('navigation'));
  await page.waitForTimeout(400);
  const own = await page.evaluate(measure);
  ok(own && own.ro, 'the grid ResizeObserver survives a board change (module-level, not on S)');
  ok(own && own.bound, 'a window resize listener is bound');

  /* §2 — the re-fit itself, per drill.

     THE INVARIANT IS PARITY WITH A FRESH LOAD, not an absolute width. A fresh load at 960 is by
     definition what the elastic fit intends at 960 (the audit's own measurement: fresh fits,
     resized overran by 202px), so "resizing to W lands where loading at W lands" is the exact
     statement of the bug and it holds for every board shape — including the r333 __noShrink
     exemption and the 40px per-column floor, neither of which the resize path may be blamed for.
     Boards are seeded per load (r421), so pin __forceSeed or the two measurements are different
     boards; pastes at 960 differs by ~20px run-to-run without it.

     The absolute "inside its frame" assertion runs alongside, guarded on the fresh load keeping
     that promise itself — pastes at 960 does NOT (681 in a 650 wrap: three columns hit the 40px
     floor, so the proportional shrink cannot reach __availW). That is a pre-existing elastic-fit
     limit, unrelated to resize, and this suite records it rather than either failing on it or
     quietly widening a threshold to hide it. */
  for (const d of DRILLS) {
    await page.setViewportSize({ width: 960, height: 900 });
    await page.evaluate(k => { window.__forceSeed = 424242; loadChallenge(k); }, d);
    await page.waitForTimeout(500);
    const fresh = await page.evaluate(measure);
    const framePromise = !!(fresh && fresh.sw <= fresh.cw + 2);
    if (!framePromise) console.log('  NOTE ' + d + ': a FRESH load at 960 already overruns (' + fresh.sw + ' in ' + fresh.cw + ') — per-column 40px floor, not a resize defect; the parity assertion below still applies');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(k => { window.__forceSeed = 424242; loadChallenge(k); }, d);
    await page.waitForTimeout(500);
    const a = await page.evaluate(measure);
    ok(a && !a.noShrink, d + ': is a shrinkable board (the r333 exemption does not apply to it)');
    ok(a && a.sw <= a.cw + 2, d + ': fits its frame at 1440x900', a && JSON.stringify(a));

    await page.setViewportSize({ width: 960, height: 900 });
    await page.waitForTimeout(700);                       // debounce is 120ms + two render ticks
    const b = await page.evaluate(measure);
    ok(b && b.cw < a.cw, d + ': the wrap actually narrowed (the test is testing something)', JSON.stringify({ before: a && a.cw, after: b && b.cw }));
    ok(b && fresh && Math.abs(b.sw - fresh.sw) <= 2, d + ': resizing to 960 lands where a FRESH load at 960 lands', JSON.stringify({ resized: b && b.sw, fresh: fresh && fresh.sw, wrap: b && b.cw }));
    if (framePromise) ok(b && b.sw <= b.cw + 2, d + ': re-fits inside its frame after a WIDTH-ONLY shrink to 960', b && JSON.stringify(b));
    ok(b && Math.abs(b.fitW - b.cw) <= 2, d + ': render() re-ran against the new width', b && JSON.stringify({ fitW: b.fitW, cw: b.cw }));

    /* and back up — growing must re-fill the frame, not leave the board stranded narrow */
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(700);
    const c = await page.evaluate(measure);
    ok(c && c.sw <= c.cw + 2, d + ': still fits after growing back to 1440', c && JSON.stringify(c));
  }

  /* §3 — a HEIGHT-only change still re-fits (the r409 case this observer was written for). */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => loadChallenge('foot'));
  await page.waitForTimeout(500);
  const h0 = await page.evaluate(measure);
  await page.setViewportSize({ width: 1440, height: 620 });
  await page.waitForTimeout(700);
  const h = await page.evaluate(measure);
  ok(h && h.ch < h0.ch, 'a height-only shrink actually shortened the wrap', JSON.stringify({ before: h0 && h0.ch, after: h && h.ch }));
  ok(h && h.sw <= h.cw + 2, 'a height-only shrink leaves the sheet inside its frame', h && JSON.stringify(h));

  /* §4 — the r333 __noShrink exemption is NOT a licence to skip the re-fit. combo opts out of
     the proportional shrink (audit P2-9 records the overrun as intentional), but render() must
     still re-run against the new viewport — otherwise the r441 freeze, the #### verdicts and the
     row math are all reasoning about a width that is no longer on screen. */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => loadChallenge('combo'));
  await page.waitForTimeout(500);
  const n0 = await page.evaluate(measure);
  ok(n0 && n0.noShrink, 'combo is a __noShrink board (the exemption case)');
  await page.setViewportSize({ width: 960, height: 900 });
  await page.waitForTimeout(700);
  const n1 = await page.evaluate(measure);
  ok(n1 && Math.abs(n1.fitW - n1.cw) <= 2, 'a __noShrink board still re-runs the fit on resize', JSON.stringify({ fitW: n1 && n1.fitW, cw: n1 && n1.cw }));

  const real = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  ok(real.length === 0, 'zero page errors across the resize sweep', real.join(' | '));

  await browser.close();
  console.log(fail ? 'RESIZE RE-FIT: ' + fail + ' FAILURE(S), ' + pass + ' PASS' : 'RESIZE RE-FIT: ALL ' + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
