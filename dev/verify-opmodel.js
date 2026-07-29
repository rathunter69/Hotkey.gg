/* r449 — opmodel VERIFICATION PROBE (DEPTH_PASS §4.83, CAMPAIGN §1/§2/§3).
   Self-contained and single-drill by construction: this file names no drill but `opmodel`
   (the C13 retirement guard reads dev/*.js for quoted keys).

   What it proves, in five sections:
     A · PAR — the demo's keyLog over N seeds (median/range) + the win flag + parKeys drift.
     B · ☆-HEADROOM + THE FAMILY BAKE-OFF — six FULLY KEYED routes over the same job, each
         asserted to clear every core, with the ☆'s state reported per route. Every selection
         and navigation is keyed; setDemoSel only parks the active cell entering a region, and
         it parks the SAME number of times in every route, so the deltas are honest.
     C · ROUTE PROBES (§1.0-R3(p)) — the alternate doors that must all clear: column-only
         anchoring, the compound revenue form an `isbuild`-fluent player reaches for, ROUND()
         wrappers, an addition chain and Alt+= instead of a typed SUM, Alt H P + Alt H 0 for the
         percent, Alt H 1 for bold, Alt H B S over the row, and the ribbon fill.
     D · BORDER FACTS — every border door walked on the total row, with the stored flags, so the
         `bt || ball` lenient reading is measured rather than asserted.
     E · BOARD — §1.3 win-state density, the ROWS cap, and a #### scan at load AND at the win.

   Run: node dev/verify-opmodel.js            (server on 127.0.0.1:8791)
        URL=http://127.0.0.1:8829/index.html node dev/verify-opmodel.js   (a worktree port) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '3', 10);
const PAR_REPS = parseInt(process.env.PAR_REPS || '15', 10);

/* ── page-side route library. Each entry is the SOURCE of a function of the live challenge C
   returning demo-style moves. Shared fragments keep the routes comparable. */
const HEAD = `
  const o=C._o;
  const YC=i=>String.fromCharCode(64+o.cA+i);
  const P=[0,1,2,3,4,5].map(YC);
  const up={key:'ArrowUp'}, dn={key:'ArrowDown'}, rt={key:'ArrowRight'};
  const sU={key:'ArrowUp',shift:true}, sD={key:'ArrowDown',shift:true}, sR={key:'ArrowRight',shift:true};
  const ent={key:'Enter'}, ctrlR={key:'r',ctrl:true}, ctrlB={key:'b',ctrl:true};
  const cpy={key:'c',ctrl:true}, pst={key:'v',ctrl:true};
  const alt={key:'Alt'}, K=ch=>({key:ch,code:'Key'+ch.toUpperCase()}), D1={key:'1',ctrl:true};
  const TX=s=>[...s].map(ch=>({key:ch}));
  const f=(i)=>({
    vol:'='+P[i-1]+o.rVol+'*(1+'+o.gUA+')',
    prc:'='+P[i-1]+o.rPrc+'*(1+'+o.gPA+')',
    rev:'='+P[i]+o.rVol+'*'+P[i]+o.rPrc,
    cog:'=-'+P[i]+o.rVol+'*'+o.ucA,
    opx:'=-'+P[i]+o.rRev+'*'+o.oPA,
    ebd:'=SUM('+P[i]+o.rRev+':'+P[i]+o.rOpx+')',
    mgn:'='+P[i]+o.rEbd+'/'+P[i]+o.rRev });
  const F1=f(1);
  /* the first plan year, typed top to bottom, percent landed on the memo — IDENTICAL in every
     route below, so the deltas are pure carry mechanics */
  const firstYear=[
    {sel:P[1]+o.rVol, keys:[...TX(F1.vol),ent,...TX(F1.prc),ent]},
    {sel:P[1]+o.rRev, keys:[...TX(F1.rev),ent,...TX(F1.cog),ent,...TX(F1.opx),ent,...TX(F1.ebd),ent]},
    {sel:P[1]+o.rMgn, keys:[...TX(F1.mgn),ent]},
    {sel:P[1]+o.rMgn, keys:[D1,K('p')]},
  ];
  const dress=[{sel:o.ebdRow, keys:[ctrlB, alt,K('h'),K('b'),K('p')]}];
  /* PARK PARITY (the honesty rule that this probe got WRONG on its first run and that
     CAMPAIGN §4 warns about): setDemoSel costs no keys, so a route handed more parks than its
     rivals measures cheap for free. The first run gave the clipboard route two free parks and
     the block fill none, and reported the clipboard 11 keys AHEAD — an artifact, not a finding.
     Every carry route below now takes the SAME SEVEN parks, one per built row, and does all of
     its work from them with keys. carry(col,fn) builds that fixed park list so no route can
     quietly acquire an eighth. */
  const ROWS7=[o.rVol,o.rPrc,o.rRev,o.rCog,o.rOpx,o.rEbd,o.rMgn];
  const carry=(col,fn)=>ROWS7.map((r,i)=>({sel:P[col]+r, keys:fn(r,i)}));
`;

