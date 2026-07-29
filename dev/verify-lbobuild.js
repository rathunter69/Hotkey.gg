/* r449 — lbobuild VERIFICATION PROBE (DEPTH_PASS §4.85, CAMPAIGN §1/§2).
   Self-contained and single-drill by construction: this file names no drill but `lbobuild`
   (the C13 retirement guard reads dev/*.js for quoted keys).

   What it proves, in four sections:
     A · PAR — the demo's keyLog over N seeds (median/range) + the win flag, against the
         declared parKeys/par.
     B · ☆-HEADROOM + THE FAMILY BAKE-OFF (the wave-6 addendum) — every candidate ☆ family run
         on the IDENTICAL job, fully keyed, with the ☆'s state reported per route. Every
         selection and navigation is keyed; setDemoSel only parks the active cell entering a
         region, and it parks the same number of times in every route, so the deltas are honest.
         The `perline` route is also the §1.0-R2(i) SKIPPABILITY PROOF: all six cores clear by
         the taught per-line fill with the multi-commit star dark.
     C · ROUTE PROBES (§1.0-R3(p)) — the alternate doors that must all clear: pointed operands,
         an addition chain instead of SUM, a ROUND() wrapper, the hold typed into the exponent,
         the Cell Styles Total gallery, Alt H B S and Alt H B A outside borders, the ribbon fill,
         and — the one that matters most — the beat-6 cross-check read by hand-compounding the
         two ends instead of by =IRR(), which is what proves no beat grades a function name out
         of formula text. Reading a predicate cannot find that class; walking can.
     D · BOARD — ROWS, §1.3 win-state density, a #### scan at load AND at the win, and the
         natural-width figure against the grid frame (CAMPAIGN §6.6).

   Run: node dev/verify-lbobuild.js            (server on 127.0.0.1:8791)
        URL=http://127.0.0.1:8823/index.html node dev/verify-lbobuild.js   (a worktree port) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '3', 10);
const PAR_REPS = parseInt(process.env.PAR_REPS || '15', 10);

/* ── page-side route library. Each entry is the SOURCE of a function of the live challenge C
   returning demo-style moves. Shared fragments keep the routes comparable. */
const HEAD = `
  const o=C._o, A=o.CA, B=o.CB, X=o.CC, G=o.CG;
  const ent={key:'Enter'}, alt={key:'Alt'}, K=ch=>({key:ch,code:'Key'+ch.toUpperCase()});
  const N=n=>({key:String(n),code:'Digit'+n});
  const TX=s=>[...s].map(ch=>({key:ch}));
  const up={key:'ArrowUp'}, dn={key:'ArrowDown'}, rt={key:'ArrowRight'}, lf={key:'ArrowLeft'};
  const sU={key:'ArrowUp',shift:true}, sD={key:'ArrowDown',shift:true}, sR={key:'ArrowRight',shift:true};
  const ctrlR={key:'r',ctrl:true}, ctrlB={key:'b',ctrl:true}, ctrlEnt={key:'Enter',ctrl:true};
  const cpy={key:'c',ctrl:true}, pst={key:'v',ctrl:true}, asum={key:'=',alt:true,code:'Equal'};
  const fEV ='='+B+o.rEb+'*'+B+o.rMu;
  const fEVx='='+X+o.rEb+'*'+X+o.rMu;
  const fND ='=-'+B+o.rEb+'*'+B+o.rLv;
  const fEQ ='=SUM('+B+o.rEV+':'+B+o.rNd+')';
  const fEQx='=SUM('+X+o.rEV+':'+X+o.rNd+')';
  const fMO ='='+X+o.rEq+'/'+B+o.rEq;
  const fIR ='='+B+o.rMo+'^(1/'+B+o.rHD+')-1';
  const fF0 ='=-'+B+o.rEq;
  const fFN ='='+X+o.rEq;
  const fIF ='=IRR('+B+o.rFl+':'+G+o.rFl+')';
  /* the one graded dress pass (beat 4) — identical in every route unless the route is about it */
  const dressEq={sel:B+o.rEq, keys:[sR, ctrlB, alt,K('h'),K('b'),K('p')]};
  /* the returns block and the beat-6 prove-out — identical in every route below, so the bake-off
     deltas are pure bridge mechanics and nothing else */
  const returns=[
    {sel:B+o.rMo, keys:[...TX(fMO), ent]},
    {sel:B+o.rIr, keys:[...TX(fIR), ent]},
  ];
  const prove=[
    {sel:B+o.rFl, keys:[...TX(fF0), ent]},
    {sel:G+o.rFl, keys:[...TX(fFN), ent]},
    {sel:B+o.rIf, keys:[...TX(fIF), ent]},
  ];
  const tail=[dressEq, ...returns, ...prove];
`;

