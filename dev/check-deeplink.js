/* r452 (audit P1-7 · P2-1) — THE HONEST DEEP LINK, AND THE TOAST THAT CAN BE SEEN.

   §1 DEEP LINK. All 74 public SEO drill pages, the drills/ library and every drill page's
   "next drills" rail point at index.html?drill=<key>. A visitor with no progress has 49 of the
   74 keys LOCKED, and the boot path silently swapped a locked one for Navigation maze: no
   toast, no modal, no copy anywhere saying why. Two thirds of organic landing traffic arrived
   on the wrong drill with no explanation. loadChallenge() DID call openGateInfo() on that path
   — but at boot the whole viewport belongs to the marketing landing (landingOpen stays true
   until Start), so the card was painted BEHIND it, explaining a board the visitor could not
   see. §1d is that exact case: nothing may be raised under the landing, and the explanation
   must arrive once the landing is gone.

   §2 TOAST Z-ORDER. #hkToast was z-index 220 under .tour-wrap's 340, so a toast fired while the
   tour scrim was up rendered UNDERNEATH it — elementFromPoint at the toast's centre returned
   tourWrap. That is not a cosmetic edge case: the tour's ENTRY and DO-IT beats deliberately pass
   real grid keys through, so gameplay toasts fire during the tour, and openGateInfo degrades to
   a TOAST mid-tour on purpose (r174, because the gate card sits below the scrim). The one
   message the tour cannot show as a modal was therefore the one most reliably hidden by it —
   which is exactly how §1's explainer would have been swallowed on a first-run device.

   Deliberately its own file rather than more asserts inside e2e-audit-onboard.js: this is a
   BOOT-ROUTING contract (which board a URL lands you on, and whether the product says so),
   not an onboarding-sequence contract, and it must keep running unchanged while the tour
   itself is rewritten. Same shape as check-startgate / check-paywall / check-outbox.

   Run: node dev/check-deeplink.js   (server on 127.0.0.1:8791; URL/BASE override the origin)
*/
'use strict';
/* accept either convention the fleet uses: URL is a full index.html, BASE an origin */
const HK_URL = process.env.URL || ((process.env.BASE || 'http://127.0.0.1:8791').replace(/\/$/, '') + '/index.html');
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

