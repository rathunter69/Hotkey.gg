/* r449 — debtblock VERIFICATION PROBE (DEPTH_PASS §4.86, CAMPAIGN §1/§2, MODELING_STANDARDS).
   Self-contained and single-drill by construction: this file names no drill but `debtblock`
   (the C13 retirement guard reads dev/*.js for quoted keys).

   What it proves, in five sections:
     A · PAR — the drill's own demo replayed over N seeds (median/range) + the win flag.
     B · ☆-HEADROOM + THE FAMILY BAKE-OFF — four FULLY KEYED routes over the same job, each
         asserted to clear every core, with the ☆'s state reported per route. Every selection
         and navigation is keyed; setDemoSel only parks the active cell entering a region, and
         every route parks EXACTLY TEN times, so the deltas are mechanics and nothing else.
     C · ROUTE PROBES (§1.0-R3(p)) — the alternate doors that must ALL clear: F4 anchoring
         instead of a typed dollar sign, ROUND() wrappers, a bare number typed into the
         percent-formatted rate cell, the Cell Styles Input gallery, ribbon fills, the legacy
         Alt E S paste-special FORMULAS dialog, and Alt H B A (which stores `ball` and no `bt`).
         Reading a predicate cannot find the untriggerable class; walking can.
     D · MODEL FACTS — the conventions MODELING_STANDARDS makes gradeable, asserted on the
         solved board: the corkscrew links, the sign convention, the pre-built roll check
         reading zero at the win, and the over-anchored-rate failure the ☆ exists to teach.
     E · BOARD — §1.3 win-state density, the ROWS cap, and a #### scan at load AND at the win.

   Run: node dev/verify-debtblock.js            (server on 127.0.0.1:8791)
        URL=http://127.0.0.1:9241/index.html node dev/verify-debtblock.js   (a worktree port) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '3', 10);
const PAR_REPS = parseInt(process.env.PAR_REPS || '15', 10);

/* ── page-side route library. Each entry is the SOURCE of a function of the live challenge C
   returning demo-style moves. The shared HEAD keeps the routes comparable. */
const HEAD = `
  const o=C._o, Y=o.Y, CR=o.CR;
  const up={key:'ArrowUp'}, dn={key:'ArrowDown'}, rt={key:'ArrowRight'}, lf={key:'ArrowLeft'};
  const sU={key:'ArrowUp',shift:true}, sD={key:'ArrowDown',shift:true}, sR={key:'ArrowRight',shift:true};
  const ent={key:'Enter'}, cEnt={key:'Enter',ctrl:true};
  const ctrlR={key:'r',ctrl:true}, cpy={key:'c',ctrl:true}, pst={key:'v',ctrl:true};
  const alt={key:'Alt'}, K=ch=>({key:ch,code:'Key'+ch.toUpperCase()});
  const TX=s=>[...s].map(ch=>({key:ch}));
`;

/* rates + the blue pass — identical in every bake-off route */
const RATES = `
  {sel:o.tlRate, keys:[...TX(o.tlPct+'%'),ent,dn,dn,dn,dn,...TX(o.rvPct+'%'),ent,up,
                       sU,sU,sU,sU,sU, alt,K('h'),K('f'),K('c'), rt,rt,rt,rt, ent]}
`;
/* the dress — identical in every bake-off route: one selection, one rule, both total rows */
const DRESS = `
  {sel:Y[0]+o.rTD, keys:[sR,sR,sR,sR,sD, alt,K('h'),K('b'),K('p')]}
`;

