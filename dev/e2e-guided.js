/* r350 GUIDED GATE — the guided-mode contract, enforced on every drill.
   Wolf: "Think we also need a full re-run of the guided solution path — it's still not
   restricting the user to the given area but also isn't incorporating alternative ways
   to use a hotkey or solve."  Four assertions:

   A. SOLVABILITY — every drill's scripted solution, replayed as REAL key events with
      guided ON (zone fence, arrow/Home clamps, auto-reposition all active), must WIN.
      Rails may never make a drill unsolvable.
   B. CONTAINMENT — on every railed drill, arrow spam plus Home/Ctrl+Home cannot take
      the cursor outside the fence (S._railZone).
   C. ZONE SANITY — the fence contains every graded target and every seeded cell, so
      copy sources and helper cells are always reachable.
   D. ALTERNATES — Wolf's chase-the-marks list on the hunt drill, under guided: per-cell
      AutoSum, a manual addition chain, and copy/paste cell-to-next all count (the demo's
      fill-right route is covered by A).

   Run: node dev/e2e-guided.js [drill ...]   (server on 127.0.0.1:8791) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const only = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
    localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.goto('http://127.0.0.1:8791/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  const drills = await page.evaluate(() => MENU_ORDER.slice());
  let fails = 0, ran = 0, railed = 0;

  for (const key of drills) {
    if (only.length && !only.includes(key)) continue;
    ran++;
    const r = await page.evaluate((key) => {
      try {
        /* dismiss any celebration card the PREVIOUS win queued (achievement sweep fires on
           move-on) — click() runs its close() so the capture key handler detaches too */
        const clearCel = () => { try { window.__hkCelQ = [];
          document.querySelectorAll('.hk-cel-wrap').forEach(n => { n.click(); n.remove(); });
          window.__hkCelOpen = false; } catch (e) {} };
        document.querySelectorAll('.wb-dlg').forEach(n => n.remove());
        clearCel();
        guided = true; loadChallenge(key);
        clearCel();
        const C = CHALLENGES[key];
        const out = { key };
        const z = S._railZone;
        out.railed = !!(z && typeof railSafe === 'function' && railSafe(C));
        if (out.railed) {
          // C: zone sanity — every target and every seeded cell inside the fence
          let zoneOk = true;
          try {
            const T2 = (typeof C.targets === 'function') ? C.targets.call(C) : C.targets;
            (T2 || []).forEach(t => { if (typeof t === 'function') t = t.call(C);
              const rr = resolveRange(t); if (!rr) return;
              if (rr.r1 < z.r1 || rr.r2 > z.r2 || rr.c1 < z.c1 || rr.c2 > z.c2) zoneOk = false; });
          } catch (e) { zoneOk = false; }
          for (const k2 in S.cells) { const rr = resolveRange(k2); if (!rr) continue;
            if (rr.r1 < z.r1 || rr.r1 > z.r2 || rr.c1 < z.c1 || rr.c1 > z.c2) { zoneOk = false; break; } }
          out.zoneOk = zoneOk;
          // B: containment — spam every direction, then the Home family
          const spam = [['ArrowUp', 20], ['ArrowLeft', 15], ['ArrowDown', 30], ['ArrowRight', 15]];
          for (const [k3, n] of spam) { for (let i = 0; i < n; i++) demoKey({ key: k3 }); }
          const inside = () => S.active.r >= z.r1 && S.active.r <= z.r2 && S.active.c >= z.c1 && S.active.c <= z.c2;
          let contained = inside();
          demoKey({ key: 'Home' }); contained = contained && S.active.c >= z.c1;
          demoKey({ key: 'Home', ctrl: true }); contained = contained && inside();
          demoKey({ key: 'End', ctrl: true }); contained = contained && inside();
          out.contained = contained;
        }
        // A: solvability — fresh board, scripted solution as real keys, guided still ON
        loadChallenge(key);
        clearCel();
        const moves = (typeof C.demo === 'function') ? C.demo.call(C) : C.demo;
        if (moves) { for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); } }
        out.won = !!done;
        if (!out.won) out.failing = C.checks(S).filter(x => !x.ok).map(x => x.label).slice(0, 3);
        guided = false;
        return out;
      } catch (e) { try { guided = false; } catch (e2) {} return { key, threw: String(e).slice(0, 140) }; }
    }, key);

    const probs = [];
    if (r.threw) probs.push('THREW: ' + r.threw);
    if (r.railed) { railed++;
      if (!r.zoneOk) probs.push('zone excludes a target/seeded cell');
      if (!r.contained) probs.push('cursor escaped the fence');
    }
    if (!r.threw && !r.won) probs.push('guided replay LOST — stuck on: ' + (r.failing || []).join(' | ').slice(0, 140));
    if (probs.length) { fails++; console.log('FAIL ' + key.padEnd(12) + ' · ' + probs.join(' · ')); }
    else console.log('PASS ' + key.padEnd(12) + (r.railed ? ' · railed, contained, solvable' : ' · free (cursor-graded), solvable'));
  }

  // D: the chase-the-marks alternates (hunt) — every legit total build counts under guided
  if (!only.length || only.includes('hunt')) {
    const ALTS = [
      { name: 'per-cell AutoSum (Alt+= each column)', tail: `[
          {sel:'B8', keys:[Kb.eq, Kb.enter]}, {sel:'C8', keys:[Kb.eq, Kb.enter]}, {sel:'D8', keys:[Kb.eq, Kb.enter]},
          {sel:'B8:D8', keys:[Kb.bold]} ]` },
      { name: 'manual addition chain per cell', tail: `[
          {sel:'B8', keys:[...T('=B3+B4+B5+B6+B7'), Kb.enter]},
          {sel:'C8', keys:[...T('=C3+C4+C5+C6+C7'), Kb.enter]},
          {sel:'D8', keys:[...T('=D3+D4+D5+D6+D7'), Kb.enter]},
          {sel:'B8:D8', keys:[Kb.bold]} ]` },
      { name: 'copy/paste the SUM cell-to-next', tail: `[
          {sel:'B8', keys:[...T('=SUM(B3:B7)'), Kb.enter]},
          {sel:'B8', keys:[Kb.copy]}, {sel:'C8', keys:[Kb.paste]}, {sel:'D8', keys:[Kb.paste]},
          {sel:'B8:D8', keys:[Kb.bold]} ]` },
    ];
    for (const alt of ALTS) {
      ran++;
      const r = await page.evaluate(({ tail }) => {
        try {
          try { window.__hkCelQ = []; document.querySelectorAll('.hk-cel-wrap').forEach(n => { n.click(); n.remove(); }); window.__hkCelOpen = false; } catch (e) {}
          document.querySelectorAll('.wb-dlg').forEach(n => n.remove());
          guided = true; loadChallenge('hunt');
          const C = CHALLENGES.hunt, o = C._o;
          const moves = [{ sel: 'B3', keys: [{ key: 'F5' }, L('s'), L('o')] }];
          o.sites.forEach(s => moves.push({ sel: s.k, keys: [...T(s.f), Kb.enter] }));
          moves.push(...eval('(' + tail + ')'));
          for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
          const won = !!done;
          const failing = won ? [] : C.checks(S).filter(x => !x.ok).map(x => x.label).slice(0, 2);
          guided = false;
          return { won, failing };
        } catch (e) { try { guided = false; } catch (e2) {} return { won: false, failing: ['THREW: ' + String(e).slice(0, 100)] }; }
      }, { tail: alt.tail });
      if (!r.won) { fails++; console.log('FAIL hunt-alt · ' + alt.name + ' · stuck on: ' + r.failing.join(' | ')); }
      else console.log('PASS hunt-alt · ' + alt.name);
    }
  }

  console.log('\nGUIDED GATE: ' + (fails ? fails + ' FAILURE(S) of ' + ran : 'ALL ' + ran + ' PASS (' + railed + ' railed)'));
  if (errs.length) { console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' · ')); fails++; }
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
