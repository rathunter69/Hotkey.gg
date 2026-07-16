/* r281 ECHO MODE suite — real (trusted) Playwright keystrokes drive the echo
   walk end-to-end: wrong keys are swallowed with a nudge, right keys advance the
   spotlight, finishing never scores, Esc bails. The driver reads each drill's own
   demo script and performs it, so it exercises whatever the scripts contain. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

// NB: name the SYMBOL, not the base digit — Playwright's 'Shift+5' delivers key '5',
// while 'Control+Shift+%' delivers key '%' with both modifiers (what real browsers give users).
function combo(k) {
  let name = k.key;
  if (name === ' ') name = 'Space';
  const mods = [];
  if (k.ctrl) mods.push('Control');
  if (k.alt) mods.push('Alt');
  if (k.shift) mods.push('Shift');
  return mods.length ? mods.join('+') + '+' + name : name;
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
  } catch (e) {} });
  await page.goto((process.env.URL || 'http://127.0.0.1:8791/index.html'), { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof echoStart === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  const getMoves = (id) => page.evaluate((d) => {
    loadChallenge(d);
    const C = CHALLENGES[d];
    const mv = typeof C.demo === 'function' ? C.demo.call(C) : C.demo;
    return mv.map(m => ({ sel: m.sel, keys: m.keys.map(k => ({ key: k.key, ctrl: !!k.ctrl, alt: !!k.alt, shift: !!k.shift })) }));
  }, id);
  const st = () => page.evaluate(() => ({
    on: echoOn, mi: echoState ? echoState.mi : -1, ki: echoState ? echoState.ki : -1,
    miss: echoState ? echoState.miss : -1,
    spot: (document.getElementById('demoSpot') || { style: {} }).style.display === 'block',
    cap: (document.getElementById('demoSpotCap') || { textContent: '' }).textContent,
    res: (document.getElementById('result') || { textContent: '' }).textContent,
    done: typeof done !== 'undefined' ? done : null, cel: !!window.__hkCelOpen
  }));
  const startEcho = async () => {
    await page.click('#echoBtn');
    await page.evaluate(() => { try { document.activeElement.blur(); } catch (e) {} });  // Enter must not re-click the button
    await page.waitForTimeout(350);
  };

  console.log('A. echo starts: spotlight up, step 1 framed');
  const moves = await getMoves('foot');
  await startEcho();
  let s = await st();
  ok(s.on, 'echo mode is on');
  ok(s.spot, 'the spotlight is up without pressing anything');
  ok(/step 1/.test(s.cap) && new RegExp('/' + moves.length).test(s.cap), 'caption frames step 1/' + moves.length, s.cap);

  console.log('B. wrong keys are swallowed with a nudge');
  await page.keyboard.press('q');
  await page.waitForTimeout(120);
  s = await st();
  ok(s.miss === 1 && s.mi === 0 && s.ki === 0, 'a stray letter is counted and blocked', JSON.stringify({ miss: s.miss, mi: s.mi }));
  const cellQ = await page.evaluate(() => { const c = S.cells[colLetter(S.active.c) + S.active.r]; return c && c.value; });
  ok(String(cellQ || '').indexOf('q') < 0, 'the stray letter never reached the cell');
  // foot's first chord IS alt+= — Alt going down here is legitimate preamble, not a miss
  await page.keyboard.press('Alt');
  await page.waitForTimeout(120);
  s = await st();
  ok(s.miss === 1 && s.mi === 0 && s.ki === 0, 'Alt ahead of an alt-chord passes as preamble', JSON.stringify({ miss: s.miss }));

  console.log('C. performing the chords walks the drill');
  // move 0 first, then a stray Alt where the expected chord is ctrl+d — THAT gets blocked
  for (const k of moves[0].keys) { await page.keyboard.press(combo(k)); await page.waitForTimeout(70); }
  await page.waitForTimeout(520);
  s = await st();
  ok(s.mi === 1, 'the first move advanced the walk', JSON.stringify({ mi: s.mi, ki: s.ki }));
  await page.keyboard.press('Alt');
  await page.waitForTimeout(120);
  s = await st();
  ok(s.miss === 2 && s.mi === 1 && s.ki === 0, 'a stray Alt before a ctrl-chord is blocked (no ribbon)', String(s.miss));
  for (const mv of moves.slice(1)) {
    for (const k of mv.keys) { await page.keyboard.press(combo(k)); await page.waitForTimeout(70); }
    await page.waitForTimeout(520);           // echoStep/echoDone fire on a 380-420ms beat
  }
  const finished = await page.waitForFunction(() => !echoOn, null, { timeout: 5000 }).then(() => true).catch(() => false);
  ok(finished, 'echo completes after the last chord');
  s = await st();
  ok(/echoed/.test(s.res), 'the epilogue celebrates the echo', s.res);
  ok(s.done === false && !s.cel, 'the run never scored (no win, no celebration)');
  ok(!s.spot, 'the spotlight is gone');
  const reset = await page.evaluate(() => !(S.cells['F2'] && S.cells['F2'].formula));
  ok(reset, 'the board reset for a real run');

  console.log('D. esc bails cleanly');
  await startEcho();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  s = await st();
  ok(!s.on && !s.spot, 'escape ends the echo and clears the spotlight');
  ok(/your turn/.test(s.res), 'the result line hands the board back', s.res);

  console.log('E. a ribbon-walk drill echoes too');
  const moves2 = await getMoves('dress');
  await startEcho();
  for (const mv of moves2) {
    for (const k of mv.keys) { await page.keyboard.press(combo(k)); await page.waitForTimeout(70); }
    await page.waitForTimeout(520);
  }
  const fin2 = await page.waitForFunction(() => !echoOn, null, { timeout: 8000 }).then(() => true).catch(() => false);
  ok(fin2, 'the alt-walk drill echoes to completion');

  console.log('F. mac chords match (unit matrix on echoMatch)');
  const mac = await page.evaluate(() => {
    const F = (e, x) => echoMatch(e, x);
    const was = HK_MAC; HK_MAC = true;
    const r = {
      cmdC: F({ key: 'c', metaKey: true, ctrlKey: false, altKey: false, shiftKey: false, code: 'KeyC' }, { key: 'c', ctrl: true }),
      dead: F({ key: '˙', metaKey: false, ctrlKey: false, altKey: true, shiftKey: false, code: 'KeyH' }, { key: 'h' }),
      cmdT: F({ key: 't', metaKey: true, ctrlKey: false, altKey: false, shiftKey: false, code: 'KeyT' }, { key: 'F4' }),
      ctrlU: F({ key: 'u', metaKey: false, ctrlKey: true, altKey: false, shiftKey: false, code: 'KeyU' }, { key: 'F2' }),
      optEq: F({ key: '≠', metaKey: false, ctrlKey: false, altKey: true, shiftKey: false, code: 'Equal' }, { key: '=', alt: true })
    };
    HK_MAC = was;
    const win = {
      ctrlAltNo: F({ key: 'v', metaKey: false, ctrlKey: true, altKey: true, shiftKey: false, code: 'KeyV' }, { key: 'v', ctrl: true }),
      shiftArrowNo: F({ key: 'ArrowDown', metaKey: false, ctrlKey: true, altKey: false, shiftKey: true, code: 'ArrowDown' }, { key: 'ArrowDown', ctrl: true }),
      spaceVsShift: F({ key: ' ', metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, code: 'Space' }, { key: ' ', shift: true })
    };
    return { mac: r, win };
  });
  ok(Object.values(mac.mac).every(v => v === true), 'mac equivalences all accept', JSON.stringify(mac.mac));
  ok(Object.values(mac.win).every(v => v === false), 'near-miss chords all reject', JSON.stringify(mac.win));

  ok(errs.length === 0, 'zero page errors through echo mode', errs.join(' | '));
  console.log(fail === 0 ? `ECHO: ALL ${pass} PASS` : `ECHO: ${fail} FAIL / ${pass} pass`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})();
