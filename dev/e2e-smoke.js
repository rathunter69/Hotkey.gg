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
  // r393 (Wolf #75) / r411: skin-unlock celebration + equip-now. Drives the PAGE-LOAD sweep
  // (window.hkSkinUnlockSweep, nav.js) and the celebration render on a real index.html,
  // asserting the invariants that keep it safe: genuine earn ignores the beta grant, the sweep
  // seeds silently on first run then fires on a fresh earn, equipping preserves the rest of the
  // saved loadout, and the card shows an equip button.
  // r411: the reveal moved OUT of the drill-solve path — the old in-game skinSweepInGame (which
  // fired mid-solve, whose equip CTA navigated the page under synthetic input) is now a no-op
  // book-keeper; hkSkinUnlockSweep runs only on page load. This drives that new path.
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
        // r411: exercise the PAGE-LOAD sweep. It runs once per load (guarded by __hkSweepDone) and
        // keys on hk_seen_frames — so reset that guard between the two drives and control the state.
        localStorage.setItem('hk_xp_est', '0');                 // pin level so only tierBest drives the earn
        localStorage.removeItem('hk_seen_frames');
        localStorage.setItem('hk_ach_flags', JSON.stringify({ tierBest: 2 }));
        window.__hkSweepDone = false; window.hkSkinUnlockSweep();
        o.seedSilent = calls.length === 0;                      // first run (no seen-set) seeds silently
        localStorage.setItem('hk_ach_flags', JSON.stringify({ tierBest: 4 }));   // now plaque-gold/blueprint/constellation newly earn
        window.__hkSweepDone = false; window.hkSkinUnlockSweep();
        o.freshFires = calls.length >= 1 && calls.length <= 2   // fires on the fresh earn, capped at 2 reveals
          && !!(calls[0].equip && calls[0].equip.frameId) && !!calls[0].skinReveal;
        // the neutered in-game sweep must NEVER pop a reveal (it only advances the seen-set)
        const before = calls.length; try { window.skinSweepInGame(); } catch (e) {}
        o.inGameSilent = calls.length === before;
        window.hkCelebrate = real;
        window.hkCelebrate({ cap: 'x', title: 'x', equip: { frameId: 'cottoncandy', frameName: 'C' } });
        o.equipBtn = !!document.querySelector('.hk-cel-equip');
        o.drills = (window.HOTKEY_DRILLS && window.HOTKEY_DRILLS.menuOrder || []).length;
        return o;
      });
      const checks = ['earnIgnoresBeta', 'loadoutPreserved', 'seedSilent', 'freshFires', 'inGameSilent', 'equipBtn'];
      const bad = checks.filter(k => !r[k]);
      if (bad.length) errs.push('skin-unlock invariants failed: ' + bad.join(', '));
      if (errs.length) fails.push({ p: 'skin-unlock', errs });
      else console.log('  PASS skin-unlock — earn/seed/fresh/equip invariants hold');

      // r398 (#76): the hand-written marketing copy must not drift from the live catalog.
      // "banker-grade drills" is the unambiguous full-catalog phrase (smaller "N drills"
      // counts are chapter/feature sizes), so any "N banker-grade drills" must == menuOrder.
      const total = r.drills;
      const cerr = [];
      if (!total) cerr.push('menuOrder.length came back 0 — could not verify');
      else {
        const fs = require('fs');
        for (const f of ['index.html', 'About.html', 'enterprise.html']) {
          let txt = ''; try { txt = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
          let m; const re = /(\d+)\s+banker-grade\s+drills/g;
          while ((m = re.exec(txt))) if (+m[1] !== total) cerr.push(f + ': "' + m[0] + '" != ' + total + ' (menuOrder)');
        }
      }
      if (cerr.length) fails.push({ p: 'drill-count', errs: cerr });
      else console.log('  PASS drill-count — marketing copy matches menuOrder (' + r.drills + ')');

      // Segment C guards (r414-review): C2 — HOTKEY_PARS must mirror CHALLENGES[k].par (a
      // 5th hand-synced copy that has drifted before); C4 — de-hint: player-facing prompt /
      // checklist label / meta desc must carry NO keyboard chord (the point is to DO the
      // action, not read it). Cell refs like F4/F5 are content, not chords, so the pattern
      // only flags modifier-combos (Ctrl+/Alt+/⌘) and Alt-walk letter sequences.
      const inv = await page.evaluate(() => {
        const out = { parsMissing: [], parsMismatch: [], dehint: [] };
        const D = window.HOTKEY_DRILLS || {}, pars = D.pars || window.HOTKEY_PARS || {}, meta = D.meta || {};
        for (const k of Object.keys(CHALLENGES)) { const c = CHALLENGES[k];
          if (!(k in pars)) { out.parsMissing.push(k); continue; }
          if (Number(pars[k]) !== Number(c.par)) out.parsMismatch.push(k + ':' + pars[k] + '!=' + c.par); }
        const CHORD = /\b(Ctrl|Alt|Cmd|Shift)\s*\+|⌘|\bAlt\s+[A-Z]\b/;
        const scan = (w, t) => { if (t && CHORD.test(t)) out.dehint.push(w + ': ' + String(t).slice(0, 60)); };
        for (const k of Object.keys(CHALLENGES)) { const c = CHALLENGES[k]; scan(k + '.prompt', c.prompt);
          if (typeof c.checks === 'function') { const ls = c.checks.toString().match(/label:\s*'([^']*)'|label:\s*"([^"]*)"/g) || [];
            for (const L of ls) scan(k + '.checklist', L); } }
        for (const k of Object.keys(meta)) scan(k + '.desc', meta[k].desc);
        return out;
      });
      const ierr = [];
      if (inv.parsMissing.length) ierr.push('HOTKEY_PARS missing: ' + inv.parsMissing.slice(0, 8).join(', '));
      if (inv.parsMismatch.length) ierr.push('HOTKEY_PARS != CHALLENGES.par: ' + inv.parsMismatch.slice(0, 8).join(', '));
      if (inv.dehint.length) ierr.push('chord embedded in player copy: ' + inv.dehint.slice(0, 8).join(' | '));
      if (ierr.length) fails.push({ p: 'drill-invariants', errs: ierr });
      else console.log('  PASS drill-invariants — HOTKEY_PARS parity + de-hint copy clean');
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
