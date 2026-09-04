/* r456 · FOUNDATIONS 1 "Navigate & Select" — the drill's own probe (WORKFLOW §9.1's
   dev/verify-<key>.js slot). Walks the board through the REAL engine and asserts the things
   e2e-depth-mechanics' L block does not: the three-step partition, the tier boundaries
   (walls down / home range marked), the four selection end states and their alts, the
   Go To Special one-pass beat, and both sides of the ☆.
   Run: node dev/verify-navigation.js   (server on 127.0.0.1:8791, or URL=…) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
let fail = 0;
const ok = (c, m, x) => { console.log((c ? '  ok  ' : 'FAIL  ') + m + (c ? '' : ' :: ' + JSON.stringify(x))); if (!c) fail++; };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_learn_done', '1');
    localStorage.setItem('hk_gate_off', '1'); localStorage.setItem('hk_handle_cache', '');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });
  /* celebration overlays install CAPTURE-phase key listeners that eat replay keys (the r393
     class) — clear them before every load, exactly like e2e-depth-mechanics does */
  await page.evaluate(() => {
    window.__clearCel = () => {
      try { window.__hkCelQ = []; } catch (e) {}
      document.querySelectorAll('.hk-cel-wrap').forEach(n => { try { n.click(); } catch (e) {} n.remove(); });
      try { window.__hkCelOpen = false; } catch (e) {}
      document.querySelectorAll('.wb-dlg').forEach(n => n.remove());
    };
  });
  const run = fn => page.evaluate(fn);

  console.log('A. the step declaration partitions the nine core beats (§9.0.1)');
  {
    const r = await run(() => {
      loadChallenge('navigation');
      const C = CHALLENGES.navigation, it = C.checks(S);
      const cores = it.filter(x => !x.bonus && !x.save).length;
      const ids = [].concat(...C.steps.map(s => s.beats.map(b => b.id))).sort((a, b) => a - b);
      return { cores, ids, nSteps: C.steps.length, guide: C.guide().length, tgt: C.targets().length,
        items: it.length, star: it.filter(x => x.bonus).length,
        reveal: !!(it.find(x => x.bonus) || {}).reveal, tut: C.tutorial };
    });
    ok(r.nSteps === 3, 'three steps', r);
    ok(r.cores === 9 && JSON.stringify(r.ids) === JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8]),
      'the steps partition all nine core beats, none twice, none left over', r);
    ok(r.items === 11 && r.star === 1, 'ten beats (nine cores + the engine save closer) and exactly one ☆', r);
    ok(r.reveal, 'the ☆ is VISIBLE (reveal:true) — §9.0 "exactly one, visible"', r);
    ok(r.guide === r.items && r.tgt === r.items, 'guide/targets stay index-paired with checks', r);
    ok(r.tut && r.tut.n === 1 && r.tut.name === 'Navigate & Select', 'tutorial:{n,name,nextKey}', r.tut);
  }

  console.log('B. the ☆ ROUTE — every hall in one press (the demo route)');
  {
    const r = await run(() => {
      window.__forceSeed = 606; loadChallenge('navigation');
      const C = CHALLENGES.navigation;
      for (const mv of C.demo()) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      const it = C.checks(S);
      return { done, star: !!(it.find(x => x.bonus) || {}).ok, walk: (S.mzWalkLog || []).length,
        all: it.every(x => x.ok), marks: (S.marks || []).length };
    });
    ok(r.done && r.all, 'the optimal route clears every beat and wins', r);
    ok(r.star && r.walk === 0, 'and earns the ☆ — no hall walked', r);
  }

  console.log('C. the ☆-FORFEIT control — the corridor walked cell by cell');
  {
    const r = await run(() => {
      window.__clearCel(); hideResults();
      window.__forceSeed = 606; loadChallenge('navigation');
      const C = CHALLENGES.navigation, M = C._maze, p = M.p1;
      // walk the WHOLE corridor one plain arrow at a time
      for (let i = 0; i + 1 < p.length; i++) {
        const dr = p[i + 1][0] - p[i][0], dc = p[i + 1][1] - p[i][1];
        demoKey({ key: dr === 1 ? 'ArrowDown' : dr === -1 ? 'ArrowUp' : dc === 1 ? 'ArrowRight' : 'ArrowLeft' });
      }
      const it = C.checks(S);
      return { atBlock: it[2].ok, pips: it[1].ok, star: !!(it.find(x => x.bonus) || {}).ok,
        walk: (S.mzWalkLog || []).length, tableUp: !!S.cells[colLetter(C._nav.table.c0) + C._nav.table.r0] };
    });
    ok(r.pips && r.atBlock, 'the walk clears every step-1 core beat (alt route, §1.0(c))', r);
    ok(r.star === false, '…and FORFEITS the ☆ (the per-hall rule)', r);
    ok(r.tableUp, 'step 1 closing opened the tier: the sales table is on the board', r);
  }

  console.log('D. the step-2 tier — the walls come down, the block is gone');
  {
    const r = await run(() => {
      const C = CHALLENGES.navigation, T = C._maze.table;
      let walls = 0; for (const k in S.cells) if (S.cells[k].fill === 'wall') walls++;
      /* the block's own labels are gone; its footprint may now be TABLE cells (the anchor
         pools overlap the corner on purpose — "the corner block BECOMES the table", §9.1) */
      const lab = C._maze.snap && C._maze.snap.tl;
      let blockGone = true;
      for (const k in S.cells) if (S.cells[k].value === lab && lab !== 'Region') blockGone = false;
      const B = C._nav.table;
      return { walls, blockGone, hdr: (S.cells[colLetter(B.c0 + 5) + B.r0] || {}).value,
        memo: (S.cells.H3 || {}).value, rows: S.ROWS, home: !!S.pasteRoom };
    });
    ok(r.walls === 0 && r.blockGone, 'every wall cell and the model block are wiped', r);
    ok(r.hdr === 'FY' && /row, Q1 through FY/.test(String(r.memo)), 'the table and the memo are painted', r);
    ok(!r.home, 'the home range is NOT marked yet — that is step 3\'s rung', r);
  }

  console.log('E. the four step-2 end states, each by its ALT route');
  {
    const r = await run(() => {
      const C = CHALLENGES.navigation, N = C._nav, B = N.table;
      const cL = i => colLetter(B.c0 + i), out = {};
      // beat 3 the SLOW way: plain Shift+arrows across the figures
      S.active = { r: B.r0 + 1 + N.memoRow, c: B.c0 + 1 }; S.sel = null; render();
      for (let i = 0; i < 4; i++) demoKey({ key: 'ArrowRight', shift: true });
      out.row = C.checks(S)[3].ok;
      // beat 4 by Ctrl+Space (whole sheet column)
      S.active = { r: B.r0 + 2, c: B.c0 + 1 + N.memoCol }; S.sel = null; render();
      demoKey({ key: ' ', ctrl: true });
      out.col = C.checks(S)[4].ok;
      out.colWhole = selRange().r1 === 1 && selRange().r2 === S.ROWS;
      // beat 5 by Ctrl+A
      S.active = { r: B.r0 + 1, c: B.c0 + 1 }; S.sel = null; render();
      demoKey({ key: 'a', ctrl: true, code: 'KeyA' });
      const rg = selRange();
      out.all = C.checks(S)[5].ok;
      out.exact = rg.r1 === B.r0 && rg.c1 === B.c0 && rg.r2 === B.r0 + 8 && rg.c2 === B.c0 + 5;
      // beat 6 — only Go To Special can take the typed set in one pass
      out.typedN = N.typedRefs.length;
      demoKey({ key: 'F5' }); demoKey({ key: 's', code: 'KeyS' }); demoKey({ key: 'o', code: 'KeyO' });
      out.marks = (S.marks || []).length;
      out.typed = C.checks(S)[6].ok;
      return out;
    });
    ok(r.row, 'beat 3 grades the figures-only rectangle grown with plain Shift+arrows', r);
    ok(r.col && r.colWhole, 'beat 4 grades the WHOLE SHEET column Ctrl+Space leaves', r);
    ok(r.all && r.exact, 'beat 5 grades Ctrl+A\'s current region = exactly the table', r);
    ok(r.typed && r.marks === r.typedN && r.typedN === 33,
      'beat 6 grades Go To Special → Constants: 32 quarter figures + the ONE hand-keyed FY', r);
  }

  console.log('F. step 3 — the home range appears, the table is delivered, the drill wins');
  {
    const r = await run(() => {
      const C = CHALLENGES.navigation, B = C._nav.table;
      const home = !!S.pasteRoom;
      S.active = { r: B.r0 + 1, c: B.c0 + 1 }; S.sel = null; render();   // Ctrl+A on a live region EXPANDS (r407) — land first
      demoKey({ key: 'a', ctrl: true, code: 'KeyA' });
      demoKey({ key: 'c', ctrl: true });
      demoKey({ key: 'Home', ctrl: true });
      demoKey({ key: 'v', ctrl: true });
      const it0 = C.checks(S);
      demoKey({ key: 's', ctrl: true });
      const it = C.checks(S);
      return { home, copied: it0[7].ok, pasted: it0[8].ok, saved: !!(it.find(x => x.save)||{}).ok, done,
        a1: (S.cells.A1 || {}).value, f9: (S.cells.F9 || {}).value };
    });
    ok(r.home, 'step 2 closing marked the home range at A1 (S.pasteRoom)', r);
    ok(r.copied && r.pasted, 'the table copies and lands at A1:F9', r);
    ok(r.saved && r.done, 'the engine-appended Ctrl+S closer is beat 10 and wins the drill', r);
  }

  console.log('G. the guide panel + the hint ladder (§9.0.2 / §9.0.3)');
  {
    const r = await run(() => {
      window.__clearCel(); hideResults();
      /* the guide declines for the same reasons the r450 start gate declines, and hk_gate_off
         is one of them — drop the harness opt-out for this block only. */
      try { localStorage.removeItem('hk_guide_navigation'); localStorage.removeItem('hk_gate_off'); } catch (e) {}
      window.__forceSeed = 606; loadChallenge('navigation'); hkGateClear(); render();
      const el = document.getElementById('checklist');
      const out = { armed: stepMode && S.step === 0,
        steps: el.querySelectorAll('.cl-steps .cl-step').length,
        why: (el.querySelector('.cl-why') || {}).textContent || '',
        caps: el.querySelectorAll('.cl-item .cl-keys').length,
        hintBtn: !!el.querySelector('#clHint'), fold: !!el.querySelector('#clFold'),
        starRow: [...el.querySelectorAll('.cl-item.cl-bonus .cl-label')].map(n => n.textContent)[0] || '' };
      // rung ladder by the button
      out.r0 = hkHintRung(); hkGuideHint(); out.r1 = hkHintRung();
      out.whyLit = !!document.querySelector('#checklist .cl-why.lit');
      hkGuideHint(); out.r2 = hkHintRung();
      out.capsLit = !!document.querySelector('#checklist .cl-caps.lit');
      hkGuideHint(); out.r3 = hkHintRung();
      out.ring = !!document.querySelector('#grid td.hintring');
      const t = currentTargetRange(), C = CHALLENGES.navigation;
      let want = C.targets()[0]; if (typeof want === 'function') want = want.call(C);
      out.range = t; out.want = resolveRange(want);
      // the ladder never speaks for the ☆
      out.starCaps = !!(el.querySelector('.cl-item.cl-bonus .cl-keys'));
      // fold → the plain checklist, every row back
      hkGuideFold();
      out.folded = !hkGuideOpen();
      out.rows = document.querySelectorAll('#checklist .cl-item').length;
      out.all = CHALLENGES.navigation.checks(S).length;
      out.latch = localStorage.getItem('hk_guide_navigation');
      hkGuideFold(); out.reopened = hkGuideOpen();
      return out;
    });
    ok(r.armed, 'the guide is open on a first play', r);
    ok(r.steps === 3, 'the panel lists all three steps under the checklist head', r);
    ok(/keyboard flies/.test(r.why), 'the open step\'s why is in the panel', r.why);
    ok(r.caps >= 1, 'the keycap column is shown for the open step\'s other beats', r);
    ok(r.hintBtn && r.fold, 'the panel carries the hint button and the fold toggle', r);
    ok(/^☆ Take every straightaway/.test(r.starRow), 'the ☆ is named, not "☆ ?" (reveal:true)', r.starRow);
    ok(r.r0 === 0 && r.r1 === 1 && r.r2 === 2 && r.r3 === 3, 'the button walks rungs 1 → 2 → 3, in order', r);
    ok(r.whyLit, 'rung 1 lights the step\'s concept line', r);
    ok(r.capsLit, 'rung 2 lights the open beat\'s keycaps', r);
    ok(r.ring && r.range && r.want && JSON.stringify(r.range) === JSON.stringify(r.want),
      'rung 3 lights the OPEN BEAT\'S OWN range on the board', r);
    ok(!r.starCaps, 'no rung ever puts keys on the ☆ (§9.0.3: hints never cover it)', r);
    ok(r.folded && r.rows === r.all && r.latch === 'off',
      'folding gives back the plain checklist, every beat, and latches hk_guide_<key>=off', r);
    ok(r.reopened, 'and the toggle re-arms the guide', r);
  }

  ok(errs.length === 0, 'zero page errors', errs);
  await browser.close();
  console.log(fail ? '\nFAILED ' + fail : '\nverify-navigation: ALL GREEN');
  process.exit(fail ? 1 : 0);
})();