const ROUTES = {
  /* R1 — the ☆ by its MULTI-COMMIT door (S.multiEnter, `anchor`'s family): each computed line
     written ONCE with the pair already selected, committed into both columns by Ctrl+Enter.
     This is the route the demo takes, so it is also what parKeys measures. */
  mcommit: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[sR, ...TX(fEV), ctrlEnt]},
      {sel:B+o.rNd, keys:[...TX(fND), ent]},
      {sel:B+o.rEq, keys:[sR, ...TX(fEQ), ctrlEnt]},
      ...tail,
    ]; }`,
  /* R2 — the ☆ by its FILL door (S.fillOps): write the close cell, take it across with Ctrl+R.
     Must earn the same star — three doors, one visible end state (§1.0-R3(p)). */
  fillacross: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:B+o.rEV, keys:[sR, ctrlR]},
      {sel:B+o.rNd, keys:[...TX(fND), ent]},
      {sel:B+o.rEq, keys:[...TX(fEQ), ent]},
      {sel:B+o.rEq, keys:[sR, ctrlR]},
      ...tail,
    ]; }`,
  /* R3 — THE CONTROL and the §1.0-R2(i) SKIPPABILITY PROOF: nothing swept at all, both exit
     cells typed out. Every core clears, the star stays dark, and (this) minus (a family) is
     what that family is worth on this job. */
  typedout: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:X+o.rEV, keys:[...TX(fEVx), ent]},
      {sel:B+o.rNd, keys:[...TX(fND), ent]},
      {sel:B+o.rEq, keys:[...TX(fEQ), ent]},
      {sel:X+o.rEq, keys:[...TX(fEQx), ent]},
      ...tail,
    ]; }`,
  /* R4 — the ☆ by its PASTE door (S.pasteLog): the close cell copied onto the exit cell. */
  pasteacross: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:B+o.rEq, keys:[...TX(fEQ), ent]},
      {sel:B+o.rNd, keys:[...TX(fND), ent]},
      {sel:B+o.rEV, keys:[cpy, rt, pst]},
      {sel:B+o.rEq, keys:[cpy, rt, pst]},
      ...tail,
    ]; }`,
  /* R5 — AUTOSUM PROVENANCE (`scrub`/`isbuild`'s family, S.autoSumN): the equity line landed by
     Alt+= over the bridge instead of a typed SUM, on each column. The range grab is KEYED
     (Shift+Down ×3) rather than handed over by setDemoSel — the r438 `series` rule; handing it
     over reads ~10 keys cheaper and the number would be a lie. */
  autosum: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:B+o.rEV, keys:[sR, ctrlR]},
      {sel:B+o.rNd, keys:[...TX(fND), ent]},
      {sel:B+o.rEV, keys:[sD, sD, sD, asum]},
      {sel:X+o.rEV, keys:[sD, sD, sD, asum]},
      ...tail,
    ]; }`,
  /* R6 — the slowest legal route that still clears every core: nothing swept, an addition chain
     instead of SUM, and the one graded dress pass walked through the full ribbon one cell at a
     time. The §1.0(c) freedom floor and the clock's own argument. */
  slow: `C => { ${HEAD}
    const box=c=>({sel:c+o.rEq, keys:[alt,K('h'),N(1),alt,K('h'),K('b'),K('p')]});
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:X+o.rEV, keys:[...TX(fEVx), ent]},
      {sel:B+o.rNd, keys:[...TX(fND), ent]},
      {sel:B+o.rEq, keys:[...TX('='+B+o.rEV+'+'+B+o.rFe+'+'+B+o.rNd), ent]},
      {sel:X+o.rEq, keys:[...TX('='+X+o.rEV+'+'+X+o.rNd), ent]},
      box(B), box(X), ...returns, ...prove,
    ]; }`,
};

/* ── SECTION C: alternate doors that MUST clear (§1.0-R3(p)). Each is a full solve. */
const PROBES = {
  /* every operand POINTED with arrows instead of typed (`bridge`'s route) */
  pointed: `C => { ${HEAD}
    const U=n=>{ const a=[]; for(let i=0;i<n;i++) a.push(up); return a; };
    return [
      {sel:B+o.rEV, keys:[...TX('='), ...U(3), ...TX('*'), ...U(2), ent]},
      {sel:B+o.rEV, keys:[sR, ctrlR]},
      {sel:B+o.rNd, keys:[...TX('=-'), ...U(5), ...TX('*'), ...U(3), ent]},
      {sel:B+o.rEq, keys:[...TX('=SUM('), ...U(3), ...TX(':'), ...U(1), ...TX(')'), ent]},
      {sel:B+o.rEq, keys:[sR, ctrlR]},
      ...tail,
    ]; }`,
  /* an addition chain instead of SUM, a bracketed negation for the debt line, and the MOIC
     rebuilt INSIDE the IRR exponent rather than referenced */
  chain: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:X+o.rEV, keys:[...TX(fEVx), ent]},
      {sel:B+o.rNd, keys:[...TX('=-('+B+o.rEb+'*'+B+o.rLv+')'), ent]},
      {sel:B+o.rEq, keys:[...TX('='+B+o.rEV+'+'+B+o.rFe+'+'+B+o.rNd), ent]},
      {sel:X+o.rEq, keys:[...TX('='+X+o.rEV+'+'+X+o.rNd), ent]},
      dressEq,
      {sel:B+o.rMo, keys:[...TX(fMO), ent]},
      {sel:B+o.rIr, keys:[...TX('=('+X+o.rEq+'/'+B+o.rEq+')^(1/'+B+o.rHD+')-1'), ent]},
      ...prove,
    ]; }`,
  /* the hold TYPED into the exponent — a hardcode inside a formula is a model sin
     (MODELING_STANDARDS §1) but it is not a WRONG ANSWER, and §1.0-R3(p) grades the end state */
  typedHold: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:B+o.rEV, keys:[sR, ctrlR]},
      {sel:B+o.rNd, keys:[...TX('='+B+o.rEb+'*'+B+o.rLv+'*-1'), ent]},
      {sel:B+o.rEq, keys:[...TX(fEQ), ent]},
      {sel:B+o.rEq, keys:[sR, ctrlR]},
      dressEq,
      {sel:B+o.rMo, keys:[...TX(fMO), ent]},
      {sel:B+o.rIr, keys:[...TX('='+B+o.rMo+'^(1/5)-1'), ent]},
      ...prove,
    ]; }`,
  /* the Cell Styles gallery for the equity dress (Total = bold + the rule above, in one walk)
     and Alt H 1 for the returns bold — the two doors a strict `bt && !bb` reading would lose */
  gallery: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:B+o.rEV, keys:[sR, ctrlR]},
      {sel:B+o.rNd, keys:[...TX(fND), ent]},
      {sel:B+o.rEq, keys:[...TX(fEQ), ent]},
      {sel:B+o.rEq, keys:[sR, ctrlR]},
      {sel:B+o.rEq, keys:[sR, alt,K('h'),K('j'),rt,rt,rt,rt,ent]},
      ...returns, ...prove,
    ]; }`,
  /* Alt H B S (OUTSIDE border over the two-cell row) and Alt H B A (every edge) — both draw the
     rule above the equity line, so both must clear the lenient `bt || ball` reading */
  outsideBox: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:B+o.rEV, keys:[sR, alt,K('h'),K('f'),K('i'),K('r')]},
      {sel:B+o.rNd, keys:[...TX(fND), ent]},
      {sel:B+o.rEq, keys:[...TX(fEQ), ent]},
      {sel:B+o.rEq, keys:[sR, alt,K('h'),K('f'),K('i'),K('r')]},
      {sel:B+o.rEq, keys:[sR, ctrlB, alt,K('h'),K('b'),K('s')]},
      ...returns, ...prove,
    ]; }`,
  allBorders: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:B+o.rEV, keys:[sR, ctrlR]},
      {sel:B+o.rNd, keys:[...TX(fND), ent]},
      {sel:B+o.rEq, keys:[...TX(fEQ), ent]},
      {sel:B+o.rEq, keys:[sR, ctrlR]},
      {sel:A+o.rEq, keys:[sR, sR, ctrlB, alt,K('h'),K('b'),K('a')]},
      ...returns, ...prove,
    ]; }`,
  /* ROUND(...,0) wrappers on both bridge lines — the desk habit the tolerances exist for */
  rounded: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX('=ROUND('+B+o.rEb+'*'+B+o.rMu+',0)'), ent]},
      {sel:B+o.rEV, keys:[sR, ctrlR]},
      {sel:B+o.rNd, keys:[...TX('=-ROUND('+B+o.rEb+'*'+B+o.rLv+',0)'), ent]},
      {sel:B+o.rEq, keys:[...TX(fEQ), ent]},
      {sel:B+o.rEq, keys:[sR, ctrlR]},
      ...tail,
    ]; }`,
  /* beat 6 by the OTHER door: the same dated flows, the ends pointed through =0-… and =+… , and
     the read hand-compounded instead of handed to =IRR(). Nothing on this board reads a function
     name or a sign form out of formula text. */
  handCompound: `C => { ${HEAD}
    return [
      {sel:B+o.rEV, keys:[...TX(fEV), ent]},
      {sel:B+o.rEV, keys:[sR, ctrlR]},
      {sel:B+o.rNd, keys:[...TX(fND), ent]},
      {sel:B+o.rEq, keys:[...TX(fEQ), ent]},
      {sel:B+o.rEq, keys:[sR, ctrlR]},
      dressEq, ...returns,
      {sel:B+o.rFl, keys:[...TX('=0-'+B+o.rEq), ent]},
      {sel:G+o.rFl, keys:[...TX('=+'+X+o.rEq), ent]},
      {sel:B+o.rIf, keys:[...TX('=('+G+o.rFl+'/-'+B+o.rFl+')^(1/'+B+o.rHD+')-1'), ent]},
    ]; }`,
};

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
        loadChallenge('lbobuild');
        const C = CHALLENGES.lbobuild;
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
        loadChallenge('lbobuild');
        const C = CHALLENGES.lbobuild;
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
  const C0 = await page.evaluate(() => ({ par: CHALLENGES.lbobuild.par, parKeys: CHALLENGES.lbobuild.parKeys }));
  console.log('  median ' + med(pk) + '  range ' + Math.min(...pk) + '-' + Math.max(...pk) +
    '  declared parKeys ' + C0.parKeys + '  par ' + C0.par + '  s/key ' + (C0.par / C0.parKeys).toFixed(2));
  if (Math.abs(med(pk) - C0.parKeys) > 4) bad('parKeys drift: measured ' + med(pk) + ' vs declared ' + C0.parKeys);

  /* ── B · ☆-HEADROOM + FAMILY BAKE-OFF ────────────────────────────────────────── */
  console.log('\nB · ROUTES (all fully keyed, ' + REPS + ' seeds each)   keys   cores   ☆');
  /* which routes MUST earn the star: the three doors of the one-pass sweep. Everything else must
     leave it dark — that is the §1.0-R2(i) skippability proof and the §1.0-R3(p) door census in
     one table, and it is what caught the first cut of this star measuring worth ZERO keys. */
  const EARNS = new Set(['mcommit', 'fillacross', 'pasteacross']);
  const table = {};
  for (const [name, src] of Object.entries(ROUTES)) {
    const rs = await run(src, REPS);
    if (rs.some(r => r.err)) { bad(name + ' errored: ' + rs.find(r => r.err).err); continue; }
    const k = rs.map(r => r.keys), ok = rs.every(r => r.coresOk), st = rs.every(r => r.star);
    table[name] = med(k);
    console.log('  ' + name.padEnd(12) + D(med(k), 6) + D(ok ? 'all' : 'DARK', 8) +
      D(st ? 'earned' : (rs.some(r => r.star) ? 'MIXED' : 'dark'), 9) +
      (ok ? '' : '   ' + JSON.stringify(rs.find(r => !r.coresOk).dark)));
    if (!ok) bad(name + ' left a core beat dark — §1.0(c) freedom violated');
    if (EARNS.has(name) && !st) bad(name + ' is a ☆ door and did not earn it — §1.0-R3(p): three doors, one end state');
    if (!EARNS.has(name) && rs.some(r => r.star)) bad(name + ' earned the ☆ — §1.0-R2(i): it must be a distinct decision');
  }
  if (table.mcommit && table.typedout) {
    const best = Math.min(table.mcommit, table.fillacross, table.pasteacross);
    console.log('  spread (slowest legal ÷ fastest legal): ' + (table.slow / Math.min(best, table.autosum || best)).toFixed(2) + '×');
    console.log('  the ☆ is worth ' + (table.typedout - best) + ' keys against the no-sweep control (' + best + ' vs ' + table.typedout + ')');
    console.log('  autosum on the equity line alone: ' + (table.fillacross - table.autosum) + ' keys, too small to hang a star on');
    if (table.typedout - best < 5) bad('the ☆ is worth fewer than 5 keys against its own control — the CAMPAIGN §2 negative-value failure');
  }

  /* ── C · ROUTE PROBES ────────────────────────────────────────────────────────── */
  console.log('\nC · ALTERNATE DOORS (§1.0-R3(p) — each must clear every core)');
  for (const [name, src] of Object.entries(PROBES)) {
    const rs = await run(src, REPS);
    if (rs.some(r => r.err)) { bad(name + ' errored: ' + rs.find(r => r.err).err); continue; }
    const ok = rs.every(r => r.coresOk);
    console.log('  ' + name.padEnd(12) + (ok ? 'clears' : 'UNTRIGGERABLE ' + JSON.stringify(rs.find(r => !r.coresOk).dark)) +
      '   ☆ ' + (rs.every(r => r.star) ? 'earned' : rs.some(r => r.star) ? 'MIXED' : 'dark'));
    if (!ok) bad(name + ' cannot clear — an untriggerable beat');
    if (name === 'handCompound' && !ok) bad('handCompound left a core dark — beat 6 is grading the function name, not the answer');
  }

  /* ── D · BOARD ───────────────────────────────────────────────────────────────── */
  console.log('\nD · BOARD (§1.3 density · #### scan at load and at the win · frame fit)');
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
      loadChallenge('lbobuild');
      const C = CHALLENGES.lbobuild;
      render();
      const loadHash = hashes(), loadDens = dens(), rows = S.ROWS;
      let nat = 0; for (let c = 1; c <= 10; c++) nat += (S.colW && S.colW[c]) || 78;
      for (const mv of C.demo()) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      render();
      out.push({ rows: rows, loadHash: loadHash, loadDens: loadDens, winHash: hashes(), winDens: dens(),
                 nat: nat, gridW: (document.querySelector('#grid') || {}).scrollWidth,
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
    '   natural cols ' + board[0].nat + 'px · grid ' + board[0].gridW + 'px in ' + board[0].wrapW + 'px');
  if (rows !== 20) bad('ROWS is ' + rows + ', not 20 (§1.3 floor AND cap)');
  if (Math.min(...winD) / rows < 0.6) bad('win-state density under the §1.3 60% target');
  if (board.some(b => b.loadHash || b.winHash)) bad('#### on the board');
  if (board.some(b => b.gridW > b.wrapW)) bad('the sheet overruns its frame (CAMPAIGN §6.6)');

  /* ── E · CONTRACT (§1.0(d) mystery slot · §1.2 axes · determinism) ───────────── */
  console.log('\nE · CONTRACT (§1.0(d) the slot stays a mystery · §1.2 axes · same-seed determinism)');
  const contract = await page.evaluate(() => {
    const out = {};
    loadChallenge('lbobuild');
    const C = CHALLENGES.lbobuild;
    const rowsAt = C.checks(S);
    out.bonusN = rowsAt.filter(x => x.bonus).length;
    out.starDark = !rowsAt.filter(x => x.bonus).some(x => x.ok);
    out.authored = rowsAt.filter(x => !x.bonus).length - (C.saveClose ? 1 : 0);
    const list = (document.getElementById('checklist') || {}).textContent || '';
    out.mystery = /☆\s*\?/.test(list);
    const starLabel = (rowsAt.find(x => x.bonus) || {}).label || '';
    out.leak = list.includes(starLabel.replace(/^☆\s*/, '').slice(0, 28));
    const sig = () => JSON.stringify(C._o) + '|' +
      JSON.stringify(Object.keys(S.cells).sort().slice(0, 40).map(x => S.cells[x].value));
    const seen = new Set();
    for (let i = 0; i < 30; i++) { loadChallenge('lbobuild'); seen.add(sig()); }
    out.distinct = seen.size;
    return out;
  });
  console.log('  bonus beats ' + contract.bonusN + ' · dark at load ' + contract.starDark +
    ' · authored cores ' + contract.authored + ' · "☆ ?" rendered ' + contract.mystery +
    ' · label leaked ' + contract.leak + ' · ' + contract.distinct + '/30 distinct builds');
  if (contract.bonusN !== 1) bad('expected exactly one ☆ beat, found ' + contract.bonusN);
  if (!contract.starDark) bad('the ☆ is already earned at load');
  if (contract.authored < 4 || contract.authored > 6) bad('authored core beats ' + contract.authored + ' (§1.1 wants 4-6)');
  if (!contract.mystery) bad('the checklist does not render the mystery "☆ ?" slot');
  if (contract.leak) bad('the ☆ label leaks on screen before it is earned');
  if (contract.distinct < 2) bad('the board is identical across 30 builds (§1.2 wants ≥2 axes)');

  if (errs.length) bad('page errors: ' + JSON.stringify(errs.slice(0, 3)));
  console.log('\n' + (fails ? 'VERIFY-LBOBUILD: ' + fails + ' FAILURE(S)' : 'VERIFY-LBOBUILD: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
