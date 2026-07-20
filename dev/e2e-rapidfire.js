/* RAPID-FIRE E2E (r293) — the rebuilt mode runs ON the real grid: every task stages
   its pre-state into actual sheet cells and every solve writes the post-state back.
   This suite drives a full shuffle-bag cycle (all ops) through the real dispatcher
   with synthesized KeyboardEvents and asserts:
     - the strip + grid + formula bar are all visible (no synthetic card)
     - each task's target cell IS the engine's active cell (nameBox agrees)
     - every op's primary path solves (rfBusy flips, hits increment, no misses)
     - exiting the session restores a classic drill cleanly
   Run: URL=http://localhost:8791/index.html node dev/e2e-rapidfire.js */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';

let passN = 0, failN = 0;
function check(name, ok, extra) {
  if (ok) { passN++; console.log('  PASS ' + name); }
  else { failN++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1240, height: 800 } });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_handle_cache', '');
    } catch (e) {}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() =>
    typeof startSession === 'function' && typeof loadChallenge === 'function' &&
    typeof RF_OPS !== 'undefined', null, { timeout: 15000 });

  const opCount = await page.evaluate(() => RF_OPS.length);
  await page.evaluate(() => { try { _pro = true; } catch (e) {} startSession('rapidfire', 600); });
  await page.waitForTimeout(250);

  const layout = await page.evaluate(() => ({
    grid: getComputedStyle(document.getElementById('gridwrap')).display !== 'none',
    strip: getComputedStyle(document.getElementById('rapidStage')).display !== 'none',
    fbar: getComputedStyle(document.querySelector('.fbar')).display !== 'none',
    card: !document.querySelector('.rf-card'),
  }));
  check('grid stays visible in rapid-fire', layout.grid);
  check('instruction strip visible', layout.strip);
  check('formula bar visible', layout.fbar);
  check('no synthetic card in the DOM', layout.card);

  // Drive a full bag cycle + change: every op appears once per cycle, so opCount+5
  // rounds guarantees each op solves at least once via its primary path.
  const rounds = opCount + 5;
  const results = [];
  for (let i = 0; i < rounds; i++) {
    const r = await page.evaluate(() => {
      if (!rfTask) return { end: true };
      const op = rfTask.op, t = rfTask.cell;
      const active = document.querySelector('#grid td.active');
      const activeOk = !!(active && +active.dataset.r === t.r && +active.dataset.c === t.c);
      const nameOk = document.getElementById('nameBox').textContent === rfTask.cellLabel;
      const fire = (key, mods) => {
        const e = new KeyboardEvent('keydown', Object.assign({ key, bubbles: true, cancelable: true }, mods || {}));
        document.dispatchEvent(e); window.dispatchEvent(e);
      };
      if (rfTask.def.matchSeq) {
        fire('Alt', { altKey: true });
        for (const k of rfTask.keys.slice(1)) {
          const low = String(k).toLowerCase();
          if (low.startsWith('→')) { const n = parseInt(low.split('×')[1] || '1', 10); for (let j = 0; j < n; j++) fire('ArrowRight'); continue; }
          if (low === '↵') { fire('Enter'); continue; }
          fire(low);
        }
      } else {
        const k = rfTask.keys;
        const mods = { ctrlKey: k.includes('Ctrl'), shiftKey: k.includes('Shift'), altKey: k.includes('Alt') };
        let main = k[k.length - 1];
        if (main === 'Del') main = 'Delete';
        fire(main, mods);
      }
      return { op, activeOk, nameOk, solved: rfBusy === true };
    });
    if (r.end) break;
    results.push(r);
    await page.waitForTimeout(330);
  }
  const unsolved = [...new Set(results.filter(x => !x.solved).map(x => x.op))];
  const badActive = [...new Set(results.filter(x => !x.activeOk).map(x => x.op))];
  const badName = [...new Set(results.filter(x => !x.nameOk).map(x => x.op))];
  check('every op solves via its primary path (' + results.length + ' rounds over ' + opCount + ' ops)', unsolved.length === 0, 'unsolved: ' + unsolved.join(','));
  check('target cell is the engine active cell, every round', badActive.length === 0, badActive.join(','));
  check('nameBox mirrors the task ref, every round', badName.length === 0, badName.join(','));

  const hud = await page.evaluate(() => ({ hits: marathon && marathon.hits, misses: marathon && marathon.misses }));
  check('HUD hits == rounds', hud.hits === results.length, hud.hits + ' vs ' + results.length);
  check('zero misses from primary paths', hud.misses === 0, String(hud.misses));

  // exit → classic restores
  const after = await page.evaluate(() => {
    exitSession();
    return {
      classic: gameMode === 'classic',
      bodyClean: !document.body.classList.contains('rapidfire') && !document.body.classList.contains('session'),
      drillLoaded: typeof cur === 'string' && !!CHALLENGES[cur],
      gridHasContent: Object.keys(S.cells).length > 0,
    };
  });
  check('exitSession returns to classic', after.classic && after.bodyClean);
  check('a classic drill reloads with content', after.drillLoaded && after.gridHasContent);


  check('zero page errors through the suite', pageErrors.length === 0, pageErrors.join(' | '));
  await browser.close();
  console.log(failN === 0 ? 'RAPIDFIRE: ALL ' + passN + ' PASS' : 'RAPIDFIRE: ' + failN + ' FAIL / ' + passN + ' pass');
  process.exit(failN === 0 ? 0 : 1);
})();
