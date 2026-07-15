/* NUMBER-FORMAT DEPTH E2E (r233) — Ctrl+1 accounting + scale (thousands/millions).
   Asserts the fmtNum output, the dialog apply, General clearing scale, and that
   scale/style travel with a formats paste. Uses the app's synthetic dispatcher. */
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
  await page.waitForFunction(() => typeof CHALLENGES!=='undefined' && typeof loadChallenge==='function' && typeof demoKey==='function' && typeof fmtNum==='function', null, {timeout:15000});
  await page.evaluate(() => { try{ _pro=true; }catch(e){} });

  let fails=0;
  const chk=(name,cond,got)=>{ if(cond)console.log('PASS',name); else {console.log('FAIL',name,JSON.stringify(got)); fails++;} };

  // 1) Pure fmtNum semantics
  const fn = await page.evaluate(() => ({
    acctPos:  fmtNum(1234.5,'acct',0,0),
    acctNeg:  fmtNum(-1234,'acct',0,0),
    acctZero: fmtNum(0,'acct',0,0),
    thou:     fmtNum(5000000,'comma',0,3),      // 5,000
    mill:     fmtNum(5000000,'currency',1,6),   // $5.0
    acctMill: fmtNum(2500000,'acct',1,6),       // $ 2.5
    plainScale: fmtNum(12000,'general',0,3),    // 12
  }));
  chk('acct positive spaces $', fn.acctPos==='$ 1,235' || fn.acctPos==='$ 1,234' , fn);   // rounding at 0 dec
  chk('acct negative parens', fn.acctNeg==='$ (1,234)', fn);
  chk('acct zero dash', /-/.test(fn.acctZero) && fn.acctZero.indexOf('$')===0, fn);
  chk('scale thousands', fn.thou==='5,000', fn);
  chk('scale millions currency', fn.mill==='$5.0', fn);
  chk('acct + millions', fn.acctMill==='$ 2.5', fn);
  chk('general + scale', fn.plainScale==='12', fn);

  // 2) The taught paths — accounting via the RIBBON (Alt H A N, Excel's real keytip),
  //    scale via Ctrl+1 (a custom number format, the legit dialog use).
  //    `steps` = array of {via:'ribbon'|'ctrl1', keys:[...]} runs against a fresh 4.2M cell.
  const run = (steps) => page.evaluate((steps) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n=>n.remove());
    loadChallenge('modeltour');
    S.cells={}; const K=ck(1,1);
    S.cells[K]=Object.assign(blankCell(),{value:4200000});
    S.active={r:1,c:1}; S.sel=null; render();
    for(const st of steps){
      if(st.via==='ribbon'){ demoKey({key:'Alt'}); for(const ch of st.keys) demoKey(L(ch)); }
      else { demoKey({key:'1',ctrl:true,code:'Digit1'}); for(const ch of st.keys) demoKey(L(ch)); }
    }
    const c=S.cells[K]||{};
    return { fmtStyle:c.fmtStyle, scale:c.scale|0 };
  }, steps);
  let r = await run([{via:'ribbon',keys:['h','a','n']}]);   chk('Alt H A N → acct (ribbon)', r.fmtStyle==='acct' && r.scale===0, r);
  r = await run([{via:'ctrl1',keys:['s']}]);                 chk('Ctrl+1 S → scale 3', r.scale===3, r);
  r = await run([{via:'ctrl1',keys:['m']}]);                 chk('Ctrl+1 M → scale 6', r.scale===6, r);
  r = await run([{via:'ribbon',keys:['h','a','n']},{via:'ctrl1',keys:['m']}]);
                                                             chk('ribbon acct + Ctrl+1 millions compose', r.fmtStyle==='acct' && r.scale===6, r);
  r = await run([{via:'ctrl1',keys:['m']},{via:'ctrl1',keys:['g']}]);
                                                             chk('Ctrl+1 General clears scale', r.fmtStyle==='general' && r.scale===0, r);

  // 3) scale travels with a formats-paste
  const paste = await page.evaluate(() => {
    loadChallenge('modeltour');
    S.cells={}; const src=ck(1,1), dst=ck(3,1);
    S.cells[src]=Object.assign(blankCell(),{value:9000000, fmtStyle:'acct', scale:6});
    S.cells[dst]=Object.assign(blankCell(),{value:12});
    S.active={r:1,c:1}; S.sel=null; render();
    copySel();
    S.active={r:3,c:1}; S.sel=null;
    demoKey({key:'Alt'}); demoKey(L('h')); demoKey(L('v')); demoKey(L('s'));
    demoKey(L('t')); demoKey({key:'Enter'});   // Formats
    const c=S.cells[dst]||{};
    return { fmtStyle:c.fmtStyle, scale:c.scale|0, value:c.value };
  });
  chk('scale+acct travel on formats-paste, value untouched', paste.fmtStyle==='acct' && paste.scale===6 && paste.value===12, paste);

  chk('no page errors', errs.length===0, errs);
  console.log(fails===0 ? 'NUMFMT: ALL PASS' : ('NUMFMT: '+fails+' FAIL'));
  await browser.close();
  process.exit(fails===0?0:1);
})();
