/* dev/verify-dashcover.js — the dashcover depth-pass probe (r449, DEPTH_PASS §4.87).
   Self-contained and single-drill by construction: it names NO other drill, so the C13
   retirement guard can never trip on it (WORKFLOW.md §9.1).

   It answers by WALKING routes through the live engine rather than by reading predicates
   (DEPTH_PASS_CAMPAIGN §1 — every untriggerable beat the campaign has found was found this
   way, none by reading a predicate):

     §1  BOARD INTEGRITY — 20 rows, §1.3 win-state density, the model's own coherence (the
         downside grows slower, earns a thinner margin, deleverages less and returns less),
         the MODELING_STANDARDS §1 colour-provenance census, and the r439 `cases`
         degradation check: the win state must be format-identical whether the cover box was
         wired in one pass or typed twelve times.
     §2  ROUTE SWEEP — every Excel route that produces the visible end state, per beat, each
         one driven and graded (§1.0-R3(p): both routes clear, or the beat is broken).
     §3  BAKE-OFF — the wave-6 addendum measurement: multi-commit vs fill vs clipboard clone
         vs ribbon fill, keys on the IDENTICAL job, medians over SEEDS seeds.
     §4  ☆ HEADROOM + SKIPPABILITY — the CAMPAIGN §2 diagnostic, both parts, plus the named
         slow route that clears every core with the star DARK, with its key count.
     §5  ENGINE FACTS this board depends on — the Ctrl+Shift+arrow overshoot that rules the
         structured-selection ☆ family out on a block that loads empty, the relative
         translation every one-pass mechanic performs, and the format smear a fill carries.
     §6  ANATOMY — tri-length (§1.9), exactly one bonus (§2.2), the saveClose declaration.

   Mirrors the real harness init (hotkey_onboarded / hk_tour_done / hk_learn_done /
   hk_handle_cache) — a probe that does not is a lie (CAMPAIGN, the r440 note).
   Run:  node dev/verify-dashcover.js         (server on 127.0.0.1:8791)
         URL=http://127.0.0.1:8866/index.html node dev/verify-dashcover.js               */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const HK_URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '5', 10);

