/* r448 — nwcsched VERIFICATION PROBE (DEPTH_PASS §4.81, CAMPAIGN §1/§2).
   Self-contained and single-drill by construction: this file names no drill but `nwcsched`
   (the C13 retirement guard reads dev/*.js for quoted keys).

   What it proves, in four sections:
     A · PAR — the demo's keyLog over N seeds (median/range) + the win flag.
     B · ☆-HEADROOM + THE FAMILY BAKE-OFF — six FULLY KEYED routes over the same job, each
         asserted to clear every core, with the ☆'s state reported per route. Every selection
         and navigation is keyed; setDemoSel only parks the active cell entering a region, and
         it parks the SAME number of times in every route, so the deltas are honest.
     C · ROUTE PROBES (§1.0-R3(p)) — the alternate doors that must all clear: column-only
         anchoring, ROUND() wrappers, an addition chain and Alt+= instead of a typed SUM, the
         Cell Styles Input/Total gallery, Alt H B S over the row, Alt H 1 for bold, and the
         ribbon fill. Reading a predicate cannot find the untriggerable class; walking can.
     D · BOARD — §1.3 win-state density and a #### scan at load AND at the win.

   Run: node dev/verify-nwcsched.js            (server on 127.0.0.1:8791)
        URL=http://127.0.0.1:8817/index.html node dev/verify-nwcsched.js   (a worktree port) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '3', 10);
const PAR_REPS = parseInt(process.env.PAR_REPS || '15', 10);

/* ── page-side route library. Each entry is the SOURCE of a function of the live challenge C
   returning demo-style moves. Shared fragments keep the routes comparable. */
const HEAD = `
  const o=C._o, F1=o.Y1, Y=o.Y;
  const up={key:'ArrowUp'}, dn={key:'ArrowDown'}, rt={key:'ArrowRight'};
  const sU={key:'ArrowUp',shift:true}, sD={key:'ArrowDown',shift:true}, sR={key:'ArrowRight',shift:true};
  const cU={key:'ArrowUp',ctrl:true}, cD={key:'ArrowDown',ctrl:true};
  const ent={key:'Enter'}, ctrlR={key:'r',ctrl:true}, ctrlB={key:'b',ctrl:true};
  const alt={key:'Alt'}, K=ch=>({key:ch,code:'Key'+ch.toUpperCase()});
  const TX=s=>[...s].map(ch=>({key:ch}));
  const fAR ='='+F1+o.rRev+'/365*$'+o.CD+'$'+o.rDSO;
  const fINV='='+F1+o.rCog+'/365*$'+o.CD+'$'+o.rDIO;
  const fAP ='=-'+F1+o.rCog+'/365*$'+o.CD+'$'+o.rDPO;
  const fNWC='=SUM('+F1+o.rAR+':'+F1+o.rAP+')';
  const fCHG='='+F1+o.rNWC+'-'+o.Y0+o.rNWC;
  /* the drivers, then the blue pass — identical in every route so the deltas are pure mechanics */
  const drivers=[
    {sel:o.CD+o.rDSO, keys:[...TX(String(o.dso)),ent,...TX(String(o.dio)),ent,...TX(String(o.dpo)),ent]},
    {sel:o.CD+o.rDPO, keys:[sU,sU,alt,K('h'),K('f'),K('c'),rt,rt,rt,rt,ent]},
  ];
`;

