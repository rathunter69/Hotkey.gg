/* FIND & REPLACE E2E (r236) — Ctrl+H, type Find, Tab, type Replace, Enter.
   Replaces literal occurrences in string cells; scope = selection when >1 cell,
   else the whole sheet. Esc cancels; empty find is a no-op. */
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

  // Seed a sheet, run Ctrl+H with find/replace strings and an optional selection, return cell texts.
  const run = (opts) => page.evaluate((opts) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n=>n.remove());
    loadChallenge('modeltour');
    S.cells={};
    S.cells[ck(1,1)]=Object.assign(blankCell(),{value:'Draft revenue'});
    S.cells[ck(2,1)]=Object.assign(blankCell(),{value:'Draft EBITDA'});
    S.cells[ck(3,1)]=Object.assign(blankCell(),{value:'Final margin'});
    S.cells[ck(4,1)]=Object.assign(blankCell(),{value:1234});   // number — untouched
    if(opts.sel){ setDemoSel(opts.sel); } else { S.active={r:1,c:1}; S.sel=null; render(); }
    demoKey({key:'h',ctrl:true,code:'KeyH'});           // Ctrl+H
    const typ=s=>{ for(const ch of s) demoKey({key:ch}); };
    typ(opts.find);
    if(opts.replace!==undefined){ demoKey({key:'Tab'}); typ(opts.replace); }
    if(opts.esc){ demoKey({key:'Escape'}); } else { demoKey({key:'Enter'}); }
    const g=(r)=>{ const c=S.cells[ck(r,1)]||{}; return c.value; };
    return { a1:g(1), a2:g(2), a3:g(3), a4:g(4), dialogOpen:(typeof dialog!=='undefined'&&!!dialog) };
  }, opts);

  // Replace "Draft" → "FY24" across the whole sheet (single active cell = whole-sheet scope)
  let r = await run({find:'Draft', replace:'FY24'});
  chk('whole-sheet: A1 replaced', r.a1==='FY24 revenue', r);
  chk('whole-sheet: A2 replaced', r.a2==='FY24 EBITDA', r);
  chk('whole-sheet: A3 untouched (no match)', r.a3==='Final margin', r);
  chk('number cell untouched', r.a4===1234, r);
  chk('dialog closed after replace', !r.dialogOpen, r);

  // Scope to a selection A1:A2 — A2 is "Draft EBITDA", A1 "Draft revenue"; replace only within A3:A3 shouldn't touch A1
  r = await run({find:'Draft', replace:'X', sel:'A2:A2'});   // single-cell sel still whole-sheet per Excel; use a real multi range next
  // multi-cell selection scopes: select A3:A4 (no "Draft") → nothing changes
  r = await run({find:'Draft', replace:'ZZ', sel:'A3:A4'});
  chk('selection scope excludes A1/A2', r.a1==='Draft revenue' && r.a2==='Draft EBITDA', r);

  // multi-cell selection that DOES contain matches: A1:A2
  r = await run({find:'Draft', replace:'Q1', sel:'A1:A2'});
  chk('selection scope A1:A2 replaces both', r.a1==='Q1 revenue' && r.a2==='Q1 EBITDA', r);

  // no match → unchanged
  r = await run({find:'zzz', replace:'q'});
  chk('no match leaves all intact', r.a1==='Draft revenue' && r.a2==='Draft EBITDA', r);

  // Esc cancels — nothing changes
  r = await run({find:'Draft', replace:'X', esc:true});
  chk('Esc cancels, no change', r.a1==='Draft revenue' && !r.dialogOpen, r);

  // empty find → no-op
  r = await run({find:'', replace:'x'});
  chk('empty find is a no-op', r.a1==='Draft revenue', r);

  chk('no page errors', errs.length===0, errs);
  console.log(fails===0 ? 'FINDREPLACE: ALL PASS' : ('FINDREPLACE: '+fails+' FAIL'));
  await browser.close();
  process.exit(fails===0?0:1);
})();