let fails = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };
const head = m => console.log('\n' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1');
      localStorage.setItem('hk_handle_cache', '');
    } catch (e) {}
  });
  await page.goto(HK_URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function'
    && typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 20000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });   // r158: progression gates never bounce a locked-tier load

  /* the page-side driver: run a list of demo-shaped moves on a fresh build and report the
     checklist, the keys paid, and anything the caller asked to read off the board. */
  await page.evaluate(() => {
    window.__dc = {
      run(src, opts) {
        opts = opts || {};
        loadChallenge('dashcover');
        const C = CHALLENGES.dashcover, o = C._o;
        const moves = eval('(' + src + ')')(C, o);
        keyLog.length = 0;
        for (const m of moves) { setDemoSel(m.sel); for (const k of m.keys) demoKey(k); }
        const cs = C.checks(S);
        return {
          keys: keyLog.length,
          labels: cs.map(c => c.label),
          okv: cs.map(c => !!c.ok),
          /* the engine APPENDS the Ctrl+S closer as a core beat at load (hkSaveCloseWire, and
             it carries save:true) — these route fragments never press it, so it is excluded
             here and asserted separately in §6. */
          cores: cs.filter(c => !c.bonus && !c.save).every(c => !!c.ok),
          star: !!(cs.find(c => c.bonus) || {}).ok,
          o: opts.wantO ? JSON.parse(JSON.stringify(o)) : null,
          probe: opts.probe ? eval('(' + opts.probe + ')')(S, o) : null,
        };
      },
    };
  });

  const run = (src, opts) => page.evaluate(([s, o]) => window.__dc.run(s, o), [src, opts || {}]);
  const median = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

  /* ---- the shared move fragments, as page-side source strings ---------------------- */
  const DEMO = `(C,o)=>C.demo()`;
  /* the star route, isolated: the whole block grabbed and written once */
  const WIRE_ME = `(C,o)=>{const D={key:'ArrowDown',shift:true},R={key:'ArrowRight',shift:true};
    return [{sel:o.CB+o.rM, keys:[D,D,D,D,D,R,...T('='+o.CB+o.rO),{key:'Enter',ctrl:true}]}];}`;
  const WIRE_FILL = `(C,o)=>{const D={key:'ArrowDown',shift:true},R={key:'ArrowRight',shift:true};
    return [{sel:o.CB+o.rM, keys:[...T('='+o.CB+o.rO),{key:'Enter'}]},
            {sel:o.CB+o.rM, keys:[D,D,D,D,D,{key:'d',ctrl:true},R,{key:'r',ctrl:true}]}];}`;
  const WIRE_CLONE = `(C,o)=>{const D={key:'ArrowDown',shift:true},R={key:'ArrowRight',shift:true};
    return [{sel:o.CB+o.rM, keys:[...T('='+o.CB+o.rO),{key:'Enter'}]},
            {sel:o.CB+o.rM, keys:[{key:'c',ctrl:true},D,D,D,D,D,R,{key:'v',ctrl:true}]}];}`;
  const WIRE_RIBBON = `(C,o)=>{const D={key:'ArrowDown',shift:true},R={key:'ArrowRight',shift:true};
    return [{sel:o.CB+o.rM, keys:[...T('='+o.CB+o.rO),{key:'Enter'}]},
            {sel:o.CB+o.rM, keys:[D,D,D,D,D,{key:'Alt'},L('h'),L('f'),L('i'),L('d'),
                                  R,{key:'Alt'},L('h'),L('f'),L('i'),L('r')]}];}`;
  /* the honest slow control: twelve refs typed one at a time, the cursor WALKED between them
     (setDemoSel only parks on the first cell, the r438 `series` rule) */
  const WIRE_TYPED = `(C,o)=>{const mv=[]; const up={key:'ArrowUp'}, rt={key:'ArrowRight'};
    const k=[]; for(let i=0;i<6;i++){ k.push(...T('='+o.CB+(o.rO+i)),{key:'Enter'}); }
    for(let i=0;i<6;i++) k.push(up); k.push(rt);
    for(let i=0;i<6;i++){ k.push(...T('='+o.CC+(o.rO+i)),{key:'Enter'}); }
    mv.push({sel:o.CB+o.rM, keys:k}); return mv;}`;
  const DRESS = `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
    return [{sel:o.CB+o.rM,     keys:[D,D,R,{key:'1',ctrl:true},L('p')]},
            {sel:o.CB+(o.rM+3), keys:[D,D,R,{key:'1',ctrl:true},L('c')]},
            {sel:o.CA+'1',      keys:[...T('=UPPER(TRIM('+o.CB+o.rFeed+'))'),{key:'Enter'}]},
            {sel:o.CA+'1',      keys:[R,R,{key:'b',ctrl:true},{key:'1',ctrl:true},L('a')]}];}`;
  /* the same dress walked the slow way: each format applied one column at a time, the title
     bolded from its own cell and the span grabbed separately */
  const DRESS_SLOW = `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
    return [{sel:o.CB+o.rM,     keys:[D,D,{key:'1',ctrl:true},L('p')]},
            {sel:o.CC+o.rM,     keys:[D,D,{key:'1',ctrl:true},L('p')]},
            {sel:o.CB+(o.rM+3), keys:[D,D,{key:'1',ctrl:true},L('c')]},
            {sel:o.CC+(o.rM+3), keys:[D,D,{key:'1',ctrl:true},L('c')]},
            {sel:o.CA+'1',      keys:[...T('=UPPER(TRIM('+o.CB+o.rFeed+'))'),{key:'Enter'}]},
            {sel:o.CA+'1',      keys:[{key:'b',ctrl:true},R,R,{key:'1',ctrl:true},L('a')]}];}`;
  const cat = (...fns) => `(C,o)=>[].concat(${fns.map(f => `(${f})(C,o)`).join(',')})`;

  /* ================================ §1 BOARD INTEGRITY ============================== */
  head('§1  BOARD INTEGRITY — geometry, density, the model, the colour census, no ☆ degradation');
  {
    const r = await run(cat(WIRE_ME, DRESS), {
      wantO: true,
      probe: `(S,o)=>{
        let rows=0; for(let rr=1;rr<=20;rr++){ let used=false;
          for(let cc=1;cc<=10;cc++){ const c=S.cells[colLetter(cc)+rr];
            if(c && (c.value!==null&&c.value!==undefined&&c.value!=='')) used=true; }
          if(used) rows++; }
        const ink={green:0,blue:0,black:0};
        for(let rr=1;rr<=20;rr++) for(let cc=1;cc<=10;cc++){ const c=S.cells[colLetter(cc)+rr];
          if(!c||c.value===null||c.value===undefined) continue;
          if(c.fontColor==='green') ink.green++; else if(c.fontColor==='blue') ink.blue++;
          else if(typeof c.value==='number'||c.formula) ink.black++; }
        const fmt=[]; for(let i=0;i<6;i++) for(const cl of [o.CB,o.CC]){ const c=S.cells[cl+(o.rM+i)];
          fmt.push((c&&c.fmtStyle)+'/'+(c&&c.decimals)); }
        const clip = clipsCol(S, o.c0) || clipsCol(S, o.cB) || clipsCol(S, o.cC);
        const overflow = overflowsCol(S, o.cB) || overflowsCol(S, o.cC);
        return {rows:rows, ROWS:S.ROWS, ink:ink, fmt:fmt, clip:!!clip, overflow:!!overflow,
                base:o.base, down:o.down, lev:[S.cells[o.CB+o.rLev].value, S.cells[o.CC+o.rLev].value],
                title:S.cells[o.CA+'1'].value, stamp:o.stamp};
      }`,
    });
    if (r.probe.ROWS === 20) ok('board is 20 rows — §1.3 floor AND cap, Models included (r440)');
    else bad('board declares ROWS=' + r.probe.ROWS + ', not 20 (§1.3)');
    const pct = Math.round(r.probe.rows / 20 * 100);
    if (r.probe.rows >= 12) ok('§1.3 win-state density ' + r.probe.rows + '/20 rows (' + pct + '%) — target ≥60%');
    else bad('§1.3 density ' + r.probe.rows + '/20 (' + pct + '%) is under the 60% target');
    const k = r.probe.ink;
    if (k.green >= 14 && k.blue >= 1 && k.black >= 12)
      ok('MODELING_STANDARDS §1 colour census — ' + k.green + ' green (linked from the model tabs) · '
        + k.blue + ' blue (the pasted raw feed) · ' + k.black + ' black (formulas on this sheet)');
    else bad('colour census wrong: ' + JSON.stringify(k));
    if (r.probe.title === r.probe.stamp) ok('the stamp lands the cleaned title — "' + r.probe.title + '"');
    else bad('stamp landed "' + r.probe.title + '", expected "' + r.probe.stamp + '"');
    /* §1.0-R3(r): the LABEL verdict is !clipsCol, and it matters on the two section-head rows —
       a header row carries content in the case columns, so its label cannot spill into them.
       This is the defect the mid-solve screenshot caught (doctrine §8.1.5), and this is the
       assertion that keeps it from coming back. No width verdict is GRADED by any beat. */
    if (!r.probe.clip && !r.probe.overflow)
      ok('no label clipped and no figure printing #### at the win state (§1.0-R3(r) — measured with clipsCol/overflowsCol, never a width number)');
    else bad('width: clipped label column=' + r.probe.clip + ' · overflowing figure column=' + r.probe.overflow);
  }
  {
    /* the model itself, over SEEDS draws: a reviewer's ten-second read of the page */
    let n = 0;
    for (let s = 0; s < SEEDS; s++) {
      const r = await run(DEMO, { wantO: true, probe: `(S,o)=>({lev:[S.cells[o.CB+o.rLev].value,S.cells[o.CC+o.rLev].value]})` });
      const b = r.o.base, d = r.o.down, lev = r.probe.lev;
      const good = b[0] > d[0] && b[1] > d[1] && b[2] > d[2]     // grows faster, fatter margin, better IRR
        && b[3] > d[3] && b[4] > d[4]                            // more exit EBITDA, more equity
        && d[5] > b[5]                                           // and it ends with MORE net debt
        && lev[1] > lev[0] && lev[0] >= 1.9 && lev[1] <= 7.5      // so exit leverage is worse
        && d[2] > 0 && b[2] < 0.6;
      if (good) n++; else bad('seed ' + s + ' model incoherent: base=' + JSON.stringify(b) + ' down=' + JSON.stringify(d) + ' lev=' + JSON.stringify(lev));
    }
    if (n === SEEDS) ok('the model reads right on ' + SEEDS + '/' + SEEDS + ' seeds — the downside grows slower, earns a thinner margin, exits smaller, deleverages less and returns less');
  }
  {
    /* r439 `cases`: a ☆ must not degrade the board. A fill/paste carries the SOURCE cell's
       number format, so the win state has to be identical on both routes. */
    const one = await run(cat(WIRE_ME, DRESS), { probe: `(S,o)=>{const f=[];
      for(let i=0;i<6;i++) for(const cl of [o.CB,o.CC]){ const c=S.cells[cl+(o.rM+i)]; f.push(c.fmtStyle+'/'+c.decimals); } return f;}` });
    const slow = await run(cat(WIRE_TYPED, DRESS), { probe: `(S,o)=>{const f=[];
      for(let i=0;i<6;i++) for(const cl of [o.CB,o.CC]){ const c=S.cells[cl+(o.rM+i)]; f.push(c.fmtStyle+'/'+c.decimals); } return f;}` });
    if (JSON.stringify(one.probe) === JSON.stringify(slow.probe))
      ok('no ☆ degradation (r439 `cases`) — the twelve cover cells finish format-identical whether wired in one pass or typed: ' + one.probe.slice(0, 2).join(' ') + ' … ' + one.probe.slice(-2).join(' '));
    else bad('the one-pass route leaves a different format than the typed route:\n    one-pass ' + one.probe.join(' ') + '\n    typed    ' + slow.probe.join(' '));
  }

  /* ================================ §2 ROUTE SWEEP ================================== */
  head('§2  ROUTE SWEEP — every route to the visible end state, driven and graded (§1.0-R3(p))');
  const sweep = async (name, src, want) => {
    let n = 0, k = 0;
    for (let s = 0; s < SEEDS; s++) {
      const r = await run(src);
      k = r.keys;
      const got = { cores: r.cores, star: r.star, beats: r.okv };
      let good = true;
      for (const key of Object.keys(want)) {
        if (key === 'beat') { if (got.beats[want.beat[0]] !== want.beat[1]) good = false; }
        else if (got[key] !== want[key]) good = false;
      }
      if (good) n++;
    }
    if (n === SEEDS) ok(name + '  (' + k + ' keys, ' + SEEDS + '/' + SEEDS + ')');
    else bad(name + ' — only ' + n + '/' + SEEDS + ' matched ' + JSON.stringify(want));
  };
  await sweep('beat 1 · one-pass multi-commit (the demo route)', cat(WIRE_ME, DRESS), { cores: true, star: true });
  await sweep('beat 1 · fill down then fill right', cat(WIRE_FILL, DRESS), { cores: true, star: true });
  await sweep('beat 1 · clipboard clone tiled over the block', cat(WIRE_CLONE, DRESS), { cores: true, star: true });
  await sweep('beat 1 · ribbon fills (Alt H F I D / I R)', cat(WIRE_RIBBON, DRESS), { cores: true, star: true });
  await sweep('beat 1 · twelve refs typed one at a time — cores clear, ☆ DARK', cat(WIRE_TYPED, DRESS), { cores: true, star: false });
  await sweep('beat 1 · $-ANCHORED refs typed per cell (no translation to lean on)',
    cat(`(C,o)=>{const mv=[]; for(let i=0;i<6;i++) for(const cl of [o.CB,o.CC])
      mv.push({sel:cl+(o.rM+i), keys:[...T('=$'+cl+'$'+(o.rO+i)),{key:'Enter'}]}); return mv;}`, DRESS),
    { cores: true, star: false });
  await sweep('beat 1 · =SUM() wrapped and =+ prefixed refs, then one fill pass',
    cat(`(C,o)=>{const D={key:'ArrowDown',shift:true},R={key:'ArrowRight',shift:true};
      return [{sel:o.CB+o.rM, keys:[...T('=SUM('+o.CB+o.rO+')'),{key:'Enter'}]},
              {sel:o.CB+o.rM, keys:[D,D,D,D,D,{key:'d',ctrl:true},R,{key:'r',ctrl:true}]}];}`, DRESS),
    { cores: true, star: true });
  await sweep('beat 1 · POINT MODE on the first link (arrows, not typing), then one fill pass',
    cat(`(C,o)=>{const D={key:'ArrowDown',shift:true},R={key:'ArrowRight',shift:true},dn={key:'ArrowDown'};
      const pt=[{key:'='}]; for(let i=0;i<(o.rO-o.rM);i++) pt.push(dn); pt.push({key:'Enter'});
      return [{sel:o.CB+o.rM, keys:pt},
              {sel:o.CB+o.rM, keys:[D,D,D,D,D,{key:'d',ctrl:true},R,{key:'r',ctrl:true}]}];}`, DRESS),
    { cores: true, star: true });
  await sweep('beat 1 · the outputs strip COPIED and pasted (dead numbers) — correctly does NOT clear',
    cat(`(C,o)=>{const D={key:'ArrowDown',shift:true},R={key:'ArrowRight',shift:true};
      return [{sel:o.CB+o.rO, keys:[D,D,D,D,D,R,{key:'c',ctrl:true}]},
              {sel:o.CB+o.rM, keys:[{key:'v',ctrl:true}]}];}`, DRESS),
    { beat: [0, false] });
  await sweep('beat 2 · percent via Alt H P then one Alt H 0 (the 0dp routes plus the decimal step)',
    cat(WIRE_ME, `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+o.rM, keys:[D,D,R,{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D0(0)]}];}`
      .replace('D0(0)', "{key:'0',code:'Digit0'}"),
      `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+(o.rM+3), keys:[D,D,R,{key:'1',ctrl:true},L('c')]},
              {sel:o.CA+'1', keys:[...T('=UPPER(TRIM('+o.CB+o.rFeed+'))'),{key:'Enter'}]},
              {sel:o.CA+'1', keys:[R,R,{key:'b',ctrl:true},{key:'1',ctrl:true},L('a')]}];}`),
    { cores: true });
  await sweep('beat 2 · percent via Ctrl+Shift+% then one Alt H 0',
    cat(WIRE_ME, `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+o.rM, keys:[D,D,R,{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),{key:'0',code:'Digit0'}]}];}`,
      `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+(o.rM+3), keys:[D,D,R,{key:'1',ctrl:true},L('c')]},
              {sel:o.CA+'1', keys:[...T('=UPPER(TRIM('+o.CB+o.rFeed+'))'),{key:'Enter'}]},
              {sel:o.CA+'1', keys:[R,R,{key:'b',ctrl:true},{key:'1',ctrl:true},L('a')]}];}`),
    { cores: true });
  await sweep('beat 3 · dollars via Alt H A N (ACCOUNTING — the r425 modeltour stranding, accepted here)',
    cat(WIRE_ME, `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+o.rM, keys:[D,D,R,{key:'1',ctrl:true},L('p')]},
              {sel:o.CB+(o.rM+3), keys:[D,D,R,{key:'Alt'},L('h'),L('a'),L('n')]},
              {sel:o.CA+'1', keys:[...T('=UPPER(TRIM('+o.CB+o.rFeed+'))'),{key:'Enter'}]},
              {sel:o.CA+'1', keys:[R,R,{key:'b',ctrl:true},{key:'1',ctrl:true},L('a')]}];}`),
    { cores: true });
  await sweep('beat 3 · dollars via Ctrl+Shift+$ walked down two places with Alt H 9',
    cat(WIRE_ME, `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+o.rM, keys:[D,D,R,{key:'1',ctrl:true},L('p')]},
              {sel:o.CB+(o.rM+3), keys:[D,D,R,{key:'$',ctrl:true,shift:true},
                 {key:'Alt'},L('h'),{key:'9',code:'Digit9'},{key:'Alt'},L('h'),{key:'9',code:'Digit9'}]},
              {sel:o.CA+'1', keys:[...T('=UPPER(TRIM('+o.CB+o.rFeed+'))'),{key:'Enter'}]},
              {sel:o.CA+'1', keys:[R,R,{key:'b',ctrl:true},{key:'1',ctrl:true},L('a')]}];}`),
    { cores: true });
  await sweep('beat 4 · the stamp written =TRIM(UPPER(…)) — the identical string, grades the same',
    cat(WIRE_ME, `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+o.rM, keys:[D,D,R,{key:'1',ctrl:true},L('p')]},
              {sel:o.CB+(o.rM+3), keys:[D,D,R,{key:'1',ctrl:true},L('c')]},
              {sel:o.CA+'1', keys:[...T('=TRIM(UPPER('+o.CB+o.rFeed+'))'),{key:'Enter'}]},
              {sel:o.CA+'1', keys:[R,R,{key:'b',ctrl:true},{key:'1',ctrl:true},L('a')]}];}`),
    { cores: true });
  await sweep('beat 4 · the clean title TYPED instead of pointed — correctly does NOT clear',
    cat(WIRE_ME, `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+o.rM, keys:[D,D,R,{key:'1',ctrl:true},L('p')]},
              {sel:o.CB+(o.rM+3), keys:[D,D,R,{key:'1',ctrl:true},L('c')]},
              {sel:o.CA+'1', keys:[...T(o.stamp),{key:'Enter'}]},
              {sel:o.CA+'1', keys:[R,R,{key:'b',ctrl:true},{key:'1',ctrl:true},L('a')]}];}`),
    { beat: [3, false] });
  await sweep('beat 5 · bold via Alt H 1 and the span via Alt H O E A (the ribbon walk)',
    cat(WIRE_ME, `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+o.rM, keys:[D,D,R,{key:'1',ctrl:true},L('p')]},
              {sel:o.CB+(o.rM+3), keys:[D,D,R,{key:'1',ctrl:true},L('c')]},
              {sel:o.CA+'1', keys:[...T('=UPPER(TRIM('+o.CB+o.rFeed+'))'),{key:'Enter'}]},
              {sel:o.CA+'1', keys:[R,R,{key:'Alt'},L('h'),{key:'1',code:'Digit1'},
                                   {key:'Alt'},L('h'),L('o'),L('e'),L('a')]}];}`),
    { cores: true });
  await sweep('beat 5 · the span via the legacy Alt O E A dialog',
    cat(WIRE_ME, `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+o.rM, keys:[D,D,R,{key:'1',ctrl:true},L('p')]},
              {sel:o.CB+(o.rM+3), keys:[D,D,R,{key:'1',ctrl:true},L('c')]},
              {sel:o.CA+'1', keys:[...T('=UPPER(TRIM('+o.CB+o.rFeed+'))'),{key:'Enter'}]},
              {sel:o.CA+'1', keys:[R,R,{key:'b',ctrl:true},{key:'Alt'},L('o'),L('e'),L('a')]}];}`),
    { cores: true });
  await sweep('beat 5 · a PLAIN centre (Alt H A C) is a different result and correctly does NOT clear',
    cat(WIRE_ME, `(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+o.rM, keys:[D,D,R,{key:'1',ctrl:true},L('p')]},
              {sel:o.CB+(o.rM+3), keys:[D,D,R,{key:'1',ctrl:true},L('c')]},
              {sel:o.CA+'1', keys:[...T('=UPPER(TRIM('+o.CB+o.rFeed+'))'),{key:'Enter'}]},
              {sel:o.CA+'1', keys:[R,R,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('a'),L('c')]}];}`),
    { beat: [4, false] });
  await sweep('☆ · the base column TYPED and only the downside filled right — correctly earns NOTHING',
    cat(`(C,o)=>{const R={key:'ArrowRight',shift:true},D={key:'ArrowDown',shift:true};
      const k=[]; for(let i=0;i<6;i++) k.push(...T('='+o.CB+(o.rO+i)),{key:'Enter'});
      return [{sel:o.CB+o.rM, keys:k},
              {sel:o.CB+o.rM, keys:[D,D,D,D,D,R,{key:'r',ctrl:true}]}];}`, DRESS),
    { cores: true, star: false });

  /* ============================== §3 ☆ FAMILY BAKE-OFF ============================== */
  head('§3  ☆ FAMILY BAKE-OFF — the identical job (twelve links), keys, medians over ' + SEEDS + ' seeds');
  const bake = {};
  for (const [name, src] of [['multi-commit (Ctrl+Enter)', WIRE_ME], ['fill (Ctrl+D then Ctrl+R)', WIRE_FILL],
                             ['clipboard clone', WIRE_CLONE], ['ribbon fill (Alt H F I D/R)', WIRE_RIBBON],
                             ['typed one at a time', WIRE_TYPED]]) {
    const ks = [];
    for (let s = 0; s < SEEDS; s++) ks.push((await run(src)).keys);
    bake[name] = median(ks);
    const flat = ks.every(x => x === ks[0]);
    console.log('  ..   ' + name.padEnd(28) + median(ks) + ' keys' + (flat ? '  (flat across seeds)' : '  (range ' + Math.min(...ks) + '–' + Math.max(...ks) + ')'));
  }
  const star = bake['multi-commit (Ctrl+Enter)'], slowWire = bake['typed one at a time'];
  if (star < bake['fill (Ctrl+D then Ctrl+R)'] + 3 && star < slowWire)
    ok('the NON-FILL mechanic is the cheapest on this board (' + star + ' vs the fill\'s ' + bake['fill (Ctrl+D then Ctrl+R)'] + ') — the wave-6 addendum preference, satisfied');
  else bad('bake-off preference broken: ' + JSON.stringify(bake));
  ok('the ☆ move isolated (CAMPAIGN §2 — never a combined number): ' + star + ' keys against ' + slowWire
    + ' to type the same twelve links — worth ' + (slowWire - star) + ' keys, ' + (slowWire / star).toFixed(1) + '×');

  /* ====================== §4 ☆ HEADROOM AND SKIPPABILITY ============================ */
  head('§4  ☆-HEADROOM DIAGNOSTIC (CAMPAIGN §2, both parts) + measured skippability');
  {
    const fast = [], slow = [];
    for (let s = 0; s < SEEDS; s++) {
      fast.push((await run(cat(WIRE_ME, DRESS))).keys);
      slow.push((await run(cat(WIRE_TYPED, DRESS_SLOW))).keys);
    }
    const f = median(fast), sl = median(slow);
    console.log('  ..   fastest legal route ' + f + ' keys · slowest legal route doing the SAME work ' + sl + ' keys');
    if (sl / f >= 1.3) ok('PART 1 — spread ' + (sl / f).toFixed(2) + '×, clear of the ~1.3× line that retired a drill in r437');
    else bad('PART 1 — spread ' + (sl / f).toFixed(2) + '× is at or under the warning line');
    const dress = (await run(DRESS)).keys, dressSlow = (await run(DRESS_SLOW)).keys;
    const fmtHalf = dressSlow - dress;
    const survives = (sl - f) - fmtHalf;
    ok('PART 2 — of the ' + (sl - f) + ' keys of spread, ' + fmtHalf + ' are formatting (§1.0(d) forbids grading it) and ZERO are chord-vs-ribbon in the §1.0(c) forced-to-clear sense (§2 above drives every ribbon route and each one clears); '
      + survives + ' survive, all of them ONE-PASS-versus-RETYPE across the cover block');
    const neg = await run(cat(WIRE_TYPED, DRESS_SLOW));
    if (neg.cores && !neg.star) ok('SKIPPABILITY, measured not asserted (§1.0-R2(i)): the named slow route clears every core with the ☆ DARK, at ' + neg.keys + ' keys against ' + f);
    else bad('the slow control did not behave: cores=' + neg.cores + ' star=' + neg.star);
  }

  /* ================================ §5 ENGINE FACTS ================================= */
  head('§5  ENGINE FACTS this board leans on — measured, not assumed');
  {
    const r = await run(`(C,o)=>[{sel:o.CB+o.rM, keys:[{key:'ArrowDown',ctrl:true,shift:true}]}]`,
      { wantO: true, probe: `(S,o)=>({sel:JSON.parse(JSON.stringify(S.sel||null)), act:JSON.parse(JSON.stringify(S.active||null))})` });
    const landed = r.probe.act && r.probe.act.r;
    if (landed !== null && landed > r.o.rM + 5)
      ok('Ctrl+Shift+↓ from the top cover cell OVERSHOOTS to row ' + landed + ' (the outputs strip) — the cover block loads EMPTY, so the structured-selection ☆ family is a TRAP on this board, not a candidate');
    else bad('Ctrl+Shift+↓ landed at row ' + landed + ' — the overshoot finding no longer holds, re-read the ☆ bake-off');
  }
  {
    const r = await run(WIRE_ME, { wantO: true, probe: `(S,o)=>({
      first:S.cells[o.CB+o.rM].formula, last:S.cells[o.CC+(o.rM+5)].formula,
      me:JSON.parse(JSON.stringify(S.multiEnter||[]))})` });
    const wantLast = r.o.CC + (r.o.rO + 5);
    if (r.probe.last === '=' + wantLast)
      ok('Ctrl+Enter TRANSLATES relative references across the committed rectangle (' + r.probe.first + ' … ' + r.probe.last + ') — which is what makes a one-formula cover box possible at all');
    else bad('multi-commit translation broken: last cell reads ' + r.probe.last + ', expected =' + wantLast);
  }
  {
    const r = await run(`(C,o)=>{const D={key:'ArrowDown',shift:true};
      return [{sel:o.CB+o.rM, keys:[...T('='+o.CB+o.rO),{key:'Enter'}]},
              {sel:o.CB+o.rM, keys:[{key:'1',ctrl:true},L('p')]},
              {sel:o.CB+o.rM, keys:[D,D,D,D,D,{key:'d',ctrl:true}]}];}`,
      { probe: `(S,o)=>S.cells[o.CB+(o.rM+3)].fmtStyle` });
    if (r.probe === 'percent')
      ok('a fill CARRIES the source cell\'s number format (a percent head turns a $mm line into a percentage) — which is why all twelve cover cells ship GENERAL and every one of them is set by a core format beat (r439 `cases`)');
    else bad('the format-smear finding no longer reproduces (' + r.probe + ') — re-read the degradation note in the drill comment');
  }

  /* ================================== §6 ANATOMY =================================== */
  head('§6  ANATOMY — §1.9 tri-length, §2.2 one bonus, §1.0(e) the save closer');
  {
    const a = await page.evaluate(() => {
      loadChallenge('dashcover');
      const C = CHALLENGES.dashcover;
      const cs = C.checks(S);
      return { g: C.guide().length, t: C.targets().length, c: cs.length,
               bonus: cs.filter(x => x.bonus).length, saveBeat: cs.filter(x => x.save).length,
               save: !!C.saveClose, demo: C.demo().length,
               par: C.par, parKeys: C.parKeys, aha: !!C.aha, prompt: (C.prompt || '').length, req: !!C.req };
    });
    /* hkSaveCloseWire has already appended the Ctrl+S beat to all three arrays by the time a
       drill is loaded, so the RUNTIME lengths are equal at 7 — six hand-written beats (five
       cores + the ☆) plus the engine's closer. C9 asserts the hand-written 6 statically. */
    if (a.g === a.t && a.t === a.c && a.c === 7) ok('tri-length holds at runtime: guide ' + a.g + ' · targets ' + a.t + ' · checks ' + a.c + ' (5 cores + ☆ + the engine-appended save closer)');
    else bad('tri-length broken: guide ' + a.g + ' targets ' + a.t + ' checks ' + a.c);
    if (a.bonus === 1) ok('exactly one bonus:true beat (§2.2)'); else bad('bonus count ' + a.bonus);
    if (a.save && a.saveBeat === 1) ok('saveClose declared and the engine appended exactly one closer beat (§1.0(e))'); else bad('saveClose wiring wrong: declared=' + a.save + ' beats=' + a.saveBeat);
    if (a.aha && a.req && a.prompt > 120) ok('aha · req · scenario prompt all present (§1.5, §1.9, §1.7)');
    else bad('missing aha/req/prompt');
  }

  if (errs.length) bad('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log('\n' + (fails ? 'verify-dashcover: ' + fails + ' FAILURE(S)' : 'verify-dashcover: clean'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
