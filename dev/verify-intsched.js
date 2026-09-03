/* r444 — DEDICATED PROBE FOR `intsched` (DEPTH_PASS §4.69 depth pass).
   Self-contained per WORKFLOW §9.1: this file names exactly one drill, so it can never trip the
   C13 retirement guard on anybody else's key.

   WHY IT EXISTS. dev/DEPTH_PASS_CAMPAIGN.md §1 is unambiguous: the untriggerable-beat class has
   been found THIRTEEN times and never once by reading a predicate — only by WALKING the routes a
   real player would take. So every claim this drill's build note makes is measured here rather
   than asserted:

     §A  ☆-HEADROOM DIAGNOSTIC (CAMPAIGN §2, both parts) — the fastest legal route's key count
         against the obvious slow route that clears the SAME six cores.
     §B  ☆ SKIPPABILITY (§1.0-R2(i)) — two named routes that clear every core with the star DARK,
         each with its key count, so "skippable" is measured and not claimed.
     §C  ROUTE ENUMERATION (§1.0-R3(p)) — every Excel route to each beat's visible end state,
         walked. A beat that only one route can reach is the defect this whole file exists for.
     §D  BOARD INTEGRITY — the r439 `cases` check (does the ☆'s fill degrade a number format?),
         plus §1.3 win-state density and a no-#### scan at load AND at the win.

   Harness init MIRRORS the real gate suites (hotkey_onboarded / hk_tour_done / hk_learn_done /
   hk_handle_cache) — the r440 note in CAMPAIGN: a probe whose init differs from the harness is
   measuring a different product, and its numbers are a lie.

   Run: node dev/verify-intsched.js          (server on 127.0.0.1:8791, or URL=… for a worktree) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '5', 10);
const KEY = 'intsched';

let fail = 0;
const bad = m => { fail++; console.log('  FAIL ' + m); };
const ok = m => console.log('  ok   ' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const perr = [];
  page.on('pageerror', e => perr.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1'); localStorage.setItem('hk_handle_cache', '');
    localStorage.setItem('hk_beta_ok', '1'); localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function'
    && typeof loadChallenge === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* Every route below is expressed as a page-side function of the drill's geometry bag, so the
     probe never hard-codes a cell address (the CAMPAIGN "parity is coupled to drill internals"
     hazard, read from the other side: a probe pinned to literal cells rots on the next reboard). */
  const ROUTES = {
    /* ── the taught route: four formulas, three fills, one dress, one decimal pass ── */
    star: `o => { const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true}; return [
      {sel:o.CB+o.rEnd, keys:[...T('=SUM('+o.CB+o.rBeg+':'+o.CB+o.rPre+')'), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[R,R,R, Kb.fillR]},
      {sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.fillR]},
      {sel:o.CA+o.rEnd, keys:[R,R,R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      {sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[Kb.alt, L('h'), D(9)]},
      {sel:o.CB+o.rInt, keys:[R,R,R,R, DN, Kb.fillR]},
    ]; }`,

    /* ── §B control 1: the NATURAL FILLER. Everything the star route does, except the two P&L
       feeds are filled one row at a time. Six cores clear, the ☆ must stay dark. ── */
    twoFills: `o => { const R={key:'ArrowRight',shift:true}; return [
      {sel:o.CB+o.rEnd, keys:[...T('=SUM('+o.CB+o.rBeg+':'+o.CB+o.rPre+')'), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[R,R,R, Kb.fillR]},
      {sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.fillR]},
      {sel:o.CA+o.rEnd, keys:[R,R,R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      {sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[Kb.alt, L('h'), D(9)]},
      {sel:o.CB+o.rInt, keys:[R,R,R,R, Kb.fillR]},
      {sel:o.CB+o.rCov, keys:[R,R,R,R, Kb.fillR]},
    ]; }`,

    /* ── §A / §B control 2: THE SLOW ROUTE. Every year of every built line typed out, no fill
       anywhere, the dress walked off the ribbon, the decimals stepped cell by cell. It is the
       route the clock exists to charge for, and it clears all six cores with the ☆ dark. ── */
    slow: `o => { const st=[]; const C=o.cols;
      for(let i=0;i<5;i++) st.push({sel:C[i]+o.rEnd, keys:[...T('=SUM('+C[i]+o.rBeg+':'+C[i]+o.rPre+')'), Kb.enter]});
      for(let i=1;i<5;i++) st.push({sel:C[i]+o.rBeg, keys:[...T('='+C[i-1]+o.rEnd), Kb.enter]});
      st.push({sel:o.CA+o.rEnd, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true}, Kb.alt, L('h'), D(1), Kb.alt, L('h'), L('b'), L('p')]});
      for(let i=0;i<5;i++) st.push({sel:C[i]+o.rInt, keys:[...T('='+C[i]+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]});
      for(let i=0;i<5;i++) st.push({sel:C[i]+o.rCov, keys:[...T('='+C[i]+o.rEbit+'/'+C[i]+o.rInt), Kb.enter]});
      for(let i=0;i<5;i++) st.push({sel:C[i]+o.rCov, keys:[Kb.alt, L('h'), D(9)]});
      return st; }`,

    /* ── §C route probes. Each rebuilds ONE beat by a different legal Excel route and leaves the
       rest of the board on the taught route, so a red line names exactly one beat. ── */
    autosum: `o => { const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true}; return [
      /* beat 1 by AutoSum from a selection that runs through the empty ending cell, not by a
         typed SUM — the route the old text-grading predicate locked out */
      {sel:o.CB+o.rBeg, keys:[DN,DN,DN, Kb.eq]},
      {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[R,R,R, Kb.fillR]},
      {sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.fillR]},
      {sel:o.CA+o.rEnd, keys:[R,R,R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      {sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[Kb.alt, L('h'), D(9)]},
      {sel:o.CB+o.rInt, keys:[R,R,R,R, DN, Kb.fillR]},
    ]; }`,

    addChain: `o => { const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true}; return [
      /* beat 1 as an addition chain instead of a SUM; beat 2 by RE-DERIVING the opening
         (=beg+amort+prepay of the prior column) instead of pointing at the prior ending — the
         exact route the old refs() link predicate rejected on a correct board */
      {sel:o.CB+o.rEnd, keys:[...T('='+o.CB+o.rBeg+'+'+o.CB+o.rAmrt+'+'+o.CB+o.rPre), Kb.enter]},
      {sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.fillR]},
      {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rBeg+'+'+o.CB+o.rAmrt+'+'+o.CB+o.rPre), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[R,R,R, Kb.fillR]},
      {sel:o.CA+o.rEnd, keys:[R,R,R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      {sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[Kb.alt, L('h'), D(9)]},
      {sel:o.CB+o.rInt, keys:[R,R,R,R, DN, Kb.fillR]},
    ]; }`,

    distributed: `o => { const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true}; return [
      {sel:o.CB+o.rEnd, keys:[...T('=SUM('+o.CB+o.rBeg+':'+o.CB+o.rPre+')'), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[R,R,R, Kb.fillR]},
      {sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.fillR]},
      {sel:o.CA+o.rEnd, keys:[R,R,R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      /* beat 4 with the multiplication DISTRIBUTED over the two rate cells and the operands
         reversed — a different float path to the same visible number (the tolerance note in
         checks() exists for exactly this), and an operand order the old text scan rejected */
      {sel:o.CB+o.rInt, keys:[...T('=$'+o.CB+'$'+o.rRate+'*'+o.CB+o.rBeg+'+$'+o.CB+'$'+o.rSprd+'*'+o.CB+o.rBeg), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[Kb.alt, L('h'), D(9)]},
      {sel:o.CB+o.rInt, keys:[R,R,R,R, DN, Kb.fillR]},
    ]; }`,

    ribbonDress: `o => { const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true}; return [
      {sel:o.CB+o.rEnd, keys:[...T('=SUM('+o.CB+o.rBeg+':'+o.CB+o.rPre+')'), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[R,R,R, Kb.fillR]},
      {sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.fillR]},
      /* beat 3 the other way round: figures ONLY (no label column), bold off the ribbon, and the
         top rule drawn by the OUTSIDE-border walk Alt H B S rather than Alt H B P (§1.0-R2(m)) */
      {sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.alt, L('h'), D(1), Kb.alt, L('h'), L('b'), L('s')]},
      {sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt), Kb.enter]},
      /* beat 6 by the ABSOLUTE route: Ctrl+1 → X sets the multiple format at one place outright */
      {sel:o.CB+o.rCov, keys:[{key:'1',ctrl:true}, L('x')]},
      {sel:o.CB+o.rInt, keys:[R,R,R,R, DN, Kb.fillR]},
    ]; }`,

    allBorders: `o => { const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true}; return [
      {sel:o.CB+o.rEnd, keys:[...T('=SUM('+o.CB+o.rBeg+':'+o.CB+o.rPre+')'), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[R,R,R, Kb.fillR]},
      {sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.fillR]},
      /* beat 3 with ALL borders (Alt H B A → ball) and the THICK box on top of it — both draw
         the line above the total, so both must clear */
      {sel:o.CA+o.rEnd, keys:[R,R,R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('a')]},
      {sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[Kb.alt, L('h'), D(9)]},
      {sel:o.CB+o.rInt, keys:[R,R,R,R, DN, Kb.fillR]},
    ]; }`,

    ribbonFill: `o => { const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true}; return [
      /* every fill off the RIBBON (Alt H F I R) instead of Ctrl+R — same latch, so the ☆ must
         still fire (§1.0(c): no route is penalised) */
      {sel:o.CB+o.rEnd, keys:[...T('=SUM('+o.CB+o.rBeg+':'+o.CB+o.rPre+')'), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[R,R,R, Kb.alt, L('h'), L('f'), L('i'), L('r')]},
      {sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.alt, L('h'), L('f'), L('i'), L('r')]},
      {sel:o.CA+o.rEnd, keys:[R,R,R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      {sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[Kb.alt, L('h'), D(9)]},
      {sel:o.CB+o.rInt, keys:[R,R,R,R, DN, Kb.alt, L('h'), L('f'), L('i'), L('r')]},
    ]; }`,

    typedConstant: `o => { const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true}; return [
      /* NEGATIVE CONTROL for the doctrine §2.2 liveness exception: the ending line typed as
         CONSTANTS (the right numbers, dead cells). Beat 1 must NOT clear — a hardcoded roll is
         the junior error MODELING_STANDARDS §3 names, and "Build" means a live line. */
      {sel:o.cols[0]+o.rEnd, keys:[...T(String(o.exp[0].end)), Kb.enter]},
      {sel:o.cols[1]+o.rEnd, keys:[...T(String(o.exp[1].end)), Kb.enter]},
      {sel:o.cols[2]+o.rEnd, keys:[...T(String(o.exp[2].end)), Kb.enter]},
      {sel:o.cols[3]+o.rEnd, keys:[...T(String(o.exp[3].end)), Kb.enter]},
      {sel:o.cols[4]+o.rEnd, keys:[...T(String(o.exp[4].end)), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[R,R,R, Kb.fillR]},
      {sel:o.CA+o.rEnd, keys:[R,R,R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      {sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[Kb.alt, L('h'), D(9)]},
      {sel:o.CB+o.rInt, keys:[R,R,R,R, DN, Kb.fillR]},
    ]; }`,

    /* ── §B control 3: THE ☆'s OWN MOVE, ISOLATED (the r438 `series` rule — never measure a star
       as part of a bundle). Identical to the taught route everywhere EXCEPT the star's own work:
       the four remaining years of both P&L feeds are typed out instead of filled. ── */
    typedFeeds: `o => { const R={key:'ArrowRight',shift:true}; const st=[]; const C=o.cols;
      st.push({sel:o.CB+o.rEnd, keys:[...T('=SUM('+o.CB+o.rBeg+':'+o.CB+o.rPre+')'), Kb.enter]});
      st.push({sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd), Kb.enter]});
      st.push({sel:o.CC+o.rBeg, keys:[R,R,R, Kb.fillR]});
      st.push({sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.fillR]});
      st.push({sel:o.CA+o.rEnd, keys:[R,R,R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]});
      for(let i=0;i<5;i++) st.push({sel:C[i]+o.rInt, keys:[...T('='+C[i]+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]});
      for(let i=0;i<5;i++) st.push({sel:C[i]+o.rCov, keys:[...T('='+C[i]+o.rEbit+'/'+C[i]+o.rInt), Kb.enter]});
      st.push({sel:o.CB+o.rCov, keys:[R,R,R,R, Kb.alt, L('h'), D(9)]});
      return st; }`,

    bottomRule: `o => { const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true}; return [
      /* NEGATIVE CONTROL for §1.0(f): a rule UNDERNEATH the total (Alt H B O) must NOT clear the
         dress beat — a total earns the line above it, never below. */
      {sel:o.CB+o.rEnd, keys:[...T('=SUM('+o.CB+o.rBeg+':'+o.CB+o.rPre+')'), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd), Kb.enter]},
      {sel:o.CC+o.rBeg, keys:[R,R,R, Kb.fillR]},
      {sel:o.CB+o.rEnd, keys:[R,R,R,R, Kb.fillR]},
      {sel:o.CA+o.rEnd, keys:[R,R,R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('o')]},
      {sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt), Kb.enter]},
      {sel:o.CB+o.rCov, keys:[Kb.alt, L('h'), D(9)]},
      {sel:o.CB+o.rInt, keys:[R,R,R,R, DN, Kb.fillR]},
    ]; }`,
  };

  /* one seeded run of one route; returns the win flag, the key count, the per-check state, and
     — for §D — the coverage row's number format after the run. */
  const run = (route, save) => page.evaluate(({ k, src, save }) => {
    try {
      try { window.__hkCelQ = []; } catch (e) {}
      document.querySelectorAll('.hk-cel-wrap').forEach(n => { try { n.click(); } catch (e) {} n.remove(); });
      document.querySelectorAll('.wb-dlg').forEach(n => n.remove());
      loadChallenge(k);
      const C = CHALLENGES[k], o = C._o;
      for (const mv of eval('(' + src + ')')(o)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      if (save && !done && C.saveClose) demoKey({ key: 's', ctrl: true });
      const res = C.checks(S).map(x => ({ label: x.label, ok: !!x.ok, bonus: !!x.bonus }));
      const covFmt = o.cols.map(c => { const x = S.cells[c + o.rCov] || {}; return x.fmtStyle + '@' + x.decimals; });
      const intFmt = o.cols.map(c => { const x = S.cells[c + o.rInt] || {}; return x.fmtStyle + '@' + x.decimals; });
      return { won: !!done, keys: keyLog.length, res, covFmt, intFmt };
    } catch (e) { return { err: String(e && e.message || e).slice(0, 160) }; }
  }, { k: KEY, src: route, save });

  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const summarise = async (name, route, { save = true } = {}) => {
    const keys = [], cores = [], stars = [], fmts = new Set();
    for (let i = 0; i < SEEDS; i++) {
      const r = await run(route, save);
      if (r.err) { bad(name + ': THREW ' + r.err); return null; }
      keys.push(r.keys);
      cores.push(r.res.filter(x => !x.bonus).every(x => x.ok));
      stars.push(r.res.some(x => x.bonus && x.ok));
      r.covFmt.forEach(f => fmts.add('cov:' + f)); r.intFmt.forEach(f => fmts.add('int:' + f));
    }
    return { name, keys: med(keys), all: keys, cores: cores.every(Boolean), star: stars.every(Boolean),
             starAny: stars.some(Boolean), fmts: [...fmts] };
  };

  console.log('\n=== intsched probe · ' + SEEDS + ' seeds per route · ' + URL + ' ===');

  /* ── §A ☆-HEADROOM DIAGNOSTIC ─────────────────────────────────────────────────────── */
  console.log('\n§A  ☆-HEADROOM DIAGNOSTIC (CAMPAIGN §2)');
  const star = await summarise('taught route', ROUTES.star);
  const slow = await summarise('slow route', ROUTES.slow);
  if (star && slow) {
    console.log('     taught route ' + star.keys + ' keys ' + JSON.stringify(star.all));
    console.log('     slow route   ' + slow.keys + ' keys ' + JSON.stringify(slow.all));
    const spread = slow.keys / star.keys;
    console.log('     spread ' + spread.toFixed(2) + '×');
    if (!star.cores) bad('§A the taught route does not clear every core');
    else if (!star.star) bad('§A the taught route does not earn the ☆');
    else if (!slow.cores) bad('§A the slow route does not clear every core — it is not a legal route');
    else if (spread < 1.3) bad('§A spread ' + spread.toFixed(2) + '× is below the 1.3× warning line (CAMPAIGN §2)');
    else ok('§A spread ' + spread.toFixed(2) + '× · both routes clear all six cores · the taught route earns the ☆');
  }

  /* ── §B ☆ SKIPPABILITY ────────────────────────────────────────────────────────────── */
  console.log('\n§B  ☆ SKIPPABILITY (§1.0-R2(i)) — measured, not asserted');
  const two = await summarise('two separate fills', ROUTES.twoFills);
  if (two) {
    console.log('     two separate fills ' + two.keys + ' keys · cores ' + two.cores + ' · ☆ ' + two.starAny);
    if (!two.cores) bad('§B the natural-filler route does not clear every core');
    else if (two.starAny) bad('§B the ☆ fires on the two-fill route — it is not a distinct decision');
    else ok('§B natural filler: all six cores green, ☆ DARK (' + two.keys + ' keys vs the star route\'s ' + star.keys + ')');
  }
  if (slow) {
    if (slow.starAny) bad('§B the ☆ fires on the fully typed route — it cannot be a fill discovery');
    else ok('§B fully typed: all six cores green, ☆ DARK (' + slow.keys + ' keys)');
  }
  const tf = await summarise('☆ work typed out', ROUTES.typedFeeds);
  if (tf) {
    console.log('     ☆ move isolated (r438): the eight feed cells TYPED ' + tf.keys + ' keys · cores ' + tf.cores + ' · ☆ ' + tf.starAny);
    if (!tf.cores) bad('§B the isolated control does not clear every core');
    else if (tf.starAny) bad('§B the ☆ fires with the feeds typed out — the latch is not reading the fill');
    else ok('§B ☆ isolated: ' + (tf.keys - star.keys) + ' keys of value against typing the same work, all six cores green, ☆ DARK');
  }

  /* ── §C ROUTE ENUMERATION ─────────────────────────────────────────────────────────── */
  console.log('\n§C  ROUTE ENUMERATION (§1.0-R3(p)) — every route walked, never reasoned about');
  const mustWin = [
    ['autosum      · beat 1 by Alt+= over the block', ROUTES.autosum],
    ['addChain     · beat 1 as an addition chain, beat 2 re-derived not linked', ROUTES.addChain],
    ['distributed  · beat 4 distributed over both rate cells, operands reversed', ROUTES.distributed],
    ['ribbonDress  · beat 3 figures-only + Alt H 1 + Alt H B S, beat 6 by Ctrl+1 X', ROUTES.ribbonDress],
    ['allBorders   · beat 3 by Alt H B A (ball, not bt)', ROUTES.allBorders],
    ['ribbonFill   · every fill off Alt H F I R, ☆ included', ROUTES.ribbonFill],
  ];
  for (const [name, src] of mustWin) {
    const r = await summarise(name, src);
    if (!r) continue;
    if (!r.cores) {
      const one = await run(src, true);
      bad('§C ' + name + ' — cores RED: ' + (one.res || []).filter(x => !x.ok && !x.bonus).map(x => x.label).join(' | '));
    } else ok('§C ' + name + ' → all six cores green' + (r.star ? ' · ☆ earned' : ' · ☆ dark'));
  }
  if (star && !(await summarise('ribbonFill☆', ROUTES.ribbonFill)).star)
    bad('§C the ribbon fill Alt H F I R does not earn the ☆ — the latch is chord-specific');

  console.log('\n§C  NEGATIVE CONTROLS — routes that MUST leave a beat dark');
  const mustFail = [
    ['typedConstant · the ending line typed as constants', ROUTES.typedConstant, 0],
    ['bottomRule    · a rule UNDER the total (Alt H B O)', ROUTES.bottomRule, 2],
  ];
  for (const [name, src, idx] of mustFail) {
    const r = await run(src, true);
    if (r.err) { bad('§C ' + name + ': THREW ' + r.err); continue; }
    if (r.res[idx].ok) bad('§C ' + name + ' — beat ' + (idx + 1) + ' cleared and should not have: "' + r.res[idx].label + '"');
    else ok('§C ' + name + ' → beat ' + (idx + 1) + ' correctly DARK');
  }

  /* ── §D BOARD INTEGRITY ───────────────────────────────────────────────────────────── */
  console.log('\n§D  BOARD INTEGRITY');
  if (star) {
    /* r444 probe-defect note (CAMPAIGN "suspect the probe before the product"): the first cut of
       this filter compared the PREFIXED token against a bare format string, so it reported every
       correct cell as a degradation. Caught because the failure message printed the two formats
       the board is supposed to have. */
    const wrongCov = star.fmts.filter(f => f.startsWith('cov:') && f !== 'cov:mult@1');
    const wrongInt = star.fmts.filter(f => f.startsWith('int:') && f !== 'int:comma@0');
    if (wrongCov.length || wrongInt.length)
      bad('§D the ☆ fill degrades a number format (r439 `cases`): ' + wrongCov.concat(wrongInt).join(', '));
    else ok('§D the ☆ fill leaves every coverage cell mult@1 and every interest cell comma@0 — no degradation');
  }
  const board = await page.evaluate(({ k }) => {
    const out = [];
    for (let s = 0; s < 5; s++) {
      loadChallenge(k);
      const C = CHALLENGES[k], o = C._o;
      const rowsUsed = new Set();
      for (const key of Object.keys(S.cells)) {
        const c = S.cells[key];
        if (c && (c.value !== null || c.formula)) rowsUsed.add(parseInt(key.slice(1), 10));
      }
      /* rows that are BLANK at load but are a graded destination count as scripted purpose */
      [o.rEnd, o.rBeg, o.rInt, o.rCov].forEach(r => rowsUsed.add(r));
      const loadBad = [];
      for (let c = 1; c <= 10; c++) if (typeof overflowsCol === 'function' && overflowsCol(S, c)) loadBad.push(c);
      out.push({ rows: S.ROWS, used: rowsUsed.size, loadBad, cols: o.cols.length });
    }
    return out;
  }, { k: KEY });
  const dens = board.map(b => b.used / b.rows);
  const minD = Math.min(...dens);
  if (board.some(b => b.rows !== 20)) bad('§D ROWS is not 20 on every seed (§1.3 floor AND cap)');
  else if (minD < 0.6) bad('§D win-state density ' + (100 * minD).toFixed(0) + '% is under the §1.3 60% target');
  else ok('§D ROWS=20 on every seed · win-state density ' + (100 * minD).toFixed(0) + '% (' + board[0].used + '/20)');
  if (board.some(b => b.loadBad.length)) bad('§D a column loads showing #### : ' + JSON.stringify(board.map(b => b.loadBad)));
  else ok('§D no column overflows at load on any seed');

  const winFit = await page.evaluate(({ k, src }) => {
    loadChallenge(k);
    const C = CHALLENGES[k], o = C._o;
    for (const mv of eval('(' + src + ')')(o)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
    if (!done && C.saveClose) demoKey({ key: 's', ctrl: true });
    const over = [];
    for (let c = 1; c <= 10; c++) if (typeof overflowsCol === 'function' && overflowsCol(S, c)) over.push(c);
    return over;
  }, { k: KEY, src: ROUTES.star });
  if (winFit.length) bad('§D a column shows #### at the WIN state: ' + JSON.stringify(winFit));
  else ok('§D no column overflows at the win state');

  if (perr.length) { bad('PAGE ERRORS: ' + [...new Set(perr)].slice(0, 3).join(' | ')); }
  console.log('\nintsched probe: ' + (fail ? fail + ' FAILURE(S)' : 'ALL GREEN'));
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
