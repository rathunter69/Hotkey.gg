/* r450 PAYWALL GUARD — the whole premium UX, asserted in BOTH states from one run.

   The paywall ships DARK: drills.js `HOTKEY_PREMIUM.enabled` is false and must stay
   false until Stripe is live. That makes this suite's first job the unusual one — it
   proves that everything r450 added is INVISIBLE and INERT today, so the feature can
   sit in main indefinitely without being a live risk. Its second job is to prove the
   ON state actually works, driven through the dev preview (drills.js hkPremiumPreview:
   `?premium=preview` / localStorage hk_premium_preview='1') so no flag is ever edited
   to run a test.

     §1  FLAG OFF  — zero visible change, zero behavioral change
     §2  PREVIEW   — locked cards render, keyboard still reaches them
     §3  MODAL     — opens on launch, closes by keyboard, decline returns the picker
     §4  BILLING   — counts derive from menuOrder; price is TBD; checkout is disabled
     §5  PLACEMENT — the opmodel carve-out, and the hole closing behind it
     §6  STUB      — hk_entitled='1' unlocks; free-tier history survives either way

   Run: node dev/check-paywall.js            (server on 127.0.0.1:8791)
        BASE=http://127.0.0.1:8830 node dev/check-paywall.js                          */
'use strict';
const { chromium } = require('playwright-core');
const fs = require('fs');
const BASE = process.env.BASE || 'http://127.0.0.1:8791';
const PINNED = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const fails = [];
const pass = m => console.log('  PASS ' + m);
const fail = (sec, m) => { fails.push(sec + ': ' + m); console.error('  FAIL ' + sec + ' — ' + m); };
const check = (sec, cond, m) => cond ? pass(sec + ' — ' + m) : fail(sec, m);

/* The catalog, read STATICALLY out of drills.js — deliberately not from the page, so a
   bug that makes the page's own derivation wrong cannot also make the expectation wrong.
   Same shape as the "N banker-grade drills" guard in dev/e2e-smoke.js. */
function catalogFromSource() {
  const src = fs.readFileSync('drills.js', 'utf8');
  const gm = /window\.HOTKEY_PREMIUM\s*=\s*\{\s*enabled:\s*(true|false)\s*,\s*groups:\s*\[([^\]]*)\]/.exec(src);
  if (!gm) throw new Error('check-paywall: could not read HOTKEY_PREMIUM from drills.js');
  const enabled = gm[1] === 'true';
  const premiumGroups = gm[2].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  // group blocks: { name: 'X', keys: [...] }
  const groups = [];
  const re = /\{\s*name:\s*'([^']+)'\s*,\s*keys:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(src))) {
    const keys = m[2].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    if (keys.length) groups.push({ name: m[1], keys });
  }
  const seen = new Set(); const uniq = [];
  for (const g of groups) if (!seen.has(g.name)) { seen.add(g.name); uniq.push(g); }
  const menuOrder = uniq.flatMap(g => g.keys);
  const premium = uniq.filter(g => premiumGroups.includes(g.name));
  return { enabled, premiumGroups, groups: uniq, menuOrder,
           nAll: menuOrder.length, nPrem: premium.flatMap(g => g.keys).length, premium };
}

