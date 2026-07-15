/* CLEAR-MENU E2E (r232) — drives Alt H E {A/F/C} through the REAL engine and
   asserts Excel-faithful semantics: A wipes all, F strips formats keeps content,
   C empties content keeps formats. Also confirms Esc-safety mid-path.
   Uses the app's own synthetic dispatcher (demoKey): {key:'Alt'} toggles the
   ribbon, then plain letters walk it — same model as e2e-alt-paths. */
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

  // Seed a fully-dressed cell at A1, then walk `walk` (array of tokens), return the cell state.
  // Tokens: 'Alt' | 'Esc' | single letter (→ L(ch) so e.code is set) — same shape the app reads.
  const run = (walk) => page.evaluate((walk) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n=>n.remove());
    loadChallenge('modeltour');
    S.cells = {};
    const K = ck(1,1);
    S.cells[K] = Object.assign(blankCell(), {value:1234, bold:true, fill:'blue', fmtStyle:'comma', decimals:2, ball:true, align:'r', uline:true, fontColor:'blue'});
    S.active = {r:1,c:1}; S.sel=null; render();
    const spec = t => t==='Alt' ? {key:'Alt'} : t==='Esc' ? {key:'Escape'} : L(t);
    for(const t of walk) demoKey(spec(t));
    const c=S.cells[K]||{};
    return { value:c.value, formula:c.formula||null, bold:!!c.bold, fill:c.fill||null,
      fmtStyle:c.fmtStyle||'general', decimals:c.decimals|0, ball:!!c.ball, align:c.align||null,
      uline:!!c.uline, fontColor:c.fontColor||null, dialogOpen:(typeof dialog!=='undefined'&&!!dialog) };
  }, walk);

  let fails=0;
  const chk=(name,cond,got)=>{ if(cond)console.log('PASS',name); else {console.log('FAIL',name,JSON.stringify(got)); fails++;} };

  // Clear Formats — Alt H E F : keep value, strip every format
  let c = await run(['Alt','h','e','f']);
  chk('HEF keeps value', c.value===1234, c);
  chk('HEF strips bold', c.bold===false, c);
  chk('HEF strips fill', c.fill===null, c);
  chk('HEF strips fmt', c.fmtStyle==='general' && c.decimals===0, c);
  chk('HEF strips border', c.ball===false, c);
  chk('HEF strips align/uline/color', c.align===null && c.uline===false && c.fontColor===null, c);

  // Clear Contents — Alt H E C : null value, keep formats
  c = await run(['Alt','h','e','c']);
  chk('HEC empties value', c.value===null, c);
  chk('HEC keeps bold', c.bold===true, c);
  chk('HEC keeps fill', c.fill==='blue', c);
  chk('HEC keeps border', c.ball===true, c);

  // Clear All — Alt H E A : everything blank
  c = await run(['Alt','h','e','a']);
  chk('HEA blanks value', c.value===null, c);
  chk('HEA blanks bold', c.bold===false, c);
  chk('HEA blanks fill', c.fill===null, c);
  chk('HEA blanks border', c.ball===false, c);

  // Esc-safety — Alt H E then Esc leaves the cell untouched
  c = await run(['Alt','h','e','Esc']);
  chk('Esc after HE leaves cell intact', c.value===1234 && c.bold===true && c.fill==='blue' && c.ball===true && !c.dialogOpen, c);

  // Indent — Alt H 6 raises, Alt H 5 lowers; floors at 0, and the format travels with a formats-paste.
  const indentOf = (walk) => page.evaluate((walk) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n=>n.remove());
    loadChallenge('modeltour');
    S.cells={}; const K=ck(1,1);
    S.cells[K]=Object.assign(blankCell(),{value:'Segment'});
    S.active={r:1,c:1}; S.sel=null; render();
    const spec = t => t==='Alt'?{key:'Alt'}:t==='Esc'?{key:'Escape'}:/^[0-9]$/.test(t)?D(+t):L(t);
    for(const t of walk) demoKey(spec(t));
    return (S.cells[K]||{}).indent|0;
  }, walk);
  chk('Alt H 6 indents to 1', await indentOf(['Alt','h','6'])===1);
  chk('Alt H 6 x3 = 3',       await indentOf(['Alt','h','6','Alt','h','6','Alt','h','6'])===3);
  chk('Alt H 5 floors at 0',  await indentOf(['Alt','h','5'])===0);
  chk('6 then 5 = 0',         await indentOf(['Alt','h','6','Alt','h','5'])===0);

  // Indent survives a formats-only paste (Alt H V S T ↵ after copy)
  const pasteIndent = await page.evaluate(() => {
    loadChallenge('modeltour');
    S.cells={}; const src=ck(1,1), dst=ck(3,1);
    S.cells[src]=Object.assign(blankCell(),{value:'A', indent:2});
    S.cells[dst]=Object.assign(blankCell(),{value:'B'});
    S.active={r:1,c:1}; S.sel=null; render();
    copySel();
    S.active={r:3,c:1}; S.sel=null;
    demoKey({key:'Alt'}); demoKey(L('h')); demoKey(L('v')); demoKey(L('s'));
    demoKey(L('t')); demoKey({key:'Enter'});   // Formats
    return (S.cells[dst]||{}).indent|0;
  });
  chk('indent travels with formats-paste', pasteIndent===2, {pasteIndent});

  chk('no page errors', errs.length===0, errs);
  console.log(fails===0 ? 'CLEAR_MENU: ALL PASS' : ('CLEAR_MENU: '+fails+' FAIL'));
  await browser.close();
  process.exit(fails===0?0:1);
})();
