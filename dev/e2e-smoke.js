/* r392 (Wolf) SMOKE — the fast always-on net for cosmetic-only pushes. Loads every
   top-level page and asserts ZERO page errors, so a syntax error or a broken shared
   script (themes.js / nav.js / nav.css consumers) can never ship even when the heavy
   drill matrix is skipped. This is NOT a substitute for the parity/guided/rapidfire
   suites — those still run whenever index.html or drills.js changes (see gate.yml).
   Run: node dev/e2e-smoke.js   (server on 127.0.0.1:8791) */
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:8791';
const PAGES = ['index.html', 'profile.html', 'stats.html', 'account.html', 'leaderboard.html', 'desks.html'];

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
  await browser.close();
  if (fails.length) {
    console.error('\nSMOKE FAILED:');
    fails.forEach(f => console.error('  ' + f.p + '\n    ' + f.errs.join('\n    ')));
    process.exit(1);
  }
  console.log('SMOKE: ALL ' + PAGES.length + ' PAGES CLEAN');
})().catch(e => { console.error('SMOKE HARNESS FAIL', e); process.exit(1); });
