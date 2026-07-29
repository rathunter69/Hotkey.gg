/* r449 — dcfbuild VERIFICATION PROBE (DEPTH_PASS §4.84, CAMPAIGN §1/§2).
   Self-contained and single-drill by construction: this file names no drill but `dcfbuild`
   (the C13 retirement guard reads dev/*.js for quoted keys).

   What it proves, in five sections:
     A · PAR — the demo's keyLog over N seeds (median/range) + the win flag.
     B · ☆-HEADROOM + THE FAMILY BAKE-OFF — five FULLY KEYED routes over the same job, each
         asserted to clear every core, with the ☆'s state reported per route. Every selection
         and navigation is keyed; setDemoSel only parks the active cell entering a region, and
         it parks the SAME number of times in every route, so the deltas are honest.
     B2 · THE AUTOSUM EVIDENCE — Alt+= is pressed on the enterprise-value cell and the formula
         it proposes is PRINTED, so "autosum is unavailable here" is a measurement rather than
         an assertion (the summands are a ROW and a cell, never a contiguous column run).
     C · ROUTE PROBES (§1.0-R3(p)) — the alternate doors that must all clear: a column-only
         anchor, a commuted product, an addition chain instead of SUM, ROUND() wrappers, the
         terminal discount re-derived by hand, the ribbon fill, and three independent ways of
         writing the check line. Plus ONE negative control: the circular check must stay dark.
     D · BOARD — §1.3 win-state density, the ROWS floor/cap, a #### scan at load AND at the
         win, the sheet's natural width against its frame, and the r439 `cases` format assertion
         (the ☆'s fill must not leave the strip dressed differently from the typed route).

   Run: node dev/verify-dcfbuild.js            (server on 127.0.0.1:8791)
        URL=http://127.0.0.1:9137/index.html node dev/verify-dcfbuild.js   (a worktree port) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '3', 10);
const PAR_REPS = parseInt(process.env.PAR_REPS || '15', 10);

/* ── page-side route library. Each entry is the SOURCE of a function of the live challenge C
   returning demo-style moves. Shared fragments keep the routes comparable. */
const HEAD = `
  const o=C._o, Y=o.Y, B=o.CB, L=o.YL;
  const up={key:'ArrowUp'}, dn={key:'ArrowDown'}, rt={key:'ArrowRight'};
  const sR={key:'ArrowRight',shift:true}, sD={key:'ArrowDown',shift:true};
  const ent={key:'Enter'}, ctrlR={key:'r',ctrl:true};
  const cpy={key:'c',ctrl:true}, pst={key:'v',ctrl:true};
  const alt={key:'Alt'}, K=ch=>({key:ch,code:'Key'+ch.toUpperCase()});
  const TX=s=>[...s].map(ch=>({key:ch}));
  /* the bridge and the check are IDENTICAL in every route, so the deltas are pure strip mechanics */
  const tail=[
    {sel:B+o.rTV, keys:[...TX(o.fTV),ent,...TX(o.fPVTV),ent,...TX(o.fEV),ent]},
    {sel:B+o.rEQ, keys:[...TX(o.fEQ),ent]},
    {sel:B+o.rPS, keys:[...TX(o.fPS),ent]},
    {sel:B+o.rCHK,keys:[...TX(o.fCHK),ent]},
  ];
`;

/* PARK DISCIPLINE — stated once, applied to every route below so the deltas are honest
   (CAMPAIGN §2: "measure each half separately", and the r438 `series` rule that a demo handed
   its selections measures almost nothing). The rule: ONE setDemoSel park per FORMULA typed,
   plus at most ONE park per fill/paste operation. Nothing else is handed to any route — every
   selection, every extension and every navigation between those parks is KEYED. The shipped
   demo obeys the same rule, which is why §A's median and R1's key count agree. */
