/* SCRATCH probe rig for the r439 Formulas II depth pass (stalelink / signerr / versionup).
   Not a gate suite; deleted before the final commit if it survives review.
   Usage: node dev/probe-a1.js <file-with-probe-source>
   The file exports page-side source: an array of {name, key, moves(C)} plus optional seeds. */
'use strict';
const { chromium } = require('playwright-core');
const fs = require('fs');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SRC = fs.readFileSync(process.argv[2], 'utf8');
const SEEDS = (process.env.SEEDS || '11,23,37,51,64').split(',').map(Number);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded','1'); localStorage.setItem('hk_tour_done','1');
    localStorage.setItem('hk_learn_done','1'); localStorage.setItem('hk_beta_ok','1');
    localStorage.setItem('hk_xlv','2');
  } catch(e){} });
  await page.goto(process.env.URL || 'http://127.0.0.1:8921/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch(e){} });
  page.on('console', m => { if (m.type() === 'error') console.log('  [console] ' + m.text().slice(0,160)); });

  const probes = await page.evaluate((src) => { window.__PROBES = eval(src); return window.__PROBES.map(p => p.name); }, SRC);

  for (let i = 0; i < probes.length; i++) {
    const out = [];
    for (const seed of SEEDS) {
      const r = await page.evaluate(({ i, seed }) => {
        try {
          document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
          const P = window.__PROBES[i];
          window.__forceSeed = seed;
          loadChallenge(P.key);
          const C = CHALLENGES[P.key];
          const moves = P.moves(C);
          let sent = 0;
          for (const mv of moves) { if (mv.sel) setDemoSel(mv.sel); for (const kk of mv.keys) { demoKey(kk); sent++; } }
          const items = C.checks(S) || [];
          return { keys: sent, logged: keyLog.length, won: done,
                   states: items.map(x => (x.bonus ? '*' : '') + (x.ok ? 'Y' : 'n')).join(''),
                   labels: items.map(x => x.label) };
        } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
      }, { i, seed });
      out.push(r);
    }
    const ks = out.filter(r => !r.err).map(r => r.keys).sort((a,b)=>a-b);
    const med = ks.length ? ks[Math.floor(ks.length/2)] : null;
    console.log('\n### ' + probes[i]);
    console.log('  keys: ' + JSON.stringify(out.map(r=>r.err?('ERR '+r.err):r.keys)) + '   median ' + med
              + '   (logged ' + JSON.stringify(out.map(r=>r.err?'-':r.logged)) + ')');
    console.log('  won:  ' + JSON.stringify(out.map(r=>r.err?'-':r.won)));
    console.log('  chk:  ' + JSON.stringify(out.map(r=>r.err?'-':r.states)));
    if (out[0] && out[0].labels) out[0].labels.forEach((l,j)=>console.log('     ['+j+'] '+l));
    out.filter(r=>r.err).slice(0,1).forEach(r=>console.log('  ERR ' + r.err));
  }
  await browser.close();
  process.exit(0);
})();