const ROUTES = {
  /* R1 — the ☆ route the demo takes: the whole first plan column typed, then ONE fill right. */
  star: `C => { ${HEAD}
    return [...drivers,
      {sel:F1+o.rAR, keys:[...TX(fAR),ent,...TX(fINV),ent,...TX(fAP),ent,...TX(fNWC),ent,...TX(fCHG),ent]},
      {keys:[cU,cU,sD,sD,sD,sD,sR,sR,sR,sR,ctrlR]},
      {keys:[cD,sR,sR,sR,sR,ctrlB,alt,K('h'),K('b'),K('p')]},
    ]; }`,
  /* R2 — THE CONTROL (§1.0-R2(i) skippability): the taught per-line route, ☆ dark. */
  perline: `C => { ${HEAD}
    return [...drivers,
      {sel:F1+o.rAR, keys:[
        ...TX(fAR), ent, up, sR,sR,sR,sR, ctrlR, dn,
        ...TX(fINV),ent, up, sR,sR,sR,sR, ctrlR, dn,
        ...TX(fAP), ent, up, sR,sR,sR,sR, ctrlR, dn,
        ...TX(fNWC),ent, up, sR,sR,sR,sR, ctrlR, dn,
        ...TX(fCHG),ent, up, sR,sR,sR,sR, ctrlR,
        ctrlB, alt,K('h'),K('b'),K('p')]},
    ]; }`,
  /* R3 — Ctrl+Enter multi-commit per line (S.multiEnter, `anchor`'s family), ☆ dark. */
  multienter: `C => { ${HEAD}
    const ce={key:'Enter',ctrl:true};
    return [...drivers,
      {sel:F1+o.rAR, keys:[
        sR,sR,sR,sR, ...TX(fAR), ce, dn,
        sR,sR,sR,sR, ...TX(fINV),ce, dn,
        sR,sR,sR,sR, ...TX(fAP), ce, dn,
        sR,sR,sR,sR, ...TX(fNWC),ce, dn,
        sR,sR,sR,sR, ...TX(fCHG),ce,
        ctrlB, alt,K('h'),K('b'),K('p')]},
    ]; }`,
  /* R4 — build the first plan column, then PASTE it across (`pastes`' family), ☆ dark. */
  pasteacross: `C => { ${HEAD}
    const cpy={key:'c',ctrl:true}, pst={key:'v',ctrl:true};
    return [...drivers,
      {sel:F1+o.rAR, keys:[...TX(fAR),ent,...TX(fINV),ent,...TX(fAP),ent,...TX(fNWC),ent,...TX(fCHG),ent]},
      {keys:[cU,cU,sD,sD,sD,sD,cpy,rt,sR,sR,sR,sD,sD,sD,sD,pst]},
      {sel:F1+o.rCHG, keys:[sR,sR,sR,sR,ctrlB,alt,K('h'),K('b'),K('p')]},
    ]; }`,
  /* R5 — the per-line control with the NWC line taken by autosum (S.autoSumN, `scrub`'s
     family) instead of a typed SUM: prices that one swap and nothing else. */
  autosum: `C => { ${HEAD}
    const asum={key:'=',alt:true,code:'Equal'};
    return [...drivers,
      {sel:F1+o.rAR, keys:[
        ...TX(fAR), ent, up, sR,sR,sR,sR, ctrlR, dn,
        ...TX(fINV),ent, up, sR,sR,sR,sR, ctrlR, dn,
        ...TX(fAP), ent, up, sR,sR,sR,sR, ctrlR, dn,
        asum, ent, sR,sR,sR,sR, ctrlR, dn]},
      /* Alt+= commits WITHOUT walking the cursor down (__asStay), so the change row is entered
         from its own park rather than by an arrow that would land a row short. */
      {sel:F1+o.rCHG, keys:[...TX(fCHG),ent, up, sR,sR,sR,sR, ctrlR,
        ctrlB, alt,K('h'),K('b'),K('p')]},
    ]; }`,
  /* R6 — the slowest legal route: no anchors, no fills, every cell of every line typed year by
     year, the blue pass one cell at a time. The §1.0(c) freedom floor and the clock's argument. */
  slow: `C => { ${HEAD}
    const mv=[
      {sel:o.CD+o.rDSO, keys:[...TX(String(o.dso)),ent,...TX(String(o.dio)),ent,...TX(String(o.dpo)),ent]},
      {sel:o.CD+o.rDSO, keys:[alt,K('h'),K('f'),K('c'),rt,rt,rt,rt,ent]},
      {sel:o.CD+o.rDIO, keys:[alt,K('h'),K('f'),K('c'),rt,rt,rt,rt,ent]},
      {sel:o.CD+o.rDPO, keys:[alt,K('h'),K('f'),K('c'),rt,rt,rt,rt,ent]},
    ];
    for(let i=1;i<6;i++){ const c=Y[i], p=Y[i-1];
      mv.push({sel:c+o.rAR, keys:[
        ...TX('='+c+o.rRev+'/365*'+o.CD+o.rDSO), ent,
        ...TX('='+c+o.rCog+'/365*'+o.CD+o.rDIO), ent,
        ...TX('=-'+c+o.rCog+'/365*'+o.CD+o.rDPO), ent,
        ...TX('='+c+o.rAR+'+'+c+o.rINV+'+'+c+o.rAP), ent,
        ...TX('='+c+o.rNWC+'-'+p+o.rNWC), ent,
        up, ctrlB, alt,K('h'),K('b'),K('p')]});
    }
    return mv; }`,
};

