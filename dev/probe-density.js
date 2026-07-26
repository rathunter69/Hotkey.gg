/* §1.3 win-state density: rows carrying content or scripted purpose, out of the painted 20. */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true });
  const p = await b.newPage();
  await p.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded','1'); localStorage.setItem('hk_tour_done','1');
    localStorage.setItem('hk_learn_done','1'); localStorage.setItem('hk_beta_ok','1');
    localStorage.setItem('hk_xlv','2'); } catch(e){} });
  await p.goto(process.env.URL || 'http://127.0.0.1:8921/index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await p.evaluate(() => { try { _pro = true; } catch(e){} });
  for (const k of (process.argv.slice(2).length ? process.argv.slice(2) : ['stalelink','signerr','versionup'])) {
    const r = await p.evaluate((k) => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge(k);
      const C = CHALLENGES[k];
      const cnt = () => { const rows = new Set();
        for (const key in S.cells) { const c = S.cells[key];
          if (c && ((c.value !== null && c.value !== undefined && c.value !== '') || c.formula)) rows.add(+key.replace(/[^0-9]/g,'')); }
        return rows.size; };
      const load = cnt();
      const mv = (typeof C.demo === 'function') ? C.demo.call(C) : C.demo;
      for (const m of mv) { setDemoSel(m.sel); for (const kk of m.keys) demoKey(kk); }
      return { ROWS: S.ROWS, load, win: cnt(), won: done };
    }, k);
    console.log(k.padEnd(11), 'ROWS=' + r.ROWS, 'load ' + r.load + '/' + r.ROWS,
      'WIN ' + r.win + '/' + r.ROWS + ' = ' + Math.round(100 * r.win / r.ROWS) + '%', 'won=' + r.won);
  }
  await b.close(); process.exit(0);
})();