const ROUTES = {
  /* R1 — the ☆ route the demo takes: finish the term loan, then CLONE its engine onto the
     revolver in one paste. */
  clone: `C => { ${HEAD}
    return [
      ${RATES},
      {sel:Y[0]+o.rTLe, keys:[...TX(o.fTlEnd),ent]},
      {sel:Y[0]+o.rTLi, keys:[...TX(o.fTlInt),ent]},
      {sel:Y[1]+o.rTLb, keys:[...TX(o.fTlLink),ent,up,sR,sR,sR,ctrlR]},
      {sel:Y[0]+o.rTLe, keys:[sR,sR,sR,sR,sD,ctrlR,cpy]},
      {sel:Y[0]+o.rRVe, keys:[pst]},
      {sel:Y[0]+o.rRVi, keys:[]},
      {sel:Y[1]+o.rRVb, keys:[...TX(o.fRvLink),ent,up,sR,sR,sR,ctrlR]},
      {sel:Y[0]+o.rTD, keys:[...TX(o.fTotD),ent,...TX(o.fTotI),ent,up,up,sR,sR,sR,sR,sD,ctrlR]},
      ${DRESS},
    ]; }`,
  /* R2 — THE CONTROL (§1.0-R2(i) skippability): the taught per-facility route. Every core
     clears; the ☆ must stay DARK. This is dev/e2e-alt-paths.js ALT 2. */
  pertranche: `C => { ${HEAD}
    return [
      ${RATES},
      {sel:Y[0]+o.rTLe, keys:[...TX(o.fTlEnd),ent]},
      {sel:Y[0]+o.rTLi, keys:[...TX(o.fTlInt),ent]},
      {sel:Y[1]+o.rTLb, keys:[...TX(o.fTlLink),ent,up,sR,sR,sR,ctrlR]},
      {sel:Y[0]+o.rTLe, keys:[sR,sR,sR,sR,sD,ctrlR]},
      {sel:Y[0]+o.rRVe, keys:[...TX(o.fRvEnd),ent]},
      {sel:Y[0]+o.rRVi, keys:[...TX(o.fRvInt),ent,up,up,sR,sR,sR,sR,sD,ctrlR]},
      {sel:Y[1]+o.rRVb, keys:[...TX(o.fRvLink),ent,up,sR,sR,sR,ctrlR]},
      {sel:Y[0]+o.rTD, keys:[...TX(o.fTotD),ent,...TX(o.fTotI),ent,up,up,sR,sR,sR,sR,sD,ctrlR]},
      ${DRESS},
    ]; }`,
  /* R3 — Ctrl+Enter multi-commit per line (S.multiEnter, `anchor`'s family): select the row,
     type the formula once, commit into every year. ☆ dark. */
  multienter: `C => { ${HEAD}
    return [
      ${RATES},
      {sel:Y[0]+o.rTLe, keys:[sR,sR,sR,sR,...TX(o.fTlEnd),cEnt]},
      {sel:Y[0]+o.rTLi, keys:[sR,sR,sR,sR,...TX(o.fTlInt),cEnt]},
      {sel:Y[1]+o.rTLb, keys:[sR,sR,sR,...TX(o.fTlLink),cEnt]},
      {sel:Y[0]+o.rTI,  keys:[sR,sR,sR,sR,...TX(o.fTotI),cEnt]},
      {sel:Y[0]+o.rRVe, keys:[sR,sR,sR,sR,...TX(o.fRvEnd),cEnt]},
      {sel:Y[0]+o.rRVi, keys:[sR,sR,sR,sR,...TX(o.fRvInt),cEnt]},
      {sel:Y[1]+o.rRVb, keys:[sR,sR,sR,...TX(o.fRvLink),cEnt]},
      {sel:Y[0]+o.rTD,  keys:[sR,sR,sR,sR,...TX(o.fTotD),cEnt]},
      ${DRESS},
    ]; }`,
  /* R4 — the slowest legal route and the §1.0(c) freedom floor: no anchor, no fill, no
     clipboard anywhere, every cell of every line typed year by year, the blue pass one cell at
     a time, the two rules walked row by row. What the clock exists to price. */
  slow: `C => { ${HEAD}
    const mv=[
      {sel:o.tlRate, keys:[...TX(o.tlPct+'%'),ent,up, alt,K('h'),K('f'),K('c'),rt,rt,rt,rt,ent,
                           dn,dn,dn,dn,dn, ...TX(o.rvPct+'%'),ent,up, alt,K('h'),K('f'),K('c'),rt,rt,rt,rt,ent]},
    ];
    const line=(row, f)=>{ const ks=[];
      for(let i=0;i<5;i++){ ks.push(...TX(f(i)), ent); if(i<4) ks.push(up, rt); }
      mv.push({sel:Y[0]+row, keys:ks}); };
    const link=(row, src)=>{ const ks=[];
      for(let i=1;i<5;i++){ ks.push(...TX('='+Y[i-1]+src), ent); if(i<4) ks.push(up, rt); }
      mv.push({sel:Y[1]+row, keys:ks}); };
    line(o.rTLe, i=>'='+Y[i]+o.rTLb+'+'+Y[i]+o.rTLa);
    line(o.rTLi, i=>'='+Y[i]+o.rTLb+'*'+CR+o.rTLi);
    link(o.rTLb, o.rTLe);
    line(o.rRVe, i=>'='+Y[i]+o.rRVb+'+'+Y[i]+o.rRVd);
    line(o.rRVi, i=>'='+Y[i]+o.rRVb+'*'+CR+o.rRVi);
    link(o.rRVb, o.rRVe);
    line(o.rTD,  i=>'='+Y[i]+o.rTLe+'+'+Y[i]+o.rRVe);
    line(o.rTI,  i=>'='+Y[i]+o.rTLi+'+'+Y[i]+o.rRVi);
    /* the dress walked cell by cell, both rows, from ONE park — so the route parks exactly ten
       times like every other entry in the bake-off and the deltas stay honest */
    const dr=[];
    for(let i=0;i<5;i++){ dr.push(alt,K('h'),K('b'),K('p')); if(i<4) dr.push(rt); }
    dr.push(dn);
    for(let i=0;i<5;i++){ dr.push(alt,K('h'),K('b'),K('p')); if(i<4) dr.push(lf); }
    mv.push({sel:Y[0]+o.rTD, keys:dr});
    return mv; }`,
};

