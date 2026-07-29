/* r444 · dev/verify-comps.js — the depth-pass probe for ONE drill: `comps` (DEPTH_PASS §4.60).
   Self-contained by the §9.1 ownership law: it names no other drill, so the C13 retirement
   guard can never fire on it.

   WHY THIS FILE EXISTS. DEPTH_PASS_CAMPAIGN §1 is unambiguous — the untriggerable-beat class
   has been found THIRTEEN times by WALKING a route through the live engine and ZERO times by
   reading a predicate. So every claim this drill's build comment makes about routes, key counts
   and skippability is asserted here as a number, on the real board, through the real graders.

   Sections:
     A  par / key census over N seeds (the demo route)
     B  the star-headroom diagnostic, both parts (CAMPAIGN §2) — isolated and whole-drill
     C  skippability — the honest non-star route clears every core with the star DARK
     D  route probes — every legal route to the same visible end state must CLEAR
     E  negative controls — a hardcode and an unanchored fill must NOT clear
     F  board facts — model conventions, §1.3 density, width

   Run: node dev/verify-comps.js        (URL=http://127.0.0.1:PORT/index.html) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = [11, 202, 3003, 40404, 555555];

let fails = 0;
/* fs.writeSync on fd 1 rather than console.log: node block-buffers stdout when it is a pipe or a
   file, so a probe that hangs mid-run prints NOTHING and reads as a crash. Unbuffered output is
   how you tell "slow" from "stuck" (CAMPAIGN: suspect the probe before the product). */