const ROUTES = {
  /* R1 — the ☆ route the demo takes: both strip formulas typed one under the other, then ONE
     fill right over the 2x5 rect. 2 formula parks + 1 fill park. */
  blockfill: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
      {sel:B+o.rPV, keys:[...TX(o.fPV),ent]},
      {sel:B+o.rDF, keys:[sR,sR,sR,sR,sD,ctrlR]},
      ...tail,
    ]; }`,
  /* R2 — THE CONTROL (§1.0-R2(i) skippability): the taught route taken one row at a time,
     which is what a player does without the discovery. 2 formula parks + 2 fill parks.
     ☆ must stay dark. */
  perrow: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
      {sel:B+o.rDF, keys:[sR,sR,sR,sR,ctrlR]},
      {sel:B+o.rPV, keys:[...TX(o.fPV),ent]},
      {sel:B+o.rPV, keys:[sR,sR,sR,sR,ctrlR]},
      ...tail,
    ]; }`,
  /* R3 — build the year-1 pair, then PASTE it across (`pastes`' family). 2 formula parks +
     1 paste park. ☆ dark. */
  pasteacross: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
      {sel:B+o.rPV, keys:[...TX(o.fPV),ent]},
      {sel:B+o.rDF, keys:[sD,cpy, rt,sR,sR,sR,sD, pst]},
      ...tail,
    ]; }`,
  /* R4 — Ctrl+Enter multi-commit per row (S.multiEnter, `anchor`'s family). 2 formula parks,
     no fill at all. ☆ dark. */
  multienter: `C => { ${HEAD}
    const ce={key:'Enter',ctrl:true};
    return [
      {sel:B+o.rDF, keys:[sR,sR,sR,sR, ...TX(o.fDF), ce]},
      {sel:B+o.rPV, keys:[sR,sR,sR,sR, ...TX(o.fPV), ce]},
      ...tail,
    ]; }`,
  /* R5 — the slowest legal route: no anchors, no fills, every factor and every PV typed year by
     year, the terminal discount re-derived by hand, enterprise value as an addition chain, the
     check written as a chain of flow-over-one-plus-WACC. The §1.0(c) freedom floor. */
  slow: `C => { ${HEAD}
    const mv=[];
    for(let i=0;i<5;i++) mv.push({sel:Y[i]+o.rDF, keys:[...TX('=1/(1+'+B+o.rWACC+')^'+(i+1)),ent]});
    for(let i=0;i<5;i++) mv.push({sel:Y[i]+o.rPV, keys:[...TX('='+Y[i]+o.rFCF+'*'+Y[i]+o.rDF),ent]});
    mv.push({sel:B+o.rTV, keys:[...TX('='+L+o.rFCF+'*(1+'+B+o.rG+')/('+B+o.rWACC+'-'+B+o.rG+')'),ent]});
    mv.push({sel:B+o.rPVTV, keys:[...TX('='+B+o.rTV+'/(1+'+B+o.rWACC+')^5'),ent]});
    mv.push({sel:B+o.rEV, keys:[...TX('='+Y.map(c=>c+o.rPV).join('+')+'+'+B+o.rPVTV),ent]});
    mv.push({sel:B+o.rEQ, keys:[...TX('='+B+o.rEV+'-'+B+o.rND),ent]});
    mv.push({sel:B+o.rPS, keys:[...TX('='+B+o.rEQ+'/'+B+o.rSH),ent]});
    mv.push({sel:B+o.rCHK, keys:[...TX('='+Y.map((c,i)=>c+o.rFCF+'/(1+'+B+o.rWACC+')^'+(i+1)).join('+')),ent]});
    return mv; }`,
};

/* ── SECTION C: alternate doors that MUST clear (§1.0-R3(p)). Each is a full solve. */
const PROBES = {
  /* a COLUMN-only lock is all a fill RIGHT needs — $B4, not $B$4 */
  colAnchor: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX('=1/(1+$'+B+o.rWACC+')^'+B+o.HR),ent]},
      {sel:B+o.rPV, keys:[...TX(o.fPV),ent]},
      {sel:B+o.rDF, keys:[sR,sR,sR,sR,sD,ctrlR]},
      ...tail,
    ]; }`,
  /* the product commuted, the terminal PV commuted, enterprise value as an addition chain —
     three forms the old refs() predicates locked out */
  commuted: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
      {sel:B+o.rPV, keys:[...TX('='+B+o.rDF+'*'+B+o.rFCF),ent]},
      {sel:B+o.rDF, keys:[sR,sR,sR,sR,sD,ctrlR]},
      {sel:B+o.rTV, keys:[...TX(o.fTV),ent,...TX('='+L+o.rDF+'*'+B+o.rTV),ent,
                          ...TX('='+Y.map(c=>c+o.rPV).join('+')+'+'+B+o.rPVTV),ent]},
      {sel:B+o.rEQ, keys:[...TX(o.fEQ),ent]},
      {sel:B+o.rPS, keys:[...TX(o.fPS),ent]},
      {sel:B+o.rCHK,keys:[...TX(o.fCHK),ent]},
    ]; }`,
  /* ROUND() wrappers down the page — the desk habit the tolerance band exists for */
  rounded: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
      {sel:B+o.rPV, keys:[...TX('=ROUND('+B+o.rFCF+'*'+B+o.rDF+',0)'),ent]},
      {sel:B+o.rDF, keys:[sR,sR,sR,sR,sD,ctrlR]},
      {sel:B+o.rTV, keys:[...TX('=ROUND('+L+o.rFCF+'*(1+$'+B+'$'+o.rG+')/($'+B+'$'+o.rWACC+'-$'+B+'$'+o.rG+'),0)'),ent,
                          ...TX('=ROUND('+B+o.rTV+'*'+L+o.rDF+',0)'),ent,...TX(o.fEV),ent]},
      {sel:B+o.rEQ, keys:[...TX(o.fEQ),ent]},
      {sel:B+o.rPS, keys:[...TX(o.fPS),ent]},
      {sel:B+o.rCHK,keys:[...TX(o.fCHK),ent]},
    ]; }`,
  /* the terminal discount RE-DERIVED by hand instead of read off the factor row — slower, but
     §1.0(c) says a slower correct route must clear */
  rederived: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
      {sel:B+o.rPV, keys:[...TX(o.fPV),ent]},
      {sel:B+o.rDF, keys:[sR,sR,sR,sR,sD,ctrlR]},
      {sel:B+o.rTV, keys:[...TX(o.fTV),ent,...TX('='+B+o.rTV+'/(1+'+B+o.rWACC+')^5'),ent,...TX(o.fEV),ent]},
      {sel:B+o.rEQ, keys:[...TX(o.fEQ),ent]},
      {sel:B+o.rPS, keys:[...TX(o.fPS),ent]},
      {sel:B+o.rCHK,keys:[...TX(o.fCHK),ent]},
    ]; }`,
  /* the RIBBON fill door (Alt H F I R) — it stamps the same S.fillOps latch, so the ☆ must earn */
  ribbonFill: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
      {sel:B+o.rPV, keys:[...TX(o.fPV),ent]},
      {sel:B+o.rDF, keys:[sR,sR,sR,sR,sD,alt,K('h'),K('f'),K('i'),K('r')]},
      ...tail,
    ]; }`,
  /* the check line written WITHOUT the anchor — a one-off cell never needed one */
  npvBare: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
      {sel:B+o.rPV, keys:[...TX(o.fPV),ent]},
      {sel:B+o.rDF, keys:[sR,sR,sR,sR,sD,ctrlR]},
      {sel:B+o.rTV, keys:[...TX(o.fTV),ent,...TX(o.fPVTV),ent,...TX(o.fEV),ent]},
      {sel:B+o.rEQ, keys:[...TX(o.fEQ),ent]},
      {sel:B+o.rPS, keys:[...TX(o.fPS),ent]},
      {sel:B+o.rCHK,keys:[...TX('=NPV('+B+o.rWACC+','+B+o.rFCF+':'+L+o.rFCF+')'),ent]},
    ]; }`,
  /* the check line as SUMPRODUCT over the flows and the factors — a different function, still
     an independent re-derivation off the raw flows */
  sumproduct: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
      {sel:B+o.rPV, keys:[...TX(o.fPV),ent]},
      {sel:B+o.rDF, keys:[sR,sR,sR,sR,sD,ctrlR]},
      {sel:B+o.rTV, keys:[...TX(o.fTV),ent,...TX(o.fPVTV),ent,...TX(o.fEV),ent]},
      {sel:B+o.rEQ, keys:[...TX(o.fEQ),ent]},
      {sel:B+o.rPS, keys:[...TX(o.fPS),ent]},
      {sel:B+o.rCHK,keys:[...TX('=SUMPRODUCT('+B+o.rFCF+':'+L+o.rFCF+','+B+o.rDF+':'+L+o.rDF+')'),ent]},
    ]; }`,
  /* the check line as a hand-rolled chain of flow-over-one-plus-WACC — the longest honest road */
  handChain: `C => { ${HEAD}
    return [
      {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
      {sel:B+o.rPV, keys:[...TX(o.fPV),ent]},
      {sel:B+o.rDF, keys:[sR,sR,sR,sR,sD,ctrlR]},
      {sel:B+o.rTV, keys:[...TX(o.fTV),ent,...TX(o.fPVTV),ent,...TX(o.fEV),ent]},
      {sel:B+o.rEQ, keys:[...TX(o.fEQ),ent]},
      {sel:B+o.rPS, keys:[...TX(o.fPS),ent]},
      {sel:B+o.rCHK,keys:[...TX('='+Y.map((c,i)=>c+o.rFCF+'/(1+$'+B+'$'+o.rWACC+')^'+(i+1)).join('+')),ent]},
    ]; }`,
};

