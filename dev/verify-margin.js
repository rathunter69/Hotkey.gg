/* VERIFY-MARGIN (r429, DEPTH_PASS §4.21) — the drill-specific mechanics probe.
   Two things carry this drill: §1.0-R2(g) ADAPTIVE LABELS (the ask permutes per seed, so a
   static label would force the player to reverse-engineer which of three formulas each table
   wants) and the FILL-CENSUS ☆ (typing every formula must clear core and forfeit the ☆).
     node dev/verify-margin.js            # needs a server on 8791 */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const ok = [], bad = [];
const T = (n, p, d) => { console.log((p ? '  PASS  ' : '  FAIL  ') + n + (d ? ' — ' + d : '')); (p ? ok : bad).push(n); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  await page.addInitScript(() => { try { ['hotkey_onboarded', 'hk_tour_done', 'hk_learn_done']
    .forEach(k => localStorage.setItem(k, '1')); localStorage.setItem('hk_handle_cache', ''); } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function'
    && typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });
  const reset = () => page.evaluate(() => {
    try { window.__hkCelQ = []; } catch (e) {}
    document.querySelectorAll('.hk-cel-wrap').forEach(n => { try { n.click(); } catch (e) {} n.remove(); });
    try { window.__hkCelOpen = false; } catch (e) {}
    document.querySelectorAll('.wb-dlg').forEach(n => n.remove());
    loadChallenge('margin');
  });

  console.log('\nVERIFY-MARGIN (r429)');

  await reset();
  const demo = await page.evaluate(() => {
    const C = CHALLENGES.margin;
    for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    const r = C.checks(S);
    return { core: r.filter(c => !c.bonus).every(c => c.ok), star: !!r.find(c => c.bonus).ok };
  });
  T('A1 demo clears every core beat', demo.core);
  T('A2 demo EARNS the fill-census ☆', demo.star);

  // NEGATIVE CONTROL: type every formula by hand, no fill at all
  await reset();
  const typed = await page.evaluate(() => {
    const C = CHALLENGES.margin;
    for (const s of C._sites) {
      for (let j = 0; j < s.n; j++) {
        setDemoSel(s.m + (s.r0 + j));
        const f = s.ask === 'growth' ? (s.b + (s.r0 + j) + '/' + s.a + (s.r0 + j) + '-1')
                : s.ask === 'margin' ? (s.b + (s.r0 + j) + '/' + s.a + (s.r0 + j))
                                     : (s.a + (s.r0 + j) + '/' + s.b + (s.r0 + j));
        [...('=' + f)].map(ch => ({ key: ch })).forEach(demoKey); demoKey(Kb.enter);
      }
      setDemoSel(s.m + s.r0 + ':' + s.m + (s.r0 + s.n - 1));
      s.fmtKeys.forEach(demoKey);
      setDemoSel(s.m + (s.r0 - 1)); demoKey(Kb.bold);
    }
    demoKey({ key: 's', ctrl: true });
    const r = C.checks(S);
    return { core: r.filter(c => !c.bonus).every(c => c.ok), star: !!r.find(c => c.bonus).ok,
             failed: r.filter(c => !c.bonus && !c.ok).map(c => c.label) };
  });
  T('B1 typing every formula clears every core beat (§1.0(c) freedom)', typed.core, typed.failed.join(' | '));
  T('B2 typing every formula does NOT earn the ☆ (§1.0-R2(i) skippable)', !typed.star);

  // a fill that is then OVERWRITTEN by hand must not sneak through the census
  await reset();
  const overwritten = await page.evaluate(() => {
    const C = CHALLENGES.margin, s = C._sites[0];
    setDemoSel(s.m + s.r0); [...('=' + s.f)].map(ch => ({ key: ch })).forEach(demoKey); demoKey(Kb.enter);
    setDemoSel(s.m + s.r0 + ':' + s.m + (s.r0 + s.n - 1)); demoKey(Kb.fillD);
    const afterFill = !!C.checks(S).find(c => c.bonus);
    // clobber the last cell with a hand-typed literal formula that is NOT a translate
    const last = s.r0 + s.n - 1;
    setDemoSel(s.m + last);
    const f = s.ask === 'growth' ? (s.b + last + '/' + s.a + last + '-1')
            : s.ask === 'margin' ? (s.b + last + '/' + s.a + last) : (s.a + last + '/' + s.b + last);
    [...('=' + f + '+0')].map(ch => ({ key: ch })).forEach(demoKey); demoKey(Kb.enter);
    return { census: !!C.checks(S).find(c => c.bonus).ok, afterFill: !!afterFill };
  });
  T('C1 a filled column whose cells were later hand-clobbered fails the census', !overwritten.census);

  // §1.0-R2(g) ADAPTIVE LABELS
  await reset();
  const labels = await page.evaluate(() => {
    const seen = new Set(); const out = [];
    for (let i = 0; i < 30; i++) {
      loadChallenge('margin');
      const C = CHALLENGES.margin, r = C.checks(S);
      C._sites.forEach((s, k) => {
        const lab = r[k].label;
        out.push({ div: s.div, ask: s.ask, named: lab.includes(s.div) && lab.includes(s.h3) });
        seen.add(s.div + ':' + s.ask);
      });
    }
    return { allNamed: out.every(o => o.named), pairs: seen.size,
             sample: out.slice(0, 3).map(o => o.div + '/' + o.ask) };
  });
  T('D1 every check label names THIS seed\'s division AND its ratio (§1.0-R2(g))', labels.allNamed, labels.sample.join(', '));
  T('D2 the ask genuinely permutes across divisions', labels.pairs > 3, labels.pairs + ' division/ask pairs seen');

  await reset();
  const disp = await page.evaluate(() => {
    const C = CHALLENGES.margin, r = C.checks(S), t = document.getElementById('checklist').textContent;
    return { one: r.filter(c => c.bonus).length, nCore: r.filter(c => !c.bonus).length,
             mystery: /☆\s*\?/.test(t), leak: /one formula and a fill/.test(t) };
  });
  T('E1 exactly one bonus check', disp.one === 1);
  T('E2 4 authored core beats + the engine save closer (§1.1 floor)', disp.nCore === 5, 'got ' + disp.nCore);
  T('E3 checklist renders the mystery "☆ ?" slot', disp.mystery);
  T('E4 the ☆ label does NOT leak before it is earned', !disp.leak);

  const ax = await page.evaluate(() => {
    const s = { site: new Set(), div: new Set(), n: new Set(), perm: new Set(), fmt: new Set() };
    for (let i = 0; i < 40; i++) { loadChallenge('margin'); const S3 = CHALLENGES.margin._sites;
      s.site.add(S3.map(x => x.m).join()); s.div.add(S3[0].div); s.n.add(S3[0].n);
      s.perm.add(S3.map(x => x.ask).join()); S3.forEach(x => s.fmt.add(x.fmt)); }
    return { site: s.site.size, div: s.div.size, n: s.n.size, perm: s.perm.size, fmt: s.fmt.size };
  });
  T('F1 axis (a) 4-slot site shuffle varies', ax.site > 1);
  T('F2 axis (b) division pool + row count vary', ax.div > 1 && ax.n > 1);
  T('F3 axis (d) the ask permutation varies', ax.perm > 1, ax.perm + ' permutations');
  T('F4 all three formats are exercised (percent + mult)', ax.fmt === 2);
  T('G1 zero page errors', errs.length === 0, errs.join(' | '));

  await browser.close();
  console.log('\n  ' + ok.length + '/' + (ok.length + bad.length) + ' checks pass');
  process.exit(bad.length ? 1 : 0);
})();
