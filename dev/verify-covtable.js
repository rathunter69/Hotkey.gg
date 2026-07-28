/* verify-covtable.js — r447, DEPTH_PASS §4.73 (Models II · "Run the covenant table")
   The drill-specific probe for the covtable depth pass. Self-contained: it names covtable and
   nothing else (the C13 retirement guard), and it defaults to the house port so the integrator
   can run it without an override.

   WHY THIS FILE EXISTS. Three things this drill claims cannot be proved by reading a predicate,
   and the campaign's own record (DEPTH_PASS_CAMPAIGN §1) says every one of the thirteen
   untriggerable beats found so far was found by WALKING a route:
     PART A · board sanity — 20 rows, the density figure, the two test blocks exactly five rows
              apart (the offset the ☆'s paste depends on), block A live, nothing #### at load.
     PART B · the ☆-HEADROOM DIAGNOSTIC (campaign §2), keyed: fastest legal route vs the slowest
              legal route, then the ☆'s own half measured IN ISOLATION against the route it
              exists to beat (the r438 `series` rule — a combined number hides a negative half).
     PART C · §1.0-R3(p) ROUTE WALKS — every Excel route to the same visible end state, driven
              through the real engine, each asserted to clear its beat.
     PART D · SKIPPABILITY (§1.0-R2(i)) — the hand route clears all five cores with the ☆ dark.

   Every count here is `keyLog` through the live engine with EVERY selection and navigation
   KEYED: nav() presses real arrows until the cursor lands, exactly as a player would, so the
   numbers are comparable to the campaign's published spreads. (dev/e2e-par-sweep.js measures the
   DEMO, where setDemoSel parks the cursor for free — that is a different, smaller number by
   design and it is the one parKeys tracks.)

   Run:  node dev/verify-covtable.js            (server on 127.0.0.1:8791)
         URL=http://127.0.0.1:8842/index.html node dev/verify-covtable.js     (worktree port) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '5', 10);

let fails = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message || e).slice(0, 160)));
  /* mirror the real harness init exactly — a probe whose page state differs from the gate's is
     measuring a different product (campaign r440 note: the missing hotkey_onboarded cost a round) */
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1');
      localStorage.setItem('hk_handle_cache', '');
      localStorage.setItem('hk_beta_ok', '1');
      localStorage.setItem('hk_xlv', '2');
    } catch (e) {}
  });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() =>
    typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function' &&
    typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* one shared driver, injected once: every route below is a list of ops it replays with real
     keys, and it returns the keyLog delta plus the live check states. */
  await page.evaluate(() => {
    window.__cv = {};
    const W = window.__cv;
    W.load = () => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      try { window.__hkCelQ = []; } catch (e) {}
      loadChallenge('covtable');
      return CHALLENGES.covtable._o;
    };
    W.nav = (r, c) => { let g = 0;
      while (S.active.r > r && g++ < 60) demoKey({ key: 'ArrowUp' });
      while (S.active.r < r && g++ < 60) demoKey({ key: 'ArrowDown' });
      while (S.active.c > c && g++ < 60) demoKey({ key: 'ArrowLeft' });
      while (S.active.c < c && g++ < 60) demoKey({ key: 'ArrowRight' }); };
    W.rect = (r1, c1, r2, c2) => { W.nav(r1, c1);
      for (let i = r1; i < r2; i++) demoKey({ key: 'ArrowDown', shift: true });
      for (let j = c1; j < c2; j++) demoKey({ key: 'ArrowRight', shift: true }); };
    W.typ = s => { for (const ch of s) demoKey({ key: ch }); demoKey({ key: 'Enter' }); };
    W.keys = () => keyLog.length;
    W.state = () => { const C = CHALLENGES.covtable;
      return { done: (typeof done !== 'undefined') ? done : null,
               checks: C.checks(S).map(x => ({ label: x.label, ok: !!x.ok, bonus: !!x.bonus })) }; };
  });

  const drive = (body, arg) => page.evaluate(new Function('A', 'const W=window.__cv;const o=W.load();' + body), arg);

  /* ---------- shared route fragments (page-side source, spliced into drive()) ---------- */
  const LET = `const c1=o.c0+1, Q=j=>o.qc[j], dB=o.bTot?o.rTot:o.rSen;`;
  const LEV_FILL = `
    W.nav(o.RB,c1); W.typ('=('+Q(0)+dB+'-'+Q(0)+o.rCash+')/'+Q(0)+o.rEb);
    W.rect(o.RB,c1,o.RB,c1+o.NQ-1); demoKey({key:'r',ctrl:true});`;
  const CLONE = `
    W.rect(o.RA+2,c1,o.RA+3,c1+o.NQ-1); demoKey({key:'c',ctrl:true});
    W.nav(o.RB+2,c1); demoKey({key:'v',ctrl:true});`;
  const HAND_HD_FLAG = `
    W.nav(o.RB+2,c1); W.typ('='+Q(0)+(o.RB+1)+'-'+Q(0)+o.RB);
    W.rect(o.RB+2,c1,o.RB+2,c1+o.NQ-1); demoKey({key:'r',ctrl:true});
    W.nav(o.RB+3,c1); W.typ('=IF('+Q(0)+(o.RB+2)+'>=0,1,0)');
    W.rect(o.RB+3,c1,o.RB+3,c1+o.NQ-1); demoKey({key:'r',ctrl:true});`;
  const MIN_RANGE = `
    W.nav(o.rMin,c1); W.typ('=MIN('+o.hdRng+')');`;
  const DRESS_SAVE = `
    W.nav(o.rMin,c1); demoKey({key:'b',ctrl:true});
    demoKey({key:'Alt'});demoKey({key:'h',code:'KeyH'});demoKey({key:'b',code:'KeyB'});demoKey({key:'p',code:'KeyP'});
    demoKey({key:'s',ctrl:true});`;
  const RET = `return {keys:W.keys(), ...W.state()};`;

  const median = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const names = c => c.filter(x => !x.ok).map(x => x.label);

  /* ================= PART A — board sanity ================= */
  console.log('\nPART A — board sanity (' + REPS + ' seeds)');
  {
    const rows = [];
    for (let i = 0; i < REPS; i++) {
      rows.push(await drive(`
        const cells=S.cells, cel=k=>cells[k]||{};
        const c1=o.c0+1;
        let dense=0; for(let r=1;r<=S.ROWS;r++){ let has=false;
          for(let c=1;c<=10;c++){ const x=cells[colLetter(c)+r]; if(x && x.value!==null && x.value!==''){has=true;break;} }
          if(has) dense++; }
        let over=0; for(let c=1;c<=10;c++) if(overflowsCol(S,c)) over++;
        let clip=0;  for(let c=1;c<=10;c++) if(clipsCol(S,c)) clip++;
        const blockA=[0,1,2,3].every(k=>o.qc.every(q=>{const x=cel(q+(o.RA+k)); return x.value!==null;}));
        const blockBempty=o.qc.every(q=>cel(q+o.RB).value===null && cel(q+(o.RB+2)).value===null && cel(q+(o.RB+3)).value===null);
        const blueInputs=[o.rEb,o.rSen,o.rTot,o.rCash,o.RA+1,o.RB+1].every(r=>o.qc.every(q=>cel(q+r).fontColor==='blue'));
        const blackFormulas=o.qc.every(q=>!cel(q+o.RA).fontColor && !cel(q+(o.RA+2)).fontColor);
        return {ROWS:S.ROWS, dense, over, clip, off:o.RB-o.RA, blockA, blockBempty, blueInputs, blackFormulas,
                pinch:o.pinch, breach:o.minB<0, minB:Math.round(o.minB*100)/100,
                lvl:o.covB.join('/'), test:o.bTot?'total':'senior', c0:o.c0,
                hdrOk:o.qc.every(q=>cel(q+o.rHdr).bb===true)};
      `));
    }
    const r0 = rows[0];
    rows.every(r => r.ROWS === 20) ? ok('ROWS=20 on every seed') : bad('ROWS is not 20 on every seed: ' + rows.map(r => r.ROWS).join(','));
    const dn = rows.map(r => r.dense);
    (Math.min.apply(null, dn) >= 12) ? ok('load-state density ' + Math.min.apply(null, dn) + '–' + Math.max.apply(null, dn) + '/20 rows (win state adds none — every row ships labelled)')
                                     : bad('density below the §1.3 floor: ' + dn.join(','));
    rows.every(r => r.over === 0) ? ok('no column shows #### at load') : bad('#### at load on some seed');
    rows.every(r => r.clip === 0) ? ok('no label clipped at load') : bad('a label is clipped at load: ' + rows.map(r => r.clip).join(','));
    rows.every(r => r.off === 5) ? ok('the two test blocks are exactly 5 rows apart (the ☆ paste offset)') : bad('block offset drifted: ' + rows.map(r => r.off).join(','));
    rows.every(r => r.blockA) ? ok('block A (the finished test) ships complete on every seed') : bad('block A is not complete on some seed');
    rows.every(r => r.blockBempty) ? ok('block B ships with its three derived lines empty') : bad('block B is not empty on some seed');
    rows.every(r => r.blueInputs) ? ok('MODELING_STANDARDS §1: every typed input is blue') : bad('an input is not blue');
    rows.every(r => r.blackFormulas) ? ok('MODELING_STANDARDS §1: every computed cell is black') : bad('a computed cell carries ink');
    rows.every(r => r.hdrOk) ? ok('doctrine §2.1b: bottom border under the column headers') : bad('header border missing');
    const seeds = new Set(rows.map(r => r.test + '|' + r.c0));
    console.log('       seeds: ' + rows.map(r => r.test + ' c0=' + r.c0 + ' pinch=Q' + (r.pinch + 1) + ' min=' + r.minB + (r.breach ? ' BREACH' : '') + ' cov=' + r.lvl).join('\n              '));
    (seeds.size > 1 || REPS < 3) ? ok('randomization axes (d)/(a) both move across seeds') : bad('every seed produced the same test/column — randomization is stuck');
  }

  /* ================= PART B — the ☆-headroom diagnostic ================= */
  console.log('\nPART B — ☆-headroom diagnostic, every selection and navigation KEYED');
  let fastMed = 0, slowMed = 0;
  {
    const fast = [], slow = [], cloneHalf = [], handHalf = [];
    for (let i = 0; i < REPS; i++) {
      const f = await drive(LET + LEV_FILL + `const k0=W.keys();` + CLONE + `const k1=W.keys();` + MIN_RANGE + DRESS_SAVE + `return {keys:W.keys(), half:k1-k0, ...W.state()};`);
      if (f.checks.some(c => !c.ok)) bad('the fast route did not clear every beat: ' + names(f.checks).join(' | '));
      fast.push(f.keys); cloneHalf.push(f.half);
      const h = await drive(LET + LEV_FILL + `const k0=W.keys();` + HAND_HD_FLAG + `const k1=W.keys();` + MIN_RANGE + DRESS_SAVE + `return {keys:W.keys(), half:k1-k0, ...W.state()};`);
      handHalf.push(h.half);
      const s = await drive(LET + `
        for(let j=0;j<o.NQ;j++){ W.nav(o.RB,c1+j); W.typ('=('+Q(j)+dB+'-'+Q(j)+o.rCash+')/'+Q(j)+o.rEb); }
        for(let j=0;j<o.NQ;j++){ W.nav(o.RB+2,c1+j); W.typ('='+Q(j)+(o.RB+1)+'-'+Q(j)+o.RB); }
        for(let j=0;j<o.NQ;j++){ W.nav(o.RB+3,c1+j); W.typ('=IF('+Q(j)+(o.RB+2)+'>=0,1,0)'); }
        W.nav(o.rMin,c1); W.typ('=MIN('+o.qc.map(q=>q+(o.RB+2)).join(',')+')');
      ` + DRESS_SAVE + RET);
      if (s.checks.filter(c => !c.bonus).some(c => !c.ok)) bad('the slow route did not clear every core: ' + names(s.checks).join(' | '));
      slow.push(s.keys);
    }
    fastMed = median(fast); slowMed = median(slow);
    const chMed = median(cloneHalf), hhMed = median(handHalf);
    console.log('       PART 1  fastest legal ' + fastMed + ' keys  ·  slowest legal ' + slowMed + ' keys  ·  spread ' + (slowMed / fastMed).toFixed(1) + '×');
    console.log('       PART 3  the ☆ half in isolation: clone ' + chMed + ' keys  vs  hand-built ' + hhMed + ' keys  ·  ' + (hhMed / chMed).toFixed(1) + '×');
    (slowMed / fastMed >= 1.3) ? ok('spread clears the campaign §2 warning line (1.3×)') : bad('spread ' + (slowMed / fastMed).toFixed(2) + '× is under the warning line — the drill may be a motif');
    /* the failure this asserts against is the one that retired a drill in r436: a star route
       that measures WORSE than the route it exists to beat. Named by round, not by key — the
       C13 guard forbids a harness from quoting a retired drill's key. */
    (chMed < hhMed) ? ok('the ☆ half is POSITIVE measured on its own (the r438 isolate-each-half rule)') : bad('the ☆ half measures worse than the route it beats — the r436 retirement failure');
  }

  /* ================= PART C — §1.0-R3(p) route walks ================= */
  console.log('\nPART C — every enumerated route to the same end state clears its beat');
  {
    const R = [
      ['ribbon fill (Alt H F I R) instead of Ctrl+R, everywhere', LET + `
        W.nav(o.RB,c1); W.typ('=('+Q(0)+dB+'-'+Q(0)+o.rCash+')/'+Q(0)+o.rEb);
        const rib=()=>{demoKey({key:'Alt'});demoKey({key:'h',code:'KeyH'});demoKey({key:'f',code:'KeyF'});demoKey({key:'i',code:'KeyI'});demoKey({key:'r',code:'KeyR'});};
        W.rect(o.RB,c1,o.RB,c1+o.NQ-1); rib();
        W.nav(o.RB+2,c1); W.typ('='+Q(0)+(o.RB+1)+'-'+Q(0)+o.RB); W.rect(o.RB+2,c1,o.RB+2,c1+o.NQ-1); rib();
        W.nav(o.RB+3,c1); W.typ('=IF('+Q(0)+(o.RB+2)+'>=0,1,0)'); W.rect(o.RB+3,c1,o.RB+3,c1+o.NQ-1); rib();
      ` + MIN_RANGE + DRESS_SAVE + RET, 'core'],
      ['leverage split across two quotients (=debt/EBITDA − cash/EBITDA)', LET + `
        W.nav(o.RB,c1); W.typ('='+Q(0)+dB+'/'+Q(0)+o.rEb+'-'+Q(0)+o.rCash+'/'+Q(0)+o.rEb);
        W.rect(o.RB,c1,o.RB,c1+o.NQ-1); demoKey({key:'r',ctrl:true});
      ` + HAND_HD_FLAG + MIN_RANGE + DRESS_SAVE + RET, 'core'],
      ['flag written the other way round (=IF(covenant>=leverage,1,0))', LET + LEV_FILL + `
        W.nav(o.RB+2,c1); W.typ('='+Q(0)+(o.RB+1)+'-'+Q(0)+o.RB);
        W.rect(o.RB+2,c1,o.RB+2,c1+o.NQ-1); demoKey({key:'r',ctrl:true});
        W.nav(o.RB+3,c1); W.typ('=IF('+Q(0)+(o.RB+1)+'>='+Q(0)+o.RB+',1,0)');
        W.rect(o.RB+3,c1,o.RB+3,c1+o.NQ-1); demoKey({key:'r',ctrl:true});
      ` + MIN_RANGE + DRESS_SAVE + RET, 'core'],
      ['flag inverted (=IF(headroom<0,0,1))', LET + LEV_FILL + `
        W.nav(o.RB+2,c1); W.typ('='+Q(0)+(o.RB+1)+'-'+Q(0)+o.RB);
        W.rect(o.RB+2,c1,o.RB+2,c1+o.NQ-1); demoKey({key:'r',ctrl:true});
        W.nav(o.RB+3,c1); W.typ('=IF('+Q(0)+(o.RB+2)+'<0,0,1)');
        W.rect(o.RB+3,c1,o.RB+3,c1+o.NQ-1); demoKey({key:'r',ctrl:true});
      ` + MIN_RANGE + DRESS_SAVE + RET, 'core'],
      ['MIN over five named cells instead of a range', LET + LEV_FILL + HAND_HD_FLAG + `
        W.nav(o.rMin,c1); W.typ('=MIN('+o.qc.map(q=>q+(o.RB+2)).join(',')+')');
      ` + DRESS_SAVE + RET, 'core'],
      ['outside border on the 1×1 (Alt H B S → ball) + bold via Alt H 1', LET + LEV_FILL + HAND_HD_FLAG + MIN_RANGE + `
        W.nav(o.rMin,c1);
        demoKey({key:'Alt'});demoKey({key:'h',code:'KeyH'});demoKey({key:'1',code:'Digit1'});
        demoKey({key:'Alt'});demoKey({key:'h',code:'KeyH'});demoKey({key:'b',code:'KeyB'});demoKey({key:'s',code:'KeyS'});
        demoKey({key:'s',ctrl:true});
      ` + RET, 'core'],
      ['ALL borders on the 1×1 (Alt H B A)', LET + LEV_FILL + HAND_HD_FLAG + MIN_RANGE + `
        W.nav(o.rMin,c1); demoKey({key:'b',ctrl:true});
        demoKey({key:'Alt'});demoKey({key:'h',code:'KeyH'});demoKey({key:'b',code:'KeyB'});demoKey({key:'a',code:'KeyA'});
        demoKey({key:'s',ctrl:true});
      ` + RET, 'core'],
      ['☆ via the legacy paste-special dialog, FORMULAS (Alt E S F ↵)', LET + LEV_FILL + `
        W.rect(o.RA+2,c1,o.RA+3,c1+o.NQ-1); demoKey({key:'c',ctrl:true});
        W.nav(o.RB+2,c1);
        demoKey({key:'Alt'});demoKey({key:'e',code:'KeyE'});demoKey({key:'s',code:'KeyS'});demoKey({key:'f',code:'KeyF'});demoKey({key:'Enter'});
      ` + MIN_RANGE + DRESS_SAVE + RET, 'all'],
      ['☆ with the label column in the copied block (A:F, landed on the label)', LET + LEV_FILL + `
        W.rect(o.RA+2,o.c0,o.RA+3,c1+o.NQ-1); demoKey({key:'c',ctrl:true});
        W.nav(o.RB+2,o.c0); demoKey({key:'v',ctrl:true});
      ` + MIN_RANGE + DRESS_SAVE + RET, 'all'],
    ];
    for (const [name, body, want] of R) {
      let worst = null;
      for (let i = 0; i < Math.min(REPS, 3); i++) {
        const r = await drive(body);
        const miss = r.checks.filter(c => want === 'all' ? !c.ok : (!c.bonus && !c.ok)).map(c => c.label);
        if (miss.length) { worst = miss; break; }
      }
      worst ? bad(name + ' → DARK: ' + worst.join(' | ')) : ok(name);
    }
  }

  /* ================= PART D — the ☆ is skippable ================= */
  console.log('\nPART D — §1.0-R2(i): the ☆ is a distinct, skippable decision');
  {
    let allCore = true, starLit = false;
    for (let i = 0; i < REPS; i++) {
      const r = await drive(LET + LEV_FILL + HAND_HD_FLAG + MIN_RANGE + DRESS_SAVE + RET);
      if (r.checks.filter(c => !c.bonus).some(c => !c.ok)) allCore = false;
      if (r.checks.find(c => c.bonus).ok) starLit = true;
      if (r.done !== true) allCore = false;
    }
    allCore ? ok('the hand route wins the drill — every core beat green, the win flag set') : bad('the hand route does not win');
    starLit ? bad('the ☆ fired on the hand route — it is not skippable') : ok('the ☆ stays DARK on the hand route (' + REPS + ' seeds)');
  }

  /* ================= PART E — par-relevant spread of the DEMO ================= */
  console.log('\nPART E — demo keystroke count across ' + (REPS * 3) + ' seeds (what parKeys tracks)');
  {
    const counts = [];
    for (let i = 0; i < REPS * 3; i++) {
      counts.push(await page.evaluate(() => {
        document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
        loadChallenge('covtable');
        const C = CHALLENGES.covtable;
        for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
        return done ? keyLog.length : -1;
      }));
    }
    const bad0 = counts.filter(c => c < 0).length;
    bad0 ? bad(bad0 + ' demo replay(s) did not win') : ok('every demo replay won');
    console.log('       median ' + median(counts) + '  min ' + Math.min.apply(null, counts) + '  max ' + Math.max.apply(null, counts));
  }

  if (pageErrors.length) bad('page errors: ' + [...new Set(pageErrors)].slice(0, 4).join(' | '));
  await browser.close();
  console.log('\n' + (fails ? 'verify-covtable: ' + fails + ' FAILURE(S)' : 'verify-covtable: ALL GREEN'));
  process.exit(fails ? 1 : 0);
})();
