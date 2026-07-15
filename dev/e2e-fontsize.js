/* FONT-SIZE E2E (r235) — Alt H F G (grow) / Alt H F K (shrink). Steps the ladder
   [10, 11.5, 13.5(base→null), 16, 18, 20], clamps at both ends, base normalizes
   to null, and the size travels with a formats-paste. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => {
    try { localStorage.setItem('hotkey_onboarded','1'); localStorage.setItem('hk_tour_done','1');
      localStorage.setItem('hk_learn_done','1'); localStorage.setItem('hk_handle_cache',''); } catch(e){}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES!=='undefined' && typeof loadChallenge==='function' && typeof demoKey==='function', null, {timeout:15000});
  await page.evaluate(() => { try{ _pro=true; }catch(e){} });

  let fails=0;
  const chk=(name,cond,got)=>{ if(cond)console.log('PASS',name); else {console.log('FAIL',name,JSON.stringify(got)); fails++;} };

  // walk = number of grows (positive) or shrinks (negative) via repeated Alt H F G/K
  const size = (grows, shrinks) => page.evaluate(({grows,shrinks}) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n=>n.remove());
    loadChallenge('modeltour');
    S.cells={}; const K=ck(1,1);
    S.cells[K]=Object.assign(blankCell(),{value:'Title'});
    S.active={r:1,c:1}; S.sel=null; render();
    for(let i=0;i<grows;i++){ demoKey({key:'Alt'}); [L('h'),L('f'),L('g')].forEach(demoKey); }
    for(let i=0;i<shrinks;i++){ demoKey({key:'Alt'}); [L('h'),L('f'),L('k')].forEach(demoKey); }
    const c=S.cells[K]||{};
    // also confirm it lands in the rendered inline style
    const td=document.querySelector('td[data-r="1"][data-c="1"]');
    const inline = td ? (td.getAttribute('style')||'') : '';
    return { fsz:c.fsz===undefined?'undef':c.fsz, styled: /font-size:/.test(inline) };
  }, {grows,shrinks});

  let r = await size(1,0);  chk('grow ×1 → 16', r.fsz===16 && r.styled, r);
  r = await size(3,0);      chk('grow ×3 → 20 (cap)', r.fsz===20, r);
  r = await size(9,0);      chk('grow clamps at 20', r.fsz===20, r);
  r = await size(0,1);      chk('shrink ×1 → 11.5', r.fsz===11.5 && r.styled, r);
  r = await size(0,9);      chk('shrink clamps at 10', r.fsz===10, r);
  r = await size(1,1);      chk('grow then shrink → base(null)', r.fsz===null && !r.styled, r);

  // travels with a formats-paste
  const paste = await page.evaluate(() => {
    loadChallenge('modeltour');
    S.cells={}; const src=ck(1,1), dst=ck(3,1);
    S.cells[src]=Object.assign(blankCell(),{value:'A', fsz:18});
    S.cells[dst]=Object.assign(blankCell(),{value:'B'});
    S.active={r:1,c:1}; S.sel=null; render(); copySel();
    S.active={r:3,c:1}; S.sel=null;
    demoKey({key:'Alt'}); [L('h'),L('v'),L('s'),L('t')].forEach(demoKey); demoKey({key:'Enter'});
    const c=S.cells[dst]||{}; return { fsz:c.fsz, value:c.value };
  });
  chk('fsz travels on formats-paste', paste.fsz===18 && paste.value==='B', paste);

  chk('no page errors', errs.length===0, errs);
  console.log(fails===0 ? 'FONTSIZE: ALL PASS' : ('FONTSIZE: '+fails+' FAIL'));
  await browser.close();
  process.exit(fails===0?0:1);
})();
