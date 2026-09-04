/* r452 LANDING GUARD — dev/BETA_RETIRE_LANDING.md Part II §7, the landing half.
   Landing v2 is a marketing surface whose every number is DERIVED from the catalog, so the
   thing that can rot here is the derivation, not the copy. This asserts:
     · the chapter rail renders every HOTKEY_DRILLS group, with its live per-chapter count,
       and those counts sum to menuOrder.length (the e2e-smoke drill-count pattern)
     · the catalog h2 and the hero lede carry the live totals, not typed ones
     · the free / "free right now" / PRO badge tracks hkPremiumOn() in BOTH states, driven
       through the dev preview (?premium=preview) so no flag is ever edited to run a test
     · the PRO tier names every HOTKEY_PREMIUM chapter with its earn-in level, carries the
       live premium and catalog counts, and points at billing.html
     · r455 THE PRICE LAW — the landing is now allowed to quote a price, and every dollar
       figure on it must be a string out of HOTKEY_PRO.plans. A literal fails here and in
       dev/check-paywall.js §4b (which owns the same law on the gate). The old rule was "no
       dollar figure anywhere"; that retired the day PRO became a real tier.
     · the freeNow line is FLAG-DRIVEN: present while HOTKEY_PRO.freeNow, gone when it flips,
       with no copy edit — asserted in both directions
     · the progression band renders one chip per HK_RANK.TIERS entry (drawn with the shared
       window.rankEmblem), one cert row per HK_TRACKS entry, and names HK_RANK.RANKED_MIN_LVL
     · r455.1 THE SKILLS LINE — every chapter card says, in plain words, what that chapter
       teaches (window.HK_CHAPTER_SKILLS, hand-curated from dev/curriculum-v3.json's `teaches`
       tags; see the map's comment in index.html). Wolf's v3 note was "make it pithy, so I can
       identify at a glance what I'll be learning and practising", and this band is the answer,
       so a chapter added to drills.js without a line fails the build rather than shipping a
       blank card. The lines also obey the copy law (WORKFLOW §4): no chords in marketing copy.
     · r455.1 THE WORD BUDGET — the landing's rendered word count is capped. v3 shipped 994
       words and read as an essay; the v3.1 cut took it to 493 and the cap is set just above
       that. Copy grows one paragraph at a time and nobody notices until the founder does, so
       the ratchet is a gate step, not a review habit. Raising the cap is a decision, and it
       should be made in dev/LANDING_V3.md, not in a copy edit.
     · the hero fits 1280x800 and 390x844 with the CTA above the fold and no horizontal scroll
     · a fresh device lands on Daylight (themes.js r293), the CTA is a real focusable <button>
       that runs tryEnter(), headings descend in order, and there are no exclamation marks
     · html.hk-returning still hides the landing (the r314 property e2e-audit-onboard T3 owns)
     · the ?desk=CODE invite preview writes into .lede — the r314 regression fixed in r452

   Run: node dev/check-landing.js                       (server on 127.0.0.1:8791)
        BASE=http://127.0.0.1:8799 node dev/check-landing.js */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.env.BASE || 'http://127.0.0.1:8791';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const mk = async (q, seed) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.__errs = []; page.on('pageerror', e => page.__errs.push(String(e.message).slice(0, 140)));
    await page.route('**/@supabase/**', r => r.abort());
    await page.addInitScript(() => { try { localStorage.setItem('hk_beta_ok', '1'); } catch (e) {} });
    if (seed) await page.addInitScript(seed);
    await page.goto(BASE + '/index.html' + (q || ''), { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    return page;
  };

  // --- flag OFF (today)
  let p = await mk('');
  let r = await p.evaluate(() => {
    const L = document.getElementById('landing');
    const grp = window.HOTKEY_DRILLS.groups.filter(g => g.keys.length);
    const nAll = window.hkCatalogCount();
    const rail = [...document.querySelectorAll('#lRail .l-chap')];
    const heads = [...L.querySelectorAll('h1,h2,h3')].map(h => +h.tagName[1]);
    const cta = document.getElementById('startBtn');
    return {
      chapters: rail.length, wantChapters: grp.length,
      counts: rail.map(e => +e.querySelector('.l-ccount').textContent),
      wantCounts: grp.map(g => g.keys.length),
      /* r455.1: the skills line, per card, in rail order — plus the map itself, so a chapter
         the map has never heard of is caught even if the rail somehow rendered. */
      skills: rail.map(e => ((e.querySelector('.l-cskill') || {}).textContent || '').trim()),
      skillMapMissing: grp.filter(g => !((window.HK_CHAPTER_SKILLS || {})[g.name] || '').trim())
                          .map(g => g.name),
      /* r455.1 THE WORD BUDGET: count the rendered prose, art excluded (the rank emblems are
         SVG and the MBA crest is engraved "#REF!" on purpose — themes.js r377). */
      words: (() => { const c = L.cloneNode(true); c.querySelectorAll('svg').forEach(e => e.remove());
        return (c.textContent.trim().match(/[^\s]+/g) || []).length; })(),
      sum: rail.reduce((a, e) => a + (+e.querySelector('.l-ccount').textContent), 0),
      menuOrder: nAll,
      h2: document.getElementById('lCatalogH2').textContent,
      lede: document.getElementById('landingLede').textContent,
      badges: rail.map(e => e.querySelector('.l-tag').textContent),
      proChips: [...document.querySelectorAll('#lProChaps .l-pro-chip')].map(e => e.textContent.trim()),
      wantPro: window.hkPremiumGroups(), nPrem: window.hkPremiumCount(),
      proLater: document.getElementById('lProLaterP').textContent,
      plansHref: document.getElementById('lProPlans').getAttribute('href'),
      /* r455 THE PRICE LAW: collect every dollar figure the page paints and hold it against
         HOTKEY_PRO.plans. A price typed into the markup is not in that list, so it fails. */
      prices: (L.textContent.match(/\$\s?[\d,.]+/g) || []).map(x => x.replace(/\s/g, '')),
      wantPrices: ((window.HOTKEY_PRO || {}).plans || []).map(pl => pl.price),
      freeNow: !!(window.HOTKEY_PRO || {}).freeNow,
      freeNowShown: !!document.getElementById('lFreeNow'),
      /* prose only — the rank emblems are ART, and the MBA Associate crest is engraved
         "#REF!" on purpose (themes.js r377). Strip every <svg> before reading the voice. */
      noBang: !/!/.test((() => { const c = L.cloneNode(true);
        c.querySelectorAll('svg').forEach(e => e.remove()); return c.textContent; })()),
      ladder: L.querySelectorAll('#lLadder .l-rank').length,
      ladderEmblems: L.querySelectorAll('#lLadder .l-rank svg').length,
      wantTiers: (((window.HK_RANK || {}).TIERS) || []).length,
      rankedNote: (document.getElementById('lRankedNote') || {}).textContent || '',
      minLvl: (window.HK_RANK || {}).RANKED_MIN_LVL,
      certs: L.querySelectorAll('#lProgCerts .l-cert').length,
      wantTracks: (window.HK_TRACKS || []).length,
      freeChips: [...L.querySelectorAll('#lFreeChaps .l-pro-chip')].map(e => e.textContent.trim()),
      wantFree: window.HOTKEY_DRILLS.groups.filter(g => g.keys.length &&
        window.hkPremiumGroups().indexOf(g.name) < 0).map(g => g.name),
      freeCta: !!document.getElementById('lFreeCta'),
      heads, ctaTag: cta.tagName, ctaDisabled: cta.disabled,
      hasLede: !!L.querySelector('.lede'),
      board: [...document.querySelectorAll('#lBoard .l-brow')].map(e => e.textContent),
      theme: window.currentTheme
    };
  });
  ok(r.chapters === r.wantChapters, 'the rail renders every catalog chapter (' + r.chapters + ')');
  ok(JSON.stringify(r.counts) === JSON.stringify(r.wantCounts), 'per-chapter counts match HOTKEY_DRILLS.groups', JSON.stringify(r.counts));
  ok(r.sum === r.menuOrder, 'rail counts sum to menuOrder.length (' + r.sum + ' == ' + r.menuOrder + ')');
  /* ---------------------------------------------------------------- r455.1 · the skills line */
  ok(r.skills.length === r.wantChapters && r.skills.every(s => s.length > 0),
    'every chapter card carries a skills line (' + r.skills.filter(Boolean).length + '/' + r.wantChapters + ')');
  ok(r.skillMapMissing.length === 0,
    'HK_CHAPTER_SKILLS covers every catalog chapter', 'missing: ' + r.skillMapMissing.join(', '));
  /* the copy law (WORKFLOW §4): marketing copy never embeds a chord. "anchors", not "$/F4". */
  ok(!r.skills.some(s => /\b(ctrl|alt|shift|F\d)\b/i.test(s)),
    'no chords in the skills lines (copy law)', r.skills.filter(s => /\b(ctrl|alt|shift|F\d)\b/i.test(s)).join(' | '));
  /* THE WORD BUDGET (r455.1). v3 = 994 words; the cut = 493. The cap sits at 560 — room for a
     chapter or two of catalog growth, none for a new paragraph. Raise it in LANDING_V3.md. */
  ok(r.words <= 560, 'the landing stays pithy: ' + r.words + ' rendered words (cap 560, v3 was 994)');
  ok(r.h2 === r.wantChapters + ' chapters. ' + r.menuOrder + ' drills.', 'the catalog h2 is derived: "' + r.h2 + '"');
  ok(r.lede.indexOf(String(r.menuOrder) + ' timed drills') === 0, 'the hero lede carries the live total');
  ok(r.badges.filter(b => /free right now/i.test(b)).length === r.wantPro.length,
    'flag off: the paid chapters read "free right now" (' + r.badges.join(' | ') + ')');
  ok(r.proChips.length === r.wantPro.length && r.wantPro.every(n => r.proChips.some(c => c.indexOf(n) === 0)),
    'the PRO band names all ' + r.wantPro.length + ' paid chapters: ' + r.proChips.join(' · '));
  ok(r.proLater.indexOf(r.nPrem + ' of the ' + r.menuOrder + ' drills') > 0,
    'the PRO band carries the live premium/catalog counts');
  ok(r.plansHref === 'billing.html', 'the PRO door points at billing.html');
  ok(r.prices.length > 0 && r.prices.every(x => r.wantPrices.indexOf(x) >= 0),
    'every dollar figure is read from HOTKEY_PRO.plans (' + r.prices.join(' ') + ' vs ' + r.wantPrices.join(' ') + ')');
  ok(r.wantPrices.every(x => r.prices.indexOf(x) >= 0),
    'both plans are quoted (' + r.wantPrices.join(' ') + ')');
  ok(r.freeNow === r.freeNowShown,
    'the "billing has not opened" line tracks HOTKEY_PRO.freeNow (flag=' + r.freeNow + ' shown=' + r.freeNowShown + ')');
  ok(r.noBang, 'no exclamation marks in the prose (house voice)');
  ok(r.ladder === r.wantTiers && r.ladderEmblems === r.wantTiers,
    'the rank ladder draws all ' + r.wantTiers + ' HK_RANK tiers with a rankEmblem each (' + r.ladder + '/' + r.ladderEmblems + ')');
  ok(r.minLvl && r.rankedNote.indexOf('level ' + r.minLvl) >= 0,
    'the ladder names HK_RANK.RANKED_MIN_LVL, not a typed level: "' + r.rankedNote + '"');
  ok(r.certs === r.wantTracks, 'one certificate row per HK_TRACKS entry (' + r.certs + ' == ' + r.wantTracks + ')');
  ok(r.freeChips.length === r.wantFree.length && r.wantFree.every(n => r.freeChips.some(c => c.indexOf(n) === 0)),
    'the FREE tier names the ' + r.wantFree.length + ' non-premium chapters: ' + r.freeChips.join(' · '));
  ok(r.freeCta, 'the FREE tier has its own start CTA');
  ok(r.heads[0] === 1 && r.heads.every((h, i) => i === 0 || h - r.heads[i - 1] <= 1), 'headings descend in order: ' + r.heads.join(''));
  ok(r.ctaTag === 'BUTTON' && !r.ctaDisabled, 'the Enter CTA is a real, enabled <button>');
  ok(r.hasLede, 'the landing ships a .lede (the desk-invite write target)');
  ok(r.board.length === 4, 'the clock panel renders its four rows');
  ok(r.theme === 'daylight', 'a fresh device lands on Daylight (got ' + r.theme + ')');
  ok(p.__errs.length === 0, 'zero page errors', p.__errs.join(' | '));
  // the hero fits, at both widths, with no horizontal scroll
  for (const [w, h] of [[1280, 800], [390, 844]]) {
    await p.setViewportSize({ width: w, height: h });
    /* the phone gate (index.html, <=740px) is a separate surface that sits OVER the landing at
       z:400 — hide it so what is measured is the landing's own layout, which is the share
       surface and has to read on a phone regardless. */
    await p.evaluate(() => { const g = document.querySelector('.mobile-gate'); if (g) g.style.display = 'none'; });
    await p.waitForTimeout(200);
    const g = await p.evaluate(() => {
      const r = document.getElementById('startBtn').getBoundingClientRect();
      const l = document.getElementById('landing');
      return { bottom: Math.round(r.bottom), scrollW: l.scrollWidth, clientW: l.clientWidth };
    });
    ok(g.bottom < h, 'CTA is above the fold at ' + w + 'x' + h + ' (bottom ' + g.bottom + ')');
    ok(g.scrollW <= g.clientW, 'no horizontal scroll at ' + w + ' (' + g.scrollW + ' <= ' + g.clientW + ')');
  }
  await p.setViewportSize({ width: 1280, height: 800 });

  // the CTA calls tryEnter -> dismisses the landing
  const t = await p.evaluate(async () => {
    document.getElementById('startBtn').click();
    await new Promise(r => setTimeout(r, 400));
    return document.getElementById('landing').classList.contains('gone');
  });
  ok(t, 'clicking the hero CTA runs tryEnter() and dismisses the landing');
  await p.close();

  // --- close-CTA is the same door
  p = await mk('');
  const t2 = await p.evaluate(async () => {
    document.getElementById('startBtn2').click();
    await new Promise(r => setTimeout(r, 400));
    return document.getElementById('landing').classList.contains('gone');
  });
  ok(t2, 'the close CTA is the same door');
  await p.close();

  // --- flag ON via the dev preview
  p = await mk('?premium=preview');
  const r2 = await p.evaluate(() => ({
    on: window.hkPremiumOn(),
    badges: [...document.querySelectorAll('#lRail .l-tag')].map(e => e.textContent),
    nPro: [...document.querySelectorAll('#lRail .l-tag.l-soon')].length,
    want: window.hkPremiumGroups().length,
    note: document.getElementById('lRailNote').textContent,
    prices: (document.getElementById('landing').textContent.match(/\$\s?[\d,.]+/g) || []).map(x => x.replace(/\s/g, '')),
    wantPrices: ((window.HOTKEY_PRO || {}).plans || []).map(pl => pl.price)
  }));
  ok(r2.on && r2.badges.filter(b => /^pro$/i.test(b)).length === r2.want,
    'preview ON: the same chapters relabel to PRO with no copy edit (' + r2.badges.join(' | ') + ')');
  ok(r2.prices.length > 0 && r2.prices.every(x => r2.wantPrices.indexOf(x) >= 0),
    'the price is still plans-derived with the paywall ON (' + r2.prices.join(' ') + ')');
  ok(p.__errs.length === 0, 'zero page errors in the ON state', p.__errs.join(' | '));
  await p.close();

  // --- returning user never sees the marketing landing
  p = await mk('', () => { try { localStorage.setItem('hotkey_onboarded', '1'); } catch (e) {} });
  const r3 = await p.evaluate(() => ({
    cls: document.documentElement.classList.contains('hk-returning'),
    disp: getComputedStyle(document.getElementById('landing')).display
  }));
  ok(r3.cls && r3.disp === 'none', 'html.hk-returning still hides the landing');
  await p.close();

  // --- the desk-invite preview writes into .lede (BETA_RETIRE_LANDING §1 bug)
  p = await mk('?desk=TESTDESK', () => {
    window.supabase = { createClient: () => ({
      auth: { getSession: () => Promise.resolve({ data: { session: null } }),
              getUser: () => Promise.resolve({ data: { user: null } }),
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
              signInAnonymously: () => new Promise(() => {}) },
      from: () => ({ select: () => ({ eq: function () { return this; }, order: function () { return this; },
        limit: function () { return this; }, then: (res) => Promise.resolve({ data: [], error: null }).then(res) }) }),
      rpc: (n) => Promise.resolve({ data: n === 'preview_desk' ? [{ name: 'Wharton IB Club', members: 42 }] : null, error: null }),
      functions: { invoke: () => Promise.resolve({ data: null, error: 'no' }) } }) };
  });
  await p.waitForTimeout(1200);
  const r4 = await p.evaluate(() => (document.querySelector('#landing .lede') || {}).textContent || '');
  ok(/invited to join Wharton IB Club/.test(r4), 'the ?desk= deep link writes into .lede', r4.slice(0, 80));
  await p.close();

  await browser.close();
  console.log((fail ? 'LANDING GUARD: ' + fail + ' FAILURE(S), ' : 'LANDING GUARD: ALL ') + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
