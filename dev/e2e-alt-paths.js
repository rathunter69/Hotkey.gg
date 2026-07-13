/* r169 ALT-PATH AUDIT — the anti-railroad harness.
   The demo replay proves the SCRIPTED solution wins; this proves drills accept
   the OTHER legitimate routes Excel offers: ribbon walks vs Ctrl chords, dialog
   routes (Alt H V S vs Alt E S V), typed refs vs F4 cycling vs pointer mode,
   and — because checks grade END STATE — different op orders entirely.

   House rule (Wolf, T9): drills must be solvable "as users figure out the best
   pathways". Any alt that fails here is either a check overfit to one chord
   (fix the check) or a genuinely missing engine route (fix the engine or the
   prompt). Every rebuilt/new drill should land an entry in ALTS.

   Each entry: { key, name, moves } — moves is a page-side function source,
   receives the live C (challenge) after loadChallenge, returns demo-style
   moves. Runs REPS seeds per alt (drills randomize).
   Run: node dev/e2e-alt-paths.js [drill ...]   (server on 127.0.0.1:8791) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const REPS = 3;
const only = process.argv.slice(2);

const ALTS = [
  { key: 'rowops', name: 'ctrl chords with shift+space rows (not the ribbon)', moves: `C => [
      {sel:'A3', keys:[{key:' ',shift:true},{key:'=',ctrl:true,shift:true}]},
      {sel:'A6', keys:[{key:' ',shift:true},{key:'-',ctrl:true}]},
    ]` },
  { key: 'polish', name: 'reversed order + ribbon bold (alt h 1)', moves: `C => { const o=C._o; return [
      {sel:o.h1+':'+o.h2, keys:[{key:'Alt'},L('h'),L('h'), {key:'Alt'},L('h'),L('b'),L('b'), {key:'Alt'},L('h'),D(1)]},
    ]; }` },
  { key: 'blocksel', name: 'briefs in reverse + ribbon bold + ctrl+shift+! comma', moves: `C => { const o=C._o; return [
      {sel:o.u0, keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',ctrl:true,shift:true},{key:'!',ctrl:true,shift:true}]},
      {sel:o.t0, keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',ctrl:true,shift:true},{key:'Alt'},L('h'),D(1)]},
    ]; }` },
  { key: 'undo', name: 'flag the survivor FIRST, ribbon bold', moves: `C => { const o=C._o;
      const steps=[
        {sel:o.liveHdr, keys:[{key:'Alt'},L('h'),D(1)]},
        {sel:o.blk, keys:[{key:'Delete'},{key:'z',ctrl:true}]},
      ];
      o.dead.forEach(d=>steps.push({sel:d, keys:[{key:'Delete'}]}));
      return steps; }` },
  { key: 'copyover', name: 'deck hand-off first + dialog via alt h v s', moves: `C => { const o=C._o; return [
      {sel:o.src, keys:[{key:'c',ctrl:true}]},
      {sel:o.d3, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('v'),{key:'Enter'}]},
      {sel:o.d1, keys:[{key:'v',ctrl:true}]},
      {sel:o.d2, keys:[{key:'v',ctrl:true}]},
    ]; }` },
  { key: 'pastes', name: 'ribbon dialog route (alt h v s) for both pastes', moves: `C => { const o=C._o; return [
      {sel:o.src, keys:[{key:'c',ctrl:true}]},
      {sel:o.v, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('v'),{key:'Enter'}]},
      {sel:o.t, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('t'),{key:'Enter'}]},
    ]; }` },
  { key: 'filldr', name: 'ribbon fills: alt h f i d / alt h f i r', moves: `C => { const o=C._o; return [
      {sel:o.fillDown, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.fillRight, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]; }` },
  { key: 'foot', name: 'typed SUMs (no alt+=), columns before rows', moves: `C => [
      {sel:'B6', keys:[...T('=SUM(B2:B5)'),{key:'Enter'}]},
      {sel:'B6:E6', keys:[{key:'r',ctrl:true}]},
      {sel:'F2', keys:[...T('=SUM(B2:E2)'),{key:'Enter'}]},
      {sel:'F2:F5', keys:[{key:'d',ctrl:true}]},
      {sel:'F6', keys:[...T('=SUM(F2:F5)'),{key:'Enter'}]},
    ]` },
  { key: 'decimals', name: 'columns walked in reverse order', moves: `C => { const o=C._o; return [
      {sel:o.pR, keys:[{key:'Alt'},L('h'),D(9), {key:'Alt'},L('h'),D(9)]},
      {sel:o.mR, keys:[{key:'Alt'},L('h'),D(0)]},
      {sel:o.evR, keys:[{key:'Alt'},L('h'),D(9), {key:'Alt'},L('h'),D(9)]},
    ]; }` },
  { key: 'colops', name: 'insert the quarter BEFORE deleting DRAFT', moves: `C => { const o=C._o;
      const dc2 = o.dc + (o.ni<=o.dc ? 1 : 0);
      return [
        {sel:colLetter(o.ni)+(o.hr+1), keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('i'),L('c')]},
        {sel:colLetter(o.ni)+o.hr, keys:[...T(o.mq),{key:'Enter'}]},
        {sel:colLetter(o.ni)+o.hr, keys:[{key:'b',ctrl:true}]},
        {sel:colLetter(dc2)+(o.hr+1), keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('d'),L('c')]},
      ]; }` },
  { key: 'anchor', name: 'dollars typed by hand — no F4 at all', moves: `C => { const o=C._o; return [
      {sel:o.tl, keys:[...T('=$B'+o.r0+'*C$'+o.hr),{key:'Enter'}]},
      {sel:o.col, keys:[{key:'d',ctrl:true}]},
      {sel:o.grid, keys:[{key:'r',ctrl:true}]},
    ]; }` },
  { key: 'anchor', name: 'pointer mode + F4 (arrows grab the refs)', moves: `C => { const o=C._o; return [
      {sel:o.tl, keys:[{key:'='},{key:'ArrowLeft'},{key:'F4'},{key:'F4'},{key:'F4'},{key:'*'},{key:'ArrowUp'},{key:'F4'},{key:'F4'},{key:'Enter'}]},
      {sel:o.col, keys:[{key:'d',ctrl:true}]},
      {sel:o.grid, keys:[{key:'r',ctrl:true}]},
    ]; }` },
  { key: 'sort', name: 'foot and dress BEFORE sorting', moves: `C => { const o=C._o; return [
      {sel:o.foot, keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},
      {sel:o.foot, keys:[{key:'b',ctrl:true}]},
      {sel:o.range, keys:[{key:'Alt'},L('a'),L('s'),L('d')]},
    ]; }` },
  { key: 'series', name: 'dress first, series last', moves: `C => { const o=C._o; return [
      {sel:o.range, keys:[{key:'b',ctrl:true}]},
      {sel:o.range, keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:o.range, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('s'),{key:'Enter'}]},
    ]; }` },
  // --- T-A tranche 2 additions (r170) ---
  { key: 'lookup', name: 'the two-way INDEX form (block + double MATCH)', moves: `C => [
      {sel:'G4', keys:[...T('=INDEX(B2:D8,MATCH(G2,A2:A8,0),MATCH(G3,B1:D1,0))'),{key:'Enter'}]},
    ]` },
  { key: 'lookup2', name: 'header-inclusive ranges (consistent off-by-one)', moves: `C => [
      {sel:'G4', keys:[...T('=INDEX(B1:D6,MATCH(G2,A1:A6,0),MATCH(G3,B1:D1,0))'),{key:'Enter'}]},
    ]` },
  { key: 'percent', name: 'dollars typed by hand, block B first', moves: `C => { const R=C._R; return [
      {sel:R.pc+R.r0, keys:[...T('='+R.vc+R.r0+'/$'+R.vc+'$'+R.r0),{key:'Enter'}]},
      {sel:R.pc+R.r0+':'+R.pc+R.rN, keys:[{key:'d',ctrl:true},{key:'%',ctrl:true,shift:true}]},
      {sel:'C2', keys:[...T('=B2/$B$2'),{key:'Enter'}]},
      {sel:'C2:C6', keys:[{key:'d',ctrl:true},{key:'%',ctrl:true,shift:true}]},
    ]; }` },
  { key: 'bridge', name: 'typed refs (no pointing) + ribbon fill right', moves: `C => [
      {sel:'B4', keys:[...T('=B2*B3'),{key:'Enter'}]},
      {sel:'B4:F4', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'autofit', name: 'second pair first', moves: `C => { const o=C._o; return [
      {sel:o.b1+':'+o.b2, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
      {sel:o.a1+':'+o.a2, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
    ]; }` },
  { key: 'saves', name: 'review cells in reverse order', moves: `C => C._sites.slice().reverse().map(s =>
      ({sel:s, keys:[...T('done'),{key:'Enter'},{key:'s',ctrl:true}]})) ` },
  { key: 'editfix', name: 'typos fixed in reverse order', moves: `C => C._sites.slice().reverse().map(s => {
      let p=0; while(p<s.bad.length && p<s.good.length && s.bad[p]===s.good[p]) p++;
      const keys=[{key:'F2'}];
      for(let i=0;i<s.bad.length-p;i++) keys.push({key:'Backspace'});
      keys.push(...T(s.good.slice(p)),{key:'Enter'});
      return {sel:s.cell, keys};
    }) ` },
  { key: 'drill', name: 'values paste via the H V S dialog route', moves: `C => [
      {sel:'B3:B8', keys:[{key:'c',ctrl:true}]},
      {sel:'B3:B8', keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('v'),{key:'Enter'}]},
      {sel:'B3:B8', keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
    ]` },
  { key: 'transpose', name: 'transpose via the H V S dialog route', moves: `C => { const o=C._o; return [
      {sel:o.src, keys:[{key:'c',ctrl:true}]},
      {sel:o.dst, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('e'),{key:'Enter'}]},
    ]; }` },
  { key: 'format', name: 'reversed order + ribbon percent (alt h p)', moves: `C => { const o=C._o; return [
      {sel:o.com, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:o.cur, keys:[{key:'$',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:o.pct, keys:[{key:'Alt'},L('h'),L('p')]},
      {sel:o.pct.split(':')[1], keys:[{key:'Alt'},L('h'),D(0)]},
    ]; }` },
  { key: 'cagr', name: 'blocks in reverse, winner flagged mid-run', moves: `C => {
      const w=C._sites.reduce((a,s)=>s.exp>a.exp?s:a,C._sites[0]);
      const steps=C._sites.slice().reverse().flatMap(s=>[
        {sel:s.col+s.ans, keys:[...T('=('+s.col+(s.r0+1)+'/'+s.col+s.r0+')^(1/'+s.col+(s.r0+2)+')-1'),{key:'Enter'}]},
        {sel:s.col+s.ans, keys:[{key:'%',ctrl:true,shift:true}]},
      ]);
      steps.push({sel:w.col+w.ans, keys:[{key:'Alt'},L('h'),D(1)]});
      return steps; }` },
  { key: 'ribbon', name: 'jobs in reverse + ctrl+b for the bold job', moves: `C => { const o=C._o; return [
      {sel:o.r, keys:[{key:'Alt'},L('h'),L('b'),L('b')]},
      {sel:o.c, keys:[{key:'Alt'},L('h'),L('a'),L('c')]},
      {sel:o.k, keys:[{key:'Alt'},L('h'),L('k')]},
      {sel:o.b, keys:[{key:'b',ctrl:true}]},
    ]; }` },
];

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

  let fails = 0, ran = 0;
  for (const alt of ALTS) {
    if (only.length && !only.includes(alt.key)) continue;
    ran++;
    let wins = 0; const notes = [];
    for (let rep = 0; rep < REPS; rep++) {
      const r = await page.evaluate(({ key, movesSrc }) => {
        try {
          document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
          loadChallenge(key);
          const C = CHALLENGES[key];
          const moves = eval('(' + movesSrc + ')')(C);
          for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
          if (done) return { won: true, keys: keyLog.length };
          const failing = C.checks(S).filter(x => !x.ok).map(x => x.label);
          return { won: false, failing };
        } catch (e) { return { won: false, failing: ['THREW: ' + String(e).slice(0, 100)] }; }
      }, { key: alt.key, movesSrc: alt.moves });
      if (r.won) wins++;
      else notes.push((r.failing || []).join(' | ').slice(0, 160));
    }
    const ok = wins === REPS;
    if (!ok) fails++;
    console.log((ok ? 'PASS ' : 'FAIL ') + alt.key.padEnd(10) + ' · ' + alt.name + (ok ? '' : '\n       stuck on: ' + notes[0]));
  }
  console.log('\nALT PATHS: ' + (fails ? fails + ' FAILURE(S) of ' + ran : 'ALL ' + ran + ' PASS'));
  if (errs.length) { console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' · ')); fails++; }
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