const ROUTES = {
  /* R1 — the ☆ route the demo takes: the finished plan column copied ONCE, the selection widened
     across the plan, ONE paste. Seven parks, and the work is done at the first of them. */
  clipboard: `C => { ${HEAD}
    return [...firstYear,
      ...carry(1,(r,i)=> i===0 ? [sD,sD,sD,sD,sD,sD,sD,sD, cpy, sR,sR,sR,sR, pst] : []),
      ...dress]; }`,
  /* R2 — ONE BLOCK FILL over the same rect (S.fillOps). Clears every core, ☆ dark. ALT 1. */
  blockfill: `C => { ${HEAD}
    return [...firstYear,
      ...carry(1,(r,i)=> i===0 ? [sD,sD,sD,sD,sD,sD,sD,sD, sR,sR,sR,sR, ctrlR] : []),
      ...dress]; }`,
  /* R3 — THE CONTROL (§1.0-R2(i) skippability): per-line fills, ☆ dark. ALT 2. */
  perline: `C => { ${HEAD}
    return [...firstYear,
      ...carry(1,()=>[sR,sR,sR,sR, ctrlR]),
      ...dress]; }`,
  /* R4 — Ctrl+Enter multi-commit per line (S.multiEnter, `anchor`'s family), ☆ dark. */
  multienter: `C => { ${HEAD}
    const ce={key:'Enter',ctrl:true};
    const F2=f(2), byRow={};
    byRow[o.rVol]=F2.vol; byRow[o.rPrc]=F2.prc; byRow[o.rRev]=F2.rev; byRow[o.rCog]=F2.cog;
    byRow[o.rOpx]=F2.opx; byRow[o.rEbd]=F2.ebd; byRow[o.rMgn]=F2.mgn;
    return [...firstYear,
      ...carry(2,(r)=> r===o.rMgn ? [sR,sR,sR, ...TX(byRow[r]), ce, D1,K('p')]
                                  : [sR,sR,sR, ...TX(byRow[r]), ce]),
      ...dress]; }`,
  /* R5 — autosum provenance on EBITDA (S.autoSumN, `scrub`'s family) + per-line fills, ☆ dark.
     One extra park over the others (the subtotal is entered from its own cell because Alt+= does
     not walk the cursor), and it is reported. */
  autosum: `C => { ${HEAD}
    const asum={key:'=',alt:true,code:'Equal'};
    return [
      {sel:P[1]+o.rVol, keys:[...TX(F1.vol),ent,...TX(F1.prc),ent]},
      {sel:P[1]+o.rRev, keys:[...TX(F1.rev),ent,...TX(F1.cog),ent,...TX(F1.opx),ent]},
      {sel:P[1]+o.rEbd, keys:[asum,ent]},
      {sel:P[1]+o.rMgn, keys:[...TX(F1.mgn),ent]},
      {sel:P[1]+o.rMgn, keys:[D1,K('p')]},
      ...carry(1,()=>[sR,sR,sR,sR, ctrlR]),
      ...dress]; }`,
  /* R6 — the slowest legal route: no anchors, no fills, no clipboard. Every cell of every line
     typed year by year, and the memo percented one cell at a time. The §1.0(c) freedom floor. */
  slow: `C => { ${HEAD}
    const mv=[];
    for(let i=1;i<=5;i++){ const x=f(i), a=o.gUA.replace(/\\$/g,''), b=o.gPA.replace(/\\$/g,''),
      u=o.ucA.replace(/\\$/g,''), p=o.oPA.replace(/\\$/g,'');
      mv.push({sel:P[i]+o.rVol, keys:[
        ...TX('='+P[i-1]+o.rVol+'*(1+'+a+')'), ent,
        ...TX('='+P[i-1]+o.rPrc+'*(1+'+b+')'), ent]});
      mv.push({sel:P[i]+o.rRev, keys:[
        ...TX(x.rev), ent,
        ...TX('=-'+P[i]+o.rVol+'*'+u), ent,
        ...TX('=-'+P[i]+o.rRev+'*'+p), ent,
        ...TX('='+P[i]+o.rRev+'+'+P[i]+o.rCog+'+'+P[i]+o.rOpx), ent]});
      mv.push({sel:P[i]+o.rMgn, keys:[...TX(x.mgn), ent]});
      mv.push({sel:P[i]+o.rMgn, keys:[D1,K('p')]});
      mv.push({sel:P[i]+o.rEbd, keys:[ctrlB, alt,K('h'),K('b'),K('p')]});
    }
    mv.push({sel:P[0]+o.rEbd, keys:[ctrlB, alt,K('h'),K('b'),K('p')]});
    return mv; }`,
};

