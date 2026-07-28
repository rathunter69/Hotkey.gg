/* verify-cascade.js — the drill-specific instrument for `cascade` (DEPTH_PASS §4.77, the
   Models II ★ capstone), r447.

   dev/e2e-depth-contract.js already proves everything the depth-pass standard promises
   GENERICALLY (demo clears core + earns the ☆ · the mystery slot · saveClose · beat count ·
   randomisation axes · same-seed determinism · density · zero page errors). This file proves
   the things that are specific to THIS board and could not be asserted generically:

     A  COPY + CONTRACT — every check label opens with a §1.7 closed-list verb, carries no chord
        name, and none of the C11-rejected phrasings; tri-length holds at runtime.
     B  BORDER + BOLD ROUTE MATRIX (§1.0-R3(p)) — every ribbon route that draws a line ABOVE the
        total row clears the dress beat, and the bottom-only route correctly does not.
     C  FORMULA ROUTE MATRIX (§1.0-R3(p)) — MIN vs IF, anchored vs bare, fill vs typed,
        =SUM(a,b,c) vs an addition chain: same board, every core clears.
     D  THE ☆ — earned by three independent constructions of the same identity, dark at load,
        dark on the slow route (§1.0-R2(i) skippability), and not clearable by a typed zero.
        Plus the demonstration of what the check line is FOR: a plausible mis-netted MIN leaves
        a board whose figures all look sane and whose total still foots, and the check line is
        the only cell on the page that says so.
     E  BOARD + MODEL INVARIANTS — 20 rows · win-state density · the sizing identity that makes
        the ☆ true (total cash applied < total opening debt, so every dollar lands) over 40
        seeds · colour-as-provenance (MODELING_STANDARDS §1) · the corkscrew's openings are
        REFERENCES not repeats (§3) · geometry moats between the three tranche blocks ·
        par-key flatness across 20 seeds.
     F  FRAME FIT — the sheet inside the gridwrap box at 1024 / 1180 / 1440.

   Run: node dev/verify-cascade.js        (server on 127.0.0.1:8791)
        URL=http://127.0.0.1:8873/index.html node dev/verify-cascade.js     (a worktree port) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';

let fails = 0;
const ok = (cond, msg, extra) => {
  if (cond) console.log('  ok   ' + msg);
  else { fails++; console.log('  FAIL ' + msg + (extra !== undefined ? '  ' + JSON.stringify(extra).slice(0, 300) : '')); }
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  /* mirror the real harness init — a probe that skips these renders the onboarding flow and
     every number it reports is a lie (the r440 hotkey_onboarded lesson) */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
    localStorage.setItem('hk_handle_cache', ''); localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function'
    && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* one page-side toolkit every section reuses */
  await page.evaluate(() => {
    window.__cx = {
      load(){ document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
        loadChallenge('cascade'); const C = CHALLENGES.cascade; return { C, o: C._o, R: C._o.R, Y: C._o.Y }; },
      run(moves){ for (const m of moves) { setDemoSel(m.sel); for (const k of m.keys) demoKey(k); } },
      rows(){ return CHALLENGES.cascade.checks(S); },
      cores(){ return this.rows().filter(x => !x.bonus && !x.save); },
      star(){ return !!(this.rows().find(x => x.bonus) || {}).ok; },
      type(sel, txt){ setDemoSel(sel); for (const ch of txt) demoKey({ key: ch }); demoKey({ key: 'Enter' }); },
      /* every WORK beat, but NOT the engine-appended Ctrl+S closer: a won drill locks the board
         and its celebration overlay owns the keyboard, so a probe that finishes the run measures
         nothing afterwards and reports it as a product defect (campaign: suspect the probe) */
      work(){ return CHALLENGES.cascade.demo().slice(0, -1); },
      solve(){ this.run(this.work()); },
      RT(n){ const a = []; for (let i = 0; i < n; i++) a.push({ key: 'ArrowRight', shift: true }); return a; },
    };
  });

  // ── A · COPY + CONTRACT ────────────────────────────────────────────────────────────────
  console.log('\nA. copy + contract (§1.7 closed verbs · §1.0-R3(n) · §1.9 tri-length)');
  const A = await page.evaluate(() => {
    const VERBS = ['Add','Autofit','Bold','Build','Center','Clear','Collect','Color','Comma-format','Copy','Cut',
      'Delete','Dollar-format','Enter','Fill','Filter','Find','Finish','Fix','Flip','Fold','Group','Indent','Insert',
      'Italicize','Left-align','Move','Paste','Percent-format','Reference','Repoint','Select','Set','Sort','Total',
      'Trace','Transpose','Unbold','Underline','Undo','Unhide','Unfold','Wrap','Save'];
    const { C } = __cx.load();
    const rows = C.checks(S), g = C.guide(), t = C.targets();
    const labels = rows.map(r => r.label);
    const badVerb = labels.filter(l => !VERBS.includes(l.split(' ')[0]));
    const chords = labels.filter(l => /\b(ctrl|alt|shift|f4|f9|f2)\b/i.test(l));
    const APH = ['headers carry the page','a total earns the line above it','the page ties','the page carries a masthead',
      'annotations whisper','a clean model greets the reader','totals rule on top','one selection, one chord'];
    const aph = labels.filter(l => APH.some(a => l.toLowerCase().includes(a)));
    const long = labels.filter(l => l.split(' ').length - 1 > 14);
    return { n: rows.length, guide: g.length, targets: t.length, badVerb, chords, aph, long,
             bonus: rows.filter(r => r.bonus).length, labels };
  });
  ok(A.n === A.guide && A.n === A.targets, 'tri-length holds at runtime: checks=' + A.n + ' guide=' + A.guide + ' targets=' + A.targets);
  ok(A.n === 8, '8 rows at runtime — 6 authored cores + the ☆ + the engine-appended save', A.n);
  ok(A.bonus === 1, 'exactly one ☆ bonus row (§1.1)');
  ok(!A.badVerb.length, 'every check label opens with a §1.7 closed-list verb', A.badVerb);
  ok(!A.chords.length, 'no chord name in any check label (§1.7 R7)', A.chords);
  ok(!A.aph.length, 'no rejected aphorism in any check label (§1.0-R3(n))', A.aph);
  ok(!A.long.length, 'every label ≤ ~14 words after its verb (§1.7 R8)', A.long);

  // ── B · BORDER + BOLD ROUTE MATRIX ─────────────────────────────────────────────────────
  console.log('\nB. dress route matrix (§1.0-R3(p) — every route that draws a line ABOVE clears)');
  const B = await page.evaluate(() => {
    const L = ch => ({ key: ch.toLowerCase(), code: 'Key' + ch.toUpperCase() });
    const D = n => ({ key: String(n), code: 'Digit' + n });
    const out = {};
    const dressBeat = () => __cx.rows()[5].ok;   // beat 6 — bold + the top rule
    for (const [name, bold, border] of [
      ['ctrl+B · Alt H B P (top)',        [{key:'b',ctrl:true}], [{key:'Alt'},L('h'),L('b'),L('p')]],
      ['Alt H 1 · Alt H B S (outside)',   [{key:'Alt'},L('h'),D(1)], [{key:'Alt'},L('h'),L('b'),L('s')]],
      ['ctrl+B · Alt H B A (all → ball)', [{key:'b',ctrl:true}], [{key:'Alt'},L('h'),L('b'),L('a')]],
      ['ctrl+B · Alt H B T (thick box)',  [{key:'b',ctrl:true}], [{key:'Alt'},L('h'),L('b'),L('t')]],
      ['ctrl+B · Alt H B D (top+bottom)', [{key:'b',ctrl:true}], [{key:'Alt'},L('h'),L('b'),L('d')]],
      ['ctrl+B · Alt H B O (bottom ONLY)',[{key:'b',ctrl:true}], [{key:'Alt'},L('h'),L('b'),L('o')]],
    ]) {
      const { o, R, Y } = __cx.load(); __cx.solve();
      // strip the demo's dress, then re-apply it by this route
      for (let i = 0; i < 4; i++) { const c = S.cells[Y[i] + R.tot]; c.bold = false; c.bt = false; c.bb = false; c.ball = false; c.thick = false; }
      const before = dressBeat();
      setDemoSel(o.CA + R.tot); for (const k of [...__cx.RT(4), ...bold, ...border]) demoKey(k);
      out[name] = { before, after: dressBeat() };
    }
    return out;
  });
  for (const k of Object.keys(B)) {
    const wantAfter = !/bottom ONLY/.test(k);
    ok(B[k].before === false && B[k].after === wantAfter,
      'dress beat ' + (wantAfter ? 'CLEARS' : 'stays dark') + ' via ' + k, B[k]);
  }

  // ── C · FORMULA ROUTE MATRIX ───────────────────────────────────────────────────────────
  console.log('\nC. formula route matrix (§1.0-R3(p) — the untriggerable-beat class)');
  const C1 = await page.evaluate(() => {
    const L = ch => ({ key: ch.toLowerCase(), code: 'Key' + ch.toUpperCase() });
    const out = {}, miss = {};
    const coresClear = (tag) => { const bad = __cx.cores().filter(x => !x.ok).map(x => x.label);
      if (bad.length) miss[tag] = bad; return !bad.length; };
    const dress = (o, R) => { setDemoSel(o.CA + R.tot);
      for (const k of [...__cx.RT(4), { key: 'b', ctrl: true }, { key: 'Alt' }, L('h'), L('b'), L('p')]) demoKey(k); };
    // route 1 — IF instead of MIN, everywhere, typed year by year (no fill anywhere)
    { const { o, R, Y } = __cx.load();
      for (let i = 0; i < 4; i++) { const y = Y[i], p = i ? Y[i - 1] : null;
        if (p) { __cx.type(y + R.rb, '=' + p + R.re); __cx.type(y + R.tb, '=' + p + R.te); __cx.type(y + R.mb, '=' + p + R.me); }
        __cx.type(y + R.rp, '=IF(' + y + R.cash + '<' + y + R.rb + ',' + y + R.cash + ',' + y + R.rb + ')');
        __cx.type(y + R.re, '=' + y + R.rb + '-' + y + R.rp);
        __cx.type(y + R.tp, '=IF(' + y + R.cash + '-' + y + R.rp + '<' + y + R.tb + ',' + y + R.cash + '-' + y + R.rp + ',' + y + R.tb + ')');
        __cx.type(y + R.te, '=' + y + R.tb + '-' + y + R.tp);
        __cx.type(y + R.mp, '=IF(' + y + R.cash + '-' + y + R.rp + '-' + y + R.tp + '<' + y + R.mb + ',' + y + R.cash + '-' + y + R.rp + '-' + y + R.tp + ',' + y + R.mb + ')');
        __cx.type(y + R.me, '=' + y + R.mb + '-' + y + R.mp);
        __cx.type(y + R.tot, '=SUM(' + y + R.re + ',' + y + R.te + ',' + y + R.me + ')'); }
      dress(o, R); out.ifForm = coresClear('ifForm'); }
    // route 2 — ANCHORED references throughout the year-one column, then filled
    { const { o, R, Y } = __cx.load(); const A = c => '$' + c[0] + '$' + c.slice(1);
      __cx.type(Y[0] + R.rp, '=MIN(' + A(Y[0] + R.rb) + ',' + A(Y[0] + R.cash) + ')');
      __cx.type(Y[0] + R.re, '=' + A(Y[0] + R.rb) + '-' + A(Y[0] + R.rp));
      __cx.type(Y[0] + R.tp, '=MIN(' + A(Y[0] + R.tb) + ',' + A(Y[0] + R.cash) + '-' + A(Y[0] + R.rp) + ')');
      __cx.type(Y[0] + R.te, '=' + A(Y[0] + R.tb) + '-' + A(Y[0] + R.tp));
      __cx.type(Y[0] + R.mp, '=MIN(' + A(Y[0] + R.mb) + ',' + A(Y[0] + R.cash) + '-' + A(Y[0] + R.rp) + '-' + A(Y[0] + R.tp) + ')');
      __cx.type(Y[0] + R.me, '=' + A(Y[0] + R.mb) + '-' + A(Y[0] + R.mp));
      __cx.type(Y[0] + R.tot, '=' + Y[0] + R.re + '+' + Y[0] + R.te + '+' + Y[0] + R.me);
      for (let i = 1; i < 4; i++) { const y = Y[i], p = Y[i - 1];
        __cx.type(y + R.rb, '=' + p + R.re); __cx.type(y + R.tb, '=' + p + R.te); __cx.type(y + R.mb, '=' + p + R.me);
        __cx.type(y + R.rp, '=MIN(' + y + R.rb + ',' + y + R.cash + ')');
        __cx.type(y + R.re, '=' + y + R.rb + '-' + y + R.rp);
        __cx.type(y + R.tp, '=MIN(' + y + R.tb + ',' + y + R.cash + '-' + y + R.rp + ')');
        __cx.type(y + R.te, '=' + y + R.tb + '-' + y + R.tp);
        __cx.type(y + R.mp, '=MIN(' + y + R.mb + ',' + y + R.cash + '-' + y + R.rp + '-' + y + R.tp + ')');
        __cx.type(y + R.me, '=' + y + R.mb + '-' + y + R.mp);
        __cx.type(y + R.tot, '=' + y + R.re + '+' + y + R.te + '+' + y + R.me); }
      dress(o, R); out.anchoredYear1 = coresClear('anchoredYear1'); }
    // route 3 — the demo (MIN + block fills + an addition-chain total)
    { __cx.load(); __cx.solve(); out.demo = coresClear('demo'); }
    // route 4 — a HARDCODED paydown row must NOT clear (MODELING_STANDARDS §1 corollary,
    //           doctrine §2.2's sanctioned live-formula exception: "Build" means a live formula)
    { const { o, R, Y } = __cx.load(); __cx.solve();
      const exp = CHALLENGES.cascade._exp;
      for (let i = 0; i < 4; i++) __cx.type(Y[i] + R.rp, String(exp[i].rp));
      out.hardcodedRejected = !__cx.cores()[0].ok; }
    out.miss = miss; return out;
  });
  ok(C1.ifForm, 'IF instead of MIN, every year typed, no fill anywhere — all six cores clear', C1.miss);
  ok(C1.anchoredYear1, 'anchored references in the year-one column — all six cores clear', C1.miss);
  ok(C1.demo, 'the taught route (MIN + pair fills + addition-chain total) — all six cores clear');
  ok(C1.hardcodedRejected, 'a paydown row TYPED as constants does NOT clear (§1.7 "Build" = a live formula)');

  // ── D · THE ☆ ──────────────────────────────────────────────────────────────────────────
  console.log('\nD. the ☆ — the independent prove-out (§1.0-R4(u) · §1.0-R2(i) skippability)');
  const Dv = await page.evaluate(() => {
    const out = {};
    { __cx.load(); out.darkAtLoad = !__cx.star(); }
    // three independent constructions of the same identity
    const build = (mk) => { const { o, R, Y } = __cx.load(); __cx.solve();
      const c = S.cells[Y[0] + R.chk]; c.formula = null; c.value = null; render();
      const wasDark = !__cx.star(); __cx.type(Y[0] + R.chk, mk(R, Y)); return { wasDark, star: __cx.star() }; };
    out.openLessClose = build((R, Y) => '=' + Y[0] + R.rb + '+' + Y[0] + R.tb + '+' + Y[0] + R.mb + '-' + Y[3] + R.tot + '-SUM(' + Y[0] + R.cash + ':' + Y[3] + R.cash + ')');
    out.paydownRollup = build((R, Y) => '=SUM(' + Y[0] + R.rp + ':' + Y[3] + R.rp + ')+SUM(' + Y[0] + R.tp + ':' + Y[3] + R.tp + ')+SUM(' + Y[0] + R.mp + ':' + Y[3] + R.mp + ')-SUM(' + Y[0] + R.cash + ':' + Y[3] + R.cash + ')');
    out.negatedForm = build((R, Y) => '=-(SUM(' + Y[0] + R.cash + ':' + Y[3] + R.cash + ')-' + Y[0] + R.rb + '-' + Y[0] + R.tb + '-' + Y[0] + R.mb + '+' + Y[3] + R.tot + ')');
    // a typed zero is not a check
    { const { o, R, Y } = __cx.load(); __cx.solve();
      const c = S.cells[Y[0] + R.chk]; c.formula = null; c.value = null; render();
      __cx.type(Y[0] + R.chk, '=0'); out.typedZeroRejected = !__cx.star(); }
    // skippability: the whole board solved with the check line never touched
    { const { o, R, Y } = __cx.load();
      __cx.run(__cx.work().filter(m => m.sel !== Y[0] + R.chk));
      out.skipCores = __cx.cores().every(x => x.ok); out.skipStar = __cx.star(); }
    // WHAT THE CHECK IS FOR: a plausible mis-netted junior MIN — the junior forgets the term
    // loan took its cut. Every figure on the page is still a sane magnitude and the total row
    // still foots to the three endings; only the check line says the page is wrong.
    { const { o, R, Y } = __cx.load(); __cx.solve();
      for (let i = 0; i < 4; i++) __cx.type(Y[i] + R.mp, '=MIN(' + Y[i] + R.mb + ',' + Y[i] + R.cash + '-' + Y[i] + R.rp + ')');
      const n = k => S.cells[k] ? S.cells[k].value : null;
      let footsAnyway = true, allSane = true;
      for (let i = 0; i < 4; i++) {
        if (Math.abs(n(Y[i] + R.tot) - (n(Y[i] + R.re) + n(Y[i] + R.te) + n(Y[i] + R.me))) > 0.5) footsAnyway = false;
        [R.rp, R.tp, R.mp, R.re, R.te, R.me, R.tot].forEach(r => { const v = n(Y[i] + r); if (!(v >= 0 && v < 100000)) allSane = false; });
      }
      out.plantedFoots = footsAnyway; out.plantedSane = allSane;
      out.plantedCheckNonZero = Math.abs(n(Y[0] + R.chk)) > 0.5;
    }
    return out;
  });
  ok(Dv.darkAtLoad, 'the ☆ is dark at load (§2.2 mystery slot)');
  for (const k of ['openLessClose', 'paydownRollup', 'negatedForm'])
    ok(Dv[k].wasDark && Dv[k].star, 'the ☆ is earned by the ' + k + ' construction of the identity', Dv[k]);
  ok(Dv.typedZeroRejected, 'a typed "=0" does NOT earn the ☆ — a check has to reference the sheet');
  ok(Dv.skipCores && !Dv.skipStar, 'SKIPPABLE (§1.0-R2(i)): every core clears with the check line never built, ☆ dark', Dv);
  ok(Dv.plantedFoots && Dv.plantedSane && Dv.plantedCheckNonZero,
    'what the check is FOR: a mis-netted junior MIN leaves sane figures and a total that still foots — only the check line reads non-zero', Dv);

  // ── E · BOARD + MODEL INVARIANTS ───────────────────────────────────────────────────────
  console.log('\nE. board + model invariants (§1.2/§1.3 · MODELING_STANDARDS §1/§3/§7)');
  const E = await page.evaluate(() => {
    const out = { badSizing: [], badProv: [], sigs: {}, rows: new Set(), reach: {} };
    for (let s = 0; s < 40; s++) {
      const { o, R, Y } = __cx.load();
      out.rows[S.ROWS] = 1; out.ROWS = S.ROWS;
      const exp = CHALLENGES.cascade._exp;
      const cashSum = o.cash.reduce((a, b) => a + b, 0);
      const debtSum = o.open.reduce((a, b) => a + b, 0);
      const paid = exp.reduce((a, e) => a + e.rp + e.tp + e.mp, 0);
      // THE SIZING IDENTITY the ☆ depends on: every dollar of cash lands on a facility
      if (!(cashSum < debtSum && Math.abs(paid - cashSum) < 0.5 && o.cash.every(c => c > 0)))
        out.badSizing.push({ cashSum, debtSum, paid, cash: o.cash });
      out.reach[o.reach] = (out.reach[o.reach] || 0) + 1;
      // colour-as-provenance at LOAD: the four cash cells and the three opening balances are
      // the only blue cells; nothing else on the board is coloured
      const blue = Object.keys(S.cells).filter(k => S.cells[k].fontColor === 'blue').sort();
      const wantBlue = [Y[0] + R.rb, Y[0] + R.tb, Y[0] + R.mb, ...Y.map(y => y + R.cash)].sort();
      if (JSON.stringify(blue) !== JSON.stringify(wantBlue)) out.badProv.push({ blue, wantBlue });
      out.sigs[JSON.stringify(o) ] = 1;
    }
    out.distinct = Object.keys(out.sigs).length;
    // same-seed determinism is depth-contract's job; here: the SOLVED board's model shape
    const { o, R, Y } = __cx.load(); __cx.solve();
    out.openingsAreRefs = [1, 2, 3].every(i => [R.rb, R.tb, R.mb].every(r => {
      const c = S.cells[Y[i] + r]; return !!(c && c.formula); }));
    out.totalHasTopRule = [0, 1, 2, 3].every(i => { const c = S.cells[Y[i] + R.tot]; return !!(c.bt || c.ball) && !!c.bold; });
    out.noBottomRuleUnderTotal = [0, 1, 2, 3].every(i => !S.cells[Y[i] + R.tot].bb);
    // §1.3 density at the win state
    const used = new Set();
    for (const k of Object.keys(S.cells)) { const c = S.cells[k];
      if (c && ((c.value !== '' && c.value != null) || c.formula)) used.add(+k.replace(/^[A-J]+/, '')); }
    out.density = used.size;
    // geometry moats: a Ctrl+Shift+↓ started in one tranche must not ride into the next
    const ride = (startRow) => { S.active = { r: startRow, c: o.c0 + 1 }; S.sel = null; render();
      demoKey({ key: 'ArrowDown', ctrl: true, shift: true }); return S.active.r; };
    out.moatRev = ride(R.rb); out.moatTl = ride(R.tb); out.moatMz = ride(R.mb);
    out.wantRev = R.re; out.wantTl = R.te; out.wantMz = R.me;
    return out;
  });
  ok(E.ROWS === 20, 'ROWS = 20 (§1.3, Wolf r440 — floor AND cap)', E.ROWS);
  ok(E.density >= 12, 'win-state density ' + E.density + '/20 = ' + Math.round(E.density / 20 * 100) + '% (§1.3 target ≥60%)');
  ok(!E.badSizing.length, 'over 40 seeds the sizing identity holds: total cash applied < total opening debt AND every dollar lands', E.badSizing.slice(0, 2));
  ok(Object.keys(E.reach).length === 2, 'the which-one-bites axis fires both ways across 40 seeds', E.reach);
  ok(E.distinct >= 30, E.distinct + '/40 distinct boards (§1.2 ≥2 axes)');
  ok(!E.badProv.length, 'colour-as-provenance (MODELING_STANDARDS §1): the cash line and the three opening balances are the ONLY blue cells', E.badProv.slice(0, 1));
  ok(E.openingsAreRefs, 'MODELING_STANDARDS §3: every later opening balance is a REFERENCE, never a repeat');
  ok(E.totalHasTopRule, 'the total wears bold + a line ABOVE it (§1.0(f))');
  ok(E.noBottomRuleUnderTotal, 'and no rule UNDERNEATH it (§1.0(f) reverses the old convention)');
  ok(E.moatRev === E.wantRev && E.moatTl === E.wantTl && E.moatMz === E.wantMz,
    'geometry moats hold on the SOLVED board: Ctrl+Shift+↓ inside a tranche stops at its ending row', E);

  // par-key flatness across 20 seeds
  console.log('\nE2. par-key flatness (the demo must not move with the seed)');
  const K = [];
  for (let i = 0; i < 20; i++) {
    /* the FULL demo here, the engine-appended Ctrl+S closer included — that is what
       dev/e2e-par-sweep.js counts, so parKeys must be compared against the same number */
    K.push(await page.evaluate(() => { __cx.load(); __cx.run(CHALLENGES.cascade.demo()); return keyLog.length; }));
  }
  K.sort((a, b) => a - b);
  ok(K[0] === K[K.length - 1], 'demo key count is FLAT across 20 seeds: ' + K[0] + '–' + K[K.length - 1], K);
  const declared = await page.evaluate(() => CHALLENGES.cascade.parKeys);
  ok(declared === K[10], 'parKeys ' + declared + ' matches the measured median ' + K[10]);

  // ── F · FRAME FIT ──────────────────────────────────────────────────────────────────────
  console.log('\nF. frame fit (§6.6 — the sheet inside its box)');
  for (const w of [1024, 1180, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    const f = await page.evaluate(() => { __cx.load();
      const g = document.getElementById('grid'), wrap = document.getElementById('gridwrap');
      return { sw: g ? g.scrollWidth : -1, cw: wrap ? wrap.clientWidth : -1, noShrink: !!(S && S.__noShrink) }; });
    ok(f.sw <= f.cw + 1, 'at ' + w + 'px the sheet is ' + f.sw + 'px inside a ' + f.cw + 'px box' + (f.noShrink ? ' (__noShrink)' : ''), f);
  }

  if (errs.length) { fails++; console.log('\nPAGE ERRORS: ' + errs.slice(0, 4).join(' · ')); }
  console.log('\nverify-cascade: ' + (fails ? fails + ' FAILURE(S)' : 'ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
