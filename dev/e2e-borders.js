/* BORDER-DEPTH E2E (r234) — the expanded Alt H B gallery: Left, Right, Inside,
   Thick box, No-border. Drives the ribbon via the app dispatcher and asserts the
   edge flags on the right cells, plus thick-travels-with-paste and clear. */
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

  // Run a ribbon walk over a selection, return a map of {cellKey: {edges}} for the range B2:C3.
  const walk = (sel, keys) => page.evaluate(({sel,keys}) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n=>n.remove());
    loadChallenge('modeltour');
    S.cells={};
    // seed a 2x2 block B2:C3 with values
    [[2,2],[2,3],[3,2],[3,3]].forEach(([r,c])=>{ S.cells[ck(r,c)]=Object.assign(blankCell(),{value:r*10+c}); });
    setDemoSel(sel);
    demoKey({key:'Alt'}); for(const ch of keys) demoKey(L(ch));
    const g=(r,c)=>{ const x=S.cells[ck(r,c)]||{}; return {bt:!!x.bt,bb:!!x.bb,bl:!!x.bl,br:!!x.br,ball:!!x.ball,thick:!!x.thick}; };
    return { b2:g(2,2), c2:g(2,3), b3:g(3,2), c3:g(3,3) };
  }, {sel,keys});

  // Left border on a single cell B2
  let r = await walk('B2', ['h','b','l']);   chk('Alt H B L → left edge', r.b2.bl && !r.b2.br, r.b2);
  r = await walk('B2', ['h','b','r']);        chk('Alt H B R → right edge', r.b2.br && !r.b2.bl, r.b2);

  // Inside borders on B2:C3 — interior only: B2 gets br+bb, C2 gets bb, B3 gets br, C3 nothing
  r = await walk('B2:C3', ['h','b','i']);
  chk('Inside: B2 interior (br+bb)', r.b2.br && r.b2.bb && !r.b2.bt && !r.b2.bl, r.b2);
  chk('Inside: C2 bottom only',      r.c2.bb && !r.c2.br && !r.c2.bt, r.c2);
  chk('Inside: B3 right only',       r.b3.br && !r.b3.bb, r.b3);
  chk('Inside: C3 no edges',         !r.c3.br && !r.c3.bb && !r.c3.bt && !r.c3.bl, r.c3);

  // Thick box on B2:C3 — perimeter thick; corners carry two thick edges
  r = await walk('B2:C3', ['h','b','k']);
  chk('Thick: B2 top+left thick',  r.b2.bt && r.b2.bl && r.b2.thick, r.b2);
  chk('Thick: C3 bottom+right thick', r.c3.bb && r.c3.br && r.c3.thick, r.c3);
  chk('Thick: interior of top-left has no bottom/right', !r.b2.bb && !r.b2.br, r.b2);

  // No border clears everything — start from All(box) then clear
  r = await page.evaluate(() => {
    loadChallenge('modeltour');
    S.cells={}; S.cells[ck(2,2)]=Object.assign(blankCell(),{value:5, ball:true, bt:true, thick:true});
    setDemoSel('B2');
    demoKey({key:'Alt'}); [L('h'),L('b'),L('n')].forEach(demoKey);
    const x=S.cells[ck(2,2)]||{};
    return {bt:!!x.bt,bb:!!x.bb,bl:!!x.bl,br:!!x.br,ball:!!x.ball,thick:!!x.thick,value:x.value};
  });
  chk('No border clears all edges, keeps value', !r.bt&&!r.bb&&!r.bl&&!r.br&&!r.ball&&!r.thick&&r.value===5, r);

  // Thick travels with a formats-paste
  const paste = await page.evaluate(() => {
    loadChallenge('modeltour');
    S.cells={}; const src=ck(2,2), dst=ck(5,2);
    S.cells[src]=Object.assign(blankCell(),{value:1, ball:true, thick:true});
    S.cells[dst]=Object.assign(blankCell(),{value:2});
    setDemoSel('B2'); copySel();
    setDemoSel('B5');
    demoKey({key:'Alt'}); [L('h'),L('v'),L('s'),L('t')].forEach(demoKey); demoKey({key:'Enter'});
    const x=S.cells[dst]||{}; return {ball:!!x.ball, thick:!!x.thick, value:x.value};
  });
  chk('thick+box travel on formats-paste', paste.ball && paste.thick && paste.value===2, paste);

  chk('no page errors', errs.length===0, errs);
  console.log(fails===0 ? 'BORDERS: ALL PASS' : ('BORDERS: '+fails+' FAIL'));
  await browser.close();
  process.exit(fails===0?0:1);
})();