/* ── the NEGATIVE control: a circular "check" reading the PV row back. Same number on screen,
   proves nothing, and beat 6 must stay DARK. A guard that has never been seen to fire is not
   a guard (CAMPAIGN, r442). */
const NEGATIVE = `C => { ${HEAD}
  return [
    {sel:B+o.rDF, keys:[...TX(o.fDF),ent]},
    {sel:B+o.rPV, keys:[...TX(o.fPV),ent]},
    {sel:B+o.rDF, keys:[sR,sR,sR,sR,sD,ctrlR]},
    {sel:B+o.rTV, keys:[...TX(o.fTV),ent,...TX(o.fPVTV),ent,...TX(o.fEV),ent]},
    {sel:B+o.rEQ, keys:[...TX(o.fEQ),ent]},
    {sel:B+o.rPS, keys:[...TX(o.fPS),ent]},
    {sel:B+o.rCHK,keys:[...TX('=SUM('+B+o.rPV+':'+L+o.rPV+')'),ent]},
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
    localStorage.setItem('hk_learn_done', '1');
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
        loadChallenge('dcfbuild');
        const C = CHALLENGES.dcfbuild;
        const moves = eval('(' + s + ')')(C);
        for (const mv of moves) { if (mv.sel) setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
        const items = C.checks(S);
        const cores = items.filter(x => !x.bonus && !x.save);
        const star = items.find(x => x.bonus);
        out.push({ keys: keyLog.length, coresOk: cores.every(x => x.ok),
                   dark: cores.filter(x => !x.ok).map(x => x.label.slice(0, 46)),
                   star: !!(star && star.ok) });
      } catch (e) { out.push({ err: String(e && e.message || e).slice(0, 140) }); }
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
        loadChallenge('dcfbuild');
        const C = CHALLENGES.dcfbuild;
        for (const mv of C.demo()) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
        const items = C.checks(S);
        out.push({ keys: keyLog.length, won: done,
                   dark: items.filter(x => !x.ok).map(x => x.label.slice(0, 40)) });
      } catch (e) { out.push({ err: String(e && e.message || e).slice(0, 140) }); }
    }
    return out;
  }, PAR_REPS);
  if (parRuns.some(r => r.err)) bad('demo error: ' + parRuns.find(r => r.err).err);
  if (parRuns.some(r => r.won !== true)) bad('demo did not win on every seed');
  if (parRuns.some(r => r.dark && r.dark.length)) bad('demo left beats dark: ' + JSON.stringify(parRuns.find(r => r.dark.length).dark));
  const pk = parRuns.filter(r => !r.err).map(r => r.keys);
  const C0 = await page.evaluate(() => ({ par: CHALLENGES.dcfbuild.par, parKeys: CHALLENGES.dcfbuild.parKeys }));
  console.log('  median ' + med(pk) + '  range ' + Math.min(...pk) + '-' + Math.max(...pk) +
    '  declared parKeys ' + C0.parKeys + '  par ' + C0.par + '  s/key ' + (C0.par / C0.parKeys).toFixed(2));
  if (Math.abs(med(pk) - C0.parKeys) > 4) bad('parKeys drift: measured ' + med(pk) + ' vs declared ' + C0.parKeys);

  /* ── B · ☆-HEADROOM + FAMILY BAKE-OFF ────────────────────────────────────────── */
  console.log('\nB · ROUTES (all fully keyed, ' + REPS + ' seeds each)   keys   cores   ☆');
  const table = {};
  for (const [name, src] of Object.entries(ROUTES)) {
    const rs = await run(src, REPS);
    if (rs.some(r => r.err)) { bad(name + ' errored: ' + rs.find(r => r.err).err); continue; }
    const k = rs.map(r => r.keys), ok = rs.every(r => r.coresOk), st = rs.every(r => r.star);
    table[name] = med(k);
    console.log('  ' + name.padEnd(12) + D(med(k), 6) + D(ok ? 'all' : 'DARK', 8) + D(st ? 'earned' : (rs.some(r => r.star) ? 'MIXED' : 'dark'), 9) +
      (ok ? '' : '   ' + JSON.stringify(rs.find(r => !r.coresOk).dark)));
    if (!ok) bad(name + ' left a core beat dark — §1.0(c) freedom violated');
    if (name === 'blockfill' && !st) bad('the ☆ route did not earn the ☆');
    if (name !== 'blockfill' && rs.some(r => r.star)) bad(name + ' earned the ☆ — §1.0-R2(i): it must be a distinct decision');
  }
  if (table.blockfill && table.perrow) {
    console.log('  spread (slowest legal ÷ ☆ route): ' + (table.slow / table.blockfill).toFixed(2) + '×');
    console.log('  ☆ worth vs the taught control: ' + (table.perrow - table.blockfill) + ' keys');
    const nonFill = ['pasteacross', 'multienter'].map(n => table[n]).filter(Boolean);
    if (nonFill.length) console.log('  best non-fill family: ' + Math.min(...nonFill) + ' keys (☆ route ' + table.blockfill + ')');
    if (table.perrow <= table.blockfill) bad('the ☆ route is not cheaper than the control — the CAMPAIGN §2 negative-value failure');
  }

  /* ── B2 · THE AUTOSUM EVIDENCE ───────────────────────────────────────────────── */
  console.log('\nB2 · AUTOSUM on the enterprise-value cell (why the autosum family is unavailable here)');
  const asum = await page.evaluate(() => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(x => x.remove());
    loadChallenge('dcfbuild');
    const C = CHALLENGES.dcfbuild, o = C._o, B = o.CB;
    const TX = s => [...s].map(ch => ({ key: ch }));
    const ent = { key: 'Enter' };
    const mv = [
      { sel: B + o.rDF, keys: [...TX(o.fDF), ent, ...TX(o.fPV), ent] },
      { sel: B + (o.rPV + 1), keys: [{ key: 'ArrowUp' }, { key: 'ArrowUp' },
          { key: 'ArrowRight', shift: true }, { key: 'ArrowRight', shift: true },
          { key: 'ArrowRight', shift: true }, { key: 'ArrowRight', shift: true },
          { key: 'ArrowDown', shift: true }, { key: 'r', ctrl: true }] },
      { sel: B + o.rTV, keys: [...TX(o.fTV), ent, ...TX(o.fPVTV), ent] },
      { sel: B + o.rEV, keys: [{ key: '=', alt: true, code: 'Equal' }, ent] },
    ];
    for (const m of mv) { if (m.sel) setDemoSel(m.sel); for (const k of m.keys) demoKey(k); }
    const cell = S.cells[B + o.rEV] || {};
    const items = C.checks(S);
    const evBeat = items[3];
    return { proposed: String(cell.formula || '(nothing)'), value: cell.value,
             want: 'the five PVs plus ' + B + o.rPVTV, evBeatOk: !!evBeat.ok };
  });
  console.log('  Alt+= proposed ' + asum.proposed + '   (needed: ' + asum.want + ')');
  console.log('  enterprise-value beat with the autosum answer standing: ' + (asum.evBeatOk ? 'GREEN' : 'dark — autosum cannot carry this beat'));
  if (asum.evBeatOk) bad('autosum landed a CORRECT enterprise value — the bake-off note is wrong, re-run the family choice');

  /* ── C · ROUTE PROBES ────────────────────────────────────────────────────────── */
  console.log('\nC · ALTERNATE DOORS (§1.0-R3(p) — each must clear every core)');
  for (const [name, src] of Object.entries(PROBES)) {
    const rs = await run(src, REPS);
    if (rs.some(r => r.err)) { bad(name + ' errored: ' + rs.find(r => r.err).err); continue; }
    const ok = rs.every(r => r.coresOk);
    console.log('  ' + name.padEnd(12) + (ok ? 'clears' : 'UNTRIGGERABLE ' + JSON.stringify(rs.find(r => !r.coresOk).dark)) +
      '   ☆ ' + (rs.every(r => r.star) ? 'earned' : rs.some(r => r.star) ? 'MIXED' : 'dark'));
    if (!ok) bad(name + ' cannot clear — an untriggerable beat');
  }
  const neg = await run(NEGATIVE, REPS);
  const negDark = neg.every(r => !r.coresOk && r.dark.some(d => d.indexOf('check line') >= 0));
  console.log('  negative-control (the circular check): ' + (negDark ? 'correctly DARK' : 'GRADED GREEN — the prove-out proves nothing'));
  if (!negDark) bad('the circular check cleared beat 6 — the independence predicate is dead');

  /* ── D · BOARD ───────────────────────────────────────────────────────────────── */
  console.log('\nD · BOARD (§1.3 density · #### scan at load and at the win · width · ☆ dress parity)');
  const board = await page.evaluate((n) => {
    const hashes = () => [...document.querySelectorAll('#grid td')]
      .filter(td => /^#+$/.test((td.textContent || '').trim())).length;
    const dens = () => { let used = 0;
      for (let r = 1; r <= S.ROWS; r++) { let any = false;
        for (let c = 1; c <= 10; c++) { const k = String.fromCharCode(64 + c) + r;
          const cell = S.cells[k]; if (cell && cell.value !== null && cell.value !== '') { any = true; break; } }
        if (any) used++; }
      return used; };
    const strip = () => { const o = CHALLENGES.dcfbuild._o;
      return o.Y.map(c => [c + o.rDF, c + o.rPV].map(k => { const x = S.cells[k] || {};
        return [x.fmtStyle, x.decimals, !!x.bold, !!x.bt, !!x.it].join('/'); }).join('|')).join(' '); };
    const out = [];
    for (let rep = 0; rep < n; rep++) {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(x => x.remove());
      loadChallenge('dcfbuild');
      const C = CHALLENGES.dcfbuild, o = C._o;
      render();
      const loadHash = hashes(), loadDens = dens(), rows = S.ROWS;
      const TX = s => [...s].map(ch => ({ key: ch })), ent = { key: 'Enter' };
      /* the TYPED route's dress, cell by cell — the r439 `cases` control */
      for (let i = 0; i < 5; i++) { setDemoSel(o.Y[i] + o.rDF);
        for (const k of [...TX('=1/(1+$' + o.CB + '$' + o.rWACC + ')^' + o.Y[i] + o.HR), ent]) demoKey(k); }
      for (let i = 0; i < 5; i++) { setDemoSel(o.Y[i] + o.rPV);
        for (const k of [...TX('=' + o.Y[i] + o.rFCF + '*' + o.Y[i] + o.rDF), ent]) demoKey(k); }
      const typedDress = strip();
      /* now the ☆ route on a fresh build of the SAME seed shape */
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(x => x.remove());
      loadChallenge('dcfbuild');
      const C2 = CHALLENGES.dcfbuild;
      for (const mv of C2.demo()) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      const starDress = strip();
      render();
      out.push({ rows: rows, loadHash: loadHash, loadDens: loadDens, winHash: hashes(), winDens: dens(),
                 dressMatch: typedDress === starDress, typedDress: typedDress, starDress: starDress,
                 gridW: (document.querySelector('#grid') || {}).scrollWidth,
                 wrapW: (document.querySelector('#gridwrap') || document.querySelector('.gridwrap') || {}).clientWidth });
    }
    return out;
  }, REPS);
  const rows = board[0].rows;
  const winD = board.map(b => b.winDens);
  console.log('  ROWS ' + rows + '  win-state density ' + Math.min(...winD) + '-' + Math.max(...winD) + '/' + rows +
    ' (' + Math.round(100 * Math.min(...winD) / rows) + '-' + Math.round(100 * Math.max(...winD) / rows) + '%)' +
    '  load density ' + board.map(b => b.loadDens).join(',') + '/' + rows);
  console.log('  #### at load ' + board.map(b => b.loadHash).join(',') + '   at win ' + board.map(b => b.winHash).join(',') +
    '   grid ' + board[0].gridW + 'px in ' + board[0].wrapW + 'px');
  console.log('  ☆ dress parity (a fill copies the SOURCE format — r439): ' +
    (board.every(b => b.dressMatch) ? 'identical to the typed route' : 'DIFFERS  typed=' + board.find(b => !b.dressMatch).typedDress + '  star=' + board.find(b => !b.dressMatch).starDress));
  if (rows !== 20) bad('ROWS is ' + rows + ', not 20 (§1.3 floor AND cap)');
  if (Math.min(...winD) / rows < 0.6) bad('win-state density under the §1.3 60% target');
  if (board.some(b => b.loadHash || b.winHash)) bad('#### on the board');
  if (board.some(b => b.gridW > b.wrapW)) bad('the sheet overruns its frame at natural width (CAMPAIGN §6.6)');
  if (!board.every(b => b.dressMatch)) bad('the ☆ route leaves the strip dressed differently from the typed route (r439 `cases`)');

  if (errs.length) bad('page errors: ' + JSON.stringify(errs.slice(0, 3)));
  console.log('\n' + (fails ? 'VERIFY-DCFBUILD: ' + fails + ' FAILURE(S)' : 'VERIFY-DCFBUILD: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