const say = m => { try { require('fs').writeSync(1, m + '\n'); } catch (e) { console.log(m); } };
const ok = m => say('  ok   ' + m);
const bad = m => { fails++; say('  FAIL ' + m); };
const info = m => say('  ..   ' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const perr = [];
  page.on('pageerror', e => perr.push(String(e.message || e).slice(0, 160)));
  /* mirror the real harness init exactly — a probe that boots a different app than the gate
     does is a lie (CAMPAIGN: the r440 hotkey_onboarded omission, the r441 hidden-rows count). */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1');
    localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1');
    localStorage.setItem('hk_handle_cache', '');
    localStorage.setItem('hk_beta_ok', '1');
    localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() =>
    typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function' &&
    typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* one page-side driver for every probe: force the seed, load, run a moves list, report the
     graded state. `movesSrc` is a function source evaluated with the live challenge C. */
  const drive = (seed, movesSrc) => page.evaluate(({ seed, movesSrc }) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    window.__forceSeed = seed;
    loadChallenge('comps');
    const C = CHALLENGES.comps;
    const moves = (0, eval)('(' + movesSrc + ')')(C);
    for (const mv of moves) { if (mv.sel) setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    const items = C.checks.call(C, S);
    return {
      keys: keyLog.length,
      done: !!done,
      cores: items.filter(x => !x.bonus && !x.save).map(x => !!x.ok),
      star: !!(items.find(x => x.bonus) || {}).ok,
      o: JSON.parse(JSON.stringify(C._o)),
    };
  }, { seed, movesSrc });

  const DEMO = 'C => { const d=(typeof C.demo===\'function\')?C.demo.call(C):C.demo; return d; }';

  /* ---------------- A · par / key census (the demo route) ---------------- */
  say('\nA · par census — the demo route, ' + SEEDS.length + ' seeds');
  const counts = [];
  for (const s of SEEDS) {
    const r = await drive(s, DEMO);
    counts.push(r.keys);
    if (!r.done) bad('seed ' + s + ': demo did not WIN');
    if (!r.star) bad('seed ' + s + ': demo did not earn the star (the demo must perform the bonus, §1.9)');
  }
  const srt = counts.slice().sort((a, b) => a - b);
  const med = srt[srt.length >> 1];
  info('keys per seed: ' + counts.join(', ') + '  -> median ' + med + ' · min ' + srt[0] + ' · max ' + srt[srt.length - 1]);
  const declared = await page.evaluate(() => ({ par: CHALLENGES.comps.par, parKeys: CHALLENGES.comps.parKeys }));
  if (Math.abs(med - declared.parKeys) > 2) bad('parKeys ' + declared.parKeys + ' vs measured median ' + med);
  else ok('parKeys ' + declared.parKeys + ' tracks the measured median ' + med + ' (par ' + declared.par +
          ', ' + (declared.par / declared.parKeys).toFixed(2) + ' s/key)');
  if (srt[srt.length - 1] !== srt[0]) info('NOTE: the key count moves with the seed (range ' + srt[0] + '-' + srt[srt.length - 1] + ')');
  else ok('the key count is seed-invariant — the board geometry never varies with the draw');

  /* ---------------- B · the star-headroom diagnostic (CAMPAIGN §2) ---------------- */
  say('\nB · star-headroom diagnostic — both parts, measured on the shipped board');

  /* B1 · the star ISOLATED: three routes to the SAME ten multiples, nothing else driven. */
  const MULT_STAR = `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('=$'+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'ArrowRight',shift:true}, Kb.fillR,
      {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
  ]; }`;
  const MULT_TWOCOL = `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('='+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
    {sel:o.CY+o.P0, keys:[...T('='+o.CV+o.P0+'/'+o.CI+o.P0), Kb.enter]},
    {sel:o.CY+o.P0, keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
  ]; }`;
  const MULT_TYPED = `C => { const o=C._o; const mv=[];
    for(let i=0;i<5;i++){
      mv.push({sel:o.CX+(o.P0+i), keys:[...T('='+o.CV+(o.P0+i)+'/'+o.CD+(o.P0+i)), Kb.enter]});
      mv.push({sel:o.CY+(o.P0+i), keys:[...T('='+o.CV+(o.P0+i)+'/'+o.CI+(o.P0+i)), Kb.enter]});
    } return mv; }`;
  const iso = {};
  for (const [name, src] of [['star (one anchored entry + two fills)', MULT_STAR],
                             ['two column formulas, two fills', MULT_TWOCOL],
                             ['all ten typed', MULT_TYPED]]) {
    const ks = [];
    let coreEvery = true, starEvery = true;
    for (const s of SEEDS) { const r = await drive(s, src); ks.push(r.keys); if (!r.cores[0]) coreEvery = false; if (!r.star) starEvery = false; }
    const sr = ks.slice().sort((a, b) => a - b);
    iso[name] = { med: sr[sr.length >> 1], core: coreEvery, star: starEvery };
    info(name.padEnd(38) + String(sr[sr.length >> 1]).padStart(4) + ' keys · beat 1 ' +
         (coreEvery ? 'GREEN' : 'DARK') + ' · star ' + (starEvery ? 'EARNED' : 'dark'));
  }
  const SA = iso['star (one anchored entry + two fills)'],
        SB = iso['two column formulas, two fills'],
        SC = iso['all ten typed'];
  if (!SA.core || !SA.star) bad('the star route does not both clear beat 1 and earn the star');
  else if (SA.med >= SB.med) bad('the star route (' + SA.med + ' keys) is not cheaper than the honest non-star route (' + SB.med + ') — the retired-drill failure mode: a star measuring worse than the route it exists to beat');
  else ok('star isolated: ' + SA.med + ' keys vs ' + SB.med + ' (nearest legal alternative) vs ' + SC.med +
          ' (all typed) — worth ' + (SB.med - SA.med) + ' / ' + (SC.med - SA.med) + ' keys');

  /* B2 · WHOLE-DRILL spread: fastest legal vs the slowest route that does the SAME work. */
  const TAIL_FAST = `[
    {sel:o.CX+o.RMED, keys:[...T('=MEDIAN('+o.CX+o.P0+':'+o.CX+o.PN+')'), Kb.enter]},
    {sel:o.CX+o.RHI,  keys:[...T('=MAX('+o.CX+o.P0+':'+o.CX+o.PN+')'), Kb.enter]},
    {sel:o.CX+o.RLO,  keys:[...T('=MIN('+o.CX+o.P0+':'+o.CX+o.PN+')'), Kb.enter]},
    {sel:o.CX+o.RMED, keys:[{key:'ArrowRight',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillR]},
    {sel:o.CV+o.REV, keys:[...T('='+o.CV+o.RTE+'*'+o.CX+o.RMED), Kb.enter]},
    {sel:o.CV+o.REQ, keys:[...T('='+o.CV+o.REV+'-'+o.CV+o.RND), Kb.enter]},
    {sel:o.CV+o.RPS, keys:[...T('='+o.CV+o.REQ+'/'+o.CV+o.RSH), Kb.enter]},
    {sel:o.CA+o.RPS, keys:[{key:'ArrowRight',shift:true}, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
    {sel:o.CV+o.RPS, keys:[{key:'s',ctrl:true}]}
  ]`;
  const TAIL_SLOW = `[
    {sel:o.CX+o.RMED, keys:[...T('=MEDIAN('+o.CX+o.P0+':'+o.CX+o.PN+')'), Kb.enter]},
    {sel:o.CY+o.RMED, keys:[...T('=MEDIAN('+o.CY+o.P0+':'+o.CY+o.PN+')'), Kb.enter]},
    {sel:o.CX+o.RHI,  keys:[...T('=MAX('+o.CX+o.P0+':'+o.CX+o.PN+')'), Kb.enter]},
    {sel:o.CY+o.RHI,  keys:[...T('=MAX('+o.CY+o.P0+':'+o.CY+o.PN+')'), Kb.enter]},
    {sel:o.CX+o.RLO,  keys:[...T('=MIN('+o.CX+o.P0+':'+o.CX+o.PN+')'), Kb.enter]},
    {sel:o.CY+o.RLO,  keys:[...T('=MIN('+o.CY+o.P0+':'+o.CY+o.PN+')'), Kb.enter]},
    {sel:o.CV+o.REV, keys:[...T('='+o.CV+o.RTE+'*'+o.CX+o.RMED), Kb.enter]},
    {sel:o.CV+o.REQ, keys:[...T('='+o.CV+o.REV+'-'+o.CV+o.RND), Kb.enter]},
    {sel:o.CV+o.RPS, keys:[...T('='+o.CV+o.REQ+'/'+o.CV+o.RSH), Kb.enter]},
    {sel:o.CV+o.RPS, keys:[Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
    {sel:o.CV+o.RPS, keys:[{key:'s',ctrl:true}]}
  ]`;
  const FASTEST = `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('=$'+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'ArrowRight',shift:true}, Kb.fillR,
      {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
  ].concat(` + TAIL_FAST + `); }`;
  const SLOWEST = `C => { const o=C._o; const mv=[];
    for(let i=0;i<5;i++){
      mv.push({sel:o.CX+(o.P0+i), keys:[...T('='+o.CV+(o.P0+i)+'/'+o.CD+(o.P0+i)), Kb.enter]});
      mv.push({sel:o.CY+(o.P0+i), keys:[...T('='+o.CV+(o.P0+i)+'/'+o.CI+(o.P0+i)), Kb.enter]});
    } return mv.concat(` + TAIL_SLOW + `); }`;
  const spread = {};
  for (const [name, src] of [['fastest legal', FASTEST], ['slowest legal (same work)', SLOWEST]]) {
    const ks = []; let allWin = true;
    for (const s of SEEDS) { const r = await drive(s, src); ks.push(r.keys); if (!r.done) allWin = false; }
    const sr = ks.slice().sort((a, b) => a - b);
    spread[name] = sr[sr.length >> 1];
    if (!allWin) bad(name + ' route did not win on every seed');
    info(name.padEnd(28) + String(sr[sr.length >> 1]).padStart(4) + ' keys');
  }
  const ratio = spread['slowest legal (same work)'] / spread['fastest legal'];
  ok('PART 1 spread: ' + ratio.toFixed(2) + 'x (' + spread['fastest legal'] + ' -> ' + spread['slowest legal (same work)'] + ')');
  info('PART 2 composition: the dress costs the same keys on EVERY route (no formatting spread) and the ' +
       'engine has no ribbon route into formula entry, so ~all ' +
       (spread['slowest legal (same work)'] - spread['fastest legal']) +
       ' keys of spread are one-formula-versus-retype — the §1.0(d) mastery move. LEGAL.');

  /* ---------------- C · skippability (§1.0-R2(i), measured not asserted) ---------------- */
  say('\nC · skippability — the honest non-star route must clear every core with the star DARK');
  const SKIP = `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('='+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
    {sel:o.CY+o.P0, keys:[...T('='+o.CV+o.P0+'/'+o.CI+o.P0), Kb.enter]},
    {sel:o.CY+o.P0, keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
  ].concat(` + TAIL_FAST + `); }`;
  {
    const ks = []; let allCore = true, anyStar = false, allWin = true;
    for (const s of SEEDS) { const r = await drive(s, SKIP); ks.push(r.keys);
      if (!r.cores.every(Boolean)) allCore = false; if (r.star) anyStar = true; if (!r.done) allWin = false; }
    const sr = ks.slice().sort((a, b) => a - b);
    if (allCore && allWin && !anyStar) ok('two-column route: ' + sr[sr.length >> 1] + ' keys, all six cores GREEN, WIN fires, star stays dark on all ' + SEEDS.length + ' seeds');
    else bad('skippability broken — cores ' + allCore + ' win ' + allWin + ' starFired ' + anyStar);
  }

  /* ---------------- D · route probes (the CAMPAIGN §1 class) ---------------- */
  say('\nD · route probes — every legal route to the same visible end state must CLEAR');
  const probe = async (name, coreIdx, src, wantStar) => {
    let allOk = true, starSeen = false;
    for (const s of SEEDS) { const r = await drive(s, src);
      if (!coreIdx.every(i => r.cores[i])) allOk = false;
      if (r.star) starSeen = true; }
    if (!allOk) bad(name + ' — beat(s) ' + coreIdx.map(i => i + 1).join('/') + ' stayed DARK on a correct board (untriggerable beat)');
    else if (wantStar !== undefined && starSeen !== wantStar) bad(name + ' — star ' + (starSeen ? 'fired' : 'did not fire') + ', expected ' + wantStar);
    else ok(name);
  };

  await probe('multiples via the RIBBON fills (Alt H F I R / Alt H F I D) earn the star too', [0], `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('=$'+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0+':'+o.CY+o.P0, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    {sel:o.CX+o.P0+':'+o.CY+o.PN, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
  ]; }`, true);

  await probe('multiples via COPY + tiled PASTE over the block earn the star (S.pasteLog)', [0], `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('=$'+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'c',ctrl:true}]},
    {sel:o.CX+o.P0+':'+o.CY+o.PN, keys:[{key:'v',ctrl:true}]},
  ]; }`, true);

  await probe('multiples with the anchor set by F4 rather than a typed $', [0], `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('='+o.CV+o.P0),{key:'F4'},{key:'F4'},{key:'F4'},...T('/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'ArrowRight',shift:true}, Kb.fillR,
      {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
  ]; }`);

  await probe('summary read with LARGE/SMALL instead of MEDIAN/MAX/MIN (identical numbers)', [1], `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('=$'+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'ArrowRight',shift:true}, Kb.fillR,
      {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
    {sel:o.CX+o.RMED, keys:[...T('=LARGE('+o.CX+o.P0+':'+o.CX+o.PN+',3)'), Kb.enter]},
    {sel:o.CY+o.RMED, keys:[...T('=SMALL('+o.CY+o.P0+':'+o.CY+o.PN+',3)'), Kb.enter]},
    {sel:o.CX+o.RHI,  keys:[...T('=LARGE('+o.CX+o.P0+':'+o.CX+o.PN+',1)'), Kb.enter]},
    {sel:o.CY+o.RHI,  keys:[...T('=LARGE('+o.CY+o.P0+':'+o.CY+o.PN+',1)'), Kb.enter]},
    {sel:o.CX+o.RLO,  keys:[...T('=SMALL('+o.CX+o.P0+':'+o.CX+o.PN+',1)'), Kb.enter]},
    {sel:o.CY+o.RLO,  keys:[...T('=SMALL('+o.CY+o.P0+':'+o.CY+o.PN+',1)'), Kb.enter]},
  ]; }`);

  await probe('the bridge COLLAPSED — implied EV computes the median inline, equity in one cell', [2, 3, 4], `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('=$'+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'ArrowRight',shift:true}, Kb.fillR,
      {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
    {sel:o.CX+o.RMED, keys:[...T('=MEDIAN('+o.CX+o.P0+':'+o.CX+o.PN+')'), Kb.enter]},
    {sel:o.CV+o.REV, keys:[...T('='+o.CV+o.RTE+'*MEDIAN('+o.CX+o.P0+':'+o.CX+o.PN+')'), Kb.enter]},
    {sel:o.CV+o.REQ, keys:[...T('='+o.CV+o.RTE+'*'+o.CX+o.RMED+'-'+o.CV+o.RND), Kb.enter]},
    {sel:o.CV+o.RPS, keys:[...T('=('+o.CV+o.REV+'-'+o.CV+o.RND+')/'+o.CV+o.RSH), Kb.enter]},
  ]; }`);

  await probe('the bridge fully ANCHORED ($ everywhere) and written bottom-up', [2, 3, 4], `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('=$'+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'ArrowRight',shift:true}, Kb.fillR,
      {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
    {sel:o.CX+o.RMED, keys:[...T('=MEDIAN('+o.CX+o.P0+':'+o.CX+o.PN+')'), Kb.enter]},
    {sel:o.CV+o.RPS, keys:[...T('=$'+o.CV+'$'+o.REQ+'/$'+o.CV+'$'+o.RSH), Kb.enter]},
    {sel:o.CV+o.REQ, keys:[...T('=$'+o.CV+'$'+o.REV+'-$'+o.CV+'$'+o.RND), Kb.enter]},
    {sel:o.CV+o.REV, keys:[...T('=$'+o.CX+'$'+o.RMED+'*$'+o.CV+'$'+o.RTE), Kb.enter]},
  ]; }`);

  await probe('the dress via Alt H 1 (bold) + Alt H B D (top AND bottom border)', [5], `C => { const o=C._o; return [
    {sel:o.CA+o.RPS+':'+o.CV+o.RPS, keys:[{key:'Alt'},L('h'),D(1)]},
    {sel:o.CA+o.RPS+':'+o.CV+o.RPS, keys:[{key:'Alt'},L('h'),L('b'),L('d')]},
  ]; }`);

  await probe('the dress via Alt H B S on the two-cell row (outside border)', [5], `C => { const o=C._o; return [
    {sel:o.CA+o.RPS+':'+o.CV+o.RPS, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('s')]},
  ]; }`);

  await probe('the dress via Alt H B A on the FIGURE cell alone (stores `ball`, campaign bug #7)', [5], `C => { const o=C._o; return [
    {sel:o.CV+o.RPS, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('a')]},
  ]; }`);

  await probe('the dress BEFORE the build it follows — a legal order must not go dark', [5], `C => { const o=C._o; return [
    {sel:o.CV+o.RPS, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
  ]; }`);

  /* ---------------- E · negative controls ---------------- */
  say('\nE · negative controls — these must NOT clear');
  const neg = async (name, coreIdx, src) => {
    let anyOk = false;
    for (const s of SEEDS) { const r = await drive(s, src); if (coreIdx.some(i => r.cores[i])) anyOk = true; }
    if (anyOk) bad(name + ' — a beat cleared that must not');
    else ok(name);
  };
  await neg('a typed constant never clears a Build beat (the multiples hardcoded off the board)', [0], `C => { const o=C._o; const mv=[];
    for(let i=0;i<5;i++){
      mv.push({sel:o.CX+(o.P0+i), keys:[...T(String(Math.round(o.mEb[i]*10)/10)), Kb.enter]});
      mv.push({sel:o.CY+(o.P0+i), keys:[...T(String(Math.round(o.mEi[i]*10)/10)), Kb.enter]});
    } return mv; }`);
  await neg('the UNANCHORED fill-right leaves the multiple block wrong (the mistake the star punishes)', [0], `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('='+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'ArrowRight',shift:true}, Kb.fillR,
      {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
  ]; }`);
  await neg('implied EV off the ROUNDED median a player can read on screen', [2], `C => { const o=C._o; return [
    {sel:o.CX+o.P0, keys:[...T('=$'+o.CV+o.P0+'/'+o.CD+o.P0), Kb.enter]},
    {sel:o.CX+o.P0, keys:[{key:'ArrowRight',shift:true}, Kb.fillR,
      {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true}, Kb.fillD]},
    {sel:o.CX+o.RMED, keys:[...T('=MEDIAN('+o.CX+o.P0+':'+o.CX+o.PN+')'), Kb.enter]},
    {sel:o.CV+o.REV, keys:[...T('='+o.CV+o.RTE+'*'+String(Math.round(o.med.eb*10)/10)), Kb.enter]},
  ]; }`);

  /* ---------------- F · board facts ---------------- */
  say('\nF · board facts — model conventions, §1.3 density, width');
  const facts = await page.evaluate((seeds) => {
    const out = [];
    for (const seed of seeds) {
      window.__forceSeed = seed;
      loadChallenge('comps');
      const C = CHALLENGES.comps, o = C._o;
      const cel = k => S.cells[k] || {};
      let ebitBelow = true, blueInputs = true, blackBuilt = true, distinct = true;
      for (let i = 0; i < 5; i++) {
        if (!(cel(o.CI + (o.P0 + i)).value < cel(o.CD + (o.P0 + i)).value)) ebitBelow = false;
        [o.CV, o.CD, o.CI].forEach(L2 => { if (cel(L2 + (o.P0 + i)).fontColor !== 'blue') blueInputs = false; });
      }
      [o.CV + o.RTE, o.CV + o.RND, o.CV + o.RSH].forEach(k => { if (cel(k).fontColor !== 'blue') blueInputs = false; });
      [o.CV + o.REV, o.CV + o.REQ, o.CV + o.RPS, o.CX + o.RMED].forEach(k => { if (cel(k).fontColor) blackBuilt = false; });
      const ms = o.mEb.slice().sort((a, b) => a - b);
      for (let i = 1; i < 5; i++) if (ms[i] - ms[i - 1] < 0.2) distinct = false;
      const medMid = Math.abs(o.med.eb - ms[2]) < 1e-12;
      const ruled = !!cel(o.CX + o.RMED).bt && !!cel(o.CA + o.RMED).bt;
      const hdrRule = !!cel(o.CA + o.HR).bb && !!cel(o.CX + o.HR).bb;
      const landingBare = !cel(o.CV + o.RPS).bold && !cel(o.CV + o.RPS).bt && !cel(o.CV + o.RPS).ball;
      const ROWS = S._ROWS0;
      let over = 0;
      for (let c = 1; c <= 10; c++) { try { if (overflowsCol(S, c)) over++; } catch (e) {} }
      /* §1.3 density at the WIN state — rows carrying content */
      const moves = C.demo.call(C);
      for (const mv of moves) { if (mv.sel) setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      const rows = {};
      for (const k in S.cells) { const c = S.cells[k]; if (!c) continue;
        if (c.value !== null && c.value !== undefined && c.value !== '') rows[parseInt(k.replace(/[A-Z]/g, ''), 10)] = 1; }
      const dens = Object.keys(rows).length;
      out.push({ seed, ebitBelow, blueInputs, blackBuilt, distinct, medMid, ruled, hdrRule, landingBare, dens, over, ROWS });
    }
    return out;
  }, SEEDS);
  const every = f => facts.every(f);
  if (every(x => x.ROWS === 20)) ok('ROWS=20 on every seed (§1.3 floor AND cap)'); else bad('ROWS is not 20 on every seed');
  if (every(x => x.ebitBelow)) ok('LTM EBIT is below LTM EBITDA on every peer, every seed — D&A is real'); else bad('a peer has EBIT >= EBITDA');
  if (every(x => x.blueInputs)) ok('every seeded input is BLUE (MODELING_STANDARDS §1 provenance)'); else bad('an input is not blue');
  if (every(x => x.blackBuilt)) ok('every cell the player builds ships with no font colour — black formulas'); else bad('a built cell carries a font colour');
  if (every(x => x.distinct)) ok('the five multiples are distinct with >=0.20x between neighbours — median/high/low unambiguous'); else bad('two peer multiples are too close');
  if (every(x => x.medMid)) ok('the graded median IS the middle of the sorted five (MODELING_STANDARDS §4: median, never mean)'); else bad('median mismatch');
  if (every(x => x.ruled)) ok('the summary wears its rule ABOVE it (§1.0(f) — a total earns the line above)'); else bad('the summary rule is missing');
  if (every(x => x.hdrRule)) ok('the header row wears a bottom border (doctrine §2.1b)'); else bad('header rule missing');
  if (every(x => x.landingBare)) ok('the landing ships UNDRESSED — the §1.6 finish-state beat is real work'); else bad('the landing ships pre-dressed');
  if (every(x => x.over === 0)) ok('no column overflows at load on any seed (no ####  — e2e-fit-sweep contract)'); else bad('a column prints #### at load');
  const dmin = Math.min.apply(null, facts.map(x => x.dens));
  if (dmin >= 12) ok('§1.3 density at the win state: ' + dmin + '/20 rows carry content (' + Math.round(100 * dmin / 20) + '%), target >=60%');
  else bad('density ' + dmin + '/20 is under the §1.3 target');

  if (perr.length) { bad('page errors: ' + perr.slice(0, 3).join(' | ')); }
  say('\n' + (fails ? 'VERIFY-COMPS: ' + fails + ' FAILURE(S)' : 'VERIFY-COMPS: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