(async () => {
  const CAT = catalogFromSource();
  console.log('catalog @ drills.js — ' + CAT.nAll + ' drills · ' + CAT.nPrem + ' premium in ' +
              CAT.premium.map(g => g.name + '(' + g.keys.length + ')').join(' ') +
              ' · flag enabled=' + CAT.enabled);

  /* THE SHIPPING INVARIANT. If this ever fires, the paywall went live by accident — every
     other section below is written assuming the flag ships false. */
  check('§0 flag', CAT.enabled === false,
    'HOTKEY_PREMIUM.enabled is false in drills.js (the paywall ships dark)');
  if (CAT.enabled) {
    console.error('\n  check-paywall: the flag is ON in source. §1 (zero visible change) cannot hold.');
    process.exit(1);
  }

  const exe = process.env.CHROME || (fs.existsSync(PINNED) ? PINNED : chromium.executablePath());
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });

  const newPage = async (url, seed) => {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
    page.on('console', mm => { if (mm.type() === 'error' && !/ERR_|supabase|Failed to load resource|net::/i.test(mm.text())) errs.push('CONSOLE.ERR: ' + mm.text()); });
    await page.route('**/@supabase/**', r => r.abort());
    await page.addInitScript(() => { try { localStorage.setItem('hk_gate_off', '1'); } catch (e) {} });   /* r450 harness contract: suites opt out of the drill-start gate (C14) */
    await page.goto(BASE + '/' + url, { waitUntil: 'load', timeout: 30000 });
    if (seed) await page.evaluate(seed);
    if (seed) { await page.reload({ waitUntil: 'load', timeout: 30000 }); }
    await page.waitForTimeout(900);
    page.__errs = errs;
    return page;
  };
  // a clean device: no preview, no entitlement, no PBs, no placement latch
  const WIPE = () => { try { ['hk_premium_preview', 'hk_entitled', 'hk_placement_done', 'hotkey_pb', 'hk_pk_folds'].forEach(k => localStorage.removeItem(k)); } catch (e) {} };

  /* ======================================================================== §1 */
  {
    const page = await newPage('index.html', WIPE);
    // unfold the whole tree so every row is in the DOM, then read it
    const r = await page.evaluate(() => {
      const D = window.HOTKEY_DRILLS, out = {};
      out.premiumOn = window.hkPremiumOn();
      out.allEntitled = D.menuOrder.every(k => window.hkEntitled(k) === true);
      out.noneePaywalled = D.menuOrder.every(k => drillPaywalled(k) === null);
      try { localStorage.setItem('hk_pk_folds', '[]'); } catch (e) {}
      openPicker();
      const host = document.getElementById('pkGroups');
      out.locks = host.querySelectorAll('.pk-lock').length;
      out.protags = host.querySelectorAll('.pk-protag').length;
      out.pwRows = host.querySelectorAll('.pk-byline.pw').length;
      out.advtags = host.querySelectorAll('.pk-advtag').length;       // the r156 tag must SURVIVE untouched
      out.rows = host.querySelectorAll('.pk-byline').length;
      closePicker();
      // the paywall modal must not merely be closed — it must never have been built
      out.modalInDom = !!document.getElementById('paywallModal');
      /* a premium drill launches normally. NOTE: the r158 progression ladder is a SEPARATE
         gate that would bounce `lbo` on a virgin device (Models II wants LVL 9 + 26 clears),
         and that gate is not under test here — grandfather the group with an in-memory PB
         (groupUnlocked's "you've been here" branch) so what remains is purely the paywall. */
      PB.lbo = 61.2;
      loadChallenge('lbo');
      out.gateBounced = !!(document.getElementById('gateModal') || {}).classList &&
                        document.getElementById('gateModal').classList.contains('show');
      out.launched = (typeof cur !== 'undefined') && cur === 'lbo';
      out.modalAfterLaunch = !!document.getElementById('paywallModal');
      // the tracks modal carries no locks either
      openCampaign();
      out.campLocks = document.querySelectorAll('#campaignModal .camp-drill.pw').length;
      document.getElementById('campX').click();
      // the pools are the full catalog
      out.nextFromLast = nextUnlockedFrom(D.menuOrder.indexOf('dcfbuild'));
      return out;
    });
    check('§1 off', r.premiumOn === false, 'hkPremiumOn() is false with no preview');
    check('§1 off', r.allEntitled, 'hkEntitled() is true for all ' + CAT.nAll + ' drills');
    check('§1 off', r.noneePaywalled, 'drillPaywalled() is null for every drill');
    check('§1 off', r.rows === CAT.nAll, 'the picker renders all ' + CAT.nAll + ' files (got ' + r.rows + ')');
    check('§1 off', r.locks === 0 && r.protags === 0 && r.pwRows === 0,
      'ZERO paywall marks in the picker (locks=' + r.locks + ' PRO=' + r.protags + ' pw-rows=' + r.pwRows + ')');
    check('§1 off', r.advtags === CAT.premiumGroups.length,
      'the r156 "◆ advanced" tags are untouched (' + r.advtags + ')');
    check('§1 off', !r.modalInDom, '#paywallModal is never constructed');
    check('§1 off', r.launched && !r.modalAfterLaunch && !r.gateBounced,
      'a premium drill (lbo) launches with no modal and no bounce');
    check('§1 off', r.campLocks === 0, 'the tracks modal shows no locked milestones');
    check('§1 off', r.nextFromLast !== undefined, 'nextUnlockedFrom() still walks the full catalog');
    check('§1 off', page.__errs.length === 0, 'zero page errors (' + page.__errs.join(' | ') + ')');
    await page.close();
  }

  /* ======================================================================== §2/§3/§5/§6 */
  {
    const page = await newPage('index.html?premium=preview', () => {
      try { ['hk_entitled', 'hk_placement_done'].forEach(k => localStorage.removeItem(k)); } catch (e) {}
      try { localStorage.setItem('hk_pk_folds', '[]'); } catch (e) {}
      // give the player a PB on every placement board EXCEPT opmodel, and one on a paid
      // drill they cleared while the catalog was free — free-tier integrity depends on it
      try { localStorage.setItem('hotkey_pb', JSON.stringify({ navigation: 9.1, combo: 12.2, margin: 14.3, sort: 15.4, lbo: 61.2 })); } catch (e) {}
    });

    /* §2 — the locked catalog IS the sales page */
    const r2 = await page.evaluate(() => {
      const D = window.HOTKEY_DRILLS, out = {};
      out.premiumOn = window.hkPremiumOn();
      out.enabledStillFalse = window.HOTKEY_PREMIUM.enabled === false;   // preview must not mutate the flag
      openPicker();
      const host = document.getElementById('pkGroups');
      out.rows = host.querySelectorAll('.pk-byline').length;
      out.locked = [...host.querySelectorAll('.pk-byline.pw')].map(e => e.dataset.key);
      out.locks = host.querySelectorAll('.pk-lock').length;
      out.protags = [...host.querySelectorAll('.pk-protag')].length;
      out.protagText = (host.querySelector('.pk-protag') || {}).textContent || '';
      out.hidden = host.querySelectorAll('.pk-byline.hidden').length;
      // an earned PB on a locked drill must still show — nothing already earned is hidden
      const lboRow = host.querySelector('.pk-byline[data-key="lbo"]');
      out.lboLocked = !!(lboRow && lboRow.classList.contains('pw'));
      out.lboPbShown = !!(lboRow && /61\.20s/.test(lboRow.textContent));
      // KEYBOARD: walk from the top and land on a locked row; pkRows() must include it
      const rows = pkRows();
      out.kbdReaches = rows.some(x => x.classList.contains('pw'));
      const i = rows.findIndex(x => x.dataset.key === 'lbo');
      out.kbdIndexed = i >= 0;
      pkSel = i; highlightPk();
      out.kbdFocused = rows[i].classList.contains('focus');
      // pools must exclude paid drills
      out.poolClean = D.menuOrder.filter(k => !drillLocked(k) && !drillPaywalled(k)).every(k => !window.hkPremiumKey(k) || window.hkEntitled(k));
      out.nextSkips = !window.hkPremiumKey(nextUnlockedFrom(D.menuOrder.indexOf('sumif'))) ||
                       window.hkEntitled(nextUnlockedFrom(D.menuOrder.indexOf('sumif')));
      return out;
    });
    check('§2 preview', r2.premiumOn === true, '?premium=preview turns the paywall ON');
    check('§2 preview', r2.enabledStillFalse, 'the preview does NOT mutate HOTKEY_PREMIUM.enabled');
    check('§2 preview', r2.rows === CAT.nAll, 'nothing is hidden — all ' + CAT.nAll + ' files still render (' + r2.rows + ')');
    check('§2 preview', r2.hidden === 0, 'no .hidden rows with every folder open');
    check('§2 preview', r2.locks === r2.locked.length && r2.locked.length > 0,
      r2.locked.length + ' locked cards, each wearing a lock glyph');
    check('§2 preview', r2.protags === CAT.premiumGroups.length && /PRO/.test(r2.protagText),
      'each of the ' + CAT.premiumGroups.length + ' paid chapters carries a PRO header badge');
    check('§2 preview', r2.kbdReaches && r2.kbdIndexed && r2.kbdFocused,
      'keyboard navigation still reaches and focuses a locked card');
    check('§2 preview', r2.lboLocked && r2.lboPbShown,
      'a locked card still shows the PB the player already earned on it');
    check('§2 preview', r2.poolClean && r2.nextSkips, 'drill pools and next/prev skip paid drills');

    /* §5 — placement vs entitlement, walked */
    const r5 = await page.evaluate(() => {
      const out = {};
      out.opmodelIsPremium = window.hkPremiumKey('opmodel');
      out.opmodelIsPlacement = (window.HK_PLACEMENT.KEYS || []).indexOf('opmodel') >= 0;
      out.rideOpen = window.hkPlacementRide('opmodel');
      out.entitledDuring = window.hkEntitled('opmodel');           // must ride through
      out.notLockedInPicker = !document.querySelector('#pkGroups .pk-byline[data-key="opmodel"]').classList.contains('pw');
      // ...and the hole closes the moment placement completes
      const pb = JSON.parse(localStorage.getItem('hotkey_pb') || '{}'); pb.opmodel = 88.8;
      localStorage.setItem('hotkey_pb', JSON.stringify(pb));
      out.rideClosed = window.hkPlacementRide('opmodel') === false;
      out.entitledAfter = window.hkEntitled('opmodel');            // must now be false
      // the explicit owner latch closes it too
      localStorage.setItem('hotkey_pb', JSON.stringify({ navigation: 1 }));
      localStorage.setItem('hk_placement_done', '1');
      out.latchCloses = window.hkEntitled('opmodel') === false;
      // no OTHER paid drill ever rides through
      localStorage.removeItem('hk_placement_done');
      localStorage.setItem('hotkey_pb', JSON.stringify({}));
      out.othersNeverRide = window.HOTKEY_DRILLS.menuOrder
        .filter(k => window.hkPremiumKey(k) && k !== 'opmodel')
        .every(k => window.hkEntitled(k) === false);
      // restore the mid-placement device for the rest of the run
      localStorage.setItem('hotkey_pb', JSON.stringify({ navigation: 9.1, combo: 12.2, margin: 14.3, sort: 15.4, lbo: 61.2 }));
      return out;
    });
    check('§5 placement', r5.opmodelIsPremium && r5.opmodelIsPlacement,
      'opmodel is BOTH a Full Builds drill and an HK_PLACEMENT board (the collision is real)');
    check('§5 placement', r5.rideOpen && r5.entitledDuring && r5.notLockedInPicker,
      'placement RIDES THROUGH: opmodel is open and unlocked while the series is unfinished');
    check('§5 placement', r5.rideClosed && r5.entitledAfter === false,
      'the hole CLOSES: posting the fifth board locks opmodel again');
    check('§5 placement', r5.latchCloses, 'hk_placement_done=1 also closes it');
    check('§5 placement', r5.othersNeverRide,
      'no other paid drill rides through placement (' + (CAT.nPrem - 1) + ' still locked)');

    /* §3 — the modal */
    const r3 = await page.evaluate(async () => {
      const out = {}, sleep = ms => new Promise(r => setTimeout(r, ms));
      closePicker(); openPicker();
      // launch a locked drill the way the picker does
      closePicker(); loadChallenge('lbo');
      await sleep(120);
      const m = document.getElementById('paywallModal');
      out.opened = !!(m && m.classList.contains('show'));
      out.boardUntouched = (typeof cur !== 'undefined') && cur !== 'lbo';   // state untouched
      const txt = m ? m.textContent : '';
      out.namesChapters = window.hkPremiumGroups().every(g => txt.includes(g));
      out.namesCounts = txt.includes(String(window.hkPremiumCount())) && txt.includes(String(window.hkCatalogCount()));
      out.hasPlans = !!(m && m.querySelector('#pwPlans') && /billing\.html$/.test(m.querySelector('#pwPlans').getAttribute('href')));
      out.hasDecline = !!(m && m.querySelector('#pwBack'));
      out.noPrice = !/\$\s?\d/.test(txt);                                   // never quote a price we can't charge
      // ESC dismisses AND hands back the picker
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await sleep(120);
      out.closedByKeyboard = !document.getElementById('paywallModal').classList.contains('show');
      out.declineToPicker = !!(document.getElementById('picker') || {}).classList &&
                            document.getElementById('picker').classList.contains('show');
      closePicker();
      /* and the campaign shows LOCKED, not BROKEN. The tracks modal only prints drill rows for
         chapters the pace ladder has opened, so a virgin device would render c1 alone (all
         free) and prove nothing. Clear every milestone in memory first — that is also the
         exact player this matters most for: someone who shipped the whole free ladder and now
         meets the paywall at the top of it, with clears already banked on paid drills. */
      const restore = [];
      window.HOTKEY_DRILLS.menuOrder.forEach(k => { if (PB[k] === undefined) { PB[k] = 0.1; restore.push(k); } });
      openCampaign();
      const cd = [...document.querySelectorAll('#campaignModal .camp-drill')];
      out.campRows = cd.length;
      out.campLocked = cd.filter(e => e.classList.contains('pw')).length;
      out.campKeepsClears = cd.every(e => !/undefined|NaN/.test(e.textContent));
      // a clear the player already banked on a now-paid drill is still shown as a clear
      const paidCleared = cd.filter(e => e.classList.contains('pw') && e.classList.contains('ok'));
      out.paidClearsKept = paidCleared.length > 0 && paidCleared.every(e => /✓/.test(e.textContent));
      document.getElementById('campX').click();
      restore.forEach(k => { delete PB[k]; });
      return out;
    });
    check('§3 modal', r3.opened, 'launching a locked drill opens the upgrade modal');
    check('§3 modal', r3.boardUntouched, 'the board on screen is untouched — no state change on a blocked launch');
    check('§3 modal', r3.namesChapters, 'the modal names all four paid chapters');
    check('§3 modal', r3.namesCounts, 'the modal carries the live premium and catalog counts');
    check('§3 modal', r3.hasPlans, '"See plans" points at billing.html');
    check('§3 modal', r3.hasDecline, 'a decline path exists');
    check('§3 modal', r3.noPrice, 'the modal quotes NO dollar figure (pre-Stripe)');
    check('§3 modal', r3.closedByKeyboard, 'Escape dismisses the modal');
    check('§3 modal', r3.declineToPicker, 'declining hands the player back to the picker');
    check('§3 modal', r3.campLocked > 0 && r3.campKeepsClears,
      'the tracks modal shows ' + r3.campLocked + '/' + r3.campRows + ' milestones LOCKED, none broken');
    check('§3 modal', r3.paidClearsKept,
      'a clear already banked on a now-paid milestone keeps its ✓ (no rug-pull)');

    /* §6 — the entitlement stub is the one thing that unlocks */
    const r6 = await page.evaluate(async () => {
      const out = {}, sleep = ms => new Promise(r => setTimeout(r, ms));
      out.before = window.hkEntitled('lbo');
      localStorage.setItem('hk_entitled', '1');
      out.readTrue = window.hkEntitlementRead() === true;
      out.after = window.hkEntitled('lbo');
      out.allUnlocked = window.HOTKEY_DRILLS.menuOrder.every(k => window.hkEntitled(k) === true);
      // and the picker repaints clean through the published refresh hook
      window.hkEntitlementRefresh(); openPicker();
      out.locksAfter = document.querySelectorAll('#pkGroups .pk-lock').length;
      out.protagsAfter = document.querySelectorAll('#pkGroups .pk-protag').length;   // the chapter is still PRO-branded
      closePicker();
      loadChallenge('lbo'); await sleep(120);
      out.launched = cur === 'lbo';
      out.noModal = !document.getElementById('paywallModal').classList.contains('show');
      localStorage.removeItem('hk_entitled');
      return out;
    });
    check('§6 stub', r6.before === false && r6.after === true && r6.readTrue,
      "hk_entitled='1' flips hkEntitlementRead() and unlocks the paid tier");
    check('§6 stub', r6.allUnlocked, 'an entitled player is entitled to every drill in the catalog');
    check('§6 stub', r6.locksAfter === 0, 'the picker repaints with zero locks after the refresh hook');
    check('§6 stub', r6.protagsAfter === CAT.premiumGroups.length,
      'paid chapters keep their PRO badge for an entitled player (branding, not a gate)');
    check('§6 stub', r6.launched && r6.noModal, 'an entitled player launches a paid drill with no modal');

    check('§2 preview', page.__errs.length === 0, 'zero page errors in the ON state (' + page.__errs.join(' | ') + ')');
    await page.close();
  }

  /* localStorage variant of the preview must work identically to the URL param */
  {
    const page = await newPage('index.html', () => { try { localStorage.setItem('hk_premium_preview', '1'); } catch (e) {} });
    const r = await page.evaluate(() => ({ on: window.hkPremiumOn(), locked: !window.hkEntitled('lbo') }));
    check('§2 preview', r.on && r.locked, "localStorage hk_premium_preview='1' is honored like the URL param");
    await page.evaluate(() => { try { localStorage.removeItem('hk_premium_preview'); } catch (e) {} });
    await page.close();
  }

  /* ======================================================================== §4 */
  for (const [label, seed] of [['flag off', () => { try { localStorage.removeItem('hk_premium_preview'); } catch (e) {} }],
                               ['preview',  () => { try { localStorage.setItem('hk_premium_preview', '1'); } catch (e) {} }]]) {
    const page = await newPage('billing.html', seed);
    const r = await page.evaluate(() => {
      const out = {};
      const incl = [...document.querySelectorAll('#pwIncl .pwc')];
      out.chapters = incl.slice(0, -1).map((e, i) => ({
        name: e.previousElementSibling.textContent.trim(), n: +e.dataset.n }));
      const tot = document.getElementById('pwTotal');
      out.total = tot ? +tot.dataset.n : null;
      out.all = tot ? +tot.dataset.all : null;
      out.price = (document.getElementById('pwPrice') || {}).textContent || '';
      const cta = document.getElementById('pwCheckout');
      out.ctaText = cta ? cta.textContent : '';
      out.ctaDisabled = !!(cta && cta.disabled);
      out.tbdBadge = !!document.querySelector('.pw-tbd');
      out.bodyPrice = /\$\s?\d/.test((document.getElementById('plans') || {}).textContent || '');
      out.freeCopy = (document.getElementById('pwFree') || {}).textContent || '';
      return out;
    });
    const want = CAT.premium.map(g => ({ name: g.name, n: g.keys.length }));
    const same = JSON.stringify(r.chapters) === JSON.stringify(want);
    check('§4 billing/' + label, same,
      'what\'s-included matches HOTKEY_PREMIUM × menuOrder — ' + JSON.stringify(r.chapters));
    check('§4 billing/' + label, r.total === CAT.nPrem && r.all === CAT.nAll,
      'the totals match menuOrder (' + r.total + ' of ' + r.all + ' vs ' + CAT.nPrem + ' of ' + CAT.nAll + ')');
    check('§4 billing/' + label, /TBD/.test(r.price) && r.tbdBadge,
      'pricing renders as TBD with a "pricing not set" badge');
    check('§4 billing/' + label, !r.bodyPrice, 'no dollar figure anywhere in the plans block');
    check('§4 billing/' + label, r.ctaDisabled && /Payments launching soon/i.test(r.ctaText),
      'checkout is a disabled "Payments launching soon" stub');
    check('§4 billing/' + label, page.__errs.length === 0, 'zero page errors (' + page.__errs.join(' | ') + ')');
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error('\ncheck-paywall: ' + fails.length + ' FAILURES\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('\ncheck-paywall: clean — dark with the flag off, complete with the preview on');
})();
