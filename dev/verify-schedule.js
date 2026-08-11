/* r446 — `schedule` DEPTH-PASS PROBE (DEPTH_PASS §4.68, Models II).
   Self-contained per WORKFLOW.md §9.1: this file names exactly one drill, `schedule`, and
   nothing else — the C13 retirement guard sweeps dev/*.js for quoted drill keys.

   WHY THIS FILE EXISTS. DEPTH_PASS_CAMPAIGN §1: thirteen untriggerable beats have been found
   in this campaign and not one of them was found by READING a predicate — every one came out
   of WALKING a route through the live engine. So this probe walks them:

     A  ROUTE MATRIX      — every legal Excel route to the visible end state, each driven end to
                            end, asserting all five cores clear. Includes the one that needed
                            walking: Alt H B A writes `ball`, never `bt`, so a top-border check
                            asking for `bt` alone would strand the All-Borders player.
     B  ☆ ISOLATION       — each half of the star measured against its OWN slow alternative
                            (the r438 `series` rule: a combined number hides a negative half).
     C  ☆ SKIPPABILITY    — the negative control: every later year typed, no fill anywhere.
                            All five cores must clear and the ☆ must stay DARK (§1.0-R2(i)).
     D  HEADROOM          — fastest legal route vs slowest legal route, in keys (CAMPAIGN §2).
     E  DENSITY + FRAME   — §1.3 win-state row census, and the sheet's natural width.

   The init mirrors the real harness (hotkey_onboarded / hk_tour_done / hk_learn_done /
   hk_handle_cache) — a probe that does not is lying (the r440 hotkey_onboarded note).

   Run: node dev/verify-schedule.js        (server on 127.0.0.1:8791, or set HK_URL) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.HK_URL || process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = 5;

/* Each route is page-side source: a function of the live challenge C returning demo-style
   moves. Selections are KEYED (Shift+arrow), never handed over by setDemoSel, so the key
   counts are what a player really pays (the r438 `series` rule). */
