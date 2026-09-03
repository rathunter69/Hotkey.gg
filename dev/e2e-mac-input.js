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

  /* r452 (audit P0-1/P0-2/P0-5): the chords Mac Excel does NOT put on ⌘+the-Windows-letter.
     Before r452 hkMacAdapt collapsed ⌃ and ⌘ into one bit, so ⌃⌘V arrived as a plain Ctrl+V
     (a silent, formatting-carrying full paste over the model) and ⌘⇧T became an inert bare F4. */
  console.log('C2. Mac-only chords: ⌃⌘V · ⌘⇧T · ⌃Space · ⌘⇧V');
  await fresh();
  const c2 = await run(new Function('arg', K + `
    setDemoSel('B4'); K({key:'c', code:'KeyC', metaKey:true});
    setDemoSel('E9'); K({key:'v', code:'KeyV', metaKey:true, ctrlKey:true});   // ⌃⌘V = Paste Special
    const dlg = dialog, landed = !!(S.cells['E9'] && S.cells['E9'].value !== null && S.cells['E9'].value !== undefined);
    K({key:'Escape', code:'Escape'}); K({key:'Escape', code:'Escape'});
    return { dlg, landed };
  `));
  ok(c2.dlg === 'paste', '⌃⌘V opens the Paste Special dialog', String(c2.dlg));
  ok(!c2.landed, '⌃⌘V no longer silently full-pastes onto the destination');

  await fresh();
  const c3 = await run(new Function('arg', K + `
    setDemoSel('B8'); K({key:'t', code:'KeyT', metaKey:true, shiftKey:true});  // ⌘⇧T = AutoSum
    const proposed = editing === true && /SUM/i.test(editBuf);
    const buf = editBuf;
    K({key:'Escape', code:'Escape'});
    // ⌘T with no shift still cycles anchors (the two must not collide)
    setDemoSel('C5'); K({key:'=', code:'Equal'});
    'B4'.split('').forEach(ch => K({key:ch, code:''}));
    K({key:'t', code:'KeyT', metaKey:true});
    const anchored = /\\$B\\$4/.test(editBuf);
    K({key:'Escape', code:'Escape'});
    return { proposed, buf, anchored };
  `));
  ok(c3.proposed, '⌘⇧T proposes a SUM (Mac AutoSum — there is no Alt+= on a Mac)', c3.buf);
  ok(c3.anchored, '⌘T with no shift still cycles the anchor (F4)');

  await fresh();
  const c4 = await run(new Function('arg', K + `
    setDemoSel('C5'); K({key:' ', code:'Space', ctrlKey:true});                // ⌃Space (⌘Space is Spotlight)
    const R = selRange();
    const colSel = R.c1 === 3 && R.c2 === 3 && R.r1 === 1 && R.r2 === S.ROWS;
    K({key:'Escape', code:'Escape'});
    setDemoSel('C9'); for(const ch of '=B4+1') K({key:ch, code:''}); K({key:'Enter', code:'Enter'});
    setDemoSel('C9'); K({key:'c', code:'KeyC', metaKey:true});
    setDemoSel('E11'); K({key:'v', code:'KeyV', metaKey:true, shiftKey:true}); // ⌘⇧V = paste VALUES
    const dest = S.cells['E11'] || {};
    return { colSel, R, f: dest.formula || null, v: dest.value, src: S.cells['C9'].value };
  `));
  ok(c4.colSel, '⌃Space selects the whole column', JSON.stringify(c4.R));
  ok(!c4.f && c4.v === c4.src, '⌘⇧V pastes VALUES, not the formula', JSON.stringify({ f: c4.f, v: c4.v }));

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

  console.log('F. display layer speaks Mac (Stage 2)');
  await run(() => { try { localStorage.setItem('hk_mac_seen', '1'); } catch (e) {} });
  const f = await run(new Function('arg', K + `
    /* r437: this used to load 'dress', which the depth-pass campaign folded away — a retired
       key left behind in a harness, the same miss as the certificate SQL and the leaderboard
       PKEYS list. It is the DISPLAY layer under test, not a particular board, so pick the host
       at runtime: any live drill whose task line actually names an Alt or Ctrl chord, since
       that is the only precondition for the ⌥/⌘ caps to have something to render. */
    const host = Object.keys(CHALLENGES).find(k => {
      let r = CHALLENGES[k] && CHALLENGES[k].req;
      if (typeof r === 'function') { try { r = r(); } catch (e) { return false; } }
      const t = Array.isArray(r) ? r.join(' ') : String(r || '');
      return /alt|ctrl/i.test(t);   // req is lower-case HTML copy, not display caps
    });
    if (!host) throw new Error('no drill names an Alt/Ctrl chord in req — mac caps untestable');
    loadChallenge(host);
    const btnShown = (document.getElementById('macBtn')||{style:{}}).style.display !== 'none';
    const tl = (document.getElementById('taskLine')||{innerHTML:''}).innerHTML;
    const reqMac = tl.indexOf('\u2325') >= 0 || tl.indexOf('\u2318') >= 0;
    setDemoSel('C5'); K({key:'b', code:'KeyB', metaKey:true});
    const flash = (document.getElementById('keyflash')||{textContent:''}).textContent;
    return { btnShown, reqMac, flashMac: flash.indexOf('\u2318') >= 0, tl: tl.slice(0, 80) };
  `));
  ok(f.btnShown, 'the ⌘ mac keys button shows for Mac visitors');
  ok(f.reqMac, 'the task line renders ⌥/⌘ caps', f.tl);
  ok(f.flashMac, 'keyflash chips speak ⌘');

  const g = await run(new Function('arg', K + `
    if(window.hkMacPopup) window.hkMacPopup();
    const pop = document.getElementById('hkMacPop');
    const hasKeyTips = pop && pop.textContent.indexOf('KeyTips') >= 0;
    const hasFn = pop && pop.textContent.indexOf('standard function keys') >= 0;
    if(pop) pop.remove();
    return { opened: !!pop, hasKeyTips, hasFn };
  `));
  ok(g.opened && g.hasKeyTips && g.hasFn, 'the mac popup opens and teaches KeyTips + the fn setting');

  console.log('G. reference page toggle (Stage 3)');
  const ref = await browser.newPage();
  await ref.addInitScript(() => { try {
    Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
  } catch (e) {} });
  await ref.goto((process.env.URL || 'http://127.0.0.1:8791/index.html').replace('index.html', 'reference.html'), { waitUntil: 'load' });
  await ref.waitForTimeout(900);
  const r1 = await ref.evaluate(() => {
    const caps = [...document.querySelectorAll('.cap')].map(c => c.textContent);
    const macNow = caps.some(c => c === '\u2318') && caps.some(c => c === '\u2325');
    document.getElementById('platToggle').click();
    const caps2 = [...document.querySelectorAll('.cap')].map(c => c.textContent);
    const winBack = caps2.some(c => /^ctrl$/i.test(c)) && !caps2.some(c => c === '\u2318');
    document.getElementById('platToggle').click();
    document.getElementById('macSetup').click();
    const popped = !!document.getElementById('hkMacPop');
    return { macNow, winBack, popped };
  });
  /* r452 (audit P0-3): the Mac column is a TRUTH table now, not a glyph swap. Row-by-row —
     ⌘Space is Spotlight, ⌘⌥V is not Paste Special, ⌥= does not exist on a Mac. */
  const r2 = await ref.evaluate(() => {
    const rowFor = (needle) => [...document.querySelectorAll('.row')]
      .find(r => (r.querySelector('.desc') || {}).textContent && r.querySelector('.desc').textContent.includes(needle));
    // the CAPS only — a row's Mac note ("⌘Space is macOS Spotlight") is prose, not a keycap
    const keysOf = (needle) => { const r = rowFor(needle); return r ? [...r.querySelectorAll('.keys .cap')].map(c => c.textContent).join('') : ''; };
    return {
      col: keysOf('Select the entire column'),
      psp: keysOf('Paste Special dialog'),
      sum: keysOf('AutoSum'),
      fx:  keysOf('Toggle show formulas'),
      pro: [...document.querySelectorAll('.keys[data-winonly="1"]')].map(k => k.textContent).join(' '),
      wonly: [...document.querySelectorAll('.wonly')].some(n => n.style.display !== 'none')
    };
  });
  ok(r2.col.indexOf('⌃') === 0 && r2.col.indexOf('⌘') < 0, 'select column teaches ⌃Space, never ⌘Space (Spotlight)', r2.col);
  ok(r2.psp.indexOf('⌃') >= 0 && r2.psp.indexOf('⌘') >= 0, 'paste special teaches ⌃⌘V', r2.psp);
  ok(/⌘.*⇧.*T/.test(r2.sum), 'AutoSum teaches ⌘⇧T, not ⌥=', r2.sum);
  ok(r2.fx.indexOf('⌃') === 0, 'show formulas teaches ⌃`, not ⌘` (macOS window cycle)', r2.fx);
  ok(r2.pro.indexOf('⌘') < 0 && r2.wonly, 'the Windows-only add-in sections keep Windows caps + say so', r2.pro.slice(0, 40));
  ok(r1.macNow, 'reference defaults to ⌘/⌥ caps on a Mac');
  ok(r1.winBack, 'toggle flips back to windows caps');
  ok(r1.popped, 'mac setup link opens the popup');
  await ref.close();

  ok(errs.length === 0, 'zero page errors through the Mac matrix', errs.join(' | '));
  console.log(fail === 0 ? `MAC INPUT: ALL ${pass} PASS` : `MAC INPUT: ${fail} FAIL / ${pass} pass`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})();
