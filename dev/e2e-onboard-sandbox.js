/* ONBOARDING SANDBOX + DEFAULT THEME E2E (r238) — verifies the warm-up sandbox is a
   free-play scratch sheet (no clock, no win), the Ready button lands a clean first drill,
   and a clean login defaults to Daylight regardless of OS mode. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true, colorScheme: 'dark' });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)));
  // NOTE: do NOT preset hotkey_theme — we want to prove the clean-login default.
  await page.addInitScript(() => {
    try { localStorage.setItem('hotkey_onboarded','1'); localStorage.setItem('hk_tour_done','1'); } catch(e){}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES!=='undefined' && typeof startSandbox==='function' && typeof loadChallenge==='function', null, {timeout:15000});

  let fails=0;
  const chk=(name,cond,got)=>{ if(cond)console.log('PASS',name); else {console.log('FAIL',name,JSON.stringify(got)); fails++;} };

  // 1) Clean-login default theme = Daylight even with OS dark-mode
  const theme = await page.evaluate(async () => { try{ await loadTheme(); }catch(e){} return { cur: currentTheme, dark: document.documentElement.getAttribute('data-dark') }; });
  chk('clean login defaults to Daylight', theme.cur==='daylight' && theme.dark==='0', theme);

  // 2) Enter the sandbox — free play, no clock, no grade
  const sb = await page.evaluate(() => {
    startSandbox();
    return { sandboxMode, running, done, cur, hasGrid: !!(S && S.cells && S.cells[ck(3,1)]), timer: (document.getElementById('timer')||{}).textContent };
  });
  chk('sandbox entered', sb.sandboxMode===true && sb.cur==='__sandbox__', sb);
  chk('sandbox has practice grid', sb.hasGrid, sb);
  chk('sandbox timer shows dash', sb.timer==='—', sb);

  // 3) Movement in the sandbox does NOT start the clock or ever win
  const play = await page.evaluate(() => {
    // ctrl+right, shift+right, ctrl+shift+right, then hammer a few more
    demoKey({key:'ArrowRight',ctrl:true}); demoKey({key:'ArrowRight',shift:true});
    demoKey({key:'ArrowDown',ctrl:true,shift:true}); demoKey({key:'ArrowRight'});
    return { running, done, sandboxMode, resultsShown: (document.querySelector('.results-modal.show, #resultsModal.show')!=null) };
  });
  chk('no clock started in sandbox', play.running===false, play);
  chk('never wins in sandbox', play.done===false, play);
  chk('no results card in sandbox', play.resultsShown===false, play);

  // 4) Ready → clean, untouched first drill; sandbox mode cleared
  const done = await page.evaluate(() => {
    exitSandbox();
    return { sandboxMode, cur, first: MENU_ORDER[0], done, running };
  });
  chk('Ready exits sandbox to level-1 starter', done.sandboxMode===false && done.cur===done.first, done);
  chk('first drill loads clean (not done/running)', done.done===false && done.running===false, done);

  // 5) leaving the sandbox via a normal drill load also clears the flag
  const esc = await page.evaluate(() => { startSandbox(); loadChallenge('navigation'); return { sandboxMode, cur }; });
  chk('picker/drill load clears sandbox', esc.sandboxMode===false && esc.cur==='navigation', esc);

  chk('no page errors', errs.length===0, errs);
  console.log(fails===0 ? 'ONBOARD_SANDBOX: ALL PASS' : ('ONBOARD_SANDBOX: '+fails+' FAIL'));
  await browser.close();
  process.exit(fails===0?0:1);
})();