const ROUTES = {
  /* the scripted solve, for a baseline */
  taught: `C => { const C2=C; const o=C._o, R=o.R; const sr={key:'ArrowRight',shift:true}, sd={key:'ArrowDown',shift:true};
    return [
      {sel:o.CB+R.dep, keys:[...T('=-'+o.CB+R.beg+'*$'+o.CB+'$'+R.rate), Kb.enter]},
      {sel:o.CB+R.end, keys:[...T('=SUM('+o.CB+R.beg+':'+o.CB+R.dep+')'), Kb.enter]},
      {sel:o.CC+R.beg, keys:[...T('='+o.CB+R.end), Kb.enter]},
      {sel:o.CC+R.beg, keys:[sr,sr,sr, Kb.fillR]},
      {sel:o.CB+R.dep, keys:[sr,sr,sr,sr,sd, Kb.fillR]},
      {sel:o.CA+R.end, keys:[sr,sr,sr,sr,sr, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      {sel:o.CB+R.acc, keys:[...T('=$'+o.CB+'$'+R.acc0+'+'+o.CB+R.dep), Kb.enter]},
      {sel:o.CC+R.acc, keys:[...T('='+o.CB+R.acc+'+'+o.CC+R.dep), Kb.enter]},
      {sel:o.CC+R.acc, keys:[sr,sr,sr, Kb.fillR]},
    ]; }`,

  /* A1 — AUTOSUM writes the closing line, ribbon fills, Alt H 1 for bold, Alt H B S for the
     rule (the perimeter route), memo by the expanding anchored SUM filled from year ONE. */
  autosum_ribbon_hbs: `C => { const o=C._o, R=o.R; const sr={key:'ArrowRight',shift:true}, sd={key:'ArrowDown',shift:true};
    const rib=[Kb.alt, L('h'), L('f'), L('i'), L('r')];
    return [
      {sel:o.CB+R.dep, keys:[...T('=-$'+o.CB+'$'+R.rate+'*'+o.CB+R.beg), Kb.enter]},
      {sel:o.CB+R.beg, keys:[sd,sd,sd,sd, Kb.eq]},
      {sel:o.CC+R.beg, keys:[...T('='+o.CB+R.end), Kb.enter]},
      {sel:o.CC+R.beg, keys:[sr,sr,sr, ...rib]},
      {sel:o.CB+R.dep, keys:[sr,sr,sr,sr,sd, ...rib]},
      {sel:o.CA+R.end, keys:[sr,sr,sr,sr,sr, Kb.alt, L('h'), D(1), Kb.alt, L('h'), L('b'), L('s')]},
      {sel:o.CB+R.acc, keys:[...T('=$'+o.CB+'$'+R.acc0+'+SUM($'+o.CB+'$'+R.dep+':'+o.CB+R.dep+')'), Kb.enter]},
      {sel:o.CB+R.acc, keys:[sr,sr,sr,sr, ...rib]},
    ]; }`,

  /* A2 — the ALL-BORDERS route. Alt H B A writes `ball` and never `bt`; this is the walk that
     the top-border predicate exists to survive (§1.0-R3(p)). Addition chain for the closing
     line, unanchored depreciation typed per year, plain Ctrl+B. */
  allborders_chain: `C => { const o=C._o, R=o.R; const sr={key:'ArrowRight',shift:true}, sd={key:'ArrowDown',shift:true};
    const mv=[
      {sel:o.CB+R.dep, keys:[...T('=-'+o.CB+R.beg+'*$'+o.CB+'$'+R.rate), Kb.enter]},
      {sel:o.CB+R.end, keys:[...T('='+o.CB+R.beg+'+'+o.CB+R.mnt+'+'+o.CB+R.grw+'+'+o.CB+R.dep), Kb.enter]},
      {sel:o.CC+R.beg, keys:[...T('='+o.CB+R.end), Kb.enter]},
      {sel:o.CC+R.beg, keys:[sr,sr,sr, Kb.fillR]},
      {sel:o.CB+R.dep, keys:[sr,sr,sr,sr,sd, Kb.fillR]},
      {sel:o.CB+R.end, keys:[sr,sr,sr,sr, Kb.bold, Kb.alt, L('h'), L('b'), L('a')]},
      {sel:o.CB+R.acc, keys:[...T('=$'+o.CB+'$'+R.acc0+'+'+o.CB+R.dep), Kb.enter]},
      {sel:o.CC+R.acc, keys:[...T('='+o.CB+R.acc+'+'+o.CC+R.dep), Kb.enter]},
      {sel:o.CC+R.acc, keys:[sr,sr,sr, Kb.fillR]},
    ];
    return mv; }`,

  /* A3 — TOP AND BOTTOM (Alt H B D) + pointer-mode link + =SUM through a partial range plus
     the dep cell, memo built last-to-first order. Op ORDER differs throughout. */
  hbd_pointer_reverse: `C => { const o=C._o, R=o.R; const sr={key:'ArrowRight',shift:true}, sd={key:'ArrowDown',shift:true};
    return [
      {sel:o.CC+R.beg, keys:[...T('='), {key:'ArrowDown'},{key:'ArrowDown'},{key:'ArrowDown'},{key:'ArrowDown'},{key:'ArrowLeft'}, Kb.enter]},
      {sel:o.CB+R.dep, keys:[...T('=-('+o.CB+R.beg+'*$'+o.CB+'$'+R.rate+')'), Kb.enter]},
      {sel:o.CB+R.end, keys:[...T('=SUM('+o.CB+R.beg+':'+o.CB+R.grw+')+'+o.CB+R.dep), Kb.enter]},
      {sel:o.CB+R.dep, keys:[sr,sr,sr,sr,sd, Kb.fillR]},
      {sel:o.CC+R.beg, keys:[sr,sr,sr, Kb.fillR]},
      {sel:o.CB+R.acc, keys:[...T('=$'+o.CB+'$'+R.acc0+'+'+o.CB+R.dep), Kb.enter]},
      {sel:o.CC+R.acc, keys:[...T('='+o.CB+R.acc+'+'+o.CC+R.dep), Kb.enter]},
      {sel:o.CC+R.acc, keys:[sr,sr,sr, Kb.fillR]},
      {sel:o.CA+R.end, keys:[sr,sr,sr,sr,sr, Kb.bold, Kb.alt, L('h'), L('b'), L('d')]},
    ]; }`,

  /* A4 — THICK BOX (Alt H B T) and the figures-only selection (no label), proving the dress
     beat does not depend on the label riding along (§1.0-R3(p), the label+figures ruling). */
  thickbox_figuresonly: `C => { const o=C._o, R=o.R; const sr={key:'ArrowRight',shift:true}, sd={key:'ArrowDown',shift:true};
    return [
      {sel:o.CB+R.dep, keys:[...T('=-'+o.CB+R.beg+'*$'+o.CB+'$'+R.rate), Kb.enter]},
      {sel:o.CB+R.end, keys:[...T('=SUM('+o.CB+R.beg+':'+o.CB+R.dep+')'), Kb.enter]},
      {sel:o.CC+R.beg, keys:[...T('=+'+o.CB+R.end), Kb.enter]},
      {sel:o.CC+R.beg, keys:[sr,sr,sr, Kb.fillR]},
      {sel:o.CB+R.dep, keys:[sr,sr,sr,sr, Kb.fillR]},
      {sel:o.CB+R.end, keys:[sr,sr,sr,sr, Kb.fillR]},
      {sel:o.CB+R.end, keys:[sr,sr,sr,sr, Kb.bold, Kb.alt, L('h'), L('b'), L('t')]},
      {sel:o.CB+R.acc, keys:[...T('=$'+o.CB+'$'+R.acc0+'+'+o.CB+R.dep), Kb.enter]},
      {sel:o.CC+R.acc, keys:[...T('='+o.CB+R.acc+'+'+o.CC+R.dep), Kb.enter]},
      {sel:o.CC+R.acc, keys:[sr,sr,sr, Kb.fillR]},
    ]; }`,

  /* C — THE NEGATIVE CONTROL / slowest legal route. Every later year typed by hand, the rate
     unanchored, no fill anywhere. All five cores must clear; the ☆ must stay DARK. */
  negctl_typed: `C => { const o=C._o, R=o.R; const Y=o.YC; const mv=[];
    for(let i=0;i<5;i++){ const c=Y[i], p=Y[i-1];
      if(i>0) mv.push({sel:c+R.beg, keys:[...T('='+p+R.end), Kb.enter]});
      mv.push({sel:c+R.dep, keys:[...T('=-'+c+R.beg+'*$'+o.CB+'$'+R.rate), Kb.enter]});
      mv.push({sel:c+R.end, keys:[...T('='+c+R.beg+'+'+c+R.mnt+'+'+c+R.grw+'+'+c+R.dep), Kb.enter]});
    }
    mv.push({sel:Y[0]+R.acc, keys:[...T('=$'+o.CB+'$'+R.acc0+'+'+Y[0]+R.dep), Kb.enter]});
    for(let i=1;i<5;i++) mv.push({sel:Y[i]+R.acc, keys:[...T('='+Y[i-1]+R.acc+'+'+Y[i]+R.dep), Kb.enter]});
    for(let i=0;i<5;i++) mv.push({sel:Y[i]+R.end, keys:[Kb.bold, Kb.alt, L('h'), L('b'), L('p')]});
    return mv; }`,
};

