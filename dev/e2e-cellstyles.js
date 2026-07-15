/* CELL STYLES E2E (r237) — Alt H J gallery. Arrow to a style, Enter applies its
   bundle to the selection. Verifies each style's effect, Normal-resets, multi-cell
   application, and Esc-cancel. */
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

  // Apply the style at index `idx` (arrow rights from Normal=0) to a fresh A1 cell (seeded with `seed`).
  const applyStyle = (idx, seed, esc) => page.evaluate(({idx,seed,esc}) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n=>n.remove());
    loadChallenge('modeltour');
    S.cells={}; const K=ck(1,1);
    S.cells[K]=Object.assign(blankCell(), seed);
    S.active={r:1,c:1}; S.sel=null; render();
    demoKey({key:'Alt'}); demoKey(L('h')); demoKey(L('j'));
    for(let i=0;i<idx;i++) demoKey({key:'ArrowRight'});
    demoKey(esc ? {key:'Escape'} : {key:'Enter'});
    const c=S.cells[K]||{};
    return { bold:!!c.bold, it:!!c.it, fsz:c.fsz, fontColor:c.fontColor||null, bt:!!c.bt, bb:!!c.bb,
      fill:c.fill||null, value:c.value, dialogOpen:(typeof dialog!=='undefined'&&!!dialog) };
  }, {idx,seed,esc});

  // index order: 0 normal · 1 input · 2 link · 3 heading · 4 total · 5 note · 6 warning
  let r = await applyStyle(1, {value:'x'});   chk('Input → blue font', r.fontColor==='blue', r);
  r = await applyStyle(2, {value:'x'});        chk('Link → green font', r.fontColor==='green', r);
  r = await applyStyle(3, {value:'Rev'});      chk('Heading → bold+16+bottom', r.bold && r.fsz===16 && r.bb, r);
  r = await applyStyle(4, {value:9});          chk('Total → bold+top+bottom', r.bold && r.bt && r.bb, r);
  r = await applyStyle(5, {value:'note'});     chk('Note → italic+gray+11.5', r.it && r.fontColor==='gray' && r.fsz===11.5, r);
  r = await applyStyle(6, {value:'!'});        chk('Warning → red+bold', r.fontColor==='red' && r.bold, r);

  // Normal resets a fully-dressed cell but keeps the value
  r = await applyStyle(0, {value:42, bold:true, fill:'blue', fontColor:'red', bt:true, fsz:18, it:true});
  chk('Normal resets formats, keeps value', r.value===42 && !r.bold && !r.fill && r.fontColor===null && !r.bt && (r.fsz==null) && !r.it, r);

  // Esc cancels — dressed cell stays as seeded
  r = await applyStyle(6, {value:'x', bold:false}, true);
  chk('Esc cancels (no red/bold)', r.fontColor===null && !r.bold && !r.dialogOpen, r);

  // multi-cell: Heading applied across A1:A2
  const multi = await page.evaluate(() => {
    loadChallenge('modeltour');
    S.cells={}; S.cells[ck(1,1)]=Object.assign(blankCell(),{value:'H1'}); S.cells[ck(2,1)]=Object.assign(blankCell(),{value:'H2'});
    setDemoSel('A1:A2');
    demoKey({key:'Alt'}); demoKey(L('h')); demoKey(L('j'));
    for(let i=0;i<3;i++) demoKey({key:'ArrowRight'});   // heading
    demoKey({key:'Enter'});
    const a=S.cells[ck(1,1)]||{}, b=S.cells[ck(2,1)]||{};
    return { a:!!(a.bold&&a.fsz===16), b:!!(b.bold&&b.fsz===16) };
  });
  chk('Heading applies to both cells in A1:A2', multi.a && multi.b, multi);

  chk('no page errors', errs.length===0, errs);
  console.log(fails===0 ? 'CELLSTYLES: ALL PASS' : ('CELLSTYLES: '+fails+' FAIL'));
  await browser.close();
  process.exit(fails===0?0:1);
})();
