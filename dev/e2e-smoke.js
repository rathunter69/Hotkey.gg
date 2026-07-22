/* r392 (Wolf) SMOKE — the fast always-on net for cosmetic-only pushes. Loads every
   top-level page and asserts ZERO page errors, so a syntax error or a broken shared
   script (themes.js / nav.js / nav.css consumers) can never ship even when the heavy
   drill matrix is skipped. This is NOT a substitute for the parity/guided/rapidfire
   suites — those still run whenever index.html or drills.js changes (see gate.yml).
   Run: node dev/e2e-smoke.js   (server on 127.0.0.1:8791) */
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:8791';
const PAGES = ['index.html', 'profile.html', 'stats.html', 'account.html', 'billing.html', 'leaderboard.html', 'desks.html'];

(async () => {
  const exe = process.env.CHROME || chromium.executablePath();
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const fails = [];
  for (const p of PAGES) {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_|supabase|Failed to load resource|net::/i.test(m.text())) errs.push('CONSOLE.ERR: ' + m.text()); });
    await page.route('**/@supabase/**', r => r.abort());
    try {
      await page.goto(BASE + '/' + p, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(900);
    } catch (e) { errs.push('NAV FAIL: ' + String(e).slice(0, 120)); }
    // the page must have actually mounted something
    const bodyLen = await page.evaluate(() => (document.body && document.body.innerHTML || '').length).catch(() => 0);
    if (bodyLen < 200) errs.push('EMPTY BODY (' + bodyLen + ' chars) — page did not render');
    if (errs.length) fails.push({ p, errs });
    else console.log('  PASS ' + p + ' — loaded, zero page errors');
    await page.close();
  }
  // r393 (Wolf #75): skin-unlock celebration + equip-now. Drives the in-game sweep and the
  // celebration render on a real index.html, asserting the invariants that keep it safe:
  // genuine earn ignores the beta grant, the sweep seeds silently then fires on a fresh earn,
  // equipping preserves the rest of the saved loadout, and the card shows an equip button.
  {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
    await page.route('**/@supabase/**', r => r.abort());
    try {
      await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1000);
      const r = await page.evaluate(() => {
        const o = {};
        try { localStorage.setItem('hk_beta_unlock', '1'); } catch (e) {}
        o.earnIgnoresBeta = window.hkFrameEarned('onyx', { tierBest: 2 }) === false && window.hkFrameUnlocked('onyx', { tierBest: 2 }) === true;
        try { localStorage.setItem('hk_beta_unlock', '0'); } catch (e) {}
        const l = window.hkFlair('{"f":"molten","st":["solves","crowns"],"ti":"pro"}'); l.frame = 'onyx';
        const back = window.hkFlair(window.hkFlairPack(l));
        o.loadoutPreserved = back.frame === 'onyx' && back.title === 'pro' && (back.stats || []).join(',') === 'solves,crowns';
        const calls = []; const real = window.hkCelebrate; window.hkCelebrate = c => calls.push(c);
        localStorage.removeItem('hk_skin_seen');
        localStorage.setItem('hk_ach_flags', JSON.stringify({ tierBest: 2 }));
        window.skinSweepInGame(); o.seedSilent = calls.length === 0;
        localStorage.setItem('hk_ach_flags', JSON.stringify({ tierBest: 4 }));
        window.skinSweepInGame();
        o.freshFires = calls.length === 1 && !!(calls[0].equip && calls[0].equip.frameId);
        window.hkCelebrate = real;
        window.hkCelebrate({ cap: 'x', title: 'x', equip: { frameId: 'cottoncandy', frameName: 'C' } });
        o.equipBtn = !!document.querySelector('.hk-cel-equip');
        return o;
      });
      const checks = ['earnIgnoresBeta', 'loadoutPreserved', 'seedSilent', 'freshFires', 'equipBtn'];
      const bad = checks.filter(k => !r[k]);
      if (bad.length) errs.push('skin-unlock invariants failed: ' + bad.join(', '));
      if (errs.length) fails.push({ p: 'skin-unlock', errs });
      else console.log('  PASS skin-unlock — earn/seed/fresh/equip invariants hold');
    } catch (e) { fails.push({ p: 'skin-unlock', errs: ['THREW: ' + String(e).slice(0, 160)] }); }
    await page.close();
  }

  await browser.close();
  if (fails.length) {
    console.error('\nSMOKE FAILED:');
    fails.forEach(f => console.error('  ' + f.p + '\n    ' + f.errs.join('\n    ')));
    process.exit(1);
  }
  console.log('SMOKE: ALL ' + PAGES.length + ' PAGES CLEAN + skin-unlock');
})().catch(e => { console.error('SMOKE HARNESS FAIL', e); process.exit(1); });