/* records every toast as it fires — showToast self-hides after 1600ms, so polling would miss it */
const TOASTSPY = () => {
  window.__toasts = [];
  /* addInitScript runs before the document has a documentElement — observing it straight away
     throws "parameter 1 is not of type 'Node'" and the spy silently records nothing. Arm on the
     first tick where the root exists; the toast under test fires ~1s later. */
  const arm = () => { try {
    new MutationObserver(() => {
      const t = document.getElementById('hkToast');
      if (t && t.classList.contains('show') && window.__toasts[window.__toasts.length - 1] !== t.textContent) window.__toasts.push(t.textContent);
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    window.__toastSpy = 'armed';
  } catch (e) { window.__toastSpy = 'ERR ' + e.message; } };
  if (document.documentElement) arm();
  else { const iv = setInterval(() => { if (document.documentElement) { clearInterval(iv); arm(); } }, 1); }
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  await page.route('**/@supabase/**', r => r.abort());
  await page.addInitScript(TOASTSPY);
  /* r450 start gate: this suite loads boards through the ?drill= route and never types, so the
     gate is irrelevant to it — but loadChallenge() runs, so declare the stance (invariants C14). */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_primer_done', '1');
    localStorage.setItem('hk_gate_off', '1');
  } catch (e) {} });

  /* ---- §1a: a LOCKED deep link explains itself ---- */
  console.log('§1a  ?drill=wacc on a device with no progress');
  await page.goto(HK_URL + '?drill=wacc', { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof drillLocked === 'function');
  await page.waitForTimeout(2600);       // boot render + the explainer's 500ms settle + 260ms card
  const a = await page.evaluate(() => {
    const gm = document.getElementById('gateModal');
    return {
      locked: !!drillLocked('wacc'), gname: drillLocked('wacc') || '',
      cur: typeof cur !== 'undefined' ? cur : null,
      gateUp: !!(gm && gm.classList.contains('show') && getComputedStyle(gm).display !== 'none'),
      /* innerText, not textContent: the card's title is text-transform:uppercase, so compare
         case-insensitively below rather than chasing the rendered casing */
      gateText: gm ? (gm.innerText || '').replace(/\s+/g, ' ') : '',
      spy: window.__toastSpy, toasts: window.__toasts || []
    };
  });
  ok(a.spy === 'armed', 'premise: the toast spy armed', String(a.spy));
  /* the premise assertions matter: if wacc were open on a clean device, everything below would
     pass vacuously and the guard would be worthless the day the ladder changes. */
  ok(a.locked, 'premise: wacc is locked for a device with no progress', JSON.stringify({ gate: a.gname }));
  ok(a.cur && a.cur !== 'wacc', 'premise: boot fell back to another board (the r174 no-empty-grid rule)', String(a.cur));
  ok(a.gateUp, 'a locked deep link raises the gate explainer instead of failing silently', JSON.stringify({ cur: a.cur, toasts: a.toasts }));
  ok(/locked/i.test(a.gateText), 'the explainer says the tier is locked', a.gateText.slice(0, 110));
  ok(a.gname && a.gateText.toLowerCase().indexOf(a.gname.toLowerCase()) >= 0, 'the explainer names the tier', JSON.stringify({ want: a.gname, got: a.gateText.slice(0, 80) }));
  ok(a.toasts.some(s => /starting you on/i.test(s)), 'a toast names the board it started them on instead', JSON.stringify(a.toasts));
  ok(a.toasts.some(s => /level|pace clears/i.test(s)), 'the toast states the requirement, not just the swap', JSON.stringify(a.toasts));

  /* ---- §1b: the control — an UNLOCKED deep link stays silent ---- */
  console.log('§1b  ?drill=navigation (unlocked) must not explain anything');
  await page.goto(HK_URL + '?drill=navigation', { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(2400);
  const b = await page.evaluate(() => ({
    cur: typeof cur !== 'undefined' ? cur : null,
    gateUp: !!(document.getElementById('gateModal') && document.getElementById('gateModal').classList.contains('show')),
    swaps: (window.__toasts || []).filter(s => /starting you on/i.test(s))
  }));
  ok(b.cur === 'navigation', 'an unlocked deep link loads the drill it names', String(b.cur));
  ok(!b.gateUp && !b.swaps.length, 'and says nothing — no explainer where nothing was withheld', JSON.stringify(b));

  /* ---- §1c: no ?drill= at all is untouched ---- */
  console.log('§1c  no ?drill= — the resume path is unaffected');
  await page.goto(HK_URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page.waitForTimeout(2000);
  const c = await page.evaluate(() => ({
    cur: typeof cur !== 'undefined' ? cur : null,
    swaps: (window.__toasts || []).filter(s => /starting you on/i.test(s))
  }));
  ok(c.cur && !c.swaps.length, 'a plain load explains nothing', JSON.stringify(c));

  /* ---- §1d: a TRULY FRESH device — the audit's own repro ----
     This is the case that was wholly silent. On a device with no `hotkey_onboarded`, the
     marketing landing is up (landingOpen=true) when boot resolves the deep link, so raising a
     modal at that moment would explain a board the visitor cannot see — and the pre-r452 code
     did exactly that, into a screen nobody was looking at, with the card gone by the time they
     pressed Enter. The explainer now waits for the landing to clear and lands the moment they
     are actually looking at the trainer. Mid-tour it degrades to a toast (r174), which §2 is
     what makes readable. */
  console.log('§1d  ?drill=wacc on a FRESH device (landing up at boot)');
  /* a SEPARATE context: this suite's init script re-seeds hotkey_onboarded on every navigation
     (that is what makes §1a-c a returning device), so clearing the key in the page and reloading
     would just set it again. A fresh context is the only honest way to be a first-time visitor. */
  const fresh = await browser.newContext();
  await fresh.route('**/@supabase/**', r => r.abort());
  await fresh.addInitScript(TOASTSPY);
  const page2 = await fresh.newPage();
  page2.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  await page2.goto(HK_URL + '?drill=wacc', { waitUntil: 'load', timeout: 30000 });
  await page2.waitForFunction(() => typeof CHALLENGES !== 'undefined');
  await page2.waitForTimeout(900);
  const d0 = await page2.evaluate(() => ({
    landingUp: typeof landingOpen !== 'undefined' ? !!landingOpen : null,
    swaps: (window.__toasts || []).filter(s => /starting you on/i.test(s)),
    gateUp: !!(document.getElementById('gateModal') && document.getElementById('gateModal').classList.contains('show'))
  }));
  ok(d0.landingUp, 'premise: the landing is up at boot on a fresh device', JSON.stringify(d0));
  ok(!d0.swaps.length && !d0.gateUp, 'nothing is explained UNDER the landing (it would never be seen)', JSON.stringify(d0));
  /* through the landing: Enter, then the r280 keyboard pick and the r159 comfort fork */
  await page2.keyboard.press('Enter'); await page2.waitForTimeout(800);
  await page2.keyboard.press('1');     await page2.waitForTimeout(500);
  await page2.keyboard.press('2');     await page2.waitForTimeout(2600);
  const d1 = await page2.evaluate(() => ({
    landingUp: typeof landingOpen !== 'undefined' ? !!landingOpen : null,
    cur: typeof cur !== 'undefined' ? cur : null,
    swaps: (window.__toasts || []).filter(s => /starting you on/i.test(s)),
    gateUp: !!(document.getElementById('gateModal') && document.getElementById('gateModal').classList.contains('show'))
  }));
  ok(!d1.landingUp, 'premise: the landing is gone', JSON.stringify(d1));
  ok(d1.swaps.length > 0 || d1.gateUp, 'ONCE THE VISITOR CAN SEE THE TRAINER, the locked deep link is explained', JSON.stringify(d1));
  await fresh.close();

  /* ---- §2: the toast stacks above the tour scrim ---- */
  console.log('§2  toast z-order vs the tour scrim');
  const z = await page.evaluate(() => {
    const zi = el => { const v = parseInt(getComputedStyle(el).zIndex, 10); return isNaN(v) ? 0 : v; };
    showToast('z-order probe');
    const t = document.getElementById('hkToast');
    /* the tour wrap is display:none until the tour runs, so measure its z from the rule and
       force it visible for the hit test rather than driving a whole tour to get one number */
    const w = document.getElementById('tourWrap') || document.querySelector('.tour-wrap');
    if (!w) return { noTour: true, toastZ: zi(t) };
    const prevD = w.style.display, prevC = w.className, prevPE = t.style.pointerEvents;
    w.classList.add('on'); w.style.display = 'block';
    /* the toast is pointer-events:none by design, and elementFromPoint skips such elements — so
       the raw hit test can NEVER return it and would "fail" at any z-index. Lift that one
       property for the probe: what is being measured is PAINT/stacking order, which for
       siblings in the same stacking context is exactly what hit-testing order reflects. */
    t.style.pointerEvents = 'auto';
    const r = t.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
    const out = { toastZ: zi(t), tourZ: zi(w), onToast: !!(hit && (hit === t || t.contains(hit))),
      hit: hit ? (hit.id || (typeof hit.className === 'string' ? hit.className : '') || hit.tagName) : null };
    w.style.display = prevD; w.className = prevC; t.style.pointerEvents = prevPE;
    return out;
  });
  if (z.noTour) {
    console.log('  NOTE no .tour-wrap in this build — z-order case skipped, toast z is ' + z.toastZ);
  } else {
    ok(z.toastZ > z.tourZ, 'the toast stacks above the tour wrap', JSON.stringify({ toast: z.toastZ, tour: z.tourZ }));
    ok(z.onToast, 'elementFromPoint at the toast centre hits the toast, not the scrim', String(z.hit));
  }

  const real = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  ok(real.length === 0, 'zero page errors across the sweep', real.join(' | '));
  await browser.close();
  console.log(fail ? 'DEEP LINK: ' + fail + ' FAILURE(S), ' + pass + ' PASS' : 'DEEP LINK: ALL ' + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