/* ── B: ☆ HALVES, each measured against its OWN slow alternative, in isolation.
   Each pair drives ONLY that half of the board and reports the keyed cost. */
const HALVES = {
  'link  · filled': `C => { const o=C._o, R=o.R; const sr={key:'ArrowRight',shift:true}; return [
      {sel:o.CC+R.beg, keys:[sr,sr,sr, Kb.fillR]} ]; }`,
  'link  · typed ': `C => { const o=C._o, R=o.R, Y=o.YC; const mv=[];
      for(let i=2;i<5;i++) mv.push({sel:Y[i]+R.beg, keys:[...T('='+Y[i-1]+R.end), Kb.enter]});
      return mv; }`,
  'roll  · one rect': `C => { const o=C._o, R=o.R; const sr={key:'ArrowRight',shift:true}, sd={key:'ArrowDown',shift:true};
      return [ {sel:o.CB+R.dep, keys:[sr,sr,sr,sr,sd, Kb.fillR]} ]; }`,
  'roll  · typed  ': `C => { const o=C._o, R=o.R, Y=o.YC; const mv=[];
      for(let i=1;i<5;i++){ const c=Y[i];
        mv.push({sel:c+R.dep, keys:[...T('=-'+c+R.beg+'*$'+o.CB+'$'+R.rate), Kb.enter]});
        mv.push({sel:c+R.end, keys:[...T('=SUM('+c+R.beg+':'+c+R.dep+')'), Kb.enter]}); }
      return mv; }`,
  'memo  · filled': `C => { const o=C._o, R=o.R; const sr={key:'ArrowRight',shift:true}; return [
      {sel:o.CC+R.acc, keys:[sr,sr,sr, Kb.fillR]} ]; }`,
  'memo  · typed ': `C => { const o=C._o, R=o.R, Y=o.YC; const mv=[];
      for(let i=2;i<5;i++) mv.push({sel:Y[i]+R.acc, keys:[...T('='+Y[i-1]+R.acc+'+'+Y[i]+R.dep), Kb.enter]});
      return mv; }`,
};