/* ── SECTION C: alternate doors that MUST clear (§1.0-R3(p)). Each is a full solve. */
const PROBES = {
  /* column-only anchors ($B16, not $B$16) — a right-carry needs nothing more, so it must clear */
  colAnchor: `C => { ${HEAD}
    const a=o.gUA.replace(/\\$(\\d)/,'$1'), b=o.gPA.replace(/\\$(\\d)/,'$1'),
          u=o.ucA.replace(/\\$(\\d)/,'$1'), p=o.oPA.replace(/\\$(\\d)/,'$1');
    return [
      {sel:P[1]+o.rVol, keys:[...TX('='+P[0]+o.rVol+'*(1+'+a+')'),ent,...TX('='+P[0]+o.rPrc+'*(1+'+b+')'),ent]},
      {sel:P[1]+o.rRev, keys:[...TX(F1.rev),ent,...TX('=-'+P[1]+o.rVol+'*'+u),ent,...TX('=-'+P[1]+o.rRev+'*'+p),ent,...TX(F1.ebd),ent]},
      {sel:P[1]+o.rMgn, keys:[...TX(F1.mgn),ent,]},
      {sel:P[1]+o.rMgn, keys:[D1,K('p')]},
      {sel:o.planCol,  keys:[cpy]},
      {sel:o.planRest, keys:[pst]},
      ...dress]; }`,
  /* THE DISCRIMINATOR DOOR: the compound revenue form an `isbuild`-fluent player reaches for —
     the prior year's revenue grown by BOTH rates. Algebraically identical, so it must clear. */
  compoundRev: `C => { ${HEAD}
    const cRev='='+P[0]+o.rRev+'*(1+'+o.gUA+')*(1+'+o.gPA+')';
    return [
      {sel:P[1]+o.rVol, keys:[...TX(F1.vol),ent,...TX(F1.prc),ent]},
      {sel:P[1]+o.rRev, keys:[...TX(cRev),ent,...TX(F1.cog),ent,...TX(F1.opx),ent,...TX(F1.ebd),ent]},
      {sel:P[1]+o.rMgn, keys:[...TX(F1.mgn),ent]},
      {sel:P[1]+o.rMgn, keys:[D1,K('p')]},
      {sel:o.planCol,  keys:[cpy]},
      {sel:o.planRest, keys:[pst]},
      ...dress]; }`,
  /* ROUND(...) on the money lines — the desk habit; the tolerance band exists for it */
  rounded: `C => { ${HEAD}
    return [
      {sel:P[1]+o.rVol, keys:[...TX(F1.vol),ent,...TX(F1.prc),ent]},
      {sel:P[1]+o.rRev, keys:[
        ...TX('=ROUND('+P[1]+o.rVol+'*'+P[1]+o.rPrc+',0)'),ent,
        ...TX('=-ROUND('+P[1]+o.rVol+'*'+o.ucA+',0)'),ent,
        ...TX('=-ROUND('+P[1]+o.rRev+'*'+o.oPA+',0)'),ent,
        ...TX(F1.ebd),ent]},
      {sel:P[1]+o.rMgn, keys:[...TX(F1.mgn),ent]},
      {sel:P[1]+o.rMgn, keys:[D1,K('p')]},
      {sel:o.planCol,  keys:[cpy]},
      {sel:o.planRest, keys:[pst]},
      ...dress]; }`,
  /* an addition chain instead of SUM, Alt H P + Alt H 0 for the percent, Alt H 1 for bold,
     Alt H B S (OUTSIDE border) for the rule, and the RIBBON fill for the carry */
  ribbon: `C => { ${HEAD}
    const chain='='+P[1]+o.rRev+'+'+P[1]+o.rCog+'+'+P[1]+o.rOpx;
    return [
      {sel:P[1]+o.rVol, keys:[...TX(F1.vol),ent,...TX(F1.prc),ent]},
      {sel:P[1]+o.rRev, keys:[...TX(F1.rev),ent,...TX(F1.cog),ent,...TX(F1.opx),ent,...TX(chain),ent]},
      {sel:P[1]+o.rMgn, keys:[...TX(F1.mgn),ent]},
      {sel:P[1]+o.rMgn, keys:[alt,K('h'),K('p'),alt,K('h'),{key:'0',code:'Digit0'}]},
      {sel:P[1]+o.rVol, keys:[sD,sD,sD,sD,sD,sD,sD,sD, sR,sR,sR,sR, alt,K('h'),K('f'),K('i'),K('r')]},
      {sel:o.ebdRow, keys:[alt,K('h'),{key:'1',code:'Digit1'}, alt,K('h'),K('b'),K('s')]},
    ]; }`,
  /* the Cell Styles gallery for the dress (Alt H J -> Total: bold + a rule above) */
  gallery: `C => { ${HEAD}
    return [...firstYear,
      {sel:o.planCol, keys:[cpy]},
      {sel:o.planAll, keys:[pst]},
      {sel:o.ebdRow, keys:[alt,K('h'),K('j'),rt,rt,rt,rt,ent]},
    ]; }`,
};