/* ── SECTION C: alternate doors that MUST clear (§1.0-R3(p)). Each is a full solve. */
const PROBES = {
  /* F4 sets the rate lock instead of a typed dollar sign — three presses land the column-only
     anchor ($<col><row>), which is all a right-fill needs */
  f4anchor: `C => { ${HEAD}
    const F4={key:'F4'};
    return [
      ${RATES},
      {sel:Y[0]+o.rTLe, keys:[...TX(o.fTlEnd),ent]},
      {sel:Y[0]+o.rTLi, keys:[...TX('='+Y[0]+o.rTLb+'*'+CR+o.rTLi),F4,F4,F4,ent]},
      {sel:Y[1]+o.rTLb, keys:[...TX(o.fTlLink),ent,up,sR,sR,sR,ctrlR]},
      {sel:Y[0]+o.rTLe, keys:[sR,sR,sR,sR,sD,ctrlR,cpy]},
      {sel:Y[0]+o.rRVe, keys:[pst]},
      {sel:Y[1]+o.rRVb, keys:[...TX(o.fRvLink),ent,up,sR,sR,sR,ctrlR]},
      {sel:Y[0]+o.rTD, keys:[...TX(o.fTotD),ent,...TX(o.fTotI),ent,up,up,sR,sR,sR,sR,sD,ctrlR]},
      ${DRESS},
    ]; }`,
  /* ROUND(...,0) on every built line — the desk habit; the tolerance band exists for it, and
     the totals grade relationally so the rounded parts still foot */
  rounded: `C => { ${HEAD}
    const R=f=>'=ROUND('+f.slice(1)+',0)';
    return [
      ${RATES},
      {sel:Y[0]+o.rTLe, keys:[...TX(R(o.fTlEnd)),ent]},
      {sel:Y[0]+o.rTLi, keys:[...TX(R(o.fTlInt)),ent]},
      {sel:Y[1]+o.rTLb, keys:[...TX(o.fTlLink),ent,up,sR,sR,sR,ctrlR]},
      {sel:Y[0]+o.rTLe, keys:[sR,sR,sR,sR,sD,ctrlR]},
      {sel:Y[0]+o.rRVe, keys:[...TX(R(o.fRvEnd)),ent]},
      {sel:Y[0]+o.rRVi, keys:[...TX(R(o.fRvInt)),ent,up,up,sR,sR,sR,sR,sD,ctrlR]},
      {sel:Y[1]+o.rRVb, keys:[...TX(o.fRvLink),ent,up,sR,sR,sR,ctrlR]},
      {sel:Y[0]+o.rTD, keys:[...TX(o.fTotD),ent,...TX(o.fTotI),ent,up,up,sR,sR,sR,sR,sD,ctrlR]},
      ${DRESS},
    ]; }`,
  /* a BARE number typed into the percent-formatted rate cell (the r418 auto-scale branch),
     blue from the Cell Styles gallery, every fill off the RIBBON, the clone carried by the
     LEGACY Alt E S paste-special FORMULAS dialog, the rule via Alt H B D (top AND bottom) */
  ribbon: `C => { ${HEAD}
    const fill=[alt,K('h'),K('f'),K('i'),K('r')];
    return [
      {sel:o.tlRate, keys:[...TX(o.tlPct),ent,dn,dn,dn,dn,...TX(o.rvPct),ent,up,
                           sU,sU,sU,sU,sU, alt,K('h'),K('j'), rt, ent]},
      {sel:Y[0]+o.rTLe, keys:[...TX(o.fTlEnd),ent]},
      {sel:Y[0]+o.rTLi, keys:[...TX(o.fTlInt),ent]},
      {sel:Y[1]+o.rTLb, keys:[...TX(o.fTlLink),ent,up,sR,sR,sR,...fill]},
      {sel:Y[0]+o.rTLe, keys:[sR,sR,sR,sR,sD,...fill,cpy]},
      {sel:Y[0]+o.rRVe, keys:[alt,K('e'),K('s'),K('f'),ent]},
      {sel:Y[1]+o.rRVb, keys:[...TX(o.fRvLink),ent,up,sR,sR,sR,...fill]},
      {sel:Y[0]+o.rTD, keys:[...TX(o.fTotD),ent,...TX(o.fTotI),ent,up,up,sR,sR,sR,sR,sD,...fill]},
      {sel:Y[0]+o.rTD, keys:[sR,sR,sR,sR,sD, alt,K('h'),K('b'),K('d')]},
    ]; }`,
  /* the rule taken with ALL borders (Alt H B A stores `ball` and NO `bt`) and an addition
     chain instead of the paired reference — the two doors a strict border reading would strand */
  outsideBox: `C => { ${HEAD}
    return [
      ${RATES},
      {sel:Y[0]+o.rTLe, keys:[...TX(o.fTlEnd),ent]},
      {sel:Y[0]+o.rTLi, keys:[...TX(o.fTlInt),ent]},
      {sel:Y[1]+o.rTLb, keys:[...TX(o.fTlLink),ent,up,sR,sR,sR,ctrlR]},
      {sel:Y[0]+o.rTLe, keys:[sR,sR,sR,sR,sD,ctrlR,cpy]},
      {sel:Y[0]+o.rRVe, keys:[pst]},
      {sel:Y[1]+o.rRVb, keys:[...TX(o.fRvLink),ent,up,sR,sR,sR,ctrlR]},
      {sel:Y[0]+o.rTD, keys:[...TX('=SUM('+Y[0]+o.rTLe+','+Y[0]+o.rRVe+')'),ent,
                             ...TX('=SUM('+Y[0]+o.rTLi+','+Y[0]+o.rRVi+')'),ent,
                             up,up,sR,sR,sR,sR,sD,ctrlR]},
      {sel:Y[0]+o.rTD, keys:[sR,sR,sR,sR,sD, alt,K('h'),K('b'),K('a')]},
    ]; }`,
};