const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1'); localStorage.setItem('hk_beta_ok', '1');
    localStorage.setItem('hk_xlv', '2'); localStorage.setItem('hk_handle_cache', '{}');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  const drive = (src, full) => page.evaluate(([s, f]) => {
    try {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('schedule');
      const C = CHALLENGES.schedule;
      const moves = eval('(' + s + ')')(C);
      const k0 = keyLog.length;
      for (const mv of moves) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      const items = C.checks.call(C, S);
      return { keys: keyLog.length - k0, won: done,
               cores: items.filter(x => !x.bonus && !x.save).map(x => !!x.ok),
               star: !!(items.find(x => x.bonus) || {}).ok };
    } catch (e) { return { err: String(e).slice(0, 160) }; }
  }, [src, !!full]);

  /* The BORDER COUNTERFACTUAL, stated as a measurement instead of an assertion (r442: "a
     visual guard must assert the MEASUREMENT, never the difference"). For each border route,
     drive the dress beat alone and report which edge flags actually landed on the closing
     line, then re-grade the row under the OLD `bt`-only predicate. Alt H B A must show the
     divergence: the line is on the board, `bt` is false, so a bt-only check would strand it. */
  const borderCensus = (walk) => page.evaluate(([w]) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge('schedule');
    const C = CHALLENGES.schedule, o = C._o, R = o.R;
    const sr = { key: 'ArrowRight', shift: true };
    setDemoSel(o.CA + R.end);
    for (const k of [sr, sr, sr, sr, sr, Kb.bold]) demoKey(k);
    for (const k of eval('(' + w + ')')) demoKey(k);
    const cells = o.YC.map(c => S.cells[c + R.end] || {});
    return {
      bold: cells.every(x => !!x.bold),
      bt: cells.every(x => !!x.bt),
      ball: cells.every(x => !!x.ball),
      bb: cells.some(x => !!x.bb),
      shipped: cells.every(x => !!(x.bold && (x.bt || x.ball))),
    };
  }, [walk]);

  let fail = 0;
  const say = (ok, msg) => { if (!ok) fail++; console.log((ok ? '  ok  ' : '  FAIL') + ' ' + msg); };

  console.log('\nA · ROUTE MATRIX — every legal route driven end to end, all five cores must clear');
  const keyOf = {};
  for (const [name, src] of Object.entries(ROUTES)) {
    const rs = []; for (let i = 0; i < REPS; i++) rs.push(await drive(src));
    const err = rs.find(r => r.err);
    if (err) { say(false, name + ' — THREW: ' + err.err); continue; }
    const allCores = rs.every(r => r.cores.length === 5 && r.cores.every(Boolean));
    keyOf[name] = med(rs.map(r => r.keys));
    const stars = rs.map(r => r.star ? '*' : '.').join('');
    say(allCores, name.padEnd(22) + ' cores ' + JSON.stringify(rs[0].cores) +
      ' · keys ' + keyOf[name] + ' · ☆ ' + stars);
  }
  say(!!keyOf.negctl_typed, 'negative control ran');

  console.log('\nA2 · BORDER-ROUTE CENSUS — which edge flag each Alt H B walk really writes,');
  console.log('     and what a bt-only top-border predicate would have done with it');
  {
    const walks = {
      'Alt H B P (top)':        "[Kb.alt, L('h'), L('b'), L('p')]",
      'Alt H B D (top+bottom)': "[Kb.alt, L('h'), L('b'), L('d')]",
      'Alt H B S (outside)':    "[Kb.alt, L('h'), L('b'), L('s')]",
      'Alt H B T (thick box)':  "[Kb.alt, L('h'), L('b'), L('t')]",
      'Alt H B A (all edges)':  "[Kb.alt, L('h'), L('b'), L('a')]",
    };
    let strandedByOld = 0;
    for (const [name, w] of Object.entries(walks)) {
      const c = await borderCensus(w);
      console.log('  ..   ' + name.padEnd(24) + ' bt=' + c.bt + ' ball=' + c.ball + ' bb=' + c.bb +
        ' → shipped predicate ' + (c.shipped ? 'GREEN' : 'dark') +
        ' · bt-only predicate ' + ((c.bold && c.bt) ? 'GREEN' : 'DARK'));
      say(c.shipped, name + ' clears the shipped top-border check');
      if (c.bold && !c.bt) strandedByOld++;
    }
    say(strandedByOld === 1, 'exactly one route (All Borders) would have been stranded by a bt-only check — ' +
      'the §1.0-R3(p) bug this predicate was widened to avoid');
  }

  console.log('\nB · ☆ HALVES ISOLATED (r438 `series` rule — a combined number hides a negative half)');
  const half = {};
  for (const [name, src] of Object.entries(HALVES)) {
    const rs = []; for (let i = 0; i < REPS; i++) rs.push(await drive(src, true));
    const e = rs.find(r => r.err);
    if (e) { say(false, name + ' — THREW: ' + e.err); continue; }
    half[name] = med(rs.map(r => r.keys));
    console.log('  ..   ' + name + '  ' + String(half[name]).padStart(4) + ' keys');
  }
  for (const k of ['link ', 'roll ', 'memo ']) {
    const f = half[Object.keys(half).find(x => x.startsWith(k) && !/typed/.test(x))];
    const t = half[Object.keys(half).find(x => x.startsWith(k) && /typed/.test(x))];
    if (f == null || t == null) continue;
    say(t > f, k.trim() + ' half is POSITIVE: ' + f + ' filled vs ' + t + ' typed (saves ' + (t - f) + ')');
  }

  console.log('\nC · ☆ SKIPPABILITY (§1.0-R2(i)) — the negative control clears every core with the ☆ dark');
  {
    const rs = []; for (let i = 0; i < REPS; i++) rs.push(await drive(ROUTES.negctl_typed));
    say(rs.every(r => !r.err && r.cores.every(Boolean)), 'all five cores clear on ' + REPS + ' seeds');
    say(rs.every(r => !r.err && r.star === false), 'the ☆ stays DARK on ' + REPS + ' seeds');
  }

  console.log('\nD · ☆-HEADROOM SPREAD (DEPTH_PASS_CAMPAIGN §2)');
  {
    const fast = keyOf.taught, slow = keyOf.negctl_typed;
    if (fast && slow) console.log('  ..   fastest ' + fast + ' · slowest ' + slow +
      ' · spread ' + (slow / fast).toFixed(2) + '×');
    say(!!(fast && slow && slow / fast > 1.3), 'spread clears the ~1.3× warning line');
  }

  console.log('\nD2 · PAR FLATNESS — the shipped demo (save closer included) over 9 seeds');
  {
    const counts = [];
    for (let i = 0; i < 9; i++) counts.push(await page.evaluate(() => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('schedule');
      const C = CHALLENGES.schedule;
      for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      return { keys: keyLog.length, won: done, parKeys: C.parKeys, par: C.par };
    }));
    const ks = counts.map(c => c.keys);
    console.log('  ..   keys ' + ks.join(' ') + ' · median ' + med(ks) +
      ' · declared parKeys ' + counts[0].parKeys + ' · par ' + counts[0].par +
      ' (' + (counts[0].par / counts[0].parKeys).toFixed(2) + ' s/key)');
    say(counts.every(c => c.won), 'the demo wins on 9/9 seeds');
    say(Math.min(...ks) === Math.max(...ks), 'key count is FLAT across seeds (min ' +
      Math.min(...ks) + ', max ' + Math.max(...ks) + ')');
    say(med(ks) === counts[0].parKeys, 'parKeys matches the measured median');
  }

  console.log('\nE · §1.3 DENSITY at the WIN state + frame width');
  {
    const r = await page.evaluate(() => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('schedule');
      const C = CHALLENGES.schedule;
      for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      const rows = new Set();
      for (const k in S.cells) { const c = S.cells[k];
        if (c && (c.value !== null && c.value !== '' || c.formula)) rows.add(+k.replace(/[A-J]/g, '')); }
      const g = document.getElementById('grid'), gw = document.getElementById('gridwrap');
      let natural = 0; for (let c = 1; c <= 10; c++) natural += (S._colW && S._colW[c]) || 78;
      return { rows: [...rows].sort((a, b) => a - b), ROWS: S.ROWS, won: done,
               natural: natural, scroll: g ? g.scrollWidth : 0, box: gw ? gw.clientWidth : 0 };
    });
    console.log('  ..   rows carrying content at win: ' + r.rows.join(',') );
    const pct = Math.round(100 * r.rows.length / 20);
    say(r.ROWS === 20, 'ROWS = ' + r.ROWS + ' (§1.3 floor AND cap)');
    say(pct >= 60, 'win-state density ' + r.rows.length + '/20 = ' + pct + '% (§1.3 target ≥60%)');
    say(r.scroll <= r.box + 1, 'grid scrollWidth ' + r.scroll + 'px fits the ' + r.box + 'px box (natural ' + r.natural + 'px)');
    say(r.won, 'the demo still wins after the census');
  }

  console.log('\n' + (fail ? 'FAILURES: ' + fail : 'ALL GREEN'));
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