/* ── SECTION D: border doors on the total row, reported with the stored flags. */
const BORDERS = {
  hbp: "[alt,K('h'),K('b'),K('p')]",
  hbt: "[alt,K('h'),K('b'),K('t')]",
  hbd: "[alt,K('h'),K('b'),K('d')]",
  hbs: "[alt,K('h'),K('b'),K('s')]",
  hba: "[alt,K('h'),K('b'),K('a')]",
  hbo: "[alt,K('h'),K('b'),K('o')]",
  hbb: "[alt,K('h'),K('b'),K('b')]",
};

const D=(x,n)=>String(x).padStart(n);

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
        loadChallenge('opmodel');
        const C = CHALLENGES.opmodel;
        const moves = eval('(' + s + ')')(C);
        let parks = 0;
        for (const mv of moves) { if (mv.sel) { setDemoSel(mv.sel); parks++; } for (const k of mv.keys) demoKey(k); }
        const items = C.checks(S);
        const cores = items.filter(x => !x.bonus && !x.save);
        const star = items.find(x => x.bonus);
        out.push({ keys: keyLog.length, parks: parks, coresOk: cores.every(x => x.ok),
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
        loadChallenge('opmodel');
        const C = CHALLENGES.opmodel;
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
  const C0 = await page.evaluate(() => ({ par: CHALLENGES.opmodel.par, parKeys: CHALLENGES.opmodel.parKeys }));
  console.log('  median ' + med(pk) + '  range ' + Math.min(...pk) + '-' + Math.max(...pk) +
    '  declared parKeys ' + C0.parKeys + '  par ' + C0.par + '  s/key ' + (C0.par / C0.parKeys).toFixed(2));
  if (Math.abs(med(pk) - C0.parKeys) > 4) bad('parKeys drift: measured ' + med(pk) + ' vs declared ' + C0.parKeys);

  /* ── B · ☆-HEADROOM + FAMILY BAKE-OFF ────────────────────────────────────────── */
  console.log('\nB · ROUTES (all fully keyed, ' + REPS + ' seeds each)   keys  parks   cores   ☆');
  const table = {};
  for (const [name, src] of Object.entries(ROUTES)) {
    const rs = await run(src, REPS);
    if (rs.some(r => r.err)) { bad(name + ' errored: ' + rs.find(r => r.err).err); continue; }
    const k = rs.map(r => r.keys), ok = rs.every(r => r.coresOk), st = rs.every(r => r.star);
    table[name] = med(k);
    console.log('  ' + name.padEnd(12) + D(med(k), 6) + D(rs[0].parks, 7) + D(ok ? 'all' : 'DARK', 8) + D(st ? 'earned' : (rs.some(r => r.star) ? 'MIXED' : 'dark'), 9) +
      (ok ? '' : '   ' + JSON.stringify(rs.find(r => !r.coresOk).dark)));
    if (!ok) bad(name + ' left a core beat dark — §1.0(c) freedom violated');
    if (name === 'clipboard' && !st) bad('the ☆ route did not earn the ☆');
    if (name !== 'clipboard' && rs.some(r => r.star)) bad(name + ' earned the ☆ — §1.0-R2(i): it must be a distinct decision');
  }
  if (table.clipboard && table.perline) {
    console.log('  spread (slowest legal ÷ ☆ route): ' + (table.slow / table.clipboard).toFixed(2) + '×');
    console.log('  ☆ worth vs the taught per-line control: ' + (table.perline - table.clipboard) + ' keys');
    console.log('  cost of the non-fill preference (☆ − block fill): ' + (table.clipboard - table.blockfill) + ' keys');
    if (table.perline <= table.clipboard) bad('the ☆ route is not cheaper than the control — the CAMPAIGN §2 negative-value failure');
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
  }

  /* ── D · BORDER FACTS ────────────────────────────────────────────────────────── */
  console.log('\nD · BORDER DOORS on the total row (flags stored, and the beat\'s verdict)');
  for (const [name, keys] of Object.entries(BORDERS)) {
    const src = `C => { ${HEAD} return [{sel:o.ebdRow, keys:[ctrlB, ...${keys}]}]; }`;
    const res = await page.evaluate((s) => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(x => x.remove());
      loadChallenge('opmodel');
      const C = CHALLENGES.opmodel, o = C._o;
      const moves = eval('(' + s + ')')(C);
      for (const mv of moves) { if (mv.sel) setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      const k = String.fromCharCode(64 + o.cA + 2) + o.rEbd, c = S.cells[k] || {};
      const verdict = [0, 1, 2, 3, 4, 5].every(i => { const x = S.cells[String.fromCharCode(64 + o.cA + i) + o.rEbd] || {}; return !!(x.bold && (x.bt || x.ball)); });
      return { bt: !!c.bt, bb: !!c.bb, ball: !!c.ball, bdbl: !!c.bdbl, bold: !!c.bold, verdict: verdict };
    }, src);
    console.log('  ' + name.padEnd(5) + ' bt=' + (res.bt ? 1 : 0) + ' bb=' + (res.bb ? 1 : 0) +
      ' ball=' + (res.ball ? 1 : 0) + ' bdbl=' + (res.bdbl ? 1 : 0) + '  beat ' + (res.verdict ? 'GREEN' : 'dark'));
    if (['hbp', 'hbt', 'hbd', 'hbs', 'hba'].includes(name) && !res.verdict) bad(name + ' leaves a visible rule above the total and the beat stays dark — §1.0-R3(p)');
    if (['hbo', 'hbb'].includes(name) && res.verdict) bad(name + ' rules UNDER the total and should not clear (§1.0(f))');
  }

  /* ── E · BOARD ───────────────────────────────────────────────────────────────── */
  console.log('\nE · BOARD (§1.3 density · #### scan at load and at the win)');
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
      loadChallenge('opmodel');
      const C = CHALLENGES.opmodel;
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
  console.log('\n' + (fails ? 'VERIFY-OPMODEL: ' + fails + ' FAILURE(S)' : 'VERIFY-OPMODEL: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
