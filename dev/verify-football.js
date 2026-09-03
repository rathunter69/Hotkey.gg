/* r444 — `football` depth-pass verification probe (DEPTH_PASS §4.62 + §1.0/-R2/-R3/-R4,
   dev/MODELING_STANDARDS.md, CAMPAIGN §1/§2).

   Four sections, each of which exists because reading a predicate cannot answer it:

     §A ROUTE CENSUS — every legal Excel route to every core beat, walked. CAMPAIGN §1's
        untriggerable-beat class has been found thirteen times and never once by reading code.
        The SHIPPED drill carried one: its floor/ceiling beats demanded the literal strings
        'MIN' and 'MAX' out of formula TEXT, so a correct SMALL(...,1) / LARGE(...,1) or a
        block-wide MIN left the line dark with nothing on the board to fix.
     §B ☆-HEADROOM DIAGNOSTIC, both parts (CAMPAIGN §2) — the taught route, the slowest legal
        route doing the SAME work, the freedom floor, and the ☆ ISOLATED against its own slow
        alternative. Every selection and navigation is KEYED here, so these numbers are route
        costs and not demo costs (the par sweep measures the demo, where setDemoSel is free).
     §C ☆ LEGALITY — every mechanic that reaches "one entry, one pass" must EARN it, and the
        named skip routes must leave it DARK while clearing all six cores (§1.0-R2(i):
        measured, never asserted).
     §D BOARD INVARIANTS over many seeds — the arithmetic the checks grade against is exact,
        the envelope belongs to two different methodologies, a 52-week range brackets the
        unaffected price, density, tri-length, and no column loads showing ####.

   Run: node dev/verify-football.js       (URL=<origin>/index.html for a worktree port) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = Number(process.env.SEEDS || 5);

let fails = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  /* the real harness init, mirrored exactly — a probe that skips it measures the onboarding
     overlay instead of the drill (the r440 hotkey_onboarded lesson) */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');    localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* walk a route and report: did every core beat clear, did the ☆ latch, how many keys.
     `keyed` routes drive their own navigation so the key count is honest; `sel` routes use
     the demo's free selection, which is what the par sweep measures. */
  const walk = (src) => page.evaluate(({ src }) => {
    try {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('football');
      const C = CHALLENGES.football;
      const moves = eval('(' + src + ')')(C, C._o);
      for (const mv of moves) { if (mv.sel) setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      if (!done && C.saveClose) demoKey({ key: 's', ctrl: true });
      const ck = C.checks(S);
      const core = ck.filter(x => !x.bonus);
      return { won: done, keys: keyLog.length,
        cores: core.filter(x => x.ok).length, total: core.length,
        star: !!(ck.find(x => x.bonus) || {}).ok,
        dark: core.filter(x => !x.ok).map(x => x.label.slice(0, 46)) };
    } catch (e) { return { err: String(e).slice(0, 160) }; }
  }, { src });

  const many = async (src) => {
    const out = [];
    for (let i = 0; i < SEEDS; i++) out.push(await walk(src));
    return out;
  };
  const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
  const report = async (name, src, want) => {
    const rs = await many(src);
    if (rs[0].err) return bad(name + ' — THREW ' + rs[0].err);
    const allCore = rs.every(r => r.cores === r.total);
    const stars = rs.filter(r => r.star).length;
    const keys = med(rs.map(r => r.keys));
    const line = name.padEnd(60) + ' keys≈' + String(keys).padStart(3) +
      '  cores ' + (allCore ? rs[0].total + '/' + rs[0].total : rs[0].cores + '/' + rs[0].total) +
      '  ☆ ' + stars + '/' + rs.length;
    let problem = null;
    if (want.cores === true && !allCore) problem = 'a core beat stayed DARK: ' + rs.find(r => r.cores !== r.total).dark.join(' | ');
    if (want.cores === false && allCore) problem = 'expected a dark core beat, everything cleared';
    if (want.star === true && stars !== rs.length) problem = 'the ☆ did NOT fire on every seed';
    if (want.star === false && stars !== 0) problem = 'the ☆ fired on a route that must forfeit it';
    if (problem) bad(line + '\n         ' + problem); else ok(line);
    return keys;
  };

  // ---- shared route fragments -------------------------------------------------------------
  const HDR = `(C,o)=>{
    const nav=(k,n)=>{ const a=[]; for(let i=0;i<(n||1);i++) a.push(k); return a; };
    const dn=n=>nav({key:'ArrowDown'},n), up=n=>nav({key:'ArrowUp'},n);
    const sdn=n=>nav({key:'ArrowDown',shift:true},n);
    const mid=r=>'=('+o.LL+r+'+'+o.LH+r+')/2';
    const prem=r=>'='+o.LM+r+'/$'+o.LL+'$'+o.pxR+'-1';
    const rows=o.m.map(x=>x.row);`;

  console.log('\n§A · ROUTE CENSUS — every legal route to every core beat (§1.0-R3(p))');

  await report('A1 taught: seed + ctrl+D twice, MIN/MAX, alt h b s', HDR + `
    return [
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'d',ctrl:true}]},
      {sel:o.premTop, keys:[...T(prem(o.r1)),{key:'Enter'}]},
      {sel:o.premRng, keys:[{key:'d',ctrl:true}]},
      {sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]},
      {sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }`, { cores: true, star: true });

  await report('A2 SMALL/LARGE instead of MIN/MAX (the shipped drill locked this out)', HDR + `
    return [
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'d',ctrl:true}]},
      {sel:o.premTop, keys:[...T(prem(o.r1)),{key:'Enter'}]},
      {sel:o.premRng, keys:[{key:'d',ctrl:true}]},
      {sel:o.floorK,  keys:[...T('=SMALL('+o.loRng+',1)'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=LARGE('+o.hiRng+',1)'),{key:'Enter'}]},
      {sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }`, { cores: true, star: true });

  await report('A3 MIN/MAX over the WHOLE range block, AVERAGE for the mid', HDR + `
    const blk=o.LL+o.r1+':'+o.LH+o.rN;
    return [
      {sel:o.midTop,  keys:[...T('=AVERAGE('+o.LL+o.r1+':'+o.LH+o.r1+')'),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'d',ctrl:true}]},
      {sel:o.premTop, keys:[...T('=('+o.LM+o.r1+'-$'+o.LL+'$'+o.pxR+')/$'+o.LL+'$'+o.pxR),{key:'Enter'}]},
      {sel:o.premRng, keys:[{key:'d',ctrl:true}]},
      {sel:o.floorK,  keys:[...T('=MIN('+blk+')'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=MAX('+blk+')'),{key:'Enter'}]},
      {sel:o.spreadK, keys:[...T('=MAX('+blk+')-MIN('+blk+')'),{key:'Enter'}]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }`, { cores: true, star: true });

  await report('A4 F4 locks the price cell, ribbon fills (alt h f i d), alt h b a box', HDR + `
    return [
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.premTop, keys:[...T('='+o.LM+o.r1+'/'+o.LL+o.pxR),{key:'F4'},...T('-1'),{key:'Enter'}]},
      {sel:o.premRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]},
      {sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('a')]},
    ]; }`, { cores: true, star: true });

  await report('A5 thick box (alt h b t) around the VALUE column only', HDR + `
    return [
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'d',ctrl:true}]},
      {sel:o.premTop, keys:[...T(prem(o.r1)),{key:'Enter'}]},
      {sel:o.premRng, keys:[{key:'d',ctrl:true}]},
      {sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]},
      {sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]},
      {sel:o.floorK+':'+o.spreadK, keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
    ]; }`, { cores: true, star: true });

  await report('A6 per-edge border walk (b p / b o / b l / b r)', HDR + `
    return [
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'d',ctrl:true}]},
      {sel:o.premTop, keys:[...T(prem(o.r1)),{key:'Enter'}]},
      {sel:o.premRng, keys:[{key:'d',ctrl:true}]},
      {sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]},
      {sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('o')]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('l')]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('r')]},
    ]; }`, { cores: true, star: true });

  await report('A7 op ORDER reversed — box first, spread before its own inputs', HDR + `
    return [
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
      {sel:o.spreadK, keys:[...T('=MAX('+o.hiRng+')-MIN('+o.loRng+')'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]},
      {sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]},
      {sel:o.premTop, keys:[...T('='+o.LM+o.r1+'/$'+o.LL+'$'+o.pxR+'-1'),{key:'Enter'}]},
      {sel:o.premRng, keys:[{key:'d',ctrl:true}]},
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'d',ctrl:true}]},
    ]; }`, { cores: true, star: true });

  console.log('\n§C · ☆ LEGALITY — every one-pass mechanic earns it, every skip route forfeits it');

  await report('C1 head cell COPIED and pasted over the block (S.pasteLog)', HDR + `
    return [
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'d',ctrl:true}]},
      {sel:o.premTop, keys:[...T(prem(o.r1)),{key:'Enter'}]},
      {sel:o.premTop, keys:[{key:'c',ctrl:true}]},
      {sel:o.premRng, keys:[{key:'v',ctrl:true}]},
      {sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]},
      {sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }`, { cores: true, star: true });

  await report('C2 ONE fill over BOTH computed columns at once', HDR + `
    return [
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'}]},
      {sel:o.premTop, keys:[...T(prem(o.r1)),{key:'Enter'}]},
      {sel:o.LM+o.r1+':'+o.LP+o.rN, keys:[{key:'d',ctrl:true}]},
      {sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]},
      {sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }`, { cores: true, star: true });

  await report('C3 NEGATIVE CONTROL — six premiums typed, no fill in that column', HDR + `
    const mv=[
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'d',ctrl:true}]}];
    for(const x of o.m) mv.push({sel:x.premK, keys:[...T('='+o.LM+x.row+'/$'+o.LL+'$'+o.pxR+'-1'),{key:'Enter'}]});
    mv.push({sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]});
    mv.push({sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]});
    mv.push({sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]});
    mv.push({sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('s')]});
    return mv; }`, { cores: true, star: false });

  await report('C4 UNANCHORED premium filled down — the trap: cores dark, ☆ dark', HDR + `
    return [
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'d',ctrl:true}]},
      {sel:o.premTop, keys:[...T('='+o.LM+o.r1+'/'+o.LL+o.pxR+'-1'),{key:'Enter'}]},
      {sel:o.premRng, keys:[{key:'d',ctrl:true}]},
      {sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]},
      {sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }`, { cores: false, star: false });

  console.log('\n§B · ☆-HEADROOM DIAGNOSTIC — every selection and navigation KEYED (CAMPAIGN §2)');

  const kTaught = await report('B1 fastest legal route clearing all six cores', HDR + `
    return [
      {sel:o.midTop,  keys:[...T(mid(o.r1)),{key:'Enter'},...up(1),...sdn(5),{key:'d',ctrl:true}]},
      {sel:o.premTop, keys:[...T(prem(o.r1)),{key:'Enter'},...up(1),{key:'ArrowLeft'},{key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',shift:true},{key:'d',ctrl:true}]},
      {sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'},...T('=MAX('+o.hiRng+')'),{key:'Enter'},...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'},...up(3),{key:'ArrowLeft'},...sdn(2),{key:'ArrowRight',shift:true},{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }`, { cores: true, star: true });

  const kSlow = await report('B2 slowest legal route doing the SAME work (nothing filled)', HDR + `
    const mv=[];
    for(const x of o.m) mv.push({sel:x.midK, keys:[...T(mid(x.row)),{key:'Enter'}]});
    for(const x of o.m) mv.push({sel:x.premK, keys:[...T('='+o.LM+x.row+'/$'+o.LL+'$'+o.pxR+'-1'),{key:'Enter'}]});
    mv.push({sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]});
    mv.push({sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]});
    mv.push({sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]});
    for(const e of ['p','o','l','r']) mv.push({sel:o.boxRng, keys:[{key:'Alt'},L('h'),L('b'),L(e)]});
    return mv; }`, { cores: true, star: false });

  const kStar = await report('B3 ☆ ISOLATED — the premium column from one anchored entry', HDR + `
    return [{sel:o.premTop, keys:[...T(prem(o.r1)),{key:'Enter'},...up(1),{key:'ArrowLeft'},{key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',shift:true},{key:'d',ctrl:true}]}]; }`,
    { cores: false, star: false });   // the mid column is untouched here, so cores stay dark on purpose

  const kStarSlow = await report('B4 ☆ ISOLATED, the slow half — six premiums typed', HDR + `
    const mv=[]; for(const x of o.m) mv.push({sel:x.premK, keys:[...T('='+o.LM+x.row+'/$'+o.LL+'$'+o.pxR+'-1'),{key:'Enter'}]});
    return mv; }`, { cores: false, star: false });

  console.log('\n  SPREAD  fastest ' + kTaught + ' · slowest-same-work ' + kSlow +
    ' · ratio ' + (kSlow / kTaught).toFixed(2) + '×');
  console.log('  ☆ ISOLATED  one anchored entry ' + kStar + ' keys vs ' + kStarSlow +
    ' typed — worth ' + (kStarSlow - kStar) + ' keys, ' + (kStarSlow / kStar).toFixed(2) + '× on the move itself');
  if (kSlow / kTaught < 1.3) bad('§B part 1: spread under the 1.3× warning band');
  else ok('§B part 1: spread ' + (kSlow / kTaught).toFixed(2) + '× — clear of the 1.3× warning band');
  if (kStarSlow - kStar < 8) bad('§B part 2: the ☆ move is worth fewer than 8 keys against its own alternative');
  else ok('§B part 2: the ☆ move is worth ' + (kStarSlow - kStar) + ' keys, and every key of it is fill-vs-retype on an ANCHORED reference — nothing in it is chord-vs-ribbon (forced to clear, §1.0(c)) or formatting (forbidden, §1.0(d))');

  console.log('\n§D · BOARD INVARIANTS — ' + (SEEDS * 8) + ' builds');
  const inv = await page.evaluate((N) => {
    const out = { bad: [], dens: [], sites: {}, names: {}, wide: {}, floorRow: {}, ceilRow: {} };
    for (let i = 0; i < N; i++) {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('football');
      const C = CHALLENGES.football, o = C._o;
      if (S.ROWS !== 20) out.bad.push('ROWS=' + S.ROWS);
      // exact arithmetic: the mid the checks grade IS (low+high)/2 to the cent
      for (const x of o.m) {
        if (Math.abs(x.mid - (x.lo + x.hi) / 2) > 1e-9) out.bad.push('mid not exact on ' + x.name);
        if (!(x.lo < x.hi)) out.bad.push('low >= high on ' + x.name);
        if (Math.abs(x.prem - (x.mid / o.px - 1)) > 1e-9) out.bad.push('premium not exact on ' + x.name);
      }
      // the envelope belongs to two DIFFERENT methodologies (the §1.5 aha depends on it)
      const fi = o.m.findIndex(x => x.lo === o.floor), ci = o.m.findIndex(x => x.hi === o.ceil);
      if (fi === ci) out.bad.push('floor and ceiling from the same methodology');
      if (o.m.filter(x => x.lo === o.floor).length !== 1) out.bad.push('floor not unique');
      if (o.m.filter(x => x.hi === o.ceil).length !== 1) out.bad.push('ceiling not unique');
      out.floorRow[fi] = (out.floorRow[fi] || 0) + 1; out.ceilRow[ci] = (out.ceilRow[ci] || 0) + 1;
      // a 52-week range must bracket the price the stock last closed at (§1.0-R4(t) rule 1)
      const w = o.m.find(x => x.name === '52-week trading range');
      if (w && !(w.lo < o.px && w.hi > o.px)) out.bad.push('52-week range does not bracket the unaffected price');
      // premiums readable at one decimal — no two methodologies print the same figure
      const pr = o.m.map(x => Math.round(x.prem * 1000));
      if (new Set(pr).size !== pr.length) out.bad.push('two premiums print identically');
      // tri-length (C9 reads this statically; assert it live too)
      if (!(C.guide().length === C.checks(S).length && C.checks(S).length === C.targets().length))
        out.bad.push('tri-length broken');
      if (C.checks(S).filter(x => x.bonus).length !== 1) out.bad.push('not exactly one bonus');
      // every core beat DARK at load — nothing may ship pre-cleared
      if (C.checks(S).some(x => !x.bonus && x.ok)) out.bad.push('a core beat is already green at load');
      // no column loads showing ####
      for (let c = 1; c <= 10; c++) {
        for (let r = 1; r <= S.ROWS; r++) {
          const cl = S.cells[String.fromCharCode(64 + c) + r];
          if (cl && typeof cl.value === 'number' && overflowsCol(S, c)) { out.bad.push('#### at load in column ' + c); r = 99; c = 99; }
        }
      }
      // §1.3 density at the WIN state: rows carrying content or a scripted target
      const filled = new Set();
      for (let r = 1; r <= S.ROWS; r++) for (let c = 1; c <= 10; c++) {
        const cl = S.cells[String.fromCharCode(64 + c) + r];
        if (cl && cl.value != null && cl.value !== '') filled.add(r);
      }
      o.m.forEach(x => filled.add(x.row));
      [o.fR, o.cR, o.sR].forEach(r => filled.add(r));
      out.dens.push(filled.size);
      out.sites[o.c0 + '/' + o.hr] = (out.sites[o.c0 + '/' + o.hr] || 0) + 1;
      out.names[o.m.map(x => x.name).join('|')] = 1;
      const widest = o.m.map(x => x.hi - x.lo).indexOf(Math.max.apply(null, o.m.map(x => x.hi - x.lo)));
      out.wide[widest] = (out.wide[widest] || 0) + 1;
    }
    return out;
  }, SEEDS * 8);
  if (inv.bad.length) [...new Set(inv.bad)].forEach(b => bad('D · ' + b + ' (×' + inv.bad.filter(x => x === b).length + ')'));
  else ok('D · ' + (SEEDS * 8) + ' builds: ROWS=20, mid and premium exact to the cent, envelope owned by two different methodologies, 52-week range brackets the unaffected price, six distinct premiums, tri-length held, nothing pre-cleared, no #### at load');
  const dmin = Math.min(...inv.dens), dmax = Math.max(...inv.dens);
  const dline = 'D · density ' + dmin + '–' + dmax + ' of 20 rows (' + Math.round(100 * dmin / 20) + '–' + Math.round(100 * dmax / 20) + '%) at the win state, §1.3 target ≥60%';
  if (dmin / 20 < 0.6) bad(dline); else ok(dline);
  ok('D · randomization: ' + Object.keys(inv.sites).length + ' distinct sites, ' +
    Object.keys(inv.names).length + ' distinct methodology sets, floor set by ' +
    Object.keys(inv.floorRow).length + ' different rows, ceiling by ' + Object.keys(inv.ceilRow).length +
    ', widest range on ' + Object.keys(inv.wide).length + ' different rows');

  if (errs.length) { bad('page errors: ' + [...new Set(errs)].slice(0, 3).join(' · ')); }
  console.log('\nVERIFY football: ' + (fails ? fails + ' FAILURE(S)' : 'ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