/* ── SECTION C: alternate doors that MUST clear (§1.0-R3(p)). Each is a full solve. */
const PROBES = {
  /* column-only anchors ($B5, not $B$5) — a right-fill needs nothing more, so it must clear */
  colAnchor: `C => { ${HEAD}
    const aAR ='='+F1+o.rRev+'/365*$'+o.CD+o.rDSO;
    const aINV='='+F1+o.rCog+'/365*$'+o.CD+o.rDIO;
    const aAP ='=-'+F1+o.rCog+'/365*$'+o.CD+o.rDPO;
    return [...drivers,
      {sel:F1+o.rAR, keys:[...TX(aAR),ent,...TX(aINV),ent,...TX(aAP),ent,...TX(fNWC),ent,...TX(fCHG),ent]},
      {keys:[cU,cU,sD,sD,sD,sD,sR,sR,sR,sR,ctrlR]},
      {keys:[cD,sR,sR,sR,sR,ctrlB,alt,K('h'),K('b'),K('p')]},
    ]; }`,
  /* ROUND(...,0) on every built line — the desk habit; the tolerance band exists for it */
  rounded: `C => { ${HEAD}
    const rAR ='=ROUND('+F1+o.rRev+'/365*$'+o.CD+'$'+o.rDSO+',0)';
    const rINV='=ROUND('+F1+o.rCog+'/365*$'+o.CD+'$'+o.rDIO+',0)';
    const rAP ='=-ROUND('+F1+o.rCog+'/365*$'+o.CD+'$'+o.rDPO+',0)';
    return [...drivers,
      {sel:F1+o.rAR, keys:[...TX(rAR),ent,...TX(rINV),ent,...TX(rAP),ent,...TX(fNWC),ent,...TX(fCHG),ent]},
      {keys:[cU,cU,sD,sD,sD,sD,sR,sR,sR,sR,ctrlR]},
      {keys:[cD,sR,sR,sR,sR,ctrlB,alt,K('h'),K('b'),K('p')]},
    ]; }`,
  /* an addition chain instead of SUM, the Cell Styles gallery for BOTH the blue pass (Input)
     and the dress (Total: bold + a rule above), and the ribbon fill door */
  gallery: `C => { ${HEAD}
    const chain='='+F1+o.rAR+'+'+F1+o.rINV+'+'+F1+o.rAP;
    return [
      {sel:o.CD+o.rDSO, keys:[...TX(String(o.dso)),ent,...TX(String(o.dio)),ent,...TX(String(o.dpo)),ent]},
      {sel:o.CD+o.rDPO, keys:[sU,sU,alt,K('h'),K('j'),rt,ent]},
      {sel:F1+o.rAR, keys:[...TX(fAR),ent,...TX(fINV),ent,...TX(fAP),ent,...TX(chain),ent,...TX(fCHG),ent]},
      {keys:[cU,cU,sD,sD,sD,sD,sR,sR,sR,sR,alt,K('h'),K('f'),K('i'),K('r')]},
      {keys:[cD,sR,sR,sR,sR,alt,K('h'),K('j'),rt,rt,rt,rt,ent]},
    ]; }`,
  /* Alt+= for the total, Alt H 1 for bold, Alt H B S (OUTSIDE border) for the rule — the three
     doors a strict `bt && !bb` reading would have locked out */
  outsideBox: `C => { ${HEAD}
    const asum={key:'=',alt:true,code:'Equal'};
    return [...drivers,
      {sel:F1+o.rAR, keys:[...TX(fAR),ent,...TX(fINV),ent,...TX(fAP),ent,asum,ent,dn,...TX(fCHG),ent]},
      {keys:[cU,cU,sD,sD,sD,sD,sR,sR,sR,sR,ctrlR]},
      {keys:[cD,sR,sR,sR,sR,alt,K('h'),{key:'1',code:'Digit1'},alt,K('h'),K('b'),K('s')]},
    ]; }`,
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
        loadChallenge('nwcsched');
        const C = CHALLENGES.nwcsched;
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
        loadChallenge('nwcsched');
        const C = CHALLENGES.nwcsched;
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
  const C0 = await page.evaluate(() => ({ par: CHALLENGES.nwcsched.par, parKeys: CHALLENGES.nwcsched.parKeys }));
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
    if (name === 'star' && !st) bad('the ☆ route did not earn the ☆');
    if (name !== 'star' && rs.some(r => r.star)) bad(name + ' earned the ☆ — §1.0-R2(i): it must be a distinct decision');
  }
  if (table.star && table.perline) {
    console.log('  spread (slowest legal ÷ ☆ route): ' + (table.slow / table.star).toFixed(2) + '×');
    console.log('  ☆ worth vs the taught control: ' + (table.perline - table.star) + ' keys');
    const nonFill = ['multienter', 'pasteacross', 'autosum'].map(n => table[n]).filter(Boolean);
    if (nonFill.length) console.log('  best non-fill family: ' + Math.min(...nonFill) + ' keys (☆ route ' + table.star + ')');
    if (table.perline <= table.star) bad('the ☆ route is not cheaper than the control — the CAMPAIGN §2 negative-value failure');
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

  /* ── D · BOARD ───────────────────────────────────────────────────────────────── */
  console.log('\nD · BOARD (§1.3 density · #### scan at load and at the win)');
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
      loadChallenge('nwcsched');
      const C = CHALLENGES.nwcsched;
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
  console.log('\n' + (fails ? 'VERIFY-NWCSCHED: ' + fails + ' FAILURE(S)' : 'VERIFY-NWCSCHED: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