/* ── SECTION D: the ANTI-route — a fully anchored rate reference, then the clone. The revolver
   accrues at the term loan's rate, so beat 4 must go DARK. This is what makes the ☆ anchoring
   mastery rather than a gesture. */
const ANTI = `C => { ${HEAD}
  return [
    ${RATES},
    {sel:Y[0]+o.rTLe, keys:[...TX(o.fTlEnd),ent]},
    {sel:Y[0]+o.rTLi, keys:[...TX('='+Y[0]+o.rTLb+'*$'+CR+'$'+o.rTLi),ent]},
    {sel:Y[1]+o.rTLb, keys:[...TX(o.fTlLink),ent,up,sR,sR,sR,ctrlR]},
    {sel:Y[0]+o.rTLe, keys:[sR,sR,sR,sR,sD,ctrlR,cpy]},
    {sel:Y[0]+o.rRVe, keys:[pst]},
    {sel:Y[1]+o.rRVb, keys:[...TX(o.fRvLink),ent,up,sR,sR,sR,ctrlR]},
    {sel:Y[0]+o.rTD, keys:[...TX(o.fTotD),ent,...TX(o.fTotI),ent,up,up,sR,sR,sR,sR,sD,ctrlR]},
    ${DRESS},
  ]; }`;

const D = (x, n) => String(x).padStart(n);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  /* mirror the real harness init or the readings are a lie (CAMPAIGN §4) */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1');
    localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');
    localStorage.setItem('hk_handle_cache', '');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function'
    && typeof loadChallenge === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  let fails = 0;
  const bad = m => { fails++; console.log('  FAIL ' + m); };

  const run = (src, reps) => page.evaluate(([s, n]) => {
    const out = [];
    for (let rep = 0; rep < n; rep++) {
      try {
        document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(x => x.remove());
        loadChallenge('debtblock');
        const C = CHALLENGES.debtblock;
        const moves = eval('(' + s + ')')(C);
        for (const mv of moves) { if (mv.sel) setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
        const items = C.checks(S);
        const cores = items.filter(x => !x.bonus && !x.save);
        const star = items.find(x => x.bonus);
        out.push({ keys: keyLog.length, coresOk: cores.every(x => x.ok), parks: moves.length,
                   dark: cores.filter(x => !x.ok).map(x => x.label.slice(0, 46)),
                   star: !!(star && star.ok) });
      } catch (e) { out.push({ err: String(e && e.message || e).slice(0, 160) }); }
    }
    return out;
  }, [src, reps]);

  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

  /* ── A · PAR ─────────────────────────────────────────────────────────────────── */
  console.log('\nA · PAR (the drill\'s own demo, ' + PAR_REPS + ' seeds)');
  const parRuns = await page.evaluate((n) => {
    const out = [];
    for (let rep = 0; rep < n; rep++) {
      try {
        document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(x => x.remove());
        loadChallenge('debtblock');
        const C = CHALLENGES.debtblock;
        for (const mv of C.demo()) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
        const items = C.checks(S);
        out.push({ keys: keyLog.length, won: done,
                   dark: items.filter(x => !x.ok).map(x => x.label.slice(0, 40)) });
      } catch (e) { out.push({ err: String(e && e.message || e).slice(0, 160) }); }
    }
    return out;
  }, PAR_REPS);
  if (parRuns.some(r => r.err)) bad('demo error: ' + parRuns.find(r => r.err).err);
  if (parRuns.some(r => r.won !== true)) bad('demo did not win on every seed');
  if (parRuns.some(r => r.dark && r.dark.length)) bad('demo left beats dark: ' + JSON.stringify(parRuns.find(r => r.dark.length).dark));
  const pk = parRuns.filter(r => !r.err).map(r => r.keys);
  const C0 = await page.evaluate(() => ({ par: CHALLENGES.debtblock.par, parKeys: CHALLENGES.debtblock.parKeys }));
  console.log('  median ' + med(pk) + '  range ' + Math.min(...pk) + '-' + Math.max(...pk) +
    '  declared parKeys ' + C0.parKeys + '  par ' + C0.par + '  s/key ' + (C0.par / C0.parKeys).toFixed(2));
  if (Math.abs(med(pk) - C0.parKeys) > 4) bad('parKeys drift: measured ' + med(pk) + ' vs declared ' + C0.parKeys);

  /* ── B · ☆-HEADROOM + FAMILY BAKE-OFF ────────────────────────────────────────── */
  console.log('\nB · ROUTES (all fully keyed, ' + REPS + ' seeds each)   keys  parks  cores   ☆');
  const table = {};
  for (const [name, src] of Object.entries(ROUTES)) {
    const rs = await run(src, REPS);
    if (rs.some(r => r.err)) { bad(name + ' errored: ' + rs.find(r => r.err).err); continue; }
    const k = rs.map(r => r.keys), ok = rs.every(r => r.coresOk), st = rs.every(r => r.star);
    table[name] = med(k);
    console.log('  ' + name.padEnd(12) + D(med(k), 6) + D(rs[0].parks, 7) + D(ok ? 'all' : 'DARK', 8) +
      D(st ? 'earned' : (rs.some(r => r.star) ? 'MIXED' : 'dark'), 9) +
      (ok ? '' : '   ' + JSON.stringify(rs.find(r => !r.coresOk).dark)));
    if (!ok) bad(name + ' left a core beat dark — §1.0(c) freedom violated');
    if (name === 'clone' && !st) bad('the ☆ route did not earn the ☆');
    if (name !== 'clone' && rs.some(r => r.star)) bad(name + ' earned the ☆ — §1.0-R2(i): it must be a distinct decision');
  }
  if (table.clone && table.pertranche) {
    console.log('  spread (slowest legal ÷ ☆ route): ' + (table.slow / table.clone).toFixed(2) + '×');
    console.log('  ☆ worth vs the taught control: ' + (table.pertranche - table.clone) + ' keys');
    const nonPaste = ['pertranche', 'multienter'].map(n => table[n]).filter(Boolean);
    if (nonPaste.length) console.log('  best non-paste family: ' + Math.min(...nonPaste) + ' keys (☆ route ' + table.clone + ')');
    if (table.pertranche <= table.clone) bad('the ☆ route is not cheaper than the control — the CAMPAIGN §2 negative-value failure');
  }

  /* ── C · ROUTE PROBES ────────────────────────────────────────────────────────── */
  console.log('\nC · ALTERNATE DOORS (§1.0-R3(p) — each must clear every core)');
  for (const [name, src] of Object.entries(PROBES)) {
    const rs = await run(src, REPS);
    if (rs.some(r => r.err)) { bad(name + ' errored: ' + rs.find(r => r.err).err); continue; }
    const ok = rs.every(r => r.coresOk);
    console.log('  ' + name.padEnd(12) + D(med(rs.map(r => r.keys)), 5) + '  ' +
      (ok ? 'clears' : 'UNTRIGGERABLE ' + JSON.stringify(rs.find(r => !r.coresOk).dark)) +
      '   ☆ ' + (rs.every(r => r.star) ? 'earned' : rs.some(r => r.star) ? 'MIXED' : 'dark'));
    if (!ok) bad(name + ' cannot clear — an untriggerable beat');
  }

  /* ── D · MODEL FACTS ─────────────────────────────────────────────────────────── */
  console.log('\nD · MODEL (MODELING_STANDARDS §1/§2/§3/§5/§6 on the solved board)');
  const anti = await run(ANTI, REPS);
  if (anti.some(r => r.err)) bad('anti-route errored: ' + anti.find(r => r.err).err);
  else {
    const stillDark = anti.every(r => !r.coresOk && r.dark.some(d => /interest/i.test(d)));
    console.log('  over-anchored rate + clone → interest beat ' + (stillDark ? 'DARK (correct)' : 'CLEARED — the ☆ teaches nothing'));
    if (!stillDark) bad('an over-anchored rate survives the clone — the ☆ is a gesture, not anchoring mastery');
  }
  const facts = await page.evaluate((n) => {
    const out = [];
    for (let rep = 0; rep < n; rep++) {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(x => x.remove());
      loadChallenge('debtblock');
      const C = CHALLENGES.debtblock, o = C._o, Y = o.Y;
      const cel = k => S.cells[k] || {};
      const loadChk = cel(Y[4] + o.rChk).value;
      for (const mv of C.demo()) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      const links = [1, 2, 3, 4].every(i => {
        const a = String(cel(Y[i] + o.rTLb).formula || '').toUpperCase().replace(/\$/g, '');
        const b = String(cel(Y[i] + o.rRVb).formula || '').toUpperCase().replace(/\$/g, '');
        return a.indexOf(Y[i - 1] + o.rTLe) >= 0 && b.indexOf(Y[i - 1] + o.rRVe) >= 0; });
      const negFeed = [0, 1, 2, 3, 4].every(i => cel(Y[i] + o.rTLa).value < 0);
      const blueFeed = [0, 1, 2, 3, 4].every(i => cel(Y[i] + o.rTLa).fontColor === 'blue' && cel(Y[i] + o.rRVd).fontColor === 'blue')
        && cel(Y[0] + o.rTLb).fontColor === 'blue' && cel(Y[0] + o.rRVb).fontColor === 'blue';
      const blackBuilt = [0, 1, 2, 3, 4].every(i => !cel(Y[i] + o.rTLe).fontColor && !cel(Y[i] + o.rTD).fontColor);
      const rvFloor = [0, 1, 2, 3, 4].every(i => cel(Y[i] + o.rRVe).value >= 0);
      const opening = [0, 1, 2, 3, 4].every(i => Math.abs(cel(Y[i] + o.rTLi).value - cel(Y[i] + o.rTLb).value * o.tlRateV) < 1e-6);
      out.push({ loadChk: loadChk, winChk: cel(Y[4] + o.rChk).value, links: links, negFeed: negFeed,
                 blueFeed: blueFeed, blackBuilt: blackBuilt, rvFloor: rvFloor, opening: opening,
                 ruleUnder: [0, 1, 2, 3, 4].some(i => cel(Y[i] + o.rTD).bb && !cel(Y[i] + o.rTD).bt) });
    }
    return out;
  }, REPS);
  const f0 = facts[0];
  console.log('  §3 corkscrew links (both facilities, years 2-5): ' + (facts.every(f => f.links) ? 'reference the prior close' : 'BROKEN'));
  console.log('  §2 sign convention (amortization negative): ' + (facts.every(f => f.negFeed) ? 'held' : 'BROKEN'));
  console.log('  §1 provenance (fed = blue, built = black): ' + (facts.every(f => f.blueFeed && f.blackBuilt) ? 'held' : 'BROKEN'));
  console.log('  §5 interest on the OPENING balance: ' + (facts.every(f => f.opening) ? 'held' : 'BROKEN'));
  console.log('  §6 roll check: ' + f0.loadChk + ' at load → ' + facts.map(f => Math.round(f.winChk)).join(',') + ' at the win');
  console.log('  revolver never drawn below zero: ' + (facts.every(f => f.rvFloor) ? 'held' : 'BROKEN'));
  console.log('  §1.0(f) no rule underneath a total instead of above: ' + (facts.some(f => f.ruleUnder) ? 'VIOLATED' : 'clean'));
  if (!facts.every(f => f.links)) bad('the corkscrew link is not what the board ends up with');
  if (!facts.every(f => f.negFeed && f.blueFeed && f.blackBuilt && f.opening && f.rvFloor)) bad('a MODELING_STANDARDS convention is broken on the solved board');
  if (!facts.every(f => Math.abs(f.winChk) < 0.6)) bad('the roll check does not read zero at the win');

  /* ── E · BOARD ───────────────────────────────────────────────────────────────── */
  console.log('\nE · BOARD (§1.3 density · ROWS cap · #### scan at load and at the win)');
  const board = await page.evaluate((n) => {
    const hashes = () => [...document.querySelectorAll('#grid td')]
      .filter(td => /^#+$/.test((td.textContent || '').trim())).length;
    const dens = () => { let used = 0;
      for (let r = 1; r <= S.ROWS; r++) { let any = false;
        for (let c = 1; c <= 10; c++) { const k = String.fromCharCode(64 + c) + r;
          const cell = S.cells[k]; if (cell && cell.value !== null && cell.value !== '') { any = true; break; } }
        if (any) used++; }
      return used; };
    const out = [];
    for (let rep = 0; rep < n; rep++) {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(x => x.remove());
      loadChallenge('debtblock');
      const C = CHALLENGES.debtblock;
      render();
      const loadHash = hashes(), loadDens = dens(), rows = S.ROWS;
      for (const mv of C.demo()) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      render();
      out.push({ rows: rows, loadHash: loadHash, loadDens: loadDens, winHash: hashes(), winDens: dens(),
                 gridW: (document.querySelector('#grid') || {}).scrollWidth,
                 wrapW: (document.querySelector('#gridwrap') || document.querySelector('.gridwrap') || {}).clientWidth });
    }
    return out;
  }, REPS);
  const rows = board[0].rows;
  const winD = board.map(b => b.winDens);
  console.log('  ROWS ' + rows + '  win-state density ' + Math.min(...winD) + '-' + Math.max(...winD) + '/' + rows +
    ' (' + Math.round(100 * Math.min(...winD) / rows) + '-' + Math.round(100 * Math.max(...winD) / rows) + '%)' +
    '  load density ' + board[0].loadDens + '/' + rows);
  console.log('  #### at load ' + board.map(b => b.loadHash).join(',') + '   at win ' + board.map(b => b.winHash).join(',') +
    '   grid ' + board[0].gridW + 'px in ' + board[0].wrapW + 'px');
  if (rows !== 20) bad('ROWS is ' + rows + ', not 20 (§1.3 floor AND cap)');
  if (Math.min(...winD) / rows < 0.6) bad('win-state density under the §1.3 60% target');
  if (board.some(b => b.loadHash || b.winHash)) bad('#### on the board');

  if (errs.length) bad('page errors: ' + JSON.stringify(errs.slice(0, 3)));
  console.log('\n' + (fails ? 'VERIFY-DEBTBLOCK: ' + fails + ' FAILURE(S)' : 'VERIFY-DEBTBLOCK: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
