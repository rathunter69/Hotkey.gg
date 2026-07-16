/* r278 MAC INPUT MATRIX — drives the engine through Mac-style events (metaKey chords,
   ⌥-dead-characters with e.code, ⌘T/⌃U) on a faked Mac platform and asserts the same
   outcomes the Windows parity matrix guarantees. Raw KeyboardEvents, not demoKey —
   the adapter itself is what's under test. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  await page.addInitScript(() => { try {
    Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
  } catch (e) {} });
  await page.goto((process.env.URL || 'http://127.0.0.1:8791/index.html'), { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  const run = (fn, arg) => page.evaluate(fn, arg);
  const fresh = () => run(() => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('foot'); });
  // raw Mac-flavored keydown into the real document handler
  const K = `function K(spec){ document.dispatchEvent(new KeyboardEvent('keydown', Object.assign({bubbles:true,cancelable:true}, spec))); }`;

  const detected = await run(() => window.HK_MAC === true);
  ok(detected, 'adapter detects the faked Mac platform');

  console.log('A. ⌘ plays the Ctrl role');
  await fresh();
  const a = await run(new Function('arg', K + `
    setDemoSel('B4'); K({key:'c', code:'KeyC', metaKey:true});             // ⌘C
    setDemoSel('E9'); K({key:'v', code:'KeyV', metaKey:true});             // ⌘V
    const pasted = S.cells['E9'] && S.cells['E9'].value === S.cells['B4'].value;
    K({key:'Escape', code:'Escape'});                                      // leave paste-options mode (arrows cycle it)
    setDemoSel('B4'); K({key:'ArrowDown', code:'ArrowDown', metaKey:true});// ⌘↓ jump
    const edge = colLetter(S.active.c) + S.active.r;
    const jumped = edge.charAt(0)==='B' && edge !== 'B4';   // no regex: template cooking eats backslashes
    setDemoSel('C5'); K({key:'b', code:'KeyB', metaKey:true});             // ⌘B bold
    const bolded = !!(S.cells['C5'] && S.cells['C5'].bold);
    return { pasted, jumped, bolded, edge };
  `));
  ok(a.pasted, '⌘C / ⌘V copy-paste', JSON.stringify(a));
  ok(a.jumped, '⌘↓ jumps the data edge', a.edge);
  ok(a.bolded, '⌘B bolds');

  console.log('B. ⌥ opens the ribbon — dead characters recover via e.code');
  await fresh();
  const b = await run(new Function('arg', K + `
    setDemoSel('C5');
    // tapped ⌥ then plain letters (KeyTips style)
    K({key:'Alt', code:'AltLeft'}); K({key:'h', code:'KeyH'}); K({key:'k', code:'KeyK'});
    const tapped = S.cells['C5'] && S.cells['C5'].fmtStyle === 'comma';
    // held ⌥ — macOS delivers dead chars: ˙ for ⌥H, ˚ for ⌥K
    setDemoSel('D5');
    K({key:'Alt', code:'AltLeft', altKey:true});
    K({key:'\\u02d9', code:'KeyH', altKey:true});
    K({key:'\\u02da', code:'KeyK', altKey:true});
    const held = S.cells['D5'] && S.cells['D5'].fmtStyle === 'comma';
    return { tapped, held };
  `));
  ok(b.tapped, 'tap-⌥ then h k applies comma format (KeyTips style)');
  ok(b.held, 'held-⌥ dead characters (˙˚) still walk alt h k');

  console.log('C. Mac-native chords');
  await fresh();
  const c = await run(new Function('arg', K + `
    setDemoSel('C5');
    K({key:'=', code:'Equal'});
    'B4'.split('').forEach(ch => K({key:ch, code:''}));
    K({key:'t', code:'KeyT', metaKey:true});                               // ⌘T ≡ F4 while editing
    const buf1 = editBuf;
    K({key:'Escape', code:'Escape'});
    setDemoSel('D4'); K({key:'u', code:'KeyU', ctrlKey:true});             // ⌃U ≡ F2
    const editingNow = editing === true;
    K({key:'Escape', code:'Escape'});
    return { anchored: /\\$B\\$4/.test(buf1), editingNow, buf1 };
  `));
  ok(c.anchored, '⌘T cycles the anchor like F4', c.buf1);
  ok(c.editingNow, '⌃U enters edit mode like F2');

  console.log('D. Windows habits still work on the Mac (superset, not a swap)');
  await fresh();
  const d = await run(new Function('arg', K + `
    setDemoSel('B4'); K({key:'c', code:'KeyC', ctrlKey:true});             // plain Ctrl+C
    setDemoSel('F9'); K({key:'v', code:'KeyV', ctrlKey:true});
    const ctrlPaste = S.cells['F9'] && S.cells['F9'].value === S.cells['B4'].value;
    setDemoSel('C5');
    K({key:' ', code:'Space', shiftKey:true});                             // shift+space row select
    const R = selRange();
    const rowSel = R.c1 === 1 && R.c2 === COLS && R.r1 === 5 && R.r2 === 5;
    K({key:'Escape', code:'Escape'});
    return { ctrlPaste, rowSel };
  `));
  ok(d.ctrlPaste, 'plain Ctrl chords still pass through');
  ok(d.rowSel, 'shift+space row select unaffected');

  console.log('E. typing is untouched');
  await fresh();
  const e2 = await run(new Function('arg', K + `
    setDemoSel('C5');
    '123'.split('').forEach(ch => K({key:ch, code:'Digit'+ch}));
    K({key:'Enter', code:'Enter'});
    return { v: S.cells['C5'].value };
  `));
  ok(e2.v === 123, 'plain digits type and commit', String(e2.v));

  ok(errs.length === 0, 'zero page errors through the Mac matrix', errs.join(' | '));
  console.log(fail === 0 ? `MAC INPUT: ALL ${pass} PASS` : `MAC INPUT: ${fail} FAIL / ${pass} pass`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})();
