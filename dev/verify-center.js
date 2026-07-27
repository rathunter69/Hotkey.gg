/* VERIFY-CENTER (r429, DEPTH_PASS §4.13) — the drill-specific mechanics probe.
   Proves what the generic suites cannot: the CLASS-SWEEP ☆ earns on one sweep and is
   FORFEITED by a body-then-total two-pass (§1.0-R2(i) skippability), the board ships
   MISALIGNED so beat 3 is real work (Wolf's blocksel round-2 law), the mystery-slot
   display contract, and the §1.2 axes.
     node dev/verify-center.js            # needs a server on 8791 */
const { chromium } = require('playwright-core');
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
(async()=>{
 const b=await chromium.launch({executablePath:EXE,headless:true});
 const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e.message).slice(0,120)));
 await p.addInitScript(()=>{try{localStorage.setItem('hotkey_onboarded','1');localStorage.setItem('hk_tour_done','1');localStorage.setItem('hk_learn_done','1');localStorage.setItem('hk_handle_cache','');}catch(e){}});
 await p.goto('http://127.0.0.1:8791/index.html',{waitUntil:'load'});
 await p.waitForFunction(()=>typeof CHALLENGES!=='undefined'&&typeof loadChallenge==='function'&&typeof demoKey==='function',null,{timeout:15000});
 await p.evaluate(()=>{try{_pro=true;}catch(e){}});
 const reset=()=>p.evaluate(()=>{try{window.__hkCelQ=[];}catch(e){} document.querySelectorAll('.hk-cel-wrap').forEach(n=>{try{n.click();}catch(e){}n.remove();}); try{window.__hkCelOpen=false;}catch(e){} document.querySelectorAll('.wb-dlg').forEach(n=>n.remove()); loadChallenge('center');});
 const R=[];
 await reset();
 R.push(['A demo earns ☆ + all cores', await p.evaluate(()=>{const C=CHALLENGES.center;
   for(const mv of C.demo.call(C)){setDemoSel(mv.sel); for(const k of mv.keys) demoKey(k);}
   const r=C.checks(S); return {core:r.filter(c=>!c.bonus).every(c=>c.ok||c.label==='Save your work'), star:!!r.find(c=>c.bonus).ok};})]);
 // NEGATIVE CONTROL: body then total, two passes
 await reset();
 R.push(['B two-pass forfeits ☆, cores clear', await p.evaluate(()=>{const C=CHALLENGES.center,o=C._o;
   setDemoSel(o.hdr); [Kb.alt,L('H'),L('A'),L('C')].forEach(demoKey);
   setDemoSel(o.lab); [Kb.alt,L('H'),L('A'),L('L')].forEach(demoKey);
   setDemoSel('B'+o.r1+':'+o.lc+(o.rt-1)); [Kb.alt,L('H'),L('A'),L('R')].forEach(demoKey);   // body only
   setDemoSel('B'+o.rt+':'+o.lc+o.rt); [Kb.alt,L('H'),L('A'),L('R')].forEach(demoKey);       // total separately
   setDemoSel('A'+o.rt+':'+o.lc+o.rt); demoKey(Kb.bold);
   setDemoSel('A'+o.hr+':'+o.lc+o.hr); [Kb.alt,L('H'),L('B'),L('O')].forEach(demoKey);
   setDemoSel('A1:'+o.lc+'1'); demoKey({key:'1',ctrl:true}); demoKey(L('A'));
   demoKey({key:'s',ctrl:true});
   const r=C.checks(S); return {core:r.filter(c=>!c.bonus).every(c=>c.ok), star:!!r.find(c=>c.bonus).ok,
     failed:r.filter(c=>!c.bonus&&!c.ok).map(c=>c.label)};})]);
 // board ships misaligned
 await reset();
 R.push(['C board ships MISALIGNED (beat 3 is real work)', await p.evaluate(()=>{const C=CHALLENGES.center,o=C._o;
   const bad=[]; for(let r=o.r1;r<=o.rt;r++) for(let c=2;c<=o.lastC;c++){const cc=S.cells[colLetter(c)+r]; if(cc.align==='r') bad.push(colLetter(c)+r);} 
   return {alreadyRight:bad.length, labelClass:S.cells['A'+o.rt].align};})]);
 await reset();
 R.push(['D mystery slot renders, no label leak', await p.evaluate(()=>{const C=CHALLENGES.center,r=C.checks(S);
   const t=document.getElementById('checklist').textContent;
   return {mystery:/☆\s*\?/.test(t), leak:/one sweep/.test(t), nCore:r.filter(c=>!c.bonus).length};})]);
 const ax=await p.evaluate(()=>{const s={hr:new Set(),nq:new Set(),nd:new Set(),lab:new Set(),nm:new Set()};
   for(let i=0;i<40;i++){loadChallenge('center');const o=CHALLENGES.center._o;
     s.hr.add(o.hr);s.nq.add(o.nq);s.nd.add(o.nd);s.lab.add(S.cells['A'+o.rt].align);s.nm.add(S.cells['A'+o.r1].value);}
   return {hr:s.hr.size,nq:s.nq.size,nd:s.nd.size,lab:s.lab.size,nm:s.nm.size};});
 R.push(['E axes', ax]);
 await b.close();
 const fails=[];
 const chk=(n,c)=>{ console.log((c?'  PASS  ':'  FAIL  ')+n); if(!c) fails.push(n); };
 const M=Object.fromEntries(R);
 console.log('\nVERIFY-CENTER (r429)');
 chk('A1 demo clears every core beat', M['A demo earns ☆ + all cores'].core);
 chk('A2 demo EARNS the class-sweep ☆', M['A demo earns ☆ + all cores'].star);
 chk('B1 body-then-total (two passes) clears every core beat (§1.0(c) freedom)', M['B two-pass forfeits ☆, cores clear'].core);
 chk('B2 body-then-total does NOT earn the ☆ (§1.0-R2(i) skippable)', !M['B two-pass forfeits ☆, cores clear'].star);
 chk('C1 board ships MISALIGNED — zero figures pre-right-aligned', M['C board ships MISALIGNED (beat 3 is real work)'].alreadyRight===0);
 chk('C2 the Total label ships in a WRONG class (real work for beat 2)', ['c','r'].includes(M['C board ships MISALIGNED (beat 3 is real work)'].labelClass));
 chk('D1 checklist renders the mystery "☆ ?" slot', M['D mystery slot renders, no label leak'].mystery);
 chk('D2 the ☆ label does NOT leak before it is earned', !M['D mystery slot renders, no label leak'].leak);
 chk('D3 6 authored core beats + the engine save closer (§1.1 4–6)', M['D mystery slot renders, no label leak'].nCore===7);
 chk('E1 axis (a) header-row site varies', M['E axes'].hr>1);
 chk('E2 axis (c) table shape varies (quarters × deals)', M['E axes'].nq>1 && M['E axes'].nd>1);
 chk('E3 axis (d) the wrong label class varies', M['E axes'].lab>1);
 chk('E4 axis (b) deal-name pool varies', M['E axes'].nm>1);
 chk('F1 zero page errors', errs.length===0);
 console.log('\n  '+(14-fails.length)+'/14 checks pass');
 process.exit(fails.length?1:0);
})();
